## Why

数字人分类（`categories/AI/数字人`）自 2026-06 建立以来已积累 50+ 篇文章（论文精读 27 篇、工程解读 4 篇、直属 21 篇），但 Hub 页 `digital-human-hub.html` 停留在 2026-07-10，之后新发布的约 10 篇文章（wan-streamer-2026、uika-2026、paper-hallo3、paper-hunyuan-avatar、avatarforcing-2026、flexavatar-2025、arcface-2018 等）未被纳入；`about-digital-human` 挂在「杂识」下未与数字人体系联动；且现有体系只覆盖"驱动信号 → 说话视频"这一窄定义。

经讨论确认两个方向性扩展，应作为本次整理的组织框架：

1. **数字人 = 人类在数字空间中的状态模拟**：把数字人从"新闻播报/交互"推广为"人像建模 → 人的状态表示（身份/属性/动作/情绪/行为）→ 指令修改状态 → 渲染"的通用模拟器。对应文献线：Human Digital Twin、text-to-human-motion（HumanDreamer、Fleximo、Human Motion Video Generation Survey）、情绪可控人脸生成、属性/年龄编辑。
2. **亲属人脸合成（Kinship Face Synthesis）**："给定父母长相预测孩子长相"是该框架下"身份遗传维度"的具体任务，已有成熟文献线：CDFS（AAAI 2020，两亲一子的可控后代脸合成）、StyleDiT（WACV 2025，StyleGAN+DiT 统一孩子/配偶脸合成，Relational Trait Guidance 控制像谁、年龄性别）、Kinship Verification 系列。库内目前完全空白。

## What Changes

- 审计全部数字人相关文章的 aliases / sub_id / wiki 链接，归位到 `categories/AI/数字人` 三级结构（直属 / 数字人论文精读 / 数字人工程解读）。
- 决策 `about-digital-human` 的归属：留在「杂识」还是迁移/交叉引用到数字人树（作为"定义与框架"入口文）。
- 更新 `digital-human-hub.html`：纳入 2026-07-10 之后新文章，并在阅读路径中引入"状态模拟"扩展框架（新增"可控状态维度"轴），标注 text-to-motion、情绪可控、属性编辑、亲属人脸合成为空白区/未来选题。
- 为亲属人脸合成方向的两篇核心论文创建论文精读草稿：StyleDiT（2412.10785）与 CDFS（2002.11376），归入 `数字人论文精读`。
- 校验构建（`node build.js`）与 taxonomy 索引、别名跳转、排序正确性。

## Capabilities

### New Capabilities
- `digital-human-content-org`: 数字人博客内容的组织规范——分类树结构、文章归位标准、Hub 页内容覆盖与更新节奏、扩展定义框架（状态模拟）在导航中的体现。

### Modified Capabilities
（无——`openspec/specs/` 目前为空，这是第一个正式 spec。）

## Impact

- `src/pages/digital-human-hub.html` 及 50+ 篇数字人相关文章的 frontmatter（aliases / sub_id / 交叉链接）。
- `drafts/about-digital-human.org` 的 target_alias 记录（若决策迁移）。
- 不涉及构建管线（build.js / lib/）改动；仅内容层。
- 后续选题储备：text-to-human-motion、情绪可控生成两个空白方向可各自开新 change / 草稿；Kinship Face Synthesis 已决定以 StyleDiT、CDFS 两篇精读草稿落地。
