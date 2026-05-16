/**
 * migrate-hugo.js — 从 Hugo 迁移到 HtmlBlogs
 * 运行: node migrate-hugo.js
 */

const fs = require('fs');
const path = require('path');

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

function convertBody(md) {
  let html = md;
  // Hugo shortcodes
  html = html.replace(/{{<\s*[^>]*>}}/g, '');
  // relref
  html = html.replace(/\[([^\]]+)\]\({{< relref "([^"]+)" >}}\)/g, '<a href="./$2.html">$1</a>');
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  // Wiki links
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, d) =>
    `<a href="./${slugify(t)}.html">${d || t}</a>`);
  // Heading IDs
  html = html.replace(/\{#[^}]+\}/g, '');
  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  // Bold/italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // HR
  html = html.replace(/^---$/gm, '<hr>');
  // Paragraphs
  const lines = html.split('\n');
  const out = [];
  let inCode = false;
  for (const l of lines) {
    if (l.startsWith('```')) { inCode = !inCode; out.push(l); continue; }
    if (!inCode && l.trim() === '') { out.push(''); continue; }
    if (!inCode && !l.startsWith('<') && l.trim()) out.push(`<p>${l}</p>`);
    else out.push(l);
  }
  return out.join('\n').replace(/<\/p>\s*<p>/g, '<br>').replace(/<p>\s*<\/p>/g, '');
}

function migrateFile(src, destDir) {
  const basename = path.basename(src);
  const content = fs.readFileSync(src, 'utf8');
  const { data, body } = parseFrontmatter(content);

  // Skip if draft and it's a short file (less than 50 lines)
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

  // Generate slug from filename
  const slug = slugify(basename.replace('.md', ''));

  // Date
  let date = data.date || '';
  if (date) date = date.split('T')[0].split(' ')[0];
  if (!date || date.length !== 10) date = '2026-04-22';

  // Title
  const title = data.title || slug;

  // Tags/Categories
  const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
  const cats = Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []);

  // Build frontmatter
  const fm = `---\ntitle: "${title}"\ndescription: "${data.description || ''}"\ndate: ${date}\n${tags.length ? `tags: [${tags.join(', ')}]\n` : ''}${cats.length ? `categories: [${cats.join(', ')}]\n` : ''}source: hugo-blog\n---\n\n`;

  // Build body
  const bodyHtml = convertBody(body);

  // Write
  const dest = path.join(destDir, slug + '.html');
  fs.writeFileSync(dest, fm + bodyHtml);
  console.log(`✓ ${basename} → ${slug}.html`);
  return { slug, title, date };
}

console.log('=== 迁移 note/ ===');
const noteFiles = fs.readdirSync(HUGO_NOTE).filter(f => f.endsWith('.md'));
for (const f of noteFiles) {
  try { migrateFile(path.join(HUGO_NOTE, f), DEST); } catch (e) { console.error(`✗ ${f}: ${e.message}`); }
}

console.log('\n=== 迁移 posts/ ===');
const postFiles = fs.readdirSync(HUGO_POSTS).filter(f => f.endsWith('.md'));
let count = 0;
for (const f of postFiles) {
  try {
    const r = migrateFile(path.join(HUGO_POSTS, f), DEST);
    if (r) count++;
  } catch (e) { console.error(`✗ ${f}: ${e.message}`); }
}
console.log(`\n✅ 共迁移 ${count} 篇`);