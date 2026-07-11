---
name: book-to-blog-review
description: Phase 5 三路并行 Review。配合 book-to-blog/SKILL.md 使用。
---

# Phase 5 · 三路并行 Review

**目标**：所有文章写完后，同时派出 3 个 Review subagent，按优先级修复后发布。

## 5.1 同时派出 3 个 Review subagent

| Review Agent | 读取模板 | 职责 |
|---|---|---|
| `review-fidelity` | `subagents/review-fidelity.md` | 保真度：中文转写是否忠于原书，人物/罪名/数字有无误读、夸大、臆造 |
| `review-completeness` | `subagents/review-completeness.md` | 完整性：原书该类型/章节的人是否全覆盖，手法要点是否遗漏 |
| `review-html-format` | `subagents/review-html-format.md` | HTML 规范：frontmatter、组件语法、sub_id、chapter-nav、sources |

派发 prompt 模板：

```
任务：执行保真度审查。
读取模板：~/.agents/skills/book-to-blog/subagents/review-fidelity.md
书名：<title>
Slug：<slug>
原文：~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.clean.txt
HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>-chXX.html
```

## 5.2 必须等全部三路完成

汇总 P0/P1，逐篇修复后才进 Phase 6。

## 5.3 优先级

- **P0**：人物名错译、罪名误判、臆造事实、OCR 残留乱码、frontmatter 缺 sub_id/aliases、build 失败
- **P1**：遗漏次要人物、条目格式不统一、chapter-nav 未双向更新
- **P2**：措辞润色

## Gate 条件

进入 Phase 6 前必须满足：

- [ ] 三路 Review 全部 resolved
- [ ] P0 全部修复
- [ ] `node build.js` 通过
- [ ] `node lib/lint-html.js <每篇>.html` 无错
- [ ] 已创建 todo 并将 Phase 6 设为下一步
