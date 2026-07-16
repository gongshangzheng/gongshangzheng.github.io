---
name: book-to-blog-extraction
description: Phase 1 文本提取与 OCR 清洗。配合 book-to-blog/SKILL.md 使用。
---

# Phase 1 · 提取与清洗

**目标**：把输入的书（PDF/EPUB/DOCX/TXT）转成可读的全文文本 + 识别章节/目录结构，存入 `raw/<slug>/sources/`。

## 1.1 生成 slug

书名 → slug。规则：英文书名取核心词 + 可选年份，中文书名取拼音或英译。

```
"Professional Criminals of America" → professional-criminals-of-america
"Think Python" → think-python
"红楼梦" → hong-lou-meng
```

## 1.2 初始化目录

```bash
SLUG="<slug>"
mkdir -p ~/gongshangzheng.github.io/raw/${SLUG}/{sources,figures}
```

## 1.3 提取工具优先级

按文件类型选择，第一个可用的就用：

**PDF**：
1. `pdftotext`（poppler）— 最快，适合文本层 PDF：`pdftotext -layout "<pdf>" ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.txt`
2. `pypdf` — 文本层 fallback：`~/.venv/bin/python -c "from pypdf import PdfReader; ..."`
3. `docling` — 技术书（表格/代码/公式）或扫描件 OCR：`~/.venv/bin/python ~/.agents/skills/docling/scripts/convert.py "<pdf>" --format markdown --output ...`
4. 扫描件无文本层 → `pdftotext` 出空 → 用 docling `--ocr tesseract --force-ocr`，或 `pdftoppm` 渲染页为 PNG 后视觉确认

**EPUB**：`ebooklib` + `beautifulsoup4` 优先，stdlib `zipfile` fallback。

**DOCX/HTML/RTF/TXT/MD**：见 book-to-skill 的提取矩阵；本仓库已有 docling skill。

## 1.4 判断文本层 vs 扫描件

提取后抽查前 5 页和中段 5 页：
- 每页能抽出 ≥ 500 字可读文本 → 有文本层
- 抽出空或乱码为主 → 扫描件，走 OCR
- 文本层 + 空白页交替（如本书：文本页 ↔ 配图页）→ 混合型，空页是图版页，记录图版页位置

## 1.5 OCR 清洗

文本层 PDF 的 OCR 通常有：断词（`manufac-\nturers`）、long-s/f 误读（`fathom` 实为 `Hne`/`line`）、连字符乱码、跨页断句。清洗规则：

1. **合并断词**：行尾 `-` + 行首小写 → 拼接（`manufac-\nturers` → `manufacturers`）
2. **合并跨页断句**：页尾句未完 + 页首续句 → 拼接，不留页眉页脚
3. **去页眉页脚**：重复出现的页码、书名、章节名删掉
4. **保留原文拼写**：不"修正"古拼写（如 19 世纪英语），只在转写阶段处理
5. **标记图版页**：空页/图版页记为 `[FIGURE p.XX]`，供后续配图定位

清洗后存 `sources/<slug>.clean.txt`，原始提取存 `sources/<slug>.txt`。

## 1.6 章节结构识别

从目录页（CONTENTS / 目錄 / 目次）提取章节列表。规律：
- 有显式 "Chapter N" / "第 N 章" / "CONTENTS" 页 → 直接解析目录
- 只有 section title（无编号）或 roman numeral → 手动指定章节边界
- 每章记录：章名、起始页（printed page）、对应的文本行范围

输出 `sources/structure.md`：章节列表 + 每章的文本区间指针 + 全书统计（总页数、总字数、章数、图版数）。

## 1.7 大文件处理

- 500 页以上的书：pdftotext 仍秒级，docling 可能超时（~1.5s/页 → 10+ 分钟）
- 超时 → 分批：`pdftotext -f <start> -l <end>` 分段提取
- 仍超时 → 只提取关键章节（目录 + 各章首尾），中段按需补

## Gate 条件

进入 Phase 2 前必须满足：

- [ ] 全文文本已存入 `raw/<slug>/sources/`
- [ ] OCR 清洗完成（断词合并、页眉页脚去除、图版页标记）
- [ ] `sources/structure.md` 列出全部章节 + 文本区间
- [ ] 全书统计（页数/字数/章数/图版数）已记录
- [ ] 已创建 todo 并将 Phase 2 设为下一步
