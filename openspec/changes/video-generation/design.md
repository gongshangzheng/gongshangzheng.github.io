## Context

**当前设计状态（2026-10-15）**：EDM 九章正文已完成。最新规划新增图像基模篇，接在条件扩散后、视频任务前；完整 Stable Diffusion/VAE/LDM 内容移入图像基模篇，条件扩散扩展控制、适配与编辑。图像基模十章草稿及现代基模增补均已获写作授权，正文已生成（八/80）；条件扩散十章及 prior 增补均已审阅通过，用户已授权正文写作，正文已依据草稿完成。

用户强调正文引用必须位于文末参考来源；首篇保留已插入笔记的原论文图 4（Algorithms 1–2）和图 5（Figure 6），并列入用户给出的 AIDIY Wiki、抖音视频和 3Blue1Brown 客座视频。
见 `proposal.md`。旧的 `drafts/video-generation.org` 已按用户要求删除，不再作为素材来源。系列规划为 17 篇正文和 1 个 Hub，按本轮确认的阅读顺序组织；EDM 保留为前述方法的总结与设计空间分析。

主要素材入口：
- **内部素材使用规则**：下列 Org 路径仅供作者查找和核对素材，不在面向读者的文章中提及，也不作为正文引用；正文引用应指向原始论文、官方文档或可核验的一手来源。
- 扩散基础：`~/org/roam/notes/ai-ml/Diffusion Model.org`、`~/org/roam/notes/ai-ml/对扩散模型的理解.org`、`~/org/roam/articles/Denoising Diffusion Probablistic Models.org`、`~/org/roam/articles/DDIM.org`。
- 连续时间与 score：`~/org/roam/articles/DAPS.org`、`~/org/roam/articles/DAPS++:-Rethinking-Diffusion-Inverse-Problems-with-Decoupled-Posterior-Annealing.org`、`~/org/roam/notes/ai-ml/Flow Matching.org`；本地原始来源见 `raw/score-sde-continuous-diffusion/sources/README.md`。
- EDM 设计空间：`~/org/roam/articles/EDM.org`；原论文 PDF、源码与补充材料位于 `raw/edm-2022/`。
- Flow Matching：既有 `src/pages/flow-matching.html` 与 `src/pages/network-flow-matching.html`；Lipman 原文现有副本为 `raw/score-sde-continuous-diffusion/sources/lipman-2023-flow-matching.pdf`。Rectified Flow、Wan 原论文与独立 `raw/flow-matching/` 分析归档仍待完成。旧 change 历史材料见 `merged-plans/restructure-flow-matching-article/`，执行要求以当前文档为准。
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

## 核心问题与解法速览

- **问题是什么？** Karras 等人指出，扩散论文常从不同理论框架推导训练和采样细节，读者容易把噪声参数化、采样器、网络预条件和训练目标理解成不可拆开的整套模型；这会遮蔽哪些选择能够单独调整。论文把范围限定在以神经网络估计高斯扰动数据分布 score 的 DSM 类模型（`raw/edm-2022/source-tar/paper.tex` §1，lines 86–104）。
- **作者的解决办法是什么？** 将不同扩散模型改写到共同的噪声条件去噪接口，再明确列出采样、噪声离散、ODE 数值求解、随机 churn、网络预条件、噪声训练分布和 loss weighting 等设计选择；逐项改进采样与训练并通过替换已有模型采样器和重新训练来评测（`paper.tex` §§2–5；`figures.tex` Table 1、Algorithms 1–2、Table 2）。
- **核心思想（几句话）**：用 `σ` 作为贯穿训练和采样的噪声尺度，让去噪器、score、probability-flow ODE 和数值采样器共享可读接口。EDM 的价值是把设计变量显式化并用实验比较组合；作者并未证明所有变量的实际效果彼此独立，也未声称论文中的默认参数适用于所有数据集（`paper.tex` §§2–5、Conclusion）。
- **具体机制（几句话）**：训练时从干净样本 `y`、噪声 `ε` 与噪声尺度 `σ` 构造 `x=y+σε`，用带 skip/input/output/noise preconditioning 的 `Dθ(x;σ)` 预测干净数据；其理想 MSE 解与扰动后边缘 score 满足 `∇x log pσ(x)=(D*(x;σ)-x)/σ²`。采样时以概率流 ODE 从高噪声向低噪声积分，使用 rho schedule 与 Heun 二阶解算；可选 churn 暂时加大噪声并注入新噪声，再继续 ODE 更新（`paper.tex` §2 Eq. `eq:scoredenoiser`、§3 Eq. `eq:discretization`、§4 Eq. `eq:sde`、§5 Eq. `eq:preconditioning`）。

## Writing Skills and Templates

- **草稿持续参考**：各篇元数据中的「原始草稿」是正文写作与审校的持续依据。写作前完整读取，逐章核对其中的解释、例子、中间推导、图示和引用；Design 决定结构与范围，原论文核验事实。第二篇正在逐章共写，当前旧章节骨架尚未按新草稿修订；后续重写前须同步并确认 Design。

- **正文页面**：使用库内 `html-blog` skill 作为生成和发布 HTML page 的唯一入口；调用 `capture.js <slug>`，以 `templates/article-template.html` 创建骨架。
- **Hub 页面**：调用 `capture.js <slug> --hub`，以 `templates/hub-template.html` 创建骨架；保留模板的列表/卡片/图谱结构，不另造模板。
- **语法与引用**：按需读取 `blog-syntax` skill 的 MathJax、引用、图片和组件规范；事实性内容用 `#key#` 引用，`.sources` 每项包含对应 `data-cite-key`。
- **分类与系列**：使用 `blog-categories` 和 `blog-aliases` skills 核验 `categories/AI/视频生成`、Hub alias、sub_id、分类 alias 和前后篇导航；正文通过 `aliases` 中的 `categories/` 路径归类，不添加已废弃的 `hub` frontmatter 字段；按 `blog-rules` 执行内容型 change 审批门禁。
- **多分类语义**：每条不以 `/index` 结尾的 `categories/` alias 都代表一条分类归属；构建器必须将文章加入所有对应分类页、搜索/图谱索引和按分类筛选结果。`categoryPath` 保留为首条路径供旧消费者兼容，完整列表使用 `categoryPaths`。文章元信息展示各条路径，Hub alias 继续只用于覆盖索引页。
- **规划文档模板**：本 change 的提案、设计和任务分别遵循 `.agents/skills/blog-rules/templates/content-change/proposal.md`、`design.md`、`tasks.md`；本轮合并后的 Flow Matching 大纲、配图与系列顺序是新的审批对象；用户确认后再重写 Flow Matching 正文和调整新增编号/导航。EDM/DDIM 既有实施授权与完成记录仍有效。
- **论文分析与正文边界**：EDM 按 `read-article` 的方法完成 raw 分析和 synthesis 定位；分析文件供作者回源，公开文章只引用 Karras et al. 原论文及其他一手来源，不提内部 Org 笔记。Flow Matching 同样采用原论文回源分析与 synthesis 方法。成文采用系列教学结构，不强套论文精读的 7-Part 格式。
- **不适用项**：本系列不是课程笔记，不套用 `course-notes` 的课件模板。

## 内容质量规则

以下规则用于新增及后续重写的系列章节；Flow Matching 必须逐项满足。

- **读者主线**：Design 中直接确定简短章节标题，每节说明它回答的问题、需要的先修概念及如何承接下一节。正文按“问题 → 构造 → 验证 → 训练 → 采样 → 应用”展开，禁止连续堆叠术语和最终公式。
- **数学推导**：每个核心结论必须写出假设、变量、端点/时间方向、中间代数或期望运算和解释。条件量与边际量、真实标签与网络预测、理想分布与数值近似分别说明；证明损失关系时明确是差常数、同梯度还是仅经验复用。提供训练/推理流程和一个可检查的小例子。
- **一手来源**：正文写作前获取原论文 PDF，能取得时同时归档源码和附录至 `raw/<slug>/sources/`；来源记录包含作者、年份、版本、URL、实际页码、章节、公式/定理/图号。已有仓库副本可复用，不能把“计划下载”写成“已经读过”。Org 和旧博客只用于找素材，核心公式与应用结论回到原论文核验。
- **图示设计**：每张图在 Design 中列明标题、插入位置、形式（原文图、解释图或 Mermaid）、来源与裁切范围，以及读者应观察什么。Mermaid 用于步骤/数据流；数学向量场和轨迹用确定性绘图工具；关键原文方法图、轨迹或算法局部图优先使用论文原图。学术场景不使用 AI 生图。
- **图中文字与公式**：SVG 上下标用独立 `tspan` 的字号与位置控制，或将 LaTeX 公式渲染为 SVG 路径；不依赖当前字体缺失的 Unicode 上下标字符。栅格图也需使用能覆盖所需字符的字体，必要时排版数学文字后再导出。核查图片、图例、上下标和 Mermaid 在桌面与窄屏均可读。
- **原文截图**：只截所需的原图、公式或算法区域，保留必要图例、坐标和标签；公式不是伪代码，作者整理的流程不是原文算法。图注标明来源、原文图号/公式号和教学说明，不写转换/裁切操作。
- **公式排版与验收**：display math 不包在 `<p>` 中；源码的多行 LaTeX 采取站点安全写法，预览中检查无 `</p><p>` 字面文本、无 MathJax 错误、无公式与文字重叠，长公式局部滚动。表格保留短公式，完整推导在表外。完成单页 lint、构建和浏览器检查后逐篇交用户审阅。

## 本地检查、构建与预览

- **单页 lint**：对每个新建或修改的文章运行 `node lib/lint-html.js src/pages/<slug>.html`，检查 HTML 源文件和站点约定；修复本次涉及页面的错误。
- **运行测试**：`npm test` 执行 `tests/run.js` 中的自动化断言，检查解析器、页面生成器、目录、替换和 shortcode 等代码行为；它本身不生成网站。
- **构建**：`node build.js`（或 `npm run build`）会先执行测试门禁，再生成 `public/` 下的文章、分类索引、搜索索引等站点文件。每次完成或修改页面后都应构建；构建成功是本地预览最新内容的前提。无需为了重复而在构建成功后另跑一遍 `npm test`，除非需要单独诊断测试。
- **自动预览**：构建成功后运行 `npm run serve`，在 `http://localhost:4000/` 提供预览。该命令监控 `src/`、`lib/`、模板、数据和配置；后续改动会自动重建并通过 LiveReload 刷新浏览器。分享或验收时给出具体文章 URL，例如 `/diffusion-model-basics.html`。只想静态查看已构建文件时可用 `npm run preview`。
- **范围**：完整构建可能报告与当前文章无关的历史页面 lint 问题；要用单页 lint 判断本次文章是否通过，并记录全站遗留问题，避免将无关页面问题归到新文章上。

## 文章内容大纲

系列规划共 17 篇正文和 1 个 Hub。阅读顺序：DDPM → Score/DSM/SDE → DDIM → Flow Matching → x-prediction → EDM → 条件图像扩散 → 图像基模 → 视频任务与开创性工作 → 开放视频基模 → 其他早期研究 → 训练高效方法 → 分镜与生成规划 → 长视频基模 → 多模态引导生成 → 数据评测 → 长视频与流式专题。各篇仍须以实质草稿为依据，分别确认大纲后写作。

### `video-generation-hub`｜视频生成系列总览

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-generation-hub.org](../../../drafts/video-generation/video-generation-hub.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | Hub；aliases `视频生成系列`、`categories/AI/视频生成/index` 与 `categories/AI/视频生成`；sub_id `0` |
| 服务对象 | 读者能按 DDPM、Score/DSM/SDE、DDIM、Flow Matching、x-prediction、EDM 设计空间、图像条件、视频架构、评测和长视频问题选择阅读路径。 |

**章节骨架**

#### 1 系列范围与阅读路线
- **写什么**：说明系列从 DDPM、Score/DSM/SDE、DDIM、Flow Matching 进入 x-prediction，再由 EDM 总结并进入条件图像，再转入视频生成的组织逻辑，列出先修路线及各篇解决的问题。
- **素材来源**：本设计文档的 17 篇章节规划及各篇已核验的 sources。
- **必备元素**：系列目录、先修关系图、阅读建议和术语约定。

#### 2 主题地图与延伸资源
- **写什么**：按生成过程、条件控制、时空架构、数据评测、长视频/流式生成组织主题，不把模型清单当成知识地图。
- **素材来源**：CVPR 2024 教程 PDF；系列各篇已核验的 sources。
- **必备元素**：Hub 模板的列表/卡片/图谱导航；资源和未覆盖问题清单。

**关键数据点**：文章篇数与编号来自本设计；不在 Hub 中作未核验性能比较。
**配图计划**：1 张自绘系列路线图；按 Hub 模板使用可排序列表、主题卡片和文章图谱。

### `diffusion-model-basics`｜视频生成系列（一）：扩散模型入门——从加噪直觉到 DDPM

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [diffusion-model-basics.org](../../../drafts/video-generation/diffusion-model-basics.org)；用户已认可结构；写作对照数学直觉、核心公式、采样与局限等小节 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `10`；Hub `video-generation-hub` |
| 服务对象 | 读者能理解为何对数据施加随机扰动、DDPM 如何训练噪声预测器，以及怎样从噪声反向采样生成图像。 |

**用户补充配图（2026-10-14）**：训练阶段插入用户提供的猫图噪声预测演示；生成阶段在反向均值及随机项公式之后插入逐步采样图，标为教学图而非原论文图；解释右端是原图估计、噪声 MSE 是训练目标，文本分支属于条件扩展。同步原始草稿，保留既有论文算法和样本图。

**章节骨架**

#### 1 数学直觉
- **写什么**：先定义流形假设：数据形式上处于 `R^d`，实际集中在低维流形 `M` 上或其近邻；用 MNIST 的 784 维像素点和同一连通区域内数字 2 的连续形变解释流形路径。明确当真实分布在某处有概率而模型分布在该处概率为零时，`D_KL(P||Q)` 可发散；解释直接分布匹配可能缺少有效梯度，但不泛化为“KL 总不可训练”。紧接着用墨滴扩散说明前向过程构造的是逐时刻变化的概率分布，反向过程在统计上从低密度区域走向高密度区域。介绍 Anderson 1982 的时间反演结论，并明确并非逐粒子倒放。最后用二维螺旋点云展示加噪后分布逐渐变宽、平滑。
- **素材来源**：`drafts/video-generation/diffusion-model-basics.org`；`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` Figure 8；`raw/score-sde-continuous-diffusion/sources/anderson-1982-reverse-time-diffusion-models.pdf`；`raw/diffusion-model-basics/sources/goodfellow-2014-generative-adversarial-nets.pdf` 与 `arjovsky-2017-wasserstein-gan.pdf`；用户提供的 AIDIY Wiki（流形假设/MNIST）；用户提供的抖音视频 `https://v.douyin.com/vYP9fbuu79I/`；3Blue1Brown 页面所列 Welch Labs 客座视频 `https://www.3blue1brown.com/lessons/diffusion-models/`。
- **必备元素**：`x∈R^d`、`M⊂R^d` 与距离近似的解释；MNIST 数字 2 的路径 `γ(t)` 及“像素直线插值未必合理”的边界；KL 的定义和支撑集错位直觉；概率路径与单条随机轨迹的区别；物理扩散只作类比。正文图像含 `media/images/diffusion-model-basics/ddpm-manifold-interpolation.webp`（Ho et al. Figure 8）和 `media/images/diffusion-model-basics/spiral-noising.webp`（合成示意，不冒充原论文图）。引用集中于文末参考来源。

#### 2 前向加噪
- **写什么**：定义 `β_t`、`α_t`、`ᾱ_t`；从一步高斯马尔可夫转移推导任意时刻边缘分布和重参数化式，解释为何训练时可直接采样指定时间步。
- **素材来源**：`raw/ddpm-training-sampling/source-tar/main.tex` §3，Eqs. (1)–(4)；`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` §3。
- **必备公式**：`q(x_t|x_{t-1})`、`q(x_t|x_0)`、`x_t=√ᾱ_t x_0+√(1−ᾱ_t)ε`；说明 `T=1000` 和线性噪声日程是 Ho et al. 的实验设置，不是通用常数。

#### 3 从 KL 到噪声损失
- **写什么**：写出变分目标中终点先验、逐步反向 KL、解码似然三类项；先求 `q(x_{t-1}|x_t,x_0)` 的高斯后验，再从 KL 的期望对数密度比推导各向同性高斯闭式。固定反向方差后，只保留依赖模型均值的平方误差；代入噪声预测参数化，推得带时间权重的噪声 MSE；最后解释原论文为何去掉权重并采用 `L_simple`，并说明简化目标不是完整 ELBO。
- **素材来源**：`raw/ddpm-training-sampling/source-tar/main.tex` §3 Eqs. (5)–(14)，尤其 Eqs. (8)、(10)–(14)；`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` §3；草稿中的逐步推导。
- **必备公式**：`D_KL(q||p)=E_q[log(q/p)]`；同方差各向同性高斯的 KL 均值平方项与方差项；`L_{t-1}` 的权重 `β_t²/[2σ_t²α_t(1−ᾱ_t)]`；`L_simple`。说明常数项为何与 `θ` 无关，并区分加权变分目标、`L_0` 解码项和简化训练目标。

#### 4 采样与反向采样
- **写什么**：先解释 sampling 是从概率分布随机抽取状态；再解释 DDPM 从 `x_T~N(0,I)` 开始，按模型的 `p_θ(x_{t-1}|x_t)` 逐时刻反向抽样直到 `x_0`。列出反向均值、方差与更新式，说明末步不注入随机噪声；反向采样不是减掉训练时原噪声、还原指定训练图像或逐步反转同一轨迹。
- **素材来源**：`raw/ddpm-training-sampling/source-tar/main.tex` §3 `alg:training` / `alg:sampling` 与 Figure 6；PDF Algorithm 1–2 和 Figure 6。
- **必备元素及配图**：在采样更新公式及说明之后保留**图 4：DDPM 训练与采样伪代码**（`media/images/diffusion-model-basics/ddpm-training-sampling-algorithms.webp`；只呈现原论文 Algorithm 1–2）和**图 5：CIFAR-10 无条件样本的渐进生成**（`media/images/diffusion-model-basics/ddpm-progressive-generation.webp`；原论文 Figure 6）；正文分别解释已知噪声如何作训练标签、从高斯噪声如何逐步抽样，以及图中展示的是 `x̂_0` 估计而非训练图像复原。图注注明 Ho、Jain 与 Abbeel（2020）和原文编号。

#### 5 DDPM 的局限与后续路线
- **写什么**：指出本篇介绍的原始形式是无条件模型，不能直接指定文字内容；指出其反向链按相邻时间步串行调用网络，原论文示例 `T=1000`，延迟较高。说明原链直接删步并非同一采样过程，跨步需专门构造；不要说扩散模型家族不能条件控制或永远不能跳步。
- **素材来源**：`raw/ddpm-training-sampling/source-tar/main.tex` §3、§4；DDIM、EDM 与条件扩散各自对应的原论文及本 change 后续文章设计。
- **必备元素**：指向 DDIM 的稀疏时间步采样、条件扩散/CFG 的内容控制、EDM 的采样器设计，以及 Score/SDE 和 Flow Matching 的概率路径视角；说明这些后续篇章分别处理不同问题，不把 Flow Matching 简化成 DDPM 的“换成预测速度”。

**关键数据点**：明确 `T=1000`、`β_1=10^{-4}` 至 `β_T=0.02` 是 Ho et al. 论文设置；反向固定方差两种选择为 `σ_t²=β_t` 与 `σ_t²=β̃_t`。所有数据随原文口径注明。
**配图计划**：保留 Ho et al. Figure 8 流形插值图、作者合成二维螺旋加噪图、原论文 Algorithm 1–2 图 4 截图、原论文 Figure 6 图 5。图 4 紧随训练损失与反向更新的公式说明，裁切范围限于原文并排的 Algorithm 1/2 伪代码；图 5 紧随渐进生成解释，保留 Figure 6 的完整 CIFAR-10 样本网格；Figure 8 与螺旋图放在数学直觉部分。引用统一列在正文末尾的参考来源中。
### `score-sde-continuous-diffusion`｜视频生成系列（二）：Score、DSM 与连续时间扩散

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [score-sde-continuous-diffusion.org](../../../drafts/video-generation/score-sde-continuous-diffusion.org)；用户逐章共写，当前确认转为正文；正文与审校继续对照完整草稿。 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `20`；Hub `video-generation-hub` |
| 服务对象 | 理解 DDPM 的噪声预测如何联系到 Score，掌握 SDE 如何描述前向路径、Score 如何进入反向 SDE 和概率流 ODE。 |

**章节骨架**

#### 1 DDPM 留下的问题
- **写什么**：从 DDPM 的噪声监督出发，提出条件噪声均值为何能给去噪方向、如何从离散时间推广到连续概率路径、反向生成是否必须保留随机项。用此作为全篇问题线。
- **草稿对应**：`* 从 DDPM 出发：我们还想理解什么`。
- **素材来源**：`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` Introduction、§2.2；DDPM 定义复用 `raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` §3。
- **配图**：Song et al. (2021) Figure 3 作为概率流 ODE 自适应求解的预告，避免把实验结果说成普遍的步数保证。

#### 2 数学基础
- **写什么**：统一介绍概率密度、条件分布和边缘化；梯度、散度与拉普拉斯；ODE、Euler；SDE、布朗增量和 Euler–Maruyama；概率守恒与连续性方程；条件期望为何是均方误差的最优预测。
- **草稿对应**：`* 数学基础` 全章。正文压缩重复解释，但保留 (\sqrt{\Delta t}) 随机尺度、均方误差分解与相应适用条件。
- **素材来源**：Song et al. (2021) §3.1、Appendix D.1；基本概率与微积分按草稿自洽推导。
- **必备公式**：(\partial_t p_t=-\nabla\cdot(p_tv))、Itô SDE 离散增量、(a^*(x)=\mathbb E[Y\mid X=x])。

#### 3 Score 是什么
- **写什么**：定义 (s_t(x)=\nabla_x\log p_t(x))，解释局部密度上升方向与对数密度的作用；用高斯和混合分布说明方向如何随位置改变；区分条件加噪核 Score 与整体边缘 Score。
- **草稿对应**：`* 什么是 Score`。
- **素材来源**：Hyvärinen (2005) §§2–3；Song et al. (2021) §2.2。
- **配图**：Song et al. Figure 1，说明数据到噪声的前向 SDE与 Score 参与的反向过程。

#### 4 DSM 怎样学到整体 Score
- **写什么**：从不可直接计算的边缘 Score matching 目标开始，推导高斯加噪核的已知条件 Score；用边缘化、贝叶斯后验平均与均方误差分解证明 DSM 理想最优解等于带噪边缘 Score。保留对称双来源示例、时间条件 DSM、Tweedie 后验均值估计和噪声/Score/干净样本的尺度关系。
- **草稿对应**：`* DSM：怎样用已知噪声学到未知 Score`；Tweedie 公式沿用当前正文中的推导段落。
- **素材来源**：Vincent (2011) §4.2、Appendix A（印刷页 1672）；Song et al. (2021) §3.3 Eq. (7)。
- **必备公式**：(\nabla_y\log q_\sigma(y\mid x_0)=-\epsilon/\sigma)、边缘后验平均、DSM 与 SM 相差参数无关常数、(\mathbb E[x_0\mid y]=y+\sigma^2\nabla_y\log p_\sigma(y))。

#### 5 多尺度 Score：NCSN 与退火 Langevin
- **写什么**：说明单一噪声尺度的覆盖困难；介绍共享的噪声条件 Score 网络、多尺度 DSM、单尺度 Langevin 更新和从大噪声到小噪声的退火采样；对照 DDPM 相邻时刻反向转移。
- **草稿对应**：`* NCSN：从多尺度 Score 到图像生成`。
- **素材来源**：Song & Ermon (2019) §§3.2.2、4.1–4.3、Eq. (5)–(6)、Algorithm 1、Figure 3。
- **原论文图**：仅保留 Algorithm 1 的局部截图和双峰高斯实验 Figure 3；明确后者用真实 Score，图像实验的超参数不与玩具实验混用。

#### 6 Song 的连续时间扩散框架

四个小节依次展开前向 SDE、反向 SDE、Fokker–Planck 和概率流 ODE；后三者不是独立二级章。

##### 6.1 前向 SDE
- **写什么**：定义 (dX_t=f(X_t,t)dt+g(t)dW_t)，说明连续时间扩展的是噪声路径索引与可用求解器，不会自动减少计算量。推导 DDPM 的连续极限 VP SDE 和 NCSN/SMLD 对应的 VE SDE，解释命名与边缘分布；说明连续 DSM 如何在时间上抽样训练。
- **草稿对应**：`* Song 的连续时间扩散框架`。
- **素材来源**：Song et al. (2021) §§2.2、3.1、3.3–3.4、Appendix B；Song & Ermon (2019) §§4.1–4.3；Ho et al. (2020) §3。
- **原论文图**：Figure 2 总览 SDE、反向 SDE 与概率流 ODE；Figure 5 对比离散扰动核和 VE/VP 连续推广。两图均附逐图解释。

##### 6.2 反向 SDE
- **写什么**：紧接前向 VP/VE 路径，从 Anderson 反向时间结果写出 (T\to0) 的反向 SDE，解释 Score 修正漂移、负时间步与布朗增量的关系。先回答如何生成，再转向确定性路径的存在性。
- **草稿对应**：`* 反向 SDE：Score 修正漂移，但过程仍有随机性`。
- **素材来源**：Anderson (1982) §§3–4；Song et al. (2021) §3.2。
- **必备元素**：反向 SDE 公式；与前向过程衔接，明确时间反演需要 Anderson 的结果，不依赖先讲 Fokker–Planck。

##### 6.3 Fokker–Planck：从随机轨迹到概率密度
- **写什么**：由短时布朗增量的均值与协方差推导 Fokker–Planck 方程；用热方程解释密度平滑；把扩散项写入概率流 (J_t=p_tf-\tfrac12g^2\nabla p_t=p_t(f-\tfrac12g^2s_t))，说明其作用是建立密度演化与 Score 的联系，为概率流 ODE 作准备。
- **草稿对应**：`* Fokker–Planck：随机轨迹怎样改变分布`。
- **素材来源**：Song et al. (2021) Appendix D.1 Eqs. (35)–(37)。
- **写作边界**：Fokker–Planck 描述边缘密度演化；单靠密度方程不唯一确定随机轨迹，反向 SDE 另由 Anderson 时间反演结果导出。

##### 6.4 概率流 ODE
- **动机与用途补充**：先回答反向 SDE 已能生成、为何仍需 PFODE；解释 ODE 求解器、确定性双向编码、模型似然三项用途。推导沿轨迹的对数密度变化与端点积分关系，区分模型密度、真实密度及数值误差；不声称 ODE 必然更快。来源为 Song 2021 §4.3、Appendix D.2。
- **写什么**：紧接 Fokker–Planck 的概率流表达，以连续性方程与密度演化方程对齐推导前向概率流 ODE，再说明从先验向数据反向积分；使用表格比较前向 SDE、反向 SDE 与 ODE 的随机性、时间方向和边缘分布关系。
- **草稿对应**：`* 概率流 ODE`。
- **素材来源**：Song et al. (2021) §4.3、Appendix D.1。
- **必备图表**：复用 Figure 2；保留当前正文的过程对照表。与反向 SDE 分章，避免在概率流推导中打断主线。

#### 7 与 Flow Matching、v-prediction 的边界
- **写什么**：区分 Score、probability-flow ODE 的速度、Flow Matching target velocity 和网络的 (\epsilon/x_0/v) 参数化；指出概率路径或向量场视角有关联，但训练目标不因此等同。
- **素材来源**：Lipman et al. (2023) §§2–3；Song et al. (2021) §4.3；Salimans & Ho (2022) Appendix D Eqs. (26)–(31)。
- **必备元素**：概念对照表，明确各换算式的参数化假设；末尾回顾和系列前后篇导航。

**关键数据点**：公式系数依 VP/VE 参数化核验；反向公式统一采用 (t:T\to0)；SDE 与概率流 ODE 只在适当条件下匹配各时刻边缘分布，不声称轨迹相同。NCSN 玩具实验与图像实验参数分别标注。

**配图计划**：Song et al. (2021) Figures 1、2、3、5；Song & Ermon (2019) Algorithm 1 局部截图与 Figure 3；一张 Mermaid 图概括“前向路径—DSM 学 Score—反向 SDE/PF-ODE 采样”。所有图片放在解释对应公式的段落旁，图注标论文与编号。

**本篇边界**：覆盖 Score/DSM、退火 Langevin、连续 SDE、Fokker–Planck、反向 SDE 与概率流 ODE 的关系；不展开 DDIM 跳步算法、EDM 参数化和完整 Flow Matching 推导，分别交给系列对应篇章。

**历史定位**：DSM 训练联系见 Vincent (2011)，多噪声尺度与退火 Langevin 见 Song & Ermon (2019)，反向时间扩散理论见 Anderson (1982)；Song et al. (2021) 统一连续时间 Score-based 建模并提出反向 SDE 与概率流 ODE 框架。

### `ddim-fast-sampling`｜视频生成系列（三）：DDIM——理解另一种扩散采样路径

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [ddim-fast-sampling.org](../../../drafts/video-generation/ddim-fast-sampling.org)；已与用户逐段共写并审阅；2026-10-14 用户授权同步本轮解释并发布正文 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `30`；Hub `video-generation-hub` |
| 服务对象 | 学过 DDPM 的读者能解释 DDIM 为什么能跳步、如何构造跨步转移、如何实际生成样本，以及它和 DDPM 的区别。 |

**写作主线**：DDPM 的串行采样瓶颈 → 去噪器在各噪声等级学到了什么 → 构造另一条满足相同边缘约束的路径 → 直接连接选定时间点 → 用网络预测完成实际采样 → 对比 DDPM → 检查速度与质量。每节先提出一个具体问题，再给直觉、公式和结论；章节标题直接采用下面的简短标题。读者应先理解构造动机，再看数学验证，最后看算法执行。

**符号与教学约定**：统一记 `a_t=\bar\alpha_t`，注明原 DDIM 论文的 `α_t` 对应这里的累计量 `a_t`；用 `t` 表示当前较高噪声时刻、`s<t` 表示目标较低噪声时刻。将跨步额外噪声标准差记为 `σ_{t→s}`，避免与全局噪声尺度混用。先讲已知 `x_0` 时的理论构造，再讲生成时只有 `x_t` 和网络的情况；两个阶段用明确段落分开。首次使用“边缘分布”时解释为“只观察某一个时刻的状态分布”，“联合分布”解释为“多个时刻怎样一起出现”；不能用术语替代解释。

**本轮已确认决策**：实际使用保持噪声预测网络与权重，改变去噪采样更新公式。不能将 DDPM 的训练描述为规定目标 t-1；原始采样器选择相邻转移，DDPM 也能重新构造跨步随机更新。确定性 DDIM 每轮重新预测残差，不是始终固定第一轮噪声。保留现有七个简短主章，将草稿扩充的对照推导落入构造与跳步章，避免重复正文。

**章节骨架**

#### 1 DDPM 为什么慢
- **草稿对应**：原始草稿中的“问题：采样为什么这么慢”及“构造：保留边际，改变路径”的对应解释、公式与图示；正文须逐项核对，不仅参照章节标题。
- **写什么**：回顾常规 DDPM 从 `x_T` 到 `x_0` 的相邻反向链，每走一步调用一次网络。以 `T=1000` 为原论文配置例子，说明串行依赖和网络调用代价；与训练时直接抽取任意 `x_t` 区分。提出目标：保留已训练去噪器，用更少的状态完成生成。
- **素材来源**：`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` §2–3、Algorithm 2；`raw/ddim-fast-sampling/sources/ddim-fast-sampling.pdf` §1–2；`raw/ddim-fast-sampling/source.tar` 内 `sections/1_introduction.tex`、`sections/2_background.tex`。
- **本轮补充**：开头明确训练 MSE 中没有目标 s，也不要求 t-1；写出相邻反向均值，说明独立对预测原图加噪不等于反向条件转移。提前放 DDPM/DDIM 对照表、Figure 1 左右子图和 Figure 2，加工后的箭头解释不得把条件依赖当作跳步。
- **必备元素**：相邻反向链与网络调用示意；解释为何不能直接删除 DDPM 循环中的若干步却继续使用原相邻步系数。避免声称 DDPM 完全不能少步采样：重新定义时间日程和转移方差，也可以构造跨步随机采样。

#### 2 去噪器学到了什么
- **草稿对应**：原始草稿中的“问题：采样为什么这么慢”及“构造：保留边际，改变路径”的对应解释、公式与图示；正文须逐项核对，不仅参照章节标题。
- **写什么**：写出 `x_t=√a_t x_0+√(1-a_t)ε` 与噪声预测 MSE，展示训练样本如何由 `(x_0,t,ε)` 直接产生。用“三个时刻各自的分布可以相同，而三者的关联不同”的小例子解释边缘与联合的区别。指出训练监督来自每个时刻的带噪样本，不要求网络输入整条加噪轨迹；因此同一噪声预测接口可以服务于不同的路径构造。说明这里提供的是重新设计的空间，实际可用的路径仍需下一节验证。
- **素材来源**：`raw/ddim-fast-sampling/source.tar` 内 `sections/3_method.tex` §3 开头、§3.2 Theorem 1；`raw/ddim-fast-sampling/analysis/methodology.md`「核心观察：训练目标不唯一决定联合路径」「目标函数的限定」。
- **必备元素**：带噪样本生成式、噪声回归损失、边缘/联合对照示意；用简短说明框保留 Theorem 1 对正方差和独立时间步参数的条件，并区分共享 U-Net 直接复用预训练网络的实验依据。不能把目标权重不同写成所有共享参数网络的损失严格相同。

#### 3 构造新的采样路径
- **草稿对应**：原始草稿中的“问题：采样为什么这么慢”及“构造：保留边际，改变路径”的对应解释、公式与图示；正文须逐项核对，不仅参照章节标题。
- **写什么**：以已知真实 `x_0` 为起点，亲自构造从 `x_t` 到目标 `x_s` 的条件转移，解释原文公式的系数为什么如此选择。
  1. 从当前状态提取标准化残差 `ε_t=(x_t-√a_t x_0)/√(1-a_t)`；在给定 `x_0` 的边缘分布下它是标准高斯，解释这不是网络预测。
  2. 先构造无额外噪声的路径 `x_s=√a_s x_0+√(1-a_s)ε_t`：同一个残差改变信号/噪声比例，就得到另一噪声等级的状态。用同一原图、同一噪声的三个等级示意，解释共享残差如何建立跨时刻关联。
  3. 再加入独立 `z~N(0,I)`，设 `x_s=√a_s x_0+cε_t+σ_{t→s}z`。为保持目标边缘方差 `1-a_s`，必须满足 `c²+σ_{t→s}²=1-a_s`，故 `c=√(1-a_s-σ_{t→s}²)`，并给出 `0≤σ_{t→s}²≤1-a_s`。
  4. 逐步算条件于 `x_0` 的均值和协方差，验证 `x_s|x_0~N(√a_s x_0,(1-a_s)I)`；再固定 `(x_t,x_0)`，写出对应条件高斯，其方差仅为 `σ_{t→s}²I`。明确这两个条件分布的方差不同，因为前者还对当前残差取了平均。
  5. 解释以这些条件分布和终端边缘可以定义一条联合路径；一般情况下，利用 Bayes 规则得到的前向转移还依赖 `x_0`，因此不再是 DDPM 的原马尔可夫链。先展示构造和验证，再介绍“非马尔可夫”名称。
- **素材来源**：`raw/ddim-fast-sampling/source.tar` 内 `sections/3_method.tex` §3.1 Eq. (6)–(8)；`sections/9_appendix.tex` Appendix B 的 `lemma:reverse-process-consistency` 及均值/协方差证明；`raw/ddim-fast-sampling/sources/ddim-fast-sampling.pdf` 对应正文与附录。
- **必备元素**：从未知系数 `c` 的方差约束推导出条件高斯，而非直接贴最终公式；共享残差路径示意；明确验证的是理论构造的条件边缘，不代表实际网络采样严格保持真实数据分布，也不承诺找回唯一原图。

#### 4 为什么可以跳步
- **本轮推导要求**：用 r=a_t/a_s 合并前向链；从高斯精度相加推导跨步后验 V 与均值，再与广义 DDIM 的残差系数对照。给出 eta=0/1 的限定关系。证明的是已知真实 x_0 的条件构造；以预测替代后不保证精确边际或等于执行所有中间学习转移。
- **草稿对应**：原始草稿中的“问题：采样为什么这么慢”及“构造：保留边际，改变路径”的对应解释、公式与图示；正文须逐项核对，不仅参照章节标题。
- **写什么**：回到上一节的构造，指出它只需要两端噪声系数 `a_t,a_s`，并未要求 `s=t-1`。因此可以只保留时间子序列 `0=τ_0<τ_1<…<τ_S=T`，直接构造各选中点之间的转移；回查原文 Appendix C.1，说明这定义了新的缩短路径，其选中时刻的理论边缘仍可验证为训练时的分布。用 `1000→750→500→250→0` 展示跨步路线，与完整链对照。
- **素材来源**：`raw/ddim-fast-sampling/source.tar` 内 `sections/3_method.tex` §4.2、Figure 2；`sections/9_appendix.tex` Appendix C.1「Accelerated sampling processes」；`raw/ddim-fast-sampling/figures/ddim-fast-sampling/diffusion-figure-acc.pdf`。
- **必备元素**：完整链/缩短路径图；明确“一次直接构造转移”不等于“精确合并原 DDPM 的多个学习转移”；一句完整因果说明：保留训练噪声等级 → 两端系数定义跨步转移 → 只在选中点调用网络 → 调用数由 `T` 降为 `S`。说明少步带来预测误差与路径离散误差，理论边缘构造不能保证任意大跳步的实际生成质量。

#### 5 DDIM 怎样采样
- **草稿对应**：原始草稿中的“问题：采样为什么这么慢”及“构造：保留边际，改变路径”的对应解释、公式与图示；正文须逐项核对，不仅参照章节标题。
- **写什么**：进入真正生成阶段：真实 `x_0` 不可知，从高斯初始状态开始，使用网络估计上一节需要的信号和残差。
  1. 给定当前 `x_t`，调用网络得到 `ε̂=ε_θ(x_t,t)`。
  2. 由前向公式逐行移项推导 `x̂_0=(x_t-√(1-a_t)ε̂)/√a_t`，解释它是当前状态下的干净图像估计。
  3. 将 `x̂_0` 和 `ε̂` 代入已构造的跨步转移，得到 `x_s=√a_s x̂_0+√(1-a_s-σ_{t→s}²)ε̂+σ_{t→s}z`，逐项解释。强调保留的预测残差与独立新噪声是不同的量，不能把公式概括为每次完全重新加噪。
  4. 先展开 `σ_{t→s}=0` 的确定性 DDIM，再介绍广义随机采样的 `σ_{t→s}(η)=η√((1-a_s)/(1-a_t))√(1-a_t/a_s)`，本文限于常用 `0≤η≤1`；避免在读者尚不懂主更新时同时堆放全部随机情形。
  5. 展示完整执行顺序：选时间表 → `x_T~N(0,I)` → 对每对 `t,s` 预测与更新 → 新状态传入下一轮，重新调用网络 → 终点 `s=0,a_0=1` 输出 `x̂_0`。交代高斯初始先验是高噪声终端分布的近似。
- **素材来源**：`raw/ddim-fast-sampling/source.tar` 内 `sections/3_method.tex` §3.2 Eq. (9)–(10)、§4.1 Eq. (12)，`sections/4_experiments.tex` 的 η 参数；`sections/9_appendix.tex` Appendix C.1；`raw/ddim-fast-sampling/analysis/methodology.md`「更新式与步长」。
- **必备元素**：从前向边缘到 `x̂_0` 再到采样更新的完整代入过程；三项分解图；小型两轮采样流程（每轮都重新预测，不能从头到尾固定第一次的 `x̂_0` 和 `ε̂`）；初始化、循环、终点和每轮网络调用说明。
- **原文算法图要求**：回查原论文正文与附录的算法环境；有原文伪代码时只裁切该块。若没有独立伪代码，使用原文 Eq. (12) 及必要采样描述的局部截图，准确标作采样公式；自行整理的采样循环必须标注其性质，不能将其冒充原文伪代码截图。制作与转换过程不写进正文图注。

#### 6 DDIM 与 DDPM
- **草稿对应**：原始草稿中的“问题：采样为什么这么慢”及“构造：保留边际，改变路径”的对应解释、公式与图示；正文须逐项核对，不仅参照章节标题。
- **写什么**：在读者已掌握构造和采样后，用一张表对比训练样本与噪声预测器、理论路径、生成转移、额外随机项和网络调用数。推导广义更新如何包含采用后验方差的 DDPM：令 `s=t-1`、`η=1`，算出 `σ_{t→s}²=β_t(1-a_{t-1})/(1-a_t)=\tildeβ_t`，再代入并合并信号项与残差项，得到 `μ_θ=(x_t-β_t ε̂/√(1-a_t))/√α_t`。不能只验证方差就宣称整条更新式相同。说明 DDPM 原论文也有 `β_t` 方差选择，等价结论需明确限定。
- **素材来源**：`raw/ddim-fast-sampling/source.tar` 内 `sections/3_method.tex` §4.1 与 `sections/9_appendix.tex` Appendix C.2「Derivation of denoising objectives for DDPMs」；`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` §3、Algorithm 2。
- **必备元素**：DDPM/DDIM 公式对照表；相邻步 `η=1` 时方差和均值的代数验证；两种控制量对照：`η` 改变随机性，`S` 改变调用次数。强调确定性本身不会减少网络调用；广义跨步随机采样也可以加速，所以“有随机项就不能跳步”不是结论。

#### 7 确定性与 ODE
- **草稿对应**：`ddim-fast-sampling.org` 新增“确定性与 ODE”。从结果节中提升原有 ODE 延伸框，作为反演的数学准备。
- **内容**：由 `u_t=x_t/√a_t`、`r_t=√((1-a_t)/a_t)` 推导 Euler 更新；说明连续 ODE 在满足适当正则性时可双向积分，确定性本身不保证单射或有限步严格可逆。
- **来源**：原论文 §4.3 Eq. (14)、Appendix B。

#### 8 DDIM 反演
- **批准记录**：用户已确认六个小节及先定义、再用途、再机制/推导的教学顺序，并授权开始更新正文。
- **原始草稿**：`drafts/video-generation/ddim-fast-sampling.org` 新增“DDIM 反演”，正文继续逐项对照该章。
- **8.1 反演是什么**：用 `y=2x+1` 求输入解释 inversion；定义图像到噪声编码、再生成的重建目标；区分模型编码与历史噪声。
- **8.2 为什么需要反演**：以保留人物、姿态与构图而改变红/蓝衣服为动机，说明重建、编辑、插值的价值；编辑需额外条件控制。
- **8.3 为什么能够反演**：从确定性 DDIM 到可双向积分的 ODE；区分确定性、连续可逆性与有限步近似反演。
- **8.4 反演怎样计算**：先写去噪式，重排得到依赖未知高噪声状态的隐式逆，再以当前低噪声点的网络预测近似，推出 `s→t` 更新；定义时间方向、信号系数与首步边界；强调每步重新预测、不同于独立随机加噪。
- **8.5 反演后能还原吗**：原论文 §5.4 与 Table 2，CIFAR-10 测试集、编码/解码各 S 步、像素归一化到 `[0,1]` 的逐维 MSE；列出全部 7 个数据点，解释有限步误差、网络场变化、终点与潜空间编码误差。
- **8.6 怎样用于编辑**：反演→原条件重建→修改条件生成；说明共享起点不保证只修改指定区域；将重建保真和编辑局部性作为后续问题。
- **图示**：定义后放 Mermaid“图像、噪声编码与重建”；计算步骤后用 Mermaid 表示反演循环（与编辑流程合并或分开按可读性）；重建实验处插入 PDF 第 9 页 Table 2 的完整局部截图 `reconstruction-table-original.webp`，仅包含表题及表格；编辑处 Mermaid 展示同一编码分叉为重建和编辑。原论文不提供对应真实照片文本编辑实验，不把教学例子标作论文结果。

#### 9 实验与局限
- **内容**：保留 FID、采样耗时、同一起点一致性实验和原图；汇总生成质量/步数权衡、反演误差、文本控制与视频一致性的边界。ODE 内容已前移到第 7 节。
- **来源**：原论文 §5.1–5.4、Tables 1–2；现有 `analysis/experiment.md`。

**关键数据点**：报告原文 CIFAR-10、CelebA 在 20/100/1000 步下的 FID 时保留 η 与数据集口径；墙钟加速与 NFE 减少分开说明，不把调用数减少当成任意硬件上的等比例速度保证。

**图片与 Mermaid 插入设计**：下表指定正文插入位置及公开标题，写作时按出现顺序统一编号。每张图前先解释它要回答的问题，图后指出读者应看哪条边、哪项方差或哪组结果。原论文截图只裁切所需图形/公式区域；保留必要的坐标、时间标签、图例和实验条件，正文图注引用原文图号与来源。Mermaid 用于步骤和依赖关系；噪声样本与方差构造用确定性 SVG/绘图工具呈现。

| 编号与标题 | 插入位置 | 形式与具体内容 | 原文定位与裁切范围 |
|------|------|------|------|
| 图 1：DDPM 的逐步采样 | 第 1 节解释反向链和串行调用后、提出减少步数的目标前 | 原论文图片；突出反向相邻状态依赖。图注说明图中前向与生成方向，网络调用成本在正文解释。 | DDIM PDF 第 2 页 Figure 1 左半图；裁切完整左侧图模型，保留 `x_0…x_T`、箭头及 `q/p` 标签。原图入口 `raw/ddim-fast-sampling/figures/ddim-fast-sampling/diffusion-orig.pdf`。 |
| 图 2：去噪器怎样训练 | 第 2 节写出噪声回归 MSE 后、解释边缘与联合前 | Mermaid 数据流图；`干净图像 + 时间 t + 已知噪声 ε → 构造 x_t → 网络预测 ε̂ → 与 ε 计算损失`；时间也连到网络，真实噪声分别连到构造和监督分支。说明训练无需输入整条路径。 | 作者依据原论文训练目标整理；不能标成论文原图。节点写短文字，数学表达放在相邻正文。 |
| 图 3：相同边缘，不同关联 | 第 2 节首次解释边缘与联合之后 | 自绘 SVG 玩具示意；固定同一 `x_0`，对比各时刻使用独立残差与共享残差的两种关联，标出每个时刻相同的理论高斯均值/方差和不同的跨时刻关联。用多次抽样点示意，不能用单条轨迹证明分布相同。 | 依据第 2 节边缘公式制作教学例子；明确两种玩具关联用于说明边缘不唯一决定联合，不将独立残差的示例称为 DDPM 前向链。 |
| 图 4：目标噪声怎样组成 | 第 3 节推得 `c²+σ²=1-a_s` 后、计算条件均值与协方差前 | 自绘 SVG 双面板；左侧展示同一图像与残差在三个噪声等级下的构造，右侧展示目标噪声方差由“保留残差 c²”与“独立新噪声 σ²”组成。所有噪声样本固定随机种子，标明这是已知 `x_0` 的理论构造。 | 依据原文 Eq. (7) 与 Appendix B Lemma 1；图中面积/长度若表示方差，按方差比例绘制，不能把标准差线性相加。 |
| 图 5：DDIM 的路径依赖 | 第 3 节解释 Bayes 规则与非马尔可夫名称后 | 原论文图片；指出 `x_0` 条件边，并与第 1 节图模型对应。说明这是推断路径，实际生成时真实 `x_0` 要由网络估计替代。 | DDIM PDF 第 2 页 Figure 1 右半图；保留全部条件边及状态标签。原图入口 `raw/ddim-fast-sampling/figures/ddim-fast-sampling/diffusion-generalized.pdf`。 |
| 图 6：直接连接选定时间点 | 第 4 节说明 `s` 不必等于 `t-1` 后、展示 `1000→750→500→250→0` 例子前 | 原论文图片；借原文 `τ=[1,3]` 示意说明生成只走选中状态。正文另写具体四步例子，不给原图添加未经说明的时间标签。 | DDIM PDF 第 5 页 Figure 2；裁切完整图模型，保留 `x_0,x_1,x_2,x_3` 与边。原图入口 `raw/ddim-fast-sampling/figures/ddim-fast-sampling/diffusion-figure-acc.pdf`。 |
| 图 7：原论文的采样更新 | 第 5 节完成 `x̂_0` 与跨步更新的逐行推导后、介绍确定性和 η 情形前 | 原论文局部截图；保留 Eq. (12) 的三项与原文下括号说明，供读者核对预测原图、方向项、新噪声项。正文解释截图是相邻步记法，跨步式已在前面推导。 | DDIM PDF 第 5 页 Eq. (12)；仅截公式块和必要的符号说明，不带整页或实验图。源码定位 `sections/3_method.tex` 的 `eq:sample-eq-gen`。若后续确实找到独立原文伪代码，再按原文身份安排截图；此公式截图不能称为伪代码。 |
| 图 8：DDIM 的采样循环 | 第 5 节完整执行顺序之后、该节结束前 | Mermaid 流程图；选择时间表 → 高斯初始化 → 取当前 `t` 和目标 `s` → 网络预测 → 估计 `x̂_0` → 按 η 更新 `x_s` → 是否到 `s=0`；未到终点则令当前状态为 `x_s` 并回到下一对时间点，到终点输出。标出每轮一次网络调用、新噪声仅在非零系数时使用。正文用前两轮追踪说明状态如何传递。 | 作者依据原文 §4.1–4.2 整理，标题/图注不称原文算法；Mermaid 节点避免长公式，计算公式放在旁边正文。 |
| 图 9：采样步数与生成耗时 | 第 7 节实验结果表和 FID 解释后、讨论实际加速时 | 原论文图片；展示耗时随步数变化及对应样本，保留横纵轴和图例，解释测量对象是生成 50,000 张图像。 | DDIM PDF 第 8 页 Figure 4；裁切 Figure 4 的两个完整面板，不带相邻 Figure 5。图注注明单张 NVIDIA 2080 Ti 与原论文测量条件；原图入口 `cifar10-tvh.pdf`、`bedroom-tvh.pdf`，目录同上。 |
| 图 10：同一起点，不同步数 | 第 7 节固定初始噪声的一致性观察后、ODE 延伸框前 | 原论文图片；从 CelebA 一致性样本中选取完整对照，保留每行步数，说明相似的是高层语义，像素和细节仍可能变化。 | DDIM PDF 第 20 页 Figure 9；局部裁切至少包含一组相同起点、不同步数的完整对照，保留行标签；每列对应相同起点。原图入口 `raw/ddim-fast-sampling/figures/ddim-fast-sampling/celeba-consistency.pdf`。 |

**表格标题与位置**：第 6 节均值/方差等价推导后放“表 1：DDPM 与 DDIM 的训练和采样”，涵盖机制和公式；随后放“表 2：随机性与采样步数”，对应 `η` 与 `S`。第 7 节实验设置说明后放“表 3：不同采样步数下的生成质量”，数据回查原文 Table 1。公式对照表保持短公式，完整代数过程放在表外；第 6 节以表格完成对照，无需再添加重复关系图。ODE 内容前移为独立章节，后接新增反演章节；其图示和 Table 2 截图按新增设计插入。

**本轮配图补充**：第一章将原论文 Figure 1 的两个子图并列对照，并使用原论文 Figure 2 预览短生成链；保留后文已有图与两个 Mermaid。图号按实际阅读顺序连续编号：共 12 个图示，含 2 个 Mermaid；开篇新增两幅对照图后，采样公式为图 9、采样循环为图 10。表格先给短对照，完整公式在表外推导。

**读者理解验收**：读完后应能用自己的话回答：为什么保持训练边缘仍能改变轨迹？条件转移的根号系数如何由方差约束得到？为什么 `s` 可以不是 `t-1`？没有真实 `x_0` 时每一步用什么估计它？每轮有哪些旧量、预测量和新随机量？哪些条件下广义更新与 DDPM 相同？若正文只能提供最终公式而不能支撑这些回答，视为章节未完成。

### `flow-matching`｜视频生成系列（四）：Flow Matching——从概率路径到视频生成

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [flow-matching.org](../../../drafts/video-generation/flow-matching.org)；九章内容已逐章由用户审阅通过，作为正文持续写作依据。 |
| 类型与目标位置 | 既有文章重整 / 系列章节；slug `flow-matching`；分类 alias `categories/AI/视频生成`；sub_id `40`；保留旧 URL 与英文检索 alias。 |
| 服务对象 | 学过扩散模型的读者能说清 Flow Matching 的“流”、训练目标、条件速度如何产生整体概率路径，理解与 Score/DSM、DDPM、DDIM 及 Rectified Flow 的关系，并能解释 ODE 采样与少步误差。 |

**本轮实施依据**：用户已逐章确认草稿的新结构及推导。正文遵循草稿九章，不沿用早期八节占位结构；Design 记录范围与图表职责，草稿保留用户审阅通过的解释、例子和公式推导。标题沿用当前视频生成系列第四篇；视频生成只作公式落地示例，不展开完整视频架构。

**符号约定**：本篇生成时间 `t:0→1` 从噪声走向数据；`y` 是数据端点，`z` 是噪声端点，`x_t=α(t)y+σ(t)z` 是条件路径状态，`u_t(x|y)` 是条件场，`u_t(x)` 是边际场，`v_θ` 是网络预测。不得把一般路径系数默认成 VP；明确区分条件直线、混合边缘分布与最终生成轨迹。损失间的等价须标明总体期望、平方误差和正则条件。

**一手材料**：
- Lipman et al. (2023), *Flow Matching for Generative Modeling*, `raw/flow-matching-lipman/sources/flow-matching-lipman.pdf` 与 `raw/flow-matching-lipman/source-tar/fm_arxiv_v2.tex`；核查 §2–4、Theorems 1–3、Appendix A，以及 Figures 2–4。
- Liu, Gong & Liu (2023), *Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow*, `raw/rectified-flow-2023/sources/rectified-flow-2023.pdf`、`source-tar/arxiv_textfiles/method_new.tex`；核查线性插值回归、整流、reflow、凸运输代价和轨迹直线化；Figures 2–3。
- Wan Team (2025), *Wan: Open and Advanced Large-Scale Video Generative Models*, `raw/flow-matching/sources/wan-2025.html` 与 `wan-2025.txt`；仅用于报告中可直接核验的 latent 线性插值、logit-normal 时间采样、速度目标与文本条件，不据此推导未经报告证实的工程结论。
- Song et al. (2021) 与 Ho et al. (2020) 原文路径沿用各自 `raw/` 归档，支持 Score/PFODE 与 DDPM 对照；DDIM 引用核对 Song, Meng & Ermon (2020)，不与 Score/SDE 论文混淆。

#### 1 问题：为什么还需要 Flow Matching
- **草稿对应**：`* 问题：为什么还需要 Flow Matching`。保留 CNF 与 Score/PFODE 已有成果、传统 CNF 似然训练成本、FM 所补训练缺口，以及“只换成速度预测不保证更好”的问题定义。
- **正文职责**：开篇提出为什么已有 ODE 生成和扩散监督仍需要 FM；区分改变预测量、改变监督构造与改变路径三件事。短述“流”的直觉并引出第 2 章。
- **素材**：Lipman §1–2、相关工作；Ho DDPM、Song SDE 原文。

#### 2 流：从点的运动到分布的搬运
- **草稿对应**：`* 流：从点的运动到分布的搬运` 全章。保留向量场、轨迹、流映射、推前分布、概率路径、连续性方程的逐步推导与高斯平移例子。
- **正文职责**：从粒子速度场定义 ODE flow，解释单轨迹与分布路径差异；从固定区域的概率质量守恒推导 `∂t p + ∇·(pv)=0`；用整体平移例子核对符号。简要联系 ODE 输运方程与 SDE 的 Fokker–Planck 方程。
- **素材**：Lipman §2、CNF 定义；保留草稿明确的流可逆性正则条件。

#### 3 前史：以前怎样学习这个流
- **草稿对应**：`* 前史：以前怎样学习这个流` 全章。保留 CNF 最大似然与散度积分推导、DSM 的条件 Score 监督与 PFODE、FM 条件速度回归三路对照。
- **正文职责**：给出 change-of-density 公式与 NLL 训练成本；DSM 说明条件监督如何学整体 score；PFODE 漂移使用加噪时间并提醒生成需反向积分；最后限定 FM 相较 CNF/Score 的贡献。
- **素材**：Lipman §2、Appendix CNF density、related work；Song SDE 与 Vincent DSM 的一手来源。避免声称 DDPM/DSM 训练需要模拟完整扰动链。

#### 4 构造：怎样得到速度标签
- **草稿对应**：`* 构造：怎样得到速度标签` 全章。保留直线插值、标签、训练损失、数值例子、训练伪代码、条件高斯形式、`σ_min` 端点差异和一般路径推导。
- **正文职责**：从 `x_t=(1-t)z+ty` 求出 `y-z`，演示一轮训练；推广至 `x_t=α(t)y+σ(t)z` 与 `u_t(x|y)`。分别解释理想零终点噪声和 Lipman 原文正 `σ_min` 的平滑终点，说明端点分母限制。
- **素材**：Lipman §3–4、Theorem 3、Eqs. (22)–(23)、Appendix A；RF 线性插值目标。

#### 5 原理：局部标签为什么能搬运整体分布
- **草稿对应**：`* 原理：局部标签为什么能搬运整体分布` 全章。保留 Bayes 后验、条件平均回归证明、混合连续性方程、CFM/FM 平方展开及 reflow 图解边界。
- **正文职责**：推导 `u_t(x)=E[u_t(x|Y)|X_t=x]`，从条件连续性方程积分得到整体连续性方程；将 CFM 损失拆成 FM 损失与参数无关的条件方差项，说明梯度等价只针对总体目标并列明可积、可微假设。
- **素材**：Lipman Theorems 1–2 与 Appendix A；RF Figure 2 对照条件插值与整体生成流。

#### 6 对照：速度、噪声与 Score 的关系
- **草稿对应**：`* 对照：速度、噪声与 Score 的关系` 全章。保留端点条件均值、score 关系、系数行列式、换算表、目标加权差异、PFODE 漂移和扩散 v-parameterization 约定。
- **正文职责**：在同一各向同性高斯条件路径下推导 `m,e,s,u` 换算；用行列式说明不可逆参数化边界；从显式网络输出关系推导等价噪声 MSE 的时间权重；限制 PFODE 等价的路径和时间条件；区分路径速度与 EDM/扩散中的 `v-prediction` 标签；另用短段对照 DDIM 的采样器职责。
- **素材**：Lipman §3–4；Song PFODE；Salimans–Ho v-prediction；DDPM/DDIM 原文。公式分母为零的端点须使用极限或有效时间约定。

#### 7 路径：为什么可能更容易学习和采样
- **草稿对应**：`* 路径：为什么可能更容易学习和采样` 全章及 reflow 子节。保留端点耦合、FM/RF 重合、整流、reflow 训练目标、reflow 目的澄清、Euler 局部误差、凸运输代价与效果比较表。
- **正文职责**：说明 FM 是一般训练框架、基本 RF 在线性路径上的目标如何重合；给出配对流端点并重新训练的 reflow 流程；解释速度沿轨迹变化与数值积分误差；限定“成本非增”与全局 OT 的差异，以及再训练成本和旧模型分布偏差。
- **素材**：Lipman §4 的条件 OT 结论与整体场限制；RF 方法理论与 Figures 2–3。明确条件路径直线不代表边际生成轨迹直线。

#### 8 采样：沿学到的向量场生成图像
- **草稿对应**：`* 采样：沿学到的向量场生成图像` 全章。保留 Euler/Heun 推导、数值例子、NFE、端点处理、模型/积分误差和干净图像换算说明。
- **正文职责**：从生成 ODE 推导 Euler 更新和 Heun predictor-corrector；明确 Heun 每步基础两次场求值、NFE 与步数区别；说明 FM 直接速度输出不必先预测干净图或重新加噪，但在适用参数化下可换算；区分模型误差与求解误差。
- **素材**：Lipman §5 与求解配置；求解器层面的 Heun 细节回链 EDM，本文保留够理解的推导。

#### 9 总结：贡献与局限
- **草稿对应**：`* 总结：贡献与局限` 全章。保留全文主线、方法关系、FM/RF 区别、四类局限、结论与末尾参考文献。
- **正文职责**：总结概率路径—条件速度—边际平均场—ODE 积分链条；指出模型误差、路径与权重选择、少步误差、reflow 成本与条件控制限制。将 Wan 作为紧凑的视频 latent 应用例子，限制在原报告可核查的插值、时间采样和速度标签，不另扩写完整架构篇。
- **素材**：Wan `Training objective`；Lipman/RF 原文；草稿的引用顺序与 citation keys。

**逐图规划**：正文按实际阅读顺序编号，准确区分原文面板与作者整理图。

| 图题 | 位置与用途 | 来源 |
|---|---|---|
| 图 1：从问题到生成流 | 第 1 章；Mermaid 概括路径、监督、学习与推理 | 作者按 Lipman 框架整理 |
| 图 2：向量场、轨迹与流 | 第 2 章；作者绘制二维局部场与样本轨迹，可用 Mermaid/确定性 SVG | 依 ODE 定义整理 |
| 图 3：扩散与 OT 条件轨迹 | 第 2 章概率路径后；比较不同条件路径 | Lipman 原文 Figure 3，已有裁图 `drafts/assets/flow-matching/conditional-trajectory-*.png`，正文发布时移至 `media/images/flow-matching/` 并按站点规范处理 |
| 图 4：三条学习向量场路线 | 第 3 章表格后；CNF、DSM/Score、FM 的训练监督 | 作者整理，不标论文原图 |
| 图 5：条件 score 与条件速度场 | 第 4 章路径公式后；提示二者目标量不同 | Lipman 原文 Figure 2，已有草稿裁图 |
| 图 6：条件标签到边际流 | 第 5 章平均场证明后；展示条件流与整体流关系 | RF 原文 Figure 2，已有草稿裁图 |
| 图 7：reflow 如何改变轨迹 | 第 7 章 reflow 后；解释轮次轨迹与趋势且披露玩具实验条件 | RF 原文 Figure 3，已有草稿裁图 |
| 图 8：一次 CFM 训练与一次 ODE 采样 | 第 8 章；并列 Mermaid | 作者依据 Lipman 目标整理 |
| 图 9：视频 latent 上的速度生成 | 第 9 章 Wan 示例；Mermaid 简述训练/推理数据流 | 依据 Wan 报告训练目标整理 |

**表格规划**：① Score/CNF/FM 前史对照；②路径端点系数；③噪声、图像、Score、速度换算；④ FM 与 RF 机制比较；⑤ Euler/Heun 每步 NFE 比较。数学推导在正文中展开，不以表格代替推导。

**验收**：正文须与九章草稿逐章对应；原论文事实与文末 `.sources` 一一对应；校验损失梯度等价、时间方向、`σ_min` 端点、v-prediction 记号及可逆条件；原图裁切需保留本图面板标签与必要上下文；单页 lint 和构建后交用户审阅。视频例子只采用已归档 Wan 报告中核实的信息。

### `x-prediction`｜视频生成系列（五）：x-prediction——让网络预测干净图像

- **持续内容依据**：[原始草稿 x-prediction.org](../../../drafts/video-generation/x-prediction.org)。七章均已获用户审阅通过，2026-10-15 用户授权写作正文；本次记录与已审稿一致的设计，不新增未审章节。
- **位置**：`src/pages/x-prediction.html`，alias `categories/AI/视频生成`，sub_id `50`；Flow Matching 后、EDM 前。EDM 为第六篇、sub_id 60；最新篇序为条件扩散第七篇（70）、图像基模第八篇（80），保留已有 URL。
- **问题与解法**：变量可换算不保证有限网络同样容易学习。以 JiT 的大 patch 对照为起点，区分直接输出、损失空间、信息通路、ODE 采样，推导解析旁路如何改变主干的信息保存责任；以 Liang 的谱、白化、DINO 和 HC/SiHC 实验限定结论。
- **资料**：JiT、DiP、DeCo、PixelDiT 与 residual-stream-burden 原文均已整理并阅读；网页解读和配图在 `raw/x-prediction-references/` 与 `drafts/assets/x-prediction/`。正文保留原始图和表格，不将提取、裁图过程写入面向读者的说明。

**章节骨架与逐图位置（逐章对照已批准草稿）**

#### 1 为什么重新考虑预测目标
- **写什么与数学重点**：从大 patch 的容量问题提出动机，保留高维螺旋对照与雕刻比喻，限定实验配置。
- **草稿对应**：原始草稿「1 为什么重新考虑预测目标」及其全部子节，保留解释、推导和数据边界。
- **配图**：图 1：JiT 的螺旋点云实验。各行对应不同观测维数，各列依次为真实数据、直接预测干净数据、噪声与速度的生成结果；结果均投影回二维展示。来源：Li 与 He，原论文 Figure 2。；素材 `../assets/x-prediction/jit-toy-comparison.webp`；紧随草稿中相同论证位置。
- **配图**：图 2：雕刻与携带碎石。Liang Tongtong 用这个比喻解释，直接预测干净结构与同时保留噪声相关信息，对主网络提出了不同要求。来源：知乎回答，答主使用 GPT 生成的概念示意图。[2]；素材 `../assets/x-prediction/liang-noise-burden-metaphor.jpg`；紧随草稿中相同论证位置。

#### 2 预测目标与训练目标
- **写什么与数学重点**：固定噪声到数据时间方向，逐步推导 x、epsilon、路径速度 u 的换算及损失权重；解释条件均值、截断分母与解析旁路，不能混淆 VP v。
- **草稿对应**：原始草稿「2 预测目标与训练目标」及其全部子节，保留解释、推导和数据边界。
- **配图**：图 3：网络预测空间与损失空间的九种组合。列表示网络直接输出，行表示用哪个空间的误差训练；非对角项需要先做换算。来源：Li 与 He，原论文 Table 1。原文 v 在本篇记作路径速度 u。[1]；素材 `../assets/x-prediction/jit-tables/table-01.webp`；紧随草稿中相同论证位置。
- **配图**：图 4：普通残差流的信息传递方式。同一个状态既沿恒等连接继续保存，也供下一层计算使用。来源：Liang Tongtong 博客 Figure 1。[3]；素材 `../assets/x-prediction/liang-blog/plain-residual-blog.svg`；紧随草稿中相同论证位置。
- **配图**：图 5：训练中学出的输入旁路。左上比较学习系数与解析参考，右上把系数归一化后与 1 比较，下方展示 FID 随训练变化。来源：Liang 等人原论文 Figure 17，PDF 第 26 页；对应博客 Figure 10。[3][4]；素材 `../assets/x-prediction/liang-paper/learned_long_skip.webp`；紧随草稿中相同论证位置。

#### 3 为什么可换算却不好学
- **写什么与数学重点**：从线性子空间例子推导最佳仿射预测及方向方差，解释 PCA 谱集中而非内禀维数；保留白化反例。
- **草稿对应**：原始草稿「3 为什么可换算却不好学」及其全部子节，保留解释、推导和数据边界。
- **配图**：图 6：只保留少量 patch 主方向，也能恢复可辨认结构。各面板对每个 16×16 patch 保留指定数量的主方向。来源：Liang 等人原论文 Figure 2，PDF 第 4 页。[4]；素材 `../assets/x-prediction/liang-paper/reconstruction_example.webp`；紧随草稿中相同论证位置。
- **配图**：图 7：同一组干净 patch 协方差谱下，最佳仿射预测的方差集中程度。表内数字是解释 90% 预测方差所需的方向数，不是网络隐藏宽度。来源：Liang 等人原论文 Table 8，PDF 第 22 页。[4]；素材 `../assets/x-prediction/liang-paper/table-08-affine-ranks.webp`；紧随草稿中相同论证位置。
- **配图**：图 8：目标协方差谱与学习所得输入嵌入谱。左侧为目标的累计方差，右侧为输入嵌入 Gram 矩阵特征值的累计占比，各曲线独立排序并归一化。来源：Liang 等人原论文 Figure 13，PDF 第 23 页。[4]；素材 `../assets/x-prediction/liang-paper/prediction_covariance_gram.webp`；紧随草稿中相同论证位置。

#### 4 JiT 如何训练与生成
- **写什么与数学重点**：解释 patch、条件输入、训练与 Euler/Heun 生成，保留原论文算法及九组合表、瓶颈实验；有效自由度不等于输出坐标数或主干宽度。
- **草稿对应**：原始草稿「4 JiT 如何训练与生成」及其全部子节，保留解释、推导和数据边界。
- **配图**：图 9：JiT 的像素空间 Transformer。主干直接处理图像 patch，并输出干净图像估计。来源：Li 与 He，原论文 Figure 3。[1]；素材 `../assets/x-prediction/jit-method/framework.webp`；紧随草稿中相同论证位置。
- **配图**：图 10：JiT 原文的单步训练伪代码。网络输出 x_pred，再换算 v_pred，用速度误差训练；原文 v 对应本篇的路径速度 u。来源：Li 与 He，Algorithm 1。[1]；素材 `../assets/x-prediction/jit-method/algorithm-1.webp`；紧随草稿中相同论证位置。
- **配图**：图 11：JiT 原文的 Euler 单步采样伪代码。先预测图像，再转换成速度，最后更新当前状态。来源：Li 与 He，Algorithm 2。[1]；素材 `../assets/x-prediction/jit-method/algorithm-2.webp`；紧随草稿中相同论证位置。
- **配图**：图 12：直接输出与损失空间的九种组合。上表为 ImageNet 256×256 的 JiT-B/16，下表为 64×64 的 JiT-B/4。来源：Li 与 He，原论文 Table 2。[1]；素材 `../assets/x-prediction/jit-tables/table-02.webp`；紧随草稿中相同论证位置。
- **配图**：图 13：输入嵌入瓶颈实验。横轴为中间瓶颈维数，纵轴为 FID；原始 patch 为 768 维。来源：Li 与 He，原论文 Figure 4。[1]；素材 `../assets/x-prediction/jit-method/bottleneck.webp`；紧随草稿中相同论证位置。
- **配图**：图 14：通用 Transformer 组件带来的增益。括号内数字使用额外的 CFG interval 设置，比较时应保持口径一致。来源：Li 与 He，原论文 Table 4。[1]；素材 `../assets/x-prediction/jit-tables/table-04.webp`；紧随草稿中相同论证位置。

#### 5 其他像素模型如何处理
- **写什么与数学重点**：逐项讲 DiP、DeCo、PixelDiT 的局部输入通路、频率损失及像素调制，分清各原论文与 Liang 统一实验口径。
- **草稿对应**：原始草稿「5 其他像素模型如何处理」及其全部子节，保留解释、推导和数据边界。
- **配图**：图 15：DiP 的局部细化头。局部模块结合带噪 patch 和全局语义特征，采用轻量卷积 U-Net 完成像素级预测。来源：Chen 等人，原论文 Figure 6。[6]；素材 `../assets/x-prediction/pixel-architectures/dip-detailer.webp`；紧随草稿中相同论证位置。
- **配图**：图 16：局部细化头的不同放置方式。阅读重点是局部像素信息在哪里进入，以及细化结果是否重新回到主干。来源：Chen 等人，原论文 Figure 5。[6]；素材 `../assets/x-prediction/pixel-architectures/dip-placement.webp`；紧随草稿中相同论证位置。
- **配图**：图 17：DeCo 的频率分工。主干提供语义特征，像素解码器直接接收带噪像素，并通过条件调制完成速度预测。来源：Ma 等人，原论文 Figure 3。[7]；素材 `../assets/x-prediction/pixel-architectures/deco-architecture.webp`；紧随草稿中相同论证位置。
- **配图**：图 18：PixelDiT 的双层架构与 PiT 块。左侧区分 patch 与像素通路，右侧展示像素条件调制及压缩—注意力—展开结构。来源：Yu 等人，原论文 Figure 2。[8]；素材 `../assets/x-prediction/pixel-architectures/pixeldit-architecture.webp`；紧随草稿中相同论证位置。
- **配图**：图 19：全局、patch 级和逐像素调制的区别。重点看条件参数是在何种空间粒度上共享或分别生成。来源：Yu 等人，原论文 Figure 3。[8]；素材 `../assets/x-prediction/pixel-architectures/pixeldit-adaln.webp`；紧随草稿中相同论证位置。

#### 6 残差流为什么成为瓶颈
- **写什么与数学重点**：定义残差状态、方向增益和噪声敏感度，解释 HC/SiHC 读写、FID 变化及 DINO 探针。区分信息内容、轨迹唯一性及跨时刻终点一致性。
- **草稿对应**：原始草稿「6 残差流为什么成为瓶颈」及其全部子节，保留解释、推导和数据边界。
- **配图**：图20：不同预测目标下，输入嵌入对干净数据主方向的对齐与增益。来源：Liang 等人原论文，Selective filtering depends on target and patch geometry。；素材 `../assets/x-prediction/liang-paper/prediction_spectra_alignment.webp`；紧随草稿中相同论证位置。
- **配图**：图21：同一原论文中，各类模型沿网络深度的类别线性探针结果。各列固定加噪时间；它与噪声方差测量互为补充，不能将两种指标的数值直接比较。来源：Liang 等人原论文，Class readability follows the burden。；素材 `../assets/x-prediction/liang-paper/linear_probes.webp`；紧随草稿中相同论证位置。
- **配图**：图22：普通残差、HC 与 SiHC 的持续状态和计算工作区。按图中箭头从下向上阅读：SiHC 将局部输入和局部预测交给不同状态，再通过读写映射共享计算。来源：Liang 等人原论文，Persistent state and workspace in three residual designs。；素材 `../assets/x-prediction/liang-paper/sihc_overview.webp`；紧随草稿中相同论证位置。
- **配图**：图23：DINO 与像素表示的类别线性探针对照。高维状态中承载的是预训练特征还是像素噪声，会改变“需要保留很多方向”的意义。来源：Liang Tongtong 博客 Figure 13；具体数值以上述论文附录为准。；素材 `../assets/x-prediction/liang-blog/dino-pixel-probes.png`；紧随草稿中相同论证位置。

#### 7 总结与边界
- **写什么与数学重点**：综合概率路径、输出、损失、信息通路及采样四项选择，陈述容量理论、优化动力学、配置依赖及端点问题，过渡到 EDM；不宣称 2022 EDM 已覆盖后续工作。
- **草稿对应**：原始草稿「7 总结与边界」及其全部子节，保留解释、推导和数据边界。

**图表与引用实施**：保留 23 张已审图（含原论文表格和算法截图），转换为本站 photo/cap 组件并在末尾列出九项公开来源；不复制作者工作清单及内部素材备注。无新增 Mermaid：本篇现有原图已覆盖结构，避免重复表达。完成后构建本地预览，不自动提交或推送。

### `edm-design-space`｜视频生成系列（六）：EDM——重新梳理扩散模型的设计空间

**原始草稿与审批**：[edm-design-space.org](../../../drafts/video-generation/edm-design-space.org)。九章实质草稿已逐章审阅，用户已明确授权正文写作。正文持续以草稿的解释、推导、表格和原图为依据；本九章结构替代此前十节骨架。系列顺序为 DDPM → Score/DSM/SDE → DDIM → Flow Matching → x-prediction → EDM → 条件生成。

#### 1 为什么需要统一框架

- **草稿位置**：第 1 章「为什么需要统一框架」。
- **写作与图示**：从前五篇的疑问引入五个设计层次，插入依赖关系 Mermaid 和原论文 Table 1。区分 EDM 原始贡献与对后续 FM、JiT 的综合分析。

#### 2 统一概率路径

- **草稿位置**：第 2 章「统一概率路径」。
- **写作与图示**：从一般高斯核与单时刻边际开始，区分联合过程；对照 DDPM、VP/VE、DDIM、线性 FM，推导 y=z/a、sigma=b/a 及密度雅可比，插入 Figure 1(a,b)。

#### 3 统一预测目标

- **草稿位置**：第 3 章「统一预测目标」。
- **写作与图示**：从条件均值推导 x、epsilon、score、通用路径速度的正逆换算及 Delta 非退化条件；单独解释 VP v、角度时钟、线性 FM 与 EDM 坐标，保留换算表。

#### 4 统一训练目标

- **草稿位置**：第 4 章「统一训练目标」。
- **写作与图示**：用条件方差分解连接 DDPM KL 到 MSE、DSM、CFM；推导统一干净误差下的时间权重，解释 JiT 输出与损失、时间抽样及有限容量。插入 JiT Table 1。

#### 5 EDM 的网络预条件

- **草稿位置**：第 5 章「EDM 的网络预条件」。
- **写作与图示**：区分去噪接口 D 与主干 F；依次推导输入缩放、残差目标、最小方差旁路和输出缩放，列四系数表及目标随噪声变化的极限。回看 EDM Table 1。

#### 6 EDM 怎样分配训练

- **草稿位置**：第 6 章「EDM 怎样分配训练」。
- **写作与图示**：区分频率与权重，推导 lambda 抵消输出缩放、对数正态及密度雅可比；插入 Figure 5(a)，解释两端不可约误差，保留教学伪代码。

#### 7 统一生成过程

- **草稿位置**：第 7 章「统一生成过程」。
- **写作与图示**：用热方程和连续性方程推导 PFODE；用沿生成方向递增时间的 SDE 与 Fokker–Planck 方程证明相同边际，解释反演、随机修正及方法对照。

#### 8 EDM 怎样采样

- **草稿位置**：第 8 章「EDM 怎样采样」。
- **写作与图示**：展开 Euler 与 Heun 预测校正算例、终点例外和 NFE；推导 rho 节点及 churn 方差。插入 Algorithms 1–2 的独立算法截图、Figures 3、2；区分 S_noise=1 理想证明和经验缩放。

#### 9 实验、总结与边界

- **草稿位置**：第 9 章「实验、总结与边界」。
- **写作与图示**：分开 sampler-only 与 retraining，插入 Figure 4、Table 2，并解释 Figure 5(b,c)；核对条件、分辨率、NFE。以前五篇总表、方法分析链与尚未解决的问题收束，导航指向条件生成。

**原始依据**：`raw/edm-2022/source-tar/paper.tex` §§1–6、`supplemental-body.tex` 预条件/score/SDE 附录、`figures.tex`、`data/TrainingTable.tex`；其他七篇原论文按草稿末尾参考文献交叉对照。图表来源记录在 `drafts/assets/edm-design-space/manifest.json`。图片操作不写入正文；公式不嵌入段落标签。

**验证交付**：单页结构与引用检查、媒体路径核对、全站构建、本地预览；保留原 URL、sub_id 60、前后篇导航。只完成本篇，不推进条件生成。

### `image-foundation-models`｜视频生成系列（八）：图像基模——表示空间与生成编辑

- **原始草稿**：[image-foundation-models.org](../../../drafts/video-generation/image-foundation-models.org)。依据「用户补充的核心主线」「与现代图像基模的连接」「最新分工」组织；已有实质草稿；十章及现代基模扩充已审阅并获正文授权；正文已生成，保留 28 张配图、4 个 Mermaid、24 项参考来源，构建与本地预览通过。
- **目标位置**：`categories/AI/视频生成`；sub_id `80`；已实施，接条件扩散（70）后、视频任务（90）前。
- **核心问题**：生成应该在哪种表示空间进行？完整基模如何组合图像表示、生成主干、条件与编辑任务？

#### 1 像素生成的成本
- **写什么**：区分重复采样成本、单次主干计算和高维噪声学习负担，解释引入压缩空间的动机；不能说像素扩散无法工作。
- **素材来源**：草稿「像素空间为什么贵」；LDM 原文 `raw/latent-diffusion-2021/` 与前文 x-prediction。
- **图表**：表示维度与计算路径对照表；原论文压缩效率实验图，具体图号待核验。

#### 2 VAE 与图像表示
- **写什么**：编码、重参数化、解码，从 ELBO 推到重建项与 KL 正则；区分理论 VAE 和实际图像压缩器配置。
- **素材来源**：草稿「VAE 与 Latent Diffusion 如何改变问题」；内部 VAE 素材及待整理的 VAE 原论文。
- **图表**：图「图像如何编码与重建」，优先原图；Mermaid「编码、采样与解码」辅助解释训练数据流。给出 `z=μ(x)+σ(x)⊙ε` 及变分目标推导。

#### 3 U-Net 与多尺度建模
- **写什么**：解释下采样、上采样、跳跃连接如何组合语义与细节，再解释扩散 U-Net 的残差块、时间嵌入及 attention。区分原始分割 U-Net、VAE 内部网络和扩散生成主干。
- **素材来源**：草稿「用户补充：生成主干 U-Net 与 DiT」；U-Net 原论文（1505.04597）待整理；复用 DDPM、LDM 原文。
- **数学**：跟踪各尺度张量尺寸，给出 skip 特征拼接与残差/时间调制示意式，逐项解释输入和输出。
- **图表**：原文图「U-Net 的多尺度与跳跃连接」；扩散版结构图核验后选取；Mermaid「带噪状态、时间与条件进入主干」，放在模块解释后。

#### 4 潜空间与 Stable Diffusion
- **写什么**：编解码器训练与 latent 扩散训练分开；从像素前向式迁移到 latent，解释文本条件、主干与采样器各自职责，以及压缩损失。
- **素材来源**：同一草稿节；LDM 原文及明确版本的 Stable Diffusion 官方资料。
- **图表**：原论文整体架构图与重建效果图；图题「潜空间中的生成流程」。完整系统说明由本篇承担。

#### 5 DiT 与图像 Token
- **写什么**：先承接 Stable Diffusion 的 U-Net 主干，提出生成主干能否换成 Transformer，再讲 patchify、位置编码、Transformer、自适应归一化与 unpatchify；讲原始 DiT 的条件注入和可扩展性，再与 U-Net 比较。现代双流/多模态变体留到完整基模章节。
- **素材来源**：同一草稿节；Peebles 与 Xie 的 DiT（2212.09748）已整理至 `raw/dit-2022/`；JiT 已有材料只作跨篇联系。
- **数学**：推导 token 数 `N=(H/p)(W/p)`，区分固定通道时的像素/latent 尺寸；解释 attention、adaLN 调制及标准全注意力交互的二次项，不把整个网络成本都简化成该项。
- **图表**：原论文主干与条件模块图、计算规模实验图；图号待核验。表「U-Net 与 DiT 的设计取舍」，覆盖多尺度、交互、条件与成本。
- **共同接口**：两种主干均映射带噪状态、时间和条件到预测张量；表示空间、主干、预测参数化、训练损失与采样器分开比较，不宣称 DiT 必然预测速度或必须使用 ODE。

#### 6 DiT 的改进
- **原始草稿位置**：`image-foundation-models.org`「第六章：DiT 的改进」；按用户决定独立成章，第五章保留原始 DiT。
- **写什么**：SiT 对比连续时间、预测对象、插值与 ODE/SDE 采样；REPA 解释教师表征、中间层对齐与训练/推理分工；DDT 解释语义编码、速度解码、联合监督及跨步缓存，不混同于 RAE 的宽头。
- **原文**：`raw/sit-2024/`、`raw/repa-2024/`、`raw/ddt-decoupled-2025/`，均已运行原文提取脚本。
- **数学**：配对导数到条件平均速度；同边际 ODE/反向 SDE；余弦对齐损失；DDT encoder/decoder 与刷新集合公式。统一数据端为 0、噪声端为 1，注明 DDT 原文时间方向转换。
- **图表**：草稿图 13–16 为 SiT 收敛、REPA 对齐、DDT 架构与跨步特征相似度原图；表「这些方法分别改了哪一层」。
- **边界**：不把特定实验瓶颈、相似度代价下最优缓存或频率分析推广为普遍保证。新增章待用户审阅。

#### 7 RAE 与 JiT
- **写什么**：RAE 保留 latent 生成而更换表征接口；JiT 直接像素生成、绕过预训练图像压缩器。比较重建、语义、高维 latent 与生成成本，不写成严格替代链。
- **素材来源**：草稿对应两节及「两条路线的比较」；RAE 原文已整理至 `raw/rae-2025/`；JiT 复用 `raw/jit-x-prediction-2025/`，预测目标推导链接第五篇。
- **图表**：RAE 原文结构与宽头图已插入草稿；JiT 原图按论点复用；表「压缩潜空间、表征空间与像素空间」。

#### 8 现代图像基模
- **章节层级**：每个基模独占三级标题：Stable Diffusion 3、FLUX.1、Qwen-Image、Qwen-Image-2.1、Z-Image、HunyuanImage 3.0、Seedream 5.0 Pro、FLUX.2；其下用四级标题展开架构、关键机制、训练采样及证据边界。导读置前，跨模型内容集中在末尾「统一比较」，不把两个基模合成一个标题。
- **写什么**：正式加入 Stable Diffusion 3（SD3），置于 FLUX.1 之前，解释其 Rectified Flow 与 MMDiT，并采用 Esser et al.（2403.03206）的原始架构图（Figure 2(a–b) 已插入草稿，资产 `sd3-mmdit-architecture.webp`，含整体接口和单块机制说明）；不得标为 FLUX.1 论文。保留 FLUX.1-dev 与初代 Qwen-Image 的已核验机制，增加 FLUX.2、Qwen-Image-2.1、Seedream 5.0 Pro、Z-Image 与 HunyuanImage 3.0。逐一说明问题、架构与创新依据，再作统一接口比较；不写成严格继承链。
- **素材来源**：[原始草稿](../../../drafts/video-generation/image-foundation-models.org)「与现代图像基模的连接」「现代基模扩充（用户确认，2026-10-15）」及现有第八章；新增资料由 Luna 整理至 `raw/modern-image-models-2026/`，原论文按 read-article 提取；Z-Image Figure 10 与 HunyuanImage 整体架构原图已插入草稿，资产为 `z-image-architecture.webp`、`hunyuan-image3-architecture.webp`；尚待核验的架构不作事实写入。
- **版本边界**：Qwen 初代的 20B/60 层双流结构与 2.1 模型卡的视觉生成 7B/32 层单流分别说明；Seedream 等仅有产品资料的部分不推断训练目标与架构。
- **图表位置与标题**：各模型机制段开头优先插入对应论文/官方报告的原始架构图，标题为「模型名与版本：整体架构」，标明原图号及来源；没有公开结构图则记缺。能力示例另用「模型名与版本：生成与编辑示例」，不能冒充架构图。章节末放表「现代图像基模的系统接口」，比较表示、主干、条件、训练/采样与任务范围，并标明未披露项。保留现有 FLUX Mermaid 接口示意及 Qwen 原图，不用新 Mermaid 代替未公开架构。
- **审阅状态**：现有第八章已通过；扩充范围已获用户确认，新增内容已获正文授权并落实到页面；FLUX.2 [dev] 官方配置已核实。

#### 9 生成与编辑基模
- **章节层级**：FLUX.1 Kontext、Qwen-Image 编辑路线、ACE、ACE++ 各占三级标题，模型内部的机制与训练说明用四级标题。
- **写什么**：Kontext、Qwen-Image-Edit、ACE 与 ACE++ 的参考图、上下文及任务组织；区分基础生成模型与编辑版本。
- **素材来源**：草稿 ACE 与现代基模段落；各原文待核验，ACE 二手笔记不能代替一手来源。
- **图表**：原文上下文/编辑结构图；Mermaid「基座如何承接生成与编辑任务」，不替代原文结构证据。

#### 10 总结与边界
- **写什么**：依草稿第十章，从表示、主干、路径与预测、条件、任务五个问题统一全篇；给出编码—状态—预测—采样—解码接口，分解条件编码、主干评估和解码成本；总结表示损失、条件遵循、编辑保真、计算与视频时序边界，连接下一篇条件机制。第十章已获正文授权并完成页面。
- **图表**：表「表示、生成主干、条件接口与任务」；同口径数据才作定量比较。

**素材门禁**：选定新原文后先执行 read-article 提取与整理，记录原图位置、版本和来源；未定位图号不编造编号。内部 Org 素材不出现在公开正文中。

### `conditional-image-diffusion`｜视频生成系列（七）：条件扩散——控制、适配与编辑

- **原始草稿**：[conditional-image-diffusion.org](../../../drafts/video-generation/conditional-image-diffusion.org)。十章及 prior 增补均已审阅通过；正文写作持续参照该草稿，已完成十章、24 张配图、5 个 Mermaid 和 15 项参考来源。
- **目标位置**：`categories/AI/视频生成`；sub_id `70`。既有页面仍是旧版本，不将其完成状态算作本轮重写完成。
- **分工**：本篇讲控制已有生成器的方法；完整 VAE、LDM/Stable Diffusion 与现代基模架构交由后续图像基模篇。各方法存在可组合关系，不构造一条虚假的继承链。

#### 1 条件改变了什么
- **写什么**：保留已审阅通过的草稿首章，从 `p(x)` 到 `p(x|c)`，区分条件输入、采样指导与参数适配。
- **素材来源**：草稿「文章草稿／1 条件到底改变了什么」。
- **图表**：Mermaid「条件进入生成的三个位置」；方法层级表。

#### 2 CLIP 与条件接口
- **写什么**：CLIP 对齐与双向对比损失、文本特征和 cross-attention；只补理解后续方法必需的 latent/Stable Diffusion 接口。DALL·E 2 作接口案例，按草稿详细解释 prior 的条件表征分布、干净表征预测损失、两阶段生成和原文小模型消融；明确文本向量不能无代价替换图像向量，prior 并非所有文生图模型的必要模块。
- **素材来源**：草稿原第二章及迁移决定；`raw/clip-2021/`、`raw/dalle-2-2022/`、LDM 原文。
- **图表**：CLIP 原图；图「文本特征怎样进入去噪器」与 attention 公式，不重复前篇 VAE 推导。

#### 3 CFG 增强条件
- **写什么**：条件 dropout、Bayes 推导 `s_c-s_u=∇log p_t(c|x)`、`s_cfg=s_u+w(s_c-s_u)`；解释 0、1、超过 1 的含义与原文权重约定差异。
- **素材来源**：草稿「CFG 的直觉与数学引导」；`raw/classifier-free-guidance-2022/`。
- **图表**：图「公共方向与条件差异」，用草稿二维向量例子；原文强度实验图。不是压制某个普适的分布中心；固定时间密度解释不等于严格终点分布保证。

#### 4 GLIGEN 与位置
- **写什么**：grounding token、冻结主干与零门控；先解释位置条件缺口，再给 gated 模块公式。
- **素材来源**：草稿原第五章；`raw/gligen-2023/` 的 TeX/PDF。
- **图表**：原文 `gated-self-attention.pdf`、`approach.pdf`，图题「位置条件如何进入主干」。

#### 5 ControlNet 与空间
- **写什么**：可训练分支、零卷积与条件残差；对照 T2I-Adapter 的注入与训练成本。
- **素材来源**：草稿原第六章；`raw/controlnet-2023/`；T2I-Adapter 原文已提取至 `raw/t2i-adapter-2023/`，正文/结构图已核对；比较静态条件特征复用与逐步控制分支计算。
- **图表**：ControlNet 原文结构及控制样例；解释初始输出不扰动与梯度传播，不声称全部参数首步均有梯度。

#### 6 IP-Adapter 与参考图
- **写什么**：图像特征与解耦 attention，说明参考图条件与主体微调的区别。
- **素材来源**：草稿原第七章；IP-Adapter 原文已提取至 `raw/ip-adapter-2023/`；正文和 Figures 2/10/11 已核对，草稿比较共同 softmax 与独立归一化，区分基础版和细粒度变体。
- **图表**：原文解耦 attention 图；条件分支公式与参考图效果。

#### 7 DreamBooth 与主体
- **写什么**：稀有标识、少样本个性化、先验保持损失及过拟合。
- **素材来源**：草稿原第八章；`raw/dreambooth-2023/`。
- **图表**：原文训练流程、主体示例；推导训练损失各项职责。

#### 8 LoRA 与适配
- **写什么**：`ΔW=BA`、初始化、参数量与组合；LoRA 是更新参数化，可以用于 DreamBooth 等任务。
- **素材来源**：草稿原第九章；`raw/lora-2021/`，图像应用需另核实现。
- **图表**：LoRA 原文矩阵图；公式 `ΔW=ΣᵢλᵢBᵢAᵢ`，不分别相加 A/B 再相乘。

#### 9 图像编辑
- **写什么**：围绕保留与修改组织 Blended Latent Diffusion、Prompt-to-Prompt、MasaCtrl、InstructPix2Pix；依次解释掩码混合、cross-attention、互注意力与指令训练。真实图像反演连接 DDIM，不混同经典 GAN pix2pix。
- **素材来源**：草稿「新增图像编辑材料」；原论文 2206.02779、2208.01626、2304.08465、2211.09800 已运行提取脚本归档，方法章节已回查 TeX/PDF。
- **图表**：原图依次为 BLD Figure 3、Prompt-to-Prompt Figure 3、MasaCtrl Figure 3、InstructPix2Pix Figure 2；Mermaid「编辑时保留哪些信息」。掩码混合要求源状态处于相同噪声层级；MasaCtrl 分清目标 Q 与源 K/V。ACE 仅作基模篇桥接。

#### 10 组合与边界
- **写什么**：对照控制位置、需训练参数、条件来源、保留能力与失效情形；说明视频新增时间一致性问题。
- **素材来源**：草稿「文章草稿／10 组合与边界」及前九章；各原论文验证局限。
- **图表与数学**：统一方法矩阵、图 29 多条件执行 Mermaid；从 Bayes 推导联合条件 score 的分解，指出分条件相加需要额外假设；用视频联合分布对照逐帧独立近似。归纳条件软约束、保留/改变冲突、表征局限、成本与评测，不作无口径排行榜；导航至视频任务篇。

**共同写作要求**：各章按问题→直觉→公式推导→原文结构图→证据和局限展开。现有内部图片清单 `drafts/assets/conditional-image-diffusion/org-materials-manifest.json` 只作候选索引；核验公开来源后再插图。原文已有归档优先复用，新论文先走 read-article 提取流程；本次不将素材盘点标作精读完成。

### 视频任务基础并入开创性工作（2026-10-21）

原 `video-generation-tasks-spacetime` 为占位规划；其视频任务、张量与时空建模内容已在用户审阅的第一章实质草稿中完成，统一纳入 `video-models-01-pioneering`，不再单独生成重复正文。原占位草稿保留作历史材料。

### 视频生成基模七篇规划（由七个章节草稿分别转正文）

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-diffusion-architectures.org](../../../drafts/video-generation/video-diffusion-architectures.org)；用户提出七类实质选题并逐篇共写；第一章及 Show-1、LaVie、VideoCrafter1 已审阅，VideoCrafter2 已审阅，ModelScope T2V 已补写、编解码器已核验为 KL VAE，Stable Video Diffusion 已审阅通过，第三章 VideoFusion 已审阅并补回实验表，Latent-Shift 已审阅，PYoCo 已审阅，VideoFactory 已审阅，第四章 MagicVideo 已审阅通过，Text2Video-Zero 已审阅通过，AnimateDiff 已审阅通过，DSDN 已审阅通过，SimDA 已审阅通过，第五章 DirecT2V 已审阅通过，Dysen-VDM 后继续完成 Free-Bloom 草稿，Free-Bloom 已审阅通过，VideoDirectorGPT 已审阅通过，LLM-Grounded VDM 已审阅通过，VisorGPT 已审阅通过；第五章正文已生成并构建预览 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；各篇 sub_id `90–150`，见文末七篇映射；总览草稿不单独生成同名正文 |
| 服务对象 | 读者能理解各论文要解决的问题、训练与采样机制及前作依赖，而非只记模型名称。 |

**排序决策（2026-10-16）**：保留用户七类路线，各类内部按论文首次公开时间组织。日期采用 arXiv v1，不以会议年份或最新修订年份排序；先行模型发布另注。已完成前两章重排；后五章占位选题正式展开前须核验时间并排序。技术借用需交代来源，不把时间先后自动写成继承关系。

**章节骨架与草稿对应**

1. **视频生成任务与开创性工作**：对应草稿第一章。任务、帧时间与扩散时间、3D/(2+1)D 基础后，依次 VDM（2022-04-07）→ Make-A-Video（2022-09-29）→ Imagen Video（2022-10-05）→ Align Your Latents（2023-04-18）。保留各篇已审阅推导、训练/推理解释和原图。
2. **开放视频基模**：对应草稿第二章。ModelScope T2V（2023-08-12）→ LaVie（2023-09-26）→ Show-1（2023-09-27）→ VideoCrafter1（2023-10-30）→ Stable Video Diffusion（2023-11-25）→ VideoCrafter2（2024-01-17）。ModelScope 模型于 2023 年 3 月先行公开，须区别论文日期。后续先补 ModelScope 的时间卷积等机制，再推进未写论文；VideoCrafter2 显式回链前置机制。
3. **其他早期研究**：对应草稿第三章，按 arXiv v1 日期排列 VideoFusion（2023-03-15）→ Latent-Shift（2023-04-17）→ PYoCo（2023-05-17）→ VideoFactory（2023-05-18）；“闭源”为历史课件口径，逐篇核验。VideoFusion 的噪声分解与双去噪器训练已通过审阅，Tables 1/4/6 已回补。Latent-Shift 同名三级小节已补时间移位公式、训练/采样、四处原图及 Tables 1/2/4/5 整理，已审阅通过。PYoCo 同名三级小节补 mixed/progressive 协方差、EDM 训练与相关噪声概率流推导、四级级联与 Figures 2/3/7、Tables 1/2/3/5 整理，已审阅通过，并保留用户提出的可学习噪声搬运猜想。VideoFactory 同名三级小节按首发 v1 完成 Swap-CA/窗口数学解释、训练采样披露边界、四处原图及 Tables 2–7 的精选结果，已审阅通过；第四章转入 MagicVideo。
4. **训练高效方法**：对应草稿第四章，类内按首次公开时间排序为 MagicVideo（2022-11-20）→ Text2Video-Zero（2023-03-23）→ AnimateDiff（2023-07-10）→ DSDN（2023-08-16）→ SimDA（2023-08-18）。日期依据 `raw/video-foundation-models-collection/efficient-video-order.md`。MagicVideo 依据已提取的 arXiv v2（2023-05-11），同名三级小节已补潜空间/图像权重复用、逐帧适配器、定向时间注意力、重建目标推导、无文本预训练与配对微调、FPS、插帧/VideoVAE/超分、Figures 2/3/7 与 Tables 1–3 及原图消融整理，已审阅通过。Text2Video-Zero 同名三级小节已按“问题 → 潜变量运动 → 首帧跨帧注意力 → DDIM 生成及条件模型复用 → 可选背景平滑 → 实验 → 局限”展开，包含运动/前向转移/注意力/采样公式、Algorithm 1 与 Figures 2/10、原文 25 视频 CLIP 比较整理；已审阅通过。AnimateDiff 同名三级小节依据 arXiv v2（2024-02-08）展开问题、逐帧图像层/时间 Transformer、域适配、噪声训练目标、MotionLoRA、采样、完整实验表与局限，明确 v1/v2 边界；插入 Figures 2/3/6，保留 Table 1 六项指标，已审阅通过。DSDN 同名三级小节依据 arXiv v3（2023-12-30）展开内容/运动双流动机、特征差分分解与合成、共用日程的双流加噪、交叉注意力、双噪声损失、采样、实验与局限；插入 Figures 2/3/4/7，保留 Table 1，明确原文参数更新图文不一致及编码器兼容披露缺口，已审阅通过。SimDA 同名三级小节依据 arXiv v1（2023-08-18）展开参数高效适配动机、空间/时间适配器、LSA 邻帧 patch 拼图与复杂度、噪声训练/DDIM 采样、超分与编辑扩展、参数速度/两数据集质量/模块消融与局限；插入 Figures 2/3/4/7，整理 Tables 1/2/3/5/6，明确更新比例与完整模型成本、不同评测/显存配置及原文初始化记号边界，已审阅通过。第四章逐篇内容已审阅。
5. **分镜与生成规划**：对应草稿第五章；类内按 arXiv v1 顺序为 DirecT2V（2023-05-23）→ Dysen-VDM（2023-08-26）→ Free-Bloom（2023-09-25）→ VideoDirectorGPT（2023-09-26）→ LLM-grounded VDM（2023-09-29），日期证据 `raw/video-foundation-models-collection/storyboard-order.md`。VisorGPT（2023-05-23）保留为相关视觉先验补充，不作为视频规划方法并列。DirecT2V 同名三级小节依据 arXiv v3（2024-02-06）按问题、逐帧文本规划、RVM、DSF、推理/帧率、实验、局限展开；Figures 1/3/4/8、Table 1 逐帧 CLIP 与 Table 2 用户研究入稿，双 softmax 反向匹配显式对齐索引，并区分原文 PNDM 配置与其他采样公式；DirecT2V 已审阅通过。Dysen-VDM 对应同一草稿三级标题，依据 arXiv v2（2024-03-19）展开：问题、事件时间计划、动态场景图骨架、滑动窗口与全局场景补充、RGTrm/图与文本双交叉注意力、训练和生成、实验与局限；插入 Figures 2/3/4，整理 Tables 1/3/4，区分目标数据零样本与不采用大规模预训练的目标数据训练，注明 RL-based ICL 及跨图对齐披露不足。Dysen-VDM 之后按继续指令完成 Free-Bloom 草稿，依据 arXiv v1（2023-09-25）展开事件表达问题、两轮逐帧提示、联合高斯噪声及边际/协方差推导、按去噪步切换自注意力、双路径补帧、免额外训练接口、实验与局限；插入 Figures 2/4/5/3，完整整理 Tables 1/4，区分总提示与逐帧提示 CLIP 协议，并保留时间连贯性弱于 VideoFusion 的结果。Free-Bloom 已审阅通过，VideoDirectorGPT 已审阅通过；LLM-Grounded VDM 已审阅通过。VideoDirectorGPT 对应 [第五章草稿](../../../drafts/video-generation/video-models-05-storyboard-planning.org) 同名三级标题，依据 arXiv v2（2024-07-12）：多场景任务、两轮视频计划、逐帧框轨迹与一致性分组、实体图文/位置 token、unCLIP prior、门控布局接口、冻结视频骨干的图像训练、PLMS 与布局引导调度、实验及局限。插入 Figures 2/3/11/5，整理完整 Tables 1/3/4/10/12，补训练范围消融的继续训练边界、不同评估规模及人评人数披露冲突；强调共享外观不等于完整 token 固定、多场景不等于无切换长镜头。LLM-grounded VDM 对应同一 [第五章草稿](../../../drafts/video-generation/video-models-05-storyboard-planning.org) 的同名三级标题，依据 arXiv v3（2024-05-04）：复杂时空提示、DSL/xywh/对象ID、TopK能量、质心位置和位移、冻结模型的输入梯度、代理能量密度解释、40步采样与早期引导、实验和失败案例。保留 Figures 2/4/6/11、完整 Tables 1/2/3/9 及 Table 4 同骨干两行，说明人评数据汇总冲突与注意力目标可能被遮挡/重现取巧满足。LVD、VisorGPT 均已审阅通过。VisorGPT 依据 arXiv v4（2023-05-30）在同一草稿的相关视觉先验小节补充：空间条件来源、标注量化与模板、自回归似然/GPT-2从头训练、前缀采样、GLIGEN/ControlNet应用、Table 5 与先验KL评估边界，插入 Figures 1/6。明确连续生成指同一场景实例补全，不是视频时间生成；该补充不计作视频规划方法。第五章草稿已整体审阅通过；正文已生成并完成构建预览。
6. **长视频生成**：对应[第六章草稿](../../../drafts/video-generation/video-models-06-long-video.org)，已开始LVDM v2：视频压缩、噪声目标、掩码条件、层次预测/插值、条件扰动与引导、采样和实验局限。Figures2/7/6与完整Tables1/2入稿；保留Figure7(b)图文冲突。LVDM已审阅通过；VideoGen v2草稿已审阅通过，明确它属于参考引导与潜空间补帧的相关方法，不具备已验证的长程续写机制。Figures2/6/7/5与完整Tables1/2/3入稿；暂保留于本章并明确范围，不把时间增密写成长时生成。随后完成VidRD（Gu等，2023-09-07）草稿：原占位VidRF按作者、年份与主题线索暂采用原文正式缩写VidRD，原始截图尚未直接核对；FNR初始噪声复用、PNS方差/相关性、DSG阈值与数值例子、联合视频DDIM上下文、时间解码、训练数据和实验边界。插入Figures2/3/5/6/9/10、Algorithm1原版面裁图及完整Tables1/2/3。VidRD已审阅通过；NUWA-XL v1草稿已审阅通过：T-KLVAE恒等初始化、MTD条件与噪声目标、多尺度调制、全局/局部生成、16→226→3376计数、训练与采样、同层并行、完整主表和四组消融及长程评估局限。Figures1–4与Tables1/2全部入稿。第六章按首发日期整理为LVDM（2022-11-23）→NUWA-XL（2023-03-22）→VideoGen（2023-09-01）→VidRD（2023-09-07）；图号83–100依阅读顺序同步。与独立长视频专题分工，不重复全文。
7. **多模态引导生成**：对应草稿第七章，保留用户选题，逐篇核验输入输出和方法边界。

每篇方法占三级标题，内部机制占四级标题；依次解释问题、核心思路、数学机制、训练、采样、实验与局限。原文整理与原图准备由 Luna 承担，主 agent 核验推理并写作；一次完成一篇后交用户审阅。具体写作仍同时对照完整草稿与原论文，不能只依据本骨架重写。

**素材与配图**：使用各论文已提取的 `raw/<paper-slug>/` 原文与 `drafts/assets/video-diffusion-architectures/` 资产。既有论文原图随所属小节移动，图号及正文引用按新顺序同步；未展开小节的图在核读后选择，不预设不存在的架构图。

**当前边界（2026-10-21）**：用户明确授权“一章占一篇正文”，本轮仅将已审阅第一章转成 `video-models-01-pioneering.html`，完成后构建本地预览并交审阅；其余各篇继续独立共写与审阅，未写小节不得作为正文占位发布。现代 Flow Matching 视频模型不替代用户已确定的早期七类论文主线，后续纳入须另据实质草稿更新。

### `video-generation-data-evaluation`｜视频生成系列（十六）：训练数据、评测基准与评价指标

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-generation-data-evaluation.org](../../../drafts/video-generation/video-generation-data-evaluation.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；规划 sub_id `160`；Hub `video-generation-hub` |
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

### `long-video-temporal-consistency`｜视频生成系列（十七）：时间一致性、长视频与流式生成

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [long-video-temporal-consistency.org](../../../drafts/video-generation/long-video-temporal-consistency.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；规划 sub_id `170`；Hub `video-generation-hub` |
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

- 合并扩散模型入门与 DDPM 为一篇完整基础章：先建立直觉，再推导前向链、噪声预测目标和反向采样；Score/DSM/SDE、EDM 与 DDIM 各自独立成篇，避免入门篇只铺垫却不落到具体模型，也避免 EDM 的训练/采样设计挤在连续时间理论章节中。
- 系列规划共 17 篇正文；前八篇保持既有编号，七个视频基模章节分别成为第九至十五篇，数据评测与长视频专题顺延第十六、十七篇。Flow Matching 复用既有页面，不另建重复文章。
- 在 `categories/AI` 下新建独立二级 subcategory `categories/AI/视频生成`。视频生成会涵盖扩散、Flow Matching、自回归和其他范式，不应嵌套在 `categories/AI/扩散模型` 下。Hub aliases 使用 `视频生成系列`、该路径及其 `/index` 形式；若缺失则在 `data/category-names.json` 增加 `视频生成: video-generation` 映射。
- Hub 使用 `sub_id: 0`，正文规划按 10–120 排序。前六篇依次为 DDPM（10）、Score（20）、DDIM（30）、Flow Matching（40）、x-prediction（50）、EDM（60）；条件扩散 70、图像基模 80、视频任务 90、视频架构 100、数据评测 110、长视频 120。新增篇及后续顺延尚未实施，须审核结构后核验编号、同步页面与导航。
- 系列标题固定使用中文序号格式“视频生成系列（五）：……”，避免阿拉伯数字与中文数字混用；按阅读顺序检查正文、文章清单和章节计划的序号与 `sub_id` 一致。
- 文章标题统一采用“视频生成系列（中文序号）：……”（如“视频生成系列（五）：……”）；所有正文共享系列 alias 和核心 tags，通过分类 alias 归类并使用 chapter-nav 链接 Hub；正文 frontmatter 不设置 `hub` 字段，Hub 使用 `capture.js --hub` 骨架。
- 教程文章不伪造论文式实验章节；数据评测单列一篇，代表性模型仅作为案例，不进行口径不一致的排行榜比较。
- EDM 与 DDIM 的实施授权和完成记录保留；本轮将 Flow Matching 独立规划并入本 change。历史文件移至 `merged-plans/restructure-flow-matching-article/`，包含旧提案、设计、任务和 delta spec；旧 spec 的保留标题/无编号/无 Hub 约束由本轮系列整合决策替代，其连贯性、入口兼容和可读性要求已吸收到当前 Design 与 tasks。新章节仍先审阅设计，再逐篇写作、构建和审阅，不因规划合并而标记原待办实施完成。

## Risks / Trade-offs

- [范围仍广] → 按篇限定核心问题；超出篇幅的个性化方法仅作案例或延伸阅读。
- [原论文与数据卡尚未全部归档] → 任务阶段逐篇收集到 `raw/<slug>/sources/`，记录版本和定位；缺失时以官方资料替代并披露。
- [新 subcategory 尚未登记] → 发布前补充 `data/category-names.json` 映射和分类组织文档中的系列登记，对新路径重跑编号检查，并验证 Hub 索引替换效果。
- [不同模型评测不可直接横比] → 报告数字时同步列出数据集、分辨率、帧数、提示词、推理配置、硬件和指标版本；缺项则不作强结论。
- [理论公式依赖参数化] → 先固定符号约定，逐式核对 VP/VE 系数、时间方向和适用条件。
- [系列编号变化影响已有页面导航] → 合并大纲获批后更新 DDIM → Flow Matching → x-prediction → EDM → 条件图像扩散 → 图像基模的直接导航，后续章节顺延；保留旧 URL、分类与标题检索别名，每完成一篇即交用户审阅。
- [Score/SDE 与 EDM 内容重复] → 从 Score/SDE 文章移除现有 EDM 信息框、相关正文和论文引用，不添加 EDM 预告；相邻关系由系列导航呈现，EDM 内容集中在独立篇章。
- [原论文配置容易被误读为通用默认值] → 所有 `ρ`、噪声上下界、`σ_data`、训练噪声分布、FID 与 NFE 均标为论文实验配置，保留数据集和条件设置。

### 本轮研究边界

- EDM 原论文发表于 2022 年；后文对 Flow Matching、JiT 的比较属于本系列的综合分析，不能归为 EDM 原论文贡献。
- 区分 EDM 的去噪接口 Dθ 与预条件主网络 Fθ；接口给出干净图像估计，并不意味着 Fθ 直接进行 x-prediction。
- x-prediction 的研究须区分网络直接输出、损失空间和采样向量场；不得仅因变量可代数换算，就断言有限容量网络的优化难度相同。文章结构依上述七章已审草稿执行。

### DDPM / DDIM 采样解释补充（用户确认）

DDIM 正文对照部分、EDM 正文 PFODE 部分及 EDM 草稿第二章同步说明：原始 DDPM 是离散随机反向采样，具有反向 SDE 连续解释；确定性 DDIM（eta=0）是离散确定性更新，具有特定坐标下 ODE 解释。预测器不绑定采样器，广义 DDIM 允许随机性；跳步能力需要具体跨时刻转移依据，不能由 SDE/ODE 分类直接推出。EDM 后续重写须保留此说明。

### Flow Matching 速度含义补充（用户确认）

正文与[原始草稿](../../../drafts/video-generation/flow-matching.org)同步区分：线性条件路径的恒定速度标签，与固定位置和时间下对可能端点配对取条件平均所得的瞬时边际向量场。明确平均针对来源而非时间；生成时随状态、时间重新评估速度，条件直线不保证生成轨迹笔直。


**独立选题边界（2026-10-15）**：`drafts/image-editing.org` 是用户新增的独立任务，不属于视频生成 subcategory，不纳入本 change 的篇数与编号；本篇现有编辑接口说明暂保留，未来是否迁移需单独确认。

### 条件扩散正文实施记录（2026-10-15）

- 已将审阅通过的十章草稿转为 `src/pages/conditional-image-diffusion.html`，保留数学推导、论文原图及文末引用。
- 图像基模已生成第八篇正文、`sub_id: 80`，条件扩散保持第七篇、`sub_id: 70`；图像基模按最新决定接在其后，使用第八篇、80。
- 已构建并进行本地预览检查；修复页头参考链接溢出、引用转换及 Org 强调残留。

**篇序修订（用户确认，2026-10-15）**：条件扩散保持第七篇（70），图像基模为第八篇（80），之后接视频任务与时空建模（90）。图像基模结尾改为引出视频，不再将条件扩散称为下一篇。正文写作授权保留，本轮先回应并落实篇序调整。

**图像基模正文交付（2026-10-15）**：`src/pages/image-foundation-models.html` 已按原始草稿生成十章，保留 28 张原图/配图、4 个 Mermaid 与 24 项来源；模型三级、机制四级。条件扩散新增下一篇导航。单页语法检查与构建通过，本地预览可用；未推送或部署。


### 视频生成基模草稿文件拆分

按用户要求，原始长草稿拆为七个独立章节文件。总览与共写记录保留于 [video-diffusion-architectures.org](../../../drafts/video-generation/video-diffusion-architectures.org)。下表是后续写作与审校实际读取的草稿；以上章节规划与审阅状态分别对应这些文件，不能只读总览代替各章内容。2026-10-21 用户进一步明确“一章占一篇正文”，本节映射现作为正式正文划分依据。

| 章节 | 原始草稿文件 | 当前状态 |
|---|---|---|
| 第一章：视频生成任务与开创性工作 | [video-models-01-pioneering.org](../../../drafts/video-generation/video-models-01-pioneering.org) | 已逐篇审阅 |
| 第二章：开放视频基模 | [video-models-02-open-models.org](../../../drafts/video-generation/video-models-02-open-models.org) | 已逐篇审阅，保留编解码器核验结果 |
| 第三章：其他早期研究 | [video-models-03-historical-methods.org](../../../drafts/video-generation/video-models-03-historical-methods.org) | 已逐篇审阅 |
| 第四章：训练高效方法 | [video-models-04-efficient-training.org](../../../drafts/video-generation/video-models-04-efficient-training.org) | 已逐篇审阅 |
| 第五章：分镜与生成规划 | [video-models-05-storyboard-planning.org](../../../drafts/video-generation/video-models-05-storyboard-planning.org) | DirecT2V 已通过，Dysen-VDM 后继续补写 Free-Bloom；Free-Bloom 已审阅通过，VideoDirectorGPT 已审阅通过；LLM-Grounded VDM 已审阅通过，VisorGPT 已审阅通过；第五章正文已生成并构建预览 |
| 第六章：长视频生成 | [video-models-06-long-video.org](../../../drafts/video-generation/video-models-06-long-video.org) | 四篇全部审阅通过；已转成系列第十四篇正文，sub_id 140 |
| 第七章：多模态引导生成 | [video-models-07-multimodal-guidance.org](../../../drafts/video-generation/video-models-07-multimodal-guidance.org) | MM-Diffusion已通过；LFDM v1草稿待审；其余保留占位 |

各章保留原正文、公式、表格、图号与引用编号，并在末尾附所属章节的参考文献；共用 `drafts/assets/video-diffusion-architectures/`。后续内容更新直接落入各章文件，总览维护入口和状态。

### 七章与正文一一对应（2026-10-21 用户授权）

| 篇序 / sub_id | 正文 slug | 原始实质草稿 | 正文标题与状态 |
|---|---|---|---|
| 九 / 90 | `video-models-01-pioneering` | [第一章](../../../drafts/video-generation/video-models-01-pioneering.org) | 视频生成系列（九）：视频生成任务与开创性工作；正文已生成，十图/六项引用/完整推导，构建预览完成，用户审阅通过 |
| 十 / 100 | `video-models-02-open-models` | [第二章](../../../drafts/video-generation/video-models-02-open-models.org) | 视频生成系列（十）：开放视频基模；正文已生成，用户同意继续下一篇 |
| 十一 / 110 | `video-models-03-historical-methods` | [第三章](../../../drafts/video-generation/video-models-03-historical-methods.org) | 视频生成系列（十一）：其他早期视频生成研究；正文已生成，用户同意继续下一篇 |
| 十二 / 120 | `video-models-04-efficient-training` | [第四章](../../../drafts/video-generation/video-models-04-efficient-training.org) | 视频生成系列（十二）：视频生成的训练高效方法；正文已生成，构建预览完成，待用户审阅 |
| 十三 / 130 | `video-models-05-storyboard-planning` | [第五章](../../../drafts/video-generation/video-models-05-storyboard-planning.org) | 视频生成系列（十三）：分镜与生成规划；整体草稿通过，正文已生成并构建预览 |
| 十四 / 140 | `video-models-06-long-video` | [第六章](../../../drafts/video-generation/video-models-06-long-video.org) | 视频生成系列（十四）：长视频生成基模；四篇全部审阅通过，已生成正文并构建 |
| 十五 / 150 | `video-models-07-multimodal-guidance` | [第七章](../../../drafts/video-generation/video-models-07-multimodal-guidance.org) | 视频生成系列（十五）：多模态引导的视频生成；MM-Diffusion已通过，LFDM草稿待审，其余未展开，不发布 |

第十四篇按重要原论文组织长视频基模；第十七篇保留时间一致性、长程误差和流式推理的专题分析职责，后续须根据实质草稿去重。

#### 第九篇落实骨架

完整依据第一章草稿「文章草稿／第一章」，保留五个三级节，每篇方法内部使用四级标题；不从仅有标题的旧占位草稿重写。

1. **视频生成与时空建模基础**：任务、帧时间与扩散时间、联合分布、2D/3D/(2+1)D 卷积及参数量；图1 R(2+1)D 原图与运算比较表。
2. **VDM**：前向与联合网络、重建目标到噪声目标推导、联合训练、祖先采样、已知帧替换及 Bayes/Tweedie 重建引导全推导、实验局限；图2 VDM 网络，保留已知帧条件解释与两组消融表。
3. **Make-A-Video**：无字幕视频的数据分工、unCLIP prior、伪3D初始化、训练目标、补帧与外推、实验局限；图3–5 架构/时间卷积/时间注意力原图。
4. **Imagen Video**：类比 Imagen 图像级联、七级时空分工、训练标签/条件噪声、v-prediction和蒸馏、采样与实验边界；图6–8 Imagen/视频级联/时空模块原图。
5. **Align Your Latents**：潜空间、冻结边界、时间模块与解码器、训练采样、已知帧和时间掩码条件训练、补帧/超分和实验局限；图9–10 时间模块与完整流程原图。明确驾驶任务与文生视频的能力差异。

十张已有配图随解释位置进入正文；参考文献集中在末尾，删去 raw 内部整理说明。新增结尾总结与比较表仅归纳这五节已有结论。首篇使用 sub_id 90，承接图像基模80；下一篇尚未生成时以文字说明后续阅读，不添加无效链接。先构建本地预览，不推送远端。

**第一篇实施记录（2026-10-21）**：`src/pages/video-models-01-pioneering.html` 已依据对应完整草稿生成，五个方法/基础节和结尾综合比较均已落实，保留69处展示公式、十张配图、六项参考文献，使用系列九/sub_id90。已修正草稿两处缺失反斜杠，并将正文行内不等式写成 `\lt` 防止 HTML 误解析；图像基模80增加下一篇导航。完成源语法检查和构建，本地4000端口可预览；未推送远端。其余六篇正文未生成。

**首篇正文标题层级修订（2026-10-21）**：按用户反馈删除正文重复的“视频生成任务与开创性工作”总标题；时空基础、VDM、Make-A-Video、Imagen Video、Align Your Latents 与总结各为独立二级章（`ch-title`），其内部原四级标题提升为三级节（`h3.section-title`）。此决定替代首篇原“方法三级／机制四级”的呈现要求。

### 第十篇落实骨架（2026-10-21）

用户通过首篇后授权继续第二篇。正文依据 [开放视频基模完整草稿](../../../drafts/video-generation/video-models-02-open-models.org)，仅实施本篇；每个模型独立二级章，机制为三级节，不重复正文总标题。

| 二级章 | 解释主线与图表位置 |
|---|---|
| ModelScope T2V | 潜变量与 AutoencoderKL 实现核验、时空模块、混训目标、DDIM 采样、实验局限；图1整体架构、图2时空块、图3时间卷积、图4时间注意力，训练来源及指标表 |
| LaVie | 三级潜扩散、知识保持、混训损失、61帧插值、超分与采样；图5级联、图6时空Transformer，阶段与实验表 |
| Show-1 | 文本对齐动机、像素/潜空间分工、补帧与超分损失、专家翻译起点和训练区间；图7用户参考图、图8架构、图9输入构造，关键帧与专家消融表 |
| VideoCrafter1 | 潜空间和fps、渐进分辨率、双交叉注意力、I2V训练采样；图10架构、图11图像分支、图12视觉token对照，训练阶段与路线比较表 |
| Stable Video Diffusion | 数据筛选、三阶段训练、EDM目标、双路图像条件、ODE采样和逐帧CFG、补帧/相机适配；图13筛选、图14初始化、图15预训练保留效应、图16生成样例、图17相机LoRA，数据与阶段表 |
| VideoCrafter2 | F/P底模定义、空间时间耦合、联合视频训练后空间图像微调、采样与局限；图18生成样例、图19微调对照，保留原论文Table4/3两张表格图片并独立以表1/2编号 |

上述21张资产全部沿用草稿，原图号保留在图注出处；不新增Mermaid，避免重复原文架构图。结尾归纳表示、条件、训练、推理差别，七项参考来源集中末尾，导航衔接前篇与系列分类页。执行单页lint与构建后交用户审阅，不继续第三篇。

**第十篇实施记录（2026-10-21）**：六模型正文已依据完整草稿生成，保留50处展示公式、115处行内公式、19张插图和2张原论文表格图片、七项参考来源；补充综合比较和前后导航。修复两处缺失反斜杠、LaVie前后文次序与Org代码转写问题。单页lint和构建通过，浏览器确认165处公式渲染且无MathJax错误；本地4000端口预览，等待用户审阅。未继续第三篇，未推送远端。

### 第十一篇落实骨架（2026-10-21）

依据[第三章完整实质草稿](../../../drafts/video-generation/video-models-03-historical-methods.org)，用户已逐篇审阅并授权继续正文。正文按首次公开时间保留四个模型，二级章为模型名，内部使用简短三级标题，不重复总标题。系列十一/sub_id110。

| 章节 | 核心解释与图表位置 |
|---|---|
| VideoFusion | 问题、相关噪声的边际/协方差、中央帧、双网络、停止梯度损失、DDIM/DDPM采样、实验局限；图1共享噪声直觉（原Fig2）、图2前向过程（Fig3）、图3去噪（Fig4）、图4生成样例（Fig7），保留五组实验表 |
| Latent-Shift | 潜空间骨干、通道时间移位/零边界/感受野、训练权重与100步DDPM、性能与评测局限；图5框架（Fig3）、图6移位（Fig2）、图7消融（Fig7）、图8失败案例（Fig8），保留四组结果表 |
| PYoCo | 反演动机、混合/渐进噪声协方差、EDM回归、相关噪声PF ODE推导、四级采样、消融与研究猜想；图9反演噪声（Fig2a）、图10相关先验（Fig2b）、图11级联（Fig3）、图12强度消融（Fig7），保留五张表（含级联表） |
| VideoFactory | 交叉注意力方向、Swap-CA与残差/归一化、3D移动窗口复杂度、潜空间训练、RCAN超分与采样缺口、实验边界；图13注意力对照（v1 Fig1）、图14架构（Fig3）、图15数据消融（Fig4）、图16样例比较（Fig5），保留五组实验表 |

16张原图全部沿草稿解释位置插入，图号从1连续编号，原论文定位保留在图注；已有图足以说明结构，不另增Mermaid。四项一手参考文献集中末尾，VideoFactory明确v1边界。猜想与原论文结论分开，不把猜想归引PYoCo。补结尾路线对照表，承接上一篇并文字引出训练高效方法。完成单页lint、构建与浏览器预览，停下来供审阅，不继续第四章。

**第十一篇实施记录（2026-10-21）**：已生成 `src/pages/video-models-03-historical-methods.html`，保留四模型全部小节、60处展示公式及131处行内公式、16张原图、19张草稿表（83行，含表头），新增综合比较表，四项参考来源集中末尾。小节标题简化，保留PYoCo噪声搬运研究猜想和VideoFactory v1边界。单页lint、构建与浏览器渲染检查通过（191处公式，无MathJax错误，引用均有目标）。arXiv提交历史确认PYoCo于5月17日、VideoFactory于5月18日首发，草稿日期正确，已修复raw的两处错误日期记录。等待用户审阅，不继续第四篇、不推送远端。

### 第十二篇落实骨架（2026-10-21）

依据[第四章完整草稿](../../../drafts/video-generation/video-models-04-efficient-training.org)，用户已逐篇审阅并授权正文。系列十二/sub_id120，每模型二级章，机制为简洁三级标题，不重复总标题。

| 章 | 写作主线与图片位置 |
|---|---|
| MagicVideo | 潜空间成本、逐帧适配器、定向注意力掩码冲突、重建与噪声loss权重换算、两阶段训练、插帧/VideoVAE/超分、实验局限；图1框架（Fig2）、图2解码（Fig3）、图3消融（Fig7），保留四张实验表 |
| Text2Video-Zero | 免视频训练、短程去噪→搬移→回加噪、首帧注意力、DDIM、背景平滑、条件扩展和局限；图4方法（Fig2）、图5原文Algorithm1局部截图、图6消融（Fig10），保留CLIP比较表 |
| AnimateDiff | 可复用时间先验、帧/空间reshape、时间注意力、域LoRA、冻结范围及噪声loss、MotionLoRA、采样与实验；图7组合（Fig2）、图8三阶段（Fig3）、图9域适配消融（Fig6），保留阶段/方法比较/六指标表 |
| DSDN | 双流内容/变化表示、差分与合成、共用日程、交叉注意力、双loss、训练披露缺口、同步采样与局限；图10总览（Fig2）、图11分解合成（Fig4）、图12交互（Fig3）、图13消融（Fig7），保留配置和指标表 |
| SimDA | 空间/时间瓶颈、LSA拼图和复杂度、冻结参数与噪声训练、DDIM、超分与编辑、规模速度/质量/消融边界；图14架构（Fig2）、图15LSA（Fig3）、图16编辑（Fig4）、图17消融（Fig7），保留复杂度/参数速度/两组质量/模块消融表 |

保留17张既有原图（含算法局部）及15张原表；图号1–17，原图定位保留在图注；无需新增Mermaid。按草稿明确MagicVideo v2、AnimateDiff v2、DSDN v3、SimDA v1的版本边界。结尾增加“降低哪种成本／仍需什么训练”的总结表，五项参考来源集中末尾。与上一篇衔接，下一篇未完成则不加入失效链接。单页lint、构建、浏览器预览后停止供用户审阅，不发布未完成第五章。

**第十二篇实施记录（2026-10-21）**：`video-models-04-efficient-training.html` 已依据完整草稿生成五方法正文，保留17张原图/算法局部、15张原表（78行含表头）、61处展示公式及135处行内公式，新增总结表和前后导航，五项一手来源集中末尾。标题统一简化为模型二级/机制三级；保留MagicVideo输出/掩码冲突、AnimateDiff v2、DSDN训练披露、SimDA成本与评测边界。单页lint、构建、浏览器检查通过（196处公式、无MathJax错误，引用目标齐全），本地4000端口可预览。等待用户审阅，未发布第五章。

**第十二篇公式排版修订**：预览发现相邻多行展示公式经段落处理后混入标签；已将展示公式改为独占逻辑行并分隔，块内不等号用 `\lt`。重新构建后确认61个展示公式均无字面段落标签，源语法检查通过。

### 第十三篇落实骨架（2026-10-21）

用户已审阅通过 VisorGPT，并授权第五章输出正文、随后开始第六章。完整写作依据为 [第五章原始草稿](../../../drafts/video-generation/video-models-05-storyboard-planning.org)。系列十三/sub_id130，各模型独立二级章、机制为简洁三级标题，不重复总章标题。

| 二级章 | 解释与图表位置 |
|---|---|
| DirecT2V | 逐帧规划、RVM轮换参照、DSF双向匹配、PNDM推理与帧率、实验局限；Figures 1/3/4/8，保留两张实验表 |
| Dysen-VDM | 事件时间、动态图、局部与全局补充、RGTrm、图文双条件、训练采样与披露边界；Figures 2/3/4，保留三张实验表 |
| Free-Bloom | 两轮提示、联合噪声的边际与协方差、注意力切换、双路径补帧、免额外训练与评估边界；Figures 2/4/5/3，保留两张实验表 |
| VideoDirectorGPT | 视频计划、框插值、实体表示、unCLIP prior、身份共享、冻结骨干图像训练、PLMS与控制调度；Figures 2/3/11/5，保留五张表 |
| LLM-Grounded VDM | DSL、TopK/质心能量、输入梯度、免训练成本、计划/执行落差与失败案例；Figures 2/4/6/11，保留比较表及五张原实验表 |
| VisorGPT（相关视觉先验） | 标注序列、NLL、GPT-2从头训练、前缀采样、条件图像接口及空间先验边界；Figures 1/6，保留字段表和Table5 |

共21张论文原图，正文图号1–21，原文图号保留在图注；不额外增加重复架构示意。保留51处展示公式、全部原有表格及版本/协议边界；新增结尾路线对照总结，六项参考来源集中末尾。双向连接第四章与本篇，后续第六章仅写草稿，不添加未存在的正文链接。单页lint、构建并检查公式与图片呈现。

第六章先从用户指定的 LVDM（arXiv:2211.13221）逐篇共写；先整理原文、核对长视频扩展机制与实验，再填草稿。完成一篇即停供审阅，不生成第六章正文。

**第十三篇实施记录（2026-10-21）**：已生成 `src/pages/video-models-05-storyboard-planning.html`，完整覆盖45个机制小节，保留21张原图、51处展示公式、128处行内公式、21张草稿表格，另补路线总结表，六项来源集中末尾，双向导航接第四章。单页lint与构建通过；浏览器确认179处公式无MathJax错误或段落标签污染、21张图片均加载，223处引用均有来源。代码审查逐项核对了草稿标题、公式、图表和导航，无实际问题。本地4000端口已更新；未推送远端。

**第六章首节草稿记录**：已整理原文 `raw/lvdm-2022/` 并核读v2正文与TeX，LVDM同名节已写入第六章草稿；明确潜帧与RGB帧、视频时间与扩散时间、条件训练与推理、层次窗口数与采样步数的区别，保留三张原图及两张完整实验表。Figure7(b)引导消融的图文矛盾如实标注，避免将其写成稳定提升。LVDM已审阅通过；后续进展见VideoGen草稿记录。

**第六章VideoGen草稿记录（2026-10-21）**：LVDM通过后，核读 `raw/videogen-2023/` 的arXiv v2正文、HTML与TeX，确认正式标题、9月1日首发/9月7日修订及来源。依据[第六章草稿](../../../drafts/video-generation/video-models-06-long-video.org)同名节补充问题、参考空间潜变量与首帧通道拼接、三级空间扩散、运动warp/去噪与低高频分工、视频解码、训练数据/冻结边界、采样和实验局限。保留原Figures2/6/7/5与Tables1/2/3全部数据；标准LDM目标与warp/频率式明确为教学展开，不冒充原文公式，不引用源码注释旧稿的参数为正式披露。强调补帧不等于长时续写、IS与FVD结论不同、评测16帧256²与结构高清尺寸分开。VideoGen待审；VidRF、NUWA-XL未展开，本轮不写HTML。


**第六章VidRD草稿记录（2026-10-21）**：VideoGen已审阅通过；依据 `raw/reuse-and-diffuse-2023/` 的原始TeX、PDF与原图，在[第六章草稿](../../../drafts/video-generation/video-models-06-long-video.org)的“VidRD：复用轨迹续写视频”补写八节：问题与短片模型、FNR、PNS、DSG、解码/数据、训练采样、实验、局限。VidRF按高置信度候选VidRD展开（原截图未直接核对）；保留初始噪声与中间轨迹复用的区别、噪声方差与相关性教学推导、DSG数值阈值与50步时间表解释、确定性DDIM与上下文变化、提示帧并非硬约束重叠帧。插入Figures2/3/5/6/9/10与仅Algorithm1区域的PDF裁图，Tables1/2/3按原生Org完整整理。原文正则权重排版歧义不擅改为确定数值；16帧指标不外推长程质量。VidRD待审，NUWA-XL未展开；本轮仅Org草稿，无HTML或构建。


**第六章NUWA-XL草稿记录（2026-10-21）**：VidRD通过后，按read-article提取脚本整理 `raw/nuwa-xl-2023/`，核读arXiv v1（2023-03-22）TeX、PDF及四张原图。在[第六章草稿](../../../drafts/video-generation/video-models-06-long-video.org)“NUWA-XL：先生成全局，再填局部”下写九节：问题、T-KLVAE、MTD、条件接口、层次展开、训练采样、并行、实验、局限；补标准DDPM路径、原Equation4/16的方差与标准差瑕疵、F_m=(L−1)^m+1及16→226→3376教学推导、真实条件与生成条件的差别。完整保留Figures1–4、Table1及Table2(a–d)，没有原算法框则不伪造截图。说明未知权重共享/冻结/CFG/设备和采样配置，26秒仅对应128分辨率下原表比较，B-FVD-16不证明全局叙事。按v1时间排序LVDM→NUWA-XL→VideoGen→VidRD，图83–100顺排，末尾加本章方法对照。NUWA-XL待审；本轮无HTML或构建，未推进第七章。


**VidRD可读性修订（2026-10-21，用户要求）**：依据用户认可的问答解释重组[VidRD草稿](../../../drafts/video-generation/video-models-06-long-video.org)：先提出“接得上但不重播”的矛盾，再讲首段保存初始噪声/中间状态，依次回答FNR从哪里开始、PNS怎样产生新内容、DSG怎样稳定连接。加入A–H倒序例子、位置分工表和三机制总结表；先直觉与例子，后公式。基础网络/损失移到续写机制之后，保留全部原图、算法截图、数学推导、三张原表和局限。强调没有显式学习未来事件、基础模型仍需训练；图94–100按新阅读顺序重编号。仅修订Org草稿，不生成HTML。


### 第六章正文发布（2026-10-21，最新状态）

用户确认整章审阅通过，依据[完整原始草稿](../../../drafts/video-generation/video-models-06-long-video.org)，生成[系列第十四篇正文](../../../src/pages/video-models-06-long-video.html)，sub_id 140，分类为视频生成。正文按首发时间组织 LVDM → NUWA-XL → VideoGen → VidRD，保留全部解释、40组独立公式、18张原图（含原始算法裁图）与21张可编辑表格；图片按篇内顺序编号1–18。VidRD保持问题、轨迹保存、FNR/PNS/DSG、网络训练、实验局限的讲解顺序；保留原论文排版冲突与未披露配置的证据边界。同步前篇导航、草稿发布元数据及本change状态。本轮仅发表第六章，第七章仍未展开；历史记录中的待审状态以本条为准。


**第七章首篇草稿记录（2026-10-21）**：使用现有change `video-generation`，依据用户授权回到[第七章草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)，先完成当前已识别最早的MM-Diffusion（2022-12-19首发，阅读2023-03-24 v2）。按read-article脚本提取source/HTML/PDF及12个图文件至 `raw/mm-diffusion-2022/`，主agent核读原始TeX、主表与补充配置；Luna整理来源与核查官方条件采样代码。草稿从任务与海浪例子走通联合去噪，再解释独立前向与联合分布、双分支噪声loss/score关系、耦合U-Net与RS-MMA、DDPM教学采样、条件替换和误差梯度、训练配置、实验与局限。插入原Figures2/3/5/4，保留完整Tables1–6与补充Table A.1配置整理；明确默认与完整DDPM的指标差异、人评“无法判断”计通过、原文梯度式与公开代码缩放差异，不将条件引导称CFG或精确后验。图101–104延续草稿编号。仅此篇完成待审，不写后续论文、不生成HTML。其余论文首发日期清点见 `raw/video-foundation-models-collection/multimodal-first-release-order.md`；MinD-Video旧arXiv链接为数学论文，已撤除，身份未核前不补写。


**第七章LFDM草稿记录（2026-10-21，最新状态）**：用户审阅通过MM-Diffusion及MM-Block/cross-attention答疑；已将两者的包含关系、模态内部处理/信息交换分工、全局与窗口交互成本和证据边界融入[原草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)。随后按已确认首发日期继续LFDM（2023-03-24，arXiv v1）。Luna运行read-article原文提取脚本，整理 `raw/lfdm-2023/`；主agent核读TeX、原表及补充材料，完成任务→完整推理→后向采样/遮挡→LFAE重建→扩散噪声训练→表示分工→采样/CFG→配置→实验/适配/消融→局限。保留全部六张论文原图（Figure1–5及补充A1），草稿图号105–110；九张原实验表完整整理，主Table1按数据集拆三表。明确图像flow不等于Flow Matching、两通道形变加一通道可见性、重建监督不等于光流真值、类别BERT条件不等于自由文本控制、40帧与扩散步数分开；如实说明相应LDM更快、少步DDIM与质量取舍、分辨率/采样预算差异。LFDM待审；仅草稿，无HTML，不推进后续论文。


### 第七章Generative Disco草稿记录（2026-10-21，最新状态）

用户审阅通过LFDM并授权继续；沿用[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)，按首发时间接续Generative Disco（2023-04-17首发；阅读2023-09-28 v2）。Luna运行read-article提取脚本，整理原始TeX、HTML、PDF、15个图文件及证据至 `raw/generative-disco-2023/`；主agent核读设计研究、系统实现、用户研究、结果和讨论。

草稿同名节按问题→完整流程→保持/过渡→音频累计强度控制进度→提示与人的分工→复用模型/成本→用户研究→局限展开。Figures3/8/7/5/4/9分别放在流程、保持、过渡、音乐区间、问卷和伪影解释处，草稿图号111–116；原图足以支持解释，无需另加重复Mermaid。保留50部MV的六类观察数、完整Table1参与者资料、原文报告的全部问卷中位数/人数及提示分析比例。累计进度和生成算子为标明来源边界的教学公式，不虚构新训练目标或底层库的精确插值核。

明确它是复用SD v1.4、Stable Diffusion Videos和GPT-4的交互式音乐可视化系统；人工选择语义与区间，音频打击成分影响插值推进，不写成新训练的联合音视频基模。24fps与去噪步数分开，V100的延迟不称实时；12人/10秒用户研究不能外推FVD优势、效率提升或任意长一致性。LFDM已通过，Generative Disco待审，LaMD等未展开；本轮仅Org草稿，不生成HTML。


### 第七章LaMD草稿记录（2026-10-22，最新状态）

用户审阅通过Generative Disco并授权继续，按首发顺序写入[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)的LaMD节。LaMD于2023-04-23首发，本次依据2025-04-18修订v2；Luna执行强制提取脚本后source读取阻塞，记录失败并降级取得HTML、PDF和10张HTML原图，存 `raw/lamd-2023/`，额外保留v1 HTML用于版本边界。主agent直读方法、Equations1–6、全部Tables1–13及讨论后写作。

结构为问题→两阶段流程→时间轴压入运动表示→信息瓶颈→融合重建→条件运动DDPM→配置→重建/生成/控制实验→速度与消融→局限。插入Figures2/6/3/4/5/8/10，草稿图号117–123，分别服务流程、运动迁移、融合解码、采样成本、重建、文本控制、去噪进展；已有原图充分，不额外增加重复Mermaid。保留全部13张原表为可编辑Org表，另加数据协议/表示对照表；高斯KL展开、512倍标量计数、相邻采样操作明确为原式的教学展开。

重点说明LFDM保留形变序列而LaMD压缩整段运动、二维去噪不等于没有三维解码、信息瓶颈不保证纯运动、首帧外观仍须约束运动生成。注明MUG原表256/4与32²潜变量的尺寸矛盾、200步子序列采样不擅称确定性DDIM、速度表默认参数量不同于DMG量；不把更小张量比例当实测加速，不把128帧速度外推长程质量。保留LaMD部分FVD弱于LFDM、动态程度低于DynamiCrafter、重建/生成取舍的实验事实。Generative Disco已通过，LaMD待审，后续MCDiff未展开；仅Org草稿，不生成HTML。


### 第七章MCDiff草稿记录（2026-10-22，最新状态）

用户审阅通过LaMD并授权继续。依据[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)同名节，按2023-04-27首发时间展开MCDiff（2304.14404v1，ICCV2023）。Luna按read-article脚本取得source、HTML、PDF及8个原图文件；主agent核读方法、实验、附录控制评测、局限，资料在 `raw/mcdiff-2023/`。

结构为问题→逐帧完整流程→缺失条件与稀疏补全→运动监督及加权损失→未来帧潜扩散与联合微调→配置→质量/消融→目标位置误差→路线对照与局限。原Figures1/2/5/3/4/6分别放在任务、流程、运动补全、标注、对比与多样控制解释位置，草稿图号124–129。原图足以表达流程，不重复增加Mermaid。保留主文Table1全部两数据集/三笔画数的四指标、Table2消融和附录Table3全部ADE/Recall数据；拆为五张可编辑Org实验表，另有配置/数据/路线对照。

明确F预测运动场而G扩散生成下一帧，运动场是条件，不是LFDM式形变生成或LaMD整段运动编码；视频时间与扩散时间、真实运动预训练与预测运动联合微调分开。缺失控制不等于零运动，控制误差不为零，不承诺其他区域冻结。原式文字MSE与未平方L2范数不一致如实记录；噪声分布记号简略处按DDPM高斯机制进行明确标注的教学展开，不擅自填推理步数、日程或速度。PDF回查确认控制表为Table3。LaMD已通过，MCDiff待审，AADiff及后续未展开；仅Org草稿，不生成HTML。


### 第七章AADiff草稿记录（2026-10-22，最新状态）

用户审阅通过MCDiff并授权继续；沿用[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)，按2023-05-06首发顺序写入AADiff，阅读2023-05-23 v2（CVPR2023 AI for Content Creation Workshop）。Luna执行read-article强制脚本成功取得source、HTML、PDF和9张原图，整理 `raw/aadiff-2023/` 的meta/evidence/extraction-log；主agent直读全文与原架构图后写作。

结构为问题→完整流程→声音相关词选择→局部注意力强度→时间平滑→预训练组件/真实图像反演→实验与边界→小结。Figures1/2/3/5/4/6/7/8/9依解释顺序放置，草稿图号130–138：架构、滑窗直觉、声源示例、真实图像、CLIP曲线、窗口消融、多声源、幅度调节、同类不同录音。全为source原图，不新增重复Mermaid。

原文没有显式公式与数值实验表，不编造损失或FVD/速度排名。top-k、标准cross-attention、目标词幅度缩放、均值滑窗均标为教学展开；配置与证据边界用可编辑Org表整理。明确CLAP/CLIP表示共同空间细节未披露、修改注意力不自动保留概率归一性、窗口核/边界及跨帧状态未完整说明；没有新增模型训练不等于预训练组件没用过配对数据。声音调节语义强度而非精确速度/位移，区别于Generative Disco的累计过渡进度；CLIP曲线不能证明精确事件同步，s=150是5秒30fps示例的全片窗口。MCDiff已通过，AADiff待审，后续CoDi等未展开；仅Org草稿，不生成HTML。


### 第七章CoDi草稿记录（2026-10-22，最新状态）

AADiff已审阅通过。依据[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)的CoDi节完成下一篇，使用2023-05-19的2305.11846v1，不混入CoDi-2。Luna执行read-article强制脚本取得source、HTML、PDF及六张原图，证据与日志位于 `raw/codi-2023/`；主agent核读方法、训练、实验和附录，回查源码纠正素材索引将LAION的multirow行数误算为双倍样本的问题，正确数量为400M。

结构：问题→完整生成流程→条件桥接→四模态潜扩散分支→输出环境表示与cross-attention→阶段冻结/采样→数据配置→全部定量实验→MM-Diffusion对照及局限。Figures1/2/4/6/3/5分别用于任务、架构、多输入、时间移位、单输出和联合输出，草稿图号139–144。已有原图足够，不增加重复Mermaid。所有正文实验表与附录配置、训练数据均保留为可编辑Org表，宽音频表拆分客观/人评。

区分条件编码器C读取已知输入、环境编码器V读取当前带噪输出；解释桥接减少配对类型而非无需配对数据。原文预备知识系数存在不一致，改用明确说明的标准DDPM累计平方根系数；同步更新伪代码标为教学整理，非原论文截图。说明50步DDIM eta=1仍有随机性；正文SD1.5/附录SD1.4及WebVid规模等口径差异不擅自统一。保留多条件图像FID变差、视频语义指标并非最优的结果；SIM复用自身编码器、三输出行包含输入文本标签，不据此断言精细同步或正确联合分布。CoDi待审，后续TPoS等未展开；仅Org草稿，不生成HTML。


### 第七章MovieFactory草稿记录（2026-10-22，最新状态）

CoDi已审阅通过，按已确认首发顺序展开2023-06-12的MovieFactory（2306.07257v1），而非按旧占位顺序提前写TPoS。使用[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)同名节；Luna执行read-article脚本取得source/HTML/PDF、整理五张原图及版本证据，主agent完整直读main.tex。来源存于 `raw/moviefactory-2023/`。

结构：问题→ChatGPT逐镜头脚本→空间适应/时间训练→电影适应与超分→音效/配乐检索→短视频实验与电影展示→路线比较及局限。插入Figures1–5，草稿图号145–149，分别服务整体流程、阶段训练、音频检索、视频示例和电影示例；不加重复Mermaid。保留唯一Table1全部三模型FVD/CLIPSIM值为可编辑Org表。

重点解释SD2.0原主干冻结、新增空间层和域参数学习、时间阶段新增层学习与WebVid域选择、电影适应只更新新增空间层，区分768×320生成与RealBasicVSR四倍后的3072×1280。原式H=X·alpha_i+beta_i按通道广播解释，域索引不混同扩散日程；LLM流程与一般检索公式标为教学展开，不推测未披露的loss、采样器或音轨融合。明确声音检索非CoDi式联合扩散、脚本连贯非身份硬约束、分段成片非长程物理连续；披露联合空间训练与WebVid-only评测描述差异，FVD表不能作为各模块消融、精细同步或整片叙事评测。MovieFactory待审，未展开其他论文或HTML。


### 第七章DragNUWA草稿记录（2026-10-22，最新状态）

MovieFactory审阅通过后，按首发顺序展开DragNUWA（2308.08089v1，2023-08-16），依据[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)同名节继续共写。Luna执行read-article脚本取得source、HTML、PDF及六张原图，资料及版本记录在 `raw/dragnuwa-2023/`；主agent完整读取iclr2024_conference.tex并单独回读方法段。文件名与模板年份不充当论文版本日期，不混入后续DragNUWA1.5/SVD实现。

结构：任务→拖拽到视频完整流程→光流锚点/采样/跟踪/高斯增强→多尺度条件接口→先稠密后稀疏训练→全部配置→镜头/曲线/条件组合示例→对照与局限。Figures1/3/4/5/6/2分别用于条件分工、训练流程、镜头控制、复杂轨迹、条件组合、开放场景，草稿图号150–155；不增重复Mermaid。原文唯一Table1为配置表，拆成数据/训练/多尺度形状三张Org表保留全部数值，原表索引在raw下tables/index.md。没有数值性能或组件消融表，不虚构FVD或轨迹误差。

解释RGB与二维光流通道、视频帧序号与扩散时刻、x_0不是首帧、轨迹补零用于长度对齐；锚点随机扰动与幅度加权不等于运动大小完全均衡。采样概率归一化、跟踪位置式标为教学展开。按原文保留三次顺序残差仿射调制与文本cross-attention，mask不当作前景分割；训练两阶段噪声损失并非显式轨迹坐标损失。明确密集光流来自训练视频，推理仅需用户轨迹；镜头移动没有显式3D相机位姿。未披露采样器/步数/引导不从后续代码倒填；软控制不承诺精确命中、身份和未编辑区域不变。DragNUWA待审，未继续TPoS或输出HTML。


**DragNUWA配图链接修复（2026-10-22）**：草稿六图引用改为实际的 `dragnuwa-2023/figures/` 路径，并将条件组合图文件名对齐为 `dragnuwa-condition-combinations.webp`。核查本篇草稿全部本地配图路径存在性及栅格文件可解码性。


### 第七章TPoS草稿记录（2026-10-22，最新状态）

DragNUWA审阅通过，继续[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)TPoS节。采用2023-09-08 arXiv2309.04509v1。Luna按read-article首先执行fetch脚本，source下载阻塞后记录失败并回退官方HTML；PDF未完整取得并移除不完整文件。主agent读取HTML全文及MathML alttext核对全部方法公式和实验。素材位于 `raw/tpos-2023/`，未将HTML图片称为PDF裁图。

结构：问题→完整流程→ResNet/LSTM/TAM→语义与条件映射训练→SEGA式声音去噪引导→条件球面插值→数据/全部定量实验/人评→同类方法对照及局限。Figures1/3/4/5/9/6/8/10/11/12/13/14分别置于任务、架构、编码训练、TAM、引导消融、基线、TAM消融、语义过渡、人评与三类扩展；草稿图号156–167。已有原图充分，不增加重复Mermaid。保留Table1功能分类和Table2全部数值，宽表拆成视频质量与语义相似度。图片文件均在明确顶层路径，逐项核对存在与可读性。

保留Equations1–7的核心目标、语义对比/增强0.6权重、条件MSE与总损失。原式2温度在指数外会抵消，显式用标准InfoNCE作教学校正；LSTM下标重编号、slerp均注明教学展开。区分音频播放索引与去噪时刻、全局汇聚训练与逐片段生成、CLIP投影空间与U-Net条件张量。保留原式7未定义空条件状态与动量细节边界，不编完整采样代码；启用时刻计数表述不一致不硬填次数。身份保持没有额外明确列入总loss，共享噪声非几何硬约束；TAM权重不当作物理响度。FVD使用Landscape微调I3D，不跨协议横比；IS均值接近且波动，不宣称显著性；引导消融同时改变delta，非单变量。Figure11人评不估读精确均值。TPoS待审，未继续NExT-GPT或HTML。


### 第七章NExT-GPT草稿记录（2026-10-22，最新状态）

TPoS审阅通过后，在[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)继续NExT-GPT（2309.05519，2023-09-11首发，读取arXiv v3/ICML2024修订稿）。Luna执行read-article强制脚本成功取得source/HTML/PDF及原图，资料存 `raw/next-gpt-2023/`；主agent直读main.tex全部方法、训练、主实验与附录结果，回查HTML图号。原图与表格索引保留，不把修订版新增结果归为2023首发。

结构：问题→完整推理流程→输入Grouping→输出信号/连续条件→三阶段训练/配置→全部理解/生成/编辑结果→接口消融/人评→指令数据完整比较→CoDi对照及局限。Figures1/7/6/2/3/5/8/4分别用于架构、推理、token数量、双侧对齐、MosIT、人评、复杂转换及示例，草稿图号168–175，八图实际路径和可读性逐一核对。原图充分，不增加重复Mermaid。保留配置、主文感知/生成/Grouping、全部9张附录任务结果、训练配方与指令数据比较，宽表按指标拆为Org表。

重点解释signal token不等于像素码，隐藏状态需投影为生成器条件；冻结网络仍可向条件回传梯度；参数统计155M含33M LoRA，占总量约1.25%，不是只有投影也非推理只需1%内存。分组显式补转置与straight-through梯度教学解释，不替原文补完整池化。列出阶段2仅训输出投影却列上游tokenCE的梯度路径疑点，以及0起始token区间与4/8数量口径差异。主文/附录COCO描述、AudioCaps及零样本视频数值分开，不擅自统一。视频生成表FID不误写FVD，CLIPSIM百分数尺度不混同0.xx，保留CoDi音频指标更好、编辑并非最优等事实。人评100条指令/五人/图像输出与附录1–10复杂转换分开；LLM语义协调非CoDi式同步联合去噪。NExT-GPT待审，未展开身份未确认的Generative Dynamics/MinD-Video或HTML。


### 第七章MinD-Video草稿记录（2026-10-22，最新状态）

NExT-GPT审阅通过，继续[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)MinD-Video节。原始TeX方法宏、作者项目链接和官方HTML确认其对应Cinematic Mindscapes: High-quality Video Reconstruction from Brain Activity（2305.11675v1，2023-05-19）。Luna执行read-article素材整理取得source/HTML/PDF、十张原图及原表索引；主agent阅读原TeX方法、实验与补充配置。素材存于raw/mind-video-2023/。纠正旧数学论文链接，不把注释掉的旧标题作为正式标题。

结构：问题→完整流程→MBM/窗口注意力/图文对齐→视频时间扩展→负向引导→数据与全部配置→语义/SSIM评测→完整消融→脑区注意力及失败边界。十图包括主文Figures1–7、补充消融/参与者/失败案例；原图已足够，不加重复Mermaid。全部消融均值、波动、显著性和MBM配置保留为可编辑Org表。按首发日期补到AADiff与CoDi之间，全章图号依阅读顺序重排为101–185，既有内容与配图保留。

区分物理时间、扫描窗口与扩散时间；fMRI低采样且延迟，不等于原视频像素。窗口使用后续扫描，不称实时因果读取；邻帧稀疏注意力不等于视频整体自回归生成。负向引导不是GAN，披露测试集平均fMRI的条件统计；标准掩码MSE与潜扩散MSE标为教学展开。保留训练步数异常分组、参与者2表格±0.13，不替原文纠错造数。85%是视频2-way语义分类，非像素恢复率；不夸大所有指标改善、跨人泛化或脑区因果解释。

Generative Dynamics已核为Generative Image Dynamics（2309.07906，2023-09-14），仅更新待写占位与身份索引，本轮未展开。MinD-Video待审，未输出HTML。核查草稿全部本地图片路径存在与栅格可解码性。


### 第七章Generative Image Dynamics草稿记录（2026-10-22，最新状态）

MinD-Video审阅通过后，完成[第七章原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)末篇Generative Image Dynamics，2309.07906，2023-09-14首发；采用arXiv v3（2024-05-14，CVPR2024）。Luna运行read-article强制提取脚本，保存source/HTML/PDF、全部原图、两张数值表和版本索引；主agent直读main.tex指向的全部活动-cam方法、引言、相关工作、实验与结论。资料在raw/generative-image-dynamics-2023/，不混用包内旧稿。

结构：问题→从照片到运动频谱/轨迹/渲染的完整流程→相对原图位移与FFT直觉/展开→光流监督→频率归一化/潜扩散/两阶段协调→多尺度softmax splatting→普通采样/循环引导/模态交互→训练配置→完整主结果与消融→适用范围和失败。原文Figures1/3/2/4/5/6/7/8分别插入任务、架构、频谱、渲染、X-t比较、时间退化、基模样例、局限，对应草稿图186–193。复合图保留各原面板及列名；不增重复Mermaid。两张原表每张按帧/视频指标拆成Org表，保留全部行列数值。

频率轴不是视频时间轴，去噪步n另行定义；位移相对起始图，不等于相邻光流或Flow Matching速度。FFT共轭、DC、采样周期和循环接缝均解释，低频有限表示不夸大为无限事件生成。95百分位缩放不写成严格范围保证，四通道频率切片不混同VAE四通道潜特征。VAE重建误差与扩散注意力贡献分开；标量振动、完整FFT/逆归一化、感知损失示意标为教学展开。循环约束在推理时加入，模态模拟不宣称识别真实物理参数。250步运动扩散与25FPS渲染严格分开。16频率并非所有指标最优，人评80.9%限定为30个振荡场景测试样本；不夸大为通用视频基模胜率。第七章13篇已齐，此篇待审，未转HTML或继续其他章节。

**配图核查**：本节八张本地图片均存在且可解码；章内13篇论文标题完整。频率归一化统计已回活动TeX核对为95百分位，并纠正素材索引笔误。

### 第七章发布设计（2026-10-26，用户已授权）

将已逐篇审阅通过的[第七章完整草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)转为 `src/pages/video-models-07-multimodal-guidance.html`，标题“视频生成系列（十五）：多模态引导生成”，分类AI/视频生成，sub_id=150。依据草稿现有13个二级论文标题，每篇作为ch；小节为h3，内部子节为h4，不再添加“第七章”包装标题。按首次公开顺序保留MM-Diffusion、LFDM、Generative Disco、LaMD、MCDiff、AADiff、MinD-Video、CoDi、MovieFactory、DragNUWA、TPoS、NExT-GPT、Generative Image Dynamics。

保留草稿93图（单篇重新顺序编号1–93）、全部数值表和105组展示公式；资产复制至正文专属目录并将PNG转为WebP，引用转换为站点cite-key，参考资料移除仅供研究追踪的raw本地路径。前篇长视频页新增下一篇链接，分类索引由alias自动生成。将近期答疑中“每点二维运动共享频率刻度、训练光流与推理采样、遮挡下轨迹不可直接测得、长时规律运动与成本界限”补入对应频谱/监督/采样小节；Avatar Forcing双分支仍属未验证设想，不作为论文事实发布。发布保留版本与协议边界，构建后检查公式、图表、引用与本地路径，不改其他文章内容。

**发布落实**：正文已保留13篇、93图、108张原始拆分表、105个展示公式及346个行内公式，另补本章机制对照小结。所有配图转正文目录并核对可读性，公式与草稿逐条一致；配置键kernel_size/warmup_ratio保留代码字面值。前篇导航已更新。源HTML lint与构建通过；发布提交触发main分支自动部署。

### 引入与收尾补充（2026-10-26）

按用户要求，在正文首个论文前增加从前篇视频生成/长视频/分镜转向具体控制需求的引入；在本章小结表与局限归纳之后、导航之前增加收尾段，以“信号→表示→生成接口”串联各路线，并落到可修改、可复现及控制有效性的判断。同步[原始草稿](../../../drafts/video-generation/video-models-07-multimodal-guidance.org)首尾，不改论文推导和实验。
