---
name: blog-drafts
description: |
  管理待完成博客的 brainstorming 草稿。草稿存放在 `~/gongshangzheng.github.io/drafts/*.md`
  （YAML frontmatter + markdown），记录目标位置、进度、状态。通过 git 跟踪草稿版本，
  对照已发布文章判断需要回补哪些信息。支持新建/列表/更新/发布交接/同步 gap 分析。
  不直接写 HTML——写正文交给 read-article / html-blog / academic-research 等上游 skill。
  草稿目录不进 build.js，不会被部署到 gh-pages。
version: 1.0.0
category: blog-workflow
tags: [blog, drafts, brainstorming, planning]
documentation: |
  本 skill 是草稿生命周期的管理者。它不写博客正文，只管草稿元信息 + brainstorming 内容
  + 与已发布文章的 gap 分析。写正文时，根据草稿 type 交给对应 skill：
  - paper-reading → read-article
  - survey-chapter / original → html-blog / academic-research
  - translation → book-to-blog
  - course-note → course-notes
  发布后回填草稿的 published_at / published_file，并标 status: published。
---

## Python 环境

需要运行 Python 脚本时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

不要使用裸 `python`、`python3`、`pip` 或 `pip3`。

---

# blog-drafts — 博客草稿管理

## 核心理念

**草稿是"想法的版本"，已发布文章是"想法的落地产物"。** 通过 git 同时跟踪两者，可以从草稿演进
反推博客需要回补的内容。

```
drafts/<slug>.md   (brainstorming，YAML+md，git 跟踪，不部署)
       │
       ▼  status: drafting → review-ready → published
       │
src/pages/<slug>.html  (已发布，build 部署到 gh-pages)
```

草稿目录 `~/gongshangzheng.github.io/drafts/`：
- **不进 build.js**（build 只读 `src/pages/`），不会被部署。
- **git 跟踪**（`drafts/` 未被 .gitignore）。
- 每个草稿一个 `<slug>.md`，slug 与未来发布的 `src/pages/<slug>.html` 一致。

## 草稿文件格式

见 `drafts/_template.md` 与 `drafts/README.md`。YAML frontmatter 字段：

| 字段 | 必填 | 说明 |
|---|---|---|
| `slug` | ✅ | 与未来 `src/pages/<slug>.html` 一致 |
| `title` | ✅ | 拟定标题，可随时改 |
| `type` | ✅ | `paper-reading` / `survey-chapter` / `original` / `hub` / `translation` / `course-note` |
| `status` | ✅ | `idea` → `outlining` → `drafting` → `review-ready` → `published` |
| `progress` | ✅ | 0-100，主观进度 |
| `target_alias` | ✅ | 目标分类路径，如 `categories/AI/图像压缩/图像压缩论文精读` |
| `target_sub_id` | ✅ | 数字或 `auto`（发布前用 `scripts/check-sub-id.py --category <关键词>` 分配） |
| `target_hub` | 系列 ✅ | 系列枢纽页 slug，独立文章省略 |
| `pin` | 可选 | `true`/`false`，发布后是否首页 Pinned 置顶（对应 html-blog 的 `pin` 字段） |
| `source_url` | 论文 ✅ | arXiv/DOI 链接，非论文省略 |
| `tags` | ✅ | 3-5 个，与未来 frontmatter 一致 |
| `created_at` / `updated_at` | ✅ | ISO 时间戳，精确到秒 |
| `published_at` | 发布后 ✅ | 发布时间，未发布时空着 |
| `published_file` | 发布后 ✅ | `src/pages/<slug>.html`，未发布时空着 |

frontmatter 之后是 markdown brainstorming：核心问题、预期大纲、关键素材、TODO。

## 工作流

### 1. new — 新建草稿

用户给出 slug +（可选）标题 +（可选）类型 +（可选）source URL：

```bash
cp ~/gongshangzheng.github.io/drafts/_template.md ~/gongshangzheng.github.io/drafts/<slug>.md
```

然后填充 frontmatter：
- `slug`、`title`、`type`、`target_alias`（从 blog-categories skill 选）、`tags`
- `created_at` = `updated_at` = 当前时间
- brainstorming body 写核心问题 + 预期大纲

**分配 target_sub_id（若系列文章）**：
```bash
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/check-sub-id.py --category <分类关键词>
```
取下一个可用 sub_id（步长 10）。若不确定，先填 `auto`，发布前再分配。

### 2. list — 列出所有草稿

```bash
ls ~/gongshangzheng.github.io/drafts/*.md
```

用 Python 一键汇总状态：

```bash
~/.venv/bin/python3 - <<'PY'
import glob, re
for f in sorted(glob.glob('/Users/zhengxinyu/gongshangzheng.github.io/drafts/*.md')):
    if f.endswith('_template.md') or f.endswith('README.md'): continue
    s=open(f).read()
    m=re.search(r'^---\n(.*?)\n---', s, re.DOTALL)
    if not m: continue
    fm={}
    for line in m.group(1).splitlines():
        if ':' in line:
            k,v=line.split(':',1); fm[k.strip()]=v.strip()
    name=f.split('/')[-1]
    print(f"{fm.get('status','?'):14} {fm.get('progress','?'):>3}%  {fm.get('slug',name):30} {fm.get('title','')}")
PY
```

### 3. update — 更新草稿

更新 brainstorming 内容或 metadata 后，**必须更新 `updated_at`**：
- 改大纲/补素材 → 调整 `progress`、`status`（如 `idea → outlining`）
- commit：`git add drafts/<slug>.md && git commit -m "draft: <slug> <改动摘要>"`

### 4. publish — 发布交接

草稿 `status: review-ready` 且上游 skill（read-article 等）写完 HTML、跑完 review、`node build.js` 成功后：

1. 在草稿 frontmatter 设置：
   - `status: published`
   - `published_at: <发布时间>`
   - `published_file: src/pages/<slug>.html`
   - `progress: 100`
2. `git add drafts/<slug>.md && git commit -m "draft: <slug> published"`

草稿保留在 `drafts/` 作为 brainstorming 归档——不要删，它记录了想法演进，未来 gap 分析需要。

### 5. diff — 看 brainstorming 演进

```bash
git log -p drafts/<slug>.md                # 完整演进史
git log --oneline -10 -- drafts/           # 所有草稿最近改动
```

### 6. sync — gap 分析（草稿 vs 已发布文章）

**这是本 skill 最核心的价值**：对照草稿 brainstorming 与已发布 `src/pages/<slug>.html`，找出博客需要回补的内容。

操作步骤：
1. 读 `drafts/<slug>.md` 的 brainstorming（大纲、关键素材、TODO）。
2. 读 `src/pages/<slug>.html`（若已发布）的章节结构与 frontmatter。
3. 列出 gap：
   - 草稿里有但文章没有的素材/论点
   - 草稿 TODO 未完成的项
   - 草稿 metadata（tags、target_sub_id）与文章 frontmatter 不一致
4. 若有 gap：标草稿 `status: drafting`（从 published 回退），补齐后重新走 review-ready → published。

用 git diff 辅助：
```bash
# 草稿最近一次 brainstorming 改动
git log -1 --format=%ci drafts/<slug>.md
# 文章最近一次改动
git log -1 --format=%ci src/pages/<slug>.html
# 若草稿比文章新，说明有 brainstorming 还没落到文章 → gap
```

## 触发场景

- "我想写一篇关于 XX 的博客" / "记个博客 idea" → new 流程
- "看看我有哪些待写的博客" / "草稿列表" → list 流程
- "这篇草稿状态更新一下" / "标记为已发布" → update / publish 流程
- "XX 草稿和已发文章差了什么" / "博客需要补什么" → sync 流程
- "brainstorm" / "draft" / "待写" / "论文 idea" → 本 skill

## 与上游 skill 的交接

| 草稿 type | 写正文的 skill | 发布入口 |
|---|---|---|
| `paper-reading` | read-article | read-article 走完 Phase 7 直接发布 |
| `survey-chapter` / `original` | html-blog | html-blog capture.js + 正文 |
| `translation` | book-to-blog | book-to-blog 系列 |
| `course-note` | course-notes | course-notes 流程 |

交接时，把草稿的 `slug`、`target_alias`、`target_sub_id`、`tags`、`source_url`、`target_hub` 传给上游 skill 作为 frontmatter 输入。上游 skill 写完 `src/pages/<slug>.html` 后，回到本 skill 走 publish 流程回填草稿。

## 强制要求

- 只在 `~/gongshangzheng.github.io/drafts/` 下操作草稿，不碰 `src/pages/`（那是上游 skill 的产物）。
- 每次改草稿必须更新 `updated_at`。
- 发布后不要删草稿——保留作为 brainstorming 归档。
- `drafts/_template.md` 和 `drafts/README.md` 是基础设施，不要改名/删。
