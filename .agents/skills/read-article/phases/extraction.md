---
name: read-article-extraction
description: Phase 1 素材获取按需参考。配合 read-article/SKILL.md 使用。
---

# Phase 1 · 素材获取

## 表格素材入口

原始表格源码随 source tarball 保留；图片文件收集不能替代表格提取。选用重要表格时按 [../references/tables.md](../references/tables.md) 建立来源索引，选择 `doc_intake.py render-table` 编译片段生成裁边图，或手工整理为 Markdown / Org 表格。两者均需回源核对。PDF 裁图是保留原始版式的备选，不是必经步骤。

> **定位**：read-article 新流程 Phase 1 的按需参考。本文件提供 source → HTML → PDF 三级降级、
> 图片优先级、extraction-log 与 meta.md 规范。默认由主 agent 直接执行；只有素材规模很大
> （如长 survey 需要同时抓多篇、PDF 需 OCR 且页数多）时才考虑委派一个执行型 subagent。

## 1.1 生成 slug

```
"MaskGIT: Masked Generative Image Transformer" → maskgit-2022
"Attention Is All You Need" → attention-2017
```

## 1.2 初始化目录

```bash
SLUG="<slug>"
mkdir -p ~/gongshangzheng.github.io/raw/${SLUG}/{sources,images/${SLUG},figures/${SLUG},analysis}
```

## 1.3 素材获取流程

### 原文整理触发门禁（必须先于阅读与写作）

当用户要求“参考某篇论文原文”或等价表达（如阅读/核对/下载/总结/比较论文，或把论文用于回答问题、更新笔记、草稿、OpenSpec），立即按 `read-article` 执行 Phase 1。对 arXiv 论文，第一项实质操作必须走 **deepxiv + doc-intake 双通道**（见下方 1.3 步骤 1）；不得先手动下载或只凭已有 PDF 开始阅读。运行前检查 `raw/<slug>/` 是否已有内容，必要时为该论文选专属 slug，避免覆盖已有的 topic-level raw 目录。只有 deepxiv 与 source 都失败后，才能按下方降级链继续，并将失败原因与回退来源写入 extraction log。

> 底层提取已收口到全局 `~/.agents/skills/doc-intake/`（管理层，统一 CLI 为 `scripts/doc_intake.py`）。本文件只保留流程与优先级规则，命令一律经 doc_intake.py 或其适配后端（deepxiv / MinerU v4 云端链 / Office 内核）执行。

默认由主 agent 执行。仅当素材规模确实超出单次上下文处理能力时，才把下面的块作为任务描述
委派给一个执行型 subagent；委派时其输出只能写入 `raw/<slug>/`，不得改其他目录。

```
任务：下载并解析论文，提取全文 Markdown + 章节地图 + 元信息 + 原图。

论文标识：<URL 或 PDF 路径>
Slug：<slug>
输出目录：~/gongshangzheng.github.io/raw/<slug>/

步骤：

0. arXiv 论文双通道（首选，无论用户给 abs/pdf/html 链接或标题）：
   # ① 正文与章节地图（deepxiv，公式无损；--head 得章节名/TLDR/token 数，--raw 得全文）
   deepxiv paper <arxiv-id> --head > ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.sections.json
   deepxiv paper <arxiv-id> --raw > ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md
   # ② 源码包/原图/WebP/extraction-log（doc-intake，--assets-only 不重复产正文）
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py \
     arxiv <arxiv-id> --slug <slug> --root ~/gongshangzheng.github.io --assets-only [--html] [--pdf]
   - deepxiv 失败 → 降级：source + pandoc（保护公式）→ arXiv HTML → MinerU/Docling PDF → pdftotext -layout。
   - 超长论文或只需局部：deepxiv paper <id> --section "<从 --head 复制的准确章节名>"。

1. 判断来源类型（非 arXiv）：
   - 本地文档（PDF/Office/EPUB/RTF/HTML/CSV/图片）→ `doc_intake.py extract <file> -o raw/<slug>/sources/`（自动路由 MinerU 首选）。
   - 普通网页 → web_fetch 抓正文；图片下载真实原图，禁止猜 URL。
   - 每次提取都必须写 `sources/extraction-log.md`，记录 deepxiv / source / HTML / PDF / MinerU / Docling / pdftotext 的成功状态、失败原因和回源指针。

2. PDF fallback 文本/结构化提取命令（解析器只负责文本、表格、公式、layout，不负责最终截图）：
   # 使用全局 venv（见 SKILL.md Python 环境章节）

   # Markdown：doc-intake 自动路由（MinerU 首选；本地质量档不可用时报结构化错误，属用户选择点）
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py extract \
     "<url 或本地 pdf>" -o ~/gongshangzheng.github.io/raw/<slug>/sources/

   # 版面坐标 JSON（优先级 D `doc_intake.py crop-figures` 的输入；MinerU v4 云端）
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py mineru-layout \
     "<pdf>" -o ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>-layout.json

3. 高质量论文图像提取流程（最终配图唯一来源）：

   **优先级 S：用户笔记/会话中的图片（最高）**
   - 如果用户已经把截图或图片放在笔记、附件、session files、当前目录或指定目录中，优先使用这些图。
   - 这些图通常已被用户筛选，优先级高于 GitHub、arXiv source 和 PDF crop。
   - 必须复制/本地化到 `raw/<slug>/figures/<slug>/`，再进入 `images/<slug>/`。

   **优先级 A：arXiv source tarball 原始图（默认首选）**
   - 对 arXiv 论文，asset 通道（步骤 0 的 `doc_intake.py arxiv --assets-only`）自动完成下载→解压→提取图片→转 WebP→生成 extraction-log.md。
     它创建 `sources` / `figures/<slug>` / `images/<slug>` / `analysis` 四个目录；
     手工初始化时也必须包含 `analysis/`，否则 Phase 2 lane 无输出位置。

   > 工具位置：`~/.agents/skills/doc-intake/scripts/doc_intake.py`（全局管理层；旧 read-article 私有
   > `fetch-arxiv-paper.py` 与 repo 级 `convert-figures.py` 已迁移至此，分别对应 `arxiv` 与 `convert-figures` 子命令）。
   > 运行环境：全局 venv `~/.venv/bin/python3`（pymupdf/pillow/numpy/html-to-markdown/zxing-cpp/xlrd 已装齐）。

   ```bash
   # 一键完成：目录创建 + tarball 下载 + 解压 + 图片提取 + WebP 转换 + extraction-log
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py \
     arxiv <arxiv-id> --slug <slug> --root ~/gongshangzheng.github.io --assets-only [--html] [--pdf]

   # 如果已有 source.tar（手动下载或之前执行过），可只运行图片转换部分
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py \
     convert-figures raw/<slug>/figures/<slug>/ -o media/images/<slug>/
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
   - bbox 来自 `mineru-layout` 产物的 content_list image 块（MinerU v4 云端版面检测），渲染由 PyMuPDF 按 bbox 在源 PDF 上 300-400 DPI clip 完成。
   - **与 ❌ Docling referenced 图片的区别**：本脚本只借 Docling 的 bbox 坐标，**不使用** Docling 自家 `--image-export-mode referenced` 产出的 144 DPI 整页/区域截图（那玩意遇到矢量 figure 会空白，PerformRecast 踩过坑）。PyMuPDF 在源 PDF 上 clip 渲染矢量内容是正确的。

   ```bash
   # 1. 先出版面坐标 JSON（MinerU v4 云端；docling 已移除）
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py mineru-layout \
     "<pdf-url 或本地 PDF>" -o ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}-layout.json

   # 2. 用 doc_intake crop-figures 按 picture bbox 高清裁图 → PNG，再链式转 WebP
   ~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py crop-figures \
     ~/gongshangzheng.github.io/raw/${SLUG}/sources/<slug>.json \
     --pdf ~/gongshangzheng.github.io/raw/${SLUG}/sources/<slug>.pdf \
     -o ~/gongshangzheng.github.io/raw/${SLUG}/figures/${SLUG}/ \
     --media-dir ~/gongshangzheng.github.io/media/images/${SLUG}/ \
     --dpi 300

   # 可选：只裁指定页（1-based，如 3,5,7-9）
   #   --pages 3,5,7-9
   # 可选：只出 PNG 不转 WebP
   #   --no-convert
   ```
   工具同时写 `figures/<slug>/figures-manifest.json`，记录每张图的 page_no / bbox / self_ref / caption / 尺寸 / 空白嫌疑，供后续 HTML 配 `cap` 使用。如某张 `blank_suspect: true`，说明矢量渲染可能失败，需人工复核或回退到更高 DPI。

   **优先级 E：blog-images 搜到的可靠公开图片（补充来源）**
   - 当论文原始来源图不足，或需要背景配图/作者照片/机构示意图时，先读取并遵循 `~/gongshangzheng.github.io/.agents/skills/blog-images/SKILL.md`。
   - 只接受来源可靠、分辨率足够、与正文事实一致的图片；必须下载到本地，禁止 hotlink。

   **质量门槛**
   - 博客/报告最终图片宽度建议 ≥ 1200 px；
   - 架构图、曲线图、重建对比图低于 1200 px 必须重提；
   - 最终图片统一从 `figures/<slug>/` 复制到 `images/<slug>/`；
   - Docling 产物不得复制到 `images/<slug>/`。
   - **AI 生图完全禁止**（学术场景硬规则）：所有 source / HTML / GitHub / 用户截图 / PDF crop / blog-images 途径都失败时，改用表格重排、文字描述 + 原文锚点链接，或代码绘制示意图；不得生成假图

   ```bash
   mkdir -p ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/
   cp ~/gongshangzheng.github.io/raw/<slug>/figures/<slug>/* \
      ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/ 2>/dev/null || true

   # 清理 Docling 临时图，防止误用
   find ~/gongshangzheng.github.io/raw/<slug>/sources/ -name "*_artifacts" -type d -prune -exec rm -rf {} +
   ```

4. 校验：
   - Markdown 非空，前 40 行有实质内容
   - JSON 格式验证通过
   - 最终图片目录非空且非 Docling 来源：ls ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/ | wc -l
   - 关键图片宽度 ≥ 1200 px（用 `python3 - <<PY ... PIL.Image.open ...` 或 `identify` 检查）
   - 不存在 `sources/*_artifacts` 或 `temp-docling-images/` 遗留
   - arXiv 论文：必须记录 source tarball 是否可用、source 路径、tex/figure 数量、HTML 是否可用、HTML URL、提取到的 figure URL 数量、PDF fallback 是否使用；提取标题/作者/机构/摘要/发表时间/分类

5. 写 meta.md（Markdown 格式，便于后续 Phase 3/4 消费）：
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

7. 如果提取失败：
   - 下载 PDF 本地：curl -L "<url>" -o /tmp/<slug>.pdf
   - 重试：~/.venv/bin/python3 ~/.agents/skills/doc-intake/scripts/doc_intake.py extract \
       /tmp/<slug>.pdf -o ~/gongshangzheng.github.io/raw/<slug>/sources/
   - 最终兜底：pdftotext -layout /tmp/<slug>.pdf ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md

强制要求：只做调研，不修改 raw/ 目录以外的任何文件。
```

## 1.4 素材获取完成后的目录结构

```
raw/<slug>/
├── meta.md
├── sources/
│   ├── <slug>.md           ← 全文 Markdown
│   └── <slug>.json          ← 结构化数据/layout/bbox
├── figures/
│   └── <slug>/               ← 高质量原图/source/PDF crop
├── images/
│   └── <slug>/               ← 最终可用于 HTML/blog 的图片（禁止 Docling artifacts）
├── analysis/                 ← Phase 2 按需生成的 analysis lane（可为空）
└── (synthesis.md)            ← Phase 3 生成；OpenSpec change 由 Phase 4 创建
```

**兼容旧目录**：历史 `raw/<slug>/subagents/` 与 `synthesis.md` 继续可用，作为对应 lane 的历史产物
读取；新流程不再要求补齐四份固定分析文件。

**draft 模式在此分叉**：提取完成后由主 agent 直读论文、填充草稿小节，不进入 full 模式后续阶段。
