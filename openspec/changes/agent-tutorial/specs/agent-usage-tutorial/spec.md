## Purpose

为初次接触 AI 编程 Agent 的读者提供可操作、可核查的入门路径，帮助读者了解常见 Agent、模型服务与计费方式，并逐步掌握持久指令、技能和工具等使用方法。

## ADDED Requirements

### Requirement: 教程应提供可上手的 Agent 入门路径
教程 MUST 作为一篇完整文章发布在 `src/pages/agent-tutorial.html`，标题不得带“第一篇/（一）”等系列分篇标识。文章 MUST 以新手的实际使用路径为主线，设置六章：第一章“编程 Agent”，介绍 Agent 产品并推荐 Codex 桌面端作为入门示例；第二章“模型与付费方案”；第三章选读的 Harness Engineering；第四章“上下文、AGENTS.md 与 Skill”；第五章“规划与执行”；第六章“安全与复核”。安全提示可出现在相关章节，但第六章 MUST 汇总权限、隐私、结果检查与回退方法。市场概览 MUST 简洁，不能取代后续使用技巧成为全文主体。第一章 MUST 介绍 Codex、Claude Code、Kimi Code、ZCode、DeepSeek Harness 等产品的形态与交互入口，Pi Agent MAY 作为补充；MUST 区分 Agent 产品与模型/API 服务，不得将不同层级的产品作同类排名。文章 MUST 将 Kimi Code、ZCode、DeepSeek Harness 识别为国产 Agent 产品，并将 GLM/Kimi/DeepSeek 模型/API 与 Agent 产品分别说明；涉及 DeepSeek Harness 的开源属性、产品入口或预览状态时 MUST 以官方资料核实。文章 MUST 说明 Codex 同时存在桌面端和终端入口，并可基于桌面端更直观、适合新手跟随的理由选择它作为教程示例，但不得表述为对所有人的唯一或绝对最佳选择。模型服务与计费、Harness、上下文、AGENTS.md、Skill、Tool、规划、安全和复核内容 MUST 集成在这一篇教程中。

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
文章 MUST 简要介绍 DeepSeek、智谱 GLM、Kimi 等模型厂商及其官方 API 服务，并用一两句提及 Anthropic/Claude 与 OpenAI/ChatGPT 等国外服务；MUST 区分 Agent 产品、Agent/聊天产品订阅、跨工具 Token Plan/Coding Plan 与 API 按量计费。文章 MUST NOT 概括声称 API 天然比订阅贵或便宜；MUST 根据实际使用频率、用量、价格口径和套餐额度说明选择条件，并可建议低频个人使用比较 DeepSeek API、日常编程比较确实包含 Agent 权益的 Kimi 或 GLM 套餐、高用量时评估更高额度方案。MUST 明确 DeepSeek 只有 API、按 Token 用量计费且没有 Token Plan，不得将按 Token 计费误称为 Token Plan；Pi 如无统一订阅价，MUST 说明费用取决于所选模型供应商。介绍 Kimi Code 与 GLM Coding Plan 时 MUST 核实目标档位是否包含编程 Agent 权益，并区分月付、年付及额度差异。若介绍 ChatGPT/Codex 套餐，MUST 核对地区、购买条件与权益；涉及非官方代购时 MUST 提醒账号、支付和售后风险，不得背书或推荐具体代购渠道。价格 MUST 标注核查时间、币种和计费口径，价格部分 SHOULD 配置一张由官方套餐/API 页面截图组成的拼图。文章 MAY 说明不同 Agent 对模型服务/API 的支持情况可能不同，但 MUST NOT 要求读者按本教程完成协议转换或供应商配置；如介绍用 CC Switch 为 Codex 配置国产模型，MUST 直接链接指定视频 13:45 的内容，不得扩写为详细接入步骤，也不得称其为切换 Codex 自身订阅方案。

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
文章的各部分 MUST 提供与内容相关的参考链接或配图。开场 Agent 产品拼图 MUST 使用官方产品页/文档截图；每次更新截图时，进入每个目标页面后 MUST 等待至少 4 秒、确认页面内容已加载，并在截图前滚动回页面顶部；图注 MUST 标明截图日期并说明截图仅展示产品入口，不构成功能排名。价格部分 SHOULD 配置官方套餐/API 页面截图拼图。第四章 MUST 包含一张简洁的信息流示意图，展示本轮任务、适用的 `AGENTS.md`、按需匹配的 Skill、相关代码/工具结果和可用工具说明如何按任务进入模型上下文；并将沙箱、工具权限和审批标为独立于上下文的执行边界，不得暗示所有 Agent 使用相同的加载机制。开场 MAY 嵌入指定的 B 站视频 [盘点 Codex 半年间更新](https://www.bilibili.com/video/BV1XwaH6AE9a)，并 MUST 加载 `media` CSS 模块；如推荐观看，说明前 15 分钟即可。在模型服务章节介绍 CC Switch 时 MUST 提供该视频从 13:45 开始的直达链接，且不复述详细接入步骤。教程 MUST NOT 仅凭视频标题推断或转述视频的具体步骤。

#### Scenario: 读者查找 CC Switch 接入说明
- **WHEN** 读者想了解如何使用 CC Switch 将国产模型接入 Codex
- **THEN** 文章提供从 13:45 开始的视频链接作为延伸观看内容，不在正文重复教程步骤

#### Scenario: 读者区分模型上下文与执行权限
- **WHEN** 读者想知道哪些信息会提供给模型，以及 Agent 如何限制实际操作
- **THEN** 第四章示意图展示按任务筛选的上下文材料，并把沙箱、工具权限和审批单独呈现为执行边界

### Requirement: 教程语言应自然、循序渐进
文章 MUST 面向正在入门的读者，采用自然、清楚且精炼的讲解语气。章节标题和小节标题 MUST 使用简短、具体的词组直接点明主题或任务，让读者仅看目录也能判断内容；MUST 逐项审校所有可见标题。标题 MUST NOT 使用“先认识”“先来看看”“想先看个演示”等无信息铺垫、空泛或修辞性问句，以及重复解释主题的副标题。正文 SHOULD 从读者可能遇到的困惑或实际问题切入，先解释概念，再逐步引出术语、步骤和适用边界；必要时使用具体场景或简单类比帮助理解。正文 MUST NOT 出现仅服务于作者、编辑或审稿流程的元叙述、写作策略、素材筛选理由或机械免责声明。比较和提醒 MUST 说明对读者的实际意义，避免模板化转折、重复总结、术语堆叠及未经解释的清单。

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
文章 MUST 在介绍 AGENTS.md 前解释上下文是 Agent 本轮处理任务时可参考的信息，并说明用户请求、项目指令、按需读取的文件、工具结果和适用的 Skill 指令可能如何参与；不得笼统声称所有 AGENTS.md 或 Skill 内容都会在 Agent 启动时完整装入上下文。文章 MUST 说明 AGENTS.md 用于提供较稳定的指令，并区分全局指令与项目级指令的作用范围；具体路径、发现规则和优先级 MUST 以写作时可核实的 Codex 官方文档为准。

#### Scenario: 读者设置个人与项目规则
- **WHEN** 读者希望为多个项目设置个人偏好，同时为当前仓库设置专属约定
- **THEN** 文章分别说明全局与项目级 AGENTS.md 的用途、配置位置和适用范围，并给出检查生效的方法

### Requirement: 教程应解释 Harness Engineering、上下文、Tool 与 Skill
文章 MUST 在第二章模型与付费方案之后安排第三章 Harness Engineering，并将该章标注为选读。文章 MUST 说明大语言模型根据上下文生成输出，但本身不直接读取或修改用户电脑；Agent 是由模型、Harness、工具及运行状态组成的工作系统。文章 MUST 区分 Harness（围绕模型组织上下文、工具和运行环境的执行/调度框架）与 Harness Engineering（设计并持续改进这套框架的工程实践），并说明后者不只涉及工具调用，也包括明确任务意图、上下文组织、权限边界及验证反馈。Harness Engineering MUST 解释为什么需要 Harness：它将模型与运行环境、可用工具和上下文连接起来，并负责工具调度、执行控制、结果回填及调用循环。文章 MUST 说明 Harness 可向模型提供工具说明和结构化参数格式；模型既可能直接生成文本答案，也可能在需要外部操作时生成结构化工具调用请求，不能说成每次模型输出都是工具调用。Harness 根据权限和审批规则执行请求，将文件内容、命令输出等结果写回上下文，供模型继续处理，最后由模型回答。文章 MUST 以 `Read`、`Edit` 等工具为例，说明这些名称只是示例、不同产品的工具名和实现方式可能不同；介绍工具执行时 MUST 说明其位置因产品而异，既可能由本地工作区执行，也可能由服务端执行；不得把 Harness、Tool 与 Agent 客户端混为一谈。选读章 MUST 说明只想先使用 Agent 的读者可以跳过，且跳过不妨碍阅读第四章及后续内容。

Harness Engineering 章节 MUST 以“修复登录失败并补回归测试”或同等具体任务为例，明确列出可能进入本次模型上下文的材料：当前用户请求；适用的 `AGENTS.md` 项目指令（如技术栈、认证代码边界、测试命令）；由搜索/读取工具按需获取的相关代码及工具执行结果；可用工具的说明和参数格式；若任务选用 Skill，则该 Skill 的工作流指令和相关参考资料。文章 MUST 说明 Harness 会按任务筛选上下文，不必把整个仓库、所有文件或所有 Skill 一股脑放进模型上下文，具体发现、匹配和加载方式因产品而异。文章 MUST 用同一例子区分上下文与权限：上下文提供任务和项目背景；沙箱、工具权限和审批机制实际限制文件范围、命令和网络等操作，模型提出请求本身不赋予执行权限，超范围或高影响操作可能需要审批或被拒绝。该例 MUST 自然引出后续章节：`AGENTS.md` 保存长期项目约定，Skill 提供任务专用的可复用步骤。

第四章 MUST 分别解释 Tool（具体能力/动作）、Skill（可复用的指令/工作流，通常以包含必需 `SKILL.md` 的目录组织，可附带参考资料或脚本）和 AGENTS.md（较稳定的项目指令）的作用。Skill 部分 MUST 与 AGENTS.md、普通提示词和 Tool 区分，并说明显式调用、按描述自动匹配或按需加载等方式可能因客户端而异；MUST 提供多个现成 Skill 搜集目录作为发现入口，并说明目录收录、热度或平台自述的审核标记不等于对每个 Skill 的安全保证。文章 SHOULD 按任务类别举例介绍归藏 PPT Skill、PPT Master 和 Scientific Agent Skills：说明归藏项目输出单文件 HTML 横向演示、PPT Master 面向可编辑 `.pptx`、Scientific Agent Skills 汇集科研与科学计算工作流，并提示读者按交付物和任务选择，不把示例视为安全或质量背书。涉及第三方 Skill 时 MUST 提醒读者将其视为不可信依赖，检查原始来源、`SKILL.md` 指令、安装命令和附带脚本，留意文件读取、网络访问、命令执行及敏感信息处理，避免泄露密钥并尽量限制权限。

#### Scenario: 读者理解 Agent 与大模型的分工
- **WHEN** 读者看到 Agent 执行文件操作、搜索或测试
- **THEN** 文章说明模型本身不会直接操作电脑；Harness 连接模型、上下文与运行环境，按权限调度 `Read`/`Edit` 等工具，并把结果写回上下文供模型继续处理

#### Scenario: 读者理解模型何时调用工具
- **WHEN** 读者认为模型的每次输出都会触发工具
- **THEN** 文章说明模型也可以直接输出文本答案；只有需要外部操作时，才可能生成结构化工具调用请求，由 Harness 执行并回传结果

#### Scenario: 读者区分 Harness 与 Harness Engineering
- **WHEN** 读者把 Harness Engineering 简化为“给模型加几个工具”
- **THEN** 文章说明工具调用只是 Harness 的一部分；Harness Engineering 还包括设计任务上下文、运行环境、权限边界和验证反馈闭环

#### Scenario: Agent 为具体任务组织上下文与权限
- **WHEN** 读者让 Agent 修复登录失败并补充回归测试
- **THEN** 文章说明任务请求、适用的 `AGENTS.md` 规则、相关代码与工具结果、工具说明，以及按需选中的 Skill 指令如何组成上下文；同时说明沙箱、工具权限和审批机制如何实际限制操作，并由此引出第四章对上下文、`AGENTS.md` 与 Skill 的说明

#### Scenario: 读者选择是否阅读 Harness 机制
- **WHEN** 读者暂时只想学习如何使用 Agent，不打算了解其运行机制
- **THEN** 文章将 Harness Engineering 章节放在第三章并标为选读，说明可以跳过并继续阅读第四章；希望理解模型如何通过 Harness 使用工具的读者可选择阅读

#### Scenario: 读者判断何时使用 Skill
- **WHEN** 读者遇到可重复执行的 Agent 任务
- **THEN** 文章说明 Skill 能解决什么问题、何时适用，并与普通提示词及 Tool 区分

#### Scenario: 读者评估第三方 Skill
- **WHEN** 读者从技能目录发现并准备采用第三方 Skill
- **THEN** 文章提供多个发现目录，提醒读者回到原始仓库检查指令、安装命令与脚本；目录热度或自述审核不构成安全保证，并提醒限制权限、保护密钥

#### Scenario: 读者按任务寻找现成 Skill
- **WHEN** 读者希望用 Skill 制作演示文稿或辅助科研工作
- **THEN** 文章分别举例说明归藏 PPT Skill 的 HTML 演示、PPT Master 的可编辑 `.pptx` 与 Scientific Agent Skills 的科研工作流，并提醒读者核对来源和安全风险

### Requirement: 教程应指导读者规划并执行复杂任务
第五章 MUST 说明复杂目标直接交给 Agent 自行发挥可能导致范围不清或偏离预期，并建议先澄清目标、形成计划、由人审阅，再按步骤执行和验证。文章 MAY 建议规划阶段使用能力较强的模型、执行阶段按任务改用成本较低的模型，但 MUST 将其表述为可选策略，并提醒效果取决于任务难度、模型能力、价格和使用额度。文章 MUST 以 OpenSpec 为例说明常见规划产物的分工：Proposal 记录动机与范围，Design 说明方案，Specs 描述可验收要求，Tasks 拆分执行步骤；MUST 说明具体 change 工作流可按类型不同而有所取舍。任务拆分 MUST 以范围明确、可执行、可验证为准，不得宣称拆得越细必然越准确。

#### Scenario: 读者先审阅计划再执行
- **WHEN** 读者需要 Agent 完成包含多个步骤的任务
- **THEN** 文章建议先澄清目标并审阅计划，再让 Agent 分步执行和验证，避免把复杂任务当作一次性许愿

#### Scenario: 读者理解 OpenSpec 产物
- **WHEN** 读者使用 OpenSpec 组织一个 change
- **THEN** 文章区分 Proposal、Design、Specs 和 Tasks 的用途，并说明任务拆分应足够清楚且可验证，而非一味追求更细

#### Scenario: 读者按阶段选择模型
- **WHEN** 读者考虑规划与执行使用不同模型
- **THEN** 文章将强模型规划、低成本模型执行作为依任务复杂度和实际费用决定的可选策略，不承诺一定节省 Token 或提高效果

### Requirement: 教程应提供 Agent 安全使用与结果复核方法
第六章 MUST 汇总 Agent 使用中的隐私、安全、权限和质量检查方法。文章 MUST 提醒读者保护 API Key 与私有代码，审查第三方模型服务、项目指令、Skill 及其脚本，并根据 Agent 产品提供的沙箱、权限和审批机制限制操作。任务完成后 MUST 建议读者查看改动摘要或 diff、运行与任务相关的测试并核对结果；对高影响操作应先人工确认，并保留撤销或回退方式。安全提醒可在相关前文章节提前出现，但第六章 MUST 将其整理成可执行的复核流程，不得把 Agent 自报“完成”当作正确性证明。

#### Scenario: 读者复核 Agent 的代码改动
- **WHEN** Agent 声称已完成代码修改
- **THEN** 文章引导读者检查改动范围和 diff、运行相关测试、确认结果，并在不符合预期时使用回退方式

#### Scenario: 读者评估操作风险
- **WHEN** Agent 请求访问敏感信息、联网、执行高影响命令或采用第三方 Skill
- **THEN** 文章建议读者核验来源、检查权限与脚本、保护密钥，并在必要时拒绝或要求人工审批
