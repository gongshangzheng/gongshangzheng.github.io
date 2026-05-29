# Static HTML Blog Generator — Site Development Guide

纯 HTML/CSS/JS 静态博客生成器。无框架运行时，构建脚本用 Node.js 把 Markdown 和预渲染 HTML 编译成 GitHub Pages 站点。

---

## 强制规则

1. **每次修改 lib/ 或 src/ 后必须跑测试**：`node tests/run.js`，117 tests 全绿才能继续
2. **修改行为必须同步更新测试**：改了 lib/ 里的函数行为，对应 tests/ 里的断言必须一起改，不许留红灯
3. **不许留 debug 脚本**：调试完删除临时脚本，不要 commit `debug-*.js`
4. **构建验证**：改完后跑 `node build.js` 确认无报错，build.js 自带 pre-build 测试门禁

---

## 架构

```
build.js              # 入口：tests → clean → copy → collect → build
lib/
  config.js           # CONFIG, PATHS, RECENT_COUNT（21 行）
  parser.js           # parseFrontmatter (YAML/TOML), parseListField, render（133 行）
  generator.js        # buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch, buildIndex 等（632 行）
  toc.js              # processHeadings, buildTocHtml, buildTocSidebar, buildTocTree（191 行）
  replace.js          # processBody (wiki/arxiv/github links), processShortcodes（439 行）
  plot-assets.js      # buildPlotAssets, injectPlotAssets — functionplot/jsxgraph 资产注入（23 行）
  shortcodes/
    plots.js          # functionplot / jsxgraph shortcode 处理（178 行）
  utils.js            # copyDir, walkDir, writePublic（44 行）
src/
  templates/
    _base.html        # <base href>, Tailwind CDN, Prism.js, 字体, CSS
    _header.html      # 导航栏 + 移动端 TOC drawer + 搜索框
    _footer.html      # 页脚 + back-to-top
  assets/
    css/
      modules/        # 全站样式模块源文件；构建时自动合并为 public/assets/css/hugo-theme.css
      plots.css       # functionplot / jsxgraph 样式
    js/
      dark-mode.js    # 主题切换 + TOC + hamburger + Prism + 搜索下拉（19 KB）
      functionplot-runtime.js  # functionplot 运行时
      jsxgraph-runtime.js      # JSXGraph 运行时
  pages/              # 291 个源文件（288 .html + 3 .md）
public/               # 构建输出（git deploy 目标，CI 自动生成）
tests/
  run.js              # 测试运行器（当前 117 tests 全绿）
  parser.test.js      # 28 tests — parseFrontmatter, parseListField
  generator.test.js   # 57 tests — extractFirstDiv, buildArticles, buildFooter 等
  toc.test.js         # 27 tests — processHeadings, buildTocHtml, slugify
  replace.test.js     # processShortcodes + processBody 联合测试（自运行式）
  plot-assets.test.js # 2 tests — plot 资产注入
```

---

## 构建流程

```bash
node build.js          # 完整构建（自动先跑测试）
node tests/run.js      # 仅跑测试
FORCE_BUILD=1 node build.js  # 跳过测试强制构建（仅紧急用）
```

**build.js 流程**：
1. `runTests()` — 117 tests 门禁
2. `rm public/` — 清理旧构建
3. `copyDir(assets)` — 复制 CSS/JS/图片到 public/assets/
4. `copyDir(media)` — 复制 PDF/PPT/音频/视频到 public/media/
5. `copyDir(media → audio/)` — 兼容旧路径 `/audio/*.mp3`
6. `collectPosts()` — 遍历 `src/pages/` 收集所有文章元数据
7. `buildArticles()` — 为每篇文章生成完整 HTML（frontmatter → hero → body → TOC → meta → footer → sidebar）
8. `buildPostsPage()` — 生成 posts.html 列表页
9. `buildTaxonomyPages()` — 生成 tags/、categories/（含 subcategory）索引页
10. `buildSearch()` — 生成 `search-index.json`（客户端搜索用）
11. `buildIndex()` — 生成 `post-index.json`（slug → title 映射）

---

## Generator 核心函数（lib/generator.js）

| 函数 | 用途 |
|------|------|
| `renderPostList(posts)` | 渲染文章卡片列表 HTML |
| `loadTemplate(templatesDir, name)` | 加载 src/templates/ 模板 |
| `processIncludes(content, templatesDir)` | 处理模板 include |
| `assemblePage(templatesDir, contentHtml, context)` | 组装完整页面（header + content + footer） |
| `buildHero(fm)` | 根据 frontmatter 构建 hero 区域 |
| `processBody(bodyHtml)` | 注入 fade-in class |
| `estimateReadingTime(html)` | 估算阅读时长 |
| `transformLatex(bodyHtml)` | LaTeX 公式预处理 |
| `transformMarkdownTables(bodyHtml)` | Markdown 表格转 HTML |
| `extractFirstDiv(html, className)` | 提取指定 class 的首个 div（如 `.stats`） |
| `formatDateTime(val)` | 日期格式化 |
| `taxonomySlug(name)` | 分类/标签 slug 化 |
| `categoryUrl(category)` | 分类 URL 生成 |
| `subcategoryUrl(category, subcategory)` | 子分类 URL 生成 |
| `buildCategoryBreadcrumb(cats, subcat)` | 分类面包屑导航 |
| `buildArticleMeta(fm, bodyHtml)` | 文章元信息栏（标签、日期、阅读时长） |
| `buildPdfJsScript()` | PDF.js 渲染脚本 |
| `buildArticleFooter(fm)` | 文章底部 footer（分类面包屑、相邻文章导航） |
| `buildArticles(paths, allPosts, buildContext, recentCount)` | 批量构建所有文章页 |
| `buildPostsPage(paths, allPosts, buildContext)` | 构建文章列表页 |
| `buildTaxonomyPages(paths, allPosts, buildContext)` | 构建 tags + categories 索引页 |
| `buildSearch(paths, allPosts)` | 生成 search-index.json |
| `buildIndex(paths, allPosts)` | 生成 post-index.json |

---

## 源文件类型

| 扩展名 | 处理方式 |
|--------|---------|
| `.md`  | marked.parse → processShortcodes → processBody |
| `.html`| 原样透传 → processShortcodes → processBody |

两种文件共享后续管线：fade-in 注入 → processHeadings → extractFirstDiv → 布局组装。

---

## Shortcode 系统

`processShortcodes()` 在 `lib/replace.js` 中实现，`lib/shortcodes/plots.js` 处理绘图类 shortcode。

| Shortcode | 语法 | 用途 |
|-----------|------|------|
| `bg` | `{{< bg yellow >}}text{{< /bg >}}` | 彩色背景高亮 |
| `details` | `{{< details summary="标题" >}}内容{{< /details >}}` | 可折叠块 |
| `bilibili` | `{{< bilibili BV1xx411c7 >}}` | B 站视频嵌入 |
| `youtube` | `{{< youtube dQw4w9WgXcQ "标题" >}}` | YouTube 视频嵌入 |
| `video` | `{{< video "url.mp4" >}}` | 本地视频播放器 |
| `docref` | `{{< docref "path.pdf" page=12 title="标题" >}}` | 轻量课件引用卡片 |
| `docpage` | `{{< docpage "path.pdf" page=12 title="标题" >}}` | 沉浸式 PDF 页面渲染 |
| `docpages` | `{{< docpages "path.pdf" pages="2,4-6" title="标题" >}}` | 多页 PDF 渲染 |
| `mermaid` | `{{< mermaid >}}graph TD...{{< /mermaid >}}` | Mermaid 流程图 |
| `functionplot` | `{{< functionplot title="..." height="300" >}}JS{{< /functionplot >}}` | 数学函数图 |
| `jsxgraph` | `{{< jsxgraph title="..." height="300" >}}JS{{< /jsxgraph >}}` | 交互式几何图 |

---

## processBody 替换规则

`processBody()` 在 `lib/replace.js` 中实现，处理以下内联语法：

| 语法 | 替换为 |
|------|--------|
| `==text==` | `<mark>text</mark>` 高亮文字 |
| `[[arxiv 2401.1234]]` | arXiv 论文链接 |
| `[[arxiv 2401.1234 pdf]]` | arXiv PDF 链接 |
| `[[github user/repo]]` | GitHub 仓库链接 |
| `[[google 搜索词]]` | Google 搜索链接 |
| `[[wiki Title]]` | Wikipedia 链接（默认 en） |
| `[[wiki Title.zh]]` | 中文 Wikipedia 链接 |
| `[[wiki Title.en]]` | 英文 Wikipedia 链接 |
| `[[slug\|显示文字]]` | 站内文章链接（xref 解析） |
| `[[slug#anchor]]` | 站内文章锚点链接 |
| `[[D-...]]` | 隐藏元素（display:none） |
| `[[file.png 宽度\|说明]]` | wiki 风格图片 |
| 行首 `·` | 无序列表项 |

---

## Frontmatter

三种格式：

```yaml
# YAML
---
title: "标题"
date: 2025-01-01
tags: [AI, History]
mathjax: true
---
```

```toml
# TOML 单行
+++ title = "标题" date = 2025-01-01 tags = [AI, History] +++

# TOML 多行
+++
title = "标题"
date = 2025-01-01
+++
```

关键字段：title, date, created_at, updated_at, tags, categories, subcategory, description, mathjax, page_style, hero_title, hero_sub, hero_tagline, audio_src, draft, toc, notify。

---

## 布局规则

文章页面（非 index/about）的核心布局逻辑在 `buildArticles` 里：

1. `extractFirstDiv(bodyHtml, 'stats')` — 提取 `.stats` div（年表页面的统计栏）
2. 检查剩余内容是否以 `<div class="wrap">` 开头（hasSourceWrap）
3. **hasSourceWrap=true**：stats 放 wrap 外，meta 和 footer 插入 wrap 内部
4. **hasSourceWrap=false**：stats 放 wrap 外，整个 body+meta+footer 包在新生成的 `.wrap` 里
5. footer（含 `<hr>` + 分类面包屑 + 相邻文章导航）始终在 `.wrap` 内部

---

## 搜索系统

**构建端**：`buildSearch()` 生成 `search-index.json`，包含所有文章的 title, description, created_at, tags, categories, subcategory, url。

**客户端**：`dark-mode.js` 实现搜索下拉框：
- 点击搜索按钮或 `Cmd/Ctrl + K` 打开
- 输入关键词 → 客户端过滤 `search-index.json` → 显示匹配文章
- 支持键盘导航（↑↓ + Enter）

**辅助索引**：`buildIndex()` 生成 `post-index.json`（仅 title + slug，用于站内链接解析）。

---

## 分类体系

当前站点分类统计：

| Category | 文章数 | 主要 Subcategory |
|----------|--------|-----------------|
| AI | 91+ | Visual Tokenizer, Diffusion, Vision Models, LLM, Multimodal, Architecture, Autoregressive, Image Compression, RL, 论文每日摘要 |
| 课程 | 107+ | Math, Programming, DSP, 通信原理, 旋量代数, 概率论, IGA, 认知科学, 计算机系统, 高等数学, 线性代数, 数字信号处理, 论文写作 |
| 编程 | 25+ | Frontend, Tools |
| 历史 | 25+ | Chinese, World, Japanese, Military, Economic, Cultural |
| 方法论 | 11+ | Research, Productivity, Writing, Economics, Philosophy |
| 音乐 | 2+ | Theory, World |
| 杂识 | 14+ | （无子分类） |

---

## 已修复的关键 Bug（回归测试覆盖）

| Bug | 根因 | 修复方式 |
|-----|------|---------|
| 页面内容 3x 重复 | `String.replace('</head>', injectStr)` 中 injectStr 含 `</head>` | 改用 `indexOf + slice` |
| 双层 wrap div | extractFirstDiv 后 body 里残留 wrap | hasSourceWrap 检测 |
| TOML 多行 body 提取为空 | `lines2.slice(bodyIdx+1)` 计算错误 | 改用 `indexOf('+++', ...)` + substring |
| extractFirstDiv 找不到带属性的 div | 搜索 `<div class="stats">` 不匹配 `<div class="stats" id="x">` | 搜索 `class="stats"` 不带 `>`，单独找 `>` |
| article-footer 在 wrap 外 | hasSourceWrap 分支把 footer 追加到 wrap 的 `</div>` 之后 | lastIndexOf('</div>') 定位并插入 |
| MathJax 配置被 CDN 覆盖 | CDN `<script>` 在 `window.MathJax` 配置之前 | 调换顺序：config 先，CDN 后 |
| 亮色模式代码文字看不见 | prism-tomorrow 是暗色主题，亮底浅字 | `html:not(.dark) pre code { color: #24292e !important }` |

---

## 测试约定

- 测试文件在 `tests/*.test.js`，当前 5 个文件 117 tests
- `generator.test.js` 有内联的 extractFirstDiv / parseListField 等函数副本（隔离测试，不依赖 lib/）
- `toc.test.js` 和 `parser.test.js` 直接 require lib/ 模块
- `replace.test.js` 为自运行式（不导出 tests 对象，直接执行断言）
- `plot-assets.test.js` 有 2 个测试
- processHeadings 先处理 `.ch-title` 再处理 `h2-h6`，所以 headings 数组顺序是处理顺序而非文档顺序
- slugify 保留大小写（`Section` 不是 `section`）
- 新增功能必须加对应测试

---

## 主题系统

- CSS 变量驱动：`:root` 定义亮色，`html.dark` 覆盖为暗色
- 默认暗色（`<html class="dark">`），dark-mode.js 读取 localStorage 切换
- Tailwind CDN（darkMode: 'class'），Prism.js tomorrow 主题
- 字体：LXGW Marker Gothic（标题）+ 朱雀仿宋（正文），通过 `<link>` 标签加载

---

## 部署

- GitHub Actions → `gh-pages` 分支自动部署
- 线上地址：https://gongshangzheng.github.io/
- `config.json` 里 `base_url: "/"` 对应根路径 GitHub Pages
- 站点标题："Thus Spoke Zachary"，作者 "Xinyu ZHENG"

### 自动编译上传流程

```
修改文件 → git push origin main → GitHub Actions 触发 → build → deploy to gh-pages
```

**触发条件**：`.github/workflows/deploy.yml`
- `on.push.branches: [main]` —— 每次 push 到 main 自动触发
- `workflow_dispatch` —— 支持手动触发

**工作流步骤**：
1. Checkout 代码
2. Setup Node.js 20
3. `npm install`
4. `npm run build`（含测试门禁）
5. 将 `public/` 推送到 `gh-pages` 分支

**本地验证**（push 前建议执行）：
```bash
node build.js       # 编译 + 测试
npx serve public    # 本地预览
```

**注意**：`public/` 由 CI 自动生成，不要手动修改后提交到 main。改源码 → push → 等 Actions 绿勾 → 线上自动更新。
