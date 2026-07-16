---
name: blog-categories
description: |
  博客分类体系的唯一事实来源（Single Source of Truth）。
  基于 alias 路径的任意深度分类系统：aliases 中的 categories/ 路径决定文章在分类树中的位置。
  翻译注册表 data/category-names.json 存储中文名→英文 slug 映射，无翻译时回退拼音。
  URL 用英文/pinyin slug，侧边栏等显示中文。sub_id 仅在同级排序。
  所有需要填写或校验分类的 skill（html-blog、content-creator、deep-research 等）必须读取本 skill。
  MANDATORY TRIGGERS: 分类, category, categories, subcategory, subsubcategory, 博客分类, 分类体系, 选分类, 归类, categorize
version: 3.2.0
category: blog-taxonomy
tags: [blog, taxonomy, categories, aliases, alias-path]
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# 博客分类体系

> 本文档是博客分类规范的**唯一事实来源**。
> 分类通过 `aliases` 字段中的 `categories/` 路径配置，不再使用 `categories`/`subcategory`/`subsubcategory` frontmatter 字段。

## 核心设计

- **alias 路径即分类**：`aliases: ["categories/AI/动作识别/宠物动作识别"]` 决定文章在分类树中的位置
- **hub 页覆盖**：`aliases: ["categories/AI/动作识别/index"]` 替换该层级的索引页
- **翻译注册表**：`data/category-names.json` 存储中文名→英文 slug 映射，无翻译时回退拼音
- **显示用中文，URL 用英文/pinyin**
- **sub_id 保留**，仅在同级（同一父节点下）排序
- **深度不限**：路径段数决定层级深度

### 废弃字段

`categories`、`subcategory`、`subsubcategory` 从 frontmatter 中移除。这些信息从 `categories/` 前缀的 alias 派生。

---

## 分类路径规范

### 普通文章

在 `aliases` 中添加 `categories/` 前缀的路径：

```yaml
---
title: "VideoMAE 论文精读"
aliases: ["categories/AI/动作识别/动作识别论文精读"]
sub_id: 10
tags: [VideoMAE, 自监督, 视频理解]
---
```

路径段数决定层级深度：
- `categories/AI` → 顶层分类
- `categories/AI/动作识别` → 二级分类
- `categories/AI/动作识别/宠物动作识别` → 三级分类
- 更深层级以此类推

### Hub 页（索引页覆盖）

Hub 页用 `/index` 后缀的 alias 覆盖分类索引页：

```yaml
---
title: "动作识别系列总览"
aliases: ["动作识别", "categories/AI/动作识别/index", "categories/AI/动作识别"]
sub_id: 0
---
```

- `categories/AI/动作识别/index` → 替换 `categories/ai/action-recognition/index.html`
- `categories/AI/动作识别` → 标记此文章也属于该分类

---

## 翻译注册表

`data/category-names.json` 存储中文分类名→英文 slug 的映射。构建时先查此文件，无翻译时回退拼音转换。

### 完整翻译表（68 条，按分类分组）

**AI 分类（25 条）**

| 中文名 | slug |
|--------|------|
| AI | ai |
| 动作识别 | action-recognition |
| 动作识别论文精读 | action-recognition-paper-reading |
| 动作识别工程解读 | action-recognition-engineering |
| 宠物动作识别 | pet-action-recognition |
| 数字人 | digital-human |
| 数字人论文精读 | digital-human-paper-reading |
| 数字人工程解读 | digital-human-engineering |
| 图像压缩 | image-compression |
| 图像压缩论文精读 | image-compression-paper-reading |
| 图像压缩调研 | image-compression-research |
| 红外图像压缩 | infrared-image-compression |
| 扩散模型 | diffusion-model |
| 视觉分词器 | visual-tokenizer |
| 视觉模型 | visual-model |
| 自回归 | autoregressive |
| GAN | gan |
| 强化学习 | reinforcement-learning |
| 微调 | fine-tuning |
| 大语言模型 | llm |
| Agent | agent |
| AI Infra | ai-infra |
| 多模态 | multimodal |
| 架构 | architecture |
| 论文每日摘要 | arxiv-daily |

**课程分类（13 条）**

| 中文名 | slug |
|--------|------|
| 课程 | courses |
| 数字信号处理 | dsp |
| 认知科学 | cognitive-science |
| 等几何分析 | iga |
| 机器学习 | machine-learning |
| 信息论 | information-theory |
| 旋量代数 | screw-algebra |
| 通信原理 | communication-principles |
| 编程 | programming |
| 论文写作 | paper-writing |
| 计算机系统 | computer-systems |
| 法理学 | jurisprudence |
| 基础 | fundamentals |

**数学分类（7 条）**

| 中文名 | slug |
|--------|------|
| 数学 | math |
| 线性代数 | linear-algebra |
| 概率论 | probability |
| 高等数学 | advanced-math |
| 群论 | group-theory |
| 图论 | graph-theory |
| 数值分析 | numerical-analysis |

**编程分类（8 条）**

| 中文名 | slug |
|--------|------|
| 前端 | frontend |
| Go | go |
| 编辑器 | editor |
| 工具 | tools |
| 算法 | algorithms |
| 实时通信 | realtime-communication |
| BuildYourOwnLisp | buildyourownlisp |
| PHP | php |

**历史分类（6 条）**

| 中文名 | slug |
|--------|------|
| 历史 | history |
| 中国史 | chinese-history |
| 日本史 | japanese-history |
| 世界史 | world-history |
| 军事 | military |
| 文化 | culture |

**语言分类（3 条）**

| 中文名 | slug |
|--------|------|
| 语言 | languages |
| 法语 | french |
| 日语 | japanese |

**杂识分类（6 条）**

| 中文名 | slug |
|--------|------|
| 杂识 | misc |
| 音乐 | music |
| 经济学 | economics |
| 哲学 | philosophy |
| 博客 | blog |
| 科研 | research |

### 翻译优先级

1. **翻译注册表优先**：`data/category-names.json` 中有对应条目时，直接使用英文 slug
2. **拼音回退**：无翻译时，自动用 `pinyin-pro` 转换为拼音 slug（如 `数值分析` → `shu-zhi-fen-xi`）
3. **slug 缓存**：最终 slug 缓存在 `data/taxonomy-slugs.json` 的 `categorySlugs` 扁平映射中，确保同一分类名始终使用同一 slug

### 翻译维护流程

新增分类名时，**必须**同步更新翻译注册表：

1. 在 `data/category-names.json` 中添加 `"中文名": "english-slug"` 条目
2. 删除 `data/taxonomy-slugs.json`（强制重建 slug 缓存）
3. 运行 `node build.js` 重建
4. 验证 `public/categories/` 下生成的目录名是否为英文 slug

> **注意**：如果仅修改了 `category-names.json` 但未删除 `taxonomy-slugs.json`，旧的拼音 slug 会被缓存复用，不会更新为新的翻译。

---

## 已有分类路径

以下是已建立的分类路径（路径用中文名，构建时自动转换为 slug）：

| 顶层分类 | 子分类 | 覆盖范围 |
|---------|--------|----------|
| **AI** | `视觉分词器` | 视觉 Tokenizer、离散分词器、1D Tokenizer、TiTok/DiTok 等 |
| | `扩散模型` | 扩散模型、Flow Matching、Controllable Generation |
| | `视觉模型` | 目标检测、视频理解、姿态估计、YOLO/DETR 等 |
| | `动作识别` | 动作识别、行为识别、视频分类、Skeleton-Based、时空动作检测 |
| | `动作识别/动作识别论文精读` | 动作识别单篇论文深度解读 |
| | `动作识别/宠物动作识别` | 宠物行为识别系列 |
| | `自回归` | 自回归视觉模型、AR 生成 |
| | `图像压缩` | 学习式压缩、语义通信、JSCC、神经编解码（主系列） |
| | `图像压缩/图像压缩基础系列` | 基础知识教程 |
| | `图像压缩/图像压缩专题` | 技术专题综述 |
| | `图像压缩/图像压缩论文精读` | 单篇论文深度解读 |
| | `图像压缩/红外图像压缩` | 红外压缩技术路线 + 精读 |
| | `GAN` | 生成对抗网络、对抗式训练 |
| | `强化学习` | 强化学习、RLHF、PPO、World Model |
| | `微调` | LoRA、QLoRA、DoRA、PEFT、Adapter、Prefix Tuning |
| | `大语言模型` | LLM、上下文学习、越狱等 |
| | `Agent` | AI Agent、LLM Agent、Tool Use、MCP |
| | `AI Infra` | AI 基础设施、LLMOps、推理系统 |
| | `多模态` | 多模态大模型、VLM、视觉语言模型 |
| | `数字人` | 数字人、Talking Head、Lip Sync、Avatar（主系列） |
| | `数字人/数字人论文精读` | 单篇论文深度解读 |
| | `数字人/数字人工程解读` | 源码解读/工程拆解/Benchmark |
| | `架构` | Transformer、MoE、蒸馏、数据集、框架 |
| | `论文每日摘要` | 每日/每周 arXiv 摘要 |
| **编程** | `前端` | HTML/CSS/JS/PHP、前端框架 |
| | `Go` | Go 语言、Golang |
| | `编辑器` | 编辑器、Emacs/Vim |
| | `工具` | Git/Hugo/Rime、命令行工具 |
| | `算法` | 数据结构、算法笔记 |
| | `实时通信` | RTC、WebRTC、音视频传输 |
| | `BuildYourOwnLisp` | Build Your Own Lisp 课程笔记 |
| | `PHP` | PHP 语言、Web 后端 |
| **历史** | `中国史` | 中国史、南北朝、宋史 |
| | `日本史` | 日本史、战国 |
| | `世界史` | 世界史、二战、冷战 |
| | `军事` | 军事史、武器 |
| | `文化` | 文化史、医疗史、游戏史 |
| **课程** | `数字信号处理` | DSP |
| | `认知科学` | 认知心理学、认知科学 |
| | `等几何分析` | 等几何分析、GAMES302 |
| | `机器学习` | 机器学习基础、损失函数 |
| | `信息论` | 信息论、香农理论 |
| | `旋量代数` | 旋量代数、李群、李代数 |
| | `通信原理` | 通信原理、数字通信 |
| | `编程` | Lisp、解析器、编程语言课程 |
| | `论文写作` | 学术论文写作 |
| | `计算机系统` | 操作系统、体系结构 |
| | `法理学` | 法理学、法学基础 |
| | `基础` | 编程语言基础、算法入门 |
| **数学** | `数学` | 微积分、数学基础 |
| | `线性代数` | 线性代数、矩阵论 |
| | `概率论` | 概率论、数理统计 |
| | `高等数学` | 高等数学 |
| | `群论` | 群论、抽象代数 |
| | `图论` | 图论、图算法 |
| | `数值分析` | 数值分析、计算方法 |
| **语言** | `法语` | 法语学习、二语习得 |
| | `日语` | 日语学习、二语习得 |
| **杂识** | `音乐` | 乐理、编曲、AI 音乐 |
| | `经济学` | 经济学、投资分析 |
| | `哲学` | 哲学、逻辑学 |
| | `博客` | 博客维护、写作模板 |
| | `科研` | 研究方法、学术工作流 |
| | `工具` | 效率工具、GTD |
| | （无子分类） | 冷知识、杂谈、生活随笔 |
| **读书笔记** | `美国职业罪犯` | 整本书中文转写：Byrnes 1886《美国职业罪犯》系列 |

---

## 判断规则

| 文章类型 | alias 路径 |
|----------|-----------|
| 单篇论文深度解读 | `categories/AI/{对应子分类}` |
| 多篇横向综述 | `categories/AI/{对应子分类}` |
| 数学型课程笔记 | `categories/数学/{对应子分类}` |
| 非数学课程笔记 | `categories/课程/{对应子分类}` |
| 历史叙事 | `categories/历史/{对应子分类}` |
| 其他 | 按主题归入对应路径 |

- 如果文章主题无法归入任何已有路径，可以创建新的，但需遵循：新分类必须是可复用的领域名，命名用中文 2-6 字
- 新分类名需同步注册到 `data/category-names.json` 翻译表

---

## Frontmatter 示例

```yaml
---
title: "1D 视觉分词器综述"
aliases: ["categories/AI/视觉分词器"]
tags: [TiTok, Tokenizer, MLLM]
---
```

```yaml
---
title: "矩阵分解"
aliases: ["categories/数学/线性代数"]
tags: [矩阵, SVD, QR分解]
mathjax: true
---
```

```yaml
---
title: "诺曼底登陆"
aliases: ["categories/历史/世界史"]
tags: [二战, 诺曼底, 盟军]
---
```

### 带深层路径的示例

```yaml
---
title: "动作识别论文精读（一）：VideoMAE"
aliases: ["categories/AI/动作识别/动作识别论文精读"]
sub_id: 10
tags: [VideoMAE, 自监督, 视频理解]
---
```

### Hub 页示例

```yaml
---
title: "动作识别系列总览"
aliases: ["动作识别", "categories/AI/动作识别/index", "categories/AI/动作识别"]
sub_id: 0
---
```

---

## Subcategory 描述与系列组织

确定分类路径后，还需确认是否已建立成体系的系列组织（标题前缀、sub_id 区间、编号规则）。

**生成新文章前必须读取** `references/subcategory-organization.md`，该文件包含：
- 每个分类路径的**描述**（覆盖范围、与其他分类的区别）
- **谱段划分**（主系列、论文精读、工程解读等不同类型的 sub_id 区间）
- **已发布文章清单**（sub_id、路径、标题、文件名）
- **新增文章规则**（如何确定谱段、sub_id、标题前缀）

按目标分类的系列规范填写 `title`、`sub_id` 和 `tags`。

> 编号体系已统一为同级编号（每个深层路径从 10 开始，步长 10）。旧分段编号（1000-1999 等）已全部废弃。详见 `references/subcategory-organization.md` 编号总则。

若目标分类尚未在 `references/subcategory-organization.md` 中登记，按"无系列组织"处理：不填 `sub_id`，标题不加编号前缀。

---

## 新建分类规则

- **优先归入已有分类路径**：上表覆盖了大部分场景，能对得上就不要新建
- **可以新建**：如果文章主题确实无法归入任何已有路径（比如一门全新的课程），可以直接创建新的分类路径
- 新建时遵循：命名用中文 2–6 字或英文专有名词（如 `DSP`、`IGA`），必须可复用于后续同类文章
- 新建后**必须同步更新本文件的分类路径表**和 `data/category-names.json` 翻译表
