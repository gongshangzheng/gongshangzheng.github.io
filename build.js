#!/usr/bin/env node
/**
 * HtmlBlogs Build Script
 * Modular build system supporting .md and .html source files
 */

const fs = require('fs');
const path = require('path');
const { CONFIG, RECENT_COUNT, PATHS } = require('./lib/config');
const { parseFrontmatter, parseListField } = require('./lib/parser');
const { copyDir } = require('./lib/utils');
const { buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch } = require('./lib/generator');

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

// Collect all posts metadata
function collectPosts() {
  const posts = [];
  if (!fs.existsSync(PATHS.pages)) return posts;

  for (const file of fs.readdirSync(PATHS.pages)) {
    if (!file.endsWith('.md') && !file.endsWith('.html')) continue;
    if (file.startsWith('index.') || file.startsWith('about.')) continue;

    const raw = fs.readFileSync(path.join(PATHS.pages, file), 'utf8');
    const { data: fm } = parseFrontmatter(raw);
    const slug = path.basename(file, path.extname(file));

    posts.push({
      slug,
      title: fm.title || slug,
      description: fm.description || '',
      date: fm.date || '',
      tags: parseListField(fm.tags),
      categories: parseListField(fm.categories),
      url: `./${slug}.html`,
    });
  }

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return posts;
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

  // Copy audio files (if src/audio/ exists)
  const audioDir = path.join(PATHS.src, 'media');
  const audioDest = path.join(PATHS.public, 'audio');
  copyDir(audioDir, audioDest);
  console.log('✓ audio/');

  // Collect posts
  const allPosts = collectPosts();
  console.log(`✓ collected ${allPosts.length} posts`);

  // Build pages
  buildArticles(PATHS, allPosts, buildContext, RECENT_COUNT);
  buildPostsPage(PATHS, allPosts, buildContext);
  buildTaxonomyPages(PATHS, allPosts, buildContext);
  buildSearch(PATHS, allPosts, buildContext);

  console.log('\n✅ Build complete!');
}

build();
