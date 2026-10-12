## Why

用户希望系统学习视频生成；此前的单篇提纲未形成从扩散基础到视频生成的连续学习路径。用户已明确将内容拆成系列、直接发布为博客 page，并已要求删除 `drafts/video-generation.org`，因此本 change 不再依赖或产出该草稿。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `video-generation-hub` | 视频生成系列总览 | Hub / 系列总览 | `categories/AI/视频生成`；sub_id `0` | `src/pages/video-generation-hub.html` |
| `diffusion-model-basics` | 视频生成系列（1）：扩散模型入门——从加噪直觉到 DDPM | 系列章节 | `categories/AI/视频生成`；sub_id `10` | `src/pages/diffusion-model-basics.html` |
| `score-sde-continuous-diffusion` | 视频生成系列（2）：Score、DSM 与连续时间扩散 | 系列章节 | `categories/AI/视频生成`；sub_id `20` | `src/pages/score-sde-continuous-diffusion.html` |
| `ddim-fast-sampling` | 视频生成系列（3）：DDIM——理解另一种扩散采样路径 | 系列章节 | `categories/AI/视频生成`；sub_id `30` | `src/pages/ddim-fast-sampling.html` |
| `conditional-image-diffusion` | 视频生成系列（4）：条件扩散——从 CFG 到潜空间图像生成 | 系列章节 | `categories/AI/视频生成`；sub_id `40` | `src/pages/conditional-image-diffusion.html` |
| `video-generation-tasks-spacetime` | 视频生成系列（5）：视频生成任务与时空建模基础 | 系列章节 | `categories/AI/视频生成`；sub_id `50` | `src/pages/video-generation-tasks-spacetime.html` |
| `video-diffusion-architectures` | 视频生成系列（6）：视频扩散模型的架构演进 | 系列章节 | `categories/AI/视频生成`；sub_id `60` | `src/pages/video-diffusion-architectures.html` |
| `video-generation-data-evaluation` | 视频生成系列（7）：训练数据、评测基准与评价指标 | 系列章节 | `categories/AI/视频生成`；sub_id `70` | `src/pages/video-generation-data-evaluation.html` |
| `long-video-temporal-consistency` | 视频生成系列（8）：时间一致性、长视频与流式生成 | 系列章节 | `categories/AI/视频生成`；sub_id `80` | `src/pages/long-video-temporal-consistency.html` |

编号依据：`~/.venv/bin/python3 scripts/check-sub-id.py --category AI --suggest` 已检查现有 AI 分类路径；目标路径 `categories/AI/视频生成` 尚不存在，故规划为新建独立二级 subcategory，并按系列规则使用 Hub `0`、章节 `10` 起以 10 递增。分类登记后、发布前须对新路径再次运行编号检查。

- **系列组织**：新增 8 篇独立正文 page 和 1 个 Hub；首篇以 DDPM 建立扩散基础，并补充流形假设、支撑集错位、已知噪声监督及 score 向量场的直觉；后续基于原始论文介绍 DSM 与连续时间 SDE、DDIM 和条件图像生成，再过渡到视频生成。
- **分类与导航**：在 `categories/AI` 下新建独立 subcategory `categories/AI/视频生成`；Hub 以该路径的 `/index` alias 接管分类索引，并提供阅读路径、系列目录和前后篇导航。
- **素材**：使用 Roam 笔记、本地 CVPR 2024 教程 PDF 和 `src/pages/slowfast-paper.html` 作为研究线索；事实、公式、图表和数据必须回到原论文、官方项目页或数据集卡核验。已为首两篇归档 DDPM、Sohl-Dickstein 非平衡热力学、GAN/WGAN、Vincent DSM、Song & Ermon NCSN、Anderson 反向时间扩散及 Song et al. 连续时间 SDE 原文，并记录各自用途与适用边界。
- **发布**：最终产物直接写入 `src/pages/*.html`，通过 HTML 博客模板、引用校验和站点构建后发布；不将草稿作为交付物，不修改 `~/org/roam` 原笔记。

## Capabilities

### New Capabilities

无。本 change 产出内容页面，不改变站点行为；使用 `skip_specs: true`。

### Modified Capabilities

无。

## Impact

- `src/pages/`：新增 8 篇系列正文页和 1 个 Hub 页；首篇融合原规划中的扩散入门与 DDPM 两篇。
- `data/category-names.json`：为新子分类补充英文 slug 映射（若确认现有映射未覆盖）。
- `openspec/changes/video-generation/`：维护系列规划、来源核查和发布任务。
- `drafts/video-generation.org`：已按用户要求删除，不作为素材或交付物。
- `media/images/`：存放系列自绘图及经许可核验的本地配图。
- **不涉及**：修改 Roam 原笔记、站点构建逻辑、已有发布文章正文。
