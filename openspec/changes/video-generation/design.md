## Context

见 `proposal.md`。旧的 `drafts/video-generation.org` 已按用户要求删除，不再作为素材来源。系列共 8 篇正文和 1 个 Hub：首篇由扩散直觉进入 DDPM，随后讲连续时间扩散、DDIM 和条件图像生成，再进入视频任务、架构、数据评测与长视频生成。

主要素材入口：
- 扩散基础：`~/org/roam/notes/ai-ml/Diffusion Model.org`、`~/org/roam/notes/ai-ml/对扩散模型的理解.org`、`~/org/roam/articles/Denoising Diffusion Probablistic Models.org`、`~/org/roam/articles/DDIM.org`。
- 连续时间与 score：`~/org/roam/articles/EDM.org`、`~/org/roam/articles/DAPS.org`、`~/org/roam/articles/DAPS++:-Rethinking-Diffusion-Inverse-Problems-with-Decoupled-Posterior-Annealing.org`、`~/org/roam/notes/ai-ml/Flow Matching.org`；本地原始来源见 `raw/score-sde-continuous-diffusion/sources/README.md`。
- 条件图像生成：`~/org/roam/notes/ai-ml/CLIP.org`、`~/org/roam/notes/ai-ml/Stable Diffusion.org`、`~/org/roam/notes/ai-ml/ControlNet.org`、`~/org/roam/articles/DreamBooth.org`、`~/org/roam/articles/LoRA.org`、`~/org/roam/articles/Stable Diffusion 3.org`。
- 视频：`~/MyDoc/数字人/CVPR2024 Video Diffusion Tutorial - Part 1 - Video Generation & Editing.pdf`、`src/pages/slowfast-paper.html`。
- 用户提供的扩散直觉视频：`https://www.youtube.com/watch?v=iv-5mZ_9CPY`；核实标题、频道和发布时间后用于教学背景，不作为公式的唯一来源。

未下载到仓库的原论文、官方技术报告、模型卡和数据集卡，写作前须收集至对应 `raw/<slug>/sources/`，记录版本、页码/章节和引用信息；无法取得时以可访问的官方来源替代并披露。MIT 课程笔记尚未定位，不得将现有 Roam 笔记称为该课程材料。

## Goals / Non-Goals

**Goals:**
- 让读者按先修关系从扩散基础逐步进入视频生成，区分训练目标、概率过程、采样算法与具体模型架构。
- 将每篇控制在一个主要问题内；以 Hub 提供统一目录、阅读路线、术语和跨篇导航。
- 所有公式、数值、模型能力、数据集规模和评测结论都有可追溯的一手或官方来源。

**Non-Goals:**
- 不把系列写成一篇超长文章或逐篇复述全部代表论文。
- 不将动作识别架构误称为视频生成模型，不把单个模型的设计泛化成领域通则。
- 不恢复已删除草稿、不修改 Roam 原笔记；本次更新 OpenSpec 规划文件时不直接创建/发布页面。

## Writing Skills and Templates

- **正文页面**：使用库内 `html-blog` skill 作为生成和发布 HTML page 的唯一入口；调用 `capture.js <slug>`，以 `templates/article-template.html` 创建骨架。
- **Hub 页面**：调用 `capture.js <slug> --hub`，以 `templates/hub-template.html` 创建骨架；保留模板的列表/卡片/图谱结构，不另造模板。
- **语法与引用**：按需读取 `blog-syntax` skill 的 MathJax、引用、图片和组件规范；事实性内容用 `#key#` 引用，`.sources` 每项包含对应 `data-cite-key`。
- **分类与系列**：使用 `blog-categories` 和 `blog-aliases` skills 核验 `categories/AI/视频生成`、Hub alias、sub_id、分类 alias 和前后篇导航；正文通过 `aliases` 中的 `categories/` 路径归类，不添加已废弃的 `hub` frontmatter 字段；按 `blog-rules` 执行内容型 change 审批门禁。
- **规划文档模板**：本 change 的提案、设计和任务分别遵循 `.agents/skills/blog-rules/templates/content-change/proposal.md`、`design.md`、`tasks.md`；正式写作前仍须用户确认「文章内容大纲」。
- **不适用项**：本系列不是课程笔记或单篇论文精读，不套用 `course-notes` 的课件模板，也不以 `read-article` 的论文模板组织整组文章。

## 本地检查、构建与预览

- **单页 lint**：对每个新建或修改的文章运行 `node lib/lint-html.js src/pages/<slug>.html`，检查 HTML 源文件和站点约定；修复本次涉及页面的错误。
- **运行测试**：`npm test` 执行 `tests/run.js` 中的自动化断言，检查解析器、页面生成器、目录、替换和 shortcode 等代码行为；它本身不生成网站。
- **构建**：`node build.js`（或 `npm run build`）会先执行测试门禁，再生成 `public/` 下的文章、分类索引、搜索索引等站点文件。每次完成或修改页面后都应构建；构建成功是本地预览最新内容的前提。无需为了重复而在构建成功后另跑一遍 `npm test`，除非需要单独诊断测试。
- **自动预览**：构建成功后运行 `npm run serve`，在 `http://localhost:4000/` 提供预览。该命令监控 `src/`、`lib/`、模板、数据和配置；后续改动会自动重建并通过 LiveReload 刷新浏览器。分享或验收时给出具体文章 URL，例如 `/diffusion-model-basics.html`。只想静态查看已构建文件时可用 `npm run preview`。
- **范围**：完整构建可能报告与当前文章无关的历史页面 lint 问题；要用单页 lint 判断本次文章是否通过，并记录全站遗留问题，避免将无关页面问题归到新文章上。

## 文章内容大纲

系列共 8 篇正文和 1 个 Hub。首篇合并扩散模型入门与 DDPM，避免把加噪、噪声预测和反向采样的直觉与数学定义人为拆开。下列逐节素材路径是当前可用入口；在正式写作前由任务 1.x 将原论文/官方材料存入对应 `raw/<slug>/sources/` 并补齐页码、章节及具体数值定位。教程性文章不强行套用论文精读的“方法—实验”结构；关键数据点若无可比口径则明确说明，不拼凑排行榜。

### `video-generation-hub`｜视频生成系列总览

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | Hub；aliases `视频生成系列`、`categories/AI/视频生成/index` 与 `categories/AI/视频生成`；sub_id `0` |
| 服务对象 | 读者能按基础、图像条件、视频架构、评测和长视频问题选择阅读路径。 |

**章节骨架**

#### 1 系列范围与阅读路线
- **写什么**：说明系列从扩散基础进入视频生成的组织逻辑，列出先修路线及各篇解决的问题。
- **素材来源**：本设计文档的 8 篇章节规划及各篇已核验的 sources。
- **必备元素**：系列目录、先修关系图、阅读建议和术语约定。

#### 2 主题地图与延伸资源
- **写什么**：按生成过程、条件控制、时空架构、数据评测、长视频/流式生成组织主题，不把模型清单当成知识地图。
- **素材来源**：CVPR 2024 教程 PDF；系列各篇已核验的 sources。
- **必备元素**：Hub 模板的列表/卡片/图谱导航；资源和未覆盖问题清单。

**关键数据点**：文章篇数与编号来自本设计；不在 Hub 中作未核验性能比较。
**配图计划**：1 张自绘系列路线图；按 Hub 模板使用可排序列表、主题卡片和文章图谱。

### `diffusion-model-basics`｜视频生成系列（1）：扩散模型入门——从加噪直觉到 DDPM

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `10`；Hub `video-generation-hub` |
| 服务对象 | 尚未系统学习扩散的读者能从生成分布直觉出发，推导 DDPM 的训练目标并解释反向采样。 |

**章节骨架**

#### 1 从生成分布到扩散直觉
- **写什么**：用数据分布、样本、训练与采样建立生成模型框架；以流形假设作直觉性解释：高维图像空间中的自然图像可能集中在低维结构附近，但“维数只有几十到上百”只能作为示意，不能写成普适事实。说明真实数据分布与模型分布集中在错开的低维支撑集时，首次出现即解释 KL 散度（Kullback–Leibler divergence）和 JS 散度（Jensen–Shannon divergence）的全称、方向性/有界性及其公式；仅在明确的支撑集与 GAN 目标假设下说明 KL 发散、JS 饱和及梯度缺乏有效方向，不泛化为“KL 梯度几乎处处为零”。再解释布朗运动/墨滴扩散的物理直觉：单个分子作随机运动，宏观净通量从高浓度流向低浓度；DDPM 借用逐步抹去结构的启发，但不是模拟像素中的真实分子。用高斯卷积说明加噪怎样平滑薄支撑分布，并以二维玩具分布和 Ho et al. 的 Figure 8 插值图建立直觉；图中的 image manifold 是解释性概念，不是严格流形证明。
- **素材来源**：`~/org/roam/notes/ai-ml/Diffusion Model.org`；`~/org/roam/notes/ai-ml/对扩散模型的理解.org`；`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` Figures 2、6、8；`raw/diffusion-model-basics/sources/sohl-dickstein-2015-nonequilibrium-thermodynamics.pdf`；`raw/diffusion-model-basics/sources/goodfellow-2014-generative-adversarial-nets.pdf`；`raw/diffusion-model-basics/sources/arjovsky-2017-wasserstein-gan.pdf`；`raw/score-sde-continuous-diffusion/sources/vincent-2011-neural-computation-dsm.pdf`。
- **必备元素**：符号表、训练与采样对照、噪声尺度示意；“流形假设 → 支撑集错位 → 散度/梯度问题 → 加噪平滑”的概念图；墨滴物理扩散与图像高斯扰动的类比边界。明确这是一种理解动机的简化图景：不可笼统声称 KL 在绝大多数地方梯度恒为零，也不可把 GAN 的训练困难全归因于流形错位；解释原始 GAN 理论中 JS 饱和与生成器梯度失效所依赖的条件。避免把物理直觉或通用高斯扰动误当成完整 DDPM 定义。

#### 2 前向马尔可夫链与任意时刻闭式
- **写什么**：定义 `β_t`、`α_t`、`ᾱ_t`，从 `q(x_t|x_{t-1})` 推导 `q(x_t|x_0)`，解释直接采样任意时间步的意义。
- **素材来源**：`raw/ddpm-training-sampling/sources/` 中的 Ho et al. 原论文；`~/org/roam/articles/Denoising Diffusion Probablistic Models.org`。
- **必备元素**：完整符号表、闭式公式和中间推导；明确 `T=1000` 是原论文配置示例而非普适常数。

#### 3 后验、噪声预测与训练目标
- **写什么**：推导 `q(x_{t-1}|x_t,x_0)`，解释前向过程由我们采样、所以实际加入的噪声 `ε` 已知，可以直接作为监督标签；网络预测该噪声并参数化反向均值，再说明 ELBO 项如何关联到噪声预测 MSE。以原论文 Algorithm 1 为依据写出训练伪代码，并指出噪声预测是常见参数化之一，不是扩散模型唯一训练目标。
- **素材来源**：`raw/ddpm-training-sampling/source-tar/main.tex` §3、`alg:training` 与附录；`~/org/roam/articles/Denoising Diffusion Probablistic Models.org`；`~/org/roam/notes/ai-ml/Diffusion Model.org`。
- **必备元素**：真实后验/模型反向分布对照；标明所加噪声是已知监督标签；理论加权目标与常用简化目标区别；忠实改写训练算法 1；参数化范围限定在 DDPM 本文所述内容。

#### 4 反向采样与随机性
- **写什么**：解释 DDPM 的反向链是学习到的概率转移，不是墨水自发聚拢或逐点倒放同一条前向噪声轨迹；从 `x_T ~ N(0,I)` 开始逐步估计反向分布并采样 `x_{t-1}`。可用“从稀疏区域回到高密度区域”作直觉，但把 score 称为随位置和时间变化的向量场，不定义成物理力。以原论文 Algorithm 2 写采样伪代码，并借 Figure 6 说明大尺度结构先出现、细节随后补齐。连续时间的反向 SDE 及 score 漂移修正留到正文 2 展开。
- **素材来源**：`raw/ddpm-training-sampling/source-tar/main.tex` §3、`alg:sampling`、`fig:cropped_cifar10_progressive_samples`；`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` Figures 2、6；`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §§3.2–3.3。
- **必备元素**：单步更新式、忠实改写采样算法 2、Figure 6 逐步生成示例；说明原论文报告的两种固定反向方差选择 `σ_t²=β_t` 与 `σ_t²=\tildeβ_t`；区分单步条件均值和完整生成轨迹；说明反向链逐步恢复的是数据分布结构，不承诺找回训练时那张唯一原图。

#### 5 Score 直觉与连续扩散预告
- **写什么**：用对数密度梯度解释 score，并指出它与噪声预测存在依赖噪声尺度的参数化联系；承接前文说明在加噪后的平滑分布上估计局部去噪方向，为后续 DSM/score matching 提供直觉，但不在本篇推导 DSM、Tweedie 或 SDE。
- **素材来源**：`raw/score-sde-continuous-diffusion/sources/vincent-2011-neural-computation-dsm.pdf` §4.2；`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §§1、3；`~/org/roam/articles/EDM.org`；`~/org/roam/notes/ai-ml/对扩散模型的理解.org`。
- **必备元素**：score 向量示意；用一个简短条件期望直觉说明固定带噪点可能对应多种干净样本，score 汇总各候选样本给出的局部去噪方向；完整 DSM 恒等式留给下一篇；明确 score 是局部对数密度梯度向量场，不是物理力，也不保证总是指向某个全局模态。

#### 6 小结：从离散 DDPM 到连续时间扩散
- **写什么**：回顾数据分布、前向链、噪声预测与反向采样；指出 DDPM 用离散时间组织噪声尺度，并引出下一篇的连续时间 score/DSM/SDE 视角。本节不提前展开视频任务。
- **素材来源**：Ho et al. DDPM 原论文；Song et al. SDE 原论文。
- **必备元素**：核心概念速查、离散与连续视角的衔接问题、下一篇阅读导航。

**关键数据点**：原论文步数、噪声日程与实验数字严格按原文口径引用；不把 `T=1000` 写成默认标准。
**配图计划**：使用 DDPM 原论文 Figure 2 的概率链图、Figure 6 的 CIFAR-10 逐步生成图和 Figure 8 的扩散潜变量插值/image manifold 图；保留自绘的支撑集错位、螺旋加噪和 score 向量场作为解释性补充。图中注明流形为启发式模型，不能暗示所有图像严格位于同一低维流形；原图注明论文图号与来源，正文不写文件转换等制作过程。

### `score-sde-continuous-diffusion`｜视频生成系列（2）：Score、DSM 与连续时间扩散

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `20`；Hub `video-generation-hub` |
| 服务对象 | 读者能理解去噪训练与 score 的联系，并分辨正向 SDE、反向 SDE、Fokker–Planck 与 PF-ODE。 |

**章节骨架**

#### 1 Score Matching 与 DSM
- **写什么**：先依 Hyvärinen 2005 分清 score matching 学的是对数密度梯度（向量场），再依 Pascal Vincent 2011 §4.2 解释 DSM 如何用已知扰动核的条件 score 作监督，并通过条件期望/Fisher identity 联系到扰动后边缘分布的 score。以固定带噪点为例，说明每个潜在干净样本给出一个条件去噪方向，边缘 score 是按后验概率加权的平均方向；这是概率梯度的数学关系，不是物理拉力。交代“DSM 是去噪 score 的训练目标”，不是连续时间扩散本身。
- **素材来源**：`raw/score-sde-continuous-diffusion/sources/hyvarinen-2005-score-matching.pdf` §§2–3；`raw/score-sde-continuous-diffusion/sources/vincent-2011-neural-computation-dsm.pdf` §§3–4.2（尤其印刷页 1666–1667）；`raw/score-sde-continuous-diffusion/sources/song-2019-score-estimation-ncsn.pdf` §§2.1、4.2（多噪声尺度 NCSN）；`raw/score-sde-continuous-diffusion/sources/lipman-2023-flow-matching.pdf` §§2–3；`~/org/roam/articles/DAPS.org`；`~/org/roam/notes/ai-ml/Flow Matching.org`。
- **必备元素**：score matching 与 DSM 目标；高斯扰动下 `∇_y log qσ(y|x)=(x-y)/σ²` 及 `∇_y log qσ(y)=E[(x-y)/σ²|y]` 的含义；条件 score 与边缘 score 的关系、各自假设和从噪声预测到 score 的尺度换算；明确 DSM 并非只针对连续时间。

#### 2 Tweedie 公式与去噪估计
- **写什么**：在明确高斯噪声参数化下推导条件均值估计，说明它不是逐样本精确逆变换。
- **素材来源**：`~/org/roam/articles/DAPS++:-Rethinking-Diffusion-Inverse-Problems-with-Decoupled-Posterior-Annealing.org`。
- **必备元素**：假设、推导步骤和参数化系数提示框。

#### 3 SDE 与 Fokker–Planck 密度演化
- **写什么**：介绍漂移/扩散项，逐项解释 Fokker–Planck 方程如何描述概率密度随时间变化；说明 Song et al. 2021 把离散扰动路径扩展为连续时间 SDE 家族，构成 score-based generative modeling 的统一连续时间框架。
- **素材来源**：`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §§1、3.1；`~/org/roam/articles/EDM.org`；`~/org/roam/articles/DAPS.org`。
- **必备元素**：一维示例；正向 SDE 与密度演化对应图。

#### 4 反向 SDE 与 Probability Flow ODE
- **写什么**：从 Anderson 1982 的反向时间扩散方程结果引出 reverse-time SDE，再给出 Song et al. 2021 的 score-based 特例；说明 score 向量场进入漂移修正，但反向 SDE 仍保留随机项。随后解释同一前向 SDE 诱导的 probability flow ODE，比较其确定性轨迹与反向 SDE 的随机轨迹。
- **素材来源**：`raw/score-sde-continuous-diffusion/sources/anderson-1982-reverse-time-diffusion-models.pdf` §§3–4；`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §§3.2–3.3、4.3；`~/org/roam/articles/EDM.org` § reverse-time SDE/PF-ODE。
- **必备元素**：公式并列、时间方向/正则性条件；明确 score 是向量场，不是物理力；边缘分布相同不表示样本轨迹相同。

#### 5 与 Flow Matching、v-prediction 的边界
- **写什么**：区分 score、扩散 probability-flow vector field、Flow Matching target velocity 和 ε/x/v prediction。
- **素材来源**：`raw/score-sde-continuous-diffusion/sources/lipman-2023-flow-matching.pdf` §§2–3；`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §4.3；`raw/score-sde-continuous-diffusion/sources/salimans-ho-2022-progressive-distillation.pdf` Appendix D §§26–31；`~/org/roam/notes/ai-ml/Flow Matching.org`；`~/org/roam/articles/EDM.org`。
- **必备元素**：概念对照表和适用参数化说明，不宣称概念等价。

**关键数据点**：公式系数依所选 VP/VE 参数化逐项核验；不跨参数化混用 `g(t)^2` 或噪声尺度。
**配图计划**：概率密度随时间演化图、SDE/PF-ODE 边缘分布对照图、概念关系图。

**历史定位**：DSM 的核心训练联系见 Vincent（2011），多噪声尺度的 score-based 建模与 annealed Langevin dynamics 见 Song & Ermon（2019）；Anderson（1982）给出一般反向时间扩散过程的理论结果。Song et al.（2021）将 score-based generative modeling 统一到连续时间 SDE 框架，并导出 reverse-time SDE 与 probability flow ODE。因此只把 2021 论文称作“连续时间 score-based 生成模型的统一框架”，不称作 SDE 或反向扩散理论的起源。

### `ddim-fast-sampling`｜视频生成系列（3）：DDIM——理解另一种扩散采样路径

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `30`；Hub `video-generation-hub` |
| 服务对象 | 读者能解释 DDIM 如何在保留训练目标联系的同时改变反向采样路径。 |

**章节骨架**

#### 1 从 DDPM 采样步数问题出发
- **写什么**：回顾 DDPM 反向链，明确 DDIM 改的是采样过程而非“把任意 SDE 直接变成 ODE”。
- **素材来源**：DDPM 原论文；`~/org/roam/articles/DDIM.org`。
- **必备元素**：训练过程与推理过程对照。

#### 2 非马尔可夫前向族与推导
- **写什么**：说明 DDIM 构造的边缘分布约束及其非马尔可夫过程，逐步推到采样更新。
- **素材来源**：Song et al. DDIM 原论文（收集至 `raw/ddim-fast-sampling/sources/`）；Roam DDIM 笔记，符号重新核验。
- **必备元素**：公式推导、符号定义、前向边缘与转移关系图。

#### 3 跨步更新与随机性参数
- **写什么**：解释跳步采样、η 参数及确定性/随机采样情形。
- **素材来源**：DDIM 原论文 § sampling；`~/org/roam/articles/DDIM.org`。
- **必备元素**：DDPM 与 DDIM 更新式比较表；步数和结果须标注实验条件。

#### 4 方法边界与后续连接
- **写什么**：总结 DDIM 与 DDPM、PF-ODE 的关系，连接后续条件扩散。
- **素材来源**：DDIM 原论文；`~/org/roam/articles/EDM.org`。
- **必备元素**：方法关系图和避免混淆的提示。

**关键数据点**：只报告原论文中明确给出的采样步数与质量结果，并注明数据集、采样设置和指标。
**配图计划**：采样路径图、DDPM/DDIM 跨步更新对照图。

### `conditional-image-diffusion`｜视频生成系列（4）：条件扩散——从 CFG 到潜空间图像生成

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `40`；Hub `video-generation-hub` |
| 服务对象 | 读者能理解条件信号如何控制图像扩散，并看懂从图像扩散迁移到视频的概念接口。 |

**章节骨架**

#### 1 条件生成与 Guidance
- **写什么**：解释条件分布、classifier guidance 与 classifier-free guidance，区分二者训练和推理机制。
- **素材来源**：对应 classifier guidance/CFG 原论文（收集至 `raw/conditional-image-diffusion/sources/`）；`~/org/roam/notes/ai-ml/Stable Diffusion.org`。
- **必备元素**：空条件 dropout 训练、条件/无条件预测组合公式和 guidance scale 作用。

#### 2 CLIP 与 DALL·E 2 的条件接口
- **写什么**：说明 CLIP 的图文表示用途及 DALL·E 2 中 prior 与 diffusion decoder 的职责，不把 CLIP 说成图像生成器。
- **素材来源**：`~/org/roam/notes/ai-ml/CLIP.org`；DALL·E 2 原论文/官方材料（收集至 raw sources）。
- **必备元素**：CLIP、prior、decoder 数据流图；区分 CLIP guidance 与 CFG。

#### 3 Latent Diffusion 与 Stable Diffusion
- **写什么**：说明压缩潜空间中的扩散、文本条件注入与像素空间扩散的计算差别。
- **素材来源**：`~/org/roam/notes/ai-ml/Stable Diffusion.org`；LDM 原论文来源文件待收集。
- **必备元素**：编码器—潜空间去噪器—解码器示意；分辨率/计算量等数值按原文注明口径。

#### 4 可控与个性化案例
- **写什么**：精简介绍 ControlNet、DreamBooth、LoRA 的适用问题和方法层级，不将其混为同类。
- **素材来源**：`~/org/roam/notes/ai-ml/ControlNet.org`、`~/org/roam/articles/DreamBooth.org`、`~/org/roam/articles/LoRA.org`、`~/org/roam/articles/Stable Diffusion 3.org`。
- **必备元素**：方法目标与训练/适配方式对照表；作为侧栏案例，不扩写为独立长综述。

#### 5 过渡到视频条件生成
- **写什么**：指出图像扩散可迁移的组件和视频额外需要处理的时间维度问题。
- **素材来源**：CVPR 2024 教程 PDF（对应页码在任务 1.3 记录）；`~/org/roam/notes/ai-ml/对扩散模型的理解.org`。
- **必备元素**：图像/视频条件维度对照和下一篇导航。

**关键数据点**：指导强度、模型分辨率、训练数据规模等仅在原论文/官方模型卡一致口径下对照。
**配图计划**：CFG 预测组合图、DALL·E 2 数据流图、潜空间扩散图。

### `video-generation-tasks-spacetime`｜视频生成系列（5）：视频生成任务与时空建模基础

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `50`；Hub `video-generation-hub` |
| 服务对象 | 读者能区分主要视频生成任务，并理解时空表示对生成模型的约束。 |

**章节骨架**

#### 1 视频生成任务地图
- **写什么**：定义 text-to-video、image-to-video、视频续写/延长、编辑等输入输出和条件差异。
- **素材来源**：CVPR 2024 教程 PDF（任务章节页码待记录）；本设计文档的系列范围说明。
- **必备元素**：任务—条件—输出—主要难点对照表。

#### 2 视频表示与时空依赖
- **写什么**：从帧序列、时空张量和潜变量解释空间与时间信息的耦合。
- **素材来源**：CVPR 2024 教程 PDF；`src/pages/slowfast-paper.html` 的视频表示部分。
- **必备元素**：视频张量示意和时间依赖图。

#### 3 3D convolution 与 R(2+1)D
- **写什么**：说明时空卷积及分解卷积的直觉，明确 R(2+1)D 原始语境是动作识别而非视频生成。
- **素材来源**：`src/pages/slowfast-paper.html`；R(2+1)D 原论文，待收集到 raw sources。
- **必备元素**：2D/3D/(2+1)D 运算示意及任务边界提示。

#### 4 生成问题中的架构约束
- **写什么**：归纳分辨率、帧数、时间一致性和计算成本如何影响后续视频扩散设计。
- **素材来源**：CVPR 2024 教程 PDF；Video Diffusion Models 原论文（后续篇共用来源文件）。
- **必备元素**：空间/时间计算维度对照图。

**关键数据点**：帧率、帧数、分辨率等定义各异，引用时同时记录采样策略和视频长度口径。
**配图计划**：视频任务地图、时空张量、R(2+1)D 分解示意。

### `video-diffusion-architectures`｜视频生成系列（6）：视频扩散模型的架构演进

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `60`；Hub `video-generation-hub` |
| 服务对象 | 读者能比较代表性视频扩散架构如何扩展图像生成能力，而不把个别设计当成统一范式。 |

**章节骨架**

#### 1 从早期视频生成到扩散范式
- **写什么**：概览视频生成建模路线，限定案例范围并解释为何逐步聚焦扩散。
- **素材来源**：CVPR 2024 教程 PDF（页码待核）；入选原论文 sources。
- **必备元素**：方法时间线，区分生成、预测和动作识别任务。

#### 2 Imagen Video 与级联生成
- **写什么**：解释文本到图像先验/视频扩展、级联空间或帧率超分辨阶段的具体设置。
- **素材来源**：Imagen Video 原论文/官方技术报告，收集至 `raw/video-diffusion-architectures/sources/`；教程 PDF。
- **必备元素**：作者提出的级联流程图和阶段对照表。

#### 3 Video Diffusion Models 与时空去噪
- **写什么**：分析该论文的 3D U-Net 与时空建模设计，标出哪些是论文特定设置。
- **素材来源**：Video Diffusion Models 原论文；教程 PDF。
- **必备元素**：时空网络示意、训练目标与推理过程区分。

#### 4 Make-A-Video 与数据利用
- **写什么**：解释其级联结构及图像/视频数据结合策略，区分论文事实与作者归纳。
- **素材来源**：Make-A-Video 原论文/官方材料；教程 PDF。
- **必备元素**：阶段流程和训练数据来源表。

#### 5 开源基模案例与比较边界
- **写什么**：以 ModelScopeT2V、Show-1、LaVie 为有限案例比较架构、数据和发布形态。
- **素材来源**：各原论文、官方仓库与模型卡，收集至 raw sources；Show Lab `Awesome-Video-Diffusion` 仅作发现索引。
- **必备元素**：统一比较表；明确权重/许可证/评测口径差异，不做无依据排名。

**关键数据点**：各阶段分辨率、帧数、训练数据和报告指标须按原论文逐项标注；不得把不同评测口径直接作优劣排名。
**配图计划**：方法时间线、三种代表架构/级联流程图、模型对照表。

### `video-generation-data-evaluation`｜视频生成系列（7）：训练数据、评测基准与评价指标

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `70`；Hub `video-generation-hub` |
| 服务对象 | 读者能判断视频生成论文中的数据来源、评测设置和数字是否可横向比较。 |

**章节骨架**

#### 1 训练数据与数据治理
- **写什么**：区分训练语料、验证/测试集与演示样本，介绍 WebVid-10M 的数据形态及可核实的限制。
- **素材来源**：WebVid-10M 原论文、官方数据集卡/仓库（收集至 `raw/video-generation-data-evaluation/sources/`）；教程 PDF。
- **必备元素**：数据字段、规模口径、过滤/许可与偏差说明表。

#### 2 评测基准与提示词设置
- **写什么**：说明基准构造、prompt、视频长度和生成设置如何影响结论。
- **素材来源**：代表性模型论文的 evaluation sections 和 benchmark 官方页面，归档至 raw sources。
- **必备元素**：基准—任务—输入条件—样本规模对照表。

#### 3 自动指标与人工评估
- **写什么**：解释常用质量、文本对齐、运动/时间一致性指标的含义、盲点和适用范围。
- **素材来源**：各 benchmark/metric 原论文与官方实现说明，归档至 raw sources。
- **必备元素**：指标解释表；指出单一分数不能覆盖的质量维度。

#### 4 如何阅读模型比较
- **写什么**：给出核查分辨率、帧数、采样步数、CFG、计算预算和筛选条件的阅读清单。
- **素材来源**：前篇模型论文实验表和模型卡；数据集与评测基准官方资料。
- **必备元素**：可复用评测口径检查清单；缺失数据明确标为未报告。

**关键数据点**：WebVid-10M 的规模、视频/文本字段和许可状态以数据集原始说明为准；指标结果必须同时写明 benchmark 版本、提示词和生成配置。
**配图计划**：训练/验证/测试数据流程图；评测维度矩阵；不同口径不可比示意。

### `long-video-temporal-consistency`｜视频生成系列（8）：时间一致性、长视频与流式生成

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `80`；Hub `video-generation-hub` |
| 服务对象 | 读者能把身份漂移、长程依赖和在线生成放入统一的时间建模问题中理解。 |

**章节骨架**

#### 1 时间一致性与身份漂移
- **写什么**：区分帧内质量、短时运动连贯性和跨片段身份/场景一致性。
- **素材来源**：代表性视频生成论文和评测来源待收集至 `raw/long-video-temporal-consistency/sources/`；本篇选题中的术语以原文定义为准。
- **必备元素**：一致性层级图和 failure case 分类。

#### 2 长程依赖、上下文和记忆
- **写什么**：解释上下文长度、attention sink、persistent memory 等概念及其在不同论文中的定义差异。
- **素材来源**：Custom Forcing 原论文及相关流式生成论文 sources；attention sink、persistent memory、longer contexts 分别按来源论文定义，不预设为同一机制。
- **必备元素**：方法概念对照表；标明 attention sink 术语在不同工作中的含义不必相同。

#### 3 扩散式整段生成与自回归分块生成
- **写什么**：比较整段/迭代去噪与因果分块生成的延迟、上下文和误差传播机制。
- **素材来源**：Custom Forcing 原论文；流式视频生成代表论文，归档至 raw sources。
- **必备元素**：块生成和 KV cache 示意；延迟、上下文窗口与误差累积定义。

#### 4 流式生成案例与设计权衡
- **写什么**：先总结通用机制，再用 Custom Forcing 解释训练/推理如何衔接及其适用边界。
- **素材来源**：Custom Forcing 原论文、官方项目页/代码仓库；`drafts/custom-forcing.org`（若与现有素材相符则作辅助）。
- **必备元素**：机制图、原论文报告的延迟/质量数据表及完整口径。

#### 5 总结与开放问题
- **写什么**：回扣时间一致性、长程上下文、延迟和可控性的权衡，给出后续阅读路径。
- **素材来源**：前述已核验 sources。
- **必备元素**：开放问题列表和系列回链。

**关键数据点**：身份一致性、帧率、首帧延迟、片段长度等需定义测量口径；不跨不同硬件、提示词或生成配置比较数字。
**配图计划**：时间一致性 failure case 图、上下文/记忆示意、流式块生成图。

## Decisions

- 合并扩散模型入门与 DDPM 为一篇完整基础章：先建立直觉，再推导前向链、噪声预测目标和反向采样；Score/DSM/SDE 及 DDIM 分篇展开，避免入门篇只铺垫却不落到具体模型。
- 系列共 8 篇正文；第 1–3 篇介绍 DDPM、连续时间扩散与 DDIM，第 4 篇作条件图像到视频条件生成的桥梁，第 5 篇才正式进入视频任务，之后讨论架构、评测和长视频问题。
- 在 `categories/AI` 下新建独立二级 subcategory `categories/AI/视频生成`。视频生成会涵盖扩散、Flow Matching、自回归和其他范式，不应嵌套在 `categories/AI/扩散模型` 下。Hub aliases 使用 `视频生成系列`、该路径及其 `/index` 形式；若缺失则在 `data/category-names.json` 增加 `视频生成: video-generation` 映射。
- Hub 使用 `sub_id: 0`，正文按 10–80 排序。合并后删除原 DDPM 独立篇，后续章节编号依序前移；发布前重新运行 sub_id 检查。
- 文章标题统一采用“视频生成系列（N）：……”；所有正文共享系列 alias 和核心 tags，通过分类 alias 归类并使用 chapter-nav 链接 Hub；正文 frontmatter 不设置 `hub` 字段，Hub 使用 `capture.js --hub` 骨架。
- 教程文章不伪造论文式实验章节；数据评测单列一篇，代表性模型仅作为案例，不进行口径不一致的排行榜比较。
- 用户已确认本「文章内容大纲」；正文生成与发布按 `tasks.md` 中的校验和系列导航任务继续执行。

## Risks / Trade-offs

- [范围仍广] → 按篇限定核心问题；超出篇幅的个性化方法仅作案例或延伸阅读。
- [原论文与数据卡尚未全部归档] → 任务阶段逐篇收集到 `raw/<slug>/sources/`，记录版本和定位；缺失时以官方资料替代并披露。
- [新 subcategory 尚未登记] → 发布前补充 `data/category-names.json` 映射和分类组织文档中的系列登记，对新路径重跑编号检查，并验证 Hub 索引替换效果。
- [不同模型评测不可直接横比] → 报告数字时同步列出数据集、分辨率、帧数、提示词、推理配置、硬件和指标版本；缺项则不作强结论。
- [理论公式依赖参数化] → 先固定符号约定，逐式核对 VP/VE 系数、时间方向和适用条件。
