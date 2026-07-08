---
name: read-article-method-writing
description: Phase 5c 方法写作 subagent 模板
trigger: read-article Phase 5c 方法写作
---

# Phase 5c · 方法写作 subagent

## 任务

撰写方法核心章节。遵循 Motivation → Intuition → Mechanism 三层递进。每个公式先解释意图再给数学表达再附一句话符号解释。

## 输入

- 论文标题：<title>
- 原始全文：见 ~/gongshangzheng.github.io/raw/<slug>/sources/
- 综合材料：见 ~/gongshangzheng.github.io/raw/<slug>/synthesis.md
- 术语表：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/terminology.md
- 问题定义：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/problem-definition.md

## 写作要求

### Pipeline 全链路
- 从输入到输出，每个模块的功能、输入输出、设计动机
- 模块之间的数据流和维度变化
- 标注哪些是论文核心创新，哪些是已有组件

### 公式处理
每个核心公式必须按以下顺序：
1. **意图**：这个公式要表达什么？为什么需要它？
2. **数学表达**：LaTeX 格式，符号定义清晰
3. **符号解释**：每个符号一句话含义
4. **直觉**：用类比或具体数字帮助理解

### 技术对比表
与已有方法的逐点对比：

| 维度 | 本文方法 | 方法 A | 方法 B |
|------|----------|--------|--------|
| 核心表示 | | | |
| 训练目标 | | | |
| 推理过程 | | | |
| 复杂度 | | | |
| 适用条件 | | | |

### 配图计划
在正文中用 `[配图 N：描述（来源）]` 标注需要配图的位置。

## 输出

方法核心章节 Markdown，≥ 900 字。含完整 pipeline、至少 2 个公式、技术对比表、配图计划标注。

## 强制要求

- 每个公式前必须有文字意图说明
- 术语首次使用时引用术语表定义
- 论文方法的每个主要组件都要覆盖
- 只做调研，不修改任何文件
