const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { render } = require('./parser');

function formatDateForDisplay(dateStr) {
  var d = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  var dateFormatted = d.replace(/-/g, '/');
  if (dateStr.includes('T')) {
    var t = dateStr.split('T')[1];
    var parts = t.split(':');
    var h = parseInt(parts[0], 10);
    var m = parts[1] || '00';
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hour12 = h % 12 || 12;
    dateFormatted += ' ' + hour12 + ':' + m + ' ' + ampm;
  }
  return dateFormatted;
}

const { writePublic } = require('./utils');
const { processHeadings, buildTocSidebar } = require('./toc');
const { processBody: applyReplacements, processShortcodes } = require('./replace');

function renderPostList(posts) {
  return '<ul class="post-list">\n' +
    posts.map(p => `  <li><span class="date">${formatDateForDisplay(p.date)}</span><a href="${p.url}">${p.title}</a></li>`).join('\n') +
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
  page = page.replace('<!-- INJECT header -->', render(headerHtml, context));
  page = page.replace('<!-- INJECT content -->', contentHtml);
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

function buildArticleMeta(fm, bodyHtml) {
  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);
  if (!fm.date && !cats.length && !tags.length) return '';
  let html = '<div class="article-meta"><div class="meta-primary">';
  if (fm.date) {
    html += `<span class="meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="date">${formatDateForDisplay(fm.date)}</span></span>`;
  }
  if (cats.length) {
    if (fm.date) html += '<span class="meta-sep">·</span>';
    html += '<span class="meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
    html += cats.map(c => `<a class="meta-tag" data-cat="${c}" href="./categories/${c}.html">${c}</a>`).join('');
    html += '</span>';
  }
  if (bodyHtml) {
    if (fm.date || cats.length) html += '<span class="meta-sep">·</span>';
    html += `<span class="meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="reading-time">${estimateReadingTime(bodyHtml)}</span></span>`;
  }
  html += '</div>';
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

// Build individual article pages
function buildArticles(paths, allPosts, buildContext, recentCount) {
  for (const file of fs.readdirSync(paths.pages)) {
    if (!file.endsWith('.md') && !file.endsWith('.html')) continue;

    const raw = fs.readFileSync(path.join(paths.pages, file), 'utf8');
    const { parseFrontmatter } = require('./parser');
    const { data: fm, content: bodyContent } = parseFrontmatter(raw);
    const ext = path.extname(file);

    let bodyHtml = ext === '.md' ? marked.parse(bodyContent, { tables: true, gfm: true }) : bodyContent;

    // LaTeX -> HTML wrappers (run BEFORE processShortcodes/applyReplacements).
    // Store bare LaTeX in <code class="math"> so MathJax typesets it via processClass.
    // No delimiter needed -- avoids all $ / \( \) conflicts.
    //
    // Order: 1. $$...$$ display  2. \[...\] display  3. $...$ inline  4. $key$ citation
    //
    // Display math: wrapped in <div class="math-block"> (allows horizontal scroll).
    // Inline math: wrapped in <span class="math-inline"> (stays in text flow).
    // Citations: <cite>$key$</cite> — >=4 chars, no spaces = math, spaces/punct = citation.
    bodyHtml = bodyHtml.replace(
      /\$\$([\s\S]+?)\$\$/g,
      function(_, latex) {
        var clean = latex.replace(/\$([^$]*)\$/g, '$1');
        return '<div class="math-block"><ila>' + clean + '</ila></div>';
      }
    );
    bodyHtml = bodyHtml.replace(
      /\\\[(.*?)\\\]/gs,
      function(_, latex) {
        var clean = latex.replace(/\$([^$]*)\$/g, '$1');
        return '<div class="math-block"><ila>' + clean + '</ila></div>';
      }
    );
    bodyHtml = bodyHtml.replace(
      /\$([^\$\n]+?)\$/g,
      function(_, latex) {
        return '<span class="math-inline"><ila>' + latex + '</ila></span>';
      }
    );
    // $key$ citations: >=4 chars, must contain space (citation) or punctuation
    bodyHtml = bodyHtml.replace(
      /\$([^$]{4,})\$/g,
      function(_, key) { return '<cite>$' + key + '$</cite>'; }
    );

    bodyHtml = processShortcodes(bodyHtml);
    bodyHtml = applyReplacements(bodyHtml, {
      imgDir: 'assets/media',
      baseUrl: buildContext().base_url,
    });

    bodyHtml = bodyHtml.replace(/<div class="ch fade-in"/g, '<div class="ch"');
    bodyHtml = bodyHtml.replace(/<div class="ch"/g, '<div class="ch fade-in"');

    let tocSidebar = '';
    let tocToggle = '';
    const isIndex = file === 'index.md' || file === 'index.html';
    const isAbout = file === 'about.md' || file === 'about.html';
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

    // Inject MathJax if mathjax: true — uses processClass so no delimiter needed
    if (fm.mathjax) {
      const headEndIdx = page.indexOf('</head>\n');
      if (headEndIdx >= 0) {
        page = page.slice(0, headEndIdx) + `<script>
window.MathJax = {
  tex: {
    processClass: 'math',
    tags: 'all',
  },
  startup: {
    ready: function() {
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(function() {
        // MathJax already replaces <ila>/<ola> with mjx-container elements
        // No post-processing needed — just ensure no class conflicts
        document.querySelectorAll('ila, ola').forEach(function(el) {
          el.removeAttribute('class');
        });
      });
    }
  },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'] }
};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>\n` + page.slice(headEndIdx + 8);
      }
    }

    page = page.replace('<!-- INJECT audio -->', fm.audio_src
      ? `<audio id="bgm" src="${fm.audio_src}" autoplay loop preload="auto"></audio>`
      : '');

    // Inject post index for [[@title]] cross-reference resolution
    const postIndex = allPosts.map(function(p){ return {title: p.title, slug: p.slug}; });
    const currentSlug = path.basename(file, ext);
    const postIndexScript = '<script>window.__POST_INDEX__=' + JSON.stringify(postIndex) + ';window.__CURRENT_SLUG__="' + currentSlug + '";</script>';
    var bodyEndIdx = page.lastIndexOf('</body>');
    if (bodyEndIdx < 0) bodyEndIdx = page.lastIndexOf('\n</body>');
    if (bodyEndIdx >= 0) {
      page = page.slice(0, bodyEndIdx) + postIndexScript + '\n' + page.slice(bodyEndIdx);
    }

    const basename = path.basename(file, ext) + '.html';
    writePublic(paths.public, basename, page);
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

function buildSearch(paths, allPosts, buildContext) {
  const index = allPosts.map(p => ({
    title: p.title, description: p.description, date: p.date,
    created_at: p.created_at, tags: p.tags, categories: p.categories,
    url: p.url.replace('./', '')
  }));
  writePublic(paths.public, 'search-index.json', JSON.stringify(index, null, 2));
  const content = `
    <div class="main-content">
      <div class="section">
        <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Search</h1>
        <input type="text" id="search-input" placeholder="Search posts..." style="width:100%;padding:12px 16px;font-size:1rem;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-block);color:var(--text-color);font-family:inherit;margin-bottom:24px;outline:none;transition:border-color 0.2s;">
        <div id="search-results"></div>
      </div>
    </div>
    <style>#search-input:focus { border-color: var(--link-color); }
#search-results .post-list { margin-top: 8px; }
#search-results .search-meta { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; }</style>
    <script>
    (function() {
      var input = document.getElementById('search-input');
      var results = document.getElementById('search-results');
      var index = null;
      fetch('./search-index.json').then(function(r){return r.json();}).then(function(data){index=data;});
      input.addEventListener('input', function() {
        var q = this.value.trim().toLowerCase();
        if (!q || !index) { results.innerHTML = ''; return; }
        var keywords = q.split(/\s+/);
        var matched = index.filter(function(post) {
          var text = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.categories.join(' ')).toLowerCase();
          return keywords.every(function(kw){ return text.indexOf(kw) >= 0; });
        });
        if (matched.length === 0) { results.innerHTML = '<p style="color:var(--text-muted)">No results found.</p>'; return; }
        var html = '<p class="search-meta">' + matched.length + ' result' + (matched.length > 1 ? 's' : '') + '</p><ul class="post-list">';
        matched.forEach(function(p){ html += '<li><span class="date">' + formatDateForDisplay(p.date) + '</span><a href="./' + p.url + '">' + p.title + '</a></li>'; });
        html += '</ul>'; results.innerHTML = html;
      });
    })();
    </script>`;
  writePublic(paths.public, 'search.html', assemblePage(paths.templates, content, buildContext({ title: 'Search', description: 'Search articles' })));
}

module.exports = {
  renderPostList,
  buildArticles,
  buildPostsPage,
  buildTaxonomyPages,
  buildSearch,
};