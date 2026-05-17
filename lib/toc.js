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

  // Temporarily replace excluded containers with placeholders so their
  // inner headings are not added to the TOC.
  // Excluded: .info-box, .callout, .admonition, .section
  const excluded = [];
  const excludePattern = /<div\s+class="(?:info-box|callout|admonition[^"]*|section(?:\s[^"]*)?)"[^>]*>[\s\S]*?<\/div>\s*$/gm;
  // Use a depth-aware extraction for excluded containers
  const excludedClassRegex = /^(?:info-box|callout|admonition|section)(?:\s|$)/;
  let placeholderHtml = bodyHtml;
  const placeholders = [];

  // Simple scan: find opening tags of excluded containers and depth-match
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
      // Depth-match to find closing </div>
      const gt = placeholderHtml.indexOf('>', classEnd);
      if (gt === -1) { scanIdx = classEnd; continue; }
      let depth = 1;
      let i = gt + 1;
      while (i < placeholderHtml.length && depth > 0) {
        if (placeholderHtml.substring(i, i + 5) === '<div ') { depth++; i = placeholderHtml.indexOf('>', i) + 1; }
        else if (placeholderHtml.substring(i, i + 5) === '<div>') { depth++; i += 5; }
        else if (placeholderHtml.substring(i, i + 6) === '</div>') { depth--; i += 6; }
        else i++;
      }
      // Replace with placeholder
      const ph = `<!--TOC_EXCLUDE_${placeholders.length}-->`;
      placeholders.push(placeholderHtml.substring(divIdx, i));
      placeholderHtml = placeholderHtml.substring(0, divIdx) + ph + placeholderHtml.substring(i);
      scanIdx = divIdx + ph.length;
    } else {
      scanIdx = classEnd;
    }
  }

  // Process .ch-title elements as h3-level headings for TOC
  placeholderHtml = placeholderHtml.replace(
    /<(div[^>]*class="[^"]*\bch-title\b[^"]*"[^>]*)>(.*?)<\/div>/gi,
    (match, openTag, content) => {
      const text = content.replace(/<[^>]*>/g, '').trim();
      if (!text) return match;
      let baseId = slugify(text);
      if (!baseId) baseId = 'chapter';
      counter[baseId] = (counter[baseId] || 0) + 1;
      const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
      headings.push({ level: 2, text, id });
      const cleanTag = openTag.replace(/^\s*/, '');
      const newOpenTag = `<${cleanTag} id="${id}">`;
      return `${newOpenTag}${content}</div>`;
    }
  );

  // Replace h2-h6 tags with id versions
  const processed = placeholderHtml.replace(
    /<(h[2-6])[^>]*>(.*?)<\/\1>/gi,
    (match, tag, content) => {
      const level = parseInt(tag[1]);
      const text = content.replace(/<[^>]*>/g, '').trim();
      let baseId = slugify(text);
      if (!baseId) baseId = 'section';
      counter[baseId] = (counter[baseId] || 0) + 1;
      const id = counter[baseId] > 1 ? `${baseId}-${counter[baseId]}` : baseId;
      headings.push({ level, text, id });
      return `<${tag} id="${id}">${content}</${tag}>`;
    }
  );

  // Restore excluded containers
  let finalHtml = processed;
  for (let p = placeholders.length - 1; p >= 0; p--) {
    finalHtml = finalHtml.replace(`<!--TOC_EXCLUDE_${p}-->`, placeholders[p]);
  }

  return { html: finalHtml, headings };
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
    html += `<li><a href="#${h.id}" data-target="${h.id}" data-level="${h.level}">${h.text}</a></li>`;
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
</aside>
`;

  const toggle = `
<button id="toc-toggle-btn" class="toc-toggle-btn" aria-label="切换目录">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
</button>`;

  return { sidebar, toggle };
}

module.exports = { processHeadings, buildTocHtml, buildTocSidebar };
