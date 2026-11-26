/* editor/history.js - pilha de desfazer/refazer do editor (Acionamentos v2, E4a). Puro.
 * Snapshot = formato de cloneDiagramForHistory estendido: {comps, wires:[{fromUid,fromPort,toUid,toPort,pts,auto}], compIdCounter}.
 * Semantica igual a atual: o TOPO da pilha e o estado atual (push depois de cada edicao); o primeiro undo ja volta
 * (precisa de >= 2 entradas); push limpa o refazer; o limite descarta as entradas mais antigas.
 * clone/restore levam rot, flip, seq, _latched (e todos os demais campos escalares do componente). Sem DOM. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};

  var MAX_PADRAO = 80;

  function escalar(v) { return v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === undefined; }

  /* state {comps, wires, nextUid} -> snapshot independente (energized/_pressed zerados, como no legado) */
  function clone(state) {
    var comps = state.comps.map(function (c) {
      var n = {};
      Object.keys(c).forEach(function (k) { if (escalar(c[k])) n[k] = c[k]; });
      n.energized = false; n._pressed = false;
      return n;
    });
    var wires = state.wires.map(function (w) {
      var n = { fromUid: w.from.comp._uid, fromPort: w.from.port, toUid: w.to.comp._uid, toPort: w.to.port,
        pts: (Array.isArray(w.pts) ? w.pts : []).map(function (p) { return { x: p.x, y: p.y }; }) };
      if (w.auto !== undefined) n.auto = w.auto;
      return n;
    });
    return { comps: comps, wires: wires, compIdCounter: state.nextUid };
  }

  /* snapshot -> {comps, wires, nextUid} novo (nao compartilha objetos com o snapshot). defs/grid opcionais preenchem w/h/timerMode. */
  function restore(snap, defs, grid) {
    var g = grid > 0 ? grid : 20, map = new Map();
    var comps = snap.comps.map(function (raw) {
      var def = defs && defs[raw.sym];
      var c = Object.assign({}, raw);
      if (c.w == null && def) c.w = def.w * g;
      if (c.h == null && def) c.h = def.h * g;
      if (c.timerMode == null && def) c.timerMode = def.timerMode;
      if (c.rot == null) c.rot = 0;
      if (c.flip == null) c.flip = false;
      map.set(c._uid, c);
      return c;
    });
    var wires = [];
    snap.wires.forEach(function (w) {
      var a = map.get(w.fromUid), b = map.get(w.toUid);
      if (!a || !b) return;
      var n = { from: { comp: a, port: w.fromPort }, to: { comp: b, port: w.toPort }, energized: false,
        pts: (Array.isArray(w.pts) ? w.pts : []).map(function (p) { return { x: p.x, y: p.y }; }) };
      if (w.auto !== undefined) n.auto = w.auto;
      wires.push(n);
    });
    return { comps: comps, wires: wires, nextUid: snap.compIdCounter };
  }

  /* opts: {max, defs, grid, clone, restore} (clone/restore injetaveis para o integrador) */
  function create(opts) {
    opts = opts || {};
    var max = opts.max > 0 ? opts.max : MAX_PADRAO;
    var doClone = opts.clone || clone;
    var doRestore = opts.restore || function (s) { return restore(s, opts.defs, opts.grid); };
    var undoStack = [], redoStack = [];
    return {
      push: function (state) {
        undoStack.push(doClone(state));
        if (undoStack.length > max) undoStack.shift();
        redoStack = [];
      },
      undo: function () {
        if (undoStack.length < 2) return null;
        redoStack.push(undoStack.pop());
        return doRestore(undoStack[undoStack.length - 1]);
      },
      redo: function () {
        if (!redoStack.length) return null;
        var s = redoStack.pop();
        undoStack.push(s);
        return doRestore(s);
      },
      canUndo: function () { return undoStack.length >= 2; },
      canRedo: function () { return redoStack.length > 0; },
      clear: function () { undoStack = []; redoStack = []; },
      size: function () { return undoStack.length; },
      redoSize: function () { return redoStack.length; }
    };
  }

  EO.editor.history = { MAX_PADRAO: MAX_PADRAO, create: create, clone: clone, restore: restore };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.history;
})(typeof window !== 'undefined' ? window : globalThis);
