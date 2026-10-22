> 最新进度（2026-10-22）：MinD-Video已审阅通过；Generative Image Dynamics草稿完成待审，第七章13篇草稿已齐。原图原表及训练/采样机制已补齐，详见design末尾和tasks 14.46；未输出HTML。

> 最新进度（2026-10-22）：NExT-GPT审阅通过；MinD-Video草稿完成待审，补齐原图、配置与消融，并核实Generative Image Dynamics身份。详见design末尾及tasks 14.45；本轮未发布正文。

**2026-10-22 最新草稿进展**：TPoS已审阅通过；完成NExT-GPT v3草稿待审，讲清多模态输入分组、信号隐藏状态、扩散条件接口及三阶段训练，保留八张原图及全部主文/附录表。区分2023首发与ICML2024修订内容、语义协调与音画同步，披露结果口径及训练描述疑点。仅草稿，未生成HTML。

**2026-10-22 最新草稿进展**：DragNUWA已审阅通过；完成TPoS v1草稿待审，解释时序音频编码、CLIP对齐、语义去噪引导、共享初始噪声与条件插值，保留两张原表和十二张原图。源码/PDF未完整取得，依官方HTML并记录回退；全部草稿图片路径及文件可读性已核对。仅Org草稿。

**2026-10-22 最新草稿进展**：MovieFactory已审阅通过；第七章完成DragNUWA v1草稿待审，保留六张原图和完整配置表，解释光流轨迹监督、多尺度调制与稠密到稀疏训练。原文没有性能数值表，不将定性例子作为定量优越性证明；仅草稿。

**2026-10-22 最新草稿进展**：CoDi已审阅通过；按确认首发顺序完成MovieFactory v1草稿待审，保留五张原图和唯一原文数值表，解释剧本规划、空间/时间分阶段训练及声音检索，区分短视频指标与整片效果。仅草稿，未生成HTML。

**2026-10-22 最新草稿进展**：AADiff已审阅通过；第七章完成CoDi v1草稿待审，保留六张原图与全部定量结果、数据及配置表。重点解释输入桥接与输出状态交换、配对训练和组合泛化边界；仅更新草稿，不生成HTML。

**2026-10-22 最新草稿进展**：MCDiff已审阅通过；第七章完成AADiff v2草稿待审，保留九张原图，说明音频选词、注意力强度、滑窗、真实图像反演及与Generative Disco差异。原文无数值表格，保留曲线与定性证据；具体见Design。本轮不生成HTML。

**2026-10-22 最新草稿进展**：LaMD已审阅通过；第七章完成MCDiff v1草稿待审，保留六张原图、全部主文/附录实验表与训练采样解释，区分稀疏运动补全和画面扩散。详情见Design；本轮不生成HTML。

**2026-10-22 最新草稿进展**：Generative Disco已审阅通过；第七章按首发顺序完成LaMD草稿待审，依据2025-04-18修订v2而非将新增实验归为2023首发结果。保留7张原图、Tables1–13、数学与表示/训练/推理解释；具体见Design。本轮不生成HTML。

**2026-10-21 最新发布进展**：第六章四篇全部审阅通过，已据完整草稿生成系列第十四篇《长视频生成基模》，保留原图、公式与实验表；同步导航并构建本地预览。第七章MM-Diffusion已通过并补入模块比较；LFDM v1已审阅通过；按首发顺序完成Generative Disco v2草稿待审，其余方法尚未展开；具体映射及状态见Design。

**2026-10-21 最新实施进展**：用户同意继续第四篇；训练高效方法已依据已审阅草稿转正文（系列十二/sub_id120），完成构建预览，等待审阅。第五章仍按草稿完成与审阅状态推进。

**2026-10-21 最新实施进展**：用户同意继续第三篇；其他早期视频生成研究已由独立实质草稿转为系列十一/sub_id110，完成构建与预览，等待审阅。

**2026-10-21 实施进展**：首篇正文审阅通过，用户授权继续第二篇；开放视频基模已依据独立草稿生成并构建，等待审阅。后续文章仍逐篇授权推进。

**2026-10-21 最新发布划分**：用户授权七个视频基模章节各占一篇正文，本轮先转第一章。视频任务基础并入已审阅第一章，采用系列第九篇/sub_id90；开放基模、其他早期研究、训练高效方法、分镜、长视频基模、多模态分别顺延十至十五篇；数据评测与长视频专题顺延十六/十七篇。具体草稿映射、状态和第一篇骨架以 Design 末尾最新决策为准；下列文章清单已同步最新17篇规划。

## Why

**2026-10-15 规划更新**：在 Flow Matching 与 EDM 之间新增独立 x-prediction 篇，EDM 顺延为第六篇并保留总结职责。阅读顺序：DDPM → Score/DSM/SDE → DDIM → Flow Matching → x-prediction → EDM → 条件图像扩散 → 图像基模 → 视频任务 → 视频架构 → 数据评测 → 长视频。x-prediction 七章实质草稿已逐章审阅通过，用户已授权正文写作；设计已同步草稿、数学重点和 23 张图的位置，正文已生成。

视频生成系列需要从 DDPM、Score/DSM、EDM 与 DDIM 进一步连接到现代视频生成所用的 Flow Matching。既有 `flow-matching.html` 包含重复定义、推导缺口、空标题和无效链接；原 `restructure-flow-matching-article` 的重整规划并入本 change，升级为以数学推导、一手论文和教学图示支撑的独立系列章节。正文仍按先批准 Design、再逐篇实施并交用户审阅的顺序推进。

**DDIM 本轮更新（2026-10-14，用户授权发布）**：依据共写草稿修订正文，明确训练不限制相邻采样、DDPM 可构造跨步随机更新，推导 DDIM 的两端转移并对照后验方差；实际使用复用网络并改变去噪采样公式。首章提前提供原论文图与对照表，保留已有教学图及 Mermaid；不重排其他文章。

**最新范围调整（2026-10-15）**：新增图像基模篇，专章解释 U-Net 与 DiT 生成主干，并完整承接 VAE、LDM/Stable Diffusion、RAE、JiT 的表示空间讨论，以及 FLUX、Qwen-Image、Kontext、ACE/ACE++ 的系统设计。条件扩散篇集中解释条件输入、引导、空间控制、参考图、个性化与图像编辑。新增篇安排在条件扩散后、视频任务前；条件扩散 70 与图像基模 80 已按最新篇序落实，90–120 为后续规划。两篇按草稿逐章审阅；相关原文未核验部分不得写成确定结论。

**视频基模组织更新（2026-10-16）**：依据已共写草稿保留七类路线，各类内按论文首次公开时间组织；前两章已重排，后续先补 ModelScope T2V，解决 VideoCrafter2 使用前作组件却缺少前置解释的问题。模型发布与论文公开日期分开记录；后五类展开前先核验排序。本轮不发布正文。

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
| `video-models-01-pioneering` | 视频生成系列（九）：视频生成任务与开创性工作 | 系列章节 | `categories/AI/视频生成`；sub_id `90` | `src/pages/video-models-01-pioneering.html` |
| `video-models-02-open-models` | 视频生成系列（十）：开放视频基模 | 系列章节 | `categories/AI/视频生成`；sub_id `100` | `src/pages/video-models-02-open-models.html` |
| `video-models-03-historical-methods` | 视频生成系列（十一）：其他早期视频生成研究 | 系列章节 | `categories/AI/视频生成`；sub_id `110` | `src/pages/video-models-03-historical-methods.html` |
| `video-models-04-efficient-training` | 视频生成系列（十二）：视频生成的训练高效方法 | 系列章节 | `categories/AI/视频生成`；sub_id `120` | `src/pages/video-models-04-efficient-training.html` |
| `video-models-05-storyboard-planning` | 视频生成系列（十三）：分镜与生成规划 | 系列章节 | `categories/AI/视频生成`；sub_id `130` | `src/pages/video-models-05-storyboard-planning.html` |
| `video-models-06-long-video` | 视频生成系列（十四）：长视频生成基模 | 系列章节 | `categories/AI/视频生成`；sub_id `140` | `src/pages/video-models-06-long-video.html` |
| `video-models-07-multimodal-guidance` | 视频生成系列（十五）：多模态引导的视频生成 | 系列章节 | `categories/AI/视频生成`；sub_id `150` | `src/pages/video-models-07-multimodal-guidance.html` |
| `video-generation-data-evaluation` | 视频生成系列（十六）：训练数据、评测基准与评价指标 | 系列章节 | `categories/AI/视频生成`；sub_id `160` | `src/pages/video-generation-data-evaluation.html` |
| `long-video-temporal-consistency` | 视频生成系列（十七）：时间一致性、长视频与流式生成 | 系列章节 | `categories/AI/视频生成`；sub_id `170` | `src/pages/long-video-temporal-consistency.html` |

编号依据：`~/.venv/bin/python3 scripts/check-sub-id.py --category AI --suggest` 已确认该系列使用独立二级 subcategory；正式实施前须在纳入 Flow Matching 章节后对 `10–170` 全部编号重新核验。

- **新增**：EDM 作为扩散模型基础中的独立章节，接在 x-prediction 之后，总结前述方法；解释共同去噪框架、probability-flow ODE、Heun 采样、随机 churn、网络预条件、训练噪声分布与消融结果。
- **更新**：获批后从 Score/SDE 文章中移除 EDM 信息框、相关正文和论文引用，不在该篇设置 EDM 预告；Score/SDE 与 EDM 通过系列导航关联。
- **历史系列调整（已由2026-10-21决策替代）**：正文共 12 篇，按本轮确认顺序排列；x-prediction 独立成篇，EDM 为第六篇。篇序授权不代表文章大纲获批。
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
- `openspec/changes/video-generation/`：统一 17 篇目录、Flow Matching 数学与配图设计、编号、审批和实施任务；保留原 change 的合并记录。
- `raw/flow-matching/`：后续归档原论文、源码/附录、方法推导分析及图表定位；已有 Lipman PDF 可从 `raw/score-sde-continuous-diffusion/sources/` 复用并记录来源。
- `src/pages/`：后续获批重整 `flow-matching.html`，加入视频生成系列并保留旧入口；更新 DDIM → Flow Matching → x-prediction → EDM → 条件图像扩散 → 图像基模的必要导航及后续编号；其他章节继续逐篇审阅。
- `media/images/edm-design-space/`：审批后存放论文原图裁切、仅包含伪代码的算法截图和自绘解释图。
- `media/images/flow-matching/`：后续存放原论文局部图、教学示意图；Flow Matching 的 Mermaid 和图注在对应 HTML 中实现。
- **不涉及**：修改 Org 原笔记、站点构建逻辑；本轮仅同步规划，不生成两篇正文或调整线上编号。
