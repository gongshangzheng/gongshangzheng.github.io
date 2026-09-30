---
name: read-article-article-structure
description: Phase 4 change 规划与文章架构按需参考。配合 read-article/SKILL.md 使用。
---

# Phase 4 · 创建 change 并规划文章架构

> **定位**：read-article 新流程 Phase 4 的按需参考。本文件提供文章架构的选型方法（A/B/C/D）、
> 字数分配模板和配图规划模板。写作规划直接写入 change 的 `design.md`「文章内容大纲」；共享门禁与模板规则见
> `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`。
>
> Phase 4 由主 agent 执行；只有需要独立核对某套架构素材是否齐备时，才考虑派一个 lane 做交叉检查。

## 目的

Phase 2 的 analysis lane 按维度拆开素材（背景 / 方法 / 实验 / 术语 / 引用 / 代码 / 配图），Phase 3 建了导航索引。但索引 ≠ 知道文章怎么组织。同一批素材，用不同结构写出来读感完全不同。

Phase 4 的任务是：素材与分析完成后创建 OpenSpec change，在 `design.md` 中规划文章骨架并请用户确认：

- 核心方法有足够的展开篇幅
- 公式和直觉交替出现，不是堆砌
- 每章有明确的叙事功能（铺垫/推进/转折/收束）
- 配图有计划地分布在各章节
- 字数分配合理，总量达标
- 论文缺料处有明确的替代口径

## 核心原则

**论文深度解读以教学式叙事为目标，不是逐章节翻译论文。**

读者要的是"读完之后我能给别人讲清楚这篇论文在干什么"，不是"论文的中文翻译版"。

## 工作流程

### 第一步：通读素材，列出关键点

读 `raw/<slug>/synthesis.md`（导航索引）+ 已启用的 analysis lane + 原文，列出：

- **核心贡献**：论文最想让人记住的 1-2 个点
- **关键公式**：必须出现在文章中的核心数学表达（3-5 个）
- **实验亮点**：最有说服力的定量结果（带具体数值）
- **失败/局限**：作者承认的不足，消融实验的关键发现
- **配图资源**：已收集到哪些高质量图片（论文原图、架构图、结果图）
- **Insight**：为什么这个方法 work？突破点在哪？
- **缺料**：哪些内容论文未披露，需要标注或用替代方案

### 第二步：设计文章结构

标准 7-Part 骨架见 `references/article-structure-template.md`。根据论文特征选择叙事组织方式：

**A. 方法驱动型**（Method-Driven）
适用：论文提出完整的新方法/架构
```
引言 → 问题分析 → 核心思想(Insight) → 方法详解(pipeline 全链路) → 训练细节 → 实验分析 → 局限与启发
```
适合：大多数提出新方法的论文

**B. 对比驱动型**（Comparison-Driven）
适用：核心贡献是改进已有方法，或在不同方法间建立桥梁
```
引言 → 前置方法详解(A vs B) → 本文方法(如何统一/改进) → 对比表格 → 实验分析 → 启发
```
适合：改进型、桥接型、统一型论文

**C. 问题驱动型**（Problem-Driven）
适用：解决一个经典问题或开创一个新问题
```
问题是什么 → 问题为什么难 → 已有解法的局限 → 本文解法 → 实验验证 → 讨论与展望
```
适合：理论型、分析型、benchmark 论文

**D. 技术解析型**（Technical Deep-Dive）
适用：大量工程/实现细节，适合源码级解读
```
整体架构 → 逐模块深入 → 训练技巧 → 复现要点
```
适合：框架型、系统型论文（需要代码仓库）

### 第三步：在 change 的 design.md 中规划

按 `blog-rules/templates/content-change/design.md` 填写「文章内容大纲」，逐节写明内容、素材定位、必备元素、字数及缺料替代；把待裁决项放入 Risks。用户确认 change 后才进入写作。

## 字数分配模板

| 部分 | 对应 Part | 最低字数 |
|------|----------|---------|
| 引言 + 问题剖析 | Part 1 + 2 | ≥ 500 字 |
| 模型结构与创新 | Part 3 | ≥ 1000 字 |
| Training Pipeline | Part 4 | ≥ 500 字 |
| Inference Pipeline | Part 5 | ≥ 500 字（实时 ≥ 700 字） |
| 实验配置与验证 | Part 6 | ≥ 600 字 |
| 讨论与启发 | Part 7 | ≥ 300 字 |
| **总量** | — | **常规论文 ≥ 3000 字；复杂系统/综述 ≥ 4000 字** |

## 配图规划模板

| 位置 | 图片类型 | 来源 | 格式 |
|------|---------|------|------|
| Part 3 方法核心 | 架构图 | 论文 Fig.2 | `.photo` |
| Part 3 方法核心 | pipeline 流程图 | 代码绘制 | `{{< mermaid >}}` |
| Part 4/5 | 训练/推理链路 | 代码绘制 | `{{< mermaid >}}` |
| Part 6 实验 | 结果对比图 | 论文 Fig.5 | `.photo` |

配图优先级见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。

## 检查清单

创建并提交 Phase 4 change 前，确认以下问题都有明确答案：

- [ ] 每个章节有明确的叙事功能（不是"这一段翻译了论文的 X 节"）
- [ ] 核心公式分布在方法章节，不是堆在一个 block
- [ ] 配图在各章节均匀分布（不是全堆在方法章节）
- [ ] 字数分配满足总量要求
- [ ] 至少 3 张图片，至少 1 张代码绘制
- [ ] 论文未披露的项已标注"未披露"并写明替代方案
- [ ] 关键数据点已核对口径（分辨率 / GPU / 步数 / 数据集）
- [ ] 已确认决策与待解决事项都记录在 change 的 design

## 输出

1. OpenSpec change 的 `design.md`「文章内容大纲」
2. 用户确认信号
3. 固化后的 `openspec/changes/<slug>/{proposal,design,tasks}.md`

用户确认 change 后，才进入 Phase 5（HTML 写作）。
