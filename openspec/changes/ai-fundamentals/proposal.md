## Why

用户要求新增AI基础子分类，为阅读现代神经网络、Transformer和生成模型补足共同基础。现有素材分散在机器学习课程、视觉模型、架构和大语言模型中；课程又包含较多不需要在新系列展开的传统方法，因此需要按新的学习目标组织。

## What Changes

先建立change，再在草稿中规划文章范围和内容。系列暂定六篇正文和一个导航页，待用户审阅；首篇实质草稿已逐节审阅通过，用户已授权首篇正文写作；其余正文仍需各自审阅。

### 文章清单

以下是选题范围，不是已获批准的篇内大纲。目标alias为`categories/AI/AI基础`。2026-10-27运行`check-sub-id.py --category AI基础 --suggest`，当前没有该分类，未取得可分配编号；发布时建立分类后重新核验，不提前占号。

| slug | 暂定标题 | 类型 | 目标位置 / sub_id | 计划产出物 |
|---|---|---|---|---|
| ai-fundamentals-ml-introduction | AI基础（一）：机器学习引论 | 系列章节 | AI/AI基础；待分配 | src/pages/ai-fundamentals-ml-introduction.html |
| ai-fundamentals-math | AI基础（二）：数学基础——概率、马尔可夫链与采样 | 系列章节 | AI/AI基础；待分配 | src/pages/ai-fundamentals-math.html |
| ai-fundamentals-training | AI基础（三）：神经网络如何训练 | 系列章节 | AI/AI基础；待分配 | src/pages/ai-fundamentals-training.html |
| ai-fundamentals-cnn | AI基础（四）：CNN | 系列章节 | AI/AI基础；待分配 | src/pages/ai-fundamentals-cnn.html |
| ai-fundamentals-transformer | AI基础（五）：注意力与 Transformer | 系列章节 | AI/AI基础；待分配 | src/pages/ai-fundamentals-transformer.html |
| ai-fundamentals-learning | AI基础（六）：预训练、微调与蒸馏 | 系列章节 | AI/AI基础；待分配 | src/pages/ai-fundamentals-learning.html |
| ai-fundamentals-overview | AI基础：系列导航 | Hub | AI/AI基础/index；待核验 | src/pages/ai-fundamentals-overview.html |

- 机器学习引论置于第一篇；第二篇补数学基础；第三篇将数学用于神经网络训练；第四篇介绍CNN，数学原理只是其中一章。
- CNN篇增加LeNet、AlexNet等代表网络，并专设RNN/LSTM等前Transformer序列架构章节；明确循环网络不属于CNN变体。
- 注意力与Transformer合为一篇；从注意力计算讲到完整模型结构，并专设BERT、GPT、DETR等应用章节（用户“DERT”暂按DETR理解）。
- 概率与贝叶斯、马尔可夫链和采样合为一篇数学基础，保留推导与例子。
- 最新范围覆盖早先“传统方法只提一句”的限制：机器学习引论独立介绍历史、学习范式/任务、线性模型与核方法、集成学习与随机森林、聚类；贝叶斯分类/概率图推断不另设长篇。
- 数学篇必须讲蒙特卡罗估计及其与采样的关系；训练篇必须讲损失函数、反向传播；CNN篇必须讲激活函数及其作用。
- 草稿位于`drafts/ai-fundamentals/`；保留用户原始要求及后续调整。先审阅系列范围，再共写各篇草稿。
- 旧机器学习课程文章尽可能完整吸收进新系列，再删除旧页并修复链接；当前先完成迁移台账，不在新正文完成前删除。独立CNN/Transformer/LLM训练文章不在本次删除范围。

## Capabilities

### New Capabilities

- `ai-fundamentals-series`: 为AI基础系列建立范围、草稿追溯、数学与图示要求及逐篇审核的交付契约。

### Modified Capabilities

无。

## Impact

- 本阶段：`openspec/changes/ai-fundamentals/`、`drafts/ai-fundamentals/`和`raw/ai-fundamentals-planning/`。
- 后续经审批：文章、Hub、分类翻译注册与导航；分类展示名称AI基础，英文slug候选ai-fundamentals。
- 本轮可发布首篇及系列导航、登记AI基础分类；不修改构建器。资料沿用课程与库内文章；原始论文缺料时按read-article提取。
- 正文发布时必须构建并核对导航和媒体路径。首篇正文发布后运行测试、构建及页面验收。

## 已批准的教程对照补充

六篇顺序与数量已确认，篇内实质草稿仍逐篇审阅。引论介绍任务、范式与传统方法；训练篇统一解释dataset、样本/特征/标签、数据划分、质量、泛化、泄漏与指标；数学补矩阵/张量、梯度/链式法则、熵/交叉熵/KL；训练篇补学习曲线、过拟合诊断、正则化及验证/测试实践。配图候选与来源见系列草稿，优先已核验的ML Visualized、D2L及交互教程；具体图号与正文位置待后续设计，不提前声称原文已读或配图齐备。

历史内容补充：已定位旧编年史ai-chronicle.html，吸收有用内容、核查并纠正事实，在完整覆盖验收后退役。三大学派及热潮/寒冬进入引论历史节，外部原始资料用于公开引用，整合的旧笔记仅保留内部迁移追溯。

最新实施授权：首篇迁移补充同步正文；拆除课程/机器学习分类。两个旧目录与行政考核说明退役，其余未完成内容合并的15篇先归AI基础并保留URL，后续逐篇覆盖验收后继续清理。
