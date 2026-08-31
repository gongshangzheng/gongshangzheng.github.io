## Why

用户参加了 ChinaSI 2026（中国空间智能大会）上题为 "Efficient Long Visual Generation" 的报告，拍摄了 11 张幻灯片照片（`~/code/digital_human/assets/acceleration/`），涵盖 10 个视频/视觉生成推理加速工作。需要把这些一手资料沉淀为一篇博客草稿，并逐个调研填充，最终形成一篇关于视频生成推理加速全景的博客文章。

## What Changes

- 用 blog-drafts skill 创建草稿 `drafts/video-gen-acceleration.org`（**默认 org 格式**），从 11 张照片中提取 10 个加速工作的基本信息（论文标题、会议、核心方法、关键指标）作为初始骨架
- 逐个模型上网调研（论文原文、代码仓库、原理细节、实测指标），**每次只填充一个模型**，每次填充后由用户审核，审核通过才继续下一个
- 10 个工作：FPSAttention（FP8+稀疏注意力协同设计）、BLADE（块稀疏注意力+步数蒸馏）、Latent Spatial Memory（隐空间空间记忆）、WorldAttention（缓存与计算协同设计）、ZipAR（空间局部性并行解码）、NAR（邻域自回归建模）、FlashAR（后训练加速）、DAX（分布式推理基础设施 36×）、TurboDiffusion（模型-系统协同设计 100-200×）、Inferix（AR-Diffusion 世界模型推理引擎）
- 填充顺序按报告演讲顺序，草稿结构保持简单，避免提前引入复杂组织

## Capabilities

### New Capabilities
- `video-gen-acceleration-draft`: 管理视频生成推理加速博客草稿的创建与逐模型渐进式调研填充流程

### Modified Capabilities
<!-- 无：本变更不修改任何既有 spec 的需求 -->

## Impact

- 新增文件：`drafts/video-gen-acceleration.org`（blog-drafts skill 管理，org 格式）
- 涉及 skill：blog-drafts（创建/更新草稿）、blog-search（写前查重，确认与现有加速相关文章的关系）
- 不修改站点构建、不发布 HTML（发布是后续独立变更）
- 照片资产留在 `~/code/digital_human/assets/acceleration/`，不复制进博客仓库（草稿阶段仅记录信息）
