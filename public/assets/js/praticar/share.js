/* praticar/share.js - imagem do resultado e compartilhamento (EO.praticar.share).
 * Puras (testadas em Node): textoResultado, nomeArquivo, layoutResultado.
 * Com DOM: coresDoTema, fontesProntas, desenhar, gerarPNG, suportaArquivo, compartilhar, baixar, copiarTexto.
 * Sem requisicoes externas; nenhuma cor literal: as cores saem dos tokens CSS por um elemento de sonda. */
(function (root) {
  var EO = root.EO = root.EO || {};
  var P = EO.praticar = EO.praticar || {};

  var W = 1080, H = 1350;
  var FAM_SANS = '"IBM Plex Sans", "Segoe UI", Roboto, Arial, sans-serif';
  var FAM_MONO = '"JetBrains Mono", ui-monospace, Consolas, "Courier New", monospace';
  var NIVEIS = { 1: 'nível básico', 2: 'nível intermediário', 3: 'nível avançado' };
  /* caminho do icone "zap" (Lucide, ISC), 24x24: desenhado com Path2D, sem <img> */
  var ZAP = 'M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z';

  /* ---------- puras ---------- */
  function dois(n) { return (n < 10 ? '0' : '') + n; }

  function dataParts(data) {
    var d = data instanceof Date ? data : new Date(typeof data === 'number' ? data : Date.now());
    return { a: d.getFullYear(), m: dois(d.getMonth() + 1), d: dois(d.getDate()) };
  }

  function dataBR(data) { var p = dataParts(data); return p.d + '/' + p.m + '/' + p.a; }

  function textoResultado(res, data) {
    var linhas = ['Resultado do quiz · EletroLabz', res.acertos + '/' + res.total + ' (' + res.pct + '% de acerto)'];
    var tops = (res.porTopico || []).map(function (t) { return t.tituloCurto + ' ' + t.acertos + '/' + t.total; });
    if (tops.length) linhas.push(tops.join(', '));
    linhas.push(dataBR(data));
    return linhas.join('\n');
  }

  /* ASCII, ex.: eletrica-offline-quiz-2026-11-25-8de10.png */
  function nomeArquivo(res, data) {
    var p = dataParts(data);
    return 'eletrica-offline-quiz-' + p.a + '-' + p.m + '-' + p.d + '-' + res.acertos + 'de' + res.total + '.png';
  }

  /* corta com reticencias (ASCII) ate caber em maxW */
  function ajustar(texto, fonte, maxW, medir) {
    if (medir(texto, fonte) <= maxW) return texto;
    var t = String(texto);
    while (t.length > 1 && medir(t + '...', fonte) > maxW) t = t.slice(0, -1);
    return t.replace(/\s+$/, '') + '...';
  }

  function fonte(peso, tam, fam) { return peso + ' ' + tam + 'px ' + fam; }

  /* reduz o corpo da fonte (nunca abaixo de 28 px) ate o texto caber em maxW */
  function caber(texto, peso, tam, fam, maxW, medir) {
    var t = tam;
    while (t > 28 && medir(texto, fonte(peso, t, fam)) > maxW) t -= 4;
    return Math.max(28, t);
  }

  /* devolve o desenho 1080x1350 como dados puros; medir(texto, fonteCss) -> largura em px */
  function layoutResultado(res, medir, data) {
    var L = { w: W, h: H, panel: { x: 60, y: 60, w: 960, h: 1230 }, stripe: { h: 12 }, textos: [], topicos: [] };
    var cx = 120, dir = 960;
    function txt(id, texto, x, y, peso, tam, fam, cor, align, maxW) {
      var f = fonte(peso, tam, fam);
      var s = maxW ? ajustar(texto, f, maxW, medir) : texto;
      L.textos.push({ id: id, texto: s, x: x, y: y, tam: tam, peso: peso, fonte: f, cor: cor, align: align || 'left' });
    }
    L.icone = { path: ZAP, x: cx, y: 112, escala: 56 / 24, cor: 'brand' };
    txt('marca', 'EletroLabz', 196, 156, 600, 40, FAM_SANS, 'text', 'left', 480);
    txt('data', dataBR(data), dir, 156, 400, 30, FAM_MONO, 'muted', 'right', 260);
    txt('titulo', 'Resultado do quiz', cx, 290, 700, 64, FAM_SANS, 'text', 'left', 840);
    txt('subtitulo', 'Praticar · Educação', cx, 344, 400, 32, FAM_SANS, 'muted', 'left', 840);

    L.anel = { cx: 540, cy: 640, r: 188, largura: 44, frac: res.total ? res.acertos / res.total : 0 };
    var placar = res.acertos + '/' + res.total;
    var tp = caber(placar, 700, 140, FAM_MONO, 290, medir);
    txt('placar', placar, 540, 640 + Math.round(tp * 0.18), 700, tp, FAM_MONO, 'text', 'center');
    txt('pct', res.pct + '% de acerto', 540, 640 + Math.round(tp * 0.18) + 56, 600, 34, FAM_SANS, 'muted', 'center', 300);

    var tops = (res.porTopico || []).slice(0, 4);
    tops.forEach(function (t, i) {
      var y = 910 + i * 80;
      txt('topico' + i, t.tituloCurto, cx, y, 600, 32, FAM_SANS, 'text', 'left', 600);
      txt('valor' + i, t.acertos + '/' + t.total, dir, y, 700, 32, FAM_MONO, 'text', 'right', 200);
      L.topicos.push({ x: cx, y: y + 16, w: dir - cx, h: 16, frac: t.total ? t.acertos / t.total : 0 });
    });

    var nq = res.total + (res.total === 1 ? ' questão' : ' questões');
    var nivel = NIVEIS[res.nivel] || 'todos os níveis';
    txt('rodape1', nq + ' · ' + nivel, cx, 1232, 400, 30, FAM_SANS, 'muted', 'left', 840);
    txt('rodape2', 'Feito no EletroLabz', cx, 1268, 600, 30, FAM_SANS, 'text', 'left', 840);
    return L;
  }

  /* ---------- com DOM ---------- */
  var TOKENS = { bg: '--bg', surface: '--surface', surface2: '--surface-2', border: '--border', text: '--text', muted: '--text-muted', brand: '--brand', edu: '--area-edu', ok: '--ok' };

  /* le os tokens do tema ativo por um elemento de sonda (nenhuma cor literal no JS) */
  function coresDoTema() {
    var d = root.document;
    var probe = d.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;visibility:hidden';
    d.body.appendChild(probe);
    var out = {};
    Object.keys(TOKENS).forEach(function (k) {
      probe.style.color = '';
      probe.style.color = 'var(' + TOKENS[k] + ')';
      out[k] = root.getComputedStyle(probe).color;
    });
    d.body.removeChild(probe);
    return out;
  }

  /* espera as fontes do canvas, com teto (padrao 1500 ms); nunca rejeita */
  function fontesProntas(timeout) {
    var ms = typeof timeout === 'number' ? timeout : 1500;
    var d = root.document;
    if (!d || !d.fonts || !d.fonts.load) return Promise.resolve(false);
    var carga = Promise.all([
      d.fonts.load('700 64px "IBM Plex Sans"'), d.fonts.load('600 40px "IBM Plex Sans"'),
      d.fonts.load('700 140px "JetBrains Mono"')
    ]).then(function () { return d.fonts.ready; }).then(function () { return true; }, function () { return false; });
    var teto = new Promise(function (res) { setTimeout(function () { res(false); }, ms); });
    return Promise.race([carga, teto]);
  }

  function caixa(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function desenhar(ctx, L, cores) {
    ctx.clearRect(0, 0, L.w, L.h);
    ctx.fillStyle = cores.bg; ctx.fillRect(0, 0, L.w, L.h);
    var p = L.panel;
    caixa(ctx, p.x, p.y, p.w, p.h, 8); ctx.fillStyle = cores.surface; ctx.fill();
    ctx.save(); caixa(ctx, p.x, p.y, p.w, p.h, 8); ctx.clip();
    ctx.fillStyle = cores.edu; ctx.fillRect(p.x, p.y, p.w, L.stripe.h);
    ctx.restore();
    caixa(ctx, p.x + 1, p.y + 1, p.w - 2, p.h - 2, 8); ctx.strokeStyle = cores.border; ctx.lineWidth = 2; ctx.stroke();

    if (L.icone && root.Path2D) {
      ctx.save(); ctx.translate(L.icone.x, L.icone.y); ctx.scale(L.icone.escala, L.icone.escala);
      ctx.strokeStyle = cores[L.icone.cor]; ctx.lineWidth = 1.75; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.stroke(new root.Path2D(ZAP)); ctx.restore();
    }
    var a = L.anel, ini = -Math.PI / 2;
    ctx.lineWidth = a.largura; ctx.lineCap = 'butt';
    ctx.strokeStyle = cores.border; ctx.beginPath(); ctx.arc(a.cx, a.cy, a.r, 0, Math.PI * 2); ctx.stroke();
    if (a.frac > 0) {
      ctx.strokeStyle = cores.ok; ctx.beginPath();
      ctx.arc(a.cx, a.cy, a.r, ini, ini + Math.PI * 2 * Math.min(1, a.frac)); ctx.stroke();
    }
    L.topicos.forEach(function (b) {
      ctx.fillStyle = cores.surface2; ctx.fillRect(b.x, b.y, b.w, b.h);
      if (b.frac > 0) { ctx.fillStyle = cores.brand; ctx.fillRect(b.x, b.y, Math.round(b.w * b.frac), b.h); }
    });
    ctx.textBaseline = 'alphabetic';
    L.textos.forEach(function (t) {
      ctx.font = t.fonte; ctx.textAlign = t.align; ctx.fillStyle = cores[t.cor];
      ctx.fillText(t.texto, t.x, t.y);
    });
  }

  /* res = resultado do pontuar() + nivel. Devolve {blob, file, url, tema} */
  function gerarPNG(res) {
    var d = root.document;
    return fontesProntas(1500).then(function () {
      var canvas = d.createElement('canvas');
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext('2d');
      var cores = coresDoTema();
      var agora = res.data ? new Date(res.data) : new Date();
      var L = layoutResultado(res, function (t, f) { ctx.font = f; return ctx.measureText(t).width; }, agora);
      desenhar(ctx, L, cores);
      return new Promise(function (ok, erro) {
        canvas.toBlob(function (blob) {
          if (!blob) { erro(new Error('toBlob vazio')); return; }
          var nome = nomeArquivo(res, agora);
          ok({ blob: blob, file: new root.File([blob], nome, { type: 'image/png' }), url: root.URL.createObjectURL(blob), tema: EO.theme && EO.theme.get ? EO.theme.get() : 'light' });
        }, 'image/png');
      });
    });
  }

  function suportaArquivo() {
    try {
      var n = root.navigator;
      return !!(n && typeof n.share === 'function' && typeof n.canShare === 'function' &&
        n.canShare({ files: [new root.File([''], 'x.png', { type: 'image/png' })] }));
    } catch (e) { return false; }
  }

  /* navigator.share e a PRIMEIRA chamada assincrona (ativacao do usuario); devolve a promise do share */
  function compartilhar(cache, texto) {
    var n = root.navigator;
    if (!n || typeof n.share !== 'function') return Promise.reject(new Error('sem-share'));
    try {
      return n.share({ files: [cache.file], title: 'Resultado do quiz', text: texto });
    } catch (e) { return Promise.reject(e); }
  }

  function baixar(blob, nome) {
    var d = root.document;
    var url = root.URL.createObjectURL(blob);
    var a = d.createElement('a');
    a.href = url; a.download = nome; a.style.display = 'none';
    d.body.appendChild(a); a.click(); d.body.removeChild(a);
    setTimeout(function () { root.URL.revokeObjectURL(url); }, 1000);
  }

  /* clipboard -> execCommand -> 'manual' (a UI mostra o texto selecionado). Devolve 'clipboard'|'execCommand'|'manual' */
  function copiarTexto(txt) {
    var d = root.document, n = root.navigator;
    function viaExec() {
      try {
        var ta = d.createElement('textarea');
        ta.value = txt; ta.setAttribute('readonly', ''); ta.setAttribute('aria-hidden', 'true');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        d.body.appendChild(ta); ta.select();
        var ok = d.execCommand && d.execCommand('copy');
        d.body.removeChild(ta);
        return ok ? 'execCommand' : 'manual';
      } catch (e) { return 'manual'; }
    }
    if (n && n.clipboard && typeof n.clipboard.writeText === 'function') {
      try {
        return n.clipboard.writeText(txt).then(function () { return 'clipboard'; }, function () { return viaExec(); });
      } catch (e) { /* cai para execCommand */ }
    }
    return Promise.resolve(viaExec());
  }

  var share = {
    W: W, H: H,
    textoResultado: textoResultado, nomeArquivo: nomeArquivo, layoutResultado: layoutResultado,
    coresDoTema: coresDoTema, fontesProntas: fontesProntas, desenhar: desenhar, gerarPNG: gerarPNG,
    suportaArquivo: suportaArquivo, compartilhar: compartilhar, baixar: baixar, copiarTexto: copiarTexto
  };
  P.share = share;
  if (typeof module !== 'undefined' && module.exports) module.exports = share;
})(typeof window !== 'undefined' ? window : globalThis);
