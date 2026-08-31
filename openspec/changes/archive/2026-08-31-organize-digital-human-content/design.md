## Context

数字人分类树 `categories/AI/数字人`（含论文精读 27 篇、工程解读 4 篇、直属 21 篇）和 Hub 页 `digital-human-hub.html`（updated_at 2026-07-10）已存在。翻译注册表 `data/category-names.json` 已有对应 slug 映射。分类体系规则由 blog-aliases / blog-categories skill 定义：aliases 中的 `categories/` 路径决定分类位置，sub_id 仅控制同级排序。

两次讨论形成的方向性结论（作为组织框架写入本次整理）：

1. **扩展定义**：数字人 = 一个人的数字化状态模型（身份/属性/动作/情绪/行为）+ 指令接口 + 渲染前端。说话数字人是"状态变化维度 ≈ 唇形+表情+语音"的特例。文献支撑：Human Digital Twin 综述、Human Motion Video Generation Survey（arXiv 2509.03883）、Fleximo（2411.19459）、HumanDreamer（CVPR 2025）、Emotion-Controllable Face Generation Survey。
2. **亲属人脸合成**：库内空白的新方向。CDFS（arXiv 2002.11376，AAAI 2020）：两亲一子可控后代脸合成，inheritance + attribute enhancement 模块，无 ground-truth 训练策略；StyleDiT（arXiv 2412.10785，WACV 2025）：StyleGAN 先验 + 条件扩散，Relational Trait Guidance 独立控制各亲本影响、年龄性别、多样性-保真度权衡，并扩展到"孩子+一方父母 → 预测另一方配偶"。

## Goals / Non-Goals

**Goals:**
- 所有数字人相关文章归位到统一分类树，aliases/sub_id 一致。
- Hub 页覆盖截至整理时点的全部文章，并体现"状态模拟"扩展框架与空白区标注。
- `about-digital-human` 的归属有明确决策并执行。

**Non-Goals:**
- 不新写 text-to-motion / 情绪可控方向的完整文章（那是后续独立 change / 草稿）；亲属人脸合成方向例外：仅创建 StyleDiT、CDFS 两篇论文精读草稿（不含写作完成与发布）。
- 不改构建管线、模板、lib/ 代码。
- 不重构非数字人分类。

## Decisions

1. **Hub 组织框架加第三轴"可控状态维度"，不改变现有五层阅读路径结构。**
   理由：现有"总览→Survey→专题→论文精读→源码工程→产业图谱"结构运行良好，增量加一节"扩展定义与未来方向"成本最低；替代方案（推倒重建按状态维度组织）会破坏已发布的交叉链接。
2. **`about-digital-human` 保留在「杂识」，但在数字人 Hub 增加指向它的交叉链接（作为"定义框架"入口）。**
   理由：该文是通识性定义文，放杂识符合定位；迁移会改变已发布 URL 的分类归属，收益小于风险。替代方案：迁移到 `categories/AI/数字人` 并设为 index 文——被否，因为 `digital-human-hub` 已占据 index alias。
3. **新文章按"类型"归入现有三级：论文 → 论文精读，工程/源码 → 工程解读，其余 → 直属。** `arcface-2018` 等基础模型文按其主要用途归入。
4. **空白方向只在 Hub 中以"未来选题"形式标注（一段文字 + 关键论文引用），不创建空分类节点。**
   理由：空分类节点会在站点导航中产生死区。

## Risks / Trade-offs

- [Hub 页信息量膨胀，阅读路径变长] → 新增内容收拢在单独一节，控制在一屏以内。
- [批量改 frontmatter 可能引入 sub_id 冲突或链接断裂] → 改完跑 `node build.js`，检查构建输出无警告；逐文件改而非正则批改。
- [扩展框架是新观点，写入 Hub 后若观点演进需维护] → 表述为"观察与框架"而非定论，标注文献出处。

## Migration Plan

纯内容改动，随日常构建发布；如构建或链接检查失败，回退对应文件的 git 改动。

## Open Questions

- [已决] Kinship Face Synthesis 开两篇论文精读草稿：StyleDiT（2412.10785）与 CDFS（2002.11376），归入 `数字人论文精读`；本 change 只负责建草稿，写作与发布走 read-article 流程。
- `arxiv-digest-*` 中的相关文章是否需要回填到 Hub 的"文献雷达"区？默认不做，除非整理过程中发现明确缺口。
