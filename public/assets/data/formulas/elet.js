/* data/formulas/elet.js - "Formula explicada" do modulo Eletricidade (public/elet.html).
 * Fonte da verdade: public/assets/js/legacy/elet.js. Cada definicao documenta a expressao EXATA calculada la
 * (mesmas unidades, mesmos arredondamentos de exibicao). Nada aqui altera calculo algum.
 * Passos com `saidaId` + `esperado`/`esperadoTexto` sao verificados em tests/formula/formula.test.js contra o legado. */
(function (root) {
  'use strict';
  var EO = root.EO = root.EO || {};
  var F = EO.formulas;
  if (!F) return;
  var fix = F.fix, g = F.g, tn = F.tn, tv = F.tv;
  var PI = Math.PI;

  /* ---------- helpers de TeX ---------- */
  function V(v, d, u) { return tv(fix(v, d), u); }          // resultado com casas da calculadora + unidade
  function G(v, u) { return tv(g(v), u); }                  // valor de entrada
  function par(s) { return s.charAt(0) === '-' ? '(' + s + ')' : s; }
  function sq(s) { return par(s) + '^2'; }
  function A2(y, x, d) { return '\\operatorname{atan2}(' + tn(fix(y, d)) + ';\\,' + tn(fix(x, d)) + ')'; }
  function cx(a, b, d) { return tn(fix(a, d)) + (b >= 0 ? ' + ' : ' - ') + 'j\\,' + tn(fix(Math.abs(b), d)); }
  function pol(m, ang, d1, d2) { return tn(fix(m, d1)) + '\\angle ' + tn(fix(ang, d2)) + '^{\\circ}'; }
  function ok(x) { return typeof x === 'number' && isFinite(x); }
  var DEG = 180 / PI;
  var OBS_ARRED = 'Os valores intermedi\u00e1rios mostrados s\u00e3o arredondados s\u00f3 na exibi\u00e7\u00e3o; a conta usa o valor completo, como a calculadora.';
  var W_UN = 'rad/s';

  function reg(d) { d.modulo = 'elet'; d.observacoes = (d.observacoes || []).concat([OBS_ARRED]); return F.register(d); }

  /* ====================== RL s\u00e9rie ====================== */
  reg({
    id: 'elet-rl', titulo: 'Circuito RL s\u00e9rie',
    proposito: 'Calcula reat\u00e2ncia, imped\u00e2ncia, \u00e2ngulo e fator de pot\u00eancia de um resistor em s\u00e9rie com um indutor. Serve de modelo para motores, reatores e bobinas: mostra por que a corrente fica atrasada.',
    tex: '\\begin{aligned} X_L &= 2\\pi f L \\\\ Z &= \\sqrt{R^2 + X_L^2} \\\\ \\varphi &= \\operatorname{atan2}(X_L,\\,R) \\\\ \\mathrm{fp} &= \\cos\\varphi \\end{aligned}',
    variaveis: [
      { simbolo: 'R', tex: 'R', nome: 'resist\u00eancia', unidade: '\u03a9', inputId: 'rl-r' },
      { simbolo: 'L', tex: 'L', nome: 'indut\u00e2ncia (entrada em mH, convertida para H na conta)', unidade: 'mH', inputId: 'rl-l' },
      { simbolo: 'f', tex: 'f', nome: 'frequ\u00eancia', unidade: 'Hz', inputId: 'rl-f' },
      { simbolo: 'XL', tex: 'X_L', nome: 'reat\u00e2ncia indutiva', unidade: '\u03a9', saidaId: 'rl-xl' },
      { simbolo: 'Z', tex: 'Z', nome: 'm\u00f3dulo da imped\u00e2ncia', unidade: '\u03a9', saidaId: 'rl-z' },
      { simbolo: 'phi', tex: '\\varphi', nome: '\u00e2ngulo de fase (tens\u00e3o em rela\u00e7\u00e3o \u00e0 corrente)', unidade: '\u00b0', saidaId: 'rl-phi' },
      { simbolo: 'fp', tex: '\\mathrm{fp}', nome: 'fator de pot\u00eancia', unidade: '', saidaId: 'rl-fp' }
    ],
    passos: function (v) {
      var L = v.L / 1000, w = 2 * PI * v.f, xl = w * L, z = Math.sqrt(v.R * v.R + xl * xl), phi = Math.atan2(xl, v.R), fp = Math.cos(phi);
      return [
        { rotulo: 'Indut\u00e2ncia em henries', tex: 'L = \\dfrac{' + G(v.L) + '}{1000} = ' + G(L, 'H') },
        { rotulo: 'Frequ\u00eancia angular', tex: '\\omega = 2\\pi f = 2\\pi\\cdot ' + G(v.f) + ' = ' + V(w, 2, W_UN) },
        { rotulo: 'Reat\u00e2ncia indutiva', tex: 'X_L = 2\\pi\\cdot ' + G(v.f) + '\\cdot ' + G(L) + ' = ' + V(xl, 2, '\u03a9'), saidaId: 'rl-xl', esperado: [fix(xl, 2)] },
        { rotulo: 'Imped\u00e2ncia', tex: 'Z = \\sqrt{' + sq(G(v.R)) + ' + ' + sq(V(xl, 2)) + '} = ' + V(z, 2, '\u03a9'), saidaId: 'rl-z', esperado: [fix(z, 2)] },
        { rotulo: '\u00c2ngulo de fase', tex: '\\varphi = ' + A2(xl, v.R, 2) + ' = ' + V(phi * DEG, 1, '\u00b0'), saidaId: 'rl-phi', esperado: [fix(phi * DEG, 1)] },
        { rotulo: 'Fator de pot\u00eancia', tex: '\\mathrm{fp} = \\cos(' + V(phi * DEG, 1, '\u00b0') + ') = ' + V(fp, 3), saidaId: 'rl-fp', esperado: [fix(fp, 3)] }
      ];
    },
    observacoes: [
      'O indutor guarda energia no campo magn\u00e9tico, \u00bd\u00b7L\u00b7I\u00b2, e devolve \u00e0 fonte a cada ciclo. Essa energia que vai e volta \u00e9 a pot\u00eancia reativa: n\u00e3o faz trabalho, mas a corrente dela passa pelos cabos.',
      'A reat\u00e2ncia indutiva cresce com a frequ\u00eancia: o indutor se op\u00f5e a varia\u00e7\u00f5es de corrente, e quanto mais r\u00e1pido a corrente varia, maior a oposi\u00e7\u00e3o.',
      'R e X_L est\u00e3o a 90\u00b0 entre si, por isso se combinam como catetos de um tri\u00e2ngulo retangulo (Pit\u00e1goras), e n\u00e3o por soma simples.',
      '\u03c6 > 0 indica carga indutiva: a corrente est\u00e1 atrasada em rela\u00e7\u00e3o \u00e0 tens\u00e3o. Quanto maior X_L perto de R, mais \u03c6 se aproxima de 90\u00b0 e menor o fp.',
      'Erro comum: usar L em mH direto na f\u00f3rmula. A calculadora converte para H (divide por 1000) antes de calcular.',
      'Erro comum: misturar graus e radianos. O \u00e2ngulo \u00e9 calculado em radianos e exibido em graus; o fp \u00e9 o cosseno do mesmo \u00e2ngulo.'
    ]
  });

  /* ====================== RC s\u00e9rie ====================== */
  reg({
    id: 'elet-rc', titulo: 'Circuito RC s\u00e9rie',
    proposito: 'Calcula reat\u00e2ncia capacitiva, imped\u00e2ncia, \u00e2ngulo e frequ\u00eancia de corte de um resistor em s\u00e9rie com um capacitor. Modela filtros, fontes e bancos de capacitores: mostra por que a corrente fica adiantada.',
    tex: '\\begin{aligned} X_C &= \\dfrac{1}{\\omega C} \\\\ Z &= \\sqrt{R^2 + X_C^2} \\\\ \\varphi &= -\\operatorname{atan2}(X_C,\\,R) \\\\ f_c &= \\dfrac{1}{2\\pi R C} \\end{aligned}',
    variaveis: [
      { simbolo: 'R', tex: 'R', nome: 'resist\u00eancia', unidade: '\u03a9', inputId: 'rc-r' },
      { simbolo: 'C', tex: 'C', nome: 'capacit\u00e2ncia (entrada em \u00b5F, convertida para F na conta)', unidade: '\u00b5F', inputId: 'rc-c' },
      { simbolo: 'f', tex: 'f', nome: 'frequ\u00eancia', unidade: 'Hz', inputId: 'rc-f' },
      { simbolo: 'XC', tex: 'X_C', nome: 'reat\u00e2ncia capacitiva', unidade: '\u03a9', saidaId: 'rc-xc' },
      { simbolo: 'Z', tex: 'Z', nome: 'm\u00f3dulo da imped\u00e2ncia', unidade: '\u03a9', saidaId: 'rc-z' },
      { simbolo: 'phi', tex: '\\varphi', nome: '\u00e2ngulo de fase (negativo: corrente adiantada)', unidade: '\u00b0', saidaId: 'rc-phi' },
      { simbolo: 'fc', tex: 'f_c', nome: 'frequ\u00eancia de corte', unidade: 'Hz', saidaId: 'rc-fc' }
    ],
    passos: function (v) {
      var C = v.C * 1e-6, w = 2 * PI * v.f, xc = 1 / (w * C), z = Math.sqrt(v.R * v.R + xc * xc), phi = Math.atan2(xc, v.R), fc = 1 / (2 * PI * v.R * C);
      return [
        { rotulo: 'Capacit\u00e2ncia em farads', tex: 'C = ' + G(v.C) + '\\cdot 10^{-6} = ' + G(C, 'F') },
        { rotulo: 'Frequ\u00eancia angular', tex: '\\omega = 2\\pi\\cdot ' + G(v.f) + ' = ' + V(w, 2, W_UN) },
        { rotulo: 'Reat\u00e2ncia capacitiva', tex: 'X_C = \\dfrac{1}{' + V(w, 2) + '\\cdot ' + G(C) + '} = ' + V(xc, 2, '\u03a9'), saidaId: 'rc-xc', esperado: [fix(xc, 2)] },
        { rotulo: 'Imped\u00e2ncia', tex: 'Z = \\sqrt{' + sq(G(v.R)) + ' + ' + sq(V(xc, 2)) + '} = ' + V(z, 2, '\u03a9'), saidaId: 'rc-z', esperado: [fix(z, 2)] },
        { rotulo: '\u00c2ngulo de fase', tex: '\\varphi = -' + A2(xc, v.R, 2) + ' = ' + V(-phi * DEG, 1, '\u00b0'), saidaId: 'rc-phi', esperado: [fix(-phi * DEG, 1)] },
        { rotulo: 'Frequ\u00eancia de corte', tex: 'f_c = \\dfrac{1}{2\\pi\\cdot ' + G(v.R) + '\\cdot ' + G(C) + '} = ' + V(fc, 1, 'Hz'), saidaId: 'rc-fc', esperado: [fix(fc, 1)] }
      ];
    },
    observacoes: [
      'O capacitor guarda energia no campo el\u00e9trico, \u00bd\u00b7C\u00b7V\u00b2, e se op\u00f5e a varia\u00e7\u00f5es de tens\u00e3o. Por isso X_C diminui quando a frequ\u00eancia sobe: em alta frequ\u00eancia ele quase n\u00e3o resiste.',
      'Capacitor carregado guarda energia mesmo com o circuito desligado. Descarregue antes de mexer.',
      'A reat\u00e2ncia capacitiva cai com a frequ\u00eancia: em alta frequ\u00eancia o capacitor deixa a corrente passar com facilidade; em corrente cont\u00ednua (f \u2192 0) ele bloqueia.',
      '\u03c6 < 0 indica carga capacitiva: a corrente est\u00e1 adiantada em rela\u00e7\u00e3o \u00e0 tens\u00e3o. A calculadora mostra o \u00e2ngulo j\u00e1 com sinal negativo.',
      'A frequ\u00eancia de corte \u00e9 onde X_C = R; nela o m\u00f3dulo de \u00e2ngulo vale 45\u00b0.',
      'Erro comum: esquecer a convers\u00e3o de \u00b5F para F (multiplicar por 10\u207b\u2076) e obter reat\u00e2ncias um milh\u00e3o de vezes menores.'
    ]
  });

  /* ====================== RLC s\u00e9rie ====================== */
  reg({
    id: 'elet-rlc', titulo: 'Circuito RLC s\u00e9rie e resson\u00e2ncia',
    proposito: 'Calcula a frequ\u00eancia de resson\u00e2ncia, o fator de qualidade e a imped\u00e2ncia na frequ\u00eancia de opera\u00e7\u00e3o. Mostra como indutor e capacitor se compensam e onde est\u00e1 a resson\u00e2ncia.',
    tex: '\\begin{aligned} f_0 &= \\dfrac{1}{2\\pi\\sqrt{LC}} \\qquad Q = \\dfrac{\\omega_0 L}{R} \\\\ X &= \\omega L - \\dfrac{1}{\\omega C} \\\\ Z &= \\sqrt{R^2 + X^2} \\qquad \\varphi = \\operatorname{atan2}(X,\\,R) \\end{aligned}',
    variaveis: [
      { simbolo: 'R', tex: 'R', nome: 'resist\u00eancia', unidade: '\u03a9', inputId: 'rlc-r' },
      { simbolo: 'L', tex: 'L', nome: 'indut\u00e2ncia (entrada em mH)', unidade: 'mH', inputId: 'rlc-l' },
      { simbolo: 'C', tex: 'C', nome: 'capacit\u00e2ncia (entrada em \u00b5F)', unidade: '\u00b5F', inputId: 'rlc-c' },
      { simbolo: 'fop', tex: 'f_{op}', nome: 'frequ\u00eancia de opera\u00e7\u00e3o', unidade: 'Hz', inputId: 'rlc-fop' },
      { simbolo: 'f0', tex: 'f_0', nome: 'frequ\u00eancia de resson\u00e2ncia', unidade: 'Hz', saidaId: 'rlc-f0' },
      { simbolo: 'Q', tex: 'Q', nome: 'fator de qualidade', unidade: '', saidaId: 'rlc-q' },
      { simbolo: 'Zop', tex: 'Z_{op}', nome: 'imped\u00e2ncia em f_op', unidade: '\u03a9', saidaId: 'rlc-zop' },
      { simbolo: 'phi', tex: '\\varphi', nome: '\u00e2ngulo de fase em f_op', unidade: '\u00b0', saidaId: 'rlc-phi' }
    ],
    passos: function (v) {
      var L = v.L / 1000, C = v.C * 1e-6, f0 = 1 / (2 * PI * Math.sqrt(L * C)), w0 = 2 * PI * f0, Q = w0 * L / v.R;
      var wop = 2 * PI * v.fop, xl = wop * L, xc = 1 / (wop * C), x = xl - xc, zop = Math.sqrt(v.R * v.R + x * x), phi = Math.atan2(x, v.R);
      return [
        { rotulo: 'Convers\u00e3o de unidades', tex: 'L = ' + G(L, 'H') + ',\\quad C = ' + G(C, 'F') },
        { rotulo: 'Frequ\u00eancia de resson\u00e2ncia', tex: 'f_0 = \\dfrac{1}{2\\pi\\sqrt{' + G(L) + '\\cdot ' + G(C) + '}} = ' + V(f0, 1, 'Hz'), saidaId: 'rlc-f0', esperado: [fix(f0, 1)] },
        { rotulo: 'Frequ\u00eancia angular de resson\u00e2ncia', tex: '\\omega_0 = 2\\pi f_0 = ' + V(w0, 2, W_UN) },
        { rotulo: 'Fator de qualidade', tex: 'Q = \\dfrac{' + V(w0, 2) + '\\cdot ' + G(L) + '}{' + G(v.R) + '} = ' + V(Q, 2), saidaId: 'rlc-q', esperado: [fix(Q, 2)] },
        { rotulo: 'Reat\u00e2ncias em f_op', tex: '\\omega = 2\\pi\\cdot ' + G(v.fop) + ' = ' + V(wop, 2, W_UN) + ',\\quad X_L = \\omega L = ' + V(xl, 2, '\u03a9') + ',\\quad X_C = \\dfrac{1}{\\omega C} = ' + V(xc, 2, '\u03a9') },
        { rotulo: 'Reat\u00e2ncia l\u00edquida', tex: 'X = X_L - X_C = ' + V(xl, 2) + ' - ' + par(V(xc, 2)) + ' = ' + V(x, 2, '\u03a9') },
        { rotulo: 'Imped\u00e2ncia em f_op', tex: 'Z_{op} = \\sqrt{' + sq(G(v.R)) + ' + ' + sq(V(x, 2)) + '} = ' + V(zop, 2, '\u03a9'), saidaId: 'rlc-zop', esperado: [fix(zop, 2)] },
        { rotulo: '\u00c2ngulo de fase em f_op', tex: '\\varphi = ' + A2(x, v.R, 2) + ' = ' + V(phi * DEG, 1, '\u00b0'), saidaId: 'rlc-phi', esperado: [fix(phi * DEG, 1)] }
      ];
    },
    observacoes: [
      'Na resson\u00e2ncia a energia oscila entre o campo magn\u00e9tico do indutor e o campo el\u00e9trico do capacitor; a fonte s\u00f3 rep\u00f5e a perda no resistor. Por isso a corrente fica limitada s\u00f3 por R.',
      'Em resson\u00e2ncia, V_L e V_C podem passar da tens\u00e3o da fonte, pois se cancelam entre si. Quanto menor R, mais agudo o pico.',
      'Resson\u00e2ncia s\u00e9rie tem imped\u00e2ncia m\u00ednima. Na resson\u00e2ncia paralela \u00e9 o contr\u00e1rio: a imped\u00e2ncia \u00e9 m\u00e1xima.',
      'Na resson\u00e2ncia X_L = X_C: as reat\u00e2ncias se cancelam, a imped\u00e2ncia fica s\u00f3 R (m\u00ednima) e a corrente \u00e9 m\u00e1xima.',
      'f\u2080 depende s\u00f3 de L e C; R n\u00e3o muda a frequ\u00eancia de resson\u00e2ncia, apenas a agudeza do pico (Q).',
      'Abaixo de f\u2080 predomina o capacitor (X < 0, \u03c6 < 0, corrente adiantada); acima, o indutor (X > 0, \u03c6 > 0, corrente atrasada).',
      'Q alto significa pico estreito e tens\u00f5es sobre L e C bem maiores que a da fonte; cuidado com sobretens\u00f5es.',
      'Aqui Q usa \u03c9\u2080L/R (circuito s\u00e9rie). N\u00e3o aplique a mesma express\u00e3o a circuitos RLC em paralelo.'
    ]
  });

  /* ====================== Fasores RLC (tens\u00f5es) ====================== */
  reg({
    id: 'elet-fasores', titulo: 'Soma fasorial de tens\u00f5es V_R, V_L e V_C',
    proposito: 'Combina as tens\u00f5es de resistor, indutor e capacitor (em quadratura) na tens\u00e3o total e no \u00e2ngulo de defasagem. O fasor \u00e9 uma "fotografia" da senoide: um vetor com m\u00f3dulo e \u00e2ngulo.',
    tex: '\\begin{aligned} V_X &= V_L - V_C \\\\ V_{tot} &= \\sqrt{V_R^2 + V_X^2} \\\\ \\varphi &= \\operatorname{atan2}(V_X,\\,V_R) \\end{aligned}',
    variaveis: [
      { simbolo: 'VR', tex: 'V_R', nome: 'tens\u00e3o no resistor', unidade: 'V', inputId: 'ph-vr-m' },
      { simbolo: 'VL', tex: 'V_L', nome: 'tens\u00e3o no indutor', unidade: 'V', inputId: 'ph-vl-m' },
      { simbolo: 'VC', tex: 'V_C', nome: 'tens\u00e3o no capacitor', unidade: 'V', inputId: 'ph-vc-m' },
      { simbolo: 'VX', tex: 'V_X', nome: 'tens\u00e3o reativa l\u00edquida', unidade: 'V', saidaId: 'ph-vx' },
      { simbolo: 'Vtot', tex: 'V_{tot}', nome: 'tens\u00e3o total (m\u00f3dulo)', unidade: 'V', saidaId: 'ph-vtotal' },
      { simbolo: 'phi', tex: '\\varphi', nome: '\u00e2ngulo da tens\u00e3o total em rela\u00e7\u00e3o \u00e0 corrente', unidade: '\u00b0', saidaId: 'ph-angle' }
    ],
    ler: function () {
      function n(id) { var e = document.getElementById(id); return (e && +e.value) || 0; }
      return { VR: n('ph-vr-m'), VL: n('ph-vl-m'), VC: n('ph-vc-m') };
    },
    passos: function (v) {
      var vx = v.VL - v.VC, vt = Math.sqrt(v.VR * v.VR + vx * vx), phi = Math.atan2(vx, v.VR) * 180 / PI;
      var nat = vx > .5 ? 'Indutivo' : vx < -.5 ? 'Capacitivo' : 'Resistivo';
      return [
        { rotulo: 'Tens\u00e3o reativa l\u00edquida', tex: 'V_X = ' + G(v.VL) + ' - ' + par(G(v.VC)) + ' = ' + V(vx, 2, 'V'), saidaId: 'ph-vx', esperado: [fix(vx, 2)] },
        { rotulo: 'Tens\u00e3o total', tex: 'V_{tot} = \\sqrt{' + sq(G(v.VR)) + ' + ' + sq(V(vx, 2)) + '} = ' + V(vt, 2, 'V'), saidaId: 'ph-vtotal', esperado: [fix(vt, 2)] },
        { rotulo: '\u00c2ngulo', tex: '\\varphi = ' + A2(vx, v.VR, 2) + ' = ' + V(phi, 1, '\u00b0'), saidaId: 'ph-angle', esperado: [fix(phi, 1)] },
        { rotulo: 'Natureza do circuito (limiar de 0,5 V em V_X)', texto: nat, saidaId: 'ph-nat', esperadoTexto: nat }
      ];
    },
    observacoes: [
      'A soma \u00e9 vetorial: a soma dos m\u00f3dulos de V_R, V_L e V_C \u00e9 maior que a tens\u00e3o da fonte, e isso \u00e9 normal. S\u00f3 vale para grandezas de mesma frequ\u00eancia em regime permanente.',
      'Em s\u00e9rie, a corrente \u00e9 a refer\u00eancia: V_R fica em fase com ela, V_L adiantada 90\u00b0 e V_C atrasada 90\u00b0.',
      'V_L est\u00e1 adiantada 90\u00b0 e V_C atrasada 90\u00b0 em rela\u00e7\u00e3o \u00e0 corrente; por isso se opõem e s\u00f3 a diferen\u00e7a V_L \u2212 V_C sobra.',
      'V_tot n\u00e3o \u00e9 a soma aritm\u00e9tica V_R + V_L + V_C: as tens\u00f5es est\u00e3o defasadas e somam como vetores.',
      'V_X > 0: circuito indutivo (corrente atrasada). V_X < 0: capacitivo (corrente adiantada). Perto de zero: resistivo.',
      'Tens\u00f5es em um mesmo ramo em s\u00e9rie podem ser maiores que a da fonte (V_L e V_C individualmente), o que n\u00e3o viola nenhuma lei.'
    ]
  });

  /* ====================== Trif\u00e1sico (cargas por fase) ====================== */
  function triFase(R, Lmh, Cuf, f) { // espelha triZPhase
    var w = 2 * PI * f, xl = w * Lmh / 1000, xc = Cuf > 0 ? 1 / (w * Cuf * 1e-6) : 0, b = xl - xc;
    return { w: w, xl: xl, xc: xc, a: R, b: b, mod: Math.sqrt(R * R + b * b) };
  }
  var triVars = [
    { simbolo: 'Vf', tex: 'V_f', nome: 'tens\u00e3o de fase (rms)', unidade: 'V', inputId: 'tri-vf' },
    { simbolo: 'f', tex: 'f', nome: 'frequ\u00eancia', unidade: 'Hz', inputId: 'tri-freq' }
  ];
  ['A', 'B', 'C'].forEach(function (k) {
    var lk = k.toLowerCase();
    triVars.push({ simbolo: 'R' + k, tex: 'R_' + k, nome: 'resist\u00eancia da fase ' + k, unidade: '\u03a9', inputId: 'tri-r' + lk });
    triVars.push({ simbolo: 'L' + k, tex: 'L_' + k, nome: 'indut\u00e2ncia da fase ' + k + ' (entrada em mH)', unidade: 'mH', inputId: 'tri-l' + lk });
    triVars.push({ simbolo: 'C' + k, tex: 'C_' + k, nome: 'capacit\u00e2ncia da fase ' + k + ' (entrada em \u00b5F; 0 = sem capacitor)', unidade: '\u00b5F', inputId: 'tri-c' + lk });
  });
  triVars.push({ simbolo: 'Vl', tex: 'V_l', nome: 'tens\u00e3o de linha', unidade: 'V', saidaId: 'tri-vl' });
  triVars.push({ simbolo: 'Pt', tex: 'P_{tot}', nome: 'pot\u00eancia ativa total', unidade: 'kW', saidaId: 'tri-p' });
  triVars.push({ simbolo: 'Qt', tex: 'Q_{tot}', nome: 'pot\u00eancia reativa total', unidade: 'kVAr', saidaId: 'tri-q2' });
  triVars.push({ simbolo: 'St', tex: 'S_{tot}', nome: 'pot\u00eancia aparente total', unidade: 'kVA', saidaId: 'tri-s' });
  reg({
    id: 'elet-trifasico', titulo: 'Carga trif\u00e1sica a quatro fios (por fase)',
    proposito: 'Calcula corrente e pot\u00eancias de tr\u00eas cargas RLC independentes, cada uma ligada \u00e0 tens\u00e3o de fase. Mostra como tr\u00eas tens\u00f5es defasadas 120\u00b0 se combinam em cargas ligadas \u00e0 tens\u00e3o de fase.',
    tex: '\\begin{aligned} Z_k &= \\sqrt{R_k^2 + X_k^2},\\quad X_k = \\omega L_k - \\dfrac{1}{\\omega C_k} \\\\ I_k &= \\dfrac{V_f}{\\max(Z_k;\\,0{,}001)} \\\\ P_k &= I_k^2 R_k,\\quad Q_k = I_k^2 X_k \\\\ V_l &= \\sqrt{3}\\,V_f \\\\ S_{tot} &= \\sqrt{P_{tot}^2 + Q_{tot}^2} \\end{aligned}',
    variaveis: triVars,
    passos: function (v) {
      var out = [], P = 0, Q = 0;
      var w = 2 * PI * v.f;
      out.push({ rotulo: 'Frequ\u00eancia angular', tex: '\\omega = 2\\pi\\cdot ' + G(v.f) + ' = ' + V(w, 2, W_UN) });
      ['A', 'B', 'C'].forEach(function (k) {
        var z = triFase(v['R' + k], v['L' + k], v['C' + k], v.f), I = v.Vf / Math.max(z.mod, .001), p = I * I * z.a, q = I * I * z.b;
        P += p; Q += q;
        out.push({ rotulo: 'Fase ' + k,
          tex: '\\begin{aligned} X_' + k + ' &= ' + V(z.xl, 2) + ' - ' + par(V(z.xc, 2)) + ' = ' + V(z.b, 2, '\u03a9') + ',\\quad Z_' + k + ' = \\sqrt{' + sq(G(z.a)) + ' + ' + sq(V(z.b, 2)) + '} = ' + V(z.mod, 2, '\u03a9') + ' \\\\ I_' + k + ' &= \\dfrac{' + G(v.Vf) + '}{' + V(Math.max(z.mod, .001), 2) + '} = ' + V(I, 2, 'A') + ' \\\\ P_' + k + ' &= I_' + k + '^2 R_' + k + ' = ' + V(p, 1, 'W') + ',\\quad Q_' + k + ' = I_' + k + '^2 X_' + k + ' = ' + V(q, 1, 'VAr') + ' \\end{aligned}' });
      });
      var vl = Math.sqrt(3) * v.Vf, S = Math.sqrt(P * P + Q * Q);
      out.push({ rotulo: 'Tens\u00e3o de linha', tex: 'V_l = \\sqrt{3}\\cdot ' + G(v.Vf) + ' = ' + V(vl, 0, 'V'), saidaId: 'tri-vl', esperado: [fix(vl, 0)] });
      out.push({ rotulo: 'Pot\u00eancia ativa total', tex: 'P_{tot} = P_A + P_B + P_C = ' + V(P / 1000, 2, 'kW'), saidaId: 'tri-p', esperado: [fix(P / 1000, 2)] });
      out.push({ rotulo: 'Pot\u00eancia reativa total', tex: 'Q_{tot} = Q_A + Q_B + Q_C = ' + V(Q / 1000, 2, 'kVAr'), saidaId: 'tri-q2', esperado: [fix(Q / 1000, 2)] });
      out.push({ rotulo: 'Pot\u00eancia aparente total', tex: 'S_{tot} = \\sqrt{' + sq(V(P / 1000, 2)) + ' + ' + sq(V(Q / 1000, 2)) + '} = ' + V(S / 1000, 2, 'kVA'), saidaId: 'tri-s', esperado: [fix(S / 1000, 2)] });
      return out;
    },
    observacoes: [
      'As tens\u00f5es de fase t\u00eam mesma amplitude e defasagem de 120\u00b0. Em cargas equilibradas a soma das tr\u00eas correntes \u00e9 zero, e o neutro n\u00e3o conduz.',
      'Rela\u00e7\u00e3o entre linha e fase: em estrela V_L = \u221a3\u00b7V_f e I_L = I_f; em tri\u00e2ngulo V_L = V_f e I_L = \u221a3\u00b7I_f. Em valores de linha, P = \u221a3\u00b7V_L\u00b7I_L\u00b7cos\u03c6.',
      'Nesta calculadora cada fase \u00e9 uma carga ligada \u00e0 tens\u00e3o de fase informada. Se as tr\u00eas forem iguais, a carga \u00e9 equilibrada.',
      'Cada fase \u00e9 resolvida sozinha com V_f (liga\u00e7\u00e3o em estrela com neutro): a corrente de uma fase n\u00e3o depende das outras.',
      'V_l = \u221a3 \u00b7 V_f vale para o sistema de tens\u00f5es equilibrado e defasado de 120\u00b0. Erro comum: usar a tens\u00e3o de linha como se fosse a de fase.',
      'S_tot \u00e9 calculada como \u221a(P\u00b2 + Q\u00b2) com os totais das tr\u00eas fases (soma de pot\u00eancias, n\u00e3o de m\u00f3dulos).',
      'Q positivo = indutivo, Q negativo = capacitivo. Capacitores em uma fase compensam o reativo indutivo dessa mesma fase.',
      'Cargas desequilibradas geram corrente no neutro; este modelo n\u00e3o calcula essa corrente.',
      'O divisor da corrente usa no m\u00ednimo 0,001 \u03a9 para evitar divis\u00e3o por zero.'
    ]
  });

  /* ====================== Y \u2194 Delta ====================== */
  function fmtRv(v) { if (!isFinite(v)) return '\u221e'; var r = parseFloat(v.toPrecision(6)); return String(Number.isInteger(r) ? r : r.toFixed(4).replace(/\.?0+$/, '')); }
  function lerYD(ids) {
    return function () {
      var o = {}; Object.keys(ids).forEach(function (k) { var e = document.getElementById(ids[k]); o[k] = e ? parseFloat(e.value) : NaN; }); return o;
    };
  }
  function ydVal(s, u) { return s === '\u221e' ? '\\infty\\,' + F.tu(u) : tv(s, u); }
  reg({
    id: 'elet-yd-y2d', titulo: 'Transforma\u00e7\u00e3o estrela (Y) \u2192 delta (\u0394)',
    proposito: 'Obt\u00e9m as resist\u00eancias do delta equivalente a partir das resist\u00eancias da estrela.',
    tex: '\\begin{aligned} \\Sigma &= R_1R_2 + R_2R_3 + R_3R_1 \\\\ R_a = \\dfrac{\\Sigma}{R_1},\\quad R_b &= \\dfrac{\\Sigma}{R_2},\\quad R_c = \\dfrac{\\Sigma}{R_3} \\end{aligned}',
    vazio: 'nan',
    variaveis: [
      { simbolo: 'R1', tex: 'R_1', nome: 'resist\u00eancia da estrela, n\u00f3 A', unidade: '\u03a9', inputId: 'yd-r1' },
      { simbolo: 'R2', tex: 'R_2', nome: 'resist\u00eancia da estrela, n\u00f3 B', unidade: '\u03a9', inputId: 'yd-r2' },
      { simbolo: 'R3', tex: 'R_3', nome: 'resist\u00eancia da estrela, n\u00f3 C', unidade: '\u03a9', inputId: 'yd-r3' },
      { simbolo: 'Ra', tex: 'R_a', nome: 'resist\u00eancia do delta, rotulada B\u2013C na calculadora', unidade: '\u03a9', saidaId: 'yd-va' },
      { simbolo: 'Rb', tex: 'R_b', nome: 'resist\u00eancia do delta, rotulada A\u2013C na calculadora', unidade: '\u03a9', saidaId: 'yd-vb' },
      { simbolo: 'Rc', tex: 'R_c', nome: 'resist\u00eancia do delta, rotulada A\u2013B na calculadora', unidade: '\u03a9', saidaId: 'yd-vc' }
    ],
    ler: lerYD({ R1: 'yd-r1', R2: 'yd-r2', R3: 'yd-r3' }),
    passos: function (v) {
      if ([v.R1, v.R2, v.R3].some(function (x) { return isNaN(x) || x < 0; })) return [{ texto: 'Preencha R1, R2 e R3 (\u2265 0) e clique em Calcular.' }];
      var s = v.R1 * v.R2 + v.R2 * v.R3 + v.R3 * v.R1, Ra = v.R1 ? s / v.R1 : Infinity, Rb = v.R2 ? s / v.R2 : Infinity, Rc = v.R3 ? s / v.R3 : Infinity;
      return [
        { rotulo: 'Soma dos produtos', tex: '\\Sigma = ' + G(v.R1) + '\\cdot ' + G(v.R2) + ' + ' + G(v.R2) + '\\cdot ' + G(v.R3) + ' + ' + G(v.R3) + '\\cdot ' + G(v.R1) + ' = ' + V(s, 4) + '\\,\\Omega^2' },
        { rotulo: 'R_a', tex: 'R_a = \\dfrac{\\Sigma}{R_1} = ' + ydVal(fmtRv(Ra), '\u03a9'), saidaId: 'yd-va', esperado: [fmtRv(Ra)] },
        { rotulo: 'R_b', tex: 'R_b = \\dfrac{\\Sigma}{R_2} = ' + ydVal(fmtRv(Rb), '\u03a9'), saidaId: 'yd-vb', esperado: [fmtRv(Rb)] },
        { rotulo: 'R_c', tex: 'R_c = \\dfrac{\\Sigma}{R_3} = ' + ydVal(fmtRv(Rc), '\u03a9'), saidaId: 'yd-vc', esperado: [fmtRv(Rc)] }
      ];
    },
    observacoes: [
      'As duas redes s\u00e3o equivalentes s\u00f3 vistas pelos terminais A, B e C. Por dentro, as correntes de cada resistor s\u00e3o diferentes.',
      'Cada resist\u00eancia do delta \u00e9 a soma dos produtos dois a dois dividida pela resist\u00eancia da estrela do n\u00f3 oposto ao lado (Kennelly): R_a (B\u2013C) usa R_1 (n\u00f3 A), R_b (A\u2013C) usa R_2 (n\u00f3 B), R_c (A\u2013B) usa R_3 (n\u00f3 C).',
      'Se uma resist\u00eancia da estrela for zero, a do delta correspondente tende ao infinito (circuito aberto) e a calculadora mostra \u221e.',
      'Delta equivalente tem resist\u00eancias maiores que as da estrela. Em estrela equilibrada, R\u0394 = 3\u00b7R_Y.',
      'Fa\u00e7a a correspond\u00eancia dos terminais A, B e C com cuidado: associar a resist\u00eancia ao par errado de n\u00f3s \u00e9 o erro mais comum nesta transforma\u00e7\u00e3o.',
      'A f\u00f3rmula acima segue exatamente o c\u00e1lculo da ferramenta. R_a, R_b e R_c correspondem aos pares de n\u00f3s B\u2013C, A\u2013C e A\u2013B, como rotulado na calculadora.'
    ]
  });
  reg({
    id: 'elet-yd-d2y', titulo: 'Transforma\u00e7\u00e3o delta (\u0394) \u2192 estrela (Y)',
    proposito: 'Obt\u00e9m as resist\u00eancias da estrela equivalente a partir das resist\u00eancias do delta.',
    tex: '\\begin{aligned} \\Sigma &= R_a + R_b + R_c \\\\ R_1 = \\dfrac{R_bR_c}{\\Sigma},\\quad R_2 &= \\dfrac{R_aR_c}{\\Sigma},\\quad R_3 = \\dfrac{R_aR_b}{\\Sigma} \\end{aligned}',
    vazio: 'nan',
    variaveis: [
      { simbolo: 'Ra', tex: 'R_a', nome: 'resist\u00eancia do delta (B\u2013C)', unidade: '\u03a9', inputId: 'yd-ra' },
      { simbolo: 'Rb', tex: 'R_b', nome: 'resist\u00eancia do delta (A\u2013C)', unidade: '\u03a9', inputId: 'yd-rb' },
      { simbolo: 'Rc', tex: 'R_c', nome: 'resist\u00eancia do delta (A\u2013B)', unidade: '\u03a9', inputId: 'yd-rc' },
      { simbolo: 'R1', tex: 'R_1', nome: 'resist\u00eancia da estrela, n\u00f3 A', unidade: '\u03a9', saidaId: 'yd-va' },
      { simbolo: 'R2', tex: 'R_2', nome: 'resist\u00eancia da estrela, n\u00f3 B', unidade: '\u03a9', saidaId: 'yd-vb' },
      { simbolo: 'R3', tex: 'R_3', nome: 'resist\u00eancia da estrela, n\u00f3 C', unidade: '\u03a9', saidaId: 'yd-vc' }
    ],
    ler: lerYD({ Ra: 'yd-ra', Rb: 'yd-rb', Rc: 'yd-rc' }),
    passos: function (v) {
      if ([v.Ra, v.Rb, v.Rc].some(function (x) { return isNaN(x) || x < 0; })) return [{ texto: 'Preencha Ra, Rb e Rc (\u2265 0) e clique em Calcular.' }];
      var s = v.Ra + v.Rb + v.Rc;
      if (!s) return [{ texto: 'A soma Ra + Rb + Rc n\u00e3o pode ser zero.' }];
      var R1 = (v.Rb * v.Rc) / s, R2 = (v.Ra * v.Rc) / s, R3 = (v.Ra * v.Rb) / s;
      return [
        { rotulo: 'Soma das resist\u00eancias do delta', tex: '\\Sigma = ' + G(v.Ra) + ' + ' + G(v.Rb) + ' + ' + G(v.Rc) + ' = ' + V(s, 4, '\u03a9') },
        { rotulo: 'R_1', tex: 'R_1 = \\dfrac{' + G(v.Rb) + '\\cdot ' + G(v.Rc) + '}{' + G(s) + '} = ' + ydVal(fmtRv(R1), '\u03a9'), saidaId: 'yd-va', esperado: [fmtRv(R1)] },
        { rotulo: 'R_2', tex: 'R_2 = \\dfrac{' + G(v.Ra) + '\\cdot ' + G(v.Rc) + '}{' + G(s) + '} = ' + ydVal(fmtRv(R2), '\u03a9'), saidaId: 'yd-vb', esperado: [fmtRv(R2)] },
        { rotulo: 'R_3', tex: 'R_3 = \\dfrac{' + G(v.Ra) + '\\cdot ' + G(v.Rb) + '}{' + G(s) + '} = ' + ydVal(fmtRv(R3), '\u03a9'), saidaId: 'yd-vc', esperado: [fmtRv(R3)] }
      ];
    },
    observacoes: [
      'A transforma\u00e7\u00e3o serve para simplificar redes que n\u00e3o s\u00e3o nem s\u00e9rie nem paralelo, como pontes. Em delta equilibrado, R_Y = R_\u0394/3.',
      'Cada resist\u00eancia da estrela \u00e9 o produto das duas resist\u00eancias do delta que tocam o mesmo n\u00f3, dividido pela soma das tr\u00eas.',
      'Estrela equivalente tem resist\u00eancias menores que as do delta. Em delta equilibrado, R_Y = R\u0394/3.',
      'Confira os r\u00f3tulos dos n\u00f3s na calculadora: R_1 est\u00e1 associada ao n\u00f3 A, e usa R_b (A\u2013C) e R_c (A\u2013B).'
    ]
  });

  /* ====================== N\u00fameros complexos (Z1, Z2, s\u00e9rie, paralelo) ====================== */
  var VCX = [
    { simbolo: 'a1', tex: 'a_1', nome: 'parte real de Z\u2081 (forma retangular)', unidade: '\u03a9', inputId: 'cx-a1' },
    { simbolo: 'b1', tex: 'b_1', nome: 'parte imagin\u00e1ria de Z\u2081', unidade: '\u03a9', inputId: 'cx-b1' },
    { simbolo: 'm1', tex: '|Z_1|', nome: 'm\u00f3dulo de Z\u2081 (forma polar)', unidade: '\u03a9', inputId: 'cx-m1' },
    { simbolo: 't1', tex: '\\theta_1', nome: '\u00e2ngulo de Z\u2081 (forma polar)', unidade: '\u00b0', inputId: 'cx-t1' },
    { simbolo: 'a2', tex: 'a_2', nome: 'parte real de Z\u2082', unidade: '\u03a9', inputId: 'cx-a2' },
    { simbolo: 'b2', tex: 'b_2', nome: 'parte imagin\u00e1ria de Z\u2082', unidade: '\u03a9', inputId: 'cx-b2' },
    { simbolo: 'm2', tex: '|Z_2|', nome: 'm\u00f3dulo de Z\u2082', unidade: '\u03a9', inputId: 'cx-m2' },
    { simbolo: 't2', tex: '\\theta_2', nome: '\u00e2ngulo de Z\u2082', unidade: '\u00b0', inputId: 'cx-t2' }
  ];
  function lerCX() {
    function n(id) { var e = document.getElementById(id); return e ? +e.value : NaN; }
    function t(id) { var e = document.getElementById(id); return e ? e.value : 'ret'; }
    return { tp1: t('cx-type1'), tp2: t('cx-type2'), a1: n('cx-a1'), b1: n('cx-b1'), m1: n('cx-m1'), t1: n('cx-t1'), a2: n('cx-a2'), b2: n('cx-b2'), m2: n('cx-m2'), t2: n('cx-t2') };
  }
  function getZ(v, n) { // espelha getCX
    if (v['tp' + n] === 'ret') return { a: v['a' + n], b: v['b' + n], pol: false, m: v['m' + n], t: v['t' + n] };
    var ang = v['t' + n] * PI / 180, m = v['m' + n];
    return { a: m * Math.cos(ang), b: m * Math.sin(ang), pol: true, m: m, t: v['t' + n] };
  }
  function modAng(z) { return { m: Math.sqrt(z.a * z.a + z.b * z.b), ang: Math.atan2(z.b, z.a) * 180 / PI }; }
  function retEsp(z) { return [fix(z.a, 4), fix(z.b, 4)]; }
  function polEsp(z) { var ma = modAng(z); return [fix(ma.m, 4), fix(ma.ang, 2)]; }
  function stepsForma(z, n) {
    var ma = modAng(z), out = [];
    if (z.pol) out.push({ rotulo: 'Z_' + n + ' informado em forma polar: converter', tex: 'a_' + n + ' = ' + G(z.m) + '\\cos(' + G(z.t, '\u00b0') + ') = ' + V(z.a, 4) + ',\\quad b_' + n + ' = ' + G(z.m) + '\\sin(' + G(z.t, '\u00b0') + ') = ' + V(z.b, 4) });
    out.push({ rotulo: 'Z_' + n + ' (retangular)', tex: 'Z_' + n + ' = ' + cx(z.a, z.b, 4) + '\\,\\Omega', saidaId: 'cx-z' + n + '-ret', esperado: retEsp(z) });
    out.push({ rotulo: 'M\u00f3dulo e \u00e2ngulo de Z_' + n, tex: '|Z_' + n + '| = \\sqrt{' + sq(V(z.a, 4)) + ' + ' + sq(V(z.b, 4)) + '} = ' + V(ma.m, 4, '\u03a9') + ',\\quad \\theta_' + n + ' = ' + A2(z.b, z.a, 4) + ' = ' + V(ma.ang, 2, '\u00b0'), saidaId: 'cx-mod' + n, esperado: [fix(ma.m, 4)] });
    out.push({ rotulo: 'Z_' + n + ' (polar)', tex: 'Z_' + n + ' = ' + pol(ma.m, ma.ang, 4, 2) + '\\,\\Omega', saidaId: 'cx-z' + n + '-pol', esperado: polEsp(z) });
    return out;
  }
  var OUVIR_CX = ['cx-type1', 'cx-type2'];
  reg({
    id: 'elet-cx-forma', titulo: 'Imped\u00e2ncia complexa: forma retangular e polar',
    proposito: 'Converte uma imped\u00e2ncia entre a + jb e m\u00f3dulo \u2220 \u00e2ngulo (para Z\u2081 e Z\u2082). O n\u00famero complexo re\u00fane resist\u00eancia (parte real) e reat\u00e2ncia (parte imagin\u00e1ria) em um s\u00f3 valor.',
    tex: '\\begin{aligned} a &= |Z|\\cos\\theta \\qquad b = |Z|\\sin\\theta \\\\ |Z| &= \\sqrt{a^2 + b^2} \\qquad \\theta = \\operatorname{atan2}(b,\\,a) \\end{aligned}',
    variaveis: VCX.concat([
      { simbolo: 'mod1', tex: '|Z_1|', nome: 'm\u00f3dulo de Z\u2081 calculado', unidade: '\u03a9', saidaId: 'cx-mod1' },
      { simbolo: 'ang1', tex: '\\theta_1', nome: '\u00e2ngulo de Z\u2081 calculado', unidade: '\u00b0', saidaId: 'cx-ang1' },
      { simbolo: 'mod2', tex: '|Z_2|', nome: 'm\u00f3dulo de Z\u2082 calculado', unidade: '\u03a9', saidaId: 'cx-mod2' },
      { simbolo: 'ang2', tex: '\\theta_2', nome: '\u00e2ngulo de Z\u2082 calculado', unidade: '\u00b0', saidaId: 'cx-ang2' }
    ]),
    ouvir: OUVIR_CX, ler: lerCX,
    passos: function (v) {
      var z1 = getZ(v, 1), z2 = getZ(v, 2), a1 = modAng(z1), a2 = modAng(z2);
      var out = stepsForma(z1, 1).concat(stepsForma(z2, 2));
      out.push({ rotulo: '\u00c2ngulo de Z_1', texto: fix(a1.ang, 2).replace('.', ',') + '\u00b0', saidaId: 'cx-ang1', esperado: [fix(a1.ang, 2)] });
      out.push({ rotulo: '\u00c2ngulo de Z_2', texto: fix(a2.ang, 2).replace('.', ',') + '\u00b0', saidaId: 'cx-ang2', esperado: [fix(a2.ang, 2)] });
      return out;
    },
    observacoes: [
      'Indutor tem reat\u00e2ncia positiva (+jX_L, corrente atrasa) e capacitor negativa (\u2212jX_C, corrente adianta). Usa-se j porque i j\u00e1 \u00e9 a corrente.',
      'Retangular (a + jb) \u00e9 pr\u00e1tico para somar; polar (m\u00f3dulo \u2220 \u00e2ngulo) \u00e9 pr\u00e1tico para multiplicar e dividir.',
      'O \u00e2ngulo \u00e9 informado em graus e convertido para radianos na conta (\u00d7 \u03c0/180). atan2 resolve o quadrante certo; arctan(b/a) sozinho erra quando a < 0.',
      'Parte imagin\u00e1ria positiva = reat\u00e2ncia indutiva; negativa = capacitiva. O \u00e2ngulo tem o mesmo sinal de b.'
    ]
  });
  reg({
    id: 'elet-cx-serie', titulo: 'Imped\u00e2ncias em s\u00e9rie (soma complexa)',
    proposito: 'Soma duas imped\u00e2ncias complexas: partes reais com reais, imagin\u00e1rias com imagin\u00e1rias.',
    tex: 'Z_s = Z_1 + Z_2 = (a_1 + a_2) + j\\,(b_1 + b_2)',
    variaveis: VCX.concat([
      { simbolo: 'Zs', tex: 'Z_s', nome: 'imped\u00e2ncia equivalente em s\u00e9rie', unidade: '\u03a9', saidaId: 'cx-serie-ret' }
    ]),
    ouvir: OUVIR_CX, ler: lerCX,
    passos: function (v) {
      var z1 = getZ(v, 1), z2 = getZ(v, 2), s = { a: z1.a + z2.a, b: z1.b + z2.b }, ma = modAng(s);
      return [
        { rotulo: 'Z_1 e Z_2 em forma retangular', tex: 'Z_1 = ' + cx(z1.a, z1.b, 4) + ',\\quad Z_2 = ' + cx(z2.a, z2.b, 4) },
        { rotulo: 'Soma', tex: 'Z_s = (' + V(z1.a, 4) + ' + ' + par(V(z2.a, 4)) + ') + j\\,(' + V(z1.b, 4) + ' + ' + par(V(z2.b, 4)) + ') = ' + cx(s.a, s.b, 4) + '\\,\\Omega', saidaId: 'cx-serie-ret', esperado: retEsp(s) },
        { rotulo: 'M\u00f3dulo', tex: '|Z_s| = \\sqrt{' + sq(V(s.a, 4)) + ' + ' + sq(V(s.b, 4)) + '} = ' + V(ma.m, 4, '\u03a9'), saidaId: 'cx-serie-mod', esperado: [fix(ma.m, 4)] },
        { rotulo: '\u00c2ngulo', tex: '\\theta_s = ' + A2(s.b, s.a, 4) + ' = ' + V(ma.ang, 2, '\u00b0'), saidaId: 'cx-serie-ang', esperado: [fix(ma.ang, 2)] },
        { rotulo: 'Forma polar', tex: 'Z_s = ' + pol(ma.m, ma.ang, 4, 2) + '\\,\\Omega', saidaId: 'cx-serie-pol', esperado: polEsp(s) }
      ];
    },
    observacoes: [
      'Para somar, use a forma retangular: soma-se parte real com parte real e imagin\u00e1ria com imagin\u00e1ria. Somar m\u00f3dulos e \u00e2ngulos da forma polar est\u00e1 errado.',
      'Em s\u00e9rie a mesma corrente passa pelas duas imped\u00e2ncias e as imped\u00e2ncias se somam.',
      'O m\u00f3dulo de Z_s n\u00e3o \u00e9 |Z\u2081| + |Z\u2082|, a menos que tenham o mesmo \u00e2ngulo. Reat\u00e2ncia indutiva e capacitiva se cancelam parcialmente.',
      'Se Z\u2081 e Z\u2082 forem dadas em polar, a conta converte para retangular antes de somar.'
    ]
  });
  reg({
    id: 'elet-cx-paralelo', titulo: 'Imped\u00e2ncias em paralelo (produto sobre soma)',
    proposito: 'Calcula a imped\u00e2ncia equivalente de duas imped\u00e2ncias complexas ligadas em paralelo.',
    tex: 'Z_p = \\dfrac{Z_1 Z_2}{Z_1 + Z_2} \\qquad Z_1 Z_2 = (a_1a_2 - b_1b_2) + j\\,(a_1b_2 + b_1a_2)',
    variaveis: VCX.concat([
      { simbolo: 'Zp', tex: 'Z_p', nome: 'imped\u00e2ncia equivalente em paralelo', unidade: '\u03a9', saidaId: 'cx-par-ret' }
    ]),
    ouvir: OUVIR_CX, ler: lerCX,
    passos: function (v) {
      var z1 = getZ(v, 1), z2 = getZ(v, 2), s = { a: z1.a + z2.a, b: z1.b + z2.b };
      var n = { a: z1.a * z2.a - z1.b * z2.b, b: z1.a * z2.b + z1.b * z2.a };
      var d = s.a * s.a + s.b * s.b || 1e-12, p = { a: (n.a * s.a + n.b * s.b) / d, b: (n.b * s.a - n.a * s.b) / d }, ma = modAng(p);
      return [
        { rotulo: 'Produto Z_1 Z_2', tex: 'Z_1Z_2 = ' + cx(n.a, n.b, 4) },
        { rotulo: 'Soma Z_1 + Z_2', tex: 'Z_1 + Z_2 = ' + cx(s.a, s.b, 4) },
        { rotulo: 'Divis\u00e3o complexa (multiplica pelo conjugado do denominador)', tex: 'Z_p = \\dfrac{(' + V(n.a, 4) + ')(' + V(s.a, 4) + ') + (' + V(n.b, 4) + ')(' + V(s.b, 4) + ')}{' + V(d, 4) + '} + j\\,\\dfrac{(' + V(n.b, 4) + ')(' + V(s.a, 4) + ') - (' + V(n.a, 4) + ')(' + V(s.b, 4) + ')}{' + V(d, 4) + '}' },
        { rotulo: 'Resultado', tex: 'Z_p = ' + cx(p.a, p.b, 4) + '\\,\\Omega', saidaId: 'cx-par-ret', esperado: retEsp(p) },
        { rotulo: 'M\u00f3dulo', tex: '|Z_p| = ' + V(ma.m, 4, '\u03a9'), saidaId: 'cx-par-mod', esperado: [fix(ma.m, 4)] },
        { rotulo: '\u00c2ngulo', tex: '\\theta_p = ' + V(ma.ang, 2, '\u00b0'), saidaId: 'cx-par-ang', esperado: [fix(ma.ang, 2)] },
        { rotulo: 'Forma polar', tex: 'Z_p = ' + pol(ma.m, ma.ang, 4, 2) + '\\,\\Omega', saidaId: 'cx-par-pol', esperado: polEsp(p) }
      ];
    },
    observacoes: [
      'Duas imped\u00e2ncias iguais em paralelo d\u00e3o metade do valor. Para multiplicar e dividir, a forma polar costuma ser mais pr\u00e1tica (multiplica m\u00f3dulos e soma \u00e2ngulos).',
      'Em paralelo a tens\u00e3o \u00e9 a mesma nas duas imped\u00e2ncias e as admit\u00e2ncias (1/Z) se somam; produto sobre soma \u00e9 o mesmo resultado para duas imped\u00e2ncias.',
      'A f\u00f3rmula serve para duas imped\u00e2ncias. Para tr\u00eas ou mais, some as admit\u00e2ncias ou aplique a f\u00f3rmula aos pares.',
      'Se Z\u2081 + Z\u2082 for zero, a divis\u00e3o n\u00e3o existe; a calculadora usa um denominador m\u00ednimo (10\u207b\u00b9\u00b2) para n\u00e3o travar e o resultado perde sentido.'
    ]
  });

  /* ====================== Corre\u00e7\u00e3o do FP (p\u00e1gina dedicada) ====================== */
  reg({
    id: 'elet-cfp-page', titulo: 'Corre\u00e7\u00e3o do fator de pot\u00eancia (m\u00e9todo do tri\u00e2ngulo de pot\u00eancias)',
    proposito: 'Calcula o reativo a compensar e o capacitor necess\u00e1rio para levar o fp existente at\u00e9 o fp desejado, em sistema mono ou trif\u00e1sico. Mostra quanto de pot\u00eancia reativa o banco de capacitores precisa fornecer para chegar ao fator de pot\u00eancia desejado.',
    tex: '\\begin{aligned} S_1 &= \\dfrac{P}{\\mathrm{fp}_1},\\quad Q_1 = \\sqrt{S_1^2 - P^2} \\\\ S_2 &= \\dfrac{P}{\\mathrm{fp}_2},\\quad Q_2 = \\sqrt{S_2^2 - P^2} \\\\ Q_c &= Q_1 - Q_2 \\\\ C_{1\\phi} &= \\dfrac{Q_c}{V^2\\,\\omega} \\qquad C_{3\\phi} = \\dfrac{Q_c}{3\\,V^2\\,\\omega} \\\\ I_{1\\phi} &= \\dfrac{S}{V} \\qquad I_{3\\phi} = \\dfrac{S}{\\sqrt{3}\\,V} \\end{aligned}',
    variaveis: [
      { simbolo: 'sys', tex: '\\text{sistema}', nome: 'sistema (1 = monof\u00e1sico, 3 = trif\u00e1sico)', unidade: '', inputId: 'cfppage-sys' },
      { simbolo: 'known', tex: '\\text{dados}', nome: 'par de grandezas conhecidas (P e fp, S e fp, ou P e Q)', unidade: '', inputId: 'cfppage-known' },
      { simbolo: 'V', tex: 'V', nome: 'tens\u00e3o (monof\u00e1sico: da carga; trif\u00e1sico: de linha). Vazio = 220', unidade: 'V', inputId: 'cfppage-v' },
      { simbolo: 'f', tex: 'f', nome: 'frequ\u00eancia. Vazio = 60', unidade: 'Hz', inputId: 'cfppage-f' },
      { simbolo: 'FPt', tex: '\\mathrm{fp}_2', nome: 'fator de pot\u00eancia desejado', unidade: '', inputId: 'cfppage-target' },
      { simbolo: 'Pk', tex: 'P', nome: 'pot\u00eancia ativa (modo P e fp)', unidade: 'kW', inputId: 'cfppage-val-p' },
      { simbolo: 'FP1', tex: '\\mathrm{fp}_1', nome: 'fator de pot\u00eancia atual (modo P e fp)', unidade: '', inputId: 'cfppage-val-fp' },
      { simbolo: 'Sk', tex: 'S', nome: 'pot\u00eancia aparente (modo S e fp)', unidade: 'kVA', inputId: 'cfppage-val-s' },
      { simbolo: 'FPs', tex: '\\mathrm{fp}_1', nome: 'fator de pot\u00eancia atual (modo S e fp)', unidade: '', inputId: 'cfppage-val-fps' },
      { simbolo: 'P2', tex: 'P', nome: 'pot\u00eancia ativa (modo P e Q)', unidade: 'kW', inputId: 'cfppage-val-p2' },
      { simbolo: 'Qk', tex: 'Q_1', nome: 'pot\u00eancia reativa atual (modo P e Q)', unidade: 'kVAr', inputId: 'cfppage-val-q' },
      { simbolo: 'S1', tex: 'S_1', nome: 'aparente antes', unidade: 'kVA', saidaId: 'cfppage-out-s1' },
      { simbolo: 'Q1', tex: 'Q_1', nome: 'reativa antes', unidade: 'kVAr', saidaId: 'cfppage-out-q1' },
      { simbolo: 'I1', tex: 'I_1', nome: 'corrente antes', unidade: 'A', saidaId: 'cfppage-out-i1' },
      { simbolo: 'S2', tex: 'S_2', nome: 'aparente depois', unidade: 'kVA', saidaId: 'cfppage-out-s2' },
      { simbolo: 'Q2', tex: 'Q_2', nome: 'reativa depois', unidade: 'kVAr', saidaId: 'cfppage-out-q2' },
      { simbolo: 'I2', tex: 'I_2', nome: 'corrente depois', unidade: 'A', saidaId: 'cfppage-out-i2' },
      { simbolo: 'Qc', tex: 'Q_c', nome: 'reativo a compensar', unidade: 'kVAr', saidaId: 'cfppage-out-qc' },
      { simbolo: 'C', tex: 'C', nome: 'capacit\u00e2ncia necess\u00e1ria (trif\u00e1sico: por fase, em delta)', unidade: '\u00b5F', saidaId: 'cfppage-out-c' }
    ],
    ouvir: [],
    ler: function () {
      function n(id) { var e = document.getElementById(id); return e ? +e.value : NaN; }
      function s(id, d) { var e = document.getElementById(id); return e ? e.value : d; }
      return { sys: +s('cfppage-sys', '1'), known: s('cfppage-known', 'p_fp'), V: n('cfppage-v') || 220, f: n('cfppage-f') || 60, FPt: n('cfppage-target'),
        Pk: n('cfppage-val-p') || 0, FP1: n('cfppage-val-fp') || 0, Sk: n('cfppage-val-s') || 0, FPs: n('cfppage-val-fps') || 0, P2: n('cfppage-val-p2') || 0, Qk: n('cfppage-val-q') || 0 };
    },
    passos: function (v) {
      var out = [], P = 0, Q1 = 0, S1 = 0, FP1 = 0;
      if (v.known === 'p_fp') {
        P = v.Pk * 1000; FP1 = v.FP1;
        if (FP1 > 0 && FP1 <= 1) { S1 = P / FP1; Q1 = Math.sqrt(Math.max(0, S1 * S1 - P * P)); }
        out.push({ rotulo: 'Estado atual a partir de P e fp', tex: 'P = ' + G(v.Pk, 'kW') + ' = ' + G(P, 'W') + ',\\quad S_1 = \\dfrac{P}{\\mathrm{fp}_1} = \\dfrac{' + G(P) + '}{' + G(FP1) + '} = ' + V(S1 / 1000, 2, 'kVA') + ',\\quad Q_1 = \\sqrt{S_1^2 - P^2} = ' + V(Q1 / 1000, 2, 'kVAr') });
      } else if (v.known === 's_fp') {
        S1 = v.Sk * 1000; FP1 = v.FPs;
        if (FP1 > 0 && FP1 <= 1) { P = S1 * FP1; Q1 = Math.sqrt(Math.max(0, S1 * S1 - P * P)); }
        out.push({ rotulo: 'Estado atual a partir de S e fp', tex: 'S_1 = ' + G(v.Sk, 'kVA') + ',\\quad P = S_1\\,\\mathrm{fp}_1 = ' + G(S1) + '\\cdot ' + G(FP1) + ' = ' + V(P / 1000, 2, 'kW') + ',\\quad Q_1 = \\sqrt{S_1^2 - P^2} = ' + V(Q1 / 1000, 2, 'kVAr') });
      } else {
        P = v.P2 * 1000; Q1 = v.Qk * 1000; S1 = Math.sqrt(P * P + Q1 * Q1); FP1 = S1 > 0 ? P / S1 : 0;
        out.push({ rotulo: 'Estado atual a partir de P e Q', tex: 'S_1 = \\sqrt{P^2 + Q_1^2} = \\sqrt{' + sq(G(P)) + ' + ' + sq(G(Q1)) + '} = ' + V(S1 / 1000, 2, 'kVA') + ',\\quad \\mathrm{fp}_1 = \\dfrac{P}{S_1} = ' + V(FP1, 4) });
      }
      if (P <= 0 || v.FPt <= 0 || v.FPt > 1) return [{ texto: 'P \u2264 0 ou fp desejado fora de (0; 1]: a calculadora n\u00e3o atualiza os resultados.' }];
      var S2 = P / v.FPt, Q2 = Math.sqrt(Math.max(0, S2 * S2 - P * P)), Qc = Q1 - Q2, w = 2 * PI * v.f;
      var C = v.sys === 1 ? Qc / (v.V * v.V * w) : Qc / (3 * v.V * v.V * w);
      var I1 = v.sys === 1 ? S1 / v.V : S1 / (Math.sqrt(3) * v.V), I2 = v.sys === 1 ? S2 / v.V : S2 / (Math.sqrt(3) * v.V);
      out.push({ rotulo: 'Aparente antes', tex: 'S_1 = ' + V(S1 / 1000, 2, 'kVA'), saidaId: 'cfppage-out-s1', esperado: [fix(S1 / 1000, 2)] });
      out.push({ rotulo: 'Reativa antes', tex: 'Q_1 = ' + V(Q1 / 1000, 2, 'kVAr'), saidaId: 'cfppage-out-q1', esperado: [fix(Q1 / 1000, 2)] });
      out.push({ rotulo: 'Corrente antes', tex: 'I_1 = ' + (v.sys === 1 ? '\\dfrac{S_1}{V} = \\dfrac{' + G(S1) + '}{' + G(v.V) + '}' : '\\dfrac{S_1}{\\sqrt{3}\\,V} = \\dfrac{' + G(S1) + '}{\\sqrt{3}\\cdot ' + G(v.V) + '}') + ' = ' + V(I1, 2, 'A'), saidaId: 'cfppage-out-i1', esperado: [fix(I1, 2)] });
      out.push({ rotulo: 'Aparente depois (fp desejado)', tex: 'S_2 = \\dfrac{P}{\\mathrm{fp}_2} = \\dfrac{' + G(P) + '}{' + G(v.FPt) + '} = ' + V(S2 / 1000, 2, 'kVA'), saidaId: 'cfppage-out-s2', esperado: [fix(S2 / 1000, 2)] });
      out.push({ rotulo: 'Reativa depois', tex: 'Q_2 = \\sqrt{S_2^2 - P^2} = ' + V(Q2 / 1000, 2, 'kVAr'), saidaId: 'cfppage-out-q2', esperado: [fix(Q2 / 1000, 2)] });
      out.push({ rotulo: 'Corrente depois', tex: 'I_2 = ' + V(I2, 2, 'A'), saidaId: 'cfppage-out-i2', esperado: [fix(I2, 2)] });
      out.push({ rotulo: 'Reativo a compensar', tex: 'Q_c = Q_1 - Q_2 = ' + V(Q1 / 1000, 2) + ' - ' + par(V(Q2 / 1000, 2)) + ' = ' + V(Qc / 1000, 2, 'kVAr'), saidaId: 'cfppage-out-qc', esperado: [fix(Qc / 1000, 2)] });
      out.push({ rotulo: 'Frequ\u00eancia angular', tex: '\\omega = 2\\pi\\cdot ' + G(v.f) + ' = ' + V(w, 2, W_UN) });
      out.push({ rotulo: v.sys === 1 ? 'Capacitor (monof\u00e1sico)' : 'Capacitor por fase (delta, V = tens\u00e3o de linha)',
        tex: 'C = ' + (v.sys === 1 ? '\\dfrac{Q_c}{V^2\\,\\omega} = \\dfrac{' + G(Qc) + '}{' + sq(G(v.V)) + '\\cdot ' + V(w, 2) + '}' : '\\dfrac{Q_c}{3\\,V^2\\,\\omega} = \\dfrac{' + G(Qc) + '}{3\\cdot ' + sq(G(v.V)) + '\\cdot ' + V(w, 2) + '}') + ' = ' + V(C * 1e6, 1, '\u00b5F'), saidaId: 'cfppage-out-c', esperado: [fix(C * 1e6, 1)] });
      return out;
    },
    observacoes: [
      'Tri\u00e2ngulo de pot\u00eancias: S\u00b2 = P\u00b2 + Q\u00b2 e fp = P/S. Com a mesma P, menor fp significa maior S e maior corrente na rede.',
      'Corrigir o fp reduz a corrente, a queda de tens\u00e3o e as perdas I\u00b2R nos cabos e no transformador. A energia ativa (kWh) n\u00e3o diminui.',
      'Corrigir demais deixa a instala\u00e7\u00e3o capacitiva. Em redes com muitos conversores, capacitores podem entrar em resson\u00e2ncia com harm\u00f4nicas; isso pede an\u00e1lise.',
      'O limite m\u00ednimo de fp cobrado pela concession\u00e1ria (por exemplo 0,92) \u00e9 a confirmar na regulamenta\u00e7\u00e3o vigente e no contrato.',
      'A pot\u00eancia ativa P n\u00e3o muda com o capacitor; s\u00f3 o reativo cai de Q\u2081 para Q\u2082, reduzindo S e a corrente.',
      'Trif\u00e1sico: V \u00e9 a tens\u00e3o de linha e o c\u00e1lculo assume banco de capacitores em delta (Q_c dividido em 3 e cada capacitor sob V de linha). Em estrela, o valor por fase seria 3 vezes maior.',
      'Se o fp desejado for menor que o atual, Q_c fica negativo (n\u00e3o h\u00e1 o que compensar); a calculadora n\u00e3o limita esse valor.',
      'O fp desejado deve estar em (0; 1]. Valores como 1,00 pedem compensa\u00e7\u00e3o total e podem causar sobrecompensa na pr\u00e1tica.',
      'Erro comum: informar P em W quando o campo \u00e9 kW, ou usar tens\u00e3o de fase no c\u00e1lculo trif\u00e1sico.'
    ]
  });

  /* ====================== Calculadora: imped\u00e2ncia ====================== */
  reg({
    id: 'elet-impedancia', titulo: 'Calculadora de imped\u00e2ncia Z = a + jb',
    proposito: 'Obt\u00e9m Z em forma retangular e polar, o fp e a natureza da carga, a partir de R, L, C, forma polar ou duas imped\u00e2ncias.',
    tex: '\\begin{aligned} Z &= a + jb,\\quad |Z| = \\sqrt{a^2+b^2},\\quad \\theta = \\operatorname{atan2}(b,\\,a) \\\\ \\text{RLC:}\\ \\ a &= R,\\ \\ b = \\omega L - \\dfrac{1}{\\omega C} \\\\ \\text{s\u00e9rie:}\\ \\ Z &= Z_1 + Z_2 \\qquad \\text{paralelo:}\\ \\ Z = \\dfrac{Z_1Z_2}{Z_1+Z_2} \\\\ \\mathrm{fp} &= \\cos\\theta \\end{aligned}',
    variaveis: [
      { simbolo: 'op', tex: '\\text{opera\u00e7\u00e3o}', nome: 'opera\u00e7\u00e3o escolhida (RLC, RL, RC, a+jb, polar, s\u00e9rie, paralelo)', unidade: '', inputId: 'imp-op' },
      { simbolo: 'R', tex: 'R', nome: 'resist\u00eancia (RLC)', unidade: '\u03a9', inputId: 'imp-R' },
      { simbolo: 'L', tex: 'L', nome: 'indut\u00e2ncia (RLC, entrada em mH)', unidade: 'mH', inputId: 'imp-L' },
      { simbolo: 'C', tex: 'C', nome: 'capacit\u00e2ncia (RLC, entrada em \u00b5F)', unidade: '\u00b5F', inputId: 'imp-C' },
      { simbolo: 'f', tex: 'f', nome: 'frequ\u00eancia (RLC)', unidade: 'Hz', inputId: 'imp-f' },
      { simbolo: 'Rrl', tex: 'R', nome: 'resist\u00eancia (RL)', unidade: '\u03a9', inputId: 'imp-Rrl' },
      { simbolo: 'XL', tex: 'X_L', nome: 'reat\u00e2ncia indutiva (RL)', unidade: '\u03a9', inputId: 'imp-XL' },
      { simbolo: 'Rrc', tex: 'R', nome: 'resist\u00eancia (RC)', unidade: '\u03a9', inputId: 'imp-Rrc' },
      { simbolo: 'XC', tex: 'X_C', nome: 'reat\u00e2ncia capacitiva (RC; usa-se \u2212|X_C|)', unidade: '\u03a9', inputId: 'imp-XC' },
      { simbolo: 'a', tex: 'a', nome: 'parte real (a+jb)', unidade: '\u03a9', inputId: 'imp-a' },
      { simbolo: 'b', tex: 'b', nome: 'parte imagin\u00e1ria (a+jb)', unidade: '\u03a9', inputId: 'imp-b' },
      { simbolo: 'm', tex: '|Z|', nome: 'm\u00f3dulo (polar)', unidade: '\u03a9', inputId: 'imp-mod' },
      { simbolo: 'ang', tex: '\\theta', nome: '\u00e2ngulo (polar)', unidade: '\u00b0', inputId: 'imp-ang' },
      { simbolo: 'z1r', tex: 'a_1', nome: 'parte real de Z\u2081 (s\u00e9rie/paralelo)', unidade: '\u03a9', inputId: 'imp-z1r' },
      { simbolo: 'z1i', tex: 'b_1', nome: 'parte imagin\u00e1ria de Z\u2081', unidade: '\u03a9', inputId: 'imp-z1i' },
      { simbolo: 'z2r', tex: 'a_2', nome: 'parte real de Z\u2082', unidade: '\u03a9', inputId: 'imp-z2r' },
      { simbolo: 'z2i', tex: 'b_2', nome: 'parte imagin\u00e1ria de Z\u2082', unidade: '\u03a9', inputId: 'imp-z2i' },
      { simbolo: 'fp', tex: '\\mathrm{fp}', nome: 'fator de pot\u00eancia', unidade: '', saidaId: 'imp-res-fp' }
    ],
    ouvir: ['imp-op'],
    ler: function () {
      var o = {}; var ids = { R: 'imp-R', L: 'imp-L', C: 'imp-C', f: 'imp-f', Rrl: 'imp-Rrl', XL: 'imp-XL', Rrc: 'imp-Rrc', XC: 'imp-XC', a: 'imp-a', b: 'imp-b', m: 'imp-mod', ang: 'imp-ang', z1r: 'imp-z1r', z1i: 'imp-z1i', z2r: 'imp-z2r', z2i: 'imp-z2i' };
      Object.keys(ids).forEach(function (k) { var e = document.getElementById(ids[k]); o[k] = e ? +e.value : NaN; });
      var s = document.getElementById('imp-op'); o.op = s ? s.value : 'ret-rlc';
      return o;
    },
    passos: function (v) {
      var out = [], a = 0, b = 0;
      if (v.op === 'ret-rlc') {
        var L = v.L / 1000, Cv = v.C * 1e-6, w = 2 * PI * v.f, xl = w * L, xc = 1 / (w * (Cv || 1e-12)); a = v.R; b = w * L - 1 / (w * (Cv || 1e-12));
        out.push({ rotulo: 'RLC s\u00e9rie: unidades e \u03c9', tex: 'L = ' + G(L, 'H'), },
          { tex: 'C = ' + G(Cv, 'F') + ',\\quad \\omega = 2\\pi\\cdot ' + G(v.f) + ' = ' + V(w, 2, W_UN) },
          { rotulo: 'Partes real e imagin\u00e1ria', tex: 'a = R = ' + G(a, '\u03a9') + ',\\quad b = \\omega L - \\dfrac{1}{\\omega C} = ' + V(xl, 3) + ' - ' + par(V(xc, 3)) + ' = ' + V(b, 3, '\u03a9') });
      } else if (v.op === 'ret-rl') {
        a = v.Rrl; b = v.XL; out.push({ rotulo: 'RL: valores informados', tex: 'a = R = ' + G(a, '\u03a9') + ',\\quad b = X_L = ' + G(b, '\u03a9') });
      } else if (v.op === 'ret-rc') {
        a = v.Rrc; b = -Math.abs(v.XC); out.push({ rotulo: 'RC: a reat\u00e2ncia entra como \u2212|X_C|', tex: 'a = R = ' + G(a, '\u03a9') + ',\\quad b = -|X_C| = -|' + G(v.XC) + '| = ' + G(b, '\u03a9') });
      } else if (v.op === 'ret-ab') {
        a = v.a; b = v.b; out.push({ rotulo: 'Forma retangular informada', tex: 'Z = ' + cx(a, b, 3) + '\\,\\Omega' });
      } else if (v.op === 'pol') {
        var ag = v.ang * PI / 180; a = v.m * Math.cos(ag); b = v.m * Math.sin(ag);
        out.push({ rotulo: 'Polar para retangular', tex: 'a = ' + G(v.m) + '\\cos(' + G(v.ang, '\u00b0') + ') = ' + V(a, 3, '\u03a9') + ',\\quad b = ' + G(v.m) + '\\sin(' + G(v.ang, '\u00b0') + ') = ' + V(b, 3, '\u03a9') });
      } else if (v.op === 'serie') {
        a = v.z1r + v.z2r; b = v.z1i + v.z2i;
        out.push({ rotulo: 'S\u00e9rie: soma complexa', tex: 'a = ' + G(v.z1r) + ' + ' + par(G(v.z2r)) + ' = ' + V(a, 3, '\u03a9') + ',\\quad b = ' + G(v.z1i) + ' + ' + par(G(v.z2i)) + ' = ' + V(b, 3, '\u03a9') });
      } else {
        var dR = v.z1r + v.z2r, dI = v.z1i + v.z2i, d2 = dR * dR + dI * dI || 1, nR = v.z1r * v.z2r - v.z1i * v.z2i, nI = v.z1r * v.z2i + v.z1i * v.z2r;
        a = (nR * dR + nI * dI) / d2; b = (nI * dR - nR * dI) / d2;
        out.push({ rotulo: 'Paralelo: produto e soma', tex: 'Z_1Z_2 = ' + cx(nR, nI, 3) + ',\\quad Z_1 + Z_2 = ' + cx(dR, dI, 3) },
          { rotulo: 'Divis\u00e3o complexa', tex: 'Z = \\dfrac{Z_1Z_2\\,\\overline{(Z_1+Z_2)}}{|Z_1+Z_2|^2},\\quad |Z_1+Z_2|^2 = ' + V(d2, 3) + ' \\Rightarrow Z = ' + cx(a, b, 3) + '\\,\\Omega' });
      }
      var mod = Math.sqrt(a * a + b * b), ang = Math.atan2(b, a) * 180 / PI, fp = Math.cos(ang * PI / 180);
      var tipo = b > .01 ? 'Indutivo' : b < -.01 ? 'Capacitivo' : 'Resistivo puro';
      out.push({ rotulo: 'Parte real', tex: 'a = ' + V(a, 3, '\u03a9'), saidaId: 'imp-res-a', esperado: [fix(a, 3)] });
      out.push({ rotulo: 'Parte imagin\u00e1ria', tex: 'b = ' + V(b, 3, '\u03a9'), saidaId: 'imp-res-b', esperado: [fix(b, 3)] });
      out.push({ rotulo: 'M\u00f3dulo', tex: '|Z| = \\sqrt{' + sq(V(a, 3)) + ' + ' + sq(V(b, 3)) + '} = ' + V(mod, 3, '\u03a9'), saidaId: 'imp-res-mod', esperado: [fix(mod, 3)] });
      out.push({ rotulo: '\u00c2ngulo', tex: '\\theta = ' + A2(b, a, 3) + ' = ' + V(ang, 2, '\u00b0'), saidaId: 'imp-res-ang', esperado: [fix(ang, 2)] });
      out.push({ rotulo: 'Fator de pot\u00eancia', tex: '\\mathrm{fp} = \\cos(' + V(ang, 2, '\u00b0') + ') = ' + V(fp, 4), saidaId: 'imp-res-fp', esperado: [fix(fp, 4)] });
      out.push({ rotulo: 'Natureza (limiar de \u00b10,01 \u03a9 em b)', texto: tipo, saidaId: 'imp-res-tipo', esperadoTexto: tipo });
      return out;
    },
    observacoes: [
      'Confira as unidades: L em mH e C em \u00b5F. Mudar a frequ\u00eancia muda X_L e X_C em sentidos opostos.',
      'Imped\u00e2ncia complexa guarda juntas a oposi\u00e7\u00e3o \u00e0 corrente (m\u00f3dulo) e a defasagem tens\u00e3o\u2013corrente (\u00e2ngulo).',
      'b > 0: indutivo (corrente atrasada); b < 0: capacitivo (corrente adiantada); b \u2248 0: resistivo.',
      'O fp aqui \u00e9 cos \u03b8 do \u00e2ngulo da imped\u00e2ncia e \u00e9 sempre positivo, mesmo para carga capacitiva; o sinal da reat\u00e2ncia mostra se \u00e9 indutivo ou capacitivo.',
      'No modo RLC, se C = 0 a calculadora usa 10\u207b\u00b9\u00b2 F para n\u00e3o dividir por zero, o que resulta em reat\u00e2ncia capacitiva enorme.',
      'Erro comum: no modo RC, digitar X_C negativo; a calculadora usa \u2212|X_C|, ent\u00e3o o sinal digitado n\u00e3o importa.',
      'Paralelo e s\u00e9rie usam os mesmos campos Z\u2081 e Z\u2082 da calculadora.'
    ]
  });

  /* ====================== Calculadora: tri\u00e2ngulo de pot\u00eancias ====================== */
  reg({
    id: 'elet-potencia', titulo: 'Tri\u00e2ngulo de pot\u00eancias',
    proposito: 'Relaciona pot\u00eancia ativa (P), reativa (Q) e aparente (S) com o fator de pot\u00eancia.',
    tex: '\\begin{aligned} S &= \\sqrt{P^2 + Q^2} \\qquad \\mathrm{fp} = \\dfrac{P}{S} \\\\ P &= S\\,\\mathrm{fp} \\qquad Q = S\\sqrt{1 - \\mathrm{fp}^2} \\\\ \\varphi &= \\arccos(\\mathrm{fp}) \\end{aligned}',
    variaveis: [
      { simbolo: 'P', tex: 'P', nome: 'pot\u00eancia ativa', unidade: 'W', inputId: 'pot-p', saidaId: 'pot-res-p' },
      { simbolo: 'Q', tex: 'Q', nome: 'pot\u00eancia reativa', unidade: 'VAr', inputId: 'pot-q', saidaId: 'pot-res-q' },
      { simbolo: 'S', tex: 'S', nome: 'pot\u00eancia aparente', unidade: 'VA', inputId: 'pot-s', saidaId: 'pot-res-s' },
      { simbolo: 'fp', tex: '\\mathrm{fp}', nome: 'fator de pot\u00eancia', unidade: '', inputId: 'pot-fp', saidaId: 'pot-res-fp' },
      { simbolo: 'phi', tex: '\\varphi', nome: '\u00e2ngulo do tri\u00e2ngulo', unidade: '\u00b0', saidaId: 'pot-res-phi' }
    ],
    ouvir: [],
    ler: function (ctx) {
      var o = {}; [['P', 'pot-p'], ['Q', 'pot-q'], ['S', 'pot-s'], ['fp', 'pot-fp']].forEach(function (p) { var e = document.getElementById(p[1]); o[p[0]] = e ? +e.value : NaN; });
      o.modo = (ctx && (ctx.ultimo === 'pot-s' || ctx.ultimo === 'pot-fp')) ? 'sfp' : 'pq';
      return o;
    },
    passos: function (v) {
      var out = [], P = v.P, Q = v.Q, S = v.S, fp = v.fp;
      if (v.modo === 'pq') {
        S = Math.sqrt(P * P + Q * Q); fp = S ? P / S : 0;
        out.push({ rotulo: 'Entradas P e Q: aparente e fp', tex: 'S = \\sqrt{' + sq(G(P)) + ' + ' + sq(G(Q)) + '} = ' + V(S, 0, 'VA') + ',\\quad \\mathrm{fp} = \\dfrac{P}{S} = ' + V(fp, 4) });
      } else {
        P = S * fp; Q = S * Math.sqrt(Math.max(0, 1 - fp * fp));
        out.push({ rotulo: 'Entradas S e fp: ativa e reativa', tex: 'P = S\\,\\mathrm{fp} = ' + G(S) + '\\cdot ' + G(fp) + ' = ' + V(P, 0, 'W') + ',\\quad Q = S\\sqrt{1 - \\mathrm{fp}^2} = ' + V(Q, 0, 'VAr') });
      }
      var phi = Math.acos(Math.min(Math.max(fp, 0), 1)) * 180 / PI, tipo = Q >= 0 ? 'Indutiva' : 'Capacitiva';
      out.push({ rotulo: 'Ativa', tex: 'P = ' + V(P, 0, 'W'), saidaId: 'pot-res-p', esperado: [fix(P, 0)] });
      out.push({ rotulo: 'Reativa', tex: 'Q = ' + V(Q, 0, 'VAr'), saidaId: 'pot-res-q', esperado: [fix(Q, 0)] });
      out.push({ rotulo: 'Aparente', tex: 'S = ' + V(S, 0, 'VA'), saidaId: 'pot-res-s', esperado: [fix(S, 0)] });
      out.push({ rotulo: 'Fator de pot\u00eancia', tex: '\\mathrm{fp} = ' + V(fp, 4), saidaId: 'pot-res-fp', esperado: [fix(fp, 4)] });
      out.push({ rotulo: '\u00c2ngulo (fp limitado a [0; 1])', tex: '\\varphi = \\arccos(' + V(fp, 4) + ') = ' + V(phi, 1, '\u00b0'), saidaId: 'pot-res-phi', esperado: [fix(phi, 1)] });
      out.push({ rotulo: 'Natureza', texto: tipo, saidaId: 'pot-res-tipo', esperadoTexto: tipo });
      return out;
    },
    observacoes: [
      'P \u00e9 o trabalho \u00fatil (kW), Q alimenta campos magn\u00e9ticos ou el\u00e9tricos (kvar) e S \u00e9 o que a rede precisa fornecer (kVA). O fp mede a fra\u00e7\u00e3o \u00fatil.',
      'P \u00e9 a pot\u00eancia que realiza trabalho (W); Q troca energia com campos magn\u00e9ticos/el\u00e9tricos (VAr); S dimensiona cabos e transformadores (VA).',
      'Os tr\u00eas formam um tri\u00e2ngulo retangulo: S \u00e9 a hipotenusa. Por isso S \u2260 P + Q.',
      'fp baixo significa muita corrente para pouca pot\u00eancia \u00fatil. O mesmo P com fp menor exige mais S e mais corrente.',
      'Nesta calculadora, ao editar S ou fp, Q \u00e9 sempre \u2265 0 (indutiva); a carga capacitiva s\u00f3 aparece digitando Q negativo.',
      'A natureza (indutiva/capacitiva) depende do sinal de Q; o fp, sozinho, n\u00e3o informa isso.'
    ]
  });

  /* ====================== Calculadora: corre\u00e7\u00e3o de FP (monof\u00e1sica) ====================== */
  reg({
    id: 'elet-cfp', titulo: 'Corre\u00e7\u00e3o de FP por tangente (calculadora r\u00e1pida)',
    proposito: 'Estima o reativo antes e depois da corre\u00e7\u00e3o e o capacitor monof\u00e1sico equivalente a partir de P e dos dois fp.',
    tex: '\\begin{aligned} Q_i &= P\\tan(\\arccos \\mathrm{fp}_i) \\\\ Q_c &= Q_1 - Q_2 \\\\ C &= \\dfrac{Q_c}{2\\pi f\\,V^2} \\end{aligned}',
    variaveis: [
      { simbolo: 'P', tex: 'P', nome: 'pot\u00eancia ativa', unidade: 'kW', inputId: 'cfp-p' },
      { simbolo: 'fp1', tex: '\\mathrm{fp}_1', nome: 'fator de pot\u00eancia atual', unidade: '', inputId: 'cfp-fp1' },
      { simbolo: 'fp2', tex: '\\mathrm{fp}_2', nome: 'fator de pot\u00eancia desejado', unidade: '', inputId: 'cfp-fp2' },
      { simbolo: 'V', tex: 'V', nome: 'tens\u00e3o', unidade: 'V', inputId: 'cfp-v' },
      { simbolo: 'f', tex: 'f', nome: 'frequ\u00eancia', unidade: 'Hz', inputId: 'cfp-f' },
      { simbolo: 'Q1', tex: 'Q_1', nome: 'reativa antes', unidade: 'kVAr', saidaId: 'cfp-q1' },
      { simbolo: 'Q2', tex: 'Q_2', nome: 'reativa depois', unidade: 'kVAr', saidaId: 'cfp-q2' },
      { simbolo: 'Qc', tex: 'Q_c', nome: 'reativo do capacitor', unidade: 'kVAr', saidaId: 'cfp-qc' },
      { simbolo: 'C', tex: 'C', nome: 'capacit\u00e2ncia', unidade: '\u00b5F', saidaId: 'cfp-c' }
    ],
    passos: function (v) {
      var P = v.P * 1000;
      if (!P || !v.fp1 || !v.fp2 || !v.V || !v.f) return [{ texto: 'Preencha todos os campos (diferentes de zero) para ver o c\u00e1lculo.' }];
      var phi1 = Math.acos(Math.min(v.fp1, 1)), phi2 = Math.acos(Math.min(v.fp2, 1)), Q1 = P * Math.tan(phi1), Q2 = P * Math.tan(phi2), Qc = Q1 - Q2, C = Qc / (2 * PI * v.f * v.V * v.V);
      return [
        { rotulo: 'Pot\u00eancia em watts', tex: 'P = ' + G(v.P, 'kW') + ' = ' + G(P, 'W') },
        { rotulo: '\u00c2ngulos', tex: '\\varphi_1 = \\arccos(' + G(v.fp1) + ') = ' + V(phi1 * DEG, 2, '\u00b0') + ',\\quad \\varphi_2 = \\arccos(' + G(v.fp2) + ') = ' + V(phi2 * DEG, 2, '\u00b0') },
        { rotulo: 'Reativa antes', tex: 'Q_1 = P\\tan\\varphi_1 = ' + V(Q1 / 1000, 2, 'kVAr'), saidaId: 'cfp-q1', esperado: [fix(Q1 / 1000, 2)] },
        { rotulo: 'Reativa depois', tex: 'Q_2 = P\\tan\\varphi_2 = ' + V(Q2 / 1000, 2, 'kVAr'), saidaId: 'cfp-q2', esperado: [fix(Q2 / 1000, 2)] },
        { rotulo: 'Reativo a compensar', tex: 'Q_c = Q_1 - Q_2 = ' + V(Q1 / 1000, 2) + ' - ' + par(V(Q2 / 1000, 2)) + ' = ' + V(Qc / 1000, 2, 'kVAr'), saidaId: 'cfp-qc', esperado: [fix(Qc / 1000, 2)] },
        { rotulo: 'Capacitor', tex: 'C = \\dfrac{' + G(Qc) + '}{2\\pi\\cdot ' + G(v.f) + '\\cdot ' + sq(G(v.V)) + '} = ' + V(C * 1e6, 1, '\u00b5F'), saidaId: 'cfp-c', esperado: [fix(C * 1e6, 1)] }
      ];
    },
    observacoes: [
      'Q do capacitor = P\u00b7(tg\u03c6\u2081 \u2212 tg\u03c6\u2082). Quanto mais alto o fp inicial, menor o banco necess\u00e1rio. N\u00e3o existe fp acima de 1.',
      'P \u00e9 mantida; s\u00f3 o \u00e2ngulo muda. A tangente liga P \u00e0 reativa: Q = P\u00b7tan \u03c6.',
      'C = Q_c/(2\u03c0 f V\u00b2) vale para um capacitor \u00fanico monof\u00e1sico sob a tens\u00e3o V. Para trif\u00e1sico use a p\u00e1gina de corre\u00e7\u00e3o do fator de pot\u00eancia.',
      'fp acima de 1 \u00e9 tratado como 1 (\u00e2ngulo 0).',
      'Erro comum: informar P em W (o campo \u00e9 kW) ou fp em percentual (usar 0,92, n\u00e3o 92).'
    ]
  });

  /* ====================== Convers\u00f5es polar \u2194 retangular ====================== */
  reg({
    id: 'elet-conv-pr', titulo: 'Convers\u00e3o polar \u2192 retangular',
    proposito: 'Transforma m\u00f3dulo e \u00e2ngulo em parte real e imagin\u00e1ria.',
    tex: 'a = m\\cos\\theta \\qquad b = m\\sin\\theta \\qquad (\\theta\\ \\text{em graus na entrada, convertido para rad})',
    variaveis: [
      { simbolo: 'm', tex: 'm', nome: 'm\u00f3dulo', unidade: '', inputId: 'conv-mod' },
      { simbolo: 'ang', tex: '\\theta', nome: '\u00e2ngulo', unidade: '\u00b0', inputId: 'conv-ang' },
      { simbolo: 'res', tex: 'a + jb', nome: 'resultado retangular', unidade: '', saidaId: 'conv-result' }
    ],
    ouvir: [],
    passos: function (v) {
      var a = v.ang * PI / 180, re = v.m * Math.cos(a), im = v.m * Math.sin(a);
      return [
        { rotulo: '\u00c2ngulo em radianos', tex: '\\theta = ' + G(v.ang, '\u00b0') + '\\cdot\\dfrac{\\pi}{180} = ' + V(a, 4, 'rad') },
        { rotulo: 'Resultado', tex: 'a = ' + G(v.m) + '\\cos\\theta = ' + V(re, 4) + ',\\quad b = ' + G(v.m) + '\\sin\\theta = ' + V(im, 4) + ' \\;\\Rightarrow\\; ' + cx(re, im, 4), saidaId: 'conv-result', esperado: [fix(re, 4), fix(im, 4)] }
      ];
    },
    observacoes: [
      '\u00datil para passar de m\u00f3dulo e \u00e2ngulo (polar) para parte real e imagin\u00e1ria (retangular), o formato usado para somar imped\u00e2ncias.',
      'cos d\u00e1 a proje\u00e7\u00e3o no eixo real e sen no eixo imagin\u00e1rio.',
      'Erro comum: aplicar cos/sen com o \u00e2ngulo em graus; as fun\u00e7\u00f5es trigonom\u00e9tricas pedem radianos.'
    ]
  });
  reg({
    id: 'elet-conv-rp', titulo: 'Convers\u00e3o retangular \u2192 polar',
    proposito: 'Transforma parte real e imagin\u00e1ria em m\u00f3dulo e \u00e2ngulo.',
    tex: 'm = \\sqrt{a^2 + b^2} \\qquad \\theta = \\operatorname{atan2}(b,\\,a)\\cdot\\dfrac{180}{\\pi}',
    variaveis: [
      { simbolo: 'a', tex: 'a', nome: 'parte real', unidade: '', inputId: 'conv-re' },
      { simbolo: 'b', tex: 'b', nome: 'parte imagin\u00e1ria', unidade: '', inputId: 'conv-im' },
      { simbolo: 'res', tex: 'm\\angle\\theta', nome: 'resultado polar', unidade: '', saidaId: 'conv-result' }
    ],
    ouvir: [],
    passos: function (v) {
      var m = Math.sqrt(v.a * v.a + v.b * v.b), th = Math.atan2(v.b, v.a) * 180 / PI;
      return [
        { rotulo: 'M\u00f3dulo', tex: 'm = \\sqrt{' + sq(G(v.a)) + ' + ' + sq(G(v.b)) + '} = ' + V(m, 4) },
        { rotulo: 'Resultado', tex: '\\theta = ' + A2(v.b, v.a, 2) + ' = ' + V(th, 2, '\u00b0') + ' \\;\\Rightarrow\\; ' + pol(m, th, 4, 2), saidaId: 'conv-result', esperado: [fix(m, 4), fix(th, 2)] }
      ];
    },
    observacoes: [
      'O \u00e2ngulo usa atan2, que respeita o quadrante. Um arctan simples erra o \u00e2ngulo quando a parte real \u00e9 negativa.',
      'atan2(b, a) devolve o \u00e2ngulo no quadrante correto (de \u2212180\u00b0 a 180\u00b0); arctan(b/a) sozinho confunde o 1\u00ba com o 3\u00ba quadrante e o 2\u00ba com o 4\u00ba.',
      'O \u00e2ngulo sai em graus, com 2 casas decimais.'
    ]
  });

  /* ====================== Convers\u00f5es de unidades ====================== */
  reg({
    id: 'elet-conv-unidades', titulo: 'Convers\u00e3o de unidades (frequ\u00eancia, indut\u00e2ncia, capacit\u00e2ncia)',
    proposito: 'Rela\u00e7\u00f5es usadas pela calculadora para converter Hz, kHz, rad/s, rpm, H/mH/\u00b5H e \u00b5F/nF/pF.',
    tex: '\\begin{aligned} f_{kHz} &= \\dfrac{f}{10^3} \\qquad \\omega = 2\\pi f \\qquad n_{rpm} = 60\\,f \\\\ L_{mH} &= 10^3 L_H \\qquad L_{\\mu H} = 10^6 L_H \\\\ C_{nF} &= 10^3 C_{\\mu F} \\qquad C_{pF} = 10^6 C_{\\mu F} \\end{aligned}',
    variaveis: [
      { simbolo: 'hz', tex: 'f', nome: 'frequ\u00eancia (campo Hz)', unidade: 'Hz', inputId: 'u-hz' },
      { simbolo: 'h', tex: 'L_H', nome: 'indut\u00e2ncia (campo H)', unidade: 'H', inputId: 'u-h' },
      { simbolo: 'uf', tex: 'C_{\\mu F}', nome: 'capacit\u00e2ncia (campo \u00b5F)', unidade: '\u00b5F', inputId: 'u-uf' }
    ],
    ouvir: ['u-khz', 'u-rads', 'u-rpm', 'u-mh', 'u-uh', 'u-nf', 'u-pf'],
    passos: function (v) {
      return [
        { rotulo: 'kHz', tex: 'f_{kHz} = \\dfrac{' + G(v.hz) + '}{1000} = ' + G(v.hz / 1e3, 'kHz'), saidaId: 'u-khz', esperado: [fix(v.hz / 1e3, 9)] },
        { rotulo: 'rad/s', tex: '\\omega = 2\\pi\\cdot ' + G(v.hz) + ' = ' + V(v.hz * 2 * PI, 4, W_UN), saidaId: 'u-rads', esperado: [fix(v.hz * 2 * PI, 4)] },
        { rotulo: 'rpm (rota\u00e7\u00f5es por minuto de um ciclo por segundo)', tex: 'n = 60\\cdot ' + G(v.hz) + ' = ' + V(v.hz * 60, 4, 'rpm'), saidaId: 'u-rpm', esperado: [fix(v.hz * 60, 4)] },
        { rotulo: 'Indut\u00e2ncia', tex: 'L_{mH} = ' + G(v.h) + '\\cdot 10^3 = ' + G(v.h * 1e3, 'mH') + ',\\quad L_{\\mu H} = ' + G(v.h) + '\\cdot 10^6 = ' + G(v.h * 1e6, '\u00b5H'), saidaId: 'u-mh', esperado: [String(v.h * 1e3)] },
        { rotulo: 'Capacit\u00e2ncia', tex: 'C = ' + G(v.uf * 1e-6, 'F') + ',\\quad C_{nF} = ' + G(v.uf) + '\\cdot 10^3 = ' + G(v.uf * 1e-6 * 1e9, 'nF'), saidaId: 'u-nf', esperado: [String(v.uf * 1e-6 * 1e9)] }
      ];
    },
    observacoes: [
      'Erros de unidade s\u00e3o a causa n\u00ba 1 de resultado errado: confira Hz, kHz e rad/s (\u03c9 = 2\u03c0f), mH, \u00b5H, \u00b5F, nF e pF.',
      'A rela\u00e7\u00e3o rpm = 60\u00b7f apenas converte unidade de tempo (ciclos por segundo para por minuto). N\u00e3o \u00e9 a velocidade de um motor: ela depende do n\u00famero de polos e do escorregamento.',
      '\u03c9 = 2\u03c0f \u00e9 a frequ\u00eancia angular em rad/s; f \u00e9 em ciclos por segundo (Hz). N\u00e3o confunda os dois nas f\u00f3rmulas de reat\u00e2ncia.',
      'Os valores exibidos nos campos convertidos t\u00eam a quantidade de casas que a calculadora usa (ex.: 9 casas em kHz).'
    ]
  });

  /* ====================== Resson\u00e2ncia (calculadora) ====================== */
  reg({
    id: 'elet-res', titulo: 'Resson\u00e2ncia s\u00e9rie e largura de banda',
    proposito: 'Calcula f\u2080, \u03c9\u2080, Q, largura de banda e as frequ\u00eancias de meia pot\u00eancia de um RLC s\u00e9rie. Mostra a frequ\u00eancia em que X_L = X_C e qu\u00e3o estreita \u00e9 a resson\u00e2ncia.',
    tex: '\\begin{aligned} f_0 &= \\dfrac{1}{2\\pi\\sqrt{LC}} \\qquad \\omega_0 = 2\\pi f_0 \\\\ Q &= \\dfrac{\\omega_0 L}{R} \\qquad BW = \\dfrac{f_0}{Q} \\\\ f_1 &= f_0 - \\dfrac{BW}{2} \\qquad f_2 = f_0 + \\dfrac{BW}{2} \\end{aligned}',
    variaveis: [
      { simbolo: 'R', tex: 'R', nome: 'resist\u00eancia', unidade: '\u03a9', inputId: 'res-r' },
      { simbolo: 'L', tex: 'L', nome: 'indut\u00e2ncia (entrada em mH)', unidade: 'mH', inputId: 'res-l' },
      { simbolo: 'C', tex: 'C', nome: 'capacit\u00e2ncia (entrada em \u00b5F)', unidade: '\u00b5F', inputId: 'res-c' },
      { simbolo: 'f0', tex: 'f_0', nome: 'frequ\u00eancia de resson\u00e2ncia', unidade: 'Hz', saidaId: 'res-f0' },
      { simbolo: 'w0', tex: '\\omega_0', nome: 'frequ\u00eancia angular de resson\u00e2ncia', unidade: 'rad/s', saidaId: 'res-w0' },
      { simbolo: 'Q', tex: 'Q', nome: 'fator de qualidade', unidade: '', saidaId: 'res-q' },
      { simbolo: 'BW', tex: 'BW', nome: 'largura de banda', unidade: 'Hz', saidaId: 'res-bw' },
      { simbolo: 'f1', tex: 'f_1', nome: 'frequ\u00eancia inferior', unidade: 'Hz', saidaId: 'res-f1' },
      { simbolo: 'f2', tex: 'f_2', nome: 'frequ\u00eancia superior', unidade: 'Hz', saidaId: 'res-f2' }
    ],
    passos: function (v) {
      var L = v.L / 1e3, C = v.C * 1e-6, f0 = 1 / (2 * PI * Math.sqrt(L * C)), w0 = 2 * PI * f0, Q = w0 * L / v.R, bw = f0 / Q;
      return [
        { rotulo: 'Convers\u00e3o de unidades', tex: 'L = ' + G(L, 'H') + ',\\quad C = ' + G(C, 'F') },
        { rotulo: 'Frequ\u00eancia de resson\u00e2ncia', tex: 'f_0 = \\dfrac{1}{2\\pi\\sqrt{' + G(L) + '\\cdot ' + G(C) + '}} = ' + V(f0, 2, 'Hz'), saidaId: 'res-f0', esperado: [fix(f0, 2)] },
        { rotulo: 'Frequ\u00eancia angular', tex: '\\omega_0 = 2\\pi\\cdot ' + V(f0, 2) + ' = ' + V(w0, 2, W_UN), saidaId: 'res-w0', esperado: [fix(w0, 2)] },
        { rotulo: 'Fator de qualidade', tex: 'Q = \\dfrac{' + V(w0, 2) + '\\cdot ' + G(L) + '}{' + G(v.R) + '} = ' + V(Q, 3), saidaId: 'res-q', esperado: [fix(Q, 3)] },
        { rotulo: 'Largura de banda', tex: 'BW = \\dfrac{' + V(f0, 2) + '}{' + V(Q, 3) + '} = ' + V(bw, 2, 'Hz'), saidaId: 'res-bw', esperado: [fix(bw, 2)] },
        { rotulo: 'Frequ\u00eancia inferior', tex: 'f_1 = ' + V(f0, 2) + ' - \\dfrac{' + V(bw, 2) + '}{2} = ' + V(f0 - bw / 2, 2, 'Hz'), saidaId: 'res-f1', esperado: [fix(f0 - bw / 2, 2)] },
        { rotulo: 'Frequ\u00eancia superior', tex: 'f_2 = ' + V(f0, 2) + ' + \\dfrac{' + V(bw, 2) + '}{2} = ' + V(f0 + bw / 2, 2, 'Hz'), saidaId: 'res-f2', esperado: [fix(f0 + bw / 2, 2)] }
      ];
    },
    observacoes: [
      'A largura de banda \u00e9 estreita quando R \u00e9 pequeno em rela\u00e7\u00e3o a X_L (fator de qualidade alto). Em resson\u00e2ncia a corrente \u00e9 limitada s\u00f3 por R.',
      'Q alto: banda estreita e seletiva. Q baixo: banda larga. Aumentar R reduz Q e alarga a banda.',
      'f\u2081 e f\u2082 s\u00e3o simplesmente f\u2080 \u00b1 BW/2 (aproxima\u00e7\u00e3o sim\u00e9trica); para Q baixo os pontos reais de meia pot\u00eancia n\u00e3o s\u00e3o sim\u00e9tricos em torno de f\u2080.',
      'Erro comum: esquecer que L entra em mH e C em \u00b5F; a calculadora converte para H e F antes da conta.'
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
