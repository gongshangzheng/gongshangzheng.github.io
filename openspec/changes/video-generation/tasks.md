## 1. 计划与素材

- [x] 1.1 盘点 Roam 笔记、CVPR 2024 教程 PDF 与现有博客材料；只使用仍存在的来源文件，不依赖已删除的旧草稿。
- [ ] 1.2 完成剩余 6 篇正文的原论文、官方项目页、模型卡或数据集卡收集；记录版本、页码/章节、公式和数据口径，无法取得时登记官方替代来源。正文 1–2 的首批来源已由 1.7 完成。
- [ ] 1.3 阅读 CVPR 2024 教程 PDF 目录及相关章节，记录任务地图、架构、视频编辑和评测素材的页码；检查用户提及的 MIT 扩散课程笔记，找不到则不作该课程引用。
- [x] 1.4 在 `categories/AI` 下登记 `categories/AI/视频生成` subcategory；检查 `data/category-names.json`，补充 `视频生成: video-generation` 映射（若缺失），并在分类组织文档登记本系列。
- [x] 1.5 分配 Hub `sub_id: 0`、正文 `10–80`；首篇 `sub_id: 10` 已由 `scripts/check-sub-id.py` 核验；合并后发布前重新检查后续编号。
- [x] 1.6 **审批门禁**：用户已确认按当前 `design.md`「文章内容大纲」逐篇开始生成。
- [x] 1.7 为正文 1–2 收集并核读 DDPM、Sohl-Dickstein 非平衡热力学、GAN/WGAN、Hyvärinen score matching、Vincent DSM、Song & Ermon NCSN、Anderson 反向时间扩散、Song et al. 连续时间 SDE、Lipman et al. Flow Matching 与 Salimans–Ho v-parameterization 原始来源；记录章节/页码、版本与适用范围，排除误命中的同名及错误 arXiv 下载。

## 2. 逐篇页面撰写

- [x] 2.1 `diffusion-model-basics`：按修订大纲补足流形假设与支撑集错位、布朗运动/墨滴扩散直觉及其与图像高斯马尔可夫链的边界；基于 Ho et al. Algorithms 1–2 写训练与采样伪代码，插入 Figures 2、6、8；解释学习到的反向转移、两种固定反向方差选择、随机性、已知噪声标签和 score 向量场/候选去噪方向加权平均，并逐式核对。
- [x] 2.2 `score-sde-continuous-diffusion`：基于 Vincent 2011、Song & Ermon 2019、Anderson 1982、Song et al. 2021 原文撰写 score/DSM、Tweedie、Fokker–Planck、反向 SDE、PF-ODE 及 Flow Matching/v-prediction 边界；明确 DSM 与连续时间建模的历史位置。
- [ ] 2.3 `ddim-fast-sampling`：推导 DDIM 采样更新与跨步机制，比较 DDPM/DDIM 但不把 DDIM 误写为任意 SDE 的 ODE 化。
- [ ] 2.4 `conditional-image-diffusion`：撰写 classifier guidance/CFG、CLIP/DALL·E 2 与潜空间扩散；将 ControlNet、DreamBooth、LoRA 控制在桥接案例范围。
- [ ] 2.5 `video-generation-tasks-spacetime`：撰写视频任务地图、时空表示、3D convolution 和 R(2+1)D，并明确动作识别与生成的任务差别。
- [ ] 2.6 `video-diffusion-architectures`：基于原论文撰写 Imagen Video、Video Diffusion Models、Make-A-Video 与有限开源模型案例。
- [ ] 2.7 `video-generation-data-evaluation`：核验并撰写训练数据、评测基准、指标及比较口径，区分数据集与评测集。
- [ ] 2.8 `long-video-temporal-consistency`：撰写时间一致性、identity shift、attention sink、memory、长程依赖、自回归/流式生成及 Custom Forcing 案例。
- [ ] 2.9 `video-generation-hub`：按 `html-blog` skill 调用 `capture.js --hub`，使用 `templates/hub-template.html` 创建 Hub，提供阅读路径、系列目录、资源索引和分类图谱。

## 3. 系列统一与 Review

- [ ] 3.1 统一 8 篇正文的标题编号、分类 aliases、核心 tags、术语和前后篇导航；正文不使用 `hub` frontmatter 字段，核对 Hub 与 `chapter-nav` 双向链接。
- [ ] 3.2 完成事实与公式 Review：回查原文核对推导、时间方向、参数化、数据、实验设置、许可及所有数值。
- [ ] 3.3 完成结构与内容 Review：检查先修顺序、章节边界、跨篇重复、来源完整性、图表说明和关键概念解释。
- [ ] 3.4 完成 HTML 与站点规范 Review：按 `blog-syntax`、`blog-categories`、`blog-aliases` 规范检查 frontmatter、引用 key、`.sources` 的 `data-cite-key`、MathJax、图片包裹、Hub 组件、移动端布局及导航。
- [ ] 3.5 按三路 Review 结果修复所有 P0/P1 问题；引用每项可核实事实，正文和 `.sources` 引用一一对应。

## 4. 发布与构建

- [ ] 4.1 将 8 篇正文和 Hub 直接生成至 `src/pages/`；配图放入 `media/images/<slug>/`，引用放入各页面 `.sources`。
- [ ] 4.2 每个新建或修改页面后运行 `node lib/lint-html.js src/pages/<slug>.html`；确认引用、MathJax、标题组件和图片规则无错误。
- [ ] 4.3 更新 `data/category-names.json`（仅在前序检查确认映射缺失时）和相关 Hub alias；运行 `node build.js`（内含自动测试门禁）并检查生成的分类索引与 Hub 接管效果。
- [ ] 4.4 构建成功后运行 `npm run serve` 启动本地自动预览，确认页面可访问并提供预览 URL；另运行 `git diff --check` 审阅差异。后续源文件改动应由 watcher 自动重建并触发 LiveReload。
- [ ] 4.5 确认各篇关键数值有原始口径、图片来源/许可已核查；不在不同设置间作无依据的性能排名。

## 5. Hub 与交叉回链

- [ ] 5.1 在 Hub 中维护完整系列目录、推荐阅读路径、资源入口和主题卡片；确认 `sortable-list`、`post-graph` 仅过滤本系列分类。
- [ ] 5.2 为每篇正文添加上一章、Hub、下一章导航，并检查首尾章节链接。
- [ ] 5.3 运行 `~/.venv/bin/python3 scripts/cross-link.py` 或按其报告补全正文与 `.sources` 交叉回链，再重新构建验证。

## 6. 草稿状态回填

- [x] 6.1 草稿处置：按用户要求删除 `drafts/video-generation.org`；本 change 不创建草稿，无草稿状态回填项。
