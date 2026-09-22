# planning draft 模板

> read-article Phase 4 的规划草稿模板。planning draft 是 **full 模式的中间门禁**：先给用户看、
> 交互修改，确认后才在 Phase 5 固化为 OpenSpec change（proposal / design / tasks）。

## 定位

| 是 | 不是 |
|---|---|
| 规划层草稿，供用户审阅与多轮交互 | 最终博客正文 |
| 已确认决策的沉淀载体 | 已批准的 OpenSpec change |
| Phase 5 固化 `design.md` 的输入 | 可直接写 `src/pages/` 的依据 |

**落盘位置**（按优先级）：

1. `raw/<slug>/planning-draft.md` —— 默认（change 尚未创建）
2. `openspec/changes/<slug>/draft.md` —— change 目录已存在时；该文件不属于 OpenSpec schema

## 起草原则

1. **每节都要指到素材**：素材来源写具体文件与定位（`analysis/methodology.md` §3.2、`sources/<slug>.md` L120-135、论文 Table 3），不得写"参考论文"。
2. **缺料要写替代方案**：论文未披露训练硬件时，写"标注未披露"，不要留空也不要臆测。
3. **区分事实与判断**：作者声明、实测数值是事实；"这个设计是关键创新"是阅读判断，两者分栏。
4. **暴露待确认项**：把需要用户裁决的口径问题集中列出，不要藏在中途。
5. **保持可迭代**：多轮交互后追加变更记录，不覆盖历史决策。

## 模板

```markdown
# planning draft · <论文短标题>

- slug: <slug>
- 状态: <草稿中 / 待用户确认 / 已确认待固化 / 已固化为 change <change-name>>
- 目标文件: src/pages/<slug>.html
- 目标位置: alias `categories/...`；sub_id <N>；Hub `<hub-slug>`（独立文章填 "—"）
- 执行模式: <direct / assisted / deep>
- 关联库内文章: <slug + 标题>（来源：pre-generation-search）

## 1. 论文速览

| 项 | 内容 |
|---|---|
| 标题 | |
| 作者与单位 | |
| venue / 年份 | |
| arXiv / DOI | |
| 代码仓库 | |
| 原文链接 | |

## 2. 一句话价值主张（≤100 字）

<解决什么问题 + 核心手段 + 结果如何>

## 3. 候选文章结构

标准 7-Part 骨架见 `references/article-structure-template.md`；下表为本文的实际取舍。

| Part | 这一节写什么 | 素材来源（文件 + 定位） | 必备元素 | 字数参考 | 缺料与替代 |
|------|------------|----------------------|---------|---------|-----------|
| 1 引言 | | `analysis/background.md` §x | 论文信息来自 frontmatter `paper_*` | ≥250 字 | |
| 2 问题剖析 | | `sources/<slug>.md` §x + `analysis/methodology.md` §x | 机制对比表 | ≥250 字 | |
| 3 模型结构 | | `analysis/methodology.md` §x | 架构图 `figures/<name>.png`；公式 ≥2；超参数 ≥3 | ≥1000 字 | |
| 4 Training | | `analysis/experiment.md` §x | 训练配置披露表（10 项） | ≥500 字 | |
| 5 Inference | | `analysis/methodology.md` §x | 实时论文加 Streaming | ≥500 字 | |
| 6 实验验证 | | `analysis/experiment.md` §x | 实验配置表（6 项）+ 主结果表 + 消融 ≥1 | ≥600 字 | |
| 7 讨论与启发 | | 综合分析 | 局限 ≥1 | ≥300 字 | |

**结构偏离说明**：<合并/新增/删除哪些 Part，为什么>

## 4. 关键数据点（必须出现在正文，且核对过口径）

- <数值>（来源：论文 Table N；复现条件：分辨率 / GPU / 步数）
- <对比结论>（与库内 <某篇> 交叉对照时标注口径差异）
- <消融发现>（去掉 X 后掉 Y）

## 5. 图表公式清单

| 类型 | 内容 | 来源 | 目标位置 |
|------|------|------|---------|
| 表 | <列定义> | 论文 Table N | Part 6 |
| 公式 | <名称 + 符号含义> | `analysis/methodology.md` §x | Part 3 |
| 图 | <论文原图> | `figures/<slug>/<name>.png` | Part 3 |
| Mermaid | <pipeline / 时序> | 代码绘制 | Part 3 / 5 |

## 6. 引用关系计划

- 正文交叉引用：<库内文章 slug + 引用位置>
- `.sources` cite-key：<主 cite-key>
- sidecar / related：<如有>

## 7. 风险与待确认项

- [ ] <待用户裁决的口径问题>
- [ ] <存疑结论：需回原文核实>
- [ ] <素材缺口：替代方案是 ...>

## 8. 已确认决策

| 日期 | 决策 | 来源 |
|------|------|------|
| | | 用户确认 / 原文核查 |

## 9. 变更记录

| 日期 | 变更 | 原因 |
|------|------|------|
```

## 汇报格式

向用户汇报时贴以下三块，并明确问一句"结构是否确认？确认后我固化为 change 并写正文"：

1. 「候选文章结构」表
2. 「图表公式清单」
3. 「风险与待确认项」

**未获明确确认，不得进入 Phase 5 固化，不得写 `src/pages/`**（唯一例外：用户明确说"不用确认，直接写"）。

## 固化检查清单

从 draft 固化到 `openspec/changes/<slug>/design.md` 时逐项核对：

- [ ] draft 的「候选文章结构」已逐节落到 design 的「文章内容大纲」
- [ ] draft 的「已确认决策」全部出现在 design 的 Decisions 或大纲说明中
- [ ] draft 的「风险与待确认项」在 design 的 Risks 中逐条对应，或已解决
- [ ] draft 的 sub_id 已用 `scripts/check-sub-id.py --category <关键词> --suggest` 校验
- [ ] draft 的「图表公式清单」与 design 的「配图计划 / 必备元素」一致
- [ ] 固化后把 draft 状态改为「已固化为 change <change-name>」
