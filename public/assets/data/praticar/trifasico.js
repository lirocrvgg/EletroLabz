/* data/praticar/trifasico.js - conteudo do topico "Trifásico, FP e Acionamentos" (Praticar). Conferido por tests/praticar/conteudo.test.js. */
(function (root) {
  var EO = root.EO = root.EO || {}; var P = EO.praticar = EO.praticar || {};
  var t = {
    "id": "trifasico",
    "versao": 1,
    "ordem": 4,
    "titulo": "Trifásico, FP e Acionamentos",
    "tituloCurto": "Trifásico e FP",
    "resumo": "Sistemas trifásicos, Y e Δ, conversão Y–Δ, correção de fator de potência e acionamentos.",
    "modulo": "ambos",
    "ver": [
      {
        "href": "elet.html#trifasico",
        "rotulo": "Sistemas trifásicos"
      },
      {
        "href": "elet.html#ydelta",
        "rotulo": "Conversão Y–Δ"
      },
      {
        "href": "elet.html#cfp",
        "rotulo": "Correção do fator de potência"
      },
      {
        "href": "aciona.html#referencia",
        "rotulo": "Referência de acionamentos"
      },
      {
        "href": "aciona.html#diagrama",
        "rotulo": "Diagramas de comando"
      }
    ],
    "cards": [
      {
        "id": "tri-c-001",
        "frente": "O que é um sistema trifásico?",
        "verso": "Três tensões senoidais de mesmo valor e frequência, defasadas de 120° entre si (fases A, B e C). Transmite mais potência com menos cobre e alimenta motores com campo girante.",
        "nivel": 1,
        "tags": [
          "trifasico"
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-002",
        "frente": "O que é a sequência de fases e para que serve?",
        "verso": "É a ordem em que as fases atingem o máximo (ABC ou ACB). Ela define o sentido de giro do motor trifásico. Trocar duas fases quaisquer inverte a sequência e o sentido de rotação.",
        "nivel": 1,
        "tags": [
          "sequencia"
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-003",
        "frente": "Quais são as relações da ligação estrela (Y)?",
        "verso": "VL = √3·VF e IL = IF. Em Y equilibrado, a tensão de linha é √3 vezes a de fase. Exemplo: VF = 220 V dá VL ≈ 381 V (rede 220/380 V).",
        "nivel": 1,
        "tags": [
          "estrela"
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-004",
        "frente": "Quais são as relações da ligação triângulo (Δ)?",
        "verso": "VL = VF e IL = √3·IF. No Δ, cada carga recebe a tensão de linha, e a corrente de linha é √3 vezes a de fase. Exemplo: IF = 10 A dá IL ≈ 17,3 A.",
        "nivel": 1,
        "tags": [
          "triangulo"
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-005",
        "frente": "Como se calcula a potência ativa trifásica equilibrada?",
        "verso": "P = √3·VL·IL·cosφ, com VL e IL de linha. Vale para Y e para Δ. Exemplo: 380 V, 10 A e cosφ = 0,8 dão P ≈ 5265 W.",
        "nivel": 1,
        "tags": [
          "potencia"
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-006",
        "frente": "Como é um contator e quais contatos ele tem?",
        "verso": "É uma chave comandada por eletroímã: ao energizar a bobina, os contatos mudam de estado. Os principais (potência) levam a corrente do motor; os auxiliares, NA (normalmente abertos) e NF (normalmente fechados), servem ao comando.",
        "nivel": 1,
        "tags": [
          "contator"
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-007",
        "frente": "O que é o contato de selo?",
        "verso": "É um contato auxiliar NA do próprio contator, ligado em paralelo com o botão de partida. Depois do pulso, ele mantém a bobina energizada. O botão de desligar (NF) interrompe o circuito.",
        "nivel": 1,
        "tags": [
          "selo"
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-008",
        "frente": "Relé térmico, fusível e disjuntor: qual a função de cada um?",
        "verso": "Relé térmico: protege contra sobrecarga prolongada. Fusível: protege contra curto-circuito e se funde; em motores, tipicamente o fusível (aM) cobre o curto e o relé térmico a sobrecarga, mas fusíveis gG também protegem contra sobrecarga. Disjuntor: protege contra sobrecarga e curto e pode ser rearmado.",
        "nivel": 1,
        "tags": [
          "protecao"
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-009",
        "frente": "O que é o intertravamento elétrico?",
        "verso": "Contato NF auxiliar de cada contator ligado em série com a bobina do outro. Com um deles fechado, o outro não consegue fechar. Evita curto-circuito entre fases na reversão.",
        "nivel": 2,
        "tags": [
          "intertravamento"
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-010",
        "frente": "Como funciona a partida direta?",
        "verso": "O motor é ligado direto à tensão da rede por um contator. É simples e barata, mas a corrente de partida é alta (vários múltiplos da nominal), o que afeta a rede em motores maiores.",
        "nivel": 2,
        "tags": [
          "partida"
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-011",
        "frente": "Como se faz a reversão de um motor trifásico?",
        "verso": "Dois contatores: um liga as fases na ordem normal e o outro troca duas fases. Os dois devem ter intertravamento elétrico, para nunca fechar juntos.",
        "nivel": 2,
        "tags": [
          "reversao"
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-012",
        "frente": "Como funciona a partida estrela-triângulo?",
        "verso": "Parte em Y: tensão em cada bobina = VL/√3, corrente e conjugado de partida caem a 1/3 do valor da partida direta. Depois de um tempo, comuta para Δ. O motor precisa de 6 terminais e Δ na tensão da rede.",
        "nivel": 2,
        "tags": [
          "estrela-triangulo"
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-013",
        "frente": "Qual é o papel do temporizador no comando?",
        "verso": "O relé temporizador (por exemplo, com retardo na energização) conta o tempo ajustado e depois muda seus contatos. Na partida Y–Δ, ele comanda a troca de estrela para triângulo.",
        "nivel": 2,
        "tags": [
          "temporizador"
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-014",
        "frente": "Como converter resistores de triângulo (Δ) para estrela (Y)?",
        "verso": "Com S = Ra + Rb + Rc: R1 = Rb·Rc/S, R2 = Ra·Rc/S, R3 = Ra·Rb/S (Ra entre B e C, Rb entre A e C, Rc entre A e B). Cada R do Y é o produto dos dois resistores do Δ ligados ao seu nó, dividido por S. Δ equilibrado: RY = RΔ/3.",
        "nivel": 2,
        "tags": [
          "delta-estrela"
        ],
        "ver": {
          "href": "elet.html#ydelta",
          "rotulo": "Conversão Y–Δ"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-015",
        "frente": "Como converter resistores de estrela (Y) para triângulo (Δ)?",
        "verso": "Com S = R1R2 + R2R3 + R3R1: Ra = S/R1 (entre B e C), Rb = S/R2 (entre A e C), Rc = S/R3 (entre A e B). Cada R do Δ fica oposto ao nó do R do Y no denominador. Y equilibrado: RΔ = 3·RY.",
        "nivel": 2,
        "tags": [
          "estrela-delta"
        ],
        "ver": {
          "href": "elet.html#ydelta",
          "rotulo": "Conversão Y–Δ"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-016",
        "frente": "Como se calcula o capacitor para corrigir o fator de potência?",
        "verso": "Qc = P·(tanφ1 − tanφ2). Monofásico: C = Qc/(ω·V²). Trifásico em Δ, com V de linha: C por fase = Qc/(3·ω·VL²). Em Y, C por fase = Qc/(ω·VL²).",
        "nivel": 3,
        "tags": [
          "fp",
          "capacitor"
        ],
        "ver": {
          "href": "elet.html#cfp",
          "rotulo": "Correção do fator de potência"
        },
        "aConfirmar": null
      },
      {
        "id": "tri-c-017",
        "frente": "Qual é o fator de potência mínimo exigido na rede brasileira?",
        "verso": "Costuma-se citar 0,92 (indutivo ou capacitivo) para unidades consumidoras. Confirme o valor, a janela de medição e as regras vigentes na regulamentação da distribuidora antes de usar.",
        "nivel": 3,
        "tags": [
          "fp",
          "regulacao"
        ],
        "ver": {
          "href": "elet.html#cfp",
          "rotulo": "Correção do fator de potência"
        },
        "aConfirmar": "Valor regulatório do fator de potência mínimo (ANEEL/PRODIST): conferir na regulamentação vigente."
      },
      {
        "id": "tri-c-018",
        "frente": "O que é a categoria de utilização AC-3 de um contator?",
        "verso": "É uma classificação do catálogo para contatores que partem motores de gaiola e os desligam em regime. O dimensionamento deve seguir o catálogo e a norma do fabricante.",
        "nivel": 3,
        "tags": [
          "contator",
          "categoria"
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": "Categoria de utilização definida em norma de contatores (IEC): conferir a norma ou o catálogo do fabricante."
      }
    ],
    "questoes": [
      {
        "id": "tri-q-001",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em uma ligação em estrela equilibrada, a tensão de fase é 127 V. Qual é a tensão de linha?",
        "alternativas": [
          "220 V",
          "127 V",
          "381 V",
          "73 V"
        ],
        "correta": 0,
        "explicacao": "Em Y, VL = √3·VF = 1,732 × 127 = 220,0 V, ou seja, a rede de 127/220 V.",
        "porQueErrada": [
          null,
          "Considerou VL = VF, o que vale apenas no triângulo.",
          "Multiplicou por 3 em vez de √3.",
          "Dividiu por √3: aplicou a relação invertida."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.VL_Y",
          "args": [
            127
          ],
          "unidade": "V",
          "casas": 0
        }
      },
      {
        "id": "tri-q-002",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Uma carga em triângulo tem corrente de fase de 10 A. Qual é a corrente de linha?",
        "alternativas": [
          "10,00 A",
          "17,32 A",
          "30,00 A",
          "5,77 A"
        ],
        "correta": 1,
        "explicacao": "No Δ, IL = √3·IF = 1,732 × 10 = 17,32 A.",
        "porQueErrada": [
          "Considerou IL = IF, o que vale apenas na estrela.",
          null,
          "Multiplicou por 3 em vez de √3.",
          "Dividiu por √3: aplicou a relação invertida."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.IL_delta",
          "args": [
            10
          ],
          "unidade": "A",
          "casas": 2
        }
      },
      {
        "id": "tri-q-003",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em uma rede trifásica a tensão de linha é 380 V. Qual é a tensão de fase em uma carga ligada em estrela?",
        "alternativas": [
          "380,0 V",
          "658,2 V",
          "219,4 V",
          "126,7 V"
        ],
        "correta": 2,
        "explicacao": "Em Y, VL = √3·VF, portanto VF = VL/√3 = 380/1,732 = 219,4 V (rede 220/380 V).",
        "porQueErrada": [
          "Considerou VF = VL, o que vale no triângulo.",
          "Multiplicou por √3: aplicou a relação invertida.",
          null,
          "Dividiu por 3 em vez de √3."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.VF_Y",
          "args": [
            380
          ],
          "unidade": "V",
          "casas": 1
        }
      },
      {
        "id": "tri-q-004",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Três resistores iguais de 12 Ω formam um triângulo equilibrado. Qual é o valor de cada resistor da estrela equivalente?",
        "alternativas": [
          "36 Ω",
          "12 Ω",
          "6 Ω",
          "4 Ω"
        ],
        "correta": 3,
        "explicacao": "Δ equilibrado → Y: RY = RΔ/3 = 12/3 = 4 Ω. Confira: S = 36 e R1 = (12 × 12)/36 = 4 Ω.",
        "porQueErrada": [
          "Multiplicou por 3: aplicou a conversão de Y para Δ.",
          "Manteve o valor, sem converter.",
          "Dividiu por 2 em vez de 3.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "yd.d2yEq",
          "args": [
            12
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "tri-q-005",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um motor trifásico opera com 380 V, 10 A de linha e fator de potência 0,8. Qual é a potência ativa que absorve?",
        "alternativas": [
          "5265 W",
          "3040 W",
          "9120 W",
          "6582 W"
        ],
        "correta": 0,
        "explicacao": "P = √3·VL·IL·cosφ = 1,732 × 380 × 10 × 0,8 = 5265 W.",
        "porQueErrada": [
          null,
          "Esqueceu o √3 na fórmula trifásica.",
          "Usou 3 em vez de √3.",
          "Esqueceu o fator de potência."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.P3",
          "args": [
            380,
            10,
            0.8
          ],
          "unidade": "W",
          "casas": 0
        }
      },
      {
        "id": "tri-q-006",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um motor trifásico de 10 kW trabalha em 380 V com fator de potência 0,85. Qual é a corrente de linha aproximada?",
        "alternativas": [
          "30,96 A",
          "17,87 A",
          "15,19 A",
          "10,32 A"
        ],
        "correta": 1,
        "explicacao": "De P = √3·VL·IL·cosφ: IL = 10000/(1,732 × 380 × 0,85) = 10000/559,4 = 17,87 A.",
        "porQueErrada": [
          "Esqueceu o √3 no denominador.",
          null,
          "Esqueceu o fator de potência.",
          "Usou 3 em vez de √3."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.IL_P",
          "args": [
            10000,
            380,
            0.85
          ],
          "unidade": "A",
          "casas": 2
        }
      },
      {
        "id": "tri-q-007",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Em uma conversão de triângulo para estrela, Ra = 30 Ω (entre B e C), Rb = 60 Ω (entre A e C) e Rc = 90 Ω (entre A e B). Qual é o R1 da estrela, ligado ao nó A?",
        "alternativas": [
          "15 Ω",
          "10 Ω",
          "30 Ω",
          "6 Ω"
        ],
        "correta": 2,
        "explicacao": "S = 30 + 60 + 90 = 180 Ω. Os dois resistores do Δ ligados ao nó A são Rb e Rc: R1 = Rb·Rc/S = 60 × 90/180 = 30 Ω.",
        "porQueErrada": [
          "Calculou R2 (Ra·Rc/S), que fica no nó B.",
          "Calculou R3 (Ra·Rb/S), que fica no nó C.",
          null,
          "Usou S/Ra, que é a fórmula da conversão inversa (Y para Δ)."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "yd.d2yK",
          "args": [
            30,
            60,
            90,
            0
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "tri-q-008",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Uma estrela tem R1 = 10 Ω (nó A), R2 = 20 Ω (nó B) e R3 = 30 Ω (nó C). Qual é o resistor Ra do triângulo equivalente, entre os nós B e C?",
        "alternativas": [
          "55 Ω",
          "36,67 Ω",
          "60 Ω",
          "110 Ω"
        ],
        "correta": 3,
        "explicacao": "S = R1R2 + R2R3 + R3R1 = 200 + 600 + 300 = 1100. Ra (entre B e C, oposto a R1) = S/R1 = 1100/10 = 110 Ω.",
        "porQueErrada": [
          "Calculou Rb (S/R2), que fica entre A e C.",
          "Calculou Rc (S/R3), que fica entre A e B.",
          "Somou os resistores da estrela.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "yd.y2dK",
          "args": [
            10,
            20,
            30,
            0
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "tri-q-009",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Um motor tem corrente de partida direta de 60 A. Na partida estrela-triângulo, qual é a corrente de linha na partida (ligado em Y)?",
        "alternativas": [
          "20 A",
          "34,6 A",
          "180 A",
          "60 A"
        ],
        "correta": 0,
        "explicacao": "Na ligação Y a corrente de linha cai a 1/3 da partida direta: 60/3 = 20 A. O conjugado cai pelo mesmo fator.",
        "porQueErrada": [
          null,
          "Usou 1/√3 em vez de 1/3.",
          "Multiplicou por 3: a partida em Y reduz a corrente.",
          "Considerou que a corrente não muda na partida em Y."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.Iy_part",
          "args": [
            60
          ],
          "unidade": "A",
          "casas": 0
        }
      },
      {
        "id": "tri-q-010",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Uma carga de 10 kW com fator de potência 0,70 será corrigida para 0,95. Qual é a potência reativa Qc do capacitor, em kVAr?",
        "alternativas": [
          "10,20 kVAr",
          "6,92 kVAr",
          "2,50 kVAr",
          "3,29 kVAr"
        ],
        "correta": 1,
        "explicacao": "tanφ1 = tan(arccos 0,70) = 1,0202; tanφ2 = tan(arccos 0,95) = 0,3287. Qc = 10 × (1,0202 − 0,3287) = 6,92 kVAr.",
        "porQueErrada": [
          "Usou só Q1, sem subtrair a Q que sobra depois da correção.",
          null,
          "Subtraiu os fatores de potência em vez das tangentes.",
          "Usou a Q final (Q2) no lugar da diferença Q1 − Q2."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "fp.Qc",
          "args": [
            10,
            0.7,
            0.95
          ],
          "unidade": "kVAr",
          "casas": 2
        }
      },
      {
        "id": "tri-q-011",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Para fornecer Qc = 6000 VAr a uma carga monofásica de 220 V e 60 Hz, qual capacitância é necessária?",
        "alternativas": [
          "2066,1 µF",
          "72343,2 µF",
          "328,8 µF",
          "986,5 µF"
        ],
        "correta": 2,
        "explicacao": "ω = 2π × 60 = 377 rad/s. C = Qc/(ω·V²) = 6000/(377 × 220²) = 6000/18246000 = 328,8 µF.",
        "porQueErrada": [
          "Usou f no lugar de ω = 2π·f.",
          "Não elevou a tensão ao quadrado.",
          null,
          "Multiplicou por 3 sem ser sistema trifásico."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "fp.C_uF",
          "args": [
            6000,
            60,
            220
          ],
          "unidade": "µF",
          "casas": 1
        }
      },
      {
        "id": "tri-q-012",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um banco de capacitores em triângulo deve fornecer Qc = 15 kVAr (15000 VAr) em uma rede de 380 V (linha) e 60 Hz. Qual é a capacitância por fase?",
        "alternativas": [
          "275,5 µF",
          "577,1 µF",
          "34902,4 µF",
          "91,8 µF"
        ],
        "correta": 3,
        "explicacao": "ω = 377 rad/s. Em Δ cada capacitor recebe VL = 380 V: C = Qc/(3·ω·VL²) = 15000/(3 × 377 × 144400) = 91,8 µF por fase.",
        "porQueErrada": [
          "Esqueceu o fator 3 (três capacitores dividem a potência).",
          "Usou f no lugar de ω = 2π·f.",
          "Não elevou a tensão ao quadrado.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "fp.C_delta_uF",
          "args": [
            15000,
            60,
            380
          ],
          "unidade": "µF",
          "casas": 1
        }
      },
      {
        "id": "tri-q-013",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Três resistores de 10 Ω formam uma carga em estrela alimentada por tensão de fase de 127 V. Qual é a potência total?",
        "alternativas": [
          "4839 W",
          "1613 W",
          "14516 W",
          "2794 W"
        ],
        "correta": 0,
        "explicacao": "Cada resistor recebe VF = 127 V: P1 = 127²/10 = 1612,9 W. Total: 3 × 1612,9 = 4839 W.",
        "porQueErrada": [
          null,
          "Calculou só uma fase.",
          "Aplicou a tensão de linha em cada resistor da estrela.",
          "Usou √3 no lugar de 3 na soma das fases."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "tri.P_Yres",
          "args": [
            127,
            10
          ],
          "unidade": "W",
          "casas": 0
        }
      },
      {
        "id": "tri-q-014",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em uma ligação estrela (Y) equilibrada, qual é a relação entre a tensão de linha e a de fase?",
        "alternativas": [
          "VL = VF",
          "VL = √3·VF",
          "VL = VF/√3",
          "VL = 3·VF"
        ],
        "correta": 1,
        "explicacao": "Em Y, a tensão de linha é a diferença entre duas tensões de fase defasadas 120°, o que resulta em √3·VF.",
        "porQueErrada": [
          "Isso vale no triângulo.",
          null,
          "Inverteu a relação.",
          "O fator correto é √3, não 3."
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-015",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em uma ligação triângulo (Δ) equilibrada, qual é a relação entre a corrente de linha e a de fase?",
        "alternativas": [
          "IL = IF",
          "IL = IF/√3",
          "IL = √3·IF",
          "IL = 3·IF"
        ],
        "correta": 2,
        "explicacao": "Em Δ, a corrente de linha é a diferença entre duas correntes de fase defasadas 120°, resultando em √3·IF.",
        "porQueErrada": [
          "Isso vale na estrela.",
          "Inverteu a relação.",
          null,
          "O fator correto é √3, não 3."
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-016",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Um contato NA (normalmente aberto), com a bobina do contator desenergizada, está:",
        "alternativas": [
          "fechado",
          "fechado apenas se houver tensão na rede",
          "em curto com a bobina",
          "aberto"
        ],
        "correta": 3,
        "explicacao": "NA significa aberto em repouso. Ao energizar a bobina ele fecha. O NF faz o contrário.",
        "porQueErrada": [
          "Esse é o estado do contato NF em repouso.",
          "O estado em repouso não depende da rede.",
          "O contato de comando é separado da bobina.",
          null
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-017",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Qual contato do contator é usado como contato de selo?",
        "alternativas": [
          "Um auxiliar NA, em paralelo com o botão de partida",
          "Um principal, em série com o motor",
          "Um auxiliar NF, em série com a bobina",
          "O relé térmico"
        ],
        "correta": 0,
        "explicacao": "O contato auxiliar NA fecha junto com a bobina e mantém a energização depois que o botão de partida é solto.",
        "porQueErrada": [
          null,
          "Os contatos principais levam a corrente de potência.",
          "Isso interromperia o circuito; é o papel do intertravamento.",
          "O relé térmico protege contra sobrecarga."
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-018",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Como se inverte o sentido de rotação de um motor de indução trifásico?",
        "alternativas": [
          "Trocando as três fases de lugar",
          "Trocando duas fases entre si",
          "Aumentando a tensão",
          "Invertendo o neutro"
        ],
        "correta": 1,
        "explicacao": "Trocar duas fases inverte a sequência (ABC passa a ACB) e o campo girante gira ao contrário.",
        "porQueErrada": [
          "Ao trocar as três de posição circular o sentido não muda.",
          null,
          "A tensão não muda o sentido de giro.",
          "O neutro não define o sentido de giro."
        ],
        "ver": {
          "href": "elet.html#trifasico",
          "rotulo": "Sistemas trifásicos"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-019",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Qual dispositivo protege o motor contra sobrecarga prolongada?",
        "alternativas": [
          "Botoeira NF",
          "Contato de selo",
          "Relé térmico",
          "Temporizador"
        ],
        "correta": 2,
        "explicacao": "O relé térmico aquece com a corrente e abre o contato quando há sobrecarga por tempo suficiente. Contra curto, usam-se fusíveis ou disjuntores.",
        "porQueErrada": [
          "A botoeira desliga por comando manual.",
          "O selo mantém a bobina energizada, mas não protege.",
          null,
          "O temporizador conta tempo, não mede a corrente."
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-020",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Qual é a função do intertravamento elétrico na reversão de motores?",
        "alternativas": [
          "Aumentar a corrente de partida",
          "Manter a bobina energizada",
          "Medir a velocidade",
          "Impedir que os dois contatores fechem ao mesmo tempo"
        ],
        "correta": 3,
        "explicacao": "Se os dois contatores fechassem juntos, haveria curto-circuito entre duas fases. O contato NF de um deles, em série com a bobina do outro, evita isso.",
        "porQueErrada": [
          "O intertravamento não altera a corrente.",
          "Essa é a função do contato de selo.",
          "Ele não mede velocidade.",
          null
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-021",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Na partida estrela-triângulo, como fica o conjugado de partida em relação à partida direta?",
        "alternativas": [
          "Cai a 1/3",
          "Fica 3 vezes maior",
          "Cai a 1/√3",
          "Não muda"
        ],
        "correta": 0,
        "explicacao": "Em Y, a tensão em cada bobina cai a VL/√3. O conjugado depende do quadrado da tensão, e por isso cai a 1/3 (assim como a corrente de linha).",
        "porQueErrada": [
          null,
          "O conjugado de partida em Y é reduzido.",
          "O fator √3 vale para a tensão, mas o conjugado cai com o quadrado: 1/3.",
          "A tensão em cada bobina é reduzida."
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-022",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Qual é a função típica do fusível em um circuito de acionamento?",
        "alternativas": [
          "Proteger contra sobrecarga leve e permanente, sem se fundir",
          "Proteger contra curto-circuito, fundindo-se",
          "Temporizar a partida",
          "Inverter o sentido de rotação"
        ],
        "correta": 1,
        "explicacao": "O fusível tem um elo que derrete quando passa corrente muito alta, abrindo o circuito. Depois de atuar, ele precisa ser substituído.",
        "porQueErrada": [
          "Essa é a função do relé térmico.",
          null,
          "O temporizador é outro componente.",
          "A reversão é feita pelos contatores."
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-023",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Na partida estrela-triângulo, o que o temporizador faz?",
        "alternativas": [
          "Reverte o sentido de giro",
          "Reduz a tensão da rede",
          "Troca de estrela para triângulo após o tempo ajustado",
          "Protege contra sobrecarga"
        ],
        "correta": 2,
        "explicacao": "O relé de tempo mantém o contator de estrela por um tempo ajustado e depois desliga-o e liga o de triângulo, com o motor já acelerado.",
        "porQueErrada": [
          "A reversão usa outro esquema de contatores.",
          "Ele não altera a tensão da rede.",
          null,
          "Essa é a função do relé térmico."
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-024",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Para partir um motor de 6 terminais em estrela-triângulo, a tensão de linha da rede deve ser:",
        "alternativas": [
          "igual à tensão nominal da ligação em estrela",
          "qualquer uma, desde que haja temporizador",
          "metade da tensão do motor",
          "igual à tensão nominal da ligação em triângulo do motor"
        ],
        "correta": 3,
        "explicacao": "O motor funciona em regime em Δ e, nessa ligação, cada bobina recebe a tensão de linha. Por isso a rede deve ser igual à tensão nominal do motor em Δ (por exemplo, 220 V em um motor 220/380 V).",
        "porQueErrada": [
          "Em Δ final o motor ficaria com √3 vezes a tensão nominal.",
          "A tensão deve ser compatível com a ligação em Δ.",
          "Não existe essa relação.",
          null
        ],
        "ver": {
          "href": "aciona.html#diagrama",
          "rotulo": "Diagramas de comando"
        },
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "tri-q-025",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Qual é o fator de potência mínimo exigido na regulamentação brasileira para unidades consumidoras?",
        "alternativas": [
          "0,85",
          "0,92",
          "0,98",
          "1,00"
        ],
        "correta": 1,
        "embaralhar": false,
        "explicacao": "A regulamentação costuma citar 0,92 como mínimo (indutivo ou capacitivo) em unidades consumidoras. Como é valor regulatório e pode mudar, o item fica fora do sorteio até ser conferido.",
        "porQueErrada": [
          "Valor mais antigo; confira a regra vigente.",
          null,
          "Valor usado como meta de projeto, não como mínimo.",
          "Fator de potência unitário não é exigido."
        ],
        "ver": {
          "href": "elet.html#cfp",
          "rotulo": "Correção do fator de potência"
        },
        "aConfirmar": "Valor regulatório do fator de potência mínimo (ANEEL/PRODIST): conferir na regulamentação vigente.",
        "calc": null
      },
      {
        "id": "tri-q-026",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Qual categoria de utilização de contatores costuma indicar partida de motor de gaiola e desligamento em regime?",
        "alternativas": [
          "AC-1",
          "AC-3",
          "AC-4",
          "DC-1"
        ],
        "correta": 1,
        "explicacao": "Os catálogos relacionam AC-3 à partida de motores de gaiola com desligamento em regime. Como a definição está em norma, o item fica fora do sorteio até ser conferido.",
        "porQueErrada": [
          "AC-1 é associada a cargas pouco indutivas ou resistivas.",
          null,
          "AC-4 inclui partida, plugging e inversão, regime mais severo.",
          "DC-1 é de corrente contínua."
        ],
        "ver": {
          "href": "aciona.html#referencia",
          "rotulo": "Referência de acionamentos"
        },
        "aConfirmar": "Categoria de utilização definida em norma de contatores (IEC): conferir a norma ou o catálogo.",
        "calc": null
      }
    ],
    "listas": [],
    "retirados": []
  };
  if (P.registrarTopico) { P.registrarTopico(t); } else { (P._fila = P._fila || []).push(t); }
})(typeof window !== "undefined" ? window : globalThis);
