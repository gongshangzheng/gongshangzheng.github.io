---
name: read-article
description: |
  单篇论文/文章深度阅读与博客发布。主 agent 优先：素材获取 → 按需分析 → synthesis 导航索引 →
  planning draft 交互 → 固化 OpenSpec change → 教学式 HTML 撰写 → 统一审校 → 发布与交叉回链。
  直接通过 html-blog 发表。subagent 从默认流程改为按需分析 lane，确定性工作交给脚本。
  被 academic-research 调用时：core-survey / must-read-paper 用 full 模式，
  route-representative / context-only 用 collect 模式（只产素材）。
  为草稿调研时用 draft 模式（核心信息+核心图片落草稿，不产 HTML）。
  触发词：读这篇论文、帮我看看这篇、总结这篇、read this paper、深读、解读、精读、存到草稿。
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

将**单篇论文/文章**彻底榨干：提取全文 → 按需深读 → synthesis 索引 → planning draft 交互 → 固化 change → 教学式 HTML 撰写 → 统一审校 → 发布维护。

> **核心理念**：每一次运行都充分榨取信息。不设文字量上限，宁可详尽不可遗漏。
> **最终交付**：HTML 深度解读长文 + 博客发布链接 + 可选邮件通知。
> **保留的中间产出**：raw 素材 + analysis 分析 lane + synthesis 导航索引 + planning draft。
> **主 agent 优先**：默认不派 subagent；复杂度决定是否升级到 assisted / deep。

> **前置 · 库内检索（必做）**：Phase 4 生成 planning draft 前，先按 [`pre-generation-search.md`](../blog-rules/references/pre-generation-search.md)（库内检索规范）做库内检索——判断是新建、扩充已有文章、还是接力草稿，并收集关联文章供正文交叉引用。跳过此步导致重复创作是典型错误。

---

## 模式（外部入口）

| 模式 | 触发 | 执行范围 | 产出 |
|------|------|---------|------|
| `full`（默认） | 用户直接调用 | Phase 1–8 | raw 素材 + analysis + synthesis + planning draft + OpenSpec change + HTML + 博客 + 邮件 |
| `collect` | 被 `academic-research` 调用（route-representative / context-only） | Phase 1–3 | raw 素材 + analysis（跳过 planning draft / change / HTML / 发布） |
| `draft` | 用户说"存到草稿/为草稿调研这篇/填充草稿的 XX 小节"，或草稿渐进填充流程按模型调用 | Phase 1 + 主 agent 直读 | 草稿小节填充 + 核心图片（不产 planning draft、不产 HTML、不发布） |

**`collect` 不出 HTML**：若上游需要可构建的 HTML 参考页（如 academic-research 的 `core-survey-reference`），应改用 `full` 模式，走上游已批准 change 的审批路径；不得在 collect 模式下写入 `src/pages/`。

`full` 的 Phase 4–5 之间有一个**中间门禁状态 `planning-draft`**：规划草稿已生成、用户尚未确认。详见下方「planning draft」一节。

---

## 执行模式（内部强度）

分析深度由论文复杂度决定，而不是固定拆成几个 subagent：

| 模式 | 默认行为 | 适用场景 | subagent 策略 |
|------|---------|---------|--------------|
| `direct`（默认） | 主 agent 独立完成 Phase 1–8 | 短文、材料完整、问题边界清晰 | 不启动 subagent |
| `assisted` | 主 agent 保持主线，委派局部工作 | 方法、实验、术语或配图有一两个明显难点 | 委派 1–3 个相对独立的 analysis lane |
| `deep` | 主 agent 统一编排多个独立任务 | 长论文、survey、代码复现、跨论文比较 | 并行委派多个互不依赖 lane |

规则：

1. 先判断复杂度，再决定模式；**不得为了"凑并行"启动 lane**。
2. 无论哪种模式，主 agent 都负责：综合结果、回原文核查冲突、生成 planning draft、取得用户确认、撰写 HTML、最终验收。
3. subagent 只做素材分析，输出统一为「事实 + 来源指针 + 不确定性」；**不得**创建 OpenSpec change、修改 `src/pages/`、写最终 HTML 或替用户确认结构。
4. 同一份 raw 素材可被多个 lane 独立读取（methodology / experiment / terminology / image-collection 天然可并行）；`code-analysis` 仅在代码仓库存在时启用。

---

## 管线总览

```
输入: URL / PDF 路径 / 论文标题
  │
  ▼
Phase 1 · 素材获取 ──────────── raw/<slug>/{sources,figures,images,meta.md,extraction-log.md}
  │
  ├─ [draft] ── 主 agent 直读 → 草稿小节五类信息 + 核心图 → 到此结束
  │
  ▼
Phase 2 · 按需分析 ──────────── raw/<slug>/analysis/*.md（0..N 个 lane，direct 可为 0）
  │
  ▼
Phase 3 · synthesis 导航索引 ── raw/<slug>/synthesis.md（轻量索引，不复制内容）
  │
  ├─ [collect] ── 到此结束
  │
  ▼
Phase 4 · planning draft [full] ── 可审阅、可交互修改的规划草稿
  │
  ▼
Phase 5 · 固化 change + 用户确认 [full]
  │
  ▼
Phase 6 · 主 agent 写 HTML [full]
  │
  ▼
Phase 7 · 统一审校（保真度 ∥ 完整性 ∥ HTML 规范）[full]
  │
  ▼
Phase 8 · 发布 + Hub + 交叉回链 [full]
```

---

## planning draft（full 的中间门禁）

planning draft 是**规划层草稿**，不是最终文章，也不是已批准的 change：

- 允许写：论文速览、价值主张、候选章节结构、每节素材来源、关键数据、图表/公式计划、缺口、待确认问题、已确认决策、变更记录。
- **不得写** `src/pages/`；不得视为"用户已批准文章大纲"。
- 用户可以多轮交互：补充论文信息、修正事实与口径、删改章节、指定写作重点、决定复现 vs 理论的比重、确认图片/公式/实验取舍。
- 每轮交互后主 agent 更新 draft，并把已确认决策沉淀进去；正式 change 固化时这些决策必须落到 `design.md`，不能只留在对话上下文里。
- 草稿字段模板见 `references/planning-draft-template.md`。

**落盘位置**（按优先级）：

1. `raw/<slug>/planning-draft.md` —— 默认。此时 change 尚未创建，避免 OpenSpec 树里出现半成品 change。
2. `openspec/changes/<slug>/draft.md` —— 仅当 change 目录已存在（用户要求提前建 change、或接力已有 change）。该文件不属于 OpenSpec schema，`openspec status` 不统计它。

---

## 渐进式披露路由

| 场景 | 读取文件 |
|---|---|
| 进入 Phase 1 前 | `phases/extraction.md`（source → HTML → PDF 三级降级、图片优先级、extraction-log） |
| 进入 Phase 2 前 | `references/paper-section-guide.md`（论文章节利用策略）+ 需要的 lane 模板 |
| 进入 Phase 3 前 | 本文「Phase 3」一节即可 |
| 进入 Phase 4 前 | `references/planning-draft-template.md` + `phases/article-structure.md`（架构选型 A/B/C/D）+ `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/pre-generation-search.md` |
| 进入 Phase 5 前 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md` + `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/` |
| 进入 Phase 6 前 | `~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md` + `phases/html-writing.md` |
| 代码分析 lane 时 | `~/gongshangzheng.github.io/.agents/skills/github-repo-read/SKILL.md` |
| 进入 Phase 7 前 | `references/review-checklist.md` |
| 配图时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md` |
| 发布时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` |
| 交叉回链时 | `references/cross-linking.md` |

---

## Phase 1 · 素材获取

完整指引见 `phases/extraction.md`（slug 生成、目录初始化、三级降级、图片优先级、extraction-log 规范）。要点：

1. **生成 slug**：`"MaskGIT: Masked Generative Image Transformer"` → `maskgit-2022`；`"Attention Is All You Need"` → `attention-2017`。
2. **初始化目录**：
   ```bash
   SLUG="<slug>"
   mkdir -p ~/gongshangzheng.github.io/raw/${SLUG}/{sources,figures/${SLUG},images/${SLUG},analysis}
   ```
3. **arXiv 读取优先级**：source tarball（`https://arxiv.org/e-print/<id>`）→ arXiv HTML → PDF（Docling + `pdftotext -layout`）。
   一键脚本：`~/gongshangzheng.github.io/.agents/skills/read-article/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>`（下载 → 解压 → 图片 → WebP → extraction-log；同时创建 `analysis/`）。
4. **图片优先级**：用户截图 > arXiv source 原图 > arXiv HTML 原图 > GitHub repo 图 > PDF 高 DPI bbox 裁图（`scripts/crop-figures-from-docling.py`）> 代码绘制 > 网络搜图。**AI 生图完全禁止**；Docling 自家 144 DPI referenced 渲染图禁止。详见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。
5. **必须写** `extraction-log.md`：记录每次来源尝试的成功/失败与回源指针。
6. **必须写** `meta.md`：标题、作者、机构、摘要、发表时间、分类、代码仓库链接、素材索引表。
7. **校验**：Markdown 非空、图片目录非空且非 Docling 来源、关键图片宽度 ≥ 1200 px、无 `*_artifacts` / `temp-docling-images/` 残留。

**`draft` 模式在此分叉**：提取完成后，主 agent 直读摘要 + 方法 + 实验（必要时读引言/消融/附录），填充草稿小节，拷 1–3 张核心图到 `drafts/assets/<草稿slug>/`，汇报后结束。详见下方「draft 模式 · 草稿调研路线」。

---

## Phase 2 · 按需分析

> 进入本阶段前，读取 `references/paper-section-guide.md`，了解论文各章节在不同分析维度下的利用方式。

分析产物统一落在 `raw/<slug>/analysis/`。**lane 是可选项，不是固定流水线**：

| Lane | 触发条件 | 输出要点 |
|------|---------|---------|
| `background.md` | 需要补领域背景、作者团队或影响 | 领域脉络、作者/团队来源、社区影响、被引/热度 |
| `methodology.md` | 方法复杂、公式较多或需要独立复核 | 架构逐模块、关键推导与损失函数、与已有方法的机制区别 |
| `experiment.md` | 实验表格多、数字密集或需要核对结果 | 实验配置、超参数具体数值、主结果/消融、失败案例、训练成本 |
| `terminology.md` | 术语密集、符号较多或公式容易混淆 | 术语中英对照 + 符号表 + 易混术语对 |
| `citation.md` | 需要补充研究脉络和前置工作 | top 3–5 前置工作、与本文差异、后续影响 |
| `code-analysis.md` | 有代码仓库且用户关心复现 | 仓库结构、关键实现与论文一致性/偏差、复现要点 |
| `image-collection.md` | 图片对理解结论有帮助 | 候选图清单、图题、来源锚点、候选文件、价值判断与目标章节映射 |

派 lane 时的 prompt 模板：

```
任务：执行 read-article Phase 2 的 <lane> lane。
读取模板：~/gongshangzheng.github.io/.agents/skills/read-article/subagents/<lane>.md
论文标题：<title>
摘要：<abstract>
Slug：<slug>
素材位置：~/gongshangzheng.github.io/raw/<slug>/
输出：~/gongshangzheng.github.io/raw/<slug>/analysis/<lane>.md
```

**lane 输出统一格式**：事实 + 来源指针 + 不确定性。来源指针必须能回源（`file:line`、章节标题、figure/table 编号、公式编号、URL）。

**兼容旧产物**：历史 `raw/<slug>/subagents/{background,citation,treasure,methodology}.md` 直接作为对应 lane 的历史产物读取，不要求迁移或补齐。旧 `treasure.md` 的事实按内容归入 `experiment.md` / `methodology.md`。

**direct 模式**：可以不生成任何 lane 文件，主 agent 直接阅读并在 Phase 3 记录事实位置即可。此时 Phase 3 的 synthesis 承担全部索引职责。

---

## Phase 3 · synthesis 导航索引

主 agent 执行（不派 lane）。等待 Phase 2 全部完成后。

**synthesis 的唯一功能是导航索引，不是再次总结。** analysis lane 已经是事实存储，synthesis 不复制、不压缩、不重新叙述它们的内容。

生成 `raw/<slug>/synthesis.md`，内容仅为：

1. **事实位置索引**：列出各产出文件中的关键事实及其位置指针，例如：
   - 核心公式 → `analysis/methodology.md` §3.2 + `sources/<slug>.md` L120-135
   - 实验配置表 → `analysis/experiment.md` §2.1
   - baseline 对比 → `analysis/methodology.md` §4.3 + `analysis/experiment.md` §3.2
2. **跨文件交叉引用**：标注多个 lane 都提到的同一事实（方便写手去重），指向最详细的那份
3. **矛盾标注**：不同来源对同一事实描述不一致时标注矛盾位置，注明以原文为准
4. **写作分配建议**：哪些素材对应文章的哪个 Part

**长度红线**：通常 200–500 字；超过 1000 字说明在复制内容而不是建索引，必须重写。

`collect` 模式到此结束。

---

## Phase 4 · planning draft [full only]

主 agent 执行。

**前置**：先按 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/pre-generation-search.md` 做库内检索，判断新建 / 扩充 / 接力草稿，并收集关联文章。

按 `references/planning-draft-template.md` 生成 `raw/<slug>/planning-draft.md`（或 change 已存在时的 `openspec/changes/<slug>/draft.md`），至少覆盖：

1. 论文速览：标题 / 作者与单位 / venue 与年份 / arXiv id / 代码仓库 / 原文链接
2. 一句话价值主张（≤100 字）
3. 候选文章结构：逐节给出「这一节写什么 + 素材来源文件与原文定位 + 必备表/公式/图 + 字数参考 + 缺料时的替代方式」
4. 关键数据点：含数值与口径（分辨率 / GPU / 步数 / 数据集）
5. 图表公式清单：预计的表格（列定义）、公式（编号 + 符号含义）、Mermaid 图、论文原图 —— 逐项列出
6. 目标位置：分类 alias、sub_id、Hub、目标文件
7. 引用关系：与既有文章的交叉引用计划
8. 风险与待确认项：素材缺口、存疑结论、需要用户裁决的口径
9. 已确认决策 / 未决问题 / 变更记录

**然后向用户汇报**，并把 draft 交给用户查看和交互修改。用户可能补充：写作重点、章节取舍、复现 vs 理论比重、前置工作展开程度、实验硬件是否单独说明等。每轮交互后更新 draft，把已确认决策沉淀进去。

**门禁**：planning draft 阶段不得写 `src/pages/`；不得视为用户已批准文章大纲。用户未确认时，停留在 Phase 4。

---

## Phase 5 · 固化 OpenSpec change + 结构确认 [full only]

> 规范、豁免细则与模板位置：`~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`

只有用户确认 planning draft 达到可执行状态后，才进入固化：

1. `openspec new change "<slug>"`（一批多篇用主题名）
2. 按 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/` 填 `proposal.md` / `design.md` / `tasks.md`。其中 `design.md` 的**「文章内容大纲」**是审批核心，逐节写清"这一节写什么 + 素材来源 + 必备表/公式/图"
3. **把 draft 中已确认的决策全部落到 design**，不得只留在对话上下文或 draft 文件里；draft 里未决的问题必须解决或显式标注为待确认
4. 将固化后的「文章内容大纲」贴给用户，请求**正式结构确认**；未确认不得进入 Phase 6，不得写 `src/pages/`
5. 固化后 planning draft 可标记为已固化（保留文件作为决策记录，或按需清理）

`draft` / `collect` 模式豁免（只产草稿/素材，不发表），豁免时在回复中说明理由。

**被上游 skill 调用时的例外**：若 `academic-research` 等上游已有用户批准的主题 change（一批多篇），则
本 skill 的 Phase 4 planning draft 简化为“按上游已批准结构拆出的单篇小节草案”，Phase 5 不再单独要求
用户再次确认，以上游 change 的审批为准；但仍需把单篇的结构与素材来源写入上游 change（或本 skill
的 planning draft）以供追溯。

**用户显式跳过时**：用户明确说“不用确认，直接写”时，可跳过 draft 交互直接进 Phase 5，但
**仍必须建立/更新 change**（或在回复中说明豁免理由），且不得省略 Phase 7 的三维审校。

Phase 6 按 change 中已批准的「文章内容大纲」落笔；大纲需变更时走 `openspec-update-change` 回写，不直接改稿。

---

## Phase 6 · 主 agent 写 HTML [full only]

> ⚠️ 进入本阶段前，必须读取 `~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md` + `phases/html-writing.md`。

**由主 agent 直接撰写完整 HTML**，不再默认拆分术语、问题定义、方法、实验、代码、图片、总结等写作 subagent。

写作数据源（按优先级）：

1. OpenSpec change 中已确认的「文章内容大纲」
2. 原文 `raw/<slug>/sources/`
3. `raw/<slug>/analysis/` 已启用的 lane（事实存储层）
4. `raw/<slug>/synthesis.md`（仅导航，不用作内容输入）
5. `raw/<slug>/planning-draft.md`（已确认的决策与口径）

标准 **7-Part 结构**继续作为推荐骨架，字数下限和质量底线见 `references/article-structure-template.md`；允许根据论文实际内容合并或调整章节，调整必须在 change 中记录并获确认。

写作执行清单：

1. `node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --notify` 创建骨架
2. 按下方「Frontmatter 规范」填 frontmatter
3. 按 7-Part 结构逐节落笔，遵循 Motivation → Intuition → Mechanism 三层递进（见「写作风格」）
4. 配图按 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`；代码绘制用 mermaid / jsxgraph
5. `.sources` 用 `#key#` 引用语法 + 每条 `data-cite-key`；末尾加 `chapter-nav`
6. 自检：字数、图片 ≥ 3、公式 ≥ 2、超参数 ≥ 3、baseline 对比表、消融发现、MathJax 语法

### 代码分析（若有 GitHub 仓库）

进入代码分析前必须先处理依赖：

1. 读取仓库依赖入口（pyproject.toml、requirements.txt 等）
2. 在隔离环境中安装最小依赖集
3. 安装后做轻量 smoke test（包导入 + `--help`）
4. smoke test 失败时，不得写成"已验证实现"

代码分析输出包含：仓库定位、代码组织总览、运行入口与调用链、核心代码解读（含真实代码片段）、论文方法与代码对应关系。参照 `~/gongshangzheng.github.io/.agents/skills/github-repo-read/SKILL.md`。

### 配图

**禁止**：Docling `--image-export-mode referenced` / `_artifacts/` / `docpage/dcoref` 的 144 DPI 渲染图、AI 生图、hotlink 远程 URL。
**允许**：`scripts/crop-figures-from-docling.py` 的脚本化高清 bbox 裁图（只借 Docling JSON 坐标，渲染交 PyMuPDF）。

### 写作风格

**段落级逻辑**：每个章节遵循 Motivation → Intuition → Mechanism 三层递进。

**禁止**：平铺直叙"X 提出了 Y 方法"；连续罗列贡献无叙事逻辑；直接上公式不解释意图；术语首次使用不解释。

**推荐**：使用教师口吻"我们可以看到..."；术语首次出现给一句定义或类比。

---

## Phase 7 · 统一审校 [full only]

> 进入本阶段前，读取 `references/review-checklist.md`。

HTML 完成后，主 agent 对同一份文章按三个维度**连续审校**：

| 维度 | 检查内容 | 回源要求 |
|------|---------|---------|
| 保真度 | 核心贡献、公式、实验数值、数据集、baseline、作者声明是否忠于原文 | 必须回 `raw/<slug>/sources/` 核查 |
| 完整性 | 方法、训练、推理、实验、消融、局限、引用、图表是否覆盖；字数与图片是否达标 | 对照 change 大纲逐节核对 |
| HTML/站点规范 | frontmatter、组件语法、MathJax、图片、`.sources`、`chapter-nav`、build.js 兼容性 | 对照 `~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md` |

**默认由主 agent 完成一次统一审校**（三个维度都要过）。只有某一维度仍有独立且耗时的核查需求时，才**按需**委派对应 Review lane。

问题分级 P0/P1/P2；**P0 必须修复后才能进入 Phase 8**。修复完成后重跑 `node build.js`。

---

## Phase 8 · 发布与维护 [full only]

发布前验证和发布流程见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`。

关键验证项：

1. 三个审校维度已全部完成，P0/P1 已修复
2. 引用使用 `#key#` 语法（非 `(Author, Year)`）
3. `.sources` 列表每条有 `data-cite-key`
4. 图片 ≥ 3 张且来源正确
5. 字数达标（见「质量底线」表格）
6. MathJax 语法正确（无裸数学符号）
7. `node build.js` 成功
8. 正文无写作过程元叙述

### 8.1 更新 Hub 页

检查新文章的 `subcategory` 是否与某个 Hub 页匹配：

1. 若匹配，在 Hub 页追加或更新 `chapter-list`
2. **sub_id 冲突检查**：扫描同系列所有已有 `sub_id`，确认无重复；检查 `sub_id` 数值与标题中文编号一致
3. **chapter-nav 双向更新**：新文章设置 prev/hub/next；前一篇文章的 next 与新文章的前一篇的 prev 同步更新
4. `node build.js` 重新构建

**必读**：系列命名规则 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md`；sub_id 编号规则 `~/gongshangzheng.github.io/.agents/skills/blog-aliases/SKILL.md` §5；分类分布 `~/gongshangzheng.github.io/.agents/skills/blog-categories/references/subcategory-organization.md`（按需）。

### 8.2 交叉引用回链

> 完整规则和自动化脚本见 `references/cross-linking.md`。

新精读文章发布后，补全博客中已存在的对同一论文的引用：

1. 识别精读文章：`src/pages/*.html` 中 frontmatter `title` 含"精读"或"深度解读"
2. 构建映射：每篇精读文章**只取第一个 `data-cite-key`（主 cite-key）**，另从标题提取论文简称
3. 补全 `.sources` 交叉链接：在 `</li>` 前追加 ` · <a href="<精读文章>" class="paper-link">精读 →</a>`
4. 补全正文交叉链接：每个论文名**只链接首次出现**
5. 新精读文章自身回链

一键执行：

```bash
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py
```

6. 验证：逐个 `<li>` 匹配检查（**禁止**跨 `</li>` 边界的 regex）、`node build.js`、`npm test`、`git diff` 检查范围

---

## draft 模式 · 草稿调研路线

为 blog-drafts 草稿读一篇论文，**只提取核心信息与核心图片落进草稿**。与 `collect` 的区别：collect 产 `analysis/` 素材层供后续写作复用；draft 直接面向草稿小节，轻量、即时。库内查重由调用方负责（草稿流程通常已做）。

**流程**（主 agent 单线执行，不派 lane）：

```
论文 URL/标题
  → Phase 1 提取（arXiv source/HTML，含图片）
  → 主 agent 直读 摘要 + 方法 + 实验节（必要时读引言/消融/附录）
  → 填充草稿对应小节（五类信息）
  → 核心图片 1-3 张拷到 drafts/assets/<草稿slug>/
  → 汇报，等用户审核（渐进填充流程：一次一篇）
```

**小节五类信息**：
1. 问题背景：它解决什么瓶颈（2-4 句，说清"为什么难/为什么现有方案不够"）
2. 核心方法：怎么做。按机制逐条展开（动机 → 机制 → 直觉解释），每个关键设计点一段；深度对齐全管线的分析密度（超参数、tile 尺寸、公式、训练配置这类具体数值都要留），但不需要教学式铺垫和长篇叙事——密度高、篇幅短
3. 关键指标：核对后的数字 + 测试条件（模型/分辨率/GPU/步数）；与用户提供口径（如报告照片）不一致时以论文为准并标注差异；含消融关键发现（哪个组件贡献最大）
4. 训练/工程约束：是否需要训练、数据量、硬件门槛、开源状态、复现边界
5. 论文/代码链接

**内容量参考**：每个小节 30-60 行 org 文本（骨架 5-8 行 → 调研后 30-60 行）。这不是硬上限而是锚点——以信息密度为准，宁可超长不丢关键数值；但不得写成 full 模式的教学式长文。

**核心图片规则**：
- 每篇 1-3 张，优先框架图 + 主结果图表；沿用全局配图优先级
- 存 `drafts/assets/<草稿slug>/`，命名 `<论文简称>-<图名>.png`
- 草稿正文（org）引用：`[[file:assets/<草稿slug>/<文件名>]]`
- webp 转换与移 `media/images/` 推迟到发布交接阶段

**禁止**：不写 HTML、不生成 planning draft、不进入 Phase 4–8、不派 Review、不在草稿里做跨论文对比（小节边界由调用方约束）。
**保留**：`raw/<slug>/` 提取产物照常保留，后续升级 full 模式写 HTML 时直接复用，无需重新提取。

---

## 执行规则

1. **必须创建 todo**：读本文后，立即创建阶段 todo 清单。todo note 必须记录论文标题、slug、原始 URL/PDF/arXiv ID、目标 HTML、raw 目录和当前执行模式（direct/assisted/deep）。
2. 必须按 Phase 顺序推进；不得把中间结果当作完成态停下。
3. Phase 1–3 的产物只用于后续分析和写作，默认不作为最终交付。
4. **门禁顺序**：full 模式必须先在 Phase 4 生成 planning draft、在 Phase 5 固化 change 并取得用户确认，之后才能进入 Phase 6。`draft` / `collect` 在 Phase 1/3 结束。
5. 进入 Phase 6 前，必须读取 `~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md`，所有 HTML 生成必须遵守其规范。
6. **默认生成博客**：用户若未明确要求"只做分析/只 collect/不生成博客"，默认执行到 HTML 文章生成 + 构建校验 + 发布准备完成。
7. **配图优先级**：用户截图 > arXiv source tarball 原始图片 > arXiv HTML 原图 > GitHub repo 图 > PDF 高 DPI bbox 裁图 > 代码绘制 > 网络搜图。AI 生图完全禁止。详见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。
8. **中间文件保留完整事实**：analysis lane 保留所有具体数值、公式、表格、超参数、实验配置。synthesis.md 是导航索引，记录"哪个事实在哪个文件"，用指针连接而非复制。
9. **重要事实性句子必须显式带引用**：至少覆盖论文贡献表述、实验数值、数据集/基线/指标、作者声明、时间线、引用链前置工作结论。引用必须使用 `#key#` 语法。
10. Phase 7 保真度审查回原文核查，以论文全文为准。
11. 三个审校维度全部完成后汇总修复 P0/P1 问题，再进入 Phase 8。
12. `#key#` 引用标记同步配置底部 `.sources li` 的 `data-cite-key` 属性。
13. 数学符号使用 MathJax：`\(...\)` 行内 / `\[...\]` 块级。
14. **collect 模式下 survey 深读充分展开**：如果输入是 survey/review，collect 产物至少包括研究范围、taxonomy、任务输入/输出、metrics、datasets、代表方法表、关键结论、局限性、5-10 条可引用 claim。
15. **扁平数据流**：analysis lane 是事实存储层，synthesis 是导航索引，Phase 6 直接从 analysis + 原文 + 已确认大纲写 HTML，三类产物各司其职。
16. **planning draft 不是交付物**：draft 只服务规划交互；已确认决策必须固化进 change，不得只存在于 draft。
17. **draft 模式轻量路线**：只走 Phase 1 提取 + 主 agent 直读论文，填充草稿小节五类信息 + 1-3 张核心图到 `drafts/assets/<草稿slug>/`；不派 lane、不生成 planning draft、不写 HTML、不 Review。

---

## Frontmatter 规范

**标题**（`title`）必须遵循系列命名规则（见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md`）：

| 文章类型 | 标题格式 | 示例 |
|---------|---------|------|
| 系列章节 | `<子分类>系列（序号）：主题` | `红外图像压缩系列（二）：学习式压缩` |
| 论文精读 | `<子分类>论文精读（序号）：论文名，副标题` | `红外图像压缩论文精读（三）：FreqKD，频率解耦蒸馏` |
| 工程解读 | `<子分类>工程解读（序号）：主题` | `数字人工程解读（一）：实时驱动管线` |
| 单篇（非系列） | 自由命名 | `TiTok：1D 视觉分词器综述` |

**禁止**：同一分类路径下标题格式不统一（如有的叫"深度解读"、有的叫"论文精读"）。

**`hub` 字段**：系列文章必填，值为 Hub 页 slug（如 `hub: digital-human-hub`）。独立文章省略。

**`tags` 字段**：3-5 个，硬性上限 5 个。超过 5 个标记为 P1 问题。

**论文信息字段（`paper_*`，全部可选）**：论文精读文章应在 frontmatter 中填写论文元信息，由构建系统渲染为正文顶部的"论文信息" `.info-box.paper-info`。不再手写正文内的论文信息 info-box（避免重复）。全部字段可选，一个都不填则不渲染，向后兼容旧文章。

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

**sub_id** 必须遵循编号规则（见 `~/gongshangzheng.github.io/.agents/skills/blog-aliases/SKILL.md` §5 + `~/gongshangzheng.github.io/.agents/skills/blog-categories/references/subcategory-organization.md`）：

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

---

## 脚本边界（固定工作交给脚本）

确定性工作优先交给已有脚本；**理解、判断与写作留给 agent**。

| 已有脚本 | 职责 | 是否可写最终产物 |
|---|---|---|
| `.agents/skills/read-article/scripts/fetch-arxiv-paper.py` | 目录初始化 + source tarball 下载解压 + 图片提取 + WebP 转换 + extraction-log | 否，只写 `raw/<slug>/` |
| `scripts/convert-figures.py` | PDF/EPS/PNG → WebP | 否 |
| `scripts/crop-figures-from-docling.py` | 按 Docling bbox 高 DPI 裁图（兜底） | 否 |
| `scripts/check-sub-id.py` | sub_id 冲突检查与建议 | 否 |
| `scripts/cross-link.py` | `.sources` 与正文交叉回链 | 只改链接，不改正文语义 |
| `node build.js` / `npm test` / `node lib/lint-html.js` | 构建、测试、标签配对检查 | 否 |

**脚本不得**：判断论文贡献、替 agent 选择文章结构、自动生成或拼接正文、自动确认 OpenSpec、自动提交 Git、在没有显式参数时覆盖或删除用户文件。

**环境**：Python 用 `~/.venv/bin/python`；`fetch-arxiv-paper.py` 用专属 venv `.cache/read-article/.venv`（装 `pymupdf pillow numpy`，`numpy` 供 `crop_whitespace`，缺则转换静默失败）。

---

## 质量底线

以下标准是最终 HTML 的硬性门槛，Phase 7 逐项检查：

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
| 代码绘制图 | ≥ 1 张（mermaid / jsxgraph，仅作补充示意） |
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
~/.venv/bin/python ~/.hanako/skills/docling/scripts/convert.py \
  /tmp/${SLUG}.pdf --format markdown --max-pages 10 \
  --output ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.md

# 方案 2：OCR 扫描件
~/.venv/bin/python ~/.hanako/skills/docling/scripts/convert.py \
  /tmp/${SLUG}.pdf --ocr tesseract --force-ocr \
  --format markdown --output ~/gongshangzheng.github.io/raw/${SLUG}/sources/${SLUG}.md
```

### 用户只给了标题

用 `web_search` 搜索标题，找到 arXiv / Semantic Scholar 链接后正常走流程。

### 审校发现大量缺口

回到 `raw/<slug>/sources/` 与相应 analysis lane 补齐缺口；缺口集中在某一维度且工作量较大时，才按需委派一个补充 lane。

### planning draft 长时间未确认

不要绕过门禁直接写 HTML。把 draft 中仍未决的问题列成清单单独问用户，缩小确认范围。
