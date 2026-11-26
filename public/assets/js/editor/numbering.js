/* editor/numbering.js - numeracao de bornes, ids sugeridos, referencia cruzada e avisos (Acionamentos v2, E4a).
 * Puro: sem DOM. A numeracao e so apresentacao: nao entra no motor. Plano: docs/PLANO_ACIONA_V2.md secoes 1.3 e 3.
 *
 * API (EO.editor.numbering)
 *   labels(comps, defs, catalog)  Map(uid -> ['13','14']). Terminal com fn = digito de sequencia + fn; terminal fixo sai como esta.
 *                                 Sequencia automatica = posicao (1..9) pela ordem de _uid entre os componentes de mesmo id que usam fn;
 *                                 c.seq (1..9) sobrepoe. Mais de 9 contatos: a sequencia trava em 9. Id vazio: sequencia 1.
 *                                 Cache pela assinatura do modelo (uid|sym|id|seq): chamadas iguais devolvem o MESMO Map (nao mute).
 *   nextId(prefixo, comps)        'K' ou 'K1' -> proximo livre acima do maior existente (K1 -> K2; sem nenhum -> K1).
 *   letraSugerida(sym, catalog)   letra do catalogo ('' se nao houver; 'Q/F' -> 'Q').
 *   crossRef(comps, defs, catalog) Map(uid da bobina ou do dispositivo de protecao -> {id, texto, itens:[{uid, sym, bornes, tipo}]}).
 *                                 texto ex.: 'K1: 13–14 NA, 21–22 NF'. Protecao = overload_* e motor_breaker_3p: lista os trip_contact e os 95–96 de mesmo id.
 *   warnings(comps, defs)         modelV2.validate + 'Contato de protecao ... sem dispositivo de mesmo id'.
 * catalog e opcional nas funcoes que o recebem: o padrao e EO.render.symbols.catalog(). */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};

  var DASH = '–';
  var cache = { sig: null, cat: null, defs: null, map: null };
  var catIdx = { ref: null, map: null };

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function isObj(v) { return v !== null && typeof v === 'object'; }
  function lista(c) { return Array.isArray(c) ? c : []; }
  function setProp(o, k, v) { Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true }); }

  function symbols() {
    if (EO.render && EO.render.symbols) return EO.render.symbols;
    if (typeof require === 'function') { try { return require('../render/symbols.js'); } catch (e) { /* sem simbolos */ } }
    return null;
  }
  function modelV2() {
    if (EO.sim && EO.sim.modelV2) return EO.sim.modelV2;
    if (typeof require === 'function') { try { return require('../sim/model-v2.js'); } catch (e) { /* sem modelo */ } }
    return null;
  }
  var catPadrao = null;
  function catalogo(catalog) {
    if (Array.isArray(catalog)) return catalog;
    if (!catPadrao) { var s = symbols(); catPadrao = s && s.catalog ? s.catalog() : []; }
    return catPadrao;
  }
  function indice(catalog) {
    if (catIdx.ref === catalog) return catIdx.map;
    var m = {};
    catalog.forEach(function (e) { if (e && typeof e.id === 'string') setProp(m, e.id, e); });
    catIdx.ref = catalog; catIdx.map = m;
    return m;
  }
  function idDe(c) { return typeof c.id === 'string' ? c.id.trim() : ''; }
  function usaFn(e) { return !!e && lista(e.terminais).some(function (t) { return t && t.fn; }); }
  function cmpUid(a, b) {
    var x = a._uid, y = b._uid;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x) < String(y) ? -1 : (String(x) > String(y) ? 1 : 0);
  }
  function seqValida(s) { return typeof s === 'number' && isFinite(s) && Math.floor(s) === s && s >= 1 && s <= 9; }
  function entrada(idx, sym) { return typeof sym === 'string' && hasOwn(idx, sym) ? idx[sym] : null; }

  function labels(comps, defs, catalog) {
    var cat = catalogo(catalog);
    var cs = lista(comps).filter(isObj);
    var sig = cs.map(function (c) { return [c._uid, c.sym, c.id, c.seq].join('|'); }).join(';');
    if (cache.map && cache.sig === sig && cache.cat === cat && cache.defs === defs) return cache.map;
    var idx = indice(cat);
    var grupos = {};
    cs.forEach(function (c) {
      if (!usaFn(entrada(idx, c.sym)) || idDe(c) === '') return;
      var k = idDe(c);
      if (!hasOwn(grupos, k)) setProp(grupos, k, []);
      grupos[k].push(c);
    });
    var auto = new Map();
    Object.keys(grupos).forEach(function (k) {
      grupos[k].map(function (c, i) { return { c: c, i: i }; })
        .sort(function (a, b) { return cmpUid(a.c, b.c) || a.i - b.i; })
        .forEach(function (o, pos) { auto.set(o.c, Math.min(pos + 1, 9)); });
    });
    var out = new Map();
    cs.forEach(function (c) {
      var e = entrada(idx, c.sym);
      if (!e) return;
      var seq = seqValida(c.seq) ? c.seq : (auto.has(c) ? auto.get(c) : 1);
      out.set(c._uid, lista(e.terminais).map(function (t) {
        if (t.fixo) return String(t.fixo);
        if (t.fn) return String(seq) + t.fn;
        return String(t.n);
      }));
    });
    cache = { sig: sig, cat: cat, defs: defs, map: out };
    return out;
  }

  function nextId(prefixo, comps) {
    var p = String(prefixo == null ? '' : prefixo).replace(/\d+$/, '');
    var max = 0;
    lista(comps).forEach(function (c) {
      if (!isObj(c) || typeof c.id !== 'string') return;
      var id = c.id.trim();
      if (id.slice(0, p.length) !== p) return;
      var rest = id.slice(p.length);
      if (/^\d+$/.test(rest)) max = Math.max(max, parseInt(rest, 10));
    });
    return p + (max + 1);
  }

  function letraSugerida(sym, catalog) {
    var e = entrada(indice(catalogo(catalog)), sym);
    return e ? String(e.letra || '').split('/')[0].trim() : '';
  }

  function tipoDe(e) {
    var t0 = e && e.terminais && e.terminais[0] || {};
    var f = t0.fn || t0.fixo || '';
    var m = { '3': 'NA', '1': 'NF', '7': 'NA temporizado', '5': 'NF temporizado', '95': 'NF', '97': 'NA', '13': 'NA aux.' };
    return hasOwn(m, f) ? m[f] : '';
  }
  function texto(id, itens) {
    if (!itens.length) return id + ': sem contatos';
    return id + ': ' + itens.map(function (i) { return i.bornes + (i.tipo ? ' ' + i.tipo : ''); }).join(', ');
  }
  function ehDispositivo(sym, defs) { return typeof sym === 'string' && (sym.indexOf('overload_') === 0 || sym === 'motor_breaker_3p') && tipoDef(defs, sym) !== 'trip_contact'; }
  function tipoDef(defs, sym) {
    return isObj(defs) && typeof sym === 'string' && hasOwn(defs, sym) && isObj(defs[sym]) ? defs[sym].type : undefined;
  }

  function crossRef(comps, defs, catalog) {
    var cat = catalogo(catalog), idx = indice(cat);
    var cs = lista(comps).filter(isObj);
    var lab = labels(cs, defs, cat);
    var mv = modelV2();
    var l = mv ? mv.links(cs, defs) : { bobinas: {}, contatos: {} };
    var porUid = new Map();
    cs.forEach(function (c) { porUid.set(c._uid, c); });
    function mk(c) {
      return { uid: c._uid, sym: c.sym, bornes: (lab.get(c._uid) || []).join(DASH), tipo: tipoDe(entrada(idx, c.sym)) };
    }
    var out = new Map();
    Object.keys(l.bobinas).forEach(function (id) {
      var itens = lista(hasOwn(l.contatos, id) ? l.contatos[id] : []).map(function (u) { return porUid.get(u); })
        .filter(Boolean).sort(cmpUid).map(mk);
      l.bobinas[id].forEach(function (u) { out.set(u, { id: id, texto: texto(id, itens), itens: itens }); });
    });
    cs.forEach(function (c) {
      if (!ehDispositivo(c.sym, defs) || idDe(c) === '') return;
      var id = idDe(c);
      var itens = cs.filter(function (o) {
        return o !== c && idDe(o) === id && (tipoDef(defs, o.sym) === 'trip_contact' || o.sym === 'overload_relay');
      }).sort(cmpUid).map(mk);
      out.set(c._uid, { id: id, texto: texto(id, itens), itens: itens });
    });
    return out;
  }

  function warnings(comps, defs) {
    var cs = lista(comps).filter(isObj);
    var mv = modelV2();
    var av = mv ? mv.validate({ comps: cs }, defs) : [];
    var dispositivos = {};
    cs.forEach(function (c) { if (ehDispositivo(c.sym, defs) && idDe(c) !== '') setProp(dispositivos, idDe(c), true); });
    var vistos = {};
    cs.forEach(function (c) {
      if (tipoDef(defs, c.sym) !== 'trip_contact') return;
      var id = idDe(c);
      if (hasOwn(dispositivos, id) || hasOwn(vistos, id)) return;
      setProp(vistos, id, true);
      av.push('Contato de proteção "' + id + '" sem dispositivo de mesmo id.');
    });
    return av;
  }

  EO.editor.numbering = { labels: labels, nextId: nextId, letraSugerida: letraSugerida, crossRef: crossRef, warnings: warnings };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.numbering;
})(typeof window !== 'undefined' ? window : globalThis);
