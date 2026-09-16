# Research: 医学侧「预测术后/治疗后外观」——深度学习/生成式模型与软组织预测

> ⚠️ **UNVERIFIED — 基于模型内部知识，未联网核实，仅作为后续检索的 hypothesis list**
>
> 本文件的**所有**条目（论文标题、作者、年份、会议/期刊、论断）**均未经过任何联网检索验证**。
> 本子代理在本轮运行中**没有任何网络访问或 shell 执行能力**（工具仅为 read/write/contact_supervisor/intercom，
> 无法运行 `~/.agents/skills/web-search/scripts/*.py`，`read` 也不支持 URL）。
>
> 因此：
> - **未写任何精确引用数**（表格中该列统一留 `—`，请由 parent 用 OpenAlex 填充）。
> - **未写任何 URL**（避免编造）。仅给出可检索的标题/作者，供 parent 反查 DOI。
> - 年份不确定者前缀 `~`。会议/期刊不确定者标 `(venue?)`。
> - 标记 `【置信度：高/中/低】` 表示我对「这条确实存在且我记对了标题」的自评。
> - 明确标注 `【未找到】` 的地方是我知识范围内**没有**对应工作的（可能是真空白，也可能是我漏记，需检索确认）。
>
> **parent 请重点执行文末《供 parent 代跑的精确检索清单》**，把核实结果回填本文件。

---

## Summary

医学侧「预测治疗后外观」是一条**比「从外观做诊断」冷得多**的线：诊断侧有 ISIC/HAM10000 这类大规模基准与海量论文，
而**结果预测侧几乎没有公开 benchmark、没有标准评价指标**，主流做法是各机构拿几十到一两百例配对（术前/术后）影像
自建模型 + 自评误差。技术脉络清晰可辨：**2D 头影测量 VTO（1990s）→ 患者个体化 FEM 面部软组织仿真（~2000-2008）→
统计形状模型/3D 摄影测量（~2008-2016）→ GAN 图像到图像（~2017-2022）→ 扩散模型与 3D 原生生成（~2022-至今）**。
临床真正落地的是**有限元/生物力学软件**（Materialise ProPlan CMF、Dolphin），而不是深度学习模型；
深度学习目前的强项集中在**前处理环节**（分割、标志点检测、牙齿生成、笑容/牙冠设计），
**端到端「术后脸」预测仍处于论文阶段**。痤疮/皮肤「清除后长什么样」这一具体问题，我未找到直接对口工作，属明显空白区。

---

## 一、热点子方向（含 open problems、学界 vs 临床/产业差异）

### 1.1 正颌手术软组织预测（orthognathic soft tissue prediction）——医学侧最成熟的一条线
- **问题设定**：给定骨性移动方案（Le Fort I / BSSO / 颏成形），预测术后 6 个月~1 年（肿胀消退后）的面部软组织形态。
- **三条技术流派**：① 生物力学有限元/mass-spring；② 统计形状模型 + 概率回归；③ 图像到图像深度学习（GAN/Diffusion）。
- **open problems**：软组织在骨面上的**滑动（sliding/contact）**建模；肌肉与脂肪的**长期适应性改建**（术后 1 年仍非终态）；
  个体化材料参数无法在体测量；**术后肿胀**与长期结果的解耦；没有公认评价指标（多数论文报 landmark/稠密表面的 mm 级偏差，
  但取样点、配准方式、时间点各不相同，横向不可比）。
- **学界 vs 临床**：临床用的是**有限元/生物力学商业软件**（Materialise ProPlan CMF 前身是 KU Leuven Medicim 的成果；
  Dolphin Imaging）；学界近年转向学习型方法，但样本量普遍很小。
  【置信度：中—高】

### 1.2 颅颌面（craniofacial）手术模拟与生长预测
- 颅缝早闭（craniosynostosis）**弹簧牵引/颅骨重塑**的术后头型预测；唇腭裂术后颌面生长轨迹预测。
- 特点：**儿童 + 生长**，因此必须预测的是「随时间演化的形状」而非单点结果，统计形状模型（含生长模型）比纯图像生成更合适。
- open problems：生长数据的纵向配对极稀缺；伦理上难以设随机对照；缺乏公开数据集。
  【置信度：中】

### 1.3 正畸面型/软组织变化预测
- 传统路线：Ricketts VTO、Holdaway 软组织分析等 2D 头影测量可视化治疗目标（VTO）。
- 现代路线：**拔牙 vs 不拔牙**决策支持、上颌前突/双颌前突内收后的唇部回缩量预测、隐形矫治（aligner）疗效与面型变化。
- **重要区分**：正畸领域大量深度学习论文其实是**标志点自动检测 / 头影测量自动分析**（前处理，不是结果预测），
  被外行当成「预测」；真正做**面型结果预测**的论文少得多。这是我看到的**普遍误解**，写文章时必须区分。
- 产业侧：Align Technology 的 **ClinCheck** 能模拟牙齿移动与「笑容预览」，但**不做真正的软组织/面型预测**，
  且是产品 demo/受专利保护，不可复现。【置信度：中—高】

### 1.4 皮肤科：皮肤病变图像合成 / 去病变 / 瘢痕与痤疮
- **相对成熟的**：皮肤病变**合成与去病变（lesion inpainting / removal）**，主要动机是**数据增强与隐私脱敏**，
  不是给患者看「治好了什么样」。属于「条件图像编辑」的子问题。
- **面龄变换（face aging / rejuvenation）**：Lifespan Age Transformation、SAM 等通用人脸年龄编辑方法，
  **技术上完全可以迁移**到「皮肤变好/变差」的模拟，但**没有医学验证**。
- **痤疮专项**：我找到的只有**痤疮严重度分级/计数**（皮肤科 AI 最成熟的应用之一），
  **「痤疮清除后皮肤外观预测/合成」在我的知识范围内【未找到】直接对口工作**。
  这是一个真实的空白点，也是这个选题的**差异化机会**（见 Gaps）。
- open problems：皮肤纹理的**医学可信度**（生成模型倾向输出「美颜化」的平滑皮肤）；
  **身份保持**与**病变去除后不该出现的伪影**；缺少「同一患者清除前后」的配对数据（这正是训练所需，却最难获取）。【置信度：中】

### 1.5 整形美容：术后效果预测
- 隆鼻、双眼皮、面部填充、面部提升的**术前可视化**。**产业远强于学术**：Crisalix 等做 3D 美学手术模拟、
  医美 App 做「变美预览」。学术侧我**无法可靠点名**具体 GAN/Diffusion 论文标题 —— 存在零散发表（美容外科类期刊），
  但**未找到**公认 landmark。【置信度：中（对「产业强于学术」的判断），低（对具体论文）】
- 争议集中：**预期管理 vs 过度承诺**、生成结果与真实手术的差距导致的**纠纷与伦理问题**、是否构成 SaMD 需监管。【置信度：中】

### 1.6 牙科美学：smile design / 数字化微笑设计
- 临床侧：**Digital Smile Design (DSD)** 是一套临床协议 + 商业软件生态（3Shape Smile Design、exocad Smile Creator、
  CEREC 等），**不是论文**。DSD 由 Christian Coachman / Livio Yoshinaga 等推动。【置信度：中—高】
- 学术侧强的是**牙齿/牙冠的自动生成与排布**（GAN 生成牙冠、自动排牙、修复体设计），
  这是「生成牙齿几何」而非「预测人脸结果」。Deep learning 生成牙冠这条线是真实且活跃的。【置信度：中—高】

### 1.7 方法侧（跨领域共用）
- **FEM / mass-spring / 超弹性本构**：患者个体化网格从 CT/CBCT 分割构建，骨-软组织接触与滑动约束。
- **统计形状模型**：Active Shape Models、3DMM、SPHARM-PDM、PCA 形状空间 + 回归/RBF。
- **图像到图像生成**：pix2pix → CycleGAN → SPADE/GauGAN → StyleGAN → **Latent Diffusion + ControlNet**。
- **3D 原生生成**：隐式表示（DeepSDF、Occupancy Networks）、神经辐射场、**3D Gaussian Splatting**、
  以及近两年爆发式增长的**网格/资产级 3D 生成**（TRELLIS 等），尚未真正接上临床。
- **争议**：医学 I2I 的评价不能只看 FID（FID 低 ≠ 临床上对）；需要**临床终点**与**结构/解剖保真度**指标；
  「物理约束 + 神经生成」混合（physics-informed / FE-in-the-loop）被认为是正确方向但尚无标杆工作。【置信度：中—高】

---

## 二、Landmark Papers（候选清单，**引用数全部留空待查**）

> 说明：医学侧大量工作在 PubMed/口腔颌面外科与皮肤科期刊，**arXiv 上基本没有**，请优先用 OpenAlex 检索。

### A. 软组织生物力学 / 正颌手术预测（奠基）
| 论文（候选标题） | 年份 | 会议/期刊 | 核心贡献 | 引用数 | 关键作者 | 置信度 |
|---|---|---|---|---|---|---|
| Patient specific finite element model of the face soft tissues for computer-assisted maxillofacial surgery | ~2003 | Medical Image Analysis | 患者个体化面部软组织 FEM 的开创工作，从 CT 构建网格 + 弹性本构模拟骨移动后的软组织变形 | — | M. Chabanas, V. Luboz, Y. Payan (TIMC-IMAG Grenoble) | 高 |
| Predicting soft tissue deformations for a maxillofacial surgery planning system: from computational strategies to a complete clinical validation | ~2007 | Medical Image Analysis | 从算法到**临床验证闭环**的代表作；提出快速 mass-spring/tetrahedral 变形策略并做前瞻性临床误差评估 | — | W. Mollemans, F. Schutyser, N. Nadjmi, F. Maes, P. Suetens (KU Leuven + Medicim) | 高 |
| Anatomy- and physics-based facial animation for craniofacial surgery simulations | ~2004 | Med. & Biological Eng. & Computing | 用解剖分层 + 物理模型驱动面部变形，服务于颅颌面手术仿真 | — | E. Gladilin, S. Zachow, P. Deuflhard, H.-C. Hege (ZIB Berlin) | 中—高 |
| Soft tissue prediction in computer assisted maxillofacial surgery planning | ~2000-2005 | (book chapter / CARS 会议) | ZIB 线的方法学综述与规划系统实现 | — | S. Zachow, E. Gladilin, H.-C. Hege, P. Deuflhard | 中 |
| Clinical validation of individual finite element models for the prediction of soft tissue changes | ~2003 | (口腔颌面外科/生物力学类期刊?) | 早期个体化 FEM 的临床验证尝试 | — | P. Deuflhard 等 / ZIB 合作组 | 低—中 |
| Three-dimensional soft tissue prediction in orthognathic surgery: a clinical comparison of Dolphin, ProPlan CMF, and probabilistic finite element modelling | ~2019 | Int. J. Oral Maxillofac. Surg. (IJOMS) | **少数把商业软件与研究者方法放在同一批患者上做定量比较**的研究，是评价方法学的关键参照 | — | P.G.M. Knoops, A. Borghi, R.W.F. Breakey, 等 (UCL / Great Ormond Street Hospital) | 中—高 |
| Building a 3D finite element mesh of the craniofacial complex / 同类后续 | ~2004-2010 | (Med Image Anal / 会议) | 从医学影像到可算 FEM 网格的自动化流程 | — | Chabanas / Marecaux / Payan 等 | 中 |

### B. 统计形状模型与 3D 面部形态（跨领域地基，医学侧直接复用）
| 论文 | 年份 | 会议/期刊 | 核心贡献 | 引用数 | 关键作者 | 置信度 |
|---|---|---|---|---|---|---|
| Active Shape Models — Their Training and Application | ~1995 | Computer Vision and Image Understanding | 统计形状模型方法论奠基，几乎所有「形状空间+回归预测」的祖先 | — | T.F. Cootes, C.J. Taylor, D.H. Cooper, J. Graham | 高 |
| A Morphable Model for the Synthesis of 3D Faces (3DMM) | ~1999 | SIGGRAPH | 3D 人脸参数化模型奠基；数字人/面型预测的通用底座 | — | V. Blanz, T. Vetter | 高 |
| SPHARM-PDM / 球面谐波形状分析工具 | ~2006 | (Insight Journal / 会议) | 颅面结构形状统计的事实标准工具之一 | — | M. Styner 等 (UNC) | 中—高 |
| Learning a model of facial shape and expression from 4D scans (FLAME) | ~2017 | SIGGRAPH Asia | 头部参数化模型的事实标准，现代「面型预测」几乎都建在 FLAME/3DMM 上 | — | T. Li, T. Bolkart, M.J. Black, H. Li, J. Romero | 高 |
| FaceScape: A Large-Scale High Quality 3D Face Dataset and Detailed Riggable 3D Face Prediction | ~2020 | CVPR | 大规模高精度 3D 人脸数据集 + 细节 3D 预测，是少数**公开可用的高质量面型数据** | — | H. Yang 等 (浙江大学) | 高 |
| Modeling 3D Facial Shape from DNA | ~2014 | PLOS Genetics | 用统计形状模型从基因型预测面型 —— 「预测脸长什么样」在非手术场景的著名案例 | — | P. Claes 等 (KU Leuven) | 高 |

### C. 生成式方法（工具侧 landmark，医学 I2I 的技术来源）
| 论文 | 年份 | 会议/期刊 | 核心贡献 | 引用数 | 关键作者 | 置信度 |
|---|---|---|---|---|---|---|
| Image-to-Image Translation with Conditional Adversarial Networks (pix2pix) | ~2017 | CVPR | 配对图像翻译范式，医学 I2I（含去病变）的起点 | — | P. Isola, J.-Y. Zhu, T. Zhou, A.A. Efros | 高 |
| Unpaired Image-to-Image Translation using Cycle-Consistent Adversarial Networks | ~2017 | ICCV | 无配对翻译，**大幅降低配对医学数据门槛**，医学合成最常用的基线 | — | J.-Y. Zhu, T. Park, P. Isola, A.A. Efros | 高 |
| Semantic Image Synthesis with Spatially-Adaptive Normalization (SPADE) | ~2019 | CVPR | 空间自适应归一化，条件合成质量跃升；广泛用于「病变 mask→正常皮肤」类任务 | — | T. Park, M.-Y. Liu, T.-C. Wang, J.-Y. Zhu | 高 |
| A Style-Based Generator Architecture for Generative Adversarial Networks (StyleGAN) / StyleGAN2 | ~2019 / ~2020 | CVPR | 高保真人脸生成与解耦编辑，人脸老化/皮肤编辑研究的底座 | — | T. Karras 等 (NVIDIA) | 高 |
| Lifespan Age Transformation Synthesis | ~2020 | ECCV | 连续年龄变换，**「同一张脸在不同状态下的样子」的范式模板**，可直接类比为皮肤状态变化 | — | R. Or-El, S. Sengupta, O. Fried, E. Shechtman, I. Kemelmacher-Shlizerman | 高 |
| Only a Matter of Style: Age Transformation Using a Style-Based Regression Model (SAM) | ~2021 | SIGGRAPH | 用 StyleGAN 回归做精细年龄编辑，身份保持更好 | — | Y. Alaluf, O. Patashnik, D. Cohen-Or | 高 |
| Denoising Diffusion Probabilistic Models (DDPM) | ~2020 | NeurIPS | 扩散模型奠基 | — | J. Ho, A. Jain, P. Abbeel | 高 |
| High-Resolution Image Synthesis with Latent Diffusion Models (Stable Diffusion) | ~2022 | CVPR | 潜空间扩散，把高质量 I2I 变成可工程化能力 | — | R. Rombach, A. Blattmann, D. Lorenz, P. Esser, B. Ommer | 高 |
| Adding Conditional Control to Text-to-Image Diffusion Models (ControlNet) | ~2023 | ICCV | 精确空间条件控制，**当前「保留解剖结构、只改特定区域」的最实用工具** | — | L. Zhang, A. Rao, M. Agrawala | 高 |
| 3D Gaussian Splatting for Real-Time Radiance Field Rendering | ~2023 | SIGGRAPH | 3D 原生重建/渲染的范式转变，面部 3D 捕获与再渲染成本大幅下降 | — | B. Kerbl, G. Kopanas, T. Leimkühler, G. Drettakis | 高 |
| DeepSDF / Occupancy Networks | ~2019 | CVPR | 隐式 3D 表示，3D 原生生成的起点 | — | J.J. Park 等 / L. Mescheder 等 | 高 |

### D. 皮肤科 / 牙科 / 正畸 AI（与本主题相邻）
| 论文 | 年份 | 会议/期刊 | 核心贡献 | 引用数 | 关键作者 | 置信度 |
|---|---|---|---|---|---|---|
| Dermatologist-level classification of skin cancer with deep neural networks | ~2017 | Nature | 皮肤科 AI 的引爆点，但注意：**是诊断，不是外观预测** | — | A. Esteva 等 (Stanford) | 高 |
| The HAM10000 dataset | ~2018 | Scientific Data | 皮肤镜公开数据集事实标准，驱动了大量**合成/去病变**工作 | — | P. Tschandl, C. Rosendahl, H. Kittler | 高 |
| Joint Acne Image Grading and Counting via Label Distribution Learning（ACNE04 数据集来源） | ~2019 | ICCV | 痤疮分级/计数的代表性工作与公开数据集；**是「评估」不是「预测治疗后外观」** | — | X. Wu 等 | 中—高 |
| A Fully Automatic System for Cephalometric Landmarking | ~2016 | IEEE Trans. Medical Imaging (?) | 头影测量标志点全自动定位的代表作，**属前处理，非结果预测** | — | C. Lindner 等 (Manchester) | 中 |
| ToothGAN: 3D tooth generation in CT images by deep learning with adversarial network | ~2018 | ACM SIGGRAPH (poster) | 生成牙齿 3D 形态的代表作，牙科生成方向的起点之一 | — | J.J. Hwang 等 | 中 |
| DCPR-GAN: Dental Crown Prosthesis Restoration Using Two-Stage Wasserstein GAN | ~2022 | IEEE J. Biomedical and Health Informatics (?) | 自动牙冠设计/修复体生成，**与 digital smile design 同一技术族** | — | 韩国/中国研究组（作者需核实） | 中—低 |
| Artificial Intelligence in Dentistry: Chances and Challenges | ~2020 | J. Dental Research | 牙科 AI 的领域级综述，可用于界定「哪些已落地、哪些是 demo」 | — | F. Schwendicke 等 | 高 |

### E. **【未找到】/ 待确认的空白点（对我而言无可靠候选）**
- ❌ **痤疮清除后皮肤外观的预测/合成**：没有任何一篇我能可靠点名的论文。
- ❌ **术后瘢痕（瘢痕疙瘩/增生性瘢痕）外观预测**：无法点名论文；仅知有「烧伤后瘢痕结局预测」类临床 ML 工作存在（标题不确定）。
- ❌ **隆鼻/双眼皮/面部填充术后效果的 GAN/Diffusion 论文**：无法可靠点名标题；判断为「有零散发表 + 产业 demo 为主」。
- ❌ **唇腭裂术后面部生长预测的深度学习工作**：无法可靠点名。
- ❌ **正畸面型结果预测的端到端深度学习 benchmark**：判断为不存在（无公开 benchmark）。

---

## 三、关键作者与机构（含临床合作方）

> 全部为「候选线索」，机构与合作关系需核实。

| 研究者 / 组 | 机构 | 方向 | 临床合作方 | 置信度 |
|---|---|---|---|---|
| **Yohan Payan**（+ Matthieu Chabanas, Vincent Luboz, C. Marecaux） | TIMC-IMAG, Université Grenoble Alpes（法） | 面部软组织**生物力学 FEM**、个体化网格构建 | 格勒诺布尔大学医院颌面外科（Pr. 级别临床团队） | 高 |
| **Wouter Mollemans / Filip Schutyser / Paul Suetens**（+ 颌面外科 Nasser Nadjmi） | KU Leuven ESAT-PSI / MIRALab 生态；**Medicim**（后被 Materialise 收购） | mass-spring 与 tetrahedral FEM 手术规划系统，**唯一走通商业化路径的学术线之一** | UZ Leuven / 安特卫普颌面外科 | 高 |
| **Stefan Zachow / Evgeny Gladilin / Peter Deuflhard / Hans-Christian Hege** | ZIB（Zuse Institute Berlin, 德国） | 颅颌面手术规划、解剖-物理混合变形模型；衍生 **1000shapes GmbH** | Charité 颌面外科 | 中—高 |
| **Silvia Schievano / Alessandro Borghi / Owase Jeelani / David Dunaway / Paul Knoops** | UCL + **Great Ormond Street Hospital (GOSH)**，伦敦 | 统计形状模型 + 概率 FEM 做**正颌/颅缝早闭**结果预测；少数做了商业软件对照验证的组 | GOSH 颅面外科（自有真实患者队列） | 中—高 |
| **Peter Claes / Dirk Vandermeulen** | KU Leuven（医学影像计算 + 3D 面部成像） | 3D 面部形态计量、面型遗传、综合征面型检测 | UZ Leuven 遗传/颅面门诊 | 中—高 |
| **Stefan Schlager / 3D 颅面形态计量组** | University of Freiburg（德） | 颅面 3D 形态测量与深度学习 | 法医人类学/解剖学合作方 | 中 |
| **Reinhilde Jacobs** | KU Leuven（口腔颌面影像放射学） | 牙科 CBCT 影像 AI、数据集建设 | 口腔颌面外科 | 中 |
| **Xiaojun Chen（陈晓军）** 等 | 上海交通大学（生物医学工程 / 数字医学） | 颅颌面虚拟手术、手术导航与数字化规划 | 上海九院等颌面外科（需核实） | 中—低 |
| **Christian Coachman / Livio Yoshinaga** | 产业/临床（DSD 生态） | **Digital Smile Design** 协议与软件化，非学术论文路线 | 全球美学牙科诊所 | 中—高 |
| 国内临床主力（机构级线索） | 空军军医大学（第四军医大学）口腔医院、四川大学华西口腔医院、北京大学口腔医院、上海九院整复外科 | 数字化正颌/正畸、颅颌面修复的**临床流程与软件应用**为主，学术产出多为病例方法学而非新模型 | — | 中—低（需核实具体团队） |

**产业方（区分开！）**
| 主体 | 产品 | 性质 |
|---|---|---|
| Materialise | **ProPlan CMF** / Mimics | 商业软件，源于 Medicim/KU Leuven 线；临床在用，代码与模型不公开 |
| Dolphin Imaging（Patterson） | Dolphin 3D 正颌预测 | 长期临床标准软件；有第三方对比验证论文 |
| Align Technology | **ClinCheck**（含新近 AI 功能） | 牙齿移动模拟 + 笑容预览；**不做软组织面型预测**；专利封闭 |
| 3Shape / exocad / Planmeca / Carestream | Smile Design / Smile Creator / 口扫与影像软件 | 牙科数字化产业线，非预测模型论文 |
| Crisalix 等 | 3D 美学手术模拟（面部/胸部） | 医美术前可视化，营销导向，无同行评议验证 |
| Perfect Corp（YouCam）/ 美图（美图宜肤等） | AI 皮肤检测、虚拟试妆、肤质分析 | 皮肤**评估/增强现实**方向；是否含「治疗后外观预测」需核实 |
| Embody Inc. | AI 手术规划（骨科为主，被 Zimmer Biomet 收购） | 邻近领域的「AI 规划落地」案例，非颌面 |

---

## 四、发展脉络（时间线）

```
~1990s         2D 头影测量 VTO（Ricketts 等）+ 传统软组织分析
               ——「可视化治疗目标」的临床原版，无物理/统计模型
   │
~1995          统计形状模型方法论成形（Active Shape Models）
~1999          3DMM：3D 人脸参数化（数字人底座）
   │
~1998-2003     【第一次跃迁】患者个体化 FEM 面部软组织模型
               Chabanas/Luboz/Payan (Grenoble)、Gladilin/Zachow (ZIB)
               从 CT 建网格 + 弹性本构，模拟骨移动后的软组织变形
   │
~2004-2008     【临床化】KU Leuven / Medicim：从算法到临床验证
               Mollemans 等 2007 完整临床验证；随即商业化
               → Materialise ProPlan CMF、Dolphin 3D 成为临床主流
   │
~2006-2016     【第二次跃迁】统计形状模型 + 3D 立体摄影测量
               SPHARM-PDM、概率 FEM；GOSH/UCL、KU Leuven 用真实队列做验证
               开始出现「商业软件 vs 研究者方法」的定量比较
   │
~2017-2019     生成式方法爆发（pix2pix / CycleGAN / SPADE / StyleGAN）
               + 医学侧皮肤 AI 引爆（2017 Nature）
               + 3D 人脸基础模型成熟（FLAME、FaceScape）
               —— 但两条线此时基本**还没接上**
   │
~2020-2022     【第三次跃迁尝试】年龄/皮肤编辑类生成模型（Lifespan、SAM）
               + 医学合成/去病变用于数据增强
               + 少数 ML 做颅颌面结果预测（GOSH 等）
               ⚠️ 关键缺口：临床配对数据（同患者治疗前后）极稀缺，
                  导致生成模型无法做监督训练 → 学术上转向合成/增强等「绕路」任务
   │
~2022-2025     【当前】扩散模型（Latent Diffusion + ControlNet）成为 I2I 主力
               3D 原生生成爆发（Gaussian Splatting、隐式表示、网格生成）
               「物理约束 + 神经生成」（FE-in-the-loop / physics-informed）被广泛
                  认为是正解，但【未找到】标杆级工作
   │
现在          状态判断：
               • 临床 = 有限元/生物力学商业软件（学术 20 年前成果的产业化）
               • 学界 = 小样本、无 benchmark、指标不统一的学习型方法
               • 生成式 AI 医学侧 = 集中在诊断与合成增强，**结果预测是待开采区**
```

**社区共识（我判断为共识）**
- 评价指标不统一 + 缺乏公开 benchmark + 缺乏外部验证，是这条线最大的方法论病灶。
- 只报 mm 级平均偏差不够，必须区分**术区（如颏部、鼻旁）**与**非术区**，并报告最坏情况。
- 术后**肿胀期**与**长期稳定期**是两个不同问题，用术后 1~3 个月影像验证是常见的方法学缺陷。

**争议 / 未决**
- 生成模型的「美颜化偏置」：皮肤/面部生成模型天然产出的「更光滑、更对称、更年轻」的结果，
  既可能被解读为虚假承诺，也可能确实符合患者的「理想化预期」——这是伦理与临床沟通的真问题。
- 预测结果是否属于医疗器械（SaMD）？医美场景的过度承诺与纠纷责任归属。
- 「预测越精确」不等于「临床越有用」：患者更关心的是决策辅助而非像素级还原。

---

## 五、实用资源（survey / 代码 / 数据集）——**全部待核实**

### Survey / Review（候选标题，需重新检索确认）
- 「Artificial intelligence / machine learning in orthognathic surgery: a systematic review」类（存在多篇，~2022-2024）
- 「Accuracy of soft tissue prediction in orthognathic surgery using 3D computer-assisted methods: a systematic review」类
- 「Machine learning in orthodontics: a scoping review」类
- 「Deep learning in dermatology」类综述（含生成式方法章节）
- 「GAN-based medical image synthesis: a review」类
- 「Deep learning-based skin lesion synthesis / inpainting」类
- 【未找到】明确以「术后外观预测」为题的跨学科综述 —— **这本身就是选题机会**

### 开源代码 / 工具（多数不在医学侧）
| 资源 | 性质 | 说明 |
|---|---|---|
| 3D Slicer + 其牙科/颅面扩展 | 开源（BSD 风格） | 医学影像分割/配准/可视化基础设施，颅颌面研究常用 |
| TotalSegmentator / nnU-Net | 开源 | 通用医学分割，前处理环节 |
| FLAME / SMPL-X 模型 | 学术开源（需同意条款） | 头部参数化先验 |
| DECA / EMOCA（3D 人脸重建） | 开源 | 从单图得 3D 面型，可作为「术后预测」的几何底座 |
| FaceScape 工具链 | 学术开源 | 高质量 3D 人脸数据与建模 |
| pix2pix / CycleGAN / SPADE 官方实现 | 开源 | 医学 I2I 的通用基线 |
| Stable Diffusion + ControlNet 生态 | 开源 | 当前最实用的可控 I2I 工具 |
| gsplat / 3D Gaussian Splatting 实现 | 开源 | 3D 原生重建与渲染 |
| 【未找到】正颌软组织预测的开源可复现实现 | — | 这是该领域最大的可复现性缺口 |
| 【未找到】痤疮/皮肤「治疗后外观预测」的开源实现 | — | 空白 |

### 数据集 / Benchmark（含公开程度）
| 数据集 / Benchmark | 领域 | 公开程度 | 备注 |
|---|---|---|---|
| HAM10000 | 皮肤镜 | **公开** | 皮肤 AI 事实标准，可做去病变/合成 |
| ISIC Archive | 皮肤镜 | **公开** | 大规模，持续更新 |
| Fitzpatrick17k / DDI（Diverse Dermatology Images）/ SCIN | 皮肤（含肤色多样性） | **公开** | 用于偏差与公平性研究 |
| ACNE04 | 痤疮图像 + 分级标签 | **公开（需核实许可）** | **是分级/计数，不是治疗后外观** |
| PAD-UFES-20 / Derm7pt | 皮肤 | 公开 | 相邻 |
| ISBI 2015 Cephalometric X-ray Landmark Challenge | 头影测量 | **公开** | 标志点检测，不是结果预测 |
| DENTEX / 3DTeethSeg（MICCAI 挑战赛） | 牙科影像分割 | **公开** | 牙齿分割/标注 |
| Tufts Dental Database / 公开全景片数据集 | 牙科 | 部分公开 | 需逐个核实 |
| FaceScape | 3D 人脸 | **学术公开** | 高质量 3D 面型 |
| FFHQ / CelebA-HQ / IMDB-WIKI / AgeDB / UTKFace | 2D 人脸 + 年龄 | **公开** | 年龄变换训练常用 |
| REALY / NoW Benchmark | 3D 人脸重建评测 | **公开** | 重建精度评测 |
| 正颌/正畸**配对**（术前-术后）3D 影像数据集 | — | **【未找到】公开数据集** | **这是整条线的核心瓶颈，几乎全是机构私有数据** |
| 颅缝早闭 / 唇腭裂纵向队列 | — | **【未找到】公开数据集** | 同上 |
| 「同一患者痤疮清除前后」配对数据 | — | **【未找到】** | 想做本选题就必须自建或合作获取 |

**关键结论**：本方向**不缺模型，缺数据与评价基准**。公开可得的全是「诊断/分割/标志点」数据；
一旦进入「治疗后外观预测」，就进入私有数据区。这决定了任何该方向的工作，
**论文可以发，benchmark 做不出来** —— 这也是为什么这个方向 20 年没有形成统一赛道。

---

## 六、用于 arXiv / OpenAlex 检索的关键词建议（中英对照）

> ⚠️ 重要：**医学侧 80% 的相关论文不在 arXiv**（在 MIA / IJOMS / AJODO / EJO / PRS / JAAD 等）。
> arXiv 只适合查**方法侧**；**临床侧必须用 OpenAlex / PubMed**。

### A. 临床任务词（OpenAlex / PubMed 主战场）
| # | 中文 | 英文检索式 |
|---|---|---|
| 1 | 正颌手术软组织预测 | `orthognathic surgery soft tissue prediction` |
| 2 | 正颌术后三维面型预测 | `three-dimensional soft tissue prediction orthognathic surgery` |
| 3 | 颌面外科手术规划 | `maxillofacial surgery planning soft tissue simulation` |
| 4 | 面部软组织有限元 | `patient-specific finite element model facial soft tissue` |
| 5 | 正畸面型变化预测 | `orthodontic treatment soft tissue profile prediction` |
| 6 | 拔牙矫治面型预测 | `extraction vs non-extraction soft tissue change prediction orthodontics` |
| 7 | 头影测量治疗目标 | `visual treatment objective cephalometric prediction` |
| 8 | 颅缝早闭术后头型预测 | `craniosynostosis spring distraction outcome prediction head shape` |
| 9 | 唇腭裂术后面部生长预测 | `cleft lip palate facial growth prediction surgical outcome` |
| 10 | 数字微笑设计 / 牙冠生成 | `digital smile design` / `automatic dental crown generation deep learning` |
| 11 | 隆鼻术后效果预测 | `rhinoplasty outcome prediction simulation` |
| 12 | 眼睑/面部提升模拟 | `blepharoplasty facelift simulation preoperative visualization` |
| 13 | 面部填充/注射效果预测 | `facial filler injection outcome simulation` |
| 14 | 皮肤病变去除/合成 | `skin lesion removal synthesis inpainting generative` |
| 15 | 瘢痕结局预测 | `scar outcome prediction machine learning` |
| 16 | 痤疮分级与图像 | `acne severity grading deep learning image` |
| 17 | 痤疮后皮肤外观 | `post-acne skin appearance simulation`（预期结果稀少，见 Gaps） |
| 18 | 面部老化/回春生成 | `facial age transformation rejuvenation generative` |
| 19 | 伤口愈合预测 | `wound healing outcome prediction deep learning image` |
| 20 | 手术结果预测（通用） | `surgical outcome appearance prediction deep learning` |

### B. 方法词（arXiv / cs.CV 主战场）
| # | 中文 | arXiv 布尔式 |
|---|---|---|
| 21 | 软组织形变建模 | `all:"soft tissue deformation" AND all:"finite element"` |
| 22 | 正颌 + 深度学习 | `all:"orthognathic" AND all:"deep learning"` |
| 23 | 颅面统计形状 | `all:"craniofacial" AND all:"statistical shape model"` |
| 24 | 医学图像翻译 | `all:"medical image" AND all:"image-to-image translation"` |
| 25 | 条件扩散医学合成 | `all:"diffusion model" AND all:"medical image synthesis"` |
| 26 | 可控编辑保持解剖 | `all:"controllable editing" AND all:"anatomy preservation"` |
| 27 | 3D 面型生成 | `all:"3D face" AND all:"mesh generation"` |
| 28 | 面部老化 | `cat:cs.CV AND all:"facial aging"` |
| 29 | 物理引导生成 | `all:"physics-informed" AND all:"generative model"` |
| 30 | 医学生成评价指标 | `all:"evaluation metrics" AND all:"medical image generation"` |

### C. 关键反查式（用标题直接反查 DOI 与引用数）
建议 parent 用 OpenAlex 的 **title.search** 反查下列标题（`openalex.py --title "..." --abstract`），
以一次拿到 **年份 + 期刊 + 引用数 + DOI**（这正是本文件留空的那几列）：
1. `Patient specific finite element model of the face soft tissues for computer-assisted maxillofacial surgery`
2. `Predicting soft tissue deformations for a maxillofacial surgery planning system`
3. `Anatomy- and physics-based facial animation for craniofacial surgery simulations`
4. `Three-dimensional soft tissue prediction in orthognathic surgery`（Dolphin / ProPlan CMF 对比）
5. `A Morphable Model for the Synthesis of 3D Faces`
6. `Learning a model of facial shape and expression from 4D scans`
7. `FaceScape`
8. `Lifespan Age Transformation Synthesis`
9. `Only a Matter of Style: Age Transformation Using a Style-Based Regression Model`
10. `Modeling 3D Facial Shape from DNA`
11. `Joint Acne Image Grading and Counting via Label Distribution Learning`
12. `ToothGAN`
13. `Artificial Intelligence in Dentistry: Chances and Challenges`

---

## 七、供 parent 代跑的精确检索清单（20-40 条，标注验证目标）

> 每条 = 一个可直接执行的查询串。`[arXiv]` 用 `~/.venv/bin/python ~/.agents/skills/web-search/scripts/arxiv.py "<式>" -n 8 --field all`；
> `[OA]` 用 `openalex.py "<式>" -n 8 --from-year 2015`；`[WEB]` 用 `search.py "<式>" -n 8`。
> **注意 arXiv 限流 1 req/3s**，批量请优先 `[OA]`。

| # | 通道 | 查询串 | 验证目标 |
|---|---|---|---|
| 1 | OA | `soft tissue prediction orthognathic surgery` | §二A 全部；正颌线整体盘点 |
| 2 | OA | `finite element facial soft tissue maxillofacial surgery planning` | 验证 Chabanas/Payan、Zachow/Gladilin 两条奠基线 |
| 3 | OA | `three-dimensional soft tissue prediction Dolphin ProPlan CMF` | 验证 Knoops/Borghi/GOSH 的软件对比论文 |
| 4 | OA | `mass spring model soft tissue deformation maxillofacial` | 验证 Mollemans/Suetens/KU Leuven 线 |
| 5 | WEB | `Knoops Borghi orthognathic soft tissue prediction Great Ormond Street` | 锁定 GOSH 组的作者与合作方 |
| 6 | WEB | `Zachow Gladilin ZIB Berlin soft tissue prediction maxillofacial 1000shapes` | 锁定 ZIB 线及衍生公司 |
| 7 | WEB | `Chabanas Payan TIMC Grenoble face soft tissue finite element model` | 锁定 Grenoble 线及临床合作方 |
| 8 | OA | `machine learning orthognathic surgery outcome prediction 3D` | 找出 2019 年后的学习型方法（§一.1 缺口） |
| 9 | OA | `deep learning soft tissue prediction after orthognathic surgery GAN` | **核心验证：是否已有 GAN/Diffusion 做正颌术后脸** |
| 10 | OA | `orthodontic treatment outcome prediction soft tissue profile machine learning` | §一.3 正畸结果预测（vs 标志点检测） |
| 11 | OA | `cephalometric landmark detection deep learning` | 验证「正畸 AI 多为前处理」这一判断 |
| 12 | OA | `extraction non-extraction decision machine learning orthodontics` | 拔牙矫治决策支持线 |
| 13 | OA | `craniosynostosis outcome prediction finite element spring distraction` | §一.2 颅缝早闭 |
| 14 | OA | `cleft lip palate facial growth prediction surgical outcome` | §一.2 唇腭裂 |
| 15 | OA | `statistical shape model craniofacial surgical planning prediction` | 统计形状模型线 |
| 16 | arXiv | `all:"craniofacial" AND all:"statistical shape model"` | 方法侧确认 |
| 17 | OA | `digital smile design` | 验证 DSD 是临床协议/商业软件而非论文 |
| 18 | OA | `automatic dental crown generation generative adversarial network` | 验证 ToothGAN / DCPR-GAN |
| 19 | arXiv | `all:"tooth" AND all:"generation" AND all:"adversarial"` | 牙齿生成方法侧 |
| 20 | OA | `rhinoplasty outcome prediction simulation artificial intelligence` | §一.5 隆鼻预测（判断是否有真实论文） |
| 21 | OA | `facelift blepharoplasty preoperative simulation deep learning` | §一.5 面部提升/眼睑 |
| 22 | OA | `facial aesthetic surgery outcome prediction generative model` | §一.5 整体 |
| 23 | WEB | `Crisalix 3D aesthetic surgery simulation AI` | 产业侧（区分产品 vs 论文） |
| 24 | OA | `skin lesion inpainting removal generative adversarial network` | §一.4 去病变 |
| 25 | arXiv | `all:"skin lesion" AND all:"inpainting"` | 去病变方法侧 |
| 26 | OA | `acne severity grading deep learning image dataset` | 验证「痤疮 AI = 分级」而非预测 |
| 27 | OA | `post-acne scar skin appearance simulation prediction` | **关键空白验证：是否有对口的痤疮后外观预测工作** |
| 28 | OA | `wound healing outcome prediction deep learning image` | 皮肤愈合预测邻近线 |
| 29 | OA | `burn scar hypertrophic scar prediction machine learning` | 瘢痕预测（§二E 的「仅有模糊印象」项） |
| 30 | OA | `facial age transformation rejuvenation generative` | §一.4 面部回春生成 |
| 31 | WEB | `Lifespan Age Transformation Synthesis ECCV 2020` | 反查引用数与精确信息 |
| 32 | WEB | `"Only a Matter of Style" SAM age transformation SIGGRAPH 2021` | 反查引用数 |
| 33 | OA | `medical image synthesis diffusion model controlnet anatomical fidelity` | §一.7 扩散模型医学 I2I |
| 34 | arXiv | `all:"diffusion" AND all:"medical image" AND all:"synthesis"` | 方法侧覆盖 |
| 35 | OA | `evaluation metrics medical image generation fidelity realism` | **评价标准争议（§一.7 争议）** |
| 36 | OA | `physics-informed generative model biomechanics simulation` | 「物理+神经」是否已有标杆 |
| 37 | arXiv | `all:"3D Gaussian Splatting" AND all:"face"` | 3D 原生生成的医学潜力 |
| 38 | WEB | `AI orthognathic surgery planning software Materialise ProPlan CMF Dolphin 2024` | 临床/产业现状（2024-2025） |
| 39 | WEB | `数字化正颌 软组织预测 软件 华西口腔 上海九院` | 国内临床侧现状（中文） |
| 40 | WEB | `acne treatment prediction AI skin simulation app 痤疮 治疗后 预测` | **直接冲本选题的核心问题，中英文各试** |

### 需要 parent 特别留意的「反向证据」任务
- 第 9、27、40 条是**证伪性检索**：如果它们返回空/无关，说明「术后外观预测」确为空白区，
  这本身就是本文最有价值的结论，请如实回填而不要凑数。

---

## Gaps（未能确认的部分）

1. **引用数与 DOI 全部为空** —— 需 OpenAlex title.search 补齐（已给出 13 条精确反查标题）。
2. **具体 URL 全部为空** —— 我拒绝编造。
3. **「痤疮清除后外观预测」是否真为空白**：我的判断是「无直接对口工作」，但**未经检索验证**，
   不排除有 2023-2025 年新论文。这是最高优先级的待验证项。
4. **整形美容（隆鼻/双眼皮）侧的论文标题**：我无法可靠给出，只能确认「产业 > 学术」。需第 20-23 条验证。
5. **中国团队（上海交大陈晓军、华西、九院）的具体代表作**：仅有机构级印象，作者与论文对应关系不确定。
6. **各方法报告的量化误差水平**：我不给数字（可能是「mm 量级」但具体值记忆不可靠），需从第 1-4、9 条结果中提取原文数值。
7. **是否存在「术后外观预测」的跨学科综述**：判断为不存在，需第 9/27/35 条确认。

**建议下一步（有网络环境时）**
1. 先跑 §七 第 1-4、9、27、40 条（决定性检索），确认空白区结论。
2. 再跑第 5-7、13-15 条锁定作者/机构。
3. 最后用 §六C 的 13 条标题反查补齐表格的年份/期刊/引用数。
4. 产出对比：**医学侧「结果预测」的成熟度 vs 数字人博客已有 100+ 篇技术侧文章** —— 这中间的空隙很可能就是选题的落点。
