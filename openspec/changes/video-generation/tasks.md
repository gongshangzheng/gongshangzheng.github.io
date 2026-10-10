## 1. 学习素材与路径核查

- [ ] 1.1 盘点现有 `drafts/video-generation.org` 的 frontmatter、身份字段与 identity shift、attention sink、persistent memory、longer contexts 提纲，确认更新时全部保留。
- [ ] 1.2 按 `design.md` 的章节顺序整理 Roam 素材：DDPM、DDIM、EDM、DAPS、DAPS++、Flow Matching 与扩散模型总笔记；记录可用章节和需纠错的推导。
- [ ] 1.2a 查看用户提供的扩散基础视频 `https://www.youtube.com/watch?v=iv-5mZ_9CPY`，记录可确认的标题/作者/时间及适合引用的基础概念；对公式和技术结论回查原始资料。
- [ ] 1.3 继续查找用户提到的 MIT 扩散课程笔记；若找不到，明确不把已有 Roam 笔记说成 MIT 课程材料。
- [ ] 1.4 阅读本地教程 PDF `~/MyDoc/数字人/CVPR2024 Video Diffusion Tutorial - Part 1 - Video Generation & Editing.pdf`，整理目录、相关章节与页码，标注其适用于任务地图、视频生成/编辑及架构知识的部分。
- [ ] 1.5 整理已有条件生成/图像扩散笔记：`CLIP.org`、`Stable Diffusion.org`、`ControlNet.org`、`DreamBooth.org`、`LoRA.org`、`Stable Diffusion 3.org`，标记各自覆盖的概念与需回查的公式/模型版本细节；核对 CLIP 图像差向量作为属性方向的示例边界，避免把直觉示意写成普遍保证。
- [ ] 1.5a 核查 DALL·E 2 原论文与 OpenAI 官方材料，确认 CLIP image embedding prior、扩散 decoder、prior 变体及 CLIP guidance 的流程；明确 CLIP 早于 DALL·E 2，且几种 guidance 术语不可混淆。
- [ ] 1.5b 核查 classifier guidance 与 classifier-free guidance 原论文：确认噪声条件分类器梯度、空类别/条件 dropout 训练、条件与无条件预测组合公式及 guidance scale 的权衡；避免把无条件方向描述成固定的流形中心向量。
- [ ] 1.6 从 `src/pages/slowfast-paper.html` 提取 3D convolution 与 R(2+1)D 的现有讲解；回查 R(2+1)D 原论文，明确其视频动作识别语境及对生成模型学习的帮助边界。
- [ ] 1.7 阅读本地 CVPR 2024 教程 PDF，定位早期视频模型、Video Diffusion Models/3D U-Net、Make-A-Video、视频任务与数据集等对应页码。
- [ ] 1.8 核查 Imagen、Imagen Video、*Video Diffusion Models* 与 Make-A-Video 原论文/官方材料，记录文本到图像先验、3D U-Net 组成、各自级联阶段及训练数据的差异。
- [ ] 1.8a 核查 ModelScopeT2V、Show-1、LaVie 原论文、官方代码仓库和模型卡，比较架构、数据、可用权重、推理配置和许可边界。
- [ ] 1.9 核验 WebVid-10M 数据集论文、数据集卡和许可说明，记录规模、样本字段、采集/筛选方式及已知局限；与评测集区分。
- [ ] 1.10 从 Show Lab 的 `https://github.com/showlab/Awesome-Video-Diffusion` paper list 发现并分类候选论文/开源基模；索引仅作发现入口，记录入选理由，并逐篇回查原论文、官方仓库/模型卡。
- [ ] 1.11 为视频生成其他架构、时间一致性与流式生成选取代表性原论文/官方资料，记录来源及其支撑章节，避免无依据的性能比较。

## 2. 数学与模型核验

- [ ] 2.1 核验 Score Matching 与 Denoising Score Matching 代表性原论文的准确出处、研究问题、目标函数与贡献边界；解释它们与 DDPM 噪声预测的联系，避免把方法脉络仅作为术语旁注。
- [ ] 2.1d 核验福克–普朗克方程的密度演化形式、漂移/扩散项含义及其与正向/反向 SDE 的关系，准备面向初学者的逐项解释和一维示例。
- [ ] 2.1a 核验 DDPM 中 `x_t`、完整噪声 ε、预测噪声 ε̂、隐式干净样本估计 x̂₀、反向均值及随机后验噪声的关系；区分训练时任意时刻的直接加噪与推理时反向链。
- [ ] 2.1b 核验 time-varying/marginal vector field 的定义、概率流 ODE、条件向量场到边缘向量场的关系；区分 score、扩散 probability-flow vector field 与 Flow Matching target velocity。
- [ ] 2.1c 在统一噪声参数化下对比 ε/x/v prediction 的代数换算、损失权重与尺度效应；避免声称某目标普遍优于其他目标。
- [ ] 2.2 核验 Tweedie 公式在所选高斯噪声参数化下的推导、适用条件与条件均值解释。
- [ ] 2.3 核验正向/反向 SDE、Fokker–Planck 与 Probability Flow ODE 的公式、时间方向、系数和假设；明确边缘分布相同不意味着随机轨迹相同，并确保第三节的 ODE/SDE 入门直觉与后文公式一致。
- [ ] 2.4 回查 DDPM 与 DDIM 原论文或可靠讲义，核准前向闭式、真实后验、ELBO 加权项、简化噪声预测目标及 DDIM 跨步更新。
- [ ] 2.4a 从 JiT 原论文定位二维/低维玩具数据图，确认图号、实验含义及可引用/重绘方式；结合用户给定视频设计螺旋点云的前向扰动与反向分布生成示意，避免把反向过程描述成逐点轨迹复原。
- [ ] 2.5 核验视频扩散架构与 Custom Forcing 等论文的技术描述、实验数值和结论，分清通用知识与单篇论文设定。

## 3. 草稿撰写

- [ ] 3.1 按 `design.md` 递进式章节规划更新 `drafts/video-generation.org`，从视频生成任务地图、生成模型与扩散直觉逐步进入数学基础和采样机制。
- [ ] 3.2 按主线讲清 DDPM → Score Matching/DSM 与 Tweedie → SDE/福克–普朗克/反向 SDE/PF-ODE → DDIM 的概念关系；逐步解释福克–普朗克方程各项含义，并回查 Score Matching/DSM 与 DDIM 的具体论文动机、方法和贡献；不要套用“核心问题与解法”论文模板。
- [ ] 3.3 DDPM/DDIM 之后补充条件生成、classifier guidance 与 CFG、CLIP、DALL·E 2、Latent Diffusion/Stable Diffusion、ControlNet、DreamBooth 与 LoRA；核验并解释 CFG 空条件训练和预测组合，以 DALL·E 2 连接 CLIP 图像表示与条件扩散生成；不将 CLIP 等同于生成器、混淆 guidance 方法或将 DreamBooth 与 LoRA 混为同类方法。
- [ ] 3.4 按知识递进介绍早期视频生成与时空建模（3D convolution、R(2+1)D）、Imagen/Imagen Video、Video Diffusion Models 的 3D U-Net、Make-A-Video 的级联生成、视频训练数据集（含 WebVid-10M）及开源基模（ModelScopeT2V、Show-1、LaVie）。明确区分动作识别架构先例与生成模型，且不把代表性论文架构泛化为统一设计。
- [ ] 3.5 接着讲视频任务、后续表示/架构、时间一致性与长程依赖、自回归/流式生成；将 Custom Forcing 作为建立通用机制之后的案例。
- [ ] 3.6 保留现有 frontmatter 和身份信息，以及 identity shift、attention sink、persistent memory、longer contexts 提纲；在内容上将它们放入时间一致性/流式生成的知识脉络。
- [ ] 3.7 添加必要的术语表、章节衔接、二维螺旋点云扩散示意及其他必要插图和来源引用；草稿阶段不生成 HTML、不发布。

## 4. 复核

- [ ] 4.1 从初学者视角检查章节先修关系、概念引入顺序和解释是否连贯；确认没有突兀跳入论文细节或未定义术语。
- [ ] 4.2 逐式复核数学推导、下标、参数化与边界条件，特别检查 DDPM 后验/ELBO、Score Matching/DSM、Tweedie、福克–普朗克、反向 SDE/PF-ODE、ε/x/v prediction 和 DDIM 更新。
- [ ] 4.3 运行 `git diff --check` 并审阅差异；确认未改动 `src/pages/`、未发布、未修改 `~/org/roam` 原笔记，且保留草稿原有内容。
