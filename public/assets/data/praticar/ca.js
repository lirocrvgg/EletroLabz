/* data/praticar/ca.js - conteudo do topico "Corrente alternada" (Praticar). Conferido por tests/praticar/conteudo.test.js. */
(function (root) {
  var EO = root.EO = root.EO || {}; var P = EO.praticar = EO.praticar || {};
  var t = {
    "id": "ca",
    "versao": 1,
    "ordem": 3,
    "titulo": "Corrente alternada",
    "tituloCurto": "Corrente alternada",
    "resumo": "Indutor e capacitor, reatância, impedância RL, RC e RLC, ressonância, fasores e potências.",
    "modulo": "elet",
    "ver": [
      {
        "href": "elet.html#rl",
        "rotulo": "Circuito RL"
      },
      {
        "href": "elet.html#rc",
        "rotulo": "Circuito RC"
      },
      {
        "href": "elet.html#rlc",
        "rotulo": "Circuito RLC"
      },
      {
        "href": "elet.html#fasores",
        "rotulo": "Fasores"
      },
      {
        "href": "elet.html#complexos",
        "rotulo": "Números complexos"
      }
    ],
    "cards": [
      {
        "id": "ca-c-001",
        "frente": "Onde o indutor guarda energia e quanto?",
        "verso": "No campo magnético da bobina: W = ½·L·I². Quanto maior a corrente, mais energia fica guardada. Com L = 0,5 H e I = 4 A, W = 4 J.",
        "nivel": 1,
        "tags": [
          "indutor"
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-002",
        "frente": "Onde o capacitor guarda energia e quanto?",
        "verso": "No campo elétrico entre as placas: W = ½·C·V². Quanto maior a tensão, mais energia. Com C = 470 µF e V = 100 V, W = 2,35 J.",
        "nivel": 1,
        "tags": [
          "capacitor"
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-003",
        "frente": "A que o indutor se opõe?",
        "verso": "O indutor se opõe à VARIAÇÃO DE CORRENTE: v = L·di/dt. Em CC estável não há tensão no indutor ideal, que age como um fio.",
        "nivel": 1,
        "tags": [
          "indutor"
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-004",
        "frente": "A que o capacitor se opõe?",
        "verso": "O capacitor se opõe à VARIAÇÃO DE TENSÃO: i = C·dv/dt. Em CC, depois de carregado, não passa corrente e ele age como circuito aberto.",
        "nivel": 1,
        "tags": [
          "capacitor"
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-005",
        "frente": "Como se calcula a reatância indutiva XL?",
        "verso": "XL = 2π·f·L, em ohms. Ela cresce com a frequência: dobrando f, XL dobra. Exemplo: 60 Hz e 0,2 H dão XL ≈ 75,4 Ω. Use L em henry (mH ÷ 1000).",
        "nivel": 1,
        "tags": [
          "xl"
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-006",
        "frente": "Como se calcula a reatância capacitiva XC?",
        "verso": "XC = 1/(2π·f·C), em ohms. Ela diminui com a frequência. Exemplo: 60 Hz e 100 µF dão XC ≈ 26,5 Ω. Use C em farad (µF × 10⁻⁶).",
        "nivel": 1,
        "tags": [
          "xc"
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-007",
        "frente": "Qual é a defasagem entre tensão e corrente no indutor e no capacitor?",
        "verso": "No indutor puro, a corrente atrasa 90° em relação à tensão. No capacitor puro, a corrente adianta 90°. Em RL e RC com resistência, o ângulo fica entre 0° e 90°.",
        "nivel": 1,
        "tags": [
          "defasagem"
        ],
        "ver": {
          "href": "elet.html#fasores",
          "rotulo": "Fasores"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-008",
        "frente": "Qual é a unidade da impedância Z?",
        "verso": "O ohm (Ω), como a resistência e as reatâncias. A impedância resume a oposição total à corrente alternada em um circuito e inclui R, XL e XC.",
        "nivel": 1,
        "tags": [
          "impedancia"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "ca-c-009",
        "frente": "Como calcular Z e φ em um circuito RL série?",
        "verso": "Z = √(R² + XL²) e φ = arctan(XL/R), com a corrente atrasada. R e XL estão a 90°, então se somam como catetos: nunca some R + XL diretamente.",
        "nivel": 2,
        "tags": [
          "rl"
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-010",
        "frente": "Como calcular Z e φ em um circuito RC série?",
        "verso": "Z = √(R² + XC²) e φ = −arctan(XC/R), de módulo arctan(XC/R), com a corrente adiantada em relação à tensão. Mesma regra: R e XC são catetos de um triângulo retângulo.",
        "nivel": 2,
        "tags": [
          "rc"
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-011",
        "frente": "Como calcular Z em um RLC série?",
        "verso": "X = XL − XC e Z = √(R² + X²). XL e XC se opõem. Se X for positivo o circuito é indutivo; se for negativo, capacitivo. O ângulo é φ = arctan(X/R).",
        "nivel": 2,
        "tags": [
          "rlc"
        ],
        "ver": {
          "href": "elet.html#rlc",
          "rotulo": "Circuito RLC"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-012",
        "frente": "Qual é a frequência de ressonância de um RLC série?",
        "verso": "f0 = 1/(2π·√(L·C)). Nela, XL = XC, X = 0 e Z = R: a corrente é máxima e está em fase com a tensão. Com 0,1 H e 100 µF, f0 ≈ 50,3 Hz.",
        "nivel": 2,
        "tags": [
          "ressonancia"
        ],
        "ver": {
          "href": "elet.html#rlc",
          "rotulo": "Circuito RLC"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-013",
        "frente": "O que é um fasor?",
        "verso": "Um fasor representa uma grandeza senoidal por módulo e ângulo (valor eficaz e fase), na frequência única do circuito. Ele permite somar tensões e correntes defasadas como vetores.",
        "nivel": 2,
        "tags": [
          "fasores"
        ],
        "ver": {
          "href": "elet.html#fasores",
          "rotulo": "Fasores"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-014",
        "frente": "Como converter entre a forma retangular e a polar?",
        "verso": "De a + jb para polar: módulo = √(a² + b²), ângulo = arctan(b/a), válido para a > 0 (se a for negativo, some 180°). De polar para retangular: a = M·cosθ e b = M·senθ. Exemplo: 3 + j4 = 5 ∠ 53,13°.",
        "nivel": 2,
        "tags": [
          "complexos"
        ],
        "ver": {
          "href": "elet.html#complexos",
          "rotulo": "Números complexos"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-015",
        "frente": "Quais são as potências ativa, reativa e aparente?",
        "verso": "P = V·I·cosφ (W, vira trabalho e calor); Q = V·I·senφ (VAr, circula entre fonte e carga); S = V·I (VA). Elas formam um triângulo: S = √(P² + Q²).",
        "nivel": 2,
        "tags": [
          "potencia"
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-016",
        "frente": "O que é o fator de potência?",
        "verso": "É a razão fp = cosφ = P/S. Com P = 800 W e S = 1000 VA, fp = 0,8. Quanto menor o fp, maior a corrente necessária para entregar a mesma potência ativa.",
        "nivel": 3,
        "tags": [
          "fp"
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-017",
        "frente": "Como saber se a carga é indutiva ou capacitiva pelo sinal de Q?",
        "verso": "Convenção: Q positiva é carga indutiva (motor, transformador, reator), com corrente atrasada. Q negativa é carga capacitiva. O capacitor \"fornece\" o reativo que o indutor consome.",
        "nivel": 3,
        "tags": [
          "q"
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null
      },
      {
        "id": "ca-c-018",
        "frente": "O que acontece com o RLC série na ressonância?",
        "verso": "XL = XC, a impedância mínima vale Z = R, a corrente é máxima e fica em fase com a tensão. As tensões em L e C podem superar a da fonte, com valor Q·V, em que Q (fator de qualidade) = XL/R.",
        "nivel": 3,
        "tags": [
          "ressonancia"
        ],
        "ver": {
          "href": "elet.html#rlc",
          "rotulo": "Circuito RLC"
        },
        "aConfirmar": null
      }
    ],
    "questoes": [
      {
        "id": "ca-q-001",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Uma bobina de 200 mH é ligada a uma rede de 60 Hz. Qual é a sua reatância indutiva?",
        "alternativas": [
          "75,40 Ω",
          "12,00 Ω",
          "24,00 Ω",
          "75398 Ω"
        ],
        "correta": 0,
        "explicacao": "L = 200 mH = 0,2 H. XL = 2π·f·L = 2π × 60 × 0,2 = 75,40 Ω.",
        "porQueErrada": [
          null,
          "Usou f no lugar de ω: multiplicou f·L e esqueceu o 2π.",
          "Esqueceu o π e usou 2·f·L.",
          "Usou L = 200 sem converter mH em henry."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.XL",
          "args": [
            60,
            0.2
          ],
          "unidade": "Ω",
          "casas": 2
        }
      },
      {
        "id": "ca-q-002",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um capacitor de 100 µF é ligado a uma rede de 60 Hz. Qual é a sua reatância capacitiva?",
        "alternativas": [
          "166,67 Ω",
          "26,53 Ω",
          "0,04 Ω",
          "265,26 Ω"
        ],
        "correta": 1,
        "explicacao": "C = 100 µF = 100·10⁻⁶ F. XC = 1/(2π·f·C) = 1/(2π × 60 × 100·10⁻⁶) = 1/0,03770 = 26,53 Ω.",
        "porQueErrada": [
          "Esqueceu o 2π: usou 1/(f·C) em vez de 1/(ω·C).",
          null,
          "Multiplicou ω·C em vez de inverter.",
          "Errou o prefixo: usou 10 µF em lugar de 100 µF."
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.XC",
          "args": [
            60,
            0.0001
          ],
          "unidade": "Ω",
          "casas": 2
        }
      },
      {
        "id": "ca-q-003",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Uma carga consome P = 3000 W e Q = 4000 VAr. Qual é a potência aparente S?",
        "alternativas": [
          "7000 VA",
          "1000 VA",
          "5000 VA",
          "3500 VA"
        ],
        "correta": 2,
        "explicacao": "S = √(P² + Q²) = √(3000² + 4000²) = √25000000 = 5000 VA. É o triângulo 3-4-5.",
        "porQueErrada": [
          "Somou P e Q aritmeticamente, em vez de usar Pitágoras.",
          "Subtraiu as potências.",
          null,
          "Fez a média de P e Q."
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.S",
          "args": [
            3000,
            4000
          ],
          "unidade": "VA",
          "casas": 0
        }
      },
      {
        "id": "ca-q-004",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Qual é a frequência de ressonância de um circuito RLC série com L = 100 mH e C = 100 µF?",
        "alternativas": [
          "316,23 Hz",
          "0,02 Hz",
          "15915,49 Hz",
          "50,33 Hz"
        ],
        "correta": 3,
        "explicacao": "L·C = 0,1 × 100·10⁻⁶ = 10⁻⁵. √(LC) = 3,162·10⁻³. f0 = 1/(2π × 3,162·10⁻³) = 50,33 Hz.",
        "porQueErrada": [
          "Esqueceu o 2π: encontrou ω0 (rad/s), não f0 (Hz).",
          "Inverteu a fórmula: usou 2π·√(LC).",
          "Esqueceu a raiz de L·C.",
          null
        ],
        "ver": {
          "href": "elet.html#rlc",
          "rotulo": "Circuito RLC"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.f0",
          "args": [
            0.1,
            0.0001
          ],
          "unidade": "Hz",
          "casas": 2
        }
      },
      {
        "id": "ca-q-005",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um circuito RL série tem R = 100 Ω e L = 100 mH em 50 Hz. Qual é a impedância?",
        "alternativas": [
          "104,82 Ω",
          "131,42 Ω",
          "68,58 Ω",
          "31,42 Ω"
        ],
        "correta": 0,
        "explicacao": "XL = 2π × 50 × 0,1 = 31,42 Ω. Z = √(R² + XL²) = √(100² + 31,42²) = √10986,96 = 104,82 Ω.",
        "porQueErrada": [
          null,
          "Somou R e XL aritmeticamente.",
          "Subtraiu XL de R.",
          "Considerou só a reatância, sem a resistência."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.Z_RL",
          "args": [
            100,
            50,
            0.1
          ],
          "unidade": "Ω",
          "casas": 2
        }
      },
      {
        "id": "ca-q-006",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um circuito RC série tem R = 100 Ω e C = 50 µF em 60 Hz. Qual é a impedância?",
        "alternativas": [
          "153,1 Ω",
          "113,2 Ω",
          "46,9 Ω",
          "53,1 Ω"
        ],
        "correta": 1,
        "explicacao": "XC = 1/(2π × 60 × 50·10⁻⁶) = 53,05 Ω. Z = √(R² + XC²) = √(100² + 53,05²) = √12814 = 113,2 Ω.",
        "porQueErrada": [
          "Somou R e XC aritmeticamente.",
          null,
          "Subtraiu XC de R.",
          "Considerou só a reatância, sem a resistência."
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.Z_RC",
          "args": [
            100,
            60,
            0.00005
          ],
          "unidade": "Ω",
          "casas": 1
        }
      },
      {
        "id": "ca-q-007",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Qual é o ângulo φ de um circuito com R = 30 Ω e reatância indutiva de 40 Ω?",
        "alternativas": [
          "36,87°",
          "0,93°",
          "53,13°",
          "1,33°"
        ],
        "correta": 2,
        "explicacao": "tanφ = X/R = 40/30 = 1,333. φ = arctan(1,333) = 53,13°, com a corrente atrasada.",
        "porQueErrada": [
          "Inverteu a razão: usou arctan(R/X) em vez de arctan(X/R).",
          "Deixou o resultado em radianos, sem converter para graus.",
          null,
          "Tomou o valor de tanφ como se fosse o ângulo."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.fi",
          "args": [
            30,
            40
          ],
          "unidade": "°",
          "casas": 2
        }
      },
      {
        "id": "ca-q-008",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Uma carga monofásica em 220 V e 10 A tem fator de potência 0,8 indutivo (φ = 36,87°). Qual é a potência ativa?",
        "alternativas": [
          "2200 W",
          "1320 W",
          "2750 W",
          "1760 W"
        ],
        "correta": 3,
        "explicacao": "S = V·I = 220 × 10 = 2200 VA. P = S·cosφ = 2200 × 0,8 = 1760 W.",
        "porQueErrada": [
          "Calculou a potência aparente S = V·I e esqueceu o cosφ.",
          "Usou senφ no lugar de cosφ, o que dá a potência reativa.",
          "Dividiu por cosφ em vez de multiplicar.",
          null
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.P",
          "args": [
            220,
            10,
            36.87
          ],
          "unidade": "W",
          "casas": 0
        }
      },
      {
        "id": "ca-q-009",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um indutor de 0,5 H é percorrido por 4 A. Qual é a energia armazenada no campo magnético?",
        "alternativas": [
          "4 J",
          "8 J",
          "1 J",
          "2 J"
        ],
        "correta": 0,
        "explicacao": "W = ½·L·I² = 0,5 × 0,5 × 4² = 0,25 × 16 = 4 J.",
        "porQueErrada": [
          null,
          "Esqueceu o fator ½: calculou L·I².",
          "Esqueceu de elevar a corrente ao quadrado.",
          "Calculou L·I, sem o ½ nem o quadrado."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.W_L",
          "args": [
            0.5,
            4
          ],
          "unidade": "J",
          "casas": 0
        }
      },
      {
        "id": "ca-q-010",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um circuito RLC série tem R = 10 Ω, L = 100 mH e C = 100 µF, em 60 Hz. Qual é a impedância?",
        "alternativas": [
          "74,22 Ω",
          "21,17 Ω",
          "47,17 Ω",
          "65,00 Ω",
          "14,99 Ω"
        ],
        "correta": 4,
        "explicacao": "XL = 37,70 Ω e XC = 26,53 Ω. X = XL − XC = 11,17 Ω. Z = √(R² + X²) = √(100 + 124,8) = 14,99 Ω. Circuito indutivo.",
        "porQueErrada": [
          "Somou R, XL e XC aritmeticamente.",
          "Fez R + XL − XC como números comuns, sem Pitágoras.",
          "Somou os quadrados de XL e XC em vez de subtrair XL − XC antes.",
          "Somou XL + XC. Os dois têm sinais opostos: a reatância líquida é XL − XC.",
          null
        ],
        "ver": {
          "href": "elet.html#rlc",
          "rotulo": "Circuito RLC"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.Z_RLC",
          "args": [
            10,
            60,
            0.1,
            0.0001
          ],
          "unidade": "Ω",
          "casas": 2
        }
      },
      {
        "id": "ca-q-011",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Uma carga em 127 V e 20 A tem fator de potência 0,6 (φ = 53,13°). Qual é a potência reativa?",
        "alternativas": [
          "1524 VAr",
          "2540 VAr",
          "2032 VAr",
          "4233 VAr"
        ],
        "correta": 2,
        "explicacao": "S = V·I = 127 × 20 = 2540 VA. Q = S·senφ = 2540 × 0,8 = 2032 VAr. Confira: P = 1524 W e S² = P² + Q².",
        "porQueErrada": [
          "Usou cosφ no lugar de senφ, o que dá a potência ativa.",
          "Calculou a potência aparente, sem aplicar o senφ.",
          null,
          "Dividiu S por cosφ."
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.Q",
          "args": [
            127,
            20,
            53.13
          ],
          "unidade": "VAr",
          "casas": 0
        }
      },
      {
        "id": "ca-q-012",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um capacitor de 470 µF está carregado com 100 V. Qual é a energia armazenada?",
        "alternativas": [
          "4,70 J",
          "0,02 J",
          "1,18 J",
          "2,35 J"
        ],
        "correta": 3,
        "explicacao": "W = ½·C·V² = 0,5 × 470·10⁻⁶ × 100² = 0,5 × 470·10⁻⁶ × 10000 = 2,35 J.",
        "porQueErrada": [
          "Esqueceu o fator ½.",
          "Esqueceu de elevar a tensão ao quadrado.",
          "Aplicou o fator ½ duas vezes.",
          null
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": {
          "fn": "ca.W_C",
          "args": [
            0.00047,
            100
          ],
          "unidade": "J",
          "casas": 2
        }
      },
      {
        "id": "ca-q-013",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em que forma o indutor armazena energia?",
        "alternativas": [
          "Em campo magnético",
          "Em campo elétrico",
          "Em calor",
          "Em cargas livres"
        ],
        "correta": 0,
        "explicacao": "O indutor é uma bobina: a corrente cria um campo magnético, onde fica a energia W = ½·L·I².",
        "porQueErrada": [
          null,
          "O campo elétrico é o do capacitor.",
          "O indutor ideal não converte energia em calor.",
          "O indutor não guarda carga."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-014",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em que forma o capacitor armazena energia?",
        "alternativas": [
          "Em campo magnético",
          "Em campo elétrico",
          "Em calor",
          "Em movimento das cargas"
        ],
        "correta": 1,
        "explicacao": "O capacitor tem duas placas separadas por um isolante; a tensão cria o campo elétrico onde fica a energia W = ½·C·V².",
        "porQueErrada": [
          "O campo magnético é o do indutor.",
          null,
          "O capacitor ideal não converte energia em calor.",
          "A energia fica no campo entre as placas."
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-015",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "O indutor se opõe à variação de qual grandeza?",
        "alternativas": [
          "Da tensão",
          "Da frequência",
          "Da corrente",
          "Da resistência"
        ],
        "correta": 2,
        "explicacao": "No indutor, v = L·di/dt: ele reage a mudanças de corrente. Por isso a corrente atrasa em relação à tensão.",
        "porQueErrada": [
          "Quem se opõe à variação de tensão é o capacitor.",
          "A frequência é uma característica da fonte.",
          null,
          "A resistência não é uma grandeza que varie no tempo aqui."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-016",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "O capacitor se opõe à variação de qual grandeza?",
        "alternativas": [
          "Da corrente",
          "Da potência",
          "Da indutância",
          "Da tensão"
        ],
        "correta": 3,
        "explicacao": "No capacitor, i = C·dv/dt: ele reage a mudanças de tensão. Por isso a corrente adianta em relação à tensão.",
        "porQueErrada": [
          "Quem se opõe à variação de corrente é o indutor.",
          "O capacitor não age sobre a potência diretamente.",
          "Indutância é característica da bobina.",
          null
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-017",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "O que acontece com a reatância indutiva XL se a frequência dobra?",
        "alternativas": [
          "Dobra",
          "Cai pela metade",
          "Quadruplica",
          "Não muda"
        ],
        "correta": 0,
        "explicacao": "XL = 2π·f·L é diretamente proporcional a f. Com a frequência dobrada, XL dobra.",
        "porQueErrada": [
          null,
          "Isso ocorre com a reatância capacitiva.",
          "XL é proporcional a f, não a f².",
          "XL = 2π·f·L depende da frequência."
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-018",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "O que acontece com a reatância capacitiva XC se a frequência dobra?",
        "alternativas": [
          "Dobra",
          "Cai pela metade",
          "Quadruplica",
          "Não muda"
        ],
        "correta": 1,
        "explicacao": "XC = 1/(2π·f·C) é inversamente proporcional a f. Com a frequência dobrada, XC cai pela metade.",
        "porQueErrada": [
          "Isso ocorre com a reatância indutiva.",
          null,
          "XC não cresce com f.",
          "XC = 1/(2π·f·C) depende da frequência."
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-019",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em corrente contínua estável, depois de carregado, como o capacitor ideal se comporta?",
        "alternativas": [
          "Como curto-circuito",
          "Como um resistor de valor fixo",
          "Como circuito aberto",
          "Como uma fonte de tensão variável"
        ],
        "correta": 2,
        "explicacao": "Com a tensão constante, i = C·dv/dt = 0: não passa corrente. O capacitor bloqueia a CC e conduz apenas variações.",
        "porQueErrada": [
          "Esse é o comportamento do indutor em CC estável.",
          "O capacitor ideal não tem resistência.",
          null,
          "Em CC estável a tensão no capacitor é constante."
        ],
        "ver": {
          "href": "elet.html#rc",
          "rotulo": "Circuito RC"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-020",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Em um indutor puro ligado a uma fonte senoidal, a corrente em relação à tensão:",
        "alternativas": [
          "adianta 90°",
          "fica em fase",
          "atrasa 180°",
          "atrasa 90°"
        ],
        "correta": 3,
        "explicacao": "O indutor reage à variação de corrente, de modo que a corrente só cresce depois que a tensão se estabelece: atrasa 90°.",
        "porQueErrada": [
          "Isso ocorre no capacitor.",
          "Isso ocorre em um resistor.",
          "A defasagem do indutor é de 90°, não 180°.",
          null
        ],
        "ver": {
          "href": "elet.html#fasores",
          "rotulo": "Fasores"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-021",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Em um capacitor puro ligado a uma fonte senoidal, a corrente em relação à tensão:",
        "alternativas": [
          "adianta 90°",
          "atrasa 90°",
          "fica em fase",
          "adianta 180°"
        ],
        "correta": 0,
        "explicacao": "A corrente no capacitor é proporcional à taxa de variação da tensão (i = C·dv/dt), por isso adianta 90°.",
        "porQueErrada": [
          null,
          "Isso ocorre no indutor.",
          "Isso ocorre em um resistor.",
          "A defasagem do capacitor é de 90°, não 180°."
        ],
        "ver": {
          "href": "elet.html#fasores",
          "rotulo": "Fasores"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-022",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Na ressonância de um RLC série, qual afirmação é correta?",
        "alternativas": [
          "XL = 0 e a corrente é mínima",
          "XL = XC e a corrente é máxima",
          "XC = R e a impedância é máxima",
          "XL e XC somam e a corrente é nula"
        ],
        "correta": 1,
        "explicacao": "Em f0, XL = XC. A reatância líquida é zero, a impedância cai ao mínimo (Z = R) e a corrente é a máxima possível.",
        "porQueErrada": [
          "XL só é nulo em f = 0.",
          null,
          "Na ressonância, Z = R é o mínimo.",
          "Na ressonância eles se anulam."
        ],
        "ver": {
          "href": "elet.html#rlc",
          "rotulo": "Circuito RLC"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-023",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Para compensar o reativo indutivo de um motor, instala-se em paralelo:",
        "alternativas": [
          "outro indutor",
          "um resistor",
          "um capacitor",
          "um diodo"
        ],
        "correta": 2,
        "explicacao": "O capacitor tem reativo de sinal oposto ao do indutor: ele fornece o reativo que o motor consome, reduzindo a corrente na linha.",
        "porQueErrada": [
          "Mais um indutor aumentaria o reativo indutivo.",
          "O resistor consome potência ativa e não compensa o reativo.",
          null,
          "O diodo não gera potência reativa."
        ],
        "ver": {
          "href": "elet.html#calc",
          "rotulo": "Calculadoras de potência"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "ca-q-024",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Por que a impedância de um RL não é R + XL?",
        "alternativas": [
          "Porque XL é sempre muito menor que R",
          "Porque a corrente é contínua",
          "Porque R depende da frequência",
          "Porque R e XL estão defasadas de 90° e se combinam por Pitágoras"
        ],
        "correta": 3,
        "explicacao": "A tensão no resistor está em fase com a corrente e a do indutor está adiantada 90°. Os dois efeitos formam um triângulo retângulo: Z = √(R² + XL²).",
        "porQueErrada": [
          "A relação entre R e XL depende da frequência e de L.",
          "O circuito está em CA; a razão é a defasagem.",
          "A resistência ideal não depende da frequência.",
          null
        ],
        "ver": {
          "href": "elet.html#rl",
          "rotulo": "Circuito RL"
        },
        "aConfirmar": null,
        "calc": null
      }
    ],
    "listas": [],
    "retirados": []
  };
  if (P.registrarTopico) { P.registrarTopico(t); } else { (P._fila = P._fila || []).push(t); }
})(typeof window !== "undefined" ? window : globalThis);
