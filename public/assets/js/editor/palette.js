/* editor/palette.js - paleta de simbolos e referencia gerada a partir do catalogo (Acionamentos v2, E4a).
 * Nao e carregado por nenhuma pagina ainda (a E4b liga ao selectSymbol e ao #diag-toolbar).
 *
 * API (EO.editor.palette)
 *   renderPalette(el, ctx)    monta, por categoria do catalogo, button.sym-btn com data-eo-action="aciona:diagrama-simbolo-<id-com-hifens>",
 *                             title = nome do catalogo, SVG de symbols.toSVG, texto do nome e aria-pressed. Clique: ctx.select(id, btn).
 *                             Nao mostra a categoria interna "Ligacao" (junction) nem entradas com oculto=true.
 *                             Devolve {buttons: Map(id -> button), setSelected(id|null), ids: [...]}.
 *   renderReference(el, ctx)  gera a referencia por categoria (SVG em repouso e atuado, nome, letra, bornes, descricao) e a secao
 *                             "Equivalencia ANSI/IEEE 315 (informativa)" com um conteiner vazio (data-eo-ref="ansi") para a E5.
 *                             Devolve {ansi: elemento, ids: [...]}.
 *   visiveis(symbols)         [{categoria, itens:[entrada do catalogo]}] usado pelas duas.
 * ctx = {select(id, btn), selected?, document?, symbols?}   symbols = EO.render.symbols (padrao: o global).
 * Texto vindo do catalogo entra por textContent/atributo; o unico innerHTML e o SVG gerado por toSVG (que escapa o nome). */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.editor = EO.editor || {};

  var DASH = '–';
  var OCULTAS = { 'Ligação': true };

  function symbols(ctx) {
    if (ctx && ctx.symbols) return ctx.symbols;
    if (EO.render && EO.render.symbols) return EO.render.symbols;
    if (typeof require === 'function') { try { return require('../render/symbols.js'); } catch (e) { /* sem simbolos */ } }
    return null;
  }
  function docDe(el, ctx) { return el.ownerDocument || (ctx && ctx.document) || (typeof document !== 'undefined' ? document : null); }
  function limpar(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function mk(doc, tag, attrs, text) {
    var n = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function visiveis(sym) {
    var cat = sym.catalog();
    var porId = {};
    cat.forEach(function (e) { porId[e.id] = e; });
    var out = [];
    sym.categorias().forEach(function (c) {
      if (Object.prototype.hasOwnProperty.call(OCULTAS, c.nome)) return;
      var itens = c.ids.map(function (id) { return porId[id]; }).filter(function (e) { return e && !e.oculto; });
      if (itens.length) out.push({ categoria: c.nome, itens: itens });
    });
    return out;
  }

  function svgEm(doc, wrapper, svg) { wrapper.innerHTML = svg; return wrapper; }

  function renderPalette(el, ctx) {
    ctx = ctx || {};
    var sym = symbols(ctx);
    var doc = docDe(el, ctx);
    limpar(el);
    var botoes = new Map();
    var ids = [];
    visiveis(sym).forEach(function (g) {
      var sec = mk(doc, 'div', { 'class': 'diag-toolbar-section', role: 'group', 'aria-label': g.categoria });
      sec.appendChild(mk(doc, 'h4', null, g.categoria));
      var grade = mk(doc, 'div', { 'class': 'sym-grid' });
      g.itens.forEach(function (e) {
        var b = mk(doc, 'button', {
          type: 'button', 'class': 'sym-btn', title: e.nome, 'aria-pressed': ctx.selected === e.id ? 'true' : 'false',
          'data-eo-action': 'aciona:diagrama-simbolo-' + e.id.replace(/_/g, '-'), 'data-eo-symbol-id': e.id
        });
        var ico = mk(doc, 'span', { 'class': 'sym-ico', 'aria-hidden': 'true', style: 'display:flex;justify-content:center' });
        svgEm(doc, ico, sym.toSVG(e.id, { numeracao: false }));
        b.appendChild(ico);
        b.appendChild(mk(doc, 'span', null, e.nome));
        b.addEventListener('click', function () {
          api.setSelected(e.id);
          if (typeof ctx.select === 'function') ctx.select(e.id, b);
        });
        grade.appendChild(b);
        botoes.set(e.id, b);
        ids.push(e.id);
      });
      sec.appendChild(grade);
      el.appendChild(sec);
    });
    var api = {
      buttons: botoes,
      ids: ids,
      setSelected: function (id) {
        botoes.forEach(function (b, k) { b.setAttribute('aria-pressed', k === id ? 'true' : 'false'); });
      }
    };
    return api;
  }

  function bornesTexto(e) {
    var fn = false;
    var nomes = e.terminais.map(function (t) { if (t.fn) { fn = true; return '1' + t.fn; } return t.n; });
    var s = nomes.length === 2 ? nomes[0] + DASH + nomes[1] : nomes.join(' · ');
    return s + (fn ? ' (o primeiro dígito é a sequência do contato)' : '');
  }

  function renderReference(el, ctx) {
    ctx = ctx || {};
    var sym = symbols(ctx);
    var doc = docDe(el, ctx);
    limpar(el);
    var ids = [];
    visiveis(sym).forEach(function (g) {
      var sec = mk(doc, 'section', { 'class': 'ref-cat', 'aria-label': g.categoria });
      sec.appendChild(mk(doc, 'h3', null, g.categoria));
      var lista = mk(doc, 'div', { 'class': 'ref-grid' });
      g.itens.forEach(function (e) {
        var card = mk(doc, 'article', { 'class': 'ref-card', 'data-eo-symbol-id': e.id });
        card.appendChild(mk(doc, 'h4', null, e.nome));
        var fig = mk(doc, 'div', { 'class': 'ref-figs' });
        var atuado = { energizado: true };
        if (g.categoria === 'Comando') atuado.estado = 'fechado';
        [['Repouso', { numeracao: true }], ['Atuado', Object.assign({ numeracao: true }, atuado)]].forEach(function (p) {
          var f = mk(doc, 'figure', { 'class': 'ref-fig' });
          var ico = mk(doc, 'span', { 'class': 'ref-ico', 'aria-hidden': 'true' });
          svgEm(doc, ico, sym.toSVG(e.id, p[1]));
          f.appendChild(ico);
          f.appendChild(mk(doc, 'figcaption', null, p[0]));
          fig.appendChild(f);
        });
        card.appendChild(fig);
        card.appendChild(mk(doc, 'p', { 'class': 'ref-letra' }, 'Letra: ' + (e.letra ? e.letra + (e.letraConfirmada ? '' : ' (a confirmar)') : '—')));
        card.appendChild(mk(doc, 'p', { 'class': 'ref-bornes' }, 'Bornes: ' + bornesTexto(e)));
        card.appendChild(mk(doc, 'p', { 'class': 'ref-desc' }, e.descricao));
        lista.appendChild(card);
        ids.push(e.id);
      });
      sec.appendChild(lista);
      el.appendChild(sec);
    });
    var ansi = mk(doc, 'section', { 'class': 'ref-ansi', 'aria-label': 'Equivalência ANSI/IEEE 315 (informativa)' });
    ansi.appendChild(mk(doc, 'h3', null, 'Equivalência ANSI/IEEE 315 (informativa)'));
    var corpo = mk(doc, 'div', { 'class': 'ref-ansi-body', 'data-eo-ref': 'ansi' });
    ansi.appendChild(corpo);
    el.appendChild(ansi);
    return { ansi: corpo, ids: ids };
  }

  EO.editor.palette = { renderPalette: renderPalette, renderReference: renderReference, visiveis: visiveis };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.editor.palette;
})(typeof window !== 'undefined' ? window : globalThis);
