#!/usr/bin/env node
/**
 * HtmlBlogs Build Script
 * 
 * Features:
 * - Markdown → HTML with frontmatter
 * - Auto post-list (recent N posts)
 * - Tags / Categories taxonomy pages
 * - Search index (JSON)
 * - Template system (Mustache-like)
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// ===========================
// Config
// ===========================
const CONFIG = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const RECENT_POSTS_COUNT = CONFIG.recent_posts || 10;

const SRC = path.join(__dirname, 'src');
const TEMPLATES = path.join(SRC, 'templates');
const PAGES = path.join(SRC, 'pages');
const ASSETS = path.join(SRC, 'assets');
const PUBLIC = path.join(__dirname, 'public');

// ===========================
// Template Engine
// ===========================
function render(template, data) {
  // Handle array blocks first
  template = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
      const d = item.link !== undefined ? { name: item.name, url: item.link } : item;
      return render(block, d);
    }).join('');
  });
  // Simple variables
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] !== undefined ? data[key] : _);
}

function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

function processIncludes(content) {
  return content.replace(/<!-- INCLUDE (\w+) -->/g, (_, name) => loadTemplate(`_${name}.html`));
}

// ===========================
// Frontmatter Parser (supports YAML | multiline)
// ===========================
function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { data: {}, content };

  const fm = {};
  const lines = m[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const ci = lines[i].indexOf(':');
    if (ci === -1) { i++; continue; }
    const key = lines[i].slice(0, ci).trim();
    let val = lines[i].slice(ci + 1).trim();
    if (val === '|') {
      const block = [];
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
        block.push(lines[i].replace(/^  /, ''));
        i++;
      }
      val = block.join('\n').trim();
    } else {
      i++;
    }
    fm[key] = val;
  }
  return { data: fm, content: m[2] };
}

// Parse YAML list field: "tags: [foo, bar]" or "tags:\n  - foo\n  - bar"
function parseListField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.startsWith('[')) {
    return val.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  }
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

// ===========================
// Context Builder
// ===========================
function buildContext(pageData = {}) {
  return {
    title: CONFIG.site.title,
    description: CONFIG.site.description,
    author: CONFIG.site.author,
    url: CONFIG.site.url,
    base_url: CONFIG.site.base_url || '/',
    ...pageData,
    nav: CONFIG.nav,
    year: new Date().getFullYear()
  };
}

// ===========================
// Asset Copy
// ===========================
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const sp = path.join(src, item), dp = path.join(dest, item);
    fs.statSync(sp).isDirectory() ? copyDir(sp, dp) : fs.copyFileSync(sp, dp);
  }
}

// ===========================
// Collect All Posts Metadata
// ===========================
function collectPosts() {
  const posts = [];
  if (!fs.existsSync(PAGES)) return posts;

  for (const file of fs.readdirSync(PAGES)) {
    if (!file.endsWith('.md')) continue;
    if (file === 'index.md' || file === 'about.md') continue; // skip non-article pages

    const raw = fs.readFileSync(path.join(PAGES, file), 'utf8');
    const { data: fm } = parseFrontmatter(raw);
    const slug = path.basename(file, '.md');

    posts.push({
      slug,
      title: fm.title || slug,
      description: fm.description || '',
      date: fm.date || '',
      tags: parseListField(fm.tags),
      categories: parseListField(fm.categories),
      hero_title: fm.hero_title || fm.title || '',
      hero_sub: fm.hero_sub || '',
      url: `./${slug}.html`,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return posts;
}

// ===========================
// HTML Post List Generator
// ===========================
function renderPostList(posts) {
  return '<ul class="post-list">\n' +
    posts.map(p => `  <li><span class="date">${p.date.replace(/-/g, '/')}</span><a href="${p.url}">${p.title}</a></li>`).join('\n') +
    '\n</ul>';
}

// ===========================
// Assemble Full Page
// ===========================
function assemblePage(contentHtml, context) {
  let page = loadTemplate('_base.html');
  page = processIncludes(page);

  // Inject header
  const headerHtml = loadTemplate('_header.html');
  page = page.replace('<!-- INJECT header -->', render(headerHtml, context));

  // Inject content
  page = page.replace('<!-- INJECT content -->', contentHtml);

  // Final render
  page = render(page, context);

  return page;
}

function writePublic(relPath, content) {
  const outPath = path.join(PUBLIC, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`✓ ${outPath}`);
}

// ===========================
// Build Markdown Pages (individual articles)
// ===========================
function buildMarkdownPages(allPosts) {
  for (const file of fs.readdirSync(PAGES)) {
    if (!file.endsWith('.md')) continue;

    const raw = fs.readFileSync(path.join(PAGES, file), 'utf8');
    const { data: fm, content: markdown } = parseFrontmatter(raw);

    let bodyHtml = marked.parse(markdown);
    // music-player tags
    bodyHtml = bodyHtml.replace(
      /<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g,
      '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
    );

    // Build hero
    const heroTitle = fm.hero_title || fm.title || '';
    const heroSub = fm.hero_sub || '';
    const heroTagline = fm.hero_tagline || '';
    let heroHtml = '';
    if (heroTitle) {
      heroHtml = `<div class="hero"><div class="hero-inner"><h1>${heroTitle}</h1>${heroSub ? `<div class="sub">${heroSub}</div>` : ''}${heroTagline ? `<div class="tagline">${heroTagline}</div>` : ''}</div></div>`;
    }

    const isIndex = file === 'index.md';
    const contentHtml = `${heroHtml}<div class="${isIndex ? 'main-content' : 'wrap'}">${bodyHtml}</div>`;

    const context = buildContext({
      title: fm.title || CONFIG.site.title,
      description: fm.description || CONFIG.site.description,
      PAGE_STYLE: fm.page_style || ''
    });

    // Replace {{RECENT_POSTS}} placeholder in index
    let finalContent = contentHtml;
    if (isIndex) {
      const recent = allPosts.slice(0, RECENT_POSTS_COUNT);
      finalContent = finalContent.replace('{{RECENT_POSTS}}', renderPostList(recent));
    }

    const page = assemblePage(finalContent, context);
    const basename = path.basename(file, '.md') + '.html';
    writePublic(basename, page);
  }
}

// ===========================
// Build Posts Page (all articles)
// ===========================
function buildPostsPage(allPosts) {
  const contentHtml = `
    <div class="main-content">
      <div class="section">
        <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">All Posts</h1>
        ${renderPostList(allPosts)}
      </div>
    </div>`;

  const context = buildContext({ title: 'Posts', description: 'All articles' });
  writePublic('posts.html', assemblePage(contentHtml, context));
}

// ===========================
// Build Tags Pages
// ===========================
function buildTagsPages(allPosts) {
  // Collect tag → posts map
  const tagMap = {};
  for (const p of allPosts) {
    for (const tag of p.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(p);
    }
  }

  // Tags index page
  const tagNames = Object.keys(tagMap).sort();
  const tagLinks = tagNames.map(t =>
    `<li><a href="./tags/${t}.html">${t}</a> <span style="color:var(--text-muted);font-size:0.85rem">(${tagMap[t].length})</span></li>`
  ).join('\n');

  const indexContent = `
    <div class="main-content">
      <div class="section">
        <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tags</h1>
        <ul class="post-list">${tagLinks}</ul>
      </div>
    </div>`;
  writePublic('tags/index.html', assemblePage(indexContent, buildContext({ title: 'Tags', description: 'All tags' })));

  // Per-tag pages
  for (const tag of tagNames) {
    const posts = tagMap[tag];
    const content = `
      <div class="main-content">
        <div class="section">
          <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Tag: ${tag}</h1>
          ${renderPostList(posts)}
          <p style="margin-top:24px"><a href="./tags/index.html">← All Tags</a></p>
        </div>
      </div>`;
    writePublic(`tags/${tag}.html`, assemblePage(content, buildContext({ title: `Tag: ${tag}`, description: `Articles tagged "${tag}"` })));
  }
}

// ===========================
// Build Categories Pages
// ===========================
function buildCategoriesPages(allPosts) {
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

  const indexContent = `
    <div class="main-content">
      <div class="section">
        <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Categories</h1>
        <ul class="post-list">${catLinks}</ul>
      </div>
    </div>`;
  writePublic('categories/index.html', assemblePage(indexContent, buildContext({ title: 'Categories', description: 'All categories' })));

  for (const cat of catNames) {
    const posts = catMap[cat];
    const content = `
      <div class="main-content">
        <div class="section">
          <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Category: ${cat}</h1>
          ${renderPostList(posts)}
          <p style="margin-top:24px"><a href="./categories/index.html">← All Categories</a></p>
        </div>
      </div>`;
    writePublic(`categories/${cat}.html`, assemblePage(content, buildContext({ title: `Category: ${cat}`, description: `Articles in "${cat}"` })));
  }
}

// ===========================
// Build Search Index
// ===========================
function buildSearchIndex(allPosts) {
  const index = allPosts.map(p => ({
    title: p.title,
    description: p.description,
    date: p.date,
    tags: p.tags,
    categories: p.categories,
    url: p.url.replace('./', '')
  }));
  writePublic('search-index.json', JSON.stringify(index, null, 2));
}

// ===========================
// Build Search Page
// ===========================
function buildSearchPage() {
  const content = `
    <div class="main-content">
      <div class="section">
        <h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Search</h1>
        <input type="text" id="search-input" placeholder="Search posts..." style="
          width:100%;padding:12px 16px;font-size:1rem;
          border:1px solid var(--border-color);border-radius:8px;
          background:var(--bg-block);color:var(--text-color);
          font-family:inherit;margin-bottom:24px;
          outline:none;transition:border-color 0.2s;
        ">
        <div id="search-results"></div>
      </div>
    </div>

    <style>
      #search-input:focus { border-color: var(--link-color); }
      #search-results .post-list { margin-top: 8px; }
      #search-results .search-meta { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; }
      .search-highlight { background: rgba(168,115,66,0.25); padding: 0 2px; border-radius: 2px; }
    </style>

    <script>
    (function() {
      var input = document.getElementById('search-input');
      var results = document.getElementById('search-results');
      var index = null;

      fetch('./search-index.json')
        .then(function(r) { return r.json(); })
        .then(function(data) { index = data; })
        .catch(function(e) { console.error('Failed to load search index', e); });

      input.addEventListener('input', function() {
        var q = this.value.trim().toLowerCase();
        if (!q || !index) {
          results.innerHTML = '';
          return;
        }

        var keywords = q.split(/\\s+/);
        var matched = index.filter(function(post) {
          var text = (post.title + ' ' + post.description + ' ' + post.tags.join(' ') + ' ' + post.categories.join(' ')).toLowerCase();
          return keywords.every(function(kw) { return text.indexOf(kw) >= 0; });
        });

        if (matched.length === 0) {
          results.innerHTML = '<p style="color:var(--text-muted)">No results found.</p>';
          return;
        }

        var html = '<p class="search-meta">' + matched.length + ' result' + (matched.length > 1 ? 's' : '') + '</p>';
        html += '<ul class="post-list">';
        matched.forEach(function(p) {
          html += '<li><span class="date">' + p.date.replace(/-/g, '/') + '</span><a href="./' + p.url + '">' + p.title + '</a></li>';
        });
        html += '</ul>';
        results.innerHTML = html;
      });
    })();
    </script>`;

  writePublic('search.html', assemblePage(content, buildContext({ title: 'Search', description: 'Search articles' })));
}

// ===========================
// Main Build
// ===========================
function build() {
  console.log('🔨 Building HtmlBlogs...\n');

  // Clean
  if (fs.existsSync(PUBLIC)) fs.rmSync(PUBLIC, { recursive: true });
  fs.mkdirSync(PUBLIC, { recursive: true });

  // Copy assets
  copyDir(ASSETS, path.join(PUBLIC, 'assets'));
  console.log('✓ assets/');

  // Collect all posts metadata
  const allPosts = collectPosts();
  console.log(`✓ collected ${allPosts.length} posts`);

  // Build individual pages
  buildMarkdownPages(allPosts);

  // Build taxonomy pages
  buildPostsPage(allPosts);
  buildTagsPages(allPosts);
  buildCategoriesPages(allPosts);

  // Build search
  buildSearchIndex(allPosts);
  buildSearchPage();

  // Update config nav
  console.log(`✓ tags/ categories/ search`);

  console.log('\n✅ Build complete!');
}

build();