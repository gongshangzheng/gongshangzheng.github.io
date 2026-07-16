---
name: read-article-env
description: read-article skill 的专属 venv 位置、脚本位置、和关键陷阱（sandbox 会清 .agents 下的 .venv）
metadata:
  type: reference
---

read-article skill 的运行环境与工具位置（2026-07-14 建好）：

- **专属 venv**：`.cache/read-article/.venv`（用 `uv venv` 建）。Python 在 `.cache/read-article/.venv/Scripts/python.exe`（Windows）/ `.cache/read-article/.venv/bin/python`（Unix）。装 `pymupdf pillow numpy` 三件——**numpy 必装**，`convert-figures.py` 的 `crop_whitespace` 依赖它，缺则 25/25 图转换静默全失败、media/images 一直空。
- **关键陷阱**：venv **不能**放 `.agents/skills/read-article/.venv`。`.agents/` 是 Claude 配置目录，sandbox 在写操作后会把它还原成快照、清掉被 `.gitignore` 命中的 `.venv/`。`.cache/`（repo 根、同样 gitignored）持久存活，故放这里。
- **fetch-arxiv-paper.py 位置**：`.agents/skills/read-article/scripts/fetch-arxiv-paper.py`（已从 repo 根 `scripts/` git mv 进 skill，属 read-article 私有）。脚本从自身路径反推 repo root（向上找含 `scripts/`+`src/` 的目录），**无需 `--root`**。Windows GBK 控制台跑要带 `PYTHONUTF8=1`（脚本已内置 `sys.stdout.reconfigure(utf-8)` 兜底）。
- **convert-figures.py 位置**：仍在 repo 根 `scripts/convert-figures.py`——它是跨 skill 共享的图→WebP 转换器（blog-drafts 草稿压缩、crop-figures-from-docling、论文精读都用），**不挪进 skill**。原则：私有工具→skill 目录；共享工具→repo 根。
- skill 文档 `phases/extraction.md` 已同步上述路径与命令。

**How to apply**：跑 read-article 提取时，命令模板见 extraction.md。库内 Python 不是 `~/.venv/bin/python`（那台机器没装），skill 文档里的旧 `~/.venv/...` 路径已作废，用上面 `.cache/read-article/.venv`。相关记忆 [[feedback-blog-first]]。
