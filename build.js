#!/usr/bin/env node
/**
 * gongshangzheng.github.io Build Script
 * Incremental build with cache-aware asset copy and summary output.
 */

const fs = require('fs');
const path = require('path');
const { CONFIG, RECENT_COUNT, PATHS } = require('./lib/config');
const { parseFrontmatter, parseListField } = require('./lib/parser');
const { copyDir, walkDir, walkFiles } = require('./lib/utils');
const { collectFileSignatures, createBuildCache, sha1 } = require('./lib/build-cache');
const { ensureArticleSlugs, getArticleSlug } = require('./lib/article-slugs');
const { ensureTaxonomyRegistry } = require('./lib/taxonomy');
const { buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch, buildIndex, buildRss } = require('./lib/generator');

const CACHE_PATH = path.join(PATHS.root, '.cache', 'build-manifest.json');
const cache = createBuildCache(CACHE_PATH);
const BUILD_FORCE = process.env.FORCE_BUILD === '1' || process.argv.includes('--full');
const BUILD_VERBOSE = process.env.BUILD_VERBOSE === '1';

function logVerbose(message) {
  if (BUILD_VERBOSE) console.log(message);
}

function logSummary(label, stats) {
  if (typeof stats === 'string') {
    console.log(`✓ ${label}: ${stats}`);
    return;
  }
  const parts = [];
  if (typeof stats.built === 'number') parts.push(`${stats.built} built`);
  if (typeof stats.reused === 'number') parts.push(`${stats.reused} reused`);
  if (typeof stats.copied === 'number') parts.push(`${stats.copied} copied`);
  if (typeof stats.skipped === 'number') parts.push(`${stats.skipped} skipped`);
  if (typeof stats.removed === 'number' && stats.removed > 0) parts.push(`${stats.removed} removed`);
  if (typeof stats.total === 'number') parts.push(`${stats.total} total`);
  console.log(`✓ ${label}: ${parts.join(', ')}`);
}

function buildContext(pageData = {}) {
  return {
    title: CONFIG.site.title,
    site_title: CONFIG.site.title,
    description: CONFIG.site.description,
    author: CONFIG.site.author,
    url: CONFIG.site.url,
    base_url: CONFIG.site.base_url || '/',
    ...pageData,
    nav: CONFIG.nav,
    year: new Date().getFullYear()
  };
}

function collectPosts() {
  const posts = [];
  const pageFiles = walkDir(PATHS.pages);
  const rawRecords = [];

  for (const file of pageFiles) {
    const bn = path.basename(file);
    if (!bn.endsWith('.md') && !bn.endsWith('.html')) continue;
    if (bn.startsWith('index.') || bn.startsWith('about.')) continue;

    const raw = fs.readFileSync(file, 'utf8');
    const { data: fm } = parseFrontmatter(raw);
    const fallbackTitle = path.basename(file, path.extname(file));
    const sourcePath = path.relative(PATHS.root, file).replace(/\\/g, '/');

    rawRecords.push({
      file,
      sourcePath,
      title: fm.title || fallbackTitle,
      description: fm.description || '',
      tags: parseListField(fm.tags),
      categories: parseListField(fm.categories),
      subcategory: String(fm.subcategory || '').trim(),
      subcategory_index: typeof fm.subcategory_index === 'number' ? fm.subcategory_index : null,
      aliases: parseListField(fm.aliases),
      created_at: fm.created_at || '',
      updated_at: fm.updated_at || '',
    });
  }

  const articleRegistry = ensureArticleSlugs(rawRecords.map(r => ({ sourcePath: r.sourcePath, title: r.title })));

  for (const record of rawRecords) {
    const slug = getArticleSlug(articleRegistry, record.sourcePath);
    posts.push({
      ...record,
      slug,
      url: `./${slug}.html`,
    });
  }

  posts.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  return posts;
}

function buildCss() {
  const cssDir = path.join(PATHS.assets, 'css');
  const manifestPath = path.join(cssDir, 'css-manifest.json');
  const modulesDir = path.join(cssDir, 'modules');
  const publicCssDir = path.join(PATHS.public, 'assets', 'css');

  if (!fs.existsSync(manifestPath)) return { built: 0, reused: 0, total: 0 };

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const sourceHash = sha1([
    fs.readFileSync(manifestPath, 'utf8'),
    ...manifest.always.map(name => fs.existsSync(path.join(modulesDir, name + '.css')) ? fs.readFileSync(path.join(modulesDir, name + '.css'), 'utf8') : ''),
    ...Object.keys(manifest.optional).map(name => fs.existsSync(path.join(modulesDir, name + '.css')) ? fs.readFileSync(path.join(modulesDir, name + '.css'), 'utf8') : '')
  ].join('\n/* split */\n'));

  const prevHash = cache.getGlobal('cssHash');
  const canReuse = !BUILD_FORCE && prevHash === sourceHash && fs.existsSync(path.join(publicCssDir, 'hugo-theme.css'));
  if (canReuse) {
    return { built: 0, reused: manifest.always.length + Object.keys(manifest.optional).length, total: manifest.always.length + Object.keys(manifest.optional).length };
  }

  fs.mkdirSync(publicCssDir, { recursive: true });
  const header = '/* ========================================\n   gongshangzheng.github.io Theme — Auto-generated from modules\n   Do not edit hugo-theme.css directly — edit modules/*.css instead\n   ======================================== */\n\n';
  const merged = manifest.always.reduce((acc, mod) => {
    const modPath = path.join(modulesDir, mod + '.css');
    if (fs.existsSync(modPath)) return acc + fs.readFileSync(modPath, 'utf8') + '\n';
    return acc;
  }, header);
  fs.writeFileSync(path.join(publicCssDir, 'hugo-theme.css'), merged);

  const optDir = path.join(publicCssDir, 'modules');
  fs.rmSync(optDir, { recursive: true, force: true });
  fs.mkdirSync(optDir, { recursive: true });
  for (const name of Object.keys(manifest.optional)) {
    const src = path.join(modulesDir, name + '.css');
    if (fs.existsSync(src)) {
      fs.writeFileSync(path.join(optDir, name + '.css'), fs.readFileSync(src, 'utf8'));
    }
  }

  cache.setGlobal('cssHash', sourceHash);
  return { built: manifest.always.length + Object.keys(manifest.optional).length, reused: 0, total: manifest.always.length + Object.keys(manifest.optional).length };
}

function computePageSourceHash(filePath) {
  return sha1(fs.readFileSync(filePath, 'utf8'));
}

function buildGlobalsFingerprint() {
  const templatesSig = collectFileSignatures(PATHS.templates);
  const libSig = collectFileSignatures(path.join(PATHS.root, 'lib'), (filePath) => filePath.endsWith('.js'));
  const configHash = fs.existsSync(path.join(PATHS.root, 'config.json'))
    ? sha1(fs.readFileSync(path.join(PATHS.root, 'config.json'), 'utf8'))
    : '';
  const taxonomyRegistryHash = fs.existsSync(path.join(PATHS.root, 'data', 'taxonomy-slugs.json'))
    ? sha1(fs.readFileSync(path.join(PATHS.root, 'data', 'taxonomy-slugs.json'), 'utf8'))
    : '';
  const articleRegistryHash = fs.existsSync(path.join(PATHS.root, 'data', 'article-slugs.json'))
    ? sha1(fs.readFileSync(path.join(PATHS.root, 'data', 'article-slugs.json'), 'utf8'))
    : '';
  return {
    templatesHash: templatesSig.hash,
    libHash: libSig.hash,
    configHash,
    taxonomyRegistryHash,
    articleRegistryHash,
    combined: sha1([templatesSig.hash, libSig.hash, configHash, taxonomyRegistryHash, articleRegistryHash].join('|')),
  };
}

function postsFingerprint(allPosts) {
  return sha1(JSON.stringify(allPosts.map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    categories: p.categories,
    subcategory: p.subcategory,
    aliases: p.aliases,
    created_at: p.created_at,
    updated_at: p.updated_at,
    url: p.url,
  }))));
}

function build() {
  console.log('🔨 Building gongshangzheng.github.io...\n');

  fs.mkdirSync(PATHS.public, { recursive: true });

  const assetStats = copyDir(
    PATHS.assets,
    path.join(PATHS.public, 'assets'),
    (srcPath) => {
      const rel = path.relative(PATHS.assets, srcPath).replace(/\\/g, '/');
      if (rel === 'css/hugo-theme.css') return false;
      if (rel === 'css/css-manifest.json') return false;
      if (rel.startsWith('css/modules/')) return false;
      return true;
    }
  );
  const mediaDir = path.join(PATHS.src, 'media');
  const mediaStats = copyDir(mediaDir, path.join(PATHS.public, 'media'));
  const audioStats = copyDir(mediaDir, path.join(PATHS.public, 'audio'), (srcPath) => /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(srcPath));
  const cssStats = buildCss();

  const allPosts = collectPosts();
  const taxonomy = ensureTaxonomyRegistry(allPosts);
  const firstBuild = !cache.getGlobal('globalFingerprint');
  const globals = buildGlobalsFingerprint();
  const prevGlobals = cache.getGlobal('globalFingerprint');
  const globalChanged = BUILD_FORCE || !prevGlobals || prevGlobals !== globals.combined;

  const pageFiles = walkDir(PATHS.pages);
  const pageHashes = {};
  const changedPageFiles = [];
  const removedPages = [];

  const currentPageSet = new Set(pageFiles.map(f => path.resolve(f)));
  const cachedPages = cache.data.pages || {};
  Object.keys(cachedPages).forEach(key => {
    if (!currentPageSet.has(key)) {
      removedPages.push(key);
      cache.deletePage(key);
    }
  });

  for (const file of pageFiles) {
    const resolved = path.resolve(file);
    const pageHash = computePageSourceHash(file);
    pageHashes[resolved] = pageHash;
    const prev = cache.getPage(resolved);
    const sourcePath = path.relative(PATHS.root, file).replace(/\\/g, '/');
    const outSlug = allPosts.find(p => p.sourcePath === sourcePath)?.slug || path.basename(file, path.extname(file));
    const outName = outSlug + '.html';
    const outPath = path.join(PATHS.public, outName);
    const changed = globalChanged || BUILD_FORCE || !prev || prev.sourceHash !== pageHash || !fs.existsSync(outPath);
    if (changed) changedPageFiles.push(file);
  }

  const articleStats = buildArticles(PATHS, allPosts, buildContext, RECENT_COUNT, {
    onlyFiles: changedPageFiles,
    taxonomy,
    onBuilt(file) {
      const resolved = path.resolve(file);
      cache.setPage(resolved, {
        sourceHash: pageHashes[resolved],
        output: (allPosts.find(p => p.sourcePath === path.relative(PATHS.root, file).replace(/\\/g, '/'))?.slug || path.basename(file, path.extname(file))) + '.html',
      });
    },
  });

  const allPostsHash = postsFingerprint(allPosts);
  const derivedBaseHash = sha1([allPostsHash, globals.combined].join('|'));

  let postsPageStats;
  const postsPageHash = sha1(['posts-page', derivedBaseHash, String(RECENT_COUNT)].join('|'));
  const postsPageOut = path.join(PATHS.public, 'posts', 'index.html');
  if (!BUILD_FORCE && !firstBuild && cache.getGlobal('postsPageHash') === postsPageHash && fs.existsSync(postsPageOut)) {
    postsPageStats = { built: 0, reused: 1, total: 1 };
  } else {
    buildPostsPage(PATHS, allPosts, buildContext);
    cache.setGlobal('postsPageHash', postsPageHash);
    postsPageStats = { built: 1, reused: 0, total: 1 };
  }

  let taxonomyStats;
  const taxonomyHash = sha1(['taxonomy', derivedBaseHash].join('|'));
  const taxonomyOut = path.join(PATHS.public, 'tags', 'index.html');
  if (!BUILD_FORCE && !firstBuild && cache.getGlobal('taxonomyHash') === taxonomyHash && fs.existsSync(taxonomyOut)) {
    const prev = cache.getGlobal('taxonomyStats') || { tags: 0, categories: 0, subcategories: 0, total: 0 };
    taxonomyStats = { ...prev, built: 0, reused: prev.total };
  } else {
    const builtTaxonomy = buildTaxonomyPages(PATHS, allPosts, buildContext, taxonomy);
    cache.setGlobal('taxonomyHash', taxonomyHash);
    cache.setGlobal('taxonomyStats', builtTaxonomy);
    taxonomyStats = { ...builtTaxonomy, built: builtTaxonomy.total, reused: 0 };
  }

  let searchStats;
  const searchHash = sha1(['search', derivedBaseHash].join('|'));
  const searchOut = path.join(PATHS.public, 'search-index.json');
  if (!BUILD_FORCE && !firstBuild && cache.getGlobal('searchHash') === searchHash && fs.existsSync(searchOut)) {
    const prev = cache.getGlobal('searchCount') || 0;
    searchStats = { built: 0, reused: prev, total: prev };
  } else {
    const count = buildSearch(PATHS, allPosts);
    cache.setGlobal('searchHash', searchHash);
    cache.setGlobal('searchCount', count);
    searchStats = { built: count, reused: 0, total: count };
  }

  let indexStats;
  const indexHash = sha1(['post-index', derivedBaseHash].join('|'));
  const indexOut = path.join(PATHS.public, 'post-index.json');
  if (!BUILD_FORCE && !firstBuild && cache.getGlobal('postIndexHash') === indexHash && fs.existsSync(indexOut)) {
    const prev = cache.getGlobal('postIndexCount') || 0;
    indexStats = { built: 0, reused: prev, total: prev };
  } else {
    const count = buildIndex(PATHS, allPosts);
    cache.setGlobal('postIndexHash', indexHash);
    cache.setGlobal('postIndexCount', count);
    indexStats = { built: count, reused: 0, total: count };
  }

  let rssStats;
  const rssHash = sha1(['rss', derivedBaseHash].join('|'));
  const rssOut = path.join(PATHS.public, 'feed.xml');
  if (!BUILD_FORCE && !firstBuild && cache.getGlobal('rssHash') === rssHash && fs.existsSync(rssOut)) {
    const prev = cache.getGlobal('rssCount') || 0;
    rssStats = { built: 0, reused: prev, total: prev };
  } else {
    const count = buildRss(PATHS, allPosts, buildContext);
    cache.setGlobal('rssHash', rssHash);
    cache.setGlobal('rssCount', count);
    rssStats = { built: count, reused: 0, total: count };
  }

  cache.setGlobal('globalFingerprint', globals.combined);
  cache.save();

  logSummary('assets', assetStats);
  logSummary('media', mediaStats);
  logSummary('audio', audioStats);
  logSummary('css', cssStats);
  logSummary('posts', { total: allPosts.length });
  logSummary('articles', { built: articleStats.built, reused: articleStats.reused, total: articleStats.total });
  logSummary('posts listing', postsPageStats);
  logSummary('taxonomy', { built: taxonomyStats.built, reused: taxonomyStats.reused, total: taxonomyStats.total });
  logSummary('search index', searchStats);
  logSummary('post index', indexStats);
  logSummary('rss', rssStats);
  if (removedPages.length) logVerbose(`Removed cache entries: ${removedPages.length}`);

  console.log('\n✅ Build complete!');
}

build();
