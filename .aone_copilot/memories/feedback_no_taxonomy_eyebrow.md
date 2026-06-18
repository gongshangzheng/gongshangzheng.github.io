---
name: 分类页不保留 taxonomy eyebrow
description: 分类首页不要保留 taxonomy-eyebrow 这类额外上标说明，标题区保持直接紧凑
type: feedback
createdAt: 2026-06-11T10:49:25
---
分类首页不要保留 `taxonomy-eyebrow` 这类额外上标说明，标题区保持直接、紧凑，只保留必要标题和统计信息。

Why: 用户明确反馈不要留 `taxonomy-eyebrow`；这类额外介绍在分类索引页意义不大，还会增加视觉高度。

How to apply: 后续修改 `categories/index.html`、`lib/generators/taxonomy-pages.js` 或分类页样式时，不要重新加入 `taxonomy-eyebrow` 文案或对应 CSS；需要说明时优先用统计信息或卡片自身描述承载。
