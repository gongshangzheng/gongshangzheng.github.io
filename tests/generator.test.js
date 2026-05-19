/**
 * Generator unit tests — focused on utility functions and known bug fixes.
 * Run with: node tests/run.js
 */

const assert = require('assert');
const path = require('path');

// Mock fs/marked deps for unit testing
const mockFs = {
  readFileSync: (p, enc) => {
    if (p.endsWith('_base.html')) return `<html><head>{{PAGE_STYLE}}</head><body><!-- INJECT content --></body></html>`;
    return '';
  }
};

// Test helpers — reproduce key functions from generator.js inline for isolation
function extractFirstDiv(html, className) {
  const openTagStart = '<div class="' + className + '"';
  const start = html.indexOf(openTagStart);
  if (start === -1) return { html: '', body: html };
  const gt = html.indexOf('>', start);
  if (gt === -1) return { html: '', body: html };
  let depth = 1, i = gt + 1;
  while (i < html.length && depth > 0) {
    if (html.substring(i, i + 5) === '<div ') { depth++; const g2 = html.indexOf('>', i); i = g2 + 1; }
    else if (html.substring(i, i + 5) === '<div>') { depth++; i += 5; }
    else if (html.substring(i, i + 6) === '</div>') { depth--; i += 6; }
    else i++;
  }
  return { html: html.substring(start, i), body: html.substring(0, start) + html.substring(i) };
}

function parseListField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.startsWith('[')) {
    return val.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  }
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

const tests = {

  // ===== extractFirstDiv =====

  'extractFirstDiv: simple div': () => {
    const html = `<div class="stats"><div class="n">1956</div><div class="l">Dartmouth</div></div><p>Body here</p>`;
    const { html: stats, body } = extractFirstDiv(html, 'stats');
    assert(stats.includes('Dartmouth'));
    assert(body.startsWith('<p>Body'));
    assert(!body.includes('class="stats"'));
  },

  'extractFirstDiv: nested divs': () => {
    const html = `<div class="stats"><div><div class="n">1956</div></div></div><p>Body</p>`;
    const { html: stats } = extractFirstDiv(html, 'stats');
    assert(stats.includes('1956'));
  },

  'extractFirstDiv: not found returns full body': () => {
    const html = `<p>No stats here</p>`;
    const { html: stats, body } = extractFirstDiv(html, 'stats');
    assert.equal(stats, '');
    assert.equal(body, html);
  },

  'extractFirstDiv: stats followed by wrap (the ai-chronicle case)': () => {
    const body = `\n\n<div class="stats">\n  <div><div class="n">1956</div></div>\n</div>\n\n<div class="wrap">\n\n<div class="ch">Content here</div>\n\n</div>\n`;
    const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(body, 'stats');
    // Stats div should NOT include the wrap div (wrap is outside stats)
    assert(statsHtml.includes('<div class="stats">'));
    assert(!statsHtml.includes('<div class="wrap">'));
    // bodyAfterStats starts with the wrap div
    assert(bodyAfterStats.includes('<div class="wrap">'));
    assert(bodyAfterStats.includes('<div class="ch">'));
  },

  'extractFirstDiv: multiple stats divs only removes first': () => {
    const html = `<div class="stats"><div>First</div></div><div class="stats"><div>Second</div></div><p>Body</p>`;
    const { html: statsHtml, body } = extractFirstDiv(html, 'stats');
    assert(statsHtml.includes('First'));
    assert(!statsHtml.includes('Second'));
    assert(body.includes('Second'));
  },

  'extractFirstDiv: handles div with class+attributes': () => {
    // test uses data-id attribute (not in className), openTag matches class first
    const html = `<div class="stats" data-id="x"><div class="n">1956</div></div><p>Body</p>`;
    const { html: stats } = extractFirstDiv(html, 'stats');
    assert(stats.includes('1956'), 'stats should include 1956, got: ' + stats);
  },

  // ===== startsWithWrap detection (the bug fix) =====

  'startsWithWrap: body that starts with wrap div': () => {
    const bodyAfterStats = `\n\n\n<div class="wrap">\n\n<div class="ch">Content</div>\n\n</div>\n`;
    const startsWithWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);
    assert(startsWithWrap);
  },

  'startsWithWrap: body that has no wrap div at start': () => {
    const bodyAfterStats = `<p>Regular content without a wrap at start</p><div class="wrap">...</div>`;
    const startsWithWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);
    assert(!startsWithWrap);
  },

  'startsWithWrap: empty body': () => {
    const startsWithWrap = /^\s*<div class="wrap">/i.test('');
    assert(!startsWithWrap);
  },

  // ===== buildArticleMeta (reproduce key logic) =====

  'buildArticleMeta: with date and tags': () => {
    const fm = { date: '2025-01-21', tags: '[AI, History]', categories: '[]' };
    const tags = parseListField(fm.tags);
    const cats = parseListField(fm.categories);
    assert.deepEqual(tags, ['AI', 'History']);
    assert.deepEqual(cats, []);
  },

  'buildArticleMeta: with categories': () => {
    const fm = { date: '2025-01-21', tags: '[]', categories: '[AI, Tech]' };
    const cats = parseListField(fm.categories);
    assert.deepEqual(cats, ['AI', 'Tech']);
  },

  'buildArticleMeta: empty frontmatter': () => {
    const fm = {};
    const tags = parseListField(fm.tags);
    const cats = parseListField(fm.categories);
    assert.deepEqual(tags, []);
    assert.deepEqual(cats, []);
  },

  // ===== contentHtml construction (reproduce the fix) =====

  'contentHtml: with startsWithWrap=true uses existing wrap': () => {
    const bodyHtml = `\n\n\n<div class="wrap">\n\n<div class="ch">Content</div>\n\n</div>\n`;
    const startsWithWrap = /^\s*<div class="wrap">/i.test(bodyHtml);
    const hero = '<div class="hero"></div>';
    const statsHtml = '';
    const articleMeta = '<div class="article-meta"></div>';
    const articleFooter = '';

    let contentHtml;
    if (startsWithWrap) {
      // Fixed: reuse existing wrap, don't add another
      contentHtml = `${hero}${statsHtml}${articleMeta}${bodyHtml}${articleFooter}`;
    } else {
      contentHtml = `${hero}${statsHtml}<div class="wrap">${articleMeta}${bodyHtml}${articleFooter}</div>`;
    }

    const wraps = contentHtml.split('<div class="wrap">').length - 1;
    assert.equal(wraps, 1, 'Should have exactly 1 wrap, got ' + wraps);
  },

  'contentHtml: without startsWithWrap adds outer wrap': () => {
    const bodyHtml = `<p>Regular content without a wrap</p>`;
    const startsWithWrap = /^\s*<div class="wrap">/i.test(bodyHtml);
    const hero = '<div class="hero"></div>';
    const statsHtml = '';
    const articleMeta = '<div class="article-meta"></div>';
    const articleFooter = '';

    let contentHtml;
    if (startsWithWrap) {
      contentHtml = `${hero}${statsHtml}${articleMeta}${bodyHtml}${articleFooter}`;
    } else {
      contentHtml = `${hero}${statsHtml}<div class="wrap">${articleMeta}${bodyHtml}${articleFooter}</div>`;
    }

    const wraps = contentHtml.split('<div class="wrap">').length - 1;
    assert.equal(wraps, 1, 'Should have exactly 1 wrap, got ' + wraps);
  },

  // ===== MathJax injection fix =====

  'MathJax: injectStr does not contain standalone </head>': () => {
    const injectStr = `<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script>
window.MathJax = {
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']] },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
};
</script>
</head>`;

    // The injectStr ends with </head>\n (NOT standalone </head>)
    // So using </head>\n as anchor avoids double-matching
    assert(injectStr.endsWith('</head>'));
    // Count standalone </head> (not preceded by newline)
    const standaloneCount = (injectStr.match(/(?<!\n)<\/head>/g) || []).length;
    assert.equal(standaloneCount, 0, 'injectStr should not contain standalone </head>');
  },

  'MathJax: replace with </head>\\n anchor works correctly': () => {
    const page = `<html><head><style>{{PAGE_STYLE}}</style></head>
<body><p>Content</p></body></html>`;

    const injectStr = `<script>MathJax here</script>
</head>`;

    // Using </head>\n as anchor
    const idx = page.indexOf('</head>\n');
    assert(idx >= 0, 'Should find </head>\\n in page');

    const newPage = page.slice(0, idx) + injectStr + page.slice(idx + 8);
    assert.equal(newPage.split('<head>').length - 1, 1);
    assert.equal(newPage.split('</head>').length - 1, 1);
    assert(!newPage.includes('MathJax MathJax'));
  },

  // ===== parseListField edge cases =====

  'parseListField: single item array': () => {
    assert.deepEqual(parseListField('[AI]'), ['AI']);
  },

  'parseListField: array with empty items': () => {
    assert.deepEqual(parseListField('[AI, , History]'), ['AI', 'History']);
  },

  'parseListField: quoted items in YAML array': () => {
    assert.deepEqual(parseListField('["C", "lisp", "rust"]'), ['C', 'lisp', 'rust']);
  },

  'parseListField: mixed quotes': () => {
    assert.deepEqual(parseListField('["C", lisp, rust]'), ['C', 'lisp', 'rust']);
  },

  'parseListField: already array returns as-is': () => {
    const arr = ['a', 'b'];
    assert.strictEqual(parseListField(arr), arr);
  },

  // ===== extractFirstDiv: attribute edge cases =====

  'extractFirstDiv: div with multiple extra attributes': () => {
    const html = `<div class="stats" id="s1" data-x="y" role="img"><div class="n">1956</div></div><p>Body</p>`;
    const { html: stats, body } = extractFirstDiv(html, 'stats');
    assert(stats.includes('1956'), 'should extract content from div with multiple attrs');
    assert(!body.includes('class="stats"'));
    assert(body.includes('<p>Body</p>'));
  },

  'extractFirstDiv: class must match exactly (not partial)': () => {
    // <div class="stats-extra"> should NOT match 'stats'
    const html = `<div class="stats-extra"><div>Wrong</div></div><p>Body</p>`;
    const { html: stats } = extractFirstDiv(html, 'stats');
    assert.equal(stats, '', 'partial class match should return empty');
  },

  'extractFirstDiv: deeply nested divs counted correctly': () => {
    const html = `<div class="stats"><div><div><div>Deep</div></div></div></div><p>After</p>`;
    const { html: stats, body } = extractFirstDiv(html, 'stats');
    assert(stats.includes('Deep'), 'should extract all nested content');
    assert(body.trim().startsWith('<p>After</p>'));
  },

  'extractFirstDiv: handles newlines and whitespace': () => {
    const html = `\n  <div class="stats">\n    <div class="n">1956</div>\n  </div>\n<p>Body</p>`;
    const { html: stats, body } = extractFirstDiv(html, 'stats');
    assert(stats.includes('1956'));
    assert(body.includes('<p>Body</p>'));
    assert(!body.includes('stats'));
  },

  // ===== layout construction: the core bug fix =====

  'layout: no-source-wrap wraps stats + meta + body together': () => {
    // Simulates us-financial-hegemony: no .wrap in source, .stats at top
    const bodyHtml = `\n<div class="stats">\n  <div><div class="n">1944</div></div>\n</div>\n\n<div class="ch">Content</div>\n`;

    const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(bodyHtml, 'stats');
    const hasSourceWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);

    const hero = '<div class="hero"></div>';
    const meta = '<div class="article-meta"></div>';
    const footer = '<div class="article-footer"></div>';

    let contentHtml;
    if (hasSourceWrap) {
      contentHtml = `${hero}${statsHtml}${meta}${bodyAfterStats}${footer}`;
    } else {
      contentHtml = `${hero}<div class="wrap">${statsHtml}${meta}${bodyAfterStats}${footer}</div>`;
    }

    // stats should be INSIDE wrap (same padding as content)
    assert(contentHtml.includes('<div class="wrap"><div class="stats">'),
      'stats should be inside wrap when no source wrap');
    // meta should be inside wrap and content should also be inside wrap
    const wrapStart = contentHtml.indexOf('<div class="wrap">');
    const wrapEnd = contentHtml.lastIndexOf('</div>');
    const wrapContent = contentHtml.slice(wrapStart, wrapEnd);
    assert(wrapContent.includes('article-meta'), 'meta should be inside wrap');
    assert(wrapContent.includes('<div class="ch">Content</div>'), 'ch content should be inside wrap');
    // meta should come BEFORE ch content in the wrap
    assert(wrapContent.indexOf('article-meta') < wrapContent.indexOf('<div class="ch">'),
      'meta should be before ch content inside wrap');
  },

  'layout: source-wrap keeps stats outside, meta before wrap': () => {
    // Simulates ai-chronicle: has .wrap in source after stats
    const bodyHtml = `\n<div class="stats">\n  <div><div class="n">1956</div></div>\n</div>\n\n<div class="wrap">\n\n<div class="ch">Content</div>\n\n</div>\n`;

    const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(bodyHtml, 'stats');
    const hasSourceWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);

    const hero = '<div class="hero"></div>';
    const meta = '<div class="article-meta"></div>';
    const footer = '<div class="article-footer"></div>';

    let contentHtml;
    if (hasSourceWrap) {
      contentHtml = `${hero}${statsHtml}${meta}${bodyAfterStats}${footer}`;
    } else {
      contentHtml = `${hero}<div class="wrap">${statsHtml}${meta}${bodyAfterStats}${footer}</div>`;
    }

    // stats should be OUTSIDE wrap (extracted and placed before it)
    assert(contentHtml.includes('</div><div class="article-meta"></div>'),
      'meta should be between stats and wrap');
    assert(contentHtml.includes('<div class="wrap">'),
      'source wrap should be preserved');
    // Exactly one wrap div
    const wrapCount = contentHtml.split('<div class="wrap">').length - 1;
    assert.equal(wrapCount, 1, 'should have exactly 1 wrap div');
  },

  'layout: no stats no wrap still wraps correctly': () => {
    // Article with no .stats and no source .wrap
    const bodyHtml = `\n<div class="ch">Content</div>\n`;

    const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(bodyHtml, 'stats');
    const hasSourceWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);

    const hero = '<div class="hero"></div>';
    const meta = '<div class="article-meta"></div>';
    const footer = '<div class="article-footer"></div>';

    let contentHtml;
    if (hasSourceWrap) {
      contentHtml = `${hero}${statsHtml}${meta}${bodyAfterStats}${footer}`;
    } else {
      contentHtml = `${hero}<div class="wrap">${statsHtml}${meta}${bodyAfterStats}${footer}</div>`;
    }

    assert.equal(statsHtml, '', 'no stats should give empty statsHtml');
    assert(contentHtml.includes('<div class="wrap"><div class="article-meta">'),
      'meta should be first thing inside wrap');
    // Verify ch is between wrap open and close
    const wrapOpen = contentHtml.indexOf('<div class="wrap">');
    const wrapClose = contentHtml.lastIndexOf('</div>');
    const inside = contentHtml.slice(wrapOpen, wrapClose);
    assert(inside.includes('<div class="ch">Content</div>'),
      'content should be inside wrap');
  },

  'layout: stats extraction does not affect hasSourceWrap detection': () => {
    // The core bug: after extracting stats, bodyAfterStats should start with .wrap
    const body = `\n<div class="stats">\n  <div><div class="n">1956</div></div>\n</div>\n\n<div class="wrap">\n\n<div class="ch">Content</div>\n\n</div>\n`;

    // Step 1: extract stats
    const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(body, 'stats');

    // Step 2: check hasSourceWrap on bodyAfterStats (NOT on original body)
    const hasSourceWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);

    assert(hasSourceWrap, 'after stats extraction, body should start with .wrap');
    assert(statsHtml.includes('1956'), 'stats should contain the stats content');
    assert(!bodyAfterStats.includes('class="stats"'), 'body should not contain stats anymore');
  },
// ===== MathJax script[type=math/tex] rendering =====

  'MathJax: inline dollar wrapped in script type=math/tex': () => {
    const bodyHtml = '<p>Solve $x_1 \\sim p_1$ first.</p>';
    const result = bodyHtml.replace(
      /\$([^\$\n]+?)\$/g,
      function(_, latex) {
        return '<span class="math-inline"><script type="math/tex">' + latex + '</script></span>';
      }
    );
    assert(result.includes('<script type="math/tex">x_1 \\sim p_1</script>'),
      'inline math in script tag');
    assert(result.includes('<span class="math-inline">'),
      'wrapped in span');
  },

  'MathJax: display double-dollar wrapped in script type=math/tex; mode=display': () => {
    const bodyHtml = '$$\\| r_k - z \\|_2$$';
    const result = bodyHtml.replace(
      /\$\$([\s\S]+?)\$\$/g,
      function(_, latex) {
        var clean = latex.replace(/\$([^$]*)\$/g, '$1');
        return '<div class="math-block"><script type="math/tex; mode=display">' + clean + '</script></div>';
      }
    );
    assert(result.includes('type="math/tex; mode=display"'), 'mode=display attr');
    assert(result.includes('<div class="math-block">'), 'in math-block div');
    assert(!result.includes('$$'), 'no $$ left');
  },

  'MathJax: display backslash-bracket wrapped in script type=math/tex; mode=display': () => {
    const bodyHtml = '<p>\\[ x_t = (1-t) x_0 + t \\epsilon \\]</p>';
    const result = bodyHtml.replace(
      /\\\[\s*([\s\S]+?)\\\]/g,
      function(_, latex) {
        var clean = latex.replace(/\$([^$]*)\$/g, '$1');
        return '<div class="math-block"><script type="math/tex; mode=display">' + clean + '</script></div>';
      }
    );
    assert(result.includes('type="math/tex; mode=display"'), 'mode=display');
    assert(result.includes('x_t = (1-t) x_0'), 'content preserved');
  },

  'MathJax: inline backslash-paren wrapped in script type=math/tex': () => {
    const bodyHtml = '<p>\\( x_0 \\sim p_0 \\)</p>';
    const result = bodyHtml.replace(
      /\\\((.*?)\\\)/g,
      function(_, latex) {
        return '<span class="math-inline"><script type="math/tex">' + latex + '</script></span>';
      }
    );
    assert(result.includes('<script type="math/tex"> x_0 \\sim p_0 </script>'),
      'paren math in script tag');
  },

  'MathJax: nested dollar inside display math is stripped': () => {
    const bodyHtml = '$$\\| r_k - z \\|_2$$';
    const result = bodyHtml.replace(
      /\$\$([\s\S]+?)\$\$/g,
      function(_, latex) {
        var clean = latex.replace(/\$([^$]*)\$/g, '$1');
        return '<div class="math-block"><script type="math/tex; mode=display">' + clean + '</script></div>';
      }
    );
    assert(!result.includes('$\\|'), 'inner dollar stripped');
    assert(result.includes('\\|_2'), 'content preserved');
  },

  'MathJax: short $x$ is math (not citation)': () => {
    const bodyHtml = '<p>Formula $x_1$ and more.</p>';
    const mathResult = bodyHtml.replace(
      /\$([^\$\n]+?)\$/g,
      function(_, latex) {
        return '<span class="math-inline"><script type="math/tex">' + latex + '</script></span>';
      }
    );
    assert(mathResult.includes('<script type="math/tex">x_1</script>'),
      '$x_1$ should be math');
  },

  'MathJax: config injected before </head>\\n anchor': () => {
    const page = '<html><head>\n<title>Test</title>\n</head>\n<body><p>C</p></body>\n</html>';
    const mjConfig = '<script>\nwindow.MathJax = { };\n</script>';
    const mjScript = '<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>';
    const headEndIdx = page.indexOf('</head>\n');
    assert(headEndIdx >= 0, 'find </head>\\n anchor');
    var newPage = page.slice(0, headEndIdx) + mjConfig + mjScript + '\n</head>\n' + page.slice(headEndIdx + 8);
    assert(newPage.includes('<title>Test</title>\n<script>\nwindow.MathJax'), 'config inside head');
    assert(newPage.includes('cdn.jsdelivr.net/npm/mathjax@3'), 'cdn script present');
    assert(newPage.split('</head>').length === 2, 'only one </head>');
  },
};

module.exports = { tests, name: 'generator' };