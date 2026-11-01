# Proposal: 文章正文组件与标题大纲修补

## Why

上一轮 `impeccable-site-pass` 修的是全站框架层（首页、索引、Hub、日报）。把扫描扩到文章正文后，同一批缺陷在正文组件里又出现一次，而且更集中：`.info-box` / `.def-box` / `.callout` / `.admonition` 的标题色在亮色主题下只有 2.0–4.1:1，`.admonition` 有一种裸写法（没有 `.admonition-content` 包裹）让正文直接贴在边框上，`embeds.css` 里还有一处 `color: --accent-blue);` 这种语法错误导致整条声明被丢弃。

同时，正文的标题大纲系统性地跳级：570 个页面是 `h1` 后直接 `h3`，其中 526 个全页没有 `h2`。这不是某篇文章写错，而是站点的写作习惯（`###` 当节、`####` 当小节），所以按「逐篇改内容」的方式修不动，需要在构建期统一归一。

## What Changes

**标题大纲（P0）**

- 构建期为每个页面归一标题层级：正文首个标题落到 `h2`，其后按相对深度递进，`h3`→`h3` 的原有嵌套关系保持不变。
- 归一化只改标签，不改视觉：TOC 流程现有按原层级映射的样式类（`h2`→`.ch-title`、`h3`→`.section-title`）保持按原层级取，字号与间距维持现状。
- 影响面：570 个含跳级的页面（其中 526 个整页无 `h2`），全部在构建期修好，不改 `src/pages/` 正文。

**正文组件（P0）**

- `.admonition` 在没有 `.admonition-content` 包裹时补内边距（有包裹时保持现状，不叠两层）。
- `embeds.css` 的 `.admonition.info .admonition-title` 修掉 `color: --accent-blue);` 语法错误；`.admonition` 的 title 颜色重调到两主题 ≥4.5:1。
- `.info-box`（879 处引用，119 个页面用 `.example-box`、222 个用 `.def-box`、479 个用 `.callout`）的标题色重调：现在 `color-mix(accent-gold 75%, text-heading)` 在亮色下是 3.2:1，`def-box` 是 4.1:1，`callout` 是 2.0:1。
- `.stats .num.g` 大字对比度 2.0:1（未达大字 3:1）。

**排版（P1）**

- hero 副标题 `.sub` 的 `letter-spacing: 0.30em` 降到 `0.05em`：674 个页面用 `hero_sub`，英文长句拉 0.3em 已经影响阅读。
- 组件内的 `.table-wrap` 取消自带的边框与圆角：`.example-box` / `.info-box` 里再套一个"卡片"是嵌套卡片的典型形态，横向滚动能力不受影响。
- 行内数学字号抬到 11px 下限：MathJax 渲染的 `mn` 现在是 10.64px。

**基线（P2）**

- `shape-assembled-illustration` 判定为设计选择：站内图示是自绘 SVG 组合图形，这条规则针对的是拿形状拼贴冒充插画的情况。写入共享 ignore 并附理由。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `site-visual-quality`: 标题层级要求从「页面不得跳级」扩展为「构建期把正文大纲归一到合法层级且不改视觉」；新增内容块组件标题对比度、组件内边距与嵌套容器、行内数学字号三项可验证要求。

## Impact

- `lib/toc.js`：标题归一层级（与现有的 id/class 重写同一处）。
- `assets/css/modules/article-components.css`：`.info-box` / `.def-box` / `.callout` / `.example-box` 标题色、组件内 `.table-wrap`。
- `assets/css/modules/embeds.css`：`.admonition` 内边距与标题色、语法错误。
- `assets/css/modules/hero.css`：`.hero-inner .sub` 字距、`.stats .num.g`。
- `assets/css/modules/article-struct.css`：行内数学字号下限。
- `.impeccable/config.json`：新增 `shape-assembled-illustration` ignore。
- `.agents/skills/site-design-language/SKILL.md`：补组件标题色与嵌套容器的判据。
- 不改动：`src/pages/` 正文内容（标题标签由构建期归一，源文件保持作者写法）、文章 frontmatter、分类与 URL。
- 预计影响 813 个页面中的 570 个（标题层级）与 879 处组件引用（标题色），全部为构建期或 CSS 层改动。
