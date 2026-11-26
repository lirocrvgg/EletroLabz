/* core/depth.js - interacao dos cards e abas (Fase 5 visual). Script classico, sem dependencias; funciona em file://.
   1) Brilho/inclinacao por ponteiro: em cards que levam a um projeto, grava --mx/--my (brilho direcional) e
      --rx/--ry (inclinacao maxima = --tilt) enquanto o mouse esta sobre o card. Somente mouse/caneta (nao toque) e
      desligado com prefers-reduced-motion. O CSS anima apenas transform/opacity/box-shadow.
   2) Indicador deslizante (.eo-ink): uma barra de 2px que desliza ate a aba ativa (nav-btn/tab/predial-tab/cat-btn).
      Sem JS, o CSS cai para uma barra que cresce do centro. */
(function () {
  'use strict';
  var CARD = '.hub a.hub-card, a.hero-card, a.aciona-card, .hero-card, .aciona-card, a.eo-sel-card';
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var mqFine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };

  /* ── 1) ponteiro ── */
  var cur = null, raf = 0, last = null;
  function apply() {
    raf = 0;
    if (!cur || !last) { return; }
    var r = cur.getBoundingClientRect();
    if (!r.width || !r.height) { return; }
    var px = (last.x - r.left) / r.width, py = (last.y - r.top) / r.height;
    px = Math.max(0, Math.min(1, px)); py = Math.max(0, Math.min(1, py));
    var t = parseFloat(getComputedStyle(cur).getPropertyValue('--tilt')) || 0;
    cur.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    cur.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    cur.style.setProperty('--ry', ((px - 0.5) * 2 * t).toFixed(2) + 'deg');
    cur.style.setProperty('--rx', ((0.5 - py) * 2 * t).toFixed(2) + 'deg');
  }
  function reset(el) {
    ['--rx', '--ry'].forEach(function (p) { el.style.removeProperty(p); });
  }
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' || mqReduce.matches || !mqFine.matches) { return; }
    var el = e.target && e.target.closest ? e.target.closest(CARD) : null;
    if (el !== cur) { if (cur) { reset(cur); } cur = el; }
    if (!cur) { return; }
    last = { x: e.clientX, y: e.clientY };
    if (!raf) { raf = requestAnimationFrame(apply); }
  }, { passive: true });
  document.addEventListener('pointerout', function (e) {
    if (cur && (!e.relatedTarget || !cur.contains(e.relatedTarget))) { reset(cur); cur = null; }
  }, { passive: true });

  /* ── 2) indicador deslizante ── */
  var HOSTS = '.nav-inner, .tabs, .predial-tabs, #cat-ribbon .cat-btns';
  var ITEMS = ':scope > .nav-btn, :scope > .tab, :scope > .predial-tab, :scope > .cat-btn';
  var inks = [];
  /* classList.add/remove regravam o atributo mesmo sem mudanca e disparam o MutationObserver: so mexe se mudar */
  function setOn(ink, on) { if (ink.classList.contains('is-on') !== on) { ink.classList.toggle('is-on', on); } }
  function place(host, ink, first) {
    var act = host.querySelector(':scope > .active');
    if (!act || !act.matches(ITEMS.replace(/:scope > /g, '')) || !act.offsetParent && act.getClientRects().length === 0) {
      setOn(ink, false); return;
    }
    var w = act.offsetWidth, x = act.offsetLeft, y = act.offsetTop + act.offsetHeight - 2;
    if (!w) { setOn(ink, false); return; }
    var pad = host.classList.contains('nav-inner') || host.classList.contains('cat-btns') ? 8 : 0;
    ink.style.setProperty('--ink-x', (x + pad) + 'px');
    ink.style.setProperty('--ink-y', y + 'px');
    ink.style.setProperty('--ink-w', Math.max(0, w - pad * 2));
    setOn(ink, true);
    if (first) { requestAnimationFrame(function () { requestAnimationFrame(function () { if (!ink.classList.contains('is-ready')) { ink.classList.add('is-ready'); } }); }); }
  }
  function attach(host) {
    if (host.__eoInk) { return; }
    var ink = document.createElement('span');
    ink.className = 'eo-ink'; ink.setAttribute('aria-hidden', 'true');
    host.appendChild(ink); host.classList.add('has-ink'); host.__eoInk = ink;
    var upd = function () { place(host, ink, !ink.classList.contains('is-ready')); };
    inks.push(upd);
    if (window.MutationObserver) {
      new MutationObserver(upd).observe(host, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true });
    }
    if (window.ResizeObserver) { new ResizeObserver(upd).observe(host); }
    upd();
  }
  function scan() { Array.prototype.forEach.call(document.querySelectorAll(HOSTS), attach); }
  function boot() {
    scan();
    window.addEventListener('resize', function () { inks.forEach(function (f) { f(); }); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { inks.forEach(function (f) { f(); }); }); }
    if (window.MutationObserver) {
      var pend = false;
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) { if (ms[i].addedNodes.length) { if (!pend) { pend = true; requestAnimationFrame(function () { pend = false; scan(); }); } return; } }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
