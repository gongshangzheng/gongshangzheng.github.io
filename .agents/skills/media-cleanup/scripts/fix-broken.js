#!/usr/bin/env node
/**
 * 修复 broken 引用：删除指向不存在文件的图片引用块（基于字符位置，保留块外内容）。
 *
 * 用法：
 *   node scripts/fix-broken.js              # dry-run
 *   node scripts/fix-broken.js --apply      # 真正删除并写回
 *
 * 处理 .svg/.png/.jpg/.jpeg/.webp/.bmp/.gif 的 broken 引用。
 * 对每个 broken src，删除包含它的最小容器块（<div class="photo"> 或 <figure>）；
 * 若不在容器里，删除该 <img> 标签；若为 frontmatter hero_image，删除该行。
 * PDF/MP4/MD 类 broken 需手动处理。
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SCAN_SCRIPT = path.join(__dirname, 'find-unreferenced-media.js');
const IMG_RE = /\.(webp|png|jpe?g|gif|svg|bmp|tiff?)$/i;

function runScan() {
  const res = spawnSync('node', [SCAN_SCRIPT, '--json'], {
    encoding: 'utf8', cwd: ROOT, maxBuffer: 150 * 1024 * 1024,
  });
  if (res.status !== 0) { console.error('扫描失败', res.stderr); process.exit(1); }
  return JSON.parse(res.stdout);
}

// Find the smallest container block (photo/figure) enclosing char index srcIdx.
// Returns {start, end} char indices of the full <tag>...</tag> range, or null.
function findContainerRange(content, srcIdx) {
  const before = content.slice(0, srcIdx);
  const re = /<(div|figure)\b[^>]*>/gi;
  let lastOpen = null;
  let m;
  while ((m = re.exec(before)) !== null) {
    if (/photo|figure|image|doc-page/i.test(m[0])) {
      lastOpen = { tag: m[1].toLowerCase(), idx: m.index };
    }
  }
  if (!lastOpen) return null;
  const openTag = lastOpen.tag;
  const closeTag = '</' + openTag + '>';
  const tagRe = new RegExp('<' + openTag + '\\b|' + closeTag, 'gi');
  tagRe.lastIndex = lastOpen.idx;
  let depth = 0;
  let m2;
  while ((m2 = tagRe.exec(content)) !== null) {
    if (m2[0].startsWith('</')) depth--;
    else depth++;
    if (depth === 0) return { start: lastOpen.idx, end: m2.index + m2[0].length };
  }
  return null;
}

// Find the full <img ...> tag (self-closing or paired) covering srcIdx.
function findImgTag(content, srcIdx) {
  const start = content.lastIndexOf('<img', srcIdx);
  if (start === -1) return null;
  let end = content.indexOf('>', srcIdx);
  if (end === -1) return null;
  return { start, end: end + 1 };
}

function planRemovals(content, srcs) {
  const ranges = [];
  for (const src of srcs) {
    // src is normalized like "media/xxx"; file may have "media/xxx" or "/media/xxx"
    let pos = -1;
    for (const variant of [src, '/' + src]) {
      const p = content.indexOf(variant);
      if (p !== -1) { pos = p; break; }
    }
    if (pos === -1) { ranges.push({ src, miss: true }); continue; }
    const cont = findContainerRange(content, pos);
    if (cont) {
      ranges.push({ src, start: cont.start, end: cont.end, via: 'container' });
    } else {
      const img = findImgTag(content, pos);
      if (img) {
        ranges.push({ src, start: img.start, end: img.end, via: 'img' });
      } else {
        // maybe frontmatter hero_image line
        const lineStart = content.lastIndexOf('\n', pos) + 1;
        let lineEnd = content.indexOf('\n', pos);
        if (lineEnd === -1) lineEnd = content.length;
        ranges.push({ src, start: lineStart, end: lineEnd, via: 'line' });
      }
    }
  }
  // merge overlapping/adjacent ranges, drop misses
  const sorted = ranges.filter((r) => r.start != null).sort((a, b) => a.start - b.start);
  const merged = [];
  for (const r of sorted) {
    if (merged.length && r.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, r.end);
    } else {
      merged.push({ ...r });
    }
  }
  return { ranges: merged, misses: ranges.filter((r) => r.miss).map((r) => r.src) };
}

function previewLine(content, range) {
  const seg = content.slice(range.start, Math.min(range.end, range.start + 80));
  return seg.replace(/\s+/g, ' ').trim().slice(0, 75);
}

function main() {
  const apply = process.argv.slice(2).includes('--apply');
  const report = runScan();
  const broken = report.broken.filter((b) => IMG_RE.test(b.ref));

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  修复 broken 图片引用');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  模式：${apply ? '执行 (--apply)' : '预览 (dry-run)'}`);
  console.log(`  待处理：${broken.length} 个 broken 引用\n`);

  const byFile = new Map();
  for (const b of broken) {
    if (!byFile.has(b.source)) byFile.set(b.source, []);
    byFile.get(b.source).push(b.ref);
  }

  let totalRanges = 0;
  let totalMisses = 0;
  for (const [src, srcs] of byFile) {
    const abs = path.join(ROOT, src);
    if (!fs.existsSync(abs)) { console.log(`  ⚠ 源文件不存在: ${src}`); continue; }
    const content = fs.readFileSync(abs, 'utf8');
    const { ranges, misses } = planRemovals(content, srcs);
    console.log(`  ${src}  (${ranges.length} 块${misses.length ? ', ' + misses.length + ' 未定位' : ''})`);
    for (const r of ranges) {
      totalRanges++;
      console.log(`    [${r.via}]  ${previewLine(content, r)}`);
    }
    for (const miss of misses) {
      totalMisses++;
      console.log(`    [miss]  ${miss}`);
    }
    if (apply && ranges.length > 0) {
      // delete ranges in reverse, also absorb a single trailing newline after each block
      let out = content;
      for (let i = ranges.length - 1; i >= 0; i--) {
        const r = ranges[i];
        let end = r.end;
        // absorb one following newline if the block is on its own line(s)
        if (content[end] === '\n') end += 1;
        else if (content[end] === '\r' && content[end + 1] === '\n') end += 2;
        out = out.slice(0, r.start) + out.slice(end);
      }
      // collapse 3+ newlines to 2
      out = out.replace(/\n{3,}/g, '\n\n');
      fs.writeFileSync(abs, out, 'utf8');
    }
  }

  console.log('');
  console.log(`  共 ${totalRanges} 个引用块${apply ? '已删除' : '待删除'}${totalMisses ? '，' + totalMisses + ' 个未定位需手动看' : ''}。`);
  if (!apply) console.log('  (dry-run，加 --apply 执行)');
  console.log('');
}

main();
