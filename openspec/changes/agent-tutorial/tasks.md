## 1. 计划与素材

- [ ] 1.1 复核 Codex 官方下载、平台、登录、项目操作、AGENTS.md、Skills、Plan mode 与审批/权限文档；在 design.md 记录权威 URL、版本和核查日期
- [ ] 1.2 复核 CC Switch 当前发行版的首次供应商配置与连接验证、直连/路由/聚合、Codex 上游协议转换、重启生效与回退行为；区分文档支持和实测结果
- [ ] 1.3 检索博客相关文章并确认交叉链接；已初步发现 `harness-engineering-notes.html`、Agent 行业调研系列及 `drafts/pi-intro.org`
- [ ] 1.4 选择并核实国产模型接入示例；不暴露 API Key、真实域名或私有项目路径，不对中转服务作未经证实的背书
- [ ] 1.5 确认分类 `categories/AI/Agent` 与文章 slug、标题，无需分配 sub_id 或 Hub
- [ ] 1.6 审批门禁：取得用户对 design.md「文章内容大纲」的明确确认；未确认不得进入写作

## 2. 逐篇写作

- [ ] 2.1 `agent-tutorial`：按已批准的大纲撰写《Agent 使用教程》，依次比较并推荐 Codex、配置并验证模型供应商、完成一个任务、介绍 Skill、解释 Agent Tool、介绍 OpenSpec 等规划工具，最后说明细节与安全事项
- [ ] 2.2 制作脱敏的 Codex/CC Switch 截图和协议流向示意图，保存至 `media/images/agent-tutorial/`

## 3. 统一 Review

- [ ] 3.1 核查产品能力、版本、协议和配置步骤的来源准确性；将官方依据与个人实测明确区分
- [ ] 3.2 核查文章完整性、适用范围、Plan mode 与自动执行模式的描述、回退步骤、Key/隐私安全提示及与既有文章的边界
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
