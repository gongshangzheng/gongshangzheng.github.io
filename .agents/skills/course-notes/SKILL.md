---
name: course-notes
description: |
  生成、重写或扩展课程学习笔记，最终输出为 HTML 博客页面（不生成中间 org/Markdown 笔记）。
  完整流程：文件内容理解 → 网页参考 → 笔记写作 → 博客发布 → 三路并行审查。
  所有输出必须直接发布到博客，禁止生成中间 org 或 Markdown 文件。
  MANDATORY TRIGGERS: 课程笔记, 课件笔记, PPT 做笔记, 补充某一节, 重新跑课程,
  讲得看不懂要重写, 作业例题融入, 固定模板, 笔记发布到博客,
  读PPT做笔记, PPT笔记, 课程笔记发布, ppt notes, lecture notes,
  publish lecture notes, 批量课件, 整理课件, course notes, 笔记发布到博客
version: 3.0.0
category: knowledge-output
tags: [course, notes, ppt, homework, web-research, html-blog, template, docling, review]
---

# Course Notes Skill

> **重要：本 skill 所有输出必须直接发布到博客（HTML），禁止生成中间的 org 或 Markdown 文件。**

把课程材料重写成真正可读的学习笔记。目标读者是"课上半懂不懂、复习时需要完整链条"的学生：从问题动机进入，先讲清概念本身，再给出定义、推导和例子，配合图示、速查表和后续衔接。写作主线必须从概念和问题出发，避免以"作业要求/题目要求/老师要求"为叙述主线；作业和实验应作为例子落地概念。

## 执行规则

1. 读本文后，立即用 `todo_write` 创建全阶段 todo 清单。
2. 必须按 Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 顺序推进；不得跳过、合并、并行执行任何阶段（Phase 4 内部的并行写作除外）。
3. 每进入一个阶段：标记 `in_progress` → `read` 对应的 `phases/` 文件 → 按文件执行。
4. 每完成一个阶段：标记 `completed` → 检查该 phase 文件末尾的 **Gate** 条件。
5. Gate 未通过 → 禁止进入下一阶段，修正后重新检查。
6. **所有课程笔记必须直接发布到博客（HTML）**，禁止生成中间的 org 或 Markdown 文件。必须调用 `html-blog` 作为唯一发布入口：先读取 `~/.hanako/skills/html-blog/SKILL.md`，按其模板、组件、frontmatter、图片和构建规则落盘；course-notes 只负责课程内容组织、质量门和素材合成。
7. 内容分析调用 `docling` skill 提取文本/公式。纯图片 PDF（docling 无文本输出）需要先把关键页渲染成图片，再用可用的图片理解能力分析截图。
   - **当前工作机专属**：在 tangwen 的当前工作机上，可以使用 `~/.venv` 安装/调用 `PyMuPDF`，将 PDF 指定页渲染为 PNG，再用 `read_file` 读取图片进行视觉确认。不要把这当作通用环境假设；在其他机器上应先检查工具是否存在。
   - 通用兜底：用 `read` 工具读取图片（内置视觉模型，首选），备选 `pdftoppm` 或 GLM 视觉 MCP，可按可用工具分析关键页截图。
8. 用户若未明确要求"只做前期分析"，默认执行到 **HTML + 博客发布 + 三路审查完成**。

## 管线总览

```
课程文件（PPT/PDF/课件）
    │
    ▼
Phase 1 · SCOPE ──────────── 明确课程、章节、输出格式、已有笔记缺口
    │
    ▼
Phase 2 · MATERIALS ──────── 读取/转换 PPT/教材/作业/实验内容，理解知识点
    │
    ▼
Phase 3 · WEB REFERENCES ─── 网页搜索高质量参考笔记，筛选、标注、吸收
    │
    ▼ ━━━ ━━━ ━━━ ━━━ 并行 ━━━ ━━━ ━━━ ━━━
    │
Phase 4 · COMPOSITION ────── 按课程笔记结构写作，直接调用 html-blog 生成 HTML
    │
    ▼
Phase 5 · REVIEW + PUBLISH ─ 三路并行审查 + 修复 + 发布
    │
    ├── review-fidelity ──── 保真度审查（内容是否忠于课件）
    ├── review-completeness ─ 完整性审查（覆盖是否饱满）
    └── review-html-format ── HTML 格式审查（组件规范、MathJax、build.js）
```

## 阶段索引

| 阶段 | 文件 | Gate |
|------|------|------|
| Phase 1: SCOPE | `phases/scope.md` | 用户确认范围 + 已有笔记缺口分析完成 |
| Phase 2: MATERIALS | `phases/materials.md` | 课件内容理解完成 + 知识点提取完整 |
| Phase 3: WEB REFERENCES | `phases/web-references.md` | 参考笔记筛选完成 + 来源标注完整 |
| Phase 4: COMPOSITION | `phases/composition.md` | HTML 初稿完成 + build.js 通过 |
| Phase 5: REVIEW | `phases/review.md` | 三路审查 P0 项全部修复 + build.js 零失败 |
| Phase 6: HUB PAGE | `phases/hub-page.md` | Hub 页已生成（多章节系列时） |

## Hub 页生成（多章节系列）

当一次课程笔记产出覆盖**多个章节**（≥2 篇独立文章）时，Phase 6 自动触发：

### 触发条件
- 产出为 2 篇及以上独立 HTML 文章（如“第1章”“第2章”...）
- 文章天然存在阅读顺序

### 执行步骤

1. **统一分类**：所有章节文章必须共享相同的 `subcategory`（如“数字信号处理”）
2. **创建 Hub 页**：
   ```bash
   cd ~/gongshangzheng.github.io
   node ~/.hanako/skills/html-blog/capture.js <course>-hub --hub
   ```
3. **填充 Hub 页**：使用 `chapter-list` 布局，按章节顺序列出每篇文章
4. **Frontmatter**：`subcategory` 与章节文章一致，添加 `aliases` 便于搜索
5. **每篇文章 frontmatter 添加** `hub: <course>-hub`
6. **构建验证**：`node build.js` + git push

### Hub 页内容示例

```html
<div class="hub-section fade-in">
  <div class="section-title">📚 章节目录</div>
  <ul class="chapter-list">
    <li><span class="chapter-num">01</span>
        <span class="chapter-title"><a href="dsp-ch1.html">第一章：信号与系统</a></span>
        <span class="chapter-status done">✓ 已完成</span></li>
    <li><span class="chapter-num">02</span>
        <span class="chapter-title"><a href="dsp-ch2.html">第二章：Z 变换</a></span>
        <span class="chapter-status done">✓ 已完成</span></li>
  </ul>
</div>
```

## 三路并行审查机制

Phase 5 完成后，**同时派出 3 个 Review subagent**，从不同角度并行审查笔记质量。

| Review Agent | 职责 | 检查文件 |
|---|---|---|
| `review-fidelity` | 保真度审查 — 内容是否忠于课件，数据是否正确 | HTML 文件 + 课件原文 |
| `review-completeness` | 完整性审查 — 覆盖是否饱满，字数配图是否达标 | HTML 文件 + 课件原文 |
| `review-html-format` | HTML 格式审查 — 组件规范、MathJax、build.js | HTML 文件 |

### 派发指令模板

```
任务：执行 <review-fidelity|review-completeness|review-html-format> 角度的课程笔记质量审查。

课程名称：<course_name>
章节：<chapter>
HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>.html
课件原文：<ppt/pdf 路径>
模板文件：~/.hanako/skills/course-notes/subagents/<review-name>.md

读取模板文件后，按模板要求逐项检查并输出报告。
```

### 汇总与修复

主 agent 汇总 3 个 Review 报告：
- 所有 P0（必须修复）项：主 agent 直接修复，或派补充 subagent
- P1 项：根据时间和优先级决定是否修复
- 严重问题（如核心概念错误、公式推导错误）：退回 Phase 2 或 Phase 3 补充

## 课程笔记 Frontmatter 规范

课程笔记的 frontmatter 除遵循 html-blog 规范外，还需注意：
- `category`：必须为 `"课程笔记"`
- `subcategory`：课程名称（如 `"微观经济学"`、`"线性代数"`）
- `description`：**必填**，必须是一句独立、可读、可直接用作页面摘要和 SEO 描述的话，概括本篇核心主题、方法或收获；禁止留空、禁止只写课程名、禁止用“课程笔记/第 X 讲”这类空泛描述敷衍
- `sub_id`：章节顺序，整数；**默认自动分配**。生成新课程笔记时，先检索博客中同一 `subcategory` 的已有课程笔记，读取它们现有的 `sub_id`，再按顺序为新文章填写下一个可用整数。只有当用户明确指定章节号、或当前文章本身就是对某个既有章节的重写/覆盖时，才允许直接使用指定 `sub_id`
- 其余字段（`title`、`tags`、`mathjax` 等）按 html-blog 规范填写

## 核心质量标准

### 最低要求

| 必须包含 | 最低量 |
|---------|--------|
| 核心概念完整推导 | 每个概念有"为什么→是什么→怎么推→怎么用→例子" |
| Frontmatter description | 1 句完整摘要，能独立说明本篇主题 |
| 课件引用 | 每个知识点引用 PPT 页码或教材章节 |
| 外部参考 | 至少引用 3 个高质量外部参考 |
| 关键图片 | ≥ 3 张（优先代码绘制：mermaid/jsxgraph） |
| 数学公式 | ≥ 5 个（含推导过程） |
| 例题 | ≥ 2 个（含完整解题步骤） |
| HTML 正文总量 | ≥ 3000 字 |

### 内容质量

- 不写空泛提纲，每个核心概念要有"为什么需要它 → 它是什么 → 怎么推出来 → 怎么用 → 用一个具体例子落地"。
- 叙述必须从概念本身和学习问题出发，不能用"某作业要求这样做"代替概念解释；作业题只能作为例题、验证或应用场景。
- 必须读取课程原始材料，引用 PPT 页码、教材章节、作业题号或实验步骤。
- 必须网页搜索并参考外部课程笔记/教材说明/教学页面；引用时标注来源角色。
- 公式要解释符号、条件和推导跳步。
- 例题要包含题目、目标、步骤、答案和易错点。

### 配图规范

- 数学/信号函数图优先用 `jsxgraph`（functionplot 为旧语法兼容）
- 架构图/流程图/时序图用 `mermaid`
- 不再生成 SVG；遇到结构图、信号流图或工程示意图时，优先使用课件 `docpage`/`docref`、Mermaid、JSXGraph、表格或公式化文字结构
- 课件引用：只有当课件页内容已经被正文完整转述、解释或推导，只需标注出处时才用 `docref`；如果正文没有完整复现页面内容，或页面包含读者需要直接看到的演示图、框图、频谱、公式版面、例题步骤，则用 `docpage`/`docpages`
- 图片类资产（实验结果截图、手绘示意图等）用 `<div class="photo"><img>` + `media/images/`
- 配图优先级：课件 docpage/docref、jsxgraph、mermaid、表格和公式说明优先；不要用 SVG 作为兜底方案

## Subagent 模板

| 模板 | 用途 |
|------|------|
| [`subagents/review-fidelity.md`](subagents/review-fidelity.md) | Phase 5 保真度审查 |
| [`subagents/review-completeness.md`](subagents/review-completeness.md) | Phase 5 完整性审查 |
| [`subagents/review-html-format.md`](subagents/review-html-format.md) | Phase 5 HTML 格式审查 |

## 输出模式

| 用户需求 | 输出 |
|---------|------|
| "写课程笔记/整理这一章" | 直接调用 html-blog 生成 HTML 博客页面，不生成中间 org/Markdown |
| "发布到博客/生成 HTML/更新博客" | 调用 html-blog 生成 / 更新 HTML 博客页面 |
| "补充现有页面" | 读取现有页面后局部重写，保持站点风格 |
| "PPT/PDF 做笔记 → 引用课件页" | 内容分析走 docling；博客中只是标注出处用 docref，需要展示课件页才用 docpage/docpages（PDF 放 media/） |
| "批量课件" | 先 docling 逐文件转换（逐个处理避免超时），再按主题并行整理 |
| "作业/实验融入" | 必须写题目、目标、步骤、结果、易错点 |

## 按需读取索引

| 需要 | 读取 |
|------|------|
| 课程笔记质量门 | 本文件 §核心质量标准 |
| 网页参考笔记搜索与筛选 | `phases/web-references.md` |
| 笔记写作结构和模板 | `phases/composition.md` |
| HTML 片段模板 | 读取 `html-blog/templates/course-note-section-template.html`，由 html-blog 维护 |
| PDF 内容分析 | `docling skill`（`~/.hanako/skills/docling/scripts/convert.py`） |
| 博客 docref/docpage/docpages 与 functionplot/jsxgraph/mermaid shortcode 语法 | `html-blog/references/syntax.md`（§本地课件引用、§数学/信号函数图、§Mermaid 图表） |
| 纯图片 PDF 截图分析 | 先渲染关键页为图片；当前工作机专属可用 `~/.venv` + `PyMuPDF` + `read_file` 视觉确认，其他环境再按可用工具选择 `pdftoppm` / 视觉 MCP |
| 保真度审查 | `subagents/review-fidelity.md` |
| 完整性审查 | `subagents/review-completeness.md` |
| HTML 格式审查 | `subagents/review-html-format.md` |
| 失败路径处理 | `phases/failure-paths.md` |

## 交接到其他技能

| 场景 | 技能 |
|------|------|
| 所有 PDF/PPTX/扫描件内容解析 | **`docling`**（唯一入口，只做内容理解，不用于博客配图） |
| `.pptx` 编辑/创建 | `pptx` |
| 生成或发布博客 HTML | **`html-blog`**（最终页面生成、模板、组件、frontmatter、图片/课件页引用、构建与发布的唯一入口） |
| 需要结构图或信号流图 | 优先使用课件 `docpage`/`docref`、Mermaid、JSXGraph、表格或公式化文字结构；不要交给 `svg-animations` |
| 需要系统性学术综述 | `hanako-deep-research` 或 `academic-research` |

## 大文件与超时处理

docling 对大（50+ 页）或纯图片的 PDF 可能超时（>300s）。参考 docling skill 踩坑记录：

1. **单个大 PDF 超时**：逐个处理，不并行执行 docling
2. **纯图片 PDF 兜底**：先把少量关键页渲染成图片，再逐张视觉分析。
   - **当前工作机专属**：可用 `~/.venv` 安装/调用 `PyMuPDF` 渲染指定页，例如：
     ```bash
     ~/.venv/bin/pip install PyMuPDF
     ~/.venv/bin/python - <<'PY'
     import fitz, pathlib
     pdf = 'media/pdf/dsp/第五讲1.pdf'
     out = pathlib.Path('/tmp/course-pages')
     out.mkdir(parents=True, exist_ok=True)
     doc = fitz.open(pdf)
     for page_no in [4, 6, 7]:
         pix = doc[page_no - 1].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
         pix.save(out / f'page-{page_no}.png')
     PY
     ```
     渲染后用 `read_file` 读取 PNG 做视觉确认；任务结束必须清理 `/tmp/course-pages` 等临时目录。
   - 通用方案：若机器有 `pdftoppm`，可用 `pdftoppm -png -r 200` 渲染；若有视觉 MCP，可用对应工具分析截图。
3. **博客配图方案选择**：
   - 只是引用出处或页码 → `docref` shortcode + `media/pdf/课程名/`
   - 需要交互式课件页预览 → `docpage`/`docpages` shortcode + `media/pdf/课程名/`
   - 需要数学/信号函数图 → `jsxgraph`
   - 需要流程、结构、时序、状态关系 → `mermaid`
   - 需要精确工程符号、复杂路径、渐变、遮罩或动画说明 → 读取 `svg-animations` skill，用内联 SVG / SVG 动画
   - 需要静态截图/裁剪标注 → 先导出高质量 PNG 到 `media/images/`，再裁剪/标注并用 `<div class="photo"><img>`；当前工作机专属可用 `~/.venv` + `PyMuPDF`，其他环境可用 `pdftoppm -png -r 300` 等已确认存在的工具
