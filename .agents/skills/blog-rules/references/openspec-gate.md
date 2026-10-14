# OpenSpec 门禁（内容类产出）

> 本文件是内容类 change 门禁流程的**唯一事实来源**。各内容类 skill 只保留 3-5 行指针，不复制本文正文；要改流程只改这里。

## 何时必须建 change

**必须**：任何将写入 `src/pages/*.html`（发表文章）或对已有文章做**内容级**增补的任务。

**豁免**（豁免时必须在回复中说明理由，用户可当场纠正）：

| 豁免项 | 边界 |
|--------|------|
| `draft` / `collect` 模式 | 产出落 `drafts/` 或 `raw/`，不发表 |
| 小修 | typo、错链、frontmatter 字段修正、纯构建报错修复 |
| 用户显式要求跳过 | 用户明确说"不用走流程" |

判据是**是否产生内容级审查需求**，不是"改动大小"。若小修升级为内容级增补，重新走门禁。

## 草稿、OpenSpec 与正文的先后关系

内容写作分为三种不同产物，不能互相替代：

1. **用户草稿**：用户先写下自己的初步内容、论点或解释，存放在 `drafts/<slug>.org` / `.md`。这是 OpenSpec 文章大纲的输入材料；必须有实质内容。空白 brainstorm 模板、只有标题的文件、素材摘录、agent 代写的提纲都不算用户草稿。
2. **OpenSpec change**：最终正文开始写作前必须已经存在。若 change 的 `design.md` 要列「文章内容大纲」，必须先有上述用户草稿，再据草稿整理大纲、素材来源和图表计划，并请用户确认。
3. **正文**：用户确认 OpenSpec 大纲后，才可写入或实质改写 `src/pages/*.html`。

### 草稿贯穿规划、写作与审校

草稿是正文的持续内容依据，不能只用于获得大纲审批。Design 决定结构与范围，草稿提供用户的思考、解释、例子和推导，原始论文或官方来源用于核验事实；三者各有作用。

- **Design 必须链接草稿**：每篇文章的元数据中填写「原始草稿」，使用相对 `design.md` 的可点击链接指向实际 `drafts/` 文件；系列逐篇列出，不能只写目录或 slug。章节骨架的素材来源还须注明对应草稿标题/小节。记录草稿的审阅状态；占位或未完成文件不能冒充已获确认的实质草稿。
- **写作必须读取草稿**：开始正文前读取 Design 所链接的完整草稿；每章写作时对照其对应小节，把用户已确认的解释、数学中间步骤、例子、图示和引用落实到正文。禁止仅凭章节标题重新自由写作，或在获得大纲后抛开草稿。
- **草稿有变化时对齐 Design**：写作前核对当前草稿与已确认 Design。新内容影响章节顺序、核心论点或范围时，先按既有审批流程同步规划；不把旧大纲的确认视为对新增内容的确认。普通补充与修正按已有授权处理。草稿不是事实正确性的保证，错误须回原始来源核查并向用户说明，不能照抄。
- **完成后检查覆盖**：同时对照 Design 和草稿核对正文。草稿中重要内容的遗漏、压缩或移位须有明确理由；影响用户已确认内容的取舍要记录在 Design 的 Decisions。内部草稿链接用于作者追溯，不默认写入面向读者的正文或参考文献。

**硬性拒绝规则**：用户尚无草稿却要求“先列 OpenSpec 文章大纲”时，必须明确、坚定地拒绝创建或改写该大纲，不得替用户先写一份草稿来绕过门槛。直接说明：“目前没有你的草稿，我不能先替你列 OpenSpec 文章大纲。请先把自己的初步内容写入 `drafts/`；草稿准备好后，我再据此整理 OpenSpec 大纲。”可以继续做不依赖大纲的素材检索、论文阅读或回答问题，但不得借这些工作生成变相文章大纲。

这条先后关系仅针对**内容类 change 中的文章大纲**。普通软件功能的 OpenSpec proposal/design 不需要博客草稿。用户明确要求把正文直接写入 `src/pages/`，但当前没有对应 OpenSpec change 时，先创建/补齐 change；若该 change 需要文章大纲，仍须先满足用户草稿门槛和大纲确认门槛。

## 三步操作

用户草稿先于文章大纲。草稿准备好后，写作规划**直接写在 OpenSpec change 内**：创建 change，在 `design.md` 的「文章内容大纲」中依据用户草稿规划文章结构、逐节内容、素材来源与图表；该 change 是唯一审批载体。不得用 OpenSpec 大纲取代用户草稿，也不得把内部素材分析冒充用户草稿。用户确认 change，即批准写作规划。

`read-article` 的库内检索、论文阅读与分析先于建 change；其他 skill 按各自管线，在具备足够素材后、正文写作前建 change。

### 1. 建 change

```bash
cd ~/gongshangzheng.github.io
openspec new change "<kebab-name>"
```

命名：单篇用 `<slug>`；一批多篇用主题名（如 `digital-human-motion-space-update`）。

### 2. 按模板填 artifact

模板位置（**库内** skill，不要写成全局路径）：

```bash
T=~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change
```

| artifact | 模板 | 要点 |
|----------|------|------|
| `proposal.md` | `$T/proposal.md` | **文章清单表**（slug / 标题 / 类型 / 目标 alias / 产出物）不可删 |
| `design.md` | `$T/design.md` | **「文章内容大纲」是审批核心，也是写作规划的唯一载体**，逐篇填：原始草稿链接与审阅状态 / 类型与目标位置 / 服务对象 / 章节骨架（必须用层级 headings；每节下列写什么 + 对应草稿小节及原始素材来源 + 必备表·公式·图）/ 关键数据点 / 配图计划；遵守下方「文章规划原则」 |
| `tasks.md` | `$T/tasks.md` | 第 2 组（写作）之前必须有"用户已确认大纲"的前置任务 |
| `specs/<capability>/spec.md` | `openspec instructions specs --change "<name>" --json` | 内容类一般新增一个 capability，requirements 写成可验收的交付契约 |

取 CLI 侧要求与模板结构：

```bash
openspec status   --change "<name>" --json
openspec instructions <artifact> --change "<name>" --json
```

### 3. 呈现待审批

把「文章内容大纲」贴给用户：打算写哪几节、每节素材来自哪、会放哪些表/公式/图。**未确认不得动笔。**

## 文章规划原则

写入 `design.md` 的「文章内容大纲」时：

0. 章节骨架 MUST 使用层级 headings；每节标题下列出写作内容、具体素材来源与必备元素，不得用表格承载整份章节大纲。文章元数据、局部比较、数值数据等仍可使用表格。

1. 每节都指向具体素材文件与原文定位，不写笼统的「参考论文」。
2. 缺料要写明替代方案或披露方式，不留空、不臆测。
3. 区分原文事实与作者/agent 的阅读判断。
4. 将需要用户裁决的问题集中列出，不藏在章节描述中。
5. 规划可在 change 中迭代；每次用户补充后更新 artifact 并重新呈现差异。

## 审批门禁

- 未获用户明确确认前：**不得**写 `src/pages/`，**不得**改 `drafts/` 正文
- 确认后需求又变：走 `openspec-update-change` 回写 artifact 再继续，不直接改稿
- 执行完成：`openspec validate <name> --strict`；归档走 `openspec-archive-change`

## 模板不是强约束

遇到模板未覆盖的形态（Hub 页、调研报告、系列总览、批量课件）：允许增删节次，但**必须保留「文章内容大纲」的等价信息**，并在 artifact 中说明偏离原因。静默丢弃该节 = 计划未完成。

## 路径口径

本流程涉及的所有 skill 引用一律用**库内锚定写法**：

- 库内 skill（`SKILL.md` 在 `~/gongshangzheng.github.io/.agents/skills/`）→ `~/gongshangzheng.github.io/.agents/skills/<name>/<相对路径>`
- 全局 skill（如 `web-search`，`SKILL.md` 在 `~/.agents/skills/`）→ `~/.agents/skills/<name>/...`

判据 = 该 skill 的 `SKILL.md` 位于哪个 tree。存量死路径的清理见 change `fix-stale-skill-paths`。

## 关联

- 模板：`templates/content-change/{proposal,design,tasks}.md`
- 草稿入口：`blog-drafts`
- 适用内容 skill：`read-article` / `academic-research` / `deep-research` / `historical-narrative` / `book-to-blog` / `course-notes` / `github-repo-read` / `html-blog`
- OpenSpec 入口：`openspec-explore` / `openspec-propose`（写）/ `openspec-apply-change`（执行）/ `openspec-update-change`（改计划）/ `openspec-archive-change`（归档）
