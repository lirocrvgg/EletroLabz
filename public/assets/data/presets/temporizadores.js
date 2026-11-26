/* data/presets/temporizadores.js - retardo na energizacao (TON) e na desenergizacao (TOF) de 2 s (diagrama).
 * Requer index.js. Ramo 1: S1 (seletora) -> KT1 (bobina temporizada) ; contato NA ret. energ. KT1 -> H1.
 * Ramo 2: S2 (seletora) -> KT2 (bobina temporizada desl.) ; contato NA ret. desener. KT2 -> H2. Tempos: A CONFIRMAR. */
(function (root) {
  var P = root.EO.presets, b = P.builder();

  /* Layout (grade 20): barramento de fase no topo (y=180), 4 ramos verticais paralelos, barramento de neutro embaixo (y=420).
   * Colunas x=140 (S1/KT1), 220 (KT1/H1), 300 (S2/KT2), 380 (KT2/H2). Fios so horizontais/verticais. */
  var lc = b.c('power_l1', 240, 20, 'L1', 'Fase L1');
  var f4 = b.c('circuit_breaker', 240, 80, 'F4', 'Disjuntor F4');
  /* ramo 1: retardo na energizacao */
  var s1 = b.c('selector_2pos', 120, 220, 'S1', 'Seletora S1');
  var kt1 = b.c('timer_relay', 120, 320, 'KT1', 'Temporizador KT1', { time: 2 });
  var n1 = b.c('power_n', 120, 440, 'N', 'Neutro');
  var ct1 = b.c('contact_timer_on_no', 200, 220, 'KT1', 'NA ret. energ. KT1', { time: 2 });
  var h1 = b.c('lamp', 200, 320, 'H1', 'Sinaleiro H1');
  var n2 = b.c('power_n', 200, 440, 'N', 'Neutro');
  /* ramo 2: retardo na desenergizacao */
  var s2 = b.c('selector_2pos', 280, 220, 'S2', 'Seletora S2');
  var kt2 = b.c('timer_relay_off', 280, 320, 'KT2', 'Temporizador KT2 (desl.)', { time: 2 });
  var n3 = b.c('power_n', 280, 440, 'N', 'Neutro');
  var ct2 = b.c('contact_timer_off_no', 360, 220, 'KT2', 'NA ret. desener. KT2', { time: 2 });
  var h2 = b.c('lamp', 360, 320, 'H2', 'Sinaleiro H2');
  var n4 = b.c('power_n', 360, 440, 'N', 'Neutro');

  b.w(lc, 1, f4, 0);
  /* barramento de fase (y=180) com derivacao para cada ramo */
  b.route([[f4, 1], [260, 180]]);
  b.route([[140, 180], [220, 180], [260, 180], [300, 180], [380, 180]]);
  b.route([[140, 180], [s1, 0]]);
  b.route([[220, 180], [ct1, 0]]);
  b.route([[300, 180], [s2, 0]]);
  b.route([[380, 180], [ct2, 0]]);
  b.w(s1, 1, kt1, 0); b.w(ct1, 1, h1, 0); b.w(s2, 1, kt2, 0); b.w(ct2, 1, h2, 0);
  /* barramento de neutro (y=420) com um N por ramo */
  b.route([[kt1, 1], [140, 420], [220, 420], [300, 420], [380, 420]]);
  b.route([[220, 420], [h1, 1]]);
  b.route([[300, 420], [kt2, 1]]);
  b.route([[380, 420], [h2, 1]]);
  b.route([[140, 420], [n1, 0]]);
  b.route([[220, 420], [n2, 0]]);
  b.route([[300, 420], [n3, 0]]);
  b.route([[380, 420], [n4, 0]]);

  function ex(rot, o) {
    return { esperado: { rotulo: rot, bobinas: o.b || {}, lampadas: o.l || {}, curto: false } };
  }
  P.register({
    id: 'temporizadores',
    titulo: 'Temporizadores TON e TOF',
    descricao: 'S1 aciona KT1 (retardo de 2 s na energização) que acende H1; S2 aciona KT2 (retardo de 2 s na desenergização) que mantém H2 aceso por 2 s após desligar. Proteção armada.',
    diagrama: b.snapshot(),
    roteiro: [
      ex('repouso', { b: { KT1: 0, KT2: 0 }, l: { H1: 0, H2: 0 } }),
      { acao: 'ligar', id: 'S1' }, { espera: 0.2 }, ex('TON ligou: H1 ainda apagado', { b: { KT1: 1 }, l: { H1: 0 } }),
      { espera: 1.6 }, ex('t=1,8 s: H1 ainda apagado', { b: { KT1: 1 }, l: { H1: 0 } }),
      { espera: 0.4 }, ex('t=2,2 s: H1 aceso', { b: { KT1: 1 }, l: { H1: 1 } }),
      { acao: 'desligar', id: 'S1' }, { espera: 0.2 }, ex('TON desligou: H1 apaga', { b: { KT1: 0 }, l: { H1: 0 } }),
      { acao: 'ligar', id: 'S2' }, { espera: 0.2 }, ex('TOF ligou: H2 aceso', { b: { KT2: 1 }, l: { H2: 1 } }),
      { acao: 'desligar', id: 'S2' }, { espera: 1.0 }, ex('TOF: H2 mantém (1 s)', { b: { KT2: 0 }, l: { H2: 1 } }),
      { acao: 'ligar', id: 'S2' }, { espera: 0.2 }, { acao: 'desligar', id: 'S2' }, { espera: 1.0 },
      ex('religar antes de T zera a contagem', { b: { KT2: 0 }, l: { H2: 1 } }),
      { espera: 1.4 }, ex('TOF: H2 apaga após T', { b: { KT2: 0 }, l: { H2: 0 } })
    ],
    referencia: 'a confirmar'
  });
})(typeof window !== 'undefined' ? window : globalThis);
