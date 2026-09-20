<!-- 依 templates/content-change/design.md 填写；「文章内容大纲」为审批核心 -->

## Context

- **素材**：`raw/echoavatar-2026/sources/echoavatar-2026.md`（1004 行，含 Introduction L121 / Method L173 / Experiment L297 / Appendix L518 起）；原图 9 张在 `raw/echoavatar-2026/figures/echoavatar-2026/`；`subagents/` 未生成（Phase 2 尚未跑）
- **草稿**：`drafts/echoavatar-2026.md` 已有核心机制与实测数据（40%）
- **库内接点**：系列三（动作空间实时化浪潮，已有 EchoAvatar 三条机制标签）、系列十二（实时性 benchmark 表）、`digital-human-tool-agent`（tool-call 理念）、GDPO-Listener 草稿（组解耦奖励，RL 同方向）
- **约束**：系列编号需与 sub_id 对齐（690→六十七，故 700→六十八）；本文非开源，无代码分析节

## Goals / Non-Goals

**Goals:**
- 把 EchoAvatar 的方法细节写成可复现理解的精读（tokenizer / RVQ / RL / tool-call / 延迟预算五块都要有机制层解释）
- 补上"RL 为什么能修流式 exposure bias"的理论解释——这是库内其它实时 avatar 文章都没有的部分
- 与系列三、系列十二、tool-call 文章形成明确的"谁讲什么"分工，不重复

**Non-Goals:**
- 不写代码分析（无公开仓库）
- 不重写系列三里已有的实时化时间线（只加一跳链接）
- 不做与其它 avatar 模型的全面横向评测表（只对照已有库内数据口径）

## 文章内容大纲

### `echoavatar-2026`｜数字人论文精读（六十八）：EchoAvatar，语音+音乐统一全身驱动的实时流式 Avatar

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 论文精读；alias `categories/AI/数字人/数字人论文精读`；sub_id 700；Hub `digital-human-hub` |
| 服务对象 | 读者能理解"怎样把只做同步的反射式音频驱动，升级成携带语义意图、且能在流式下不漂移的全身实时 avatar"，以及 RL 对齐在其中的位置 |

**章节骨架**（按 read-article 7-Part 落地）

| 节 | 这一节写什么 | 素材来源 | 必备元素 |
|----|------------|---------|---------|
| 1 引言 | 任意音频流（语音+音乐、无领域标签、无模式切换）统一驱动全身运动的意义；与"只做语音"路线的差别 | `drafts/echoavatar-2026.md` 问题节；`sources/echoavatar-2026.md` §Introduction (L121) | teaser 图 `teaser3.png` |
| 2 问题剖析 | 三道瓶颈：① 离线保质量 vs 流式单域的两难；② one-shot 流式无事后修正 → MLE 的 exposure bias 导致长序列漂移；③ 纯音频驱动是"反射式"的，不携带意图 | 同上 §Introduction 收尾；草稿问题节 | 三段瓶颈的对照表述（无表） |
| 3 模型结构与创新 | 3.1 Motion 表示（root velocity + height + 6D joint rotations）；3.2 因果注意力 tokenizer：为何弃非因果（需 look-ahead、延迟不可接受）与因果卷积（表达力不足、重建伪影）、双路径时间重采样、FK 进优化回路；3.3 RVQ + 解剖分区 codebook（上/下半身/手解耦）；3.4 音频→运动生成；3.5 RL 对齐 GRPO vs DPO；3.6 tool-call 语义注入（"神经符号桥"） | §Method L173–296（Tokenizer L183 / Audio Driven L232 / RL L251）；Appendix §Motion Tokenizer Training Details L632–687 | 架构/管线图 `demo_pipeline_2.png` 或 `fig2_3.png`；tokenizer 关键公式 ≥2；超参数 ≥3 |
| 4 训练 Pipeline | tokenizer 训练（重建目标 + FK 辅助 + 辅助 loss 组）；运动质量奖励模型（corruption-based ordering / quality score / 架构）；音-动对齐奖励（对比学习目标、奖励计算） | §Motion Tokenizer Training Details L632（FK L635 / Auxiliary Loss L654 / Objective L679）；§Motion Quality Reward Model L688（L691 / L717 / L761）；§Audio-Motion Alignment Reward L775（L780 / L798 / L822） | 训练配置披露表（逐项标注）；损失/奖励公式 ≥2 |
| 5 推理与部署 | 三层分布式拓扑（ElevenLabs Conversational Agent / Client Frontend / GPU Inference Server）；滑窗流式 266ms（8 帧）；CUDA Graph 抑制 kernel 调度抖动；四阶段延迟预算；IK 后处理解穿插 | §Real-time Deployment L410；Appendix L518–569（拓扑 L562 / 流式优化 L564 / 延迟剖析 L566）；§Online Post-Processing L570 | 延迟分解表（H200 与 RTX 4090 双栏）；系统拓扑图 |
| 6 实验配置与验证 | 数据与预处理、设置、主观评测协议、定量基准（FID / MPJPE 对比实时基线）、tokenizer 消融四组 | §Datasets and Preprocessing L298；§Settings L406；§Subjective Evaluation L413；§Quantitative Benchmarking L416；§Ablation L421 | 主结果表（含具体数值）；消融表；消融发现 ≥1 |
| 7 讨论与启发 | RL 为何有效：梯度均衡与上下文累积、干扰显著性的 min-max、logit gap 与采样动力学、随机上下文扰动解法；局限与未来工作；与库内串联（系列三时间线一跳、系列十二 benchmark、tool-call 文章、GDPO-Listener 草稿） | §Theoretical Analysis L574–631；§Discussions L476/483；库内四篇对应小节 | 理论小节公式 2–3 个；4 条交叉链接 |

**关键数据点**（必须出现在正文，且核对口径）

- 端到端延迟 **177.4 ms（±1.6）**（NVIDIA H200）与 **215.8 ms（±4.9）**（RTX 4090），20 步平均；音频按 **266 ms chunk（8 帧）** 处理 → 延迟低于 chunk 时长，满足实时（附录延迟剖析表）
- tokenizer 消融重建 FID：**因果注意力 4.18** vs 因果卷积 **9.21**；去掉双路径重采样恶化到 **12.21**；去掉 FK 辅助 loss 恶化到 **8.78**
- 延迟四阶段分解：Audio Encoding / Motion Synthesis / Motion Decoding / IK Post-processing（两平台分列）
- GRPO vs DPO 在在线自回归运动生成上的对比结论（数值从 §RL L251–296 与 §Ablation L421 取全）
- 定量基准 FID / MPJPE 超 SOTA 实时基线的具体数值（从 §Quantitative Benchmarking L416 取，与系列十二对照时标注硬件口径差异）

**配图计划**：4 张；`teaser3.png`（teaser）、`demo_pipeline_2.png`（系统/方法管线）、`fig2_3.png` 与 `fig3_1.png`（tokenizer 与架构）、`reward_model_evaluation.png`（RL/奖励模型评测）；来源为 arXiv source tarball 原图（符合 `blog-rules/references/image-priority.md` 优先级），目标目录 `media/images/echoavatar-2026/`

## Decisions

- **不设代码分析节**：论文只有项目页，无公开仓库；若后续开源再单独补
- **把 Appendix 的理论分析（L574–631）提到 Part 7 讲**，而非留在附录：它是"RL 为何修得住流式漂移"的唯一解释，库内其它实时 avatar 文章都没有这一段，是本文的差异化价值
- **与系列三分工**：系列三只保留"动作空间实时化浪潮"时间线里的一跳（机制标签 + 链接），方法细节全部收在本精读，避免两处重复叙述

## Risks / Trade-offs

| 风险 | 说明 | 处置 |
|------|------|------|
| `subagents/` 缺失 | Phase 2 四份分析未生成，写作时素材指针直接打到 `sources/` 章节 | 第 2 组前补跑 Phase 2（或按 `sources/` 直读，大纲已给到行号） |
| 标题编号 | 六十八 由 690→六十七 推断 | 第 1 组用 `check-sub-id.py --suggest` 复核编号与 sub_id 对应 |
| 硬件口径差异 | H200 / 4090 与系列十二的对比表可能不同口径 | 交叉对照处显式标注平台与统计方式（20 步平均） |
| 理论小节难度 | §L574–631 公式密度高 | 只取 2–3 个关键公式，配直觉解释，不整段搬运 |
