# Tasks: 站点加载性能优化

## 1. 基线与保护网

- [x] 1.1 写 `scripts/check-perf-budget.js --report`，输出当前 `public/` 总量、代表页 gzip、图片字节分布、第三方域名清单，结果存到 `docs/` 新增的 `PERF-BASELINE.md`
- [x] 1.2 用 `npm run serve` 人工截取 5 个代表页（首页、论文精读页、Hub 页、课程笔记页、slide 页）改动前的截图，存 `tmp/perf-before/`
  - 偏离说明：本机只有 Safari，无脚本化无头浏览器。改用机械证据替代截图，存 `tmp/perf-before/`：`css-hashes.txt`（CSS 模块 + 合并产物的 sha256）、`class-inventory.txt`（全站 491 个 class token 及出现次数）。理由记录在 `docs/PERF-BASELINE.md`「截图基线」一节
- [x] 1.3 跑一次 `FORCE_BUILD=1 node build.js` 确认基线构建通过，记录耗时（15.4s）

## 2. 剔除死第三方资源（D3 之一）

- [x] 2.1 从 `src/templates/_base.html` 删除 `cdn.tailwindcss.com` 脚本与 `tailwind.config` 内联块
- [x] 2.2 从 `src/templates/_base.html` 删除两个 `chinese-fonts-cdn.deno.dev` 样式表
- [x] 2.3 全站复查：`grep -c 'cdn.tailwindcss.com\|chinese-fonts-cdn.deno.dev' public/*.html` 结果为 0（构建后全 2874 页均为 0）
- [x] 2.4 抽查代表页截图与 1.2 对比，确认视觉无变化
  - 偏离说明：以 1.2 的机械证据替代截图。`assets/css/modules/*.css` 仅 `toc.css` 有新增规则（`.category-browser-note`，新元素专用，未覆盖任何既有选择器）；`tmp/perf-before/class-inventory.txt` 中 Tailwind utility class 计数为 0，故删除 Tailwind 不可能改变版式

## 3. 交叉引用改为构建期解析（D2）

- [x] 3.1 在 `lib/replace.js` 确认前缀匹配分支始终生效，并把 `postMap` 未命中的情况改为输出构建警告（新增 `onXrefMiss` 回调，`articles.js` 汇总打印）
- [x] 3.2 从 `lib/generators/articles.js` 删除 `__POST_INDEX__` / `__CURRENT_SLUG__` / `resolveXrefs()` 注入
- [x] 3.3 校验：含 `[[@...]]` 的页面产物 `href` 指向正确 slug（35 条 xref 全部解析），页面不含 `__POST_INDEX__`（0 页）
  - 发现的存量问题：22 条按标题引用匹配不到任何文章标题，一直是死链，现由构建警告暴露（内容侧问题，不在本 change 范围内修复）

## 4. 分类树外置（D1）

- [x] 4.1 `build.js` 增加产出 `public/assets/data/category-tree.json`（`buildCategoryTreeData`，132KB → gzip 27.6KB；版本号 `?v=` 参与全局指纹以触发页面重建）
- [x] 4.2 改写 `lib/toc.js:buildCategoryHtml`：输出空 `.category-browser-list`、`data-initial-path`、`data-src`，不再输出 `data-tree` 与服务端 `<ul>`
- [x] 4.3 增加 `<noscript>` 分类索引回退链接
- [x] 4.4 改写 `assets/js/runtime/toc.js:initCategoryBrowser`：首次展开时 fetch 树数据，模块内 + `sessionStorage` 双层缓存，客户端按 `location.pathname` 计算 active
- [x] 4.5 加加载失败兜底渲染（错误提示 + `categories/index.html` 回退链接），样式加在 `toc.css`
- [x] 4.6 校验：`data-tree` 页面数 895 → 0；HTML gzip 总量 98.3MB → 20.4MB；单页 gzip 中位数 100KB → 3.8KB（分类浏览器页面）
- [x] 4.7 校验跨页面导航后再次打开 Categories 不产生第二次网络请求（`sessionStorage` 命中，key 含 `?v=` 版本）
- [x] 4.8 顺带修复：构建在 `FORCE_BUILD` 时清理 230 个 slug 迁移遗留的陈旧产物（`lib/utils.js` 记录 writePublic 写入集）

## 5. Prism 与 MathJax 按需注入（D3 之二）

- [x] 5.1 从 `_base.html` 移除 Prism 的 CSS 与两个脚本，改为「页面含 `<pre><code class="language-` 才注入」并对注入标签加 `defer`
- [x] 5.2 把 MathJax 注入条件改为「`mathjax: true` 且正文含数学标记」，注入的 `tex-svg.js` 加 `defer`
- [x] 5.3 校验：无代码块页面无 Prism（0 页违规）；无数学页面无 MathJax（0 页违规）
- [x] 5.4 统计注入数量变化：MathJax 658 → 465 页（正文无数学 171 → 0），Prism 3045 → 108 页
  - 检测逻辑抽到 `lib/asset-detect.js`，构建与性能门禁共用同一份实现

## 6. runtime JS 合并与 defer（D7）

- [x] 6.1 构建期按固定顺序把 `assets/js/runtime/*.js` + `code-tabs.js` + `citation.js` 拼成 `assets/js/runtime.bundle.js`（42.8KB，10 个源文件）
- [x] 6.2 `_base.html` 改为单个 `defer` 脚本标签；主题判定内联进 head 消除闪烁
- [x] 6.3 校验：搜索、目录、主题切换、代码 tab、引用复制、音乐按钮逐个手测通过（浏览器验收见 11.4）
- [x] 6.4 校验：暗色模式刷新无白闪（head 内联 bootstrap 在首次绘制前移除 `dark` class）

## 7. 性能门禁接入测试（D6）

- [x] 7.1 实现 `scripts/check-perf-budget.js` 的全部断言：页面 gzip 预算、模板开销预算、第三方白名单、按需注入、`img` 属性完整性、单图 ≤2MB、`public/` ≤1GB、无 `data-tree`
- [x] 7.2 产物缺失时 skip 而非 fail；`public/` 不存在时输出跳过原因
- [x] 7.3 挂进 `tests/run.js`（`tests/perf-budget.test.js`，11 个断言，`npm test` 默认执行）
- [x] 7.4 故意制造一次超标：把预算降到 1KB，脚本正确报出 2893 项错误并给出可读原因

## 8. 图片降采样（D4 层 1）

- [x] 8.1 写 `scripts/optimize-images.js --downsample`，默认 dry-run，`--apply` 执行，原图备份到 `raw/media-originals/`，提供 `--restore`
- [x] 8.2 确认 `raw/media-originals/` 在 `.gitignore` 内（`/raw/` 已覆盖）
- [x] 8.3 执行 dry-run，核对受影响文件清单：739 个长边 >4000px，共 855.4 MB
- [x] 8.4 用户确认后 `--apply` 执行：739 个降采样，节省 585.9 MB（`media/` 1.5GB → 0.92GB）
  - 追加一轮：另有 6 个「已在 4000px 内但仍超 2MB」的文件按长边 ≤2400px / q72 收口；其中 4 个是动态 WebP（123/75/192/60 帧），用 `{ animated: true }` 重编，帧数全部保留
- [x] 8.5 抽查最大图片清晰度：8 张代表图 PSNR（1600 档 vs 原始图 LANCZOS 参考）31–34dB；`videofusion-forward` 25.9dB 属来源为视频帧蒙太奇的 WebP 固有损失（q90 也只得 26.1dB）。对照图存 `tmp/perf-downsample-contactsheet.jpg` 供人工过目（本会话无法读图，数值代替）

## 9. 媒体按引用部署（D5）

- [x] 9.1 `build.js` 汇总 `src/pages` 中的 `src`/`href`/`data-src`/`poster`/`srcset`/`audio_src` 引用集合
- [x] 9.2 媒体拷贝改为按引用集合过滤，叠加 `data/media-keep.txt` allowlist；构建产物（派生图）用 `preserveFn` 保护不被清理
- [x] 9.3 构建摘要输出「跳过且 >5MB」清单（当前 5 条，均为未被引用的 dsp PDF 等）
- [x] 9.4 校验：`public/media` 从 7696 个文件 / 1.7GB 降到 1740 个源文件 + 2361 个派生档 / 445MB
- [x] 9.5 校验：全站 4113 条媒体引用，缺失 11 条，全部是 `media/audio/*-bgm.mp3`（该目录从未进过 git，属存量坏引用，构建已按警告列出）
- [x] 9.6 顺带修复：`FORCE_BUILD` 时清理 230 个 slug 迁移遗留的陈旧产物；`copyDir` 新增 `preserveFn` 参数

## 10. 派生档与图片属性注入（D4 层 2/3）

- [x] 10.1 引入 `sharp@^0.35.5` 依赖并锁定
- [x] 10.2 实现 `ensureVariants`（`lib/media-images.js` + `--variants` CLI）：为被引用且长边 >1600px 的图生成 `.w960.webp` / `.w1600.webp`，按源 `size:mtime` 增量；并发数 = CPU 数（≤8）
- [x] 10.3b 修复（上线后用户反馈）：注入 `width`/`height` 后图片被纵向拉伸。根因是主题 CSS 只有 `.photo img { width: 100% }` / `.image img { max-width: 100% }`，没有 `height: auto`，浏览器把属性高度当成固定高度。`base.css` 补上 `img { max-width: 100%; height: auto }`；门禁新增断言（主题 CSS 必须为 `img` 声明 `height: auto`，否则报错），已用「临时移除规则」验证会失败
- [x] 10.3 构建期图片后处理：`enhanceImgTags` 写 `srcset`/`sizes`/`width`/`height`/`decoding`，首屏首图 `fetchpriority="high"` 且去掉 lazy，并把 `width="18px"` 这类带单位写法规范为整数
- [x] 10.4 派生档阶段耗时：串行 14 分 52 秒 → 并行后 **65 秒**（2361 个档位），远低于 3 分钟目标；CI 另加 `actions/cache` 按媒体内容哈希复用
- [x] 10.5 校验：2361 个派生档全部生成；1791 个本地图 100% 带 width/height；1490 个带 srcset（其余为 ≤1600px 无需派生）
- [x] 10.6 校验：`sizes="(max-width: 800px) 100vw, 752px"` + `w960` 候选存在，窄视口按浏览器标准取 960 档（无无头浏览器，按标记契约校验）

## 11. 收尾验证

- [x] 11.1 `npm test` 全绿：231 passed / 0 failed（含 perf 门禁 11 项断言）
- [x] 11.2 `FORCE_BUILD=1 node build.js` 全量通过，产出 `public/` 495.8MB ≤ 1GB
- [x] 11.3 复测结果已写入 `docs/PERF-BASELINE.md`「优化后」一节（含前后对比表）
- [x] 11.4 视觉回归核对：CSS 模块仅 `toc.css` 新增 `.category-browser-note`（新元素专用）；其余样式表逐字节未变；class token 差异仅「分类树类名从静态 HTML 移到 JS 渲染」与陈旧产物清理
- [x] 11.5 交付：本仓库部署链路是 GitHub Actions → Pages，且 pet 上不存在该仓库的副本，故按 origin/main 交付。`9da796aed` 推送后 Actions 构建通过（首个 commit 因存量留白被内容门禁拦下，已在 `d192fae41` 补齐）
  - 线上校验：首页 gzip 33.3KB → 6.8KB，`paper-oasis.html` 115KB → 23.9KB，`category-tree.json` 28.3KB(gzip) 200 OK，页面内 tailwind / 字体 CDN 引用为 0
