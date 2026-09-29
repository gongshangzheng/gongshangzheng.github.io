## MODIFIED Requirements

### Requirement: 内容类产出先经 planning draft 确认再固化 change 执行

任何将写入 `src/pages/*.html`（发表文章）或对已有文章做内容级增补的任务，MUST 先产出可交互的 **planning draft** 供用户审阅，经用户确认后才固化为 OpenSpec change 并取得结构确认，之后才允许执行写作；不得在 draft 未确认、change 未固化前产出正文。此要求覆盖 `read-article`、`academic-research`、`deep-research`、`historical-narrative`、`book-to-blog`、`course-notes`、`github-repo-read` 七个内容类 skill 的常规产出路径。

#### Scenario: 用户要求精读一篇论文

- **WHEN** 用户给出论文链接并要求"读这篇、写成博客"
- **THEN** agent 先完成素材获取与分析，产出 planning draft（含逐节骨架与素材来源）供用户多轮交互修改；用户确认后才固化为 change 并请求结构确认；在结构确认前不写 HTML、不发布

#### Scenario: 用户在 draft 阶段追加要求

- **WHEN** draft 已产出但用户尚未确认，用户又补充了新的内容要求
- **THEN** agent 更新 draft 中的结构与素材安排并重新呈现，而不是据此直接开始写作

#### Scenario: 固化后需求再变

- **WHEN** change 已固化并确认，用户又要求调整文章结构
- **THEN** agent 走 `openspec-update-change` 回写 change artifact 后继续，不直接改稿

### Requirement: 规范单一事实来源且各 skill 只保留指针

门禁流程（触发条件、draft 与 change 的先后关系、模板位置与填法、审批门禁、豁免清单、上游调用例外）MUST 集中维护在库内 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md` 一处；planning draft 的通用契约 MUST 位于 `blog-rules/references/planning-draft.md`，通用字段模板 MUST 位于 `blog-rules/templates/planning-draft.md`。七个内容类 skill MUST 各自只保留简短的门禁小节并指向上述文件（用库内锚定路径，不得写 `~/.agents/skills/`），不得复制流程正文；门禁小节的位置 MUST 在该 skill 的**分析产出之后、写作之前**，MUST NOT 位于管线最前面。领域特化模板（如 `read-article` 的论文版 draft 模板）MUST 只增加字段，不得减少或改写共享层的约束。

#### Scenario: 修改门禁流程

- **WHEN** 需要调整门禁的触发条件、draft 契约或豁免范围
- **THEN** 只修改 `blog-rules` 下的共享层文件即可对所有内容类 skill 生效，不存在需要同步的多份副本

#### Scenario: agent 按 skill 执行内容任务

- **WHEN** agent 读取任一内容类 skill 并完成其素材/分析阶段
- **THEN** 在该 skill 的分析产出之后、写作之前存在门禁小节，agent 据此读取共享层规范并进入 planning draft 流程

## ADDED Requirements

### Requirement: planning draft 的定位与落盘

planning draft MUST NOT 被视为"用户已批准的文章大纲"，也 MUST NOT 作为写 `src/pages/` 的依据。draft 的落盘位置 MUST 为：默认 `raw/<slug>/planning-draft.md`（此时 change 尚未创建）；仅当 change 目录已存在时使用 `openspec/changes/<slug>/draft.md`。draft MUST 至少包含：产出清单（逐篇）、逐篇/逐节骨架、素材来源（具体文件与定位）、关键数据点、图表与公式计划、缺口与待确认项、已确认决策、变更记录。每轮交互后 agent MUST 更新 draft 并沉淀已确认决策；固化为 change 时，draft 中已确认的决策 MUST 全部落到 `design.md`，MUST NOT 只留在对话上下文或 draft 文件中。

#### Scenario: draft 不等于批准

- **WHEN** planning draft 已产出但用户尚未确认
- **THEN** agent 不得据其写入 `src/pages/`，也不得对外表述为"已批准的文章大纲"

#### Scenario: 固化时不丢失决策

- **WHEN** 用户经 draft 多轮交互确认了若干口径与结构决策，随后固化 change
- **THEN** 这些已确认决策全部出现在 `design.md` 的「文章内容大纲」中；draft 中未决的问题被解决或显式标注为待确认

#### Scenario: 落盘位置不污染 OpenSpec 树

- **WHEN** change 尚未创建（draft 阶段）
- **THEN** draft 落盘在 `raw/<slug>/planning-draft.md`，`openspec/changes/` 下不出现半成品 change 目录
