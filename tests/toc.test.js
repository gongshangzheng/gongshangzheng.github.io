/**
 * TOC (Table of Contents) unit tests
 * Run with: node tests/run.js
 */

const assert = require('assert');
const { processHeadings, buildTocHtml, buildTocSidebar } = require('../lib/toc');

const tests = {

  // ===== slugify (implicit via processHeadings) =====

  'processHeadings: adds IDs to h2-h6 preserving case': () => {
    const html = `<h2>Introduction</h2><h3>Background</h3><h2>Conclusion</h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="Introduction"'));
    assert(out.includes('id="Background"'));
    assert(out.includes('id="Conclusion"'));
    assert.equal(headings.length, 3);
  },

  'processHeadings: CJK characters preserved in IDs': () => {
    const html = `<h2>扩散模型的过程</h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="扩散模型的过程"'), 'CJK ID should be preserved');
    assert.equal(headings[0].id, '扩散模型的过程');
  },

  'processHeadings: duplicate heading IDs deduplicated with counter': () => {
    const html = `<h2>Section</h2><h2>Section</h2>`;
    const { html: out, headings } = processHeadings(html);
    // IDs are case-sensitive (not lowercased) — but duplicates still get -2 suffix
    assert(out.includes('id="Section"'));
    assert(out.includes('id="Section-2"'));
    assert.equal(headings[0].id, 'Section');
    assert.equal(headings[1].id, 'Section-2');
  },

  'processHeadings: strips HTML tags from heading text for slug': () => {
    const html = `<h2><em>Italic</em> and <strong>Bold</strong></h2>`;
    const { html: out, headings } = processHeadings(html);
    // Tags stripped → "Italic and Bold" → "Italic-and-Bold" (case preserved)
    assert(out.includes('id="Italic-and-Bold"'), `Expected id="Italic-and-Bold", got: ${headings[0].id}`);
  },

  'processHeadings: empty heading text is processed (added to headings)': () => {
    const html = `<h2></h2><p>Other</p>`;
    const { html: out, headings } = processHeadings(html);
    // Empty text → slugify returns '' → counter increments → 'section'
    // But empty text still results in a headings entry (text = '')
    assert.equal(headings.length, 1);
    assert.equal(headings[0].text, '');
  },

  'processHeadings: whitespace-only heading gets default id': () => {
    const html = `<h2>   </h2>`;
    const { headings } = processHeadings(html);
    // Whitespace-only text → slugify trims → '' → counter increments → 'section'
    assert.equal(headings.length, 1);
    assert.equal(headings[0].id, 'section');
  },

  'processHeadings: only processes h2-h6 (not h1)': () => {
    const html = `<p>Paragraph</p><h2>Title</h2><h1>Skip H1</h1>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('<p>Paragraph</p>'));
    assert(out.includes('id="Title"'));
    assert.equal(headings.length, 1);
    assert.equal(headings[0].text, 'Title');
  },

  'processHeadings: existing IDs are replaced by generated slugs': () => {
    // Existing id attribute is stripped and replaced with generated slug
    const html = `<h2 id="my-id">Custom ID</h2>`;
    const { html: out } = processHeadings(html);
    assert(out.includes('id="Custom-ID"'));
    assert(!out.includes('id="my-id"'), 'Existing ID should be replaced by slugify');
    // Should not produce double id attributes
    const idCount = (out.match(/\bid="/g) || []).length;
    assert.equal(idCount, 1, 'Should have exactly one id attribute, got: ' + out);
  },

  'processHeadings: .ch-title elements processed as h2': () => {
    const html = `<div class="ch-title">Chapter One</div>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="Chapter-One"'), `Expected id="Chapter-One", got: ${out.substring(0, 100)}`);
    assert.equal(headings[0].level, 2);
    assert.equal(headings[0].text, 'Chapter One');
  },

  // ===== buildTocHtml =====

  'buildTocHtml: empty headings returns empty string': () => {
    const out = buildTocHtml([]);
    assert.equal(out, '');
  },

  'buildTocHtml: single heading': () => {
    const out = buildTocHtml([{ level: 2, text: 'Intro', id: 'Intro' }]);
    assert(out.includes('href="#Intro"'));
    assert(out.includes('>Intro<'));
  },

  'buildTocHtml: nested structure with proper ul nesting': () => {
    const headings = [
      { level: 2, text: 'Chapter 1', id: 'Chapter-1' },
      { level: 3, text: 'Section 1.1', id: 'Section-1-1' },
      { level: 3, text: 'Section 1.2', id: 'Section-1-2' },
      { level: 2, text: 'Chapter 2', id: 'Chapter-2' },
    ];
    const out = buildTocHtml(headings);
    assert(out.includes('href="#Chapter-1"'));
    assert(out.includes('href="#Section-1-1"'));
    assert(out.includes('href="#Chapter-2"'));
    assert(out.includes('<ul>'));
  },

  // ===== buildTocSidebar =====

  'buildTocSidebar: returns sidebar and toggle': () => {
    const headings = [{ level: 2, text: 'Intro', id: 'Intro' }];
    const { sidebar, toggle } = buildTocSidebar(headings);
    assert(sidebar.includes('toc-sidebar'));
    assert(sidebar.includes('href="#Intro"'));
    assert(toggle.includes('toc-toggle-btn'));
  },

  'buildTocSidebar: empty headings returns empty strings': () => {
    const { sidebar, toggle } = buildTocSidebar([]);
    assert.equal(sidebar, '');
    assert.equal(toggle, '');
  },

  'buildTocSidebar: sidebar has correct id/class attributes': () => {
    const { sidebar } = buildTocSidebar([{ level: 2, text: 'Test', id: 'Test' }]);
    assert(sidebar.includes('id="toc-sidebar"'));
    assert(sidebar.includes('class="toc-sidebar'));
    assert(sidebar.includes('toc-header'));
    assert(sidebar.includes('toc-content'));
    assert(sidebar.includes('id="toc-nav"'));
  },

  'buildTocSidebar: toggle is a button with SVG': () => {
    const { toggle } = buildTocSidebar([{ level: 2, text: 'Test', id: 'Test' }]);
    assert(toggle.includes('id="toc-toggle-btn"'));
    assert(toggle.includes('toc-toggle-btn'));
    assert(toggle.includes('<svg'));
  },

  // ===== round-trip: processHeadings + buildTocSidebar =====

  'round-trip: headings survive processHeadings then buildTocSidebar': () => {
    const html = `<h2>First</h2><h3>Sub</h3><h2>Second</h2>`;
    const { headings } = processHeadings(html);
    const { sidebar } = buildTocSidebar(headings);
    assert(sidebar.includes('href="#First"'));
    assert(sidebar.includes('href="#Sub"'));
    assert(sidebar.includes('href="#Second"'));
    assert.equal(headings.length, 3);
  },

  // ===== long heading truncation =====

  'processHeadings: very long heading truncated to 60 chars': () => {
    const longTitle = 'A'.repeat(100);
    const html = `<h2>${longTitle}</h2>`;
    const { headings } = processHeadings(html);
    assert(headings[0].id.length <= 60);
  },

  // ===== .ch-title edge cases =====

  'processHeadings: .ch-title with special characters': () => {
    const html = `<div class="ch-title">AI & ML: 深度学习 (2024)</div>`;
    const { headings } = processHeadings(html);
    assert.equal(headings.length, 1);
    assert.equal(headings[0].level, 2);
    // Colon and parens stripped by slugify, CJK preserved
    assert(headings[0].id.includes('AI'));
    assert(headings[0].id.includes('深度学习'));
  },

  'processHeadings: .ch-title inside .ch fade-in wrapper': () => {
    const html = `<div class="ch fade-in"><div class="ch-label">Chapter 1</div><div class="ch-title">The Title</div><div class="ch-date">2024</div></div>`;
    const { html: out, headings } = processHeadings(html);
    assert.equal(headings.length, 1);
    assert.equal(headings[0].text, 'The Title');
    assert(out.includes('id="The-Title"'));
  },

  // ===== deep heading nesting =====

  'buildTocHtml: deep nesting h2 > h3 > h4 > h5 > h6': () => {
    const headings = [
      { level: 2, text: 'H2', id: 'h2' },
      { level: 3, text: 'H3', id: 'h3' },
      { level: 4, text: 'H4', id: 'h4' },
      { level: 5, text: 'H5', id: 'h5' },
      { level: 6, text: 'H6', id: 'h6' },
    ];
    const out = buildTocHtml(headings);
    assert(out.includes('href="#h2"'));
    assert(out.includes('href="#h6"'));
    // Nested <ul> elements should balance
    const ulCount = out.split('<ul').length - 1;
    const closeUlCount = out.split('</ul>').length - 1;
    assert.equal(ulCount, closeUlCount, 'opening and closing <ul> should match');
    // Every parent should have a toggle button
    const toggleCount = (out.match(/class="toc-toggle"/g) || []).length;
    assert.equal(toggleCount, 4, '4 parent levels (h2-h5) should have toggle buttons');
    // Leaf node (h6) should NOT have a toggle
    const h6Li = out.match(/<li><a[^>]*>H6<\/a><\/li>/);
    assert(h6Li, 'h6 leaf should be a plain <li> without toggle');
  },

  'buildTocHtml: data-level attribute on each link': () => {
    const headings = [
      { level: 2, text: 'H2', id: 'h2' },
      { level: 3, text: 'H3', id: 'h3' },
      { level: 4, text: 'H4', id: 'h4' },
    ];
    const out = buildTocHtml(headings);
    assert(out.includes('data-level="2"'), 'h2 should have data-level=2');
    assert(out.includes('data-level="3"'), 'h3 should have data-level=3');
    assert(out.includes('data-level="4"'), 'h4 should have data-level=4');
  },

  // ===== mixed .ch-title and h2 =====

  'processHeadings: mixed .ch-title and h2 headings in document order': () => {
    // Combined regex processes all heading types in document order
    const html = `<h2>Section Title</h2><div class="ch-title">Chapter Title</div><h3>Subsection</h3>`;
    const { headings } = processHeadings(html);
    assert.equal(headings.length, 3);
    // Document order: h2, ch-title, h3
    assert.equal(headings[0].text, 'Section Title');
    assert.equal(headings[0].level, 2);
    assert.equal(headings[1].text, 'Chapter Title');
    assert.equal(headings[1].level, 2);  // .ch-title → level 2
    assert.equal(headings[2].text, 'Subsection');
    assert.equal(headings[2].level, 3);
  },

  'buildTocSidebar: sidebar contains closing aside tag': () => {
    const { sidebar } = buildTocSidebar([{ level: 2, text: 'Test', id: 'Test' }]);
    assert(sidebar.includes('</aside>'), 'sidebar should be properly closed');
  },

  // ===== tree structure =====

  'buildTocTree: h2 with h3 children': () => {
    const { buildTocTree } = require('../lib/toc');
    const headings = [
      { level: 2, text: 'A', id: 'a' },
      { level: 3, text: 'B', id: 'b' },
      { level: 3, text: 'C', id: 'c' },
      { level: 2, text: 'D', id: 'd' },
    ];
    const tree = buildTocTree(headings);
    assert.equal(tree.length, 2); // two top-level nodes
    assert.equal(tree[0].text, 'A');
    assert.equal(tree[0].children.length, 2); // B, C
    assert.equal(tree[0].children[0].text, 'B');
    assert.equal(tree[1].text, 'D');
    assert.equal(tree[1].children.length, 0);
  },

  'buildTocTree: skipped level (h2 → h4) still nests under h2': () => {
    const { buildTocTree } = require('../lib/toc');
    const headings = [
      { level: 2, text: 'A', id: 'a' },
      { level: 4, text: 'B', id: 'b' },
    ];
    const tree = buildTocTree(headings);
    assert.equal(tree.length, 1);
    assert.equal(tree[0].children.length, 1);
    assert.equal(tree[0].children[0].text, 'B');
    assert.equal(tree[0].children[0].level, 4);
  },

  'buildTocHtml: parent items have toc-parent class and toggle': () => {
    const headings = [
      { level: 2, text: 'Parent', id: 'p' },
      { level: 3, text: 'Child', id: 'c' },
    ];
    const out = buildTocHtml(headings);
    assert(out.includes('class="toc-parent"'), 'parent li should have toc-parent class');
    assert(out.includes('class="toc-toggle"'), 'parent should have toggle button');
    assert(out.includes('toc-children'), 'parent should have children ul');
  },
};

module.exports = { tests, name: 'toc' };