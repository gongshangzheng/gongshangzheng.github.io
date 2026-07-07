---
name: blog-aliases
description: |
  aliases 字段、sub_id 排序、taxonomy 索引页替换、Hub 页别名、sortable-list/post-graph 短代码。
  MANDATORY TRIGGERS: aliases, alias, 别名, sub_id, taxonomy index, Hub 别名, 索引页替换, sortable-list, post-graph
version: 2.0.0
category: blog-taxonomy
tags: [blog, aliases, taxonomy, hub, sub_id, shortcode]
---

# Blog Aliases & Taxonomy Index

> 本文档是 `aliases`、`sub_id`、taxonomy 索引页替换的唯一事实来源。
> Subcategory 描述、谱段划分和编号规则见 `blog-categories/references/subcategory-organization.md`（分配 sub_id 时按需读取）。

---

## 1. Aliases 基本用法

`aliases` 字段为文章设置可搜索别名，并支持 Hub 页替换 taxonomy 索引页。

```yaml
---
title: "1D 视觉分词器综述"
aliases: ["1D-Tokenizer", "TiTok", "离散分词器"]
---
```

**效果**：搜索框输入任一别名均可找到文章；若别名恰好是已有 tag 名且文章为 Hub，则 taxonomy 索引页自动替换。

---

## 2. Taxonomy 索引页替换

Hub 页设置与 category/tag 同名的别名时，构建系统自动替换 taxonomy 索引页。

**推荐用法**（完整 taxonomy 路径，避免歧义）：

```yaml
---
title: "图论——枢纽页"
aliases: ["图论", "categories/数学/图论/index", "categories/数学/图论"]
sub_id: 0
---
```

> ⚠️ **路径用中文原名，非 slug**。构建系统自动转换。

同理适用于 tag：`aliases: ["tags/Mamba/index"]`。

---

## 3. Taxonomy URL 格式

| 类型 | URL 格式 |
|------|----------|
| Tag | `tags/{tag-slug}/index.html` |
| Category (top) | `categories/{cat-slug}/index.html` |
| Subcategory | `categories/{cat-slug}/{sub-slug}/index.html` |
| Deep path | `categories/{slug1}/{slug2}/{slug3}/index.html` |

旧格式 URL 自动生成重定向页。

---

## 4. 短代码

```
{{< sortable-list "categories/AI" >}}
{{< sortable-list "tags/Mamba" >}}
{{< post-graph "categories/数学" >}}
```

构建时自动展开为文章列表 / 关系图谱。

---

## 5. sub_id 排序规则

分类 index 页按 `sub_id` **升序**排列（缺失则按创建时间倒序）。

### 同级编号体系（当前）

所有深层路径使用同级编号：每个深层路径内独立从 10 开始，步长 10。

| 内容类型 | sub_id | 说明 |
|---------|--------|------|
| Hub / 总览入口 | `0` | 替换分类索引页 |
| 系列章节 / 正文 | `10, 20, 30...` | 同级路径内从 10 开始 |
| 同路径多谱段 | 正文 `10–90`，精读 `100+` | 同一 3 级路径下用 sub_id 段区分 |

**步长统一为 10**，无例外。不同同级路径的 sub_id 互不影响。

> ⚠️ 旧编号体系（跨系列分段：1000-1999、2000-2999、3000-3999）已废弃，所有文章已迁移到深层路径 + 同级编号。详见 `blog-categories/references/subcategory-organization.md`。

### 禁止

- ❌ 步长 ≠ 10（包括 100、50、5）
- ❌ 使用旧分段编号（1000-1999、2000-2999、3000-3999 等）

### 赋值规范

- 分配前**必须检查**同 subcategory 已有 sub_id（见 `blog-categories/references/subcategory-organization.md` 已发布文章清单）
- 如有冲突，先修旧文编号

### 系列文章强制要求

- **每篇必须写 `sub_id`**
- **总览篇接管 subcategory index**：

```yaml
aliases: ["数字人", "categories/AI/数字人/index", "categories/AI/数字人"]
sub_id: 0
```

---

## 6. Hub 页别名规范

Hub 页 `aliases` 应包含中文简称 + 完整 taxonomy 路径：

```yaml
aliases: ["机器学习Hub", "categories/课程/机器学习/index"]
```

发布新文章后需更新 Hub 的 `chapter-list`、阅读路径并重新 build。
