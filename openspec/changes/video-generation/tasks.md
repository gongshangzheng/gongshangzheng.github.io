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
- [ ] 1.11 Flow Matching 一手素材：复用已有 Lipman PDF，获取原文源码/附录与 Rectified Flow、Wan 原论文；按 `raw/flow-matching/sources/` 归档版本、URL、页码和公式/图号；按 Read Article 方法完成路径/速度/损失/采样方法分析与图表定位，不把规划中的路径视为已有资料。
- [ ] 1.12 **Flow Matching 审批门禁**：用户审阅并确认合并后的八节大纲、逐图计划、数学推导要求和第 5 篇位置后，才重写正文与修改新增的系列编号/导航；本轮合并指令不等于正文实施授权。
- [ ] 1.13 实施前核验 Flow Matching 保留的扩散模型 alias、新增视频生成 alias、旧标题检索 alias 与 `sub_id: 50`，以及后续 60–100 的同级排序，记录冲突并解决。

## 2. 逐篇页面撰写

- [x] 2.1 `diffusion-model-basics`：按修订大纲补足流形假设与支撑集错位、布朗运动/墨滴扩散直觉及其与图像高斯马尔可夫链的边界；基于 Ho et al. Algorithms 1–2 写训练与采样伪代码，插入 Figures 2、6、8；解释学习到的反向转移、随机性、已知噪声标签及 score 向量场。
- [x] 2.2 `score-sde-continuous-diffusion`：基于原论文撰写 score/DSM、Tweedie、Fokker–Planck、反向 SDE、PF-ODE、VP/VE、退火 Langevin 与 Flow Matching/v-prediction 边界；插入 Song & Ermon Algorithm 1 局部截图与 Figure 3。本篇只覆盖这些理论与采样主题。
- [x] 2.3 `edm-design-space`：按用户确认的 10 章大纲重组 EDM 篇；集中推导 `x₀`、`x_t`、`ε`、`v`、score 与 EDM 去噪器的通用换算，再分别讲网络参数化、训练、推理配置、PF-ODE、Euler/Heun 求解器、churn 和实验。区分 PF-ODE 连续向量场、Euler/Heun 数值求解和 churn 随机注入。保留原论文 Algorithm 1/2 的局部截图，分开呈现 sampler-only 与 retraining 结果；已完成 lint、构建并更新本地预览，交用户逐篇审阅后再开始下一篇。
- [x] 2.4 `ddim-fast-sampling`：按用户以“执行”确认的七节 Design 重写 DDIM；推导方差约束、边缘一致性、跨步转移、网络估计与实际采样循环，验证与后验方差 DDPM 的均值/方差等价条件；插入 10 个编号图示（其中 2 张 Mermaid）、原文 Eq. (12) 局部截图和 3 张对照/结果表，完成单页 lint、构建与浏览器检查。当前编号/sub_id 为 4/40；完成后交用户审阅。
- [x] 2.5 `flow-matching`：按确认的八节大纲重整既有页面，完成一般高斯路径条件速度、边际场、CFM/FM 损失差常数与 score/速度换算推导，展开训练/ODE 采样，依据 Wan 原报告核实视频训练案例；清理重复/偏题内容，插入 7 个图示与 4 张表。页面待用户逐篇审阅后再完成审校任务。
- [x] 2.6 `conditional-image-diffusion`：撰写 classifier guidance/CFG、CLIP/DALL·E 2 与潜空间扩散；将 ControlNet、DreamBooth、LoRA 控制在桥接案例范围；EDM 插入后需更新编号与 sub_id。
- [ ] 2.7 `video-generation-tasks-spacetime`：撰写视频任务地图、时空表示、3D convolution 和 R(2+1)D，并明确动作识别与生成的任务差别。
- [ ] 2.8 `video-diffusion-architectures`：基于原论文撰写 Imagen Video、Video Diffusion Models、Make-A-Video 与有限开源模型案例。
- [ ] 2.9 `video-generation-data-evaluation`：核验并撰写训练数据、评测基准、指标及比较口径，区分数据集与评测集。
- [ ] 2.10 `long-video-temporal-consistency`：撰写时间一致性、identity shift、attention sink、memory、长程依赖、自回归/流式生成及 Custom Forcing 案例。
- [ ] 2.11 `video-generation-hub`：按 `html-blog` skill 使用 Hub 模板，提供 10 篇阅读路线、目录、资源入口和分类图谱。

## 3. 系列统一与 Review

- [ ] 3.1 合并大纲获批后统一 10 篇正文的分类、标题、术语、编号和导航：前四篇 10–40，Flow Matching 50，条件图像与视频 60–100；新增 DDIM → Flow Matching → 条件图像扩散的直接导航，保留 Flow Matching 旧 URL 与扩散模型入口。
- [ ] 3.2 每篇完成后单独做保真度检查：回查该篇原文，核对推导、时间方向、参数化、数字、实验设置、许可与引用；EDM 的 FID/NFE 必须保留各自口径。
- [ ] 3.3 每篇完成后检查结构和内容：对照该篇已批准大纲，核对先修顺序、章节边界、跨篇重复、来源完整性、图表说明和术语解释；完成一篇即停下交用户审阅。
- [ ] 3.4 按 `blog-syntax`、`blog-categories`、`blog-aliases` 规范检查 HTML、frontmatter、引用 key、`.sources` 的 `data-cite-key`、MathJax、图片、Hub 组件、移动端布局及导航。
- [ ] 3.5 按 Review 结果修复 P0/P1 问题；确保正文每项可核实事实有引用，正文与 `.sources` 引用一一对应。

- [ ] 3.6 Flow Matching 数学与读者验收：逐式回查 Lipman/Rectified Flow 原文，验证条件均值、连续性方程、损失平方展开/交叉项及 score 换算的假设、方向与端点；检查一个手算例子和“为何训练标签已知、为何推理不需目标 y”的讲解；视频应用回查原始报告，清除未核实的 benchmark/等价断言。
- [ ] 3.7 Flow Matching 图与结构验收：按 Design 核对每张图的标题、位置、来源、原文裁切范围和图后解释；区分条件路径与学习轨迹、论文原图与作者整理 Mermaid，检查 SVG/栅格图上下标、MathJax、窄屏排版、重复章节、空标题与无效链接。

## 4. 发布与构建

- [x] 4.1 用户确认 EDM Design 后，将 `edm-design-space` 页面与配图写入 `src/pages/`、`media/images/`；移除 Score/SDE 的 EDM 信息框、相关正文和来源引用，并同步必要的直接前后篇链接和系列元数据。
- [x] 4.2 每个新建或修改的页面运行 `node lib/lint-html.js src/pages/<slug>.html`；确认引用、MathJax、标题组件和图片规则无错误。
- [x] 4.3 EDM 页面完成后运行 `node build.js`（内含自动测试门禁），检查生成页面、分类索引与本地预览；构建成功后用 `npm run serve` 提供可审阅 URL。用户审阅通过前不继续写下一篇。
- [ ] 4.4 后续每完成一篇都构建并更新本地预览；对全系列发布时确认页面、Hub、分类 alias 与前后篇链接完整，再运行 `git diff --check` 审阅差异。
- [ ] 4.5 确认各篇关键数值有原始口径、图片来源/许可已核查；不在不同设置间作无依据的性能排名。

- [ ] 4.6 Flow Matching 单篇发布：保持 `flow-matching.html` URL，按批准的大纲修改标题/检索 alias、双分类入口和系列排序；单页 lint、必要自动化检查、构建及浏览器验收最新预览，记录公式/图示与页面检查结果；完成本篇即交用户审阅，再继续下一篇。

## 5. Hub 与交叉回链

- [ ] 5.1 在 Hub 中维护完整系列目录、推荐阅读路径、资源入口和主题卡片；确认 `sortable-list`、`post-graph` 仅过滤本系列分类。
- [ ] 5.2 为每篇正文添加上一章、Hub、下一章导航，并检查首尾章节链接。
- [ ] 5.3 运行 `~/.venv/bin/python3 scripts/cross-link.py` 或按其报告补全正文与 `.sources` 交叉回链，再重新构建验证。

- [ ] 5.4 将 Flow Matching 作为第 5 篇加入 Hub 目录和先修路线；核对 `network-flow-matching`、EDM、Score/SDE、DDIM 与视频基模的站内链接，兼容旧入口，按适用的引用结构补交叉回链。

## 6. 草稿状态回填

- [x] 6.1 草稿处置：按用户要求删除 `drafts/video-generation.org`；本 change 不创建草稿，无草稿状态回填项。

- [ ] 6.2 Flow Matching 实施前核查是否有对应草稿；若无则记录无关联项，若有按 blog-drafts 回填，不创建重复中间笔记。
