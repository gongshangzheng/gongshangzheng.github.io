# 系统性综述叠加层 — PRISMA + RoB + 荟萃分析

**目标**：在 full 流程基础上叠加 PRISMA 2020 合规的系统性综述能力。

**使用方式**：本文件与 full 流程的 phases/ 文件叠加使用。在对应阶段执行额外步骤。

详见 `references/systematic_review_toolkit.md`（Cochrane v6.4, PRISMA 2020, RoB 2, ROBINS-I, I², GRADE）

## Phase 1 叠加：协议生成（而非仅 RQ）

### PICOS 格式 RQ
- **P**opulation（人群）
- **I**ntervention（干预）
- **C**omparator（对照）
- **O**utcome（结局）
- **S**tudy design（研究设计）
- 明确的纳入/排除标准

### 系统性综述协议
- 遵循 PRISMA-P 2015（详见 `templates/prisma_protocol_template.md`）
- 预设亚组分析和敏感性分析
- 偏倚风险工具选择（RoB 2 / ROBINS-I）
- 荟萃分析可行性预评估

**Devil's Advocate 额外检查**：PICOS 特异性、搜索策略全面性、协议完整性

**协议必须在 Phase 2 之前注册**（或建议注册）。

## Phase 2 叠加：PRISMA 合规搜索 + 偏倚风险评估

### PRISMA 流程图
- 搜索 ≥ 2 个数据库，记录搜索策略
- 双轮筛选（标题/摘要 → 全文）
- PRISMA 2020 流程图（每阶段计数）
- 排除研究附理由

### 偏倚风险评估
详见 `agents/risk_of_bias_agent.md`

- **RoB 2**（随机对照试验）：5 个域评估 + 信号问题
- **ROBINS-I**（非随机研究）：7 个域评估
- 输出：交通灯汇总表（Low / Some Concerns / High）
- 分布摘要（% Low / Some Concerns / High）

## Phase 3 叠加：荟萃分析或叙述性综合

详见 `agents/meta_analysis_agent.md`

### 可行性评估
- 数据是否足够进行定量合并？

### 如果可行：荟萃分析
- 效应量计算
- 森林图数据
- 异质性检验（I², Q, tau²）
- 亚组分析 / 敏感性分析
- GRADE 证据质量评定（每个结局）

### 如果不可行：叙述性综合（SWiM）
- 结构化叙述性综合
- 按 SWiM 指南组织

### 与定性主题的整合
- 定量发现与定性主题的交叉验证

**Devil's Advocate 额外检查**：摘樱桃、异质性解释充分性、GRADE 评估有效性

## Phase 4 叠加：PRISMA 2020 报告

- 使用 `templates/prisma_report_template.md`
- 27 项 PRISMA 清单项映射到各章节
- 研究特征表
- 偏倚风险汇总表
- 森林图数据（如有荟萃分析）
- GRADE 证据总结表（Summary of Findings）

## Phase 5 额外检查
- PRISMA 清单合规性验证

---

## 专项 Gate 条件

在 full 流程 Gate 基础上额外要求：

1. **Phase 1**：协议必须完成（建议注册）
2. **Phase 2**：所有纳入研究的 RoB 必须完成
3. **Phase 3**：每个合并结局的 GRADE 评定必须完成
4. **Phase 5**：PRISMA 27 项清单全部合规
