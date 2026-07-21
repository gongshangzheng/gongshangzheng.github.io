---
name: blog-drafts-paper-note
description: 从 arXiv 论文一键提取核心信息，写入结构化草稿（paper-note 模板）。轻量版读纸流程：不分多个 subagents，只产出草稿笔记，不写 HTML。
trigger: blog-drafts paper-note 流程 / 快速读纸 / 论文草稿
---

# 论文快读草稿 (paper-note)

## 定位

`paper-note` 是 `read-article` 的轻量版支路，目标是把一篇论文的核心信息快速写进 `drafts/` 草稿，
供后续 brainstorming 和写博客用。**不**分多个 subagents，不写 HTML，不跑 Review pipeline。

适合场景：
- 快速阅读，先记下来，以后再详细写
- 在 brainstorming 草稿里积累论文笔记
- 作为 `read-article` 全量精读的前置草稿

## 流程

### Step 1：提取论文

用 `fetch-arxiv-paper.py` 一键下载 source tarball + 提取图片 + 生成 TeX→Markdown：

```bash
cd ~/gongshangzheng.github.io
PYTHONUTF8=1 .cache/read-article/.venv/bin/python \
  .agents/skills/read-article/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>
```

脚本输出：
- `raw/<slug>/sources/<slug>.md`：TeX 拼接正文
- `raw/<slug>/figures/<slug>/`：原始图片
- `media/images/<slug>/`：WebP 图片（供草稿 assets 引用）
- `raw/<slug>/extraction-log.md`：提取日志

如果图片需要放进草稿 assets（草稿发布前），复制到 `drafts/assets/<slug>/`：

```bash
mkdir -p drafts/assets/<slug>
cp media/images/<slug>/*.webp drafts/assets/<slug>/
```

### Step 2：阅读论文正文

读 `raw/<slug>/sources/<slug>.md`，重点提取：

| 字段 | 来源章节 |
|------|---------|
| 问题 | Abstract + Introduction |
| 目标/贡献 | Abstract + Contributions 列表 |
| 模型结构 | Methodology / Architecture / Method |
| 训练流程 | Implementation Details / Training |
| 实验结果 | Experiments / Results / Ablation |
| 总结 | Conclusion / Limitations |

**不需要**读 Related Work（太长，浪费时间）。

### Step 3：新建草稿

```bash
~/.venv/bin/python3 scripts/draft.py new <slug> \
  --title "<论文标题简称>" \
  --type paper-reading \
  --template paper-note \
  --source <arxiv-url> \
  --tags <tag1,tag2,tag3>
```

`--template paper-note` 会使用 `.agents/skills/blog-drafts/templates/paper-note.md` 模板。

### Step 4：填写草稿正文

按模板各节填写，原则：

- **简短**：每节 2-5 句话，不需要详细覆盖所有细节
- **抓重点**：哪个设计最有意思？什么结果最关键？
- **写给自己**：用自己的话，不抄原文
- **图片**：最多选 1-2 张最重要的图（架构图 + 对比图）
- **待读/疑问**：把没弄懂或想追读的点记到 `- [ ]` 列表

填写完后更新状态：

```bash
~/.venv/bin/python3 scripts/draft.py set <slug> status=outlining progress=30
```

### Step 5：同步图片（可选）

如果希望草稿里的图片可预览，把 WebP 图片复制进 `drafts/assets/<slug>/`，
草稿正文用相对路径 `![描述](assets/<slug>/<file>.webp)` 引用。

**不需要** 把图片放进 `media/images/`（那是发布时的目标目录）。

---

## 草稿 frontmatter 填写指引

| 字段 | 填法 |
|------|------|
| `slug` | `<论文名缩写>-<年份>`，如 `dystream-2025` |
| `title` | 论文标题中文简称，如 `DyStream：流式双人数字人` |
| `type` | `paper-reading` |
| `target_alias` | 从 `blog-categories` 选，如 `categories/AI/数字人` |
| `target_hub` | 系列 Hub 页 slug，如 `digital-human-hub`；独立论文省略 |
| `source_url` | arXiv abs 链接 |
| `tags` | 3-5 个，与论文主题一致 |

---

## 强制要求

- 只修改 `drafts/` 和 `raw/`，不修改 `src/pages/` 或 `media/`（发布时才移过去）
- 草稿正文写自己的理解，不要复制粘贴原文大段落
- 图片最多 2 张（选最能说明问题的）
- 不需要完整覆盖所有细节，以后精读时再补
