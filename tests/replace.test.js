const { processBody, processShortcodes } = require('../lib/replace');

function assert(condition, msg) {
  if (!condition) throw new Error('FAIL: ' + msg);
}

function section(name, fn) {
  try { fn(); console.log('  ✓ ' + name); }
  catch (e) { console.log('  ✗ ' + name + ': ' + e.message); process.exitCode = 1; }
}

// ============================================================
// processShortcodes
// ============================================================
console.log('\nprocessShortcodes:');

// bg shortcode
section('bg yellow', () => {
  const out = processShortcodes('{{< bg yellow >}}highlighted{{< /bg >}}');
  assert(out.includes('background:#ffeb92fd'), 'yellow bg missing, got: ' + out);
});

section('bg red', () => {
  const out = processShortcodes('{{< bg red >}}highlighted{{< /bg >}}');
  assert(out.includes('background:#fa9494'), 'red bg missing');
});

section('bg blue', () => {
  const out = processShortcodes('{{< bg blue >}}text{{< /bg >}}');
  assert(out.includes('background:#9ccaff'), 'blue bg missing');
});

section('bg green', () => {
  const out = processShortcodes('{{< bg green >}}text{{< /bg >}}');
  assert(out.includes('background:#acffea'), 'green bg missing');
});

section('bg purple', () => {
  const out = processShortcodes('{{< bg purple >}}text{{< /bg >}}');
  assert(out.includes('background:#eeb4ff'), 'purple bg missing');
});

// details shortcode
section('details openByDefault', () => {
  const out = processShortcodes('{{< details summary="展开阅读" openByDefault=true >}}内容{{< /details >}}');
  assert(out.includes('<details open>'), 'open attribute missing');
  assert(out.includes('<summary>展开阅读</summary>'), 'summary missing');
  assert(out.includes('内容</details>'), 'content missing');
});

section('details default closed', () => {
  const out = processShortcodes('{{< details summary="标题" >}}内容{{< /details >}}');
  assert(out.includes('<details>'), 'should not have open attribute');
  assert(out.includes('<summary>标题</summary>'), 'summary missing');
});

// bilibili shortcode
section('bilibili with BV id', () => {
  const out = processShortcodes('{{< bilibili BV1xxooXX1Xx >}}');
  assert(out.includes('player.bilibili.com/player.html?bvid=BV1xxooXX1Xx'), 'bilibili iframe src wrong, got: ' + out);
});

section('bilibili with page param', () => {
  const out = processShortcodes('{{< bilibili BV1xx p=3 >}}');
  assert(out.includes('page=3'), 'page param missing, got: ' + out);
});

// youtube shortcode
section('youtube with caption', () => {
  const out = processShortcodes('{{< youtube dQw4w9WgXcQ "精彩视频" >}}');
  assert(out.includes('lite-youtube'), 'lite-youtube missing, got: ' + out);
  assert(out.includes('>精彩视频<'), 'caption missing, got: ' + out);
});

section('youtube without caption', () => {
  const out = processShortcodes('{{< youtube abc123 >}}');
  assert(out.includes('lite-youtube'), 'lite-youtube missing');
  assert(!out.includes('<p class="caption">'), 'should not have caption');
});

// local video shortcode
section('video shortcode', () => {
  const out = processShortcodes('{{< video "assets/video/demo.mp4" >}}');
  assert(out.includes('<video controls'), 'video tag missing, got: ' + out);
  assert(out.includes('src="assets/video/demo.mp4"'), 'src missing');
});

// googleslides shortcode
section('googleslides shortcode', () => {
  const out = processShortcodes('{{< googleslides "https://docs.google.com/presentation/d/xxx" >}}');
  assert(out.includes('googleslides-embed'), 'googleslides-embed missing, got: ' + out);
  assert(out.includes('iframe src="https://docs.google.com/presentation/d/xxx"'), 'iframe src wrong, got: ' + out);
});

// ============================================================
// processBody
// ============================================================
console.log('\nprocessBody:');

const defaultOpts = { imgDir: 'assets/media', baseUrl: '/' };

// Highlight: ==text==
section('highlight ==text==', () => {
  const out = processBody('这是 ==高亮文字== 测试', defaultOpts);
  assert(out.includes('<mark>高亮文字</mark>'), 'mark missing, got: ' + out);
});

// Wiki links
section('wiki link without country (default en)', () => {
  const out = processBody('[[wiki Albert Einstein | 爱因斯坦]]', defaultOpts);
  assert(out.includes('https://en.wikipedia.org/wiki/Albert%20Einstein'), 'url wrong, got: ' + out);
  assert(out.includes('>爱因斯坦</a>'), 'display text wrong, got: ' + out);
});

section('wiki link with .en', () => {
  const out = processBody('[[wiki.en Industrial Revolution | 工业革命]]', defaultOpts);
  assert(out.includes('https://en.wikipedia.org/wiki/Industrial%20Revolution'), 'url wrong, got: ' + out);
  assert(out.includes('>工业革命</a>'), 'display text wrong, got: ' + out);
});

section('wiki link with .zh', () => {
  const out = processBody('[[wiki.zh 日本历史 | 日本历史（中文）]]', defaultOpts);
  assert(out.includes('https://zh.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E5%8E%86%E5%8F%B2'), 'url wrong, got: ' + out);
  assert(out.includes('>日本历史（中文）</a>'), 'display text wrong, got: ' + out);
});

section('wiki link trims trailing space in text', () => {
  const out = processBody('[[wiki Albert Einstein | 爱因斯坦]]', defaultOpts);
  assert(!out.includes('%20%20'), 'trailing space in url, got: ' + out);
  assert(!out.includes('Albert Einstein </a>'), 'trailing space in display, got: ' + out);
});

// ArXiv links
section('arxiv abs link', () => {
  const out = processBody('[[arxiv 2301.00001 abs | 论文链接]]', defaultOpts);
  assert(out.includes('https://arxiv.org/abs/2301.00001'), 'url wrong, got: ' + out);
  assert(out.includes('>论文链接</a>'), 'display wrong, got: ' + out);
});

section('arxiv pdf link', () => {
  const out = processBody('[[arxiv 2301.00001 pdf | PDF 版本]]', defaultOpts);
  assert(out.includes('https://arxiv.org/pdf/2301.00001'), 'url wrong, got: ' + out);
});

section('arxiv link trims trailing space', () => {
  const out = processBody('[[arxiv 2301.00001 abs | 论文链接]]', defaultOpts);
  assert(!out.includes('2301.00001%20'), 'trailing space in url, got: ' + out);
  assert(!out.includes('论文链接 '), 'trailing space in display, got: ' + out);
});

// GitHub links
section('github link', () => {
  const out = processBody('[[github pytorch/pytorch | PyTorch]]', defaultOpts);
  assert(out.includes('https://github.com/pytorch/pytorch'), 'url wrong, got: ' + out);
  assert(out.includes('>PyTorch</a>'), 'display wrong, got: ' + out);
});

section('github link trims trailing space', () => {
  const out = processBody('[[github pytorch/pytorch | PyTorch]]', defaultOpts);
  assert(!out.includes('pytorch%20'), 'trailing space in url, got: ' + out);
});

// Google links
section('google link', () => {
  const out = processBody('[[google transformer architecture | 搜索 Transformer]]', defaultOpts);
  assert(out.includes('https://www.google.com/search?q=transformer%20architecture'), 'url wrong, got: ' + out);
  assert(out.includes('>搜索 Transformer</a>'), 'display wrong, got: ' + out);
});

section('google link trims trailing space', () => {
  const out = processBody('[[google transformer | 搜索]]', defaultOpts);
  assert(!out.includes('transformer%20'), 'trailing space in url, got: ' + out);
});

// Wiki image
section('wiki image with width and caption', () => {
  const out = processBody('![[sengoku-japan/nobunaga.jpg | 400 # 织田信长]]', defaultOpts);
  assert(out.includes('src="assets/media/sengoku-japan/nobunaga.jpg"'), 'src wrong, got: ' + out);
  assert(out.includes('width="400"'), 'width wrong, got: ' + out);
  assert(out.includes('>织田信长<'), 'caption wrong, got: ' + out);
});

section('wiki image with only width', () => {
  const out = processBody('![[example.jpg | 300]]', defaultOpts);
  assert(out.includes('width="300"'), 'width wrong, got: ' + out);
  assert(!out.includes('caption'), 'should not have caption');
});

section('wiki image with only caption', () => {
  const out = processBody('![[example.jpg # 图片说明]]', defaultOpts);
  assert(out.includes('>图片说明<'), 'caption wrong, got: ' + out);
  assert(!out.includes('width='), 'should not have width');
});

section('wiki image bare (no width, no caption)', () => {
  const out = processBody('![[example.jpg]]', defaultOpts);
  assert(out.includes('src="assets/media/example.jpg"'), 'src wrong, got: ' + out);
  assert(!out.includes('width='), 'should not have width');
  assert(!out.includes('caption'), 'should not have caption');
});

section('wiki image path with subdirectory', () => {
  const out = processBody('![[japan-history/oda-nobunaga.jpg | 500 # 织田信长]]', defaultOpts);
  assert(out.includes('src="assets/media/japan-history/oda-nobunaga.jpg"'), 'src wrong, got: ' + out);
});

// Internal links
section('internal link to page', () => {
  const out = processBody('[[posts.html | 返回列表]]', defaultOpts);
  assert(out.includes('href="posts.html"'), 'href wrong, got: ' + out);
  assert(out.includes('>返回列表</a>'), 'display wrong, got: ' + out);
});

section('internal link with anchor', () => {
  const out = processBody('[[japan-history.html#绳文 | 跳到绳文章节]]', defaultOpts);
  assert(out.includes('href="japan-history.html#'), 'href wrong, got: ' + out);
  assert(out.includes('>跳到绳文章节</a>'), 'display wrong, got: ' + out);
});

section('xref resolves through postMap when title differs from slug', () => {
  const out = processBody('参见 [[@连续扩散语言模型路线综述：对视觉编码器研究的系统性启发 | 连续扩散语言模型路线综述]]', {
    ...defaultOpts,
    postMap: { '连续扩散语言模型路线综述：对视觉编码器研究的系统性启发': 'continuous-diffusion-language-models-survey' }
  });
  assert(out.includes('href="./continuous-diffusion-language-models-survey.html"'), 'xref should use known post slug, got: ' + out);
  assert(out.includes('>连续扩散语言模型路线综述</a>'), 'alias should be preserved, got: ' + out);
});

// Hide D- elements
section('[[D-...]] hides element', () => {
  const out = processBody('正常文字[[D-要隐藏的内容]]继续', defaultOpts);
  assert(!out.includes('要隐藏'), 'should be hidden, got: ' + out);
  assert(out.includes('正常文字'), 'should preserve other content');
});

// ============================================================
// Combined: shortcodes + body replacements in sequence
// ============================================================
console.log('\nCombined (shortcodes then body):');

section('shortcodes then body replacements work together', () => {
  const body = processShortcodes('{{< bg yellow >}}[[wiki Albert Einstein | 爱因斯坦]]{{< /bg >}}');
  const out = processBody(body, defaultOpts);
  assert(out.includes('background:#ffeb92fd'), 'bg missing, got: ' + out);
  assert(out.includes('https://en.wikipedia.org/wiki/Albert%20Einstein'), 'wiki link missing, got: ' + out);
});

section('.html source files get shortcode processing', () => {
  // Simulate what generator.js does for .html files: processShortcodes + applyReplacements
  const htmlContent = '<p>{{< bg red >}}test{{< /bg >}}</p><p>[[wiki Albert Einstein | 爱因斯坦]]</p>';
  const processed = processShortcodes(htmlContent);
  const out = processBody(processed, defaultOpts);
  assert(out.includes('background:#fa9494'), 'bg not processed, got: ' + out);
  assert(out.includes('https://en.wikipedia.org/wiki/Albert%20Einstein'), 'wiki not processed, got: ' + out);
});

console.log('\n✅ All replace.js tests complete');