/**
 * TOC (Table of Contents) unit tests
 * Run with: node tests/run.js
 */

const assert = require('assert');
const { processHeadings, buildTocHtml, buildTocSidebar } = require('../lib/toc');

const tests = {

  // ===== slugify (implicit via processHeadings) =====

  'processHeadings: adds IDs to h2-h6': () => {
    const html = `<h2>Introduction</h2><h3>Background</h3><h2>Conclusion</h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="introduction"'));
    assert(out.includes('id="background"'));
    assert(out.includes('id="conclusion"'));
    assert.equal(headings.length, 3);
  },

  'processHeadings: CJK characters preserved in IDs': () => {
    const html = `<h2>扩散模型的过程</h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="扩散模型的过程"'), 'CJK ID should be preserved');
    assert.equal(headings[0].id, '扩散模型的过程');
  },

  'processHeadings: duplicate heading IDs deduplicated': () => {
    const html = `<h2>Section</h2><h2>Section</h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="section"'));
    assert(out.includes('id="section-2"'));
    assert.equal(headings[0].id, 'section');
    assert.equal(headings[1].id, 'section-2');
  },

  'processHeadings: strips HTML tags from heading text for slug': () => {
    const html = `<h2><em>Italic</em> and <strong>Bold</strong></h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="italic-and-bold"'), `ID should be "italic-and-bold", got: ${headings[0].id}`);
  },

  'processHeadings: handles empty headings': () => {
    const html = `<h2></h2>`;
    const { headings } = processHeadings(html);
    assert.equal(headings.length, 0);
  },

  'processHeadings: handles headings with only whitespace': () => {
    const html = `<h2>   </h2>`;
    const { headings } = processHeadings(html);
    assert.equal(headings.length, 0);
  },

  'processHeadings: unknown tags ignored': () => {
    const html = `<p>Paragraph</p><h2>Title</h2>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('<p>Paragraph</p>'));
    assert(out.includes('id="title"'));
    assert.equal(headings.length, 1);
  },

  'processHeadings: preserves existing IDs': () => {
    const html = `<h2 id="my-id">Custom ID</h2>`;
    const { html: out } = processHeadings(html);
    assert(out.includes('id="my-id"'));
  },

  'processHeadings: .ch-title elements processed as h3': () => {
    const html = `<div class="ch-title">Chapter One</div>`;
    const { html: out, headings } = processHeadings(html);
    assert(out.includes('id="chapter-one"'), 'ch-title should get id');
    assert.equal(headings[0].level, 3);
    assert.equal(headings[0].text, 'Chapter One');
  },

  // ===== buildTocHtml =====

  'buildTocHtml: empty headings returns empty string': () => {
    const out = buildTocHtml([]);
    assert.equal(out, '');
  },

  'buildTocHtml: single heading': () => {
    const out = buildTocHtml([{ level: 2, text: 'Intro', id: 'intro' }]);
    assert(out.includes('href="#intro"'));
    assert(out.includes('>Intro<'));
  },

  'buildTocHtml: nested structure': () => {
    const headings = [
      { level: 2, text: 'Chapter 1', id: 'ch1' },
      { level: 3, text: 'Section 1.1', id: 'sec1' },
      { level: 3, text: 'Section 1.2', id: 'sec2' },
      { level: 2, text: 'Chapter 2', id: 'ch2' },
    ];
    const out = buildTocHtml(headings);
    assert(out.includes('href="#ch1"'));
    assert(out.includes('href="#sec1"'));
    assert(out.includes('href="#ch2"'));
    assert(out.includes('<ul>'));
  },

  // ===== buildTocSidebar =====

  'buildTocSidebar: returns sidebar and toggle': () => {
    const headings = [{ level: 2, text: 'Intro', id: 'intro' }];
    const { sidebar, toggle } = buildTocSidebar(headings);
    assert(sidebar.includes('toc-sidebar'));
    assert(sidebar.includes('href="#intro"'));
    assert(toggle.includes('toc-toggle-btn'));
  },

  'buildTocSidebar: empty headings returns empty strings': () => {
    const { sidebar, toggle } = buildTocSidebar([]);
    assert.equal(sidebar, '');
    assert.equal(toggle, '');
  },

  'buildTocSidebar: sidebar has correct structure': () => {
    const { sidebar } = buildTocSidebar([{ level: 2, text: 'Test', id: 'test' }]);
    assert(sidebar.includes('id="toc-sidebar"'));
    assert(sidebar.includes('class="toc-sidebar"'));
    assert(sidebar.includes('toc-header'));
    assert(sidebar.includes('toc-content'));
    assert(sidebar.includes('id="toc-nav"'));
  },

  'buildTocSidebar: toggle is a button with SVG': () => {
    const { toggle } = buildTocSidebar([{ level: 2, text: 'Test', id: 'test' }]);
    assert(toggle.includes('id="toc-toggle-btn"'));
    assert(toggle.includes('toc-toggle-btn'));
    assert(toggle.includes('<svg'));
  },

  // ===== round-trip: processHeadings + buildTocSidebar =====

  'round-trip: headings survive processHeadings then buildTocSidebar': () => {
    const html = `<h2>First</h2><h3>Sub</h3><h2>Second</h2>`;
    const { headings } = processHeadings(html);
    const { sidebar } = buildTocSidebar(headings);
    assert(sidebar.includes('href="#first"'));
    assert(sidebar.includes('href="#sub"'));
    assert(sidebar.includes('href="#second"'));
    assert.equal(headings.length, 3);
  },

  // ===== long heading truncation =====

  'processHeadings: very long heading truncated to 60 chars': () => {
    const longTitle = 'A'.repeat(100);
    const html = `<h2>${longTitle}</h2>`;
    const { headings } = processHeadings(html);
    assert(headings[0].id.length <= 60);
  },
};

module.exports = { tests, name: 'toc' };