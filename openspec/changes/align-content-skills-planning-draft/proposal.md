## Why

`read-article` 的流程已被 change `simplify-read-article-workflow`（2026-09-29 归档）重构，门禁从"第一步直接建 change"升级为**两段式**：

```
素材获取 → 按需分析 → synthesis → Phase 4 planning draft（可多轮交互）
        → 用户确认 → Phase 5 固化 OpenSpec change + 结构确认 → 写作
```

带来三个不一致：

1. **门禁位置不一致**：其余 6 个内容类 skill（`academic-research`、`deep-research`、`historical-narrative`、`book-to-blog`、`course-notes`、`github-repo-read`）仍是旧的 `## Phase 0 · OpenSpec 门禁`——把"建 change"放在**管线最前面**。而它们的素材获取与调研恰好是最贵的环节，用户在 change 成型前已付出全部成本，与两段式模型的初衷相悖。
2. **draft 契约缺共享层**：planning draft 的规范与模板目前只存在于 `read-article/references/planning-draft-template.md`，且措辞是论文专属（"论文速览""Phase 2""四路分析"）。其余 6 个 skill 要用就得依赖 `read-article`——把"论文精读"skill 变成所有内容类 skill 的依赖，方向是反的。
3. **主 spec 与新模型冲突**：已合入的 `content-change-planning` 里有一条 requirement 的 scenario 写着"该 skill 的管线**最前面**存在门禁小节"——这正是被重构掉的假设；另有 requirement 把流程描述为"必须先创建 change 并取得用户确认"，未涵盖"先 draft、后固化"的中间态。

## What Changes

- **MODIFIED `content-change-planning` spec**：
  - 把「内容类产出必须先建 change 再执行」改写为两段式：先产出可交互 planning draft → 用户确认 → 固化为 change → 执行写作
  - 把「规范单一事实来源」中"门禁小节位于管线最前面"的表述改为"位于分析产出之后、写作之前"
  - **新增** requirement：planning draft 的定位（不是已批准大纲、不得写 `src/pages/`）、落盘位置、多轮交互与已确认决策的沉淀要求
- **新增共享层契约**：`blog-rules/references/planning-draft.md`（通用两段式门禁规范）+ `blog-rules/templates/planning-draft.md`（通用 draft 字段模板）；`read-article` 的论文专属模板保留为领域特化补充并指向共享层
- **改写门禁规范** `blog-rules/references/openspec-gate.md`：把"三步操作（建 change → 填模板 → 待审批）"改为"四步（产出 draft → 交互确认 → 固化 change → 结构确认）"，并补上游调用例外
- **6 个 skill 的门禁节改写**：`## Phase 0 · OpenSpec 门禁` → 统一为「planning draft + 固化 change」，位置按各自管线移到"分析产出之后、写作之前"；小节仍只保留 3-5 行指针
- **明确上游调用例外**：被上游 skill 调用且上游 change 已批准时，不再要求用户二次确认，但本层结构与素材来源必须写入上游 change 以供追溯（`read-article` 已有此规则，6 个 skill 补齐镜像规则）

## Capabilities

### New Capabilities

（无）

### Modified Capabilities
- `content-change-planning`: 门禁从"一步建 change"改为两段式（planning draft → 固化 change），并明确 draft 的定位与落盘；"门禁小节位于管线最前面"的表述改为"位于分析产出之后、写作之前"

## Impact

- `openspec/specs/content-change-planning/spec.md`：经 delta 修订（2 条 MODIFIED、1 条 ADDED）
- `~/gongshangzheng.github.io/.agents/skills/blog-rules/`：新增 `references/planning-draft.md`、`templates/planning-draft.md`；改写 `references/openspec-gate.md`；`SKILL.md` 引用索引表登记新增两项
- 6 个 skill 的 SKILL.md：`academic-research`、`deep-research`、`historical-narrative`、`book-to-blog`、`course-notes`、`github-repo-read` 各改写门禁小节（位置下移 + 指向共享层）
- `read-article`：仅改两处路径引用（论文专属 draft 模板 → 声明为共享层的领域特化补充），**不改其流程**
- **不涉及**：`src/pages/` 内容、`build.js` / `lib/`、发布流程
- 验证：`openspec validate align-content-skills-planning-draft --strict`；`scripts/check-skill-paths.py` 退出码 0；7 个 skill 的门禁节均指向共享层且位置自洽
- **前置依赖**：新模型尚未经真实论文端到端验证（原 change 的 section 8 明确"待后续真实论文运行时验证"）；本 change 只做一致性对齐，不改变 draft 交互本身的语义
