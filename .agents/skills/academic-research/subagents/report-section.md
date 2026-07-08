# Report Section Subagent

## 任务

撰写学术调研报告 HTML 正文的指定 section。

## 输入

- `研究领域`: 当前调研主题
- `素材来源`:
  - 按主题重组输出（Phase 3a）
  - 按时间线重组输出（Phase 3b）
  - 按方法重组输出（Phase 3c）
  - 各论文笔记: `~/Org/roam/articles/<title>.org`
- `负责 section`: section 名称
- `Survey spine`: 本 section 在问题定义、任务 taxonomy、技术路线 taxonomy、时间线、方法矩阵或开放问题中的位置

## 撰写要求

- 不限制输出长度，充分展开
- 必须引用具体论文和具体数值
- 使用 HTML 格式（`.ch` 章节组件）
- 表格使用 `<table>` + `.table-wrap`
- 数学公式使用 `$...$` 和 `\[...\]`
- 信息不足处标注“相关论文未明确给出”
- **教学式写作**: 先铺垫、再直觉、再细节
- **Survey 写作**: 每节必须回答一个明确问题，并说明它在整篇 survey 主线中的作用
- **禁止论文堆砌**: 不得按“论文 A 提出、论文 B 提出、论文 C 提出”连续罗列；必须按问题、表示、建模选择、证据和局限组织
- **教师口吻**: 解释“为什么”和“意味着什么”

## Section 分配参考

| section | 主要素材来源 |
|---------|-------------|
| 领域问题定义 | Survey spine + core survey ledger |
| 读者前置概念 | Survey spine + 原始 survey 全文 |
| 任务 taxonomy | Survey spine + Phase 3a |
| 技术路线 taxonomy | Survey spine + Phase 3c |
| 方法矩阵 | Survey spine + 各论文 synthesis |
| 时间线 | Survey spine + Phase 3b |
| 开放问题与未来方向 | Survey spine + 所有素材综合 |

## 输出

输出 HTML 片段，主 agent 负责拼装到完整 HTML 文件中。