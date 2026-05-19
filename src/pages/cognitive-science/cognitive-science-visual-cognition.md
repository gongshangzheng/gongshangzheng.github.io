# 视觉认知（Visual Cognition）学习笔记

> 课程来源：认知计算科学课程 Visual Cognition I / II / III 三讲
> 涵盖：视觉感知神经机制、心理表象、物体识别理论与脑功能成像

---

## 一、概述

视觉认知研究视觉系统如何从原始光信号中提取信息，最终形成我们对世界的感知与理解。这套笔记围绕三个主题展开：

1. **视觉感知基础**（Visual Perception）：从视网膜到初级视觉皮层的信号加工机制
2. **心理表象**（Mental Imagery）：内在视觉表征的本质及其与感知的关联
3. **物体识别**（Object Perception）：人脸/物体识别的理论与神经基础

---

## 二、视觉感知基础（Visual Cognition I）

### 2.1 视觉错觉：感知不可靠的证据

视觉系统并非对世界的"忠实复制"。错觉现象揭示了感知的建构性本质。

#### 外周漂移错觉（Peripheral Drift Illusion）

某些图片在视野中心观看时是静态的，但用余光（外周视野）观看时会感受到强烈的运动感。眨眼会增强这种错觉。一种解释是：眼动或眨眼在运动检测细胞中产生了瞬态信号（transients），导致虚假运动感知。

#### Craik-Cornsweet-O'Brien  illusion

同一亮度（isotensity）的左右两块区域被一条边缘分隔后，看起来亮度不同——左侧显得更暗，右侧显得更亮。遮盖中间边缘后，两侧看起来又相同亮度了。这说明**亮度感知不是绝对的，而是由对比边缘驱动的**——与马赫带机制有本质联系但并不完全相同。

### 2.2 眼球与视网膜的基本结构

视觉的起点是视网膜（Retina）。理解视觉认知必须从光感受器说起。

![视网膜横截面，示视杆/视锥细胞及神经层结构](../assets/cognitive-science/visual-cognition/01-retina-cross-section.png)

上图展示了视网膜的层级结构（从眼球前部到后部）：光线穿过透明神经层到达最右侧的**视杆细胞**（rods）和**视锥细胞**（cones），光感受器将光信号转换为化学/电信号，信号回传经过双极细胞（bipolar）、水平细胞（horizontal）、无长突细胞（amacrine），最终由神经节细胞（ganglion）通过视神经传出。

#### 视锥细胞（Cone Cells）

- 密集分布于**中央凹**（fovea centralis）——约 0.35mm 直径、无视杆的自由区域
- 人类视网膜约有 600-700 万个视锥细胞，主要集中于黄斑区
- 负责**明视觉**（photopic vision）和**色彩感知**
- 在相对明亮光线下功能最佳

![视锥细胞结构示意](../assets/cognitive-science/visual-cognition/02-cone-cell.png)

#### 视杆细胞（Rod Cells）

- 分布于视网膜外周（periphery），负责外周视野
- 人类视网膜约有 9200 万个视杆细胞
- 负责**暗视觉**（scotopic vision），对微弱光线更敏感
- **几乎不参与色彩感知**，这也是暗光下颜色感知减弱的原因

### 2.3 信号传导路径

视觉信息从视网膜到大脑的完整通路：

```
光感受器 → 双极细胞 → 神经节细胞 → 视交叉（Chiasm）→ 
外膝体（LGN）→ 初级视觉皮层 V1
```

![视觉信号传导简化流程图](../assets/cognitive-science/visual-cognition/03-signal-flow.png)

**关键节点：**

- **视交叉（Optic Chiasm）**：左右眼鼻侧半视野的神经纤维在此交叉，颞侧不交叉，保证每侧视野信息传递到对侧大脑半球
- **外膝体（LGN）**：视觉信息的主要中继站。LGN 接收视网膜神经节细胞的直接输入，也接收来自**网状激活系统**和**初级视觉皮层**的强反馈连接。LGN 的确切功能至今尚未完全明确，但它是视觉信息进入皮层的守门人
- **V1（初级视觉皮层）**：位于大脑后部枕叶，是视觉信息到达皮层的第一站

### 2.4 视皮层的层级组织

视觉皮层并非单一区域，而是一个功能分化的层级系统。

![V1-V5 层级组织结构图](../assets/cognitive-science/visual-cognition/04-hierarchical-organization.png)

| 区域 | 主要功能 |
|------|---------|
| **V1** | 方位选择性（oriented bars/edges）、纹理、深度、颜色基础 |
| **V2** | 与 V1 类似但更复杂；主观轮廓（subjective contours）响应 |
| **V3** | 整合复杂运动（模式运动），证据与 V5/MT 相近 |
| **V4** | 方位和颜色选择性；部分方向选择性细胞 |
| **V5/MT** | 更大感受野；运动方向/ disparity 选择性；无颜色选择性；模式运动响应 |

**功能特化障碍的临床证据：**

- **全色盲（Achromatopsia）**：V4 损伤导致全部色彩感知丧失，患者记忆中的颜色也消失（不仅是即时感知受损）
- **运动失认症（Akinetopsia）**：V5/MT 损伤导致无法感知物体运动，患者描述世界为"一系列静止图像的集合"

### 2.5 感受野与单细胞记录

**感受野（Receptive Field, RF）** 是指能够激活特定神经元的视网膜区域。Hubel 和 Wiesel（1962）的经典实验通过在猫 V1 中插入微电极，发现了以下关键细胞类型：

- **On-Off 细胞**：感受野中心对光（on）或对暗（off）有最强响应
- **Simple Cells（简单细胞）**：对特定**方位**（orientation）的光棒有最强响应，是最早的**特征检测器**

![感受野示意图 On-off 和 Simple cells](../assets/cognitive-science/visual-cognition/05-orientation-sensitive-cells.png)

**层级组织的逻辑**：通过聚合多个 On-Off 细胞的活动，视觉系统能够检测更复杂的特征（如线条和边缘）。这是**层级式特征提取**的生物学基础——局部简单特征逐步整合为全局复杂模式。

### 2.6 侧抑制与马赫带

**侧抑制（Lateral Inhibition）** 是理解许多视觉现象的核心机制：

> 神经元之间存在竞争关系——当一个神经元对某种模式产生强烈响应时，它会抑制其他神经元。

![马赫带现象示意图——均匀灰度矩形边界处的明暗错觉](../assets/cognitive-science/visual-cognition/06-mach-bands.png)

六个灰度均匀的矩形从左到右由浅到深排列。尽管每个矩形内部灰度完全均匀，但人眼会感到每个矩形的**右边缘比左边缘更亮，左边缘更暗**。这一现象的预测恰好来自神经节细胞的侧抑制响应特性：

- 亮区边缘处的神经节细胞因侧抑制而更活跃（被暗区邻居抑制得少）
- 暗区边缘处的神经节细胞因侧抑制而更受抑制

### 2.7 绑定问题（Sensory Binding Problem）

视觉信息处理的矛盾之处：

> 不同视觉属性（形状、颜色、方位、运动方向）分别由**空间上不同的皮层区域**负责加工——那么大脑如何将这些分离的属性"绑定"在一起，形成对单一物体的统一感知？

![绑定问题示意——各属性如何整合](../assets/cognitive-science/visual-cognition/07-binding-problem.png)

这是视觉认知中著名的**绑定问题（Binding Problem）**，Anne Treisman 的**特征整合理论**（Feature Integration Theory）尝试回答它：注意机制在绑定过程中扮演关键角色——特征可以"自由浮动"，只有通过选择性注意才能将正确特征组合在一起。

---

## 三、心理表象（Mental Imagery, Visual Cognition II）

### 3.1 什么是心理表象？

**心理表象（Mental Imagery）**：当视觉短时记忆表征存在但刺激本身并未被实际观看时，所伴随的"用心眼观看"的主观体验（Kosslyn & Thompson, 2003）。

历史上，心理表象曾被行为主义者排斥，直到认知心理学兴起才将其纳入研究范畴。认知心理学认为，**存在内部知识表征供心灵操作**——心理表象正是这类表征的典型例证。

### 3.2 表象的表征之争：模拟 vs 命题

关于心理图像如何在心灵中表示，存在长期争论：

![模拟表征与命题表征的对比示意](../assets/cognitive-science/visual-cognition/08-analog-vs-propositions.png)

**模拟表征（Analog Representation）**：
- 表象与所代表的事物具有**相同结构**——类似图片的"心理快照"
- 例如："罐子在盒子上。罐子是黑色的"→ 心理图像中确实如此排列

**命题表征（Propositional Representation）**：
- 以类似语句的描述性方式存储信息，**非空间性**
- 例如：上述内容表示为 `on(can, box)` 和 `black(can)`
- 由 Zenon Pylyshyn 提出（1973），认为表象只是附带现象，不反映认知加工的真实机制

大多数实验证据（包括心理旋转和脑成像研究）支持**模拟表征**的观点，但心理表象与视觉图像的加工方式并不完全相同。

### 3.3 心理表象与感知的共同神经基础

如果感知刺激和生成心理图像使用相同的神经机制，那么应预测：

- 心理图像应该具有**类图画的性质**
- 心理图像应该**激活部分参与视觉加工的脑区**

**fMRI 证据**：Kosslyn 等人（1999, 2001）的研究表明，初级视觉皮层（V1）在视觉表象任务中被激活，且激活模式具有**拓扑组织特性**（ retinotopic organization）——与真实视觉刺激的激活方式类似。

![fMRI 证据——视觉表象激活视觉加工脑区](../assets/cognitive-science/visual-cognition/10-fmri-visual-imagery.png)

### 3.4 分辨率场研究

Finke & Kosslyn（1980）的实验测量了**分辨率场**（field of resolution）：能够区分两个点的视角范围。

![Finke-Kosslyn 分辨率场实验示意](../assets/cognitive-science/visual-cognition/09-finke-kosslyn-experiment.png)

实验发现，感知和表象任务中测得的分辨率场**高度相似**，有力支持了"表象使用与感知相似的视觉加工机制"这一论断。

![感知与表象中水平和垂直分辨率场的对比数据](../assets/cognitive-science/visual-cognition/09-finke-kosslyn-experiment.png)

### 3.5 心理旋转（Mental Rotation）

**核心问题**：心理图像能否像物理对象一样进行空间变换？如何验证？

**实验范式**：呈现两个形状，要求被试判断是否相同（其中一个经过了角度旋转），测量反应时间。

**结果**：反应时间与旋转角度呈**线性关系**——旋转角度越大，反应时间越长。心理旋转过程与物理旋转过程高度类比。

![心理旋转实验结果——反应时间与旋转角度的线性关系](../assets/cognitive-science/visual-cognition/11-mental-rotation-results.png)

这一发现为"表象具有空间性质"提供了强有力的行为证据。

### 3.6 表象中的视觉错觉

心理图像会受到与真实视觉相同的错觉影响。

#### Ponzo 错觉

![Ponzo 错觉——两条等长水平线在汇聚背景下的主观长度差异](../assets/cognitive-science/visual-cognition/12-ponzo-illusion.png)

两条等长水平线嵌入向远处汇聚的"铁轨"背景中时，上方那条看起来更长。实验发现，在心理表象中想象同样的背景，也会产生相同的错觉——说明视觉系统的尺寸感知机制（基于视网膜位置和深度线索）在表象中同样运作。

### 3.7 表象与真实感知的差异

尽管共享神经机制，心理图像与真实图像存在关键区别：

| 特性 | 心理图像 | 真实图像 |
|------|---------|---------|
| 可重解释 | 困难（一旦形成难以改变） | 容易 |
| 细节丰富度 | 有限（受表象生动性影响） | 完整 |
| 概念知识影响 | 强（简化的物体模型） | 弱 |

**模糊图形实验**证明：如果你看到一种解释，就很难想象另一种解释——而真实视觉图像可以轻松被重新解释。

### 3.8 认知地图中的心理扭曲

认知地图（Cognitive Maps）是我们对空间环境的心智表征，受概念知识的强烈影响。

![认知地图层级组织的实验证据——superordinate 信息一致性与不一致性条件](../assets/cognitive-science/visual-cognition/13-cognitive-maps-hierarchical.png)

**典型案例**：哪个城市在更东边——里诺（Reno，内华达州）还是圣地亚哥（San Diego，加利福尼亚州）？

许多人会直觉选择里诺，理由是"内华达州在加利福尼亚州东边，里诺在内华达州，圣地亚哥在加利福尼亚州，所以里诺在东边"。但实际上圣地亚哥更靠东——**概念知识的层级推理扭曲了真实的地理感知**。

---

## 四、物体识别（Object Perception, Visual Cognition III）

### 4.1 物体识别的理论框架

物体识别面临根本挑战：同一物体在不同大小、旋转角度、光照条件下投射到视网膜上的图像差异极大，识别系统必须对这种变化具有**灵活性**。

四大主要理论：

| 理论 | 核心思想 | 代表人物 |
|------|---------|---------|
| **模板匹配**（Template Matching） | 将输入与存储的模板直接比较 | — |
| **特征匹配**（Feature Matching） | 识别物体的组成特征 | — |
| **成分识别**（RBC）| 物体由基本三维组件（geons）组成 | Biederman (1987) |
| **构型模型**（Configural）| 基于原型/类别平均的识别 | — |

### 4.2 模板匹配模型

**基本原理**：通过将输入图像与记忆中的一组模板逐一比对，检测匹配模式。

**优点**：简单直接，在模板与输入高度一致时有效。

**局限性**：
- 需要存储**大量模板**（不同大小、方向、颜色的变体）
- 难以处理自然场景中的物体识别
- 忽略了"物体由更小部分组成"这一直觉

**适用场景**：指纹识别、汉字 OCR（受限环境）等高度规范化的识别任务。

### 4.3 特征匹配模型

**核心思想**：将物体分解为特征（如直线、曲线、端点、拐角），并行搜索这些特征的组合。

特征匹配的优势在于其**并行分布式处理**特性——不同特征可由不同神经区域同时检测。模型要成立，需要神经元或神经元群对输入的特定特征表现出选择性。

**致命弱点**：许多不同物体包含完全相同的特征集合。仅知道"有两条平行线和一个弧"不足以区分字母 H 和 A（以及许多其他形状）。因此还需要**结构信息**——特征之间的关系。

### 4.4 成分识别理论（Recognition by Components, RBC）

Irving Biederman（1987）提出，复杂物体由少量**geon**（几何离子，geometric ions）组成——即基本的3D形状（圆柱、圆锥、长方体等）。

![24 种 Geon 组件图示——RBC 理论的基本构建块](../assets/cognitive-science/visual-cognition/14-geons-rbc-model.png)

**理论假设**：
- 自然物体可由约 **24-36 种** geon 的不同组合表示
- 这类似于语言的类比：44 个音素（phoneme）组合成所有词汇；类似地，有限 geon 集可组合表示几乎所有物体
- **3060亿种** 3-geon 组合数量足以覆盖一切可识别物体

**非偶然属性（Non-Accidental Properties, NAP）**：

Biederman 选择 geon 的依据是它们在视角变化下保持稳定的属性：

- **曲率**（Curvature）
- **平行线**（Parallelism）
- **共端点**（Co-termination）
- **对称/非对称**（Symmetry/Asymmetry）
- **共线性**（Collinearity）

这些属性在大多数视角下可靠，只有极少数"意外视角"（accidental viewpoints）下会失效——这正是 **视点不变性（Viewpoint Invariance）** 的来源。

**RBC 的局限**：

1. **结构描述不够**：颜色、纹理和精确度量信息对区分相似物体至关重要，RBC 无法处理
2. **真实图像中的 geon 提取困难**：从自然图像中可靠地分割出 geon 是计算神经科学的难题
3. **某些物体难以建立结构表征**：复杂或有机形态的物体可能不符合 geon 分解范式

### 4.5 构型模型（Configural Models）

**核心思想**：不存储单个实例，而是存储类别的**原型（prototype）**——代表元素。识别基于感知项与原型的**心理距离**。

#### 面孔空间（Face Space）

![面孔空间模型——构型识别的典型框架](../assets/cognitive-science/visual-cognition/15-face-space-configural.png)

面孔识别领域常用"面孔空间"模型：每个人脸对应空间中的一个点，类别原型位于空间中心，识别是基于到原型的偏差程度。

**有趣预测——夸大人脸效果（Caricature Effect）**：

从平均脸向特定面孔移动，夸大了与平均值的偏差。研究发现，**夸大人脸比真实人脸识别得更好**（或至少同样好），因为距离原型的偏差更明显。这对特征匹配理论构成挑战——识别依据的不是特征本身，而是特征偏离"规范"的程度。

#### 人脸的构型效应

人脸识别依赖**整体/构型加工**（holistic/configural processing）——面孔各部分之间的空间关系至关重要，而非各部分本身。

**面孔反转效应**：当面孔上下颠倒时，构型效应消失。这也是识别熟悉度高的名人的倒脸更困难的原因。

### 4.6 上下文效应（Context Effects）

视觉识别不是孤立进行的——**上下文**（context）在识别中发挥关键作用。

- **促进识别**：物体嵌入连贯场景时，识别更准确（如邮件场景提示使"MAIL"一词更易识别）
- **改变解释**：相同的模糊图像在不同上下文下被理解为不同物体（"THE BHKE" ← "THE" 场景提示使阅读变得容易）

### 4.7 交互激活模型（Interactive Activation Model）

**背景**：词优效应（Word Superiority Effect）表明，高层次信息（词）可以影响低层次字母的识别。

**McClelland & Rumelhart（1981）** 提出交互激活模型（IA 模型）来解释这一现象：

![交互激活模型结构图——特征层、字母层、词层的三级网络](../assets/cognitive-science/visual-cognition/16-interactive-activation-model.png)

**模型结构（三层）**：
- **特征层**（Features）：检测线条、弧等基本视觉特征
- **字母层**（Letters）：接收特征输入，节点间相互抑制
- **词层**（Words）：接收字母输入，词间相互抑制

**信息流动**：
- **自下而上（Bottom-up）**：特征 → 字母 → 词
- **自上而下（Top-down）**：词激活反馈 → 字母识别（如 WORK 激活 W、R、K 三个字母的节点）

**词优效应的解释**：当一个词被激活时，其组成的字母得到来自词层的额外激活支持，提高了字母检测的敏感度——不仅仅是反应偏向。

### 4.8 视觉认知的计算神经科学前沿

#### 多体素模式分析（MVPA）与"读心术"

传统 fMRI 分析关注单一体素的激活强度。**Haxby et al.（2001）** 的开创性研究转而分析**激活模式**——即不同体素的激活组合。

![Haxby 2001 多体素模式分类示意图——8 类物体在腹侧颞叶皮层的分布式激活模式](../assets/cognitive-science/visual-cognition/17-haxby-pattern-classification.png)

**实验设计**：
- 让被试观看 8 类物体（面孔、猫、剪刀、椅子、房屋、瓶子、鞋子、随机图像）
- 使用多体素激活模式训练分类器
- 在新图像上测试分类准确率

**结果**：仅通过腹侧颞叶皮层的激活模式，分类器达到 **96% 准确率**区分 8 类物体。重要的是，同类物体（如不同人的脸）共享相似模式，不同类物体（如椅子和鞋）模式差异大。

![8 类物体的多体素激活模式可视化——面孔等各类别呈现独立分布模式](../assets/cognitive-science/visual-cognition/18-haxby-faces-results.png)

这一发现揭示了**腹侧颞叶皮层的分布式表征**：并非每类物体对应一个独立"模块"，而是整个区域的激活模式构成区分各类别的基础——面孔、猫等类别各自形成特定的激活"指纹"。

#### 从激活模式重建心理图像（Miyawaki et al., 2008）

更进一步：如果能通过激活模式预测被试在看什么，**能否反过来从激活模式重建被试的视觉体验**？

Miyawaki 等人（2008）结合 fMRI 和encoding模型，从简单视觉模式的脑活动中重建出原始图像——这是视觉认知与机器学习的里程碑式交叉。

![Miyawaki fMRI 视觉重建实验示意——从脑活动反推视觉图像](../assets/cognitive-science/visual-cognition/19-miyawaki-reconstruction.png)

---

## 五、综合总结

### 视觉感知：从光子到意义的层级转换

| 处理阶段 | 代表区域 | 关键机制 |
|---------|---------|---------|
| 光感受 | 视网膜 | 视杆/视锥将光信号转换为电信号 |
| 早期加工 | LGN | 中心-周边拮抗，感受野组织 |
| 特征提取 | V1-V4 | 方位、颜色、运动方向选择性 |
| 整合识别 | IT/VT | 物体表征、面孔识别 |
| 运动控制 | MT/V5 | 运动方向和速度加工 |

### 表象与感知：共享机制但有差异

**共性证据**：
- fMRI 证据显示表象激活视觉皮层拓扑组织
- 分辨率场在感知和表象中相似
- Ponzo 错觉在表象中同样发生

**差异证据**：
- 心理图像难以重解释（缺乏感知中的即时反馈）
- 认知地图受概念知识扭曲
- 表象生动性影响细节保留程度

### 物体识别：多理论互补

- **模板匹配**：适用于高度规范化的受限环境
- **特征匹配**：提供并行分布式加工基础，但需解决绑定问题
- **RBC**：解释了视点不变性，但不能处理纹理和度量信息
- **构型模型**：强调整体加工对人脸等构型敏感物体的关键作用

### 核心理论贡献者

| 学者 | 贡献 |
|------|------|
| **Hubel & Wiesel** | V1 层级组织、感受野、方位选择性（1962，诺贝尔奖 1981）|
| **Anne Treisman** | 特征整合理论，绑定问题的注意机制解释 |
| **Irving Biederman** | Recognition by Components 理论，geon 概念 |
| **Stephen Kosslyn** | 心理表象研究，视觉表象的模拟表征理论 |
| **McClelland & Rumelhart** | 交互激活模型，词优效应的联结主义解释 |
| **Haxby et al.** | fMRI 多体素模式分析，"视觉读心术"基础 |

---

## 参考文献

1. Hubel, D. H., & Wiesel, T. N. (1962). Receptive fields, binocular interaction and functional architecture in the cat's visual cortex. *Journal of Physiology*, 160(1), 106-154.
2. Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. *Cognitive Psychology*, 12(1), 97-136.
3. Biederman, I. (1987). Recognition-by-components: A theory of human image understanding. *Psychological Review*, 94(2), 115-147.
4. Kosslyn, S. M., & Thompson, W. L. (2003). When is early visual cortex activated during visual mental imagery? *Psychological Bulletin*, 129(5), 723-746.
5. McClelland, J. L., & Rumelhart, D. E. (1981). An interactive activation model of context effects in letter perception: Part 1. An account of basic findings. *Psychological Review*, 88(5), 375-407.
6. Haxby, J. V., Gobbini, M. I., Furey, M. L., Ishai, A., Schouten, J. L., & Pietrini, P. (2001). Distributed and overlapping representations of faces and objects in ventral temporal cortex. *Science*, 293(5539), 2425-2430.
7. Miyawaki, Y., Uchida, H., Yamashita, O., Sato, M. A., Morito, Y., ... & Kamitani, Y. (2008). Reconstructing visual experiences from brain activity evoked by visual patterns. *Neuron*, 60(5), 869-876.
8. Shepard, R. N., & Cooper, L. A. (1982). *Mental images and their transformations*. MIT Press.
