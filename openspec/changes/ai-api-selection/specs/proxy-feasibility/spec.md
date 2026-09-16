# proxy-feasibility

## Purpose

评估各候选"买回来之后能否多人共享/反代"：按量 API 与订阅型 Agent 平台的共享可行性完全不同，逐家给出有依据的结论，合规路径优先。

## ADDED Requirements

### Requirement: 三态反代结论矩阵
对每个候选 SHALL 给出三态结论之一：`GATEWAY_OK`（提供 API 或开放兼容端点，可自建网关合规共享）、`GRAY_RISK`（技术上可通过逆向/共享实现，但违反 ToS，有封号风险）、`NOT_FEASIBLE`（设备/指纹强绑定等技术上不可行）。每条结论 MUST 附依据：认证机制分析、ToS 条款原文链接与访问日期、社区实践仓库佐证（如适用）。

#### Scenario: 逐家标注反代可行性
- **WHEN** 完成某候选的认证机制与 ToS 分析
- **THEN** 结论矩阵中该候选获得三态标签之一，并附 ToS 链接、日期与依据说明；无依据的候选标 `UNKNOWN`

### Requirement: 网关方案与配置模板
对所有 `GATEWAY_OK` 候选，SHALL 产出网关选型对比（至少覆盖 LiteLLM、one-api、new-api）与推荐方案的配置模板，MUST 支持 per 成员 API Key 分发、配额限制与用量统计，并说明与用量统计管道（usage-telemetry）的对接方式。

#### Scenario: 可网关候选的落地路径
- **WHEN** 某候选被标为 `GATEWAY_OK`
- **THEN** 存在该候选接入推荐网关的配置模板，且模板包含按成员配额与用量上报配置

### Requirement: 风险披露与合规替代
`GRAY_RISK` 结论 MUST 列明：违反的 ToS 条款、封号后果（含付费账号与数据损失）、逆向接口随平台升级失效的风险；同时 SHALL 给出合规替代方案（团队版/按席位）及价格，供课题组对比决策。`GRAY_RISK` 路径不得作为推荐方案，仅作风险披露。

#### Scenario: 订阅型平台共享评估
- **WHEN** 某订阅型 Agent 平台被评估为可逆向共享
- **THEN** 结论为 `GRAY_RISK`，附带 ToS 违反条款引用、封号风险说明与团队版价格对照，不作为推荐路径
