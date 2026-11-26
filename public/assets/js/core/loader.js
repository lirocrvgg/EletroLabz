/* Carregador de bibliotecas de terceiros: tenta a copia local (assets/vendor) e,
   se falhar, cai na CDN original. Caminhos relativos a pagina (todas em public/). */
window.EO = window.EO || {};
(function (EO) {
  var REG = {
    xlsx: { test: function () { return window.XLSX; },
      local: 'assets/vendor/xlsx-js-style-1.2.0.bundle.js',
      cdn: 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js' },
    jspdf: { test: function () { return window.jspdf && window.jspdf.jsPDF; },
      local: 'assets/vendor/jspdf-2.5.1.umd.min.js',
      cdn: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' },
    jszip: { test: function () { return window.JSZip; },
      local: 'assets/vendor/jszip-3.10.1.min.js',
      cdn: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js' },
    docx: { test: function () { return window.docx; },
      local: 'assets/vendor/docx-7.8.2.js',
      cdn: 'https://unpkg.com/docx@7.8.2/build/index.js' },
    filesaver: { test: function () { return window.saveAs; },
      local: 'assets/vendor/FileSaver-2.0.5.min.js',
      cdn: 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js' },
    /* docx-preview 0.3.2 expoe o global `docx`, que colide com o exportador (docx 7.8.2).
       before/after guardam e restauram window.docx logo apos a carga; o visualizador fica em window.docx_preview. */
    docxpreview: { test: function () { return window.docx_preview; },
      local: 'assets/vendor/docx-preview-0.3.2.min.js',
      cdn: 'https://cdn.jsdelivr.net/npm/docx-preview@0.3.2/dist/docx-preview.min.js',
      before: function (st) { st.exporter = window.docx; },
      after: function (st) { window.docx_preview = window.docx_preview || window.docx; window.docx = st.exporter; } },
    /* pdf.js: workerSrc acompanha a origem de onde a biblioteca foi carregada. */
    pdfjs: { test: function () { return window.pdfjsLib; },
      local: 'assets/vendor/pdfjs-3.11.174.min.js',
      cdn: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      workerLocal: 'assets/vendor/pdfjs-3.11.174.worker.min.js',
      workerCdn: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
      after: function (st, origem) {
        var w = origem === 'local' ? new URL(this.workerLocal, document.baseURI).href : this.workerCdn;
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = w;
      } }
  };
  var cache = {};
  function inject(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { res(); };
      s.onerror = function () { s.remove(); rej(new Error('Falha ao carregar ' + src)); };
      document.head.appendChild(s);
    });
  }
  /* Resolve com 'local' | 'cdn' (origem da carga) ou 'ja-carregada'. */
  EO.load = function (nome) {
    var r = REG[nome];
    if (!r) return Promise.reject(new Error('Biblioteca desconhecida: ' + nome));
    if (r.test()) return Promise.resolve('ja-carregada');
    if (cache[nome]) return cache[nome];
    var st = {}, origem = 'local';
    if (r.before) r.before(st);
    var p = inject(r.local).catch(function () { origem = 'cdn'; return inject(r.cdn); }).then(function () {
      if (r.after) r.after(st, origem);
      if (!r.test()) throw new Error('Biblioteca ' + nome + ' carregada mas indisponivel');
      return origem;
    });
    p.catch(function () { delete cache[nome]; }); // permite nova tentativa
    cache[nome] = p;
    return p;
  };
  EO.libs = REG;
})(window.EO);
