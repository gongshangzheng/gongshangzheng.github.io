---
name: read-article
description: |
  单篇论文/文章深度阅读与博客发布。从提取、背景调研、引用链挖掘、宝藏挖掘、方法论精析,
  到文章架构规划、教学式 HTML 撰写、配图添加、三路 Review、博客发布的完整管线。
  直接通过 html-blog 发表。
  被 academic-research 调用时：core-survey / must-read-paper 用 full 模式，
  route-representative / context-only 用 collect 模式（只产素材）。
  触发词：读这篇论文、帮我看看这篇、总结这篇、read this paper、深读、解读、精读。
metadata:
  default-enabled: true
  replaces: [capture-and-summarize, article-research]
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Read Article — 单篇论文深度阅读

将**单篇论文/文章**彻底榨干：提取全文 → 背景调研 → 多维度并行深度分析 → 综合整理 → 文章架构规划 → 教学式 HTML 撰写 → 配图 → Review → 博客发布。

> **核心理念**：每一次运行都充分榨取信息。不设文字量上限，宁可详尽不可遗漏。
> **最终交付**：HTML 深度解读长文 + 博客发布链接 + 可选邮件通知。
> **保留的中间产出**：raw 素材 + synthesis 综合分析。

> **前置 · 库内检索（必做）**：开始生成前，先按 [`blog-rules/references/pre-generation-search.md`](../blog-rules/references/pre-generation-search.md) 做库内检索——判断是新建、扩充已有文章、还是接力草稿，并收集关联文章供正文交叉引用。跳过此步导致重复创作是典型错误。

---

## 模式

| 模式 | 触发 | 产出 |
|------|------|------|
| `full`（默认） | 用户直接调用 | raw 素材 + synthesis + HTML + 博客 + 邮件 |
| `collect` | 被 `academic-research` 调用（route-representative / context-only 论文） | raw 素材 + synthesis（跳过架构规划/HTML/发布） |

---

## 执行规则

1. **必须创建 todo**：读本文后，立即创建全阶段 todo 清单。todo note 必须记录论文标题、slug、原始 URL/PDF/arXiv ID、目标 HTML、raw 目录和已分配 subagents。
2. 必须按 Phase 顺序推进；不得把中间结果当作完成态停下。
3. Phase 1-3 的产物只用于后续分析和写作，默认不作为最终交付。
4. 进入 Phase 5 前，必须完成 Phase 4（文章架构规划）。
5. 进入 Phase 5 前，必须读取 `~/.agents/skills/html-blog/SKILL.md`，所有 HTML 生成必须遵守其规范。
6. **默认生成博客**：用户若未明确要求"只做分析/只 collect/不生成博客"，默认执行到 HTML 文章生成 + 构建校验 + 发布准备完成。
7. **配图优先级**：用户截图 > arXiv source tarball 原始图片 > arXiv HTML 原图 > GitHub repo 图 > PDF 高 DPI bbox 裁图（脚本 `scripts/crop-figures-from-docling.py`）> 代码绘制 > 网络搜图。AI 生图完全禁止；Docling 自家 144 DPI referenced 渲染图禁止。详见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。
8. **中间文件保留完整事实**：Phase 2 的四份分析保留所有具体数值、公式、表格、超参数、实验配置。synthesis.md 是导航索引，记录"哪个事实在哪个文件"，用指针连接而非复制。
9. **重要事实性句子必须显式带引用**：至少覆盖论文贡献表述、实验数值、数据集/基线/指标、作者声明、时间线、引用链前置工作结论。引用必须使用 `#key#` 语法。
10. Phase 6 fidelity review 回原文核查，以论文全文为准。
11. 三路 Review 全部完成后汇总修复 P0/P1 问题，再进入 Phase 7。
12. `#key#` 引用标记同步配置底部 `.sources li` 的 `data-cite-key` 属性。
13. 数学符号使用 MathJax：`\(...\)` 行内 / `\[...\]` 块级。
14. **collect 模式下 survey 深读充分展开**：如果输入是 survey/review，collect 产物至少包括研究范围、taxonomy、任务输入/输出、metrics、datasets、代表方法表、关键结论、局限性、5-10 条可引用 claim。
15. **扁平数据流**：Phase 2 的四份分析是唯一的事实存储层，Phase 3 synthesis 是导航索引，Phase 5 直接从 Phase 2 产出 + 原文写 HTML。三类产物各司其职。
16. **Phase 5 写手数据源**：每个写作 subagent 读取 (a) Phase 2 产出文件 `~/gongshangzheng.github.io/raw/<slug>/subagents/`（background / citation / treasure / methodology），(b) 原文 `~/gongshangzheng.github.io/raw/<slug>/sources/`，(c) synthesis.md 作为导航参考。包括 5g（总结+收获）。

---

## 管线总览

```
输入: URL / PDF 路径 / 论文标题
  │
  ▼
Phase 1 · 提取 ──────────── raw/<slug>/sources/* + figures/*
  │
  ▼ ━━━ 并行 ━━━
  ├── Phase 2a · 背景调研 ── subagents/background.md
  ├── Phase 2b · 引用链挖掘 ── subagents/citation.md
  ├── Phase 2c · 宝藏挖掘 ── subagents/treasure.md
  └── Phase 2d · 方法论精析 ── subagents/methodology.md
  │
  ▼
Phase 3 · 导航索引 ──────── synthesis.md（轻量导航，不复制内容）
  │
  ▼
Phase 4 · 文章架构规划 ──── references/article-structure-template.md [full only]
  │
  ▼ ━━━ 顺序+并行 ━━━
Phase 5 · HTML 撰写 [full only]
  │  5a → 5b → (5c ∥ 5d ∥ 5e) → 5f → 5g
  │
  ▼
Phase 6 · 三路并行 Review [full only]
  │  review-fidelity ∥ review-completeness ∥ review-html-format
  │
  ▼
Phase 7 · 发布 [full only]
  │
  ▼
Phase 8 · 更新 Hub 页 [full only]
  │
  ▼
Phase 9 · 交叉引用回链 [full only]
```

## 渐进式披露路由

| 场景 | 读取文件 |
|---|---|
| 进入 Phase 2 前 | `references/paper-section-guide.md`（论文章节利用策略） |
| 进入 Phase 4 前 | `references/article-structure-template.md` |
| 进入 Phase 5 前 | `~/.agents/skills/html-blog/SKILL.md` + `phases/html-writing.md` |
| 进入 Phase 5e 前 | `~/.agents/skills/github-repo-read/SKILL.md`（若有代码仓库） |
| 进入 Phase 6 前 | `subagents/review-*.md` |
| 配图时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md` |
| 发布时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` |
| 进入 Phase 9 前 | `references/cross-linking.md` |

---

## Phase 1 · 提取

### 1.1 生成 slug

```
"MaskGIT: Masked Generative Image Transformer" → maskgit-2022
"Attention Is All You Need" → attention-2017
```

### 1.2 初始化目录

```bash
SLUG="<slug>"
mkdir -p ~/gongshangzheng.github.io/raw/${SLUG}/{sources,images/${SLUG},figures/${SLUG}}
```

### 1.3 arXiv 论文读取优先级

1. **首选 arXiv source tarball**（`https://arxiv.org/e-print/<arxiv-id>`）：提取 `.tex` 正文、figure 文件、caption
2. **次选 arXiv HTML**（`https://arxiv.org/html/<arxiv-id>`）：正文结构、公式/图表定位
3. **第三选择 PDF 结构化提取**：仅当 source 与 HTML 不可用时

arXiv 图片提取实操和详细规则见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。

### 1.4 分配提取 subagent

读取 `phases/extraction.md`。提取优先级：arXiv source → arXiv HTML → PDF Docling + pdftotext。

---

## Phase 2 · 并行深度分析（4 个 subagent）

> 进入本阶段前，读取 `references/paper-section-guide.md`，了解论文各章节在不同分析维度下的利用方式。

Phase 1 完成后，**同时派出 4 个 subagent**：

| Subagent | 读取模板 | 职责 |
|---|---|---|
| 背景调研 | `subagents/background.md` | 领域/作者/社区/影响 |
| 引用链挖掘 | `subagents/citation.md` | top 3-5 前置工作深度调研 |
| 宝藏挖掘 | `subagents/treasure.md` | 超参数/计算/失败/公式 |
| 方法论精析 | `subagents/methodology.md` | 架构/推导/损失函数 |

派发 prompt 模板：
```
任务：执行 Phase 2a（背景调研）。
读取模板：~/.agents/skills/read-article/subagents/background.md
论文标题：<title>
摘要：<abstract>
Slug：<slug>
```

---

## Phase 3 · 导航索引

主 agent 执行（不分配 subagent）。等待 Phase 2 全部完成后。

**Phase 3 的唯一功能是创建导航索引，不是再次总结。** Phase 2 的四份分析已经是完整的事实存储，Phase 3 不复制、不压缩、不重新叙述它们的内容。

生成 `~/gongshangzheng.github.io/raw/<slug>/synthesis.md`，内容仅为：

1. **事实位置索引**：列出 Phase 2 各产出文件中的关键事实及其位置指针（文件名:行号或章节标题），例如：
   - 核心公式 → `subagents/methodology.md` §3.2 + `sources/<slug>.md` L120-135
   - 实验配置表 → `subagents/treasure.md` §2.1
   - baseline 对比 → `subagents/methodology.md` §4.3 + `subagents/treasure.md` §3.2
2. **跨文件交叉引用**：标注多个 subagent 都提到的同一事实（方便写手去重），指向最详细的那份
3. **矛盾标注**：如果不同 subagent 对同一事实有不同描述，标注矛盾位置，注明以原文为准
4. **写作分配建议**：哪些 Phase 2 产出对应文章的哪个 Part

**synthesis.md 应该很短**（通常 200-500 字），因为它只是索引，不是内容。如果 synthesis 超过 1000 字，说明在复制内容而不是建索引。

---

## Phase 4 · 文章架构规划 [full only]

> 进入本阶段前，读取 `references/article-structure-template.md`。

在动笔写 HTML 之前，先规划文章骨架：

1. **分析全部素材**：通读 synthesis.md（导航索引）+ Phase 2 的四份分析产出 + 原文，了解有什么可用
2. **设计文章结构**：给出 2-3 种章节组织方案，推荐其一
3. **用户确认**：用户确认后进入 HTML 写作；用户无偏好时直接按推荐执行

标准 7-Part 结构、字数下限和质量底线见 `references/article-structure-template.md`。

---

## Phase 5 · 多阶段 HTML 撰写 [full only]

> ⚠️ 进入本阶段前，必须读取 `~/.agents/skills/html-blog/SKILL.md` + `phases/html-writing.md`。

Phase 5 拆分为 7 个子阶段，按 **5a → 5b → (5c ∥ 5d ∥ 5e) → 5f → 5g** 顺序执行：

```
5a 术语表 + 前置知识 ── subagents/terminology.md
  ↓
5b 问题定义 + 动机 ── subagents/problem-definition.md
  ↓
┌──────────────────────────────────────────────┐
│ 5c 方法写作    │ 5d 实验写作    │ 5e 代码分析      │
│ subagents/    │ subagents/    │ subagents/        │
│ method-       │ experiment-   │ code-analysis.md  │
│ writing.md    │ writing.md    │                   │
└──────────────────────────────────────────────┘
  ↓
5f 配图 ── subagents/image-collection.md
  ↓
5g 总结 + 收获 ── subagents/conclusion-writing.md
  ↓
主 agent 合并 → 完整 HTML
```

每个 subagent 读取对应模板文件后执行，输出 Markdown 片段。主 agent 在 5g 完成后合并为完整 HTML。

**执行方式可选**：
- **subagent 模式**（适合复杂论文）：派出 7 个 subagent，各自输出 Markdown，主 agent 按 Markdown → HTML 组件映射表（见 `phases/html-writing.md` §5.6.6）合并
- **主 agent 直接写 HTML**（默认，适合大多数论文）：主 agent 读取各 subagent 模板作为**写作检查清单**，直接用 html-blog 组件语法写 HTML。不需要中间 Markdown 转换

两种方式都必须遵循各模板的写作要求（公式处理、配图计划、字数下限等）。

**写作数据源规则**：每个写作 subagent（5a–5g）的输入**必须**包含两类文件：
1. **Phase 2 产出**（事实存储层）：`~/gongshangzheng.github.io/raw/<slug>/subagents/` 下的 background.md、citation.md、treasure.md、methodology.md
2. **原文**（最终校验层）：`~/gongshangzheng.github.io/raw/<slug>/sources/` 下的原文提取文件

synthesis.md 仅作为导航索引（"去哪里找什么"），不作为内容输入。原因：Phase 2 产出已经是完整的事实分析，如果写作阶段不直接读它们而是读一个压缩后的 synthesis，数值、公式、实验细节会丢失。5g（总结+收获）同样适用。

### 5e · 代码分析（若有 GitHub 仓库）

进入代码分析前必须先处理依赖：
1. 读取仓库依赖入口（pyproject.toml、requirements.txt 等）
2. 在隔离环境中安装最小依赖集
3. 安装后做轻量 smoke test（包导入 + `--help`）
4. smoke test 失败时，不得写成"已验证实现"

代码分析输出包含：仓库定位、代码组织总览、运行入口与调用链、核心代码解读（含真实代码片段）、论文方法与代码对应关系。

### 5f · 配图

配图来源优先级见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。

**禁止**：Docling `--image-export-mode referenced` / `_artifacts/` / `docpage/dcoref` 的 144 DPI 渲染图、AI 生图、hotlink 远程 URL。
**允许**：`scripts/crop-figures-from-docling.py` 的脚本化高清 bbox 裁图（只借 Docling JSON 坐标，渲染交 PyMuPDF），不在禁止集。

### 主 agent 合并流程

1. 按架构规划的章节顺序拼接各 Markdown 片段
2. 统一术语（以 5a 术语表为准）
3. 填写 frontmatter（见下方"Frontmatter 规范"）
4. 调用 html-blog 组件语法转为 HTML
5. 验证：≥ 3 张图、≥ 2 个公式、字数达标、MathJax 语法正确
6. 扫一遍最终 HTML，修正裸数学符号

### Frontmatter 规范

**标题**（`title`）必须遵循系列命名规则（见 `~/.agents/skills/blog-rules/references/series-rules.md`）：

| 文章类型 | 标题格式 | 示例 |
|---------|---------|------|
| 系列章节 | `<子分类>系列（序号）：主题` | `红外图像压缩系列（二）：学习式压缩` |
| 论文精读 | `<子分类>论文精读（序号）：论文名，副标题` | `红外图像压缩论文精读（三）：FreqKD，频率解耦蒸馏` |
| 工程解读 | `<子分类>工程解读（序号）：主题` | `数字人工程解读（一）：实时驱动管线` |
| 单篇（非系列） | 自由命名 | `TiTok：1D 视觉分词器综述` |

**禁止**：同一分类路径下标题格式不统一（如有的叫"深度解读"、有的叫"论文精读"）。

**`hub` 字段**：系列文章必填，值为 Hub 页 slug（如 `hub: digital-human-hub`）。独立文章省略。

**`tags` 字段**：3-5 个，硬性上限 5 个。超过 5 个标记为 P1 问题。

**论文信息字段（`paper_*`，全部可选）**：论文精读文章应在 frontmatter 中填写论文元信息，由构建系统渲染为正文顶部的“论文信息” `.info-box.paper-info`。不再手写正文内的论文信息 info-box（避免重复）。全部字段可选，一个都不填则不渲染，向后兼容旧文章。

| 字段 | 说明 |
|------|------|
| `paper_title` | 论文原标题；若同时填 `paper_url` 会自动加链接 |
| `paper_authors` | 作者。纯字符串原样渲染；`[A, B, C]` 形式用 `, ` 连接 |
| `paper_affiliation` | 作者单位。纯字符串原样渲染；`[A, B]` 形式用 `；` 连接 |
| `paper_venue` | 发表信息（期刊/会议 + 年份/卷期） |
| `paper_doi` | DOI；裸 DOI 自动链接到 `https://doi.org/<doi>` |
| `paper_url` | 论文规范链接（arXiv/DOI 页），用于包裹标题 |
| `paper_code` | 开源状态或仓库 URL（URL 自动加链接） |

示例：
```yaml
paper_title: "PMTNet: A Part-Centric Missing-Aware Temporal Network for Cat Behavior Recognition in Unconstrained Videos"
paper_authors: "Chunxi Tu, Jiatao Wu, Zeguang Huang, Jiaxing Xie"
paper_affiliation: "华南农业大学人工智能学院；广东省农业信息监测工程技术研究中心"
paper_venue: "Animals (MDPI), 2026, Vol. 16, No. 11"
paper_doi: "10.3390/ani16111589"
paper_code: "未开源（截至 2026.06 未找到官方仓库）"
```

**sub_id** 必须遵循编号规则（见 `~/.agents/skills/blog-aliases/SKILL.md` §5 + `~/gongshangzheng.github.io/.agents/skills/blog-categories/references/subcategory-organization.md`）：

1. 分配前**必须运行检查命令**：
   ```bash
   # 直接获取下一个可用 sub_id（输出格式：<sub_id>\t<路径>，排除 Hub 页）
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/check-sub-id.py --category <分类关键词> --suggest

   # 如需查看完整分布 + 冲突检查，去掉 --suggest
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/check-sub-id.py --category <分类关键词>
   ```
2. **同级编号**（步长 10，无例外）：
   - 每个深层路径内独立从 10 开始（10, 20, 30...）
   - 不同路径的 sub_id 互不影响（可以都是 10、20、30...）
   - 同一 3 级路径下多谱段：正文 10–90，精读 100+
   - ❌ 禁止使用旧分段编号（1000-1999、2000-2999 等）
3. 若文章属于已有系列，Hub 页通过 `aliases` 中的 `categories/.../index` 路径接管索引页
4. **禁止**：步长 ≠ 10、同段混用类型、与已有编号重复

### 写作风格

**段落级逻辑**：每个章节遵循 Motivation → Intuition → Mechanism 三层递进。

**禁止**：平铺直叙"X 提出了 Y 方法"；连续罗列贡献无叙事逻辑；直接上公式不解释意图；术语首次使用不解释。

**推荐**：使用教师口吻"我们可以看到..."；术语首次出现给一句定义或类比。

---

## Phase 6 · 三路并行 Review [full only]

HTML 写作完成后，**同时派出 3 个 Review subagent**：

| Review Agent | 读取模板 | 职责 |
|---|---|---|
| `review-fidelity` | `subagents/review-fidelity.md` | 保真度审查（回原文核查） |
| `review-completeness` | `subagents/review-completeness.md` | 完整性审查 |
| `review-html-format` | `subagents/review-html-format.md` | HTML 规范审查 |

**必须等待全部三路 Review 完成后汇总修复。** P0 问题必须修复后才能进入 Phase 7。

---

## Phase 7 · 发布 [full only]

发布前验证和发布流程见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`。

关键验证项：
1. 三路 Review 已全部完成，P0/P1 已修复
2. 引用使用 `#key#` 语法（非 `(Author, Year)`）
3. `.sources` 列表每条有 `data-cite-key`
4. 图片 ≥ 3 张且来源正确
5. 字数达标（见下方"质量底线"表格）
6. MathJax 语法正确（无裸数学符号）
7. `node build.js` 成功
8. 正文无写作过程元叙述

---

## Phase 8 · 更新 Hub 页 [full only]

检查新文章的 `subcategory` 是否与某个 Hub 页匹配：

1. 若匹配，在 Hub 页追加或更新 `chapter-list`
2. **sub_id 冲突检查**：分配前扫描同系列所有已有 `sub_id`（不只检查 aliases 路径，要检查同系列全部文章），确认无重复。同时检查 `sub_id` 数值与标题中文编号一致（如 420 ↔ 四十二）
3. **chapter-nav 双向更新**：
   - 新文章设置 chapter-nav：prev = 系列上一篇，hub = Hub 页，next = 暂缺或下一篇
   - 前一篇文章的 chapter-nav next 更新为指向新文章
   - 后一篇文章（若有）的 chapter-nav prev 更新为指向新文章
4. `node build.js` 重新构建

**必读**：
- 系列命名规则：`~/.agents/skills/blog-rules/references/series-rules.md`
- sub_id 编号规则：`~/.agents/skills/blog-aliases/SKILL.md` §5
- 现有分类路径分布：`~/gongshangzheng.github.io/.agents/skills/blog-categories/references/subcategory-organization.md`（按需读取）

---

## Phase 9 · 交叉引用回链 [full only]

> 进入本阶段前，读取 `references/cross-linking.md`，获取完整的交叉链接规则和自动化脚本。

新精读文章发布后，博客中可能已经存在对该论文的引用（在 `.sources` 列表或正文中），但缺少指向精读文章的链接。本阶段自动补全这些交叉链接。

### 9.1 识别精读文章

扫描 `src/pages/*.html`，**仅当 frontmatter `title` 包含"精读"或"深度解读"时**才视为精读文章。不限于 `paper-*.html` 命名模式——`toontalker-2023.html`、`theval-2025.html` 等也是精读文章。

> ⚠️ **关键**：Survey/系列/Hub 文章虽然正文提到"精读"且可能有 `.sources`，但**不是**精读文章，不应纳入映射。

### 9.2 构建映射

对每篇精读文章，**只取第一个 `data-cite-key`（主 cite-key）**，不使用参考文献列表中的其他 cite-key。同时从标题提取论文简称。

| 映射表 | 键 | 值 | 用途 |
|--------|-----|-----|------|
| `cite_to_paper` | 主 cite-key（仅第一个） | 精读文章文件名 | 匹配 `.sources` 条目 |
| `name_to_paper` | 论文简称（标题中"精读（N）："后、逗号前） | 精读文章文件名 | 匹配正文提及 |

> ⚠️ **禁止**映射所有 cite-key：精读文章 A 的 `.sources` 中引用了论文 B/C/D，这些 cite-key 属于 B/C/D 各自的精读文章，不应映射到 A。

### 9.3 补全 `.sources` 交叉链接

对博客中所有 HTML 文件的 `.sources` 列表，检查每个 `<li data-cite-key="...">` 条目：

- 若该 cite-key 对应另一篇精读论文 → 在 `</li>` 前追加 ` · <a href="<精读文章>" class="paper-link">精读 →</a>`
- 若已存在指向该精读文章的链接 → 跳过

示例：
```html
<!-- 修改前 -->
<li data-cite-key="Prajwal-et-al.-2020">Prajwal, K. et al. (2020). <strong>Wav2Lip</strong>.
  <a href="https://arxiv.org/abs/2008.10010" target="_blank">arXiv:2008.10010</a>.</li>

<!-- 修改后 -->
<li data-cite-key="Prajwal-et-al.-2020">Prajwal, K. et al. (2020). <strong>Wav2Lip</strong>.
  <a href="https://arxiv.org/abs/2008.10010" target="_blank">arXiv:2008.10010</a>
  · <a href="paper-wav2lip.html" class="paper-link">精读 →</a></li>
```

### 9.4 补全正文交叉链接

对博客中所有 HTML 文件的正文（非 frontmatter、非 `.sources` 区域），检查论文常用名：

- 若该名称对应一篇精读论文，且当前文件未链接到该精读文章 → 在**首次出现**处将名称包裹为 `<a href="<精读文章>">名称</a>`
- 每篇文章中每个论文名**只链接首次出现**，避免过度链接
- 跳过场景：已有 `<a>` 包裹、表格属性列、`<th>` / `<td>` 短文本、`tags` / `aliases` frontmatter

### 9.5 新精读文章自身回链

新发布的精读文章也可能在其 `.sources` 中引用了已有精读论文。按 9.2 同样规则补全。

### 9.6 验证与重建

1. 验证 `.sources` 链接：逐个 `<li>` 匹配检查（**禁止**跨 `</li>` 边界的 regex，会误报）
2. `node build.js` 重新构建
3. 运行 `npm test` 确认无回归
4. `git diff` 检查变更范围合理（仅添加了 `<a>` 标签，未修改正文内容）

### 自动化脚本

交叉链接的扫描和补全可使用 `scripts/cross-link.py` 一键完成：

```bash
# 完整回链（清理已有链接 + 重建 .sources 链接 + 重建正文链接）
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py

# 只查看会做什么修改（dry-run）
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py --dry-run

# 只补全 .sources 链接（跳过正文）
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py --sources-only
```

手动执行时按上述步骤逐一处理。详见 `references/cross-linking.md`。

---

## 质量底线

以下标准是最终 HTML 的硬性门槛，Review 阶段逐项检查：

| 指标 | 最低要求 |
|------|---------|
| **HTML 正文总量** | 常规论文 ≥ 3000 字；复杂系统/综述 ≥ 4000 字 |
| Part 1 引言 + Part 2 问题剖析 | ≥ 500 字 |
| Part 3 模型结构与创新 | ≥ 1000 字 |
| Part 4 Training Pipeline | ≥ 500 字（含训练配置披露表，10 项逐项标注） |
| Part 5 Inference Pipeline | ≥ 500 字（实时论文 ≥ 700 字，含 Streaming Pipeline） |
| Part 6 实验配置与验证 | ≥ 600 字（含实验配置表，6 项逐项标注） |
| Part 7 讨论与启发 | ≥ 300 字 |
| 代码分析（若有） | ≥ 400 字 |
| 图片 | ≥ 3 张（优先论文原图） |
| 公式 | ≥ 2 个完整公式（MathJax） |
| 超参数 | ≥ 3 个具体数值 |
| 引用 | 重要事实句全部带 `#key#` |
| baseline 对比表 | ≥ 1 个（含具体数值） |
| 消融实验 | ≥ 1 个发现 |

---

## 故障处理

### Docling 超时或失败

```bash
# 方案 1：下载 PDF 本地提取
curl -L "<url>" -o /tmp/${SLUG}.pdf
~/.venv/bin/python ~/.agents/skills/docling/scripts/convert.py \
  /tmp/${SLUG}.pdf --format markdown --max-pages 10 \
  --output ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.md

# 方案 2：OCR 扫描件
~/.venv/bin/python ~/.agents/skills/docling/scripts/convert.py \
  /tmp/${SLUG}.pdf --ocr tesseract --force-ocr \
  --format markdown --output ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.md
```

### 用户只给了标题

用 `web_search` 搜索标题，找到 arXiv / Semantic Scholar 链接后正常走流程。

### Review 发现大量缺口

派一个补充 subagent，针对缺口从 synthesis.md 和原文中补充。
