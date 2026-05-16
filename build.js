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
  // First: handle array blocks (must be before simple variable replacement)
  template = template
    .replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, blockContent) => {
      const arr = data[key];
      if (Array.isArray(arr)) {
        return arr.map(item => {
          // Copy 'link' to 'url' for nav items
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
// Parse Frontmatter (Markdown)
// ===========================
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const frontmatter = {};
  match[1].split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  });

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
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

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
// Build HTML Pages from Markdown
// ===========================
function buildMarkdownPages() {
  if (!fs.existsSync(PAGES)) return;

  fs.readdirSync(PAGES).forEach(file => {
    if (!file.endsWith('.md')) return;

    const content = fs.readFileSync(path.join(PAGES, file), 'utf8');
    const { data: frontmatter, content: markdown } = parseFrontmatter(content);
    
    // Convert markdown to HTML
    let htmlContent = marked.parse(markdown);
    
    // Process music-player custom tags
    htmlContent = htmlContent.replace(/<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g, 
      '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
    );
    
    // Build full page
    let page = loadTemplate('_base.html');
    page = processIncludes(page);
    
    // Get header HTML
    const headerHtml = loadTemplate('_header.html');
    
    // Build context
    const context = buildContext(frontmatter);
    
    // Render header with context
    const renderedHeader = render(headerHtml, context);
    
    // Inject header and content into page
    page = page.replace('<!-- INJECT header -->', renderedHeader);
    page = page.replace('<!-- INJECT content -->', '<main class="container">' + htmlContent + '</main>');
    
    // Final template render
    page = render(page, context);
    
    // Generate output
    const basename = path.basename(file, '.md') + '.html';
    const outputPath = path.join(PUBLIC, basename);
    
    // Write to public folder
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
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

    const content = fs.readFileSync(path.join(PAGES, file), 'utf8');
    
    // Process INCLUDE directives
    let processed = processIncludes(content);
    
    // Process music-player custom tags
    processed = processed.replace(/<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g, 
      '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
    );
    
    // Render template variables
    processed = render(processed, buildContext());
    
    // Write output
    const outputPath = path.join(PUBLIC, file);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, processed, 'utf8');
    console.log(`✓ ${outputPath}`);
  });
}

// ===========================
// Main Build
// ===========================
function build() {
  console.log('🔨 Building HtmlBlogs...\n');

  // Clean public folder
  if (fs.existsSync(PUBLIC)) {
    fs.rmSync(PUBLIC, { recursive: true });
  }
  fs.mkdirSync(PUBLIC);

  // Copy assets
  copyDir(ASSETS, path.join(PUBLIC, 'assets'));
  console.log('✓ assets/');

  // Build HTML pages (before markdown processing so they don't get double-rendered)
  buildHtmlPages();
  
  // Build Markdown pages
  buildMarkdownPages();

  console.log('\n✅ Build complete!');
}

// Run
build();