/* praticar/core.js - nucleo puro do Praticar (EO.praticar.core): registro e validacao de topicos, sorteio
 * deterministico, sessao de quiz e estado dos flashcards. Sem DOM. Nada e mutado: funcoes devolvem copias. */
(function (root) {
  var EO = root.EO = root.EO || {};
  var P = EO.praticar = EO.praticar || {};

  /* ---------- registro ---------- */
  var registro = {};

  function registrarTopico(t) {
    if (t && typeof t.id === 'string') registro[t.id] = t;
    return t;
  }

  function topicos() {
    return Object.keys(registro).map(function (k) { return registro[k]; })
      .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
  }

  function limparRegistro() { registro = {}; }

  /* ---------- validacao ---------- */
  var PREFIXO = { fundamentos: 'fun', kirchhoff: 'kir', ca: 'ca', trifasico: 'tri' };
  var RE_TOPICO = /^(fundamentos|kirchhoff|ca|trifasico|tst-[a-z0-9-]+)$/;
  var HREFS = [
    'elet.html#rl', 'elet.html#rc', 'elet.html#rlc', 'elet.html#fasores', 'elet.html#trifasico',
    'elet.html#ydelta', 'elet.html#complexos', 'elet.html#cfp', 'elet.html#calc',
    'aciona.html#diagrama', 'aciona.html#referencia', 'aciona.html#ladder'
  ];
  var MODULOS = ['elet', 'aciona', 'ambos'];
  var RE_LATIM = /^[\x20-\x7EÀ-ɏ]+$/;

  function prefixoDe(topicoId) {
    if (PREFIXO[topicoId]) return PREFIXO[topicoId];
    return /^tst-/.test(topicoId) ? 'tst' : null;
  }

  function textoProibido(s) {
    return /</.test(s) || s.indexOf('\\(') !== -1 || s.indexOf('$') !== -1;
  }

  function validarTopico(t) {
    var erros = [];
    function err(m) { erros.push(m); }
    if (!t || typeof t !== 'object') return ['topico invalido'];
    var tid = typeof t.id === 'string' ? t.id : '?';

    /* texto: tipo, tamanho e caracteres proibidos */
    function txt(where, v, max, min) {
      if (typeof v !== 'string') { err(where + ': deve ser texto'); return false; }
      if (v.trim().length === 0) { err(where + ': vazio'); return false; }
      if (min && v.length < min) err(where + ': menos de ' + min + ' caracteres');
      if (max && v.length > max) err(where + ': mais de ' + max + ' caracteres');
      if (textoProibido(v)) err(where + ': contem <, \\( ou $');
      return true;
    }
    function inteiro(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
    function ver(where, v, nulavel) {
      if (v == null) { if (!nulavel) err(where + ': ver ausente'); return; }
      if (typeof v !== 'object' || Array.isArray(v)) { err(where + ': ver deve ser {href, rotulo}'); return; }
      if (HREFS.indexOf(v.href) === -1) err(where + ': href fora da lista de rotas validas (' + v.href + ')');
      txt(where + '.rotulo', v.rotulo, 60);
    }

    if (typeof t.id !== 'string' || !RE_TOPICO.test(t.id)) err('topico.id invalido (' + t.id + ')');
    if (!inteiro(t.versao) || t.versao < 1) err(tid + ': versao deve ser inteiro >= 1');
    if (!inteiro(t.ordem)) err(tid + ': ordem deve ser inteiro');
    txt(tid + '.titulo', t.titulo, 80);
    if (txt(tid + '.tituloCurto', t.tituloCurto, 18)) {
      if (!RE_LATIM.test(t.tituloCurto)) err(tid + '.tituloCurto: so caracteres latinos');
    }
    txt(tid + '.resumo', t.resumo, 160);
    if (MODULOS.indexOf(t.modulo) === -1) err(tid + ': modulo deve ser elet, aciona ou ambos');
    if (!Array.isArray(t.ver)) err(tid + ': ver deve ser lista');
    else t.ver.forEach(function (v, i) { ver(tid + '.ver[' + i + ']', v, false); });
    ['cards', 'questoes', 'listas', 'retirados'].forEach(function (k) {
      if (!Array.isArray(t[k])) err(tid + ': ' + k + ' deve ser lista');
    });

    var pref = prefixoDe(tid);
    var vistos = {};
    function id(where, v, tipo) {
      var re = new RegExp('^(fun|kir|ca|tri|tst)-' + tipo + '-\\d{3}$');
      if (typeof v !== 'string' || !re.test(v)) { err(where + ': id invalido (' + v + ')'); return; }
      if (pref && v.split('-')[0] !== pref) err(where + ': prefixo do id nao combina com o topico ' + tid);
      if (vistos[v]) err(where + ': id repetido (' + v + ')');
      vistos[v] = true;
    }
    function nivel(where, v) { if (v !== 1 && v !== 2 && v !== 3) err(where + ': nivel deve ser 1, 2 ou 3'); }
    function aConf(where, v) {
      if (v == null) return;
      txt(where + '.aConfirmar', v, 200);
    }

    (Array.isArray(t.cards) ? t.cards : []).forEach(function (c, i) {
      var w = tid + '.cards[' + i + ']';
      if (!c || typeof c !== 'object') { err(w + ': invalido'); return; }
      id(w, c.id, 'c');
      txt(w + '.frente', c.frente, 160);
      txt(w + '.verso', c.verso, 420);
      nivel(w, c.nivel);
      if (c.tags != null) {
        if (!Array.isArray(c.tags)) err(w + '.tags: deve ser lista');
        else c.tags.forEach(function (g) { txt(w + '.tags', g, 40); });
      }
      ver(w, c.ver, true);
      aConf(w, c.aConfirmar);
    });

    var idsQ = {};
    (Array.isArray(t.questoes) ? t.questoes : []).forEach(function (q, i) {
      var w = tid + '.questoes[' + i + ']';
      if (!q || typeof q !== 'object') { err(w + ': invalida'); return; }
      id(w, q.id, 'q');
      idsQ[q.id] = true;
      if (q.tipo !== 'multipla') err(w + ': tipo deve ser multipla');
      nivel(w, q.nivel);
      txt(w + '.enunciado', q.enunciado, 320);
      var nAlt = 0;
      if (!Array.isArray(q.alternativas) || q.alternativas.length < 3 || q.alternativas.length > 5) {
        err(w + ': deve ter de 3 a 5 alternativas');
      } else {
        nAlt = q.alternativas.length;
        var unicas = {};
        q.alternativas.forEach(function (a, j) {
          if (txt(w + '.alternativas[' + j + ']', a, 100)) {
            var k = a.trim().toLowerCase();
            if (unicas[k]) err(w + ': alternativas repetidas (' + a + ')');
            unicas[k] = true;
          }
        });
      }
      if (!inteiro(q.correta) || q.correta < 0 || q.correta >= nAlt) err(w + ': correta fora do intervalo');
      if (q.embaralhar != null && typeof q.embaralhar !== 'boolean') err(w + ': embaralhar deve ser booleano');
      txt(w + '.explicacao', q.explicacao, 600, 40);
      if (q.porQueErrada != null) {
        if (!Array.isArray(q.porQueErrada) || q.porQueErrada.length !== nAlt) {
          err(w + ': porQueErrada deve estar alinhado as alternativas');
        } else {
          q.porQueErrada.forEach(function (p, j) {
            if (j === q.correta) { if (p !== null) err(w + ': porQueErrada da correta deve ser null'); }
            else txt(w + '.porQueErrada[' + j + ']', p, 300);
          });
        }
      }
      ver(w, q.ver, true);
      aConf(w, q.aConfirmar);
      if (q.calc != null) {
        var c = q.calc;
        if (typeof c !== 'object' || Array.isArray(c)) err(w + '.calc: deve ser {fn, args, unidade, casas}');
        else {
          if (typeof c.fn !== 'string' || !/^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/.test(c.fn)) err(w + '.calc.fn invalido');
          if (!Array.isArray(c.args) || c.args.some(function (a) { return typeof a !== 'number' || !isFinite(a); })) {
            err(w + '.calc.args: deve ser lista de numeros');
          }
          if (typeof c.unidade !== 'string') err(w + '.calc.unidade: deve ser texto');
          if (!inteiro(c.casas) || c.casas < 0 || c.casas > 6) err(w + '.calc.casas: inteiro de 0 a 6');
          if (c.tol != null && (typeof c.tol !== 'number' || !(c.tol > 0))) err(w + '.calc.tol: numero positivo');
        }
      }
    });

    (Array.isArray(t.listas) ? t.listas : []).forEach(function (l, i) {
      var w = tid + '.listas[' + i + ']';
      if (!l || typeof l !== 'object') { err(w + ': invalida'); return; }
      txt(w + '.titulo', l.titulo, 80);
      nivel(w, l.nivel);
      if (!Array.isArray(l.questoes)) err(w + '.questoes: deve ser lista');
      else l.questoes.forEach(function (qid) { if (!idsQ[qid]) err(w + ': questao inexistente (' + qid + ')'); });
    });

    (Array.isArray(t.retirados) ? t.retirados : []).forEach(function (r) {
      if (typeof r !== 'string') err(tid + '.retirados: deve conter ids');
      else if (vistos[r]) err(tid + '.retirados: id ainda em uso (' + r + ')');
    });
    return erros;
  }

  /* valida cada topico e a unicidade de ids entre topicos */
  function validarTodos(lista) {
    var erros = [];
    var dono = {};
    (lista || []).forEach(function (t) {
      validarTopico(t).forEach(function (e) { erros.push(e); });
      if (!t) return;
      var tid = t.id;
      if (dono[tid] !== undefined && dono[tid] !== t) erros.push('topico repetido (' + tid + ')');
      dono[tid] = t;
    });
    var itens = {};
    (lista || []).forEach(function (t) {
      if (!t) return;
      (t.cards || []).concat(t.questoes || []).forEach(function (it) {
        if (!it || typeof it.id !== 'string') return;
        if (itens[it.id] && itens[it.id] !== t.id) erros.push('id repetido entre topicos (' + it.id + ')');
        itens[it.id] = t.id;
      });
    });
    return erros;
  }

  /* ---------- sorteio ---------- */
  function rng(seed) {
    var a = (typeof seed === 'number' && isFinite(seed) ? seed : 0) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function embaralhar(arr, rand) {
    var r = rand || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  function ordenados(lista) {
    return (lista || []).slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
  }

  /* opts: {ids (topicos), n, nivel (1-3; vazio = todos), seed, excluirAConfirmar (padrao true), somenteIds} */
  function sortearQuestoes(lista, opts) {
    opts = opts || {};
    var rand = rng(opts.seed == null ? 1 : opts.seed);
    var excluir = opts.excluirAConfirmar !== false;
    var topicosSel = opts.ids && opts.ids.length ? opts.ids : null;
    var somente = null;
    if (opts.somenteIds) { somente = {}; opts.somenteIds.forEach(function (i) { somente[i] = true; }); }
    var nivel = opts.nivel === 1 || opts.nivel === 2 || opts.nivel === 3 ? opts.nivel : null;

    var pools = [];
    ordenados(lista).forEach(function (t) {
      if (topicosSel && topicosSel.indexOf(t.id) === -1) return;
      var ids = (t.questoes || []).filter(function (q) {
        if (excluir && q.aConfirmar) return false;
        if (nivel && q.nivel !== nivel) return false;
        if (somente && !somente[q.id]) return false;
        return true;
      }).map(function (q) { return q.id; });
      if (ids.length) pools.push(embaralhar(ids, rand));
    });
    pools = embaralhar(pools, rand);

    var total = pools.reduce(function (s, p) { return s + p.length; }, 0);
    var temN = typeof opts.n === 'number' && opts.n > 0;
    var alvo = temN ? Math.floor(opts.n) : total;
    var saida = [];
    var rodada = 0;
    while (saida.length < alvo && saida.length < total) {
      for (var i = 0; i < pools.length && saida.length < alvo; i++) {
        if (rodada < pools[i].length) saida.push(pools[i][rodada]);
      }
      rodada++;
    }
    return { ids: embaralhar(saida, rand), faltaram: Math.max(0, alvo - saida.length) };
  }

  function opcoesQuantidade(disponiveis) {
    var d = Math.max(0, Math.floor(disponiveis) || 0);
    return [5, 10, 15, 20].map(function (n) {
      var ok = n <= d;
      return {
        n: n,
        habilitado: ok,
        motivo: ok ? null : (d === 0 ? 'Nenhuma questao disponivel' : 'So ha ' + d + (d === 1 ? ' questao disponivel' : ' questoes disponiveis'))
      };
    });
  }

  /* ---------- quiz ---------- */
  function indice(lista) {
    var m = {};
    (lista || []).forEach(function (t) {
      (t.questoes || []).forEach(function (q) { m[q.id] = { q: q, t: t }; });
    });
    return m;
  }

  /* ordem[i] = indice ORIGINAL da alternativa exibida na posicao i */
  function ordemAlternativas(q, rand) {
    var idx = q.alternativas.map(function (_, i) { return i; });
    return q.embaralhar === false ? idx : embaralhar(idx, rand);
  }

  /* opts: os mesmos de sortearQuestoes, mais agora (ms). seed padrao: relogio */
  function montarSessao(lista, opts) {
    opts = opts || {};
    var agora = typeof opts.agora === 'number' ? opts.agora : Date.now();
    var seed = typeof opts.seed === 'number' ? (opts.seed >>> 0) : (agora >>> 0);
    var sel = sortearQuestoes(lista, {
      ids: opts.ids, n: opts.n, nivel: opts.nivel, seed: seed,
      excluirAConfirmar: opts.excluirAConfirmar, somenteIds: opts.somenteIds
    });
    var idx = indice(lista);
    var rand = rng((seed ^ 0x9E3779B9) >>> 0);
    return {
      v: 1,
      seed: seed,
      criadaEm: agora,
      itens: sel.ids.map(function (id) { return { id: id, ordem: ordemAlternativas(idx[id].q, rand) }; }),
      respostas: [],
      idx: 0
    };
  }

  function corrigir(q, ordem, escolhaExibida) {
    var original = ordem[escolhaExibida];
    return {
      acertou: original === q.correta,
      corretaExibida: ordem.indexOf(q.correta),
      escolhidaOriginal: original === undefined ? null : original
    };
  }

  /* registra a resposta da questao atual; se ja respondida ou escolha invalida, devolve a mesma sessao */
  function responder(sessao, escolhaExibida, lista) {
    var item = sessao.itens[sessao.idx];
    if (!item || sessao.respostas.length > sessao.idx) return sessao;
    var r = indice(lista)[item.id];
    if (!r) return sessao;
    if (!(escolhaExibida >= 0 && escolhaExibida < item.ordem.length && Math.floor(escolhaExibida) === escolhaExibida)) return sessao;
    var copia = JSON.parse(JSON.stringify(sessao));
    copia.respostas.push(escolhaExibida);
    return copia;
  }

  /* avanca para a proxima questao (so depois de respondida) */
  function avancar(sessao) {
    if (sessao.respostas.length <= sessao.idx || sessao.idx >= sessao.itens.length) return sessao;
    var copia = JSON.parse(JSON.stringify(sessao));
    copia.idx += 1;
    return copia;
  }

  /* total = itens ainda existentes no conteudo; sem resposta nao conta como acerto */
  function pontuar(sessao, lista) {
    var idx = indice(lista);
    var acertos = 0, total = 0, erradas = [];
    var porTopico = [];
    var pos = {};
    sessao.itens.forEach(function (item, i) {
      var r = idx[item.id];
      if (!r) return;
      total++;
      if (pos[r.t.id] === undefined) {
        pos[r.t.id] = porTopico.length;
        porTopico.push({ id: r.t.id, tituloCurto: r.t.tituloCurto, acertos: 0, total: 0 });
      }
      var pt = porTopico[pos[r.t.id]];
      pt.total++;
      if (i < sessao.respostas.length) {
        if (corrigir(r.q, item.ordem, sessao.respostas[i]).acertou) { acertos++; pt.acertos++; }
        else erradas.push(item.id);
      }
    });
    return { acertos: acertos, total: total, pct: total ? Math.round(acertos / total * 100) : 0, porTopico: porTopico, erradas: erradas };
  }

  /* ---------- flashcards ---------- */
  function estadoVazio() { return { v: 1, porId: {} }; }

  function marcar(estado, id, marca, agora) {
    var copia = { v: 1, porId: {} };
    Object.keys(estado.porId).forEach(function (k) { copia.porId[k] = estado.porId[k]; });
    if (marca !== 'sei' && marca !== 'revisar') return copia;
    var ant = estado.porId[id];
    copia.porId[id] = { s: marca, n: (ant && ant.n ? ant.n : 0) + 1, t: typeof agora === 'number' ? agora : Date.now() };
    return copia;
  }

  /* devolve os CARDS na ordem de estudo: revisar, novos, sei (dentro do grupo: ordem original ou embaralhado se rand) */
  function ordemEstudo(cards, estado, filtro, rand) {
    var g = { revisar: [], novos: [], sei: [] };
    cards.forEach(function (c) {
      var e = estado.porId[c.id];
      (e && e.s === 'revisar' ? g.revisar : e && e.s === 'sei' ? g.sei : g.novos).push(c);
    });
    var ord = function (a) { return rand ? embaralhar(a, rand) : a; };
    if (filtro === 'revisar') return ord(g.revisar);
    if (filtro === 'novos') return ord(g.novos);
    return ord(g.revisar).concat(ord(g.novos), ord(g.sei));
  }

  function resumo(cards, estado) {
    var r = { total: cards.length, sei: 0, revisar: 0, novos: 0 };
    cards.forEach(function (c) {
      var e = estado.porId[c.id];
      if (e && e.s === 'sei') r.sei++;
      else if (e && e.s === 'revisar') r.revisar++;
      else r.novos++;
    });
    return r;
  }

  /* ids ausente = zera tudo */
  function zerar(estado, ids) {
    var copia = { v: 1, porId: {} };
    var fora = null;
    if (ids) { fora = {}; ids.forEach(function (i) { fora[i] = true; }); }
    Object.keys(estado.porId).forEach(function (k) {
      if (fora && !fora[k]) copia.porId[k] = estado.porId[k];
    });
    return copia;
  }

  var core = {
    registrarTopico: registrarTopico, topicos: topicos, limparRegistro: limparRegistro,
    validarTopico: validarTopico, validarTodos: validarTodos,
    rng: rng, embaralhar: embaralhar, sortearQuestoes: sortearQuestoes, opcoesQuantidade: opcoesQuantidade,
    ordemAlternativas: ordemAlternativas, montarSessao: montarSessao,
    corrigir: corrigir, responder: responder, avancar: avancar, pontuar: pontuar,
    estadoVazio: estadoVazio, marcar: marcar, ordemEstudo: ordemEstudo, resumo: resumo, zerar: zerar,
    HREFS: HREFS
  };
  P.core = core;
  P.registrarTopico = registrarTopico;

  /* registra o que os arquivos de dados enfileiraram antes do core e esvazia a fila */
  var fila = P._fila || [];
  P._fila = [];
  fila.forEach(registrarTopico);

  if (typeof module !== 'undefined' && module.exports) module.exports = core;
})(typeof window !== 'undefined' ? window : globalThis);
