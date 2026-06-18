---
name: 课程笔记关键概念必须配图
description: 课程笔记中讲结构、表示法或抽象机制时，不能只用文字，应优先补充图示或课件页。
type: feedback
createdAt: 2026-06-03T16:06:01
---
课程笔记中讲结构、表示法、抽象机制或操作流程时，不能只用文字堆解释；关键方法应优先用课件 docpage、Mermaid、JSXGraph、表格、公式推导或其他可靠的非 SVG 表达补充说明。

Why: 用户指出 `dsp-filter-structures.html` 内容偏少，尤其“方框图法”和“信号流图法”没有图示不合理；随后明确反馈 SVG 生成效果太差，不要再生成 SVG。

How to apply: 后续编辑课程笔记或技术博客时，遇到结构表示、算法流程、系统框图、信号流、几何直觉等内容，要主动检查是否需要图示；已有 PPT/PDF 课件时优先结合 `docpage`，必要时再用 Mermaid/JSXGraph/表格/公式说明。不要生成 SVG。