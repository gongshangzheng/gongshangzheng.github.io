# Proposal: doc-intake 全局 Skill 整合

## Why

文档提取实现目前散落四处，互相重复且维护成本高：

1. **博客仓库内**：`scripts/crop-figures-from-docling.py`、`scripts/convert-figures.py`、`.agents/skills/read-article/scripts/fetch-arxiv-paper.py`（其 LaTeX→Markdown 用全局正则剥离命令，会破坏数学公式 `\frac{a}{b}` 等）、`render-latex-table.py`。
2. **Hanako 内**：`~/.hanako/skills/docling/scripts/convert.py`（多个 skill 硬编码引用）、已弃用的 `office-documents/`。
3. **本机 Hana 插件**：`~/.hanako/apps/doc-intake/` v3.1.0（GitHub 上游已到 v3.2.5），其 Python 内核可复用但绑定了 Hana 外壳。
4. **全局**：`deepxiv` CLI（论文全文/章节提取，公式无损）未被 read-article 使用；`scientific-agent-skills/paper-lookup` 有高质量的 `arxiv_atom.py` / `jats_to_text.py`。

同时发现多个盲区：macOS 下 Pillow 无法转换 EMF/WMF（doc-intake 的 emf_converter 必败）；无云端 Token 时 OCR 无本地兜底；`.epub/.rtf/.odt/.csv` 无入口；Docling 旧缓存可能误当成功结果。

**关键决策**：上游官方实现（`opendatalab/MinerU`、`H-i-m-s/doc-intake`）原样保留在 `upstream/` 目录，全局 Skill 只做管理层（路由、适配器、补缺工具），不修改上游源码，不 fork。这样可持续享受官方升级。

## What

1. 创建全局 `~/.agents/skills/doc-intake/`：管理层 SKILL.md + 适配器 + 自有工具 + `upstream/` 浅克隆 + `upstream.lock.json` + 回归测试。
2. 安装 MinerU 4.x（`uv tool`，独立环境），官方 Skill 经软链接暴露；MinerU 成为本地文档解析首选后端。
3. `read-article` Phase 1 改为 `deepxiv`（正文/章节）+ `doc-intake arxiv --assets-only`（源码包/原图/TeX 表格）双通道。
4. 更新 `academic-research`、`course-notes`、`book-to-blog`、`deep-research`、`blog-rules` 的提取指令，全部收口到全局 Skill。
5. 解耦 CI：`check-figure-whitespace.py` 内联 `crop_whitespace`，删除仓库旧提取脚本。
6. 建立 Hanako 软链接，验证后清理 `~/.hanako/skills/docling/`、`office-documents/`。

## Out of Scope

- 不修改 `upstream/` 中任何上游源码；不 fork MinerU。
- 不重复实现 MinerU 已支持的 EPUB/RTF/OpenDocument/CSV 解析器。
- 不改变 read-article 的 OpenSpec/写作/审校/发布门禁。
- 不自动上传文档到 MinerU Remote（隐私规则：本地优先，`--remote` 需用户同意）。
- 不删除 `~/.hanako/apps/doc-intake/`（Hana 桌面插件，需用户另行确认）。
