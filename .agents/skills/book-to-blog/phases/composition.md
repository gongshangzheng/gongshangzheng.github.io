---
name: book-to-blog-composition
description: Phase 4 HTML 撰写。配合 book-to-blog/SKILL.md 使用。
---

# Phase 4 · HTML 撰写

**目标**：用 capture.js 建骨架，逐篇写 frontmatter + 中文正文。进入本阶段前**必须读取** `~/.agents/skills/html-blog/SKILL.md`。

## 4.1 建骨架

每篇文章走 capture.js：

```bash
# 系列文章
node ~/.agents/skills/html-blog/capture.js <slug>-ch01
# Hub 页
node ~/.agents/skills/html-blog/capture.js <slug>-hub --hub
```

禁止徒手写 frontmatter。capture.js 会写入 `created_at`/`updated_at`（写一次后不再改 created_at，编辑后手改 updated_at）。

## 4.2 frontmatter 填写

系列文章：

```yaml
---
title: "美国职业罪犯系列（三）：伪造犯"
description: "Byrnes 1886 年《美国职业罪犯》伪造犯篇：手法讲解 + 该类型罪犯中文转写清单。"
created_at: <capture 自动>
updated_at: <编辑后手改>
aliases: ["categories/读书笔记/美国职业罪犯"]
sub_id: 30
tags: [读书笔记, 美国职业罪犯, 伪造犯, 犯罪史]
papers: []
repos: []
---
```

> **注意**：`hub:` frontmatter 字段已废弃，不要填。Hub 关联通过 Hub 页自身的 `aliases`（`/index` 后缀）与文章的 `chapter-nav` HTML 链接实现。
```

Hub 页：

```yaml
---
title: "《美国职业罪犯》系列总览"
description: "..."
aliases: ["categories/读书笔记/美国职业罪犯/index", "categories/读书笔记/美国职业罪犯"]
sub_id: 0
hero_title: "..."
hero_sub: "..."
hero_tagline: "..."
---
```

## 4.3 正文结构（系列文章）

每个类型/章节篇：

1. 引子：该类型罪犯的定义 + 在原书的位置
2. `## 手法讲解`（`.ch` + `.ch-title`）：转写 Part I 的 Methods 论文
3. `## 罪犯名录`（`.ch` + `.ch-title`）：该类型下所有目录条目，用 `references/entry-format.md` 的统一格式
4. 小结：该类型罪犯的特点归纳
5. `.chapter-nav`：prev / hub / next
6. `.sources`：原书条目

## 4.4 正文组件

- 主章节：`<div class="ch"><div class="ch-label">第 N 类</div><div class="ch-title">标题</div>...`
- 小节：`<h3 class="section-title">` / `<h4 class="ch-section">`，禁止裸 h3/h4
- 人物条目：用 `.info-box` 或统一卡片结构（见 `references/entry-format.md`）
- 表格：人物对比用 `.table-wrap`
- 图片（若嵌入）：`<div class="photo"><img src="media/images/<slug>/xxx.webp" loading="lazy"><div class="cap">说明</div></div>`，WebP，放 `media/images/<slug>/`
- 高亮：`==文字==` 或 `{{< bg yellow >}}文字{{< /bg >}}`

## 4.5 组件语法参考

详细组件语法读取 `~/gongshangzheng.github.io/.agents/skills/blog-syntax/references/html-components.md`。不熟悉的组件先读再写，禁止凭记忆写 HTML。

## 4.6 章节导航

每篇 `.chapter-nav`：
- prev = 系列上一篇
- hub = Hub 页
- next = 下一篇或暂缺

发布后双向更新前后篇的 chapter-nav。

## Gate 条件

进入 Phase 5 前必须满足：

- [ ] 所有文章骨架已由 capture.js 创建
- [ ] frontmatter（title/aliases/sub_id/tags/hub）填写完整
- [ ] 每篇正文写完（方法论 + 名录 + 小结 + sources）
- [ ] 小节标题带 class，图片用 `.photo` 包裹
- [ ] `node build.js` 通过
- [ ] 已创建 todo 并将 Phase 5 设为下一步
