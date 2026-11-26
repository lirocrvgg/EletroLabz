/* core/nav.js - navegacao do EletroLabz (Fase 3).
   - Entrada do modulo (substitui o bloco inline URLS/HERE/enterHere/enterModule/showModuleSelector).
   - Rotas por hash por subpagina (elet.html#rl, aciona.html#ladder): envolve (nao reescreve) a funcao de troca
     de pagina de cada modulo; voltar/avancar do navegador troca de subpagina sem sair do modulo.
   - Breadcrumb "Inicio > Educacao|Profissional > Modulo > Subpagina" e aria-current na subpagina ativa.
   Script classico (sem modulos ES, sem fetch): funciona em file:// e http. Carregar por ULTIMO no <body>.
   Configuracao: <body data-eo-module="elet" data-eo-area="educacao">. */
window.EO = window.EO || {};
(function (EO) {
  'use strict';

  var HUB = 'eletrotec.html';
  var URLS = { elet: 'elet.html', aciona: 'aciona.html', predial: 'predial.html', industrial: 'industrial.html', ia: 'ia.html', distrib: 'distrib.html', sobre: 'sobre.html', apostilas: 'apostilas.html', praticar: 'praticar.html', documentacao: 'documentacao.html', plugin: 'plugin.html' };
  var PAGE_LABELS = { plugin: 'Plugin para Revit' };  /* paginas de uma tela, sem abas, dentro de uma area (rotulo da trilha) */
  var AREAS = { educacao: 'Educação', profissional: 'Profissional', documentacao: 'Documentação' };

  /* fn = funcao global de troca de pagina do modulo; home = id da pagina inicial (sem hash);
     routes = [slug, id da pagina, id do bloco que precisa estar visivel (opcional)]. */
  var MODS = {
    elet: { label: 'Eletricidade II', fn: 'showPage', home: 'home', routes: [
      ['rl', 'rl'], ['rc', 'rc'], ['rlc', 'rlc'], ['fasores', 'fasores'], ['trifasico', 'trifasico'],
      ['ydelta', 'ydelta'], ['complexos', 'complexos'], ['cfp', 'cfp'], ['calc', 'calc']] },
    aciona: { label: 'Acionamentos', fn: 'showAcionaPage', home: 'aciona-home', routes: [
      ['diagrama', 'diagram'], ['referencia', 'aciona-ref'], ['ladder', 'ladder']] },
    ia: { label: 'IA', fn: 'showIAPage', home: 'ia-mcp', routes: [] },
    predial: { label: 'Projetos Prediais', fn: 'showPredialPage', home: 'predial-selector', routes: [
      ['comodos', 'predial-home'], ['circuitos', 'predial-circ', 'circ-sub-single'],
      ['circuitos-multiplos', 'predial-circ', 'circ-sub-multi'], ['planta', 'predial-planta'],
      ['luminotecnica', 'predial-lumi'], ['quadros', 'predial-quadros']] },
    industrial: { label: 'Projetos Industriais', fn: 'showIndustrialPage', home: 'ind-home', routes: [
      ['motores', 'ind-motor'], ['transformadores', 'ind-trafo'], ['protecoes', 'ind-protecao'],
      ['alimentadores', 'ind-alimentador'], ['demanda', 'ind-demanda'], ['subestacao', 'ind-subestacao'], ['ccm', 'ind-ccm']] },
    distrib: { label: 'Distribuição Elétrica', fn: 'showDistribPage', home: 'distrib-home', routes: [
      ['demanda', 'distrib-demanda'], ['padrao', 'distrib-padrao'], ['ramal', 'distrib-ramal'],
      ['aterramento', 'distrib-aterramento'], ['projeto', 'distrib-projeto']] },
    sobre: { label: 'Sobre', fn: 'showSobrePage', home: 'sobre-main', routes: [] },
    apostilas: { label: 'Apostilas', fn: 'showApostilasPage', home: 'apostilas-home', routes: [
      ['fundamentos', 'apostilas-fundamentos'], ['acionamentos', 'apostilas-acionamentos'], ['predial', 'apostilas-predial'],
      ['industrial', 'apostilas-industrial'], ['distribuicao', 'apostilas-distribuicao']] },
    praticar: { label: 'Praticar', fn: 'showPraticarPage', home: 'praticar-home', routes: [
      ['flashcards', 'flashcards'], ['quiz', 'quiz'], ['quiz/resultado', 'quiz-resultado']],
      labels: { 'quiz/resultado': 'Resultado do quiz' } }
  };

  var body = document.body;
  var MOD = body.getAttribute('data-eo-module') || '';
  var AREA = body.getAttribute('data-eo-area') || '';
  var cfg = MODS[MOD] || null;
  var applying = false;       /* true enquanto o roteador responde a voltar/avancar (nao empilha historico) */
  var lastPushTick = false;   /* varias trocas no mesmo tick viram uma so entrada de historico */
  var crumbsEl = null;

  function $(s, r) { return (r || document).querySelector(s); }
  function clean(t) { return (t || '').replace(/\s+/g, ' ').trim(); }
  function readHash() {
    var h = location.hash ? location.hash.slice(1) : '';
    try { h = decodeURIComponent(h); } catch (e) { /* mantem cru */ }
    return h;
  }

  /* ── tabela de rotas ── */
  function routeBySlug(slug) {
    if (!cfg || !slug) { return null; }
    for (var i = 0; i < cfg.routes.length; i++) { if (cfg.routes[i][0] === slug) { return cfg.routes[i]; } }
    for (var j = 0; j < cfg.routes.length; j++) { if (cfg.routes[j][1] === slug) { return cfg.routes[j]; } } /* alias: id cru */
    return null;
  }
  function hidden(id) { var el = document.getElementById(id); return !el || el.style.display === 'none'; }
  /* Slug do estado real da tela ('' = pagina inicial do modulo). */
  function currentSlug() {
    var act = $('#main-' + MOD + ' .page.active');
    if (!act) { return ''; }
    var id = act.id.replace(/^page-/, '');
    if (id === cfg.home) { return ''; }
    var first = null;
    for (var i = 0; i < cfg.routes.length; i++) {
      var r = cfg.routes[i];
      if (r[1] !== id) { continue; }
      if (!first) { first = r; }
      if (r[2] && !hidden(r[2])) { return r[0]; }
    }
    return first ? first[0] : '';
  }

  /* ── historico ── */
  function writeHash(slug, replace) {
    var url = location.pathname + location.search + (slug ? '#' + slug : '');
    var asReplace = replace || lastPushTick;
    try {
      if (asReplace) { history.replaceState(null, '', url); } else { history.pushState(null, '', url); }
    } catch (e) {
      /* alguns navegadores bloqueiam pushState em file://: cai para location.hash (dispara hashchange, idempotente) */
      if (asReplace) { location.replace('#' + slug); } else { location.hash = slug; }
    }
    if (!replace) { lastPushTick = true; setTimeout(function () { lastPushTick = false; }, 0); }
  }
  function sync(initial) {
    if (!cfg || !cfg.routes.length) { updateUI(); return; }
    if (!applying) {
      var want = currentSlug();
      var have = readHash();
      var haveRoute = routeBySlug(have);
      var haveSlug = haveRoute ? haveRoute[0] : '';
      if (initial) { if (want !== haveSlug || (have && !haveRoute)) { writeHash(want, true); } }
      else if (want !== haveSlug) { writeHash(want, false); }
    }
    updateUI();
  }
  function showFn() { return window[cfg.fn]; }
  /* Aplica o hash atual na tela (sem escrever historico). */
  function applyHash() {
    var r = routeBySlug(readHash());
    var wantSlug = r ? r[0] : '';
    if (currentSlug() === wantSlug) { updateUI(); return; }
    applying = true;
    try {
      showFn()(r ? r[1] : cfg.home, null);
      if (r && r[2] && typeof window.showCircSubPage === 'function') { window.showCircSubPage(r[2]); }
    } finally { applying = false; }
    updateUI();
  }

  /* ── breadcrumb / aria-current ── */
  function crumbItem(label, href, current, onclick) {
    var li = document.createElement('li');
    if (current) {
      var s = document.createElement('span'); s.textContent = label; s.setAttribute('aria-current', 'page'); li.appendChild(s);
    } else {
      var a = document.createElement('a'); a.href = href; a.textContent = label;
      if (onclick) { a.addEventListener('click', onclick); }
      li.appendChild(a);
    }
    return li;
  }
  function updateUI() {
    var navEl = cfg ? document.getElementById('nav-' + MOD) : null;
    var tabs = navEl ? navEl.querySelectorAll('.nav-btn') : [];
    var activeTab = null;
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].classList.contains('active')) { tabs[i].setAttribute('aria-current', 'page'); activeTab = tabs[i]; }
      else { tabs[i].removeAttribute('aria-current'); }
    }
    if (activeTab && activeTab.scrollIntoView) {
      try { activeTab.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* sem opcoes */ }
    }
    if (!crumbsEl) { return; }
    var list = crumbsEl.querySelector('ol');
    if (!list) { return; }
    list.textContent = '';
    var onHub = MOD === 'hub';
    var subLabel = '';
    var slug = cfg ? currentSlug() : '';
    if (cfg && slug) { subLabel = (cfg.labels && cfg.labels[slug]) || clean(activeTab ? activeTab.textContent : '') || slug; }
    list.appendChild(crumbItem('Início', HUB, onHub));
    if (onHub) { return; }
    if (!cfg && MOD === AREA && AREAS[AREA]) {
      /* pagina da propria area (ex.: documentacao.html): "Inicio > Area", o item da area e a pagina atual */
      list.appendChild(crumbItem(AREAS[AREA], HUB + '#' + AREA, true));
      return;
    }
    if (AREAS[AREA]) { list.appendChild(crumbItem(AREAS[AREA], HUB + '#' + AREA, false)); }
    list.appendChild(crumbItem(cfg ? cfg.label : (PAGE_LABELS[MOD] || MOD), URLS[MOD] || '#', !subLabel, function (ev) {
      /* ja estamos no modulo: volta a pagina inicial sem recarregar (preserva dados nao salvos) */
      if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button) { return; }
      if (!cfg) { return; }
      ev.preventDefault();
      showFn()(cfg.home, null);
    }));
    if (subLabel) { list.appendChild(crumbItem(subLabel, '#', true)); }
  }

  /* ── topbar/migracao de marcacao antiga ── */
  function setupChrome() {
    var navEl = document.getElementById('nav-' + MOD);
    if (navEl && window.ResizeObserver) {
      var setH = function () { document.documentElement.style.setProperty('--eo-nav-h', navEl.offsetHeight + 'px'); };
      new ResizeObserver(setH).observe(navEl); setH();
    }
    crumbsEl = $('.eo-crumbs');
    /* link "pular para o conteudo" */
    var main = $('#main-' + MOD) || $('main');
    if (main && !$('.eo-skip')) {
      if (!main.hasAttribute('tabindex')) { main.setAttribute('tabindex', '-1'); }
      var skip = document.createElement('a');
      skip.className = 'eo-skip'; skip.href = '#'; skip.textContent = 'Pular para o conteúdo';
      skip.addEventListener('click', function (ev) {
        ev.preventDefault();
        var m = $('#main-' + MOD) || $('main'); if (m) { m.focus(); m.scrollIntoView(); }
      });
      body.insertBefore(skip, body.firstChild);
    }
    /* Predial: o antigo botao "Voltar" da faixa de categorias duplicava "Modulos"; fica so a navegacao unificada */
    var catBack = $('#cat-ribbon .cat-back');
    if (catBack && catBack.parentNode) { catBack.parentNode.removeChild(catBack); }
    var ribbon = $('#cat-ribbon');
    if (ribbon && crumbsEl && crumbsEl.parentNode) { crumbsEl.parentNode.insertBefore(ribbon, crumbsEl.nextSibling); } /* breadcrumb acima da faixa */
  }

  /* ── instalacao das funcoes globais de entrada ── */
  function enterHere() {
    try { currentModule = MOD; } catch (e) { /* currentModule so existe com core.js */ }
    var navEl = document.getElementById('nav-' + MOD), main = document.getElementById('main-' + MOD);
    if (navEl) { navEl.style.display = 'block'; }
    if (main) { main.style.display = 'block'; }
    var r = routeBySlug(readHash());
    var f = showFn();
    applying = true;
    try {
      f(r ? r[1] : cfg.home, null);
      if (r && r[2] && typeof window.showCircSubPage === 'function') { window.showCircSubPage(r[2]); }
    } finally { applying = false; }
    sync(true);
  }
  function installGlobals() {
    if (MOD === 'hub') {
      window.enterModule = function (mod) { if (URLS[mod]) { location.href = URLS[mod]; } };
      window.showModuleSelector = function () {
        var ms = document.getElementById('module-selector');
        if (ms) { ms.classList.remove('hidden'); }
      };
    } else {
      window.enterModule = function (mod) { if (mod === MOD) { enterHere(); } else if (URLS[mod]) { location.href = URLS[mod]; } };
      window.showModuleSelector = function () { location.href = HUB; };
    }
  }
  function wrap(name) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig.__eoNav) { return; }
    var w = function () { var res = orig.apply(this, arguments); sync(false); return res; };
    w.__eoNav = true;
    window[name] = w;
  }

  function init() {
    installGlobals();
    setupChrome();
    if (!cfg) { updateUI(); return; }
    wrap(cfg.fn);
    if (MOD === 'predial') { wrap('showCircSubPage'); }
    window.addEventListener('popstate', applyHash);
    window.addEventListener('hashchange', applyHash);
    enterHere();
  }

  /* troca de pagina sem criar entrada no historico (ex.: rota que exige estado inexistente) */
  function replace(slug) {
    if (!cfg) { return; }
    var r = routeBySlug(slug);
    applying = true;
    try { showFn()(r ? r[1] : cfg.home, null); } finally { applying = false; }
    writeHash(r ? r[0] : '', true);
    updateUI();
  }

  EO.nav = { replace: replace, slug: currentSlug, go: function (slug) { var r = routeBySlug(slug); if (r) { showFn()(r[1], null); if (r[2]) { window.showCircSubPage(r[2]); } } else { showFn()(cfg.home, null); } } };

  installGlobals();
  window.addEventListener('load', installGlobals);
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})(window.EO);

/* Interacao dos cards/abas (brilho por ponteiro, indicador deslizante): carregado junto com a navegacao,
   assim todos os modulos (inclusive os que nao listam depth.js no HTML) recebem o efeito. */
(function () {
  var cs = document.currentScript;
  if (!cs || !cs.src || document.querySelector('script[data-eo-depth]')) { return; }
  var s = document.createElement('script');
  s.src = cs.src.replace(/nav\.js(\?.*)?$/, 'depth.js'); s.async = false; s.setAttribute('data-eo-depth', '');
  document.body.appendChild(s);
})();
