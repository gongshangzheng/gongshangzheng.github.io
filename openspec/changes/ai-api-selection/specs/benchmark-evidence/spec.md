# benchmark-evidence

## Purpose

用权威测评数据而非社区口碑来回答"谁在什么任务上占优势"，沉淀可追溯、可复核的证据库。

## ADDED Requirements

### Requirement: 证据来源白名单
测评证据 MUST 来自白名单来源：LMArena（含 Creative Writing 等分类榜）、SuperCLUE、OpenCompass、Artificial Analysis、SWE-bench Verified、Terminal-Bench、LiveCodeBench、EQ-Bench。每条证据 SHALL 记录来源、榜单名称、数据日期、URL 与指标数值。

#### Scenario: 收集写作能力证据
- **WHEN** 收集某模型在中文/创意写作维度的表现数据
- **THEN** 证据记录包含来源、日期、数值与链接四要素

### Requirement: 流行说法的假设核实
对每个待验证说法（如"DeepSeek 文字任务占优""GLM 文字任务弱"），证据库 SHALL 形成"假设 → 证据引用 → 结论（证实 / 证伪 / 证据不足）"三段式记录；结论为"证实"或"证伪"时 MUST 至少引用两个相互独立的来源。

#### Scenario: 核实 DeepSeek 与 GLM 的写作能力差异
- **WHEN** 完成写作维度证据收集
- **THEN** 产出该假设的结论标签，并附至少两个独立来源的证据引用（或标注"证据不足"并列出已查来源）

### Requirement: 任务优势矩阵
仓库 SHALL 维护"任务维度 × 模型"矩阵，任务维度至少包含：中文写作、翻译、编码 Agent、长上下文理解、视觉理解、批量摘要；每格 SHALL 引用证据 ID，无证据的格 MUST 标注 `UNKNOWN` 而非凭印象填写。

#### Scenario: 生成矩阵
- **WHEN** 运行矩阵生成并存在部分证据
- **THEN** 已有证据的格子显示数值与证据引用，缺失证据的格子显示 `UNKNOWN`
