/* praticar/store.js - persistencia local do Praticar (EO.praticar.store).
 * Nunca lanca erro: JSON corrompido ou versao desconhecida devolve o padrao; sem storage cai para memoria
 * e disponivel() devolve false. localStorage e sessionStorage sao injetaveis por criar({local, session}). */
(function (root) {
  var EO = root.EO = root.EO || {};
  var P = EO.praticar = EO.praticar || {};

  var KEYS = {
    cards: 'eo_praticar_cards_v1',
    prefs: 'eo_praticar_prefs_v1',
    sessao: 'eo_praticar_sessao_v1',
    resultado: 'eo_praticar_resultado_v1'
  };
  /* de qual storage cada chave depende */
  var ONDE = {};
  ONDE[KEYS.cards] = 'local';
  ONDE[KEYS.prefs] = 'local';
  ONDE[KEYS.sessao] = 'session';
  ONDE[KEYS.resultado] = 'session';

  function clone(v) {
    if (v === null || typeof v !== 'object') return v;
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; }
  }

  function criar(opts) {
    opts = opts || {};
    var storages = { local: opts.local || null, session: opts.session || null };
    var memoria = { local: {}, session: {} };

    function onde(chave) { return ONDE[chave] || 'local'; }

    function lerBruto(chave) {
      var w = onde(chave);
      if (Object.prototype.hasOwnProperty.call(memoria[w], chave)) return memoria[w][chave];
      var s = storages[w];
      if (!s) return null;
      try { return s.getItem(chave); } catch (e) { return null; }
    }

    /* devolve true se gravou no storage real, false se ficou so em memoria */
    function gravar(chave, valor) {
      var w = onde(chave);
      var txt;
      try { txt = JSON.stringify(valor); } catch (e) { return false; }
      if (typeof txt !== 'string') return false;
      var s = storages[w];
      if (s) {
        try {
          s.setItem(chave, txt);
          delete memoria[w][chave];
          return true;
        } catch (e) { /* cai para memoria */ }
      }
      memoria[w][chave] = txt;
      return false;
    }

    function remover(chave) {
      var w = onde(chave);
      delete memoria[w][chave];
      var s = storages[w];
      if (s) { try { s.removeItem(chave); } catch (e) { /* ignora */ } }
    }

    /* migradores: {[versaoOrigem]: function(obj) -> obj com v = versaoOrigem + 1} */
    function ler(chave, versao, padrao, migradores) {
      try {
        var bruto = lerBruto(chave);
        if (bruto == null) return clone(padrao);
        var obj = JSON.parse(bruto);
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return clone(padrao);
        var guarda = 0;
        while (obj.v !== versao && guarda++ < 50) {
          var m = migradores && typeof obj.v === 'number' && migradores[obj.v];
          if (typeof m !== 'function') return clone(padrao);
          var novo = m(obj);
          if (novo === null || typeof novo !== 'object' || novo.v === obj.v) return clone(padrao);
          obj = novo;
        }
        if (obj.v !== versao) return clone(padrao);
        return obj;
      } catch (e) {
        return clone(padrao);
      }
    }

    function sonda(w) {
      var s = storages[w];
      if (!s) return false;
      try {
        var k = '__eo_praticar_teste__';
        s.setItem(k, '1');
        s.removeItem(k);
        return true;
      } catch (e) { return false; }
    }

    /* true so se localStorage e sessionStorage aceitam escrita */
    function disponivel() { return sonda('local') && sonda('session'); }

    return { KEYS: KEYS, ler: ler, gravar: gravar, remover: remover, disponivel: disponivel, criar: criar };
  }

  function nativo(nome) {
    try { return root[nome] || null; } catch (e) { return null; }
  }

  var store = criar({ local: nativo('localStorage'), session: nativo('sessionStorage') });
  P.store = store;

  if (typeof module !== 'undefined' && module.exports) module.exports = store;
})(typeof window !== 'undefined' ? window : globalThis);
