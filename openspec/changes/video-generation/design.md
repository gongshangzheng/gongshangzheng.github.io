## Context

**当前设计状态（2026-10-14）**：`drafts/video-generation/diffusion-model-basics.org` 已形成实质草稿，用户认可当前结构。本轮将首篇设计对齐该草稿：先讲流形与概率路径的直觉，再推导 DDPM 前向链、从变分 KL 到噪声预测损失、反向采样，并以局限章节连接后续方法。整体系列顺序的进一步调整仍按 proposal 中既有计划处理；本次只确认首篇结构，不据此推断尚未澄清的其他章节编号。

用户强调正文引用必须位于文末参考来源；首篇保留已插入笔记的原论文图 4（Algorithms 1–2）和图 5（Figure 6），并列入用户给出的 AIDIY Wiki、抖音视频和 3Blue1Brown 客座视频。
见 `proposal.md`。旧的 `drafts/video-generation.org` 已按用户要求删除，不再作为素材来源。系列规划为 10 篇正文和 1 个 Hub：首篇由扩散直觉进入 DDPM，第二篇讲 Score、DSM 与连续时间扩散，第三篇独立讲 EDM 的设计空间，随后讲 DDIM、Flow Matching、条件图像生成，再进入视频任务、架构、数据评测与长视频生成。

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

系列共 10 篇正文和 1 个 Hub。首篇合并扩散模型入门与 DDPM，避免把加噪、噪声预测和反向采样的直觉与数学定义人为拆开；EDM 作为独立篇章接在 Score/DSM 与连续时间扩散之后，Flow Matching 接在 DDIM 之后，桥接现代视频生成。下列逐节素材路径是当前可用入口；已归档来源以 `raw/` 中的原论文、源码和分析文件为准。教程性文章不强行套用论文精读的“方法—实验”结构；关键数据点若无可比口径则明确说明，不拼凑排行榜。

### `video-generation-hub`｜视频生成系列总览

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-generation-hub.org](../../../drafts/video-generation/video-generation-hub.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | Hub；aliases `视频生成系列`、`categories/AI/视频生成/index` 与 `categories/AI/视频生成`；sub_id `0` |
| 服务对象 | 读者能按 DDPM、Score/DSM/SDE、EDM 设计空间、采样、Flow Matching、图像条件、视频架构、评测和长视频问题选择阅读路径。 |

**章节骨架**

#### 1 系列范围与阅读路线
- **写什么**：说明系列从 DDPM、Score/DSM/SDE 与 EDM 进入 DDIM、Flow Matching 和条件图像，再转入视频生成的组织逻辑，列出先修路线及各篇解决的问题。
- **素材来源**：本设计文档的 10 篇章节规划及各篇已核验的 sources。
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

### `edm-design-space`｜视频生成系列（五）：EDM——重新梳理扩散模型的设计空间

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [edm-design-space.org](../../../drafts/video-generation/edm-design-space.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `50`；Hub `video-generation-hub` |
| 服务对象 | 读者读完能说明 EDM 不是一种新 SDE，而是怎样用共同的去噪接口拆开扩散模型的训练与采样选择，并解释论文中的关键公式和实验边界。 |

**结构选型（Read Article Phase 4）**：以 **B. 对比驱动型** 为主，吸收 **D. 技术解析型** 的方法展开。EDM 的主要贡献是把扩散模型的训练和采样选择放进可比较的设计空间，而非提出一套新的端到端网络。文章先用一个独立数学章节统一推导 `x₀`、`x_t`、`ε`、`v`、score 与 EDM 去噪器之间的换算；后续章节引用这组结果，不在训练、ODE 和采样章节重复推导。再分别讲网络参数化、训练配置、推理噪声日程、PF-ODE 连续轨迹、Euler/Heun 数值求解器、随机 churn 和实验。概念层级要明确：PF-ODE 给出确定性连续向量场，Euler 与 Heun 是对它作离散数值积分的求解器；churn 会额外注入随机噪声，因此不是同一条纯 ODE 轨迹。正文目标不少于 3000 字，数学推导和方法占主体，实验部分不少于 600 字。

**章节骨架**

#### 1 为什么要把扩散模型拆成“设计空间”
- **写什么**：从 Karras 等人指出的阅读与工程问题切入：不同扩散方法往往把理论过程、噪声参数化、网络预条件、训练目标和采样器绑成整体，难看出哪个选择带来收益。交代 EDM 的任务是把这些决策显式列出并逐项评估；它不是一套新前向 SDE，也不意味着模块在所有组合下都能无损互换。说明本文聚焦 DSM 类、对高斯扰动数据分布建模的扩散方法。
- **素材来源**：`raw/edm-2022/sources/edm-2022.pdf`；`raw/edm-2022/source-tar/paper.tex` §1，lines 79–105；`raw/edm-2022/analysis/methodology.md` §Research question and motivation。
- **必备元素**：一张训练设计轴 × 采样设计轴的自绘路线图；术语框解释 EDM 全称、论文年份与它在本系列中的位置。

#### 2 统一变量与换算：从 `x₀`、`ε`、`v` 到 score
- **写什么**：集中完成全文的核心推导。先定义 VP 记法 `x_t=α_t x₀+σ_t ε`、`α_t²+σ_t²=1`，以及一种明确标注约定的 `v_t=α_t ε−σ_t x₀`。把两者写成正交线性变换矩阵并推导逆变换，给出任意一种网络输出到其余变量的完整换算表。再从高斯扰动核推出 score 关系 `s_t=−E[ε|x_t]/σ_t=(α_t E[x₀|x_t]−x_t)/σ_t²`，说明由 `x₀`、`ε` 或 `v` 预测得到 score 时依赖平方误差最优的条件均值假设。随后回到 EDM 的加性噪声 `x=y+σ_EDM ε`，推导去噪器 `Dθ`、噪声预测与 score 的关系；若对照 VP 记法，明确需要先按 `σ_data` 归一化，不能把两种 `σ` 直接等同。强调 `v` 是网络目标参数化，不是 PF-ODE 或 Flow Matching 的速度场；后续章节引用本章公式，不重复推导。
- **素材来源**：`raw/ddpm-training-sampling/sources/ddpm-training-sampling.pdf` §2–3；`raw/score-sde-continuous-diffusion/sources/salimans-ho-2022-progressive-distillation.pdf` Appendix D，Eqs. 26–31；`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §3.2；`raw/edm-2022/source-tar/paper.tex` §2，`eq:score`、`eq:scoredenoiser`；`raw/edm-2022/source-tar/supplemental-body.tex` Appendix §Score matching，`eq:idealdenoiser`，lines 198–234。
- **必备元素**：统一符号表；`[x_t,v_t]` 与 `[x₀,ε]` 的矩阵正逆变换；`x₀`/`ε`/`v`/score 互换表；各公式成立的 VP、加性高斯噪声和最优 MSE 假设；EDM 与归一化 VP 噪声尺度的换算提示；一张 σ 增大时的带噪图和理想去噪输出图。不得将条件均值误说成逐样本找回原图，也不得把 v-target 与连续 ODE 速度混为一谈。

#### 3 EDM 的模型输出与网络预条件
- **写什么**：解释 EDM 选择去噪器 `Dθ(x;σ)` 作为共同网络接口，以及主网络 `Fθ` 如何通过 `c_in`、`c_skip`、`c_out`、`c_noise` 组合成去噪预测。推导预条件系数与 `σ_data` 的关系，说明这些系数改变网络的数值参数化，不改变上一章变量之间的概率关系；`Dθ` 是 EDM 论文的输出对象，不能称为 v-prediction。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §5，`eq:preconditioning`，lines 369–410；`raw/edm-2022/source-tar/figures.tex` Table 1 `tab:specifics`；`raw/edm-2022/source-tar/supplemental-body.tex` Appendix §Our preconditioning and training，lines 421–523。
- **必备元素**：`c_in/c_skip/c_out/c_noise` 的系数表；从单位输入方差、线性 skip 估计和残差尺度解释推导约束；标注 `σ_data=0.5` 是论文图像配置。

#### 4 EDM 的训练：噪声分布、损失与数据增强
- **写什么**：说明训练时从 `y`、`ε` 和 `σ` 构造 `x=y+σε`，优化加权去噪 MSE；推导 `λ(σ)` 如何抵消输出残差尺度，并解释对数正态 `p_train(σ)` 决定训练中各噪声级出现频率。单独标出可选的非泄漏数据增强，避免把它说成 EDM 定义的一部分。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §5，`eq:precloss`、lines 411–440；`raw/edm-2022/source-tar/figures.tex` Table 1；`raw/edm-2022/source-tar/data/TrainingTable.tex`；`raw/edm-2022/analysis/methodology.md` §Network preconditioning and training。
- **必备元素**：训练目标、噪声抽样分布及 loss weighting；`P_mean=-1.2`、`P_std=1.2` 标成论文图像配置；训练噪声分布与推理噪声 schedule 的区别。

#### 5 推理配置：噪声日程、初始状态与 NFE
- **写什么**：解释推理从高噪声状态 `x(σ_max)=σ_max ε` 开始，沿递减的噪声表到 `σ=0`；给出 EDM 的 `ρ` 日程公式，分别说明 `σ_min`、`σ_max`、`ρ`、步数和 NFE 的含义。明确推理时的 `{σ_i}` 与训练时的 `p_train(σ)` 是两个独立选择。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §3，`eq:discretization`，lines 218–284；`raw/edm-2022/source-tar/figures.tex` Table 1；`raw/edm-2022/analysis/methodology.md` §Deterministic sampler。
- **必备元素**：噪声日程公式、从高噪声到零噪声的时间线、参数表，以及“步数不等于 NFE”的说明。

#### 6 PF-ODE：EDM 确定性采样所沿的连续轨迹
- **写什么**：从前面已建立的去噪器—score 公式代入 probability-flow ODE，得到 EDM 坐标下 `dx/dσ=(x−Dθ(x;σ))/σ`。解释这是确定性连续向量场，采样从大 `σ` 向小 `σ` 积分；与对应 SDE 只在理想条件下匹配各时刻边缘分布，不代表轨迹相同。强调 PF-ODE 定义连续动力学，本身还没有规定用几步、用哪种数值求解器。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §2，`eq:ode`、`eq:odescale`，lines 126–179；`raw/score-sde-continuous-diffusion/sources/song-2021-score-sde.pdf` §3.2；`raw/edm-2022/analysis/methodology.md` §Deterministic sampler。
- **必备元素**：从 score 到 EDM ODE 的短推导（引用第 2 章结果，不重推变量换算）；明确 PF-ODE 与离散 sampler 的层级关系及路径边界。

- **写什么**：在第 6 章给出的同一 PF-ODE 向量场上，令 `d_i=(x_i−Dθ(x_i;σ_i))/σ_i`、`Δσ_i=σ_{i+1}−σ_i`，分别写出 Euler 更新 `x_{i+1}=x_i+Δσ_i d_i` 和 Heun 的预测—校正更新：先得 `x̂_{i+1}=x_i+Δσ_i d_i`，再计算 `d̂_{i+1}=(x̂_{i+1}−Dθ(x̂_{i+1};σ_{i+1}))/σ_{i+1}`，最后令 `x_{i+1}=x_i+Δσ_i(d_i+d̂_{i+1})/2`。比较每步函数评估次数、局部误差和质量/计算权衡。准确解释 EDM Algorithm 1：普通步先 Euler 预测，再在预测点做第二次去噪器评估并校正；最后到 `σ=0` 的一步跳过第二次评估，避免在零噪声处计算含 `1/σ` 的斜率。不要把 Heun 称为新的概率过程，也不要把 PF-ODE 与 Heun 当成同一个概念。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §3，lines 218–284；`raw/edm-2022/source-tar/figures.tex` Algorithm 1 `alg:heun`，lines 264–295；`raw/edm-2022/analysis/experiment.md` §Sampler evaluation。
- **必备元素**：Euler 与 Heun 更新式、两者预测路径示意、NFE 统计；只截原论文 Algorithm 1 的伪代码区域，并逐步解释 predictor/corrector 与末步例外。

#### 8 随机采样：churn 怎样改变确定性轨迹
- **写什么**：按 Algorithm 2 解释先临时提高噪声尺度、注入新的高斯噪声，再调用 Euler/Heun 更新。说明 churn 是叠加在数值求解上的随机步骤，因此加入 churn 后采样轨迹不再是纯 PF-ODE 解；它也不是 DDPM 的反向后验采样。解释过强 churn 会损失细节或造成颜色偏移，效果依模型训练与数据而变。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §4，`eq:sde` 与 lines 289–365；`raw/edm-2022/source-tar/figures.tex` Algorithm 2 `alg:stochastic`，lines 346–377；`raw/edm-2022/analysis/methodology.md` §Optional stochastic churn；`raw/edm-2022/analysis/experiment.md` §Stochastic sampling and interaction with training。
- **必备元素**：只截原论文 Algorithm 2 的伪代码区域；自绘“暂时升噪并注入随机量 → 再沿选定求解器去噪”的图；指出不同训练设置下 churn 的收益方向可能相反。

#### 9 实验与消融：哪些训练和推理选择带来了变化
- **写什么**：先用简化表呈现 VP/VE 基线到超参数调整、容量重分配、预条件、训练 loss/噪声分布和非泄漏增强的累积变化；再分开比较“只替换已有模型采样器”与“用 EDM 训练配置重新训练”。报告 CIFAR-10 32×32 条件/无条件 FID 与 35 NFE，ImageNet-64 sampler-only `2.07→1.55` 与重新训练 `1.36` 分开呈现。用 churn sweep 说明确定性与随机采样优劣会随训练方案和数据集改变，不把 2022 年结果说成当前 SOTA。
- **素材来源**：`raw/edm-2022/source-tar/data/TrainingTable.tex`；`raw/edm-2022/source-tar/figures.tex` Table 2 `tab:TrainingTable` 与 Figure 5 `fig:TrainingPlots`；`raw/edm-2022/source-tar/paper.tex` §§3–5，lines 248–284、356–365、442–468；`raw/edm-2022/analysis/experiment.md`。
- **必备元素**：标明数据集、分辨率、条件设置、FID、NFE 和是否重训的结果表；训练/推理消融表；Figure 5 churn sweep 的 `256 steps (NFE=511)` 口径，不与 CIFAR-10 `35 NFE` 混用。

#### 10 总结：设计空间、适用边界与下一篇
- **写什么**：总结 EDM 将输出参数化、网络预条件、训练分布、推理 schedule、ODE 求解器与随机 churn 拆开比较的价值；指出这些选择仍有交互，论文参数是具体实验配置。连接下一篇 DDIM：两者可能出现确定性少步采样，但 DDIM 的非马尔可夫前向族与 EDM 的设计空间分析是不同层次的问题。
- **素材来源**：`raw/edm-2022/source-tar/paper.tex` §§2–5、Conclusion，lines 472–483；`raw/edm-2022/analysis/methodology.md` §Scope and interpretation limits；`raw/edm-2022/analysis/experiment.md` §Reporting limits；下一篇 DDIM 的 `design.md` 条目及 `raw/ddim-fast-sampling/` 原论文来源。
- **必备元素**：总结变量换算、训练轴和推理轴的关系；EDM / DDIM / Score-SDE 边界表；一段读者可复用的扩散论文阅读框架。

**关键数据点**（均指论文报告值，写作时维持原口径）：

- EDM 的代表性噪声参数为 `σ_min=.002, σ_max=80, σ_data=.5, ρ=7`；训练噪声分布 `lnσ~N(-1.2,1.2²)`。来源：`source-tar/figures.tex` Table 1 `tab:specifics`。
- CIFAR-10 32×32：config f 的条件 VP/VE FID 均为 `1.79`，无条件 VP `1.97`、VE `1.98`；表列 `35 NFE`。来源：`source-tar/data/TrainingTable.tex`、Table 2 `tab:TrainingTable`。
- 预训练 class-conditional ImageNet-64：只替换 sampler 后 FID `2.07→1.55`。来源：`source-tar/paper.tex` §4，lines 356–365。
- 重新训练的 class-conditional ImageNet-64：FID `1.36`，前述 sampler-only 结果另列；论文写明该模型未使用 augmentation。来源：`source-tar/paper.tex` §5，lines 460–468。
- 论文的 churn 曲线使用 `256 steps (NFE=511)`；明确它是单独的随机性分析设置。来源：`source-tar/figures.tex` Figure 5 `fig:TrainingPlots`。

**配图计划**：① EDM 设计轴自绘图；② 论文 Figure 1 去噪示例；③ 正文中的统一变量换算表（公式表，不另做图）；④ PF-ODE 连续轨迹与离散步点示意；⑤ Euler 单斜率与 Heun predictor/corrector 对照图；⑥ 仅含 Algorithm 1、Algorithm 2 伪代码区域的截图；⑦ Figure 5 相关训练/随机采样面板或基于原始数据的摘要图。算法截图不得带整页，图注注明 Karras et al.（2022）原文算法编号；正文不写图像转换过程。

**审阅重点**：变量换算是否在单独章节一次推导完且假设明确；PF-ODE 是否被定位为连续动力学、Euler/Heun 是否被定位为数值求解器、churn 是否被定位为额外随机步骤；网络预条件、训练分布、推理日程和求解器是否分别成章；实验表是否把 sampler-only 与 retraining 分开。


### `conditional-image-diffusion`｜视频生成系列（六）：条件扩散——从 CFG 到潜空间图像生成

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [conditional-image-diffusion.org](../../../drafts/video-generation/conditional-image-diffusion.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `60`；Hub `video-generation-hub` |
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

### `video-generation-tasks-spacetime`｜视频生成系列（七）：视频生成任务与时空建模基础

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-generation-tasks-spacetime.org](../../../drafts/video-generation/video-generation-tasks-spacetime.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `70`；Hub `video-generation-hub` |
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

### `video-diffusion-architectures`｜视频生成系列（八）：视频扩散模型的架构演进

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-diffusion-architectures.org](../../../drafts/video-generation/video-diffusion-architectures.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `80`；Hub `video-generation-hub` |
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

#### 5 视频 Flow Matching 基模
- **写什么**：以核验后的 Wan 原始技术报告为例，说明视频 VAE、条件 DiT 与 Flow Matching 训练/采样如何组合；引用第 5 篇的速度场推导，不重复基础数学。ModelScopeT2V、Show-1、LaVie 作为扩散模型的补充对照，不归为 Flow Matching 模型。
- **素材来源**：Wan 原始技术报告、官方仓库与模型卡；对照模型各自的原论文，收集至 raw sources；Show Lab `Awesome-Video-Diffusion` 仅作发现索引。
- **必备元素**：标注原论文出处的视频 latent 架构图、与第 5 篇对应的训练目标、统一比较表；明确权重/许可证/评测口径差异，不做无依据排名。

**关键数据点**：各阶段分辨率、帧数、训练数据和报告指标须按原论文逐项标注；不得把不同评测口径直接作优劣排名。
**配图计划**：方法时间线、三种代表架构/级联流程图、模型对照表。

### `video-generation-data-evaluation`｜视频生成系列（九）：训练数据、评测基准与评价指标

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [video-generation-data-evaluation.org](../../../drafts/video-generation/video-generation-data-evaluation.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `90`；Hub `video-generation-hub` |
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

### `long-video-temporal-consistency`｜视频生成系列（十）：时间一致性、长视频与流式生成

| 栏位 | 内容 |
|------|------|
| 原始草稿 | [long-video-temporal-consistency.org](../../../drafts/video-generation/long-video-temporal-consistency.org)；现为占位草稿；不能作为后续新增或重写大纲的实质依据 |
| 类型与目标位置 | 系列章节；alias `categories/AI/视频生成`；sub_id `100`；Hub `video-generation-hub` |
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
- 系列共 10 篇正文；第 1–4 篇为 DDPM、Score/DSM/SDE、EDM、DDIM；第 5 篇 Flow Matching、第 6 篇条件图像扩散、第 7 篇视频任务、第 8 篇架构、第 9 篇评测、第 10 篇长视频。Flow Matching 复用旧页面并保留旧 URL/分类入口，避免另写重复入门篇。
- 在 `categories/AI` 下新建独立二级 subcategory `categories/AI/视频生成`。视频生成会涵盖扩散、Flow Matching、自回归和其他范式，不应嵌套在 `categories/AI/扩散模型` 下。Hub aliases 使用 `视频生成系列`、该路径及其 `/index` 形式；若缺失则在 `data/category-names.json` 增加 `视频生成: video-generation` 映射。
- Hub 使用 `sub_id: 0`，正文按 10–100 排序。前五篇依次为 DDPM（10）、Score/DSM/SDE（20）、DDIM（30）、Flow Matching（40）、EDM（50）；EDM 作为前述方法的总结与设计空间分析，条件图像及视频章节为 60–100。Flow Matching 只归入 `categories/AI/视频生成`，不额外建立或保留扩散模型分类入口；实施前检查同级排序冲突。元数据与导航变更在合并大纲获批后实施。
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
- [系列编号变化影响已有页面导航] → 合并大纲获批后更新 DDIM → Flow Matching → 条件图像扩散的直接导航，后续章节顺延；保留旧 URL、分类与标题检索别名，每完成一篇即交用户审阅。
- [Score/SDE 与 EDM 内容重复] → 从 Score/SDE 文章移除现有 EDM 信息框、相关正文和论文引用，不添加 EDM 预告；相邻关系由系列导航呈现，EDM 内容集中在独立篇章。
- [原论文配置容易被误读为通用默认值] → 所有 `ρ`、噪声上下界、`σ_data`、训练噪声分布、FID 与 NFE 均标为论文实验配置，保留数据集和条件设置。
