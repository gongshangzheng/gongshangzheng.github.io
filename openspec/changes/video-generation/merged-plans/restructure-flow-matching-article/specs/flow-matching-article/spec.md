> 历史验收要求：此文件随原 change 合并保留，当前生效要求见 `video-generation/design.md` 的内容质量规则及 Flow Matching 大纲、对应 tasks。保留旧 URL 与分类入口的要求已迁入；原标题/无编号约束由新的系列规划替代。

## Purpose

为希望理解连续时间生成模型的读者提供一篇概念次序清楚、术语与公式相互一致的 Flow Matching 入门文章，帮助读者从概率路径理解到训练目标与采样过程。

## ADDED Requirements

### Requirement: Flow Matching 入门文章建立连贯的概念主线
文章 MUST 按读者理解所需的顺序说明生成任务与概率路径、向量场和 ODE、条件流匹配的训练目标、采样过程，以及它与扩散模型的关系。每个公式中的变量 MUST 在首次出现时定义，后续解释 MUST 与公式符号和时间方向一致。

#### Scenario: 读者沿章节理解训练与生成
- **WHEN** 读者从文章开头顺序阅读到采样章节
- **THEN** 读者可以说明噪声分布如何沿概率路径变为数据分布、模型训练时回归什么速度场，以及推理时如何通过求解 ODE 生成样本

### Requirement: 文章避免重复、断裂和偏题内容
文章 MUST 将重复的 Flow Matching 定义合并为单一主线，清理无效链接、未完成标题和不服务入门目标的长篇旁支内容。与扩散模型、SDE、score matching 等主题的延伸 MUST 明确说明其与主线的关系，并控制在支持读者理解 Flow Matching 的范围内。

#### Scenario: 读者不会遇到互相重复或悬空的章节
- **WHEN** 读者浏览文章标题、链接和段落
- **THEN** 章节层级连续且没有重复讲解同一概念的独立主线、空标题或空目标链接

### Requirement: 保持既有文章入口兼容
更新后的内容 MUST 保留 `flow-matching` slug、文章标题和 `categories/AI/扩散模型` 分类 alias，并继续兼容站点文章构建所需的 frontmatter 与 MathJax 公式呈现。

#### Scenario: 既有文章 URL 和分类入口保持有效
- **WHEN** 站点构建更新后的文章
- **THEN** `flow-matching` 页面仍以原 URL 和分类入口呈现，正文中的数学公式可正常渲染
