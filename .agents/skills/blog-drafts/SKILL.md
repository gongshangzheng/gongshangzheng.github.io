---
name: blog-drafts
description: |
  管理待完成博客的 brainstorming 草稿。草稿存放在 `~/gongshangzheng.github.io/drafts/*.md`
  （YAML frontmatter + markdown），记录目标位置、进度、状态。通过 git 跟踪草稿版本，
  对照已发布文章判断需要回补哪些信息。提供 scripts/draft.py 脚本做 new/list/show/set/
  set-all/archive/delete。不直接写 HTML——写正文交给 read-article / html-blog /
  academic-research 等上游 skill。草稿目录不进 build.js，不部署到 gh-pages。
version: 1.1.0
category: blog-workflow
tags: [blog, drafts, brainstorming, planning]
---

## Python 环境

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

不要使用裸 `python`、`python3`、`pip` 或 `pip3`。

---

# blog-drafts — 博客草稿管理

**草稿是"想法的版本"，已发布文章是"想法的落地产物"。** git 同时跟踪两者，可从草稿演进反推
博客需要回补的内容。

```
drafts/<slug>.md   (brainstorming，YAML+md，git 跟踪，不部署)
       │  status: idea → outlining → drafting → review-ready → published
       ▼
src/pages/<slug>.html  (已发布，build 部署到 gh-pages)
```

`drafts/` 不进 build.js（build 只读 `src/pages/`），不部署。`drafts/` 未被 gitignore，git 跟踪。

## 模板

模板在 `.agents/skills/blog-drafts/templates/`（不在 `drafts/` 里），每种风格各有 `.org` 和 `.md` 两版：

| 模板 | 风格 | 用途 |
|---|---|---|
| `brainstorm.org` / `brainstorm.md` | **默认**，几乎空白（frontmatter + 标题 + 空白正文） | 自由 brainstorming，不限制思考 |
| `plan.org` / `plan.md` | 详细分节（核心问题/大纲/关键素材/TODO） | 规划文章结构 |

**两种格式**：
- `.org`（**默认**）：用 `#+TITLE:` / `#+SLUG:` 等 `#+` 属性行做 frontmatter，正文是 org（`*` 标题、`**` 子节）。
- `.md`：用 YAML `---` frontmatter，正文是 markdown（`#` 标题、`##` 子节）。
- 脚本自动按扩展名解析对应 frontmatter 格式；`list/show/set/archive` 等都能混合处理 `.org` 和 `.md`。

> **设计理念**：brainstorm 模板刻意几乎空白——草稿正文由**用户自己写**，模板只提供 frontmatter
> 骨架，不预设章节结构以免限制思考。需要结构化规划时用 `plan` 模板。

## 管理脚本 `scripts/draft.py`

所有草稿操作走脚本：

```bash
# 新建草稿（默认 org 格式 + brainstorm 模板）
~/.venv/bin/python3 scripts/draft.py new <slug> [--title T] [--type T] [--alias A] [--pin] [--source URL] [--tags t1,t2] [--template brainstorm|plan] [--format org|md]

# 列出草稿（默认显示 slug,status,progress,pin,title；可指定字段；可按 status 过滤）
~/.venv/bin/python3 scripts/draft.py list [fields] [--status S]
~/.venv/bin/python3 scripts/draft.py list status,pin,tags
~/.venv/bin/python3 scripts/draft.py list --status idea

# 查看单个草稿
~/.venv/bin/python3 scripts/draft.py show <slug>

# 修改单个草稿的 YAML 字段（可一次多个 field=value）
~/.venv/bin/python3 scripts/draft.py set <slug> status=outlining progress=20
~/.venv/bin/python3 scripts/draft.py set <slug> tags=学习,费曼,记忆
~/.venv/bin/python3 scripts/draft.py set <slug> pin=true

# 批量修改所有草稿（可按 status 过滤）
~/.venv/bin/python3 scripts/draft.py set-all status=archived --status review-ready

# 归档（移到 drafts/archive/，标 status=archived）/ 恢复
~/.venv/bin/python3 scripts/draft.py archive <slug>
~/.venv/bin/python3 scripts/draft.py unarchive <slug>

# 删除（默认询问确认，-y 跳过）
~/.venv/bin/python3 scripts/draft.py delete <slug> [-y]

# 事实性核查（打印草稿 + 启发式提取候选事实陈述，供 agent 核查）
~/.venv/bin/python3 scripts/draft.py factcheck <slug>
```

## 事实性核查（factcheck）

对草稿里的事实性陈述做核查，参考 read-article 的 `review-fidelity` 思路（P0/P1/P2 分级、回权威来源
核查），但对象是用户 brainstorming 草稿——可能含学习中的误解，所以要区分"事实陈述"与"个人笔记/疑问"。

**流程**：

1. 跑 `~/.venv/bin/python3 scripts/draft.py factcheck <slug>`——打印草稿全文 + 启发式提取的候选事实
   陈述（含数字/URL/定义动词"是/为/叫做"等的行）。
2. 派 **factcheck subagent**（模板 `subagents/factcheck.md`）：
   - 逐句区分：事实陈述（定义/数值/归属/时间线/引用）需核查；个人笔记/观点/TODO 疑问跳过。
   - 对每条事实陈述用 web_search 查权威来源（arXiv / 官方文档 / 教科书 / Wikipedia）核对。
   - 分级 P0（错误）/ P1（不精确）/ P2（可改进）/ ✅正确 / 未核实。
   - 报告按 P0→P1→P2→未核实 顺序，每条附原文+结果+来源 URL+修复建议。
3. 默认在对话里报告（不污染 drafts/）；用户要存档再写 `drafts/<slug>.factcheck.md`。
4. **不自动改草稿**——用户看完报告自己决定改不改（草稿正文由用户写）。

触发场景："核查这篇草稿的事实"/"这篇草稿有没有写错"/"factcheck <slug>"。

`set` 的 value 规则：标量直接写；`tags` 用逗号分隔（脚本转成 `[a, b, c]`）；`pin` 用 `true`/`false`。
脚本每次修改会自动更新 `updated_at`。

## YAML 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `slug` | ✅ | 与未来 `src/pages/<slug>.html` 一致 |
| `title` | ✅ | 拟定标题，可随时改 |
| `type` | ✅ | `paper-reading` / `survey-chapter` / `original` / `hub` / `translation` / `course-note` |
| `status` | ✅ | `idea` → `outlining` → `drafting` → `review-ready` → `published` |
| `progress` | ✅ | 0-100 |
| `target_alias` | ✅ | 目标分类路径（从 blog-categories skill 选） |
| `target_sub_id` | ✅ | 数字或 `auto`（发布前用 `scripts/check-sub-id.py --category <关键词>` 分配） |
| `target_hub` | 系列 ✅ | 系列枢纽页 slug，独立文章省略 |
| `pin` | 可选 | `true`/`false`，发布后是否首页 Pinned 置顶（对应 html-blog 的 `pin` 字段） |
| `source_url` | 可选 | 论文/资料来源链接（arXiv/DOI）。非正式资料也可放正文末尾"参考资料"节 |
| `tags` | ✅ | 3-5 个，与未来 frontmatter 一致 |
| `created_at` / `updated_at` | ✅ | ISO 时间戳，精确到秒 |
| `published_at` / `published_file` | 发布后 ✅ | 发布时间 / `src/pages/<slug>.html` |

frontmatter 之后是 markdown brainstorming——**由用户自己写**。参考资料放正文末尾"参考资料"节。

## 状态流转

| 状态 | 含义 |
|---|---|
| `idea` | 有个想法，brainstorm 中 |
| `outlining` | 大纲成型 |
| `drafting` | 正文写作中（交给上游 skill） |
| `review-ready` | HTML 写完待 review |
| `published` | 已发布到 `src/pages/`（回填 `published_at` + `published_file`） |
| `archived` | 归档（`drafts/archive/`），不删，保留 brainstorming 史 |

## 发布交接

草稿只管 brainstorming。写正文时按 `type` 交接给上游 skill：

| type | 写正文的 skill |
|---|---|
| `paper-reading` | read-article |
| `survey-chapter` / `original` | html-blog |
| `translation` | book-to-blog |
| `course-note` | course-notes |

交接时传草稿的 `slug` / `target_alias` / `target_sub_id` / `tags` / `pin` / `target_hub` / `source_url`
作为 frontmatter 输入。上游 skill 写完 `src/pages/<slug>.html` 后回填草稿：

```bash
~/.venv/bin/python3 scripts/draft.py set <slug> status=published progress=100 \
  published_at=<时间> published_file=src/pages/<slug>.html
```

草稿保留在 `drafts/` 作 brainstorming 归档，不删。

## git 版本管理 → gap 分析

```bash
git log -p drafts/<slug>.md          # brainstorming 演进史
git log -1 --format=%ci drafts/<slug>.md     # 草稿最近改动时间
git log -1 --format=%ci src/pages/<slug>.html  # 文章最近改动时间
# 草稿比文章新 → 有 brainstorming 没落到文章 → gap
```

## 触发场景

- "我想写一篇关于 XX 的博客" / "记个博客 idea" → `draft.py new`
- "看看我有哪些待写的博客" / "草稿列表" → `draft.py list`
- "更新这篇草稿的状态/进度" / "标记为已发布" → `draft.py set`
- "归档/删除这个草稿" → `draft.py archive` / `delete`
- "brainstorm" / "draft" / "待写" → 本 skill

## 强制要求

- 草稿操作只用 `scripts/draft.py`，不手动编辑 frontmatter（避免时间戳/格式漂移）。
- brainstorm 模板保持几乎空白——不预设章节限制用户思考。
- 草稿正文由用户写，skill 不代写。
- `drafts/_template.md` 已废弃（移到 skill 文件夹 templates/），不要再创建。
- 发布后不删草稿，保留作归档。
