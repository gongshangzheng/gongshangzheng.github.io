const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { render, parseListField } = require('./parser');
const { writePublic, walkDir } = require('./utils');
const { processHeadings, buildTocSidebar } = require('./toc');
const { processBody: applyReplacements, processShortcodes } = require('./replace');
const { SHORTCODE_DEPS } = require('./config');
const { createTaxonomyResolver } = require('./taxonomy');
const { transformLatex } = require('./math');

// ── Sortable List Component ──────────────────────────────────────────────
const SORTABLE_LIST_CSS = `<style>
  .sortable-list { margin-bottom: 2rem; }
  .sortable-list .sort-controls {
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .sortable-list .sort-controls .label { font-size: 0.85rem; color: var(--text-muted); }
  .sortable-list .sort-btn {
    background: none; border: 1px solid var(--border); border-radius: 4px;
    padding: 4px 10px; font-size: 0.8rem; color: var(--text-muted); cursor: pointer;
    transition: all 0.2s;
  }
  .sortable-list .sort-btn:hover { border-color: var(--accent); color: var(--accent); }
  .sortable-list .sort-btn.active { background: var(--accent); color: var(--bg-body); border-color: var(--accent); }
  .sortable-list .post-count { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
  .sortable-list .pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 0.5rem; margin-top: 2rem; flex-wrap: wrap;
  }
  .sortable-list .page-btn {
    background: none; border: 1px solid var(--border); border-radius: 4px;
    padding: 6px 12px; font-size: 0.85rem; color: var(--text-muted); cursor: pointer;
    transition: all 0.2s;
  }
  .sortable-list .page-btn:hover { border-color: var(--accent); color: var(--accent); }
  .sortable-list .page-btn.active { background: var(--accent); color: var(--bg-body); border-color: var(--accent); }
  .sortable-list .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .sortable-list .page-info { font-size: 0.8rem; color: var(--text-muted); margin: 0 0.5rem; }
</style>`;

let sortableListCounter = 0;

/**
 * Render a sortable + paginated post list.
 * @param {Array} posts - post objects with {title, slug, created_at, updated_at}
 * @param {Object} opts
 * @param {string} opts.linkPrefix - relative path prefix, e.g. '../' or '../../'
 * @param {string} [opts.id] - container element id (auto-generated if omitted)
 * @returns {string} complete HTML string (CSS + wrapper div + inline script)
 */
function renderSortableList(posts, opts) {
  const linkPrefix = (opts && opts.linkPrefix) || '../';
  const id = (opts && opts.id) || 'sortable-' + (++sortableListCounter);
  const data = JSON.stringify(posts.map(p => ({
    title: p.title, slug: p.slug,
    created_at: p.created_at, updated_at: p.updated_at
  })));
  return `${SORTABLE_LIST_CSS}<div class="sortable-list" id="${id}">
  <div class="sort-controls">
    <span class="label">排序：</span>
    <button class="sort-btn active" data-field="created_at" data-dir="desc" data-label="创建时间">创建时间 ↓</button>
    <button class="sort-btn" data-field="updated_at" data-dir="desc" data-label="更新时间">更新时间 ↓</button>
    <button class="sort-btn" data-field="title" data-dir="asc" data-label="标题">标题 ↑</button>
  </div>
  <div class="post-count"></div>
  <div class="post-list-container"></div>
  <div class="pagination"></div>
</div>
<script>(function(){
  var container = document.getElementById('${id}');
  if (!container) return;
  var posts = ${data};
  var PAGE_SIZE = 20;
  var currentField = 'created_at';
  var currentDir = 'desc';
  var currentPage = 1;
  var prefix = ${JSON.stringify(linkPrefix)};
  function sortPosts(arr, field, dir) {
    var s = arr.slice();
    s.sort(function(a, b) {
      var va = a[field], vb = b[field];
      if (va == null) va = ''; if (vb == null) vb = '';
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
    return s;
  }
  function renderPage(sorted) {
    var total = sorted.length;
    var totalPages = Math.ceil(total / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    var start = (currentPage - 1) * PAGE_SIZE;
    var page = sorted.slice(start, start + PAGE_SIZE);
    container.querySelector('.post-count').textContent = total + ' 篇文章';
    var html = '<ul class="post-list">';
    page.forEach(function(p) {
      var d = (p.created_at || '').substring(0, 10);
      html += '<li><span class="date">' + d + '</span><a href="' + prefix + p.slug + '.html">' + p.title + '</a></li>';
    });
    html += '</ul>';
    container.querySelector('.post-list-container').innerHTML = html;
    var phtml = '<button class="page-btn" ' + (currentPage <= 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">← Prev</button>';
    phtml += '<span class="page-info">' + currentPage + ' / ' + totalPages + '</span>';
    phtml += '<button class="page-btn" ' + (currentPage >= totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">Next →</button>';
    container.querySelector('.pagination').innerHTML = phtml;
    container.querySelectorAll('.page-btn[data-page]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentPage = parseInt(btn.dataset.page);
        renderPage(sortPosts(posts, currentField, currentDir));
        window.scrollTo(0, 0);
      });
    });
  }
  renderPage(sortPosts(posts, currentField, currentDir));
  container.querySelectorAll('.sort-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (currentField === btn.dataset.field) currentDir = currentDir === 'asc' ? 'desc' : 'asc';
      else { currentField = btn.dataset.field; currentDir = btn.dataset.dir; }
      currentPage = 1;
      container.querySelectorAll('.sort-btn').forEach(function(b) {
        b.classList.remove('active');
        b.textContent = b.dataset.label + (b.dataset.dir === 'asc' ? ' ↑' : ' ↓');
      });
      btn.classList.add('active');
      btn.textContent = btn.dataset.label + (currentDir === 'asc' ? ' ↑' : ' ↓');
      renderPage(sortPosts(posts, currentField, currentDir));
    });
  });
})();</script>`;
}

/**
 * Render a post-list HTML ul.
 * posts: array of post objects
 * opts: { sort_field: 'created_at'|'updated_at'|'title'|'sub_id',
 *         sort_dir: 'asc'|'desc' }
 */
function renderPostList(posts, opts) {
  var field = (opts && opts.sort_field) || 'created_at';
  var dir = (opts && opts.sort_dir) || 'desc';
  var sorted = posts.slice();
  sorted.sort(function(a, b) {
    var va = a[field];
    var vb = b[field];
    // Handle numeric sub_id
    if (field === 'sub_id' && typeof va === 'number' && typeof vb === 'number') {
      return dir === 'asc' ? va - vb : vb - va;
    }
    // String fields
    if (va == null) va = '';
    if (vb == null) vb = '';
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return '<ul class="post-list">\n' +
    sorted.map(p => `  <li><span class="date">${formatDateTime(p.created_at)}</span><a href="${p.url}">${p.title}</a></li>`).join('\n') +
    '\n</ul>';
}

function loadTemplate(templatesDir, name) {
  return fs.readFileSync(path.join(templatesDir, name), 'utf8');
}

function processIncludes(content, templatesDir) {
  return content.replace(/<!-- INCLUDE (\w+) -->/g, (_, name) => loadTemplate(templatesDir, `_${name}.html`));
}

function assemblePage(templatesDir, contentHtml, context) {
  let page = loadTemplate(templatesDir, '_base.html');
  page = processIncludes(page, templatesDir);
  const headerHtml = loadTemplate(templatesDir, '_header.html');
  page = page.replace('<!-- INJECT header -->', () => render(headerHtml, context));
  page = page.replace('<!-- INJECT content -->', () => contentHtml);
  return render(page, context);
}

function buildHero(fm) {
  const heroTitle = fm.hero_title || fm.title || '';
  const heroSub = fm.hero_sub || '';
  const heroTagline = fm.hero_tagline || '';
  if (!heroTitle) return '';
  return `<div class="hero"><div class="hero-inner"><h1>${heroTitle}</h1>${heroSub ? `<div class="sub">${heroSub}</div>` : ''}${heroTagline ? `<div class="tagline">${heroTagline}</div>` : ''}</div></div>`;
}

function processBody(bodyHtml) {
  return bodyHtml.replace(
    /<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g,
    '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
  );
}

/**
 * Wrap bare text lines with <p> tags.
 * For .html source files, paragraphs may omit <p> tags.
 * This function auto-wraps bare text lines so downstream
 * processors (table detection, term definitions, bullet lists)
 * can rely on <p> tags always being present.
 *
 * Rules:
 *   - Skip empty / whitespace-only lines
 *   - Skip lines starting with '<' (HTML tags)
 *   - Skip lines starting with '{{' (shortcodes)
 *   - Skip lines inside \[ ... \] display math blocks
 *   - Skip lines inside $$ ... $$ display math blocks
 *   - Preserve content inside <pre>, <script>, <style> blocks
 */
function wrapBareParagraphs(bodyHtml) {
  // Save preserved blocks (pre, script, style, table, and their internals)
  var preserved = [];
  var str = bodyHtml;
  str = str.replace(/<(pre|script|style|table)[\s\S]*?<\/\1>/gi, function (match) {
    var ph = '__WP_' + preserved.length + '__';
    preserved.push(match);
    return ph;
  });

  // Process line by line
  var lines = str.split('\n');
  var inDisplayMath = false;
  for (var i = 0; i < lines.length; i++) {
    var trimmed = lines[i].trim();
    if (!trimmed) continue;                // empty line

    // Track \[ ... \] display math blocks (must run BEFORE the '<' skip)
    if (/\\\[/.test(trimmed)) { inDisplayMath = true; }
    if (inDisplayMath) {
      if (/\\\]/.test(trimmed)) { inDisplayMath = false; }
      continue;
    }
    // Track $$ ... $$ display math blocks
    // $$ on its own line opens a display math block
    if (trimmed === '$$') {
      if (!inDisplayMath) { inDisplayMath = true; }
      else { inDisplayMath = false; }
      continue;
    }
    if (inDisplayMath && /\$\$$/.test(trimmed)) {
      inDisplayMath = false; continue;
    }
    if (inDisplayMath) continue;

    if (trimmed.charAt(0) === '<') continue; // HTML tag
    if (trimmed.charAt(0) === '{') continue; // shortcode {{< ... >}}
    if (trimmed.startsWith('__WP_')) continue; // preserved block placeholder

    // Bare text line — wrap with <p>
    var indent = lines[i].match(/^(\s*)/)[1];
    lines[i] = indent + '<p>' + trimmed + '</p>';
  }
  str = lines.join('\n');

  // Restore preserved blocks
  for (var j = 0; j < preserved.length; j++) {
    str = str.replace('__WP_' + j + '__', preserved[j]);
  }
  return str;
}

function estimateReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
  const minutes = Math.max(1, Math.ceil(text.length / 400));
  return minutes + ' min read';
}

/**
 * Transform Markdown-style tables in HTML source to proper <table> elements.
 * Handles consecutive <p>| ... |</p> lines, with optional separator rows.
 *
 * Before:
 *   <p>| A | B |</p>
 *   <p>|---|---|</p>
 *   <p>| 1 | 2 |</p>
 *
 * After:
 *   <div class="table-wrap">
 *   <table><thead><tr><th>A</th><th>B</th></tr></thead>
 *   <tbody><tr><td>1</td><td>2</td></tr></tbody></table>
 *   </div>
 */
function transformMarkdownTables(bodyHtml) {
  // Match one or more consecutive <p>| ... |</p> lines (possibly separated by blank lines)
  return bodyHtml.replace(
    /(?:<p>\|.+\|<\/p>\n?)+/g,
    function (match) {
      // Extract individual rows
      var rowRe = /<p>\|(.+)\|<\/p>/g;
      var rows = [];
      var m;
      while ((m = rowRe.exec(match)) !== null) {
        var cells = m[1].split('|').map(function (c) { return c.trim(); });
        rows.push(cells);
      }
      if (rows.length === 0) return match;

      // Check if second row is a separator (all cells match ^[-:]+$)
      var hasSeparator = rows.length >= 2 &&
        rows[1].every(function (c) { return /^[-:]+$/.test(c); });

      var headerCells = rows[0];
      var dataStartIdx = hasSeparator ? 2 : 1;
      var dataRows = rows.slice(dataStartIdx);

      // Build HTML table
      var html = '<div class="table-wrap">\n<table>\n';

      // Header
      html += '<thead><tr>';
      for (var h = 0; h < headerCells.length; h++) {
        html += '<th>' + headerCells[h] + '</th>';
      }
      html += '</tr></thead>\n';

      // Body
      if (dataRows.length > 0) {
        html += '<tbody>\n';
        for (var r = 0; r < dataRows.length; r++) {
          html += '<tr>';
          for (var c = 0; c < dataRows[r].length; c++) {
            html += '<td>' + dataRows[r][c] + '</td>';
          }
          html += '</tr>\n';
        }
        html += '</tbody>\n';
      }

      html += '</table>\n</div>';
      return html;
    }
  );
}

function extractFirstDiv(html, className) {
  // Match <div class="stats"> or <div class="stats ..."> (className as whole word in class attr)
  const exactRe = new RegExp('<div class="' + className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"');
  const wordRe = new RegExp('<div class="[^"]*\\b' + className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
  let match = html.match(exactRe) || html.match(wordRe);
  if (!match) return { html: '', body: html };
  const start = match.index;
  const gt = html.indexOf('>', start);
  if (gt === -1) return { html: '', body: html };
  let depth = 1;
  let i = gt + 1;
  while (i < html.length && depth > 0) {
    if (html.substring(i, i + 5) === '<div ') { depth++; const gt2 = html.indexOf('>', i); i = gt2 + 1; }
    else if (html.substring(i, i + 5) === '<div>') { depth++; i += 5; }
    else if (html.substring(i, i + 6) === '</div>') { depth--; i += 6; }
    else { i++; }
  }
  return { html: html.substring(start, i), body: html.substring(0, start) + html.substring(i) };
}

function formatDateTime(val) {
  if (!val) return '';
  var d = val.substring(0, 10).replace(/-/g, '/');
  if (val.length > 10) { var t = val.substring(11, 19); if (t) d += ' ' + t; }
  return d;
}

const defaultTaxonomy = createTaxonomyResolver();

function taxonomySlug(name, type = 'tag', parentCategory = '') {
  if (type === 'category') return defaultTaxonomy.getCategorySlug(name);
  if (type === 'subcategory') return defaultTaxonomy.getSubcategorySlug(parentCategory, name);
  return defaultTaxonomy.getTagSlug(name);
}

function categoryUrl(category, taxonomy = defaultTaxonomy) {
  return taxonomy.categoryUrl(category);
}

function subcategoryUrl(category, subcategory, taxonomy = defaultTaxonomy) {
  return taxonomy.subcategoryUrl(category, subcategory);
}

function buildCategoryBreadcrumb(cats, subcat, taxonomy = defaultTaxonomy) {
  if (!cats.length) return '';
  const primaryCat = cats[0];
  let html = cats.map(c => `<a class="meta-tag" data-cat="${c}" href="${categoryUrl(c, taxonomy)}">${c}</a>`).join('');
  if (subcat && primaryCat) {
    html += `<span class="meta-breadcrumb-sep">/</span><a class="meta-tag" data-subcat="${subcat}" href="${subcategoryUrl(primaryCat, subcat, taxonomy)}">${subcat}</a>`;
  }
  return html;
}

function buildFooterCategoryBreadcrumb(cats, subcat, taxonomy = defaultTaxonomy) {
  if (!cats.length) return '';
  const primaryCat = cats[0];
  let html = cats.map(c => `<a href="${categoryUrl(c, taxonomy)}" data-cat="${c}">${c}</a>`).join('<span class="sep">, </span>');
  if (subcat && primaryCat) {
    html += `<span class="sep"> / </span><a href="${subcategoryUrl(primaryCat, subcat, taxonomy)}" data-subcat="${subcat}">${subcat}</a>`;
  }
  return html;
}

function buildArticleMeta(fm, bodyHtml, taxonomy = defaultTaxonomy) {
  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);
  const subcat = String(fm.subcategory || '').trim();
  if (!cats.length && !tags.length && !bodyHtml) return '';
  var iconCal = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
  var iconEdit = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
  var iconFolder = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
  var iconClock = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
  let html = '<div class="article-meta">';

  // Row 1: created_at + updated_at
  var hasCreated = fm.created_at;
  var createdVal = formatDateTime(fm.created_at);
  var updDateOnly = fm.updated_at ? fm.updated_at.substring(0, 10) : '';
  var hasUpdated = fm.updated_at && updDateOnly !== (fm.created_at || '').substring(0, 10);
  if (hasCreated || hasUpdated) {
    html += '<div class="meta-primary">';
    if (hasCreated) {
      html += `<span class="meta-item">${iconCal}<span class="date">${createdVal}</span></span>`;
    }
    if (hasUpdated) {
      if (hasCreated) html += '<span class="meta-sep">·</span>';
      html += `<span class="meta-item">${iconEdit}<span class="date updated">${formatDateTime(fm.updated_at)}</span></span>`;
    }
    html += '</div>';
  }

  // Row 2: categories / subcategory + reading time
  if (cats.length || bodyHtml) {
    html += '<div class="meta-primary">';
    if (cats.length) {
      html += `<span class="meta-item">${iconFolder}`;
      html += buildCategoryBreadcrumb(cats, subcat, taxonomy);
      html += '</span>';
    }
    if (bodyHtml) {
      if (cats.length) html += '<span class="meta-sep">·</span>';
      html += `<span class="meta-item">${iconClock}<span class="reading-time">${estimateReadingTime(bodyHtml)}</span></span>`;
    }
    html += '</div>';
  }

  // Row 3: tags
  if (tags.length) {
    html += '<div class="meta-tags-row">';
    html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>';
    html += tags.map(t => `<a class="meta-tag" href="${taxonomy.tagUrl(t)}">${t}</a>`).join('');
    html += '</div>';
  }
  html += '</div>';
  return html;
}


function buildPdfJsScript() {
  return `<script>
(function(){
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function ensurePdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js').then(function(){
      var lib = window.pdfjsLib;
      if (!lib) throw new Error('PDF.js failed to load');
      lib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      return lib;
    });
  }
  function renderOne(el, lib) {
    var src = el.getAttribute('data-docpage-pdf');
    var pageNo = parseInt(el.getAttribute('data-docpage-page') || '1', 10);
    var canvas = el.querySelector('canvas');
    var loading = el.querySelector('.doc-page-loading');
    if (!src || !canvas) return;
    lib.getDocument(src).promise.then(function(pdf){ return pdf.getPage(pageNo); }).then(function(page){
      var stage = el.querySelector('.doc-page-stage') || el;
      var maxWidth = Math.max(320, stage.clientWidth || el.clientWidth || 900);
      var viewport1 = page.getViewport({ scale: 1 });
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var scale = maxWidth / viewport1.width;
      var viewport = page.getViewport({ scale: scale * dpr });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = Math.floor(viewport.width / dpr) + 'px';
      canvas.style.height = Math.floor(viewport.height / dpr) + 'px';
      return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    }).then(function(){
      el.classList.add('is-rendered');
      if (loading) loading.remove();
    }).catch(function(err){
      console.error(err);
      if (loading) loading.textContent = 'PDF 页面渲染失败，请点击“打开原文”。';
    });
  }
  function boot(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.doc-page-canvas[data-docpage-pdf], .doc-page-stage[data-docpage-pdf]'));
    if (!nodes.length) return;
    ensurePdfJs().then(function(lib){ nodes.forEach(function(el){ renderOne(el, lib); }); }).catch(function(err){ console.error(err); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>`;
}

function buildArticleFooter(fm, taxonomy = defaultTaxonomy) {
  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);
  if (!tags.length && !cats.length) return '';
  let html = '<hr><div class="article-footer">';
  if (cats.length) {
    html += '<div class="footer-row"><span class="footer-label">Categories:</span>';
    html += buildFooterCategoryBreadcrumb(cats, String(fm.subcategory || '').trim(), taxonomy);
    html += '</div>';
  }
  if (tags.length) {
    html += '<div class="footer-row"><span class="footer-label">Tags:</span>';
    html += tags.map(t => `<a href="${taxonomy.tagUrl(t)}">${t}</a>`).join('<span class="sep">, </span>');
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// Build individual article pages — walks src/pages recursively
function buildArticles(paths, allPosts, buildContext, recentCount, options) {
  const taxonomy = (options && options.taxonomy) || defaultTaxonomy;
  const opts = options || {};
  const pageFiles = Array.isArray(opts.onlyFiles) ? opts.onlyFiles.slice() : walkDir(paths.pages);
  const totalFiles = walkDir(paths.pages).length;
  let builtCount = 0;

  for (const file of pageFiles) {
    const basename = path.basename(file);
    if (!basename.endsWith('.md') && !basename.endsWith('.html')) continue;

    const raw = fs.readFileSync(file, 'utf8');
    const { parseFrontmatter } = require('./parser');
    const { data: fm, content: bodyContent } = parseFrontmatter(raw);
    const ext = path.extname(file);

    let bodyHtml = ext === '.md' ? marked.parse(bodyContent, { tables: true, gfm: true }) : bodyContent;

    // For .html files, auto-wrap bare text lines with <p> tags
    if (ext === '.html') {
      bodyHtml = wrapBareParagraphs(bodyHtml);
    }

    // Markdown tables -> HTML tables (run BEFORE transformLatex so $...$ in cells are handled)
    bodyHtml = transformMarkdownTables(bodyHtml);

    // LaTeX -> HTML wrappers (run BEFORE processShortcodes/applyReplacements).
    bodyHtml = transformLatex(bodyHtml);

    bodyHtml = processShortcodes(bodyHtml, allPosts, renderSortableList);
    const postMap = {};
    allPosts.forEach(function(p) { postMap[p.title] = p.slug; });
    bodyHtml = applyReplacements(bodyHtml, {
      imgDir: 'assets/media',
      baseUrl: buildContext().base_url,
      postMap: postMap,
      allPosts: allPosts,
    });

    bodyHtml = bodyHtml.replace(/<div class="ch fade-in"/g, '<div class="ch"');
    bodyHtml = bodyHtml.replace(/<div class="ch"/g, '<div class="ch fade-in"');

    let tocSidebar = '';
    let tocToggle = '';
    const isIndex = basename === 'index.md' || basename === 'index.html';
    const isAbout = basename === 'about.md' || basename === 'about.html';
    const isArticle = !isIndex && !isAbout;

    if (isArticle) {
      const tocResult = processHeadings(bodyHtml);
      bodyHtml = tocResult.html;
      const currentSourcePath = path.relative(paths.root, file).replace(/\\/g, '/');
      const currentPost = allPosts.find(p => p.sourcePath === currentSourcePath) || null;
      const toc = buildTocSidebar(tocResult.headings, allPosts, currentPost, taxonomy);
      tocSidebar = toc.sidebar;
      tocToggle = toc.toggle;
    }

    const containerClass = isIndex ? 'main-content' : 'wrap';

    let contentHtml;
    if (isIndex) {
      contentHtml = `${buildHero(fm)}<div class="${containerClass}">${bodyHtml}</div>`;
      const recent = allPosts.slice(0, recentCount);
      contentHtml = contentHtml.replace('{{RECENT_POSTS}}', renderPostList(recent));
    } else if (isAbout) {
      contentHtml = `${buildHero(fm)}<div class="${containerClass}">${bodyHtml}</div>`;
    } else {
      const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(bodyHtml, 'stats');
      const hasSourceWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);

      if (hasSourceWrap) {
        const metaHtml = buildArticleMeta(fm, bodyAfterStats, taxonomy);
        const footerHtml = buildArticleFooter(fm, taxonomy);
        let bodyWithMeta = bodyAfterStats.replace(
          /<div class="wrap">/i,
          `<div class="wrap">${metaHtml}`
        );
        if (footerHtml) {
          const lastCloseDiv = bodyWithMeta.lastIndexOf('</div>');
          if (lastCloseDiv >= 0) {
            bodyWithMeta = bodyWithMeta.substring(0, lastCloseDiv) + footerHtml + bodyWithMeta.substring(lastCloseDiv);
          }
        }
        contentHtml = `${buildHero(fm)}${statsHtml}${bodyWithMeta}`;
      } else {
        contentHtml = `${buildHero(fm)}${statsHtml}<div class="${containerClass}">${buildArticleMeta(fm, bodyAfterStats, taxonomy)}${bodyAfterStats}${buildArticleFooter(fm, taxonomy)}</div>`;
      }
    }

    const context = buildContext({
      title: fm.title || buildContext().title,
      description: fm.description || buildContext().description,
      PAGE_STYLE: fm.page_style || '',
      audio_src: fm.audio_src || ''
    });

    let page = assemblePage(paths.templates, contentHtml, context);
    page = page.replace('<!-- INJECT toc_sidebar -->', tocSidebar);
    page = page.replace('<!-- INJECT toc_toggle -->', tocToggle);

        // Inject MathJax if mathjax: true
    if (fm.mathjax) {
      const headEndIdx = page.indexOf('</head>\n');
      if (headEndIdx >= 0) {
        page = page.slice(0, headEndIdx) + '<script>\nwindow.MathJax = {tex: {inlineMath: [[\'$\', \'$\'], [\'\\\\(\', \'\\\\)\']], displayMath: [[\'$$\', \'$$\'], [\'\\\\[\', \'\\\\]\']], packages: {\'[+]\': [\'ams\']}}, svg: {displayAlign: \'center\'}, options: {enableMenu: false}};\n</script>\n<script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js\" async></script>\n<script>\nwindow.addEventListener(\'load\', function() { var tries = 0; var timer = setInterval(function() { if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) { window.MathJax.startup.promise.then(function() { return window.MathJax.typesetPromise ? window.MathJax.typesetPromise() : Promise.resolve(); }).then(function() { clearInterval(timer); }).catch(function(e) { console.error(e); }); } tries++; if (tries > 100) { clearInterval(timer); } }, 100); });\n</script>\n</head>\n' + page.slice(headEndIdx + 8);
      }
    }
    // Inject optional CSS modules from frontmatter
    const cssModules = parseListField(fm.css_modules);
    if (cssModules.length > 0) {
      const themeCssTag = '<link rel="stylesheet" href="assets/css/hugo-theme.css">';
      const moduleLinks = cssModules.map(m => `<link rel="stylesheet" href="assets/css/modules/${m}.css">`).join('\n');
      page = page.replace(themeCssTag, themeCssTag + '\n' + moduleLinks);
    }

    // Auto-inject CSS/JS from shortcode dependency registry
    const injectedIds = new Set();
    const localCssTags = [];
    const localJsTags = [];
    const cdnTags = [];
    for (const dep of SHORTCODE_DEPS) {
      const detected = (Array.isArray(dep.detect) ? dep.detect : [dep.detect])
        .some(d => page.indexOf(d) >= 0);
      if (!detected) continue;
      if (dep.css) {
        for (const c of dep.css) {
          const tag = '<link rel="stylesheet" href="assets/' + c + '">';
          if (page.indexOf(tag) === -1) localCssTags.push(tag);
        }
      }
      if (dep.js) {
        for (const j of dep.js) {
          localJsTags.push('<script src="assets/' + j + '"></script>');
        }
      }
      if (dep.cdn) {
        for (const url of dep.cdn) {
          cdnTags.push('<script src="' + url + '"></script>');
        }
      }
      injectedIds.add(dep.id);
    }
    // Inject CSS into <head>
    if (localCssTags.length > 0) {
      const themeCssTag = '<link rel="stylesheet" href="assets/css/hugo-theme.css">';
      page = page.replace(themeCssTag, themeCssTag + '\n' + localCssTags.join('\n'));
    }
    // Inject JS before </body>
    const allJsTags = cdnTags.concat(localJsTags);
    if (allJsTags.length > 0) {
      const bodyEndIdx = page.lastIndexOf('</body>');
      if (bodyEndIdx >= 0) {
        page = page.slice(0, bodyEndIdx) + allJsTags.join('\n') + '\n' + page.slice(bodyEndIdx);
      }
    }
// Inject post index + xref resolver for [[@Title]] cross-ref resolution
    const postIndex = allPosts.map(function(p){ return {title: p.title, slug: p.slug}; });
    const currentSourcePath = path.relative(paths.root, file).replace(/\\/g, '/');
    const currentSlug = (allPosts.find(function(p){ return p.sourcePath === currentSourcePath; }) || {}).slug || path.basename(file, ext);
    const resolveScript = '<script>\nwindow.__CURRENT_SLUG__=' + JSON.stringify(currentSlug) + ';\nwindow.__POST_INDEX__=' + JSON.stringify(postIndex) + ';\n(window.__POST_INDEX__||[]).forEach(function(p){window.__POST_MAP__=window.__POST_MAP__||{};window.__POST_MAP__[p.title]=p.slug;});\n(function resolveXrefs(){document.querySelectorAll("a.xref[data-xref-title]").forEach(function(a){var t=a.getAttribute("data-xref-title"),s=window.__POST_MAP__&&window.__POST_MAP__[t];if(s&&s!==window.__CURRENT_SLUG__)a.href="./"+s+".html";});})();\nwindow.addEventListener?window.addEventListener("load",resolveXrefs):window.attachEvent("onload",resolveXrefs);\n</script>';
    var bodyEndIdx = page.lastIndexOf('</body>');
    if (bodyEndIdx < 0) bodyEndIdx = page.lastIndexOf('\n</body>');
    if (bodyEndIdx >= 0) {
      page = page.slice(0, bodyEndIdx) + resolveScript + '\n' + page.slice(bodyEndIdx);
    }

    page = page.replace('<!-- INJECT audio -->', fm.audio_src
      ? `<audio id="bgm" src="${fm.audio_src}" autoplay loop preload="auto"></audio>`
      : '');

    // Inject PDF.js runtime for immersive docpage shortcodes.
    // The actual pdfjs worker + viewer code is inlined by buildPdfJsScript().
    if (injectedIds.has('docpage-pdf')) {
      var docBodyEndIdx = page.lastIndexOf('</body>');
      if (docBodyEndIdx >= 0) {
        page = page.slice(0, docBodyEndIdx) + buildPdfJsScript() + '\n' + page.slice(docBodyEndIdx);
      }
    }

    const sourcePath = path.relative(paths.root, file).replace(/\\/g, '/');
    const outName = ((allPosts.find(function(p){ return p.sourcePath === sourcePath; }) || {}).slug || path.basename(file, ext)) + '.html';
    writePublic(paths.public, outName, page);
    builtCount++;
    if (typeof opts.onBuilt === 'function') opts.onBuilt(file, outName);
  }

  return {
    built: builtCount,
    reused: Math.max(0, totalFiles - builtCount),
    total: totalFiles,
  };
}

function buildPostsPage(paths, allPosts, buildContext) {
  const listHtml = renderSortableList(allPosts, { linkPrefix: '../' });
  const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">All Posts</h1>${listHtml}</div></div>`;
  writePublic(paths.public, 'posts/index.html', assemblePage(paths.templates, content, buildContext({ title: 'Posts', description: 'All articles' })));
  return 1;
}

function buildTaxonomyPages(paths, allPosts, buildContext, taxonomy = defaultTaxonomy) {
  let tagPages = 1;
  let categoryPages = 1;
  let subcategoryPages = 0;

  // Build alias map: alias → post (for redirecting taxonomy pages to hub pages)
  const aliasMap = {};

  function normalizeTaxonomyAlias(alias) {
    const raw = String(alias || '').replace(/^\/+|\/+$/g, '');
    const parts = raw.split('/').filter(Boolean);
    if (parts[0] === 'tags' && parts[1]) {
      return `tags/${taxonomy.getTagSlug(parts[1])}/index`;
    }
    if (parts[0] === 'categories' && parts[1] && parts[2] === 'index') {
      return `categories/${taxonomy.getCategorySlug(parts[1])}/index`;
    }
    if (parts[0] === 'categories' && parts[1] && parts[2] && parts[3] === 'index') {
      return `categories/${taxonomy.getCategorySlug(parts[1])}/${taxonomy.getSubcategorySlug(parts[1], parts[2])}/index`;
    }
    return raw;
  }

  for (const p of allPosts) {
    for (const alias of (p.aliases || [])) {
      aliasMap[alias] = p;
      aliasMap[normalizeTaxonomyAlias(alias)] = p;
      if (!/^tags\//.test(alias) && !/^categories\//.test(alias)) {
        writeAliasRedirect(alias, p.url, `Redirect: ${p.title || alias}`);
      }
    }
  }

  function buildRedirectPage(targetHref, title = 'Redirecting…') {
    const escapedTarget = String(targetHref || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${escapedTarget}"><link rel="canonical" href="${escapedTarget}"><title>${title}</title><script>location.replace(${JSON.stringify(targetHref || './')});</script></head><body><p>Redirecting to <a href="${escapedTarget}">${escapedTarget}</a>…</p></body></html>`;
  }

  function writeAliasRedirect(aliasPath, targetHref, title) {
    const normalized = String(aliasPath || '').replace(/^\/+/, '').replace(/\/index$/, '/index').replace(/\.html$/, '').replace(/\/+$/, '');
    const outRel = normalized.endsWith('/index') ? `${normalized}.html` : `${normalized}/index.html`;
    writePublic(paths.public, outRel, buildRedirectPage(targetHref, title));
  }

  // Helper: read the already-built hub page and return its HTML content.
  function readBuiltPage(slug) {
    const p = path.join(paths.public, slug + '.html');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    return null;
  }

  const tagMap = {};
  for (const p of allPosts) {
    for (const tag of p.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(p);
    }
  }
  const tagNames = Object.keys(tagMap).sort();
  const tagLinks = tagNames.map(t =>
    `<li><a href="${taxonomy.tagUrl(t)}">${t}</a> <span style="color:var(--text-muted);font-size:0.85rem">(${tagMap[t].length})</span></li>`
  ).join('\n');
  const tagIndex = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tags</h1><ul class="post-list">${tagLinks}</ul></div></div>`;
  writePublic(paths.public, 'tags/index.html', assemblePage(paths.templates, tagIndex, buildContext({ title: 'Tags', description: 'All tags' })));
  for (const tag of tagNames) {
    const posts = tagMap[tag];
    const tagSlug = taxonomy.getTagSlug(tag);
    // Skip tags that resolve to 'mamba' (lowercase) — APFS is case-insensitive and would
    // collide with 'Mamba', corrupting the correct content
    if (tagSlug === 'mamba') {
      continue;
    }
    // Check if this tag has a full-path alias match — write hub page content directly
    const aliasPost = aliasMap[`tags/${tagSlug}/index`];
    if (aliasPost) {
      const hubHtml = readBuiltPage(aliasPost.slug);
      if (hubHtml) {
        writePublic(paths.public, `tags/${tagSlug}/index.html`, hubHtml);
        tagPages++;
      }
      continue;
    }
    const listHtml = renderSortableList(posts, { linkPrefix: '../' });
    const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tag: ${tag}</h1>${listHtml}<p style="margin-top:24px"><a href="./tags/index.html">&larr; All Tags</a></p></div></div>`;
    writePublic(paths.public, `tags/${tagSlug}/index.html`, assemblePage(paths.templates, content, buildContext({ title: `Tag: ${tag}`, description: `Articles tagged "${tag}"` })));
    tagPages++;
  }
  const catMap = {};
  for (const p of allPosts) {
    for (const cat of p.categories) {
      if (!catMap[cat]) catMap[cat] = { posts: [], subcategories: {} };
      catMap[cat].posts.push(p);
      const subcat = p.subcategory || '';
      if (subcat) {
        if (!catMap[cat].subcategories[subcat]) catMap[cat].subcategories[subcat] = [];
        catMap[cat].subcategories[subcat].push(p);
      }
    }
  }
  const catNames = Object.keys(catMap).sort();
  const catRows = catNames.map(c => {
    const subcatNames = Object.keys(catMap[c].subcategories).sort();
    const total = catMap[c].posts.length;
    const catCell = `<td class="cat-name"><a href="${taxonomy.categoryUrl(c)}">${c}</a><span class="cat-count">(${total})</span></td>`;
    let subCell;
    if (subcatNames.length) {
      const items = subcatNames.map(sc => {
        const count = catMap[c].subcategories[sc].length;
        return `<a href="${taxonomy.subcategoryUrl(c, sc)}">${sc}</a><span class="sub-count">(${count})</span>`;
      }).join('<span class="sep">·</span>');
      subCell = `<td class="cat-subs">${items}</td>`;
    } else {
      subCell = `<td class="cat-subs"><span class="empty-mark">—</span></td>`;
    }
    return `<tr>${catCell}${subCell}</tr>`;
  }).join('\n');
  const catIndex = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Categories</h1><table class="cat-table">${catRows}</table></div></div>`;
  writePublic(paths.public, 'categories/index.html', assemblePage(paths.templates, catIndex, buildContext({ title: 'Categories', description: 'All categories' })));
  for (const cat of catNames) {
    const posts = catMap[cat].posts;
    const subcats = Object.keys(catMap[cat].subcategories).sort();
    const catSlug = taxonomy.getCategorySlug(cat);
    // Check if this category has a full-path alias match — write hub page content directly
    const aliasPost = aliasMap[`categories/${catSlug}/index`];
    if (aliasPost) {
      const hubHtml = readBuiltPage(aliasPost.slug);
      if (hubHtml) {
        writePublic(paths.public, `categories/${catSlug}/index.html`, hubHtml);
        categoryPages++;
      }
    } else {
      let groupedHtml = '';
      for (const subcat of subcats) {
        const subPosts = catMap[cat].subcategories[subcat];
        groupedHtml += `<div class="section"><a class="section-title subcat-heading" href="${taxonomy.subcategoryUrl(cat, subcat)}" style="font-size:1.2rem;margin-top:0;">${subcat} <span style="font-size:0.75rem;opacity:0.6;">→</span></a>${renderPostList(subPosts)}</div>`;
      }
      const uncategorized = posts.filter(p => !p.subcategory);
      if (uncategorized.length) {
        groupedHtml += `<div class="section"><h2 class="section-title" style="font-size:1.2rem;color:var(--h1-color);margin-top:0;">Uncategorized</h2>${renderPostList(uncategorized)}</div>`;
      }
      const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Category: ${cat}</h1><p style="margin-bottom:24px"><a href="./categories/index.html">&larr; All Categories</a></p>${groupedHtml || renderPostList(posts)}${subcats.length ? '' : '<p style="margin-top:24px"></p>'}</div></div>`;
      writePublic(paths.public, `categories/${catSlug}/index.html`, assemblePage(paths.templates, content, buildContext({ title: `Category: ${cat}`, description: `Articles in "${cat}"` })));
      categoryPages++;
    }
    for (const subcat of subcats) {
      const subPosts = catMap[cat].subcategories[subcat];
      const subcatSlug = taxonomy.getSubcategorySlug(cat, subcat);
      // Check if this subcategory has a full-path alias match — write hub page content directly
      const subAliasPost = aliasMap[`categories/${catSlug}/${subcatSlug}/index`];
      if (subAliasPost) {
        const hubHtml = readBuiltPage(subAliasPost.slug);
        if (hubHtml) {
          writePublic(paths.public, `categories/${catSlug}/${subcatSlug}/index.html`, hubHtml);
          subcategoryPages++;
        }
        continue;
      }
      const listHtml = renderSortableList(subPosts, { linkPrefix: '../../' });
      const subContent = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Category: ${cat} / ${subcat}</h1>${listHtml}<p style="margin-top:24px"><a href="./categories/${catSlug}/index.html">&larr; Back to Category</a></p><p style="margin-top:8px"><a href="./categories/index.html">&larr; All Categories</a></p></div></div>`;
      writePublic(paths.public, `categories/${catSlug}/${subcatSlug}/index.html`, assemblePage(paths.templates, subContent, buildContext({ title: `Category: ${cat} / ${subcat}`, description: `Articles in "${cat} / ${subcat}"` })));
      subcategoryPages++;
    }
  }

  return {
    tags: tagPages,
    categories: categoryPages,
    subcategories: subcategoryPages,
    total: tagPages + categoryPages + subcategoryPages,
  };
}

function buildSearch(paths, allPosts) {
  const index = allPosts.map(p => ({
    title: p.title, description: p.description,
    created_at: p.created_at, tags: p.tags, categories: p.categories,
    subcategory: p.subcategory || '',
    aliases: p.aliases || [],
    url: p.url.replace('./', '')
  }));
  writePublic(paths.public, 'search-index.json', JSON.stringify(index, null, 2));
  return index.length;
}

function buildIndex(paths, allPosts) {
  // 为每篇文章生成固定 hash ID（基于 slug）
  function djb2Hash(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & 0x7FFFFFFF; // 保证正整数
    }
    return hash;
  }

  // 按 sub_id 排序（数字小的在前，无则排最后）
  var sorted = allPosts.slice();
  sorted.sort(function(a, b) {
    var ia = typeof a.sub_id === 'number' ? a.sub_id : Infinity;
    var ib = typeof b.sub_id === 'number' ? b.sub_id : Infinity;
    if (ia !== ib) return ia - ib;
    // 同 index 则按 created_at 倒序
    var ta = a.created_at || '';
    var tb = b.created_at || '';
    return tb.localeCompare(ta);
  });

  var postIndex = sorted.map(function(p) {
    return {
      id: djb2Hash(p.slug),
      title: p.title,
      slug: p.slug,
      sub_id: p.sub_id,
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  });
  writePublic(paths.public, 'post-index.json', JSON.stringify(postIndex, null, 2));
  return postIndex.length;
}

/**
 * Build RSS 2.0 feed (feed.xml) from all posts.
 */
function buildRss(paths, allPosts, buildContext) {
  const ctx = buildContext();
  const siteUrl = ctx.url;
  const siteTitle = ctx.site_title;
  const siteDesc = ctx.description;
  const author = ctx.author;

  const maxItems = 25;
  const posts = allPosts.slice(0, maxItems);

  function escapeXml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function toRfc822(dateStr) {
    if (!dateStr) return new Date().toUTCString();
    try {
      const d = new Date(dateStr);
      return d.toUTCString();
    } catch (e) {
      return new Date().toUTCString();
    }
  }

  const items = posts.map(p => {
    const link = siteUrl + '/' + p.slug + '.html';
    const pubDate = toRfc822(p.created_at);
    const categories = p.tags.map(t => '    <category>' + escapeXml(t) + '</category>').join('\n');
    const desc = p.description
      ? '    <description>' + escapeXml(p.description) + '</description>'
      : '';

    return '  <item>\n' +
      '    <title>' + escapeXml(p.title) + '</title>\n' +
      '    <link>' + escapeXml(link) + '</link>\n' +
      '    <guid isPermaLink="true">' + escapeXml(link) + '</guid>\n' +
      (desc ? desc + '\n' : '') +
      '    <pubDate>' + pubDate + '</pubDate>\n' +
      '    <author>' + escapeXml(author) + '</author>\n' +
      categories + '\n' +
      '  </item>';
  }).join('\n');

  const lastBuildDate = new Date().toUTCString();

  const rss = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    '    <title>' + escapeXml(siteTitle) + '</title>\n' +
    '    <link>' + escapeXml(siteUrl) + '</link>\n' +
    '    <description>' + escapeXml(siteDesc) + '</description>\n' +
    '    <language>zh-CN</language>\n' +
    '    <managingEditor>' + escapeXml(author) + '</managingEditor>\n' +
    '    <webMaster>' + escapeXml(author) + '</webMaster>\n' +
    '    <lastBuildDate>' + lastBuildDate + '</lastBuildDate>\n' +
    '    <generator>gongshangzheng.github.io</generator>\n' +
    '    <atom:link href="' + escapeXml(siteUrl + '/feed.xml') + '" rel="self" type="application/rss+xml"/>\n' +
    items + '\n' +
    '  </channel>\n' +
    '</rss>';

  writePublic(paths.public, 'feed.xml', rss);
  return posts.length;
}

module.exports = {
  renderPostList,
  renderSortableList,
  buildArticles,
  buildPostsPage,
  buildTaxonomyPages,
  buildSearch,
  buildIndex,
  buildRss,
  transformLatex,
  transformMarkdownTables,
  buildPdfJsScript,
  taxonomySlug,
  categoryUrl,
  subcategoryUrl,
  wrapBareParagraphs,
};