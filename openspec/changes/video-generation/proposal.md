## Why

视频生成系列需要从 DDPM、Score/DSM、EDM 与 DDIM 进一步连接到现代视频生成所用的 Flow Matching。既有 `flow-matching.html` 包含重复定义、推导缺口、空标题和无效链接；原 `restructure-flow-matching-article` 的重整规划并入本 change，升级为以数学推导、一手论文和教学图示支撑的独立系列章节。正文仍按先批准 Design、再逐篇实施并交用户审阅的顺序推进。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `video-generation-hub` | 视频生成系列总览 | Hub / 系列总览 | `categories/AI/视频生成`；sub_id `0` | `src/pages/video-generation-hub.html` |
| `diffusion-model-basics` | 视频生成系列（1）：扩散模型入门——从加噪直觉到 DDPM | 系列章节 | `categories/AI/视频生成`；sub_id `10` | `src/pages/diffusion-model-basics.html` |
| `score-sde-continuous-diffusion` | 视频生成系列（2）：Score、DSM 与连续时间扩散 | 系列章节 | `categories/AI/视频生成`；sub_id `20` | `src/pages/score-sde-continuous-diffusion.html` |
| `edm-design-space` | 视频生成系列（3）：EDM——重新梳理扩散模型的设计空间 | 系列章节 | `categories/AI/视频生成`；sub_id `30` | `src/pages/edm-design-space.html` |
| `ddim-fast-sampling` | 视频生成系列（4）：DDIM——理解另一种扩散采样路径 | 系列章节 | `categories/AI/视频生成`；sub_id `40` | `src/pages/ddim-fast-sampling.html` |
| `flow-matching` | 视频生成系列（5）：Flow Matching——从概率路径到视频生成 | 既有文章重整 / 系列章节 | 保留 `categories/AI/扩散模型`，新增 `categories/AI/视频生成`；sub_id `50` | `src/pages/flow-matching.html` |
| `conditional-image-diffusion` | 视频生成系列（6）：条件扩散——从 CFG 到潜空间图像生成 | 系列章节 | `categories/AI/视频生成`；sub_id `60` | `src/pages/conditional-image-diffusion.html` |
| `video-generation-tasks-spacetime` | 视频生成系列（7）：视频生成任务与时空建模基础 | 系列章节 | `categories/AI/视频生成`；sub_id `70` | `src/pages/video-generation-tasks-spacetime.html` |
| `video-diffusion-architectures` | 视频生成系列（8）：视频扩散模型的架构演进 | 系列章节 | `categories/AI/视频生成`；sub_id `80` | `src/pages/video-diffusion-architectures.html` |
| `video-generation-data-evaluation` | 视频生成系列（9）：训练数据、评测基准与评价指标 | 系列章节 | `categories/AI/视频生成`；sub_id `90` | `src/pages/video-generation-data-evaluation.html` |
| `long-video-temporal-consistency` | 视频生成系列（10）：时间一致性、长视频与流式生成 | 系列章节 | `categories/AI/视频生成`；sub_id `100` | `src/pages/long-video-temporal-consistency.html` |

编号依据：`~/.venv/bin/python3 scripts/check-sub-id.py --category AI --suggest` 已确认该系列使用独立二级 subcategory；正式实施前须在纳入 Flow Matching 章节后对 `10–100` 全部编号重新核验。

- **新增**：EDM 作为扩散模型基础中的独立章节，紧接 Score/DSM 与连续时间扩散；解释共同去噪框架、probability-flow ODE、Heun 采样、随机 churn、网络预条件、训练噪声分布与消融结果。
- **更新**：获批后从 Score/SDE 文章中移除 EDM 信息框、相关正文和论文引用，不在该篇设置 EDM 预告；Score/SDE 与 EDM 的相邻关系由系列导航呈现。
- **系列调整**：正文共 10 篇；前四篇为 DDPM、Score/DSM/SDE、EDM、DDIM，Flow Matching 为第 5 篇，条件图像扩散与视频章节顺延至 6–10。保留 `flow-matching.html` 的旧 URL、扩散模型分类 alias，并将旧英文标题加入检索别名；不新建重复文章。规划确认后逐篇实施与审阅。
- **Flow Matching 规则升级**：完整推导条件速度场、边际向量场、CFM/FM 损失关系与采样更新；归档并引用 Lipman et al. 原论文，必要时补充 Rectified Flow 与 Wan 原始来源；逐图设计标题、插入位置、原文定位和解释目的，禁止以最终公式和无来源配图代替推导。
- **规划合并**：原 change 的提案、大纲、14 项待办及验收要求已转入本 change；原文件迁至 `merged-plans/restructure-flow-matching-article/` 作为历史记录，不代表正文实施已完成。
- **Hub**：更新总览中的学习路线、章节目录和前后篇导航。
- **素材**：EDM 论文 PDF、arXiv 源码及图表数据已在 `raw/edm-2022/`；分析 lane 和 synthesis 索引记录问题定义、方法、实验、术语及配图定位。文章事实和引用回到 Karras et al. (2022) 原论文，不在正文提及内部 Org 笔记。
- **审批门禁**：本轮授权是合并与升级规划；Flow Matching 正文重写和新增系列编号/导航变更须在用户批准相应 Design 后实施。此前 EDM 与 DDIM 已获实施授权，其已完成工作保留。每完成一篇，构建最新预览并交用户审阅。

## Capabilities

### New Capabilities

无。本 change 产出内容页面，不改变站点行为；使用 `skip_specs: true`。

### Modified Capabilities

无。

## Impact

- `raw/edm-2022/analysis/`、`raw/edm-2022/synthesis.md`：补充 EDM 原论文的内部阅读分析与定位索引。
- `openspec/changes/video-generation/`：统一 10 篇目录、Flow Matching 数学与配图设计、编号、审批和实施任务；保留原 change 的合并记录。
- `raw/flow-matching/`：后续归档原论文、源码/附录、方法推导分析及图表定位；已有 Lipman PDF 可从 `raw/score-sde-continuous-diffusion/sources/` 复用并记录来源。
- `src/pages/`：后续获批重整 `flow-matching.html`，加入视频生成系列并保留旧入口；更新 DDIM → Flow Matching → 条件图像扩散的必要导航及后续编号；其他章节继续逐篇审阅。
- `media/images/edm-design-space/`：审批后存放论文原图裁切、仅包含伪代码的算法截图和自绘解释图。
- `media/images/flow-matching/`：后续存放原论文局部图、教学示意图；Flow Matching 的 Mermaid 和图注在对应 HTML 中实现。
- **不涉及**：修改 Org 原笔记、站点构建逻辑；本轮不修改正文页面。
