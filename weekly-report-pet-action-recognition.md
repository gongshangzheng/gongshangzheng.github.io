# 宠物动作识别项目周报

> 2026 年 7 月第一周（6/29 – 7/6）

---

## 一、项目概述

本周围绕"宠物/动物动作识别"这一研究主题，完成了从文献调研、综述撰写到可行方案设计的全链路工作。产出包括 **1 篇系列总览 + 7 篇系列文章 + 2 篇论文精读**，覆盖动作识别技术全景、动物动作识别方法、视频基础模型前沿、个体特定动作检测范式，以及端侧宠物行为识别的工程选型。

分类路径：`categories/AI/动作识别`

---

## 二、研究产出

### 2.1 动作识别系列文章

本周完成了动作识别系列的核心内容，从总览到前沿方向形成完整阅读路径：

#### 动作识别主系列

| 序号 | 文章 | 内容简介 | 链接 |
|------|------|---------|------|
| Hub | 动作识别系列总览 | 按技术路线（2D CNN → 3D CNN → Transformer → Skeleton → 多模态 → 基础模型）组织完整学习路径，附论文池、框架选型和部署指南 | [总览](https://gongshangzheng.github.io/action-recognition-hub.html) |
| (一) | 领域导览 | 7 条技术路线的方案分类、40+ 篇代表论文的分层索引、4 大主流框架对比与部署工具链，从 Two-Stream CNN 到 InternVideo3 的完整认知地图 | [阅读](https://gongshangzheng.github.io/action-recognition-landscape.html) |
| (二) | 动物动作识别全景 | 与人体动作识别的核心差异（8 维对比）、15+ 数据集、跨物种姿态估计、ARTEMIS/MSQNet/V-JEPA 等 SOTA 方法、SuperAnimal/DeepLabCut 工具链、7 个子方向分类 | [阅读](https://gongshangzheng.github.io/animal-action-recognition-survey.html) |
| (三) | 从粗粒度到细粒度的动物动作识别综述 | 系统梳理 Springer AIR 2026 综述 [Zia et al., 2025](https://arxiv.org/abs/2506.01214)：四层分类框架、8 种 CG→FG 整合策略、8 个数据集结构化对比、CG vs FG 性能鸿沟（88% vs 12.7%）、Stable Diffusion / 基础模型等新兴方向 | [阅读](https://gongshangzheng.github.io/coarse-fine-animal-action-review-2025.html) |
| (四) | 视频基础模型时代的动作检测 | 系统调研 InternVideo2/V-JEPA 2/VideoMamba/RVM/UniFormerV2/VideoLLaMA 3 重塑时序动作检测，覆盖自监督预训练三大范式、统一 TAD 框架、零样本检测和 VLM 动作理解，8 篇核心论文深读 | [阅读](https://gongshangzheng.github.io/video-foundation-model-action-detection.html) |
| (五) | 个体特定动作检测 | **本周核心产出**。提出 Stitching-Retargeting 范式：缝合个体表征（姿态/3D 重建）→ 重定向动作识别能力，覆盖 IGMN/SkeleTR/TTA-Pose/PoseBridge/SuperAnimal/AniMer/ViA/PersonaAnimator 等 19 篇核心论文，含机器人运动重定向类比和开放问题 | [阅读](https://gongshangzheng.github.io/instance-specific-action-detection.html) |
| 精读 | SkeleTR 论文精读 | 大量短序列取代少量长序列、个体内 GCN + 个体间 Transformer 的两阶段架构、Mix Pooling 三流压缩，0.81M 参数实现 AVA +7.8%，双阶段范式最接近完整系统的代表作 | [阅读](https://gongshangzheng.github.io/paper-skeletr-2023.html) |

#### 宠物动作识别子系列

| 序号 | 文章 | 内容简介 | 链接 |
|------|------|---------|------|
| (一) | 端侧宠物行为识别任务规划 | 面向室内猫咪居家场景的端侧宠物行为识别项目规划：9 种常见行为 + 4 类异常场景分类、3 条任务线、500 元 BOM 硬件约束 | [阅读](https://gongshangzheng.github.io/pet-action-detection-phase1.html) |
| (二) | 动作检测模型全景与选型 | 系统梳理 mmaction2 模型库、2023-2026 新架构（VideoMamba/VideoMAE V2/InternVideo2）、25+ 模型 × 9 数据集 × 3 条技术路线，500 元硬件约束下的猫咪行为识别选型建议 | [阅读](https://gongshangzheng.github.io/pet-action-detection-model-survey.html) |
| (三) | PMTNet 论文精读 | 精读 2026 年 Animals 期刊 PMTNet：部件级时序建模 + 缺失感知融合，解决非受限视频中猫身体/头部/尾巴部件不稳定可见性，5 类猫行为 93.1% 准确率 | [阅读](https://gongshangzheng.github.io/pmtnet-2026-cat-behavior.html) |

### 2.2 核心研究发现

#### 发现一：粗粒度 vs 细粒度的巨大性能鸿沟

基于 [Zia et al., 2025](https://arxiv.org/abs/2506.01214) 的系统对比，动物动作识别存在结构性性能鸿沟：

- **粗粒度（CG）准确率**：88%–97%（行走、站立、奔跑等一般性运动模式）
- **细粒度（FG）准确率**：12.7%–29.6%（反刍-躺卧 vs 反刍-站立等微妙差异）
- **鸿沟超过 44 个百分点**

这意味着：当前主流方法（SlowFast、I3D 等）能识别"动物在动"，但无法区分"动物在做什么细微动作"。

#### 发现二：八种 CG→FG 整合策略

综述提出的 8 种策略可归纳为三大范式：

| 范式 | 策略 | 适用场景 |
|------|------|---------|
| **级联范式** | Hierarchical / Two-stage | 计算资源受限的边缘部署（如宠物摄像头） |
| **融合范式** | Feature Fusion / Ensemble / Feedback | 云端高精度场景 |
| **自适应范式** | Open-set / Action Segmentation / Adaptive | 野生动物监控等不可预测场景 |

#### 发现三：视频基础模型正在重塑动作检测格局

[系列四](https://gongshangzheng.github.io/video-foundation-model-action-detection.html) 深读 8 篇 VFM 核心论文后发现：

- **三条预训练范式并行**：掩码重建（VideoMAE → InternVideo2 → RVM）、表示预测（V-JEPA 2）、状态空间模型（VideoMamba）
- **K400 ≠ TAD**：InternVideo2 在 K400 达 92.1%，但 TAD 性能取决于时序建模能力，非纯分类精度
- **零样本检测已可行**：FreeZAD 仅用冻结 CoCa 模型，无需训练即在 THUMOS14 达 10.0% mAP @ 128.9 FPS
- **边缘部署候选**：RVM-S 仅 34M 参数、VideoMamba 74M，是 500 元 BOM 约束下最可行的 VFM

#### 发现四：Stitching-Retargeting 范式

在本周撰写的 [个体特定动作检测](https://gongshangzheng.github.io/instance-specific-action-detection.html) 一文中，我们提出了一个系统性范式来解决 CG→FG 鸿沟：

1. **Stitching 阶段**：从分散的个体观测中缝合出连贯的个体表征（如 [DeepLabCut](https://github.com/DeepLabCut/DeepLabCut) 姿态序列、[SuperAnimal](https://www.nature.com/articles/s41467-024-48792-2) 跨物种模型）
2. **Retargeting 阶段**：将通用动作识别能力重定向到个体特定空间（如 [SkeleTR](https://gongshangzheng.github.io/paper-skeletr-2023.html) 的图卷积骨架建模）

核心洞察：**细粒度行为的判别信息不在像素级外观特征中，而在于个体姿态序列的拓扑变化**。

#### 发现五：PMTNet 证明猫行为识别可行性

[PMTNet 精读](https://gongshangzheng.github.io/pmtnet-2026-cat-behavior.html) 是目前公开文献中唯一专门面向非受限视频中猫咪行为识别的工作：

- **93.1% Top-1 准确率**（5 类猫行为），远高于通用动物动作识别的 mixed 准确率（27%–47%）
- **部件级时序建模**：将猫分为身体/头部/尾巴三个部件，分别提取时序特征后缺失感知融合
- **关键启示**：部件级分解 + 缺失容忍是解决猫遮挡/姿态变化问题的有效路径

---

## 三、已知项目与工具链

本周调研覆盖了宠物/动物动作识别领域的主要开源项目和数据集：

### 3.1 姿态估计工具

| 项目 | 描述 | 链接 |
|------|------|------|
| **DeepLabCut** | 多动物姿态估计+识别+跟踪，Nature Methods 2022 | [GitHub](https://github.com/DeepLabCut/DeepLabCut) |
| **SLEAP** | 多动物社交姿态追踪，轻量级 CNN 架构 | [官网](https://talmolab.github.io/sleap-website/) |
| **SuperAnimal** | 跨 45+ 物种零样本姿态估计基础模型，Nature Communications 2024 | [论文](https://www.nature.com/articles/s41467-024-48792-2) |
| **ADPT** | Transformer 抗漂移姿态追踪器，eLife 2024 | [论文](https://elifesciences.org/reviewed-preprints/95709v1) |

### 3.2 动作识别骨干网络

| 方法 | 架构特点 | 动物场景表现 |
|------|---------|-------------|
| **I3D** | 2D→3D 权重膨胀 | MammalNet 34.2%–46.6%（mixed） |
| **SlowFast** | 双路径低/高帧率 | CVB CG 73.96%, FG 12.7%–29.6% |
| **X3D** | 渐进扩展，效率优先 | Animal Kingdom 27.3%–39.7%（CARe） |
| **MViT V2** | 多尺度 Vision Transformer | MammalNet 中使用 |
| **SkeleTR** | 骨架图卷积 + Transformer | AVA +7.8%（人体），可迁移动物 |
| **PMTNet** | 部件级时序建模 + 缺失感知融合 | 猫行为 93.1%（5类），Animals 2026 |
| **MMAction2** | OpenMMLab 视频理解工具箱 | [GitHub](https://github.com/open-mmlab/mmaction2) |

### 3.3 视频基础模型（2022–2026）

| 模型 | 范式 | 参数量 | K400 Top-1 | 特色 |
|------|------|--------|-----------|------|
| **InternVideo2** | 双教师蒸馏 | 6B | 92.1% | THUMOS14 TAD 72.0 mAP |
| **V-JEPA 2** | 表示预测（JEPA） | 1B | 87.3% | SSv2 77.3%，1/6 参数达 InternVideo2 水平 |
| **VideoMamba** | 状态空间模型（SSM） | 74M | 85.0% | 线性复杂度，边缘部署候选 |
| **RVM-S** | 循环掩码重建 | 34M | 49.6% | 最小参数，8 任务归一化均值超 1B 模型 |
| **UniFormerV2** | 图像预训练迁移 | 354M | 90.0% | 极少微调即可迁移 |
| **FreeZAD** | 零样本检测 | — | — | 无需训练，THUMOS14 10.0% mAP @ 128.9 FPS |

### 3.4 数据集

| 数据集 | 规模 | 特色 | 公开 |
|--------|------|------|------|
| **Animal Kingdom** | 850 物种, 50h, 30K 序列 | CVPR 2022，最大规模动物行为数据集 | ✅ |
| **MammalNet** | 173 种哺乳动物, 539h, 12 行为 | CVPR 2023，唯一多物种大规模视频 | ✅ |
| **CVB** | 502 clips, 11 行为, 450 帧/clip | 单物种（牛）多行为基准 | ✅ |
| **PBRD** | 7500 图像, 30 行为 | 灵长类，渐进注意力训练 | ✅ |

### 3.5 前沿多模态方法（2024–2025）

| 方法 | 贡献 | 性能 |
|------|------|------|
| **ARTEMIS** | 文本+视觉多模态融合动物识别 | mAP 79.82 |
| **Animal-CLIP** | 双 Prompt 增强 VLM | IJCV 2025 |
| **AnimalMotionCLIP** | CLIP + 光流 | mAP 74.63 |
| **EthoCLIP** | 本体增强视频-语言预训练 | CVPR 2026 Highlight |
| **DiffPose-Animal** | 扩散模型 + 语言条件姿态估计 | 2024 |

---

## 四、结论与可行方案

### 4.1 核心结论

1. **宠物动作识别不能直接迁移人体动作识别 pipeline**——从数据底层到评估范式都存在结构性差异
2. **CG→FG 鸿沟是当前最大瓶颈**——粗粒度已达 88%+，但细粒度仅 12.7%–29.6%
3. **像素级特征不足以区分细粒度行为**——判别信息在于姿态序列的拓扑变化，而非外观
4. **大规模数据 ≠ 高精度**——Animal Kingdom（30K 序列）和 MammalNet（539h）的 mixed 准确率仅 27%–46%，而 PBRD（7500 图像）通过 progressive attention 达到 CG 91.53% / FG 81.90%
5. **部件级分解是猫行为识别的有效路径**——PMTNet 将猫分为身体/头部/尾巴部件，以 1283 个片段达到 93.1% 准确率，远超通用方法
6. **VFM 零样本检测已具备雏形**——FreeZAD 无需训练即达 10.0% mAP，RVM-S 仅 34M 参数即超越 1B 级模型的多任务均值

### 4.2 宠物动作检测可行方案

基于本周调研，提出以下可行技术路线：

#### 方案 A：级联架构（适合边缘部署 / 宠物摄像头）

```
视频输入 → DeepLabCut/SuperAnimal 姿态提取 → SlowFast 粗粒度分类 → 细粒度触发器 → SkeleTR 骨架细粒度识别
```

- **第一阶段**：SlowFast 快速粗粒度分类（行走/站立/奔跑/休息），计算成本低
- **第二阶段**：仅对歧义样本启用 SkeleTR 骨架图卷积，做细粒度区分（如"反刍-躺卧"vs"反刍-站立"）
- **优势**：计算资源可控，适合实时宠物监控
- **参考项目**：[DeepLabCut](https://github.com/DeepLabCut/DeepLabCut) + [MMAction2](https://github.com/open-mmlab/mmaction2)

#### 方案 B：Stitching-Retargeting（适合个体定制化）

```
参考视频 → SuperAnimal 跨物种姿态模型 → 个体表征缝合(Stitching) → SkeleTR/IGMN 个体特定识别(Retargeting)
```

- **Stitching**：用 SuperAnimal（45+ 物种零样本）提取宠物姿态序列，缝合出该个体的运动模式
- **Retargeting**：将通用动作识别能力重定向到该个体——先认识"这只猫"的独特姿态特征，再理解"它在做什么"
- **优势**：能区分同一物种不同个体的行为差异（如两只猫的玩耍风格）
- **参考项目**：[SuperAnimal](https://www.nature.com/articles/s41467-024-48792-2) + [SkeleTR](https://gongshangzheng.github.io/paper-skeletr-2023.html)

#### 方案 C：多模态融合（适合高精度研究场景）

```
视觉(SlowFast) + 音频(吠叫/呼噜声) + 惯性传感器(项圈加速度计) → 融合分类器
```

- 综述公式：$F_{\text{fused}} = h\bigl(f(X_v; \theta_v),\; f(X_a; \theta_a),\; f(X_s; \theta_s)\bigr)$
- **参考**：[ARTEMIS](https://link.springer.com/article/10.1007/s13042-025-02602-3)（mAP 79.82）已验证文本+视觉融合的有效性
- **优势**：音频和传感器数据可以弥补视觉遮挡场景的不足
- **劣势**：需要多模态数据采集设备，部署成本高

#### 方案 D：基础模型迁移（适合快速验证）

```
预训练 VLM (Animal-CLIP / EthoCLIP) → 少样本 fine-tuning → 宠物行为分类
```

- 利用 2024–2025 涌现的视觉-语言模型（VLM）进行迁移学习
- [Animal-CLIP](https://link.springer.com/article/10.1007/s13042-025-02602-3)（IJCV 2025）和 EthoCLIP（CVPR 2026 Highlight）已部分验证可行性
- **优势**：减少对大规模标注数据的依赖，可快速适配新物种
- **劣势**：VLM 在细粒度行为上的表现尚未充分验证

### 4.3 推荐路线

对于宠物动作检测的实际落地，建议采用 **方案 A（级联架构）** 作为基础，叠加 **方案 B（Stitching-Retargeting）** 的个体定制能力：

1. 用 [DeepLabCut](https://github.com/DeepLabCut/DeepLabCut) / [SuperAnimal](https://www.nature.com/articles/s41467-024-48792-2) 做姿态提取
2. 用 SlowFast 做粗粒度快速筛选
3. 对歧义样本启用骨架图卷积做细粒度识别
4. 长期目标：通过 Stitching-Retargeting 实现个体特定的行为理解

---

## 五、下周计划

- 在 CVB 数据集上复现 SlowFast 基线实验，验证 CG 73.96% / FG 29.6% 的可复现性
- 调研 DeepLabCut + SuperAnimal 在猫/狗场景的适用性
- 探索 SkeleTR 骨架方法在动物数据集上的迁移实验
