/**
 * Shortcode dependency registry.
 *
 * Maps each shortcode / feature to the CSS and JS assets it requires.
 * generator.js reads this table and auto-injects assets when the
 * detection pattern is found in the rendered page — no manual
 * `css_modules` declaration needed.
 *
 * Fields:
 *   id       – unique key (used for dedup)
 *   detect   – string or [strings]; if ANY appears in page HTML, inject
 *   css      – [strings] relative to assets/ (optional)
 *   js       – [strings] relative to assets/ (optional), injected at </body>
 *   cssTag   – function returning a <link> tag (optional, for CDN etc.)
 *   jsTag    – function returning a <script> tag (optional, for CDN etc.)
 */

const SHORTCODE_DEPS = [
  {
    id: 'mermaid',
    detect: ['class="mermaid"', "class='mermaid"],
    css: ['css/modules/mermaid.css'],
    js:  ['js/mermaid-init.js'],
    cdn: ['https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'],
  },
  {
    id: 'plots-functionplot',
    detect: ['data-functionplot'],
    css: ['css/plots.css'],
    js:  ['js/functionplot-runtime.js'],
  },
  {
    id: 'plots-jsxgraph',
    detect: ['data-jsxgraph'],
    css: ['css/plots.css'],
    js:  ['js/jsxgraph-runtime.js'],
  },
  {
    id: 'docpage-pdf',
    detect: ['data-docpage-pdf='],
    cdn: [
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    ],
    // pdfjs worker + runtime are handled inline in generator.js (needs DOM ready)
  },
];

module.exports = { SHORTCODE_DEPS };
