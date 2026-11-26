/* assets/js/legacy/aciona.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/aciona.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: aciona.html, depois de core.js. */

// ─── NAVEGAÇÃO ACIONAMENTOS ───────────────────────────────────
function showAcionaPage(id, btn) {
            document.querySelectorAll('#main-aciona .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-aciona .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id);
            if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector(`#nav-aciona .nav-btn[data-apage="${id}"]`);
            if (nb) nb.classList.add('active');
            if (id === 'diagram') { setTimeout(() => initDiagramEditor(), 80); }
            if (id !== 'diagram') stopSimulation();
        }

// ══════════════════════════════════════════════════════════════
        // EDITOR DE DIAGRAMAS — Motor CADe SIMU (vertical) | NBR / ANSI
        // Grade 20px | Fiação | Selo por tag | Undo/Redo
        // ══════════════════════════════════════════════════════════════
const DIAG_GRID = 20;

let diagCanvas = null;

let diagCtx = null;
// Dimensoes do canvas em px CSS + devicePixelRatio (render/diagram-canvas.js)
let diagView = { W: 0, H: 0, dpr: 1 };

let diagComponents = [];

let diagWires = [];

let selectedComps = [];

let selectedWireObjs = [];

let currentTool = 'select';

let selectedSymbol = null;

let wireStart = null;

let panOffset = { x: 0, y: 0 };

let zoomLevel = 1;

const ZOOM_MIN = 0.25, ZOOM_MAX = 4;

let isPanning = false;

let panStart = { x: 0, y: 0 };

let diagInitialized = false;

let compIdCounter = 1;

let diagHistory = [];

let diagHistoryRedo = [];

const DIAG_HISTORY_MAX = 80;

let simRunning = false;

let simInterval = null;
let lastSimTs = null;

let simPhase = 0;

let dragComp = null;

let dragOffX = 0;

let dragOffY = 0;

let dragMoved = false;

let hoverComp = null;

let previewPos = null;

let mouseWorld = { x: 0, y: 0 };

let lastDragMoved = false;

let lastEnergizedCoilIds = new Set();

/** Fluxo vertical CADe SIMU: portas superior (0) e inferior (1), centro em x */
const SYMBOL_DEFS = {
            power_l1: { name: 'Fase L1', w: 2, h: 2, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'source', simTag: 'L1' },
            power_l2: { name: 'Fase L2', w: 2, h: 2, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'source', simTag: 'L2' },
            power_l3: { name: 'Fase L3', w: 2, h: 2, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'source', simTag: 'L3' },
            power_n: { name: 'Neutro N', w: 2, h: 2, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'source_n', simTag: 'N' },
            contact_no: { name: 'Contato NA', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'contact' },
            contact_nc: { name: 'Contato NF', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'contact' },
            contact_timer_on_no: { name: 'NA ret. energ.', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'timer_contact', timerMode: 'onDelay' },
            contact_timer_on_nc: { name: 'NF ret. energ.', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'timer_contact', timerMode: 'onDelay' },
            contact_timer_off_no: { name: 'NA ret. desener.', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'timer_contact', timerMode: 'offDelay' },
            contact_timer_off_nc: { name: 'NF ret. desener.', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'timer_contact', timerMode: 'offDelay' },
            contact_phase_loss_no: { name: 'NA Falta Fase', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'contact_phase' },
            contact_phase_loss_nc: { name: 'NF Falta Fase', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'contact_phase' },
            contact_phase_seq_no: { name: 'NA Seq. Fase', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'contact_phase' },
            contact_phase_seq_nc: { name: 'NF Seq. Fase', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'contact_phase' },
            pushbutton_no: { name: 'Botoeira NA', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'pushbutton' },
            pushbutton_nc: { name: 'Botoeira NF', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'pushbutton_nc' },
            limit_switch_no: { name: 'FC NA', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'limit_switch' },
            selector_2pos: { name: 'Seletora', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'selector' },
            coil: { name: 'Bobina', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'coil' },
            relay_phase_loss: { name: 'Relé Falta Fase', w: 2, h: 3, ports: [{ x: 0.25, y: 0 }, { x: 0.5, y: 0 }, { x: 0.75, y: 0 }], type: 'monitoring' },
            relay_phase_seq: { name: 'Relé Seq. Fase', w: 2, h: 3, ports: [{ x: 0.25, y: 0 }, { x: 0.5, y: 0 }, { x: 0.75, y: 0 }], type: 'monitoring' },
            timer_relay: { name: 'Bobina temp.', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'coil' },
            timer_relay_off: { name: 'Bobina temp. desl.', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'coil' },
            overload_relay: { name: 'Relé térmico', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'overload' },
            fuse: { name: 'Fusível', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'passive' },
            circuit_breaker: { name: 'Disjuntor', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'breaker' },
            lamp: { name: 'Lâmpada', w: 2, h: 3, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'lamp' },
            motor_3ph: { name: 'Motor 3~', w: 3, h: 4, ports: [{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], type: 'motor' },
            ground: { name: 'Terra', w: 2, h: 2, ports: [{ x: 0.5, y: 0 }], type: 'sink' },
        };
/* Etapa 4.4: contator 3P, motor 6T/3T e juncao (nomenclatura a confirmar) */
if (window.EO && EO.sim && EO.sim.defsExtra) EO.sim.defsExtra.merge(SYMBOL_DEFS);
let simPaused = false;

function diagSnap(v) { return Math.round(v / DIAG_GRID) * DIAG_GRID; }

function snapXY(x, y) { return { x: diagSnap(x), y: diagSnap(y) }; }

function cloneDiagramForHistory() {
            const comps = diagComponents.map((c) => ({
                id: c.id,
                label: c.label,
                sym: c.sym,
                x: c.x,
                y: c.y,
                w: c.w,
                h: c.h,
                energized: false,
                fault: c.fault,
                color: c.color,
                time: c.time,
                timerMode: c.timerMode,
                forceState: c.forceState,
                _uid: c._uid,
                _pressed: false,
                _selected: c._selected,
                _actuated: c._actuated,
                _timerDone: c._timerDone,
                _tAcc: c._tAcc,
                _offDelayActive: c._offDelayActive,
                __prevCoilOn: c.__prevCoilOn,
            }));
            const wires = diagWires.map((w) => ({
                fromUid: w.from.comp._uid,
                fromPort: w.from.port,
                toUid: w.to.comp._uid,
                toPort: w.to.port,
            }));
            return { comps, wires, compIdCounter };
        }

function restoreDiagramFromSnapshot(s) {
            const map = new Map();
            diagComponents = s.comps.map((raw) => {
                const def = SYMBOL_DEFS[raw.sym];
                const c = Object.assign({}, raw, {
                    w: raw.w != null ? raw.w : def.w * DIAG_GRID,
                    h: raw.h != null ? raw.h : def.h * DIAG_GRID,
                    timerMode: raw.timerMode != null ? raw.timerMode : def.timerMode,
                });
                map.set(c._uid, c);
                return c;
            });
            diagWires = s.wires
                .map((w) => {
                    const a = map.get(w.fromUid);
                    const b = map.get(w.toUid);
                    if (!a || !b) return null;
                    return { from: { comp: a, port: w.fromPort }, to: { comp: b, port: w.toPort }, energized: false };
                })
                .filter(Boolean);
            compIdCounter = s.compIdCounter;
            selectedComps = [];
            selectedWireObjs = [];
            wireStart = null;
            showProps(null);
        }

function pushDiagramHistory() {
            const snap = cloneDiagramForHistory();
            diagHistory.push(snap);
            if (diagHistory.length > DIAG_HISTORY_MAX) diagHistory.shift();
            diagHistoryRedo = [];
            _updateUndoRedoBtns();
            _autosaveSoon();
        }

/* Autosave (4.5 B): debounce 400 ms; localStorage sempre em try/catch, falha nunca quebra a edicao */
let _autosaveTimer = null;
function _autosaveNow() {
            try {
                const s = EO.sim.diagramIO.toStorage(diagComponents, diagWires, compIdCounter);
                localStorage.setItem(s.key, s.value);
            } catch (e) { /* cota cheia ou localStorage indisponivel */ }
        }

function _autosaveSoon() {
            try { clearTimeout(_autosaveTimer); } catch (e) { /* noop */ }
            _autosaveTimer = setTimeout(_autosaveNow, 400);
        }

function _updateUndoRedoBtns() {
            const u = document.getElementById('btn-undo');
            const r = document.getElementById('btn-redo');
            if (u) { u.style.opacity = diagHistory.length < 2 ? '0.38' : '1'; u.setAttribute('aria-disabled', diagHistory.length < 2 ? 'true' : 'false'); }
            if (r) { r.style.opacity = diagHistoryRedo.length === 0 ? '0.38' : '1'; r.setAttribute('aria-disabled', diagHistoryRedo.length === 0 ? 'true' : 'false'); }
        }

/* O topo de diagHistory e o estado atual (snapshot pos-edicao): desfazer move o topo para o redo e restaura o anterior */
function diagramUndo() {
            if (diagHistory.length < 2) return;
            diagHistoryRedo.push(diagHistory.pop());
            restoreDiagramFromSnapshot(diagHistory[diagHistory.length - 1]);
            stopSimulation();
            renderDiagram();
            _updateUndoRedoBtns();
            _autosaveSoon();
        }

function diagramRedo() {
            if (diagHistoryRedo.length === 0) return;
            const next = diagHistoryRedo.pop();
            diagHistory.push(next);
            restoreDiagramFromSnapshot(next);
            stopSimulation();
            renderDiagram();
            _updateUndoRedoBtns();
            _autosaveSoon();
        }

/** Inicializa drag + resize da toolbar flutuante e drag do painel de props */
function initToolbarDragResize() {
            // ── helper genérico de drag para qualquer painel flutuante ──
            function makeDraggable(panel, handle) {
                if (!panel || !handle) return;
                let dragging = false, ox = 0, oy = 0;
                function getParentRect() { return panel.parentElement.getBoundingClientRect(); }
                function startDrag(cx, cy) {
                    dragging = true;
                    const pr = getParentRect();
                    ox = (cx - pr.left) - panel.offsetLeft;
                    oy = (cy - pr.top) - panel.offsetTop;
                    panel.style.transition = 'none';
                }
                function moveDrag(cx, cy) {
                    if (!dragging) return;
                    const pr = getParentRect();
                    const px = cx - pr.left - ox;
                    const py = cy - pr.top - oy;
                    const maxX = panel.parentElement.clientWidth - panel.offsetWidth;
                    const maxY = panel.parentElement.clientHeight - panel.offsetHeight;
                    panel.style.left = Math.max(0, Math.min(maxX, px)) + 'px';
                    panel.style.top = Math.max(0, Math.min(maxY, py)) + 'px';
                    panel.style.right = 'auto';
                }
                function stopDrag() { dragging = false; }
                handle.addEventListener('mousedown', e => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
                document.addEventListener('mousemove', e => { if (dragging) moveDrag(e.clientX, e.clientY); });
                document.addEventListener('mouseup', stopDrag);
                handle.addEventListener('touchstart', e => { e.stopPropagation(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
                handle.addEventListener('touchmove', e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
                handle.addEventListener('touchend', stopDrag);
            }

            // ── helper genérico de resize (canto inferior direito) ──
            function makeResizable(panel, resizeEl, minW, minH) {
                if (!panel || !resizeEl) return;
                let resizing = false, rsx = 0, rsy = 0, rw0 = 0, rh0 = 0;
                function startResize(cx, cy) { resizing = true; rsx = cx; rsy = cy; rw0 = panel.offsetWidth; rh0 = panel.offsetHeight; }
                function moveResize(cx, cy) {
                    if (!resizing) return;
                    const maxW = panel.parentElement.clientWidth - panel.offsetLeft - 4;
                    const maxH = panel.parentElement.clientHeight - panel.offsetTop - 4;
                    panel.style.width = Math.max(minW, Math.min(maxW, rw0 + (cx - rsx))) + 'px';
                    panel.style.height = Math.max(minH, Math.min(maxH, rh0 + (cy - rsy))) + 'px';
                    panel.style.maxHeight = 'none';
                }
                function stopResize() { resizing = false; }
                resizeEl.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); startResize(e.clientX, e.clientY); });
                document.addEventListener('mousemove', e => { if (resizing) moveResize(e.clientX, e.clientY); });
                document.addEventListener('mouseup', stopResize);
                resizeEl.addEventListener('touchstart', e => { e.stopPropagation(); startResize(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
                resizeEl.addEventListener('touchmove', e => { e.preventDefault(); moveResize(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
                resizeEl.addEventListener('touchend', stopResize);
            }

            // Toolbar de símbolos
            makeDraggable(
                document.getElementById('diag-toolbar'),
                document.getElementById('toolbar-drag-handle')
            );
            makeResizable(
                document.getElementById('diag-toolbar'),
                document.getElementById('toolbar-resize-handle'),
                140, 180
            );

            // Painel de propriedades
            makeDraggable(
                document.getElementById('diag-props'),
                document.getElementById('props-drag-handle')
            );
        }

function initDiagramEditor() {
            if (diagInitialized) {
                resizeDiagCanvas();
                renderDiagram();
                return;
            }
            diagCanvas = document.getElementById('diag-canvas');
            if (!diagCanvas) return;
            diagCtx = diagCanvas.getContext('2d');
            resizeDiagCanvas();
            attachDiagEvents();
            setDiagTool('select');
            diagInitialized = true;
            diagHistory = [];
            diagHistoryRedo = [];
            zoomLevel = 1;
            panOffset = { x: 0, y: 0 };
            initToolbarDragResize();
            initPresetSelect();
            let restaurou = false, restauroAvisos = [];
            try {
                const r = EO.sim.diagramIO.fromStorage(localStorage.getItem(EO.sim.diagramIO.autosaveKey), SYMBOL_DEFS);
                if (r.ok && r.snapshot.comps.length) { restoreDiagramFromSnapshot(r.snapshot); restaurou = true; restauroAvisos = r.avisos || []; }
            } catch (e) { /* autosave ausente ou invalido: exemplo */ }
            if (!restaurou) loadExampleDiagram();
            pushDiagramHistory();
            renderDiagram();
            if (restaurou) {
                fitDiagramView();
                renderDiagram();
                showPresetInfo('Diagrama restaurado do autosave deste navegador. Use "Novo" ou escolha um exemplo para recomeçar.'
                    + (restauroAvisos.length ? ' Avisos (' + restauroAvisos.length + '): ' + restauroAvisos.slice(0, 3).join(' | ') : ''));
            }
        }

function resizeDiagCanvas() {
            const wrap = document.getElementById('diag-canvas-wrap');
            if (!wrap || !diagCanvas) return;
            if (!(window.EO && EO.render && EO.render.diagram)) return;
            diagView = EO.render.diagram.resize(diagCanvas, wrap); // {W,H,dpr}: coordenadas do mouse seguem em px CSS
        }

/** Partida direta com selo — layout vertical CADe SIMU */
function loadExampleDiagram() {
            diagComponents = [];
            diagWires = [];
            compIdCounter = 1;
            const G = DIAG_GRID;
            const col = diagSnap(140);
            let y = 40;

            const mk = (sym, dy, id, label) => {
                const c = addComp(sym, col, y, id, label, true);
                y += dy;
                return c;
            };

            const l1 = mk('power_l1', G * 3, 'L1', 'Fase L1');
            const f1 = mk('circuit_breaker', G * 4, 'F1', 'Disjuntor');
            const p = mk('pushbutton_nc', G * 4, 'P', 'Parada');
            const s = mk('pushbutton_no', G * 4, 'S', 'Partida');
            const fr = mk('overload_relay', G * 4, 'FR', 'Relé térmico');
            const km1b = mk('coil', G * 4, 'KM1', 'Bobina KM1');
            const n = mk('power_n', G * 3, 'N', 'Neutro');

            const selo = addComp('contact_no', col + G * 8, s.y, 'KM1', 'Selo', true);

            const lamp = addComp('lamp', col + G * 14, fr.y + G * 2, 'H1', 'Lâmpada', true);

            function wire(a, pa, b, pb) {
                diagWires.push({ from: { comp: a, port: pa }, to: { comp: b, port: pb }, energized: false });
            }

            wire(l1, 1, f1, 0);
            wire(f1, 1, p, 0);
            wire(p, 1, s, 0);
            wire(p, 1, selo, 0);
            wire(s, 1, fr, 0);
            wire(selo, 1, fr, 0);
            wire(fr, 1, km1b, 0);
            wire(km1b, 1, n, 0);
            wire(fr, 1, lamp, 0);
            wire(lamp, 1, n, 0);

            renderDiagram();
        }

function addComp(sym, x, y, id, label, skipHist) {
            const def = SYMBOL_DEFS[sym];
            if (!def) return null;
            const s = snapXY(x, y);
            const c = {
                id: id || sym + '_' + compIdCounter,
                label: label || def.name,
                sym,
                x: s.x,
                y: s.y,
                w: def.w * DIAG_GRID,
                h: def.h * DIAG_GRID,
                energized: false,
                fault: false,
                color: 'green',
                time: 3,
                timerMode: def.timerMode || (def.type === 'timer_contact' ? 'onDelay' : ''),
                forceState: '',
                _uid: compIdCounter++,
                _pressed: false,
                _selected: false,
                _actuated: false,
                _timerDone: false,
                _tAcc: 0,
                _offDelayActive: false,
                __prevCoilOn: false,
            };
            if (sym === 'contact_timer_off' || sym === 'contact_nc_temp') c.timerMode = 'offDelay';
            if (sym === 'contact_timer_on' || sym === 'contact_no_temp') c.timerMode = 'onDelay';
            diagComponents.push(c);
            if (!skipHist) pushDiagramHistory();
            return c;
        }

function portWorld(c, pi) {
            const def = SYMBOL_DEFS[c.sym];
            const p = def.ports[pi];
            return { x: c.x + p.x * c.w, y: c.y + p.y * c.h };
        }

function compAtXY(x, y) {
            // Margem extra inversamente proporcional ao zoom — facilita toque no mobile
            const margin = Math.max(6, 12 / zoomLevel);
            for (let i = diagComponents.length - 1; i >= 0; i--) {
                const c = diagComponents[i];
                if (x >= c.x - margin && x <= c.x + c.w + margin &&
                    y >= c.y - margin && y <= c.y + c.h + margin) return c;
            }
            return null;
        }

function distPointSeg(px, py, x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len2 = dx * dx + dy * dy;
            if (len2 < 1e-6) return Math.hypot(px - x1, py - y1);
            let t = ((px - x1) * dx + (py - y1) * dy) / len2;
            t = Math.max(0, Math.min(1, t));
            const qx = x1 + t * dx;
            const qy = y1 + t * dy;
            return Math.hypot(px - qx, py - qy);
        }

function wireAtXY(x, y, thr) {
            let best = null;
            let bd = thr * thr;
            diagWires.forEach((w) => {
                const a = portWorld(w.from.comp, w.from.port);
                const b = portWorld(w.to.comp, w.to.port);
                const d = distPointSeg(x, y, a.x, a.y, b.x, b.y);
                if (d * d < bd) {
                    bd = d * d;
                    best = w;
                }
            });
            return best;
        }

function nearestPort(x, y, thr) {
            let best = null;
            let bd = thr * thr;
            diagComponents.forEach((c) => {
                const def = SYMBOL_DEFS[c.sym];
                def.ports.forEach((_, i) => {
                    const pw = portWorld(c, i);
                    const d = (x - pw.x) ** 2 + (y - pw.y) ** 2;
                    if (d < bd) {
                        bd = d;
                        best = { comp: c, port: i, x: pw.x, y: pw.y };
                    }
                });
            });
            return best;
        }

function isSelectedComp(c) {
            return selectedComps.indexOf(c) >= 0;
        }

function selectNone() {
            selectedComps = [];
            selectedWireObjs = [];
            showProps(null);
            renderDiagram();
        }

function selectComp(c, additive) {
            if (!c) {
                selectNone();
                return;
            }
            if (additive) {
                const i = selectedComps.indexOf(c);
                if (i >= 0) selectedComps.splice(i, 1);
                else selectedComps.push(c);
            } else {
                selectedComps = [c];
                selectedWireObjs = [];
            }
            showProps(selectedComps.length === 1 ? selectedComps[0] : selectedComps.length ? { multi: true } : null);
            renderDiagram();
        }

function selectAllDiagram() {
            selectedComps = diagComponents.slice();
            selectedWireObjs = [];
            showProps({ multi: true });
            renderDiagram();
        }

function selectWire(w) {
            if (!w) return;
            selectedComps = [];
            selectedWireObjs = [w];
            showProps(null);
            renderDiagram();
        }

function showProps(c) {
            const _pb = document.getElementById('btn-drawer-props');
            if (_pb) _pb.classList.toggle('has-selection', !!c);
            const empty = document.getElementById('props-empty');
            const content = document.getElementById('props-content');
            if (!c || c.multi) {
                empty.style.display = c && c.multi ? 'none' : 'block';
                content.style.display = c && c.multi ? 'block' : 'none';
                if (c && c.multi) {
                    document.getElementById('prop-id').value = selectedComps.length > 1 ? '(' + selectedComps.length + ' itens)' : '';
                    document.getElementById('prop-label').value = '';
                    document.getElementById('prop-id').disabled = true;
                    document.getElementById('prop-label').disabled = true;
                }
                return;
            }
            empty.style.display = 'none';
            content.style.display = 'block';
            document.getElementById('prop-id').disabled = false;
            document.getElementById('prop-label').disabled = false;
            document.getElementById('prop-id').value = c.id || '';
            document.getElementById('prop-label').value = c.label || '';
            document.getElementById('prop-color').value = c.color || 'green';
            document.getElementById('prop-time').value = c.time || 3;
            document.getElementById('prop-state').value = c.forceState || '';
            const isLamp = c.sym === 'lamp';
            const isTimerContact = ['contact_timer_on_no', 'contact_timer_on_nc', 'contact_timer_off_no', 'contact_timer_off_nc'].indexOf(c.sym) >= 0;
            const isTimerCoil = c.sym === 'timer_relay' || c.sym === 'timer_relay_off';
            document.getElementById('prop-color-row').style.display = isLamp ? 'block' : 'none';
            document.getElementById('prop-time-row').style.display = (isTimerContact || isTimerCoil) ? 'block' : 'none';
            document.getElementById('prop-timer-mode-row').style.display = isTimerContact ? 'block' : 'none';
            if (isTimerContact) {
                document.getElementById('prop-timer-mode').value = c.timerMode || SYMBOL_DEFS[c.sym].timerMode || 'onDelay';
            }
        }

function updateSelectedProp(key, val) {
            const targets = selectedComps.length ? selectedComps : [];
            if (targets.length === 0) return;
            if (key === 'id' || key === 'label') {
                targets.forEach((c) => {
                    c[key] = val;
                });
            } else if (key === 'timerMode') {
                targets.forEach((c) => {
                    c.timerMode = val;
                    c._tAcc = 0;
                    c._offDelayActive = false;
                });
            } else if (key === 'time') {
                const t = parseFloat(val);
                if (!(isFinite(t) && t >= 0 && t <= 86400)) return; // invalido: mantem o anterior
                targets[0].time = t;
            } else {
                targets[0][key] = val;
            }
            pushDiagramHistory();
            renderDiagram();
        }

function deleteSelected() {
            if (selectedWireObjs.length) {
                selectedWireObjs.forEach((w) => {
                    diagWires = diagWires.filter((x) => x !== w);
                });
                selectedWireObjs = [];
                pushDiagramHistory();
                showProps(null);
                renderDiagram();
                return;
            }
            if (selectedComps.length) {
                const set = new Set(selectedComps);
                diagComponents = diagComponents.filter((c) => !set.has(c));
                diagWires = diagWires.filter((w) => !set.has(w.from.comp) && !set.has(w.to.comp));
                selectedComps = [];
                pushDiagramHistory();
                showProps(null);
                renderDiagram();
            }
        }

function clearDiagram() {
            if (!confirm('Limpar todo o diagrama?')) return;
            diagComponents = [];
            diagWires = [];
            selectedComps = [];
            selectedWireObjs = [];
            wireStart = null;
            compIdCounter = 1;
            stopSimulation();
            showProps(null);
            pushDiagramHistory();
            renderDiagram();
        }

/* Novo: descarta o autosave e volta ao exemplo padrao */
function diagramNovo() {
            try { clearTimeout(_autosaveTimer); localStorage.removeItem(EO.sim.diagramIO.autosaveKey); } catch (e) { /* noop */ }
            loadPreset('exemplo-padrao');
        }

/* Salvar/Abrir JSON (4.5 B). Formato e validacao em sim/diagram-io.js */
function diagramSaveJSON() {
            const txt = EO.sim.diagramIO.serialize(diagComponents, diagWires, compIdCounter);
            const blob = new Blob([txt], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'diagrama-comando.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

function diagramLoadJSON(evt) {
            const input = evt.target;
            const f = input.files && input.files[0];
            if (!f) return;
            if (f.size > EO.sim.diagramIO.limites.bytes) {
                alert('Arquivo grande demais (máximo 2 MB).');
                input.value = '';
                return;
            }
            const rd = new FileReader();
            rd.onload = function (e) {
                const r = EO.sim.diagramIO.parse(String(e.target.result), SYMBOL_DEFS);
                input.value = '';
                if (!r.ok) {
                    alert('Não foi possível abrir o diagrama: ' + r.erro);
                    return;
                }
                stopSimulation();
                restoreDiagramFromSnapshot(r.snapshot);
                lastEnergizedCoilIds = new Set();
                lastSimTs = null;
                pushDiagramHistory();
                fitDiagramView();
                renderDiagram();
                if (r.avisos.length) {
                    showPresetInfo('Diagrama aberto com ' + r.avisos.length + ' aviso(s): ' + r.avisos.slice(0, 5).join(' | '));
                    alert('Diagrama aberto com ' + r.avisos.length + ' aviso(s):\n' + r.avisos.slice(0, 8).join('\n'));
                } else {
                    showPresetInfo('Diagrama aberto do arquivo ' + f.name + '.');
                }
            };
            rd.onerror = function () { input.value = ''; alert('Não foi possível ler o arquivo.'); };
            rd.readAsText(f);
        }

function selectSymbol(sym, el) {
            if (eoIsNarrow()) eoDrawerClose();
            selectedSymbol = sym;
            currentTool = 'place';
            document.querySelectorAll('#diag-toolbar .sym-btn').forEach((b) => {
                b.style.outline = 'none';
            });
            if (el) el.style.outline = '2px solid var(--accent2)';
        }

function setDiagTool(tool) {
            currentTool = tool;
            selectedSymbol = null;
            wireStart = null;
            document.querySelectorAll('#diag-toolbar .sym-btn').forEach((b) => {
                b.style.outline = 'none';
            });
            ['select', 'wire', 'delete'].forEach((t) => {
                const btn = document.getElementById('btn-tool-' + t);
                if (btn) btn.classList.toggle('active-tool', t === tool);
            });
            if (tool !== 'select') selectNone();
        }

function canvasXY(e) {
            const r = diagCanvas.getBoundingClientRect();
            return {
                x: (e.clientX - r.left - panOffset.x) / zoomLevel,
                y: (e.clientY - r.top - panOffset.y) / zoomLevel
            };
        }

function diagZoom(delta, cx, cy) {
            const prev = zoomLevel;
            zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomLevel + delta));
            // Zoom centrado no ponto cx,cy do canvas (se fornecido)
            if (cx !== undefined) {
                panOffset.x -= (cx - panOffset.x) * (zoomLevel / prev - 1);
                panOffset.y -= (cy - panOffset.y) * (zoomLevel / prev - 1);
            }
            const lbl = document.getElementById('zoom-label');
            if (lbl) lbl.textContent = Math.round(zoomLevel * 100) + '%';
            renderDiagram();
        }

function diagZoomReset() {
            zoomLevel = 1;
            panOffset = { x: 0, y: 0 };
            const lbl = document.getElementById('zoom-label');
            if (lbl) lbl.textContent = '100%';
            renderDiagram();
        }

function attachDiagEvents() {
            diagCanvas.addEventListener('click', onDiagClick);
            diagCanvas.addEventListener('mousemove', onDiagMove);
            diagCanvas.addEventListener('mousedown', onDiagDown);
            diagCanvas.addEventListener('mouseup', onDiagUp);

            // ── WHEEL: pan horizontal/vertical + zoom com Ctrl ──
            diagCanvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) {
                    // Zoom centrado no cursor
                    const r = diagCanvas.getBoundingClientRect();
                    const cx = e.clientX - r.left;
                    const cy = e.clientY - r.top;
                    const delta = e.deltaY < 0 ? 0.1 : -0.1;
                    const prev = zoomLevel;
                    zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomLevel + delta));
                    panOffset.x -= (cx - panOffset.x) * (zoomLevel / prev - 1);
                    panOffset.y -= (cy - panOffset.y) * (zoomLevel / prev - 1);
                    const lbl = document.getElementById('zoom-label');
                    if (lbl) lbl.textContent = Math.round(zoomLevel * 100) + '%';
                } else {
                    panOffset.x -= e.deltaX * 0.6;
                    panOffset.y -= e.deltaY * 0.6;
                }
                renderDiagram();
            }, { passive: false });

            // ── TOUCH: 1 dedo = interação | 2 dedos = pan+pinch zoom ──
            let _touch1Start = null; // posição inicial do touch de 1 dedo
            let _touchMoved = false; // se o dedo se moveu (cancela click)
            let _pinchDist0 = 0;
            let _pinchPan0 = null;
            let _pinchZoom0 = 1;
            let _panActive = false;

            diagCanvas.addEventListener('touchstart', e => {
                e.preventDefault();
                if (e.touches.length === 1) {
                    _panActive = false;
                    _touchMoved = false;
                    const t = e.touches[0];
                    _touch1Start = { x: t.clientX, y: t.clientY };
                    onDiagDown({ clientX: t.clientX, clientY: t.clientY, button: 0 });
                } else if (e.touches.length === 2) {
                    _panActive = true;
                    dragComp = null;
                    isPanning = false;
                    const t1 = e.touches[0], t2 = e.touches[1];
                    _pinchDist0 = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                    _pinchZoom0 = zoomLevel;
                    _pinchPan0 = {
                        mx: (t1.clientX + t2.clientX) / 2,
                        my: (t1.clientY + t2.clientY) / 2,
                        px: panOffset.x,
                        py: panOffset.y
                    };
                }
            }, { passive: false });

            diagCanvas.addEventListener('touchmove', e => {
                e.preventDefault();
                if (e.touches.length === 2 && _pinchPan0) {
                    const t1 = e.touches[0], t2 = e.touches[1];
                    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                    const mx = (t1.clientX + t2.clientX) / 2;
                    const my = (t1.clientY + t2.clientY) / 2;
                    // Zoom pelo pinch
                    const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, _pinchZoom0 * (dist / _pinchDist0)));
                    // Pan pelo deslocamento do centro
                    panOffset.x = _pinchPan0.px + (mx - _pinchPan0.mx) - (_pinchPan0.mx - panOffset.x) * (newZoom / _pinchZoom0 - 1);
                    panOffset.y = _pinchPan0.py + (my - _pinchPan0.my) - (_pinchPan0.my - panOffset.y) * (newZoom / _pinchZoom0 - 1);
                    zoomLevel = newZoom;
                    const lbl = document.getElementById('zoom-label');
                    if (lbl) lbl.textContent = Math.round(zoomLevel * 100) + '%';
                    renderDiagram();
                } else if (e.touches.length === 1 && !_panActive) {
                    const t = e.touches[0];
                    if (_touch1Start) {
                        const dx = t.clientX - _touch1Start.x;
                        const dy = t.clientY - _touch1Start.y;
                        if (Math.hypot(dx, dy) > 6) _touchMoved = true;
                    }
                    onDiagMove({ clientX: t.clientX, clientY: t.clientY });
                }
            }, { passive: false });

            diagCanvas.addEventListener('touchend', e => {
                e.preventDefault();
                if (_panActive && e.touches.length < 2) {
                    _panActive = false;
                    _pinchPan0 = null;
                    return;
                }
                if (!_panActive && e.touches.length === 0) {
                    const t = e.changedTouches[0];
                    onDiagUp({ clientX: t.clientX, clientY: t.clientY });
                    // Só dispara click se não moveu (tap limpo)
                    if (!_touchMoved) {
                        onDiagClick({ clientX: t.clientX, clientY: t.clientY });
                    }
                    _touch1Start = null;
                    _touchMoved = false;
                }
            }, { passive: false });

            window.addEventListener('keydown', onDiagKeyDown);
        }

function onDiagKeyDown(e) {
            if (currentModule !== 'aciona') return;
            const pg = document.getElementById('page-diagram');
            if (!pg || !pg.classList.contains('active')) return;
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;

            if (e.key === 'Escape') {
                selectedSymbol = null;
                wireStart = null;
                setDiagTool('select');
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                diagramUndo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
                e.preventDefault();
                diagramRedo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                selectAllDiagram();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelected();
            }
        }

function onDiagDown(e) {
            if (e.button === 1 || (e.button === 0 && e.altKey)) {
                isPanning = true;
                panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
                return;
            }
            if (currentTool === 'select' && e.button === 0 && !simRunning) {
                const { x, y } = canvasXY(e);
                const w = wireAtXY(x, y, 8);
                if (w) { dragComp = null; selectWire(w); return; }
                const c = compAtXY(x, y);
                if (c) {
                    dragComp = c;
                    dragOffX = x - c.x;
                    dragOffY = y - c.y;
                    dragMoved = false;
                }
            }
        }

function onDiagUp(e) {
            if (isPanning) {
                isPanning = false;
                return;
            }
            if (dragComp) {
                lastDragMoved = dragMoved;
                if (dragMoved) pushDiagramHistory();
                dragComp = null;
                dragMoved = false;
                renderDiagram();
                return;
            }
            renderDiagram();
        }

function onDiagMove(e) {
            const { x, y } = canvasXY(e);
            mouseWorld.x = x;
            mouseWorld.y = y;
            if (isPanning) {
                panOffset.x = e.clientX - panStart.x;
                panOffset.y = e.clientY - panStart.y;
                renderDiagram();
                return;
            }
            if (dragComp) {
                const nx = diagSnap(x - dragOffX);
                const ny = diagSnap(y - dragOffY);
                dragComp.x = nx;
                dragComp.y = ny;
                dragMoved = true;
                renderDiagram();
                return;
            }
            hoverComp = compAtXY(x, y);
            previewPos = selectedSymbol ? snapXY(x - (SYMBOL_DEFS[selectedSymbol].w * DIAG_GRID) / 2, y - (SYMBOL_DEFS[selectedSymbol].h * DIAG_GRID) / 2) : null;
            renderDiagram();
        }

function onDiagClick(e) {
            const { x, y } = canvasXY(e);
            if (simRunning) {
                const c = compAtXY(x, y);
                if (c) {
                    if (c.sym === 'pushbutton_no' || c.sym === 'pushbutton_nc') {
                        c._pressed = true;
                        simStepNow();
                        setTimeout(() => {
                            c._pressed = false;
                            simStepNow();
                        }, 380);
                    } else if (c.sym === 'overload_relay' || c.sym === 'circuit_breaker' || c.sym === 'fuse') {
                        c.fault = !c.fault;
                        simStepNow();
                    } else if (c.sym === 'limit_switch_no') {
                        c._actuated = !c._actuated;
                        simStepNow();
                    } else if (c.sym === 'selector_2pos') {
                        c._selected = !c._selected;
                        simStepNow();
                    }
                }
                return;
            }
            if (currentTool === 'delete') {
                const c = compAtXY(x, y);
                if (c) {
                    diagComponents = diagComponents.filter((d) => d !== c);
                    diagWires = diagWires.filter((w) => w.from.comp !== c && w.to.comp !== c);
                    selectedComps = selectedComps.filter((s) => s !== c);
                    pushDiagramHistory();
                    showProps(null);
                    renderDiagram();
                } else {
                    const w = wireAtXY(x, y, 10);
                    if (w) {
                        diagWires = diagWires.filter((x) => x !== w);
                        pushDiagramHistory();
                        renderDiagram();
                    }
                }
                return;
            }
            if (selectedSymbol) {
                const def = SYMBOL_DEFS[selectedSymbol];
                const s = snapXY(x - (def.w * DIAG_GRID) / 2, y - (def.h * DIAG_GRID) / 2);
                addComp(selectedSymbol, s.x, s.y, '', '');
                renderDiagram();
                return;
            }
            if (currentTool === 'wire') {
                const port = nearestPort(x, y, 14);
                if (port) {
                    if (!wireStart) wireStart = port;
                    else {
                        if (wireStart.comp !== port.comp) {
                            diagWires.push({
                                from: { comp: wireStart.comp, port: wireStart.port },
                                to: { comp: port.comp, port: port.port },
                                energized: false,
                            });
                            pushDiagramHistory();
                        }
                        wireStart = null;
                    }
                } else wireStart = null;
                renderDiagram();
                return;
            }
            if (currentTool === 'select' && !lastDragMoved) {
                const w = wireAtXY(x, y, 8);
                if (w) selectWire(w);
                else {
                    const c = compAtXY(x, y);
                    if (c) selectComp(c, e.shiftKey);
                    else selectNone();
                }
            }
        }

function toggleSimulation() {
            if (simRunning) stopSimulation();
            else startSimulation();
        }

function startSimulation() {
            if (simRunning) return;
            simRunning = true;
            simPaused = false;
            updateSimControls();
            lastSimTs = performance.now();
            runSimStep(0);
            simInterval = setInterval(() => {
                simPhase = (simPhase + 1) % 20;
                simStepNow();
            }, 120);
        }

/* Pausar: congela o tempo e o estado eletrico visivel (nao zera bobinas nem temporizadores). Retomar = startSimulation(). */
function pauseSimulation() {
            if (!simRunning) return;
            clearInterval(simInterval);
            simInterval = null;
            simRunning = false;
            simPaused = true;
            lastSimTs = null;
            updateSimControls();
            renderDiagram();
        }

/* Reiniciar: estado inicial do diagrama atual (temporizadores, botoeiras, acionamentos e falhas); o diagrama fica. */
function resetSimulation() {
            stopSimulation();
            diagComponents.forEach((c) => {
                c._tAcc = 0; c._timerDone = false; c._offDelayActive = false; c.__prevCoilOn = false;
                c._pressed = false; c._selected = false; c._actuated = false; c.fault = false;
                c.motorEstado = null;
            });
            updateSimPanel(null);
            renderDiagram();
        }

function updateSimControls() {
            const run = simRunning, paused = simPaused;
            const b = document.getElementById('btn-simulate');
            if (b) {
                const ico = (n) => (window.EO && EO.icon ? EO.icon(n) + ' ' : '');
                b.innerHTML = run ? 'Parar' : ico('play') + (paused ? 'Retomar' : 'Iniciar');
                b.setAttribute('data-eo-action', run ? 'aciona:sim-stop' : 'aciona:sim-start');
                b.className = 'diag-topbar-btn ' + (run ? 'sim-stop' : 'sim-run');
            }
            const p = document.getElementById('btn-sim-pause');
            if (p) p.disabled = !run;
            const sb = document.getElementById('sim-status-badge');
            if (sb) {
                sb.textContent = run ? '● Simulando' : (paused ? '● Pausado' : '● Parado');
                sb.className = 'sim-status' + (run ? ' running' : '');
            }
        }

function stopSimulation() {
            simRunning = false;
            simPaused = false;
            clearInterval(simInterval);
            simInterval = null;
            lastSimTs = null;
            updateSimControls();
            diagComponents.forEach((c) => { c.energized = false; c.short = false; c.motorEstado = null; });
            diagWires.forEach((w) => { w.energized = false; w.short = false; });
            lastEnergizedCoilIds = new Set();
            /* A7: zera estado dos temporizadores para o TOF nao reiniciar atuado */
            diagComponents.forEach((c) => { c._tAcc = 0; c._timerDone = false; c._offDelayActive = false; c.__prevCoilOn = false; });
            updateSimPanel(null);
            renderDiagram();
        }

function getTimerTime(c) { return EO.sim.timers.timeOf(c, diagComponents); }

function updateTimerContactAccumulators(dt) {
            EO.sim.timers.update(diagComponents, SYMBOL_DEFS, lastEnergizedCoilIds, dt);
        }

function timerContactIsActive(c) {
            return EO.sim.timers.isActive(c, SYMBOL_DEFS, diagComponents, lastEnergizedCoilIds);
        }

function timerContactConductsNow(c) {
            return EO.sim.timers.conducts(c, SYMBOL_DEFS, diagComponents, lastEnergizedCoilIds);
        }

function compConductsNow(c, energizedCoilIds) {
            return EO.sim.engine.conducts(c, SYMBOL_DEFS, energizedCoilIds,
                { components: diagComponents, prevCoilIds: lastEnergizedCoilIds });
        }

/* Segundos reais desde o ultimo passo (0 no primeiro). Cada clique/intervalo gera um unico passo. */
function simElapsed() {
            const now = performance.now();
            const dt = lastSimTs === null ? 0 : Math.max(0, (now - lastSimTs) / 1000);
            lastSimTs = now;
            return dt;
        }

function simStepNow() { if (simRunning) runSimStep(simElapsed()); }

/* dt em segundos; sem argumento = 0.12 (compatibilidade com testes/baseline). Caminhos reais passam o tempo medido. */
function runSimStep(dt) {
            const r = EO.sim.engine.stepRealtime(
                { components: diagComponents, wires: diagWires, defs: SYMBOL_DEFS },
                { coilIds: lastEnergizedCoilIds }, dt === undefined ? 0.12 : dt);

            diagComponents.forEach((c) => { c.energized = r.compEnergized.get(c); });
            diagWires.forEach((w, i) => { w.energized = r.wireEnergized[i]; });
            const sc = new Set(r.shortComps), sw = new Set(r.shortWires);
            diagComponents.forEach((c) => { c.short = sc.has(c); });
            diagWires.forEach((w) => { w.short = sw.has(w); });
            diagComponents.forEach((c) => { c.motorEstado = r.motors ? (r.motors.get(c._uid) || null) : null; });

            const sb = document.getElementById('sim-status-badge');
            if (sb) {
                const ico = (window.EO && EO.icon ? EO.icon('triangle-alert') + ' ' : '');
                if (r.faults.length) { sb.innerHTML = ico + 'Falha: curto ' + r.faults.map((f) => f.entre.join('–')).join(', '); sb.className = 'sim-status fault'; }
                else if (r.oscillating) { sb.innerHTML = ico + 'Circuito sem estado estável (oscilação)'; sb.className = 'sim-status fault'; }
                else if (r.hasFault) { sb.innerHTML = ico + 'Falha'; sb.className = 'sim-status fault'; }
                else if (r.coilIds.size > 0) { sb.textContent = '● Simulando'; sb.className = 'sim-status running'; }
                else { sb.textContent = '● Aguardando'; sb.className = 'sim-status running'; }
            }

            lastEnergizedCoilIds = new Set(r.coilIds);
            updateSimPanel(r);
            renderDiagram();
        }

/* Painel de estados: tempo restante dos temporizadores e estado dos motores (texto, nunca so cor). */
function simPanelLines() {
            const lines = [];
            const fmt = (v) => v.toFixed(1).replace('.', ',') + ' s';
            diagComponents.forEach((c) => {
                if (c.sym !== 'timer_relay' && c.sym !== 'timer_relay_off') return;
                const cts = diagComponents.filter((k) => k.id === c.id && SYMBOL_DEFS[k.sym].type === 'timer_contact');
                const T = Math.max(0.05, parseFloat(c.time) || 3);
                const acc = cts.reduce((m, k) => Math.max(m, k._tAcc || 0), 0);
                const on = lastEnergizedCoilIds.has(c.id);
                let txt;
                if (c.sym === 'timer_relay') txt = on ? (acc >= T ? 'atingido, contato atuado' : 'faltam ' + fmt(Math.max(0, T - acc)) + ' de ' + fmt(T)) : 'desligado (' + fmt(T) + ')';
                else {
                    const active = cts.some((k) => k._offDelayActive && (k._tAcc || 0) < T);
                    txt = on ? 'ligado, contato atuado' : (active ? 'faltam ' + fmt(Math.max(0, T - acc)) + ' para soltar' : 'desligado (' + fmt(T) + ')');
                }
                lines.push({ k: 'timer', id: c.id, txt });
            });
            diagComponents.forEach((c) => {
                if (SYMBOL_DEFS[c.sym].type !== 'motor3') return;
                const m = c.motorEstado || { estado: 'parado', sequencia: null };
                const nome = { Y: 'estrela (Y)', 'Δ': 'triângulo (Δ)', ligado: 'ligado', parado: 'parado', incompleto: 'ligação incompleta' }[m.estado] || m.estado;
                const sent = m.sequencia === 'direta' ? ', sentido direto' : m.sequencia === 'inversa' ? ', sentido inverso' : '';
                lines.push({ k: 'motor', id: c.id, txt: nome + (m.estado === 'parado' || m.estado === 'incompleto' ? '' : sent) });
            });
            return lines;
        }

function updateSimPanel(r) {
            const el = document.getElementById('sim-estados');
            if (!el) return;
            const lines = r === null ? [] : simPanelLines();
            const html = lines.length ? lines.map((l) => '<li class="sim-estado sim-estado--' + l.k + '"><strong>' + escapeHtml(l.id || l.k) + '</strong> ' + escapeHtml(l.txt) + '</li>').join('') : '<li class="sim-estado sim-estado--vazio">Inicie a simulação para ver temporizadores e motores.</li>';
            if (el.__html !== html) { el.innerHTML = html; el.__html = html; }
        }

function escapeHtml(t) { return String(t).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

/* ── Presets (Fase 4.4): carregam o diagrama pelo mesmo caminho do undo/redo ── */
function fitDiagramView() {
            if (!diagComponents.length || !diagView.W) { zoomLevel = 1; panOffset = { x: 0, y: 0 }; return; }
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            diagComponents.forEach((c) => { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x + c.w); y1 = Math.max(y1, c.y + c.h + 16); });
            const pad = 24, bw = x1 - x0 + pad * 2, bh = y1 - y0 + pad * 2;
            zoomLevel = Math.max(ZOOM_MIN, Math.min(1, diagView.W / bw, diagView.H / bh));
            panOffset = { x: (diagView.W - (x1 - x0) * zoomLevel) / 2 - x0 * zoomLevel, y: (diagView.H - (y1 - y0) * zoomLevel) / 2 - y0 * zoomLevel };
            const lbl = document.getElementById('zoom-label');
            if (lbl) lbl.textContent = Math.round(zoomLevel * 100) + '%';
        }

function showPresetInfo(txt, ref) {
            const d = document.getElementById('preset-desc');
            if (!d) return;
            d.textContent = txt || '';
            if (ref) d.appendChild(document.createTextNode(' (referência: ' + ref + ')'));
        }

function loadPreset(id) {
            const sel = document.getElementById('preset-select');
            if (id === 'exemplo-padrao') {
                stopSimulation();
                loadExampleDiagram();
                pushDiagramHistory();
                showProps(null);
                fitDiagramView();
                renderDiagram();
                showPresetInfo('Partida direta com selo, KM1, lâmpada H1 e relé térmico FR (exemplo inicial do editor).');
                if (sel) sel.value = id;
                return true;
            }
            const p = window.EO && EO.presets ? EO.presets.get(id) : null;
            if (!p) return false;
            stopSimulation();
            restoreDiagramFromSnapshot(JSON.parse(JSON.stringify(p.diagrama)));
            lastEnergizedCoilIds = new Set();
            lastSimTs = null;
            pushDiagramHistory();
            fitDiagramView();
            renderDiagram();
            showPresetInfo(p.descricao, p.referencia);
            if (sel) sel.value = id;
            return true;
        }

function initPresetSelect() {
            const sel = document.getElementById('preset-select');
            if (!sel || sel.__init) return;
            sel.__init = true;
            const opt = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };
            sel.appendChild(opt('', 'Escolher exemplo...'));
            sel.appendChild(opt('exemplo-padrao', 'Partida direta com selo (exemplo inicial)'));
            if (window.EO && EO.presets) EO.presets.list().forEach((p) => sel.appendChild(opt(p.id, p.titulo)));
            sel.addEventListener('change', () => { if (sel.value) loadPreset(sel.value); });
            updateSimControls();
            updateSimPanel(null);
        }

/* Render do diagrama: extraido para render/diagram-canvas.js (Fase 4.2); aqui ficam so wrappers finos. */
function renderDiagram() {
            if (!diagCanvas || !diagCtx || !(window.EO && EO.render && EO.render.diagram)) return;
            EO.render.diagram.render(diagCtx,
                { zoom: zoomLevel, pan: panOffset, W: diagView.W, H: diagView.H, dpr: diagView.dpr,
                  grid: DIAG_GRID, dark: isDark, tool: currentTool, token: C },
                { components: diagComponents, wires: diagWires, defs: SYMBOL_DEFS,
                  selection: { comps: selectedComps, wires: selectedWireObjs },
                  hover: hoverComp, wireStart: wireStart, mouseWorld: mouseWorld,
                  preview: previewPos, selectedSymbol: selectedSymbol },
                { running: simRunning || simPaused, phase: simPhase, coilIds: lastEnergizedCoilIds });
        }

function exportDiagram() {
            if (!diagCanvas) return;
            EO.render.diagram.exportPNG(diagCanvas, 'diagrama_comando_cade.png');
        }

// Subpagina Ladder: editor embutido (iframe apps/ladder.html, Fase 4.L). Ao sair dela, para a simulacao do editor.
const origShowAcionaPage = showAcionaPage;

showAcionaPage = function (id, btn) {
            origShowAcionaPage(id, btn);
            if (id !== 'ladder') {
                const lf = document.getElementById('ladder-frame');
                if (lf && lf.contentWindow) lf.contentWindow.postMessage({ type: 'simulate', value: false }, '*');
            }
        };

/* Paleta do editor e pagina de referencia: SVG gerado por render/symbols.js (fonte unica, currentColor, legivel no escuro) */
if (window.EO && EO.render && EO.render.symbols) EO.render.symbols.hydrate(document);
document.querySelectorAll('#page-aciona-ref svg[data-eo-symbol]').forEach((el) => el.classList.add('eo-ref-sym'));
initPresetSelect();

window.addEventListener('resize', () => { if (currentModule === 'aciona' && diagInitialized) { resizeDiagCanvas(); renderDiagram(); } });


/* ── Gavetas do editor (mobile): paleta de simbolos e propriedades viram paineis recolhiveis ── */
function eoIsNarrow() { return !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches); }
const EO_DRAWERS = { toolbar: ['diag-toolbar', 'btn-drawer-toolbar'], props: ['diag-props', 'btn-drawer-props'] };
function eoDrawerClose() {
    Object.keys(EO_DRAWERS).forEach((k) => {
        const p = document.getElementById(EO_DRAWERS[k][0]);
        const b = document.getElementById(EO_DRAWERS[k][1]);
        if (p) p.classList.remove('is-open');
        if (b) { b.setAttribute('aria-expanded', 'false'); b.classList.remove('active-tool'); }
    });
}
function eoDrawerToggle(which) {
    const p = document.getElementById(EO_DRAWERS[which][0]);
    if (!p) return;
    const willOpen = !p.classList.contains('is-open');
    eoDrawerClose();
    if (willOpen) {
        p.classList.add('is-open');
        const b = document.getElementById(EO_DRAWERS[which][1]);
        if (b) { b.setAttribute('aria-expanded', 'true'); b.classList.add('active-tool'); }
        /* leva a barra do editor ao topo: o canvas fica visivel acima da gaveta */
        const tb = document.querySelector('#page-diagram .diag-topbar');
        if (tb && tb.scrollIntoView) tb.scrollIntoView({ block: 'start' });
    }
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && eoIsNarrow()) eoDrawerClose(); });
