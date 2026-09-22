---
name: read-article-terminology
description: Phase 2 可选 analysis lane：术语表 + 前置知识。
trigger: read-article Phase 2 术语 lane（按需）；也被 historical-narrative 等 skill 复用
---

# Phase 2 lane · 术语表 + 前置知识

> **lane 定位（read-article Phase 2 按需分析）**
> - **默认不启动**：术语密集、符号较多或公式容易混淆时启用。
> - 输入：`raw/<slug>/sources/` + 已产出的 analysis lane
> - 输出：`raw/<slug>/analysis/terminology.md`（旧路径 `raw/<slug>/subagents/terminology.md` 兼容读取）
> - 输出格式：**事实 + 来源指针 + 不确定性**；术语/符号必须能回源到首次出现的章节
> - 禁止：创建或修改 OpenSpec change、修改 `src/pages/`、写最终 HTML、绕过用户确认
> - 说明：旧编号中的「Phase 5a」表示它曾经是写作 subagent；现在它是 Phase 2 的按需 analysis lane，术语表可直接被主 agent 写进正文

## 任务

从论文全文和综合材料中提取所有专业术语，构建术语表和前置知识章节。目标读者有基础 ML/DL 背景，但对该细分领域不了解。

## 输入

- 论文标题：<title>
- 原始全文：见 ~/gongshangzheng.github.io/raw/<slug>/sources/
- 综合材料：见 ~/gongshangzheng.github.io/raw/<slug>/synthesis.md

## 分析维度

### 1. 论文自创术语

论文中提出的独有方法名、架构名、指标名等。每个术语：
- 原文定义（一句话）
- 用类比或具体例子解释（面向非专业读者）
- 与其他类似概念的区别

### 2. 领域通用术语

论文中使用但属于该领域通用知识的术语。每个术语：
- 一句话定义
- 为什么读者需要知道这个才能读懂本文
- 用一个具体场景或类比让非专家理解

### 3. 容易混淆的术语对

列出论文中容易混淆的概念对，给出区分说明。例如：
- MSE vs LPIPS（像素保真 vs 感知质量）
- SNR vs CBR（信道质量 vs 压缩率）
- encoder vs decoder（发送端压缩 vs 接收端重建）

### 4. 前置知识章节

列出"阅读本文前你需要知道的概念"，按重要性排序。每个概念：
- 一句话定义
- 为什么本文需要这个知识
- 推荐的快速了解方式（如"知道 X 就够了"）

## 输出格式（Markdown）

```markdown
# 术语表

## 论文自创术语

*Term1* :: 定义。类比：...

*Term2* :: 定义。具体例子：...

## 领域通用术语

*JSCC* :: Joint Source-Channel Coding。把压缩和纠错合并成一个端到端系统。类比：传统方式像先打包再贴快递单，JSCC 像直接在包裹上写地址。

*CSI* :: Channel State Information。...

## 容易混淆的术语对

**MSE vs LPIPS**：MSE 衡量像素级差异（"每个像素差多少"），LPIPS 衡量感知相似度（"看起来像不像"）。低码率下二者趋势相反。

# 前置知识

## 1. 概念名
一句话定义。为什么需要知道：...

## 2. 概念名
...
```

## 强制要求

- 不限制输出长度，充分展开
- 每个术语必须有类比或具体例子，不能只有抽象定义
- 术语首次出现时标注英文原文
- 信息不足处标注"原文未明确给出"
- 只做调研，不修改任何文件
