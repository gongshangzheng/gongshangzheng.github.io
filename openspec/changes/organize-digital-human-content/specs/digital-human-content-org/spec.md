## ADDED Requirements

### Requirement: 数字人文章归位统一分类树
所有数字人主题文章 SHALL 位于 `categories/AI/数字人` 分类树下；论文类文章归入 `数字人论文精读`，源码/工程类文章归入 `数字人工程解读`，其余主题文章位于分类树直属层。每篇文章的 `aliases` 数组中 MUST 恰好有一个 `categories/AI/数字人` 前缀路径，且同级 `sub_id` 不冲突。

#### Scenario: 新发布的论文精读文章归类
- **WHEN** 一篇数字人论文精读文章发布
- **THEN** 其 frontmatter `aliases` 包含 `categories/AI/数字人/数字人论文精读`，并在该层级分配不冲突的 `sub_id`

#### Scenario: 分类审计发现游离文章
- **WHEN** 审计发现数字人主题文章的 `aliases` 不含 `categories/AI/数字人` 前缀路径
- **THEN** 该文章被迁移到分类树正确层级，旧链接通过站点重定向机制保持可达

### Requirement: Hub 页覆盖全部数字人文章
`digital-human-hub.html` MUST 在其阅读路径/文献索引中覆盖分类树下全部已发布文章；当新文章发布后，Hub 页的 `updated_at` 与文章索引 SHALL 同步更新，不得出现文章存在但 Hub 未收录的滞后。

#### Scenario: 整理完成后的覆盖校验
- **WHEN** 本变更整理完成并构建
- **THEN** `categories/AI/数字人` 分类树下每篇文章都能在 `digital-human-hub.html` 中被检索到（链接或文章名）

#### Scenario: 后续新文章发布
- **WHEN** 数字人分类下发布新文章
- **THEN** 该文章在发布同一次提交中被加入 Hub 页对应分区

### Requirement: Hub 页体现状态模拟扩展框架
`digital-human-hub.html` MUST 包含一节描述数字人扩展定义：人的数字化状态模型（身份/属性/动作/情绪/行为）+ 指令接口 + 渲染前端，并标注以下空白方向为未来选题：text-to-human-motion、情绪可控生成、属性/年龄编辑、亲属人脸合成（Kinship Face Synthesis，引用 CDFS 与 StyleDiT）。

#### Scenario: 读者从 Hub 进入扩展框架
- **WHEN** 读者阅读 `digital-human-hub.html` 的扩展框架一节
- **THEN** 能读到状态维度分解、对应文献线索（含 arXiv 编号），以及每个空白方向的一句话说明

### Requirement: about-digital-human 与数字人体系联动
`about-digital-human` SHALL 保留在 `categories/杂识`，但 `digital-human-hub.html` MUST 包含指向 `about-digital-human.html` 的交叉链接，作为定义框架入口。

#### Scenario: Hub 页链接定义入口
- **WHEN** 读者在 `digital-human-hub.html` 寻找数字人定义
- **THEN** 存在到 `about-digital-human.html` 的可见链接

### Requirement: 整理后构建与导航校验通过
整理完成后 `node build.js` MUST 无错误；数字人分类页、索引页、别名跳转（含 `数字人`、`categories/AI/数字人/index`）与 `sub_id` 排序 MUST 表现正常。

#### Scenario: 构建校验
- **WHEN** 在整理完成的仓库上运行 `node build.js`
- **THEN** 构建成功，无未解析链接或别名冲突告警
