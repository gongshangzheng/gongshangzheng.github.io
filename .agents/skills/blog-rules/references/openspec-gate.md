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

## 三步操作

> **read-article full 模式的前置**：该 skill 先完成素材获取与分析（Phase 1–3），再生成可交互的
> planning draft（Phase 4），与用户确认后才建 change（Phase 5）。planning draft 落
> `raw/<slug>/planning-draft.md`（或 change 已存在时的 `openspec/changes/<slug>/draft.md`），
> 不是已批准的 change，不得据它写 `src/pages/`。详见
> `read-article/references/planning-draft-template.md`。

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
| `design.md` | `$T/design.md` | **「文章内容大纲」是审批核心**，逐篇填：类型与目标位置 / 服务对象 / 章节骨架（每节写什么 + 素材来源 + 必备表·公式·图）/ 关键数据点 / 配图计划 |
| `tasks.md` | `$T/tasks.md` | 第 2 组（写作）之前必须有"用户已确认大纲"的前置任务 |
| `specs/<capability>/spec.md` | `openspec instructions specs --change "<name>" --json` | 内容类一般新增一个 capability，requirements 写成可验收的交付契约 |

取 CLI 侧要求与模板结构：

```bash
openspec status   --change "<name>" --json
openspec instructions <artifact> --change "<name>" --json
```

### 3. 呈现待审批

把「文章内容大纲」贴给用户：打算写哪几节、每节素材来自哪、会放哪些表/公式/图。**未确认不得动笔。**

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
- 适用 skill：`read-article` / `academic-research` / `deep-research` / `historical-narrative` / `book-to-blog` / `course-notes` / `github-repo-read`
- OpenSpec 四步：`openspec-propose`（写）/ `openspec-apply-change`（执行）/ `openspec-update-change`（改计划）/ `openspec-archive-change`（归档）
