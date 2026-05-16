/**
 * migrate-hugo.js — 从 Hugo 迁移到 HtmlBlogs
 * 运行: node migrate-hugo.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const HUGO_NOTE = path.join(process.env.HOME, 'blogs/content/note');
const HUGO_POSTS = path.join(process.env.HOME, 'blogs/content/posts');
const DEST = path.join(process.env.HOME, 'HtmlBlogs/src/pages');

function slugify(name) {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { data: {}, body: content };
  const body = content.slice(m[0].length);
  const data = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim().replace(/^[""]|[""]$/g, '');
    if (v.startsWith('[')) v = v.slice(1, -1).split(',').map(x => x.trim().replace(/"/g, ''));
    if (v) data[k] = v;
  }
  return { data, body };
}

// Clean markdown → HTML using marked (same as .md files in generator)
function convertBody(md) {
  let text = md;

  // Remove Hugo shortcodes {{< >}}
  text = text.replace(/{{<\s*[^>]*>}}/g, '');

  // Remove heading IDs {:#id}
  text = text.replace(/\{#[^}]+\}/g, '');

  // Convert relref to plain links
  text = text.replace(/\[([^\]]+)\]\({{< relref "([^"]+)" >}}\)/g, (_, label, target) => {
    const slug = slugify(target.replace('.md', ''));
    return `[${label}](./${slug}.html)`;
  });

  // Convert wiki links [[xxx]] or [[xxx|display]]
  text = text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => {
    const slug = slugify(target);
    return `[${display || target}](./${slug}.html)`;
  });

  // Use marked for proper Markdown parsing
  marked.setOptions({
    breaks: false,
    gfm: true,
  });

  let html = marked.parse(text);

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function migrateFile(src, destDir) {
  const basename = path.basename(src);
  const content = fs.readFileSync(src, 'utf8');
  const { data, body } = parseFrontmatter(content);

  // Skip short drafts
  const lines = content.split('\n').length;
  if (data.draft === 'true' && lines < 50) {
    console.log(`○ 跳过草稿: ${basename}`);
    return null;
  }

  // Skip _index.md
  if (basename === '_index.md') {
    console.log(`○ 跳过索引: ${basename}`);
    return null;
  }

  const slug = slugify(basename.replace('.md', ''));

  // Date
  let date = (data.date || '').split('T')[0].split(' ')[0].trim();
  if (!date || date.length !== 10) date = '2026-04-22';

  const title = data.title || slug;
  const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
  const cats = Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []);
  const mathjax = data.mathjax === 'true' ? true : false;

  // Build frontmatter
  let fm = `---\ntitle: "${title}"\ndescription: "${data.description || ''}"\ndate: ${date}\n`;
  if (tags.length) fm += `tags: [${tags.join(', ')}]\n`;
  if (cats.length) fm += `categories: [${cats.join(', ')}]\n`;
  if (mathjax) fm += `mathjax: true\n`;
  fm += `source: hugo-blog\n---\n\n`;

  const bodyHtml = convertBody(body);
  fs.writeFileSync(path.join(destDir, slug + '.html'), fm + bodyHtml);
  console.log(`✓ ${basename} → ${slug}.html${mathjax ? ' [mathjax]' : ''}`);
  return { slug, title, date, mathjax };
}

console.log('=== 迁移 note/ ===');
const noteFiles = fs.readdirSync(HUGO_NOTE).filter(f => f.endsWith('.md'));
let count = 0;
for (const f of noteFiles) {
  try { if (migrateFile(path.join(HUGO_NOTE, f), DEST)) count++; } catch (e) { console.error(`✗ ${f}: ${e.message}`); }
}

console.log('\n=== 迁移 posts/ ===');
const postFiles = fs.readdirSync(HUGO_POSTS).filter(f => f.endsWith('.md'));
for (const f of postFiles) {
  try { if (migrateFile(path.join(HUGO_POSTS, f), DEST)) count++; } catch (e) { console.error(`✗ ${f}: ${e.message}`); }
}

console.log(`\n✅ 共迁移 ${count} 篇`);