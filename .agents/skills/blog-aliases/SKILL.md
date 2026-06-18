---
name: blog-aliases
description: |
  博客 aliases 字段与 taxonomy 索引页替换的完整规范。
  涵盖：别名搜索、Hub 页替换 category/tag/subcategory index、taxonomy URL 格式、sortable-list/post-graph 短代码、sub_id 排序规则。
  所有涉及 aliases、sub_id、taxonomy index 替换、Hub 页别名的操作必须读取本 skill。
  MANDATORY TRIGGERS: aliases, alias, 别名, sub_id, taxonomy index, Hub 别名, 索引页替换, sortable-list, post-graph
version: 1.0.0
category: blog-taxonomy
tags: [blog, aliases, taxonomy, hub, sub_id, shortcode]
---

# Blog Aliases & Taxonomy Index

> 本文档是 `aliases` 字段、`sub_id` 排序、taxonomy 索引页替换的**唯一事实来源**。
> 从 html-blog SKILL.md §1.7 + §3 中提取，html-blog 不再内联这些规则。

---

## 1. Aliases 基本用法

`aliases` 字段允许为文章设置可搜索的别名，并支持用 Hub 页替换 category/tag 的自动生成索引页。

```yaml
---
title: "1D 视觉分词器综述"
aliases: ["1D-Tokenizer", "TiTok", "离散分词器"]
---
```

**效果**：
- 在搜索框中输入 `1D-Tokenizer`、`TiTok` 或 `离散分词器` 均可找到这篇文章
- 如果 `1D-Tokenizer` 恰好是一个已有的 tag 名，且该文章是 Hub 页，则 `tags/1D-Tokenizer/index.html` 会自动重定向到此 Hub 页

---

## 2. Taxonomy 索引页替换

当 Hub 页设置了与某个 category 或 tag 同名的别名时，构建系统会自动将 taxonomy 索引页内容替换为该 Hub 页。

### 推荐用法

使用完整的 taxonomy 路径作为 alias，更明确且避免歧义：

```yaml
---
title: "图论——枢纽页"
aliases: ["图论", "categories/数学/图论/index"]
categories: ["数学"]
subcategory: "图论"
---
```

构建后：
- `categories/数学/图论/index.html` → 写入 Hub 页内容（自动）
- 搜索 `图论` 仍可找到此文章（别名兼容）

**向后兼容**：仅写短名称如 `aliases: ["图论"]` 仍然有效，但推荐同时加上全路径。

### 适用范围

同理适用于 tag 和 category：
- `aliases: ["tags/Mamba/index"]` → `tags/Mamba/index.html`
- `aliases: ["categories/AI/index"]` → `categories/AI/index.html`
- `aliases: ["categories/课程/机器学习/index"]` → `categories/ke-cheng/ji-qi-xue-xi/index.html`

> ⚠️ **路径用中文原名，非 slug**。构建系统会自动将中文路径转换为 slug。

---

## 3. Taxonomy URL 格式

所有 taxonomy 页使用目录式 URL：

| 类型 | URL 格式 |
|------|----------|
| Tag | `tags/{tag-slug}/index.html` |
| Category | `categories/{cat-slug}/index.html` |
| Subcategory | `categories/{cat-slug}/{subcat-slug}/index.html` |

旧格式 URL（如 `tags/Mamba.html`）自动生成重定向页，保持向后兼容。

---

## 4. 列出 Taxonomy 文章的短代码

在普通页面中，可以使用以下语法列出某个 taxonomy 下的所有文章：

```
{{< sortable-list "categories/AI" >}}
{{< sortable-list "tags/Mamba" >}}
{{< sortable-list "categories/课程/数字信号处理" >}}
```

构建时会自动展开为文章列表，包含日期和链接。

同理，`post-graph` 短代码可展示 taxonomy 下文章的关系图谱：

```
{{< post-graph "categories/数学" >}}
{{< post-graph "tags/图论" >}}
{{< post-graph "categories/数学/图论" >}}
```

---

## 5. sub_id 排序规则

分类 index 页按 `sub_id` **升序**排列（缺失则按创建时间倒序）。

### 分段编号（强制）

同一 `subcategory` 的 `sub_id` 必须按内容类型分段：

| 内容类型 | sub_id 范围 | 说明 |
|---------|------------|------|
| Hub / 总览入口 | `0` | 每个 subcategory 只有一个 |
| 系列章节 / 专题综述 / Survey | `10–999` | 步长 10，按阅读顺序递增 |
| 单篇论文精读 | `1000–1999` | 步长 10 |
| 源码 / 工程实现 / 系统落地 | `2000–2999` | 步长 10 |

**禁止**：不同类型混在同一编号段；使用 100 步长。

### 赋值规范

- 分配前**必须检查**同一 `subcategory` 已有 `sub_id`，禁止重复
- 如有冲突，先修旧文编号、标题编号与 Hub 显示编号

### 系列文章强制要求

- **每篇必须写 `sub_id`**：不写会导致系列在分类页乱序
- **总览篇接管 subcategory index**：给总览篇 frontmatter 加 `aliases: ["<子类别中文名>", "categories/<分类中文名>/<子类别中文名>/index"]`，build 会把总览篇内容写入该 subcategory 的 index 页

示例：
```yaml
---
title: "数字人综述"
aliases: ["数字人", "categories/AI/数字人/index"]
sub_id: 0
categories: ["AI"]
subcategory: "数字人"
---
```

---

## 6. Hub 页别名规范

Hub 页（`src/pages/*-hub.html`）的 `aliases` 应包含：

1. 中文简称（便于搜索）
2. 完整 taxonomy 路径（触发 index 替换）

```yaml
aliases: ["机器学习Hub", "ML Hub", "机器学习课程笔记", "categories/课程/机器学习/index"]
```

发布新文章后，若存在手动维护的专题 Hub 页且新文章 subcategory 匹配，需更新 `chapter-list`、阅读路径、关系图入口或卡片目录，并重新 build。
