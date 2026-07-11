# drafts/ — 待完成博客 brainstorming

这个目录存放**计划但未写/未完成的博客文章**草稿。每个文件是 `YAML frontmatter + markdown`，记录目标位置、进度、状态等。通过 git 管理草稿版本，对照已发布文章判断需要补什么。

## 为什么单独建目录

- `src/pages/*.html` 是**已发布**产物，由 build.js 部署到 gh-pages。
- `drafts/*.md` 是**未发布** brainstorming，不进 build，不部署，但 git 跟踪。
- 这样 git diff 能同时看到"想法演进"和"已发文章改动"，便于判断博客需要回补哪些信息。

## 文件格式

文件名 = `<slug>.md`，slug 与未来发布的 `src/pages/<slug>.html` 一致。

```markdown
---
slug: <slug>
title: "拟定标题（可改）"
type: paper-reading          # paper-reading | survey-chapter | original | hub | translation | course-note
status: idea                 # idea → outlining → drafting → review-ready → published
progress: 10                 # 0-100，主观进度
target_alias: categories/AI/图像压缩/图像压缩论文精读
target_sub_id: auto          # 数字（如 180）或 "auto"（发布前用 check-sub-id.py 分配）
target_hub: image-compression-hub   # 系列枢纽页 slug，非系列文章省略
source_url: https://arxiv.org/abs/XXXX.XXXXX   # 论文/资料来源，非论文省略
tags: [tag1, tag2]           # 3-5 个，与未来 frontmatter 一致
created_at: 2026-07-11T20:00:00
updated_at: 2026-07-11T20:00:00
published_at:                # 空着；发布后填发布时间
published_file:              # 空着；发布后填 src/pages/<slug>.html
---

# Brainstorming

## 核心问题 / 动机
这篇文章要回答什么问题？为什么值得写？

## 预期大纲
- Part 1 ...
- Part 2 ...

## 关键素材
- 论文/链接
- 关键图表
- 需要深挖的点

## TODO
- [ ] 提取原文
- [ ] ...
```

## 状态流转

| 状态 | 含义 | 下一步 |
|---|---|---|
| `idea` | 有个想法 | 补全 title/source_url/大纲 |
| `outlining` | 大纲成型 | 用 `blog-drafts` skill 推进 |
| `drafting` | 正文写作中 | 调用 `read-article`/`html-blog` 写 HTML |
| `review-ready` | HTML 写完待 review | 跑 read-article Phase 6 三路 review |
| `published` | 已发布到 `src/pages/` | 填 `published_at` + `published_file` |

## 用 git 管理版本

```bash
# 看某草稿的 brainstorming 演进
git log -p drafts/<slug>.md

# 对比草稿 brainstorming 与已发布文章，找 gap
git diff drafts/<slug>.md src/pages/<slug>.html   # 格式不同，看 metadata 即可

# 看所有草稿最近改动
git log --oneline -10 -- drafts/
```

草稿的 YAML 改动（如更新大纲、补充素材）应早于已发布文章的对应改动。若 `git diff` 显示草稿里有新素材但 `src/pages/` 里没有，就是博客需要回补的内容——用 `blog-drafts` skill 的 sync 流程定位。

## 操作入口

通过 `blog-drafts` skill（`.claude/skills/blog-drafts/SKILL.md`）管理草稿的 CRUD、状态流转、发布交接。详见该 skill。
