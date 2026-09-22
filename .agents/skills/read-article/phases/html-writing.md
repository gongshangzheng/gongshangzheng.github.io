---
name: read-article-html-writing
description: Phase 6 HTML 撰写按需参考。配合 read-article/SKILL.md 使用。
---

# Phase 6 · HTML 撰写

> **定位**：read-article 新流程 Phase 6 的按需参考。本文件提供教学式写作规范、组件使用指南、
> 章节写作指引和自检清单。**写作由主 agent 直接完成**，不再默认拆分成多个写作 subagent。

> ⚠️ **前置条件**：
> 1. 已读取 `~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md`
> 2. 已完成 Phase 5，OpenSpec change 的「文章内容大纲」已获用户正式确认
> 3. 已用 capture.js 创建 HTML 骨架

**写作数据源**（按优先级）：

1. change 的「文章内容大纲」——决定写哪几节
2. `raw/<slug>/sources/`——最终校验层
3. `raw/<slug>/analysis/`——事实存储层
4. `raw/<slug>/synthesis.md`——仅导航，不用作内容输入
5. `raw/<slug>/planning-draft.md`——已确认的决策与口径

---

## 1. 创建 HTML 骨架

```bash
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --notify
```

产出：`~/gongshangzheng.github.io/src/pages/<slug>.html`

---

## 2. Frontmatter 填写

规范以 SKILL.md「Frontmatter 规范」为准（标题系列规则、`paper_*` 字段、`sub_id` 编号、`hub`、`tags` ≤5）。填写检查项：

| # | 检查项 |
|---|--------|
| 1 | `title` 写入最终标题，符合系列命名规则 |
| 2 | `description` 一句话概括 |
| 3 | `created_at` / `updated_at` 格式为 `YYYY-MM-DDTHH:mm:ss` |
| 4 | `aliases` 从 blog-categories skill 选取；`sub_id` 已用 `scripts/check-sub-id.py --suggest` 校验（步长 10，同系列无重复） |
| 5 | `tags` 3-5 个 |
| 6 | 含公式则 `mathjax: true` |
| 7 | `hero_title` / `hero_sub` / `hero_tagline` 填写 |
| 8 | `papers` 填写论文的 arXiv/DOI 链接（必填）；有开源代码则填 `repos` |
| 9 | `paper_*` 可选字段填写（由构建系统渲染为正文顶部「论文信息」info-box，勿在正文重复手写） |
| 10 | `hub` 填写系列 Hub 页 slug（系列文章必填） |
| 11 | 用到可选 CSS 模块时填写 `css_modules` |

**论文解读文章的 frontmatter 模板**：

```yaml
---
title: "<论文短标题> 深度解读"
description: "一句话概括论文核心贡献"
created_at: <YYYY-MM-DDTHH:mm:ss>
updated_at: <YYYY-MM-DDTHH:mm:ss>
tags: [<领域>, <方法>, <关键技术>]
aliases: ["categories/AI/<从 blog-categories 选取>"]
papers: ["https://arxiv.org/abs/xxxx.xxxxx"]
repos: []
hub: <hub-page-slug>  # 系列文章必填，独立文章省略
paper_title: "<论文原标题>"
paper_authors: "<作者，逗号分隔>"
paper_affiliation: "<单位，分号分隔>"
paper_venue: "<期刊/会议 + 年份>"
paper_url: "https://arxiv.org/abs/xxxx.xxxxx"
paper_code: "<开源状态或仓库 URL>"
mathjax: true
hero_title: "<论文短标题>"
hero_sub: "<会议/年份 · 团队>"
hero_tagline: "<核心贡献一句话>"
---
```

---

## 3. 写作风格：教学式深度解读

### 读者假设

- 有基础 ML/DL 背景
- 对该细分领域**不了解或仅了解皮毛**
- 希望读完能给别人讲清楚这篇论文

### 段落级逻辑模板

每个主要章节遵循 **Motivation → Intuition → Mechanism** 三层递进：

1. **Motivation**（为什么需要这个方法）
   - 上一代方法留下什么问题？
   - 这个问题的本质是什么？
   - 如果不解决会怎样？

2. **Intuition**（核心思想）
   - 用类比让非专家理解（如："Q-Former 就像一个信息漏斗，只让与语言相关的视觉信息通过"）
   - 与读者已有知识的连接点
   - 为什么这个思路是自然的？

3. **Mechanism**（技术细节）
   - 具体架构设计
   - 数学公式（先解释意图，再给公式）
   - 关键工程选择及其原因

### 教师口吻

- 使用"我们可以看到..."、"这意味着..."、"一个自然的疑问是..."
- 主动指出易混淆点和常见误解
- 引入新概念时，先给直觉再给定义
- 使用对比帮助理解

### 禁止的写法

- ❌ "X 提出了 Y 方法，使用了 Z 技术，取得了好的效果。"（平铺直叙）
- ❌ 连续罗列论文贡献，没有叙事逻辑
- ❌ 直接上公式不解释意图（公式轰炸）
- ❌ 大段翻译论文的段落，没有重组

### 推荐的写法

- ✅ 先用文字描述公式意图，再给数学表达
- ✅ "反直觉发现：..." 主动指出令人意外的实验结果
- ✅ 用类比解释抽象概念
- ✅ 每个段落承载一个完整的"认知单元"，段间有逻辑连接

---

## 3.1 论文文章组件使用指南

核心原则：**组件服务于教学节奏，公式和结论用块包裹，直觉和过渡用裸段落。**

### 组件角色表

| 组件 | 在论文文章中的角色 | 使用频率 |
|------|-------------------|----------|
| `.ch` + `.ch-title` | 每个逻辑章节（引言/方法/实验/讨论） | 每节一个 |
| `.ch-subtitle` / `h3` | 章节内部的模块分块 | 按需 |
| `.def-box` | 论文提出的核心定义、损失函数、优化目标 | 方法章节高频 |
| `.theorem-box` | 论文的核心定理、收敛性保证、理论分析 | 有理论贡献的论文 |
| `.callout` | Insight 提炼、反直觉发现、关键数字 | 一句话级别，控制数量 |
| `admonition tip` | 复现经验、训练技巧、高效实现路径 | 多段时使用 |
| `admonition warning` | 论文未讨论的局限性、复现坑点 | 需要强调时 |
| `.example-box` | 代码片段、具体计算示例、算法伪代码 | 有代码分析时 |
| `.table-wrap` | 实验结果对比表、超参数表、方法对比表 | 高频 |
| `.photo` | 论文原图、架构图、结果可视化 | 紧跟相关段落 |
| `.quote` | 论文原文关键句（精确引用时） | 需要逐字引用时 |
| `{{< mermaid >}}` | 方法 pipeline 流程图、模块架构 | 代码绘制首选 |
| `{{< details >}}` | 证明细节、补充推导、完整伪代码 | 不打断主线 |
| `{{< jsxgraph >}}` | 数学函数可视化、信号/分布图 | 涉及可视觉化的数学时 |

### 教学节奏原则

1. **每个方法模块遵循 Motivation → Intuition → Mechanism 三层递进。**
2. **公式前先说意图，公式后解释符号。**
3. **实验表格不只是列数据。** 每个关键数字要指出"这说明什么"。
4. **补充推导和证明用 `{{< details >}}`。**
5. **论文原文的关键句用 `.quote` 精确引用。**

### 组件与论文章节的映射

| 论文章节 | 推荐组件组合 |
|---------|------------|
| 引言 + 背景 | 裸段落（叙事）+ `.quote` + `.callout`（核心 Insight 预告） |
| 问题分析 | `.table-wrap`（已有方法对比）+ `.callout`（局限性总结） |
| 方法核心 | `.def-box` + `.callout` + `{{< mermaid >}}` + `{{< details >}}` |
| 训练细节 | `.table-wrap`（超参数表）+ `admonition tip` |
| 实验分析 | `.table-wrap`（结果表）+ `.photo` + `.callout`（关键发现） |
| 讨论与总结 | 裸段落 + `admonition warning`（局限）+ `.callout`（启发） |

### 反面示例

```html
<!-- ❌ 公式裸露，没有意图解释 -->
<p>作者提出了以下损失函数：</p>
<p style="text-align:center">\[ L = \frac{1}{N}\sum_{i=1}^{N}||f(x_i) - y_i||^2 + \lambda||\theta||^2 \]</p>
<p>其中 $f$ 是编码器，$x_i$ 是输入。</p>

<!-- ✅ 先说意图，再用 def-box 包裹 -->
<p>为了让编码器学到与下游任务无关的通用表示，作者设计了一个简单但有效的重建目标：最小化输入与重建之间的均方误差，同时用 $L_2$ 正则化防止过拟合。</p>
<div class="def-box">
  <h3>重建损失函数</h3>
  <p style="text-align:center">\[ L = \frac{1}{N}\sum_{i=1}^{N}||f(x_i) - y_i||^2 + \lambda||\theta||^2 \]</p>
  <p>其中 $f$ 为编码器，$x_i$ 为输入样本，$y_i$ 为重建目标，$\lambda$ 为正则化系数。</p>
</div>

<!-- ❌ 实验表格没有解读 -->
<div class="table-wrap"><table>...BLEU 分数对比...</table></div>
<p>从上表可以看出，本文方法在所有指标上都取得了最好的结果。</p>

<!-- ✅ 表格后提炼关键发现 -->
<div class="table-wrap"><table>...BLEU 分数对比...</table></div>
<div class="callout"><strong>关键发现：</strong>本文方法在 WMT14 En-De 上比基线高 1.2 BLEU，且推理速度快 3 倍——说明效率提升来自架构设计而非牺牲质量。</div>
```

---

## 4. 章节写作指引

### 引言章节

- 一句话说明论文要解决什么问题
- 为什么这个重要/有趣
- 核心 Insight 预告（先给结论再展开）
- 字数：≥ 250 字

### 问题分析 / Insight 章节

- 现有方法为什么不够好（用表格对比更佳）
- 论文看到的突破口
- 用类比让读者直觉理解
- 字数：≥ 250 字

### 方法核心章节（重点）

- **完整 pipeline 描述**：输入 → 输出全链路
- **逐模块展开**：每个模块的功能、输入输出、设计动机
- **公式处理**：每个公式前先解释意图，后给数学表达，再附一句话解释符号
- **架构图**：优先使用论文原图，辅以 mermaid 代码绘制
- 字数：≥ 1000 字
- 至少 2 个完整公式（非综述类论文；若论文核心不是数学公式驱动，可用损失函数/训练目标/打分函数替代）

### 训练章节

- 数据集、超参数、计算成本（必须包含具体数值）
- 缺少的信息标注"原文未明确给出"
- 必须含训练配置披露表（10 项基础项，逐项标注）
- 字数：≥ 500 字

### Inference Pipeline 章节

- 输入准备→生成/解码→后处理→输出
- 实时论文须含 Streaming Pipeline（chunk、cache、causal mask、首帧延迟、RTF 等）
- 字数：≥ 500 字（实时论文 ≥ 700 字）

### 实验分析章节

- 实验配置表（6 项必含基础项：评测数据集 / 评测指标 / Baseline 方法 / 推理硬件 / 推理分辨率 / 推理环境），逐项标注"已披露"或"未披露"
- 主实验结果（对比表含具体数值）
- 消融实验（每个组件贡献和去掉后掉点幅度）
- 定性分析 + 失败案例
- 数字人 / talking head / avatar 论文的实验不能只看 FID。必须按任务同时检查：画质与分布距离（FID/FVD/LPIPS/PSNR 等）、音画同步（LSE-C/LSE-D/SyncNet 等）、身份保持（CSIM/ArcFace 等）、动作/姿态/表情自然度、长时稳定性、实时性/延迟/显存/吞吐。若论文只报告 FID 或 FVD，必须明确说明该指标不能覆盖口型同步、身份一致性、动作合理性和交互体验
- 字数：≥ 600 字

### 讨论与总结章节

- 论文自己的结论 + 局限性分析
- 具体可操作的启发（"可以在 XX 场景中尝试 XX 技术"）
- 未来方向
- 字数：≥ 300 字

---

## 5. 配图实施

### 配图三步流程

1. **Phase 1 已收集的图片**：从 `raw/<slug>/images/<slug>/` 选取
2. **按 change 大纲的配图计划放置**：每张图紧跟相关段落
3. **补充代码绘制**：用 mermaid / jsxgraph 绘制架构图/流程图

### 图片处理

```bash
# 复制最终图片到博客 assets
mkdir -p ~/gongshangzheng.github.io/media/images/<slug>/
cp ~/gongshangzheng.github.io/raw/<slug>/images/<slug>/* ~/gongshangzheng.github.io/media/images/<slug>/
```

### 图片 HTML 格式

```html
<div class="photo">
  <img src="media/images/<slug>/<filename>" alt="描述" loading="lazy">
  <div class="cap">图 N：图片描述（来源：论文名, Fig.N）</div>
</div>
```

### 图片理解协议

写正文前必须区分"已经拿到图片"和"已经理解图片"。当图片用于解释方法或实验趋势时：

1. 先读 figure caption 与正文引用该图的段落。
2. 对本地图片调用视觉理解工具，**首选 `read` 工具直接读取图片**，备选 GLM MCP `image_analysis`。
3. 可用 GLM MCP 的专项工具作为第二通道交叉验证，尤其用于架构图和曲线图。
4. 图片中文字过小或区域复杂时，先 crop / 放大局部，再做视觉理解或 OCR。
5. 视觉理解结果只能作为辅助解释，必须与论文正文、caption、表格、appendix 互相校验。
6. 不确定处必须标注，不得把视觉模型推测写成论文事实。

### 图片理解 prompt 模板（read 工具）

```
请分析这张论文图：
1. 识别图中所有模块、箭头、输入输出和文字标签；
2. 说明每个模块在论文方法中的作用；
3. 提取图中可见的数值/曲线趋势/阶段划分；
4. 标注哪些信息只是图示推断，哪些能由图中文字直接支持；
5. 不要臆测图中没有的信息。
```

### 代码绘制格式

**Mermaid（架构/流程图）**：
```html
{{< mermaid >}}
graph TD
    A[输入] --> B[模块1]
    B --> C[模块2]
    C --> D[输出]
{{< /mermaid >}}
```

**JSXGraph（数学函数/信号图）**：
```html
{{< jsxgraph title="标题" height="300" >}}
// JSXGraph JavaScript code
{{< /jsxgraph >}}
```

---

## 6. 参考来源

文末必须使用 `.sources` 组件，每条带 `data-cite-key`：

```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li data-cite-key="<Key>"><a href="https://arxiv.org/abs/XXXX.XXXXX" target="_blank">作者 et al. "论文标题." 会议 年份.</a></li>
    <li data-cite-key="<Key2>"><a href="https://..." target="_blank">相关资源链接</a></li>
  </ul>
</div>
```

---

## 7. 章节导航（chapter-nav）

文章末尾（参考来源之后）必须添加章节导航组件：

```html
<div class="chapter-nav">
  <a class="nav-card nav-prev" href="prev-article.html"><span class="nav-arrow">←</span><span class="nav-label">上一篇</span><span class="nav-title">上一篇标题</span></a>
  <a class="nav-card nav-hub" href="hub-page.html"><span class="nav-label">枢纽页</span><span class="nav-title">枢纽页标题</span></a>
  <a class="nav-card nav-next" href="next-article.html"><span class="nav-arrow">→</span><span class="nav-label">下一篇</span><span class="nav-title">下一篇标题</span></a>
</div>
```

**规则**：

- 属于系列文章时：prev 指同系列上一篇，hub 指系列枢纽页，next 指下一篇
- 独立论文解读时：hub 指向 subcategory 枢纽页或分类页，prev/next 可省略
- 占位符（无链接）使用 `<div class="nav-card current">`，渲染为半透明虚线边框
- **class 必须包含方向**：`nav-prev`、`nav-hub`、`nav-next`，不能只写 `nav-card`

---

## 8. Markdown → HTML 组件映射表（仅当使用 Markdown 中间稿时）

**默认由主 agent 直接写 HTML，不需要本表。** 仅当确实先生成了 Markdown 片段（例如按需委派了某个写作 lane）时，才按以下映射合并：

| Markdown 语法 | HTML 组件 |
|---------------|-----------|
| `## 标题` | `<div class="ch fade-in"><div class="ch-title">标题</div>...</div>` |
| `### 子标题` | `<h3 class="section-title">子标题</h3>` |
| `> **关键发现**：xxx` | `<div class="callout"><strong>关键发现：</strong>xxx</div>` |
| ` ```mermaid ... ``` ` | `{{< mermaid >}}...{{< /mermaid >}}` |
| `$公式$` (行内) | `\(公式\)` |
| `$$公式$$` (块级) | `\[公式\]` |
| `\| 表格 \|` | `<div class="table-wrap"><table>...</table></div>` |
| `- [x] 检查项` | `<div class="def-box"><h3>标题</h3>...</div>` |
| `1. 步骤一` | `<ol><li>步骤一</li></ol>` |
| `![描述](图片路径)` | `<div class="photo"><img src="路径" alt="描述" loading="lazy"><div class="cap">描述</div></div>` |

合并时还必须：统一术语、填写 frontmatter、验证组件语法、扫一遍最终 HTML 修正裸数学符号。

---

## 9. 写作自检

写完 HTML 后，先自行检查下表；随后进入 Phase 7，按 `references/review-checklist.md` 做完整的三维审校。

| 检查项 | 要求 |
|--------|------|
| 总字数 | 常规论文 ≥ 3000 字；复杂系统/综述论文 ≥ 4000 字 |
| 结构对齐 | 与 change 已确认大纲逐节一致；偏离须先走 `openspec-update-change` |
| 配图数 | ≥ 3 张 |
| 代码绘制 | ≥ 1 张 |
| 公式数 | ≥ 2 个（非综述类） |
| 对比表 | ≥ 1 个（含具体数值） |
| 训练配置披露表 | 10 项基础项逐项标注 |
| 实验配置表 | 6 项基础项逐项标注 |
| 超参数 | ≥ 3 个具体值 |
| 消融实验 | ≥ 1 个发现 |
| 参考来源 | 使用 `.sources` 组件且每条带 `data-cite-key` |
| 章节导航 | 使用 `.chapter-nav` + nav-prev/nav-hub/nav-next |
| 未披露项 | 标注"未披露"，不臆测 |

通过自检后，进入 Phase 7（统一审校）。
