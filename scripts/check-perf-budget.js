#!/usr/bin/env node
/**
 * Delivery performance budget inspection.
 *
 *   node scripts/check-perf-budget.js --report    # baseline report (markdown)
 *   node scripts/check-perf-budget.js --check     # assertions, exit 1 on violation
 *   node scripts/check-perf-budget.js --json      # machine-readable metrics
 *
 * Reads only build output (public/). Never touches sources.
 *
 * Budget constants live in BUDGETS so tests and docs share one source of truth.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const BUDGETS = {
  // Whole-page ceiling. Content-heavy pages (dense multi-paper digests, long
  // tables) are exempted individually via data/perf-heavy-pages.txt and are
  // still bound by chromeGzipBytes below.
  pageGzipBytes: 40 * 1024,
  indexGzipBytes: 15 * 1024,
  // Everything that is not article body: head, nav, sidebar, footer, scripts.
  // This is the number the performance work actually controls.
  chromeGzipBytes: 12 * 1024,
  singleImageBytes: 2 * 1024 * 1024,
  totalPublicBytes: 1024 * 1024 * 1024,
  // Longest acceptable exemption list; it must shrink, not grow.
  maxHeavyPages: 60,
  thirdPartyAllowlist: [
    // Runtime libraries served by the build
    'cdn.jsdelivr.net',
    // Content embeds that pages opt into (video/slides) and author-chosen webfonts
    'player.bilibili.com',
    'www.youtube.com',
    'docs.google.com',
    'upload.wikimedia.org',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ],
};

const MATHJAX_MARKER = 'mathjax@3/es5/tex-svg';
const HEAVY_PAGES_FILE = path.join(ROOT, 'data', 'perf-heavy-pages.txt');
const PRISM_MARKER = 'prismjs@1.29.0';

const KB = 1024;

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filter, out);
    else if (entry.isFile() && (!filter || filter(full))) out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(PUBLIC_DIR, p).replace(/\\/g, '/');
}

/** Only the site homepage gets the tighter budget; listing pages are normal pages. */
function pageTier(relPath) {
  return relPath === 'index.html' ? 'index' : 'page';
}

/**
 * Domains the browser actually *loads* resources from.
 * Plain <a href="https://arxiv.org/..."> citations are hyperlinks, not loads,
 * so only resource-bearing attributes count: src=*, <link href>, preconnect/dns-prefetch.
 */
function extractExternalDomains(html) {
  const domains = new Set();
  const add = (url) => {
    try {
      const { host } = new URL(url);
      if (host) domains.add(host);
    } catch (_) {
      /* ignore malformed URLs */
    }
  };

  for (const m of html.matchAll(/\bsrc="(https?:\/\/[^"]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/\bdata-src="(https?:\/\/[^"]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*\bhref="(https?:\/\/[^"]+)"[^>]*>/g)) add(m[1]);
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (/^https?:\/\//.test(u)) add(u);
    }
  }
  return [...domains];
}

const { hasCodeBlock, hasMathMarkup } = require('../lib/asset-detect');

function analyzeImgTags(html) {
  const stats = { count: 0, withLazy: 0, withWidthHeight: 0, withSrcset: 0, missingDims: [], unmeasurable: [], largeWithoutSrcset: [] };
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    stats.count++;
    if (/loading="lazy"/i.test(tag)) stats.withLazy++;
    if (/\bwidth="\d+"/i.test(tag) && /\bheight="\d+"/i.test(tag)) stats.withWidthHeight++;
    else {
      const src = (tag.match(/src="([^"]*)"/i) || [])[1] || '(no src)';
      // External or missing files have no knowable intrinsic size; report them
      // separately from "local image that should have been annotated".
      const local = src.startsWith('media/') || src.startsWith('./media/');
      const localPath = local ? path.join(PUBLIC_DIR, src.replace(/^\.\//, '')) : null;
      if (!local || !fs.existsSync(localPath)) stats.unmeasurable.push(src);
      else stats.missingDims.push(src);
    }
    const srcsetMatch = /\bsrcset="([^"]*)"/i.exec(tag);
    if (srcsetMatch) stats.withSrcset++;
    const widthMatch = /\bwidth="(\d+)"/i.exec(tag);
    // Images wider than the largest derivative must ship multiple candidates.
    if (widthMatch && Number(widthMatch[1]) > 1600) {
      const candidates = srcsetMatch ? srcsetMatch[1].split(',').filter(Boolean).length : 0;
      if (candidates < 2) {
        const src = (tag.match(/src="([^"]*)"/i) || [])[1] || '(no src)';
        stats.largeWithoutSrcset.push(`${src} (${candidates} candidates)`);
      }
    }
  }
  return stats;
}

/**
 * Split a page into article content and site chrome.
 * Content runs from the body container to the site footer; everything else
 * (head, nav, sidebar, footer, scripts) is chrome.
 */
function splitChrome(html) {
  const start = /<div class="(?:wrap|main-content)"/.exec(html);
  const end = html.indexOf('<footer class="site-footer">');
  if (!start || end < 0 || end <= start.index) return null;
  return { content: html.slice(start.index, end), chrome: html.slice(0, start.index) + html.slice(end) };
}

function readHeavyPages() {
  if (!fs.existsSync(HEAVY_PAGES_FILE)) return [];
  return fs
    .readFileSync(HEAVY_PAGES_FILE, 'utf8')
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean);
}

function gzipSize(buf) {
  return zlib.gzipSync(buf, { level: 6 }).length;
}

function collectMetrics() {
  const metrics = {
    generatedAt: new Date().toISOString(),
    publicExists: fs.existsSync(PUBLIC_DIR),
    budgets: BUDGETS,
    totalBytes: 0,
    totalFiles: 0,
    pages: [],
    images: [],
    categoryTree: null,
    thirdParty: {},
    imagesByExt: {},
  };

  if (!metrics.publicExists) return metrics;

  const allFiles = walk(PUBLIC_DIR);
  metrics.totalFiles = allFiles.length;
  for (const f of allFiles) {
    const size = fs.statSync(f).size;
    metrics.totalBytes += size;
    const ext = path.extname(f).toLowerCase();
    metrics.imagesByExt[ext] = (metrics.imagesByExt[ext] || 0) + size;
  }

  const treePath = path.join(PUBLIC_DIR, 'assets', 'data', 'category-tree.json');
  if (fs.existsSync(treePath)) {
    metrics.categoryTree = {
      bytes: fs.statSync(treePath).size,
      gzipBytes: gzipSize(fs.readFileSync(treePath)),
    };
  }

  const htmlFiles = walk(PUBLIC_DIR, (f) => f.endsWith('.html'));

  for (const file of htmlFiles) {
    const buf = fs.readFileSync(file);
    const html = buf.toString('utf8');
    const r = rel(file);
    const domains = extractExternalDomains(html);
    const imgs = analyzeImgTags(html);
    const split = splitChrome(html);

    for (const d of domains) {
      if (!metrics.thirdParty[d]) metrics.thirdParty[d] = { pages: 0 };
      metrics.thirdParty[d].pages++;
    }

    metrics.pages.push({
      path: r,
      tier: pageTier(r),
      bytes: buf.length,
      gzipBytes: gzipSize(buf),
      externalDomains: domains,
      hasDataTree: html.includes('data-tree='),
      hasCategoryTreeJson: html.includes('category-tree.json'),
      hasMathJax: html.includes(MATHJAX_MARKER),
      hasMathMarkup: hasMathMarkup(html),
      hasPrism: html.includes(PRISM_MARKER),
      hasCodeBlock: hasCodeBlock(html),
      hasCategoryBrowser: html.includes('id="category-nav"'),
      contentGzipBytes: split ? gzipSize(Buffer.from(split.content, 'utf8')) : null,
      chromeGzipBytes: split ? gzipSize(Buffer.from(split.chrome, 'utf8')) : null,
      imgs,
    });
  }

  metrics.pages.sort((a, b) => b.gzipBytes - a.gzipBytes);

  for (const f of walk(PUBLIC_DIR, (p) => /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(p))) {
    metrics.images.push({ path: rel(f), bytes: fs.statSync(f).size });
  }
  metrics.images.sort((a, b) => b.bytes - a.bytes);

  return metrics;
}

function fmtBytes(n) {
  if (n < KB) return `${n} B`;
  if (n < KB * KB) return `${(n / KB).toFixed(1)} KB`;
  if (n < KB * KB * KB) return `${(n / KB / KB).toFixed(1)} MB`;
  return `${(n / KB / KB / KB).toFixed(2)} GB`;
}

function reportMarkdown(metrics) {
  const lines = [];
  const totalPages = metrics.pages.length;
  const gzTotal = metrics.pages.reduce((a, p) => a + p.gzipBytes, 0);
  const sum = (key) => metrics.pages.reduce((a, p) => a + (p[key] || 0), 0);

  lines.push('| 指标 | 数值 |');
  lines.push('|---|---|');
  lines.push(`| 页面数 | ${totalPages} |`);
  lines.push(`| 产物总大小 | ${fmtBytes(metrics.totalBytes)} (${metrics.totalFiles} 文件) |`);
  lines.push(`| HTML 总量 | ${fmtBytes(metrics.pages.reduce((a, p) => a + p.bytes, 0))} |`);
  lines.push(`| HTML 总量（gzip） | ${fmtBytes(gzTotal)} |`);
  lines.push(`| 单页 gzip 中位/最大 | ${fmtBytes(median(metrics.pages.map((p) => p.gzipBytes)))} / ${fmtBytes(metrics.pages[0] ? metrics.pages[0].gzipBytes : 0)} |`);
  lines.push(`| 超 40KB gzip 的页面 | ${metrics.pages.filter((p) => p.gzipBytes > BUDGETS.pageGzipBytes).length} |`);
  lines.push(`| 含内联分类树（data-tree）的页面 | ${metrics.pages.filter((p) => p.hasDataTree).length} |`);
  lines.push(`| 加载 MathJax 的页面 | ${sum('hasMathJax')} / 其中正文无数学 ${metrics.pages.filter((p) => p.hasMathJax && !p.hasMathMarkup).length} |`);
  lines.push(`| 加载 Prism 的页面 | ${sum('hasPrism')} / 其中无代码块 ${metrics.pages.filter((p) => p.hasPrism && !p.hasCodeBlock).length} |`);
  lines.push(`| 分类树共享 JSON | ${metrics.categoryTree ? `${fmtBytes(metrics.categoryTree.bytes)}（gzip ${fmtBytes(metrics.categoryTree.gzipBytes)}）` : '不存在（仍为内联）'} |`);
  lines.push('');
  lines.push('### 图片');
  lines.push('');
  lines.push('| 指标 | 数值 |');
  lines.push('|---|---|');
  const imgTotal = metrics.images.reduce((a, i) => a + i.bytes, 0);
  lines.push(`| 图片文件数 | ${metrics.images.length} |`);
  lines.push(`| 图片总量 | ${fmtBytes(imgTotal)} |`);
  lines.push(`| 单图 >2MB | ${metrics.images.filter((i) => i.bytes > BUDGETS.singleImageBytes).length} |`);
  const totalImgTags = metrics.pages.reduce((a, p) => a + p.imgs.count, 0);
  const lazyTags = metrics.pages.reduce((a, p) => a + p.imgs.withLazy, 0);
  const whTags = metrics.pages.reduce((a, p) => a + p.imgs.withWidthHeight, 0);
  const srcsetTags = metrics.pages.reduce((a, p) => a + p.imgs.withSrcset, 0);
  lines.push(`| img 标签 | ${totalImgTags}（lazy ${lazyTags}，width+height ${whTags}，srcset ${srcsetTags}） |`);
  lines.push('');
  lines.push('### 第三方域名');
  lines.push('');
  if (!Object.keys(metrics.thirdParty).length) lines.push('- 无');
  else {
    lines.push('| 域名 | 引用页面数 | 在白名单内 |');
    lines.push('|---|---|---|');
    for (const [domain, info] of Object.entries(metrics.thirdParty).sort((a, b) => b[1].pages - a[1].pages)) {
      lines.push(`| ${domain} | ${info.pages} | ${BUDGETS.thirdPartyAllowlist.includes(domain) ? '是' : '否'} |`);
    }
  }
  lines.push('');
  lines.push('### gzip 最大的 10 个页面');
  lines.push('');
  lines.push('| 页面 | gzip | 原始 |');
  lines.push('|---|---|---|');
  for (const p of metrics.pages.slice(0, 10)) {
    lines.push(`| ${p.path} | ${fmtBytes(p.gzipBytes)} | ${fmtBytes(p.bytes)} |`);
  }
  return lines.join('\n');
}

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Returns { errors: [], warnings: [], skipped: [] } */
function runChecks(metrics, budgets = BUDGETS) {
  const errors = [];
  const warnings = [];
  const skipped = [];

  if (!metrics.publicExists) {
    skipped.push('public/ 不存在，跳过全部断言（先运行 node build.js）');
    return { errors, warnings, skipped };
  }
  if (!metrics.pages.length) {
    skipped.push('public/ 中没有 HTML 页面，跳过页面级断言');
  }

  // 1a. 站点模板开销（正文以外的一切）：每一页都必须满足
  let unmeasured = 0;
  for (const p of metrics.pages) {
    if (p.chromeGzipBytes === null) { unmeasured++; continue; }
    if (p.chromeGzipBytes > budgets.chromeGzipBytes) {
      errors.push(`页面模板开销超预算：${p.path} ${fmtBytes(p.chromeGzipBytes)} > ${fmtBytes(budgets.chromeGzipBytes)}`);
    }
  }
  if (unmeasured) {
    // Redirect shells and standalone slide decks have no site chrome. That is only
    // acceptable while they stay small — otherwise unmeasurable means unchecked.
    const oversized = metrics.pages.filter((p) => p.chromeGzipBytes === null && p.gzipBytes > budgets.pageGzipBytes);
    for (const p of oversized) {
      errors.push(`页面无法切分正文/模板且超过 ${fmtBytes(budgets.pageGzipBytes)}：${p.path} ${fmtBytes(p.gzipBytes)}`);
    }
    warnings.push(`${unmeasured} 个页面无站点模板标记（重定向页/独立 slide 页），按体积上限兜底校验`);
  }

  // 1b. 单页总体积：正文特重的页面走豁免清单
  const heavyPages = readHeavyPages();
  const heavySet = new Set(heavyPages);
  if (heavyPages.length > budgets.maxHeavyPages) {
    errors.push(`正文特重页面豁免清单过长：${heavyPages.length} 条 > ${budgets.maxHeavyPages}`);
  }
  for (const p of metrics.pages) {
    const budget = p.tier === 'index' ? budgets.indexGzipBytes : budgets.pageGzipBytes;
    const overBudget = p.gzipBytes > budget;
    const exempt = heavySet.has(p.path);
    if (overBudget && !exempt) {
      errors.push(`页面 gzip 超预算：${p.path} ${fmtBytes(p.gzipBytes)} > ${fmtBytes(budget)}（如属正文特重页，登记到 data/perf-heavy-pages.txt）`);
    }
    if (!overBudget && exempt && p.tier !== 'index') {
      errors.push(`豁免清单里有已达标页面，请删除：${p.path} ${fmtBytes(p.gzipBytes)}`);
    }
  }
  for (const listed of heavyPages) {
    if (!metrics.pages.some((p) => p.path === listed)) {
      errors.push(`豁免清单指向不存在的页面：${listed}`);
    }
  }

  // 2. 第三方域名白名单
  for (const [domain, info] of Object.entries(metrics.thirdParty)) {
    if (!budgets.thirdPartyAllowlist.includes(domain)) {
      errors.push(`第三方域名不在白名单：${domain}（${info.pages} 个页面引用）`);
    }
  }

  // 3. 分类树单份交付
  for (const p of metrics.pages) {
    if (p.hasDataTree) errors.push(`页面内联了分类树 data-tree：${p.path}`);
    if (p.hasCategoryBrowser && !p.hasCategoryTreeJson) {
      errors.push(`页面有分类浏览器但未引用共享分类数据：${p.path}`);
    }
  }
  if (metrics.pages.some((p) => p.hasCategoryBrowser) && !metrics.categoryTree) {
    errors.push('缺少 assets/data/category-tree.json');
  }

  // 4. 重型脚本按需注入
  for (const p of metrics.pages) {
    if (p.hasPrism && !p.hasCodeBlock) errors.push(`无代码块页面加载了 Prism：${p.path}`);
    if (p.hasMathJax && !p.hasMathMarkup) errors.push(`无数学内容页面加载了 MathJax：${p.path}`);
  }

  // 5. 图片属性完整性
  const missingDims = [];
  const unmeasurable = [];
  for (const p of metrics.pages) {
    for (const src of p.imgs.missingDims) missingDims.push(`${p.path} → ${src}`);
    for (const src of p.imgs.unmeasurable) unmeasurable.push(src);
  }
  const uniqueUnmeasurable = [...new Set(unmeasurable)];
  if (uniqueUnmeasurable.length) {
    warnings.push(`${uniqueUnmeasurable.length} 个 <img> 指向外部地址或不存在的文件，无法标注尺寸（内容侧问题）：${uniqueUnmeasurable.slice(0, 5).join('; ')}`);
  }
  if (missingDims.length) {
    errors.push(`${missingDims.length} 个 <img> 缺少 width/height，例：${missingDims.slice(0, 3).join('; ')}`);
  }

  // 5b. 大图必须有响应式候选源
  const largeNoSrcset = [];
  for (const p of metrics.pages) {
    for (const entry of p.imgs.largeWithoutSrcset) largeNoSrcset.push(`${p.path} → ${entry}`);
  }
  if (largeNoSrcset.length) {
    errors.push(`${largeNoSrcset.length} 个 >1600px 图片缺少多档 srcset，例：${largeNoSrcset.slice(0, 3).join('; ')}`);
  }

  // 6. 单图体积
  for (const img of metrics.images) {
    if (img.bytes > budgets.singleImageBytes) {
      errors.push(`单图超 2MB：${img.path} ${fmtBytes(img.bytes)}`);
    }
  }

  // 7. 产物总体积
  if (metrics.totalBytes > budgets.totalPublicBytes) {
    errors.push(`产物总体积超限：${fmtBytes(metrics.totalBytes)} > ${fmtBytes(budgets.totalPublicBytes)}`);
  }

  return { errors, warnings, skipped };
}

function main() {
  const args = process.argv.slice(2);
  const metrics = collectMetrics();

  if (args.includes('--json')) {
    process.stdout.write(JSON.stringify(metrics, null, 2));
    return;
  }

  if (args.includes('--check')) {
    const { errors, warnings, skipped } = runChecks(metrics);
    for (const s of skipped) console.log(`⏭  ${s}`);
    for (const w of warnings) console.log(`⚠  ${w}`);
    if (errors.length) {
      console.error(`\n❌ 性能门禁失败（${errors.length} 项）：\n`);
      for (const e of errors) console.error(`  - ${e}`);
      process.exit(1);
    }
    if (!skipped.length) console.log('✅ 性能门禁通过');
    return;
  }

  console.log(reportMarkdown(metrics));
}

if (require.main === module) main();

module.exports = { BUDGETS, collectMetrics, runChecks, reportMarkdown, fmtBytes, hasMathMarkup, hasCodeBlock };
