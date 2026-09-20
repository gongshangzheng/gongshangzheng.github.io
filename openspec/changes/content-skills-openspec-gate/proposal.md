## Why

内容类 skill（`read-article`、`academic-research`、`deep-research`、`historical-narrative`、`book-to-blog`、`course-notes`、`github-repo-read`）目前是**直接开工**的：读 skill → 跑 Phase 1 提取 → 派 subagent → 写 HTML → Review → 发布。整条链路上唯一让用户介入的节点是 `read-article` Phase 4 的"文章架构规划"，但它发生在**素材提取已经跑完之后**——用户此时已经付了提取和调研的成本，且规划只存在于对话里，不落任何可追溯 artifact。

三个具体缺口：

1. **没有审批门禁**：用户想"先看看打算写什么、再决定要不要跑"，当前做不到——没有"计划"这个可审核的中间态。AGENTS.md 已经写明"每次代码改动前必须先走 OpenSpec 流程"，但这条规则没有落到内容类 skill 里。
2. **"文章该有什么内容"没有被结构化表达**：`read-article` Phase 4 有 `references/article-structure-template.md`（7-Part 结构），但它是**写作时的骨架**，不是**给用户审批的内容清单**。用户无法在动笔前看到"这一节要写什么、素材来自哪、必备哪个表/图/公式"。
3. **OpenSpec 模板不匹配**：库内已用 OpenSpec 管内容类 change（如 `digital-human-survey-landscape-update`），但用的是通用软件工程模板（`### New Capabilities` / `#### Task Group`），没有"文章清单""文章内容大纲""配图计划"的位置，导致每次都要临时发挥，格式不统一。

## What Changes

- **新增**内容类 change 模板三件套 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/{proposal,design,tasks}.md`（模板跟着库内 skill 走，与门禁规范同处 `blog-rules`；**不放**全局 `~/.agents/skills/`，也**不放** `openspec/`）
  - `design.md` 模板的核心节是 **「文章内容大纲」**：逐篇给出 slug / 标题（系列命名）/ 目标分类 alias / Hub / 章节骨架（每节写什么 + 素材来源 + 必备表格·公式·图），这是用户审批的对象
  - `proposal.md` 模板给出**文章清单表**（slug、标题、类型、目标路径、产出物）
  - `tasks.md` 模板按内容生产链路分组：计划与素材 → 逐篇写作 → Review → 发布 → Hub/回链 → 状态回填
- **新增**门禁规范 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`（唯一事实来源）：何时必须建 change、如何填模板、审批门禁、豁免清单
- **修改** 7 个内容类 skill：在管线最前面加 **Phase 0 · OpenSpec 门禁**小节（3-5 行，指向 `blog-rules/references/openspec-gate.md`，不复制正文），`read-article` 的 Phase 4 从"与用户确认架构"改挂到 change artifact
- **修改** `openspec/config.yaml`：补 `context`（本项目是内容生产为主）与 per-artifact `rules`（内容类 change 的 proposal/design/tasks 必须包含哪些内容），让 CLI 生成 artifact 时自带规范
- **明确豁免**：`draft` / `collect` 模式（不产 HTML、不发布）、小修（typo / 错链 / 字段修正 / 纯构建修复）、用户显式要求跳过——豁免时必须在回复里说明理由

## Capabilities

### New Capabilities
- `content-change-planning`: 内容类产出的"先计划、后执行"契约——动笔前必须形成可审批的结构化计划（含逐篇文章内容大纲），用户确认后才允许写入 `src/pages/` 或 `drafts/`

### Modified Capabilities

（无——现有 `digital-human-content-org` spec 是关于数字人内容组织的具体产物，不涉及本次的流程契约）

## Impact

- `~/gongshangzheng.github.io/.agents/skills/`（库内 skill，非全局）：7 个内容类 skill 的 SKILL.md 各加一节 Phase 0（`read-article` 为强制门禁实现，其余为指针）；`blog-rules` 新增 `references/openspec-gate.md` 与 `templates/content-change/` 下 3 个模板文件
- **不动**全局 `~/.agents/skills/`（那里是跨项目工具 skill，无博客内容 skill）
- `openspec/config.yaml`：新增 `context` 与 `rules` 段（当前全为注释），其中指明模板路径
- **不动** `openspec/templates/`（该目录不存在，且不新建——`openspec/` 只承载 changes / specs / config）
- **已知遗留（已单独开 change `fix-stale-skill-paths` 处理）**：库内 skill 存在 **66 处**指向全局 `~/.agents/skills/<博客 skill>` 的**死路径**（html-blog 30 / read-article 8 / blog-rules 6 / arxiv-paper-digest 6 / docling 7 / blog-aliases 2 / 其余各 1），与正确写法 `~/gongshangzheng.github.io/.agents/skills/...`（89+ 处）混用；本 change 只保证新增与引用的路径正确，存量清理由 `fix-stale-skill-paths` 负责
- 不改动：`build.js`、`lib/`、`src/pages/` 下任何已发布文章、测试用例
- 验证：`openspec validate content-skills-openspec-gate`；用一篇真实论文跑一次 full 模式冒烟（只到"计划产出 + 审批"，不实际发文章）
