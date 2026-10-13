## 1. 计划与素材

- [x] 1.1 复核 Codex 官方下载、平台、登录、AGENTS.md 与 Skills 文档；在 design.md 记录权威 URL、版本和核查日期
- [x] 1.2 核实 Claude Code、Pi Agent、Codex、Kimi Code、ZCode、DeepSeek Harness 的官方产品形态和交互入口；核对 Kimi、GLM、DeepSeek 的模型/API 服务资料，在章节中区分 Agent 产品与模型服务层，并标明 Kimi Code、ZCode、DeepSeek Harness 为国产 Agent 产品
- [x] 1.3 核对指定 B 站视频 BV1XwaH6AE9a 中 CC Switch 接入国产模型的讲解位置；在正文提供 13:45 时间戳直达链接，不另写详细接入步骤
- [x] 1.4 检索博客相关文章并确认交叉链接；已初步发现 `harness-engineering-notes.html`、Agent 行业调研系列及 `drafts/pi-intro.org`
- [x] 1.5 核实 DeepSeek、智谱 GLM、Kimi 的官方模型/API 文档、可用性及价格口径；区分订阅、Coding Plan 与 API 按量计费，不读取或留存密钥，不暴露私有配置，也不对中转服务作未经证实的背书
- [x] 1.9 核对 Codex、Claude Code、Kimi Code、ZCode/GLM Coding Plan、Pi 与 DeepSeek 的官方套餐或 API 计费口径；标明 DeepSeek 无 Token Plan，并记录地区、币种与核查日期
- [x] 1.10 调研 Harness Engineering 与模型工具调用的一手资料；核对 OpenAI 对工作环境、任务意图和反馈循环的说明，以及 OpenAI/Anthropic 对结构化工具请求、应用执行和结果回传的描述，并记录来源链接
- [x] 1.6 为文章各部分搜集并核验参考链接或配图；第一章的六款 Agent 拼图只用官方页面截图，每次更新时逐页等待至少 4 秒、确认内容加载、滚回顶部再截图，并在图注标注日期。第一章嵌入指定视频 BV1XwaH6AE9a；第二章提供同一视频 13:45 的 CC Switch 直达链接。采用自然、简洁的读者视角，不写作者/编辑过程说明，也不依据标题推测具体内容
- [x] 1.7 确认分类 `categories/AI/Agent` 与文章 slug、单篇标题《Agent 使用教程：从入门到实践》，无需分配 sub_id 或 Hub
- [x] 1.8 审批门禁：取得用户对 design.md「文章内容大纲」的明确确认；用户已确认新版六章结构并要求更新规划
- [x] 1.11 根据用户确认的新写作思路，同步更新 proposal.md、design.md 与 capability spec；保留原有价格核查和素材记录

## 2. 单篇写作

- 初版任务记录：下列已完成项对应此前文章版本；本次结构调整由 2.10–2.15 及后续 Review/构建任务跟踪。
- [x] 2.1 在单一文件 `src/pages/agent-tutorial.html` 中完成《Agent 使用教程：从入门到实践》初版，覆盖 Agent 产品、模型服务、Harness Engineering、AGENTS.md、Skill、规划工具和安全事项；Harness 章节区分 Harness 运行框架与 Harness Engineering 实践，解释任务意图、上下文、工具、权限和验证反馈如何构成闭环，并说明大模型与 Agent 的区别、工具调用请求与普通文本输出的区别
- [x] 2.2 可按章节分阶段撰写并交用户审核；各部分均持续整合在同一篇文章中，不另立系列标题、不拆分成多篇，完成后整体复核全文
- [x] 2.3 在初版 AGENTS.md 章节说明全局与项目级规则的作用范围，并提供简洁示例和检查生效的方法
- [x] 2.4 制作价格部分的官方套餐与 API 计费截图拼图，覆盖可核验的订阅/Coding Plan 页面、DeepSeek 按量价格页及 Pi 供应商说明；保存至 `media/images/agent-tutorial/agent-pricing-collage-2026-10-12.webp`
- [x] 2.5 撰写初版 Skill 章节，说明它与 AGENTS.md、提示词和 Tool 的区别，补充可复用工作流示例、调用方式与第三方脚本审查提醒
- [x] 2.6 更新初版 Skill 章节：核验并链接 SkillHub、skills.sh、SkillsMP 等现成目录；按用途推荐归藏 PPT Skill、PPT Master 和 Scientific Agent Skills，说明 HTML 与可编辑 `.pptx` 的交付差异；说明目录审核标记不构成安全保证，并提醒检查原始来源、指令、权限、脚本和密钥
- [x] 2.7 基于 OpenAI 与 Anthropic 官方资料扩写 Harness Engineering 选读章，区分 Harness 与 Harness Engineering，说明上下文、工具、权限和验证反馈如何组织成闭环
- [x] 2.8 将 Agent 产品、模型服务、Harness Engineering 调整为前三章，并精简正文的章节与小节标题
- [x] 2.9 逐项审校文章所有可见标题，删除无信息的铺垫词；在 Harness 章节用登录失败任务具体说明上下文中的请求、AGENTS.md 规则、相关代码/工具结果和按需加载的 Skill，并区分这些上下文与沙箱、审批等实际权限控制
- [x] 2.10 按新版六章结构调整 `src/pages/agent-tutorial.html`：Agent 产品、模型与付费方案、Harness Engineering（选读）、上下文/AGENTS.md/Skill、规划与执行、安全与复核
- [x] 2.11 修订模型服务与计费说明：按使用频率比较 API 与 Token Plan/Coding Plan，不笼统宣称 API 更贵；保留 DeepSeek 无 Token Plan 的说明，并准确描述 CC Switch 为模型服务配置/切换指引
- [x] 2.12 将上下文、AGENTS.md 与 Skill 组织为同一章，解释不同产品的加载方式可能不同；保留现有 Skill 目录、推荐案例及第三方安全检查
- [x] 2.13 扩写规划与执行章节：解释 Proposal、Design、Specs、Tasks 的分工，并把强模型规划、较经济模型执行写成按任务选择的可选策略
- [x] 2.14 新增安全与复核章节，覆盖密钥和隐私、第三方内容、权限审批、检查 diff、运行测试及回退方式
- [x] 2.15 在第四章加入上下文构成示意图，展示用户任务、AGENTS.md、按需 Skill、相关代码与工具信息如何进入模型上下文，并与沙箱、工具权限和审批边界区分；同步更新 OpenSpec 设计与规格
- [x] 2.16 按 `design.md` 的标题层级规划整理正文六章：三级标题只保留各章主要主题，具体内容下放四级标题；第四章三级标题仅保留“AGENTS.md”和“Skill”
- [x] 2.17 修订 AGENTS.md 说明与上下文图：明确 Codex 按全局/项目目录作用范围发现适用文件，并将发现文件的完整内容合并到指令上下文（默认总量上限 32 KiB）；匹配的是适用文件，不是逐条筛选规则

## 3. 统一 Review

- [x] 3.1 核查产品能力、价格口径、AGENTS.md 路径与作用范围的来源准确性；将官方依据与个人观察明确区分
- [x] 3.2 核查文章完整性、适用范围、视频时间戳链接、API Key/隐私安全提示及与既有文章的边界
- [x] 3.3 核查 HTML、frontmatter、链接、图片和站点规范；修复所有阻断发布的问题
- [x] 3.4 按新版六章结构复核标题、章节衔接、套餐口径、OpenSpec 术语及安全复核清单
- [x] 3.5 复核正文标题层级与 `design.md` 一致，并核对 AGENTS.md 的文件发现、完整内容加载和上下文图表述

## 4. 发布与构建

- [x] 4.1 运行 `node build.js` 与 `npm test` 并处理失败
- [x] 4.2 按验收结果保存到 `src/pages/agent-tutorial.html`
- [x] 4.3 检查文章中的产品事实已标注核查日期，第三方服务风险披露清楚，且不含真实密钥/私人配置
- [x] 4.4 完成新版正文后重新运行 `node build.js` 与 `npm test`
- [x] 4.5 完成本轮标题与 AGENTS.md 修订后重新运行 `node build.js`、`npm test` 和 OpenSpec 校验

## 5. Hub 与交叉回链

- [x] 5.1 确认本篇无所属 Hub；检查是否需要链接回相关 Agent/Harness 文章
- [x] 5.2 如发布后存在指向本篇的相关内容引用，补充必要的交叉回链

## 6. 草稿状态回填

- [ ] 6.1 按用户确认决定处理此前误建的 `drafts/agent-tutorial.org`；若文章发布且草稿保留，则回填状态和发布路径
