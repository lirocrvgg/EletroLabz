/* data/presets/estrela-triangulo.js - partida estrela-triangulo com temporizador KT de 3 s (diagrama). Requer index.js.
 * Potencia: L1-L3 -> F1-F3 -> K1 -> U1 V1 W1 do motor de 6 terminais. K2 liga U2 V2 W2 ao ponto estrela J1.
 * K3 liga U2-V1, V2-W1, W2-U1 (fechamento em triangulo; variante didatica A CONFIRMAR).
 * Comando: L1-N, F4, FR, S0 (NF), (S1 // K1) -> A ; A -> K1 e KT ;
 *   A -> NF temp. KT -> NF K3 -> K2 ; A -> NA temp. KT -> NF K2 -> K3. Tempo, tensao e ligacao: A CONFIRMAR. */
(function (root) {
  var P = root.EO.presets, b = P.builder();

  /* Layout (grade 20): potencia a esquerda (x<=420), comando a direita (x>=540). Fios so horizontais/verticais; cantos e
   * derivacoes sao junctions. K1 e M1 alinhados (U1 V1 W1 em x=116/140/164); K2 abaixo do motor alinhado a U2 V2 W2 e
   * fechando as 3 fases no ponto estrela J1 (y=700); K3 a direita: topos em U2 V2 W2 (linhas y=560/540/520), bases ligadas
   * a V1 W1 U1 por subidas em x=400/380/360 e linhas y=320/340/360 (3 cruzamentos sem ponto em cada trecho). */
  var l1 = b.c('power_l1', 60, 20, 'L1', 'Fase L1'), l2 = b.c('power_l2', 120, 20, 'L2', 'Fase L2'), l3 = b.c('power_l3', 180, 20, 'L3', 'Fase L3');
  var f1 = b.c('circuit_breaker', 60, 80, 'F1', 'Disjuntor F1'), f2 = b.c('circuit_breaker', 120, 80, 'F2', 'Disjuntor F2'), f3 = b.c('circuit_breaker', 180, 80, 'F3', 'Disjuntor F3');
  var k1p = b.c('contactor_main_3p', 100, 220, 'K1', 'Contator K1');
  var m1 = b.c('motor_3ph_6t', 100, 400, 'M1', 'Motor M1 (6 terminais)');
  var k3p = b.c('contactor_main_3p', 260, 600, 'K3', 'Contator K3 (triângulo)');
  var k2p = b.c('contactor_main_3p', 100, 600, 'K2', 'Contator K2 (estrela)');
  var j1 = b.c('junction', 130, 690, 'J1', 'Ponto estrela J1');

  var lc = b.c('power_l1', 540, 20, 'L1', 'Fase L1 (comando)');
  var f4 = b.c('circuit_breaker', 540, 80, 'F4', 'Disjuntor de comando F4');
  var fr = b.c('overload_relay', 540, 160, 'FR', 'Relé térmico FR');
  var s0 = b.c('pushbutton_nc', 540, 240, 'S0', 'Desliga S0');
  var s1 = b.c('pushbutton_no', 540, 340, 'S1', 'Liga S1');
  var sel = b.c('contact_no', 600, 340, 'K1', 'Selo K1');
  var cK1 = b.c('coil', 540, 440, 'K1', 'Bobina K1');
  var cKT = b.c('timer_relay', 680, 440, 'KT', 'Temporizador KT', { time: 3 });
  var ktNc = b.c('contact_timer_on_nc', 760, 440, 'KT', 'NF temp. KT', { time: 3 });
  var nc3 = b.c('contact_nc', 760, 520, 'K3', 'Intertrav. NF K3');
  var cK2 = b.c('coil', 760, 600, 'K2', 'Bobina K2');
  var ktNo = b.c('contact_timer_on_no', 840, 440, 'KT', 'NA temp. KT', { time: 3 });
  var nc2 = b.c('contact_nc', 840, 520, 'K2', 'Intertrav. NF K2');
  var cK3 = b.c('coil', 840, 600, 'K3', 'Bobina K3');
  var n = b.c('power_n', 680, 700, 'N', 'Neutro');

  /* potencia: L -> F -> K1 (jogs ortogonais em y=180) -> U1 V1 W1 */
  [[l1, f1], [l2, f2], [l3, f3]].forEach(function (p) { b.w(p[0], 1, p[1], 0); });
  b.route([[f1, 1], [80, 180], [116, 180], [k1p, 0]]);
  b.w(f2, 1, k1p, 1);
  b.route([[f3, 1], [200, 180], [164, 180], [k1p, 2]]);
  b.route([[k1p, 3], [116, 360], [m1, 0]]);   /* U1 (tap y=360) */
  b.route([[k1p, 4], [140, 320], [m1, 1]]);   /* V1 (tap y=320) */
  b.route([[k1p, 5], [164, 340], [m1, 2]]);   /* W1 (tap y=340) */
  /* K2 (estrela): topos em U2 V2 W2 (derivacoes y=560/540/520 tambem alimentam K3); bases no ponto estrela J1 */
  b.route([[m1, 3], [116, 560], [k2p, 0]]);
  b.route([[m1, 4], [140, 540], [k2p, 1]]);
  b.route([[m1, 5], [164, 520], [k2p, 2]]);
  b.route([[k2p, 3], [116, 700], [j1, 0]]);
  b.w(k2p, 4, j1, 0);
  b.route([[k2p, 5], [164, 700], [j1, 0]]);
  /* K3 (triangulo): topos em U2 V2 W2; bases: V1 (x=400), W1 (x=380), U1 (x=360) */
  b.route([[164, 520], [324, 520], [k3p, 2]]);
  b.route([[140, 540], [300, 540], [k3p, 1]]);
  b.route([[116, 560], [276, 560], [k3p, 0]]);
  b.route([[k3p, 3], [276, 720], [400, 720], [400, 320], [140, 320]]);
  b.route([[k3p, 4], [300, 700], [380, 700], [380, 340], [164, 340]]);
  b.route([[k3p, 5], [324, 680], [360, 680], [360, 360], [116, 360]]);

  /* comando: tronco L1-F4-FR-S0; barra A (y=320): S1 // selo; barra B (y=420): bobina K1, KT, NF e NA temporizados; neutro (y=680) */
  b.w(lc, 1, f4, 0); b.w(f4, 1, fr, 0); b.w(fr, 1, s0, 0);
  b.route([[s0, 1], [560, 320], [s1, 0]]);
  b.route([[560, 320], [620, 320], [sel, 0]]);
  b.route([[s1, 1], [560, 420], [620, 420], [700, 420], [780, 420], [860, 420]]);
  b.route([[sel, 1], [620, 420]]);
  b.route([[560, 420], [cK1, 0]]);
  b.route([[700, 420], [cKT, 0]]);
  b.route([[780, 420], [ktNc, 0]]);
  b.route([[860, 420], [ktNo, 0]]);
  b.w(ktNc, 1, nc3, 0); b.w(nc3, 1, cK2, 0);
  b.w(ktNo, 1, nc2, 0); b.w(nc2, 1, cK3, 0);
  b.route([[cK1, 1], [560, 680], [700, 680], [780, 680], [860, 680]]);
  b.route([[cKT, 1], [700, 680]]);
  b.route([[cK2, 1], [780, 680]]);
  b.route([[cK3, 1], [860, 680]]);
  b.route([[700, 680], [n, 0]]);

  function ex(rot, k1, k2, k3, mot) {
    return { esperado: { rotulo: rot, bobinas: { K1: k1, K2: k2, K3: k3 }, motores: { M1: mot }, curto: false } };
  }
  var parado = { estado: 'parado', sequencia: null };
  var Y = { estado: 'Y', sequencia: 'direta' }, D = { estado: 'Δ', sequencia: 'direta' };
  P.register({
    id: 'estrela-triangulo',
    titulo: 'Partida estrela-triângulo',
    descricao: 'Motor de 6 terminais: K1+K2 (estrela) por 3 s; depois K2 cai e K3 fecha (triângulo). K2 e K3 intertravados; K2+K3 juntos causariam curto. Proteções armadas.',
    diagrama: b.snapshot(),
    roteiro: [
      ex('repouso', 0, 0, 0, parado),
      { acao: 'pressionar', id: 'S1' }, ex('t=0: estrela', 1, 1, 0, Y),
      { acao: 'soltar', id: 'S1' }, { espera: 2.8 }, ex('t=2,8 s: ainda estrela', 1, 1, 0, Y),
      { espera: 0.4 }, ex('t=3,2 s: triângulo', 1, 0, 1, D),
      { acao: 'pressionar', id: 'S0' }, { espera: 0.2 }, { acao: 'soltar', id: 'S0' }, { espera: 0.2 },
      ex('S0 desliga tudo', 0, 0, 0, parado),
      { acao: 'pressionar', id: 'S1' }, { espera: 0.2 }, { acao: 'soltar', id: 'S1' }, { espera: 0.2 },
      ex('nova partida volta à estrela', 1, 1, 0, Y),
      { acao: 'disparar', id: 'FR' }, { espera: 0.2 }, ex('FR em estrela: tudo desligado', 0, 0, 0, parado)
    ],
    referencia: 'a confirmar'
  });
})(typeof window !== 'undefined' ? window : globalThis);
