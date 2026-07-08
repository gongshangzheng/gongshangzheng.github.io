# Phase 7: HUB PAGE — 系列文章枢纽页生成

**目标**：当产出为多篇文章的系列输出（≥2 篇）时，生成一个 Hub 页将所有文章组织在一起。

## 触发条件

- 最终交付为 2 篇及以上独立 HTML 文章
- 文章天然存在阅读顺序（如系列第一篇、第二篇...）

如果产出只有 1 篇文章，跳过此阶段。

## 执行步骤

### 1. 统一分类

检查所有系列文章的 frontmatter，确保：
- 所有文章共享相同的 `subcategory`
- 所有文章共享一组核心 `tags`（至少 2-3 个）
- 每篇文章已有 `sub_id` 字段（用于排序）

### 2. 创建 Hub 页

```bash
cd ~/gongshangzheng.github.io
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <hub-slug> --hub
```

`<hub-slug>` 命名规范：`<topic>-hub`，如 `compression-hub`、`dsp-hub`。

### 3. 填充 Hub 页内容

读取 `~/gongshangzheng.github.io/.agents/skills/html-blog/templates/hub-template.html`，按以下结构填充：

#### Frontmatter

```yaml
---
title: "系列总标题"
description: "一句话描述整个系列"
created_at: YYYY-MM-DDTHH:mm:ss
updated_at: YYYY-MM-DDTHH:mm:ss
tags: [与系列文章共享的 tags]
aliases: ["与系列文章相同的 categories/路径"]
aliases: ["系列别名"]
hero_title: "系列总标题"
hero_sub: "副标题"
hero_tagline: "一句话标语"
---
```

#### 正文结构

1. **引论**（`.ch` 组件）：说明系列的背景、组织逻辑、阅读建议
2. **章节目录**（`chapter-list` 布局）：按 `sub_id` 排序，列出每篇文章：
   ```html
   <li>
     <span class="chapter-num">01</span>
     <span class="chapter-title"><a href="article-slug.html">文章标题</a></span>
     <span class="chapter-status done">✓ 已完成</span>
   </li>
   ```
3. **研究资源索引**（可选）：列出核心参考文献
4. **待完成专题**（可选）：标记计划中但尚未撰写的文章

### 4. 更新系列文章的 frontmatter

在每篇系列文章的 frontmatter 中添加：

```yaml
hub: <hub-slug>
```

### 5. 构建验证

```bash
cd ~/gongshangzheng.github.io && node build.js
```

确认无错误后 git commit + push。

---

## Gate 条件

1. Hub 页已创建且 build.js 通过
2. 所有系列文章的 frontmatter 中已添加 `hub` 字段
3. Hub 页的章节目录包含所有系列文章的链接
4. todo 状态：Phase 7 标记 `completed`
