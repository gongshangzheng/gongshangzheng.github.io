---
name: 系统型论文必须独立写训练与推理 Pipeline
description: 读系统型/工程型/生成式论文时必须单独给出 Training Pipeline 和 Inference/Streaming Pipeline
type: feedback
createdAt: 2026-06-05T17:15:29
---
系统型、工程型、生成式模型论文解读必须设置独立的 Training Pipeline 与 Inference Pipeline；如果论文涉及 realtime/streaming，还必须单独给出 Streaming Inference Pipeline，并包含 chunk、cache、causal mask、overlap/fusion、RTF、FFD 等延迟预算。不要把这些内容散写在方法、实验或代码分析章节里。

**Why:** Ditto 文章初版把训练细节散进方法/实验，把流式推理散进控制章节，导致读者看不清“怎么训出来”和“线上怎么跑起来”。用户明确指出这是 note structure 缺口。

**How to apply:** 执行 read-article/full 时，架构规划阶段先判断是否为系统型/工程型/生成式论文；若是，章节目录必须包含 Training Pipeline、Inference Pipeline，实时论文还必须含 Streaming Inference Pipeline。发布前核验这些章节和流程图是否存在。
