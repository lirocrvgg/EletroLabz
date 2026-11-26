(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const place = (element, x, y) => element.setAttribute('transform', `translate(${x} ${y})`);
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const mix = (from, to, fraction) => from + (to - from) * clamp(fraction);

  function setupSorter() {
    const start = byId('eo-sort-start');
    const stop = byId('eo-sort-stop');
    const piece = byId('eo-sort-piece');
    const stage = piece.ownerSVGElement;
    const treads = byId('eo-belt-treads');
    const pulley = byId('eo-drive-pulley');
    const gripper = byId('eo-gripper');
    const piston = byId('eo-piston');
    const jaws = byId('eo-jaws');
    const status = byId('eo-sort-status');
    const materials = [true, false, false, true, false, true];
    const sensorStart = 1.2;
    const sensorEnd = 1.58;
    const pickupTime = 2;
    const releaseTime = 3.87;
    const metalCycle = 4.65;
    const polymerCycle = 3.65;
    let batchIndex = 0;
    let metals = 0;
    let others = 0;
    let elapsed = 0;
    let beltOffset = 0;
    let pulleyAngle = 0;
    const rungs = [...document.querySelectorAll('[data-rung]')];
    let remembered = false;
    let command = '';
    let running = false;
    let previous = null;
    let frame = 0;

    function render() {
      const metal = materials[batchIndex];
      const t = elapsed;
      let x = mix(24, 252, t / pickupTime);
      let y = 169;
      let gripperX = 252;
      let gripperY = 75;
      const detecting = running && metal && t >= sensorStart && t < sensorEnd;

      if (detecting) remembered = true;
      const transfer = remembered && t >= pickupTime && t < releaseTime;
      const clear = remembered && t >= releaseTime;
      if (clear) remembered = false;
      const grip = running && transfer && t >= 2.46 && t < 3.53;
      const drive = running && !transfer;
      const signals = {start:command==='start',stop:command==='stop',metal:detecting,
        clear,sort:running && transfer,belt:drive,grip};
      for (const rung of rungs) rung.classList.toggle('live',Boolean(signals[rung.dataset.rung]));
      if (metal && t >= pickupTime) {
        gripperY = mix(75, 159, (t - pickupTime) / .36);
        if (t >= 2.46) {
          gripperY = mix(159, 76, (t - 2.46) / .42);
          gripperX = mix(252, 401, (t - 2.88) / .65);
          x = gripperX;
          y = gripperY + 10;
        }
        if (t >= 3.53) {
          y = mix(86, 135, (t - 3.53) / (releaseTime - 3.53));
          gripperX = mix(401, 252, (t - releaseTime) / .68);
        }
      } else if (!metal && t >= pickupTime) {
        x = mix(252, 456, (t - pickupTime) / (polymerCycle - pickupTime));
      }

      piece.dataset.metal = String(metal);
      piece.setAttribute('visibility', t === 0 || (metal && t >= releaseTime) ? 'hidden' : 'visible');
      place(piece, x, y);
      place(gripper, gripperX, 0);
      place(jaws, 0, gripperY);
      jaws.setAttribute('d', metal && t >= 2.46 && t < 3.53
        ? 'M-13 14v-15H13v15' : 'M-19 14l4-15H15l4 15');
      piston.setAttribute('y2', gripperY);
      stage.dataset.detecting = String(detecting);
      stage.dataset.driving = String(drive);
      treads.setAttribute('stroke-dashoffset', -beltOffset);
      pulley.setAttribute('transform', `rotate(${pulleyAngle} 442 194)`);
    }

    function tick(now) {
      const delta = previous === null ? 0 : Math.min((now - previous) / 1000, .05);
      previous = now;
      const metal = materials[batchIndex];
      const before = elapsed;
      elapsed += delta;
      if (!metal || before < pickupTime || before >= releaseTime) {
        beltOffset = (beltOffset + delta * 114) % 18;
        pulleyAngle = (pulleyAngle + delta * 114 / 12 * 180 / Math.PI) % 360;
      }
      if (metal && before < releaseTime && elapsed >= releaseTime) {
        byId('eo-sort-metal').textContent = ++metals;
      }
      const duration = metal ? metalCycle : polymerCycle;
      if (elapsed >= duration) {
        if (!metal) byId('eo-sort-other').textContent = ++others;
        elapsed -= duration;
        batchIndex = (batchIndex + 1) % materials.length;
      }
      render();
      frame = requestAnimationFrame(tick);
    }

    function setRunning(value) {
      command = value ? 'start' : 'stop';
      running = value;
      start.disabled = value;
      stop.disabled = !value;
      status.textContent = value ? 'Esteira ligada' : 'Esteira desligada';
      previous = null;
      if (value) frame = requestAnimationFrame(tick);
      else cancelAnimationFrame(frame);
      render();
      command = '';
      requestAnimationFrame(render);
    }

    start.addEventListener('click', () => { setRunning(true); stop.focus(); });
    stop.addEventListener('click', () => { setRunning(false); start.focus(); });
    render();
  }

  function setupSnake() {
    const game = byId('eo-snake');
    const board = byId('eo-snake-board');
    const layer = byId('eo-snake-cells');
    const start = byId('eo-snake-start');
    const pause = byId('eo-snake-pause');
    const scoreLabel = byId('eo-snake-score');
    const bestLabel = byId('eo-snake-best');
    const status = byId('eo-snake-status');
    const width = 18;
    const height = 12;
    const chips = [{x: 4, y: 3}, {x: 13, y: 3}, {x: 4, y: 9}, {x: 13, y: 9}];
    const vectors = {
      up: {x: 0, y: -1}, down: {x: 0, y: 1}, left: {x: -1, y: 0}, right: {x: 1, y: 0}
    };
    const keys = new Map([
      ['ArrowUp', 'up'], ['w', 'up'], ['ArrowDown', 'down'], ['s', 'down'],
      ['ArrowLeft', 'left'], ['a', 'left'], ['ArrowRight', 'right'], ['d', 'right']
    ]);
    const storageKey = 'eo:landing:snake-best';
    let best = 0;
    try { best = Math.max(0, Number(localStorage.getItem(storageKey)) || 0); } catch {}
    bestLabel.textContent = best;
    let trail;
    let direction;
    let queued;
    let charge;
    let score;
    let state = 'ready';
    let timer;

    const same = (a, b) => a.x === b.x && a.y === b.y;
    const occupied = (cells, cell) => cells.some((other) => same(cell, other));
    const glyphs = {
      head: '<circle cx="8" cy="8" r="3" fill="currentColor"/>',
      chip: '<path d="M1 5h3m-3 6h3m8-6h3m-3 6h3" stroke="currentColor" stroke-width="2"/><rect x="4" y="2" width="8" height="12" rx="1.5" fill="currentColor"/>',
      charge: '<path fill="currentColor" d="M9 0 2 9h5l-1 7 8-10H9z"/>'
    };

    function cell(point, style, glyph) {
      const element = document.createElement('span');
      element.className = `eo-snake-cell ${style}`;
      element.style.left = `${100 * point.x / width}%`;
      element.style.top = `${100 * point.y / height}%`;
      if (glyph) element.innerHTML = `<svg viewBox="0 0 16 16">${glyphs[glyph]}</svg>`;
      return element;
    }

    function render() {
      const cells = chips.map((point) => cell(point, 'eo-snake-chip', 'chip'));
      if (charge) cells.push(cell(charge, 'eo-snake-charge', 'charge'));
      trail.forEach((point, index) => {
        cells.push(cell(point, index ? 'eo-snake-trail' : 'eo-snake-trail eo-snake-head', index ? null : 'head'));
      });
      layer.replaceChildren(...cells);
      scoreLabel.textContent = score;
    }

    function reset() {
      trail = [{x: 7, y: 6}, {x: 6, y: 6}, {x: 5, y: 6}];
      direction = vectors.right;
      queued = null;
      charge = {x: 10, y: 6};
      score = 0;
      render();
    }

    function spawnCharge() {
      const free = [];
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const point = {x, y};
          if (!occupied(trail, point) && !occupied(chips, point)) free.push(point);
        }
      }
      return free[Math.floor(Math.random() * free.length)];
    }

    function schedule() {
      timer = setTimeout(tick, Math.max(85, 245 - score * 11));
    }

    function setState(next, message) {
      clearTimeout(timer);
      state = next;
      status.textContent = message;
      pause.disabled = next !== 'playing' && next !== 'paused';
      pause.textContent = next === 'paused' ? 'Continuar' : 'Pausar';
      start.textContent = next === 'ready' ? 'Jogar' : 'Reiniciar';
      if (next === 'demo') start.textContent = 'Assumir controle';
      if (next === 'playing' || next === 'demo') schedule();
    }

    function autoDirection() {
      const queue = [{point: trail[0], first: null}];
      const visited = new Set([...chips, ...trail].map(p => p.y * width + p.x));
      let fallback = direction;
      for (let i = 0; i < queue.length; i++) {
        const {point, first} = queue[i];
        for (const step of Object.values(vectors)) {
          const x = point.x + step.x, y = point.y + step.y;
          const key = y * width + x;
          if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) continue;
          const route = first || step;
          if (!first) fallback = step;
          if (same({x,y}, charge)) return route;
          visited.add(key);
          queue.push({point: {x,y}, first: route});
        }
      }
      return fallback;
    }

    game.addEventListener('preview', event => {
      if (event.detail) {
        reset();
        setState('demo', 'Demonstração automática');
      } else {
        reset();
        setState('ready', 'Pronto para jogar');
      }
    });

    function tick() {
      if (state === 'demo') queued = autoDirection();
      direction = queued || direction;
      queued = null;
      const head = {x: trail[0].x + direction.x, y: trail[0].y + direction.y};
      const collected = same(head, charge);
      const body = collected ? trail : trail.slice(0, -1);
      if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height ||
          occupied(chips, head) || occupied(body, head)) {
        if (state === 'demo') { reset(); schedule(); return; }
        setState('finished', `Fim de jogo · ${score} ${score === 1 ? 'ponto' : 'pontos'}`);
        if (document.activeElement === pause) start.focus();
        return;
      }

      trail.unshift(head);
      if (collected) {
        score += 1;
        if (state !== 'demo' && score > best) {
          best = score;
          bestLabel.textContent = best;
          try { localStorage.setItem(storageKey, String(best)); } catch {}
        }
        charge = spawnCharge();
      } else {
        trail.pop();
      }
      render();
      if (charge) schedule();
      else setState('finished', 'Placa completa · você venceu!');
    }

    function turn(name) {
      if (state === 'demo') { reset(); setState('playing', 'Em jogo'); }
      const next = vectors[name];
      if (state === 'playing' && !queued && !same(next, direction) &&
          !(next.x === -direction.x && next.y === -direction.y)) queued = next;
    }

    function togglePause() {
      if (state === 'playing') setState('paused', 'Jogo pausado');
      else if (state === 'paused') setState('playing', 'Em jogo');
    }

    start.addEventListener('click', () => {
      reset();
      setState('playing', 'Em jogo');
      board.focus();
    });
    pause.addEventListener('click', () => {
      togglePause();
      if (state === 'playing') board.focus();
    });
    game.querySelectorAll('[data-direction]').forEach((button) => {
      button.addEventListener('click', () => turn(button.dataset.direction));
    });
    game.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const name = keys.get(event.key.toLowerCase()) || keys.get(event.key);
      if (name && (state === 'playing' || state === 'demo')) {
        event.preventDefault();
        if (!event.repeat) turn(name);
      }
      if (event.key === ' ' && event.target === board && !event.repeat &&
          (state === 'playing' || state === 'paused')) {
        event.preventDefault();
        togglePause();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state === 'playing') togglePause();
    });
    reset();
  }

  setupSorter();
  if (byId('eo-snake')) setupSnake();
})();

(() => {

  const lab = document.querySelector('.eo-lab');
  const cards = [...document.querySelectorAll('.showcase .eo-lab-card')];
  const snake = document.getElementById('eo-snake');
  const get = id => document.getElementById(id);
  const targets = [40, 60, 30, 50, 20, 100];
  let targetIndex = 0;
  function updateMeter() {
    const resistance = Number(get('ohm-r').value);
    const currentMA = 12000 / resistance;
    get('ohm-value').textContent = resistance + ' Ω';
    get('ohm-current').textContent = currentMA.toLocaleString('pt-BR', {maximumFractionDigits:1}) + ' mA';
    get('ohm-target').textContent = targets[targetIndex] + ' mA';
    get('ohm-result').textContent = currentMA === targets[targetIndex] ? 'Alvo atingido!' : '';
  }
  get('ohm-r').oninput = updateMeter;
  get('ohm-next').onclick = () => {
    do { targetIndex = (targetIndex + 1) % targets.length; }
    while (12000 / Number(get('ohm-r').value) === targets[targetIndex]);
    updateMeter();
  };
  updateMeter();
  get('xf-n').oninput = () => {
    const turns = Number(get('xf-n').value);
    get('xf-count').textContent = turns;
    get('xf-v').textContent = (220 * turns / 400).toLocaleString('pt-BR') + ' V';
  };

  const waves = ['wave-a','wave-b','wave-c'].map(get);
  let started = null;
  let frame = 0;
  function drawMotor(now) {
    const elapsed = started === null ? 0 : (now - started) / 1000;
    const ramp = Math.min(1, elapsed / 2);
    const amplitude = started === null ? 0 : 16 + 12 * (1-ramp);
    const third = Number(get('harm-third').value) / 100;
    const harmonic = Number(get('harm-level').value) / 100;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    waves.forEach((wave, phase) => {
      const points = [];
      for (let x = 0; x <= 185; x += 1) {
        const angle = x / 185 * 4 * Math.PI - phase * 2 * Math.PI / 3 - (reduced ? 0 : elapsed * 2);
        const y = 66 - amplitude * (Math.sin(angle) + third * Math.sin(3 * angle) + harmonic * Math.sin(5 * angle));
        points.push((x ? 'L' : 'M') + (98+x) + ' ' + y.toFixed(1));
      }
      wave.setAttribute('d', points.join(' '));
    });
    const angle = reduced ? 0 : 240 * (elapsed < 2 ? elapsed * elapsed / 4 : elapsed - 1);
    get('harm-rotor').setAttribute('transform','rotate(' + angle + ' 30 72)');
    const status = started === null ? ' Parado' : ramp < 1 ? ' Em partida' : ' Em regime';
    if (get('harm-status').textContent !== status) get('harm-status').textContent = status;
  }
  function animateMotor(now) {
    drawMotor(now);
    frame = requestAnimationFrame(animateMotor);
  }
  function stopMotor() {
    cancelAnimationFrame(frame);
    started = null;
    get('harm-run').textContent = 'Partir motor';
    drawMotor(performance.now());
  }
  get('harm-run').onclick = () => {
    if (started !== null) return stopMotor();
    started = performance.now();
    get('harm-run').textContent = 'Parar motor';
    animateMotor(started);
  };
  get('harm-third').oninput = () => {
    get('harm-third-percent').textContent = get('harm-third').value + '%';
    drawMotor(performance.now());
  };
  get('harm-level').oninput = () => {
    get('harm-percent').textContent = get('harm-level').value + '%';
    drawMotor(performance.now());
  };
  drawMotor(performance.now());

  let tripped = false;
  function directStart(running) {
    get('dol-circuit').classList.toggle('energized',running);
    get('dol-circuit').classList.toggle('tripped',tripped);
    get('dol-poles').setAttribute('d',running ? 'M214 64V47m21 17V47m21 17V47' : 'M214 64l-7-16m28 16-7-16m28 16-7-16');
    get('dol-start').disabled = running || tripped;
    get('dol-stop').disabled = !running;
    get('dol-state').textContent = tripped ? 'Térmico atuado · motor parado' : running ? 'K1 energizado · motor ligado' : 'Motor parado';
  }
  get('dol-start').onclick = () => directStart(!tripped);
  get('dol-stop').onclick = () => directStart(false);
  get('dol-trip').onclick = () => {
    tripped = !tripped;
    get('dol-trip').textContent = tripped ? 'Rearmar térmico' : 'Atuar térmico';
    directStart(false);
  };
  directStart(false);
  get('harm-run').addEventListener('deactivate',stopMotor);
  if (!cards.length) return;
  const selectedModel = new URLSearchParams(location.search).get('modelo');
  const fixedIndex = cards.findIndex(card => card.getAttribute('aria-labelledby') === selectedModel);
  let current = 0;
  let timer;
  function schedule() {
    clearTimeout(timer);
    if (fixedIndex < 0 && !document.hidden) timer = setTimeout(() => show((current + 1) % cards.length), 10000);
  }
  function show(index, direction = 1) {
    const outgoing = cards[current];
    if (started !== null && outgoing.contains(get('harm-run'))) stopMotor();
    const stop = document.getElementById('eo-sort-stop');
    if (index !== 0 && !stop.disabled) stop.click();
    snake.dispatchEvent(new CustomEvent('preview', {detail: index === 1}));
    cards.forEach((card,i) => { card.hidden = i !== index; });
    for (const card of cards) {
      card.inert = card.hidden;
      card.getAnimations().forEach(animation => animation.cancel());
    }
    if (index !== current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timing = {duration: 460, easing: 'cubic-bezier(.26,.72,.24,1)'};
      outgoing.animate([
        {transform: 'translateX(0)', visibility: 'visible', opacity: 1},
        {transform: 'translateX(' + (-direction * 105) + '%)', visibility: 'visible', opacity: 1}
      ], timing);
      cards[index].animate([
        {transform: 'translateX(' + (direction * 105) + '%)'},
        {transform: 'translateX(0)'}
      ], timing);
    }
    current = index;
    schedule();
  }
  for (const arrow of lab.querySelectorAll('.orbit-prev,.orbit-next')) {
    arrow.onclick = () => { const step = arrow.classList.contains("orbit-prev") ? -1 : 1; show((current + step + cards.length) % cards.length, step); arrow.focus(); };
  }
  for (const card of cards) {
    card.addEventListener('pointerdown', () => clearTimeout(timer));
    card.addEventListener('keydown', () => clearTimeout(timer));
    card.addEventListener('focusin', () => clearTimeout(timer));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else if (!cards[current].contains(document.activeElement)) schedule();
  });
  if (fixedIndex >= 0) {
    document.documentElement.classList.add('model-only');
    show(fixedIndex);
    return;
  }
  show(0);
  const marker = document.createElement('div');
  marker.className = 'cursor-halo';
  document.body.append(marker);
  window.addEventListener('pointermove', e => {
    marker.hidden = e.pointerType !== 'mouse';
    marker.style.left = e.clientX + 'px';
    marker.style.top = e.clientY + 'px';
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave', () => marker.hidden = true);
  marker.hidden = true;
  document.querySelectorAll('.mod-card').forEach(card => {
    const details = card.querySelector('details');
    let pinned = false;
    card.addEventListener('pointerenter', e => {if(e.pointerType === 'mouse') details.open = true;});
    card.addEventListener('pointerleave', () => {details.open = pinned;});
    card.addEventListener('click', e => {
      e.preventDefault();
      pinned = !pinned;
      details.open = pinned;
    });
  });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('.spec-item,.modules-label,.mod-card,footer')];
  let scrollFrame = 0;
  function reveal() {
    scrollFrame = 0;
    const height = window.innerHeight;
    const atEnd = window.scrollY + height >= document.documentElement.scrollHeight - 2;
    const tops = sections.map(section => section.getBoundingClientRect().top);
    sections.forEach((section, index) => {
      const progress = atEnd || reducedMotion.matches ? 1 :
        Math.min(1, Math.max(0, (height - tops[index]) / Math.min(180, height * .25)));
      section.classList.toggle('eo-revealing', progress < 1);
      section.style.setProperty('--eo-reveal', progress);
      section.style.setProperty('--eo-edge', (progress * 160 - 30) + '%');
    });
  }
  function requestReveal() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(reveal);
  }
  window.addEventListener('scroll', requestReveal, {passive:true});
  window.addEventListener('resize', requestReveal);
  new ResizeObserver(requestReveal).observe(document.querySelector('.wrapper'));
  reducedMotion.addEventListener('change', requestReveal);
  reveal();

  const field = document.createElement('canvas');
  field.className = 'eo-dot-field';
  field.setAttribute('aria-hidden','true');
  document.body.prepend(field);
  const ctx = field.getContext('2d');
  if (!ctx) return;
  document.documentElement.classList.add('eo-live-field');
  let dots = [];
  let pointer = null;
  let drawFrame = 0;
  function requestDraw() {
    if (!drawFrame) drawFrame = requestAnimationFrame(draw);
  }
  function resizeField() {
    const width = window.innerWidth, height = window.innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    field.width = Math.round(width * scale);
    field.height = Math.round(height * scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    dots = [];
    for (let y = 12; y < height+26; y += 26) {
      for (let x = -14; x < width+26; x += 26) dots.push({x,y,dx:0,dy:0});
    }
    requestDraw();
  }
  let previousDraw = 0;
  function draw(now) {
    drawFrame = 0;
    const travel = reducedMotion.matches ? 0 : Math.min(now - (previousDraw || now), 64) * .009;
    previousDraw = now;
    const span = Math.ceil((window.innerWidth + 40) / 26) * 26;
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--area-edu').trim();
    ctx.beginPath();
    let moving = false;
    for (const dot of dots) {
      dot.x += travel;
      if (dot.x >= span - 14) dot.x -= span;
      let tx = 0, ty = 0;
      if (pointer && !reducedMotion.matches) {
        const x = dot.x - pointer.x, y = dot.y - pointer.y;
        const distance = Math.hypot(x,y);
        if (distance < 105) {
          const push = 42 * (1 - distance / 105) ** 2;
          tx = distance ? x / distance * push : push;
          ty = distance ? y / distance * push : 0;
        }
      }
      dot.dx += (tx - dot.dx) * .21;
      dot.dy += (ty - dot.dy) * .21;
      moving ||= Math.abs(tx-dot.dx) + Math.abs(ty-dot.dy) > .08;
      const x = dot.x + dot.dx, y = dot.y + dot.dy;
      ctx.moveTo(x+1.25,y);
      ctx.arc(x,y,1.25,0,Math.PI*2);
    }
    ctx.fill();
    if (moving || !reducedMotion.matches) requestDraw();
  }
  window.addEventListener('pointermove', event => {
    pointer = event.pointerType === 'touch' ? null : {x:event.clientX,y:event.clientY};
    requestDraw();
  }, {passive:true});
  function releasePointer() { pointer = null; requestDraw(); }
  document.documentElement.addEventListener('pointerleave', releasePointer);
  window.addEventListener('blur', releasePointer);
  window.addEventListener('resize', resizeField);
  reducedMotion.addEventListener('change', resizeField);
  new MutationObserver(requestDraw).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  resizeField();
})();
