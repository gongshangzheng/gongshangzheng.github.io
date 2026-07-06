/**
 * Posts listing + tags/categories pages.
 *
 * Category structure is driven by alias paths:
 *   aliases: ["categories/AI/动作识别/宠物动作识别"]
 * which becomes categoryPath = ["AI", "动作识别", "宠物动作识别"].
 *
 * Hub page overrides use aliases ending in /index:
 *   aliases: ["categories/AI/动作识别/index"]
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

// --- Visual metadata for top-level categories ---
const visualByCategory = {
  AI: { icon: '✦', tone: 'blue', desc: '模型、系统、论文与工程实践' },
  课程: { icon: '✧', tone: 'green', desc: '课程笔记、公式推导与学习路径' },
  数学: { icon: '◇', tone: 'purple', desc: '代数、分析、概率与数学基础' },
  历史: { icon: '◈', tone: 'amber', desc: '编年叙事、文明演进与历史专题' },
  编程: { icon: '⌁', tone: 'cyan', desc: '前端、工具、算法与开发实践' },
  杂识: { icon: '✺', tone: 'rose', desc: '跨学科札记、工具与随笔' },
  语言: { icon: '◌', tone: 'teal', desc: '语言学习与二语习得材料' },
};

/**
 * Build a category tree from posts' categoryPath arrays.
 * Returns: { name, posts, children: Map<name, node>, depth, pathSegments, slugPath }
 */
function buildCategoryTree(allPosts, taxonomy) {
  const root = { children: {}, posts: [] };

  for (const p of allPosts) {
    const segments = p.categoryPath || [];
    if (!segments.length) continue;
    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!node.children[seg]) {
        node.children[seg] = {
          name: seg,
          posts: [],
          children: {},
          depth: i + 1,
          pathSegments: segments.slice(0, i + 1),
        };
      }
      node.children[seg].posts.push(p);
      node = node.children[seg];
    }
  }

  return root;
}

/**
 * Sort posts by sub_id ascending (numeric), fall back to created_at descending.
 */
function sortPostsBySubId(posts) {
  return posts.slice().sort((a, b) => {
    if (typeof a.sub_id === 'number' && typeof b.sub_id === 'number') return a.sub_id - b.sub_id;
    if (typeof a.sub_id === 'number') return -1;
    if (typeof b.sub_id === 'number') return 1;
    return (b.created_at || '').localeCompare(a.created_at || '');
  });
}

/**
 * Recursively render nested taxonomy chips for the categories index page.
 */
function renderNestedChips(node, taxonomy, currentPath = []) {
  const childNames = Object.keys(node.children).sort((a, b) => {
    const countDiff = node.children[b].posts.length - node.children[a].posts.length;
    return countDiff || a.localeCompare(b, 'zh-Hans');
  });

  if (!childNames.length) return '';

  let html = '';
  for (const name of childNames) {
    const child = node.children[name];
    const slugPath = child.pathSegments.map(s => taxonomy.getNameSlug(s));
    const url = `./categories/${slugPath.join('/')}/index.html`;
    const count = child.posts.length;

    // Check for grandchildren
    const grandChips = renderNestedChips(child, taxonomy, [...currentPath, name]);

    if (child.depth === 1) {
      // Top-level: render as main chip
      html += `<a class="taxonomy-chip" href="${url}"><span>${name}</span><strong>${count}</strong></a>`;
      if (grandChips) {
        html += `<div class="taxonomy-subgrid taxonomy-subgrid-nested">${grandChips}</div>`;
      }
    } else {
      // Deeper levels: render as smaller chips
      html += `<a class="taxonomy-chip taxonomy-chip-sm" href="${url}"><span>${name}</span><strong>${count}</strong></a>`;
      if (grandChips) {
        html += `<div class="taxonomy-subgrid taxonomy-subgrid-nested">${grandChips}</div>`;
      }
    }
  }
  return html;
}

function buildTaxonomyPages(paths, allPosts, buildContext, taxonomy = defaultTaxonomy) {
  let tagPages = 1;
  let categoryPages = 0;

  function readBuiltPage(slug) {
    const p = path.join(paths.public, slug + '.html');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    return null;
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

  // --- Build alias map ---
  // Hub aliases: "categories/AI/动作识别/index" → override that index page
  // Non-category aliases: generate redirect pages
  const aliasMap = {};
  for (const p of allPosts) {
    for (const alias of (p.aliases || [])) {
      const raw = String(alias || '').replace(/^\/+|\/+$/g, '');

      // Normalize hub aliases: "categories/AI/动作识别/index" → "categories/ai/action-recognition/index"
      if (taxonomy.isHubAlias(raw)) {
        const normalized = taxonomy.normalizeHubAlias(raw);
        aliasMap[normalized] = p;
        aliasMap[raw] = p;
        continue;
      }

      // Non-category aliases get redirect pages
      if (!raw.startsWith('categories/') && !raw.startsWith('tags/')) {
        aliasMap[raw] = p;
        writeAliasRedirect(raw, p.url, `Redirect: ${p.title || raw}`);
      } else if (raw.startsWith('tags/')) {
        // Tag aliases for hub overrides
        const parts = raw.split('/').filter(Boolean);
        if (parts.length >= 2 && parts[parts.length - 1] === 'index') {
          const tagSlug = taxonomy.getTagSlug(parts[1]);
          const normalized = `tags/${tagSlug}/index`;
          aliasMap[normalized] = p;
        } else {
          aliasMap[raw] = p;
        }
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
    if (tagSlug === 'mamba') continue; // APFS case-insensitive collision

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
  // Build tree from categoryPath
  const tree = buildCategoryTree(allPosts, taxonomy);

  // Top-level category names sorted by post count desc
  const topNames = Object.keys(tree.children).sort((a, b) => {
    const countDiff = tree.children[b].posts.length - tree.children[a].posts.length;
    return countDiff || a.localeCompare(b, 'zh-Hans');
  });

  // --- Build categories/index.html ---
  const totalPosts = topNames.reduce((sum, n) => sum + tree.children[n].posts.length, 0);
  let totalSubcats = 0;
  for (const n of topNames) {
    totalSubcats += Object.keys(tree.children[n].children).length;
  }

  const catCards = topNames.map(name => {
    const node = tree.children[name];
    const slug = taxonomy.getNameSlug(name);
    const total = node.posts.length;
    const visual = visualByCategory[name] || { icon: '·', tone: 'neutral', desc: '主题文章集合' };
    const subLinks = renderNestedChips(node, taxonomy, [name]) || '<span class="taxonomy-empty">暂无子分类</span>';
    return `<article class="taxonomy-card taxonomy-tone-${visual.tone}">
      <a class="taxonomy-card-head" href="./categories/${slug}/index.html">
        <span class="taxonomy-icon">${visual.icon}</span>
        <span class="taxonomy-title-wrap"><span class="taxonomy-title">${name}</span><span class="taxonomy-desc">${visual.desc}</span></span>
        <span class="taxonomy-count"><strong>${total}</strong><em>篇</em></span>
      </a>
      <div class="taxonomy-subgrid">${subLinks}</div>
    </article>`;
  }).join('\n');

  const catIndex = `<div class="main-content taxonomy-index"><section class="taxonomy-hero"><div><h1 class="section-title taxonomy-heading">分类</h1></div><div class="taxonomy-stats"><span><strong>${topNames.length}</strong> 个分类</span><span><strong>${totalSubcats}</strong> 个子分类</span><span><strong>${totalPosts}</strong> 篇文章</span></div></section><section class="taxonomy-grid">${catCards}</section></div>`;
  writePublic(paths.public, 'categories/index.html', assemblePage(paths.templates, catIndex, buildContext({ title: 'Categories', description: 'All categories' })));
  categoryPages++;

  // --- Recursively build category pages ---
  function buildNodePage(node, slugPath, namePath) {
    const depth = node.depth; // 1 = top-level
    const slugParts = slugPath.join('/');
    const relPath = `categories/${slugParts}/index.html`;

    // Link prefix: from categories/ai/digital-human/index.html → ../../../../ to root
    const linkPrefix = '../'.repeat(depth + 1);

    // Check hub alias override
    const hubKey = `categories/${slugParts}/index`;
    const aliasPost = aliasMap[hubKey];
    if (aliasPost) {
      const hubHtml = readBuiltPage(aliasPost.slug);
      if (hubHtml) {
        writePublic(paths.public, relPath, hubHtml);
        categoryPages++;
        // Still recurse into children even when hub overrides this page
        const hubChildNames = Object.keys(node.children).sort((a, b) => {
          const countDiff = node.children[b].posts.length - node.children[a].posts.length;
          return countDiff || a.localeCompare(b, 'zh-Hans');
        });
        for (const childName of hubChildNames) {
          const child = node.children[childName];
          buildNodePage(child, [...slugPath, taxonomy.getNameSlug(childName)], [...namePath, childName]);
        }
        return;
      }
    }

    // Direct posts at this level (categoryPath ends here)
    const directPosts = node.posts.filter(p => {
      const segs = p.categoryPath || [];
      return segs.length === depth;
    });

    // Child nodes
    const childNames = Object.keys(node.children).sort((a, b) => {
      const countDiff = node.children[b].posts.length - node.children[a].posts.length;
      return countDiff || a.localeCompare(b, 'zh-Hans');
    });

    // Build page content
    let groupedHtml = '';

    // Render child sections
    for (const childName of childNames) {
      const child = node.children[childName];
      const childSlugPath = [...slugPath, taxonomy.getNameSlug(childName)];
      const childUrl = `./categories/${childSlugPath.join('/')}/index.html`;
      const childPosts = child.posts;
      const sortedChild = sortPostsBySubId(childPosts);
      groupedHtml += `<div class="section"><a class="section-title subcat-heading" href="${childUrl}" style="font-size:1.2rem;margin-top:0;">${childName} <span style="font-size:0.75rem;opacity:0.6;">→</span></a>${renderPostList(sortedChild, { linkPrefix })}</div>`;
    }

    // Render direct posts
    if (directPosts.length) {
      const sortedDirect = sortPostsBySubId(directPosts);
      if (childNames.length) {
        // Has both children and direct posts
        groupedHtml += `<div class="section"><h3 class="section-title" style="font-size:1.05rem;color:var(--h2-color);margin-top:0;">系列文章</h3>${renderPostList(sortedDirect, { linkPrefix })}</div>`;
      } else {
        // Only direct posts — use sortable list with sub_id default
        groupedHtml += renderSortableList(sortedDirect, { linkPrefix, defaultSort: 'sub_id' });
      }
    }

    // Fallback: if no content, use sortable list
    if (!groupedHtml) {
      groupedHtml = renderSortableList(node.posts, { linkPrefix, defaultSort: 'sub_id' });
    }

    // Breadcrumb
    const breadcrumbParts = namePath.map((name, i) => {
      const partialSlugs = slugPath.slice(0, i + 1).join('/');
      const url = i === 0 ? `./categories/${partialSlugs}/index.html` : `../${'../'.repeat(depth - i - 1)}categories/${slugPath[0]}/${slugPath.slice(1, i + 1).join('/')}/index.html`;
      return name;
    });
    const titlePath = namePath.join(' / ');
    const backLinks = [];

    // "Back to parent" link
    if (depth > 1) {
      const parentSlugs = slugPath.slice(0, -1).join('/');
      backLinks.push(`<p style="margin-top:24px"><a href="../index.html">&larr; Back to ${namePath[namePath.length - 2]}</a></p>`);
    }
    backLinks.push(`<p style="margin-top:${depth > 1 ? '8px' : '24px'}"><a href="${'../'.repeat(depth)}categories/index.html">&larr; All Categories</a></p>`);

    const content = `<div class="main-content"><div class="section"><h1 class="section-title" style="color:var(--h1-color);border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:12px;margin-bottom:24px;">Category: ${titlePath}</h1>${backLinks.join('')}${groupedHtml}</div></div>`;
    writePublic(paths.public, relPath, assemblePage(paths.templates, content, buildContext({ title: `Category: ${titlePath}`, description: `Articles in "${titlePath}"` })));
    categoryPages++;

    // Recurse into children
    for (const childName of childNames) {
      const child = node.children[childName];
      buildNodePage(child, [...slugPath, taxonomy.getNameSlug(childName)], [...namePath, childName]);
    }
  }

  // Start recursion from top-level categories
  for (const name of topNames) {
    const node = tree.children[name];
    const slug = taxonomy.getNameSlug(name);
    buildNodePage(node, [slug], [name]);
  }

  return {
    tags: tagPages,
    categories: categoryPages,
    total: tagPages + categoryPages,
  };
}

module.exports = {
  buildPostsPage,
  buildTaxonomyPages,
};
