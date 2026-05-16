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

// Build context factory
function buildContext(pageData = {}) {
  return {
    title: CONFIG.site.title,
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

  // Clean
  if (fs.existsSync(PATHS.public)) {
    fs.rmSync(PATHS.public, { recursive: true });
  }
  fs.mkdirSync(PATHS.public, { recursive: true });

  // Copy assets
  copyDir(PATHS.assets, path.join(PATHS.public, 'assets'));
  console.log('✓ assets/');

  // Copy audio files (if src/audio/ exists)
  const audioDir = path.join(PATHS.src, 'audio');
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
