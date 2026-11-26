/* render/diagram-canvas.js - render do diagrama do Aciona (Fase 4, etapa 4.2).
 * Extraido de legacy/aciona.js (renderDiagram, drawDiagGrid, drawWireLine, drawComponent, resizeDiagCanvas,
 * exportDiagram). Os simbolos sao desenhados por EO.render.symbols.draw (fonte unica).
 *
 * API
 *   EO.render.diagram.resize(canvas, wrap) -> {W, H, dpr}   W/H em px CSS; largura fisica = W*dpr.
 *   EO.render.diagram.render(ctx, view, model, sim)
 *     view  = {zoom, pan:{x,y}, W, H, dpr?, grid?, dark?, tool?, reducedMotion?, token?(nome)->cor}
 *             W/H em px CSS. Se dpr for informado, aplica setTransform(dpr,0,0,dpr,0,0) antes de desenhar.
 *     model = {components, wires (from/to/pts?), defs, terminalLabels? (uid -> [bornes]), selection:{comps, wires}, hover, wireStart, mouseWorld,
 *              preview:{sym,x,y}|null, selectedSymbol}
 *     sim   = {running, phase (0..19), coilIds:Set} ou null (editor parado)
 *   EO.render.diagram.exportPNG(canvas, nome?)  baixa o PNG do canvas (inclui a resolucao fisica).
 *   EO.render.diagram.reducedMotion() / tokens() / portWorld(c, defs, pi) auxiliares.
 * Cores: --live (energizado), --dead (desenergizado), --fault (falha: hachura + icone, nunca so cor), --brand (selecao).
 * Lampadas usam cores proprias de sinalizacao (IEC 60073, a confirmar). Estado de curto: c.short / w.short
 * (preenchidos pelo motor a partir da etapa 4.3); hoje c.fault ja e mostrado igual.
 * Animacao: so deslocamento de tracejado (lineDashOffset) e opacidade; com prefers-reduced-motion nao ha animacao
 * (traco --live mais grosso e estatico). */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.render = EO.render || {};

  var GRID = 20;
  /* Sinalizacao de lampadas (IEC 60073, a confirmar): cores proprias, nao sao tokens de UI. */
  var SIGNAL = { red: '#D92D20', amber: '#F5A100', blue: '#2563EB', white: '#F1F5F9', green: '#16A34A' };

  function tokenFn(view) {
    if (view && typeof view.token === 'function') return view.token;
    return function (name) {
      try {
        if (root.document && root.getComputedStyle) {
          return root.getComputedStyle(root.document.documentElement).getPropertyValue(name).trim() || 'currentColor';
        }
      } catch (e) { /* sem DOM */ }
      return 'currentColor';
    };
  }

  function reducedMotion() {
    try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  function dprAtual() {
    var d = (root.devicePixelRatio || 1);
    return Math.max(1, Math.min(3, d));
  }

  /* Dimensiona o canvas ao container com devicePixelRatio; coordenadas de entrada seguem em px CSS. */
  function resize(canvas, wrap) {
    if (!canvas || !wrap) return { W: 0, H: 0, dpr: 1 };
    var W = Math.max(1, Math.round(wrap.clientWidth));
    var H = Math.max(1, Math.round(wrap.clientHeight || 500));
    var dpr = dprAtual();
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    return { W: W, H: H, dpr: dpr };
  }

  /* Terminal em coordenadas do mundo. Usa EO.editor.geom (rot/flip) quando carregado; reserva: calculo legado. */
  function portWorld(c, defs, pi) {
    var geom = EO.editor && EO.editor.geom;
    if (geom && geom.portWorld) return geom.portWorld(c, pi, defs);
    var p = defs[c.sym].ports[pi];
    return { x: c.x + p.x * c.w, y: c.y + p.y * c.h };
  }

  /* Caixa ocupada (ja girada): com rot 90/270 largura e altura trocam. */
  function boxOf(c) {
    var geom = EO.editor && EO.editor.geom;
    if (geom && geom.boxSize) { var sz = geom.boxSize(c); return { x: c.x, y: c.y, w: sz.W, h: sz.H }; }
    var q = Math.round((Number(c.rot) || 0) / 90) % 4;
    if (q < 0) q += 4;
    return (q & 1) ? { x: c.x, y: c.y, w: c.h, h: c.w } : { x: c.x, y: c.y, w: c.w, h: c.h };
  }

  /* Trechos do fio: from -> pts -> to, como [{x1,y1,x2,y2}]. */
  function wireSegments(w, model) {
    var geom = EO.editor && EO.editor.geom;
    if (geom && geom.segmentsOf) return geom.segmentsOf(w, model.components, model.defs);
    var chain = [portWorld(w.from.comp, model.defs, w.from.port)];
    if (Array.isArray(w.pts)) w.pts.forEach(function (q) { chain.push({ x: q.x, y: q.y }); });
    chain.push(portWorld(w.to.comp, model.defs, w.to.port));
    var out = [];
    for (var i = 0; i < chain.length - 1; i++) out.push({ x1: chain[i].x, y1: chain[i].y, x2: chain[i + 1].x, y2: chain[i + 1].y });
    return out;
  }

  /* Grau de cada componente = numero de pontas de fio ligadas nele (so pelos fios do modelo). */
  function degrees(model) {
    var m = new Map();
    (model.wires || []).forEach(function (w) {
      [w.from && w.from.comp, w.to && w.to.comp].forEach(function (c) { if (c) m.set(c, (m.get(c) || 0) + 1); });
    });
    return m;
  }

  /* '#rrggbb' -> 'rgba(r,g,b,a)'; outros formatos: mantem a cor com globalAlpha tratado pelo chamador. */
  function withAlpha(color, a) {
    var m = /^#([0-9a-fA-F]{6})$/.exec(color || '');
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function fillAlpha(ctx, color, a) {
    var rgba = withAlpha(color, a);
    if (rgba) { ctx.fillStyle = rgba; return 1; }
    ctx.fillStyle = color;
    return a;
  }

  function drawGrid(ctx, view, T) {
    var zoom = view.zoom, pan = view.pan, W = view.W, H = view.H;
    var x0 = -pan.x / zoom, y0 = -pan.y / zoom;
    var x1 = x0 + W / zoom, y1 = y0 + H / zoom;
    var g = view.grid || GRID, g5 = g * 5, lw = 1 / zoom;
    var dark = !!view.dark;
    var startX = Math.floor(x0 / g) * g, startY = Math.floor(y0 / g) * g;
    var x, y;

    ctx.lineWidth = lw;
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.055)';
    ctx.beginPath();
    for (x = startX; x <= x1 + g; x += g) { ctx.moveTo(x, y0 - g); ctx.lineTo(x, y1 + g); }
    for (y = startY; y <= y1 + g; y += g) { ctx.moveTo(x0 - g, y); ctx.lineTo(x1 + g, y); }
    ctx.stroke();

    if (zoom > 0.28) {
      var startX5 = Math.floor(x0 / g5) * g5, startY5 = Math.floor(y0 / g5) * g5;
      ctx.lineWidth = lw * 1.6;
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.11)';
      ctx.beginPath();
      for (x = startX5; x <= x1 + g5; x += g5) { ctx.moveTo(x, y0 - g5); ctx.lineTo(x, y1 + g5); }
      for (y = startY5; y <= y1 + g5; y += g5) { ctx.moveTo(x0 - g5, y); ctx.lineTo(x1 + g5, y); }
      ctx.stroke();
    }

    ctx.lineWidth = lw * 2;
    ctx.strokeStyle = withAlpha(T('--brand'), dark ? 0.2 : 0.18) || T('--border');
    ctx.beginPath();
    ctx.moveTo(0, y0 - g); ctx.lineTo(0, y1 + g);
    ctx.moveTo(x0 - g, 0); ctx.lineTo(x1 + g, 0);
    ctx.stroke();
  }

  /* Icone de alerta (triangulo com "!") - sinal de falha que nao depende so de cor. */
  function faultIcon(ctx, x, y, r, T) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = T('--bg');
    ctx.strokeStyle = T('--fault');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r * 0.8); ctx.lineTo(x - r, y + r * 0.8); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.3); ctx.lineTo(x, y + r * 0.25);
    ctx.stroke();
    ctx.fillStyle = T('--fault');
    ctx.beginPath(); ctx.arc(x, y + r * 0.55, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* Um trecho do fio. `w` fornece energized/short (w.segs[i], opcional, sobrepoe por trecho). */
  function drawWireSeg(ctx, sg, w, st, T) {
    var running = st.running;
    var fault = running && !!w.short;
    var sel = st.selected;
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineWidth = sel ? 4 : 2.5;
    var flow = false;
    if (sel) {
      ctx.strokeStyle = T('--brand');
    } else if (fault) {
      ctx.strokeStyle = T('--fault');
      ctx.setLineDash([8, 4]);
    } else if (running && w.energized) {
      ctx.strokeStyle = T('--live');
      if (st.reduced) ctx.lineWidth = 3.5;
      else flow = true;
    } else if (running) {
      ctx.strokeStyle = T('--dead');
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = T('--text-dim');
    }
    ctx.beginPath(); ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x2, sg.y2); ctx.stroke();
    ctx.setLineDash([]);
    if (flow) {
      /* fluxo: so dash + opacidade (sem mudar geometria) */
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = T('--bg');
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 12]);
      ctx.lineDashOffset = -(st.phase % 20) * 0.8;
      ctx.beginPath(); ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x2, sg.y2); ctx.stroke();
      ctx.restore();
    }
    if (fault) faultIcon(ctx, (sg.x1 + sg.x2) / 2, (sg.y1 + sg.y2) / 2, 7, T);
  }

  function drawWire(ctx, segs, w, st, T) {
    if (segs.length > 1) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
    segs.forEach(function (sg, i) {
      var o = Array.isArray(w.segs) ? w.segs[i] : null;
      var sw = o ? {
        energized: o.energized !== undefined ? o.energized : w.energized,
        short: o.short !== undefined ? o.short : w.short
      } : w;
      drawWireSeg(ctx, sg, sw, st, T);
    });
  }

  function hatch(ctx, x, y, w, h, T) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = T('--fault');
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    for (var k = -h; k < w; k += 7) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); }
    ctx.stroke();
    ctx.restore();
  }

  function timerAccOf(c, model) {
    var best = 0;
    (model.components || []).forEach(function (tc) {
      var d = model.defs[tc.sym];
      if (tc.id === c.id && d && d.type === 'timer_contact') best = Math.max(best, tc._tAcc || 0);
    });
    return best;
  }

  function drawComp(ctx, c, model, st, T, symColors) {
    var defs = model.defs, def = defs[c.sym];
    var x = c.x, y = c.y, w = c.w, h = c.h, cx = x + w / 2;
    var bb = boxOf(c); /* caixa girada: selecao, hover e hachura */
    var running = st.running;
    var sel = c._uid >= 0 && st.selComps.indexOf(c) >= 0;
    var hover = c === model.hover && !running;
    var faulty = running && (!!c.fault || !!c.short);
    var brand = T('--brand');
    var a;

    if (sel) {
      a = fillAlpha(ctx, brand, 0.14); ctx.globalAlpha = a;
      ctx.fillRect(x - 6, y - 6, bb.w + 12, bb.h + 12);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = brand;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - 6, y - 6, bb.w + 12, bb.h + 12);
      ctx.setLineDash([]);
    } else if (hover) {
      a = fillAlpha(ctx, brand, 0.07); ctx.globalAlpha = a;
      ctx.fillRect(x - 4, y - 4, bb.w + 8, bb.h + 8);
      ctx.globalAlpha = 1;
    }

    var strokeColor = T('--text');
    if (running) {
      if (faulty) strokeColor = T('--fault');
      else if (c.energized && def.type !== 'source' && def.type !== 'source_n' && def.type !== 'sink') strokeColor = T('--live');
      else strokeColor = T('--dead');
    }

    if (faulty) hatch(ctx, bb.x, bb.y, bb.w, bb.h, T);

    /* estado visual vindo do motor (fonte unica) onde o legado decidia sozinho */
    var coilOn = running && st.coilIds.has(c.id);
    var forceState = c.forceState;
    var timerClosed = false;
    if (running && def.type === 'timer_contact') {
      timerClosed = !!EO.sim.engine.isClosed(c, defs, st.coilIds, { components: model.components, prevCoilIds: st.coilIds });
    }
    if (running && c.sym === 'limit_switch_no') {
      /* fim de curso: fechado por clique (_actuated) ou forceState, nunca por bobina de mesmo id (B7) */
      var lsClosed = EO.sim.engine.isClosed(c, defs, st.coilIds, { components: model.components, prevCoilIds: st.coilIds });
      forceState = lsClosed ? 'closed' : 'open';
    }
    if (running && c.sym === 'overload_relay') {
      /* rele termico: aberto quando em falha (isClosed), em vez de depender da bobina FR de mesmo id */
      var cl = EO.sim.engine.isClosed(c, defs, st.coilIds, { components: model.components, prevCoilIds: st.coilIds });
      forceState = cl ? 'closed' : 'open';
    }

    /* juncao: o ponto so existe com grau >= 3 (fios do modelo); a previa (_uid < 0) sempre mostra */
    var semPonto = def.type === 'junction' && c._uid >= 0 && (st.deg.get(c) || 0) < 3;
    var bornes = model.terminalLabels && model.terminalLabels[c._uid];
    if (!semPonto) EO.render.symbols.draw(ctx, c.sym, { x: x, y: y, w: w, h: h, cx: cx }, {
      color: strokeColor,
      rot: c.rot || 0,
      flip: !!c.flip,
      label: c.id || '',
      terminais: Array.isArray(bornes) ? bornes : undefined,
      colors: symColors,
      running: running,
      coilOn: coilOn,
      forceState: forceState,
      pressed: c._pressed,
      selected: c._selected,
      fault: faulty || (!!c.fault && !running),
      energized: c.energized,
      lampColor: c.color,
      time: c.time,
      timerAcc: running ? timerAccOf(c, model) : 0,
      timerClosed: timerClosed,
      /* 4.4: motor (estado/sequencia vindos do motor de simulacao) (o id do contator 3P ja aparece abaixo do simbolo: sem rotulo duplicado) */
      motor: running ? c.motorEstado : undefined
    });

    if (faulty) faultIcon(ctx, x + bb.w - 2, y + 4, 6, T);
    /* identificacao: desenhada a esquerda pelo symbols.js (opts.label) */

    var showPorts = !running || sel || hover;
    def.ports.forEach(function (p, pi) {
      var pw = portWorld(c, defs, pi), px = pw.x, py = pw.y;
      ctx.fillStyle = showPorts ? brand : (c.energized ? T('--live') : T('--dead'));
      ctx.beginPath();
      ctx.arc(px, py, showPorts ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
      if (showPorts) {
        ctx.strokeStyle = T('--bg');
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }

  function render(ctx, view, model, sim) {
    if (!ctx) return;
    var rawT = tokenFn(view), cache = {};
    var T = function (n) { return n in cache ? cache[n] : (cache[n] = rawT(n)); };
    var W = view.W, H = view.H, zoom = view.zoom, pan = view.pan;
    var running = !!(sim && sim.running);
    var reduced = view.reducedMotion !== undefined ? !!view.reducedMotion : reducedMotion();
    var st = {
      running: running,
      phase: (sim && sim.phase) || 0,
      coilIds: (sim && sim.coilIds) || new Set(),
      reduced: reduced,
      selComps: (model.selection && model.selection.comps) || [],
      selected: false,
      deg: degrees(model)
    };
    var selWires = (model.selection && model.selection.wires) || [];
    var live = T('--live');
    var symColors = {
      l1: T('--accent'), l2: T('--accent2'), l3: T('--accent4'), n: T('--accent'),
      bg: T('--bg'), fault: T('--fault'), amber: live,
      energizedFill: withAlpha(live, 0.28) || 'rgba(128,128,128,0.2)',
      lamp: SIGNAL
    };

    if (view.dpr) ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T('--bg');
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    drawGrid(ctx, view, T);

    (model.wires || []).forEach(function (w) {
      st.selected = selWires.indexOf(w) >= 0;
      drawWire(ctx, wireSegments(w, model), w, st, T);
    });
    st.selected = false;

    if (model.wireStart && view.tool === 'wire') {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = T('--brand');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(model.wireStart.x, model.wireStart.y);
      ctx.lineTo(model.mouseWorld.x, model.mouseWorld.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    (model.components || []).forEach(function (c) { drawComp(ctx, c, model, st, T, symColors); });

    if (model.selectedSymbol && model.preview) {
      var def = model.defs[model.selectedSymbol];
      ctx.globalAlpha = 0.45;
      drawComp(ctx, {
        sym: model.selectedSymbol, x: model.preview.x, y: model.preview.y,
        w: def.w * (view.grid || GRID), h: def.h * (view.grid || GRID),
        id: '', label: '', _uid: -1, energized: false,
        fault: def.type === 'passive' || def.type === 'breaker' || def.type === 'overload',
        color: 'green', timerMode: def.timerMode, time: 3
      }, model, st, T, symColors);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function exportPNG(canvas, nome) {
    if (!canvas) return;
    var a = root.document.createElement('a');
    a.download = nome || 'diagrama_comando_cade.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  var api = {
    resize: resize, render: render, exportPNG: exportPNG,
    reducedMotion: reducedMotion, portWorld: portWorld, wireSegments: wireSegments, GRID: GRID, SIGNAL: SIGNAL, implementado: true
  };
  EO.render.diagram = api;
  EO.render.diagramCanvas = api; /* nome do stub da 4.0 */
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
