#!/usr/bin/env node
/**
 * Media optimization CLI.
 *
 *   node scripts/optimize-images.js --report              # 现状统计
 *   node scripts/optimize-images.js --downsample          # dry-run（默认）
 *   node scripts/optimize-images.js --downsample --apply  # 就地降采样，原图备份到 raw/media-originals/
 *   node scripts/optimize-images.js --restore             # 从备份恢复原图
 *   node scripts/optimize-images.js --variants            # 生成 .w960/.w1600 派生图（构建时也自动跑）
 *
 * `--downsample` 会改写 git 跟踪的 media/ 文件，因此默认 dry-run，必须显式 `--apply`。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MEDIA_DIR = path.join(ROOT, 'media');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BACKUP_DIR = path.join(ROOT, 'raw', 'media-originals');
const CACHE_DIR = path.join(ROOT, '.cache');

const MAX_EDGE = 4000;
const WEBP_QUALITY = 82;
// Single delivered image budget (see BUDGETS.singleImageBytes in check-perf-budget).
const MAX_BYTES = 2 * 1024 * 1024;
// Second-stage cap for files that stay over budget after the edge cap.
const BUDGET_EDGE = 2400;
const BUDGET_QUALITY = 72;

const {
  IMAGE_EXT,
  walk,
  toMediaFsPath,
  scanReferencedMedia,
  ensureVariants,
  readJson,
  writeJson,
  statKey,
  VARIANT_WIDTHS,
} = require('../lib/media-images');

const KB = 1024;

function fmtBytes(n) {
  if (n < KB) return `${n} B`;
  if (n < KB * KB) return `${(n / KB).toFixed(1)} KB`;
  if (n < KB * KB * KB) return `${(n / KB / KB).toFixed(1)} MB`;
  return `${(n / KB / KB / KB).toFixed(2)} GB`;
}

function loadSharp() {
  try {
    return require('sharp');
  } catch (err) {
    console.error('❌ 需要 sharp：运行 `npm install` 后重试');
    console.error(`   ${err.message}`);
    process.exit(1);
  }
}

function listImages() {
  return walk(MEDIA_DIR, (f) => IMAGE_EXT.test(f));
}

async function report() {
  const sharp = loadSharp();
  const files = listImages();
  const refs = scanReferencedMedia(ROOT);
  const cache = readJson(path.join(CACHE_DIR, 'image-dims.json'), { images: {} });
  const images = cache.images || {};

  let total = 0;
  let overMax = [];
  let dirty = false;

  for (const file of files) {
    const size = fs.statSync(file).size;
    total += size;
    const rel = path.relative(MEDIA_DIR, file).replace(/\\/g, '/');
    const key = statKey(file);
    let entry = images[rel];
    if (!entry || entry.key !== key) {
      try {
        const meta = await sharp(file).metadata();
        entry = { key, width: meta.width, height: meta.height };
        images[rel] = entry;
        dirty = true;
      } catch (_) {
        continue;
      }
    }
    if (Math.max(entry.width, entry.height) > MAX_EDGE) {
      overMax.push({ rel, bytes: size, width: entry.width, height: entry.height });
    }
  }
  if (dirty) writeJson(path.join(CACHE_DIR, 'image-dims.json'), { version: 1, images });

  overMax.sort((a, b) => b.bytes - a.bytes);

  console.log('图片现状');
  console.log(`  文件数        ${files.length}`);
  console.log(`  总体积        ${fmtBytes(total)}`);
  console.log(`  被页面引用    ${refs.size}`);
  console.log(`  长边 >${MAX_EDGE}px  ${overMax.length} 个，共 ${fmtBytes(overMax.reduce((a, x) => a + x.bytes, 0))}`);
  if (overMax.length) {
    console.log('\n  最大的 10 个：');
    for (const item of overMax.slice(0, 10)) {
      console.log(`    ${fmtBytes(item.bytes).padStart(9)}  ${item.width}x${item.height}  ${item.rel}`);
    }
  }
  const overBytes = [];
  for (const file of files) {
    const size = fs.statSync(file).size;
    if (size > MAX_BYTES) overBytes.push({ rel: path.relative(MEDIA_DIR, file).replace(/\\/g, '/'), size });
  }
  console.log(`  单图 >${MAX_BYTES / 1024 / 1024}MB  ${overBytes.length} 个`);
  for (const o of overBytes.slice(0, 10)) console.log(`    ${fmtBytes(o.size).padStart(9)}  ${o.rel}`);
  console.log('\n派生档位：', VARIANT_WIDTHS.map((w) => `${w}px`).join(' / '));
  console.log('降采样目标：' + `长边 ≤${MAX_EDGE}px，WebP q${WEBP_QUALITY}`);
}

async function downsample(apply) {
  const sharp = loadSharp();
  const files = listImages();
  const actions = [];
  let beforeBytes = 0;
  let afterBytes = 0;

  for (const file of files) {
    const size = fs.statSync(file).size;
    beforeBytes += size;
    let meta;
    try {
      meta = await sharp(file).metadata();
    } catch (_) {
      afterBytes += size;
      continue;
    }
    const longest = Math.max(meta.width || 0, meta.height || 0);
    if (!longest || longest <= MAX_EDGE) {
      afterBytes += size;
      continue;
    }
    const rel = path.relative(MEDIA_DIR, file).replace(/\\/g, '/');
    actions.push({ file, rel, size, width: meta.width, height: meta.height, longest });
    afterBytes += size;
  }

  // Second stage: files already within the edge cap but still over the per-image
  // byte budget (they become the largest srcset candidate and must ship small).
  const edgeCapped = new Set(actions.map((a) => a.rel));
  for (const file of files) {
    const size = fs.statSync(file).size;
    if (size <= MAX_BYTES) continue;
    const rel = path.relative(MEDIA_DIR, file).replace(/\\/g, '/');
    if (edgeCapped.has(rel)) {
      const found = actions.find((a) => a.rel === rel);
      if (found) found.byteBudget = true;
      continue;
    }
    const meta = await sharp(file).metadata().catch(() => null);
    if (!meta || !meta.width) continue;
    actions.push({ file, rel, size, width: meta.width, height: meta.height, longest: Math.max(meta.width, meta.height), byteBudget: true, animated: (meta.pages || 1) > 1 });
  }

  actions.sort((a, b) => b.size - a.size);

  console.log(`降采样${apply ? '' : '（dry-run，加 --apply 才执行）'}`);
  console.log(`  待处理 ${actions.length} 个 / 共 ${fmtBytes(actions.reduce((a, x) => a + x.size, 0))}`);
  for (const a of actions.slice(0, 10)) {
    console.log(`    ${fmtBytes(a.size).padStart(9)}  ${a.width}x${a.height}  ${a.rel}`);
  }
  if (actions.length > 10) console.log(`    … 其余 ${actions.length - 10} 个`);
  const budgetOnly = actions.filter((a) => a.byteBudget).length;
  if (budgetOnly) console.log(`  其中 ${budgetOnly} 个是「已在 ${MAX_EDGE}px 内但仍超 ${MAX_BYTES / 1024 / 1024}MB」，按长边 ≤${BUDGET_EDGE}px / q${BUDGET_QUALITY} 收口`);

  if (!apply) {
    console.log('\n未执行。确认后运行：node scripts/optimize-images.js --downsample --apply');
    return;
  }

  let done = 0;
  let savedBytes = 0;
  const failures = [];

  for (const a of actions) {
    const backup = path.join(BACKUP_DIR, a.rel);
    try {
      if (!fs.existsSync(backup)) {
        fs.mkdirSync(path.dirname(backup), { recursive: true });
        fs.copyFileSync(a.file, backup);
      }
      const ext = path.extname(a.file).toLowerCase();
      const animated = a.animated === true;
      const edge = a.byteBudget ? Math.min(MAX_EDGE, BUDGET_EDGE) : MAX_EDGE;
      // Animated WebP: quality is the only safe lever — resizing is fine but frames
      // must be preserved via { animated: true } or the demo turns into a still.
      const quality = a.byteBudget ? (animated ? 55 : BUDGET_QUALITY) : WEBP_QUALITY;
      const encode = async (useEdge, useQuality) => {
        const pipeline = sharp(a.file, animated ? { animated: true } : {}).rotate().resize({
          width: a.width >= a.height ? useEdge : null,
          height: a.height > a.width ? useEdge : null,
          withoutEnlargement: true,
        });
        return ext === '.webp' ? pipeline.webp({ quality: useQuality, effort: 5, ...(animated ? { loop: 0 } : {}) }).toBuffer()
          : ext === '.png' ? pipeline.png({ compressionLevel: 9 }).toBuffer()
          : ext === '.avif' ? pipeline.avif({ quality: 60 }).toBuffer()
          : ext === '.gif' ? null
          : pipeline.jpeg({ quality: useQuality, mozjpeg: true }).toBuffer();
      };

      let encoded = await encode(edge, quality);
      // Byte budget is a hard requirement; step down width/quality until it holds.
      // Animated frames are preserved throughout (animation is the content).
      if (encoded && encoded.length > MAX_BYTES) {
        for (const [retryEdge, retryQuality] of [[Math.min(edge, 1200), quality], [Math.min(edge, 1200), 45], [Math.min(edge, 1200), 38], [Math.min(edge, 1000), 32]]) {
          encoded = await encode(retryEdge, retryQuality);
          if (encoded && encoded.length <= MAX_BYTES) break;
        }
      }

      if (!encoded) {
        failures.push(`${a.rel}（GIF 跳过）`);
        continue;
      }
      const tmp = a.file + '.tmp_downsample';
      fs.writeFileSync(tmp, encoded);
      fs.renameSync(tmp, a.file);
      savedBytes += a.size - encoded.length;
      done++;
    } catch (err) {
      failures.push(`${a.rel}（${err.message}）`);
    }
  }

  console.log(`\n✓ 已降采样 ${done} 个，节省 ${fmtBytes(savedBytes)}`);
  console.log(`  原图备份在 ${path.relative(ROOT, BACKUP_DIR)}/（gitignored）`);
  console.log(`  恢复命令：node scripts/optimize-images.js --restore`);
  if (failures.length) {
    console.log(`⚠ ${failures.length} 个未处理：`);
    for (const f of failures.slice(0, 10)) console.log(`    ${f}`);
  }
}

function restore() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('没有备份目录，无需恢复。');
    return;
  }
  const backups = walk(BACKUP_DIR);
  let restored = 0;
  for (const file of backups) {
    const rel = path.relative(BACKUP_DIR, file);
    const target = path.join(MEDIA_DIR, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
    restored++;
  }
  console.log(`✓ 已恢复 ${restored} 个原图到 media/`);
}

async function variants() {
  const refs = scanReferencedMedia(ROOT);
  const stats = await ensureVariants({
    mediaDir: MEDIA_DIR,
    publicDir: PUBLIC_DIR,
    refs,
    cachePath: path.join(CACHE_DIR, 'image-variants.json'),
    log: (msg) => console.log(msg),
  });
  console.log('派生图');
  console.log(`  生成 ${stats.built} / 复用 ${stats.reused} / 跳过 ${stats.skipped}`);
  console.log(`  产出体积 ${fmtBytes(stats.bytes)}`);
  if (!fs.existsSync(path.join(PUBLIC_DIR, 'media'))) {
    console.log('  提示：public/media 不存在，先跑一次 node build.js');
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--restore')) return restore();
  if (args.includes('--downsample')) return downsample(args.includes('--apply'));
  if (args.includes('--variants')) return variants();
  return report();
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
