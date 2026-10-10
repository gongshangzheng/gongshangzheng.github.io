## 笔记定位与学习目标

`drafts/video-generation.org` 是一份持续迭代的学习笔记，不是单篇论文解读或研究提案。内容应从基础概念开始，循序渐进说明基于扩散模型的视频生成知识：先建立生成模型和扩散模型的直觉，再补足理解公式所需的数学，接着进入图像扩散、视频扩散架构与时序问题，最后讨论流式/自回归生成及具体论文方法。避免使用“核心问题与解法、方法、实验、结论”作为整篇组织模板；单篇论文的分析可作为相关章节中的案例。

笔记服务对象是希望系统理解视频生成、能够阅读相关论文并区分模型训练与采样机制的读者。每章从读者已具备的知识出发，定义新概念、解释动机、逐步建立与前后章节的联系；数学推导需解释符号和关键中间步骤，但只在必要时展开证明。

## 素材与来源边界

Roam 中与扩散基础相关的材料：
- `~/org/roam/articles/Denoising Diffusion Probablistic Models.org`：DDPM 前向过程、ELBO 与噪声预测目标。
- `~/org/roam/articles/DDIM.org`：DDIM 非马尔可夫采样推导线索；原笔记符号需重新核验。
- `~/org/roam/articles/EDM.org`：SDE、反向 SDE、Probability Flow ODE、score 与去噪器关系。
- `~/org/roam/articles/DAPS.org`：朗之万动力学、反向 SDE/PF-ODE、Fokker–Planck、score matching 与退火采样。
- `~/org/roam/articles/DAPS++:-Rethinking-Diffusion-Inverse-Problems-with-Decoupled-Posterior-Annealing.org`：Tweedie 公式与退火流程。
- `~/org/roam/notes/ai-ml/Flow Matching.org`：连续性方程、边际向量场、score matching/DSM、SDE extension。
- `~/org/roam/notes/ai-ml/Diffusion Model.org` 与 `~/org/roam/notes/ai-ml/对扩散模型的理解.org`：扩散模型概念与公式整理。
- 扩散基础视频素材：用户提供的 YouTube 视频 `https://www.youtube.com/watch?v=iv-5mZ_9CPY`，用于辅助建立扩散模型直觉；引用时补充可确认的标题、作者/频道与发布时间，技术事实仍需与论文或课程资料交叉核验。
- 条件生成与图像扩散组件：`~/org/roam/notes/ai-ml/CLIP.org`、`~/org/roam/notes/ai-ml/Stable Diffusion.org`、`~/org/roam/notes/ai-ml/ControlNet.org`、`~/org/roam/articles/DreamBooth.org`、`~/org/roam/articles/LoRA.org`、`~/org/roam/articles/Stable Diffusion 3.org`。
- 用户已下载的 CVPR 2024 教程 PDF：`~/MyDoc/数字人/CVPR2024 Video Diffusion Tutorial - Part 1 - Video Generation & Editing.pdf`，作为任务地图、早期视频模型、架构及图像到视频/视频编辑等章节的直接课程素材。阅读前先检查 PDF 目录和章节结构，按内容引用并记录页码。
- 视频时空建模已有博客素材：`src/pages/slowfast-paper.html`（含 3D convolution、R(2+1)D 与视频网络架构比较）；视频生成早期模型、Video Diffusion Models、Make-A-Video 和 WebVid-10M 需以论文/数据集官方资料核实。
- 论文发现入口：Show Lab 的 [Awesome-Video-Diffusion](https://github.com/showlab/Awesome-Video-Diffusion) paper list，用于梳理方法类别、发现候选论文和开源项目；它是二级索引，不替代原论文、官方项目页、模型卡或数据集说明作为事实依据。

这些个人笔记与教程用于组织学习路径和提供素材，但公式及事实仍需核验。特别核查时间方向、参数化、噪声系数和公式假设。用户提到的 MIT 扩散课程笔记目前仍未定位，不能把现有 Roam 内容称为 MIT 课程材料；后续若找到再补充引用。

## 学习路径与章节规划

### `video-generation`｜视频生成学习笔记

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 学习型原始草稿；沿用 `drafts/video-generation.org` 现有 frontmatter、slug、alias `categories/杂识`、sub_id `auto`；不发布，不分配正式编号或 Hub |
| 学习顺序 | 生成建模基础 → 扩散直觉与数学 → 完整 DDPM 离散流程 → Score Matching/DSM 及代表性论文 → 连续时间 SDE/福克–普朗克/反向 SDE/PF-ODE → DDIM 论文与采样路径 → 条件生成/CLIP → DALL·E 2 条件图像生成 → Latent Diffusion/Stable Diffusion → ControlNet/DreamBooth/LoRA → 早期时空卷积与 R(2+1)D → Imagen/Imagen Video → Video Diffusion Models/3D U-Net → Make-A-Video 级联生成 → 视频数据集 → 开源基模（ModelScopeT2V、Show-1、LaVie）→ 时间一致性 → 流式/自回归生成与前沿方法 |
| 组织原则 | 概念先于公式、直觉先于推导、基础机制先于论文案例；逐章说明所需先修知识和与下一章的连接 |

### 第一部分：先建立生成模型与扩散基础

#### 1. 生成模型的基本想法

用数据分布、潜变量、似然与采样的直觉解释生成模型，区分训练时优化目标和推理时生成过程，为理解扩散模型做好准备。重点回答：模型学习的对象是什么？训练和采样分别在做什么？

#### 2. 扩散模型直觉：逐步破坏与逐步恢复

从向数据加噪到从噪声生成样本，介绍噪声水平、去噪器和 score 的直觉，说明扩散模型为何能构造明确的训练监督。重点回答：加噪为何可控？网络学什么？score 是什么、又不是什么？

**参考素材：** 用户提供的扩散基础视频 <https://www.youtube.com/watch?v=iv-5mZ_9CPY>、`~/org/roam/notes/ai-ml/对扩散模型的理解.org`；必要时补充可靠教材或课程。视频作为直觉性教学参考，公式及严格表述需另行核验。

### 第二部分：从扩散直觉到数学基础

#### 3. 理解扩散所需的数学工具

只补充后续会用到的高斯条件分布、Bayes 公式、条件期望、密度梯度，以及 ODE/SDE 的入门直觉：ODE 用确定性的速度场规定状态如何连续变化；SDE 在漂移项之外加入布朗运动驱动的随机项。用一维或二维简单轨迹区分确定性轨迹与随机样本路径，并解释时间变量、噪声增量和系数的含义；此处只建立阅读后文所需的语言，不提前推导反向扩散。重点回答：后续公式中的随机变量、概率密度和随机过程分别如何理解？ODE 与 SDE 描述的轨迹有何不同？

**参考素材：** `~/org/roam/articles/DAPS.org` 中的朗之万动力学；`~/org/roam/articles/EDM.org` 中的微分方程介绍。

#### 4. DDPM：先从具体离散扩散过程建立直觉

在扩散直觉与必要数学工具之后，先讲 DDPM 这一最具体、可逐步演算的离散过程：从 `q(x_t|x_{t-1})` 出发，推导任意时刻的闭式分布及 `x_t=√ᾱ_t x_0+√(1-ᾱ_t)ε`，再推导 `q(x_{t-1}|x_t,x_0)`。明确区分三个量：训练标签 `ε` 是完整的加噪噪声；网络由 `(x_t,t)` 预测 `ε̂θ`；再由 `x_t` 与 `ε̂θ` 间接估计干净样本 `x̂_0`，并代入反向后验均值计算 `x_{t-1}`。借二维螺旋点云玩具例子可视化这一过程：数据点在正向布朗运动式随机游走中逐渐散开，去噪则学习逆向随机游走（inverse random walks），让点云分布从噪声逐步回到螺旋数据分布。这里的“逆转”是反向时间随机过程/分布层面的逆过程，不是拿到并逐帧倒放同一条布朗运动噪声轨迹；因此不保证每个终点都回到原始配对点。用动画呈现随机点的正向散开与模型逐步去噪形成结构，并解释为何不能把一次性“指向均值”的回归当作完整生成过程：高噪声状态下，单步去噪估计可能很模糊、趋向条件均值；模型不是只做一次预测，而是在逐步降低噪声的反向链中反复更新状态，DDPM 的反向转移还会按设定注入随机性，令后续状态保留/探索与数据分布相容的变化。谨慎区分“反向每一步中的随机转移”和“去噪后再启动一条完整前向加噪链”：后者不是标准 DDPM 采样步骤。螺旋点云可展示单步均值估计的模糊性：在极高噪声下，若只看一次干净样本条件均值预测，多个可能的螺旋分支会被平均，预测点可能靠近圆心，显得所有点都被拉向中心；但这不是说真实反向 score 向量场必然处处指向圆心，也不是标准 DDPM 先把点全部压到中心、再完整前向加噪的循环。正确的多步反向采样是在每个噪声级别根据当前局部概率结构重新估计方向，并按反向转移逐步更新（DDPM 转移可含随机项），从而逐渐形成螺旋分布轮廓。图示应明确区分单步条件均值的模糊化直觉与真实多步反向扩散机制。最后由变分目标解释噪声预测 MSE 的来历，以及理论加权目标与常用简化目标的区别。

重点回答：如何直接得到任意噪声级别的训练样本？ε 预测如何转成 `x̂_0` 和反向更新？推理中的随机项来自哪里？为什么经典 DDPM 常以 ε 为训练目标，而 x/v prediction 也是可用的参数化？

**参考素材：** `~/org/roam/articles/Denoising Diffusion Probablistic Models.org` 与 Ho et al. DDPM 原论文；用户提供的扩散基础视频 <https://www.youtube.com/watch?v=iv-5mZ_9CPY>；JiT 原论文中的玩具数据可视化（核对具体图号及许可/引用要求后采用或据此重绘）。

#### 5. Score Matching 与 DSM：从方法脉络回看 DDPM

在完整理解 DDPM 离散流程后，回到 score matching 的思想与代表性论文脉络：先定义 score `∇x log p(x)`，说明直接拟合数据分布 score 的困难，再介绍经典 Score Matching 的目标、DSM 如何通过加噪条件分布构造可训练监督，以及它们各自解决什么问题。选取原始/代表性论文作为案例，交代研究动机、核心目标与推导直觉，而非只把术语当理论旁注。随后说明 DDPM 的噪声预测与高斯扰动下的 score 如何按噪声尺度换算，并从高斯观测模型推导 Tweedie 条件均值关系，连接 score 估计与干净样本估计。

重点回答：Score Matching 要估计什么、为何可训练？DSM 与原始 score matching 的关系是什么？DDPM 的 ε 预测如何联系 score？Tweedie 公式给出什么量？

**参考素材：** Score Matching、Denoising Score Matching 代表性原论文（需核定准确出处及贡献边界）；`~/org/roam/notes/ai-ml/Flow Matching.org` 中 Score Functions and Score Matching/DSM；`~/org/roam/articles/DAPS++:-Rethinking-Diffusion-Inverse-Problems-with-Decoupled-Posterior-Annealing.org` 中 Tweedie 公式。公式和历史脉络需回查原文。

#### 6. 连续时间扩散：SDE、福克–普朗克方程与 Probability Flow ODE

在第三节的 ODE/SDE 入门基础上，将 DDPM 的离散加噪推广到连续时间。先从正向 SDE `dX=f(X,t)dt+g(t)dW` 解释漂移、扩散系数与布朗运动增量，再引入福克–普朗克（Fokker–Planck）方程：逐项解释它如何把随机样本的漂移与扩散转写为概率密度 `p_t(x)` 的时间演化；用一维高斯扩散或二维玩具分布展示密度如何展宽，明确这是分布演化方程而非单条粒子的运动方程。继而说明反向时间 SDE 为什么出现 score 项，以及 score 如何决定逆向漂移。最后推导 Probability Flow ODE，解释确定性速度场如何产生与对应 SDE 相同的时间边缘分布、但不同样本路径；对照 DDPM 离散马尔可夫链，说明连续时间描述与数值离散采样的关系。

在此连续时间主线上解释参数化：score `∇x log p_t(x)` 是密度梯度，transport/vector field 是样本瞬时速度，二者相关但不可混为一谈。说明扩散 probability-flow vector field 与 Flow Matching 预设概率路径的目标速度场的联系与区别，并在统一噪声约定下介绍 ε、x、v 预测之间的换算；指出损失权重、数值尺度和优化表现会随参数化变化，不作脱离设定的优劣断言。

重点回答：福克–普朗克方程具体描述什么？它如何连接 SDE 的随机运动与密度演化？反向 SDE 的 score 项从何而来？SDE 与 PF-ODE 为什么共享边缘分布但不共享轨迹？

**参考素材：** Song et al. 连续时间 score-based generative modeling 原论文；`~/org/roam/articles/EDM.org`、`~/org/roam/articles/DAPS.org` 中的反向 SDE/PF-ODE；`~/org/roam/notes/ai-ml/Flow Matching.org` 中的连续性方程及 conditional/marginal vector field。公式、时间方向、系数和定理条件必须回查原文。

#### 7. DDIM 论文：非马尔可夫过程与快速采样

作为一篇具体论文讲解 DDIM：先交代 DDPM 多步采样的计算成本及论文动机，再说明 DDIM 如何构造与 DDPM 训练目标相容的非马尔可夫扩散过程，并从其反向更新推导跨步采样公式。解释如何跳过时间步、随机性参数如何控制随机到确定性采样，以及为何可沿用同一训练好的去噪模型。对比 DDPM 原始随机马尔可夫反向链与 DDIM 采样路径，明确时间顺序和贡献边界：DDPM 先提出，DDIM 是后续提出的替代采样方案，不是 DDPM 的前身或改进版。

重点回答：DDIM 论文要解决什么问题？它改变了训练过程还是采样过程？少步采样如何从公式中得到？

**参考素材：** Song, Meng & Ermon, *Denoising Diffusion Implicit Models* 原论文及 DDPM 原论文；`~/org/roam/articles/DDIM.org` 仅作推导线索，符号、等式与论文贡献需回查原文。

### 第三部分：从无条件扩散到条件生成

#### 8. 条件生成：如何让扩散模型听从条件

从无条件生成过渡到条件生成，以类别条件为例说明模型既要学习整体数据分布，也要响应指定类别；用“先进入高概率数据区域、再增强目标类别偏好”作为有限的轨迹直觉，但明确这不是所有模型都必然遵循的两阶段几何轨迹，也不是模型先走向某个全局流形中心。随后区分 classifier guidance 与 classifier-free guidance（CFG）：classifier guidance 通常组合无条件扩散模型与噪声条件分类器，以分类器的 `∇x_t log p(y|x_t)` 梯度修正采样 score；CFG 则在训练时随机丢弃类别/文本条件（用空类别或 null condition 表示），由同一个去噪模型学习条件与无条件预测，推理时按 `ε_cfg = ε_uncond + s(ε_cond - ε_uncond)` 外推条件方向。可把差分项解释为相对于无条件预测增强条件偏好的方向，但不要简化成“减去指向流形中心的向量”：无条件预测不是固定中心向量，差值也不保证与几何上的类别中心或流形法向一致。说明 CFG 以避免额外分类器及训练/推理权衡为动机，并交代 guidance scale 增大通常强化条件遵循、同时可能损害多样性或保真度。重点回答：条件概率目标是什么？classifier guidance 依赖哪两个模型/信号？CFG 为什么用空条件、如何由条件与无条件预测构造引导？

**参考素材：** DDPM/Classifier-Free Guidance 原论文及 `~/org/roam/notes/ai-ml/Diffusion Model.org`；公式与 CFG 训练/推理细节写作时回查原论文。

#### 10. CLIP：文本与图像的共同表示

介绍图像编码器、文本编码器、对比学习和共享嵌入空间，说明文本提示如何形成可供生成模型使用的语义条件；明确 CLIP 本身是表示/对齐模型，不是扩散生成器，也不等同于 Stable Diffusion 使用的所有文本编码组件。用“同一男性未戴帽/戴帽”作为属性方向的直觉示例：将两张图编码为向量并相减，得到图像嵌入空间中的差向量；再与“帽子”等文本嵌入比较相似度，说明差向量可能与属性语义对齐。需明确这只是直觉示意，不保证任意两图相减就会稳定、唯一地得到帽子概念；人物身份、背景、姿态等变化会混入差向量，且 CLIP 对比的是向量相似度，不是直接做符号匹配。重点回答：文本和图像如何被映射到可比较的表示？图像差向量何时可近似表示属性方向？CLIP 在生成管线中可能承担什么角色？

**参考素材：** `~/org/roam/notes/ai-ml/CLIP.org`；CLIP 原论文及具体生成模型的技术报告。

#### 11. DALL·E 2：CLIP 表示如何进入条件图像生成

以 DALL·E 2 作为 CLIP 与扩散生成之间的桥梁案例，讲清其两阶段核心管线：prior 根据文本生成 CLIP 图像嵌入，扩散 decoder 再以该图像嵌入为条件生成图像；说明论文中 prior 的自回归/扩散变体，以及 CLIP guidance 的作用和局限。强调 CLIP 由更早的独立工作提出，DALL·E 2 并非“最早引入 CLIP”的论文；也避免把 CLIP guidance 与 classifier guidance 或 CFG 混为一谈。重点回答：文本如何经由 CLIP 图像表示变成生成条件？prior 和 decoder 各自负责什么？

**参考素材：** Ramesh et al., *Hierarchical Text-Conditional Image Generation with CLIP Latents*（DALL·E 2）原论文及 OpenAI 官方材料；CLIP 原论文。核实 prior 变体、decoder 条件接口和 CLIP guidance 细节。

#### 12. Latent Diffusion 与 Stable Diffusion

先解释像素空间扩散的计算负担，再介绍 VAE 编码/解码与潜空间扩散；随后以 Stable Diffusion 为例梳理文本编码器、潜变量去噪 U-Net、cross-attention 与 VAE 解码之间的数据流。重点回答：扩散为什么可以在潜空间进行？一条 Stable Diffusion 推理流程各组件分别做什么？

**参考素材：** `~/org/roam/notes/ai-ml/Stable Diffusion.org`、`~/org/roam/articles/Stable Diffusion 3.org`；Latent Diffusion 原论文及对应模型报告。不同版本的组件差异需分别说明，避免把 Stable Diffusion 3 等架构细节泛化到所有版本。

#### 13. ControlNet：空间结构条件控制

在条件生成基础上介绍边缘、深度、姿态等空间条件如何接入预训练扩散模型；解释 ControlNet 的可训练分支、与主干特征的连接及保持原模型能力的设计直觉，并与仅靠文本提示控制作比较。重点回答：文本提示难以精确控制什么？结构条件如何转化为去噪网络可用的信息？

**参考素材：** `~/org/roam/notes/ai-ml/ControlNet.org`；ControlNet 原论文。具体连接结构与零卷积等细节以原论文核验。

#### 13. 个性化生成：DreamBooth 与 LoRA

先介绍 DreamBooth 的少样本主体个性化目标、稀有标识符与先验保持，再介绍 LoRA 以低秩增量适配权重的机制；比较全量微调、DreamBooth 训练配方与 LoRA 适配方式，说明 DreamBooth 与 LoRA 并非互斥概念（LoRA 可作为个性化训练的参数高效实现）。重点回答：如何让模型学习特定主体？如何降低训练和存储成本？

**参考素材：** `~/org/roam/articles/DreamBooth.org`、`~/org/roam/articles/LoRA.org`；DreamBooth/LoRA 原论文。避免把训练方法与参数高效适配模块当成同一层级概念。

### 第四部分：从图像扩散到视频生成

#### 14. 视频生成任务地图

介绍文本到视频、图像到视频、视频续写与编辑等任务，梳理条件输入、输出形式和常见评价维度，并给出全篇学习路线。重点回答：视频生成有哪些任务？不同任务在条件与生成时长上有哪些区别？

**参考素材：** 本地 PDF `~/MyDoc/数字人/CVPR2024 Video Diffusion Tutorial - Part 1 - Video Generation & Editing.pdf`（优先阅读并记录相关页码）；Hugging Face Diffusers 视频生成文档；具体技术结论写作时回查原始论文。

#### 15. 早期视频生成：从时空卷积到扩散模型

先回顾视频生成/视频表征中的早期时空建模路线，解释视频为何可视作时间、高度、宽度组成的时空体；循序介绍 3D 卷积如何联合提取局部时空特征、R(2+1)D 如何分解为空间 2D 卷积与时间 1D 卷积，以及它们在视频生成发展史中的作用和局限。此处用动作识别网络作为时空卷积的直观先例时，需明确区分识别任务与生成任务，不能把 R(2+1)D 误写成视频生成模型。

**参考素材：** `src/pages/slowfast-paper.html` 中对 3D convolution 和 R(2+1)D 的讨论；R(2+1)D 原论文；本地 CVPR 2024 教程 PDF 中回顾早期模型的章节（阅读后补具体页码）。

#### 16. Imagen 与 Imagen Video：文本到图像先验如何扩展到视频

先以 Imagen 说明高质量文本到图像扩散模型中的文本编码与级联超分辨率思路，再转向 Imagen Video，讲清其从文本生成低分辨率视频、逐级进行时空超分辨率的整体路线。与 Make-A-Video 并列比较两者如何借助强文本到图像先验及视频数据，特别区分它们各自的级联阶段和视频时间建模方式。重点回答：Imagen 中哪些设计可迁移到视频？Imagen Video 如何同时提高空间分辨率与时间分辨率？

**参考素材：** Imagen 与 Imagen Video 原论文及官方报告；本地 CVPR 2024 教程 PDF 中对应章节（阅读后补页码）。对模型规模、级联阶段及数据使用逐项核验，不把不同论文的配置混为一谈。

#### 17. Video Diffusion Models：3D U-Net 与时空去噪

以 *Video Diffusion Models* 为主线说明如何将扩散去噪器扩展到视频：输入视频片段及噪声时间步，U-Net 如何在时空张量上处理特征，3D 卷积/时空残差块怎样聚合局部时间信息，以及文本或其他条件如何注入。对照“逐帧使用图像模型”与“联合时空去噪”的差别，并说明 3D U-Net 是特定架构选择，不是所有视频扩散模型的统一结构。

**参考素材：** *Video Diffusion Models* 原论文；本地 CVPR 2024 教程 PDF（定位 3D U-Net 架构图和相关讲解，补页码）；实现细节按论文/官方代码核对。

#### 18. Cascade Generation：以 Make-A-Video 为例

解释级联生成的动机：先用较低分辨率/较短时间跨度生成基础视频，再由时空超分辨率等阶段逐步提升空间分辨率、帧率或时长。以 Make-A-Video 为例，区分文本到图像先验、视频生成/时间模块和时空超分辨阶段，说明其如何利用图像-文本数据与无文本视频数据，并避免把级联生成等同于单个 3D U-Net 一次性生成完整高分辨率视频。

**参考素材：** Make-A-Video 原论文及官方材料；本地教程 PDF 中相关章节（阅读后补页码）。逐项核对各级联阶段的输入输出和训练数据。

#### 19. 视频生成数据集与训练数据

介绍视频生成训练数据的组成与筛选挑战：视频-文本配对、字幕/描述质量、时长、帧率、分辨率、版权/来源及去重。以 WebVid-10M 为代表，说明其数据规模、来源、样本形式和常见局限；再对照后续常见数据集，区分训练集、评测集及论文内部数据。避免只报数据量而忽略过滤、许可与数据分布问题。

**参考素材：** WebVid-10M 原论文/数据集卡与官方说明；本地 CVPR 2024 教程 PDF 中数据章节（阅读后补页码）；其他数据集仅在核实来源后纳入。

#### 20. 开源视频生成基模：ModelScopeT2V、Show-1 与 LaVie

在早期研究路线之后转向可获取、可运行的开源视频生成基模。以 ModelScopeT2V 讲解文本到视频扩散模型的潜空间表示、时空去噪网络、采样器与推理流程；以 Show-1 对照其分阶段/混合式生成路线及不同阶段的职责；再介绍 LaVie 的文本到视频生成框架及其时空建模、训练数据和推理流程。通过三者比较开源权重与代码、模型架构、训练数据、分辨率/帧数、条件形式、推理成本及许可证边界。三者均为代表性案例，不代表当前开源视频生成模型全貌。

**参考素材：** ModelScopeT2V、Show-1、LaVie 原论文、官方代码仓库和模型卡；Show Lab 的 [Awesome-Video-Diffusion paper list](https://github.com/showlab/Awesome-Video-Diffusion) 用于发现其他候选开源基模。写作时确认权重、依赖、许可证状态及各阶段输入输出；涉及性能和硬件需求时只引用可复核的官方配置与评测。

#### 21. 后续视频扩散架构与任务

在早期时空卷积、Imagen/Imagen Video、Video Diffusion Models、级联生成及开源基模的基础上，介绍视频张量/潜变量表示、逐帧与联合时空建模、时空注意力/分解策略，并覆盖文本到视频、图像到视频、视频续写与编辑等任务。说明图像生成模型扩展到视频后新增的时序建模和计算问题。

**参考素材：** 本地 CVPR 2024 教程 PDF（定位视频表示、任务与后续架构章节并记录页码），以及写作时选定并核验的代表性视频扩散模型原论文和官方技术报告。

### 第五部分：视频生成的时序问题与流式生成

#### 22. 视频生成的时间一致性与长程依赖

从闪烁、身份与外观漂移、运动连贯性逐步讲到长视频记忆和上下文限制，保留并扩展草稿已有的 identity shift、attention sink、persistent memory、longer contexts 提纲。重点回答：短期连贯与长程身份保持为何不同？上下文和记忆机制如何影响生成？

**参考素材：** `drafts/video-generation.org` 现有提纲、Custom Forcing 论文及其他代表性原论文。注意区分 Custom Forcing 中持久 KV cache 区域与其他文献中 attention sink 的常见含义。

#### 23. 自回归、流式生成与 Custom Forcing

对比扩散式整段/迭代去噪与自回归逐块生成，解释因果生成、KV cache、流式延迟和持久上下文；在通用概念建立后，再以 Custom Forcing 作为案例。重点回答：如何在线生成后续视频块？缓存什么？如何避免历史信息丢失或漂移？

**参考素材：** Custom Forcing 原论文及相关流式视频生成论文。

#### 24. 学习总结与继续阅读

用概念图汇总任务、表示、生成机制、架构和时序问题，整理后续论文与课程的阅读路线，并标出仍需深入的方向。重点回答：各类方法如何放回同一知识地图？接下来按什么顺序阅读？

**参考素材：** 前述章节核验后的来源。

## 扩散数学章节的讲解要求

数学内容服务于理解视频生成，不把笔记写成孤立的扩散理论专著。章节顺序遵循“加噪和概率直觉 → 数学工具 → 完整 DDPM 离散流程（前向、训练、反向采样）→ Score Matching/DSM 及其代表性论文（解释 score 与 DDPM 噪声预测的联系）→ 连续时间推广（SDE、逐步讲解福克–普朗克密度演化、反向 SDE、PF-ODE 及参数化联系）→ DDIM 论文（提出替代采样路径）”。避免先讲完 DDPM/DDIM 后再重复推导 DDPM；每个概念只在主线中引入一次，后文通过回指建立联系。对于关键公式：
- 先解释每个变量、时间方向和参数化，再写公式和中间推导。
- 明确 VP、VE 或 EDM 等不同参数化不可混用系数；先选定主线约定，并在必要处给换算表。
- 说明 DSM 的条件 score 与边缘 score 的关系；Tweedie 公式在高斯扰动假设下给出条件均值估计。
- 反向 SDE 和 PF-ODE 的陈述应带必要条件/来源；二者共享时间边缘分布，不等于逐条轨迹相同。
- DDPM 的 ELBO 加权目标与实践常用简化噪声 MSE 要区分；DDIM 作为不同采样路径讲解，不将其描述成任意 SDE 的直接 ODE 化。
- 朗之万动力学和退火通过 DAPS 作延伸案例；明确 DAPS 属于逆问题后验采样方法，不把其算法混同于基础 DDPM。

## 配图与事实核验

优先制作少量自绘示意：二维螺旋点云随噪声尺度变化的前向扰动与反向分布生成（参考用户提供视频及 JiT 玩具数据图）、score 与密度关系、SDE/PF-ODE 边缘分布对照、视频时空注意力或块生成示意。点明前向扰动可用布朗运动/高斯扩散作直觉，但反向生成不是逐条轨迹的时钟倒放，而是学习逆向随机过程以恢复数据分布。任何步数、速度、质量数值和模型能力声明都应回到原论文/官方技术报告核验；`T=1000` 只能作为原始 DDPM 的常见实验设置示例，不泛化为固定配置。草稿阶段不生成 HTML、不发布。

## 决策与边界

- `video-generation` 是统筹这份持续迭代学习笔记的唯一 change；扩散基础是其中一部分，不另建子 change。
- 结构采用递进式知识章节，不采用论文深读或研究提案模板；具体论文按需作为章节案例。
- DDPM/DDIM 之后先解释条件生成及 CFG，再讲 CLIP、DALL·E 2 如何使用 CLIP 图像嵌入进行条件生成、Latent Diffusion/Stable Diffusion、ControlNet 与个性化适配（DreamBooth、LoRA），随后按早期时空卷积 → Imagen/Imagen Video → Video Diffusion Models/3D U-Net → Make-A-Video 级联生成 → 数据集的次序进入视频生成。DreamBooth 是个性化训练方法，LoRA 是参数高效适配方法，两者概念层级不同，可组合使用。
- 3D convolution 与 R(2+1)D 作为时空表征/视频网络基础讲解；若使用动作识别论文作例子，明确其任务不是视频生成。Video Diffusion Models 的 3D U-Net 和 Make-A-Video 的 cascade generation 作为特定代表架构介绍，不泛化为所有视频扩散模型的共同设计。
- 沿用现有草稿 frontmatter、slug 和 identity shift 等已有提纲；新增基础内容不得覆盖其身份或既有内容。
- Roam 笔记和 Awesome-Video-Diffusion paper list 只作个人学习素材/文献发现入口；事实、架构、数据与许可证均需回到论文或官方资料核验。MIT 课程笔记未定位前不得声称使用了该课程。
- 当前工作范围是规划与草稿，不生成发布版 HTML、不发布、不修改 Roam 原笔记。

## 风险与权衡

- Roam 中部分 SDE/score 推导注明不严谨；需要核对时间方向、`g(t)^2` 系数、变量缩放与定理条件。
- Tweedie 公式的系数随噪声参数化变化，且给出条件均值而非逐样本精确恢复。
- 视频生成范围较广，需控制每章深度：数学推导只展开理解模型训练和采样所需部分，架构与具体方法以代表性案例说明。
- MIT 课程笔记尚未定位；如后续仍找不到，明确来源边界而不臆造。
