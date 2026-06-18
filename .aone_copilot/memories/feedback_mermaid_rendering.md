---
name: Mermaid 渲染稳定写法
description: 博客 Mermaid 图中含括号、斜杠、数学符号或中英文混排的节点/边标签必须使用引号，避免 Mermaid v11 运行时解析失败。
type: feedback
createdAt: 2026-06-04T11:08:12
---
博客 Mermaid 图中，节点或边标签只要包含括号、斜杠、箭头、冒号、逗号、数学符号、HTML 符号或中英文混排，就必须使用引号标签，例如 `F["数字系统函数 H(z)"]`、`C -->|"高通 / 带通 / 带阻"| E`。不要写 `F[H(z)]` 或 `C -->|高通/带通/带阻| E` 这类裸标签。

Why: Mermaid shortcode 构建能成功并注入脚本，但 Mermaid v11 在浏览器运行时会因未加引号的特殊字符标签解析失败，导致整张图不渲染。
How to apply: 写或审博客 Mermaid 图时，默认给中文技术标签加引号；课程笔记中的公式名用普通文本表达并放入引号标签，不写 LaTeX。
