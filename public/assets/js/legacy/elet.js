/* assets/js/legacy/elet.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/elet.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: elet.html, depois de core.js. */

function redrawActive() { const id = (document.querySelector('#main-elet .page.active') || {}).id || ''; if (id === 'page-rl') updateRL(); if (id === 'page-rc') updateRC(); if (id === 'page-rlc') updateRLC(); if (id === 'page-fasores') { updatePhasor(); } if (id === 'page-trifasico') updateTri(); if (id === 'page-complexos') calcCX(); if (id === 'page-cfp') calcCFPPage(); if (id === 'page-calc') { drawPotTriangle(); drawCFPCanvas(); } }

function enterModule(mod) {
            const moduleSelector = document.getElementById('module-selector');
            if (moduleSelector) moduleSelector.classList.add('hidden');
            currentModule = mod;
            if (mod === 'elet') {
                document.getElementById('nav-elet').style.display = 'block';
                document.getElementById('main-elet').style.display = 'block';
                showPage('home', null);
            } else if (mod === 'aciona') {
                document.getElementById('nav-aciona').style.display = 'block';
                document.getElementById('main-aciona').style.display = 'block';
                showAcionaPage('aciona-home', null);
            } else if (mod === 'industrial') {
                document.getElementById('nav-industrial').style.display = 'block';
                document.getElementById('main-industrial').style.display = 'block';
                showIndustrialPage('ind-home', null);
            } else if (mod === 'predial') {
                document.getElementById('nav-predial').style.display = 'block';
                document.getElementById('main-predial').style.display = 'block';
                showPredialPage('predial-selector', null);
            } else if (mod === 'ia') {
                document.getElementById('nav-ia').style.display = 'block';
                document.getElementById('main-ia').style.display = 'block';
                showIAPage('ia-mcp', null);
            } else if (mod === 'distrib') {
                document.getElementById('nav-distrib').style.display = 'block';
                document.getElementById('main-distrib').style.display = 'block';
                showDistribPage('distrib-home', null);
            } else if (mod === 'sobre') {
                document.getElementById('nav-sobre').style.display = 'block';
                document.getElementById('main-sobre').style.display = 'block';
                showSobrePage('sobre-main', null);
            } else if (mod === 'lael') {
                document.getElementById('nav-lael').style.display = 'block';
                document.getElementById('main-lael').style.display = 'block';
                showLaelPage('lael-home', null);
            } else if (mod === 'apostilas') {
                document.getElementById('nav-apostilas').style.display = 'block';
                document.getElementById('main-apostilas').style.display = 'block';
                showApostilasPage('apostilas-home', null);
            }
        }

function showModuleSelector() {
            if (typeof stopSimulation === 'function') stopSimulation();
            currentModule = null;
            const moduleSelector = document.getElementById('module-selector');
            if (!moduleSelector) {
                enterModule('elet');
                return;
            }
            moduleSelector.classList.remove('hidden');
            ['nav-elet', 'main-elet', 'nav-aciona', 'main-aciona', 'nav-predial', 'main-predial',
                'nav-industrial', 'main-industrial', 'nav-distrib', 'main-distrib', 'nav-ia', 'main-ia', 'nav-sobre', 'main-sobre',
                'nav-lael', 'main-lael', 'nav-apostilas', 'main-apostilas']
                .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        }

function goModuleHome() { showPage('home', null); }

// ─── NAVEGAÇÃO ELETRICIDADE II ────────────────────────────────
function showPage(id, btn) { document.querySelectorAll('#main-elet .page').forEach(p => p.classList.remove('active')); document.querySelectorAll('#nav-elet .nav-btn').forEach(b => b.classList.remove('active')); document.getElementById('page-' + id).classList.add('active'); const nb = btn || document.querySelector(`#nav-elet .nav-btn[data-page="${id}"]`); if (nb) nb.classList.add('active'); setTimeout(() => { if (id === 'rl') updateRL(); if (id === 'rc') updateRC(); if (id === 'rlc') updateRLC(); if (id === 'fasores') updatePhasor(); if (id === 'trifasico') updateTri(); if (id === 'complexos') calcCX(); if (id === 'cfp') calcCFPPage(); if (id === 'calc') { calcImpedance(); calcPot('p'); calcCFP(); calcRes(); calcConv(); } }, 60); }

function goHome() { showPage('home', null); }

function initDefaultModule() { enterModule('elet'); }

if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDefaultModule, { once: true });
        } else {
            initDefaultModule();
        };

// ─── FIM ANÁLISE DE PLANTA ───────────────────────────────────
function initC(id, h) { const c = document.getElementById(id); if (!c) return null; c.width = c.offsetWidth || 600; if (h) c.height = h; const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = C('--surface2'); ctx.fillRect(0, 0, c.width, c.height); return { c, ctx, W: c.width, H: c.height }; }

// ─── RL ──────────────────────────────────────────────────────
function updateRL() { const R = +document.getElementById('rl-r').value, L = +document.getElementById('rl-l').value / 1000, f = +document.getElementById('rl-f').value; document.getElementById('rl-r-val').textContent = R; document.getElementById('rl-l-val').textContent = (L * 1000).toFixed(0); document.getElementById('rl-f-val').textContent = f; const w = 2 * Math.PI * f, xl = w * L, z = Math.sqrt(R * R + xl * xl), phi = Math.atan2(xl, R); document.getElementById('rl-xl').textContent = xl.toFixed(2); document.getElementById('rl-z').textContent = z.toFixed(2); document.getElementById('rl-phi').textContent = (phi * 180 / Math.PI).toFixed(1); document.getElementById('rl-fp').textContent = Math.cos(phi).toFixed(3); drawWave('rl-canvas', phi, 'I(t) atrasa'); drawXLFreq('rl-freq-canvas', L, f); }

updateRL();

function drawWave(id, phi, lbl) { const d = initC(id); if (!d) return; const { ctx, W, H } = d, cy = H / 2, amp = H * .36; gridLine(ctx, W, H, cy); ctx.strokeStyle = C('--accent'); ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < W; i++) { const y = cy - amp * Math.sin(2 * Math.PI * i / W * 2.5); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke(); ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < W; i++) { const y = cy - .7 * amp * Math.sin(2 * Math.PI * i / W * 2.5 - phi); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke(); ctx.font = '10px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('V(t)', 5, 16); ctx.fillStyle = C('--accent2'); ctx.fillText(lbl + ' ' + (phi * 180 / Math.PI).toFixed(0) + '°', 5, 29); }

function drawXLFreq(id, L, fCur) { const d = initC(id); if (!d) return; const { ctx, W, H } = d, fmax = 1000, maxXL = 2 * Math.PI * fmax * L; ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 1; i < W; i++) { const f = fmax * i / W, xl = 2 * Math.PI * f * L, y = H - xl / maxXL * H * .88; i === 1 ? ctx.moveTo(i, y) : ctx.lineTo(i, y); } ctx.stroke(); const xp = fCur / fmax * W, xl = 2 * Math.PI * fCur * L, yp = H - xl / maxXL * H * .88; ctx.fillStyle = C('--accent'); ctx.beginPath(); ctx.arc(xp, yp, 5, 0, Math.PI * 2); ctx.fill(); ctx.font = '10px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('f=' + fCur + 'Hz', xp + 7, yp - 4); }

// ─── RC ──────────────────────────────────────────────────────
function updateRC() { const R = +document.getElementById('rc-r').value, Cv = +document.getElementById('rc-c').value * 1e-6, f = +document.getElementById('rc-f').value; document.getElementById('rc-r-val').textContent = R; document.getElementById('rc-c-val').textContent = (Cv * 1e6).toFixed(0); document.getElementById('rc-f-val').textContent = f; const w = 2 * Math.PI * f, xc = 1 / (w * Cv), z = Math.sqrt(R * R + xc * xc), phi = Math.atan2(xc, R); document.getElementById('rc-xc').textContent = xc.toFixed(2); document.getElementById('rc-z').textContent = z.toFixed(2); document.getElementById('rc-phi').textContent = (-phi * 180 / Math.PI).toFixed(1); document.getElementById('rc-fc').textContent = (1 / (2 * Math.PI * R * Cv)).toFixed(1); drawWave('rc-canvas', -phi, 'I(t) adianta'); }

updateRC();

// ─── RLC ─────────────────────────────────────────────────────
function updateRLC() {
            const R = +document.getElementById('rlc-r').value, L = +document.getElementById('rlc-l').value / 1000, Cv = +document.getElementById('rlc-c').value * 1e-6, fop = +document.getElementById('rlc-fop').value;
            document.getElementById('rlc-r-val').textContent = R; document.getElementById('rlc-l-val').textContent = (L * 1e3).toFixed(0); document.getElementById('rlc-c-val').textContent = (Cv * 1e6).toFixed(0); document.getElementById('rlc-fop-val').textContent = fop;
            const f0 = 1 / (2 * Math.PI * Math.sqrt(L * Cv)), w0 = 2 * Math.PI * f0, Q = w0 * L / R;
            document.getElementById('rlc-f0').textContent = f0.toFixed(1); document.getElementById('rlc-q').textContent = Q.toFixed(2);
            const wop = 2 * Math.PI * fop, xl = wop * L, xc = 1 / (wop * Cv), x = xl - xc, zop = Math.sqrt(R * R + x * x), phi = Math.atan2(x, R);
            document.getElementById('rlc-zop').textContent = zop.toFixed(2); document.getElementById('rlc-phi').textContent = (phi * 180 / Math.PI).toFixed(1);
            drawRLCRes(R, L, Cv, f0, fop);
            drawRLCPhasor(R, xl, xc, zop, phi);
            drawRLCWave(phi);
        }

updateRLC();

function drawRLCRes(R, L, Cv, f0, fop) {
            const d = initC('rlc-res-canvas'); if (!d) return; const { ctx, W, H } = d;
            const fmax = f0 * 4; let maxI = 0; const pts = [];
            for (let i = 1; i < W; i++) { const f = fmax * i / W, w = 2 * Math.PI * f, x = w * L - 1 / (w * Cv), z = Math.sqrt(R * R + x * x), I = 1 / z; pts.push({ x: i, I }); if (I > maxI) maxI = I; }
            const grad = ctx.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, 'rgba(91,33,182,.3)'); grad.addColorStop(1, 'rgba(91,33,182,0)');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(pts[0].x, H); pts.forEach(p => ctx.lineTo(p.x, H - p.I / maxI * H * .84)); ctx.lineTo(pts[pts.length - 1].x, H); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = C('--accent3'); ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, H - p.I / maxI * H * .84) : ctx.moveTo(p.x, H - p.I / maxI * H * .84)); ctx.stroke();
            const f0x = f0 / fmax * W; ctx.setLineDash([4, 4]); ctx.strokeStyle = C('--accent'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(f0x, 0); ctx.lineTo(f0x, H); ctx.stroke(); ctx.setLineDash([]);
            ctx.font = '10px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('f₀=' + f0.toFixed(0) + 'Hz', f0x + 3, 13);
            // marcador frequência de operação
            const fopx = fop / fmax * W; if (fopx > 0 && fopx < W) { const w2 = 2 * Math.PI * fop, x2 = w2 * L - 1 / (w2 * Cv), z2 = Math.sqrt(R * R + x2 * x2), I2 = 1 / z2, fy = H - I2 / maxI * H * .84; ctx.fillStyle = C('--accent2'); ctx.beginPath(); ctx.arc(fopx, fy, 5, 0, Math.PI * 2); ctx.fill(); ctx.font = '10px Space Mono'; ctx.fillStyle = C('--accent2'); ctx.fillText('fop', fopx + 4, fy - 5); }
        }

function drawRLCPhasor(R, xl, xc, Z, phi) {
            const d = initC('rlc-phasor-canvas'); if (!d) return; const { ctx, W, H } = d, cx = W / 2, cy = H / 2;
            // eixos
            ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
            ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('Re', W - 18, cy - 4); ctx.fillText('+Im', cx + 3, 12);
            const maxV = Math.max(R, xl, xc, Z, 1), sc = Math.min(cx, cy) * .72 / maxV;
            // VR horizontal
            arrowVec(ctx, cx, cy, cx + R * sc, cy, C('--accent'), 'V_R');
            // VL vertical para cima
            arrowVec(ctx, cx, cy, cx, cy - xl * sc, C('--accent2'), 'V_L');
            // VC vertical para baixo
            arrowVec(ctx, cx, cy, cx, cy + xc * sc, C('--accent3'), 'V_C');
            // Vtotal
            const vx = xl - xc;
            arrowVec(ctx, cx, cy, cx + R * sc, cy - vx * sc, C('--accent4'), 'V_tot');
            // arco phi
            if (Math.abs(phi) > .02 && R > 0) { ctx.beginPath(); ctx.arc(cx, cy, 36, 0, -phi, phi < 0); ctx.strokeStyle = C('--text-muted'); ctx.lineWidth = 1; ctx.stroke(); ctx.font = '10px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('φ=' + (phi * 180 / Math.PI).toFixed(1) + '°', cx + 40, cy + (phi > 0 ? -6 : 12)); }
        }

function drawRLCWave(phi) {
            const d = initC('rlc-wave-canvas'); if (!d) return; const { ctx, W, H } = d, cy = H / 2, amp = H * .38;
            // grade
            ctx.strokeStyle = C('--border'); ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) { const x = W * i / 4; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            gridLine(ctx, W, H, cy);
            ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted');['0', 'π/2', 'π', '3π/2', '2π'].forEach((l, i) => ctx.fillText(l, W * i / 4 + 2, H - 4));
            // V(t)
            ctx.strokeStyle = C('--accent'); ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < W; i++) { const t = 2 * Math.PI * i / W, y = cy - amp * Math.cos(t); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke();
            // I(t) tracejado
            ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); for (let i = 0; i < W; i++) { const t = 2 * Math.PI * i / W, y = cy - .75 * amp * Math.cos(t - phi); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke(); ctx.setLineDash([]);
            // indicador defasagem
            if (Math.abs(phi) > .04) { const x1 = W / 4, x2 = W / 4 + phi * W / (2 * Math.PI); ctx.setLineDash([3, 3]); ctx.strokeStyle = C('--accent3'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1, cy - amp); ctx.lineTo(x1, cy + amp * .15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2, cy - amp * .75); ctx.lineTo(x2, cy + amp * .15); ctx.stroke(); ctx.setLineDash([]); const yA = cy + amp * .25; ctx.strokeStyle = C('--accent3'); ctx.fillStyle = C('--accent3'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(Math.min(x1, x2), yA); ctx.lineTo(Math.max(x1, x2), yA); ctx.stroke(); ctx.font = '10px Space Mono'; ctx.fillText('Δφ=' + (phi * 180 / Math.PI).toFixed(0) + '°', Math.min(x1, x2) + 2, yA - 4); }
            ctx.font = '10px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('V(t)', 4, 15); ctx.fillStyle = C('--accent2'); ctx.fillText('I(t)', 4, 27);
        }

// ─── FASORES ─────────────────────────────────────────────────
let phMode = 'slide';

function setPhMode(m, btn) { phMode = m; document.getElementById('ph-slider-mode').style.display = m === 'slide' ? 'block' : 'none'; document.getElementById('ph-manual-mode').style.display = m === 'manual' ? 'block' : 'none'; document.querySelectorAll('#page-fasores .tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); updatePhasor(); }

function syncPh(src) { if (src === 's') { const vr = +document.getElementById('ph-vr-s').value, vl = +document.getElementById('ph-vl-s').value, vc = +document.getElementById('ph-vc-s').value; document.getElementById('ph-vr-val').textContent = vr; document.getElementById('ph-vl-val').textContent = vl; document.getElementById('ph-vc-val').textContent = vc; document.getElementById('ph-vr-m').value = vr; document.getElementById('ph-vl-m').value = vl; document.getElementById('ph-vc-m').value = vc; } else { const vr = +document.getElementById('ph-vr-m').value, vl = +document.getElementById('ph-vl-m').value, vc = +document.getElementById('ph-vc-m').value; document.getElementById('ph-vr-s').value = Math.min(vr, 300); document.getElementById('ph-vl-s').value = Math.min(vl, 300); document.getElementById('ph-vc-s').value = Math.min(vc, 300); document.getElementById('ph-vr-val').textContent = vr; document.getElementById('ph-vl-val').textContent = vl; document.getElementById('ph-vc-val').textContent = vc; } updatePhasor(); }

function getPHVals() { return { vr: +document.getElementById('ph-vr-m').value || 0, vl: +document.getElementById('ph-vl-m').value || 0, vc: +document.getElementById('ph-vc-m').value || 0 }; }

function updatePhasor() { const { vr, vl, vc } = getPHVals(), vx = vl - vc, vtot = Math.sqrt(vr * vr + vx * vx), phi = Math.atan2(vx, vr) * 180 / Math.PI; document.getElementById('ph-vtotal').textContent = vtot.toFixed(2); document.getElementById('ph-angle').textContent = phi.toFixed(1); document.getElementById('ph-vx').textContent = vx.toFixed(2); document.getElementById('ph-nat').textContent = vx > .5 ? 'Indutivo' : vx < -.5 ? 'Capacitivo' : 'Resistivo'; document.getElementById('ph-wave-desc').textContent = vx > .5 ? 'I(t) atrasa V(t) em ' + phi.toFixed(1) + '° (indutivo)' : vx < -.5 ? 'I(t) adianta V(t) em ' + Math.abs(phi).toFixed(1) + '° (capacitivo)' : 'V e I em fase (resistivo).'; drawPhasorDiagram(); drawPhWave(); drawImpTriangle(); }

updatePhasor();

function drawPhasorDiagram() { const d = initC('phasor-canvas'); if (!d) return; const { ctx, W, H } = d, cx = W / 2, cy = H / 2; const { vr, vl, vc } = getPHVals(), maxV = Math.max(vr, vl, vc, 1), sc = Math.min(cx, cy) * .72 / maxV; ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke(); ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('Re', W - 18, cy - 4); ctx.fillText('+Im', cx + 3, 12); arrowVec(ctx, cx, cy, cx + vr * sc, cy, C('--accent'), 'V_R'); arrowVec(ctx, cx, cy, cx, cy - vl * sc, C('--accent2'), 'V_L'); arrowVec(ctx, cx, cy, cx, cy + vc * sc, C('--accent3'), 'V_C'); const vx = vl - vc; arrowVec(ctx, cx, cy, cx + vr * sc, cy - vx * sc, C('--accent4'), 'V_tot'); }

function drawPhWave() { const d = initC('ph-wave-canvas'); if (!d) return; const { ctx, W, H } = d, cy = H / 2, amp = H * .37; const { vr, vl, vc } = getPHVals(), vx = vl - vc, phi = Math.atan2(vx, Math.max(vr, .1)); ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(W * i / 4, 0); ctx.lineTo(W * i / 4, H); ctx.stroke(); } gridLine(ctx, W, H, cy); ctx.strokeStyle = C('--accent'); ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < W; i++) { const t = 2 * Math.PI * i / W, y = cy - amp * Math.cos(t); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke(); ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); for (let i = 0; i < W; i++) { const t = 2 * Math.PI * i / W, y = cy - .75 * amp * Math.cos(t - phi); i ? ctx.lineTo(i, y) : ctx.moveTo(i, y); } ctx.stroke(); ctx.setLineDash([]); if (Math.abs(phi) > .05) { const x1 = W / 4, x2 = W / 4 + phi * W / (2 * Math.PI), yA = cy + amp * .28; ctx.setLineDash([3, 3]); ctx.strokeStyle = C('--accent3'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1, cy - amp); ctx.lineTo(x1, cy + amp * .15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2, cy - amp * .75); ctx.lineTo(x2, cy + amp * .15); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = C('--accent3'); ctx.fillStyle = C('--accent3'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(Math.min(x1, x2), yA); ctx.lineTo(Math.max(x1, x2), yA); ctx.stroke(); ctx.font = '10px Space Mono'; ctx.fillText('Δφ=' + (phi * 180 / Math.PI).toFixed(0) + '°', Math.min(x1, x2) + 2, yA - 4); } ctx.font = '10px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('V(t)', 4, 15); ctx.fillStyle = C('--accent2'); ctx.fillText('I(t)', 4, 27); }

function drawImpTriangle() { const d = initC('impedance-triangle'); if (!d) return; const { ctx, W, H } = d; const { vr, vl, vc } = getPHVals(), R = vr || 1, X = vl - vc, Z = Math.sqrt(R * R + X * X); const sc = Math.min((W - 90) / Math.max(R, Z, 1), (H - 60) / Math.max(Math.abs(X), Z, 1), 1.5); const ox = 60, oy = H / 2; ctx.strokeStyle = C('--accent'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + R * sc, oy); ctx.stroke(); ctx.font = 'bold 11px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('R=' + R.toFixed(0), ox + R * sc / 2 - 12, oy + 18); ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox + R * sc, oy); ctx.lineTo(ox + R * sc, oy - X * sc); ctx.stroke(); ctx.fillStyle = C('--accent2'); ctx.fillText('X=' + X.toFixed(0), ox + R * sc + 6, oy - X * sc / 2 + 4); ctx.strokeStyle = C('--accent4'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + R * sc, oy - X * sc); ctx.stroke(); ctx.fillStyle = C('--accent4'); ctx.fillText('|Z|=' + Z.toFixed(1), (ox + ox + R * sc) / 2 - 16, (oy + oy - X * sc) / 2 - 8); const phi = Math.atan2(X, R); ctx.beginPath(); ctx.arc(ox, oy, 30, 0, -phi, phi < 0); ctx.strokeStyle = C('--text-muted'); ctx.lineWidth = 1; ctx.stroke(); ctx.font = '10px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('φ=' + (phi * 180 / Math.PI).toFixed(1) + '°', ox + 33, oy - 8); }

// ─── TRIFÁSICO ───────────────────────────────────────────────
function triZPhase(R, Lmh, Cuf, f) { const w = 2 * Math.PI * f; const xl = w * Lmh / 1000; const xc = Cuf > 0 ? 1 / (w * Cuf * 1e-6) : 0; const a = R, b = xl - xc; return { a, b, mod: Math.sqrt(a * a + b * b), phi: Math.atan2(b, a) }; }

function updateTri() {
            const vf = +document.getElementById('tri-vf').value, f = +document.getElementById('tri-freq').value;
            document.getElementById('tri-vf-val').textContent = vf; document.getElementById('tri-freq-val').textContent = f;
            const zA = triZPhase(+document.getElementById('tri-ra').value, +document.getElementById('tri-la').value, +document.getElementById('tri-ca').value, f);
            const zB = triZPhase(+document.getElementById('tri-rb').value, +document.getElementById('tri-lb').value, +document.getElementById('tri-cb').value, f);
            const zC = triZPhase(+document.getElementById('tri-rc').value, +document.getElementById('tri-lc').value, +document.getElementById('tri-cc').value, f);
            const iA = vf / Math.max(zA.mod, .001), iB = vf / Math.max(zB.mod, .001), iC = vf / Math.max(zC.mod, .001);
            const vl = Math.sqrt(3) * vf;
            const PA = iA * iA * zA.a, PB = iB * iB * zB.a, PC = iC * iC * zC.a, Ptot = PA + PB + PC;
            const QA = iA * iA * zA.b, QB = iB * iB * zB.b, QC = iC * iC * zC.b, Qtot = QA + QB + QC;
            const Stot = Math.sqrt(Ptot * Ptot + Qtot * Qtot);
            document.getElementById('tri-vl').textContent = vl.toFixed(0);
            document.getElementById('tri-p').textContent = (Ptot / 1000).toFixed(2);
            document.getElementById('tri-q2').textContent = (Qtot / 1000).toFixed(2);
            document.getElementById('tri-s').textContent = (Stot / 1000).toFixed(2);
            drawTriV(vf);
            drawTriI(vf, zA, zB, zC);
            drawTriPhasor(vf, zA, zB, zC, iA, iB, iC);
        }

updateTri();

function drawTriV(vf) {
            const d = initC('tri-v-canvas'); if (!d) return; const { ctx, W, H } = d, cy = H / 2, amp = H * .38;
            ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
            [C('--accent'), C('--accent2'), C('--accent3')].forEach((col, i) => { const off = -2 * Math.PI / 3 * i; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x < W; x++) { const y = cy - amp * Math.sin(2 * Math.PI * x / W * 2.2 + off); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
        }

function drawTriI(vf, zA, zB, zC) {
            const d = initC('tri-i-canvas'); if (!d) return; const { ctx, W, H } = d, cy = H / 2;
            const offsets = [-2 * Math.PI / 3 * 0, -2 * Math.PI / 3 * 1, -2 * Math.PI / 3 * 2];
            const phis = [zA.phi, zB.phi, zC.phi];
            const mods = [vf / Math.max(zA.mod, .001), vf / Math.max(zB.mod, .001), vf / Math.max(zC.mod, .001)];
            const maxI = Math.max(...mods, 1), amp = H * .38;
            ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
            [C('--accent'), C('--accent2'), C('--accent3')].forEach((col, i) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x < W; x++) { const t = 2 * Math.PI * x / W * 2.2; const y = cy - amp * (mods[i] / maxI) * Math.sin(t + offsets[i] - phis[i]); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.font = '10px Space Mono'; ctx.fillStyle = col; ctx.fillText('I_' + 'ABC'[i] + ' φ=' + (phis[i] * 180 / Math.PI).toFixed(0) + '°', 4, 14 + i * 13); });
        }

function drawTriPhasor(vf, zA, zB, zC, iA, iB, iC) {
            const d = initC('tri-phasor-canvas'); if (!d) return; const { ctx, W, H } = d, cx = W / 2, cy = H / 2;
            ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
            ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('Re', W - 18, cy - 4); ctx.fillText('+Im', cx + 3, 12);
            const maxV = vf, sc = Math.min(cx, cy) * .68 / maxV;
            const vOffs = [Math.PI / 2, Math.PI / 2 - 2 * Math.PI / 3, Math.PI / 2 - 4 * Math.PI / 3];
            const cols = [C('--accent'), C('--accent2'), C('--accent3')];
            const lblsV = ['V_A', 'V_B', 'V_C'], lblsI = ['I_A', 'I_B', 'I_C'];
            const phiArr = [zA.phi, zB.phi, zC.phi], iArr = [iA, iB, iC];
            const maxI = Math.max(iA, iB, iC, .001), scI = Math.min(cx, cy) * .45 / maxI;
            vOffs.forEach((ang, i) => {
                const x2 = cx + vf * sc * Math.cos(ang), y2 = cy - vf * sc * Math.sin(ang);
                arrowVec(ctx, cx, cy, x2, y2, cols[i], lblsV[i]);
                // corrente (tracejada, defasada)
                const iAng = ang - phiArr[i];
                const ix = cx + iArr[i] * scI * Math.cos(iAng), iy = cy - iArr[i] * scI * Math.sin(iAng);
                ctx.setLineDash([4, 3]); ctx.strokeStyle = cols[i] + 'aa'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ix, iy); ctx.stroke(); ctx.setLineDash([]);
                ctx.font = '9px Space Mono'; ctx.fillStyle = cols[i] + 'cc'; ctx.fillText(lblsI[i], ix + 5, iy + 4);
            });
            ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('Sólido=V | Tracejado=I', 5, H - 6);
        }

// ─── Y↔DELTA ─────────────────────────────────────────────────
let ydMode = 'y2d';

function setYDMode(mode) { ydMode = mode; const y = mode === 'y2d'; document.getElementById('btn-y2d').className = 'yd-mode-btn ' + (y ? 'active-y' : 'inactive'); document.getElementById('btn-d2y').className = 'yd-mode-btn ' + (y ? 'inactive' : 'active-d'); document.getElementById('yd-inputs-y2d').style.display = y ? 'grid' : 'none'; document.getElementById('yd-inputs-d2y').style.display = y ? 'none' : 'grid'; document.getElementById('yd-desc').innerHTML = y ? 'Informe as resistências da <strong>Estrela</strong> → obter <strong>Delta</strong>.' : 'Informe as resistências do <strong>Delta</strong> → obter <strong>Estrela</strong>.'; document.getElementById('yd-btn-calc').style.background = y ? C('--accent') : C('--accent2'); clearYDelta(); }

setYDMode('y2d');

function clearYDelta() { ['yd-r1', 'yd-r2', 'yd-r3', 'yd-ra', 'yd-rb', 'yd-rc'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; }); document.getElementById('yd-error').style.display = 'none'; document.getElementById('yd-results').style.display = 'none'; }

function clearYDResult() { document.getElementById('yd-results').style.display = 'none'; document.getElementById('yd-error').style.display = 'none'; }

function fmtR(v) { if (!isFinite(v)) return '∞ Ω'; const r = parseFloat(v.toPrecision(6)); return (Number.isInteger(r) ? r : r.toFixed(4).replace(/\.?0+$/, '')) + ' Ω'; }

function calcYDelta() { const e = document.getElementById('yd-error'); e.style.display = 'none'; if (ydMode === 'y2d') { const R1 = parseFloat(document.getElementById('yd-r1').value), R2 = parseFloat(document.getElementById('yd-r2').value), R3 = parseFloat(document.getElementById('yd-r3').value); if ([R1, R2, R3].some(v => isNaN(v) || v < 0)) { e.textContent = '⚠ Preencha R1, R2, R3 ≥ 0.'; e.style.display = 'block'; return; } const s = R1 * R2 + R2 * R3 + R3 * R1, Ra = R1 ? s / R1 : Infinity, Rb = R2 ? s / R2 : Infinity, Rc = R3 ? s / R3 : Infinity; document.getElementById('yd-res-label').textContent = 'Resultado — Delta (Δ) equivalente'; document.getElementById('yd-la').textContent = 'Ra(B-C)'; document.getElementById('yd-lb').textContent = 'Rb(A-C)'; document.getElementById('yd-lc').textContent = 'Rc(A-B)'; document.getElementById('yd-va').textContent = fmtR(Ra); document.getElementById('yd-vb').textContent = fmtR(Rb); document.getElementById('yd-vc').textContent = fmtR(Rc);['yd-card-a', 'yd-card-b', 'yd-card-c'].forEach(id => document.getElementById(id).className = 'result-item orange'); document.getElementById('yd-hint').textContent = `Σ=${R1}·${R2}+${R2}·${R3}+${R3}·${R1}=${s.toFixed(4)}\nRa=Σ/R1=${fmtR(Ra)} | Rb=Σ/R2=${fmtR(Rb)} | Rc=Σ/R3=${fmtR(Rc)}`; } else { const Ra = parseFloat(document.getElementById('yd-ra').value), Rb = parseFloat(document.getElementById('yd-rb').value), Rc = parseFloat(document.getElementById('yd-rc').value); if ([Ra, Rb, Rc].some(v => isNaN(v) || v < 0)) { e.textContent = '⚠ Preencha Ra, Rb, Rc ≥ 0.'; e.style.display = 'block'; return; } const s = Ra + Rb + Rc; if (!s) { e.textContent = '⚠ Soma não pode ser zero.'; e.style.display = 'block'; return; } const R1 = (Rb * Rc) / s, R2 = (Ra * Rc) / s, R3 = (Ra * Rb) / s; document.getElementById('yd-res-label').textContent = 'Resultado — Estrela (Y) equivalente'; document.getElementById('yd-la').textContent = 'R1(nóA)'; document.getElementById('yd-lb').textContent = 'R2(nóB)'; document.getElementById('yd-lc').textContent = 'R3(nóC)'; document.getElementById('yd-va').textContent = fmtR(R1); document.getElementById('yd-vb').textContent = fmtR(R2); document.getElementById('yd-vc').textContent = fmtR(R3);['yd-card-a', 'yd-card-b', 'yd-card-c'].forEach(id => document.getElementById(id).className = 'result-item'); document.getElementById('yd-hint').textContent = `Σ=${Ra}+${Rb}+${Rc}=${s.toFixed(4)}\nR1=Rb·Rc/Σ=${fmtR(R1)} | R2=Ra·Rc/Σ=${fmtR(R2)} | R3=Ra·Rb/Σ=${fmtR(R3)}`; } document.getElementById('yd-results').style.display = 'block'; }

// ─── NÚMEROS COMPLEXOS ─────────────────────────
function getCX(n) {
            const type = document.getElementById('cx-type' + n).value;
            let a, b;
            if (type === 'ret') { a = +document.getElementById('cx-a' + n).value; b = +document.getElementById('cx-b' + n).value; }
            else { const mod = +document.getElementById('cx-m' + n).value, ang = +document.getElementById('cx-t' + n).value * Math.PI / 180; a = mod * Math.cos(ang); b = mod * Math.sin(ang); }
            return { a, b };
        }

function fmtCR(a, b) { const s = b >= 0 ? '+' : '-'; return `${a.toFixed(4)} ${s} j${Math.abs(b).toFixed(4)} Ω`; }

function fmtCP(a, b) { const mod = Math.sqrt(a * a + b * b), ang = Math.atan2(b, a) * 180 / Math.PI; return `${mod.toFixed(4)} ∠ ${ang.toFixed(2)}° Ω`; }

function mulC(a1, b1, a2, b2) { return { a: a1 * a2 - b1 * b2, b: a1 * b2 + b1 * a2 }; }

function divC(a1, b1, a2, b2) { const d = a2 * a2 + b2 * b2 || 1e-12; return { a: (a1 * a2 + b1 * b2) / d, b: (b1 * a2 - a1 * b2) / d }; }

function calcCX() {
            const t1 = document.getElementById('cx-type1').value, t2 = document.getElementById('cx-type2').value;
            document.getElementById('cx-ret1').style.display = t1 === 'ret' ? 'grid' : 'none'; document.getElementById('cx-pol1').style.display = t1 === 'pol' ? 'grid' : 'none';
            document.getElementById('cx-ret2').style.display = t2 === 'ret' ? 'grid' : 'none'; document.getElementById('cx-pol2').style.display = t2 === 'pol' ? 'grid' : 'none';
            const z1 = getCX(1), z2 = getCX(2);
            document.getElementById('cx-z1-ret').textContent = 'Ret: ' + fmtCR(z1.a, z1.b);
            document.getElementById('cx-z1-pol').textContent = 'Pol: ' + fmtCP(z1.a, z1.b);
            document.getElementById('cx-z2-ret').textContent = 'Ret: ' + fmtCR(z2.a, z2.b);
            document.getElementById('cx-z2-pol').textContent = 'Pol: ' + fmtCP(z2.a, z2.b);
            const sR = { a: z1.a + z2.a, b: z1.b + z2.b };
            document.getElementById('cx-serie-ret').textContent = 'Ret: ' + fmtCR(sR.a, sR.b);
            document.getElementById('cx-serie-pol').textContent = 'Pol: ' + fmtCP(sR.a, sR.b);
            const num = mulC(z1.a, z1.b, z2.a, z2.b);
            const pR = divC(num.a, num.b, sR.a, sR.b);
            document.getElementById('cx-par-ret').textContent = 'Ret: ' + fmtCR(pR.a, pR.b);
            document.getElementById('cx-par-pol').textContent = 'Pol: ' + fmtCP(pR.a, pR.b);
            const m1 = Math.sqrt(z1.a * z1.a + z1.b * z1.b), a1 = Math.atan2(z1.b, z1.a) * 180 / Math.PI;
            const m2 = Math.sqrt(z2.a * z2.a + z2.b * z2.b), a2 = Math.atan2(z2.b, z2.a) * 180 / Math.PI;
            const ms = Math.sqrt(sR.a * sR.a + sR.b * sR.b), as2 = Math.atan2(sR.b, sR.a) * 180 / Math.PI;
            const mp = Math.sqrt(pR.a * pR.a + pR.b * pR.b), ap = Math.atan2(pR.b, pR.a) * 180 / Math.PI;
            document.getElementById('cx-mod1').textContent = m1.toFixed(4) + ' Ω'; document.getElementById('cx-ang1').textContent = a1.toFixed(2) + '°';
            document.getElementById('cx-mod2').textContent = m2.toFixed(4) + ' Ω'; document.getElementById('cx-ang2').textContent = a2.toFixed(2) + '°';
            document.getElementById('cx-serie-mod').textContent = ms.toFixed(4) + ' Ω'; document.getElementById('cx-serie-ang').textContent = as2.toFixed(2) + '°';
            document.getElementById('cx-par-mod').textContent = mp.toFixed(4) + ' Ω'; document.getElementById('cx-par-ang').textContent = ap.toFixed(2) + '°';
            drawComplexPlane(z1, z2, sR, pR);
        }

calcCX();

function drawComplexPlane(z1, z2, zs, zp) {
            const d = initC('complex-canvas'); if (!d) return; const { ctx, W, H } = d, cx = W / 2, cy = H / 2;
            const allV = [z1, z2, zs, zp], maxR = Math.max(...allV.map(z => Math.abs(z.a)), 1), maxI = Math.max(...allV.map(z => Math.abs(z.b)), 1);
            const sc = Math.min(W * .38 / maxR, H * .38 / maxI);
            ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
            ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('Re', W - 18, cy - 4); ctx.fillText('+Im', cx + 3, 12);
            function dv(z, col, lbl) { const x2 = cx + z.a * sc, y2 = cy - z.b * sc; arrowVec(ctx, cx, cy, x2, y2, col, lbl); ctx.setLineDash([3, 3]); ctx.strokeStyle = col + '66'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x2, cy); ctx.lineTo(x2, y2); ctx.moveTo(cx, y2); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); }
            dv(z1, C('--accent'), 'Z1'); dv(z2, C('--accent2'), 'Z2'); dv(zs, C('--accent4'), 'Z_s'); dv(zp, C('--accent3'), 'Z_p');
        }

// ─── CORREÇÃO FP (NOVA PÁGINA E LÓGICA) ──────────────────────
function toggleCFPInputs() {
            const k = document.getElementById('cfppage-known').value;
            document.getElementById('cfppage-in-p-fp').style.display = k === 'p_fp' ? 'grid' : 'none';
            document.getElementById('cfppage-in-s-fp').style.display = k === 's_fp' ? 'grid' : 'none';
            document.getElementById('cfppage-in-p-q').style.display = k === 'p_q' ? 'grid' : 'none';
            calcCFPPage();
        }

function calcCFPPage() {
            const sys = +document.getElementById('cfppage-sys').value; // 1 ou 3
            const known = document.getElementById('cfppage-known').value;
            const V = +document.getElementById('cfppage-v').value || 220;
            const f = +document.getElementById('cfppage-f').value || 60;
            const targetFP = +document.getElementById('cfppage-target').value;

            let P = 0, Q1 = 0, S1 = 0, FP1 = 0;

            if (known === 'p_fp') {
                P = (+document.getElementById('cfppage-val-p').value || 0) * 1000;
                FP1 = +document.getElementById('cfppage-val-fp').value || 0;
                if (FP1 > 0 && FP1 <= 1) {
                    S1 = P / FP1;
                    Q1 = Math.sqrt(Math.max(0, S1 * S1 - P * P));
                }
            } else if (known === 's_fp') {
                S1 = (+document.getElementById('cfppage-val-s').value || 0) * 1000;
                FP1 = +document.getElementById('cfppage-val-fps').value || 0;
                if (FP1 > 0 && FP1 <= 1) {
                    P = S1 * FP1;
                    Q1 = Math.sqrt(Math.max(0, S1 * S1 - P * P));
                }
            } else if (known === 'p_q') {
                P = (+document.getElementById('cfppage-val-p2').value || 0) * 1000;
                Q1 = (+document.getElementById('cfppage-val-q').value || 0) * 1000;
                S1 = Math.sqrt(P * P + Q1 * Q1);
                FP1 = S1 > 0 ? P / S1 : 0;
            }

            if (P <= 0 || targetFP <= 0 || targetFP > 1) return;

            const S2 = P / targetFP;
            const Q2 = Math.sqrt(Math.max(0, S2 * S2 - P * P));
            const Qc = Q1 - Q2;

            const w = 2 * Math.PI * f;
            let C = 0;
            // Monofásico: C = Qc / (V² * ω)
            // Trifásico:  C_delta = Qc / (3 * V_linha² * ω)  -> Assumindo ligação em Delta (padrão)
            if (sys === 1) {
                C = Qc / (V * V * w);
            } else {
                C = Qc / (3 * V * V * w);
            }

            const I1 = sys === 1 ? (S1 / V) : (S1 / (Math.sqrt(3) * V));
            const I2 = sys === 1 ? (S2 / V) : (S2 / (Math.sqrt(3) * V));

            // Preenche a UI
            document.getElementById('cfppage-out-s1').textContent = (S1 / 1000).toFixed(2);
            document.getElementById('cfppage-out-q1').textContent = (Q1 / 1000).toFixed(2);
            document.getElementById('cfppage-out-i1').textContent = I1.toFixed(2);

            document.getElementById('cfppage-out-s2').textContent = (S2 / 1000).toFixed(2);
            document.getElementById('cfppage-out-q2').textContent = (Q2 / 1000).toFixed(2);
            document.getElementById('cfppage-out-i2').textContent = I2.toFixed(2);

            document.getElementById('cfppage-out-qc').textContent = (Qc / 1000).toFixed(2);
            document.getElementById('cfppage-out-c').textContent = (C * 1e6).toFixed(1) + (sys === 3 ? ' µF/fase' : ' µF');

            drawCFPMainCanvas(P, Q1, Q2, S1, S2);
        }

function drawCFPMainCanvas(P, Q1, Q2, S1, S2) {
            const d = initC('cfppage-canvas');
            if (!d) return;
            const { ctx, W, H } = d;
            if (P <= 0 || Q1 <= 0) return;

            const padX = 70;
            const padY = 50;
            const sc = Math.min((W - padX * 2) / Math.max(P, 1), (H - padY * 2) / Math.max(Q1, 1));
            const ox = padX;
            const oy = H - padY + 15;

            // Triângulo ANTES (Tracejado)
            ctx.strokeStyle = C('--text-dim');
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(ox + P * sc, oy); ctx.lineTo(ox + P * sc, oy - Q1 * sc); ctx.stroke(); // Q1
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy - Q1 * sc); ctx.stroke(); // S1
            ctx.setLineDash([]);

            // Triângulo DEPOIS (Sólido)
            ctx.strokeStyle = C('--accent4');
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(ox + P * sc, oy); ctx.lineTo(ox + P * sc, oy - Q2 * sc); ctx.stroke(); // Q2
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy - Q2 * sc); ctx.stroke(); // S2

            // Capacitor Qc (A diferença de tamanho em Q)
            ctx.strokeStyle = C('--accent3');
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(ox + P * sc, oy - Q2 * sc); ctx.lineTo(ox + P * sc, oy - Q1 * sc); ctx.stroke();
            ctx.lineCap = 'butt';

            // Base P (Comum aos dois)
            ctx.strokeStyle = C('--accent');
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy); ctx.stroke();

            // Textos/Labels
            ctx.fillStyle = C('--accent');
            ctx.font = 'bold 12px Space Mono';
            ctx.fillText('P = ' + (P / 1000).toFixed(1) + ' kW', ox + P * sc / 2 - 35, oy + 20);

            ctx.fillStyle = C('--text-dim');
            ctx.font = 'bold 11px Space Mono';
            ctx.fillText('S₁', ox + P * sc / 2 - 18, oy - Q1 * sc / 2 - 10);
            ctx.fillText('Q₁', ox + P * sc + 12, oy - Q1 * sc + (Q1 - Q2) * sc / 2);

            ctx.fillStyle = C('--accent4');
            ctx.fillText('S₂', ox + P * sc / 2 + 10, oy - Q2 * sc / 2 + 15);
            ctx.fillText('Q₂', ox + P * sc + 12, oy - Q2 * sc / 2);

            ctx.fillStyle = C('--accent3');
            ctx.fillText('Qc', ox + P * sc + 28, oy - Q1 * sc + (Q1 - Q2) * sc / 2);

            // Arcos de Ângulo
            const phi1 = Math.atan2(Q1, P);
            const phi2 = Math.atan2(Q2, P);

            ctx.beginPath(); ctx.arc(ox, oy, 40, -phi1, 0);
            ctx.strokeStyle = C('--text-dim'); ctx.lineWidth = 1; ctx.stroke();

            ctx.beginPath(); ctx.arc(ox, oy, 60, -phi2, 0);
            ctx.strokeStyle = C('--accent4'); ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = C('--text-dim');
            ctx.font = '10px Space Mono';
            ctx.fillText('φ₁', ox + 45, oy - 15);
            ctx.fillStyle = C('--accent4');
            ctx.fillText('φ₂', ox + 65, oy - 5);
        }

// ─── CALCULADORAS (Antigas) ───────────────────────────────────
function setCalcTab(tab, btn) { ['imp', 'pot', 'conv', 'res'].forEach(t => document.getElementById('calc-' + t).style.display = 'none'); document.getElementById('calc-' + tab).style.display = 'block'; document.querySelectorAll('#page-calc .tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); }

function onImpOpChange() { const op = document.getElementById('imp-op').value;['rlc', 'rl', 'rc', 'ab', 'pol', '2z'].forEach(k => document.getElementById('imp-fields-' + k).style.display = 'none'); if (op === 'ret-rlc') document.getElementById('imp-fields-rlc').style.display = 'grid'; else if (op === 'ret-rl') document.getElementById('imp-fields-rl').style.display = 'grid'; else if (op === 'ret-rc') document.getElementById('imp-fields-rc').style.display = 'grid'; else if (op === 'ret-ab') document.getElementById('imp-fields-ab').style.display = 'grid'; else if (op === 'pol') document.getElementById('imp-fields-pol').style.display = 'grid'; else document.getElementById('imp-fields-2z').style.display = 'grid'; calcImpedance(); }

function calcImpedance() { const op = document.getElementById('imp-op').value; let a = 0, b = 0; if (op === 'ret-rlc') { const R = +document.getElementById('imp-R').value, L = +document.getElementById('imp-L').value / 1000, Cv = +document.getElementById('imp-C').value * 1e-6, f = +document.getElementById('imp-f').value, w = 2 * Math.PI * f; a = R; b = w * L - 1 / (w * (Cv || 1e-12)); } else if (op === 'ret-rl') { a = +document.getElementById('imp-Rrl').value; b = +document.getElementById('imp-XL').value; } else if (op === 'ret-rc') { a = +document.getElementById('imp-Rrc').value; b = -Math.abs(+document.getElementById('imp-XC').value); } else if (op === 'ret-ab') { a = +document.getElementById('imp-a').value; b = +document.getElementById('imp-b').value; } else if (op === 'pol') { const m = +document.getElementById('imp-mod').value, ag = +document.getElementById('imp-ang').value * Math.PI / 180; a = m * Math.cos(ag); b = m * Math.sin(ag); } else if (op === 'serie') { a = +document.getElementById('imp-z1r').value + (+document.getElementById('imp-z2r').value); b = +document.getElementById('imp-z1i').value + (+document.getElementById('imp-z2i').value); } else { const r1 = +document.getElementById('imp-z1r').value, i1 = +document.getElementById('imp-z1i').value, r2 = +document.getElementById('imp-z2r').value, i2 = +document.getElementById('imp-z2i').value, dR = r1 + r2, dI = i1 + i2, d2 = dR * dR + dI * dI || 1, nR = r1 * r2 - i1 * i2, nI = r1 * i2 + i1 * r2; a = (nR * dR + nI * dI) / d2; b = (nI * dR - nR * dI) / d2; } const mod = Math.sqrt(a * a + b * b), ang = Math.atan2(b, a) * 180 / Math.PI, s = b >= 0 ? '+' : '-'; document.getElementById('imp-ret-display').textContent = `Z = ${a.toFixed(3)} ${s} j${Math.abs(b).toFixed(3)} Ω`; document.getElementById('imp-pol-display').textContent = `Z = ${mod.toFixed(3)} ∠ ${ang.toFixed(2)}° Ω`; document.getElementById('imp-res-a').textContent = a.toFixed(3) + ' Ω'; document.getElementById('imp-res-b').textContent = (b >= 0 ? '+' : '') + b.toFixed(3) + ' Ω'; document.getElementById('imp-res-mod').textContent = mod.toFixed(3) + ' Ω'; document.getElementById('imp-res-ang').textContent = ang.toFixed(2) + '°'; document.getElementById('imp-res-fp').textContent = Math.cos(ang * Math.PI / 180).toFixed(4); document.getElementById('imp-res-tipo').textContent = b > .01 ? 'Indutivo' : b < -.01 ? 'Capacitivo' : 'Resistivo puro'; }

calcImpedance();

let potState = { P: 3000, Q: 4000, S: 5000, fp: .6 };

function calcPot(ch) { let P = +document.getElementById('pot-p').value, Q = +document.getElementById('pot-q').value, S = +document.getElementById('pot-s').value, fp = +document.getElementById('pot-fp').value; if (ch === 'p' || ch === 'q') { S = Math.sqrt(P * P + Q * Q); fp = S ? P / S : 0; document.getElementById('pot-s').value = S.toFixed(1); document.getElementById('pot-fp').value = fp.toFixed(4); } else { P = S * fp; Q = S * Math.sqrt(Math.max(0, 1 - fp * fp)); document.getElementById('pot-p').value = P.toFixed(1); document.getElementById('pot-q').value = Q.toFixed(1); } potState = { P, Q, S, fp }; const phi = Math.acos(Math.min(Math.max(fp, 0), 1)) * 180 / Math.PI; document.getElementById('pot-res-p').textContent = P.toFixed(0) + ' W'; document.getElementById('pot-res-q').textContent = Q.toFixed(0) + ' VAr'; document.getElementById('pot-res-s').textContent = S.toFixed(0) + ' VA'; document.getElementById('pot-res-fp').textContent = fp.toFixed(4); document.getElementById('pot-res-phi').textContent = phi.toFixed(1) + '°'; document.getElementById('pot-res-tipo').textContent = Q >= 0 ? 'Indutiva' : 'Capacitiva'; drawPotTriangle(); }

function clearPot() { ['pot-p', 'pot-q', 'pot-s', 'pot-fp'].forEach(id => document.getElementById(id).value = '');['pot-res-p', 'pot-res-q', 'pot-res-s', 'pot-res-fp', 'pot-res-phi', 'pot-res-tipo'].forEach(id => document.getElementById(id).textContent = '–'); initC('pot-triangle-canvas'); }

function drawPotTriangle() { const d = initC('pot-triangle-canvas'); if (!d) return; const { ctx, W, H } = d; const { P, Q, S } = potState; if (!P && !Q) return; const sc = Math.min((W - 100) / Math.max(Math.abs(P), S, 1), (H - 55) / Math.max(Math.abs(Q), 1), .22); const ox = 55, oy = Q >= 0 ? H - 38 : 38, sg = Q >= 0 ? -1 : 1; ctx.strokeStyle = C('--accent'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy); ctx.stroke(); ctx.font = 'bold 10px Space Mono'; ctx.fillStyle = C('--accent'); ctx.fillText('P=' + fmt1(P) + 'W', ox + P * sc / 2 - 14, oy + sg * 16); ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox + P * sc, oy); ctx.lineTo(ox + P * sc, oy + sg * Math.abs(Q) * sc); ctx.stroke(); ctx.fillStyle = C('--accent2'); ctx.fillText('Q=' + fmt1(Math.abs(Q)) + 'VAr', ox + P * sc + 5, oy + sg * Math.abs(Q) * sc / 2); ctx.strokeStyle = C('--accent4'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy + sg * Math.abs(Q) * sc); ctx.stroke(); ctx.fillStyle = C('--accent4'); ctx.fillText('S=' + fmt1(S) + 'VA', (ox + ox + P * sc) / 2 - 18, (oy + oy + sg * Math.abs(Q) * sc) / 2 - 7); const phi = Math.atan2(Math.abs(Q), P); ctx.beginPath(); ctx.arc(ox, oy, 25, Q >= 0 ? -phi : 0, Q >= 0 ? 0 : phi); ctx.strokeStyle = C('--text-muted'); ctx.lineWidth = 1; ctx.stroke(); ctx.font = '9px Space Mono'; ctx.fillStyle = C('--text-muted'); ctx.fillText('φ=' + (phi * 180 / Math.PI).toFixed(0) + '°', ox + 28, oy + sg * 14); }

function fmt1(v) { return Math.abs(v) >= 1000 ? (v / 1000).toFixed(2) + 'k' : v.toFixed(0); }

function calcCFP() { const P = +document.getElementById('cfp-p').value * 1000, fp1 = +document.getElementById('cfp-fp1').value, fp2 = +document.getElementById('cfp-fp2').value, V = +document.getElementById('cfp-v').value, f = +document.getElementById('cfp-f').value; if (!P || !fp1 || !fp2 || !V || !f) return; const phi1 = Math.acos(Math.min(fp1, 1)), phi2 = Math.acos(Math.min(fp2, 1)), Q1 = P * Math.tan(phi1), Q2 = P * Math.tan(phi2), Qc = Q1 - Q2, Cv = Qc / (2 * Math.PI * f * V * V); document.getElementById('cfp-q1').textContent = (Q1 / 1000).toFixed(2) + ' kVAr'; document.getElementById('cfp-q2').textContent = (Q2 / 1000).toFixed(2) + ' kVAr'; document.getElementById('cfp-qc').textContent = (Qc / 1000).toFixed(2) + ' kVAr'; document.getElementById('cfp-c').textContent = (Cv * 1e6).toFixed(1) + ' µF'; drawCFPCanvas(P, Q1, Q2, P / fp1, P / fp2); }

function clearCFP() { ['cfp-p', 'cfp-fp1', 'cfp-fp2', 'cfp-v', 'cfp-f'].forEach(id => document.getElementById(id).value = '');['cfp-q1', 'cfp-q2', 'cfp-qc', 'cfp-c'].forEach(id => document.getElementById(id).textContent = '–'); initC('cfp-canvas'); }

calcCFP();

function drawCFPCanvas(P, Q1, Q2, S1, S2) { const d = initC('cfp-canvas'); if (!d) return; const { ctx, W, H } = d; if (!P) return; const sc = Math.min((W - 100) / Math.max(P, S1, 1), (H - 45) / Math.max(Q1, 1), .18); const ox = 50, oy = H - 32; ctx.strokeStyle = C('--accent2'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox + P * sc, oy); ctx.lineTo(ox + P * sc, oy - Q1 * sc); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy - Q1 * sc); ctx.stroke(); ctx.setLineDash([4, 3]); ctx.strokeStyle = C('--accent4'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy - Q2 * sc); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = C('--accent3'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox + P * sc, oy - Q2 * sc); ctx.lineTo(ox + P * sc, oy - Q1 * sc); ctx.stroke(); ctx.strokeStyle = C('--accent'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + P * sc, oy); ctx.stroke(); ctx.font = '9px Space Mono'; ctx.fillStyle = C('--accent2'); ctx.fillText('Q₁', ox + P * sc + 3, oy - Q1 * sc / 2); ctx.fillStyle = C('--accent4'); ctx.fillText('Q₂', ox + P * sc + 3, oy - Q2 * sc / 2 - 10); ctx.fillStyle = C('--accent3'); ctx.fillText('Qc', ox + P * sc + 3, oy - (Q1 + Q2) / 2 * sc); ctx.fillStyle = C('--accent'); ctx.fillText('P=' + fmt1(P) + 'W', ox + P * sc / 2 - 14, oy + 13); }

function setConvDir(dir, btn) { const p = dir === 'pr'; document.getElementById('conv-pr-inputs').style.display = p ? 'block' : 'none'; document.getElementById('conv-rp-inputs').style.display = p ? 'none' : 'block'; document.querySelectorAll('#page-calc .tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); p ? calcConv() : calcConvRP(); }

function calcConv() { const m = +document.getElementById('conv-mod').value, a = +document.getElementById('conv-ang').value * Math.PI / 180, re = m * Math.cos(a), im = m * Math.sin(a); document.getElementById('conv-result').textContent = `${re.toFixed(4)} ${im >= 0 ? '+' : '-'} j${Math.abs(im).toFixed(4)}`; }

function calcConvRP() { const a = +document.getElementById('conv-re').value, b = +document.getElementById('conv-im').value; document.getElementById('conv-result').textContent = `${Math.sqrt(a * a + b * b).toFixed(4)} ∠ ${(Math.atan2(b, a) * 180 / Math.PI).toFixed(2)}°`; }

calcConv();

function setUnitTab(tab, btn) { ['freq', 'indut', 'cap'].forEach(t => document.getElementById('unit-' + t).style.display = 'none'); document.getElementById('unit-' + tab).style.display = 'block'; document.querySelectorAll('#page-calc .tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); }

function convFreq(f) { let hz = f === 'hz' ? +document.getElementById('u-hz').value : f === 'khz' ? +document.getElementById('u-khz').value * 1e3 : f === 'rads' ? +document.getElementById('u-rads').value / (2 * Math.PI) : +document.getElementById('u-rpm').value / 60; if (f !== 'hz') document.getElementById('u-hz').value = hz.toFixed(6); if (f !== 'khz') document.getElementById('u-khz').value = (hz / 1e3).toFixed(9); if (f !== 'rads') document.getElementById('u-rads').value = (hz * 2 * Math.PI).toFixed(4); if (f !== 'rpm') document.getElementById('u-rpm').value = (hz * 60).toFixed(4); }

function convIndut(f) { let h = f === 'h' ? +document.getElementById('u-h').value : f === 'mh' ? +document.getElementById('u-mh').value / 1e3 : +document.getElementById('u-uh').value / 1e6; if (f !== 'h') document.getElementById('u-h').value = h; if (f !== 'mh') document.getElementById('u-mh').value = h * 1e3; if (f !== 'uh') document.getElementById('u-uh').value = h * 1e6; }

function convCap(f) { let cv = f === 'uf' ? +document.getElementById('u-uf').value * 1e-6 : f === 'nf' ? +document.getElementById('u-nf').value * 1e-9 : +document.getElementById('u-pf').value * 1e-12; if (f !== 'uf') document.getElementById('u-uf').value = cv * 1e6; if (f !== 'nf') document.getElementById('u-nf').value = cv * 1e9; if (f !== 'pf') document.getElementById('u-pf').value = cv * 1e12; }

function calcRes() { const R = +document.getElementById('res-r').value, L = +document.getElementById('res-l').value / 1e3, Cv = +document.getElementById('res-c').value * 1e-6, f0 = 1 / (2 * Math.PI * Math.sqrt(L * Cv)), w0 = 2 * Math.PI * f0, Q = w0 * L / R, bw = f0 / Q; document.getElementById('res-f0').textContent = f0.toFixed(2); document.getElementById('res-w0').textContent = w0.toFixed(2); document.getElementById('res-q').textContent = Q.toFixed(3); document.getElementById('res-bw').textContent = bw.toFixed(2); document.getElementById('res-f1').textContent = (f0 - bw / 2).toFixed(2); document.getElementById('res-f2').textContent = (f0 + bw / 2).toFixed(2); }

calcRes();

window.addEventListener('resize', () => { redrawActive(); });
