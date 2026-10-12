## Context

动机与产出范围见 `proposal.md`。本 change 规划单篇中文实操教程，目标分类为 `categories/AI/Agent`；该分类尚无系列编号规则，因此不分配 `sub_id`，不关联 Hub。库内已有 `harness-engineering-notes.html` 与 Agent 行业调研系列，提供概念和工程背景，但本篇定位为工具入门与配置操作，不重复其理论主线。另有 `drafts/pi-intro.org`，属于 Pi 专题草稿，不作为本篇文章规划载体。

规划材料依据：
- Codex 官方 AGENTS.md 文档：<https://learn.chatgpt.com/docs/agent-configuration/agents-md>
- Codex 官方产品文档、Skills 文档及 OpenAI API 文档：写作前回到官方页面核对当前路径、能力与术语。
- CC Switch 接入国产模型的外部指引：B 站视频 BV1XwaH6AE9a，从 13:45 开始；正文只提供时间戳直达链接。
- 模型服务/API 与价格依据：各厂商官方 API 文档、定价页面和已核对的截图素材。

## Goals / Non-Goals

**Goals:**
- 让读者能从图形化客户端开始，完成一个低风险的 Agent 初次任务。
- 对于使用 CC Switch 接入国产模型的具体操作，直接指向指定视频 13:45，不在正文重复编写配置教程。
- 解释规则文件、Skills 和提示词的用途边界及第三方 Skill 的安全风险。
- 对版本敏感的 UI、平台可用性和配置字段在写作前核对官方文档与实测，正文注明版本/日期。

**Non-Goals:**
- 不写成 Codex、Claude Code、Pi 的全面横向测评，也不把 Codex 宣称为所有新手的唯一或绝对最佳选择。
- 不推荐特定 API 中转商，不承诺其价格、稳定性、模型质量或合规性。
- 不展开 Pi 的完整教程，不在本 change 中修改 Agent 工具配置或执行生产环境操作。
- 不把“这篇写给谁”作为文章中的独立章节；读者定位只作为内部规划约束。

## 核心问题与解法速览

- **问题是什么？** 初次使用 Agent 的读者会遇到很多产品名、套餐和 API 计费方式，也常常需要反复告诉 Agent 项目约定。库内已有 Agent 概念与 Harness 文章，但缺少从桌面客户端出发、讲清这些实际使用问题的完整教程。
- **文章提出的解决路径是什么？** 先用简短的 Agent 市场概览帮助读者认识产品入口，再说明模型服务与计费；想了解 CC Switch 接入国产模型时，提供视频 13:45 的直达链接；随后以 AGENTS.md、Skill、Tool 和规划工具为主线，补充可迁移到不同 Agent 的使用技巧。
- **核心思想（编辑归纳）**：Agent 入门不是只选一个模型，而是理解客户端、模型服务、项目指令与技能扩展之间的分工。教程以一条可回退的实践路径组织，不把单一工具推荐泛化到所有用户。

## 文章内容大纲

### `agent-tutorial`｜《Agent 使用教程》

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 原创教程；alias `categories/AI/Agent`；不分配 `sub_id`；Hub：— |
| 服务对象 | 想从图形界面开始使用编程 Agent、并希望理解如何切换模型服务的初学者。该定位仅用于内部规划，不在正文单列“这篇写给谁”。 |

**视频参考范围**：开场嵌入 [《盘点 Codex (ChatGPT) 半年间更新，省 Token 技巧 + 新奇玩法》](https://www.bilibili.com/video/BV1XwaH6AE9a)，建议读者先看前 15 分钟。模型服务章节如提到用 CC Switch 接入国产模型，直接链接至该视频从 13:45 开始的位置，不另写接入步骤。引用视频时只写已核实的信息，不根据标题猜测具体内容。整篇教程最终集中在 `src/pages/agent-tutorial.html`，不以“第一篇”或系列分篇发布。

**文章结构**

#### 开场：市面上有哪些编程 Agent，为什么从 Codex 桌面端开始
- **写什么**：用简明市场地图帮助新手认清 Claude Code、Pi Agent、Codex、Kimi Code、ZCode、DeepSeek Harness 等入口，区分 Agent 产品与模型/API 服务，并说明 Codex 桌面端为什么适合作为本文的起步示例。此处服务于后续实际教程，不展开成产品百科或独立文章；控制篇幅，把重点留给后续使用步骤。Kimi Code、ZCode、DeepSeek Harness 的产品属性和厂商信息，以及 DeepSeek Harness 的开源/预览状态，均按官方资料核实。
- **素材来源**：OpenAI Codex 官方产品/下载/快速开始文档；Anthropic Claude Code 官方概览与安装文档；Pi 官方项目文档；Kimi Code 官方产品与文档（https://www.kimi.com/code/）；ZCode 官方产品页（https://zcode.z.ai/cn）；DeepSeek Harness 官方产品页（https://www.deepseek.com/en/harness/）及官方代码仓库；智谱 GLM 官方模型/API 文档；`harness-engineering-notes.html` 仅作概念背景。
- **必备元素**：一张分层示意或比较表，分清 Agent 产品与模型服务；至少比较 Claude Code、Pi Agent、Codex、Kimi Code、ZCode、DeepSeek Harness 的官方产品形态和交互入口；简要指出 Kimi Code、ZCode、DeepSeek Harness 是国产 Agent 产品，并分别标明厂商；DeepSeek Harness 的开源属性和预览阶段须按官方当前状态表述；Codex 桌面端适合新手的理由、限制及其终端入口说明；当前平台、登录和可用性核查说明。配一张由六款产品官方页面截图构成的拼图；更新截图时每次进入页面后等待 4 秒，确认页面内容已加载，滚动回页面顶端再截图，图注注明截图日期和“仅展示产品入口、不构成功能排名”。作为入门延伸材料，推荐读者先观看 [《盘点 Codex (ChatGPT) 半年间更新，省 Token 技巧 + 新奇玩法》](https://www.bilibili.com/video/BV1XwaH6AE9a) 的前 15 分钟，并以站内播放器嵌入。

#### 第一部分：模型服务怎么选——从 Agent 产品到模型/API
- **写什么**：承接开场视频建立的 Codex 使用初步印象，从“模型从哪里来、API Key 是什么、会员能不能直接用”讲起，介绍 DeepSeek、智谱 GLM、Kimi 等模型厂商及其官方 API 服务，并简要定位 Anthropic/Claude 与 OpenAI/ChatGPT。说明模型服务/API 与 Agent 客户端不是同一层，具体支持情况要看 Agent 与服务商的说明。补充 Codex、Claude Code、Kimi Code、ZCode 等相关订阅或 Coding Plan 的代表性价格，并区分 Agent/聊天产品订阅、跨工具 Coding Plan 与 API 按量计费。明确 DeepSeek 提供 API 按 Token 用量计费，没有 Token Plan；Pi 没有统一订阅价，费用取决于所接入的模型供应商。价格按核查日和币种呈现，不做跨地区、跨额度的简单高低排名。需要了解 CC Switch 接入国产模型时，给出指定视频 13:45 的直达链接。
- **素材来源**：DeepSeek、智谱 GLM、Moonshot AI/Kimi 官方模型/API 文档、定价页及会员权益说明；Anthropic 与 OpenAI 官方产品/API 文档及套餐页；Pi 官方模型与配置文档。以官网当前页面为准，核对套餐是否包含对应 Agent、月付/年付口径和 API 计费单位，价格核查日期为 2026-10-12。
- **必备元素**：DeepSeek / GLM / Kimi 简明对照（官方服务入口、模型/API 层定位、服务与计费说明及官方链接）；价格表区分 Codex/Claude 订阅、Kimi Code 会员权益、可供 ZCode 等工具使用的 GLM Coding Plan、Pi 的供应商计费和 DeepSeek API 按量计费；指出低价入门档未必包含编程 Agent 权益，年付与重度套餐可能达到或超过千元；说明订阅产品与 API Key 的区别。配一张官方价格页截图拼图，标注币种、核查日期及价格可能变化的提醒，不作无依据的模型性能或价格排名。CC Switch 仅通过视频时间戳链接引导，不展开配置步骤。

#### 官方价格核查记录（2026-10-12）

- **Codex / ChatGPT**：官方定价页显示多个 ChatGPT 个人套餐包含不同额度的 Codex 使用；Plus 为 $20/月，Pro 从 $100/月起，页面列出 $100、$200、$500 档。Codex 的 API Key 用量另按 API 价格计算。来源：<https://learn.chatgpt.com/docs/pricing>
- **Claude Code**：Claude Pro 包含 Claude Code。核查页面显示 Pro 月付 $30，年付 $300（折合 $25/月），Max 从 $149.99/月起；该页面价格含 9% GST，不能直接泛化为其他地区价格。来源：<https://claude.com/pricing>
- **Kimi Code**：帮助中心列出的国内套餐为 Go ¥49/月、Plus ¥99/月、Pro ¥199/月、Max ¥699/月；年付总价依次为 ¥468、¥948、¥1,908、¥6,708。Go 不含 Kimi Code，Plus 及以上可用。购买页面仍显示会员方案切换提示，文章须提醒读者以结算页当前权益为准。来源：<https://www.kimi.com/help/membership/membership-pricing>、<https://www.kimi.com/membership/pricing>
- **GLM Coding Plan**：连续包年页面显示 Lite、Pro、Max 折合 ¥82.6、¥376.6、¥754.6/月，并标示支持 ZCode、Claude Code 等 20 多款编程工具。以上为年付折合月价。来源：<https://open.bigmodel.cn/glm-coding>
- **DeepSeek API**：无固定月费 Token Plan，按 Token 用量结算。价格页按百万 Token、缓存命中/未命中及高峰/非高峰列价；截图与文章记录了 DeepSeek Flash、V4 Pro 的价格。来源：<https://api-docs.deepseek.com/quick_start/pricing/>
- **Pi**：Pi 模型目录按供应商显示每百万 Token 的输入、输出和缓存价格；实际费用取决于选用的模型及供应商。来源：<https://pi.dev/models>
- **截图素材**：套餐与 API 价格截图拼图保存于 `media/images/agent-tutorial/agent-pricing-collage-2026-10-12.webp`；图中不同币种、地区、额度和计费方式不作简单价格排名。

#### 第二部分：让 Codex 记住项目约定——AGENTS.md
- **写什么**：从“为什么每次都要重复介绍项目”切入，说明 AGENTS.md 如何为 Codex 提供持久上下文；区分个人全局偏好与项目约定，并根据 Codex 官方文档说明默认路径、项目发现范围和规则合并顺序。用简短示例展示适合写入的约定，以及如何在新任务中检查 Codex 是否读到了规则。提醒读者不要把 API Key 等秘密写入指令文件，并先审阅来源不明项目里的 AGENTS.md。
- **素材来源**：Codex 官方 AGENTS.md 文档 <https://learn.chatgpt.com/docs/agent-configuration/agents-md>（访问日期：2026-10-12）；必要时参考 Codex 官方配置文档。
- **必备元素**：个人全局文件与项目级文件的对照；`~/.codex/AGENTS.md` 与仓库 `AGENTS.md` 的默认位置说明；嵌套规则的发现与合并方式；最小可用示例；通过新任务请 Codex 总结当前规则来检查是否生效。

#### 第三部分：Skill 是什么，什么时候使用
- **写什么**：单独解释 Skill 的概念、用途和适用场景，说明它如何把可复用的任务指令/流程提供给 Agent；本章聚焦“Skill 是什么、能解决什么问题”，不扩展讲 AGENTS.md、提示词或供应商配置。Codex 官方文档说明 Skill 以含 `SKILL.md` 的目录组织，可附带 scripts、references、assets 等资源；支持显式调用与按任务描述自动匹配，具体入口随客户端而异。
- **素材来源**：OpenAI《Build skills》<https://learn.chatgpt.com/docs/build-skills>（访问日期：2026-10-12；已核对 Skill 目录结构、必需的 `SKILL.md`、可选资源、显式/自动调用及 Codex 发现位置）。
- **必备元素**：Skill 与 AGENTS.md、普通提示词、Tool 的简明区别；一个小型、具体的使用场景；个人与仓库级 Skill 位置；Skill 来源、指令与附带脚本的基本审查提醒。

#### 第四部分：Tool——Agent 如何使用工具
- **写什么**：解释 Agent 语境中的 Tool 是什么：模型如何提出工具调用、运行环境如何执行并返回结果、Agent 如何据此继续推理；说明工具调用与 Skill、AGENTS.md、普通提示词的区别。用读写文件、搜索代码或运行测试等例子说明工具如何让 Agent 与外部环境交互；避免把“Tool”误写成 Codex、Claude Code 这类 Agent 产品/客户端的泛称。
- **素材来源**：OpenAI 官方关于工具调用 / function calling 的文档（写作前核实当前术语与机制）；Codex 官方工具或执行环境文档；已有 `harness-engineering-notes.html` 仅作概念背景。
- **必备元素**：模型请求 → 工具执行 → 结果返回 → 后续行动的流程图；Tool、Skill、AGENTS.md、提示词的职责对比；至少一个具体任务示例；说明工具权限与人工确认的边界。

#### 第五部分：规划工具——用 OpenSpec 等工具先规划再执行
- **写什么**：介绍规划工具解决的问题：把目标拆解为可审阅、可追踪的计划，再由 Agent 按计划执行；以 OpenSpec 为例说明 change、proposal/design/spec/tasks 等 artifact 如何承载需求、设计与任务，以及用户确认如何构成写作/实现前的门禁。可简要提及其他规划/任务追踪方式，但避免写成 OpenSpec 全面手册。
- **素材来源**：OpenSpec 官方文档与 CLI 文档（写作前核实当前概念和命令）；本仓库 `openspec/specs/content-change-planning/spec.md` 与 `.agents/skills/blog-rules/references/openspec-gate.md` 作为本地实践案例。
- **必备元素**：从需求到计划、确认、执行、校验的流程示意图；OpenSpec 核心 artifact 的职责简表；强调计划需经用户审阅，Agent 不应跳过确认直接执行。

#### 第六部分：细节与安全
- **写什么**：集中说明入门过程中容易忽略的细节和安全问题，包括 API Key 与隐私、第三方模型服务/Skill 风险、Tool 权限、项目指令审阅，以及 Agent 改动审查和回退。只补充对读者实际使用有帮助的内容，不扩展成另一个工具教程。
- **素材来源**：Codex 官方安全、工具权限、AGENTS.md 与配置文档（写作前核实）；Skill 来源项目文档；OpenSpec 官方文档；本文实际操作记录（脱敏并注明版本/核查日期）。
- **必备元素**：API Key 不入库；第三方服务需自行评估隐私与条款；工具权限最小化、高风险操作需人工确认；审阅项目指令和 Agent 改动，并保留可回退的工作方式。



**关键数据点**（均须在写作时核对版本与口径）

- Codex 官方 AGENTS.md 文档（访问日期：2026-10-12）说明：默认全局指令位于 `~/.codex/AGENTS.md`；项目指令从项目根目录向当前工作目录逐层发现，并按根目录到更深目录的顺序合并；默认合并上限为 32 KiB。
- CC Switch 的视频指引使用 B 站视频 BV1XwaH6AE9a 的 13:45 时间戳；链接发布前应确认时间参数可用，不将视频内容扩写为未经复核的步骤。
- Codex App 支持平台、下载入口、账号/订阅要求均为动态信息，必须以 OpenAI 官方页面为准；若不能核实，正文明确标注核查日期和限制。

**配图计划**：在同一篇教程中使用 Agent 市场入口拼图与官方套餐/API 价格拼图；AGENTS.md、Skill、Tool 等概念优先用短表格和示例讲清，不为了配图增加脱敏 Codex/CC Switch 截图或协议流向图。目标 `media/images/agent-tutorial/`。

## Decisions

- 开场简要呈现 Agent 产品/客户端与模型服务的分层全景，再解释采用 Codex 桌面端作为教程入口的理由；不以“后文要讲 Codex”作为推荐的主要依据，也不让市场盘点喧宾夺主。
- 开场视频帮助读者先对 Codex 的基本操作建立直观印象；模型服务部分只在需要时用 13:45 时间戳链接指向 CC Switch 接入演示，不复写详细步骤；后续章节顺着读者自然产生的问题，补充设定规则和使用工具等实用技巧。
- 正文面向入门读者，不把作者与读者混为一谈；避免“由你提供”等仅对作者/编辑过程成立的元叙述，延伸材料改用读者视角的中性推荐语。
- 全文采用循循善诱、自然清楚的讲解语气：从读者可能遇到的困惑或实际问题起笔，先解释眼前概念，再逐步引出术语、步骤和例外；必要时用具体场景或简单类比帮助理解。
- 正文写给正在学习的读者，不写给作者、编辑或审稿流程看。不得把写作策略、素材筛选理由、未核实声明、编辑备注或“本文只做……/不打算……”之类的过程说明带入正文；必要的事实边界应改写成对读者有用的提醒，或留在设计文档与参考来源中。
- 避免机械的免责声明、重复总结、密集堆叠术语和模板化转折。每段只承担一个清楚的讲解任务，段与段之间说明自然的因果或承接关系；表格和清单用于压缩信息，不替代关键概念的解释。
- 说明选择时讲清楚“为什么这对读者有帮助”，同时交代适用边界；不把中性比较写成产品排名，也不为了面面俱到而堆砌产品名或功能点。
- Codex 桌面端是面向新手的示例入口，不是对 Codex 终端形态或其他 Agent 的否定；比较只覆盖读者选择工具所需的交互入口、配置门槛和适用情景。
- 模型服务与价格介绍之后直接进入 AGENTS.md，帮助读者从“模型从哪里来”过渡到“怎样让 Agent 理解项目”；CC Switch 接入国产模型作为视频延伸链接，不占据教程主体。
- 不在本文编写 CC Switch 的供应商配置、协议转换、重启与回退步骤；将篇幅留给可迁移到不同 Agent 的项目指令、Skills、Tools 和规划技巧。
- “这篇写给谁”只作为本文件的服务对象字段，不在文章中设置读者画像章节。
- 不引用未核实的搜索跳转链接；发布前尽量换成官方原文和教程原始 URL，并记录核查时间。

## Risks / Trade-offs

- [产品能力和 UI 随版本变化] → 文章标注核查日期/版本；写作前以官方文档及当前 App 复核，易变步骤避免写死截图外的字段。
- [视频时间戳或内容可能变化] → 正文只作延伸指引，链接发布前核对时间参数；不依视频标题或时间点以外的信息推演操作步骤。
- [第三方中转存在隐私、稳定性、计费与条款风险] → 不推荐商家、不输入敏感代码做测试；提醒读者查看服务条款和数据处理方式。
- [AGENTS.md 的发现与优先级规则可能变化] → 以写作时的 Codex 官方文档为准，注明访问日期，并避免把规则描述泛化到所有 Agent。
- [主题与既有 Agent/Harness 文章部分重叠] → 本篇聚焦新手日常使用技巧，理论背景只做必要链接，不复述既有长篇内容。
