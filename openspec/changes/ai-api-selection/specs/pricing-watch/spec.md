# pricing-watch

## Purpose

持续跟踪各家模型 API 与套餐价格：官方定价页与社区数据源双通道采集、交叉验证，落盘带日期快照，避免一次性调研数据过期。

## ADDED Requirements

### Requirement: 官方定价页采集
脚本 SHALL 采集 DeepSeek、Moonshot（Kimi）、智谱（BigModel/Zai）、MiniMax、xAI（Grok）、OpenCode Zen（Go 套餐，存在性待核实）的官方定价信息，每条记录 SHALL 包含抓取时间、来源 URL、模型名、输入/输出单价、缓存读写单价（如公开）及套餐档位（如公开）。任一来源解析失败时 SHALL 显式报错并指明失败源，不得静默跳过。

#### Scenario: 抓取 DeepSeek 定价页成功
- **WHEN** 运行采集脚本且 DeepSeek 定价页可访问
- **THEN** 快照中包含 DeepSeek 全部在售模型的价格记录，附抓取时间与 URL

#### Scenario: 定价页结构变更导致解析失败
- **WHEN** 某来源页面结构变化使解析器无法提取价格
- **THEN** 脚本以非零退出码结束，错误信息指明失败来源与原因

### Requirement: Agent 平台套餐采集
脚本 SHALL 采集提供订阅套餐的智能体平台定价信息（产品集以候选确认结论为准，含用户点名待核实的 Coder、Workbody）；页面为动态渲染导致静态抓取失败时 SHALL 降级为页面文本抓取加人工核实，相应记录 MUST 标注“半自动核实”与核实日期。Agent 平台价格无社区结构化源可比，其记录 MUST 含来源 URL 与抓取时间以保证可复核。

#### Scenario: 动态定价页静态抓取失败
- **WHEN** 某 Agent 平台定价页为 JS 动态渲染，静态抓取无法提取价格
- **THEN** 该来源降级为半自动核实模式并在报告中标注，不阻断其他来源采集

### Requirement: 社区数据源交叉验证
脚本 SHALL 同步 LiteLLM `model_prices_and_context_window.json`、models.dev、OpenRouter `/api/v1/models` 三个社区数据源；同一模型官方价与社区价偏差超过 20% 时，对比表 SHALL 标记 `CONFLICT` 并同时列出两处数值。

#### Scenario: 社区价与官方价一致
- **WHEN** 某模型在官方页与 OpenRouter 的单价偏差小于 20%
- **THEN** 对比表中该模型标记为一致状态

#### Scenario: 价格冲突
- **WHEN** 某模型官方价与社区源偏差达到或超过 20%
- **THEN** 对比表标记 `CONFLICT` 并展示双方数值与来源

### Requirement: 快照存储与对比表
每次运行 SHALL 将结果写入 `data/pricing/YYYY-MM-DD.json`，同日重复运行覆盖当日快照且不影响历史快照，并生成 `reports/pricing-latest.md` 对比表（模型 × 输入价 × 输出价 × 缓存价 × 套餐档位 × 来源标注）。

#### Scenario: 同日重复运行
- **WHEN** 同一天运行脚本两次
- **THEN** 当日快照文件被覆盖更新，此前日期的快照保持不变

### Requirement: 网络依赖隔离
国外源（xAI、OpenCode Zen）不可达时 SHALL 不阻断国内源采集；报告中将不可达来源标注为 `UNAVAILABLE`，其余来源正常入库并以退出码 0 结束（仅当国内源全部成功时）。

#### Scenario: VPN 未开启时运行
- **WHEN** 国外源因网络不可达而失败，国内源均正常
- **THEN** 国内源数据正常入库，报告中 xAI/OpenCode Zen 条目标注 `UNAVAILABLE`，脚本退出码为 0
