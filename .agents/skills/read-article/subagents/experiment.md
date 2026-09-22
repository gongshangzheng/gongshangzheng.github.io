---
name: read-article-experiment
description: Phase 2 可选 analysis lane：实验、超参与工程细节挖掘。整合旧 treasure lane 与实验写作检查项。
trigger: read-article Phase 2 实验 lane（按需）
---

# Phase 2 lane · 实验与工程细节挖掘

> **lane 定位（read-article Phase 2 按需分析）**
> - **默认不启动**：实验表格多、数字密集、或需要核对结果与超参数时启用。
> - 输入：`raw/<slug>/sources/<slug>.md` + `raw/<slug>/sources/<slug>.json`
> - 输出：`raw/<slug>/analysis/experiment.md`（旧路径 `raw/<slug>/subagents/treasure.md` 的事实可按本节归入）
> - 输出格式：**事实 + 来源指针 + 不确定性**；每个数值必须能回源（章节标题 / Table·Fig 编号 / `file:line`）
> - 禁止：创建或修改 OpenSpec change、修改 `src/pages/`、写最终 HTML、编造数值
> - 与 `treasure.md` 的关系：`treasure.md` 是旧编号下的同类 lane（Phase 2c 宝藏挖掘），本文件是它的重组版本，覆盖实验、超参、计算成本、失败案例与表格提取

## 任务

从论文全文中挖掘常被快速阅读时忽略的宝藏级细节，并把实验侧事实整理成可直接支撑写作的结构化笔记。

## 阅读策略

> 详细章节利用方式见 `references/paper-section-guide.md` §2.5（Experiments）和 §2.8（Appendix）。

核心信息源是论文的 **Experiments** 和 **Appendix/Supplementary** 章节，辅以 Method 中的内联超参数。

**Experiments 精读**：
1. 数据集详情：名称、规模、类别数、划分、预处理
2. 实验配置：硬件、训练时间、所有超参数完整列表
3. 主实验结果表：逐行提取方法名、指标、数值
4. 消融实验：每个组件的贡献量、超参数敏感性
5. 失败案例：作者展示的 failure cases

**Appendix/Supplementary 精读**：正文放不下的超参数细节、扩展消融、额外定性结果

**Method 扫读**：内联超参数、初始化策略、数值稳定性处理

## 挖掘维度

### 1. 训练配置披露表（10 项基础字段）

> 按以下 10 项逐项提取，论文未提及的字段必须显式标注"未披露"，不得留空或臆测。

| 配置项 | 说明 |
|--------|------|
| 训练数据 | 数据集名称 + 规模（含划分） |
| 训练硬件 | GPU 型号 + 数量（如 "8× A100 80GB"） |
| 优化器 | 类型 + 关键参数（β1, β2, ε, weight decay） |
| 学习率 | 初始值 + schedule + warmup 步数 |
| Batch size | 全局或 per-GPU |
| 训练步数 / 轮数 | iterations 或 epochs |
| 训练时长 | 小时 / 天 |
| 模型参数量 | 总参数 / 可训练参数（层数、隐藏维度、头数、FFN 维度） |
| 精度格式 | FP32 / FP16 / BF16 / FP8 / 混合 |
| Checkpoint 策略 | 选择标准 |

方法特定项（按论文特点选填）：初始化来源、特殊损失权重、数据增强策略（每种具体参数）、正则化（dropout rate、label smoothing、stochastic depth）、蒸馏配置、冻结/可训练模块范围。

### 2. 实验配置披露表（6 项基础字段）

| 配置项 | 说明 |
|--------|------|
| 评测数据集 | 名称 + 规模 |
| 评测指标 | 指标名称 + 方向（↑/↓） |
| Baseline 方法 | 列出全部对比方法 |
| **推理硬件** | **GPU 型号 + 数量**（本表最关键的披露项） |
| 推理分辨率 | 如 256×256 / 512×512 |
| 推理环境 | 框架/版本，未提则标"未披露" |

### 3. 实现技巧和 trick

- 代码级实现细节（初始化方式、正则化策略、梯度裁剪、数值稳定性处理）
- 作者提到的"简单但有效"的技巧
- 训练和推理时的差异（如 dropout、batch norm 处理）

### 4. 计算成本

- 训练 GPU 数量与型号、训练时间（小时/天）
- FLOPs（训练和推理）、参数量、推理速度（latency/throughput）
- 与 baseline 的计算成本对比（如有）

### 5. 失败案例与局限性

- 作者明确承认的失败案例（具体描述）
- 方法在哪些场景/数据集上表现不佳？具体数值？
- 消融中"去掉哪个组件掉点最多"？掉多少？
- 作者提到的 negative results 或"我们尝试了但没用"的方法

### 6. 数学公式精提取

- 核心公式从原文逐字提取，包括所有符号定义
- 损失函数 / 目标函数的完整形式
- 每个公式附一句"这个公式在做什么"的解释
- 符号表：列出所有非标准符号及其含义

### 7. 从 JSON 提取所有表格

- 将 `sources/<slug>.json` 中的 tables 转为 Markdown 表格
- 标注每个表格在原文中的位置和用途

## 输出格式

Markdown。每个维度至少 5 行。所有数值必须来自原文，不得编造；信息不足处标注"未披露"或"原文未明确给出"。只做调研，不修改最终文章。
