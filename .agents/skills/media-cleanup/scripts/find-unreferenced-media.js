#!/usr/bin/env node
/**
 * 扫描项目中的媒体引用，找出未引用、引用缺失、遗留扩展名的媒体文件。
 *
 * 用法：
 *   node scripts/find-unreferenced-media.js [options]
 *
 * 选项：
 *   --json         输出 JSON 报告
 *   --src=<glob>   额外扫描指定源文件（可多次使用）
 *   --verbose      打印每个引用位置
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const MEDIA_DIR = path.join(ROOT, 'media');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const DRAFTS_DIR = path.join(ROOT, 'drafts');
const DATA_DIR = path.join(ROOT, 'data');

const MEDIA_EXTS = new Set([
  // images
  'webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'tiff', 'ico',
  // videos
  'mp4', 'm4v', 'mov', 'avi', 'mkv', 'webm',
  // documents
  'pdf', 'ppt', 'pptx',
  // audio
  'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac',
]);

function posix(p) {
  return p.replace(/\\/g, '/');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function walk(dir, filter) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full, filter));
    } else if (entry.isFile() && (!filter || filter(full))) {
      results.push(full);
    }
  }
  return results;
}

function getMediaFiles() {
  const files = walk(MEDIA_DIR, (f) => {
    const ext = path.extname(f).toLowerCase().slice(1);
    return MEDIA_EXTS.has(ext);
  });
  return files.map((f) => ({
    absolute: f,
    relative: posix(path.relative(ROOT, f)),
    size: fs.statSync(f).size,
  }));
}

function hasMediaExt(p) {
  const ext = path.extname(p).toLowerCase().slice(1);
  return MEDIA_EXTS.has(ext);
}

function normalizeMediaPath(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let p = raw.trim();
  // skip external URLs, data URIs, anchors, mailto, tel, javascript
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('data:') || p.startsWith('#') ||
      p.startsWith('mailto:') || p.startsWith('tel:') || p.startsWith('javascript:')) {
    return null;
  }
  // skip internal article cross-links (e.g. media/paper-xxx.html)
  if (/\.html?$/i.test(p) && !/\.(pdf|pptx?)$/i.test(p)) return null;
  // decode HTML entities if any
  p = p.replace(/&amp;/g, '&');
  // strip leading ./ or /
  p = p.replace(/^\.?\/+/, '');
  // strip leading media/
  p = p.replace(/^media\//, '');
  // resolve relative segments safely
  const parts = p.split('/').filter(Boolean).filter((x) => x !== '.');
  const resolved = [];
  for (const part of parts) {
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  if (resolved.length === 0) return null;
  const result = 'media/' + resolved.join('/');
  // require a known media extension, unless it's a bare directory-like path
  // (allow paths that will be matched against existing files anyway)
  return result;
}

function* extractQuotedStrings(text) {
  const re = /["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    yield m[1];
  }
}

function findReferences(sourcePath, content) {
  const refs = new Set();
  const relSource = posix(path.relative(ROOT, sourcePath));
  const loc = { file: relSource };

  // Strip HTML comments so shortcode examples inside <!-- --> are not
  // treated as real references (e.g. the course-note template usage docs).
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  const add = (raw) => {
    const norm = normalizeMediaPath(raw);
    if (norm) refs.add(norm);
  };

  // 1. PDF/PPT shortcodes: {{< docpage "..." ... >}} etc.
  const shortcodeRe = /\{\{<\s*(docpage|docpages|docref|pdf|ppt|video)\s+["']([^"']+)["'][^>]*>\}\}/g;
  let m;
  while ((m = shortcodeRe.exec(content)) !== null) {
    add(m[2]);
  }

  // 2. Wiki image syntax: ![[file | width # caption]]
  const wikiRe = /!\[\[\s*([^\s|\[\]#]+)(?:\s*\|\s*([^\]]*))?\s*\]\]/g;
  while ((m = wikiRe.exec(content)) !== null) {
    add('media/images/' + m[1]);
  }

  // 3. HTML tags: img src, video src, source src
  const mediaSrcRe = /<(?:img|video|source)\s+[^>]*?src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = mediaSrcRe.exec(content)) !== null) {
    add(m[1]);
  }
  // 3b. HTML <a href> only if it points to a media file
  const anchorRe = /<a\s+[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = anchorRe.exec(content)) !== null) {
    const href = m[1];
    if (hasMediaExt(href)) add(href);
  }

  // 4. Frontmatter: hero_image, cover_image, image, thumbnail
  const fmRe = /^---\s*\n([\s\S]*?)\n---/;
  const fmMatch = content.match(fmRe);
  if (fmMatch) {
    const fm = fmMatch[1];
    const imageKeys = /^(hero_image|cover_image|image|thumbnail|og_image|banner)\s*:\s*["']?([^\n"']+)["']?/gim;
    while ((m = imageKeys.exec(fm)) !== null) {
      add(m[2]);
    }
  }

  // 5. Catch any bare media/... string with a known media extension
  const extPattern = Array.from(MEDIA_EXTS).join('|');
  const bareRe = new RegExp(`\\bmedia\\/(images|videos|pdf)\\/[^\\s"'<>\\)\\]\\}]+\\.(?:${extPattern})\\b`, 'gi');
  while ((m = bareRe.exec(content)) !== null) {
    add(m[0]);
  }

  return { file: relSource, refs: Array.from(refs) };
}

function getSourceFiles(extraGlobs) {
  const files = [];
  if (fs.existsSync(PAGES_DIR)) {
    files.push(...walk(PAGES_DIR, (f) => f.endsWith('.html') || f.endsWith('.md')));
  }
  if (fs.existsSync(DRAFTS_DIR)) {
    files.push(...walk(DRAFTS_DIR));
  }
  if (fs.existsSync(DATA_DIR)) {
    files.push(...walk(DATA_DIR));
  }
  const readme = path.join(ROOT, 'README.md');
  if (fs.existsSync(readme)) files.push(readme);
  const config = path.join(ROOT, 'config.json');
  if (fs.existsSync(config)) files.push(config);

  if (extraGlobs) {
    // simple glob support: only * and **
    for (const g of extraGlobs) {
      const abs = path.isAbsolute(g) ? g : path.join(ROOT, g);
      if (abs.includes('*')) {
        const base = abs.split('*')[0];
        if (fs.existsSync(base)) {
          files.push(...walk(base, (f) => f.startsWith(abs.replace(/\*\*/g, '').replace(/\*/g, ''))));
        }
      } else if (fs.existsSync(abs)) {
        files.push(abs);
      }
    }
  }

  return Array.from(new Set(files));
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const verbose = args.includes('--verbose');
  const extraGlobs = args
    .filter((a) => a.startsWith('--src='))
    .map((a) => a.slice('--src='.length));

  const sourceFiles = getSourceFiles(extraGlobs);
  const mediaFiles = getMediaFiles();
  const mediaSet = new Map(mediaFiles.map((m) => [m.relative, m]));

  const referenced = new Map(); // mediaRelative -> [{file, ...}]
  const legacy = []; // {file, raw}
  const broken = []; // {file, ref}

  function resolveMediaRef(ref) {
    // direct hit
    if (mediaSet.has(ref)) return ref;
    // image: try webp variant
    if (/\.(png|jpg|jpeg|gif)$/i.test(ref)) {
      const webp = ref.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
      if (mediaSet.has(webp)) return webp;
    }
    // direct PDF/PPT paths missing the pdf/ directory segment
    // e.g. media/机器学习/foo.pdf -> media/pdf/机器学习/foo.pdf
    if (/^media\//i.test(ref) && /\.(pdf|pptx?)$/i.test(ref) && !/^media\/pdf\//i.test(ref)) {
      const withPdf = ref.replace(/^media\//i, 'media/pdf/');
      if (mediaSet.has(withPdf)) return withPdf;
    }
    return null;
  }

  for (const src of sourceFiles) {
    const content = fs.readFileSync(src, 'utf8');
    const { file: relSource, refs } = findReferences(src, content);
    for (const ref of refs) {
      const resolved = resolveMediaRef(ref);
      if (!resolved) {
        broken.push({ source: relSource, ref });
        continue;
      }
      if (!referenced.has(resolved)) referenced.set(resolved, []);
      referenced.get(resolved).push(relSource);

      // detect legacy extensions in src/pages
      if (/\.(png|jpg|jpeg|gif)$/i.test(ref) && src.startsWith(PAGES_DIR)) {
        legacy.push({ source: relSource, ref });
      }
    }
  }

  const unreferenced = mediaFiles.filter((m) => !referenced.has(m.relative));

  // Detect textual mentions: a media file may be referenced in prose by its
  // filename stem (e.g. "Chap1" for "Chap1.pdf") even without an href/src link.
  // Build one big haystack of all source content for fast substring search.
  const sourceContents = sourceFiles.map((f) => fs.readFileSync(f, 'utf8'));
  const haystack = sourceContents.join('\n');

  function isTextuallyMentioned(mediaRel) {
    const base = path.basename(mediaRel);
    const stem = base.replace(/\.[^.]+$/, '');
    // Keep very short stems (<3 chars) as "mentioned" to be safe — too risky to delete.
    if (stem.length < 3) return true;
    // Skip generic English short words (e.g. "the", "fig", "img") that would
    // match everywhere; require a more specific signal for those.
    if (/^[a-z]{1,4}$/i.test(stem)) return false;
    if (haystack.includes(stem)) return true;
    return false;
  }

  for (const m of unreferenced) {
    m.textualMention = isTextuallyMentioned(m.relative);
  }

  const unreferencedSize = unreferenced.reduce((sum, m) => sum + m.size, 0);
  const referencedSize = Array.from(referenced.keys())
    .map((k) => mediaSet.get(k))
    .filter(Boolean)
    .reduce((sum, m) => sum + m.size, 0);

  const safeToDelete = unreferenced.filter((m) => !m.textualMention);
  const textuallyMentioned = unreferenced.filter((m) => m.textualMention);

  const report = {
    summary: {
      totalMediaFiles: mediaFiles.length,
      totalMediaSize: mediaFiles.reduce((sum, m) => sum + m.size, 0),
      referencedFiles: referenced.size,
      referencedSize,
      unreferencedFiles: unreferenced.length,
      unreferencedSize,
      safeToDelete: safeToDelete.length,
      safeToDeleteSize: safeToDelete.reduce((s, m) => s + m.size, 0),
      textuallyMentioned: textuallyMentioned.length,
      textuallyMentionedSize: textuallyMentioned.reduce((s, m) => s + m.size, 0),
      brokenReferences: broken.length,
      legacyReferences: legacy.length,
    },
    referenced: Array.from(referenced.entries()).map(([rel, sources]) => ({
      file: rel,
      size: mediaSet.get(rel)?.size ?? null,
      sources: Array.from(new Set(sources)),
    })),
    unreferenced: unreferenced.map((m) => ({
      file: m.relative,
      size: m.size,
      textualMention: m.textualMention,
    })),
    safeToDelete: safeToDelete.map((m) => ({ file: m.relative, size: m.size })),
    textuallyMentioned: textuallyMentioned.map((m) => ({ file: m.relative, size: m.size })),
    broken,
    legacy,
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  媒体引用扫描报告');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  媒体总数：      ${report.summary.totalMediaFiles} 个 / ${formatSize(report.summary.totalMediaSize)}`);
  console.log(`  已引用：        ${report.summary.referencedFiles} 个 / ${formatSize(report.summary.referencedSize)}`);
  console.log(`  未引用总计：    ${report.summary.unreferencedFiles} 个 / ${formatSize(report.summary.unreferencedSize)}`);
  console.log(`    可安全删除：  ${report.summary.safeToDelete} 个 / ${formatSize(report.summary.safeToDeleteSize)}`);
  console.log(`    被文字提及：  ${report.summary.textuallyMentioned} 个 / ${formatSize(report.summary.textuallyMentionedSize)}（保留）`);
  console.log(`  引用缺失：      ${report.summary.brokenReferences} 个`);
  console.log(`  遗留 png/jpg：  ${report.summary.legacyReferences} 个`);
  console.log('');

  if (report.safeToDelete.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  可安全删除（无任何引用或文字提及）');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of report.safeToDelete.slice(0, 80)) {
      console.log(`  ${formatSize(item.size).padStart(10)}  ${item.file}`);
    }
    if (report.safeToDelete.length > 80) {
      console.log(`  ... 还有 ${report.safeToDelete.length - 80} 个`);
    }
    console.log('');
  }

  if (report.textuallyMentioned.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  被正文文字提及（保留，建议后续转为正式引用）');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of report.textuallyMentioned.slice(0, 40)) {
      console.log(`  ${formatSize(item.size).padStart(10)}  ${item.file}`);
    }
    if (report.textuallyMentioned.length > 40) {
      console.log(`  ... 还有 ${report.textuallyMentioned.length - 40} 个`);
    }
    console.log('');
  }

  if (report.unreferenced.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  全部未引用文件');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of report.unreferenced.slice(0, 50)) {
      const flag = item.textualMention ? ' [文字提及]' : '';
      console.log(`  ${formatSize(item.size).padStart(10)}  ${item.file}${flag}`);
    }
    if (report.unreferenced.length > 50) {
      console.log(`  ... 还有 ${report.unreferenced.length - 50} 个未引用文件`);
    }
    console.log('');
  }

  if (report.broken.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  引用缺失（broken links）');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of report.broken.slice(0, 30)) {
      console.log(`  ${item.source}: ${item.ref}`);
    }
    if (report.broken.length > 30) {
      console.log(`  ... 还有 ${report.broken.length - 30} 个`);
    }
    console.log('');
  }

  if (report.legacy.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  遗留 .png/.jpg/.gif 引用（建议迁移到 .webp）');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of report.legacy.slice(0, 20)) {
      console.log(`  ${item.source}: ${item.ref}`);
    }
    if (report.legacy.length > 20) {
      console.log(`  ... 还有 ${report.legacy.length - 20} 个`);
    }
    console.log('');
  }

  if (verbose) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  所有已引用文件');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of report.referenced) {
      const sizeStr = item.size !== null ? formatSize(item.size).padStart(10) : '      缺失';
      console.log(`  ${sizeStr}  ${item.file}`);
      for (const src of item.sources.slice(0, 3)) {
        console.log(`              <- ${src}`);
      }
      if (item.sources.length > 3) {
        console.log(`              ... 还有 ${item.sources.length - 3} 处引用`);
      }
    }
  }
}

main();
