# 文章架构模板

> read-article Phase 4 的参考文件。定义论文解读博客的标准章节结构、字数要求和质量底线。

---

## 标准文章结构（7 个必选 Part）

所有论文解读博客必须包含以下 Part，不可省略、不可合并。每个 Part 对应博客的一个 `.ch` 章节。

**章节层级硬规则**：`.ch-label` 只用于顶层章节（Part 1–7）。Part 3 内的多个模块使用 `<h3 class="section-title">` 或更低层级标题，不要新开 `.ch`。

**论文信息位置硬规则**：论文标题/作者/单位/期刊/DOI/开源状态等元信息写入 frontmatter 的 `paper_*` 可选字段（见 read-article SKILL.md「Frontmatter 规范」），由构建系统自动渲染为正文顶部的「论文信息」info-box。**不要**在 Part 1 正文里手写论文信息 info-box，避免与 frontmatter 渲染结果重复。

| Part | 标题示例 | 职责 | 必须包含 |
|------|---------|------|---------|
| **Part 1 · 引言** | "为什么这个问题重要" | 引出问题，建立阅读动机 | 领域背景→核心矛盾→本文贡献预告→论文链接 |
| **Part 2 · 问题剖析** | "一个实验看清问题" | 精确定义问题，用数据说话 | Motivation 实验→已有方法为什么不行→论文 Insight |
| **Part 3 · 模型结构** | "XXX 架构详解" | 完整描述模型架构和创新点 | 整体 Pipeline→逐模块展开→核心创新与已有方法区别 |
| **Part 4 · Training Pipeline** | "如何训练 XXX" | 完整描述训练过程 | 训练数据→预处理→条件构造→损失函数→优化策略→训练配置披露表→训练成本 |
| **Part 5 · Inference Pipeline** | "如何在线跑起来" | 完整描述推理链路 | 输入准备→生成/解码→后处理→输出；实时论文须含 Streaming Pipeline |
| **Part 6 · 实验验证** | "实验配置与结果" | 呈现实验结果并分析 | 实验配置表→指标与基线→主实验→消融→失败案例 |
| **Part 7 · 讨论与启发** | "在地图上的位置" | 定位贡献，给出启发 | 竞品对比表→局限性→可操作启发 |

### 各 Part 写作节奏

- Part 1-2：铺垫，建立"为什么要读下去"的动力
- Part 3：文章核心，最重（≥ 1000 字），逐模块展开
- Part 4：训练细节，紧接 Part 3
- Part 5：推理链路；系统型论文必须独立成章
- Part 6：实验验证，每个表格要指出"这个数字说明什么"
- Part 7：收束，给读者带走的东西

### 训练配置披露表（Part 4 必含）

**三列格式**：`配置项 | 披露状态 | 值 / 说明`。披露状态为 `已披露` / `未披露`。未披露时必须写明"未披露"，不可臆测。

#### 必含基础项（10 项全部出现，论文未提及则标"未披露"）

| 配置项 | 说明 |
|--------|------|
| 训练数据 | 数据集名称 + 规模（如 "HDTF, 300h 配对数据"） |
| 训练硬件 | GPU 型号 + 数量（如 "8× A100 80GB"） |
| 优化器 | 类型 + 关键参数（如 "AdamW, β1=0.9, β2=0.999, wd=0"） |
| 学习率 | 初始值 + schedule + warmup 步数 |
| Batch size | 全局或 per-GPU |
| 训练步数 / 轮数 | iterations 或 epochs |
| 训练时长 | 小时 / 天 |
| 模型参数量 | 总参数 / 可训练参数 |
| 精度格式 | FP32 / FP16 / BF16 / FP8 / 混合 |
| Checkpoint 策略 | 选择标准（如 "验证集 FID 最低"） |

#### 方法特定项（按论文特点选填，不强制）

初始化来源、特殊损失权重、数据增强策略、蒸馏配置、冻结/可训练模块范围等。

**示例**（以 SoulX-LiveAct 为例）：

```html
<div class="table-wrap wide">
  <table>
    <thead><tr><th>项目</th><th>披露状态</th><th>值 / 说明</th></tr></thead>
    <tbody>
      <tr><td>训练数据</td><td>已披露</td><td>300h 多模态配对数据</td></tr>
      <tr><td>训练硬件</td><td>未披露</td><td>原文未给出</td></tr>
      <tr><td>优化器</td><td>未披露</td><td>原文未给出</td></tr>
      <tr><td>学习率</td><td>未披露</td><td>原文未给出</td></tr>
      <tr><td>Batch size</td><td>未披露</td><td>原文未给出</td></tr>
      <tr><td>训练步数</td><td>已披露</td><td>Stage 1: ?, Stage 2: 400 steps</td></tr>
      <tr><td>训练时长</td><td>未披露</td><td>原文未给出</td></tr>
      <tr><td>模型参数量</td><td>未披露</td><td>原文未给出（GitHub 标注 18B）</td></tr>
      <tr><td>精度格式</td><td>已披露</td><td>FP8（推理），训练精度未明确</td></tr>
      <tr><td>Checkpoint 策略</td><td>未披露</td><td>原文未给出</td></tr>
      <!-- 方法特定项 -->
      <tr><td>初始化来源</td><td>已披露</td><td>Wan2.1 + InfiniteTalk</td></tr>
      <tr><td>Stage 1 优化范围</td><td>已披露</td><td>仅 audio cross-attention</td></tr>
    </tbody>
  </table>
</div>
```

**原则**：必含基础项 10 行必须全部出现。即使全标"未披露"，也要让读者一眼看到论文缺了什么。方法特定项按需添加，不强制行数。

### 实验配置表（Part 6 必含）

**与 Part 4 训练配置披露表的区别**：Part 4 聚焦训练阶段（数据、优化器、学习率等），Part 6 聚焦评测/推理阶段。两者互补，不重复。

**核心目的**：这张表最重要的披露项是**推理硬件**——论文用什么硬件跑出报告中的结果。这是读者最关心、论文最常遗漏的信息。即使论文只披露了一部分，也必须列出并标注状态。

**三列格式**：`配置项 | 披露状态 | 值 / 说明`。披露状态为 `已披露` / `未披露`。

#### 必含基础项（6 项全部出现，论文未提及则标"未披露"）

| 配置项 | 说明 |
|--------|------|
| 评测数据集 | 数据集名称 + 规模（如 "Human4DiT, 50 avatars"） |
| 评测指标 | 指标名称 + 方向（如 "PSNR↑ / SSIM↑ / LPIPS↓"） |
| Baseline 方法 | 列出所有对比方法名称 |
| **推理硬件** | **GPU 型号 + 数量**（如 "单张 RTX 3090"、"8× A100 80GB"）。如果论文提及显存或内存也一并记录。这是本表最关键的披露项 |
| 推理分辨率 | 如 "256×256" 或 "512×512" |
| 推理环境 | 框架/版本（如 "PyTorch 2.1, CUDA 12.1"），论文未提则标"未披露" |

**示例**：

```html
<div class="table-wrap">
  <table>
    <thead><tr><th>配置项</th><th>披露状态</th><th>值 / 说明</th></tr></thead>
    <tbody>
      <tr><td>评测数据集</td><td>已披露</td><td>Human4DiT, 50 rigged avatars</td></tr>
      <tr><td>评测指标</td><td>已披露</td><td>PSNR↑ / SSIM↑ / LPIPS↓ / Normal Loss↓</td></tr>
      <tr><td>Baseline 方法</td><td>已披露</td><td>MagicMan⁺, CHAMP*</td></tr>
      <tr><td>推理硬件</td><td>已披露</td><td>单张 RTX 3090</td></tr>
      <tr><td>推理分辨率</td><td>未披露</td><td>原文未给出</td></tr>
      <tr><td>推理环境</td><td>未披露</td><td>原文未给出</td></tr>
    </tbody>
  </table>
</div>
```

### 系统型论文额外规则

如果论文包含工程系统、实时生成、流式处理、在线服务：
- 必须设置独立的 **Training Pipeline** 与 **Inference Pipeline** 章节
- 实时论文还必须在 Inference 内单独给出 **Streaming Inference Pipeline**（chunk、cache、causal mask、首帧延迟、RTF 等）

---

## 架构规划输出格式

```
选定结构: [方案名称]
章节目录:
  Part 1 · [引言标题] — [引出什么问题]
  Part 2 · [问题剖析标题] — [核心矛盾 + Insight]
  Part 3 · [模型结构标题] — [架构 + 创新 + 公式]
  Part 4 · [Training Pipeline 标题] — [数据 + 损失 + 成本]
  Part 5 · [Inference Pipeline 标题] — [输入 + 生成 + 后处理]
  Part 6 · [实验配置与验证标题] — [配置 + 主实验 + 消融]
  Part 7 · [讨论启发标题] — [对比 + 启发]
配图计划:
  - Part 3: 架构图(来源: 论文 Fig.X)
  - Part 4: 训练 Pipeline 流程图
  - Part 5: 推理 Pipeline 流程图
  - Part 6: 实验配置表 + 结果对比表
字数分配:
  - Part 1 ≥ 250 字
  - Part 2 ≥ 250 字
  - Part 3 ≥ 1000 字
  - Part 4 ≥ 500 字
  - Part 5 ≥ 500 字（实时 ≥ 700 字）
  - Part 6 ≥ 600 字
  - Part 7 ≥ 300 字
  - 总量 ≥ 3000 字（复杂系统 ≥ 4000 字）
```

---

## 字数下限

| 部分 | 对应 Part | 最低要求 |
|------|----------|----------|
| HTML 正文总量 | — | 常规 ≥ 3000 字；复杂系统 ≥ 4000 字 |
| 模型结构与创新 | Part 3 | ≥ 1000 字 |
| Training Pipeline | Part 4 | ≥ 500 字 |
| Inference Pipeline | Part 5 | ≥ 500 字；实时 ≥ 700 字 |
| 实验配置与验证 | Part 6 | ≥ 600 字 |
| 引言 + 问题剖析 | Part 1 + 2 | ≥ 500 字 |
| 讨论与启发 | Part 7 | ≥ 300 字 |
| 代码分析（若有） | Part 3 或独立 | ≥ 400 字 |

---

## 质量底线

以下内容不得缺失：

| 必须包含 | 来源 | 最低量 |
|---------|------|--------|
| 核心问题与 Insight | Phase 2 | ≥ 250 字 |
| 完整方法 pipeline | Phase 2d | ≥ 1000 字 |
| Training Pipeline | Phase 2c/2d | 系统型必须有；含训练配置披露表（10 项） |
| Inference Pipeline | Phase 2c/2d | 系统型必须有；实时还须含 Streaming |
| 至少 2 个完整公式 | Phase 2c | — |
| 至少 1 个 baseline 对比表 | Phase 2c/2d | 含数值 |
| 实验配置表 | Phase 2c/2d | 6 项必含基础项，逐项标注披露状态 |
| 至少 3 个超参数 | Phase 2c | — |
| 计算成本 | Phase 2c | 训练/推理分开 |
| 至少 1 个消融发现 | Phase 2c | — |
| 失败案例或局限 | Phase 2c | — |
| 引用链 top 3 | Phase 2b | — |
| 关键图片 | Phase 1 | ≥ 3 张 |
| 架构/流程图 | 代码绘制 | ≥ 1 张 mermaid/jsxgraph |
| HTML 正文总量 | — | 常规 ≥ 3000；复杂 ≥ 4000 |

---

## 非学术内容处理

| 调整 | 说明 |
|------|------|
| Phase 2b 引用链 | 简化为"相关文章"搜索 |
| Phase 2c 宝藏挖掘 | 只提取适用部分 |
| Phase 2d 方法论 | 只分析核心论点 |
| 质量底线 | 降低公式/实验要求 |
| 字数下限 | 降至 ≥ 1800 字 |
