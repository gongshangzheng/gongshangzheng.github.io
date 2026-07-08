---
name: read-article-problem-definition
description: Phase 5b 问题定义 + 动机 subagent 模板
trigger: read-article Phase 5b 问题定义
---

# Phase 5b · 问题定义 + 动机 subagent

## 任务

精确定义论文要解决的问题，建立 motivation → insight → solution 的逻辑链条。不是泛泛说"X 有局限性"，而是具体到"X 在什么条件下、因为什么机制、会失败到什么程度"。

## 输入

- 论文标题：<title>
- 原始全文：见 ~/gongshangzheng.github.io/raw/<slug>/sources/
- 综合材料：见 ~/gongshangzheng.github.io/raw/<slug>/synthesis.md
- 术语表：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/terminology.md

## 分析维度

### 1. 问题的精确数学定义

- 输入空间是什么？（图像？信号？bit 流？）
- 输出空间是什么？
- 约束条件是什么？（功率、带宽、延迟、计算量）
- 优化目标是什么？（最小化什么？最大化什么？）
- 与标准问题形式的差异在哪？

### 2. 之前方案为什么不行

对每种之前的方案（至少 3 种），回答：
- 它的具体机制是什么？
- 它在什么条件下会失败？（附数据：PSNR 掉多少？FID 高多少？）
- 失败的根本原因是什么？（不是"效果不好"，而是"因为 XX 机制导致 YY"）
- 例如："MSE 优化会导致模糊，因为 MSE 的最优解是条件均值，在多模态分布下等于各模态的平均"

### 3. 核心 Insight

- 论文看到的突破口是什么？
- 为什么这个 insight 是非显而易见的？
- 如果没有这个 insight，最直觉的方案是什么？为什么那个方案不够好？
- 用一个类比让非专家理解这个 insight

### 4. 从 Insight 到 Solution 的逻辑链

- insight 如何自然地导向方法设计？
- 方法的每个主要组件对应 insight 的哪个方面？
- 有没有被 insight 排除掉的设计选择？

## 输出格式（Markdown）

```markdown
# 问题定义与动机

## 精确问题定义

[数学形式化描述]

## 之前方案的局限

### 方案 A：[名称]
- 机制：...
- 失败条件：...（附数据）
- 根本原因：...

### 方案 B：[名称]
...

## 核心 Insight

[用一段话 + 一个类比解释]

## 从 Insight 到 Solution

[逻辑链，每个组件对应哪个 insight]
```

## 强制要求

- "为什么不行"必须有具体数据或事实支撑，不能只说"效果不好"
- Insight 必须用类比解释，不能只有抽象表述
- 逻辑链必须清晰：insight → method component 的映射
- 只做调研，不修改任何文件
