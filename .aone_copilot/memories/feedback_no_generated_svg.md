---
name: 不再生成 SVG
description: 用户明确反馈 SVG 生成效果差；后续课程笔记和博客内容不要再生成 SVG，优先用 docpage/docref、Mermaid、JSXGraph、表格或文字结构。
type: feedback
createdAt: 2026-06-04T11:56:52
---
后续不要再为博客或课程笔记生成手绘 SVG、示意图 SVG 或结构图 SVG；已有错误 SVG 应替换为更可靠的非 SVG 表达，如课件 `docpage`/`docref`、Mermaid、JSXGraph、表格、公式推导或文字结构说明。`blog-syntax` / `html-blog` 内置组件中的 SVG 图标可以使用，例如 admonition 图标。

Why: 用户明确反馈手绘结构 SVG 生成效果太差，并指出 `dsp-filter-structures.html` 中 IIR 四种结构例题的 SVG 全是错的；但用户随后明确说明 SVG admonition 图标是可以使用的。

How to apply: 之后遇到结构图、信号流图、流程图或示意图需求时，不要调用或编写手绘 SVG；优先引用课件原图页，或使用 Mermaid/JSXGraph/表格/公式。写 `blog-syntax` 已支持的 UI 组件时，可以保留其内置 SVG 图标。