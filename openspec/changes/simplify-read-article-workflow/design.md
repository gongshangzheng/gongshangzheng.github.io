## Context

当前 `read-article` 已包含完整的论文获取、分析、结构规划、HTML 写作、Review、发布和回链规则，但其默认执行模型是固定 subagent 编排：Phase 1 提取 subagent、Phase 2 四路分析、Phase 5 多阶段写作、Phase 6 三路 Review。实际需要保留的是质量闭环，而不是固定的 agent 数量。

参考 `~/code/ProjFlow/openspec/changes/add-article-note-skill/design.md` 的新设计，本 change 采用三条原则：

1. **素材在前，change 在后**：先获取和分析论文，随后根据实际素材创建 OpenSpec change 和文章大纲。
2. **主 agent 优先，按需委派**：默认由主 agent 完成；复杂论文才启用独立分析 lane。
3. **固定工作交给脚本，理解工作留给 agent**：抓取、目录初始化、格式转换和校验可以自动化，论文理解、结构决策、事实综合、用户确认和正文写作必须由 agent 负责。

当前流程中的质量核心仍然有效：库内查重、原文优先、事实可追溯、教学式叙事、图片与公式质量、实验细节披露、发布前审校和发布后 Hub/回链维护。本设计只重新组织这些能力的调用顺序和默认执行方式。

## Goals / Non-Goals

**Goals:**

- 设计一条新的、主 agent 优先的 `read-article` 流程，而不是对旧 Phase 做局部删改。
- 让 full 模式的 OpenSpec 文章 change 基于真实提取和分析素材生成。
- 将 subagent 变为 `direct / assisted / deep` 三种执行模式下的可选分析 lane。
- 保留 `analysis/` 事实产物和 `synthesis.md` 导航索引的可追溯性，同时取消固定四路分析的强制性。
- 保留 full、collect、draft 的外部产出边界和博客站点质量约束。
- 明确主 agent、subagent 和确定性脚本的职责边界，避免辅助任务直接改最终文章或绕过用户确认。

**Non-Goals:**

- 不改变博客 HTML 语法、frontmatter、分类、图片来源优先级、引用标记、MathJax 或构建发布规则。
- 不删除历史 `raw/<slug>/subagents/`、旧 phase/reference 文件或已有文章。
- 不完全禁止 subagent；只改变其从默认步骤到按需能力的定位。
- 不在本 change 中重写所有提取、图片或构建脚本；若需要新增确定性脚本，先定义边界和最小接口。
- 不把文章 OpenSpec 门禁取消；只将 full 模式的 change 创建时机后移到素材分析完成之后。

## Decisions

### D1：采用“素材在前、planning draft 居中、change 固化在后”的新流程

新的默认流程如下：

```text
输入与模式判断
  → Phase 1 获取原文与素材
  → Phase 2 按需分析
  → Phase 3 生成 synthesis 导航索引
  → Phase 4 生成 planning draft（可审阅、可交互修改）
  → 用户通过 draft 补充/修正信息
  → Phase 5 固化 OpenSpec change 与文章大纲
  → 用户确认已固化结构
  → Phase 6 主 agent 统一写作
  → Phase 7 统一审校
  → Phase 8 发布与 Hub/交叉回链维护
```

这里的 planning draft 是 OpenSpec 的中间规划层，不是博客正文，也不是最终批准的 change：

- 它可以是 change 目录中的 `draft.md`，也可以是由 OpenSpec draft 命令/交互机制维护的等价 artifact；具体落盘方式以仓库实际 OpenSpec 能力为准。
- 它必须展示当前已知事实、拟定文章结构、素材来源、缺口、待确认问题和用户可修改的决策点。
- 用户可以通过多轮 draft 交互补充论文信息、修正事实、删改章节、指定写作重点、确认图片/公式/实验口径。
- 主 agent 根据交互结果更新 draft；只有 draft 达到可执行状态后，才生成/更新正式 proposal、design、tasks，并进入 change 审批。
- draft 阶段不得写 `src/pages/`，不得视为“用户已经批准文章大纲”。

这不是把旧 Phase 0–9 改名，而是重新定义默认控制流：

- **Phase 1–3** 是素材准备，可以服务 full、collect 和 draft。
- **Phase 4** 是 planning draft 交互阶段，服务于 full 入口，允许用户先审阅规划再固化 change。
- **Phase 5** 是正式 OpenSpec change 固化和结构确认门禁。
- **Phase 6–8** 是 full 模式的写作、审校和发布闭环。
- `collect` 在 Phase 3 后结束；用户请求 `draft` 时仍走现有草稿填充路线，不自动进入 planning draft；用户请求最终 HTML 时，才从 Phase 3 进入 planning draft。

### D2：引入 direct / assisted / deep 三种内部执行模式

| 模式 | 默认行为 | 适用场景 | subagent 策略 |
|---|---|---|---|
| `direct` | 主 agent 独立完成 | 短文、材料完整、问题边界清晰 | 不要求启动 subagent |
| `assisted` | 主 agent 保持主线，委派局部工作 | 方法、实验、术语或配图有一两个明显难点 | 委派 1–3 个相对独立 lane |
| `deep` | 主 agent 统一编排多个独立任务 | 长论文、综述、代码复现、跨论文比较 | 并行委派多个互不依赖 lane |

主 agent 必须先判断复杂度，再决定模式；不得为了“凑并行”启动 lane。无论哪种模式，主 agent 都负责综合、冲突核查、change 生成、用户确认、正文写作和最终验收。

### D3：将固定四路分析改造成可选 analysis lane

分析产物统一落在：

```text
raw/<slug>/analysis/
```

可选 lane 如下：

| Lane | 适用场景 | 必须输出 |
|---|---|---|
| `background.md` | 需要补领域背景、作者团队或影响时 | 领域脉络、作者/团队、社区影响、来源指针 |
| `methodology.md` | 方法复杂、公式多或需独立复核时 | 架构逐模块、关键机制、推导/损失、来源指针 |
| `experiment.md` | 实验表格多、数字密集或需核对结果时 | 配置、超参数、主结果、消融、失败案例、来源指针 |
| `terminology.md` | 术语密集、符号多或易混淆时 | 中英术语表、符号表、歧义说明 |
| `citation.md` | 需要补研究脉络和前置工作时 | top 3–5 前置工作、差异、来源指针 |
| `code-analysis.md` | 有代码仓库且用户关心复现时 | 仓库结构、关键实现、论文一致性/偏差、复现要点 |
| `image-collection.md` | 图片对理解结论有帮助时 | 候选图、图题、来源锚点、目标章节、价值判断 |

旧的 `raw/<slug>/subagents/` 目录继续兼容读取。迁移期间，旧文件可直接作为对应 lane 的历史产物，但新流程不再要求补齐四个固定文件。

每个 lane 只能做素材分析：读取 raw、抽取事实、标记来源位置、指出矛盾/缺口并提出结构建议。lane 不得创建 OpenSpec change、修改 `src/pages/`、写最终 HTML 或替用户确认结构。

### D4：保留 synthesis，明确“索引不等于总结”

Phase 3 生成：

```text
raw/<slug>/synthesis.md
```

其内容限定为：

1. 事实位置索引；
2. 跨文件交叉引用；
3. 不同来源之间的矛盾和待回查项；
4. 文章写作分配建议。

`synthesis.md` 不复制或压缩 analysis 正文。通常控制在 200–500 字；超过 1000 字说明它正在承担总结职责，应重写为指针式索引。即使使用 `direct` 模式、没有 analysis lane 文件，也可以直接根据原文生成轻量 synthesis，记录事实位置和写作分配。

### D5：先生成 planning draft，再固化文章 OpenSpec change

Phase 4 只有 full 模式进入。主 agent 在分析完成后：

1. 检查库内是否已有相关文章、草稿或系列；
2. 确定候选文章 slug、标题、分类、sub_id、Hub 和目标 HTML；
3. 生成 planning draft，而不是立即把它当作已批准的正式 change；
4. 在 draft 中写入论文速览、当前价值主张、候选文章结构、每节素材来源、关键数字、图表/公式计划、缺料和待确认问题；
5. 把 draft 交给用户查看，并允许用户通过多轮交互补充或修正信息；
6. 每轮交互后更新 draft，保留已确认决策、未决问题和变更记录；
7. 只有用户确认 draft 达到可执行状态后，才执行 `openspec new change <slug>` 或更新已有 change；
8. 将 draft 中已经确认的内容固化到 proposal、design、tasks，形成正式 change；
9. 再向用户请求正式结构确认，确认后才进入 Phase 6 写作。

planning draft 允许处理正式 proposal/design 尚不适合承载的探索性信息。例如用户可以补充“这篇文章更关注复现而不是理论”“不要展开某个前置工作”“实验硬件必须单独说明”等要求。主 agent 必须把这些决策同步到正式 design，而不能只留在对话上下文中。

正式文章大纲必须逐节写明：这一节写什么、来源文件与原文定位、必备表/公式/图、关键数值与口径、缺料时的替代方式。写作中若要偏离确认大纲，先通过 `openspec-update-change` 回写 change，不得静默改稿。

### D6：Phase 5 由主 agent 统一写 HTML

主 agent 读取：

- OpenSpec change 中已确认的文章大纲；
- `raw/<slug>/sources/` 原文；
- `raw/<slug>/analysis/` 已启用的分析 lane；
- `raw/<slug>/synthesis.md` 导航索引；
- `html-blog/SKILL.md` 及相关博客规范。

主 agent 直接写 HTML，不再默认拆分术语、问题定义、方法、实验、代码、图片和总结等写作 subagent。原有 7-Part 结构继续作为推荐骨架，但允许根据真实论文内容调整；调整必须在 change 中记录并获确认。

### D7：Phase 6 合并三类 Review，但不默认派三个 Review agent

HTML 完成后，主 agent 对同一份文章按三个维度审校：

1. **保真度**：关键贡献、公式、实验数字、数据集、baseline、作者声明回原文核查；
2. **完整性**：方法、训练、推理、实验、消融、局限、引用和图表是否覆盖；
3. **HTML/站点规范**：frontmatter、组件、MathJax、图片、`.sources`、chapter-nav、构建和发布要求。

默认由主 agent 完成一次统一 Review。只有某一维度仍有独立且耗时的核查需求时，才按需委派一个 Review lane。所有问题先修复，再进入发布。

### D8：固定工作交给脚本，理解和决策留给 agent

如需补充脚本，脚本只负责确定性工作：

- 初始化 `raw/<slug>/` 目录和 manifest；
- 下载 source/HTML/PDF、转换格式、记录 extraction log；
- 图片尺寸/格式/体积检查和转换；
- 检查分析文件、引用指针、HTML 结构和交付条件。

脚本不得：

- 判断论文贡献或替 agent 选择文章结构；
- 自动生成或拼接正文；
- 自动确认 OpenSpec；
- 自动提交 Git；
- 在没有显式参数时覆盖或删除用户文件。

### D9：模式边界和产出

| 模式/状态 | 执行范围 | 产出 |
|---|---|---|
| `full` | Phase 1–8 | raw 素材、analysis/synthesis、planning draft、正式 OpenSpec change、HTML、构建与发布准备、Hub/回链维护 |
| `planning-draft` | Phase 1–4 | raw 素材、按需 analysis、synthesis、可交互 planning draft；不写 `src/pages/`，不发布 |
| `collect` | Phase 1–3 | raw 素材、按需 analysis、synthesis；不生成 planning draft，不建文章 change，不写 HTML |
| `draft` | Phase 1 + 主 agent 直读论文 | 草稿小节、1–3 张核心图、raw 素材；不生成 planning draft，不建文章 change，不写 HTML，不 Review |

`planning-draft` 是 full 流程的中间阶段，不是与 `draft`、`collect` 并列的内容产出模式：

- `draft` 面向已有博客草稿的局部素材填充；
- `planning-draft` 面向即将生成 HTML 文章的结构、事实和决策交互；
- `collect` 面向研究素材沉淀，不进入文章规划。

`draft`、`collect` 和用户尚未确认的 `planning-draft` 都不允许写入最终 HTML；回复中必须说明当前停留在哪个门禁阶段。

## Risks / Trade-offs

- [Risk] 素材获取后进入 planning draft，用户可能在交互阶段拒绝结构，前置调研成本无法完全避免 → [Mitigation] raw、analysis、synthesis 和 planning draft 都是可复用产物；后续修改只需更新规划，不重复抓取。
- [Risk] direct 模式遗漏某一分析维度 → [Mitigation] 主 agent 使用固定覆盖清单；Phase 6 统一执行保真度、完整性和站点规范检查；复杂任务升级到 assisted/deep。
- [Risk] analysis lane 之间出现事实冲突 → [Mitigation] 所有 lane 输出事实 + 来源指针 + 不确定性；主 agent 必须回到 sources 原文核查，并在 synthesis 标记冲突。
- [Risk] 旧 `subagents/` 文档与新 lane 规则混用 → [Mitigation] 主入口明确新流程为默认，旧文件改为按需参考；扫描并清理“必须并行派发”的冲突措辞。
- [Risk] 流程简化导致跳过 OpenSpec 或发布检查 → [Mitigation] Phase 4 和 Phase 6/7 保留不可跳过的门禁；full 模式只有在用户确认结构后才能写 `src/pages/`。
- [Risk] 脚本边界扩大后误写最终文章 → [Mitigation] 脚本默认只写 raw 或临时目录；最终 HTML、change 和用户确认只能由主 agent 完成。
- [Risk] 现有质量底线与按需 lane 不匹配 → [Mitigation] 质量底线仍按论文类型执行；不适用或原文未披露的项目必须显式标注原因，不得臆测。

## Migration Plan

1. 先重写 `read-article/SKILL.md`，确立新流程、三种执行模式、analysis lane、synthesis 和模式边界。
2. 更新 extraction、article-structure、html-writing 和 Review 参考文件，改为新流程的按需参考，删除固定派发语气。
3. 更新 background/citation/treasure/methodology 及新增 experiment/terminology/image-collection 等模板，使其统一输出“事实 + 来源指针 + 不确定性”。
4. 扫描内部链接、旧 Phase 编号、`subagents/` 路径和强制性表述，保证文档自洽；历史 raw 文件不迁移、不删除。
5. 如确定性脚本确有必要，新增最小脚本并提供 `--help`、check/dry-run 和明确退出码；不将理解工作脚本化。
6. 用普通论文、复杂论文/代码仓库、collect、draft 和 planning-draft 五类场景演练：验证素材先行、按需委派、draft 交互、change 固化、用户确认和统一 Review。
7. 运行 `npm run check` 与 `npm test`，检查 diff 仅涉及本 change 规划和 read-article skill 文档。

## Open Questions

- 新分析产物是否统一落到 `raw/<slug>/analysis/`，还是在实现阶段继续使用已有的 `raw/<slug>/subagents/` 名称？设计上优先 `analysis/`，但保留旧目录兼容读取。
- 是否需要在本 change 中新增确定性辅助脚本，还是先只完成 skill 文档重构？实现时根据现有脚本能力和实际演练结果决定，不改变主流程设计。

## 文章内容大纲

本 change 不产出博客文章；以下是 `read-article` skill 改造文档的大纲，用于说明实现范围，而不是博客文章目录。

### 目标文档：`.agents/skills/read-article/SKILL.md`

- **类型与目标位置**：agent skill 主入口；不涉及 alias、sub_id 或 Hub。
- **服务对象**：需要完成单篇论文/文章深读、素材收集、草稿填充或博客发布的主 agent。
- **章节骨架**：
  1. Skill 定位与三种外部模式：说明 full/collect/draft 的边界和产出；来源为当前 `SKILL.md` 的模式章节；必备模式表。
  2. 新流程总览：输入与模式判断 → 素材获取 → 按需分析 → synthesis → change 后置 → 写作 → Review/发布；来源为本 design D1；必备 Mermaid 流程图和各阶段完成条件。
  3. 三种内部执行模式：direct/assisted/deep 的选择规则、升级信号和主 agent 责任；来源为 D2；必备决策表。
  4. 素材与分析：sources、figures、analysis、synthesis 的目录和数据流；来源为 D3/D4 及现有 `phases/extraction.md`；必备目录树和 synthesis 内容边界。
  5. Planning draft 与 OpenSpec 门禁：先生成可交互 draft，再固化 change、生成详细文章大纲，确认后才写 HTML；来源为 D5 和博客门禁规范；必备 draft 字段表、确认状态和变更记录。
  6. 主 agent 写作与统一审校：保留 html-blog、引用、MathJax、图片、实验披露和发布检查；来源为 D6/D7 及现有 `phases/html-writing.md`；必备写作前/后检查清单。
  7. 按需 lane、脚本边界和兼容迁移：说明 subagent 只能做事实分析，脚本只做确定性工作，历史 raw 产物可读；来源为 D3/D8/Migration Plan；必备责任边界表。
- **关键数据点与口径**：
  - 默认 subagent 数量为 0；复杂度决定是否进入 assisted/deep。
  - analysis lane 可选，不再固定生成 background/citation/treasure/methodology 四份文件。
  - synthesis 是索引，不是第二份总结；通常 200–500 字，超过 1000 字需要重写。
  - full 的 planning draft 在素材分析完成后生成，正式 OpenSpec change 在用户完成 draft 交互确认后固化；collect 不建 planning draft/change；draft 不写 HTML。
  - 原有 HTML 质量底线、图片优先级、引用规则和发布维护规则不降低。
- **配图/示意计划**：Mermaid 展示新流程；表格展示模式、lane 和职责；不新增博客文章图片资产。

### 目标文档：`.agents/skills/read-article/phases/*.md` 与 `subagents/*.md`

- **类型与目标位置**：内部参考文档；不涉及 alias、sub_id 或 Hub。
- **服务对象**：主 agent 在素材提取、局部分析、结构规划、写作或审校时按需查阅。
- **章节骨架**：每个文件保留领域知识与检查项，补充“适用场景、输入、输出、来源指针”四项；删除默认必须派发、必须并行或必须分段写作的语气。
- **关键数据点与口径**：保留原有公式、实验、图片、引用和 HTML 质量要求；只改变调用方式和产物组织方式。
- **配图计划**：不新增图片；继续使用论文原图、Mermaid/JSXGraph 和博客组件规范。
