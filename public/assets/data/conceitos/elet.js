/* data/conceitos/elet.js - blocos "Entenda o conceito" do modulo Eletricidade (public/elet.html).
 * Script classico, sem fetch (funciona em file://). Registra em window.EO.conceitos e monta todo
 * <div data-eo-conceito="ID"></div> da pagina. So texto didatico: nenhum calculo e alterado.
 * Matematica em MathJax inline: \( ... \) (o MathJax ja esta carregado na pagina). */
(function (root) {
  'use strict';
  var EO = root.EO = root.EO || {};
  var T = {};
  var R = String.raw;

  T.rl = {
    titulo: 'Circuito RL: o indutor em corrente alternada',
    oque: [
      R`O indutor é uma bobina. Ele guarda energia no **campo magnético**: \( W = \tfrac{1}{2} L I^2 \). Quanto maior a corrente, mais energia fica guardada.`,
      R`Importa porque quase toda carga que tem bobina (motor, transformador, reator, contator) se comporta como um RL. Entender o RL é entender por que a corrente de um motor "atrasa" e por que existe potência reativa.`
    ],
    fisico: [
      R`**O indutor se opõe a variações de corrente.** A tensão nele é \( v = L\,\dfrac{di}{dt} \): só aparece tensão se a corrente muda. Em corrente contínua estável, o indutor ideal age como um fio.`,
      R`**Em CA vira reatância.** Como a corrente muda o tempo todo, a oposição existe sempre: \( X_L = 2\pi f L \). Ela **cresce com a frequência**. Mais rápido, mais oposição.`,
      R`**Defasagem.** No indutor puro, a corrente **atrasa 90°** da tensão. Com resistência em série, o atraso fica entre 0° e 90°: \( \tan\varphi = X_L / R \).`,
      R`**Energia que vai e volta.** Em um quarto do ciclo o indutor recebe energia da fonte e guarda no campo. No quarto seguinte devolve. Essa troca é a **potência reativa** \( Q = I^2 X_L \). Não vira calor nem trabalho, mas a corrente que a carrega passa pelos cabos e aquece, e por isso aumenta a corrente total.`,
      R`**Impedância.** R e \( X_L \) estão a 90° entre si e se combinam como catetos: \( Z = \sqrt{R^2 + X_L^2} \). Nunca some os dois diretamente.`
    ],
    dia: [
      R`**Motor de indução e reator de lâmpada fluorescente (eletromagnético):** têm bobinas, então puxam corrente atrasada e potência reativa. Por isso o fator de potência deles é menor que 1.`,
      R`**Bobina de contator ou relé:** a corrente sobe devagar porque o indutor resiste à variação. Um motor real não é um RL ideal, mas o modelo explica o comportamento principal.`
    ],
    erros: [
      R`Somar \( R + X_L \) como números comuns. O correto é Pitágoras.`,
      R`Usar L em mH direto na fórmula. É preciso converter para henry (dividir por 1000).`,
      R`Dizer que a corrente "adianta" no indutor. No indutor ela **atrasa**.`,
      R`Achar que a potência reativa é perda. Ela não é energia consumida, é energia que circula; o problema é a corrente extra.`
    ],
    calc: [
      R`Aumente **f** (de 50 para 500 Hz): \( X_L \) multiplica por 10, a impedância cresce, a corrente cai e o ângulo se aproxima de 90°.`,
      R`Reduza **R** mantendo L: o ângulo aumenta e o fator de potência cai. A carga fica "mais indutiva".`,
      R`Leve **L** ao mínimo: \( X_L \) some, \( \varphi \to 0 \) e o circuito vira só um resistor.`
    ]
  };

  T.rc = {
    titulo: 'Circuito RC: o capacitor em corrente alternada',
    oque: [
      R`O capacitor são duas placas separadas por um isolante. Ele guarda energia no **campo elétrico**: \( W = \tfrac{1}{2} C V^2 \). Quanto maior a tensão, mais energia fica guardada.`,
      R`Importa porque o RC aparece em filtros, fontes, temporização e correção de fator de potência. É o "oposto" do indutor e os dois se complementam.`
    ],
    fisico: [
      R`**O capacitor se opõe a variações de tensão.** A corrente nele é \( i = C\,\dfrac{dv}{dt} \): só passa corrente se a tensão muda. Em CC, depois de carregado, ele age como circuito aberto.`,
      R`**Em CA vira reatância.** \( X_C = \dfrac{1}{2\pi f C} \) **diminui com a frequência**. Em frequência alta o capacitor deixa a corrente passar com facilidade; em frequência baixa, bloqueia.`,
      R`**Defasagem.** No capacitor puro, a corrente **adianta 90°** da tensão. Com R em série, o adiantamento fica entre 0° e 90°. Por isso a calculadora mostra o ângulo negativo para a tensão em relação à corrente.`,
      R`**Energia que vai e volta.** O capacitor carrega e descarrega a cada ciclo, trocando energia com a fonte. Esse reativo é de sinal oposto ao do indutor, e é por isso que um capacitor pode compensar um motor.`,
      R`**Frequência de corte.** A calculadora mostra \( f_c = \dfrac{1}{2\pi R C} \): é onde \( X_C = R \). Abaixo dela o capacitor domina; acima, o resistor domina.`
    ],
    dia: [
      R`**Fonte chaveada:** capacitores de filtro alisam a tensão retificada, guardando energia entre os picos.`,
      R`**Filtro passa-baixa:** o capacitor desvia as frequências altas (ruído) e deixa passar as baixas.`,
      R`**Banco de capacitores e partida de motor monofásico:** o capacitor fornece corrente adiantada, que compensa a atrasada das bobinas ou ajuda a criar o campo girante.`
    ],
    erros: [
      R`Usar µF como se fosse F. Os 100 µF valem \( 100 \times 10^{-6} \) F.`,
      R`Achar que \( X_C \) cresce com a frequência. Ele **diminui**.`,
      R`Esquecer que um capacitor carregado guarda energia e pode dar choque depois de desligar. Descarregue antes de mexer.`
    ],
    calc: [
      R`Aumente **f**: \( X_C \) cai, \( Z \) se aproxima de R e o ângulo se aproxima de 0°.`,
      R`Aumente **C**: \( X_C \) cai do mesmo jeito. Diminua C ao mínimo e o ângulo vai para perto de −90°, com o capacitor dominando.`,
      R`Observe a frequência de corte \( f_c \) ao mudar R e C: ela sobe se qualquer um deles diminuir.`
    ]
  };

  T.rlc = {
    titulo: 'Circuito RLC série e ressonância',
    oque: [
      R`O RLC série junta resistor, indutor e capacitor. O indutor e o capacitor armazenam energia de formas diferentes e **se compensam**.`,
      R`Importa porque explica a ressonância: sintonia de rádio, filtros e também o risco de sobretensões em instalações com bancos de capacitores.`
    ],
    fisico: [
      R`**Reatâncias de sinais opostos.** O indutor adianta a tensão (\( +X_L \)); o capacitor atrasa (\( -X_C \)). A reatância total é \( X = X_L - X_C \), e a impedância é \( Z = \sqrt{R^2 + X^2} \).`,
      R`**Ressonância.** Quando \( X_L = X_C \), as duas se cancelam e sobra só R. A frequência é \( f_0 = \dfrac{1}{2\pi\sqrt{LC}} \). Nesse ponto \( Z = R \) é mínima, a corrente é máxima e o fator de potência é 1.`,
      R`**Energia trocada entre L e C.** Na ressonância a energia oscila entre o campo magnético do indutor e o campo elétrico do capacitor. A fonte só repõe o que o resistor dissipa.`,
      R`**Tensões maiores que a da fonte.** Em ressonância, \( V_L \) e \( V_C \) podem ser maiores que a tensão da fonte, pois se cancelam entre si. Quanto menor R, mais agudo o pico (maior fator de qualidade \( Q = X_L / R \)).`,
      R`**Abaixo de \( f_0 \)** o circuito é capacitivo (corrente adiantada); **acima**, indutivo (corrente atrasada).`
    ],
    dia: [
      R`**Sintonia de rádio:** gira-se o capacitor variável para colocar \( f_0 \) na estação desejada.`,
      R`**Banco de capacitores na rede:** o capacitor pode entrar em ressonância com a indutância do transformador e das cargas, causando sobretensão e corrente excessiva. Em instalações com muitos conversores, isso exige cuidado de projeto.`,
      R`**Filtros:** o RLC seleciona ou bloqueia uma faixa de frequências.`
    ],
    erros: [
      R`Achar que a corrente fica infinita na ressonância. O resistor a limita: \( I = V/R \).`,
      R`Confundir ressonância **série** (impedância mínima) com **paralela** (impedância máxima).`,
      R`Esquecer que \( V_L \) e \( V_C \) individuais podem passar da tensão da fonte.`
    ],
    calc: [
      R`Ajuste **f operação** até chegar à frequência de ressonância mostrada. O ângulo vai a 0° e a corrente atinge o pico.`,
      R`Diminua **R**: a curva fica mais alta e mais estreita. Aumente **R**: ela achata.`,
      R`Aumente **L** ou **C**: \( f_0 \) cai. Confira no gráfico a curva deslocando.`
    ]
  };

  T.fasores = {
    titulo: 'Fasores e soma de tensões',
    oque: [
      R`Um fasor é uma "fotografia" de uma grandeza senoidal: um vetor com **módulo** (tamanho da onda) e **ângulo** (posição no ciclo). Ele troca a onda inteira por uma seta.`,
      R`Importa porque somar senoides ponto a ponto é trabalhoso. Somando as setas, o problema vira geometria.`
    ],
    fisico: [
      R`**A onda como projeção.** Imagine a seta girando à velocidade \( \omega \). Sua sombra no eixo vertical desenha a senoide \( v(t) = V_m \cos(\omega t + \theta) \). O fasor congela esse giro em \( t = 0 \).`,
      R`**Num circuito série a corrente é a mesma em todos.** Ela é a referência. A tensão no resistor está **em fase** com ela, a do indutor **90° adiantada** e a do capacitor **90° atrasada**.`,
      R`**A soma é vetorial.** \( V = \sqrt{V_R^2 + (V_L - V_C)^2} \). As tensões do indutor e do capacitor apontam em sentidos opostos e se subtraem.`,
      R`**Só vale** para grandezas de **mesma frequência** em regime permanente.`
    ],
    dia: [
      R`Medir com multímetro \( V_R \), \( V_L \) e \( V_C \) em um circuito série e perceber que a soma aritmética é **maior** que a tensão da fonte. Isso não é erro de medição: é a soma vetorial.`,
      R`Diagnóstico de motores e reatores: comparar tensão e corrente em ângulo ajuda a ver se a carga é indutiva ou capacitiva.`
    ],
    erros: [
      R`Somar os módulos das tensões como se fossem números comuns.`,
      R`Misturar valor de pico com valor eficaz na mesma conta.`,
      R`Esquecer que o capacitor aponta para baixo (−90°) e o indutor para cima (+90°).`
    ],
    calc: [
      R`Coloque \( V_L = V_C \): elas se cancelam, e a tensão total fica igual a \( V_R \).`,
      R`Aumente só \( V_L \): o fasor total gira para cima e o ângulo cresce; o circuito fica indutivo.`,
      R`Aumente só \( V_C \): o total gira para baixo; o circuito fica capacitivo. Veja o triângulo de impedâncias acompanhar.`
    ]
  };

  T.trifasico = {
    titulo: 'Sistemas trifásicos',
    oque: [
      R`Um sistema trifásico tem **três tensões senoidais de mesma amplitude, defasadas 120° entre si**. Por isso, em cargas equilibradas, a soma instantânea das três é zero.`,
      R`Importa porque gera, transporta e distribui energia com menos cobre e potência mais constante que o monofásico. Motores industriais usam esse sistema.`
    ],
    fisico: [
      R`**Tensão de fase e de linha.** A tensão de fase é entre fase e neutro. A de linha é entre duas fases. Na ligação em **estrela**: \( V_L = \sqrt{3}\,V_f \) e \( I_L = I_f \).`,
      R`**No triângulo (delta):** \( V_L = V_f \) e \( I_L = \sqrt{3}\,I_f \). Esse \( \sqrt{3} \) vem da soma vetorial de grandezas defasadas 120°.`,
      R`**Potência.** \( P = \sqrt{3}\,V_L I_L \cos\varphi \) usando valores de linha, ou \( 3\,V_f I_f \cos\varphi \) por fase. O \( \cos\varphi \) é o mesmo fator de potência.`,
      R`**Neutro.** Com cargas iguais nas três fases, a corrente de neutro é praticamente nula. Se as cargas diferem, o neutro conduz o desequilíbrio.`,
      R`**Nesta calculadora** cada fase tem sua carga RLC e fica ligada à tensão de fase. Por isso ela mostra corrente, P, Q e S por fase e o total.`
    ],
    dia: [
      R`**Redes 127/220 V e 220/380 V:** o primeiro valor é a tensão de fase, o segundo a de linha (\( 127 \times \sqrt{3} \approx 220 \)).`,
      R`**Motor trifásico:** o campo girante nasce da defasagem de 120° entre as fases, sem precisar de capacitor de partida.`,
      R`**Distribuição:** o alimentador trifásico leva mais potência com a mesma corrente por condutor.`
    ],
    erros: [
      R`Usar tensão de linha onde a conta pede tensão de fase, ou o contrário.`,
      R`Esquecer o \( \sqrt{3} \) na potência, ou aplicá-lo junto com valores de fase.`,
      R`Achar que o neutro nunca leva corrente. Em cargas desequilibradas ou com harmônicas ele leva.`
    ],
    calc: [
      R`Deixe **R, L e C iguais nas três fases**: as potências por fase ficam iguais e a carga é equilibrada.`,
      R`Mude só uma fase (por exemplo \( R_A \)) e veja corrente e potência diferirem: é um desequilíbrio.`,
      R`Acrescente **L** nas fases: Q sobe e o fator de potência cai. Acrescente **C** e Q reduz.`
    ]
  };

  T.ydelta = {
    titulo: 'Equivalência estrela e triângulo (Y e Δ)',
    oque: [
      R`Uma rede de três terminais pode ser ligada em **estrela** (Y) ou em **triângulo** (Δ). As duas são **equivalentes** quando, vistas pelos três terminais, se comportam do mesmo jeito.`,
      R`Importa porque redes que não são nem série nem paralelo ficam simples depois da troca. Também ajuda a entender a ligação de motores e transformadores.`
    ],
    fisico: [
      R`**Equivalência só nos terminais.** As tensões e correntes **externas** são iguais. Por dentro, as correntes e tensões de cada resistor são diferentes.`,
      R`**Regra da estrela para o triângulo.** Cada resistor do triângulo é a soma dos produtos dois a dois, dividida pelo resistor da estrela no **nó oposto** ao lado.`,
      R`**Caso equilibrado.** Se os três resistores são iguais, \( R_\Delta = 3\,R_Y \). O triângulo equivalente tem resistores maiores.`,
      R`**Se um resistor for zero** na estrela, o resistor correspondente do triângulo tende ao infinito (circuito aberto).`
    ],
    dia: [
      R`**Ponte de resistores desbalanceada:** trocar um Y por um Δ (ou o contrário) deixa o circuito em série e paralelo, e aí as contas são diretas.`,
      R`**Partida estrela-triângulo de motor:** o motor parte em estrela, com a tensão em cada enrolamento reduzida por \( \sqrt{3} \), e depois passa para triângulo. Aqui é a ligação dos enrolamentos, e não a troca de resistores equivalentes.`
    ],
    erros: [
      R`Associar o resistor ao par de nós errado. É o erro mais comum.`,
      R`Usar a transformação em redes que não têm exatamente três terminais.`,
      R`Achar que as correntes dentro do triângulo são as mesmas da estrela. Só as externas são.`
    ],
    calc: [
      R`Digite \( R_1 = R_2 = R_3 = 10\ \Omega \) em Y para Δ: o resultado é 30 Ω em cada.`,
      R`Volte com 30, 30, 30 em Δ para Y: o resultado é 10 Ω. A ida e a volta se fecham.`,
      R`Coloque um resistor bem pequeno na estrela: o resistor equivalente do triângulo cresce muito.`
    ]
  };

  T.complexos = {
    titulo: 'Números complexos e impedância',
    oque: [
      R`Um número complexo tem duas partes: \( Z = R + jX \). A parte real é a resistência, que dissipa energia. A parte imaginária é a reatância, que guarda e devolve.`,
      R`Importa porque a impedância reúne módulo e ângulo em um só número. Com ela, a lei de Ohm vale em CA: \( V = Z\,I \).`
    ],
    fisico: [
      R`**Cada elemento tem seu "lugar" no plano.** Resistor: \( R \) (eixo real). Indutor: \( +jX_L \) (para cima, corrente atrasa). Capacitor: \( -jX_C \) (para baixo, corrente adianta).`,
      R`**Duas formas.** Retangular \( a + jb \) e polar \( |Z|\angle\varphi \). Com \( |Z| = \sqrt{a^2+b^2} \) e \( \varphi = \operatorname{atan2}(b,a) \).`,
      R`**Qual usar.** Para **somar e subtrair**, use a forma retangular. Para **multiplicar e dividir**, a polar (multiplica módulos, soma ângulos).`,
      R`**Série:** \( Z = Z_1 + Z_2 \). **Paralelo:** \( Z = \dfrac{Z_1 Z_2}{Z_1 + Z_2} \).`,
      R`Usa-se \( j \) e não \( i \) porque \( i \) já é a corrente.`
    ],
    dia: [
      R`Calcular a impedância total de um motor mais o cabo que o alimenta.`,
      R`Achar a impedância equivalente de uma carga com várias ramificações para saber a corrente total.`
    ],
    erros: [
      R`Somar duas impedâncias na forma polar, somando módulos e ângulos. Só vale para multiplicar.`,
      R`Calcular o ângulo com \( \arctan(b/a) \) sem olhar o quadrante. Use atan2.`,
      R`Trocar o sinal da reatância do capacitor (ele é negativo).`
    ],
    calc: [
      R`Digite \( 3 + j4 \): o módulo é 5 e o ângulo é cerca de 53,1°. Confira na forma polar.`,
      R`Troque o sinal da parte imaginária e veja o ângulo ficar negativo (carga capacitiva).`,
      R`Coloque duas impedâncias iguais: a série dobra, o paralelo cai pela metade.`
    ]
  };

  T.cfp = {
    titulo: 'Fator de potência e sua correção',
    oque: [
      R`O fator de potência mede quanto da potência que circula é **realmente útil**: \( \mathrm{fp} = \dfrac{P}{S} = \cos\varphi \). Vai de 0 a 1.`,
      R`Importa porque um fp baixo exige mais corrente para entregar o mesmo trabalho. Isso pesa em cabos, transformadores, perdas e, em muitos contratos, na conta de energia.`
    ],
    fisico: [
      R`**Triângulo de potências.** \( S^2 = P^2 + Q^2 \). **P** (kW) é a potência ativa, a do trabalho útil. **Q** (kvar) é a reativa, que alimenta o campo magnético. **S** (kVA) é a aparente, o que a rede precisa fornecer.`,
      R`**Por que a corrente sobe.** A corrente depende de S, não só de P: \( I = S / V \) (monofásico). Com a mesma P, menor fp significa maior S e maior I.`,
      R`**Como se corrige.** Cargas indutivas consomem Q. Um capacitor fornece Q de sinal oposto, **perto da carga**. A rede passa a entregar menos reativo. A potência do banco é \( Q_c = P\,(\tan\varphi_1 - \tan\varphi_2) \).`,
      R`**Efeitos.** Menos corrente na rede: menos perda (\( I^2 R \)), menos queda de tensão, cabos e transformador com folga. A **energia ativa (kWh) não diminui**.`,
      R`**Conta de energia.** Consumidores com medição de reativo podem pagar cobrança por fp baixo. O limite mínimo da concessionária é de 0,92 (a confirmar na regulamentação vigente e no contrato).`
    ],
    dia: [
      R`**Indústria com muitos motores:** o fp costuma ficar baixo. Instala-se um banco de capacitores, muitas vezes automático, que liga e desliga estágios conforme a carga.`,
      R`**Exemplo numérico:** carga de 100 kW com fp 0,70, corrigida para 0,95. \( \tan\varphi_1 = 1{,}020 \), \( \tan\varphi_2 = 0{,}329 \). \( Q_c = 100\,(1{,}020 - 0{,}329) \approx 69 \) kvar.`
    ],
    erros: [
      R`Achar que corrigir o fp reduz o consumo em kWh. Reduz a corrente, não a energia ativa.`,
      R`Confundir kW, kVA e kvar.`,
      R`Corrigir demais: o circuito fica capacitivo, o que também é ruim.`,
      R`Ignorar harmônicas: capacitores podem entrar em ressonância com a rede. Em cargas com muitos conversores, isso pede cuidado de projeto.`
    ],
    calc: [
      R`Mantenha P e aumente o **fp desejado**: a potência do capacitor cresce, e a corrente final cai.`,
      R`Troque **monofásico** por **trifásico** e veja como a corrente muda com o \( \sqrt{3} \).`,
      R`Escolha um fp atual já alto (0,98): o banco necessário fica pequeno. Compare com 0,60.`
    ]
  };

  T.calc = {
    titulo: 'Calculadoras: como usar bem',
    oque: [
      R`Esta página reúne ferramentas rápidas: **impedância**, **triângulo de potências**, **correção de fp**, **conversões** (polar, retangular e unidades) e **ressonância**.`,
      R`Elas servem para conferir contas e testar valores, depois de entender o conceito nas outras abas.`
    ],
    fisico: [
      R`**Impedância:** combina R, L e C na frequência escolhida: \( X_L = 2\pi f L \) e \( X_C = 1/(2\pi f C) \).`,
      R`**Potências:** \( S = \sqrt{P^2 + Q^2} \) e \( \mathrm{fp} = P/S \). Dados dois, os demais saem.`,
      R`**Frequência angular:** \( \omega = 2\pi f \), em rad/s. Para motores, 60 Hz correspondem a 3600 rpm por par de polos (velocidade síncrona do campo, e não do eixo real).`,
      R`**Ressonância:** \( f_0 = 1/(2\pi\sqrt{LC}) \), onde \( X_L = X_C \).`
    ],
    dia: [
      R`Estimar a corrente de uma carga indutiva antes de escolher o cabo.`,
      R`Descobrir o capacitor que falta para a lâmpada ou o motor chegar a um fp melhor.`
    ],
    erros: [
      R`**Unidades:** mH, µF, nF, kHz e rad/s trocados são a fonte nº 1 de erro. Confira o campo.`,
      R`Usar a calculadora como resposta final sem avaliar se o resultado é plausível.`,
      R`Esquecer que a calculadora usa o modelo ideal (sem perdas no indutor, sem resistência do capacitor).`
    ],
    calc: [
      R`Teste cada bloco com um caso que você já sabe: \( R = 100\ \Omega \), \( L = 100\ \mathrm{mH} \), 50 Hz.`,
      R`Compare o resultado da calculadora de ressonância com o da aba RLC.`,
      R`Converta uma frequência de Hz para rad/s e volte para checar o fator \( 2\pi \).`
    ]
  };

  /* ---------- renderizacao ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); } // so negrito; o TeX \( \) passa intacto
  function lista(cls, itens) {
    return '<ul class="' + cls + '">' + itens.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</ul>';
  }
  function bloco(h, corpo) { return '<section class="eo-conceito__sec"><h3 class="eo-conceito__h">' + h + '</h3>' + corpo + '</section>'; }

  function html(id, d) {
    return '<details class="eo-conceito__det" open>' +
      '<summary class="eo-conceito__sum"><span class="eo-conceito__tag">Entenda o conceito</span>' +
      '<span class="eo-conceito__titulo">' + esc(d.titulo) + '</span></summary>' +
      '<div class="eo-conceito__corpo">' +
      bloco('O que é e por que importa', d.oque.map(function (t) { return '<p>' + inline(t) + '</p>'; }).join('')) +
      bloco('Comportamento físico', lista('eo-conceito__lista', d.fisico)) +
      bloco('Exemplo do dia a dia', lista('eo-conceito__lista', d.dia)) +
      bloco('Erros comuns', lista('eo-conceito__lista eo-conceito__lista--erro', d.erros)) +
      bloco('Teste na calculadora desta página', lista('eo-conceito__lista eo-conceito__lista--calc', d.calc)) +
      '</div></details>';
  }

  function typeset(nos, tentativa) {
    var M = root.MathJax;
    if (M && M.typesetPromise) {
      var pronto = (M.startup && M.startup.promise) || Promise.resolve();
      pronto.then(function () { return M.typesetPromise(nos); }).catch(function () { /* ignora */ });
    } else if ((tentativa || 0) < 80) {
      setTimeout(function () { typeset(nos, (tentativa || 0) + 1); }, 250);
    }
  }

  function mountAll(escopo) {
    var ns = (escopo || document).querySelectorAll('[data-eo-conceito]'), feitos = [];
    for (var i = 0; i < ns.length; i++) {
      var id = ns[i].getAttribute('data-eo-conceito'), d = T[id];
      if (!d || ns[i].getAttribute('data-eo-montado')) continue;
      ns[i].className = (ns[i].className ? ns[i].className + ' ' : '') + 'eo-conceito';
      ns[i].setAttribute('data-eo-montado', '1');
      ns[i].innerHTML = html(id, d);
      feitos.push(ns[i]);
    }
    if (feitos.length) typeset(feitos, 0);
    return feitos.length;
  }

  EO.conceitos = { __v: 1, dados: T, mountAll: mountAll, ids: Object.keys(T) };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); }, { once: true });
    else mountAll();
  }
})(typeof window !== 'undefined' ? window : this);
