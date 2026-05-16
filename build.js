#!/usr/bin/env node
/**
 * HtmlBlogs Build Script
 * Minimal static site generator - no dependencies required
 * 
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// ===========================
// Config
// ===========================
const CONFIG = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Paths
const SRC = path.join(__dirname, 'src');
const TEMPLATES = path.join(SRC, 'templates');
const PAGES = path.join(SRC, 'pages');
const ASSETS = path.join(SRC, 'assets');
const PUBLIC = path.join(__dirname, 'public');

// ===========================
// Mustache-like Template Engine
// ===========================
function render(template, data) {
  // First: handle array blocks
  template = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, blockContent) => {
    const arr = data[key];
    if (Array.isArray(arr)) {
      return arr.map(item => {
        const itemData = item.link !== undefined 
          ? { name: item.name, url: item.link }  
          : item;
        return render(blockContent, itemData);
      }).join('');
    }
    return '';
  });
  
  // Then: replace simple variables
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

// ===========================
// Process Templates
// ===========================
function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

function processIncludes(content) {
  return content.replace(/<!-- INCLUDE (\w+) -->/g, (match, name) => {
    return loadTemplate(`_${name}.html`);
  });
}

// ===========================
// Parse Frontmatter (supports YAML multiline with |)
// ===========================
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const frontmatter = {};
  const lines = match[1].split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) { i++; continue; }
    
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    
    // Handle YAML multiline block scalar (|)
    if (value === '|') {
      const blockLines = [];
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
        blockLines.push(lines[i].replace(/^  /, ''));
        i++;
      }
      value = blockLines.join('\n').trim();
    } else {
      i++;
    }
    
    frontmatter[key] = value;
  }

  return {
    data: frontmatter,
    content: match[2]
  };
}

// ===========================
// Build Context
// ===========================
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

// ===========================
// Copy Assets
// ===========================
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// ===========================
// Build Markdown Pages
// ===========================
function buildMarkdownPages() {
  if (!fs.existsSync(PAGES)) return;

  fs.readdirSync(PAGES).forEach(file => {
    if (!file.endsWith('.md')) return;

    const raw = fs.readFileSync(path.join(PAGES, file), 'utf8');
    const { data: fm, content: markdown } = parseFrontmatter(raw);
    
    // Convert markdown body to HTML
    let bodyHtml = marked.parse(markdown);
    
    // Process <music-player> custom tags
    bodyHtml = bodyHtml.replace(
      /<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g,
      '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
    );
    
    // Build hero section
    const heroTitle = fm.hero_title || fm.title || '';
    const heroSub = fm.hero_sub || '';
    const heroTagline = fm.hero_tagline || '';
    
    let heroHtml = '';
    if (heroTitle) {
      heroHtml = `<div class="hero"><div class="hero-inner">
        <h1>${heroTitle}</h1>
        ${heroSub ? `<div class="sub">${heroSub}</div>` : ''}
        ${heroTagline ? `<div class="tagline">${heroTagline}</div>` : ''}
      </div></div>`;
    }
    
    // Wrap body in .wrap container
    const contentHtml = `${heroHtml}<div class="wrap">${bodyHtml}</div>`;
    
    // Assemble full page from _base.html
    let page = loadTemplate('_base.html');
    page = processIncludes(page);
    
    // Build context (page-level data overrides site defaults)
    const context = buildContext({
      title: fm.title || CONFIG.site.title,
      description: fm.description || CONFIG.site.description,
      PAGE_STYLE: fm.page_style || ''
    });
    
    // Inject header
    const headerHtml = loadTemplate('_header.html');
    const renderedHeader = render(headerHtml, context);
    page = page.replace('<!-- INJECT header -->', renderedHeader);
    
    // Inject content
    page = page.replace('<!-- INJECT content -->', contentHtml);
    
    // Final render
    page = render(page, context);
    
    // Output
    const basename = path.basename(file, '.md') + '.html';
    const outputPath = path.join(PUBLIC, basename);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, page, 'utf8');
    console.log(`✓ ${outputPath}`);
  });
}

// ===========================
// Build Direct HTML Pages
// ===========================
function buildHtmlPages() {
  if (!fs.existsSync(PAGES)) return;

  fs.readdirSync(PAGES).forEach(file => {
    if (!file.endsWith('.html')) return;

    let content = fs.readFileSync(path.join(PAGES, file), 'utf8');
    content = processIncludes(content);
    content = content.replace(
      /<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g,
      '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
    );
    content = render(content, buildContext());
    
    const outputPath = path.join(PUBLIC, file);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✓ ${outputPath}`);
  });
}

// ===========================
// Main Build
// ===========================
function build() {
  console.log('🔨 Building HtmlBlogs...\n');

  if (fs.existsSync(PUBLIC)) fs.rmSync(PUBLIC, { recursive: true });
  fs.mkdirSync(PUBLIC);

  copyDir(ASSETS, path.join(PUBLIC, 'assets'));
  console.log('✓ assets/');

  buildHtmlPages();
  buildMarkdownPages();

  console.log('\n✅ Build complete!');
}

build();