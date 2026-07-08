---
name: read-article-image-collection
description: Phase 5f 配图 subagent 模板
trigger: read-article Phase 5f 配图
---

# Phase 5f · 配图 subagent

## 任务

根据方法写作和实验写作中的配图计划，收集、下载、处理图片，并生成图片 HTML 片段。

## 输入

- 论文标题：<title>
- Slug：<slug>
- 配图计划：来自 5c/5d 产出中的 `[配图 N：描述（来源）]` 标注
- 代码仓库：本地路径（若有）

## 配图优先级

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 🥇 | 用户截图/笔记中的图片 | 最高优先级：用户已有的截图、标注图、笔记插图 |
| 🥈 | arXiv e-print tarball 原始图 | **arXiv 论文默认首选**。下载 `https://arxiv.org/e-print/<id>`，解压后从 `figures/` 提取 PDF/PNG。用 `scripts/convert-figures.py` 一键转 WebP（300 DPI）。详见 Phase 1 extraction.md 优先级 A |
| 🥉 | arXiv HTML 页面中的配图 | source tarball 不可用或缺图时，从论文 HTML 版提取 figure URL |
| 第四 | GitHub repo 中的配图 | README/docs/assets/images 中的官方图 |
| 第五 | 代码绘制（mermaid/jsxgraph） | 用于架构图、流程图、数学示意图的补充绘制 |
| 第六 | 网络搜图 | 可靠公开来源的补充图，较少使用，必须本地化并标注 |
| ❌ | Docling 从 PDF 提取的图片 | **禁止用于最终配图**。Docling 仅用于文本/表格/layout 提取，其图片产物是编译后 PDF 的整页截图，遇到矢量 PDF figure 会空白或裁切错误 |
| ❌ | AI 生图 | 完全禁止 |

> ⚠️ **关键教训**：arXiv 论文的 figure 通常是 PDF 格式（矢量图），不是 PNG。如果只下载 .tex 源文件但不提取 figures/ 目录中的 PDF 并转换格式，最终会退回 Docling 提取，导致图片空白或裁切错误。PerformRecast (P39) 就是因为这个原因导致 11 张图片中 4 张完全空白、7 张裁切错误。

## 禁止事项

- 禁止使用 Docling 的 docpage/dcoref 模式整页抽取 PDF 页面作为配图
- 禁止 AI 生图
- 禁止 hotlink 远程 URL（必须下载到本地）

## 工作流程

### 1. 检查已有图片

```bash
# 检查 raw 目录中已有的图片
ls ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/
ls ~/gongshangzheng.github.io/raw/<slug>/figures/<slug>/
```

### 2. 从 arXiv HTML 提取图片

```bash
# 下载 arXiv HTML 版中的图片
# 图片通常在 https://arxiv.org/html/<arxiv-id>/extracted/... 中
```

### 3. 从 GitHub repo 提取图片

```bash
# 从仓库的 README/docs/assets/images 目录复制
```

### 4. ❌ 禁止：从 PDF 提取图片（Docling）

**不要使用 Docling 提取最终配图。** Docling 的图片产物是编译后 PDF 的整页截图，遇到矢量 PDF figure 会：
- 完全空白（文件仅几十字节）
- 裁切错误（只截到部分内容）

Docling 仅用于文本、表格、公式和 layout 提取，其图片产物必须隔离到 `temp-docling-images/` 并在高质量图片完成后删除。

正确做法：从 arXiv e-print tarball 的 `figures/` 目录提取原始 PDF figure，用 `scripts/convert-figures.py` 一键转 WebP。详见 Phase 1 extraction.md。

### 5. 代码绘制（mermaid/jsxgraph）

对于论文没有但文章需要的架构图、流程图，用 mermaid 或 jsxgraph 绘制。

### 6. 转换并复制到博客资源目录

```bash
SLUG="<slug>"
MEDIA_DIR="$HOME/gongshangzheng.github.io/media/images/${SLUG}"
FIG_DIR="$HOME/gongshangzheng.github.io/raw/${SLUG}/figures/${SLUG}"

# 一键转换：PDF/EPS → WebP (300 DPI)，PNG/JPG → WebP
# 自动跳过非论文文件（acmart.pdf 等）
# 自动按优先级选择：同名文件 PDF > PNG
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/convert-figures.py "$FIG_DIR" -o "$MEDIA_DIR"

# 如果 raw/images/ 目录有额外图片（如用户截图），也一并转换
IMG_DIR="$HOME/gongshangzheng.github.io/raw/${SLUG}/images/${SLUG}"
if [ -d "$IMG_DIR" ]; then
  ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/convert-figures.py "$IMG_DIR" -o "$MEDIA_DIR"
fi
```

### 7. 验证每张图片

`convert-figures.py` 已内置质量检查（文件 > 1KB、宽度 > 400px），但仍需手动验证：

```bash
ls -lh ~/gongshangzheng.github.io/media/images/${SLUG}/
# 检查所有图片维度
~/.venv/bin/python3 -c "
from PIL import Image
from pathlib import Path
d = Path('$HOME/gongshangzheng.github.io/media/images/${SLUG}')
for f in sorted(d.glob('*.webp')):
    img = Image.open(f)
    print(f'{f.name}: {img.size[0]}x{img.size[1]}')
"
```

每张图片必须：
- 文件确实存在（用 `ls` 确认）
- **文件大小 > 1KB**（小于 1KB 的 WebP 几乎必然是空白图——PerformRecast 的空白图片只有 46-90 字节）
- 宽度建议 ≥ 1200px（`convert-figures.py` 会在宽度 < 400px 时警告）
- **必须用 `read` 工具视觉验证至少 1 张图片**，确认内容不是空白或裁切错误

### 8. 生成图片 HTML 片段

每张图片生成对应的 HTML：

```html
<div class="photo">
  <img src="media/images/<slug>/<filename>" alt="描述" loading="lazy">
  <div class="cap">图 N：图片描述（来源：论文名, Fig.N）</div>
</div>
```

### 9. 图片理解

对于架构图、流程图等关键图片，用 `read` 工具读取图片（内置视觉模型）理解内容，确保写作内容与图片一致。

## 输出

1. 已下载到博客资源目录的图片文件列表
2. 每张图片的 HTML 片段
3. 关键图片的理解结果

## 强制要求

- 至少 3 张图，至少 1 张代码绘制
- 每张图必须验证存在
- 来源必须标注
- 只做配图，不修改其他文件
