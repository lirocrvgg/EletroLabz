/* icone SVG (EO.icon) ou vazio se icons.js nao carregou */
function ladderIcon(n) { return (window.EO && EO.icon) ? EO.icon(n) : ''; }
/* assets/js/legacy/ladder.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/aciona.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: aciona.html (apos aciona.js), depois de core.js. */

function ladderExportPNG() {
                    const canvas2 = document.createElement('canvas');
                    const src = document.getElementById('ladder-canvas');
                    const rect = src.getBoundingClientRect();
                    canvas2.width = rect.width * 2; canvas2.height = rect.height * 2;
                    const ctx = canvas2.getContext('2d');
                    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, canvas2.width, canvas2.height);
                    // Use html2canvas if available, else notify
                    if (window.html2canvas) {
                        html2canvas(src, { scale: 2, backgroundColor: '#0d1117' }).then(c => {
                            const a = document.createElement('a'); a.href = c.toDataURL('image/png');
                            a.download = 'ladder.png'; a.click();
                        });
                    } else { alert('Para exportar PNG, adicione html2canvas ao projeto.'); }
                }

// ═══════════════════════════════════════════════════════════════
        // SIMULADOR LADDER — ENGINE v5 (ZelioSoft-style, junction-based vertical wires)
        // ═══════════════════════════════════════════════════════════════
let ladderRungs = [];

let ladderNextId = 1;

let ladderSimRunning = false;

let ladderSimInterval = null;

let ladderMemory = {};

let ladderPrevMemory = {};

let ladderTimers = {};

let ladderCounters = {};

let ladderSelectedRung = -1;

let ladderSelectedCell = -1;

let ladderSelectedRow = 0;

let ladderScanCounter = 0;

let ladderDeleteMode = false;

const LADDER_SCAN_MS = 100;

// ── TOOL SYSTEM ──────────────────────────────────────────────
let ladderActiveTool = 'select';

function ladderSetTool(toolName) {
            ladderActiveTool = toolName;
            ladderDeleteMode = (toolName === 'delete');
            document.querySelectorAll('.zl-tool-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.getElementById('tool-' + toolName);
            if (activeBtn) activeBtn.classList.add('active');
            const label = document.getElementById('ladder-active-tool-label');
            const modeInd = document.getElementById('ladder-mode-indicator');
            const toolLabels = {
                select: '— Selecionar —', wire: '⏤ Fio ─', wire_v: '┃ Fio │',
                delete: 'Apagar', branch_or: '∥ Branch OR',
                contact_no: '┤ ├ NA', contact_nc: '┤/├ NF',
                contact_p: '┤P├ ↑', contact_n: '┤N├ ↓',
                coil: '( ) Bobina', coil_neg: '(/) Negada',
                coil_set: '(S) Set', coil_reset: '(R) Reset',
                timer_on: 'TON', timer_off: 'TOF', timer_pulse: 'TP',
                counter: 'CTU', counter_down: 'CTD'
            };
            if (label) label.textContent = toolLabels[toolName] || toolName;
            if (modeInd) {
                if (toolName === 'wire') modeInd.textContent = '← clique na célula para inserir fio horizontal';
                else if (toolName === 'wire_v') modeInd.textContent = '← clique na borda esq/dir da célula para fio vertical (conecta à linha abaixo)';
                else if (toolName === 'branch_or') modeInd.textContent = '← clique na célula: cria caminho paralelo com fios verticais';
                else if (toolName === 'delete') modeInd.textContent = '← clique no elemento para remover';
                else if (toolName === 'select') modeInd.textContent = '';
                else modeInd.textContent = '← clique na célula para inserir';
            }
            ladderRender();
        }

function ladderToggleDeleteMode() { ladderSetTool(ladderActiveTool === 'delete' ? 'select' : 'delete'); }

// ── MODAL DE ENDEREÇAMENTO ────────────────────────────────────
let ladderModalCallback = null;

let ladderModalElemType = '';

function ladderShowModal(elemType) {
            ladderModalElemType = elemType;
            const modal = document.getElementById('ladder-addr-modal');
            const title = document.getElementById('ladder-modal-title');
            const body = document.getElementById('ladder-modal-body');
            modal.style.display = 'flex';

            const inputTypes = ['contact_no', 'contact_nc', 'contact_p', 'contact_n'];
            const coilTypes = ['coil', 'coil_neg', 'coil_set', 'coil_reset'];
            const timerTypes = ['timer_on', 'timer_off', 'timer_pulse'];
            const counterTypes = ['counter', 'counter_down'];

            const labels = {
                contact_no: 'Contato NA ┤ ├', contact_nc: 'Contato NF ┤/├', contact_p: 'Contato Borda ↑ ┤P├', contact_n: 'Contato Borda ↓ ┤N├',
                coil: 'Bobina ( )', coil_neg: 'Bobina Negada (/)', coil_set: 'Set (S)', coil_reset: 'Reset (R)',
                timer_on: 'TON — Timer On-Delay', timer_off: 'TOF — Timer Off-Delay', timer_pulse: 'TP — Timer Pulse',
                counter: 'CTU — Contador Up', counter_down: 'CTD — Contador Down'
            };

            title.textContent = labels[elemType] || 'Endereçamento';
            let html = '';

            if (inputTypes.includes(elemType)) {
                html += `<p style="font-size:.72rem;color:var(--text-dim);margin:0 0 .6rem">Selecione a variável para o contato:</p>`;
                const groups = [
                    { label: 'Entradas', prefix: 'I', count: 8, color: '#10b981' },
                    { label: 'Saídas', prefix: 'Q', count: 8, color: '#3b82f6' },
                    { label: 'Memórias', prefix: 'M', count: 16, color: '#8b5cf6' },
                    { label: 'Timers', prefix: 'T', count: 8, color: '#f59e0b' },
                    { label: 'Contadores', prefix: 'C', count: 8, color: '#ef4444' }
                ];
                groups.forEach(g => {
                    html += `<div style="margin-bottom:.5rem"><span style="font-size:.68rem;font-weight:800;color:${g.color}">${g.label}:</span><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:.25rem;margin-top:.25rem">`;
                    for (let i = 0; i < g.count; i++) {
                        const v = g.prefix + i;
                        const isOn = !!ladderMemory[v];
                        html += `<button onclick="ladderModalSelect('${v}')" data-eo-action="aciona:ladder-modal-variavel" style="padding:.35rem .2rem;border-radius:6px;font-size:.7rem;font-weight:700;cursor:pointer;border:1.5px solid ${isOn ? g.color : '#374151'};background:${isOn ? g.color + '20' : '#1e1e2e'};color:${isOn ? g.color : '#9ca3af'};min-height:36px;touch-action:manipulation">${v}</button>`;
                    }
                    html += `</div></div>`;
                });
            } else if (coilTypes.includes(elemType)) {
                html += `<p style="font-size:.72rem;color:var(--text-dim);margin:0 0 .6rem">Selecione a variável da saída:</p>`;
                [{ label: 'Saídas', prefix: 'Q', count: 8, color: '#3b82f6' }, { label: 'Memórias', prefix: 'M', count: 16, color: '#8b5cf6' }].forEach(g => {
                    html += `<div style="margin-bottom:.5rem"><span style="font-size:.68rem;font-weight:800;color:${g.color}">${g.label}:</span><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:.25rem;margin-top:.25rem">`;
                    for (let i = 0; i < g.count; i++) {
                        const v = g.prefix + i;
                        html += `<button onclick="ladderModalSelect('${v}')" data-eo-action="aciona:ladder-modal-variavel" style="padding:.35rem .2rem;border-radius:6px;font-size:.7rem;font-weight:700;cursor:pointer;border:1.5px solid #374151;background:#1e1e2e;color:#9ca3af;min-height:36px;touch-action:manipulation">${v}</button>`;
                    }
                    html += `</div></div>`;
                });
            } else if (timerTypes.includes(elemType)) {
                html += `<p style="font-size:.72rem;color:var(--text-dim);margin:0 0 .6rem">Selecione o timer e o tempo preset:</p>`;
                html += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.25rem;margin-bottom:.6rem">`;
                for (let i = 0; i < 8; i++) {
                    html += `<button onclick="document.getElementById('ladder-modal-var').value='T${i}'" data-eo-action="aciona:ladder-modal-escolher-timer" style="padding:.35rem;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;border:1.5px solid #374151;background:#1e1e2e;color:#f59e0b;min-height:36px">T${i}</button>`;
                }
                html += `</div>`;
                html += `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">
                    <label style="font-size:.72rem;font-weight:700;color:var(--text)">Timer:</label>
                    <input id="ladder-modal-var" type="text" value="T0" style="flex:1;padding:.35rem .5rem;border-radius:6px;border:1.5px solid #374151;background:#1e1e2e;color:var(--text);font-size:.78rem;font-weight:700">
                </div>`;
                html += `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.8rem">
                    <label style="font-size:.72rem;font-weight:700;color:var(--text)">Preset (s):</label>
                    <input id="ladder-modal-preset" type="number" value="3" min="0.1" step="0.1" style="flex:1;padding:.35rem .5rem;border-radius:6px;border:1.5px solid #374151;background:#1e1e2e;color:var(--text);font-size:.78rem;font-weight:700">
                </div>`;
                html += `<button onclick="ladderModalSelectTimer()" data-eo-action="aciona:ladder-modal-confirmar-timer" style="width:100%;padding:.5rem;border-radius:8px;border:none;background:var(--accent2);color:#fff;font-weight:800;font-size:.82rem;cursor:pointer;min-height:44px">Confirmar</button>`;
            } else if (counterTypes.includes(elemType)) {
                html += `<p style="font-size:.72rem;color:var(--text-dim);margin:0 0 .6rem">Selecione o contador e o preset:</p>`;
                html += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.25rem;margin-bottom:.6rem">`;
                for (let i = 0; i < 8; i++) {
                    html += `<button onclick="document.getElementById('ladder-modal-var').value='C${i}'" data-eo-action="aciona:ladder-modal-escolher-contador" style="padding:.35rem;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer;border:1.5px solid #374151;background:#1e1e2e;color:#ef4444;min-height:36px">C${i}</button>`;
                }
                html += `</div>`;
                html += `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">
                    <label style="font-size:.72rem;font-weight:700;color:var(--text)">Contador:</label>
                    <input id="ladder-modal-var" type="text" value="C0" style="flex:1;padding:.35rem .5rem;border-radius:6px;border:1.5px solid #374151;background:#1e1e2e;color:var(--text);font-size:.78rem;font-weight:700">
                </div>`;
                html += `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.8rem">
                    <label style="font-size:.72rem;font-weight:700;color:var(--text)">Preset:</label>
                    <input id="ladder-modal-preset" type="number" value="10" min="1" step="1" style="flex:1;padding:.35rem .5rem;border-radius:6px;border:1.5px solid #374151;background:#1e1e2e;color:var(--text);font-size:.78rem;font-weight:700">
                </div>`;
                html += `<button onclick="ladderModalSelectCounter()" data-eo-action="aciona:ladder-modal-confirmar-contador" style="width:100%;padding:.5rem;border-radius:8px;border:none;background:var(--accent2);color:#fff;font-weight:800;font-size:.82rem;cursor:pointer;min-height:44px">Confirmar</button>`;
            }
            body.innerHTML = html;
        }

function ladderModalSelect(varName) {
            ladderCloseModal();
            ladderApplyInsert(ladderModalElemType, varName);
        }

function ladderModalSelectTimer() {
            const v = document.getElementById('ladder-modal-var').value.toUpperCase().trim();
            const p = parseFloat(document.getElementById('ladder-modal-preset').value) || 3;
            if (!v) return;
            ladderCloseModal();
            ladderApplyInsert(ladderModalElemType, v, p);
        }

function ladderModalSelectCounter() {
            const v = document.getElementById('ladder-modal-var').value.toUpperCase().trim();
            const p = parseInt(document.getElementById('ladder-modal-preset').value) || 10;
            if (!v) return;
            ladderCloseModal();
            ladderApplyInsert(ladderModalElemType, v, p);
        }

function ladderEditTimerParams(rungIdx, rowIdx) {
            const rung = ladderRungs[rungIdx];
            if (!rung) return;
            const cell = rung.rows[rowIdx][6];
            if (!cell || !['timer_on', 'timer_off', 'timer_pulse'].includes(cell.type)) return;
            const lab = { timer_on: 'TON', timer_off: 'TOF', timer_pulse: 'TP' }[cell.type];
            const modal = document.getElementById('ladder-addr-modal');
            const title = document.getElementById('ladder-modal-title');
            const body = document.getElementById('ladder-modal-body');
            modal.style.display = 'flex';
            title.textContent = 'Editar Parâmetros — ' + lab + ' ' + cell.var;
            let html = `<p style="font-size:.72rem;color:var(--text-dim);margin:0 0 .6rem">Ajuste o tempo preset do timer:</p>`;
            html += `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">
                <label style="font-size:.72rem;font-weight:700;color:var(--text)">Timer:</label>
                <input id="ladder-edit-timer-var" type="text" value="${cell.var}" style="flex:1;padding:.35rem .5rem;border-radius:6px;border:1.5px solid #374151;background:#1e1e2e;color:var(--text);font-size:.78rem;font-weight:700">
            </div>`;
            html += `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.8rem">
                <label style="font-size:.72rem;font-weight:700;color:var(--text)">Preset (s):</label>
                <input id="ladder-edit-timer-preset" type="number" value="${cell.preset || 3}" min="0.1" step="0.1" style="flex:1;padding:.35rem .5rem;border-radius:6px;border:1.5px solid #374151;background:#1e1e2e;color:var(--text);font-size:.78rem;font-weight:700">
            </div>`;
            html += `<button onclick="ladderApplyEditTimer(${rungIdx},${rowIdx})" data-eo-action="aciona:ladder-editar-timer-confirmar" style="width:100%;padding:.5rem;border-radius:8px;border:none;background:var(--accent2);color:#fff;font-weight:800;font-size:.82rem;cursor:pointer;min-height:44px">Confirmar</button>`;
            body.innerHTML = html;
        }

function ladderApplyEditTimer(rungIdx, rowIdx) {
            const rung = ladderRungs[rungIdx];
            if (!rung) return;
            const cell = rung.rows[rowIdx][6];
            if (!cell) return;
            const newVar = document.getElementById('ladder-edit-timer-var').value.toUpperCase().trim();
            const newPreset = parseFloat(document.getElementById('ladder-edit-timer-preset').value) || 3;
            if (newVar) cell.var = newVar;
            cell.preset = newPreset;
            // Reset timer state for updated params
            if (ladderTimers[cell.var]) {
                ladderTimers[cell.var].elapsed = 0;
                ladderTimers[cell.var].active = false;
                ladderTimers[cell.var].running = false;
            }
            ladderCloseModal();
            ladderRender();
        }

function ladderCloseModal() {
            document.getElementById('ladder-addr-modal').style.display = 'none';
        }

// ── DATA MODEL ───────────────────────────────────────────────
        // Each rung: { id, rows: [[cell×7], ...], vwires: Set<"r,c"> }
        // rows[0][6] = output cell. Other rows: cells[0..5] are inputs, cell[6] ignored.
        // vwires: "r,c" means vertical connection between rows[r] junction c and rows[r+1] junction c
        // Junction c (0..6): junction 0 = left rail; junction c = right edge of column c-1 = left edge of column c
        // Junction 6 = right edge of col 5 = point before output
function ladderCreateRow() {
            return [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }];
        }

function ladderMigrateRung(rung) {
            if (rung.rows) {
                // Ensure vwires is a Set
                if (!(rung.vwires instanceof Set)) {
                    rung.vwires = new Set(rung.vwires || []);
                }
                return;
            }
            // Migrate from old format (cells + branches)
            const mainRow = rung.cells || ladderCreateRow();
            rung.rows = [mainRow];
            if (rung.branches && rung.branches.length > 0) {
                rung.branches.forEach((br, bi) => {
                    const row = [...br.cells];
                    while (row.length < 7) row.push({ type: 'empty' });
                    rung.rows.push(row);
                    // Auto-add vwires at junction 0 and 6 (full parallel path)
                    if (!rung.vwires) rung.vwires = new Set();
                    rung.vwires.add(bi + ',0');
                    rung.vwires.add(bi + ',6');
                });
            }
            if (!rung.vwires) rung.vwires = new Set();
            if (!(rung.vwires instanceof Set)) rung.vwires = new Set(rung.vwires);
            delete rung.cells;
            delete rung.branches;
        }

function ladderInit() {
            if (ladderRungs.length === 0) {
                for (let i = 0; i < 5; i++) ladderAddRung();
            }
            ladderRungs.forEach(r => ladderMigrateRung(r));
            ladderSetTool('select');
            ladderRender();
        }

function ladderAddRung() {
            ladderRungs.push({
                id: ladderNextId++,
                rows: [ladderCreateRow()],
                vwires: new Set()
            });
            ladderRender();
        }

function ladderRemoveRung(idx) {
            if (ladderRungs.length <= 1) return;
            ladderRungs.splice(idx, 1);
            ladderSelectedRung = -1;
            ladderSelectedCell = -1;
            ladderSelectedRow = 0;
            ladderRender();
        }

function ladderAddRowToRung(ri) {
            const rung = ladderRungs[ri];
            if (!rung) return;
            if (rung.rows.length >= 6) { alert('Máximo 6 linhas por rung.'); return; }
            rung.rows.push(ladderCreateRow());
            ladderRender();
        }

function ladderRemoveRowFromRung(ri, rowIdx) {
            const rung = ladderRungs[ri];
            if (!rung || rowIdx <= 0 || rowIdx >= rung.rows.length) return;
            // Remove vwires involving this row
            const newVwires = new Set();
            rung.vwires.forEach(key => {
                const [r, c] = key.split(',').map(Number);
                if (r === rowIdx - 1 || r === rowIdx) return;
                if (r > rowIdx) newVwires.add((r - 1) + ',' + c);
                else newVwires.add(key);
            });
            rung.vwires = newVwires;
            rung.rows.splice(rowIdx, 1);
            if (ladderSelectedRow >= rung.rows.length) ladderSelectedRow = 0;
            ladderRender();
        }

function ladderToggleVwire(ri, rowIdx, junctionCol) {
            const rung = ladderRungs[ri];
            if (!rung || rowIdx < 0 || junctionCol < 0 || junctionCol > 6) return;
            // Auto-add row if needed
            if (rowIdx >= rung.rows.length - 1) {
                if (rung.rows.length >= 6) return;
                rung.rows.push(ladderCreateRow());
            }
            const key = rowIdx + ',' + junctionCol;
            if (rung.vwires.has(key)) rung.vwires.delete(key);
            else rung.vwires.add(key);
            ladderRender();
        }

// Branch OR: add row + auto-connect with vwires at specified junctions
function ladderBranchOR(ri, colStart) {
            const rung = ladderRungs[ri];
            if (!rung) return;
            if (rung.rows.length >= 6) { alert('Máximo 6 linhas por rung.'); return; }
            const newRowIdx = rung.rows.length;
            rung.rows.push(ladderCreateRow());
            const rIdx = newRowIdx - 1;
            // Connect at colStart and at junction 6 (before output)
            rung.vwires.add(rIdx + ',' + colStart);
            ladderRender();
        }

// ── CELL OPERATIONS ──────────────────────────────────────────
function ladderInsert(elemType) {
            if (ladderSelectedRung < 0 || ladderSelectedCell < 0) {
                alert('Selecione uma célula na rung clicando nela primeiro.');
                return;
            }
            const rung = ladderRungs[ladderSelectedRung];
            if (!rung) return;

            const isOutputCol = (ladderSelectedCell === 6);
            const outputTypes = ['coil', 'coil_neg', 'coil_set', 'coil_reset', 'timer_on', 'timer_off', 'timer_pulse', 'counter', 'counter_down'];
            const inputTypes = ['contact_no', 'contact_nc', 'contact_p', 'contact_n'];

            if (isOutputCol && inputTypes.includes(elemType)) {
                alert('Contatos devem ser colocados nas posições de entrada (esquerda).');
                return;
            }
            if (!isOutputCol && outputTypes.includes(elemType)) {
                alert('Saídas devem ser colocadas na coluna de saída (coluna 7).');
                return;
            }
            ladderShowModal(elemType);
        }

function ladderApplyInsert(elemType, varName, preset) {
            const rung = ladderRungs[ladderSelectedRung];
            if (!rung) return;
            let cellData = { type: elemType, var: varName };
            if (preset !== undefined) cellData.preset = preset;
            const row = rung.rows[ladderSelectedRow];
            if (row) row[ladderSelectedCell] = cellData;
            ladderRender();
            ladderRenderInputToggles();
            ladderRenderOutputStatus();
        }

function ladderClearCell(rungIdx, cellIdx, rowIdx) {
            const rung = ladderRungs[rungIdx];
            if (!rung) return;
            const row = rung.rows[rowIdx];
            if (row) row[cellIdx] = { type: 'empty' };
            ladderRender();
        }

function ladderClear() {
            if (!confirm('Limpar todo o programa Ladder?')) return;
            ladderStopSim();
            ladderRungs = [];
            ladderNextId = 1;
            ladderMemory = {};
            ladderPrevMemory = {};
            ladderTimers = {};
            ladderCounters = {};
            ladderScanCounter = 0;
            ladderSelectedRung = -1;
            ladderSelectedCell = -1;
            ladderSelectedRow = 0;
            for (let i = 0; i < 5; i++) ladderAddRung();
            ladderSetTool('select');
            ladderRenderInputToggles();
            ladderRenderOutputStatus();
        }

// ── CELL CLICK HANDLER ───────────────────────────────────────
function ladderSelectCell(rungIdx, cellIdx, rowIdx, evt) {
            rowIdx = rowIdx || 0;
            const tool = ladderActiveTool;

            // DELETE mode
            if (tool === 'delete') {
                const rung = ladderRungs[rungIdx];
                if (!rung) return;
                const row = rung.rows[rowIdx];
                if (row && row[cellIdx] && row[cellIdx].type !== 'empty') {
                    row[cellIdx] = { type: 'empty' };
                    ladderRender();
                }
                return;
            }

            // WIRE mode
            if (tool === 'wire') {
                const rung = ladderRungs[rungIdx];
                if (!rung) return;
                if (cellIdx === 6 && rowIdx > 0) return;
                const row = rung.rows[rowIdx];
                if (!row) return;
                const cell = row[cellIdx];
                if (cell && cell.type === 'empty') {
                    row[cellIdx] = { type: 'wire' };
                } else if (cell && cell.type === 'wire') {
                    row[cellIdx] = { type: 'empty' };
                }
                ladderRender();
                return;
            }

            // WIRE_V mode — toggle vertical wire at junction
            if (tool === 'wire_v') {
                const rung = ladderRungs[rungIdx];
                if (!rung) return;
                // Determine junction: left half click = junction cellIdx, right half = junction cellIdx+1
                let junctionCol = cellIdx;
                if (evt) {
                    const target = evt.currentTarget || evt.target;
                    const rect = target.getBoundingClientRect();
                    const clickX = evt.clientX - rect.left;
                    if (clickX > rect.width / 2) {
                        junctionCol = cellIdx + 1;
                    }
                }
                if (junctionCol > 6) junctionCol = 6;
                ladderToggleVwire(rungIdx, rowIdx, junctionCol);
                return;
            }

            // BRANCH_OR mode
            if (tool === 'branch_or') {
                ladderSelectedRung = rungIdx;
                ladderBranchOR(rungIdx, cellIdx);
                return;
            }

            // SELECT mode
            if (tool === 'select') {
                ladderSelectedRung = rungIdx;
                ladderSelectedCell = cellIdx;
                ladderSelectedRow = rowIdx;
                ladderRender();
                return;
            }

            // ELEMENT tools
            ladderSelectedRung = rungIdx;
            ladderSelectedCell = cellIdx;
            ladderSelectedRow = rowIdx;
            ladderInsert(tool);
        }

// ── RENDERING ─────────────────────────────────────────────────
function ladderCellSymbol(cell, lineActive, cellActive) {
            const green = '#10b981', dim = '#4b5563';
            const lc = lineActive ? green : '#334155';
            const cc = cellActive ? green : dim;
            const lw = lineActive ? 3 : 2;

            if (cell.type === 'wire') {
                return `<svg width="100%" height="28" viewBox="0 0 60 28" preserveAspectRatio="none"><line x1="0" y1="14" x2="60" y2="14" stroke="${lc}" stroke-width="${lw}"/></svg>`;
            }
            if (cell.type === 'empty') {
                return `<svg width="100%" height="28" viewBox="0 0 60 28" preserveAspectRatio="none"><line x1="0" y1="14" x2="60" y2="14" stroke="${lc}" stroke-width="${lw}" stroke-dasharray="${lineActive ? 'none' : '4 3'}"/></svg>`;
            }

            const vs = cell.var ? !!ladderMemory[cell.var] : false;
            const vc = vs ? green : '#6b7280';

            if (cell.type === 'contact_no') {
                return `<div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:1px">
                    <span style="font-size:.52rem;font-weight:800;color:${vc};letter-spacing:-.02em">${cell.var || '?'}</span>
                    <svg width="54" height="22" viewBox="0 0 54 22">
                        <line x1="0" y1="11" x2="10" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <line x1="10" y1="2" x2="10" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="2" x2="44" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="11" x2="54" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <line x1="10" y1="11" x2="44" y2="11" stroke="${cc}" stroke-width="${lw}" opacity=".3"/>
                    </svg>
                </div>`;
            }
            if (cell.type === 'contact_nc') {
                return `<div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:1px">
                    <span style="font-size:.52rem;font-weight:800;color:${vc}">${cell.var || '?'}</span>
                    <svg width="54" height="22" viewBox="0 0 54 22">
                        <line x1="0" y1="11" x2="10" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <line x1="10" y1="2" x2="10" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="2" x2="44" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="11" x2="54" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <line x1="12" y1="20" x2="42" y2="2" stroke="${cc}" stroke-width="1.5"/>
                    </svg>
                </div>`;
            }
            if (cell.type === 'contact_p') {
                return `<div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:1px">
                    <span style="font-size:.52rem;font-weight:800;color:${vc}">${cell.var || '?'}</span>
                    <svg width="54" height="22" viewBox="0 0 54 22">
                        <line x1="0" y1="11" x2="10" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <line x1="10" y1="2" x2="10" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="2" x2="44" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="11" x2="54" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <text x="27" y="16" text-anchor="middle" font-size="8" fill="${cc}" font-weight="bold">P</text>
                    </svg>
                </div>`;
            }
            if (cell.type === 'contact_n') {
                return `<div style="display:flex;flex-direction:column;align-items:center;width:100%;gap:1px">
                    <span style="font-size:.52rem;font-weight:800;color:${vc}">${cell.var || '?'}</span>
                    <svg width="54" height="22" viewBox="0 0 54 22">
                        <line x1="0" y1="11" x2="10" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <line x1="10" y1="2" x2="10" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="2" x2="44" y2="20" stroke="${cc}" stroke-width="2"/>
                        <line x1="44" y1="11" x2="54" y2="11" stroke="${lc}" stroke-width="${lw}"/>
                        <text x="27" y="16" text-anchor="middle" font-size="8" fill="${cc}" font-weight="bold">N</text>
                    </svg>
                </div>`;
            }
            return '';
        }

function ladderOutputSymbol(cell, rungActive) {
            const green = '#10b981', dim = '#4b5563';
            const lc = rungActive ? green : '#334155';
            const lw = rungActive ? 3 : 2;

            if (cell.type === 'empty') {
                return `<svg width="90" height="28" viewBox="0 0 90 28"><line x1="0" y1="14" x2="90" y2="14" stroke="${lc}" stroke-width="${lw}" stroke-dasharray="${rungActive ? 'none' : '4 3'}"/></svg>`;
            }

            const on = !!ladderMemory[cell.var];
            const oc = on ? green : dim;
            const obg = on ? 'rgba(16,185,129,.1)' : 'transparent';

            if (['coil', 'coil_neg', 'coil_set', 'coil_reset'].includes(cell.type)) {
                const inner = { coil: '', coil_neg: '/', coil_set: 'S', coil_reset: 'R' }[cell.type];
                return `<div style="display:flex;flex-direction:column;align-items:center;gap:1px">
                    <span style="font-size:.52rem;font-weight:800;color:${oc}">${cell.var || '?'}</span>
                    <svg width="80" height="28" viewBox="0 0 80 28">
                        <line x1="0" y1="14" x2="22" y2="14" stroke="${lc}" stroke-width="${lw}"/>
                        <circle cx="40" cy="14" r="13" stroke="${oc}" stroke-width="2" fill="${obg}"/>
                        <text x="40" y="18" text-anchor="middle" font-size="9" fill="${oc}" font-weight="bold">${inner}</text>
                        <line x1="53" y1="14" x2="80" y2="14" stroke="${lc}" stroke-width="${lw}"/>
                        ${on ? '<circle cx="40" cy="14" r="13" fill="none" stroke="' + green + '" stroke-width="2" opacity=".4"><animate attributeName="r" values="13;17;13" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values=".4;0;.4" dur="1s" repeatCount="indefinite"/></circle>' : ''}
                    </svg>
                    <span style="font-size:.42rem;font-weight:800;color:${oc}">${on ? 'ON' : 'OFF'}</span>
                </div>`;
            }

            if (['timer_on', 'timer_off', 'timer_pulse'].includes(cell.type)) {
                const ts = ladderTimers[cell.var] || { elapsed: 0, active: false };
                const lab = { timer_on: 'TON', timer_off: 'TOF', timer_pulse: 'TP' }[cell.type];
                const pct = Math.min((ts.elapsed / cell.preset) * 100, 100);
                const tc = ts.active ? '#f59e0b' : dim;
                return `<div style="display:flex;flex-direction:column;align-items:center;border:1.5px solid ${tc};border-radius:6px;padding:3px 6px;font-size:.52rem;font-weight:700;color:${tc};min-width:76px;background:${ts.active ? 'rgba(245,158,11,.08)' : '#0a0f1a'}">
                    <span style="font-weight:800">${lab} ${cell.var}</span>
                    <div style="width:100%;height:3px;background:#1e293b;border-radius:2px;margin:2px 0;overflow:hidden"><div style="height:100%;width:${pct}%;background:#f59e0b;border-radius:2px;transition:width .1s"></div></div>
                    <span style="font-size:.45rem">${ts.elapsed.toFixed(1)}/${cell.preset}s</span>
                </div>`;
            }

            if (['counter', 'counter_down'].includes(cell.type)) {
                const cs = ladderCounters[cell.var] || { count: 0, done: false };
                const cl = cell.type === 'counter' ? 'CTU' : 'CTD';
                const cbc = cs.done ? '#3b82f6' : dim;
                return `<div style="display:flex;flex-direction:column;align-items:center;border:1.5px solid ${cbc};border-radius:6px;padding:3px 6px;font-size:.52rem;font-weight:700;color:${cbc};min-width:76px;background:${cs.done ? 'rgba(59,130,246,.08)' : '#0a0f1a'}">
                    <span style="font-weight:800">${cl} ${cell.var}</span>
                    <span style="font-size:.68rem;font-weight:800;margin:1px 0">${cs.count}/${cell.preset}</span>
                </div>`;
            }
            return '';
        }

// ── MAIN RENDER ──────────────────────────────────────────────
function ladderRender() {
            const canvas = document.getElementById('ladder-canvas');
            if (!canvas) return;
            let html = '';
            const tool = ladderActiveTool;

            if (tool === 'delete') {
                html += `<div style="background:rgba(239,68,68,.1);border:1.5px dashed #ef4444;border-radius:8px;padding:.3rem .6rem;margin-bottom:.4rem;text-align:center">
                    <span style="font-size:.68rem;font-weight:800;color:#ef4444">MODO APAGAR — clique em qualquer elemento para removê-lo</span>
                </div>`;
            } else if (tool === 'wire') {
                html += `<div style="background:rgba(16,185,129,.07);border:1.5px dashed #10b981;border-radius:8px;padding:.3rem .6rem;margin-bottom:.4rem;text-align:center">
                    <span style="font-size:.68rem;font-weight:800;color:#10b981">⏤ MODO FIO — clique em célula vazia para inserir fio (clique novamente para remover)</span>
                </div>`;
            } else if (tool === 'wire_v') {
                html += `<div style="background:rgba(16,185,129,.07);border:1.5px dashed #10b981;border-radius:8px;padding:.3rem .6rem;margin-bottom:.4rem;text-align:center">
                    <span style="font-size:.68rem;font-weight:800;color:#10b981">┃ FIO VERTICAL — clique na metade esquerda/direita da célula para conectar à linha abaixo naquele ponto (junção). Auto-adiciona linha se necessário.</span>
                </div>`;
            } else if (tool === 'branch_or') {
                html += `<div style="background:rgba(56,189,248,.07);border:1.5px dashed #38bdf8;border-radius:8px;padding:.3rem .6rem;margin-bottom:.4rem;text-align:center">
                    <span style="font-size:.68rem;font-weight:800;color:#38bdf8">∥ BRANCH OR — clique na célula para criar caminho paralelo (adiciona linha + fios verticais automáticos)</span>
                </div>`;
            }

            // Compute evaluation data for all rungs
            const rungEvals = ladderRungs.map((rung, ri) => ladderSimRunning ? ladderEvalRungFull(ri) : null);

            ladderRungs.forEach((rung, ri) => {
                const numRows = rung.rows.length;
                const ROW_H = 50;
                const totalH = numRows * ROW_H;
                const rungActive = rungEvals[ri] ? rungEvals[ri].active : false;
                const junctions = rungEvals[ri] ? rungEvals[ri].junctions : null;

                const wc = (on) => on ? '#10b981' : '#334155';

                html += `<div class="ldr-rung${rungActive ? ' rung-active' : ''}" style="display:flex;align-items:stretch;border-bottom:1px solid #0d1520;position:relative">`;

                // ═══ LEFT POWER RAIL ═══
                {
                    let sv = `<line x1="3" y1="0" x2="3" y2="${totalH}" stroke="${wc(rungActive)}" stroke-width="5" stroke-linecap="square"/>`;
                    for (let r = 0; r < numRows; r++) {
                        const rowEnergized = junctions ? junctions[r][0] : false;
                        const cy = r * ROW_H + ROW_H / 2;
                        sv += `<line x1="3" y1="${cy}" x2="15" y2="${cy}" stroke="${wc(rowEnergized)}" stroke-width="2.5"/>`;
                    }
                    html += `<svg width="15" height="${totalH}" viewBox="0 0 15 ${totalH}" style="flex-shrink:0;display:block">${sv}</svg>`;
                }

                // ═══ CENTRAL AREA (cells grid + vertical wires) ═══
                html += `<div style="flex:1;display:flex;flex-direction:column;min-width:0;position:relative">`;

                // Render each row
                for (let r = 0; r < numRows; r++) {
                    const row = rung.rows[r];
                    html += `<div style="display:flex;align-items:center;height:${ROW_H}px;${r > 0 ? 'border-top:1px solid #0d1520;background:#06080f' : ''}">`;

                    for (let ci = 0; ci < 6; ci++) {
                        const cell = row[ci];
                        const isSel = (ladderSelectedRung === ri && ladderSelectedCell === ci && ladderSelectedRow === r);
                        const isDelTarget = tool === 'delete' && cell.type !== 'empty';
                        const isWireTarget = tool === 'wire' && (cell.type === 'empty' || cell.type === 'wire');
                        const isWireVTarget = tool === 'wire_v';

                        const cellEnergized = junctions ? junctions[r][ci] : false;
                        const cellActive = cellEnergized && ladderEvalCellInput(cell);

                        let classes = 'ldr-cell';
                        if (isSel) classes += ' cell-selected';
                        if (isDelTarget) classes += ' cell-delete-hover';
                        if (isWireTarget) classes += ' cell-wire-hover';
                        if (isWireVTarget) classes += ' cell-wire-hover';

                        const vwLeftEnergized = junctions ? junctions[r][ci] : false;
                        const vwRightEnergized = junctions ? junctions[r][ci + 1] : false;

                        html += `<div class="${classes}" style="position:relative" onclick="ladderSelectCell(${ri},${ci},${r},event)" data-eo-action="aciona:ladder-celula">`;
                        html += ladderCellSymbol(cell, cellEnergized, cellActive);

                        // Vertical wire indicators
                        if (rung.vwires.has(r + ',' + ci)) {
                            const vc = wc(vwLeftEnergized);
                            html += `<div style="position:absolute;left:-1px;bottom:0;width:3px;height:50%;background:${vc};z-index:2"></div>`;
                        }
                        if (r > 0 && rung.vwires.has((r - 1) + ',' + ci)) {
                            const vc = wc(vwLeftEnergized);
                            html += `<div style="position:absolute;left:-1px;top:0;width:3px;height:50%;background:${vc};z-index:2"></div>`;
                        }
                        if (rung.vwires.has(r + ',' + (ci + 1))) {
                            const vc = wc(vwRightEnergized);
                            html += `<div style="position:absolute;right:-1px;bottom:0;width:3px;height:50%;background:${vc};z-index:2"></div>`;
                        }
                        if (r > 0 && rung.vwires.has((r - 1) + ',' + (ci + 1))) {
                            const vc = wc(vwRightEnergized);
                            html += `<div style="position:absolute;right:-1px;top:0;width:3px;height:50%;background:${vc};z-index:2"></div>`;
                        }

                        html += `</div>`;
                    }

                    // Spacer for alignment (same width for all rows, button only on non-main)
                    html += `<div class="ldr-rowspacer" style="width:18px;flex-shrink:0;display:flex;align-items:center;justify-content:center">`;
                    if (r > 0) {
                        html += `<button class="ldr-btn ldr-btn-rmrow" data-eo-action="aciona:ladder-remover-linha" onclick="ladderRemoveRowFromRung(${ri},${r})" style="background:none;border:none;color:#ef444488;cursor:pointer;font-size:.5rem;font-weight:800;line-height:1;padding:0" title="Remover linha ${r}" aria-label="Remover linha ${r}">${ladderIcon('x')}</button>`;
                    }
                    html += `</div>`;

                    html += `</div>`; // close row
                }

                html += `</div>`; // close central area

                // ═══ OUTPUT COLUMN ═══
                {
                    html += `<div style="min-width:96px;max-width:96px;display:flex;flex-direction:column;background:#0a0f1a;border-left:2px solid #151f30">`;

                    for (let r = 0; r < numRows; r++) {
                        const outCell = rung.rows[r][6];
                        const isSelOut = (ladderSelectedRung === ri && ladderSelectedCell === 6 && ladderSelectedRow === r);
                        const outCls = 'ldr-outcell' + (isSelOut ? ' cell-selected' : '');
                        const rowEnergized = junctions ? junctions[r][6] : false;

                        const hasDblClick = outCell && ['timer_on', 'timer_off', 'timer_pulse'].includes(outCell.type);
                        html += `<div class="${outCls}" style="height:${ROW_H}px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:.2rem;${r > 0 ? 'border-top:1px solid #0d1520;' : ''}position:relative" onclick="ladderSelectCell(${ri},6,${r},event)" data-eo-action="aciona:ladder-celula-saida"${hasDblClick ? ` ondblclick="ladderEditTimerParams(${ri},${r})"` : ''}>`;


                        if (outCell && outCell.type !== 'empty') {
                            html += ladderOutputSymbol(outCell, rowEnergized);
                        } else {
                            const lc = rowEnergized ? '#10b981' : '#334155';
                            html += `<svg width="90" height="28" viewBox="0 0 90 28"><line x1="0" y1="14" x2="90" y2="14" stroke="${lc}" stroke-width="${rowEnergized ? 3 : 2}" stroke-dasharray="${rowEnergized ? 'none' : '4 3'}"/></svg>`;
                        }

                        // Vertical wire indicators at junction 6
                        if (rung.vwires.has(r + ',6')) {
                            const vc = wc(junctions ? junctions[r][6] : false);
                            html += `<div style="position:absolute;left:-1px;bottom:0;width:3px;height:50%;background:${vc};z-index:2"></div>`;
                        }
                        if (r > 0 && rung.vwires.has((r - 1) + ',6')) {
                            const vc = wc(junctions ? junctions[r][6] : false);
                            html += `<div style="position:absolute;left:-1px;top:0;width:3px;height:50%;background:${vc};z-index:2"></div>`;
                        }

                        html += `</div>`;
                    }
                    html += `</div>`; // close output column
                }

                // ═══ RIGHT POWER RAIL ═══
                {
                    let sv = `<line x1="12" y1="0" x2="12" y2="${totalH}" stroke="${wc(rungActive)}" stroke-width="5" stroke-linecap="square"/>`;
                    // Main row connection
                    sv += `<line x1="0" y1="${ROW_H / 2}" x2="12" y2="${ROW_H / 2}" stroke="${wc(rungActive)}" stroke-width="2.5"/>`;
                    // Branch row connections (if they have vwires at junction 6 connecting to output)
                    for (let r = 1; r < numRows; r++) {
                        // Check if this row has a path to the output via vwires at junction 6
                        let connected = false;
                        for (let checkR = 0; checkR < r; checkR++) {
                            if (rung.vwires.has(checkR + ',6')) connected = true;
                        }
                        if (connected) {
                            const ba = junctions ? junctions[r][6] : false;
                            const cy = r * ROW_H + ROW_H / 2;
                            sv += `<line x1="0" y1="${cy}" x2="12" y2="${cy}" stroke="${wc(ba)}" stroke-width="2.5"/>`;
                        }
                    }
                    html += `<svg width="15" height="${totalH}" viewBox="0 0 15 ${totalH}" style="flex-shrink:0;display:block">${sv}</svg>`;
                }

                // ═══ CONTROLS ═══
                html += `<div class="ldr-rung-ctrl">
                    <span class="ldr-rung-num">${ri + 1}</span>
                    <button class="ldr-btn ldr-btn-addrow" data-eo-action="aciona:ladder-add-linha" onclick="ladderAddRowToRung(${ri})" style="background:none;border:1px solid #38bdf8;color:#38bdf8;cursor:pointer;font-size:.45rem;border-radius:3px;padding:1px 3px;font-weight:800;min-height:20px;line-height:1" title="Adicionar linha paralela" aria-label="Adicionar linha paralela">+L</button>
                    <button class="ldr-btn ldr-btn-rmrung" data-eo-action="aciona:ladder-remover-rung" onclick="ladderRemoveRung(${ri})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:.55rem;font-weight:800;line-height:1" title="Remover rung" aria-label="Remover rung ${ri + 1}">${ladderIcon('x')}</button>
                </div>`;

                html += `</div>`; // close rung
            });

            canvas.innerHTML = html;
        }

// ── EVALUATION LOGIC (junction-based) ─────────────────────────
function ladderEvalCellInput(cell) {
            if (!cell) return false;
            if (cell.type === 'empty') return false;
            if (cell.type === 'wire') return true;
            const val = !!ladderMemory[cell.var];
            const prev = !!ladderPrevMemory[cell.var];
            if (cell.type === 'contact_no') return val;
            if (cell.type === 'contact_nc') return !val;
            if (cell.type === 'contact_p') return val && !prev;
            if (cell.type === 'contact_n') return !val && prev;
            return true;
        }

function ladderPropagateVertical(rung, junctions, jCol) {
            const numRows = rung.rows.length;
            let changed = true;
            while (changed) {
                changed = false;
                for (let r = 0; r < numRows - 1; r++) {
                    const key = r + ',' + jCol;
                    if (rung.vwires.has(key)) {
                        if (junctions[r][jCol] && !junctions[r + 1][jCol]) {
                            junctions[r + 1][jCol] = true;
                            changed = true;
                        }
                        if (junctions[r + 1][jCol] && !junctions[r][jCol]) {
                            junctions[r][jCol] = true;
                            changed = true;
                        }
                    }
                }
            }
        }

function ladderEvalRungFull(ri) {
            const rung = ladderRungs[ri];
            if (!rung) return { active: false, junctions: null };
            const numRows = rung.rows.length;
            // junctions[row][col]: col 0..6
            // col 0 = left rail, col c+1 = right side of cell at column c
            const junctions = Array.from({ length: numRows }, () => Array(7).fill(false));

            // Left rail: energize rows that have a non-empty cell in column 0
            for (let r = 0; r < numRows; r++) {
                if (rung.rows[r][0] && rung.rows[r][0].type !== 'empty') {
                    junctions[r][0] = true;
                }
            }

            // Propagate vertical wires at junction 0
            ladderPropagateVertical(rung, junctions, 0);

            // Process columns 0..5 (input cells)
            for (let c = 0; c < 6; c++) {
                // Horizontal propagation
                for (let r = 0; r < numRows; r++) {
                    if (junctions[r][c] && ladderEvalCellInput(rung.rows[r][c])) {
                        junctions[r][c + 1] = true;
                    }
                }
                // Vertical propagation at junction c+1
                ladderPropagateVertical(rung, junctions, c + 1);
            }

            // Rung active if any row reaches junction 6
            let active = false;
            for (let r = 0; r < numRows; r++) {
                if (junctions[r][6]) { active = true; break; }
            }

            return { active, junctions };
        }

function ladderEvalRung(ri) {
            return ladderEvalRungFull(ri).active;
        }

// ── SCAN CYCLE ───────────────────────────────────────────────
function ladderScan() {
            ladderScanCounter++;
            const dt = LADDER_SCAN_MS / 1000;

            ladderPrevMemory = JSON.parse(JSON.stringify(ladderMemory));

            // Collect coil output results in a temporary map, then apply after all rungs evaluated
            const coilResults = {};

            ladderRungs.forEach((rung, ri) => {
                const evalResult = ladderEvalRungFull(ri);
                const junctions = evalResult.junctions;

                rung.rows.forEach((row, rowIdx) => {
                    const out = row[6];
                    if (!out || out.type === 'empty') return;
                    const rowActive = junctions ? junctions[rowIdx][6] : false;

                    if (out.type === 'coil') {
                        if (!coilResults[out.var]) coilResults[out.var] = { type: 'coil', value: false };
                        coilResults[out.var].value = coilResults[out.var].value || rowActive;
                    }
                    else if (out.type === 'coil_neg') {
                        if (!coilResults[out.var]) coilResults[out.var] = { type: 'coil_neg', value: false };
                        coilResults[out.var].value = coilResults[out.var].value || !rowActive;
                    }
                    else if (out.type === 'coil_set') { if (rowActive) ladderMemory[out.var] = true; }
                    else if (out.type === 'coil_reset') { if (rowActive) ladderMemory[out.var] = false; }
                    else if (out.type === 'timer_on') {
                        if (!ladderTimers[out.var]) ladderTimers[out.var] = { elapsed: 0, active: false, running: false };
                        const t = ladderTimers[out.var];
                        if (rowActive) { t.running = true; t.elapsed = Math.min(t.elapsed + dt, out.preset); t.active = t.elapsed >= out.preset; }
                        else { t.elapsed = 0; t.active = false; t.running = false; }
                        ladderMemory[out.var] = t.active;
                    } else if (out.type === 'timer_off') {
                        if (!ladderTimers[out.var]) ladderTimers[out.var] = { elapsed: 0, active: false, running: false, wasActive: false };
                        const t = ladderTimers[out.var];
                        if (rowActive) { t.elapsed = 0; t.active = true; t.running = false; t.wasActive = true; }
                        else { if (t.wasActive) { t.running = true; t.elapsed = Math.min(t.elapsed + dt, out.preset); if (t.elapsed >= out.preset) { t.active = false; t.running = false; t.wasActive = false; } } }
                        ladderMemory[out.var] = t.active;
                    } else if (out.type === 'timer_pulse') {
                        if (!ladderTimers[out.var]) ladderTimers[out.var] = { elapsed: 0, active: false, running: false };
                        const t = ladderTimers[out.var];
                        const pv = !!ladderPrevMemory['__tp_' + out.var];
                        if (rowActive && !pv && !t.running) { t.running = true; t.elapsed = 0; t.active = true; }
                        if (t.running) { t.elapsed = Math.min(t.elapsed + dt, out.preset); if (t.elapsed >= out.preset) { t.active = false; t.running = false; } }
                        ladderMemory['__tp_' + out.var] = rowActive;
                        ladderMemory[out.var] = t.active;
                    } else if (out.type === 'counter') {
                        if (!ladderCounters[out.var]) ladderCounters[out.var] = { count: 0, done: false, prevInput: false };
                        const c = ladderCounters[out.var];
                        if (rowActive && !c.prevInput) { c.count++; if (c.count >= out.preset) c.done = true; }
                        c.prevInput = rowActive;
                        ladderMemory[out.var] = c.done;
                    } else if (out.type === 'counter_down') {
                        if (!ladderCounters[out.var]) ladderCounters[out.var] = { count: out.preset, done: false, prevInput: false };
                        const c = ladderCounters[out.var];
                        if (rowActive && !c.prevInput) { c.count = Math.max(c.count - 1, 0); if (c.count <= 0) c.done = true; }
                        c.prevInput = rowActive;
                        ladderMemory[out.var] = c.done;
                    }
                });
            });

            // Apply coil results AFTER all rungs evaluated (fixes selo/seal circuits)
            for (const v in coilResults) {
                if (v.startsWith('I')) continue;
                ladderMemory[v] = coilResults[v].value;
            }

            const scEl = document.getElementById('ladder-scan-count');
            if (scEl) scEl.textContent = ladderScanCounter;
        }

// ── INPUT PANEL ──────────────────────────────────────────────
function ladderRenderInputToggles() {
            const container = document.getElementById('ladder-input-toggles');
            if (!container) return;
            const inputs = new Set();
            ladderRungs.forEach(r => {
                r.rows.forEach(row => {
                    row.forEach(c => { if (c.var && c.var.startsWith('I')) inputs.add(c.var); });
                });
            });
            for (let i = 0; i < 8; i++) inputs.add('I' + i);
            const sorted = [...inputs].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

            const existing = container.querySelectorAll('[data-ldr-input]');
            if (existing.length === sorted.length) {
                existing.forEach((btn, idx) => {
                    const v = sorted[idx];
                    const on = !!ladderMemory[v];
                    btn.style.border = `2px solid ${on ? '#10b981' : '#1e293b'}`;
                    btn.style.background = on ? 'rgba(16,185,129,.15)' : '#0a0f1a';
                    btn.style.color = on ? '#10b981' : '#374151';
                    btn.style.boxShadow = on ? '0 0 8px rgba(16,185,129,.25)' : 'none';
                    const led = btn.querySelector('.ldr-led');
                    if (led) {
                        led.style.background = on ? '#10b981' : '#1e293b';
                        led.style.borderColor = on ? '#34d399' : '#374151';
                        led.style.boxShadow = on ? '0 0 6px #10b981' : 'none';
                    }
                });
                return;
            }

            container.innerHTML = sorted.map(v => {
                const on = !!ladderMemory[v];
                return `<button data-ldr-input="${v}" onclick="ladderToggleInput('${v}')" data-eo-action="aciona:ladder-alternar-entrada" style="
                    padding:.3rem .2rem;border-radius:7px;font-size:.62rem;font-weight:800;cursor:pointer;
                    border:2px solid ${on ? '#10b981' : '#1e293b'};
                    background:${on ? 'rgba(16,185,129,.15)' : '#0a0f1a'};
                    color:${on ? '#10b981' : '#374151'};
                    display:flex;flex-direction:column;align-items:center;gap:2px;
                    user-select:none;-webkit-user-select:none;touch-action:manipulation;
                    min-height:42px;justify-content:center;font-family:'Space Mono',monospace;
                    transition:all .12s;${on ? 'box-shadow:0 0 8px rgba(16,185,129,.25)' : ''}
                "><div class="ldr-led" style="width:10px;height:10px;border-radius:50%;background:${on ? '#10b981' : '#1e293b'};border:1.5px solid ${on ? '#34d399' : '#374151'};transition:all .12s;${on ? 'box-shadow:0 0 6px #10b981' : ''}"></div><span>${v}</span></button>`;
            }).join('');
        }

// ── OUTPUT PANEL ─────────────────────────────────────────────
function ladderRenderOutputStatus() {
            const container = document.getElementById('ladder-output-status');
            if (!container) return;
            const outputs = new Set(), memories = new Set();
            const timers = new Map(), counters = new Map();
            ladderRungs.forEach(r => {
                r.rows.forEach(row => {
                    const out = row[6];
                    if (out && out.type !== 'empty' && out.var) {
                        if (out.var.startsWith('Q')) outputs.add(out.var);
                        if (out.var.startsWith('M')) memories.add(out.var);
                        if (out.type.startsWith('timer')) timers.set(out.var, out);
                        if (out.type.startsWith('counter')) counters.set(out.var, out);
                    }
                    row.forEach(c => {
                        if (c.var && c.var.startsWith('Q')) outputs.add(c.var);
                        if (c.var && c.var.startsWith('M')) memories.add(c.var);
                    });
                });
            });
            let html = '';
            const mkLed = (on, color) => `<div style="width:9px;height:9px;border-radius:50%;background:${on ? color : '#1e293b'};border:1.5px solid ${on ? color : '#374151'};${on ? 'box-shadow:0 0 6px ' + color : ''}"></div>`;
            [...outputs].sort().forEach(v => {
                const on = !!ladderMemory[v];
                html += `<div style="padding:.3rem .25rem;border-radius:7px;font-size:.58rem;font-weight:800;text-align:center;border:1.5px solid ${on ? '#10b981' : '#1e293b'};background:${on ? 'rgba(16,185,129,.1)' : '#0a0f1a'};color:${on ? '#10b981' : '#374151'};font-family:'Space Mono',monospace;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all .12s;${on ? 'box-shadow:0 0 8px rgba(16,185,129,.2)' : ''}">
                    ${mkLed(on, '#10b981')}<span>${v}</span><span style="font-size:.45rem">${on ? 'ON' : 'OFF'}</span></div>`;
            });
            [...memories].sort().forEach(v => {
                const on = !!ladderMemory[v];
                html += `<div style="padding:.3rem .25rem;border-radius:7px;font-size:.58rem;font-weight:800;text-align:center;border:1.5px solid ${on ? '#8b5cf6' : '#1e293b'};background:${on ? 'rgba(139,92,246,.1)' : '#0a0f1a'};color:${on ? '#8b5cf6' : '#374151'};font-family:'Space Mono',monospace;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all .12s;${on ? 'box-shadow:0 0 8px rgba(139,92,246,.2)' : ''}">
                    ${mkLed(on, '#8b5cf6')}<span>${v}</span><span style="font-size:.45rem">${on ? 'ON' : 'OFF'}</span></div>`;
            });
            timers.forEach((cell, v) => {
                const t = ladderTimers[v] || { elapsed: 0, active: false };
                const pct = Math.min((t.elapsed / cell.preset) * 100, 100);
                html += `<div style="padding:.3rem .25rem;border-radius:7px;font-size:.58rem;font-weight:800;text-align:center;border:1.5px solid ${t.active ? '#f59e0b' : '#1e293b'};background:${t.active ? 'rgba(245,158,11,.1)' : '#0a0f1a'};color:${t.active ? '#f59e0b' : '#374151'};font-family:'Space Mono',monospace;display:flex;flex-direction:column;align-items:center;gap:2px;${t.active ? 'box-shadow:0 0 8px rgba(245,158,11,.2)' : ''}">
                    ${mkLed(t.active, '#f59e0b')}<span>${v}</span><div style="width:100%;height:2px;background:#1e293b;border-radius:1px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#f59e0b"></div></div><span style="font-size:.43rem">${t.elapsed.toFixed(1)}s</span></div>`;
            });
            counters.forEach((cell, v) => {
                const c = ladderCounters[v] || { count: 0, done: false };
                html += `<div style="padding:.3rem .25rem;border-radius:7px;font-size:.58rem;font-weight:800;text-align:center;border:1.5px solid ${c.done ? '#3b82f6' : '#1e293b'};background:${c.done ? 'rgba(59,130,246,.1)' : '#0a0f1a'};color:${c.done ? '#3b82f6' : '#374151'};font-family:'Space Mono',monospace;display:flex;flex-direction:column;align-items:center;gap:2px;${c.done ? 'box-shadow:0 0 8px rgba(59,130,246,.2)' : ''}">
                    ${mkLed(c.done, '#3b82f6')}<span>${v}</span><span style="font-size:.52rem;font-weight:800">${c.count}/${cell.preset}</span>
                    <button onclick="ladderResetCounter('${v}')" data-eo-action="aciona:ladder-reset-contador" style="font-size:.42rem;padding:0 3px;border:1px solid #1e293b;border-radius:3px;background:transparent;color:#4b5563;cursor:pointer;font-family:'Space Mono',monospace">RST</button></div>`;
            });
            if (!html) html = '<span style="font-size:.58rem;color:#374151;grid-column:1/-1;font-family:\'Space Mono\',monospace">Nenhuma saída programada.</span>';
            container.innerHTML = html;
        }

function ladderResetCounter(v) {
            if (ladderCounters[v]) { ladderCounters[v].count = 0; ladderCounters[v].done = false; }
            ladderMemory[v] = false;
            ladderRender();
            ladderRenderOutputStatus();
        }

function ladderToggleInput(v) {
            ladderMemory[v] = !ladderMemory[v];
            if (ladderSimRunning) ladderScan();
            ladderRender();
            ladderRenderInputToggles();
            ladderRenderOutputStatus();
        }

function ladderToggleSim() {
            if (ladderSimRunning) ladderStopSim();
            else ladderStartSim();
        }

function ladderStartSim() {
            ladderSimRunning = true;
            ladderScanCounter = 0;
            ladderPrevMemory = JSON.parse(JSON.stringify(ladderMemory));
            const io = document.getElementById('ladder-io-panels');
            if (io) io.style.display = 'block';
            ladderRenderInputToggles();
            ladderRenderOutputStatus();
            const btn = document.getElementById('ladder-sim-btn');
            if (btn) { btn.textContent = 'PARAR'; btn.setAttribute('data-eo-action', 'aciona:ladder-sim-stop'); btn.style.color = '#fff'; btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)'; btn.style.borderColor = '#ef4444'; }
            const st = document.getElementById('ladder-sim-status');
            if (st) { st.textContent = '● Executando'; st.classList.add('running'); }
            ladderSimInterval = setInterval(() => {
                ladderScan();
                ladderRender();
                ladderRenderInputToggles();
                ladderRenderOutputStatus();
            }, LADDER_SCAN_MS);
        }

function ladderStopSim() {
            ladderSimRunning = false;
            if (ladderSimInterval) clearInterval(ladderSimInterval);
            ladderSimInterval = null;
            const io = document.getElementById('ladder-io-panels');
            if (io) io.style.display = 'none';
            const btn = document.getElementById('ladder-sim-btn');
            if (btn) { btn.innerHTML = ladderIcon('play') + ' SIMULAR'; btn.setAttribute('data-eo-action', 'aciona:ladder-sim-start'); btn.style.color = '#fff'; btn.style.background = 'linear-gradient(135deg,#10b981,#059669)'; btn.style.borderColor = '#10b981'; }
            const st = document.getElementById('ladder-sim-status');
            if (st) { st.textContent = '● Parado'; st.classList.remove('running'); }
            ladderRender();
        }

// ── EXPORT / IMPORT ──────────────────────────────────────────
function ladderExportJSON() {
            // Convert Sets to arrays for JSON
            const data = {
                version: 2,
                rungs: ladderRungs.map(r => ({
                    id: r.id,
                    rows: r.rows,
                    vwires: [...r.vwires]
                }))
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'programa_ladder.zld';
            a.click();
        }

function ladderImportJSON(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.rungs) {
                        ladderStopSim();
                        ladderRungs = data.rungs.map(r => {
                            // Handle both v1 (cells+branches) and v2 (rows+vwires) formats
                            if (r.rows) {
                                return {
                                    id: r.id,
                                    rows: r.rows,
                                    vwires: new Set(r.vwires || [])
                                };
                            } else {
                                // v1 format
                                const rung = { id: r.id, cells: r.cells, branches: r.branches };
                                ladderMigrateRung(rung);
                                return rung;
                            }
                        });
                        ladderNextId = ladderRungs.length + 1;
                        ladderMemory = {};
                        ladderPrevMemory = {};
                        ladderTimers = {};
                        ladderCounters = {};
                        ladderRender();
                        ladderRenderInputToggles();
                        ladderRenderOutputStatus();
                        alert('Programa carregado com sucesso!');
                    }
                } catch (err) {
                    alert('Erro ao carregar arquivo: ' + err.message);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        }

// ── COMPATIBILITY WRAPPERS ───────────────────────────────────
function ladderAddBranch() { if (ladderSelectedRung >= 0) ladderAddRowToRung(ladderSelectedRung); }

function ladderAddBranchToRung(ri) { ladderBranchOR(ri, 0); }

function ladderRemoveBranch() { if (ladderSelectedRung >= 0) { const rung = ladderRungs[ladderSelectedRung]; if (rung && rung.rows.length > 1) ladderRemoveRowFromRung(ladderSelectedRung, rung.rows.length - 1); } }

function ladderRemoveBranchAt(ri, bi) { ladderRemoveRowFromRung(ri, bi + 1); }
