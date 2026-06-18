---
name: 表格优先合理换行与斜体说明
description: 博客长文本表格优先合理换行；表格说明用表格后斜体段落，不用 caption 标签。
type: feedback
createdAt: 2026-06-09T18:13:00
---
博客长文本总览表应优先使用合理换行；表格说明统一写在表格下方，使用斜体段落 `<p><em>表 N：说明</em></p>`。不要使用 `<caption>` 标签或 `<div class="table-caption">`。

Why: 用户要求移除 caption 功能，改用更简单的斜体段落方式。之前的 `<caption>` + 构建时提取 + CSS `.table-caption` 方案过于复杂。

How to apply: 写表格说明时，在 `</div>`（table-wrap 闭合）之后紧跟 `<p><em>表 N：说明文字</em></p>`。Markdown 管道表格的前缀说明段落由构建脚本自动转为斜体段落。长文本总览表优先用 `table-wrap wrap-table` 让单元格自然换行；宽表用 `table-wrap wide` + 显式 `<br>` 按语义断行。公式、路径、命令等原子内容不要为了压宽度强行断行。