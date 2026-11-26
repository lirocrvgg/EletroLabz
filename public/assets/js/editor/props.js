/* editor/props.js - painel de propriedades do componente (Acionamentos v2, E4a). Nao e carregado por nenhuma pagina ainda.
 *
 * API (EO.editor.props)
 *   render(container, comp, ctx)  monta o painel dentro de container (substitui o conteudo).
 *   update(container, comp, ctx?) atualiza valores, bornes, referencia e avisos sem recriar os controles (nao mexe no campo com foco);
 *                                 se o simbolo mudou desde o render, remonta. ctx e opcional: usa o do ultimo render.
 *
 * ctx = {
 *   catalog      array de EO.render.symbols.catalog() (padrao: o proprio catalogo),
 *   numbering    EO.editor.numbering (padrao: o global),
 *   defs         SYMBOL_DEFS (para referencia cruzada e avisos),
 *   comps        todos os componentes do diagrama (para bornes, referencia cruzada e avisos),
 *   bobinaIds    ['K1','K2'] ids de bobina para o datalist (padrao: derivados de comps/defs),
 *   onChange     function (campo, valor)
 * }
 * Campos e tipos enviados a onChange:
 *   id (string), label (string), rot (inteiro 0|90|180|270), flip (boolean), seq (inteiro 1..9, ou null = Auto),
 *   color (string), time (numero 0..86400; entrada invalida nao dispara), timerMode ('onDelay'|'offDelay'), forceState ('', 'closed', 'open').
 * Todo controle tem data-eo-action="aciona:prop-<campo>" (campo em kebab-case), label associado e altura minima de 44 px.
 * Todo texto vindo de dados entra por textContent ou value (nunca por innerHTML). */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};

  var DASH = '–';
  var estados = typeof WeakMap === 'function' ? new WeakMap() : null;
  var CORES = [['green', 'Verde'], ['red', 'Vermelho'], ['amber', 'Âmbar'], ['white', 'Branco'], ['blue', 'Azul']];
  var MODOS = [['onDelay', 'Retardo na energização (fecha após T)'], ['offDelay', 'Retardo na desenergização (mantém T após OFF)']];
  var ESTADOS = [['', 'Padrão'], ['closed', 'Fechado (ativo)'], ['open', 'Aberto (inativo)']];
  var ROTS = [0, 90, 180, 270];
  var T_MAX = 86400;

  function isObj(v) { return v !== null && typeof v === 'object'; }
  function lista(v) { return Array.isArray(v) ? v : []; }
  function symbols() {
    if (EO.render && EO.render.symbols) return EO.render.symbols;
    if (typeof require === 'function') { try { return require('../render/symbols.js'); } catch (e) { /* sem simbolos */ } }
    return null;
  }
  function numberingPadrao() {
    if (EO.editor.numbering) return EO.editor.numbering;
    if (typeof require === 'function') { try { return require('./numbering.js'); } catch (e) { /* sem numeracao */ } }
    return null;
  }
  function guardar(container, v) { if (estados) estados.set(container, v); else container._eoProps = v; }
  function recuperar(container) { return estados ? estados.get(container) : container._eoProps; }

  function isTimerContact(sym) { return typeof sym === 'string' && sym.indexOf('contact_timer_') === 0; }
  function isTimerCoil(sym) { return sym === 'timer_relay' || sym === 'timer_relay_off'; }
  function modoPadrao(comp, ctx) {
    if (comp.timerMode) return comp.timerMode;
    var d = ctx.defs && isObj(ctx.defs[comp.sym]) ? ctx.defs[comp.sym] : null;
    return d && d.timerMode ? d.timerMode : (typeof comp.sym === 'string' && comp.sym.indexOf('_off_') > 0 ? 'offDelay' : 'onDelay');
  }

  function el(doc, tag, attrs, text) {
    var n = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function campoId(campo) { return 'eo-prop-' + campo; }
  function row(doc, campo, rotulo, controle, extra) {
    var r = el(doc, 'div', { 'class': 'prop-row' });
    r.setAttribute('data-eo-prop', campo);
    var l = el(doc, 'label', { 'for': campoId(campo) }, rotulo);
    if (extra) Object.keys(extra).forEach(function (k) { l.setAttribute(k, extra[k]); });
    r.appendChild(l);
    r.appendChild(controle);
    return r;
  }
  function controle(doc, tag, campo, attrs) {
    var a = { id: campoId(campo), 'data-eo-action': 'aciona:prop-' + campo };
    Object.keys(attrs || {}).forEach(function (k) { a[k] = attrs[k]; });
    return el(doc, tag, a);
  }
  function select(doc, campo, opcoes) {
    var s = controle(doc, 'select', campo);
    opcoes.forEach(function (o) {
      var op = el(doc, 'option', { value: String(o[0]) }, o[1]);
      s.appendChild(op);
    });
    return s;
  }

  function bobinaIds(ctx, num) {
    if (Array.isArray(ctx.bobinaIds)) return ctx.bobinaIds.filter(function (s) { return typeof s === 'string' && s !== ''; });
    var mv = (EO.sim && EO.sim.modelV2) || null;
    if (!mv && typeof require === 'function') { try { mv = require('../sim/model-v2.js'); } catch (e) { mv = null; } }
    void num;
    return mv ? Object.keys(mv.links(lista(ctx.comps), ctx.defs).bobinas) : [];
  }
  function entradaCat(ctx, sym) {
    var cat = Array.isArray(ctx.catalog) ? ctx.catalog : (symbols() ? symbols().catalog() : []);
    for (var i = 0; i < cat.length; i++) if (cat[i] && cat[i].id === sym) return cat[i];
    return null;
  }
  function usaFn(e) { return !!e && lista(e.terminais).some(function (t) { return t && t.fn; }); }

  function textoBornes(lab) {
    if (!lab || !lab.length) return '';
    return lab.length === 2 ? lab[0] + DASH + lab[1] : lab.join(' · ');
  }
  function emit(ctx, campo, valor) { if (ctx && typeof ctx.onChange === 'function') ctx.onChange(campo, valor); }

  /* dados derivados (bornes, referencia cruzada, avisos) */
  function derivados(comp, ctx) {
    var num = ctx.numbering || numberingPadrao();
    var comps = lista(ctx.comps);
    var d = { bornes: '', ref: null, avisos: [] };
    if (!num) return d;
    var cat = Array.isArray(ctx.catalog) ? ctx.catalog : undefined;
    var lab = num.labels(comps, ctx.defs, cat);
    d.bornes = textoBornes(lab.get(comp._uid));
    var id = typeof comp.id === 'string' ? comp.id.trim() : '';
    if (id) {
      var refs = num.crossRef(comps, ctx.defs, cat), achado = null;
      var proprio = refs.get(comp._uid);
      if (proprio) achado = proprio;
      else refs.forEach(function (v) { if (!achado && v.id === id) achado = v; });
      d.ref = achado;
      d.avisos = num.warnings(comps, ctx.defs).filter(function (a) { return a.indexOf('"' + id + '"') >= 0; });
    }
    return d;
  }

  function renderDerivados(doc, alvo, comp, ctx) {
    while (alvo.firstChild) alvo.removeChild(alvo.firstChild);
    var d = derivados(comp, ctx);
    var b = el(doc, 'p', { 'class': 'prop-readonly', id: 'eo-prop-bornes' });
    var bl = el(doc, 'span', { 'class': 'prop-readonly-label' }, 'Bornes resultantes: ');
    var bv = el(doc, 'output', { 'class': 'prop-readonly-value' }, d.bornes || '—');
    b.appendChild(bl); b.appendChild(bv);
    alvo.appendChild(b);
    if (d.ref) {
      var h = el(doc, 'h5', { 'class': 'prop-sub' }, 'Contatos de ' + d.ref.id);
      alvo.appendChild(h);
      var ul = el(doc, 'ul', { 'class': 'prop-crossref', 'aria-label': 'Contatos de ' + d.ref.id });
      if (!d.ref.itens.length) ul.appendChild(el(doc, 'li', null, 'Nenhum contato com este id.'));
      d.ref.itens.forEach(function (i) { ul.appendChild(el(doc, 'li', null, i.bornes + (i.tipo ? ' ' + i.tipo : ''))); });
      alvo.appendChild(ul);
    }
    if (d.avisos.length) {
      var av = el(doc, 'ul', { 'class': 'prop-warnings', role: 'status', 'aria-live': 'polite' });
      d.avisos.forEach(function (a) { av.appendChild(el(doc, 'li', null, a)); });
      alvo.appendChild(av);
    }
  }

  function render(container, comp, ctx) {
    if (!container || !isObj(comp)) return;
    ctx = ctx || {};
    var doc = container.ownerDocument || ctx.document || (typeof document !== 'undefined' ? document : null);
    while (container.firstChild) container.removeChild(container.firstChild);
    var num = ctx.numbering || numberingPadrao();
    var cat = entradaCat(ctx, comp.sym);
    var campos = {};

    /* identificacao + datalist */
    var inId = controle(doc, 'input', 'id', { type: 'text', list: 'eo-prop-id-lista', autocomplete: 'off', placeholder: 'ex: K1' });
    inId.addEventListener('input', function () { emit(ctx, 'id', inId.value); });
    var dl = el(doc, 'datalist', { id: 'eo-prop-id-lista' });
    bobinaIds(ctx, num).forEach(function (b) { var o = doc.createElement('option'); o.value = b; dl.appendChild(o); });
    var r1 = row(doc, 'id', 'Identificação', inId);
    r1.appendChild(dl);
    container.appendChild(r1);
    campos.id = inId;

    var inLabel = controle(doc, 'input', 'label', { type: 'text', placeholder: 'ex: Contator principal' });
    inLabel.addEventListener('input', function () { emit(ctx, 'label', inLabel.value); });
    container.appendChild(row(doc, 'label', 'Descrição', inLabel));
    campos.label = inLabel;

    /* rotacao, espelho, sequencia */
    var sRot = select(doc, 'rot', ROTS.map(function (r) { return [r, r + '°']; }));
    sRot.addEventListener('change', function () { emit(ctx, 'rot', parseInt(sRot.value, 10) || 0); });
    container.appendChild(row(doc, 'rot', 'Rotação', sRot));
    campos.rot = sRot;

    var cbFlip = controle(doc, 'input', 'flip', { type: 'checkbox' });
    cbFlip.addEventListener('change', function () { emit(ctx, 'flip', !!cbFlip.checked); });
    var rf = row(doc, 'flip', 'Espelhar horizontalmente', cbFlip, { style: 'min-height:44px;display:flex;align-items:center;gap:.5rem' });
    rf.insertBefore(cbFlip, rf.firstChild);
    container.appendChild(rf);
    campos.flip = cbFlip;

    if (usaFn(cat)) {
      var opcoesSeq = [['auto', 'Auto']];
      for (var s = 1; s <= 9; s++) opcoesSeq.push([String(s), String(s)]);
      var sSeq = select(doc, 'seq', opcoesSeq);
      sSeq.addEventListener('change', function () {
        var n = parseInt(sSeq.value, 10);
        emit(ctx, 'seq', n >= 1 && n <= 9 ? n : null);
      });
      container.appendChild(row(doc, 'seq', 'Sequência dos bornes', sSeq));
      campos.seq = sSeq;
    }

    /* bornes, referencia cruzada, avisos */
    var der = el(doc, 'div', { 'class': 'prop-derived' });
    container.appendChild(der);

    /* campos por tipo */
    if (comp.sym === 'lamp') {
      var sCor = select(doc, 'color', CORES);
      sCor.addEventListener('change', function () { emit(ctx, 'color', sCor.value); });
      container.appendChild(row(doc, 'color', 'Cor (lâmpada)', sCor));
      campos.color = sCor;
    }
    var tc = isTimerContact(comp.sym);
    if (tc || isTimerCoil(comp.sym)) {
      var inT = controle(doc, 'input', 'time', { type: 'number', min: '0', max: String(T_MAX), step: '0.1', inputmode: 'decimal' });
      inT.addEventListener('input', function () {
        var v = inT.value;
        var n = typeof v === 'number' ? v : (String(v).trim() === '' ? NaN : parseFloat(v));
        if (isFinite(n) && n >= 0 && n <= T_MAX) { inT.removeAttribute('aria-invalid'); emit(ctx, 'time', n); } else inT.setAttribute('aria-invalid', 'true');
      });
      container.appendChild(row(doc, 'time', 'Tempo T (s)', inT));
      campos.time = inT;
    }
    if (tc) {
      var sModo = select(doc, 'timer-mode', MODOS);
      sModo.addEventListener('change', function () { emit(ctx, 'timerMode', sModo.value); });
      container.appendChild(row(doc, 'timer-mode', 'Modo do temporizador', sModo));
      campos.timerMode = sModo;
    }
    var sEst = select(doc, 'force-state', ESTADOS);
    sEst.addEventListener('change', function () { emit(ctx, 'forceState', sEst.value); });
    container.appendChild(row(doc, 'force-state', 'Estado inicial', sEst));
    campos.forceState = sEst;

    var st = { sym: comp.sym, campos: campos, der: der, ctx: ctx, doc: doc };
    guardar(container, st);
    atualizar(container, comp, st);
  }

  function foco(doc, n) { return !!doc && doc.activeElement === n; }
  function poe(doc, n, v) { if (n && !foco(doc, n) && n.value !== v) n.value = v; }

  function atualizar(container, comp, st) {
    var c = st.campos, ctx = st.ctx, doc = st.doc;
    poe(doc, c.id, typeof comp.id === 'string' ? comp.id : '');
    poe(doc, c.label, typeof comp.label === 'string' ? comp.label : '');
    poe(doc, c.rot, String(ROTS.indexOf(comp.rot) >= 0 ? comp.rot : 0));
    if (c.flip && !foco(doc, c.flip)) c.flip.checked = comp.flip === true;
    if (c.seq) poe(doc, c.seq, typeof comp.seq === 'number' && comp.seq >= 1 && comp.seq <= 9 ? String(comp.seq) : 'auto');
    if (c.color) poe(doc, c.color, comp.color || 'green');
    if (c.time) { var t = typeof comp.time === 'number' ? comp.time : parseFloat(comp.time); poe(doc, c.time, String(isFinite(t) ? t : 3)); }
    if (c.timerMode) poe(doc, c.timerMode, modoPadrao(comp, ctx));
    if (c.forceState) poe(doc, c.forceState, comp.forceState || '');
    renderDerivados(doc, st.der, comp, ctx);
  }

  function update(container, comp, ctx) {
    var st = recuperar(container);
    if (!st || !isObj(comp)) { if (isObj(comp) && ctx) render(container, comp, ctx); return; }
    if (ctx) st.ctx = ctx;
    if (st.sym !== comp.sym) { render(container, comp, st.ctx); return; }
    atualizar(container, comp, st);
  }

  EO.editor.props = { render: render, update: update };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.props;
})(typeof window !== 'undefined' ? window : globalThis);
