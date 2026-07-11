# 分类路径描述与系列组织规范

> **本文件是分类路径内部组织的唯一事实来源。**
> 创建或修改文章前**必须查阅本文件**，确认目标分类路径的覆盖范围、谱段划分、编号规则和已发布清单。
>
> - 分类路径映射表见 `../SKILL.md`
> - 分类通过 `aliases` 中的 `categories/` 路径配置

---

## 编号总则

### 统一编号体系（新体系）

所有深层路径使用同级编号：每个深层路径内独立从 10 开始，步长 10。

- Hub/总览页使用 `sub_id: 0`
- 步长统一为 10
- 不同同级路径的 sub_id 互不影响（可以都是 10、20、30...）
- 同一 3 级路径下如有多个谱段（如红外正文 + 精读），用 sub_id 段区分（正文 10-90，精读 100+）

### Series 匹配决策流程（Agent 必读）

新建文章时，按以下步骤确定正确的 series 分类路径：

#### Step 1：确定领域（顶层分类）

根据文章主题，在下表中匹配领域：

| 关键词 / 主题 | 顶层分类 | 对应章节 |
|---------------|---------|----------|
| 数字人、Talking Head、Lip Sync、肖像动画、语音驱动人像 | `categories/AI/数字人` | §数字人 |
| 动作识别、行为识别、视频分类、Skeleton-Based、时空动作检测 | `categories/AI/动作识别` | §动作识别 |
| 图像压缩、学习式压缩、JSCC、神经编解码、语义通信 | `categories/AI/图像压缩` | §图像压缩 |
| 视觉 Tokenizer、1D Tokenizer、TiTok/DiTok、离散分词器 | `categories/AI/视觉分词器` | §其他已建系列 |
| 扩散模型、Flow Matching、Controllable Generation | `categories/AI/扩散模型` | §未建系列 |
| 课程笔记（DSP、线性代数、机器学习等） | `categories/课程/*` 或 `categories/数学/*` | — |
| 历史叙事 | `categories/历史/*` | — |

> **如果无法匹配**：读 `../SKILL.md` §已有分类路径 完整表，或按主题新建（见 §新建分类规则）。

#### Step 2：确定内容类型（选择谱段）

在同一领域内，根据内容类型选择对应的谱段（深层路径）：

| 内容类型 | 特征 | 谱段选择 | 标题前缀 |
|---------|------|---------|----------|
| 系列综述 / 技术路线综述 | 横向梳理某个领域的多个工作 | 主路径（不加深层） | `<领域>系列（N）：` |
| 单篇论文深度解读 | 深入分析一篇论文的方法、实验、源码 | `<领域>论文精读` | `<领域>论文精读（N）：` |
| 源码解读 / 工程拆解 / Benchmark | 分析 GitHub 仓库源码、部署流程、性能测试 | `<领域>工程解读` | `<领域>工程解读（N）：` |
| 宠物 / 动物行为 | 宠物行为识别、端侧部署 | `宠物动作识别`（仅动作识别领域） | `宠物动作识别（N）：` |

> **例外**：红外图像压缩的谱段在同一 3 级路径下用 sub_id 段区分（正文 10–60，精读 70+），而非拆分为不同深层路径。

#### Step 3：查阅已发布清单，确定 sub_id

1. 在本文件中找到目标路径的"已发布文章清单"
2. 取该路径下当前最大 sub_id + 10 作为新 sub_id
3. **同时运行验证命令**确认无冲突：
   ```bash
   grep -l 'aliases:.*categories/.*<目标路径关键词>' src/pages/*.html | xargs grep -H '^sub_id:' | sort -t: -k3 -n
   ```
4. 若目标路径不在本文件中登记（如视觉分词器、扩散模型等），按"无系列组织"处理：不填 `sub_id`，标题不加编号前缀

#### Step 4：填写 frontmatter

```yaml
---
title: "<系列前缀>（<编号>）：<具体标题>"
aliases: ["categories/AI/<领域>/<谱段>"]
sub_id: <Step 3 确定的编号>
---
```

#### Step 5：同步更新

- 如果该系列有 Hub 页（如 `digital-human-hub.html`），更新 `chapter-list` 和阅读路径
- 运行 `node build.js` 确认无错误
- **更新本文件的已发布清单**（sub_id、alias 路径、标题、文件名）

---

## categories/AI/动作识别

### 描述

覆盖人体和动物的动作识别、行为识别、视频分类、Skeleton-Based AR、时空动作检测。
核心关注点：从 2D CNN 到视频基础模型的技术演进，以及个体特定动作检测、动物行为识别等垂直维度。
与数字人路径的区别：动作识别关注"发生了什么动作"，数字人关注"生成逼真的人像动画"。

### 谱段与系列组织

| 谱段 | alias 路径 | 标题前缀 | sub_id 范围 | 当前最大 | 内容类型 |
|------|-----------|----------|------------|---------|----------|
| 主系列 | `categories/AI/动作识别` | `动作识别系列（N）：` | 10–50 | 50 | Survey/技术路线综述 |
| 论文精读 | `categories/AI/动作识别/动作识别论文精读` | `动作识别论文精读（N）：` | 10–40 | 40 | 单篇论文深度解读 |
| 宠物行为 | `categories/AI/动作识别/宠物动作识别` | `宠物动作识别（N）：` | 10–30 | 30 | 宠物行为识别系列 |
| 工程解读 | `categories/AI/动作识别/动作识别工程解读` | `动作识别工程解读（N）：` | 10+ | — | 框架源码/部署/工程拆解 |

### 已发布文章清单

| sub_id | alias 路径 | 标题 | 文件 |
|--------|-----------|------|------|
| 0 | `categories/AI/动作识别` | 动作识别系列总览（Hub） | action-recognition-hub.html |
| 10 | `categories/AI/动作识别` | 系列（一）：领域导览 | action-recognition-landscape.html |
| 20 | `categories/AI/动作识别` | 系列（二）：动物动作识别 | animal-action-recognition-survey.html |
| 30 | `categories/AI/动作识别` | 系列（三）：粗粒度到细粒度动物行为识别 | coarse-fine-animal-action-review-2025.html |
| 40 | `categories/AI/动作识别` | 系列（四）：视频基础模型时代的动作检测 | video-foundation-model-action-detection.html |
| 50 | `categories/AI/动作识别` | 系列（五）：个体特定动作检测 | instance-specific-action-detection.html |
| 10 | `categories/AI/动作识别/动作识别论文精读` | 精读（一）：VideoMAE | paper-videomae.html |
| 20 | `categories/AI/动作识别/动作识别论文精读` | 精读（二）：SlowFast | slowfast-paper.html |
| 30 | `categories/AI/动作识别/动作识别论文精读` | 精读（三）：IGMN 身份感知动作检测 | paper-igmn-2021.html |
| 40 | `categories/AI/动作识别/动作识别论文精读` | 精读（四）：SkeleTR 两阶段骨架 AR | paper-skeletr-2023.html |
| 10 | `categories/AI/动作识别/宠物动作识别` | 宠物（一）：端侧宠物行为识别 Phase 1 | pet-action-detection-phase1.html |
| 20 | `categories/AI/动作识别/宠物动作识别` | 宠物（二）：mmaction2 到 VideoMamba 选型 | pet-action-detection-model-survey.html |
| 30 | `categories/AI/动作识别/宠物动作识别` | 宠物（三）：PMTNet 猫咪行为识别 | pmtnet-2026-cat-behavior.html |

### 新增文章规则

1. **先判断内容类型**：系列综述 vs 论文精读 vs 工程解读 vs 宠物行为
2. **确定谱段**：
   - 系列综述 → `categories/AI/动作识别`，sub_id 在 10–999（当前下一个：60）
   - 论文精读 → `categories/AI/动作识别/动作识别论文精读`，sub_id 从 50 开始
   - 宠物行为 → `categories/AI/动作识别/宠物动作识别`，sub_id 从 40 开始
   - 工程解读 → `categories/AI/动作识别/动作识别工程解读`，sub_id 从 10 开始
3. **标题格式**：`系列前缀（编号）：具体标题`
4. **aliases**：添加对应的 `categories/` 路径
5. Hub 页（`action-recognition-hub.html`）需同步更新目录

### Frontmatter 示例

```yaml
# 主系列文章
aliases: ["categories/AI/动作识别"]
sub_id: 60

# 论文精读
aliases: ["categories/AI/动作识别/动作识别论文精读"]
sub_id: 50

# 宠物行为
aliases: ["categories/AI/动作识别/宠物动作识别"]
sub_id: 40
```

---

## categories/AI/数字人

### 描述

覆盖数字人、Talking Head、Lip Sync、Avatar、肖像动画、语音驱动人像生成。
核心关注点：从 GAN 到扩散模型的数字人生成技术演进，以及实时推理、工程部署、质量评估等实践维度。
与动作识别路径的区别：数字人关注"生成逼真人像"，动作识别关注"识别视频中的动作"。

### 谱段与系列组织

| 谱段 | alias 路径 | 标题前缀 | sub_id 范围 | 当前最大 | 内容类型 |
|------|-----------|----------|------------|---------|----------|
| 主系列 | `categories/AI/数字人` | `数字人系列（N）：` | 10–150 | 150 | Survey/技术路线综述 |
| 论文精读 | `categories/AI/数字人/数字人论文精读` | `数字人论文精读（N）：` | 10–430 | 430 | 单篇论文深度解读 |
| 工程解读 | `categories/AI/数字人/数字人工程解读` | `数字人工程解读（N）：` | 10–90 | 90 | 源码解读/工程拆解/Benchmark |

Hub 页（`digital-human-hub.html`）使用 `sub_id: 0`。
Brainstorm 页使用 `sub_id: 5`。

### 新增文章规则

1. **先判断内容类型**：论文精读 vs 工程/源码解读 vs 系列综述
2. **确定谱段**：
   - 系列综述 → `categories/AI/数字人`，sub_id 在 10–999 区间（当前下一个：160）
   - 论文精读 → `categories/AI/数字人/数字人论文精读`，sub_id 从 440 开始
   - 工程解读 → `categories/AI/数字人/数字人工程解读`，sub_id 从 100 开始
3. **标题格式**：`系列前缀（编号）：具体标题`
4. **aliases**：添加对应的 `categories/` 路径
5. GitHub 源码解读默认归入工程解读
6. Hub 页需同步更新目录

---

## categories/AI/图像压缩

### 描述

覆盖学习式压缩、语义通信、JSCC、神经编解码、传统编码（JPEG/H.264/HEVC/AV1）。
核心关注点：从信息论到 AI 生成式压缩的技术演进，红外/轮廓等特殊图像压缩，以及语义通信与联合信源信道编码。
包含红外图像压缩子系列，覆盖热辐射成像、轮廓编码等特殊场景。

### 谱段与系列组织

| 谱段 | alias 路径 | 标题前缀 | sub_id 范围 | 当前最大 | 内容类型 |
|------|-----------|----------|------------|---------|----------|
| 主系列 Hub | `categories/AI/图像压缩` | `图像压缩系列总览` | 0 | 0 | 总览 |
| 基础系列 | `categories/AI/图像压缩/图像压缩基础系列` | `图像压缩基础系列（N）：` | 0–80 | 80 | 基础知识教程 |
| 专题 | `categories/AI/图像压缩/图像压缩专题` | `图像压缩专题（N）：` | 10–70 | 70 | 技术专题综述 |
| 论文精读 | `categories/AI/图像压缩/图像压缩论文精读` | `图像压缩论文精读（N）：` | 10–180 | 180 | 单篇论文深度解读 |
| 红外正文 | `categories/AI/图像压缩/红外图像压缩` | `红外图像压缩系列（N）：` | 0–60 | 60 | 红外压缩技术路线 |
| 红外精读 | `categories/AI/图像压缩/红外轮廓图像压缩` | `红外轮廓图像压缩论文精读（N）：` | 70–180 | 180 | 红外压缩单篇精读 |

Hub 页（`image-compression-hub.html`）使用 `sub_id: 0`。
基础系列 Hub（`compression-hub.html`）使用 `sub_id: 0`。
红外子系列 Hub（`infrared-compression-hub.html`）使用 `sub_id: 0`。

> **红外精读编号说明**：红外正文使用 sub_id 10–60（6 篇），红外精读使用 sub_id 70–180（11 篇），两者在同一 3 级路径下通过 sub_id 段区分。

### 新增文章规则

1. **先判断内容类型**：基础教程 vs 专题综述 vs 论文精读 vs 红外子系列
2. **确定谱段**：
   - 基础教程 → `categories/AI/图像压缩/图像压缩基础系列`，sub_id 从 90 开始
   - 专题综述 → `categories/AI/图像压缩/图像压缩专题`，sub_id 从 80 开始
   - 论文精读 → `categories/AI/图像压缩/图像压缩论文精读`，sub_id 从 190 开始
   - 红外正文 → `categories/AI/图像压缩/红外轮廓图像压缩`，sub_id 从 70 开始
   - 红外精读 → `categories/AI/图像压缩/红外轮廓图像压缩`，sub_id 从 190 开始
3. **标题格式**：`系列前缀（编号）：具体标题`
4. **aliases**：添加对应的 `categories/` 路径
5. 主 Hub 和红外 Hub 需同步更新目录

---

## 其他已建系列分类

### categories/AI/视觉分词器

**描述**：视觉 Tokenizer、离散分词器、1D Tokenizer、TiTok/DiTok 等。将连续图像编码为离散 token 序列。
**编号**：27 篇文章，暂无系列前缀和 sub_id 编号体系。文章按发布时间排列。
**新建规则**：若积累到 5+ 篇同类文章，应考虑建立系列组织并更新本文件。

---

## 未建系列分类

以下分类尚未建立成体系的系列组织，新增文章按已有惯例填写 `sub_id`（若无则留空）：

- **categories/AI/扩散模型**：尚无 sub_id 编号，文章按发布时间排列
- **categories/AI/大语言模型**：课程笔记类使用 `ChN` 前缀，无 sub_id 编号
- **categories/AI/微调**：暂无系列组织
- **categories/AI/Agent**：暂无系列组织
- **categories/AI/AI Infra**：暂无系列组织
- **categories/AI/多模态**：暂无系列组织
- **其他 AI 子分类**（GAN、强化学习、视觉模型、自回归、架构）：暂无系列组织

如果某个分类积累到 5 篇以上同类文章，应考虑建立系列组织（含深层路径或谱段划分）并更新本文件。

---

## 迁移说明

### 从旧编号体系迁移到新体系（已完成）

已完成从旧编号体系（sub_id 跨系列分段：1000-1999、2000-2999、3000-3999）到新体系（深层路径 + 同级编号）的迁移：

- 原 1000-1999 区间的文章 → 迁移到 3 级路径（如 `数字人论文精读`），sub_id 重新从 10 开始编号
- 原 2000-2999 区间的文章 → 迁移到 3 级路径（如 `数字人工程解读`），sub_id 重新从 10 开始编号
- 原 3000-3999 区间的文章 → 迁移到对应 3 级路径，sub_id 重新编号
- 主系列（10-999）保持不变，不添加更深层路径
- 迁移脚本：`scripts/migrate-to-deep-paths.py`

### 从 frontmatter categories/subcategory 字段迁移（已完成）

已完成的批量迁移（`scripts/migrate-to-alias-paths.py`）：
- 从 `categories` + `subcategory` + `subsubcategory` frontmatter 字段
- 拼接为 `categories/{cat}/{sub}/{subsub}` alias 路径
- 合并到 `aliases` 数组
- 从 frontmatter 中移除旧字段
- 保留 `sub_id`
