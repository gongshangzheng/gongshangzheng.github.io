# Tasks: 站点加载性能优化

## 1. 基线与保护网

- [x] 1.1 写 `scripts/check-perf-budget.js --report`，输出当前 `public/` 总量、代表页 gzip、图片字节分布、第三方域名清单，结果存到 `docs/` 新增的 `PERF-BASELINE.md`
- [x] 1.2 用 `npm run serve` 人工截取 5 个代表页（首页、论文精读页、Hub 页、课程笔记页、slide 页）改动前的截图，存 `tmp/perf-before/`
  - 偏离说明：本机只有 Safari，无脚本化无头浏览器。改用机械证据替代截图，存 `tmp/perf-before/`：`css-hashes.txt`（CSS 模块 + 合并产物的 sha256）、`class-inventory.txt`（全站 491 个 class token 及出现次数）。理由记录在 `docs/PERF-BASELINE.md`「截图基线」一节
- [x] 1.3 跑一次 `FORCE_BUILD=1 node build.js` 确认基线构建通过，记录耗时（15.4s）

## 2. 剔除死第三方资源（D3 之一）

- [ ] 2.1 从 `src/templates/_base.html` 删除 `cdn.tailwindcss.com` 脚本与 `tailwind.config` 内联块
- [ ] 2.2 从 `src/templates/_base.html` 删除两个 `chinese-fonts-cdn.deno.dev` 样式表
- [ ] 2.3 全站复查：`grep -c 'cdn.tailwindcss.com\|chinese-fonts-cdn.deno.dev' public/*.html` 结果为 0
- [ ] 2.4 抽查代表页截图与 1.2 对比，确认视觉无变化

## 3. 交叉引用改为构建期解析（D2）

- [ ] 3.1 在 `lib/replace.js` 确认前缀匹配分支始终生效，并把 `postMap` 未命中的情况改为输出构建警告
- [ ] 3.2 从 `lib/generators/articles.js` 删除 `__POST_INDEX__` / `__CURRENT_SLUG__` / `resolveXrefs()` 注入
- [ ] 3.3 校验：任取含 `[[@...]]` 的页面，构建产物 `<a class="xref">` 的 `href` 指向正确 slug，且页面不含 `__POST_INDEX__`

## 4. 分类树外置（D1）

- [ ] 4.1 `build.js` 增加产出 `public/assets/data/category-tree.json`（含全量树 + 当前路径推导所需字段）
- [ ] 4.2 改写 `lib/toc.js:buildCategoryHtml`：输出空 `.category-browser-list`、`data-initial-path`、`data-src`，不再输出 `data-tree` 与服务端 `<ul>`
- [ ] 4.3 增加 `<noscript>` 分类索引回退链接
- [ ] 4.4 改写 `assets/js/runtime/toc.js:initCategoryBrowser`：首次展开时 fetch 树数据，模块内 + `sessionStorage` 双层缓存，客户端计算 active 与折叠状态
- [ ] 4.5 加加载失败兜底渲染（错误提示 + `categories/index.html` 回退链接）
- [ ] 4.6 校验：任一页面 HTML 不含 `data-tree`，且单页 gzip 显著下降；浏览器里点开 Categories 能正常逐级浏览、返回、刷新后保持位置
- [ ] 4.7 校验跨页面导航后再次打开 Categories 不产生第二次网络请求

## 5. Prism 与 MathJax 按需注入（D3 之二）

- [ ] 5.1 从 `_base.html` 移除 Prism 的 CSS 与两个脚本，改为「页面含 `<pre><code class="language-` 才注入」并对注入标签加 `defer`
- [ ] 5.2 把 MathJax 注入条件改为「`mathjax: true` 且正文含数学标记」，注入的 `tex-svg.js` 加 `defer`
- [ ] 5.3 校验：无代码块页面无 Prism 标签；无数学页面无 MathJax 标签；含数学页面公式仍正确排版
- [ ] 5.4 统计注入数量变化（预期 MathJax 从 635 页降到约 475 页，Prism 降到仅含代码块的页面）

## 6. runtime JS 合并与 defer（D7）

- [ ] 6.1 构建期按固定顺序把 `assets/js/runtime/*.js` + `code-tabs.js` + `citation.js` 拼成 `assets/js/runtime.bundle.js`
- [ ] 6.2 `_base.html` 改为单个 `defer` 脚本标签；`theme.js` 的初始主题判定内联进 head 消除闪烁
- [ ] 6.3 校验：搜索、目录、主题切换、代码 tab、引用复制、音乐按钮逐个手测通过
- [ ] 6.4 校验：暗色模式刷新无白闪

## 7. 性能门禁接入测试（D6）

- [ ] 7.1 实现 `scripts/check-perf-budget.js` 的全部断言：页面 gzip 预算、第三方白名单、按需注入、`img` 属性完整性、单图 ≤2MB、`public/` ≤1GB、无 `data-tree`
- [ ] 7.2 产物缺失时 skip 而非 fail；依赖缺失时给明确报错
- [ ] 7.3 挂进 `tests/run.js` 作为一个 suite，`npm test` 默认执行
- [ ] 7.4 故意制造一次超标（临时把某页预算调到 1KB）确认脚本能正确失败并给出可读报告

## 8. 图片降采样（D4 层 1）

- [ ] 8.1 写 `scripts/optimize-images.js --downsample`，默认 dry-run，`--apply` 执行，原图备份到 `raw/media-originals/`，提供 `--restore`
- [ ] 8.2 确认 `raw/media-originals/` 在 `.gitignore` 内
- [ ] 8.3 执行 dry-run，核对受影响文件清单（预期 734 个长边 >4000px）
- [ ] 8.4 用户确认后 `--apply` 执行，记录 `media/` 体积变化
- [ ] 8.5 抽查 8 个最大图片降采样后的清晰度（论文对比图、多面板图优先）

## 9. 媒体按引用部署（D5）

- [ ] 9.1 `build.js` 汇总产物 HTML 中 `src`/`href`/`data-src`/`poster`/`srcset` 的 `media/…` 引用集合
- [ ] 9.2 媒体拷贝改为按引用集合过滤，叠加 `data/media-keep.txt` allowlist
- [ ] 9.3 构建摘要输出「跳过且 >5MB」清单，便于发现漏网
- [ ] 9.4 校验：`public/media` 文件数从 7696 降到约 1800，总量从 1.7GB 降到 300MB 量级
- [ ] 9.5 抽查 PDF 引用页、视频页、docpage 短代码页，确认资源可访问无 404

## 10. 派生档与图片属性注入（D4 层 2/3）

- [ ] 10.1 引入 `sharp` 依赖并锁版本
- [ ] 10.2 实现 `scripts/optimize-images.js --variants`：为被引用且长边 >1600px 的图生成 `.w960.webp` / `.w1600.webp`；按源 `size:mtime` 做增量
- [ ] 10.3 构建期图片后处理：写 `srcset`/`sizes`/`width`/`height`，首屏首图加 `fetchpriority="high"` 并去掉 lazy，其余加 `decoding="async"`
- [ ] 10.4 记录 CI 上 variants 阶段耗时，确认 ≤3 分钟
- [ ] 10.5 校验：922 个 >1600px 引用图都带 ≥2 档 srcset；全站 `img` 都有 width/height
- [ ] 10.6 校验：代表页在窄视口下加载的是 960 档（DevTools 网络面板确认）

## 11. 收尾验证

- [ ] 11.1 `npm test` 全绿，性能门禁通过
- [ ] 11.2 `FORCE_BUILD=1 node build.js` 全量构建通过，产出 `public/` ≤1GB
- [ ] 11.3 复测代表页 gzip 与总体积，与 `docs/PERF-BASELINE.md` 对比，把结果写入同一文件的「优化后」一节
- [ ] 11.4 5 个代表页截图与 1.2 基线逐张对比，确认视觉零回归
- [ ] 11.5 走 Git 交付到 pet 服务器：commit → `git push pet <branch>` → 远程 checkout 并校验 commit
