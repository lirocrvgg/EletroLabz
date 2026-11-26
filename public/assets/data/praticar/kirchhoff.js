/* data/praticar/kirchhoff.js - conteudo do topico "Leis de Kirchhoff" (Praticar). Conferido por tests/praticar/conteudo.test.js. */
(function (root) {
  var EO = root.EO = root.EO || {}; var P = EO.praticar = EO.praticar || {};
  var t = {
    "id": "kirchhoff",
    "versao": 1,
    "ordem": 2,
    "titulo": "Leis de Kirchhoff",
    "tituloCurto": "Kirchhoff",
    "resumo": "Leis de Kirchhoff, associações série, paralela e mista, divisores e ponte equilibrada.",
    "modulo": "elet",
    "ver": [],
    "cards": [
      {
        "id": "kir-c-001",
        "frente": "O que diz a Lei de Kirchhoff das Correntes (LKC)?",
        "verso": "Em qualquer nó, a soma das correntes que entram é igual à soma das que saem: ΣI(entra) = ΣI(sai). É a conservação da carga: nada se acumula no nó.",
        "nivel": 1,
        "tags": [
          "lkc"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-002",
        "frente": "O que diz a Lei de Kirchhoff das Tensões (LKT)?",
        "verso": "Em qualquer malha fechada, a soma algébrica das tensões é zero. Em um circuito simples, a tensão da fonte é igual à soma das quedas de tensão nos resistores.",
        "nivel": 1,
        "tags": [
          "lkt"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-003",
        "frente": "O que é uma associação em série e o que ela mantém igual?",
        "verso": "Elementos em série formam um único caminho. A corrente é a mesma em todos; a tensão da fonte se divide entre eles.",
        "nivel": 1,
        "tags": [
          "serie"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-004",
        "frente": "O que é uma associação em paralelo e o que ela mantém igual?",
        "verso": "Elementos em paralelo ligam-se aos mesmos dois nós. A tensão é a mesma em todos; a corrente total se divide entre os ramos.",
        "nivel": 1,
        "tags": [
          "paralelo"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-005",
        "frente": "Como se calcula a resistência equivalente em série?",
        "verso": "Soma simples: Req = R1 + R2 + ... + Rn. Exemplo: 10 Ω + 22 Ω + 47 Ω = 79 Ω. O valor equivalente é sempre maior que o maior resistor.",
        "nivel": 1,
        "tags": [
          "serie",
          "req"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-006",
        "frente": "Como se calcula a resistência equivalente em paralelo?",
        "verso": "1/Req = 1/R1 + 1/R2 + ... + 1/Rn. O resultado é sempre menor que o menor resistor. Exemplo: 12 Ω, 6 Ω e 4 Ω dão 1/Req = 6/12, ou seja, Req = 2 Ω.",
        "nivel": 1,
        "tags": [
          "paralelo",
          "req"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-007",
        "frente": "Qual é a forma rápida para dois resistores em paralelo?",
        "verso": "Req = (R1·R2)/(R1 + R2): produto sobre soma. Exemplo: 6 Ω e 3 Ω dão 18/9 = 2 Ω. Para n resistores iguais, Req = R/n.",
        "nivel": 1,
        "tags": [
          "paralelo",
          "req"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-008",
        "frente": "Como funciona o divisor de tensão?",
        "verso": "Em série, cada resistor recebe tensão proporcional à sua resistência: Vx = Vs·Rx/Rtotal. O maior resistor fica com a maior parte da tensão.",
        "nivel": 1,
        "tags": [
          "divisor"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-009",
        "frente": "Como funciona o divisor de corrente com dois resistores?",
        "verso": "A corrente em R1 é I1 = I·R2/(R1 + R2). Note que o numerador usa o OUTRO resistor: a maior corrente passa pelo menor resistor.",
        "nivel": 2,
        "tags": [
          "divisor"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-010",
        "frente": "Como calcular a resistência equivalente de um circuito misto?",
        "verso": "Reduza por partes: resolva primeiro os trechos em série ou em paralelo mais internos, redesenhe o circuito e repita até restar um só resistor.",
        "nivel": 2,
        "tags": [
          "mista",
          "req"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-011",
        "frente": "Como aplicar a LKT com os sinais corretos?",
        "verso": "Percorra a malha num sentido. Resistor atravessado no sentido da corrente suposta: −R·I (contra: +R·I). Fonte atravessada de − para +: +V (de + para −: −V). A soma é zero.",
        "nivel": 2,
        "tags": [
          "lkt"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-012",
        "frente": "Qual é o efeito de um curto-circuito e de um circuito aberto?",
        "verso": "Curto: ligação de resistência quase nula; a corrente se concentra nela e o que está em paralelo fica sem corrente. Aberto: resistência infinita; não há corrente no ramo.",
        "nivel": 2,
        "tags": [
          "curto",
          "aberto"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-013",
        "frente": "Como a potência se distribui em um circuito resistivo?",
        "verso": "A potência fornecida pela fonte é igual à soma das potências dissipadas nos resistores: P = P1 + P2 + ... Isso vale em série, em paralelo e em associações mistas.",
        "nivel": 2,
        "tags": [
          "potencia"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-014",
        "frente": "Como funciona a ponte de Wheatstone equilibrada?",
        "verso": "Com R1/R2 = R3/Rx, a tensão entre os dois nós centrais é zero e o galvanômetro não indica corrente. Daí Rx = R2·R3/R1: serve para medir uma resistência desconhecida.",
        "nivel": 2,
        "tags": [
          "ponte"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-015",
        "frente": "O que é um nó, um ramo e uma malha?",
        "verso": "Nó é o ponto onde se unem três ou mais condutores. Ramo é o trecho entre dois nós com a mesma corrente. Malha é um laço que não contém outros laços (laço é qualquer caminho fechado).",
        "nivel": 2,
        "tags": [
          "definicoes"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-016",
        "frente": "Como resolver um circuito de duas malhas?",
        "verso": "Atribua uma corrente a cada malha (mesmo sentido), escreva a LKT em cada uma e resolva as duas equações. No resistor compartilhado, a corrente real é a diferença das correntes de malha.",
        "nivel": 3,
        "tags": [
          "malhas"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-017",
        "frente": "Pontos com a mesma tensão podem ser unidos?",
        "verso": "Sim. Se dois nós têm o mesmo potencial (como na ponte equilibrada), não passa corrente entre eles e um resistor entre eles pode ser removido, ou o fio pode ser colocado, sem alterar o circuito.",
        "nivel": 3,
        "tags": [
          "simplificacao"
        ],
        "ver": null,
        "aConfirmar": null
      },
      {
        "id": "kir-c-018",
        "frente": "Por que a ordem dos resistores em série não altera Req ou I?",
        "verso": "Porque a corrente é a mesma em todos e Req é uma soma. A ordem muda apenas a tensão de cada ponto em relação ao terra, não o valor das quedas de tensão em cada resistor.",
        "nivel": 3,
        "tags": [
          "serie"
        ],
        "ver": null,
        "aConfirmar": null
      }
    ],
    "questoes": [
      {
        "id": "kir-q-001",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Três resistores de 10 Ω, 22 Ω e 47 Ω são ligados em série. Qual é a resistência equivalente?",
        "alternativas": [
          "79 Ω",
          "6,0 Ω",
          "47 Ω",
          "69 Ω"
        ],
        "correta": 0,
        "explicacao": "Em série as resistências se somam: Req = 10 + 22 + 47 = 79 Ω, maior que qualquer um deles.",
        "porQueErrada": [
          null,
          "Usou a fórmula do paralelo em uma associação em série.",
          "Tomou só o maior resistor.",
          "Esqueceu um dos resistores (10 Ω)."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "serie.Req",
          "args": [
            10,
            22,
            47
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "kir-q-002",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Dois resistores de 12 Ω são ligados em paralelo. Qual é a resistência equivalente?",
        "alternativas": [
          "24 Ω",
          "6 Ω",
          "12 Ω",
          "144 Ω"
        ],
        "correta": 1,
        "explicacao": "Req = (12 × 12)/(12 + 12) = 144/24 = 6 Ω. Dois iguais em paralelo dão metade.",
        "porQueErrada": [
          "Somou as resistências como se estivessem em série.",
          null,
          "Tomou um dos valores, sem combinar os ramos.",
          "Fez só o produto, sem dividir pela soma."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "paralelo.Req",
          "args": [
            12,
            12
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "kir-q-003",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Qual é a resistência equivalente de 6 Ω em paralelo com 3 Ω?",
        "alternativas": [
          "2 Ω",
          "4,5 Ω",
          "9 Ω",
          "18 Ω"
        ],
        "correta": 0,
        "embaralhar": false,
        "explicacao": "Req = (6 × 3)/(6 + 3) = 18/9 = 2 Ω, menor que o menor resistor.",
        "porQueErrada": [
          null,
          "Fez a média dos dois valores.",
          "Somou como se fosse série.",
          "Fez só o produto, sem dividir pela soma."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "paralelo.Req",
          "args": [
            6,
            3
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "kir-q-004",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Uma fonte de 12 V alimenta R1 = 1 kΩ em série com R2 = 2 kΩ. Qual é a tensão sobre R2?",
        "alternativas": [
          "4 V",
          "6 V",
          "8 V",
          "24 V"
        ],
        "correta": 2,
        "embaralhar": false,
        "explicacao": "Vx = Vs·R2/(R1 + R2) = 12 × 2000/3000 = 8 V. Confere: 4 V em R1 + 8 V em R2 = 12 V.",
        "porQueErrada": [
          "Calculou a tensão de R1 (a parte do menor resistor).",
          "Dividiu a tensão ao meio, ignorando os valores dos resistores.",
          null,
          "Dividiu pelo valor de R1 em kΩ, em vez de pela soma."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "divisor.Vx",
          "args": [
            12,
            2000,
            3000
          ],
          "unidade": "V",
          "casas": 0
        }
      },
      {
        "id": "kir-q-005",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em um nó entram 5 A e 3 A. Saem 2 A por um ramo e I por outro. Qual é o valor de I?",
        "alternativas": [
          "0 A",
          "4 A",
          "6 A",
          "10 A"
        ],
        "correta": 2,
        "embaralhar": false,
        "explicacao": "LKC: entra 5 + 3 = 8 A; sai 2 + I. Logo I = 8 − 2 = 6 A.",
        "porQueErrada": [
          "Fez 5 − 3 − 2, tratando uma corrente de entrada como de saída.",
          "Dividiu 8 A por 2, sem aplicar a LKC.",
          null,
          "Somou as três correntes conhecidas."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "lkc.Ix",
          "args": [
            5,
            3,
            2
          ],
          "unidade": "A",
          "casas": 0
        }
      },
      {
        "id": "kir-q-006",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Uma fonte de 24 V alimenta 100 Ω, 200 Ω e 300 Ω em série. Qual é a corrente do circuito?",
        "alternativas": [
          "0,04 A",
          "0,12 A",
          "0,24 A",
          "0,44 A"
        ],
        "correta": 0,
        "embaralhar": false,
        "explicacao": "Req = 100 + 200 + 300 = 600 Ω. I = V/Req = 24/600 = 0,04 A.",
        "porQueErrada": [
          null,
          "Usou a resistência média, não a total.",
          "Usou apenas o primeiro resistor.",
          "Usou a resistência do paralelo em um circuito em série."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "serie.I",
          "args": [
            24,
            100,
            200,
            300
          ],
          "unidade": "A",
          "casas": 2
        }
      },
      {
        "id": "kir-q-007",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "R1 = 10 Ω está em série com o paralelo de R2 = 60 Ω e R3 = 30 Ω. Qual é a resistência equivalente?",
        "alternativas": [
          "100 Ω",
          "30 Ω",
          "21 Ω",
          "6,67 Ω",
          "9 Ω"
        ],
        "correta": 1,
        "explicacao": "R2 ∥ R3 = (60 × 30)/90 = 20 Ω. Req = R1 + 20 = 10 + 20 = 30 Ω.",
        "porQueErrada": [
          "Somou os três como se todos estivessem em série.",
          null,
          "Associou R1 e R2 em série e depois pôs R3 em paralelo, trocando a estrutura.",
          "Colocou os três em paralelo.",
          "Pôs R1 em paralelo com R2 + R3, trocando a estrutura."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "mista.Req",
          "args": [
            10,
            60,
            30
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "kir-q-008",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Uma corrente de 9 A chega a dois resistores em paralelo, de 6 Ω e 3 Ω. Qual é a corrente no resistor de 3 Ω?",
        "alternativas": [
          "3 A",
          "4,5 A",
          "27 A",
          "6 A"
        ],
        "correta": 3,
        "explicacao": "I3 = I·R6/(R3 + R6) = 9 × 6/9 = 6 A. No de 6 Ω passam 3 A. A maior corrente vai pelo menor resistor.",
        "porQueErrada": [
          "Calculou a corrente do resistor de 6 Ω.",
          "Dividiu a corrente igualmente entre os ramos.",
          "Multiplicou 9 A pela resistência.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "divisor.Ix",
          "args": [
            9,
            3,
            6
          ],
          "unidade": "A",
          "casas": 0
        }
      },
      {
        "id": "kir-q-009",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Uma fonte de 15 V alimenta 100 Ω, 300 Ω e 600 Ω em série. Qual é a tensão no resistor de 300 Ω?",
        "alternativas": [
          "4,5 V",
          "5,0 V",
          "11,25 V",
          "7,5 V"
        ],
        "correta": 0,
        "explicacao": "Rtotal = 100 + 300 + 600 = 1000 Ω. V300 = 15 × 300/1000 = 4,5 V.",
        "porQueErrada": [
          null,
          "Dividiu a tensão em três partes iguais.",
          "Ignorou o resistor de 600 Ω no total.",
          "Usou 600 Ω como resistência total."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "divisor.Vx",
          "args": [
            15,
            300,
            1000
          ],
          "unidade": "V",
          "casas": 1
        }
      },
      {
        "id": "kir-q-010",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Qual é a resistência equivalente de 12 Ω, 6 Ω e 4 Ω em paralelo?",
        "alternativas": [
          "0,50 Ω",
          "2,00 Ω",
          "7,33 Ω",
          "22,00 Ω"
        ],
        "correta": 1,
        "embaralhar": false,
        "explicacao": "1/Req = 1/12 + 1/6 + 1/4 = (1 + 2 + 3)/12 = 6/12 = 0,5. Req = 1/0,5 = 2,00 Ω.",
        "porQueErrada": [
          "Somou os inversos e esqueceu de inverter o resultado.",
          null,
          "Fez a média aritmética dos valores.",
          "Somou as resistências."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "paralelo.Req",
          "args": [
            12,
            6,
            4
          ],
          "unidade": "Ω",
          "casas": 2
        }
      },
      {
        "id": "kir-q-011",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Quatro resistores de 100 Ω são ligados em paralelo. Qual é a resistência equivalente?",
        "alternativas": [
          "400 Ω",
          "50 Ω",
          "25 Ω",
          "0,04 Ω"
        ],
        "correta": 2,
        "explicacao": "n resistores iguais em paralelo: Req = R/n = 100/4 = 25 Ω.",
        "porQueErrada": [
          "Somou as resistências.",
          "Considerou só dois resistores em paralelo.",
          null,
          "Somou os inversos (4/100) e não inverteu o resultado."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "paralelo.Req",
          "args": [
            100,
            100,
            100,
            100
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "kir-q-012",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Uma fonte de 30 V alimenta R1 = 10 Ω em série com o paralelo de R2 = 60 Ω e R3 = 30 Ω. Qual é a corrente fornecida pela fonte?",
        "alternativas": [
          "0,3 A",
          "4,5 A",
          "3,0 A",
          "1,0 A"
        ],
        "correta": 3,
        "explicacao": "R2 ∥ R3 = 20 Ω, Req = 10 + 20 = 30 Ω. I = 30/30 = 1,0 A.",
        "porQueErrada": [
          "Usou 100 Ω (soma de todos) como resistência total.",
          "Usou os três resistores em paralelo.",
          "Considerou só R1 = 10 Ω.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "mista.Ifonte",
          "args": [
            30,
            10,
            60,
            30
          ],
          "unidade": "A",
          "casas": 1
        }
      },
      {
        "id": "kir-q-013",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Duas fontes, V1 = 12 V (com R1 = 2 Ω) e V2 = 6 V (com R2 = 3 Ω), estão ligadas em paralelo com um resistor comum de R3 = 6 Ω, com os polos positivos do mesmo lado. Qual é a corrente em R3?",
        "alternativas": [
          "1,33 A",
          "1,64 A",
          "1,50 A",
          "0,67 A"
        ],
        "correta": 0,
        "explicacao": "Pelas leis de Kirchhoff, I3 = (V1·R2 + V2·R1)/(R1R2 + R1R3 + R2R3) = (36 + 12)/(6 + 12 + 18) = 48/36 = 1,33 A. A tensão em R3 é 8 V. Com I1 = (12 − 8)/2 = 2 A, a fonte V2 recebe I2 = (6 − 8)/3 = −0,67 A, ou seja, está sendo carregada.",
        "porQueErrada": [
          null,
          "Tratou o circuito como série simples: (V1 + V2)/(R1 + R2 + R3).",
          "Retirou o ramo de V2.",
          "Ignorou a fonte V1."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "malha.I3",
          "args": [
            12,
            6,
            2,
            3,
            6
          ],
          "unidade": "A",
          "casas": 2
        }
      },
      {
        "id": "kir-q-014",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Em uma ponte de Wheatstone equilibrada, R1 = 100 Ω e R2 = 200 Ω formam um ramo, e R3 = 150 Ω e Rx formam o outro, com R1/R2 = R3/Rx. Qual é o valor de Rx?",
        "alternativas": [
          "75 Ω",
          "300 Ω",
          "133,3 Ω",
          "350 Ω"
        ],
        "correta": 1,
        "explicacao": "Equilíbrio: R1/R2 = R3/Rx, logo Rx = R2·R3/R1 = 200 × 150/100 = 300 Ω.",
        "porQueErrada": [
          "Inverteu a proporção: usou R1·R3/R2.",
          null,
          "Trocou R3 por R2 na fórmula: R1·R2/R3.",
          "Somou R2 e R3."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": {
          "fn": "ponte.Rx",
          "args": [
            100,
            200,
            150
          ],
          "unidade": "Ω",
          "casas": 0
        }
      },
      {
        "id": "kir-q-015",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Qual lei afirma que a soma das correntes que entram em um nó é igual à soma das que saem?",
        "alternativas": [
          "Lei de Kirchhoff das Tensões (LKT)",
          "Lei de Ohm",
          "Lei de Kirchhoff das Correntes (LKC)",
          "Lei de Joule"
        ],
        "correta": 2,
        "explicacao": "A LKC expressa a conservação da carga: o que chega a um nó é igual ao que sai.",
        "porQueErrada": [
          "A LKT trata das tensões em uma malha.",
          "A Lei de Ohm relaciona V, I e R em um elemento.",
          null,
          "A Lei de Joule trata do calor dissipado."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-016",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em uma associação em série, qual grandeza é igual em todos os elementos?",
        "alternativas": [
          "A tensão",
          "A potência",
          "A resistência",
          "A corrente"
        ],
        "correta": 3,
        "explicacao": "Em série há um único caminho para a corrente, então todos os elementos são atravessados pela mesma corrente.",
        "porQueErrada": [
          "Em série a tensão se divide.",
          "A potência depende de cada resistor.",
          "Cada elemento pode ter um valor diferente.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-017",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "Em uma associação em paralelo, qual grandeza é igual em todos os ramos?",
        "alternativas": [
          "A tensão",
          "A corrente",
          "A potência",
          "A resistência"
        ],
        "correta": 0,
        "explicacao": "Os ramos em paralelo ligam-se aos mesmos dois nós, e por isso todos recebem a mesma tensão.",
        "porQueErrada": [
          null,
          "Em paralelo a corrente se divide.",
          "A potência depende de cada ramo.",
          "Cada ramo pode ter um valor diferente."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-018",
        "tipo": "multipla",
        "nivel": 1,
        "enunciado": "A resistência equivalente de resistores em paralelo é sempre:",
        "alternativas": [
          "igual à soma das resistências",
          "menor que a menor das resistências",
          "maior que a maior das resistências",
          "igual à média das resistências"
        ],
        "correta": 1,
        "explicacao": "Cada ramo adicional dá mais um caminho à corrente e reduz a resistência total, que fica abaixo da menor.",
        "porQueErrada": [
          "A soma é a regra da série.",
          null,
          "Isso ocorre apenas em série.",
          "Não há média na associação em paralelo."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-019",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Em um conjunto de lâmpadas em série, uma delas queima e todas apagam. Por quê?",
        "alternativas": [
          "A tensão da fonte cai a zero",
          "A corrente passa a ser maior nas demais",
          "O filamento aberto interrompe o único caminho da corrente",
          "A resistência equivalente diminui"
        ],
        "correta": 2,
        "explicacao": "Em série só existe um caminho. Com o filamento aberto, a corrente do circuito é zero e todas as lâmpadas apagam.",
        "porQueErrada": [
          "A fonte continua com a mesma tensão.",
          "Sem caminho fechado a corrente é nula.",
          null,
          "A resistência do circuito aberto tende ao infinito."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-020",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "A soma algébrica das tensões ao longo de uma malha fechada, na LKT, é igual a:",
        "alternativas": [
          "à tensão da fonte",
          "à soma das correntes",
          "ao produto das resistências",
          "zero"
        ],
        "correta": 3,
        "explicacao": "Ao voltar ao ponto de partida, o potencial é o mesmo: elevações e quedas de tensão se anulam, e a soma algébrica é zero.",
        "porQueErrada": [
          "Só se as quedas forem somadas sem sinal; a soma algébrica é zero.",
          "Tensão e corrente não se somam.",
          "Não há relação com o produto dos resistores.",
          null
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-021",
        "tipo": "multipla",
        "nivel": 2,
        "enunciado": "Em um divisor de tensão com dois resistores em série, qual resistor recebe a maior tensão?",
        "alternativas": [
          "O de maior resistência",
          "O de menor resistência",
          "Os dois recebem a mesma tensão",
          "O mais próximo da fonte"
        ],
        "correta": 0,
        "explicacao": "A mesma corrente passa pelos dois, então V = R·I é maior no resistor de maior resistência.",
        "porQueErrada": [
          null,
          "Vx = Vs·Rx/Rtotal: menor Rx dá menor tensão.",
          "Isso só ocorre se os resistores forem iguais.",
          "A posição na série não altera a queda de tensão."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-022",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Em uma ponte de Wheatstone equilibrada, qual é a tensão entre os dois nós centrais?",
        "alternativas": [
          "Igual à tensão da fonte",
          "Zero",
          "A metade da tensão da fonte",
          "Depende apenas de Rx"
        ],
        "correta": 1,
        "explicacao": "No equilíbrio os dois divisores de tensão dão o mesmo potencial aos nós centrais. A diferença entre eles é zero e o galvanômetro não indica corrente.",
        "porQueErrada": [
          "Isso ocorreria com a ponte muito desequilibrada, não equilibrada.",
          null,
          "Seria o valor em cada divisor, mas ambos têm o mesmo valor.",
          "Na ponte equilibrada ela é nula para qualquer valor consistente."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-023",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Um fio de resistência desprezível é ligado em paralelo com um resistor. O que acontece com a corrente?",
        "alternativas": [
          "A corrente se divide igualmente entre os dois",
          "O resistor recebe toda a corrente",
          "Quase toda a corrente passa pelo fio e o resistor fica sem corrente",
          "Nada muda no circuito"
        ],
        "correta": 2,
        "explicacao": "Em paralelo, a corrente se divide na proporção inversa das resistências. Com o fio de resistência quase nula, o resistor praticamente não conduz.",
        "porQueErrada": [
          "A divisão é inversamente proporcional à resistência.",
          "A corrente prefere o caminho de menor resistência.",
          null,
          "O resistor é \"curto-circuitado\"."
        ],
        "ver": null,
        "aConfirmar": null,
        "calc": null
      },
      {
        "id": "kir-q-024",
        "tipo": "multipla",
        "nivel": 3,
        "enunciado": "Dois resistores, 2 Ω e 8 Ω, estão em paralelo. Qual deles recebe a maior corrente?",
        "alternativas": [
          "O de 8 Ω",
          "Os dois igualmente",
          "Depende da fonte, não da resistência",
          "O de 2 Ω"
        ],
        "correta": 3,
        "explicacao": "Com a mesma tensão nos dois, I = V/R: o resistor de menor resistência recebe a maior corrente. Neste caso, 4 vezes maior que a do outro.",
        "porQueErrada": [
          "Ele recebe menos corrente: I = V/R com mesma V.",
          "Só ocorreria com resistências iguais.",
          "A divisão da corrente depende das resistências.",
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
