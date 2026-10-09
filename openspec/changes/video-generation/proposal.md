## Why

用户要求系统学习视频生成，并先在现有“视频生成”草稿中补充扩散模型基础，清楚讲解 DDPM、DDIM 及相关公式和中间推导。当前 `drafts/video-generation.org` 已有 identity drift 等零散提纲，但缺少作为后续视频生成学习基础的扩散章节；`~/org/roam` 中已有 DDPM、DDIM 等笔记，可作为整理素材。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `video-generation` | 视频生成 | 学习型原始草稿（不发布） | 沿用现有草稿 alias `categories/杂识`；sub_id 保持 `auto`（本草稿不发布，不分配发布编号） | `drafts/video-generation.org` |

- **更新草稿**：沿用既有 frontmatter、slug 和内容，在视频生成学习路线前置扩散基础章节，覆盖 DDPM 与 DDIM，包含公式推导、符号解释及从训练目标到采样算法的衔接。
- **素材**：`~/org/roam/articles/Denoising Diffusion Probablistic Models.org`、`~/org/roam/articles/DDIM.org`、`~/org/roam/notes/ai-ml/Diffusion Model.org`、`~/org/roam/notes/ai-ml/对扩散模型的理解.org`；尤其核查用户提到的 MIT 扩散课程笔记是否在 Roam 其他位置。
- 本次仅更新草稿，不生成 HTML、不发布，也不修改 Roam 原笔记。

## Capabilities

### New Capabilities

无。本 change 只更新未发布草稿，不涉及站点行为；使用 `skip_specs: true`。

### Modified Capabilities

无。

## Impact

- `drafts/video-generation.org`：新增扩散基础内容。
- `~/org/roam/`：只读检索与引用素材，不修改。
- 不涉及 `src/pages/`、站点构建或发布流程。
