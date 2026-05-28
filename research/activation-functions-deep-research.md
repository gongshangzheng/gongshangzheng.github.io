# 机器学习激活函数：设计哲学与演化脉络深度研究报告

> **研究问题 (RQ)**: 机器学习中激活函数的设计哲学与演化脉络是什么？从 Sigmoid 到 GELU，每一步演化的动机和数学基础是什么？

---

## 引言

激活函数（Activation Function）是深度神经网络中最关键的非线性组成部分之一。从 1986 年 Rumelhart 等人将 Sigmoid 引入 BP 算法，到 2017 年 Google Brain 通过强化学习搜索发现 Swish，再到 2020 年代 Transformer 架构全面拥抱 GELU，激活函数的设计经历了从生物神经模拟到数学工程优化的深刻转型。

理解激活函数的演化，不仅是一次技术考古，更是对深度学习核心矛盾的集中呈现：非线性与梯度流动性的张力、计算效率与表达能力的权衡、以及概率性正则化与确定性变换之间的深层联系。本报告按时间脉络与问题驱动两条线索，系统梳理从 Sigmoid 到 GELU 乃至 Mish 的演进轨迹。

---

## 第一章：为什么需要激活函数？

### 1.1 线性叠加的坍缩问题

没有激活函数的神经网络，无论多少层，等价于单层线性变换。设输入为 $\mathbf{x}$，经过 $L$ 层线性变换：

$$
\mathbf{h}^{(L)} = \mathbf{W}^{(L)} \cdots \mathbf{W}^{(2)} \mathbf{W}^{(1)} \mathbf{x} = \mathbf{W}^{(\text{equiv})} \mathbf{x}
$$

整个网络坍缩为一个仿射变换 $\mathbf{W}^{(\text{equiv})} \mathbf{x} + \mathbf{b}^{(\text{equiv})}$，表达能力与单层感知机无异。这就是**线性坍缩（Linear Collapse）**问题。

激活函数的本质，是向网络引入**逐元素的非线性**，使多层网络的复合不再可约化，从而能够拟合任意复杂的非线性决策边界（通用逼近定理的工程前提）。

### 1.2 非线性的角色：特征空间的扭曲

非线性激活函数对输入空间实施"扭曲"——将原始空间弯曲成新的拓扑结构，使得线性分类器（即下一层的加权求和）能够在这个扭曲空间中分离原本线性不可分的数据。例如：
- XOR 问题在原始输入空间线性不可分，但在 Sigmoid 非线性变换后的特征空间中可以线性分离。
- 卷积层后接 ReLU，将稀疏特征图中的负响应清零，使后续层聚焦于有效响应。

### 1.3 历史起源：生物神经的类比

激活函数的早期设计深受生物神经元的启发：神经元接收到足够强的刺激后才会"激活"，Sigmoid 和 Tanh 模拟了这一阈值效应（saturation at tails）。这一生物类比为早期网络提供了直觉基础，但随着实践深入，人们逐渐意识到这种类比的局限性。

---

## 第二章：Sigmoid 与 Tanh 时代（1986–2010）

### 2.1 Sigmoid 函数

#### 数学定义
$$
\sigma(x) = \frac{1}{1 + e^{-x}} = \frac{e^x}{e^x + 1}
$$

#### 导数（自归一化形式）
$$
\sigma'(x) = \sigma(x)(1 - \sigma(x))
$$

#### 值域与性质
- **值域**：$(0, 1)$
- **输出中心**：非零中心，始终为正
- **饱和区**：$x \to +\infty$ 时 $\sigma(x) \to 1$，导数 $\to 0$；$x \to -\infty$ 时 $\sigma(x) \to 0$，导数 $\to 0$
- **计算成本**：需要计算指数函数 $e^{-x}$

#### 优势
1. 输出天然映射到概率区间 $[0, 1]$，适合二分类输出层（与交叉熵损失天然配对）
2. 函数平滑、处处可微，梯度计算简单
3. 早期理论分析工具完备（Hinton 等人 1986 年的 BP 算法即基于 Sigmoid）

#### 致命缺陷：梯度消失（Vanishing Gradient）

**问题本质**：在饱和区 $|x|$ 较大时，导数 $\sigma'(x) = \sigma(x)(1-\sigma(x)) \leq 0.25$，链式法则使梯度逐层衰减：

$$
\frac{\partial L}{\partial \mathbf{h}^{(1)}} = \left(\prod_{l=2}^{L} \mathbf{W}^{(l)} \odot \sigma'(\mathbf{h}^{(l-1)})\right) \frac{\partial L}{\partial \mathbf{h}^{(L)}}
$$

当层数 $L$ 增大时，$\leq 0.25^{L-1}$ 的因子使底层权重几乎无法更新。

**量化**：设每层梯度衰减因子为 $0.25$，则 10 层后梯度仅为初始值的 $\approx 0.25^9 \approx 10^{-5}$，20 层后降至 $\approx 10^{-10}$，这从根本上限制了网络深度。

**非零中心问题**：$\sigma(x) > 0$ for all $x$，导致输出始终为正，使梯度在反向传播中总保持同一符号，造成zigzag梯度更新路径，收敛速度慢（Hinton 后续明确指出此问题）。

#### 历史地位
- Rumelhart et al. (1986) 的 BP 算法默认激活函数
- 2006 年深度学习复兴（Hinton et al. 2006 深度置信网）仍依赖 Sigmoid
- 在输出层（二分类概率）仍有沿用价值

---

### 2.2 Tanh 函数（双曲正切）

#### 数学定义
$$
\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}} = 2\sigma(2x) - 1
$$

#### 导数
$$
\tanh'(x) = 1 - \tanh^2(x)
$$

#### 值域与性质
- **值域**：$(-1, 1)$，零中心（zero-centered）
- **饱和区**：$|x| \to \infty$ 时 $\tanh(x) \to \pm 1$，导数 $\to 0$
- **计算成本**：与 Sigmoid 相当（通常通过 stable 实现优化）

#### 相比 Sigmoid 的改进
1. **零中心输出**：梯度更新方向不再固定同向，zigzag 问题有所缓解
2. **更强的梯度**：在原点附近 $\tanh'(0) = 1$（vs. Sigmoid 的 $0.25$），梯度流动更好
3. RNN 时代 LSTM（Hochreiter & Schmidhuber 1997）选择 Tanh 作为门控机制的一部分

#### 仍未解决的核心问题
- **梯度消失依然存在**：饱和区 $|x|$ 较大时，梯度仍然指数衰减
- **计算仍含指数**：与 Sigmoid 成本相当

#### 历史地位
- 很长一段时间是 RNN/LSTM 的标配
- 2010 年代初 CNN 的默认选择
- 随着 ReLU 崛起，在中间层逐渐退出

---

## 第三章：ReLU 革命（2010–2017）

### 3.1 ReLU 的诞生与数学定义

#### 数学定义
$$
\text{ReLU}(x) = \max(0, x) = \begin{cases}
x & \text{if } x > 0 \\
0 & \text{if } x \leq 0
\end{cases}
$$

#### 导数（次梯度形式）
$$
\text{ReLU}'(x) = \begin{cases}
1 & \text{if } x > 0 \\
0 & \text{if } x < 0 \\
\text{undefined} & \text{if } x = 0 \quad (\text{通常定义为 } 0)
\end{cases}
$$

#### 值域与性质
- **值域**：$[0, +\infty)$
- **计算成本**：仅需比较操作，无指数或三角函数，GPU 高效向量化
- **单侧抑制**：负值响应清零，形成稀疏表征

### 3.2 ReLU 为什么有效？

#### 解决了梯度消失问题
ReLU 在正半轴的导数为恒等值 1，梯度流经时不会衰减。即使在很深的网络中，梯度也能有效回传到底层。

#### 生物合理性
神经科学中的**侧向抑制（Lateral Inhibition）**机制与 ReLU 类似：只有超过阈值的信号才被传递，与 Hard Threshold 激活函数有异曲同工之妙。Jarrett et al. (2009) 在 ImageNet 的实验表明 ReLU 配合 Maxout 等设计能显著提升性能。

#### 稀疏表征
50% 输入为零（假设输入分布对称），导致网络稀疏化：
- 降低过拟合风险
- 减少计算开销
- 符合生物神经系统的稀疏编码原则

#### 加速收敛
Glorot et al. (2011) 的实验显示，使用 ReLU 的网络比 Sigmoid/Tanh 快 6 倍以上收敛。

### 3.3 ReLU 的问题：Dead ReLU

**现象**：训练过程中大量神经元输出恒为 0（"死亡"），梯度无法回传。

**根本原因**：当某神经元的 bias 过大或前一层权重过度负偏时，该神经元恒有 $x < 0$，始终处于"关闭"状态。

**发生概率**：若初始化不当（如 Xavier 初始化前的 naive 初始化）或学习率设置过高，Dead ReLU 现象尤为突出。实践中约有 20%–40% 的神经元可能处于死亡状态（Chochran, 2018 报告）。

**为什么仍被接受**：虽然存在 Dead ReLU，由于：
1. 稀疏网络仍具有强大表达能力（" lottery ticket hypothesis"：网络中总存在一组稀疏但有效的子网络）
2. 即使部分神经元死亡，其余神经元仍能正常工作
3. 简单性带来的工程便利远大于损失

**历史地位**
- 2012 年 AlexNet（Krizhevsky et al. 2012）使用 ReLU，ImageNet 大幅领先，引发深度学习革命
- 2010 年 Glorot & Bengio 建议采用 ReLU，2011 年 Nair & Hinton 在受限玻尔兹曼机中独立使用
- 至今仍是大多数视觉 CNN 和简单 MLP 的默认选择

---

### 3.4 ReLU 变体群像

#### 3.4.1 Leaky ReLU (LReLU)

**动机**：允许负轴有小幅非零梯度，缓解 Dead ReLU。

**数学定义**：
$$
\text{LeakyReLU}(x) = \begin{cases}
x & \text{if } x > 0 \\
\alpha x & \text{if } x \leq 0
\end{cases}, \quad \alpha \in (0, 1) \text{（通常设为 } 0.01\text{）}
$$

**导数**：$\text{LeakyReLU}'(x) = 1$ if $x > 0$，$= \alpha$ if $x \leq 0$

**评价**：
- 消除了 Dead ReLU 问题
- $\alpha$ 为超参数，需手动调优（不如 ReLU 的"无需调参"便利）
- 在语音识别和自动编码器中表现优于 ReLU（Maas et al. 2013）

---

#### 3.4.2 PReLU (Parametric ReLU)

**动机**：Leaky ReLU 的 $\alpha$ 是超参数，PReLU 将其设为**可学习参数**，让网络自动适应最优斜率。

**数学定义**：
$$
\text{PReLU}_a(x) = \begin{cases}
x & \text{if } x > 0 \\
a x & \text{if } x \leq 0
\end{cases}, \quad a \in \mathbb{R} \text{（可学习）}
$$

**注意**：$a$ 可以是每通道（channel-wise）或每层独立的参数，增加了表达自由度。

**评价**：
- He et al. (2015) 在 ResNet 中使用 PReLU，发现在 ImageNet 上可略微提升性能
- 增加了参数量，在小数据集上可能过拟合
- 工程实现稍复杂

---

#### 3.4.3 ELU (Exponential Linear Unit)

**动机**：同时解决（1）Dead ReLU、（2）梯度消失、（3）输出非零中心三个问题。

**数学定义**：
$$
\text{ELU}(x) = \begin{cases}
x & \text{if } x > 0 \\
\alpha (e^x - 1) & \text{if } x \leq 0
\end{cases}
$$

**导数**：
$$
\text{ELU}'(x) = \begin{cases}
1 & \text{if } x > 0 \\
\alpha e^x & \text{if } x \leq 0
\end{cases}
$$

**关键性质**：
- $\alpha$ 通常取 $1$（原始论文默认值）
- $x \leq 0$ 时函数值在 $[-\alpha, 0)$ 区间，使输出**均值接近零**（零中心）
- 负半轴软饱和：$x \to -\infty$ 时 $\text{ELU}(x) \to -\alpha$，导数 $\to 0$，但饱和更缓

**评价**（Clevert et al. 2016）：
- 收敛速度更快（零均值效应）
- 对噪声有更强的鲁棒性（饱和区软化）
- 代价：包含 $e^x$，计算成本高于 ReLU
- 需要较大的 batch size 以保证稳定的批量统计

---

#### 3.4.4 SELU (Scaled Exponential Linear Unit)

**动机**：最激进的变体——通过激活函数本身实现**自归一化（Self-Normalization）**，使每层输出自动趋向于均值 0、方差 1。

**数学定义**：
$$
\text{SELU}(x) = \lambda \cdot \begin{cases}
x & \text{if } x > 0 \\
\alpha (e^x - 1) & \text{if } x \leq 0
\end{cases}
$$

**关键常数**（由 Banach 不动点定理推导）：
$$
\lambda \approx 1.0507, \quad \alpha \approx 1.6733
$$

**自归一化机制**：
设层输入 $x \sim \mathcal{N}(0, 1)$，经过 $\text{SELU}$ 后，下一层输入的均值和方差仍维持在 $(0, 1)$，形成稳定不动点。Klambauer et al. (2017) 证明：

$$
\text{Var}(z) \approx \text{Var}(x) \quad \Rightarrow \quad \text{网络各层输出方差保持稳定}
$$

**必要条件**：
- 必须使用 **LeCun 初始化**（或 Kaiming 的变体）
- 必须使用 **Alpha Dropout**（标准 Dropout 会破坏自归一化）
- batch normalization 不再必要

**评价**：
- 在标准 MLP 上（SNN 架构）表现优异（Klambauer et al. 2017）
- 对 batch size 和学习率敏感，实践中有时不稳定
- 主要用于全连接网络，在 CNN 中效果不如预期
- 由于严格的假设限制，实践中使用不如 ReLU 广泛

---

### 3.5 ReLU 变体对比总览

| 激活函数 | 公式 | 正半轴导数 | 负半轴导数 | 输出中心 | 计算成本 | Dead Neuron |
|---------|------|-----------|-----------|---------|---------|------------|
| ReLU | $\max(0,x)$ | 1 | 0 | 否 | 极低 | 有 |
| Leaky ReLU | $\max(\alpha x, x)$ | 1 | $\alpha$ | 否 | 极低 | 无 |
| PReLU | $\max(ax, x)$ | 1 | 可学习 | 否 | 极低 | 无 |
| ELU | $x > 0 ? x : \alpha(e^x-1)$ | 1 | $\alpha e^x$ | 接近零 | 中等 | 无 |
| SELU | $\lambda \cdot \text{ELU}(x)$ | $\lambda$ | $\lambda\alpha e^x$ | 零均值 | 中等 | 无 |

---

## 第四章：Swish —— 自门控与搜索的胜利（2017）

### 4.1 论文背景

Ramachandran, Zoph & Le (2017) 在 Google Brain 发表了里程碑式论文 **"Searching for Activation Functions"**，使用**强化学习**和**穷举搜索**自动发现优于 ReLU 的激活函数。

搜索空间：单输入单输出的基本数学运算组合（加、减、乘、除、幂、指数、三角函数等）

**最佳发现**：$f(x) = x \cdot \sigma(\beta x)$，命名为 **Swish**，其中 $\beta$ 为可学习或固定超参数。

### 4.2 数学定义

$$
\text{Swish}(x) = x \cdot \sigma(\beta x) = \frac{x}{1 + e^{-\beta x}}
$$

**特例**：当 $\beta = 1$ 时，退化为 **SiLU（Sigmoid Linear Unit）**，即 Swish 的 $\beta=1$ 版本。

**导数**（使用乘积法则 + Sigmoid 导数）：
$$
\text{Swish}'(x) = \sigma(\beta x) + \beta x \cdot \sigma(\beta x)(1 - \sigma(\beta x)) = \sigma(\beta x)(1 + \beta x(1 - \sigma(\beta x)))
$$

**性质**：
- $\beta \to 0$：$f(x) \to \frac{x}{2}$（线性）
- $\beta \to +\infty$：$f(x) \to \text{ReLU}(x)$（阶梯近似）
- $\beta = 1$ 时，有唯一极小值点 $x \approx -1.278$

### 4.3 Swish 的三大特征

#### 4.3.1 非单调性

Swish 在 $x < 0$ 区域存在一个**极小值点**（约 $x \approx -1.278$），使得函数非单调。这一性质极为罕见——几乎所有主流激活函数都是单调递增的。

**为什么非单调性重要？**
- 使网络能够对负输入产生"抑制"效应（而非简单清零）
- 增加了函数空间的复杂度，允许更精细的特征选择
- 类似于生物神经元中的**抑制-兴奋**交替模式

这与教学中的典型例题呼应：非单调激活函数使网络能够表达更复杂的目标函数（如某些峰值型分布），而单调函数（如 ReLU）在表达上存在本质局限。

#### 4.3.2 平滑性

Swish 处处连续、处处可微（$C^\infty$），且其导数也是平滑的。这带来：
- **更稳定的梯度流**：无 ReLU 的"突变点"（$x=0$ 处的不可导性）
- **更好的优化特性**：光滑的损失面有助于梯度下降更稳定地收敛
- 适合配合 L-BFGS 等二阶优化方法

#### 4.3.3 自门控（Self-Gated）

"门控"思想借鉴自 LSTM 中的**门控机制**——使用一个 sigmoid 作为"软开关"调制主信号。Swish 的门控信号是 $x$ 自身（而非额外参数）：

$$
\text{Swish}(x) = \underbrace{x}_{\text{主信号}} \cdot \underbrace{\sigma(\beta x)}_{\text{自门控}}
$$

这与 LSTM 中的 input gate 类似（LSTM 使用 $\sigma(W \cdot x + b)$ 作为门控），但 Swish 完全自包含，不需要额外的权重参数。

### 4.4 实验结果

**关键数据**（ImageNet 分类，top-1 accuracy 提升）：
- **Mobile NASNet-A**：ReLU → Swish，+0.9%
- **Inception-ResNet-v2**：ReLU → Swish，+0.6%
- 提升在**更深**的网络上更为显著（浅层网络差异不明显）

**解释**：深层网络受益于 Swish 的非单调性和平滑性，能够学习更复杂的特征组合。

### 4.5 工程实践中的 Swish

**优点**：
- 几乎可以作为 ReLU 的"即插即用"替代（只需改一行代码）
- 对 batch normalization 的依赖低于 ReLU

**缺点**：
- 计算 $\sigma(x)$ 仍需 sigmoid（比 ReLU 慢约 3–5 倍）
- $\beta$ 参数引入额外调优需求
- 实践中并非在所有任务上均优于 ReLU（"无免费午餐"）

---

## 第五章：GELU —— 概率正则化与非线性化的统一（2016）

### 5.1 论文背景

Hendrycks & Gimpel (2016) 在 *"Gaussian Error Linear Units (GELUs)"* 中提出 GELU，随后被 Devlin et al. (2018) 在 BERT 和 Vaswani et al. (2017) 在原始 Transformer 论文中采用，迅速成为 NLP 领域的标准激活函数。

### 5.2 数学定义

$$
\text{GELU}(x) = x \cdot \Phi(x)
$$

其中 $\Phi(x)$ 是标准正态分布的 CDF（累积分布函数）：
$$
\Phi(x) = \int_{-\infty}^{x} \frac{1}{\sqrt{2\pi}} e^{-\frac{t^2}{2}} \, dt
$$

**近似实现**（精度误差 $< 0.02\%$）：
$$
\text{GELU}(x) \approx 0.5x\left(1 + \tanh\left(\sqrt{\frac{2}{\pi}}\left(x + 0.044715x^3\right)\right)\right)
$$

**导数**：
$$
\frac{d}{dx}\text{GELU}(x) = \Phi(x) + x \cdot \phi(x)
$$
其中 $\phi(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}$ 是标准正态 PDF（概率密度函数）。

### 5.3 GELU 与 Dropout 的深层联系

这是 GELU 最深刻的设计洞察：**将随机正则化（Dropout）与确定性非线性变换统一起来**。

**Dropout 的本质**：以概率 $p$ 将输入随机置零（训练时），等价于将输入乘以一个 Bernoulli 随机变量：
$$
\text{Dropout}(x) = x \cdot \xi, \quad \xi \sim \text{Bernoulli}(p)
$$

**GELU 的本质**：将 Bernoulli 随机变量替换为正态 CDF 加权的**软置零**：
$$
\text{GELU}(x) = x \cdot \mathbb{E}_{\xi \sim \mathcal{N}(0, 1)}[\xi < x] = x \cdot \Phi(x)
$$

即：以输入值为阈值，从标准正态分布中采样，当采样值小于该输入时"部分保留"（而非硬性清零）。

**数学直觉**：Dropout 以 $0/1$ 硬随机门控输入，GELU 以 $\Phi(x) \in (0,1)$ 的软概率门控输入。两者在"输入依赖的随机抑制"这一主题上一脉相承。

Hendrycks & Gimpel 通过 **Gaussian Error Linear Units** 论文（arXiv:1606.08415）验证了此联系，并在 CV、NLP、语音三大任务上全面超越 ReLU 和 ELU。

### 5.4 GELU 的性质

- **值域**：$(-\infty, +\infty)$，非零中心（但负值响应更细腻）
- **平滑性**：处处 $C^\infty$
- **概率解释**：$x \cdot \Phi(x)$ 可视为输入的"概率加权保留"
- **梯度特性**：接近 ReLU 的优良梯度流，同时保留了更精细的负值响应
- **计算成本**：需要计算 $\Phi(x)$（通常通过逼近），比 ReLU 高约 30–50%

### 5.5 为什么 Transformer 选择 GELU？

1. **与 Transformer 的概率建模本质契合**：Attention 机制本质上是概率加权（Query-Key 内积归一化），GELU 的概率加权形式与之一致
2. **BERT/GPT 的示范效应**：Devlin et al. (2018) BERT 使用 GELU 后性能显著提升，形成社区共识
3. **平滑且无饱和区尖点**：相较于 ReLU 的 $x=0$ 硬转折，GELU 在原点的过渡更平滑，有利于优化
4. **负值响应的保留**：NLP 任务中词嵌入的负维度有语义信息，ELU/Swish 保留了负值，GELU 同样如此（但更精细）

### 5.6 与 Swish 的关系

**重要发现**（Ramachandran et al. 2017 中附录报道）：
> "We found that a Sigmoid Linear Unit (SiLU) $x\sigma(x)$ performs worse than GELUs but usually better than ReLUs and ELUs."

这说明：
- Swish/SiLU 的性能介于 GELU 和 ReLU 之间
- GELU 的 CDF 加权形式比简单的 Sigmoid 自门控更优越
- 但 GELU 需要近似 $\Phi(x)$，而 SiLU 使用精确的 $\sigma(x)$，计算上各有取舍

---

## 第六章：Mish —— 平滑的近似 ReLU（2019）

### 6.1 论文背景

Misra (2019) 在 BMVC 2020 发表 *"Mish: A Self Regularized Non-Monotonic Activation Function"*，借鉴 Swish 的设计思路，用 $\tanh(\text{softplus}(x))$ 替代 $\sigma(x)$，得到 Mish。

### 6.2 数学定义

$$
\text{Mish}(x) = x \cdot \tanh(\text{softplus}(x)) = x \cdot \tanh(\ln(1 + e^x))
$$

其中 $\text{softplus}(x) = \ln(1 + e^x)$，是 ReLU 的平滑近似（处处可导，无不连续点）。

**导数**（使用乘积法则）：
$$
\text{Mish}'(x) = \tanh(\text{softplus}(x)) + x \cdot \text{sech}^2(\text{softplus}(x)) \cdot \sigma(x)
$$

其中 $\text{sech}(x) = 1 / \cosh(x)$，$\sigma(x) = 1/(1+e^{-x})$。

### 6.3 Mish 的性质

#### 6.3.1 自正则化（Self-Regularized）

Mish 通过 $\tanh$ 的压缩效应，在 $|x|$ 过大时自动抑制输出值，防止梯度爆炸：

$$
|\text{Mish}(x)| \leq |x| \cdot 1 = |x|, \quad \text{且} \quad \lim_{x \to \pm\infty} \text{Mish}(x) \approx \pm 0.77x
$$

（而非无界增长。）这一性质使 Mish 在训练大模型时更稳定，减少了对 BatchNorm/LayerNorm 的依赖。

#### 6.3.2 非单调性

与 Swish 类似，Mish 在 $x < 0$ 区域存在极小值点，允许负输入产生抑制效应。

#### 6.3.3 平滑性

Mish 是 $C^\infty$ 函数（$\text{softplus}$ 平滑，$\tanh$ 平滑），无 ReLU 的不连续导数问题。

### 6.4 Mish vs Swish vs ReLU

| 性质 | ReLU | Swish | Mish |
|------|------|-------|------|
| 单调性 | 单调递增 | 非单调 | 非单调 |
| 平滑性 | 不连续（$x=0$ 处） | $C^\infty$ | $C^\infty$ |
| 自门控 | 无 | 有（$\sigma(x)$） | 有（$\tanh$） |
| 自正则化 | 无 | 无 | 有（$\tanh$ 压缩） |
| 计算成本 | 极低 | 中等 | 中等（多一个 $\tanh$） |
| 负值处理 | 清零 | 软保留 | 软保留+压缩 |

### 6.5 实验结果

Misra (2019) 在 ImageNet（CIFAR-10/100 等）、细粒度分类和医疗图像分割任务上报告了与 Swish 相当或略优的性能。

**关键局限**：
- 计算比 Swish 更重（需要 $\tanh$ 和 $\text{softplus}$ 两次非线性）
- 在实践中并非总是优于 GELU 或 ReLU
- 小数据集上过拟合风险稍高

---

## 第七章：实践选择指南

### 7.1 按任务类型

| 任务类型 | 推荐激活函数 | 理由 |
|---------|------------|------|
| **图像分类（CNN）** | ReLU / GELU | GELU 在 Vision Transformer 中占优；ReLU 仍是经典 CNN 的性价比选择 |
| **NLP / Transformer** | **GELU** | BERT/GPT 示范效应，与注意力机制的概率本质契合 |
| **语音识别** | Leaky ReLU / ELU | 需要处理连续音频流中的负振幅 |
| **自编码器（AE/VAE）** | Leaky ReLU / ELU | 重建任务需要保留负值信息 |
| **GAN（生成网络）** | ReLU / Leaky ReLU | 生成器需要稀疏激活以保持多样性 |
| **GAN（判别网络）** | Leaky ReLU | 判别器需要处理真实/伪造的全范围输出 |
| **深度强化学习** | ReLU | 计算效率优先，动作价值函数需要稀疏表征 |
| **自归一化 MLP** | SELU | 全连接网络在特定条件下实现零调参 |
| **搜索到的新架构** | Swish / Mish | 算力充足时即插即用替代 ReLU |

### 7.2 按网络深度

| 网络深度 | 推荐 | 说明 |
|---------|------|------|
| 浅层（1–3 层）| Sigmoid / Tanh | 梯度消失问题不严重，传统方法足够 |
| 中等（3–8 层）| ReLU | 简单有效，ReLU 的 Dead 问题是可接受的工程权衡 |
| 深层（8–50 层）| ReLU / Swish | Swish 的非单调性在深层网络中更能发挥优势 |
| 超深层（Transformer）| **GELU** | NLP 领域的经验最优选择 |

### 7.3 关键设计哲学总结

从 Sigmoid 到 GELU，激活函数的设计哲学经历了三次范式转移：

1. **生物模拟 → 数学优化**（Sigmoid/Tanh → ReLU）：从模拟神经元阈值行为，转向追求梯度流动性和计算效率
2. **硬阈值 → 软门控**（ReLU → Swish/GELU）：从简单的 $0/1$ 门控，转向概率加权的连续门控
3. **单一目标 → 多目标协同**：ReLU 的"简单" vs. GELU 的"概率一致性" vs. Mish 的"自正则化"，体现了工程实践中多目标权衡的成熟

---

## 第八章：关键论文索引

| 年份 | 论文 | 核心贡献 |
|------|------|---------|
| 1986 | Rumelhart et al. — Learning representations by back-propagating errors | BP 算法确立 Sigmoid 作为默认激活函数 |
| 1997 | Hochreiter & Schmidhuber — Long Short-Term Memory | Tanh 用于 RNN 门控机制 |
| 2009 | Jarrett et al. — What is the best multi-stage architecture... | 重新发现 ReLU 的有效性 |
| 2011 | Glorot & Bengio — Understanding the difficulty of training deep feedforward networks | 系统分析 ReLU 优于 Sigmoid/Tanh 的原因 |
| 2012 | Krizhevsky et al. — ImageNet Classification with Deep CNNs (AlexNet) | ReLU 在 ImageNet 竞赛中大规模验证成功 |
| 2015 | Clevert et al. — Fast and Accurate Deep Network Learning by Exponential Linear Units (ELU) | ELU 解决零均值和 Dead ReLU 问题 |
| 2016 | Hendrycks & Gimpel — Gaussian Error Linear Units (GELUs) | GELU 引入概率正则化与非线性化的统一视角 |
| 2017 | Ramachandran, Zoph & Le — Searching for Activation Functions | 强化学习搜索发现 Swish |
| 2017 | Klambauer et al. — Self-Normalizing Neural Networks (SELU) | 激活函数实现自归一化 |
| 2018 | Devlin et al. — BERT: Pre-training of Deep Bidirectional Transformers | GELU 在 NLP 领域的普及 |
| 2019 | Misra — Mish: A Self Regularized Non-Monotonic Activation Function | $\tanh(\text{softplus})$ 构建自正则化平滑激活函数 |

---

## 结语

激活函数的演化史，本质上是深度学习实践倒逼理论、理论又反哺实践的辩证过程。Sigmoid 解决了"如何训练"的问题，ReLU 解决了"如何训练得更深"的问题，GELU/Swish 则在"更深"的基础上追问"如何让非线性更智能"——将概率、门控和自正则化等概念引入激活函数设计。

未来，激活函数的研究可能走向：
- **任务自适应的动态激活函数**（输入条件决定激活形状）
- **硬件感知的激活函数设计**（针对特定芯片优化）
- **搜索启发的激活函数工程**（AutoML 自动搜索最优激活函数）

但无论走向何方，"非线性"与"梯度流动性"这对核心矛盾，将始终是激活函数设计的底层逻辑。

---

*本报告基于公开学术文献综合整理，中文撰写，关键术语和论文引用保留英文。*