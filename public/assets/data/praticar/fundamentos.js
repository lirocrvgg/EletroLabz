/* data/praticar/fundamentos.js - conteudo do topico "Fundamentos" (Praticar). Conferido por tests/praticar/conteudo.test.js. */
(function (root) {
  var EO = root.EO = root.EO || {}; var P = EO.praticar = EO.praticar || {};
  var t = {
    "id": "fundamentos",
    "versao": 1,
    "ordem": 1,
    "titulo": "Fundamentos",
    "tituloCurto": "Fundamentos",
    "resumo": "Tensão, corrente, resistência, potência e energia: Lei de Ohm, efeito Joule e custo de energia.",
    "modulo": "elet",
    "ver": [
      {
        "href": "elet.html#calc",
        "rotulo": "Calculadoras de potência"
      }
    ],
    "cards": [
      {
        "id": "fun-c-001",
        "frente": "O que é carga elétrica e qual é a sua unidade?",
        "verso": "Carga é a propriedade da matéria ligada aos elétrons (negativa) e aos prótons (positiva). A unidade é o coulomb (C). Uma corrente de 1 A é 1 C passando por um ponto a cada segundo.",
        "nivel": 1,
        "tags": [
          "carga"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-002",
        "frente": "O que é tensão elétrica e qual é a sua unidade?",
        "verso": "Tensão (ou diferença de potencial) é a energia por unidade de carga entre dois pontos: 1 V = 1 J/C. É o que \"empurra\" a corrente. Mede-se em volts (V), sempre entre dois pontos.",
        "nivel": 1,
        "tags": [
          "tensao"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-003",
        "frente": "O que é corrente elétrica e qual é a sua unidade?",
        "verso": "É o fluxo ordenado de cargas: I = Q/t. A unidade é o ampère (A). Ela é medida em série com o circuito, nunca em paralelo com a carga.",
        "nivel": 1,
        "tags": [
          "corrente"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-004",
        "frente": "O que é resistência elétrica?",
        "verso": "É a oposição que o material oferece à passagem da corrente. Mede-se em ohms (Ω). Quanto maior a resistência, menor a corrente para a mesma tensão.",
        "nivel": 1,
        "tags": [
          "resistencia"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-005",
        "frente": "Qual é a Lei de Ohm?",
        "verso": "V = R·I. Daí saem I = V/R e R = V/I. Vale para resistores (componentes lineares): a corrente é proporcional à tensão. Exemplo: 12 V sobre 4 Ω dá 3 A.",
        "nivel": 1,
        "tags": [
          "ohm"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-006",
        "frente": "Como se calcula a potência elétrica?",
        "verso": "P = V·I, em watts (W). É a energia convertida por segundo. Exemplo: 220 V e 5 A dão 1100 W.",
        "nivel": 1,
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
        "id": "fun-c-007",
        "frente": "Quais prefixos aparecem com mais frequência?",
        "verso": "k (quilo) = 10³; M (mega) = 10⁶; m (mili) = 10⁻³; µ (micro) = 10⁻⁶. Exemplos: 2,2 kΩ = 2200 Ω; 470 µF = 0,00047 F; 250 mA = 0,25 A.",
        "nivel": 1,
        "tags": [
          "unidades"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-008",
        "frente": "O que o kWh mede e como se calcula?",
        "verso": "O kWh mede energia, não potência. Energia = potência × tempo. Um aparelho de 1500 W ligado por 2 h consome 1,5 kW × 2 h = 3 kWh.",
        "nivel": 1,
        "tags": [
          "energia"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-009",
        "frente": "Quais são as três formas da potência e quando usar cada uma?",
        "verso": "P = V·I; P = R·I² (use quando conhece a corrente e R); P = V²/R (use quando conhece a tensão e R). As três vêm da Lei de Ohm.",
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
        "id": "fun-c-010",
        "frente": "Como calcular a resistência de um fio?",
        "verso": "R = ρ·L/A. ρ é a resistividade do material, L o comprimento e A a área da seção. Com A em mm² e L em m, ρ do cobre vale cerca de 0,0172 Ω·mm²/m.",
        "nivel": 2,
        "tags": [
          "resistividade"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-011",
        "frente": "O que é o efeito Joule?",
        "verso": "É o aquecimento de um condutor percorrido por corrente: P = R·I² e energia E = R·I²·t. É útil no chuveiro e no fusível; é perda nos cabos e nos motores.",
        "nivel": 2,
        "tags": [
          "joule"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-012",
        "frente": "Como calcular o custo da energia consumida?",
        "verso": "Custo = energia em kWh × tarifa por kWh. Um aparelho de 1000 W por 3 h consome 3 kWh. Com tarifa de 0,80 reais por kWh, o custo é 2,40 reais.",
        "nivel": 2,
        "tags": [
          "energia",
          "custo"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-013",
        "frente": "Quantos joules vale 1 kWh?",
        "verso": "1 kWh = 1000 W × 3600 s = 3,6·10⁶ J. O joule é a unidade do SI; o kWh é a unidade prática usada na conta de luz.",
        "nivel": 2,
        "tags": [
          "energia"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-014",
        "frente": "O que muda na resistência do fio ao alterar L ou A?",
        "verso": "R é proporcional ao comprimento: dobrar L dobra R. R é inversamente proporcional à área: dobrar A reduz R pela metade. Por isso cabos longos exigem seção maior.",
        "nivel": 2,
        "tags": [
          "resistividade"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-015",
        "frente": "Qual a diferença entre corrente contínua (CC) e alternada (CA)?",
        "verso": "Em CC a corrente tem sentido fixo (pilhas, baterias). Em CA o sentido se inverte periodicamente; na rede brasileira, 60 Hz, ou seja, 60 ciclos por segundo.",
        "nivel": 2,
        "tags": [
          "cc",
          "ca"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-016",
        "frente": "Se a tensão sobre um resistor dobra, o que acontece com a potência?",
        "verso": "A corrente dobra (I = V/R) e a potência quadruplica: P = V²/R. Com a tensão pela metade, a potência cai a 1/4. Por isso um chuveiro ligado em 127 V esquenta bem menos que em 220 V.",
        "nivel": 3,
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
        "id": "fun-c-017",
        "frente": "Por que a perda nos cabos cresce tanto com a corrente?",
        "verso": "A perda é P = R·I²: depende do quadrado da corrente. Dobrar a corrente quadruplica o aquecimento do cabo. Por isso se usa tensão alta para transmitir potência à distância.",
        "nivel": 3,
        "tags": [
          "joule",
          "perdas"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "fun-c-018",
        "frente": "A Lei de Ohm vale para qualquer componente?",
        "verso": "Não. Ela descreve componentes lineares, como o resistor. Em diodos, LEDs e lâmpadas incandescentes (R muda com a temperatura) a razão V/I não é constante.",
        "nivel": 3,
        "tags": [
          "ohm"
        ],
        "ver": null,
        "aConfirmar": null
      }
    ],
    "questoes": [
      {
        "id": "fun-q-001",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um resistor de 48 Ω é percorrido por uma corrente de 2,5 A. Qual é a tensão sobre ele?",
        "alternativas": [
          "120 V",
          "19,2 V",
          "50,5 V",
          "12 V"
        ],
        "correta": 0,
        "explicacao": "Pela Lei de Ohm, V = R·I = 48 Ω × 2,5 A = 120 V. O produto dá volts; a divisão R/I não tem sentido físico aqui.",
        "porQueErrada": [
          null,
          "Dividiu R por I: aplicou R/I em vez de I·R.",
          "Somou os valores. A Lei de Ohm é um produto, não uma soma.",
          "Errou a casa decimal ao multiplicar."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "ohm.V",
          "args": [
            2.5,
            48
          ],
          "unidade": "V",
          "casas": 0
        }
      },
      {
        "id": "fun-q-002",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um aquecedor com resistência de 254 Ω é ligado a 127 V. Qual é a corrente?",
        "alternativas": [
          "2,0 A",
          "0,5 A",
          "0,05 A",
          "5,0 A"
        ],
        "correta": 1,
        "explicacao": "Da Lei de Ohm, I = V/R = 127 V / 254 Ω = 0,5 A. Maior resistência para a mesma tensão significa menos corrente.",
        "porQueErrada": [
          "Inverteu a fórmula: usou R/V.",
          null,
          "Errou a casa decimal.",
          "Errou a casa decimal."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "ohm.I",
          "args": [
            127,
            254
          ],
          "unidade": "A",
          "casas": 1
        }
      },
      {
        "id": "fun-q-003",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um resistor submetido a 24 V é percorrido por 0,5 A. Qual é a sua resistência?",
        "alternativas": [
          "12 Ω",
          "0,021 Ω",
          "48 Ω",
          "4,8 Ω"
        ],
        "correta": 2,
        "explicacao": "Da Lei de Ohm, R = V/I = 24 V / 0,5 A = 48 Ω. O produto V·I daria 12 W, que é potência.",
        "porQueErrada": [
          "Multiplicou V por I, o que dá potência (12 W), não resistência.",
          "Inverteu a fórmula: usou I/V.",
          null,
          "Errou a casa decimal."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "ohm.R",
          "args": [
            24,
            0.5
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "fun-q-004",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um ferro elétrico opera em 220 V com 4,5 A. Qual é a sua potência?",
        "alternativas": [
          "48,9 W",
          "224,5 W",
          "99 W",
          "990 W"
        ],
        "correta": 3,
        "explicacao": "A potência é o produto da tensão pela corrente: P = V·I = 220 V × 4,5 A = 990 W.",
        "porQueErrada": [
          "Dividiu V por I: isso dá a resistência (48,9 Ω), não a potência.",
          "Somou V e I em vez de multiplicar.",
          "Errou a casa decimal ao multiplicar.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.P_VI",
          "args": [
            220,
            4.5
          ],
          "unidade": "W",
          "casas": 0
        }
      },
      {
        "id": "fun-q-005",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um resistor de 22 Ω é percorrido por 5 A. Qual é a potência dissipada?",
        "alternativas": [
          "4,4 W",
          "110 W",
          "550 W",
          "12100 W"
        ],
        "correta": 2,
        "embaralhar": false,
        "explicacao": "P = R·I² = 22 Ω × (5 A)² = 22 × 25 = 550 W.",
        "porQueErrada": [
          "Dividiu R por I.",
          "Esqueceu de elevar a corrente ao quadrado: R·I em vez de R·I².",
          null,
          "Elevou o produto R·I ao quadrado, em vez de só a corrente."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.P_RI2",
          "args": [
            22,
            5
          ],
          "unidade": "W",
          "casas": 0
        }
      },
      {
        "id": "fun-q-006",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Uma lâmpada de 60 W opera em 127 V. Qual é a corrente aproximada?",
        "alternativas": [
          "2,12 A",
          "0,47 A",
          "0,047 A",
          "4,72 A"
        ],
        "correta": 1,
        "explicacao": "Como P = V·I, I = P/V = 60 W / 127 V = 0,47 A.",
        "porQueErrada": [
          "Inverteu a fórmula: usou V/P.",
          null,
          "Errou a casa decimal.",
          "Errou a casa decimal."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.I_PV",
          "args": [
            60,
            127
          ],
          "unidade": "A",
          "casas": 2
        }
      },
      {
        "id": "fun-q-007",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um resistor de 10 Ω é ligado a 127 V. Qual é a potência dissipada?",
        "alternativas": [
          "12,7 W",
          "1270 W",
          "1612,9 W",
          "16129 W"
        ],
        "correta": 2,
        "embaralhar": false,
        "explicacao": "P = V²/R = 127² / 10 = 16129 / 10 = 1612,9 W.",
        "porQueErrada": [
          "Usou V/R, que é a corrente, não a potência.",
          "Multiplicou V por R.",
          null,
          "Esqueceu de dividir por R: calculou só V²."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.P_V2R",
          "args": [
            127,
            10
          ],
          "unidade": "W",
          "casas": 1
        }
      },
      {
        "id": "fun-q-008",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um chuveiro de 5500 W é usado 20 min por dia durante 30 dias, ou seja, 10 h no mês. Qual é a energia consumida?",
        "alternativas": [
          "55 kWh",
          "110 kWh",
          "1650 kWh",
          "55000 kWh"
        ],
        "correta": 0,
        "embaralhar": false,
        "explicacao": "20 min × 30 dias = 600 min = 10 h. E = P·t = 5,5 kW × 10 h = 55 kWh.",
        "porQueErrada": [
          null,
          "Usou 20 em vez de 10 como horas mensais.",
          "Multiplicou pelos 30 dias de novo (55 kWh × 30).",
          "Esqueceu de dividir por 1000 para converter W·h em kWh."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "energia.kWh",
          "args": [
            5500,
            10
          ],
          "unidade": "kWh",
          "casas": 0
        }
      },
      {
        "id": "fun-q-009",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um ferro de 1200 W é usado 3 h por dia durante 30 dias. Com tarifa de 0,80 reais por kWh, qual é o custo no mês?",
        "alternativas": [
          "0,86 reais",
          "2,88 reais",
          "86,40 reais",
          "108,00 reais"
        ],
        "correta": 2,
        "embaralhar": false,
        "explicacao": "E = 1,2 kW × (3 h × 30) = 1,2 × 90 = 108 kWh. Custo = 108 × 0,80 = 86,40 reais.",
        "porQueErrada": [
          "Errou a casa decimal.",
          "Calculou o custo de um dia, não do mês.",
          null,
          "Esqueceu de multiplicar pela tarifa: calculou só os kWh."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "energia.custo",
          "args": [
            1200,
            90,
            0.8
          ],
          "unidade": "reais",
          "casas": 2
        }
      },
      {
        "id": "fun-q-010",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um fio de cobre (ρ = 0,0172 Ω·mm²/m) tem 100 m e seção de 2,5 mm². Qual é a sua resistência?",
        "alternativas": [
          "0,688 Ω",
          "1,720 Ω",
          "4,300 Ω",
          "6,88 Ω"
        ],
        "correta": 0,
        "embaralhar": false,
        "explicacao": "R = ρ·L/A = 0,0172 × 100 / 2,5 = 1,72 / 2,5 = 0,688 Ω.",
        "porQueErrada": [
          null,
          "Esqueceu de dividir pela área.",
          "Multiplicou pela área em vez de dividir.",
          "Errou a casa decimal."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "resist.R",
          "args": [
            0.0172,
            100,
            2.5
          ],
          "unidade": "Ω",
          "casas": 3
        }
      },
      {
        "id": "fun-q-011",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um aquecedor de 2000 W é ligado em 220 V. Qual é a corrente aproximada?",
        "alternativas": [
          "0,11 A",
          "18,18 A",
          "9,09 A",
          "90,9 A"
        ],
        "correta": 2,
        "explicacao": "Como P = V·I, a corrente é I = P/V = 2000 W / 220 V = 9,09 A.",
        "porQueErrada": [
          "Inverteu a fórmula: usou V/P.",
          "Usou metade da tensão no denominador.",
          null,
          "Errou a casa decimal."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.I_PV",
          "args": [
            2000,
            220
          ],
          "unidade": "A",
          "casas": 2
        }
      },
      {
        "id": "fun-q-012",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um chuveiro de 220 V e 5500 W tem resistência de aquecimento de quanto?",
        "alternativas": [
          "25,0 Ω",
          "0,11 Ω",
          "880 Ω",
          "8,8 Ω"
        ],
        "correta": 3,
        "explicacao": "De P = V²/R, R = V²/P = 220² / 5500 = 48400 / 5500 = 8,8 Ω.",
        "porQueErrada": [
          "Calculou a corrente (25 A) e a tomou como resistência.",
          "Inverteu a fórmula: P/V².",
          "Leu 5,5 kW como 55 W, errando o prefixo.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.R_VP",
          "args": [
            220,
            5500
          ],
          "unidade": "Ω",
          "casas": 1
        }
      },
      {
        "id": "fun-q-013",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um resistor de 20 Ω recebe 220 V e dissipa 2420 W. Se a tensão cair para 110 V, qual passa a ser a potência?",
        "alternativas": [
          "605,0 W",
          "1210,0 W",
          "302,5 W",
          "5,5 W"
        ],
        "correta": 0,
        "explicacao": "P = V²/R = 110² / 20 = 12100 / 20 = 605,0 W. Metade da tensão dá um quarto da potência (2420 / 4).",
        "porQueErrada": [
          null,
          "Achou que a potência cai pela metade junto com a tensão; ela cai com o quadrado.",
          "Dividiu 2420 por 8, sem base física.",
          "Usou V/R, que é a corrente."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "pot.P_V2R",
          "args": [
            110,
            20
          ],
          "unidade": "W",
          "casas": 1
        }
      },
      {
        "id": "fun-q-014",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um resistor de 50 Ω é percorrido por 2 A durante 3 min. Qual é a energia dissipada, em joules?",
        "alternativas": [
          "200 J",
          "600 J",
          "18000 J",
          "36000 J"
        ],
        "correta": 3,
        "embaralhar": false,
        "explicacao": "P = R·I² = 50 × 4 = 200 W. t = 3 × 60 = 180 s. E = P·t = 200 × 180 = 36000 J.",
        "porQueErrada": [
          "Calculou só a potência (R·I²), sem multiplicar pelo tempo.",
          "Esqueceu de converter 3 min em 180 s.",
          "Esqueceu de elevar a corrente ao quadrado.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "joule.E",
          "args": [
            50,
            2,
            180
          ],
          "unidade": "J",
          "casas": 0
        }
      },
      {
        "id": "fun-q-015",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Qual é a unidade de medida da resistência elétrica?",
        "alternativas": [
          "volt (V)",
          "ampère (A)",
          "ohm (Ω)",
          "watt (W)"
        ],
        "correta": 2,
        "explicacao": "A resistência mede-se em ohms (Ω). Volt é tensão, ampère é corrente e watt é potência.",
        "porQueErrada": [
          "O volt mede tensão.",
          "O ampère mede corrente.",
          null,
          "O watt mede potência."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-016",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "O kWh é uma unidade de qual grandeza?",
        "alternativas": [
          "Potência",
          "Tensão",
          "Corrente",
          "Energia"
        ],
        "correta": 3,
        "explicacao": "kWh é potência (kW) multiplicada por tempo (h): é energia. A conta de luz cobra energia, não potência.",
        "porQueErrada": [
          "Potência é medida em kW; o kWh já inclui o tempo.",
          "Tensão é medida em volts.",
          "Corrente é medida em ampères.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-017",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Quantos ohms vale um resistor de 2,2 kΩ?",
        "alternativas": [
          "22 Ω",
          "220 Ω",
          "2200 Ω",
          "2200000 Ω"
        ],
        "correta": 2,
        "embaralhar": false,
        "explicacao": "O prefixo k vale 10³: 2,2 × 1000 = 2200 Ω.",
        "porQueErrada": [
          "Errou o prefixo por duas casas.",
          "Confundiu quilo (10³) com hecto (10²).",
          null,
          "Usou mega (10⁶) no lugar de quilo."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-018",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Como se liga um amperímetro para medir a corrente de uma carga?",
        "alternativas": [
          "Em paralelo com a carga",
          "Em série com a carga",
          "Nos terminais da fonte, com a carga desligada",
          "Em qualquer posição, desde que haja tensão"
        ],
        "correta": 1,
        "explicacao": "A corrente que se mede deve passar pelo instrumento, por isso o amperímetro entra em série. O voltímetro, ao contrário, entra em paralelo.",
        "porQueErrada": [
          "Em paralelo o amperímetro, de resistência muito baixa, causaria curto-circuito.",
          null,
          "Assim não circula corrente pelo instrumento.",
          "A posição importa: ele precisa ser percorrido pela corrente medida."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-019",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Dobrando o comprimento de um fio e mantendo material e seção, a resistência:",
        "alternativas": [
          "cai pela metade",
          "quadruplica",
          "dobra",
          "não muda"
        ],
        "correta": 2,
        "explicacao": "Em R = ρ·L/A, a resistência é proporcional ao comprimento. Dobrar L dobra R.",
        "porQueErrada": [
          "Isso ocorre ao dobrar a área, não o comprimento.",
          "R não depende do quadrado do comprimento.",
          null,
          "R = ρ·L/A depende de L."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-020",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Dobrando a área da seção de um fio e mantendo o comprimento, a resistência:",
        "alternativas": [
          "dobra",
          "quadruplica",
          "não muda",
          "cai pela metade"
        ],
        "correta": 3,
        "explicacao": "A está no denominador de R = ρ·L/A. Mais área significa mais caminhos para a corrente e menor resistência.",
        "porQueErrada": [
          "R é inversamente proporcional à área.",
          "Não há relação quadrática com a área.",
          "R = ρ·L/A depende de A.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-021",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Duas lâmpadas incandescentes de 127 V têm 60 W e 100 W. Qual tem maior resistência?",
        "alternativas": [
          "A de 60 W",
          "A de 100 W",
          "As duas têm a mesma",
          "Não dá para saber sem a corrente"
        ],
        "correta": 0,
        "explicacao": "Com a tensão igual, R = V²/P: quanto menor a potência, maior a resistência. A de 60 W tem cerca de 269 Ω; a de 100 W, cerca de 161 Ω.",
        "porQueErrada": [
          null,
          "Mais potência na mesma tensão exige menos resistência.",
          "Mesma tensão e potências diferentes implicam resistências diferentes.",
          "Com V e P, R = V²/P já é determinada."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-022",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Em qual aparelho o efeito Joule é o objetivo de funcionamento?",
        "alternativas": [
          "Motor elétrico",
          "Ferro de passar roupa",
          "Transformador",
          "Cabo de alimentação"
        ],
        "correta": 1,
        "explicacao": "No ferro, no chuveiro e na torradeira o calor do efeito Joule é o que se quer. Nos demais casos ele representa perda de energia.",
        "porQueErrada": [
          "No motor o aquecimento é perda.",
          null,
          "No transformador o aquecimento é perda.",
          "No cabo o aquecimento é perda indesejada."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-023",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Se a corrente em um resistor fixo dobra, a potência dissipada:",
        "alternativas": [
          "dobra",
          "cai pela metade",
          "quadruplica",
          "permanece igual"
        ],
        "correta": 2,
        "explicacao": "P = R·I². Com I dobrada, I² fica 4 vezes maior, e P também: 2² = 4.",
        "porQueErrada": [
          "Esqueceu que P = R·I² depende do quadrado.",
          "Aumentar a corrente nunca reduz a potência no mesmo resistor.",
          null,
          "A potência depende da corrente."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "fun-q-024",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Por que a Lei de Ohm (V = R·I, com R constante) não descreve bem um diodo?",
        "alternativas": [
          "O diodo só funciona em corrente alternada",
          "O diodo não tem resistência alguma",
          "A Lei de Ohm só vale em baixa tensão",
          "A tensão e a corrente do diodo não são proporcionais"
        ],
        "correta": 3,
        "explicacao": "A Lei de Ohm com R constante vale para componentes lineares. No diodo a corrente cresce de forma exponencial com a tensão, então a razão V/I muda.",
        "porQueErrada": [
          "O diodo funciona em CC; o problema é a relação V × I.",
          "Ele tem resistência, mas ela varia com a tensão aplicada.",
          "A lei depende da linearidade do componente, não do nível de tensão.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      }
    ],
    "listas": [],
    "retirados": []
  };
  if (P.registrarTopico) { P.registrarTopico(t); } else { (P._fila = P._fila || []).push(t); }
})(typeof window !== "undefined" ? window : globalThis);
