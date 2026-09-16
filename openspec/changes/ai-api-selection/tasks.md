# 任务：课题组 AI API 采购选型调研

## 1. 仓库初始化与候选确认

- [x] 1.1 创建 `~/code/ai-api-research` 仓库：目录骨架（`fetch/`、`evidence/`、`data/pricing/`、`reports/`、`references/`）、git init、Python venv 与依赖（httpx、rich、pyyaml）——已预研克隆 6 个参考仓库 + 3 个价格数据源，见 `evidence/repo-survey.md`
- [x] 1.2 确认候选产品确切身份：OpenCode Go（$10/月，30+ 开源模型，发 API key，pi 在官方 Validated Clients 列表）、Qoder（阿里，Free/Pro $20/Pro+ $60/Ultra $200 积分制）、WorkBuddy（腾讯云 CodeBuddy 团队，Free/Pro $10/月，AI 办公智能体，与写文档场景相关）——详见 `evidence/candidates.md`；Teams 定价官方核与 WorkBuddy 国内价确认两小项并入任务 2.4 套餐采集
- [ ] 1.3 课题组需求盘点（问卷/访谈清单）：人数与角色【已确认：1 老师 + 2 博士 + 3 硕士，共 6 人；按角色分层假设，老师为审批+中低频，博士/硕士为研究主力高频】、任务场景构成【已确认：做研究 + 写文档两类】、各场景频率与单次规模、月预算量级、支付方式、合规要求（发票/数据隐私/是否允许境外服务）→ `reports/requirements.md`

## 2. 价格采集（pricing-watch）

- [x] 2.1 实现社区源同步与归一化：LiteLLM `model_prices_and_context_window.json`、models.dev、OpenRouter `/api/v1/models`——`fetch/aggregate_sources.py` 已实现（含渠道优先级、CONFLICT 标记、重试与降级）
- [x] 2.2 官方页核查管道：`fetch/verify_official.py` 已实现——xAI、MiniMax 官方页程序化核实通过（MiniMax M3 永久五折后实付 $0.30/$1.20 已确认）；DeepSeek / Moonshot 官方页为 DOM 渲染，待 agent 浏览器路径（见 2.7）
- [ ] 2.7 【新增】DOM 渲染官方页的 agent 浏览器核实：DeepSeek `api-docs.deepseek.com/quick_start/pricing`、Moonshot/Kimi 定价页（307 重定向），产出后回填核查结论
- [ ] 2.3 实现国外源解析器（VPN 依赖、`UNAVAILABLE` 降级语义）：xAI；OpenCode Zen（若 1.2 确认存在）
- [ ] 2.4 实现 Agent 平台套餐采集：静态抓取优先，动态页降级"文本抓取 + 半自动核实卡"（产品集以 1.2 结论为准，含 Cursor / Copilot 等对照）
- [x] 2.5 实现快照落盘 `data/pricing/YYYY-MM-DD.json` 与对比表 `reports/pricing-latest.md`（仅列当前主力模型 `data/current_models.json` 白名单、含 `CONFLICT` 标记、渠道 tier 标注）
- [ ] 2.6 首轮运行：开 VPN 全量采集 + 关 VPN 验证降级行为，检查退出码与报告

## 3. 需求画像与成本模拟（usage-profile）

- [ ] 3.1 实现场景 token 估算模型：频率 × 单次规模 → 月度用量轻/中/重三档 × 乐观/中性/悲观区间，逐项标注假设
- [ ] 3.2 套餐成本模拟：画像 × 价格快照 → 裸 API 按量 vs 各订阅档 vs Agent 平台套餐（折算同等用量、列配额/限速条款）排序表 `reports/usage-profile.md`
- [ ] 3.3 设计统一用量 schema（成员/供应商/模型/场景/token 分列/费用/时间/来源）与"工作目录 → 场景"映射表（初始：研究、写文档）
- [ ] 3.4 实现分层采集器：有用量 API 的供应商自动拉取（逐家核实可得性）；控制台导出 CSV 手动导入；客户端 harness 日志导出兑底（仅统计字段，不碰提示词）
- [ ] 3.5 实现月报生成 `reports/usage-monthly.md`：per 成员/场景/模型汇总 token 与费用，附套餐"够用/超量/冗余"提示，联动 30 天 STALE 复核

## 4. 测评证据（benchmark-evidence）

- [ ] 4.1 建立证据卡格式（YAML：来源/榜单/日期/URL/数值必填）与来源白名单清单
- [ ] 4.2 脚本抓取可结构化源：Artificial Analysis、LMArena 分类榜（重点 Creative Writing）
- [ ] 4.3 人工录入 PDF 报告类：SuperCLUE 月报写作/推理维度、OpenCompass 中文榜
- [ ] 4.4 收集编码证据：SWE-bench Verified、Terminal-Bench、LiveCodeBench 上 DeepSeek / GLM / Kimi / MiniMax / Grok 最新成绩
- [ ] 4.5 写作假设专项核实："DeepSeek 文字强 / GLM 文字弱"——至少两个独立来源，结论（证实/证伪/证据不足）写入 `evidence/hypothesis-writing.md`
- [ ] 4.6 生成任务优势矩阵 `reports/benchmark-matrix.md`（6 任务维度 × 模型，无证据格标 `UNKNOWN`）

## 5. 采购决策（procurement-decision）

- [ ] 5.1 生成决策矩阵：模型供应商与 Agent 平台 × 档位 × 适用场景 × 预估月成本 × 风险（支付/合规/封号/限速/平台锁定），每条附证据 ID 或画像引用
- [ ] 5.2 撰写 `reports/decision.md`：分级购买建议（主力/备选/专项）+ 任务→模型→Harness 分工表；`UNVERIFIED` 条目不得进入最终建议
- [ ] 5.3 与课题组过决策文档，确认预算与最终选择；未通过项回 2–4 组补数据
- [ ] 5.4 产出试点方案 `reports/pilot-plan.md`：最小档位/最小充值、验证项（限速/并发/稳定性/封号风控/实际任务质量）与事先写明的通过标准

## 6. 反代与共享可行性（proxy-feasibility）

- [ ] 6.1 逐家分析认证机制与 ToS 条款（API Key / OAuth 设备绑定 / 指纹），给出三态结论矩阵 GATEWAY_OK / GRAY_RISK / NOT_FEASIBLE → `evidence/proxy-matrix.md`
- [ ] 6.2 网关选型对比：LiteLLM（58.8k★）/ new-api（48.2k★）/ one-api（36.9k★）/ Portkey 等，含 per 成员配额、用量统计与 usage-telemetry 对接方式 → `evidence/gateway-comparison.md`
- [ ] 6.3 对 GATEWAY_OK 候选产出网关配置模板（成员 Key 分发、配额限制、用量上报）
- [ ] 6.4 GRAY_RISK / NOT_FEASIBLE 标注清单：ToS 条款引用、封号后果、逆向失效风险、合规替代（团队版 seat 价格）

## 7. 接入与收尾

- [ ] 7.1 产出接入指南 `reports/onboarding.md`：各 Harness × 供应商配置片段（若决策采用网关则以网关为统一入口）、账号分发方式（子账号/团队版/共享/网关）及各自 ToS 与封号风险、用量监控方式
- [ ] 7.2 试点由课题组管理员执行后回填结果到 `reports/pilot-plan.md`，给出批量采购"通过/不通过"结论
- [ ] 7.3 收尾：README 写"一键重跑"说明，报告头部挂 30 天 `STALE` 检查；`openspec validate` 通过

## 8. 展示网页（report-site）

- [x] 8.1 套餐档案结构化 `data/plans.json` + 渲染脚本 `fetch/render_site.py`（自包含 HTML，无构建）
- [x] 8.2 页面首版：候选概览卡 + 价格对比表（CONFLICT 高亮、来源日期标注）+ 套餐卡
- [ ] 8.3 后续产出挂进页面：测评矩阵（任务 4.6）、决策矩阵（任务 5.2）、用量月报（任务 3.5）三个区块
- [ ] 8.4 一键重跑说明并入 README；可选 GitHub Pages 部署
