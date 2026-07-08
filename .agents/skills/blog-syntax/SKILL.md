---
name: blog-syntax
description: |
  博客 HTML 写作的详细语法规范参考库。
  包含全部 HTML 组件语法、数学公式规则、引用/Shortcode/Wiki 链接、图片处理、课件引用、Mermaid 图表、JSXGraph 绘图和样式参考。
  html-blog skill 不再内联这些规范，所有详细语法按需从本 skill 的 references/ 目录读取。
  发布流程见 blog-rules skill。
  MANDATORY TRIGGERS: 博客语法, HTML 组件, 写作语法, component syntax, html component, mathjax rule, shortcode, jsxgraph, blog reference
version: 1.0.0
category: blog-syntax
tags: [blog, syntax, html, components, reference]
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# 博客语法规范参考库

> 本 skill 是博客 HTML 写作所有详细语法规范的**统一存放处**。
> 写博客时需要查阅具体组件语法、公式规则、绘图模板等，按需读取下方对应文件。

---

## 写作关键规则（始终遵守）

这些规则在写博客文章时**始终适用**，不需要读参考文件就应记住。它们是 agent 最常犯的错误。

### 图片

- 永远用 `<div class="photo">` + `<div class="cap">`，**禁止** `<figure>` / `<figcaption>`
- 图片必须是 `.webp` 格式，**禁止** `.png` / `.jpg`
- 路径写 `media/images/...`，**不带前导 `/``
- **禁止** hotlink 外部 URL，必须下载到本地

### Frontmatter

- **禁止** `hub`、`categories`、`subcategory`、`subsubcategory` 字段——分类通过 `aliases` 中的 `categories/` 路径配置
- `title` 必填，`tags` 不超过 5 个

### 标签闭合

- 裸文本段落**不要**手动加 `</p>`——构建系统会自动补 `<p>` 标签
- `<div>` 必须用 `</div>` 闭合，**禁止**用 `</p>` 闭合 `<div>`

### 知识框选择

- **定义新概念** → `def-box`（不是 info-box）
- **背景补充/前置知识** → `info-box`
- **定理/命题** → `theorem-box`
- **例题/计算** → `example-box`
- **章节回顾** → `review-box`

### 标题层级

- `ch-title` → TOC level 2（章）
- `h3.section-title` → TOC level 3（节，必须带 class）
- `h4.ch-section` → TOC level 4（小节，必须带 class）
- 禁止跳级（不能 ch-title 直接 h4）

---

## 写作流程协调

写文章时按此流程操作，确保在正确时机获得正确组件知识：

| 阶段 | 做什么 | 工具/文件 |
|------|--------|----------|
| **1. 写前规划** | 确定文章需要哪些组件类型 | 读 `references/component-selection-guide.md` |
| **2. 写组件时** | 需要某个组件的 HTML 模板 | 运行 `~/.venv/bin/python3 scripts/component-snippet.py <组件名>` |
| **3. 写公式时** | 确认 LaTeX 语法正确 | 读 `references/mathjax.md` |
| **4. 画图时** | Mermaid/JSXGraph 语法 | 读 `references/mermaid.md` 或 `references/plots.md` |
| **5. 加图片时** | 图片格式和路径规范 | 读 `references/images.md` |
| **6. 写完后** | 运行自动修复 + lint 检查 | `~/.venv/bin/python3 scripts/fix-article.py <file> --dry-run` 然后 `node lib/lint-html.js <file>` |

> **核心原则**：先查组件模板再写，不要凭记忆猜语法。用 `component-snippet.py` 获取模板只需 1 秒，但修一个 lint 错误要 30 秒。

---

## 参考文件索引

| 文件 | 内容 | 何时读取 |
|------|------|---------|
| `references/component-selection-guide.md` | 组件选择决策树、知识框区分、图片禁止清单、常见错误速查表、自动修复命令 | **写正文前先读此文件**，确定该用哪个组件 |
| `references/html-components.md` | 全部 HTML 组件语法（info-box / def-box / theorem-box / example-box / callout / sources / review-box / chapter-nav / stats / 时间线 / 表格 / admonition / 图片 / 引用块 / 行内语法） | 写正文时 |
| `references/mathjax.md` | 数学公式规则（分隔符、转义、`<p>` 吸收、处理顺序、常见错误） | 含数学公式时 |
| `references/syntax.md` | 引用语法、Shortcode 总表、Wiki 链接、站内引用、Wiki 图片语法、隐藏元素 | 使用特殊语法时 |
| `references/docref.md` | 课件引用（docref / docpage / docpages）完整语法 | 引用 PDF/PPT 课件时 |
| `references/mermaid.md` | Mermaid 流程图/架构图语法 | 使用 Mermaid 时 |
| `references/plots.md` | JSXGraph 绘图完整语法（函数图、离散序列、冲激、滑块、交互、踩坑记录） | 使用 JSXGraph 绘图时 |
| `references/images.md` | 图片配图策略、来源验证、处理流程 | 处理图片时 |
| `references/style.md` | 调色板、排版规范、CSS 模块架构、常见错误速查、禁止事项 | 需要样式细节或排查错误时 |

> **发布流程**不在本 skill 中。发布文章时请读取 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`。

---

## 脚本工具

本 skill 内置两个脚本，通过项目根目录 `scripts/` 下的符号链接访问：

### 组件模板速查 `component-snippet.py`

写文章时获取正确 HTML 模板，避免凭记忆猜语法：

```bash
# 列出所有可用组件
~/.venv/bin/python3 scripts/component-snippet.py --list

# 获取图片组件模板
~/.venv/bin/python3 scripts/component-snippet.py photo

# 获取定义框模板
~/.venv/bin/python3 scripts/component-snippet.py def-box

# 获取 admonition（带类型参数）
~/.venv/bin/python3 scripts/component-snippet.py admonition tip
```

### 自动修复 `fix-article.py`

写完后自动修正常见格式错误：

```bash
# 预览修复（不写入）
~/.venv/bin/python3 scripts/fix-article.py src/pages/your-article.html --dry-run

# 执行修复
~/.venv/bin/python3 scripts/fix-article.py src/pages/your-article.html
```

修复范围：`<figure>` → `<div class="photo">`、img 路径前导斜杠、img 扩展名 → `.webp`、frontmatter 废弃字段、孤立 `</p>` 标签。

### Lint 检查

构建后验证：`npm run lint`（全量）/ `node lib/lint-html.js <file>`（单文件）。

---

## 快速定位

| 需求 | 读取文件 | 关键章节 |
|------|---------|---------|
| 写一个 info-box | `html-components.md` | 内容组件 → 信息框 |
| 写一个定理框 | `html-components.md` | 内容组件 → 定理框 |
| 写一个 admonition | `html-components.md` | 内容组件 → Admonition 块 |
| 行内公式/独立公式 | `mathjax.md` | 分隔符、处理顺序 |
| 引用站内文章 | `syntax.md` | 站内文章引用 |
| 嵌入课件 PDF | `docref.md` | docpage / docpages |
| 画函数图 | `plots.md` | §8 functiongraph |
| 画离散序列 | `plots.md` | §11 离散序列 |
| 画带滑块的交互图 | `plots.md` | §14 slider + §21 模板 |
| 画流程图 | `mermaid.md` | 基本语法 |
| 画思维导图（失败空间/知识结构） | `mermaid.md` | 进阶图表类型 → mindmap |
| 画象限图（方案权衡定位） | `mermaid.md` | 进阶图表类型 → quadrantChart |
| 画时间线（演进史/里程碑） | `mermaid.md` | 时间线 timeline |
| 画状态图/状态机 | `mermaid.md` | 状态图 stateDiagram-v2 |
| 画时序图（交互/调用链） | `mermaid.md` | 时序图进阶 sequenceDiagram |
| 画分支图（版本演进） | `mermaid.md` | 分支图 gitGraph |
| 给流程图节点分组上色 | `mermaid.md` | 通用高级特性 → classDef |
| 查调色板 | `style.md` | 调色板 |
| 不知道该用哪个组件 | `component-selection-guide.md` | 按内容类型选择组件 |
| 知识框选错（def-box vs info-box） | `component-selection-guide.md` | 知识框区分表 |
| 图片格式报错 | `component-selection-guide.md` | 图片禁止清单 + 自动修复 |
| lint 报错需要批量修复 | `component-selection-guide.md` | 自动修复命令 |
