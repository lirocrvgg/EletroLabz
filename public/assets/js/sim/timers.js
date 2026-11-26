/* sim/timers.js - contatos temporizados do diagrama (etapa 4.1: copia fiel do comportamento legado, incluindo
 * o uso do conjunto de bobinas do ciclo ANTERIOR tambem durante a propagacao).
 * Puro: sem DOM e sem globais legadas.
 * Campos MUTADOS por update() nos componentes cuja def.type === 'timer_contact':
 *   _tAcc (acumulador, s), _timerDone, _offDelayActive, __prevCoilOn. Nenhuma outra funcao deste modulo muta. */
(function (root) {
  var EO = root.EO = root.EO || {};
  EO.sim = EO.sim || {};

  /* tempo do contato: usa o da bobina temporizada de mesmo id; senao o do proprio contato; minimo 0,05; padrao 3 */
  function timeOf(c, comps) {
    var matchingCoil = comps.find(function (mc) { return mc.id === c.id && (mc.sym === 'timer_relay' || mc.sym === 'timer_relay_off'); });
    return Math.max(0.05, parseFloat(matchingCoil ? matchingCoil.time : c.time) || 3);
  }

  function update(comps, defs, prevCoilIds, dt) {
    comps.forEach(function (c) {
      var def = defs[c.sym];
      if (!def || def.type !== 'timer_contact') return;
      var coilOn = prevCoilIds.has(c.id);
      var T = timeOf(c, comps);
      var mode = c.timerMode || def.timerMode || 'onDelay';
      if (mode === 'onDelay') {
        if (coilOn) {
          c._tAcc = (c._tAcc || 0) + dt;
          if (c._tAcc >= T - 1e-9) c._timerDone = true;
        } else {
          c._tAcc = 0;
          c._timerDone = false;
        }
      } else {
        if (coilOn) {
          c._tAcc = 0;
          c._offDelayActive = false;
          c._timerDone = false;
        } else if (c.__prevCoilOn) {
          c._offDelayActive = true;
        }
        if (c._offDelayActive && !coilOn) {
          c._tAcc = (c._tAcc || 0) + dt;
          if (c._tAcc >= T - 1e-9) {
            c._timerDone = true;
            c._offDelayActive = false;
          }
        }
      }
      c.__prevCoilOn = coilOn;
    });
  }

  /* Apos o solve: contato de retardo na desenergizacao cuja bobina acabou de cair (estava ligada no ciclo anterior,
   * esta desligada no final) ja entra em _offDelayActive. Antes isso so acontecia no update() do ciclo seguinte, e
   * o contato aparecia ABERTO por 1 tick (compConductsNow/render com as bobinas finais) antes de voltar a conduzir
   * ate t0+T. O acumulo de tempo nao muda (continua comecando no update do ciclo seguinte). */
  function settle(comps, defs, prevCoilIds, coilIds) {
    comps.forEach(function (c) {
      var def = defs[c.sym];
      if (!def || def.type !== 'timer_contact') return;
      var mode = c.timerMode || def.timerMode || 'onDelay';
      if (mode === 'onDelay') return;
      if (prevCoilIds.has(c.id) && !coilIds.has(c.id)) c._offDelayActive = true;
    });
  }

  function isActive(c, defs, comps, prevCoilIds) {
    var def = defs[c.sym];
    var coilOn = prevCoilIds.has(c.id);
    var T = timeOf(c, comps);
    var mode = c.timerMode || (def && def.timerMode) || 'onDelay';
    if (mode === 'onDelay') return coilOn && (c._tAcc || 0) >= T - 1e-9;
    if (coilOn) return true;
    if (c._offDelayActive && (c._tAcc || 0) < T - 1e-9) return true;
    return false;
  }

  function conducts(c, defs, comps, prevCoilIds) {
    var active = isActive(c, defs, comps, prevCoilIds);
    return c.sym.endsWith('_no') ? active : !active;
  }

  EO.sim.timers = { timeOf: timeOf, update: update, settle: settle, isActive: isActive, conducts: conducts };
  if (typeof module !== 'undefined' && module.exports) module.exports = EO.sim.timers;
})(typeof window !== 'undefined' ? window : globalThis);
