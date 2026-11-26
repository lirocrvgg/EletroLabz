/* editor/input.js - tradutor de entrada (mouse, toque, teclado) para comandos do editor (Acionamentos v2, E4a).
 * Sem DOM: recebe eventos normalizados (ou falsos nos testes) e um adaptador injetado.
 *
 * Adaptador (A): obrigatorios  toWorld(clientX, clientY) -> {x,y};  hit(x, y, {radius, pointerType}) -> {tipo:'terminal'|'comp'|'fio'|'vazio', comp?, uid?, wire?};
 *                              emit(cmd)
 *                opcionais     zoom() (1), grid() (20), tool() ('select'|'wire'|'place'|'sim'; 'select'), selection() ([] de _uid),
 *                              isActive() (true), inputFocused(ev) (false; padrao: ev.target e INPUT/TEXTAREA/SELECT/contentEditable),
 *                              terminals() -> [{uid, port, x, y}] (fio pelo teclado).
 * Opcoes: {clock:{setTimeout, clearTimeout}, longPressMs:500, touchSlop:6, mouseSlop:3, touchRadius:22, mouseRadius:12}.
 *
 * Comandos emitidos (campo tipo):
 *   selecionar{uid,aditivo} selecionarFio{wire,aditivo} limparSelecao inserir{x,y} simClique{uid,x,y}
 *   fioPonto{x,y,raio} fioMover{x,y,raio} fioDuploClique{x,y,raio} fioTecla{key} fioIniciar/fioConcluir{terminal,x,y} cancelarFio
 *   arrastar{fase:'inicio'|'mover'|'fim'|'cancelar',uids,dx,dy}  (dx/dy ACUMULADOS desde o inicio, em px de mundo)
 *   areaSelecao{fase,x1,y1,x2,y2,aditivo}  pan{dx,dy} (px de tela, incremental)  zoom{fator,cx,cy} (cx/cy em px de tela)
 *   abrirBarraSelecao{x,y,uid}  cursor{x,y}  focar{sentido}  mover{uids,dx,dy}  girar{uids,sentido}  espelhar{uids}
 *   copiar{uids} colar recortar{uids} duplicar{uids} apagar{uids} selecionarTudo desfazer refazer
 *   sairFerramenta ferramenta{ferramenta:'fio'|'selecao'} terminalFoco{terminal,indice}
 * preventDefault so e chamado quando o adaptador diz que o diagrama esta ativo e o foco nao esta em campo de texto. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};

  function create(A, opts) {
    opts = opts || {};
    var clock = opts.clock || {
      setTimeout: function (f, ms) { return root.setTimeout(f, ms); },
      clearTimeout: function (id) { return root.clearTimeout(id); }
    };
    var LONG_MS = opts.longPressMs || 500, TOUCH_SLOP = opts.touchSlop || 6, MOUSE_SLOP = opts.mouseSlop || 3;
    var TOUCH_R = opts.touchRadius || 22, MOUSE_R = opts.mouseRadius || 12;

    var pointers = new Map();
    var gesture = null;
    var timer = null;
    var kbIdx = -1, kbWire = false;

    function emit(cmd) { A.emit(cmd); }
    function zoom() { var z = A.zoom ? A.zoom() : 1; return z > 0 ? z : 1; }
    function grid() { return A.grid ? A.grid() : 20; }
    function tool() { return A.tool ? A.tool() : 'select'; }
    function selection() { return A.selection ? (A.selection() || []).slice() : []; }
    function ativo() { return A.isActive ? !!A.isActive() : true; }
    function emCampo(ev) {
      if (A.inputFocused) return !!A.inputFocused(ev);
      var t = ev && ev.target, n = t && t.tagName;
      return !!(t && (n === 'INPUT' || n === 'TEXTAREA' || n === 'SELECT' || t.isContentEditable));
    }
    function podeAgir(ev) { return ativo() && !emCampo(ev); }
    function prevent(ev) { if (ev && typeof ev.preventDefault === 'function') ev.preventDefault(); }
    function limpaTimer() { if (timer != null) { clock.clearTimeout(timer); timer = null; } }
    function raioPara(tipo) { return (tipo === 'touch' ? TOUCH_R : MOUSE_R) / zoom(); }
    function mundo(cx, cy) { return A.toWorld(cx, cy); }
    function hitAt(w, tipo) { return A.hit(w.x, w.y, { radius: raioPara(tipo), pointerType: tipo }) || { tipo: 'vazio' }; }
    function uidDe(h) { return h && (h.uid != null ? h.uid : (h.comp ? h.comp._uid : null)); }
    function compHit(h) { return h && h.tipo !== 'fio' && h.tipo !== 'vazio' && uidDe(h) != null; }

    /* ---------- clique ---------- */
    function clique(ev, h, w) {
      var t = tool(), tipo = ev.pointerType === 'touch' ? 'touch' : 'mouse';
      if (t === 'wire') { emit({ tipo: 'fioPonto', x: w.x, y: w.y, raio: raioPara(tipo) }); return; }
      if (t === 'place') { emit({ tipo: 'inserir', x: w.x, y: w.y }); return; }
      if (t === 'sim') { emit({ tipo: 'simClique', uid: compHit(h) ? uidDe(h) : null, x: w.x, y: w.y }); return; }
      if (compHit(h)) emit({ tipo: 'selecionar', uid: uidDe(h), aditivo: !!ev.shiftKey });
      else if (h.tipo === 'fio') emit({ tipo: 'selecionarFio', wire: h.wire, aditivo: !!ev.shiftKey });
      else if (!ev.shiftKey) emit({ tipo: 'limparSelecao' });
    }

    /* ---------- ponteiro ---------- */
    function pointerDown(ev) {
      if (!ativo()) return false;
      var tipo = ev.pointerType === 'touch' ? 'touch' : 'mouse';
      pointers.set(ev.pointerId, { id: ev.pointerId, tipo: tipo, cx: ev.clientX, cy: ev.clientY });
      if (podeAgir(ev)) prevent(ev);
      if (tipo === 'touch') {
        if (pointers.size >= 2) {
          limpaTimer();
          if (gesture && gesture.mode === 'move') emit({ tipo: 'arrastar', fase: 'cancelar', uids: gesture.uids, dx: 0, dy: 0 });
          if (gesture && gesture.mode === 'area') emit({ tipo: 'areaSelecao', fase: 'cancelar', x1: 0, y1: 0, x2: 0, y2: 0, aditivo: false });
          var ps = Array.from(pointers.values()).slice(0, 2);
          gesture = { mode: 'pinch', ids: [ps[0].id, ps[1].id], d: dist(ps[0], ps[1]), c: centro(ps[0], ps[1]) };
          return true;
        }
      } else {
        if (ev.button === 1 || (ev.button === 0 && ev.altKey)) { gesture = { mode: 'pan', id: ev.pointerId, lx: ev.clientX, ly: ev.clientY }; return true; }
        if (ev.button !== 0) return false;
      }
      var w = mundo(ev.clientX, ev.clientY), h = hitAt(w, tipo);
      gesture = { mode: 'pending', id: ev.pointerId, tipo: tipo, sx: ev.clientX, sy: ev.clientY, lx: ev.clientX, ly: ev.clientY,
        w0: w, hit: h, shift: !!ev.shiftKey, ev: ev };
      if (tipo === 'touch') {
        var g = gesture;
        limpaTimer();
        timer = clock.setTimeout(function () {
          timer = null;
          if (gesture !== g || g.mode !== 'pending') return;
          g.mode = 'longpress';
          var u = compHit(g.hit) ? uidDe(g.hit) : null;
          if (u != null && selection().indexOf(u) < 0) emit({ tipo: 'selecionar', uid: u, aditivo: false });
          emit({ tipo: 'abrirBarraSelecao', x: g.sx, y: g.sy, uid: u });
        }, LONG_MS);
      }
      return true;
    }

    function dist(a, b) { return Math.hypot(a.cx - b.cx, a.cy - b.cy); }
    function centro(a, b) { return { x: (a.cx + b.cx) / 2, y: (a.cy + b.cy) / 2 }; }

    function pointerMove(ev) {
      if (!ativo()) return false;
      var p = pointers.get(ev.pointerId);
      if (p) { p.cx = ev.clientX; p.cy = ev.clientY; }
      var g = gesture;
      if (!g) {
        if (ev.pointerType !== 'touch') {
          var w0 = mundo(ev.clientX, ev.clientY);
          if (tool() === 'wire') emit({ tipo: 'fioMover', x: w0.x, y: w0.y, raio: raioPara('mouse') });
          else emit({ tipo: 'cursor', x: w0.x, y: w0.y });
        }
        return false;
      }
      if (g.mode === 'pinch') {
        var a = pointers.get(g.ids[0]), b = pointers.get(g.ids[1]);
        if (!a || !b) return true;
        var d = dist(a, b), c = centro(a, b);
        if (g.d > 0 && d > 0 && d !== g.d) emit({ tipo: 'zoom', fator: d / g.d, cx: c.x, cy: c.y });
        if (c.x !== g.c.x || c.y !== g.c.y) emit({ tipo: 'pan', dx: c.x - g.c.x, dy: c.y - g.c.y });
        g.d = d; g.c = c;
        return true;
      }
      if (ev.pointerId !== g.id) return false;
      if (g.mode === 'pan') {
        emit({ tipo: 'pan', dx: ev.clientX - g.lx, dy: ev.clientY - g.ly });
        g.lx = ev.clientX; g.ly = ev.clientY;
        return true;
      }
      if (g.mode === 'pending') {
        var slop = g.tipo === 'touch' ? TOUCH_SLOP : MOUSE_SLOP;
        if (Math.hypot(ev.clientX - g.sx, ev.clientY - g.sy) <= slop) return true;
        limpaTimer();
        var t = tool();
        if (t === 'select' && compHit(g.hit)) {
          var u = uidDe(g.hit), sel = selection(), uids;
          if (sel.indexOf(u) >= 0) uids = sel;
          else {
            emit({ tipo: 'selecionar', uid: u, aditivo: g.shift });
            uids = g.shift ? sel.concat([u]) : [u];
          }
          g.mode = 'move'; g.uids = uids;
          emit({ tipo: 'arrastar', fase: 'inicio', uids: uids, dx: 0, dy: 0 });
        } else if (g.tipo === 'touch') {
          g.mode = 'pan';
          emit({ tipo: 'pan', dx: ev.clientX - g.lx, dy: ev.clientY - g.ly });
          g.lx = ev.clientX; g.ly = ev.clientY;
          return true;
        } else if (t === 'select') {
          g.mode = 'area';
          emit({ tipo: 'areaSelecao', fase: 'inicio', x1: g.w0.x, y1: g.w0.y, x2: g.w0.x, y2: g.w0.y, aditivo: g.shift });
        } else { g.mode = 'nenhum'; return true; }
      }
      var w = mundo(ev.clientX, ev.clientY);
      if (g.mode === 'move') emit({ tipo: 'arrastar', fase: 'mover', uids: g.uids, dx: w.x - g.w0.x, dy: w.y - g.w0.y });
      else if (g.mode === 'area') emit({ tipo: 'areaSelecao', fase: 'mover', x1: g.w0.x, y1: g.w0.y, x2: w.x, y2: w.y, aditivo: g.shift });
      return true;
    }

    function fimGesto(ev, cancelado) {
      var g = gesture;
      pointers.delete(ev.pointerId);
      if (!g) return false;
      if (g.mode === 'pinch') {
        if (g.ids.indexOf(ev.pointerId) >= 0) gesture = { mode: 'consumido' };
        if (!pointers.size) gesture = null;
        return true;
      }
      if (g.mode === 'consumido') { if (!pointers.size) gesture = null; return true; }
      if (ev.pointerId !== g.id) return false;
      limpaTimer();
      gesture = null;
      var w = mundo(ev.clientX, ev.clientY);
      if (g.mode === 'pending') { if (!cancelado) clique(g.ev, g.hit, g.w0); }
      else if (g.mode === 'move') emit({ tipo: 'arrastar', fase: cancelado ? 'cancelar' : 'fim', uids: g.uids, dx: w.x - g.w0.x, dy: w.y - g.w0.y });
      else if (g.mode === 'area') emit({ tipo: 'areaSelecao', fase: cancelado ? 'cancelar' : 'fim', x1: g.w0.x, y1: g.w0.y, x2: w.x, y2: w.y, aditivo: g.shift });
      return true;
    }
    function pointerUp(ev) { return fimGesto(ev, false); }
    function pointerCancel(ev) { return fimGesto(ev, true); }

    function wheel(ev) {
      if (!ativo()) return false;
      if (podeAgir(ev)) prevent(ev);
      if (ev.ctrlKey || ev.metaKey) emit({ tipo: 'zoom', fator: ev.deltaY < 0 ? 1.1 : 1 / 1.1, cx: ev.clientX, cy: ev.clientY });
      else emit({ tipo: 'pan', dx: -(ev.deltaX || 0), dy: -(ev.deltaY || 0) });
      return true;
    }

    function dblclick(ev) {
      if (!ativo() || tool() !== 'wire') return false;
      var w = mundo(ev.clientX, ev.clientY);
      emit({ tipo: 'fioDuploClique', x: w.x, y: w.y, raio: raioPara(ev.pointerType === 'touch' ? 'touch' : 'mouse') });
      return true;
    }

    /* ---------- teclado ---------- */
    function keyDown(ev) {
      if (!podeAgir(ev)) return false;
      var k = ev.key, kl = typeof k === 'string' ? k.toLowerCase() : '', mod = !!(ev.ctrlKey || ev.metaKey), sh = !!ev.shiftKey;
      var sel = selection(), g = grid(), ok = false;
      function cmd(c) { emit(c); ok = true; }
      function comSel(c) { if (sel.length) { c.uids = sel; cmd(c); } }

      if (mod) {
        if (kl === 'c') comSel({ tipo: 'copiar' });
        else if (kl === 'x') comSel({ tipo: 'recortar' });
        else if (kl === 'd') comSel({ tipo: 'duplicar' });
        else if (kl === 'v') cmd({ tipo: 'colar' });
        else if (kl === 'a') cmd({ tipo: 'selecionarTudo' });
        else if (kl === 'z') cmd({ tipo: sh ? 'refazer' : 'desfazer' });
        else if (kl === 'y') cmd({ tipo: 'refazer' });
      } else if (k === ']') cmd({ tipo: 'focar', sentido: 1 });
      else if (k === '[') cmd({ tipo: 'focar', sentido: -1 });
      else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
        var n = (sh ? 5 : 1) * g;
        comSel({ tipo: 'mover', dx: k === 'ArrowLeft' ? -n : k === 'ArrowRight' ? n : 0, dy: k === 'ArrowUp' ? -n : k === 'ArrowDown' ? n : 0 });
      } else if (kl === 'r' && !ev.altKey) comSel({ tipo: 'girar', sentido: sh ? -1 : 1 });
      else if (kl === 'm' && !ev.altKey) comSel({ tipo: 'espelhar' });
      else if (k === 'Delete' || k === 'Backspace') comSel({ tipo: 'apagar' });
      else if (k === 'Escape') {
        if (kbWire) { kbWire = false; cmd({ tipo: 'cancelarFio' }); }
        else cmd({ tipo: 'sairFerramenta' });
        kbIdx = -1;
      } else if (kl === 'w') cmd({ tipo: 'ferramenta', ferramenta: 'fio' });
      else if (kl === 'v') cmd({ tipo: 'ferramenta', ferramenta: 'selecao' });
      else if (kl === 't') {
        var ts = A.terminals ? A.terminals() : [];
        if (ts && ts.length) {
          kbIdx = kbIdx < 0 ? (sh ? ts.length - 1 : 0) : (kbIdx + (sh ? -1 : 1) + ts.length) % ts.length;
          cmd({ tipo: 'terminalFoco', terminal: ts[kbIdx], indice: kbIdx });
        }
      } else if (k === 'Enter') {
        var tl = A.terminals ? A.terminals() : [];
        if (kbIdx >= 0 && tl && tl[kbIdx]) {
          var term = tl[kbIdx];
          cmd({ tipo: kbWire ? 'fioConcluir' : 'fioIniciar', terminal: term, x: term.x, y: term.y });
          kbWire = !kbWire;
        } else if (tool() === 'wire') cmd({ tipo: 'fioTecla', key: 'Enter' });
      } else if ((k === ' ' || k === 'Spacebar') && (tool() === 'wire' || kbWire)) cmd({ tipo: 'fioTecla', key: ' ' });

      if (ok) prevent(ev);
      return ok;
    }

    function reset() { limpaTimer(); pointers.clear(); gesture = null; kbIdx = -1; kbWire = false; }

    return {
      pointerDown: pointerDown, pointerMove: pointerMove, pointerUp: pointerUp, pointerCancel: pointerCancel,
      wheel: wheel, dblclick: dblclick, keyDown: keyDown, reset: reset,
      state: function () { return { gesto: gesture ? gesture.mode : null, ponteiros: pointers.size, fioTeclado: kbWire, terminalFoco: kbIdx }; }
    };
  }

  EO.editor.input = { create: create };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.input;
})(typeof window !== 'undefined' ? window : globalThis);
