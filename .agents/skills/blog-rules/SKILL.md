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
| `references/pre-generation-search.md` | 生成前库内检索（新建 / 扩充 / 接力草稿的判定） | read-article, academic-research, deep-research |
| `references/openspec-gate.md` | 内容类产出的 OpenSpec 门禁（何时必须建 change、模板位置、审批门禁、豁免清单、路径口径） | read-article, academic-research, deep-research, historical-narrative, book-to-blog, course-notes, github-repo-read |
| `templates/content-change/` | 内容类 change 的 proposal / design / tasks 模板（`design.md` 含审批核心「文章内容大纲」） | 所有内容类 skill 建 change 时 |

## skill 路径口径

引用其他 skill 时，路径 MUST 指到该 skill **实际所在的那棵树**（判据 = 它的 `SKILL.md` 在哪）：

| skill 类型 | 写法 | 例 |
|-----------|------|-----|
| 库内 skill | `~/gongshangzheng.github.io/.agents/skills/<name>/...` | `html-blog`、`read-article`、`blog-rules`、`blog-aliases` |
| 全局工具 skill | `~/.agents/skills/<name>/...` | `web-search`、`docx`、`asu` |
| 仅其他 harness 有的 skill | 指向其所属树，如 `~/.hanako/skills/<name>/...` | `docling`、`org-roam-capture`、`send-email` |

**禁止**在 `~/.agents/skills/` 下建指向库内 skill 的软链接来"兼容"旧路径：既会与库内 skill 撞名（递归发现同名 skill 会告警），也掩盖真问题。

校验：`~/.venv/bin/python3 scripts/check-skill-paths.py`（存在死路径时退出码非 0，已列入发布前验证清单第 9 项）。

## 使用方式

各 skill 在对应阶段读取：

```bash
# 系列文章规划时
cat ~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md

# 配图时
cat ~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md

# 发布时
cat ~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md
```
