# drafts/ — 待完成博客 brainstorming

存放**计划但未写/未完成**的博客草稿。每个文件 `YAML frontmatter + markdown`，git 跟踪，不进 build/不部署。
通过 git 跟踪草稿版本，对照已发布文章判断需要回补哪些信息。

## 模板

模板在 `.agents/skills/blog-drafts/templates/`，每种风格各有 `.org` 和 `.md` 两版：

| 模板 | 风格 | 用途 |
|---|---|---|
| `brainstorm.org` / `brainstorm.md` | 几乎空白（frontmatter + 标题 + 空白正文） | **默认**，自由 brainstorming |
| `plan.org` / `plan.md` | 详细分节（核心问题/大纲/关键素材/TODO） | 规划文章结构 |

两种格式：`.org`（**默认**，`#+` 属性行 + org 正文）、`.md`（YAML `---` frontmatter + markdown 正文）。脚本按扩展名自动解析对应格式，所有命令混合处理两种文件。

```bash
# 默认 org 格式 + brainstorm 模板
~/.venv/bin/python3 scripts/draft.py new <slug> --title "标题"

# 明确用 md
~/.venv/bin/python3 scripts/draft.py new <slug> --title "标题" --format md

# 用详细 plan 模板
~/.venv/bin/python3 scripts/draft.py new <slug> --title "标题" --template plan
```

## 管理脚本 `scripts/draft.py`

```bash
~/.venv/bin/python3 scripts/draft.py new <slug> [--title T] [--type T] [--alias A] [--pin] [--source URL] [--tags t1,t2] [--template brainstorm|plan] [--format org|md]
~/.venv/bin/python3 scripts/draft.py list [fields] [--status S]      # 默认显示 slug,status,progress,pin,title
~/.venv/bin/python3 scripts/draft.py show <slug>
~/.venv/bin/python3 scripts/draft.py set <slug> field=value [field=value ...]
~/.venv/bin/python3 scripts/draft.py set-all field=value [--status S]  # 批量
~/.venv/bin/python3 scripts/draft.py archive <slug>                  # 移到 drafts/archive/，标 status=archived
~/.venv/bin/python3 scripts/draft.py unarchive <slug>
~/.venv/bin/python3 scripts/draft.py delete <slug> [-y]
~/.venv/bin/python3 scripts/draft.py factcheck <slug>                # 打印草稿 + 候选事实陈述
```

## YAML 字段

| 字段 | 说明 |
|---|---|
| `slug` | 与未来 `src/pages/<slug>.html` 一致 |
| `title` / `type` / `status` / `progress` | 标题 / 类型 / 状态(idea→outlining→drafting→review-ready→published) / 进度 0-100 |
| `target_alias` | 目标分类路径，如 `categories/杂识` |
| `target_sub_id` | 数字或 `auto`（发布前用 `scripts/check-sub-id.py` 分配） |
| `target_hub` | 系列枢纽页 slug，非系列省略 |
| `pin` | `true`/`false`，发布后是否首页 Pinned 置顶 |
| `source_url` | 论文/资料来源链接 |
| `tags` | 3-5 个 |
| `created_at` / `updated_at` | ISO 时间戳 |
| `published_at` / `published_file` | 发布后回填 |

## 写正文 → 发布

草稿只管 brainstorming。写正文时按 `type` 交接给上游 skill：paper-reading→read-article，original/survey→html-blog，translation→book-to-blog，course-note→course-notes。发布后回填草稿 `published_at`/`published_file`，`status: published`。

详见 `.agents/skills/blog-drafts/SKILL.md`。
