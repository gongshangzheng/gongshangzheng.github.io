## Purpose

交付 EchoAvatar（2605.28272）的中文精读，按机制而非标签覆盖其统一音频域全身驱动、因果注意力 motion tokenizer、RL 对齐与语义注入，并补齐库内实时性对照数据。

## ADDED Requirements

### Requirement: 精读按机制覆盖五块核心

`src/pages/echoavatar-2026.html` MUST 覆盖：① Motion 表示（root velocity + height + 6D joint rotations）；② 因果注意力 motion tokenizer（含弃用非因果 tokenizer 与因果卷积的理由、双路径时间重采样、Forward Kinematics 辅助）；③ RVQ 残差量化与解剖分区 codebook；④ GRPO 与 DPO 两种 RL 对齐路线；⑤ tool-call 语义注入。每块 MUST 给出动机 → 机制 → 直觉解释三层，不得只给名词与标签。

#### Scenario: 读者理解 tokenizer 为何必须是因果注意力

- **WHEN** 读者读完第 3 节
- **THEN** 能说明非因果 tokenizer 因需要未来帧 look-ahead 而不可接受、因果卷积因表达力不足产生重建伪影，以及因果注意力如何在限制感受野于前 p 帧的同时保住表达力

#### Scenario: 语义注入与信号驱动的关系被讲清

- **WHEN** 读者读到 tool-call 一节
- **THEN** 能区分"音频驱动的反射式反应"与"LLM 注入的符号式意图"，并理解二者如何在同一音频流中交织

### Requirement: 流式 RL 对齐的理论解释必须落地

文章 MUST 包含解释"RL 为何能抑制 one-shot 流式自回归的 exposure bias"的理论小节，覆盖梯度均衡与上下文累积、干扰显著性的 min-max 分析、logit gap 与采样动力学、随机上下文扰动四者中至少三项，并 MUST 给出 ≥2 个公式（MathJax）。

#### Scenario: 读者能解释 RL 的作用机理

- **WHEN** 读者读完讨论节的理论部分
- **THEN** 能说明流式场景下误差为何累积、RL 目标如何通过奖励信号的梯度分布修正它，而不是记住"用了 GRPO/DPO 所以更好"

### Requirement: 关键数据点带口径

文章 MUST 给出：端到端延迟 177.4 ms（±1.6，NVIDIA H200）与 215.8 ms（±4.9，RTX 4090）及 20 步平均统计方式；音频按 266 ms chunk（8 帧）处理；tokenizer 消融的重建 FID 4.18（因果注意力）/ 9.21（因果卷积）/ 12.21（去双路径）/ 8.78（去 FK 辅助 loss）。与库内 `realtime-digital-human-survey.html` 对照时 MUST 标注两处数据的硬件与统计口径差异。

#### Scenario: 延迟数据可被交叉验证

- **WHEN** 读者对照系列十二的实时性表
- **THEN** 看到 EchoAvatar 的延迟数值同时标注了平台（H200 / 4090）与统计方式（20 步平均），并明确说明与表内其它方法的口径差异

### Requirement: 库内交叉引用与编号一致

文章 MUST 在系列三 `digital-human-motion-space-avatar.html` 的 EchoAvatar 条目补上指向本精读的链接，并在系列十二补充实时性数据；`sub_id` MUST 为 700 且与标题中文编号"六十八"一致；发布时 MUST 同步 `digital-human-hub.html` 与 `drafts/echoavatar-2026.md` 状态。

#### Scenario: 编号与索引一致

- **WHEN** 运行 `scripts/check-sub-id.py --category 数字人`
- **THEN** 700 未被占用、本文归入 `categories/AI/数字人/数字人论文精读`，且标题编号与 sub_id 对应关系与同系列前两篇（680→六十六、690→六十七）一致

#### Scenario: Hub 与交叉链接完整

- **WHEN** 新文章发布并运行 `node build.js`
- **THEN** Hub 页能检索到本篇、`chapter-nav` 前后链接连贯、系列三对应条目可跳转到本精读
