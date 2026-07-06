/**
 * Article metadata: dates, breadcrumbs, taxonomy URLs, meta header & footer.
 * Pure functions; depend only on taxonomy resolver + parseListField.
 */

const { parseListField } = require('../parser');
const { createTaxonomyResolver } = require('../taxonomy');
const { estimateReadingTime } = require('./transform');

const defaultTaxonomy = createTaxonomyResolver();

function formatDateTime(val) {
  if (!val) return '';
  var d = val.substring(0, 10).replace(/-/g, '/');
  if (val.length > 10) {
    var t = val.substring(11, 19);
    if (t) d += ' ' + t;
  }
  return d;
}

function taxonomySlug(name, type = 'tag', parentCategory = '') {
  if (type === 'category') return defaultTaxonomy.getCategorySlug(name);
  if (type === 'subcategory') return defaultTaxonomy.getSubcategorySlug(parentCategory, name);
  return defaultTaxonomy.getTagSlug(name);
}

function categoryUrl(category, taxonomy = defaultTaxonomy) {
  return taxonomy.categoryUrl(category);
}

function subcategoryUrl(category, subcategory, taxonomy = defaultTaxonomy) {
  return taxonomy.subcategoryUrl(category, subcategory);
}

/**
 * Derive category path segments from frontmatter aliases.
 * Looks for an alias starting with "categories/" that doesn't end with "/index".
 * Falls back to legacy categories/subcategory/subsubcategory fields if no alias found.
 */
function deriveCategoryPath(fm) {
  var aliases = parseListField(fm.aliases);
  for (var i = 0; i < aliases.length; i++) {
    var raw = String(aliases[i] || '').replace(/^\/+|\/+$/g, '');
    if (raw.indexOf('categories/') === 0 && raw !== 'categories/index' && !raw.endsWith('/index')) {
      return raw.slice('categories/'.length).split('/').filter(Boolean);
    }
  }
  // Legacy fallback: derive from categories/subcategory/subsubcategory fields
  var cats = parseListField(fm.categories);
  if (!cats.length) return [];
  var path = [cats[0]];
  var sub = String(fm.subcategory || '').trim();
  var subsub = String(fm.subsubcategory || '').trim();
  if (sub) path.push(sub);
  if (subsub) path.push(subsub);
  return path;
}

function buildCategoryBreadcrumb(pathSegments, taxonomy = defaultTaxonomy) {
  if (!pathSegments || !pathSegments.length) return '';
  var html = '';
  for (var i = 0; i < pathSegments.length; i++) {
    if (i > 0) html += '<span class="meta-breadcrumb-sep">/</span>';
    var seg = pathSegments[i];
    var partial = pathSegments.slice(0, i + 1);
    var url = taxonomy.pathUrl(partial);
    html += '<a class="meta-tag" data-cat="' + seg + '" href="' + url + '">' + seg + '</a>';
  }
  return html;
}

function buildFooterCategoryBreadcrumb(pathSegments, taxonomy = defaultTaxonomy) {
  if (!pathSegments || !pathSegments.length) return '';
  var html = '';
  for (var i = 0; i < pathSegments.length; i++) {
    if (i > 0) html += '<span class="sep"> / </span>';
    var seg = pathSegments[i];
    var partial = pathSegments.slice(0, i + 1);
    var url = taxonomy.pathUrl(partial);
    html += '<a href="' + url + '" data-cat="' + seg + '">' + seg + '</a>';
  }
  return html;
}

// Icon SVGs used in the article meta header.
const ICON_CAL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
const ICON_EDIT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
const ICON_FOLDER = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
const ICON_CLOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
const ICON_TAG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>';
const ICON_PAPER = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
const ICON_REPO = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';

// Format a paper/repo URL into a human-readable label.
// arXiv:  https://arxiv.org/abs/2503.06764  → "arXiv:2503.06764"
// GitHub: https://github.com/user/repo      → "user/repo"
// Other:  hostname
function formatResourceUrl(url) {
  var arxiv = url.match(/arxiv\.org\/(abs|pdf)\/([0-9.]+)/);
  if (arxiv) return 'arXiv:' + arxiv[2];
  var gh = url.match(/github\.com\/([^/]+\/[^/]+)/);
  if (gh) return gh[1].replace(/\.git$/, '');
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return url; }
}

function buildArticleMeta(fm, bodyHtml, taxonomy = defaultTaxonomy) {
  var tags = parseListField(fm.tags);
  var categoryPath = deriveCategoryPath(fm);
  if (!categoryPath.length && !tags.length && !bodyHtml) return '';

  var html = '<div class="article-meta">';

  // Row 1: created_at + updated_at
  var hasCreated = fm.created_at;
  var createdVal = formatDateTime(fm.created_at);
  var updDateOnly = fm.updated_at ? fm.updated_at.substring(0, 10) : '';
  var hasUpdated = fm.updated_at && updDateOnly !== (fm.created_at || '').substring(0, 10);
  if (hasCreated || hasUpdated) {
    html += '<div class="meta-primary">';
    if (hasCreated) {
      html += '<span class="meta-item">' + ICON_CAL + '<span class="date">' + createdVal + '</span></span>';
    }
    if (hasUpdated) {
      if (hasCreated) html += '<span class="meta-sep">·</span>';
      html += '<span class="meta-item">' + ICON_EDIT + '<span class="date updated">' + formatDateTime(fm.updated_at) + '</span></span>';
    }
    html += '</div>';
  }

  // Row 2: categories / subcategory + reading time
  if (categoryPath.length || bodyHtml) {
    html += '<div class="meta-primary">';
    if (categoryPath.length) {
      html += '<span class="meta-item">' + ICON_FOLDER;
      html += buildCategoryBreadcrumb(categoryPath, taxonomy);
      html += '</span>';
    }
    if (bodyHtml) {
      if (categoryPath.length) html += '<span class="meta-sep">·</span>';
      html += '<span class="meta-item">' + ICON_CLOCK + '<span class="reading-time">' + estimateReadingTime(bodyHtml) + '</span></span>';
    }
    html += '</div>';
  }

  // Row 3: tags
  if (tags.length) {
    html += '<div class="meta-tags-row">';
    html += ICON_TAG;
    html += tags.map(function (t) {
      return '<a class="meta-tag" href="' + taxonomy.tagUrl(t) + '">' + t + '</a>';
    }).join('');
    html += '</div>';
  }

  // Row 4: papers
  var papers = parseListField(fm.papers);
  if (papers.length) {
    html += '<div class="meta-primary">';
    html += '<span class="meta-item">' + ICON_PAPER;
    html += papers.map(function (u) {
      return '<a class="meta-tag" href="' + u + '" target="_blank" rel="noopener">' + formatResourceUrl(u) + '</a>';
    }).join('');
    html += '</span></div>';
  }

  // Row 5: repos
  var repos = parseListField(fm.repos);
  if (repos.length) {
    html += '<div class="meta-primary">';
    html += '<span class="meta-item">' + ICON_REPO;
    html += repos.map(function (u) {
      return '<a class="meta-tag" href="' + u + '" target="_blank" rel="noopener">' + formatResourceUrl(u) + '</a>';
    }).join('');
    html += '</span></div>';
  }
  html += '</div>';
  return html;
}

function buildArticleFooter(fm, taxonomy = defaultTaxonomy) {
  var tags = parseListField(fm.tags);
  var categoryPath = deriveCategoryPath(fm);
  var papers = parseListField(fm.papers);
  var repos = parseListField(fm.repos);
  if (!tags.length && !categoryPath.length && !papers.length && !repos.length) return '';
  var html = '<hr><div class="article-footer">';
  if (categoryPath.length) {
    html += '<div class="footer-row"><span class="footer-label">Categories:</span>';
    html += buildFooterCategoryBreadcrumb(categoryPath, taxonomy);
    html += '</div>';
  }
  if (tags.length) {
    html += '<div class="footer-row"><span class="footer-label">Tags:</span>';
    html += tags.map(function (t) {
      return '<a href="' + taxonomy.tagUrl(t) + '">' + t + '</a>';
    }).join('<span class="sep">, </span>');
    html += '</div>';
  }
  if (papers.length) {
    html += '<div class="footer-row"><span class="footer-label">Papers:</span>';
    html += papers.map(function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + formatResourceUrl(u) + '</a>';
    }).join('<span class="sep">, </span>');
    html += '</div>';
  }
  if (repos.length) {
    html += '<div class="footer-row"><span class="footer-label">Repos:</span>';
    html += repos.map(function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + formatResourceUrl(u) + '</a>';
    }).join('<span class="sep">, </span>');
    html += '</div>';
  }
  html += '</div>';
  return html;
}

module.exports = {
  defaultTaxonomy,
  formatDateTime,
  taxonomySlug,
  categoryUrl,
  subcategoryUrl,
  deriveCategoryPath,
  buildCategoryBreadcrumb,
  buildFooterCategoryBreadcrumb,
  buildArticleMeta,
  buildArticleFooter,
};
