## Context

站点是 813 个页面的静态博客，样式集中在 `assets/css/modules/*.css`，页面由 `build.js` + `lib/generators/*` 生成，另有大量手写 `src/pages/*.html`（其中一部分用 `page_style` 携带页内 CSS）。主题色由 `assets/css/modules/variables.css` 的 `:root`（亮色）与 `html.dark`（暗色）两套变量提供，页面默认暗色。

扫描得到的缺陷有三个共同的机制，值得先记下来，因为它们决定了修法：

1. **透明度叠加**。`--text-muted` 本身在两种主题下都过线（暗色 5.5:1、亮色 6.3:1），缺陷全部来自在它之上再叠 `opacity`（`.7`、`.55`、`.82`），把有效对比度压到 3.6 / 2.7 / 4.1。
2. **flex 的 `min-width` 覆盖 `min-content`**。`.post-list .date` 写了 `min-width: 80px`，这条声明让 flex 项可以收缩到 80px，而 `white-space: nowrap` 又禁止折行，文字只能溢出。
3. **不存在的变量 + 硬编码兜底**。`var(--bg-alt, #f8f9fa)` 在暗色主题下把浅灰面板画在深色页面上，块内文字仍是暗色主题的浅米色。

约束：`site-performance` 已定的预算与门禁不能碰；构建产物格式不变；不得改动文章正文内容；工作区里已有一批他人未提交的 toc 改动，本次改动必须能与之分开提交。

## Goals / Non-Goals

**Goals:**

- 每项 P0/P1 缺陷都有明确的机制解释和最小改动面，改完由检测器复扫证明消失。
- 修法只使用既有主题变量与既有组件类，不新增主题色、不引入新的设计语言。
- 把这次验证过的量化下限写进 `site-design-language`，让下一次改样式能直接查判据，而不是重跑一遍审视。
- 检测器配置进入版本控制，团队共用同一套"什么算设计选择"的约定。

**Non-Goals:**

- 不做视觉方向调整（不 bolder、不 quieter、不改字体、不改配色基色）。
- 不处理 advisory 级噪音：`em-dash-overuse`、`unbalanced-heading`、`straggler`（自动生成的英文标题与中文摘要本身决定了末行宽度，改不划算）。
- 不为暗色/亮色主题做自动化截图回归，本次只记录手动复查步骤。
- 不重新生成历史 arXiv 日报页（改共享 CSS 即可覆盖）。

## Decisions

**D1 用 `--text-muted` 原色替换 opacity 叠层，而不是提高 `--text-muted` 的色值。**
`--text-muted` 已经是两套主题里都过线的弱化色，问题出在叠加。提高色值会让全站所有弱化文字一起变重（副标题、日期、图注、面包屑），那是视觉方向改动；去掉 `opacity` 只影响被点名的三处。备选方案（新增 `--text-faint-aa` 变量）被否：现有变量够用，新增变量等于给后人留一个"再调浅一点"的口子。

**D2 日期溢出改 flex 行为，不改日期内容。**
`.post-list .date { flex: 0 0 auto }` 让日期按内容定宽、标题承担收缩，这是列表类布局的常规做法，且与首页 `#sortable-posts .date` 已有的 `flex-shrink: 0` 一致。备选方案（在生成器里把 `2026/09/24 10:00:00` 截成 `2026/09/24`）被否：那是内容口径变更，需要单独讨论时间戳对索引页有没有意义，不该夹在可读性修补里。

**D3 关系图标题改 `h2` 并按选择器保尺寸，而不是在页面里补一个空 `h2`。**
跳级的来源是 `lib/generators/post-graph.js` 输出 `h3`。改标签 + 把 `post-graph.css` 的 `.post-graph-header h3` 换成 `h2` 并锁定原 font-size，视觉零变化、语义正确，且所有引用该 shortcode 的页面（含历史页）下次构建一起修好。补空 `h2` 会让无障碍树里出现无文字标题，明确更差。

**D4 日报行宽改共享 CSS，不重新生成历史页。**
`paper-card` 的样式来自每页的 `page_style`，但 `.paper-abstract p` 作为一个稳定类名可以统一在 `article-components.css` 里限宽（约 68ch）。这样 100+ 个历史日报页无需重跑 Python 管线，也与"摘要类段落一律限宽"这条判据一致。备选方案（改 `arxiv-paper-digest` 的 Python 模板）被否：只能修以后生成的页，历史页依旧超宽。

**D5 Hub 页推荐资源块改用既有类与既有变量。**
把内联 `border-left/padding/background` 换成站点已有的 `.section`-系卡片写法（`--bg-block` 底 + `--border-light` 边 + `--accent` 左侧细线）。保留左侧强调边是刻意的，见 D6。

**D6 `side-tab` 判定为设计选择，写入共享 ignore。**
左侧 3–4px 强调边出现在 `quote`、`.ch`、`hub-section`、`document-page` 等块上，是 `site-design-language` 里写明的"标题下划线、边框、浅底卡片是本站常用视觉锚点"。检测器把它当作 AI 生成 UI 的典型标识，这是它的默认假设，与本站既有风格冲突。处理方式是按规则忽略并写明理由，而不是逐处削弱样式。备选（每处用注释 ignore）被否：同样是设计选择，散落的注释会让后来者误以为是逐案例外。
实施时发现 `impeccable ignores add-rule` 只接受规则名，没有 `--reason` 字段（理由只存在于 `add-value`）。因此理由写进 `site-design-language` 的"检测器基线"小节，与共享配置里的条目一一对应。

**D10 日报论文标题也升到 `h2`，模板与历史页面一起改。**
实施复扫时发现日报页是 `h1` 后直接跟 `h3`，与关系图属同一类跳级缺陷，而它不在最初的报告里。处理原则与 D3 相同：改语义标签、锁回原有视觉。差异在于来源是 Python 生成的静态页面（`arxiv-paper-digest` 的 `html_blog_digest.py`），所以模板与 49 个历史页面（2309 个标题）要一起改，否则新旧日报的标题层级与样式会分叉。视觉用 `.paper-card h2` 锁回实测值（1.4rem / 700 / `--h2-color` / 12px 下内边距 / 2px accent 下划线），因为 TOC 流程会给 `h2` 加 `.ch-title`（1.6rem）。

**D11 实施期发现的三处同类缺陷一并修。**
`.ch-label`（3.2–3.6:1）、`.stats .label.g/.b`（gold 在浅底 2.0:1）、`cite` 的 `var(--bg-hover)`（变量不存在）都是这条 change 定义的缺陷类别：小字用强调色、引用不存在的变量。前两处改用与 `--text-color` 混合或直接回落到 `--text-muted`，第三处换成已存在的 `--bg-card-hover`。它们不在最初报告里，但属于同一份 spec 的约束，改法与已批准的 P0 同构，因此没有另开 change，只回填本 proposal 的 What Changes。

**D7 检测器配置分共享与本地两层。**
`.impeccable/config.json` 进版本控制（团队共享的规则判定），`.impeccable/config.local.json` 继续 gitignored（个人临时压噪）。`.gitignore` 需要放行共享配置文件。

**D8 验证用本机 `ego lite` 作 Chromium。**
本机没有 Chrome/Chromium/Edge，检测器的 URL 扫描需要浏览器；`IMPECCABLE_BROWSER="/Applications/ego lite.app/Contents/MacOS/ego lite"` 可用。验证命令与这个环境细节一起写进 skill，避免下次重新踩。

**D9 亮色主题用"临时切换到亮色 + 复扫"验证。**
检测器跟着浏览器当前配色跑，默认暗色只覆盖一半。改完后在浏览器里切到亮色主题复扫首页、分类索引、Hub 页三处，结果记入 tasks 的验收记录。

## Risks / Trade-offs

- `.photo` 的 0px 间距先量后改：检测器只在 Hub 页报了 3 处，`article-struct.css` 里 `.cap` 本身有 `12px 18px` 内边距，可能是检测器把图注的父容器当成文字容器。 → 改前用 DOM 测量确认是"图注贴边"还是"图片贴卡片边"，只对真实存在的情况加 padding，避免给全站图片额外加 8px 空白。

- 关系图 `h3 → h2` 影响所有含该 shortcode 的页面（含历史页）。 → 构建后抽查 3 个不同模板的页面（分类索引、Hub、课程笔记），确认标题字号与间距未变。

- 日报摘要限宽会改变历史日报页的渲染。 → 只影响段落行宽，不改字号与配色；构建后对比修改前后的一个日报页截图。

- `.impeccable/config.json` 引入一份新的工具配置。 → 它的内容只有 ignore 列表，不含产品信息；`PRODUCT.md`/`DESIGN.md` 本次不生成（需要用户参与确认产品定位，另开 change）。

- 工作区已有未提交的 toc 改动。 → 提交前用 `git status --short` 逐文件确认，只 add 本 change 触及的文件，TOC 相关改动原样留在工作区。

## Migration Plan

1. 改动只在 CSS / 生成器 / 单个页面 / 文档层面，无数据迁移。
2. 执行 `node tests/run.js` 与 `node build.js`，再对受影响渲染面复扫。
3. 回滚策略：逐文件 `git checkout --` 即可；`post-graph.js` 与 `post-graph.css` 必须成对回滚（标签与选择器绑定）。

## Open Questions

（无。`PRODUCT.md` / `DESIGN.md` 的生成已明确排除在本次范围外。）
