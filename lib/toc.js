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
  const excludedClassRegex = /^(?:info-box|callout|admonition|section)(?:\s|$)/;
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
        // Strip any existing id from attrs to avoid duplicate id attributes
        const cleanAttrs = (hAttrs || '').replace(/\s*id="[^"]*"/gi, '');
        return `<${hTag}${cleanAttrs} id="${id}">${hContent}</${hTag}>`;
      }
    }
  );

  // Restore excluded containers
  let finalHtml = processed;
  for (let p = placeholders.length - 1; p >= 0; p--) {
    finalHtml = finalHtml.replace(`<!--TOC_EXCLUDE_${p}-->`, placeholders[p]);
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

  let html = '<li';
  if (hasChildren) html += ' class="toc-parent"';
  html += '>';

  html += `<a href="#${node.id}" data-level="${node.level}">${node.text}</a>`;

  if (hasChildren) {
    html += '<button class="toc-toggle" aria-label="展开/折叠"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
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

  let html = '<nav id="toc-nav"><ul>';
  for (const node of tree) {
    html += renderTocNode(node);
  }
  html += '</ul></nav>';
  return html;
}

// --- Sidebar wrapper ---

function buildTocSidebar(headings) {
  const tocContent = buildTocHtml(headings);
  if (!tocContent) return { sidebar: '', toggle: '' };

  const sidebar = `
<aside id="toc-sidebar" class="toc-sidebar toc-expanded">
  <div class="toc-header">
    <span class="toc-title">目录</span>
  </div>
  <div class="toc-content">
    ${tocContent}
  </div>
</aside>
`;

  const toggle = `
<button id="toc-toggle-btn" class="toc-toggle-btn" aria-label="切换目录">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
</button>`;

  return { sidebar, toggle };
}

module.exports = { processHeadings, buildTocHtml, buildTocSidebar, buildTocTree };
