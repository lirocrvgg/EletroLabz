/* assets/js/legacy/predial.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/predial.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: predial.html, depois de core.js. */

// ─── NAVEGAÇÃO PROJETOS PREDIAIS ──────────────────────────────
function showPredialPage(id, btn) {
            document.querySelectorAll('#main-predial .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-predial .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id);
            if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-predial .nav-btn[data-ppage="' + id + '"]');
            if (nb) nb.classList.add('active');
        }

// ─── LUMINOTÉCNICA — NBR ISO/CIE 8995-1 ──────────────────────
function lumiOnAmbienteChange() {
            const sel = document.getElementById('lumi-ambiente');
            const [, lux] = sel.value.split('|');
            const isCustom = lux === '0';
            document.getElementById('lumi-lux-custom-group').style.display = isCustom ? '' : 'none';
            if (!isCustom) {
                document.getElementById('lumi-lux').value = lux;
            } else {
                document.getElementById('lumi-lux').value = document.getElementById('lumi-lux-custom').value;
            }
            calcLumi();
        }

function lumiOnTipoChange() {
            const sel = document.getElementById('lumi-tipo');
            const parts = sel.value.split('|');
            const lm = parts[1];
            const fp = parts[2];
            const isCustom = lm === '0';
            if (!isCustom) {
                // Find W from the option text pattern "XX W"
                const txt = sel.options[sel.selectedIndex].text;
                const wMatch = txt.match(/(\d+)\s*W\s*[\/|]/);
                if (wMatch) document.getElementById('lumi-pot-unit').value = wMatch[1];
                document.getElementById('lumi-fluxo').value = lm;
                document.getElementById('lumi-fp').value = fp;
            }
            calcLumi();
        }

// Coeficiente de utilização (CU) via índice k e reflectâncias — tabela simplificada NBR
function lumiGetCU(k, rot, rop, rof) {
            // k: índice do local; reflectâncias como decimais
            // Tabela CU interpolada para luminária direta/semidireta (típico)
            // Fonte: método dos lumens, Mamede Filho & outros
            const kc = Math.min(Math.max(k, 0.6), 5);
            // base CU para teto 0.5, parede 0.5, piso 0.2 (referência)
            const cuBase = kc < 1   ? 0.28 + (kc - 0.6) * 0.25
                         : kc < 1.5 ? 0.38 + (kc - 1)   * 0.20
                         : kc < 2   ? 0.48 + (kc - 1.5)  * 0.14
                         : kc < 3   ? 0.55 + (kc - 2)    * 0.09
                         : kc < 4   ? 0.64 + (kc - 3)    * 0.05
                         :            0.69 + (kc - 4)    * 0.02;
            // Ajuste proporcional às reflectâncias em relação à referência
            const deltaRot = (rot - 0.5) * 0.06;
            const deltaRop = (rop - 0.5) * 0.04;
            const deltaRof = (rof - 0.2) * 0.02;
            return Math.min(0.95, Math.max(0.2, cuBase + deltaRot + deltaRop + deltaRof));
        }

function calcLumi() {
            // ── Entradas ──
            const ambSel = document.getElementById('lumi-ambiente').value;
            const [, luxAmb] = ambSel.split('|');
            const isCustom = luxAmb === '0';
            const Em = isCustom
                ? parseFloat(document.getElementById('lumi-lux-custom').value) || 300
                : parseFloat(document.getElementById('lumi-lux').value) || 300;
            if (isCustom) document.getElementById('lumi-lux').value = Em;

            const a  = parseFloat(document.getElementById('lumi-comp').value)     || 5;
            const b  = parseFloat(document.getElementById('lumi-larg').value)     || 4;
            const H  = parseFloat(document.getElementById('lumi-alt').value)      || 2.8;
            const hp = parseFloat(document.getElementById('lumi-hp').value)       || 0.75;
            const Φ1 = parseFloat(document.getElementById('lumi-fluxo').value)    || 4000;
            const Pw = parseFloat(document.getElementById('lumi-pot-unit').value) || 40;
            const fp = parseFloat(document.getElementById('lumi-fp').value)       || 0.9;
            const rot = parseFloat(document.getElementById('lumi-rot').value);
            const rop = parseFloat(document.getElementById('lumi-rop').value);
            const rof = parseFloat(document.getElementById('lumi-rof').value);
            const Fm  = parseFloat(document.getElementById('lumi-fm').value);

            // ── Cálculos ──
            const A  = a * b;
            const Hm = H - hp; // altura de montagem sobre o plano de trabalho
            const k  = (a * b) / (Hm * (a + b)); // índice do local

            const CU = lumiGetCU(k, rot, rop, rof);

            // Fluxo luminoso total necessário: Φtotal = Em × A / (CU × Fm)
            const phiTotal = (Em * A) / (CU * Fm);

            // Número de luminárias
            const N_real = phiTotal / Φ1;
            const N = Math.ceil(N_real);

            // Iluminância efetiva com N inteiras
            const Em_real = (N * Φ1 * CU * Fm) / A;

            // Potência total
            const P_total_W  = N * Pw;
            const P_total_VA = P_total_W / fp;

            // Densidade de potência — DPEA (W/m²)
            const DPEA = P_total_W / A;

            // Eficiência energética — categoria conforme NBR 16565 / Procel (orientativo)
            let catEE;
            if (DPEA <= 6)       catEE = 'Excelente (≤ 6 W/m²)';
            else if (DPEA <= 10) catEE = 'Boa (≤ 10 W/m²)';
            else if (DPEA <= 15) catEE = 'Regular (≤ 15 W/m²)';
            else                 catEE = 'Alta (> 15 W/m²)';

            // ── Exibição ──
            const resDiv  = document.getElementById('lumi-result');
            const grid    = document.getElementById('lumi-result-grid');
            const detail  = document.getElementById('lumi-detail');
            const badges  = document.getElementById('lumi-badges');

            resDiv.style.display = '';

            const fmt = (v, dec=2) => v.toFixed(dec).replace('.', ',');

            grid.innerHTML = `
                <div class="predial-result-item"><span class="predial-result-label">Área do ambiente</span><span class="predial-result-value">${fmt(A,2)} m²</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Iluminância requerida (Em)</span><span class="predial-result-value">${Em} lux</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Índice do local (k)</span><span class="predial-result-value">${fmt(k,3)}</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Coef. de utilização (CU)</span><span class="predial-result-value">${fmt(CU,3)}</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Fator de manutenção (Fm)</span><span class="predial-result-value">${Fm}</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Fluxo total necessário</span><span class="predial-result-value">${fmt(phiTotal,0)} lm</span></div>
                <div class="predial-result-item" style="background:rgba(245,158,11,.12);border:1px solid var(--warn)"><span class="predial-result-label" style="color:var(--warn)">Nº de luminárias (N)</span><span class="predial-result-value" style="color:var(--warn);font-size:1.25rem">${N} un.</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Iluminância efetiva real</span><span class="predial-result-value">${fmt(Em_real,1)} lux</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Potência total instalada</span><span class="predial-result-value">${fmt(P_total_W,1)} W</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Potência aparente total</span><span class="predial-result-value">${fmt(P_total_VA,1)} VA</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Densidade de potência (DPEA)</span><span class="predial-result-value">${fmt(DPEA,2)} W/m²</span></div>
                <div class="predial-result-item"><span class="predial-result-label">Eficiência energética</span><span class="predial-result-value">${catEE}</span></div>
            `;

            detail.innerHTML = `
                <div class="theory" style="margin-top:.5rem">
                    <strong>Metodologia:</strong> Método dos Lumens (NBR ISO/CIE 8995-1).<br>
                    <strong>Fórmula principal:</strong> N = (Em × A) / (Φ<sub>lum</sub> × CU × Fm)<br>
                    &emsp;→ N = (${Em} × ${fmt(A,2)}) / (${Φ1} × ${fmt(CU,3)} × ${Fm}) = <strong>${fmt(N_real,2)}</strong> → adotado <strong>${N} luminárias</strong><br>
                    <strong>Índice do local:</strong> k = (a × b) / [Hm × (a + b)] = (${a} × ${b}) / [${fmt(Hm,2)} × (${a}+${b})] = <strong>${fmt(k,3)}</strong><br>
                    <strong>Circuito elétrico estimado:</strong> ${fmt(P_total_VA,1)} VA / 220 V ≈ <strong>${fmt(P_total_VA/220,2)} A</strong> — verificar dimensionamento de circuito conforme NBR 5410.
                </div>
            `;

            badges.innerHTML = `
                <span style="background:var(--accent);color:var(--on-accent);padding:.28rem .75rem;border-radius:8px;font-size:.8rem;font-weight:700"><i data-eo-icon=lightbulb></i> ${N} luminárias</span>
                <span style="background:var(--warn);color:var(--on-accent);padding:.28rem .75rem;border-radius:8px;font-size:.8rem;font-weight:700">${fmt(Em_real,1)} lux efetivos</span>
                <span style="background:var(--accent4);color:var(--on-accent);padding:.28rem .75rem;border-radius:8px;font-size:.8rem;font-weight:700"><i data-eo-icon=zap></i> ${fmt(P_total_W,1)} W / ${fmt(P_total_VA,1)} VA</span>
                <span style="background:var(--accent3);color:var(--on-accent);padding:.28rem .75rem;border-radius:8px;font-size:.8rem;font-weight:700">${fmt(DPEA,2)} W/m²</span>
                <span style="background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.28rem .75rem;border-radius:8px;font-size:.8rem;font-weight:700">CU = ${fmt(CU,3)} | Fm = ${Fm} | k = ${fmt(k,3)}</span>
            `;
        }

// Dispara cálculo automático ao carregar
(function() {
            setTimeout(() => {
                lumiOnAmbienteChange();
                lumiOnTipoChange();
            }, 200);
        })();

// ─── LUMINOTÉCNICA — SUB-PAGES ─────────────────────────────
function showLumiSubPage(id) {
            ['lumi-sub-detalhado','lumi-sub-comodos'].forEach(s => {
                const el = document.getElementById(s);
                if (el) el.style.display = (s === id) ? '' : 'none';
            });
            ['btn-lumi-detalhado','btn-lumi-comodos'].forEach(b => {
                const btn = document.getElementById(b);
                if (!btn) return;
                const active = (b === 'btn-lumi-' + id.replace('lumi-sub-',''));
                btn.classList.toggle('active', active);
                btn.style.background = active ? '#f59e0b' : 'var(--surface2)';
                btn.style.color      = active ? '#fff'    : 'var(--text)';
                btn.style.border     = active ? 'none'    : '1px solid var(--border)';
            });
        }

// ─── LUMINOTÉCNICA — CÁLCULO POR CÔMODOS (Método dos Lúmens — PDF) ───
const LC_COMODOS = [];

// Catálogo Stella LED — [código, descrição, fluxo(lm), pot(W)]
const STELLA_FOTOS = {
          'STH9035': { w: 246, h: 300, src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAFPARMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKRiQOKAFopm5u/FLuNK4DqKYXwcEgUbj1ouK4+imb/cUu40BcdRTd3uKA3PUUBcdRTC2DjP6UpPHBFMY6imBiOpFG5icbePrQA+iiigAooooAKKKKACiiigAooooAKKKKACiiigAoooNABSbh25o/GmE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OAbUAx2qSkX+lLVIYUUUUwCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKyPEIzAv1rXrL8Qf8eqn3oAxGHy1SuQApNXXYEcCqdwMqalktMyph81VnJyatTghqqyDk0hpCRdavW/aqMfDVftx0oGXoOorX0oBp1BrKt1Oa2NGQm4UUAdEowBS0i9KWqQBRRRTAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArP1ld1kfrWhUUsSyRtE3Q0Aco38qrTY2mr99btbSlAhK9c1nz9DUsDLufvVVk61bufv1UkpANX7wrQtugqjH1FaFvnaMUAXrfBPUVs6J/x8qe2KxbdS0gSJCWPU4rq9JtPs8IZvvEc0AX16UtIo70tUgCiiimAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSEClooAqzosnyMmVxya828Qa4un+IL6yeJhBCYlUcZy6hufTrXoetJMbKYQytG/lttI9cH8q+Srn4q6XYC9/t6O/mupNQZVkTkjyGMfLZ/2elKwHuENw13H58EJeISOjMvONpKnj61A8gBwElb0+Sue+Amvt4l8XapNZXt6lgNtxHCznkS4fnn3r3U2sDHJgjz64osgPL4hM3It5NvUsRwKrXOv29tFM0OJmjgedFHG8BlUj8N1b/xynl03wBeXlpdS2ssChl8okbucY4+tfP9h8UvDfmQ6RNDqgu/sbWokxkKZNrseT6xj86LID6n8P28K2cM6bW3oG39Q2fStrGRg15h+zvrF3r3gNdUupXYSybUjb/lmo//AF16ehBUEciiyAUDAxRRRTAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAK98iyxNC2R5ilQfTivl7xl+zVreo3TSaZrsOx7qaba69pJC/9a+qaTFAHk3wQ+GFz4Ckubm+1D7TNPFFGVUcfKoH9K9ZX7o7UuKKAOa+I/h0+KfCd5oguWtjcJjzAuQOa+cF/Zj19fEMV2dZtmgRgd5+8eCP619aYoxQBxfwm8HnwT4Og0AXhuWiYs0mMZrso+EAC7fanYooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCl/Z0f/Pze/8AgS/+NH9nR/8APze/+BL/AONXaKAKX9nR/wDPze/+BL/40f2dH/z83v8A4Ev/AI1dooApf2dH/wA/N7/4Ev8A40f2dH/z83v/AIEv/jV2igCl/Z0f/Pze/wDgS/8AjR/Z0f8Az83v/gS/+NXaKAKX9nR/8/N7/wCBL/40f2dH/wA/N7/4Ev8A41dooApf2dH/AM/N7/4Ev/jR/Z0f/Pze/wDgS/8AjV2igCl/Z0f/AD83v/gS/wDjR/Z0f/Pze/8AgS/+NXaKAKX9nR/8/N7/AOBL/wCNH9nR/wDPze/+BL/41dooApf2dH/z83v/AIEv/jR/Z0f/AD83v/gS/wDjV2igCl/Z0f8Az83v/gS/+NH9nR/8/N7/AOBL/wCNXaKAKX9nR/8APze/+BL/AONH9nR/8/N7/wCBL/41dooApf2dH/z83v8A4Ev/AI0f2dH/AM/N7/4Ev/jV2igCl/Z0f/Pze/8AgS/+NH9nR/8APze/+BL/AONXaKAKX9nR/wDPze/+BL/40f2dH/z83v8A4Ev/AI1dooApf2dH/wA/N7/4Ev8A40f2dH/z83v/AIEv/jV2igCl/Z0f/Pze/wDgS/8AjR/Z0f8Az83v/gS/+NXaKAKX9nR/8/N7/wCBL/40f2dH/wA/N7/4Ev8A41dooApf2dH/AM/N7/4Ev/jRV2igD//Z' },
          'STH7264': { w: 111, h: 181, src: 'data:image/jpeg;base64,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' },
          'STH8264E': { w: 286, h: 125, src: 'data:image/jpeg;base64,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' },
          'STH6233': { w: 276, h: 160, src: 'data:image/jpeg;base64,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' },
          'STH9001': { w: 264, h: 280, src: 'data:image/jpeg;base64,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' },
          'STH8264': { w: 286, h: 125, src: 'data:image/jpeg;base64,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' },
          'STH8434': { w: 304, h: 320, src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAGaAYYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopGOKAFopuTSgkigBaKTd60E+goAWioXnij+/Ii/U1Wn1fT4fv3KD8RQBfoNYk/ijR4gd1yp+lZ8/jrRY84l3e2cUAdXSVw8vxI0hSQiOce9VZfibY5xFAzGmiZHoNBrzd/iWo6Wh9uKrzfEq5Mb7LMFhyMUCPT6PzryuT4k34Z0FplhjjFM/4WTqf/Pl+lID1eg5//VXlH/CyNTxkWQ/I0L8SNTPWx/Q0Aer/APfVLXlP/Cx9T7WR/KpU+Jd6Mb9OyPYGncD1KgV5pH8Tjn95psn4VNF8TbbP7ywlQev+RQB6NRXBL8TNK3ANFIPwq3D8RNCkIBcr9aRZ2VFc7B4y0ObGLtVz61oQ63pk2Nl5Ec+4oA0qKrpdwyf6uRG+hqXzFxnNAD6KaGz05peaAFopCSO1A5GaAFooooAKKKKACiiigAooooAKKKKACiiigAooooAKM0UjUCYFgDzmgsBzVO6vra1BEsuD6Z61gav4utbVT5ZQEf36BXOr3Aiq897bQ8PMgPpnmvKdX+Id27GKxxuHcdK43XvGksSs9/qkcJP8IYAn9afKFz3K98T6bakrNME9M8ZrDvviHZRkLbQtMTnBUZHFfOur/EnS7GJ5Y7W5vCASTyoP5/0rQ+B3xC0Px142Xw5f2LacGiZrY7+ZJOSRz7Cnyhc9iu/H+oyljFEIlIyC3Gawb/xhqrDdJeBE/vA8dPX8a6bW/BljBqtsbeNntmXDhn7jJr5T/ae0S/8A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1fh8tT9+qkFtH/eatC3t1H8C/jTSuG5Yhl3ELGu6rkdpdyY27Uz3NM0pQt8oCgdenSt4dqdh2M+HTeP37Fj7VciiWFQI14qaimMRR3paKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAIrlPMjZPasKUMjFSMc8V0LZ7VTv7ZJIywXkUmJnOXAbOc1RnPvUuo3MVvqMlnI+ZEUFgOwPT+VVppY/M2FgG7A9xUk2GMo9TUsCDFQGSM9XUEdQangliHWRaAsy/ark4q2igLu7Vm/wBoWltA9xPKEiQFmbsoAyc/hW3pKJfW8VzuHkyLvTHUinEaH6RBI1wZWXCg8VsJzn2pIlVF2oAAKdj0qihaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqG9kaK2eRIzIyjIUDOamqK7Gbd155BHFAHgWsa3F4m1HW7+JIrXylhhkLybcEb8/0rd8H6zFfeLb3w29g06mRpFuRKD5cZA2dvZq+bvjJoHiODxFqzDR9R8mTV5pFMSNgoCMHivTv2S9K1y38Qy3l7Z3cNu9lFH5swPOC3r9aAPodfC+mt8zJJu6Z3ZzWX4xjsvDHh6fWYdNe+a3w3llsf8C6dq7KP7vT8fWuX+LdpdX3w71q0s4TNNJauqoOp+U9KAPKLXUJta0+GSS4TzZrW8KxPMAzb49qYHf5sivRfhH4kj1/QzFFAUisiIBNnh2GMiviW40fxJD4zsFGnatlJY1KhWCx4b6dK+tP2WtJ1DS/AEkOqWElpK920gD5BIOMGgD2CL7u7GCeTT6ZACsQBOTT6ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKR13KRkj6UtFAFaSytpT++hjkB6hkBz60+G2hhXZFGka4xhVA4qaigBFXbwKGUEYPSlooArPYWTNuNrDuznd5YzUyxqo2qAFHYDAp9FADVXBPPWnUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hR/adp/03/8B3/woAu0VS/tO0/6b/8AgO/+FH9p2n/Tf/wHf/CgC7RVL+07T/pv/wCA7/4Uf2naf9N//Ad/8KALtFUv7TtP+m//AIDv/hRQBdooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9k=' },
          'STH9740': { w: 142, h: 135, src: 'data:image/jpeg;base64,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' },
          'STH9003': { w: 204, h: 280, src: 'data:image/jpeg;base64,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' },
          'STH9760': { w: 360, h: 384, src: 'data:image/jpeg;base64,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' },
          'STH9005': { w: 255, h: 280, src: 'data:image/jpeg;base64,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' },
          'STH9220': { w: 226, h: 200, src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCADIAOIDASIAAhEBAxEB/8QAGgABAQEBAQEBAAAAAAAAAAAAAAQBBQIDCP/EADEQAQABAgMFBgUEAwAAAAAAAAABAgQDETMSFTFUkyEyUVJxkRNygaHBNEFCYSNisf/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABYRAQEBAAAAAAAAAAAAAAAAAAARIf/aAAwDAQACEQMRAD8A/VIAAE8ABLc9tUej4TNMT/YOiOdtU+an3NqmP5R7g6I523TP7x7mceP3B0Rzs48YM4833B0RzomM+P3bM0+IOgIIqjx+7NuM+NIOgOfnn25xkrttMH1AAAAAAAAAAAAAAABPj9+PRyryM7imP9Kfy6uP24kejl3nbcU/1RSDxsROXZEN+F6Nji0SvMYeX9t2I8rQVmxHlIpjweobxB4mmM+FLKaO3ty9n0yyAeco8DZiXogH3wIywoXW2miwNOPVbbaf1B9QAAAAAAAAAAAAACeATwBLjakejm3X6in5Kfy6Vx36fo5l1rx8tIN/cawSDYY2BWgAAAAyZyjMFODpQtttNDgTnhQuttMH1AAAAAAAAAAAAAAJ4ACXH1Kfo5l1rx8tLp43fj0pcy614+WkHpjWAAA2GshoAADJ4S0B98DRhdbaaLB01ttpg+oAAAAAAAAAAAAAAAJbnVj6OZc/qI+WPy6V1qfRzbv9RHpH/agb+4yOLZ7ABmeZT2Zg1sMzzAehkNAI4vVHa2YygH2wY/xQtwIyw4SYGmswNOAewAAAAAAAAAAAAAAAS3GrDmXWvHyx+XTuNRz7jWn0B8+BnmAAEAcHqJZES3iA9R2wRHY9zwQecsnuruvJPBBTb6MK8DuQkt9GFeB3PqaPoA0AAAAAAAAAAAAAAJLjUQXGHVVjRVFNU5wuuKapxeyM3z+FXx2KvYEXw8TyVex8PE8lXsujCq8lXs34c+SfYEXwsTLuVexGFiZ9ypdsTl3fszYnyyCOMPEz7lXs2MOuP4VK9ifLJsT4VAl2MXyVZej1FGJl20T7PvsT4S9bM5cJSCbYr8lTJorynKipVEVeDcp8CDxgRVGFGecLMDThNs1TwiVGDExRGeaj6AAAAAAAAAAAAAAAAGQAZGQAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAn3jZ83b9SAUCfeNnzdv1IN42fN2/UgFAn3jZ83b9SDeNnzdv1IBQJ942fN2/Ug3jZ83b9SAUCfeNnzdv1IN42fN2/UgFAn3jZ83b9SDeNnzdv1IBQJ942fN2/Ug3jZ83b9SAUCfeNnzdv1IN42fN2/UgFAn3jZ83b9SDeNnzdv1IBQJ942fN2/Ug3jZ83b9SAUCfeNnzdv1IN42fN2/UgFAn3jZ83b9SDeNnzdv1IBQJ942fN2/Ug3jZ83b9SAUCfeNnzdv1IfbDxKMWiK8OumumeFVM5xIPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/2Q==' },
          'STH9222': { w: 226, h: 206, src: 'data:image/jpeg;base64,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' },
        };

const STELLA_LED = [
            ['STH9035',  'AR70 PRO 7°',                320, 4.8],
            ['STH7264',  'BIPINO G9',                  280, 3],
            ['STH8264E', 'MR16 ECO',                   380, 4.8],
            ['STH6233',  'PAR20 ECO DIM',              480, 6],
            ['STH9001',  'PAINEL EMBUTIR ECO 6W',      480, 6],
            ['STH8264',  'MR16 EVO',                   550, 6.5],
            ['STH8434',  'AR111 PRO',                  950, 11],
            ['STH9740',  'DEEP embutido recuado',     1000, 12],
            ['STH9003',  'PAINEL EMBUTIR ECO 18W',    1440, 18],
            ['STH9760',  'EDGE embutido backlight',   1500, 18],
            ['STH9005',  'PAINEL EMBUTIR ECO 24W',    1920, 24],
            ['STH9220',  'PAINEL EMBUTIR EVO UGR19',  2400, 24],
            ['STH9222',  'PAINEL EMBUTIR EVO UGR19',  3600, 36],
        ];

function lcSugerirStella(phiPorLuminaria) {
            // escolhe a MENOR luminária cujo fluxo cobre phiPorLuminaria (arredondamento p/ cima)
            // Se nenhuma cobrir, usa a de maior fluxo do catálogo.
            const ordenadas = [...STELLA_LED].sort((a, b) => a[2] - b[2]);
            let best = ordenadas.find(l => l[2] >= phiPorLuminaria) || ordenadas[ordenadas.length - 1];
            return { codigo: best[0], desc: best[1], flux: best[2], pot: best[3] };
        }

function lcOnTipoChange() {
            const sel = document.getElementById('lc-tipo');
            const [, lux] = sel.value.split('|');
            if (lux !== '0') document.getElementById('lc-lux').value = lux;
            document.getElementById('lc-lux').readOnly = (lux !== '0' && false);
        }

function lcOnModoAreaChange() {
            const modo = document.getElementById('lc-modo-area').value;
            document.getElementById('lc-grp-comp').style.display = modo === 'dim'  ? '' : 'none';
            document.getElementById('lc-grp-larg').style.display = modo === 'dim'  ? '' : 'none';
            document.getElementById('lc-grp-area').style.display = modo === 'area' ? '' : 'none';
        }

function lcOnModoNChange() {
            const modo = document.getElementById('lc-modo-N').value;
            const isModelo = (modo === 'modelo');
            document.getElementById('lc-grp-N').style.display = (modo === 'manual' || isModelo) ? '' : 'none';
            const gFlux = document.getElementById('lc-grp-flux');
            const gPot  = document.getElementById('lc-grp-pot');
            if (gFlux) gFlux.style.display = isModelo ? 'none' : '';
            if (gPot)  gPot.style.display  = isModelo ? 'none' : '';
            const sel = document.getElementById('lc-lumin');
            if (sel) {
                if (isModelo) { sel.value = 'auto'; sel.disabled = true; }
                else { sel.disabled = false; }
            }
        }

function lcFmt(v, dec=2) { return Number(v).toFixed(dec).replace('.', ','); }

function lcAddComodo() {
            const nome    = (document.getElementById('lc-nome').value || 'Cômodo').trim();
            const tipoTxt = document.getElementById('lc-tipo').options[document.getElementById('lc-tipo').selectedIndex].text;
            const E       = parseFloat(document.getElementById('lc-lux').value) || 0;
            const modoA   = document.getElementById('lc-modo-area').value;
            const C       = parseFloat(document.getElementById('lc-comp').value) || 0;
            const L       = parseFloat(document.getElementById('lc-larg').value) || 0;
            const Aman    = parseFloat(document.getElementById('lc-area').value) || 0;
            const pd      = parseFloat(document.getElementById('lc-pd').value)   || 2.8;
            const escuro  = parseFloat(document.getElementById('lc-escuro').value) || 0;
            const modoN   = document.getElementById('lc-modo-N').value;
            const flux    = parseFloat(document.getElementById('lc-flux').value) || 0;
            const pot     = parseFloat(document.getElementById('lc-pot').value)  || 0;
            const Nman    = parseInt(document.getElementById('lc-N').value, 10)  || 0;
            const tempCor = document.getElementById('lc-temp').value;
            const luminSel = document.getElementById('lc-lumin').value;

            const A = modoA === 'dim' ? (C * L) : Aman;
            if (A <= 0)    { alert('Informe dimensões ou área válida.'); return; }
            if (E <= 0)    { alert('Iluminância (lux) inválida.'); return; }

            // Se usuário escolheu modelo Stella específico, usa seus dados; se "auto", calculamos depois.
            let fluxUsado = flux, potUsada = pot, luminariaInfo = null;
            if (luminSel !== 'auto' && luminSel !== 'custom') {
                const parts = luminSel.split('|').map(s => s.trim());
                const fm = parseFloat(parts[2]); const pm = parseFloat(parts[3]);
                if (fm > 0) fluxUsado = fm;
                if (pm > 0) potUsada = pm;
                luminariaInfo = `${parts[0]} — ${parts[1]}`;
            }
            if (modoN !== 'modelo' && fluxUsado <= 0) { alert('Informe o fluxo luminoso da lâmpada (lm) ou escolha um modelo Stella.'); return; }

            // Passo 3: Φtotal = A × E   (+20% se cores escuras)
            const phiBase = A * E;
            const phiTotal = phiBase * (1 + escuro);

            // Passo 4: N = Φtotal / Φlâmpada
            const N_norma_real = phiTotal / fluxUsado;
            const N_norma      = Math.max(1, Math.ceil(N_norma_real));
            const N_usado      = (modoN === 'manual' || modoN === 'modelo') ? Math.max(1, Nman) : N_norma;

            // Sugestão automática Stella: escolhe a luminária Φ ~ Φtotal/N
            // No modo "modelo" sempre sugere do catálogo Stella, mesmo que o usuário tenha deixado outro valor.
            if (luminSel === 'auto' || modoN === 'modelo') {
                const phiAlvo = phiTotal / N_usado;
                const s = lcSugerirStella(phiAlvo);
                fluxUsado = s.flux; potUsada = s.pot;
                luminariaInfo = `${s.codigo} — ${s.desc} (LED Stella, sugerido para N=${N_usado} • Φ≈${Math.round(phiAlvo)} lm/lum.)`;
            } else if (luminSel === 'custom') {
                luminariaInfo = 'Lâmpada genérica (Φ/Pot. informados)';
            }

            // Iluminância efetiva real com N adotado (sem fator de correção)
            const E_real = (N_usado * fluxUsado) / A;

            const P_total = N_usado * potUsada;
            const pdAlerta = pd > 3.0;

            LC_COMODOS.push({
                nome, tipoTxt, A, E, escuro, pd, pdAlerta,
                C: modoA === 'dim' ? C : null,
                L: modoA === 'dim' ? L : null,
                flux: fluxUsado, pot: potUsada, phiBase, phiTotal,
                N_norma_real, N_norma, N_usado, E_real, P_total,
                modoN, tempCor, luminariaInfo
            });

            lcRender();
        }

function lcRemoveComodo(i) {
            LC_COMODOS.splice(i, 1);
            lcRender();
        }

function lcClearAll() {
            if (LC_COMODOS.length && !confirm('Remover todos os cômodos?')) return;
            LC_COMODOS.length = 0;
            lcRender();
        }

function lcUpdateN(i, val) {
            const c = LC_COMODOS[i];
            if (!c) return;
            const n = Math.max(1, parseInt(val, 10) || 1);
            c.N_usado = n;
            c.P_total = n * (c.pot || 0);
            c.E_real  = (n * (c.flux || 0)) / (c.A || 1);
            c.modoN   = 'manual';
            lcRender();
        }

// ─── IMPORTAR XLSX (múltiplos cômodos) ─────────────────────────────
function lcImportXLSX(ev) {
            const file = ev.target.files && ev.target.files[0];
            ev.target.value = '';
            if (!file) return;
            if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
                    // Localiza linha de cabeçalho
                    let hIdx = -1;
                    for (let i = 0; i < rows.length; i++) {
                        const r = (rows[i] || []).map(x => String(x ?? '').toLowerCase());
                        if (r.some(c => c.includes('nome do cômodo') || c.includes('nome do comodo')) &&
                            r.some(c => c.includes('área') || c.includes('area'))) { hIdx = i; break; }
                    }
                    if (hIdx < 0) { alert('Não encontrei cabeçalho com "Nome do Cômodo" e "Área".'); return; }
                    const header = rows[hIdx].map(x => String(x ?? '').toLowerCase().trim());
                    const col = (re) => header.findIndex(h => re.test(h));
                    const idx = {
                        nome:  col(/nome/),
                        tipo:  col(/tipo/),
                        area:  col(/área|area/),
                        lux:   col(/lux/),
                        flux:  col(/fluxo|lúmens|lumens/),
                        qtd:   col(/qtd|quantidade|nº|numero/),
                        pot:   col(/potência\/lumin|potencia\/lumin|pot.*\(w\)/),
                    };
                    if (idx.nome < 0 || idx.area < 0) { alert('Colunas obrigatórias ausentes (Nome / Área).'); return; }
                    let added = 0, skipped = 0;
                    for (let i = hIdx + 1; i < rows.length; i++) {
                        const r = rows[i] || [];
                        const nome = String(r[idx.nome] ?? '').trim();
                        if (!nome || /^total/i.test(nome)) continue;
                        const A    = parseFloat(r[idx.area]) || 0;
                        const E    = idx.lux  >= 0 ? (parseFloat(r[idx.lux])  || 0) : 0;
                        const flux = idx.flux >= 0 ? (parseFloat(r[idx.flux]) || 0) : 0;
                        const pot  = idx.pot  >= 0 ? (parseFloat(r[idx.pot])  || 0) : 0;
                        const tipoTxt = idx.tipo >= 0 ? String(r[idx.tipo] ?? '').trim() : '';
                        const Nxls = idx.qtd  >= 0 ? (parseInt(r[idx.qtd], 10) || 0) : 0;
                        if (A <= 0 || E <= 0) { skipped++; continue; }
                        const phiBase  = A * E;
                        const phiTotal = phiBase;
                        // Escolha automática da lâmpada do catálogo Stella
                        const fluxHint = flux > 0 ? flux : 600;
                        const N_hint   = Math.max(1, Math.ceil(phiTotal / fluxHint));
                        const N_usado  = Nxls > 0 ? Nxls : N_hint;
                        const sugest   = lcSugerirStella(phiTotal / N_usado);
                        const fluxFinal = sugest.flux;
                        const potFinal  = sugest.pot;
                        const N_norma_real = phiTotal / fluxFinal;
                        const N_norma  = Math.max(1, Math.ceil(N_norma_real));
                        LC_COMODOS.push({
                            nome, tipoTxt: tipoTxt || '—', A, E, escuro: 0, pd: 2.8, pdAlerta: false,
                            C: null, L: null,
                            flux: fluxFinal, pot: potFinal, phiBase, phiTotal,
                            N_norma_real, N_norma, N_usado,
                            E_real: (N_usado * fluxFinal) / A,
                            P_total: N_usado * potFinal,
                            modoN: 'norma',
                            tempCor: '3000K — Branco quente confort',
                            luminariaInfo: sugest.codigo + ' — ' + sugest.desc + ' (LED Stella, ' + sugest.flux + ' lm / ' + sugest.pot + ' W)'
                        });
                        added++;
                    }
                    lcRender();
                    alert(`Importação concluída: ${added} cômodo(s) adicionado(s).${skipped ? ' ' + skipped + ' linha(s) ignorada(s) por falta de dados.' : ''}\nVocê pode ajustar a quantidade de lâmpadas na coluna N e exportar o PDF.`);
                } catch (err) {
                    console.error(err);
                    alert('Erro ao ler planilha: ' + (err.message || err));
                }
            };
            reader.readAsArrayBuffer(file);
        }

function lcRender() {
            const tbody  = document.getElementById('lc-tbody');
            const vazia  = document.getElementById('lc-lista-vazia');
            const lista  = document.getElementById('lc-lista');
            const detail = document.getElementById('lc-detail');

            if (!LC_COMODOS.length) {
                tbody.innerHTML = '';
                vazia.style.display = '';
                lista.style.display = 'none';
                detail.innerHTML = '';
                return;
            }
            vazia.style.display = 'none';
            lista.style.display = '';

            let totA = 0, totPhi = 0, totN = 0, totP = 0;
            tbody.innerHTML = LC_COMODOS.map((c, i) => {
                totA   += c.A;
                totPhi += c.phiTotal;
                totN   += c.N_usado;
                totP   += c.P_total;
                const modoLabel = c.modoN === 'manual'
                    ? `<span title="Quantidade informada pelo usuário" style="background:var(--accent3);color:var(--on-accent);padding:.15rem .45rem;border-radius:6px;font-size:.72rem">Manual</span>`
                    : `<span title="Calculado pela norma" style="background:var(--warn);color:var(--on-accent);padding:.15rem .45rem;border-radius:6px;font-size:.72rem">Norma</span>`;
                const alertaPd = c.pdAlerta
                    ? ` <span title="Pé-direito > 3,0 m: considerar luminárias pendentes ou superdimensionar Φ" style="color:#dc2626"><i data-eo-icon=triangle-alert></i></span>`
                    : '';
                const alertaEsc = c.escuro > 0
                    ? ` <span title="Acréscimo de 20% por cores escuras" style="color:var(--accent3)">(+20%)</span>`
                    : '';
                return `
                    <tr style="border-bottom:1px solid var(--border)">
                        <td style="padding:.5rem"><strong>${c.nome}</strong>${alertaPd}${alertaEsc}<br><span style="font-size:.72rem;color:var(--text-dim)">${c.tipoTxt}</span></td>
                        <td style="padding:.5rem;text-align:right">${lcFmt(c.A,2)}</td>
                        <td style="padding:.5rem;text-align:right">${c.E}</td>
                        <td style="padding:.5rem;text-align:right">${lcFmt(c.phiTotal,0)}</td>
                        <td style="padding:.5rem;text-align:right">${lcFmt(c.flux,0)}</td>
                        <td style="padding:.5rem;text-align:center">
                            <input type="number" min="1" step="1" value="${c.N_usado}" onchange="lcUpdateN(${i}, this.value)"
                                style="width:64px;text-align:center;font-weight:700;color:#f59e0b;font-size:1rem;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:.25rem">
                        </td>
                        <td style="padding:.5rem;text-align:right" id="lc-row-pot-${i}">${lcFmt(c.P_total,1)}</td>
                        <td style="padding:.5rem;text-align:center">${modoLabel}</td>
                        <td style="padding:.5rem;text-align:center"><button type="button" class="btn btn-danger-outline eo-row-remove" onclick="lcRemoveComodo(${i})" title="Remover cômodo" aria-label="Remover cômodo" data-eo-action="predial:remove-comodo-luminotecnica"><i data-eo-icon=trash-2></i></button></td>
                    </tr>
                `;
            }).join('');

            document.getElementById('lc-tot-A').textContent   = lcFmt(totA, 2);
            document.getElementById('lc-tot-phi').textContent = lcFmt(totPhi, 0);
            document.getElementById('lc-tot-N').textContent   = totN;
            document.getElementById('lc-tot-P').textContent   = lcFmt(totP, 1);

            // Detalhamento do último cômodo
            const c = LC_COMODOS[LC_COMODOS.length - 1];
            const corrTxt = c.escuro > 0
                ? ` × (1 + 0,20) = <strong>${lcFmt(c.phiTotal,0)} lm</strong> (acréscimo de 20% por cores escuras)`
                : ` = <strong>${lcFmt(c.phiTotal,0)} lm</strong>`;
            const usoNota = c.modoN === 'manual'
                ? `Você informou <strong>${c.N_usado}</strong> luminária(s). A norma recomendaria ${c.N_norma}.`
                : `Adotado <strong>${c.N_usado}</strong> luminária(s) — arredondado para cima de ${lcFmt(c.N_norma_real,2)}.`;
            const pdNota = c.pdAlerta
                ? `<br><i data-eo-icon=triangle-alert></i> <strong>Pé-direito ${lcFmt(c.pd,2)} m > 3,0 m:</strong> considere luminárias pendentes ou superdimensione o fluxo luminoso.`
                : '';
            detail.innerHTML = `
                <div class="theory" style="background:var(--surface2);border-left:3px solid #f59e0b;padding:.8rem 1rem;border-radius:6px;font-size:.85rem;line-height:1.6">
                    <strong>Memória de cálculo — ${c.nome}</strong> (Método dos Lúmens — NBR ISO/CIE 8995-1)<br>
                    <strong>Passo 1 — Área:</strong> A = ${c.C !== null ? `${lcFmt(c.L,2)} × ${lcFmt(c.C,2)}` : 'área informada'} = <strong>${lcFmt(c.A,2)} m²</strong><br>
                    <strong>Passo 2 — Iluminância (Tabela 1):</strong> E = <strong>${c.E} lux</strong> (${c.tipoTxt})<br>
                    <strong>Passo 3 — Fluxo total:</strong> Φ<sub>total</sub> = A × E = ${lcFmt(c.A,2)} × ${c.E} = ${lcFmt(c.phiBase,0)} lm${corrTxt}<br>
                    <strong>Passo 4 — Nº de lâmpadas:</strong> N = Φ<sub>total</sub> / Φ<sub>lâmpada</sub> = ${lcFmt(c.phiTotal,0)} / ${lcFmt(c.flux,0)} = <strong>${lcFmt(c.N_norma_real,2)}</strong> → ${c.N_norma} (norma)<br>
                    ${usoNota}
                    ${pdNota}
                </div>
            `;
        }

function lcExportXLSX() {
            if (!LC_COMODOS.length) { alert('Adicione ao menos um cômodo.'); return; }
            if (typeof XLSX === 'undefined') { alert('Biblioteca XLSX não carregada.'); return; }
            const header = ['Cômodo','Tipo','Área (m²)','E (lux)','Φ lâmpada (lm)','Φ total (lm)','N (norma)','N (adotado)','Modo','Pot. unit. (W)','Pot. total (W)','Pé-direito (m)','Cores escuras'];
            const rows = LC_COMODOS.map(c => [
                c.nome, c.tipoTxt, +c.A.toFixed(2), c.E, c.flux, Math.round(c.phiTotal),
                c.N_norma, c.N_usado, c.modoN === 'manual' ? 'Manual' : 'Norma',
                c.pot, +c.P_total.toFixed(1), c.pd, c.escuro > 0 ? 'Sim (+20%)' : 'Não'
            ]);
            const totA = LC_COMODOS.reduce((s,c)=>s+c.A,0);
            const totPhi = LC_COMODOS.reduce((s,c)=>s+c.phiTotal,0);
            const totN = LC_COMODOS.reduce((s,c)=>s+c.N_usado,0);
            const totP = LC_COMODOS.reduce((s,c)=>s+c.P_total,0);
            rows.push(['TOTAL','', +totA.toFixed(2),'','', Math.round(totPhi),'', totN,'','', +totP.toFixed(1),'','']);
            const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Luminotécnica');
            XLSX.writeFile(wb, 'calculo_luminotecnico_comodos.xlsx');
        }

// ─── LUMINOTÉCNICA — EXPORTAR PDF (Modelo Luminotécnico) ─────────────
async function lcExportPDF() {
            const license = await EOLicense.requireUser();
            if (!license) return;
            if (!LC_COMODOS.length) { alert('Adicione ao menos um cômodo antes de exportar.'); return; }

            if (!window.jspdf || !window.jspdf.jsPDF) {
                try { await EO.load('jspdf'); }
                catch (e) { alert('Não foi possível carregar a biblioteca de PDF (jsPDF). Verifique a instalação offline ou a conexão e tente novamente.'); return; }
            }

            const { jsPDF } = window.jspdf;
            try { if (window.__ensureUnicodePdfFont) await window.__ensureUnicodePdfFont(); } catch(e) { console.warn("Font preload falhou:", e); }
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // ── Tema "Em Branco" (igual ao PDF branco de Múltiplos Circuitos):
            // fundo totalmente branco, texto e linhas pretos. Sobrescreve todas
            // as chamadas de cor para neutralizar a paleta colorida abaixo.
            const _fill = doc.setFillColor.bind(doc);
            const _text = doc.setTextColor.bind(doc);
            const _draw = doc.setDrawColor.bind(doc);
            doc.setFillColor = function () { return _fill(255, 255, 255); };
            doc.setTextColor = function () { return _text(0, 0, 0); };
            doc.setDrawColor = function () { return _draw(0, 0, 0); };

            // Substitui caracteres fora do latin-1 para garantir renderização correta
            function safe(str) {
                return String(str)
                    .replace(/\u00a0/g, ' ')
                    .replace(/[\u2705\u26a0\ufe0f\u2728\u2139\u274c\u2611\u2610\u2713\u2717]/g, '');
            }

            const W  = 210;
            const mX = 20;
            const cW = W - mX * 2;
            let y    = 0;

            // Paleta simples (similar ao PDF modelo)
            const ESCURO  = [15,  23,  42];
            const AMARELO = [245, 158, 11];
            const AZUL    = [30,  64, 175];
            const VERDE   = [5,  150, 105];
            const LARANJA = [220,  80,  10];
            const BRANCO  = [255, 255, 255];
            const CINZA   = [100, 116, 139];
            const CINZA_L = [226, 232, 240];
            const BG_CARD = [248, 250, 252];

            // ── Utilitários ─────────────────────────────────────────────────
            function salto(needed) {
                if (y + needed > 280) {
                    rodape();
                    doc.addPage();
                    cabecalhoPagina();
                }
            }

            function wrap(txt, x, startY, maxW, lh) {
                const linhas = doc.splitTextToSize(safe(txt), maxW);
                linhas.forEach((l, i) => doc.text(l, x, startY + i * lh));
                return startY + linhas.length * lh;
            }

            function hr(yy, espessura, cor) {
                doc.setDrawColor(...(cor || CINZA_L));
                doc.setLineWidth(espessura || 0.3);
                doc.line(mX, yy, W - mX, yy);
            }

            // ── Cabeçalho primeira página ────────────────────────────────────
            // Lê dados do projeto e opções do usuário
            var lcAluno   = (document.getElementById('lc-aluno') && document.getElementById('lc-aluno').value || '').trim();
            var lcObra    = (document.getElementById('lc-obra')  && document.getElementById('lc-obra').value  || '').trim();
            var lcProf    = (document.getElementById('lc-prof')  && document.getElementById('lc-prof').value  || '').trim();
            var lcData    = (document.getElementById('lc-data')  && document.getElementById('lc-data').value  || '').trim();
            var lcIsProj  = !!(document.getElementById('lc-projetista-toggle') && document.getElementById('lc-projetista-toggle').checked);
            var lcInclProf= !!(document.getElementById('lc-prof-toggle') && document.getElementById('lc-prof-toggle').checked);
            var inclTitulo   = !document.getElementById('lc-incluir-titulo')   || document.getElementById('lc-incluir-titulo').checked;
            var inclCreditos = !document.getElementById('lc-incluir-creditos') || document.getElementById('lc-incluir-creditos').checked;

            function cabecalhoPrincipal() {
                if (!inclTitulo) { cabecalhoPagina(); return; }
                doc.setFillColor(...ESCURO);
                doc.rect(0, 0, W, 36, 'F');
                doc.setFillColor(...AMARELO);
                doc.rect(0, 34, W, 2, 'F');

                doc.setTextColor(...BRANCO);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text(safe('Calculo de Luminotecnica Residencial pelo'), W / 2, 13, { align: 'center' });
                doc.text(safe('Metodo dos Lumens'), W / 2, 22, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(180, 190, 210);
                doc.text('Fundamentado na norma tecnica NBR ISO/CIE 8995-1', W / 2, 29, { align: 'center' });

                y = 44;
            }

            // ── Cabeçalho páginas 2+ ─────────────────────────────────────────
            function cabecalhoPagina() {
                doc.setFillColor(...ESCURO);
                doc.rect(0, 0, W, 14, 'F');
                doc.setFillColor(...AMARELO);
                doc.rect(0, 13, W, 1.5, 'F');

                doc.setTextColor(...BRANCO);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text(safe('Calculo de Luminotecnica - Metodo dos Lumens'), mX, 9);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(180, 190, 210);
                doc.text('NBR ISO/CIE 8995-1', W - mX, 9, { align: 'right' });
                y = 20;
            }

            // ── Rodapé ──────────────────────────────────────────────────────
            function rodape() {
                const pg = doc.getNumberOfPages();
                doc.setFillColor(...CINZA_L);
                doc.rect(0, 286, W, 11, 'F');
                doc.setFillColor(...AMARELO);
                doc.rect(0, 286, W, 0.7, 'F');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(...CINZA);
                if (inclCreditos) {
                    doc.text('Catalogo Stella LED 2023/2024  |  Metodo dos Lumens  |  NBR ISO/CIE 8995-1', mX, 292);
                }
                doc.text('Pagina ' + pg, W - mX, 292, { align: 'right' });
            }

            // ── Título de passo (fundo escuro, texto branco) ─────────────────
            function tituloStep(label) {
                salto(13);
                doc.setFillColor(...ESCURO);
                doc.roundedRect(mX, y, cW, 10, 2, 2, 'F');
                doc.setTextColor(...BRANCO);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9.5);
                doc.text(safe(label), mX + 5, y + 7);
                y += 13;
            }

            // ── Caixa de dados (borda esquerda amarela, linhas label/valor) ──
            function caixaDados(linhas) {
                const lh = 6.2, pad = 4;
                const h = pad * 2 + linhas.length * lh;
                salto(h + 3);

                doc.setFillColor(...BG_CARD);
                doc.roundedRect(mX, y, cW, h, 2, 2, 'F');
                doc.setDrawColor(...CINZA_L);
                doc.setLineWidth(0.3);
                doc.roundedRect(mX, y, cW, h, 2, 2, 'S');
                doc.setFillColor(...AMARELO);
                doc.rect(mX, y, 3, h, 'F');

                let ly = y + pad + lh - 1.5;
                linhas.forEach(function(row) {
                    var lbl  = row[0];
                    var val  = row[1];
                    var cor  = row[2] || ESCURO;
                    var dest = row[3] || false; // destaque negrito no valor

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(...CINZA);
                    doc.text(safe(lbl), mX + 7, ly);

                    doc.setFont('helvetica', dest ? 'bold' : 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(...cor);
                    doc.text(safe(String(val)), W - mX - 4, ly, { align: 'right' });

                    doc.setDrawColor(...CINZA_L);
                    doc.setLineWidth(0.15);
                    doc.line(mX + 7, ly + 1.5, W - mX - 4, ly + 1.5);
                    ly += lh;
                });
                y += h + 4;
            }

            // ── Caixa da Lampada LED ─────────────────────────────────────────
            function caixaLampada(c) {
                var lum = safe(c.luminariaInfo || 'Lampada generica');
                var ef  = c.pot > 0 ? Math.round(c.flux / c.pot) + ' lm/W' : '-';

                var linhas = [
                    ['Modelo / Referencia (Stella LED):', lum,                             AZUL,   true],
                    ['Fluxo luminoso unitario:',          lcFmt(c.flux, 0) + ' lm',       VERDE,  true],
                    ['Potencia unitaria:',                lcFmt(c.pot,  1) + ' W',        ESCURO, false],
                    ['Potencia total instalada:',         lcFmt(c.P_total, 1) + ' W',     LARANJA,true],
                    ['Temperatura de cor:',               safe(c.tempCor || '3000K'),      ESCURO, false],
                    ['Eficiencia luminosa estimada:',     ef,                              VERDE,  false],
                ];

                var lh = 6.2, pad = 4, hdrH = 10;
                var h  = hdrH + pad + linhas.length * lh + pad;
                salto(h + 3);

                // Fundo azul claro
                doc.setFillColor(237, 244, 255);
                doc.roundedRect(mX, y, cW, h, 2, 2, 'F');
                doc.setDrawColor(...AZUL);
                doc.setLineWidth(0.3);
                doc.roundedRect(mX, y, cW, h, 2, 2, 'S');

                // Header azul
                doc.setFillColor(...AZUL);
                doc.roundedRect(mX, y, cW, hdrH, 2, 2, 'F');
                doc.rect(mX, y + hdrH - 2, cW, 2, 'F');

                doc.setTextColor(...BRANCO);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.text('Informacoes da Lampada LED Selecionada', mX + 5, y + 7);

                var ly = y + hdrH + pad + lh - 1.5;
                linhas.forEach(function(row) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(...CINZA);
                    doc.text(safe(row[0]), mX + 5, ly);

                    doc.setFont('helvetica', row[3] ? 'bold' : 'normal');
                    doc.setTextColor(...(row[2] || ESCURO));
                    doc.text(safe(String(row[1])), W - mX - 4, ly, { align: 'right' });

                    doc.setDrawColor(...CINZA_L);
                    doc.setLineWidth(0.15);
                    doc.line(mX + 5, ly + 1.5, W - mX - 4, ly + 1.5);
                    ly += lh;
                });
                y += h + 4;
            }

            // ══════════════════════════════════════════════════════════════════
            // INÍCIO DO DOCUMENTO
            // ══════════════════════════════════════════════════════════════════
            cabecalhoPrincipal();

            // ── Dados do Projeto ─────────────────────────────────────────────
            (function projetoBox() {
                var tituloAluno = lcIsProj ? 'Projetista' : 'Aluno';
                var linhas = [
                    [tituloAluno + ':',        lcAluno || '-'],
                    ['Projeto / Obra:',        lcObra  || '-'],
                ];
                if (lcInclProf) linhas.push(['Professor:', lcProf || '-']);
                linhas.push(['Data:', lcData || '-']);

                var lh = 6, pad = 4, hdrH = 9;
                var h = hdrH + pad + linhas.length * lh + pad;
                salto(h + 4);
                doc.setFillColor(...BG_CARD);
                doc.roundedRect(mX, y, cW, h, 2, 2, 'F');
                doc.setDrawColor(...CINZA_L);
                doc.setLineWidth(0.3);
                doc.roundedRect(mX, y, cW, h, 2, 2, 'S');
                doc.setFillColor(...VERDE);
                doc.rect(mX, y, 3, h, 'F');
                doc.setFillColor(...ESCURO);
                doc.roundedRect(mX + 3, y, cW - 3, hdrH, 2, 2, 'F');
                doc.rect(mX + 3, y + hdrH - 2, cW - 3, 2, 'F');
                doc.setTextColor(...BRANCO);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text('Dados do Projeto', mX + 7, y + 6.3);
                var ly = y + hdrH + pad + lh - 1.5;
                linhas.forEach(function(row) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(...CINZA);
                    doc.text(safe(row[0]), mX + 7, ly);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...ESCURO);
                    doc.text(safe(row[1]), W - mX - 4, ly, { align: 'right' });
                    ly += lh;
                });
                y += h + 5;
            })();

            // Parágrafo introdutório
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...ESCURO);
            var intro = 'Para calcular o numero ideal de lampadas para cada comodo de forma eficiente e normalizada, ' +
                'utiliza-se o Metodo dos Lumens, fundamentado na norma NBR ISO/CIE 8995-1. ' +
                'Diferente do dimensionamento empirico baseado unicamente na potencia consumida (Watts), ' +
                'este metodo considera o fluxo luminoso real emitido pelas lampadas (medido em Lumens) e o nivel ' +
                'de iluminancia exigido na superficie de trabalho (medido em Lux).';
            y = wrap(intro, mX, y, cW, 5.5) + 6;

            // ══════════════════════════════════════════════════════════════════
            // BLOCO POR COMODO
            // ══════════════════════════════════════════════════════════════════
            LC_COMODOS.forEach(function(c, idx) {

                salto(20);

                // Título do ambiente
                doc.setFillColor(...AMARELO);
                doc.roundedRect(mX, y, cW, 11, 2, 2, 'F');
                doc.setTextColor(...ESCURO);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(safe('Ambiente ' + (idx + 1) + ': ' + c.nome), mX + 5, y + 7.8);
                y += 14;

                // ── Passo 1: Area ────────────────────────────────────────────
                tituloStep('Passo 1:  Calculo da Area do Comodo');

                var fArea = (c.C !== null && c.L !== null)
                    ? 'A = L x C = ' + lcFmt(c.L, 2) + ' m x ' + lcFmt(c.C, 2) + ' m = ' + lcFmt(c.A, 2) + ' m2'
                    : 'A = ' + lcFmt(c.A, 2) + ' m2  (area informada diretamente)';

                caixaDados([
                    ['Formula (Eq. 1.1):',   'A = L x C',               CINZA,  false],
                    ['Calculo aplicado:',     fArea,                     AZUL,   true],
                    ['Area do comodo (A):',   lcFmt(c.A, 2) + ' m2',    VERDE,  true],
                ]);

                // ── Passo 2: Iluminancia ─────────────────────────────────────
                tituloStep('Passo 2:  Verificacao da Iluminancia Recomendada (Lux)');

                caixaDados([
                    ['Tipo de ambiente:',              safe(c.tipoTxt || c.nome),  ESCURO, false],
                    ['Iluminancia recomendada (E):',   c.E + ' lux',               AZUL,   true],
                ]);

                // ── Passo 3: Fluxo luminoso ──────────────────────────────────
                tituloStep('Passo 3:  Calculo do Fluxo Luminoso Total Necessario');

                var fPhi = 'Ftotal = A x E = ' + lcFmt(c.A, 2) + ' x ' + c.E + ' = ' + lcFmt(c.phiTotal, 0) + ' lm';

                caixaDados([
                    ['Formula (Eq. 3.1):',              'Ftotal = A x E',                      CINZA,  false],
                    ['Calculo:',                         fPhi,                                  AZUL,   true],
                    ['Fluxo luminoso total (Ftotal):',   lcFmt(c.phiTotal, 0) + ' lm',         VERDE,  true],
                ]);

                // ── Passo 4: Numero de lampadas ──────────────────────────────
                tituloStep('Passo 4:  Determinacao da Quantidade de Lampadas');

                var fN = 'N = Ftotal / Flampada = ' + lcFmt(c.phiTotal, 0) + ' / ' + lcFmt(c.flux, 0) + ' = ' + lcFmt(c.N_norma_real, 2) + '  ->  adotado: ' + c.N_usado;

                var eReal = ((c.N_usado * c.flux) / c.A).toFixed(0);
                var corEReal = parseFloat(eReal) >= c.E * 0.9 ? VERDE : LARANJA;

                caixaDados([
                    ['Formula (Eq. 4.1):',              'N = Ftotal / Flampada',              CINZA,  false],
                    ['Calculo:',                         fN,                                   AZUL,   true],
                    ['Quantidade adotada (N):',          c.N_usado + ' luminaria(s)',          VERDE,  true],
                    ['Iluminancia efetiva resultante:',  eReal + ' lux',                       corEReal,true],
                ]);

                // ── Caixa da lampada LED ─────────────────────────────────────
                caixaLampada(c);

                // Alerta pe-direito
                if (c.pdAlerta) {
                    salto(14);
                    doc.setFillColor(255, 237, 213);
                    doc.roundedRect(mX, y, cW, 12, 2, 2, 'F');
                    doc.setFillColor(...LARANJA);
                    doc.rect(mX, y, 3, 12, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8);
                    doc.setTextColor(...LARANJA);
                    doc.text(safe('Atencao - Pe-direito ' + lcFmt(c.pd, 2) + ' m > 3,0 m: considerar luminarias pendentes ou superdimensionamento do fluxo.'), mX + 6, y + 7.5);
                    y += 15;
                }

                y += 3;
                hr(y - 1, 0.4, CINZA_L);
                y += 2;
            });

            // ══════════════════════════════════════════════════════════════════
            // CONSIDERACOES FINAIS
            // ══════════════════════════════════════════════════════════════════
            salto(50);
            doc.setFillColor(...ESCURO);
            doc.roundedRect(mX, y, cW, 10, 2, 2, 'F');
            doc.setTextColor(...AMARELO);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.text('5   Consideracoes Finais', mX + 5, y + 7);
            y += 13;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...ESCURO);
            var c2 = 'Comodos cujo pe-direito exceda 3,0 metros necessitam de reavaliacao de projeto, ' +
                'sendo recomendada a aproximacao das fontes de luz ao plano de trabalho por meio de luminarias pendentes ' +
                'ou o superdimensionamento do fluxo luminoso total.';
            y = wrap(c2, mX, y, cW, 5.5) + 8;

            // ── Totais ───────────────────────────────────────────────────────
            var totalN   = LC_COMODOS.reduce(function(s,c){return s+c.N_usado;}, 0);
            var totalP   = LC_COMODOS.reduce(function(s,c){return s+c.P_total;}, 0);
            var totalPhi = LC_COMODOS.reduce(function(s,c){return s+c.phiTotal;}, 0);
            var totalA   = LC_COMODOS.reduce(function(s,c){return s+c.A;}, 0);

            salto(40);
            doc.setFillColor(...ESCURO);
            doc.roundedRect(mX, y, cW, 10, 2, 2, 'F');
            doc.setTextColor(...AMARELO);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.text('Totais do Projeto', mX + 5, y + 7);
            y += 13;

            caixaDados([
                ['Ambientes calculados:',   String(LC_COMODOS.length),         ESCURO, true],
                ['Total de luminarias:',    totalN + ' unidades',              VERDE,  true],
                ['Area total:',             lcFmt(totalA, 2) + ' m2',          AZUL,   true],
                ['Fluxo luminoso total:',   lcFmt(totalPhi, 0) + ' lm',       AZUL,   true],
                ['Potencia total:',         lcFmt(totalP, 1) + ' W',          LARANJA,true],
            ]);

            // Rodapé em todas as páginas
            var pgTotal = doc.getNumberOfPages();
            for (var i = 1; i <= pgTotal; i++) {
                doc.setPage(i);
                doc.setFillColor(...CINZA_L);
                doc.rect(0, 286, W, 11, 'F');
                doc.setFillColor(...AMARELO);
                doc.rect(0, 286, W, 0.7, 'F');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(...CINZA);
                if (inclCreditos) {
                    doc.text('Catalogo Stella LED 2023/2024  |  Metodo dos Lumens  |  NBR ISO/CIE 8995-1', mX, 292);
                }
                doc.text('Pagina ' + i + ' / ' + pgTotal, W - mX, 292, { align: 'right' });
            }

            EOLicense.pdf(doc,license);
            doc.save('luminotecnica_calculo.pdf');
        }

// ─── LUMINOTÉCNICA — EXPORTAR PDF (Modelo Idêntico ao PDF de referência) ───
        // Reproduz o layout simples do "Modelo_Luminotécnica.pdf":
        // título centralizado em negrito e sublinhado, e por ambiente:
        // "Ambiente NOME:" (itálico/negrito/sublinhado) seguido de linhas
        // com rótulos sublinhados (Lux, Área, Lúmens, Quantidade de pontos
        // de luz, Temperatura de cor, Luminária escolhida).
        // Os campos Aluno / Professor / Data / Projeto são opcionais.
async function lcExportPDFModeloSimples() {
            const license = await EOLicense.requireUser();
            if (!license) return;
            if (!LC_COMODOS.length) { alert('Adicione ao menos um cômodo antes de exportar.'); return; }

            if (!window.jspdf || !window.jspdf.jsPDF) {
                try { await EO.load('jspdf'); }
                catch (e) { alert('Não foi possível carregar a biblioteca de PDF (jsPDF). Verifique a instalação offline ou a conexão e tente novamente.'); return; }
            }

            const { jsPDF } = window.jspdf;
            try { if (window.__ensureUnicodePdfFont) await window.__ensureUnicodePdfFont(); } catch(e) { console.warn("Font preload falhou:", e); }
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            function safe(str) {
                return String(str).replace(/\u00a0/g, ' ');
            }

            const W = 210, H = 297;
            const mX = 25, mTop = 25, mBot = 25;
            let y = mTop;

            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);

            function ensure(needed) {
                if (y + needed > H - mBot) { doc.addPage(); y = mTop; }
            }

            // Escreve texto e desenha o sublinhado logo abaixo do baseline
            function drawUnderlined(text, x, yy, opts) {
                const t = safe(text);
                doc.text(t, x, yy, opts || {});
                const w = doc.getTextWidth(t);
                let x0 = x;
                if (opts && opts.align === 'center') x0 = x - w / 2;
                else if (opts && opts.align === 'right') x0 = x - w;
                const yLine = yy + 0.8;
                doc.line(x0, yLine, x0 + w, yLine);
            }

            // ── Cabeçalho (Aluno / Professor / Data / Projeto) — SEMPRE impresso ──
            const aluno = (document.getElementById('lc-aluno')?.value || '').trim();
            const obra  = (document.getElementById('lc-obra')?.value  || '').trim();
            const prof  = (document.getElementById('lc-prof')?.value  || '').trim();
            let   data  = (document.getElementById('lc-data')?.value  || '').trim();
            const isProj = !!document.getElementById('lc-projetista-toggle')?.checked;
            const inclProf = !!document.getElementById('lc-prof-toggle')?.checked;

            // Data atual como fallback (formato brasileiro)
            if (!data) {
                const d = new Date();
                data = String(d.getDate()).padStart(2,'0') + '/' +
                       String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
            }

            const headerLines = [
                [(isProj ? 'Projetista' : 'Aluno') + ':', aluno || 'Não informado'],
                ['Professor:', (inclProf ? (prof || 'Não informado') : (prof || 'Não informado'))],
                ['Data:',      data],
                ['Projeto:',   obra  || 'Não informado'],
            ];

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            headerLines.forEach(([k, v]) => {
                ensure(8);
                doc.setFont('helvetica', 'bold');
                doc.text(safe(k) + ' ', mX, y);
                const kw = doc.getTextWidth(safe(k) + ' ');
                doc.setFont('helvetica', 'normal');
                doc.text(safe(v), mX + kw, y);
                y += 7;
            });
            y += 4;

            // ── Título principal ──
            ensure(14);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            drawUnderlined('LÚMENS E LUMINÁRIAS DE CADA AMBIENTE', W / 2, y, { align: 'center' });
            y += 14;

            // ── Por ambiente ──
            const tempPorIndice = {
                '2700': '2700 K (Quente)',
                '3000': '3000 K (Quente)',
                '4000': '4000 K (Neutra)',
                '5000': '5000 K (Fria)',
                '6500': '6500 K (Fria)',
            };
            function temperaturaCor(c) {
                if (c.tempCor) {
                    const k = String(c.tempCor).trim();
                    if (tempPorIndice[k]) return tempPorIndice[k];
                    if (/k/i.test(k)) return k;
                    if (/^\d+$/.test(k)) return k + ' K';
                    return k;
                }
                // Heurística por tipo de ambiente
                const n = ((c.tipoTxt || '') + ' ' + (c.nome || '')).toLowerCase();
                if (/cozinha|banh|lavanderia|servi|escrit|garagem|área de serviço/.test(n)) return '4000 K (Neutra)';
                if (/sala|quarto|dorm|hall|corredor|jantar/.test(n)) return '3000 K (Quente)';
                return '3000 K (Quente)';
            }
            function luminariaInfoStella(c) {
                // Extrai código/descrição Stella do campo luminariaInfo, se houver
                let codigo = '', desc = '';
                if (c.luminariaInfo) {
                    const m = String(c.luminariaInfo).match(/^\s*([A-Z0-9]+)\s*[—\-–]\s*([^()]+?)(?:\s*\(|$)/);
                    if (m) { codigo = m[1].trim(); desc = m[2].trim(); }
                }
                // Tenta casar fluxo/potência com o catálogo Stella se ainda não temos descrição
                if (!codigo && typeof STELLA_LED !== 'undefined') {
                    const hit = STELLA_LED.find(l => Math.abs(l[2] - (c.flux || 0)) < 1 && Math.abs(l[3] - (c.pot || 0)) < 0.05);
                    if (hit) { codigo = hit[0]; desc = hit[1]; }
                }
                return { codigo, desc };
            }

            // Desenha um ícone vetorial representando a família da luminária Stella.
            // Cada família tem uma silhueta característica do catálogo Stella.
            // Desenha a FOTO real da luminária (recortada do catálogo Stella 2023-2024).
            // Caso o código não tenha foto cadastrada, desenha um ícone vetorial estilizado.
            // Retorna a altura ocupada em mm (para o caller avançar y).
            function drawLuminariaIcon(codigo, desc, xc, yc) {
                doc.setDrawColor(40, 40, 40);
                doc.setLineWidth(0.4);

                // Legenda do modelo
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                doc.text(safe('Modelo Stella: ' + (codigo || '—') + (desc ? ' — ' + desc : '')),
                         xc, yc - 2, { align: 'center' });
                doc.setTextColor(0, 0, 0);

                const foto = (typeof STELLA_FOTOS !== 'undefined') ? STELLA_FOTOS[(codigo || '').toUpperCase()] : null;
                if (foto) {
                    // Encaixa a foto em uma caixa máxima de 45 mm × 32 mm, mantendo proporção
                    const maxW = 45, maxH = 32;
                    const ratio = foto.w / foto.h;
                    let w = maxW, h = maxW / ratio;
                    if (h > maxH) { h = maxH; w = maxH * ratio; }
                    try {
                        doc.addImage(foto.src, 'JPEG', xc - w / 2, yc, w, h, undefined, 'FAST');
                    } catch (e) {
                        // se falhar, cai no ícone vetorial
                        return drawFallbackIcon();
                    }
                    return h;
                }
                return drawFallbackIcon();

                function drawFallbackIcon() {
                    const d = (desc || '').toUpperCase();
                    if (/PAINEL\s*EMBUTIR|PAINEL/.test(d)) {
                        doc.setFillColor(245, 245, 230);
                        doc.roundedRect(xc - 14, yc, 28, 18, 1.5, 1.5, 'FD');
                        doc.setFillColor(255, 244, 180);
                        doc.roundedRect(xc - 11, yc + 2.5, 22, 13, 1, 1, 'FD');
                        doc.setFontSize(6); doc.setFont('helvetica', 'bold');
                        doc.text('LED', xc, yc + 10.5, { align: 'center' });
                        return 20;
                    } else if (/DEEP|EDGE|EMBUTIDO|DOWNLIGHT|RECUADO|BACKLIGHT/.test(d)) {
                        doc.setFillColor(235, 235, 235); doc.circle(xc, yc + 9, 10, 'FD');
                        doc.setFillColor(255, 240, 170); doc.circle(xc, yc + 9, 7, 'FD');
                        doc.setFillColor(255, 255, 220); doc.circle(xc, yc + 9, 3.5, 'F');
                        return 20;
                    } else if (/AR111/.test(d)) {
                        doc.setFillColor(220, 220, 220); doc.circle(xc, yc + 5, 11, 'FD');
                        doc.setFillColor(255, 235, 150); doc.circle(xc, yc + 5, 8, 'FD');
                        doc.setFillColor(60, 60, 60); doc.rect(xc - 4, yc + 14, 8, 4, 'F');
                        return 20;
                    } else if (/AR70|PAR(20|30|38)?|MR16|MR11/.test(d)) {
                        doc.setFillColor(230, 230, 230);
                        doc.triangle(xc - 9, yc + 16, xc + 9, yc + 16, xc, yc + 2, 'FD');
                        doc.setFillColor(255, 240, 160);
                        doc.triangle(xc - 6, yc + 14, xc + 6, yc + 14, xc, yc + 6, 'F');
                        doc.setFillColor(80, 80, 80); doc.rect(xc - 3, yc + 16, 6, 3, 'F');
                        return 20;
                    } else if (/BIPINO|G9|G4/.test(d)) {
                        doc.setFillColor(255, 245, 200);
                        doc.roundedRect(xc - 4, yc + 2, 8, 12, 1, 1, 'FD');
                        doc.setDrawColor(40, 40, 40); doc.setLineWidth(0.5);
                        doc.line(xc - 1.5, yc + 14, xc - 1.5, yc + 17);
                        doc.line(xc + 1.5, yc + 14, xc + 1.5, yc + 17);
                        return 20;
                    } else {
                        doc.setFillColor(255, 245, 200); doc.circle(xc, yc + 7, 7, 'FD');
                        doc.setFillColor(160, 160, 160);
                        doc.rect(xc - 3, yc + 13, 6, 4, 'F');
                        doc.rect(xc - 2, yc + 17, 4, 1.5, 'F');
                        return 20;
                    }
                }
            }

            LC_COMODOS.forEach((c, idx) => {
                ensure(70);

                // "Ambiente Nome:" — itálico, negrito, sublinhado
                doc.setFont('helvetica', 'bolditalic');
                doc.setFontSize(13);
                drawUnderlined('Ambiente ' + (c.nome || ('Cômodo ' + (idx + 1))) + ':', mX, y);
                y += 9;

                doc.setFontSize(12);

                const lum = luminariaInfoStella(c);
                const lumTexto = (lum.codigo && lum.desc)
                    ? (lum.codigo + ' — ' + lum.desc + ' (LED Stella)')
                    : (c.luminariaInfo || 'LED Stella (a definir)');

                const linhas = [
                    ['Lux:',                          lcFmt(c.E, 0) + ' lx'],
                    ['Área:',                         lcFmt(c.A, 2) + ' m²'],
                    ['Lúmens:',                       lcFmt(c.phiTotal, 0) + ' lm'],
                    ['Quantidade de pontos de luz:',  String(c.N_usado) + ' un.'],
                    ['Temperatura de cor:',           temperaturaCor(c)],
                    ['Luminária escolhida:',          lumTexto],
                    ['Fluxo unitário da luminária:',  lcFmt(c.flux, 0) + ' lm'],
                    ['Potência unitária:',            lcFmt(c.pot, 1) + ' W'],
                    ['Potência total do ambiente:',   lcFmt(c.P_total, 1) + ' W  (' + c.N_usado + ' × ' + lcFmt(c.pot, 1) + ' W)'],
                ];

                linhas.forEach(([k, v]) => {
                    ensure(8);
                    doc.setFont('helvetica', 'normal');
                    drawUnderlined(k, mX, y);
                    const kw = doc.getTextWidth(safe(k));
                    doc.text(' ' + safe(v), mX + kw, y);
                    y += 7;
                });

                // Foto da luminária Stella selecionada (abaixo das informações)
                ensure(40);
                y += 3;
                const fotoH = drawLuminariaIcon(lum.codigo, lum.desc, W / 2, y) || 20;
                y += fotoH + 2;

                y += 6;
            });

            // ── Totais finais (potência e luminárias) ──
            const totN = LC_COMODOS.reduce((s, c) => s + (c.N_usado || 0), 0);
            const totP = LC_COMODOS.reduce((s, c) => s + (c.P_total || 0), 0);
            ensure(20);
            y += 2;
            doc.setFont('helvetica', 'bolditalic');
            doc.setFontSize(13);
            drawUnderlined('Totais do projeto:', mX, y);
            y += 9;
            doc.setFontSize(12);
            [
                ['Total de luminárias:', String(totN) + ' un.'],
                ['Potência total instalada:', lcFmt(totP, 1) + ' W'],
            ].forEach(([k, v]) => {
                ensure(8);
                doc.setFont('helvetica', 'normal');
                drawUnderlined(k, mX, y);
                const kw = doc.getTextWidth(safe(k));
                doc.text(' ' + safe(v), mX + kw, y);
                y += 7;
            });

            EOLicense.pdf(doc,license);
            doc.save('lumens_e_luminarias_por_ambiente.pdf');
        }

// Inicialização sub-page cômodos
(function() {
            setTimeout(() => {
                if (document.getElementById('lc-tipo')) {
                    lcOnTipoChange();
                    lcOnModoAreaChange();
                    lcOnModoNChange();
                }
            }, 250);
        })();

// ─── NBR 5410 — CÁLCULO DE CÔMODOS ──────────────────────────
function calcPredial() {
            const comp = Math.max(0.5, parseFloat(document.getElementById('pred-comp').value) || 4);
            const larg = Math.max(0.5, parseFloat(document.getElementById('pred-larg').value) || 3);
            const tipo = document.getElementById('pred-tipo').value;
            const area = comp * larg;
            const perim = 2 * (comp + larg);

            // ── Iluminação (NBR 5410 - 9.5.2.1.1) ──
            let vaIlum;
            if (area <= 6) {
                vaIlum = 100;
            } else {
                const excedente = Math.floor((area - 6) / 4);
                vaIlum = 100 + excedente * 60;
            }
            const qtdPontosLuz = Math.max(1, Math.ceil(area / 15)); // boa prática: 1 ponto a cada 15m²

            // ── Tomadas de uso geral (NBR 5410 - 9.5.2.2) ──
            let qtdTomadas, vaPorTomada, vaTotal;
            if (tipo === 'banheiro') {
                qtdTomadas = 1;
                vaPorTomada = 600;
                vaTotal = 600;
            } else if (tipo === 'cozinha') {
                // 1 tomada a cada 3,5m de perímetro, mínimo 600 VA nas 3 primeiras, 100 VA demais
                qtdTomadas = Math.max(1, Math.ceil(perim / 3.5));
                const primeiras3 = Math.min(qtdTomadas, 3) * 600;
                const restantes = Math.max(0, qtdTomadas - 3) * 100;
                vaTotal = primeiras3 + restantes;
                vaPorTomada = null; // misto
            } else if (tipo === 'varanda') {
                qtdTomadas = Math.max(1, Math.ceil(perim / 5));
                vaPorTomada = 100;
                vaTotal = qtdTomadas * 100;
            } else {
                // Sala, quarto, etc
                if (area <= 6) {
                    qtdTomadas = 1;
                } else {
                    qtdTomadas = Math.max(1, Math.ceil(perim / 5));
                }
                vaPorTomada = 100;
                vaTotal = qtdTomadas * 100;
            }

            // ── Renderizar resultados ──
            const grid = document.getElementById('pred-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item">
                    <div class="value">${area.toFixed(1)}</div>
                    <div class="unit">m²</div>
                    <div class="desc">Área do cômodo</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${perim.toFixed(1)}</div>
                    <div class="unit">m</div>
                    <div class="desc">Perímetro</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${qtdPontosLuz}</div>
                    <div class="unit">ponto(s) de luz</div>
                    <div class="desc">Mín. recomendado</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${vaIlum}</div>
                    <div class="unit">VA iluminação</div>
                    <div class="desc">Potência mín. total</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${qtdTomadas}</div>
                    <div class="unit">tomada(s)</div>
                    <div class="desc">Quantidade mínima</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${vaTotal}</div>
                    <div class="unit">VA tomadas</div>
                    <div class="desc">Potência total TUG</div>
                </div>
            `;

            // Detalhes
            const detail = document.getElementById('pred-detail');
            let html = '<table class="predial-table"><thead><tr><th>Item</th><th>Qtd</th><th>VA unitário</th><th>VA total</th></tr></thead><tbody>';
            html += '<tr><td>Iluminação</td><td>' + qtdPontosLuz + '</td><td>' + Math.round(vaIlum / qtdPontosLuz) + '</td><td>' + vaIlum + '</td></tr>';
            if (tipo === 'cozinha') {
                const n3 = Math.min(qtdTomadas, 3);
                const nr = Math.max(0, qtdTomadas - 3);
                if (n3 > 0) html += '<tr><td>TUG (primeiras)</td><td>' + n3 + '</td><td>600</td><td>' + (n3 * 600) + '</td></tr>';
                if (nr > 0) html += '<tr><td>TUG (demais)</td><td>' + nr + '</td><td>100</td><td>' + (nr * 100) + '</td></tr>';
            } else {
                html += '<tr><td>TUG</td><td>' + qtdTomadas + '</td><td>' + (vaPorTomada || 100) + '</td><td>' + vaTotal + '</td></tr>';
            }
            html += '<tr style="font-weight:700"><td>Total</td><td></td><td></td><td>' + (vaIlum + vaTotal) + ' VA</td></tr>';
            html += '</tbody></table>';

            const tipoLabels = { padrao: 'Sala/Quarto/Escritório', cozinha: 'Cozinha/Copa/Área de serviço', banheiro: 'Banheiro', varanda: 'Varanda/Garagem/Corredor' };
            html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Cálculo baseado nos critérios mínimos da NBR 5410 (seções 9.5.2.1 e 9.5.2.2). Tipo: <strong>' + tipoLabels[tipo] + '</strong>. Tomadas de uso específico (TUE) devem ser calculadas separadamente.</div>';
            detail.innerHTML = html;
            document.getElementById('pred-result').style.display = 'block';
        }

// ─── CÁLCULO DE CIRCUITOS ────────────────────────────────────
        // Tabelas simplificadas de capacidade de condução (NBR 5410, cobre, PVC 70°C, Tabela 36)
const SECOES_COBRE = [0.5, 0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];

// Capacidade B1 (eletroduto embutido), 2 condutores carregados
const CAP_B1_2 = [0, 0, 0, 17.5, 24, 32, 41, 57, 76, 101, 125, 151, 192, 232, 269];

const CAP_B1_3 = [0, 0, 0, 15.5, 21, 28, 36, 50, 68, 89, 110, 134, 171, 207, 239];

// B2
const CAP_B2_2 = [0, 0, 0, 19.5, 27, 36, 46, 65, 87, 114, 141, 182, 234, 284, 328];

const CAP_B2_3 = [0, 0, 0, 17.5, 24, 32, 41, 57, 76, 99, 122, 158, 203, 246, 285];

// C
const CAP_C_2 = [0, 0, 0, 24, 33, 43, 56, 78, 105, 138, 171, 221, 284, 342, 396];

const CAP_C_3 = [0, 0, 0, 19.5, 27, 36, 46, 65, 87, 114, 141, 182, 234, 284, 328];

// NBR 5410 — Tabela 36 (PVC 70 °C) e Tabela 37 (EPR/XLPE 90 °C), cobre, 30 °C ambiente / 20 °C solo
        // Métodos E/F: Tabelas 38 (PVC) e 39 (EPR/XLPE), cabos multipolares
const CAP_NBR = {
            pvc: {
                A1: { 2: [7,9,11,14.5,19.5,26,34,46,61,80,99,119,151,182,210], 3: [7,9,10,13.5,18,24,31,42,56,73,89,108,136,164,188] },
                A2: { 2: [7,9,11,14,18.5,25,32,43,57,75,92,110,139,167,192], 3: [7,9,10,13,17.5,23,29,39,52,68,83,99,125,150,172] },
                B1: { 2: [9,11,14,17.5,24,32,41,57,76,101,125,151,192,232,269], 3: [8,10,12,15.5,21,28,36,50,68,89,110,134,171,207,239] },
                B2: { 2: [9,11,13,16.5,23,30,38,52,69,90,111,133,168,201,232], 3: [8,10,12,15,20,27,34,46,62,80,99,118,149,179,206] },
                C:  { 2: [10,13,15,19.5,27,36,46,63,85,112,138,168,213,258,299], 3: [9,11,14,17.5,24,32,41,57,76,96,119,144,184,223,259] },
                D:  { 2: [12,15,18,22,29,38,47,63,81,104,125,148,183,216,246], 3: [10,12,15,18,24,31,39,52,67,86,103,122,151,179,203] },
                E:  { 2: [11,14,17,22,30,40,51,70,94,119,148,180,232,282,328], 3: [9,12,14,18.5,25,34,43,60,80,101,126,153,196,238,276] }
            },
            epr: {
                A1: { 2: [10,12,15,19,26,35,45,61,81,106,131,158,200,241,278], 3: [9,11,13,17,23,31,40,54,73,95,117,141,179,216,249] },
                A2: { 2: [10,12,14,18.5,25,33,42,57,76,99,121,145,183,220,253], 3: [9,11,13,16.5,22,30,38,51,68,89,109,130,164,197,227] },
                B1: { 2: [12,15,18,23,31,42,54,75,100,133,164,198,253,306,354], 3: [10,13,16,20,28,37,48,66,88,117,144,175,222,269,312] },
                B2: { 2: [11,15,17,22,30,40,51,69,91,119,146,175,221,265,305], 3: [10,13,15,19.5,26,35,44,60,80,105,128,154,194,233,268] },
                C:  { 2: [12,16,19,24,33,45,58,80,107,138,171,209,269,328,382], 3: [11,14,17,22,30,40,52,71,96,119,147,179,229,278,322] },
                D:  { 2: [14,18,21,26,34,44,56,73,95,121,146,173,213,252,287], 3: [12,15,17,22,29,37,46,61,79,101,122,144,178,211,240] },
                E:  { 2: [13,17,21,26,36,49,63,86,115,149,185,225,289,352,410], 3: [12,15,18,23,32,42,54,75,100,127,158,192,246,298,346] }
            }
        };

// Fatores de temperatura — NBR 5410 Tabela 40 (ambiente)
const FAT_TEMP_ISO = {
            pvc: { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 },
            epr: { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71 }
        };

function getCapTableNBR(iso, metodo, nCond) {
            const t = CAP_NBR[iso === 'epr' ? 'epr' : 'pvc'];
            const m = (metodo === 'F') ? 'E' : (t[metodo] ? metodo : 'B1');
            return t[m][nCond >= 3 ? 3 : 2];
        }

function tabelaNBRLabel(iso, metodo) {
            const epr = iso === 'epr';
            if (metodo === 'E' || metodo === 'F') return epr ? 'tabela 39 (EPR/XLPE 90 °C)' : 'tabela 38 (PVC 70 °C)';
            return epr ? 'tabela 37 (EPR/XLPE 90 °C)' : 'tabela 36 (PVC 70 °C)';
        }

// E/F — cabos multipolares ao ar livre (eletrocalha/bandeja perfurada, leito) — NBR 5410 Tab. 38/39
const CAP_E_2 = [0, 0, 0, 22, 30, 40, 51, 70, 94, 119, 148, 180, 232, 282, 328];

const CAP_E_3 = [0, 0, 0, 18.5, 25, 34, 43, 60, 80, 101, 126, 153, 196, 238, 276];

// FCA — NBR 5410 Tabela 42 (índices: 1..8, 9-11, 12-15, 16-19, >=20)
const FCA_TAB42 = {
            1: [1.00, 0.80, 0.70, 0.65, 0.60, 0.57, 0.54, 0.52, 0.50, 0.45, 0.41, 0.38], // feixe / conduto fechado
            2: [1.00, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.70, 0.70, 0.70, 0.70], // bandeja não perfurada / parede
            3: [0.95, 0.81, 0.72, 0.68, 0.66, 0.64, 0.63, 0.62, 0.61, 0.61, 0.61, 0.61], // camada única no teto
            4: [1.00, 0.88, 0.82, 0.77, 0.75, 0.73, 0.73, 0.72, 0.72, 0.72, 0.72, 0.72], // bandeja perfurada / eletrocalha
            5: [1.00, 0.87, 0.82, 0.80, 0.80, 0.79, 0.79, 0.78, 0.78, 0.78, 0.78, 0.78]  // leito / suporte
        };

const METODO_REF42 = { B1: 1, B2: 1, D: 1, C: 2, E: 4, F: 5 };

const METODO_LABEL = {
            B1: 'B1 - Conduto fechado (eletroduto embutido)',
            B2: 'B2 - Conduto fechado (eletroduto aparente)',
            C: 'C - Bandeja nao perfurada / parede (camada unica)',
            D: 'D - Cabos enterrados',
            E: 'E - Eletrocalha / bandeja perfurada (camada unica)',
            F: 'F - Leito / suporte (camada unica)'
        };

function fcaIdx(n) { n = Math.max(1, n|0); if (n <= 8) return n - 1; if (n <= 11) return 8; if (n <= 15) return 9; if (n <= 19) return 10; return 11; }

function getFCA(metodo, n) { const t = FCA_TAB42[METODO_REF42[metodo] || 1]; return t[fcaIdx(n)]; }

// Identifica método e nº de circuitos a partir de um FCA informado.
        // Padrão: conduto fechado (B1); depois eletrocalha/bandeja perfurada (E); depois C e F.
function identificarMetodoPorFCA(fca, metodoPreferido) {
            const x = Number(fca); if (!isFinite(x) || x <= 0) return null;
            const nums = [1,2,3,4,5,6,7,8,9,12,16,20];
            const order = [];
            if (metodoPreferido) order.push(metodoPreferido);
            ['B1','E','C','F'].forEach(m => { if (!order.includes(m)) order.push(m); });
            for (const m of order) {
                const t = FCA_TAB42[METODO_REF42[m] || 1];
                const i = t.findIndex(v => Math.abs(v - x) < 0.005);
                if (i >= 0) return { metodo: m, n: nums[i] };
            }
            // sem correspondência exata: conduto fechado, n mais próximo
            const t = FCA_TAB42[METODO_REF42[metodoPreferido] || 1];
            let bi = 0; t.forEach((v, i) => { if (Math.abs(v - x) < Math.abs(t[bi] - x)) bi = i; });
            return { metodo: metodoPreferido || 'B1', n: nums[bi] };
        }

window.identificarMetodoPorFCA = identificarMetodoPorFCA;

// Fatores de temperatura (PVC 70°C, ref 30°C)
const FAT_TEMP = { 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 };

function calcCircuito() {
            const S = Math.max(1, parseFloat(document.getElementById('circ-pot').value) || 2200);
            const fp = Math.min(1, Math.max(0.1, parseFloat(document.getElementById('circ-fp').value) || 0.92));
            const V = parseFloat(document.getElementById('circ-tensao').value) || 127;
            const sistema = document.getElementById('circ-sistema').value;
            const L = Math.max(1, parseFloat(document.getElementById('circ-metro').value) || 15);
            const material = document.getElementById('circ-material').value;
            const nAgrup = Math.max(1, parseInt(document.getElementById('circ-agrup').value) || 1);
            const temp = parseInt(document.getElementById('circ-temp').value) || 40;
            const metodo = document.getElementById('circ-metodo').value;

            const rho = material === 'cu' ? 0.0172 : 0.0282; // Ω·mm²/m

            // Potência ativa
            const P = S * fp;

            // Corrente
            let I;
            if (sistema === 'mono') {
                I = S / V;
            } else if (sistema === 'bi') {
                I = S / V; // entre fases
            } else {
                I = S / (V * Math.sqrt(3));
            }

            // Corrente corrigida (para dimensionamento do condutor)
            const fAgrup = getFCA(metodo, nAgrup);
            const fTemp = FAT_TEMP[temp] || 0.87;
            const Icorr = I / (fAgrup * fTemp);

            // Selecionar seção do condutor
            const condCarregados = sistema === 'tri' ? 3 : 2;
            let capTable;
            if (metodo === 'B1') capTable = condCarregados >= 3 ? CAP_B1_3 : CAP_B1_2;
            else if (metodo === 'B2') capTable = condCarregados >= 3 ? CAP_B2_3 : CAP_B2_2;
            else if (metodo === 'C') capTable = condCarregados >= 3 ? CAP_C_3 : CAP_C_2;
            else if (metodo === 'E' || metodo === 'F') capTable = condCarregados >= 3 ? CAP_E_3 : CAP_E_2;
            else capTable = condCarregados >= 3 ? CAP_B1_3 : CAP_B1_2; // D simplificado

            let secao = SECOES_COBRE[SECOES_COBRE.length - 1];
            let capSelecionada = capTable[capTable.length - 1];
            // Seção mínima para iluminação: 1.5mm², tomadas: 2.5mm²
            const secaoMinIdx = 3; // 1.5mm²
            for (let i = secaoMinIdx; i < SECOES_COBRE.length; i++) {
                if (capTable[i] >= Icorr) {
                    secao = SECOES_COBRE[i];
                    capSelecionada = capTable[i];
                    break;
                }
            }

            // Queda de tensão
            let deltaV;
            if (sistema === 'tri') {
                deltaV = (Math.sqrt(3) * rho * L * I) / secao;
            } else {
                deltaV = (2 * rho * L * I) / secao;
            }
            const deltaVPerc = (deltaV / V) * 100;

            // Disjuntor (padronizados)
            const disjPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
            let disjuntor = disjPadroes[disjPadroes.length - 1];
            for (const d of disjPadroes) {
                if (d >= I) {
                    disjuntor = d;
                    break;
                }
            }
            // Verificar: In ≤ capacidade do condutor corrigida
            // In do disjuntor deve ser ≤ capacidade do cabo * fatores
            const capCorrigida = capSelecionada * fAgrup * fTemp;

            // Potência reativa e aparente
            const Q = S * Math.sin(Math.acos(fp));

            const grid = document.getElementById('circ-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item">
                    <div class="value">${I.toFixed(2)}</div>
                    <div class="unit">A</div>
                    <div class="desc">Corrente de projeto (Ib)</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${Icorr.toFixed(2)}</div>
                    <div class="unit">A</div>
                    <div class="desc">Corrente corrigida (Iz')</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${secao}</div>
                    <div class="unit">mm²</div>
                    <div class="desc">Seção do condutor</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${disjuntor}</div>
                    <div class="unit">A</div>
                    <div class="desc">Disjuntor (In)</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${deltaV.toFixed(2)}</div>
                    <div class="unit">V (${deltaVPerc.toFixed(2)}%)</div>
                    <div class="desc">Queda de tensão</div>
                </div>
                <div class="predial-result-item">
                    <div class="value">${P.toFixed(0)}</div>
                    <div class="unit">W</div>
                    <div class="desc">Potência ativa</div>
                </div>
            `;

            // Detalhes
            let html = '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>';
            html += '<tr><td>Potência aparente (S)</td><td>' + S.toFixed(0) + ' VA</td></tr>';
            html += '<tr><td>Potência ativa (P)</td><td>' + P.toFixed(0) + ' W</td></tr>';
            html += '<tr><td>Potência reativa (Q)</td><td>' + Q.toFixed(0) + ' VAr</td></tr>';
            html += '<tr><td>Corrente de projeto (Ib)</td><td>' + I.toFixed(2) + ' A</td></tr>';
            html += '<tr><td>Fator de agrupamento (' + nAgrup + ' circ.)</td><td>' + fAgrup.toFixed(2) + '</td></tr>';
            html += '<tr><td>Fator de temperatura (' + temp + '°C)</td><td>' + fTemp.toFixed(2) + '</td></tr>';
            html += '<tr><td>Corrente corrigida (Iz\')</td><td>' + Icorr.toFixed(2) + ' A</td></tr>';
            html += '<tr><td>Seção do condutor</td><td>' + secao + ' mm² (' + (material === 'cu' ? 'Cobre' : 'Alumínio') + ')</td></tr>';
            html += '<tr><td>Capacidade do cabo (Iz)</td><td>' + capSelecionada.toFixed(1) + ' A</td></tr>';
            html += '<tr><td>Capacidade corrigida</td><td>' + capCorrigida.toFixed(1) + ' A</td></tr>';
            html += '<tr><td>Disjuntor selecionado (In)</td><td>' + disjuntor + ' A</td></tr>';
            html += '<tr><td>Queda de tensão (ΔV)</td><td>' + deltaV.toFixed(2) + ' V (' + deltaVPerc.toFixed(2) + '%)</td></tr>';
            html += '<tr><td>Método de instalação</td><td>' + metodo + '</td></tr>';
            html += '</tbody></table>';

            // Verificações
            const limQV = 4; // 4% para circuitos terminais
            if (deltaVPerc > limQV) {
                html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Queda de tensão de <strong>' + deltaVPerc.toFixed(2) + '%</strong> excede o limite de ' + limQV + '% para circuitos terminais (NBR 5410 - 6.2.7). Considere aumentar a seção do condutor ou reduzir o comprimento.</div>';
            } else {
                html += '<div class="predial-ok"><i data-eo-icon=circle-check></i> Queda de tensão de <strong>' + deltaVPerc.toFixed(2) + '%</strong> dentro do limite de ' + limQV + '% (NBR 5410 - 6.2.7).</div>';
            }

            if (disjuntor > capCorrigida) {
                html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Corrente nominal do disjuntor (' + disjuntor + ' A) excede a capacidade corrigida do cabo (' + capCorrigida.toFixed(1) + ' A). Considere aumentar a seção do condutor.</div>';
            }

            // Verificação: Ib ≤ In ≤ Iz
            html += '<div class="predial-ok" style="margin-top:.5rem"><i data-eo-icon=file-text></i> <strong>Coordenação:</strong> Ib (' + I.toFixed(1) + ' A) ≤ In (' + disjuntor + ' A) ≤ Iz (' + capCorrigida.toFixed(1) + ' A) — ' + (I <= disjuntor && disjuntor <= capCorrigida ? '<i data-eo-icon=circle-check></i> OK' : '<i data-eo-icon=triangle-alert></i> Verificar') + '</div>';

            document.getElementById('circ-detail').innerHTML = html;
            document.getElementById('circ-result').style.display = 'block';
        }

// ─── MULTI-CIRCUITO ──────────────────────────────────────────
function showCircSubPage(id) {
            ['circ-sub-single', 'circ-sub-multi'].forEach(p => {
                const el = document.getElementById(p);
                if (el) el.style.display = p === id ? '' : 'none';
            });
            ['btn-sub-single', 'btn-sub-multi'].forEach(b => {
                const el = document.getElementById(b);
                if (!el) return;
                if ((b === 'btn-sub-single' && id === 'circ-sub-single') ||
                    (b === 'btn-sub-multi' && id === 'circ-sub-multi')) {
                    el.style.background = 'var(--accent)';
                    el.style.color = 'var(--on-accent)';
                    el.style.border = 'none';
                } else {
                    el.style.background = 'var(--surface2)';
                    el.style.color = 'var(--text)';
                    el.style.border = '1px solid var(--border)';
                }
            });
            if (id === 'circ-sub-multi' && mcCircuits.length === 0) mcAddCircuit();
        }

window.mcCircuits = [];

let mcCircuits = window.mcCircuits;

let mcNextId = 1;

function mcAddCircuit() {
            const id = mcNextId++;
            mcCircuits.push({ id, numero: mcCircuits.length + 1, nome: '' });
            window.mcCircuits = mcCircuits;
            mcRenderList();
        }

function mcCircLabel(c, idx) {
            const num = (c.numero !== undefined && c.numero !== null && String(c.numero).trim() !== '')
                ? String(c.numero).trim() : String(idx + 1);
            const nome = (c.nome || '').trim();
            if (num && nome) return 'Circuito ' + num + ' — ' + nome;
            if (nome) return nome;
            return 'Circuito ' + num;
        }

function mcUpdateCircField(id, field, value) {
            const c = mcCircuits.find(x => x.id === id);
            if (!c) return;
            c[field] = value;
            const idx = mcCircuits.indexOf(c);
            const titleEl = document.getElementById('mc-title-' + id);
            if (titleEl) titleEl.textContent = mcCircLabel(c, idx);
        }

function mcRemoveCircuit(id) {
            mcCircuits = mcCircuits.filter(c => c.id !== id);
            window.mcCircuits = mcCircuits;
            mcRenderList();
        }

function mcSaveCircuitValues() {
            mcCircuits.forEach((c) => {
                const fields = ['tipo','pot','tensao','sistema','l','metodo','agrup','fca','temp','mat','iso','fp'];
                fields.forEach(f => {
                    const el = document.getElementById('mc-' + f + '-' + c.id);
                    if (el) c['_saved_' + f] = el.value;
                });
            });
        }

function mcRestoreCircuitValues() {
            mcCircuits.forEach((c) => {
                const fields = ['tipo','pot','tensao','sistema','l','metodo','agrup','fca','temp','mat','iso','fp'];
                fields.forEach(f => {
                    const el = document.getElementById('mc-' + f + '-' + c.id);
                    if (el && c['_saved_' + f] !== undefined) el.value = c['_saved_' + f];
                });
            });
        }

function mcRenderList() {
            const container = document.getElementById('mc-circuits-list');
            if (!container) return;
            mcSaveCircuitValues();
            container.innerHTML = '';
            mcCircuits.forEach((c, idx) => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.marginBottom = '.8rem';
                const _numVal = (c.numero !== undefined && c.numero !== null) ? c.numero : (idx + 1);
                const _nomeVal = c.nome || '';
                const _label = mcCircLabel(c, idx);
                div.innerHTML = `
                <div class="card-header" style="justify-content:space-between;flex-wrap:wrap;gap:.5rem">
                    <div style="display:flex;align-items:center;gap:.7rem;flex-wrap:wrap">
                        <div class="dot dot-blue"></div>
                        <h3 id="mc-title-${c.id}" style="margin:0">${_label}</h3>
                    </div>
                    <button type="button" class="btn btn-danger-outline eo-row-remove" onclick="mcRemoveCircuit(${c.id})" data-eo-action="predial:remove-circuito"><i data-eo-icon=x></i> Remover</button>
                </div>
                <div class="predial-input-grid" style="margin-bottom:.4rem">
                    <div class="predial-input-group">
                        <label>Número do circuito</label>
                        <input type="text" id="mc-numero-${c.id}" value="${String(_numVal).replace(/"/g,'&quot;')}" placeholder="${idx + 1}" oninput="mcUpdateCircField(${c.id},'numero',this.value)">
                    </div>
                    <div class="predial-input-group" style="grid-column:span 2">
                        <label>Nome do circuito (opcional)</label>
                        <input type="text" id="mc-nome-${c.id}" value="${String(_nomeVal).replace(/"/g,'&quot;')}" placeholder="ex.: Cozinha, Tomadas sala..." oninput="mcUpdateCircField(${c.id},'nome',this.value)">
                    </div>
                </div>
                <div class="predial-input-grid">
                    <div class="predial-input-group">
                        <label>Tipo de circuito</label>
                        <select id="mc-tipo-${c.id}" onchange="mcOnTipoChange(${c.id})">
                             <option value="iluminacao">Iluminação</option>
                             <option value="tug" selected>TUG (Tomada de uso geral)</option>
                             <option value="tue">TUE (Tomada uso específico)</option>
                             <option value="ch">CH Elétrico (curva B)</option>
                         </select>
                    </div>
                    <div class="predial-input-group">
                        <label>Potência aparente (VA)</label>
                        <input type="number" id="mc-pot-${c.id}" value="2200" min="1" step="100">
                    </div>
                    <div class="predial-input-group">
                        <label>Tensão (V)</label>
                        <select id="mc-tensao-${c.id}">
                            <option value="127">127 V</option>
                            <option value="220" selected>220 V</option>
                            <option value="380">380 V</option>
                        </select>
                    </div>
                    <div class="predial-input-group">
                        <label>Sistema</label>
                        <select id="mc-sistema-${c.id}">
                            <option value="mono" selected>Monofásico</option>
                            <option value="bi">Bifásico</option>
                            <option value="tri">Trifásico</option>
                        </select>
                    </div>
                    <div class="predial-input-group">
                        <label>Comprimento L (m)</label>
                        <input type="number" id="mc-l-${c.id}" value="10" min="1" step="1">
                    </div>
                    <div class="predial-input-group">
                        <label>Método de instalação</label>
                        <select id="mc-metodo-${c.id}">
                            <option value="B1" selected>B1 — Conduto fechado (eletroduto embutido)</option>
                            <option value="B2">B2 — Eletroduto aparente</option>
                            <option value="C">C — Bandeja não perfurada / parede (camada única)</option>
                                <option value="E">E — Eletrocalha / bandeja perfurada (camada única)</option>
                                <option value="F">F — Leito / suporte / escada (camada única)</option>
                            <option value="D">D — Cabos enterrados</option>
                        </select>
                    </div>
                    <div class="predial-input-group">
                        <label>Circuitos agrupados</label>
                        <input type="number" id="mc-agrup-${c.id}" value="1" min="1" max="20" step="1">
                    </div>
                    <div class="predial-input-group">
                        <label>FCA da planilha (opcional)</label>
                        <input type="number" id="mc-fca-${c.id}" value="" min="0.3" max="1" step="0.01" placeholder="auto (Tabela 42)">
                    </div>
                    <div class="predial-input-group">
                        <label>Temperatura ambiente (°C)</label>
                        <select id="mc-temp-${c.id}">
                            <option value="30">30 °C</option>
                            <option value="35" selected>35 °C</option>
                            <option value="40">40 °C</option>
                            <option value="45">45 °C</option>
                            <option value="50">50 °C</option>
                        </select>
                    </div>
                     <div class="predial-input-group">
                         <label>Material</label>
                         <select id="mc-mat-${c.id}">
                             <option value="cu" selected>Cobre</option>
                             <option value="al">Alumínio</option>
                         </select>
                     </div>
                     <div class="predial-input-group">
                         <label>Isolação</label>
                         <select id="mc-iso-${c.id}">
                             <option value="pvc" selected>PVC 70 °C (Tabela 36)</option>
                             <option value="epr">EPR / XLPE 90 °C (Tabela 37)</option>
                         </select>
                     </div>
                     <div class="predial-input-group">
                         <label>Fator de potência (cos φ)</label>
                         <input type="number" id="mc-fp-${c.id}" value="0.92" min="0.1" max="1" step="0.01">
                     </div>
                 </div>
                 <div id="mc-res-${c.id}" style="display:none;margin-top:.7rem"></div>
                `;
                container.appendChild(div);
            });
            mcRestoreCircuitValues();
        }

function mcApplyBulk() {
            const list = window.mcCircuits || mcCircuits;
            if (!list || !list.length) { alert('Adicione circuitos primeiro.'); return; }
            const met = document.getElementById('mc-bulk-metodo').value;
            const ag = parseInt(document.getElementById('mc-bulk-agrup').value);
            const fcaV = parseFloat(String(document.getElementById('mc-bulk-fca').value).replace(',', '.'));
            const clear = document.getElementById('mc-bulk-clearfca').checked;
            if (!met && !(ag > 0) && !(fcaV > 0 && fcaV <= 1) && !clear) { alert('Escolha ao menos uma opção para aplicar.'); return; }
            list.forEach(c => {
                const set = (f, v) => { const el = document.getElementById('mc-' + f + '-' + c.id); if (el) el.value = v; c['_saved_' + f] = String(v); };
                if (met) set('metodo', met);
                if (ag > 0) set('agrup', Math.min(20, ag));
                if (fcaV > 0 && fcaV <= 1) set('fca', fcaV.toFixed(2));
                else if (clear) set('fca', '');
            });
            alert('Aplicado a ' + list.length + ' circuito(s).');
        }

window.mcApplyBulk = mcApplyBulk;

function mcOnTipoChange(id) {
            const tipoEl = document.getElementById('mc-tipo-' + id);
            const fpEl = document.getElementById('mc-fp-' + id);
            if (!tipoEl || !fpEl) return;
            if (tipoEl.value === 'ch') fpEl.value = '1';
            else if (parseFloat(fpEl.value) === 1) fpEl.value = '0.92';
        }

function mcCalcOne(c) {
            const S = parseFloat(document.getElementById('mc-pot-' + c.id).value) || 2200;
            const V = parseFloat(document.getElementById('mc-tensao-' + c.id).value) || 220;
            const sistema = document.getElementById('mc-sistema-' + c.id).value;
            const L = parseFloat(document.getElementById('mc-l-' + c.id).value) || 10;
            const metodo = document.getElementById('mc-metodo-' + c.id).value;
            const nAgrup = parseInt(document.getElementById('mc-agrup-' + c.id).value) || 1;
            const temp = parseInt(document.getElementById('mc-temp-' + c.id).value) || 35;
            const material = document.getElementById('mc-mat-' + c.id).value;
            const isoEl = document.getElementById('mc-iso-' + c.id);
            const isolacao = (isoEl && isoEl.value === 'epr') ? 'epr' : 'pvc';
            const fpEl = document.getElementById('mc-fp-' + c.id);
            const fp = Math.max(0.1, Math.min(1, parseFloat(fpEl ? fpEl.value : '0.92') || 0.92));
            const tipoEl = document.getElementById('mc-tipo-' + c.id);
            const tipo = tipoEl ? tipoEl.value : 'tug';

            // Seção mínima NBR 5410 por tipo de circuito (cobre, PVC)
            // iluminação: 1,5mm²  |  TUG: 2,5mm²  |  TUE: 2,5mm²  |  CH elétrico: 4mm²
            const secaoMinNBR = { iluminacao: 1.5, tug: 2.5, tue: 2.5, ch: 4.0 }[tipo] || 2.5;
            const secaoMinLabel = {
                iluminacao: '1,5 mm² (iluminação)',
                tug: '2,5 mm² (TUG)',
                tue: '2,5 mm² (TUE)',
                ch: '4,0 mm² (CH elétrico)'
            }[tipo] || '2,5 mm²';

            // Curva do disjuntor: CH elétrico usa B, demais usa C
            const curvaDisj = tipo === 'ch' ? 'B' : 'C';

            const rho = material === 'cu' ? 0.0172 : 0.0282;
            let Ib;
            if (sistema === 'tri') Ib = S / (V * Math.sqrt(3));
            else Ib = S / V;

            const fcaEl = document.getElementById('mc-fca-' + c.id);
            const fcaInf = fcaEl ? parseFloat(String(fcaEl.value).replace(',', '.')) : NaN;
            const fcaInformado = isFinite(fcaInf) && fcaInf > 0 && fcaInf <= 1;
            const fAgrup = fcaInformado ? fcaInf : getFCA(metodo, nAgrup);
            const fTemp = (FAT_TEMP_ISO[isolacao] || FAT_TEMP_ISO.pvc)[temp] || 0.87;
            const FC = fAgrup * fTemp;
            const FCT = fTemp;
            const FCA = fAgrup;
            const Icorr = Ib / FC;

            const condCarregados = sistema === 'tri' ? 3 : 2;
            const capTable = getCapTableNBR(isolacao, metodo, condCarregados);
            const tabelaLabel = tabelaNBRLabel(isolacao, metodo);

            // Índice mínimo conforme NBR 5410 (pelo tipo de circuito)
            const secaoMinIdx = Math.max(
                SECOES_COBRE.indexOf(secaoMinNBR) >= 0 ? SECOES_COBRE.indexOf(secaoMinNBR) : 2,
                Ib <= 4 ? 2 : (Ib <= 10 ? 3 : 4)
            );

            let secao = SECOES_COBRE[SECOES_COBRE.length - 1];
            let capSel = capTable[capTable.length - 1];
            for (let i = secaoMinIdx; i < SECOES_COBRE.length; i++) {
                if (capTable[i] >= Icorr) {
                    secao = SECOES_COBRE[i];
                    capSel = capTable[i];
                    break;
                }
            }

            const IzCabo = capSel * FC;

            // Queda de tensão (monofásico: 2*rho*L*I / (S*E) conforme PDF de referência)
            const mult = sistema === 'tri' ? Math.sqrt(3) : 2;
            const deltaV = (mult * rho * L * Ib * fp) / secao;
            const deltaVPerc = (deltaV / V) * 100;

            // Disjuntor
            const disjPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
            let IndFinal = disjPadroes[disjPadroes.length - 1];
            let secaoFinal = secao;
            let capSelFinal = capSel;
            let IzCaboFinal = IzCabo;
            let secaoAumentada = false;
            let indValido = false;

            for (const d of disjPadroes) {
                if (d >= Ib && d <= IzCabo) { IndFinal = d; indValido = true; break; }
            }
            if (!indValido) {
                const idxAtual = SECOES_COBRE.indexOf(secao);
                for (let i = idxAtual + 1; i < SECOES_COBRE.length; i++) {
                    const capN = capTable[i];
                    const IzN = capN * FC;
                    for (const d of disjPadroes) {
                        if (d >= Ib && d <= IzN) {
                            secaoFinal = SECOES_COBRE[i];
                            capSelFinal = capN;
                            IzCaboFinal = IzN;
                            IndFinal = d;
                            secaoAumentada = true;
                            indValido = true;
                            break;
                        }
                    }
                    if (indValido) break;
                }
            }

            // Avaliação completa de uma seção (capacidade, queda de tensão, coordenação)
            const _evalSec = (i) => {
                const sec = SECOES_COBRE[i], cap = capTable[i], Iz = cap * FC;
                let disj = null;
                for (const d of disjPadroes) { if (d >= Ib && d <= Iz) { disj = d; break; } }
                const dv = (mult * rho * L * Ib * fp) / sec / V * 100;
                const capOk = cap >= Icorr, dvOk = dv <= 4, disjOk = disj !== null;
                return { idx: i, secao: sec, capSel: cap, IzCabo: Iz, Ind: disj, deltaVPerc: dv, capOk, dvOk, disjOk, ok: capOk && dvOk && disjOk };
            };
            const tentMin = _evalSec(secaoMinIdx);
            let tentFinal = null;
            for (let i = secaoMinIdx; i < SECOES_COBRE.length; i++) { const t = _evalSec(i); if (t.ok) { tentFinal = t; break; } }
            if (tentFinal) {
                secaoFinal = tentFinal.secao; capSelFinal = tentFinal.capSel; IzCaboFinal = tentFinal.IzCabo; IndFinal = tentFinal.Ind;
                secaoAumentada = tentFinal.idx !== secaoMinIdx;
            } else tentFinal = _evalSec(SECOES_COBRE.indexOf(secaoFinal));
            const deltaVPercFinal = tentFinal.deltaVPerc;

            return {
                tentMin, tentFinal, minNaoAtende: !tentMin.ok, isolacao, tabelaLabel,
                S, V, L, sistema, metodo, metodoLabel: METODO_LABEL[metodo] || metodo, fcaInformado, nAgrup, temp, material, rho, FCT, FCA, FC, Ib,
                Icorr, secao: secaoFinal, capSel: capSelFinal, IzCabo: IzCaboFinal,
                Ind: IndFinal, deltaVPerc: deltaVPercFinal, secaoAumentada, condCarregados,
                tipo, secaoMinNBR, secaoMinLabel, curvaDisj, fp
            };
        }

function mcCalcAll() {
            mcCircuits.forEach((c, idx) => {
                const r = mcCalcOne(c);
                const resDiv = document.getElementById('mc-res-' + c.id);
                if (!resDiv) return;
                const ok = r.deltaVPerc <= 4;
                resDiv.style.display = '';
                resDiv.innerHTML = `
                <div style="display:flex;flex-wrap:wrap;gap:.5rem;padding:.7rem;background:var(--surface2);border-radius:10px;font-size:.82rem">
                    <span style="background:var(--surface);border:1px solid var(--border);padding:.2rem .6rem;border-radius:6px;font-weight:700">${r.tipo === 'iluminacao' ? '<i data-eo-icon=lightbulb></i> Iluminação' : r.tipo === 'tug' ? '<i data-eo-icon=zap></i> TUG' : r.tipo === 'tue' ? '<i data-eo-icon=zap></i> TUE' : 'CH Elétrico'}</span>
                    <span style="background:var(--accent);color:var(--on-accent);padding:.2rem .6rem;border-radius:6px;font-weight:700">Ib = ${r.Ib.toFixed(2)} A</span>
                    <span style="background:var(--surface);border:1px solid var(--border);padding:.2rem .6rem;border-radius:6px">Iz' = ${r.Icorr.toFixed(2)} A</span>
                    <span style="background:var(--surface);border:1px solid var(--border);padding:.2rem .6rem;border-radius:6px">Seção mín. NBR = ${r.secaoMinNBR} mm²</span>
                    <span style="background:var(--surface);border:1px solid var(--border);padding:.2rem .6rem;border-radius:6px">Seção adotada = ${r.secao} mm²${r.secaoAumentada ? ' ↑' : ''}</span>
                    <span style="background:var(--surface);border:1px solid var(--border);padding:.2rem .6rem;border-radius:6px">Iz cabo = ${r.IzCabo.toFixed(2)} A</span>
                    <span style="background:${ok ? 'var(--accent4)' : 'var(--accent2)'};color:var(--on-accent);padding:.2rem .6rem;border-radius:6px">ΔV = ${r.deltaVPerc.toFixed(3)}%</span>
                    <span style="background:var(--accent3);color:var(--on-accent);padding:.2rem .6rem;border-radius:6px">Disjuntor = ${r.Ind} A curva ${r.curvaDisj}</span>
                    ${r.secaoAumentada ? '<span style="background:rgba(232,93,32,.15);color:var(--accent2);border:1px solid var(--accent2);padding:.2rem .6rem;border-radius:6px"><i data-eo-icon=triangle-alert></i> Seção aumentada para atender coordenação</span>' : ''}
                </div>`;
            });
        }

// ===================== EXPORTAR MEMORIAIS DE CÁLCULO (.docx) =====================
        // Gera um arquivo .docx por circuito, baseado no template "MEMORIAL DE CÁLCULO — NBR 5410",
        // marcando com "X" as opções correspondentes ao relatório de múltiplos circuitos.

        // Revisão atual aplicada aos memoriais (definida pelo pop-up de exportação)
let _mcRevisao = '0';

// Pop-up: pergunta se o usuário quer adicionar revisão e qual REV.
        // Resolve { proceed: bool, rev: string }
function mcAskRevisao() {
            return Promise.resolve({ proceed: true, rev: '' });
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(5,10,18,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem';
                const card = document.createElement('div');
                card.style.cssText = 'background:#0e1726;border:1px solid #2a3a4d;border-radius:14px;max-width:420px;width:100%;padding:1.4rem 1.4rem 1.2rem;box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:inherit;color:#e6edf6';
                card.innerHTML = `
                    <div style="font-size:1.1rem;font-weight:700;margin-bottom:.35rem;color:#fff"><i data-eo-icon=file-text></i> Revisão do Memorial</div>
                    <div style="font-size:.86rem;color:#9fb0c4;line-height:1.45;margin-bottom:1rem">Deseja adicionar uma revisão a este memorial de cálculo? Informe em qual REV o documento está.</div>
                    <label style="display:flex;align-items:center;gap:.55rem;font-size:.9rem;margin-bottom:.9rem;cursor:pointer;user-select:none">
                        <input type="checkbox" id="mc-rev-add-chk" style="width:18px;height:18px;accent-color:#1f6feb;cursor:pointer">
                        Adicionar revisão
                    </label>
                    <div id="mc-rev-input-wrap" style="opacity:.4;pointer-events:none;transition:opacity .15s">
                        <label style="display:block;font-size:.78rem;color:#9fb0c4;margin-bottom:.3rem">Identificação da revisão (REV)</label>
                        <input type="text" id="mc-rev-input" value="1" placeholder="Ex.: 1, 2, A, B..." style="width:100%;box-sizing:border-box;background:#121a26;border:1px solid #2a3a4d;border-radius:8px;color:#fff;padding:.55rem .65rem;font-size:.95rem">
                    </div>
                    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1.3rem">
                        <button id="mc-rev-cancel" data-eo-action="predial:cancel-memorial-review" style="background:#1c2735;color:#cfd6e0;border:1px solid #2a3a4d;border-radius:8px;padding:.55rem 1rem;font-size:.88rem;cursor:pointer">Cancelar</button>
                        <button id="mc-rev-ok" data-eo-action="predial:confirm-memorial-review" style="background:#1f6feb;color:#fff;border:none;border-radius:8px;padding:.55rem 1.1rem;font-size:.88rem;font-weight:600;cursor:pointer">Exportar</button>
                    </div>`;
                overlay.appendChild(card);
                document.body.appendChild(overlay);

                const chk = card.querySelector('#mc-rev-add-chk');
                const wrap = card.querySelector('#mc-rev-input-wrap');
                const input = card.querySelector('#mc-rev-input');
                const syncState = () => {
                    const on = chk.checked;
                    wrap.style.opacity = on ? '1' : '.4';
                    wrap.style.pointerEvents = on ? 'auto' : 'none';
                    if (on) { input.focus(); input.select(); }
                };
                chk.addEventListener('change', syncState);

                const close = (result) => { overlay.remove(); resolve(result); };
                card.querySelector('#mc-rev-cancel').addEventListener('click', () => close({ proceed: false }));
                card.querySelector('#mc-rev-ok').addEventListener('click', () => {
                    if (chk.checked) {
                        const rev = (input.value || '').trim() || '1';
                        close({ proceed: true, rev });
                    } else {
                        close({ proceed: true, rev: '0' });
                    }
                });
                overlay.addEventListener('click', (e) => { if (e.target === overlay) close({ proceed: false }); });
                input.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.querySelector('#mc-rev-ok').click(); });
            });
        }

// Fluxo do botão "Exportar Memoriais (.docx)": mostra o pop-up de revisão antes de gerar.
        // ── Pré-visualização dos documentos ──
function mcShowPreview(kind, blob) {
            let ov = document.getElementById('mc-doc-preview');
            if (ov) ov.remove();
            ov = document.createElement('div');
            ov.id = 'mc-doc-preview';
            ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Pré-visualização do documento');
            ov.style.cssText = 'position:fixed;inset:0;background:rgba(5,10,18,.8);z-index:99999;display:flex;flex-direction:column;padding:1rem';
            ov.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;color:#fff;font-weight:700">'
                + '<span><i data-eo-icon=eye></i> Pré-visualização — ' + (kind === 'pdf' ? 'PDF' : 'Memoriais (.docx)') + '</span>'
                + '<button id="mc-doc-preview-close" data-eo-action="predial:close-doc-preview" style="background:#1c2735;color:#cfd6e0;border:1px solid #2a3a4d;border-radius:8px;padding:.45rem .9rem;cursor:pointer"><i data-eo-icon=x></i> Fechar</button></div>'
                + '<div id="mc-doc-preview-body" style="flex:1;overflow:auto;background:#525659;border-radius:10px"></div>';
            document.body.appendChild(ov);
            const body = ov.querySelector('#mc-doc-preview-body');
            const url = URL.createObjectURL(blob);
            ov.querySelector('#mc-doc-preview-close').onclick = () => { ov.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
            if (kind === 'pdf') {
                body.innerHTML = '<iframe src="' + url + '" style="width:100%;height:100%;border:0"></iframe>';
            } else {
                body.innerHTML = '<div style="color:#fff;padding:1rem">Carregando…</div>';
                const run = () => {
                    const viewer = window.docx_preview;
                    if (!viewer || typeof viewer.renderAsync !== 'function') {
                        body.innerHTML = '<div style="color:#fff;padding:1rem">Não foi possível carregar o visualizador.</div>';
                        return;
                    }
                    body.innerHTML = '';
                    viewer.renderAsync(blob, body, null, { inWrapper: true, ignoreFonts: false, experimental: true })
                        .catch(e => { console.error(e); body.innerHTML = '<div style="color:#fff;padding:1rem">Não foi possível exibir o documento.</div>'; });
                };
                EO.load('docxpreview').then(run).catch(() => {
                    body.innerHTML = '<div style="color:#fff;padding:1rem">Falha ao carregar o visualizador de documentos.</div>';
                });
            }
        }

async function mcPreviewDocx() {
            if (!mcCircuits.length) { alert('Adicione pelo menos um circuito.'); return; }
            try {
                const r = await mcExportMemoriais({ returnBlob: true });
                if (r && r.blob) mcShowPreview('docx', r.blob);
            } catch (e) { alert('Erro ao gerar pré-visualização: ' + (e.message || e)); }
        }

async function mcExportMemoriaisFlow() {
            if (!mcCircuits.length) { alert('Adicione pelo menos um circuito.'); return; }
            const r = await mcAskRevisao();
            if (!r.proceed) return;
            _mcRevisao = r.rev;
            await mcExportMemoriais({ rev: r.rev });
        }

async function mcExportMemoriais(opts = {}) {
            const license = await EOLicense.requireUser();
            if (!license) return;
            const returnBlob = !!opts.returnBlob;
            const revisaoStr = (opts.rev != null && String(opts.rev) !== '') ? String(opts.rev) : _mcRevisao;
            if (!mcCircuits.length) { alert('Adicione pelo menos um circuito.'); return; }
            // Aguarda libs carregarem (até ~8s) e tenta carregar sob demanda se faltar
            const loadScript = (src) => new Promise((res, rej) => {
                const s = document.createElement('script'); s.src = src;
                s.onload = res; s.onerror = () => rej(new Error('Falha ao carregar ' + src));
                document.head.appendChild(s);
            });
            const waitFor = async (cond, timeout = 8000) => {
                const start = Date.now();
                while (!cond()) {
                    if (Date.now() - start > timeout) return false;
                    await new Promise(r => setTimeout(r, 150));
                }
                return true;
            };
            try {
                if (typeof window.docx === 'undefined') {
                    await EO.load('docx');
                }
                if (typeof window.JSZip === 'undefined') {
                    await EO.load('jszip');
                }
                if (typeof window.saveAs === 'undefined') {
                    await EO.load('filesaver').catch(() => { });
                }
            } catch (_) {
                alert('Não foi possível carregar as bibliotecas de exportação. Verifique a instalação offline ou a conexão e tente novamente.');
                return;
            }
            const ok = await waitFor(() => window.docx && window.JSZip);
            if (!ok || !window.docx || !window.JSZip) {
                alert('Não foi possível carregar as bibliotecas de exportação. Verifique sua conexão com a internet e tente novamente.');
                return;
            }
            // Fallback de saveAs caso FileSaver não tenha carregado
            const saveBlob = (blob, name) => {
                if (typeof window.saveAs === 'function') return window.saveAs(blob, name);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = name;
                document.body.appendChild(a); a.click();
                setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
            };
            mcCalcAll();

            const projetistaTog = document.getElementById('mc-projetista-toggle');
            const isProjetista = projetistaTog ? projetistaTog.checked : false;
            const aluno = (document.getElementById('mc-aluno').value || '').trim();
            const obra = (document.getElementById('mc-obra').value || '').trim();
            const profToggle = document.getElementById('mc-prof-toggle');
            const incluirProf = profToggle ? profToggle.checked : true;
            const prof = incluirProf ? (document.getElementById('mc-prof').value || '').trim() : '';
            const dataStr = (document.getElementById('mc-data').value || '').trim();

            const {
                Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
                Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak
            } = docx;

            const MARK = '☒';   // marcado
            const BOX = '☐';   // desmarcado
            const cx = (cond) => cond ? MARK : BOX;

            const border = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
            const cellBorders = { top: border, bottom: border, left: border, right: border };

            // Fonte personalizada só nos valores preenchidos pelo usuário (um pouco maior)
            const _CF = window.__customDocxFont;
            const VAL_OPTS = (_CF && _CF.family) ? { font: { ascii: _CF.family, hAnsi: _CF.family, cs: _CF.family, eastAsia: _CF.family }, size: Math.round((_CF.size || 12) * 2) } : {};
            const V = (x) => (_CF && _CF.family) ? '\u0001' + String(x) + '\u0002' : String(x);
            const P = (text, opts = {}) => new Paragraph({
                spacing: { after: 80 },
                children: String(text).split(/(\u0001[^\u0002]*\u0002)/).filter(t => t !== '').map(t =>
                    t.charAt(0) === '\u0001'
                        ? new TextRun({ text: t.slice(1, -1), ...opts, ...VAL_OPTS })
                        : new TextRun({ text: t, ...opts }))
            });
            const PB = (text) => P(text, { bold: true });
            const H = (text, level = HeadingLevel.HEADING_2) => new Paragraph({
                heading: level, spacing: { before: 200, after: 120 },
                children: [new TextRun({ text, bold: true })]
            });

            const cell = (text, opts = {}) => new TableCell({
                borders: cellBorders,
                width: opts.width || { size: 4680, type: WidthType.DXA },
                shading: opts.header ? { fill: 'E8EEF7', type: ShadingType.CLEAR, color: 'auto' } : undefined,
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: !!opts.bold, ...(opts.value ? VAL_OPTS : {}) })] })]
            });
            const kvTable = (rows) => new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [3600, 5760],
                rows: rows.map(([k, v]) => new TableRow({
                    children: [
                        cell(k, { header: true, bold: true, width: { size: 3600, type: WidthType.DXA } }),
                        cell(v, { value: true, width: { size: 5760, type: WidthType.DXA } })
                    ]
                }))
            });

            const buildChildrenFor = (c, idx) => {
                const r = mcCalcOne(c);
                // Mapeamentos para o template
                const tensao127 = r.V === 127, tensao220 = r.V === 220, tensao380 = r.V === 380;
                const sysMono = r.sistema === 'mono', sysBi = r.sistema === 'bi', sysTri = r.sistema === 'tri';
                // No módulo de múltiplos circuitos a carga é tomada/iluminação (resistiva)
                const cargaResistiva = true;
                // Material/isolação
                const matCu = r.material === 'cu', matAl = r.material === 'al';
                // Isolação considerada: PVC 70 °C (padrão usado nas tabelas CAP_*)
                const isoPVC = r.isolacao !== 'epr', isoEPR = r.isolacao === 'epr';
                const tab36 = isoPVC, tab37 = isoEPR;
                // Curva do disjuntor
                const curvaB = r.curvaDisj === 'B', curvaC = r.curvaDisj === 'C', curvaD = r.curvaDisj === 'D';
                // Verificações finais
                const izOk = r.IzCabo >= r.Ib;
                const dvOk = r.deltaVPerc <= 4;
                const coordOk = (r.Ind >= r.Ib) && (r.Ind <= r.IzCabo);
                const tab47Ok = r.secao >= r.secaoMinNBR;

                const tipoLabel = ({ iluminacao: 'Iluminação', tug: 'TUG (Tomada de uso geral)', tue: 'TUE (Tomada uso específico)', ch: 'CH Elétrico' })[r.tipo] || r.tipo;
                const sysLabel = sysMono ? 'Monofásico' : sysBi ? 'Bifásico' : 'Trifásico';

                const fmt = (n, d = 2) => (n == null || isNaN(n)) ? '-' : Number(n).toFixed(d).replace('.', ',');

                const children = [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'MEMORIAL DE CÁLCULO — NBR 5410', bold: true, size: 28 })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER, spacing: { after: 200 },
                        children: [new TextRun({ text: 'Tabelas: 33, 36/37, 40, 42, 47 • ρ(Cu)=0,0172 Ω·mm²/m • ΔVmáx.: 4% (ponto de utilização)', italics: true, size: 18 })]
                    }),

                    H('1. Identificação'),
                    kvTable([
                        ['Cliente / ' + (isProjetista ? 'Projetista' : 'Aluno'), aluno || '—'],
                        ['Obra:', obra || '—'],
                        ['Circuito (ID/descrição):', `${mcCircLabel(c, idx)} — ${tipoLabel}`],
                        ['Data / Responsável:', `${dataStr || '—'} / ${prof || (isProjetista ? aluno : '—')}`]
                    ]),

                    H('2. Dados do circuito'),
                    P(`Tensão: ${cx(tensao127)} ${tensao127 ? V("127 V") : "127 V"}   ${cx(tensao220)} ${tensao220 ? V("220 V") : "220 V"}   ${cx(tensao380)} ${tensao380 ? V("380 V") : "380 V"}   ${cx(!tensao127 && !tensao220 && !tensao380)} Outro: ${V((!tensao127 && !tensao220 && !tensao380) ? r.V + ' V' : '____')}`),
                    P(`Sistema: ${cx(sysMono)} ${sysMono ? V("Monofásico") : "Monofásico"}   ${cx(sysBi)} ${sysBi ? V("Bifásico") : "Bifásico"}   ${cx(sysTri)} ${sysTri ? V("Trifásico") : "Trifásico"}`),
                    P(`Tipo de carga: ${cx(cargaResistiva)} Resistiva   ${BOX} Indutiva   ${BOX} Capacitiva   ${BOX} Mista — Descrição: ${V(tipoLabel)}`),
                    P(`Potência (S) [VA]: ${V(fmt(r.S, 0))}   Fator de potência (FP): ${V(fmt(r.fp, 2))}   Rendimento η: —`),
                    P(`Comprimento ida (L) [m]: ${V(fmt(r.L, 0))}   ΔV máx. [%]: 4`),
                    P(`Temperatura ambiente [°C] (T40): ${V(r.temp)}   Nº circuitos no mesmo conduto (T42): ${V(r.nAgrup)}   Método (T33): ${V(r.metodoLabel || r.metodo)}`),
                    P(`Material/isolação do cabo: ${cx(matCu)} ${matCu ? V("Cu") : "Cu"}   ${cx(matAl)} ${matAl ? V("Al") : "Al"}   ${cx(isoPVC)} ${isoPVC ? V("PVC 70 °C") : "PVC 70 °C"}   ${cx(isoEPR)} ${isoEPR ? V("EPR/XLPE 90 °C") : "EPR/XLPE 90 °C"}`),

                    H('3. Corrente de projeto (Ib)'),
                    P('Mono/Bi: I = S / V • Tri (V_LL): I = S / (√3 × V_LL)'),
                    kvTable([['Ib calculada [A]:', fmt(r.Ib, 2)]]),

                    H('4. Seção mínima — Tabela 47'),
                    kvTable([
                        ['Uso do circuito:', tipoLabel],
                        ['Seção mínima [mm²]:', String(r.secaoMinNBR).replace('.', ',')]
                    ]),

                    H('5. Capacidade de condução (Iz_tabela)'),
                    P(`Tabela: ${cx(tab36)} 36 (PVC 70 °C)   ${cx(tab37)} 37 (EPR/XLPE 90 °C)`),
                    P(`Método (T33): ${V(r.metodoLabel || r.metodo)}   Condutores carregados: ${V(r.condCarregados)}`),
                    kvTable([['Iz_tabela [A]:', fmt(r.capSel, 2)]]),

                    H('6. Fatores de correção'),
                    P(`FCT (Tabela 40): ${V(fmt(r.FCT, 2))}   FCA (${r.fcaInformado ? 'planilha' : 'Tabela 42'}): ${V(fmt(r.FCA, 2))}   FC = FCT × FCA = ${V(fmt(r.FC, 3))}`),

                    H('7. Capacidade corrigida e seção'),
                    kvTable([
                        ['Iz = Iz_tabela × FC [A]:', fmt(r.IzCabo, 2)],
                        ['Seção do condutor adotada [mm²]:', String(r.secao).replace('.', ',') + (r.secaoAumentada ? '  (⬆ aumentada para coordenação)' : '')]
                    ]),
                    P('Critério: Ib ≤ Iz e respeito à Tabela 47. Se não atender, subir seção e recalcular ΔV.'),

                    H('8. Queda de tensão (verificação)'),
                    P('Mono/Bi: ΔV% = (2·ρ·L·I) / (S·V) × 100   •   Tri: ΔV% = (√3·ρ·L·I) / (S·V) × 100   •   ρ(Cu)=0,0172 Ω·mm²/m'),
                    P(`ΔV calculada [%]: ${V(fmt(r.deltaVPerc, 3))}   Limite [%]: 4   ${cx(dvOk)} Ok   ${cx(!dvOk)} Ajustar secção`),

                    H('9. Disjuntor (coordenação)'),
                    kvTable([['Corrente nominal [A]:', String(r.Ind)]]),
                    P(`Curva: ${cx(curvaB)} ${curvaB ? V("B") : "B"}   ${cx(curvaC)} ${curvaC ? V("C") : "C"}   ${cx(curvaD)} ${curvaD ? V("D") : "D"}`),
                    P(`Coordenação: Ib ≤ corrente nominal ≤ Iz   →   ${V(fmt(r.Ib, 2))} ≤ ${V(r.Ind)} ≤ ${V(fmt(r.IzCabo, 2))}   ${V(coordOk ? '(Ok)' : '(Verificar)')}`),

                    H('10. Checagens finais'),
                    P(`${cx(tab47Ok)} Atende Tabela 47 (secção mínima)`),
                    P(`${cx(izOk)} Iz corrigida ≥ Ib`),
                    P(`${cx(dvOk)} ΔV ≤ limite`),
                    P(`${cx(coordOk)} Coordenação cabo–disjuntor ok`),
                    P('Observações: ' + V(r.secaoAumentada ? 'Seção aumentada para garantir coordenação cabo–disjuntor.' : '—')),

                    H('Caixa-Resumo (para colar no projeto)'),
                    kvTable([
                        ['Condutor adotado:', `${String(r.secao).replace('.', ',')} mm² ${matCu ? 'Cu' : 'Al'} / PVC 70 °C`],
                        ['Disjuntor:', `${r.Ind} A — Curva ${r.curvaDisj}`],
                        ['Notas:', `${tipoLabel} — ${sysLabel} ${r.V} V — L=${fmt(r.L, 0)} m — Método ${r.metodoLabel || r.metodo} — ${r.nAgrup} circ. agrupados — ${r.temp}°C`]
                    ]),
                ];

                return children;
            };

            const buildCombinedDoc = () => {
                const allChildren = [];
                mcCircuits.forEach((c, i) => {
                    if (i > 0) {
                        allChildren.push(new Paragraph({ children: [new PageBreak()] }));
                    }
                    allChildren.push(...buildChildrenFor(c, i));
                });
                return new Document({
                    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
                    sections: [{
                        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
                        headers: { default: EOLicense.header(license) },
                        children: allChildren
                    }]
                });
            };

            const safe = (s) => (s || 'memorial').replace(/[^\w\-\s\.]/g, '_').replace(/\s+/g, '_').slice(0, 60);
            const baseName = safe(obra) || 'memoriais';

            try {
                let blob = await Packer.toBlob(buildCombinedDoc());
                try { if (window.__embedDocxFont) blob = await window.__embedDocxFont(blob); } catch (e) { console.warn('Falha ao embutir fonte no DOCX', e); }
                const filename = `Memoriais_Calculo_${baseName}.docx`;
                if (returnBlob) return { blob, filename };
                saveBlob(blob, filename);
            } catch (err) {
                console.error(err);
                if (returnBlob) throw err;
                alert('Erro ao gerar memoriais: ' + err.message);
            }
        }

function mcPrint() {

            mcCalcAll();
            const projetistaTog = document.getElementById('mc-projetista-toggle');
            const isProjetista = projetistaTog ? projetistaTog.checked : false;
            const tituloAluno = isProjetista ? 'Projetista' : 'Aluno';
            const aluno = (document.getElementById('mc-aluno').value || 'Não informado').trim();
            const obra = (document.getElementById('mc-obra').value || 'Não informado').trim();
            const profToggle = document.getElementById('mc-prof-toggle');
            const inclProf = profToggle ? profToggle.checked : true;
            const prof = inclProf ? (document.getElementById('mc-prof').value || 'Não informado').trim() : null;
            const data = (document.getElementById('mc-data').value || new Date().toLocaleDateString('pt-BR')).trim();

            let txtLines = [];
            txtLines.push('================================================================');
            txtLines.push('         DIMENSIONAMENTO DE CIRCUITOS ELÉTRICOS — NBR 5410');
            txtLines.push('================================================================');
            txtLines.push(tituloAluno.padEnd(9) + ': ' + aluno);
            txtLines.push('Projeto  : ' + obra);
            if (inclProf) txtLines.push('Professor: ' + prof);
            txtLines.push('Data     : ' + data);
            txtLines.push('================================================================');
            txtLines.push('');

            let htmlOut = `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem;font-family:'Space Mono',monospace;font-size:.78rem">`;
            htmlOut += `<div style="text-align:center;margin-bottom:1rem">
                <div style="font-size:1.1rem;font-weight:800;color:var(--accent)">DIMENSIONAMENTO DE CIRCUITOS ELÉTRICOS — NBR 5410</div>
                <div style="color:var(--text-dim);margin-top:.3rem">${tituloAluno}: <strong>${aluno}</strong> | Projeto: <strong>${obra}</strong>${inclProf ? ' | Prof.: <strong>' + prof + '</strong>' : ''} | Data: <strong>${data}</strong></div>
            </div>`;

            mcCircuits.forEach((c, idx) => {
                const r = mcCalcOne(c);
                const num = idx + 1;
                const sistStr = r.sistema === 'mono' ? 'Monofásico' : r.sistema === 'bi' ? 'Bifásico' : 'Trifásico';
                const matStr = r.material === 'cu' ? 'Cobre' : 'Alumínio';
                const condStr = r.condCarregados + ' cond. carregados';
                const ΔVok = r.deltaVPerc <= 4;
                const coordOK = r.Ib <= r.Ind && r.Ind <= r.IzCabo;

                // TXT
                txtLines.push('----------------------------------------------------------------');
                txtLines.push(mcCircLabel(c, idx).toUpperCase());
                txtLines.push('----------------------------------------------------------------');
                txtLines.push('S = ' + r.S + ' VA');
                txtLines.push('E = ' + r.V + ' V');
                txtLines.push('FP = ' + r.fp.toFixed(2) + ' (fator de potência)');
                txtLines.push('L = ' + r.L + ' m');
                txtLines.push('Método de instalação: ' + (r.metodoLabel || r.metodo) + ' (tabela 33)');
                txtLines.push('Número de circuitos agrupados: ' + r.nAgrup);
                txtLines.push('Temperatura ambiente: ' + r.temp + '°C');
                txtLines.push('FCT = ' + r.FCT.toFixed(2));
                txtLines.push('FCA = ' + r.FCA.toFixed(2) + (r.fcaInformado ? ' (informado na planilha)' : ' (Tabela 42)'));
                txtLines.push('FC = FCT * FCA = ' + r.FC.toFixed(4));
                txtLines.push('');
                txtLines.push('Ib = S/E = ' + r.S + '/' + r.V + ' = ' + r.Ib.toFixed(4) + ' A');
                txtLines.push('');
                txtLines.push('Critério da corrente:');
                txtLines.push('Iz (corrente corrigida) = ' + r.Ib.toFixed(2) + ' / ' + r.FC.toFixed(3) + ' = ' + r.Icorr.toFixed(3) + ' A');
                txtLines.push('Pela ' + r.tabelaLabel + ' — ' + condStr + ', seção ' + r.secao + ' mm²');
                txtLines.push('Iz cabo = ' + r.capSel.toFixed(1) + ' * ' + r.FC.toFixed(4) + ' = ' + r.IzCabo.toFixed(3) + ' A');
                txtLines.push('');
                txtLines.push('Cálculo da queda de tensão:');
                txtLines.push('ΔV% = (2·ρ·L·I)/(S·E)×100  [ρ(Cu)=0,0172 Ω·mm²/m]');
                txtLines.push('ΔV% = 2 * ' + r.rho + ' * ' + r.L + ' * ' + r.Ib.toFixed(4) + ' / (' + r.secao + ' * ' + r.V + ') * 100');
                const num2 = 2 * r.rho * r.L * r.Ib;
                const den2 = r.secao * r.V;
                txtLines.push('ΔV% = ' + num2.toFixed(6) + ' / ' + den2 + ' * 100');
                txtLines.push('ΔV% = ' + r.deltaVPerc.toFixed(3) + '% ' + (ΔVok ? '✓ OK (≤ 4%)' : '✗ EXCEDE 4%'));
                txtLines.push('');
                txtLines.push('Dimensionamento do disjuntor:');
                txtLines.push('Ib ≤ Ind ≤ Iz cabo');
                txtLines.push(r.Ib.toFixed(2) + ' A ≤ ' + r.Ind + ' A ≤ ' + r.IzCabo.toFixed(3) + ' A');
                txtLines.push('Ind = ' + r.Ind + ' A  ' + (coordOK ? '✓ Coordenação OK' : '✗ Verificar coordenação'));
                if (r.secaoAumentada) txtLines.push('⚠ Seção aumentada para ' + r.secao + ' mm² para atender coordenação.');
                txtLines.push('');

                // HTML card
                const numColors = ['#1a6fd4', '#e85d20', '#059669', '#7c3aed', '#d97706', '#0891b2', '#dc2626', '#65a30d', '#9333ea', '#0369a1'];
                const col = numColors[(idx) % numColors.length];
                htmlOut += `<div style="border-left:4px solid ${col};padding:.8rem 1rem;margin-bottom:1rem;background:var(--surface2);border-radius:0 10px 10px 0">`;
                htmlOut += `<div style="font-weight:800;font-size:.95rem;color:${col};margin-bottom:.5rem">▸ ${mcCircLabel(c, idx).toUpperCase()}</div>`;
                htmlOut += `<table style="width:100%;border-collapse:collapse;font-size:.78rem">`;
                const rows = [
                    ['S (Potência aparente)', r.S + ' VA'],
                    ['E (Tensão)', r.V + ' V — ' + sistStr],
                    ['FP (Fator de potência)', r.fp.toFixed(2)],
                    ['L (Comprimento)', r.L + ' m'],
                    ['Método', (r.metodoLabel || r.metodo) + ' | Agrup.: ' + r.nAgrup + ' | Temp.: ' + r.temp + '°C'],
                    ['FCT', r.FCT.toFixed(2)],
                    ['FCA', r.FCA.toFixed(2)],
                    ['FC = FCT × FCA', r.FC.toFixed(4)],
                    ['Ib = S / E', r.Ib.toFixed(4) + ' A'],
                    ['Iz\' (corrente corrigida)', r.Icorr.toFixed(3) + ' A'],
                    ['Seção selecionada', r.secao + ' mm² (' + matStr + ')' + (r.secaoAumentada ? ' ⬆ aumentada' : '')],
                    ['Iz cabo (corrente do cabo)', r.IzCabo.toFixed(3) + ' A'],
                    ['ΔV%', r.deltaVPerc.toFixed(3) + '% ' + (ΔVok ? '✅ ≤ 4%' : '⚠ > 4%')],
                    ['Ind (disjuntor)', r.Ind + ' A curva C'],
                    ['Coordenação Ib ≤ Ind ≤ Iz', r.Ib.toFixed(2) + ' ≤ ' + r.Ind + ' ≤ ' + r.IzCabo.toFixed(2) + (coordOK ? ' ✅' : ' ⚠')],
                ];
                rows.forEach((row, i) => {
                    const bg = i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)';
                    htmlOut += `<tr><td style="padding:.25rem .5rem;background:${bg};color:var(--text-dim)">${row[0]}</td>
                                    <td style="padding:.25rem .5rem;background:${bg};color:var(--text);font-weight:600">${row[1]}</td></tr>`;
                });
                htmlOut += '</table></div>';
            });

            htmlOut += `<div style="text-align:right;color:var(--text-dim);font-size:.72rem;margin-top:1rem;border-top:1px solid var(--border);padding-top:.7rem">
                Gerado por Eletrotécnica — Módulos Interativos | ${data}
            </div>`;
            htmlOut += '</div>';

            // Botão download TXT
            const txtContent = txtLines.join('\n');
            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            htmlOut += `<div style="margin-top:.8rem;display:flex;gap:.7rem;flex-wrap:wrap">
                <a href="${url}" download="circuitos_dimensionamento.txt" class="btn" style="text-decoration:none" data-eo-action="predial:download-report-txt" data-eo-feature="relatorio-txt"><i data-eo-icon=download></i> Baixar TXT</a>
                <button type="button" class="btn secondary" onclick="EOLicense.printPage()" data-eo-action="predial:print-page"><i data-eo-icon=printer></i> Imprimir Página</button>
            </div>`;

            const out = document.getElementById('mc-output');
            out.style.display = '';
            out.innerHTML = htmlOut;
            out.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

// ─── EXPORTAR PDF (versão original colorida) ─────────────────
async function mcExportPDFOriginal(opts = {}) {
            const license = await EOLicense.requireUser();
            if (!license) return;
            const returnBlob = !!opts.returnBlob;
            mcCalcAll();

            // Mantem o PDF em texto ASCII para evitar falha de encoding da fonte no jsPDF
            const safe = (s) => window.__pdfSafeText ? window.__pdfSafeText(s) : String(s).replace(/\u00a0/g, ' ');

            const projetistaTog = document.getElementById('mc-projetista-toggle');
            const isProjetista = projetistaTog ? projetistaTog.checked : false;
            const tituloAluno = isProjetista ? 'Projetista' : 'Aluno';
            const aluno = safe((document.getElementById('mc-aluno').value || 'Nao informado').trim());
            const obra = safe((document.getElementById('mc-obra').value || 'Nao informado').trim());
            const profToggle = document.getElementById('mc-prof-toggle');
            const inclProf = profToggle ? profToggle.checked : true;
            const prof = inclProf ? safe((document.getElementById('mc-prof').value || 'Nao informado').trim()) : null;
            const data = safe((document.getElementById('mc-data').value || new Date().toLocaleDateString('pt-BR')).trim());

            // Carrega jsPDF dinamicamente
            if (!window.jspdf) {
                await EO.load('jspdf');
            }
            const { jsPDF } = window.jspdf;
            try { if (window.__ensureUnicodePdfFont) await window.__ensureUnicodePdfFont(); } catch(e) { console.warn("Font preload falhou:", e); }
            const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const PW = 210, PH = 297;
            const _CUSTOM_PDF = !!(window.__customPdfFont && window.__customPdfFont.normal);
            // "ΔV%" se a fonte personalizada tiver o símbolo Δ; senão "DV%"
            const DVL = (_CUSTOM_PDF && window.__customFontCovers && window.__customFontCovers(0x394)) ? 'ΔV' : 'DV';
            const ML = _CUSTOM_PDF ? 14 : 20, MR = _CUSTOM_PDF ? 9 : 20, MT = 22;
            const usableW = PW - ML - MR;
            let y = MT;

            // Paleta de cores
            const DARK = [30, 30, 30];
            const BLUE = [26, 111, 212];
            const GRAY = [110, 110, 110];
            const LGRAY = [242, 242, 242];
            const WHITE = [255, 255, 255];
            const CRED = [160, 30, 30];
            const CGRN = [5, 110, 60];
            const BGGRN = [220, 245, 230];
            const BGRED = [250, 220, 220];

            // ── Escala efetiva da fonte ───────────────────────────────────
            // (escala escolhida no modal x tamanho da fonte personalizada). Todo o layout usa
            // esse fator: se a fonte crescer, o texto vai para a lateral ou desce para a
            // linha de baixo em vez de ficar sobreposto.
            doc.setFontSize(9);
            const FK = Math.max(0.5, (doc.getFontSize() / 9) || 1);
            const FKG = Math.max(1, FK);   // espacamentos so crescem (nunca ficam menores que o original)
            // SP = fator dos espacamentos entre linhas. Com fonte personalizada a entrelinha
            // passa a ser calculada pela altura real da fonte (em) + folga da "escrita torta",
            // em vez de crescer junto com o tamanho -> sem espaco sobrando e sem sobreposicao.
            const _wDy = [0, .035, .06, .09][(window.__mcWobble | 0)] || 0;
            const _LK = 1.02 + 1.5 * _wDy + ((window.__mcWobble | 0) ? 0.1 : 0);   // entrelinha em "em"
            const SP = _CUSTOM_PDF ? Math.max(0.6, FK * _LK / 1.827) : FKG;

            // Altura de uma linha de texto normal (fonte 9)
            const LH = 5.8 * SP;

            // ── Escrita a mao: margem irregular + folga para a "escrita torta" ──
            // A margem esquerda de cada linha varia um pouco (como num caderno); a amplitude
            // acompanha o nivel de "Escrita torta" (0 = margem exata).
            const _wobLv = (window.__mcWobble | 0);
            const MARGIN_AMP = [0, 0.9, 1.7, 2.9][_wobLv] || 0;      // mm
            const WSLACK = [0, 1, 2, 3][_wobLv] || 0;                // mm de folga p/ espacos esticados
            const _hash = (window.ElectroFontVariants && window.ElectroFontVariants.hash)
                || (str => { let h = 7; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; });
            const rnd = (tag) => (_hash('mg|' + tag) % 2001) / 1000 - 1;   // -1 .. 1, estavel para a mesma posicao
            let _lineNo = 0;
            const marginJitter = () => {
                if (!MARGIN_AMP) return 0;
                const i = _lineNo++;
                const pg = doc.internal.getCurrentPageInfo().pageNumber;
                const r1 = rnd(pg + '|' + i + '|' + Math.round(y * 10));
                return MARGIN_AMP * (0.7 * r1 + 0.3 * Math.sin(i * 0.6));   // aleatorio + leve "ondulacao" entre linhas
            };
            // Largura util de uma linha que comeca em ML + recuo (com folga para a margem irregular)
            // Com fonte personalizada o texto pode avancar sobre parte da margem direita (fica ~3 mm da borda)
            const EXTRA_R = _CUSTOM_PDF ? 6 : 0;
            const lineW = (ind) => usableW + EXTRA_R - (ind || 0) - (_CUSTOM_PDF ? (MARGIN_AMP + WSLACK) * 0.25 : MARGIN_AMP + WSLACK);

            // Quebra o texto em linhas que caibam em maxW (mm) com a fonte/tamanho atuais.
            // Palavras maiores que a linha inteira sao quebradas por caractere.
            const wrapText = (txt, maxW) => {
                txt = safe(txt);
                if (!(maxW > 1)) return [txt];
                const tw = (s) => doc.getTextWidth(s);
                if (tw(txt) <= maxW) return [txt];
                const out = [];
                let cur = '';
                const flush = () => { out.push(cur.replace(/ +$/, '')); cur = ''; };
                txt.split(/( +)/).forEach(tok => {
                    if (!tok) return;
                    if (tok.charAt(0) === ' ') { if (cur) cur += tok; return; }   // sem espaco no inicio da linha
                    if (tw(cur + tok) <= maxW) { cur += tok; return; }
                    if (cur) flush();
                    if (tw(tok) <= maxW) { cur = tok; return; }
                    let piece = '';
                    for (const ch of tok) {
                        if (piece && tw(piece + ch) > maxW) { out.push(piece); piece = ''; }
                        piece += ch;
                    }
                    cur = piece;
                });
                if (cur) flush();
                return out.length ? out : [txt];
            };

            // ── Rodape: reserva espaco (pode ocupar mais de uma linha se a fonte for grande) ──
            const _MANU = ['caderno', 'manu_eco', 'manu_passos'].indexOf(opts.style) >= 0;
            const _hideCredits = !!opts.hideCredits || _MANU;
            const FOOT_FS = 7.5;
            const footLH = 3.6 * SP;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(FOOT_FS);
            const footRightW = doc.getTextWidth('Página 99 de 99');
            const footLines = _hideCredits ? [] : wrapText('Eletrotécnica - Módulos Interativos | Aluno: ' + aluno + ' | ' + data, usableW - footRightW - 4);
            const FOOT_H = Math.max(12, 5 + (Math.max(footLines.length, 1) - 1) * footLH + 2.2 * FKG + 2.5);
            const BOTTOM = PH - FOOT_H - 4;

            // Garante espaco na pagina; se nao tiver, adiciona nova
            let _curCirc = null;
            const _pageCircs = {};
            const ensurePage = (need) => {
                if (y + need > BOTTOM) { doc.addPage(); y = MT; }
                if (_curCirc) {
                    const pg = doc.internal.getCurrentPageInfo().pageNumber;
                    (_pageCircs[pg] = _pageCircs[pg] || []);
                    if (_pageCircs[pg].indexOf(_curCirc) < 0) _pageCircs[pg].push(_curCirc);
                }
            };

            // Linha horizontal
            const hline = (yy, thick, cr, cg, cb) => {
                doc.setDrawColor(cr || 180, cg || 180, cb || 180);
                doc.setLineWidth(thick || 0.25);
                doc.line(ML, yy, PW - MR, yy);
            };

            // Escreve uma linha de texto simples e avanca y (se nao couber, continua na linha de baixo)
            const writeLine = (txt, bold, color, indent) => {
                const ind = indent || 0;
                doc.setFont('helvetica', bold ? 'bold' : 'normal');
                const lines = wrapText(txt, lineW(ind));
                lines.forEach(ln => {
                    ensurePage(LH + 1);
                    doc.setFont('helvetica', bold ? 'bold' : 'normal');
                    doc.setTextColor(...(color || DARK));
                    doc.text(ln, ML + ind + marginJitter(), y);
                    y += LH;
                });
            };

            // Escreve par "Label    Valor" na mesma linha usando duas chamadas de texto.
            // labelW = largura minima em mm reservada ao label antes do valor. Se o label for
            // mais largo (fonte grande), o valor e empurrado para a lateral; se o valor nao
            // couber no resto da linha, ele continua na linha de baixo (sem sobrepor nada).
            const writeKV = (label, val, labelW, bold) => {
                const lw = labelW || 52;
                label = safe(label);
                val = safe(String(val));
                const slack = _CUSTOM_PDF ? (MARGIN_AMP * 1.7 + WSLACK) * 0.25 - EXTRA_R : MARGIN_AMP * 1.7 + WSLACK;      // folga: margem irregular + deslocamento do valor
                doc.setFont('helvetica', bold ? 'bold' : 'normal');
                const colOff = Math.max(lw, doc.getTextWidth(label) + 1.8);
                doc.setFont('helvetica', 'normal');
                const avail = usableW - colOff - slack;
                let vOff = colOff, sameLine = true, lines;
                if (avail >= usableW * (_CUSTOM_PDF ? 0.25 : 0.35) || doc.getTextWidth(val) <= avail) {
                    lines = wrapText(val, avail);
                } else {
                    // coluna do valor ficou estreita demais: o valor desce para a linha de baixo, recuado
                    sameLine = false; vOff = 4;
                    lines = wrapText(val, usableW - vOff - slack);
                }
                ensurePage(LH + 1);
                const jx = marginJitter();
                const vj = MARGIN_AMP ? MARGIN_AMP * 0.35 * (rnd('v|' + _lineNo + '|' + Math.round(y * 10)) + 1) : 0;
                doc.setFont('helvetica', bold ? 'bold' : 'normal');
                doc.setTextColor(...DARK);
                doc.text(label, ML + jx, y);
                doc.setFont('helvetica', 'normal');
                if (sameLine) doc.text(lines[0], ML + jx + vOff + vj, y);
                y += LH;
                (sameLine ? lines.slice(1) : lines).forEach(ln => {
                    ensurePage(LH + 1);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...DARK);
                    doc.text(ln, ML + vOff + marginJitter(), y);
                    y += LH;
                });
            };

            // Faixa colorida com texto (resultado OK/EXCEDE etc.): cresce e quebra linha se o texto nao couber
            const drawBar = (txt, bg, fg) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                const lines = wrapText(txt, usableW - 6);
                const bLH = 4.6 * SP;
                const base = 3.1 + 2.4 * FKG;                 // linha de base da 1a linha, a partir do topo da faixa (5,5 mm com a fonte original)
                const H = Math.max(7.5, base + 1.37 + 0.64 * FKG + (lines.length - 1) * bLH);
                ensurePage(H + 1.5);
                doc.setFillColor(...bg);
                doc.rect(ML, y - 1, usableW, H, 'F');
                doc.setTextColor(...fg);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                lines.forEach((ln, i) => doc.text(ln, ML + 3, y - 1 + base + i * bLH));
                doc.setTextColor(...DARK);
                y += H + 3.5 + 3.6 * (SP - 1);                 // 11 mm com a fonte original
            };

            // ── CABECALHO ─────────────────────────────────────────────────
            const _CAD = _MANU;
            const _ttlOn = !_CAD && window.__mcTitleOn !== false;
            const _ttlTxt = safe(String(window.__mcTitleText == null ? 'DIMENSIONAMENTO DE CIRCUITOS ELETRICOS - NBR 5410' : window.__mcTitleText).trim());
            const _hdrOn = !_CAD && window.__mcHeaderOn !== false;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            const tLines = (_ttlOn && _ttlTxt) ? wrapText(_ttlTxt, PW - 20 - 2 * WSLACK) : [];
            if (tLines.length) {
            const tLH = 5 * SP;
            const tBase = 5.7 + 2.8 * FKG;                       // 8,5 mm com a fonte original
            const hdrH = Math.max(13, tBase + 3.76 + 0.74 * FKG + (tLines.length - 1) * tLH);
            doc.setFillColor(...BLUE);
            doc.rect(0, 0, PW, hdrH, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(...WHITE);
            tLines.forEach((ln, i) => doc.text(ln, PW / 2, tBase + i * tLH, { align: 'center' }));

            y = hdrH + 5;
            } else { y = MT; }
            if (_hdrOn) {

            // ── DADOS DO PROJETO ─────────────────────────────────────────
            // Rotulos e valores se ajustam a fonte: o valor vai para a lateral se o rotulo for
            // largo, e desce para a linha de baixo se nao couber.
            doc.setFontSize(9);
            const projRows = [[tituloAluno + ':', aluno], ['Projeto:', obra]];
            if (inclProf) projRows.push(['Professor:', prof]);
            doc.setFont('helvetica', 'bold');
            const labMax = Math.max.apply(null, projRows.map(rw => doc.getTextWidth(rw[0])).concat([doc.getTextWidth('Data:')]));
            const dLabW = doc.getTextWidth('Data:');
            const col1x = ML + 3;
            const col2x = Math.max(ML + 22, col1x + labMax + 2.5);
            doc.setFont('helvetica', 'normal');
            const dValW = doc.getTextWidth(data);
            const dGap = Math.max(18, dLabW + 2.5);
            const col3x = Math.min(ML + 90, PW - MR - 3 - dGap - dValW);
            const col4x = col3x + dGap;
            // se a data nao couber ao lado do 1o valor, ela ganha uma linha propria
            const dataOwnRow = (col3x - 3 - col2x) < 30;
            if (dataOwnRow) projRows.push(['Data:', data]);
            const projLines = projRows.map((rw, i) =>
                wrapText(rw[1], ((i === 0 && !dataOwnRow) ? col3x - 3 : PW - MR - 3) - col2x));
            const rowLH = 6 * SP;
            const nLines = projLines.reduce((a, l) => a + l.length, 0);
            const base0 = 3.6 + 2.4 * FKG;                       // 6 mm com a fonte original
            const boxH = base0 + (nLines - 1) * rowLH + 3.36 + 0.64 * FKG;   // 22 / 16 mm com a fonte original

            doc.setFillColor(...LGRAY);
            doc.rect(ML, y, usableW, boxH, 'F');
            doc.setFontSize(9);
            doc.setTextColor(...DARK);
            let by = y + base0;
            projRows.forEach((rw, i) => {
                doc.setFont('helvetica', 'bold');
                doc.text(rw[0], col1x, by);
                doc.setFont('helvetica', 'normal');
                projLines[i].forEach((ln, k) => doc.text(ln, col2x, by + k * rowLH));
                if (i === 0 && !dataOwnRow) {
                    doc.setFont('helvetica', 'bold');
                    doc.text('Data:', col3x, by);
                    doc.setFont('helvetica', 'normal');
                    doc.text(data, col4x, by);
                }
                by += projLines[i].length * rowLH;
            });

            y += boxH + 5;
            }

            // ── CIRCUITOS ─────────────────────────────────────────────────
            const circColors = [
                [26, 111, 212], [220, 70, 20], [5, 140, 90], [110, 50, 210],
                [200, 110, 0], [0, 130, 160], [200, 30, 30], [80, 150, 0],
                [130, 40, 200], [0, 90, 150]
            ];

            doc.setFontSize(9);

            // ── Linhas "manuscritas" compartilhadas: Caderno, Compacto e os modelos Manuscrito ──
            // Com a fonte personalizada, a ordem dos dados varia de um bloco para outro
            // (E/S/L entre si e FCt/FCA/FC/IB entre si). Os valores são sempre os do cálculo.
            const mnb = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '-'; };
            const mnbs = (v) => String(+(+v).toFixed(4)).replace('.', ',');
            const mshuf = (a) => {
                if (!_CUSTOM_PDF) return a;
                const b = a.slice();
                for (let i = b.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const tmp = b[i]; b[i] = b[j]; b[j] = tmp;
                }
                return b;
            };
            const manuCalc = (r) => {
                const t = r.tentFinal;
                const tri = r.sistema === 'tri';
                const mult = tri ? Math.sqrt(3) : 2;
                const den = t.secao * r.V;
                const dv = (mult * r.rho * r.L * r.Ib) / den * 100;
                const dvOk = dv <= 4;
                const coordOk = !!t.Ind && r.Ib <= t.Ind && t.Ind <= t.IzCabo;
                return { t, tri, multTxt: tri ? '1,732' : '2', den, dv, dvOk, coordOk };
            };
            // Caderno (uma linha por dado)
            const cadernoLines = (r) => {
                const m = manuCalc(r), t = m.t;
                const ok = m.dvOk && t.ok !== false;
                const out = [].concat(
                    mshuf(['S = ' + mnbs(r.S) + ' VA', 'E = ' + mnbs(r.V) + 'V', 'L = ' + mnbs(r.L) + ' m']),
                    ['Instalação: ' + r.metodo + ' (tab 33)', 'nº de circuitos agrupados: ' + r.nAgrup],
                    mshuf(['FCt = ' + mnb(r.FCT, 2), 'FCA = ' + mnb(r.FCA, 2), 'FC = ' + mnb(r.FC, 3), 'IB = ' + mnb(r.Ib, 2)]),
                    ['Iz corrigida = ' + mnb(r.Icorr, 2),
                     'Iz tabela x FC = ' + mnb(t.IzCabo, 3) + ' (' + mnbs(t.capSel) + '·' + mnb(r.FC, 3) + ')']
                );
                if (Number(r.secaoMinNBR) !== Number(t.secao)) out.push('Seção mínima: ' + mnbs(r.secaoMinNBR) + ' mm²');
                out.push('Seção adotada: ' + mnbs(t.secao) + ' mm²');
                out.push('ΔV% = (' + m.multTxt + '·' + mnbs(r.rho) + '·' + mnbs(r.L) + '·' + mnb(r.Ib, 2) + ')/' + mnbs(m.den) + '·100');
                out.push('ΔV% = ' + mnb(m.dv, 2) + '% → ' + (ok ? 'Aprovado' : 'Reprovado'));
                // Critério de seleção do disjuntor: IB ≤ In ≤ Iz
                out.push('Critério do disjuntor: IB ≤ In ≤ Iz');
                out.push(t.Ind
                    ? 'IB ≤ In ≤ Iz → ' + mnb(r.Ib, 2) + ' ≤ ' + mnbs(t.Ind) + ' ≤ ' + mnb(t.IzCabo, 2)
                    : 'IB ≤ In ≤ Iz → ' + mnb(r.Ib, 2) + ' ≤ In ≤ ' + mnb(t.IzCabo, 2));
                out.push('Disjuntor = ' + (t.Ind ? t.Ind + ' A (curva ' + r.curvaDisj + ')' : 'sem disjuntor padronizado'));
                return out;
            };
            // Manuscrito econômico: dados agrupados por linha (7 linhas por circuito)
            const ecoLines = (r) => {
                const m = manuCalc(r), t = m.t;
                const out = [
                    mshuf(['S = ' + mnbs(r.S) + ' VA', 'E = ' + mnbs(r.V) + ' V', 'L = ' + mnbs(r.L) + ' m']).join(', '),
                    mshuf(['FCt = ' + mnb(r.FCT, 2), 'FCA = ' + mnb(r.FCA, 2), 'FC = ' + mnb(r.FC, 3), 'IB = ' + mnb(r.Ib, 2) + ' A']).join(', '),
                    'Instalação ' + r.metodo + ' (tab 33), ' + r.nAgrup + ' circ. agrupados',
                    "I' = IB/FC = " + mnb(r.Ib, 2) + '/' + mnb(r.FC, 3) + ' = ' + mnb(r.Icorr, 2) + ' A → seção '
                        + mnbs(t.secao) + ' mm²' + (Number(r.secaoMinNBR) !== Number(t.secao) ? ' (mín. ' + mnbs(r.secaoMinNBR) + ')' : ''),
                    'Iz = ' + mnbs(t.capSel) + '·' + mnb(r.FC, 3) + ' = ' + mnb(t.IzCabo, 2) + ' A',
                    'IB ≤ In ≤ Iz: ' + mnb(r.Ib, 2) + ' ≤ ' + (t.Ind ? mnbs(t.Ind) : 'In') + ' ≤ ' + mnb(t.IzCabo, 2)
                        + ' → ' + (m.coordOk ? 'Atende' : 'NÃO atende') + (t.Ind ? ' (disjuntor ' + t.Ind + ' A, curva ' + r.curvaDisj + ')' : ''),
                    'ΔV% = (' + m.multTxt + '·' + mnbs(r.rho) + '·' + mnbs(r.L) + '·' + mnb(r.Ib, 2) + ')/' + mnbs(m.den) + '·100 = '
                        + mnb(m.dv, 2) + '% ' + (m.dvOk ? '≤ 4% → Atende' : '> 4% → NÃO atende')
                ];
                return out;
            };
            // Manuscrito passo a passo: etapas numeradas com os critérios verificados
            const passosLines = (r) => {
                const m = manuCalc(r), t = m.t;
                return [
                    '1) IB = ' + (m.tri ? 'S/(1,732·E) = ' + mnbs(r.S) + '/(1,732·' + mnbs(r.V) + ')' : 'S/E = ' + mnbs(r.S) + '/' + mnbs(r.V)) + ' = ' + mnb(r.Ib, 2) + ' A',
                    '2) FC = FCt·FCA = ' + mnb(r.FCT, 2) + '·' + mnb(r.FCA, 2) + ' = ' + mnb(r.FC, 3),
                    "3) I' = IB/FC = " + mnb(r.Ib, 2) + '/' + mnb(r.FC, 3) + ' = ' + mnb(r.Icorr, 2) + ' A',
                    '4) Seção ' + mnbs(t.secao) + ' mm² → Ic = ' + mnbs(t.capSel) + " A ≥ I' = " + mnb(r.Icorr, 2) + ' A',
                    '5) Iz = Ic·FC = ' + mnbs(t.capSel) + '·' + mnb(r.FC, 3) + ' = ' + mnb(t.IzCabo, 2) + ' A',
                    '6) IB ≤ In ≤ Iz → ' + mnb(r.Ib, 2) + ' ≤ ' + (t.Ind ? mnbs(t.Ind) : 'In') + ' ≤ ' + mnb(t.IzCabo, 2)
                        + (m.coordOk ? '  Atende' : '  NÃO atende'),
                    '    Disjuntor ' + (t.Ind ? t.Ind + ' A, curva ' + r.curvaDisj : 'não padronizado'),
                    '7) ΔV% = (' + m.multTxt + '·' + mnbs(r.rho) + '·' + mnbs(r.L) + '·' + mnb(r.Ib, 2) + ')/(' + mnbs(t.secao) + '·' + mnbs(r.V) + ')·100',
                    '    ΔV% = ' + mnb(m.dv, 2) + '% ' + (m.dvOk ? '≤ 4%  Atende' : '> 4%  NÃO atende')
                ];
            };

            // Modelo compacto: dois circuitos por linha, apenas dados e verificações finais.
            // ── Modelo "Caderno": folha em branco igual ao caderno manuscrito (modelo da foto) ──
            // Título com o(s) número(s) do(s) circuito(s), uma linha por dado, cálculo da queda de
            // tensão e disjuntor. Circuitos seguidos com os mesmos dados são agrupados sob um título.
            if (_MANU) {
                const nb = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '-'; };
                const nbs = (v) => String(+(+v).toFixed(4)).replace('.', ',');
                const joinE = (arr) => arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];
                const items = mcCircuits.map((c, idx) => {
                    const r = mcCalcOne(c);
                    const numero = (c.numero !== undefined && c.numero !== null && String(c.numero).trim() !== '')
                        ? String(c.numero).trim() : String(idx + 1);
                    return { c, idx, r, numero, nome: (c.nome || '').trim() };
                });
                const sigOf = (it) => [it.r.S, it.r.V, it.r.sistema, it.r.metodo, it.r.nAgrup, it.r.temp,
                    it.r.material, it.r.isolacao, it.r.tipo, it.r.fp, it.r.FCA].join('|');
                const groups = [];
                items.forEach(it => {
                    const g = groups[groups.length - 1];
                    if (g && sigOf(g[0]) === sigOf(it)) g.push(it); else groups.push([it]);
                });

                // Linhas de dados de um circuito: depende do modelo escolhido
                const _lineFn = opts.style === 'manu_eco' ? ecoLines : (opts.style === 'manu_passos' ? passosLines : cadernoLines);
                const blockLines = (it) => _lineFn(it.r);

                // Plano: um título por grupo; se o comprimento muda entre os circuitos do grupo,
                // cada um ganha seu bloco com "• nome" (como "máquina de solda 1 / 2" da foto).
                const plan = groups.map(g => {
                    const nomes = g.map(it => it.nome).filter(Boolean);
                    const head = joinE(g.map(it => it.numero)) + ' - ' + (g.length > 1 ? 'Circuitos' : 'Circuito') + (nomes.length ? ' ' + joinE(nomes) : '');
                    const sameL = g.every(it => it.r.L === g[0].r.L);
                    const parts = sameL
                        ? [{ bullet: null, lines: blockLines(g[0]) }]
                        : g.map(it => ({ bullet: it.nome || ('Circuito ' + it.numero), lines: blockLines(it) }));
                    return { head, nums: g.map(it => it.idx + 1), parts };
                });

                const FS = 12;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(FS);
                const NLH = Math.max(6.2, doc.getFontSize() * 0.3528 * (_CUSTOM_PDF ? (_LK + 0.3) : 1.5));
                const cSlack = _CUSTOM_PDF ? (MARGIN_AMP + WSLACK) * 0.25 : MARGIN_AMP + WSLACK;
                const gapC = 10;
                const colW2 = (usableW - gapC) / 2;
                // Duas colunas (a folha continua na lateral, como na foto) se as linhas couberem; senão, coluna única
                let maxW = 0;
                plan.forEach(p => p.parts.forEach(pt => pt.lines.forEach(l => { maxW = Math.max(maxW, doc.getTextWidth(l)); })));
                const colCount = (maxW + cSlack + 1 <= colW2) ? 2 : 1;
                const cw = colCount === 2 ? colW2 : usableW + EXTRA_R;
                let col = 0;
                const colX = () => ML + col * (cw + gapC);
                const advance = (need) => {
                    if (y + need > BOTTOM) {
                        if (colCount === 2 && col === 0) { col = 1; y = MT; }
                        else { doc.addPage(); col = 0; y = MT; }
                    }
                };
                const mark = (nums) => {
                    const pg = doc.internal.getCurrentPageInfo().pageNumber;
                    const a = _pageCircs[pg] = _pageCircs[pg] || [];
                    nums.forEach(n => { if (a.indexOf(n) < 0) a.push(n); });
                };
                const put = (txt, ind, nums) => {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(FS);
                    const lines = wrapText(txt, cw - ind - cSlack);
                    lines.forEach((ln, i) => {
                        advance(NLH);
                        mark(nums);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(FS);
                        doc.setTextColor(...DARK);
                        doc.text(ln, colX() + ind + (i ? 4 : 0) + marginJitter(), y);
                        y += NLH;
                    });
                };
                plan.forEach((p, gi) => {
                    advance(NLH * 4);   // não deixa o título sozinho no fim da coluna
                    put(p.head, 0, p.nums);
                    y += NLH * 0.3;
                    p.parts.forEach((pt, k) => {
                        if (pt.bullet) put('• ' + pt.bullet, 0, p.nums);
                        pt.lines.forEach(l => put(l, 0, p.nums));
                        if (k < p.parts.length - 1) y += NLH * 0.6;
                    });
                    y += NLH * 0.9;
                });
            } else
            if (opts.style === 'compacto') {
                const gap = 7;
                const colW = (usableW - gap) / 2;
                const inset = 3 + MARGIN_AMP;
                const textW = colW - inset * 2 - WSLACK;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10.5);
                const compactLH = Math.max(4.5, doc.getFontSize() * 0.3528 * (_CUSTOM_PDF ? _LK : 1.3));
                const compactLimit = BOTTOM - 2;
                const prepare = (c, idx) => {
                    const r = mcCalcOne(c);
                    const numero = (c.numero !== undefined && c.numero !== null && String(c.numero).trim() !== '')
                        ? String(c.numero).trim() : String(idx + 1);
                    const nome = (c.nome || '').trim();
                    const rows = [numero + ' - Circuito' + (nome ? ' ' + nome : '')].concat(cadernoLines(r));
                    return rows.flatMap(text => {
                        doc.setFont('helvetica', 'normal');
                        return wrapText(text, textW).map(text => ({ text, bold: false }));
                    });
                };
                for (let idx = 0; idx < mcCircuits.length; idx += 2) {
                    const pair = mcCircuits.slice(idx, idx + 2).map((c, offset) => ({ num: idx + offset + 1, lines: prepare(c, idx + offset) }));
                    const maxLines = Math.max(...pair.map(c => c.lines.length));
                    const totalH = maxLines * compactLH + 7;
                    if (y + Math.min(totalH, compactLimit - MT) > compactLimit) { doc.addPage(); y = MT; }
                    let start = 0;
                    while (start < maxLines) {
                        const count = Math.max(1, Math.min(maxLines - start, Math.floor((compactLimit - y - 7) / compactLH)));
                        const blockH = count * compactLH + 3;
                        pair.forEach((circ, colIdx) => {
                            if (start >= circ.lines.length) return;
                            const pg = doc.internal.getCurrentPageInfo().pageNumber;
                            const nums = _pageCircs[pg] = _pageCircs[pg] || [];
                            if (!nums.includes(circ.num)) nums.push(circ.num);
                            const x = ML + colIdx * (colW + gap);
                            circ.lines.slice(start, start + count).forEach((ln, n) => {
                                doc.setFont('helvetica', ln.bold ? 'bold' : 'normal');
                                doc.setTextColor(...DARK);
                                doc.text(ln.text, x + inset + marginJitter(), y + compactLH * (n + 0.8));
                            });
                        });
                        y += blockH + 4;
                        start += count;
                        if (start < maxLines) { doc.addPage(); y = MT; }
                    }
                }
            } else {
            mcCircuits.forEach((c, idx) => {
                const r = mcCalcOne(c);
                const num = idx + 1;
                _curCirc = num;
                const dvOk = r.deltaVPerc <= 4;
                const coordOK = r.Ib <= r.Ind && r.Ind <= r.IzCabo;
                const col = circColors[idx % circColors.length];

                // numerador e denominador da formula de queda de tensao
                const numerador = 2 * r.rho * r.L * r.Ib;          // 2*rho*L*I
                const denominador = r.secao * r.V;                    // S*E
                // DV% = numerador/denominador * 100
                const dvCalc = (numerador / denominador) * 100;

                // ── Titulo do circuito (a faixa cresce e quebra linha se o titulo nao couber)
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                const cLines = wrapText(mcCircLabel(c, idx), usableW - 8);
                const cLH = 5 * SP;
                const cBase = 2.95 + 2.65 * FKG;                 // 5,6 mm com a fonte original
                const cH = Math.max(8, cBase + 1.7 + 0.7 * FKG + (cLines.length - 1) * cLH);
                ensurePage(cH + 6);
                doc.setFillColor(...col);
                doc.rect(ML, y, usableW, cH, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...WHITE);
                cLines.forEach((ln, i) => doc.text(ln, ML + 4, y + cBase + i * cLH));
                y += cH + 3 + 3.6 * (SP - 1);                   // 3 mm com a fonte original
                doc.setFontSize(9);
                doc.setTextColor(...DARK);
                doc.setFont('helvetica', 'normal');

                // ── Dados do circuito (formato: label tab valor)
                const tipoLabel = {
                    iluminacao: 'Iluminação', tug: 'TUG (Tomada de uso geral)',
                    tue: 'TUE (Tomada uso específico)', ch: 'CH Elétrico'
                }[r.tipo] || r.tipo;
                writeKV('Tipo de circuito:', tipoLabel, 45);
                writeKV('S =', r.S + ' VA', 10);
                writeKV('E =', r.V + ' V', 10);
                writeKV('L =', r.L + ' m', 10);
                writeKV('Método de instalação:', (r.metodoLabel || r.metodo) + ' (tabela 33)', 55);
                writeKV('Número de circuitos agrupados:', String(r.nAgrup), 70);
                writeKV('Temperatura ambiente:', r.temp + ' °C', 55);
                writeKV('FCT =', r.FCT.toFixed(2), 10);
                writeKV('FCA =', r.FCA.toFixed(2) + (r.fcaInformado ? ' (planilha)' : ' (Tabela 42)'), 10);
                writeKV('FC =', 'FCT * FCA = ' + r.FC.toFixed(2), 10);
                y += 1;

                writeLine('Ib = S/E = ' + r.S + 'VA/' + r.V + 'V = ' + r.Ib.toFixed(2), true);
                writeKV('Seção mínima NBR 5410:', r.secaoMinLabel, 52);
                y += 2;

                // Escreve o cálculo completo para uma tentativa de seção
                const writeCalc = (t) => {
                    const num_ = 2 * r.rho * r.L * r.Ib, den_ = t.secao * r.V, dv_ = (num_ / den_) * 100;
                    writeLine('Critério da corrente:', true, BLUE);
                    writeLine('Iz (corrente corrigida) = ' + r.Ib.toFixed(2) + ' / ' + r.FC.toFixed(3) + ' = ' + r.Icorr.toFixed(3) + ' A', false);
                    writeLine('Pela ' + r.tabelaLabel + ' o circuito terá ' + r.condCarregados + ' condutores carregados', false);
                    writeLine('e seção de ' + t.secao + ' mm² com capacidade de conduzir ' + t.capSel.toFixed(0) + 'A.', false);
                    writeLine('Iz = ' + t.capSel.toFixed(0) + ' * ' + r.FC.toFixed(2) + ' = ' + t.IzCabo.toFixed(2), false);
                    if (!t.capOk) writeLine('Capacidade ' + t.capSel.toFixed(0) + ' A < ' + r.Icorr.toFixed(2) + ' A - NÃO ATENDE', true, CRED);
                    y += 2;
                    writeLine('Cálculo da queda de tensão:', true, BLUE);
                    writeLine(DVL + '% = (2*ρ(Cu)*L*I)/(S*E)*100  [MONO]   ρ(Cu) = 0,0172 Ω.mm²/m', false);
                    writeLine('Queda de tensão máxima 4% - circuitos terminais.', false);
                    writeLine('L - comprimento do circuito', false);
                    writeLine('I - corrente do circuito', false);
                    writeLine('S - seção do condutor', false);
                    writeLine('E - tensão do circuito', false);
                    writeLine(DVL + '% = 2*' + r.L + '*' + r.Ib.toFixed(2) + '*0,0172/(' + t.secao + '*' + r.V + ')*100 =', false);
                    writeLine(DVL + '% = ' + num_.toFixed(6) + '*100 / ' + den_ + ' =', false);
                    writeLine(DVL + '% = ' + (num_ * 100).toFixed(6) + ' / ' + den_ + ' = ' + dv_.toFixed(3) + '%', false);
                    y += 1;
                    const ok_ = t.dvOk;
                    drawBar((ok_ ? 'OK - ' + DVL + '%: ' : 'EXCEDE - ' + DVL + '%: ') + dv_.toFixed(3) + '% (limite: 4%)', ok_ ? BGGRN : BGRED, ok_ ? CGRN : CRED);
                    writeLine('Dimensionamento do disjuntor:', true, BLUE);
                    writeLine('Ib ≤ Ind ≤ Iz', false);
                    writeLine('Ib - Corrente de Projeto', false);
                    writeLine('Ind - Corrente nominal do disjuntor', false);
                    writeLine('Iz - Corrente do cabo', false);
                    writeLine(r.Ib.toFixed(2) + ' <= Ind <= ' + t.IzCabo.toFixed(2), true);
                    if (t.disjOk) writeLine('Ind = ' + t.Ind + ' A curva ' + r.curvaDisj, true);
                    else writeLine('Não existe disjuntor padronizado entre esses valores - NÃO ATENDE', true, CRED);
                };

                if (r.minNaoAtende && r.tentFinal.secao !== r.tentMin.secao) {
                    writeLine('1) Cálculo com a seção mínima de ' + r.tentMin.secao + ' mm²:', true, DARK);
                    y += 1;
                    writeCalc(r.tentMin);
                    const falhas = [];
                    if (!r.tentMin.capOk) falhas.push('capacidade de condução');
                    if (!r.tentMin.dvOk) falhas.push('queda de tensão');
                    if (!r.tentMin.disjOk) falhas.push('coordenação com o disjuntor');
                    y += 1;
                    drawBar(safe('A seção de ' + r.tentMin.secao + ' mm² não atende: ' + falhas.join(', ') + '.'), BGRED, CRED);
                    writeLine('2) Cálculo com a seção que atende: ' + r.tentFinal.secao + ' mm²', true, DARK);
                    y += 1;
                    writeCalc(r.tentFinal);
                } else {
                    writeCalc(r.tentFinal);
                }
                writeKV('Seção adotada:', r.secao + ' mm²', 30, true);

                // Separador entre circuitos: so o respiro vertical, sem linha
                y += 4;
                ensurePage(3);
                y += 7;
            });

            }

            // ── RODAPE em todas as paginas ────────────────────────────────
            const totalPages = doc.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p);
                if (!_hideCredits) {
                    doc.setFillColor(245, 245, 245);
                    doc.rect(0, PH - FOOT_H, PW, FOOT_H, 'F');
                    hline(PH - FOOT_H, 0.3, 180, 180, 180);
                }
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(FOOT_FS);
                doc.setTextColor(...GRAY);
                if (!_hideCredits) {
                    footLines.forEach((ln, i) => doc.text(ln, ML, PH - 5 - (footLines.length - 1 - i) * footLH));
                }
                const _pgMode = window.__mcPgMode || 'page';
                const _pgPos = window.__mcPgPos || 'right';
                const _cs = _pageCircs[p] || [];
                const _cTxt = _cs.length ? (_cs.length === 1 ? 'Circuito ' + _cs[0] : 'Circuitos ' + (_cs.length === 2 ? _cs[0] + ' e ' + _cs[1] : _cs[0] + ' a ' + _cs[_cs.length - 1])) : '';
                const _pTxt = 'Página ' + p + ' de ' + totalPages;
                let _lbl = '';
                if (_pgMode === 'page') _lbl = _pTxt;
                else if (_pgMode === 'circ') _lbl = _cTxt;
                else if (_pgMode === 'both') _lbl = _cTxt ? _cTxt + ' | ' + _pTxt : _pTxt;
                if (_lbl) {
                    if (_pgPos === 'center') doc.text(_lbl, PW / 2, PH - 5 + (footLines.length > 0 ? 0 : 0) - (footLines.length > 1 ? 0 : 0) - (footLines.length ? 3.6 * SP + 0.4 : 0), { align: 'center' });
                    else doc.text(_lbl, PW - MR, PH - 5, { align: 'right' });
                }
            }

            // ── Abre em nova aba e dispara download (ou retorna blob) ─────
            EOLicense.pdf(doc,license);
            const pdfBlob = doc.output('blob');
            const pdfFilename = 'dimensionamento_circuitos_' + aluno.replace(/\s+/g, '_') + '.pdf';
            if (returnBlob) return { blob: pdfBlob, filename: pdfFilename };
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = pdfFilename;
            a.click();
        }

// ─── EXPORTAR PDF + MEMORIAIS EM .ZIP ─────────────────────────
async function mcExportPdfMemoriaisZip() {
            if (!mcCircuits.length) { alert('Adicione pelo menos um circuito.'); return; }
            try {
                if (typeof window.JSZip === 'undefined') {
                    await EO.load('jszip').catch(() => { });
                }
                if (typeof window.JSZip === 'undefined') {
                    alert('Não foi possível carregar a biblioteca de compactação. Verifique sua conexão.');
                    return;
                }
                const pdfRes = await mcExportPDF({ returnBlob: true });
                if (!pdfRes) return;
                const memRes = await mcExportMemoriais({ returnBlob: true });
                if (!pdfRes || !memRes) {
                    alert('Falha ao gerar PDF ou Memoriais.');
                    return;
                }
                const obra = (document.getElementById('mc-obra').value || '').trim();
                const safe = (s) => (s || 'projeto').replace(/[^\w\-\s\.]/g, '_').replace(/\s+/g, '_').slice(0, 60);
                const baseName = safe(obra) || 'projeto';

                const zip = new JSZip();
                zip.file(pdfRes.filename, pdfRes.blob);
                zip.file(memRes.filename, memRes.blob);
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `PDF_e_Memoriais_${baseName}.zip`;
                document.body.appendChild(a); a.click();
                setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
            } catch (err) {
                console.error(err);
                alert('Erro ao gerar pacote ZIP: ' + err.message);
            }
        }

// ─── FIM EXPORTAR PDF ─────────────────────────────────────────

        // ─── IMPORTAR PDF ─────────────────────────────────────────────
async function mcImportarPDF(input) {
            const file = input.files[0];
            input.value = '';
            if (!file) return;

            const statusEl = document.getElementById('mc-import-status');
            const showStatus = (msg, ok) => {
                statusEl.style.display = '';
                statusEl.style.background = ok ? 'rgba(5,150,105,.15)' : 'rgba(220,38,38,.12)';
                statusEl.style.color = ok ? '#059669' : '#dc2626';
                statusEl.style.border = '1px solid ' + (ok ? '#059669' : '#dc2626');
                statusEl.textContent = msg;
            };

            // Carrega pdf.js sob demanda
            if (!window.pdfjsLib) {
                showStatus('Carregando leitor de PDF...', true);
                try {
                    await EO.load('pdfjs');
                } catch (e) {
                    showStatus('Não foi possível carregar o leitor de PDF. Verifique sua conexão.', false);
                    return;
                }
            }

            // Lê o arquivo como ArrayBuffer
            const arrayBuf = await file.arrayBuffer();
            let fullText = '';
            try {
                const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
                for (let p = 1; p <= pdfDoc.numPages; p++) {
                    const page = await pdfDoc.getPage(p);
                    const content = await page.getTextContent();
                    fullText += content.items.map(i => i.str).join(' ') + '\n';
                }
            } catch (e) {
                showStatus('Erro ao ler o PDF: ' + e.message, false);
                return;
            }

            // ── Helpers de parse ──────────────────────────────────────
            // Normaliza o texto: colapsa espaços, uniformiza separadores decimais
            const norm = (s) => s.replace(/\s+/g, ' ').trim();
            // Extrai número de uma string (aceita vírgula como decimal)
            const num = (s) => parseFloat(String(s).replace(',', '.'));

            // ── Parse dos dados do projeto ────────────────────────────
            const projMatch = {
                aluno: fullText.match(/(?:Aluno|Projetista)\s*[:\-]?\s*([^\n|]+?)(?:\s*\||\s*Projeto|\s*$)/i),
                obra:  fullText.match(/Projeto\s*[:\-]?\s*([^\n|]+?)(?:\s*\||\s*Prof|\s*Data|\s*$)/i),
                prof:  fullText.match(/Prof(?:essor)?\s*[:\-\.]\s*([^\n|]+?)(?:\s*\||\s*Data|\s*$)/i),
                data:  fullText.match(/Data\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i),
            };
            if (projMatch.aluno) {
                const v = projMatch.aluno[1].trim();
                const el = document.getElementById('mc-aluno');
                if (el && v) el.value = v;
            }
            if (projMatch.obra) {
                const v = projMatch.obra[1].trim();
                const el = document.getElementById('mc-obra');
                if (el && v) el.value = v;
            }
            if (projMatch.prof) {
                const v = projMatch.prof[1].trim();
                const el = document.getElementById('mc-prof');
                if (el && v) el.value = v;
            }
            if (projMatch.data) {
                const el = document.getElementById('mc-data');
                if (el) el.value = projMatch.data[1].trim();
            }

            // ── Detecta blocos por circuito ───────────────────────────
            // O PDF separa circuitos com "Circuito N" (cabeçalho colorido)
            const blocos = [];
            const splitRe = /Circuito\s+(\d+)/gi;
            let match;
            const positions = [];
            while ((match = splitRe.exec(fullText)) !== null) {
                positions.push({ num: parseInt(match[1]), idx: match.index });
            }
            for (let i = 0; i < positions.length; i++) {
                const start = positions[i].idx;
                const end = i + 1 < positions.length ? positions[i + 1].idx : fullText.length;
                blocos.push({ num: positions[i].num, text: fullText.slice(start, end) });
            }

            if (!blocos.length) {
                showStatus('Nenhum circuito encontrado no PDF. Certifique-se de que é um PDF gerado por esta ferramenta.', false);
                return;
            }

            // ── Para cada bloco, extrai os campos ────────────────────
            const circuitosImportados = [];
            blocos.forEach(bloco => {
                const t = norm(bloco.text);

                // Tipo de circuito
                let tipo = 'tug';
                if (/Iluminac/i.test(t))      tipo = 'iluminacao';
                else if (/TUE|uso espec/i.test(t)) tipo = 'tue';
                else if (/CH Eletrico|CH El/i.test(t)) tipo = 'ch';
                else if (/TUG|uso geral/i.test(t))  tipo = 'tug';

                // S (Potência)
                const sM = t.match(/S\s*=\s*([\d]+(?:[.,]\d+)?)\s*VA/i);
                const pot = sM ? num(sM[1]) : 2200;

                // E (Tensão)
                const eM = t.match(/E\s*=\s*([\d]+(?:[.,]\d+)?)\s*V/i);
                const tensao = eM ? parseInt(num(eM[1])) : 220;

                // Sistema (mono/bi/tri) — deduzido da tensão e do texto
                let sistema = 'mono';
                if (/Trifasico|Trifásico|trifasico/i.test(t)) sistema = 'tri';
                else if (/Bifasico|Bifásico|bifasico/i.test(t)) sistema = 'bi';
                else if (tensao >= 380) sistema = 'tri';

                // L (Comprimento)
                const lM = t.match(/L\s*=\s*([\d]+(?:[.,]\d+)?)\s*m/i);
                const comprimento = lM ? num(lM[1]) : 10;

                // Método de instalação
                let metodo = 'B1';
                const metM = t.match(/Metodo de instalacao[:\s]+([A-F][12]?)\b/i)
                          || t.match(/\bMetodo[:\s]+([A-F][12]?)\s/i);
                if (metM) metodo = metM[1].toUpperCase();

                // Circuitos agrupados
                const agrupM = t.match(/circuitos agrupados[:\s]+([\d]+)/i)
                             || t.match(/Agrup\.[:\s]+([\d]+)/i);
                const agrup = agrupM ? parseInt(agrupM[1]) : 1;

                // Temperatura
                const tempM = t.match(/Temperatura\s+ambiente[:\s]+([\d]+)/i)
                            || t.match(/Temp\.[:\s]+([\d]+)/i);
                const temp = tempM ? parseInt(tempM[1]) : 40;

                // Material (por padrão cobre; alumínio se mencionado)
                const material = /alumin/i.test(t) ? 'al' : 'cu';

                // Fator de potência — captura "FP = X,XX" ou "FP: X,XX"
                const fpM = t.match(/FP\s*[=:]\s*([\d]+[.,][\d]+)/i)
                          || t.match(/Fator de pot[eê]ncia[^0-9]+([\d]+[.,][\d]+)/i)
                          || t.match(/cos\s*[φf][^0-9]+([\d]+[.,][\d]+)/i);
                const fp = fpM ? Math.min(1, Math.max(0.1, num(fpM[1]))) : 0.92;

                circuitosImportados.push({ tipo, pot, tensao, sistema, comprimento, metodo, agrup, temp, material, fp });
            });

            // ── Confirma antes de sobrescrever ───────────────────────
            const msg = `Importar ${circuitosImportados.length} circuito(s) do PDF?\n\nIsso substituirá os ${mcCircuits.length} circuito(s) atuais.`;
            if (mcCircuits.length > 0 && !confirm(msg)) return;

            // ── Reconstrói mcCircuits com os dados importados ─────────
            mcCircuits = [];
            window.mcCircuits = mcCircuits;
            mcNextId = 1;

            circuitosImportados.forEach(dados => {
                const id = mcNextId++;
                mcCircuits.push({
                    id,
                    _saved_tipo:   dados.tipo,
                    _saved_pot:    String(dados.pot),
                    _saved_tensao: String(dados.tensao),
                    _saved_sistema: dados.sistema,
                    _saved_l:      String(dados.comprimento),
                    _saved_metodo: dados.metodo,
                    _saved_agrup:  String(dados.agrup),
                    _saved_temp:   String(dados.temp),
                    _saved_mat:    dados.material,
                    _saved_fp:     String(dados.fp),
                });
            });
            window.mcCircuits = mcCircuits;

            mcRenderList();     // renderiza e restaura via _saved_*
            mcCalcAll();        // calcula imediatamente

            showStatus(`${circuitosImportados.length} circuito(s) importado(s) com sucesso!`, true);
        }

// ─── FIM IMPORTAR PDF ─────────────────────────────────────────

        // ─── FIM MULTI-CIRCUITO ───────────────────────────────────────

        // ─── ANÁLISE DE PLANTA (FOTO → XLSX) ─────────────────────────
let plantaComodos = [];

let plantaSeq = 0;

const PLANTA_TIPOS = {
            sala: { label: 'Sala', minTomadasFixo: null, intervaloPerimM: 5 },
            quarto: { label: 'Quarto / Dormitório', minTomadasFixo: null, intervaloPerimM: 5 },
            escrit: { label: 'Escritório', minTomadasFixo: null, intervaloPerimM: 5 },
            cozinha: { label: 'Cozinha / Copa', minTomadasFixo: null, intervaloPerimM: 3.5 },
            servico: { label: 'Área de Serviço / Lavanderia', minTomadasFixo: null, intervaloPerimM: 3.5 },
            banheiro: { label: 'Banheiro', minTomadasFixo: 1, intervaloPerimM: 5 },
            varanda: { label: 'Varanda', minTomadasFixo: 1, intervaloPerimM: 5 },
            corredor: { label: 'Corredor / Hall', minTomadasFixo: null, intervaloPerimM: 5 },
            garagem: { label: 'Garagem', minTomadasFixo: 1, intervaloPerimM: 5 },
            outro: { label: 'Outro', minTomadasFixo: null, intervaloPerimM: 5 }
        };

// Parâmetros luminotécnicos por tipo de cômodo (NBR ISO/CIE 8995-1)
        // fluxo (lm) e pot (W) referentes a uma luminária típica adotada para o ambiente
const PLANTA_LUMI = {
            sala:     { lux: 200, fluxo: 2000, pot: 24, fp: 0.92 },
            quarto:   { lux: 150, fluxo: 1600, pot: 18, fp: 0.92 },
            escrit:   { lux: 500, fluxo: 3600, pot: 36, fp: 0.92 },
            cozinha:  { lux: 300, fluxo: 2400, pot: 24, fp: 0.92 },
            servico:  { lux: 200, fluxo: 2000, pot: 24, fp: 0.92 },
            banheiro: { lux: 200, fluxo: 1200, pot: 15, fp: 0.92 },
            varanda:  { lux: 100, fluxo: 1200, pot: 15, fp: 0.92 },
            corredor: { lux: 100, fluxo: 1200, pot: 12, fp: 0.92 },
            garagem:  { lux: 75,  fluxo: 2000, pot: 24, fp: 0.92 },
            outro:    { lux: 200, fluxo: 2000, pot: 24, fp: 0.92 }
        };

// Fator de utilização e manutenção médios adotados (método dos lúmens simplificado)
const PLANTA_LUMI_FU = 0.50;

const PLANTA_LUMI_FM = 0.80;

function plantaPreviewFoto(ev) {
            const file = ev.target.files && ev.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('planta-foto-img').src = e.target.result;
                document.getElementById('planta-foto-preview').style.display = '';
            };
            reader.readAsDataURL(file);
        }

function plantaAddComodo() {
            plantaSyncFromInputs();
            const id = ++plantaSeq;
            plantaComodos.push({ id, nome: '', tipo: 'sala', area: '', perim: '', temAC: false, acPessoas: 1, acDisp: 0, acFP: 0.92 });
            plantaRenderList();
            calcBTU();
        }

function plantaRemoveComodo(id) {
            plantaSyncFromInputs();
            plantaComodos = plantaComodos.filter(c => c.id !== id);
            plantaRenderList();
            calcBTU();
        }

function plantaSyncFromInputs() {
            plantaComodos.forEach(c => {
                const n  = document.getElementById('planta-nome-'    + c.id);
                const t  = document.getElementById('planta-tipo-'    + c.id);
                const a  = document.getElementById('planta-area-'    + c.id);
                const p  = document.getElementById('planta-perim-'   + c.id);
                const ac = document.getElementById('planta-temAC-'   + c.id);
                const ap = document.getElementById('planta-acPes-'   + c.id);
                const ad = document.getElementById('planta-acDisp-'  + c.id);
                const af = document.getElementById('planta-acFP-'    + c.id);
                if (n)  c.nome      = n.value.trim();
                if (t)  c.tipo      = t.value;
                if (a)  c.area      = a.value;
                if (p)  c.perim     = p.value;
                if (ac) c.temAC     = ac.checked;
                if (ap) c.acPessoas = parseInt(ap.value) || 0;
                if (ad) c.acDisp    = parseInt(ad.value) || 0;
                if (af) c.acFP      = parseFloat(af.value) || 0.92;
            });
        }

function plantaRenderList() {
            const cont = document.getElementById('planta-comodos-list');
            if (!cont) return;
            if (!plantaComodos.length) {
                cont.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--text-dim);font-size:.85rem;background:var(--surface2);border-radius:10px">Nenhum cômodo adicionado. Clique em <strong><i data-eo-icon=file-plus></i> Adicionar Cômodo</strong>.</div>`;
                return;
            }
            cont.innerHTML = plantaComodos.map((c, idx) => {
                const opts = Object.entries(PLANTA_TIPOS).map(([k, v]) =>
                    `<option value="${k}" ${k === (c.tipo || 'sala') ? 'selected' : ''}>${v.label}</option>`
                ).join('');
                const temAC     = c.temAC     || false;
                const acPessoas = c.acPessoas ?? 1;
                const acDisp    = c.acDisp    ?? 0;
                const acFP      = c.acFP      ?? 0.92;
                return `
                <div class="card" style="margin-bottom:.7rem;background:var(--surface2)">
                    <div class="card-header" style="justify-content:space-between;flex-wrap:wrap">
                        <div style="display:flex;align-items:center;gap:.6rem">
                            <div class="dot" style="background:var(--accent4)"></div>
                            <h3 style="font-size:.95rem">Cômodo ${idx + 1}</h3>
                        </div>
                        <button type="button" class="btn btn-danger-outline eo-row-remove" onclick="plantaRemoveComodo(${c.id})" data-eo-action="predial:remove-comodo-planta"><i data-eo-icon=x></i> Remover</button>
                    </div>
                    <div class="predial-input-grid">
                        <div class="predial-input-group">
                            <label>Nome do cômodo</label>
                            <input type="text" id="planta-nome-${c.id}" value="${c.nome || ''}" placeholder="Ex: Quarto 1">
                        </div>
                        <div class="predial-input-group">
                            <label>Tipo</label>
                            <select id="planta-tipo-${c.id}">${opts}</select>
                        </div>
                        <div class="predial-input-group">
                            <label>Área (m²)</label>
                            <input type="number" id="planta-area-${c.id}" value="${c.area ?? ''}" min="0.1" step="0.01" placeholder="Ex: 12.5" oninput="calcBTU()">
                        </div>
                        <div class="predial-input-group">
                            <label>Perímetro (m)</label>
                            <input type="number" id="planta-perim-${c.id}" value="${c.perim ?? ''}" min="0.1" step="0.01" placeholder="Ex: 14">
                        </div>
                    </div>

                    <!-- Toggle AC -->
                    <div style="margin-top:.75rem;padding:.65rem .8rem;background:var(--surface);border-radius:10px;border:1px solid ${temAC ? '#06b6d4' : 'var(--border)'}">
                        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;user-select:none">
                            <input type="checkbox" id="planta-temAC-${c.id}" ${temAC ? 'checked' : ''}
                                onchange="plantaToggleAC(${c.id})"
                                style="width:16px;height:16px;accent-color:#06b6d4;cursor:pointer">
                            <span style="font-size:.82rem;font-weight:600;color:${temAC ? '#06b6d4' : 'var(--text-dim)'}">Este cômodo terá ar-condicionado</span>
                        </label>
                        <div id="planta-acFields-${c.id}" style="display:${temAC ? 'grid' : 'none'};grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.6rem;margin-top:.65rem">
                            <div class="predial-input-group" style="margin:0">
                                <label style="font-size:.75rem">Pessoas</label>
                                <input type="number" id="planta-acPes-${c.id}" value="${acPessoas}" min="0" step="1" oninput="calcBTU()" style="font-size:.85rem">
                            </div>
                            <div class="predial-input-group" style="margin:0">
                                <label style="font-size:.75rem">Dispositivos/equipamentos</label>
                                <input type="number" id="planta-acDisp-${c.id}" value="${acDisp}" min="0" step="1" oninput="calcBTU()" style="font-size:.85rem">
                            </div>
                            <div class="predial-input-group" style="margin:0">
                                <label style="font-size:.75rem">Fator de potência (cos φ)</label>
                                <input type="number" id="planta-acFP-${c.id}" value="${acFP}" min="0.5" max="1" step="0.01" oninput="calcBTU()" style="font-size:.85rem">
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

function plantaToggleAC(id) {
            plantaSyncFromInputs();
            plantaRenderList();
            calcBTU();
        }

function plantaCalcComodo(c) {
            const tipoCfg = PLANTA_TIPOS[c.tipo] || PLANTA_TIPOS.outro;
            const area = parseFloat(c.area) || 0;
            const perim = parseFloat(c.perim) || 0;

            // Iluminação NBR 5410
            let vaIlum;
            if (area <= 6) vaIlum = 100;
            else vaIlum = 100 + Math.floor((area - 6) / 4) * 60;

            // Tomadas: 1 a cada intervaloPerimM (ou fração); respeita mínimo
            let qtdTomadas = Math.ceil(perim / tipoCfg.intervaloPerimM);
            if (tipoCfg.minTomadasFixo) qtdTomadas = Math.max(qtdTomadas, tipoCfg.minTomadasFixo);
            if (qtdTomadas < 1) qtdTomadas = 1;

            let vaTomadas;
            if (c.tipo === 'cozinha' || c.tipo === 'servico') {
                vaTomadas = Math.min(qtdTomadas, 3) * 600 + Math.max(0, qtdTomadas - 3) * 100;
            } else if (c.tipo === 'banheiro') {
                vaTomadas = qtdTomadas * 600;
            } else {
                vaTomadas = qtdTomadas * 100;
            }

            // Luminotécnica — método dos lumens simplificado
            const lumiCfg = PLANTA_LUMI[c.tipo] || PLANTA_LUMI.outro;
            const luxReq = lumiCfg.lux;
            const fluxoUnit = lumiCfg.fluxo;
            const potUnit = lumiCfg.pot;
            const fpUnit = lumiCfg.fp || 0.92;
            const vaUnit = potUnit / fpUnit;
            const lumensNec = area > 0 ? (luxReq * area) / (PLANTA_LUMI_FU * PLANTA_LUMI_FM) : 0;
            const qtdLumi = area > 0 ? Math.max(1, Math.ceil(lumensNec / fluxoUnit)) : 0;
            const potLumiTotal = qtdLumi * potUnit;
            const vaLumiTotal = qtdLumi * vaUnit;
            const luxReal = area > 0 ? (qtdLumi * fluxoUnit * PLANTA_LUMI_FU * PLANTA_LUMI_FM) / area : 0;

            // Ar-condicionado por cômodo
            const temAC     = c.temAC || false;
            const acPessoas = c.acPessoas ?? 1;
            const acDisp    = c.acDisp    ?? 0;
            const acFP      = Math.min(1, Math.max(0.01, c.acFP ?? 0.92));
            const acOcupantes = acPessoas + acDisp;
            const acBTU     = temAC && area > 0 ? Math.ceil((800 * area) + (800 * acOcupantes)) : 0;
            const acVA      = temAC ? Math.ceil(acBTU * 1500 / 12000) : 0;
            const acW       = temAC ? Math.ceil(acVA * acFP) : 0;
            const acComerciais = [7000,9000,12000,18000,24000,30000,36000,48000,60000];
            const acSugerido    = temAC ? (acComerciais.find(v => v >= acBTU) || '>60000') : '—';
            const acVASugerido  = temAC && typeof acSugerido === 'number' ? Math.ceil(acSugerido * 1500 / 12000) : '—';
            const acWSugerido   = temAC && typeof acVASugerido === 'number' ? Math.ceil(acVASugerido * acFP) : '—';

            return {
                nome: c.nome || '(sem nome)',
                tipo: tipoCfg.label,
                area, perim, qtdTomadas, vaTomadas, vaIlum,
                vaTotal: vaTomadas + vaIlum,
                luxReq, lumensNec, fluxoUnit, potUnit, fpUnit, vaUnit,
                qtdLumi, potLumiTotal, vaLumiTotal, luxReal,
                temAC, acPessoas, acDisp, acFP, acOcupantes, acBTU, acVA, acW,
                acSugerido, acVASugerido, acWSugerido
            };
        }

async function plantaCalcularEExportar() {
            plantaSyncFromInputs();
            const validos = plantaComodos.filter(c => parseFloat(c.area) > 0 && parseFloat(c.perim) > 0);
            if (!validos.length) {
                alert('Adicione pelo menos um cômodo com área e perímetro válidos.');
                return;
            }
            const resultados = validos.map(plantaCalcComodo);
            const totalVA      = resultados.reduce((s, r) => s + r.vaTotal, 0);
            const totalIlum    = resultados.reduce((s, r) => s + r.vaIlum, 0);
            const totalTUG     = resultados.reduce((s, r) => s + r.vaTomadas, 0);
            const totalQtdLumi = resultados.reduce((s, r) => s + r.qtdLumi, 0);
            const totalPotLumi = resultados.reduce((s, r) => s + r.potLumiTotal, 0);
            const totalVaLumi  = resultados.reduce((s, r) => s + r.vaLumiTotal, 0);
            const totalLumens  = resultados.reduce((s, r) => s + r.lumensNec, 0);
            const totalComAC   = resultados.filter(r => r.temAC).length;
            const totalBTU     = resultados.reduce((s, r) => s + r.acBTU, 0);
            const totalVAAC    = resultados.reduce((s, r) => s + r.acVA, 0);
            const totalWAC     = resultados.reduce((s, r) => s + r.acW, 0);

            plantaRenderResumo(resultados, { totalVA, totalIlum, totalTUG, totalQtdLumi, totalPotLumi, totalVaLumi, totalLumens, totalComAC, totalBTU, totalVAAC, totalWAC });
            calcBTU();

            if (typeof window.XLSX === 'undefined') {
                try {
                    await EO.load('xlsx').catch(() => { throw new Error('Falha ao carregar a biblioteca de planilhas.'); });
                } catch (err) { alert(err.message); return; }
            }

            const headers = ['Nome do Cômodo', 'Tipo', 'Área (m²)', 'Perímetro (m)',
                'Pontos de Tomada (qtd)', 'Tomadas (VA)', 'Iluminação (VA)', 'Total (VA)',
                'Lux requerido (Em)', 'Lúmens necessários (lm)', 'Fluxo/luminária (lm)',
                'Qtd luminárias', 'Potência/luminária (W)', 'VA/luminária (VA)',
                'Potência total ilum. (W)', 'Potência total ilum. (VA)', 'Lux real estimado',
                '❄️ AC?', 'Pessoas (AC)', 'Dispositivos (AC)', 'cos φ (AC)',
                'BTU/h (AC)', 'VA (AC)', 'W (AC)',
                'Comercial BTU', 'Comercial VA', 'Comercial W'];
            const NCOL = headers.length;
            const aoa = [
                ['Análise de Planta — Pontos Mínimos NBR 5410 + Luminotécnica NBR ISO/CIE 8995-1 + Ar-Condicionado'],
                [],
                headers
            ];
            resultados.forEach(r => {
                aoa.push([
                    r.nome, r.tipo,
                    Number(r.area.toFixed(2)),
                    Number(r.perim.toFixed(2)),
                    r.qtdTomadas, r.vaTomadas, r.vaIlum, r.vaTotal,
                    r.luxReq, Math.round(r.lumensNec), r.fluxoUnit,
                    r.qtdLumi, r.potUnit, Math.round(r.vaUnit),
                    r.potLumiTotal, Math.round(r.vaLumiTotal), Math.round(r.luxReal),
                    r.temAC ? 'Sim' : 'Não',
                    r.temAC ? r.acPessoas : '—',
                    r.temAC ? r.acDisp    : '—',
                    r.temAC ? r.acFP      : '—',
                    r.temAC ? r.acBTU     : '—',
                    r.temAC ? r.acVA      : '—',
                    r.temAC ? r.acW       : '—',
                    r.temAC ? (typeof r.acSugerido   === 'number' ? r.acSugerido   : r.acSugerido)   : '—',
                    r.temAC ? (typeof r.acVASugerido === 'number' ? r.acVASugerido : r.acVASugerido) : '—',
                    r.temAC ? (typeof r.acWSugerido  === 'number' ? r.acWSugerido  : r.acWSugerido)  : '—'
                ]);
            });
            const firstDataRow = 4;
            const lastDataRow = firstDataRow + resultados.length - 1;
            const totalComAC2 = resultados.filter(r => r.temAC).length;
            const totalBTU2   = resultados.reduce((s, r) => s + r.acBTU, 0);
            const totalVAAC2  = resultados.reduce((s, r) => s + r.acVA, 0);
            const totalWAC2   = resultados.reduce((s, r) => s + r.acW, 0);
            aoa.push([
                'TOTAIS', '', '', '',
                { f: `SUM(E${firstDataRow}:E${lastDataRow})` },
                { f: `SUM(F${firstDataRow}:F${lastDataRow})` },
                { f: `SUM(G${firstDataRow}:G${lastDataRow})` },
                { f: `SUM(H${firstDataRow}:H${lastDataRow})` },
                '', { f: `SUM(J${firstDataRow}:J${lastDataRow})` }, '',
                { f: `SUM(L${firstDataRow}:L${lastDataRow})` }, '', '',
                { f: `SUM(O${firstDataRow}:O${lastDataRow})` },
                { f: `SUM(P${firstDataRow}:P${lastDataRow})` }, '',
                totalComAC2 + ' cômodo(s)', '', '', '',
                totalBTU2, totalVAAC2, totalWAC2, '', '', ''
            ]);

            const ws = XLSX.utils.aoa_to_sheet(aoa);
            ws['!cols'] = [
                { wch: 22 }, { wch: 26 }, { wch: 11 }, { wch: 14 },
                { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
                { wch: 16 }, { wch: 20 }, { wch: 20 },
                { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 16 },
                { wch: 10 }, { wch: 13 }, { wch: 18 }, { wch: 12 },
                { wch: 14 }, { wch: 12 }, { wch: 12 },
                { wch: 18 }, { wch: 14 }, { wch: 14 }
            ];
            ws['!rows'] = [{ hpt: 32 }, { hpt: 8 }, { hpt: 38 }];
            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NCOL - 1 } }];

            // ─── Estilização ───
            const border = { style: 'thin', color: { rgb: 'B6B6B6' } };
            const allBorders = { top: border, bottom: border, left: border, right: border };
            const colNB = (n) => XLSX.utils.encode_col(n);
            // Título
            const titleAddr = 'A1';
            ws[titleAddr].s = {
                font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '1F4E78' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
            // Cabeçalho (linha 3 = índice 2)
            const headerColors = {
                ele: '4472C4',  // azul — colunas elétricas
                lumi: 'C65911'  // laranja — luminotécnica
            };
            const lumiCols = new Set([8,9,10,11,12,13,14,15,16]); // I..Q (0-indexed 8..16)
            const acCols   = new Set([17,18,19,20,21,22,23,24,25,26]);   // R..AA — ar-condicionado
            for (let c = 0; c < NCOL; c++) {
                const addr = colNB(c) + '3';
                if (!ws[addr]) ws[addr] = { t: 's', v: headers[c] };
                const bgColor = acCols.has(c) ? '0C4A6E' : lumiCols.has(c) ? headerColors.lumi : headerColors.ele;
                ws[addr].s = {
                    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
                    fill: { patternType: 'solid', fgColor: { rgb: bgColor } },
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: allBorders
                };
            }
            // Dados — zebra
            for (let r = firstDataRow; r <= lastDataRow; r++) {
                const zebra = (r - firstDataRow) % 2 === 0 ? 'FFFFFF' : 'F2F6FC';
                for (let c = 0; c < NCOL; c++) {
                    const addr = colNB(c) + r;
                    if (!ws[addr]) ws[addr] = { t: 's', v: '' };
                    const isLumi = lumiCols.has(c);
                    const isAC   = acCols.has(c);
                    const isNum  = c >= 2 && c !== 1;
                    let textColor = '1F2937';
                    let bgColor   = zebra;
                    if (isLumi) { textColor = '7C3F00'; bgColor = zebra === 'FFFFFF' ? 'FFF6E5' : 'FCE7C2'; }
                    if (isAC)   { textColor = '164E63'; bgColor = zebra === 'FFFFFF' ? 'ECFEFF' : 'CFFAFE'; }
                    ws[addr].s = {
                        font: { name: 'Calibri', sz: 10, color: { rgb: textColor } },
                        fill: { patternType: 'solid', fgColor: { rgb: bgColor } },
                        alignment: { horizontal: c <= 1 ? 'left' : 'right', vertical: 'center' },
                        border: allBorders
                    };
                    if (isNum && typeof ws[addr].v === 'number') ws[addr].z = '#,##0';
                }
            }
            // Linha de totais
            const totalRow = lastDataRow + 1;
            for (let c = 0; c < NCOL; c++) {
                const addr = colNB(c) + totalRow;
                if (!ws[addr]) ws[addr] = { t: 's', v: '' };
                ws[addr].s = {
                    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
                    fill: { patternType: 'solid', fgColor: { rgb: '1F4E78' } },
                    alignment: { horizontal: c <= 3 ? 'left' : 'right', vertical: 'center' },
                    border: allBorders
                };
                if (typeof ws[addr].v === 'number') ws[addr].z = '#,##0';
            }
            // Freeze panes (cabeçalho)
            ws['!freeze'] = { xSplit: 2, ySplit: 3 };
            ws['!autofilter'] = { ref: `A3:${colNB(NCOL-1)}${lastDataRow}` };

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Pontos NBR 5410');

            const criteriosAOA = [
                ['Critérios aplicados — NBR 5410'],
                [],
                ['Iluminação', 'Até 6 m² → 100 VA. Acima de 6 m² → 100 VA + 60 VA a cada 4 m² inteiros excedentes.'],
                ['Tomadas (cozinha/copa/área de serviço)', '1 ponto a cada 3,5 m de perímetro (ou fração). 600 VA até as 3 primeiras, 100 VA para as demais.'],
                ['Tomadas (banheiro)', 'Mínimo 1 ponto próximo ao lavatório (600 VA).'],
                ['Tomadas (demais cômodos)', '1 ponto a cada 5 m de perímetro (ou fração). 100 VA por tomada.'],
                ['Luminotécnica (NBR ISO/CIE 8995-1)', 'Método dos lúmens: Φtotal = (E × A) / (Fu × Fm). Adotado Fu=0,50 e Fm=0,80. Qtd luminárias = ⌈Φtotal / Φluminária⌉. Iluminância (lux) e luminária típica definidas por tipo de cômodo.'],
                ['Observação', 'Cálculo automático para conferência. Ajustes finais (refletâncias, layout, distribuição) são responsabilidade do projetista.']
            ];
            const ws2 = XLSX.utils.aoa_to_sheet(criteriosAOA);
            ws2['!cols'] = [{ wch: 38 }, { wch: 90 }];
            ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
            ws2['!rows'] = [{ hpt: 30 }];
            if (ws2['A1']) ws2['A1'].s = {
                font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '1F4E78' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
            const cBorder = { style: 'thin', color: { rgb: 'D0D7DE' } };
            const cAll = { top: cBorder, bottom: cBorder, left: cBorder, right: cBorder };
            for (let r = 2; r < criteriosAOA.length; r++) {
                ['A','B'].forEach((col, idx) => {
                    const addr = col + (r + 1);
                    if (!ws2[addr]) ws2[addr] = { t: 's', v: '' };
                    ws2[addr].s = {
                        font: { name: 'Calibri', sz: 10, bold: idx === 0, color: { rgb: idx === 0 ? '1F4E78' : '1F2937' } },
                        fill: { patternType: 'solid', fgColor: { rgb: r % 2 === 0 ? 'F2F6FC' : 'FFFFFF' } },
                        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
                        border: cAll
                    };
                });
            }
            XLSX.utils.book_append_sheet(wb, ws2, 'Critérios');

            // ─── Aba BTU ───
            const btuPessoas = parseInt(document.getElementById('btu-pessoas')?.value) || 0;
            const btuDisp    = parseInt(document.getElementById('btu-dispositivos')?.value) || 0;
            const btuFP      = Math.min(1, Math.max(0.01, parseFloat(document.getElementById('btu-fp')?.value) || 0.92));
            const btuOcup    = btuPessoas + btuDisp;
            const btuAreaTot = resultados.reduce((s, r) => s + r.area, 0);
            const btuTotal   = (800 * btuAreaTot) + (800 * btuOcup);
            const btuVA      = Math.ceil(btuTotal * 1500 / 12000);
            const btuW       = Math.ceil(btuVA * btuFP);
            const btuComerciais = [7000,9000,12000,18000,24000,30000,36000,48000,60000];
            const btuSugerido    = btuComerciais.find(v => v >= btuTotal) || null;
            const btuVASugerido  = btuSugerido ? Math.ceil(btuSugerido * 1500 / 12000) : null;
            const btuWSugerido   = btuVASugerido ? Math.ceil(btuVASugerido * btuFP) : null;
            const btuAOA = [
                ['Dimensionamento de Ar-Condicionado (BTU/h)'],
                [],
                ['Parâmetro', 'Valor'],
                ['Área total dos cômodos (m²)', Number(btuAreaTot.toFixed(2))],
                ['Número de pessoas', btuPessoas],
                ['Número de dispositivos/equipamentos', btuDisp],
                ['Total de ocupantes (pessoas + dispositivos)', btuOcup],
                ['Fator de potência adotado (cos φ)', btuFP],
                [],
                ['Cálculo', 'Valor'],
                ['Parcela área (BTU/h)  →  800 × área', Number((800 * btuAreaTot).toFixed(0))],
                ['Parcela ocupantes (BTU/h)  →  800 × ocupantes', 800 * btuOcup],
                ['TOTAL BTU NECESSÁRIOS (BTU/h)', btuTotal],
                ['Potência aparente estimada (VA)  →  BTU × 1500 / 12000', btuVA],
                ['Potência ativa estimada (W)  →  VA × cos φ', btuW],
                [],
                ['Capacidade comercial sugerida (BTU/h)', btuSugerido ? btuSugerido : '> 60.000 (consulte engenheiro)'],
                ['Potência aparente comercial (VA)', btuVASugerido ? btuVASugerido : '—'],
                ['Potência ativa comercial (W)', btuWSugerido ? btuWSugerido : '—'],
                [],
                ['Base de conversão', '1.500 VA = 12.000 BTU/h'],
                ['Fórmula BTU', 'BTU = (800 × Área m²) + (800 × Nº pessoas e dispositivos)'],
                ['Fórmula W', 'W = VA × cos φ'],
                ['Observação', 'Valores orientativos. Projetos definitivos devem ser validados por profissional habilitado.']
            ];
            const ws3 = XLSX.utils.aoa_to_sheet(btuAOA);
            ws3['!cols'] = [{ wch: 46 }, { wch: 40 }];
            ws3['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
            if (ws3['A1']) ws3['A1'].s = {
                font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '0C4A6E' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
            // Cabeçalhos das seções (linhas 3 e 10 → índices 2 e 9)
            [[2,'0369A1'],[9,'0369A1']].forEach(([ri, cor]) => {
                ['A','B'].forEach(col => {
                    const addr = col + (ri + 1);
                    if (!ws3[addr]) ws3[addr] = { t: 's', v: '' };
                    ws3[addr].s = { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }, fill: { patternType: 'solid', fgColor: { rgb: cor } }, alignment: { horizontal: 'center', vertical: 'center' }, border: cAll };
                });
            });
            // Destaque linha BTU total (row 13), VA (14), W (15)
            [13, 14, 15].forEach((rowNum, idx) => {
                const colors = ['38BDF8','FCD34D','FB923C'];
                if (ws3['A' + rowNum]) ws3['A' + rowNum].s = { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }, fill: { patternType: 'solid', fgColor: { rgb: '0C4A6E' } }, border: cAll };
                if (ws3['B' + rowNum]) ws3['B' + rowNum].s = { font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: colors[idx] } }, fill: { patternType: 'solid', fgColor: { rgb: '0C4A6E' } }, border: cAll, alignment: { horizontal: 'right' } };
            });
            XLSX.utils.book_append_sheet(wb, ws3, 'BTU Ar-Condicionado');

            const dt = new Date();
            const ts = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`;
            XLSX.writeFile(wb, `analise_planta_NBR5410_${ts}.xlsx`);
        }

function plantaRenderResumo(resultados, totais) {
            const cont = document.getElementById('planta-resumo-content');
            const wrap = document.getElementById('planta-resumo');
            if (!cont || !wrap) return;
            wrap.style.display = '';
            const rows = resultados.map(r => `
                <tr>
                    <td style="padding:.45rem .6rem">${r.nome}</td>
                    <td style="padding:.45rem .6rem">${r.tipo}</td>
                    <td style="padding:.45rem .6rem;text-align:right">${r.area.toFixed(2)}</td>
                    <td style="padding:.45rem .6rem;text-align:right">${r.perim.toFixed(2)}</td>
                    <td style="padding:.45rem .6rem;text-align:right">${r.qtdTomadas}</td>
                    <td style="padding:.45rem .6rem;text-align:right">${r.vaTomadas}</td>
                    <td style="padding:.45rem .6rem;text-align:right">${r.vaIlum}</td>
                    <td style="padding:.45rem .6rem;text-align:right;font-weight:700">${r.vaTotal}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#f59e0b">${r.luxReq}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#f59e0b">${Math.round(r.lumensNec)}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#f59e0b;font-weight:700">${r.qtdLumi}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#f59e0b">${r.potUnit} W / ${Math.round(r.vaUnit)} VA</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#f59e0b;font-weight:700">${r.potLumiTotal} W / ${Math.round(r.vaLumiTotal)} VA</td>
                    <td style="padding:.45rem .6rem;text-align:center;color:${r.temAC?'#06b6d4':'var(--text-dim)'}">${r.temAC ? 'Sim' : '—'}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#06b6d4">${r.temAC ? r.acBTU.toLocaleString('pt-BR') : '—'}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#f59e0b">${r.temAC ? r.acVA.toLocaleString('pt-BR') : '—'}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#fb923c">${r.temAC ? r.acW.toLocaleString('pt-BR') : '—'}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#22c55e;font-size:.78rem">${r.temAC ? (typeof r.acSugerido==='number'?r.acSugerido.toLocaleString('pt-BR')+' BTU':r.acSugerido) : '—'}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#22c55e;font-size:.78rem">${r.temAC && typeof r.acVASugerido==='number' ? r.acVASugerido.toLocaleString('pt-BR')+' VA' : '—'}</td>
                    <td style="padding:.45rem .6rem;text-align:right;color:#22c55e;font-size:.78rem">${r.temAC && typeof r.acWSugerido==='number' ? r.acWSugerido.toLocaleString('pt-BR')+' W' : '—'}</td>
                </tr>`).join('');
            cont.innerHTML = `
                <table style="width:100%;border-collapse:collapse;font-size:.82rem;min-width:900px">
                    <thead>
                        <tr style="background:var(--surface2);text-align:left">
                            <th style="padding:.5rem .6rem">Nome</th>
                            <th style="padding:.5rem .6rem">Tipo</th>
                            <th style="padding:.5rem .6rem;text-align:right">Área (m²)</th>
                            <th style="padding:.5rem .6rem;text-align:right">Perímetro (m)</th>
                            <th style="padding:.5rem .6rem;text-align:right">Tomadas (qtd)</th>
                            <th style="padding:.5rem .6rem;text-align:right">Tomadas (VA)</th>
                            <th style="padding:.5rem .6rem;text-align:right">Iluminação (VA)</th>
                            <th style="padding:.5rem .6rem;text-align:right">Total (VA)</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#f59e0b">Lux req.</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#f59e0b">Lúmens nec.</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#f59e0b">Qtd lumi.</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#f59e0b">Pot./lumi. (W/VA)</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#f59e0b">Pot. total ilum. (W/VA)</th>
                            <th style="padding:.5rem .6rem;text-align:center;color:#06b6d4">AC</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#06b6d4">BTU/h</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#f59e0b">VA (AC)</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#fb923c">W (AC)</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#22c55e">Comercial BTU</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#22c55e">Comercial VA</th>
                            <th style="padding:.5rem .6rem;text-align:right;color:#22c55e">Comercial W</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                    <tfoot>
                        <tr style="background:var(--surface2);font-weight:700">
                            <td colspan="5" style="padding:.5rem .6rem">TOTAIS</td>
                            <td style="padding:.5rem .6rem;text-align:right">${totais.totalTUG}</td>
                            <td style="padding:.5rem .6rem;text-align:right">${totais.totalIlum}</td>
                            <td style="padding:.5rem .6rem;text-align:right">${totais.totalVA}</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#f59e0b">—</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#f59e0b">${Math.round(totais.totalLumens)}</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#f59e0b">${totais.totalQtdLumi}</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#f59e0b">—</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#f59e0b">${totais.totalPotLumi} W / ${Math.round(totais.totalVaLumi)} VA</td>
                            <td style="padding:.5rem .6rem;text-align:center;color:#06b6d4">${totais.totalComAC} cômodo(s)</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#06b6d4">${totais.totalBTU.toLocaleString('pt-BR')}</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#f59e0b">${totais.totalVAAC.toLocaleString('pt-BR')}</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#fb923c">${totais.totalWAC.toLocaleString('pt-BR')}</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#22c55e">—</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#22c55e">—</td>
                            <td style="padding:.5rem .6rem;text-align:right;color:#22c55e">—</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="font-size:.75rem;color:var(--text-dim);margin-top:.6rem"><i data-eo-icon=circle-check></i> A planilha .xlsx foi baixada automaticamente.</div>`;
        }

// ─── CÁLCULO DE BTU ──────────────────────────────────────────
function calcBTU() {
            plantaSyncFromInputs();
            const validos = plantaComodos.filter(c => parseFloat(c.area) > 0);

            const resultEl = document.getElementById('btu-result');
            const avisoEl  = document.getElementById('btu-aviso-sem-comodos');
            if (!resultEl) return;

            if (!validos.length) {
                resultEl.style.display = 'none';
                if (avisoEl) avisoEl.style.display = '';
                return;
            }
            if (avisoEl) avisoEl.style.display = 'none';

            // ── Cômodos com AC individual ──
            const comAC    = validos.filter(c => c.temAC);
            const areaComAC = comAC.reduce((s, c) => s + parseFloat(c.area), 0);
            const areaTot   = validos.reduce((s, c) => s + parseFloat(c.area), 0);

            // ── Card global (usa os inputs globais do card BTU) ──
            const pessoas     = parseInt(document.getElementById('btu-pessoas')?.value) || 0;
            const dispositivos= parseInt(document.getElementById('btu-dispositivos')?.value) || 0;
            const ocupantes   = pessoas + dispositivos;
            const fp          = Math.min(1, Math.max(0.01, parseFloat(document.getElementById('btu-fp')?.value) || 0.92));

            // Se há cômodos com AC individual, usa soma deles; senão usa área total + global
            let btu, vaBase;
            if (comAC.length > 0) {
                btu = comAC.reduce((s, c) => {
                    const a  = parseFloat(c.area) || 0;
                    const oc = (c.acPessoas ?? 1) + (c.acDisp ?? 0);
                    return s + (800 * a) + (800 * oc);
                }, 0);
            } else {
                btu = (800 * areaTot) + (800 * ocupantes);
            }
            const va = Math.ceil(btu * 1500 / 12000);
            const w  = Math.ceil(va * fp);

            const comerciais = [7000,9000,12000,18000,24000,30000,36000,48000,60000];
            const sugerido   = comerciais.find(v => v >= btu) || '> 60.000 BTU/h (consulte engenheiro)';
            const vaSugerido = typeof sugerido === 'number' ? Math.ceil(sugerido * 1500 / 12000) : null;
            const wSugerido  = vaSugerido ? Math.ceil(vaSugerido * fp) : null;

            const areaLabel = comAC.length > 0
                ? `${comAC.length} cômodo(s) c/ AC — ${areaComAC.toFixed(2)} m²`
                : `todos os cômodos — ${areaTot.toFixed(2)} m²`;
            const ocupLabel = comAC.length > 0
                ? comAC.map(c => `${c.nome||'?'}: ${(c.acPessoas??1)+(c.acDisp??0)}`).join(', ')
                : `${ocupantes} (pessoas: ${pessoas} + disp.: ${dispositivos})`;

            document.getElementById('btu-area-total').textContent     = areaLabel;
            document.getElementById('btu-ocupantes-total').textContent = ocupLabel;
            document.getElementById('btu-valor').textContent           = btu.toLocaleString('pt-BR') + ' BTU/h';
            document.getElementById('btu-comercial').textContent       = typeof sugerido === 'number'
                ? sugerido.toLocaleString('pt-BR') + ' BTU/h' : sugerido;
            document.getElementById('btu-va').textContent = va.toLocaleString('pt-BR') + ' VA'
                + (vaSugerido ? '  (comercial: ' + vaSugerido.toLocaleString('pt-BR') + ' VA)' : '');
            document.getElementById('btu-w').textContent  = w.toLocaleString('pt-BR') + ' W'
                + (wSugerido  ? '  (comercial: ' + wSugerido.toLocaleString('pt-BR') + ' W)' : '');

            const srcLabel = comAC.length > 0
                ? `soma de ${comAC.length} cômodo(s) com AC`
                : `área total × 800 + ocupantes × 800`;
            document.getElementById('btu-breakdown').innerHTML =
                `<strong style="color:#06b6d4">${btu.toLocaleString('pt-BR')} BTU/h</strong> (${srcLabel}) &nbsp;›&nbsp; ` +
                `<i data-eo-icon=zap></i> <strong style="color:#f59e0b">${va.toLocaleString('pt-BR')} VA</strong> &nbsp;›&nbsp; ` +
                `<strong style="color:#fb923c">${w.toLocaleString('pt-BR')} W</strong> ` +
                `<span style="color:var(--text-dim)">(cos φ = ${fp.toFixed(2)} · base: 1500 VA = 12.000 BTU)</span>`;

            resultEl.style.display = '';
        }

// ─── IMPORTAR PLANILHA ───────────────────────────────────────
function plantaImportarXLSX(input) {
            const file = input.files[0];
            if (!file) return;
            input.value = ''; // reset para permitir reimportar o mesmo arquivo

            const statusEl = document.getElementById('planta-import-status');
            function showStatus(msg, ok) {
                statusEl.style.display = '';
                statusEl.style.background = ok ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)';
                statusEl.style.border     = ok ? '1px solid #22c55e'   : '1px solid #ef4444';
                statusEl.style.color      = ok ? '#22c55e'             : '#ef4444';
                statusEl.innerHTML = msg;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const wb = XLSX.read(e.target.result, { type: 'array' });

                    // Tenta ler a primeira aba (Pontos NBR 5410)
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

                    // Encontra a linha de cabeçalho (contém "Nome do Cômodo")
                    let headerRow = -1;
                    for (let i = 0; i < aoa.length; i++) {
                        if (String(aoa[i][0]).toLowerCase().includes('nome')) { headerRow = i; break; }
                    }
                    if (headerRow === -1) {
                        showStatus('<i data-eo-icon=circle-x></i> Cabeçalho não encontrado. Verifique se é uma planilha exportada por esta ferramenta.', false);
                        return;
                    }

                    const headers = aoa[headerRow].map(h => String(h).trim().toLowerCase());

                    // Mapa de índices por nome de coluna (busca parcial, tolerante)
                    const col = (term) => headers.findIndex(h => h.includes(term));
                    const iNome   = col('nome');
                    const iTipo   = col('tipo');
                    const iArea   = col('área') !== -1 ? col('área') : col('area');
                    const iPerim  = col('perímetro') !== -1 ? col('perímetro') : col('perimetro');
                    const iAC     = col('❄️') !== -1 ? col('❄️') : col('ac?');
                    const iPes    = col('pessoas');
                    const iDisp   = col('dispositivos');
                    const iFP     = col('cos');
                    
                    if (iNome === -1 || iArea === -1) {
                        showStatus('<i data-eo-icon=circle-x></i> Colunas obrigatórias (Nome, Área) não encontradas na planilha.', false);
                        return;
                    }

                    // Mapa reverso: label do tipo → chave
                    const tipoLabelToKey = {};
                    Object.entries(PLANTA_TIPOS).forEach(([k, v]) => {
                        tipoLabelToKey[v.label.toLowerCase()] = k;
                    });

                    const novosComodos = [];
                    let importados = 0;
                    for (let i = headerRow + 1; i < aoa.length; i++) {
                        const row = aoa[i];
                        const nomeVal = String(row[iNome] ?? '').trim();
                        // Pula linha de TOTAIS e linhas vazias
                        if (!nomeVal || nomeVal.toUpperCase().includes('TOTAL')) continue;

                        const areaVal = parseFloat(row[iArea]) || 0;
                        const perimVal= parseFloat(iPerim !== -1 ? row[iPerim] : 0) || 0;

                        // Tipo: tenta casar pelo label
                        let tipoKey = 'sala';
                        if (iTipo !== -1) {
                            const tipoLabel = String(row[iTipo] ?? '').trim().toLowerCase();
                            tipoKey = tipoLabelToKey[tipoLabel] || 'sala';
                        }

                        // AC
                        let temAC = false;
                        if (iAC !== -1) {
                            const acVal = String(row[iAC] ?? '').trim().toLowerCase();
                            temAC = acVal === 'sim' || acVal === 'yes' || acVal === '1' || acVal === 'true';
                        }
                        const acPessoas = iPes  !== -1 && row[iPes]  !== '—' ? parseInt(row[iPes])  || 1 : 1;
                        const acDisp    = iDisp !== -1 && row[iDisp] !== '—' ? parseInt(row[iDisp]) || 0 : 0;
                        const acFP      = iFP   !== -1 && row[iFP]   !== '—' ? parseFloat(row[iFP]) || 0.92 : 0.92;

                        novosComodos.push({
                            id: ++plantaSeq,
                            nome: nomeVal,
                            tipo: tipoKey,
                            area: areaVal > 0 ? String(areaVal) : '',
                            perim: perimVal > 0 ? String(perimVal) : '',
                            temAC, acPessoas, acDisp, acFP
                        });
                        importados++;
                    }

                    if (!importados) {
                        showStatus('<i data-eo-icon=triangle-alert></i> Nenhum cômodo válido encontrado na planilha.', false);
                        return;
                    }

                    // Confirma antes de substituir se já há cômodos
                    if (plantaComodos.length > 0) {
                        const ok = confirm(`Importar ${importados} cômodo(s) da planilha?\n\nIsso substituirá os ${plantaComodos.length} cômodo(s) atuais.`);
                        if (!ok) { showStatus('', true); statusEl.style.display = 'none'; return; }
                    }

                    plantaComodos = novosComodos;
                    plantaRenderList();
                    calcBTU();
                    showStatus(`<i data-eo-icon=circle-check></i> ${importados} cômodo(s) importado(s) com sucesso da aba "<strong>${wb.SheetNames[0]}</strong>".`, true);

                } catch (err) {
                    console.error(err);
                    showStatus('<i data-eo-icon=circle-x></i> Erro ao ler a planilha: ' + err.message, false);
                }
            };
            reader.readAsArrayBuffer(file);
        }

document.addEventListener('DOMContentLoaded', () => { plantaRenderList(); calcBTU(); });

// ─── ESCOLHA DE DESIGN DO PDF (módulo Projetos Prediais) ─────
let _mcPdfDestino = 'pdf';

// 'pdf' | 'zip'
let _mcPdfStyle   = 'colorido';

let _mcPdfFontScale = 1.0;

async function mcAbrirEscolhaDesignPDF(destino) {
            if (destino === 'zip' && (!window.mcCircuits || !mcCircuits.length)) {
                alert('Adicione pelo menos um circuito.'); return;
            }
            // Para o ZIP (que inclui os memoriais), pergunta a revisão antes de escolher o design.
            if (destino === 'zip') {
                const r = await mcAskRevisao();
                if (!r.proceed) return;
                _mcRevisao = r.rev;
            }
            _mcPdfDestino = destino || 'pdf';
            document.getElementById('mc-pdf-design-modal').style.display = 'flex';
        }

function mcFecharEscolhaDesignPDF() {
            document.getElementById('mc-pdf-design-modal').style.display = 'none';
        }

// 1º passo: usuário escolhe o design → abre 2º modal (opções)
function mcEscolherDesignPDF(style) {
            _mcPdfStyle = style || 'colorido';
            mcFecharEscolhaDesignPDF();
            // reset opções para padrão a cada abertura
            _mcPdfFontScale = 1.0;
            document.querySelectorAll('#mc-pdf-font-options .mc-font-btn').forEach(b => {
                const isDefault = b.getAttribute('data-scale') === '1.00';
                b.classList.toggle('mc-font-active', isDefault);
                b.style.background = isDefault ? '#1a6fd4' : '#121a26';
                b.style.color      = isDefault ? '#fff'    : '#cfd6e0';
                b.style.borderColor = isDefault ? '#1a6fd4' : '#2a3a4d';
            });
            const chk = document.getElementById('mc-pdf-credits-check');
            if (chk) chk.checked = true;
            document.getElementById('mc-pdf-opts-modal').style.display = 'flex';
        }

function mcFecharOpcoesPDF() {
            document.getElementById('mc-pdf-opts-modal').style.display = 'none';
        }

function mcSelecionarFonte(btn) {
            const scale = parseFloat(btn.getAttribute('data-scale')) || 1.0;
            _mcPdfFontScale = scale;
            document.querySelectorAll('#mc-pdf-font-options .mc-font-btn').forEach(b => {
                const active = b === btn;
                b.classList.toggle('mc-font-active', active);
                b.style.background = active ? '#1a6fd4' : '#121a26';
                b.style.color      = active ? '#fff'    : '#cfd6e0';
                b.style.borderColor = active ? '#1a6fd4' : '#2a3a4d';
            });
        }

async function mcConfirmarOpcoesPDF() {
            mcFecharOpcoesPDF();
            const chk = document.getElementById('mc-pdf-credits-check');
            const hideCredits = chk ? !chk.checked : false;
            const _pm = document.getElementById('mc-pg-mode'), _pp = document.getElementById('mc-pg-pos');
            window.__mcPgMode = _pm ? _pm.value : 'page';
            window.__mcPgPos = _pp ? _pp.value : 'right';
            const _pc = document.getElementById('mc-pen-color');
            window.__mcPenColor = _pc ? _pc.value : 'black';
            const _hc = document.getElementById('mc-hdr-check'), _tc = document.getElementById('mc-title-check'), _tt = document.getElementById('mc-title-text');
            window.__mcHeaderOn = _hc ? _hc.checked : true;
            window.__mcTitleOn = _tc ? _tc.checked : true;
            window.__mcTitleText = _tt ? _tt.value : null;
            try {
                if (_mcPdfDestino === 'preview') {
                    const res = await mcExportPDF({ style: _mcPdfStyle, fontScale: _mcPdfFontScale, hideCredits, returnBlob: true });
                    const captured = res && res.blob;
                    if (captured) mcShowPreview('pdf', captured);
                    else alert('Não foi possível gerar a pré-visualização.');
                } else if (_mcPdfDestino === 'zip') {
                    await mcExportPdfMemoriaisZipComEstilo(_mcPdfStyle, { fontScale: _mcPdfFontScale, hideCredits });
                } else {
                    await mcExportPDF({ style: _mcPdfStyle, fontScale: _mcPdfFontScale, hideCredits });
                }
            } catch (err) {
                console.error('[PDF design]', err);
                alert('Erro ao gerar PDF: ' + (err.message || err));
            }
        }

// Compat: caso algum código antigo ainda chame mcConfirmarDesignPDF, redireciona pro fluxo novo.
        // Preview rapido do PDF (usa o design/opcoes atuais, sem baixar nada)
async function mcPreviewPdfRapido() {
            if (!window.mcCircuits || !mcCircuits.length) { alert('Adicione pelo menos um circuito.'); return; }
            try {
                const res = await mcExportPDF({ style: _mcPdfStyle, fontScale: _mcPdfFontScale, returnBlob: true });
                if (res && res.blob) mcShowPreview('pdf', res.blob);
                else alert('Não foi possível gerar a pré-visualização.');
            } catch (err) { console.error('[PDF preview]', err); alert('Erro ao gerar preview: ' + (err.message || err)); }
        }

function mcConfirmarDesignPDF(style) { mcEscolherDesignPDF(style); }

// Garante que jsPDF está carregado (mesma lógica da função original)
async function _mcEnsureJsPDF() {
            if (window.jspdf && window.jspdf.jsPDF) return;
            await EO.load('jspdf');
        }

// Mapeia qualquer cor RGB para preto/branco/cinza (estilo minimalista)
function _mcToGray(args) {
            let r = 0, g = 0, b = 0;
            if (args.length === 1) {
                const v = args[0];
                if (typeof v === 'number') { r = g = b = v; }
                else { return [80, 80, 80]; }
            } else if (args.length >= 3) {
                r = +args[0]; g = +args[1]; b = +args[2];
            }
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum >= 235) return [255, 255, 255];
            if (lum >= 200) return [240, 240, 240];
            if (lum >= 150) return [210, 210, 210];
            return [0, 0, 0];
        }

// ── Patches por estilo. Cada um devolve uma função "uninstall". ──
function _mcPatchMinimalista(ns) {
            const Original = ns.jsPDF;
            const Wrapped = function (...ctorArgs) {
                const inst = new Original(...ctorArgs);
                const _fill = inst.setFillColor.bind(inst);
                const _text = inst.setTextColor.bind(inst);
                const _draw = inst.setDrawColor.bind(inst);
                inst.setFillColor = function (...a) {
                    const [r, g, b] = _mcToGray(a); return _fill(r, g, b);
                };
                inst.setTextColor = function (...a) {
                    const [r, g, b] = _mcToGray(a);
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (lum >= 235) return _text(255, 255, 255);
                    return _text(0, 0, 0);
                };
                inst.setDrawColor = function () { return _draw(0, 0, 0); };
                return inst;
            };
            Object.assign(Wrapped, Original);
            Wrapped.prototype = Original.prototype;
            ns.jsPDF = Wrapped;
            return () => { ns.jsPDF = Original; };
        }

// Em Branco: fundo 100% branco (nenhum preenchimento), texto preto, linhas pretas finas.
function _mcPatchBranco(ns) {
            const Original = ns.jsPDF;
            const Wrapped = function (...ctorArgs) {
                const inst = new Original(...ctorArgs);
                const _fill = inst.setFillColor.bind(inst);
                const _text = inst.setTextColor.bind(inst);
                const _draw = inst.setDrawColor.bind(inst);
                inst.setFillColor = function () { return _fill(255, 255, 255); };
                inst.setTextColor = function () { return _text(0, 0, 0); };
                inst.setDrawColor = function () { return _draw(0, 0, 0); };
                return inst;
            };
            Object.assign(Wrapped, Original);
            Wrapped.prototype = Original.prototype;
            ns.jsPDF = Wrapped;
            return () => { ns.jsPDF = Original; };
        }

// Clássico Serifa: usa fonte 'times', cores reduzidas a tons sóbrios (marrom escuro / cinzas).
function _mcPatchSerifa(ns) {
            const Original = ns.jsPDF;
            const Wrapped = function (...ctorArgs) {
                const inst = new Original(...ctorArgs);
                const _setFont = inst.setFont.bind(inst);
                const _fill = inst.setFillColor.bind(inst);
                const _text = inst.setTextColor.bind(inst);
                const _draw = inst.setDrawColor.bind(inst);
                inst.setFont = function (name, style) {
                    return _setFont('times', style || 'normal');
                };
                const sober = (args) => {
                    let r=0,g=0,b=0;
                    if (args.length===1 && typeof args[0]==='number') r=g=b=args[0];
                    else if (args.length>=3){ r=+args[0]; g=+args[1]; b=+args[2]; }
                    const lum = 0.299*r + 0.587*g + 0.114*b;
                    if (lum>=235) return [252,249,242];   // fundo creme claríssimo
                    if (lum>=200) return [240,233,215];   // creme suave
                    if (lum>=150) return [185,170,135];   // bege médio
                    return [60,40,20];                    // marrom muito escuro p/ texto/linhas
                };
                inst.setFillColor = function (...a){ const [r,g,b]=sober(a); return _fill(r,g,b); };
                inst.setTextColor = function (...a){
                    const [r,g,b]=sober(a);
                    const lum=0.299*r+0.587*g+0.114*b;
                    if (lum>=235) return _text(252,249,242);
                    return _text(40,28,15);
                };
                inst.setDrawColor = function (...a){ const [r,g,b]=sober(a); return _draw(r,g,b); };
                try { inst.setFont('times','normal'); } catch(_){}
                return inst;
            };
            Object.assign(Wrapped, Original);
            Wrapped.prototype = Original.prototype;
            ns.jsPDF = Wrapped;
            return () => { ns.jsPDF = Original; };
        }

// Escala global de fonte: multiplica todos os setFontSize.
function _mcPatchFontScale(ns, scale) {
            if (!scale || Math.abs(scale - 1) < 0.001) return () => {};
            const Original = ns.jsPDF;
            const Wrapped = function (...ctorArgs) {
                const inst = new Original(...ctorArgs);
                const _sfs = inst.setFontSize.bind(inst);
                inst.setFontSize = function (sz) { return _sfs(sz * scale); };
                return inst;
            };
            Object.assign(Wrapped, Original);
            Wrapped.prototype = Original.prototype;
            ns.jsPDF = Wrapped;
            return () => { ns.jsPDF = Original; };
        }

// Wrapper público: aplica estilo + escala de fonte sobre a função original
        // Cor de "caneta": todo texto escuro (preto/cinza-escuro) passa a sair na cor escolhida
function _mcPatchPenColor(ns, pen) {
            const PEN = { blue: [20, 50, 160], red: [190, 20, 25] }[pen];
            if (!PEN) return function () {};
            const Original = ns.jsPDF;
            const Wrapped = function (...ctorArgs) {
                const inst = new Original(...ctorArgs);
                const _text = inst.setTextColor.bind(inst);
                inst.setTextColor = function (...a) {
                    let r, g, b;
                    if (a.length === 1 && typeof a[0] === 'number') { r = g = b = a[0]; }
                    else if (a.length >= 3) { r = +a[0]; g = +a[1]; b = +a[2]; }
                    else return _text(...a);
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    const sat = Math.max(r, g, b) - Math.min(r, g, b);
                    if (lum < 130 && sat < 40) return _text(...PEN);
                    return _text(...a);
                };
                return inst;
            };
            Object.assign(Wrapped, Original);
            Wrapped.prototype = Original.prototype;
            ns.jsPDF = Wrapped;
            return function () { ns.jsPDF = Original; };
        }

async function mcExportPDF(opts = {}) {
            const style = opts.style || 'colorido';
            const fontScale = opts.fontScale || 1.0;
            await _mcEnsureJsPDF();
            const ns = window.jspdf;
            const uninstalls = [];
            // caneta primeiro (camada mais interna) -> a cor escolhida vence os estilos
            uninstalls.push(_mcPatchPenColor(ns, window.__mcPenColor || 'black'));
            if (style === 'minimalista') uninstalls.push(_mcPatchMinimalista(ns));
            else if (['branco', 'compacto', 'caderno', 'manu_eco', 'manu_passos'].indexOf(style) >= 0) uninstalls.push(_mcPatchBranco(ns));
            else if (style === 'serifa') uninstalls.push(_mcPatchSerifa(ns));
            uninstalls.push(_mcPatchFontScale(ns, fontScale));
            try {
                return await mcExportPDFOriginal(opts);
            } finally {
                // desfaz na ordem inversa
                for (let i = uninstalls.length - 1; i >= 0; i--) {
                    try { uninstalls[i](); } catch(_) {}
                }
            }
        }

// Wrapper para "Exportar PDF + Memoriais" — reimplementa o ZIP
        // chamando mcExportPDF (com estilo + opções) e mcExportMemoriais.
async function mcExportPdfMemoriaisZipComEstilo(style, extra = {}) {
            if (!window.mcCircuits || !mcCircuits.length) {
                alert('Adicione pelo menos um circuito.'); return;
            }
            try {
                if (typeof window.JSZip === 'undefined') {
                    await EO.load('jszip').catch(() => { });
                }
                if (typeof window.JSZip === 'undefined') {
                    alert('Não foi possível carregar a biblioteca de compactação.');
                    return;
                }
                const pdfRes = await mcExportPDF({ returnBlob: true, style, fontScale: extra.fontScale || 1.0, hideCredits: !!extra.hideCredits });
                if (!pdfRes) return;
                const memRes = await mcExportMemoriais({ returnBlob: true });
                if (!pdfRes || !memRes) { alert('Falha ao gerar PDF ou Memoriais.'); return; }
                const obra = (document.getElementById('mc-obra').value || '').trim();
                const safe = (s) => (s || 'projeto').replace(/[^\w\-\s\.]/g, '_').replace(/\s+/g, '_').slice(0, 60);
                const baseName = safe(obra) || 'projeto';

                const zip = new JSZip();
                zip.file(pdfRes.filename, pdfRes.blob);
                zip.file(memRes.filename, memRes.blob);
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `PDF_e_Memoriais_${baseName}.zip`;
                document.body.appendChild(a); a.click();
                setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
            } catch (err) {
                console.error('[ZIP] Erro:', err);
                alert('Erro ao gerar pacote ZIP: ' + (err.message || err));
            }
        }
