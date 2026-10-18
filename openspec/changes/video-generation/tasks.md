## 1. 计划与素材

- [x] 1.1 盘点 Roam 笔记、CVPR 2024 教程 PDF 与现有博客材料；不依赖已删除的 `drafts/video-generation.org`。
- [ ] 1.2 完成剩余视频章节的原论文、官方项目页、模型卡或数据集卡收集；记录版本、章节/页码、公式和数据口径，缺失时登记替代来源。基础篇、Score/SDE、EDM 和 DDIM 的主要来源已归档。
- [x] 1.3 阅读 CVPR 2024 教程 Part 1、Part 2 目录及相关章节，记录任务地图、架构、视频编辑和评测素材页码；未找到可确认的 MIT 扩散课程笔记，不作该课程引用。
- [x] 1.4 在 `categories/AI` 下登记 `categories/AI/视频生成` subcategory；检查 `data/category-names.json`，补充 `视频生成: video-generation` 映射（若缺失），并在分类组织文档登记本系列。
- [x] 1.5 原系列已为 Hub 分配 `sub_id: 0`，并核验过基础篇和 Score/SDE 篇的 `10`、`20`。
- [x] 1.6 为基础篇与 Score/SDE 篇归档并核读 DDPM、Sohl-Dickstein 非平衡热力学、GAN/WGAN、Hyvärinen score matching、Vincent DSM、Song & Ermon NCSN、Anderson 反向时间扩散、Song et al. 连续时间 SDE、Karras et al. EDM、Lipman et al. Flow Matching 与 Salimans–Ho v-parameterization 原始来源；记录章节/公式/图表定位及适用边界。
- [x] 1.7 按 Read Article 方法拆解 EDM 原论文：完成 `raw/edm-2022/analysis/methodology.md`、`experiment.md`、`terminology.md`、`image-collection.md` 和 `synthesis.md`，把算法截图定位到原论文 Algorithm 1/2。
- [x] 1.8 **审批门禁**：用户于 2026-10-13 调用 `/openspec-apply-change` 启动本 change 实施；按该明确指令确认当前 `design.md` 的 EDM 章节大纲及系列编号调整。
- [x] 1.9 用户确认后，运行 `~/.venv/bin/python3 scripts/check-sub-id.py --category AI --suggest`；确认现有视频生成系列占用 `10`、`20`、`30`、`40`，规划新增 EDM `30` 并将 DDIM/条件扩散顺延至 `40`/`50`，无冲突。

- [x] 1.10 合并 `restructure-flow-matching-article` 的提案、大纲、14 项任务与验收要求；旧规划文件移入本 change 的 `merged-plans/` 作为历史记录，执行以当前 proposal/design/tasks 为准，未完成写作不标为完成。
- [x] 1.11 Flow Matching 一手素材：Lipman、Rectified Flow 与 Wan 原文已归档并核对路径/速度/损失/采样方法及图表定位；详见各自 `raw/` 提取日志与 `raw/flow-matching/analysis/representative-papers.md`。
- [x] 1.12 **Flow Matching 审批门禁**：用户逐章审阅确认九章草稿，并于 2026-10-14 授权开始正文；已先将 Design 同步为九章写作计划，保留系列第四篇与 `sub_id: 40`。
- [x] 1.13 核验 Flow Matching 使用视频生成分类 alias、保留旧标题检索 alias 与 `sub_id: 50`，并更新分类规则和页面清单。
- [x] 1.14 修正构建器只采用首条分类 alias 的行为；所有非 `/index` 分类路径进入分类页、搜索索引、文章元信息、TOC 与分类短代码筛选，旧的 `categoryPath` 字段保留为首路径兼容。

## 2. 逐篇页面撰写

- [x] 2.1 `diffusion-model-basics`：按修订大纲补足流形假设与支撑集错位、布朗运动/墨滴扩散直觉及其与图像高斯马尔可夫链的边界；基于 Ho et al. Algorithms 1–2 写训练与采样伪代码，插入 Figures 2、6、8；解释学习到的反向转移、随机性、已知噪声标签及 score 向量场。
- [x] 2.2 `score-sde-continuous-diffusion`：依据已确认草稿重组正文：先补数学基础，再讲 Score、DSM/Tweedie、NCSN/退火 Langevin、连续 VP/VE SDE、Fokker–Planck、反向 SDE/PF-ODE 与 Flow Matching/v-prediction 边界；插入 Song 2021 Figures 1/2/3/5 与 Song & Ermon Algorithm 1 局部截图/Figure 3；单页 lint、引用/图片检查和全站构建通过，本地预览返回 200，交用户审阅。
- [x] 2.3 `edm-design-space`：按用户确认的 10 章大纲重组 EDM 篇；集中推导 `x₀`、`x_t`、`ε`、`v`、score 与 EDM 去噪器的通用换算，再分别讲网络参数化、训练、推理配置、PF-ODE、Euler/Heun 求解器、churn 和实验。区分 PF-ODE 连续向量场、Euler/Heun 数值求解和 churn 随机注入。保留原论文 Algorithm 1/2 的局部截图，分开呈现 sampler-only 与 retraining 结果；已完成 lint、构建并更新本地预览，交用户逐篇审阅后再开始下一篇。
- [x] 2.4 `ddim-fast-sampling`：按用户以“执行”确认的七节 Design 重写 DDIM；推导方差约束、边缘一致性、跨步转移、网络估计与实际采样循环，验证与后验方差 DDPM 的均值/方差等价条件；插入 10 个编号图示（其中 2 张 Mermaid）、原文 Eq. (12) 局部截图和 3 张对照/结果表，完成单页 lint、构建与浏览器检查。当前编号/sub_id 为 4/40；完成后交用户审阅。
- [ ] 2.5 `flow-matching`：依用户逐章确认的九章草稿重写既有页面；完整呈现 CNF/Score 前史、流与连续性方程、条件速度/边际场/CFM 推导、预测量换算、Rectified Flow/reflow、Euler/Heun 与少步误差；以核实的 Wan 训练目标作简短视频示例，更新原图与图表。完成后单篇 lint、构建并交用户审阅。
- [x] 2.6 **历史版本完成记录，不代表最新重写完成**：`conditional-image-diffusion`：撰写 classifier guidance/CFG、CLIP/DALL·E 2 与潜空间扩散；将 ControlNet、DreamBooth、LoRA 控制在桥接案例范围；EDM 插入后需更新编号与 sub_id。
- [ ] 2.7 `video-generation-tasks-spacetime`：撰写视频任务地图、时空表示、3D convolution 和 R(2+1)D，并明确动作识别与生成的任务差别。
- [ ] 2.8 `video-diffusion-architectures`：基于原论文撰写 Imagen Video、Video Diffusion Models、Make-A-Video 与有限开源模型案例。
- [ ] 2.9 `video-generation-data-evaluation`：核验并撰写训练数据、评测基准、指标及比较口径，区分数据集与评测集。
- [ ] 2.10 `long-video-temporal-consistency`：撰写时间一致性、identity shift、attention sink、memory、长程依赖、自回归/流式生成及 Custom Forcing 案例。
- [ ] 2.11 `video-generation-hub`：按 `html-blog` skill 使用 Hub 模板，提供 12 篇阅读路线、目录、资源入口和分类图谱。

## 3. 系列统一与 Review

- [ ] 3.1 按最新篇序统一 12 篇的标题、分类、导航和编号：DDPM 10、Score 20、DDIM 30、Flow Matching 40、x-prediction 50、EDM 60，条件扩散 70、图像基模 80、视频任务 90、视频架构 100、数据评测 110、长视频 120；本轮仅更新规划，实施时核验实际占用。
- [ ] 3.2 每篇完成后单独做保真度检查：回查该篇原文，核对推导、时间方向、参数化、数字、实验设置、许可与引用；EDM 的 FID/NFE 必须保留各自口径。
- [ ] 3.3 每篇完成后检查结构和内容：对照该篇已批准大纲，核对先修顺序、章节边界、跨篇重复、来源完整性、图表说明和术语解释；完成一篇即停下交用户审阅。
- [ ] 3.4 按 `blog-syntax`、`blog-categories`、`blog-aliases` 规范检查 HTML、frontmatter、引用 key、`.sources` 的 `data-cite-key`、MathJax、图片、Hub 组件、移动端布局及导航。
- [ ] 3.5 按 Review 结果修复 P0/P1 问题；确保正文每项可核实事实有引用，正文与 `.sources` 引用一一对应。

- [ ] 3.6 Flow Matching 数学与读者验收：逐式回查 Lipman/Rectified Flow 原文，验证条件均值、连续性方程、损失平方展开/交叉项及 score 换算的假设、方向与端点；检查一个手算例子和“为何训练标签已知、为何推理不需目标 y”的讲解；视频应用回查原始报告，清除未核实的 benchmark/等价断言。
- [ ] 3.7 Flow Matching 图与结构验收：按 Design 核对每张图的标题、位置、来源、原文裁切范围和图后解释；区分条件路径与学习轨迹、论文原图与作者整理 Mermaid，检查 SVG/栅格图上下标、MathJax、窄屏排版、重复章节、空标题与无效链接。
- [x] 3.8 统一已完成章节标题为“视频生成系列（中文序号）：……”，并将条件扩散篇修正为第六篇（`sub_id: 60`）；同步文章清单与章节设计标题。

## 4. 发布与构建

- [x] 4.1 用户确认 EDM Design 后，将 `edm-design-space` 页面与配图写入 `src/pages/`、`media/images/`；移除 Score/SDE 的 EDM 信息框、相关正文和来源引用，并同步必要的直接前后篇链接和系列元数据。
- [x] 4.2 每个新建或修改的页面运行 `node lib/lint-html.js src/pages/<slug>.html`；确认引用、MathJax、标题组件和图片规则无错误。
- [x] 4.3 EDM 页面完成后运行 `node build.js`（内含自动测试门禁），检查生成页面、分类索引与本地预览；构建成功后用 `npm run serve` 提供可审阅 URL。用户审阅通过前不继续写下一篇。
- [ ] 4.4 后续每完成一篇都构建并更新本地预览；对全系列发布时确认页面、Hub、分类 alias 与前后篇链接完整，再运行 `git diff --check` 审阅差异。
- [ ] 4.5 确认各篇关键数值有原始口径、图片来源/许可已核查；不在不同设置间作无依据的性能排名。

- [ ] 4.6 Flow Matching 单篇发布：保持 `flow-matching.html` URL，按批准的大纲修改标题/检索 alias、视频生成分类入口和系列排序；单页 lint、必要自动化检查、构建及浏览器验收最新预览，记录公式/图示与页面检查结果；完成本篇即交用户审阅，再继续下一篇。

## 5. Hub 与交叉回链

- [ ] 5.1 在 Hub 中维护完整系列目录、推荐阅读路径、资源入口和主题卡片；确认 `sortable-list`、`post-graph` 仅过滤本系列分类。
- [ ] 5.2 为每篇正文添加上一章、Hub、下一章导航，并检查首尾章节链接。
- [x] 5.3 运行 `~/.venv/bin/python3 scripts/cross-link.py` 或按其报告补全正文与 `.sources` 交叉回链，再重新构建验证。

- [x] 5.4 将 Flow Matching 作为第 5 篇加入 Hub 目录和先修路线；核对 `network-flow-matching`、EDM、Score/SDE、DDIM 与视频基模的站内链接，兼容旧入口，按适用的引用结构补交叉回链。

## 6. 草稿状态回填

本组记录上一轮实施与本次草稿对齐后的状态；新的 DDPM 草稿已在 `drafts/video-generation/diffusion-model-basics.org` 创建并经用户确认结构。

- [x] 6.1 草稿处置：保留已删除旧文件 `drafts/video-generation.org` 的历史记录；本轮新增 `drafts/video-generation/` 系列草稿目录，DDPM 草稿作为首篇内容素材。

- [x] 6.2 Flow Matching 实施前核查并读取 `drafts/video-generation/flow-matching.org`；该草稿经用户逐章审阅通过，Design 已逐章指向该草稿，正文持续对照其推导与图示。

## 7. 基础篇草稿与设计更新（2026-10-14）

- [x] 7.1 核对既有 EDM/Score Matching 重整需求，保留 EDM 综合回顾与 Score Matching 教学推导要求供系列规划后续处理。
- [ ] 7.2 确认此前提出的第四篇“DDIM”是否指 Flow Matching；在系列顺序决策前不重排其他章节。
- [x] 7.3 创建并完善 `drafts/video-generation/diffusion-model-basics.org`：用户提供流形/MNIST、扩散直觉及核心内容要求，逐步共写并认可当前结构。
- [x] 7.4 根据获用户认可的首篇草稿更新 proposal/design/tasks；明确流形直觉、概率路径、变分 KL 到噪声 MSE 推导、采样术语、局限与后续路线，并保留原论文图 4/图 5 和末尾参考来源要求。
- [x] 7.5 按更新后的首篇 Design 同步已发布 `diffusion-model-basics.html`，保留图 4/图 5及其他既有原图；完成后构建本地预览并交用户审阅，按一篇一审流程停止。正文已按五章重组，补全流形/概率路径直觉、KL 到噪声损失推导、反向采样与局限；保留原文算法图、Figure 6 和相关原图。单页 lint、全站构建通过，引用键与图片路径核对通过，`http://localhost:4000/diffusion-model-basics.html` 返回 200；浏览器截图检查因环境缺少 Chrome 未能运行。
- [ ] 7.6 在进一步改变 Score/DSM、DDIM、Flow Matching 与 EDM 的总顺序前，先依用户明确的序列决策更新相关 Design、proposal 表格与导航任务。
- [x] 7.7 按用户要求更新共享写作规则与相关 Skill：Design 逐篇链接原始草稿并注明审阅状态，正文逐章参考草稿，审校同时核对草稿与 Design；当前 11 篇设计已补草稿链接，第二篇共写中的草稿与待同步的旧骨架状态已注明。

## 8. DDIM 草稿同步与发布（2026-10-14）

- [x] 8.1 用户确认共写草稿并授权更新 OpenSpec 与发布 DDIM；Design 链接草稿并记录训练/采样区别及跨步对照要求。
- [x] 8.2 同步正文开头、边际解释与跨步后验推导，保留原论文图、公式截图与 Mermaid，核对草稿覆盖。
- [x] 8.3 完成单页语法检查、构建与本地预览检查，回填草稿发布状态；不推进下一篇。

## 9. DDIM 反演补充（用户已确认大纲）

- [x] 9.1 记录已确认的六节反演大纲、原文定位、图示与草稿对应关系。
- [x] 9.2 同步草稿和正文：定义、作用、ODE 联系、近似反演推导、原文 Table 2、编辑流程与局限。
- [x] 9.3 单页语法检查通过、全站构建完成；本地页面与原表图片返回 HTTP 200，展示公式无段落标签污染，交用户审阅。全站另有 66 篇既有文章的 lint 错误。

## 10. 系列顺序同步

- [x] 10.1 统一正文与草稿编号、Design 和分类清单：DDPM → Score/DSM/SDE → DDIM → Flow Matching → EDM。
- [x] 10.2 同步前后篇导航，EDM 为第五篇、sub_id 50。
- [x] 10.3 全站构建完成，更新系列排序与页面导航。

## 5. x-prediction 插入与研究（2026-10-15）

- [x] 5.1 用户指定 x-prediction 位于 Flow Matching 后、EDM 前；同步 proposal、design 的系列顺序，保留既有完成记录作为历史记录，不据此声称新排序已发布。
- [x] 5.2 JiT 原文提取已完成；知乎、周弈帆两篇博客和 Liang Tongtong 博客已保存供核对。
- [x] 5.3 按用户顺序阅读：JiT → 周弈帆 JiT → DiP、DeCo、PixelDiT 原文及博客 → Liang Tongtong；核对数学、对照实验、限制与配图来源。
- [x] 5.4 用户形成实质草稿后，依据草稿整理 x-prediction 文章大纲、推导及逐图位置，并交用户审阅；七章实质草稿已逐章通过，用户已授权正文写作；章节、推导、23 张图及来源映射已同步 design。
- [x] 5.5 获批后写作 x-prediction 正文，同步 EDM 及后续页面编号和导航，构建并提供单篇预览。

- 5.5 验收记录：正文 7 章、23 张配图、8 张文字表格、49 处独立公式、9 项公开来源；相关四页 HTML lint 通过、分类 10–70 无冲突、OpenSpec strict 校验通过、站点构建成功。本地预览 `/x-prediction.html`；全站另有 66 篇既有 arXiv 日报 lint 告警，与本次四页无关。

## 12. EDM 九章草稿转正文（2026-10-15）

- [x] 12.1 九章草稿全部通过审阅；Design 链接原始草稿并同步九章结构、推导、图片位置与来源。
- [x] 12.2 按草稿重写 EDM 正文，保留统一路径、预测与训练推导、预条件、ODE/SDE、Heun/churn、实验边界及系列导航。
- [x] 12.3 完成单页结构/引用/图片核对、全站构建与本地预览，回填草稿状态。正文九章，114 个独立公式、14 张表、12 处原图、1 张 Mermaid、8 项来源；浏览器确认 437 个公式渲染结果无 MathJax 错误，图片无加载失败，Mermaid 双主题 SVG 已生成，公式容器无横向溢出。本地页面和图片 HTTP 200。全站另有 66 篇既有 arXiv 日报的 lint 问题。

## 13. 图像基模与条件扩散的最新分工（2026-10-15）

本节和最新 Design 为当前实施依据；前文已勾选的旧编号与旧范围保留为历史记录，不代表新范围完成。

- [x] 13.1 同步 proposal、Design 与 tasks：新增图像基模篇，规划 12 篇；记录草稿来源、审阅状态、逐章公式与图片职责。
- [x] 13.2 审阅两篇最新章节骨架；条件扩散十章及 prior 增补均已审阅通过并获正文授权；图像基模十章草稿及扩充已审阅，并获正文授权。
- [x] 13.3 按 read-article 整理 VAE、RAE、FLUX、Qwen-Image、Kontext、ACE/ACE++ 等需要的新一手资料；复用 LDM、JiT 现有归档，核对版本及原图定位。
- [x] 13.4 按已批准草稿逐章写图像基模：像素成本、VAE、U-Net、LDM/Stable Diffusion、DiT、RAE/JiT、完整生成与编辑基模；避免重复第五篇预测目标推导。
- [x] 13.5 补齐 IP-Adapter、T2I-Adapter 与四种编辑方法原文提取，核验内部候选图来源；原图不足时再请用户协助截图。
- [x] 13.6 按审阅后草稿重写条件扩散；完整 Stable Diffusion 内容交由图像基模，只保留条件模块所需接口；补 CFG、GLIGEN、ControlNet、IP-Adapter、DreamBooth、LoRA 与编辑路线推导。
- [x] 13.7 每篇草稿与 Design 获批后分别生成正文、构建并检查预览，完成一篇即交用户审阅。
- [ ] 13.8 实施前核验规划编号 70–120，统一标题、Hub、前后篇导航与分类；本轮不修改现有页面编号。

- [x] 13.9 整理 U-Net 与 DiT 原文及原图；复用 DDPM/LDM，核验扩散 U-Net 的改造、DiT 条件模块与规模实验。按草稿及 Design 写两个主干章节，并区分表示空间、主干、预测目标与采样器。

- [x] 13.10 按用户授权完成条件扩散草稿第二章：CLIP 对比学习推导、全局/序列特征、cross-attention、guidance 接口区分与 unCLIP；复用已整理原文，插入两张原图和一张 Mermaid。第二章已获用户审阅通过。

- [x] 13.11 完成条件扩散第三章 CFG 草稿，加入推导、训练与推理、权重约定、局部向量图及两张论文原图；等待审阅，不继续下一章。独立图像编辑草稿不计入本 change。

- [x] 13.12 按用户问题回读 DALL·E 2 §2.2/§4.1 并补充第二章 prior：训练标签、网络输入、表征扩散、图像解码与替代路线消融；增补部分待审阅。

- [x] 13.13 第三章及 prior 增补获用户审阅通过后，完成第四章 GLIGEN 草稿；核对原文正文/附录，插入 Figures 2/3/7/6，补 token 构造、门控/初始化梯度、训练目标与采样日程；第四章待审阅。

- [x] 13.14 第四章审阅通过后完成第五章 ControlNet 草稿，核对原文及四张结构/组合图；T2I-Adapter 已运行 fetch-arxiv-paper.py，归档 PDF/源码/HTML 与图片，核对方法与计算差异。第五章待审阅。

- [x] 13.15 第五章通过后完成第六章 IP-Adapter 草稿；新原文运行 fetch-arxiv-paper.py，归档源码/PDF/HTML/图像；加入共享 Q、独立 K/V、双 softmax、训练推理及三张原图。第六章待审阅。

- [x] 13.16 第六章通过后完成第七章 DreamBooth 草稿；核对原文 §3/§4 与附录，加入主体/先验保持损失、类别回放与参数化换算；插入 Figures 3/19/6。第七章待审阅。

- [x] 13.17 第七章通过后完成第八章 LoRA 草稿；复用原文，补矩阵形状、参数量、零初始化梯度、主体任务组合、合并与多增量公式；原文 Figure 1 与 Mermaid 已插入。第八章待审阅。

- [x] 13.18 第八章通过后完成第九章编辑接口草稿；四篇原论文完成脚本提取、方法回查与四张原图插入，补掩码同噪声级混合、cross-/mutual attention 和指令模型/双条件 CFG；第九章待审阅。独立编辑任务的分类和范围不变。

- [x] 13.19 第九章通过后完成第十章「组合与边界」草稿：统一方法表、联合条件推导、组合流程 Mermaid、局限与视频时空过渡。第十章待审阅；草稿全篇写毕不等于获准发布正文。

- [x] 13.20 条件扩散十章草稿获审阅通过后生成正文，保留 24 张配图、5 个 Mermaid 与 15 项参考来源；完成源文件检查、构建与本地预览。编号迁移待图像基模篇插入。

- [x] 13.21 按用户决定将图像基模草稿中的 SiT、REPA、DDT 独立为第六章「DiT 的改进」，同步十章结构与原文/配图指针；第五章保留原始 DiT，RAE/JiT 顺延第七章。
- [x] 13.22 审阅图像基模新增第六章及第七章，再逐章共写第八至十章；全稿审阅通过前不生成发布正文。

- [x] 13.23 使用 Luna 收集 FLUX.2、Qwen-Image-2.1、Seedream 5.0 Pro、Z-Image、HunyuanImage 3.0 的官方原始资料、架构图及创新证据；记录未公开项和版本边界。
- [x] 13.24 根据原始草稿的现代基模扩充要求补写第八章，保留已审阅机制，插入可核验原始架构图与统一比较表；新增内容单独交审阅。

- [x] 13.25 完成第八章现代基模首轮扩充，插入 Z-Image 与 HunyuanImage 3.0 两张原始架构图，补 Qwen-Image-2.1 机制和五个新版模型对照；新增内容待用户审阅，FLUX.2 开源资料继续核查。

- [x] 13.26 根据用户决定将 SD3 纳入第八章，在 FLUX.1 前补 Rectified Flow/MMDiT 专节、Esser et al. 原始架构图，并比较 SD3 与 FLUX.1 的主干差异；列表、对照表和原始论文引用已加入草稿。

- [x] 13.27 完成图像基模第十章「总结与边界」草稿及 FLUX.2 [dev] 代码核实增补；待用户审阅，未发布正文。

- [x] 13.28 按用户最新决定修订篇序：条件扩散保持七/70，图像基模八/80，后接视频任务九/90；同步草稿结尾与 OpenSpec。正文导航在生成时落实。

- [x] 13.29 图像基模十章正文已依据草稿与 Design 生成，保留 28 张图、4 个 Mermaid 与 24 项引用；四级标题与 Jensen 文字方向修复后复核通过，完成语法检查、构建与本地预览。条件七70→基模八80导航已接通，未推送远端。

- [ ] 14.1 依据用户七类论文清单扩充 `drafts/video-generation/video-diffusion-architectures.org`；首章先定义视频任务、帧时间/扩散时间、3D/(2+1)D卷积，再讲开创性工作；其余按用户路线逐篇共写，原文与图由 Luna 分组整理。首章基础已写待审阅，不代表整篇或 Design 新骨架获批。

- [x] 14.2 根据用户反馈重排视频基模草稿前两章：各类内按 arXiv v1 时间，修复 Make-A-Video 的旧顺序叙述，同步图号、时间表及 Design 草稿状态。
- [x] 14.3 VideoCrafter2 获审阅通过后补写 ModelScope T2V 原文、时间卷积与训练采样机制，解释 VideoCrafter2 的组件来源；插入四处原图及公式，本节已完成、待用户审阅，不代表整篇批准发布。
- [ ] 14.4 后五类占位选题在展开前核验首次公开时间并按类排序，检查前置依赖与图号。

- [x] 14.5 按用户继续授权补写 Stable Video Diffusion 草稿：三阶段、数据筛选、EDM 训练与 PF ODE、I2V 双条件和逐帧 CFG、补帧/相机 LoRA 边界；五处原图及精选数据表已插入。本节待审，不代表发布获批。

- [x] 14.6 Stable Video Diffusion 审阅通过后，核验第三章四篇 v1 日期并重排；完成 VideoFusion 草稿，含相关噪声推导、中央帧、双网络损失与梯度边界、DDIM/DDPM采样、四处原图和 Tables 5/7 整理。VideoFusion 待审，未展开 Latent-Shift。14.4 后四类日期核验仍未完成。

- [x] 14.7 VideoFusion 审阅通过后补回 Tables 1/4/6 的比较与计时边界；按原文完成 Latent-Shift 草稿、四处原图和四张实验整理表，明确三等分通道移位、视频微调/冻结范围、100步 DDPM 与评估协议。Latent-Shift 待用户审阅，未继续 PYoCo。

- [x] 14.8 Latent-Shift 审阅通过后完成 PYoCo 草稿；回源核验反演相关性、两类噪声、EDM/采样及四级级联，补协方差推导、四处论文原图与 Tables 1/2/3/5 整理，区分小规模无条件与大规模零样本结果。PYoCo 待审，未展开 VideoFactory。

- [x] 14.9 PYoCo 与噪声搬运猜想审阅通过后完成 VideoFactory 首发 v1 草稿。识别提取脚本剥离版本号后用精确 v1 URL 获取原文；保留 Swap-CA 方向/窗口推导、训练采样披露边界、四处原图、交互/数据消融及基准/完整人评结果，区分首发与后续版。VideoFactory 待审，未展开第四章。

- [x] 14.10 VideoFactory 审阅通过后开始第四章；按类内时间顺序整理为 MagicVideo → Text2Video-Zero → AnimateDiff → DSDN → SimDA。完成 MagicVideo 原文核读及草稿，含适配器/注意力/损失推导、训练采样披露边界、三张原图、原图消融整理与 Tables 1–3。MagicVideo 待审，未继续 Text2Video-Zero；后续三类日期清点仍待完成。

- [x] 14.11 MagicVideo 审阅通过后完成 Text2Video-Zero 原文提取及草稿，补运动构造与重加噪、首帧跨帧注意力、DDIM 生成、背景平滑、Algorithm 1 与 Figures 2/10、25 视频 CLIP 比较及证据边界。素材与表格来源记录于 `raw/text2video-zero-2023/`；本节待审阅，未继续 AnimateDiff。
