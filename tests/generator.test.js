/**
 * Generator unit tests — focused on utility functions and known bug fixes.
 * Run with: node tests/run.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { transformLatex, buildArticles, taxonomySlug, categoryUrl, subcategoryUrl } = require('../lib/generator');
const { walkDir } = require('../lib/utils');

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

  'walkDir: finds files at any depth': () => {
    const testDir = '/tmp/walkDir-test-' + Date.now();
    const clean = () => { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true }); };
    clean();
    fs.mkdirSync(testDir + '/a/b/c', { recursive: true });
    fs.writeFileSync(testDir + '/root.md', '');
    fs.writeFileSync(testDir + '/a/x.html', '');
    fs.writeFileSync(testDir + '/a/b/y.md', '');
    fs.writeFileSync(testDir + '/a/b/c/z.html', '');
    fs.writeFileSync(testDir + '/ignored.txt', '');
    fs.mkdirSync(testDir + '/skip'); // empty dir — should be skipped gracefully
    try {
      const files = walkDir(testDir);
      const names = files.map(f => path.basename(f));
      assert(names.includes('root.md'), 'root file');
      assert(names.includes('x.html'), 'nested html');
      assert(names.includes('y.md'), 'deep nested md');
      assert(names.includes('z.html'), 'deep nested html');
      assert(!names.includes('ignored.txt'), 'non .md/.html ignored');
      assert(!names.some(f => f.includes('skip')), 'empty dir not represented');
    } finally { clean(); }
  },

  'walkDir: empty directory returns empty array': () => {
    const testDir = '/tmp/walkDir-empty-' + Date.now();
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true });
    fs.mkdirSync(testDir);
    try {
      const files = walkDir(testDir);
      assert.deepEqual(files, []);
    } finally { fs.rmSync(testDir, { recursive: true }); }
  },

  'walkDir: non-existent directory returns empty array': () => {
    const files = walkDir('/tmp/this-dir-does-not-exist-xyz');
    assert.deepEqual(files, []);
  },

  'walkDir: skips index and about files (slug filtering)': () => {
    // walkDir returns ALL files; filtering index/about is done by the caller
    const testDir = '/tmp/walkDir-skip-' + Date.now();
    const clean = () => { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true }); };
    clean();
    fs.mkdirSync(testDir + '/sub', { recursive: true });
    fs.writeFileSync(testDir + '/index.md', '');
    fs.writeFileSync(testDir + '/about.html', '');
    fs.writeFileSync(testDir + '/sub/regular.md', '');
    fs.writeFileSync(testDir + '/sub/index.md', '');
    fs.writeFileSync(testDir + '/sub/about.html', '');
    try {
      const files = walkDir(testDir);
      const names = files.map(f => path.basename(f));
      // walkDir returns everything — no filtering at this level
      assert(names.includes('regular.md'), 'regular file included');
      assert(names.includes('index.md'), 'walkDir returns index.md (not filtered by walkDir)');
      assert(names.includes('about.html'), 'walkDir returns about.html (not filtered by walkDir)');
      // But files from sub/ should also be present
      assert(names.filter(f => f === 'index.md').length === 2, 'two index.md files from different dirs');
      // After walkDir, caller-level filtering works on basename only
      const regularFiles = files.filter(f => {
        const bn = path.basename(f);
        return !bn.startsWith('index.') && !bn.startsWith('about.');
      });
      assert(regularFiles.length === 1, 'caller filter keeps only regular.md');
      assert(regularFiles[0].endsWith('regular.md'), 'kept file is regular.md from subdir');
    } finally { clean(); }
  },

  'walkDir: slug derivation from nested path is just filename (no dir info)': () => {
    const testDir = '/tmp/walkDir-slug-' + Date.now();
    const clean = () => { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true }); };
    clean();
    fs.mkdirSync(testDir + '/a/b', { recursive: true });
    fs.writeFileSync(testDir + '/a/b/my-article.html', '');
    fs.writeFileSync(testDir + '/a/b/index.md', '');
    fs.writeFileSync(testDir + '/a/b/about.html', '');
    try {
      const files = walkDir(testDir);
      const regularFiles = files.filter(f => {
        const bn = path.basename(f);
        return !bn.startsWith('index.') && !bn.startsWith('about.');
      });
      regularFiles.forEach(f => {
        const slug = path.basename(f, path.extname(f));
        assert(!slug.includes('/'), 'slug should be just filename without path');
      });
      assert(regularFiles.some(f => path.basename(f) === 'my-article.html'), 'nested file found');
    } finally { clean(); }
  },

  'walkDir: sorted order (depth-first, files within same dir sorted alphabetically)': () => {
    const testDir = '/tmp/walkDir-order-' + Date.now();
    const clean = () => { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true }); };
    clean();
    fs.mkdirSync(testDir + '/z', { recursive: true });
    fs.mkdirSync(testDir + '/a', { recursive: true });
    fs.writeFileSync(testDir + '/aaa.md', '');
    fs.writeFileSync(testDir + '/zzz.html', '');
    fs.writeFileSync(testDir + '/z/zz.md', '');
    fs.writeFileSync(testDir + '/a/aa.md', '');
    try {
      const files = walkDir(testDir);
      const names = files.map(f => path.basename(f));
      assert(names.indexOf('aaa.md') < names.indexOf('zzz.html'), 'root files sorted');
      assert(names.indexOf('aa.md') < names.indexOf('zz.md'), 'subdir files sorted');
    } finally { clean(); }
  },

  'walkDir: buildArticles integration — slug uniqueness check': () => {
    const testDir = '/tmp/walkDir-dupslug-' + Date.now();
    const clean = () => { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true }); };
    clean();
    fs.mkdirSync(testDir + '/sub', { recursive: true });
    // Two files with same base name in different dirs → same slug → both found
    fs.writeFileSync(testDir + '/my-article.html', '---\ntitle: Article A\ndate: 2025-01-01\n---\nA');
    fs.writeFileSync(testDir + '/sub/my-article.html', '---\ntitle: Article B\ndate: 2025-01-02\n---\nB');
    try {
      const files = walkDir(testDir);
      const regularFiles = files.filter(f => {
        const bn = path.basename(f);
        return !bn.startsWith('index.') && !bn.startsWith('about.');
      });
      // Both files should be found (walkDir does NOT deduplicate)
      assert.equal(regularFiles.length, 2, 'both nested files found');
      const slugs = regularFiles.map(f => path.basename(f, path.extname(f)));
      assert.equal(slugs[0], slugs[1], 'same slug from different dirs');
    } finally { clean(); }
  },

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

  // ===== taxonomy helpers =====

  'taxonomySlug: handles spaces and unsafe chars': () => {
    assert.equal(taxonomySlug('Visual Tokenizer'), 'Visual-Tokenizer');
    assert.equal(taxonomySlug('AI/ML'), 'AI-ML');
    assert.equal(taxonomySlug('Diffusion?Models%2026'), 'Diffusion-Models-2026');
  },

  'categoryUrl: uses taxonomy slug': () => {
    assert.equal(categoryUrl('Visual AI'), './categories/Visual-AI.html');
  },

  'subcategoryUrl: nests subcategory under category': () => {
    assert.equal(subcategoryUrl('AI', 'Visual Tokenizer'), './categories/AI/Visual-Tokenizer.html');
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
// ===== MathJax rendering =====

  'MathJax: inline dollar wrapped and delimiters preserved': () => {
    const result = transformLatex('<p>Solve $x_1 \\sim p_1$ first.</p>');
    assert(result.includes('<span class="math-inline">$x_1 \\sim p_1$</span>'),
      'inline math delimiters are preserved for MathJax');
  },

  'MathJax: display double-dollar protected from inline pass': () => {
    const result = transformLatex('$$\\| r_k - z \\|_2$$');
    assert.equal(result, '<div class="math-block">$$\\| r_k - z \\|_2$$</div>');
  },

  'MathJax: display backslash-bracket converted to display dollar': () => {
    const result = transformLatex('<p>\\[ x_t = (1-t) x_0 + t \\epsilon \\]</p>');
    assert(result.includes('<div class="math-block">$$x_t = (1-t) x_0 + t \\epsilon$$</div>'),
      'display math content preserved');
  },

  'MathJax: inline backslash-paren wrapped and delimiters preserved': () => {
    const result = transformLatex('<p>\\( x_0 \\sim p_0 \\)</p>');
    assert(result.includes('<span class="math-inline">\\( x_0 \\sim p_0 \\)</span>'),
      'paren math delimiters preserved');
  },

  'MathJax: nested dollar inside display math is stripped': () => {
    const result = transformLatex('$$$x_1 + y_1$$$');
    assert.equal(result, '<div class="math-block">$$x_1 + y_1$$</div>');
  },

  'MathJax: short $x$ is math (not citation)': () => {
    const result = transformLatex('<p>Formula $x_1$ and more.</p>');
    assert(result.includes('<span class="math-inline">$x_1$</span>'),
      '$x_1$ should be math');
  },

  'MathJax: maetok display formula is not corrupted by inline pass': () => {
    const result = transformLatex('<p style="text-align:center">$$n\' = \\Theta \\Bigl(\\frac{K^4 d^5 B^6}{\\epsilon^2}\\Bigr)$$</p>');
    // The <p> wrapper is absorbed; text-align is promoted to the <div>
    assert(result.includes('<div class="math-block" style="text-align:center">'), 'display math block should carry text-align from absorbed <p>');
    assert(result.includes('$$n\''), 'formula content preserved');
    assert(!result.includes('$<span class="math-inline">$'), 'display delimiter must not be split into inline math');
  },

  'Term syntax: works when definition contains inline MathJax span': () => {
    const { processBody } = require('../lib/replace');
    const input = '<ul><li><strong>累加</strong> :: <span class="math-inline">$y[n]=\\sum_{k=-\\infty}^{n}x[k]$</span>，相当于离散积分。</li></ul>';
    const result = processBody(input, { imgDir: 'assets/media', baseUrl: '', postMap: {} });
    assert(result.includes('<dl class="term-list">'), 'term syntax should be converted to dl');
    assert(result.includes('<dd><span class="math-inline">$y[n]=\\sum_{k=-\\infty}^{n}x[k]$</span>，相当于离散积分。</dd>'), 'definition should preserve inline math span');
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

  // ===== transformMarkdownTables =====

  'transformMarkdownTables: basic table with header and separator': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>| A | B |</p>\n<p>|---|---|</p>\n<p>| 1 | 2 |</p>';
    const result = transformMarkdownTables(input);
    assert(result.includes('<div class="table-wrap">'), 'should wrap in table-wrap');
    assert(result.includes('<th>A</th>'), 'header A');
    assert(result.includes('<th>B</th>'), 'header B');
    assert(result.includes('<td>1</td>'), 'data cell 1');
    assert(result.includes('<td>2</td>'), 'data cell 2');
    assert(!result.includes('<p>|'), 'no raw pipe rows');
  },

  'transformMarkdownTables: table with inline math in cells': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>| 阶次 $M$ | 精度 $N$ |</p>\n<p>|------|------|</p>\n<p>| 2 | 3 |</p>';
    const result = transformMarkdownTables(input);
    assert(result.includes('<th>阶次 $M$</th>'), 'header preserves $M$');
    assert(result.includes('<th>精度 $N$</th>'), 'header preserves $N$');
    // The $ delimiters are preserved — transformLatex handles them later
  },

  'transformMarkdownTables: table with bold cells': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>| Topic | Method |</p>\n<p>|-------|--------|</p>\n<p>| <strong>IGA</strong> | NURBS |</p>';
    const result = transformMarkdownTables(input);
    assert(result.includes('<td><strong>IGA</strong></td>'), 'bold preserved in cells');
  },

  'transformMarkdownTables: no separator row still works': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>| A | B |</p>\n<p>| 1 | 2 |</p>';
    const result = transformMarkdownTables(input);
    assert(result.includes('<th>A</th>'), 'first row becomes header');
    assert(result.includes('<td>1</td>'), 'second row becomes data');
  },

  'transformMarkdownTables: non-table paragraphs untouched': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>Hello world</p>\n<p>Another paragraph</p>';
    const result = transformMarkdownTables(input);
    assert.equal(result, input, 'non-table content unchanged');
  },

  'transformMarkdownTables: single row still becomes table': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>| Only | Header |</p>';
    const result = transformMarkdownTables(input);
    assert(result.includes('<div class="table-wrap">'), 'single row wrapped');
    assert(result.includes('<th>Only</th>'), 'single row header');
    assert(!result.includes('<tbody>'), 'no tbody for header-only table');
  },

  'transformMarkdownTables: multiple data rows': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>| A | B |</p>\n<p>|---|---|</p>\n<p>| 1 | 2 |</p>\n<p>| 3 | 4 |</p>\n<p>| 5 | 6 |</p>';
    const result = transformMarkdownTables(input);
    const tdCount = (result.match(/<td>/g) || []).length;
    assert.equal(tdCount, 6, 'should have 6 td cells (3 rows x 2 cols)');
  },

  'transformMarkdownTables: table surrounded by content': () => {
    const { transformMarkdownTables } = require('../lib/generator');
    const input = '<p>Before text</p>\n<p>| H |</p>\n<p>|---|</p>\n<p>| D |</p>\n<p>After text</p>';
    const result = transformMarkdownTables(input);
    assert(result.includes('<p>Before text</p>'), 'before content preserved');
    assert(result.includes('<p>After text</p>'), 'after content preserved');
    assert(result.includes('<div class="table-wrap">'), 'table in the middle');
    assert(result.indexOf('<p>Before text</p>') < result.indexOf('<div class="table-wrap">'), 'before comes first');
    assert(result.indexOf('</div>') < result.indexOf('<p>After text</p>'), 'after comes after table');
  },
};

module.exports = { tests, name: 'generator' };