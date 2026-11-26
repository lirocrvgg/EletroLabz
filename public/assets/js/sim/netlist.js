/* sim/netlist.js - conectividade eletrica do diagrama (etapa 4.1: reproduz exatamente o union-find de runSimStep).
 * Puro: sem DOM e sem globais legadas. Chave de no = "<_uid>_<porta>". */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.sim = EO.sim || {};

  /* build(components, wires, defs) -> { find, node(uid,port), sources:{L1,L2,L3,N}, poles(c), loads(c) }
   * sources.* sao Set de raizes (resolvidas apos todas as unioes). poles/loads: campos opcionais da def
   * (def.poles / def.windings), padrao [[0,1]]; ainda nao usados pelo motor na 4.1. */
  function build(components, wires, defs) {
    var parent = {};
    function find(k) {
      if (parent[k] === undefined) parent[k] = k;
      if (parent[k] !== k) parent[k] = find(parent[k]);
      return parent[k];
    }
    function union(a, b) { parent[find(a)] = find(b); }
    function node(uid, port) { return find(uid + '_' + port); }

    components.forEach(function (c) {
      defs[c.sym].ports.forEach(function (_, i) { find(c._uid + '_' + i); });
    });
    wires.forEach(function (w) {
      union(w.from.comp._uid + '_' + w.from.port, w.to.comp._uid + '_' + w.to.port);
    });

    var sources = { L1: new Set(), L2: new Set(), L3: new Set(), N: new Set(), P24: new Set(), M0: new Set() };
    var tags = { power_l1: 'L1', power_l2: 'L2', power_l3: 'L3', power_n: 'N' };
    components.forEach(function (c) {
      var def = defs[c.sym];
      /* fonte por porta (E3): def.portTags[i] (ex.: supply_3ph); tag desconhecida (ex.: 'PE') e ignorada */
      if (def.portTags) {
        def.portTags.forEach(function (t, i) { if (t && sources[t]) sources[t].add(find(c._uid + '_' + i)); });
        return;
      }
      var tag = tags[c.sym] || (def.simTag && sources[def.simTag] && def.type === 'source' ? def.simTag : null);
      if (tag) def.ports.forEach(function (_, i) { sources[tag].add(find(c._uid + '_' + i)); });
    });

    return {
      find: find,
      node: node,
      sources: sources,
      poles: function (c) { return defs[c.sym].poles || [[0, 1]]; },
      loads: function (c) { return defs[c.sym].windings || [[0, 1]]; }
    };
  }

  /* Mascaras de fontes por no: L1=1, L2=2, L3=4, N=8 (FASES = 7). */
  var BIT = { L1: 1, L2: 2, L3: 4, N: 8, P24: 16, M0: 32 };
  var FASES = 7;
  var CHAVES = ['L1', 'L2', 'L3', 'N', 'P24', 'M0'];
  var NOMES = ['L1', 'L2', 'L3', 'N', '+24V', '0V']; /* nomes de exibicao, na ordem de CHAVES */

  /* Regra unica de tensao entre dois nos (docs/PLANO_FASE4.md B1/B1b/B2/B3), simetrica:
   * V(a,b) = (fases(a) != vazio e (N(b) ou fases(b) \ fases(a) != vazio)) ou o simetrico.
   * Vale para bobina, lampada e motor de 2 portas; mesma fase nos dois lados (sem N) = sem tensao.
   * Dominio CC (E3): tambem ha tensao com +24 V de um lado e 0 V do outro. Misturar CA e CC entre os terminais
   * nao da tensao (L1 x 0 V, +24 V x N ...). */
  function voltage(ma, mb) {
    if (((ma & BIT.P24) !== 0 && (mb & BIT.M0) !== 0) || ((ma & BIT.M0) !== 0 && (mb & BIT.P24) !== 0)) return true;
    var pa = ma & FASES, pb = mb & FASES;
    return (pa !== 0 && ((mb & BIT.N) !== 0 || (pb & ~pa) !== 0)) ||
      (pb !== 0 && ((ma & BIT.N) !== 0 || (pa & ~pb) !== 0));
  }

  /* mascara -> ['L1','N',...] (ordem fixa) */
  function tagsOf(mask) {
    return CHAVES.filter(function (t) { return (mask & BIT[t]) !== 0; }).map(function (t) { return NOMES[CHAVES.indexOf(t)]; });
  }

  /* mascara inicial por raiz de no: { raiz: mascara } a partir de net.sources */
  function seedMasks(sources) {
    var m = {};
    CHAVES.forEach(function (t) {
      if (sources[t]) sources[t].forEach(function (r) { m[r] = (m[r] || 0) | BIT[t]; });
    });
    return m;
  }

  EO.sim.netlist = { build: build, voltage: voltage, tagsOf: tagsOf, seedMasks: seedMasks, BIT: BIT, FASES: FASES, NOMES: NOMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.sim.netlist;
})(typeof window !== 'undefined' ? window : globalThis);
