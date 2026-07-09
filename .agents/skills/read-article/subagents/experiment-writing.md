---
name: read-article-experiment-writing
description: Phase 5d 实验写作 subagent 模板
trigger: read-article Phase 5d 实验写作
---

# Phase 5d · 实验写作 subagent

## 任务

撰写实验分析章节。包含实验设置、主实验结果、消融实验、失败案例和局限性。

## 输入

- 论文标题：<title>
- 原始全文：见 ~/gongshangzheng.github.io/raw/<slug>/sources/
- 综合材料：见 ~/gongshangzheng.github.io/raw/<slug>/synthesis.md
- 术语表：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/terminology.md

## 写作要求

### 实验配置
- 实验配置表：按 6 项必含基础字段（评测数据集 / 评测指标 / Baseline 方法 / **推理硬件** / 推理分辨率 / 推理环境）逐项标注"已披露"或"未披露"，论文未提及的字段也必须列出
- **推理硬件是核心披露项**：必须明确写出 GPU 型号 + 数量（如 "单张 RTX 3090"、"8× A100 80GB"）。论文未提及则标"未披露"，不得省略该行
- 计算成本：推理时间、显存占用等（论文提及则记录）
- 缺少的信息标注"原文未明确给出"

### 主实验结果
- 对比表含具体数值（PSNR/SSIM/LPIPS/FID/mIoU 等）
- 每个关键数字用一句话解释含义
- 指出反直觉或特别显著的结果

### 消融实验
- 每个组件的贡献（加了提升多少，去掉掉多少）
- 条件组合分析（如不同条件组合的效果）
- 超参数敏感性（如不同采样步数、不同 λ 的影响）

### 失败案例与局限
- 论文承认的不足
- 消融实验暴露的问题
- Domain gap、计算成本、泛化性等

### 配图计划
用 `[配图 N：描述（来源）]` 标注需要配图的位置。

## 输出

实验分析章节 Markdown，≥ 450 字。含实验设置、主结果对比表、消融发现、局限性。

## 强制要求

- 所有数值必须从原文提取，不得臆造
- 消融实验必须说明每个组件的贡献幅度
- 只做调研，不修改任何文件
