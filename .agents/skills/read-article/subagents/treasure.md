---
name: read-article-treasure
description: Phase 2c 宝藏挖掘 subagent 模板。配合 read-article/SKILL.md 使用。
trigger: read-article Phase 2c 宝藏挖掘
---

# Phase 2c · 宝藏挖掘 subagent

## 任务

从论文全文中挖掘常被快速阅读时忽略的宝藏级细节。

## 阅读策略

> 详细章节利用方式见 `references/paper-section-guide.md` §2.5（Experiments）和 §2.8（Appendix）。

本 subagent 的核心信息源是论文的 **Experiments** 和 **Appendix/Supplementary** 章节，辅以 Method 中的内联超参数。

**Experiments 精读**：
1. 数据集详情：名称、规模、类别数、划分、预处理
2. 实验配置表：硬件、训练时间、所有超参数完整列表
3. 主实验结果表：逐行提取方法名、指标、数值
4. 消融实验：每个组件的贡献量、超参数敏感性
5. 失败案例：作者展示的 failure cases

**Appendix/Supplementary 精读**：
- 正文放不下的超参数细节、扩展消融、额外定性结果

**Method 扫读**：
- 内联超参数（"我们使用 8 层 Transformer，隐藏维度 512"）
- 初始化策略、数值稳定性处理

## 输入

- 论文标题：<title>
- 全文内容：见 ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md
- 结构化数据：见 ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.json

## 挖掘维度

### 1. 实现技巧和 trick
- 代码级实现细节（初始化方式、正则化策略、梯度裁剪、数值稳定性处理）
- 作者提到的"简单但有效"的技巧
- 训练和推理时的差异（如 dropout、batch norm 处理）

### 2. 超参数设置（完整列表）

> 必须按以下 10 项标准字段逐项提取，论文未提及的字段标注"原文未明确给出"。

- **训练数据**：数据集名称、规模、训练/验证/测试划分
- **训练硬件**：GPU 型号 + 数量（如 "8× A100 80GB"）
- **优化器**：类型及关键参数（β1, β2, ε, weight decay）
- **学习率**：初始值 + schedule 类型及参数 + warmup 步数
- **Batch size**：全局或 per-GPU
- **训练步数 / 轮数**：iterations 或 epochs
- **训练时长**：小时 / 天
- **模型参数量**：总参数 / 可训练参数（层数、隐藏维度、注意力头数、FFN 维度）
- **精度格式**：FP32 / FP16 / BF16 / FP8 / 混合
- **Checkpoint 策略**：选择标准
- 数据增强策略（每种具体参数）
- 正则化（dropout rate、label smoothing、stochastic depth）
- 所有超参数的消融结果（如有）

### 3. 计算成本
- 训练所需 GPU 数量和型号
- 训练时间（小时/天）
- FLOPs（训练和推理）、参数量、推理速度（latency/throughput）
- 与 baseline 的计算成本对比（如有）

### 4. 失败案例与局限性
- 作者明确承认的失败案例（具体描述）
- 方法在哪些场景/数据集上表现不佳？具体数值？
- 消融实验中"去掉哪个组件掉点最多"的发现？掉多少？
- 作者提到的 negative results 或"我们尝试了但没用"的方法

### 5. 数学公式精提取
- 核心公式必须从原文逐字提取，包括所有符号定义
- 不能只说"使用了 attention 机制"，必须给出完整数学表达
- 损失函数 / 目标函数的完整形式
- 每个公式附上"这个公式在做什么"的一句话解释
- 符号表：列出所有非标准符号及其含义

### 6. 从 JSON 提取所有表格
- 将 JSON 中的 tables 转为 org-mode 表格
- 标注每个表格在原文中的位置和用途

## 输出格式（org-mode）

每个维度至少 5 行。所有数值必须来自原文，不得编造。信息不足处标注"原文未明确给出"。只做调研，不修改任何文件。