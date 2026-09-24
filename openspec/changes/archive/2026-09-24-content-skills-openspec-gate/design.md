## Context

现状（2026-09 实测）：

- `read-article` 有 9 个 Phase。Phase 4「文章架构规划」是唯一的人工确认点，位置在 Phase 1-3（提取 + 4 路深度分析 + 索引）**之后**——用户做决定时成本已沉没；确认结果只存在于对话上下文，不落文件。- 7 个内容类 skill 里，只有 `read-article` 有架构规划这一步，`academic-research` / `deep-research` / `historical-narrative` / `book-to-blog` / `course-notes` / `github-repo-read` 完全没有用户确认节点。
- OpenSpec 在本库已用于内容类 change（`openspec/changes/digital-human-survey-landscape-update` 是完整先例），但模板来自通用软件工程 schema："Capabilities / New Capabilities / Task Group" 这些槽位与"文章要写什么"无关。
- `openspec/config.yaml` 目前整份被注释掉，`context` 与 `rules` 均未配置，所以 `openspec instructions <artifact>` 只返回通用模板。

约束：

- 用户要审的核心是"**这篇博客里面要有什么内容**"，不是"agent 打算分几步做"。所以计划产物必须把文章内容写成可读的清单，而不是任务列表。
- AGENTS.md 已规定："每次代码改动前必须先走 OpenSpec 流程""不能在用户未审核 OpenSpec artifact 的情况下直接改代码"。本 change 是把这条规则落到内容类 skill 上。
- 7 个 skill 分散维护，禁止把同一段规范复制 7 份（会漂移）。

## Goals / Non-Goals

**Goals:**

- 内容类任务在动笔前产出**一份可审批的计划**，其中"文章内容大纲"是主体，用户确认后才执行。
- 计划是 OpenSpec artifact（可 git diff、可归档、可 update-change 迭代），不是对话里的临时文本。
- 模板固定下来，下次建 change 直接填，不再每次临时发挥格式。
- 规范单一事实来源，各 skill 只留指针。

**Non-Goals:**

- 不改 `read-article` 的技术管线（Phase 1-9 的提取/分析/写作/Review 逻辑不动，只是前面加一道门禁、Phase 4 改挂 artifact）。
- 不把 `draft` / `collect` 模式纳入门禁——它们不产 HTML、不发布，走门禁是纯负担。
- 不引入自动化校验钩子（如 git pre-commit 拦 `src/pages/` 写入）——本 change 只做规范与模板，机械强制留待后续按需再加。
- 不重写 `article-structure-template.md`（那是写作骨架，本次只补"审批用内容清单"这一层）。

## Decisions

### D1：模板放库内 skill 层（`~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/`）

四条理由：

1. **博客 skill 都在库内，不在全局**：实测全局 `~/.agents/skills/` 下只有 28 个跨项目工具 skill（asu / docx / web-search / ego-browser …），**没有** blog-rules / read-article / html-blog；博客相关的 28 个 skill 全部位于 `~/gongshangzheng.github.io/.agents/skills/`。模板必须跟它服务的 skill 在同一棵树里。
2. **模板与文章内容一同版本化**：放库内即随 git 提交/回滚/review，与它约束的文章产物共享同一历史；全局 skill 是跨项目工具层，不应承载本库的内容规范。
3. **`openspec/templates/` 不是 OpenSpec 的约定**：CLI 的 artifact 模板来自 schema（`openspec instructions` 返回），自建于 `openspec/` 下的 templates 目录 CLI 不读，只是一堆没人管的文件。
4. **消费方是 skill**：模板服务于 7 个内容类 skill 的门禁流程，应与门禁规范（`blog-rules/references/openspec-gate.md`）同处 `blog-rules` —— 它已是库内内容类 skill 的共享 reference 层，入口清晰。

放文件而不内联进 `config.yaml`：可独立 diff/review、可被 skill 直接 `read`、篇幅不受 config 可读性限制。

备选 A：全局 `~/.agents/skills/blog-rules/` 下——被否，见理由 1、2。
备选 B：`openspec/templates/` 下——被否，见理由 3。
备选 C：只用 `config.yaml` 的 `rules` 描述要求，让 AI 每次自己组织格式——被否，格式会漂移。

### D2：`design.md` 的「文章内容大纲」是审批核心，字段固定

内容类 change 的 `design.md` 必须含该节，逐篇文章给：

| 字段 | 内容 |
|------|------|
| slug / 标题 | 文件名 + 完整标题（含系列命名与序号） |
| 类型与目标位置 | 论文精读 / 系列章节 / 工程解读；目标 `categories/...` alias、sub_id 分配方式、Hub 页 |
| 章节骨架 | 逐节列：**这一节写什么** + **素材来源**（raw 文件 / 哪篇综述 / 哪个仓库）+ **必备元素**（表/公式/图） |
| 关键数据点 | 必须出现在正文的具体数值、对比表、消融结论 |
| 配图计划 | 张数、来源优先级、目标文件名 |
| 服务对象 | 这篇解决读者什么问题（一句话） |

理由：用户在"动笔前"要能判断内容对不对、够不够、有没有跑偏；章节骨架是唯一能承载这个判断的结构。**这张表就是"说明博客里面要有什么内容"的落点。**

备选：复用 `article-structure-template.md` 的 7-Part 骨架——被否，那是写作规范（字数下限、组件映射），不含"素材来源"与"关键数据点"，审不出内容缺失。

### D3：门禁边界——full 模式必过，豁免清单明确

必须走门禁：任何将写入 `src/pages/*.html`（发表）或对已有文章做**内容级**增补的任务。

豁免（必须在回复中说明理由）：

- `draft` / `collect` 模式（产出落 `drafts/` 或 `raw/`，不发布）
- 小修：typo、错链、frontmatter 字段修正、纯构建报错修复
- 用户显式要求跳过流程

理由：门禁价值在"防止昂贵的返工"，对 3 行小修建 change 是负价值。边界用"是否产生内容级审查需求"而不是"改动大小"来判定。

### D4：规范单一事实来源放 `blog-rules/references/openspec-gate.md`

7 个 skill 各加 3-5 行 Phase 0 小节指向它。备选：每个 skill 内联完整流程——被否，7 份副本必然漂移（本库已有 `blog-rules` 作为共享 reference 层的先例）。

### D5：`read-article` Phase 4 改挂 artifact，而不是再加一道确认

Phase 4 原本就要求"给出 2-3 种章节组织方案 + 用户确认"。改造：把该确认提前到 Phase 0 的 change 里（此时还没花钱提取），Phase 4 退化为"按已批准大纲落笔"。

理由：只加不删会让流程变成两次确认，用户会烦。

### D6：`config.yaml` 用 `context` + `rules` 注入

`rules` 写成条件式（"内容类 change 的 design.md 必须包含文章内容大纲"），因为 config 对全项目生效，而纯工程类 change 不需要这些槽位。

### D7：分两批铺开，read-article 先跑通

先只改 `read-article`（含模板 + 门禁规范 + config 全套），以 `raw/` 已有素材跑一次"建 change + 填模板 + 呈现待审批"的冒烟并收集用户反馈，据此定稿模板，再铺开其余 6 个 skill（`academic-research` / `deep-research` / `historical-narrative` / `book-to-blog` / `course-notes` / `github-repo-read`）。

理由：模板是 7 个 skill 共用的契约，一次改完再发现"文章内容大纲"字段不合适，返工面是 7 个 skill；而冒烟只到审批呈现、不发文章，停在最便宜的节点上就能验收模板。

备选：7 个 skill 一次全改——被否，同上。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 流程变重，简单文章也要建 change | D3 豁免清单；模板内标注"无内容的节可删" |
| 豁免边界靠判断，可能被滥用（"这算小修"） | 豁免必须在回复里**明说理由**，用户可当场纠正 |
| 模板僵化，遇到新内容形态（如系列 Hub、调研报告）套不进去 | 模板定位为骨架，允许增删节；`openspec-gate.md` 写明"模板不是强约束，缺字段要说明" |
| 用户审批后又改需求，直接改稿导致 artifact 与实际脱节 | 规定需求变更走 `openspec-update-change` 回写 artifact |
| 7 个 skill 指向同一 reference，reference 改动会影响所有 skill | 这正是意图（单一事实来源）；reference 改动本身也走 change |
| 冒烟阶段只验证了 read-article，其余 6 个 skill 的形态差异（如 book-to-blog 的章节清单、course-notes 的批量课件）可能在铺开时才暴露模板不足 | 铺开阶段（tasks 第 5 组）允许按形态增删节次并回写模板；若发现根本性不适配，回退到第 4 组修模板再继续 |
| 库内 skill 里仍有 51 处指向全局 `~/.agents/skills/<博客 skill>` 的死路径（html-blog 30 处、read-article 8 处、blog-rules 6 处…），会影响新门禁文档的引用可靠性 | 本 change 新增/引用的路径一律用库内锚定写法 `~/gongshangzheng.github.io/.agents/skills/...`；存量 51 处归入单独 change 清理（见 proposal Impact 说明） |
