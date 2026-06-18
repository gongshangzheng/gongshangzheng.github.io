---
name: subcategory_title_prefix_numbering
description: 同一 subcategory 内同类文章必须使用统一标题前缀和编号，不能只靠 sub_id 排序。
type: feedback
createdAt: 2026-06-08T15:19:26
---
同一 subcategory 内同类文章必须有统一标题前缀和编号，例如区分“系列总览”“专题（一）”“论文精读（一）”“工程解读（一）”。只补 `sub_id` 不够，标题本身也要让读者看出组织结构。

Why: 用户指出图像压缩 subcategory 虽然更新了排序，但文章标题仍然混乱，没有组织成专题，也没有区分论文精读。

How to apply: 整理或新增成体系 subcategory 时，同时维护 frontmatter `title`、Hub 目录显示标题和 `sub_id` 分段；同一专题下的文章使用相同中文前缀和连续编号。
