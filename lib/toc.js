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
  const excludedClassRegex = /^(?:info-box|callout|admonition)(?:\s|$)/;
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
    const primaryClass = classVal.split(' ')[0];
    if (excludedClassRegex.test(primaryClass)) {
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

  // --- Single combined regex: .ch-title divs AND h2-h6, processed in document order ---
  //   Group 1: div opening tag (ch-title)    Group 2: div content
  //   Group 3: h tag name                    Group 4: h attributes   Group 5: h content
  const processed = placeholderHtml.replace(
    /<(div[^>]*class="[^"]*\bch-title\b[^"]*"[^>]*)>(.*?)<\/div>|<(h[2-6])([^>]*)>(.*?)<\/\3>/gi,
    (match, divOpen, divContent, hTag, hAttrs, hContent) => {
      if (divOpen !== undefined) {
        // .ch-title element → level 2
        const text = divContent.replace(/<[^>]*>/g, '').trim();
        if (!text) return match;
        let baseId = slugify(text);
        if (!baseId) baseId = 'chapter';
        counter[baseId] = (counter[baseId] || 0) + 1;
        const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
        headings.push({ level: 2, text, id });
        const cleanTag = divOpen.replace(/^\s*/, '');
        return `<${cleanTag} id="${id}">${divContent}</div>`;
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
        // Map h2→ch-title, h3→ch-subtitle, h4→ch-section for semantic styling
        const classMap = { 2: 'ch-title', 3: 'ch-subtitle', 4: 'ch-section' };
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

function taxonomySlug(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\/\\?#%&]/g, '-');
}

function isSamePost(post, currentPost) {
  if (!post || !currentPost) return false;
  if (post.slug && currentPost.slug && post.slug === currentPost.slug) return true;
  if (post.url && currentPost.url && post.url === currentPost.url) return true;
  return false;
}

function buildCategoryTree(posts, currentPost = null) {
  const catMap = {};
  for (const p of posts || []) {
    if (!p || !Array.isArray(p.categories) || p.categories.length === 0) continue;
    for (const cat of p.categories) {
      if (!catMap[cat]) catMap[cat] = {};
      const subcat = p.subcategory || '未分类';
      if (!catMap[cat][subcat]) catMap[cat][subcat] = [];
      catMap[cat][subcat].push(p);
    }
  }

  return Object.keys(catMap).sort().map(cat => {
    const subcatNodes = Object.keys(catMap[cat]).sort().map(subcat => {
      const postsInSubcat = catMap[cat][subcat]
        .slice()
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      const containsCurrentPost = postsInSubcat.some(post => isSamePost(post, currentPost));

      return {
        level: 2,
        text: `${escapeHtml(subcat)}`,
        href: subcat === '未分类'
          ? `./categories/${taxonomySlug(cat)}.html`
          : `./categories/${taxonomySlug(cat)}/${taxonomySlug(subcat)}.html`,
        collapsed: !containsCurrentPost,
        children: postsInSubcat.map(post => ({
          level: 3,
          text: escapeHtml(post.title || post.slug || 'Untitled'),
          href: post.url || `./${post.slug}.html`,
          active: isSamePost(post, currentPost),
          children: [],
        })),
      };
    });
    const containsCurrentPost = subcatNodes.some(node => !node.collapsed);

    return {
      level: 1,
      text: `${escapeHtml(cat)}`,
      href: `./categories/${taxonomySlug(cat)}.html`,
      collapsed: !containsCurrentPost,
      children: subcatNodes,
    };
  });
}

function buildCategoryHtml(posts, currentPost = null) {
  const tree = buildCategoryTree(posts, currentPost);
  if (!tree.length) return '';
  let html = '<nav id="category-nav" class="toc-tree category-nav"><ul>';
  for (const node of tree) {
    html += renderTocNode(node);
  }
  html += '</ul></nav>';
  return html;
}

// --- Sidebar wrapper ---

function buildTocSidebar(headings, posts = [], currentPost = null) {
  const tocContent = buildTocHtml(headings);
  const categoryContent = buildCategoryHtml(posts, currentPost);
  if (!tocContent && !categoryContent) return { sidebar: '', toggle: '' };

  const sidebar = `
<aside id="toc-sidebar" class="toc-sidebar toc-collapsed">
  ${tocContent ? `<div class="toc-section"><div class="toc-header">
    <span class="toc-title">目录</span>
  </div>
  <div class="toc-content toc-section-content">
    ${tocContent}
  </div></div>` : ''}
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
