/**
 * TOC (Table of Contents) Generator
 * Extracts h2-h6 headings from HTML and builds a TOC sidebar
 */

// Slugify heading text for use as ID (preserves CJK characters)
function slugify(text) {
  return text
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // Keep Unicode letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')           // Trim leading/trailing hyphens
    .substring(0, 60) || 'section';
}

// Add IDs to headings in HTML body and return modified HTML + heading data
function processHeadings(bodyHtml) {
  const headings = [];
  let counter = {};

  // Process .ch-title elements as h3-level headings for TOC
  bodyHtml = bodyHtml.replace(
    /<(div[^>]*class="[^"]*\bch-title\b[^"]*"[^>]*)>(.*?)<\/div>/gi,
    (match, openTag, content) => {
      // Extract title text (strip inner tags)
      const text = content.replace(/<[^>]*>/g, '').trim();
      if (!text) return match;
      let baseId = slugify(text);
      if (!baseId) baseId = 'chapter';
      counter[baseId] = (counter[baseId] || 0) + 1;
      const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
      headings.push({ level: 3, text, id });
      // Add id to the div
      const newOpenTag = openTag.replace(/\s+id="[^"]*"/, '') + ` id="${id}"`;
      return `<div${newOpenTag}>${content}</div>`;
    }
  );

  // Replace h2-h6 tags with id versions
  const processed = bodyHtml.replace(
    /<(h[2-6])[^>]*>(.*?)<\/\1>/gi,
    (match, tag, content) => {
      const level = parseInt(tag[1]);
      // Strip HTML tags from content for slug
      const text = content.replace(/<[^>]*>/g, '').trim();
      let baseId = slugify(text);
      if (!baseId) baseId = 'section';
      // Deduplicate IDs
      counter[baseId] = (counter[baseId] || 0) + 1;
      const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;

      headings.push({ level, text, id });
      return `<${tag} id="${id}">${content}</${tag}>`;
    }
  );

  return { html: processed, headings };
}

// Build TOC HTML from headings array
function buildTocHtml(headings) {
  if (headings.length === 0) return '';

  let html = '<nav id="toc-nav"><ul>';
  let prevLevel = 2;

  for (const h of headings) {
    if (h.level > prevLevel) {
      html += '<ul>'.repeat(h.level - prevLevel);
    } else if (h.level < prevLevel) {
      html += '</ul>'.repeat(prevLevel - h.level);
    }
    prevLevel = h.level;
    html += `<li><a href="#${h.id}" data-target="${h.id}">${h.text}</a></li>`;
  }

  html += '</ul>'.repeat(prevLevel - 2);
  html += '</ul></nav>';
  return html;
}

// Build full TOC sidebar HTML
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
</aside>`;

  const toggle = `
<button id="toc-toggle-btn" class="toc-toggle-btn" aria-label="切换目录">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
</button>`;

  return { sidebar, toggle };
}

module.exports = { processHeadings, buildTocHtml, buildTocSidebar };
