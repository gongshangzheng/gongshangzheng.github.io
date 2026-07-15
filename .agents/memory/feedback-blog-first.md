---
name: feedback-blog-first
description: 在仓库内被问知识性/技术性问题时，必须先用 blog-search 先查库内已有文章和草稿，不要直接上网搜
metadata:
  type: feedback
---

当用户在此仓库（gongshangzheng.github.io）内提问任何知识性问题（"XX 怎么实现"、"XX 原理"、"XX 用途"、"XX 哪个方法最好"），不要直接 WebSearch / WebFetch / 凭记忆回答，必须先用 `blog-search` skill 在 `src/pages/`、`drafts/`、`public/search-index.json` 里检索。

**Why:** 库里经常已有专题级深度分析文章，答案（甚至更准确、更深）已经写好；跳过检索直接外搜会浪费用户时间、给出脱离上下文且不一致的回答。典型案例：用户问"现有的轮廓提取方法里哪个能做到实时、准确、时间连续"，库里已有一篇 `video-contour-extraction-survey.html` Hub + 三篇论文精读（SAM 2、RVM、Track Anything）——直接给出现成答案，远胜于上网搜通用信息。

**How to apply:**
1. 拿到任何知识性提问后，先调用 `blog-search` skill（`Skill` 工具），按关键词 / tag / 分类路径搜。
2. 命中已发布文章 → 直接 `Read` 源文件，基于库内内容回答。
3. 命中草稿（`drafts/*.org` 或 `*.md`）→ 也读草稿——可能是 brainstorming 雏形。
4. 库内确实没有 → 才外搜，并明确告知"库内未找到相关内容，补充搜索网络"。
5. 这个流程是仓库级硬性约定，不因问题看起来"很通用"而跳过。

**记住这条的触发场景：** 用户在仓库内的提问 ≠ 通用知识问题；它是"对个人博客知识库的提问"。相关记忆 [[reference-video-contour-survey]]。
