## Purpose

让内容类产出（博客文章、论文精读、调研报告、课程笔记、书稿转写）在动笔前先形成一份可审批的结构化计划：计划必须说明"博客里面要有什么内容"，用户确认后才允许写入内容目录。

## ADDED Requirements

### Requirement: 内容类产出必须先建 change 再执行

任何将写入 `src/pages/*.html`（发表文章）或对已有文章做内容级增补的任务，MUST 先创建 OpenSpec change 并取得用户确认，之后才允许执行写作；不得在 change 获批前产出正文。此要求覆盖 `read-article`、`academic-research`、`deep-research`、`historical-narrative`、`book-to-blog`、`course-notes`、`github-repo-read` 七个内容类 skill 的常规产出路径。

#### Scenario: 用户要求精读一篇论文

- **WHEN** 用户给出论文链接并要求"读这篇、写成博客"
- **THEN** agent 先创建 change 并写出计划（含该文章的章节骨架与素材来源），把计划呈现给用户；在用户确认之前不写 HTML、不发布

#### Scenario: 用户在未确认前追加要求

- **WHEN** change 已创建但用户尚未确认，用户又补充了新的内容要求
- **THEN** agent 把新要求回写进 change artifact（proposal/design/tasks），重新呈现待确认，而不是直接按新要求开始写作

### Requirement: 计划必须说明每篇文章的内容构成

内容类 change 的 `design.md` MUST 包含「文章内容大纲」一节，逐篇文章给出：slug 与完整标题、类型与目标位置（分类 alias、sub_id 分配方式、Hub 页）、章节骨架（每节写明"这一节写什么 + 素材来源 + 必备表格/公式/图"）、必须出现的关键数据点、配图计划、以及该文服务的读者问题。`proposal.md` MUST 给出文章清单（slug、标题、类型、目标路径、产出物）。

#### Scenario: 用户审阅文章计划

- **WHEN** 用户打开 change 的 `design.md`
- **THEN** 无需阅读任何 skill 代码或对话历史，即可判断每篇文章打算写哪几节、每节的素材从哪来、会放哪些表/公式/图，并据此提出增删

#### Scenario: 计划缺少内容级信息

- **WHEN** 计划只写了"分几步做"而没有逐节的写作内容与素材来源
- **THEN** 该计划视为未完成，不得据此进入执行

### Requirement: 内容类 change 必须使用项目模板填充

仓库 MUST 在**库内** skill 层提供内容类 change 模板 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/proposal.md`、`design.md`、`tasks.md`；创建内容类 change 时 MUST 以这三个模板为骨架填写，不得直接沿用 OpenSpec 默认的通用软件工程模板。模板 MUST 与门禁规范同处库内 `blog-rules` skill（与文章产物同一 git 历史），MUST NOT 放入全局 skill 目录 `~/.agents/skills/`（那里只放跨项目工具 skill），也 MUST NOT 放入 `openspec/` 目录——后者只承载 OpenSpec 自身产物（changes / specs / config），自建于其中的 templates 目录 CLI 不读取。`openspec/config.yaml` MUST 配置 `context` 与 per-artifact `rules`，使 `openspec instructions <artifact>` 对内容类 change 给出内容侧填写要求并指明模板路径。

#### Scenario: 新建一篇论文精读的 change

- **WHEN** agent 执行 `openspec new change <name>` 后准备写 artifact
- **THEN** agent 读取 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/` 下对应模板并按其节次填写，`design.md` 保留「文章内容大纲」节（无内容的节可删除，但删除需说明）

#### Scenario: 模板位置可被定位且两个目录都不被污染

- **WHEN** agent 或用户查找内容类 change 模板
- **THEN** 模板位于库内 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/`（与 `references/openspec-gate.md` 同处 skill 层）；全局 `~/.agents/skills/` 下无 `blog-rules`，且 `openspec/` 下无自建 templates 目录

#### Scenario: 模板与实际内容形态不符

- **WHEN** 本次产出是系列 Hub、调研报告等模板未覆盖的形态
- **THEN** 允许增删模板节次，但 MUST 在 artifact 中说明偏离原因，不得静默丢弃「文章内容大纲」

### Requirement: 规范单一事实来源且各 skill 只保留指针

门禁流程（触发条件、模板位置与填法、审批门禁、豁免清单）MUST 集中维护在库内 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md` 一处；七个内容类 skill MUST 各自只保留简短的门禁小节并指向该文件（用库内锚定路径，不得写 `~/.agents/skills/`），不得复制流程正文。

#### Scenario: 修改门禁流程

- **WHEN** 需要调整门禁的触发条件或豁免范围
- **THEN** 只修改 `openspec-gate.md` 一处即可对所有内容类 skill 生效，不存在需要同步的多份副本

#### Scenario: agent 按 skill 执行内容任务

- **WHEN** agent 读取任一内容类 skill 并准备开始工作
- **THEN** 该 skill 的管线最前面存在门禁小节，agent 据此读取 `openspec-gate.md` 并进入建 change 流程

### Requirement: 豁免场景与理由说明

`draft` / `collect` 模式（产出落 `drafts/` 或 `raw/`、不发表）、小修（typo、错链、frontmatter 字段修正、纯构建修复）、以及用户显式要求跳过时 SHALL 豁免门禁；豁免时 agent MUST 在回复中说明豁免理由，供用户当场纠正。

#### Scenario: 用户要求把论文要点存进草稿

- **WHEN** 用户说"这篇存到草稿"
- **THEN** agent 走 `read-article` 的 `draft` 模式，不建 change，并在回复中说明"草稿模式不产发布物，按门禁规则豁免"

#### Scenario: 用户要求修一个错链

- **WHEN** 用户指出某篇文章正文里的链接失效
- **THEN** agent 直接修复，并在回复中说明属于小修豁免；若修改升级为内容级增补，则重新走门禁
