/* data/presets/reversao-intertravada.js - reversao com intertravamento por contatos NF (diagrama). Requer index.js.
 * Potencia: L1-L3 -> F1-F3 -> K1 (direta) ou K2 (troca L1 e L3) -> M1. Comando: L1-N, F4, FR, S0 (NF) comum,
 * (S1 // K1)·NF K2 -> K1 ; (S2 // K2)·NF K1 -> K2. Variante didatica A CONFIRMAR. */
(function (root) {
  var P = root.EO.presets, b = P.builder();

  /* Layout (grade 20): potencia a esquerda (K1 a esquerda do alimentador, K2 a direita), comando a direita (x>=600).
   * Fios so horizontais/verticais; derivacoes e cantos sao junctions. Cruzamentos (sem ponto) sao as trocas de fase
   * L1<->L3 de K2 e a confluencia das saidas de K1/K2 nos bornes U V W do motor. */
  var l1 = b.c('power_l1', 180, 20, 'L1', 'Fase L1'), l2 = b.c('power_l2', 240, 20, 'L2', 'Fase L2'), l3 = b.c('power_l3', 300, 20, 'L3', 'Fase L3');
  var f1 = b.c('circuit_breaker', 180, 80, 'F1', 'Disjuntor F1'), f2 = b.c('circuit_breaker', 240, 80, 'F2', 'Disjuntor F2'), f3 = b.c('circuit_breaker', 300, 80, 'F3', 'Disjuntor F3');
  var k1p = b.c('contactor_main_3p', 60, 320, 'K1', 'Contator K1');
  var k2p = b.c('contactor_main_3p', 380, 320, 'K2', 'Contator K2');
  var m1 = b.c('motor_3ph_3t', 220, 560, 'M1', 'Motor M1');

  var lc = b.c('power_l1', 600, 20, 'L1', 'Fase L1 (comando)');
  var f4 = b.c('circuit_breaker', 600, 80, 'F4', 'Disjuntor de comando F4');
  var fr = b.c('overload_relay', 600, 160, 'FR', 'Relé térmico FR');
  var s0 = b.c('pushbutton_nc', 600, 240, 'S0', 'Desliga S0');
  var s1 = b.c('pushbutton_no', 600, 340, 'S1', 'Direta S1');
  var sel1 = b.c('contact_no', 660, 340, 'K1', 'Selo K1');
  var nc2 = b.c('contact_nc', 600, 440, 'K2', 'Intertrav. NF K2');
  var s2 = b.c('pushbutton_no', 740, 340, 'S2', 'Inversa S2');
  var sel2 = b.c('contact_no', 800, 340, 'K2', 'Selo K2');
  var nc1 = b.c('contact_nc', 740, 440, 'K1', 'Intertrav. NF K1');
  var c1 = b.c('coil', 600, 520, 'K1', 'Bobina K1');   /* K1 antes de K2 na ordem: vence em disputa simultanea */
  var c2 = b.c('coil', 740, 520, 'K2', 'Bobina K2');
  var n = b.c('power_n', 660, 640, 'N', 'Neutro');

  /* potencia: alimentacao. Cada fase desce de F_i e deriva para K2 (a direita, linhas y=180/200/220) e K1 (a esquerda, y=240/260/280) */
  [[l1, f1], [l2, f2], [l3, f3]].forEach(function (p) { b.w(p[0], 1, p[1], 0); });
  b.route([[f1, 1], [200, 180], [200, 240]]);  b.route([[200, 180], [444, 180], [k2p, 2]]);  b.route([[200, 240], [76, 240], [k1p, 0]]);   /* L1: K1.0 e K2.2 */
  b.route([[f2, 1], [260, 200], [260, 260]]);  b.route([[260, 200], [420, 200], [k2p, 1]]);  b.route([[260, 260], [100, 260], [k1p, 1]]);  /* L2: K1.1 e K2.1 */
  b.route([[f3, 1], [320, 220], [320, 280]]);  b.route([[320, 220], [396, 220], [k2p, 0]]);  b.route([[320, 280], [124, 280], [k1p, 2]]);  /* L3: K1.2 e K2.0 */
  /* potencia: saidas de K1 (linhas y=460/440/420) e K2 (y=480/500/520) confluem nos bornes U(236) V(260) W(284) */
  b.route([[k1p, 3], [76, 460], [236, 460], [236, 480], [m1, 0]]);  b.route([[k2p, 3], [396, 480], [236, 480]]);
  b.route([[k1p, 4], [100, 440], [260, 440], [260, 500], [m1, 1]]); b.route([[k2p, 4], [420, 500], [260, 500]]);
  b.route([[k1p, 5], [124, 420], [284, 420], [284, 520], [m1, 2]]); b.route([[k2p, 5], [444, 520], [284, 520]]);

  /* comando: tronco L1-F4-FR-S0; barra A (y=320): 4 ramos; barras B (y=420); neutro (y=620) */
  b.w(lc, 1, f4, 0); b.w(f4, 1, fr, 0); b.w(fr, 1, s0, 0);
  b.route([[s0, 1], [620, 320], [s1, 0]]);
  b.route([[620, 320], [680, 320], [760, 320], [820, 320]]);
  b.route([[680, 320], [sel1, 0]]); b.route([[760, 320], [s2, 0]]); b.route([[820, 320], [sel2, 0]]);
  b.route([[s1, 1], [620, 420], [nc2, 0]]);  b.route([[sel1, 1], [680, 420], [620, 420]]);
  b.route([[s2, 1], [760, 420], [nc1, 0]]);  b.route([[sel2, 1], [820, 420], [760, 420]]);
  b.w(nc2, 1, c1, 0); b.w(nc1, 1, c2, 0);
  b.route([[c1, 1], [620, 620], [680, 620], [760, 620], [c2, 1]]);
  b.route([[680, 620], [n, 0]]);

  function ex(rot, k1, k2, mot) {
    return { esperado: { rotulo: rot, bobinas: { K1: k1, K2: k2 }, motores: { M1: mot }, curto: false } };
  }
  var parado = { estado: 'parado', sequencia: null };
  var dir = { estado: 'ligado', sequencia: 'direta' }, inv = { estado: 'ligado', sequencia: 'inversa' };
  function pulso(id) { return [{ acao: 'pressionar', id: id }, { espera: 0.2 }, { acao: 'soltar', id: id }, { espera: 0.2 }]; }
  P.register({
    id: 'reversao-intertravada',
    titulo: 'Reversão com intertravamento',
    descricao: 'Inversão de sentido do motor por K1/K2 com intertravamento elétrico por contatos NF; K2 troca as fases L1 e L3. Proteções armadas.',
    diagrama: b.snapshot(),
    roteiro: [].concat(
      [ex('repouso', 0, 0, parado)],
      pulso('S1'), [ex('S1 liga K1 (direta)', 1, 0, dir)],
      pulso('S2'), [ex('S2 bloqueado por K1', 1, 0, dir)],
      pulso('S0'), [ex('S0 desliga', 0, 0, parado)],
      pulso('S2'), [ex('S2 liga K2 (inversa)', 0, 1, inv)],
      pulso('S1'), [ex('S1 bloqueado por K2', 0, 1, inv)],
      pulso('S0'), [ex('S0 desliga', 0, 0, parado)],
      [{ acao: 'pressionar', id: 'S1' }, { acao: 'pressionar', id: 'S2' }, { espera: 0.2 }, ex('S1+S2 juntos: K1 (determinístico)', 1, 0, dir)],
      [{ acao: 'soltar', id: 'S1' }, { acao: 'soltar', id: 'S2' }, { espera: 0.2 }, ex('soltar mantém selo de K1', 1, 0, dir)],
      [{ acao: 'disparar', id: 'FR' }, { espera: 0.2 }, ex('FR dispara: tudo desligado', 0, 0, parado)]
    ),
    referencia: 'a confirmar'
  });
})(typeof window !== 'undefined' ? window : globalThis);
