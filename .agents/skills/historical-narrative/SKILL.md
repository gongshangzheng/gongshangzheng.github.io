---
name: historical-narrative
description: |
  调研一段历史事件/时期/人物，按编年叙事风格产出结构化笔记和图文 HTML 博客。
  用于"讲讲 XX 历史""事件来龙去脉""朝代兴亡""战争始末""人物生平""历史专题"等任务。
  触发词：讲讲历史、事件来龙去脉、战争始末、朝代兴亡、历史叙事、编年体、人物生平、历史专题。

  注意：纯学术综述用 academic-research；单篇论文/文章解读用 read-article；
  轻量闲聊式历史问答直接回答即可。
metadata:
  default-enabled: true
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Historical Narrative — 历史叙事

把一段历史事件、时期、人物或主题写成有时间线、有场景、有人物、有来源的编年体故事，并以 HTML 博客形式发布。

> **核心理念**：历史叙事不是百科条目堆叠，而是用时间线串起因果、人物与场景；宁可详尽，不压缩核心事实。
> **最终交付**：HTML 叙事长文 + 博客发布链接 + 可选邮件通知。
> **保留的中间产出**：raw 史料包 + synthesis 导航索引 + org-roam 编年笔记（可选）。

> **前置 · 库内检索（必做）**：开始生成前，先按 [`blog-rules/references/pre-generation-search.md`](../blog-rules/references/pre-generation-search.md) 做库内检索——判断是新建、扩充已有文章、还是接力草稿，并收集关联文章供正文交叉引用。跳过此步导致重复创作是典型错误。

---

## 模式

| 模式 | 触发 | 产出 |
|------|------|------|
| `oral`（口头讲述） | 用户只要"讲讲"，不要求发布 | 对话中的结构化叙事回答 |
| `full`（默认） | 用户要求整理、写成文章或发布 | org-roam 笔记（可选）+ raw 素材 + HTML + 博客 + 邮件 |

---

## 执行规则

1. **必须创建 todo**：读本文后，立即创建全阶段 todo 清单。todo note 必须记录主题、slug、目标 HTML、raw 目录和已分配 subagents。
2. 必须按 Phase 顺序推进；不得把中间结果当作完成态停下。
3. Phase 1-3 的产物只用于后续分析和写作，默认不作为最终交付。
4. 进入 Phase 5 前，必须完成 Phase 4（文章架构规划）。
5. 进入 Phase 5 前，必须读取 `~/.agents/skills/html-blog/SKILL.md`，所有 HTML 生成必须遵守其规范。
6. **默认生成博客**：用户若未明确要求"只口头讲讲/只分析/不发布"，默认执行到 HTML 文章生成 + 构建校验 + 发布准备完成。
7. **配图优先级**：真实历史照片 > 档案扫描件 > 博物馆/机构藏品 > Wiki Commons > 地图/示意图 > 代码绘制 > 网络搜图。AI 生图在历史叙事中**原则上禁止**；若史料完全缺失且用户同意，最多 1-2 张氛围示意，必须在 caption 中明确标注"AI 想象图"。详见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。
8. **中间文件保留完整事实**：Phase 2 的史料分析保留所有具体时间、地点、人物、数字、引语、来源争议；`synthesis.md` 是导航索引，记录"哪个事实在哪个文件"，用指针连接而非复制。
9. **重要事实性句子必须显式带引用**：至少覆盖年份、日期、地名、人物任职/行动、战役结果、法令、统计数字、引语出处、史学争议所依赖的事实节点。引用使用 `#key#` 语法。
10. Phase 6 fidelity review 必须回到原始史料或最接近原始的一手来源核对；若只能使用二手史学著作，也要明确其身份。
11. 三路 Review 全部完成后汇总修复 P0/P1 问题，再进入 Phase 7。
12. `#key#` 引用标记同步配置底部 `.sources li` 的 `data-cite-key` 属性。
13. **扁平数据流**：Phase 2 的史料包是唯一事实存储层，Phase 3 synthesis 是导航索引，Phase 5 直接从 Phase 2 产出 + 原文写 HTML。三类产物各司其职。

---

## 管线总览

```
输入: 历史主题/时期/人物/事件
  │
  ▼
Phase 1 · 史料提取 ───────── raw/<slug>/sources/* + images/*
  │
  ▼ ━━━ 并行 ━━━
  ├── Phase 2a · 时间线重建 ── subagents/timeline.md
  ├── Phase 2b · 人物与行动 ── subagents/actors.md
  ├── Phase 2c · 一手来源挖掘 ─ subagents/sources.md
  └── Phase 2d · 史学争议梳理 ─ subagents/debates.md
  │
  ▼
Phase 3 · 导航索引 ──────── synthesis.md（轻量导航，不复制内容）
  │
  ▼
Phase 4 · 文章架构规划 ──── references/article-structure-template.md [full only]
  │
  ▼ ━━━ 顺序+并行 ━━━
Phase 5 · HTML 撰写 [full only]
  │  5a → 5b → (5c ∥ 5d) → 5e → 5f
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

---

## 渐进式披露路由

| 场景 | 读取文件 |
|---|---|
| 进入 Phase 2 前 | `references/source-guide.md`（史料来源等级与利用策略） |
| 进入 Phase 4 前 | `references/article-structure-template.md`（编年体文章结构模板） |
| 进入 Phase 5 前 | `~/.agents/skills/html-blog/SKILL.md` + `phases/html-writing.md` |
| 进入 Phase 6 前 | `subagents/review-*.md` |
| 配图时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md` |
| 发布时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` |
| 进入 Phase 9 前 | `references/cross-linking.md` |

---

## Phase 1 · 史料提取

### 1.1 生成 slug

```
"安史之乱" → an-shi-rebellion
"拿破仑战争" → napoleonic-wars
"文艺复兴" → renaissance
```

### 1.2 初始化目录

```bash
SLUG="<slug>"
mkdir -p ~/gongshangzheng.github.io/raw/${SLUG}/{sources,images/${SLUG}}
```

### 1.3 史料来源优先级

1. **一手来源（优先）**：原始档案、官方编年、法令、书信、日记、 contemporaneous records、碑刻、出土文献
2. **权威二手研究**：经过同行评审的历史期刊、大学出版社专著、权威百科全书
3. **可靠参考工具**：国家档案馆、博物馆、历史地图集、机构数据库
4. **网络与媒体**：仅用于补充背景语境，重要事实必须回到 1 或 2 交叉验证

### 1.4 分配史料提取 subagent

读取 `phases/extraction.md`。提取优先级：一手档案 → 权威专著 → 可靠数据库 → 网络搜索。

---

## Phase 2 · 并行史料分析（4 个 subagent）

> 进入本阶段前，读取 `references/source-guide.md`，了解不同史料来源的等级与使用方式。

Phase 1 完成后，**同时派出 4 个 subagent**：

| Subagent | 读取模板 | 职责 |
|---|---|---|
| 时间线重建 | `subagents/timeline.md` | 关键事件、日期、持续时间、前后因果 |
| 人物与行动 | `subagents/actors.md` | 核心人物、决策、行动、动机、关系网络 |
| 一手来源挖掘 | `subagents/sources.md` | 原始文献、档案、引语、出处、可信度 |
| 史学争议梳理 | `subagents/debates.md` | 不同史观、争议点、证据强弱、常见误读 |

派发 prompt 模板：
```
任务：执行 Phase 2a（时间线重建）。
读取模板：~/.agents/skills/historical-narrative/subagents/timeline.md
主题：<主题>
已提取史料：<路径>
Slug：<slug>
```

**Phase 2 交付物要求**：
- 每个 subagent 输出保留到 `raw/<slug>/subagents/`
- 时间线必须包含具体日期或年份，每个节点说明因果
- 人物行动必须标注信息来源
- 一手来源必须给出原始出处、现代译本/版本、可信度评估
- 史学争议必须列出对立观点和各自证据

---

## Phase 3 · 导航索引

主 agent 执行（不分配 subagent）。等待 Phase 2 全部完成后。

**Phase 3 的唯一功能是创建导航索引，不是再次总结。** Phase 2 的四份分析已经是完整的事实存储，Phase 3 不复制、不压缩、不重新叙述它们的内容。

生成 `~/gongshangzheng.github.io/raw/<slug>/synthesis.md`，内容仅为：

1. **事实位置索引**：列出 Phase 2 各产出文件中的关键事实及其位置指针（文件名:行号或章节标题），例如：
   - 关键日期 → `subagents/timeline.md` §2.1
   - 核心人物 → `subagents/actors.md` §3.2
   - 一手引语 → `subagents/sources.md` §1.3
   - 史学争议 → `subagents/debates.md` §2
2. **跨文件交叉引用**：标注多个 subagent 都提到的同一事实（方便写手去重），指向最详细的那份
3. **矛盾标注**：如果不同 subagent 对同一事实有不同描述，标注矛盾位置，注明以原始史料为准
4. **写作分配建议**：哪些 Phase 2 产出对应文章的哪个 Part

**synthesis.md 应该很短**（通常 200-500 字），因为它只是索引，不是内容。如果 synthesis 超过 1000 字，说明在复制内容而不是建索引。

---

## Phase 4 · 文章架构规划 [full only]

> 进入本阶段前，读取 `references/article-structure-template.md`。

在动笔写 HTML 之前，先规划文章骨架：

1. **分析全部素材**：通读 synthesis.md（导航索引）+ Phase 2 的四份分析产出 + 原始史料，了解有什么可用
2. **设计文章结构**：给出 2-3 种章节组织方案，推荐其一
3. **用户确认**：用户确认后进入 HTML 写作；用户无偏好时直接按推荐执行

标准编年体结构、字数下限和质量底线见 `references/article-structure-template.md`。

---

## Phase 5 · 多阶段 HTML 撰写 [full only]

> ⚠️ 进入本阶段前，必须读取 `~/.agents/skills/html-blog/SKILL.md` + `phases/html-writing.md`。

Phase 5 拆分为 6 个子阶段，按 **5a → 5b → (5c ∥ 5d) → 5e → 5f** 顺序执行：

```
5a 术语表 + 前置知识 ── subagents/terminology.md
  ↓
5b 编年骨架 + 叙事主线 ── subagents/narrative-spine.md
  ↓
┌──────────────────────────────────────────────┐
│ 5c 事件写作    │ 5d 人物写作    │
│ subagents/    │ subagents/        │
│ event-writing.md    │ actor-writing.md  │
└──────────────────────────────────────────────┘
  ↓
5e 配图 ── subagents/image-collection.md
  ↓
5f 总结 + 余论 ── subagents/conclusion-writing.md
  ↓
主 agent 合并 → 完整 HTML
```

每个 subagent 读取对应模板文件后执行，输出 Markdown 片段。主 agent 在 5f 完成后合并为完整 HTML。

**执行方式可选**：
- **subagent 模式**（适合复杂历史主题）：派出 6 个 subagent，各自输出 Markdown，主 agent 合并
- **主 agent 直接写 HTML**（默认，适合大多数主题）：主 agent 读取各 subagent 模板作为**写作检查清单**，直接用 html-blog 组件语法写 HTML

两种方式都必须遵循各模板的写作要求（时间格式、引用处理、配图计划、字数下限等）。

**写作数据源规则**：每个写作 subagent（5a–5f）的输入**必须**包含两类文件：
1. **Phase 2 产出**（事实存储层）：`~/gongshangzheng.github.io/raw/<slug>/subagents/` 下的 timeline.md、actors.md、sources.md、debates.md
2. **原始史料**（最终校验层）：`~/gongshangzheng.github.io/raw/<slug>/sources/` 下的原文提取文件

synthesis.md 仅作为导航索引（"去哪里找什么"），不作为内容输入。

### 主 agent 合并流程

1. 按架构规划的章节顺序拼接各 Markdown 片段
2. 统一术语（以 5a 术语表为准）
3. 填写 frontmatter（见 html-blog SKILL.md 的 Frontmatter 规范）
4. 调用 html-blog 组件语法转为 HTML
5. 验证：≥ 3 张图、≥ 1 个时间线、字数达标、引用语法正确
6. 扫一遍最终 HTML，修正裸术语和历史人名

---

## Phase 6 · 三路并行 Review [full only]

HTML 写作完成后，**同时派出 3 个 Review subagent**：

| Review Agent | 读取模板 | 职责 |
|---|---|---|
| `review-fidelity` | `subagents/review-fidelity.md` | 史实真实性审查（回原始史料核对） |
| `review-completeness` | `subagents/review-completeness.md` | 叙事完整性审查 |
| `review-html-format` | `subagents/review-html-format.md` | HTML 规范审查 |

**必须等待全部三路 Review 完成后汇总修复。** P0 问题必须修复后才能进入 Phase 7。

---

## Phase 7 · 发布 [full only]

发布前验证和发布流程见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`。

关键验证项：
1. 三路 Review 已全部完成，P0/P1 已修复
2. 引用使用 `#key#` 语法
3. `.sources` 列表每条有 `data-cite-key`
4. 图片 ≥ 3 张且来源正确
5. 字数达标（见下方"质量底线"表格）
6. HTML 标签配对正确，`node lib/lint-html.js` 通过
7. `node build.js` 成功
8. 正文无写作过程元叙述

---

## Phase 8 · 更新 Hub 页 [full only]

检查新文章的 `subcategory` 是否与某个 Hub 页匹配：

1. 若匹配，在 Hub 页追加或更新 `chapter-list`
2. **sub_id 冲突检查**：分配前扫描同系列所有已有 `sub_id`，确认无重复
3. **chapter-nav 双向更新**：
   - 新文章设置 chapter-nav：prev = 系列上一篇，hub = Hub 页，next = 暂缺或下一篇
   - 前一篇文章的 chapter-nav next 更新为指向新文章
   - 后一篇文章（若有）的 chapter-nav prev 更新为指向新文章
4. `node build.js` 重新构建

---

## Phase 9 · 交叉引用回链 [full only]

> 进入本阶段前，读取 `references/cross-linking.md`，获取完整的交叉链接规则和自动化脚本。

新历史叙事文章发布后，博客中可能已经存在对该主题的引用（在 `.sources` 列表或正文中），但缺少指向该叙事文章的链接。本阶段自动补全这些交叉链接。

交叉链接的扫描和补全可使用 `scripts/cross-link.py` 一键完成：

```bash
# 完整回链
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py

# 只查看会做什么修改（dry-run）
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py --dry-run

# 只补全 .sources 链接（跳过正文）
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py --sources-only
```

---

## 质量底线

以下标准是最终 HTML 的硬性门槛，Review 阶段逐项检查：

| 指标 | 最低要求 |
|------|---------|
| **HTML 正文总量** | ≥ 3000 字；重大历史主题 ≥ 4000 字 |
| Part 1 引言 + 历史背景 | ≥ 500 字 |
| Part 2 时间线与关键事件 | ≥ 1000 字，含 ≥ 3 个具体时间节点 |
| Part 3 人物与行动 | ≥ 800 字 |
| Part 4 一手来源与证据 | ≥ 500 字（含来源披露表） |
| Part 5 史学争议与余论 | ≥ 300 字 |
| 图片 | ≥ 3 张（优先真实历史图片） |
| 时间线 | ≥ 1 个完整编年表 |
| 地图/示意图 | ≥ 1 张（地理相关的主题） |
| 引用 | 重要事实句全部带 `#key#` |
| 人物表 | ≥ 1 个（含生卒年、身份、关键行动） |
| 来源披露 | ≥ 5 个已标注来源 |

---

## 失败边界

以下情况必须停下修复或降级，不得继续包装成最终文章：

- 关键日期无法回到可靠来源
- 核心人物行动只有二手转述、没有一手或权威来源支撑
- 时间线存在无法调和的矛盾且未说明争议
- 最终 HTML 只有事件罗列，没有叙事主线和因果解释
- 图片没有来源说明或使用了未标注的 AI 生成图
- HTML 引用、图片路径或 build 校验未通过
- **HTML 标签不配对**（孤立 `</p>`、`</div>` 等）—— 必须用 `node lib/lint-html.js` 验证并修复

---

## 故障处理

### 史料来源不足

- 优先使用国家档案馆、大学出版社、权威史学期刊
- 对网络来源，必须多源互证
- 若某段历史确实史料匮乏，在正文中明确说明"史料记载有限"，并给出最接近的来源

### Review 发现史实缺口

派一个补充 subagent，针对缺口从原始史料和 Phase 2 产出中补充。

### 用户只要口头讲述

不执行发布链路。按 Phase 1-3 快速整理，给出结构化的编年叙事回答，包含时间线、关键人物、核心来源，但不需要生成 HTML。
