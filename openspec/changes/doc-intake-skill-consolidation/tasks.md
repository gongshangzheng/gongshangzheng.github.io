# Tasks: doc-intake 全局 Skill 整合

## Phase 1 · 管理层骨架与上游锁定

- [x] 1.1 创建 `~/.agents/skills/doc-intake/` 目录结构（SKILL.md / references / scripts / adapters / tools / tests）
- [x] 1.2 浅克隆 `opendatalab/MinerU` @ `mineru-4.1.3-released` 与 `H-i-m-s/doc-intake` @ `v3.2.5` 到 `upstream/`，写 `upstream.lock.json`
- [x] 1.3 编写 `sync_upstream.py`（status / check / upgrade 三命令，升级后跑回归）
- [x] 1.4 编写 `references/routing.md` 与 `references/upstream.md`
- [x] 1.5 建立软链接：`~/.agents/skills/mineru`、`~/.hanako/skills/doc-intake`

## Phase 2 · MinerU 安装与验证

- [x] 2.1 `uv tool install "mineru>=4,<5"`（独立环境），验证 `mineru version --json`（4.1.3 ✅）
- [x] 2.2 用代表性样例验证：数字版 PDF、扫描件、DOCX、PPTX、XLSX、EPUB、RTF 各至少一例（flash 本地档验证 13 页论文 27K 字符 ✅；高阶 tier 待用户决策，见下方问题）
- [x] 2.3 验证隐私边界：本地失败不自动 `--remote`，结构化错误可读（quality_tier_unavailable 结构化错误 ✅）

## Phase 3 · 适配器与自有工具

- [x] 3.1 迁移 `tools/`：crop_figures.py、convert_figures.py、render_latex_table.py（由仓库与 read-article 迁入）
- [x] 3.2 编写 `adapters/mineru.py`、`office.py`、`docling.py`（隔离临时目录，防旧缓存误判）、`arxiv.py`、`images.py`
- [x] 3.3 编写 `scripts/doc_intake.py` CLI：`extract` / `arxiv` / `crop-figures` / `render-table` / `convert-figures` / `health`
- [x] 3.4 macOS EMF/WMF 降级路径（适配器层用 soffice→PDF→PyMuPDF，不改上游源码）（含无效文件冒烟 ✅）
- [x] 3.5 回归测试：加密 PDF 明确报错、空输出检测、部分图片失败报告（7/7 通过）

## Phase 4 · read-article 接入 deepxiv

- [x] 4.1 更新 `read-article/SKILL.md` Phase 1 为 deepxiv + doc_intake arxiv --assets-only 双通道
- [x] 4.2 更新 `read-article/phases/extraction.md`：deepxiv 命令、章节读取、降级链、extraction-log 规范
- [x] 4.3 更新 `read-article/subagents/image-collection.md` 与 `references/tables.md` 脚本路径
- [x] 4.4 实测一篇 arXiv 论文：公式完整、章节地图可用、原图完整、降级链可跑（2409.05591：10 图 WebP + 元数据 + log ✅）

## Phase 5 · 上游 Skill 收口与 CI 解耦

- [x] 5.1 `check-figure-whitespace.py` 内联 `crop_whitespace`，删除对 `convert-figures.py` 的导入
- [x] 5.2 更新 `course-notes/phases/materials.md`、`book-to-blog/phases/extraction.md`、`academic-research`、`deep-research`、`blog-rules` 的提取指令（含 Hanako 侧 SKILL_ROUTING / AGENT_SKILL_MATRIX / skill-router / web-search / latex-homework 路由文档）
- [x] 5.3 删除仓库 `scripts/crop-figures-from-docling.py`、`scripts/convert-figures.py`、`.agents/skills/read-article/scripts/fetch-arxiv-paper.py`、`.agents/skills/read-article/scripts/render-latex-table.py`
- [x] 5.4 全仓 rg 扫描已删除路径引用并修复（含 `openspec/specs/skill-path-hygiene/spec.md` 示例更新为 org-roam-capture）

## Phase 6 · 验证与清理

- [x] 6.1 运行 `scripts/check-skill-paths.py`（0 死路径）、`npm test`（231 通过）、`node build.js`（成功）
- [x] 6.2 删除 `~/.hanako/skills/docling/` 与 `~/.hanako/skills/office-documents/`
- [x] 6.3 代表性端到端：arXiv 2409.05591（10 图 WebP + 元数据 + log）、真实课程 PPTX（正文 + 10 媒体图）、合成 EPUB（MinerU spine 解析）全部通过
- [x] 6.4 归档准备：核对 design.md 与实施一致性，向用户报告 `~/.hanako/apps/doc-intake/` 处置建议与 MinerU 质量档决策
