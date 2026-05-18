# Static HTML Blog Generator

纯 HTML/CSS/JS 静态博客生成器。无框架运行时，构建脚本用 Node.js 把 Markdown 和预渲染 HTML 编译成 GitHub Pages 站点。

## 强制规则

1. **每次修改 lib/ 或 src/ 后必须跑测试**：`node tests/run.js`，80 tests 全绿才能继续
2. **修改行为必须同步更新测试**：改了 lib/ 里的函数行为，对应 tests/ 里的断言必须一起改，不许留红灯
3. **不许留 debug 脚本**：调试完删除临时脚本，不要 commit `debug-*.js`
4. **构建验证**：改完后跑 `node build.js` 确认无报错，build.js 自带 pre-build 测试门禁

## 架构

```
build.js              # 入口：tests → clean → copy → collect → build
lib/
  config.js           # CONFIG, PATHS, RECENT_COUNT
  parser.js           # parseFrontmatter (YAML/TOML), parseListField, render
  generator.js        # buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch
  toc.js              # processHeadings, buildTocHtml, buildTocSidebar
  replace.js          # processBody (wiki/arxiv/github links), processShortcodes
  utils.js            # copyDir, writePublic
src/
  templates/_base.html   # <base href>, Tailwind CDN, Prism.js, 字体, CSS
  templates/_header.html # 导航 + 移动端 TOC drawer
  templates/_footer.html # 页脚 + back-to-top
  assets/css/hugo-theme.css  # 全站样式（CSS 变量驱动双主题）
  assets/js/dark-mode.js     # 主题切换 + TOC + hamburger + Prism
  pages/                  # 118 个源文件（.html 预渲染 + .md Markdown）
public/                  # 构建输出（git deploy 目标）
tests/
  run.js               # 测试运行器
  parser.test.js       # 22 tests
  generator.test.js    # 29 tests
  toc.test.js          # 23 tests（+ 随功能增长的测试）
```

## 构建流程

```bash
node build.js          # 完整构建（自动先跑测试）
node tests/run.js      # 仅跑测试
FORCE_BUILD=1 node build.js  # 跳过测试强制构建（仅紧急用）
```

build.js 流程：tests → rm public/ → copy assets → collect posts → buildArticles → buildPostsPage → buildTaxonomyPages → buildSearch

## 源文件类型

| 扩展名 | 处理方式 |
|--------|---------|
| `.md`  | marked.parse → processShortcodes → applyReplacements |
| `.html`| 原样透传（Hugo 迁移过来的预渲染 HTML） |

两种文件共享同一个后续管线：fade-in 注入 → processHeadings → extractFirstDiv → 布局组装。

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

关键字段：title, date, tags, categories, mathjax, page_style, hero_title, hero_sub, hero_tagline, audio_src, draft, toc。

## 布局规则

文章页面（非 index/about）的核心布局逻辑在 `buildArticles` 里：

1. `extractFirstDiv(bodyHtml, 'stats')` — 提取 `.stats` div（年表页面的统计栏）
2. 检查剩余内容是否以 `<div class="wrap">` 开头（hasSourceWrap）
3. **hasSourceWrap=true**：stats 放 wrap 外，meta 和 footer 插入 wrap 内部
4. **hasSourceWrap=false**：stats 放 wrap 外，整个 body+meta+footer 包在新生成的 `.wrap` 里
5. footer（含 `<hr>`）始终在 `.wrap` 内部

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

## 测试约定

- 测试文件在 `tests/*.test.js`，每个文件 `module.exports = { tests, name }`
- `generator.test.js` 有内联的 extractFirstDiv / parseListField 等函数副本（隔离测试，不依赖 lib/）
- `toc.test.js` 和 `parser.test.js` 直接 require lib/ 模块
- processHeadings 先处理 `.ch-title` 再处理 `h2-h6`，所以 headings 数组顺序是处理顺序而非文档顺序
- slugify 保留大小写（`Section` 不是 `section`）
- 新增功能必须加对应测试

## 主题系统

- CSS 变量驱动：`:root` 定义亮色，`html.dark` 覆盖为暗色
- 默认暗色（`<html class="dark">`），dark-mode.js 读取 localStorage 切换
- Tailwind CDN（darkMode: 'class'），Prism.js tomorrow 主题
- 字体：LXGW Marker Gothic（标题）+ 朱雀仿宋（正文），通过 `<link>` 标签加载

## 部署

- GitHub Actions → `gh-pages` 分支自动部署
- 线上地址：https://gongshangzheng.github.io/
- `config.json` 里 `base_url: "/"` 对应根路径 GitHub Pages

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
