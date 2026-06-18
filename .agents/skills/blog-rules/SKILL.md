---
name: blog-rules
description: |
  博客系列文章规则、配图优先级、发布流程的共享引用源。
  本 skill 不被直接触发，只被 content-creator / read-article / academic-research / deep-research
  在需要时读取其 references/ 下的文件。
---

# Blog Rules — 共享引用

本 skill 存放博客写作的跨 skill 共享规则。各 skill 在需要时读取对应引用文件，而不是各自内联副本。

## 引用文件索引

| 文件 | 内容 | 被谁引用 |
|------|------|---------|
| `references/series-rules.md` | 系列文章 sub_id、Hub 页、编号、跨篇连续性 | read-article, academic-research, deep-research, content-creator |
| `references/image-priority.md` | 配图来源优先级、arXiv 图片提取、HTML 格式 | read-article, academic-research, deep-research |
| `references/publishing.md` | build.js + git push 发布流程、邮件通知、发布前验证 | read-article, academic-research, deep-research |

## 使用方式

各 skill 在对应阶段读取：

```bash
# 系列文章规划时
cat ~/.agents/skills/blog-rules/references/series-rules.md

# 配图时
cat ~/.agents/skills/blog-rules/references/image-priority.md

# 发布时
cat ~/.agents/skills/blog-rules/references/publishing.md
```
