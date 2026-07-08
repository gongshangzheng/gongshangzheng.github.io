# Phase 6: HUB PAGE — 课程笔记枢纽页生成

**目标**：当一次课程笔记产出覆盖多个章节（≥2 篇独立文章）时，生成一个 Hub 页将所有章节组织在一起。

## 触发条件

- 产出为 2 篇及以上独立 HTML 文章（如"第1章""第2章"...）
- 文章天然存在阅读顺序

如果产出只有 1 篇文章，跳过此阶段。

## 执行步骤

### 1. 统一分类

检查所有章节文章的 frontmatter，确保：
- 所有文章共享相同的 `aliases` 分类路径（如 `categories/课程/数字信号处理`）
- 所有文章共享一组核心 `tags`
- 每篇文章已有 `sub_id` 字段（用于排序）

### 2. 创建 Hub 页

```bash
cd ~/gongshangzheng.github.io
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <course>-hub --hub
```

`<course>` 命名规范：课程缩写，如 `dsp`、`info-theory`、`ml`。

### 3. 填充 Hub 页内容

读取 `~/gongshangzheng.github.io/.agents/skills/html-blog/templates/hub-template.html`，使用 `chapter-list` 布局：

#### Frontmatter

```yaml
---
title: "课程名称 · 课程笔记"
description: "课程名称的完整学习笔记系列"
created_at: YYYY-MM-DDTHH:mm:ss
updated_at: YYYY-MM-DDTHH:mm:ss
tags: [与章节文章共享的 tags]
aliases: ["课程别名", "categories/课程/<课程名称>"]
hero_title: "课程名称"
hero_sub: "课程笔记系列"
hero_tagline: "从问题动机到完整推导"
mathjax: true
---
```

#### 正文结构

1. **引论**（`.ch` 组件）：课程简介、笔记组织逻辑、阅读建议
2. **章节目录**（`chapter-list` 布局）：
   ```html
   <li>
     <span class="chapter-num">01</span>
     <span class="chapter-title"><a href="chapter-slug.html">章节标题</a></span>
     <span class="chapter-status done">✓ 已完成</span>
   </li>
   ```
3. **参考资源**（可选）：教材、课件、推荐阅读

### 4. 更新章节文章的 frontmatter

在每篇章节文章的 frontmatter 中添加：

```yaml
hub: <course>-hub
```

### 5. 构建验证

```bash
cd ~/gongshangzheng.github.io && node build.js
```

确认无错误后 git commit + push。

---

## Gate 条件

1. Hub 页已创建且 build.js 通过
2. 所有章节文章的 frontmatter 中已添加 `hub` 字段
3. Hub 页的章节目录包含所有章节文章的链接
4. todo 状态：Phase 6 标记 `completed`
