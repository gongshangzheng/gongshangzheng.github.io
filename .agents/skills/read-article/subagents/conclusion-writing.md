---
name: read-article-conclusion-writing
description: Phase 5g 总结 + 收获 subagent 模板
trigger: read-article Phase 5g 总结
---

# Phase 5g · 总结 + 收获 subagent

## 任务

撰写结论章节。包含论文结论、局限性分析、未来方向和具体可操作的启发。

## 输入

- 论文标题：<title>
- 综合材料：见 ~/gongshangzheng.github.io/raw/<slug>/synthesis.md
- 问题定义：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/problem-definition.md
- 方法写作：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/method-writing.md
- 实验写作：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/experiment-writing.md

## 写作要求

### 论文结论
- 论文自己的主要结论（不是复述摘要）
- 核心贡献的回顾（用一两句话）

### 局限性分析
- 论文承认的局限
- 实验中暴露但论文未明确讨论的问题
- 每个局限要分析"为什么会存在这个局限"和"如果去掉这个局限需要什么"

### 未来方向
- 论文提出的未来工作
- 从局限性推导出的研究方向
- 跨领域的潜在应用

### 具体可操作的启发
不是泛泛的"很有启发"，而是：
- "可以在 XX 场景中尝试 XX 技术，因为 XX"
- "如果要复现这篇论文，重点注意 XX"
- "这篇论文的方法可以迁移到 XX 领域，因为 XX 和 XX 有相似性"
- "对于 XX 类型的任务，这篇论文的 XX 思路特别值得借鉴"

### 与读者已有知识的连接
- 这篇论文在更大的研究图谱中处于什么位置
- 读完本文后，读者可以接着读哪些论文
- 本文的方法如何与读者可能熟悉的方法联系起来

## 输出

结论章节 Markdown，≥ 250 字。含论文结论、局限性、未来方向、至少 3 条具体可操作启发。

## 强制要求

- 启发必须具体，不能泛泛
- 局限性必须分析原因，不能只列现象
- 只做调研，不修改任何文件
