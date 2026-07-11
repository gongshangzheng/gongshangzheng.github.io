---
name: book-to-blog
description: |
  把一本书（PDF/EPUB/DOCX/TXT）转换成博客 subcategory 系列文章（中文）。
  两种模式：full（全书中文转写，按章节/类型拆成系列 + Hub）和 extract（精读提取重要内容成单篇）。
  完整流程：文本提取 + OCR 清洗 → 章节结构识别 → 翻译/转写规范 → HTML 撰写 → 三路 Review → Hub + 发布。
  所有输出直接发布到博客，通过 html-blog 发表。
  MANDATORY TRIGGERS: 把这本书写成博客, 转换成博客, book to blog, 读书笔记, 整本书转中文,
  精读这本书, 读这本书, 书转博客, 转成中文, 全书转写, book notes, convert book
version: 1.0.0
category: knowledge-output
tags: [book, pdf, epub, translation, chinese, html-blog, review, series, hub]
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。

# Book-to-Blog — 整本书转博客

把一本书榨干，转成博客上结构化的中文系列文章。借鉴 [book-to-skill](https://github.com/virgiliojr94/book-to-skill) 的提取哲学（**合成而非复制、密度优先、按章按需加载**），但产物不是 skill，而是 `~/gongshangzheng.github.io/src/pages/` 下的 HTML 系列文章。

> **核心理念**：忠实于原书的事实与结构，但用干净中文转写，不逐字硬译、不继承 OCR 噪声。宁可分篇也不要单篇臃肿。
> **最终交付**：Hub 总览页 + 若干中文文章 + 博客发布链接。

## 何时使用

**使用**：
- "把这本书写成博客" / "整本书转中文" / "转换成博客"
- 给一个 PDF/EPUB 路径 + "做成博客系列"
- "读书笔记：XX 书" 且要求覆盖全书
- "精读这本书，提取重要内容"（extract 模式）

**不要使用**：
- 单篇论文/文章解读 → `read-article`
- 课程 PPT/课件做笔记 → `course-notes`
- 学术领域调研/综述 → `academic-research`
- 历史事件叙事 → `historical-narrative`
- 只想口头聊聊书的内容 → 直接回答

## 模式

| 模式 | 触发 | 产出 |
|------|------|------|
| `full`（默认） | "全书转中文""把这本书写成博客""整本转写" | Hub + 系列文章（每章/每类型一篇）+ 发布 |
| `extract` | "精读这本书""提取重要内容""做成一篇" | 单篇 HTML（提炼核心观点/方法/人物，不覆盖全书） |

模式由用户意图决定：明确要"全部""整本"→ full；只要"精读""提取""一篇""核心"→ extract。模糊时问一句。

## 输出

`full` 模式默认完整产出：
1. 提取清洗后的全书文本 → `~/gongshangzheng.github.io/raw/<slug>/sources/`
2. 章节结构图 + 文章拆分方案
3. Hub 总览页：`src/pages/<slug>-hub.html`（`--hub` 模板）
4. 若干系列文章：`src/pages/<slug>-<chapter>.html`
5. 三路 Review
6. `node build.js` + git push

`extract` 模式产出单篇 `src/pages/<slug>.html`，跳过 Hub。

## 共享引用

| 引用文件 | 内容 | 何时读取 |
|---------|------|---------|
| `~/gongshangzheng.github.io/.agents/skills/blog-categories/SKILL.md` | 分类路径、翻译注册表、新建分类规则 | 选分类路径、注册新书 subcategory 时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-categories/references/subcategory-organization.md` | 系列编号、谱段、已发布清单 | 分配 sub_id、登记新系列时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-aliases/SKILL.md` | aliases、sub_id、Hub 页别名 | 写 frontmatter 时 |
| `~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md` | HTML 写作规范、capture.js、组件语法 | Phase 4 撰写前必读 |
| `~/gongshangzheng.github.io/.agents/skills/blog-syntax/references/html-components.md` | 全部 HTML 组件语法 | 写正文时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` | 发布流程、验证清单 | 发布时 |

## 路由决策

| 任务阶段 | 读取文件 |
|---|---|
| Phase 1 · 提取与清洗 | `phases/extraction.md` |
| Phase 2 · 结构规划（拆篇 + Hub） | `phases/structure.md` |
| Phase 3 · 中文转写规范 | `phases/translation.md` + `references/translation-standards.md` |
| Phase 4 · HTML 撰写 | `~/.agents/skills/html-blog/SKILL.md` + `phases/composition.md` |
| Phase 5 · 三路 Review | `phases/review.md` + `subagents/review-*.md` |
| Phase 6 · Hub + 发布 | `phases/publish.md` |
| 目录式条目（人物/词条类书） | `references/entry-format.md` |

## 标准流程

1. **确认模式**（full / extract）+ 输入文件路径 + 目标书名
2. **创建 todo 清单**，记录书名、slug、源文件、目标分类路径、文章数预估
3. **Phase 1 提取**：读取 `phases/extraction.md`，提取全书文本 + 识别章节/目录结构
4. **Phase 2 结构规划**：读取 `phases/structure.md`，决定单篇 vs 系列、按什么维度拆篇、Hub 设计；输出结构图，用户确认后继续
5. **注册分类**：若书归入新 subcategory（如 `categories/读书笔记/<书名>`），按 `blog-categories` SKILL 注册到 `data/category-names.json`、删 `taxonomy-slugs.json`、`node build.js`、登记到 `subcategory-organization.md`
6. **Phase 3 转写**：读取 `phases/translation.md` + `references/translation-standards.md`，确定人名/地名/术语处理、OCR 清洗规则
7. **Phase 4 撰写**：读取 `~/.agents/skills/html-blog/SKILL.md` + `phases/composition.md`；**必须用 capture.js 建骨架**（系列文章用默认模板，Hub 用 `--hub`）；逐篇写 frontmatter + 中文正文
8. **Phase 5 Review**：同时派出 3 个 Review subagent（`review-fidelity` / `review-completeness` / `review-html-format`），汇总修复 P0/P1
9. **Phase 6 Hub + 发布**：读取 `phases/publish.md`，建/更新 Hub，`node build.js`，git push
10. 用 `node lib/lint-html.js <page.html>` 逐页校验

## 硬规则

- **必须调用 capture.js**：文章创建走 `node ~/.agents/skills/html-blog/capture.js <slug>`，Hub 走 `--hub`，禁止徒手写 frontmatter
- **每步执行前先读对应 phase/references 文档**，不要跳过
- 开始执行前先创建 todo 清单
- **忠实但精炼**：转写去 OCR 噪声、保留全部事实（人名、日期、数字、地点、罪名、关系），但不逐字硬译、不继承乱码
- **不得逐字复制原文长段**：合成转述，保留事实骨架；原书公版时可较完整转写条目式内容（人物描述/履历），但仍需润色
- **人名保留原文 + 首次给中文音译**：如 "Rufus Minor（鲁弗斯·迈纳）"，后续用原文
- 系列文章：统一 `aliases` 分类路径、统一标题前缀、统一 sub_id 步长（10）、Hub `sub_id: 0`
- HTML 只能是 frontmatter + 裸正文，不写完整 HTML 外壳
- 正文小节标题用 `<h3 class="section-title">` / `<h4 class="ch-section">`，禁止裸 h3/h4
- 配图遵循 `blog-rules/references/image-priority.md`；PDF 提取图优先于 AI 生图，AI 生图仅在非学术场景且无真实图时兜底
- 重要事实性句子必须带 `#key#` 引用，底部 `.sources` 列表配 `data-cite-key`（原书作为来源）
- 不得为了压缩篇幅删除核心人物、罪名、日期、数字
- 所有 Review subagent resolved 后才发布

## 与 book-to-skill 的区别

book-to-skill 产出的是一个 **Claude skill**（SKILL.md + chapters/ + glossary，供 agent 按需加载）。本 skill 产出的是**博客文章**（HTML，给人读）。两者共享"按章拆分、合成而非复制、密度优先"的提取哲学，但交付物、读者、发布管线完全不同。本 skill 不生成 chapters/ 或 glossary 文件，只生成 `src/pages/*.html`。
