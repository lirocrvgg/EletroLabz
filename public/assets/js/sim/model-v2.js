/* sim/model-v2.js - modelo de dados v2 do diagrama de comando (Acionamentos v2, etapa E2).
 * Puro: sem DOM, sem localStorage, sem globais legadas. Trabalha sobre snapshots no formato de cloneDiagramForHistory:
 * {comps:[{..., _uid, sym, id, x, y, w, h}], wires:[{fromUid, fromPort, toUid, toPort}], compIdCounter}.
 * v2 = v1 + comp.rot (0|90|180|270), comp.flip (bool), comp.seq (1..9, opcional) e wire.pts ([{x,y}], vertices intermediarios)
 * e wire.auto (bool, opcional). Nenhuma funcao daqui muta a entrada. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.sim = EO.sim || {};

  var MAX_PTS = 64;

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function fin(v) { return typeof v === 'number' && isFinite(v); }
  function isInt(v) { return fin(v) && Math.floor(v) === v; }

  /* copia rasa segura: chaves como __proto__ viram propriedade propria, nunca alteram o prototipo */
  function copia(o) {
    var r = {};
    Object.keys(o).forEach(function (k) { Object.defineProperty(r, k, { value: o[k], enumerable: true, writable: true, configurable: true }); });
    return r;
  }
  function copiaPts(p) { return Array.isArray(p) ? p.map(function (q) { return isObj(q) ? copia(q) : q; }) : p; }

  function wireUids(w) {
    if (w && w.from && w.to && w.from.comp && w.to.comp) return { a: w.from.comp._uid, b: w.to.comp._uid };
    return { a: w && w.fromUid, b: w && w.toUid };
  }

  /* ---- migrate: v1 -> v2 (idempotente; nunca lanca; nao muda indices, ids, coordenadas nem outros campos) ---- */
  function migrate(snapshot) {
    var avisos = [];
    try {
      if (!isObj(snapshot)) return { snapshot: snapshot, avisos: ['migracao ignorada: snapshot invalido'] };
      var out = copia(snapshot);
      if (Array.isArray(snapshot.comps)) {
        out.comps = snapshot.comps.map(function (c) {
          if (!isObj(c)) return c;
          var n = copia(c);
          if (!hasOwn(n, 'rot')) n.rot = 0;
          if (!hasOwn(n, 'flip')) n.flip = false;
          return n;
        });
      } else avisos.push('migracao: lista de componentes ausente');
      if (Array.isArray(snapshot.wires)) {
        out.wires = snapshot.wires.map(function (w) {
          if (!isObj(w)) return w;
          var n = copia(w);
          if (!hasOwn(n, 'pts')) n.pts = []; else n.pts = copiaPts(n.pts);
          return n;
        });
      } else avisos.push('migracao: lista de fios ausente');
      return { snapshot: out, avisos: avisos };
    } catch (e) {
      return { snapshot: snapshot, avisos: ['migracao ignorada: ' + (e && e.message ? e.message : 'erro')] };
    }
  }

  /* ---- normalize: saneia campos v2 (copia; rot em {0,90,180,270}, flip bool, seq 1..9 ou removido, pts finitos) ---- */
  function normRot(r) {
    var n = Math.round((Number(r) || 0) / 90) % 4;
    if (n < 0) n += 4;
    return n * 90;
  }
  function normPts(p) {
    if (!Array.isArray(p)) return [];
    var out = [];
    for (var i = 0; i < p.length && out.length < MAX_PTS; i++) {
      var q = p[i];
      if (isObj(q) && fin(q.x) && fin(q.y)) out.push({ x: q.x, y: q.y });
    }
    return out;
  }
  function normalize(snapshot, defs) {
    void defs;
    var out = copia(isObj(snapshot) ? snapshot : {});
    out.comps = (Array.isArray(out.comps) ? out.comps : []).filter(isObj).map(function (c) {
      var n = copia(c);
      n.rot = normRot(c.rot);
      n.flip = c.flip === true;
      if (hasOwn(n, 'seq') && !(isInt(n.seq) && n.seq >= 1 && n.seq <= 9)) delete n.seq;
      return n;
    });
    out.wires = (Array.isArray(out.wires) ? out.wires : []).filter(isObj).map(function (w) {
      var n = copia(w);
      n.pts = normPts(w.pts);
      if (hasOwn(n, 'auto') && typeof n.auto !== 'boolean') delete n.auto;
      return n;
    });
    return out;
  }

  /* ---- degree: Map(uid da juncao -> numero de pontas de fio nela; fio com as duas pontas na juncao conta 2) ---- */
  function degree(snapshot) {
    var m = new Map();
    var comps = snapshot && Array.isArray(snapshot.comps) ? snapshot.comps : [];
    comps.forEach(function (c) { if (c && c.sym === 'junction') m.set(c._uid, 0); });
    (snapshot && Array.isArray(snapshot.wires) ? snapshot.wires : []).forEach(function (w) {
      var u = wireUids(w);
      if (m.has(u.a)) m.set(u.a, m.get(u.a) + 1);
      if (m.has(u.b)) m.set(u.b, m.get(u.b) + 1);
    });
    return m;
  }

  /* ---- links: ligacao contato-bobina por id igual. bobina = type coil|monitoring; contato = contact|timer_contact|contact_phase|contact_power ---- */
  var TIPOS_BOBINA = { coil: 1, monitoring: 1 };
  var TIPOS_CONTATO = { contact: 1, timer_contact: 1, contact_phase: 1, contact_power: 1 };
  function links(comps, defs) {
    var r = { bobinas: {}, contatos: {} };
    var d = isObj(defs) ? defs : {};
    function add(alvo, id, uid) {
      if (!hasOwn(alvo, id)) Object.defineProperty(alvo, id, { value: [], enumerable: true, writable: true, configurable: true });
      alvo[id].push(uid);
    }
    (Array.isArray(comps) ? comps : []).forEach(function (c) {
      if (!c || typeof c.id !== 'string' || c.id.trim() === '' || typeof c.sym !== 'string' || !hasOwn(d, c.sym) || !isObj(d[c.sym])) return;
      var t = d[c.sym].type;
      if (hasOwn(TIPOS_BOBINA, t)) add(r.bobinas, c.id, c._uid);
      else if (hasOwn(TIPOS_CONTATO, t)) add(r.contatos, c.id, c._uid);
    });
    return r;
  }

  /* ---- validate: avisos de ligacao, em portugues ---- */
  function validate(snapshot, defs) {
    var avisos = [];
    var l = links(snapshot && snapshot.comps, defs);
    Object.keys(l.bobinas).forEach(function (id) {
      if (l.bobinas[id].length > 1) avisos.push('Id de bobina duplicado: "' + id + '" aparece em ' + l.bobinas[id].length + ' bobinas.');
    });
    Object.keys(l.contatos).forEach(function (id) {
      if (!hasOwn(l.bobinas, id)) avisos.push('Contato "' + id + '" sem bobina de mesmo id.');
    });
    Object.keys(l.bobinas).forEach(function (id) {
      if (!hasOwn(l.contatos, id)) avisos.push('Bobina "' + id + '" sem contato de mesmo id.');
    });
    return avisos;
  }

  /* ---- simplifyCorners: juncao anonima (sym junction, id vazio) de grau 2 vira vertice pts do fio resultante.
   * SEPARADA da migracao. Preserva a particao de nos (a juncao so repassava o no). Fio cujas duas pontas sao a mesma
   * juncao (laco) nao e tocado. Devolve {snapshot, avisos, removidas}. ---- */
  function anonima(c) { return c && c.sym === 'junction' && String(c.id).trim() === ''; }
  function centro(c, defs) {
    var d = isObj(defs) && isObj(defs.junction) ? defs.junction : null;
    var w = fin(c.w) ? c.w : (d && fin(d.w) ? d.w * 20 : 20), h = fin(c.h) ? c.h : (d && fin(d.h) ? d.h * 20 : 20);
    var p = d && Array.isArray(d.ports) && d.ports[0] ? d.ports[0] : { x: 0.5, y: 0.5 };
    return { x: c.x + w * p.x, y: c.y + h * p.y };
  }
  function simplifyCorners(snapshot, defs) {
    var removidas = 0;
    try {
      if (!isObj(snapshot) || !Array.isArray(snapshot.comps) || !Array.isArray(snapshot.wires)) return { snapshot: snapshot, avisos: ['simplificacao ignorada: snapshot invalido'], removidas: 0 };
      var comps = snapshot.comps.slice();
      var wires = snapshot.wires.map(function (w) { var n = copia(w); n.pts = normPts(w.pts); return n; });
      for (var guard = 0; guard < 100000; guard++) {
        var grau = new Map();
        comps.forEach(function (c) { if (anonima(c)) grau.set(c._uid, []); });
        wires.forEach(function (w, i) {
          if (grau.has(w.fromUid)) grau.get(w.fromUid).push(i);
          if (grau.has(w.toUid)) grau.get(w.toUid).push(i);
        });
        var alvo = null;
        grau.forEach(function (idx, uid) {
          if (!alvo && idx.length === 2 && idx[0] !== idx[1]) alvo = { uid: uid, i: idx[0], j: idx[1] };
        });
        if (!alvo) break;
        var jc = comps.filter(function (c) { return c._uid === alvo.uid; })[0];
        var w1 = wires[alvo.i], w2 = wires[alvo.j], v = centro(jc, defs);
        /* w1 orientado para terminar na juncao; w2 para comecar nela */
        var a = w1.toUid === alvo.uid ? { uid: w1.fromUid, port: w1.fromPort, pts: w1.pts } : { uid: w1.toUid, port: w1.toPort, pts: w1.pts.slice().reverse() };
        var b = w2.fromUid === alvo.uid ? { uid: w2.toUid, port: w2.toPort, pts: w2.pts } : { uid: w2.fromUid, port: w2.fromPort, pts: w2.pts.slice().reverse() };
        var n = copia(w1);
        n.fromUid = a.uid; n.fromPort = a.port; n.toUid = b.uid; n.toPort = b.port;
        n.pts = a.pts.concat([{ x: v.x, y: v.y }], b.pts);
        if (w1.auto === true && w2.auto === true) n.auto = true; else delete n.auto;
        wires[alvo.i] = n;
        wires.splice(alvo.j, 1);
        comps = comps.filter(function (c) { return c._uid !== alvo.uid; });
        removidas++;
      }
      var out = copia(snapshot);
      out.comps = comps; out.wires = wires;
      return { snapshot: out, avisos: [], removidas: removidas };
    } catch (e) {
      return { snapshot: snapshot, avisos: ['simplificacao ignorada: ' + (e && e.message ? e.message : 'erro')], removidas: 0 };
    }
  }

  EO.sim.modelV2 = {
    MAX_PTS: MAX_PTS, migrate: migrate, normalize: normalize, degree: degree, links: links, validate: validate, simplifyCorners: simplifyCorners
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.sim.modelV2;
})(typeof window !== 'undefined' ? window : globalThis);
