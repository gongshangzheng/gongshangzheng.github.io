---
name: 分类页保留卡片与视觉元信息
description: 分类页设计应保留卡片式、标签式，以及每个分类的 icon/tone/desc 元信息
type: feedback
createdAt: 2026-06-11T10:47:24
---
分类页设计应保留卡片式与标签式结构；每个分类的 `icon`、`tone`、`desc` 元信息可以保留，用于增强分类识别。

Why: 用户明确指出这组分类视觉元信息可以保留，卡片式 + 标签式设计也可以保留；之前过度收敛导致把有用识别信息删掉。

How to apply: 后续修改 `categories/index.html`、`lib/generators/taxonomy-pages.js` 或分类页 CSS 时，不要删除分类卡片、子分类 chip、分类 icon/tone/desc；如需收敛风格，应通过降低饱和度、缩小色彩使用面积、调整 spacing 来处理，而不是移除这些结构。
