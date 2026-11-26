/* render/symbols-legado.js - COPIA FIEL CONGELADA do desenho de symbols.js anterior a E1 (Acionamentos v2, E0). NAO e carregado por nenhuma pagina: oraculo de fidelidade dos testes (tests/render/symbols-legado.test.js). Nao editar. Original: render/symbols.js - biblioteca unica de simbolos do Aciona (Fase 4, etapa 4.0).
 *
 * TRANSCRICAO FIEL de drawSymbolIecVertical / vertContactDraw / vertPushbutton / thermalBimetalDraw /
 * contactVisualNA_Closed / contactVisualNC_Closed (legacy/aciona.js, commit 013b2f0): mesmas primitivas de
 * canvas, mesma ordem, mesma geometria, mesmos casos de SYMBOL_DEFS. A simbologia NAO foi alterada.
 * Norma de referencia dos simbolos: IEC 60617 (a confirmar). Nenhuma pagina carrega este arquivo ainda.
 *
 * API
 *   EO.render.symbolsLegado.list()                       -> [{id, nome, norma, w, h, portas:[{x,y}]}]  (w/h em celulas de grade;
 *                                                       1 celula = GRID px; portas em fracao 0..1 da caixa)
 *   EO.render.symbolsLegado.draw(ctx, id, box, opts)     -> desenha no canvas 2D. box = {x, y, w, h, cx?} em px (cx padrao x+w/2).
 *   EO.render.symbolsLegado.toSVG(id, {estado, energizado, falha, rotulo, size}) -> string '<svg ...>' (currentColor + classes)
 *   EO.render.symbolsLegado.hydrate(root)                -> preenche <svg data-eo-symbol="id" [data-eo-estado|-energizado|-falha|-rotulo]>
 *   EO.render.symbolsLegado.ladder.contact/output        -> reservado para a etapa 4.3 (lanca "nao implementado")
 *
 * opts de draw (substitui as globais do legado; o chamador as resolve a partir do componente c e do simulador):
 *   color        cor de tracado principal (legado: parametro `color`; pode ser tambem opts.colors.color)
 *   colors       {color,l1,l2,l3,n,bg,fault,energizedFill,amber,lamp:{red,amber,blue,white,green}}
 *                Legado: l1/n=C('--accent'), l2=C('--accent2'), l3=C('--accent4'), bg=C('--bg'), fault, energizedFill,
 *                amber e lamp.* eram literais fixos. Padrao aqui: 'currentColor' (sem hex); energizedFill padrao
 *                'rgba(128,128,128,0.2)'. Na etapa 4.2 o chamador passa tokens (--live/--dead/--fault) resolvidos via C().
 *   running      simRunning          coilOn   simRunning && lastEnergizedCoilIds.has(c.id)
 *   forceState   c.forceState ('', 'open', 'closed')       pressed   c._pressed       selected  c._selected
 *   fault        c.fault   energized  c.energized   lampColor  c.color ('red'|'amber'|'blue'|'white'|'green')
 *   time         c.time (temporizadores)   timerAcc  maior c._tAcc entre contatos temporizados de mesmo id
 *   timerClosed  resultado de timerContactConductsNow(c) quando running (contatos temporizados); quando nao
 *                running usa o repouso (NF fechado, NA aberto), como no legado.
 * Diferencas em relacao ao legado: (1) cores vem de opts em vez de C()/literais; (2) lampada usa '<cor>44' so se a
 * cor for #rrggbb, senao globalAlpha 0.27 (preenchimento translucido); (3) o legado tambem desenha id/portas em
 * drawComponent - isso NAO esta aqui (fica em diagram-canvas.js, etapa 4.2). */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.render = EO.render || {};

  var GRID = 20;
  var NORMA = 'IEC 60617 (a confirmar)';
  var P2 = [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }];
  var P3 = [{ x: 0.25, y: 0 }, { x: 0.5, y: 0 }, { x: 0.75, y: 0 }];
  var P1 = [{ x: 0.5, y: 0 }];

  /* Copia dos dados geometricos de SYMBOL_DEFS (legacy/aciona.js a:86-116). Ordem e valores preservados. */
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

  /* Simbolos da etapa 4.4 (geometria/portas = sim/defs-extra.js). Nomenclatura e bornes: IEC 60034-8 / IEC 60617 — a confirmar.
   * Ficam fora de IDS/list() por padrao (o teste de fidelidade exige list() == 29 ids do legado);
   * use list({extras:true}) ou listAll(). */
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

  function clonePortas(p) { return p.map(function (q) { return { x: q.x, y: q.y }; }); }

  function listAll() { return list({ extras: true }); }

  function list(o) {
    var ids = (o && o.extras) ? IDS.concat(EXTRA_IDS) : IDS;
    return ids.map(function (id) {
      var d = DEFS[id];
      return { id: id, nome: d.nome, norma: NORMA, w: d.w, h: d.h, portas: clonePortas(d.portas) };
    });
  }

  /* ---------- estado visual de contatos (transcricao de contactVisualNA/NC_Closed) ---------- */
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

  /* ---------- auxiliares (transcricao de vertContactDraw / vertPushbutton / thermalBimetalDraw) ---------- */
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
      if (closed) {
        ctx.beginPath(); ctx.moveTo(cX, t); ctx.lineTo(cX, b); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(cX, b); ctx.lineTo(cX - 6, t); ctx.stroke();
      }
    } else {
      if (closed) {
        ctx.beginPath(); ctx.moveTo(cX, t); ctx.lineTo(cX, b);
        ctx.moveTo(cx - 2.5, t); ctx.lineTo(cX, t);
        ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(cX, b); ctx.lineTo(cX - 6, t); ctx.stroke();
      }
    }
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
    ctx.beginPath();
    ctx.arc(cx, t, 2.5, 0, Math.PI * 2);
    ctx.arc(cx, b, 2.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, t - 14);
    ctx.lineTo(cx, t - 2.5);
    ctx.moveTo(cx, b + 2.5);
    ctx.lineTo(cx, b + 14);
    ctx.stroke();

    var cX = cx - 4;
    ctx.beginPath();
    if (closed) {
      ctx.moveTo(cX, t);
      ctx.lineTo(cX, b);
      if (kind === 'NF') { ctx.moveTo(cx - 2.5, t); ctx.lineTo(cX, t); }
    } else {
      ctx.moveTo(cX, b);
      ctx.lineTo(cX - 6, t);
    }
    ctx.stroke();

    var midY = t + (b - t) / 2;
    var shaftX = (closed ? cX : cX - 3);

    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(shaftX, midY);
    ctx.lineTo(cx - 16, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    var ax = cx - 16;
    ctx.beginPath();
    ctx.moveTo(ax, midY - 6);
    ctx.lineTo(ax, midY + 6);
    ctx.moveTo(ax, midY - 6); ctx.lineTo(ax - 4, midY - 6);
    ctx.moveTo(ax, midY + 6); ctx.lineTo(ax - 4, midY + 6);
    ctx.moveTo(ax, midY); ctx.lineTo(ax - 4, midY);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax + 3, midY);
    ctx.lineTo(ax + 7, midY - 3);
    ctx.lineTo(ax + 7, midY + 3);
    ctx.closePath();
    ctx.fill();
  }

  /* No legado e codigo sem chamadores (so definido). Mantido por fidelidade; exposto em EO.render.symbolsLegado._aux. */
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

  /* ---------- simbolos 4.4: contator de potencia 3P, motor 3~ (6T/3T), juncao ---------- */
  var XP3 = [0.2, 0.5, 0.8];
  var LEAD_T6 = ['U1', 'V1', 'W1'], LEAD_B6 = ['U2', 'V2', 'W2'], LEAD_T3 = ['U', 'V', 'W'];

  function contactorMain3p(ctx, K, box, opts, closed) {
    var x = box.x || 0, y = box.y || 0, w = box.w, h = box.h;
    var t = y + h * 0.22, b = y + h * 0.78, my = y + h / 2;
    var link = [];
    ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
      var px = x + w * XP3[i];
      vertContactDraw(ctx, px, t, b, 'NA', closed, false);
      /* prolonga as hastes ate as portas (y e y+h) */
      ctx.beginPath();
      ctx.moveTo(px, y); ctx.lineTo(px, t - 14);
      ctx.moveTo(px, b + 14); ctx.lineTo(px, y + h);
      ctx.stroke();
      link.push(closed ? px - 4 : px - 7);
    }
    /* acoplamento mecanico: tracejado ligando o meio das tres laminas */
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(link[0], my);
    ctx.lineTo(link[2], my);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    if (opts.label) {
      ctx.font = 'bold 9px Space Mono';
      ctx.fillStyle = K.color;
      ctx.textAlign = 'right';
      ctx.fillText(String(opts.label), x + w - 1, my - 4);
    }
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
  function motor3(ctx, K, box, opts, six) {
    var x = box.x || 0, y = box.y || 0, w = box.w, h = box.h;
    var cx = x + w / 2, my = y + h / 2, r = Math.min(w, h) * 0.25;
    var m = opts.motor || {};
    var estado = m.estado || (opts.energized ? 'ligado' : 'parado');
    var girando = (estado === 'Y' || estado === 'Δ' || estado === 'ligado');
    var stroke = opts.fault ? K.fault : K.color;
    var tl = six ? LEAD_T6 : LEAD_T3;
    var i, px;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = stroke;
    ctx.lineWidth = 2;
    ctx.font = '8px Space Mono';
    /* bornes em cima (e embaixo no 6T): haste ate a porta + rotulo */
    for (i = 0; i < 3; i++) {
      px = x + w * XP3[i];
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, i === 1 ? my - r : y + 16);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillText(tl[i], px + 3, y + 10);
      if (six) {
        ctx.beginPath();
        ctx.moveTo(px, y + h);
        ctx.lineTo(px, i === 1 ? my + r : y + h - 16);
        ctx.stroke();
        ctx.fillText(LEAD_B6[i], px + 3, y + h - 5);
      }
    }
    /* corpo: circulo (tracejado = incompleto; preenchimento suave = girando) */
    if (estado === 'incompleto') ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, my, r, 0, Math.PI * 2);
    if (girando) { ctx.fillStyle = K.energizedFill; ctx.fill(); ctx.fillStyle = stroke; }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px Space Mono';
    ctx.fillText('M', cx, my - 1);
    ctx.font = 'bold 9px Space Mono';
    ctx.fillText('3~', cx, my + 10);
    /* estado em texto (nunca so cor): Y, Δ, ON, 0 (parado), ? (incompleto) */
    var txt = estado === 'Y' ? 'Y' : estado === 'Δ' ? 'Δ' : estado === 'ligado' ? 'ON' : estado === 'incompleto' ? '?' : '0';
    ctx.font = 'bold 11px Space Mono';
    ctx.textAlign = 'left';
    ctx.fillText(txt, x + 2, my + 4);
    /* sentido de giro: seta curva horaria (direta) / anti-horaria (inversa), so girando */
    if (girando && (m.sequencia === 'direta' || m.sequencia === 'inversa')) {
      var ra = r + 5, a0 = -0.3 * Math.PI, a1 = 0.3 * Math.PI, cw = m.sequencia === 'direta';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (cw) ctx.arc(cx, my, ra, a0, a1, false); else ctx.arc(cx, my, ra, a1, a0, true);
      ctx.stroke();
      var ae = cw ? a1 : a0;
      var sg = cw ? 1 : -1;
      arrowHead(ctx, cx + ra * Math.cos(ae), my + ra * Math.sin(ae), -Math.sin(ae) * sg, Math.cos(ae) * sg);
      ctx.lineWidth = 2;
    }
  }

  /* ---------- draw: transcricao de drawSymbolIecVertical ---------- */
  function draw(ctx, id, box, opts) {
    opts = opts || {};
    var K = resolveColors(opts);
    var color = K.color;
    var x = box.x || 0, y = box.y || 0, w = box.w, h = box.h;
    var cx = (box.cx !== undefined && box.cx !== null) ? box.cx : x + w / 2;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    var my = y + h / 2;
    var t = y + h * 0.22;
    var b = y + h * 0.78;
    var running = !!opts.running;
    var coilOn = !!opts.coilOn;
    var c = opts; // componente achatado: forceState, pressed, selected, fault, energized, lampColor, time, timerAcc
    var fault = !!opts.fault;
    var energized = !!opts.energized;
    var closed;

    switch (id) {
      case 'power_l1':
        ctx.strokeStyle = K.l1;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h); ctx.stroke();
        ctx.font = 'bold 11px Space Mono';
        ctx.fillStyle = K.l1;
        ctx.textAlign = 'center';
        ctx.fillText('L1', cx, y + h / 2 + 4);
        break;
      case 'power_l2':
        ctx.strokeStyle = K.l2;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h); ctx.stroke();
        ctx.font = 'bold 11px Space Mono';
        ctx.fillStyle = K.l2;
        ctx.textAlign = 'center';
        ctx.fillText('L2', cx, y + h / 2 + 4);
        break;
      case 'power_l3':
        ctx.strokeStyle = K.l3;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h); ctx.stroke();
        ctx.font = 'bold 11px Space Mono';
        ctx.fillStyle = K.l3;
        ctx.textAlign = 'center';
        ctx.fillText('L3', cx, y + h / 2 + 4);
        break;
      case 'power_n':
        ctx.strokeStyle = K.n;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = 'bold 11px Space Mono';
        ctx.fillStyle = K.n;
        ctx.fillText('N', cx, y + h / 2 + 4);
        break;
      case 'contact_no':
        closed = visNA(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NA', closed, false);
        break;
      case 'contact_phase_loss_no':
        closed = visNA(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NA', closed, false);
        ctx.font = 'bold 7px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText('U<', cx - 14, my + 2);
        break;
      case 'contact_phase_loss_nc':
        closed = visNC(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NF', closed, false);
        ctx.font = 'bold 7px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText('U<', cx - 14, t + 4);
        break;
      case 'contact_phase_seq_no':
        closed = visNA(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NA', closed, false);
        ctx.font = 'bold 10px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText('↺', cx - 14, my + 3);
        break;
      case 'contact_phase_seq_nc':
        closed = visNC(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NF', closed, false);
        ctx.font = 'bold 10px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText('↺', cx - 14, t + 5);
        break;
      case 'contact_timer_on_no':
      case 'contact_timer_off_no':
      case 'contact_timer_on_nc':
      case 'contact_timer_off_nc': {
        var isNO = /_no$/.test(id);
        var isOffDelay = id.indexOf('_off') !== -1;
        closed = running ? !!opts.timerClosed : (!isNO);
        vertContactDraw(ctx, cx, t, b, isNO ? 'NA' : 'NF', closed, false);

        var cXt = cx - 4;
        var topXt = closed ? cXt : (isNO ? cXt - 6 : cXt + 6);

        ctx.setLineDash([2, 1]);
        ctx.beginPath();
        ctx.moveTo(topXt, t + (b - t) / 2);
        ctx.lineTo(cx - 14, t + (b - t) / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        if (!isOffDelay) {
          ctx.arc(cx - 14, t + (b - t) / 2, 5, Math.PI / 2, -Math.PI / 2, false);
        } else {
          ctx.arc(cx - 14, t + (b - t) / 2, 5, -Math.PI / 2, Math.PI / 2, false);
        }
        ctx.stroke();

        ctx.font = 'bold 7px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(isOffDelay ? 't↓' : 't↑', cx + 12, b + 14);
        break;
      }
      case 'contact_nc':
        closed = visNC(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NF', closed, false);
        break;
      case 'limit_switch_no': {
        closed = visNA(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NA', closed, false);
        var cXl = cx - 4;
        var topXl = closed ? cXl : cXl - 6;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(topXl, t + (b - t) / 2);
        ctx.lineTo(cx - 16, t + (b - t) / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cx - 16, t + (b - t) / 2 - 4);
        ctx.lineTo(cx - 16, t + (b - t) / 2 + 4);
        ctx.stroke();
        break;
      }
      case 'pushbutton_no':
        closed = !!opts.pressed || opts.forceState === 'closed';
        vertPushbutton(ctx, cx, t, b, 'NA', closed, color);
        break;
      case 'pushbutton_nc':
        closed = (!opts.pressed && opts.forceState !== 'open') || opts.forceState === 'closed';
        vertPushbutton(ctx, cx, t, b, 'NF', closed, color);
        break;
      case 'selector_2pos': {
        closed = !!opts.selected || opts.forceState === 'closed';
        vertContactDraw(ctx, cx, t, b, 'NA', closed, false);
        var cXs = cx - 4;
        var topXs = closed ? cXs : cXs - 6;
        ctx.beginPath();
        ctx.moveTo(topXs, t + (b - t) / 2);
        ctx.lineTo(cx - 6, t + (b - t) / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 10, t + (b - t) / 2, 4, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'relay_phase_loss':
      case 'relay_phase_seq': {
        ctx.lineWidth = 1.5;
        var chm = h * 0.25;
        var cwm = w * 0.45;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.25, y);
        ctx.lineTo(cx - w * 0.25, my - chm);
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, my - chm);
        ctx.moveTo(cx + w * 0.25, y);
        ctx.lineTo(cx + w * 0.25, my - chm);
        ctx.stroke();

        var rxm = cx - cwm / 2;
        ctx.strokeRect(rxm, my - chm, cwm, chm * 2);

        ctx.font = 'bold ' + (id === 'relay_phase_loss' ? '8px' : '6.5px') + ' Space Mono';
        ctx.fillStyle = fault ? K.fault : color;
        ctx.textAlign = 'center';
        if (id === 'relay_phase_loss') {
          ctx.fillText('U<', cx, my + 3);
        } else {
          ctx.fillText('L1L2', cx, my - 1);
          ctx.fillText('L3', cx, my + 6);
        }
        if (energized && running && !fault) {
          ctx.fillStyle = K.energizedFill;
          ctx.fillRect(rxm, my - chm, cwm, chm * 2);
        }
        break;
      }
      case 'coil':
      case 'timer_relay':
      case 'timer_relay_off': {
        ctx.lineWidth = 1.5;
        var ch = h * 0.25;
        var cw = w * 0.45;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, my - ch);
        ctx.moveTo(cx, my + ch);
        ctx.lineTo(cx, y + h);
        ctx.stroke();

        var rx0 = cx - cw / 2;
        ctx.strokeRect(rx0, my - ch, cw, ch * 2);

        if (id === 'timer_relay') {
          ctx.strokeRect(rx0, my - ch, cw * 0.4, ch * 2);
          ctx.beginPath();
          ctx.moveTo(rx0, my - ch);
          ctx.lineTo(rx0 + cw * 0.4, my + ch);
          ctx.moveTo(rx0 + cw * 0.4, my - ch);
          ctx.lineTo(rx0, my + ch);
          ctx.stroke();
        }

        if (id === 'timer_relay_off') {
          ctx.strokeRect(rx0, my - ch, cw * 0.4, ch * 2);
          ctx.fillStyle = color;
          ctx.fillRect(rx0, my - ch, cw * 0.4, ch * 2);
        }

        ctx.font = 'bold 8px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText('A1', cx + cw / 2 + 8, my - ch + 6);
        ctx.fillText('A2', cx + cw / 2 + 8, my + ch - 2);

        if (energized && running) {
          ctx.fillStyle = K.energizedFill;
          ctx.fillRect(rx0, my - ch, cw, ch * 2);
        }
        if ((id === 'timer_relay' || id === 'timer_relay_off') && running) {
          var T = Math.max(0.05, parseFloat(opts.time) || 3);
          var remaining = Math.max(0, T - (opts.timerAcc || 0));
          ctx.font = 'bold 7px Space Mono';
          ctx.fillStyle = energized ? K.amber : color;
          ctx.textAlign = 'center';
          ctx.fillText(remaining.toFixed(1) + 's/' + T.toFixed(1) + 's', cx, my + ch + 12);
        } else if ((id === 'timer_relay' || id === 'timer_relay_off') && !running) {
          var T2 = Math.max(0.05, parseFloat(opts.time) || 3);
          ctx.font = 'bold 7px Space Mono';
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.fillText('T=' + T2.toFixed(1) + 's', cx, my + ch + 12);
        }
        break;
      }
      case 'overload_relay': {
        closed = visNC(c, coilOn);
        vertContactDraw(ctx, cx, t, b, 'NF', closed, false);
        var cXo = cx - 4;
        var topXo = closed ? cXo : cXo - 6;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(topXo, t + (b - t) / 2);
        ctx.lineTo(cx - 10, t + (b - t) / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(cx - 10, t + (b - t) / 2 - 8);
        ctx.lineTo(cx - 10, t + (b - t) / 2 + 8);
        var px = cx - 10;
        var py = t + (b - t) / 2 - 6;
        ctx.moveTo(px, py); ctx.lineTo(px - 4, py); py += 4;
        ctx.lineTo(px - 4, py); ctx.lineTo(px, py); py += 4;
        ctx.lineTo(px, py); ctx.lineTo(px - 4, py); py += 4;
        ctx.lineTo(px - 4, py); ctx.lineTo(px, py);
        ctx.stroke();
        if (fault) {
          ctx.strokeStyle = K.fault;
          ctx.beginPath();
          ctx.arc(cx - 4, my, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      case 'fuse':
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, my - 12);
        ctx.moveTo(cx, my + 12);
        ctx.lineTo(cx, y + h);
        ctx.stroke();

        ctx.fillStyle = K.bg;
        ctx.fillRect(cx - 6, my - 12, 12, 24);
        ctx.strokeRect(cx - 6, my - 12, 12, 24);

        if (!fault) {
          ctx.beginPath();
          ctx.moveTo(cx, my - 12);
          ctx.lineTo(cx, my + 12);
          ctx.stroke();
        } else {
          ctx.strokeStyle = K.fault;
          ctx.beginPath();
          ctx.moveTo(cx - 5, my - 5);
          ctx.lineTo(cx + 5, my + 5);
          ctx.stroke();
        }
        break;
      case 'circuit_breaker': {
        closed = !fault;
        vertContactDraw(ctx, cx, t, b, 'NA', closed, false);
        var cXb = cx - 4;
        var topXb = closed ? cXb : cXb - 6;
        ctx.beginPath();
        ctx.moveTo(topXb - 2, t + (b - t) / 2 - 2);
        ctx.lineTo(topXb + 2, t + (b - t) / 2 + 2);
        ctx.moveTo(topXb - 2, t + (b - t) / 2 + 2);
        ctx.lineTo(topXb + 2, t + (b - t) / 2 - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(topXb - 6, t + 4);
        ctx.lineTo(topXb - 6, b - 4);
        ctx.bezierCurveTo(topXb - 12, b - 4, topXb - 12, t + 4, topXb - 6, t + 4);
        ctx.stroke();
        if (fault) {
          ctx.strokeStyle = K.fault;
          ctx.beginPath();
          ctx.arc(cx - 4, my, 8, 0, Math.PI * 2);
          ctx.stroke();
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
        ctx.beginPath();
        ctx.arc(cx, my, rl, 0, Math.PI * 2);
        if (on) {
          if (/^#[0-9a-fA-F]{6}$/.test(lampColor)) {
            ctx.fillStyle = lampColor + '44';
            ctx.fill();
          } else {
            ctx.fillStyle = lampColor;
            ctx.globalAlpha = 0.27;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.shadowColor = lampColor;
          ctx.shadowBlur = 10;
        }
        ctx.strokeStyle = lampColor;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 8, my - 8);
        ctx.lineTo(cx + 8, my + 8);
        ctx.moveTo(cx + 8, my - 8);
        ctx.lineTo(cx - 8, my + 8);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, my - rl);
        ctx.moveTo(cx, my + rl);
        ctx.lineTo(cx, y + h);
        ctx.stroke();
        break;
      }
      case 'motor_3ph': {
        var r = Math.min(w, h) * 0.32;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 16, y + 4);
        ctx.lineTo(cx - 16, y + 12);
        ctx.moveTo(cx, y + 2);
        ctx.lineTo(cx, y + 12);
        ctx.moveTo(cx + 16, y + 4);
        ctx.lineTo(cx + 16, y + 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, my + 4, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = 'bold 11px Space Mono';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText('M', cx, my + 2);
        ctx.font = 'bold 9px Space Mono';
        ctx.fillText('3~', cx, my + 12);
        ctx.beginPath();
        ctx.moveTo(cx, my + 4 + r);
        ctx.lineTo(cx, y + h);
        ctx.stroke();
        break;
      }
      case 'contactor_main_3p':
        if (fault) ctx.strokeStyle = K.fault;
        contactorMain3p(ctx, K, box, opts, visNA(c, coilOn));
        break;
      case 'motor_3ph_6t':
        motor3(ctx, K, box, opts, true);
        break;
      case 'motor_3ph_3t':
        motor3(ctx, K, box, opts, false);
        break;
      case 'junction':
        ctx.fillStyle = fault ? K.fault : color;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'ground':
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, y + h * 0.45);
        ctx.lineTo(cx - w * 0.35, y + h * 0.45);
        ctx.lineTo(cx + w * 0.35, y + h * 0.45);
        ctx.lineTo(cx, y + h * 0.45);
        ctx.lineTo(cx, y + h * 0.65);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.25, y + h * 0.65);
        ctx.lineTo(cx + w * 0.25, y + h * 0.65);
        ctx.moveTo(cx - w * 0.15, y + h * 0.78);
        ctx.lineTo(cx + w * 0.15, y + h * 0.78);
        ctx.stroke();
        break;
      default:
        ctx.strokeRect(x, y, w, h);
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
      globalAlpha: 1, shadowBlur: 0, shadowColor: '', dash: []
    };
    var api = {};
    function m(x, y) { d += 'M' + num(x) + ' ' + num(y); cur = [x, y]; start = [x, y]; }
    function l(x, y) { if (!cur) { m(x, y); return; } d += 'L' + num(x) + ' ' + num(y); cur = [x, y]; }
    function strokeAttrs() {
      return 'fill="none" style="stroke:' + s.strokeStyle + ';stroke-width:' + num(s.lineWidth) + (s.dash.length ? ';stroke-dasharray:' + s.dash.join(' ') : '') + '"';
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
    api.fillText = function (txt, x, y) {
      var f = /^(bold )?([\d.]+)px/.exec(s.font) || [];
      var anchor = s.textAlign === 'center' ? 'middle' : (s.textAlign === 'right' ? 'end' : 'start');
      out.push('<text x="' + num(x) + '" y="' + num(y) + '" text-anchor="' + anchor + '" style="fill:' + s.fillStyle +
        ';font:' + (f[1] ? 'bold ' : '') + (f[2] || 10) + 'px var(--eo-font-mono, monospace)">' + esc(txt) + '</text>');
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
    l1: 'var(--eo-sym-l1, currentColor)', l2: 'var(--eo-sym-l2, currentColor)', l3: 'var(--eo-sym-l3, currentColor)',
    n: 'var(--eo-sym-n, currentColor)', bg: 'var(--eo-sym-bg, transparent)',
    fault: 'var(--fault, currentColor)', energizedFill: 'var(--live, currentColor)', amber: 'var(--live, currentColor)',
    lamp: { red: 'var(--fault, currentColor)', amber: 'var(--live, currentColor)', blue: 'var(--eo-sym-blue, currentColor)', white: 'var(--eo-sym-white, currentColor)', green: 'var(--live, currentColor)' }
  };

  function svgInner(id, o) {
    var def = DEFS[id];
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
      motor: o.motor
    };
    var box = { x: 0, y: 0, w: def.w * GRID, h: def.h * GRID };
    draw(g, id, box, po);
    return { body: g.__out.join(''), w: box.w, h: box.h };
  }

  function toSVG(id, opts) {
    var def = DEFS[id];
    if (!def) throw new Error('simbolo desconhecido: ' + id);
    var o = opts || {};
    var r = svgInner(id, o);
    var estadoCls = o.falha ? 'eo-sym-fault' : (o.energizado ? 'eo-sym-live' : 'eo-sym-dead');
    var extra = o.rotulo ? 20 : 8;
    var vb = '-4 -4 ' + (r.w + 8) + ' ' + (r.h + extra);
    var label = o.rotulo ? '<text x="' + num(r.w / 2) + '" y="' + num(r.h + 14) + '" text-anchor="middle" style="fill:currentColor;font:bold 9px var(--eo-font-mono, monospace)">' + esc(o.rotulo) + '</text>' : '';
    var size = o.size ? ' width="' + num(o.size * (r.w + 8) / (r.h + extra)) + '" height="' + num(o.size) + '"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="eo-sym ' + estadoCls + '" viewBox="' + vb + '"' + size +
      ' role="img" aria-label="' + esc(def.nome) + '" data-eo-symbol="' + esc(id) + '" fill="none">' + r.body + label + '</svg>';
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
        rotulo: el.getAttribute('data-eo-rotulo') || undefined
      });
      var vb = /viewBox="([^"]+)"/.exec(full)[1];
      var cls = /class="([^"]+)"/.exec(full)[1];
      var inner = full.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      el.setAttribute('viewBox', vb);
      el.setAttribute('class', cls);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', DEFS[id].nome);
      el.setAttribute('fill', 'none');
      el.innerHTML = inner;
      n++;
    }
    return n;
  }

  function naoImpl() { throw new Error('nao implementado (etapa 4.3)'); }

  EO.render.symbolsLegado = {
    GRID: GRID,
    NORMA: NORMA,
    list: list,
    listAll: listAll,
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
  if (typeof module !== 'undefined') module.exports = EO.render.symbolsLegado;
})(typeof window !== 'undefined' ? window : globalThis);
