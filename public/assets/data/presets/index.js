/* data/presets/index.js - registrador dos presets do diagrama (etapa 4.4 A). Carregar ANTES dos 4 arquivos de preset
 * e antes de legacy/aciona.js. Sem DOM, sem fetch; so define EO.presets.
 *
 * API:
 *   EO.presets.register({id, titulo, descricao, diagrama:{comps, wires, compIdCounter}, roteiro:[...], referencia})
 *   EO.presets.list() -> [{id, titulo, descricao, referencia}]      EO.presets.get(id) -> preset | null
 *   EO.presets.builder() -> {c(sym,x,y,id,label,extra), w(a,pa,b,pb), snapshot()}   (monta o snapshot)
 *   EO.presets.applyAction(comps, passo) -> componente atuado | null   (executa {acao,id} do roteiro)
 *
 * Formato de `diagrama` = o de cloneDiagramForHistory/restoreDiagramFromSnapshot (legacy/aciona.js):
 *   comps: [{id,label,sym,x,y,w,h,energized,fault,color,time,timerMode,forceState,_uid,_pressed,_selected,
 *            _timerDone,_tAcc,_offDelayActive,__prevCoilOn,_actuated}]
 *   wires: [{fromUid,fromPort,toUid,toPort}]       compIdCounter: proximo _uid livre
 * Roteiro: lista de passos
 *   {acao:'pressionar'|'soltar', id}      botoeira (_pressed)
 *   {acao:'ligar'|'desligar', id}         seletora (_selected)
 *   {acao:'disparar'|'rearmar', id}       fusivel/disjuntor/termico (fault = true/false; true = aberto)
 *   {espera:s}                            avanca s segundos (o executor usa passos de 0,1 s)
 *   {esperado:{rotulo, bobinas:{id:0|1}, lampadas:{id:0|1}, motores:{id:{estado,sequencia}}, curto:bool}}
 * Os comandos e potencias dos presets sao variantes didaticas A CONFIRMAR. */
(function (root) {
  var EO = root.EO = root.EO || {};
  var GRID = 20;
  var lista = [], porId = {};

  /* dimensoes em celulas de grade [w,h]; padrao [2,3] (confira com SYMBOL_DEFS: tests/sim/presets.test.js) */
  var DIMS = {
    power_l1: [2, 2], power_l2: [2, 2], power_l3: [2, 2], power_n: [2, 2], ground: [2, 2],
    motor_3ph: [3, 4], contactor_main_3p: [4, 3], motor_3ph_6t: [4, 4], motor_3ph_3t: [4, 4], junction: [1, 1]
  };
  function timerModeOf(sym) {
    if (/^contact_timer_on_/.test(sym)) return 'onDelay';
    if (/^contact_timer_off_/.test(sym)) return 'offDelay';
    return '';
  }

  /* portas em fracao de w/h por simbolo (espelha SYMBOL_DEFS/defs-extra; padrao: topo e base no centro) */
  var T3 = [[0.2, 0], [0.5, 0], [0.8, 0]], B3 = [[0.2, 1], [0.5, 1], [0.8, 1]];
  var PORTF = {
    contactor_main_3p: T3.concat(B3), motor_3ph_6t: T3.concat(B3), motor_3ph_3t: T3,
    junction: [[0.5, 0.5]], ground: [[0.5, 0]]
  };
  function portXY(c, pi) {
    var f = (PORTF[c.sym] || [[0.5, 0], [0.5, 1]])[pi];
    return [Math.round((c.x + f[0] * c.w) * 1e6) / 1e6, Math.round((c.y + f[1] * c.h) * 1e6) / 1e6];
  }

  function builder() {
    var comps = [], wires = [], uid = 1, juncs = {}, ligados = {};
    return {
      /* mundo (x,y) da porta pi de c */
      at: portXY,
      /* junction (so um ponto) com centro em (x,y); reutiliza a que ja existe nesse ponto. id ' ' (nao vazio: diagram-io descarta
       * id vazio; o renderer nao desenha nada visivel) => sem rotulo na tela */
      j: function (x, y) {
        var k = x + ',' + y;
        if (!juncs[k]) juncs[k] = this.c('junction', x - GRID / 2, y - GRID / 2, ' ', ' ');
        return juncs[k];
      },
      /* rota ortogonal: itens [comp,porta] ou [x,y]; cada ponto vira junction; liga itens consecutivos (sem duplicar fios) */
      route: function (nodes) {
        var self = this;
        var itens = nodes.map(function (n) { return typeof n[0] === 'object' ? { c: n[0], p: n[1] } : { c: self.j(n[0], n[1]), p: 0 }; });
        for (var i = 0; i + 1 < itens.length; i++) {
          var a = itens[i], b = itens[i + 1];
          var k = [a.c._uid + ':' + a.p, b.c._uid + ':' + b.p].sort().join('|');
          if (!ligados[k]) { ligados[k] = 1; self.w(a.c, a.p, b.c, b.p); }
        }
      },
      c: function (sym, x, y, id, label, extra) {
        var d = DIMS[sym] || [2, 3];
        var c = {
          id: id, label: label || id, sym: sym, x: x, y: y, w: d[0] * GRID, h: d[1] * GRID,
          energized: false, fault: false, color: 'green', time: 3, timerMode: timerModeOf(sym), forceState: '',
          _uid: uid++, _pressed: false, _selected: false, _timerDone: false, _tAcc: 0, _offDelayActive: false,
          __prevCoilOn: false, _actuated: false
        };
        if (extra) Object.keys(extra).forEach(function (k) { c[k] = extra[k]; });
        comps.push(c);
        return c;
      },
      w: function (a, pa, b, pb) { wires.push({ fromUid: a._uid, fromPort: pa, toUid: b._uid, toPort: pb }); },
      snapshot: function () { return { comps: comps, wires: wires, compIdCounter: uid }; }
    };
  }

  var ALVO = {
    pressionar: /^pushbutton/, soltar: /^pushbutton/, ligar: /^selector/, desligar: /^selector/,
    disparar: /^(fuse|circuit_breaker|overload_relay)$/, rearmar: /^(fuse|circuit_breaker|overload_relay)$/
  };
  function applyAction(comps, passo) {
    var re = ALVO[passo.acao];
    if (!re) return null;
    var c = comps.find(function (x) { return x.id === passo.id && re.test(x.sym); });
    if (!c) return null;
    if (passo.acao === 'pressionar') c._pressed = true;
    else if (passo.acao === 'soltar') c._pressed = false;
    else if (passo.acao === 'ligar') c._selected = true;
    else if (passo.acao === 'desligar') c._selected = false;
    else if (passo.acao === 'disparar') c.fault = true;
    else if (passo.acao === 'rearmar') c.fault = false;
    return c;
  }

  EO.presets = {
    register: function (p) {
      if (!p || !p.id) throw new Error('preset sem id');
      if (porId[p.id]) lista[lista.indexOf(porId[p.id])] = p; else lista.push(p);
      porId[p.id] = p;
      return p;
    },
    list: function () { return lista.map(function (p) { return { id: p.id, titulo: p.titulo, descricao: p.descricao, referencia: p.referencia }; }); },
    get: function (id) { return porId[id] || null; },
    builder: builder,
    applyAction: applyAction,
    GRID: GRID
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.presets;
})(typeof window !== 'undefined' ? window : globalThis);
