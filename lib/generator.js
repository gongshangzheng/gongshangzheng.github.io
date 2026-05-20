const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { render } = require('./parser');
const { writePublic, walkDir } = require('./utils');
const { processHeadings, buildTocSidebar } = require('./toc');
const { processBody: applyReplacements, processShortcodes } = require('./replace');

function renderPostList(posts) {
  return '<ul class="post-list">\n' +
    posts.map(p => `  <li><span class="date">${formatDateTime(p.created_at)}</span><a href="${p.url}">${p.title}</a></li>`).join('\n') +
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
  // Use function replacement so MathJax '$$' in article content is inserted literally.
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

function estimateReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
  const minutes = Math.max(1, Math.ceil(text.length / 400));
  return minutes + ' min read';
}

function transformLatex(bodyHtml) {
  const displayMath = [];
  const storeDisplay = (latex) => {
    const clean = latex.replace(/^\$+|\$+$/g, '').replace(/\$([^$]*)\$/g, '$1').trim();
    const token = `@@MATH_DISPLAY_${displayMath.length}@@`;
    displayMath.push(`<div class="math-block">$$${clean}$$</div>`);
    return token;
  };

  // Protect display math first so the later inline-$ pass cannot consume
  // the two dollar signs of $$...$$ as a broken inline pair.
  bodyHtml = bodyHtml.replace(/\${2,}([\s\S]+?)\${2,}/g, (_, latex) => storeDisplay(latex));
  bodyHtml = bodyHtml.replace(/\\\[([\s\S]+?)\\\]/g, (_, latex) => storeDisplay(latex));

  // $@key$ citations: require @ inside, then math processes everything else.
  bodyHtml = bodyHtml.replace(/\$@([^$]+)\$/g, (_, key) => `<cite>@${key}</cite>`);

  // Inline math — keep delimiters so MathJax v3 can find them in the DOM.
  bodyHtml = bodyHtml.replace(/\$([^$\n]+?)\$/g, (_, latex) => `<span class="math-inline">$${latex}$</span>`);
  bodyHtml = bodyHtml.replace(/\\\((.*?)\\\)/g, (_, latex) => `<span class="math-inline">\\(${latex}\\)</span>`);

  bodyHtml = bodyHtml.replace(/@@MATH_DISPLAY_(\d+)@@/g, (_, i) => displayMath[Number(i)] || '');
  return bodyHtml;
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
  const openTagStart = '<div class="' + className + '"';
  const start = html.indexOf(openTagStart);
  if (start === -1) return { html: '', body: html };
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

function buildArticleMeta(fm, bodyHtml) {
  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);
  if (!cats.length && !tags.length) return '';
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

  // Row 2: categories + reading time
  if (cats.length || bodyHtml) {
    html += '<div class="meta-primary">';
    if (cats.length) {
      html += `<span class="meta-item">${iconFolder}`;
      html += cats.map(c => `<a class="meta-tag" data-cat="${c}" href="./categories/${c}.html">${c}</a>`).join('');
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
    html += tags.map(t => `<a class="meta-tag" href="./tags/${t}.html">${t}</a>`).join('');
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function buildArticleFooter(fm) {
  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);
  if (!tags.length && !cats.length) return '';
  let html = '<hr><div class="article-footer">';
  if (cats.length) {
    html += '<div class="footer-row"><span class="footer-label">Categories:</span>';
    html += cats.map(c => `<a href="./categories/${c}.html" data-cat="${c}">${c}</a>`).join('<span class="sep">, </span>');
    html += '</div>';
  }
  if (tags.length) {
    html += '<div class="footer-row"><span class="footer-label">Tags:</span>';
    html += tags.map(t => `<a href="./tags/${t}.html">${t}</a>`).join('<span class="sep">, </span>');
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// Build individual article pages — walks src/pages recursively
function buildArticles(paths, allPosts, buildContext, recentCount) {
  const pageFiles = walkDir(paths.pages);

  for (const file of pageFiles) {
    const basename = path.basename(file);
    if (!basename.endsWith('.md') && !basename.endsWith('.html')) continue;

    const raw = fs.readFileSync(file, 'utf8');
    const { parseFrontmatter } = require('./parser');
    const { data: fm, content: bodyContent } = parseFrontmatter(raw);
    const ext = path.extname(file);

    let bodyHtml = ext === '.md' ? marked.parse(bodyContent, { tables: true, gfm: true }) : bodyContent;

    // Markdown tables -> HTML tables (run BEFORE transformLatex so $...$ in cells are handled)
    bodyHtml = transformMarkdownTables(bodyHtml);

    // LaTeX -> HTML wrappers (run BEFORE processShortcodes/applyReplacements).
    bodyHtml = transformLatex(bodyHtml);

    bodyHtml = processShortcodes(bodyHtml);
    const postMap = {};
    allPosts.forEach(function(p) { postMap[p.title] = p.slug; });
    bodyHtml = applyReplacements(bodyHtml, {
      imgDir: 'assets/media',
      baseUrl: buildContext().base_url,
      postMap: postMap,
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
      const toc = buildTocSidebar(tocResult.headings);
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
        const metaHtml = buildArticleMeta(fm, bodyAfterStats);
        const footerHtml = buildArticleFooter(fm);
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
        contentHtml = `${buildHero(fm)}${statsHtml}<div class="${containerClass}">${buildArticleMeta(fm, bodyAfterStats)}${bodyAfterStats}${buildArticleFooter(fm)}</div>`;
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
        page = page.slice(0, headEndIdx) + '<script>\nwindow.MathJax = {tex: {inlineMath: [[\'$\', \'$\']], displayMath: [[\'$$\', \'$$\']], packages: {\'[+]\': [\'ams\']}}, svg: {displayAlign: \'center\'}, options: {enableMenu: false}};\n</script>\n<script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js\" async></script>\n<script>\nwindow.addEventListener(\'load\', function() { var tries = 0; var timer = setInterval(function() { if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) { window.MathJax.startup.promise.then(function() { return window.MathJax.typesetPromise ? window.MathJax.typesetPromise() : Promise.resolve(); }).then(function() { clearInterval(timer); }).catch(function(e) { console.error(e); }); } tries++; if (tries > 100) { clearInterval(timer); } }, 100); });\n</script>\n</head>\n' + page.slice(headEndIdx + 8);
      }
    }
// Inject post index + xref resolver for [[@Title]] cross-ref resolution
    const postIndex = allPosts.map(function(p){ return {title: p.title, slug: p.slug}; });
    const currentSlug = path.basename(file, ext);
    const resolveScript = '<script>\nwindow.__CURRENT_SLUG__=' + JSON.stringify(currentSlug) + ';\nwindow.__POST_INDEX__=' + JSON.stringify(postIndex) + ';\n(window.__POST_INDEX__||[]).forEach(function(p){window.__POST_MAP__=window.__POST_MAP__||{};window.__POST_MAP__[p.title]=p.slug;});\n(function resolveXrefs(){document.querySelectorAll("a.xref[data-xref-title]").forEach(function(a){var t=a.getAttribute("data-xref-title"),s=window.__POST_MAP__&&window.__POST_MAP__[t];if(s&&s!==window.__CURRENT_SLUG__)a.href="./"+s+".html";});})();\nwindow.addEventListener?window.addEventListener("load",resolveXrefs):window.attachEvent("onload",resolveXrefs);\n</script>';
    var bodyEndIdx = page.lastIndexOf('</body>');
    if (bodyEndIdx < 0) bodyEndIdx = page.lastIndexOf('\n</body>');
    if (bodyEndIdx >= 0) {
      page = page.slice(0, bodyEndIdx) + resolveScript + '\n' + page.slice(bodyEndIdx);
    }

    page = page.replace('<!-- INJECT audio -->', fm.audio_src
      ? `<audio id="bgm" src="${fm.audio_src}" autoplay loop preload="auto"></audio>`
      : '');

    const outName = path.basename(file, ext) + '.html';
    writePublic(paths.public, outName, page);
  }
}

function buildPostsPage(paths, allPosts, buildContext) {
  const content = `
    <div class="main-content">
      <div class="section">
        <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">All Posts</h1>
        ${renderPostList(allPosts)}
      </div>
    </div>`;
  writePublic(paths.public, 'posts.html', assemblePage(paths.templates, content, buildContext({ title: 'Posts', description: 'All articles' })));
}

function buildTaxonomyPages(paths, allPosts, buildContext) {
  const tagMap = {};
  for (const p of allPosts) {
    for (const tag of p.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(p);
    }
  }
  const tagNames = Object.keys(tagMap).sort();
  const tagLinks = tagNames.map(t =>
    `<li><a href="./tags/${t}.html">${t}</a> <span style="color:var(--text-muted);font-size:0.85rem">(${tagMap[t].length})</span></li>`
  ).join('\n');
  const tagIndex = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tags</h1><ul class="post-list">${tagLinks}</ul></div></div>`;
  writePublic(paths.public, 'tags/index.html', assemblePage(paths.templates, tagIndex, buildContext({ title: 'Tags', description: 'All tags' })));
  for (const tag of tagNames) {
    const posts = tagMap[tag];
    const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tag: ${tag}</h1>${renderPostList(posts)}<p style="margin-top:24px"><a href="./tags/index.html">&larr; All Tags</a></p></div></div>`;
    writePublic(paths.public, `tags/${tag}.html`, assemblePage(paths.templates, content, buildContext({ title: `Tag: ${tag}`, description: `Articles tagged "${tag}"` })));
  }
  const catMap = {};
  for (const p of allPosts) {
    for (const cat of p.categories) {
      if (!catMap[cat]) catMap[cat] = [];
      catMap[cat].push(p);
    }
  }
  const catNames = Object.keys(catMap).sort();
  const catLinks = catNames.map(c =>
    `<li><a href="./categories/${c}.html">${c}</a> <span style="color:var(--text-muted);font-size:0.85rem">(${catMap[c].length})</span></li>`
  ).join('\n');
  const catIndex = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Categories</h1><ul class="post-list">${catLinks}</ul></div></div>`;
  writePublic(paths.public, 'categories/index.html', assemblePage(paths.templates, catIndex, buildContext({ title: 'Categories', description: 'All categories' })));
  for (const cat of catNames) {
    const posts = catMap[cat];
    const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Category: ${cat}</h1>${renderPostList(posts)}<p style="margin-top:24px"><a href="./categories/index.html">&larr; All Categories</a></p></div></div>`;
    writePublic(paths.public, `categories/${cat}.html`, assemblePage(paths.templates, content, buildContext({ title: `Category: ${cat}`, description: `Articles in "${cat}"` })));
  }
}

function buildSearch(paths, allPosts) {
  const index = allPosts.map(p => ({
    title: p.title, description: p.description,
    created_at: p.created_at, tags: p.tags, categories: p.categories,
    url: p.url.replace('./', '')
  }));
  writePublic(paths.public, 'search-index.json', JSON.stringify(index, null, 2));
}

function buildIndex(paths, allPosts) {
  const postIndex = allPosts.map(function(p){ return {title: p.title, slug: p.slug}; });
  writePublic(paths.public, 'post-index.json', JSON.stringify(postIndex, null, 2));
}

module.exports = {
  renderPostList,
  buildArticles,
  buildPostsPage,
  buildTaxonomyPages,
  buildSearch,
  buildIndex,
  transformLatex,
  transformMarkdownTables,
};