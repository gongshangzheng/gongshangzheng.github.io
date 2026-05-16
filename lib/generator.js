const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { render } = require('./parser');
const { writePublic } = require('./utils');

// Shared HTML builders
function renderPostList(posts) {
  return '\u003cul class="post-list"\u003e\n' +
    posts.map(p => `  \u003cli\u003e\u003cspan class="date"\u003e${p.date.replace(/-/g, '/')}\u003c/span\u003e\u003ca href="${p.url}"\u003e${p.title}\u003c/a\u003e\u003c/li\u003e`).join('\n') +
    '\n\u003c/ul\u003e';
}

function loadTemplate(templatesDir, name) {
  return fs.readFileSync(path.join(templatesDir, name), 'utf8');
}

function processIncludes(content, templatesDir) {
  return content.replace(/\u003c!-- INCLUDE (\w+) --\u003e/g, (_, name) => loadTemplate(templatesDir, `_${name}.html`));
}

function assemblePage(templatesDir, contentHtml, context) {
  let page = loadTemplate(templatesDir, '_base.html');
  page = processIncludes(page, templatesDir);
  const headerHtml = loadTemplate(templatesDir, '_header.html');
  page = page.replace('\u003c!-- INJECT header --\u003e', render(headerHtml, context));
  page = page.replace('\u003c!-- INJECT content --\u003e', contentHtml);
  return render(page, context);
}

function buildHero(fm) {
  const heroTitle = fm.hero_title || fm.title || '';
  const heroSub = fm.hero_sub || '';
  const heroTagline = fm.hero_tagline || '';
  if (!heroTitle) return '';
  return `\u003cdiv class="hero"\u003e\u003cdiv class="hero-inner"\u003e\u003ch1\u003e${heroTitle}\u003c/h1\u003e${heroSub ? `\u003cdiv class="sub"\u003e${heroSub}\u003c/div\u003e` : ''}${heroTagline ? `\u003cdiv class="tagline"\u003e${heroTagline}\u003c/div\u003e` : ''}\u003c/div\u003e\u003c/div\u003e`;
}

function processBody(bodyHtml) {
  return bodyHtml.replace(
    /\u003cmusic-player\s+title="([^"]+)"\s+src="([^"]+)"\u003e\u003c\/music-player\u003e/g,
    '\u003cdiv class="music-player"\u003e\u003cdiv class="music-player-title"\u003e$1\u003c/div\u003e\u003caudio controls src="$2"\u003eYour browser does not support audio.\u003c/audio\u003e\u003c/div\u003e'
  );
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

    const isIndex = file === 'index.md' || file === 'index.html';
    const containerClass = isIndex ? 'main-content' : 'wrap';
    let contentHtml = `${buildHero(fm)}\u003cdiv class="${containerClass}"\u003e${bodyHtml}\u003c/div\u003e`;

    if (isIndex) {
      const recent = allPosts.slice(0, recentCount);
      contentHtml = contentHtml.replace('{{RECENT_POSTS}}', renderPostList(recent));
    }

    const context = buildContext({
      title: fm.title || buildContext().title,
      description: fm.description || buildContext().description,
      PAGE_STYLE: fm.page_style || ''
    });

    const page = assemblePage(paths.templates, contentHtml, context);
    const basename = path.basename(file, ext) + '.html';
    writePublic(paths.public, basename, page);
  }
}

// Build posts page (all articles)
function buildPostsPage(paths, allPosts, buildContext) {
  const content = `
    \u003cdiv class="main-content"\u003e
      \u003cdiv class="section"\u003e
        \u003ch1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;"\u003eAll Posts\u003c/h1\u003e
        ${renderPostList(allPosts)}
      \u003c/div\u003e
    \u003c/div\u003e`;
  writePublic(paths.public, 'posts.html', assemblePage(paths.templates, content, buildContext({ title: 'Posts', description: 'All articles' })));
}

// Build taxonomy pages
function buildTaxonomyPages(paths, allPosts, buildContext) {
  // Tags
  const tagMap = {};
  for (const p of allPosts) {
    for (const tag of p.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(p);
    }
  }

  const tagNames = Object.keys(tagMap).sort();
  const tagLinks = tagNames.map(t =>
    `\u003cli\u003e\u003ca href="./tags/${t}.html"\u003e${t}\u003c/a\u003e \u003cspan style="color:var(--text-muted);font-size:0.85rem"\u003e(${tagMap[t].length})\u003c/span\u003e\u003c/li\u003e`
  ).join('\n');

  const tagIndex = `\u003cdiv class="main-content"\u003e\u003cdiv class="section"\u003e\u003ch1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;"\u003eTags\u003c/h1\u003e\u003cul class="post-list"\u003e${tagLinks}\u003c/ul\u003e\u003c/div\u003e\u003c/div\u003e`;
  writePublic(paths.public, 'tags/index.html', assemblePage(paths.templates, tagIndex, buildContext({ title: 'Tags', description: 'All tags' })));

  for (const tag of tagNames) {
    const posts = tagMap[tag];
    const content = `\u003cdiv class="main-content"\u003e\u003cdiv class="section"\u003e\u003ch1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;"\u003eTag: ${tag}\u003c/h1\u003e${renderPostList(posts)}\u003cp style="margin-top:24px"\u003e\u003ca href="./tags/index.html"\u003e← All Tags\u003c/a\u003e\u003c/p\u003e\u003c/div\u003e\u003c/div\u003e`;
    writePublic(paths.public, `tags/${tag}.html`, assemblePage(paths.templates, content, buildContext({ title: `Tag: ${tag}`, description: `Articles tagged "${tag}"` })));
  }

  // Categories
  const catMap = {};
  for (const p of allPosts) {
    for (const cat of p.categories) {
      if (!catMap[cat]) catMap[cat] = [];
      catMap[cat].push(p);
    }
  }

  const catNames = Object.keys(catMap).sort();
  const catLinks = catNames.map(c =>
    `\u003cli\u003e\u003ca href="./categories/${c}.html"\u003e${c}\u003c/a\u003e \u003cspan style="color:var(--text-muted);font-size:0.85rem"\u003e(${catMap[c].length})\u003c/span\u003e\u003c/li\u003e`
  ).join('\n');

  const catIndex = `\u003cdiv class="main-content"\u003e\u003cdiv class="section"\u003e\u003ch1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;"\u003eCategories\u003c/h1\u003e\u003cul class="post-list"\u003e${catLinks}\u003c/ul\u003e\u003c/div\u003e\u003c/div\u003e`;
  writePublic(paths.public, 'categories/index.html', assemblePage(paths.templates, catIndex, buildContext({ title: 'Categories', description: 'All categories' })));

  for (const cat of catNames) {
    const posts = catMap[cat];
    const content = `\u003cdiv class="main-content"\u003e\u003cdiv class="section"\u003e\u003ch1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;"\u003eCategory: ${cat}\u003c/h1\u003e${renderPostList(posts)}\u003cp style="margin-top:24px"\u003e\u003ca href="./categories/index.html"\u003e← All Categories\u003c/a\u003e\u003c/p\u003e\u003c/div\u003e\u003c/div\u003e`;
    writePublic(paths.public, `categories/${cat}.html`, assemblePage(paths.templates, content, buildContext({ title: `Category: ${cat}`, description: `Articles in "${cat}"` })));
  }
}

// Build search
function buildSearch(paths, allPosts, buildContext) {
  // Index JSON
  const index = allPosts.map(p => ({
    title: p.title, description: p.description, date: p.date,
    tags: p.tags, categories: p.categories, url: p.url.replace('./', '')
  }));
  writePublic(paths.public, 'search-index.json', JSON.stringify(index, null, 2));

  // Search page
  const content = `
    \u003cdiv class="main-content"\u003e
      \u003cdiv class="section"\u003e
        \u003ch1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;"\u003eSearch\u003c/h1\u003e
        \u003cinput type="text" id="search-input" placeholder="Search posts..." style="width:100%;padding:12px 16px;font-size:1rem;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-block);color:var(--text-color);font-family:inherit;margin-bottom:24px;outline:none;transition:border-color 0.2s;"\u003e
        \u003cdiv id="search-results"\u003e\u003c/div\u003e
      \u003c/div\u003e
    \u003c/div\u003e

    \u003cstyle\u003e#search-input:focus { border-color: var(--link-color); }\n#search-results .post-list { margin-top: 8px; }\n#search-results .search-meta { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; }\u003c/style\u003e

    \u003cscript\u003e
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
        if (matched.length === 0) { results.innerHTML = '\u003cp style="color:var(--text-muted)"\u003eNo results found.\u003c/p\u003e'; return; }
        var html = '\u003cp class="search-meta"\u003e' + matched.length + ' result' + (matched.length > 1 ? 's' : '') + '\u003c/p\u003e\u003cul class="post-list"\u003e';
        matched.forEach(function(p){ html += '\u003cli\u003e\u003cspan class="date"\u003e' + p.date.replace(/-/g, '/') + '\u003c/span\u003e\u003ca href="./' + p.url + '"\u003e' + p.title + '\u003c/a\u003e\u003c/li\u003e'; });
        html += '\u003c/ul\u003e'; results.innerHTML = html;
      });
    })();
    \u003c/script\u003e`;

  writePublic(paths.public, 'search.html', assemblePage(paths.templates, content, buildContext({ title: 'Search', description: 'Search articles' })));
}

module.exports = {
  renderPostList,
  buildArticles,
  buildPostsPage,
  buildTaxonomyPages,
  buildSearch,
};
