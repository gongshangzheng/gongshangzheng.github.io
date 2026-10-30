# Proposal: impeccable 全站可读性与排版修补

## Why

用 impeccable 4.8.0 的 detect 引擎扫了 15 个渲染面和 45 个源文件，发现的问题不是审美分歧，而是可读性 defect：首页两句正文只有 3.6:1 和 2.7:1，分类索引的 chip 计数是 10.88px，分类页日期行溢出容器最多 34px，数字人 Hub 的推荐资源块在暗色主题下是浅灰底配浅米色字（1.5:1），正文在这个块里基本看不见。这些都不能靠"再看看"解决，需要一次有成文下限的修补。

现在做的另一个理由是：站点缺少视觉基线文档（无 `PRODUCT.md` / `DESIGN.md`），每次改样式都靠 `site-design-language` 的口头约定，没有可执行的判据。本次把 detect 已经验证过的硬指标写回 skill，并引入可重复的检测回路，避免同类问题再次累积。

## What Changes

**可读性（P0）**

- `src/pages/digital-human-hub.html` 的"推荐外部资源"块移除内联样式：`var(--bg-alt, #f8f9fa)` 里的 `--bg-alt` 全站未定义，暗色主题下掉到浅灰底，与 `--text-color` 形成 1.5:1。
- 移除元信息上叠加的 `opacity`：`.home-quote` 的 `opacity: .7`（3.6:1）、`#sortable-posts .date` 的 `opacity: .55`（2.7:1）、`.taxonomy-chip-sm` 的 `opacity: .82`（chip 计数 4.0–4.1:1）全部改为直接使用已有的 `--text-muted`（暗色 5.5:1 / 亮色 6.3:1）。
- `.taxonomy-chip-sm strong` 字号从 `0.68rem`（10.88px）提到 `0.7rem`（11.2px），消除功能文字低于 11px 下限的问题（26 处）。
- `.post-list .date` 加 `flex: 0 0 auto`：原 `min-width: 80px` 覆盖了 flex 项的 `min-content` 下限，日期被压到 80px 后 `nowrap` 文字溢出行宽（分类页 20 处，最大 34px）。

**排版（P1）**

- 首页 `.home-subtitle` 的 `letter-spacing: 0.15em` 降到 `0.02em`：中文正文级文字不该拉到全角间距。
- 移动端为主页 hero 文本区和页脚补横向内边距，消除正文贴到视口边缘只剩 8px 的情况。
- `lib/generators/post-graph.js` 的关系图标题从 `h3` 改为 `h2`，`post-graph.css` 同步换选择器并保持字号不变，消除 h1→h3 跳级（影响所有含关系图的页面）。
- arXiv 日报的论文标题同样从 `h3` 改为 `h2`：改 `arxiv-paper-digest` 的 Python 模板，并批量重写 49 个历史日报页面的 2309 个标题；`article-components.css` 锁 `.paper-card h2` 的字号与下划线，保住原视觉。
- arXiv 日报的摘要段落加最大行宽（西文约 68ch），把 ~97–100 字符/行的 68 段压回 80 字符以内；改共享 CSS，历史日报页无需重新生成。
- Hub 页 `.photo` 图注与图片边界的 0px 间距补齐（先量后改，见 design）。

**基线与门禁（P2 与流程）**

- 文章头部 `.meta-item` 允许换行：一条 meta 里可能串十几个 arXiv / repo 药丸链接，`inline-flex` 默认不换行，实测在 358px 容器里撑到 1915px，把整个页面顶出横向滚动。
- 实施中发现并一并修掉的三处同类缺陷：`.ch-label` 直接用 `--accent-blue`（亮色下 3.2–3.6:1）、`.stats .label.g/.b` 直接用强调色（gold 亮色下 2.0:1）、`cite` 引用 `--bg-hover`（该变量不存在）。

- `.impeccable/config.json` 纳入版本控制，写入带理由的共享 ignore：`side-tab`（左侧 3–4px 强调边是本站 `quote` / `.ch` / `hub-section` 的既有锚点写法）、`em-dash-overuse`（中文长文的破折号密度，advisory 噪音）。本地 ignore 走 `config.local.json`，仍然 gitignored。
- `site-design-language` skill 增补硬性下限表（对比度、最小字号、行宽、标题层级、图片间距、禁止不存在的变量兜底、禁止用 opacity 压元信息）与"改完必须用 impeccable detect 验证"的流程。
- `AGENTS.md` 补一行：视觉/样式改动必须通过 `impeccable detect` 复查，硬性下限以 `site-design-language` 为准。

## Capabilities

### New Capabilities

- `site-visual-quality`: 站点交付页面的可读性与排版契约——正文对比度、功能文字最小字号、CSS 变量的可解析性、列表元信息不溢出、标题层级完整、西文行宽上限、图注间距，以及在暗/亮两种主题下用检测器验证这些约束的流程。

### Modified Capabilities

（无。现有三个 spec 覆盖内容规划、数字人内容组织与 skill 路径卫生，都不涉及视觉可读性约束。）

## Impact

- `src/pages/digital-human-hub.html`：移除推荐资源块的内联样式，改用既有类。
- `src/pages/index.html`：`page_style` 中的 `.home-subtitle`、`.home-quote`、`#sortable-posts .date` 规则。
- `assets/css/modules/hero.css`：`.taxonomy-chip-sm`、`.taxonomy-chip-sm strong`。
- `assets/css/modules/nav.css`：`.post-list .date`。
- `assets/css/modules/layout.css`：移动端 hero 文本区内边距。
- `assets/css/modules/article-struct.css`：`.photo` / `.photo .cap` 间距。
- `assets/css/modules/article-components.css`：`.paper-abstract p` 行宽、`.paper-card h2` 标题锁定。
- `assets/css/modules/article-struct.css`：`.meta-item` 换行与 `cite` 变量修正。
- `assets/css/modules/post-graph.css`：标题选择器 `h3` → `h2`。
- `lib/generators/post-graph.js`：关系图标题标签。
- `assets/css/modules/chapter.css`：`.ch-label` 颜色改为与正文色混合。
- `src/pages/arxiv-digest-*.html`（49 个文件、2309 个标题）与 `.agents/skills/arxiv-paper-digest/src/html_blog_digest.py`：日报论文标题 `h3` → `h2`。
- `.impeccable/config.json`（新增，纳入版本控制）。
- `.agents/skills/site-design-language/SKILL.md`（及必要的 `references/`）：硬性下限与验证流程。
- `AGENTS.md`：视觉改动验证条款。
- 不改动：文章正文内容、frontmatter、分类体系、URL 结构、构建管线输出格式、`site-performance` 已定义的门禁。
- 注意：工作区当前有未提交的 toc 相关改动（`assets/css/modules/toc.css`、`assets/js/runtime/toc.js`、`lib/toc.js`、`lib/generators/*`、`build.js`），不属于本 change，提交时必须分开。
