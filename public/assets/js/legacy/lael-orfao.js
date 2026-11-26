/* assets/js/legacy/lael-orfao.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/aciona.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). NAO e carregado por nenhuma pagina: o modulo
 * Lael foi preservado aqui (extraido de aciona.html) mas sua UI/HTML nao existe mais nas paginas atuais, e o
 * resize/draw no topo falharia sem os canvases do Lael. Mantido por preservacao (nao remover sem decisao). */

window.addEventListener('resize', () => { laelTransDraw(); laelOhmDraw(); });

// ════════════════════════════════════════════════════
        //  MÓDULO LAEL — Laboratório de Eletricidade I
        // ════════════════════════════════════════════════════
function showLaelPage(id, btn) {
            document.querySelectorAll('#main-lael .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-lael .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id);
            if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-lael .nav-btn[data-laelpage="' + id + '"]');
            if (nb) nb.classList.add('active');
            window.scrollTo(0, 0);
            setTimeout(() => {
                if (id === 'lael-ohm') { laelOhmCalc(); laelInitColorTable(); }
                if (id === 'lael-resistencia') { laelInitResEqs(); laelCalcDivisores(); }
                if (id === 'lael-potencia') { laelCalcPotencia(); laelCalcKwh(); }
                if (id === 'lael-kirchhoff') laelCalcKirchhoff();
                if (id === 'lael-teoremas') { laelCalcThevenin(); laelCalcSuperposicao(); }
                if (id === 'lael-transientes') laelTransDraw();
            }, 60);
        }

// ─── HELPERS ────────────────────────────────────────────────────
function laelRCell(label, value, color) {
            return `<div class="predial-result-item"><div class="predial-result-label">${label}</div><div class="predial-result-value" style="color:${color || 'var(--accent)'}">${value}</div></div>`;
        }

function laelFmt(n, dec) { return isNaN(n) || !isFinite(n) ? '—' : n.toFixed(dec !== undefined ? dec : 4); }

function laelEngUnit(val, unit) {
            const a = Math.abs(val);
            if (a >= 1e6) return (val / 1e6).toFixed(3) + ' M' + unit;
            if (a >= 1e3) return (val / 1e3).toFixed(3) + ' k' + unit;
            if (a >= 1) return val.toFixed(4) + ' ' + unit;
            if (a >= 1e-3) return (val * 1e3).toFixed(3) + ' m' + unit;
            if (a >= 1e-6) return (val * 1e6).toFixed(3) + ' µ' + unit;
            return val.toFixed(6) + ' ' + unit;
        }

function laelShowResult(id, html) {
            const el = document.getElementById(id);
            if (!el) return;
            el.style.display = '';
            const grid = el.querySelector('.predial-result-grid') || el;
            grid.innerHTML = html;
        }

// ─── LEI DE OHM ─────────────────────────────────────────────────
let laelOhmAnimId = null;

function laelOhmCalc() {
            const lv = document.getElementById('ohm-lock-v')?.checked;
            const li = document.getElementById('ohm-lock-i')?.checked;
            const lr = document.getElementById('ohm-lock-r')?.checked;
            let V = parseFloat(document.getElementById('ohm-v')?.value) || 0;
            let I = parseFloat(document.getElementById('ohm-i')?.value) || 0;
            let R = parseFloat(document.getElementById('ohm-r')?.value) || 0;
            const locked = [lv, li, lr].filter(Boolean).length;
            if (locked >= 2) {
                if (!lv && lv !== undefined) { V = R * I; const e = document.getElementById('ohm-v'); if (e) e.value = V.toFixed(4); }
                else if (!li && li !== undefined) { if (R > 0) { I = V / R; } const e = document.getElementById('ohm-i'); if (e) e.value = I.toFixed(4); }
                else if (!lr && lr !== undefined) { if (I > 0) { R = V / I; } const e = document.getElementById('ohm-r'); if (e) e.value = R.toFixed(4); }
            }
            const P = V * I;
            const html = laelRCell('Tensão (V)', laelEngUnit(V, 'V'), '#eab308') +
                laelRCell('Corrente (I)', laelEngUnit(I, 'A'), 'var(--accent2)') +
                laelRCell('Resistência (R)', laelEngUnit(R, 'Ω'), 'var(--accent4)') +
                laelRCell('Potência (P)', laelEngUnit(P, 'W'), 'var(--accent3)');
            laelShowResult('ohm-result', html);
            laelOhmDraw(V, I, R);
        }

function laelOhmDraw(V, I, R) {
            const cv = document.getElementById('ohm-canvas');
            if (!cv) return;
            if (!V) { V = parseFloat(document.getElementById('ohm-v')?.value) || 12; }
            if (!I) { I = parseFloat(document.getElementById('ohm-i')?.value) || 2; }
            if (!R) { R = parseFloat(document.getElementById('ohm-r')?.value) || 6; }
            const ctx = cv.getContext('2d');
            const W = cv.width, H = cv.height;
            ctx.clearRect(0, 0, W, H);
            // Style
            const fg = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#0f172a';
            const accent = '#eab308';
            const lineW = 3;
            // Draw simple circuit: source left, wire top, resistor right, wire bottom
            const m = 30, rw = 80, rh = 28;
            const cx1 = m, cx2 = W - m; // left/right x
            const cy_top = m + 10, cy_bot = H - m - 10;
            const ry = (cy_top + cy_bot) / 2 - rh / 2; // resistor y
            ctx.strokeStyle = accent;
            ctx.lineWidth = lineW;
            ctx.lineCap = 'round';
            // Top wire
            ctx.beginPath(); ctx.moveTo(cx1, cy_top); ctx.lineTo(cx2 - rw / 2 - 10, cy_top); ctx.stroke();
            // Resistor (IEC rectangle)
            ctx.strokeRect(cx2 - rw / 2 - 10, ry, rw, rh);
            // Right + bottom wire
            ctx.beginPath(); ctx.moveTo(cx2 - rw / 2 - 10 + rw, cy_top); ctx.lineTo(cx2, cy_top); ctx.lineTo(cx2, cy_bot); ctx.stroke();
            // Bottom wire
            ctx.beginPath(); ctx.moveTo(cx1, cy_bot); ctx.lineTo(cx2, cy_bot); ctx.stroke();
            // Source (circle)
            const srcR = 22, srcX = cx1, srcY = (cy_top + cy_bot) / 2;
            ctx.beginPath(); ctx.arc(srcX, srcY, srcR, 0, 2 * Math.PI); ctx.stroke();
            ctx.strokeStyle = fg; ctx.lineWidth = 1.5;
            // Plus top of source
            ctx.beginPath(); ctx.moveTo(srcX, srcY - srcR - lineW); ctx.lineTo(srcX, cy_top); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(srcX, srcY + srcR + lineW); ctx.lineTo(srcX, cy_bot); ctx.stroke();
            ctx.fillStyle = accent; ctx.font = 'bold 13px Space Mono, monospace';
            ctx.textAlign = 'center';
            // Labels
            ctx.fillText('+', srcX, srcY - srcR + 14); ctx.fillText('−', srcX, srcY + srcR - 4);
            ctx.fillStyle = fg; ctx.font = '12px Syne, sans-serif';
            ctx.fillText(`Vs = ${laelFmt(V, 2)} V`, srcX, cy_top - 6);
            ctx.fillText(`R = ${laelFmt(R, 2)} Ω`, cx2 - rw / 2 - 10 + rw / 2, ry - 5);
            // Current arrow
            ctx.fillStyle = 'var(--accent2, #ff6b35)'; ctx.font = 'bold 11px Space Mono, monospace';
            ctx.fillText(`I = ${laelFmt(I, 3)} A →`, cx2 - rw / 2 - 10 + rw / 2, cy_bot + 20);
        }

// ─── CÓDIGO DE CORES ─────────────────────────────────────────────
function laelInitColorTable() {
            const t = document.getElementById('ohm-color-table');
            if (!t || t.innerHTML) return;
            const colors = [
                { name: 'Preto', bg: '#111', fg: '#fff', d: 0, m: '×1', tol: '' },
                { name: 'Marrom', bg: '#795548', fg: '#fff', d: 1, m: '×10', tol: '±1%' },
                { name: 'Vermelho', bg: '#e53935', fg: '#fff', d: 2, m: '×100', tol: '±2%' },
                { name: 'Laranja', bg: '#fb8c00', fg: '#fff', d: 3, m: '×1k', tol: '' },
                { name: 'Amarelo', bg: '#fdd835', fg: '#333', d: 4, m: '×10k', tol: '' },
                { name: 'Verde', bg: '#43a047', fg: '#fff', d: 5, m: '×100k', tol: '±0,5%' },
                { name: 'Azul', bg: '#1e88e5', fg: '#fff', d: 6, m: '×1M', tol: '±0,25%' },
                { name: 'Violeta', bg: '#8e24aa', fg: '#fff', d: 7, m: '×10M', tol: '±0,1%' },
                { name: 'Cinza', bg: '#757575', fg: '#fff', d: 8, m: '×100M', tol: '' },
                { name: 'Branco', bg: '#fff', fg: '#333', d: 9, m: '×1G', tol: '' },
                { name: 'Dourado', bg: '#d4af37', fg: '#333', d: '', m: '×0,1', tol: '±5%' },
                { name: 'Prateado', bg: '#9e9e9e', fg: '#fff', d: '', m: '×0,01', tol: '±10%' },
            ];
            t.innerHTML = colors.map(c => `<tr>
                <td style="padding:.35rem .6rem;border:1px solid var(--border)"><span style="display:inline-block;width:18px;height:18px;border-radius:3px;background:${c.bg};vertical-align:middle;margin-right:.5rem;border:1px solid rgba(0,0,0,.2)"></span>${c.name}</td>
                <td style="padding:.35rem .6rem;text-align:center;border:1px solid var(--border)">${c.d}</td>
                <td style="padding:.35rem .6rem;text-align:center;border:1px solid var(--border)">${c.m}</td>
                <td style="padding:.35rem .6rem;text-align:center;border:1px solid var(--border)">${c.tol}</td>
            </tr>`).join('');
        }

// ─── KIRCHHOFF ───────────────────────────────────────────────────
function laelCalcKirchhoff() {
            const Vs = parseFloat(document.getElementById('kvl-vs')?.value) || 12;
            const R1 = parseFloat(document.getElementById('kvl-r1')?.value) || 2;
            const R2 = parseFloat(document.getElementById('kvl-r2')?.value) || 4;
            const R3 = parseFloat(document.getElementById('kvl-r3')?.value) || 6;
            // Circuit: Vs → R1 (series) → node → R2 (to GND on left) || R3 (to GND on right)
            // KVL: Vs = R1*It + R2*(It - I2)  &  R2*(It-I2) = R3*I2
            // Mesh 1: Vs - R1*I1 - R2*(I1-I2) = 0
            // Mesh 2: -R2*(I2-I1) - R3*I2 = 0 → R2*I1 = (R2+R3)*I2 → I2 = R2*I1/(R2+R3)
            const I2overI1 = R2 / (R2 + R3);
            const I1 = Vs / (R1 + R2 - R2 * I2overI1);
            const I2 = I2overI1 * I1;
            const Vr1 = I1 * R1;
            const Vr2 = (I1 - I2) * R2;
            const Vr3 = I2 * R3;
            const html = laelRCell('Corrente malha I₁', laelFmt(I1, 4) + ' A', '#eab308') +
                laelRCell('Corrente malha I₂', laelFmt(I2, 4) + ' A', 'var(--accent2)') +
                laelRCell('Queda em R1 (V)', laelFmt(Vr1, 3) + ' V', 'var(--accent4)') +
                laelRCell('Queda em R2 (V)', laelFmt(Vr2, 3) + ' V', 'var(--accent)') +
                laelRCell('Queda em R3 (V)', laelFmt(Vr3, 3) + ' V', 'var(--accent3)') +
                laelRCell('Verificação KVL (Vs − VR1 − VR2)', laelFmt(Vs - Vr1 - Vr2, 4) + ' V ≈ 0', 'var(--accent4)');
            const el = document.getElementById('kvl-result');
            if (el) { el.style.display = ''; el.querySelector('#kvl-result-grid').innerHTML = html; }
            const det = document.getElementById('kvl-detail');
            if (det) det.innerHTML = `<div class="theory" style="margin-top:.6rem"><strong>Método das malhas:</strong><br>
                Malha 1: Vs − R1·I₁ − R2·(I₁−I₂) = 0 → ${laelFmt(Vs, 2)} − ${R1}·I₁ − ${R2}·(I₁−I₂) = 0<br>
                Malha 2: −R2·(I₂−I₁) − R3·I₂ = 0 → I₂ = R2/(R2+R3) · I₁ = ${laelFmt(I2overI1, 4)} · I₁</div>`;
        }

// ─── RESISTÊNCIA ─────────────────────────────────────────────────
let laelSerieCount = 3, laelParlCount = 3;

function laelInitResEqs() {
            laelRenderResInputs('serie', laelSerieCount);
            laelRenderResInputs('paralelo', laelParlCount);
        }

function laelRenderResInputs(type, n) {
            const cont = document.getElementById(type + '-inputs');
            if (!cont) return;
            cont.innerHTML = '';
            for (let i = 1; i <= n; i++) {
                const div = document.createElement('div');
                div.className = 'predial-input-group';
                div.innerHTML = `<label>R${i} (Ω)</label><input type="number" id="${type}-r${i}" value="${i * 10}" min="0.01" step="0.1" oninput="laelCalc${type.charAt(0).toUpperCase() + type.slice(1)}()">`;
                cont.appendChild(div);
            }
        }

function laelAddR(type) {
            if (type === 'serie') { if (laelSerieCount < 8) laelSerieCount++; laelRenderResInputs('serie', laelSerieCount); }
            else { if (laelParlCount < 8) laelParlCount++; laelRenderResInputs('paralelo', laelParlCount); }
        }

function laelRemR(type) {
            if (type === 'serie') { if (laelSerieCount > 2) laelSerieCount--; laelRenderResInputs('serie', laelSerieCount); }
            else { if (laelParlCount > 2) laelParlCount--; laelRenderResInputs('paralelo', laelParlCount); }
        }

function laelCalcSerie() {
            let req = 0, parts = [];
            for (let i = 1; i <= laelSerieCount; i++) {
                const r = parseFloat(document.getElementById('serie-r' + i)?.value) || 0;
                req += r; parts.push('R' + i + '=' + r.toFixed(2) + 'Ω');
            }
            const html = laelRCell('Req Série', laelFmt(req, 4) + ' Ω', '#eab308') +
                laelRCell('Fórmula', parts.join(' + '), 'var(--text-dim)');
            laelShowResult('serie-result', html);
        }

function laelCalcParalelo() {
            let inv = 0, parts = [];
            for (let i = 1; i <= laelParlCount; i++) {
                const r = parseFloat(document.getElementById('paralelo-r' + i)?.value) || 0;
                if (r > 0) { inv += 1 / r; parts.push('1/' + r.toFixed(2)); }
            }
            const req = inv > 0 ? 1 / inv : Infinity;
            const html = laelRCell('Req Paralelo', laelFmt(req, 4) + ' Ω', 'var(--accent)') +
                laelRCell('Fórmula', '1/Req = ' + parts.join(' + '), 'var(--text-dim)');
            laelShowResult('paralelo-result', html);
        }

function laelCalcDivisores() {
            const ent = parseFloat(document.getElementById('div-entrada')?.value) || 12;
            const r1 = parseFloat(document.getElementById('div-r1')?.value) || 3;
            const r2 = parseFloat(document.getElementById('div-r2')?.value) || 6;
            const Vout = ent * r2 / (r1 + r2);
            const I1 = ent * r2 / (r1 + r2);    // divisor de corrente (entrada = corrente total)
            const html = laelRCell('Vout (divisor de tensão)', laelFmt(Vout, 4) + ' V', 'var(--accent4)') +
                laelRCell('Porcentagem de Vs', laelFmt(100 * r2 / (r1 + r2), 2) + ' %', '#eab308') +
                laelRCell('I₁ (divisor de corrente, entrada=It)', laelFmt(I1, 4) + ' A', 'var(--accent3)') +
                laelRCell('I₂', laelFmt(ent - I1, 4) + ' A', 'var(--accent)');
            laelShowResult('div-result', html);
        }

// ─── POTÊNCIA ────────────────────────────────────────────────────
function laelCalcPotencia() {
            let V = parseFloat(document.getElementById('pot-v')?.value) || 0;
            let I = parseFloat(document.getElementById('pot-i')?.value) || 0;
            let R = parseFloat(document.getElementById('pot-r')?.value) || 0;
            let P = parseFloat(document.getElementById('pot-p')?.value) || 0;
            // Resolve with the two non-zero values
            const known = [V > 0, I > 0, R > 0, P > 0];
            const n = known.filter(Boolean).length;
            if (n >= 2) {
                if (V > 0 && I > 0) { R = R || V / I; P = P || V * I; }
                else if (V > 0 && R > 0) { I = I || V / R; P = P || V * V / R; }
                else if (V > 0 && P > 0) { I = I || P / V; R = R || V * V / P; }
                else if (I > 0 && R > 0) { V = V || I * R; P = P || I * I * R; }
                else if (I > 0 && P > 0) { V = V || P / I; R = R || P / (I * I); }
                else if (R > 0 && P > 0) { V = V || Math.sqrt(P * R); I = I || Math.sqrt(P / R); }
            }
            const html = laelRCell('Tensão V', laelFmt(V, 4) + ' V', '#eab308') +
                laelRCell('Corrente I', laelFmt(I, 4) + ' A', 'var(--accent2)') +
                laelRCell('Resistência R', laelFmt(R, 4) + ' Ω', 'var(--accent4)') +
                laelRCell('Potência P', laelFmt(P, 4) + ' W', 'var(--accent)') +
                laelRCell('Energia (1h)', laelFmt(P * 3600, 2) + ' J', 'var(--accent3)');
            laelShowResult('pot-result', html);
        }

function laelCalcKwh() {
            const p = parseFloat(document.getElementById('kwh-p')?.value) || 0;
            const h = parseFloat(document.getElementById('kwh-h')?.value) || 0;
            const d = parseFloat(document.getElementById('kwh-d')?.value) || 30;
            const tarifa = parseFloat(document.getElementById('kwh-tarifa')?.value) || 0.85;
            const kwh_dia = p * h / 1000;
            const kwh_mes = kwh_dia * d;
            const custo = kwh_mes * tarifa;
            const html = laelRCell('Consumo/dia', laelFmt(kwh_dia, 4) + ' kWh', '#eab308') +
                laelRCell('Consumo/mês', laelFmt(kwh_mes, 3) + ' kWh', 'var(--accent)') +
                laelRCell('Custo mensal', 'R$ ' + laelFmt(custo, 2), 'var(--accent4)') +
                laelRCell('Custo anual', 'R$ ' + laelFmt(custo * 12, 2), 'var(--accent2)');
            laelShowResult('kwh-result', html);
        }

// ─── THÉVENIN / NORTON ───────────────────────────────────────────
function laelCalcThevenin() {
            const Vs = parseFloat(document.getElementById('th-vs')?.value) || 24;
            const R1 = parseFloat(document.getElementById('th-r1')?.value) || 4;
            const R2 = parseFloat(document.getElementById('th-r2')?.value) || 8;
            const RL = parseFloat(document.getElementById('th-rl')?.value) || 6;
            // Vth = Vs * R2 / (R1 + R2)
            const Vth = Vs * R2 / (R1 + R2);
            // Rth = R1 || R2 (fontes zeradas, fonte Vs em curto)
            const Rth = (R1 * R2) / (R1 + R2);
            const IL = Vth / (Rth + RL);
            const VL = IL * RL;
            const PL = IL * IL * RL;
            // Norton
            const In = Vth / Rth;
            const html = laelRCell('Vth (tensão Thévenin)', laelFmt(Vth, 4) + ' V', '#eab308') +
                laelRCell('Rth (resistência equivalente)', laelFmt(Rth, 4) + ' Ω', 'var(--accent4)') +
                laelRCell('IL (corrente na carga RL)', laelFmt(IL, 4) + ' A', 'var(--accent)') +
                laelRCell('VL (tensão na carga)', laelFmt(VL, 4) + ' V', 'var(--accent2)') +
                laelRCell('PL (potência na carga)', laelFmt(PL, 4) + ' W', 'var(--accent3)');
            const el = document.getElementById('th-result');
            if (el) { el.style.display = ''; el.querySelector('#th-result-grid').innerHTML = html; }
            const det = document.getElementById('th-detail');
            if (det) det.innerHTML = `<div class="theory"><strong>Passos:</strong><br>
                1. Vth = Vs · R2/(R1+R2) = ${laelFmt(Vs, 2)} × ${R2}/(${R1}+${R2}) = ${laelFmt(Vth, 4)} V<br>
                2. Rth = R1∥R2 = (${R1}×${R2})/(${R1}+${R2}) = ${laelFmt(Rth, 4)} Ω<br>
                3. IL = Vth/(Rth+RL) = ${laelFmt(Vth, 4)}/(${laelFmt(Rth, 4)}+${RL}) = ${laelFmt(IL, 4)} A</div>`;
            // Norton
            const nortonHtml = laelRCell('In (corrente Norton)', laelFmt(In, 4) + ' A', 'var(--accent)') +
                laelRCell('Rn = Rth', laelFmt(Rth, 4) + ' Ω', 'var(--accent4)') +
                laelRCell('IL via Norton', laelFmt(In * Rth / (Rth + RL), 4) + ' A', '#eab308');
            const nortonEl = document.getElementById('norton-result');
            if (nortonEl) { nortonEl.style.display = ''; nortonEl.querySelector('#norton-result-grid').innerHTML = nortonHtml; }
        }

// ─── SUPERPOSIÇÃO ────────────────────────────────────────────────
function laelCalcSuperposicao() {
            const Vs1 = parseFloat(document.getElementById('sup-vs1')?.value) || 10;
            const Vs2 = parseFloat(document.getElementById('sup-vs2')?.value) || 6;
            const R1 = parseFloat(document.getElementById('sup-r1')?.value) || 4;
            const R2 = parseFloat(document.getElementById('sup-r2')?.value) || 6;
            const R3 = parseFloat(document.getElementById('sup-r3')?.value) || 8;
            // Circuito: Vs1 — R1 — nó A — R2 — Vs2 (ref gnd), nó A — R3 — gnd
            // Superposição sobre corrente em R3:
            // Passo 1: Vs1 ativa, Vs2=0 (curto)
            //   R2 ∥ R3, em série com R1. Total = R1 + R2∥R3
            const Rp23_1 = (R2 * R3) / (R2 + R3);
            const It1 = Vs1 / (R1 + Rp23_1);
            const Ir3_1 = It1 * R2 / (R2 + R3);  // divisor de corrente em A — R2∥R3
            // Passo 2: Vs2 ativa, Vs1=0 (curto)
            //   R1 ∥ R3, em série com R2. Total = R2 + R1∥R3
            const Rp13_2 = (R1 * R3) / (R1 + R3);
            const It2 = Vs2 / (R2 + Rp13_2);
            const Ir3_2 = It2 * R1 / (R1 + R3);
            // Total (sentidos dependem do circuito — aqui assumimos mesmo sentido em R3 para ambos)
            const Ir3_tot = Ir3_1 + Ir3_2;
            const Vr3 = Ir3_tot * R3;
            const html = laelRCell('I\'R3 (só Vs1 ativa)', laelFmt(Ir3_1, 4) + ' A', '#eab308') +
                laelRCell('I\'\'R3 (só Vs2 ativa)', laelFmt(Ir3_2, 4) + ' A', 'var(--accent2)') +
                laelRCell('IR3 total', laelFmt(Ir3_tot, 4) + ' A', 'var(--accent4)') +
                laelRCell('VR3 (tensão na carga)', laelFmt(Vr3, 4) + ' V', 'var(--accent)');
            const el = document.getElementById('sup-result');
            if (el) { el.style.display = ''; el.querySelector('#sup-result-grid').innerHTML = html; }
            const det = document.getElementById('sup-detail');
            if (det) det.innerHTML = `<div class="theory"><strong>Passo 1 (Vs1 ativa):</strong> R_eq = R1 + R2∥R3 = ${R1} + ${laelFmt(Rp23_1, 3)} = ${laelFmt(R1 + Rp23_1, 3)} Ω; It = ${laelFmt(It1, 4)} A; I'R3 = ${laelFmt(Ir3_1, 4)} A<br>
            <strong>Passo 2 (Vs2 ativa):</strong> R_eq = R2 + R1∥R3 = ${R2} + ${laelFmt(Rp13_2, 3)} = ${laelFmt(R2 + Rp13_2, 3)} Ω; It = ${laelFmt(It2, 4)} A; I''R3 = ${laelFmt(Ir3_2, 4)} A</div>`;
        }

// ─── TRANSIENTES RC/RL ───────────────────────────────────────────
let laelTransMode = 'rc', laelTransAnimId = null, laelTransCharge = true;

function laelTransSetMode(m) {
            laelTransMode = m;
            cancelAnimationFrame(laelTransAnimId);
            const rcb = document.getElementById('trans-rc-btn');
            const rlb = document.getElementById('trans-rl-btn');
            const cg = document.getElementById('trans-c-grp');
            const lg = document.getElementById('trans-l-grp');
            if (m === 'rc') {
                if (rcb) { rcb.style.background = '#eab308'; rcb.style.color = '#000'; }
                if (rlb) { rlb.style.background = 'var(--surface2)'; rlb.style.color = 'var(--text)'; rlb.style.border = '1px solid var(--border)'; }
                if (cg) cg.style.display = ''; if (lg) lg.style.display = 'none';
            } else {
                if (rlb) { rlb.style.background = '#eab308'; rlb.style.color = '#000'; rlb.style.border = 'none'; }
                if (rcb) { rcb.style.background = 'var(--surface2)'; rcb.style.color = 'var(--text)'; }
                if (cg) cg.style.display = 'none'; if (lg) lg.style.display = '';
            }
            laelTransDraw();
        }

function laelTransGetParams() {
            const V = parseFloat(document.getElementById('trans-v')?.value) || 10;
            const R = parseFloat(document.getElementById('trans-r')?.value) || 1000;
            let tau;
            if (laelTransMode === 'rc') {
                const C = (parseFloat(document.getElementById('trans-c')?.value) || 100) * 1e-6;
                tau = R * C;
            } else {
                const L = (parseFloat(document.getElementById('trans-l')?.value) || 100) * 1e-3;
                tau = L / R;
            }
            return { V, R, tau };
        }

function laelTransDraw(tFrac) {
            const cv = document.getElementById('trans-canvas');
            if (!cv) return;
            const { V, R, tau } = laelTransGetParams();
            // Update info
            const info = document.getElementById('trans-info');
            if (info) {
                const C_or_L = laelTransMode === 'rc'
                    ? `C = ${document.getElementById('trans-c')?.value} µF`
                    : `L = ${document.getElementById('trans-l')?.value} mH`;
                info.innerHTML = `<span style="background:var(--surface2);padding:.3rem .7rem;border-radius:8px">τ = ${laelEngUnit(tau, 's')}</span>
                    <span style="background:var(--surface2);padding:.3rem .7rem;border-radius:8px">5τ = ${laelEngUnit(5 * tau, 's')}</span>
                    <span style="background:var(--surface2);padding:.3rem .7rem;border-radius:8px">V∞ = ${V} V</span>
                    <span style="background:var(--surface2);padding:.3rem .7rem;border-radius:8px">${C_or_L}</span>`;
            }
            const ctx = cv.getContext('2d');
            const W = cv.width, H = cv.height;
            ctx.clearRect(0, 0, W, H);
            const PAD_L = 55, PAD_R = 20, PAD_T = 20, PAD_B = 40;
            const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
            const isDark = document.body.classList.contains('dark');
            const gridCol = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
            const axisCol = isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.5)';
            const textCol = isDark ? '#94a3b8' : '#475569';

            // Grid
            ctx.strokeStyle = gridCol; ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const x = PAD_L + (i / 5) * plotW;
                ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, PAD_T + plotH); ctx.stroke();
                const y = PAD_T + (i / 5) * plotH;
                ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(PAD_L + plotW, y); ctx.stroke();
            }
            // Axes
            ctx.strokeStyle = axisCol; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(PAD_L, PAD_T); ctx.lineTo(PAD_L, PAD_T + plotH); ctx.lineTo(PAD_L + plotW, PAD_T + plotH); ctx.stroke();
            // Y axis labels
            ctx.fillStyle = textCol; ctx.font = '10px Space Mono, monospace'; ctx.textAlign = 'right';
            for (let i = 0; i <= 4; i++) {
                const v = V * i / 4;
                const y = PAD_T + plotH - (i / 4) * plotH;
                ctx.fillText(v.toFixed(1) + 'V', PAD_L - 4, y + 3);
            }
            // X axis labels
            ctx.textAlign = 'center';
            for (let i = 0; i <= 5; i++) {
                const t = i * tau;
                const x = PAD_L + (i / 5) * plotW;
                ctx.fillText((i > 0 ? i : '0') + 'τ', x, PAD_T + plotH + 16);
            }
            // Tau markers vertical lines
            const tauCols = ['var(--accent)', 'var(--accent4)', '#eab308', 'var(--accent3)', 'var(--accent2)'];
            const tauPcts = [0.632, 0.865, 0.950, 0.982, 0.993];
            for (let i = 1; i <= 5; i++) {
                const x = PAD_L + (i / 5) * plotW;
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)';
                ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, PAD_T + plotH); ctx.stroke();
                ctx.setLineDash([]);
                // Horizontal marker at tau pct
                const pct = laelTransCharge ? tauPcts[i - 1] : 1 - tauPcts[i - 1];
                const y = PAD_T + plotH - pct * plotH;
                ctx.fillStyle = tauCols[i - 1] || '#eab308';
                ctx.font = 'bold 9px Space Mono, monospace'; ctx.textAlign = 'left';
                if (i <= 3) ctx.fillText((laelTransCharge ? '+' : '-') + (tauPcts[i - 1] * 100).toFixed(1) + '%', x + 3, y - 2);
            }
            // Main curve
            const pts = 300;
            const endT = 5 * tau;
            const charge = laelTransCharge;
            const curFrac = tFrac !== undefined ? tFrac : 1;

            ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
            ctx.beginPath();
            for (let i = 0; i <= pts * curFrac; i++) {
                const t = (i / pts) * endT;
                let val;
                if (charge) val = V * (1 - Math.exp(-t / tau));
                else val = V * Math.exp(-t / tau);
                const x = PAD_L + (t / endT) * plotW;
                const y = PAD_T + plotH - (val / V) * plotH;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            // V∞ dashed line
            if (charge) {
                ctx.strokeStyle = isDark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)';
                ctx.setLineDash([6, 4]); ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(PAD_L, PAD_T); ctx.lineTo(PAD_L + plotW, PAD_T); ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = textCol; ctx.font = '10px Space Mono, monospace'; ctx.textAlign = 'left';
                ctx.fillText('V∞=' + V + 'V', PAD_L + 4, PAD_T + 12);
            }
            // Axis labels
            ctx.fillStyle = textCol; ctx.font = '11px Syne, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Tempo →', PAD_L + plotW / 2, H - 4);
            ctx.save(); ctx.translate(12, PAD_T + plotH / 2); ctx.rotate(-Math.PI / 2);
            ctx.fillText(laelTransMode === 'rc' ? 'Vc(t)' : 'iL(t)', 0, 0); ctx.restore();
        }

function laelTransAnimate() {
            laelTransCharge = true;
            cancelAnimationFrame(laelTransAnimId);
            let start = null;
            const dur = 2000;
            function step(ts) {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                laelTransDraw(p);
                if (p < 1) laelTransAnimId = requestAnimationFrame(step);
            }
            laelTransAnimId = requestAnimationFrame(step);
        }

function laelTransAnimateDis() {
            laelTransCharge = false;
            cancelAnimationFrame(laelTransAnimId);
            let start = null;
            const dur = 2000;
            function step(ts) {
                if (!start) start = ts;
                const p = Math.min((ts - start) / dur, 1);
                laelTransDraw(p);
                if (p < 1) laelTransAnimId = requestAnimationFrame(step);
            }
            laelTransAnimId = requestAnimationFrame(step);
        }

// Init computations on page load
document.addEventListener('DOMContentLoaded', () => {
            laelOhmCalc();
            laelInitColorTable();
            laelInitResEqs();
            laelCalcDivisores();
            laelCalcPotencia();
            laelCalcKwh();
            laelCalcKirchhoff();
            laelCalcThevenin();
            laelCalcSuperposicao();
            laelTransDraw();
        });
