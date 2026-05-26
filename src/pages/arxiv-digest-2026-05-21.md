---
title: "每日 arXiv 论文简报 · 2026-05-21"
description: "自动追踪 diffusion、autoregressive、image compression、1D visual tokenizer 与 diffusion visual encoder 方向的 arXiv 每日论文。"
date: 2026-05-21
created_at: 2026-05-21T10:00:00
updated_at: 2026-05-21T10:00:00
tags: ["arXiv", "论文", "AI", "视觉编码器"]
categories: [AI]
hero_title: "每日 arXiv 论文简报"
hero_sub: "2026-05-21 · diffusion · autoregressive · image compression · visual tokenizer"
hero_tagline: "自动追踪 · LLM 总览 · 研究雷达"
subcategory: ArXiv Digest
---


## Autoregressive


## 📋 每日总览

今日自回归方向的研究重点在于拓展视觉生成模型的复杂性与效率，涵盖了个性化组合生成、空间世界模型构建以及长视频生成基础设施优化。整体趋势表明，自回归架构正被应用于更复杂的场景（如全屋全景）和更长的序列（如长视频），同时通过算法创新解决持续学习和组合生成中的遗忘问题，并通过底层计算优化（如NVFP4）突破算力瓶颈。这些进展标志着自回归模型正从单一的图像生成向具备空间理解能力和长时序一致性的通用视觉模拟器演进。

**精选论文：**

*   **CPC-VAR**: 提出了视觉自回归模型中的持续个性化与组合生成方法，有效解决了模型在持续学习过程中保留旧知识并灵活组合新概念的难题。
*   **PanoWorld**: 构建了一个生成式空间世界模型，实现了高度一致的全屋全景合成，展示了自回归模型在复杂三维空间理解中的潜力。
*   **LongLive-2.0**: 通过引入NVFP4并行基础设施优化了长视频生成流程，在保证质量的同时显著降低了显存占用和计算成本，极具工程实用价值。



## [Junhao Li --- CPC-VAR:Continual Personalized and Compositional Generation in Visual Autoregressive Models](https://arxiv.org/abs/2605.19750)

- **链接**: [https://arxiv.org/abs/2605.19750](https://arxiv.org/abs/2605.19750)
- **ID**: oai:arXiv.org:2605.19750v1
- **分类**: autoregressive, cs.CV
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### CPC-VAR:Continual Personalized and Compositional Generation in Visual Autoregressive Models

**中文标题**: Cpc-var: 视觉自回归模型中的连续个性化和组成生成

**作者**: Junhao Li, Xinhao Zhong, Yi sun, Yuxia Qiao, Bin Chen, Shu-Tao Xia, Yaowei Wang

### 摘要
arXiv:2605.19750v1 Announce Type: new  Abstract: Visual autoregressive (VAR) models have recently emerged as an efficient paradigm for text-to-image generation. Despite their strong generative capability, existing VAR-based personalization methods remain limited to static settings, failing to accommodate evolving user demands. In particular, sequential concept learning leads to severe catastrophic forgetting, while multi-concept synthesis often suffers from feature entanglement and attribute inconsistency. In this work, we present the first systematic study of continual personalized generation in VAR models. We identify two key challenges: (i) preserving previously learned concepts during sequential customization, and (ii) composing multiple personalized concepts in a controllable manner. To address these issues, we propose a unified framework with two core components. For continual single-concept learning, we introduce Gradient-based Concept Neuron Selection (GCNS), which identifies concept-relevant neurons and constrains only conflicting parameters across tasks, effectively mitigating forgetting without additional model expansion. For multi-concept synthesis, we propose a context-aware composition strategy that performs multi-branch feature modeling and localized cross-attention fusion guided by spatial conditions, enabling precise and disentangled concept composition. Extensive experiments demonstrate that our method significantly improves performance in long-sequence continual personalization while achieving superior results in multi-concept image synthesis compared to existing baselines. These findings highlight the potential of VAR models for scalable and controllable personalized generation.

### 摘要（中文）
arXiv:2605.19750v1宣布类型: 新 摘要: 视觉自回归 (VAR) 模型最近成为文本到图像生成的有效范例。尽管它们具有强大的生成能力，但现有的基于VAR的个性化方法仍然仅限于静态设置，无法满足不断变化的用户需求。特别是，顺序概念学习会导致严重的灾难性遗忘，而多概念合成通常会遭受特征纠缠和属性不一致的困扰。在这项工作中，我们提出了VAR模型中连续个性化生成的第一个系统研究。我们确定了两个关键挑战 :( i) 在顺序定制期间保留先前学习的概念，以及 (ii) 以可控制的方式组成多个个性化概念。为了解决这些问题，我们提出了一个具有两个核心组件的统一框架。对于连续的单概念学习，我们引入了基于梯度的概念神经元选择 (GCNS)，它可以识别与概念相关的神经元，并仅约束跨任务的冲突参数，从而有效地减轻遗忘而无需额外的模型扩展。对于多概念合成，我们提出了一种上下文感知的合成策略，该策略在空间条件的指导下进行多分支特征建模和局部化的交叉注意融合，从而实现了精确和解开的概念合成。大量实验表明，与现有基线相比，我们的方法显着提高了长序列连续个性化的性能，同时在多概念图像合成中取得了卓越的结果。这些发现突出了VAR模型在可扩展和可控制的个性化生成方面的潜力。


## [Jinrang Jia --- PanoWorld: A Generative Spatial World Model for Consistent Whole-House Panorama Synthesis](https://arxiv.org/abs/2605.17916)

- **链接**: [https://arxiv.org/abs/2605.17916](https://arxiv.org/abs/2605.17916)
- **ID**: oai:arXiv.org:2605.17916v2
- **分类**: autoregressive, cs.CV
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### PanoWorld: A Generative Spatial World Model for Consistent Whole-House Panorama Synthesis

**中文标题**: PanoWorld：一种用于一致性全屋全景合成的生成式空间世界模型

**作者**: Jinrang Jia, Zhenjia Li, Yijiang Hu, Yifeng Shi

### 摘要
arXiv:2605.17916v2 Announce Type: replace  Abstract: Generating a consistent whole-house VR tour from a floorplan and style reference requires both photorealistic panoramas and cross-view spatial coherence. Pure 2D generators produce appealing single panoramas but re-imagine geometry and materials when the viewpoint changes, whereas monolithic 3D generation becomes expensive and loses fine texture at multi-room scale. We introduce PanoWorld, a generative spatial world model that treats whole-house synthesis as autoregressive generation of node-based 360-degree panoramas, matching the discrete navigation used by real VR tour products. PanoWorld uses a floorplan-derived 3D shell as a global geometric proxy and a dynamic 3D Gaussian Splatting cache as renderable spatial memory. A feed-forward panoramic LRM designed for metric-scale multi-room 360-degree inputs lifts generated panoramas into local 3DGS updates, while Room-aware Group Attention suppresses cross-room feature interference. A topology-aware progressive caching strategy fuses these local updates without repeatedly reconstructing the full history. By decoupling shell-based geometry guidance from cache-rendered visual memory, PanoWorld preserves high-frequency 2D synthesis quality while improving cross-node layout and material consistency. The project link is https://jjrcn.github.io/PanoWorld-project-home/

### 摘要（中文）
arXiv:2605.17916v2宣布类型: 更换 摘要：从平面图和风格参考生成连贯的全屋虚拟漫游，既需要照片级逼真的全景图像，又要求跨视角的空间一致性。纯2D生成器能够生成赏心悦目的全景图像，但在视角发生变化时会重新构想场景的几何与材质；而单体式3D生成则成本高昂，并且在多房间尺度下难以保留精细的纹理细节。我们提出了PanoWorld，这是一种生成式空间世界模型，它将全屋重建视为基于节点的360度全景图的自回归生成过程，与真实VR看房产品所采用的离散导航方式相一致。PanoWorld以基于平面图生成的三维壳体作为全局几何代理，并将动态的三维高斯泼溅缓存用作可渲染的空间记忆。一种面向度量尺度多房间360°输入的前馈式全景LRM，可将生成的全景图融入局部3DGS更新；同时，房间感知的分组注意力机制有效抑制跨房间特征干扰。一种拓扑感知的渐进式缓存策略能够在无需反复重建完整历史记录的情况下，融合这些局部更新。通过将基于外壳的几何体引导与缓存渲染的视觉记忆解耦，PanoWorld在提升跨节点布局与材质一致性的同时，仍能保持高频率的2D合成质量。项目链接为：https://jjrcn.github.io/PanoWorld-project-home/


## [Yukang Chen --- LongLive-2.0: An NVFP4 Parallel Infrastructure for Long Video Generation](https://arxiv.org/abs/2605.18739)

- **链接**: [https://arxiv.org/abs/2605.18739](https://arxiv.org/abs/2605.18739)
- **ID**: oai:arXiv.org:2605.18739v2
- **分类**: autoregressive, cs.CV, cs.DC, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### LongLive-2.0: An NVFP4 Parallel Infrastructure for Long Video Generation

**中文标题**: LongLive-2.0：面向长视频生成的NVFP4并行基础设施

**作者**: Yukang Chen, Luozhou Wang, Wei Huang, Shuai Yang, Bohan Zhang, Yicheng Xiao, Ruihang Chu, Weian Mao, Qixin Hu, Shaoteng Liu, Yuyang Zhao, Huizi Mao, Ying-Cong Chen, Enze Xie, Xiaojuan Qi, Song Han

### 摘要
arXiv:2605.18739v2 Announce Type: replace  Abstract: We present LongLive-2.0, an NVFP4-based parallel infrastructure throughout the full training and inference workflow of long video generation, addressing speed and memory bottlenecks. For training, we introduce sequence-parallel autoregressive (AR) training, instantiated as Balanced SP, which co-designs the efficient teacher-forcing layout with SP execution by pairing clean-history and noisy-target temporal chunks on each rank, enabling a natural teacher-forcing mask with SP-aware chunked VAE encoding. Combined with NVFP4 precision, it reduces GPU memory cost and accelerates GEMM computation during training, the proportion of which increases as video length grows. Moreover, we show that a high-quality infrastructure and dataset enable a remarkably clean training pipeline. Unlike existing Self-Forcing series methods that rely on ODE initialization and subsequent distribution matching distillation (DMD), LongLive-2.0 directly tunes a diffusion model into a long, multi-shot, interactive auto-regressive (AR) diffusion model. It can be further converted to real-time generation (4 to 2 denoising steps) with standalone LoRA weights. For inference on Blackwell GPUs, we enable W4A4 NVFP4 inference, quantize KV cache into NVFP4 for memory savings, and boost end-to-end throughput with asynchronous streaming VAE decoding. On non-Blackwell GPU architectures, we deploy SP inference to match the speed on Blackwell GPUs, while the quantized KV cache can lower inter-GPU communication of SP. Experiments show up to 2.15x speedup in training, and 1.84x in inference. LongLive-2.0-5B achieves 45.7 FPS inference while attaining strong performance on benchmarks. To our knowledge, LongLive-2.0 is the first NVFP4 training and inference system for long video generation.

### 摘要（中文）
arXiv:2605.18739v2宣布类型: 更换 摘要：我们提出了LongLive-2.0，这是一种基于NVFP4的并行化基础设施，覆盖长视频生成的完整训练与推理流程，有效解决了速度与显存瓶颈问题。在训练方面，我们提出了序列并行的自回归（AR）训练方法，并将其具体实现为Balanced SP。该方法通过在每个计算节点上将干净历史与噪声目标的时间块进行配对，协同设计高效的教师强制布局与序列并行执行策略，从而在序列并行感知的分块变分自编码器（VAE）编码中自然地引入教师强制掩码。结合NVFP4精度，可降低GPU显存开销，并加速训练过程中的GEMM计算；随着视频长度的增加，GEMM所占比例也随之提升。此外，我们证明，高质量的基础设施与数据集能够构建出一条极为顺畅的训练流水线。与现有依赖于常微分方程初始化及后续分布匹配蒸馏（DMD）的自力场系列方法不同，LongLive-2.0直接将扩散模型调优为一种长序列、多步采样、交互式的自回归（AR）扩散模型。借助独立的LoRA权重，它还可以进一步转化为实时生成（4步至2步去噪）。在Blackwell GPU上进行推理时，我们启用了W4A4 NVFP4推理模式，将KV缓存量化为NVFP4以节省显存，并通过异步流式VAE解码进一步提升端到端吞吐量。在非Blackwell架构的GPU上，我们采用单精度推理以达到与Blackwell架构GPU相当的性能；同时，量化后的键值缓存能够减少GPU间的通信开销。实验表明，训练速度最高可提升至2.15倍，推理速度最高可提升至1.84倍。LongLive-2.0-5B在基准测试中取得优异性能的同时，推理速度达到45.7 FPS。据我们所知，LongLive-2.0是首个用于长视频生成的NVFP4训练与推理系统。

## Diffusion


## 📋 每日总览

今日的扩散模型研究聚焦于效率提升、多模态扩展及安全性增强。在模型架构与采样方面，流匹配、稀疏混合专家及分层调度优化成为提升生成速度与质量的关键技术，特别是针对长视频生成的硬件级优化备受瞩目。应用层面，研究从静态图像向长视频、航空视频及 3D 几何生成深化，同时扩散模型在科学计算逆向设计中的应用展现了跨学科潜力。此外，版权保护与模型对齐成为重要议题，包括水印保持编辑技术及基于真实数据的对齐方法，旨在推动生成式 AI 的安全落地。

**精选论文推荐：**

*   **[Multi-Scale Generative Modeling with Heat Dissipation Flow Matching](https://arxiv.org/abs/2605.19371)**：提出了一种基于热耗散物理原理的流匹配方法，有效解决了多尺度生成中的模式崩溃与质量问题，为生成模型提供了新的理论视角。
*   **[LongLive-2.0: An NVFP4 Parallel Infrastructure for Long Video Generation](https://arxiv.org/abs/2605.18739)**：推出了面向长视频生成的 NVFP4 并行基础设施，通过底层优化显著降低了显存占用，提升了长视频生成的效率与稳定性。
*   **[When Preference Labels Fall Short: Aligning Diffusion Models from Real Data](https://arxiv.org/abs/2605.19839)**：针对传统偏好标签的局限性，提出了一种直接利用真实数据进行扩散模型对齐的新范式，提升了模型在真实场景中的表现。
*   **[Sparse Mixture-of-Experts Routing in Visual Diffusion Transformers](https://arxiv.org/abs/2605.19378)**：深入分析了视觉扩散 Transformer 中的稀疏混合专家路由机制，并提出了从路由崩溃到选择性死锁的解决方案，优化了大规模模型的推理效率。



## [Jinjin Zhang --- What Makes Synthetic Data Effective in Image Segmentation](https://arxiv.org/abs/2605.19289)

- **链接**: [https://arxiv.org/abs/2605.19289](https://arxiv.org/abs/2605.19289)
- **ID**: oai:arXiv.org:2605.19289v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### What Makes Synthetic Data Effective in Image Segmentation

**中文标题**: 是什么使合成数据在图像分割中有效

**作者**: Jinjin Zhang, Xiefan Guo, Yizhou Jin, Nan Zhou, Di Huang

### 摘要
arXiv:2605.19289v1 Announce Type: new  Abstract: Driven by rapid advances in large-scale generative models, synthetic data has emerged as a promising solution for visual understanding. While modern diffusion models achieve remarkable photorealistic image synthesis, their potential in complex visual segmentation tasks remains underexplored. In this work, we conduct a systematic analysis of synthetic images from state-of-the-art diffusion models to uncover the factors governing their utility. In particular, synthetic images characterized by dense scene composition and fine instance fidelity demonstrate distinctive benefits, yielding significantly more discriminative spatial representations. Building on these insights, we propose SENSE, a unified framework that leverages flexible and scalable synthetic data to substantially enhance segmentation performance. Notably, SENSE is model-agnostic, compatible with diverse architectures (e.g., DPT and Mask2Former), and scales effectively across models with varying parameter capacities. Extensive experiments on Cityscapes, COCO, and ADE20K validate the effectiveness and generalization capability of our approach. Code is available at https://github.com/zhang0jhon/SENSE.

### 摘要（中文）
arXiv:2605.19289v1宣布类型: 新 摘要: 在大规模生成模型的快速发展的推动下，合成数据已成为视觉理解的一种有前途的解决方案。尽管现代扩散模型实现了出色的真实感图像合成，但它们在复杂的视觉分割任务中的潜力仍未得到充分探索。在这项工作中，我们对来自最先进的扩散模型的合成图像进行了系统分析，以揭示控制其效用的因素。特别是，以密集的场景组成和精细的实例保真度为特征的合成图像表现出独特的优势，产生明显更具辨别力的空间表示。基于这些见解，我们提出了SENSE，这是一个统一的框架，它利用灵活且可扩展的合成数据来大幅提高细分性能。值得注意的是，SENSE是模型不可知的，与不同的架构 (例如，DPT和Mask2Former) 兼容，并且在具有不同参数容量的模型之间有效地缩放。在Cityscapes，COCO和ADE20K上进行的广泛实验验证了我们方法的有效性和泛化能力。代码可在 https://github.com/zhang0jhon/SENSE获得。


## [Jun Ma --- Multi-Scale Generative Modeling with Heat Dissipation Flow Matching](https://arxiv.org/abs/2605.19371)

- **链接**: [https://arxiv.org/abs/2605.19371](https://arxiv.org/abs/2605.19371)
- **ID**: oai:arXiv.org:2605.19371v1
- **分类**: cs.AI, cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Multi-Scale Generative Modeling with Heat Dissipation Flow Matching

**中文标题**: 基于热扩散流匹配的多尺度生成建模

**作者**: Jun Ma, Hanquan Zhang, Yanjun Qin, Haoyuan Guan, Ke Zhang

### 摘要
arXiv:2605.19371v1 Announce Type: new  Abstract: Diffusion models are widely used in image generation, with most relying on noise-based corruption and denoising. A distinct branch instead uses blur as the main corruption, preserving better color budgets and multi-scale detail by providing multi-scale priors. However, blur-based models remain in SDE-based frameworks and are not integrated into ODE-based frameworks, such as Flow Matching (FM). Meanwhile, in the blur-based formulation, the classical inverse heat-dissipation (IHD) process faces an ill-posed challenge. Moreover, under the data-manifold assumption, regressing blurred images from high-dimensional noise (or velocity) space is also difficult. We propose Heat Dissipation Flow Matching (HDFM), which introduces a continuous blurred (heat-dissipation) process into FM to inject multi-scale priors. HDFM aligns an interpolated heat-dissipation path to address ill-posedness and adopts $x$-prediction to mitigate high-dimensional regression difficulty. Toy experiments and ablation studies show that HDFM consistently benefits from both blur and $x$-prediction. The performance of HDFM outperforms most baseline methods on all datasets.

### 摘要（中文）
arXiv:2605.19371v1宣布类型: 新 摘要: 扩散模型在图像生成中应用广泛，其中大部分依赖于基于噪声的破坏和去噪。另一种截然不同的方法则以模糊作为主要的退化手段，通过引入多尺度先验，更好地保留了色彩信息并维持了多尺度细节。然而，基于模糊化的模型仍停留在基于随机微分方程的框架中，并未被整合到基于常微分方程的框架中，例如流匹配（FM）。与此同时，在基于模糊的表述中，经典的热扩散逆问题求解过程面临着不适定性难题。此外，在数据流形假设下，从高维噪声（或速度）空间中对模糊图像进行回归同样具有难度。我们提出了散热流匹配（HDFM），该方法在FM中引入了一个连续的模糊化（散热）过程，以注入多尺度先验信息。HDFM通过对插值后的散热路径进行配准来缓解病态问题，并采用基于自变量的预测机制以降低高维回归的难度。玩具实验和消融研究均表明，HDFM能够同时从模糊处理和 $x$ 预测中持续获益。HDFM在所有数据集上的性能均优于大多数基线方法。


## [Haiying Sha --- Sparse Mixture-of-Experts Routing in Visual Diffusion Transformers:Diagnosis, Boundary Calibration and Evolutionary Roadmap from Routing Collapse to Selective Deadlock](https://arxiv.org/abs/2605.19378)

- **链接**: [https://arxiv.org/abs/2605.19378](https://arxiv.org/abs/2605.19378)
- **ID**: oai:arXiv.org:2605.19378v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Sparse Mixture-of-Experts Routing in Visual Diffusion Transformers:Diagnosis, Boundary Calibration and Evolutionary Roadmap from Routing Collapse to Selective Deadlock

**中文标题**: 视觉扩散变压器中的稀疏专家混合路由: 从路由崩溃到选择性死锁的诊断，边界校准和进化路线图

**作者**: Haiying Sha

### 摘要
arXiv:2605.19378v1 Announce Type: new  Abstract: This paper systematically diagnoses the training failure modes of Token-Choice sparse Mixture-of-Experts (MoE) on video Diffusion Transformers. Starting from a pretrained dense model of about 5 billion parameters, we convert it into an MoE architecture following three laws: routed experts exactly clone the original FFN weights, shared experts are initialized to zero for verification and then to extremely small non-zero noise for actual training, while only the gating networks start from random initialization.   Experiments reveal a hierarchy of five failure modes: (1) linear routers suffer global soft saturation with complete expert homogenization; (2) MLP routers introduce selective deadlock, where roughly one-third of layers degenerate into a single-expert mode that cannot be prevented by increasing the auxiliary loss; (3) cross-attention routers exhibit preliminary self-recovery, yet about nine layers remain stubbornly deadlocked; (4) deadlocked layers display a U-shaped distribution, concentrated in shallow visual processing layers and deep semantic integration layers; (5) bfloat16 mixed precision causes tiny weight updates to be truncated to zero by hardware.   Based on routing decision time series over 65 million tokens across 5,000 training steps, we propose the Functional Redundancy Hypothesis: deadlock is a rational waiting strategy before the shared expert matures within the gate-shared expert-routed expert triadic system. This hypothesis is supported by the theory of functional redundancy in systems biology. On the engineering side, we summarize the Three Laws of dense-to-MoE conversion and provide a complete solution for the bfloat16 precision trap. We calibrate the current capability boundary of the Token-Choice paradigm and outline a three-step evolutionary roadmap from visual unification to a world model.

### 摘要（中文）
arXiv:2605.19378v1宣布类型: 新 相关文章 (15) 摘要系统地诊断了基于视频扩散变换器的令牌选择稀疏混合专家 (MoE) 训练失败模式。从大约50亿个参数的预训练密集模型开始，我们将其转换为遵循三个定律的MoE架构: 路由专家精确克隆原始FFN权重，共享专家初始化为零进行验证，然后初始化为极小的非零噪声进行实际训练，而只有门控网络从随机初始化开始。 实验揭示了五种故障模式的层次结构 :( 1) 线性路由器在完全专家同质化的情况下遭受全局软饱和; (2) MLP路由器引入选择性死锁，其中大约3分之1层退化为单专家模式，无法通过增加辅助损耗来防止；(3) 交叉注意路由器表现出初步的自我恢复，但仍有九层顽固地死锁; (4) 死锁层呈u型分布，集中在浅层视觉处理层和深层语义整合层；(5) bfloat16混合精度导致微小的权重更新被硬件截断为零。 基于跨5,000训练步骤在6500万个令牌上路由决策时间序列，我们提出了功能冗余假设: 死锁是在共享专家路由专家三方系统中共享专家成熟之前的合理等待策略。该假设得到了系统生物学中功能冗余理论的支持。在工程方面，我们总结了密集到MoE转换的三个定律，并为bfloat16精密阱提供了完整的解决方案。我们校准了令牌选择范式的当前能力边界，并概述了从视觉统一到世界模型的三步进化路线图。


## [Xiaodong Wu --- Are Watermarked Images Editable? SafeMark for Watermark-Preserving Text-Guided Image Editing](https://arxiv.org/abs/2605.19511)

- **链接**: [https://arxiv.org/abs/2605.19511](https://arxiv.org/abs/2605.19511)
- **ID**: oai:arXiv.org:2605.19511v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Are Watermarked Images Editable? SafeMark for Watermark-Preserving Text-Guided Image Editing

**中文标题**: 带水印的图像可编辑吗？用于保留水印的文本引导图像编辑的SafeMark

**作者**: Xiaodong Wu, Qi Li, Xiangman Li, Zelin Zhang, Lingshuang Liu, Jianbing Ni

### 摘要
arXiv:2605.19511v1 Announce Type: new  Abstract: This paper investigates a fundamental yet underexplored question: can watermarked images remain editable without compromising watermark integrity? We propose SafeMark, a framework for watermark-preserving text-guided image manipulation that explicitly integrates watermark integrity into the editing process. Specifically, SafeMark adds a thresholded watermark-decoding loss directly to the diffusion editor's training objective, fine-tuning the editor so that semantically valid edits also preserve the embedded watermark at the final output. This design admits a clean information-theoretic justification: maintaining high bit-accuracy on the edited image lower-bounds the mutual information that the editor channel preserves between watermark and edited output, the quantity that fundamentally controls watermark recoverability. SafeMark is compatible with differentiable diffusion-based editors, and requires no architectural modification. Extensive evaluations across multiple datasets, text-guided editing methods, and post-edit distortion settings demonstrate that SafeMark achieves high watermark bit accuracy across diverse editing settings while maintaining high-quality semantic edits, without sacrificing robustness to common post-edit distortions. These results demonstrate that semantic editability and watermark integrity are fundamentally compatible, enabling trustworthy image provenance in generative editing pipelines.

### 摘要（中文）
arXiv:2605.19511v1宣布类型: 新 摘要: 本文研究了一个基本但尚未被探索的问题: 水印图像是否可以在不损害水印完整性的情况下保持可编辑？我们提出了SafeMark，这是一个用于保留水印的文本引导的图像处理的框架，该框架将水印的完整性明确地集成到编辑过程中。具体来说，SafeMark将阈值化的水印解码损失直接添加到扩散编辑器的训练目标中，对编辑器进行微调，以使语义有效的编辑也在最终输出中保留嵌入的水印。此设计采用了清晰的信息论理由: 在编辑图像上保持较高的位精度，从而降低了编辑器通道在水印和编辑输出之间保留的互信息，即从根本上控制水印可恢复性的数量。SafeMark与可区分的基于扩散的编辑器兼容，并且不需要进行架构修改。跨多个数据集、文本引导编辑方法和编辑后失真设置的广泛评估表明，SafeMark在不同的编辑设置中实现了高水印位精度，同时保持了高质量的语义编辑，而不会牺牲对常见编辑后失真的鲁棒性。这些结果表明，语义可编辑性和水印完整性从根本上兼容，从而在生成式编辑管道中实现了值得信赖的图像出处。


## [Yunzhe Zhang --- Boosting Text-to-Image Diffusion Models via Core Token Attention-Based Seed Selection](https://arxiv.org/abs/2605.19532)

- **链接**: [https://arxiv.org/abs/2605.19532](https://arxiv.org/abs/2605.19532)
- **ID**: oai:arXiv.org:2605.19532v1
- **分类**: cs.CV, cs.LG, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Boosting Text-to-Image Diffusion Models via Core Token Attention-Based Seed Selection

**中文标题**: 通过基于核心令牌注意力的种子选择来提升文本到图像的扩散模型

**作者**: Yunzhe Zhang, Hongfu Liu, Pengyu Hong

### 摘要
arXiv:2605.19532v1 Announce Type: new  Abstract: Text-to-image diffusion models can synthesize high-quality images, yet the outcome is notoriously sensitive to the random seed: different initial seeds often yield large variations in image quality and prompt-image alignment. We revisit this "seed effect" and show that attention dynamics over prompt core tokens, the content-bearing words, measured during the first few denoising steps, strongly predict final generation quality. Building on this observation, we introduce Attention-Based Seed Selection (ABSS), a training-free, plug-and-play method that ranks seeds for a given prompt by leveraging cross-attention to core tokens during the denoising process. ABSS requires no finetuning and does not alter the initial noise; it scores and ranks all candidate seeds, keeps only the top-k for full generation, and discards the rest, without relying on a fixed accept/reject threshold. Operating purely at inference time, ABSS can serve as a lightweight pre-selection add-on for existing seed-optimization pipelines, enabling additional gains. Across three benchmarks, extensive experiments show that ABSS enables consistent improvements in text-image alignment and visual quality for Stable Diffusion variants, as corroborated by human preference and alignment metrics.

### 摘要（中文）
arXiv:2605.19532v1宣布类型: 新 摘要: 文本到图像扩散模型可以合成高质量的图像，但结果对随机种子非常敏感: 不同的初始种子通常会产生图像质量的较大变化和图像对齐。我们重新审视了这种 “种子效应”，并证明了在前几个去噪步骤中测得的提示核心令牌，即带有内容的单词的注意力动态，可以强烈预测最终的生成质量。在此观察的基础上，我们引入了基于注意力的种子选择 (ABSS)，这是一种无需训练的即插即用方法，通过在去噪过程中利用对核心令牌的交叉注意力来对给定提示的种子进行排序。ABSS不需要调整，并且不改变初始噪声; 它对所有候选种子进行评分和排名，仅保留前k个用于完整生成，并丢弃其余的，而不依赖于固定的接受/拒绝阈值。纯粹在推理时操作，abs可以用作现有种子优化管道的轻量级预选择附加组件，从而实现额外的收益。在三个基准测试中，广泛的实验表明，abs能够在稳定的扩散变体的文本图像对齐和视觉质量方面实现一致的改进，这一点得到了人类偏好和对齐指标的证实。


## [Yue Yu --- Self-Creative Text-to-Object Generation using Semantic-Aware Spatial Weighting](https://arxiv.org/abs/2605.19554)

- **链接**: [https://arxiv.org/abs/2605.19554](https://arxiv.org/abs/2605.19554)
- **ID**: oai:arXiv.org:2605.19554v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Self-Creative Text-to-Object Generation using Semantic-Aware Spatial Weighting

**中文标题**: 使用语义感知的空间加权的自创意文本到对象生成

**作者**: Yue Yu, Haibo Chen, Shuo Chen, Jian Yang, Jun Li

### 摘要
arXiv:2605.19554v1 Announce Type: new  Abstract: Instilling creativity in text-to-image (T2I) generation presents a significant challenge, as it requires synthesized images to exhibit not only visual novelty and surprise, but also artistic value. Current T2I models, however, are largely optimized for literal text-image alignment with their data distribution, and their noise prediction networks constrain the generation to high-probability regions, consequently generating outputs that lack authentic creativity. To address this, we propose a Self-Creative Diffusion (SCDiff) model for meaningful T2I generations featuring two core modules: a learnable spatial weighting (LSW) module and a visual-semantic mixing loss (VSML). The LSW module designs a parametric Kaiser-Bessel window to reinforce central image features, fostering novel and surprising generation. The VSML module introduces a dual loss function: a similarity loss constrains that the new images align with its textual description, while a diversity loss maximizes its distinction from the original image, enhancing both semantic value and visual novelty. Extensive experiments demonstrate that our model substantially improves creativity, semantic alignment, and visual coherence, offering a simple yet powerful framework for generating creative objects.

### 摘要（中文）
arXiv:2605.19554v1宣布类型: 新 摘要: 在文本到图像 (text-to-image，T2I) 的生成中灌输创造力是一个重大的挑战，因为它要求合成的图像不仅要表现出视觉上的新颖性和惊喜，而且还要表现出艺术价值。然而，当前的T2I模型在很大程度上针对文本-图像与其数据分布的对齐进行了优化，并且其噪声预测网络将生成限制在高概率区域，从而生成缺乏真实创造力的输出。为了解决这个问题，我们提出了一个有意义的T2I生成的自我创意扩散 (SCDiff) 模型，该模型具有两个核心模块: 一个可学习的空间加权 (LSW) 模块和一个视觉语义混合损失 (VSML)。LSW模块设计了一个参数化的kaiser-bessel窗口，以增强中心图像特征，从而促进新颖而令人惊讶的生成。VSML模块引入了双重损失函数: 相似性损失约束新图像与其文本描述对齐，而多样性损失最大化其与原始图像的区别，从而增强语义价值和视觉新颖性。大量实验表明，我们的模型大大提高了创造力，语义对齐和视觉连贯性，为生成创意对象提供了一个简单而强大的框架。


## [Prateeth Rao --- EpiDiffVO: Geometry-Aware Epipolar Diffusion for Robust Visual Odometry](https://arxiv.org/abs/2605.19556)

- **链接**: [https://arxiv.org/abs/2605.19556](https://arxiv.org/abs/2605.19556)
- **ID**: oai:arXiv.org:2605.19556v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### EpiDiffVO: Geometry-Aware Epipolar Diffusion for Robust Visual Odometry

**中文标题**: Epiffvo: 用于鲁棒视觉里程计的几何感知极线扩散

**作者**: Prateeth Rao

### 摘要
arXiv:2605.19556v1 Announce Type: new  Abstract: Estimating relative pose from image pairs fundamentally requires only a minimal subset of geometrically consistent correspondences. However, most learning-based approaches rely on dense matching or direct regression, leading to redundancy and reduced geometric interpretability. In this work, we propose a sparse epipolar matching framework that predicts a compact set of correspondences optimized for geometric consistency across varying temporal baselines. To address residual noise and misalignment, we introduce an epipolar diffusion process that models correspondence uncertainty and refines keypoints toward epipolar consistency. The refined correspondences, along with depth cues, are lifted into a graph representation forming a Steiner graph that encodes relational structure between points. A graph neural network learns a compact subset of informative correspondences, which are passed to a differentiable singular value decomposition solver for end-to-end geometric estimation. Relative pose is recovered from the resulting essential matrix and evaluated in a visual odometry setting on the TartanAir and KITTI SLAM datasets. Experimental results demonstrate that combining sparse matching, diffusion-based refinement, and graph-based subset selection reduces correspondence redundancy while maintaining robust pose estimation across challenging baselines.

### 摘要（中文）
arXiv:2605.19556v1宣布类型: 新 摘要: 从图像对中估计相对姿态从根本上只需要几何一致的对应关系的最小子集。然而，大多数基于学习的方法依赖于密集匹配或直接回归，导致冗余和降低的几何可解释性。在这项工作中，我们提出了一个稀疏的极线匹配框架，该框架预测了一组紧凑的对应关系，这些对应关系针对不同时间基线的几何一致性进行了优化。为了解决残留噪声和未对准问题，我们引入了一个对极扩散过程，该过程对对应不确定性进行了建模，并针对极一致性细化了关键点。细化的对应关系以及深度线索被提升到图形表示中，形成Steiner图，该Steiner图对点之间的关系结构进行编码。图形神经网络学习信息对应关系的紧凑子集，这些信息对应关系被传递给可微奇异值分解求解器以进行端到端几何估计。从生成的基本矩阵中恢复相对姿势，并在TartanAir和KITTI SLAM数据集上的视觉里程计设置中进行评估。实验结果表明，将稀疏匹配，基于扩散的细化和基于图形的子集选择相结合，可以减少对应冗余，同时在具有挑战性的基线中保持鲁棒的姿态估计。


## [Vineetha Joy --- Inverse Design of Metasurface based Absorbers using Physics Guided Conditional Diffusion Models](https://arxiv.org/abs/2605.19611)

- **链接**: [https://arxiv.org/abs/2605.19611](https://arxiv.org/abs/2605.19611)
- **ID**: oai:arXiv.org:2605.19611v1
- **分类**: cs.CV, cs.ET, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Inverse Design of Metasurface based Absorbers using Physics Guided Conditional Diffusion Models

**中文标题**: 使用物理指导的条件扩散模型对基于超表面的吸收器进行逆向设计

**作者**: Vineetha Joy, Jamshed Palai, Satwik Sahoo, Anshuman Kumar, Amit Sethi, Hema Singh

### 摘要
arXiv:2605.19611v1 Announce Type: new  Abstract: Inverse design of metasurfaces for specific electromagnetic responses requires generating geometries that satisfy stringent spectral constraints while maintaining manufacturability. Conventional design methodologies rely on iterative optimization routines using full wave simulations, which become extremely time consuming and computationally intensive for large design spaces. In addition, commonly employed generative approaches often exhibit limited conditional fidelity and the generated designs often contain fine or irregular features that are impractical to fabricate. In this regard, we propose a physics guided condition quality enhanced diffusion framework for the inverse design of metasurface based absorbers. Here, the conditioning information consisting of target reflection characteristics is integrated into the model using feature wise linear modulation (FiLM). Furthermore, to enforce adherence to target spectra, a pre trained surrogate EM simulator is embedded into the framework introducing physics aware regularization through spectrum level loss functions. The efficiency of the proposed model is demonstrated by generating practically realizable metasurfaces for different types of reflection characteristics in the frequency range of 2 to 18 GHz. The proposed framework achieves an average spectral mean squared error of 0.0006 and band alignment accuracy of 0.958 between the target spectra and the spectra produced by the generated designs, demonstrating high conditional accuracy. In addition, the model generates multiple geometries for the same condition, thereby providing diverse design alternatives to the engineer. The proposed model produces the suitable design in approximately 30 seconds, whereas the conventional approach can take several months under comparable computational resources. The efficiency of the model is also established via experimental measurements.

### 摘要（中文）
arXiv:2605.19611v1宣布类型: 新 摘要: 针对特定电磁响应的超表面的逆设计需要生成满足严格频谱约束同时保持可制造性的几何形状。传统的设计方法依赖于基于全波仿真的迭代优化流程，而在大规模设计空间中，这一过程会变得极其耗时且计算成本高昂。此外，常用的生成式方法往往在条件保真度方面表现有限，所生成的设计中常常包含难以实际制造的精细或不规则特征。为此，我们提出了一种基于物理引导的条件质量增强扩散框架，用于超表面吸波器的逆向设计。在此，通过特征逐维线性调制（FiLM）机制，将由目标反射特性构成的先验信息融入模型中。此外，为确保对目标频谱的严格遵循，框架中嵌入了一个预先训练的电磁仿真代理模型，并通过频谱级损失函数引入了物理感知正则化。通过在2至18 GHz频段内为不同类型的反射特性设计并制备出可实际实现的超表面，验证了所提出模型的高效性。所提出的框架在目标光谱与生成设计所对应的光谱之间实现了0.0006的平均光谱均方误差和0.958的波段对齐精度，表明其具有较高的条件生成精度。此外，该模型可针对同一工况生成多种几何方案，从而为工程师提供多样化的设计方案。所提出的模型在约30秒内即可生成合理的设计方案，而在同等计算资源条件下，传统方法则可能需要数月之久。该模型的效率也通过实验测定得到了验证。


## [Abdul Mohaimen Al Radi --- Aero-World: Action-Conditioned Aerial Video Generation from Inertial Controls](https://arxiv.org/abs/2605.19728)

- **链接**: [https://arxiv.org/abs/2605.19728](https://arxiv.org/abs/2605.19728)
- **ID**: oai:arXiv.org:2605.19728v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Aero-World: Action-Conditioned Aerial Video Generation from Inertial Controls

**中文标题**: Aero-World: 来自惯性控制的动作条件空中视频生成

**作者**: Abdul Mohaimen Al Radi, Kunyang Li, Yuzhang Shang, Mubarak Shah, Yu Tian

### 摘要
arXiv:2605.19728v1 Announce Type: new  Abstract: Foundation video models produce visually impressive results, but their use in embodied AI remains limited because they are primarily trained on natural language rather than low-level control signals. This limitation is especially pronounced for aerial flight, where motion occurs in unconstrained 6-DoF space and small errors in ego-motion can produce large trajectory drift. Generating aerial videos that follow fine-grained inertial actions can support scalable training and evaluation of aerial agents by providing a controllable proxy for real-world or expensive simulation data. To address this problem, we propose \textbf{Aero-World}, a method for converting a pretrained image-to-video diffusion model into a controllable aerial video generator. Aero-World injects sequences of translational acceleration and angular velocity into a pretrained latent diffusion transformer through an action-token stream. A frozen latent-space Physics Probe, trained independently on real video--IMU pairs, provides differentiable inertial-consistency supervision during LoRA finetuning while avoiding computationally expensive video decoding. We further propose \textbf{AeroBench}, a benchmark for evaluating whether generated drone videos adhere to low-level action signals. AeroBench uses Action Alignment Score (AAS) to measure agreement with commanded inertial actions and Physical Consistency Rate (PCR) to measure temporal motion stability. On AeroBench, Aero-World improves mean AAS from 57.7 to 63.6 over action-only finetuning and gives a stronger quality-control trade-off than AirScape, with lower FVD (596.5 vs. 1058.6), higher SSIM (0.595 vs. 0.505), and higher Flow-IMU correlation (0.44 vs. 0.20). These results suggest that frozen Physics Probe supervision is a practical mechanism for adapting pretrained video generators toward more action-aligned aerial motion.

### 摘要（中文）
arXiv:2605.19728v1宣布类型: 新 摘要: 基础视频模型产生了视觉上令人印象深刻的结果，但它们在具体人工智能中的使用仍然有限，因为它们主要是基于自然语言而不是低级控制信号进行训练的。这种限制对于空中飞行尤其明显，其中运动发生在不受约束的6自由度空间中，并且自我运动中的小误差会产生大的轨迹漂移。生成遵循细粒度惯性动作的空中视频可以通过为现实世界或昂贵的模拟数据提供可控代理来支持空中代理的可扩展训练和评估。为了解决这个问题，我们提出了 \ textbf{Aero-World}，一种将预训练的图像到视频扩散模型转换为可控的空中视频生成器的方法。Aero-World通过动作令牌流将平移加速度和角速度的序列注入到预先训练的潜在扩散变换器中。在真实视频-IMU对上独立训练的冻结的潜在空间物理探测器在LoRA精测期间提供了可区分的惯性一致性监督，同时避免了计算上昂贵的视频解码。我们进一步提出了 \ textbf{AeroBench}，这是一个评估生成的无人机视频是否符合低级动作信号的基准。AeroBench使用动作对齐得分 (AAS) 来测量与命令的惯性动作的一致性，并使用物理一致性率 (PCR) 来测量时间运动稳定性。在AeroBench上，Aero-World将平均AAS从57.7提高到63.6，而不是仅进行动作的精细调节，并提供比AirScape更强的质量控制权衡，具有较低的FVD (596.5 vs. 1058.6)，较高的SSIM (0.595 vs. 0.505)，和更高的流量-IMU相关性 (0.44 vs. 0.20)。这些结果表明，冻结的物理探针监督是一种实用的机制，可使预训练的视频生成器适应更多与动作对齐的空中运动。


## [Hyunsoo Han --- LIFT and PLACE: A Simple, Stable, and Effective Knowledge Distillation Framework for Lightweight Diffusion Models](https://arxiv.org/abs/2605.19729)

- **链接**: [https://arxiv.org/abs/2605.19729](https://arxiv.org/abs/2605.19729)
- **ID**: oai:arXiv.org:2605.19729v1
- **分类**: cs.AI, cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### LIFT and PLACE: A Simple, Stable, and Effective Knowledge Distillation Framework for Lightweight Diffusion Models

**中文标题**: LIFT与PLACE：一种简单、稳定且有效的轻量化扩散模型知识蒸馏框架

**作者**: Hyunsoo Han, Sangyeop Yeo, Jaejun Yoo

### 摘要
arXiv:2605.19729v1 Announce Type: new  Abstract: We demonstrate that in knowledge distillation for diffusion models, the teacher network's highly complex denoising process - stemming from its substantially larger capacity - poses a significant challenge for the student model to faithfully mimic. To address this problem, we propose a coarse-to-fine distillation framework with LInear FiTtingbased distillation (LIFT) and Piecewise Local Adaptive Coefficient Estimation (PLACE). First, LIFT decomposes the objective into a "coarse" alignment and a "fine" refinement. The student is then trained on coarse alignment before proceeding to hard refinement. Second, PLACE extends LIFT to address spatially non-uniform errors by partitioning outputs into error-based groups, providing locally adaptive guidance. Our experiments show that LIFT and PLACE is effective across diffusion spaces (image/latent), backbones (U-Net/DiT), tasks (unconditional/conditional), datasets, and even extends to flow-based models such as MMDiT (SD3). Furthermore, under extreme compression with a 1.3M-parameter student (only 1.6% of the teacher), conventional KD fails to provide sufficient guidance for stable training, with FID scores often degrading to 50-200+, but our method remains stably convergent and achieves an FID of 15.73.

### 摘要（中文）
arXiv:2605.19729v1宣布类型: 新 摘要: 我们证明了在扩散模型的知识蒸馏中，教师网络的高度复杂的去噪过程-源于其更大的容量-对学生模型的忠实模仿提出了重大挑战。为解决这一问题，我们提出了一种基于线性拟合蒸馏（LIFT）与分段局部自适应系数估计（PLACE）的由粗到精的蒸馏框架。首先，LIFT将目标任务分解为“粗略”对齐和“精细”优化两个阶段。随后，该学生将在进行精细化调整之前接受粗略配准的训练。其次，PLACE将LIFT扩展至能够处理空间非均匀误差的场景，通过将输出划分为基于误差的若干组，从而提供局部自适应的指导。我们的实验表明，LIFT和PLACE在不同的扩散空间（图像空间与潜在空间）、骨干网络（U-Net与DiT）、任务类型（无条件生成与条件生成）、数据集上均表现出良好的效果，并且其适用性还可扩展至基于流的模型，如MMDiT（SD3）。此外，在参数量仅为教师模型1.6%的130万参数学生模型的极端压缩条件下，传统知识蒸馏难以提供足以支撑稳定训练的有效指导，FID指标往往恶化至50—200+；而我们的方法则保持稳定的收敛性，并取得了15.73的FID值。


## [Hyojun Go --- Stitched Value Model for Diffusion Alignment](https://arxiv.org/abs/2605.19804)

- **链接**: [https://arxiv.org/abs/2605.19804](https://arxiv.org/abs/2605.19804)
- **ID**: oai:arXiv.org:2605.19804v1
- **分类**: cs.AI, cs.CV, cs.LG, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Stitched Value Model for Diffusion Alignment

**中文标题**: 用于扩散对齐的缝合价值模型

**作者**: Hyojun Go, Hyungjin Chung, Prune Truong, Goutam Bhat, Li Mi, Zhaochong An, Zixiang Zhao, Dominik Narnhofer, Serge Belongie, Federico Tombari, Konrad Schindler

### 摘要
arXiv:2605.19804v1 Announce Type: new  Abstract: For practical use, diffusion- or flow-based generative models must be aligned with task-specific rewards, such as prompt fidelity or aesthetic preference. That alignment is challenging because the reward is defined for clean output images, but the alignment procedure requires value function estimates at noisy intermediate latents. Existing methods resort to Tweedie-style or Monte Carlo approximations, trading off estimator bias against computational cost: Tweedie estimates are efficient but biased, while Monte Carlo estimates are more accurate but require expensive rollouts. A natural alternative would be a learned value function, but it remains an open question how to effectively train a strong and general value model specifically for noisy latents. Here, we propose StitchVM, a model stitching framework that efficiently transfers reward models pretrained for clean images to the noisy latent regime. StitchVM starts from an existing, truncated pixel-space reward model and attaches a frozen diffusion backbone to it as its head. From the pixel-space model, the resulting hybrid retains a carefully pretrained, robust reward capability; from the diffusion backbone, it inherits its native ability to handle noisy latents. The stitching procedure is exceptionally lightweight, e.g., stitching and finetuning CLIP ViT-L and SD 3.5 Medium takes only 10 GPU-hours. By lifting powerful pixel-space reward models to latent space, StitchVM opens up a new style of diffusion alignment: instead of rough, yet costly per-sample approximation of the value function, the correct function for the actual, noisy latents is constructed once and then amortized over many samples and iterations. We show that this approach yields improvements across a broad range of downstream steering and post-training methods: DPS becomes $3.2\times$ faster while halving peak GPU memory, and DiffusionNFT becomes $2.3\times$ faster.

### 摘要（中文）
arXiv:2605.19804v1宣布类型: 新 摘要: 对于实际使用，基于扩散或流的生成模型必须与特定于任务的奖励保持一致，例如提示保真度或审美偏好。这种对齐过程颇具挑战，因为奖励是针对干净的输出图像定义的，而对齐步骤却需要在带有噪声的中间潜在表示上进行价值函数估计。现有方法通常采用Tweedie估计或蒙特卡罗近似，从而在估计偏差与计算成本之间进行权衡：Tweedie估计效率较高但存在偏差，而蒙特卡罗估计更为精确，但需要代价高昂的模拟回放。一种自然的替代方案是采用学习得到的价值函数，但如何针对具有噪声的隐变量有效地训练出一个性能优异且具备良好泛化能力的价值模型，仍是一个尚未解决的问题。在此，我们提出了StitchVM——一个模型拼接框架，能够将为干净图像预训练的奖励模型高效地迁移至噪声潜空间域。StitchVM以一个现有的、经过截断的像素空间奖励模型为基础，并在其顶部接入一个冻结的扩散模型主干作为其头部。在像素空间模型的基础上，该混合模型保留了经过精心预训练的稳健奖励能力；而在扩散模型的骨干架构层面，它继承了原生处理噪声潜在表示的能力。拼接过程极为轻量，例如，对CLIP ViT-L和SD 3.5 Medium进行拼接与微调仅需10个GPU小时。通过将强大的像素空间奖励模型提升至潜在空间，StitchVM开辟了一种全新的扩散对齐范式：不再采用粗略但代价高昂的逐样本价值函数近似，而是仅需一次性构建适用于真实、含噪潜在变量的精确价值函数，并将其分摊到大量样本与迭代过程中。我们证明，该方法能够在多种下游调控与后训练技术上带来性能提升：DPS的加速倍数达到3.2倍，同时将峰值显存用量降低一半；而DiffusionNFT的加速倍数则为2.3倍。


## [Weiyan Chen --- When Preference Labels Fall Short: Aligning Diffusion Models from Real Data](https://arxiv.org/abs/2605.19839)

- **链接**: [https://arxiv.org/abs/2605.19839](https://arxiv.org/abs/2605.19839)
- **ID**: oai:arXiv.org:2605.19839v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### When Preference Labels Fall Short: Aligning Diffusion Models from Real Data

**中文标题**: 当偏好标签不足时: 根据实际数据调整扩散模型

**作者**: Weiyan Chen, Weijian Deng, Yao Xiao, Weijie Tu, ZiYi Dong, Ibrahim Radwan, Liang Lin, Pengxu Wei

### 摘要
arXiv:2605.19839v1 Announce Type: new  Abstract: Preference alignment aims to guide generative models by learning from comparisons between preferred and non-preferred samples. In practice, most existing approaches rely on preference pairs constructed from model-generated images. Such supervision is inherently relative and can be ambiguous when both samples exhibit artifacts or limited visual quality, making it difficult to infer what constitutes a truly desirable output. In this work, we investigate whether real data can serve as an alternative source of supervision for preference alignment. We adopt a data-centric perspective and study a curation strategy that treats real images as reference points and constructs preference signals by contrasting them with generated or perturbed samples, without requiring manually annotated preference pairs. Through empirical analysis, we show that real-data-based supervision provides effective guidance for aligning diffusion models and achieves performance comparable to existing preference-based methods. Our results suggest that real data offers a practical and complementary source of supervision for preference alignment and highlight directions of label-efficient alignment strategies. Code and models are available at https://cwyxx.github.io/RealAlign.

### 摘要（中文）
arXiv:2605.19839v1宣布类型: 新 摘要: 偏好对齐旨在通过从偏好和非偏好样本之间的比较中学习来指导生成模型。在实践中，大多数现有方法都依赖于由模型生成的图像所构建的偏好对。此类监督本质上具有相对性，当两个样本均存在伪影或视觉质量欠佳时，其含义往往模糊不清，从而难以推断何为真正理想的输出。在本研究中，我们探讨真实数据是否可作为偏好对齐的替代性监督信号。我们从数据驱动的视角出发，研究了一种内容遴选策略：以真实图像为参照基准，通过将其与生成样本或扰动样本进行对比来构建偏好信号，而无需人工标注的偏好对。通过实证分析，我们表明，基于真实数据的监督为扩散模型的对齐提供了有效的指导，并取得了与现有偏好驱动方法相当的性能。我们的研究结果表明，真实数据为偏好对齐提供了一种实用且互补的监督来源，并指出了标签高效型对齐策略的发展方向。代码和模型位于https:// cwyxx.github.io/RealAlign。


## [Yan-Ting Chen --- Landscape-Awareness for Geometric View Diffusion Model](https://arxiv.org/abs/2605.19865)

- **链接**: [https://arxiv.org/abs/2605.19865](https://arxiv.org/abs/2605.19865)
- **ID**: oai:arXiv.org:2605.19865v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Landscape-Awareness for Geometric View Diffusion Model

**中文标题**: 几何视图扩散模型的景观感知

**作者**: Yan-Ting Chen, Hao-Wei Chen, Tsu-Ching Hsiao, Chun-Yi Lee

### 摘要
arXiv:2605.19865v1 Announce Type: new  Abstract: Accurate camera viewpoint estimation under sparse-view conditions remains challenging, particularly in two-view scenarios. Recent approaches leverage diffusion models such as Zero123 to synthesize novel views conditioned on relative viewpoint, showing promising results when repurposed for viewpoint estimation via optimization with MSE loss. However, existing methods often suffer from nonconvex loss landscape with numerous local minima, making them sensitive to initialization and reliant on naive multistart strategies. We analyze these optimization challenges and visualize failure cases, showing that geometric ambiguities, such as symmetry and self-similarity, can mislead gradient-based updates toward incorrect viewpoints. To address these limitations, we propose a score-based method that reshapes the optimization landscape to guide updates toward the ground-truth viewpoint, followed by a refinement stage using a viewpoint-conditioned diffusion model. Experiments show that our method improves convergence, reduces reliance on brute-force sampling, and achieves competitive accuracy with higher sample-efficiency.

### 摘要（中文）
arXiv:2605.19865v1宣布类型: 新 摘要: 在稀疏视图条件下，准确的相机视点估计仍然具有挑战性，尤其是在两视图场景中。近年来，一些方法利用如Zero123之类的扩散模型，在给定相对视角条件下的情况下合成新视角，并在通过均方误差损失进行优化以用于视角估计时取得了令人鼓舞的成果。然而，现有方法通常面临具有大量局部极小值的非凸损失景观，这使得它们对初始化较为敏感，并且依赖于朴素的多起点策略。我们对这些优化难题进行了分析，并可视化了失败案例，结果表明，诸如对称性和自相似性之类的几何歧义会误导基于梯度的参数更新，使其收敛到错误的视角。为克服这些局限性，我们提出了一种基于得分的优化方法，通过重塑优化景观来引导参数更新逼近真实视角，随后再利用一个视角条件扩散模型进行精化。实验结果表明，所提方法能够加速收敛、降低对暴力采样的依赖，并在样本效率更高的情况下达到与现有方法相当的精度。


## [Qing Zhang --- Structural Energy Guidance for View-Consistent Text-to-3D Generation](https://arxiv.org/abs/2605.19876)

- **链接**: [https://arxiv.org/abs/2605.19876](https://arxiv.org/abs/2605.19876)
- **ID**: oai:arXiv.org:2605.19876v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Structural Energy Guidance for View-Consistent Text-to-3D Generation

**中文标题**: 用于视图一致Text-to-3D生成的结构能量指导

**作者**: Qing Zhang, Jinguang Tong, Jing Zhang, Jie Hong, Xuesong Li

### 摘要
arXiv:2605.19876v1 Announce Type: new  Abstract: Text-to-3D generation based on diffusion models often suffers from the Janus problem, leading to inconsistent geometry across viewpoints. This work identifies viewpoint bias in 2D diffusion priors as the main cause and proposes Structural Energy-Guided Sampling (SEGS), a training-free and plug-and-play framework to improve multi-view consistency. SEGS constructs a structural energy in the PCA subspace of U-Net features and injects its gradient into the denoising process. It can be easily integrated into SDS/VSD pipelines without retraining. Experiments show that SEGS reduces the Janus Rate by about 10% on average and improves View-CS scores across multiple baselines, including DreamFusion, Magic3D, and LucidDreamer. This method effectively alleviates viewpoint artifacts while preserving appearance fidelity, providing a flexible solution for high-quality text-to-3D content generation.

### 摘要（中文）
arXiv:2605.19876v1宣布类型: 新 摘要: 基于扩散模型的Text-to-3D生成经常遇到Janus问题，导致视点之间的几何结构不一致。本研究将二维扩散先验中的视角偏差确定为主要原因，并提出了一种无需训练、即插即用的结构能量引导采样（SEGS）框架，以提升多视角一致性。SEGS在U-Net特征的主成分分析子空间中构建了一种结构能量，并将其梯度注入到去噪过程中。它无需重新训练即可轻松集成到SDS/VSD工作流中。实验结果表明，SEGS平均可将Janus率降低约10%，并在包括DreamFusion、Magic3D和LucidDreamer在内的多个基线上提升View-CS指标。该方法在保持外观保真度的同时，有效缓解了视角伪影问题，为高质量的文本到三维内容生成提供了一种灵活的解决方案。


## [Dongli Wu --- Feed-Forward Gaussian Splatting from Sparse Aerial Views](https://arxiv.org/abs/2605.19949)

- **链接**: [https://arxiv.org/abs/2605.19949](https://arxiv.org/abs/2605.19949)
- **ID**: oai:arXiv.org:2605.19949v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Feed-Forward Gaussian Splatting from Sparse Aerial Views

**中文标题**: 来自稀疏鸟瞰图的前馈高斯splating

**作者**: Dongli Wu, Zhuoxiao Li, Tongyan Hua, Yinrui Ren, Xiaobao Wei, Rongjun Qin, Wufan Zhao

### 摘要
arXiv:2605.19949v1 Announce Type: new  Abstract: Reconstructing large-scale urban scenes from sparse aerial views is a crucial yet challenging task. Due to biased top-down and shallow-oblique camera poses, sparse aerial captures exhibit strong evidence imbalance: roofs and open regions are repeatedly observed, while facades, distant buildings, and occluded structures receive little multi-view support. Existing feed-forward 3D Gaussian Splatting methods directly regress a deterministic representation from sparse inputs, but this often leads to ghosting, melted facades, and stretched textures. Recent pseudo-view and video-based generative reconstruction methods use additional supervision or generative priors. However, they often lack a clear separation between observed geometry and prior-driven content, which can lead to plausible but inconsistent structures. We propose AnyCity, an observation-grounded generative reconstruction framework for sparse aerial urban scenes. AnyCity first predicts an observation-supported geometry latent to anchor reliable structures, and then uses scaffold-conditioned aerial completion tokens to predict a gated residual update for weakly constrained content before Gaussian decoding. During training, dense-to-sparse distillation transfers structural cues from dense-view reconstruction, while an aerial-adapted video diffusion prior provides fine-grained urban appearance cues through gated token conditioning. Observation-preserving objectives keep the refined representation consistent with input-supported geometry. At inference time, AnyCity reconstructs the final 3D Gaussian scene from sparse aerial views in a single feed-forward pass, achieving coherent urban novel-view synthesis with second-level inference. Experiments on synthetic, aerial-domain, UAV-textured, and real-world scenes show consistent improvements over feed-forward baselines.

### 摘要（中文）
arXiv:2605.19949v1宣布类型: 新 摘要: 从稀疏的鸟瞰图重建大规模的城市场景是一项至关重要但具有挑战性的任务。由于相机姿态多为自上而下或浅侧视角，稀疏的航拍数据普遍存在严重的类别不平衡问题：屋顶和开阔区域被反复观测到，而立面、远处建筑物以及被遮挡的结构则缺乏多视角的支撑。现有的前向传播3D高斯溅射方法直接从稀疏输入中回归出确定性表示，但这种方法往往会导致鬼影、立面模糊以及纹理拉伸等问题。近年来，基于伪视图和视频的生成式重建方法通常会引入额外的监督信号或先验约束。然而，它们往往未能在观测到的几何结构与先验驱动的语义内容之间实现清晰的分离，这可能导致生成看似合理但内在不一致的场景结构。我们提出了AnyCity，这是一种面向稀疏航空城市场景的、基于观测的生成式重建框架。AnyCity首先预测一种由观测数据支撑的几何潜在表示，以锚定可靠的结构；随后，在高斯解码之前，利用脚手架条件引导的空中补全标记来预测针对弱约束内容的门控残差更新。在训练过程中，稠密–稀疏蒸馏机制从稠密视图重建中迁移结构线索，而经空中场景适配的视频扩散先验则通过门控标记条件生成，提供细粒度的城市外观特征。观测保持型目标使精化后的表示与输入所支持的几何结构保持一致。在推理阶段，AnyCity通过一次前向传播，从稀疏的航拍视角重建出最终的三维高斯场景，从而在秒级推理时间内实现连贯的城市新视角合成。在合成场景、航拍场景、无人机纹理场景以及真实场景上的实验均表明，所提方法较前向传播基线取得了持续的性能提升。


## [E O Rodrigues --- X-Ray cardiac angiographic vessel segmentation based on pixel classification using machine learning and region growing](https://arxiv.org/abs/2605.20073)

- **链接**: [https://arxiv.org/abs/2605.20073](https://arxiv.org/abs/2605.20073)
- **ID**: oai:arXiv.org:2605.20073v1
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### X-Ray cardiac angiographic vessel segmentation based on pixel classification using machine learning and region growing

**中文标题**: 基于机器学习和区域生长的像素分类的x射线心脏血管造影血管分割

**作者**: E O Rodrigues, L O Rodrigues, J J Lima, D Casanova, F Favarim, E R Dosciatti, V Pegorini, L S N Oliveira, F F C Morais

### 摘要
arXiv:2605.20073v1 Announce Type: new  Abstract: This work proposes a pixel-classification approach for vessel segmentation in x-ray angiograms. The proposal uses textural features such as anisotropic diffusion, features based on the Hessian matrix, mathematical morphology and statistics. These features are extracted from the neighborhood of each pixel. The approach also uses the ELEMENT methodology, which consists of creating a pixel-classification controlled by region-growing where the result of the classification affects further classifications of pixels. The Random Forests classifier is used to predict whether the pixel belongs to the vessel structure. The approach achieved the best accuracy in the literature (95.48%) outperforming unsupervised state-of-the-art approaches.

### 摘要（中文）
arXiv:2605.20073v1宣布类型: 新 摘要: 本文提出了一种像素分类方法，用于x射线血管造影中的血管分割。该方案采用了各向异性扩散、基于海森矩阵的特征、数学形态学以及统计学等纹理特征。这些特征是从每个像素的邻域中提取的。该方法还采用了ELEMENT框架，其核心是构建一种基于区域生长的像素分类机制，其中分类结果会进一步影响后续像素的分类过程。随机森林分类器用于预测像素是否属于血管结构。该方法在现有文献中取得了最高的分类准确率（95.48%），优于现有的无监督最先进方法。


## [Parsa Esmati --- Probability-Conserving Flow Guidance](https://arxiv.org/abs/2605.20079)

- **链接**: [https://arxiv.org/abs/2605.20079](https://arxiv.org/abs/2605.20079)
- **ID**: oai:arXiv.org:2605.20079v1
- **分类**: cs.AI, cs.CV, cs.LG, diffusion, eess.IV
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Probability-Conserving Flow Guidance

**中文标题**: 概率守恒的流引导

**作者**: Parsa Esmati, Junha Hyung, Amirhossein Dadashzadeh, Jaegul Choo, Majid Mirmehdi

### 摘要
arXiv:2605.20079v1 Announce Type: new  Abstract: Diffusion and flow-based generative models dominate visual synthesis, with guidance aligning samples to user input and improving perceptual quality. However, Classifier-Free Guidance (CFG) and extrapolation-based methods are heuristic linear combinations of velocities/scores that ignore the generative manifold geometry, breaking probability conservation and driving samples off the learned manifold under strong guidance. We analyse guidance through the continuity equation and show its effect decomposes into a divergence term and a score-parallel term defined invariantly across parameterisations. We prove the divergence term blows up structurally as sampling approaches the data manifold, motivating a time-dependent schedule alongside score-parallel attenuation. The resulting plug-and-play rule, Adaptive Manifold Guidance (AdaMaG), bounds both terms at no additional inference cost. Finally, we show that most empirical heuristics for reducing saturation or improving generation quality correspond directly to the two terms in our decomposition. Across image generation benchmarks, AdaMaG improves realism, reduces hallucinations, and induces controlled desaturation in high-guidance regimes.

### 摘要（中文）
arXiv:2605.20079v1宣布类型: 新 摘要: 基于扩散和流的生成模型主导着视觉合成，指导将样本与用户输入对齐并提高感知质量。然而，无分类器引导（CFG）与基于外推的方法均采用启发式的速度/得分线性组合，忽略了生成流形的几何结构，导致概率守恒被破坏，并在强引导条件下使采样点偏离已学习的流形。我们通过连续性方程对指导项进行分析，并表明其效应可分解为一项散度项与一项与得分向量平行的项，且这两项在不同参数化下均具有不变性。我们证明了当采样逐渐逼近数据流形时，发散项在结构上会发散至无穷大，从而为同时采用时间依赖的调度策略与分数场并行衰减提供了理论依据。由此产生的即插即用规则——自适应流形引导（AdaMaG）——在不增加任何推理开销的情况下同时对这两个项进行约束。最后，我们证明，用于降低饱和度或提升生成质量的大多数经验启发式方法均与我们分解中的两项直接对应。在各项图像生成基准测试中，AdaMaG能显著提升图像的真实感、减少幻觉现象，并在高指导权重条件下实现可控的去饱和效果。


## [Keanu Nichols --- Multi-axis Analysis of Image Manipulation Localization](https://arxiv.org/abs/2605.20174)

- **链接**: [https://arxiv.org/abs/2605.20174](https://arxiv.org/abs/2605.20174)
- **ID**: oai:arXiv.org:2605.20174v1
- **分类**: cs.CV, cs.LG, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Multi-axis Analysis of Image Manipulation Localization

**中文标题**: 图像处理定位的多轴分析

**作者**: Keanu Nichols, Divya Appapogu, Giscard Biamby, Dina Bashkirova, Anna Rohrbach, Bryan A. Plummer

### 摘要
arXiv:2605.20174v1 Announce Type: new  Abstract: Advanced image editing software enables easy creation of highly convincing image manipulations, which has been made even more accessible in recent years due to advances in generative AI. Manipulated images, while often harmless, could spread misinformation, create false narratives, and influence people's opinions on important issues. Despite this growing threat, there is limited research on detecting advanced manipulations across different visual domains. Thus, we introduce Analysis Under Domain-shifts, qualIty, Type, and Size (AUDITS), a comprehensive benchmark designed for studying axes of analysis in image manipulation detection. AUDITS comprises over 530K images from two distinct sources (user and news photos). We curate our dataset to support analysis across multiple axes using recent diffusion-based inpaintings, spanning a diverse range of manipulation types and sizes. We conduct experiments under different types of domain shift to evaluate robustness of existing image manipulation detection methods. Our goal is to drive further research in this area by offering new insights that would help develop more reliable and generalizable image manipulation detection methods.

### 摘要（中文）
arXiv:2605.20174v1宣布类型: 新 摘要: 先进的图像编辑软件可以轻松创建高度令人信服的图像操作，近年来，由于生成性AI的进步，图像操作变得更加容易。被篡改的图像虽然往往无害，却可能传播虚假信息、制造错误叙事，并影响公众对重大议题的看法。尽管这一威胁日益加剧，但针对跨不同视觉域的高级操纵行为检测的研究仍十分有限。为此，我们提出了“域迁移下的分析：质量、类型与规模”（AUDITS），这是一个旨在研究图像篡改检测中各分析维度的综合性基准。AUDITS数据集包含来自两个不同来源（用户照片与新闻照片）的超过53万张图像。我们对数据集进行精心筛选，以支持基于近期扩散模型的图像修复技术在多个维度上的分析，涵盖多种类型的篡改及其不同的规模。我们在多种类型的领域迁移场景下开展实验，以评估现有图像篡改检测方法的鲁棒性。我们的目标是通过提供新的洞见，推动该领域的进一步研究，从而助力开发更加可靠且更具泛化能力的图像篡改检测方法。


## [NaHyeon Park --- TextBoost: Boosting Text Encoder for Personalized Text-to-Image Generation](https://arxiv.org/abs/2409.08248)

- **链接**: [https://arxiv.org/abs/2409.08248](https://arxiv.org/abs/2409.08248)
- **ID**: oai:arXiv.org:2409.08248v2
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### TextBoost: Boosting Text Encoder for Personalized Text-to-Image Generation

**中文标题**: TextBoost: 用于个性化文本到图像生成的增强文本编码器

**作者**: NaHyeon Park, Kunhee Kim, Hyunjung Shim

### 摘要
arXiv:2409.08248v2 Announce Type: replace  Abstract: In this paper, we introduce TextBoost, an efficient one-shot personalization approach for text-to-image diffusion models. Traditional personalization methods typically involve fine-tuning extensive portions of the model, leading to substantial storage requirements and slow convergence. In contrast, we propose selectively fine-tuning only the text encoder, significantly improving computational and storage efficiency. To preserve the original semantic integrity, we develop a novel causality-preserving adaptation mechanism. Additionally, lightweight adapters are employed to locally refine text embeddings immediately before their interaction with cross-attention layers, greatly enhancing the expressiveness of text embeddings with minimal computational overhead. Empirical evaluations across diverse concepts demonstrate that TextBoost achieves faster convergence and substantially reduces storage demands by minimizing the number of trainable parameters. Furthermore, TextBoost maintains comparable subject fidelity, superior text fidelity, and greater generation diversity compared to existing methods. We show that our proposed method offers an efficient, scalable, and practically applicable solution for high-quality text-to-image personalization, particularly beneficial in resource-constrained environments.

### 摘要（中文）
arXiv:2409.08248v2宣布类型: 更换 摘要: 在本文中，我们介绍了TextBoost，这是一种用于文本到图像扩散模型的高效一次性个性化方法。传统的个性化方法通常涉及对模型的大量部分进行微调，从而导致大量的存储需求和缓慢的收敛。相反，我们建议仅选择性地微调文本编码器，从而显着提高计算和存储效率。为了保持原始语义的完整性，我们开发了一种新颖的因果关系保持适应机制。此外，轻量级适配器被用来在文本嵌入与交叉关注层交互之前立即对其进行局部细化，从而以最小的计算开销大大增强了文本嵌入的表现力。跨不同概念的经验评估表明，TextBoost实现了更快的收敛，并通过最小化可训练参数的数量来大大降低存储需求。此外，与现有方法相比，TextBoost保持了可比的主题保真度，卓越的文本保真度和更大的生成多样性。我们表明，我们提出的方法为高质量的文本到图像个性化提供了一种有效，可扩展且实用的解决方案，在资源受限的环境中特别有益。


## [Fuyun Wang --- Distribution Prototype Diffusion Learning for Open-set Supervised Anomaly Detection](https://arxiv.org/abs/2502.20981)

- **链接**: [https://arxiv.org/abs/2502.20981](https://arxiv.org/abs/2502.20981)
- **ID**: oai:arXiv.org:2502.20981v3
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Distribution Prototype Diffusion Learning for Open-set Supervised Anomaly Detection

**中文标题**: 面向开放集监督异常检测的分布原型扩散学习

**作者**: Fuyun Wang, Tong Zhang, Yuanzhi Wang, Yide Qiu, Xin Liu, Xu Guo, Zhen Cui

### 摘要
arXiv:2502.20981v3 Announce Type: replace  Abstract: In Open-set Supervised Anomaly Detection (OSAD), the existing methods typically generate pseudo anomalies to compensate for the scarcity of observed anomaly samples, while overlooking critical priors of normal samples, leading to less effective discriminative boundaries. To address this issue, we propose a Distribution Prototype Diffusion Learning (DPDL) method aimed at enclosing normal samples within a compact and discriminative distribution space. Specifically, we construct multiple learnable Gaussian prototypes to create a latent representation space for abundant and diverse normal samples and learn a Schr\"odinger bridge to facilitate a diffusive transition toward these prototypes for normal samples while steering anomaly samples away. Moreover, to enhance inter-sample separation, we design a dispersion feature learning way in hyperspherical space, which benefits the identification of out-of-distribution anomalies. Experimental results demonstrate the effectiveness and superiority of our proposed DPDL, achieving state-of-the-art performance on 9 public datasets.

### 摘要（中文）
arXiv:2502.20981v3宣布类型: 替换 摘要：在开放集监督异常检测（OSAD）中，现有方法通常通过生成伪异常样本来弥补观测到的异常样本的匮乏，却忽视了正常样本的重要先验信息，从而导致判别边界的效果欠佳。为解决这一问题，我们提出了一种分布原型扩散学习（DPDL）方法，旨在将正常样本约束在一个紧凑且具有判别性的分布空间内。具体而言，我们构建了多个可学习的高斯原型，为丰富多样的正常样本构建一个潜在表示空间，并学习一条薛定谔桥，以促进正常样本向这些原型的扩散式迁移，同时将异常样本引导远离。此外，为了增强样本间的区分度，我们在超球面空间中设计了一种分散特征学习方法，这有助于识别分布外的异常。实验结果表明，所提出的DPDL具有良好的有效性和优越性，在9个公开数据集上均取得了当前最优的性能。


## [Taewon Kang --- Scene-Action Prompt Fusion for Coherent Text-to-Video Storytelling](https://arxiv.org/abs/2503.06310)

- **链接**: [https://arxiv.org/abs/2503.06310](https://arxiv.org/abs/2503.06310)
- **ID**: oai:arXiv.org:2503.06310v4
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Scene-Action Prompt Fusion for Coherent Text-to-Video Storytelling

**中文标题**: 场景动作提示融合，用于连贯的文本到视频讲故事

**作者**: Taewon Kang, Divya Kothandaraman, Ming C. Lin

### 摘要
arXiv:2503.06310v4 Announce Type: replace  Abstract: Generating coherent long-form video sequences from discrete text prompts remains challenging due to difficulties in maintaining temporal coherence, semantic consistency, and scene-action continuity across segments. We propose a novel storytelling framework that integrates scene and action prompts through dynamics-inspired prompt mixing. Our approach combines three key components: (i) a bidirectional time-weighted latent blending strategy that enforces temporal consistency between consecutive video segments, (ii) a dynamics-informed prompt weighting (DIPW) mechanism that adaptively balances scene and action prompts at each diffusion timestep based on CLIP-based alignment, narrative progression, and temporal smoothness, and (iii) a semantic action representation that encodes high-level action semantics to modulate transitions according to action similarity. Latent-space blending preserves spatial coherence within scenes, while time-weighted blending introduces bidirectional temporal constraints to prevent abrupt transitions. Together, these components enable fluid and coherent video narratives that faithfully reflect both scene context and action dynamics. Extensive experiments demonstrate that our method significantly outperforms baselines, producing temporally consistent and visually compelling long-form videos without any additional training, thereby bridging the gap between short clips and extended text-driven video storytelling.

### 摘要（中文）
arXiv:2503.06310v4宣布类型: 替换 摘要: 从离散文本提示生成连贯的长格式视频序列仍然具有挑战性，因为在保持时间一致性，语义一致性和场景动作连续性方面存在困难。我们提出了一种新颖的讲故事框架，该框架通过动态启发的提示混合来集成场景和动作提示。我们的方法结合了三个关键组成部分 :( i) 双向时间加权潜在混合策略，可强制执行连续视频片段之间的时间一致性; (ii) 动态通知提示加权 (DIPW) 机制，可在每个扩散时间步长自适应地平衡场景和动作提示基于基于剪辑的对齐，叙事进程和时间平滑度，以及 (iii) 一种语义动作表示，它对高级动作语义进行编码，以根据动作相似性来调节过渡。潜在空间混合保留了场景内的空间相干性，而时间加权混合引入了双向时间约束以防止突然过渡。这些组件共同实现了流畅和连贯的视频叙述，忠实地反映了场景背景和动作动态。广泛的实验表明，我们的方法显着优于基线，无需任何额外的培训即可产生时间一致且视觉上引人注目的长格式视频，从而弥合了短片和扩展的文本驱动视频讲故事之间的差距。


## [Shijun Shi --- One-to-All Animation: Alignment-Free Character Animation and Image Pose Transfer](https://arxiv.org/abs/2511.22940)

- **链接**: [https://arxiv.org/abs/2511.22940](https://arxiv.org/abs/2511.22940)
- **ID**: oai:arXiv.org:2511.22940v3
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### One-to-All Animation: Alignment-Free Character Animation and Image Pose Transfer

**中文标题**: 一对一动画: 无对齐角色动画和图像姿势转换

**作者**: Shijun Shi, Jing Xu, Zhihang Li, Chunli Peng, Xiaoda Yang, Lijing Lu, Kai Hu, Jiangning Zhang

### 摘要
arXiv:2511.22940v3 Announce Type: replace  Abstract: Recent advances in diffusion models have greatly improved pose-driven character animation. However, existing methods are limited to spatially aligned reference-pose pairs with matched skeletal structures. Handling reference-pose misalignment remains unsolved. To address this, we present One-to-All Animation, a unified framework for high-fidelity character animation and image pose transfer for references with arbitrary layouts. First, to handle spatially misaligned reference, we reformulate training as a self-supervised outpainting task that transforms diverse-layout reference into a unified occluded-input format. Second, to process partially visible reference, we design a reference extractor for comprehensive identity feature extraction. Further, we integrate hybrid reference fusion attention to handle varying resolutions and dynamic sequence lengths. Finally, from the perspective of generation quality, we introduce identity-robust pose control that decouples appearance from skeletal structure to mitigate pose overfitting, and a token replace strategy for coherent long-video generation. Extensive experiments show that our method outperforms existing approaches. The code and model are available at https://github.com/ssj9596/One-to-All-Animation.

### 摘要（中文）
arXiv:2511.22940v3宣布类型: 更换 摘要: 扩散模型的最新进展极大地改善了姿势驱动的角色动画。然而，现有方法限于具有匹配的骨架结构的空间对准的参考姿态对。处理参考姿态未对准仍未解决。为了解决这个问题，我们提出了一对一的动画，一个用于高保真角色动画和图像姿势转换的统一框架，用于任意布局的参考。首先，为了处理空间错位的参考，我们将训练重新定义为自我监督的画图任务，该任务将不同布局的参考转换为统一的遮挡输入格式。其次，为了处理部分可见参考，我们设计了用于综合身份特征提取的参考提取器。此外，我们整合了混合参考融合注意力，以处理不同的分辨率和动态序列长度。最后，从生成质量的角度来看，我们引入了身份鲁棒的姿态控制，该姿态控制将外观与骨架结构解耦以减轻姿态过度拟合，并引入了用于相干长视频生成的令牌替换策略。大量实验表明，我们的方法优于现有方法。代码和模型可在 https://github.com/ssj9596/一对一动画。


## [Wei Cao --- FreeOrbit4D: Training-Free Arbitrary Camera Redirection for Monocular Videos via Foreground-Complete 4D Reconstruction](https://arxiv.org/abs/2601.18993)

- **链接**: [https://arxiv.org/abs/2601.18993](https://arxiv.org/abs/2601.18993)
- **ID**: oai:arXiv.org:2601.18993v2
- **分类**: cs.AI, cs.CV, cs.GR, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### FreeOrbit4D: Training-Free Arbitrary Camera Redirection for Monocular Videos via Foreground-Complete 4D Reconstruction

**中文标题**: FreeOrbit4D：基于前景完整四维重建的单目视频无训练任意视角重定向方法

**作者**: Wei Cao, Hao Zhang, Fengrui Tian, Yulun Wu, Yingying Li, Shenlong Wang, Ning Yu, Yaoyao Liu

### 摘要
arXiv:2601.18993v2 Announce Type: replace  Abstract: Camera redirection aims to replay a dynamic scene from a single monocular video under a user-specified camera trajectory. However, large-angle redirection is inherently ill-posed: a monocular video captures only a narrow spatio-temporal view of a dynamic 3D scene, providing severely limited observations of the underlying 4D world. The key challenge is therefore to recover a complete and coherent representation from this limited input, with consistent geometry and motion. While recent diffusion-based methods achieve impressive visual generation quality, they often break down under large-angle viewpoint changes far from the original trajectory, where missing visual grounding leads to severe geometric ambiguity and temporal inconsistency. We present FreeOrbit4D, an effective training-free framework that tackles this ambiguity by recovering a foreground-complete 4D proxy as structural grounding for video generation. We obtain this proxy by decoupling foreground and background reconstructions: we unproject the monocular video into a static background and partial foreground point clouds in a unified global space, then use an object-centric multi-view diffusion model to synthesize multi-view images and reconstruct complete foreground point clouds in canonical object space. By aligning the canonical foreground point cloud to the global scene space via dense pixel-synchronized 3D-3D correspondences and projecting the foreground-complete 4D proxy onto target camera viewpoints, we provide geometric scaffolds that guide a conditional video diffusion model. Extensive experiments show that FreeOrbit4D produces more faithful and temporally coherent redirected videos under challenging large-angle trajectories, and our proxy further enables applications such as edit propagation and 4D data generation. Project page: https://freeorbit4d.vision.ischool.illinois.edu/

### 摘要（中文）
arXiv:2601.18993v2宣布类型: 替换 摘要: 摄像机重定向的目的是在用户指定的摄像机轨迹下从单个单目视频中重放动态场景。然而，大角度重定向本质上是一个病态问题：单目视频仅能捕捉动态三维场景的狭窄时空视域，对底层四维世界的观测极为有限。因此，关键挑战在于从这一有限的输入中恢复出具有连贯几何与运动的一致性完整表征。尽管近年来基于扩散的方法在图像生成质量上取得了令人瞩目的成果，但在远离原始视角轨迹的大角度视角变换下，这些方法往往会出现失效；此时，视觉定位的缺失会导致严重的几何歧义与时间上的不一致性。我们提出了FreeOrbit4D，这是一种高效的无训练框架，通过重建一个完整的四维前景代理作为视频生成的结构化基础，从而有效应对这一歧义问题。我们通过解耦前景与背景的重建来获得这一代理：首先将单目视频反投影至统一的全局坐标系中，得到静态背景点云与部分前景点云；随后，利用一种以目标为中心的多视角扩散模型，合成多视角图像，并在规范化的对象空间中重建完整的前景点云。通过利用稠密的像素同步3D‑3D对应关系，将规范化的前景点云配准到全局场景空间，并将完整的4D前景代理投影到目标相机视点上，我们构建了用于引导条件视频扩散模型的几何骨架。大量实验表明，在具有挑战性的大角度运动轨迹下，FreeOrbit4D能够生成更加逼真且时序一致的重定向视频；此外，我们的代理模型还支持诸如编辑传播和4D数据生成等应用。项目页面：https://freeorbit4d.vision.ischool.illinois.edu/


## [Shuoyan Wei --- Taming Real-World Space-Time Video Super-Resolution with One-Step Diffusion](https://arxiv.org/abs/2601.20308)

- **链接**: [https://arxiv.org/abs/2601.20308](https://arxiv.org/abs/2601.20308)
- **ID**: oai:arXiv.org:2601.20308v2
- **分类**: cs.CV, cs.GR, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Taming Real-World Space-Time Video Super-Resolution with One-Step Diffusion

**中文标题**: 利用一步扩散技术驯服真实世界时空视频超分辨率

**作者**: Shuoyan Wei, Feng Li, Chen Zhou, Runmin Cong, Yao Zhao, Huihui Bai

### 摘要
arXiv:2601.20308v2 Announce Type: replace  Abstract: Diffusion models have demonstrated exceptional success in video super-resolution (VSR), exhibiting powerful capabilities for generating fine-grained details. However, their potential for space-time video super-resolution (STVSR), which necessitates not only recovering realistic high-resolution visual content but also improving the frame rate with coherent temporal dynamics, remains largely underexplored. Moreover, existing STVSR methods predominantly address spatiotemporal upsampling under simple degradation assumptions, thus failing in real-world scenarios with complex unknown degradations. To address these challenges, we propose OSDEnhancer, the first framework that achieves robust STVSR in one-step diffusion. OSDEnhancer begins with a linear initialization to establish essential spatiotemporal structures and adapt the model for one-step reconstruction. It then applies a divide-and-conquer strategy, introducing the temporal coherence (TC) and texture enrichment (TE) LoRAs that progressively specialize in inter-frame dynamics modeling and fine-grained texture recovery, respectively, while collaborating during inference for enhanced overall performance. A bidirectional VAE decoder employs deformable recurrent blocks to leverage the multi-scale structure of the vanilla VAE, enhancing latent-to-pixel reconstruction through joint multi-scale deformable aggregation and inter-frame feature propagation. Experimental results demonstrate that the proposed method attains state-of-the-art performance with superior generalization in real-world scenarios. The code is available at https://github.com/W-Shuoyan/OSDEnhancer.

### 摘要（中文）
arXiv:2601.20308v2宣布类型: 替换 摘要: 扩散模型在视频超分辨率 (VSR) 中取得了非凡的成功，展示了生成细粒度细节的强大功能。然而，它们在时空视频超分辨率 (STVSR) 方面的潜力仍然很大程度上未被开发，这不仅需要恢复逼真的高分辨率视觉内容，而且还需要通过相干的时间动态来提高帧速率。此外，现有的STVSR方法主要解决简单降级假设下的时空上采样，因此在具有复杂未知降级的现实世界场景中失败。为了应对这些挑战，我们提出了OSDEnhancer，这是第一个在一步扩散中实现稳健STVSR的框架。OSDEnhancer从线性初始化开始，以建立必要的时空结构，并使模型适应一步重建。然后应用分而治之策略，引入时间一致性 (TC) 和纹理富集 (TE) LoRAs，分别逐步专注于帧间动力学建模和细粒度纹理恢复，同时在推理过程中进行协作以增强整体性能。双向VAE解码器采用可变形的递归块来利用香草VAE的多尺度结构，通过联合的多尺度可变形聚合和帧间特征传播来增强潜在到像素的重建。实验结果表明，所提出的方法在现实场景中具有出色的泛化性能。该代码可在 https://github.com /w-shuoyan/OSDEnhancer获得。


## [Anuska Roy --- CAB: Accelerating Flow and Diffusion Sampling via Rectification and Corrected Adams-Bashforth](https://arxiv.org/abs/2605.16736)

- **链接**: [https://arxiv.org/abs/2605.16736](https://arxiv.org/abs/2605.16736)
- **ID**: oai:arXiv.org:2605.16736v2
- **分类**: cs.CV, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### CAB: Accelerating Flow and Diffusion Sampling via Rectification and Corrected Adams-Bashforth

**中文标题**: CAB：通过校正与修正的亚当斯-巴什福思法加速流体与扩散采样

**作者**: Anuska Roy, Pravin Nair

### 摘要
arXiv:2605.16736v2 Announce Type: replace  Abstract: Flow and diffusion models achieve high-fidelity, high-resolution image synthesis, but often require many function evaluations (NFEs) at sampling time. Existing acceleration methods either require additional training through distillation or rely on training-free high-order solvers, and both can degrade sample quality at low NFE budgets. We propose CAB (Corrected Adams-Bashforth), a training-free sampler that accelerates both flow and diffusion models. CAB first transforms the sampling dynamics to a common rectified coordinate system, and then applies a multistep Adams-Bashforth predictor augmented with a simple correction term based on past velocity evaluations and therefore incurs no additional NFEs. The resulting method is simple, has the same algorithmic form across model classes, and has at least third-order local truncation error and second-order global error. Experiments on pretrained flow and diffusion models, including class-conditional and large-scale text-to-image benchmarks, show that CAB improves quality-NFE trade-offs in the low-step regime of 6-20 NFEs. It also remains competitive with strong training-free samplers at higher step counts across most tested models. The official implementation is available at https://github.com/Anuska-Roy/CAB.

### 摘要（中文）
arXiv:2605.16736v2宣布类型: 更换 摘要：流模型与扩散模型能够实现高保真、高分辨率的图像生成，但通常在采样时需要进行大量的函数求值（NFE）。现有的加速方法要么需要通过知识蒸馏进行额外的训练，要么依赖于无需训练的高阶求解器，而这两种方法在采样步数预算较低时都会导致样本质量下降。我们提出了CAB（修正的亚当斯-巴什福思法），这是一种无需训练的采样器，能够加速流模型和扩散模型的推理过程。CAB首先将采样动力学变换到一个统一的校正坐标系，随后采用一种基于历史速度估计的简单修正项对多步Adams-Bashforth预测器进行改进，从而不增加任何额外的函数求值次数。由此得到的方法简单明了，在各类模型中具有相同的算法形式，且局部截断误差至少为三阶，全局误差至少为二阶。在预训练的流模型和扩散模型上的实验表明，包括类别条件生成以及大规模文本到图像基准测试在内，CAB能够在6至20步的低步数范围内改善质量与采样步数之间的权衡。在大多数测试模型上，它在较高采样步数下仍能与性能强劲的免训练采样器保持相当的竞争力。该官方实现已在 https://github.com/Anuska-Roy/CAB 上发布。


## [Yukang Chen --- LongLive-2.0: An NVFP4 Parallel Infrastructure for Long Video Generation](https://arxiv.org/abs/2605.18739)

- **链接**: [https://arxiv.org/abs/2605.18739](https://arxiv.org/abs/2605.18739)
- **ID**: oai:arXiv.org:2605.18739v2
- **分类**: autoregressive, cs.CV, cs.DC, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### LongLive-2.0: An NVFP4 Parallel Infrastructure for Long Video Generation

**中文标题**: LongLive-2.0：面向长视频生成的NVFP4并行基础设施

**作者**: Yukang Chen, Luozhou Wang, Wei Huang, Shuai Yang, Bohan Zhang, Yicheng Xiao, Ruihang Chu, Weian Mao, Qixin Hu, Shaoteng Liu, Yuyang Zhao, Huizi Mao, Ying-Cong Chen, Enze Xie, Xiaojuan Qi, Song Han

### 摘要
arXiv:2605.18739v2 Announce Type: replace  Abstract: We present LongLive-2.0, an NVFP4-based parallel infrastructure throughout the full training and inference workflow of long video generation, addressing speed and memory bottlenecks. For training, we introduce sequence-parallel autoregressive (AR) training, instantiated as Balanced SP, which co-designs the efficient teacher-forcing layout with SP execution by pairing clean-history and noisy-target temporal chunks on each rank, enabling a natural teacher-forcing mask with SP-aware chunked VAE encoding. Combined with NVFP4 precision, it reduces GPU memory cost and accelerates GEMM computation during training, the proportion of which increases as video length grows. Moreover, we show that a high-quality infrastructure and dataset enable a remarkably clean training pipeline. Unlike existing Self-Forcing series methods that rely on ODE initialization and subsequent distribution matching distillation (DMD), LongLive-2.0 directly tunes a diffusion model into a long, multi-shot, interactive auto-regressive (AR) diffusion model. It can be further converted to real-time generation (4 to 2 denoising steps) with standalone LoRA weights. For inference on Blackwell GPUs, we enable W4A4 NVFP4 inference, quantize KV cache into NVFP4 for memory savings, and boost end-to-end throughput with asynchronous streaming VAE decoding. On non-Blackwell GPU architectures, we deploy SP inference to match the speed on Blackwell GPUs, while the quantized KV cache can lower inter-GPU communication of SP. Experiments show up to 2.15x speedup in training, and 1.84x in inference. LongLive-2.0-5B achieves 45.7 FPS inference while attaining strong performance on benchmarks. To our knowledge, LongLive-2.0 is the first NVFP4 training and inference system for long video generation.

### 摘要（中文）
arXiv:2605.18739v2宣布类型: 更换 摘要：我们提出了LongLive-2.0，这是一种基于NVFP4的并行化基础设施，覆盖长视频生成的完整训练与推理流程，有效解决了速度与显存瓶颈问题。在训练方面，我们提出了序列并行的自回归（AR）训练方法，并将其具体实现为Balanced SP。该方法通过在每个计算节点上将干净历史与噪声目标的时间块进行配对，协同设计高效的教师强制布局与序列并行执行策略，从而在序列并行感知的分块变分自编码器（VAE）编码中自然地引入教师强制掩码。结合NVFP4精度，可降低GPU显存开销，并加速训练过程中的GEMM计算；随着视频长度的增加，GEMM所占比例也随之提升。此外，我们证明，高质量的基础设施与数据集能够构建出一条极为顺畅的训练流水线。与现有依赖于常微分方程初始化及后续分布匹配蒸馏（DMD）的自力场系列方法不同，LongLive-2.0直接将扩散模型调优为一种长序列、多步采样、交互式的自回归（AR）扩散模型。借助独立的LoRA权重，它还可以进一步转化为实时生成（4步至2步去噪）。在Blackwell GPU上进行推理时，我们启用了W4A4 NVFP4推理模式，将KV缓存量化为NVFP4以节省显存，并通过异步流式VAE解码进一步提升端到端吞吐量。在非Blackwell架构的GPU上，我们采用单精度推理以达到与Blackwell架构GPU相当的性能；同时，量化后的键值缓存能够减少GPU间的通信开销。实验表明，训练速度最高可提升至2.15倍，推理速度最高可提升至1.84倍。LongLive-2.0-5B在基准测试中取得优异性能的同时，推理速度达到45.7 FPS。据我们所知，LongLive-2.0是首个用于长视频生成的NVFP4训练与推理系统。


## [Kasra Arabi --- SEAL: Semantic Aware Image Watermarking](https://arxiv.org/abs/2503.12172)

- **链接**: [https://arxiv.org/abs/2503.12172](https://arxiv.org/abs/2503.12172)
- **ID**: oai:arXiv.org:2503.12172v4
- **分类**: cs.CR, cs.CV, cs.LG, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### SEAL: Semantic Aware Image Watermarking

**中文标题**: 印章: 语义感知的图像水印

**作者**: Kasra Arabi, R. Teal Witter, Chinmay Hegde, Niv Cohen

### 摘要
arXiv:2503.12172v4 Announce Type: replace-cross  Abstract: Generative models have rapidly evolved to generate realistic outputs. However, their synthetic outputs increasingly challenge the clear distinction between natural and AI-generated content, necessitating robust watermarking techniques. Watermarks are typically expected to preserve the integrity of the target image, withstand removal attempts, and prevent unauthorized replication onto unrelated images. To address this need, recent methods embed persistent watermarks into images produced by diffusion models using the initial noise. Yet, to do so, they either distort the distribution of generated images or rely on searching through a long dictionary of used keys for detection.   In this paper, we propose a novel watermarking method that embeds semantic information about the generated image directly into the watermark, enabling a distortion-free watermark that can be verified without requiring a database of key patterns. Instead, the key pattern can be inferred from the semantic embedding of the image using locality-sensitive hashing. Furthermore, conditioning the watermark detection on the original image content improves robustness against forgery attacks. To demonstrate that, we consider two largely overlooked attack strategies: (i) an attacker extracting the initial noise and generating a novel image with the same pattern; (ii) an attacker inserting an unrelated (potentially harmful) object into a watermarked image, possibly while preserving the watermark. We empirically validate our method's increased robustness to these attacks. Taken together, our results suggest that content-aware watermarks can mitigate risks arising from image-generative models.

### 摘要（中文）
arXiv:2503.12172v4宣布类型: 替换-交叉 摘要: 生成模型已经迅速发展到生成现实的输出。然而，他们的合成输出越来越挑战自然和人工智能生成的内容之间的明显区别，需要强大的水印技术。通常期望水印保持目标图像的完整性，经受住移除尝试，并且防止未经授权的复制到不相关的图像上。为了解决这个需要，最近的方法使用初始噪声将持久水印嵌入到由扩散模型产生的图像中。然而，要做到这一点，他们要么扭曲生成的图像的分布，要么依赖于搜索使用的关键字的长字典进行检测。 在本文中，我们提出了一种新颖的水印方法，该方法将有关生成图像的语义信息直接嵌入到水印中，从而实现了无需关键模式数据库即可验证的无失真水印。相反，可以使用位置敏感的散列从图像的语义嵌入来推断关键模式。此外，在原始图像内容上调节水印检测提高了对伪造攻击的鲁棒性。为了证明这一点，我们考虑了两种很大程度上被忽视的攻击策略 :( i) 攻击者提取初始噪声并生成具有相同模式的新图像; (ii) 攻击者将不相关 (可能有害) 的对象插入到水印图像中，可能同时保留水印。我们通过经验验证了我们的方法对这些攻击的增强的鲁棒性。总之，我们的结果表明，内容感知水印可以减轻图像生成模型带来的风险。


## [Aihua Zhu --- Hierarchical Schedule Optimization for Fast and Robust Diffusion Model Sampling](https://arxiv.org/abs/2511.11688)

- **链接**: [https://arxiv.org/abs/2511.11688](https://arxiv.org/abs/2511.11688)
- **ID**: oai:arXiv.org:2511.11688v3
- **分类**: cs.CV, cs.LG, diffusion
- **发布时间**: 2026-05-20T04:00:00
- **爬取时间**: 2026-05-21 00:01:08

### Hierarchical Schedule Optimization for Fast and Robust Diffusion Model Sampling

**中文标题**: 快速鲁棒扩散模型抽样的分层调度优化

**作者**: Aihua Zhu, Rui Su, Qinglin Zhao, Li Feng, Meng Shen, Shibo He

### 摘要
arXiv:2511.11688v3 Announce Type: replace-cross  Abstract: Diffusion probabilistic models have set a new standard for generative fidelity but are hindered by a slow iterative sampling process. A powerful training-free strategy to accelerate this process is Schedule Optimization, which aims to find an optimal distribution of timesteps for a fixed and small Number of Function Evaluations (NFE) to maximize sample quality. To this end, a successful schedule optimization method must adhere to four core principles: effectiveness, adaptivity, practical robustness, and computational efficiency. However, existing paradigms struggle to satisfy these principles simultaneously, motivating the need for a more advanced solution. To overcome these limitations, we propose the Hierarchical-Schedule-Optimizer (HSO), a novel and efficient bi-level optimization framework. HSO reframes the search for a globally optimal schedule into a more tractable problem by iteratively alternating between two synergistic levels: an upper-level global search for an optimal initialization strategy and a lower-level local optimization for schedule refinement. This process is guided by two key innovations: the Midpoint Error Proxy (MEP), a solver-agnostic and numerically stable objective for effective local optimization, and the Spacing-Penalized Fitness (SPF) function, which ensures practical robustness by penalizing pathologically close timesteps. Extensive experiments show that HSO sets a new state-of-the-art for training-free sampling in the extremely low-NFE regime. For instance, with an NFE of just 5, HSO achieves a remarkable FID of 11.94 on LAION-Aesthetics with Stable Diffusion v2.1. Crucially, this level of performance is attained not through costly retraining, but with a one-time optimization cost of less than 8 seconds, presenting a highly practical and efficient paradigm for diffusion model acceleration.

### 摘要（中文）
arXiv:2511.11688 v3宣布类型: 替换-交叉 摘要: 扩散概率模型为生成保真度设定了一个新的标准，但受到缓慢的迭代采样过程的阻碍。加速此过程的强大的无训练策略是进度优化，其目的是为固定且少量的功能评估 (NFE) 找到最佳的时间步长分布，以最大程度地提高样本质量。为此，一个成功的进度优化方法必须坚持四个核心原则: 有效性、自适应性、实用鲁棒性和计算效率。然而，现有的范例难以同时满足这些原则，从而激发了对更高级解决方案的需求。为了克服这些限制，我们提出了分层调度优化器 (HSO)，这是一种新颖而有效的双层优化框架。HSO通过在两个协同级别之间迭代交替，将对全局最优调度的搜索重新构架为更易于处理的问题: 对最优初始化策略的高级全局搜索和对调度细化的低级局部优化。该过程由两个关键创新指导: 中点误差代理 (MEP)，用于有效局部优化的求解器不可知且数值稳定的目标，以及间距惩罚适应度 (SPF) 函数，该函数通过惩罚病态接近的时间步长来确保实际鲁棒性。广泛的实验表明，HSO在极低的NFE状态下为无训练采样设置了新的最新技术。例如，在NFE仅为5的情况下，HSO通过稳定的扩散v2.1实现了对空间美学的显著11.94。至关重要的是，这种性能水平不是通过昂贵的重新训练来实现的，而是一次性优化成本不到8秒，为扩散模型加速提供了一种高度实用和高效的范例。
