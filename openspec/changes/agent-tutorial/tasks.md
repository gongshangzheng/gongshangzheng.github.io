## 1. 计划与素材

- [ ] 1.1 复核 Codex 官方下载、平台、登录、AGENTS.md 与 Skills 文档；在 design.md 记录权威 URL、版本和核查日期
- [ ] 1.2 核实 Claude Code、Pi Agent、Codex、Kimi Code、ZCode、DeepSeek Harness 的官方产品形态和交互入口；核对 Kimi、GLM、DeepSeek 的模型/API 服务资料，在章节中区分 Agent 产品与模型服务层，并标明 Kimi Code、ZCode、DeepSeek Harness 为国产 Agent 产品
- [ ] 1.3 核对指定 B 站视频 BV1XwaH6AE9a 中 CC Switch 接入国产模型的讲解位置；在正文提供 13:45 时间戳直达链接，不另写详细接入步骤
- [ ] 1.4 检索博客相关文章并确认交叉链接；已初步发现 `harness-engineering-notes.html`、Agent 行业调研系列及 `drafts/pi-intro.org`
- [ ] 1.5 核实 DeepSeek、智谱 GLM、Kimi 的官方模型/API 文档、可用性及价格口径；区分订阅、Coding Plan 与 API 按量计费，不读取或留存密钥，不暴露私有配置，也不对中转服务作未经证实的背书
- [x] 1.9 核对 Codex、Claude Code、Kimi Code、ZCode/GLM Coding Plan、Pi 与 DeepSeek 的官方套餐或 API 计费口径；标明 DeepSeek 无 Token Plan，并记录地区、币种与核查日期
- [ ] 1.6 为文章各部分搜集并核验参考链接或配图；开场的六款 Agent 拼图只用官方页面截图，每次更新时逐页等待至少 4 秒、确认内容加载、滚回顶部后再截屏，并在图注标注日期。开场嵌入指定视频 BV1XwaH6AE9a；模型服务章节提供同一视频 13:45 的 CC Switch 直达链接。采用自然、循序渐进的读者视角，不写作者/编辑过程说明，也不依据标题推测具体内容
- [ ] 1.7 确认分类 `categories/AI/Agent` 与文章 slug、单篇标题《Agent 使用教程：从入门到实践》，无需分配 sub_id 或 Hub
- [x] 1.8 审批门禁：取得用户对 design.md「文章内容大纲」的明确确认；用户已确认开场方向并要求继续完善同一篇教程

## 2. 单篇写作

- [ ] 2.1 在单一文件 `src/pages/agent-tutorial.html` 中完成《Agent 使用教程：从入门到实践》，覆盖简短 Agent 市场开场、模型服务层及套餐/API 计费、CC Switch 视频直达链接、AGENTS.md、Skill、Agent Tool、OpenSpec 等规划工具和安全事项
- [ ] 2.2 可按章节分阶段撰写并交用户审核；各部分均持续整合在同一篇文章中，不另立系列标题、不拆分成多篇，完成后整体复核全文
- [x] 2.3 在 AGENTS.md 章节说明全局与项目级规则的作用范围，并提供简洁示例和检查生效的方法
- [x] 2.4 制作价格部分的官方套餐与 API 计费截图拼图，覆盖可核验的订阅/Coding Plan 页面、DeepSeek 按量价格页及 Pi 供应商说明；保存至 `media/images/agent-tutorial/agent-pricing-collage-2026-10-12.webp`
- [x] 2.5 撰写第三章 Skill，说明它与 AGENTS.md、提示词和 Tool 的区别，补充可复用工作流示例、调用方式与第三方脚本审查提醒

## 3. 统一 Review

- [ ] 3.1 核查产品能力、价格口径、AGENTS.md 路径与作用范围的来源准确性；将官方依据与个人观察明确区分
- [ ] 3.2 核查文章完整性、适用范围、视频时间戳链接、API Key/隐私安全提示及与既有文章的边界
- [ ] 3.3 核查 HTML、frontmatter、链接、图片和站点规范；修复所有阻断发布的问题

## 4. 发布与构建

- [ ] 4.1 运行 `node build.js` 与 `npm test` 并处理失败
- [ ] 4.2 按验收结果保存到 `src/pages/agent-tutorial.html`
- [ ] 4.3 检查文章中的产品事实已标注核查日期，第三方服务风险披露清楚，且不含真实密钥/私人配置

## 5. Hub 与交叉回链

- [ ] 5.1 确认本篇无所属 Hub；检查是否需要链接回相关 Agent/Harness 文章
- [ ] 5.2 如发布后存在指向本篇的相关内容引用，补充必要的交叉回链

## 6. 草稿状态回填

- [ ] 6.1 按用户确认决定处理此前误建的 `drafts/agent-tutorial.org`；若文章发布且草稿保留，则回填状态和发布路径
