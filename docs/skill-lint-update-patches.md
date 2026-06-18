# Skill update patches for lint + media/assets path migration

## html-blog/SKILL.md

### 1) Replace flow line

Old:
```text
复制图片 → 放置 PDF/PPT 到 `src/media/` → node build.js 验证 → git push
```

New:
```text
复制图片 → 放置 PDF/PPT 到 `media/` → `node lib/lint-html.js src/pages/<slug>.html` 做源文件语法检查 → `node build.js` 验证 → git push
```

### 2) Insert new section before `### 0.1 创建文章`

```md
### 0.0 源文件语法检查（build 前必做）

在运行 `node build.js` 之前，先对源文件做一次 **source-aware lint**：

```bash
cd ~/gongshangzheng.github.io
node lib/lint-html.js src/pages/<slug>.html
```

这个 linter **不只是检查 HTML**，而是同时检查三层语法：

1. **YAML/TOML frontmatter**：分隔符是否闭合、YAML 行是否缺少冒号、是否能被现有解析器正常解析
2. **HTML 容器结构**：重点检查 `<div>...</div>` 是否正确闭合，避免 block leak / 样式泄漏
3. **项目自定义 shortcode**：如 `{{< details >}} ... {{< /details >}}`、`{{< mermaid >}}...{{< /mermaid >}}`、`{{< jsxgraph >}}...{{< /jsxgraph >}}`、`{{< bg ... >}}...{{< /bg >}}`、`{{< functionplot >}}...{{< /functionplot >}}` 是否正确配对；`docpage/docpages/docref/pdf/bilibili` 等单行 shortcode 会按自闭合处理

**什么时候必须跑 lint：**
- 手动编辑了 frontmatter
- 新增/删除 `div` 容器（`def-box`、`example-box`、`callout`、`admonition`、`info-box`、`table-wrap` 等）
- 批量插入或删除课件截图、例题框、提示框后
- 新增了 `details / mermaid / jsxgraph / bg / functionplot` 这类成对 shortcode
- 出现“样式泄漏”“后文突然套进上一个框”“TOC/布局异常”等症状时

**约定顺序：** 先 `lint-html`，再 `node build.js`。`build.js` 负责构建结果验证；`lint-html` 负责源文件语法面验证，两者不能互相替代。
```

### 3) Replace CSS path line

Old:
```text
博客 CSS 已拆分为模块，存放在 `src/assets/css/modules/`。构建时 `build.js` 根据清单自动合并。
```

New:
```text
博客 CSS 已拆分为模块，存放在 `assets/css/modules/`。构建时 `build.js` 根据清单自动合并。
```

## course-notes/SKILL.md

### 1) Replace output-mode line

Old:
```text
| "PPT/PDF 做笔记 → 引用课件页" | 内容分析走 docling；博客中只是标注出处用 docref，需要展示课件页才用 docpage/docpages（PDF 放 src/media/） |
```

New:
```text
| "PPT/PDF 做笔记 → 引用课件页" | 内容分析走 docling；博客中只是标注出处用 docref，需要展示课件页才用 docpage/docpages（PDF 放 `media/pdf/课程名/`） |
```

### 2) Replace big-file handling paths

Old:
```text
- 只是引用出处或页码 → `docref` shortcode + `src/media/pdf/课程名/`
- 需要交互式课件页预览 → `docpage`/`docpages` shortcode + `src/media/pdf/课程名/`
- 需要静态截图/裁剪标注 → `pdftoppm -png -r 300` 导出高质量 PNG 到 `src/assets/media/images/` + `<div class="photo"><img>`
```

New:
```text
- 只是引用出处或页码 → `docref` shortcode + `media/pdf/课程名/`
- 需要交互式课件页预览 → `docpage`/`docpages` shortcode + `media/pdf/课程名/`
- 需要静态截图/裁剪标注 → `pdftoppm -png -r 300` 导出高质量 PNG 到 `media/images/<slug>/` + `<div class="photo"><img>`
```

### 3) Add lint requirement near phase/gate text

Suggested insert near Phase 4 / review rules:

```md
### 源文件语法检查（新增）

课程笔记在进入 `node build.js` 之前，必须先运行：

```bash
cd ~/gongshangzheng.github.io
node lib/lint-html.js src/pages/<slug>.html
```

该检查覆盖：
1. frontmatter（YAML/TOML）
2. HTML 容器块结构（避免 block leak）
3. 项目自定义 shortcode 配对（details / mermaid / jsxgraph / bg / functionplot 等）

**触发时机：**
- 手改 frontmatter 后
- 增删 `def-box` / `example-box` / `callout` / `admonition` / `info-box` / `table-wrap` 后
- 插入或删除课件截图、习题框、提示框后
- 新增 `details` / `mermaid` / `jsxgraph` / `bg` / `functionplot` 这类成对 shortcode 后

顺序固定：**先 lint，再 build**。
```
