## Why

当前 `read-article` skill 的流程仍以固定 subagent 编排为中心：提取、四路分析、分段写作和三路 Review 都被写成默认执行步骤。这个设计来自 agent 能力较弱、需要并行拆分工作的阶段；现在主 agent 已能在同一上下文中完成阅读、综合、写作和审校，固定拆分会增加交接、重复读取和结果合并成本。

参考 `~/code/ProjFlow` 最新的 `add-article-note-skill` 设计后，本 change 重新设计流程，而不是在旧 Phase 上逐项删减：先获取并分析真实素材，再生成一份可供用户审阅和交互修改的 OpenSpec planning draft；通过 draft 交互补充文章所需信息、修正事实和调整结构，最终再固化为可执行的 change。subagent 变成按需启用的分析 lane，确定性工作交给脚本，理解和决策留给 agent。

## What Changes

- 将默认流程重构为：素材获取 → 按需分析 → synthesis 导航索引 → 生成 OpenSpec planning draft → 用户通过 draft 交互补充/修正信息 → 固化 change 并确认结构 → 主 agent 写作 → 统一 Review 与发布维护。
- 将 full 模式的 OpenSpec 门禁从“直接创建已确认 change”改为“先生成可交互的 planning draft，再在用户确认后固化为可执行 change”。
- 区分三种外部工作状态：`draft`（论文素材/草稿填充模式）、`planning draft`（OpenSpec 中间规划阶段）和 `full`（已确认 change 后的 HTML 生产阶段）。
- 保留 `full`、`collect`、`draft` 三种用户入口及其产出边界。
- 引入 `direct`、`assisted`、`deep` 三种内部执行模式：默认 direct，复杂任务才按需委派 1 个或多个分析 lane。
- 将固定的背景、引用链、宝藏、方法论四路分析改造成可选分析 lane；补充 experiment、terminology、code-analysis、image-collection 等按需 lane。
- 保留 `analysis/` 事实产物和 `synthesis.md` 导航索引，但不再要求每次都生成固定的四份分析文件。
- 明确主 agent、subagent、确定性脚本的职责边界：subagent 只输出事实、来源指针和不确定性，不创建最终 change、不写最终文章、不绕过用户确认；主 agent 生成和维护 planning draft。
- 保留原有核心质量要求：原文优先、库内检索、引用、公式、图片、实验细节、局限性、HTML 规范、构建、Hub 更新和交叉回链。
- 将旧 phase/subagent 文档改为按需参考，清理与新流程冲突的“必须派发”表述；历史 raw 素材继续兼容读取。

## Capabilities

### New Capabilities

- None. This is a workflow and documentation refactor; it does not introduce a new runtime capability.

### Modified Capabilities

- None. `read-article` is an agent skill rather than an OpenSpec product capability; its execution contract is being reorganized without changing the blog site's runtime behavior.

## Impact

- 主要影响：`.agents/skills/read-article/SKILL.md` 及其 `phases/`、`references/`、`subagents/` 文档和相关辅助脚本说明。
- 不修改 `src/pages/`、博客构建逻辑、文章模板或已有文章内容。
- 历史 `raw/<slug>/subagents/` 和 `synthesis.md` 不删除；新流程将其作为兼容素材读取，并优先使用新的 `analysis/` 目录约定。
- planning draft 不写 `src/pages/`，也不视为用户已批准的 change；只有完成交互确认并固化后才允许进入 HTML 写作。
- 需要通过 OpenSpec 文档一致性检查，以及仓库规定的 `npm run check` 和 `npm test`（若环境支持）。
