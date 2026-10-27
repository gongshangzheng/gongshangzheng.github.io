## Purpose

为 KV Cache 专题提供可追溯的检索材料和分层论文池，覆盖大语言模型与视频生成，并明确证据深度、缓存语义及实验比较边界，使后续历史分析和改进研究建立在可核查的原始资料上。

## ADDED Requirements

### Requirement: Traceable source discovery

研究交付 MUST 包含综述、技术博客或官方文档、原始论文三类资料，并记录查询、检索日期、可点击来源、实际读取深度与检索限制。

#### Scenario: Review a source
- **WHEN** 用户查看某条资料或重要论文
- **THEN** 用户能找到其来源 URL、入选理由以及已核验和待核验的信息

### Requirement: Tiered paper pool across domains

论文池 SHALL 区分核心综述、必读论文、路线代表及背景工作；MUST 覆盖 LLM 的架构、管理、复用、压缩、选择与分层存储，以及视频生成的因果缓存和扩散特征缓存边界。

#### Scenario: Identify reading priorities
- **WHEN** 用户准备按历史沿革研究关键论文
- **THEN** 论文池提供首次公开年份、路线、入选原因、官方链接及明确的阅读优先级

### Requirement: Comparable evidence and hypotheses

研究设计 MUST 分开定义延迟、吞吐、显存、带宽与质量，记录模型、负载、硬件和视频设置；未经同口径核验 MUST NOT 直接比较跨论文的加速倍数。改进方向 MUST 标注为待验证假设。

#### Scenario: Compare two methods
- **WHEN** 两篇论文的模型、硬件、序列长度或生成设置不同
- **THEN** 比较记录明确不可直接排名及所缺控制变量，而非给出统一性能胜负结论

### Requirement: Preserve research and writing boundary

本阶段 SHALL 交付研究准备材料；MUST NOT 以检索素材代替用户草稿或生成文章章节大纲。后续写作 MUST 先具备用户实质草稿与获确认的大纲。

#### Scenario: No dedicated user draft exists
- **WHEN** 当前只有研究材料和相邻主题文章
- **THEN** Change 记录大纲尚未生成，保留可执行的深读任务，不修改文章或用户草稿
