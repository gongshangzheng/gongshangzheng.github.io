---
name: blog-categories
description: |
  博客分类体系的唯一事实来源（Single Source of Truth）。
  维护 category 与 subcategory 的完整映射表、判断规则、新建规则。
  所有需要填写或校验 categories / subcategory 的 skill（html-blog、content-creator、deep-research 等）必须读取本 skill。
  MANDATORY TRIGGERS: 分类, category, categories, subcategory, 博客分类, 分类体系, 选分类, 归类, categorize
version: 1.0.0
category: blog-taxonomy
tags: [blog, taxonomy, categories, subcategory]
---

# 博客分类体系

> 本文档是博客 `categories` / `subcategory` 字段规范的**唯一事实来源**。
> html-blog skill §1.4 的原始内容已迁移至此，html-blog 不再内联分类表。

---

## 完整分类映射表

**只能填 1 个 category**，再按需填 1 个 `subcategory`（单值字符串）。优先从下表选取：

| Category | Subcategory | 覆盖范围 |
|----------|-------------|----------|
| **AI** | `视觉分词器` | 视觉 Tokenizer、离散分词器、1D Tokenizer、TiTok/DiTok 等 |
| | `扩散模型` | 扩散模型、Flow Matching、Controllable Generation |
| | `视觉模型` | 目标检测、视频理解、姿态估计、YOLO/DETR 等 |
| | `自回归` | 自回归视觉模型、AR 生成 |
| | `图像压缩` | 学习式压缩、语义通信、JSCC、神经编解码 |
| | `强化学习` | 强化学习、RLHF、PPO、World Model |
| | `大语言模型` | 大语言模型、SFT、Prompt、RLHF、越狱 |
| | `Agent` | Agent、AI Agent、LLM Agent、Harness Engineering、Tool Use、MCP、Computer Use、多智能体 |
| | `多模态` | 多模态大模型、VLM、视觉语言模型 |
| | `架构` | Transformer、MoE、蒸馏、数据集、框架、AI 编年 |
| | `论文每日摘要` | 每日/每周 arXiv 摘要 |
| **编程** | `前端` | HTML/CSS/JS/PHP、前端框架、Web 开发 |
| | `工具` | 编辑器(Emacs/Vim)、工具(Git/Hugo/Rime)、Agent 工具 |
| | `算法` | 数据结构、算法笔记、复杂度分析 |
| **历史** | `中国史` | 中国史、南北朝、宋史、近现代史 |
| | `日本史` | 日本史、战国、神话 |
| | `人物史` | 人物传记、历史人物 |
| | `世界史` | 世界史、全球史、二战、冷战 |
| | `军事` | 军事史、武器、军阵 |
| | `文化` | 文化史、医疗史、游戏史 |
| **课程** | `数字信号处理` | 数字信号处理 |
| | `认知科学` | 认知心理学、认知科学 |
| | `等几何分析` | 等几何分析、GAMES302 |
| | `机器学习` | 机器学习基础、损失函数、模型层 |
| | `信息论` | 信息论、香农理论、熵编码、信道容量 |
| | `旋量代数` | 旋量代数、李群、李代数、screw theory |
| | `通信原理` | 通信原理、数字通信、调制解调、信道编码 |
| | `编程` | Lisp、解析器、编程语言课程 |
| | `论文写作` | 学术论文写作、论文组织结构、图表处理、发表评审 |
| | `概率图模型` | 概率图模型、贝叶斯网络、因子图 |
| | `计算机系统` | 计算机系统、操作系统、体系结构 |
| | `基础` | 编程语言基础、算法入门 |
| **数学** | `数学` | 微积分、数学基础、综合数学枢纽 |
| | `线性代数` | 线性代数、矩阵论 |
| | `概率论` | 概率论、数理统计 |
| | `高等数学` | 高等数学 |
| | `群论` | 群论、抽象代数、Galois 理论、群表示论 |

| **语言** | `法语` | 法语学习、二语习得方法论、法语资源 |
| **杂识** | `音乐` | 乐理、编曲、AI 音乐、音乐史 |
| | `经济学` | 经济学、投资分析、宏观经济学、经济史、金融霸权 |
| | `哲学` | 哲学、逻辑学、维特根斯坦 |
| | `博客` | 博客维护、写作模板、语法参考 |
| | `科研` | 研究方法、学术工作流、科研工具链 |
| | `工具` | 效率工具、GTD、Agent 工作流、知识管理 |
| | （无子分类） | 冷知识、杂谈、生活随笔 |

---

## 判断规则

| 文章类型 | category | subcategory |
|----------|----------|-------------|
| 单篇论文深度解读 | `AI` | 对应子分类 |
| 多篇横向综述 | `AI` | 对应子分类 |
| 数学型课程笔记（线性代数、概率论、高等数学、群论、综合数学枢纽） | `数学` | 对应子分类 |
| 非数学课程笔记（通信原理、数字信号处理、机器学习、计算机系统等） | `课程` | 对应子分类 |
| 历史叙事 | `历史` | 对应子分类 |
| 其他 | 按主题归入 | 按主题归入 |

- 如果文章主题无法归入任何已有 category，可以创建新的，但需遵循：新 category 必须是可复用的领域名，命名用中文 2-6 字

---

## Subcategory 新建规则

- **优先归入已有 subcategory**：上表覆盖了大部分场景，能对得上就不要新建
- **可以新建**：如果文章主题确实无法归入任何已有 subcategory（比如一门全新的课程），可以直接创建新的 subcategory
- 新建时遵循：命名用中文 2–6 字或英文专有名词（如 `DSP`、`IGA`），必须可复用于后续同类文章
- 新建后**必须同步更新本文件的分类映射表**，否则后续文章无法查阅

---

## Frontmatter 示例

```yaml
categories: [AI]
subcategory: "视觉分词器"
tags: [TiTok, Tokenizer, MLLM]
```

```yaml
categories: ["数学"]
subcategory: "线性代数"
tags: [矩阵, SVD, QR分解]
mathjax: true
```

```yaml
categories: ["历史"]
subcategory: "世界史"
tags: [二战, 诺曼底, 盟军]
```
