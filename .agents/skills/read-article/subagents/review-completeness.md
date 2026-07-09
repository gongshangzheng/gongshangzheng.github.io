---
name: review-completeness
description: 检查 HTML 论文深度解读的内容完整性——是否有重要信息被遗漏，字数和配图是否达标。
trigger: 论文精读 HTML Review · 完整性审查
---

# Review Agent: 完整性审查

## 职责

检查 HTML 论文深度解读是否遗漏了论文中值得关注的重要内容，字数和配图是否达标，HTML 格式是否完整符合 html-blog 规范。

## 输入

- 论文标题：<title>
- Slug：<slug>
- 原始全文：~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md
- 综合分析：~/gongshangzheng.github.io/raw/<slug>/synthesis.md
- HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>.html

## 检查维度

### 1. 论文信息完整性

**元信息检查：**
- [ ] arXiv ID、版本号、发表时间
- [ ] 全部作者 + 通讯作者 + 机构
- [ ] 论文被哪个会议/期刊接收（如有）
- [ ] 代码仓库链接（含实际 Star 数）

**核心内容检查：**
- [ ] 引言是否包含"为什么值得关注"的判断（不只是摘要翻译）
- [ ] 问题分析是否有实质性分析（不是复述摘要）
- [ ] 方法核心是否有完整的 pipeline 描述（输入→输出全链路）
- [ ] 训练部分是否包含训练配置披露表（10 项必含基础项：训练数据 / 训练硬件 / 优化器 / 学习率 / Batch size / 训练步数 / 训练时长 / 模型参数量 / 精度格式 / Checkpoint 策略），逐项标注"已披露"或"未披露"
- [ ] 实验部分是否包含实验配置表（6 项必含基础项：评测数据集 / 评测指标 / Baseline 方法 / **推理硬件** / 推理分辨率 / 推理环境），逐项标注"已披露"或"未披露"。**推理硬件是核心项**，必须明确写出 GPU 型号和数量，论文未提及则标"未披露"
- [ ] 实验部分是否有 baseline 对比表（含具体数值）
- [ ] 消融分析是否有（每个组件的贡献）
- [ ] 局限性分析是否有（不只是论文原文的泛泛描述）
- [ ] 是否有具体可操作的启发建议

### 2. 宝藏挖掘检查

- [ ] 论文中明确提到的"简单但有效"技巧是否被记录
- [ ] 超参数消融结果是否完整（不能只说"掉了点"）
- [ ] 失败案例或"试过没用"的方法是否被记录
- [ ] 计算成本信息是否包含（GPU 数量、训练时间、FLOPs）

### 3. 字数与配图达标检查

- [ ] HTML 正文总量：常规论文 ≥ 3000 字；复杂系统/综述论文 ≥ 4000 字
- [ ] 方法核心章节 ≥ 1000 字
- [ ] 实验分析章节 ≥ 600 字
- [ ] 至少 3 张关键图片；arXiv 论文必须先检查 HTML figure URL / 论文原图，不得用代码绘制图替代可获得的论文原图
- [ ] **每张图片文件大小 > 1KB**（小于 1KB 的 WebP 几乎必然是空白图）
- [ ] **图片来源验证**：确认图片来自 arXiv e-print tarball 的 figures/ 目录（而非 Docling 整页截图）。检查 raw/<slug>/figures/<slug>/ 是否包含原始 PDF/PNG 文件
- [ ] **视觉抽查**：用 `read` 工具读取至少 2 张图片，确认内容不是空白或裁切错误
- [ ] **综述/导览类文章：至少 50% 的图片必须来自论文原图，mermaid/jsxgraph 仅作补充示意**
- [ ] 关键图片是否已完成视觉理解：caption + 正文段落 + `read` 工具或 GLM MCP 视觉工具交叉校验
- [ ] 至少 1 张代码绘制图（mermaid/jsxgraph），仅作为补充示意
- [ ] 至少 2 个完整数学公式（非综述类论文）
- [ ] 至少 1 个 baseline 对比表（含具体数值）

### 4. HTML 格式规范检查

**frontmatter 检查：**
- [ ] `title` 非空
- [ ] `created_at` / `updated_at` 格式为 `YYYY-MM-DDTHH:mm:ss`
- [ ] `categories` 从 blog-categories skill 选取
- [ ] 含公式的论文有 `mathjax: true`
- [ ] `hero_title` / `hero_sub` / `hero_tagline` 均非空
- [ ] `papers` 已填写（arXiv/DOI 链接）
- [ ] `repos` 已填写（有开源代码时必填 GitHub 链接）

**html-blog 组件检查：**
- [ ] 章节使用 `.ch fade-in` + `.ch-title` 组件（不是裸 `<h2>`）
- [ ] 参考来源使用 `.sources` 组件（不是裸 `<ul><li>`）
- [ ] 文章末尾有 `.chapter-nav` 组件，使用 `nav-prev` / `nav-hub` / `nav-next` 方向 class
- [ ] 表格用 `.table-wrap` 包裹
- [ ] 无 `<html>` / `<head>` / `<style>` / `<nav>` / `<footer>` / `<script>` 等禁止标签

**LaTeX 检查（如果含公式）：**
- [ ] 行内公式用 `$...$`
- [ ] 独立公式用 `$$...$$` 或 `\[...\]`（按 html-blog 规范）
- [ ] `<` 在公式中用 `\lt`

**图片检查：**
- [ ] 使用 `.photo` + `.cap` 组件
- [ ] 图片路径引用实际存在的文件
- [ ] 图片来源标注

### 5. 信息缺口列表

列出所有 `❌` 和 `⚠️` 项，每项：
1. 说明缺失的具体内容
2. 判断是否可从原文补充
3. 提供具体补充内容

## 输出格式

```org
* 完整性审查报告

** 通过项（✅）
<简要列出>

** 缺口项（❌/⚠️）+ 补充内容
每个缺口项必须附上具体补充内容

** 字数与配图统计
- 总字数：<实际> / 常规论文 ≥ 3000；复杂系统/综述论文 ≥ 4000
- 配图数：<实际> / ≥ 3
- 代码绘制：<实际> / ≥ 1
- 公式数：<实际> / ≥ 2
- 对比表：<实际> / ≥ 1

** HTML 格式问题清单
每个格式问题附上正确写法示例

** 总体评分
A / B / C / D + 理由
```

## 强制要求

- 检查 ~/gongshangzheng.github.io/src/pages/<slug>.html（HTML 文件）
- 对照 ~/gongshangzheng.github.io/raw/<slug>/sources/<slug>.md 原文
- 每个缺口必须给出具体的补充内容，不是泛泛建议
