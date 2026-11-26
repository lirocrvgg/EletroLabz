/* core/actionbar.js - comportamento da barra de acoes (.eo-actionbar, DESIGN_SYSTEM.md 7).
   - Mobile: cria o botao "Mais ações" (aria-expanded); Esc fecha e devolve o foco; clique fora fecha.
   - Menu "Exportar" (.eo-ab-menu): botao com aria-haspopup/aria-expanded, setas navegam, Esc fecha.
   - Hidrata <i data-eo-icon=nome></i> inseridos por JS (icones no lugar de emojis).
   - Nao altera handlers: os botoes da barra mantem os onclick originais.
   Script classico (sem modulos ES), seguro em file:// e http. EO.actionbar.init(raiz) para barras criadas por JS. */
window.EO = window.EO || {};
(function (EO) {
  'use strict';
  var seq = 0;
  var mq = window.matchMedia ? window.matchMedia('(max-width: 640px)') : null;
  var SEL = 'button, a[href], label.btn';

  function items(list) {
    return Array.prototype.filter.call(list.querySelectorAll(SEL), function (e) {
      return !e.disabled && e.getAttribute('aria-disabled') !== 'true';
    });
  }
  function focusable(el) { return el.tagName === 'LABEL' ? (el.querySelector('input') || el) : el; }

  function closeMenu(menu, ret) {
    if (!menu.classList.contains('is-open')) { return; }
    menu.classList.remove('is-open');
    var b = menu.querySelector('.eo-ab-menu-btn');
    if (b) { b.setAttribute('aria-expanded', 'false'); if (ret) { b.focus(); } }
  }
  function closeBar(bar, ret) {
    bar.classList.remove('is-open');
    var m = bar.querySelector('.eo-ab-more');
    if (m) { m.setAttribute('aria-expanded', 'false'); if (ret) { m.focus(); } }
  }
  function closeAll(bar, ret) {
    Array.prototype.forEach.call(bar.querySelectorAll('.eo-ab-menu'), function (m) { closeMenu(m, false); });
    closeBar(bar, ret);
  }

  function enhance(bar) {
    if (bar.getAttribute('data-eo-enh')) { return; }
    bar.setAttribute('data-eo-enh', '1');
    var id = 'eo-ab-' + (++seq);
    var primary = bar.querySelector('.eo-ab-primary');
    /* grupos sem acao secundaria nao precisam de rotulo no menu mobile */
    Array.prototype.forEach.call(bar.querySelectorAll('.eo-ab-group'), function (g) {
      var others = Array.prototype.filter.call(g.querySelectorAll(SEL), function (e) { return e !== primary; });
      if (!others.length) { g.classList.add('eo-ab-group--solo'); }
    });
    var hasOthers = bar.querySelectorAll(SEL).length > (primary ? 1 : 0);
    if (hasOthers) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'btn secondary eo-ab-more';
      more.id = id + '-more';
      more.setAttribute('aria-expanded', 'false');
      more.setAttribute('data-eo-action', (bar.getAttribute('data-eo-module') || document.body.getAttribute('data-eo-module') || 'ui') + ':more-actions');
      more.innerHTML = (EO.icon ? EO.icon('ellipsis') : '') + '<span>Mais ações</span>';
      more.addEventListener('click', function () {
        var open = !bar.classList.contains('is-open');
        bar.classList.toggle('is-open', open);
        more.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          var first = null;
          var all = bar.querySelectorAll('.eo-ab-group button, .eo-ab-group a[href], .eo-ab-group label.btn');
          for (var i = 0; i < all.length; i++) {
            if (all[i] !== primary && all[i].offsetParent !== null && !all[i].disabled) { first = all[i]; break; }
          }
          if (first) { focusable(first).focus(); }
        }
      });
      bar.appendChild(more);
    }
    bar.classList.add('is-enh');

    Array.prototype.forEach.call(bar.querySelectorAll('.eo-ab-menu'), function (menu) {
      var btn = menu.querySelector('.eo-ab-menu-btn');
      var list = menu.querySelector('.eo-ab-menu-list');
      if (!btn || !list) { return; }
      list.id = list.id || (id + '-list-' + (++seq));
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', list.id);
      btn.addEventListener('click', function () {
        var open = !menu.classList.contains('is-open');
        Array.prototype.forEach.call(bar.querySelectorAll('.eo-ab-menu'), function (m) { if (m !== menu) { closeMenu(m, false); } });
        menu.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) { var its = items(list); if (its.length) { focusable(its[0]).focus(); } }
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' && !menu.classList.contains('is-open')) { e.preventDefault(); btn.click(); }
      });
      list.addEventListener('keydown', function (e) {
        var its = items(list); var i = its.indexOf(document.activeElement);
        if (!its.length) { return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); focusable(its[(i + 1) % its.length]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); focusable(its[(i - 1 + its.length) % its.length]).focus(); }
        else if (e.key === 'Home') { e.preventDefault(); focusable(its[0]).focus(); }
        else if (e.key === 'End') { e.preventDefault(); focusable(its[its.length - 1]).focus(); }
      });
      /* depois de acionar um item, fecha o menu (o onclick do item ja rodou) */
      list.addEventListener('click', function (e) {
        if (e.target.closest(SEL)) { setTimeout(function () { closeMenu(menu, false); }, 0); }
      });
    });

    bar.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') { return; }
      var openMenu = bar.querySelector('.eo-ab-menu.is-open');
      if (openMenu) { e.stopPropagation(); closeMenu(openMenu, true); }
      else if (bar.classList.contains('is-open')) { e.stopPropagation(); closeBar(bar, true); }
    });
    /* no mobile, acionar qualquer item (exceto o proprio "Mais ações") recolhe o painel */
    bar.addEventListener('click', function (e) {
      var t = e.target.closest(SEL);
      if (!t || t.classList.contains('eo-ab-more') || t.classList.contains('eo-ab-menu-btn')) { return; }
      if (bar.classList.contains('is-open')) { setTimeout(function () { closeBar(bar, false); }, 0); }
    });
  }

  document.addEventListener('click', function (e) {
    Array.prototype.forEach.call(document.querySelectorAll('.eo-actionbar'), function (bar) {
      if (bar.contains(e.target)) { return; }
      closeAll(bar, false);
    });
  });
  if (mq) {
    var onChange = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.eo-actionbar'), function (bar) { closeAll(bar, false); });
    };
    if (mq.addEventListener) { mq.addEventListener('change', onChange); } else if (mq.addListener) { mq.addListener(onChange); }
  }

  /* Icones em HTML gerado por JS: <i data-eo-icon=nome></i> (sem aspas, vale em qualquer string) vira o SVG do conjunto. */
  function hydrate(root) {
    if (!EO.icon || !root || root.nodeType !== 1) { return; }
    var els = root.matches && root.matches('[data-eo-icon]:empty') ? [root] : [];
    var inner = root.querySelectorAll ? root.querySelectorAll('[data-eo-icon]:empty') : [];
    for (var i = 0; i < inner.length; i++) { els.push(inner[i]); }
    for (var j = 0; j < els.length; j++) { els[j].innerHTML = EO.icon(els[j].getAttribute('data-eo-icon')); }
  }
  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var added = muts[m].addedNodes;
        for (var k = 0; k < added.length; k++) { hydrate(added[k]); }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  EO.actionbar = {
    init: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll('.eo-actionbar'), enhance);
      hydrate(root || document.body);
    }
  };
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function () { EO.actionbar.init(); }); }
  else { EO.actionbar.init(); }
})(window.EO);
