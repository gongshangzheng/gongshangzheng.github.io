## Why

用户希望把 3DGrowthNet 从 `drafts/orthodontic-outcome-prediction.org` 中拆出，建立独立论文草稿。现有笔记将模型动机、CVAE-GAN 训练目标和实验结果散落于不同小节，尤其联合训练中分类器、循环一致性、身份约束与对抗损失各自作用不够清晰；新草稿将以“先说明论文整体思路，再逐项拆解思路中的机制”为主线组织。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `3dgrowthnet` | 3DGrowthNet：连续年龄条件下的 3D 面部生长建模 | 论文笔记草稿 | `categories/AI/数字人`；独立草稿，不分配 sub_id | `drafts/3dgrowthnet.org` |

- **新增草稿**：创建独立的 3DGrowthNet 草稿，先用全局思路概览说明任务、模型流程与解耦目标，再按条件编码、CVAE 重建、年龄/性别变换、身份保持、循环一致性、GAN 真实性约束及联合训练逐项展开。
- **旧草稿**：保留 `drafts/orthodontic-outcome-prediction.org` 的原始内容，不在本 change 中删除或迁移其 3DGrowthNet 笔记；待新草稿核对完成后再决定如何去重。
- **限制**：只更新草稿，不生成 HTML、不发布博客。

## Capabilities

### New Capabilities

无（本 change 仅重组本地 brainstorming 草稿，不改变系统行为）。

### Modified Capabilities

无。

## Impact

- `drafts/3dgrowthnet.org`：新增独立草稿，遵循草稿 frontmatter 与 org 格式。
- `drafts/orthodontic-outcome-prediction.org`：只作为现有资料来源，本 change 不修改。
- `raw/_face-future-pdfs/`：优先从现有论文 PDF/文本核对事实；现有 3DGrowthNet 草稿笔记可能含未经核实的归纳，需标出待核对项，不将笔记直接当作论文事实。
- 不涉及 `src/pages/`、站点构建、Hub、sub_id 或生产发布。
