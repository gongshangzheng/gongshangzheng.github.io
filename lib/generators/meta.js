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

function buildCategoryBreadcrumb(cats, subcat, taxonomy = defaultTaxonomy) {
  if (!cats.length) return '';
  var primaryCat = cats[0];
  var html = cats.map(function (c) {
    return '<a class="meta-tag" data-cat="' + c + '" href="' + categoryUrl(c, taxonomy) + '">' + c + '</a>';
  }).join('');
  if (subcat && primaryCat) {
    html += '<span class="meta-breadcrumb-sep">/</span>' +
      '<a class="meta-tag" data-subcat="' + subcat + '" href="' + subcategoryUrl(primaryCat, subcat, taxonomy) + '">' + subcat + '</a>';
  }
  return html;
}

function buildFooterCategoryBreadcrumb(cats, subcat, taxonomy = defaultTaxonomy) {
  if (!cats.length) return '';
  var primaryCat = cats[0];
  var html = cats.map(function (c) {
    return '<a href="' + categoryUrl(c, taxonomy) + '" data-cat="' + c + '">' + c + '</a>';
  }).join('<span class="sep">, </span>');
  if (subcat && primaryCat) {
    html += '<span class="sep"> / </span>' +
      '<a href="' + subcategoryUrl(primaryCat, subcat, taxonomy) + '" data-subcat="' + subcat + '">' + subcat + '</a>';
  }
  return html;
}

// Icon SVGs used in the article meta header.
const ICON_CAL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
const ICON_EDIT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
const ICON_FOLDER = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
const ICON_CLOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
const ICON_TAG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>';

function buildArticleMeta(fm, bodyHtml, taxonomy = defaultTaxonomy) {
  var tags = parseListField(fm.tags);
  var cats = parseListField(fm.categories);
  var subcat = String(fm.subcategory || '').trim();
  if (!cats.length && !tags.length && !bodyHtml) return '';

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
  if (cats.length || bodyHtml) {
    html += '<div class="meta-primary">';
    if (cats.length) {
      html += '<span class="meta-item">' + ICON_FOLDER;
      html += buildCategoryBreadcrumb(cats, subcat, taxonomy);
      html += '</span>';
    }
    if (bodyHtml) {
      if (cats.length) html += '<span class="meta-sep">·</span>';
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
  html += '</div>';
  return html;
}

function buildArticleFooter(fm, taxonomy = defaultTaxonomy) {
  var tags = parseListField(fm.tags);
  var cats = parseListField(fm.categories);
  if (!tags.length && !cats.length) return '';
  var html = '<hr><div class="article-footer">';
  if (cats.length) {
    html += '<div class="footer-row"><span class="footer-label">Categories:</span>';
    html += buildFooterCategoryBreadcrumb(cats, String(fm.subcategory || '').trim(), taxonomy);
    html += '</div>';
  }
  if (tags.length) {
    html += '<div class="footer-row"><span class="footer-label">Tags:</span>';
    html += tags.map(function (t) {
      return '<a href="' + taxonomy.tagUrl(t) + '">' + t + '</a>';
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
  buildCategoryBreadcrumb,
  buildFooterCategoryBreadcrumb,
  buildArticleMeta,
  buildArticleFooter,
};
