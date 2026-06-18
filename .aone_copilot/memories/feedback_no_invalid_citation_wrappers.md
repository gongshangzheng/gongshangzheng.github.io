---
name: 禁止错误 citation 包裹语法
description: 课程/博客内联引用统一使用 `#key#`；不要生成旧 dollar-at citation、错误双层包裹或裸 at-key。
type: feedback
createdAt: 2026-06-12T10:42:00
---
不要生成旧 dollar-at citation、错误双层包裹或裸 at-key；当前站点内联引用统一使用 `#key#`。

Why: 用户发现法理学文章里出现裸 at-key，且随后要求把旧 dollar-at citation 语法改为 `#key#`。

How to apply: 写博客/课程笔记时，若只是引用 sources 条目，使用站点支持的 `#key#` 并确保 sources 有对应 `data-cite-key`；若引用课件页，优先按语义使用 `docref` / `docpage` / `docpages`，不要自行发明裸 at-key、旧 dollar-at citation 或错误双层包裹。