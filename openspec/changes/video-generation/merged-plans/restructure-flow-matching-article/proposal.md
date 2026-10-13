> **规划已合并（2026-10-13）**：原 `restructure-flow-matching-article` 已并入 `video-generation`，本目录仅保留历史规划。实施与验收以 `../../proposal.md`、`../../design.md`、`../../tasks.md` 为准；本文旧的保持标题、无 sub_id、无 Hub 等边界已由系列整合方案替代。原文重写仍未完成，旧任务复选框不代表合并后的进度。

## Why

用户指出 `flow-matching.html` 内容组织混乱。现文从归一化流、流形假设跳到多段重复的 Flow Matching / 扩散模型讲义，并夹有未完成标题、无效内链和与入门主线关系不明的拓展内容，读者难以建立清楚的概念顺序；本次收束为一篇循序渐进的 Flow Matching 入门文章。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `flow-matching` | An introduction to Flow Matching and Diffusion Models | 既有文章重整 | 保留 `categories/AI/扩散模型`；沿用现有位置，不新增或调整 `sub_id` | `src/pages/flow-matching.html` |

- **更新**：重排 `flow-matching` 的章节主线，合并重复定义，删去偏题的流形学习代码与未完成占位章节，修正断链，并核对关键概念、公式与训练目标。
- **范围**：围绕生成过程、概率路径、向量场、条件流匹配训练、ODE 采样及与扩散模型的关系组织内容；进阶 SDE、score matching 和具体采样器仅在能服务主线时简要说明或移出本篇。
- **Hub**：无，本次只更新既有单篇文章。

## Capabilities

### New Capabilities
- `flow-matching-article`: 一篇结构连贯、概念与公式一致的 Flow Matching 入门文章，满足下方 delta spec 的可验收要求。

### Modified Capabilities
- 无

## Impact

- `src/pages/flow-matching.html`：唯一内容产物；保留现有 slug、标题、分类 alias 和站点 frontmatter 兼容性。
- 需要复核正文所引用的 Flow Matching 原始论文及当前相关页面；现有文章未提供完整、可追溯的素材文件，具体核验来源在 design 中列明。
- 不涉及构建逻辑、模板、依赖、Hub 或其他文章正文。
