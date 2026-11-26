/* editor/wire-tool.js - maquina de estados da ferramenta de fio (Acionamentos v2, E4a). Pura: cada chamada devolve um estado novo.
 * Fases: idle -> start (terminal de origem) -> vertices* -> done (fio pronto ou pedido de divisao) | cancelled.
 * ctx: {comps, wires, defs, grid=20, tol=6 (snap de eixo), radius=12 (acerto de terminal, mundo), wireTol=8}.
 * Eventos de ponteiro: {type:'move'|'click'|'dblclick', x, y, radius?} em coordenadas de mundo.
 * Teclas: {key:'Escape'|'Enter'|' '}. Sem DOM. Nao e carregada por nenhuma pagina na E4a. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};
  var geom = EO.editor.geom || (typeof require === 'function' ? require('./geom.js') : null);

  function pt(p) { return { x: p.x, y: p.y }; }
  function copyState(st, patch) {
    var n = {};
    Object.keys(st).forEach(function (k) { n[k] = st[k]; });
    Object.keys(patch).forEach(function (k) { n[k] = patch[k]; });
    return n;
  }
  function gridOf(ctx) { return ctx.grid > 0 ? ctx.grid : geom.GRID; }

  function create(ctx) {
    return {
      ctx: ctx, phase: 'idle', from: null, pts: [], axis: 'h', cursor: null, target: null,
      livre: false, error: null, result: null
    };
  }

  /* o que esta sob (x,y): terminal > ponto de fio > livre. Para terminal e fio o ponto ja vem exato/encaixado. */
  function alvoEm(st, x, y, radius) {
    var ctx = st.ctx, r = radius || ctx.radius || 12;
    var t = geom.nearestTerminal(ctx.comps, ctx.defs, x, y, r);
    if (t) return { tipo: 'terminal', x: t.x, y: t.y, terminal: { comp: t.comp, port: t.port } };
    var h = geom.hitWire(ctx.wires, ctx.comps, ctx.defs, x, y, ctx.wireTol || 8);
    if (h) {
      var p = pt(h.point), g = gridOf(ctx), segs = geom.segmentsOf(h.wire, ctx.comps, ctx.defs), s = segs[h.segIndex];
      if (Math.abs(s.y1 - s.y2) < 1e-9) { p.x = Math.max(Math.min(s.x1, s.x2), Math.min(Math.max(s.x1, s.x2), Math.round(p.x / g) * g)); p.y = s.y1; }
      else if (Math.abs(s.x1 - s.x2) < 1e-9) { p.y = Math.max(Math.min(s.y1, s.y2), Math.min(Math.max(s.y1, s.y2), Math.round(p.y / g) * g)); p.x = s.x1; }
      return { tipo: 'fio', x: p.x, y: p.y, wire: h.wire, wireIdx: ctx.wires.indexOf(h.wire), segIndex: h.segIndex };
    }
    var eixos = st.from ? [{ x: st.from.x, y: st.from.y }] : [];
    var s2 = geom.snapVertex({ x: x, y: y }, gridOf(ctx), eixos, ctx.tol == null ? geom.SNAP_TOL : ctx.tol);
    return { tipo: 'livre', x: s2.x, y: s2.y };
  }

  function mesmaPorta(a, b) { return a.comp._uid === b.comp._uid && a.port === b.port; }
  function duplicado(ctx, a, b) {
    return ctx.wires.some(function (w) {
      return (mesmaPorta(w.from, a) && mesmaPorta(w.to, b)) || (mesmaPorta(w.from, b) && mesmaPorta(w.to, a));
    });
  }

  /* caminho: origem + vertices confirmados + L ate o ponto; simplify remove duplicados/colineares */
  function caminho(st, fim) {
    var last = st.pts.length ? st.pts[st.pts.length - 1] : st.from;
    var corner = geom.routeL(last, fim, st.axis);
    return geom.simplify([pt(st.from)].concat(st.pts, corner, [fim]));
  }

  function rej(st, erro) { return copyState(st, { error: erro }); }
  function cancelar(st) { return copyState(st, { phase: 'cancelled', error: null, result: null }); }

  function ponteiro(st, ev) {
    if (st.phase === 'done' || st.phase === 'cancelled') return st;
    var al = alvoEm(st, ev.x, ev.y, ev.radius);
    if (ev.type === 'move') {
      return copyState(st, { cursor: { x: al.x, y: al.y }, target: al.tipo, error: null });
    }
    if (ev.type === 'dblclick') {
      return (al.tipo === 'livre' && st.phase !== 'idle') ? cancelar(st) : st;
    }
    /* click */
    if (st.phase === 'idle') {
      if (al.tipo !== 'terminal') return rej(st, 'sem-terminal');
      return copyState(st, { phase: 'start', from: { comp: al.terminal.comp, port: al.terminal.port, x: al.x, y: al.y }, pts: [],
        cursor: { x: al.x, y: al.y }, target: 'terminal', livre: false, error: null });
    }
    if (al.tipo === 'livre') {
      var cam = caminho(st, { x: al.x, y: al.y });
      if (cam.length < 2) return rej(st, 'comprimento-zero');
      var last = st.pts.length ? st.pts[st.pts.length - 1] : st.from;
      if (last.x === al.x && last.y === al.y) return rej(st, 'comprimento-zero');
      return copyState(st, { phase: 'vertices', pts: cam.slice(1), livre: true, cursor: { x: al.x, y: al.y }, target: 'livre', error: null });
    }
    var origem = { comp: st.from.comp, port: st.from.port };
    if (al.tipo === 'terminal') {
      if (mesmaPorta(al.terminal, origem)) return rej(st, 'mesma-porta');
      if (duplicado(st.ctx, origem, al.terminal)) return rej(st, 'fio-duplicado');
      var c = caminho(st, { x: al.x, y: al.y });
      if (c.length < 2) return rej(st, 'comprimento-zero');
      return copyState(st, { phase: 'done', pts: c.slice(1, -1), cursor: { x: al.x, y: al.y }, error: null,
        result: { tipo: 'fio', from: origem, to: { comp: al.terminal.comp, port: al.terminal.port }, pts: c.slice(1, -1), auto: !st.livre } });
    }
    /* fim em ponto de fio: pedido de divisao */
    var w = al.wire;
    if (mesmaPorta(w.from, origem) || mesmaPorta(w.to, origem)) return rej(st, 'fio-duplicado');
    var c2 = caminho(st, { x: al.x, y: al.y });
    if (c2.length < 2) return rej(st, 'comprimento-zero');
    return copyState(st, { phase: 'done', pts: c2.slice(1, -1), cursor: { x: al.x, y: al.y }, error: null,
      result: { tipo: 'dividir', wireIdx: al.wireIdx, ponto: { x: al.x, y: al.y, segIndex: al.segIndex }, from: origem, pts: c2.slice(1, -1), auto: !st.livre } });
  }

  function tecla(st, ev) {
    if (st.phase === 'done' || st.phase === 'cancelled') return st;
    var k = ev.key;
    if (k === 'Escape') return cancelar(st);
    if (k === ' ' || k === 'Spacebar') return copyState(st, { axis: st.axis === 'h' ? 'v' : 'h' });
    if (k === 'Enter') {
      if (st.phase === 'idle') return st;
      var cur = st.cursor;
      if (!cur) return cancelar(st);
      var al = alvoEm(st, cur.x, cur.y);
      if (al.tipo === 'livre') return cancelar(st);
      return ponteiro(st, { type: 'click', x: cur.x, y: cur.y });
    }
    return st;
  }

  /* polilinha da previa: origem, vertices, L ate o cursor. valid=false quando o clique atual seria rejeitado */
  function preview(st) {
    if (st.phase === 'idle' || !st.from) return { phase: st.phase, points: [], cursor: st.cursor, target: st.target, axis: st.axis, valid: true, error: st.error };
    var cur = st.cursor || { x: st.from.x, y: st.from.y };
    var last = st.pts.length ? st.pts[st.pts.length - 1] : st.from;
    var points = [pt(st.from)].concat(st.pts, geom.routeL(last, cur, st.axis), [pt(cur)]);
    var valid = true, erro = st.error;
    if (st.target === 'terminal' && st.cursor) {
      var al = alvoEm(st, cur.x, cur.y);
      var o = { comp: st.from.comp, port: st.from.port };
      if (al.terminal && mesmaPorta(al.terminal, o)) { valid = false; erro = 'mesma-porta'; }
      else if (al.terminal && duplicado(st.ctx, o, al.terminal)) { valid = false; erro = 'fio-duplicado'; }
    }
    return { phase: st.phase, points: points, cursor: cur, target: st.target, axis: st.axis, valid: valid, error: erro };
  }

  function result(st) { return st.phase === 'done' ? st.result : null; }

  EO.editor.wireTool = { create: create, pointer: ponteiro, key: tecla, preview: preview, result: result };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.wireTool;
})(typeof window !== 'undefined' ? window : globalThis);
