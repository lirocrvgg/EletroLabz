/* render/ladder-svg.js - STUB (Fase 4, etapa 4.0). Implementacao real na etapa 4.3.
 * Nenhuma pagina carrega este arquivo ainda. Nao ha efeito na carga alem de registrar o namespace.
 *
 * API planejada (docs/PLANO_FASE4.md, secoes 2 e 5):
 *   EO.render.ladderSvg.programToSVG(rungs, st, {tema}) -> string
 *       SVG autonomo do programa Ladder (st = estado de simulacao ou null): sem foreignObject, sem fontes
 *       externas, cores hex ja resolvidas a partir do tema, fonte monospace; todo texto de usuario escapado
 *       (EO.dom.esc).
 *   EO.render.ladderSvg.toPNG(svg, escala = 2) -> Promise<Blob>
 *       rasteriza o SVG (data URL -> canvas escala 2 -> toBlob). SecurityError (file://) deve virar mensagem clara.
 * Substitui ladderExportPNG (html2canvas) de legacy/ladder.js. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.render = EO.render || {};

  function naoImpl() { throw new Error('nao implementado (etapa 4.3)'); }

  EO.render.ladderSvg = { programToSVG: naoImpl, toPNG: naoImpl, implementado: false };
  if (typeof module !== 'undefined') module.exports = EO.render.ladderSvg;
})(typeof window !== 'undefined' ? window : globalThis);
