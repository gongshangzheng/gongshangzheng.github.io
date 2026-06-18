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
> Subcategory 分布数据和开谱段示例见 `references/subcategory-structure.md`（分配 sub_id 时按需读取）。

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
aliases: ["图论", "categories/数学/图论/index"]
categories: ["数学"]
subcategory: "图论"
---
```

> ⚠️ **路径用中文原名，非 slug**。构建系统自动转换。

同理适用于 tag：`aliases: ["tags/Mamba/index"]`。

---

## 3. Taxonomy URL 格式

| 类型 | URL 格式 |
|------|----------|
| Tag | `tags/{tag-slug}/index.html` |
| Category | `categories/{cat-slug}/index.html` |
| Subcategory | `categories/{cat-slug}/{subcat-slug}/index.html` |

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

### 分段编号（强制）

| 内容类型 | sub_id 范围 | 步长 |
|---------|------------|------|
| Hub / 总览入口 | `0` | — |
| 系列章节 / 专题综述 | `10–999` | **10** |
| 单篇论文精读 | `1000–1999` | **10** |
| 源码 / 工程实现 | `2000–2999` | **10** |
| 新内容类型（子系列） | `3000`, `4000`, `5000`... | **10** |

**步长统一为 10**，无例外。每种新内容类型开一个新谱段（1000 的整数倍入口），谱段内部步长 10。

### 谱段内部结构

每个新谱段内部按以下偏移分配：

| 子类型 | 偏移 | 示例（入口 3000） |
|--------|------|-------------------|
| Hub | +0 | 3000 |
| 正文 | +100, +110, +120... | 3100, 3110, 3120 |
| 精读 | +500, +510, +520... | 3500, 3510, 3520 |

### 禁止

- ❌ 步长 ≠ 10（包括 100、50、5）
- ❌ 不同类型混在同一编号段
- ❌ 子系列 Hub 不用整千入口编号

### 赋值规范

- 分配前**必须检查**同 subcategory 已有 sub_id（见 `references/subcategory-structure.md` §1）
- 如有冲突，先修旧文编号

### 系列文章强制要求

- **每篇必须写 `sub_id`**
- **总览篇接管 subcategory index**：

```yaml
aliases: ["数字人", "categories/AI/数字人/index"]
sub_id: 0
```

---

## 6. Hub 页别名规范

Hub 页 `aliases` 应包含中文简称 + 完整 taxonomy 路径：

```yaml
aliases: ["机器学习Hub", "categories/课程/机器学习/index"]
```

发布新文章后需更新 Hub 的 `chapter-list`、阅读路径并重新 build。
