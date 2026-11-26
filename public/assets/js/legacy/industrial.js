/* assets/js/legacy/industrial.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/industrial.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: industrial.html, depois de core.js. */

// ─── CÁLCULO DE CIRCUITOS ────────────────────────────────────
        // Tabelas simplificadas de capacidade de condução (NBR 5410, cobre, PVC 70°C)
const SECOES_COBRE = [0.5, 0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];

const CAP_B1_3 = [0, 0, 0, 14, 18.5, 25, 32, 44, 59, 77, 96, 117, 149, 180, 208];

const CAP_B2_3 = [0, 0, 0, 15, 20, 27, 34, 48, 64, 85, 104, 126, 160, 194, 225];

const CAP_C_3 = [0, 0, 0, 17.5, 24, 32, 41, 57, 76, 99, 122, 158, 203, 246, 285];

// Fatores de agrupamento (NBR 5410 tabela 42)
const FAT_AGRUP = { 1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48, 12: 0.45, 16: 0.41, 20: 0.38 };

function getFatAgrup(n) {
            if (n <= 0) return 1;
            if (FAT_AGRUP[n]) return FAT_AGRUP[n];
            const keys = Object.keys(FAT_AGRUP).map(Number).sort((a, b) => a - b);
            for (let i = keys.length - 1; i >= 0; i--) {
                if (n >= keys[i]) return FAT_AGRUP[keys[i]];
            }
            return 1;
        }

// Fatores de temperatura (PVC 70°C, ref 30°C)
const FAT_TEMP = { 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 };

// ─── NAVEGAÇÃO PROJETOS INDUSTRIAIS ──────────────────────────
function showIndustrialPage(id, btn) {
            document.querySelectorAll('#main-industrial .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-industrial .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id);
            if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-industrial .nav-btn[data-ipage="' + id + '"]');
            if (nb) nb.classList.add('active');
        }

// ─── MOTORES INDUSTRIAIS ─────────────────────────────────────
        // Tabela de correntes nominais de motores trifásicos (NBR 5410 / WEG)
const MOTOR_IN = {
            220: { 0.5: 2.5, 0.75: 3.3, 1: 4.2, 1.5: 5.8, 2: 7.5, 3: 10.4, 5: 16.5, 7.5: 24, 10: 31, 15: 45, 20: 58, 25: 73, 30: 85, 40: 113, 50: 140, 60: 165, 75: 205, 100: 270, 125: 330, 150: 400, 200: 520 },
            380: { 0.5: 1.5, 0.75: 1.9, 1: 2.4, 1.5: 3.4, 2: 4.3, 3: 6.0, 5: 9.6, 7.5: 14, 10: 18, 15: 26, 20: 34, 25: 42, 30: 49, 40: 65, 50: 81, 60: 96, 75: 119, 100: 156, 125: 191, 150: 232, 200: 302 },
            440: { 0.5: 1.3, 0.75: 1.6, 1: 2.1, 1.5: 2.9, 2: 3.7, 3: 5.2, 5: 8.3, 7.5: 12, 10: 15.5, 15: 22.5, 20: 29, 25: 36, 30: 43, 40: 56, 50: 70, 60: 83, 75: 103, 100: 135, 125: 165, 150: 200, 200: 261 },
            660: { 0.5: 0.9, 0.75: 1.1, 1: 1.4, 1.5: 1.9, 2: 2.5, 3: 3.5, 5: 5.5, 7.5: 8, 10: 10.4, 15: 15, 20: 19.4, 25: 24, 30: 28.6, 40: 38, 50: 47, 60: 55, 75: 69, 100: 90, 125: 110, 150: 133, 200: 174 }
        };

const PARTIDA_FATOR = {
            'direta': { fIp: 7, fFus: 3, fDisj: 10 },
            'estrela-triangulo': { fIp: 2.5, fFus: 1.5, fDisj: 3 },
            'compensadora': { fIp: 3.5, fFus: 2, fDisj: 4 },
            'soft-starter': { fIp: 3, fFus: 1.5, fDisj: 3 },
            'inversor': { fIp: 1.2, fFus: 1.3, fDisj: 1.5 }
        };

function calcMotor() {
            const cv = parseFloat(document.getElementById('ind-motor-cv').value);
            const V = parseFloat(document.getElementById('ind-motor-tensao').value);
            const rend = parseFloat(document.getElementById('ind-motor-rend').value) || 0.88;
            const fp = parseFloat(document.getElementById('ind-motor-fp').value) || 0.85;
            const fs = parseFloat(document.getElementById('ind-motor-fs').value) || 1.15;
            const partida = document.getElementById('ind-motor-partida').value;
            const L = parseFloat(document.getElementById('ind-motor-l').value) || 30;
            const metodo = document.getElementById('ind-motor-metodo').value;
            const temp = parseInt(document.getElementById('ind-motor-temp').value) || 40;
            const nAgrup = parseInt(document.getElementById('ind-motor-agrup').value) || 1;

            // Potência em kW
            const Pkw = cv * 0.7355;

            // Corrente nominal (tabela ou calculada)
            let In;
            if (MOTOR_IN[V] && MOTOR_IN[V][cv]) {
                In = MOTOR_IN[V][cv];
            } else {
                In = (Pkw * 1000) / (Math.sqrt(3) * V * rend * fp);
            }

            // Corrente de partida
            const pf = PARTIDA_FATOR[partida] || PARTIDA_FATOR['direta'];
            const Ip = In * pf.fIp;

            // Dimensionamento do condutor
            const fAgrup = getFatAgrup(nAgrup);
            const fTemp = FAT_TEMP[temp] || 0.87;
            const Icorr = (In * 1.25) / (fAgrup * fTemp); // 1.25 = margem para motor

            let capTable;
            if (metodo === 'B1') capTable = CAP_B1_3;
            else if (metodo === 'B2') capTable = CAP_B2_3;
            else if (metodo === 'C') capTable = CAP_C_3;
            else capTable = CAP_B1_3;

            let secao = SECOES_COBRE[SECOES_COBRE.length - 1];
            let capSel = capTable[capTable.length - 1];
            for (let i = 3; i < SECOES_COBRE.length; i++) {
                if (capTable[i] >= Icorr) { secao = SECOES_COBRE[i]; capSel = capTable[i]; break; }
            }

            // Queda de tensão (trifásico)
            const rho = 0.0172;
            const deltaV = (Math.sqrt(3) * rho * L * In) / secao;
            const deltaVPerc = (deltaV / V) * 100;

            // Disjuntor-motor
            const disjPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
            let disjMotor = disjPadroes[disjPadroes.length - 1];
            for (const d of disjPadroes) { if (d >= In * 1.25) { disjMotor = d; break; } }

            // Fusível NH (para partida)
            const fusPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 355, 400, 500, 630];
            const fusFator = partida === 'direta' ? 1.6 : 1.0;
            let fusivel = fusPadroes[fusPadroes.length - 1];
            for (const f of fusPadroes) { if (f >= In * fusFator) { fusivel = f; break; } }

            // Relé térmico
            const releMin = In * 0.95;
            const releMax = In * 1.05;

            // Contator
            const contatores = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 330, 400, 500, 630];
            let contator = contatores[contatores.length - 1];
            for (const c of contatores) { if (c >= In) { contator = c; break; } }

            const grid = document.getElementById('ind-motor-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${Pkw.toFixed(2)}</div><div class="unit">kW</div><div class="desc">Potência mecânica</div></div>
                <div class="predial-result-item"><div class="value">${In.toFixed(2)}</div><div class="unit">A</div><div class="desc">Corrente nominal (In)</div></div>
                <div class="predial-result-item"><div class="value">${Ip.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente de partida (Ip)</div></div>
                <div class="predial-result-item"><div class="value">${secao}</div><div class="unit">mm²</div><div class="desc">Seção do condutor</div></div>
                <div class="predial-result-item"><div class="value">${deltaVPerc.toFixed(2)}</div><div class="unit">%</div><div class="desc">Queda de tensão</div></div>
                <div class="predial-result-item"><div class="value">${disjMotor}</div><div class="unit">A</div><div class="desc">Disjuntor</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>';
            html += '<tr><td>Motor</td><td>' + cv + ' cv (' + Pkw.toFixed(2) + ' kW) / ' + V + ' V</td></tr>';
            html += '<tr><td>Rendimento (η)</td><td>' + (rend * 100).toFixed(1) + '%</td></tr>';
            html += '<tr><td>Fator de potência (cos φ)</td><td>' + fp.toFixed(2) + '</td></tr>';
            html += '<tr><td>Fator de serviço (FS)</td><td>' + fs.toFixed(2) + '</td></tr>';
            html += '<tr><td>Corrente nominal (In)</td><td>' + In.toFixed(2) + ' A</td></tr>';
            html += '<tr><td>Partida: ' + partida + '</td><td>Ip = ' + Ip.toFixed(1) + ' A (' + pf.fIp + '× In)</td></tr>';
            html += '<tr style="border-top:2px solid var(--border)"><td colspan="2" style="font-weight:800;color:var(--accent3)">PROTEÇÃO E MANOBRA</td></tr>';
            html += '<tr><td>Fusível NH</td><td>' + fusivel + ' A</td></tr>';
            html += '<tr><td>Contator</td><td>' + contator + ' A</td></tr>';
            html += '<tr><td>Relé térmico (faixa)</td><td>' + releMin.toFixed(1) + ' – ' + releMax.toFixed(1) + ' A</td></tr>';
            html += '<tr><td>Disjuntor</td><td>' + disjMotor + ' A</td></tr>';
            html += '<tr style="border-top:2px solid var(--border)"><td colspan="2" style="font-weight:800;color:var(--accent3)">CONDUTOR</td></tr>';
            html += '<tr><td>Seção (cobre)</td><td>' + secao + ' mm²</td></tr>';
            html += '<tr><td>Capacidade do cabo (Iz)</td><td>' + capSel.toFixed(1) + ' A</td></tr>';
            html += '<tr><td>Queda de tensão</td><td>' + deltaV.toFixed(2) + ' V (' + deltaVPerc.toFixed(2) + '%)</td></tr>';
            html += '</tbody></table>';

            if (deltaVPerc > 5) {
                html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Queda de tensão de <strong>' + deltaVPerc.toFixed(2) + '%</strong> excede 5% (recomendação para motores). Aumente a seção do condutor.</div>';
            } else {
                html += '<div class="predial-ok"><i data-eo-icon=circle-check></i> Queda de tensão de <strong>' + deltaVPerc.toFixed(2) + '%</strong> — OK para circuito de motor.</div>';
            }

            document.getElementById('ind-motor-detail').innerHTML = html;
            document.getElementById('ind-motor-result').style.display = 'block';
        }

// ─── TRANSFORMADORES ─────────────────────────────────────────
function calcTrafo() {
            const Pinst = parseFloat(document.getElementById('ind-trafo-pot').value) || 75;
            const fd = parseFloat(document.getElementById('ind-trafo-fd').value) || 0.70;
            const fp = parseFloat(document.getElementById('ind-trafo-fp').value) || 0.85;
            const fc = parseFloat(document.getElementById('ind-trafo-fc').value) || 1.25;
            const Vp = parseFloat(document.getElementById('ind-trafo-vp').value) || 13.8;
            const Vs = parseFloat(document.getElementById('ind-trafo-vs').value) || 380;

            const Pdem = Pinst * fd;
            const Sdem = (Pdem / fp) * fc;

            // Potências padronizadas de trafos (kVA)
            const trafoPadroes = [15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];
            let trafoSel = trafoPadroes[trafoPadroes.length - 1];
            for (const t of trafoPadroes) { if (t >= Sdem) { trafoSel = t; break; } }

            const carregamento = (Sdem / trafoSel) * 100;
            const Ip = (trafoSel) / (Math.sqrt(3) * Vp);
            const Is = (trafoSel * 1000) / (Math.sqrt(3) * Vs);

            // Perdas estimadas (valores típicos)
            const perdaVazio = trafoSel * 0.004; // ~0.4% perdas a vazio
            const perdaCarga = trafoSel * 0.012 * Math.pow(Sdem / trafoSel, 2); // ~1.2% perdas em carga

            const grid = document.getElementById('ind-trafo-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${Pdem.toFixed(1)}</div><div class="unit">kW</div><div class="desc">Demanda ativa</div></div>
                <div class="predial-result-item"><div class="value">${Sdem.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Demanda aparente (c/ crescimento)</div></div>
                <div class="predial-result-item"><div class="value">${trafoSel}</div><div class="unit">kVA</div><div class="desc">Trafo selecionado</div></div>
                <div class="predial-result-item"><div class="value">${carregamento.toFixed(1)}</div><div class="unit">%</div><div class="desc">Carregamento</div></div>
                <div class="predial-result-item"><div class="value">${Ip.toFixed(2)}</div><div class="unit">A</div><div class="desc">Corrente primária</div></div>
                <div class="predial-result-item"><div class="value">${Is.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente secundária</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>';
            html += '<tr><td>Potência instalada</td><td>' + Pinst + ' kW</td></tr>';
            html += '<tr><td>Fator de demanda</td><td>' + fd.toFixed(2) + '</td></tr>';
            html += '<tr><td>Fator de potência</td><td>' + fp.toFixed(2) + '</td></tr>';
            html += '<tr><td>Fator de crescimento</td><td>' + fc.toFixed(2) + '</td></tr>';
            html += '<tr><td>Demanda ativa</td><td>' + Pdem.toFixed(1) + ' kW</td></tr>';
            html += '<tr><td>Demanda aparente</td><td>' + Sdem.toFixed(1) + ' kVA</td></tr>';
            html += '<tr style="border-top:2px solid var(--border)"><td colspan="2" style="font-weight:800;color:var(--accent3)">TRANSFORMADOR</td></tr>';
            html += '<tr><td>Potência nominal</td><td>' + trafoSel + ' kVA</td></tr>';
            html += '<tr><td>Tensão</td><td>' + Vp + ' kV / ' + Vs + ' V</td></tr>';
            html += '<tr><td>Carregamento</td><td>' + carregamento.toFixed(1) + '%</td></tr>';
            html += '<tr><td>Corrente primária</td><td>' + Ip.toFixed(2) + ' A</td></tr>';
            html += '<tr><td>Corrente secundária</td><td>' + Is.toFixed(1) + ' A</td></tr>';
            html += '<tr><td>Perdas a vazio (est.)</td><td>' + perdaVazio.toFixed(2) + ' kW</td></tr>';
            html += '<tr><td>Perdas em carga (est.)</td><td>' + perdaCarga.toFixed(2) + ' kW</td></tr>';
            html += '</tbody></table>';

            if (carregamento > 100) {
                html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Carregamento de <strong>' + carregamento.toFixed(1) + '%</strong> — trafo sobrecarregado! Selecione uma potência superior.</div>';
            } else if (carregamento < 50) {
                html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Carregamento de <strong>' + carregamento.toFixed(1) + '%</strong> — trafo superdimensionado. Considere reduzir.</div>';
            } else {
                html += '<div class="predial-ok"><i data-eo-icon=circle-check></i> Carregamento de <strong>' + carregamento.toFixed(1) + '%</strong> — faixa ideal (50-80%).</div>';
            }

            document.getElementById('ind-trafo-detail').innerHTML = html;
            document.getElementById('ind-trafo-result').style.display = 'block';
        }

// ─── PROTEÇÕES ───────────────────────────────────────────────
function calcProtecao() {
            const In = parseFloat(document.getElementById('ind-prot-in').value) || 9.6;
            const ipIn = parseFloat(document.getElementById('ind-prot-ipIn').value) || 7;
            const tipo = document.getElementById('ind-prot-tipo').value;
            const classe = parseInt(document.getElementById('ind-prot-classe').value) || 20;
            const Icc = parseFloat(document.getElementById('ind-prot-icc').value) || 10;

            const Ip = In * ipIn;

            // Relé térmico
            const releMin = In * 0.95;
            const releMax = In * 1.05;

            // Fusível (deve suportar corrente de partida sem atuar)
            const fusPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 355, 400, 500, 630];
            let fusivel = fusPadroes[fusPadroes.length - 1];
            const fusFator = 1.6; // para motor com partida direta
            for (const f of fusPadroes) { if (f >= In * fusFator) { fusivel = f; break; } }

            // Disjuntor
            const disjPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
            let disjuntor = disjPadroes[disjPadroes.length - 1];
            for (const d of disjPadroes) { if (d >= In * 1.25) { disjuntor = d; break; } }

            // Contator
            const contatores = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 330, 400, 500, 630];
            let contator = contatores[contatores.length - 1];
            for (const c of contatores) { if (c >= In) { contator = c; break; } }

            // Capacidade de interrupção necessária
            const capInt = Icc;

            const grid = document.getElementById('ind-prot-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${In.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente nominal</div></div>
                <div class="predial-result-item"><div class="value">${Ip.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente de partida</div></div>
                <div class="predial-result-item"><div class="value">${fusivel}</div><div class="unit">A</div><div class="desc">Fusível NH</div></div>
                <div class="predial-result-item"><div class="value">${contator}</div><div class="unit">A</div><div class="desc">Contator</div></div>
                <div class="predial-result-item"><div class="value">${releMin.toFixed(1)}–${releMax.toFixed(1)}</div><div class="unit">A</div><div class="desc">Relé térmico</div></div>
                <div class="predial-result-item"><div class="value">${disjuntor}</div><div class="unit">A</div><div class="desc">Disjuntor</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Componente</th><th>Especificação</th><th>Critério</th></tr></thead><tbody>';
            if (tipo === 'fusivel-contator-rele') {
                html += '<tr><td>Fusível NH</td><td>' + fusivel + ' A</td><td>In × 1,6 = ' + (In * 1.6).toFixed(1) + ' A</td></tr>';
                html += '<tr><td>Contator</td><td>' + contator + ' A (AC-3)</td><td>≥ In = ' + In.toFixed(1) + ' A</td></tr>';
                html += '<tr><td>Relé térmico</td><td>' + releMin.toFixed(1) + ' – ' + releMax.toFixed(1) + ' A (Classe ' + classe + ')</td><td>Ajuste em torno de In</td></tr>';
            } else if (tipo === 'disjuntor-contator-rele') {
                html += '<tr><td>Disjuntor</td><td>' + disjuntor + ' A (Icu ≥ ' + Icc + ' kA)</td><td>In × 1,25 = ' + (In * 1.25).toFixed(1) + ' A</td></tr>';
                html += '<tr><td>Contator</td><td>' + contator + ' A (AC-3)</td><td>≥ In = ' + In.toFixed(1) + ' A</td></tr>';
                html += '<tr><td>Relé térmico</td><td>' + releMin.toFixed(1) + ' – ' + releMax.toFixed(1) + ' A (Classe ' + classe + ')</td><td>Ajuste em torno de In</td></tr>';
            } else {
                html += '<tr><td>Disjuntor-motor</td><td>' + disjuntor + ' A (Icu ≥ ' + Icc + ' kA)</td><td>In × 1,25 = ' + (In * 1.25).toFixed(1) + ' A</td></tr>';
            }
            html += '</tbody></table>';

            html += '<div class="info-box" style="margin-top:1rem"><p><strong>Capacidade de interrupção necessária:</strong> ≥ ' + capInt + ' kA no ponto de instalação.<br><strong>Corrente de partida:</strong> ' + Ip.toFixed(1) + ' A (' + ipIn + '× In) — proteção de curto-circuito deve suportar sem atuar.<br><strong>Classe do relé térmico ' + classe + ':</strong> ' + (classe === 10 ? 'disparo em até 10s (carga leve)' : classe === 20 ? 'disparo em até 20s (aplicação geral)' : 'disparo em até 30s (carga pesada / alta inércia)') + '.</p></div>';

            if (tipo !== 'disjuntor-motor') {
                html += '<div class="predial-ok"><i data-eo-icon=file-text></i> <strong>Coordenação tipo 2 (NBR IEC 60947-4-1):</strong> Fusível/Disjuntor protege contra curto-circuito, Contator realiza manobras, Relé térmico protege contra sobrecarga.</div>';
            }

            document.getElementById('ind-prot-detail').innerHTML = html;
            document.getElementById('ind-prot-result').style.display = 'block';
        }

// ─── ALIMENTADORES ───────────────────────────────────────────
function calcAlimentador() {
            const Sdem = parseFloat(document.getElementById('ind-alim-dem').value) || 50;
            const V = parseFloat(document.getElementById('ind-alim-tensao').value) || 380;
            const L = parseFloat(document.getElementById('ind-alim-l').value) || 50;
            const mat = document.getElementById('ind-alim-mat').value;
            const metodo = document.getElementById('ind-alim-metodo').value;
            const temp = parseInt(document.getElementById('ind-alim-temp').value) || 40;
            const qdLim = parseFloat(document.getElementById('ind-alim-qdlim').value) || 2;

            const rho = mat === 'cu' ? 0.0172 : 0.0282;
            const I = (Sdem * 1000) / (Math.sqrt(3) * V);
            const fTemp = FAT_TEMP[temp] || 0.87;
            const Icorr = I / fTemp;

            let capTable;
            if (metodo === 'B1') capTable = CAP_B1_3;
            else if (metodo === 'B2') capTable = CAP_B2_3;
            else if (metodo === 'C') capTable = CAP_C_3;
            else capTable = CAP_B1_3;

            let secao = SECOES_COBRE[SECOES_COBRE.length - 1];
            let capSel = capTable[capTable.length - 1];
            for (let i = 3; i < SECOES_COBRE.length; i++) {
                if (capTable[i] >= Icorr) { secao = SECOES_COBRE[i]; capSel = capTable[i]; break; }
            }

            // Verificar queda de tensão e aumentar seção se necessário
            let deltaV = (Math.sqrt(3) * rho * L * I) / secao;
            let deltaVPerc = (deltaV / V) * 100;
            let secaoQV = secao;
            if (deltaVPerc > qdLim) {
                for (let i = 3; i < SECOES_COBRE.length; i++) {
                    const dv = (Math.sqrt(3) * rho * L * I) / SECOES_COBRE[i];
                    if ((dv / V) * 100 <= qdLim) {
                        secaoQV = SECOES_COBRE[i];
                        break;
                    }
                }
                if (secaoQV > secao) secao = secaoQV;
                deltaV = (Math.sqrt(3) * rho * L * I) / secao;
                deltaVPerc = (deltaV / V) * 100;
            }

            const disjPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250];
            let disjuntor = disjPadroes[disjPadroes.length - 1];
            for (const d of disjPadroes) { if (d >= I) { disjuntor = d; break; } }

            const grid = document.getElementById('ind-alim-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${I.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente do alimentador</div></div>
                <div class="predial-result-item"><div class="value">${secao}</div><div class="unit">mm²</div><div class="desc">Seção do condutor</div></div>
                <div class="predial-result-item"><div class="value">${deltaVPerc.toFixed(2)}</div><div class="unit">%</div><div class="desc">Queda de tensão</div></div>
                <div class="predial-result-item"><div class="value">${disjuntor}</div><div class="unit">A</div><div class="desc">Disjuntor geral</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>';
            html += '<tr><td>Demanda</td><td>' + Sdem + ' kVA / ' + V + ' V</td></tr>';
            html += '<tr><td>Corrente</td><td>' + I.toFixed(2) + ' A</td></tr>';
            html += '<tr><td>Seção (' + (mat === 'cu' ? 'Cobre' : 'Alumínio') + ')</td><td>' + secao + ' mm²</td></tr>';
            html += '<tr><td>Capacidade do cabo</td><td>' + capSel.toFixed(1) + ' A</td></tr>';
            html += '<tr><td>Queda de tensão</td><td>' + deltaV.toFixed(2) + ' V (' + deltaVPerc.toFixed(2) + '%)</td></tr>';
            html += '<tr><td>Disjuntor geral</td><td>' + disjuntor + ' A</td></tr>';
            html += '</tbody></table>';

            if (deltaVPerc > qdLim) {
                html += '<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Queda de tensão de <strong>' + deltaVPerc.toFixed(2) + '%</strong> excede o limite de ' + qdLim + '%. Seção aumentada para ' + secao + ' mm².</div>';
            } else {
                html += '<div class="predial-ok"><i data-eo-icon=circle-check></i> Queda de tensão de <strong>' + deltaVPerc.toFixed(2) + '%</strong> — dentro do limite de ' + qdLim + '%.</div>';
            }

            document.getElementById('ind-alim-detail').innerHTML = html;
            document.getElementById('ind-alim-result').style.display = 'block';
        }

// ─── DEMANDA INDUSTRIAL ──────────────────────────────────────
function calcDemanda() {
            const ilum = parseFloat(document.getElementById('ind-dem-ilum').value) || 0;
            const mot1 = parseFloat(document.getElementById('ind-dem-mot1').value) || 0;
            const mot2 = parseFloat(document.getElementById('ind-dem-mot2').value) || 0;
            const mot3 = parseFloat(document.getElementById('ind-dem-mot3').value) || 0;
            const forno = parseFloat(document.getElementById('ind-dem-forno').value) || 0;
            const ar = parseFloat(document.getElementById('ind-dem-ar').value) || 0;
            const fp = parseFloat(document.getElementById('ind-dem-fp').value) || 0.82;

            // Fatores de demanda típicos industriais
            const fdIlum = ilum <= 12 ? 1.0 : 0.85;
            const fdMot1 = 0.80;  // motores até 10 cv
            const fdMot2 = 0.85;  // motores 10-50 cv
            const fdMot3 = 1.00;  // motores > 50 cv (maior motor em 100%)
            const fdForno = 1.00;
            const fdAr = 1.00;

            const demIlum = ilum * fdIlum;
            const demMot1 = mot1 * fdMot1;
            const demMot2 = mot2 * fdMot2;
            const demMot3 = mot3 * fdMot3;
            const demForno = forno * fdForno;
            const demAr = ar * fdAr;

            const demTotal = demIlum + demMot1 + demMot2 + demMot3 + demForno + demAr;
            const Sdem = demTotal / fp;

            // Trafo sugerido
            const trafoPadroes = [15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];
            let trafo = trafoPadroes[trafoPadroes.length - 1];
            const ScomCresc = Sdem * 1.25;
            for (const t of trafoPadroes) { if (t >= ScomCresc) { trafo = t; break; } }

            const Pinst = ilum + mot1 + mot2 + mot3 + forno + ar;

            const grid = document.getElementById('ind-dem-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${Pinst.toFixed(1)}</div><div class="unit">kW</div><div class="desc">Potência instalada</div></div>
                <div class="predial-result-item"><div class="value">${demTotal.toFixed(1)}</div><div class="unit">kW</div><div class="desc">Demanda ativa</div></div>
                <div class="predial-result-item"><div class="value">${Sdem.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Demanda aparente</div></div>
                <div class="predial-result-item"><div class="value">${ScomCresc.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Com reserva (+25%)</div></div>
                <div class="predial-result-item"><div class="value">${trafo}</div><div class="unit">kVA</div><div class="desc">Trafo sugerido</div></div>
                <div class="predial-result-item"><div class="value">${((Sdem / trafo) * 100).toFixed(1)}</div><div class="unit">%</div><div class="desc">Carregamento</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Tipo de Carga</th><th>Instalada (kW)</th><th>FD</th><th>Demanda (kW)</th></tr></thead><tbody>';
            html += '<tr><td>Iluminação + Tomadas</td><td>' + ilum.toFixed(1) + '</td><td>' + fdIlum.toFixed(2) + '</td><td>' + demIlum.toFixed(1) + '</td></tr>';
            html += '<tr><td>Motores até 10 cv</td><td>' + mot1.toFixed(1) + '</td><td>' + fdMot1.toFixed(2) + '</td><td>' + demMot1.toFixed(1) + '</td></tr>';
            html += '<tr><td>Motores 10–50 cv</td><td>' + mot2.toFixed(1) + '</td><td>' + fdMot2.toFixed(2) + '</td><td>' + demMot2.toFixed(1) + '</td></tr>';
            html += '<tr><td>Motores > 50 cv</td><td>' + mot3.toFixed(1) + '</td><td>' + fdMot3.toFixed(2) + '</td><td>' + demMot3.toFixed(1) + '</td></tr>';
            html += '<tr><td>Fornos / Soldas</td><td>' + forno.toFixed(1) + '</td><td>' + fdForno.toFixed(2) + '</td><td>' + demForno.toFixed(1) + '</td></tr>';
            html += '<tr><td>Ar condicionado</td><td>' + ar.toFixed(1) + '</td><td>' + fdAr.toFixed(2) + '</td><td>' + demAr.toFixed(1) + '</td></tr>';
            html += '<tr style="font-weight:700;border-top:2px solid var(--border)"><td>TOTAL</td><td>' + Pinst.toFixed(1) + '</td><td></td><td>' + demTotal.toFixed(1) + '</td></tr>';
            html += '</tbody></table>';

            html += '<div class="info-box" style="margin-top:.8rem"><p><strong>Demanda aparente:</strong> ' + Sdem.toFixed(1) + ' kVA (FP = ' + fp + ')<br><strong>Com reserva de 25%:</strong> ' + ScomCresc.toFixed(1) + ' kVA<br><strong>Transformador sugerido:</strong> ' + trafo + ' kVA (' + ((Sdem / trafo) * 100).toFixed(1) + '% de carregamento)</p></div>';

            document.getElementById('ind-dem-detail').innerHTML = html;
            document.getElementById('ind-dem-result').style.display = 'block';
        }

// ─── EXPORTAR MOTOR XLSX ─────────────────────────────────────
function exportMotorXLSX() {
            const cv = document.getElementById('ind-motor-cv').value;
            const tensao = document.getElementById('ind-motor-tensao').value;
            const rend = document.getElementById('ind-motor-rend').value;
            const fp = document.getElementById('ind-motor-fp').value;
            const fs = document.getElementById('ind-motor-fs').value;
            const partida = document.getElementById('ind-motor-partida').value;
            const L = document.getElementById('ind-motor-l').value;
            const metodo = document.getElementById('ind-motor-metodo').value;
            const temp = document.getElementById('ind-motor-temp').value;
            const agrup = document.getElementById('ind-motor-agrup').value;

            const Pkw = parseFloat(cv) * 0.7355;
            const In = Pkw / (Math.sqrt(3) * parseFloat(tensao) / 1000 * parseFloat(fp) * parseFloat(rend));
            const Infs = In * parseFloat(fs);
            const ipFatores = { 'direta': 7, 'estrela-triangulo': 2.5, 'compensadora': 3.5, 'soft-starter': 3, 'inversor': 1.2 };
            const Ip = In * (ipFatores[partida] || 7);
            const Idisp = Infs * 1.15;

            const rows = [
                ['Parâmetro', 'Valor', 'Unidade'],
                ['Potência do motor', cv, 'cv'],
                ['Potência em kW', Pkw.toFixed(2), 'kW'],
                ['Tensão nominal', tensao, 'V'],
                ['Rendimento (η)', rend, ''],
                ['Fator de potência', fp, ''],
                ['Fator de serviço', fs, ''],
                ['Tipo de partida', partida, ''],
                ['Comprimento', L, 'm'],
                ['Método de instalação', metodo, ''],
                ['Temperatura', temp, '°C'],
                ['Circuitos agrupados', agrup, ''],
                ['Corrente nominal (In)', In.toFixed(2), 'A'],
                ['Corrente c/ FS (In×FS)', Infs.toFixed(2), 'A'],
                ['Corrente de partida (Ip)', Ip.toFixed(2), 'A'],
                ['Corrente do disjuntor', Idisp.toFixed(2), 'A'],
            ];
            downloadCSVasXLSX(rows, 'Motor_' + cv + 'cv_' + tensao + 'V');
        }

// ─── EXPORTAR DEMANDA XLSX ───────────────────────────────────
function exportDemandaXLSX() {
            const ilum = parseFloat(document.getElementById('ind-dem-ilum').value) || 0;
            const mot1 = parseFloat(document.getElementById('ind-dem-mot1').value) || 0;
            const mot2 = parseFloat(document.getElementById('ind-dem-mot2').value) || 0;
            const mot3 = parseFloat(document.getElementById('ind-dem-mot3').value) || 0;
            const forno = parseFloat(document.getElementById('ind-dem-forno').value) || 0;
            const ar = parseFloat(document.getElementById('ind-dem-ar').value) || 0;
            const fp = parseFloat(document.getElementById('ind-dem-fp').value) || 0.82;

            const fdIlum = ilum <= 12 ? 1.0 : 0.85;
            const fdMot1 = 0.80; const fdMot2 = 0.85; const fdMot3 = 1.00;
            const demIlum = ilum * fdIlum, demMot1 = mot1 * fdMot1, demMot2 = mot2 * fdMot2;
            const demMot3 = mot3 * fdMot3, demForno = forno, demAr = ar;
            const demTotal = demIlum + demMot1 + demMot2 + demMot3 + demForno + demAr;
            const Sdem = demTotal / fp;
            const ScomCresc = Sdem * 1.25;
            const Pinst = ilum + mot1 + mot2 + mot3 + forno + ar;
            const trafoPadroes = [15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];
            let trafo = trafoPadroes[trafoPadroes.length - 1];
            for (const t of trafoPadroes) { if (t >= ScomCresc) { trafo = t; break; } }

            const rows = [
                ['Tipo de Carga', 'Potência Instalada (kW)', 'Fator de Demanda', 'Demanda (kW)'],
                ['Iluminação + Tomadas', ilum.toFixed(1), fdIlum.toFixed(2), demIlum.toFixed(1)],
                ['Motores até 10 cv', mot1.toFixed(1), fdMot1.toFixed(2), demMot1.toFixed(1)],
                ['Motores 10–50 cv', mot2.toFixed(1), fdMot2.toFixed(2), demMot2.toFixed(1)],
                ['Motores > 50 cv', mot3.toFixed(1), fdMot3.toFixed(2), demMot3.toFixed(1)],
                ['Fornos / Soldas', forno.toFixed(1), '1,00', demForno.toFixed(1)],
                ['Ar condicionado', ar.toFixed(1), '1,00', demAr.toFixed(1)],
                ['TOTAL', Pinst.toFixed(1), '', demTotal.toFixed(1)],
                [],
                ['Resumo', 'Valor', 'Unidade'],
                ['Fator de potência', fp.toFixed(2), ''],
                ['Demanda aparente', Sdem.toFixed(1), 'kVA'],
                ['Com reserva 25%', ScomCresc.toFixed(1), 'kVA'],
                ['Transformador sugerido', trafo, 'kVA'],
                ['Carregamento', ((Sdem / trafo) * 100).toFixed(1), '%'],
            ];
            downloadCSVasXLSX(rows, 'Demanda_Industrial');
        }

// ─── SUBESTAÇÃO ──────────────────────────────────────────────
let _subData = {};

function calcSubestacao() {
            const Vp = parseFloat(document.getElementById('sub-vp').value);
            const Vs = parseFloat(document.getElementById('sub-vs').value);
            const tipo = document.getElementById('sub-tipo').value;
            const Pinst = parseFloat(document.getElementById('sub-pot').value) || 0;
            const fd = parseFloat(document.getElementById('sub-fd').value) || 0.75;
            const fp = parseFloat(document.getElementById('sub-fp').value) || 0.85;
            const reserva = parseFloat(document.getElementById('sub-reserva').value) || 1.25;
            const Icc = parseFloat(document.getElementById('sub-icc').value) || 12.5;

            const Pdem = Pinst * fd;
            const Sdem = Pdem / fp;
            const ScomReserva = Sdem * reserva;

            const trafoPadroes = [15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];
            let trafo = trafoPadroes[trafoPadroes.length - 1];
            for (const t of trafoPadroes) { if (t >= ScomReserva) { trafo = t; break; } }

            const IprimAT = (trafo * 1000) / (Math.sqrt(3) * Vp * 1000);
            const IsecBT = (trafo * 1000) / (Math.sqrt(3) * Vs);
            const carregamento = (Sdem / trafo) * 100;

            // Correntes de proteção AT
            const IdisjMT = IprimAT * 1.25;
            const IdisjBT_padroes = [100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000];
            let IdisjBT = IdisjBT_padroes[IdisjBT_padroes.length - 1];
            for (const d of IdisjBT_padroes) { if (d >= IsecBT * 1.10) { IdisjBT = d; break; } }

            // Cabo AT
            const IcaboAT = IprimAT;
            const secoesMT = [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
            const capMT = [55, 75, 95, 115, 140, 175, 210, 245, 280, 325, 385, 440];
            let secaoAT = secoesMT[secoesMT.length - 1];
            for (let i = 0; i < secoesMT.length; i++) { if (capMT[i] >= IcaboAT * 1.25) { secaoAT = secoesMT[i]; break; } }

            // Barramento BT
            const IbarBT = IsecBT;
            const secoesBar = [50, 70, 95, 120, 150, 185, 240, 300];
            const capBar = [170, 210, 265, 305, 345, 395, 460, 530];
            let secaoBar = secoesBar[secoesBar.length - 1];
            for (let i = 0; i < secoesBar.length; i++) { if (capBar[i] >= IbarBT * 1.10) { secaoBar = secoesBar[i]; break; } }

            _subData = {
                Vp, Vs, tipo, Pinst, fd, fp, reserva, Icc, Pdem, Sdem, ScomReserva, trafo,
                IprimAT, IsecBT, carregamento, IdisjMT, IdisjBT, secaoAT, secaoBar
            };

            const tipoNome = { aerea: 'Aérea (Poste)', abrigada: 'Abrigada (Cabine)', blindada: 'Blindada (GIS)' };
            const grid = document.getElementById('sub-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${Sdem.toFixed(0)}</div><div class="unit">kVA</div><div class="desc">Demanda aparente</div></div>
                <div class="predial-result-item"><div class="value">${trafo}</div><div class="unit">kVA</div><div class="desc">Transformador sugerido</div></div>
                <div class="predial-result-item"><div class="value">${carregamento.toFixed(1)}</div><div class="unit">%</div><div class="desc">Carregamento do trafo</div></div>
                <div class="predial-result-item"><div class="value">${IprimAT.toFixed(2)}</div><div class="unit">A</div><div class="desc">Corrente primária (AT)</div></div>
                <div class="predial-result-item"><div class="value">${IsecBT.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente secundária (BT)</div></div>
                <div class="predial-result-item"><div class="value">${IdisjBT}</div><div class="unit">A</div><div class="desc">Disjuntor geral BT</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>';
            html += `<tr><td>Tipo de subestação</td><td>${tipoNome[tipo]}</td></tr>`;
            html += `<tr><td>Tensão primária / secundária</td><td>${Vp} kV / ${Vs} V</td></tr>`;
            html += `<tr><td>Potência instalada</td><td>${Pinst} kW</td></tr>`;
            html += `<tr><td>Fator de demanda</td><td>${fd}</td></tr>`;
            html += `<tr><td>Demanda ativa</td><td>${Pdem.toFixed(1)} kW</td></tr>`;
            html += `<tr><td>Fator de potência</td><td>${fp}</td></tr>`;
            html += `<tr><td>Demanda aparente</td><td>${Sdem.toFixed(1)} kVA</td></tr>`;
            html += `<tr><td>Com reserva (${Math.round((reserva - 1) * 100)}%)</td><td>${ScomReserva.toFixed(1)} kVA</td></tr>`;
            html += `<tr style="font-weight:700"><td>Transformador sugerido</td><td>${trafo} kVA</td></tr>`;
            html += `<tr><td>Carregamento</td><td>${carregamento.toFixed(1)}%</td></tr>`;
            html += `<tr><td>Corrente primária AT</td><td>${IprimAT.toFixed(2)} A</td></tr>`;
            html += `<tr><td>Corrente secundária BT</td><td>${IsecBT.toFixed(1)} A</td></tr>`;
            html += `<tr><td>Disjuntor MT (sugerido)</td><td>${IdisjMT.toFixed(1)} A — verificar com fabricante</td></tr>`;
            html += `<tr><td>Disjuntor geral BT</td><td>${IdisjBT} A</td></tr>`;
            html += `<tr><td>Seção do cabo AT</td><td>${secaoAT} mm²</td></tr>`;
            html += `<tr><td>Barramento BT</td><td>${secaoBar} mm² (por fase)</td></tr>`;
            html += `<tr><td>Corrente de curto-circuito</td><td>${Icc} kA</td></tr>`;
            html += '</tbody></table>';

            if (carregamento > 80) {
                html += `<div class="predial-warn"><i data-eo-icon=triangle-alert></i> Carregamento de <strong>${carregamento.toFixed(1)}%</strong> está elevado. Considere um transformador de maior potência.</div>`;
            } else {
                html += `<div class="predial-ok"><i data-eo-icon=circle-check></i> Carregamento de <strong>${carregamento.toFixed(1)}%</strong> dentro de faixa adequada (≤ 80%).</div>`;
            }

            document.getElementById('sub-detail').innerHTML = html;
            document.getElementById('sub-result').style.display = 'block';
        }

function calcCapacitor() {
            const P = parseFloat(document.getElementById('sub-cap-p').value) || 0;
            const fp1 = parseFloat(document.getElementById('sub-cap-fp1').value) || 0.72;
            const fp2 = parseFloat(document.getElementById('sub-cap-fp2').value) || 0.92;
            const V = parseFloat(document.getElementById('sub-cap-v').value) || 380;

            const Q1 = P * Math.tan(Math.acos(fp1));
            const Q2 = P * Math.tan(Math.acos(fp2));
            const Qc = Q1 - Q2;
            const Ic = Qc * 1000 / (Math.sqrt(3) * V);
            const S1 = P / fp1;
            const S2 = P / fp2;

            const capPadroes = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 250, 300];
            let capSel = capPadroes[capPadroes.length - 1];
            for (const c of capPadroes) { if (c >= Qc) { capSel = c; break; } }

            const grid = document.getElementById('sub-cap-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${Qc.toFixed(1)}</div><div class="unit">kVAr</div><div class="desc">Potência reativa a compensar</div></div>
                <div class="predial-result-item"><div class="value">${capSel}</div><div class="unit">kVAr</div><div class="desc">Banco de capacitores</div></div>
                <div class="predial-result-item"><div class="value">${Ic.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente do banco</div></div>
                <div class="predial-result-item"><div class="value">${S2.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Nova demanda aparente</div></div>
            `;
            let html = `<div class="info-box" style="margin-top:.5rem"><p>
                <strong>Sem compensação:</strong> ${S1.toFixed(1)} kVA (FP = ${fp1}) → Q₁ = ${Q1.toFixed(1)} kVAr<br>
                <strong>Com compensação:</strong> ${S2.toFixed(1)} kVA (FP = ${fp2}) → Q₂ = ${Q2.toFixed(1)} kVAr<br>
                <strong>Banco necessário:</strong> ${Qc.toFixed(1)} kVAr → Padrão: <strong>${capSel} kVAr</strong><br>
                <strong>Redução na demanda aparente:</strong> ${(S1 - S2).toFixed(1)} kVA (${(((S1 - S2) / S1) * 100).toFixed(1)}%)
            </p></div>`;
            document.getElementById('sub-cap-detail').innerHTML = html;
            document.getElementById('sub-cap-result').style.display = 'block';
        }

// ─── EXPORTAR SUBESTAÇÃO XLSX ────────────────────────────────
function exportSubestacaoXLSX() {
            const d = _subData;
            if (!d.trafo) { alert('Calcule a subestação primeiro!'); return; }
            const tipoNome = { aerea: 'Aérea (Poste)', abrigada: 'Abrigada (Cabine)', blindada: 'Blindada (GIS)' };
            const rows = [
                ['PROJETO DE SUBESTAÇÃO — Relatório Técnico'],
                [],
                ['Parâmetro', 'Valor', 'Unidade'],
                ['Tipo de subestação', tipoNome[d.tipo] || d.tipo, ''],
                ['Tensão primária (AT)', d.Vp, 'kV'],
                ['Tensão secundária (BT)', d.Vs, 'V'],
                ['Potência instalada', d.Pinst, 'kW'],
                ['Fator de demanda', d.fd, ''],
                ['Demanda ativa', d.Pdem.toFixed(1), 'kW'],
                ['Fator de potência', d.fp, ''],
                ['Demanda aparente', d.Sdem.toFixed(1), 'kVA'],
                ['Com reserva (' + Math.round((d.reserva - 1) * 100) + '%)', d.ScomReserva.toFixed(1), 'kVA'],
                ['Transformador sugerido', d.trafo, 'kVA'],
                ['Carregamento do trafo', d.carregamento.toFixed(1), '%'],
                ['Corrente primária (AT)', d.IprimAT.toFixed(2), 'A'],
                ['Corrente secundária (BT)', d.IsecBT.toFixed(1), 'A'],
                ['Disjuntor MT', d.IdisjMT.toFixed(1), 'A (verificar com fabricante)'],
                ['Disjuntor geral BT', d.IdisjBT, 'A'],
                ['Seção cabo AT', d.secaoAT, 'mm²'],
                ['Barramento BT', d.secaoBar, 'mm² (por fase)'],
                ['Corrente de curto-circuito', d.Icc, 'kA'],
            ];
            downloadCSVasXLSX(rows, 'Projeto_Subestacao_' + d.trafo + 'kVA');
        }

// ═══════════════════════════════════════════════════════════════
        // CCM — Centro de Controle de Motores
        // ═══════════════════════════════════════════════════════════════
let ccmMotors = [];

let ccmNextId = 1;

function ccmAddMotor() {
            ccmMotors.push({ id: ccmNextId++ });
            ccmRenderList();
        }

function ccmRemoveMotor(id) {
            ccmMotors = ccmMotors.filter(m => m.id !== id);
            ccmRenderList();
        }

function ccmRenderList() {
            const container = document.getElementById('ccm-motor-list');
            if (!container) return;
            container.innerHTML = '';
            if (ccmMotors.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-dim);font-size:.85rem">Nenhum motor adicionado. Clique em "Adicionar Motor".</div>';
                return;
            }
            ccmMotors.forEach((m, idx) => {
                const div = document.createElement('div');
                div.style.cssText = 'background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.9rem;margin-bottom:.6rem';
                div.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem">
                        <strong style="font-size:.85rem">Motor ${idx + 1}</strong>
                        <button type="button" class="btn btn-danger-outline eo-row-remove" onclick="ccmRemoveMotor(${m.id})" title="Remover motor" aria-label="Remover motor" data-eo-action="industrial:remove-ccm-motor"><i data-eo-icon=x></i></button>
                    </div>
                    <div class="predial-input-grid" style="gap:.5rem">
                        <div class="predial-input-group">
                            <label>Identificação</label>
                            <input type="text" id="ccm-tag-${m.id}" value="M${idx + 1}" style="background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.4rem .6rem;border-radius:6px;font-family:'Space Mono',monospace;font-size:.8rem">
                        </div>
                        <div class="predial-input-group">
                            <label>Potência (cv)</label>
                            <select id="ccm-cv-${m.id}">
                                <option value="0.5">0,5</option><option value="0.75">0,75</option>
                                <option value="1">1</option><option value="1.5">1,5</option>
                                <option value="2">2</option><option value="3">3</option>
                                <option value="5" selected>5</option><option value="7.5">7,5</option>
                                <option value="10">10</option><option value="15">15</option>
                                <option value="20">20</option><option value="25">25</option>
                                <option value="30">30</option><option value="40">40</option>
                                <option value="50">50</option><option value="75">75</option>
                                <option value="100">100</option><option value="125">125</option>
                                <option value="150">150</option><option value="200">200</option>
                            </select>
                        </div>
                        <div class="predial-input-group">
                            <label>Partida</label>
                            <select id="ccm-part-${m.id}">
                                <option value="direta">Direta</option>
                                <option value="estrela-triangulo">Y-Δ</option>
                                <option value="soft-starter">Soft-Starter</option>
                                <option value="inversor">Inversor</option>
                            </select>
                        </div>
                        <div class="predial-input-group">
                            <label>Rendimento</label>
                            <input type="number" id="ccm-rend-${m.id}" value="0.88" min="0.5" max="0.99" step="0.01" style="background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.4rem .6rem;border-radius:6px;font-family:'Space Mono',monospace;font-size:.8rem">
                        </div>
                        <div class="predial-input-group">
                            <label>FP</label>
                            <input type="number" id="ccm-fp-${m.id}" value="0.85" min="0.5" max="1" step="0.01" style="background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.4rem .6rem;border-radius:6px;font-family:'Space Mono',monospace;font-size:.8rem">
                        </div>
                        <div class="predial-input-group">
                            <label>Fator de Serviço (FS)</label>
                            <input type="number" id="ccm-fs-${m.id}" value="1.15" min="1.0" max="1.5" step="0.05" style="background:var(--surface);border:1px solid var(--border);color:var(--text);padding:.4rem .6rem;border-radius:6px;font-family:'Space Mono',monospace;font-size:.8rem">
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        }

// Init with 3 motors
(function () { ccmAddMotor(); ccmAddMotor(); ccmAddMotor() })();

let _ccmData = null;

function calcCCM() {
            const tensaoMT = parseFloat(document.getElementById('ccm-tensao-mt').value) || 13.8;
            const tensao = parseFloat(document.getElementById('ccm-tensao').value) || 380;
            const fd = parseFloat(document.getElementById('ccm-fd').value) || 0.75;
            const fpGeral = parseFloat(document.getElementById('ccm-fp').value) || 0.85;
            const icc = parseFloat(document.getElementById('ccm-icc').value) || 25;

            const motors = ccmMotors.map(m => {
                const tag = (document.getElementById('ccm-tag-' + m.id) || {}).value || 'M?';
                const cv = parseFloat((document.getElementById('ccm-cv-' + m.id) || {}).value) || 5;
                const partida = (document.getElementById('ccm-part-' + m.id) || {}).value || 'direta';
                const rend = parseFloat((document.getElementById('ccm-rend-' + m.id) || {}).value) || 0.88;
                const fp = parseFloat((document.getElementById('ccm-fp-' + m.id) || {}).value) || 0.85;
                const fs = parseFloat((document.getElementById('ccm-fs-' + m.id) || {}).value) || 1.15;
                const Pkw = cv * 0.7355;
                const In = Pkw * 1000 / (Math.sqrt(3) * tensao * rend * fp);
                const InFS = In * fs;
                const fPartida = { direta: 7, 'estrela-triangulo': 2.5, 'soft-starter': 3, inversor: 1.2 }[partida] || 7;
                const Ip = In * fPartida;
                // Disjuntor motor
                const disjPadroes = [0.63, 1, 1.6, 2.5, 4, 6.3, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
                let disj = disjPadroes[disjPadroes.length - 1];
                for (const d of disjPadroes) { if (d >= In * 1.25) { disj = d; break; } }
                // Contator
                const contatores = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 330, 400, 500, 630];
                let contator = contatores[contatores.length - 1];
                for (const c of contatores) { if (c >= In * 1.10) { contator = c; break; } }
                // Relé térmico
                const faixaRele = In.toFixed(1) + ' – ' + (In * 1.20).toFixed(1) + ' A';
                // Fusível NH
                const fusPadroes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 355, 400, 500, 630];
                const fusFator = partida === 'direta' ? 1.6 : 1.0;
                let fusivel = fusPadroes[fusPadroes.length - 1];
                for (const f of fusPadroes) { if (f >= In * fusFator) { fusivel = f; break; } }

                // ── Coordenação de proteção (Tipo 2 — NBR IEC 60947-4-1)
                const coordDisjFus = disj <= fusivel;
                const coordReleDisj = In <= disj;
                const coordOk = coordDisjFus && coordReleDisj;
                const coordTipo = coordOk ? 'Tipo 2 — OK' : 'Verificar seleção';
                const coordDesc = partida === 'direta'
                    ? 'Fusível NH ' + fusivel + 'A + Contator ' + contator + 'A + Relé ' + faixaRele
                    : partida === 'inversor' || partida === 'soft-starter'
                        ? 'Disjuntor ' + disj + 'A + ' + (partida === 'inversor' ? 'Inversor' : 'Soft-Starter') + ' + Motor'
                        : 'Fusível NH ' + fusivel + 'A + Contator ' + contator + 'A + Relé ' + faixaRele;

                // ── Dissipação térmica do motor (perdas Joule estimadas)
                const PerdaMotor_W = Pkw * 1000 * ((1 - rend) / rend);
                const PerdaMotor_kcalH = PerdaMotor_W * 0.86;

                // ── Dissipação térmica do inversor ou soft-starter
                let PerdaInvSS_W = 0;
                let tipoDispPartida = '—';
                if (partida === 'inversor') {
                    PerdaInvSS_W = Pkw * 1000 * 0.03;
                    tipoDispPartida = 'Inversor (~3% perdas)';
                } else if (partida === 'soft-starter') {
                    PerdaInvSS_W = Pkw * 1000 * 0.01;
                    tipoDispPartida = 'Soft-Starter (~1% perdas em regime)';
                }
                const PerdaInvSS_kcalH = PerdaInvSS_W * 0.86;

                // ── Protocolo de modificação
                const protocolo = 'Rev.0 — Projeto original';

                return {
                    tag, cv, Pkw, partida, rend, fp, fs, In, InFS, Ip, disj, contator, faixaRele, fusivel,
                    coordTipo, coordDesc, coordOk,
                    PerdaMotor_W, PerdaMotor_kcalH,
                    PerdaInvSS_W, PerdaInvSS_kcalH, tipoDispPartida,
                    protocolo
                };
            });

            const PtotalInst = motors.reduce((s, m) => s + m.Pkw, 0);
            const ItotalNom = motors.reduce((s, m) => s + m.In, 0);
            const PtotalDem = PtotalInst * fd;
            const Sdem = PtotalDem / fpGeral;
            const Idem = Sdem * 1000 / (Math.sqrt(3) * tensao);

            // Dissipação térmica total
            const PerdaMotorTotal_W = motors.reduce((s, m) => s + m.PerdaMotor_W, 0);
            const PerdaInvSSTotal_W = motors.reduce((s, m) => s + m.PerdaInvSS_W, 0);
            const PerdaTotal_W = PerdaMotorTotal_W + PerdaInvSSTotal_W;

            // Barramento
            const secoesBar = [50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
            const capBar = [170, 210, 265, 305, 345, 395, 460, 530, 630, 760];
            let secaoBar = secoesBar[secoesBar.length - 1];
            for (let i = 0; i < secoesBar.length; i++) { if (capBar[i] >= Idem * 1.15) { secaoBar = secoesBar[i]; break; } }

            // Disjuntor geral
            const disjGerais = [100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000];
            let disjGeral = disjGerais[disjGerais.length - 1];
            for (const d of disjGerais) { if (d >= Idem * 1.10) { disjGeral = d; break; } }

            // Corrente no lado MT do transformador
            const IdemMT = Sdem / (Math.sqrt(3) * tensaoMT);
            _ccmData = { tensaoMT, tensao, fd, fpGeral, icc, motors, PtotalInst, PtotalDem, Sdem, Idem, IdemMT, ItotalNom, secaoBar, disjGeral, PerdaMotorTotal_W, PerdaInvSSTotal_W, PerdaTotal_W };

            const grid = document.getElementById('ccm-result-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${motors.length}</div><div class="unit">motores</div><div class="desc">Quantidade</div></div>
                <div class="predial-result-item"><div class="value">${PtotalInst.toFixed(1)}</div><div class="unit">kW</div><div class="desc">Potência instalada</div></div>
                <div class="predial-result-item"><div class="value">${PtotalDem.toFixed(1)}</div><div class="unit">kW</div><div class="desc">Demanda (FD=${fd})</div></div>
                <div class="predial-result-item"><div class="value">${Sdem.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Demanda aparente</div></div>
                <div class="predial-result-item"><div class="value">${Idem.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente de demanda</div></div>
                <div class="predial-result-item"><div class="value">${disjGeral}</div><div class="unit">A</div><div class="desc">Disjuntor geral</div></div>
                <div class="predial-result-item"><div class="value">${secaoBar}</div><div class="unit">mm²</div><div class="desc">Barramento (por fase)</div></div>
                <div class="predial-result-item"><div class="value">${tensaoMT.toFixed(1)}</div><div class="unit">kV</div><div class="desc">Tensão MT da rede</div></div>
                <div class="predial-result-item"><div class="value">${IdemMT.toFixed(2)}</div><div class="unit">A</div><div class="desc">Corrente no lado MT</div></div>
                <div class="predial-result-item"><div class="value">${PerdaTotal_W.toFixed(0)}</div><div class="unit">W</div><div class="desc">Dissipação térmica total</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Tag</th><th>CV</th><th>kW</th><th>FS</th><th>Partida</th><th>In (A)</th><th>In×FS (A)</th><th>Ip (A)</th><th>Disj. (A)</th><th>Contator (A)</th><th>Relé Térmico</th></tr></thead><tbody>';
            motors.forEach(m => {
                html += `<tr><td>${m.tag}</td><td>${m.cv}</td><td>${m.Pkw.toFixed(2)}</td><td>${m.fs}</td><td>${m.partida}</td><td>${m.In.toFixed(2)}</td><td>${m.InFS.toFixed(2)}</td><td>${m.Ip.toFixed(1)}</td><td>${m.disj}</td><td>${m.contator}</td><td>${m.faixaRele}</td></tr>`;
            });
            html += `<tr style="font-weight:700"><td>TOTAL</td><td></td><td>${PtotalInst.toFixed(2)}</td><td></td><td></td><td>${ItotalNom.toFixed(2)}</td><td></td><td></td><td>${disjGeral} (geral)</td><td></td><td></td></tr>`;
            html += '</tbody></table>';

            // ── Coordenação de Proteção
            html += '<div class="card" style="margin-top:1rem"><div class="card-header"><div class="dot dot-purple"></div><h3><i data-eo-icon=lock></i> Coordenação de Proteção</h3></div>';
            html += '<table class="predial-table"><thead><tr><th>Tag</th><th>Fusível (A)</th><th>Disj. (A)</th><th>Contator (A)</th><th>Relé Térmico</th><th>Coordenação</th><th>Descrição</th></tr></thead><tbody>';
            motors.forEach(m => {
                const cor = m.coordOk ? 'color:var(--accent4)' : 'color:var(--accent2)';
                html += `<tr><td>${m.tag}</td><td>${m.fusivel}</td><td>${m.disj}</td><td>${m.contator}</td><td>${m.faixaRele}</td><td style="${cor};font-weight:700">${m.coordTipo}</td><td style="font-size:.75rem">${m.coordDesc}</td></tr>`;
            });
            html += '</tbody></table></div>';

            // ── Dissipação Térmica
            html += '<div class="card" style="margin-top:1rem"><div class="card-header"><div class="dot dot-orange"></div><h3><i data-eo-icon=gauge></i> Dissipação Térmica</h3></div>';
            html += '<table class="predial-table"><thead><tr><th>Tag</th><th>Perdas Motor (W)</th><th>Motor (kcal/h)</th><th>Dispositivo de Partida</th><th>Perdas Disp. (W)</th><th>Disp. (kcal/h)</th></tr></thead><tbody>';
            motors.forEach(m => {
                html += `<tr><td>${m.tag}</td><td>${m.PerdaMotor_W.toFixed(0)}</td><td>${m.PerdaMotor_kcalH.toFixed(0)}</td><td>${m.tipoDispPartida}</td><td>${m.PerdaInvSS_W.toFixed(0)}</td><td>${m.PerdaInvSS_kcalH.toFixed(0)}</td></tr>`;
            });
            html += `<tr style="font-weight:700"><td>TOTAL</td><td>${PerdaMotorTotal_W.toFixed(0)}</td><td>${(PerdaMotorTotal_W * 0.86).toFixed(0)}</td><td></td><td>${PerdaInvSSTotal_W.toFixed(0)}</td><td>${(PerdaInvSSTotal_W * 0.86).toFixed(0)}</td></tr>`;
            html += '</tbody></table>';
            html += `<div class="info-box" style="margin-top:.5rem"><p><strong>Dissipação total no CCM:</strong> ${PerdaTotal_W.toFixed(0)} W (${(PerdaTotal_W * 0.86).toFixed(0)} kcal/h)<br><i data-eo-icon=triangle-alert></i> Considere ventilação forçada se a dissipação no painel for elevada. Consulte IEC 60890 para cálculo de elevação de temperatura em painéis.</p></div></div>`;

            // ── Protocolo de Modificação (editável)
            html += '<div class="card" style="margin-top:1rem"><div class="card-header"><div class="dot dot-green"></div><h3><i data-eo-icon=file-text></i> Protocolo de Modificação</h3></div>';
            html += '<table class="predial-table" id="ccm-protocolo-table"><thead><tr><th>Nº</th><th>Data</th><th>Responsável</th><th>Tag(s)</th><th>Revisão</th><th>Descrição da Alteração</th><th></th></tr></thead><tbody>';
            motors.forEach((m, i) => {
                html += `<tr>
                    <td>${i + 1}</td>
                    <td><input type="text" class="input-field proto-data" value="${new Date().toLocaleDateString('pt-BR')}" style="width:90px;padding:4px 6px;font-size:.75rem"></td>
                    <td><input type="text" class="input-field proto-resp" value="Projetista" style="width:100px;padding:4px 6px;font-size:.75rem"></td>
                    <td><input type="text" class="input-field proto-tag" value="${m.tag}" style="width:70px;padding:4px 6px;font-size:.75rem"></td>
                    <td><input type="text" class="input-field proto-rev" value="Rev.0" style="width:60px;padding:4px 6px;font-size:.75rem"></td>
                    <td><input type="text" class="input-field proto-desc" value="Projeto original — ${m.cv} cv, partida ${m.partida}, ${tensao} V" style="width:100%;padding:4px 6px;font-size:.75rem"></td>
                    <td><button type="button" class="btn btn-danger-outline eo-row-remove" onclick="ccmRemoveProtoRow(this)" title="Remover linha" aria-label="Remover linha" data-eo-action="industrial:remove-proto-row"><i data-eo-icon=x></i></button></td>
                </tr>`;
            });
            html += '</tbody></table>';
            html += '<button type="button" class="btn secondary" onclick="ccmAddProtoRow()" style="margin-top:.5rem" data-eo-action="industrial:add-proto-row"><i data-eo-icon=file-plus></i> Adicionar Linha</button>';
            html += '<div class="info-box" style="margin-top:.5rem"><p><i data-eo-icon=file-text></i> Edite os campos acima para registrar alterações no CCM. Cada modificação deve constar com data, responsável e descrição técnica.</p></div></div>';

            html += `<div class="info-box" style="margin-top:.8rem"><p><strong>Rede MT:</strong> ${tensaoMT.toFixed(1)} kV | <strong>Corrente MT:</strong> ${IdemMT.toFixed(2)} A | <strong>Barramento BT:</strong> ${secaoBar} mm² por fase | <strong>Icc:</strong> ${icc} kA | <strong>Disjuntor geral:</strong> ${disjGeral} A</p></div>`;

            document.getElementById('ccm-detail').innerHTML = html;
            document.getElementById('ccm-result').style.display = 'block';
        }

function ccmAddProtoRow() {
            const tbody = document.querySelector('#ccm-protocolo-table tbody');
            if (!tbody) return;
            const n = tbody.rows.length + 1;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${n}</td>
                <td><input type="text" class="input-field proto-data" value="${new Date().toLocaleDateString('pt-BR')}" style="width:90px;padding:4px 6px;font-size:.75rem"></td>
                <td><input type="text" class="input-field proto-resp" value="" style="width:100px;padding:4px 6px;font-size:.75rem"></td>
                <td><input type="text" class="input-field proto-tag" value="" style="width:70px;padding:4px 6px;font-size:.75rem"></td>
                <td><input type="text" class="input-field proto-rev" value="" style="width:60px;padding:4px 6px;font-size:.75rem"></td>
                <td><input type="text" class="input-field proto-desc" value="" style="width:100%;padding:4px 6px;font-size:.75rem"></td>
                <td><button type="button" class="btn btn-danger-outline eo-row-remove" onclick="ccmRemoveProtoRow(this)" title="Remover linha" aria-label="Remover linha" data-eo-action="industrial:remove-proto-row"><i data-eo-icon=x></i></button></td>`;
            tbody.appendChild(tr);
        }

function ccmRemoveProtoRow(btn) {
            const tr = btn.closest('tr');
            if (tr) tr.remove();
            // Renumerar
            const rows = document.querySelectorAll('#ccm-protocolo-table tbody tr');
            rows.forEach((r, i) => { r.cells[0].textContent = i + 1; });
        }

function ccmGetProtoRows() {
            const rows = [];
            document.querySelectorAll('#ccm-protocolo-table tbody tr').forEach(tr => {
                rows.push({
                    data: tr.querySelector('.proto-data')?.value || '',
                    resp: tr.querySelector('.proto-resp')?.value || '',
                    tag: tr.querySelector('.proto-tag')?.value || '',
                    rev: tr.querySelector('.proto-rev')?.value || '',
                    desc: tr.querySelector('.proto-desc')?.value || ''
                });
            });
            return rows;
        }

function exportCCMXLSX() {
            const d = _ccmData;
            if (!d) { alert('Calcule o CCM primeiro!'); return; }

            const titleStyle = { font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1F4E79' } }, alignment: { horizontal: 'center' } };
            const sectionStyle = { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2E75B6' } }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'medium', color: { rgb: '1F4E79' } } } };
            const headerStyle = { font: { bold: true, sz: 9, color: { rgb: '1F4E79' } }, fill: { fgColor: { rgb: 'D6E4F0' } }, border: { bottom: { style: 'thin', color: { rgb: '9DC3E6' } }, top: { style: 'thin', color: { rgb: '9DC3E6' } }, left: { style: 'thin', color: { rgb: '9DC3E6' } }, right: { style: 'thin', color: { rgb: '9DC3E6' } } }, alignment: { horizontal: 'center', wrapText: true } };
            const dataStyle = { font: { sz: 9 }, border: { bottom: { style: 'hair', color: { rgb: 'B4C6E7' } }, left: { style: 'hair', color: { rgb: 'B4C6E7' } }, right: { style: 'hair', color: { rgb: 'B4C6E7' } } }, alignment: { horizontal: 'center' } };
            const totalStyle = { font: { bold: true, sz: 9, color: { rgb: '1F4E79' } }, fill: { fgColor: { rgb: 'E2EFDA' } }, border: { top: { style: 'medium', color: { rgb: '1F4E79' } }, bottom: { style: 'medium', color: { rgb: '1F4E79' } } }, alignment: { horizontal: 'center' } };
            const paramLabelStyle = { font: { bold: true, sz: 9, color: { rgb: '1F4E79' } }, fill: { fgColor: { rgb: 'F2F2F2' } }, border: { bottom: { style: 'hair', color: { rgb: 'B4C6E7' } } } };
            const paramValStyle = { font: { sz: 9 }, fill: { fgColor: { rgb: 'FAFAFA' } }, border: { bottom: { style: 'hair', color: { rgb: 'B4C6E7' } } }, alignment: { horizontal: 'center' } };

            const rows = [];
            const styles = [];
            function pushRow(cells, style) { rows.push(cells); styles.push(style || null); }

            // TÍTULO
            pushRow(['CCM — Centro de Controle de Motores'], titleStyle);
            pushRow([]);

            // LISTA DE MOTORES
            pushRow(['LISTA DE MOTORES'], sectionStyle);
            pushRow(['Tag', 'Potência (cv)', 'Potência (kW)', 'FS', 'Partida', 'η', 'FP', 'In (A)', 'In×FS (A)', 'Ip (A)', 'Disjuntor (A)', 'Contator (A)', 'Fusível NH (A)', 'Relé Térmico'], headerStyle);
            d.motors.forEach(m => {
                pushRow([m.tag, m.cv, +m.Pkw.toFixed(2), m.fs, m.partida, m.rend || '', m.fp || '', +m.In.toFixed(2), +m.InFS.toFixed(2), +m.Ip.toFixed(1), m.disj, m.contator, m.fusivel, m.faixaRele], dataStyle);
            });

            pushRow([]);
            pushRow(['COORDENAÇÃO DE PROTEÇÃO'], sectionStyle);
            pushRow(['Tag', 'Fusível NH (A)', 'Disjuntor (A)', 'Contator (A)', 'Relé Térmico', 'Status', 'Descrição'], headerStyle);
            d.motors.forEach(m => {
                pushRow([m.tag, m.fusivel, m.disj, m.contator, m.faixaRele, m.coordTipo, m.coordDesc], dataStyle);
            });

            pushRow([]);
            pushRow(['DISSIPAÇÃO TÉRMICA'], sectionStyle);
            pushRow(['Tag', 'Perdas Motor (W)', 'Motor (kcal/h)', 'Dispositivo de Partida', 'Perdas Disp. (W)', 'Disp. (kcal/h)'], headerStyle);
            d.motors.forEach(m => {
                pushRow([m.tag, +m.PerdaMotor_W.toFixed(0), +m.PerdaMotor_kcalH.toFixed(0), m.tipoDispPartida, +m.PerdaInvSS_W.toFixed(0), +m.PerdaInvSS_kcalH.toFixed(0)], dataStyle);
            });
            pushRow(['TOTAL', +d.PerdaMotorTotal_W.toFixed(0), +(d.PerdaMotorTotal_W * 0.86).toFixed(0), '', +d.PerdaInvSSTotal_W.toFixed(0), +(d.PerdaInvSSTotal_W * 0.86).toFixed(0)], totalStyle);
            pushRow(['Dissipação total no CCM', +d.PerdaTotal_W.toFixed(0), 'W / ' + (d.PerdaTotal_W * 0.86).toFixed(0) + ' kcal/h'], totalStyle);

            pushRow([]);
            pushRow(['PROTOCOLO DE MODIFICAÇÃO'], sectionStyle);
            pushRow(['Nº', 'Data', 'Responsável', 'Tag(s)', 'Revisão', 'Descrição da Alteração'], headerStyle);
            const protoRows = ccmGetProtoRows();
            protoRows.forEach((p, i) => {
                pushRow([i + 1, p.data, p.resp, p.tag, p.rev, p.desc], dataStyle);
            });

            pushRow([]);
            pushRow(['RESUMO GERAL'], sectionStyle);
            pushRow(['Parâmetro', 'Valor', 'Unidade'], headerStyle);
            const resumoData = [
                ['Tensão da rede MT', d.tensaoMT, 'kV'],
                ['Tensão do barramento', d.tensao, 'V'],
                ['Quantidade de motores', d.motors.length, ''],
                ['Potência total instalada', +d.PtotalInst.toFixed(1), 'kW'],
                ['Fator de demanda', d.fd, ''],
                ['Demanda ativa', +d.PtotalDem.toFixed(1), 'kW'],
                ['Fator de potência', d.fpGeral, ''],
                ['Demanda aparente', +d.Sdem.toFixed(1), 'kVA'],
                ['Corrente de demanda (BT)', +d.Idem.toFixed(1), 'A'],
                ['Corrente no lado MT', +d.IdemMT.toFixed(2), 'A'],
                ['Corrente nominal total', +d.ItotalNom.toFixed(1), 'A'],
                ['Disjuntor geral', d.disjGeral, 'A'],
                ['Seção barramento', d.secaoBar, 'mm² (por fase)'],
                ['Corrente de curto-circuito', d.icc, 'kA'],
                ['Dissipação térmica total', +d.PerdaTotal_W.toFixed(0), 'W'],
            ];
            resumoData.forEach(r => pushRow(r, null));

            // Montar worksheet com estilos
            if (typeof XLSX !== 'undefined') {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(rows);

                // Aplicar estilos
                for (let r = 0; r < rows.length; r++) {
                    const st = styles[r];
                    if (!st) {
                        // Resumo geral: estilo alternado
                        const row = rows[r];
                        if (row && row.length === 3 && resumoData.some(rd => rd[0] === row[0])) {
                            const isEven = resumoData.findIndex(rd => rd[0] === row[0]) % 2 === 0;
                            for (let c = 0; c < row.length; c++) {
                                const addr = XLSX.utils.encode_cell({ r, c });
                                if (ws[addr]) ws[addr].s = c === 0 ? paramLabelStyle : { ...paramValStyle, fill: { fgColor: { rgb: isEven ? 'FAFAFA' : 'FFFFFF' } } };
                            }
                        }
                        continue;
                    }
                    for (let c = 0; c < (rows[r]?.length || 0); c++) {
                        const addr = XLSX.utils.encode_cell({ r, c });
                        if (ws[addr]) ws[addr].s = st;
                    }
                }

                // Auto-width
                const colWidths = [];
                rows.forEach(r => {
                    if (!r) return;
                    r.forEach((cell, i) => {
                        const len = String(cell == null ? '' : cell).length;
                        colWidths[i] = Math.max(colWidths[i] || 10, len + 3);
                    });
                });
                ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 45) }));

                // Merge título
                ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

                XLSX.utils.book_append_sheet(wb, ws, 'CCM');
                XLSX.writeFile(wb, 'CCM_' + d.motors.length + '_motores_' + d.tensao + 'V.xlsx');
            } else {
                // Fallback CSV
                downloadCSVasXLSX(rows, 'CCM_' + d.motors.length + '_motores_' + d.tensao + 'V');
            }
        }
