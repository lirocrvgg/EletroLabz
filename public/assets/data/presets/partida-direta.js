/* data/presets/partida-direta.js - partida direta com selo (diagrama). Requer data/presets/index.js.
 * Potencia: L1-L3 -> F1-F3 -> K1 (contator 3P) -> M1 (motor 3 terminais). Comando: L1-N, F4 (disjuntor), FR (termico),
 * S0 (NF), S1 (NA) com selo K1, bobina K1 e sinaleiro H1. Tensao/potencia/codigos de letra: A CONFIRMAR. */
(function (root) {
  var P = root.EO.presets, b = P.builder();

  /* Layout (grade 20): potencia a esquerda, comando a direita. Fios so horizontais/verticais; cantos e derivacoes
   * sao junctions (so pontos). Barramento de neutro embaixo (y=660). */
  /* potencia */
  var l1 = b.c('power_l1', 40, 20, 'L1', 'Fase L1'), l2 = b.c('power_l2', 100, 20, 'L2', 'Fase L2'), l3 = b.c('power_l3', 160, 20, 'L3', 'Fase L3');
  var f1 = b.c('circuit_breaker', 40, 80, 'F1', 'Disjuntor F1'), f2 = b.c('circuit_breaker', 100, 80, 'F2', 'Disjuntor F2'), f3 = b.c('circuit_breaker', 160, 80, 'F3', 'Disjuntor F3');
  var k1p = b.c('contactor_main_3p', 80, 220, 'K1', 'Contator K1');
  var m1 = b.c('motor_3ph_3t', 80, 340, 'M1', 'Motor M1');

  /* comando */
  var lc = b.c('power_l1', 340, 20, 'L1', 'Fase L1 (comando)');
  var f4 = b.c('circuit_breaker', 340, 80, 'F4', 'Disjuntor de comando F4');
  var fr = b.c('overload_relay', 340, 180, 'FR', 'Relé térmico FR');
  var s0 = b.c('pushbutton_nc', 340, 280, 'S0', 'Desliga S0');
  var s1 = b.c('pushbutton_no', 340, 420, 'S1', 'Liga S1');
  var selo = b.c('contact_no', 400, 420, 'K1', 'Selo K1');
  var k1c = b.c('coil', 340, 560, 'K1', 'Bobina K1');
  var h1 = b.c('lamp', 460, 560, 'H1', 'Sinaleiro H1');
  var n = b.c('power_n', 400, 680, 'N', 'Neutro');

  /* potencia: L -> F -> K1 (jogs ortogonais de 60 para 24 px) -> motor */
  [[l1, f1], [l2, f2], [l3, f3]].forEach(function (p) { b.w(p[0], 1, p[1], 0); });
  b.route([[f1, 1], [60, 180], [96, 180], [k1p, 0]]);
  b.w(f2, 1, k1p, 1);
  b.route([[f3, 1], [180, 180], [144, 180], [k1p, 2]]);
  for (var i = 0; i < 3; i++) b.w(k1p, 3 + i, m1, i);

  /* comando: tronco L1-F4-FR-S0; barra A (y=380): S1 // selo; barra B (y=520): bobina e lampada; neutro (y=660) */
  b.w(lc, 1, f4, 0); b.w(f4, 1, fr, 0); b.w(fr, 1, s0, 0);
  b.route([[s0, 1], [360, 380], [s1, 0]]);
  b.route([[360, 380], [420, 380], [selo, 0]]);
  b.route([[s1, 1], [360, 520], [k1c, 0]]);
  b.route([[selo, 1], [420, 520], [360, 520]]);
  b.route([[420, 520], [480, 520], [h1, 0]]);
  b.route([[k1c, 1], [360, 660], [420, 660], [480, 660], [h1, 1]]);
  b.route([[420, 660], [n, 0]]);

  var parado = { estado: 'parado', sequencia: null };
  P.register({
    id: 'partida-direta',
    titulo: 'Partida direta com selo',
    descricao: 'Motor trifásico de 3 terminais acionado por K1 com selo, botoeiras S0/S1, relé térmico FR e disjuntor de comando F4. Proteções armadas.',
    diagrama: b.snapshot(),
    roteiro: [
      { esperado: { rotulo: 'repouso', bobinas: { K1: 0 }, lampadas: { H1: 0 }, motores: { M1: parado }, curto: false } },
      { acao: 'pressionar', id: 'S1' }, { espera: 0.2 },
      { esperado: { rotulo: 'S1 pressionado', bobinas: { K1: 1 }, lampadas: { H1: 1 }, motores: { M1: { estado: 'ligado', sequencia: 'direta' } }, curto: false } },
      { acao: 'soltar', id: 'S1' }, { espera: 0.2 },
      { esperado: { rotulo: 'S1 solto, selo mantém', bobinas: { K1: 1 }, lampadas: { H1: 1 }, motores: { M1: { estado: 'ligado', sequencia: 'direta' } }, curto: false } },
      { acao: 'pressionar', id: 'S0' }, { espera: 0.2 }, { acao: 'soltar', id: 'S0' }, { espera: 0.2 },
      { esperado: { rotulo: 'S0 desliga', bobinas: { K1: 0 }, lampadas: { H1: 0 }, motores: { M1: parado }, curto: false } },
      { acao: 'disparar', id: 'FR' }, { acao: 'pressionar', id: 'S1' }, { espera: 0.2 }, { acao: 'soltar', id: 'S1' }, { espera: 0.2 },
      { esperado: { rotulo: 'FR disparado bloqueia S1', bobinas: { K1: 0 }, lampadas: { H1: 0 }, motores: { M1: parado }, curto: false } },
      { acao: 'rearmar', id: 'FR' }, { espera: 0.3 },
      { esperado: { rotulo: 'FR rearmado não religa sozinho', bobinas: { K1: 0 }, lampadas: { H1: 0 }, motores: { M1: parado }, curto: false } },
      { acao: 'pressionar', id: 'S1' }, { espera: 0.2 }, { acao: 'soltar', id: 'S1' }, { espera: 0.2 },
      { esperado: { rotulo: 'religado', bobinas: { K1: 1 }, lampadas: { H1: 1 }, motores: { M1: { estado: 'ligado', sequencia: 'direta' } }, curto: false } },
      { acao: 'disparar', id: 'F4' }, { espera: 0.3 },
      { esperado: { rotulo: 'F4 aberto derruba K1', bobinas: { K1: 0 }, lampadas: { H1: 0 }, motores: { M1: parado }, curto: false } }
    ],
    referencia: 'a confirmar'
  });
})(typeof window !== 'undefined' ? window : globalThis);
