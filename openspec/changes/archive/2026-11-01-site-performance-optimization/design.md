# Design: 站点加载性能优化

## Context

动机见 `proposal.md` — Why。这里只记录决定实现路径的现状事实。

**构建管线**：`build.js` 增量构建，产物写入 `public/`（gitignored，由 GitHub Actions 现场 build 后发布）。`public/media` 是 `media/` 的全量 `copyDir` 镜像（`build.js:345`），不判断是否被引用。

**页面装配**：`src/templates/_base.html` 提供 head 骨架，`lib/generators/articles.js` 做后处理（MathJax 注入、`css_modules`、短代码依赖、`__POST_INDEX__` 脚本、PDF.js 脚本），`lib/toc.js` 生成目录与分类侧栏，`lib/replace.js` 处理短代码与 `[[@Title]]` 交叉引用。

**分类侧栏的现状**（关键）：`lib/toc.js:buildCategoryHtml` 同时输出三份等价数据——`data-tree` 属性（整棵树的 JSON）、`data-initial-path`（当前位置）、以及服务端渲染好的完整 `<ul>` 列表。而 `assets/js/runtime/toc.js:initCategoryBrowser` 的 `render()` 在初始化时立刻用 `list.innerHTML = ...` 覆盖服务端列表，也就是说服务端渲染的那份 `<ul>` 对有 JS 的用户从未被看到过。实测单页最高 429KB，全站 HTML 450MB 中 366MB（81%）是这块。

**交叉引用的现状**：`lib/replace.js` 在构建期已用 `postMap` 把 `[[@Title]]` 解析成真实 `href`（`lib/generators/articles.js:103` 传入），`__POST_INDEX__` 与 `resolveXrefs()` 只是把同一份映射搬到浏览器里再算一遍，没有任何额外信息。

**图片的现状**：`media/` 7544 个图片文件共 1.6GB，其中 734 个长边 >4000px（最大 10627×13443），117 个 >2MB。页面实际引用 1768 个，其中 922 个 >1600px、合计 284MB。`public/media` 有 5956 个文件（1.42GB）没有任何页面引用。GitHub Pages 的 `Cache-Control: max-age=600` 改不了，所以唯一可控的杠杆是**减少字节**，不是改缓存策略。

## Goals / Non-Goals

**Goals:**

- 每页固定成本压到接近正文本身：分类树 0 字节内联，第三方阻塞脚本 0 个。
- 单页 gzip ≤40KB、首页 ≤15KB；交付目录 ≤1GB；单图 ≤2MB。
- 移动端图片解码成本降低一个数量级：同一张图按 960/1600 两档交付。
- 构建在 CI 上仍保持分钟级：图片派生有增量缓存，不每次全量重编。
- 全站视觉零回归（字体本来就没生效，删链接后外观不变）。

**Non-Goals:**

- 不改文章正文、frontmatter、分类体系、URL 结构。
- 不自托管中文字体（用户已决定本次只删死链接；自托管另开 change）。
- 不改成 SPA/预取/Service Worker 这类架构改造。
- 不追求 Lighthouse 100 分；目标是把「卡顿」的可归因项消掉。
- 不动 `docs/slide-compiler.md` 相关的 slide 页面行为。

## Decisions

### D1. 分类树外置为单份共享 JSON，客户端首次展开时加载

`buildCategoryHtml` 改为输出空容器 + 当前路径：

```html
<nav id="category-nav" class="toc-tree category-nav category-browser"
     data-initial-path="[...]" data-src="assets/data/category-tree.json">
  <div class="category-browser-bar">…</div>
  <div class="category-browser-list"></div>
</nav>
```

- 构建期额外产出 `public/assets/data/category-tree.json`（全站一份，gzip 后约 20KB）。
- `initCategoryBrowser` 首次运行时 fetch 该文件；用模块级 promise 做进程内缓存，用 `sessionStorage` 做跨页面缓存，并配合 `cache: 'force-cache'` 命中 HTTP 缓存。
- 当前项高亮与折叠状态改为客户端计算：由 `data-initial-path` 与 `location.pathname` 推导，替代构建期写入的 `active` / `collapsed`。
- `<noscript>` 里补一个指向 `categories/index.html` 的链接，保住无 JS 场景的可达性（原本的 drill-down 依赖 JS，本来也不可用）。

**Alternatives**：把树切成按分类分片按需加载——省不了首屏，只增加请求数；保留内联但压掉 `data-tree` 只留 `<ul>`——服务端那份本来就没用，等于没优化。

**为什么不放 Service Worker**：GH Pages 上 SW 的失效管理成本高于收益，且 max-age=600 已经覆盖短时重复访问。

### D2. 交叉引用只保留构建期解析

删除 `__POST_INDEX__` / `__CURRENT_SLUG__` / `resolveXrefs()` 注入。`lib/replace.js` 已有 `postMap` 全量，构建期解析结果与运行时一致。唯一行为差异是：标题完全匹配不到时，构建期走 slugify 兜底，运行时曾经会尝试前缀匹配修正——前缀匹配逻辑上移到 `lib/replace.js`（它内部已有该分支，只需确保 `postMap` 始终传入），并在此情况下输出构建警告。

### D3. 第三方脚本按需注入，head 里零阻塞外链

- 删 `cdn.tailwindcss.com` + `tailwind.config`（全站 utility class 用量为 0，已逐 token 核验；`hugo-theme.css` 也不含任何 Tailwind 产物）。
- 删两个 `chinese-fonts-cdn.deno.dev` 样式表；CSS 里的 `'LXGW Marker Gothic'` / `'Zhuque Fangsong (technical preview)'` 保留为首选族名，继续由 `system-ui` 兜底，视觉不变。
- Prism：`_base.html` 移除，改由 `SHORTCODE_DEPS` 风格的检测注入——页面含 `<pre><code class="language-` 才注入 CSS + 两个脚本（`prism.min.js` 与 autoloader）。同时把 Prism 的 3 个请求加 `defer`。
- MathJax：注入条件从「frontmatter `mathjax: true`」改为「`mathjax: true` **且** 正文含数学标记」。检测在 head 注入点之前用已渲染的 body 做（`\$[^$]+\$`、`\$\$`、`\(`、`\[`），命中才注入。清理后 `tex-svg.js` 附带 `defer`，仍保留现有的 `typesetPromise` 兜底逻辑给动态插入内容用。

### D4. 图片：本地降采样 + 构建期派生 + 尺寸注入

分三层，各自解决不同问题：

**层 1（一次性，本地，入库）** `scripts/optimize-images.js --downsample`：把 `media/` 中长边 >4000px 的图片降采样到 ≤4000px（保 WebP 质量 82），原图移到 gitignored 的 `raw/media-originals/`。影响 734 个文件，是全站体积和「1.4 亿像素解码卡顿」的主因。幂等：已 ≤4000px 的跳过。

**层 2（每次构建，CI 执行）** `scripts/optimize-images.js --variants`：为**被页面引用的、长边 >1600px** 的图片生成 `foo.w960.webp` / `foo.w1600.webp` 到 `public/media/…`（不写入 git）。用 `sharp` 并行编码，配合 `${源文件 size}:${mtime}` → 派生文件 mtime 的增量判断，只有源变了才重编。当前口径下这是 922 个源文件、1844 次编码，GH runner 上约 1–2 分钟。

**层 3（构建期注入）** 页面输出 `<img>` 时按引用关系补齐属性：有派生档就写 `srcset`/`sizes`，并统一写 `width`/`height`（从源图读真实像素）。首屏（hero 段内）第一张图加 `fetchpriority="high"` 且去掉 `loading="lazy"`；其余保持 `loading="lazy" decoding="async"`。

**Alternatives**：把派生档也提交进 git——仓库再涨约 400MB，且每次换尺寸都要重提交一批二进制；在 CI 里缓存 `public/media`——key 粒度只能是全量哈希，任何新图都触发全量失效。

### D5. 只部署被引用的媒体

`build.js` 的媒体拷贝从「全量 `copyDir`」改为「按引用集合拷贝」。引用集合由构建后的 HTML 中 `src`/`href`/`data-src`/`poster`/`srcset` 里出现的 `media/…` 路径汇总，叠加 allowlist 文件 `data/media-keep.txt`（给仅被外站引用、或由 JS 动态拼接的路径留出口）。未被引用的文件留在 `media/`（仍在 git 里），只是不进产物。首次部署体积从 1.7GB 降到约 300MB 量级。

### D6. 性能门禁脚本

新增 `scripts/check-perf-budget.js`，对 `public/` 做静态断言，输出分级报告：页面 gzip 预算、第三方域名白名单、MathJax/Prism 按需、`img` 属性完整性、单图 ≤2MB、`public/` 总量 ≤1GB、`category-nav` 不含 `data-tree`。以 `tests/run.js` 的一个 suite 形式挂进 `npm test`（`--perf` 显式开关，默认在 CI 的 build 之后运行；本地 `npm test` 默认跑，但不跑需要完整 build 产出才能判定的项——缺失产物时 skip 而不是 fail）。

### D7. runtime JS 合并与 defer

10 个 `assets/js/runtime/*.js` 与 `code-tabs.js`、`citation.js` 合并为 `assets/js/runtime.bundle.js`（构建期按固定顺序拼接，不引入打包器），统一加 `defer`。`theme.js` 的必要部分（读 localStorage 设 `class="dark"`）内联到 head，消除暗色模式闪烁。

## Risks / Trade-offs

- **分类树改成运行时加载** → `scripts/check-perf-budget.js` 断言 `category-tree.json` 存在且可解析；`initCategoryBrowser` 加失败兜底（渲染错误提示 + 回退链接），不静默空白。
- **降采样是不可逆的素材变更** → 原图先备份到 `raw/media-originals/`（gitignored），脚本默认 dry-run 并要求 `--apply`；`git` 历史里旧 blob 仍在，可回溯。
- **派生图让 CI 变慢** → 增量判断 + 只在源变化时重编；实测口径 922 个源。若 CI 时间不可接受，可退回「只对 >2MB 的图做派生」。
- **`sharp` 是原生依赖** → 锁版本，`npm ci` 在 `ubuntu-latest` 上走预编译二进制；`scripts/check-perf-budget.js` 在缺依赖时给出明确报错而不是隐式跳过。
- **只部署被引用的媒体** → 外站直链或 JS 动态拼接的路径会 404。用 `data/media-keep.txt` 兜底，并在构建时把「被跳过但体积 >5MB」的文件列进摘要，便于发现漏网。
- **删 Tailwind 可能导致个别页面样式塌陷**（若有 utility class 藏在生成物里）→ 先在 `--dry-run` 下用 D6 的白名单与 class 扫描对比改动前后渲染截图（`npm run serve` 人工抽查 5 个代表页：首页、文章页、Hub 页、课程笔记、slide 页）。
- **`width`/`height` 注入错误会放大 CLS** → 尺寸来自源图实际像素，且派生档保持同宽高比；脚本对读不出尺寸的文件跳过并告警。

## Migration Plan

1. **测量基线**：记录当前 `public/` 总量、代表页 gzip、图片字节数（脚本 `--report` 输出，入库到 `docs/` 附一节）。
2. **落地顺序**：D3（删外链）→ D2（xref）→ D1（分类树）→ D6（门禁）→ D7（JS 合并）→ D4 层 1 → D5（媒体裁剪）→ D4 层 2/3。前四步每步都能独立构建 + 抽查，且都可在不碰 `media/` 的情况下回滚。
3. **回滚**：D1–D3、D6、D7 均为模板/生成器改动，`git revert` 即可；D4 层 1 需从 `raw/media-originals/` 恢复（脚本提供 `--restore`）；D5 只需改回 `copyDir` 全量。
4. **发布**：走仓库既有 Git 交付流程（commit → push → Actions 构建并部署），不使用 rsync/scp。
