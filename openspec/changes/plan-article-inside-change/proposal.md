## Why

`read-article` 在前一次重构（change `simplify-read-article-workflow`，2026-09-29 归档）中引入了 **planning draft** 作为 Phase 4 的中间门禁：先把文章规划写进 `raw/<slug>/planning-draft.md`，用户确认后再在 Phase 5 固化成 OpenSpec change。

这条路径的问题：

1. **规划写了两遍**：draft 的字段（逐节写什么 + 素材来源 + 图表公式 + 缺口 + 待确认项）与 change `design.md` 的「文章内容大纲」几乎同构。Phase 5 还得把 draft 的已确认决策"搬"进 design，多一次搬运就多一次丢失/漂移的机会。
2. **规划落在 OpenSpec 之外**：draft 放在 `raw/` 下，不受 `openspec validate` 约束、不进 git 审查视野、不被 `openspec list` 跟踪，等于在最需要留痕的"写作规划"环节留下了一份游离文档。
3. **两个门禁概念重叠**：用户要确认两次（先 draft、后 change 结构），而两次确认的内容是同一件事。
4. **与其余 6 个内容类 skill 不一致**：`academic-research` / `deep-research` / `historical-narrative` / `book-to-blog` / `course-notes` / `github-repo-read` 都是"直接建 change"（`## Phase 0 · OpenSpec 门禁`），只有 `read-article` 走 draft。

结论：**取消 planning draft，写作规划直接写进 change 的 `design.md`**——素材与分析完成后建 change，在 change 里规划这篇文章怎么写，用户确认后开始写作。

## What Changes

- **`read-article` 去掉 planning draft 阶段**：
  - 删除「## planning draft（full 的中间门禁）」整节与 `references/planning-draft-template.md`
  - Phase 4 由「planning draft」改为「**建 change 并规划文章**」：`openspec new change` + 按 `blog-rules/templates/content-change/` 填 `proposal.md` / `design.md` / `tasks.md`，其中 `design.md` 的「文章内容大纲」承载写作规划（逐节：写什么 + 素材来源 + 必备表/公式/图 + 字数参考 + 缺料替代）
  - 原 Phase 5（固化 change + 结构确认）合并进来：change 本身就是待审批物，用户确认即"批准写作规划"
  - 后续 Phase 6/7/8（写 HTML / 统一审校 / 发布维护）顺移为 Phase 5/6/7，全文引用同步
  - 头部管线说明、模式表、管线总览图、渐进式披露路由、执行规则 4/16、`draft` 模式小节、Phase 6 写作数据源、故障处理中的 draft 相关条目一并同步
- **把 draft 模板里仍有价值的东西并入 change 模板**：`references/planning-draft-template.md` 的「起草原则」（每节必须指到素材、缺料要写替代方案、区分事实与判断、暴露待确认项、保持可迭代）并入 `blog-rules/templates/content-change/design.md` 的填写说明，避免删除时丢掉这些约束
- **`blog-rules/references/openspec-gate.md` 明确一条**：写作规划 MUST 写在 change 的 `design.md`（「文章内容大纲」）里，MUST NOT 另建 planning draft / 规划草稿文件；`design.md` 即写作蓝图
- **主 spec 修正一处与事实不符的表述**：`content-change-planning` 中"门禁小节位于该 skill 管线最前面"→ 改为"位于素材/分析产出之后、写作之前"（`read-article` 在 Phase 4，其余 skill 在其管线的规划节点）
- **作废被取代的 change**：删除 `openspec/changes/align-content-skills-planning-draft`（未实施、0/16，方向与本次相反）
- **不动**：其余 6 个 skill 的门禁节（它们已是"直接建 change"，与本次方向一致）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities
- `content-change-planning`: 修正门禁小节的位置表述（"管线最前面" → "素材/分析产出之后、写作之前"），使其与 `read-article` 的实际流程一致

## Impact

- `~/gongshangzheng.github.io/.agents/skills/read-article/SKILL.md`：约 20 处涉及 planning draft 的表述 + Phase 编号顺移
- 删除 `~/gongshangzheng.github.io/.agents/skills/read-article/references/planning-draft-template.md`
- `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/design.md`：并入 draft 的起草原则
- `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`：补"规划写在 change 里"一条
- `openspec/specs/content-change-planning/spec.md`：经 delta 修订 1 条 requirement
- 删除 `openspec/changes/align-content-skills-planning-draft/`
- `openspec/changes/styletalkpp-2024/`：从现有 StyleTalk++ planning 内容固化一份真实文章 change（只到用户审批，不写 HTML）；迁移后删除 `raw/styletalkpp-2024/planning-draft.md`
- **不涉及**：`src/pages/` 内容、构建管线、其余 6 个 skill
- 验证：`openspec validate plan-article-inside-change --strict`；`scripts/check-skill-paths.py` 退出码 0；grep 确认 read-article 内不再出现 `planning draft` / `planning-draft`；`node build.js` + `npm test` 通过

- **首次应用与验收**：把当前 StyleTalk++ 的规划内容（`raw/styletalkpp-2024/planning-draft.md`）迁入正式 change `openspec/changes/styletalkpp-2024/` 的 `design.md`（含完整「文章内容大纲」），作为本 change 的真实端到端验证；**只创建并呈现文章 change 待确认，不写 HTML、不发布**。用户确认文章 change 后，再按新流程进入写作。