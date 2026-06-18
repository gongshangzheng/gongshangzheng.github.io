#!/usr/bin/env node
/**
 * gongshangzheng.github.io Build Script
 * Incremental build with cache-aware asset copy and summary output.
 */

const fs = require('fs');
const path = require('path');
const { CONFIG, RECENT_COUNT, PATHS } = require('./lib/config');
const { parseFrontmatter, parseListField } = require('./lib/parser');
const { copyDir, walkDir, walkFiles, writePublic } = require('./lib/utils');
const { collectFileSignatures, createBuildCache, sha1 } = require('./lib/build-cache');
const { ensureArticleSlugs, getArticleSlug } = require('./lib/article-slugs');
const { ensureTaxonomyRegistry } = require('./lib/taxonomy');
const { buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch, buildIndex, buildRss } = require('./lib/generator');
const {
  exportPostGraphIndex,
  loadPostGraphDb,
  savePostGraphDb,
  updatePostGraphDb,
} = require('./lib/post-graph-db');

const { execSync } = require('child_process');

const CACHE_PATH = path.join(PATHS.root, '.cache', 'build-manifest.json');
const POST_GRAPH_DB_PATH = path.join(PATHS.root, '.cache', 'post-graph-db.json');
const cache = createBuildCache(CACHE_PATH, PATHS.root);
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
    PAGE_STYLE: '',
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

    // Exclude files with `excluded: true` from post list
    if (fm.excluded) continue;

    rawRecords.push({
      file,
      sourcePath,
      title: fm.title || fallbackTitle,
      description: fm.description || '',
      tags: parseListField(fm.tags),
      categories: parseListField(fm.categories),
      subcategory: String(fm.subcategory || '').trim(),
      subcategory_index: typeof fm.subcategory_index === 'number' ? fm.subcategory_index : null,
      sub_id: typeof fm.sub_id === 'number' ? fm.sub_id : null,
      aliases: parseListField(fm.aliases),
      pin: fm.pin === true || String(fm.pin).toLowerCase() === 'true',
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
    pin: p.pin === true,
    created_at: p.created_at,
    updated_at: p.updated_at,
    url: p.url,
  }))));
}

function collectPostGraphSources(allPosts) {
  const sourceContents = {};
  const sourceHashes = {};

  allPosts.forEach(post => {
    const raw = fs.readFileSync(post.file, 'utf8');
    sourceContents[post.sourcePath] = raw;
    sourceHashes[post.sourcePath] = sha1(raw);
  });

  return { sourceContents, sourceHashes };
}

/**
 * Auto-convert any non-WebP images in media/images/ to WebP.
 * - PNG/JPG/JPEG → cwebp -q 80 (or -lossless for files < 50KB)
 * - PDF (image-PDFs in media/images/) → pdftoppm → cwebp -q 80
 * - GIF: skipped (animation not preserved by cwebp)
 * - media/pdf/ (documents): untouched
 * Deletes originals after successful conversion.
 * Also updates src="..." references in articles from old extensions to .webp.
 */
function convertMediaImagesToWebP() {
  const imagesDir = path.join(PATHS.media, 'images');
  if (!fs.existsSync(imagesDir)) return { converted: 0, updated: 0 };

  const stats = { converted: 0, updated: 0 };
  const CONVERTIBLE = /\.(png|jpe?g|pdf|gif)$/i;

  // Collect all convertible files
  const files = walkFiles(imagesDir, (fullPath) => CONVERTIBLE.test(fullPath));

  for (const srcFile of files) {
    const ext = path.extname(srcFile).toLowerCase();
    const base = srcFile.replace(/\.[^.]+$/, '');
    const webpFile = base + '.webp';

    // Skip if WebP already exists
    if (fs.existsSync(webpFile)) {
      fs.unlinkSync(srcFile);
      continue;
    }

    try {
      if (ext === '.pdf') {
        // PDF → PNG → WebP
        const tmpPng = base + '_tmp_convert.png';
        execSync(`pdftoppm -png -r 200 -singlefile "${srcFile}" "${base}_tmp_convert"`, { stdio: 'pipe' });
        if (fs.existsSync(tmpPng)) {
          execSync(`cwebp -q 80 "${tmpPng}" -o "${webpFile}"`, { stdio: 'pipe' });
          fs.unlinkSync(tmpPng);
        }
      } else if (ext === '.gif') {
        // GIF → animated WebP (preserves animation)
        execSync(`gif2webp -q 80 "${srcFile}" -o "${webpFile}"`, { stdio: 'pipe' });
      } else {
        // PNG/JPG/JPEG → WebP
        const srcStat = fs.statSync(srcFile);
        const flag = srcStat.size < 51200 ? '-lossless' : '-q 80';
        execSync(`cwebp ${flag} "${srcFile}" -o "${webpFile}"`, { stdio: 'pipe' });
      }

      if (fs.existsSync(webpFile)) {
        fs.unlinkSync(srcFile);
        stats.converted++;
      }
    } catch (e) {
      // Conversion failed — keep original
      console.log(`  ⚠ Failed to convert: ${path.relative(PATHS.root, srcFile)}`);
    }
  }

  // Update article references: replace .png/.jpg/.jpeg/.pdf/.gif → .webp for images that now exist as WebP
  const pagesDir = PATHS.pages;
  if (fs.existsSync(pagesDir)) {
    const htmlFiles = walkFiles(pagesDir, (f) => f.endsWith('.html'));
    for (const htmlFile of htmlFiles) {
      let content = fs.readFileSync(htmlFile, 'utf8');
      const original = content;
      content = content.replace(
        /src="(media\/images\/[^"]*?)\.(png|jpe?g|pdf|gif)"/g,
        (match, prefix, ext) => {
          const webpPath = path.join(PATHS.root, prefix + '.webp');
          if (fs.existsSync(webpPath)) {
            stats.updated++;
            return `src="${prefix}.webp"`;
          }
          return match;
        }
      );
      if (content !== original) {
        fs.writeFileSync(htmlFile, content, 'utf8');
      }
    }
  }

  return stats;
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
  const webpStats = convertMediaImagesToWebP();
  if (webpStats.converted > 0 || webpStats.updated > 0) {
    console.log(`✓ webp: ${webpStats.converted} converted, ${webpStats.updated} article refs updated`);
  }
  const mediaStats = copyDir(PATHS.media, path.join(PATHS.public, 'media'));
  const audioStats = copyDir(PATHS.media, path.join(PATHS.public, 'audio'), (srcPath) => /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(srcPath));
  const cssStats = buildCss();

  const allPosts = collectPosts();
  const taxonomy = ensureTaxonomyRegistry(allPosts);
  const graphSources = collectPostGraphSources(allPosts);
  const postGraphUpdate = updatePostGraphDb(loadPostGraphDb(POST_GRAPH_DB_PATH), allPosts, {
    force: BUILD_FORCE,
    sourceContents: graphSources.sourceContents,
    sourceHashes: graphSources.sourceHashes,
  });
  const postGraphIndex = exportPostGraphIndex(postGraphUpdate.graphDb);
  const postGraphHash = sha1(JSON.stringify(postGraphIndex));
  const postGraphChanged = BUILD_FORCE || cache.getGlobal('postGraphHash') !== postGraphHash;
  savePostGraphDb(POST_GRAPH_DB_PATH, postGraphUpdate.graphDb);
  writePublic(PATHS.public, 'post-graph-index.json', JSON.stringify(postGraphIndex, null, 2));

  const firstBuild = !cache.getGlobal('globalFingerprint');
  const globals = buildGlobalsFingerprint();
  const prevGlobals = cache.getGlobal('globalFingerprint');
  const globalChanged = BUILD_FORCE || !prevGlobals || prevGlobals !== globals.combined;

  const pageFiles = walkDir(PATHS.pages);
  const pageHashes = {};
  const changedPageFiles = [];
  const removedPages = [];

  const currentPageSet = new Set(pageFiles.map(f => path.relative(PATHS.root, f).replace(/\\/g, '/')));
  const cachedPages = cache.data.pages || {};
  Object.keys(cachedPages).forEach(key => {
    if (!currentPageSet.has(key)) {
      // Delete stale output file before removing cache entry
      const staleEntry = cache.getPage(key);
      if (staleEntry && staleEntry.output) {
        const stalePath = path.join(PATHS.public, staleEntry.output);
        if (fs.existsSync(stalePath)) {
          fs.unlinkSync(stalePath);
        }
      }
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
    const usesPostGraph = fs.readFileSync(file, 'utf8').indexOf('{{< post-graph') >= 0;
    const changed = globalChanged || BUILD_FORCE || !prev || prev.sourceHash !== pageHash || !fs.existsSync(outPath) || (postGraphChanged && usesPostGraph);
    if (changed) changedPageFiles.push(file);
  }

  const articleStats = buildArticles(PATHS, allPosts, buildContext, RECENT_COUNT, {
    onlyFiles: changedPageFiles,
    taxonomy,
    postGraph: postGraphIndex,
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
  cache.setGlobal('postGraphHash', postGraphHash);
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
  logSummary('post graph', { built: postGraphUpdate.stats.updated, reused: postGraphUpdate.stats.reused, removed: postGraphUpdate.stats.removed, total: postGraphUpdate.stats.total });
  logSummary('post index', indexStats);
  logSummary('rss', rssStats);
  if (removedPages.length) logVerbose(`Removed cache entries: ${removedPages.length}`);

  console.log('\n✅ Build complete!');
}

build();
