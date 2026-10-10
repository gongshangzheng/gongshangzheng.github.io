## Purpose

为初次接触 AI 编程 Agent 的读者提供可操作、可核查的入门路径，帮助读者选择易上手的客户端、配置模型服务并理解可复用的指令与技能机制。

## ADDED Requirements

### Requirement: 教程应提供可上手的 Agent 入门路径
文章 MUST 以明确的工具选择和操作路径为主线，解释 Codex App、CC Switch 与其他 Agent 入口的定位差异；不得将特定工具表述为适合所有人的唯一选择。首次实际任务前 MUST 配置并验证一个 Codex 可用的模型供应商；不得假设读者拥有 ChatGPT API。教程 MUST 说明计划后执行（Plan mode）与自动/高自主执行模式的差异及其审批风险；“YOLO mode”如出现 MUST 标注为非统一的社区俗称，并按具体工具官方能力解释。

#### Scenario: 读者选择初始工具
- **WHEN** 读者尚未使用过编程 Agent
- **THEN** 文章说明为何以 Codex App 作为图形化入门示例，并指出适用前提与取舍

#### Scenario: 读者没有 ChatGPT API
- **WHEN** 读者准备首次使用 Codex App，但没有可用的 ChatGPT API
- **THEN** 文章先指导其配置并验证一个 Codex 可用的模型供应商，再进入第一个实际任务

#### Scenario: 读者选择执行自主程度
- **WHEN** 读者在计划后执行与自动/高自主执行模式之间选择
- **THEN** 文章说明两者的审批与权限差异，建议新手先审阅计划并保留必要确认；若提及“YOLO mode”，解释其为社区俗称且不同工具语义可能不同

### Requirement: 国产模型配置应解释协议兼容边界
文章 MUST 说明 Codex API 协议与常见模型服务 API 之间可能存在差异，并区分直连、CC Switch 路由转换及外部协议代理的适用场景；配置步骤 MUST 基于当前可核实的文档和版本。

#### Scenario: 模型服务协议与 Codex 不一致
- **WHEN** 读者试图将非 Responses API 模型服务接入 Codex
- **THEN** 文章解释为何仅替换 API 地址可能失败，并说明经验证的转换方案及其限制

#### Scenario: 用户想恢复官方供应商
- **WHEN** 读者配置第三方模型后想切回官方服务
- **THEN** 文章给出恢复官方供应商的可验证步骤

### Requirement: 教程应解释全局与项目级 AGENTS.md
文章 MUST 说明 AGENTS.md 用于向 Agent 提供持久指令，并区分全局指令与项目级指令的作用范围；具体路径、发现规则和优先级 MUST 以写作时可核实的 Codex 官方文档为准。

#### Scenario: 读者设置个人与项目规则
- **WHEN** 读者希望为多个项目设置个人偏好，同时为当前仓库设置专属约定
- **THEN** 文章分别说明全局与项目级 AGENTS.md 的用途、配置位置和适用范围，并给出检查生效的方法

### Requirement: 教程应区分 Tool 与 Skill，并说明规划工具
文章 MUST 分别解释 Agent Tool（模型可调用、由运行环境执行的工具）、Skill（可复用的指令/工作流）和规划工具（用于形成、审阅与追踪计划）的作用，不得将 Agent 客户端误称为 Tool；并应以 OpenSpec 等实例说明规划工具如何支持先计划、经确认再执行。

#### Scenario: 读者理解 Agent Tool
- **WHEN** 读者看到 Agent 执行文件操作、搜索或测试
- **THEN** 文章说明模型发起工具调用、运行环境执行并返回结果的基本循环，并与 Skill 区分

#### Scenario: 读者判断何时使用 Skill
- **WHEN** 读者遇到可重复执行的 Agent 任务
- **THEN** 文章说明 Skill 能解决什么问题、何时适用，并与普通提示词及 Tool 区分

#### Scenario: 读者使用规划工具
- **WHEN** 任务较复杂，需要先形成并审阅计划再执行
- **THEN** 文章以 OpenSpec 等规划工具说明需求、计划、用户确认与执行之间的关系
