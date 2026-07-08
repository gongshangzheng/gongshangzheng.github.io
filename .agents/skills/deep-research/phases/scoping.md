# Phase 1: SCOPING — 研究范围界定

**目标**：将用户的话题转化为精确的、可操作的研究问题，并设计方法论蓝图。

## 1.1 研究问题生成

详见 `agents/research_question_agent.md`

- 与用户对话，将模糊话题转化为精确的研究问题
- **FINER 评分**（每项 1-10）：
  - **F**easible（可行性）：数据可获取、时间/资源内可完成
  - **I**nteresting（趣味性）：领域内有人关心
  - **N**ovel（新颖性）：不是已有研究的简单重复
  - **E**thical（伦理性）：不涉及伦理风险
  - **R**elevant（相关性）：对领域有实际贡献
- 确定范围边界：
  - In-scope / Out-of-scope 明确列表
  - 领域（domain）、时间范围、地理范围、人群
- 分解 2-5 个子问题

## 1.2 方法论蓝图

详见 `agents/research_architect_agent.md`

| 维度 | 内容 |
|------|------|
| 研究范式 | 实证主义 / 解释主义 / 实用主义 |
| 方法选择 | 定性 / 定量 / 混合 |
| 数据策略 | 一手数据 / 二手数据 / 两者 |
| 分析框架 | 具体的分析方法和工具 |
| 效度与信度 | 内部效度、外部效度、信度标准 |

详见 `references/methodology_patterns.md` 的研究设计模板。

## 1.3 Devil's Advocate Checkpoint

详见 `agents/devils_advocate_agent.md`

检查项：
- [ ] RQ 是否清晰、可回答？
- [ ] 方法是否匹配问题类型？
- [ ] 范围是否过宽或过窄？
- [ ] 是否遗漏了重要的替代解释？

判定：**PASS** / **REVISE**（附具体反馈）

---

## Gate 条件

进入 Phase 2 前必须同时满足：

1. **用户确认**：用户明确确认 RQ Brief + Methodology Blueprint
2. **Devil's Advocate PASS**：所有检查项通过
3. **todo 状态**：当前 Phase 1 标记为 `completed`，Phase 2 标记为 `in_progress`

不满足？修正后重新检查 Gate。不得跳过。
