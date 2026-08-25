---
name: blog-drafts
description: |
  管理待完成博客的 brainstorming 草稿。草稿存放在 `~/gongshangzheng.github.io/drafts/`（.org 为默认格式，
  .md 可选），frontmatter + 正文，记录目标位置、进度、状态。通过 git 跟踪草稿版本，
  对照已发布文章判断需要回补哪些信息。脚本在 `.agents/skills/blog-drafts/scripts/`（draft.py 做
  new/list/show/set/set-all/archive/delete/factcheck，draft-convert.py 做 md↔org 互转）。
  不直接写 HTML——写正文交给 read-article / html-blog / academic-research 等上游 skill。
  草稿目录不进 build.js，不部署到 gh-pages。
version: 1.2.0
category: blog-workflow
tags: [blog, drafts, brainstorming, planning]
---

## Python 环境

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

不要使用裸 `python`、`python3`、`pip` 或 `pip3`。

## 脚本位置

本 skill 的脚本在 `.agents/skills/blog-drafts/scripts/`（仓库根相对路径），**不在仓库根 `scripts/` 下**。
下文所有命令都假设从仓库根目录（`~/gongshangzheng.github.io`）执行：

```bash
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py list
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft-convert.py <slug> --to md
```

> 仓库根 `scripts/` 是站点级脚本（check-sub-id.py、convert-figures.py 等），与草稿管理无关。
> 旧的 `scripts/draft-convert.py`（pandoc 版）已删除，由 skill 目录的纯 Python 版取代。

---

# blog-drafts — 博客草稿管理

**草稿是"想法的版本"，已发布文章是"想法的落地产物"。** git 同时跟踪两者，可从草稿演进反推
博客需要回补的内容。

```
drafts/<slug>.org  (brainstorming，#+frontmatter+org，git 跟踪，不部署；默认格式)
                   (或 <slug>.md，YAML+markdown，显式 --format md 时生成)
       │  status: idea → outlining → drafting → review-ready → published
       ▼
src/pages/<slug>.html  (已发布，build 部署到 gh-pages)
```

`drafts/` 不进 build.js（build 只读 `src/pages/`），不部署。`drafts/` 未被 gitignore，git 跟踪。

## 资产文件夹

草稿用到的图片等资产放 `drafts/assets/<slug>/`（每个草稿一个子目录，git 跟踪）：

```
drafts/
├── model-training.md
├── assets/model-training/initialization.png
```

- 草稿正文用相对路径引用：.md 用 `![描述](assets/<slug>/<file>.png)`；.org 用 `[[file:assets/<slug>/<file>.png]]`。
- 草稿发布（交接给 html-blog）时，资产移到 `media/images/<slug>/` 并转 webp，HTML 用 `<div class="photo">` 包裹。
- 大图建议先压缩再放（参考 `scripts/convert-figures.py`）。

## 模板

模板在 `.agents/skills/blog-drafts/templates/`（不在 `drafts/` 里），每种风格各有 `.org` 和 `.md` 两版：

| 模板 | 风格 | 用途 |
|---|---|---|
| `brainstorm.org` / `brainstorm.md` | **默认**，几乎空白（frontmatter + 标题 + 空白正文） | 自由 brainstorming，不限制思考 |
| `plan.org` / `plan.md` | 详细分节（核心问题/大纲/关键素材/TODO） | 规划文章结构 |
| `paper-note.org` / `paper-note.md` | 论文快读结构（问题/贡献/模型/训练/实验/总结） | 快速读完一篇论文，记下核心要点，不写 HTML |

**两种格式**：
- `.org`（**默认，`draft.py new` 不加 `--format` 时生成 org**）：用 `#+TITLE:` / `#+SLUG:` 等 `#+` 属性行做 frontmatter，正文是 org（`*` 标题、`**` 子节）。
- `.md`：用 YAML `---` frontmatter，正文是 markdown（`#` 标题、`##` 子节），需显式 `--format md`。
- 脚本自动按扩展名解析对应 frontmatter 格式；`list/show/set/archive` 等都能混合处理 `.org` 和 `.md`。
- **格式互转**：`draft-convert.py <slug> --to org|md [--replace] [--dry-run]`，纯 Python 无 pandoc 依赖，详见下文「格式互转」。

> **设计理念**：brainstorm 模板刻意几乎空白——草稿正文由**用户自己写**，模板只提供 frontmatter
> 骨架，不预设章节结构以免限制思考。需要结构化规划时用 `plan` 模板。

## 管理脚本 `draft.py`

所有草稿操作走脚本：

```bash
# 新建草稿（默认 org 格式 + brainstorm 模板）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py new <slug> [--title T] [--type T] [--alias A] [--pin] [--source URL] [--tags t1,t2] [--template brainstorm|plan] [--format org|md]

# 列出草稿（默认显示 slug,status,progress,pin,title；可指定字段；可按 status 过滤）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py list [fields] [--status S]
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py list status,pin,tags
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py list --status idea

# 查看单个草稿
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py show <slug>

# 修改单个草稿的 YAML 字段（可一次多个 field=value）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py set <slug> status=outlining progress=20
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py set <slug> tags=学习,费曼,记忆
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py set <slug> pin=true

# 批量修改所有草稿（可按 status 过滤）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py set-all status=archived --status review-ready

# 归档（移到 drafts/archive/，标 status=archived）/ 恢复
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py archive <slug>
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py unarchive <slug>

# 删除（默认询问确认，-y 跳过）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py delete <slug> [-y]

# 事实性核查（打印草稿 + 启发式提取候选事实陈述，供 agent 核查）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py factcheck <slug>
```

## 格式互转 `draft-convert.py`

md ↔ org 互转，**纯 Python 实现，无 pandoc 依赖**（脚本：`.agents/skills/blog-drafts/scripts/draft-convert.py`）：

```bash
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft-convert.py <slug> --to org      # .md → .org
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft-convert.py <slug> --to md       # .org → .md
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft-convert.py <slug> --to md --dry-run   # 只看结果不写文件
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft-convert.py <slug> --to md --replace    # 转完删源文件
```

**行为**：
- frontmatter 在 YAML（`---` 块）↔ `#+KEY:` 属性行之间转换，字段完整保留、顺序规范化，`updated_at` 自动刷新。
- 资产路径（`assets/<slug>/...`）不变，两边共享。
- 默认保留源文件（两格式并存时 `find_draft` 按 `.org` → `.md` 顺序查找）；目标文件已存在则拒绝覆盖。
- 转换是**语句子集**，够用于 brainstorming 草稿，不是完整 markdown/org 解析器：

| 语法 | markdown | org |
|---|---|---|
| 标题 | `#` / `##` / `###` | `*` / `**` / `***` |
| 代码块 | ` ```lang ` | `#+BEGIN_SRC lang` / `#+END_SRC` |
| 图片 | `![alt](path)` | `[[file:path]]`（org 无 alt 槽位，alt 丢失） |
| 链接 | `[text](url)` | `[[url][text]]` |
| 加粗/斜体/行内代码 | `**b**` / `*i*` / `` `c` `` | `*b*` / `/i/` / `~c~` |

- 不转换的语法（列表、引用、表格、数学公式等）原样保留——草稿场景下两边都可作为纯文本读。

## 事实性核查（factcheck）

对草稿里的事实性陈述做核查，参考 read-article 的 `review-fidelity` 思路（P0/P1/P2 分级、回权威来源
核查），但对象是用户 brainstorming 草稿——可能含学习中的误解，所以要区分"事实陈述"与"个人笔记/疑问"。

**流程**：

1. 跑 `~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py factcheck <slug>`——打印草稿全文 + 启发式提取的候选事实
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
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py set <slug> status=published progress=100 \
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
- "快速读这篇论文/记论文笔记" + arXiv URL → **paper-note 流程**（见下文）

## paper-note：论文快读草稿

用 `paper-note` 模板快速记录一篇论文的核心要点，不写 HTML，不做多 subagent 分析。

详细流程见 `subagents/paper-note.md`。一句话总结：

```bash
# 1. 提取论文（tarball + 图片 + TeX→Markdown）
cd ~/gongshangzheng.github.io
PYTHONUTF8=1 .cache/read-article/.venv/bin/python \
  .agents/skills/read-article/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>

# 2. 复制图片到草稿 assets
mkdir -p drafts/assets/<slug>
cp media/images/<slug>/*.webp drafts/assets/<slug>/

# 3. 新建草稿（paper-note 模板）
~/.venv/bin/python3 .agents/skills/blog-drafts/scripts/draft.py new <slug> \
  --title "<标题>" --type paper-reading --template paper-note --format md \
  --source "https://arxiv.org/abs/<id>" --tags "<tag1,tag2,tag3>"

# 4. 读 raw/<slug>/sources/<slug>.md，填写草稿各节（Qoder 完成）
```

与 `read-article` 的区别：

| | paper-note | read-article |
|---|---|---|
| 目标 | 快速记笔记 | 发布深度解读 HTML |
| subagents | 无（单次） | 4 + 写作 + 3 review |
| 产出 | `drafts/<slug>.md` | `src/pages/<slug>.html` |
| 图片 | `drafts/assets/<slug>/` | `media/images/<slug>/` |
| 后续 | 可升级为 read-article | — |

## 强制要求

- **新建草稿默认生成 org 格式**（`draft.py new` 的 `--format` 默认 `org`）；需要 markdown 时必须显式 `--format md`，不要凭"已有草稿恰好是 md"就跟着建 md。
- 草稿操作只用 `draft.py` / `draft-convert.py`，不手动编辑 frontmatter（避免时间戳/格式漂移）。
- brainstorm 模板保持几乎空白——不预设章节限制用户思考。
- 草稿正文由用户写，skill 不代写。**例外：paper-note 模板**——Qoder 读论文后填写各节，不需要用户手写。
- `drafts/_template.md` 已废弃（移到 skill 文件夹 templates/），不要再创建。
- 发布后不删草稿，保留作归档。
