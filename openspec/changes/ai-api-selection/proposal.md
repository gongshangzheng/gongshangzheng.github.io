# 课题组 AI API 采购选型调研

## Why

课题组需要采购新的模型 API / 套餐。各家价格与能力差异大且月月在变，"谁擅长什么任务"多靠口碑流传（如"DeepSeek 文字强、GLM 文字弱"），缺乏权威测评佐证；订阅档位与按量计费哪种划算也取决于课题组真实的使用画像。需要一次有据可依、可复核、可定期更新的调研，支撑花钱决策。

### 本调研必须回答的问题

- **R1 买谁家、买什么**：模型供应商（API / 订阅）与 Agent 平台（Qoder、WorkBuddy、OpenCode Go 等智能体套餐）两品类中各选哪些、什么档位，在课题组预算内最优；除模型供应商外，Agent 平台把模型打包进订阅，折算同等用量常更便宜，必须纳入比较
- **R2 什么任务用什么模型**：基于权威测评（LMArena / SuperCLUE / SWE-bench 等，非口碑）给出任务→模型映射，专项核实"DeepSeek 文字强 / GLM 文字弱"类流行说法
- **R3 接到哪、怎么管**：各任务接入哪个 Harness（pi / Claude Code / Codex CLI 等），账号如何分发与监控用量
- **R4 反代与共享**：按量 API 能否自建网关给 6 人分账配额？订阅型 Agent 平台能否反代共享一个账号？——能反代的研究怎么反代，不能的明确标注并给合规替代（团队版 seat）

## What Changes

### 调研对象清单

- **模型供应商**：Kimi（月之暗面）、DeepSeek【课题组点名】；GLM/智谱、MiniMax、xAI Grok【强相关追加】；OpenCode Go（$10/月订阅、30+ 开源模型）【已确认】
- **Agent 平台**：Qoder（阿里）、WorkBuddy（腾讯云 CodeBuddy 团队）【课题组点名，已确认身份】；Cursor、Copilot、Trae、CodeBuddy【同类对照】

### 交付内容

- 新建独立仓库 `~/code/ai-api-research`（名称可在实施时调整），独立 git 管理，承接全部调研脚本与产出
- **价格采集脚本化**：实时抓取 DeepSeek / Kimi（月之暗面）/ 智谱 / MiniMax / xAI（Grok）/ OpenCode Zen（Go 套餐，待核实）的 API 定价与订阅档位，以三个社区数据源交叉验证——LiteLLM `model_prices_and_context_window.json`、models.dev JSON API、OpenRouter `/api/v1/models`；输出带日期快照的 JSON 与对比表
- **Agent 平台套餐纳入调研**：除模型供应商外，调研提供订阅套餐的智能体平台（用户点名 Coder、Workbody——确切产品待检索核实；对照 Cursor、Copilot、Trae、CodeBuddy 等），比较模型配额、限速、平台锁定与团队 seat 计价，与裸 API 折算到同等用量对比
- **权威测评证据库**：收集 LMArena 分类榜（含 Creative Writing）、SuperCLUE、OpenCompass、Artificial Analysis、SWE-bench / Terminal-Bench / LiveCodeBench、EQ-Bench 等来源，专项核实"DeepSeek 文字强 / GLM 文字弱"等流行说法
- **课题组需求与用量画像**：人数已确认（1 名老师 + 2 名博士 + 3 名硕士，共 6 人）；主要任务场景已确认为**做研究 + 写文档**两类；待盘点各场景频率、预算量级、支付方式与合规要求（发票/数据隐私），按角色分层估算 token 需求分档
- **用量统计管道**：设计并实现采购后持续统计能力——分层采集（供应商用量 API 自动拉取 / 手动导出导入 / 客户端 harness 日志兑底），按工作目录映射场景标签，只记 token 不碰提示词内容，输出 per 人/场景/模型月报，反哺采购档位复核
- **反代与共享可行性评估**：逐家分析认证机制（API Key / OAuth 设备绑定 / 指纹）与 ToS 条款，给出三态结论：可自建网关（GATEWAY_OK）/ 技术可行但违反 ToS 有封号风险（GRAY_RISK）/ 技术不可行（NOT_FEASIBLE）；对可网关候选产出网关选型与配置模板（LiteLLM / one-api / new-api 等），含 per 成员配额与用量统计对接
- **采购决策与接入方案**：输出决策矩阵（供应商 × 档位 × 场景 × 风险）、分级购买建议（主力/备选/专项）、最小额度试点方案、以及"Harness × 模型"接入指南与账号分发方式
- **展示网页**：全部调研数据（价格快照、套餐档案、测评证据、决策矩阵）渲染为自包含静态网页，课题组无需命令行即可审阅

## Capabilities

### New Capabilities

- `pricing-watch`: 模型供应商官方定价 + Agent 平台套餐双品类采集，社区数据源交叉验证、带日期快照存储、对比表生成
- `benchmark-evidence`: 权威测评证据的收集、归档与"任务维度 × 模型"优势矩阵
- `usage-profile`: 课题组需求盘点与用量画像（人数、场景、频率、预算、合规）
- `usage-telemetry`: 采购后用量统计管道：多源采集、场景打标、隐私边界与周期报告
- `proxy-feasibility`: 反代与账号共享可行性：三态结论矩阵、ToS 依据、网关方案与风险披露
- `procurement-decision`: 采购决策矩阵、分级购买建议、试点方案与接入指南
- `report-site`: 调研数据渲染为自包含静态网页，供课题组审阅

### Modified Capabilities

（无——调研产出为新报告与指南，不修改现有系统行为）

## Impact

- 新仓库 `~/code/ai-api-research`：Python 脚本（与 arxiv-paper-digest 管线同栈）+ 快照数据 + 证据卡 + 报告
- 采购决策由课题组审核后执行；试点与开通由课题组管理员操作，本调研不自动购买
- 国外源（xAI、OpenCode Zen）抓取需走 VPN，脚本须复用 web-search skill 的 VPN 探测规范
- 本博客仓库本身无业务代码改动，仅含 openspec 规划文档；不涉及 `~/.pi` 配置变更
