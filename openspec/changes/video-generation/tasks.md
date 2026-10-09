## 1. 素材与计划

- [ ] 1.1 扩大检索 `~/org/roam`，定位用户提到的 MIT 扩散课程笔记；若找到，记录文件路径和相关章节；若未找到，记录检索范围并避免将其他材料称为 MIT 课程笔记。
- [ ] 1.2 回查 DDPM 与 DDIM 原论文/可靠讲义，核准后验推导、ELBO 加权目标、DDPM 采样公式与 DDIM `eta` 公式；修正 design 中待定位/待核验项。
- [ ] 1.3 核对 `drafts/video-generation.org` frontmatter 与现有提纲，确认只追加扩散基础内容、不覆盖原有身份信息。

## 2. 草稿写作

- [ ] 2.1 按 `design.md` 大纲在 `drafts/video-generation.org` 新增扩散基础章节，覆盖 DDPM 前向闭式、后验、训练目标、反向采样及 DDIM 推导与跳步。
- [ ] 2.2 对公式统一符号并补齐逐步解释、直觉说明、DDPM/DDIM 对照表和衔接视频生成的总结；自绘示意图若必要则放入 `drafts/assets/video-generation/`。
- [ ] 2.3 保留原有 identity shift、attention sink、persistent memory、longer contexts 占位内容及 frontmatter；按草稿流程更新状态/进度/更新时间。

## 3. 核查

- [ ] 3.1 逐式手工复核代数、下标、方差与边界条件，重点检查 `q(x_{t-1}|x_t,x_0)`、ELBO 到 epsilon MSE、DDIM 跨步更新。
- [ ] 3.2 运行 `git diff --check` 并审阅差异，确认没有改动 `src/pages/`、没有发布、没有修改 `~/org/roam` 原笔记。
