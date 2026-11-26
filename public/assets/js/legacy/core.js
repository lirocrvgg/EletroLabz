/* assets/js/legacy/core.js - EletroLabz (legado; Fase 2.0.5).
 * Gerado por tools/extract_legacy.py a partir de public/aciona.html. Script classico: funcoes e variaveis
 * continuam globais (onclick inline). Carregado por: aciona.html, apostilas.html, distrib.html, elet.html, eletrotec.html, ia.html, industrial.html, predial.html, sobre.html (todas; primeiro script de modulo). Nao depende de outros scripts legacy. */

// ─── TEMA ─── movido para assets/js/core/theme.js (toggleTheme e isDark continuam globais).

function C(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

// ─── MÓDULO SELECTOR ─────────────────────────────────────────
let currentModule = null;

function enterModule(mod) {
            document.getElementById('module-selector').classList.add('hidden');
            currentModule = mod;
            if (mod === 'elet') {
                document.getElementById('nav-elet').style.display = 'block';
                document.getElementById('main-elet').style.display = 'block';
                if (typeof showPage === 'function') showPage('home', null);
            } else if (mod === 'aciona') {
                document.getElementById('nav-aciona').style.display = 'block';
                document.getElementById('main-aciona').style.display = 'block';
                if (typeof showAcionaPage === 'function') showAcionaPage('aciona-home', null);
            } else if (mod === 'industrial') {
                document.getElementById('nav-industrial').style.display = 'block';
                document.getElementById('main-industrial').style.display = 'block';
                if (typeof showIndustrialPage === 'function') showIndustrialPage('ind-home', null);
            } else if (mod === 'predial') {
                document.getElementById('nav-predial').style.display = 'block';
                document.getElementById('main-predial').style.display = 'block';
                if (typeof showPredialPage === 'function') showPredialPage('predial-selector', null);
            } else if (mod === 'ia') {
                document.getElementById('nav-ia').style.display = 'block';
                document.getElementById('main-ia').style.display = 'block';
                if (typeof showIAPage === 'function') showIAPage('ia-mcp', null);
            } else if (mod === 'distrib') {
                document.getElementById('nav-distrib').style.display = 'block';
                document.getElementById('main-distrib').style.display = 'block';
                if (typeof showDistribPage === 'function') showDistribPage('distrib-home', null);
            } else if (mod === 'sobre') {
                document.getElementById('nav-sobre').style.display = 'block';
                document.getElementById('main-sobre').style.display = 'block';
                if (typeof showSobrePage === 'function') showSobrePage('sobre-main', null);
            } else if (mod === 'lael') {
                document.getElementById('nav-lael').style.display = 'block';
                document.getElementById('main-lael').style.display = 'block';
                if (typeof showLaelPage === 'function') showLaelPage('lael-home', null);
            } else if (mod === 'apostilas') {
                document.getElementById('nav-apostilas').style.display = 'block';
                document.getElementById('main-apostilas').style.display = 'block';
                if (typeof showApostilasPage === 'function') showApostilasPage('apostilas-home', null);
            }
        }

function showModuleSelector() {
            if (typeof stopSimulation === 'function') stopSimulation();
            currentModule = null;
            document.getElementById('module-selector').classList.remove('hidden');
            ['nav-elet', 'main-elet', 'nav-aciona', 'main-aciona', 'nav-predial', 'main-predial',
                'nav-industrial', 'main-industrial', 'nav-distrib', 'main-distrib', 'nav-ia', 'main-ia', 'nav-sobre', 'main-sobre',
                'nav-lael', 'main-lael', 'nav-apostilas', 'main-apostilas']
                .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        }

function showIAPage(id, btn) {
            document.querySelectorAll('#main-ia .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-ia .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id); if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-ia .nav-btn[data-iapage="' + id + '"]'); if (nb) nb.classList.add('active');
        }

function showSobrePage(id, btn) {
            document.querySelectorAll('#main-sobre .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-sobre .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id); if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-sobre .nav-btn[data-spage="' + id + '"]'); if (nb) nb.classList.add('active');
        }

function gridLine(ctx, W, H, cy) { ctx.strokeStyle = C('--border'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, cy || H / 2); ctx.lineTo(W, cy || H / 2); ctx.stroke(); }

function arrowVec(ctx, x1, y1, x2, y2, col, lbl, sz = 8) { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - sz * Math.cos(a - .4), y2 - sz * Math.sin(a - .4)); ctx.lineTo(x2 - sz * Math.cos(a + .4), y2 - sz * Math.sin(a + .4)); ctx.closePath(); ctx.fill(); if (lbl) { ctx.font = 'bold 11px Syne'; ctx.fillStyle = col; ctx.fillText(lbl, x2 + 5, y2 + 4); } }

// ─── HELPER: Exportar como XLSX real (SheetJS) ────────────────
function downloadCSVasXLSX(rows, filename) {
            if (typeof XLSX !== 'undefined') {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(rows);
                // Auto-width columns
                const colWidths = [];
                rows.forEach(r => {
                    if (!r) return;
                    r.forEach((cell, i) => {
                        const len = String(cell == null ? '' : cell).length;
                        colWidths[i] = Math.max(colWidths[i] || 8, len + 2);
                    });
                });
                ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 40) }));
                XLSX.utils.book_append_sheet(wb, ws, 'Dados');
                XLSX.writeFile(wb, filename + '.xlsx');
            } else {
                // Fallback CSV
                const bom = '\uFEFF';
                const csv = bom + rows.map(r => r.map(cell => {
                    const s = String(cell == null ? '' : cell);
                    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
                }).join(';')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename + '.csv';
                document.body.appendChild(a); a.click();
                document.body.removeChild(a); URL.revokeObjectURL(url);
            }
        }

// ─── NAVEGAÇÃO APOSTILAS ───────────────────────────────────────
function showApostilasPage(id, btn) {
            document.querySelectorAll('#main-apostilas .page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('#nav-apostilas .nav-btn').forEach(b => b.classList.remove('active'));
            const pg = document.getElementById('page-' + id);
            if (pg) pg.classList.add('active');
            const nb = btn || document.querySelector('#nav-apostilas .nav-btn[data-appage="' + id + '"]');
            if (nb) nb.classList.add('active');
            window.scrollTo(0, 0);
        }
