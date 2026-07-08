---
name: read-article-citation
description: Phase 2b 引用链挖掘 subagent 模板。配合 read-article/SKILL.md 使用。
trigger: read-article Phase 2b 引用链挖掘
---

# Phase 2b · 引用链挖掘 subagent

## 任务

基于论文全文中的引用信息，对其核心前置工作进行补充调研。

## 输入

- 论文标题：<title>
- 全文内容：见 ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md

## 阅读策略

> 详细章节利用方式见 `references/paper-section-guide.md` §2.3（Related Works）和 §2.2（Introduction）。

本 subagent 的核心信息源是论文的 **Related Works** 和 **Introduction** 章节，辅以 References 列表。

## 步骤

### 步骤 1：Related Works 系统精读

Related Works 是该论文作者为领域做的微型 taxonomy，是信息密度最高的章节。精读要求：

1. **提取分类体系**：论文把已有方法分成哪几类？分类标准是什么？每类的代表方法？
2. **提取共性缺陷**：论文对每类方法指出了什么不足？"Although X..., they still suffer from..."
3. **提取引用频率**：哪些论文在多个小节被反复提及？这些是该领域的 landmark paper
4. **提取技术演进脉络**：Related Works 是否暗示了"从 A 到 B 到 C"的演进方向？

### 步骤 2：Introduction 贡献声明提取

Introduction 通常包含论文的核心贡献声明和技术定位：

1. 提取"Unlike X..." / "In contrast to Y..." 声明 → 理解技术差异
2. 提取"Our contributions are..." → 逐条记录贡献声明
3. 提取 Introduction 中的"mini-related-works"（前 2-3 段的问题背景描述）

### 步骤 3：核心引用深度调研

从步骤 1 和 2 中提取论文最核心的 3-5 篇引用（标准：方法直接依赖 / 作为 baseline / 被反复提及），对每篇核心引用执行独立 web_search（或 GLM 联网搜索 MCP，参考 web-search skill），获取：
   - 完整标题和 arXiv/会议链接
   - 一句话概括核心贡献
   - 与当前论文的技术关系（前置基础 / baseline / 改进对象 / 灵感来源）
   - 关键定量结果（如可获取）
   - 被引次数（如可获取）

### 步骤 4：Related Works 深度分析

在步骤 1 的基础上进一步分析：
   - 论文的分类方式与我们自己的 taxonomy 对比：更细？更粗？维度不同？
   - 论文指出的共性缺陷是否确实存在？是否有反驳观点？
   - 跨多篇论文的 Related Works 交叉验证：多篇 survey 都提到的共性缺陷 → 很可能是真的

## 输出格式（org-mode）

```org
** 核心引用分析
*** <ref-title-1>
- 核心贡献：<详述>
- 与本文关系：<详述>
- 关键结果：<具体数值>
- 来源：[[URL][描述]]

*** <ref-title-2>
...（每篇至少 5 行）

** 引用网络图谱
<描述论文与核心引用之间的依赖/演进关系>

** Related Work 补充分析
<论文如何定位自己、如何批评前人工作的深度分析>
```

## 强制要求

- 每篇引用必须有独立的 web_search（或 GLM 联网搜索 MCP），不可凭记忆
- 不限制输出长度
- 无法找到的信息标注"未找到公开信息"
- 只做调研，不修改任何文件