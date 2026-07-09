# 论文章节利用指南

一篇学术论文的每个章节在不同调研阶段有不同的利用方式。本指南系统说明**何时读什么、读多深、用来做什么**。

> **核心原则**：不要平铺直叙地"读完整篇论文"。根据当前阶段的目标，有策略地精读对应章节。

---

## 1. 论文结构与阶段映射总览

```
论文结构              Phase 0-1    Phase 2a    Phase 2b    Phase 2c    Phase 2d    Phase 2.4
                     (筛选)      (背景)      (引用链)    (宝藏)     (方法论)    (发现闭环)
─────────────────────────────────────────────────────────────────────────────────────────
Title + Abstract     ★★★精读     ★重读       ★对照       ★验证       ★重读
Introduction         ★★前3段    ★★★精读     ★★贡献声明               ★重读       ★贡献验证
Related Works        ★扫分类     ★★分类框架   ★★★精读                ★定位对比    ★★★精读
Method/Approach                              ★★核心创新   ★★细节      ★★★精读
Experiments                                  ★★baseline   ★★★精读    ★★对比表
Conclusion/Limit.    ★扫末尾     ★★开放问题   ★后续方向               ★局限分析    ★★缺口提取
References           ★时效性                  ★★★引用频率                          ★★交叉比对
Appendix/Suppl.                              ★补充材料   ★★★精读    ★★证明
```

★ = 轻读（扫一眼）  ★★ = 中度阅读  ★★★ = 深度精读

---

## 2. 各章节详细利用策略

### 2.1 Title + Abstract

**Phase 0-1（筛选阶段）** — 第一道过滤器

精读目标：
- **核心问题**：这篇论文解决什么问题？
- **方法类型**：是什么技术路线？（CNN / Transformer / SSM / 骨骼 / 多模态）
- **关键贡献**：声称的主要创新是什么？
- **定量结果**：在什么数据集上达到什么指标？（如有）

利用方式：
- 判断论文角色：`core-survey` / `must-read-paper` / `route-representative` / `context-only` / 拒绝
- 提取关键词用于后续搜索扩展
- 如果 abstract 提到"我们基于 X 方法"或"我们改进了 Y"，记录 X/Y 为引用链候选

**Phase 2a（背景调研）** — 贡献声明锚点

重读目标：
- 提取论文声称的 3-5 个核心贡献点（"We propose...", "We introduce...", "We achieve..."）
- 这些贡献声明将在后续 Phase 4 写作时作为文章 Part 1 的骨架
- 与 Phase 2 其他 subagent 产出的实际分析对比：声称的贡献是否成立？

**Phase 2c（宝藏挖掘）** — 数值验证

- abstract 中提到的关键数值（如 "达到 85.3% 准确率"）必须在 Experiments 章节验证
- 如果 abstract 数值与正文不一致，以正文为准并记录差异

---

### 2.2 Introduction

**Phase 0-1（筛选阶段）** — 快速定位

阅读范围：前 3 段（或前 1 页）
目标：
- 问题动机：为什么这个问题重要？有什么实际应用？
- 问题难度：为什么现有方法做不好？瓶颈在哪？
- 论文定位：作者把自己放在什么技术路线上？

利用方式：
- 如果 Introduction 描述的问题动机与我们调研方向高度吻合 → 提升优先级
- 如果 Introduction 提到的瓶颈正是我们关注的技术挑战 → 提升优先级

**Phase 2a（背景调研）** — 精读全部 Introduction

精读目标：

1. **问题动机与背景**
   - 该问题在学术界/工业界的重要性（引用了哪些统计数据）
   - 实际应用场景（作者列举了哪些 use case）
   - 为什么现在要做这个（时机：硬件进步？数据可用？新理论？）

2. **已有方法的不足**（Introduction 中的"mini-related-works"）
   - 作者批评了哪些方法？批评点是什么？
   - "Existing methods suffer from..." → 提取为已知方法的共性缺陷
   - 这些批评是否客观？是否有反驳空间？

3. **贡献声明**（通常在 Introduction 末尾）
   - 逐条提取贡献列表（"Our contributions are..."）
   - 每条贡献的类型：新方法？新数据集？新指标？新发现？
   - 贡献的新颖性级别：增量改进 vs. 范式创新

4. **论文路线图**（最后一段）
   - "Section 2 describes..., Section 3 presents..." → 确认论文结构完整性

**Phase 2b（引用链）** — 贡献声明交叉验证

- Introduction 中的"Unlike X..." / "In contrast to Y..." 声明 → 需要在 Phase 2d 验证
- Introduction 中提到的关键前置工作 → 加入引用链候选

**Phase 4（写作）** — Part 1-2 素材来源

- Introduction 的动机叙事 → 博客 Part 1（引言）的直接素材
- Introduction 的问题描述 → 博客 Part 2（问题剖析）的骨架
- 贡献声明 → 博客 Part 3 的叙事主线

---

### 2.3 Related Works（相关工作）

> **Related Works 是 survey 调研阶段最重要的章节。** 它相当于该论文作者为我们做的领域分类，是高信息密度的"微型 taxonomy"。

**Phase 0-1（筛选阶段）** — 快速扫描分类框架

阅读范围：扫一遍小节标题 + 每节首句
目标：
- 论文把已有方法分成了几类？分类标准是什么？
- 我们的调研方向是否被覆盖？
- 是否有我们不知道的重要子方向？

利用方式：
- 如果 Related Works 的分类框架与我们 Phase 0 领域地图高度一致 → 确认领域地图可靠
- 如果 Related Works 有我们没覆盖的子方向 → 补充搜索

**Phase 2b（引用链挖掘）** — 核心精读目标

这是 Related Works 的主战场。精读要求：

1. **提取分类体系**
   - 论文把已有方法分成哪几类？（如"基于 CNN 的"、"基于 Transformer 的"、"基于骨骼的"）
   - 分类标准是什么？（按技术路线？按输入模态？按任务粒度？）
   - 每类有多少代表方法？列出来
   - 这个分类与我们自己的 taxonomy 对比：更细？更粗？维度不同？

2. **提取共性缺陷分析**
   - 论文对每类方法指出了什么共性不足？
   - "Although X methods have achieved..., they still suffer from..."
   - 这些不足是否确实存在？还是作者为了突出自己贡献而夸大？
   - 跨多篇 survey 交叉验证：多篇 survey 都提到的共性缺陷 → 很可能是真的

3. **论文引用频率分析**
   - 哪些论文被反复引用（在多个小节中出现）？
   - 哪些论文被作为整个类别的代表？
   - 被 3+ 篇论文的 Related Works 都引用的论文 → 该领域的 landmark paper
   - 被引但不在我们论文池中的 → 候选补充

4. **技术演进脉络**
   - Related Works 是否暗示了技术演进方向？（如"从 X 到 Y 到 Z"）
   - 是否有明确的时间线叙事？
   - 这个演进脉络与我们 Phase 0 的领域地图对比：一致？更细？

**Phase 2d（方法论）** — 技术定位

- "Unlike [X], our method..." → 提取技术差异点
- 这些差异点是否真正构成了创新？还是工程 trick？

**Phase 2.4（迭代发现闭环）** — 论文池回流

Related Works 是发现闭环的主要信息源：

操作步骤：
1. 列出 Related Works 中提到的所有论文（不只是 top 3-5）
2. 与当前论文池交叉比对，标记"在池中"和"不在池中"
3. 对"不在池中"的论文，按被引频率排序
4. 被引 3+ 次的 → 升级为 `must-read-paper` 候选
5. 被引 2 次的 → 升级为 `route-representative` 候选
6. 对新候选执行轻量搜索（标题 + abstract），判断是否属于调研范围

**Phase 3（survey-spine）** — taxonomy 校准

- 多篇 `core-survey` 的 Related Works 分类体系取并集 → 形成我们的 survey taxonomy
- 如果多篇 survey 的分类方式不同，选择最细粒度的那个作为基础，合并其他
- 如果某篇 survey 的 Related Works 覆盖了我们不知道的子方向 → 标记为需要补充搜索

**Phase 4（写作）** — 前置工作叙事

- Related Works 的分类框架 → 博客"前置工作"章节的骨架
- 每类方法的共性不足 → 博客"为什么需要新方法"的论述素材

---

### 2.4 Method / Approach（方法）

**Phase 2d（方法论精析）** — 主战场

精读目标（逐模块）：
1. **问题形式化**：输入空间、输出空间、数学符号
2. **整体架构**：从输入到输出的完整 pipeline，每个模块的功能和连接方式
3. **核心创新模块**：与已有方法不同的关键设计，为什么这样设计
4. **损失函数**：每一项的含义和权重
5. **训练策略**：优化器、schedule、正则化
6. **推理流程**：与训练的差异（如 teacher forcing vs. autoregressive）

**Phase 2c（宝藏挖掘）** — 实现细节

- 方法章节中内联的超参数（如"我们使用 8 层 Transformer，隐藏维度 512"）
- 初始化策略、梯度裁剪、数值稳定性处理
- 与 baseline 的架构对比（参数量、FLOPs）

**Phase 4（写作）** — Part 3 素材

- 架构图 → 博客的 mermaid/jsxgraph 替代或原图引用
- 核心公式 → 博客的 MathJax 展示
- 算法伪代码 → 博客的代码块

---

### 2.5 Experiments（实验）

**Phase 2c（宝藏挖掘）** — 主战场

精读目标：

1. **数据集详情**
   - 每个数据集的名称、规模、类别数、划分方式
   - 预处理策略（resize、归一化、数据增强）

2. **实验配置表**
   - 评测数据集（名称、规模、划分）
   - 评测指标（名称、方向）
   - Baseline 方法列表
   - 推理硬件（GPU 型号、数量）
   - 推理分辨率
   - 推理环境（框架/版本）

3. **主实验结果表**
   - 逐行提取：方法名、指标名、数值
   - 与 baseline 的对比（提升了多少？在哪些指标上？）
   - 统计显著性（如有）

4. **消融实验**
   - 每个组件的贡献量（去掉哪个掉点最多？）
   - 超参数敏感性分析

5. **失败案例**
   - 作者展示的 failure cases
   - 在哪些场景/类别上表现不佳

**Phase 2a（背景调研）** — 数据集景观

- 该论文使用了哪些数据集？这些数据集在领域中的地位如何？
- 与已有论文使用的数据集对比：更广泛？更窄？

**Phase 2d（方法论）** — baseline 对比验证

- 实验中的 baseline 是否与 Phase 2b 引用链中的前置工作一致？
- 如果实验跳过了某个重要 baseline → 可能是有意回避

**Phase 4（写作）** — Part 6 素材

- 主实验结果表 → 博客的对比表格
- 消融发现 → 博客的"关键发现"叙事
- 可视化结果 → 博客的配图

---

### 2.6 Conclusion + Limitations + Future Work

**Phase 0-1（筛选阶段）** — 快速定位

阅读范围：最后 1-2 段
目标：
- 论文自我评估的局限性是否诚实？
- Future Work 方向是否与我们调研方向相关？

利用方式：
- 如果 Future Work 指向了一个我们正在关注的方向 → 该论文可能是重要的前置工作
- 如果 Limitations 承认了一个领域共性问题 → 记录为开放问题候选

**Phase 2a（背景调研）** — 开放问题来源

精读目标：
1. **作者承认的局限性**
   - 每条局限性的具体描述
   - 这些局限性是方法固有的还是工程问题？
   - 多篇论文的 Limitations 取并集 → 领域共性挑战

2. **Future Work 方向**
   - 作者建议的未来研究方向
   - 这些方向是否已被后续工作实现？（用 web_search 验证）
   - 如果有后续工作实现了 Future Work → 该后续工作应加入论文池

3. **未解决的问题**
   - 论文尝试了但没成功的方法
   - 论文发现的有趣但无法解释的现象

**Phase 2b（引用链）** — 后续工作追踪

- Conclusion 提到的 concurrent work / follow-up → 搜索这些工作
- "Recently, [Z] has shown..." → 搜索 Z 并评估

**Phase 2.4（发现闭环）** — 未来方向缺口

- 多篇论文的 Future Work 交集 → 该领域的核心未解决问题
- 这些交集应体现在我们 survey 的"开放问题"章节中
- 如果某篇论文的 Future Work 已被后续论文解决 → 该后续论文应加入论文池

**Phase 3（survey-spine）** — 开放问题章节

- 多篇论文 Limitations 的去重并集 → survey 的"挑战与局限"章节
- 多篇论文 Future Work 的聚类 → survey 的"未来方向"章节

**Phase 4（写作）** — Part 7 素材

- 局限性分析 → 博客 Part 7（讨论与启发）的核心素材
- 未来方向 → 博客的"展望"叙事

---

### 2.7 References / Bibliography

**Phase 2b（引用链挖掘）** — 引用网络构建

利用方式：
1. **引用频率统计**
   - 跨多篇论文的 references 做引用频率统计
   - 被 5+ 篇论文引用 → 领域 landmark
   - 被 3-4 篇引用 → 重要前置工作

2. **时效性检查**
   - references 中最新论文是什么年份？
   - 如果 references 最新只到 2 年前 → 该论文可能过时
   - 如果 references 覆盖到最近 6 个月 → 该论文的领域覆盖较新

3. **自引率检查**
   - 自引比例过高 → 可能存在学术圈子化
   - 但如果是该领域的开创性团队，自引高是正常的

**Phase 2.4（发现闭环）** — 后向搜索

- References 是被引用的论文列表 → 天然的后向搜索入口
- 与 Google Scholar / Semantic Scholar 的前向引用（谁引用了这篇论文）配合使用

---

### 2.8 Appendix / Supplementary Material

**Phase 2c（宝藏挖掘）** — 实现细节补充

- 正文放不下的超参数细节
- 扩展的消融实验
- 额外的定性结果

**Phase 2d（方法论）** — 数学证明补充

- 核心定理的证明过程
- 算法伪代码的完整版
- 复杂度分析的详细推导

**Phase 4（写作）** — 补充素材

- 额外的架构图或流程图
- 详细的实验结果表格

---

## 3. Survey 论文的特殊阅读策略

Survey / Review 论文与普通研究论文的阅读策略不同：

| 章节 | 普通论文 | Survey 论文 |
|------|---------|------------|
| Introduction | 了解动机和贡献 | 了解调研范围、分类框架、调研方法论 |
| Related Works | 了解前置工作 | **这就是正文** — 即领域 taxonomy |
| Method | 核心技术方案 | 分类标准、比较维度、评估框架 |
| Experiments | 结果和消融 | **benchmark 对比表** — 方法×数据集×指标 |
| Conclusion | 局限和未来 | **开放问题清单** — 领域挑战的权威总结 |
| Tables | 本文结果 | **方法矩阵** — 跨方法的系统性对比 |

Survey 的特殊章节需要额外关注：

1. **Taxonomy / Classification**：Survey 对领域的分类是 Phase 3 survey-spine 的直接输入
2. **Comparison Tables**：Survey 的方法对比表是 Phase 4 写作时方法矩阵的骨架
3. **Timeline / Evolution**：Survey 的发展时间线是博客"时间线"叙事的直接来源
4. **Open Problems**：Survey 总结的开放问题是博客"未来方向"的权威来源
5. **Datasets / Benchmarks**：Survey 汇总的数据集列表是博客"数据集"章节的完整参考

---

## 4. 阅读深度分层

并非所有论文的所有章节都需要同样深度的阅读。按论文角色分层：

### `core-survey`（核心 survey）

所有章节都需要 ★★★ 精读。特别是：
- Related Works → 提取完整 taxonomy
- Comparison Tables → 提取所有方法对比数据
- Open Problems → 提取所有开放问题

### `must-read-paper`（必读论文）

- Introduction ★★★ 精读（动机 + 贡献）
- Method ★★★ 精读（完整技术方案）
- Experiments ★★★ 精读（所有结果 + 消融）
- Related Works ★★ 中度（提取分类 + 引用）
- Conclusion ★★ 中度（局限性 + 未来方向）

### `route-representative`（路线代表）

- Introduction ★★ 中度（了解定位）
- Method ★★ 中度（核心创新点）
- Related Works ★★ 中度（分类框架）
- Experiments ★ 轻读（主结果表即可）
- Conclusion ★ 轻读（局限性即可）

### `context-only`（背景参考）

- Abstract ★★★ 精读
- Introduction ★ 轻读（前 2 段）
- Related Works ★ 轻读（小节标题）
- 其他章节仅在需要时查阅
