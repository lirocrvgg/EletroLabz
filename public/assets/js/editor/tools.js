/* editor/tools.js - comandos puros do editor de diagramas (Acionamentos v2, E4a).
 * Opera sobre um estado {comps, wires, nextUid, defs, grid}; nenhuma funcao muta a entrada: devolve {state, changed, ...}.
 * Formato em memoria dos fios: {from:{comp,port}, to:{comp,port}, pts:[{x,y}], auto, energized, short} (comp = objeto do estado).
 * Toda operacao que cria objetos novos remapeia os fios para os componentes novos (por _uid).
 * Sem DOM, sem globais legadas. Nao e carregado por nenhuma pagina na E4a. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};
  var geom = EO.editor.geom || (typeof require === 'function' ? require('./geom.js') : null);

  var GRID_PADRAO = 20;

  function gridOf(state) { return (state && state.grid > 0) ? state.grid : GRID_PADRAO; }
  function snap(v, g) { var r = Math.round(v / g) * g; return r === 0 ? 0 : r; }
  /* centro de rotacao: ponto de (g/2)*Z com cx+cy e cy-cx multiplos de g (assim cantos e vertices na grade continuam na grade) */
  function centroRot(x, y, g) {
    var h = g / 2, a = { x: snap(x, g), y: snap(y, g) };
    var b = { x: Math.floor(x / g) * g + h, y: Math.floor(y / g) * g + h };
    return Math.hypot(x - a.x, y - a.y) <= Math.hypot(x - b.x, y - b.y) ? a : b;
  }
  function quarter(rot) { var q = Math.round((Number(rot) || 0) / 90) % 4; return q < 0 ? q + 4 : q; }
  function pt(p) { return { x: p.x, y: p.y }; }
  function ptsOf(w) { return Array.isArray(w.pts) ? w.pts : []; }
  function uidSet(uids) { var s = new Set(); (uids || []).forEach(function (u) { s.add(u); }); return s; }
  function mkState(state, comps, wires, nextUid) {
    return { comps: comps, wires: wires, nextUid: nextUid == null ? state.nextUid : nextUid, defs: state.defs, grid: state.grid };
  }
  function semMudanca(state, extra) {
    var r = { state: state, changed: false };
    if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
    return r;
  }
  function byUid(comps) { var m = new Map(); comps.forEach(function (c) { m.set(c._uid, c); }); return m; }

  /* copia o fio apontando para os componentes novos (por _uid); pts sempre copiado */
  function rewire(w, m, pts) {
    var n = Object.assign({}, w);
    n.from = { comp: m.get(w.from.comp._uid) || w.from.comp, port: w.from.port };
    n.to = { comp: m.get(w.to.comp._uid) || w.to.comp, port: w.to.port };
    n.pts = (pts || ptsOf(w)).map(pt);
    return n;
  }

  function axisOf(a, pts) {
    if (pts.length) {
      if (pts[0].y === a.y && pts[0].x !== a.x) return 'h';
      if (pts[0].x === a.x && pts[0].y !== a.y) return 'v';
    }
    return 'h';
  }
  function aligned(a, b) { return Math.abs(a.x - b.x) < 1e-9 || Math.abs(a.y - b.y) < 1e-9; }

  /* ajusta so o vertice vizinho de UMA ponta movida para manter os trechos ortogonais */
  function ajustaManual(oldA, newA, oldB, newB, pts, fm, tm) {
    var p = pts.map(pt);
    if (!p.length) {
      if (aligned(oldA, oldB) && !aligned(newA, newB)) return geom.routeL(newA, newB, 'h');
      return [];
    }
    if (fm) {
      if (oldA.y === p[0].y && oldA.x !== p[0].x) p[0].y = newA.y;
      else if (oldA.x === p[0].x && oldA.y !== p[0].y) p[0].x = newA.x;
    }
    if (tm) {
      var l = p.length - 1;
      if (oldB.y === p[l].y && oldB.x !== p[l].x) p[l].y = newB.y;
      else if (oldB.x === p[l].x && oldB.y !== p[l].y) p[l].x = newB.x;
    }
    return geom.simplify([newA].concat(p, [newB])).slice(1, -1);
  }

  /* refaz os fios depois que `moved` (Set de _uid) mudou de lugar. mapPts: transformacao exata dos vertices de fios cujas
   * duas pontas se movem juntas. Fios auto de uma ponta so sao re-roteados com routeL. */
  function fixWires(state, newComps, moved, mapPts) {
    var m = byUid(newComps), defs = state.defs;
    return state.wires.map(function (w) {
      var fm = moved.has(w.from.comp._uid), tm = moved.has(w.to.comp._uid);
      if (!fm && !tm) return rewire(w, m);
      var nf = m.get(w.from.comp._uid) || w.from.comp, nt = m.get(w.to.comp._uid) || w.to.comp;
      var pts = ptsOf(w);
      if (fm && tm) return rewire(w, m, pts.map(mapPts));
      var oldA = geom.portWorld(w.from.comp, w.from.port, defs), oldB = geom.portWorld(w.to.comp, w.to.port, defs);
      var newA = geom.portWorld(nf, w.from.port, defs), newB = geom.portWorld(nt, w.to.port, defs);
      var np;
      if (w.auto) np = geom.routeL(newA, newB, axisOf(oldA, pts));
      else np = ajustaManual(oldA, newA, oldB, newB, pts, fm, tm);
      return rewire(w, m, np);
    });
  }

  function selBox(comps, set) {
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    comps.forEach(function (c) {
      if (!set.has(c._uid)) return;
      var b = geom.bbox(c);
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x2); y2 = Math.max(y2, b.y2);
    });
    return x1 === Infinity ? null : { x1: x1, y1: y1, x2: x2, y2: y2 };
  }

  /* ---------------- place ---------------- */
  /* opts: {rot, flip, id, label, nextId(sym, state) -> string, uid}. Padrao D19: protecoes nascem com fault:false. */
  function place(state, sym, x, y, opts) {
    opts = opts || {};
    var def = state.defs && state.defs[sym];
    if (!def) return semMudanca(state, { comp: null });
    var g = gridOf(state);
    var uid = state.nextUid;
    var id = opts.id;
    if (id == null || id === '') id = typeof opts.nextId === 'function' ? opts.nextId(sym, state) : null;
    if (id == null || id === '') id = sym + '_' + uid;
    var c = {
      id: id, label: opts.label || def.name, sym: sym,
      x: snap(x, g), y: snap(y, g), w: def.w * g, h: def.h * g,
      rot: quarter(opts.rot) * 90, flip: opts.flip === true,
      energized: false, fault: false, color: 'green', time: 3,
      timerMode: def.timerMode || (def.type === 'timer_contact' ? 'onDelay' : ''),
      forceState: '', _uid: uid, _pressed: false, _selected: false, _actuated: false,
      _timerDone: false, _tAcc: 0, _offDelayActive: false, __prevCoilOn: false
    };
    if (def.type === 'pushbutton_latch') c._latched = false;
    if (sym === 'contact_timer_off' || sym === 'contact_nc_temp') c.timerMode = 'offDelay';
    if (sym === 'contact_timer_on' || sym === 'contact_no_temp') c.timerMode = 'onDelay';
    var comps = state.comps.concat([c]);
    var m = byUid(comps);
    return { state: mkState(state, comps, state.wires.map(function (w) { return rewire(w, m); }), uid + 1), changed: true, comp: c, uids: [uid] };
  }

  /* ---------------- moveBy ---------------- */
  /* O deslocamento e arredondado a grade (dx, dy em px). */
  function moveBy(state, uids, dx, dy) {
    var g = gridOf(state), set = uidSet(uids);
    var sx = snap(dx || 0, g), sy = snap(dy || 0, g);
    if ((sx === 0 && sy === 0) || !state.comps.some(function (c) { return set.has(c._uid); })) return semMudanca(state);
    var comps = state.comps.map(function (c) {
      if (!set.has(c._uid)) return c;
      var n = Object.assign({}, c); n.x = c.x + sx; n.y = c.y + sy; return n;
    });
    var wires = fixWires(state, comps, set, function (p) { return { x: p.x + sx, y: p.y + sy }; });
    return { state: mkState(state, comps, wires), changed: true, dx: sx, dy: sy };
  }

  /* ---------------- rotate / mirror ---------------- */
  /* sentido: 1 | 'horario' | 'cw' (horario); -1 | 'anti' | 'anti-horario' | 'ccw' (anti-horario). Centro da selecao com snap. */
  function rotate(state, uids, sentido) {
    var set = uidSet(uids), g = gridOf(state), box = selBox(state.comps, set);
    if (!box) return semMudanca(state);
    var cw = !(sentido === -1 || sentido === 'anti' || sentido === 'anti-horario' || sentido === 'ccw');
    var cc = centroRot((box.x1 + box.x2) / 2, (box.y1 + box.y2) / 2, g), cx = cc.x, cy = cc.y;
    var comps = state.comps.map(function (c) {
      if (!set.has(c._uid)) return c;
      var b = geom.bbox(c), n = Object.assign({}, c);
      if (cw) { n.x = cx - (b.y2 - cy); n.y = cy + (b.x - cx); } else { n.x = cx + (b.y - cy); n.y = cy - (b.x2 - cx); }
      n.rot = ((quarter(c.rot) + (cw ? 1 : 3)) % 4) * 90;
      n.flip = c.flip === true;
      if (n.x === 0) n.x = 0;
      if (n.y === 0) n.y = 0;
      return n;
    });
    var wires = fixWires(state, comps, set, function (p) {
      var r = cw ? { x: cx - (p.y - cy), y: cy + (p.x - cx) } : { x: cx + (p.y - cy), y: cy - (p.x - cx) };
      return { x: r.x === 0 ? 0 : r.x, y: r.y === 0 ? 0 : r.y };
    });
    return { state: mkState(state, comps, wires), changed: true };
  }

  /* espelho horizontal (x -> -x) em torno do centro da selecao: flip alterna e rot -> -rot (M.R(r).F = R(-r).F^+1) */
  function mirror(state, uids) {
    var set = uidSet(uids), g = gridOf(state), box = selBox(state.comps, set);
    if (!box) return semMudanca(state);
    var cx = snap((box.x1 + box.x2) / 2, g / 2);
    var comps = state.comps.map(function (c) {
      if (!set.has(c._uid)) return c;
      var b = geom.bbox(c), n = Object.assign({}, c);
      n.x = 2 * cx - b.x2;
      if (n.x === 0) n.x = 0;
      n.rot = ((4 - quarter(c.rot)) % 4) * 90;
      n.flip = !(c.flip === true);
      return n;
    });
    var wires = fixWires(state, comps, set, function (p) { var x = 2 * cx - p.x; return { x: x === 0 ? 0 : x, y: p.y }; });
    return { state: mkState(state, comps, wires), changed: true };
  }

  /* ---------------- copy / paste / duplicate ---------------- */
  var TRANSIENTES = { energized: false, _pressed: false, _selected: false };

  function copy(state, uids) {
    var set = uidSet(uids), comps = [], x0 = Infinity, y0 = Infinity;
    state.comps.forEach(function (c) {
      if (!set.has(c._uid)) return;
      var n = Object.assign({}, c, TRANSIENTES);
      comps.push(n);
      x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y);
    });
    var wires = [];
    state.wires.forEach(function (w) {
      if (!set.has(w.from.comp._uid) || !set.has(w.to.comp._uid)) return;
      var n = { fromUid: w.from.comp._uid, fromPort: w.from.port, toUid: w.to.comp._uid, toPort: w.to.port, pts: ptsOf(w).map(pt) };
      if (w.auto !== undefined) n.auto = w.auto;
      wires.push(n);
    });
    return { comps: comps, wires: wires, origem: comps.length ? { x: x0, y: y0 } : null };
  }

  function paste(state, clip, dx, dy) {
    if (!clip || !Array.isArray(clip.comps) || !clip.comps.length) return semMudanca(state, { uids: [] });
    var g = gridOf(state), sx = snap(dx || 0, g), sy = snap(dy || 0, g);
    var next = state.nextUid, map = new Map(), novos = [], uids = [];
    clip.comps.forEach(function (c) {
      var n = Object.assign({}, c, TRANSIENTES);
      n._uid = next++;
      n.x = c.x + sx; n.y = c.y + sy;
      map.set(c._uid, n);
      novos.push(n); uids.push(n._uid);
    });
    var comps = state.comps.concat(novos), m = byUid(comps);
    var wires = state.wires.map(function (w) { return rewire(w, m); });
    (clip.wires || []).forEach(function (w) {
      var a = map.get(w.fromUid), b = map.get(w.toUid);
      if (!a || !b) return;
      var n = { from: { comp: a, port: w.fromPort }, to: { comp: b, port: w.toPort }, energized: false,
        pts: (w.pts || []).map(function (p) { return { x: p.x + sx, y: p.y + sy }; }) };
      if (w.auto !== undefined) n.auto = w.auto;
      wires.push(n);
    });
    return { state: mkState(state, comps, wires, next), changed: true, uids: uids, comps: novos };
  }

  function duplicate(state, uids, dx, dy) {
    var g = gridOf(state);
    return paste(state, copy(state, uids), dx == null ? g : dx, dy == null ? g : dy);
  }

  /* ---------------- remove ---------------- */
  function remove(state, uids) {
    var set = uidSet(uids);
    if (!state.comps.some(function (c) { return set.has(c._uid); })) return semMudanca(state);
    var comps = state.comps.filter(function (c) { return !set.has(c._uid); });
    var m = byUid(comps);
    var wires = state.wires.filter(function (w) { return !set.has(w.from.comp._uid) && !set.has(w.to.comp._uid); })
      .map(function (w) { return rewire(w, m); });
    return { state: mkState(state, comps, wires), changed: true, wiresRemoved: state.wires.length - wires.length };
  }

  /* remove fios por indice (selecao de fio) */
  function removeWires(state, idxs) {
    var set = uidSet(idxs);
    var wires = state.wires.filter(function (w, i) { return !set.has(i); });
    if (wires.length === state.wires.length) return semMudanca(state);
    var m = byUid(state.comps);
    return { state: mkState(state, state.comps, wires.map(function (w) { return rewire(w, m); })), changed: true };
  }

  /* ---------------- splitWire ---------------- */
  /* Divide o fio wireIdx no ponto (ponto.segIndex opcional; senao, o trecho mais proximo) e insere uma junction centrada nele.
   * Os vertices sao repartidos entre as duas metades; as metades nao sao auto (a forma e preservada). */
  function splitWire(state, wireIdx, ponto) {
    var w = state.wires[wireIdx], def = state.defs && state.defs.junction;
    if (!w || !def || !ponto) return semMudanca(state, { junction: null });
    var g = gridOf(state);
    var segs = geom.segmentsOf(w, state.comps, state.defs), si = ponto.segIndex, best = Infinity;
    if (si == null) {
      segs.forEach(function (s, i) {
        var dx = s.x2 - s.x1, dy = s.y2 - s.y1, l2 = dx * dx + dy * dy;
        var t = l2 > 1e-9 ? Math.max(0, Math.min(1, ((ponto.x - s.x1) * dx + (ponto.y - s.y1) * dy) / l2)) : 0;
        var d = Math.hypot(ponto.x - (s.x1 + t * dx), ponto.y - (s.y1 + t * dy));
        if (d < best) { best = d; si = i; }
      });
    }
    var pts = ptsOf(w);
    var antes = pts.slice(0, si).filter(function (p) { return p.x !== ponto.x || p.y !== ponto.y; }).map(pt);
    var depois = pts.slice(si).filter(function (p) { return p.x !== ponto.x || p.y !== ponto.y; }).map(pt);
    var uid = state.nextUid, jw = def.w * g, jh = def.h * g, port = def.ports[0];
    var j = {
      id: '', label: def.name, sym: 'junction', x: ponto.x - jw * port.x, y: ponto.y - jh * port.y, w: jw, h: jh,
      rot: 0, flip: false, energized: false, fault: false, color: 'green', time: 3, timerMode: '', forceState: '',
      _uid: uid, _pressed: false, _selected: false, _actuated: false, _timerDone: false, _tAcc: 0, _offDelayActive: false, __prevCoilOn: false
    };
    var comps = state.comps.concat([j]), m = byUid(comps);
    var w1 = rewire(w, m, antes), w2 = rewire(w, m, depois);
    w1.to = { comp: j, port: 0 }; w2.from = { comp: j, port: 0 };
    w1.auto = false; w2.auto = false;
    var wires = [];
    state.wires.forEach(function (x, i) {
      if (i === wireIdx) { wires.push(w1, w2); } else wires.push(rewire(x, m));
    });
    return { state: mkState(state, comps, wires, uid + 1), changed: true, junction: j, wireIdxs: [wireIdx, wireIdx + 1] };
  }

  EO.editor.tools = {
    place: place, moveBy: moveBy, rotate: rotate, mirror: mirror, copy: copy, paste: paste, duplicate: duplicate,
    remove: remove, removeWires: removeWires, splitWire: splitWire
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.tools;
})(typeof window !== 'undefined' ? window : globalThis);
