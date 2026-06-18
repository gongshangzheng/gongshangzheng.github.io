# Slide 编译器

在 `src/pages/*.html` 的 YAML frontmatter 中加上 `slide: true`，构建系统会自动识别为**独立幻灯片**，跳过文章模板包装，直接输出完整 HTML 到 `public/`。

## 用法

```yaml
---
title: 标题
description: 描述
created_at: 2026-06-02T11:00:00
updated_at: 2026-06-02T11:00:00
tags: [Slide]
slide: true                    # ← 识别为独立幻灯片，直接输出
excluded: true                 # ← 可选：不出现在文章列表/搜索/RSS 中
slide_assets:                  # ← 可选：需要复制的独立资源
  - assets/diagram.png
  - assets/profile.jpg
---
<!DOCTYPE html>
<html>
... 完整的幻灯片 HTML ...
</html>
```

## 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `slide: true` | ✅ | 标记此文件为独立幻灯片，跳过模板包装，直接输出完整 HTML |
| `title` | 推荐 | 页面标题 |
| `excluded: true` | 可选 | 不出现在文章列表、搜索索引、分类、标签、RSS 中 |
| `slide_assets` | 可选 | 需要额外复制到 `public/slides/<slug>-assets/` 的文件（相对于 `src/pages/`） |

## 规则

- 如果正文是完整 HTML 文档（含 `<!DOCTYPE html>` 或 `<html>...</html>`），直接输出
- 如果不是完整文档，自动包裹基本 HTML 骨架
- `slide: true` **不影响**是否出现在文章列表中——除非同时设置 `excluded: true`
- **不会**被 `buildArticles()` 的模板系统包装（无 header/sidebar/footer）

## 示例

参见 `src/pages/intro-2026.html`（郑鑫裕入职自我介绍幻灯片）。
