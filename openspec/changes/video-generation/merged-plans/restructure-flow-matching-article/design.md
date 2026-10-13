> **规划已合并（2026-10-13）**：原 `restructure-flow-matching-article` 已并入 `video-generation`，本目录仅保留历史规划。实施与验收以 `../../proposal.md`、`../../design.md`、`../../tasks.md` 为准；本文旧的保持标题、无 sub_id、无 Hub 等边界已由系列整合方案替代。原文重写仍未完成，旧任务复选框不代表合并后的进度。

## Context

See `proposal.md` for the motivation. The existing page is a collection of notes rather than a linear tutorial: it repeats Normalizing Flow, Flow Matching, ODE/SDE, vector-field and score definitions; the manifold section contains a long unrelated implementation example; later headings for guidance and large-scale/discrete models are empty. The available source material for this change is the current page itself plus its two external learning links; it has no `raw/flow-matching/` source archive. Therefore, all claims and equations retained in the rewrite must be checked against primary sources during implementation, and unsupported material must be omitted rather than inferred from the notes.

## Goals / Non-Goals

**Goals:**
- Give one coherent learning path from a probability path to a learned vector field and ODE sampling.
- Keep the tutorial focused on what a reader needs to understand the basic Flow Matching objective and its relationship to diffusion.
- Preserve the existing article identity and make every retained equation's variables and time direction explicit.

**Non-Goals:**
- Turn the article into a survey of all diffusion samplers, score-based SDEs, guidance methods, or discrete diffusion.
- Present unverified benchmark claims or reproduce the unrelated manifold-learning code.
- Add a series Hub or change the category ordering.

## 核心问题与解法速览

- **问题是什么？** 当前页混合了重复定义和多条旁支，读者无法判断 Flow Matching 的训练对象、ODE 生成过程与扩散模型之间的关系。依据：`src/pages/flow-matching.html` 的“前置知识”“流形假设”“流匹配”“Flow and Diffusion Models”“Flow Matching”“Score Functions and Score Matching”等分散章节。
- **作者的解决办法是什么？** 本次不是论文方案复述，而是编辑性重整：以“构造概率路径 → 得到目标速度场 → 用条件目标训练边际向量场 → 积分 ODE 采样”为正文唯一主线。
- **核心思想（几句话）**：教学主线拟解释为：先定义从简单噪声分布到数据分布的连续概率路径，再训练神经网络预测该路径上的速度场；生成时从噪声出发积分学到的 ODE。此处是文章组织方案，数学表述须在写作时对照 Lipman et al., *Flow Matching for Generative Modeling* (ICLR 2023), §§2–3 核对。
- **具体机制（几句话）**：用条件概率路径构造易采样的训练样本与条件速度监督，利用条件流匹配目标训练可用于边际生成的向量场；推理时从先验样本出发数值求解 ODE。条件路径、目标速度公式及条件目标与边际目标关系均须按 Lipman et al. §§2–3 核对，不沿用旧页未标来源的公式。

## 文章内容大纲

### `flow-matching`｜An introduction to Flow Matching and Diffusion Models

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 既有入门文章；alias `categories/AI/扩散模型`；保留现有排序（页面没有声明 `sub_id`，本次不分配）；Hub：— |
| 服务对象 | 已了解概率分布和神经网络基础、但不清楚 Flow Matching 如何训练并生成样本的读者。 |

**章节骨架**

#### 1 从生成问题到连续运输
- **写什么**：用“从易采样的噪声生成数据”定义任务；先给全篇路线图，再用 ODE 说明连续状态如何随时间变化。只保留后文必需的概念，不展开 Normalizing Flow 的雅可比似然推导。
- **素材来源**：`src/pages/flow-matching.html` 的“Flow and Diffusion Models”→“Ordinary Differential Equation(ODE)”与“Flow Model”；检查当前页开头“归一化流”两段重复内容，作为删并素材。
- **必备元素**：一张噪声分布到数据分布的路径示意图；ODE 公式 `dx_t/dt = v_t(x_t,t)`，定义状态、时间、向量场及端点。

#### 2 概率路径：规定中间状态如何变化
- **写什么**：定义边缘概率路径与条件概率路径；以高斯条件路径解释从噪声到单个数据样本的连续变化，并指出训练时可采样条件路径上的状态。先解释直觉，再给符号。
- **素材来源**：`src/pages/flow-matching.html` 的第二个“Flow Matching”→“Probability Path”→“Gaussian Probability Path”与“Marginal Prob Path”；旧公式需按 Lipman et al., *Flow Matching for Generative Modeling*, §§2.1–2.2 核验，正文引用及可追溯副本需在实施时放入 `raw/flow-matching/sources/`。
- **必备元素**：一张条件路径与边缘路径的关系图；条件高斯路径公式；列出端点约束及其适用的 schedule 假设。

#### 3 向量场：决定路径上的运动方向
- **写什么**：区分轨迹、向量场和由向量场诱导的流；解释连续性方程说明向量场如何推动概率密度变化。避免把连续性方程误写为训练时必须直接求解的对象。
- **素材来源**：`src/pages/flow-matching.html` 的“Flow and Diffusion Models”→“Flow”及第二个“Flow Matching”→“Vector Field”→“Conditional Vector Field”“Marginal Vector Field”“Continuity Equation”；核验依据为 Lipman et al. §§2.1–2.2，实施时归档于 `raw/flow-matching/sources/`。
- **必备元素**：一个变量关系图（条件向量场、边际向量场、概率路径）；连续性方程，仅在解释边际路径时引入。

#### 4 条件流匹配：如何构造可训练的目标
- **写什么**：说明直接监督边际速度场的困难，以及条件流匹配如何用可采样的条件路径和其速度场构成回归目标；按一次训练样本的生成顺序解释数据端点、时间、插值状态和目标速度。明确条件化是构造监督的工具，不代表推理时必须知道目标数据样本。
- **素材来源**：`src/pages/flow-matching.html` 的首个“流匹配”→“训练目标”“条件流匹配”及第二个“Flow Matching”→“训练 Flow Matching”；主要核验 Lipman et al. §§2–3。旧页 Python 示例（“实现示例”）需先核查代码对应的路径和速度目标，无法核实时删去或重写为短伪代码。
- **必备元素**：条件流匹配均方误差目标；训练样本构造流程；用 2D 玩具例子展示真实目标速度与模型预测。

#### 5 从噪声到样本：ODE 采样
- **写什么**：把训练出的时间依赖向量场作为 ODE 右端，从噪声初值积分至终点；解释 Euler 法只是一种数值求解器，步数、误差和计算量存在权衡，不把模型步数与求解器步数混为一谈。
- **素材来源**：`src/pages/flow-matching.html` 的“Flow and Diffusion Models”→“使用欧拉法模拟 ODE”“Flow Model”及“流匹配”→“实现示例”；实现示例中的采样代码需与 Lipman et al. §3 的定义逐项复核。
- **必备元素**：采样伪代码或 2D 轨迹图；Euler 更新公式；训练阶段与推理阶段对照表。

#### 6 与扩散模型的关系及方法边界
- **写什么**：说明二者都可用连续概率路径描述生成，但参数化目标、路径选择和随机/确定性采样形式需按具体定义区分；介绍 Rectified Flow 作为相关路线，并说明它与一般 Flow Matching 的关系。EDM 只作链接或极短注释，不混作同义词。
- **素材来源**：`src/pages/flow-matching.html` 中“Diffusion Models”“SDE 与 ODE”“SDE Extension Trick”及开头的 Rectified Flow 相关链接；这些扩展内容当前缺乏可靠本地出处，实施时仅在取得可核验的一手来源并收录至 `raw/flow-matching/sources/` 后保留。对照 `src/pages/network-flow-matching.html`，避免与专门主题页面重复。
- **必备元素**：Flow Matching、扩散概率流 ODE 和 Rectified Flow 的简明比较表；注明比较针对所选具体定义，不做“完全等价”一概而论。

#### 7 总结与延伸阅读
- **写什么**：用一段话回扣路径、速度场、训练和采样四步；提供经修复的站内链接及 2–4 条可追溯一手资料。移除空的 Guidance、Building Large-Scale Image or Video Generators、Discrete Diffusion Models 标题。
- **素材来源**：本页“相关内容”现有链接（EDM、扩散模型、Rectified Flow 为空 href，需通过站内搜索确认真实目标）；主参考 Lipman et al. 2023；`src/pages/network-flow-matching.html`。
- **必备元素**：小型术语表或概念流程图；所有站内链接均有有效目标。

**关键数据点**（本篇是概念教程，不设置实验结果或 benchmark 数值）

- 时间区间与端点记号按选定的原始论文约定统一；若用 `[0,1]`，须明确该区间是归一化时间参数，不是模型质量数据。
- 高斯路径均值、方差及端点退化条件只在与所选 schedule 假设一致时出现；逐项对照 Lipman et al. §§2.1–2.2。
- 不保留当前页 Terminal Velocity Matching 摘要中的 FID/NFE 数值；该内容与入门主线无关且其论文来源需独立核验。

**配图计划**：2 张原创示意图，分别表现噪声到数据的概率路径（第 2 节）和二维向量场/ODE 采样轨迹（第 3–5 节）；图中符号与正文一致，目标路径 `media/images/flow-matching/probability-path.svg`、`media/images/flow-matching/vector-field-trajectory.svg`。若现有配图可准确表达则复用，否则按站点视觉规范绘制。

## Decisions

- **单篇概念教程，不改成论文精读**：用户要求整顿现有文章；保留现有标题、slug 和分类入口，优先清理结构，不额外拆文。替代方案是拆成 Flow Matching 与扩散数学两篇，但会扩大范围并要求新增页面及 Hub。
- **把训练目标作为文章中心**：从概率路径到目标向量场再到 ODE 采样，直接回答“训练什么、怎么生成”。替代方案是从 Normalizing Flow / manifold theory 开始逐项铺垫；现页已显示这会形成冗长重复的前置内容。
- **优先保留可验证的核心内容**：首要依据选 Lipman et al. (ICLR 2023) 原文 §§2–3；边界比较只在能用一手材料核实时写入。若未能取得原文副本或核实特定等价关系，则缩短或删去该段，不根据旧笔记猜补。
- **不分配新的 `sub_id`**：当前页面无该字段，本次不改变现有顺序。`python3 scripts/check-sub-id.py --category '扩散模型' --suggest` 给出的下一个可用值是 `10`，但本次不占用。

## Risks / Trade-offs

- [公式沿用笔记时可能存在符号或方向错误] → 逐条对照原始论文，并在文章中统一 `x_0` / `x_1` 端点及时间方向；无法核实的公式不发布。
- [过度压缩会让读者缺少必要背景] → 保留最少的 ODE、路径与向量场解释，并用图和一个具体例子衔接训练目标。
- [和扩散模型文章或 network-flow-matching 页面重复] → 扩散背景只服务于比较，应用进展、论文实验和深入 SDE 讨论留在对应专题。
- [正文公式能写但 MathJax 不兼容] → 复用站点已支持的行间公式形式，构建前检查页面渲染。
