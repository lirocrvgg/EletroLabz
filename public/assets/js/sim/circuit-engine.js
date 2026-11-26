/* sim/circuit-engine.js - motor eletrico do diagrama (etapa 4.1: extraido de runSimStep/compConductsNow; etapa 4.3:
 * correcoes dos bugs de docs/PLANO_FASE4.md §3, cada uma anotada abaixo).
 * Puro: sem DOM e sem globais legadas; depende de EO.sim.netlist e EO.sim.timers (resolvidos em tempo de chamada,
 * nada e lido na carga).
 * Campos MUTADOS em componentes por solve(): somente os de timers.update (_tAcc, _timerDone, _offDelayActive,
 * __prevCoilOn, em contatos temporizados). solve() NAO escreve c.energized/w.energized/c.short nem altera o
 * conjunto de bobinas recebido: o chamador aplica o resultado. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.sim = EO.sim || {};

  /* Grupos de disparo por id (E3): ids com algum componente overload/overload_power/breaker_3p/breaker em fault.
   * solve() entrega ctx.trippedIds; chamadas externas de conducts() sem ele calculam (e guardam em ctx) a partir de
   * ctx.components. Sem ctx.components, cai no fault do proprio componente (comportamento legado do FR unico). */
  var TRIP_TYPES = { overload: 1, overload_power: 1, breaker_3p: 1, breaker: 1 };
  function tripSet(components, defs) {
    var s = new Set();
    (components || []).forEach(function (c) {
      var d = defs[c.sym];
      if (d && TRIP_TYPES[d.type] === 1 && c.fault) s.add(c.id);
    });
    return s;
  }
  function tripped(c, defs, ctx) {
    if (!ctx) return !!c.fault;
    if (!ctx.trippedIds) {
      if (!ctx.components) return !!c.fault;
      ctx.trippedIds = tripSet(ctx.components, defs);
    }
    return ctx.trippedIds.has(c.id);
  }

  /* ctx = { components, prevCoilIds, trippedIds } (prevCoilIds so e usado pelos contatos temporizados, como no legado) */
  function conducts(c, defs, coilIds, ctx) {
    var def = defs[c.sym];
    var coilOn = coilIds.has(c.id);
    switch (def.type) {
      case 'source': return true;
      case 'source_n': return true;
      case 'sink': return true;
      case 'passive': return !c.fault;
      case 'breaker': return !c.fault;
      case 'overload': return !tripped(c, defs, ctx); /* igual a !c.fault com um FR so; grupo por id (E3) */
      case 'overload_power': return true; /* termico de potencia 3 polos: nao abre; dispara o grupo de mesmo id */
      case 'breaker_3p': return !tripped(c, defs, ctx);
      case 'trip_contact': /* 97-98 / 13-14: NA fecha com o grupo disparado, NF abre (sufixo) */
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        return c.sym.endsWith('_nc') ? !tripped(c, defs, ctx) : tripped(c, defs, ctx);
      case 'motor': return !c.fault;
      case 'coil': return true;
      case 'lamp': return true;
      case 'motor3': return true; /* carga de varios enrolamentos (4.4): nao conduz entre portas, ver solve() */
      case 'junction': return true; /* ponto de ligacao de 1 porta (4.4) */
      case 'contact_power': /* contator de potencia 3 polos (4.4): conduz se a bobina de mesmo id esta ligada */
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        return coilOn;
      case 'timer_contact':
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        return EO.sim.timers.conducts(c, defs, ctx.components, ctx.prevCoilIds);
      case 'contact_phase':
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        if (c.sym.endsWith('_no')) return coilOn;
        if (c.sym.endsWith('_nc')) return !coilOn;
        return false;
      case 'contact':
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        if (c.sym === 'limit_switch_no') return !!c._actuated; /* B7: fim de curso nao depende de bobina de mesmo id */
        if (c.sym === 'contact_no') return coilOn;
        if (c.sym === 'contact_nc') return !coilOn;
        return false;
      case 'limit_switch': /* tipo futuro (SYMBOL_DEFS.limit_switch_no.type na parte B): mesma regra, NF por sufixo */
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        return c.sym.endsWith('_nc') ? !c._actuated : !!c._actuated;
      case 'pushbutton': return c._pressed || c.forceState === 'closed';
      case 'pushbutton_nc': return (!c._pressed && c.forceState !== 'open') || c.forceState === 'closed';
      case 'selector':
        if (c.sym.endsWith('_nc')) { /* NF (E3): fecha em repouso; NA continua exatamente como antes */
          if (c.forceState === 'closed') return true;
          if (c.forceState === 'open') return false;
          return !c._selected;
        }
        return c._selected || c.forceState === 'closed';
      case 'pushbutton_latch': /* emergencia NF com retencao (E3): aberta enquanto pressionada ou travada (_latched) */
        if (c.forceState === 'closed') return true;
        if (c.forceState === 'open') return false;
        return !c._latched && !c._pressed;
      default: return true;
    }
  }

  /* model = {components, wires, defs}; prev = {coilIds:Set}; opts = {dt} (legado: 0,12)
   * -> {coilIds:Set, compEnergized:Map(comp->bool), wireEnergized:bool[], energizedNodes:Set, hasFault,
   *     faults:[], oscillating:false, motors:Map()} */
  function solve(model, prev, opts) {
    var components = model.components, wires = model.wires, defs = model.defs;
    var NL = EO.sim.netlist;
    var prevCoilIds = new Set(prev && prev.coilIds ? prev.coilIds : []);
    var dt = opts && opts.dt !== undefined ? opts.dt : 0.12;

    EO.sim.timers.update(components, defs, prevCoilIds, dt);

    var net = NL.build(components, wires, defs);
    var find = net.find;
    var seed = NL.seedMasks(net.sources);
    var ctx = { components: components, prevCoilIds: prevCoilIds, trippedIds: tripSet(components, defs) };
    var FASES = NL.FASES;

    function isLoad(def) { return def.type === 'coil' || def.type === 'monitoring' || def.type === 'lamp' || def.type === 'motor' || def.type === 'motor3'; }
    /* polos (4.4): def.poles = [[a,b],...], padrao [[0,1]]; enrolamentos: def.windings, padrao [[0,1]] */
    function polesOf(def) { return def.poles || [[0, 1]]; }
    function windingsOf(def) { return def.windings || [[0, 1]]; }
    function windingVoltages(c, m) {
      return windingsOf(defs[c.sym]).map(function (w) {
        return NL.voltage(m[find(c._uid + '_' + w[0])] || 0, m[find(c._uid + '_' + w[1])] || 0);
      });
    }

    /* B1/B1b/B2/B3: regra unica NL.voltage sobre as mascaras dos dois terminais (bobina, lampada, motor 2 portas) */
    function loadVoltage(c, m) {
      return NL.voltage(m[find(c._uid + '_0')] || 0, m[find(c._uid + '_1')] || 0);
    }

    function monitorWants(c, m) {
      var p0 = m[find(c._uid + '_0')] || 0, p1 = m[find(c._uid + '_1')] || 0, p2 = m[find(c._uid + '_2')] || 0;
      if (c.sym === 'relay_phase_seq') {
        return (p0 & 1) !== 0 && (p0 & 6) === 0 && (p1 & 2) !== 0 && (p1 & 5) === 0 && (p2 & 4) !== 0 && (p2 & 3) === 0;
      }
      if (c.sym === 'relay_phase_loss') {
        var u = p0 | p1 | p2;
        return (u & 1) !== 0 && (u & 2) !== 0 && (u & 4) !== 0;
      }
      return false;
    }

    /* arestas condutoras [raizA, raizB] dado o conjunto de bobinas: cada polo de cada elemento nao-carga que conduz */
    function activeEdges(coilIds) {
      var edges = [];
      components.forEach(function (c) {
        var def = defs[c.sym];
        if (def.ports.length < 2 || isLoad(def) || !conducts(c, defs, coilIds, ctx)) return;
        polesOf(def).forEach(function (p) { edges.push([find(c._uid + '_' + p[0]), find(c._uid + '_' + p[1])]); });
      });
      return edges;
    }

    /* propaga as mascaras de fonte pelos elementos condutores ate o ponto fixo, dado o conjunto de bobinas */
    function propagate(coilIds) {
      var m = Object.assign({}, seed);
      var active = activeEdges(coilIds);
      var changed = true;
      while (changed) {
        changed = false;
        active.forEach(function (p) {
          var a = p[0], b = p[1];
          var u = (m[a] || 0) | (m[b] || 0);
          if ((m[a] || 0) !== u) { m[a] = u; changed = true; }
          if ((m[b] || 0) !== u) { m[b] = u; changed = true; }
        });
      }
      return m;
    }

    /* ids de bobina desejados dado o estado propagado: want (Set) e order (ids na ordem de `components`, com
     * repeticao possivel). Bobina X quer ligar se qualquer bobina X tem tensao V; rele de monitoramento saudavel
     * quer ligar se sua condicao vale. Rele com fault nao altera nada (mantem o id se ja ligado e se nenhuma
     * bobina/rele saudavel usa o mesmo id - comportamento legado preservado). */
    function wanted(coilIds, m) {
      var want = new Set(), order = [], owned = new Set(), faultyMon = [];
      components.forEach(function (c) {
        var def = defs[c.sym];
        if (def.type === 'coil' && def.ports.length >= 2) {
          owned.add(c.id);
          if (loadVoltage(c, m)) { want.add(c.id); order.push(c.id); }
        } else if (def.type === 'monitoring') {
          if (c.fault) { faultyMon.push(c); return; }
          owned.add(c.id);
          if (monitorWants(c, m)) { want.add(c.id); order.push(c.id); }
        }
      });
      faultyMon.forEach(function (c) { if (!owned.has(c.id) && coilIds.has(c.id)) want.add(c.id); });
      return { want: want, order: order };
    }

    /* B4: recomputacao completa, sem monotonicidade. coils=prev; repete ate 4*nBobinas+8 vezes: propaga; se algum id
     * ligado nao e mais desejado, remove TODOS os indesejados; senao liga SO o primeiro desejado (ordem de
     * `components`: em disputa simultanea vence o primeiro criado); senao esta estavel. Sem estabilizar:
     * oscillating=true e o conjunto anterior e mantido (nunca lanca excecao nem laco infinito). */
    var nBob = components.filter(function (c) { var d = defs[c.sym]; return d.type === 'coil' || d.type === 'monitoring'; }).length;
    var limit = 4 * nBob + 8;
    var coilIds = new Set(prevCoilIds);
    var masks = null, stable = false, oscillating = false;
    for (var it = 0; it <= limit; it++) {
      masks = propagate(coilIds);
      var w = wanted(coilIds, masks);
      var drop = Array.from(coilIds).filter(function (id) { return !w.want.has(id); });
      if (drop.length) { drop.forEach(function (id) { coilIds.delete(id); }); continue; }
      var next = w.order.find(function (id) { return !coilIds.has(id); });
      if (next !== undefined) { coilIds.add(next); continue; }
      stable = true; break;
    }
    if (!stable) {
      oscillating = true;
      coilIds = new Set(prevCoilIds);
      masks = propagate(coilIds);
    }

    /* B6: curto = no ligado por elementos condutores a duas ou mais fontes de {L1,L2,L3,N}. Registra uma falha por
     * combinacao de fontes, zera as bobinas (cargas desligadas) e lista os componentes condutores e os fios do
     * caminho para o render marcar c.short / w.short. Nao modela qual protecao atuaria (a confirmar). */
    var shortRoots = {}, faultsByKey = {}, faults = [];
    Object.keys(masks).forEach(function (r) {
      var tags = NL.tagsOf(masks[r]);
      if (tags.length < 2) return;
      shortRoots[r] = true;
      var key = tags.join('-');
      if (!faultsByKey[key]) { faultsByKey[key] = { tipo: 'curto', entre: tags, nos: [] }; faults.push(faultsByKey[key]); }
      faultsByKey[key].nos.push(r);
    });
    var shorted = faults.length > 0;
    var shortComps = [], shortWires = [];
    if (shorted) {
      shortComps = components.filter(function (c) {
        var def = defs[c.sym];
        return def.ports.length >= 2 && !isLoad(def) && conducts(c, defs, coilIds, ctx) &&
          polesOf(def).some(function (p) { return shortRoots[find(c._uid + '_' + p[0])] === true; });
      });
      shortWires = wires.filter(function (wr) { return shortRoots[find(wr.from.comp._uid + '_' + wr.from.port)] === true; });
      coilIds = new Set();
    }

    EO.sim.timers.settle(components, defs, prevCoilIds, coilIds);

    var energizedNodes = new Set();
    Object.keys(masks).forEach(function (r) { if ((masks[r] & (FASES | NL.BIT.P24)) !== 0) energizedNodes.add(r); });

    var compEnergized = new Map();
    components.forEach(function (c) {
      var def = defs[c.sym];
      var v = false;
      if (def.ports.length === 0) { compEnergized.set(c, false); return; }
      if (def.type === 'motor3') {
        v = !shorted && windingVoltages(c, masks).some(Boolean);
      } else if (def.type === 'coil' || def.type === 'lamp' || def.type === 'motor') {
        v = !shorted && def.ports.length >= 2 && loadVoltage(c, masks);
      } else if (def.type === 'monitoring') {
        v = coilIds.has(c.id);
      } else {
        v = def.ports.some(function (_, i) { return energizedNodes.has(find(c._uid + '_' + i)); });
      }
      compEnergized.set(c, v);
    });

    var wireEnergized = wires.map(function (w) {
      return energizedNodes.has(find(w.from.comp._uid + '_' + w.from.port));
    });

    /* motores de varios enrolamentos (4.4): estado 'Y' | 'Δ' | 'ligado' (3 terminais, fechamento interno) | 'parado' |
     * 'incompleto'; sequencia 'direta' (U,V,W = permutacao ciclica de L1,L2,L3) | 'inversa' | null.
     * Conectividade do ponto estrela: componentes ligados por arestas condutoras (nao so por fios). */
    var motors = new Map();
    var single = { 1: 0, 2: 1, 4: 2 };
    function phaseIdx(mask) { return (mask & 8) === 0 && single[mask & 7] !== undefined ? single[mask & 7] : -1; }
    function comp2Find() {
      var par = {};
      function f(k) { if (par[k] === undefined) par[k] = k; return par[k] === k ? k : (par[k] = f(par[k])); }
      activeEdges(coilIds).forEach(function (e) { par[f(e[0])] = f(e[1]); });
      return f;
    }
    var f2 = null;
    components.forEach(function (c) {
      var def = defs[c.sym];
      if (def.type !== 'motor3') return;
      var st = { estado: 'parado', sequencia: null };
      motors.set(c._uid, st);
      if (shorted) return;
      var n = def.ports.length;
      var pm = def.ports.map(function (_, i) { return masks[find(c._uid + '_' + i)] || 0; });
      var idx = [phaseIdx(pm[0]), phaseIdx(pm[1]), phaseIdx(pm[2])];
      var tres = idx.every(function (k) { return k >= 0; }) && idx[0] !== idx[1] && idx[1] !== idx[2] && idx[0] !== idx[2];
      if (tres) st.sequencia = ((idx[1] - idx[0] + 3) % 3 === 1) ? 'direta' : 'inversa';
      var algo = pm.some(function (m) { return m !== 0; });
      if (!algo) return;
      st.estado = 'incompleto';
      if (n === 3) { if (tres) st.estado = 'ligado'; else st.sequencia = null; return; }
      if (!tres) { st.sequencia = null; return; }
      var wv = windingsOf(def);
      var delta = wv.every(function (w) {
        var a = phaseIdx(pm[w[0]]), b = phaseIdx(pm[w[1]]);
        return a >= 0 && b >= 0 && a !== b;
      });
      if (delta) { st.estado = 'Δ'; return; }
      if (!f2) f2 = comp2Find();
      var r3 = f2(find(c._uid + '_3'));
      var estrela = pm[3] === 0 && pm[4] === 0 && pm[5] === 0 &&
        f2(find(c._uid + '_4')) === r3 && f2(find(c._uid + '_5')) === r3;
      if (estrela) st.estado = 'Y';
    });

    return {
      coilIds: coilIds,
      compEnergized: compEnergized,
      wireEnergized: wireEnergized,
      energizedNodes: energizedNodes,
      hasFault: shorted || components.some(function (c) { return c.fault; }),
      faults: faults,
      shortComps: shortComps,
      shortWires: shortWires,
      oscillating: oscillating,
      motors: motors
    };
  }

  /* B5: tempo real. Avanca dtTotal segundos subdividindo em passos de no maximo maxStep (padrao 0,12 s; teto de 600
   * subpassos - acima disso o passo cresce para cobrir dtTotal). dtTotal <= 0 (ou invalido) = um unico solve com
   * dt=0: recomputa o estado sem avancar tempo (usar apos cliques). Cada subpasso parte das bobinas do anterior.
   * Devolve o resultado do ultimo solve + {steps, dt, oscillating (OU dos subpassos)}.
   * Chamada esperada do wrapper: elapsed = (now - last)/1000; r = stepRealtime(model, {coilIds: last}, elapsed). */
  var MAX_DT_TOTAL = 10; // s
  function stepRealtime(model, prev, dtTotal, maxStep) {
    var max = maxStep > 0 ? maxStep : 0.12;
    var total = dtTotal > 0 && isFinite(dtTotal) ? dtTotal : 0;
    /* A6: limita o tempo avancado por chamada (aba oculta por muito tempo nao pode travar o laco) */
    if (total > MAX_DT_TOTAL) total = MAX_DT_TOTAL;
    var n = total === 0 ? 1 : Math.min(600, Math.max(1, Math.ceil(total / max - 1e-9)));
    var dt = total / n;
    var cur = { coilIds: prev && prev.coilIds ? prev.coilIds : new Set() };
    var r = null, osc = false;
    for (var i = 0; i < n; i++) {
      r = solve(model, cur, { dt: dt });
      osc = osc || r.oscillating;
      cur = { coilIds: r.coilIds };
    }
    r.oscillating = osc;
    r.steps = n;
    r.dt = dt;
    return r;
  }

  EO.sim.engine = { MAX_DT_TOTAL: MAX_DT_TOTAL, conducts: conducts, isClosed: conducts, solve: solve, stepRealtime: stepRealtime };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.sim.engine;
})(typeof window !== 'undefined' ? window : globalThis);
