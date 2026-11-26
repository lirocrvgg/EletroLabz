/* praticar/ui.js - interface do Praticar (EO.praticar.ui): inicio, flashcards, quiz, resultado e compartilhamento.
 * Todo texto de conteudo entra por textContent (nunca innerHTML com dados). A resposta certa nunca vai para o DOM
 * antes de o usuario responder: a correcao vem de core.corrigir() sobre o estado da sessao.
 * Acoes por delegacao de [data-eo-action="praticar:<acao>"]; os unicos onclick sao os das abas. */
(function (root) {
  'use strict';
  var EO = root.EO = root.EO || {};
  var P = EO.praticar = EO.praticar || {};
  var doc = root.document;
  if (!doc || !P.core || !P.store) return;
  var core = P.core, store = P.store, share = P.share, K = store.KEYS;

  /* ---------- utilitarios ---------- */
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function byId(id) { return doc.getElementById(id); }
  function limpar(n) { n.textContent = ''; }
  function el(tag, cls, txt) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function ic(name) {
    var i = doc.createElement('i');
    i.setAttribute('data-eo-icon', name); i.setAttribute('aria-hidden', 'true');
    if (EO.icon) i.innerHTML = EO.icon(name);   /* marcacao estatica da tabela de icones, sem dados */
    return i;
  }
  function foco(e) { if (e && e.focus) { try { e.focus(); } catch (x) { /* ignora */ } } }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
  function letra(i) { return 'ABCDE'.charAt(i) + ')'; }
  function semente() {
    var m = /[?&]semente=(\d+)/.exec(root.location.search || '');
    return m ? parseInt(m[1], 10) : undefined;
  }
  function paginaAtiva() {
    var a = $('#main-praticar .page.active');
    return a ? a.id.replace(/^page-/, '') : '';
  }
  function setRotulo(btn, txt) {
    var n = btn.lastChild;
    if (n && n.nodeType === 3) n.nodeValue = ' ' + txt; else btn.appendChild(doc.createTextNode(' ' + txt));
  }
  function anunciar(t) { var a = byId('pr-anuncio'); if (a) a.textContent = t; }

  /* ---------- estado ---------- */
  var PREFS_PADRAO = { v: 1, cardsTopico: null, cardsFiltro: 'todos', quizTopicos: null, quizN: 10, quizNivel: 0 };
  var S = { primeira: true, cards: null, prefs: null, fc: { topico: null, filtro: 'todos', deck: null, i: 0, virado: false }, qz: { view: null, sessao: null }, png: null };

  function carregar() {
    S.cards = store.ler(K.cards, 1, core.estadoVazio());
    if (!S.cards || typeof S.cards.porId !== 'object' || !S.cards.porId) S.cards = core.estadoVazio();
    var p = store.ler(K.prefs, 1, PREFS_PADRAO), o = {};
    Object.keys(PREFS_PADRAO).forEach(function (k) { o[k] = p && p[k] !== undefined ? p[k] : PREFS_PADRAO[k]; });
    /* formato vindo do armazenamento nao e confiavel: o que nao bate cai no padrao */
    if (!(o.quizTopicos === null || (Array.isArray(o.quizTopicos) && o.quizTopicos.every(function (x) { return typeof x === 'string'; })))) o.quizTopicos = PREFS_PADRAO.quizTopicos;
    if (!(o.cardsTopico === null || typeof o.cardsTopico === 'string')) o.cardsTopico = PREFS_PADRAO.cardsTopico;
    if (typeof o.cardsFiltro !== 'string') o.cardsFiltro = PREFS_PADRAO.cardsFiltro;
    if (typeof o.quizN !== 'number' || !isFinite(o.quizN)) o.quizN = PREFS_PADRAO.quizN;
    if (typeof o.quizNivel !== 'number' || !isFinite(o.quizNivel)) o.quizNivel = PREFS_PADRAO.quizNivel;
    S.prefs = o;
    if (!store.disponivel()) { var a = byId('pr-aviso-storage'); if (a) a.hidden = false; }
  }
  function salvar(chave, valor) {
    if (!store.gravar(chave, valor)) { var a = byId('pr-aviso-storage'); if (a) a.hidden = false; }
  }
  function salvarPrefs() { salvar(K.prefs, S.prefs); }

  function indiceQ() {
    var m = {};
    core.topicos().forEach(function (t) { (t.questoes || []).forEach(function (q) { m[q.id] = { q: q, t: t }; }); });
    return m;
  }
  function topicoPorId(id) {
    var ts = core.topicos();
    for (var i = 0; i < ts.length; i++) if (ts[i].id === id) return ts[i];
    return null;
  }
  function disponiveis(ids, nivel) {
    if (!ids.length) return 0;
    return core.sortearQuestoes(core.topicos(), { ids: ids, nivel: nivel || undefined, seed: 1 }).ids.length;
  }

  /* ---------- sessao e resultado (sessionStorage) ---------- */
  function itensValidos(itens) {
    return Array.isArray(itens) && itens.every(function (it) {
      return it && typeof it === 'object' && typeof it.id === 'string' && Array.isArray(it.ordem) &&
        it.ordem.every(function (n) { return typeof n === 'number' && n % 1 === 0; });
    });
  }
  function lerSessao() {
    var s = store.ler(K.sessao, 1, null);
    if (!s || !itensValidos(s.itens) || !s.itens.length || !Array.isArray(s.respostas)) return null;
    var idx = indiceQ();
    for (var i = 0; i < s.itens.length; i++) {
      var r = idx[s.itens[i].id];
      if (!r || !Array.isArray(s.itens[i].ordem) || s.itens[i].ordem.length !== r.q.alternativas.length) return null;
    }
    if (!(s.idx >= 0 && s.idx < s.itens.length) || s.respostas.length > s.itens.length) return null;
    return s;
  }
  function lerResultado() {
    var R = store.ler(K.resultado, 1, null);
    if (!R || !itensValidos(R.itens) || !Array.isArray(R.respostas)) return null;
    var res;
    try { res = core.pontuar({ itens: R.itens, respostas: R.respostas }, core.topicos()); } catch (x) { return null; }
    if (!res.total) return null;
    R.res = res;
    return R;
  }

  /* ---------- paginas ---------- */
  function showPraticarPage(id, btn) {
    if (id === 'quiz-resultado' && !lerResultado()) {
      if (EO.nav && EO.nav.replace) { EO.nav.replace('quiz'); return; }
      id = 'quiz';
    }
    if (!byId('page-' + id)) id = 'praticar-home';
    $$('#main-praticar .page').forEach(function (p) { p.classList.toggle('active', p.id === 'page-' + id); });
    var aba = id === 'quiz-resultado' ? 'quiz' : id;
    $$('#nav-praticar .nav-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-prpage') === aba); });
    if (id === 'praticar-home') renderInicio();
    else if (id === 'flashcards') renderFlashcards(false);
    else if (id === 'quiz') renderQuiz();
    else if (id === 'quiz-resultado') renderResultado();
    if (!S.primeira) {
      foco(byId({ 'praticar-home': 'pr-h1-home', flashcards: 'pr-h1-fc', quiz: 'pr-h1-quiz', 'quiz-resultado': 'pr-h1-res' }[id]));
    }
    S.primeira = false;
  }
  root.showPraticarPage = showPraticarPage;

  /* ---------- inicio ---------- */
  function renderInicio() {
    var ts = core.topicos();
    var fc = byId('pr-home-fc'), qz = byId('pr-home-qz');
    if (!ts.length) {
      fc.textContent = 'Conteúdo ainda não disponível.'; qz.textContent = 'Conteúdo ainda não disponível.';
      return;
    }
    var tot = 0, sei = 0, rev = 0;
    ts.forEach(function (t) { var r = core.resumo(t.cards || [], S.cards); tot += r.total; sei += r.sei; rev += r.revisar; });
    fc.textContent = tot ? sei + ' de ' + plural(tot, 'cartão', 'cartões') + ' marcados como sei' + (rev ? ' · ' + rev + ' para revisar' : '') : 'Nenhum cartão ainda.';
    var nq = disponiveis(ts.map(function (t) { return t.id; }), 0);
    var txt = plural(nq, 'questão', 'questões') + ' em ' + plural(ts.length, 'tópico', 'tópicos');
    if (lerSessao()) txt += ' · quiz em andamento';
    qz.textContent = nq ? txt : 'Nenhuma questão ainda.';
  }

  /* ---------- flashcards ---------- */
  function topicoCards() { return topicoPorId(S.fc.topico); }

  function montarDeck(ordenarComRng) {
    var t = topicoCards();
    var rand = null;
    if (ordenarComRng) { var s = semente(); rand = core.rng(s !== undefined ? s : (Date.now() >>> 0)); }
    S.fc.deck = t ? core.ordemEstudo(t.cards || [], S.cards, S.fc.filtro, rand) : [];
    S.fc.i = 0; S.fc.virado = false;
  }

  function renderFlashcards(forcar) {
    var ts = core.topicos();
    var sel = byId('pr-fc-topico');
    limpar(sel);
    ts.forEach(function (t) {
      var o = el('option', null, t.titulo + ' (' + plural((t.cards || []).length, 'cartão', 'cartões') + ')');
      o.value = t.id; sel.appendChild(o);
    });
    if (!topicoPorId(S.fc.topico)) S.fc.topico = topicoPorId(S.prefs.cardsTopico) ? S.prefs.cardsTopico : (ts[0] ? ts[0].id : null);
    if (['todos', 'revisar', 'novos'].indexOf(S.fc.filtro) < 0 || (S.fc.deck === null && S.prefs.cardsFiltro)) {
      S.fc.filtro = ['todos', 'revisar', 'novos'].indexOf(S.prefs.cardsFiltro) >= 0 ? S.prefs.cardsFiltro : 'todos';
    }
    if (S.fc.topico) sel.value = S.fc.topico;
    sel.disabled = !ts.length;
    if (forcar || S.fc.deck === null) montarDeck(false);
    desenharCard(false);
  }

  function contagens() {
    var t = topicoCards();
    return t ? core.resumo(t.cards || [], S.cards) : { total: 0, sei: 0, revisar: 0, novos: 0 };
  }

  function desenharCard(focar) {
    var t = topicoCards(), deck = S.fc.deck || [], n = deck.length;
    var r = contagens();
    $$('.pr-seg-btn').forEach(function (b) {
      var f = b.getAttribute('data-filtro');
      b.setAttribute('aria-pressed', f === S.fc.filtro ? 'true' : 'false');
      $('.pr-seg-n', b).textContent = f === 'todos' ? r.total : f === 'revisar' ? r.revisar : r.novos;
    });
    byId('pr-fc-resumo').textContent = t ? 'Sei ' + r.sei + ' · Revisar ' + r.revisar + ' · Novos ' + r.novos + ' (de ' + r.total + ')' : '';
    var ver = byId('pr-fc-ver');
    limpar(ver);
    if (t && t.ver && t.ver.length) {
      ver.appendChild(doc.createTextNode('Ver no módulo: '));
      t.ver.forEach(function (v, k) {
        if (k) ver.appendChild(doc.createTextNode(' · '));
        var a = el('a', null, v.rotulo); a.href = v.href; ver.appendChild(a);
      });
      ver.hidden = false;
    } else ver.hidden = true;

    var palco = byId('pr-fc-palco'), vazio = byId('pr-fc-vazio');
    if (!n) {
      palco.hidden = true; vazio.hidden = false;
      var txt = !t ? 'Nenhum tópico disponível no momento.'
        : (t.cards || []).length === 0 ? 'Este tópico ainda não tem cartões.'
        : S.fc.filtro === 'revisar' ? 'Nenhum cartão marcado para revisar neste tópico.'
        : S.fc.filtro === 'novos' ? 'Você já viu todos os cartões deste tópico.' : 'Nenhum cartão neste filtro.';
      byId('pr-fc-vazio-txt').textContent = txt;
      return;
    }
    palco.hidden = false; vazio.hidden = true;
    var c = deck[S.fc.i];
    byId('pr-card-frente').textContent = c.frente;
    byId('pr-card-verso').textContent = c.verso;
    ['pr-card-chips-f', 'pr-card-chips-v'].forEach(function (id) {
      var box = byId(id); limpar(box);
      if (c.aConfirmar) {
        var chip = el('span', 'pr-chip-conf');
        chip.title = c.aConfirmar;
        chip.appendChild(ic('triangle-alert'));
        chip.appendChild(doc.createTextNode(' A confirmar'));
        chip.appendChild(el('span', 'sr-only', ': ' + c.aConfirmar));
        box.appendChild(chip);
      }
    });
    var a = byId('pr-card-ver');
    if (c.ver) { a.textContent = 'Ver: ' + c.ver.rotulo; a.href = c.ver.href; a.hidden = false; } else { a.hidden = true; a.removeAttribute('href'); }
    byId('pr-fc-pos').textContent = 'Cartão ' + (S.fc.i + 1) + ' de ' + n;
    var m = S.cards.porId[c.id], mc = byId('pr-fc-marca');
    if (m && (m.s === 'sei' || m.s === 'revisar')) { mc.textContent = 'Marcado: ' + (m.s === 'sei' ? 'sei' : 'revisar'); mc.hidden = false; } else mc.hidden = true;
    aplicarVirada();
    acao('pr-btn-ant', S.fc.i > 0);
    acao('pr-btn-prox', S.fc.i < n - 1);
    if (focar) { foco(byId('pr-face-frente')); anunciar('Cartão ' + (S.fc.i + 1) + ' de ' + n); }
  }
  function acao(id, ativo) { var b = byId(id); b.setAttribute('aria-disabled', ativo ? 'false' : 'true'); }

  function aplicarVirada() {
    var v = S.fc.virado;
    byId('pr-flip').classList.toggle('is-flipped', v);
    byId('pr-btn-virar').setAttribute('aria-pressed', v ? 'true' : 'false');
    var f = byId('pr-face-frente'), vs = byId('pr-face-verso');
    function ativa(e, on) {
      e.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) e.removeAttribute('inert'); else e.setAttribute('inert', '');
    }
    ativa(f, !v); ativa(vs, v);
    byId('pr-btn-sei').setAttribute('aria-disabled', v ? 'false' : 'true');
    byId('pr-btn-rev').setAttribute('aria-disabled', v ? 'false' : 'true');
    $('#pr-btn-sei').title = v ? '' : 'Vire o cartão para marcar';
    $('#pr-btn-rev').title = v ? '' : 'Vire o cartão para marcar';
  }

  function virar() {
    var deck = S.fc.deck || [];
    if (!deck.length) return;
    S.fc.virado = !S.fc.virado;
    /* inert tira a face do foco: move o foco para a outra face antes, senao ele cai no body */
    var ae = document.activeElement, fF = byId('pr-face-frente'), fV = byId('pr-face-verso');
    var sai = S.fc.virado ? fF : fV, entra = S.fc.virado ? fV : fF;
    var move = !!(ae && sai && sai.contains(ae));
    aplicarVirada();
    if (move) foco(entra); /* depois: a face de entrada so aceita foco sem inert */
    var c = deck[S.fc.i];
    anunciar(S.fc.virado ? 'Verso: ' + c.verso : 'Frente: ' + c.frente);
  }

  function marcarCard(marca) {
    var deck = S.fc.deck || [];
    if (!deck.length) return;
    if (!S.fc.virado) { anunciar('Vire o cartão antes de marcar.'); return; }
    var c = deck[S.fc.i];
    S.cards = core.marcar(S.cards, c.id, marca, Date.now());
    salvar(K.cards, S.cards);
    var rotulo = marca === 'sei' ? 'sei' : 'revisar';
    if (S.fc.i < deck.length - 1) {
      S.fc.i++; S.fc.virado = false;
      desenharCard(true);
      anunciar('Marcado como ' + rotulo + '. Cartão ' + (S.fc.i + 1) + ' de ' + deck.length);
    } else {
      desenharCard(false);
      anunciar('Marcado como ' + rotulo + '. Este é o último cartão.');
    }
  }

  function moverCard(d) {
    var deck = S.fc.deck || [];
    var j = S.fc.i + d;
    if (j < 0 || j >= deck.length) return;
    S.fc.i = j; S.fc.virado = false;
    desenharCard(true);
  }

  function escolherTopico(id) {
    S.fc.topico = id; S.prefs.cardsTopico = id; salvarPrefs();
    montarDeck(false); desenharCard(true);
  }
  function filtrarCards(f) {
    S.fc.filtro = f; S.prefs.cardsFiltro = f; S.prefs.cardsTopico = S.fc.topico; salvarPrefs();
    montarDeck(false); desenharCard(true);
  }
  function embaralharCards() { montarDeck(true); desenharCard(true); }
  function zerarProgresso() {
    var t = topicoCards();
    if (!t) return;
    if (!root.confirm('Zerar o progresso dos cartões do tópico "' + t.titulo + '"? Isso não pode ser desfeito.')) return;
    S.cards = core.zerar(S.cards, (t.cards || []).map(function (c) { return c.id; }));
    salvar(K.cards, S.cards);
    montarDeck(false); desenharCard(true);
    anunciar('Progresso do tópico zerado.');
  }

  /* ---------- quiz: configuracao ---------- */
  function mostrarVista(v) {
    ['retomar', 'config', 'questao'].forEach(function (x) { byId('pr-quiz-' + x).hidden = x !== v; });
  }

  function renderQuiz() {
    if (S.qz.view === 'questao' && S.qz.sessao) { mostrarVista('questao'); return; }
    var s = lerSessao();
    if (s) {
      S.qz.view = 'retomar'; S.qz.sessao = null;
      var feitas = s.respostas.length;
      byId('pr-retomar-txt').textContent = 'Você respondeu ' + feitas + ' de ' + plural(s.itens.length, 'questão', 'questões') + ' neste quiz. Quer continuar de onde parou?';
      mostrarVista('retomar');
    } else {
      S.qz.view = 'config'; S.qz.sessao = null;
      renderConfigQuiz();
      mostrarVista('config');
    }
  }

  function selecionados() {
    return $$('#pr-cfg-topicos input:checked').map(function (i) { return i.value; });
  }
  function nivelAtual() { return parseInt(byId('pr-cfg-nivel').value, 10) || 0; }

  function pick(tipo, nome, valor, titulo, extra) {
    var lab = el('label', 'pr-pick');
    var inp = doc.createElement('input');
    inp.type = tipo; inp.name = nome; inp.value = valor;
    lab.appendChild(inp);
    lab.appendChild(el('span', 'pr-pick-mark pr-pick-mark--' + tipo));
    var tx = el('span', 'pr-pick-txt');
    tx.appendChild(el('span', 'pr-pick-t', titulo));
    if (extra) tx.appendChild(el('span', 'pr-pick-x', extra));
    lab.appendChild(tx);
    return { lab: lab, inp: inp, extra: tx };
  }

  function renderConfigQuiz() {
    var ts = core.topicos();
    byId('pr-cfg-vazio').hidden = ts.length > 0;
    byId('pr-cfg-form').hidden = ts.length === 0;
    var box = byId('pr-cfg-topicos'); limpar(box);
    var validos = (S.prefs.quizTopicos || []).filter(function (id) { return !!topicoPorId(id); });
    if (!validos.length) validos = ts.map(function (t) { return t.id; });
    ts.forEach(function (t) {
      var n = disponiveis([t.id], 0);
      var p = pick('checkbox', 'pr-topico', t.id, t.titulo, plural(n, 'questão', 'questões'));
      p.inp.checked = validos.indexOf(t.id) >= 0;
      if (!n) { p.inp.disabled = true; p.inp.checked = false; }
      box.appendChild(p.lab);
    });
    byId('pr-cfg-nivel').value = String([0, 1, 2, 3].indexOf(S.prefs.quizNivel) >= 0 ? S.prefs.quizNivel : 0);
    atualizarQuantidade(S.prefs.quizN);
  }

  function atualizarQuantidade(preferida) {
    var ids = selecionados(), nivel = nivelAtual();
    var disp = disponiveis(ids, nivel);
    var opcoes = core.opcoesQuantidade(disp).map(function (o) {
      if (!o.habilitado) o.motivo = disp === 0 ? 'Nenhuma questão disponível' : 'Só há ' + plural(disp, 'questão disponível', 'questões disponíveis');
      return o;
    });
    var antes = preferida != null ? preferida : (function () { var c = $('#pr-cfg-qtd input:checked'); return c ? parseInt(c.value, 10) : null; })();
    var box = byId('pr-cfg-qtd'); limpar(box);
    var habil = opcoes.filter(function (o) { return o.habilitado; });
    var alvo = null;
    if (habil.some(function (o) { return o.n === antes; })) alvo = antes;
    else if (habil.length) alvo = habil[habil.length - 1].n;
    opcoes.forEach(function (o) {
      var p = pick('radio', 'pr-qtd', o.n, String(o.n), o.habilitado ? null : o.motivo);
      p.lab.classList.add('pr-pick--qtd');
      if (!o.habilitado) { p.inp.disabled = true; p.lab.title = o.motivo; }
      p.inp.checked = o.n === alvo;
      box.appendChild(p.lab);
    });
    if (!habil.length && disp > 0) {
      var t = pick('radio', 'pr-qtd', disp, 'Todas (' + disp + ')', null);
      t.lab.classList.add('pr-pick--qtd'); t.inp.checked = true; box.appendChild(t.lab);
    }
    byId('pr-cfg-disp').textContent = ids.length ? plural(disp, 'questão disponível', 'questões disponíveis') + ' com esta seleção.' : 'Escolha pelo menos um tópico.';
    var iniciar = byId('pr-btn-iniciar');
    iniciar.setAttribute('aria-disabled', disp > 0 ? 'false' : 'true');
    iniciar.title = disp > 0 ? '' : (ids.length ? 'Não há questões com esta seleção' : 'Escolha pelo menos um tópico');
    byId('pr-cfg-aviso').hidden = true;
  }

  function iniciarQuiz() {
    var ids = selecionados(), nivel = nivelAtual();
    var q = $('#pr-cfg-qtd input:checked');
    var av = byId('pr-cfg-aviso');
    if (!ids.length) { av.textContent = 'Escolha pelo menos um tópico.'; av.hidden = false; return; }
    if (!q) { av.textContent = 'Não há questões suficientes com esta seleção. Ajuste os tópicos ou o nível.'; av.hidden = false; return; }
    var n = parseInt(q.value, 10);
    var ok = comecar({ ids: ids, n: n, nivel: nivel || undefined });
    if (ok === 'faltam') { av.textContent = 'Não há questões suficientes com esta seleção. Ajuste os tópicos, o nível ou a quantidade.'; av.hidden = false; return; }
    if (ok) { S.prefs.quizTopicos = ids; S.prefs.quizN = n; S.prefs.quizNivel = nivel; salvarPrefs(); }
  }

  /* c: {ids, n, nivel, somenteIds}. Devolve true, 'faltam' ou false */
  function comecar(c) {
    var ts = core.topicos();
    var s = semente();
    var seed = (s !== undefined ? s : Date.now()) >>> 0;
    var opts = { ids: c.ids, n: c.n, nivel: c.nivel, somenteIds: c.somenteIds, seed: seed };
    var sorteio = core.sortearQuestoes(ts, opts);
    if (!sorteio.ids.length || sorteio.faltaram > 0) return 'faltam';
    opts.agora = Date.now();
    var ses = core.montarSessao(ts, opts);
    ses.nivel = c.nivel || 0;
    S.qz.sessao = ses; S.qz.view = 'questao';
    salvar(K.sessao, ses);
    if (paginaAtiva() !== 'quiz') { root.showPraticarPage('quiz'); }
    mostrarVista('questao');
    renderQuestao(true);
    return true;
  }

  function retomarQuiz() {
    var s = lerSessao();
    if (!s) { renderQuiz(); return; }
    S.qz.sessao = s; S.qz.view = 'questao';
    mostrarVista('questao');
    renderQuestao(true);
  }

  function novoQuiz() {
    store.remover(K.sessao);
    S.qz.sessao = null; S.qz.view = null;
    if (paginaAtiva() === 'quiz') { renderQuiz(); foco(byId('pr-cfg-t')); }
    else root.showPraticarPage('quiz');
  }

  function encerrarQuiz() {
    if (!root.confirm('Encerrar o quiz? As respostas deste quiz serão descartadas.')) return;
    novoQuiz();
  }

  /* ---------- quiz: questao e feedback ---------- */
  function renderQuestao(focar) {
    var ses = S.qz.sessao;
    var item = ses.itens[ses.idx], r = indiceQ()[item.id], q = r.q;
    var total = ses.itens.length;
    byId('pr-q-topico').textContent = r.t.tituloCurto || r.t.titulo;
    byId('pr-q-nivel').textContent = 'Nível ' + q.nivel;
    byId('pr-q-num').textContent = 'Questão ' + (ses.idx + 1) + ' de ' + total;
    byId('pr-q-texto').textContent = q.enunciado;
    var prog = byId('pr-q-progresso');
    prog.max = total;
    var respondida = ses.respostas.length > ses.idx;
    prog.value = ses.idx + (respondida ? 1 : 0);
    prog.setAttribute('aria-valuetext', (ses.idx + (respondida ? 1 : 0)) + ' de ' + total + ' respondidas');
    var box = byId('pr-q-alts'); limpar(box);
    item.ordem.forEach(function (orig, pos) {
      var lab = el('label', 'pr-alt');
      var inp = doc.createElement('input');
      inp.type = 'radio'; inp.name = 'pr-alt'; inp.value = String(pos);
      lab.appendChild(inp);
      lab.appendChild(el('span', 'pr-pick-mark pr-pick-mark--radio'));
      lab.appendChild(el('span', 'pr-alt-letra', letra(pos)));
      lab.appendChild(el('span', 'pr-alt-txt', q.alternativas[orig]));
      lab.appendChild(el('span', 'pr-alt-estado'));
      box.appendChild(lab);
    });
    byId('pr-q-aviso').hidden = true;
    renderFeedback(respondida);
    if (focar) foco(byId('pr-q-enunciado'));
  }

  /* mostra o feedback da questao atual (se ja respondida) e ajusta os botoes */
  function renderFeedback(respondida, focarFeedback) {
    var ses = S.qz.sessao;
    var item = ses.itens[ses.idx], r = indiceQ()[item.id], q = r.q;
    var ultimo = ses.idx === ses.itens.length - 1;
    var fb = byId('pr-feedback');
    byId('pr-btn-responder').hidden = respondida;
    byId('pr-btn-proxima').hidden = !(respondida && !ultimo);
    byId('pr-btn-ver-res').hidden = !(respondida && ultimo);
    if (!respondida) {
      fb.hidden = true;
      ['pr-fb-titulo', 'pr-fb-resposta', 'pr-fb-expl', 'pr-fb-porque'].forEach(function (id) { byId(id).textContent = ''; });
      return;
    }
    var resp = ses.respostas[ses.idx];
    var c = core.corrigir(q, item.ordem, resp);
    var labels = $$('#pr-q-alts .pr-alt');
    labels.forEach(function (lab, pos) {
      var inp = $('input', lab), est = $('.pr-alt-estado', lab);
      inp.disabled = true;
      if (pos === resp) inp.checked = true;
      limpar(est);
      if (pos === c.corretaExibida) {
        lab.classList.add('is-correta');
        est.appendChild(ic('circle-check')); est.appendChild(doc.createTextNode(' (resposta correta)'));
      } else if (pos === resp) {
        lab.classList.add('is-errada');
        est.appendChild(ic('circle-x')); est.appendChild(doc.createTextNode(' (sua resposta)'));
      }
    });
    fb.classList.toggle('is-ok', c.acertou);
    fb.classList.toggle('is-erro', !c.acertou);
    var icone = byId('pr-fb-icone'); limpar(icone); icone.appendChild(ic(c.acertou ? 'circle-check' : 'circle-x'));
    byId('pr-fb-titulo').textContent = c.acertou ? 'Correto.' : 'Incorreto.';
    var ra = byId('pr-fb-resposta');
    if (c.acertou) ra.hidden = true;
    else { ra.textContent = 'A resposta certa é ' + letra(c.corretaExibida) + ' ' + q.alternativas[q.correta] + '.'; ra.hidden = false; }
    byId('pr-fb-expl').textContent = q.explicacao;
    var pq = byId('pr-fb-porque'), porque = !c.acertou && q.porQueErrada && q.porQueErrada[c.escolhidaOriginal];
    if (porque) { pq.textContent = 'Por que a sua escolha não serve: ' + porque; pq.hidden = false; } else pq.hidden = true;
    var ver = byId('pr-fb-ver');
    if (q.ver) { ver.textContent = 'Ver: ' + q.ver.rotulo; ver.href = q.ver.href; ver.hidden = false; } else { ver.hidden = true; ver.removeAttribute('href'); }
    fb.hidden = false;
    if (focarFeedback) foco(fb);
  }

  function responder() {
    var ses = S.qz.sessao;
    if (!ses || ses.respostas.length > ses.idx) return;
    var marcada = $('#pr-q-alts input:checked');
    var av = byId('pr-q-aviso');
    if (!marcada) {
      av.textContent = 'Escolha uma alternativa antes de responder.'; av.hidden = false;
      foco($('#pr-q-alts input'));
      return;
    }
    av.hidden = true;
    S.qz.sessao = core.responder(ses, parseInt(marcada.value, 10), core.topicos());
    salvar(K.sessao, S.qz.sessao);
    var prog = byId('pr-q-progresso');
    prog.value = S.qz.sessao.idx + 1;
    renderFeedback(true, true);
  }

  function proximaQuestao() {
    var ses = S.qz.sessao;
    if (!ses || ses.respostas.length <= ses.idx) return;
    S.qz.sessao = core.avancar(ses);
    salvar(K.sessao, S.qz.sessao);
    renderQuestao(true);
  }

  function verResultado() {
    var ses = S.qz.sessao;
    if (!ses || ses.respostas.length < ses.itens.length) return;
    var R = { v: 1, nivel: ses.nivel || 0, itens: ses.itens, respostas: ses.respostas, seed: ses.seed, criadaEm: Date.now() };
    salvar(K.resultado, R);
    store.remover(K.sessao);
    S.qz.sessao = null; S.qz.view = null; S.png = null;
    root.showPraticarPage('quiz-resultado');
  }

  function refazerErradas() {
    var R = lerResultado();
    if (!R || !R.res.erradas.length) return;
    comecar({ somenteIds: R.res.erradas, n: R.res.erradas.length });
  }

  /* ---------- resultado e compartilhamento ---------- */
  function resParaPng(R) {
    return { acertos: R.res.acertos, total: R.res.total, pct: R.res.pct, porTopico: R.res.porTopico, erradas: R.res.erradas, nivel: R.nivel, data: R.criadaEm };
  }
  function tema() { return EO.theme && EO.theme.get ? EO.theme.get() : 'light'; }
  function chavePng(R) { return R.criadaEm + '|' + tema(); }
  function textoDe(R) { return share.textoResultado(resParaPng(R), R.criadaEm); }
  function status(t) { byId('pr-share-status').textContent = t || ''; }

  function renderResultado() {
    var R = lerResultado();
    if (!R) return;
    var res = R.res;
    byId('pr-res-placar').textContent = res.acertos + '/' + res.total;
    byId('pr-res-pct').textContent = res.pct + '% de acerto';
    var tb = byId('pr-res-tabela'); limpar(tb);
    res.porTopico.forEach(function (t) {
      var tr = doc.createElement('tr');
      tr.appendChild(el('td', null, t.tituloCurto));
      tr.appendChild(el('td', 'num', t.acertos + '/' + t.total));
      tr.appendChild(el('td', 'num', (t.total ? Math.round(t.acertos / t.total * 100) : 0) + '%'));
      tb.appendChild(tr);
    });
    var idx = indiceQ();
    var ol = byId('pr-res-erradas'); limpar(ol);
    R.itens.forEach(function (item, i) {
      if (i >= R.respostas.length) return;
      var r = idx[item.id];
      if (!r) return;
      var c = core.corrigir(r.q, item.ordem, R.respostas[i]);
      if (c.acertou) return;
      var li = el('li', 'pr-err');
      li.appendChild(el('p', 'pr-err-enun', (i + 1) + '. ' + r.q.enunciado));
      li.appendChild(el('p', 'pr-err-linha', 'Sua resposta: ' + letra(R.respostas[i]) + ' ' + r.q.alternativas[c.escolhidaOriginal]));
      li.appendChild(el('p', 'pr-err-linha pr-err-certa', 'Resposta certa: ' + letra(c.corretaExibida) + ' ' + r.q.alternativas[r.q.correta]));
      li.appendChild(el('p', 'pr-err-expl', r.q.explicacao));
      if (r.q.ver) { var a = el('a', 'pr-err-ver', 'Ver: ' + r.q.ver.rotulo); a.href = r.q.ver.href; li.appendChild(a); }
      ol.appendChild(li);
    });
    byId('pr-res-sem-erro').hidden = res.erradas.length > 0;
    byId('pr-btn-refazer').hidden = res.erradas.length === 0;
    status('');
    byId('pr-share-manual').hidden = true;
    ajustarModoCompartilhar();
    prepararPng(R);
  }

  function ajustarModoCompartilhar() {
    var sup = share.suportaArquivo();
    byId('pr-btn-compartilhar').hidden = !sup;
    byId('pr-share-nota').hidden = sup;
    setRotulo(byId('pr-btn-baixar'), sup ? 'Baixar imagem' : 'Baixar imagem do resultado');
    byId('pr-btn-baixar').classList.toggle('secondary', sup);
  }

  /* gera o PNG ao abrir o resultado e guarda em cache; regenera quando o tema muda */
  function prepararPng(R) {
    var chave = chavePng(R);
    if (S.png && S.png.chave === chave) return S.png.promise;
    if (S.png && S.png.cache) { try { root.URL.revokeObjectURL(S.png.cache.url); } catch (e) { /* ignora */ } }
    var entry = { chave: chave, cache: null };
    S.png = entry;
    var carga = byId('pr-preview-carga');
    carga.textContent = 'Gerando imagem do resultado...'; carga.hidden = false;
    entry.promise = share.gerarPNG(resParaPng(R)).then(function (c) {
      entry.cache = c;
      if (S.png === entry) {
        var img = byId('pr-preview');
        img.src = c.url; img.alt = textoDe(R).replace(/\n/g, '. '); img.hidden = false;
        carga.hidden = true;
      } else { try { root.URL.revokeObjectURL(c.url); } catch (e) { /* ignora */ } }
      return c;
    }, function (err) {
      if (S.png === entry) { carga.textContent = 'Não foi possível gerar a imagem do resultado.'; carga.hidden = false; S.png = null; }
      throw err;
    });
    entry.promise.catch(function () { /* tratado nos botoes */ });
    return entry.promise;
  }

  /* o PNG so e valido para o tema em que foi desenhado */
  function pngAtual(R) { return S.png && S.png.chave === chavePng(R) && S.png.cache ? S.png.cache : null; }

  function fallbackBaixarECopiar(R, cache) {
    if (cache) share.baixar(cache.blob, cache.file.name);
    share.copiarTexto(textoDe(R)).then(function (modo) {
      var base = cache ? 'Não foi possível abrir o compartilhamento. A imagem foi baixada' : 'Não foi possível gerar a imagem';
      if (modo === 'manual') { mostrarManual(R); status(base + '. Selecione o texto abaixo e copie (Ctrl+C).'); }
      else status(base + (cache ? ' e o texto foi copiado.' : '; o texto foi copiado.'));
    });
  }
  function mostrarManual(R) {
    var ta = byId('pr-share-manual');
    ta.value = textoDe(R); ta.hidden = false; foco(ta); try { ta.select(); } catch (e) { /* ignora */ }
  }

  function compartilharResultado() {
    var R = lerResultado();
    if (!R) return;
    var texto = textoDe(R);
    function ok() { status('Resultado compartilhado.'); }
    function falhou(err) {
      if (err && err.name === 'AbortError') { status(''); return; }
      fallbackBaixarECopiar(R, pngAtual(R));
    }
    var cache = pngAtual(R);
    /* navigator.share precisa ser a primeira chamada assincrona do clique (ativacao do usuario) */
    if (cache) { share.compartilhar(cache, texto).then(ok, falhou); return; }
    prepararPng(R).then(function (c) { return share.compartilhar(c, texto); }).then(ok, falhou);
  }

  function baixarResultado() {
    var R = lerResultado();
    if (!R) return;
    var cache = pngAtual(R);
    function baixa(c) { share.baixar(c.blob, c.file.name); status('Imagem do resultado baixada.'); }
    if (cache) { baixa(cache); return; }
    prepararPng(R).then(baixa, function () { status('Não foi possível gerar a imagem do resultado.'); });
  }

  function copiarResultado() {
    var R = lerResultado();
    if (!R) return;
    share.copiarTexto(textoDe(R)).then(function (modo) {
      if (modo === 'manual') { mostrarManual(R); status('Selecione o texto acima e copie (Ctrl+C).'); }
      else { byId('pr-share-manual').hidden = true; status('Texto do resultado copiado.'); }
    });
  }

  /* tema trocado: o PNG em cache foi desenhado com as cores do tema anterior */
  root.redrawActive = function () {
    if (paginaAtiva() === 'quiz-resultado') {
      var R = lerResultado();
      if (R) prepararPng(R);
    } else if (S.png) {
      if (S.png.cache) { try { root.URL.revokeObjectURL(S.png.cache.url); } catch (e) { /* ignora */ } }
      S.png = null;
    }
  };

  /* ---------- eventos ---------- */
  var ACOES = {
    'virar-card': virar,
    'marcar-sei': function () { marcarCard('sei'); },
    'marcar-revisar': function () { marcarCard('revisar'); },
    'card-anterior': function () { moverCard(-1); },
    'card-proximo': function () { moverCard(1); },
    'embaralhar-cards': embaralharCards,
    'zerar-progresso': zerarProgresso,
    'iniciar-quiz': iniciarQuiz,
    'retomar-quiz': retomarQuiz,
    'responder': responder,
    'proxima-questao': proximaQuestao,
    'ver-resultado': verResultado,
    'encerrar-quiz': encerrarQuiz,
    'novo-quiz': novoQuiz,
    'refazer-erradas': refazerErradas,
    'compartilhar-resultado': compartilharResultado,
    'baixar-resultado': baixarResultado,
    'copiar-resultado': copiarResultado
  };

  function desabilitado(b) { return b.getAttribute('aria-disabled') === 'true'; }

  doc.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('#main-praticar [data-eo-action]') : null;
    if (!b || b.tagName === 'SELECT') return;
    var a = b.getAttribute('data-eo-action').replace(/^praticar:/, '');
    if (a === 'filtrar-cards') { filtrarCards(b.getAttribute('data-filtro')); return; }
    if ((a === "card-anterior" || a === "card-proximo") && desabilitado(b)) return;
    if (ACOES[a]) ACOES[a]();
  });

  doc.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'pr-fc-topico') { escolherTopico(t.value); return; }
    if (t.closest && t.closest('#pr-cfg-form')) atualizarQuantidade(null);
  });

  byId('pr-flip').addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) return;
    virar();
  });

  doc.addEventListener('keydown', function (e) {
    if (paginaAtiva() !== 'flashcards' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    var k = e.key;
    if (k === ' ' || k === 'Spacebar' || k === 'Enter') {
      if (tag === 'BUTTON' || tag === 'A' || (t.closest && t.closest('#nav-praticar'))) return;
      e.preventDefault(); virar(); return;
    }
    if (k === 's' || k === 'S') { marcarCard('sei'); }
    else if (k === 'r' || k === 'R') { marcarCard('revisar'); }
    else if (k === 'ArrowLeft') { moverCard(-1); }
    else if (k === 'ArrowRight') { moverCard(1); }
  });

  carregar();
  if (EO.hydrateIcons) EO.hydrateIcons(doc);

  P.ui = {
    renderInicio: renderInicio, renderFlashcards: renderFlashcards, renderConfigQuiz: renderConfigQuiz,
    renderQuestao: renderQuestao, renderFeedback: renderFeedback, renderResultado: renderResultado
  };
})(typeof window !== 'undefined' ? window : globalThis);
