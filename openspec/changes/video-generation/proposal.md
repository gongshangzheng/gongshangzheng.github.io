## Why

**2026-10-15 规划更新**：在 Flow Matching 与 EDM 之间新增独立 x-prediction 篇，EDM 顺延为第六篇并保留总结职责。阅读顺序：DDPM → Score/DSM/SDE → DDIM → Flow Matching → x-prediction → EDM → 条件图像扩散 → 图像基模 → 视频任务 → 视频架构 → 数据评测 → 长视频。x-prediction 七章实质草稿已逐章审阅通过，用户已授权正文写作；设计已同步草稿、数学重点和 23 张图的位置，正文已生成。

视频生成系列需要从 DDPM、Score/DSM、EDM 与 DDIM 进一步连接到现代视频生成所用的 Flow Matching。既有 `flow-matching.html` 包含重复定义、推导缺口、空标题和无效链接；原 `restructure-flow-matching-article` 的重整规划并入本 change，升级为以数学推导、一手论文和教学图示支撑的独立系列章节。正文仍按先批准 Design、再逐篇实施并交用户审阅的顺序推进。

**DDIM 本轮更新（2026-10-14，用户授权发布）**：依据共写草稿修订正文，明确训练不限制相邻采样、DDPM 可构造跨步随机更新，推导 DDIM 的两端转移并对照后验方差；实际使用复用网络并改变去噪采样公式。首章提前提供原论文图与对照表，保留已有教学图及 Mermaid；不重排其他文章。

**最新范围调整（2026-10-15）**：新增图像基模篇，专章解释 U-Net 与 DiT 生成主干，并完整承接 VAE、LDM/Stable Diffusion、RAE、JiT 的表示空间讨论，以及 FLUX、Qwen-Image、Kontext、ACE/ACE++ 的系统设计。条件扩散篇集中解释条件输入、引导、空间控制、参考图、个性化与图像编辑。新增篇安排在条件扩散后、视频任务前；条件扩散 70 与图像基模 80 已按最新篇序落实，90–120 为后续规划。两篇按草稿逐章审阅；相关原文未核验部分不得写成确定结论。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `video-generation-hub` | 视频生成系列总览 | Hub / 系列总览 | `categories/AI/视频生成`；sub_id `0` | `src/pages/video-generation-hub.html` |
| `diffusion-model-basics` | 视频生成系列（一）：扩散模型入门——从加噪直觉到 DDPM | 系列章节 | `categories/AI/视频生成`；sub_id `10` | `src/pages/diffusion-model-basics.html` |
| `score-sde-continuous-diffusion` | 视频生成系列（二）：Score、DSM 与连续时间扩散 | 系列章节 | `categories/AI/视频生成`；sub_id `20` | `src/pages/score-sde-continuous-diffusion.html` |
| `ddim-fast-sampling` | 视频生成系列（三）：DDIM——理解另一种扩散采样路径 | 系列章节 | `categories/AI/视频生成`；sub_id `30` | `src/pages/ddim-fast-sampling.html` |
| `flow-matching` | 视频生成系列（四）：Flow Matching——从概率路径到视频生成 | 既有文章重整 / 系列章节 | `categories/AI/视频生成`；sub_id `40` | `src/pages/flow-matching.html` |
| `x-prediction` | 视频生成系列（五）：x-prediction | 系列章节；正文已生成 | `categories/AI/视频生成`；sub_id `50` | `src/pages/x-prediction.html`（已获写作授权） |
| `edm-design-space` | 视频生成系列（六）：EDM——重新梳理扩散模型的设计空间 | 系列章节 | `categories/AI/视频生成`；sub_id `60` | `src/pages/edm-design-space.html` |
| `image-foundation-models` | 视频生成系列（八）：图像基模——表示空间与生成编辑 | 新增系列章节；十章正文已生成 | `categories/AI/视频生成`；规划 sub_id `80` | `src/pages/image-foundation-models.html` |
| `conditional-image-diffusion` | 视频生成系列（七）：条件扩散——控制、适配与编辑 | 系列章节 | `categories/AI/视频生成`；sub_id `70` | `src/pages/conditional-image-diffusion.html` |
| `video-generation-tasks-spacetime` | 视频生成系列（九）：视频生成任务与时空建模基础 | 系列章节 | `categories/AI/视频生成`；sub_id `90` | `src/pages/video-generation-tasks-spacetime.html` |
| `video-diffusion-architectures` | 视频生成系列（十）：视频扩散模型的架构演进 | 系列章节 | `categories/AI/视频生成`；sub_id `100` | `src/pages/video-diffusion-architectures.html` |
| `video-generation-data-evaluation` | 视频生成系列（十一）：训练数据、评测基准与评价指标 | 系列章节 | `categories/AI/视频生成`；sub_id `110` | `src/pages/video-generation-data-evaluation.html` |
| `long-video-temporal-consistency` | 视频生成系列（十二）：时间一致性、长视频与流式生成 | 系列章节 | `categories/AI/视频生成`；sub_id `120` | `src/pages/long-video-temporal-consistency.html` |

编号依据：`~/.venv/bin/python3 scripts/check-sub-id.py --category AI --suggest` 已确认该系列使用独立二级 subcategory；正式实施前须在纳入 Flow Matching 章节后对 `10–120` 全部编号重新核验。

- **新增**：EDM 作为扩散模型基础中的独立章节，接在 x-prediction 之后，总结前述方法；解释共同去噪框架、probability-flow ODE、Heun 采样、随机 churn、网络预条件、训练噪声分布与消融结果。
- **更新**：获批后从 Score/SDE 文章中移除 EDM 信息框、相关正文和论文引用，不在该篇设置 EDM 预告；Score/SDE 与 EDM 通过系列导航关联。
- **系列调整**：正文共 12 篇，按本轮确认顺序排列；x-prediction 独立成篇，EDM 为第六篇。篇序授权不代表文章大纲获批。
- **Flow Matching 规则升级**：完整推导条件速度场、边际向量场、CFM/FM 损失关系与采样更新；归档并引用 Lipman et al. 原论文，必要时补充 Rectified Flow 与 Wan 原始来源；逐图设计标题、插入位置、原文定位和解释目的，禁止以最终公式和无来源配图代替推导。
- **规划合并**：原 change 的提案、大纲、14 项待办及验收要求已转入本 change；原文件迁至 `merged-plans/restructure-flow-matching-article/` 作为历史记录，不代表正文实施已完成。
- **Hub**：更新总览中的学习路线、章节目录和前后篇导航。
- **素材**：EDM 论文 PDF、arXiv 源码及图表数据已在 `raw/edm-2022/`；分析 lane 和 synthesis 索引记录问题定义、方法、实验、术语及配图定位。文章事实和引用回到 Karras et al. (2022) 原论文，不在正文提及内部 Org 笔记。
- **审批门禁**：本轮已获授权将首篇草稿结构写入 Design；首篇后续页面同步仍按逐篇审阅和构建预览流程执行。Flow Matching 正文重写及未确认的系列编号/导航调整，须待对应 Design 决策明确后再实施。此前 EDM 与 DDIM 的已完成工作保留。

## Capabilities

### New Capabilities

无。本 change 产出内容页面，不改变站点行为；使用 `skip_specs: true`。

### Modified Capabilities

无。

## Impact

- `raw/edm-2022/analysis/`、`raw/edm-2022/synthesis.md`：补充 EDM 原论文的内部阅读分析与定位索引。
- `openspec/changes/video-generation/`：统一 12 篇目录、Flow Matching 数学与配图设计、编号、审批和实施任务；保留原 change 的合并记录。
- `raw/flow-matching/`：后续归档原论文、源码/附录、方法推导分析及图表定位；已有 Lipman PDF 可从 `raw/score-sde-continuous-diffusion/sources/` 复用并记录来源。
- `src/pages/`：后续获批重整 `flow-matching.html`，加入视频生成系列并保留旧入口；更新 DDIM → Flow Matching → x-prediction → EDM → 条件图像扩散 → 图像基模的必要导航及后续编号；其他章节继续逐篇审阅。
- `media/images/edm-design-space/`：审批后存放论文原图裁切、仅包含伪代码的算法截图和自绘解释图。
- `media/images/flow-matching/`：后续存放原论文局部图、教学示意图；Flow Matching 的 Mermaid 和图注在对应 HTML 中实现。
- **不涉及**：修改 Org 原笔记、站点构建逻辑；本轮仅同步规划，不生成两篇正文或调整线上编号。
