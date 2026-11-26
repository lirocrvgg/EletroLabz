/* render/symbols.js - biblioteca unica de simbolos do Aciona (Acionamentos v2, etapa E1).
 *
 * Desenho IEC vertical de comando por reles e contatores (IEC 60617, edicao a confirmar). A geometria (caixa e portas)
 * dos 33 ids existentes e IDENTICA a SYMBOL_DEFS; so o desenho mudou. O desenho anterior fica em render/symbols-legado.js
 * (oraculo congelado, nao carregado pela pagina) e pode ser pedido com opts.estilo = 'legado'.
 *
 * API
 *   list() / listAll()      [{id, nome, norma, w, h, portas:[{x,y}]}]  (list = 29 ids; listAll = 45 (inclui os 12 simbolos P2/P3); w/h em celulas; portas em fracao)
 *   catalog()               [{id, nome, categoria, letra, letraConfirmada:false, norma, w, h, terminais:[{n,x,y,fn?,fixo?}],
 *                             descricao, confirmar:[...]}]   x/y dos terminais em CELULAS da grade (fracao * w ou h)
 *   get(id)                 uma entrada do catalogo (copia) ou null
 *   categorias()            [{nome, ids:[...]}] na ordem de exibicao (so categorias com itens)
 *   xform(u,v,w,h,rot,flip) pura: px locais da caixa w x h sem rotacao -> {x,y} dentro da caixa girada
 *                           (espelho u->w-u primeiro; depois rotacao horaria: 90 (h-v,u); 180 (w-u,h-v); 270 (v,w-u))
 *   terminalPoints(id,rot,flip)  [{n,x,y,fn?,fixo?}] em px (GRID por celula) ja transformados
 *   applyGeometry(defs)     escreve w/h/ports/terminals em SYMBOL_DEFS (nao altera outros campos); devolve quantos ids tocou
 *   draw(ctx,id,box,opts)   box = {x,y,w,h,cx?}: x/y = canto da caixa GIRADA; w/h = dimensoes SEM rotacao.
 *   toSVG(id,{estado,energizado,falha,rotulo,size,rot,flip,numeracao,seq,motor,corLampada,tempo})
 *   hydrate(root)           preenche <svg data-eo-symbol="id" [data-eo-estado|-energizado|-falha|-rotulo|-rot|-flip|-numeracao]>
 *   ladder.contact/output   reservado (lanca "nao implementado")
 *
 * opts de draw (as mesmas que diagram-canvas.js passa hoje):
 *   color, colors {color,l1,l2,l3,n,bg,fault,energizedFill,amber,lamp:{red,amber,blue,white,green}} (tokens resolvidos pelo chamador),
 *   running, coilOn, forceState ('', 'open', 'closed'), pressed, selected, fault, energized, lampColor, time, timerAcc,
 *   timerClosed, motor {estado, sequencia}, label.
 * Novas opcoes:
 *   rot (0/90/180/270 horario), flip (espelho horizontal), estilo ('iec' padrao | 'legado'),
 *   terminais (true = todos os bornes numerados; false = nenhum; indefinido = so A1/A2, U/V/W... como antes;
 *     array de rotulos por porta, ex. ['13','14'] = desenha exatamente esses rotulos; vazio/null = sem rotulo na porta),
 *   latched (emergencia travada: contato aberto, cogumelo rebaixado),
 *   seq (1..9, digito de sequencia dos contatos), fontFamily (padrao: token --font-mono, senao monospace).
 * O texto nunca e girado: so a posicao acompanha a rotacao. Nenhuma cor literal: so as passadas em opts (ou currentColor). */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.render = EO.render || {};

  var GRID = 20;
  var NORMA = 'IEC 60617 (a confirmar)';
  var NORMA_CAT = 'IEC 60617 (edição a confirmar)';
  var LW = 1.75;
  var P2 = [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }];
  var P3 = [{ x: 0.25, y: 0 }, { x: 0.5, y: 0 }, { x: 0.75, y: 0 }];
  var P1 = [{ x: 0.5, y: 0 }];

  /* Copia dos dados geometricos de SYMBOL_DEFS (legacy/aciona.js). Ordem e valores preservados. */
  var DEFS = {
    power_l1: { nome: 'Fase L1', w: 2, h: 2, portas: P2, tipo: 'source' },
    power_l2: { nome: 'Fase L2', w: 2, h: 2, portas: P2, tipo: 'source' },
    power_l3: { nome: 'Fase L3', w: 2, h: 2, portas: P2, tipo: 'source' },
    power_n: { nome: 'Neutro N', w: 2, h: 2, portas: P2, tipo: 'source_n' },
    contact_no: { nome: 'Contato NA', w: 2, h: 3, portas: P2, tipo: 'contact' },
    contact_nc: { nome: 'Contato NF', w: 2, h: 3, portas: P2, tipo: 'contact' },
    contact_timer_on_no: { nome: 'NA ret. energ.', w: 2, h: 3, portas: P2, tipo: 'timer_contact' },
    contact_timer_on_nc: { nome: 'NF ret. energ.', w: 2, h: 3, portas: P2, tipo: 'timer_contact' },
    contact_timer_off_no: { nome: 'NA ret. desener.', w: 2, h: 3, portas: P2, tipo: 'timer_contact' },
    contact_timer_off_nc: { nome: 'NF ret. desener.', w: 2, h: 3, portas: P2, tipo: 'timer_contact' },
    contact_phase_loss_no: { nome: 'NA Falta Fase', w: 2, h: 3, portas: P2, tipo: 'contact_phase' },
    contact_phase_loss_nc: { nome: 'NF Falta Fase', w: 2, h: 3, portas: P2, tipo: 'contact_phase' },
    contact_phase_seq_no: { nome: 'NA Seq. Fase', w: 2, h: 3, portas: P2, tipo: 'contact_phase' },
    contact_phase_seq_nc: { nome: 'NF Seq. Fase', w: 2, h: 3, portas: P2, tipo: 'contact_phase' },
    pushbutton_no: { nome: 'Botoeira NA', w: 2, h: 3, portas: P2, tipo: 'pushbutton' },
    pushbutton_nc: { nome: 'Botoeira NF', w: 2, h: 3, portas: P2, tipo: 'pushbutton_nc' },
    limit_switch_no: { nome: 'FC NA', w: 2, h: 3, portas: P2, tipo: 'contact' },
    selector_2pos: { nome: 'Seletora', w: 2, h: 3, portas: P2, tipo: 'selector' },
    coil: { nome: 'Bobina', w: 2, h: 3, portas: P2, tipo: 'coil' },
    relay_phase_loss: { nome: 'Relé Falta Fase', w: 2, h: 3, portas: P3, tipo: 'monitoring' },
    relay_phase_seq: { nome: 'Relé Seq. Fase', w: 2, h: 3, portas: P3, tipo: 'monitoring' },
    timer_relay: { nome: 'Bobina temp.', w: 2, h: 3, portas: P2, tipo: 'coil' },
    timer_relay_off: { nome: 'Bobina temp. desl.', w: 2, h: 3, portas: P2, tipo: 'coil' },
    overload_relay: { nome: 'Relé térmico', w: 2, h: 3, portas: P2, tipo: 'overload' },
    fuse: { nome: 'Fusível', w: 2, h: 3, portas: P2, tipo: 'passive' },
    circuit_breaker: { nome: 'Disjuntor', w: 2, h: 3, portas: P2, tipo: 'breaker' },
    lamp: { nome: 'Lâmpada', w: 2, h: 3, portas: P2, tipo: 'lamp' },
    motor_3ph: { nome: 'Motor 3~', w: 3, h: 4, portas: P2, tipo: 'motor' },
    ground: { nome: 'Terra', w: 2, h: 2, portas: P1, tipo: 'sink' }
  };
  var IDS = Object.keys(DEFS);

  /* Simbolos da etapa 4.4 (geometria/portas = sim/defs-extra.js). Ficam fora de list() por padrao (29 ids do legado). */
  var T3 = [{ x: 0.2, y: 0 }, { x: 0.5, y: 0 }, { x: 0.8, y: 0 }];
  var B3 = [{ x: 0.2, y: 1 }, { x: 0.5, y: 1 }, { x: 0.8, y: 1 }];
  var EXTRA = {
    contactor_main_3p: { nome: 'Contator 3P', w: 4, h: 3, portas: T3.concat(B3), tipo: 'contact_power' },
    motor_3ph_6t: { nome: 'Motor 3~ 6T', w: 4, h: 4, portas: T3.concat(B3), tipo: 'motor3' },
    motor_3ph_3t: { nome: 'Motor 3~ 3T', w: 4, h: 4, portas: T3.slice(), tipo: 'motor3' },
    junction: { nome: 'Junção', w: 1, h: 1, portas: [{ x: 0.5, y: 0.5 }], tipo: 'junction' }
  };
  var EXTRA_IDS = Object.keys(EXTRA);
  EXTRA_IDS.forEach(function (k) { DEFS[k] = EXTRA[k]; });

  /* Simbolos P2/P3 (tabela 1.2 do plano): so entram em listAll()/catalog(); list() segue com os 29 ids do legado. */
  var S5 = [1, 2, 3, 4, 5].map(function (i) { return { x: i / 6, y: 1 }; });
  var NOVOS = {
    power_24v: { nome: '+24 V', w: 2, h: 2, portas: P2, tipo: 'source' },
    power_0v: { nome: '0 V', w: 2, h: 2, portas: P2, tipo: 'source' },
    supply_3ph: { nome: 'Alimentação 3~+N+PE', w: 6, h: 2, portas: S5, tipo: 'source' },
    motor_breaker_3p: { nome: 'Disjuntor-motor 3P', w: 4, h: 3, portas: T3.concat(B3), tipo: 'breaker_motor' },
    breaker_aux_no: { nome: 'Aux. do disjuntor-motor', w: 2, h: 3, portas: P2, tipo: 'contact' },
    overload_3p: { nome: 'Térmico (potência)', w: 4, h: 3, portas: T3.concat(B3), tipo: 'overload_power' },
    overload_no: { nome: 'Térmico NA', w: 2, h: 3, portas: P2, tipo: 'overload' },
    emergency_stop_nc: { nome: 'Emergência com retenção', w: 2, h: 3, portas: P2, tipo: 'pushbutton_nc' },
    selector_2pos_nc: { nome: 'Seletora NF', w: 2, h: 3, portas: P2, tipo: 'selector' },
    limit_switch_nc: { nome: 'Fim de curso NF', w: 2, h: 3, portas: P2, tipo: 'contact' },
    buzzer: { nome: 'Sirene', w: 2, h: 3, portas: P2, tipo: 'lamp' },
    motor_1ph: { nome: 'Motor 1~', w: 2, h: 3, portas: P2, tipo: 'motor' }
  };
  var NOVOS_IDS = Object.keys(NOVOS);
  NOVOS_IDS.forEach(function (k) { DEFS[k] = NOVOS[k]; });

  function clonePortas(p) { return p.map(function (q) { return { x: q.x, y: q.y }; }); }
  function listAll() { return list({ extras: true }); }
  function list(o) {
    var ids = (o && o.extras) ? IDS.concat(EXTRA_IDS, NOVOS_IDS) : IDS;
    return ids.map(function (id) {
      var d = DEFS[id];
      return { id: id, nome: d.nome, norma: NORMA, w: d.w, h: d.h, portas: clonePortas(d.portas) };
    });
  }

  /* ---------- catalogo (tabela 1.2 do plano) ---------- */
  var CATEGORIAS = ['Alimentação', 'Proteção', 'Manobra', 'Comando', 'Temporizadores', 'Sinalização', 'Motores', 'Compatibilidade', 'Ligação'];
  function F(a, b) { return [{ fn: a }, { fn: b }]; }
  function X() { return Array.prototype.slice.call(arguments).map(function (n) { return { fixo: n }; }); }
  var NA = F('3', '4'), NF = F('1', '2'), TNA = F('7', '8'), TNF = F('5', '6');
  var CONF_TEMP = ['marcação 55–56/67–68 dos contatos temporizados', 'símbolo do retardo (arco)'];
  var CONF_FASE = ['bornes e símbolo dos relés de fase'];
  var CONF_BOB_T = ['símbolo da bobina temporizada'];

  /* [id, nome, categoria, letra, descricao, terminais, confirmar extra] */
  var ROWS = [
    ['power_l1', 'Fase L1', 'Alimentação', '', 'Condutor de fase L1 (origem do circuito).', null, []],
    ['power_l2', 'Fase L2', 'Alimentação', '', 'Condutor de fase L2 (origem do circuito).', null, []],
    ['power_l3', 'Fase L3', 'Alimentação', '', 'Condutor de fase L3 (origem do circuito).', null, []],
    ['power_n', 'Neutro N', 'Alimentação', '', 'Condutor neutro, em linha cheia com o rótulo N.', null, []],
    ['power_24v', '+24 V', 'Alimentação', '', 'Fonte de comando em corrente contínua, polo positivo (+24 V).', null, ['símbolo das fontes CC']],
    ['power_0v', '0 V', 'Alimentação', '', 'Fonte de comando em corrente contínua, referência (0 V).', null, ['símbolo das fontes CC']],
    ['supply_3ph', 'Alimentação 3~+N+PE', 'Alimentação', '', 'Barramento de alimentação trifásica com neutro e terra: L1 L2 L3 N PE.', X('L1', 'L2', 'L3', 'N', 'PE'), ['símbolo da barra de alimentação']],
    ['ground', 'Terra (PE)', 'Alimentação', '', 'Condutor de proteção (terra).', null, ['desenho do PE']],
    ['fuse', 'Fusível', 'Proteção', 'F', 'Fusível: abre o circuito em sobrecorrente.', null, []],
    ['circuit_breaker', 'Disjuntor 1P', 'Proteção', 'Q', 'Disjuntor monopolar, com X na lâmina.', null, ['uso de Q ou F']],
    ['motor_breaker_3p', 'Disjuntor-motor 3P', 'Proteção', 'Q', 'Disjuntor-motor: três contatos com X, acoplamento tracejado e disparadores térmico e magnético.', X('1', '3', '5', '2', '4', '6'), ['símbolo dos disparadores térmico e magnético', 'uso de Q ou F']],
    ['breaker_aux_no', 'Aux. do disjuntor-motor', 'Proteção', 'Q', 'Contato auxiliar NA do disjuntor-motor (13–14).', X('13', '14'), ['bornes 13–14', 'símbolo do contato auxiliar do disjuntor']],
    ['overload_3p', 'Térmico (potência)', 'Proteção', 'F', 'Elementos de potência do relé térmico: três condutores com bimetal.', X('1', '3', '5', '2', '4', '6'), ['símbolo do elemento térmico de potência']],
    ['overload_relay', 'Térmico NF', 'Proteção', 'F', 'Relé térmico: contato NF acionado por bimetal.', X('95', '96'), ['bornes 95–96']],
    ['overload_no', 'Térmico NA', 'Proteção', 'F', 'Contato NA (97–98) do relé térmico: fecha ao disparar.', X('97', '98'), ['bornes 97–98']],
    ['relay_phase_loss', 'Relé de falta de fase', 'Proteção', 'K', 'Relé monitor de falta de fase (L1 L2 L3).', X('L1', 'L2', 'L3'), CONF_FASE],
    ['relay_phase_seq', 'Relé de sequência de fase', 'Proteção', 'K', 'Relé monitor de sequência de fase (L1 L2 L3).', X('L1', 'L2', 'L3'), CONF_FASE],
    ['contact_phase_loss_no', 'Contato NA do relé de falta de fase', 'Proteção', 'K', 'Contato NA do relé de falta de fase.', NA, CONF_FASE],
    ['contact_phase_loss_nc', 'Contato NF do relé de falta de fase', 'Proteção', 'K', 'Contato NF do relé de falta de fase.', NF, CONF_FASE],
    ['contact_phase_seq_no', 'Contato NA do relé de sequência', 'Proteção', 'K', 'Contato NA do relé de sequência de fase.', NA, CONF_FASE],
    ['contact_phase_seq_nc', 'Contato NF do relé de sequência', 'Proteção', 'K', 'Contato NF do relé de sequência de fase.', NF, CONF_FASE],
    ['contactor_main_3p', 'Contator (potência)', 'Manobra', 'K', 'Três contatos de potência acoplados, com semicírculo.', X('1', '3', '5', '2', '4', '6'), ['posição do semicírculo (contato fixo)']],
    ['coil', 'Bobina', 'Manobra', 'K', 'Bobina de contator ou relé; liga os contatos de mesmo id.', X('A1', 'A2'), []],
    ['contact_no', 'Contato aux. NA', 'Manobra', 'K', 'Contato auxiliar normalmente aberto.', NA, []],
    ['contact_nc', 'Contato aux. NF', 'Manobra', 'K', 'Contato auxiliar normalmente fechado.', NF, []],
    ['pushbutton_no', 'Botoeira NA', 'Comando', 'S', 'Botoeira normalmente aberta, com atuador tracejado.', NA, []],
    ['pushbutton_nc', 'Botoeira NF', 'Comando', 'S', 'Botoeira normalmente fechada, com atuador tracejado.', NF, []],
    ['emergency_stop_nc', 'Emergência com retenção', 'Comando', 'S', 'Botão cogumelo com retenção, contato NF; trava ao ser acionado.', NF, ['símbolo da retenção', 'símbolo do cogumelo']],
    ['selector_2pos', 'Seletora NA', 'Comando', 'S', 'Seletora de duas posições (giro), contato NA.', NA, ['símbolo do atuador de giro']],
    ['selector_2pos_nc', 'Seletora NF', 'Comando', 'S', 'Seletora de duas posições (giro), contato NF.', NF, ['símbolo do atuador de giro']],
    ['limit_switch_no', 'Fim de curso NA', 'Comando', 'S', 'Fim de curso, contato NA acionado por came.', NA, ['letra S ou B', 'símbolo do atuador']],
    ['limit_switch_nc', 'Fim de curso NF', 'Comando', 'S', 'Fim de curso, contato NF acionado por came.', NF, ['letra S ou B', 'símbolo do atuador']],
    ['timer_relay', 'Bobina temporizada (energização)', 'Temporizadores', 'K', 'Bobina de temporizador com retardo na energização.', X('A1', 'A2'), CONF_BOB_T],
    ['timer_relay_off', 'Bobina temporizada (desenergização)', 'Temporizadores', 'K', 'Bobina de temporizador com retardo na desenergização.', X('A1', 'A2'), CONF_BOB_T],
    ['contact_timer_on_no', 'Contato temporizado NA (energização)', 'Temporizadores', 'K', 'NA com retardo ao energizar a bobina.', TNA, CONF_TEMP],
    ['contact_timer_on_nc', 'Contato temporizado NF (energização)', 'Temporizadores', 'K', 'NF com retardo ao energizar a bobina.', TNF, CONF_TEMP],
    ['contact_timer_off_no', 'Contato temporizado NA (desenergização)', 'Temporizadores', 'K', 'NA com retardo ao desenergizar a bobina.', TNA, CONF_TEMP],
    ['contact_timer_off_nc', 'Contato temporizado NF (desenergização)', 'Temporizadores', 'K', 'NF com retardo ao desenergizar a bobina.', TNF, CONF_TEMP],
    ['lamp', 'Sinaleiro', 'Sinalização', 'H', 'Sinaleiro (lâmpada) com cor selecionável.', X('X1', 'X2'), ['cores de sinalização (IEC 60073)', 'bornes X1–X2']],
    ['buzzer', 'Sirene', 'Sinalização', 'H', 'Sinalizador sonoro (sirene).', X('X1', 'X2'), ['desenho da sirene', 'bornes X1–X2']],
    ['motor_3ph_3t', 'Motor 3~ (U V W)', 'Motores', 'M', 'Motor trifásico com 3 terminais.', X('U', 'V', 'W'), ['IEC 60034-8']],
    ['motor_3ph_6t', 'Motor 3~ (6 terminais)', 'Motores', 'M', 'Motor trifásico com 6 terminais (estrela-triângulo).', X('U1', 'V1', 'W1', 'U2', 'V2', 'W2'), ['IEC 60034-8']],
    ['motor_1ph', 'Motor 1~', 'Motores', 'M', 'Motor monofásico.', X('U1', 'U2'), ['IEC 60034-8', 'bornes do motor monofásico']],
    ['motor_3ph', 'Motor 3~ simplificado', 'Compatibilidade', 'M', 'Motor trifásico com 2 terminais (compatibilidade com arquivos antigos).', null, ['bornes do motor simplificado']],
    ['junction', 'Junção', 'Ligação', '', 'Ponto de ligação entre condutores.', null, []]
  ];

  var CAT = [];
  var CAT_BY_ID = {};
  ROWS.forEach(function (r) {
    var d = DEFS[r[0]];
    var nomes = r[5] || [];
    var terms = d.portas.map(function (p, i) {
      var spec = nomes[i] || {};
      var t = { n: spec.fixo || spec.fn || String(i + 1), x: p.x * d.w, y: p.y * d.h };
      if (spec.fn) t.fn = spec.fn;
      if (spec.fixo) t.fixo = spec.fixo;
      return t;
    });
    var conf = ['edição da IEC 60617'];
    if (r[3]) conf.push('letra de identificação (IEC 81346-2)');
    var e = { id: r[0], nome: r[1], categoria: r[2], letra: r[3], letraConfirmada: false, norma: NORMA_CAT,
      w: d.w, h: d.h, terminais: terms, descricao: r[4], confirmar: conf.concat(r[6]) };
    CAT.push(e);
    CAT_BY_ID[e.id] = e;
  });

  function copiaCat(e) {
    return { id: e.id, nome: e.nome, categoria: e.categoria, letra: e.letra, letraConfirmada: e.letraConfirmada, norma: e.norma,
      w: e.w, h: e.h, descricao: e.descricao, confirmar: e.confirmar.slice(),
      terminais: e.terminais.map(function (t) { var c = {}; Object.keys(t).forEach(function (k) { c[k] = t[k]; }); return c; }) };
  }
  function catalog() { return CAT.map(copiaCat); }
  function get(id) { return CAT_BY_ID[id] ? copiaCat(CAT_BY_ID[id]) : null; }
  function categorias() {
    return CATEGORIAS.map(function (c) {
      return { nome: c, ids: CAT.filter(function (e) { return e.categoria === c; }).map(function (e) { return e.id; }) };
    }).filter(function (c) { return c.ids.length > 0; });
  }

  /* ---------- transformacoes ---------- */
  function quarter(rot) {
    var q = Math.round((Number(rot) || 0) / 90) % 4;
    return q < 0 ? q + 4 : q;
  }
  function xform(u, v, w, h, rot, flip) {
    if (flip) u = w - u;
    switch (quarter(rot)) {
      case 1: return { x: h - v, y: u };
      case 2: return { x: w - u, y: h - v };
      case 3: return { x: v, y: w - u };
      default: return { x: u, y: v };
    }
  }
  /* parte linear de xform (direcoes) */
  function xvec(dx, dy, rot, flip) {
    if (flip) dx = -dx;
    switch (quarter(rot)) {
      case 1: return { x: -dy, y: dx };
      case 2: return { x: -dx, y: -dy };
      case 3: return { x: dy, y: -dx };
      default: return { x: dx, y: dy };
    }
  }
  function terminalPoints(id, rot, flip) {
    var e = CAT_BY_ID[id];
    if (!e) return [];
    var w = e.w * GRID, h = e.h * GRID;
    return e.terminais.map(function (t) {
      var p = xform(t.x * GRID, t.y * GRID, w, h, rot, flip);
      var o = { n: t.n, x: p.x, y: p.y };
      if (t.fn) o.fn = t.fn;
      if (t.fixo) o.fixo = t.fixo;
      return o;
    });
  }
  function applyGeometry(defs) {
    var n = 0;
    if (!defs) return n;
    CAT.forEach(function (e) {
      var d = defs[e.id];
      if (!d) return;
      d.w = e.w; d.h = e.h;
      d.ports = DEFS[e.id].portas.map(function (p) { return { x: p.x, y: p.y }; });
      d.terminals = e.terminais.map(function (t) { var c = {}; Object.keys(t).forEach(function (k) { c[k] = t[k]; }); return c; });
      n++;
    });
    return n;
  }

  /* ---------- contexto com transformacao (rot/flip) ----------
   * Traca no ctx real depois de mapear cada ponto; o texto so tem a posicao mapeada (nunca e girado). */
  var STYLE_PROPS = ['strokeStyle', 'fillStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline', 'lineCap', 'lineJoin',
    'globalAlpha', 'shadowBlur', 'shadowColor', 'lineDashOffset'];
  function mapCtx(ctx, bx, by, w, h, rot, flip) {
    var m = { __map: { rot: rot, flip: flip } };
    function P(px, py) { var r = xform(px - bx, py - by, w, h, rot, flip); return [bx + r.x, by + r.y]; }
    var a, b, c;
    m.beginPath = function () { ctx.beginPath(); };
    m.closePath = function () { ctx.closePath(); };
    m.moveTo = function (x, y) { a = P(x, y); ctx.moveTo(a[0], a[1]); };
    m.lineTo = function (x, y) { a = P(x, y); ctx.lineTo(a[0], a[1]); };
    m.quadraticCurveTo = function (x1, y1, x, y) { a = P(x1, y1); b = P(x, y); ctx.quadraticCurveTo(a[0], a[1], b[0], b[1]); };
    m.bezierCurveTo = function (x1, y1, x2, y2, x, y) {
      a = P(x1, y1); b = P(x2, y2); c = P(x, y); ctx.bezierCurveTo(a[0], a[1], b[0], b[1], c[0], c[1]);
    };
    m.arc = function (cx, cy, r, a0, a1, ccw) {
      var ctr = P(cx, cy);
      var d0 = xvec(Math.cos(a0), Math.sin(a0), rot, flip);
      var s0 = Math.atan2(d0.y, d0.x);
      var delta = a1 - a0;
      ctx.arc(ctr[0], ctr[1], r, s0, flip ? s0 - delta : s0 + delta, flip ? !ccw : !!ccw);
    };
    function poly(x, y, ww, hh) {
      ctx.beginPath();
      var p = P(x, y); ctx.moveTo(p[0], p[1]);
      p = P(x + ww, y); ctx.lineTo(p[0], p[1]);
      p = P(x + ww, y + hh); ctx.lineTo(p[0], p[1]);
      p = P(x, y + hh); ctx.lineTo(p[0], p[1]);
      ctx.closePath();
    }
    m.strokeRect = function (x, y, ww, hh) { poly(x, y, ww, hh); ctx.stroke(); };
    m.fillRect = function (x, y, ww, hh) { poly(x, y, ww, hh); ctx.fill(); };
    m.stroke = function () { ctx.stroke(); };
    m.fill = function () { ctx.fill(); };
    m.setLineDash = function (d) { ctx.setLineDash(d); };
    m.fillText = function (t, x, y) { var p = P(x, y); ctx.fillText(t, p[0], p[1]); };
    m.fillTextS = function (t, x, y, dy) { var p = P(x, y); ctx.fillText(t, p[0], p[1] + dy); };
    STYLE_PROPS.forEach(function (k) {
      Object.defineProperty(m, k, { get: function () { return ctx[k]; }, set: function (v) { ctx[k] = v; }, enumerable: true });
    });
    return m;
  }

  /* ---------- texto ---------- */
  var FAM = null;
  function familia(o) {
    if (o && o.fontFamily) return o.fontFamily;
    if (FAM) return FAM;
    try {
      if (root.document && root.document.documentElement && root.getComputedStyle) {
        var v = String(root.getComputedStyle(root.document.documentElement).getPropertyValue('--font-mono') || '').trim();
        if (v) { FAM = v; return v; }
      }
    } catch (e) { /* sem DOM */ }
    return 'monospace';
  }
  function fnt(o, px, bold) { return (bold ? 'bold ' : '') + px + 'px ' + familia(o); }

  /* texto ancorado em (u,v); (sx,sy) = lado (no desenho vertical) para onde o texto cresce a partir da ancora. */
  function txt(g, s, u, v, sx, sy, px) {
    var rot = 0, flip = false;
    if (g.__map) { rot = g.__map.rot; flip = g.__map.flip; }
    var d = xvec(sx, sy, rot, flip);
    var dy = d.y > 0.5 ? px * 0.85 : (d.y < -0.5 ? -1.5 : px * 0.35);
    g.textAlign = d.x > 0.5 ? 'left' : (d.x < -0.5 ? 'right' : 'center');
    if (g.__map) g.fillTextS(s, u, v, dy); else g.fillText(s, u, v + dy);
  }

  /* ---------- estado visual de contatos ---------- */
  function visNA(o, coilOn) {
    if (o.forceState === 'closed') return true;
    if (o.forceState === 'open') return false;
    return coilOn;
  }
  function visNC(o, coilOn) {
    if (o.forceState === 'closed') return true;
    if (o.forceState === 'open') return false;
    return !coilOn;
  }

  /* ---------- primitivas IEC ---------- */
  function ponta(kind, closed, cx, t) {
    if (kind === 'NA') return closed ? { x: cx, y: t } : { x: cx - 8, y: t + 2 };
    /* NF: fechado, a lamina PASSA do contato fixo (ponta acima do gancho); aberto, afasta-se por baixo do gancho */
    return closed ? { x: cx - 6, y: t - 5 } : { x: cx - 12, y: t + 8 };
  }
  var GANCHO = 10, GANCHO_LW = 3;

  /* contato vertical: condutores ate t/b, gancho do contato fixo (NF) e lamina de b ate a ponta. Devolve a ponta. */
  function contato(g, cx, y, h, t, b, kind, closed) {
    var tip = ponta(kind, closed, cx, t);
    g.beginPath();
    g.moveTo(cx, y); g.lineTo(cx, t);
    g.moveTo(cx, b); g.lineTo(cx, y + h);
    g.moveTo(cx, b); g.lineTo(tip.x, tip.y);
    g.stroke();
    if (kind !== 'NA') {
      /* gancho horizontal do contato fixo: mais grosso e longo, legivel a 40x60 px */
      var lw = g.lineWidth;
      g.lineWidth = GANCHO_LW;
      g.beginPath(); g.moveTo(cx - GANCHO, t); g.lineTo(cx, t); g.stroke();
      g.lineWidth = lw;
    }
    return tip;
  }
  /* x da lamina na altura yy */
  function laminaX(cx, b, tip, yy) {
    var den = b - tip.y;
    return den ? cx + (tip.x - cx) * ((b - yy) / den) : cx;
  }
  function tracejado(g, x0, x1, yy) {
    g.setLineDash([3, 2]);
    g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.stroke();
    g.setLineDash([]);
  }
  function emLamina(tip, cx, b, f) { return { x: tip.x + (cx - tip.x) * f, y: tip.y + (b - tip.y) * f }; }

  function atuadorBotao(g, ax, my) {
    g.beginPath(); g.moveTo(ax, my - 5); g.lineTo(ax, my + 5); g.stroke();
  }
  function atuadorGiro(g, ax, my) {
    g.beginPath(); g.arc(ax - 3.5, my, 3.5, 0, Math.PI * 2); g.stroke();
  }
  function atuadorCame(g, ax, my) {
    g.beginPath(); g.moveTo(ax, my - 5); g.lineTo(ax - 5, my); g.lineTo(ax, my + 5); g.stroke();
  }
  function atuadorBimetal(g, ax, my) {
    g.beginPath();
    g.moveTo(ax - 6, my - 6); g.lineTo(ax, my - 6); g.lineTo(ax, my + 6); g.lineTo(ax - 6, my + 6);
    g.stroke();
    g.beginPath(); g.moveTo(ax - 5, my + 3); g.quadraticCurveTo(ax - 3, my - 4, ax - 1, my - 3); g.stroke();
  }
  function atuadorRetardo(g, ax, my, off) {
    g.beginPath();
    if (!off) g.arc(ax - 5, my, 5, -Math.PI / 2, Math.PI / 2, false);
    else g.arc(ax + 5, my, 5, Math.PI / 2, -Math.PI / 2, false);
    g.stroke();
  }

  /* Mantido por fidelidade com o legado (nao e usado no desenho IEC). */
  function vertContactDraw(ctx, cx, t, b, kind, closed, timerArc) {
    ctx.beginPath();
    ctx.arc(cx, t, 2.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, b, 2.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, t - 14);
    ctx.lineTo(cx, t - 2.5);
    ctx.moveTo(cx, b + 2.5);
    ctx.lineTo(cx, b + 14);
    ctx.stroke();
    var cX = cx - 4;
    if (kind === 'NA') {
      if (closed) { ctx.beginPath(); ctx.moveTo(cX, t); ctx.lineTo(cX, b); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(cX, b); ctx.lineTo(cX - 6, t); ctx.stroke(); }
    } else if (closed) {
      ctx.beginPath(); ctx.moveTo(cX, t); ctx.lineTo(cX, b);
      ctx.moveTo(cx - 2.5, t); ctx.lineTo(cX, t);
      ctx.stroke();
    } else { ctx.beginPath(); ctx.moveTo(cX, b); ctx.lineTo(cX - 6, t); ctx.stroke(); }
    if (timerArc) {
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(cx, b + 16, 8, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  function vertPushbutton(ctx, cx, t, b, kind, closed, color) {
    ctx.strokeStyle = color;
    vertContactDraw(ctx, cx, t, b, kind, closed, false);
  }
  function thermalBimetalDraw(ctx, cx, my, halfW) {
    ctx.lineWidth = 2;
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      var ox = i * 7;
      ctx.moveTo(cx - halfW + ox, my - 8);
      ctx.quadraticCurveTo(cx + ox, my, cx + halfW + ox, my + 8);
      ctx.stroke();
    }
  }

  function resolveColors(opts) {
    var k = (opts && opts.colors) || {};
    var cc = 'currentColor';
    var lamp = k.lamp || {};
    return {
      color: (opts && opts.color) || k.color || cc,
      l1: k.l1 || cc, l2: k.l2 || cc, l3: k.l3 || cc, n: k.n || cc,
      bg: k.bg || 'transparent',
      fault: k.fault || cc,
      energizedFill: k.energizedFill || 'rgba(128,128,128,0.2)',
      amber: k.amber || cc,
      lamp: { red: lamp.red || cc, amber: lamp.amber || cc, blue: lamp.blue || cc, white: lamp.white || cc, green: lamp.green || cc }
    };
  }

  /* ---------- contator de potencia 3P, motor 3~ (6T/3T) ---------- */
  var XP3 = [0.2, 0.5, 0.8];

  function contactorMain3p(g, K, box, closed, faultColor) {
    var x = box.x || 0, y = box.y || 0, w = box.w, h = box.h;
    var t = y + h * 0.3, b = y + h * 0.7, my = y + h / 2;
    var mids = [];
    for (var i = 0; i < 3; i++) {
      var px = x + w * XP3[i];
      var tip = contato(g, px, y, h, t, b, 'NA', closed);
      var q = emLamina(tip, px, b, 0.2);
      g.beginPath(); g.arc(q.x, q.y, 3, -Math.PI / 2, Math.PI / 2, false); g.stroke();
      mids.push(laminaX(px, b, tip, my));
    }
    tracejado(g, mids[0], mids[2], my);
  }

  function arrowHead(ctx, px, py, dx, dy) {
    var nx = -dy, ny = dx;
    ctx.beginPath();
    ctx.moveTo(px + dx * 4, py + dy * 4);
    ctx.lineTo(px + nx * 3, py + ny * 3);
    ctx.lineTo(px - nx * 3, py - ny * 3);
    ctx.closePath();
    ctx.fill();
  }

  /* opts.motor = {estado:'Y'|'Δ'|'parado'|'incompleto'|'ligado', sequencia:'direta'|'inversa'|null} */
  function motor3(g, K, box, opts, six) {
    var x = box.x || 0, y = box.y || 0, w = box.w, h = box.h;
    var cx = x + w / 2, my = y + h / 2, r = Math.min(w, h) * 0.25;
    var m = opts.motor || {};
    var estado = m.estado || (opts.energized ? 'ligado' : 'parado');
    var girando = (estado === 'Y' || estado === 'Δ' || estado === 'ligado');
    var stroke = opts.fault ? K.fault : K.color;
    var i, px;
    g.strokeStyle = stroke;
    g.fillStyle = stroke;
    g.lineWidth = LW;
    for (i = 0; i < 3; i++) {
      px = x + w * XP3[i];
      g.beginPath();
      g.moveTo(px, y);
      g.lineTo(px, i === 1 ? my - r : y + 16);
      g.stroke();
      if (six) {
        g.beginPath();
        g.moveTo(px, y + h);
        g.lineTo(px, i === 1 ? my + r : y + h - 16);
        g.stroke();
      }
    }
    if (estado === 'incompleto') g.setLineDash([3, 3]);
    g.beginPath();
    g.arc(cx, my, r, 0, Math.PI * 2);
    if (girando) { g.fillStyle = K.energizedFill; g.fill(); g.fillStyle = stroke; }
    g.stroke();
    g.setLineDash([]);
    g.font = fnt(opts, 11, true);
    txt(g, 'M', cx, my - 1, 0, 0, 11);
    g.font = fnt(opts, 9, true);
    txt(g, '3~', cx, my + 10, 0, 0, 9);
    var t = estado === 'Y' ? 'Y' : estado === 'Δ' ? 'Δ' : estado === 'ligado' ? 'ON' : estado === 'incompleto' ? '?' : '0';
    g.font = fnt(opts, 11, true);
    txt(g, t, x + 2, my + 4, 1, 0, 11);
    if (girando && (m.sequencia === 'direta' || m.sequencia === 'inversa')) {
      var ra = r + 5, a0 = -0.3 * Math.PI, a1 = 0.3 * Math.PI, cw = m.sequencia === 'direta';
      g.lineWidth = 1.5;
      g.beginPath();
      if (cw) g.arc(cx, my, ra, a0, a1, false); else g.arc(cx, my, ra, a1, a0, true);
      g.stroke();
      var ae = cw ? a1 : a0;
      var sg = cw ? 1 : -1;
      arrowHead(g, cx + ra * Math.cos(ae), my + ra * Math.sin(ae), -Math.sin(ae) * sg, Math.cos(ae) * sg);
      g.lineWidth = LW;
    }
  }

  /* ---------- bornes e identificacao ---------- */
  /* relés de fase: terminais a 10 px de distancia; os rotulos nao cabem todos a direita */
  var BORNE_LADO = { relay_phase_loss: ['esq', 'centro', 'dir'], relay_phase_seq: ['esq', 'centro', 'dir'] };
  var BORNES_PADRAO = { coil: 1, timer_relay: 1, timer_relay_off: 1, motor_3ph_3t: 1, motor_3ph_6t: 1 };
  function bornes(g, id, box, o, color, K, rotQ) {
    var e = CAT_BY_ID[id];
    if (!e || o.terminais === false || id === 'junction') return;
    var arr = Array.isArray(o.terminais) ? o.terminais : null;
    var todos = o.terminais === true;
    if (!arr && !todos && !BORNES_PADRAO[id]) return;
    var seq = Math.round(Number(o.seq)); if (!(seq >= 1 && seq <= 9)) seq = 1;
    g.font = fnt(o, 8, false);
    g.fillStyle = color;
    e.terminais.forEach(function (t, ti) {
      var nome = arr ? (arr[ti] ? String(arr[ti]) : null)
        : todos ? (t.fn ? String(seq) + t.fn : (t.fixo || null)) : (t.fixo || null);
      if (!nome) return;
      var u = box.x + (t.x / e.w) * box.w;
      var top = t.y < e.h / 2;
      var v = top ? box.y + 8 : box.y + box.h - 8;
      var lado = BORNE_LADO[id] && BORNE_LADO[id][ti];
      if (lado && (rotQ % 2 === 1)) {
        /* girado a 90/270 os terminais ficam a 10 px na vertical: rotulos todos fora da caixa, lado a lado, sem sobrepor */
        txt(g, nome, u, box.y - 3, 0, -1, 8);
      } else if (lado === 'esq') txt(g, nome, u - 3, v, -1, 0, 8);
      else if (lado === 'centro') {
        var vc = box.y + 16;
        g.fillStyle = K.bg;
        g.fillRect(u - 6, vc - 5, 12, 10);
        g.fillStyle = color;
        txt(g, nome, u, vc, 0, 0, 8);
      } else txt(g, nome, u + 3, v, 1, 0, 8);
    });
  }

  var SEM_ROTULO = { power_l1: 1, power_l2: 1, power_l3: 1, power_n: 1, ground: 1, power_24v: 1, power_0v: 1, supply_3ph: 1 };

  /* ---------- draw ---------- */
  function draw(ctx, id, box, opts) {
    opts = opts || {};
    if (opts.estilo === 'legado') {
      var L = EO.render.symbolsLegado;
      if (L && L.draw) return L.draw(ctx, id, box, opts);
    }
    var K = resolveColors(opts);
    var color = K.color;
    var x = box.x || 0, y = box.y || 0, w = box.w, h = box.h;
    var rot = quarter(opts.rot) * 90, flip = !!opts.flip;
    var g = (rot || flip) ? mapCtx(ctx, x, y, w, h, rot, flip) : ctx;
    var cx = (box.cx !== undefined && box.cx !== null) ? box.cx : x + w / 2;
    var my = y + h / 2;
    var t = y + h * 0.3, b = y + h * 0.7;
    var running = !!opts.running, coilOn = !!opts.coilOn, fault = !!opts.fault, energized = !!opts.energized;
    var c = opts;
    var closed, tip, ax = cx - 12;

    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = LW;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.setLineDash([]);
    g.font = fnt(opts, 9, true);

    switch (id) {
      case 'power_l1': case 'power_l2': case 'power_l3': case 'power_n': {
        var col = id === 'power_l1' ? K.l1 : id === 'power_l2' ? K.l2 : id === 'power_l3' ? K.l3 : K.n;
        g.strokeStyle = col;
        g.fillStyle = col;
        g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y + h); g.stroke();
        g.font = fnt(opts, 9, true);
        txt(g, id === 'power_n' ? 'N' : id.slice(-2).toUpperCase(), cx - 4, my, -1, 0, 9);
        break;
      }
      case 'contact_no': case 'contact_nc': {
        var kd = id === 'contact_no' ? 'NA' : 'NF';
        closed = kd === 'NA' ? visNA(c, coilOn) : visNC(c, coilOn);
        contato(g, cx, y, h, t, b, kd, closed);
        break;
      }
      case 'contact_phase_loss_no': case 'contact_phase_loss_nc': case 'contact_phase_seq_no': case 'contact_phase_seq_nc': {
        var isNa = /_no$/.test(id);
        closed = isNa ? visNA(c, coilOn) : visNC(c, coilOn);
        contato(g, cx, y, h, t, b, isNa ? 'NA' : 'NF', closed);
        g.font = fnt(opts, 8, true);
        g.fillStyle = color;
        txt(g, id.indexOf('_loss_') > 0 ? 'U<' : '↺', cx + 6, my, 1, 0, 8);
        break;
      }
      case 'contact_timer_on_no': case 'contact_timer_off_no': case 'contact_timer_on_nc': case 'contact_timer_off_nc': {
        var tNo = /_no$/.test(id);
        var tOff = id.indexOf('_off') !== -1;
        closed = running ? !!opts.timerClosed : (!tNo);
        tip = contato(g, cx, y, h, t, b, tNo ? 'NA' : 'NF', closed);
        tracejado(g, laminaX(cx, b, tip, my), ax, my);
        atuadorRetardo(g, ax, my, tOff);
        g.font = fnt(opts, 8, true);
        g.fillStyle = color;
        txt(g, tOff ? 't↓' : 't↑', cx + 6, my, 1, 0, 8);
        break;
      }
      case 'limit_switch_no': case 'limit_switch_nc': {
        var lNa = id === 'limit_switch_no';
        closed = lNa ? visNA(c, coilOn) : visNC(c, coilOn);
        tip = contato(g, cx, y, h, t, b, lNa ? 'NA' : 'NF', closed);
        tracejado(g, laminaX(cx, b, tip, my), ax, my);
        atuadorCame(g, ax, my);
        break;
      }
      case 'pushbutton_no':
      case 'pushbutton_nc': {
        var pNa = id === 'pushbutton_no';
        closed = pNa ? (!!opts.pressed || opts.forceState === 'closed')
          : ((!opts.pressed && opts.forceState !== 'open') || opts.forceState === 'closed');
        tip = contato(g, cx, y, h, t, b, pNa ? 'NA' : 'NF', closed);
        tracejado(g, laminaX(cx, b, tip, my), ax, my);
        atuadorBotao(g, ax, my);
        break;
      }
      case 'selector_2pos': case 'selector_2pos_nc': {
        var sNa = id === 'selector_2pos';
        closed = sNa ? (!!opts.selected || opts.forceState === 'closed')
          : ((!opts.selected && opts.forceState !== 'open') || opts.forceState === 'closed');
        tip = contato(g, cx, y, h, t, b, sNa ? 'NA' : 'NF', closed);
        tracejado(g, laminaX(cx, b, tip, my), ax + 1, my);
        atuadorGiro(g, ax + 1, my);
        break;
      }
      case 'relay_phase_loss':
      case 'relay_phase_seq': {
        var chm = h * 0.2, cwm = w * 0.75;
        g.beginPath();
        for (var k = 0; k < 3; k++) { g.moveTo(x + w * P3[k].x, y); g.lineTo(x + w * P3[k].x, my - chm); }
        g.stroke();
        var rxm = cx - cwm / 2;
        g.strokeRect(rxm, my - chm, cwm, chm * 2);
        g.fillStyle = fault ? K.fault : color;
        g.font = fnt(opts, id === 'relay_phase_loss' ? 8 : 7, true);
        if (id === 'relay_phase_loss') txt(g, 'U<', cx, my, 0, 0, 8);
        else if (rot % 180 === 90) txt(g, 'L123', cx, my, 0, 0, 7);
        else { txt(g, 'L1L2', cx, my - 3, 0, 0, 7); txt(g, 'L3', cx, my + 5, 0, 0, 7); }
        if (energized && running && !fault) {
          g.fillStyle = K.energizedFill;
          g.fillRect(rxm, my - chm, cwm, chm * 2);
        }
        break;
      }
      case 'coil': case 'timer_relay': case 'timer_relay_off': {
        var ch = h * 0.22, cw = w * 0.5;
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, my - ch);
        g.moveTo(cx, my + ch); g.lineTo(cx, y + h);
        g.stroke();
        var rx0 = cx - cw / 2;
        g.strokeRect(rx0, my - ch, cw, ch * 2);
        if (id === 'timer_relay') {
          g.strokeRect(rx0, my - ch, cw * 0.4, ch * 2);
          g.beginPath();
          g.moveTo(rx0, my - ch); g.lineTo(rx0 + cw * 0.4, my + ch);
          g.moveTo(rx0 + cw * 0.4, my - ch); g.lineTo(rx0, my + ch);
          g.stroke();
        }
        if (id === 'timer_relay_off') {
          g.strokeRect(rx0, my - ch, cw * 0.4, ch * 2);
          g.fillStyle = color;
          g.fillRect(rx0, my - ch, cw * 0.4, ch * 2);
        }
        if (energized && running) {
          g.fillStyle = K.energizedFill;
          g.fillRect(rx0, my - ch, cw, ch * 2);
        }
        if (id !== 'coil') {
          var T = Math.max(0.05, parseFloat(opts.time) || 3);
          var tx;
          g.font = fnt(opts, 8, true);
          if (running) {
            g.fillStyle = energized ? K.amber : color;
            tx = Math.max(0, T - (opts.timerAcc || 0)).toFixed(1) + 's/' + T.toFixed(1) + 's';
          } else {
            g.fillStyle = color;
            tx = 'T=' + T.toFixed(1) + 's';
          }
          txt(g, tx, rx0 + cw + 3, my, 1, 0, 8);
        }
        break;
      }
      case 'overload_relay': case 'overload_no': {
        var oNf = id === 'overload_relay';
        closed = oNf ? visNC(c, coilOn) : visNA(c, coilOn);
        tip = contato(g, cx, y, h, t, b, oNf ? 'NF' : 'NA', closed);
        tracejado(g, laminaX(cx, b, tip, my), ax, my);
        atuadorBimetal(g, ax, my);
        if (fault) {
          g.strokeStyle = K.fault;
          g.beginPath(); g.arc(cx - 6, my, 11, 0, Math.PI * 2); g.stroke();
        }
        break;
      }
      case 'fuse':
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, my - 12);
        g.moveTo(cx, my + 12); g.lineTo(cx, y + h);
        g.stroke();
        g.fillStyle = K.bg;
        g.fillRect(cx - 6, my - 12, 12, 24);
        g.strokeRect(cx - 6, my - 12, 12, 24);
        if (!fault) {
          g.beginPath(); g.moveTo(cx, my - 12); g.lineTo(cx, my + 12); g.stroke();
        } else {
          g.strokeStyle = K.fault;
          g.beginPath(); g.moveTo(cx - 5, my - 5); g.lineTo(cx + 5, my + 5); g.stroke();
        }
        break;
      case 'circuit_breaker': {
        closed = !fault;
        tip = contato(g, cx, y, h, t, b, 'NA', closed);
        var q = emLamina(tip, cx, b, 0.28);
        g.beginPath();
        g.moveTo(q.x - 3, q.y - 3); g.lineTo(q.x + 3, q.y + 3);
        g.moveTo(q.x - 3, q.y + 3); g.lineTo(q.x + 3, q.y - 3);
        g.stroke();
        if (fault) {
          g.strokeStyle = K.fault;
          g.beginPath(); g.arc(cx - 4, my, 11, 0, Math.PI * 2); g.stroke();
        }
        break;
      }
      case 'lamp': {
        var on = running && energized;
        var lc = opts.lampColor;
        var lampColor = on
          ? (lc === 'red' ? K.lamp.red : lc === 'amber' ? K.lamp.amber : lc === 'blue' ? K.lamp.blue : lc === 'white' ? K.lamp.white : K.lamp.green)
          : color;
        var rl = Math.min(w, h) * 0.28;
        g.beginPath();
        g.arc(cx, my, rl, 0, Math.PI * 2);
        if (on) {
          g.fillStyle = lampColor;
          g.globalAlpha = 0.27;
          g.fill();
          g.globalAlpha = 1;
          g.shadowColor = lampColor;
          g.shadowBlur = 10;
        }
        g.strokeStyle = lampColor;
        g.stroke();
        g.shadowBlur = 0;
        var dq = rl * 0.7071;
        g.beginPath();
        g.moveTo(cx - dq, my - dq); g.lineTo(cx + dq, my + dq);
        g.moveTo(cx + dq, my - dq); g.lineTo(cx - dq, my + dq);
        g.stroke();
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, my - rl);
        g.moveTo(cx, my + rl); g.lineTo(cx, y + h);
        g.stroke();
        break;
      }
      case 'motor_3ph': {
        var r = Math.min(w, h) * 0.32;
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, my - r);
        g.moveTo(cx, my + r); g.lineTo(cx, y + h);
        g.stroke();
        g.beginPath(); g.arc(cx, my, r, 0, Math.PI * 2); g.stroke();
        g.font = fnt(opts, 11, true);
        txt(g, 'M', cx, my - 3, 0, 0, 11);
        g.font = fnt(opts, 9, true);
        txt(g, '3~', cx, my + 8, 0, 0, 9);
        break;
      }
      case 'contactor_main_3p':
        if (fault) g.strokeStyle = K.fault;
        contactorMain3p(g, K, box, visNA(c, coilOn));
        break;
      case 'motor_3ph_6t': motor3(g, K, box, opts, true); break;
      case 'motor_3ph_3t': motor3(g, K, box, opts, false); break;
      case 'power_24v': case 'power_0v': {
        var pPos = id === 'power_24v';
        g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y + h); g.stroke();
        g.font = fnt(opts, 9, true);
        txt(g, pPos ? '+24 V' : '0 V', cx + 4, my, 1, 0, 9);
        break;
      }
      case 'supply_3ph': {
        var sxs = [1, 2, 3, 4, 5].map(function (i) { return x + w * i / 6; });
        var scor = [K.l1, K.l2, K.l3, K.n, color], snom = ['L1', 'L2', 'L3', 'N', 'PE'];
        var by = y + 16;
        g.beginPath(); g.moveTo(sxs[0], by); g.lineTo(sxs[4], by); g.stroke();
        g.font = fnt(opts, 8, true);
        for (var si = 0; si < 5; si++) {
          g.strokeStyle = scor[si]; g.fillStyle = scor[si];
          g.beginPath(); g.moveTo(sxs[si], by); g.lineTo(sxs[si], y + h); g.stroke();
          txt(g, snom[si], sxs[si], y + 7, 0, 0, 8);
        }
        break;
      }
      case 'motor_breaker_3p': {
        var mbClosed = !fault && opts.forceState !== 'open';
        var mbX = [], mbMid = [];
        for (var mi = 0; mi < 3; mi++) {
          var mpx = x + w * XP3[mi];
          var mtip = contato(g, mpx, y, h, t, b, 'NA', mbClosed);
          var mq = emLamina(mtip, mpx, b, 0.28);
          g.beginPath();
          g.moveTo(mq.x - 3, mq.y - 3); g.lineTo(mq.x + 3, mq.y + 3);
          g.moveTo(mq.x - 3, mq.y + 3); g.lineTo(mq.x + 3, mq.y - 3);
          g.stroke();
          mbMid.push(laminaX(mpx, b, mtip, my));
        }
        var mbA = x + 9;
        if (fault) g.strokeStyle = K.fault;
        tracejado(g, mbA, mbMid[2], my);
        atuadorBimetal(g, mbA, my);
        g.fillStyle = fault ? K.fault : color;
        g.fillRect(mbA - 5, my - 14, 5, 4);
        if (fault) {
          g.beginPath(); g.arc(x + w * 0.5, my, 24, 0, Math.PI * 2); g.stroke();
        }
        break;
      }
      case 'breaker_aux_no': {
        closed = visNA(c, coilOn);
        tip = contato(g, cx, y, h, t, b, 'NA', closed);
        var bq = laminaX(cx, b, tip, my);
        tracejado(g, bq, ax + 4, my);
        g.beginPath();
        g.moveTo(ax - 2, my - 3); g.lineTo(ax + 4, my + 3);
        g.moveTo(ax - 2, my + 3); g.lineTo(ax + 4, my - 3);
        g.stroke();
        break;
      }
      case 'overload_3p': {
        if (fault) g.strokeStyle = K.fault;
        for (var oi = 0; oi < 3; oi++) {
          var opx = x + w * XP3[oi];
          g.beginPath();
          g.moveTo(opx, y); g.lineTo(opx, my - 10);
          g.moveTo(opx, my + 10); g.lineTo(opx, y + h);
          g.stroke();
          g.strokeRect(opx - 5, my - 10, 10, 20);
          g.beginPath(); g.moveTo(opx - 3, my + 6); g.quadraticCurveTo(opx - 1, my - 7, opx + 3, my - 5); g.stroke();
        }
        break;
      }
      case 'emergency_stop_nc': {
        var eLatched = !!opts.latched;
        closed = !eLatched && ((!opts.pressed && opts.forceState !== 'open') || opts.forceState === 'closed');
        tip = contato(g, cx, y, h, t, b, 'NF', closed);
        var ex = ax - 1 + (eLatched ? 2 : 0);
        tracejado(g, laminaX(cx, b, tip, my), ex, my);
        /* retencao: pequeno triangulo sobre o tracejado */
        var rx = (laminaX(cx, b, tip, my) + ex) / 2;
        g.beginPath(); g.moveTo(rx - 2.5, my - 4); g.lineTo(rx + 2.5, my - 4); g.lineTo(rx, my); g.closePath(); g.stroke();
        /* cogumelo: cupula + haste */
        if (eLatched) g.strokeStyle = K.fault;
        g.beginPath(); g.arc(ex - 1, my, 6.5, Math.PI / 2, Math.PI * 1.5, false); g.closePath(); g.stroke();
        break;
      }
      case 'buzzer': {
        var zon = running && energized;
        var zc = zon ? K.amber : color;
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, my - 9);
        g.moveTo(cx, my + 3); g.lineTo(cx, y + h);
        g.stroke();
        g.strokeStyle = zc;
        g.beginPath(); g.moveTo(cx - 12, my - 9); g.lineTo(cx + 12, my - 9); g.arc(cx, my - 9, 12, 0, Math.PI, false); g.closePath();
        if (zon) { g.fillStyle = zc; g.globalAlpha = 0.27; g.fill(); g.globalAlpha = 1; }
        g.stroke();
        if (zon) {
          g.beginPath(); g.arc(cx, my - 9, 17, 0.25 * Math.PI, 0.75 * Math.PI, false); g.stroke();
        }
        break;
      }
      case 'motor_1ph': {
        var r1 = Math.min(w, h) * 0.32;
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, my - r1);
        g.moveTo(cx, my + r1); g.lineTo(cx, y + h);
        g.stroke();
        g.beginPath(); g.arc(cx, my, r1, 0, Math.PI * 2);
        if (energized && running) { g.fillStyle = K.energizedFill; g.fill(); g.fillStyle = color; }
        g.stroke();
        g.font = fnt(opts, 11, true);
        txt(g, 'M', cx, my - 3, 0, 0, 11);
        g.font = fnt(opts, 9, true);
        txt(g, '1~', cx, my + 8, 0, 0, 9);
        break;
      }
      case 'junction':
        g.fillStyle = fault ? K.fault : color;
        g.beginPath(); g.arc(x + w / 2, y + h / 2, 3, 0, Math.PI * 2); g.fill();
        break;
      case 'ground':
        g.beginPath();
        g.moveTo(cx, y); g.lineTo(cx, y + h * 0.5);
        g.moveTo(cx - w * 0.3, y + h * 0.5); g.lineTo(cx + w * 0.3, y + h * 0.5);
        g.moveTo(cx - w * 0.2, y + h * 0.66); g.lineTo(cx + w * 0.2, y + h * 0.66);
        g.moveTo(cx - w * 0.1, y + h * 0.82); g.lineTo(cx + w * 0.1, y + h * 0.82);
        g.stroke();
        break;
      default:
        g.strokeRect(x, y, w, h);
    }

    bornes(g, id, box, opts, color, K, quarter(opts.rot));
    if (opts.label && !SEM_ROTULO[id]) {
      g.font = fnt(opts, 9, true);
      g.fillStyle = color;
      txt(g, String(opts.label), x - 3, my, -1, 0, 9);
    }
  }

  /* ---------- SVG: o mesmo codigo de draw() executado sobre um "contexto" que emite elementos SVG ---------- */
  function esc(s) {
    if (EO.dom && EO.dom.esc) return EO.dom.esc(s);
    return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; });
  }
  function num(v) { return String(Math.round(v * 1000) / 1000); }

  function svgContext(softFill) {
    var out = [];
    var d = '';
    var cur = null;
    var start = null;
    var s = {
      strokeStyle: 'currentColor', fillStyle: 'currentColor', lineWidth: 1, font: '10px monospace', textAlign: 'start',
      globalAlpha: 1, shadowBlur: 0, shadowColor: '', lineCap: 'butt', lineJoin: 'miter', dash: []
    };
    var api = {};
    function m(x, y) { d += 'M' + num(x) + ' ' + num(y); cur = [x, y]; start = [x, y]; }
    function l(x, y) { if (!cur) { m(x, y); return; } d += 'L' + num(x) + ' ' + num(y); cur = [x, y]; }
    function strokeAttrs() {
      return 'fill="none" style="stroke:' + s.strokeStyle + ';stroke-width:' + num(s.lineWidth) + ';stroke-linecap:' + s.lineCap +
        ';stroke-linejoin:' + s.lineJoin + (s.dash.length ? ';stroke-dasharray:' + s.dash.join(' ') : '') + '"';
    }
    function fillAttrs() {
      var op = (s.fillStyle === softFill) ? 0.2 : s.globalAlpha;
      return 'style="fill:' + s.fillStyle + (op !== 1 ? ';fill-opacity:' + num(op) : '') + '"';
    }
    function rect(x, y, w, h) { return 'x="' + num(x) + '" y="' + num(y) + '" width="' + num(w) + '" height="' + num(h) + '"'; }
    api.beginPath = function () { d = ''; cur = null; start = null; };
    api.moveTo = m;
    api.lineTo = l;
    api.closePath = function () { if (start) { d += 'Z'; cur = start; } };
    api.arc = function (cx, cy, r, a0, a1, ccw) {
      var TAU = Math.PI * 2, delta, x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      if (!ccw) { delta = a1 - a0; if (delta >= TAU) delta = TAU; else { delta = ((delta % TAU) + TAU) % TAU; } }
      else { delta = a0 - a1; if (delta >= TAU) delta = -TAU; else { delta = -(((delta % TAU) + TAU) % TAU); } }
      if (cur) l(x0, y0); else m(x0, y0);
      if (Math.abs(delta) >= TAU - 1e-9) {
        var xm = cx + r * Math.cos(a0 + Math.PI), ym = cy + r * Math.sin(a0 + Math.PI);
        d += 'A' + num(r) + ' ' + num(r) + ' 0 1 ' + (delta > 0 ? 1 : 0) + ' ' + num(xm) + ' ' + num(ym);
        d += 'A' + num(r) + ' ' + num(r) + ' 0 1 ' + (delta > 0 ? 1 : 0) + ' ' + num(x0) + ' ' + num(y0);
        cur = [x0, y0];
      } else {
        var x1 = cx + r * Math.cos(a0 + delta), y1 = cy + r * Math.sin(a0 + delta);
        d += 'A' + num(r) + ' ' + num(r) + ' 0 ' + (Math.abs(delta) > Math.PI ? 1 : 0) + ' ' + (delta > 0 ? 1 : 0) + ' ' + num(x1) + ' ' + num(y1);
        cur = [x1, y1];
      }
    };
    api.bezierCurveTo = function (a, b, c, e, x, y) { d += 'C' + num(a) + ' ' + num(b) + ' ' + num(c) + ' ' + num(e) + ' ' + num(x) + ' ' + num(y); cur = [x, y]; };
    api.quadraticCurveTo = function (a, b, x, y) { d += 'Q' + num(a) + ' ' + num(b) + ' ' + num(x) + ' ' + num(y); cur = [x, y]; };
    api.setLineDash = function (a) { s.dash = a.slice(); };
    api.stroke = function () { if (d) out.push('<path d="' + d + '" ' + strokeAttrs() + '/>'); };
    api.fill = function () { if (d) out.push('<path d="' + d + '" ' + fillAttrs() + '/>'); };
    api.strokeRect = function (x, y, w, h) { out.push('<rect ' + rect(x, y, w, h) + ' ' + strokeAttrs() + '/>'); };
    api.fillRect = function (x, y, w, h) { out.push('<rect ' + rect(x, y, w, h) + ' ' + fillAttrs() + '/>'); };
    api.fillText = function (txt_, x, y) {
      var f = /^(bold )?([\d.]+)px/.exec(s.font) || [];
      var anchor = s.textAlign === 'center' ? 'middle' : (s.textAlign === 'right' ? 'end' : 'start');
      out.push('<text x="' + num(x) + '" y="' + num(y) + '" text-anchor="' + anchor + '" style="fill:' + s.fillStyle +
        ';font:' + (f[1] ? 'bold ' : '') + (f[2] || 10) + 'px var(--font-mono, monospace)">' + esc(txt_) + '</text>');
    };
    Object.keys(s).forEach(function (k) {
      if (k === 'dash') return;
      Object.defineProperty(api, k, { get: function () { return s[k]; }, set: function (v) { s[k] = v; }, enumerable: true });
    });
    api.__out = out;
    return api;
  }

  var SVG_COLORS = {
    color: 'currentColor',
    l1: 'var(--accent, currentColor)', l2: 'var(--accent2, currentColor)', l3: 'var(--accent4, currentColor)',
    n: 'var(--accent, currentColor)', bg: 'var(--bg, transparent)',
    fault: 'var(--fault, currentColor)', energizedFill: 'var(--live, currentColor)', amber: 'var(--live, currentColor)',
    lamp: { red: 'var(--fault, currentColor)', amber: 'var(--live, currentColor)', blue: 'var(--brand, currentColor)', white: 'var(--text, currentColor)', green: 'var(--live, currentColor)' }
  };

  function svgInner(id, o, dw, dh) {
    var g = svgContext(SVG_COLORS.energizedFill);
    var estado = o.estado;
    var energizado = !!o.energizado, falha = !!o.falha;
    var fechado = (estado === 'fechado' || estado === 'closed');
    var aberto = (estado === 'aberto' || estado === 'open');
    var po = {
      colors: SVG_COLORS, running: energizado, coilOn: energizado,
      forceState: fechado ? 'closed' : (aberto ? 'open' : ''),
      pressed: fechado, selected: fechado, fault: falha, energized: energizado,
      lampColor: o.corLampada || 'green', time: o.tempo || 3, timerAcc: 0,
      timerClosed: estado ? fechado : energizado,
      motor: o.motor, rot: o.rot, flip: o.flip, label: o.rotulo,
      terminais: Array.isArray(o.terminais) ? o.terminais : (o.numeracao ? true : undefined), latched: !!o.latched, seq: o.seq, fontFamily: 'monospace'
    };
    draw(g, id, { x: 0, y: 0, w: dw, h: dh }, po);
    return g.__out.join('');
  }

  function toSVG(id, opts) {
    var def = DEFS[id];
    if (!def) throw new Error('simbolo desconhecido: ' + id);
    var o = opts || {};
    var cat = CAT_BY_ID[id];
    var dw = def.w * GRID, dh = def.h * GRID;
    var rot = quarter(o.rot) * 90, flip = !!o.flip;
    var odd = (rot / 90) % 2 === 1;
    var W = odd ? dh : dw, H = odd ? dw : dh;
    var mg = { l: 4, t: 4, r: 4, b: 4 };
    function ext(dx, dy, n) {
      var v = xvec(dx, dy, rot, flip);
      if (v.x < -0.5) mg.l += n; else if (v.x > 0.5) mg.r += n; else if (v.y < -0.5) mg.t += n; else mg.b += n;
    }
    if (o.rotulo && !SEM_ROTULO[id]) ext(-1, 0, 22);
    if (id === 'timer_relay' || id === 'timer_relay_off') ext(1, 0, 48);
    if (id === 'power_24v' || id === 'power_0v') ext(1, 0, 16);
    if (BORNE_LADO[id] && odd && (o.numeracao || Array.isArray(o.terminais))) ext(0, -1, 16);
    var body = svgInner(id, o, dw, dh);
    var estadoCls = o.falha ? 'eo-sym-fault' : (o.energizado ? 'eo-sym-live' : 'eo-sym-dead');
    var vw = W + mg.l + mg.r, vh = H + mg.t + mg.b;
    var vb = (-mg.l) + ' ' + (-mg.t) + ' ' + vw + ' ' + vh;
    var size = o.size ? ' width="' + num(o.size * vw / vh) + '" height="' + num(o.size) + '"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="eo-sym ' + estadoCls + '" viewBox="' + vb + '"' + size +
      ' role="img" aria-label="' + esc(cat ? cat.nome : def.nome) + '" data-eo-symbol="' + esc(id) + '" fill="none">' + body + '</svg>';
  }

  function hydrate(rootEl) {
    var scope = rootEl || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return 0;
    var nodes = scope.querySelectorAll('svg[data-eo-symbol]');
    var n = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.getAttribute('data-eo-symbol');
      if (!DEFS[id]) continue;
      var full = toSVG(id, {
        estado: el.getAttribute('data-eo-estado') || undefined,
        energizado: el.getAttribute('data-eo-energizado') === 'true',
        falha: el.getAttribute('data-eo-falha') === 'true',
        rotulo: el.getAttribute('data-eo-rotulo') || undefined,
        rot: parseInt(el.getAttribute('data-eo-rot'), 10) || 0,
        flip: el.getAttribute('data-eo-flip') === 'true',
        numeracao: el.getAttribute('data-eo-numeracao') === 'true'
      });
      var vb = /viewBox="([^"]+)"/.exec(full)[1];
      var cls = /class="([^"]+)"/.exec(full)[1];
      var label = /aria-label="([^"]*)"/.exec(full)[1];
      var inner = full.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      el.setAttribute('viewBox', vb);
      el.setAttribute('class', cls);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', label.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
      el.setAttribute('fill', 'none');
      el.innerHTML = inner;
      n++;
    }
    return n;
  }

  function naoImpl() { throw new Error('nao implementado (etapa 4.3)'); }

  EO.render.symbols = {
    GRID: GRID,
    NORMA: NORMA,
    list: list,
    listAll: listAll,
    catalog: catalog,
    get: get,
    categorias: categorias,
    xform: xform,
    terminalPoints: terminalPoints,
    applyGeometry: applyGeometry,
    draw: draw,
    toSVG: toSVG,
    hydrate: hydrate,
    ladder: { contact: naoImpl, output: naoImpl },
    _aux: {
      vertContactDraw: vertContactDraw, vertPushbutton: vertPushbutton, thermalBimetalDraw: thermalBimetalDraw,
      contactVisualNA_Closed: function (o, coilOn) { return visNA(o, coilOn); },
      contactVisualNC_Closed: function (o, coilOn) { return visNC(o, coilOn); }
    }
  };
  if (typeof module !== 'undefined') module.exports = EO.render.symbols;
})(typeof window !== 'undefined' ? window : globalThis);
