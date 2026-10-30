/**
 * Delivery performance budget tests.
 *
 * Assertions run against public/ (build output). When public/ is missing — or was
 * built before this suite existed — the checks are skipped rather than failed, so
 * `npm test` stays meaningful on a fresh clone before the first build.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const {
  BUDGETS,
  collectMetrics,
  runChecks,
  hasMathMarkup,
  hasCodeBlock,
} = require('../scripts/check-perf-budget');

let cached = null;
function metrics() {
  if (!cached) cached = collectMetrics();
  return cached;
}

const tests = {
  'perf: public/ 存在时才断言（否则显式跳过）': () => {
    const m = metrics();
    assert.ok(typeof m.publicExists === 'boolean');
  },

  'perf: 门禁无错误项': () => {
    const m = metrics();
    if (!m.publicExists) return; // 跳过：需要先 build
    const { errors } = runChecks(m);
    assert.deepEqual(errors, [], errors.join('\n'));
  },

  'perf: 页面不内联分类树': () => {
    const m = metrics();
    if (!m.publicExists) return;
    const offenders = m.pages.filter((p) => p.hasDataTree).map((p) => p.path);
    assert.deepEqual(offenders, [], `内联 data-tree 的页面：${offenders.slice(0, 5).join(', ')}`);
  },

  'perf: 第三方域名白名单内': () => {
    const m = metrics();
    if (!m.publicExists) return;
    const extra = Object.keys(m.thirdParty).filter((d) => !BUDGETS.thirdPartyAllowlist.includes(d));
    assert.deepEqual(extra, [], `未登记的第三方域名：${extra.join(', ')}`);
  },

  'perf: 无代码块页面不加载 Prism': () => {
    const m = metrics();
    if (!m.publicExists) return;
    const offenders = m.pages.filter((p) => p.hasPrism && !p.hasCodeBlock).map((p) => p.path);
    assert.deepEqual(offenders, [], offenders.slice(0, 5).join(', '));
  },

  'perf: 无数学页面不加载 MathJax': () => {
    const m = metrics();
    if (!m.publicExists) return;
    const offenders = m.pages.filter((p) => p.hasMathJax && !p.hasMathMarkup).map((p) => p.path);
    assert.deepEqual(offenders, [], offenders.slice(0, 5).join(', '));
  },

  'perf: 每个 <img> 都有 width/height': () => {
    const m = metrics();
    if (!m.publicExists) return;
    const missing = [];
    for (const p of m.pages) {
      for (const src of p.imgs.missingDims) missing.push(`${p.path} → ${src}`);
    }
    assert.deepEqual(missing.slice(0, 5), [], `${missing.length} 个 img 缺尺寸，例：${missing.slice(0, 3).join('; ')}`);
  },

  'perf: 共享分类树 JSON 存在且可解析': () => {
    const m = metrics();
    if (!m.publicExists) return;
    const treePath = path.join(__dirname, '..', 'public', 'assets', 'data', 'category-tree.json');
    assert.ok(fs.existsSync(treePath), '缺少 public/assets/data/category-tree.json');
    const tree = JSON.parse(fs.readFileSync(treePath, 'utf8'));
    assert.ok(Array.isArray(tree) && tree.length > 0, '分类树为空');
  },

  'detect: hasCodeBlock 只认带 language- 的代码块': () => {
    assert.equal(hasCodeBlock('<pre><code class="language-js">x</code></pre>'), true);
    assert.equal(hasCodeBlock('<pre><code>x</code></pre>'), false);
    assert.equal(hasCodeBlock('<p>no code</p>'), false);
  },

  'detect: hasMathMarkup 忽略 head/script 内容': () => {
    assert.equal(hasMathMarkup('<p>价格 5 元，共 10 元</p>'), false);
    assert.equal(hasMathMarkup('<p>只有一个 $ 符号</p>'), false);
    assert.equal(hasMathMarkup('<p>公式 $E=mc^2$ 成立</p>'), true);
    assert.equal(hasMathMarkup('<p>块级 $$\\int_0^1 x dx$$</p>'), true);
    assert.equal(hasMathMarkup('<script>var a = "$x$";</script>'), false);
    assert.equal(hasMathMarkup('<head><style>.a{content:"$x$"}</style></head><p>无数学</p>'), false);
  },
};

module.exports = { tests, name: 'perf-budget' };
