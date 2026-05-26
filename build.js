#!/usr/bin/env node
/**
 * HtmlBlogs Build Script
 * Modular build system supporting .md and .html source files
 */

const fs = require('fs');
const path = require('path');
const { CONFIG, RECENT_COUNT, PATHS } = require('./lib/config');
const { parseFrontmatter, parseListField } = require('./lib/parser');
const { copyDir, walkDir } = require('./lib/utils');
const { buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch, buildIndex } = require('./lib/generator');

// Run unit tests before build (non-blocking)
// Tests must pass before building — exit on failure
function runTests() {
  const testFiles = fs.readdirSync(path.join(__dirname, 'tests'))
    .filter(f => f.endsWith('.test.js'));
  if (testFiles.length === 0) return;

  const { tests } = require('./tests/parser.test.js');
  const gen = require('./tests/generator.test.js');
  const toc = require('./tests/toc.test.js');

  let passed = 0, failed = 0;
  const allTests = {
    ...tests,
    ...gen.tests,
    ...toc.tests,
  };

  for (const [name, fn] of Object.entries(allTests)) {
    try { fn(); passed++; }
    catch (e) {
      failed++;
      console.error(`\x1b[31m✗ ${name}: ${e.message.split('\n')[0]}\x1b[0m`);
    }
  }

  if (failed > 0) {
    console.error(`\n\x1b[31m✗ Tests failed (${failed}/${passed + failed}). Fix before building.\x1b[0m\n`);
    process.exit(1);
  }
  console.log(`\x1b[2m  ✓ ${passed} tests passed\x1b[0m`);
}

// Build context factory
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

// Collect all posts metadata — walks src/pages recursively
function collectPosts() {
  const posts = [];
  const pageFiles = walkDir(PATHS.pages);

  for (const file of pageFiles) {
    const bn = path.basename(file);
    if (!bn.endsWith('.md') && !bn.endsWith('.html')) continue;
    if (bn.startsWith('index.') || bn.startsWith('about.')) continue;

    const raw = fs.readFileSync(file, 'utf8');
    const { data: fm } = parseFrontmatter(raw);
    const slug = path.basename(file, path.extname(file));

    posts.push({
      slug,
      title: fm.title || slug,
      description: fm.description || '',
      tags: parseListField(fm.tags),
      categories: parseListField(fm.categories),
      subcategory: String(fm.subcategory || '').trim(),
      created_at: fm.created_at || '',
      url: `./${slug}.html`,
    });
  }

  posts.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  return posts;
}

// Build CSS from modules
function buildCss() {
  const cssDir = path.join(PATHS.assets, 'css');
  const manifestPath = path.join(cssDir, 'css-manifest.json');
  const modulesDir = path.join(cssDir, 'modules');
  const publicCssDir = path.join(PATHS.public, 'assets', 'css');

  if (!fs.existsSync(manifestPath)) return; // No manifest = legacy mode

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Merge "always" modules into hugo-theme.css
  const header = '/* ========================================\n   HtmlBlogs Theme — Auto-generated from modules\n   Do not edit hugo-theme.css directly — edit modules/*.css instead\n   ======================================== */\n\n';

  const merged = manifest.always.reduce((acc, mod) => {
    const modPath = path.join(modulesDir, mod + '.css');
    if (fs.existsSync(modPath)) {
      return acc + fs.readFileSync(modPath, 'utf8') + '\n';
    }
    console.warn(`  ⚠ CSS module "${mod}" not found`);
    return acc;
  }, header);

  // Write merged hugo-theme.css (replaces the static one copied by copyDir)
  fs.writeFileSync(path.join(publicCssDir, 'hugo-theme.css'), merged);
  console.log('✓ hugo-theme.css (built from ' + manifest.always.length + ' modules)');

  // Copy optional modules as individual files for on-demand loading
  const optDir = path.join(publicCssDir, 'modules');
  if (!fs.existsSync(optDir)) fs.mkdirSync(optDir, { recursive: true });

  // Remove all module files first (copyDir may have copied everything from modules/)
  if (fs.existsSync(optDir)) {
    fs.rmSync(optDir, { recursive: true });
    fs.mkdirSync(optDir, { recursive: true });
  }

  for (const [name, desc] of Object.entries(manifest.optional)) {
    const src = path.join(modulesDir, name + '.css');
    if (fs.existsSync(src)) {
      fs.writeFileSync(path.join(optDir, name + '.css'), fs.readFileSync(src, 'utf8'));
    } else {
      console.warn(`  ⚠ Optional CSS module "${name}" not found`);
    }
  }
  console.log('✓ ' + Object.keys(manifest.optional).length + ' optional CSS modules');
}

// Main build
function build() {
  console.log('🔨 Building HtmlBlogs...\n');

  // Run tests first (skip if FORCE_BUILD=1)
  if (!process.env.FORCE_BUILD) {
    console.log('🧪 Running tests...');
    runTests();
  } else {
    console.log('🧪 Skipping tests (FORCE_BUILD=1)...');
  }

  // Clean
  if (fs.existsSync(PATHS.public)) {
    fs.rmSync(PATHS.public, { recursive: true });
  }
  fs.mkdirSync(PATHS.public, { recursive: true });

  // Copy assets
  copyDir(PATHS.assets, path.join(PATHS.public, 'assets'));
  console.log('✓ assets/');

  // Build CSS: merge "always" modules into hugo-theme.css, keep optional modules separate
  buildCss();

  // Copy media files (PDF/PPT/audio/video/images under src/media/)
  const mediaDir = path.join(PATHS.src, 'media');
  const mediaDest = path.join(PATHS.public, 'media');
  copyDir(mediaDir, mediaDest);
  console.log('✓ media/');

  // Legacy compatibility: older pages reference /audio/*.mp3 from src/media/
  const audioDest = path.join(PATHS.public, 'audio');
  copyDir(mediaDir, audioDest);
  console.log('✓ audio/');

  // Collect posts
  const allPosts = collectPosts();
  console.log(`✓ collected ${allPosts.length} posts`);
  console.log('MAMBA in allPosts:', allPosts.filter(p => p.tags && p.tags.includes('Mamba')).map(p => p.slug));
  // Build pages
  buildArticles(PATHS, allPosts, buildContext, RECENT_COUNT);
  buildPostsPage(PATHS, allPosts, buildContext);
  buildTaxonomyPages(PATHS, allPosts, buildContext);
  buildSearch(PATHS, allPosts);
  buildIndex(PATHS, allPosts);

  console.log('\n✅ Build complete!');
}

build();
