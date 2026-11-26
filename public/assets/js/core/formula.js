/* core/formula.js - componente "Formula explicada" (DESIGN_SYSTEM.md secao 8).
 * Script classico (sem modulos, sem fetch). Depende apenas do DOM; MathJax e opcional.
 * API: EO.formulas.register(def) | mount(container, id, {aberto}) | bind(id) | mountAll() | atualizar(id)
 * def = { id, modulo, titulo, proposito, tex, variaveis:[{simbolo, tex, nome, unidade, inputId?, saidaId?}],
 *         passos:(valores)=>[{rotulo?, tex|texto, saidaId?, esperado?}], observacoes:[...], referencia?, ler?:(ctx)=>valores,
 *         ouvir?:[ids extras], vazio?:'zero'|'nan' }
 * Os valores sao lidos por `simbolo` (chave do objeto) a partir de variaveis[].inputId. */
(function (root) {
  'use strict';
  var EO = root.EO = root.EO || {};
  if (EO.formulas && EO.formulas.__v) return;

  var defs = {}, instancias = [], ligados = {}, timers = {}, fila = Promise.resolve(), esperando = false;

  /* ---------- formatacao ---------- */
  // fix: string canonica (ponto decimal) igual a da calculadora (toFixed). Nao finito -> traco/infinito.
  function fix(v, casas) {
    if (typeof v !== 'number' || isNaN(v)) return '\u2014';
    if (v === Infinity || v === -Infinity) return v > 0 ? '\u221e' : '-\u221e';
    return v.toFixed(casas);
  }
  // g: numero de entrada, ate 6 algarismos significativos, sem zeros a direita.
  function g(v) {
    if (typeof v !== 'number' || isNaN(v)) return '\u2014';
    if (v === Infinity || v === -Infinity) return v > 0 ? '\u221e' : '-\u221e';
    return String(parseFloat(v.toPrecision(6)));
  }
  function ptbr(s) { return String(s).replace('.', ','); }
  function tn(s) { // string canonica -> TeX
    s = String(s);
    if (s === '\u2014') return '\\text{\u2014}';
    if (s === '\u221e') return '\\infty';
    if (s === '-\u221e') return '-\\infty';
    return s.replace(/e([+-]?\d+)$/i, '\\times 10^{$1}').replace('.', '{,}');
  }
  function tu(u) {
    if (!u) return '';
    var partes = String(u).match(/[\u03a9\u00b5\u03bc\u00b0]|[^\u03a9\u00b5\u03bc\u00b0]+/g) || [];
    return partes.map(function (p) {
      if (p === '\u03a9') return '\\Omega';
      if (p === '\u00b5' || p === '\u03bc') return '\\mu';
      if (p === '\u00b0') return '^{\\circ}';
      return '\\mathrm{' + p.replace(/ /g, '\\ ') + '}';
    }).join('');
  }
  function tv(s, unidade) { // valor + unidade (espaco fino)
    return tn(s) + (unidade ? (unidade === '\u00b0' ? '' : '\\,') + tu(unidade) : '');
  }

  /* ---------- DOM ---------- */
  function el(tag, cls, texto) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function tex(cls, t, bloco) { // no com TeX cru; delimitadores so entram na hora de tipografar
    var e = el('span', 'eo-tex' + (bloco ? ' eo-tex--bloco' : '') + (cls ? ' ' + cls : ''));
    e.setAttribute('data-tex', t);
    e.textContent = t;
    return e;
  }
  function temMJ() { return !!(root.MathJax && root.MathJax.typesetPromise); }
  function listaTex(no) { return Array.prototype.slice.call(no.querySelectorAll('.eo-tex')); }
  function prepararMJ(nos) {
    nos.forEach(function (n) {
      var t = n.getAttribute('data-tex'), b = n.classList.contains('eo-tex--bloco');
      n.textContent = b ? '\\[' + t + '\\]' : '\\(' + t + '\\)';
    });
  }
  // O cartao leva `tex2jax_ignore`: a tipografia automatica da pagina (MathJax startup) nao toca nele, e nao
  // confunde TeX cru (ex.: egin{aligned}) com matematica. Tipografamos apenas os nos .eo-tex, explicitamente.
  function tipografar(no, rootEl) {
    if (!temMJ()) { aguardarMJ(); return; }
    if (no.__eoPend) return; // ja ha uma tipografia agendada para este no
    no.__eoPend = true;
    fila = fila.then(function () {
      return root.MathJax.startup && root.MathJax.startup.promise; // aguarda a tipografia inicial da pagina
    }).then(function () {
      no.__eoPend = false;
      var nos = listaTex(no);
      if (!nos.length) return;
      if (root.MathJax.typesetClear) { try { root.MathJax.typesetClear(nos); } catch (e) { /* ignora */ } }
      prepararMJ(nos);
      return root.MathJax.typesetPromise(nos);
    }).then(function () { if (rootEl) rootEl.classList.add('eo-formula--mj'); })
      .catch(function () { no.__eoPend = false; /* degradacao: fica o TeX cru */ });
  }
  function aguardarMJ() { // MathJax assincrono ainda carregando: tenta de novo ate ~20s
    if (esperando) return; esperando = true;
    var n = 0;
    (function tick() {
      if (temMJ()) { esperando = false; instancias.forEach(function (i) { if (!i.root.classList.contains('eo-formula--mj')) tipografar(i.root, i.root); }); return; }
      if (++n > 100) { esperando = false; return; }
      setTimeout(tick, 200);
    })();
  }

  /* ---------- leitura ---------- */
  function lerPadrao(def) {
    var v = {};
    (def.variaveis || []).forEach(function (x) {
      if (!x.inputId) return;
      var e = document.getElementById(x.inputId);
      if (!e) { v[x.simbolo] = NaN; return; }
      v[x.simbolo] = (e.value === '' && def.vazio === 'nan') ? NaN : +e.value;
    });
    return v;
  }
  function valoresDe(def, ctx) {
    try { return def.ler ? def.ler(ctx || {}) : lerPadrao(def); } catch (e) { return {}; }
  }
  function passosDe(def, ctx) {
    try { return def.passos(valoresDe(def, ctx)) || []; } catch (e) { return [{ texto: '\u2014' }]; }
  }

  /* ---------- render ---------- */
  function renderPassos(def, ctx) {
    var ol = el('ol', 'eo-formula__passos-lista');
    passosDe(def, ctx).forEach(function (p) {
      var li = el('li', 'eo-formula__passo');
      if (p.rotulo) li.appendChild(el('span', 'eo-formula__rot', p.rotulo));
      if (p.tex != null) li.appendChild(tex('', p.tex)); else li.appendChild(el('span', 'eo-formula__txt', p.texto == null ? '\u2014' : p.texto));
      if (p.tex != null && p.texto) li.appendChild(el('span', 'eo-formula__txt', p.texto));
      ol.appendChild(li);
    });
    return ol;
  }
  function atualizarInst(inst, ctx) {
    var alvo = inst.passosEl;
    if (temMJ() && root.MathJax.typesetClear) { try { root.MathJax.typesetClear(listaTex(alvo)); } catch (e) { /* ignora */ } }
    alvo.innerHTML = '';
    alvo.appendChild(renderPassos(inst.def, ctx));
    tipografar(alvo, inst.root);
  }

  function register(def) {
    if (!def || !def.id) throw new Error('EO.formulas.register: id obrigatorio');
    defs[def.id] = def;
    return def;
  }

  function mount(container, id, opts) {
    opts = opts || {};
    var def = defs[id];
    if (!container) return null;
    container.innerHTML = '';
    if (!def) { container.appendChild(el('p', 'eo-formula__vazio', 'F\u00f3rmula n\u00e3o registrada: ' + id)); return null; }
    var aberto = opts.aberto !== false;
    var sec = el('section', 'eo-formula'); sec.setAttribute('data-formula-id', id);
    var det = el('details', 'eo-formula__det tex2jax_ignore'); if (aberto) det.open = true;
    var sum = el('summary', 'eo-formula__sum');
    sum.appendChild(el('span', 'eo-formula__titulo', def.titulo || id));
    if (def.proposito) sum.appendChild(el('span', 'eo-formula__prop', def.proposito));
    det.appendChild(sum);
    var corpo = el('div', 'eo-formula__corpo');
    corpo.appendChild(tex('eo-formula__eq', def.tex || '', true));
    var vs = def.variaveis || [];
    if (vs.length) {
      corpo.appendChild(el('h4', 'eo-formula__h', 'Vari\u00e1veis'));
      var dl = el('dl', 'eo-formula__vars');
      vs.forEach(function (x) {
        var row = el('div', 'eo-formula__var');
        var dt = el('dt'); dt.appendChild(tex('', x.tex || x.simbolo));
        var dd = el('dd'); dd.appendChild(el('span', 'eo-formula__nome', x.nome));
        dd.appendChild(el('span', 'eo-formula__un', x.unidade ? x.unidade : 'adimensional'));
        row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
      });
      corpo.appendChild(dl);
    }
    corpo.appendChild(el('h4', 'eo-formula__h', 'Substitui\u00e7\u00e3o com os valores atuais'));
    var passosEl = el('div', 'eo-formula__passos'); passosEl.setAttribute('role', 'group'); passosEl.setAttribute('aria-label', 'Substitui\u00e7\u00e3o passo a passo');
    corpo.appendChild(passosEl);
    var obs = def.observacoes || [];
    if (obs.length) {
      corpo.appendChild(el('h4', 'eo-formula__h', 'Observa\u00e7\u00f5es'));
      var ul = el('ul', 'eo-formula__obs');
      obs.forEach(function (o) { ul.appendChild(el('li', null, o)); });
      corpo.appendChild(ul);
    }
    if (def.referencia) corpo.appendChild(el('p', 'eo-formula__ref', 'Refer\u00eancia: ' + def.referencia));
    det.appendChild(corpo); sec.appendChild(det); container.appendChild(sec);
    instancias = instancias.filter(function (i) { return i.root !== sec && document.body.contains(i.root); });
    var inst = { def: def, root: sec, passosEl: passosEl };
    instancias.push(inst);
    passosEl.appendChild(renderPassos(def, {}));
    tipografar(sec, sec);
    if (opts.bind !== false) bind(id);
    return sec;
  }

  function idsOuvidos(def) {
    var ids = {};
    (def.variaveis || []).forEach(function (x) { if (x.inputId) ids[x.inputId] = 1; });
    (def.ouvir || []).forEach(function (i) { ids[i] = 1; });
    return ids;
  }
  function bind(id) {
    var def = defs[id];
    if (!def || ligados[id]) return function () {};
    var ids = idsOuvidos(def);
    var h = function (ev) {
      var t = ev.target;
      if (!t || !t.id || !ids[t.id]) return;
      clearTimeout(timers[id]);
      timers[id] = setTimeout(function () { atualizar(id, { ultimo: t.id }); }, 120);
    };
    document.addEventListener('input', h, true);
    document.addEventListener('change', h, true);
    ligados[id] = function () { document.removeEventListener('input', h, true); document.removeEventListener('change', h, true); delete ligados[id]; };
    return ligados[id];
  }
  function atualizar(id, ctx) {
    instancias.forEach(function (i) { if (i.def.id === id && document.body.contains(i.root)) atualizarInst(i, ctx || {}); });
  }
  function mountAll(escopo) {
    var ns = (escopo || document).querySelectorAll('[data-eo-formula]');
    for (var i = 0; i < ns.length; i++) {
      mount(ns[i], ns[i].getAttribute('data-eo-formula'), { aberto: ns[i].getAttribute('data-eo-aberto') !== 'false' });
    }
  }

  EO.formulas = {
    __v: 1, register: register, mount: mount, bind: bind, mountAll: mountAll, atualizar: atualizar,
    get: function (id) { return defs[id]; }, valores: function (id, ctx) { return valoresDe(defs[id], ctx); }, passos: function (id, ctx) { return passosDe(defs[id], ctx); }, ids: function () { return Object.keys(defs); },
    fix: fix, g: g, ptbr: ptbr, tn: tn, tu: tu, tv: tv
  };

  if (typeof document !== 'undefined' && document.addEventListener) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); }, { once: true });
    else setTimeout(function () { mountAll(); }, 0);
  }
})(typeof window !== 'undefined' ? window : globalThis);
