/* core/theme.js - tema claro/escuro. Carregar no <head>, ANTES dos CSS (evita flash).
   Persistencia: localStorage 'eo_theme' ('light'|'dark'); sem escolha salva = prefers-color-scheme.
   Mantem as globais legadas toggleTheme() e isDark (canvases de aciona.js leem isDark). */
window.EO = window.EO || {};
(function (EO) {
  var KEY = 'eo_theme';
  var root = document.documentElement;

  function stored() {
    try { var v = localStorage.getItem(KEY); return (v === 'dark' || v === 'light') ? v : null; } catch (e) { return null; }
  }
  function system() {
    return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function apply(theme) {
    var dark = theme === 'dark';
    root.classList.toggle('dark', dark);
    if (document.body) { document.body.classList.toggle('dark', dark); }
    window.isDark = dark;
    var btns = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', dark ? 'true' : 'false');
      btns[i].setAttribute('title', dark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
    }
  }

  EO.theme = {
    get: function () { return root.classList.contains('dark') ? 'dark' : 'light'; },
    set: function (theme, persist) {
      apply(theme);
      if (persist !== false) { try { localStorage.setItem(KEY, theme); } catch (e) { /* modo privado */ } }
    }
  };

  apply(stored() || system());
  document.addEventListener('DOMContentLoaded', function () { apply(EO.theme.get()); });

  /* Sem escolha explicita, acompanha mudancas do sistema. */
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var onSys = function () { if (!stored()) { apply(system()); if (typeof window.redrawActive === 'function') { window.redrawActive(); } } };
    if (mq.addEventListener) { mq.addEventListener('change', onSys); } else if (mq.addListener) { mq.addListener(onSys); }
  }
})(window.EO);

function toggleTheme() {
  EO.theme.set(EO.theme.get() === 'dark' ? 'light' : 'dark');
  setTimeout(function () { if (typeof redrawActive === 'function') { redrawActive(); } }, 50);
}
