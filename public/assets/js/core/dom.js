/* core/dom.js - utilitarios de DOM seguros (Fase 4, etapa 4.0).
 * EO.dom.esc(s)     : escapa texto para interpolar em innerHTML (& < > " ').
 * EO.dom.escAttr(s) : escapa para valor de atributo HTML (mesmo conjunto; tambem neutraliza crases,
 *                     quebras de linha e NUL, que alguns parsers legados tratam como delimitadores).
 * Aceitam qualquer tipo: null/undefined -> ''; demais -> String(valor). Sem efeito na carga. */
(function (root) {
  var EO = root.EO = root.EO || {};
  var MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function str(v) {
    if (v === null || v === undefined) return '';
    try { return String(v); } catch (e) { return ''; }
  }
  function esc(s) {
    return str(s).replace(/[&<>"']/g, function (ch) { return MAPA[ch]; });
  }
  function escAttr(s) {
    return esc(s)
      .replace(/`/g, '&#96;')
      .replace(/\r/g, '&#13;')
      .replace(/\n/g, '&#10;')
      .replace(/\u0000/g, '');
  }

  EO.dom = { esc: esc, escAttr: escAttr };
  if (typeof module !== 'undefined') module.exports = EO.dom;
})(typeof window !== 'undefined' ? window : globalThis);
