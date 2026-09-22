## 1. 现状核对与新流程基线

- [x] 1.1 对照现有 `.agents/skills/read-article/SKILL.md`、`phases/`、`references/` 和 `subagents/` 文件，列出需要保留的质量约束、可按需复用的分析职责、必须兼容的历史产物和旧流程冲突点
- [x] 1.2 参考 `~/code/ProjFlow/openspec/changes/add-article-note-skill/`，确认素材先行、planning draft、direct/assisted/deep、synthesis 索引和 agent/subagent/script 边界都已纳入设计
- [x] 1.3 用户已确认 `design.md` 中的新流程设计与文档大纲

## 2. 主入口：重新定义默认控制流

- [x] 2.1 重写 `.agents/skills/read-article/SKILL.md` 的流程总览，确立“素材获取 → 按需分析 → synthesis → planning draft 交互 → change 固化 → 主 agent 写作 → 统一 Review/发布”的新流程
- [x] 2.2 明确 full/collect/draft 三种外部入口、planning-draft 中间状态及 direct/assisted/deep 三种内部执行模式、选择条件和结束条件
- [x] 2.3 定义 planning draft 的字段、用户可交互修改的信息、变更记录和确认状态；明确未确认 draft 不得写 `src/pages/`
- [x] 2.4 将正式 OpenSpec 门禁移动到 planning draft 交互确认之后，定义把 draft 固化为 proposal/design/tasks 的流程
- [x] 2.5 定义 `raw/<slug>/analysis/`、`synthesis.md`、planning draft 和历史 `raw/<slug>/subagents/` 的数据流与兼容读取规则
- [x] 2.6 保留并重新编排库内检索、原文优先、图片优先级、引用/MathJax、实验披露、构建、Hub 和交叉回链等核心质量约束

## 3. 分析 lane 与职责边界

- [x] 3.1 将 background/citation/treasure/methodology 从固定四路改写为可选 analysis lane，统一输出“事实 + 来源指针 + 不确定性”
- [x] 3.2 新增 `subagents/experiment.md` 分析 lane，并重构 terminology/code-analysis/image-collection 的按需 lane 说明，明确适用场景、输入、输出和禁止事项
- [x] 3.3 定义主 agent、subagent、确定性脚本的职责边界：subagent 不建 change、不写最终 HTML、不绕过用户确认；脚本不判断论文内容、不自动提交
- [x] 3.4 定义 synthesis 的限定职责：事实位置索引、跨文件引用、矛盾标注、写作分配建议；保留 200–500 字通常范围和 1000 字重写红线
- [x] 3.5 扫描并清理所有“必须启动固定 subagent 数量”的冲突表述

## 4. 参考文档收敛

- [x] 4.1 更新 `phases/extraction.md`，改为素材获取阶段的按需参考，保留 source → HTML → PDF 降级、图片优先级和 extraction-log 规则
- [x] 4.2 更新 `phases/article-structure.md`，改为基于 synthesis/analysis 和真实素材生成 planning draft，并在交互确认后固化 OpenSpec 文章大纲的参考
- [x] 4.3 更新 `phases/html-writing.md`，改为主 agent 统一写作与按需检查清单，去除默认分段写作 subagent 编排
- [x] 4.4 更新 `subagents/` 模板，改为按需 lane；保留历史模板的事实抽取能力，补充来源指针、不确定性和禁止修改最终产物的规则
- [x] 4.5 新增 `references/review-checklist.md`，将 fidelity/completeness/html-format 合并为主 agent 的统一 Review 清单，同时保留复杂任务的按需 Review lane
- [x] 4.6 新增 `references/planning-draft-template.md`，定义 draft 字段模板、状态转换、用户交互和 draft→proposal/design/tasks 固化检查清单
- [x] 4.7 扫描 `.agents/skills/read-article/` 内部链接、旧 Phase 编号、旧 `subagents/` 路径和相互矛盾的强制性表述；并修复连带发现的外部冲突（academic-research 的 3 路 Review 强制、collect 可产 HTML 例外、blog-drafts 的旧 subagent 数量表、重复的 fetch-arxiv-paper.py、AI 生图例外、四类/五类信息不一致、sub_id 检查项缺失、跨 skill 路径未锚定）

## 5. 确定性辅助工具边界

- [x] 5.1 盘点现有 fetch、figure、crop、build 和检查脚本，判断哪些固定工作已经可以复用（结论：`fetch-arxiv-paper.py`、`convert-figures.py`、`crop-figures-from-docling.py`、`check-sub-id.py`、`cross-link.py`、`build.js`、`lint-html.js` 已覆盖全部固定工作）
- [x] 5.2 补齐脚本缺口：`fetch-arxiv-paper.py` 的 `create_directory_structure` 增加 `analysis/`；删除 repo 根下过期的同名脚本副本（扫描确认无调用方），统一到 skill 内权威副本
- [x] 5.3 在 SKILL.md 新增「脚本边界」一节，明确脚本只能做抓取、转换、目录初始化和校验，不承担论文理解、结构决策、正文生成或用户确认

## 6. 新流程演练与质量 Review

- [x] 6.1 文档级推演 direct 模式：确认 SKILL.md 允许 0 个 lane，且背景/定位/方法/实验/局限性覆盖由事实笔记与 Phase 7 三维审校兜底
- [x] 6.2 文档级推演 assisted 模式：确认只委派 1–3 个 lane，主 agent 负责综合与冲突核查（synthesis 矛盾标注规则）
- [x] 6.3 文档级推演 deep 模式：确认多个 lane 只读素材并返回“事实 + 来源指针 + 不确定性”，禁止写最终产物
- [x] 6.4 文档级推演 collect / draft 边界：修复 collect 可产 HTML 的泄漏（改为需 HTML 时走 full 模式）；确认 draft 不写 HTML、不产 planning draft
- [x] 6.5 验证 full 流程在分析完成后先生成 planning draft，用户可交互补充/修改信息（`references/planning-draft-template.md`）
- [x] 6.6 验证未确认 planning draft 时不固化正式 change、不写 `src/pages/`
- [x] 6.7 验证确认后的 planning draft 能固化为 proposal/design/tasks，且有固化检查清单保证 draft 决策与正式大纲一致
- [x] 6.8 执行独立三维 Review（fresh-context reviewer 审校文档一致性），修复 P0/P1：collect HTML 泄漏、旧固定 subagent 表述、3 路 Review 强制、重复脚本、`analysis/` 缺失、AI 生图例外、四类/五类不一致、sub_id 检查项缺失、跨 skill 路径未锚定

## 7. 构建与交付验证

- [x] 7.1 运行 `openspec validate --changes`，修复本 change 的 artifact 校验问题（6 passed, 0 failed）
- [x] 7.2 `npm run check` 不存在于本仓库；改跑 `node build.js`（exit 0）与 `node lib/lint-html.js`（仅既有 arxiv-digest 页告警，与本 change 无关）
- [x] 7.3 运行 `npm test`：220 passed, 0 failed
- [x] 7.4 检查 git diff，确认只修改 read-article skill、相关 skill 引用、OpenSpec artifacts 和 `fetch-arxiv-paper.py`，不修改 `src/pages/` 或既有文章
- [x] 7.5 运行 `scripts/check-skill-paths.py`：死路径 0 处（read-article 文档的跨 skill 引用已全部改为库内锚定写法）
- [x] 7.6 完成 Hub、交叉回链和草稿状态检查，确认本 change 不产博客文章、不需要更新 Hub/回链或 drafts/

## 8. 待后续真实论文运行时验证（不在本 change 收口）

- [ ] 8.1 用一篇真实论文执行 full 流程，端到端验证 Phase 1–8（含 planning draft 交互、change 固化、发布）
- [ ] 8.2 用一篇含 GitHub 仓库的论文执行 assisted/deep 流程，验证 code-analysis lane 的依赖安装与 smoke test 约束
- [ ] 8.3 用 collect 与 draft 场景各跑一次，确认模式边界在真实调用中不被绕过
