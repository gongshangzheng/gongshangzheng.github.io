## Purpose

为初次接触 AI 编程 Agent 的读者提供可操作、可核查的入门路径，帮助读者了解常见 Agent、模型服务与计费方式，并逐步掌握持久指令、技能和工具等使用方法。

## ADDED Requirements

### Requirement: 教程应提供可上手的 Agent 入门路径
教程 MUST 作为一篇完整文章发布在 `src/pages/agent-tutorial.html`，标题不得带“第一篇/（一）”等系列分篇标识。文章 MUST 以 Agent 的实际使用路径为主线；开场的市场概览 SHOULD 简洁，只用于帮助新手理解产品入口并自然引出 Codex 桌面端，不得让市场盘点取代后续使用技巧成为全文主体。开场 MUST 介绍 Codex、Claude Code、Pi Agent、Kimi Code、ZCode、DeepSeek Harness 等 Agent 产品的产品形态/交互入口，并简要提及它们对应的模型/API 服务；MUST 明确区分 Agent 产品与模型/API 服务，不得将不同层级的产品作同类排名。文章 MUST 将 Kimi Code、ZCode、DeepSeek Harness 识别为国产 Agent 产品，并将 GLM/Kimi/DeepSeek 模型/API 与 Agent 产品分别说明；涉及 DeepSeek Harness 的开源属性、产品入口或预览状态时 MUST 以官方资料核实。文章 MUST 说明 Codex 同时存在桌面端和终端入口，并可基于桌面端更直观、适合新手跟随的理由选择它作为教程示例，但不得表述为对所有人的唯一或绝对最佳选择。文章的模型服务与计费、AGENTS.md、Skill、Tool、规划工具和安全说明 MUST 与开场内容一起集成在同一篇教程中。

#### Scenario: 读者从开场进入完整教程
- **WHEN** 读者尚未使用过编程 Agent
- **THEN** 文章用简短的市场概览说明 Codex、Claude Code、Pi Agent、Kimi Code、ZCode 等产品与模型服务的层级差异，再说明 Codex 桌面端对新手更直观，并自然引向同一篇文章里的模型选择、配置和实用技巧

#### Scenario: 读者区分 Agent 与模型服务
- **WHEN** 读者比较 Codex、Claude Code、Pi Agent、Kimi 或 GLM
- **THEN** 文章将 Kimi Code、ZCode 作为国产 Agent 产品介绍，将 Kimi、GLM 模型/API 作为模型服务介绍，并仅在同一层级内比较产品特点

#### Scenario: 读者看到 DeepSeek Harness
- **WHEN** 读者比较 DeepSeek Harness 与其他编程 Agent
- **THEN** 文章将 DeepSeek Harness 作为国产开源 Agent Harness 介绍，并按官方资料准确说明其产品入口和当前预览状态

### Requirement: 教程应解释模型服务、计费与外部接入指引
文章 MUST 简要介绍 DeepSeek、智谱 GLM、Kimi 等模型厂商及其官方 API 服务，并用一两句提及 Anthropic/Claude 与 OpenAI/ChatGPT 等国外服务；MUST 明确区分 Agent 产品、订阅套餐、跨工具 Coding Plan 与 API 按量计费。涉及价格、模型可用性或性能时 MUST 标注核查时间与币种/计费口径，或避免未经核实的比较；MUST 明确 DeepSeek API 按 Token 用量收费、没有 Token Plan，不得将按 Token 计费误称为 Token Plan；Pi 如无统一订阅价，MUST 说明费用取决于所选模型供应商。介绍 Kimi Code 与 GLM Coding Plan 时 MUST 核实入门档是否包含编程 Agent 权益，并区分月付、年付及额度差异。价格部分 SHOULD 配置一张由官方套餐/API 页面截图组成的价格拼图。文章 MAY 说明不同 Agent 对模型服务/API 的支持情况可能不同，但 MUST NOT 要求读者按本教程完成协议转换或供应商配置；如介绍用 CC Switch 为 Codex 接入国产模型，MUST 直接链接指定视频 13:45 的内容，不得扩写为详细接入步骤。

#### Scenario: 读者比较常见模型厂商
- **WHEN** 读者在 DeepSeek、GLM、Kimi 等服务中选择模型供应商
- **THEN** 文章提供基于官方资料的简要介绍与服务/计费信息，不作无依据的性能/价格结论，也不承诺任一服务可直接接入所有 Agent

#### Scenario: 读者比较 Agent 使用费用
- **WHEN** 读者在 Agent 订阅、Coding Plan 与 API 服务之间选择
- **THEN** 文章按官方来源说明代表性价格、币种、月付/年付和权益差异，并明确 DeepSeek 只有 API 按 Token 计费、没有 Token Plan；不得把不同额度和地区的价格直接排名

#### Scenario: 读者想用 CC Switch 接入国产模型
- **WHEN** 读者希望通过 CC Switch 将国产模型接入 Codex
- **THEN** 文章直接链接到指定 B 站视频 13:45 的讲解，不重复撰写详细接入步骤

### Requirement: 每章应提供可核验的延伸材料
文章的各部分 MUST 提供与内容相关的参考链接或配图。开场 Agent 产品拼图 MUST 使用官方产品页/文档截图；每次更新截图时，进入每个目标页面后 MUST 等待至少 4 秒、确认页面内容已加载，并在截图前滚动回页面顶部；图注 MUST 标明截图日期并说明截图仅展示产品入口，不构成功能排名。价格部分 SHOULD 配置官方套餐/API 页面截图拼图。开场 MAY 嵌入指定的 B 站视频 [盘点 Codex 半年间更新](https://www.bilibili.com/video/BV1XwaH6AE9a)，并 MUST 加载 `media` CSS 模块；如推荐观看，说明前 15 分钟即可。在模型服务章节介绍 CC Switch 时 MUST 提供该视频从 13:45 开始的直达链接，且不复述详细接入步骤。教程 MUST NOT 仅凭视频标题推断或转述视频的具体步骤。

#### Scenario: 读者查找 CC Switch 接入说明
- **WHEN** 读者想了解如何使用 CC Switch 将国产模型接入 Codex
- **THEN** 文章提供从 13:45 开始的视频链接作为延伸观看内容，不在正文重复教程步骤

### Requirement: 教程语言应自然、循序渐进
文章 MUST 面向正在入门的读者，采用自然、亲切且清楚的讲解语气。每章 SHOULD 从读者可能遇到的困惑或实际问题切入，先解释概念，再逐步引出术语、步骤和适用边界；必要时使用具体场景或简单类比帮助理解。正文 MUST NOT 出现仅服务于作者、编辑或审稿流程的元叙述、写作策略、素材筛选理由或机械免责声明。比较和提醒 MUST 说明对读者的实际意义，避免模板化转折、重复总结、术语堆叠及未经解释的清单。

#### Scenario: 新手首次接触编程 Agent
- **WHEN** 读者遇到多个陌生产品名或新术语
- **THEN** 文章从读者可感知的问题讲起，逐步解释差异，并给出容易跟随的下一步，而不是直接堆产品名和定义

#### Scenario: 内容包含编辑边界或素材说明
- **WHEN** 写作过程中需要约束事实、选择素材或说明文章范围
- **THEN** 这些约束留在规划材料中；正文只保留对读者有实际帮助的事实说明和使用提醒

#### Scenario: 视频观看后继续学习
- **WHEN** 读者已通过开场视频对 Codex 的基本操作建立初步印象
- **THEN** 同一篇文章在开场之后顺势补充模型服务、项目指令和 Agent 使用中的实用技巧，不重复视频演示或突然切换成脱离使用场景的术语清单

### Requirement: 教程最终集中在一篇文章
文章 MUST 将开场与全部教程章节集成在同一个 HTML 页面，不得将章节另行发布为“第一篇”“第二篇”等系列文章。创作与审核 MAY 按章节分阶段推进；每次审核的章节均属于同一篇文章，审核通过后继续完善该页面，最终以完整文章整体检查和交付。

#### Scenario: 分章节审核单篇教程
- **WHEN** 作者分阶段完成教程的一部分
- **THEN** 可将该部分交用户审核，但须继续整合到同一篇教程页面，不能因此拆成单独的系列文章

### Requirement: 教程应解释全局与项目级 AGENTS.md
文章 MUST 说明 AGENTS.md 用于向 Agent 提供持久指令，并区分全局指令与项目级指令的作用范围；具体路径、发现规则和优先级 MUST 以写作时可核实的 Codex 官方文档为准。

#### Scenario: 读者设置个人与项目规则
- **WHEN** 读者希望为多个项目设置个人偏好，同时为当前仓库设置专属约定
- **THEN** 文章分别说明全局与项目级 AGENTS.md 的用途、配置位置和适用范围，并给出检查生效的方法

### Requirement: 教程应区分 Tool 与 Skill，并说明规划工具
文章 MUST 分别解释 Agent Tool（模型可调用、由运行环境执行的工具）、Skill（可复用的指令/工作流，通常以包含必需 `SKILL.md` 的目录组织，可附带参考资料或脚本）和规划工具（用于形成、审阅与追踪计划）的作用，不得将 Agent 客户端误称为 Tool。Skill 部分 MUST 与 AGENTS.md、普通提示词和 Tool 区分，并说明显式调用或按描述自动匹配等方式可能因客户端而异；涉及第三方 Skill 时 MUST 提醒读者审阅指令和附带脚本。文章并应以 OpenSpec 等实例说明规划工具如何支持先计划、经确认再执行。

#### Scenario: 读者理解 Agent Tool
- **WHEN** 读者看到 Agent 执行文件操作、搜索或测试
- **THEN** 文章说明模型发起工具调用、运行环境执行并返回结果的基本循环，并与 Skill 区分

#### Scenario: 读者判断何时使用 Skill
- **WHEN** 读者遇到可重复执行的 Agent 任务
- **THEN** 文章说明 Skill 能解决什么问题、何时适用，并与普通提示词及 Tool 区分

#### Scenario: 读者评估第三方 Skill
- **WHEN** 读者准备采用别人分享的 Skill
- **THEN** 文章提醒读者先检查 `SKILL.md` 指令及附带脚本，尤其留意文件读取、网络访问和命令执行等行为

#### Scenario: 读者使用规划工具
- **WHEN** 任务较复杂，需要先形成并审阅计划再执行
- **THEN** 文章以 OpenSpec 等规划工具说明需求、计划、用户确认与执行之间的关系
