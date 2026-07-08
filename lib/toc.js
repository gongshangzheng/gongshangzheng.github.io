/**
 * TOC (Table of Contents) Generator
 *
 * - processHeadings: single combined regex preserves document order
 * - buildTocTree → renderTocNode: proper nested <ul>/<li> structure
 * - Collapsible parents via .toc-toggle button + .toc-collapsed class
 */

// Slugify heading text for use as ID (preserves CJK characters)
function slugify(text) {
  return text
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60) || 'section';
}

// Add IDs to headings in HTML body and return modified HTML + heading data
function processHeadings(bodyHtml) {
  const headings = [];
  let counter = {};

  // --- Placeholder excluded containers so their inner headings are skipped ---
  // section is a main content structure - its headings MUST be in the TOC, not excluded
  const excludedClassRegex = /(?:^|\s)(?:info-box|def-box|theorem-box|example-box|review-box|callout|admonition|table-wrap|photo|quote|sources|chapter-nav)(?:\s|$)/;
  let placeholderHtml = bodyHtml;
  const placeholders = [];

  let scanIdx = 0;
  while (scanIdx < placeholderHtml.length) {
    const divIdx = placeholderHtml.indexOf('<div class="', scanIdx);
    if (divIdx === -1) break;
    const classStart = divIdx + 12;
    const classEnd = placeholderHtml.indexOf('"', classStart);
    if (classEnd === -1) { scanIdx = classStart; continue; }
    const classVal = placeholderHtml.substring(classStart, classEnd);
    if (excludedClassRegex.test(classVal)) {
      const gt = placeholderHtml.indexOf('>', classEnd);
      if (gt === -1) { scanIdx = classEnd; continue; }
      let depth = 1, i = gt + 1;
      while (i < placeholderHtml.length && depth > 0) {
        if (placeholderHtml.substring(i, i + 5) === '<div ') { depth++; i = placeholderHtml.indexOf('>', i) + 1; }
        else if (placeholderHtml.substring(i, i + 5) === '<div>') { depth++; i += 5; }
        else if (placeholderHtml.substring(i, i + 6) === '</div>') { depth--; i += 6; }
        else i++;
      }
      const ph = `<!--TOC_EXCLUDE_${placeholders.length}-->`;
      placeholders.push(placeholderHtml.substring(divIdx, i));
      placeholderHtml = placeholderHtml.substring(0, divIdx) + ph + placeholderHtml.substring(i);
      scanIdx = divIdx + ph.length;
    } else {
      scanIdx = classEnd;
    }
  }

  // --- Single combined regex: .ch-title divs, .ch-subtitle divs, .section-title divs, AND h2-h6, processed in document order ---
  //   Group 1: div opening tag (ch-title)     Group 2: div content
  //   Group 3: div opening tag (ch-subtitle)   Group 4: div content
  //   Group 5: div opening tag (section-title) Group 6: div content
  //   Group 7: h tag name                     Group 8: h attributes   Group 9: h content
  const processed = placeholderHtml.replace(
    /<(div[^>]*class="[^"]*\bch-title\b[^"]*"[^>]*)>(.*?)<\/div>|<(div[^>]*class="[^"]*\bch-subtitle\b[^"]*"[^>]*)>(.*?)<\/div>|<(div[^>]*class="[^"]*\bsection-title\b[^"]*"[^>]*)>(.*?)<\/div>|<(h[2-6])([^>]*)>(.*?)<\/\7>/gi,
    (match, chOpen, chContent, subOpen, subContent, secOpen, secContent, hTag, hAttrs, hContent) => {
      if (chOpen !== undefined) {
        // .ch-title element → level 2
        const text = chContent.replace(/<[^>]*>/g, '').trim();
        if (!text) return match;
        let baseId = slugify(text);
        if (!baseId) baseId = 'chapter';
        counter[baseId] = (counter[baseId] || 0) + 1;
        const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
        headings.push({ level: 2, text, id });
        const cleanTag = chOpen.replace(/^\s*/, '');
        return `<${cleanTag} id="${id}">${chContent}</div>`;
      } else if (subOpen !== undefined) {
        // .ch-subtitle element → level 3
        const text = subContent.replace(/<[^>]*>/g, '').trim();
        if (!text) return match;
        let baseId = slugify(text);
        if (!baseId) baseId = 'section';
        counter[baseId] = (counter[baseId] || 0) + 1;
        const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
        headings.push({ level: 3, text, id });
        const cleanTag = subOpen.replace(/^\s*/, '');
        return `<${cleanTag} id="${id}">${subContent}</div>`;
      } else if (secOpen !== undefined) {
        // .section-title element → level 3
        const text = secContent.replace(/<[^>]*>/g, '').trim();
        if (!text) return match;
        let baseId = slugify(text);
        if (!baseId) baseId = 'section';
        counter[baseId] = (counter[baseId] || 0) + 1;
        const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
        headings.push({ level: 3, text, id });
        const cleanTag = secOpen.replace(/^\s*/, '');
        return `<${cleanTag} id="${id}">${secContent}</div>`;
      } else {
        // h2-h6 heading
        const level = parseInt(hTag[1]);
        const text = hContent.replace(/<[^>]*>/g, '').trim();
        let baseId = slugify(text);
        if (!baseId) baseId = 'section';
        counter[baseId] = (counter[baseId] || 0) + 1;
        const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
        headings.push({ level, text, id });
        // Strip any existing id/class from attrs to avoid duplicates
        const cleanAttrs = (hAttrs || '').replace(/\s*id="[^"]*"/gi, '').replace(/\s*class="[^"]*"/gi, '');
        // Map h2→ch-title, h3→section-title, h4→ch-section for semantic styling
        const classMap = { 2: 'ch-title', 3: 'section-title', 4: 'ch-section' };
        const headingClass = classMap[level] || '';
        const classAttr = headingClass ? ` class="${headingClass}"` : '';
        return `<${hTag}${cleanAttrs}${classAttr} id="${id}">${hContent}</${hTag}>`;
      }
    }
  );

  // Restore excluded containers
  let finalHtml = processed;
  for (let p = placeholders.length - 1; p >= 0; p--) {
    // Use a function replacement so '$$' inside excluded blocks (MathJax display
    // delimiters) is restored literally; string replacement would collapse '$$'
    // to '$' per JavaScript replacement semantics.
    finalHtml = finalHtml.replace(`<!--TOC_EXCLUDE_${p}-->`, () => placeholders[p]);
  }

  return { html: finalHtml, headings };
}

// --- Tree builder ---

function buildTocTree(headings) {
  const root = { children: [] };
  const stack = [{ node: root, level: 0 }];

  for (const h of headings) {
    const node = { ...h, children: [] };
    while (stack.length > 1 && stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }
    stack[stack.length - 1].node.children.push(node);
    stack.push({ node, level: h.level });
  }

  return root.children;
}

function renderTocNode(node) {
  const hasChildren = node.children && node.children.length > 0;
  const collapsedClass = node.collapsed ? ' toc-collapsed' : '';

  let html = '<li';
  if (hasChildren) html += ` class="toc-parent${collapsedClass}"`;
  html += '>';

  // Toggle arrow BEFORE link — visible and inline
  if (hasChildren) {
    html += '<button class="toc-toggle" aria-label="展开/折叠"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
  } else {
    html += '<span class="toc-dot"></span>';
  }

  const activeClass = node.active ? ' class="active"' : '';
  html += `<a href="${node.href || `#${node.id}`}" data-level="${node.level}"${activeClass}>${node.text}</a>`;

  if (hasChildren) {
    html += '<ul class="toc-children">';
    for (const child of node.children) {
      html += renderTocNode(child);
    }
    html += '</ul>';
  }

  html += '</li>';
  return html;
}

function buildTocHtml(headings) {
  if (headings.length === 0) return '';
  const tree = buildTocTree(headings);

  let html = '<nav id="toc-nav" class="toc-tree"><ul>';
  for (const node of tree) {
    html += renderTocNode(node);
  }
  html += '</ul></nav>';
  return html;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const { createTaxonomyResolver } = require('./taxonomy');
const defaultTaxonomy = createTaxonomyResolver();

function isSamePost(post, currentPost) {
  if (!post || !currentPost) return false;
  if (post.slug && currentPost.slug && post.slug === currentPost.slug) return true;
  if (post.url && currentPost.url && post.url === currentPost.url) return true;
  return false;
}

function buildCategoryTree(posts, currentPost = null, taxonomy = defaultTaxonomy) {
  const root = { children: {}, posts: [] };

  for (const p of posts || []) {
    const segments = p.categoryPath || p.categories || [];
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

  function sortPosts(arr) {
    return arr.slice().sort((a, b) => {
      if (typeof a.sub_id === 'number' && typeof b.sub_id === 'number') return a.sub_id - b.sub_id;
      if (typeof a.sub_id === 'number') return -1;
      if (typeof b.sub_id === 'number') return 1;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  }

  function buildNode(node, level) {
    const childNames = Object.keys(node.children).sort();
    const directPosts = node.posts.filter(p => (p.categoryPath || p.categories || []).length === node.depth);
    const containsCurrent = node.posts.some(post => isSamePost(post, currentPost));

    // Build child folder nodes
    const childNodes = childNames.map(name => buildNode(node.children[name], level + 1));

    // Build post nodes for direct posts
    const postNodes = sortPosts(directPosts).map(post => ({
      type: 'post',
      level: level + 1,
      text: post.title || post.slug || 'Untitled',
      href: post.url || `./${post.slug}.html`,
      active: isSamePost(post, currentPost),
      children: [],
    }));

    // If there are both direct posts and children, group direct posts under "系列文章"
    let allChildren = childNodes;
    if (directPosts.length && childNames.length) {
      allChildren = [{
        type: 'folder',
        level: level + 1,
        text: '系列文章',
        slug: '_direct',
        collapsed: !directPosts.some(post => isSamePost(post, currentPost)),
        children: postNodes,
      }, ...childNodes];
    } else if (directPosts.length) {
      allChildren = postNodes;
    }

    const slug = taxonomy.getNameSlug(node.name);
    return {
      type: 'folder',
      level: level,
      text: node.name,
      slug: slug,
      collapsed: !containsCurrent,
      children: allChildren,
    };
  }

  return Object.keys(root.children).sort().map(name => {
    return buildNode(root.children[name], 1);
  });
}

function findCurrentCategoryPath(tree) {
  function searchNode(node, path) {
    // Check direct post children
    if ((node.children || []).some(child => child.type === 'post' && child.active)) {
      return [...path];
    }
    // Check folder children recursively
    for (const child of (node.children || [])) {
      if (child.type === 'folder') {
        // Synthetic "系列文章" folder wraps direct posts of this category.
        // If it contains the active post, the current node is the matching level —
        // do NOT drill into "系列文章".
        if (child.slug === '_direct' && (child.children || []).some(gc => gc.type === 'post' && gc.active)) {
          return [...path];
        }
        const result = searchNode(child, [...path, child.text]);
        if (result) return result;
      }
    }
    return null;
  }

  for (const category of tree) {
    const result = searchNode(category, [category.text]);
    if (result) return result;
  }
  return [];
}

function renderCategoryBrowserNode(node, path = []) {
  const hasChildren = node.children && node.children.length > 0;
  const collapsedClass = node.collapsed ? ' toc-collapsed' : '';
  let html = `<li class="category-item ${node.type === 'post' ? 'category-file' : 'category-folder'}${hasChildren ? ` toc-parent${collapsedClass}` : ''}" data-path="${escapeHtml(JSON.stringify(path))}">`;

  if (hasChildren) {
    html += '<button class="toc-toggle category-expand-toggle" aria-label="展开/折叠"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
  } else {
    html += '<span class="toc-dot"></span>';
  }

  if (node.type === 'post') {
    const activeClass = node.active ? ' active' : '';
    html += `<a class="category-file-link${activeClass}" href="${escapeHtml(node.href)}">${escapeHtml(node.text)}</a>`;
  } else {
    html += `<button class="category-folder-label" type="button">${escapeHtml(node.text)}</button>`;
  }

  if (hasChildren) {
    html += '<ul class="toc-children">';
    for (const child of node.children) {
      html += renderCategoryBrowserNode(child, path.concat(child.text));
    }
    html += '</ul>';
  }

  html += '</li>';
  return html;
}

function buildCategoryHtml(posts, currentPost = null, taxonomy = defaultTaxonomy) {
  const tree = buildCategoryTree(posts, currentPost, taxonomy);
  if (!tree.length) return '';
  const initialPath = findCurrentCategoryPath(tree);
  const dataTree = escapeHtml(JSON.stringify(tree));
  const dataInitialPath = escapeHtml(JSON.stringify(initialPath));
  let html = `<nav id="category-nav" class="toc-tree category-nav category-browser" data-tree="${dataTree}" data-initial-path="${dataInitialPath}">`;
  html += '<div class="category-browser-bar"><button class="category-back" type="button" disabled>← 返回</button><div class="category-breadcrumb">Categories</div></div>';
  html += '<div class="category-browser-list"><ul>';
  for (const node of tree) {
    html += renderCategoryBrowserNode(node, [node.text]);
  }
  html += '</ul></div></nav>';
  return html;
}

// --- Sidebar wrapper ---

function buildTocSidebar(headings, posts = [], currentPost = null, taxonomy = defaultTaxonomy) {
  const tocContent = buildTocHtml(headings);

  // Filter posts to only show articles from the same category path as current post
  let filteredPosts = posts;
  if (currentPost && currentPost.categoryPath && currentPost.categoryPath.length > 0) {
    const currentPath = currentPost.categoryPath;
    filteredPosts = posts.filter(p => {
      if (!p.categoryPath || p.categoryPath.length === 0) return false;
      // Check if post shares the same category path prefix
      const minLen = Math.min(p.categoryPath.length, currentPath.length);
      for (let i = 0; i < minLen; i++) {
        if (p.categoryPath[i] !== currentPath[i]) return false;
      }
      return true;
    });
  }

  const categoryContent = buildCategoryHtml(filteredPosts, currentPost, taxonomy);
  if (!tocContent && !categoryContent) return { sidebar: '', toggle: '' };

  const sidebar = `
<aside id="toc-sidebar" class="toc-sidebar toc-collapsed">
  ${tocContent ? `<div class="toc-section toc-main-section"><div class="toc-header">
    <span class="toc-title">目录</span>
  </div>
  <div class="toc-content toc-section-content">
    ${tocContent}
  </div></div>` : ''}
  ${tocContent && categoryContent ? '<div class="toc-split-handle" title="拖动调整目录与 Categories 高度" role="separator" aria-orientation="horizontal"></div>' : ''}
  ${categoryContent ? `<div class="toc-section categories-section"><div class="toc-header categories-header">
    <span class="toc-title">Categories</span>
  </div>
  <div class="toc-content toc-section-content categories-content">
    ${categoryContent}
  </div></div>` : ''}
  <div class="toc-resize-handle" title="拖动调整宽度"></div>
</aside>
`;

  const toggle = `
<button id="toc-toggle-btn" class="toc-toggle-btn" aria-label="切换目录">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
</button>`;

  return { sidebar, toggle };
}

module.exports = { processHeadings, buildTocHtml, buildTocSidebar, buildTocTree, buildCategoryHtml, buildCategoryTree };
