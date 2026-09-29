## Context

- `read-article` 已落地两段式门禁（Phase 4 planning draft → Phase 5 固化 change + 结构确认），及其论文专属 draft 模板 `read-article/references/planning-draft-template.md`（128 行，措辞为论文场景）。
- 其余 6 个内容类 skill 仍是 `## Phase 0 · OpenSpec 门禁`：在管线**最前面**直接建 change。
- 已合入主 specs 的 `content-change-planning` 中有一处 scenario 明确写着"该 skill 的管线最前面存在门禁小节"——与新模型直接冲突，必须随本次修订。
- 6 个 skill 的管线形态差异较大（`academic-research` 有 Phase 0-1/2/3/4/5-6/7；`course-notes` 有 Phase 1-5 且 Phase 1 已含"用户确认范围"；`book-to-blog` 分 full/extract）。

约束：

- 门禁规范必须保持单一事实来源（`blog-rules/references/openspec-gate.md`），各 skill 只留 3-5 行指针。
- 不得为对齐而改动 `read-article` 的流程（它刚重构完并已归档验证）。
- 本次不对 planning draft 的交互语义做任何改动——只做位置与契约的一致性对齐。

## Goals / Non-Goals

**Goals:**

- 7 个内容类 skill 的门禁语义一致：先 draft 交互、确认后固化 change、再写作。
- planning draft 的契约与字段模板有共享层，任何内容类 skill 都能用，且不反向依赖 `read-article`。
- 主 spec 与新模型一致（消除"管线最前面"这条过时表述）。

**Non-Goals:**

- 不改 `read-article` 的 Phase 结构、不改 drafting 交互细节。
- 不引入自动化强制（不写 pre-commit 拦 change）。
- 不统一 6 个 skill 的 Phase 编号（保持各自既有编号，避免连锁重编号）。

## Decisions

### D1：planning draft 的契约与模板提升到 `blog-rules` 共享层

- 新增 `blog-rules/references/planning-draft.md`：定义两段式门禁的通用契约（定位、禁止事项、落盘位置、多轮交互与决策沉淀、上游调用例外）。
- 新增 `blog-rules/templates/planning-draft.md`：通用字段模板（必填字段：产出清单、逐篇/逐节骨架、素材来源、关键数据、图表公式计划、缺口与待确认项、已确认决策、变更记录）。
- `read-article/references/planning-draft-template.md` 保留为**领域特化补充**（论文速览、口径核对等），并在文中声明"通用契约见 `blog-rules/references/planning-draft.md`"。

备选 A：6 个 skill 直接引用 `read-article` 的模板 —— 被否：把"论文精读"skill 变成所有内容类 skill 的上游依赖，方向反了；且该模板措辞为论文专属。
备选 B：各 skill 内联 draft 字段 —— 被否：违反单一事实来源，7 份副本必然漂移。

缓解漂移：共享层只定义**必须字段与禁止事项**，领域特化文件只允许**增加**字段，不得减少或改写共享层的约束。

### D2：门禁节位置 = "分析产出之后、写作之前"

各 skill 的具体落点（依据 = 该 skill 在哪一步产出足以支撑结构规划的分析物）：

| skill | draft 落点 | 依据 |
|-------|-----------|------|
| `academic-research` | Phase 3（领域重组 / survey-spine）之后、Phase 4 之前 | spine 本身即结构方案，draft 是它的可交互化 |
| `deep-research` | analysis 之后、composition 之前 | analysis 已产出主题→来源映射 |
| `historical-narrative` | Phase 3（synthesis）之后、Phase 4 架构规划之前 | 与 read-article 同构 |
| `book-to-blog` | 章节拆分方案之后、写作之前（full 逐章、extract 单篇） | 章节拆分方案就是 draft 的核心内容 |
| `course-notes` | Phase 3（WEB REFERENCES）之后、Phase 4（COMPOSITION）之前 | Phase 1 的"范围确认"≠ 内容规划；draft 给逐节知识点骨架 |
| `github-repo-read` | 读码/分析完成之后、blog 写作之前 | 分节骨架依赖已完成的分析 |

### D3：门禁节用功能命名，不占 Phase 号

统一为 `## planning draft + 固化 change [<适用模式>]`，节内首句写明"位置：在 X 之后、Y 之前"。

理由：插入 Phase 号会导致 6 个 skill 连锁重编号（且 `course-notes`、`deep-research` 的编号被其他文档引用）。功能名同时表达了"这不是第一步"这一关键信息。

### D4：上游调用例外写入共享层

`read-article` 已有该规则（被 `academic-research` 调用且上游 change 已批准 → 不再二次确认）。本次把这条**提升到共享层**，6 个 skill 与 `read-article` 统一引用，避免各写一份。

### D5：主 spec 用 MODIFIED 修正，不保留过时表述

`content-change-planning` 的两处需重写（详见 spec delta）：requirement 1 改写为两段式；requirement 4 把"管线最前面"改为"分析产出之后、写作之前"。新增 requirement 描述 planning draft 的定位与落盘。

## Risks / Trade-offs

| 风险 | 说明 | 处置 |
|------|------|------|
| 两处 draft 模板漂移 | `read-article` 论文版 vs `blog-rules` 通用版 | 共享层只定义必须字段与禁止事项；领域版只许增不许减；`read-article` 文内声明指向共享层 |
| 新模型尚未端到端验证 | 原 change section 8 标注"待真实论文运行验证" | 本 change 只对齐位置与契约，不改交互语义；若真实运行暴露 draft 不适用（如 `course-notes` 批量课件），在该 skill 的门禁节内标注简化路径为后续 change |
| 旧习惯残留：agent 仍可能在管线开头建 change | 门禁从 Phase 0 下移，模型易按旧模式执行 | 门禁节首句显式写位置；`openspec-gate.md` 用"四步"表述强调 draft 在 change 之前 |
| 6 个 skill 的模式差异导致例外规则复杂 | 豁免（draft/collect/小修）+ 上游调用例外叠加 | 豁免与例外都收在共享层，skill 节内只列"本 skill 适用哪种模式" |
