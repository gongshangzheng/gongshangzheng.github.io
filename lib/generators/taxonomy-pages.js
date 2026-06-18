/**
 * Posts listing + tags/categories/subcategories pages, including alias
 * redirects and "hub page" overrides where an article aliases itself to a
 * taxonomy index path.
 */

const fs = require('fs');
const path = require('path');
const { writePublic } = require('../utils');
const { assemblePage } = require('./page');
const { renderSortableList, renderPostList } = require('./post-list');
const { defaultTaxonomy } = require('./meta');

function buildPostsPage(paths, allPosts, buildContext) {
  const listHtml = renderSortableList(allPosts, { linkPrefix: '../' });
  const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">All Posts</h1>${listHtml}</div></div>`;
  writePublic(
    paths.public,
    'posts/index.html',
    assemblePage(paths.templates, content, buildContext({ title: 'Posts', description: 'All articles' }))
  );
  return 1;
}

function buildRedirectPage(targetHref, title = 'Redirecting…') {
  const escapedTarget = String(targetHref || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${escapedTarget}"><link rel="canonical" href="${escapedTarget}"><title>${title}</title><script>location.replace(${JSON.stringify(targetHref || './')});</script></head><body><p>Redirecting to <a href="${escapedTarget}">${escapedTarget}</a>…</p></body></html>`;
}

function buildTaxonomyPages(paths, allPosts, buildContext, taxonomy = defaultTaxonomy) {
  let tagPages = 1;
  let categoryPages = 1;
  let subcategoryPages = 0;

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

  function writeAliasRedirect(aliasPath, targetHref, title) {
    const normalized = String(aliasPath || '')
      .replace(/^\/+/, '')
      .replace(/\/index$/, '/index')
      .replace(/\.html$/, '')
      .replace(/\/+$/, '');
    const outRel = normalized.endsWith('/index') ? `${normalized}.html` : `${normalized}/index.html`;
    writePublic(paths.public, outRel, buildRedirectPage(targetHref, title));
  }

  function readBuiltPage(slug) {
    const p = path.join(paths.public, slug + '.html');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    return null;
  }

  // Build alias map: alias → post (used to redirect taxonomy pages to hub pages)
  const aliasMap = {};
  for (const p of allPosts) {
    for (const alias of (p.aliases || [])) {
      aliasMap[alias] = p;
      aliasMap[normalizeTaxonomyAlias(alias)] = p;
      if (!/^tags\//.test(alias) && !/^categories\//.test(alias)) {
        writeAliasRedirect(alias, p.url, `Redirect: ${p.title || alias}`);
      }
    }
  }

  // --- Tags ------------------------------------------------------------
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
    // Skip case collision with existing 'Mamba' — APFS is case-insensitive.
    if (tagSlug === 'mamba') continue;

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

  // --- Categories ------------------------------------------------------
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
  const catNames = Object.keys(catMap).sort((a, b) => {
    const countDiff = catMap[b].posts.length - catMap[a].posts.length;
    return countDiff || a.localeCompare(b, 'zh-Hans');
  });
  const totalCategoryPosts = catNames.reduce((sum, category) => sum + catMap[category].posts.length, 0);
  const totalSubcategories = catNames.reduce((sum, category) => sum + Object.keys(catMap[category].subcategories).length, 0);
  const visualByCategory = {
    AI: { icon: '✦', tone: 'blue', desc: '模型、系统、论文与工程实践' },
    课程: { icon: '✧', tone: 'green', desc: '课程笔记、公式推导与学习路径' },
    数学: { icon: '◇', tone: 'purple', desc: '代数、分析、概率与数学基础' },
    历史: { icon: '◈', tone: 'amber', desc: '编年叙事、文明演进与历史专题' },
    编程: { icon: '⌁', tone: 'cyan', desc: '前端、工具、算法与开发实践' },
    杂识: { icon: '✺', tone: 'rose', desc: '跨学科札记、工具与随笔' },
    语言: { icon: '◌', tone: 'teal', desc: '语言学习与二语习得材料' },
  };
  const catCards = catNames.map(c => {
    const subcatNames = Object.keys(catMap[c].subcategories).sort((a, b) => {
      const countDiff = catMap[c].subcategories[b].length - catMap[c].subcategories[a].length;
      return countDiff || a.localeCompare(b, 'zh-Hans');
    });
    const total = catMap[c].posts.length;
    const visual = visualByCategory[c] || { icon: '·', tone: 'neutral', desc: '主题文章集合' };
    const subLinks = subcatNames.length
      ? subcatNames.map(sc => {
        const count = catMap[c].subcategories[sc].length;
        return `<a class="taxonomy-chip" href="${taxonomy.subcategoryUrl(c, sc)}"><span>${sc}</span><strong>${count}</strong></a>`;
      }).join('')
      : '<span class="taxonomy-empty">暂无子分类</span>';
    return `<article class="taxonomy-card taxonomy-tone-${visual.tone}">
      <a class="taxonomy-card-head" href="${taxonomy.categoryUrl(c)}">
        <span class="taxonomy-icon">${visual.icon}</span>
        <span class="taxonomy-title-wrap"><span class="taxonomy-title">${c}</span><span class="taxonomy-desc">${visual.desc}</span></span>
        <span class="taxonomy-count"><strong>${total}</strong><em>篇</em></span>
      </a>
      <div class="taxonomy-subgrid">${subLinks}</div>
    </article>`;
  }).join('\n');
  const catIndex = `<div class="main-content taxonomy-index"><section class="taxonomy-hero"><div><h1 class="section-title taxonomy-heading">分类</h1></div><div class="taxonomy-stats"><span><strong>${catNames.length}</strong> 个分类</span><span><strong>${totalSubcategories}</strong> 个子分类</span><span><strong>${totalCategoryPosts}</strong> 篇文章</span></div></section><section class="taxonomy-grid">${catCards}</section></div>`;
  writePublic(paths.public, 'categories/index.html', assemblePage(paths.templates, catIndex, buildContext({ title: 'Categories', description: 'All categories' })));

  for (const cat of catNames) {
    const posts = catMap[cat].posts;
    const subcats = Object.keys(catMap[cat].subcategories).sort();
    const catSlug = taxonomy.getCategorySlug(cat);

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
      const subAliasPost = aliasMap[`categories/${catSlug}/${subcatSlug}/index`];
      if (subAliasPost) {
        const hubHtml = readBuiltPage(subAliasPost.slug);
        if (hubHtml) {
          writePublic(paths.public, `categories/${catSlug}/${subcatSlug}/index.html`, hubHtml);
          subcategoryPages++;
        }
        continue;
      }
      const listHtml = renderSortableList(subPosts, { linkPrefix: '../../', defaultSort: 'sub_id' });
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

module.exports = {
  buildPostsPage,
  buildTaxonomyPages,
};
