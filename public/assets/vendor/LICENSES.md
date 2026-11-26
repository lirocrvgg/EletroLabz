# Bibliotecas de terceiros (vendorizadas)

Baixadas em 2026-11-23 (docx-preview e pdf.js na mesma data, com nova autorização) a partir das mesmas URLs/versões já usadas pelo site, com autorização do usuário.
Servem para que exportações e fórmulas funcionem sem internet. Não editar estes arquivos.

| Arquivo | Versão | Origem | Licença |
|---|---|---|---|
| docx-7.8.2.js | 7.8.2 | https://unpkg.com/docx@7.8.2/build/index.js | MIT |
| jszip-3.10.1.min.js | 3.10.1 | https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js | MIT ou GPLv3 (dupla; usada sob MIT) |
| FileSaver-2.0.5.min.js | 2.0.5 | https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js | MIT |
| xlsx-js-style-1.2.0.bundle.js | 1.2.0 (SheetJS CE 0.18.5) | https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js | Apache-2.0 |
| jspdf-2.5.1.umd.min.js | 2.5.1 | https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js | MIT |
| mathjax-3.2.2-tex-svg-full.js | 3.2.2 | https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js | Apache-2.0 |
| docx-preview-0.3.2.min.js | 0.3.2 | https://cdn.jsdelivr.net/npm/docx-preview@0.3.2/dist/docx-preview.min.js | Apache-2.0 |
| pdfjs-3.11.174.min.js | 3.11.174 | https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js | Apache-2.0 |
| pdfjs-3.11.174.worker.min.js | 3.11.174 | https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js | Apache-2.0 |

Observação: o site usava `mathjax@3/es5/tex-mml-chtml.js` (sem versão fixa, saída CHTML com fontes baixadas da CDN). A versão local é `tex-svg-full` 3.2.2 (arquivo único, saída SVG, funciona offline).

## SHA-256
```
c68874cbaa2fd1650b7d770b328680ea765fb3376023cc3608427fde4f0d0481 *FileSaver-2.0.5.min.js
db49ebb70f85fff8c738deb0e3f2bd5dee5d5f8f37884c0b39158205e0729fd6 *docx-7.8.2.js
95c458b73a718ca96b511b7e712f0b743fe4284502b9ffaea5afdde96ba3036a *docx-preview-0.3.2.min.js
98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875 *jspdf-2.5.1.umd.min.js
acc7e41455a80765b5fd9c7ee1b8078a6d160bbbca455aeae854de65c947d59e *jszip-3.10.1.min.js
a4354ff94fd868aea0cc6eaaa79a57fda0588646fc46ee3700a349ee0a11cbe6 *mathjax-3.2.2-tex-svg-full.js
5b5799e6f8c680663207ac5b42ee14eed2a406fa7af48f50c154f0c0b1566946 *pdfjs-3.11.174.min.js
feabdf309770ed24bba31a5467836cdc8cf639c705af27d52b585b041bb8527b *pdfjs-3.11.174.worker.min.js
1c7abf2993ff2cd61e508f9268e9acda0098c9796f3925d2ba0d2579072653e2 *xlsx-js-style-1.2.0.bundle.js
```
