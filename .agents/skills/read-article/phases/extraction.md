---
name: read-article-extraction
description: Phase 1 论文提取完整指引。配合 read-article/SKILL.md 使用。
---

# Phase 1 · 提取

## 1.1 生成 slug

```
"MaskGIT: Masked Generative Image Transformer" → maskgit-2022
"Attention Is All You Need" → attention-2017
```

## 1.2 初始化目录

```bash
SLUG="<slug>"
mkdir -p ~/gongshangzheng.github.io/raw/${SLUG}/{sources,images/${SLUG},figures/${SLUG}}
```

## 1.3 分配提取 subagent

```
任务：下载并解析论文，提取全文 Markdown + 结构化 JSON + 元信息。

论文标识：<URL 或 PDF 路径>
Slug：<slug>
输出目录：~/gongshangzheng.github.io/raw/<slug>/

步骤：

1. 判断来源类型：
   - arXiv 论文（无论用户给 abs/pdf/html 链接或标题）→ **优先下载 `https://arxiv.org/e-print/<arxiv-id>` source tarball**，从 `.tex`、bibliography、supplement、figure/caption/table 文件中提取正文和图片；source 是第一选择。
   - source tarball 不可用、缺失正文或结构过于复杂时 → 次选 `https://arxiv.org/html/<arxiv-id>` 或会议官方 HTML，用于正文结构读取、公式/图表定位、figure URL 提取。
   - arXiv PDF / PDF 直链 → 仅作为第三选择；Docling 与 `pdftotext -layout` 只做 PDF fallback 文本/结构化提取，图片另走高质量图像提取流程。
   - 普通网页 → web_fetch 抓正文；图片下载真实原图，禁止猜 URL。
   - 每次提取都必须写 `sources/extraction-log.md`，记录 source / HTML / PDF / Docling / pdftotext 的成功状态、失败原因和回源指针。

2. PDF fallback 文本/结构化提取命令（Docling 只负责文本、表格、公式、layout，不负责最终截图）：
   # 使用全局 venv（见 SKILL.md Python 环境章节）

   # Markdown：默认不导出图片
   ~/.venv/bin/python3 ~/.agents/skills/docling/scripts/convert.py \
     "<url>" --format markdown --table-mode accurate \
     --output ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md

   # JSON（结构化：tables/formulas/layout；pictures[].prov 含 figure 页码+bbox，
   #   是优先级 D 脚本 scripts/crop-figures-from-docling.py 的输入）
   ~/.venv/bin/python3 ~/.agents/skills/docling/scripts/convert.py \
     "<url>" --format json \
     --output ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.json

   # 只有需要临时定位 figure 时，才允许额外跑 referenced；产物不得进入最终 images/ 或博客 assets
   ~/.venv/bin/python3 ~/.agents/skills/docling/scripts/convert.py \
     "<url>" --format json --image-export-mode referenced \
     --output ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>-with-temp-images.json

   # 临时 Docling 图片必须隔离到 temp-docling-images，并在高质量图片完成后删除
   mkdir -p ~/gongshangzheng.github.io/raw/<slug>/temp-docling-images/
   find ~/gongshangzheng.github.io/raw/<slug>/sources/ -name "*_artifacts" -type d | while read adir; do
     cp "$adir"/*.png ~/gongshangzheng.github.io/raw/<slug>/temp-docling-images/ 2>/dev/null || true
   done

3. 高质量论文图像提取流程（最终配图唯一来源）：

   **优先级 S：用户笔记/会话中的图片（最高）**
   - 如果用户已经把截图或图片放在笔记、附件、session files、当前目录或指定目录中，优先使用这些图。
   - 这些图通常已被用户筛选，优先级高于 GitHub、arXiv source 和 PDF crop。
   - 必须复制/本地化到 `raw/<slug>/figures/<slug>/`，再进入 `images/<slug>/`。

   **优先级 A：arXiv source tarball 原始图（默认首选）**
   - 对 arXiv 论文，必须先尝试 `https://arxiv.org/e-print/<arxiv-id>`。
   - **一键脚本**：`fetch-arxiv-paper.py` 自动完成下载→解压→提取图片→转 WebP→生成 extraction-log.md。

   ```bash
   # 一键完成：目录创建 + tarball 下载 + 解压 + 图片提取 + TeX→Markdown + WebP 转换
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>

   # 同时下载 HTML 和 PDF（备用）
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug> --html --pdf

   # 如果已有 source.tar（手动下载或之前执行过），可只运行图片转换部分：
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/convert-figures.py raw/<slug>/figures/<slug>/ -o media/images/<slug>/
   ```

   脚本输出目录结构：
   ```
   raw/<slug>/
   ├── sources/<slug>.md       ← TeX 拼接为 Markdown
   ├── source.tar               ← 原始 tarball
   ├── source-tar/             ← 解压后的 .tex 源码
   ├── figures/<slug>/          ← 提取的原始图片（PDF/PNG/EPS）
   ├── images/<slug>/           ← WebP 副本
   └── extraction-log.md        ← 自动生成的提取日志
   media/images/<slug>/           ← WebP 图片（站点资源）
   ```

   **优先级 B：arXiv HTML / 官方 HTML 原图**
   - source 不可用或缺图时，尝试 `https://arxiv.org/html/<arxiv-id>` 或会议官方 HTML。
   - 用 `web_fetch` 或 `curl` 读取 HTML，提取真实 figure URL（如 `x1.png`、`extracted/.../figures/...`）。
   - 必须验证 HTTP 200 和文件类型为 PNG/JPEG/WebP/SVG/PDF 等真实图像。
   - 下载到 `raw/<slug>/figures/<slug>/`，禁止在 HTML 中 hotlink arXiv URL。
   - 如果 HTML 版本存在但未能提取图片，必须在 `sources/extraction-log.md` 中记录原因，再进入下一优先级。

   ```bash
   ARXIV_ID="<id>"
   SLUG="<slug>"
   RAW_DIR="$HOME/gongshangzheng.github.io/raw/${SLUG}"
   FIG_DIR="$RAW_DIR/figures/${SLUG}"
   HTML_URL="https://arxiv.org/html/${ARXIV_ID}"
   mkdir -p "$FIG_DIR"

   curl -L "$HTML_URL" -o "$RAW_DIR/sources/${SLUG}.html"

   # 粗提取 figure src；必要时人工检查 HTML 中 <figure> / <img> 节点
   RAW_DIR="$RAW_DIR" SLUG="$SLUG" HTML_URL="$HTML_URL" python3 - <<'PY'
from pathlib import Path
import os, re, urllib.parse
raw_dir = os.environ["RAW_DIR"]
slug = os.environ["SLUG"]
base = os.environ["HTML_URL"]
html = Path(raw_dir, "sources", f"{slug}.html").read_text(errors="ignore")
for image_source in re.findall(r"<img[^>]+src=['\"]([^'\"]+)['\"]", html):
    print(urllib.parse.urljoin(base + '/', image_source))
PY
   ```

   **优先级 C：GitHub 官方仓库 / 官方项目页图片**
   - 如果论文有官方 GitHub/project repo 或 project page，检查 README、docs、assets、figures、images、static 等目录。
   - 仓库/项目页中的架构图、teaser、demo 图通常清晰，优先级高于 PDF crop。
   - 必须下载到本地，禁止在 HTML 中 hotlink GitHub/raw URL。

   ```bash
   GH_REPO="<owner/repo>"
   SLUG="<slug>"
   RAW_DIR="$HOME/gongshangzheng.github.io/raw/${SLUG}"
   FIG_DIR="$RAW_DIR/figures/${SLUG}"
   mkdir -p "$FIG_DIR" /tmp/${SLUG}-repo

   git clone --depth 1 "https://github.com/${GH_REPO}.git" /tmp/${SLUG}-repo
   find /tmp/${SLUG}-repo -type f \
     \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' -o -iname '*.svg' \) \
     -path '*/.git/*' -prune -o -print | while read f; do
       cp "$f" "$FIG_DIR/" 2>/dev/null || true
   done
   ```

   **优先级 D：PDF 高 DPI bbox 裁图（脚本化兜底）**
   - 只有当 arXiv source tarball、arXiv/官方 HTML、官方仓库/项目页都拿不到可用图片时，才允许 PDF crop。
   - 使用前必须记录 fallback 原因。
   - bbox 来自 Docling JSON 的 `pictures[].prov[0].bbox`（layout 模型 `docling-layout-heron` 的 `picture` 检测结果），渲染由 PyMuPDF 按 bbox 在源 PDF 上 300-400 DPI clip 完成。
   - **与 ❌ Docling referenced 图片的区别**：本脚本只借 Docling 的 bbox 坐标，**不使用** Docling 自家 `--image-export-mode referenced` 产出的 144 DPI 整页/区域截图（那玩意遇到矢量 figure 会空白，PerformRecast 踩过坑）。PyMuPDF 在源 PDF 上 clip 渲染矢量内容是正确的。

   ```bash
   # 1. 先跑 Docling 出 JSON（若 Phase 1 步骤 2 已产出 sources/<slug>.json 则跳过）
   ~/.venv/bin/python3 ~/.hanako/skills/docling/scripts/convert.py \
     "<pdf-url 或本地 PDF>" -f json \
     --output ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.json

   # 2. 用脚本按 picture bbox 高清裁图 → PNG 到 figures/，再链式转 WebP 到 media/images/
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/crop-figures-from-docling.py \
     ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.json \
     --pdf ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.pdf \
     -o ~/gongshangzheng.github.io/raw/${SLUG}/figures/${SLUG}/ \
     --media-dir ~/gongshangzheng.github.io/media/images/${SLUG}/ \
     --dpi 300

   # 可选：只裁指定页（1-based，如 3,5,7-9）
   #   --pages 3,5,7-9
   # 可选：只出 PNG 不转 WebP
   #   --no-convert
   ```
   脚本同时写 `figures/<slug>/figures-manifest.json`，记录每张图的 page_no / bbox / self_ref / caption / 尺寸 / 空白嫌疑，供后续 HTML 配 `cap` 使用。如某张 `blank_suspect: true`，说明矢量渲染可能失败，需人工复核或回退到更高 DPI。

   **优先级 E：blog-images 搜到的可靠公开图片（补充来源）**
   - 当论文原始来源图不足，或需要背景配图/作者照片/机构示意图时，先读取并遵循 `~/.agents/skills/blog-images/SKILL.md`。
   - 只接受来源可靠、分辨率足够、与正文事实一致的图片；必须下载到本地，禁止 hotlink。

   **质量门槛**
   - 博客/报告最终图片宽度建议 ≥ 1200 px；
   - 架构图、曲线图、重建对比图低于 1200 px 必须重提；
   - 最终图片统一从 `figures/<slug>/` 复制到 `images/<slug>/`；
   - Docling 产物不得复制到 `images/<slug>/`。
   - AI 生图不在默认提图链中；只有原始来源检索和 blog-images 都失败，且必须补概念示意图时，才允许作为 fallback。

   ```bash
   mkdir -p ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/
   cp ~/gongshangzheng.github.io/raw/<slug>/figures/<slug>/* \
      ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/ 2>/dev/null || true

   # 清理 Docling 临时图，防止误用
   rm -rf ~/gongshangzheng.github.io/raw/<slug>/temp-docling-images/
   find ~/gongshangzheng.github.io/raw/<slug>/sources/ -name "*_artifacts" -type d -prune -exec rm -rf {} +
   ```

4. 校验：
   - Markdown 非空，前 40 行有实质内容
   - JSON 格式验证通过
   - 最终图片目录非空且非 Docling 来源：ls ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/ | wc -l
   - 关键图片宽度 ≥ 1200 px（用 `python3 - <<PY ... PIL.Image.open ...` 或 `identify` 检查）
   - 不存在 `sources/*_artifacts` 或 `temp-docling-images/` 遗留
   - arXiv 论文：必须记录 source tarball 是否可用、source 路径、tex/figure 数量、HTML 是否可用、HTML URL、提取到的 figure URL 数量、PDF fallback 是否使用；提取标题/作者/机构/摘要/发表时间/分类

5. 写 meta.md（Markdown 格式，便于后续 Phase 3/5 消费）：
   ---
   title: 原始素材: <slug>
   date: <YYYY-MM-DD>
   ---

   ## 素材索引

   | 来源 | 类型 | 状态 | 关键贡献 |
   |------|------|------|----------|

6. **下载官方代码仓库**（仅在用户明确要求保存时执行）：

代码仓库往往包含论文未写明的实现细节（超参数、训练配置、技巧消融、公式的具体离散化方式），是理解工作的关键素材。

只有当用户明确说「保存代码」或「下载到 code」时，才下载到 =~/code=；否则下载到 =/tmp=（临时读读，session 结束即清理）。

```bash
SAVE_TO_CODE=false  # 默认 false，除非用户明确要求
CODE_DIR=$([[ "$SAVE_TO_CODE" == "true" ]] && echo "~/code" || echo "/tmp")

GH_REPO=$(grep -o 'github.com/[^)" ]*' "~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.md" | head -1 | sed 's|github.com/||')

if [[ -n "$GH_REPO" ]]; then
  git clone --depth 1 --branch main "https://github.com/${GH_REPO}.git" "$CODE_DIR/$(basename $GH_REPO)"
fi
```

注意事项：
- 只克隆 = 最新 = 主分支（= `--depth 1 --branch main`），不要 clone 所有分支和历史
- 代码仓通常不在 Phase 1 提取时就下载，而是在确认论文值得精读后、开始代码解析前执行
- 如果是 HuggingFace 无代码仓库，则跳过此步
- 代码仓下载后，在笔记中记录：核心文件路径、主要类/函数名、训练配置默认值

7. 如果 Docling 失败：
   - 下载 PDF 本地：curl -L "<url>" -o /tmp/<slug>.pdf
   - 重试本地：~/.venv/bin/python3 ~/.agents/skills/docling/scripts/convert.py \
       /tmp/<slug>.pdf --format markdown --max-pages 10 --output ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md
   - 或换 OCR：--ocr tesseract --force-ocr

强制要求：只做调研，不修改 raw/ 目录以外的任何文件。
```

## 1.4 提取完成后的目录结构

```
raw/<slug>/
├── meta.md
├── sources/
│   ├── <slug>.md           ← 全文 Markdown
│   └── <slug>.json          ← 结构化数据/layout/bbox
├── figures/
│   └── <slug>/               ← 高质量原图/source/PDF crop
└── images/
    └── <slug>/               ← 最终可用于 HTML/blog 的图片（禁止 Docling artifacts）
```