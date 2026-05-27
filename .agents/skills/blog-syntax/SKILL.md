---
name: blog-syntax
description: |
  博客 HTML 写作的详细语法规范参考库。
  包含全部 HTML 组件语法、数学公式规则、引用/Shortcode/Wiki 链接、图片处理、课件引用、Mermaid 图表、JSXGraph 绘图、发布流程和样式参考。
  html-blog skill 不再内联这些规范，所有详细语法按需从本 skill 的 references/ 目录读取。
  MANDATORY TRIGGERS: 博客语法, HTML 组件, 写作语法, component syntax, html component, mathjax rule, shortcode, jsxgraph, blog reference
version: 1.0.0
category: blog-syntax
tags: [blog, syntax, html, components, reference]
---

# 博客语法规范参考库

> 本 skill 是博客 HTML 写作所有详细语法规范的**统一存放处**。
> 原 html-blog skill 的 `references/` 目录已迁移至此。
> 写博客时需要查阅具体组件语法、公式规则、绘图模板等，按需读取下方对应文件。

---

## 参考文件索引

| 文件 | 内容 | 何时读取 |
|------|------|---------|
| `references/html-components.md` | 全部 HTML 组件语法（info-box / def-box / theorem-box / example-box / callout / sources / review-box / chapter-nav / stats / 时间线 / 表格 / admonition / 图片 / 引用块 / 行内语法） | 写正文时 |
| `references/mathjax.md` | 数学公式规则（分隔符、转义、`<p>` 吸收、处理顺序、常见错误） | 含数学公式时 |
| `references/syntax.md` | 引用语法、Shortcode 总表、Wiki 链接、站内引用、Wiki 图片语法、隐藏元素 | 使用特殊语法时 |
| `references/docref.md` | 课件引用（docref / docpage / docpages）完整语法 | 引用 PDF/PPT 课件时 |
| `references/mermaid.md` | Mermaid 流程图/架构图语法 | 使用 Mermaid 时 |
| `references/plots.md` | JSXGraph 绘图完整语法（函数图、离散序列、冲激、滑块、交互、踩坑记录） | 使用 JSXGraph 绘图时 |
| `references/images.md` | 图片配图策略、来源验证、处理流程 | 处理图片时 |
| `references/publish.md` | 构建、发布、邮件通知、TOC 注入 | 发布文章时 |
| `references/style.md` | 调色板、排版规范、CSS 模块架构、常见错误速查、禁止事项 | 需要样式细节或排查错误时 |

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
| 发布文章 | `publish.md` | 构建与预览 |
| 查调色板 | `style.md` | 调色板 |
