/**
 * Image pipeline shared by build.js and scripts/optimize-images.js.
 *
 * Three concerns, three functions:
 *   scanReferencedMedia  — which media files the deployed pages actually use
 *   ensureVariants       — generate .w960/.w1600 WebP derivatives for large images
 *   enhanceImgTags       — write srcset/sizes/width/height into delivered HTML
 *
 * Dimensions and derivative freshness are cached in .cache/ so repeated builds
 * only re-encode what changed.
 */

const fs = require('fs');
const path = require('path');

const VARIANT_WIDTHS = [960, 1600];
const VARIANT_SUFFIX = (w) => `.w${w}.webp`;
/** Raster formats that can be re-encoded into WebP derivatives. */
const IMAGE_EXT = /\.(webp|png|jpe?g|avif|gif)$/i;
/** Formats we can measure — SVGs have intrinsic size but need no derivatives. */
const DIMENSION_EXT = /\.(webp|png|jpe?g|avif|gif|svg)$/i;

/** Layout widths the article container can actually show (see .wrap in nav.css). */
const IMG_SIZES = '(max-width: 800px) 100vw, 752px';

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filter, out);
    else if (entry.isFile() && (!filter || filter(full))) out.push(full);
  }
  return out;
}

function loadSharp() {
  try {
    // eslint-disable-next-line global-require
    return require('sharp');
  } catch (err) {
    throw new Error(
      'sharp 未安装：性能图片管线需要它。运行 `npm install`（sharp 已在 package.json 依赖中）。\n' +
      `原始错误：${err.message}`
    );
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

function statKey(file) {
  try {
    const st = fs.statSync(file);
    return `${st.size}:${Math.floor(st.mtimeMs)}`;
  } catch (_) {
    return 'missing';
  }
}

/**
 * Media paths referenced by source pages (src/pages/**). Returns a Set of
 * `media/...` strings exactly as they appear in the HTML.
 */
function scanReferencedMedia(root) {
  const pagesDir = path.join(root, 'src', 'pages');
  const refs = new Set();
  const attrRe = /\b(?:src|href|data-src|poster)="((?:\.\/)?media\/[^"]+)"/g;
  const srcsetRe = /\bsrcset="([^"]+)"/g;
  // Frontmatter references (audio_src: "media/audio/x.mp3") are not attributes.
  const frontmatterRe = /^\s*audio_src:\s*"?((?:\.\/)?media\/[^"\s]+)"?/gm;

  for (const file of walk(pagesDir, (f) => f.endsWith('.html') || f.endsWith('.md'))) {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(attrRe)) refs.add(m[1].replace(/^\.\//, ''));
    for (const m of html.matchAll(frontmatterRe)) refs.add(m[1].replace(/^\.\//, ''));
    for (const m of html.matchAll(srcsetRe)) {
      for (const part of m[1].split(',')) {
        const u = part.trim().split(/\s+/)[0];
        if (u.startsWith('media/')) refs.add(u);
      }
    }
  }
  return refs;
}

/** Media refs in HTML look like "media/images/x.webp"; filesystem paths under mediaDir drop that prefix. */
function toMediaFsPath(mediaDir, rel) {
  return path.join(mediaDir, String(rel).replace(/^media\//, ''));
}

function variantRelPath(relPath, width) {
  return relPath.replace(IMAGE_EXT, '') + VARIANT_SUFFIX(width);
}

/**
 * Dimension database for media/ images, cached by (size, mtime).
 * Returns Map<relPath, {width, height}>.
 */
async function readImageDimensions(mediaDir, cachePath, relPaths) {
  const sharp = loadSharp();
  const cache = readJson(cachePath, { version: 1, images: {} });
  const images = cache.images || {};
  const result = new Map();
  let probed = 0;

  for (const rel of relPaths) {
    const file = toMediaFsPath(mediaDir, rel);
    const key = statKey(file);
    if (key === 'missing') continue;
    const entry = images[rel];
    if (entry && entry.key === key) {
      result.set(rel, { width: entry.width, height: entry.height });
      continue;
    }
    try {
      const meta = await sharp(file).metadata();
      if (!meta.width || !meta.height) continue;
      images[rel] = { key, width: meta.width, height: meta.height };
      result.set(rel, { width: meta.width, height: meta.height });
      probed++;
    } catch (_) {
      /* unreadable image — leave it alone */
    }
  }

  if (probed) writeJson(cachePath, { version: 1, images });
  return result;
}

/**
 * Generate derived WebP variants for referenced images wider than the smallest
 * variant width. Writes into public/ (never into git-tracked media/).
 * Returns { built, reused, skipped, bytes }.
 */
async function ensureVariants({ mediaDir, publicDir, refs, cachePath, widths = VARIANT_WIDTHS, log = () => {} }) {
  const sharp = loadSharp();
  const stats = { built: 0, reused: 0, skipped: 0, bytes: 0 };
  const cache = readJson(cachePath, { version: 1, variants: {} });
  const variants = cache.variants || {};

  const candidates = [];
  for (const rel of refs) {
    if (!IMAGE_EXT.test(rel)) continue;
    if (VARIANT_WIDTHS.some((w) => rel.includes(VARIANT_SUFFIX(w)))) continue;
    const srcFile = toMediaFsPath(mediaDir, rel);
    if (!fs.existsSync(srcFile)) continue;
    candidates.push({ rel, srcFile });
  }

  const dims = await readImageDimensions(
    mediaDir,
    path.join(path.dirname(cachePath), 'image-dims.json'),
    candidates.map((c) => c.rel)
  );

  // Build the work list first, then encode concurrently: libvips is C++ and
  // saturates far better with several images in flight than with one.
  const queue = [];
  for (const { rel, srcFile } of candidates) {
    const dim = dims.get(rel);
    if (!dim) {
      stats.skipped++;
      continue;
    }
    const targets = plannedVariantWidths(dim, widths);
    if (!targets.length) {
      stats.skipped++;
      continue;
    }
    const key = statKey(srcFile);
    for (const width of targets) {
      const relOut = variantRelPath(rel, width);
      const outFile = path.join(publicDir, relOut);
      const entry = variants[relOut];
      if (entry && entry.key === key && fs.existsSync(outFile)) {
        stats.reused++;
        stats.bytes += fs.statSync(outFile).size;
        continue;
      }
      queue.push({ rel, srcFile, width, relOut, outFile, key });
    }
  }

  let dirty = false;
  const concurrency = Math.max(2, Math.min(8, require('os').cpus().length));
  const workers = new Array(concurrency).fill(0).map(async () => {
    for (;;) {
      const task = queue.shift();
      if (!task) return;
      try {
        const buf = await sharp(task.srcFile)
          .rotate()
          .resize({ width: task.width, withoutEnlargement: true })
          .webp({ quality: 82, effort: 2 })
          .toBuffer();
        fs.mkdirSync(path.dirname(task.outFile), { recursive: true });
        fs.writeFileSync(task.outFile, buf);
        variants[task.relOut] = { key: task.key, source: task.rel, width: task.width, bytes: buf.length };
        stats.built++;
        stats.bytes += buf.length;
        dirty = true;
      } catch (err) {
        stats.skipped++;
        log(`  ⚠ variant failed: ${task.rel} → ${task.width}px (${err.message})`);
      }
    }
  });
  await Promise.all(workers);

  if (dirty) writeJson(cachePath, { version: 1, variants });
  return stats;
}

/**
 * Which variant widths a source image is entitled to, derived from its dimensions
 * alone. The same rule drives generation (ensureVariants) and HTML injection
 * (enhanceImgTags), so pages never reference a derivative that was not produced.
 */
function plannedVariantWidths(dim, widths = VARIANT_WIDTHS) {
  if (!dim) return [];
  return widths.filter((w) => w < Math.max(dim.width, dim.height));
}

/**
 * Add srcset/sizes/width/height/decoding to <img> tags and make the first
 * above-the-fold image eager + high priority.
 *
 * Options:
 *   dims   Map<relPath, {width, height}>  (source image sizes)
 *   widths variant widths that generation will produce
 *
 * Only local media gets width/height and srcset; external images are left alone.
 */
function enhanceImgTags(html, { dims, widths = VARIANT_WIDTHS } = {}) {
  let firstImgSeen = false;

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = /\bsrc="([^"]+)"/i.exec(tag);
    if (!srcMatch) return tag;
    const src = srcMatch[1];
    const relPath = src.replace(/^\.\//, '');

    let newTag = tag;
    const isFirst = !firstImgSeen;
    firstImgSeen = true;

    // Presentational attributes must be unitless integers; authors sometimes write
    // width="18px", which is invalid HTML and breaks aspect-ratio computation.
    newTag = newTag.replace(/\b(width|height)="\s*(\d+(?:\.\d+)?)\s*(?:px|%)?\s*"/gi,
      (_, attr, value) => `${attr}="${Math.round(parseFloat(value))}"`);

    // Local media: known intrinsic size → width/height (kills CLS) + srcset.
    const dim = dims ? dims.get(relPath) : null;
    if (dim) {
      if (!/\bwidth="\d+"/i.test(newTag)) {
        newTag = /\bwidth="[^"]*"/i.test(newTag)
          ? newTag.replace(/\bwidth="[^"]*"/i, `width="${dim.width}"`)
          : newTag.replace(/<img\b/i, `<img width="${dim.width}"`);
      }
      if (!/\bheight="\d+"/i.test(newTag)) {
        newTag = /\bheight="[^"]*"/i.test(newTag)
          ? newTag.replace(/\bheight="[^"]*"/i, `height="${dim.height}"`)
          : newTag.replace(/<img\b/i, `<img height="${dim.height}"`);
      }

      if (!/\bsrcset="/i.test(newTag)) {
        const available = plannedVariantWidths(dim, widths);
        if (available.length >= 1) {
          const candidates = available.map((w) => `${variantRelPath(src, w)} ${w}w`);
          // Always include the original as an upper-bound candidate so wide
          // screens never upscale a smaller derivative.
          candidates.push(`${src} ${Math.max(dim.width, dim.height)}w`);
          newTag = newTag.replace(/<img\b/i, `<img srcset="${candidates.join(', ')}" sizes="${IMG_SIZES}"`);
        }
      }
    }

    if (!/\bdecoding="/i.test(newTag)) {
      newTag = newTag.replace(/<img\b/i, '<img decoding="async"');
    }

    if (isFirst) {
      // Above-the-fold image: request it early, never defer it.
      newTag = newTag.replace(/\sloading="lazy"/i, '');
      if (!/\bfetchpriority="/i.test(newTag)) newTag = newTag.replace(/<img\b/i, '<img fetchpriority="high"');
    }

    return newTag;
  });
}

/** Referenced image files that are missing from media/ (broken article assets). */
function missingReferencedMedia(mediaDir, refs) {
  const missing = [];
  for (const rel of refs) {
    const file = toMediaFsPath(mediaDir, rel);
    if (!fs.existsSync(file)) missing.push(rel);
  }
  return missing;
}

module.exports = {
  VARIANT_WIDTHS,
  VARIANT_SUFFIX,
  IMAGE_EXT,
  DIMENSION_EXT,
  IMG_SIZES,
  walk,
  scanReferencedMedia,
  variantRelPath,
  readImageDimensions,
  ensureVariants,
  plannedVariantWidths,
  enhanceImgTags,
  missingReferencedMedia,
  statKey,
  toMediaFsPath,
  readJson,
  writeJson,
};
