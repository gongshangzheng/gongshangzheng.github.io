---
name: html-blog
description: |
  管理并发布静态 HTML 博客文章到 ~/gongshangzheng.github.io。
  本 skill 是所有博客 HTML 生成的唯一入口，负责创建、frontmatter 规范和发布流程。
  上游 skill（academic-research、deep-research、historical-narrative、read-article）通过本 skill 发布文章。
  MANDATORY TRIGGERS: 发布到博客, 写博客, 同步到博客, 更新博客, blog, 博客, post article, write blog, publish blog, 生成 HTML, 发布 HTML
version: 3.1.0
category: html-generation
tags: [html, blog, publish, mathjax]
documentation: |
  本文档是博客 HTML 写作规范的唯一事实来源（Single Source of Truth）。
  详细语法规范已拆分为独立 skill，按需读取：
  - blog-syntax skill（~/gongshangzheng.github.io/.agents/skills/blog-syntax/）— 包含全部 HTML 组件、数学公式、引用/Shortcode/Wiki 链接、图片、课件、Mermaid、JSXGraph、发布流程和样式参考；站内文章交叉引用优先使用标题语法 `[[@标题]]`，路径/锚点跳转使用 `[[path#anchor]]`
  - blog-categories skill（~/gongshangzheng.github.io/.agents/skills/blog-categories/）— 分类映射表与判断规则
  - templates/course-note-section-template.html — 课程笔记 HTML 片段模板，由 course-notes 等上游技能调用
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# HTML Blog — 写作与发布指南

> **所有生成 HTML 的 skill** 必须通过本 skill 发布文章，不得自行维护模板或组件规范。
> 写作模板由本 skill 统一维护：`templates/article-template.html`（普通文章）、`templates/hub-template.html`（中枢页）、`templates/course-note-section-template.html`（课程笔记正文片段）。上游的 course-notes 只产出课程内容结构，最终 HTML 页面必须通过本 skill 生成。

---

## 0. 写作流程

```
上游 skill 产出内容
      ↓
capture.js 创建骨架（本 skill 执行）
      ↓
Phase 1: Frontmatter（填写 title / description / categories / tags / hero_* / papers / repos）
      ↓
Phase 2: 正文（读取 blog-syntax skill 的 references/ 按需使用组件语法；图片必须按 html-components.md 的「图片」章节用 <div class="photo"> 包裹，禁止裸 <img>）
      ↓
Phase 3: 引用与参考来源配置（必做，不可跳过）
  ├─ 正文中用 #key# 标注所有重要事实性句子
  └─ 底部 .sources 列表中每条文献加 data-cite-key（slugify 后的 key）
      ↓
复制图片 → 放置 PDF/PPT 到 `media/`（博客仓库根目录） → node build.js 验证 → git push
      ↓
检查 frontmatter 中 `notify` 字段
  ├─ `notify: true` → 发送邮件通知
  └─ 否则 → 跳过
```

**质量闸门**：发布前必须依次验证以下项（逐项检查，不可跳过）：
1. ✅ `#key#` 引用语法已用于所有事实性陈述（非纯文本 `(Author, Year)`）
2. ✅ 底部 `.sources` 列表每条有 `data-cite-key` 属性
3. ✅ 构建后编译产物中每个 `<cite>` 有对应的 `data-cite-key` 在 `.sources li` 中存在
4. ✅ 源码中没有 `<p>$$...$$</p>` 或 `<p>\[...\]</p>`；display math 必须独占一行、不被 `<p>` 包裹
5. ✅ 正文小节标题使用 `<h3 class="section-title">` / `<h4 class="ch-section">`，禁止裸 `<h3>` / `<h4>`（info-box / def-box / theorem-box / example-box / sources 内部标题除外）
6. ✅ 运行 `node lib/lint-html.js <page.html>` 检查 HTML 结构（闭合标签、嵌套错误、未识别的 shortcode 等）
7. ✅ 图片严格遵循 html-components.md 的「图片」语法：裸 `<img>` 必须包裹在 `<div class="photo">` 中，源文件使用 WebP 格式并存放在 `media/images/<slug>/` 下

> ⚠️ **常见翻车点**：`cp-ch05-baseband.html` 曾因 `<p>$$...$$</p>`、裸 `h3/h4` 小节标题、`.sources li` 缺 `data-cite-key` 导致页面渲染异常与引用联动失效。以上 7 项闸门即为此类问题的强制防线。

---

## 0.1 创建文章

使用 `capture.js` 脚本创建新文章：

```bash
# 普通文章
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug>

# 中枢页（Hub page）
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --hub

# 课程笔记页（默认带课程骨架）
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --course

# 算法题解（预填编程/算法分类 + mathjax）
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --algorithm

# 需要发布后发送邮件通知
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --notify

# 中枢页 + 邮件通知
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --hub --notify
```

**capture.js 行为：**
- 默认读取 `templates/article-template.html`；`--hub` 切换为 `templates/hub-template.html`；`--course` 切换为 `templates/course-note-section-template.html`；`--algorithm` 切换为 `templates/algorithm-template.html`
- `--course` 会预填 `aliases: ["categories/课程/<课程名>"]`、`mathjax: true` 和课程页 hero 字段占位；若上游已确定这是数学型课程（如线性代数 / 概率论 / 高等数学 / 群论 / 综合数学枢纽），则发布前必须改写为 `aliases: ["categories/数学/<课程名>"]`
- `--algorithm` 会预填 `aliases: ["categories/编程/算法"]`、`mathjax: true` 和算法题 hero 字段占位
- 自动生成 `created_at` / `updated_at`，格式 `YYYY-MM-DDTHH:mm:ss`（精确到秒）
- `--notify` 参数在 frontmatter 中写入 `notify: true`，由 html-blog 发布流程统一控制邮件发送
- `papers` 和 `repos` 字段默认写入空列表 `[]`，由 agent 后续填充
- 输出：`~/gongshangzheng.github.io/src/pages/<slug>.html`

**时间戳维护规则：**
- `created_at`：capture.js 首次写入后**禁止修改**
- `updated_at`：每次编辑后**必须手动更新**为当前时间

> ⚠️ build.js **不会**自动更新 `updated_at`。排序使用 `created_at`。

---

## 1. Frontmatter 规范

### 1.1 字段表

| 字段 | 必填 | 约束 |
|------|------|------|
| `title` | ✅ | 页面标题 |
| `description` | ✅ | 一句话 meta description |
| `created_at` | ✅ | `YYYY-MM-DDTHH:mm:ss`，精确到秒 |
| `updated_at` | ✅ | `YYYY-MM-DDTHH:mm:ss`，精确到秒 |
| `categories` | ❌ | 从 §1.4 选取，只能填 **1 个** |
| `subcategory` | ❌ | 从 §1.4 选取，单值字符串 |
| `sub_id` | ❌（**系列文章必填**） | 整数，用于 index 页面排序。详细赋值规则见 **blog-aliases** skill |
| `tags` | ❌ | `["tag1", "tag2", ...]`，3-5 个 |
| `aliases` | ❌ | `["别名1", "别名2"]`，用于搜索和 taxonomy 索引页替换。详细规范见 **blog-aliases** skill |
| `pin` | ❌ | `true` 时在首页 Pinned 置顶区显示；默认不置顶 |
| `papers` | ❌ | `["https://arxiv.org/abs/xxxx", ...]`，论文链接列表，自动渲染到文章头部和底部。arXiv 链接自动格式化为 `arXiv:xxxx.xxxxx` |
| `repos` | ❌ | `["https://github.com/user/repo", ...]`，代码仓库链接列表，自动渲染到文章头部和底部。GitHub 链接自动格式化为 `user/repo` |
| `notify` | ❌ | `true` 时发布后自动发邮件通知，由 capture.js `--notify` 参数写入 |
| `mathjax` | ⚠️ | 含公式必须 `true` |
| `css_modules` | ❌ | `["module1", ...]`，按需加载的可选 CSS 模块（见 §1.6） |
| `hero_title` | ❌ | Hero 大标题 |
| `hero_sub` | ❌ | Hero 副标题 |
| `hero_tagline` | ❌ | Hero 标语 |

### 1.2 模板

```yaml
---
title: "<标题>"
description: "<一句话描述>"
created_at: <YYYY-MM-DDTHH:mm:ss>
updated_at: <YYYY-MM-DDTHH:mm:ss>
tags: [<领域>, <方法>]
aliases: ["categories/AI/视觉分词器"]
sub_id: 10
papers: ["https://arxiv.org/abs/xxxx.xxxxx"]
repos: ["https://github.com/user/repo"]
pin: false
mathjax: true
hero_title: "<标题>"
hero_sub: "<会议/年份 · 领域>"
hero_tagline: "<核心贡献一句话>"
---
```

### 1.3 Hub page（枢纽页/中枢页）规范

Hub 页是一个专题的研究索引/入口页，包含多个子话题的入口卡片、研究资源索引和研究路径建议。

> **创建 Hub 页时必须使用 `--hub` 参数**：`node capture.js <slug> --hub`
> 这会使用 `templates/hub-template.html` 模板，自动包含 hub 专用 CSS 和标准结构。

**何时创建 Hub 页**：当一个专题下有 5 篇以上相关文章，且这些文章需要一条统一的研究线索组织起来时。

**Hub 页 frontmatter 规范**：

```yaml
---
title: "专题标题"
description: "一句话描述"
created_at: YYYY-MM-DDTHH:mm:ss
updated_at: YYYY-MM-DDTHH:mm:ss
tags: []
aliases: ["categories/AI/视觉分词器"] or ["categories/历史/中国史"]
hero_title: "Hub 页标题"
hero_sub: "副标题"
hero_tagline: "标语"
---
```

**Hub 页核心组件**：

| 组件 | CSS 类 | 用途 |
|------|--------|------|
| 三标签主视图 | `.code-tabs.hub-tabs` | 同一区段切换展示「列表 / 卡片 / 图谱」 |
| 文章图谱 | `{{< post-graph "taxonomy" >}}` | 展示当前专题文章关系，通常放在第三个 tab |
| 时代/主题卡片 | `.period-card` + `.period-grid` | 人工组织的专题框架，每个卡片含年份、标题、摘要、关键问题、话题列表 |
| 可排序文章列表 | `{{< sortable-list "taxonomy" >}}` | 完整文章清单，通常放在第一个 tab |
| 区域标题 | `.hub-section` + `h3.section-title` | 大区段标题（知识地图、研究资源、路径建议等），对应 TOC level 3 |
| 资源表格 | 标准 `<table>` | 研究资源索引 |
| 信息框 | `.info-box` | 补充资源说明 |
| 路径卡片 | `.period-card`（复用于路径块） | 研究路径建议 |
| 待办表格 | 标准 `<table>` | 待研究专题列表 |

**Hub 页结构模式**：

```
引论（说明专题范围和组织逻辑）
↕
知识地图（.hub-section > .code-tabs.hub-tabs）
  ├─ 列表：sortable-list
  ├─ 卡片：period-grid / period-card
  └─ 图谱：post-graph
↕
研究资源索引（资源表格 + 信息框）
↕
研究路径建议（路径卡片网格）
↕
待完成专题列表
↕
相关文章链接
```

Hub 页模板 `templates/hub-template.html` 已内置上述三标签结构。创建新 Hub 时应优先保留该结构，只替换 taxonomy 过滤条件和卡片内容；不要再把 `sortable-list`、`period-card`、`post-graph` 拆成三个纵向区块。

`.period-card` CSS（参考 `ccp-history.html` 的 `<style>` 块）：

- 卡片布局：`grid-template-columns: 1fr 1fr`（桌面），`1fr`（移动端）
- 卡片样式：半透明背景、圆角、hover 微动效
- 内容结构：年份标签、标题、摘要、关键问题（斜体）、话题列表

---

### 1.3.1 课程笔记标准结构（推荐）

课程类页面，尤其是 `aliases: ["categories/课程/线性代数"]`、`["categories/课程/概率论"]`、`["categories/课程/通信原理"]` 等章节笔记，推荐采用以下标准结构：

1. Stats 数字条
2. `Part 0 · 学习目标`
3. `前置知识回顾`（`.info-box`）
4. 若干正文章节（`.ch`）
5. 定义 / 定理 / 例题等盒子组件（`.def-box` / `.theorem-box` / `.example-box` / `.callout`）
6. `复习速查`（`.review-box`）
7. `参考来源`（`.sources`）
8. `上一章 / 枢纽页 / 下一章`（`.chapter-nav`）

**推荐规则：**
- `前置知识回顾`、`参考来源`、`复习速查`、`章节导航` 都属于高复用结构，应优先保留
- `callout` 用于一句话提醒、易错点，不要承载大段正文
- `info-box / example-box / def-box / theorem-box` 内正文颜色必须在 light mode 下保持足够对比，不要再写偏灰文本
- 若页面已有 `page_style`，除非做专题视觉定制，否则不要重新覆盖这些基础组件颜色

详细语法见：
- `blog-syntax` skill 的 `references/html-components.md`
- `blog-syntax` skill 的 `references/syntax.md`
- `templates/course-note-section-template.html`

### 1.4 Category 与 Subcategory 规范

> **已拆分为独立 skill**：完整的分类映射表、判断规则和新建规则见 `blog-categories` skill（`~/gongshangzheng.github.io/.agents/skills/blog-categories/SKILL.md`）。
>
> 填写 `categories` / `subcategory` 时，必须先读取该 skill 中的分类映射表，从中选取。

### 1.5 Frontmatter 填写阶段

capture.js 生成骨架后，**先完成 frontmatter 再写正文**：

| # | 检查项 |
|---|--------|
| 1 | `title` 写入最终标题 |
| 2 | `description` 一句话概括 |
| 3 | `created_at` 和 `updated_at` 格式为 `YYYY-MM-DDTHH:mm:ss`（精确到秒）|
| 4 | `aliases` 从 blog-categories skill 选取已有分类路径，或按规则创建新的；数学型课程笔记必须使用 `categories/数学/...` 路径，不要机械保留 capture.js 默认的 `categories/课程/...` |
| 4b | `subcategory` 从 §1.4 选取对应子分类（可选）；禁止填写不在 `blog-categories` skill 中的历史遗留值（如 `Semantic Communication`、`Communication & Coding` 等） |
| 5 | `tags` 3-5 个 |
| 6 | 含公式则 `mathjax: true` |
| 7 | `hero_*` 根据文章类型填写 |
| 8 | 论文解读文章必须填写 `papers`（arXiv/DOI 链接），开源项目文章必须填写 `repos`（GitHub 链接） |
| 9 | 用到可选 CSS 模块时填写 `css_modules`（见 §1.6） |

### 1.6 CSS Modules（按需加载）

博客 CSS 已拆分为模块，存放在 `src/assets/css/modules/`。构建时 `build.js` 根据清单自动合并。

**始终加载**（14 个核心模块，自动合并为 `hugo-theme.css`）：

| 模块 | 内容 |
|------|------|
| `variables` | CSS 变量（light + dark 模式） |
| `base` | Reset |
| `typography` | 字体、标题、链接、code、blockquote |
| `article-components` | info-box、example-box、def-box、theorem-box、callout、chapter-nav、review-box、conn-card |
| `nav` | 导航栏、搜索下拉、滚动条 |
| `hero` | Hero banner、stats bar、section、card grid、icon grid |
| `chapter` | .ch 章节块、.ch-label、.ch-title 等 |
| `article-struct` | photo、quote、callout、table、tags、article meta、footer、sources、mathjax |
| `layout` | fade-in 动画、site footer、float buttons、responsive 基础 |
| `toc` | TOC 侧边栏、目录切换、mobile TOC、category browser |
| `embeds` | anchor、image block、admonition、details、search links、douban、innerlink |
| `code` | Prism.js 代码高亮 |
| `category-colors` | 分类标签颜色系统 |
| `document-page` | doc-ref、doc-page、PDF.js 查看 |

**可选模块**：

| 模块 | 内容 | 触发场景 | 加载方式 |
|------|------|----------|----------|
| `course` | geom-box、alg-box、app-box（课程笔记专用组件） | 课程笔记页面用到这些组件时 | 手动：`css_modules: ["course"]` |
| `timeline` | 时间线、VS 对比栏 | 历史叙事页面 | 手动：`css_modules: ["timeline"]` |
| `media` | Bilibili、YouTube、Google Slides 嵌入 | 含视频嵌入的页面 | 手动：`css_modules: ["media"]` |
| `mermaid` | Mermaid 流程图 | `{{< mermaid >}}` shortcode | **自动**：构建器检测到 `class="mermaid"` 后自动注入 CSS + JS + CDN |
| `plots` | FunctionPlot / JSXGraph 图表 | `{{< functionplot >}}` / `{{< jsxgraph >}}` shortcode | **自动**：构建器检测到 `data-functionplot` / `data-jsxgraph` 后自动注入 |

**自动注入的 shortcode 依赖**：`mermaid`、`functionplot`、`jsxgraph`、`docpage-pdf` 这些 shortcode 的 CSS/JS 由构建器自动注入（定义在 `lib/shortcode-deps.js`），**不需要**在 frontmatter 中声明 `css_modules`。

**手动声明**：`course`、`timeline`、`media` 这些模块没有 shortcode 自动检测，仍需在 frontmatter 中声明：

```yaml
---
title: "高等数学笔记"
css_modules: ["course"]
---
```

构建器会自动注入 `<link rel="stylesheet" href="assets/css/modules/course.css">`。

**模块配置文件**：`src/assets/css/css-manifest.json` 定义了哪些模块始终加载、哪些可选。修改模块归属后运行 `node build.js` 即可生效。

**编辑 CSS 的规则**：
- 只编辑 `modules/*.css` 中的文件，不要编辑 `hugo-theme.css`（它是构建产物）
- 修改后运行 `node build.js` 验证

### 1.7 Aliases、sub_id 与 Taxonomy 索引页替换

> **已迁移至独立 skill**：`blog-aliases`（项目级 `.agents/skills/blog-aliases/SKILL.md`）。
> 所有关于 `aliases`、`sub_id`、taxonomy index 替换、Hub 页别名、`sortable-list`/`post-graph` 短代码的规范，请读取该 skill。

---

## 2. 正文写作

### 2.0.1 数学公式与高亮语法

**LaTeX 生效条件**：frontmatter 必须设置 `mathjax: true`。行内公式使用 `$...$` 或 `\(...\)`；独立公式优先使用 `$$...$$` 独占多行，也支持 `\[...\]` 独占多行。

**⚠️ 硬性禁止：不要把 display math 放进 `<p>`、`<span>`、`<a>`、图片 `alt` 或其他 HTML 属性里。**
- ❌ `<p>$$...$$</p>` / `<p>\[...\]</p>` —— 构建器虽会尝试吸收 `<p>`，但容易因段落结构干扰导致渲染异常
- ✅ `$$...$$` 或 `\[...\]` 独占一行，前后不留 `<p>` 标签
- 需要居中时直接让 MathJax 默认居中即可，不要手动包 `<p style="text-align:center">`

**高亮语法**：普通高亮用 `==文字==`；彩色高亮用 `{{< bg yellow >}}文字{{< /bg >}}`，支持 `yellow` / `red` / `blue` / `green` / `purple` 五色。模板里如果只写三色，那只是示例不完整，不代表只支持三色。

### 2.0.2 小节标题 class 规范（强制）

正文中的小节标题**必须**带标准 class，否则不会加入 TOC、样式也会丢失：

| 层级 | 正确写法 | 错误写法 |
|------|---------|---------|
| 二级小节 | `<h3 class="section-title">标题</h3>` | `<h3>标题</h3>` |
| 三级小节 | `<h4 class="ch-section">标题</h4>` | `<h4>标题</h4>` |

**例外**：`.info-box` / `.def-box` / `.theorem-box` / `.example-box` / `.sources` 内部的 `<h3>` 不需要加 class（它们不参与 TOC）。

### 2.1 引用与参考来源（必做，不可跳过）

**所有正文中的事实性陈述都必须用 `#key#` 语法标注引用。** 纯文本 `(Author, Year)` 不会被构建系统识别，必须用 `#Author et al., Year#`。

写完正文后，**必须同时完成以下两步**，缺一不可：

1. **正文引用**：用 `#key#` 标记所有重要事实性句子（方法名、实验数值、基线对比、公式来源等）
2. **底部 `.sources` 列表**：每个 `<li>` 加 `data-cite-key` 属性，值为 citation.js `slugifyKey()` 的结果

```html
<!-- 正确示例：正文用 #key# + 底部 sources 配 data-cite-key -->
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li data-cite-key="Chen-et-al.-2025">
      Chen, Z. et al. (2025). 论文标题. <em>会议名</em>.
      <a href="https://arxiv.org/abs/2503.06764" target="_blank">arXiv:2503.06764</a>
    </li>
  </ul>
</div>
```

slugifyKey 规则（来自 `citation.js`）：
- 去掉开头的 `@`
- 空格转连字符 `-`
- 非单词字符（除 `-` `:` `.` 外）转连字符
- 连续连符合并
- 首尾去连字符

示例：`Chen et al., 2025` → `Chen-et-al.-2025`

**常见错误**：
- ❌ 用 `(Author, Year)` 纯文本——构建系统不认识，不生成 `<cite>`
- ❌ 写了 `#key#` 但底部 sources 没有 `data-cite-key`——hover 弹出

- 源文件**只含 frontmatter + 正文**，不含 `<html><head><nav><footer><script>`
- 所有结构由构建系统自动注入
- `.ch-title` 自动加入目录 ToC，作为 level 2
- `h3.section-title` 自动加入目录 ToC，作为 level 3
- `h4.ch-section` 自动加入目录 ToC，作为 level 4
- **Frontmatter（YAML `---` 之间的区域）只能包含有效的 YAML 键值对**，不能放任何 HTML、markdown 或图片。图片必须放在 `---` 之后的正文区域
- **图片应当放在所讲解段落的后面**（紧跟相关文字），而不是堆在文章末尾
- **`<p>` 标签可选**：构建系统会自动为 `.html` 文件中的裸文本行补上 `<p>` 标签。已有的 `<p>` 不会重复包裹。以下内容不受影响：
  - 以 `<` 开头的行（HTML 标签）
  - 以 `{{` 开头的行（Shortcode）
  - `<pre>`、`<script>`、`<style>`、`<table>` 内部的内容
  - `\[...\]` 和 `$$...$$` display math 块内部
- **代码块规范**：HTML 页面中优先使用 `<pre><code class="language-...">...</code></pre>`。构建器现已兼容 fenced code block（如 ```python ... ```），会在构建时自动转换为 `<pre><code>`，但对长期维护的 HTML 页面仍推荐显式 HTML 代码块。

### 2.2 关键路径

| 项目 | 路径 |
|------|------|
| 博客根目录 | `~/gongshangzheng.github.io` |
| 文章源文件 | `src/pages/*.html` |
| 文章写作模板（capture.js） | `~/gongshangzheng.github.io/.agents/skills/html-blog/templates/article-template.html` |
| 中枢页模板（capture.js） | `~/gongshangzheng.github.io/.agents/skills/html-blog/templates/hub-template.html` |
| 算法题解模板（capture.js） | `~/gongshangzheng.github.io/.agents/skills/html-blog/templates/algorithm-template.html` |
| 页面骨架模板 | `src/templates/_base.html`（_header.html, _footer.html） |
| 构建脚本 | `build.js` |
| 站点地址 | https://gongshangzheng.github.io |
| 提交钩子 | `githooks/post-commit` → `scripts/skill-evolution-hook.js`（需 `git config core.hooksPath githooks`） |

> **提交钩子（post-commit）— 架构变更 → skill 自进化提醒**：本仓库已配置 `core.hooksPath=githooks`。每次 `git commit` 后，钩子检查本次改动文件：若涉及**网站架构文件**（`lib/`、`scripts/`、`assets/js/`、`assets/css/`、`src/templates/`、`build.js`、`config.json`、`tests/`、`docs/`、`.agents/skills/`、`.github/workflows/`、`data/category-names.json` 等），会自动打印带 `[skill-evolution]` 标记的提醒并映射到可能受影响的 skill（如 `lib/taxonomy.js`→blog-categories/blog-aliases，`assets/css/`→site-design-language，默认→site-dev）。**文章提交**（`src/pages/*.html`）与**资源提交**（`media/`、`raw/`）**不会触发**，故常规发布流程不受影响。看到提醒时：阅读受影响 skill 的 SKILL.md，确认是否与架构变更产生偏差，若有则更新并提交，保持 skill 与站点架构一致。待办同时写入 `.cache/skill-evolution-pending.log`（gitignored）。新克隆需执行 `git config core.hooksPath githooks`。

### 2.3 可用组件速查

| 组件 | 语法 | 适用场景 |
|------|------|----------|
| 主章节标题 | `<div class="ch"><div class="ch-label">第X章</div><div class="ch-title">标题</div>...` | 每个主要章节（TOC level 2） |
| 次级章节标题 | `<h3 class="section-title">小节标题</h3>` | 主章节下的小节（TOC level 3） |
| 三级章节标题 | `<h4 class="ch-section">更细一级标题</h4>` | 小节下的细分主题（TOC level 4） |
| 信息框 | `<div class="callout"><strong>...</strong>...</div>` | 类比、强调、总结 |
| 信息提示 | `<div class="admonition [type]">...` | tip/note/warning/danger/info/success 六种类型，详见下方 admonition 说明 |
| 引用块 | `<div class="quote"><p>「...」</p><div class="who">出处</div></div>` | 课程/文献原话 |
| 行内标签 | `<div class="tags"><span class="tag">标签</span></div>` | 人物身份、机构、技术栈、论文属性等短标签 |
| 表格 | `<div class="table-wrap"><table>...</table></div>`；长文本总览表可用 `<div class="table-wrap wide"><table>...</table></div>` + 显式 `<br>`；参数表用 `<div class="table-wrap param-table"><table>...</table></div>` | 对比、参数列表；长文本总览表优先用 `wide + <br>` 做语义换行；参数名/路径/命令列不应压缩换行，应横向滚动 |
| 图片 | `<div class="photo"><img src="media/images/<slug>/xxx.webp" loading="lazy"><div class="cap">说明</div></div>` | 配图。**必须使用 WebP 格式**。源文件放 `media/images/<slug>/`，HTML 引用 `.webp` 后缀 |
| 课件引用 | `{{< docref "pdf/课程名/xx.pdf" page=12 title="标题" >}}` | 轻量引用课件出处 |
| 课件展示 | `{{< docpage "pdf/课程名/xx.pdf" page=12 title="标题" >}}` | 沉浸式展示课件整页 |
| 多页课件 | `{{< docpages "pdf/课程名/xx.pdf" pages="2,4-6" title="标题" >}}` | 连续展示多页课件 |
| 函数图 / 信号图 | `{{< jsxgraph title="标题" height="300" >}}JS{{< /jsxgraph >}}` | 所有数学函数图、信号图、离散序列、冲激示意；详细语法见 blog-syntax skill `references/plots.md` |
| 流程图/架构图 | `{{< mermaid >}}graph TD...{{< /mermaid >}}` | 系统架构、流程、时序图 |
| 可折叠块 | `{{< details summary="标题" >}}内容{{< /details >}}` | 补充材料、推导细节 |
| 高亮文字 | `==文字==` 或 `{{< bg yellow >}}文字{{< /bg >}}` | 关键词标注；彩色高亮支持 `yellow` / `red` / `blue` / `green` / `purple` |
| 数学公式 | `$...$` 行内；`$$...$$` 或 `\[...\]` 独占多行（需 `mathjax: true`） | 公式；display math 不要包在 `<p>`、`<span>`、`<a>` 或 HTML 属性里 |

> 详细语法、参数、注意事项见 blog-syntax skill 的 `references/syntax.md` 和 `references/html-components.md`。

### 2.3.1 文章结构组织规范

> 本节是博客所有文章类型的**通用结构规范**。特定文章类型（课程笔记、历史叙事、论文解读）有各自的结构规范，由对应 skill 定义，不与本文冲突。

#### 组件语义总结

博客提供三类视觉元素，各有明确分工：

| 层级 | 组件 | 视觉特征 | 语义角色 |
|------|------|---------|--------|
| 一级章节 | `.ch` + `.ch-label` + `.ch-title` | 大标题 + 下划线 + TOC 条目 | 文章的主要分节（TOC level 2） |
| 二级章节 | `h3.section-title` | 较小标题 + TOC 条目 | 主章节内部的逻辑分块（TOC level 3） |
| 三级章节 | `h4.ch-section` | 更细一级标题 + TOC 条目 | 小节内部的细分主题（TOC level 4） |
| 内容块 | `.def-box` / `.theorem-box` / `.example-box` / `.info-box` / `.callout` / `.admonition` / `.review-box` | 彩色边框盒子 | 定义、定理、例题、提示等 |
| 叙事段落 | 裸 `<p>` | 普通文本 | 叙述、解释、过渡 |

#### 通用结构原则

1. **禁止全平铺。** 章节数量 > 6 时，必须按逻辑归入 2-4 个大组，用层级标题（`ch-label`/`ch-title` 为大组，`h3.section-title` 为子节，`h4.ch-section` 为更细一级）区分。
2. **叙述有推进方向。** 读者应能感知文章的递进关系（从基础到应用？从问题到方案？从因到果？）。
3. **核心信息用内容块包裹。** 数学定义 → `def-box`，定理/准则 → `theorem-box`，一句话要点 → `callout`。禁止把核心定义裸露为普通段落。
   **例题特殊规则**：同一 `ch` 章内 ≥2 道例题时，必须用 `code-tabs collapsible example-tabs` 包裹所有 `example-box`，放在章末 `<h3 class="section-title">例题区</h3>` 下；仅 1 道例题时可单独用 `example-box`。
4. **组件服务于内容，不决定内容。** 没有规定每个章节必须包含特定组件——用什么组件取决于内容本身需要什么形式。
5. **大领域优先系列化。** 当主题覆盖多个技术范式、文章需要同时承担综述/教程/业务选型/工程成本等多重目标时，不要强行写成一篇超长文章。应拆成同一 `categories` / `subcategory` 下的系列文章，并用总览篇或 Hub 页提供阅读路径。系列文章要像写书一样先做结构规划：总览篇是“序章/目录”，专题篇是“章节”，最终篇是“结语/选型”；每篇文章开头交代本篇在系列中的位置，结尾提供前后篇导航和本篇小结。

#### 各文章类型的结构入口

| 文章类型 | 结构规范位置 |
|---------|------------|
| 课程笔记 | `course-notes/references/note-structure.md`（含层级规范 + 组件放置 + callout/admonition 分工） |
| 历史叙事 | `historical-narrative/phases/html-writing.md`（叙述结构）+ 下文 §叙事文章组件使用 |
| 论文解读 | `read-article/phases/html-writing.md`（教学式结构）+ 下文 §论文文章组件使用 |
| 普通文章 | 本节通用原则 + 按需使用组件 |

#### 叙事文章组件使用（历史叙事等）

叙事文章的核心是**讲故事**。组件服务于叙事节奏，不能打断叙事流：

| 组件 | 在叙事中的角色 | 注意 |
|------|--------------|------|
| `.ch` + `.ch-title` | 每个 Act/幕 | 主要分节，每个 Act 有明确的叙事功能 |
| `.quote` | 当事人原话、回忆录引用 | **高频使用**，比裸段落更有现场感 |
| `.photo` | 历史图片、人物照片 | 紧跟相关段落，不要堆在文末 |
| `.callout` | 关键数字、转折点标注 | 少用，只在真正需要提炼时出现 |
| `.info-box` | 历史背景补充、地理/制度说明 | 补充性质，不打断主线 |
| `.table-wrap` | 对比表、时间线数据表 | 用于数据密集的段落 |
| `.timeline` | 时间线可视化 | 适合前期铺陈，不适合叙事高潮 |
| `admonition` | 一般**不用** | 叙事文章不需要颜色编码的警告 |
| `def-box` / `theorem-box` | **不用** | 叙事文章没有数学定义和定理 |

**叙事节奏原则：**
- 每章以具体场景或人物切入，不以抽象概括开头
- 高潮场景用足够的段落展开，不被组件盒子打断
- 引用原话时用 `.quote`，不用裸引号

#### 论文文章组件使用（read-article 等）

论文解读文章是教学式深度阅读，需要交替使用叙事段落和结构化内容块：

| 组件 | 在论文文章中的角色 | 注意 |
|------|-------------------|------|
| `.ch` + `.ch-title` | 每个逻辑章节（引言/方法/实验/讨论） | 可以不用 `ch-label` |
| `.def-box` | 论文提出的核心定义、损失函数、优化目标 | 公式 + 符号说明 |
| `.theorem-box` | 论文的核心定理、收敛性保证、理论分析 | 如果论文有的话 |
| `.callout` | Insight 提炼、反直觉发现、关键数字 | 一句话级别 |
| `admonition tip` | 做复现时的经验、训练技巧 | 多段时用 |
| `admonition warning` | 论文未讨论的局限性、复现坑点 | 多段时用 |
| `.example-box` | 代码片段、具体计算示例 | ≥2 道例题时必须用 `code-tabs collapsible example-tabs` 包裹，见 blog-syntax §标题层级规范 |
| `.table-wrap` | 实验结果对比表、超参数表 | **高频使用** |
| `.photo` | 论文原图、架构图 | 紧跟相关段落 |
| `.quote` | 论文原文关键句 | 需要精确引用时 |
| `{{< mermaid >}}` | 方法 pipeline 流程图、模块架构 | 代码绘制的首选 |
| `{{< details >}}` | 证明细节、补充推导 | 不打断主线但值得保留的内容 |

**论文文章的叙述节奏：**
- 每个方法模块遵循 **Motivation → Intuition → Mechanism** 三层递进
- 公式前先说意图，公式后解释符号
- 实验表格不只是列数据，要指出"这个数字说明什么"、"这里掉了 3 个点意味着什么"

### 2.4 详细参考文档（按需读取）

| 文件 | 何时读取 |
|------|---------|
> 以下参考文件已全部迁移至 **blog-syntax** skill（`~/gongshangzheng.github.io/.agents/skills/blog-syntax/references/`），按需读取：
>
>| 文件 | 何时读取 |
>|------|---------|
>| `html-components.md` | 写正文时 — 全部 HTML 组件语法 |
>| `mathjax.md` | 含数学公式时 — 分隔符、转义规则 |
>| `syntax.md` | 使用引用/Shortcode/Wiki链接时 |
>| `plots.md` | 使用 functionplot / JSXGraph 数学函数图、信号图时 |
>| `docref.md` | 使用 docref / docpage / docpages 课件引用时 |
>| `mermaid.md` | 使用 Mermaid 流程图/架构图时 |
>| `images.md` | 处理图片时 — 配图策略、来源验证 |
>| `publish.md` | 发布时 — 构建、git push、邮件通知 |
>| `style.md` | 需要调色板/排版/排查错误时 |

---

## 2.5 Admonition 组件详解

Admonition 是带图标和颜色编码的提示块，适用于**核心原则、技巧、警告**等需要视觉强调的场景。与 `callout`（一句话要点）和 `info-box`（背景说明）互补。

### 完整模板

```html
<div class="admonition tip">
  <div class="admonition-title">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    标题文字
  </div>
  <div class="admonition-content"><p>内容...</p></div>
</div>
```

### 六种类型

| 类型 | class | 颜色 | 适用场景 |
|------|-------|------|----------|
| note | `admonition note` | 🔵 蓝 | 重要原则、核心结论 |
| tip | `admonition tip` | 🟡 金 | 技巧、建议、步骤指引 |
| warning | `admonition warning` | 🟠 橙 | 注意事项、潜在问题 |
| danger | `admonition danger` | 🔴 红 | 严重警告、禁止事项 |
| info | `admonition info` | 🔵 蓝 | 补充信息、背景说明 |
| success | `admonition success` | 🟢 绿 | 成功案例、确认结论 |

### 各类型图标 SVG

**note / info**：
```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
```

**tip**：
```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
```

**warning**：
```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
```

**danger**：
```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
```

**success**：
```html
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
```

### 选择指南

| 场景 | 推荐组件 |
|------|----------|
| 一句话要点/易错点 | `.callout` |
| 较长背景说明（有 h3 标题） | `.info-box` |
| 需要类型区分和图标的强调提示 | `.admonition` |

> ⚠️ **禁止**凭记忆写 HTML 组件。不熟悉的组件必须先读取对应 reference 文件。

---

## 3. 上游 Skill 对接规范

其他 skill（academic-research、deep-research、historical-narrative、read-article）发布文章时：

1. **调用 capture.js 创建骨架**，不要手动创建文件
2. **frontmatter 规范**以本 skill §1 为准，不得自创规则
3. **组件语法**以 **blog-syntax** skill 的 `references/` 为准，不得自行维护模板
4. **上游 skill 可指定 template 参数**，capture.js 根据参数选择对应模板
5. **发布后更新 Hub 页**：`node build.js` 自动更新 taxonomy index；仅当存在手动维护的专题 Hub 页（`src/pages/*-hub.html`）且新文章 aliases 分类路径匹配时，需更新 `chapter-list`、阅读路径、关系图入口或卡片目录，并重新 build。Hub 页别名与 `sub_id` 规范见 **blog-aliases** skill。
7. **papers / repos 自动填充**：read-article、academic-research 发布论文解读时，必须将论文的 arXiv/DOI 链接写入 `papers` 字段；github-repo-read 发布源码解读时，必须将 GitHub 仓库 URL 写入 `repos` 字段。这两个字段会自动渲染到文章头部 meta 区和底部 footer 区。
6. **系列文章交付**：上游 skill 判断主题过大时，应在同一 `aliases` 分类路径下创建多篇文章。总览篇负责领域地图、文章目录和推荐阅读顺序；专题篇负责单一问题的深讲；最终篇负责综合比较、业务选型、算力/成本和开放问题。所有系列文章 frontmatter 中的 `aliases` 分类路径、核心 tag 应保持一致，避免为系列临时新建不必要分类。系列必须包含：统一命名、统一导航、统一术语、跨篇引用、前后篇衔接、总览页目录，以及每篇各自完整的 sources。`sub_id` 赋值与总览篇接管分类 index 的具体规则见 **blog-aliases** skill。
