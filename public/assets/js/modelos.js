(() => {
  const menu = document.getElementById('model-menu');
  const labs = {
    drive: {label:'Frequência do inversor (Hz)', max:60, initial:50, title:'Inversor e motor de quatro polos', chart:'Velocidade síncrona × frequência', x:'Hz', y:'rpm', ymax:1800},
    pump: {label:'Rotação da bomba (%)', max:100, initial:80, title:'Bomba centrífuga e tanque', chart:'Nível do tanque × tempo', x:'s', y:'%', ymax:100},
    tank: {label:'Nível do tanque (cm)', max:200, initial:100, title:'Tanque e transmissor de nível', chart:'Corrente × nível', x:'cm', y:'mA', ymax:20}
  };
  const blades = '<g id="rotor"><circle r="22" class="housing"/><path d="M0 -4Q-15 -20 -5 -19L2 -5 M4 0Q20 -15 19 -5L5 2 M0 4Q15 20 5 19L-2 5 M-4 0Q-20 15 -19 5L-5 -2" class="blades"/><circle r="4" class="hub"/></g>';
  const tank = '<rect x="182" y="27" width="77" height="96" rx="3" class="housing"/><rect id="water" x="185" y="120" width="71" height="0" class="water"/><path d="M247 47h9m-6 20h6m-9 20h9m-6 20h6" class="ticks"/>';
  const drawings = {
    drive:'<rect x="16" y="45" width="59" height="58" rx="5" class="housing"/><text x="46" y="79">VFD</text><path d="M75 74h46" class="pipe"/><rect x="127" y="43" width="91" height="62" rx="12" class="housing"/><path d="M152 52v42m9-42v42m9-42v42m9-42v42m9-42v42m-45 11v8h54v-8M216 74h33" class="ticks"/><g transform="translate(134 74)">'+blades+'</g><text x="165" y="138">Motor · rotação em câmera lenta</text>',
    pump:'<path d="M12 99h66m22-20V18h96v14" class="pipe"/><g transform="translate(90 99)">'+blades+'</g>'+tank+'<path id="jet" d="M196 30v86" class="stream"/><text x="87" y="141">Bomba</text><text x="221" y="141">Tanque · 100 L</text>',
    tank:tank+'<path d="M183 111H89V83" class="pipe"/><circle cx="89" cy="62" r="22" class="housing"/><text x="89" y="67">LT</text><path d="M68 62H28v48" class="ticks"/><text x="42" y="132">CLP</text>'
  };
  const fmt = n => n.toLocaleString('pt-BR',{maximumFractionDigits:1});
  let dispose = () => {};
  function mount(host,key) {
    const lab = labs[key], pump = key === 'pump';
    host.innerHTML = `<label for="adjust">${lab.label}</label><input id="adjust" type="range" min="0" max="${lab.max}" value="${lab.initial}">
      <div class="views"><figure><figcaption>${lab.title}</figcaption><svg viewBox="0 0 280 155" role="img" aria-label="${lab.title}">${drawings[key]}</svg></figure>
      <figure><figcaption>${lab.chart}</figcaption><svg viewBox="0 0 280 155" role="img" aria-label="${lab.chart}">
      <path d="M40 32h210M40 77h210" class="gridline"/><path d="M40 25v98h217" class="ticks"/>
      <text x="20" y="36">${lab.ymax}</text><text x="30" y="135">0</text><text x="22" y="16">${lab.y}</text><text x="251" y="148" id="x-end"></text>
      <polyline id="curve" class="curve"/><circle id="point" r="4" class="hub"/></svg></figure></div>
      <output id="reading" for="adjust"></output>${pump ? '<button id="empty" type="button">Esvaziar e reiniciar</button>' : ''}`;
    const el = id => host.querySelector('#'+id);
    const input = el('adjust'), rotor = el('rotor'), water = el('water');
    const point = el('point'), curve = el('curve'), reading = el('reading');
    let value = Number(input.value), level = 0, elapsed = 0, angle = 0;
    let previous = performance.now(), frame = 0;
    let history = [[0,0]];
    function advance(now) {
      const dt = Math.max(0,(now-previous)/1000);
      previous = now;
      if (pump && level < 100) {
        // A 100 L tank and a 5 L/s nominal flow give 5 percentage points/s.
        const rate = value / 20;
        const duration = rate ? Math.min(dt,(100-level)/rate) : dt;
        elapsed += duration;
        level = Math.min(100,level + rate*duration);
      }
      const speed = key === 'drive' ? value * 3 : pump && level < 100 ? value * 2 : 0;
      angle = (angle + speed*dt) % 360;
    }
    function render() {
      const rpm = value*30, ma = 4+16*value/200;
      const xmax = pump ? Math.max(20,Math.ceil(elapsed/10)*10) : lab.max;
      const x = pump ? elapsed : value;
      const y = pump ? level : key === 'drive' ? rpm : ma;
      const px = n => 40+210*n/xmax;
      const py = n => 122-90*n/lab.ymax;
      const points = pump ? [...history,[elapsed,level]] : [[0,key==='tank'?4:0],[lab.max,lab.ymax]];
      curve.setAttribute('points',points.map(([a,b])=>px(a)+','+py(b)).join(' '));
      point.setAttribute('cx',px(x)); point.setAttribute('cy',py(y));
      el('x-end').textContent = xmax+' '+lab.x;
      if (rotor) rotor.setAttribute('transform','rotate('+angle+')');
      if (water) {
        const fraction = pump ? level/100 : value/200;
        water.setAttribute('height',90*fraction);
        water.setAttribute('y',120-90*fraction);
      }
      if (pump) {
        const flow = level >= 100 ? 0 : value/20;
        el('jet').setAttribute('d','M196 30V'+(120-level*.9));
        el('jet').style.opacity = flow ? '1':'0';
        el('jet').style.strokeWidth = 1+flow;
        reading.textContent = fmt(value)+'% de rotação ajustada · '+fmt(flow)+' L/s · '+fmt(level)+' L'+(level>=100?' · bomba parada por nível alto':'');
      } else reading.textContent = key==='drive' ? fmt(value)+' Hz · '+fmt(rpm)+' rpm síncronos' : fmt(value)+' cm · '+fmt(ma)+' mA';
    }
    function tick(now) {
      advance(now); render();
      frame = requestAnimationFrame(tick);
    }
    input.oninput = () => {
      advance(performance.now());
      if (pump) history.push([elapsed,level]);
      value = Number(input.value);
      render();
    };
    if (pump) el('empty').onclick = () => {
      level=0; elapsed=0; history=[[0,0]]; previous=performance.now(); render();
    };
    function visibility() {
      cancelAnimationFrame(frame);
      previous=performance.now();
      if (!document.hidden && key!=='tank') frame=requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange',visibility);
    render(); visibility();
    return () => {cancelAnimationFrame(frame); document.removeEventListener('visibilitychange',visibility);};
  }
  function selectModel() {
    dispose(); dispose=()=>{};
    const sections = [...document.querySelectorAll('main > section')];
    const selected = sections.find(section => '#'+section.id === location.hash);
    menu.hidden = Boolean(selected);
    const route = selected?.id || 'selecao';
    document.querySelectorAll('#nav-modelos .nav-btn').forEach(tab => {
      const active = tab.hash === '#' + route;
      tab.classList.toggle('active',active);
      if (active) {
        tab.setAttribute('aria-current','page');
        tab.parentElement.scrollLeft = tab.offsetLeft - tab.parentElement.offsetLeft - 18;
      } else tab.removeAttribute('aria-current');
    });
    const parent = document.getElementById('model-crumb');
    const leaf = document.getElementById('active-crumb');
    parent.replaceChildren();
    const item = document.createElement(selected ? 'a' : 'span');
    item.textContent = 'Modelos interativos';
    if (selected) item.href = '#selecao';
    else item.setAttribute('aria-current','page');
    parent.append(item);
    leaf.hidden = !selected;
    leaf.textContent = selected?.querySelector('h2').textContent || '';
    leaf.setAttribute('aria-current','page');
    for (const section of sections) {
      section.hidden = section !== selected;
      const host = section.querySelector('.experiment');
      if (host) {
        host.replaceChildren();
        if (section === selected) dispose = mount(host,section.id);
      }
    }
    const stop = document.getElementById('eo-sort-stop');
    if (!stop.disabled && selected?.id !== 'eo-sort-title') stop.click();
    if (selected?.id !== 'harm-title') document.getElementById('harm-run').dispatchEvent(new Event('deactivate'));
    const heading = (selected || menu).querySelector('h1,h2');
    heading.tabIndex=-1;
    heading.focus({preventScroll:true});
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange',selectModel);
  selectModel();
})();
