/* sim/diagram-io.js - persistencia do diagrama de comando (etapa 4.5, parte A).
 * Puro: sem DOM, sem localStorage (quem integra le/grava; ver autosaveKey, toStorage, fromStorage).
 * Formato do arquivo: {formato:'eo-aciona-diagrama', versao:1, criadoEm, comps, wires, compIdCounter}, onde comps/wires/
 * compIdCounter seguem cloneDiagramForHistory (legacy/aciona.js): comps usam `sym` (id do simbolo) e `_uid`;
 * wires usam {fromUid, fromPort, toUid, toPort}. parse() NUNCA confia no texto: so copia chaves conhecidas, valida tipos e
 * limites, e devolve objetos novos (nada do JSON original sobrevive). Strings sao guardadas sem '<' e '>' e sem caracteres de
 * controle; ainda assim, quem exibir via innerHTML deve usar EO.sim.diagramIO.escapeHTML. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.sim = EO.sim || {};

  var FORMATO = 'eo-aciona-diagrama', VERSAO = 1, VERSAO2 = 2;
  var LIM = { bytes: 2 * 1024 * 1024, comps: 500, wires: 2000, str: 32, pos: 100000, dim: 2000, tempo: 86400, uid: 10000000, pts: 64 };
  var CORES = { green: 1, red: 1, amber: 1, white: 1, blue: 1 };
  var ESTADOS = { '': 1, closed: 1, open: 1 };
  var MODOS = { '': 1, onDelay: 1, offDelay: 1 };
  var PROIBIDAS = ['__proto__', 'constructor', 'prototype'];
  var BOOLS = ['energized', 'fault', '_pressed', '_selected', '_actuated', '_timerDone', '_offDelayActive', '__prevCoilOn'];
  var CONHECIDAS = ['id', 'sym', 'x', 'y', '_uid', 'label', 'w', 'h', 'time', '_tAcc', 'color', 'forceState', 'timerMode'].concat(BOOLS);
  var CONHECIDAS_V2 = CONHECIDAS.concat(['rot', 'flip', 'seq']);
  var ROTS = { 0: 1, 90: 1, 180: 1, 270: 1 };
  var CTRL_SRC = "[\x00-\x1f\x7f-\x9f" + String.fromCharCode(0x2028, 0x2029) + "]";
  var CTRL = new RegExp(CTRL_SRC), CTRL_G = new RegExp(CTRL_SRC, "g");

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function isInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
  function num(v, min, max) { return typeof v === 'number' && isFinite(v) && v >= min && v <= max; }
  function modelo() { return EO.sim.modelV2 || (typeof require === 'function' ? require('./model-v2.js') : null); }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"'`]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[ch]; });
  }

  /* ---- serialize (mesmo formato de cloneDiagramForHistory; wires vivos {from:{comp,port},to:{comp,port}} ou ja em uid) ---- */
  function serialize(comps, wires, compIdCounter, agora, opts) {
    var v2 = !!(opts && opts.versao === 2);
    var cs = (comps || []).map(function (c) {
      var o = {
        id: c.id, label: c.label, sym: c.sym, x: c.x, y: c.y, w: c.w, h: c.h,
        energized: false, fault: c.fault, color: c.color, time: c.time, timerMode: c.timerMode, forceState: c.forceState,
        _uid: c._uid, _pressed: false, _selected: c._selected, _actuated: c._actuated, _timerDone: c._timerDone,
        _tAcc: c._tAcc, _offDelayActive: c._offDelayActive, __prevCoilOn: c.__prevCoilOn
      };
      if (v2) {
        o.rot = hasOwn(ROTS, c.rot) ? c.rot : 0; o.flip = c.flip === true;
        if (isInt(c.seq) && c.seq >= 1 && c.seq <= 9) o.seq = c.seq;
      }
      return o;
    });
    var ws = (wires || []).map(function (w) {
      var o = (w.from && w.to) ? { fromUid: w.from.comp._uid, fromPort: w.from.port, toUid: w.to.comp._uid, toPort: w.to.port }
        : { fromUid: w.fromUid, fromPort: w.fromPort, toUid: w.toUid, toPort: w.toPort };
      if (v2) {
        o.pts = (Array.isArray(w.pts) ? w.pts : []).filter(function (q) { return isObj(q) && num(q.x, -LIM.pos, LIM.pos) && num(q.y, -LIM.pos, LIM.pos); })
          .slice(0, LIM.pts).map(function (q) { return { x: q.x, y: q.y }; });
        if (w.auto === true) o.auto = true;
      }
      return o;
    });
    return JSON.stringify({ formato: FORMATO, versao: v2 ? VERSAO2 : VERSAO, criadoEm: agora || new Date().toISOString(), comps: cs, wires: ws, compIdCounter: compIdCounter });
  }

  /* ---- parse ---- */
  function limparTexto(v, avisos, onde, campo) {
    if (typeof v !== 'string') return null;
    var s = v;
    if (CTRL.test(s)) { s = s.replace(CTRL_G, ''); avisos.push(onde + ': caracteres de controle removidos de "' + campo + '"'); }
    if (/[<>]/.test(s)) { s = s.replace(/[<>]/g, ''); avisos.push(onde + ': "<" e ">" removidos de "' + campo + '"'); }
    if (s.length > LIM.str) { s = s.slice(0, LIM.str); avisos.push(onde + ': "' + campo + '" truncado em ' + LIM.str + ' caracteres'); }
    return s;
  }

  function parse(text, defs, opts) {
    var avisos = [];
    function erro(m) { return { ok: false, erro: m }; }
    if (typeof text !== 'string') return erro('Conteudo invalido: esperado texto JSON.');
    if (text.length > LIM.bytes) return erro('Arquivo grande demais (maximo 2 MB).');
    if (!isObj(defs)) return erro('Definicoes de simbolos ausentes.');
    var d;
    try { d = JSON.parse(text); } catch (e) { return erro('JSON invalido: o arquivo nao pode ser lido.'); }
    if (!isObj(d)) return erro('O arquivo nao e um diagrama (esperado objeto JSON).');
    if (d.formato !== FORMATO) return erro('Formato desconhecido: nao e um diagrama do EletroLabz.');
    if (d.versao !== VERSAO && d.versao !== VERSAO2) return erro('Versao do arquivo nao suportada.');
    var v2 = d.versao === VERSAO2, alvo2 = !!(opts && opts.alvo === 2);
    if ((v2 || alvo2) && !modelo()) return erro('Modulo do modelo v2 indisponivel.');
    var conhecidas = v2 ? CONHECIDAS_V2 : CONHECIDAS;
    if (!Array.isArray(d.comps)) return erro('Lista de componentes ausente ou invalida.');
    if (!Array.isArray(d.wires)) return erro('Lista de fios ausente ou invalida.');
    if (d.comps.length > LIM.comps) return erro('Componentes demais (maximo ' + LIM.comps + ').');
    if (d.wires.length > LIM.wires) return erro('Fios demais (maximo ' + LIM.wires + ').');
    PROIBIDAS.forEach(function (k) { if (hasOwn(d, k)) avisos.push('chave "' + k + '" ignorada no topo do arquivo'); });

    var comps = [], defPorUid = {};
    d.comps.forEach(function (raw, i) {
      var onde = 'componente ' + (i + 1);
      if (!isObj(raw)) { avisos.push(onde + ' descartado: nao e objeto'); return; }
      PROIBIDAS.forEach(function (k) { if (hasOwn(raw, k)) avisos.push(onde + ': chave "' + k + '" ignorada'); });
      if (typeof raw.sym !== 'string' || !hasOwn(defs, raw.sym) || !isObj(defs[raw.sym]) || !Array.isArray(defs[raw.sym].ports)) { avisos.push(onde + ' descartado: simbolo desconhecido'); return; }
      var id = limparTexto(raw.id, avisos, onde, 'id');
      if (id === null) { avisos.push(onde + ' descartado: id invalido'); return; }
      if (!isInt(raw._uid) || raw._uid < 1 || raw._uid > LIM.uid) { avisos.push(onde + ' descartado: _uid invalido'); return; }
      /* id vazio (ou so < >) nao descarta o componente nem seus fios: gera sym + _uid (A4) */
      if (id === '') { id = (raw.sym + raw._uid).slice(0, LIM.str); avisos.push(onde + ': identificacao vazia substituida por "' + id + '"'); }
      if (hasOwn(defPorUid, raw._uid)) { avisos.push(onde + ' descartado: _uid repetido'); return; }
      if (!num(raw.x, -LIM.pos, LIM.pos) || !num(raw.y, -LIM.pos, LIM.pos)) { avisos.push(onde + ' descartado: posicao invalida'); return; }
      var c = { id: id, sym: raw.sym, x: raw.x, y: raw.y, _uid: raw._uid };
      if (hasOwn(raw, 'label')) {
        var lb = limparTexto(raw.label, avisos, onde, 'label');
        if (lb === null) avisos.push(onde + ': "label" invalido ignorado'); else c.label = lb;
      }
      ['w', 'h'].forEach(function (k) {
        if (!hasOwn(raw, k)) return;
        if (num(raw[k], 1, LIM.dim)) c[k] = raw[k]; else avisos.push(onde + ': "' + k + '" invalido ignorado');
      });
      BOOLS.forEach(function (k) {
        if (!hasOwn(raw, k) || raw[k] === undefined) return;
        if (typeof raw[k] === 'boolean') c[k] = raw[k]; else avisos.push(onde + ': "' + k + '" invalido ignorado');
      });
      if (v2) {
        if (hasOwn(raw, 'rot')) { if (typeof raw.rot === 'number' && hasOwn(ROTS, raw.rot)) c.rot = raw.rot; else avisos.push(onde + ': "rot" invalido ignorado'); }
        if (hasOwn(raw, 'flip')) { if (typeof raw.flip === 'boolean') c.flip = raw.flip; else avisos.push(onde + ': "flip" invalido ignorado'); }
        if (hasOwn(raw, 'seq')) { if (isInt(raw.seq) && raw.seq >= 1 && raw.seq <= 9) c.seq = raw.seq; else avisos.push(onde + ': "seq" invalido ignorado'); }
      }
      ['time', '_tAcc'].forEach(function (k) {
        if (!hasOwn(raw, k)) return;
        /* A1: autosaves antigos gravaram o tempo como string ("10"); aceita string numerica finita e converte */
        var v = raw[k];
        if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v))) { v = Number(v); avisos.push(onde + ': "' + k + '" era texto, convertido para numero'); }
        if (num(v, 0, LIM.tempo)) c[k] = v; else avisos.push(onde + ': "' + k + '" fora de 0 a 86400 ignorado');
      });
      [['color', CORES], ['forceState', ESTADOS], ['timerMode', MODOS]].forEach(function (p) {
        var k = p[0];
        if (!hasOwn(raw, k)) return;
        if (typeof raw[k] === 'string' && hasOwn(p[1], raw[k])) c[k] = raw[k]; else avisos.push(onde + ': "' + k + '" invalido ignorado');
      });
      var desc = Object.keys(raw).filter(function (k) { return conhecidas.indexOf(k) < 0 && PROIBIDAS.indexOf(k) < 0; });
      if (desc.length) avisos.push(onde + ': ' + desc.length + ' chave(s) desconhecida(s) ignorada(s)');
      defPorUid[c._uid] = defs[raw.sym];
      comps.push(c);
    });

    var wires = [];
    d.wires.forEach(function (raw, i) {
      var onde = 'fio ' + (i + 1);
      if (!isObj(raw)) { avisos.push(onde + ' descartado: nao e objeto'); return; }
      var a = isInt(raw.fromUid) && hasOwn(defPorUid, raw.fromUid) ? defPorUid[raw.fromUid] : null;
      var b = isInt(raw.toUid) && hasOwn(defPorUid, raw.toUid) ? defPorUid[raw.toUid] : null;
      if (!a || !b) { avisos.push(onde + ' descartado: componente inexistente'); return; }
      if (!isInt(raw.fromPort) || raw.fromPort < 0 || raw.fromPort >= a.ports.length || !isInt(raw.toPort) || raw.toPort < 0 || raw.toPort >= b.ports.length) { avisos.push(onde + ' descartado: porta inexistente'); return; }
      var fw = { fromUid: raw.fromUid, fromPort: raw.fromPort, toUid: raw.toUid, toPort: raw.toPort };
      if (v2) {
        var pts = [];
        if (hasOwn(raw, 'pts')) {
          var okp = Array.isArray(raw.pts) && raw.pts.length <= LIM.pts && raw.pts.every(function (q) { return isObj(q) && num(q.x, -LIM.pos, LIM.pos) && num(q.y, -LIM.pos, LIM.pos); });
          if (okp) pts = raw.pts.map(function (q) { return { x: q.x, y: q.y }; }); else avisos.push(onde + ': "pts" invalido ignorado (maximo ' + LIM.pts + ' vertices finitos)');
        }
        fw.pts = pts;
        if (hasOwn(raw, 'auto')) { if (typeof raw.auto === 'boolean') { if (raw.auto) fw.auto = true; } else avisos.push(onde + ': "auto" invalido ignorado'); }
      }
      wires.push(fw);
    });

    var maxUid = 0; comps.forEach(function (c) { if (c._uid > maxUid) maxUid = c._uid; });
    var cnt = d.compIdCounter;
    if (!isInt(cnt) || cnt <= maxUid || cnt > LIM.uid + 1) { cnt = maxUid + 1; avisos.push('compIdCounter ausente ou invalido: recalculado'); }
    var snap = { comps: comps, wires: wires, compIdCounter: cnt };
    if (v2 || alvo2) {
      snap = modelo().migrate(snap).snapshot; /* v2: completa rot/flip/pts ausentes; v1 com alvo 2: converte */
      if (!v2) avisos.push('convertido do formato 1');
    }
    return { ok: true, snapshot: snap, avisos: avisos };
  }

  /* ---- apoio ao localStorage (quem integra faz getItem/setItem) ---- */
  var autosaveKey = 'eo_aciona_diagrama_v1', autosaveKeyV2 = 'eo_aciona_diagrama_v2';
  function toStorage(comps, wires, compIdCounter) { return { key: autosaveKey, value: serialize(comps, wires, compIdCounter) }; }
  function toStorageV2(comps, wires, compIdCounter) { return { key: autosaveKeyV2, value: serialize(comps, wires, compIdCounter, undefined, { versao: 2 }) }; }
  function vazio(v) { return v === null || v === undefined || v === ''; }
  /* fromStorage(v2, v1, defs): le a chave v2; se ausente ou corrompida, cai para a v1 e migra (aviso "convertido do formato 1").
   * Puro: nunca apaga nem grava nada (a chave v1 fica intacta). Resultado ganha `origem` ('v2' | 'v1').
   * Forma antiga fromStorage(valor, defs) continua valendo (a pagina atual usa so a chave v1, sem migracao). */
  function fromStorage(a, b, c) {
    if (isObj(b) && c === undefined) {
      if (vazio(a)) return { ok: false, erro: 'Nenhum autosave.', vazio: true };
      return parse(a, b);
    }
    var v2 = a, v1 = b, defs = c;
    var r2 = null;
    if (!vazio(v2)) {
      r2 = parse(v2, defs, { alvo: 2 });
      if (r2.ok) { r2.origem = 'v2'; return r2; }
    }
    if (!vazio(v1)) {
      var r1 = parse(v1, defs, { alvo: 2 });
      if (r1.ok) {
        r1.origem = 'v1';
        if (r2) r1.avisos.unshift('autosave do formato 2 ilegivel: usado o formato 1');
        return r1;
      }
      return r2 ? r2 : r1;
    }
    return r2 ? r2 : { ok: false, erro: 'Nenhum autosave.', vazio: true };
  }
  /* "Novo": remove as DUAS chaves (acao explicita do usuario). Sem argumento so devolve as chaves. */
  function clearBoth(storage) {
    var chaves = [autosaveKey, autosaveKeyV2];
    if (storage && typeof storage.removeItem === 'function') chaves.forEach(function (k) { try { storage.removeItem(k); } catch (e) { /* ignora */ } });
    return chaves;
  }

  EO.sim.diagramIO = {
    formato: FORMATO, versao: VERSAO, versaoV2: VERSAO2, limites: LIM, autosaveKey: autosaveKey, autosaveKeyV2: autosaveKeyV2,
    serialize: serialize, parse: parse, toStorage: toStorage, toStorageV2: toStorageV2, clearBoth: clearBoth, fromStorage: fromStorage, escapeHTML: escapeHTML
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.sim.diagramIO;
})(typeof window !== 'undefined' ? window : globalThis);
