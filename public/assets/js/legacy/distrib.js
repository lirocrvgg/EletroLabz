/* assets/js/legacy/distrib.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/distrib.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: distrib.html, depois de core.js. */

// ═══════════════════════════════════════════════════════════════
        // DISTRIBUIÇÃO ELÉTRICA
        // ═══════════════════════════════════════════════════════════════
function showDistribPage(id, btn) {
            document.querySelectorAll('#main-distrib .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-distrib .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id); if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-distrib .nav-btn[data-dpage="' + id + '"]'); if (nb) nb.classList.add('active');
        }

function syncDistribNorma(val) {
            ['distrib-norma', 'distrib-norma2', 'distrib-norma3', 'distrib-norma4', 'distrib-norma5', 'distrib-norma-proj'].forEach(id => {
                const el = document.getElementById(id); if (el) el.value = val;
            });
            onDistribNormaChange();
        }

function onDistribNormaChange() {
            const norma = (document.getElementById('distrib-norma') || {}).value || 'cemig';
            const descs = {
                cemig: '<strong>CEMIG — ND 5.1 / ND 5.2</strong><br>Norma de Distribuição da Companhia Energética de Minas Gerais. Tensão 127/220V. Faixas de fornecimento: Monofásico (até 8kW), Bifásico (até 16kW), Trifásico por demanda (C1–C6 até 75kVA, F1–F9 até 304kVA). Acima de 304kVA → média tensão (ND 5.3).',
                equatorial: '<strong>Equatorial — NT.00001.EQTL</strong><br>Norma Técnica da Equatorial Energia. Tensão 127/220V ou 220/380V dependendo do estado. Faixas: Monofásico (até 12kW), Bifásico (até 25kW), Trifásico por demanda (até 75kVA medição direta, até 300kVA medição indireta). Acima → média tensão (NT.00002.EQTL).',
                enel: '<strong>Enel — Especificação Técnica 0018</strong><br>Norma da Enel Distribuição Brasil (SP, RJ, CE, GO). Tensão 127/220V ou 220/380V. Faixas: Monofásico (até 12kW/15kW), Bifásico (até 22kW/25kW), Trifásico por demanda (até 75kVA medição direta, até 300kVA). Acima → média tensão.'
            };
            const badges = { cemig: 'CEMIG', equatorial: 'EQUATORIAL', enel: 'ENEL' };
            const descEl = document.getElementById('distrib-norma-desc');
            if (descEl) descEl.innerHTML = descs[norma] || '';
            ['distrib-badge-demanda', 'distrib-badge-padrao', 'distrib-badge-ramal', 'distrib-badge-aterr', 'distrib-badge-projeto'].forEach(id => {
                const el = document.getElementById(id); if (el) el.textContent = badges[norma] || '';
            });
        }

// ─── DADOS DAS NORMAS ─────────────────────────────────────────
const DISTRIB_NORMAS = {
            cemig: {
                nome: 'CEMIG — ND 5.1',
                tensao: '127/220',
                tensaoFF: 220,
                tensaoFN: 127,
                monoLimite: 8000,
                biLimite: 16000,
                fp: 0.92,
                faixas: [
                    { id: 'A1', tipo: 'Monofásico', demMin: 0, demMax: 8, disj: 'Monopolar 63A', condutores: '1F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 1, medicao: 'Direta — CM1/CM-13', poste: 'PA1 ou PA4' },
                    { id: 'B1', tipo: 'Bifásico', demMin: 0, demMax: 16, disj: 'Bipolar 63A', condutores: '2F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 1, medicao: 'Direta — CM2/CM-14', poste: 'PA1 ou PA4' },
                    { id: 'C1', tipo: 'Trifásico', demMin: 0, demMax: 24, disj: 'Tripolar 63A', condutores: '3F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 2, medicao: 'Direta — CM2/CM-14', poste: 'PA1 ou PA4' },
                    { id: 'C2', tipo: 'Trifásico', demMin: 24.1, demMax: 30.5, disj: 'Tripolar 80A', condutores: '3F+1N+1T', bitola: 25, bitolaT: 16, eletroduto: 40, hastes: 2, medicao: 'Direta — CM2/CM-14', poste: 'PA1 ou PA4' },
                    { id: 'C3', tipo: 'Trifásico', demMin: 30.6, demMax: 38.1, disj: 'Tripolar 100A', condutores: '3F+1N+1T', bitola: 35, bitolaT: 16, eletroduto: 40, hastes: 2, medicao: 'Direta — CM2/CM-14', poste: 'PA2 ou PA5' },
                    { id: 'C4', tipo: 'Trifásico', demMin: 38.2, demMax: 47.2, disj: 'Tripolar 125A', condutores: '3F+1N+1T', bitola: 50, bitolaT: 25, eletroduto: 50, hastes: 2, medicao: 'Direta — CM2/CM-14', poste: 'PA2 ou PA5' },
                    { id: 'C5', tipo: 'Trifásico', demMin: 47.3, demMax: 57.1, disj: 'Tripolar 150A', condutores: '3F+1N+1T', bitola: 70, bitolaT: 35, eletroduto: 60, hastes: 3, medicao: 'Indireta — CM3/CM-3 LVP', poste: 'PA3 ou PA6' },
                    { id: 'C6', tipo: 'Trifásico', demMin: 57.2, demMax: 75, disj: 'Tripolar 200A', condutores: '3F+1N+1T', bitola: 95, bitolaT: 50, eletroduto: 75, hastes: 3, medicao: 'Indireta — CM3/CM-3 LVP', poste: 'PA3 ou PA6' },
                    { id: 'F1', tipo: 'Trifásico', demMin: 75.1, demMax: 86, disj: 'Tripolar 225A', condutores: '3F+1N+1T', bitola: 120, bitolaT: 70, eletroduto: 85, hastes: 3, medicao: 'Indireta — CM-9/CM-4', poste: 'PA3 ou PA6' },
                    { id: 'F2', tipo: 'Trifásico', demMin: 86.1, demMax: 95, disj: 'Tripolar 250A', condutores: '3F+1N+1T', bitola: 150, bitolaT: 70, eletroduto: 110, hastes: 3, medicao: 'Indireta — CM-9/CM-4', poste: 'PA3 ou PA6' },
                    { id: 'F3', tipo: 'Trifásico', demMin: 95.1, demMax: 114, disj: 'Tripolar 300A', condutores: '3F+1N+1T', bitola: 240, bitolaT: 120, eletroduto: 110, hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                    { id: 'F4', tipo: 'Trifásico', demMin: 114.1, demMax: 152, disj: 'Tripolar 400A', condutores: '2×(3F+1N+1T)', bitola: 120, bitolaT: 50, eletroduto: '2×75', hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                    { id: 'F5', tipo: 'Trifásico', demMin: 152.1, demMax: 171, disj: 'Tripolar 450A', condutores: '2×(3F+1N+1T)', bitola: 150, bitolaT: 70, eletroduto: '2×85', hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                    { id: 'F6', tipo: 'Trifásico', demMin: 171.1, demMax: 188, disj: 'Tripolar 500A', condutores: '2×(3F+1N+1T)', bitola: 185, bitolaT: 95, eletroduto: '2×110', hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                    { id: 'F7', tipo: 'Trifásico', demMin: 188.1, demMax: 228, disj: 'Tripolar 600A', condutores: '2×(3F+1N+1T)', bitola: 240, bitolaT: 120, eletroduto: '2×110', hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                    { id: 'F8', tipo: 'Trifásico', demMin: 228.1, demMax: 266, disj: 'Tripolar 700A', condutores: '3×(3F+1N+1T)', bitola: 150, bitolaT: 70, eletroduto: '3×85', hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                    { id: 'F9', tipo: 'Trifásico', demMin: 266.1, demMax: 304, disj: 'Tripolar 800A', condutores: '3×(3F+1N+1T)', bitola: 185, bitolaT: 95, eletroduto: '3×110', hastes: 3, medicao: 'Indireta — CM-18/CM-4', poste: 'Subterrânea' },
                ],
                mediaTensaoLimite: 304
            },
            equatorial: {
                nome: 'Equatorial — NT.00001.EQTL',
                tensao: '127/220',
                tensaoFF: 220,
                tensaoFN: 127,
                monoLimite: 12000,
                biLimite: 25000,
                fp: 0.92,
                faixas: [
                    { id: 'M1', tipo: 'Monofásico', demMin: 0, demMax: 7.3, disj: 'Monopolar 40A', condutores: '1F+1N+1T', bitola: 10, bitolaT: 10, eletroduto: 25, hastes: 1, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'M2', tipo: 'Monofásico', demMin: 0, demMax: 12, disj: 'Monopolar 63A', condutores: '1F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 1, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'B1', tipo: 'Bifásico', demMin: 0, demMax: 15.2, disj: 'Bipolar 40A', condutores: '2F+1N+1T', bitola: 10, bitolaT: 10, eletroduto: 25, hastes: 1, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'B2', tipo: 'Bifásico', demMin: 0, demMax: 25, disj: 'Bipolar 63A', condutores: '2F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T1', tipo: 'Trifásico', demMin: 0, demMax: 20, disj: 'Tripolar 50A', condutores: '3F+1N+1T', bitola: 10, bitolaT: 10, eletroduto: 32, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T2', tipo: 'Trifásico', demMin: 0, demMax: 25, disj: 'Tripolar 63A', condutores: '3F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T3', tipo: 'Trifásico', demMin: 25.1, demMax: 33, disj: 'Tripolar 80A', condutores: '3F+1N+1T', bitola: 25, bitolaT: 16, eletroduto: 40, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T4', tipo: 'Trifásico', demMin: 33.1, demMax: 44, disj: 'Tripolar 100A', condutores: '3F+1N+1T', bitola: 35, bitolaT: 16, eletroduto: 50, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T5', tipo: 'Trifásico', demMin: 44.1, demMax: 55, disj: 'Tripolar 125A', condutores: '3F+1N+1T', bitola: 50, bitolaT: 25, eletroduto: 50, hastes: 3, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T6', tipo: 'Trifásico', demMin: 55.1, demMax: 66, disj: 'Tripolar 150A', condutores: '3F+1N+1T', bitola: 70, bitolaT: 35, eletroduto: 60, hastes: 3, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T7', tipo: 'Trifásico', demMin: 66.1, demMax: 75, disj: 'Tripolar 200A', condutores: '3F+1N+1T', bitola: 95, bitolaT: 50, eletroduto: 75, hastes: 3, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T8', tipo: 'Trifásico', demMin: 75.1, demMax: 95, disj: 'Tripolar 250A', condutores: '3F+1N+1T', bitola: 150, bitolaT: 70, eletroduto: 85, hastes: 3, medicao: 'Indireta (TC)', poste: 'Poste/Mureta' },
                    { id: 'T9', tipo: 'Trifásico', demMin: 95.1, demMax: 120, disj: 'Tripolar 300A', condutores: '3F+1N+1T', bitola: 185, bitolaT: 95, eletroduto: 110, hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T10', tipo: 'Trifásico', demMin: 120.1, demMax: 150, disj: 'Tripolar 400A', condutores: '2×(3F+1N+1T)', bitola: 120, bitolaT: 70, eletroduto: '2×75', hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T11', tipo: 'Trifásico', demMin: 150.1, demMax: 200, disj: 'Tripolar 500A', condutores: '2×(3F+1N+1T)', bitola: 185, bitolaT: 95, eletroduto: '2×110', hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T12', tipo: 'Trifásico', demMin: 200.1, demMax: 300, disj: 'Tripolar 630A', condutores: '2×(3F+1N+1T)', bitola: 240, bitolaT: 120, eletroduto: '2×110', hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta/Cabine' },
                ],
                mediaTensaoLimite: 300
            },
            enel: {
                nome: 'Enel — Especificação Técnica',
                tensao: '127/220',
                tensaoFF: 220,
                tensaoFN: 127,
                monoLimite: 12000,
                biLimite: 22000,
                fp: 0.92,
                faixas: [
                    { id: 'M1', tipo: 'Monofásico', demMin: 0, demMax: 8, disj: 'Monopolar 40A', condutores: '1F+1N+1T', bitola: 10, bitolaT: 10, eletroduto: 25, hastes: 1, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'M2', tipo: 'Monofásico', demMin: 0, demMax: 12, disj: 'Monopolar 63A', condutores: '1F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 1, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'B1', tipo: 'Bifásico', demMin: 0, demMax: 12, disj: 'Bipolar 40A', condutores: '2F+1N+1T', bitola: 10, bitolaT: 10, eletroduto: 25, hastes: 1, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'B2', tipo: 'Bifásico', demMin: 0, demMax: 22, disj: 'Bipolar 63A', condutores: '2F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T1', tipo: 'Trifásico', demMin: 0, demMax: 17, disj: 'Tripolar 40A', condutores: '3F+1N+1T', bitola: 10, bitolaT: 10, eletroduto: 32, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T2', tipo: 'Trifásico', demMin: 0, demMax: 25, disj: 'Tripolar 63A', condutores: '3F+1N+1T', bitola: 16, bitolaT: 16, eletroduto: 32, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T3', tipo: 'Trifásico', demMin: 25.1, demMax: 33, disj: 'Tripolar 80A', condutores: '3F+1N+1T', bitola: 25, bitolaT: 16, eletroduto: 40, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T4', tipo: 'Trifásico', demMin: 33.1, demMax: 42, disj: 'Tripolar 100A', condutores: '3F+1N+1T', bitola: 35, bitolaT: 16, eletroduto: 50, hastes: 2, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T5', tipo: 'Trifásico', demMin: 42.1, demMax: 55, disj: 'Tripolar 125A', condutores: '3F+1N+1T', bitola: 50, bitolaT: 25, eletroduto: 50, hastes: 3, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T6', tipo: 'Trifásico', demMin: 55.1, demMax: 66, disj: 'Tripolar 150A', condutores: '3F+1N+1T', bitola: 70, bitolaT: 35, eletroduto: 60, hastes: 3, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T7', tipo: 'Trifásico', demMin: 66.1, demMax: 75, disj: 'Tripolar 200A', condutores: '3F+1N+1T', bitola: 95, bitolaT: 50, eletroduto: 75, hastes: 3, medicao: 'Direta', poste: 'Poste particular' },
                    { id: 'T8', tipo: 'Trifásico', demMin: 75.1, demMax: 95, disj: 'Tripolar 250A', condutores: '3F+1N+1T', bitola: 150, bitolaT: 70, eletroduto: 85, hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T9', tipo: 'Trifásico', demMin: 95.1, demMax: 120, disj: 'Tripolar 300A', condutores: '3F+1N+1T', bitola: 185, bitolaT: 95, eletroduto: 110, hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T10', tipo: 'Trifásico', demMin: 120.1, demMax: 150, disj: 'Tripolar 400A', condutores: '2×(3F+1N+1T)', bitola: 120, bitolaT: 70, eletroduto: '2×75', hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T11', tipo: 'Trifásico', demMin: 150.1, demMax: 200, disj: 'Tripolar 500A', condutores: '2×(3F+1N+1T)', bitola: 185, bitolaT: 95, eletroduto: '2×110', hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta' },
                    { id: 'T12', tipo: 'Trifásico', demMin: 200.1, demMax: 300, disj: 'Tripolar 630A', condutores: '2×(3F+1N+1T)', bitola: 240, bitolaT: 120, eletroduto: '2×110', hastes: 3, medicao: 'Indireta (TC)', poste: 'Mureta/Cabine' },
                ],
                mediaTensaoLimite: 300
            }
        };

// ─── CÁLCULO DE DEMANDA ───────────────────────────────────────
function calcDistribDemanda() {
            const normaKey = (document.getElementById('distrib-norma2') || {}).value || 'cemig';
            const norma = DISTRIB_NORMAS[normaKey];
            const fp = parseFloat(document.getElementById('distrib-fp').value) || norma.fp;
            const daW = parseFloat(document.getElementById('distrib-da-w').value) || 0;
            const dbW = parseFloat(document.getElementById('distrib-db-w').value) || 0;
            const acW = parseFloat(document.getElementById('distrib-ac-w').value) || 0;
            const dcW = parseFloat(document.getElementById('distrib-dc-w').value) || 0;
            const ddW = parseFloat(document.getElementById('distrib-dd-w').value) || 0;
            const deW = parseFloat(document.getElementById('distrib-de-w').value) || 0;

            const ciTotal = daW + dbW + acW + dcW + ddW + deW;

            // Fatores de demanda simplificados
            const fdIlum = daW <= 1000 ? 1.0 : (daW <= 2000 ? 0.86 : (daW <= 3000 ? 0.78 : (daW <= 4000 ? 0.72 : (daW <= 5000 ? 0.66 : (daW <= 6000 ? 0.62 : 0.56)))));
            const fdChuv = dbW > 0 ? (dbW <= 5500 ? 1.0 : 0.90) : 0;
            const fdAC = acW > 0 ? (acW <= 3500 ? 1.0 : 0.85) : 0;
            const fdForno = dcW > 0 ? 0.80 : 0;
            const fdMotor = ddW > 0 ? 0.70 : 0;
            const fdEsp = deW > 0 ? 1.0 : 0;

            const da = daW * fdIlum;
            const db = dbW * fdChuv;
            const dAC = acW * fdAC;
            const dc = dcW * fdForno;
            const dd = ddW * fdMotor;
            const de = deW * fdEsp;

            const demandaW = da + db + dAC + dc + dd + de;
            const demandaVA = demandaW / fp;
            const demandaKVA = demandaVA / 1000;
            const demandaKW = demandaW / 1000;

            // Determinar tipo de fornecimento
            let tipoForn = 'Trifásico';
            if (ciTotal <= norma.monoLimite) tipoForn = 'Monofásico';
            else if (ciTotal <= norma.biLimite) tipoForn = 'Bifásico';

            // Encontrar faixa
            let faixa = null;
            if (tipoForn === 'Monofásico') {
                faixa = norma.faixas.find(f => f.tipo === 'Monofásico');
            } else if (tipoForn === 'Bifásico') {
                faixa = norma.faixas.find(f => f.tipo === 'Bifásico');
            } else {
                faixa = norma.faixas.find(f => f.tipo === 'Trifásico' && demandaKVA <= f.demMax);
                if (!faixa) faixa = norma.faixas[norma.faixas.length - 1];
            }

            const mediaTensao = demandaKVA > norma.mediaTensaoLimite;

            // Corrente de demanda
            let Idem;
            if (tipoForn === 'Monofásico') Idem = demandaVA / norma.tensaoFN;
            else if (tipoForn === 'Bifásico') Idem = demandaVA / norma.tensaoFF;
            else Idem = demandaVA / (Math.sqrt(3) * norma.tensaoFF);

            // Grid de resultados
            const grid = document.getElementById('distrib-demanda-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${(ciTotal / 1000).toFixed(1)}</div><div class="unit">kW</div><div class="desc">Carga instalada</div></div>
                <div class="predial-result-item"><div class="value">${demandaKW.toFixed(2)}</div><div class="unit">kW</div><div class="desc">Demanda ativa</div></div>
                <div class="predial-result-item"><div class="value">${demandaKVA.toFixed(2)}</div><div class="unit">kVA</div><div class="desc">Demanda aparente</div></div>
                <div class="predial-result-item"><div class="value">${Idem.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente de demanda</div></div>
                <div class="predial-result-item"><div class="value">${tipoForn}</div><div class="unit"></div><div class="desc">Tipo de fornecimento</div></div>
                <div class="predial-result-item"><div class="value">${faixa ? faixa.id : '—'}</div><div class="unit"></div><div class="desc">Faixa (${normaKey.toUpperCase()})</div></div>
            `;

            // Detalhes
            let html = '<table class="predial-table"><thead><tr><th>Parcela</th><th>Carga (W)</th><th>FD</th><th>Demanda (W)</th></tr></thead><tbody>';
            html += `<tr><td>Iluminação + Tomadas</td><td>${daW.toFixed(0)}</td><td>${fdIlum.toFixed(2)}</td><td>${da.toFixed(0)}</td></tr>`;
            html += `<tr><td>Chuveiro / Aquecedor</td><td>${dbW.toFixed(0)}</td><td>${fdChuv.toFixed(2)}</td><td>${db.toFixed(0)}</td></tr>`;
            html += `<tr><td>Ar-condicionado</td><td>${acW.toFixed(0)}</td><td>${fdAC.toFixed(2)}</td><td>${dAC.toFixed(0)}</td></tr>`;
            html += `<tr><td>Fogão / Forno</td><td>${dcW.toFixed(0)}</td><td>${fdForno.toFixed(2)}</td><td>${dc.toFixed(0)}</td></tr>`;
            html += `<tr><td>Motores</td><td>${ddW.toFixed(0)}</td><td>${fdMotor.toFixed(2)}</td><td>${dd.toFixed(0)}</td></tr>`;
            html += `<tr><td>Cargas Especiais</td><td>${deW.toFixed(0)}</td><td>${fdEsp.toFixed(2)}</td><td>${de.toFixed(0)}</td></tr>`;
            html += `<tr style="font-weight:700"><td>TOTAL</td><td>${ciTotal.toFixed(0)}</td><td></td><td>${demandaW.toFixed(0)}</td></tr>`;
            html += '</tbody></table>';

            if (mediaTensao) {
                html += '<div class="info-box" style="margin-top:.8rem;border-color:var(--accent2)"><p><i data-eo-icon=triangle-alert></i> <strong>Demanda acima de ' + norma.mediaTensaoLimite + ' kVA!</strong> O fornecimento deverá ser em <strong>média tensão</strong> conforme norma específica da concessionária.</p></div>';
            }

            if (faixa) {
                html += '<div class="card" style="margin-top:1rem"><div class="card-header"><div class="dot" style="background:#10b981"></div><h3>Faixa ' + faixa.id + ' — ' + faixa.tipo + '</h3></div>';
                html += '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Especificação</th></tr></thead><tbody>';
                html += '<tr><td>Disjuntor de proteção</td><td>' + faixa.disj + '</td></tr>';
                html += '<tr><td>Condutores</td><td>' + faixa.condutores + '</td></tr>';
                html += '<tr><td>Seção — Fases/Neutro</td><td>#' + faixa.bitola + ' mm²</td></tr>';
                html += '<tr><td>Seção — Terra</td><td>#' + faixa.bitolaT + ' mm²</td></tr>';
                html += '<tr><td>Eletroduto</td><td>Ø ' + faixa.eletroduto + ' mm</td></tr>';
                html += '<tr><td>Hastes de aterramento</td><td>' + faixa.hastes + ' haste(s)</td></tr>';
                html += '<tr><td>Medição</td><td>' + faixa.medicao + '</td></tr>';
                html += '<tr><td>Tipo de entrada</td><td>' + faixa.poste + '</td></tr>';
                html += '</tbody></table></div>';
            }

            html += '<div class="info-box" style="margin-top:.8rem"><p><i data-eo-icon=info></i> Norma: <strong>' + norma.nome + '</strong> | Tensão: ' + norma.tensao + ' V | FP: ' + fp + '</p></div>';

            // Auto-fill padrão de entrada fields
            const demKvaEl = document.getElementById('distrib-dem-kva');
            if (demKvaEl) demKvaEl.value = demandaKVA.toFixed(1);
            const ciEl = document.getElementById('distrib-ci-total');
            if (ciEl) ciEl.value = ciTotal.toFixed(0);
            const ramalKvaEl = document.getElementById('distrib-ramal-kva');
            if (ramalKvaEl) ramalKvaEl.value = demandaKVA.toFixed(1);

            document.getElementById('distrib-demanda-detail').innerHTML = html;
            document.getElementById('distrib-demanda-result').style.display = 'block';
        }

// ─── PADRÃO DE ENTRADA ────────────────────────────────────────
function calcDistribPadrao() {
            const normaKey = (document.getElementById('distrib-norma3') || {}).value || 'cemig';
            const norma = DISTRIB_NORMAS[normaKey];
            const demKVA = parseFloat(document.getElementById('distrib-dem-kva').value) || 0;
            const ciTotal = parseFloat(document.getElementById('distrib-ci-total').value) || 0;
            const precisa220 = (document.getElementById('distrib-precisa220') || {}).value || 'nao';

            let tipoForn;
            if (precisa220 === 'tri') tipoForn = 'Trifásico';
            else if (precisa220 === 'sim') tipoForn = 'Bifásico';
            else if (ciTotal <= norma.monoLimite) tipoForn = 'Monofásico';
            else if (ciTotal <= norma.biLimite) tipoForn = 'Bifásico';
            else tipoForn = 'Trifásico';

            let faixa = null;
            if (tipoForn === 'Monofásico') faixa = norma.faixas.find(f => f.tipo === 'Monofásico');
            else if (tipoForn === 'Bifásico') faixa = norma.faixas.filter(f => f.tipo === 'Bifásico').pop();
            else {
                faixa = norma.faixas.find(f => f.tipo === 'Trifásico' && demKVA <= f.demMax);
                if (!faixa) faixa = norma.faixas.filter(f => f.tipo === 'Trifásico').pop();
            }

            const mediaTensao = demKVA > norma.mediaTensaoLimite;

            let html = '';
            if (mediaTensao) {
                html += '<div class="info-box" style="border-color:var(--accent2)"><p><i data-eo-icon=triangle-alert></i> <strong>Demanda de ' + demKVA.toFixed(1) + ' kVA excede o limite de ' + norma.mediaTensaoLimite + ' kVA!</strong><br>O fornecimento deverá ser em <strong>média tensão</strong>.</p></div>';
            }

            if (faixa) {
                html += '<div class="card" style="margin-top:.5rem"><div class="card-header"><div class="dot" style="background:#10b981"></div><h3><i data-eo-icon=file-text></i> Padrão — Faixa ' + faixa.id + '</h3></div>';
                html += '<table class="predial-table"><thead><tr><th>Item</th><th>Especificação (' + normaKey.toUpperCase() + ')</th></tr></thead><tbody>';
                html += '<tr><td>Tipo de fornecimento</td><td><strong>' + faixa.tipo + '</strong></td></tr>';
                html += '<tr><td>Faixa</td><td>' + faixa.id + ' (até ' + faixa.demMax + ' kVA)</td></tr>';
                html += '<tr><td>Disjuntor geral</td><td>' + faixa.disj + '</td></tr>';
                html += '<tr><td>Condutores</td><td>' + faixa.condutores + '</td></tr>';
                html += '<tr><td>Seção — Fases e Neutro</td><td>#' + faixa.bitola + ' mm²</td></tr>';
                html += '<tr><td>Seção — Terra (PE)</td><td>#' + faixa.bitolaT + ' mm²</td></tr>';
                html += '<tr><td>Eletroduto</td><td>Ø ' + faixa.eletroduto + ' mm</td></tr>';
                html += '<tr><td>Hastes de aterramento</td><td>' + faixa.hastes + '</td></tr>';
                html += '<tr><td>Tipo de medição</td><td>' + faixa.medicao + '</td></tr>';
                html += '<tr><td>Tipo de entrada</td><td>' + faixa.poste + '</td></tr>';
                html += '</tbody></table></div>';

                // Mostrar todas as faixas para comparação
                html += '<div class="card" style="margin-top:1rem"><div class="card-header"><div class="dot dot-blue"></div><h3>Todas as Faixas — ' + normaKey.toUpperCase() + '</h3></div>';
                html += '<div style="overflow-x:auto"><table class="predial-table" style="font-size:.75rem"><thead><tr><th>Faixa</th><th>Tipo</th><th>Até (kVA)</th><th>Disjuntor</th><th>Bitola (mm²)</th><th>Eletroduto</th><th>Hastes</th><th>Medição</th></tr></thead><tbody>';
                norma.faixas.forEach(f => {
                    const sel = f.id === faixa.id ? ' style="background:rgba(16,185,129,.15);font-weight:700"' : '';
                    html += '<tr' + sel + '><td>' + f.id + '</td><td>' + f.tipo + '</td><td>' + f.demMax + '</td><td>' + f.disj + '</td><td>#' + f.bitola + '</td><td>Ø' + f.eletroduto + '</td><td>' + f.hastes + '</td><td>' + f.medicao + '</td></tr>';
                });
                html += '</tbody></table></div></div>';
            }

            document.getElementById('distrib-padrao-detail').innerHTML = html;
            document.getElementById('distrib-padrao-result').style.display = 'block';
        }

// ─── RAMAL DE ENTRADA ─────────────────────────────────────────
function calcDistribRamal() {
            const normaKey = (document.getElementById('distrib-norma4') || {}).value || 'cemig';
            const norma = DISTRIB_NORMAS[normaKey];
            const demKVA = parseFloat(document.getElementById('distrib-ramal-kva').value) || 0;
            const tipoForn = (document.getElementById('distrib-ramal-tipo') || {}).value || 'tri';
            const comp = parseFloat(document.getElementById('distrib-ramal-comp').value) || 30;

            const demVA = demKVA * 1000;
            let Idem, tensaoCalc;
            if (tipoForn === 'mono') { Idem = demVA / norma.tensaoFN; tensaoCalc = norma.tensaoFN; }
            else if (tipoForn === 'bi') { Idem = demVA / norma.tensaoFF; tensaoCalc = norma.tensaoFF; }
            else { Idem = demVA / (Math.sqrt(3) * norma.tensaoFF); tensaoCalc = norma.tensaoFF; }

            // Encontrar faixa
            const tipoLabel = { mono: 'Monofásico', bi: 'Bifásico', tri: 'Trifásico' }[tipoForn];
            let faixa = null;
            if (tipoForn === 'mono') faixa = norma.faixas.find(f => f.tipo === 'Monofásico');
            else if (tipoForn === 'bi') faixa = norma.faixas.filter(f => f.tipo === 'Bifásico').pop();
            else {
                faixa = norma.faixas.find(f => f.tipo === 'Trifásico' && demKVA <= f.demMax);
                if (!faixa) faixa = norma.faixas.filter(f => f.tipo === 'Trifásico').pop();
            }

            // Queda de tensão do ramal
            const rho = 0.0172; // cobre
            const secao = faixa ? faixa.bitola : 16;
            const dvPerc = tipoForn === 'mono'
                ? (2 * rho * comp * Idem / (secao * tensaoCalc)) * 100
                : (Math.sqrt(3) * rho * comp * Idem / (secao * tensaoCalc)) * 100;

            const grid = document.getElementById('distrib-ramal-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${demKVA.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Demanda</div></div>
                <div class="predial-result-item"><div class="value">${Idem.toFixed(1)}</div><div class="unit">A</div><div class="desc">Corrente</div></div>
                <div class="predial-result-item"><div class="value">${secao}</div><div class="unit">mm²</div><div class="desc">Seção do condutor</div></div>
                <div class="predial-result-item"><div class="value">${dvPerc.toFixed(2)}</div><div class="unit">%</div><div class="desc">Queda de tensão</div></div>
            `;

            let html = '';
            if (faixa) {
                html += '<table class="predial-table"><thead><tr><th>Item</th><th>Especificação</th></tr></thead><tbody>';
                html += '<tr><td>Tipo de fornecimento</td><td>' + tipoLabel + '</td></tr>';
                html += '<tr><td>Faixa</td><td>' + faixa.id + '</td></tr>';
                html += '<tr><td>Disjuntor</td><td>' + faixa.disj + '</td></tr>';
                html += '<tr><td>Condutores</td><td>' + faixa.condutores + '</td></tr>';
                html += '<tr><td>Seção — Fases/Neutro</td><td>#' + faixa.bitola + ' mm²</td></tr>';
                html += '<tr><td>Seção — Terra</td><td>#' + faixa.bitolaT + ' mm²</td></tr>';
                html += '<tr><td>Eletroduto</td><td>Ø ' + faixa.eletroduto + ' mm</td></tr>';
                html += '<tr><td>Comprimento</td><td>' + comp + ' m</td></tr>';
                html += '<tr><td>Queda de tensão</td><td>' + dvPerc.toFixed(2) + '% ' + (dvPerc <= 4 ? '<i data-eo-icon=circle-check></i> OK (≤ 4%)' : '<i data-eo-icon=circle-x></i> EXCEDE (> 4%)') + '</td></tr>';
                html += '</tbody></table>';
            }

            html += '<div class="info-box" style="margin-top:.8rem"><p><i data-eo-icon=info></i> Cálculo conforme <strong>' + norma.nome + '</strong>. Condutor de cobre (ρ = 0,0172 Ω·mm²/m).</p></div>';

            document.getElementById('distrib-ramal-detail').innerHTML = html;
            document.getElementById('distrib-ramal-result').style.display = 'block';
        }

// ─── ATERRAMENTO ──────────────────────────────────────────────
function calcDistribAterr() {
            const normaKey = (document.getElementById('distrib-norma5') || {}).value || 'cemig';
            const norma = DISTRIB_NORMAS[normaKey];
            const faixaId = (document.getElementById('distrib-aterr-faixa') || {}).value || 'C1';
            const rhoSolo = parseFloat(document.getElementById('distrib-aterr-rho').value) || 100;

            // Encontrar faixa correspondente
            let faixa = norma.faixas.find(f => f.id === faixaId);
            if (!faixa) faixa = norma.faixas[0];

            const hastes = faixa.hastes;
            const L = 2.40; // comprimento da haste (m)
            const d = 0.0127; // diâmetro da haste 1/2" (m)

            // Resistência de 1 haste (fórmula de Dwight)
            const R1 = (rhoSolo / (2 * Math.PI * L)) * (Math.log(4 * L / d) - 1);

            // Fator de redução para múltiplas hastes
            const fatores = { 1: 1.0, 2: 0.58, 3: 0.43, 4: 0.36 };
            const fator = fatores[Math.min(hastes, 4)] || 0.36;
            const Rtotal = R1 * fator;

            // Resistência máxima recomendada
            const Rmax = normaKey === 'cemig' ? 25 : 10;
            const ok = Rtotal <= Rmax;

            const grid = document.getElementById('distrib-aterr-grid');
            grid.innerHTML = `
                <div class="predial-result-item"><div class="value">${hastes}</div><div class="unit">haste(s)</div><div class="desc">Quantidade</div></div>
                <div class="predial-result-item"><div class="value">${R1.toFixed(1)}</div><div class="unit">Ω</div><div class="desc">R₁ (1 haste)</div></div>
                <div class="predial-result-item"><div class="value">${Rtotal.toFixed(1)}</div><div class="unit">Ω</div><div class="desc">R total</div></div>
                <div class="predial-result-item"><div class="value">${Rmax}</div><div class="unit">Ω</div><div class="desc">R máx. permitida</div></div>
            `;

            let html = '<table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>';
            html += '<tr><td>Faixa de fornecimento</td><td>' + faixa.id + ' — ' + faixa.tipo + '</td></tr>';
            html += '<tr><td>Número de hastes (norma)</td><td>' + hastes + '</td></tr>';
            html += '<tr><td>Comprimento da haste</td><td>' + L.toFixed(2) + ' m (copperweld ⌀ 1/2")</td></tr>';
            html += '<tr><td>Resistividade do solo</td><td>' + rhoSolo + ' Ω·m</td></tr>';
            html += '<tr><td>Resistência de 1 haste</td><td>' + R1.toFixed(2) + ' Ω</td></tr>';
            html += '<tr><td>Fator de redução (' + hastes + ' hastes)</td><td>' + fator + '</td></tr>';
            html += '<tr><td>Resistência total estimada</td><td>' + Rtotal.toFixed(2) + ' Ω</td></tr>';
            html += '<tr><td>Resistência máxima (' + normaKey.toUpperCase() + ')</td><td>' + Rmax + ' Ω</td></tr>';
            html += '<tr><td>Status</td><td style="color:' + (ok ? 'var(--accent4)' : 'var(--accent2)') + ';font-weight:700">' + (ok ? '<i data-eo-icon=circle-check></i> ATENDE' : '<i data-eo-icon=circle-x></i> NÃO ATENDE — adicionar hastes') + '</td></tr>';
            html += '</tbody></table>';

            if (!ok) {
                // Calcular hastes necessárias
                let hastesNeeded = hastes;
                for (let h = hastes + 1; h <= 20; h++) {
                    const f = h <= 4 ? (fatores[h] || 0.36) : (1.0 / h * 1.5);
                    if (R1 * f <= Rmax) { hastesNeeded = h; break; }
                }
                html += '<div class="info-box" style="margin-top:.8rem;border-color:var(--accent2)"><p><i data-eo-icon=triangle-alert></i> Recomenda-se utilizar <strong>' + hastesNeeded + ' hastes</strong> ou reduzir a resistividade do solo com tratamento químico.</p></div>';
            }

            html += '<div class="info-box" style="margin-top:.8rem"><p><i data-eo-icon=info></i> Cálculo pela fórmula de Dwight. Concessionária: <strong>' + norma.nome + '</strong>.</p></div>';

            document.getElementById('distrib-aterr-detail').innerHTML = html;
            document.getElementById('distrib-aterr-result').style.display = 'block';
        }

// ─── DIMENSIONAR PROJETO COMPLETO ─────────────────────────────
let _distribProjetoData = null;

// ── Helpers para novos inputs ──
function onProjTipoChange() { calcDistribProjeto(); }

function onProjPadraoChange() {
            const p = document.getElementById('proj-padrao-res').value;
            const ciMap = { baixo: 3000, medio: 5000, alto: 9000, luxo: 15000 };
            if (p !== 'custom') document.getElementById('proj-ci-unidade').value = ciMap[p];
            calcDistribProjeto();
        }

function onProjSoloChange() {
            const s = document.getElementById('proj-aterr-solo').value;
            const rhoMap = { arenoso: 200, argiloso: 100, umido: 30, rochoso: 1000 };
            document.getElementById('proj-aterr-rho').value = rhoMap[s];
            calcDistribProjeto();
        }

// Tabela de fator de demanda simultânea por nº de unidades (NBR 5410 / CEMIG ND5.2)
function getFatorSimultaneo(n) {
            if (n <= 1) return 1.00;
            if (n === 2) return 0.87;
            if (n === 3) return 0.79;
            if (n === 4) return 0.73;
            if (n === 5) return 0.69;
            if (n <= 7) return 0.66;
            if (n <= 10) return 0.63;
            if (n <= 15) return 0.58;
            if (n <= 20) return 0.53;
            if (n <= 30) return 0.49;
            if (n <= 50) return 0.44;
            if (n <= 100) return 0.40;
            return 0.36;
        }

// Selecionar bitola padrão pelo critério de ampacidade (NBR 5410 tabela 36 — cobre, B1)
function selecionarBitola(Icalc, material = 'cobre') {
            // Ampacidades aproximadas em conduto — cobre
            const tabelaCobre = [
                { s: 1.5, Iz: 15.5 }, { s: 2.5, Iz: 21 }, { s: 4, Iz: 28 }, { s: 6, Iz: 36 },
                { s: 10, Iz: 50 }, { s: 16, Iz: 68 }, { s: 25, Iz: 89 }, { s: 35, Iz: 110 },
                { s: 50, Iz: 134 }, { s: 70, Iz: 171 }, { s: 95, Iz: 207 }, { s: 120, Iz: 239 },
                { s: 150, Iz: 272 }, { s: 185, Iz: 310 }, { s: 240, Iz: 365 }, { s: 300, Iz: 419 }
            ];
            const tabelaAlum = [
                { s: 10, Iz: 39 }, { s: 16, Iz: 53 }, { s: 25, Iz: 70 }, { s: 35, Iz: 86 },
                { s: 50, Iz: 104 }, { s: 70, Iz: 133 }, { s: 95, Iz: 161 }, { s: 120, Iz: 186 },
                { s: 150, Iz: 212 }, { s: 185, Iz: 241 }, { s: 240, Iz: 284 }, { s: 300, Iz: 326 }
            ];
            const tab = material === 'aluminio' ? tabelaAlum : tabelaCobre;
            for (const row of tab) { if (row.Iz >= Icalc) return row; }
            return tab[tab.length - 1];
        }

// Dimensionar neutro considerando harmônicos (NBR 5410 / IEC 60364-5-52)
function dimensionarNeutro(Ifase, thdI, percMonof) {
            // Corrente de harmônico de 3ª ordem no neutro (triplo — soma vetorial)
            const I3h = Ifase * (thdI / 100) * 0.33; // componente 3ª ordem estimada
            const Ineutro_harm = 3 * I3h; // soma algébrica no neutro trifásico
            const fatorDeseq = 1 + (percMonof / 100) * 0.5;
            const Ineutro = Math.max(Ifase * fatorDeseq, Ineutro_harm);
            const fatorSobrecarga = Ineutro > Ifase ? 1.0 : 0.5; // neutro sobrecarregado → mesmo da fase
            return { Ineutro, fatorSobrecarga, sobNeutro: Ineutro > Ifase };
        }

function calcDistribProjeto() {
            const normaKey = (document.getElementById('distrib-norma-proj') || {}).value || 'cemig';
            const norma = DISTRIB_NORMAS[normaKey];

            // Dados gerais
            const nomeProjeto = document.getElementById('proj-nome').value || '—';
            const rt = document.getElementById('proj-rt').value || '—';
            const crea = document.getElementById('proj-crea').value || '—';
            const tipoEdif = document.getElementById('proj-tipo-edif').value;
            const tipoEdifLabel = document.getElementById('proj-tipo-edif').selectedOptions[0].text;
            const tensaoForn = document.getElementById('proj-tensao-forn').value;
            const tensaoFF = tensaoForn === '220380' ? 380 : 220;
            const tensaoFN = tensaoForn === '220380' ? 220 : 127;

            // ── 1. DEMANDA DE CONDOMÍNIO ──
            const nUnidades = parseInt(document.getElementById('proj-n-unidades').value) || 1;
            const ciUnidade = parseFloat(document.getElementById('proj-ci-unidade').value) || 5000;
            const areaUnid = parseFloat(document.getElementById('proj-area-unid').value) || 80;
            const ilumComumW = parseFloat(document.getElementById('proj-ilum-comum').value) || 0;
            const cargasComunsW = parseFloat(document.getElementById('proj-cargas-comuns').value) || 0;
            const elevW = parseFloat(document.getElementById('proj-elev').value) || 0;
            const fp = parseFloat(document.getElementById('proj-fp').value) || 0.92;
            const fd = (parseFloat(document.getElementById('proj-fd').value) || 60) / 100;

            const fatorSimult = getFatorSimultaneo(nUnidades);
            const ciTotalUnid = ciUnidade * nUnidades;
            const demUnidadesW = ciTotalUnid * fatorSimult;

            // ── 2. CARGAS INDIVIDUAIS (por unidade) ──
            const ilumW = parseFloat(document.getElementById('proj-ilum').value) || 0;
            const tugW = parseFloat(document.getElementById('proj-tug').value) || 0;
            const chuvW = parseFloat(document.getElementById('proj-chuv').value) || 0;
            const arW = parseFloat(document.getElementById('proj-ar').value) || 0;
            const fornoW = parseFloat(document.getElementById('proj-forno').value) || 0;
            const aquecW = parseFloat(document.getElementById('proj-aquec').value) || 0;
            const motorW = parseFloat(document.getElementById('proj-motor').value) || 0;
            const outrasW = parseFloat(document.getElementById('proj-outras').value) || 0;

            const fdIlum = fd;
            const fdTug = fd;
            const fdChuv = chuvW <= 6000 ? 1.0 : 0.8;
            const fdAR = 0.7;
            const fdForno = fornoW > 0 ? 0.8 : 0;
            const fdAquec = aquecW > 0 ? 0.75 : 0;
            const fdMotor = motorW > 0 ? 0.7 : 0;
            const fdOutras = fd;

            const demIlum = ilumW * fdIlum;
            const demTug = tugW * fdTug;
            const demChuv = chuvW * fdChuv;
            const demAR = arW * fdAR;
            const demForno = fornoW * fdForno;
            const demAquec = aquecW * fdAquec;
            const demMotor = motorW * fdMotor;
            const demOutras = outrasW * fdOutras;
            const ciIndivUnid = ilumW + tugW + chuvW + arW + fornoW + aquecW + motorW + outrasW;
            const demIndivUnid = demIlum + demTug + demChuv + demAR + demForno + demAquec + demMotor + demOutras;

            // Usar CI por unidade informado se > 0, caso contrário somar individuais
            const ciPorUnidFinal = ciUnidade > 0 ? ciUnidade : ciIndivUnid;
            const demPorUnidFinal = ciPorUnidFinal * fatorSimult * fd;

            // TOTAL demanda
            const fdComuns = 0.9;
            const demComunsW = (ilumComumW + cargasComunsW) * fdComuns;
            const fdElev = 0.65;
            const demElevW = elevW * fdElev;
            const ciTotal = ciTotalUnid + ilumComumW + cargasComunsW + elevW;
            const demandaW = (ciTotalUnid * fatorSimult * fd) + demComunsW + demElevW;
            const demandaKW = demandaW / 1000;
            const demandaKVA = demandaKW / fp;
            const demandaKVAR = Math.sqrt(Math.max(0, demandaKVA ** 2 - demandaKW ** 2));

            // ── 3. TRANSFORMADOR ──
            const reservaTrafo = (parseFloat(document.getElementById('proj-trafo-reserva').value) || 20) / 100;
            const efTrafo = (parseFloat(document.getElementById('proj-trafo-eff').value) || 98) / 100;
            const vccTrafo = parseFloat(document.getElementById('proj-trafo-vcc').value) || 4;
            const tensaoMT = parseFloat(document.getElementById('proj-trafo-vp').value) || 13.8;

            const sTrafoNec = demandaKVA * (1 + reservaTrafo) / efTrafo;
            // Potências nominalizadas de trafos (kVA)
            const potsTrafo = [15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500];
            const sTrafoSel = potsTrafo.find(p => p >= sTrafoNec) || potsTrafo[potsTrafo.length - 1];
            const iccTrafo_kA = (sTrafoSel / (Math.sqrt(3) * tensaoFF * (vccTrafo / 100))) / 1000;
            const iTrafoNom = (sTrafoSel * 1000) / (Math.sqrt(3) * tensaoFF);
            const relacaoTrafo = `${(tensaoMT * 1000).toFixed(0)}/${tensaoFF} V`;

            // ── 4. ILUMINAÇÃO (método dos lumens) ──
            const areaIlum = parseFloat(document.getElementById('proj-ilum-area').value) || 200;
            const Elux = parseFloat(document.getElementById('proj-ilum-lux').value) || 100;
            const tipoLamp = document.getElementById('proj-ilum-lamp').value;
            const eficLamp = { led: 100, fluoresc: 70, vapor_sodio: 110, vapor_mercurio: 50 }[tipoLamp];
            const Fu = parseFloat(document.getElementById('proj-ilum-fu').value) || 0.65;
            const Fm = parseFloat(document.getElementById('proj-ilum-fm').value) || 0.80;
            const potLamp = parseFloat(document.getElementById('proj-ilum-pot').value) || 18;
            const fluxLamp = potLamp * eficLamp; // lm
            const nLamps = Math.ceil((Elux * areaIlum) / (fluxLamp * Fu * Fm));
            const potTotalIlum = nLamps * potLamp;
            const iIlum = potTotalIlum / tensaoFN;

            // ── 5. THD E NEUTRO ──
            const thdNL = parseFloat(document.getElementById('proj-thd-nl').value) || 30;
            const thdI = parseFloat(document.getElementById('proj-thd-i').value) || 20;
            const percDeseq = parseFloat(document.getElementById('proj-deseq').value) || 15;

            // Corrente fundamental por fase
            const numFasesTot = tensaoForn === '220380' ? 3 : (demandaKVA > 12 ? 2 : 1);
            const Ifase = numFasesTot === 3
                ? (demandaKVA * 1000) / (Math.sqrt(3) * tensaoFF)
                : numFasesTot === 2
                    ? (demandaKVA * 1000) / (2 * tensaoFN)
                    : (demandaKVA * 1000) / tensaoFN;

            const thdVestimado = thdI * 0.15; // estimativa simplificada THD-V
            const thdVok = thdVestimado <= 8;
            const neutroCalc = dimensionarNeutro(Ifase, thdI, percDeseq);
            const { Ineutro, fatorSobrecarga, sobNeutro } = neutroCalc;

            // ── 6. TIPO DE FORNECIMENTO E FAIXA ──
            let tipoForn;
            if (ciTotal <= norma.monoLimite) tipoForn = 'Monofásico';
            else if (ciTotal <= norma.biLimite) tipoForn = 'Bifásico';
            else tipoForn = 'Trifásico';

            const numFases = tipoForn === 'Monofásico' ? 1 : tipoForn === 'Bifásico' ? 2 : 3;
            let faixa = null;
            if (tipoForn === 'Monofásico') faixa = norma.faixas.find(f => f.tipo === 'Monofásico');
            else if (tipoForn === 'Bifásico') faixa = norma.faixas.filter(f => f.tipo === 'Bifásico').pop();
            else {
                faixa = norma.faixas.find(f => f.tipo === 'Trifásico' && demandaKVA <= f.demMax);
                if (!faixa) faixa = norma.faixas.filter(f => f.tipo === 'Trifásico').pop();
            }
            const mediaTensao = demandaKVA > norma.mediaTensaoLimite;

            // ── 7. RAMAL DE ENTRADA ──
            const ramalComp = parseFloat(document.getElementById('proj-ramal-comp').value) || 15;
            const ramalTipo = document.getElementById('proj-ramal-tipo').value;
            const qtMax = parseFloat(document.getElementById('proj-qt-max').value) || 2;
            const tempAmb = parseFloat(document.getElementById('proj-temp-amb').value) || 35;

            const rho_cond = ramalTipo === 'aereo' ? 0.0282 : 0.0172;
            const matRamal = ramalTipo === 'aereo' ? 'aluminio' : 'cobre';
            const bitolaNorma = faixa ? faixa.bitola : 16;

            // Corrente do ramal
            const Iramal = numFases === 3
                ? (demandaKVA * 1000) / (Math.sqrt(3) * tensaoFF)
                : numFases === 2
                    ? (demandaKVA * 1000) / (2 * tensaoFN)
                    : demandaW / tensaoFN;

            // Fator de correção de temperatura (ref. 30°C)
            const ftTemp = Math.sqrt((90 - tempAmb) / (90 - 30));
            const IramalCorr = Iramal / ftTemp;
            const bitolaRamalCalc = selecionarBitola(IramalCorr, matRamal);

            let qtCalc = 0;
            const bitola_qt = bitolaRamalCalc.s;
            if (bitola_qt > 0) {
                const R_cond = (rho_cond * ramalComp) / bitola_qt;
                qtCalc = numFases === 1
                    ? (2 * R_cond * Iramal / tensaoFN) * 100
                    : (Math.sqrt(3) * R_cond * Iramal / tensaoFF) * 100;
            }
            const qtOk = qtCalc <= qtMax;
            let bitolaMaiorComp = bitolaRamalCalc;
            if (!qtOk) {
                // Calcular seção mínima por queda de tensão
                const deltaV_abs = (numFases === 1 ? tensaoFN : tensaoFF) * (qtMax / 100);
                const sMin_qt = numFases === 1
                    ? (2 * rho_cond * ramalComp * Iramal) / deltaV_abs
                    : (Math.sqrt(3) * rho_cond * ramalComp * Iramal) / deltaV_abs;
                bitolaMaiorComp = selecionarBitola(Math.max(IramalCorr, sMin_qt / rho_cond), matRamal);
            }
            const bitolaFinal = qtOk ? bitolaRamalCalc : bitolaMaiorComp;
            const qtCalcFinal = (() => {
                const R2 = (rho_cond * ramalComp) / bitolaFinal.s;
                return numFases === 1
                    ? (2 * R2 * Iramal / tensaoFN) * 100
                    : (Math.sqrt(3) * R2 * Iramal / tensaoFF) * 100;
            })();

            // ── 8. DISJUNTOR GERAL ──
            const disjPadroes = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
            const iDisjMin = Iramal * 1.25;
            const disjGeral = disjPadroes.find(d => d >= iDisjMin) || 630;

            // ── 9. NEUTRO ──
            const bitolaFase = bitolaFinal.s;
            let bitolaNeutro;
            if (sobNeutro) {
                // Neutro sobrecarregado → mesma seção da fase
                bitolaNeutro = bitolaFase;
            } else {
                // NBR 5410: neutro = fase se ≤ 16mm²; caso contrário pode ser reduzido
                bitolaNeutro = bitolaFase <= 16 ? bitolaFase : Math.max(16, bitolaFase * 0.5);
            }
            // Terra (PE) — NBR 5410 tabela de proteção
            let bitolaTerra;
            if (bitolaFase <= 16) bitolaTerra = bitolaFase;
            else if (bitolaFase <= 35) bitolaTerra = 16;
            else bitolaTerra = bitolaFase / 2;

            // ── 10. ATERRAMENTO ──
            const rhoSolo = parseFloat(document.getElementById('proj-aterr-rho').value) || 100;
            const Rmax = parseInt(document.getElementById('proj-aterr-rmax').value) || 10;
            const L_haste = 2.40;
            const d_haste = 0.0127;
            const R1 = (rhoSolo / (2 * Math.PI * L_haste)) * (Math.log(4 * L_haste / d_haste) - 1);
            const nHastes = faixa ? faixa.hastes : 1;
            const fatoresH = { 1: 1.0, 2: 0.58, 3: 0.43, 4: 0.36 };
            const fatorH = nHastes <= 4 ? fatoresH[nHastes] : (1.5 / nHastes);
            const Rtotal = R1 * fatorH;
            const aterrOk = Rtotal <= Rmax;
            let hastesNeeded = nHastes;
            if (!aterrOk) {
                for (let h = nHastes + 1; h <= 30; h++) {
                    const fh = h <= 4 ? (fatoresH[h] || 0.36) : (1.5 / h);
                    if (R1 * fh <= Rmax) { hastesNeeded = h; break; }
                }
            }
            // Comprimento de malha equivalente
            const L_malha_equiv = rhoSolo / (2 * Math.PI * Rmax);

            // ── Armazenar para exportação ──
            _distribProjetoData = {
                nomeProjeto, rt, crea, tipoEdifLabel, normaKey, norma,
                tensaoFF, tensaoFN, tipoForn, numFases, fp, fd,
                nUnidades, ciUnidade, areaUnid, fatorSimult,
                ciTotalUnid, ilumComumW, cargasComunsW, elevW,
                ilumW, tugW, chuvW, arW, fornoW, aquecW, motorW, outrasW,
                fdIlum, fdTug, fdChuv, fdAR, fdForno, fdAquec, fdMotor, fdOutras,
                demIlum, demTug, demChuv, demAR, demForno, demAquec, demMotor, demOutras,
                demUnidadesW, demComunsW, demElevW,
                ciTotal, demandaW, demandaKW, demandaKVA, demandaKVAR,
                // Trafo
                sTrafoNec, sTrafoSel, iccTrafo_kA, iTrafoNom, relacaoTrafo, tensaoMT, vccTrafo,
                // Iluminação
                areaIlum, Elux, tipoLamp, eficLamp, potLamp, fluxLamp, nLamps, potTotalIlum, iIlum, Fu, Fm,
                // THD
                thdI, thdNL, percDeseq, thdVestimado, thdVok,
                Ifase, Ineutro, sobNeutro,
                // Ramal
                ramalComp, ramalTipo, qtMax, tempAmb, ftTemp,
                Iramal, bitolaFinal: bitolaFinal.s, qtCalcFinal, qtOk: qtCalcFinal <= qtMax,
                disjGeral,
                // Neutro/Terra
                bitolaNeutro, bitolaTerra,
                // Aterramento
                rhoSolo, Rmax, R1, nHastes, fatorH, Rtotal, aterrOk, hastesNeeded, L_malha_equiv,
                faixa, mediaTensao,
                bitolaCond: bitolaFinal.s,
                data: new Date().toLocaleDateString('pt-BR')
            };

            // ══════════════════════════════════════════════
            // RENDERIZAR RESULTADO
            // ══════════════════════════════════════════════
            let html = '';
            const ok = (v) => `<span style="color:var(--accent4)"><i data-eo-icon=circle-check></i> ${v}</span>`;
            const nok = (v) => `<span style="color:var(--accent2)"><i data-eo-icon=circle-x></i> ${v}</span>`;
            const warn = (v) => `<span style="color:var(--accent5,#f59e0b)"><i data-eo-icon=triangle-alert></i> ${v}</span>`;

            // BLOCO 0 — Resumo executivo
            html += `<div class="card" style="margin-bottom:.8rem;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.3)">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3><i data-eo-icon=file-text></i> Identificação do Projeto</h3></div>
              <table class="predial-table"><tbody>
                <tr><td><strong>Projeto</strong></td><td>${nomeProjeto}</td><td><strong>RT</strong></td><td>${rt}</td></tr>
                <tr><td><strong>CREA/CFT</strong></td><td>${crea}</td><td><strong>Norma</strong></td><td>${norma.nome}</td></tr>
                <tr><td><strong>Edificação</strong></td><td>${tipoEdifLabel}</td><td><strong>Tensão</strong></td><td>${tensaoFF}/${tensaoFN} V — ${tipoForn}</td></tr>
                <tr><td><strong>Unidades</strong></td><td>${nUnidades} un.</td><td><strong>Data</strong></td><td>${_distribProjetoData.data}</td></tr>
              </tbody></table>
              <div class="predial-result-grid" style="margin-top:.7rem">
                <div class="predial-result-item"><div class="value">${demandaKW.toFixed(1)}</div><div class="unit">kW</div><div class="desc">Demanda ativa</div></div>
                <div class="predial-result-item"><div class="value">${demandaKVA.toFixed(1)}</div><div class="unit">kVA</div><div class="desc">Demanda aparente</div></div>
                <div class="predial-result-item"><div class="value">${sTrafoSel}</div><div class="unit">kVA</div><div class="desc">Trafo selecionado</div></div>
                <div class="predial-result-item"><div class="value">${bitolaFinal.s}</div><div class="unit">mm²</div><div class="desc">Seção ramal</div></div>
                <div class="predial-result-item"><div class="value">${disjGeral}</div><div class="unit">A</div><div class="desc">Disjuntor geral</div></div>
                <div class="predial-result-item"><div class="value">${Rtotal.toFixed(1)}</div><div class="unit">Ω</div><div class="desc">Resist. aterramento</div></div>
              </div>
            </div>`;

            // BLOCO 1 — Demanda de condomínio
            html += `<div class="card" style="margin-bottom:.8rem">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>1. Demanda de Residências / Condomínio</h3></div>
              <table class="predial-table"><thead><tr><th>Parcela</th><th>CI (W)</th><th>Fator</th><th>Demanda (W)</th></tr></thead><tbody>
                <tr><td>Unidades residenciais (${nUnidades} × ${ciUnidade} W)</td><td>${ciTotalUnid.toFixed(0)}</td><td>Fs=${fatorSimult.toFixed(2)} × Fd=${(fd * 100).toFixed(0)}%</td><td>${(ciTotalUnid * fatorSimult * fd).toFixed(0)}</td></tr>
                <tr><td>Iluminação áreas comuns</td><td>${ilumComumW}</td><td>${(fdComuns * 100).toFixed(0)}%</td><td>${(ilumComumW * fdComuns).toFixed(0)}</td></tr>
                <tr><td>Cargas comuns (bombas, portão etc.)</td><td>${cargasComunsW}</td><td>${(fdComuns * 100).toFixed(0)}%</td><td>${(cargasComunsW * fdComuns).toFixed(0)}</td></tr>
                <tr><td>Elevadores</td><td>${elevW}</td><td>${elevW > 0 ? (fdElev * 100).toFixed(0) + '%' : '—'}</td><td>${demElevW.toFixed(0)}</td></tr>
                <tr style="font-weight:700;background:rgba(16,185,129,.1)"><td>TOTAL INSTALADO / DEMANDA</td><td>${ciTotal.toFixed(0)}</td><td></td><td>${demandaW.toFixed(0)}</td></tr>
              </tbody></table>
              <div class="info-box" style="margin-top:.5rem"><p>Fator de simultaneidade para <strong>${nUnidades} unidades</strong>: <strong>Fs = ${fatorSimult.toFixed(2)}</strong> (NBR 5410 / CEMIG ND 5.2)</p></div>
            </div>`;

            // BLOCO 2 — Cargas por unidade
            html += `<div class="card" style="margin-bottom:.8rem">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>2. Levantamento de Cargas — por Unidade</h3></div>
              <table class="predial-table"><thead><tr><th>Parcela</th><th>CI (W)</th><th>FD</th><th>Demanda (W)</th></tr></thead><tbody>
                <tr><td>Iluminação</td><td>${ilumW}</td><td>${(fdIlum * 100).toFixed(0)}%</td><td>${demIlum.toFixed(0)}</td></tr>
                <tr><td>Tomadas de Uso Geral (TUG)</td><td>${tugW}</td><td>${(fdTug * 100).toFixed(0)}%</td><td>${demTug.toFixed(0)}</td></tr>
                <tr><td>Chuveiro Elétrico</td><td>${chuvW}</td><td>${(fdChuv * 100).toFixed(0)}%</td><td>${demChuv.toFixed(0)}</td></tr>
                <tr><td>Ar Condicionado</td><td>${arW}</td><td>${(fdAR * 100).toFixed(0)}%</td><td>${demAR.toFixed(0)}</td></tr>
                <tr><td>Forno / Fogão</td><td>${fornoW}</td><td>${fornoW > 0 ? (fdForno * 100).toFixed(0) + '%' : '—'}</td><td>${demForno.toFixed(0)}</td></tr>
                <tr><td>Aquecedor de Passagem</td><td>${aquecW}</td><td>${aquecW > 0 ? (fdAquec * 100).toFixed(0) + '%' : '—'}</td><td>${demAquec.toFixed(0)}</td></tr>
                <tr><td>Motores / Bombas</td><td>${motorW}</td><td>${motorW > 0 ? (fdMotor * 100).toFixed(0) + '%' : '—'}</td><td>${demMotor.toFixed(0)}</td></tr>
                <tr><td>Outras Cargas</td><td>${outrasW}</td><td>${(fdOutras * 100).toFixed(0)}%</td><td>${demOutras.toFixed(0)}</td></tr>
                <tr style="font-weight:700;background:rgba(16,185,129,.1)"><td>SUBTOTAL / UNIDADE</td><td>${ciIndivUnid.toFixed(0)}</td><td></td><td>${demIndivUnid.toFixed(0)}</td></tr>
              </tbody></table>
            </div>`;

            // BLOCO 3 — Transformador
            if (mediaTensao || sTrafoNec > 30) {
                html += `<div class="card" style="margin-bottom:.8rem">
                  <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>3. Transformador / Subestação</h3></div>
                  <table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>
                    <tr><td>Demanda aparente total</td><td>${demandaKVA.toFixed(2)} kVA</td></tr>
                    <tr><td>Potência necessária (+ reserva ${((reservaTrafo) * 100).toFixed(0)}%)</td><td>${sTrafoNec.toFixed(1)} kVA</td></tr>
                    <tr><td style="font-weight:700">Transformador selecionado</td><td style="font-weight:700;color:#10b981">${sTrafoSel} kVA</td></tr>
                    <tr><td>Relação de transformação</td><td>${relacaoTrafo}</td></tr>
                    <tr><td>Corrente nominal (secundário)</td><td>${iTrafoNom.toFixed(1)} A</td></tr>
                    <tr><td>Tensão de curto-circuito (Vcc)</td><td>${vccTrafo}%</td></tr>
                    <tr><td>Corrente de curto-circuito (ICC)</td><td>${(iccTrafo_kA * 1000).toFixed(0)} A ≈ ${iccTrafo_kA.toFixed(2)} kA</td></tr>
                    <tr><td>Capacidade de interrupção mínima</td><td><strong>${iccTrafo_kA < 10 ? '10 kA' : iccTrafo_kA < 15 ? '15 kA' : '25 kA'}</strong></td></tr>
                  </tbody></table>
                  ${mediaTensao ? `<div class="info-box" style="border-color:var(--accent2);margin-top:.5rem"><p><i data-eo-icon=triangle-alert></i> Demanda de ${demandaKVA.toFixed(1)} kVA exige fornecimento em <strong>Média Tensão (${tensaoMT} kV)</strong> — projeto de subestação necessário.</p></div>` : ''}
                </div>`;
            }

            // BLOCO 4 — Iluminação
            html += `<div class="card" style="margin-bottom:.8rem">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>4. Dimensionamento de Iluminação — Método dos Lúmens</h3></div>
              <table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>
                <tr><td>Área a iluminar</td><td>${areaIlum} m²</td></tr>
                <tr><td>Iluminância desejada (E)</td><td>${Elux} lux</td></tr>
                <tr><td>Tipo de lâmpada</td><td>${{ led: 'LED', fluoresc: 'Fluorescente', vapor_sodio: 'Vapor de Sódio', vapor_mercurio: 'Vapor de Mercúrio' }[tipoLamp]}</td></tr>
                <tr><td>Eficiência luminosa</td><td>${eficLamp} lm/W</td></tr>
                <tr><td>Potência da lâmpada</td><td>${potLamp} W → ${fluxLamp} lm</td></tr>
                <tr><td>Fator de utilização (Fu)</td><td>${Fu}</td></tr>
                <tr><td>Fator de manutenção (Fm)</td><td>${Fm}</td></tr>
                <tr><td><strong>Número de lâmpadas necessárias</strong></td><td><strong>${nLamps} luminárias</strong></td></tr>
                <tr><td>Potência total de iluminação</td><td>${potTotalIlum} W</td></tr>
                <tr><td>Corrente do circuito (${tensaoFN} V)</td><td>${iIlum.toFixed(2)} A</td></tr>
              </tbody></table>
              <div class="info-box" style="margin-top:.5rem"><p>Fórmula: N = (E × A) / (Φ × Fu × Fm) = (${Elux} × ${areaIlum}) / (${fluxLamp} × ${Fu} × ${Fm}) = <strong>${nLamps} luminárias</strong></p></div>
            </div>`;

            // BLOCO 5 — THD e Neutro
            html += `<div class="card" style="margin-bottom:.8rem">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>5. Qualidade de Energia — THD e Dimensionamento do Neutro</h3></div>
              <table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th><th>Limite / Status</th></tr></thead><tbody>
                <tr><td>Cargas não-lineares</td><td>${thdNL}%</td><td>—</td></tr>
                <tr><td>THD de corrente estimado (THD-I)</td><td>${thdI}%</td><td>— (ref. IEEE 519)</td></tr>
                <tr><td>THD de tensão estimado (THD-V)</td><td>${thdVestimado.toFixed(1)}%</td><td>${thdVok ? ok('≤ 8% PRODIST') : nok('> 8% PRODIST — filtro recomendado')}</td></tr>
                <tr><td>Corrente de fase (Ifase)</td><td>${Ifase.toFixed(1)} A</td><td>—</td></tr>
                <tr><td>Corrente no neutro (desequilíbrio + harm.)</td><td>${Ineutro.toFixed(1)} A</td><td>${sobNeutro ? warn('Neutro sobrecarregado!') : ok('OK')}</td></tr>
              </tbody></table>
              <div class="predial-result-grid" style="margin-top:.7rem">
                <div class="predial-result-item"><div class="value">${bitolaFinal.s}</div><div class="unit">mm²</div><div class="desc">Seção de fase</div></div>
                <div class="predial-result-item"><div class="value">${bitolaNeutro}</div><div class="unit">mm²</div><div class="desc">Seção de neutro${sobNeutro ? ' (sobrec.)' : ''}</div></div>
                <div class="predial-result-item"><div class="value">${bitolaTerra}</div><div class="unit">mm²</div><div class="desc">Terra (PE)</div></div>
              </div>
              ${sobNeutro ? `<div class="info-box" style="border-color:var(--accent2);margin-top:.5rem"><p><i data-eo-icon=triangle-alert></i> <strong>Neutro sobrecarregado por harmônicos de 3ª ordem</strong> — usar seção igual à fase (${bitolaFinal.s} mm²). Considerar filtro harmônico passivo.</p></div>` : ''}
              ${!thdVok ? `<div class="info-box" style="border-color:var(--accent2);margin-top:.5rem"><p><i data-eo-icon=triangle-alert></i> THD-V estimado ≥ 8% (limite PRODIST). Verificar instalação de filtros harmônicos ou banco de capacitores com reatores anti-harmônicos.</p></div>` : ''}
            </div>`;

            // BLOCO 6 — Padrão de Entrada
            if (faixa) {
                html += `<div class="card" style="margin-bottom:.8rem">
                  <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>6. Padrão de Entrada — Faixa ${faixa.id}</h3></div>
                  <table class="predial-table"><thead><tr><th>Parâmetro</th><th>Especificação (${normaKey.toUpperCase()})</th></tr></thead><tbody>
                    <tr><td>Tipo de fornecimento</td><td><strong>${faixa.tipo}</strong></td></tr>
                    <tr><td>Faixa / Módulo</td><td>${faixa.id} — até ${faixa.demMax} kVA</td></tr>
                    <tr><td>Disjuntor geral (DG)</td><td><strong>${faixa.disj}</strong></td></tr>
                    <tr><td>Condutores do ramal</td><td>${faixa.condutores}</td></tr>
                    <tr><td>Seção — Fases / Neutro (norma)</td><td>#${faixa.bitola} mm²</td></tr>
                    <tr><td>Seção — Terra (PE) norma</td><td>#${faixa.bitolaT} mm²</td></tr>
                    <tr><td>Eletroduto</td><td>Ø ${faixa.eletroduto} mm</td></tr>
                    <tr><td>Tipo de medição</td><td>${faixa.medicao}</td></tr>
                    <tr><td>Tipo de entrada / Poste</td><td>${faixa.poste}</td></tr>
                  </tbody></table>
                </div>`;
            }

            // BLOCO 7 — Ramal
            html += `<div class="card" style="margin-bottom:.8rem">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>7. Ramal de Entrada — Dimensionamento</h3></div>
              <table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>
                <tr><td>Comprimento</td><td>${ramalComp} m</td></tr>
                <tr><td>Tipo</td><td>${ramalTipo === 'aereo' ? 'Aéreo (multiplex alumínio)' : 'Subterrâneo (XLPE cobre)'}</td></tr>
                <tr><td>Corrente de projeto (Iramal)</td><td>${Iramal.toFixed(1)} A</td></tr>
                <tr><td>Temperatura ambiente</td><td>${tempAmb}°C → Fator correção: ${ftTemp.toFixed(3)}</td></tr>
                <tr><td>Corrente corrigida</td><td>${IramalCorr.toFixed(1)} A</td></tr>
                <tr><td><strong>Seção selecionada (fase/neutro)</strong></td><td><strong>#${bitolaFinal.s} mm² (Iz = ${bitolaFinal.Iz} A)</strong></td></tr>
                <tr><td>Seção do neutro</td><td>#${bitolaNeutro} mm²${sobNeutro ? ' <i data-eo-icon=triangle-alert></i> sobrecarregado — igual à fase' : ''}</td></tr>
                <tr><td>Seção do PE (terra)</td><td>#${bitolaTerra} mm²</td></tr>
                <tr><td>Disjuntor geral calculado</td><td><strong>${disjGeral} A</strong></td></tr>
                <tr><td>Queda de tensão calculada</td><td style="color:${(qtCalcFinal <= qtMax) ? 'var(--accent4)' : 'var(--accent2)'}"><strong>${qtCalcFinal.toFixed(2)}% ${qtCalcFinal <= qtMax ? '<i data-eo-icon=circle-check></i>' : '<i data-eo-icon=circle-x></i>'}</strong> (máx. ${qtMax}%)</td></tr>
              </tbody></table>
              ${qtCalcFinal > qtMax ? `<div class="info-box" style="margin-top:.5rem;border-color:var(--accent2)"><p><i data-eo-icon=triangle-alert></i> Queda de tensão acima do limite mesmo com seção aumentada. Verifique comprimento do ramal.</p></div>` : ''}
            </div>`;

            // BLOCO 8 — Aterramento
            html += `<div class="card" style="margin-bottom:.8rem">
              <div class="card-header"><div class="dot" style="background:#10b981"></div><h3>8. Sistema de Aterramento</h3></div>
              <table class="predial-table"><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>
                <tr><td>Resistividade do solo (ρ)</td><td>${rhoSolo} Ω·m</td></tr>
                <tr><td>Eletrodo: haste copperweld</td><td>⌀ 1/2" × 2,40 m</td></tr>
                <tr><td>Resistência de 1 haste (Dwight)</td><td>R₁ = ${R1.toFixed(2)} Ω</td></tr>
                <tr><td>Hastes exigidas pela norma</td><td>${nHastes} haste(s)</td></tr>
                <tr><td>Fator de redução (${nHastes} hastes)</td><td>${fatorH.toFixed(3)}</td></tr>
                <tr><td>Resistência total estimada</td><td>${Rtotal.toFixed(2)} Ω</td></tr>
                <tr><td>Resistência máxima exigida</td><td>${Rmax} Ω</td></tr>
                <tr><td>Status</td><td>${aterrOk ? ok('ATENDE NBR 5410') : nok(`NÃO ATENDE — usar ${hastesNeeded} hastes`)}</td></tr>
                <tr><td>Condutor de aterramento (PE)</td><td>#${bitolaTerra} mm² (cobre nu / verde-amarelo)</td></tr>
                ${!aterrOk ? `<tr><td>Comprimento equiv. malha enterrada</td><td>${L_malha_equiv.toFixed(1)} m</td></tr>` : ''}
              </tbody></table>
              <div class="info-box" style="margin-top:.5rem"><p>Fórmula de Dwight: R = (ρ / 2πL) × [ln(4L/d) − 1] = (${rhoSolo} / ${(2 * Math.PI * L_haste).toFixed(2)}) × [ln(${(4 * L_haste / d_haste).toFixed(1)}) − 1] = <strong>${R1.toFixed(2)} Ω</strong></p></div>
            </div>`;

            html += `<div class="info-box"><p><i data-eo-icon=info></i> Norma: <strong>${norma.nome}</strong> | Tensão: ${tensaoFF}/${tensaoFN} V | FP: ${fp} | Data: ${_distribProjetoData.data}</p></div>`;

            document.getElementById('distrib-projeto-detail').innerHTML = html;
            document.getElementById('distrib-projeto-result').style.display = 'block';
        }

// ─── EXPORTAR XLSX — PROJETO DISTRIBUIÇÃO ────────────────────────
function exportDistribProjetoXLSX() {
            if (!_distribProjetoData) { alert('Execute o dimensionamento antes de exportar.'); return; }
            const d = _distribProjetoData;
            if (typeof XLSX === 'undefined') {
                EO.load('xlsx').then(() => _gerarXLSXProjeto(d)).catch(e => alert(e.message));
            } else { _gerarXLSXProjeto(d); }
        }

function exportDistribProjetoPDF() {
            // PDF do projeto ainda nao implementado (previsto para a Fase 5).
            alert('PDF do projeto em desenvolvimento — use a exportação XLSX.');
        }

function _gerarXLSXProjeto(d) {
            const wb = XLSX.utils.book_new();

            // ── Estilos reutilizáveis ──
            const sTitulo = { font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '10B981' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: { bottom: { style: 'medium', color: { rgb: '059669' } } } };
            const sSecao = { font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '10B981' } }, alignment: { horizontal: 'left', vertical: 'center' } };
            const sLabel = { font: { bold: false, sz: 9, color: { rgb: '444444' } }, fill: { fgColor: { rgb: 'F0FDF4' } }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'thin', color: { rgb: 'D1FAE5' } } } };
            const sValor = { font: { bold: true, sz: 9, color: { rgb: '111111' } }, fill: { fgColor: { rgb: 'FFFFFF' } }, alignment: { horizontal: 'left' }, border: { bottom: { style: 'thin', color: { rgb: 'D1FAE5' } } } };
            const sLabelAlt = { ...sLabel, fill: { fgColor: { rgb: 'ECFDF5' } } };
            const sValorAlt = { ...sValor, fill: { fgColor: { rgb: 'ECFDF5' } } };
            const sObs = { font: { sz: 8, color: { rgb: '666666' } }, fill: { fgColor: { rgb: 'F9FAFB' } }, alignment: { horizontal: 'left' } };
            const sOk = { font: { bold: true, sz: 9, color: { rgb: '065F46' } }, fill: { fgColor: { rgb: 'D1FAE5' } }, alignment: { horizontal: 'center' } };
            const sErr = { font: { bold: true, sz: 9, color: { rgb: '7F1D1D' } }, fill: { fgColor: { rgb: 'FEE2E2' } }, alignment: { horizontal: 'center' } };
            const sWarn = { font: { bold: true, sz: 9, color: { rgb: '78350F' } }, fill: { fgColor: { rgb: 'FEF3C7' } }, alignment: { horizontal: 'center' } };
            const sColHeader = { font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '059669' } }, alignment: { horizontal: 'center' }, border: { bottom: { style: 'medium', color: { rgb: 'FFFFFF' } } } };
            const sAviso = { font: { italic: true, sz: 8, color: { rgb: '7F1D1D' } }, fill: { fgColor: { rgb: 'FFF1F2' } }, alignment: { wrapText: true } };
            const sVazio = { fill: { fgColor: { rgb: 'FFFFFF' } } };

            // Utilitários
            function cel(v, s) { return { v: v === null || v === undefined ? '' : v, s }; }
            function statusStyle(txt) {
                if (!txt) return sObs;
                const t = String(txt).toUpperCase();
                if (t.includes('ATENDE') || t.includes('OK') || t.includes('NORMAL') || t.includes('NORMALIZADO') || t.includes('CALCULADO')) return sOk;
                if (t.includes('NAO') || t.includes('NÃO') || t.includes('EXCEDE') || t.includes('SIM')) return sErr;
                return sWarn;
            }

            // Linha de dado com alternância
            function rowDado(label, valor, obs, alt, status) {
                const lS = alt ? sLabelAlt : sLabel;
                const vS = alt ? sValorAlt : sValor;
                if (status !== undefined) {
                    return [cel(label, lS), cel(valor, vS), cel(obs || '', sObs), cel(status, statusStyle(status))];
                }
                return [cel(label, lS), cel(valor, vS), cel(obs || '', sObs), cel('', sVazio)];
            }
            function rowSecao(titulo) {
                return [cel(titulo, sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao)];
            }
            function rowHeader() {
                return [cel('Parâmetro', sColHeader), cel('Valor', sColHeader), cel('Observação / Norma', sColHeader), cel('Status', sColHeader)];
            }
            function rowVazio() { return [cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio)]; }

            // ── ABA 1: Resumo Executivo ──
            const r1 = [];
            r1.push([cel('PROJETO DE DISTRIBUICAO ELETRICA', sTitulo), cel('', sTitulo), cel('', sTitulo), cel('', sTitulo)]);
            r1.push(rowVazio());
            // Identificação
            r1.push(rowSecao('IDENTIFICACAO DO PROJETO'));
            r1.push(rowHeader());
            r1.push(rowDado('Projeto / Identificacao', d.nomeProjeto, '', false));
            r1.push(rowDado('Responsavel Tecnico', d.rt, '', true));
            r1.push(rowDado('CREA / CFT', d.crea, '', false));
            r1.push(rowDado('Tipo de Edificacao', d.tipoEdifLabel, '', true));
            r1.push(rowDado('Concessionaria / Norma', d.norma.nome, '', false));
            r1.push(rowDado('Tensao de Fornecimento', d.tensaoFF + '/' + d.tensaoFN + ' V', '', true));
            r1.push(rowDado('Tipo de Fornecimento', d.tipoForn, '', false));
            r1.push(rowDado('Data de emissao', d.data, '', true));
            r1.push(rowVazio());
            // Demanda
            r1.push(rowSecao('RESUMO DE DEMANDA'));
            r1.push(rowHeader());
            r1.push(rowDado('No. de Unidades Residenciais', d.nUnidades, '', false));
            r1.push(rowDado('CI por Unidade (W)', d.ciUnidade, '', true));
            r1.push(rowDado('CI Total das Unidades (W)', d.ciTotalUnid, '', false));
            r1.push(rowDado('Fator de Simultaneidade (Fs)', d.fatorSimult.toFixed(2), 'NBR 5410 / CEMIG ND5.2', true));
            r1.push(rowDado('Cargas Comuns + Elevadores (W)', (d.ilumComumW + d.cargasComunsW + d.elevW), '', false));
            r1.push(rowDado('Carga Total Instalada (CI)', d.ciTotal.toFixed(0) + ' W', '', true));
            r1.push(rowDado('Demanda Ativa (P)', d.demandaKW.toFixed(2) + ' kW', '', false));
            r1.push(rowDado('Demanda Aparente (S)', d.demandaKVA.toFixed(2) + ' kVA', '', true));
            r1.push(rowDado('Demanda Reativa (Q)', d.demandaKVAR.toFixed(2) + ' kVAr', '', false));
            r1.push(rowDado('Fator de Potencia (fp)', d.fp, '', true));
            r1.push(rowVazio());
            // Transformador
            r1.push(rowSecao('TRANSFORMADOR'));
            r1.push(rowHeader());
            r1.push(rowDado('Potencia Necessaria (kVA)', d.sTrafoNec.toFixed(1), '', false));
            r1.push(rowDado('Transformador Selecionado (kVA)', d.sTrafoSel, 'Potencia normalizada', true, 'ATENDE'));
            r1.push(rowDado('Relacao de Transformacao', d.relacaoTrafo, '', false));
            r1.push(rowDado('Corrente Nominal Secundario (A)', d.iTrafoNom.toFixed(1), '', true));
            r1.push(rowDado('Corrente de Curto-Circuito ICC (A)', (d.iccTrafo_kA * 1000).toFixed(0) + ' A  (' + d.iccTrafo_kA.toFixed(2) + ' kA)', '', false));
            r1.push(rowVazio());
            // Condutores
            r1.push(rowSecao('CONDUTORES E PROTECAO'));
            r1.push(rowHeader());
            r1.push(rowDado('Secao de Fase / Ramal (mm2)', d.bitolaFinal, '', false, 'OK'));
            r1.push(rowDado('Secao de Neutro (mm2)', d.bitolaNeutro, d.sobNeutro ? 'Sobrecarregado - igual a fase' : 'Normal', true, d.sobNeutro ? 'SOBRECARREGADO' : 'OK'));
            r1.push(rowDado('Secao de Terra PE (mm2)', d.bitolaTerra, 'NBR 5410', false, 'OK'));
            r1.push(rowDado('Disjuntor Geral (A)', d.disjGeral, '', true, 'OK'));
            r1.push(rowDado('Queda de Tensao (%)', d.qtCalcFinal.toFixed(2), 'Max: ' + d.qtMax + '%', false, d.qtCalcFinal <= d.qtMax ? 'ATENDE' : 'NAO ATENDE'));
            r1.push(rowVazio());
            // Aterramento
            r1.push(rowSecao('ATERRAMENTO'));
            r1.push(rowHeader());
            r1.push(rowDado('Resistividade do Solo (Ohm.m)', d.rhoSolo, '', false));
            r1.push(rowDado('Resistencia de 1 Haste - R1 (Ohm)', d.R1.toFixed(2), 'Formula de Dwight', true));
            r1.push(rowDado('Hastes Exigidas (norma)', d.nHastes, 'Copperweld diam. 1/2" x 2,40 m', false));
            r1.push(rowDado('Resistencia Total Estimada (Ohm)', d.Rtotal.toFixed(2), '', true, d.aterrOk ? 'ATENDE' : 'NAO ATENDE - usar ' + d.hastesNeeded + ' hastes'));
            r1.push(rowDado('Resistencia Maxima Admitida (Ohm)', d.Rmax, 'NBR 5410', false));
            r1.push(rowVazio());
            // THD
            r1.push(rowSecao('THD E QUALIDADE DE ENERGIA'));
            r1.push(rowHeader());
            r1.push(rowDado('THD de Corrente (THD-I) estimado (%)', d.thdI, 'ref. IEEE 519', false));
            r1.push(rowDado('THD de Tensao (THD-V) estimado (%)', d.thdVestimado.toFixed(1), 'Limite PRODIST: 8%', true, d.thdVok ? 'ATENDE' : 'NAO ATENDE - filtro'));
            r1.push(rowDado('Corrente de Fase (A)', d.Ifase.toFixed(1), '', false));
            r1.push(rowDado('Corrente no Neutro (A)', d.Ineutro.toFixed(1), '', true, d.sobNeutro ? 'SOBRECARREGADO' : 'NORMAL'));
            r1.push(rowVazio());
            r1.push([cel('AVISO: Documento orientativo para fins didaticos. Validar com profissional habilitado.', sAviso), cel('', sAviso), cel('', sAviso), cel('', sAviso)]);

            const ws1 = XLSX.utils.aoa_to_sheet(r1);
            ws1['!cols'] = [{ wch: 40 }, { wch: 28 }, { wch: 32 }, { wch: 22 }];
            ws1['!rows'] = [{ hpt: 22 }]; // título altura
            ws1['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
                { s: { r: 13, c: 0 }, e: { r: 13, c: 3 } },
                { s: { r: 26, c: 0 }, e: { r: 26, c: 3 } },
                { s: { r: 33, c: 0 }, e: { r: 33, c: 3 } },
                { s: { r: 40, c: 0 }, e: { r: 40, c: 3 } },
                { s: { r: 46, c: 0 }, e: { r: 46, c: 3 } },
            ];
            XLSX.utils.book_append_sheet(wb, ws1, 'Resumo Executivo');

            // ── ABA 2: Levantamento de Cargas ──
            const r2 = [];
            r2.push([cel('LEVANTAMENTO DE CARGAS E CALCULO DE DEMANDA', sTitulo), cel('', sTitulo), cel('', sTitulo), cel('', sTitulo), cel('', sTitulo)]);
            r2.push([cel('Projeto:', sLabel), cel(d.nomeProjeto, sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Norma:', sLabel), cel(d.norma.nome, sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            // Demanda condomínio
            r2.push([cel('DEMANDA - CONDOMINIO / RESIDENCIAS', sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao)]);
            r2.push([cel('Parametro', sColHeader), cel('Valor', sColHeader), cel('', sColHeader), cel('', sColHeader), cel('', sColHeader)]);
            r2.push([cel('No. de unidades', sLabel), cel(d.nUnidades, sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('CI por unidade (W)', sLabelAlt), cel(d.ciUnidade, sValorAlt), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('CI total unidades (W)', sLabel), cel(d.ciTotalUnid, sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Fator de simultaneidade (Fs)', sLabelAlt), cel(d.fatorSimult.toFixed(2), sValorAlt), cel('NBR 5410 / CEMIG ND5.2', sObs), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Fator de demanda global (Fd)', sLabel), cel((d.fd * 100).toFixed(0) + '%', sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Demanda das unidades (W)', sLabelAlt), cel((d.ciTotalUnid * d.fatorSimult * d.fd).toFixed(0), sValorAlt), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Cargas comuns + Elevadores (W)', sLabel), cel((d.demComunsW + d.demElevW).toFixed(0), sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('DEMANDA TOTAL (W)', { ...sSecao, font: { bold: true, sz: 9, color: { rgb: '065F46' } }, fill: { fgColor: { rgb: 'D1FAE5' } } }), cel(d.demandaW.toFixed(0), { ...sValor, font: { bold: true, sz: 10, color: { rgb: '065F46' } }, fill: { fgColor: { rgb: 'D1FAE5' } } }), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            // Levantamento por unidade
            r2.push([cel('LEVANTAMENTO POR UNIDADE', sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao)]);
            r2.push([cel('Parcela', sColHeader), cel('CI (W)', sColHeader), cel('Fator de Demanda', sColHeader), cel('Demanda (W)', sColHeader), cel('Demanda (kW)', sColHeader)]);
            const parcelas = [
                ['Iluminacao', d.ilumW, (d.fdIlum * 100).toFixed(0) + '%', d.demIlum.toFixed(0), (d.demIlum / 1000).toFixed(3)],
                ['Tomadas de Uso Geral (TUG)', d.tugW, (d.fdTug * 100).toFixed(0) + '%', d.demTug.toFixed(0), (d.demTug / 1000).toFixed(3)],
                ['Chuveiro Eletrico', d.chuvW, (d.fdChuv * 100).toFixed(0) + '%', d.demChuv.toFixed(0), (d.demChuv / 1000).toFixed(3)],
                ['Ar Condicionado', d.arW, (d.fdAR * 100).toFixed(0) + '%', d.demAR.toFixed(0), (d.demAR / 1000).toFixed(3)],
                ['Forno / Fogao', d.fornoW, d.fornoW > 0 ? (d.fdForno * 100).toFixed(0) + '%' : '—', d.demForno.toFixed(0), (d.demForno / 1000).toFixed(3)],
                ['Aquecedor de Passagem', d.aquecW, d.aquecW > 0 ? (d.fdAquec * 100).toFixed(0) + '%' : '—', d.demAquec.toFixed(0), (d.demAquec / 1000).toFixed(3)],
                ['Motores / Bombas', d.motorW, d.motorW > 0 ? (d.fdMotor * 100).toFixed(0) + '%' : '—', d.demMotor.toFixed(0), (d.demMotor / 1000).toFixed(3)],
                ['Outras Cargas', d.outrasW, (d.fdOutras * 100).toFixed(0) + '%', d.demOutras.toFixed(0), (d.demOutras / 1000).toFixed(3)],
            ];
            parcelas.forEach((p, i) => {
                const sL = i % 2 === 0 ? sLabel : sLabelAlt; const sV = i % 2 === 0 ? sValor : sValorAlt;
                r2.push([cel(p[0], sL), cel(p[1], sV), cel(p[2], sV), cel(p[3], sV), cel(p[4], sV)]);
            });
            r2.push([cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('RESUMO DE POTENCIAS', sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao), cel('', sSecao)]);
            r2.push([cel('Demanda Ativa (P)', sLabel), cel(d.demandaKW.toFixed(3) + ' kW', sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Demanda Aparente (S)', sLabelAlt), cel(d.demandaKVA.toFixed(3) + ' kVA', sValorAlt), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Demanda Reativa (Q)', sLabel), cel(d.demandaKVAR.toFixed(3) + ' kVAr', sValor), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);
            r2.push([cel('Fator de Potencia (fp)', sLabelAlt), cel(d.fp, sValorAlt), cel('', sVazio), cel('', sVazio), cel('', sVazio)]);

            const ws2 = XLSX.utils.aoa_to_sheet(r2);
            ws2['!cols'] = [{ wch: 32 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 14 }];
            ws2['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
                { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
                { s: { r: 15, c: 0 }, e: { r: 15, c: 4 } },
            ];
            XLSX.utils.book_append_sheet(wb, ws2, 'Levantamento de Cargas');

            // ── ABA 3: Trafo e Iluminação ──
            const r3 = [];
            r3.push([cel('TRANSFORMADOR E ILUMINACAO', sTitulo), cel('', sTitulo), cel('', sTitulo), cel('', sTitulo)]);
            r3.push(rowVazio());
            r3.push(rowSecao('TRANSFORMADOR'));
            r3.push(rowHeader());
            r3.push(rowDado('Demanda aparente total (kVA)', d.demandaKVA.toFixed(2), '', false));
            r3.push(rowDado('Reserva de crescimento', ((d.sTrafoNec / d.demandaKVA - 1) * 100).toFixed(0) + '%', '', true));
            r3.push(rowDado('Potencia necessaria (kVA)', d.sTrafoNec.toFixed(1), '', false));
            r3.push(rowDado('Transformador selecionado (kVA)', d.sTrafoSel, 'Potencia normalizada', true, 'ATENDE'));
            r3.push(rowDado('Relacao de transformacao', d.relacaoTrafo, '', false));
            r3.push(rowDado('Tensao primaria (MT)', d.tensaoMT + ' kV', '', true));
            r3.push(rowDado('Tensao de curto-circuito (Vcc)', d.vccTrafo + '%', '', false));
            r3.push(rowDado('Corrente nominal secundario (A)', d.iTrafoNom.toFixed(1), '', true));
            r3.push(rowDado('Corrente de curto-circuito ICC', (d.iccTrafo_kA * 1000).toFixed(0) + ' A  (' + d.iccTrafo_kA.toFixed(2) + ' kA)', '', false));
            r3.push(rowVazio());
            r3.push(rowSecao('DIMENSIONAMENTO DE ILUMINACAO - METODO DOS LUMENS'));
            r3.push(rowHeader());
            r3.push(rowDado('Area a iluminar (m2)', d.areaIlum, '', false));
            r3.push(rowDado('Iluminancia desejada (lux)', d.Elux, 'NBR ISO/CIE 8995-1', true));
            r3.push(rowDado('Tipo de lampada', d.tipoLamp.toUpperCase(), '', false));
            r3.push(rowDado('Eficiencia luminosa (lm/W)', d.eficLamp, '', true));
            r3.push(rowDado('Potencia da lampada (W)', d.potLamp, '', false));
            r3.push(rowDado('Fluxo luminoso da lampada (lm)', d.fluxLamp, '', true));
            r3.push(rowDado('Fator de utilizacao (Fu)', d.Fu, '', false));
            r3.push(rowDado('Fator de manutencao (Fm)', d.Fm, '', true));
            r3.push(rowDado('Numero de lampadas calculado', d.nLamps, 'N = (E x A) / (Phi x Fu x Fm)', false, 'OK'));
            r3.push(rowDado('Potencia total de iluminacao (W)', d.potTotalIlum, '', true));
            r3.push(rowDado('Corrente do circuito de iluminacao (A)', d.iIlum.toFixed(2), 'Tensao: ' + d.tensaoFN + ' V', false));
            const ws3 = XLSX.utils.aoa_to_sheet(r3);
            ws3['!cols'] = [{ wch: 40 }, { wch: 26 }, { wch: 32 }, { wch: 22 }];
            ws3['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
                { s: { r: 14, c: 0 }, e: { r: 14, c: 3 } },
            ];
            XLSX.utils.book_append_sheet(wb, ws3, 'Trafo e Iluminacao');

            // ── ABA 4: Condutores, THD e Aterramento ──
            const r4 = [];
            r4.push([cel('CONDUTORES - THD - ATERRAMENTO', sTitulo), cel('', sTitulo), cel('', sTitulo), cel('', sTitulo)]);
            r4.push(rowVazio());
            r4.push(rowSecao('DIMENSIONAMENTO DE CONDUTORES E RAMAL'));
            r4.push(rowHeader());
            r4.push(rowDado('Comprimento do ramal (m)', d.ramalComp, '', false));
            r4.push(rowDado('Tipo do ramal', d.ramalTipo === 'aereo' ? 'Aereo (multiplex aluminio)' : 'Subterraneo (XLPE cobre)', '', true));
            r4.push(rowDado('Temperatura ambiente (C)', d.tempAmb, '', false));
            r4.push(rowDado('Fator de correcao temperatura', d.ftTemp.toFixed(3), 'Ref. 30C / 90C XLPE', true));
            r4.push(rowDado('Corrente de projeto Iramal (A)', d.Iramal.toFixed(1), '', false));
            r4.push(rowDado('Secao de fase / ramal (mm2)', d.bitolaFinal, 'NBR 5410 - tabela 36', true, 'OK'));
            r4.push(rowDado('Secao de neutro (mm2)', d.bitolaNeutro, d.sobNeutro ? 'Sobrecarregado por harm. triplos' : 'Normal', false, d.sobNeutro ? 'SOBRECARREGADO' : 'OK'));
            r4.push(rowDado('Secao de terra PE (mm2)', d.bitolaTerra, 'NBR 5410 - protecao', true, 'OK'));
            r4.push(rowDado('Disjuntor geral (A)', d.disjGeral, 'I >= 1,25 x Iramal', false, 'OK'));
            r4.push(rowDado('Queda de tensao calculada (%)', d.qtCalcFinal.toFixed(2), 'Limite: ' + d.qtMax + '%', true, d.qtCalcFinal <= d.qtMax ? 'ATENDE' : 'NAO ATENDE'));
            r4.push(rowVazio());
            r4.push(rowSecao('THD - QUALIDADE DE ENERGIA'));
            r4.push(rowHeader());
            r4.push(rowDado('Cargas nao-lineares (%)', d.thdNL, '', false));
            r4.push(rowDado('THD de corrente (THD-I) estimado (%)', d.thdI, 'IEEE 519', true));
            r4.push(rowDado('THD de tensao (THD-V) estimado (%)', d.thdVestimado.toFixed(1), 'Limite PRODIST: 8%', false, d.thdVok ? 'ATENDE PRODIST' : 'EXCEDE - filtro'));
            r4.push(rowDado('Desequilibrio de cargas (%)', d.percDeseq, '', true));
            r4.push(rowDado('Corrente de fase (A)', d.Ifase.toFixed(1), '', false));
            r4.push(rowDado('Corrente calculada no neutro (A)', d.Ineutro.toFixed(1), '', true, d.sobNeutro ? 'SOBRECARREGADO' : 'NORMAL'));
            r4.push(rowVazio());
            r4.push(rowSecao('SISTEMA DE ATERRAMENTO'));
            r4.push(rowHeader());
            r4.push(rowDado('Resistividade do solo rho (Ohm.m)', d.rhoSolo, '', false));
            r4.push(rowDado('Eletrodo - tipo', 'Haste vertical copperweld diam.1/2" x 2,40 m', '', true));
            r4.push(rowDado('Resistencia de 1 haste R1 (Ohm)', d.R1.toFixed(2), 'Formula de Dwight', false));
            r4.push(rowDado('Numero de hastes (norma)', d.nHastes, '', true));
            r4.push(rowDado('Fator de reducao (n hastes)', d.fatorH.toFixed(3), '', false));
            r4.push(rowDado('Resistencia total estimada (Ohm)', d.Rtotal.toFixed(2), '', true, d.aterrOk ? 'ATENDE <= ' + d.Rmax + ' Ohm' : 'NAO ATENDE > ' + d.Rmax + ' Ohm - usar ' + d.hastesNeeded + ' hastes'));
            r4.push(rowDado('Condutor de aterramento PE (mm2)', d.bitolaTerra, 'Cobre nu / verde-amarelo', false));
            r4.push(rowVazio());
            r4.push([cel('Responsavel Tecnico:', sLabel), cel(d.rt, sValor), cel('', sVazio), cel('', sVazio)]);
            r4.push([cel('CREA / CFT:', sLabelAlt), cel(d.crea, sValorAlt), cel('', sVazio), cel('', sVazio)]);
            r4.push([cel('Data de emissao:', sLabel), cel(d.data, sValor), cel('', sVazio), cel('', sVazio)]);
            r4.push(rowVazio());
            r4.push([cel('AVISO: Documento orientativo para fins didaticos. Validar com profissional habilitado conforme regulamentacao vigente.', sAviso), cel('', sAviso), cel('', sAviso), cel('', sAviso)]);
            const ws4 = XLSX.utils.aoa_to_sheet(r4);
            ws4['!cols'] = [{ wch: 42 }, { wch: 32 }, { wch: 30 }, { wch: 26 }];
            ws4['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
                { s: { r: 15, c: 0 }, e: { r: 15, c: 3 } },
                { s: { r: 23, c: 0 }, e: { r: 23, c: 3 } },
            ];
            XLSX.utils.book_append_sheet(wb, ws4, 'Condutores, THD e Aterramento');

            const nomeArq = `Projeto_Distrib_${(d.nomeProjeto || 'Projeto').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 28)}_${d.data.replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(wb, nomeArq);
        }

// Init norma description
setTimeout(function () { onDistribNormaChange(); }, 100);
