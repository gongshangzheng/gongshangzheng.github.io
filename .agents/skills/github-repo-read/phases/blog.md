# Phase 8: HTML Blog 生成

**目标**：将分析结果写成可发表的 HTML blog 页面，完成本地化图片引用和构建验证。

> **进入本阶段前必须读取**：
> - 已注册的 `html-blog` skill 主文档
> - 处理图片时读取已注册的 `blog-syntax` 的 `references/images.md`
> - 使用 Mermaid、组件、数学、引用时读取 `blog-syntax` 对应 reference

## 8.1 输出模式判断

根据仓库类型和用户需求，选择合适的输出模式：

| 仓库类型 | 输出模式 | 页面结构 |
|----------|----------|----------|
| 单一项目/库 | `blog` | 单个 HTML 页面 |
| 教程/书籍类 | `blog-multi` | hub 页 + 多个章节页 |
| 多模块项目 | `blog-multi` | hub 页 + 多个模块页 |

## 8.2 输出路径

### 单页面模式（blog）

```text
~/gongshangzheng.github.io/src/pages/<slug>.html
~/gongshangzheng.github.io/media/images/<slug>/
```

### 多页面模式（blog-multi）

```text
~/gongshangzheng.github.io/src/pages/<slug>.html              ← hub 页
~/gongshangzheng.github.io/src/pages/<slug>-ch01.html          ← 章节 1
~/gongshangzheng.github.io/src/pages/<slug>-ch02.html          ← 章节 2
...
~/gongshangzheng.github.io/media/images/<slug>/     ← 共享图片
```

## 8.3 写作模型模板

写作模型必须从本 skill 的 `assets/` 目录读取，不能把可复用写作结构散落在 phase 指令里：

| 输出模式 | 模板文件 | 用途 |
|----------|----------|------|
| `blog` | `assets/source-analysis-single.html` | 单篇源码解读长文 |
| `blog-multi` hub 页 | `assets/source-analysis-hub.html` | 系列目录、阅读路径和模块地图 |
| `blog-multi` 子页面 | `assets/source-analysis-chapter.html` | 单个模块或章节的源码深读 |

使用模板前必须先完成：

1. 读取已注册的 `html-blog` skill 主文档。
2. 按实际组件读取 `blog-syntax` reference，例如 Mermaid 读 `references/mermaid.md`，引用读 `references/syntax.md`，图片读 `references/images.md`。
3. 用 Phase 7 的真实提纲、Phase 4/5 的源码证据、Phase 3 的图片资产填充模板变量。
4. 生成到 `src/pages/` 的最终 HTML 页面后，必须确认没有任何 `REPLACE_` 模板变量残留。

### 模板格式要求

所有 `assets/*.html` 必须符合 `blog-syntax`：

| 要求 | 说明 |
|------|------|
| 只含 frontmatter + 正文 | 不写 `<html>`、`<head>`、`<body>`、`<script>` |
| 章节层级标准 | 大章节用 `.ch` + `.ch-title`，二级标题用 `<h3 class="section-title">` |
| 图片组件标准 | 使用 `.photo`，包含 `<img>` 和 `.cap` |
| 表格标准 | 所有表格包在 `.table-wrap` 中；参数解释表使用 `.table-wrap.param-table`，让参数名/路径/命令列不换行，说明列正常换行，整体通过横向滚动查看 |
| 命令解释标准 | 关键命令后必须有参数解释表，说明参数作用、输入输出、替换建议和配置配对关系 |
| 引用标准 | 正文 `#key#` 必须匹配 `.sources li[data-cite-key]` |
| 可视化标准 | Mermaid / JSXGraph 使用 shortcode，不手写脚本 |

## 8.4 hub 页创建（blog-multi 模式）

使用 `capture.js --hub` 创建 hub 页，再用 `assets/source-analysis-hub.html` 的写作模型填充真实内容：

```bash
SLUG="<slug>"
node /Users/tangwen/.agents/skills/html-blog/capture.js "$SLUG" --hub
```

hub 页不能直接复制模板变量，必须用 Phase 7 的提纲结果填充真实内容：

| 区域 | 必须填入的真实信息 |
|------|--------------------|
| 引论 | 仓库名称、一句话定位、为什么需要多页拆分、推荐阅读顺序 |
| 章节目录 | 每个子页面的真实标题、真实链接、当前完成状态 |
| 模块索引 | 每个模块的真实职责、对应源码路径、该页面讲解重点 |
| 来源说明 | repo、docs、Wiki、论文、官方模型页等真实来源 |

## 8.5 子页面创建（blog-multi 模式）

使用 `capture.js` 创建子页面：

```bash
SLUG="<slug>"
node /Users/tangwen/.agents/skills/html-blog/capture.js "${SLUG}-ch01"
node /Users/tangwen/.agents/skills/html-blog/capture.js "${SLUG}-ch02"
```

### 子页面写作模型

所有子页面必须基于 `assets/source-analysis-chapter.html` 填充：

| 区域 | 填充要求 |
|------|----------|
| frontmatter | `subcategory` 与 hub 页完全一致；`hub` 指向 hub slug |
| 中心问题 | 每篇只回答一个问题，不把多个模块混写 |
| 证据表 | 列出 README/docs、入口文件、核心实现文件 |
| 调用链 | 使用真实函数、真实文件路径和 Mermaid 图 |
| 章节导航 | 用 `.chapter-nav` + `.nav-prev` / `.nav-hub` / `.nav-next`，带方向箭头，不得使用裸链接 |

## 8.6 图片本地化

```bash
SLUG="<slug>"
mkdir -p ~/gongshangzheng.github.io/media/images/${SLUG}/
cp ~/gongshangzheng.github.io/raw/${SLUG}/figures/${SLUG}/* \
   ~/gongshangzheng.github.io/media/images/${SLUG}/ 2>/dev/null || true
```

### 禁止事项

- ❌ 远程图片 URL
- ❌ Docling `_artifacts`
- ❌ 不存在的图片文件名

## 8.7 HTML 结构要求

### 必须遵守

| 规则 | 说明 |
|------|------|
| 只写 frontmatter + 正文 | 不写 `<html>`, `<head>`, `<body>`, `<script>` |
| `.ch fade-in` | 大章节容器 |
| `<h3 class="section-title">` | 二级章节标题；禁止用裸 `<h3>` 或 Markdown `###` |
| `.photo` | 插图；内部必须包含 `<img src="media/images/<slug>/<file>" ...>` 和 `.cap` |
| `.table-wrap` | 包裹所有表格 |
| `.sources` | 参考来源 |
| 代码块 | `<pre><code class="language-xxx">...</code></pre>` |
| 核心代码入文 | 关键函数、类、配置或算法实现必须直接插入代码框，并标注来源路径与函数名；禁止只写“见某文件”而不展示核心代码 |

### 可视化组件（用 shortcode，不写 `<script>`）

html-blog 的构建器会**自动注入** Mermaid / JSXGraph 的 CSS/JS（检测到对应 shortcode/marker 即注入），因此正文里直接用 shortcode 即可，**不违反"不写 `<script>`"的规则**。

| 组件 | 用途 | 写法 | 详细语法 |
|------|------|------|----------|
| **Mermaid** | 架构图 / 模块依赖图 / 主调用链时序图 / ERD | `{{< mermaid >}}graph TD ...{{< /mermaid >}}` | blog-syntax `references/mermaid.md` |
| **伪代码** | 核心算法逻辑提炼 | Algorithm 组件，推荐与 Mermaid 放同一 `code-tabs`（一 tab 图、一 tab 伪代码） | blog-syntax 模板 |
| **JSXGraph** | 仅当算法涉及数学函数/几何/坐标变换等**适合交互演示**时 | `{{< jsxgraph title="..." height="300" >}}JS{{< /jsxgraph >}}` | blog-syntax `references/plots.md` |

**JSXGraph 定位（可选增强）**：

- 仅在核心算法涉及数学/几何/坐标变换/信号等、且交互演示能显著帮助理解时才用，是**可选增强**而非默认。
- 使用前先确认 html-blog/blog-syntax 当前支持 `{{< jsxgraph >}}`（已确认支持，自动注入）；普通静态架构关系**用 Mermaid 即可，不要用 JSXGraph**。
- 写复杂 shortcode（mermaid/jsxgraph）前，**先读 blog-syntax skill 对应的 `references/` 文件**确认最新语法。

### Frontmatter 格式

```yaml
---
title: "项目名：一句话定位"
date: YYYY-MM-DD
tags: [github, source-code, 项目真实主题]
categories: [按文章真实分类填写]
subcategory: "真实子分类"
description: "用一句真实摘要说明本文读者收益"
---
```

## 8.8 构建验证

```bash
PAGE="$HOME/gongshangzheng.github.io/src/pages/${SLUG}.html"
grep -n 'REPLACE_' "$PAGE" && echo "template variables remain" && exit 1
cd "$HOME/gongshangzheng.github.io" && node build.js
```

### 常见问题排查

| 问题 | 排查方向 |
|------|----------|
| 图片 404 | 检查 `media/images/<slug>/` 下文件是否存在，HTML 中使用 `media/images/<slug>/<file>` |
| 样式异常 | 检查是否用了未定义的 class |
| 构建报错 | 检查 frontmatter 格式是否正确 |
| 子页面链接失效 | 检查 href 路径是否正确 |

## 8.9 发布

构建通过后：

```bash
cd ~/gongshangzheng.github.io
git add -A
git commit -m "feat: add source code analysis for 实际项目名"
git push
```

> **提交钩子提示**：本仓库配有 post-commit 钩子（`githooks/post-commit`）。仅当提交涉及**架构文件**（`lib/`、`scripts/`、`assets/`、`src/templates/`、`build.js` 等）时才打印 `[skill-evolution]` 提醒。本流程产出的是文章（`src/pages/`）与图片（`media/`），通常不会触发；若你额外改动了架构文件并看到该提醒，请按提示检查并更新相关 skill 的 SKILL.md。

---

## Gate 条件

进入 Phase 9 前必须满足：

1. **HTML 文件已生成**，frontmatter 完整
2. **写作模型来自 `assets/`**，没有把可复用模板写在 phase 正文里
3. **最终页面无 `REPLACE_` 模板变量残留**
4. **图片已本地化**，无远程 URL
5. **`node build.js` 通过**
6. **如果是多页面模式**：hub 页和所有子页面都已创建，链接正确
7. **todo 状态**：Phase 8 标记为 `completed`，Phase 9 标记为 `in_progress`

不满足？修复后重新检查 Gate。
