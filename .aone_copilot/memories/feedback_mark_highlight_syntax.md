---
name: mark 高亮语法
description: 高亮 mark 语法只接受 ==text==，单等号 =text= 不再表示高亮。
type: feedback
createdAt: 2026-06-05T14:58:30
---
博客行内高亮（`<mark>`）的语法只允许 `==text==`（双等号）。`=text=`（单等号）不再表示高亮。

**Why:** 单等号包裹太容易和数学等号、普通文本中的等号冲突，导致误转换。用户明确要求移除单等号规则。

**How to apply:** 在 `lib/replace.js` 的 `applyInlineMarkdown` 里只保留 `==([^=]+)==` → `<mark>` 这一条；不要再添加 `=([^=]+)=` 的兜底规则。写博客正文时，高亮一律用 `==text==`。
