# Proposal: 站点加载性能优化

## Why

站点首屏卡顿的主因不是 GitHub Pages 慢，而是构建产物本身背了四份重复成本：每页内联整棵分类树（全站 HTML 450MB 中 366MB 即 81% 是这块重复内容）、一个零使用的 Tailwind 运行时 CDN（333KB 阻塞脚本）、两个已随 Deno Deploy 停服而死掉的字体样式表（404，各 ~1.6s 阻塞），以及最高 1.4 亿像素的单张图片（12.6MB）。这三类问题都可以在构建期彻底消除，不改任何文章内容、不改变站点外观。

`public/` 已达 2.3GB（media 1.7GB），超过 GitHub Pages 1GB 软限制，部署随时可能因体积失败；图片无 `srcset`、1829 个 `<img>` 里只有 2 个带 `width`/`height`，在移动端会触发主线程解码卡顿和大面积 CLS。

## What Changes

**页面固定开销（每页必付）**

- 移除 `cdn.tailwindcss.com` 脚本与 `tailwind.config` 内联配置。全站 856 页对 tailwind utility class 的使用量为 0（已用正则逐 token 核实）。
- 移除 `chinese-fonts-cdn.deno.dev` 两个字体样式表。该域名已停服返回 404，字体从未生效，站点一直在用系统字体兜底。
- Prism 改为按需注入：仅当页面含代码块（`<pre><code class="language-`）时才加载。
- MathJax 改为按需注入：仅当正文实际含数学标记时才加载；当前 635 个加载页里有 160 页完全不含数学。
- 分类树不再内联进每个页面：构建期输出共享的 `assets/data/category-tree.json`，Categories 面板首次展开时按需加载，全站共享一份缓存。
- `window.__POST_INDEX__` 内联索引取消：`xref` 链接在构建期解析成真实 `href`。

**图片**

- **BREAKING**（素材层）：`media/` 中长边 >4000px 的图片就地降采样到长边 ≤4000px；降采样前原图备份到 gitignored 的 `raw/media-originals/`。
- 构建期为正文图片生成 960px / 1600px 两档派生 WebP，页面输出 `srcset` + `sizes`。
- 所有 `<img>` 补 `width`/`height`（从文件读取真实尺寸），首屏 hero 图加 `fetchpriority="high"`，其余保持 `loading="lazy"`。

**运行时与门禁**

- runtime JS 合并为单文件并加 `defer`；主题脚本内联，消除暗色模式闪烁。
- 新增 `scripts/check-perf-budget.js`：校验单页 gzip 体积、第三方域名白名单（禁止 tailwind/fonts CDN 回流）、MathJax/Prism 按需、图片属性完整性，接入 `npm test`。
- 新增 `scripts/optimize-images.js`：幂等执行降采样与派生档位生成，纳入 `npm run` 脚本。

## Capabilities

### New Capabilities

- `site-performance`: 站点交付产物的性能契约——单页体积预算、第三方资源白名单与按需注入规则、分类树的单份共享交付、图片响应式与尺寸标注要求，以及校验这些约束的构建期门禁。

### Modified Capabilities

（无。现有三个 spec 覆盖内容规划与 skill 路径卫生，不涉及交付产物性能。）

## Impact

- `src/templates/_base.html`：head 中第三方资源清理、runtime JS 合并与 `defer`。
- `lib/generators/articles.js`：MathJax 注入条件、Prism 按需、`__POST_INDEX__` 移除、图片属性后处理。
- `lib/toc.js`：`buildCategoryHtml` 改为输出空容器 + 数据源引用，不再序列化整棵树。
- `assets/js/runtime/toc.js`：分类浏览器改为按需 fetch `category-tree.json`。
- `lib/utils.js` / `lib/generator.js`：图片 `srcset`/`sizes`/尺寸注入。
- `build.js`：生成 `category-tree.json`、调用图片管线。
- `media/`（约 1.5GB 图片，含 25 个 >3MB 页面引用的素材）与 `raw/media-originals/`（新增，gitignored）。
- `scripts/optimize-images.js`、`scripts/check-perf-budget.js`、`package.json` scripts、`tests/run.js`。
- 不改动：任何 `src/pages/*.html` 正文、frontmatter、分类体系、URL 结构、视觉设计。
