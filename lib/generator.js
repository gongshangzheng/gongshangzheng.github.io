/**
 * Backwards-compatible facade for the previously-monolithic generator module.
 *
 * Implementation lives in lib/generators/*.js; this file re-exports the
 * stable surface so existing callers (build.js, tests, etc.) keep working.
 *
 *   articles.js        — buildArticles (per-page pipeline + slide branch)
 *   taxonomy-pages.js  — buildPostsPage, buildTaxonomyPages (incl. alias hubs)
 *   feeds.js           — buildSearch, buildIndex, buildRss
 *   post-list.js       — renderPostList, renderSortableList
 *   page.js            — assemblePage, buildHero (template assembly)
 *   transform.js       — body-text transforms (tables, code, paragraphs, LaTeX)
 *   meta.js            — article meta header/footer + taxonomy URLs
 *   scripts.js         — inline runtime scripts (PDF.js, slide-state restore)
 */

const { buildArticles } = require('./generators/articles');
const { buildPostsPage, buildTaxonomyPages } = require('./generators/taxonomy-pages');
const { buildSearch, buildIndex, buildRss } = require('./generators/feeds');
const { renderPostList, renderSortableList } = require('./generators/post-list');
const { renderPostGraph } = require('./generators/post-graph');
const {
  transformLatex,
  transformMarkdownTables,
  transformTableCaptionScroll,
  transformFencedCodeBlocks,
  wrapBareParagraphs,
} = require('./generators/transform');
const {
  buildPdfJsScript,
  buildSlideStateRestoreScript,
  injectSlideStateRestore,
} = require('./generators/scripts');
const {
  taxonomySlug,
  categoryUrl,
  subcategoryUrl,
} = require('./generators/meta');

module.exports = {
  renderPostList,
  renderSortableList,
  renderPostGraph,
  buildArticles,
  buildPostsPage,
  buildTaxonomyPages,
  buildSearch,
  buildIndex,
  buildRss,
  transformLatex,
  transformMarkdownTables,
  transformTableCaptionScroll,
  transformFencedCodeBlocks,
  buildPdfJsScript,
  buildSlideStateRestoreScript,
  injectSlideStateRestore,
  taxonomySlug,
  categoryUrl,
  subcategoryUrl,
  wrapBareParagraphs,
};
