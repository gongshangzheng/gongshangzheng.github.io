# 注意力（Attention）学习笔记

## 目录

1. [概述](#概述)
2. [核心概念](#核心概念)
3. [注意力的类型与机制](#注意力的类型与机制)
4. [关键理论与模型](#关键理论与模型)
5. [实验证据与经典范式](#实验证据与经典范式)
6. [注意力障碍案例](#注意力障碍案例)
7. [应用与拓展](#应用与拓展)
8. [总结](#总结)

---

## 概述

**注意力（Attention）** 是认知心理学研究的核心主题之一，指的是意识对特定信息的集中和聚焦，同时抑制对其他信息的处理。正如 William James 在《心理学原理》中所言："每个人都知道注意是什么。它是心灵以清晰、生动的方式占有若干似乎同时可能的对象或思维序列之一。"

注意力的核心功能可以概括为两个相互关联的过程：
- **增强（Enhancement）**：对某些信息进行选择性增强，使其获得更深入的加工
- **抑制（Inhibition）**：将其他信息搁置一旁，避免其干扰当前任务

注意力的研究对于理解人类认知系统的局限性具有重要意义。由于感官系统和认知资源的有限性，人类必须在海量信息中进行选择性地处理，而注意力正是实现这一选择的关键机制。

---

## 核心概念

### 什么是注意力

注意力并非单一机制，而是一个涵盖多种相关过程的伞状概念：

| 类型 | 定义 |
|------|------|
| **选择性注意（Selective Attention）** | 从多重刺激中优先选择某些信息进行处理，同时忽略其他无关信息 |
| **持续性注意（Sustained Attention）** | 在较长时间内保持对特定任务的专注 |
| **分配性注意（Divided Attention）** | 在多个任务或信息源之间分配认知资源 |
| **转移性注意（Alternating Attention）** | 在不同任务或刺激之间灵活切换焦点 |

### 注意力与信息处理的限制

人类信息处理系统在早期阶段是**高度并行（parallel）**的，能够同时处理大量感觉信息。然而，在某些关键节点存在**串行瓶颈（serial bottleneck）**，导致信息必须被序列处理。这些瓶颈主要来自：

- **有限的感官系统**：眼睛必须在场景中移动才能获取完整信息
- **有限的效应器系统**：动作必须按顺序计划
- **语言输出限制**：话语只能按顺序说出

![Eye Tracking](../assets/cognitive-science/attention/eye-tracking-arcimboldo.png)

眼动追踪研究表明，人类在感知场景时只能一次性获取其中的"碎片"，需要移动眼睛（扫视 saccades）来扫描整个视野。典型的注视持续约 200-300 毫秒，用于获取信息；扫视则是注视点之间的快速移动。

---

## 注意力的类型与机制

### 内源性注意与外源性注意

根据注意力的控制来源，可以分为：

**内源性注意（Endogenous Attention）**
- 由目标驱动（top-down）的注意
- 由观察者的意图、期望和知识引导
- 例如：在超市中主动寻找特定品牌的商品

**外源性注意（Exogenous Attention）**
- 由刺激驱动（bottom-up）的注意
- 由环境中显著（salient）的刺激自动引发
- 例如：突然的闪光会立即捕获注意力

### 基于位置的注意与基于物体的注意

**聚光灯理论（Spotlight Theory）** 认为注意力像一束聚光灯，可以移动到视野的不同位置来聚焦信息。聚光灯通常但并不总是位于中央凹的位置——注意力可以在没有眼动的情况下移动。

然而，传统聚光灯理论面临两个重要挑战：

1. **注意力的跳跃性**：注意力似乎不是连续移动的，而是像"量子"一样从一处跳到另一处（Sperling & Weichselgartner, 1995）

2. **物体优先效应**：实验表明注意力可以指向单个物体，即使它叠加在另一物体之上

![Location-based vs Object-based Attention](../assets/cognitive-science/attention/location-based-attention.png)

![Location-based vs Object-based Attention](../assets/cognitive-science/attention/object-based-attention.png)

**基于物体的注意力（Object-based Attention）** 理论认为，当我们专注于一个物体时，该物体的所有部分都会被同时选择进行加工。例如，当你专注于穿绿色衣服的朋友时，你更可能注意到她手腕上的手表，即使旁边站着的人离你同样近——因为手表是你朋友的一部分，而旁边人的手表属于不同的物体。

---

## 关键理论与模型

### 特征整合理论（Feature Integration Theory, FIT）

由 **Anne Treisman** 提出的特征整合理论是视觉搜索研究中最具影响力的理论之一。该理论认为视觉加工分为两个阶段：

**第一阶段：前注意阶段（Preattentive Stage）**
- 基本视觉特征（颜色、方向、运动等）被自动、并行地处理
- 无需意识注意，称为"前注意的（preattentive）"
- 当目标具有独特特征时，它会从背景中"跳出（pop out）"
- 搜索效率与干扰物数量无关

**第二阶段：聚焦注意阶段（Focused Attention Stage）**
- 必须有意识地集中注意才能将特征绑定在一起
- 涉及序列处理，逐个检查项目
- 当目标由特征组合定义时，搜索变慢且效率降低

![Feature Integration Theory](../assets/cognitive-science/attention/feature-integration-theory.png)

**特征搜索 vs 联合搜索**

| 搜索类型 | 特征 | 反应时间 |
|----------|------|----------|
| **特征搜索（Feature Search）** | 目标与干扰物仅在单一特征上有差异 | 常数（不受干扰物数量影响） |
| **联合搜索（Conjunctive Search）** | 目标需要多个特征组合才能识别 | 随干扰物数量线性增加 |

**特征搜索的不对称性**：发现 X among Ys 比发现 Y among Xs 更容易（前提是 X 比 Y 多一个特征）。例如，在一群 Q 中找到 O 比在一群 O 中找到 Q 更容易。

**虚幻 conjunctions（Illusory Conjunctions）**：当注意力被分散或时间有限时，人们可能错误地将不同物体的特征组合在一起，产生虚幻的 conjunctions。例如，PPT 中展示的实验显示，被试可能报告看到蓝色"O"，而实际上从未呈现过这种组合。

### 引导搜索模型（Guided Search）

引导搜索模型是对特征整合理论的改进。它假设：
- 分离的过程分别搜索目标特征
- 多个特征的共同激活区域会引导注意力指向目标
- 搜索既有自下而上的显著驱动，也有自上而下的目标导向

### 早期选择 vs 晚期选择理论

关于注意力的选择发生在信息加工的哪个阶段，心理学家提出了不同观点：

**早期选择理论（Early Selection Theory）— Donald Broadbent (1958)**
- 感官信息在达到瓶颈之前被处理
- 信息基于物理特征（如音高、声源位置）被过滤
- 非注意通道的信息保留在缓冲器中等待后续处理

![Early Selection Theory](../assets/cognitive-science/attention/early-selection-theory.png)

**晚期选择理论（Late Selection Theory）— Deutsch & Deutsch (1963)**
- 所有感觉信息都达到意识层面
- 选择发生在反应执行之前
- 所有信息都经历完整的语义加工

**衰减理论（Attenuation Theory）— Anne Treisman (1960)**
- 信息不会被完全过滤，而是被衰减（减弱）
- 语义标准可以应用于所有信息，包括衰减的信息
- 重要的刺激（如自己的名字）即使未被注意也能被识别

![Attenuation Theory](../assets/cognitive-science/attention/attenuation-theory.png)

---

## 实验证据与经典范式

### 非注意盲视（Inattentional Blindness）

**定义**：当注意力专注于某项任务时，人们可能完全意识不到意外出现的刺激。

**经典实验 — "看不见的大猩猩"（Invisible Gorilla）**
- Simons & Chabris (1999) 的经典实验
- 参与者被要求观看一段传球视频，并计数某队球员的传球次数
- 约一半的参与者完全没注意到视频中央走过一只穿着大猩猩服装的人

**关键发现**：
- 注意力分配对视觉感知有深远影响
- 高度显著的刺激也可能被完全忽视
- 人类的视觉经验远比主观感受稀疏
- 视觉世界可以作为外部记忆——背景中未被注意的信息被"忽略"

**变化盲视（Change Blindness）**：与 inattentional blindness 相关，当场景发生重大变化时，人们常常无法察觉。这是因为：
- 运动检测被打断时，很难观察未注意位置的变化
- 大脑在没有运动线索的情况下假设事物不会意外改变

### 注意力眨眼（Attentional Blink）

**定义**：在快速系列视觉呈现（RSVP）任务中，准确识别第一个目标（T1）后，在约 500 毫秒内呈现的第二个目标（T2）往往被遗漏。

![Attentional Blink RSVP](../assets/cognitive-science/attention/attentional-blink-rsvp.png)

**可能的机制**：
- 如果两个目标呈现足够接近，可以并行处理
- 否则需要序列处理，这会在 T2 的后续加工中产生临时瓶颈
- 类似于眨眼的物理遮挡效果

### Posner 提示任务（Posner Cueing Task）

Michael Posner 的经典实验范式研究空间注意力的引导：

![Posner Cueing Task](../assets/cognitive-science/attention/posner-cueing-task.png)

**实验设计**：
- 中央提示或外周提示先于目标呈现
- 有效提示（valid）：80% 概率在正确位置
- 无效提示（invalid）：20% 概率在错误位置

**结果**：
- 有效提示时反应更快
- 无效提示时反应变慢（表示注意力需要从当前位置释放并移动到新位置）

### 视觉搜索范式（Visual Search Paradigm）

** disjunctive 搜索**：寻找具有某种特征的单一目标
- "找一个 O"
- "找红色的东西"

**conjunctive 搜索**：寻找具有多种特征组合的目标
- "找一个红色且是 O 的东西"

搜索效率受以下因素影响：
- **特征数量**：单一特征搜索快，联合搜索慢
- **干扰物数量**：特征搜索不受影响，联合搜索受影响
- **特征独特性**：目标越独特，搜索越快

---

## 注意力障碍案例

### 半侧空间忽略（Hemispatial Neglect）

**病因**：通常由中风导致右顶叶（右 parietal lobe）血流中断引起，该区域被认为对注意力和选择过程至关重要。

**症状**：
- 无法感知或承认病灶对侧空间的物体
- 通常没有原发性知觉缺陷
- 枕叶的视觉区域仍然激活，但患者声称没有意识

**具体表现**：
- 不穿身体左侧的衣服
- 不承认左侧肢体是自己的
- 不识别左侧的熟人
- 否认自己的疾病

![Neglect Patient Drawing](../assets/cognitive-science/attention/neglect-patient-drawing1.png)
![Neglect Patient Drawing](../assets/cognitive-science/attention/neglect-patient-drawing2.png)

患者在复制或从记忆画钟表或雏菊时，不注意对侧空间的信息，导致画作不完整。

**Posner 的注意力成分模型**
根据脑损伤患者的研究，Posner 提出了注意力的三个心理操作成分：
1. **释放（Disengaging）**：从当前位置释放注意力
2. **移动（Moving）**：将注意力移动到新位置
3. **吸引（Engaging）**：在新位置吸引注意力以促进加工

不同患者群体在这三种操作上表现出不同的损伤模式。

### 巴林特氏综合征（Balint Syndrome）

**特征**： simultanagnosia（同时性失认）患者一次只能注意一个物体。

**表现**：
- 无法判断两条线的相对长度
- 但能识别由线端连接形成的图形不是矩形而是梯形
- 即使物体重叠，也只能一次注意一个

---

## 应用与拓展

### 眼动追踪的应用

**网站和应用设计**：通过眼动追踪研究优化布局，确保重要信息位于自然注视区域。

**广告与营销**：理解消费者如何扫视广告和货架，改进视觉呈现。

**驾驶安全**：研究驾驶员对道路环境的注意力分配，开发更有效的辅助系统。

### 特征整合理论在设计中的应用

- 使用独特的单一特征使重要元素"跳出"
- 避免在关键信息中使用复杂特征组合
- 利用前注意阶段自动处理特征的能力

### 注意力与人工智能

注意力机制（Attention Mechanism）是现代深度学习（尤其是 Transformer 架构）的核心组件：
- **自注意力（Self-Attention）**：允许模型权衡不同位置的重要性
- **多头注意力（Multi-Head Attention）**：并行捕捉不同类型的依赖关系
- **视觉注意力模型**：用于图像分割、目标检测等任务

认知科学中对人类注意力的理解为人工注意力机制提供了重要的理论基础和灵感来源。

---

## 总结

注意力是认知系统中至关重要的选择性机制，它使人类能够在海量信息中进行有效的信息筛选和加工。本笔记涵盖的核心要点包括：

1. **注意力的本质**：增强某些信息、抑制其他信息的双向过程

2. **注意力类型**：选择性注意、持续性注意、分配性注意、内源性与外源性注意

3. **空间注意理论**：聚光灯模型 vs 基于物体的注意力模型

4. **特征整合理论**：前注意阶段的并行处理 vs 聚焦注意阶段的序列处理

5. **经典实验**：非注意盲视、注意力眨眼、Posner 提示任务、视觉搜索范式

6. **临床案例**：半侧空间忽略、巴林特氏综合征

7. **理论争议**：早期选择 vs 晚期选择理论的争论

注意力研究不仅揭示了人类认知的局限性，也为人工智能、设计、临床诊断等领域提供了重要的理论依据和实践指导。

---

## 参考文献

- Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. *Cognitive Psychology*, 12(1), 97-136.
- Simons, D. J., & Chabris, C. F. (1999). Gorillas in our midst: Sustained inattentional blindness for dynamic events. *Perception*, 28(9), 1059-1074.
- Posner, M. I. (1980). Orienting of attention. *Quarterly Journal of Experimental Psychology*, 32(1), 3-25.
- Broadbent, D. E. (1958). *Perception and communication*. Pergamon Press.
- Treisman, A. M. (1964). Selective attention in man. *British Medical Bulletin*, 20(1), 12-16.
- Wolfe, J. M., & Horowitz, T. S. (2017). Five factors that guide attention in visual search. *Nature Human Behaviour*, 1(3), 0058.

---

*本笔记基于「认知计算科学」课程 PPT 编写，参考了认知心理学、神经科学及相关领域的经典文献。*
