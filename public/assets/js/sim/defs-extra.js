/* sim/defs-extra.js - definicoes dos 4 simbolos novos da etapa 4.4 no formato de SYMBOL_DEFS (legacy/aciona.js).
 * A parte B mescla com: Object.assign(SYMBOL_DEFS, EO.sim.defsExtra.defs).
 * NOMENCLATURA A CONFIRMAR (nomes, codigos de letra e simbologia IEC 60617 / terminais IEC 60034-8).
 * Geometria: w/h em celulas de grade (DIAG_GRID = 20 px); portas em fracao de w/h (x,y) como nos demais simbolos.
 * Campos opcionais lidos por sim/*: poles = [[a,b],...] (padrao [[0,1]]), windings = [[a,b],...] (padrao [[0,1]]).
 * Puro: sem DOM; nada alem da propria definicao e executado na carga. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.sim = EO.sim || {};

  var top3 = [{ x: 0.2, y: 0 }, { x: 0.5, y: 0 }, { x: 0.8, y: 0 }];
  var bot3 = [{ x: 0.2, y: 1 }, { x: 0.5, y: 1 }, { x: 0.8, y: 1 }];

  var defs = {
    /* contator de potencia 3 polos: 0,1,2 em cima; 3,4,5 embaixo; conduz se a bobina de mesmo id esta ligada */
    contactor_main_3p: { name: 'Contator 3P', w: 4, h: 3, ports: top3.concat(bot3), type: 'contact_power', poles: [[0, 3], [1, 4], [2, 5]] },
    /* motor trifasico de 6 terminais: 0-2 = U1 V1 W1 (cima), 3-5 = U2 V2 W2 (baixo); enrolamentos U1-U2, V1-V2, W1-W2 */
    motor_3ph_6t: { name: 'Motor 3~ 6T', w: 4, h: 4, ports: top3.concat(bot3), type: 'motor3', windings: [[0, 3], [1, 4], [2, 5]] },
    /* motor trifasico de 3 terminais (U V W, fechamento interno): partida direta e reversao */
    motor_3ph_3t: { name: 'Motor 3~ 3T', w: 4, h: 4, ports: top3.slice(), type: 'motor3', windings: [[0, 1], [1, 2], [2, 0]] },
    /* ponto de ligacao de 1 porta (ex.: ponto estrela) */
    junction: { name: 'Junção', w: 1, h: 1, ports: [{ x: 0.5, y: 0.5 }], type: 'junction' }
  };

  /* ---- Acionamentos v2 (E3): simbolos P2/P3 de docs/PLANO_ACIONA_V2.md §1.2. So eletrica (type/ports/poles/portTags);
   * o desenho vive em render/symbols.js. Nomenclatura e terminais a confirmar. Frações de porta em w/h:
   * 3 polos em 4 celulas = 0,2/0,5/0,8 (0,8/2/3,2 celulas). Ordem das portas: topo (1,3,5) depois base (2,4,6). */
  var two = [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }];
  var poles3 = [[0, 3], [1, 4], [2, 5]];
  var defsV2 = {
    /* alimentacao CC: fonte de +24 V e de 0 V (2 portas ligadas entre si, como power_l1) */
    power_24v: { name: '+24 V', w: 2, h: 2, ports: two.slice(), type: 'source', simTag: 'P24' },
    power_0v: { name: '0 V', w: 2, h: 2, ports: two.slice(), type: 'source', simTag: 'M0' },
    /* alimentacao 3~+N+PE de 6x2 celulas: portas L1 L2 L3 N PE em (1..5, 2) => x = 1/6..5/6, y = 1. Sem polos (portas
     * independentes); PE nao e fonte de tensao no motor */
    supply_3ph: { name: 'Alimentação 3~+N+PE', w: 6, h: 2, ports: [1, 2, 3, 4, 5].map(function (k) { return { x: k / 6, y: 1 }; }),
      type: 'source', portTags: ['L1', 'L2', 'L3', 'N', 'PE'], poles: [] },
    /* disjuntor-motor 3P: abre os 3 polos se algum componente breaker_3p do mesmo id esta em falha */
    motor_breaker_3p: { name: 'Disjuntor-motor 3P', w: 4, h: 3, ports: top3.concat(bot3), type: 'breaker_3p', poles: poles3 },
    /* auxiliar 13-14 do disjuntor-motor: NA que fecha quando o grupo de mesmo id disparou */
    breaker_aux_no: { name: 'Aux. do disjuntor-motor', w: 2, h: 3, ports: two.slice(), type: 'trip_contact' },
    /* termico de potencia (1/3/5 - 2/4/6): conduz sempre; a falha dele dispara o grupo de mesmo id */
    overload_3p: { name: 'Térmico (potência)', w: 4, h: 3, ports: top3.concat(bot3), type: 'overload_power', poles: poles3 },
    /* termico auxiliar NA 97-98: fecha quando o grupo de mesmo id disparou */
    overload_no: { name: 'Térmico NA', w: 2, h: 3, ports: two.slice(), type: 'trip_contact' },
    emergency_stop_nc: { name: 'Emergência com retenção', w: 2, h: 3, ports: two.slice(), type: 'pushbutton_latch' },
    selector_2pos_nc: { name: 'Seletora NF', w: 2, h: 3, ports: two.slice(), type: 'selector' },
    limit_switch_nc: { name: 'FC NF', w: 2, h: 3, ports: two.slice(), type: 'limit_switch' },
    buzzer: { name: 'Sirene', w: 2, h: 3, ports: two.slice(), type: 'lamp' },
    motor_1ph: { name: 'Motor 1~', w: 2, h: 3, ports: two.slice(), type: 'motor' }
  };

  EO.sim.defsExtra = {
    defs: defs,
    defsV2: defsV2,
    nomenclatura: 'a confirmar',
    merge: function (target) { Object.assign(target, defs); return Object.assign(target, defsV2); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.sim.defsExtra;
})(typeof window !== 'undefined' ? window : globalThis);
