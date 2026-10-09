## Context

`drafts/video-generation.org` 当前仅有 identity shift、attention sink、persistent memory、longer contexts 的占位提纲。本 change 将它作为持续迭代的单一视频生成草稿，不另建扩散基础子 change。Roam 中已定位 DDPM 笔记（`~/org/roam/articles/Denoising Diffusion Probablistic Models.org`，含前向过程、ELBO、简化噪声预测目标）和 DDIM 笔记（`~/org/roam/articles/DDIM.org`，含非马尔可夫转移分布的推导线索）；另有 `~/org/roam/notes/ai-ml/Diffusion Model.org` 与 `~/org/roam/notes/ai-ml/对扩散模型的理解.org`。其中 DDIM 笔记的符号推导有不一致，写作时需从原始论文/可靠课程材料核准，不能照抄。

用户特别提到 MIT 扩散模型课程笔记；目前按课程名、MIT/课程关键词在 Roam 范围检索仍未定位到明确对应笔记，故不将任何笔记冒称 MIT 课程内容。继续扩大检索范围；若仍找不到，则以现有笔记为整理线索并明确来源边界，必要时再向用户询问课程名或关键词。

## Goals / Non-Goals

**Goals:**
- 在现有草稿中新增能让初学者循序理解 DDPM 与 DDIM 的基础章节，讲清符号、直觉、公式来历和采样含义。
- 推导至少覆盖：前向马尔可夫加噪与闭式边缘分布；真实后验 `q(x_{t-1}|x_t,x_0)`；ELBO 到简化噪声预测 MSE 的关系；由噪声预测恢复 `x_0` 并得到 DDPM 反向更新；DDIM 通过选择非马尔可夫反向转移得到确定性/随机性可调及跳步采样。
- 保留草稿既有身份信息与 identity drift 提纲；扩散基础作为视频生成路线的前置章节，不取代原主题。

**Non-Goals:**
- 不写发布版 HTML、不发布、不改 Roam 原笔记。
- 不在本章展开完整视频扩散架构、流式自回归生成或 Custom Forcing；这些留在后续章节。
- 不把 DDIM 简化误称为“把任意 DDPM SDE 直接变 ODE”而省略其非马尔可夫构造及离散采样公式。

## 核心问题与解法速览

- **问题是什么？** 视频生成学习路线需要共同的生成建模基础；若直接读视频扩散或加速论文，读者容易把训练目标、反向过程和采样器混为一谈。当前草稿没有这层铺垫。
- **解决办法是什么？** 在现有草稿中加入由“逐步加噪—可解析后验—学习噪声—反向生成”递进的 DDPM 教程，再说明 DDIM 如何保留相同训练模型而改变采样路径。
- **核心思想（编辑归纳）**：DDPM 用已知的高斯前向破坏过程构造监督信号，让网络估计噪声以近似反向去噪；DDIM 利用模型估出的 `x_0`/噪声，在不同噪声水平间构造一致的非马尔可夫转移，因此可少走若干步，随机性由 `eta` 控制。
- **具体机制**：先定义 `alpha_t=1-beta_t`、`bar_alpha_t=∏ alpha_s`，推导 `x_t=√bar_alpha_t x_0+√(1-bar_alpha_t)epsilon`；再由高斯条件分布得后验均值与方差，连接 ELBO 加权项和常用简化 MSE；推理时用 `epsilon_theta(x_t,t)` 估计干净样本，并按 DDPM 或 DDIM 的更新式迭代。所有公式需统一时间索引（`t` 到 `s<t`），并说明方差、预测参数化与采样步长约定。

## 文章内容大纲

### `video-generation`｜视频生成（持续迭代草稿；本次新增扩散模型基础章）

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 学习型原始草稿；保留 `drafts/video-generation.org` 现有 frontmatter、slug、alias `categories/杂识`、sub_id `auto`；不发布，故不分配正式编号或 Hub |
| 服务对象 | 想读懂视频生成论文、尤其扩散与后续流式生成方法的读者，能够从 DDPM 的训练目标推到 DDPM/DDIM 的实际反向采样更新。 |

**章节骨架**

| 节 | 这一节写什么 | 素材来源 | 必备元素 |
|----|------------|---------|---------|
| 1. 为什么先学扩散模型 | 连接视频生成路线：先理解图像/潜变量上的去噪生成，再迁移到时空数据；交代本章边界 | `drafts/video-generation.org` 现有提纲；`~/org/roam/notes/ai-ml/对扩散模型的理解.org`（具体段落待最终定位） | 生成过程与训练过程的路线图 |
| 2. DDPM：前向过程与任意时刻采样 | 从 `q(x_t|x_{t-1})` 出发推导闭式 `q(x_t|x_0)`：递推均值、独立高斯噪声方差相加，再引入 `bar_alpha_t` | `~/org/roam/articles/Denoising Diffusion Probablistic Models.org` §前向过程与逆向过程、§数学形式化；`~/org/roam/notes/ai-ml/Diffusion Model.org`（待定位具体小节） | 加噪公式；`alpha/bar_alpha` 符号表；重参数化推导 |
| 3. 从贝叶斯后验到 DDPM 反向分布 | 对 `q(x_{t-1}|x_t,x_0)` 配方，展示后验均值/方差；解释真实后验可算但生成时没有 `x_0`，所以需学反向模型 | DDPM 笔记 §数学形式化及原论文公式（原文定位待补）；DDIM 笔记 §模型和方法仅作对照线索 | 配方中间步骤；后验公式；训练/生成时信息差异图 |
| 4. ELBO 如何变成噪声预测 | 将变分目标拆为终端先验、逐步 KL 与重建项；代入固定方差高斯后验，展示加权噪声误差，并解释简化 MSE 是实践常用目标而非 ELBO 每项完全相同 | DDPM 笔记 §训练目标；`~/org/roam/notes/ai-ml/Diffusion Model.org`（待定位）；Ho et al. DDPM 原文（公式需核验） | ELBO 分解；从 `mu_theta` 参数化到 `epsilon_theta` 的代数；加权项与简化目标区别 |
| 5. DDPM 反向采样一步步算什么 | 从 `x_t` 预测噪声、反推 `x_0`/反向均值，写出一步更新与随机项；说明从纯噪声开始迭代 | DDPM 笔记 §数学形式化、§训练目标；原论文反向均值公式（待核验） | 采样算法伪代码；`T=1000` 仅作常见设置示例并标注非必需 |
| 6. DDIM：训练不变，采样路径可变 | 解释 DDIM 构造与 DDPM 训练目标共享的关系；由 `x_t=√bar_alpha_t x_0+√(1-bar_alpha_t)epsilon` 得到跨时间步更新，解释 `sigma_t`/`eta`、确定性极限和跳步 | `~/org/roam/articles/DDIM.org` §面临问题及Insights、§模型和方法（推导线索需纠错）；DDIM 原论文公式（待核验） | 从边缘分布约束推出更新；`eta=0` 确定性情形；DDPM 与 DDIM 对照表；少步采样示意 |
| 7. 小结与通往视频生成 | 总结训练（学噪声场）与采样（选择离散轨迹）的区别，指出视频中增加时空表示/一致性问题；衔接后续 identity drift、persistent memory | 本草稿现有 identity shift 提纲；上述 Roam 笔记 | 一张“扩散基础→视频扩散/流式生成”路线图 |

**关键数据点**（正文若出现数值需核对并标来源）

- `T=1000` 只作为原始 DDPM 常见训练/采样时间步示例，不泛化成所有模型固定配置；来源为 Ho et al. 原论文实验设置，写作时回查。
- DDIM 的具体步数、质量或速度比较：只在确认论文/实验设置后引用；不从二手笔记推断或编造数值。
- 公式定义域与时间索引必须统一；区分 DDPM 方差设定与 DDIM `eta/sigma` 选择。

**配图计划**：本次草稿优先用自绘示意（前向加噪—反向去噪；DDPM 与 DDIM 时间步轨迹），不依赖未核实图片。若后续转为博客发布，再按正式配图规范制作与审查。

## Decisions

- 一个 `video-generation` change 统筹整份草稿的持续建设；扩散基础是本次范围，不另拆 change。
- 先讲 DDPM 再讲 DDIM，因为 DDIM 依赖已建立的加噪闭式表达与噪声预测视角。
- 重点写推导之间的逻辑桥梁，而非只罗列最终公式；对 Roam 中 DDIM 笔记的符号与等式重新推导核验。
- 当前任务仅更新草稿，按门禁豁免，不要求用户审批后才能落草稿；若未来改为发布文章，再另行走内容发布门禁。

## Risks / Trade-offs

- Roam 笔记中公式的 `alpha`/`bar_alpha` 记号可能混用，尤其 DDIM 推导已有下标疑点；实施前需核对原论文或可信课程原始讲义。
- 用户提及的 MIT 课程笔记尚未定位；目前不确定指哪门课。若检索失败，不能声称章节直接依据 MIT 课程。
- 草稿目前状态为 `idea`，更新时应只增加内容与合理进度/更新时间，不覆盖其既有身份字段。
