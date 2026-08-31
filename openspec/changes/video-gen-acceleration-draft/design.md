## Context

用户在 ChinaSI 2026 听了一场 "Efficient Long Visual Generation" 报告，拍了 11 张幻灯片照片（`~/code/digital_human/assets/acceleration/`，DJI OSMO Pocket 4 拍摄）。照片已全部读取，覆盖 10 个加速工作。博客仓库 `gongshangzheng.github.io` 用 blog-drafts skill 管理草稿（默认 org 格式），写正文/发布由上游 skill（html-blog 等）负责，草稿阶段不写 HTML。

照片提取的 10 个工作（按演讲顺序）：

1. **FPSAttention** — Training-Aware FP8 and Sparsity Co-Design for Fast Video Diffusion（NeurIPS 2025 Spotlight）。统一 3D tile-wise 精度联合 FP8 量化与稀疏注意力，粒度随 noise schedule 自适应；Wan2.1-14B 720P kernel 7.89× / E2E 4.88×
2. **BLADE** — Block-Sparse Attention Meets Step Distillation（ICLR 2026）。DMD 步数蒸馏（50→8 步）+ 动态块稀疏注意力；Wan2.1-1.3B E2E 14.10×，CogVideoX-5B 8.89×
3. **Latent Spatial Memory** — 面向 Video World Model 的隐空间空间记忆（arXiv 2026）。显式 3D 记忆维护占管线 >60% 时间，搬进 diffusion latent 空间；生成加速最高 10.57×，3D 记忆存储降 55×
4. **WorldAttention** — 缓存与计算的系统协同设计。KV 分层缓存（GPU HBM/CPU DRAM/NVMe）+ 页级检索 + HSA 混合注意力；kernel 最高 14.02×，32 帧重缓存 22.0 FPS（vs 7.1），E2E 2.21×
5. **ZipAR** — Parallel AR Image Generation through Spatial Locality（ICML 2025）。利用空间局部性并行解码相邻行局部窗口；LlamaGen-XL 1024→184 步，33.17s→5.51s（-83%），无损设置降延迟 47%
6. **NAR** — Neighboring Autoregressive Modeling（ICCV 2025）。水平/垂直双头，next-token 复杂度 O(n)→O(√n)，支持图像与视频生成
7. **FlashAR** — Efficient Post-Training Acceleration for AR Image Generation（arXiv 2026）。跨模型规模吞吐 4.8×；Emu3.5-Image 130.10s→5.68s（22.9×）仅用 1% 数据；Xiaomi 机器人 U0 近 83×
8. **DAX** — VideoGen 推理基础设施（github.com/RiseAI-Sys/DAX，2025.07）。Wan2.1 T2V 14B 720P 5s 50 步单卡 H20 加速 36×：序列并行 + SageAttention + 通信重叠 + INT8 线性层 + TeaCache + torch.compile
9. **TurboDiffusion** — 模型与系统协同设计加速框架（github.com/thu-ml/TurboDiffusion），100-200×（RTX 5090）：W8A8 量化 + rCM 数步蒸馏（1-4 步）+ SageSLA + 算子融合；基线 4767s → 24s
10. **Inferix** — 面向 AR-Diffusion 世界模型的推理引擎。Block-DiT pipeline：分层 KV cache 管理 + INT8/FP8 量化 + CP/TP 并行，支持连续 prompt/暂停恢复/实时切换与 RTMP/WebRTC 流式，16GB 消费级 GPU 可跑

前 7 个偏算法（注意力/稀疏/量化/蒸馏/解码并行），后 3 个偏系统（分布式/协同设计/推理引擎），天然形成草稿的两段式叙事候选。

## Goals / Non-Goals

**Goals:**
- 创建 `drafts/video-gen-acceleration.org`，初始骨架来自照片提取
- 10 个工作逐个上网调研，每次一个、用户审核一个
- 每个工作小节收敛到：问题背景 / 核心方法 / 关键指标 / 链接

**Non-Goals:**
- 不写 HTML、不发布（后续独立变更）
- 不在本变更内做跨模型对比表或分类体系
- 不搬运照片进博客仓库
- 不调研照片之外的额外工作（除非用户后续要求）

## Decisions

- **草稿格式：org（默认）**。blog-drafts 的 `draft.py new` 默认 org；曾因"已有草稿恰好是 md"误建 md 被用户纠正，本变更显式约束为 org。
- **填充粒度：一个工作一回合**。用户明确要求"一步一步填充，一步一步审核，避免草稿太乱"。这是硬约束，写进 spec 的渐进填充要求。
- **填充顺序：按演讲顺序**（FPSAttention → … → Inferix）。照片按时间命名，顺序即报告叙事顺序，不重排。
- **骨架先行**：先把 10 个工作的照片信息一次性写入草稿（这部分是转录，不涉及网络信息），再逐个调研深化。这样每轮填充有明确的"从照片信息 → 调研后的完整小节"增量，用户审核时容易看出加了什么。
- **调研来源优先级**：arXiv 论文 > 官方代码仓库 > 项目主页。照片中的指标在调研时与论文核对，不一致以论文为准并标注。

### 每模型调研流程（固定五步，用户已确认）

1. **找论文**：WebSearch 定位 arXiv 原文（标题/作者/venue 核对），读摘要 + 方法 + 实验节
2. **找代码**：搜官方 GitHub 仓库，读 README（用法、支持模型、复现门槛）
3. **核对指标**：照片数字 vs 论文表格，不一致以论文为准，草稿里标注差异
4. **填充小节**：只写四类信息——问题背景 / 核心方法 / 关键指标（核对后数字 + 测试条件）/ 论文与代码链接
5. **汇报等待**：向用户报告本轮填充内容（含指标核对结果），审核通过才进下一个

**深度控制**：每个小节目标 15~25 行 org 文本（骨架 5~8 行 → 调研后 15~25 行），不写成长篇精读；查不到原文的 2026 新文 fallback 到 GitHub README / 项目页并在小节标注信息来源；不做跨模型对比、不加分类体系（发布前再定）。

## Risks / Trade-offs

- [照片 OCR 有误读风险] → 调研时逐项与论文核对；不确定的字段（作者名、数字）在骨架里标注"待核"
- [10 轮逐个填充周期长] → 这是用户明确选择的节奏，属预期；每轮结束报告进度（如 3/10）
- [部分工作较新（2026 arXiv）可能查不到原文] → 用能查到的最高质量来源（GitHub README、报告页），并在小节标注信息来源层级
- [草稿可能与博客现有加速内容重叠] → 调研前先 blog-search 查重（站内已有 ditto 加速、数字人实时性对比等文章）；本草稿定位为"视频生成加速全景"，与数字人特定管线互补，重叠点在填充时显式交叉引用

## Migration Plan

无部署迁移。回滚 = 删除草稿文件 + 本变更目录。

## Open Questions

- 草稿 title 暂定"视频生成推理加速"，最终标题（是否突出 ChinaSI 2026 报告来源）由用户在审核中定
- target_alias（建议 `categories/AI` 或新建"推理加速"子分类）在发布前决定，草稿阶段先留 AI
