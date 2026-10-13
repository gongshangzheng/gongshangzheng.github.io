## Context

动机与产出范围见 `proposal.md`。本 change 规划单篇中文实操教程，目标分类为 `categories/AI/Agent`；该分类尚无系列编号规则，因此不分配 `sub_id`，不关联 Hub。库内已有 `harness-engineering-notes.html` 与 Agent 行业调研系列，提供概念和工程背景，但本篇定位为工具入门与配置操作，不重复其理论主线。另有 `drafts/pi-intro.org`，属于 Pi 专题草稿，不作为本篇文章规划载体。

规划材料依据：
- Codex 官方 AGENTS.md 文档：<https://learn.chatgpt.com/docs/agent-configuration/agents-md>
- Codex 官方产品文档、Skills 文档及 OpenAI API 文档：写作前回到官方页面核对当前路径、能力与术语。
- Codex 官方产品与桌面入门页：<https://openai.com/codex/>、<https://chatgpt.com/features/codex-get-started/>；Codex Skills 文档：<https://learn.chatgpt.com/docs/build-skills>。
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

- **问题是什么？** 新手既要在多个 Agent 产品中做选择，也会遇到模型服务、套餐和 API 计费等概念；开始使用后，还需要知道如何给 Agent 项目背景、复用任务流程并避免任务跑偏。库内已有 Agent 与 Harness 概念文章，但缺少一条从产品选择走到实际使用方法的完整入门路径。
- **文章提出的解决路径是什么？** 先介绍主流 Agent 产品并说明 Codex 桌面端适合作为新手起点，再解释模型与服务方案；随后用选读章节说明 Harness 如何让模型借助工具与外界交互；接着把上下文、AGENTS.md 与 Skill 串起来，介绍规划和执行方法，最后集中说明安全使用、结果复核与回退。CC Switch 的具体操作只链接视频 13:45。
- **核心思想（编辑归纳）**：读者先知道该选择什么，再理解 Agent 背后的模型服务，学会提供合适的上下文、把复杂目标拆成可审阅步骤，并检查 Agent 是否安全、正确地完成了任务。工具、指令、规划和复核都围绕“让 Agent 更可靠地完成手头任务”展开。

## 文章内容大纲

### `agent-tutorial`｜《Agent 使用教程》

| 栏位 | 内容 |
|------|------|
| 类型与目标位置 | 原创教程；alias `categories/AI/Agent`；不分配 `sub_id`；Hub：— |
| 服务对象 | 想从图形界面开始使用编程 Agent、并希望理解如何切换模型服务的初学者。该定位仅用于内部规划，不在正文单列“这篇写给谁”。 |

**视频参考范围**：开场嵌入 [《盘点 Codex (ChatGPT) 半年间更新，省 Token 技巧 + 新奇玩法》](https://www.bilibili.com/video/BV1XwaH6AE9a)，建议读者先看前 15 分钟。模型服务章节如提到用 CC Switch 接入国产模型，直接链接至该视频从 13:45 开始的位置，不另写接入步骤。引用视频时只写已核实的信息，不根据标题猜测具体内容。整篇教程最终集中在 `src/pages/agent-tutorial.html`，不以“第一篇”或系列分篇发布。

**文章结构**

**标题层级规划**：六章作为章节标题；三级标题只承载主要主题，操作细节、例子和比较下放四级标题，避免目录过长。各章结构如下：
- 第一章：三级标题“Agent 产品”“Codex 入门”；“Codex 入门”下设四级标题“桌面端”“入门视频”。
- 第二章：三级标题“模型服务”“费用方案”“方案选择”；分别用四级标题展开模型与 API、订阅与 Coding Plan、API 按量计费、按使用频率选择及 CC Switch 视频指引。
- 第三章：三级标题“Harness 工作方式”“上下文与权限”；用四级标题组织组件分工、工具调用与结果回传、任务场景。
- 第四章：三级标题只保留“AGENTS.md”“Skill”；AGENTS.md 下设“作用范围与加载”“编写与验证”，Skill 下设“工作流与调用”“搜集站与推荐”“安装前检查”。
- 第五章：三级标题“计划与执行”“OpenSpec”；用四级标题说明阶段安排、模型选择及计划文件分工。
- 第六章：三级标题“安全使用”“结果复核”；用四级标题展开密钥与第三方服务、权限限制、差异检查、测试和回退。

#### 第一章：编程 Agent
- **写什么**：把 Agent 作为用户可以安装或访问的软件产品来介绍，重点列出 Codex、Claude Code、Kimi Code、ZCode、DeepSeek Harness，并可用 Pi Agent 等作补充。区分 Agent 产品与它所使用的模型/API 服务。说明 Codex 桌面端界面较直观、适合新手跟着入门，同时注明 Codex 也有终端入口；这是本教程选择它作为起点的理由，不是对所有用户的绝对排名。Kimi Code、ZCode、DeepSeek Harness 的国产产品属性、厂商信息及 DeepSeek Harness 的开源/预览状态均按官方资料核实。
- **素材来源**：OpenAI Codex 官方产品/下载/快速开始文档；Anthropic Claude Code 官方概览与安装文档；Pi 官方项目文档；Kimi Code 官方产品与文档（https://www.kimi.com/code/）；ZCode 官方产品页（https://zcode.z.ai/cn）；DeepSeek Harness 官方产品页（https://www.deepseek.com/en/harness/）及官方代码仓库；智谱 GLM 官方模型/API 文档；`harness-engineering-notes.html` 仅作概念背景。
- **必备元素**：Agent 产品与模型/API 服务的分层图或对照表；各产品的官方定位、主要交互入口和平台/登录限制；明确 Kimi Code、ZCode、DeepSeek Harness 是国产 Agent 产品，并准确描述 DeepSeek Harness 当前状态；说明 Codex 桌面端对新手友好的原因及其终端入口。一张六款产品官方页面截图拼图，更新时逐页等候至少 4 秒、确认加载并回到页面顶端，图注注明日期及“仅展示产品入口，不构成功能排名”。嵌入指定 B 站视频，说明前 15 分钟可帮助读者建立 Codex 的初步使用印象。

#### 第二章：模型与付费方案
- **写什么**：从“Agent 用的模型从哪里来”切入，说明模型/API 服务与 Agent 客户端不是同一层，再介绍 API 按量计费和 Token Plan（部分服务称 Coding Plan）等方案。围绕使用频率给出建议：每月只用几次时，可考虑 DeepSeek API，费用随实际用量变化且没有 Token Plan；日常持续使用时，优先比较 Kimi Code 与 GLM Coding Plan 中确实包含编程 Agent 权益的档位；用量较大时再比较更高档额度、月付与年付总价。介绍 ChatGPT/Codex 订阅时说明体验、额度、地区与购买条件，并提醒非官方代购渠道存在账号和资金风险。API 不应笼统归为“更贵”：低频使用可能更合算，高频使用则需对照真实用量和套餐额度。需要了解用 CC Switch 为 Codex 配置国产模型时，只给视频 13:45 直达链接，不写操作步骤，也不说成切换 Codex 自身订阅方案。
- **素材来源**：DeepSeek、智谱 GLM、Moonshot AI/Kimi 官方模型/API 文档、定价页及会员权益说明；Anthropic 与 OpenAI 官方产品/API 文档及套餐页；Pi 官方模型与配置文档。以官网当前页面为准，核对套餐是否包含对应 Agent、月付/年付口径和 API 计费单位，价格核查日期为 2026-10-12。
- **必备元素**：API、Agent/聊天产品订阅、Token Plan/Coding Plan 的对照；DeepSeek 只有 API、没有 Token Plan；Kimi 与 GLM 适用档位、实际 Agent 权益、额度、月付/年付总价；ChatGPT/Codex 的地区和购买限制提醒；按低频、日常和高用量分别给出选择依据，不用单一价格断言哪种方案一定更便宜。配官方价格截图拼图，标注币种、核查日期和价格变动提醒。CC Switch 作为外部视频指引，不展开配置步骤。

#### 官方价格核查记录（2026-10-12）

- **Codex / ChatGPT**：官方定价页显示多个 ChatGPT 个人套餐包含不同额度的 Codex 使用；Plus 为 $20/月，Pro 从 $100/月起，页面列出 $100、$200、$500 档。Codex 的 API Key 用量另按 API 价格计算。来源：<https://learn.chatgpt.com/docs/pricing>
- **Claude Code**：Claude Pro 包含 Claude Code。核查页面显示 Pro 月付 $30，年付 $300（折合 $25/月），Max 从 $149.99/月起；该页面价格含 9% GST，不能直接泛化为其他地区价格。来源：<https://claude.com/pricing>
- **Kimi Code**：帮助中心列出的国内套餐为 Go ¥49/月、Plus ¥99/月、Pro ¥199/月、Max ¥699/月；年付总价依次为 ¥468、¥948、¥1,908、¥6,708。Go 不含 Kimi Code，Plus 及以上可用。购买页面仍显示会员方案切换提示，文章须提醒读者以结算页当前权益为准。来源：<https://www.kimi.com/help/membership/membership-pricing>、<https://www.kimi.com/membership/pricing>
- **GLM Coding Plan**：连续包年页面显示 Lite、Pro、Max 折合 ¥82.6、¥376.6、¥754.6/月，并标示支持 ZCode、Claude Code 等 20 多款编程工具。以上为年付折合月价。来源：<https://open.bigmodel.cn/glm-coding>
- **DeepSeek API**：无固定月费 Token Plan，按 Token 用量结算。价格页按百万 Token、缓存命中/未命中及高峰/非高峰列价；截图与文章记录了 DeepSeek Flash、V4 Pro 的价格。来源：<https://api-docs.deepseek.com/quick_start/pricing/>
- **Pi**：Pi 模型目录按供应商显示每百万 Token 的输入、输出和缓存价格；实际费用取决于选用的模型及供应商。来源：<https://pi.dev/models>
- **截图素材**：套餐与 API 价格截图拼图保存于 `media/images/agent-tutorial/agent-pricing-collage-2026-10-12.webp`；图中不同币种、地区、额度和计费方式不作简单价格排名。

#### 产品入口核查记录（2026-10-13）

- **Codex**：OpenAI 产品页 <https://openai.com/codex/>、入门页 <https://chatgpt.com/features/codex-get-started/> 与更新说明 <https://openai.com/index/codex-for-almost-everything/> 提供桌面应用入口、macOS/Windows 平台和下载/登录说明；入门流程使用 ChatGPT 账号登录。Codex 同时有 CLI 文档 <https://learn.chatgpt.com/docs/codex/cli>。页面未声明固定客户端版本，正文按核查日期而非版本号标注。
- **Claude Code**：Anthropic 官方概览 <https://code.claude.com/docs/en/overview> 列出终端、IDE、桌面端和网页等入口；不再将其概括为只有终端。
- **Pi Agent**：Pi 官方站 <https://pi.dev/> 将其定位为可由使用者定制的 Agent Harness；正文不将其和模型/API 服务混作同类。
- **Kimi Code**：Moonshot AI 官方产品页 <https://www.kimi.com/code/> 与桌面快速开始 <https://www.kimi.com/en/help/kimi-code/desktop-getting-started> 显示其为国产编程 Agent，并有终端、IDE 与桌面入口。
- **ZCode**：智谱官方产品页 <https://zcode.z.ai/cn> 及 2026-10-12 官方页面截图用于核对产品定位和 macOS（Apple Silicon）客户端入口；文中明确为国产 Agent 产品，不将其与 GLM 模型/API 等同。
- **DeepSeek Harness**：官方产品页 <https://www.deepseek.com/en/harness/> 标明 public preview、开源和可组合插件定位；页面说明可运行桌面应用或从代码启动 Web UI。使用条款 <https://www.deepseek.com/en/harness/terms-of-use/> 说明用户需自行获取并配置模型 API。因此正文将 Harness 作为 Agent 工作环境、DeepSeek API 作为模型服务分别介绍。
- **浏览器核验说明**：Codex 开发文档站对自动浏览返回 403；Codex 产品/入门页、官方更新说明、官方搜索索引与官方文档路径交叉核对。核验日期为 2026-10-13；如官方入口改版，发布前应再次检查。

- **站内延伸阅读**：第三章链接至 `harness-engineering-notes.html`，供想深入了解 Harness 工程实践的读者继续阅读。库内检索未发现其他页面已引用 `agent-tutorial.html`，因此暂不改写其他文章添加回链。

#### 第三章（选读）：Harness Engineering
- **写什么**：先说明大语言模型根据上下文生成输出，但本身不直接读取或修改用户电脑；Agent 是由模型、Harness、工具及运行状态组成的工作系统，不能与模型本身画等号。明确区分 Harness（围绕模型组织上下文、工具和运行环境的执行/调度框架）与 Harness Engineering（设计并持续改进这套框架的工程实践）；后者不只是声明工具，还关注任务意图、可操作环境、权限边界和验证反馈。解释 Harness 如何向模型提供可用工具及其调用格式、接收模型输出；模型可以直接给出文本答案，也可以在需要外部操作时生成结构化工具调用请求——不是每次输出都是工具调用。Harness 负责解析并按权限调度工具，在运行环境中执行，再把文件内容、命令输出等结果写回上下文；随后模型继续处理，直到给出答复。补充上下文选择和管理、执行权限与审批，并用读取、编辑和测试代码的例子串起循环。明确本部分为选读：只想先使用 Agent 的读者可以跳过，跳过不影响后续章节。
- **素材来源**：OpenAI《Harness engineering: leveraging Codex in an agent-first world》<https://openai.com/index/harness-engineering/>（2026-02-11；说明设计 Agent 工作环境、明确任务意图和建立反馈循环，访问日期：2026-10-13）；OpenAI Function calling 文档 <https://developers.openai.com/api/docs/guides/function-calling>（模型提出工具调用、应用执行并回传结果，访问日期：2026-10-13）；Anthropic《Tool use with Claude》<https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview>（工具请求、客户端执行和结果回传，访问日期：2026-10-13）；Codex CLI 文档 <https://learn.chatgpt.com/docs/codex/cli>（检查代码、编辑文件和运行本地命令）；Codex Agent approvals & security <https://learn.chatgpt.com/docs/agent-approvals-security>（沙箱与审批策略）；已有 `harness-engineering-notes.html` 作为进一步阅读材料。
- **必备元素**：区分 Harness 与 Harness Engineering；模型、Harness、Tool、Agent 的职责对照；“用户请求 → Harness 组织上下文和工具说明 → 模型回答或提出工具调用请求 → Harness 检查权限并执行 → 工具结果回填上下文 → 模型继续处理/回答”的循环；强调不是每次模型输出都会调用工具；`Read`/`Edit` 示例及不同产品名称可能不同的说明；指出工具可以在本地工作区或服务端执行，实际位置取决于产品实现；任务意图、上下文管理、反馈验证、权限与审批的作用；明确选读及可跳过且不影响后文。
- **具体场景**：以“修复登录失败并补回归测试”为贯穿任务，逐项说明本轮请求、任务所涉及路径上的 `AGENTS.md` 文件内容（项目技术栈、认证代码边界、测试命令）、按需读取的认证代码与工具结果、工具说明及参数，以及适用时加载的 Skill 指令和参考资料。Codex 按目录作用范围发现指令文件，并将发现文件的完整内容合并进指令上下文（受默认 32 KiB 总量上限约束）；这里匹配的是哪些文件对当前路径生效，不是模型逐条筛选文件里的规则。其他 Agent 的加载机制可能不同。明确不必把整个仓库或所有 Skill 一股脑放进上下文。再用同一场景说明沙箱、工具权限和审批如何约束文件范围、测试命令、网络或仓库外操作；实际执行边界不能只靠提示词。以“长期项目约定写入 `AGENTS.md`，任务专用步骤交给 Skill”引出后续两章。

#### 第四章：上下文、AGENTS.md 与 Skill
- **写什么**：先解释上下文是 Agent 本轮处理任务时可参考的信息，再用示意图展示任务请求、指令、相关代码、工具说明与执行结果如何进入模型上下文，并把沙箱、工具权限和审批标为独立的执行边界。接着分别介绍 AGENTS.md 与 Skill：AGENTS.md 保存较稳定的个人或项目约定，Skill 提供可复用的任务指令和工作流，Tool 则是执行读取、编辑等操作的具体能力。不同产品的加载机制可能不同；对 Codex，按路径作用范围发现 AGENTS.md 文件，再合并被发现文件的完整内容，而非逐条匹配规则；总内容受默认 32 KiB 上限约束。Skill 是否完整加载也取决于产品及调用方式。标题只保留“AGENTS.md”和“Skill”两个三级主题，具体说明下设四级标题。
- **标题结构**：
  - **三级标题：AGENTS.md**
    - **四级标题：作用范围与加载**：说明全局与项目级指令的适用路径、Codex 如何发现并合并文件内容，以及它与任务相关性判断的区别。
    - **四级标题：编写与验证**：用简短示例说明如何组织规则、如何确认规则已加载；避免敏感信息进入指令文件。
  - **三级标题：Skill**
    - **四级标题：工作流与调用**：解释 Skill 与 AGENTS.md、普通提示词和 Tool 的区别，说明显式调用、按描述匹配及按需加载可能因客户端而异。
    - **四级标题：搜集站与推荐**：介绍 SkillHub、skills.sh、SkillsMP 等发现入口；按交付物推荐归藏 PPT Skill、PPT Master 与 Scientific Agent Skills。
    - **四级标题：安装前检查**：提醒检查原始来源、`SKILL.md`、安装命令与脚本，留意文件读取、网络访问、命令执行和敏感信息处理，并尽量限制权限。
- **素材来源**：Codex 官方 AGENTS.md 文档 <https://learn.chatgpt.com/docs/agent-configuration/agents-md>；OpenAI《Build skills》<https://learn.chatgpt.com/docs/build-skills>；SkillHub <https://skillhub.cn/>、skills.sh <https://skills.sh/>、SkillsMP <https://skillsmp.com/zh>；归藏 PPT Skill <https://github.com/op7418/guizang-ppt-skill>、PPT Master <https://github.com/hugohe3/ppt-master>、Scientific Agent Skills <https://github.com/K-Dense-AI/scientific-agent-skills>；Agent Skills 规范 <https://agentskills.io/specification>。沿用上方已记录的官方核查信息，正文写作前复核动态路径与调用行为。
- **必备元素**：上下文的组成及按任务筛选/加载的边界；Codex 按文件路径作用范围发现 AGENTS.md、合并文件内容（默认总量上限 32 KiB），而不是逐条匹配规则；Skill 与项目指令、普通提示词和 Tool 的区别；SkillHub、skills.sh、SkillsMP 等发现入口；归藏 PPT Skill 的单文件 HTML 演示、PPT Master 的可编辑 `.pptx`、Scientific Agent Skills 的科研/科学计算工作流；目录审核或热度不构成安全保证。提醒读者检查原始来源、`SKILL.md`、安装命令和附带脚本，留意文件读取、网络访问、命令执行和敏感信息处理，不暴露密钥并尽量限制权限。

#### 第五章：规划与执行
- **写什么**：说明复杂任务直接交给 Agent 自行发挥容易偏离目标；先把需求说清、形成计划、人工审阅，再按可检查的步骤执行，既能减少返工，也帮助读者理解任务本身。规划时可选用能力更强的模型、执行时按任务改用更经济的模型，但这是按任务复杂度与模型能力灵活调整的策略，不保证每次都省钱或更好。用 OpenSpec 作为示例，解释 Proposal 记录动机和范围、Design 记录方案、Specs 写清验收要求、Tasks 拆成可执行清单；说明具体工作流可能按 change 类型有所不同。任务拆分应让每步都能执行和验证，不以“越细越好”为标准。
- **素材来源**：OpenSpec 官方项目与文档 <https://github.com/Fission-AI/OpenSpec>；本仓库 `openspec/specs/content-change-planning/spec.md` 与 `.agents/skills/blog-rules/references/openspec-gate.md` 作为实际规划案例；模型价格和服务方案沿用本章官方来源。
- **必备元素**：从需求澄清、计划审阅、执行到验证的流程图；Proposal、Design、Specs、Tasks 的职责对照；直接许愿式下达复杂目标与先审阅计划的差异；如何把任务拆成范围明确、结果可核验的步骤；按任务选择规划模型与执行模型的注意事项。此处简要提示高影响操作需按产品权限机制审批，改动复核与回退方法集中放在第六章。

#### 第六章：安全与复核
- **写什么**：把前面分散在服务、上下文、Skill 和工具使用中的安全提醒收束成一套日常检查方法。说明 API Key 和私有代码的处理边界，第三方模型服务、项目指令和 Skill 的信任风险，工具权限与高影响操作的审批；任务完成后先看改动摘要和 diff，再运行相关测试、核对结果，必要时撤销改动或回到安全版本。避免把 Agent 的“已完成”当作正确性的证明。
- **素材来源**：Codex 官方安全、工具权限、AGENTS.md 与配置文档（写作前核实）；Skill 来源项目文档及 Agent Skills 规范；OpenSpec 的 Review/验证流程；本文实际操作记录（脱敏并注明版本/核查日期）。
- **必备元素**：密钥不入库、不贴入不可信服务；审查第三方服务、Skill、项目指令及附带脚本；按任务限制文件、网络和命令权限；审阅 diff、运行相关测试、确认任务结果；保留可回退方式，并在高影响操作前人工确认。



**关键数据点**（均须在写作时核对版本与口径）

- Codex 官方 AGENTS.md 文档（访问日期：2026-10-12）说明：默认全局指令位于 `~/.codex/AGENTS.md`；项目指令从项目根目录向当前工作目录逐层发现，并按根目录到更深目录的顺序合并；默认合并上限为 32 KiB。
- CC Switch 的视频指引使用 B 站视频 BV1XwaH6AE9a 的 13:45 时间戳；链接发布前应确认时间参数可用，不将视频内容扩写为未经复核的步骤。
- Codex App 支持平台、下载入口、账号/订阅要求均为动态信息，必须以 OpenAI 官方页面为准；若不能核实，正文明确标注核查日期和限制。

**配图计划**：文章使用两张官方页面截图拼图，分别展示 Agent 产品入口与套餐/API 价格；另以 Mermaid 绘制三张简洁示意图，解释 Harness 工具调用循环、第四章上下文组成与权限边界、OpenSpec 规划和执行顺序。上下文图需说明任务请求、适用的 `AGENTS.md`、按需匹配的 Skill、相关代码/工具结果与工具说明如何按任务进入模型上下文，并将沙箱、工具权限和审批标为独立的执行边界；不追加装饰性产品截图或 CC Switch 操作截图。截图素材存放于 `media/images/agent-tutorial/`。

## Decisions

- 开场简要呈现 Agent 产品/客户端与模型服务的分层全景，再解释采用 Codex 桌面端作为教程入口的理由；不以“后文要讲 Codex”作为推荐的主要依据，也不让市场盘点喧宾夺主。
- 开场视频帮助读者先对 Codex 的基本操作建立直观印象；模型服务部分只在需要时用 13:45 时间戳链接指向 CC Switch 接入演示，不复写详细步骤；后续章节顺着读者自然产生的问题，补充设定规则和使用工具等实用技巧。
- 正文面向入门读者，不把作者与读者混为一谈；避免“由你提供”等仅对作者/编辑过程成立的元叙述，延伸材料改用读者视角的中性推荐语。
- 全文采用循循善诱、自然清楚的讲解语气：从读者可能遇到的困惑或实际问题起笔，先解释眼前概念，再逐步引出术语、步骤和例外；必要时用具体场景或简单类比帮助理解。
- 正文写给正在学习的读者，不写给作者、编辑或审稿流程看。不得把写作策略、素材筛选理由、未核实声明、编辑备注或“本文只做……/不打算……”之类的过程说明带入正文；必要的事实边界应改写成对读者有用的提醒，或留在设计文档与参考来源中。
- 避免机械的免责声明、重复总结、密集堆叠术语和模板化转折。每段只承担一个清楚的讲解任务，段与段之间说明自然的因果或承接关系；表格和清单用于压缩信息，不替代关键概念的解释。
- 说明选择时讲清楚“为什么这对读者有帮助”，同时交代适用边界；不把中性比较写成产品排名，也不为了面面俱到而堆砌产品名或功能点。
- Codex 桌面端是面向新手的示例入口，不是对 Codex 终端形态或其他 Agent 的否定；比较只覆盖读者选择工具所需的交互入口、配置门槛和适用情景。
- 全文固定为六章：Agent 产品、模型与付费方案、Harness Engineering（选读）、上下文/AGENTS.md/Skill、规划与执行、安全与复核。把市场选择、原理、上下文、任务方法和执行后检查连成一条读者路径；安全与复核单独收束为可操作的检查清单，不再只是散落的提醒。
- 对 API 与 Token Plan/Coding Plan 不做先验价格排名；按使用频率、实际额度和套餐权益提出选择建议，并在写作时复核价格。个人日常使用优先比较 Kimi 与 GLM 中确实包含编程 Agent 权益的套餐；低频使用可考虑 DeepSeek API；重度使用再比较高档额度。明确 DeepSeek 没有 Token Plan。
- CC Switch 的定位是协助配置或切换模型服务，不是切换 Codex 自身的订阅方案；正文只给指定视频 13:45 的链接。
- OpenSpec 的 Proposal、Design、Specs、Tasks 各自承担不同作用；不把 Proposal 与 Design 混为一谈，也不宣称任务拆得越细越准确。
- 第四章把上下文、AGENTS.md 与 Skill 放在一起讲，以任务场景说明它们的关系；对 Skill 是否以及何时加载作产品相关的谨慎描述，并将发现入口、推荐示例和安全检查放在同一章。
- 文章中可见的章节和小节标题都要逐项审校，使用直接点明主题或任务的短词组；删除“先认识”“先来看看”“想先看个演示”等铺垫语，避免空泛问句、重复副标题和不提供信息的过渡词。最终对照页面目录核对标题是否简洁且能独立说明内容。
- 不在本文编写 CC Switch 的供应商配置、协议转换、重启与回退步骤；将篇幅留给可迁移到不同 Agent 的项目指令、Skills、Tools 和规划技巧。
- “这篇写给谁”只作为本文件的服务对象字段，不在文章中设置读者画像章节。
- 不引用未核实的搜索跳转链接；发布前尽量换成官方原文和教程原始 URL，并记录核查时间。

## Risks / Trade-offs

- [产品能力和 UI 随版本变化] → 文章标注核查日期/版本；写作前以官方文档及当前 App 复核，易变步骤避免写死截图外的字段。
- [套餐价格和权益变化，且不同服务的用量不可直接横比] → 发布前核对官方价格、地区、额度和实际 Agent 权益；以用量场景解释选择，不写 API 或订阅天然更便宜/更贵。
- [视频时间戳或内容可能变化] → 正文只作延伸指引，链接发布前核对时间参数；不依视频标题或时间点以外的信息推演操作步骤。
- [第三方中转存在隐私、稳定性、计费与条款风险] → 不推荐商家、不输入敏感代码做测试；提醒读者查看服务条款和数据处理方式。
- [AGENTS.md 的发现与优先级规则可能变化] → 以写作时的 Codex 官方文档为准，注明访问日期，并避免把规则描述泛化到所有 Agent。
- [主题与既有 Agent/Harness 文章部分重叠] → 本篇聚焦从产品选择到任务规划的使用路径；Harness 只作选读解释，理论背景提供延伸链接，不复述既有长篇内容。
