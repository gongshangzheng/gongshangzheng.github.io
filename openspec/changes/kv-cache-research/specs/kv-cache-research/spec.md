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

本阶段 SHALL 交付研究材料与依据用户实质输入形成的候选规划；MUST NOT 将检索素材或agent提纲冒充用户草稿。用户实质口述可原样存档作为草稿依据，正文写作 MUST 具备该输入与获确认的大纲。

#### Scenario: No dedicated user draft exists
- **WHEN** 当前只有研究材料和相邻主题文章
- **THEN** Change 记录大纲尚未生成，保留可执行的深读任务，不修改文章或用户草稿

### Requirement: Dedicated KV Cache category

后续分类实施 MUST 使用 `categories/AI/KV Cache`，注册英文 slug `kv-cache`，并先保持单层专题。以 KV Cache 为核心问题的文章 SHALL 归入该分类；已有文章加入时 MUST 保留仍适用的原分类及原文章 slug。分类元数据变更不代替正文写作审批。

#### Scenario: Classify the existing PagedAttention topic
- **WHEN** 实施已有 KV Cache 与 PagedAttention 专题的分类变更
- **THEN** 文章同时具有 KV Cache 和 AI Infra 分类，原文章 URL 保持有效，构建生成 `/categories/ai/kv-cache/index.html`

#### Scenario: Classify video and neighboring cache methods
- **WHEN** 审核视频论文解读或扩散特征缓存相关文章
- **THEN** 仅以 KV Cache 为核心的文章加入新分类，保留原有主题归属；仅零散提及 KV Cache 或属于其他缓存对象的文章通过关联链接连接

### Requirement: Source-backed visual explanation

后续文章 MUST 结合论文原图和必要的自绘教学图解释KV Cache；可补充来源和使用依据已核验的博客、官方文档图片。综述配图至少一半 MUST 来自论文；MUST NOT 使用AI生图或身份不符的原图。每张图 MUST 记录来源、版本/位置、使用依据和改编状态，并在正文中提供图注、来源链接及替代文字。

#### Scenario: Explain why KV Cache is necessary
- **WHEN** 规划基础讲解的配图并进入制作
- **THEN** 图示覆盖逐token生成、无缓存重复计算、有缓存的新增计算与历史读取、张量容量、随长度增长的瓶颈和各优化路线，沿用一致的例子与符号，不能暗示缓存使attention成为常数开销

#### Scenario: Reuse or draw a technical figure
- **WHEN** 选择论文或网页图、改编图片或自行绘图
- **THEN** 核查原始出处和技术条件，保留原文件或可编辑源文件，明确原图/改编/自绘；公式曲线与实测图分别标注依据，无法核定来源或使用依据的素材保持未采用状态

#### Scenario: Verify figures before publication
- **WHEN** 文章准备发布
- **THEN** 检查论文原图占比、来源标注、图例与单位、移动端可读性及图片路径；发布栅格图使用WebP，研究原件保持可追溯

#### Scenario: Review SVG candidates before installation
- **WHEN** 新增或修订博客SVG教学图
- **THEN** 先向用户展示经过实际渲染与主agent亲自视觉复核的候选图，经明确确认后才能插入正文或替换既有SVG/WebP；制作过程保留在skill和内部记录，不混入正文图注

### Requirement: User-grounded article sequence

候选系列 SHALL 以用户口述为依据，先说明文本LLM生成场景，再按注意力、多头注意力、多层Decoder、自回归文本例子的顺序建立基础，之后才引入Prefill与Decode两个阶段，并继续解释重复计算、KV Cache流程、容量与带宽问题。后续专题 MUST 覆盖架构、量化、选择性保留/读取、显存管理、跨请求复用与多机，以及视频Rolling和蒸馏协作。

#### Scenario: Explain video acceleration
- **WHEN** 规划视频KV Cache专题
- **THEN** 分别说明蒸馏减少去噪调用、缓存复用历史状态及其共同使用条件，区分视频时间与去噪时间，不直接相乘跨论文加速倍数
