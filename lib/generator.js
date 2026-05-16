const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { render } = require('./parser');
const { writePublic } = require('./utils');
const { processHeadings, buildTocSidebar } = require('./toc');

// Shared HTML builders
function renderPostList(posts) {
  return '<ul class="post-list">\n' +
    posts.map(p => `  <li><span class="date">${p.date.replace(/-/g, '/')}</span><a href="${p.url}">${p.title}</a></li>`).join('\n') +
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

function buildArticleMeta(fm) {
  const parts = [];
  if (fm.date) parts.push(`<span class="date">${fm.date.replace(/-/g, '/')}</span>`);

  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);

  if (cats.length) {
    const catLinks = cats.map(c => `<a class="meta-tag" href="./categories/${c}.html">${c}</a>`).join('');
    parts.push(`<div class="meta-tags">${catLinks}</div>`);
  }
  if (tags.length) {
    const tagLinks = tags.map(t => `<a class="meta-tag" href="./tags/${t}.html">${t}</a>`).join('');
    parts.push(`<div class="meta-tags">${tagLinks}</div>`);
  }

  if (!parts.length) return '';
  return `<div class="article-meta">${parts.join('\n')}</div>`;
}

function buildArticleFooter(fm) {
  const { parseListField } = require('./parser');
  const tags = parseListField(fm.tags);
  const cats = parseListField(fm.categories);
  if (!tags.length && !cats.length) return '';

  let html = '<hr><div class="article-footer">';
  if (cats.length) {
    html += '<div class="footer-row"><span class="footer-label">Categories:</span>';
    html += cats.map(c => `<a href="./categories/${c}.html">${c}</a>`).join('<span class="sep">, </span>');
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

    let bodyHtml = ext === '.md' ? marked.parse(bodyContent) : bodyContent;
    bodyHtml = processBody(bodyHtml);

    // Add fade-in class to .ch elements (avoid duplicates)
    bodyHtml = bodyHtml.replace(/<div class="ch fade-in"/g, '<div class="ch"');
    bodyHtml = bodyHtml.replace(/<div class="ch"/g, '<div class="ch fade-in"');

    // Process headings for TOC (articles only)
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
      contentHtml = `${buildHero(fm)}<div class="${containerClass}">${buildArticleMeta(fm)}${bodyHtml}${buildArticleFooter(fm)}</div>`;
    }

    const context = buildContext({
      title: fm.title || buildContext().title,
      description: fm.description || buildContext().description,
      PAGE_STYLE: fm.page_style || ''
    });

    let page = assemblePage(paths.templates, contentHtml, context);
    page = page.replace('<!-- INJECT toc_sidebar -->', tocSidebar);
    page = page.replace('<!-- INJECT toc_toggle -->', tocToggle);

    const basename = path.basename(file, ext) + '.html';
    writePublic(paths.public, basename, page);
  }
}

// Build posts page (all articles)
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

// Build taxonomy pages
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
    const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tag: ${tag}</h1>${renderPostList(posts)}<p style="margin-top:24px"><a href="./tags/index.html">← All Tags</a></p></div></div>`;
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
    const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Category: ${cat}</h1>${renderPostList(posts)}<p style="margin-top:24px"><a href="./categories/index.html">← All Categories</a></p></div></div>`;
    writePublic(paths.public, `categories/${cat}.html`, assemblePage(paths.templates, content, buildContext({ title: `Category: ${cat}`, description: `Articles in "${cat}"` })));
  }
}

// Build search
function buildSearch(paths, allPosts, buildContext) {
  const index = allPosts.map(p => ({
    title: p.title, description: p.description, date: p.date,
    tags: p.tags, categories: p.categories, url: p.url.replace('./', '')
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
        var keywords = q.split(/\\s+/);
        var matched = index.filter(function(post) {
          var text = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.categories.join(' ')).toLowerCase();
          return keywords.every(function(kw){ return text.indexOf(kw) >= 0; });
        });
        if (matched.length === 0) { results.innerHTML = '<p style="color:var(--text-muted)">No results found.</p>'; return; }
        var html = '<p class="search-meta">' + matched.length + ' result' + (matched.length > 1 ? 's' : '') + '</p><ul class="post-list">';
        matched.forEach(function(p){ html += '<li><span class="date">' + p.date.replace(/-/g, '/') + '</span><a href="./' + p.url + '">' + p.title + '</a></li>'; });
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
