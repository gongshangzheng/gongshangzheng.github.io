## 1. 内容类 change 模板（放库内 skill 层：`~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/`）

- [x] 1.1在上述库内目录新建 `proposal.md`：沿用现有内容类 change 的节次（Why / What Changes / Capabilities / Impact），`What Changes` 内嵌**文章清单表**（slug、标题、类型、目标 alias、产出物），并附"填写说明"注释（哪些节能删）
- [x] 1.2同目录新建 `design.md`：含 Context / Goals·Non-Goals / **文章内容大纲** / Decisions / Risks 五节；「文章内容大纲」按 D2 的字段表给出逐篇骨架（slug·标题 / 类型与目标位置 / 章节骨架：每节写什么+素材来源+必备表·公式·图 / 关键数据点 / 配图计划 / 服务对象），并以一篇虚构精读作填写示例
- [x] 1.3同目录新建 `tasks.md`：按内容生产链路分组——计划与素材 → 逐篇写作 → 三路 Review → 发布与构建 → Hub/交叉回链 → 草稿状态回填；每组的任务写法给出示例（含 `openspec-gate.md` 要求的"审批后才执行"提示）
- [x] 1.4自查两个目录都未被污染：`find openspec -name templates` 无结果；`ls ~/.agents/skills/blog-rules` 不存在（模板只在库内）

## 2. 门禁规范（单一事实来源）

- [x] 2.1新建 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`：写明触发条件（写 `src/pages/` 或内容级增补 → 必须建 change）、豁免清单（draft/collect、小修、用户显式跳过）与理由说明要求、三步操作（`openspec new change` → 按模板填 artifact → 呈现待审批）、审批门禁（未确认不得写正文；需求变更走 `openspec-update-change`）、模板位置与"可增删节次但需说明"规则（所有路径用库内锚定写法 `~/gongshangzheng.github.io/.agents/skills/...`）
- [x] 2.2更新 `blog-rules/SKILL.md` 的「引用文件索引」表：登记新增的 `references/openspec-gate.md` 与 `templates/content-change/`（内容类 change 计划模板），并顺手补上表中缺失的 `references/pre-generation-search.md`（`read-article` 已引用但未登记）

## 3. config.yaml 接线

- [x] 3.1`openspec/config.yaml` 补 `context`：说明本项目以内容生产为主（静态博客 + 内容类 skill 管线），内容类 change 必须使用库内 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/content-change/` 模板
- [x] 3.2`openspec/config.yaml` 补 `rules.proposal`：内容类 change MUST 给出文章清单（slug、标题、类型、目标路径、产出物）
- [x] 3.3`openspec/config.yaml` 补 `rules.design`：内容类 change MUST 包含「文章内容大纲」，逐篇给出章节骨架（每节写什么 + 素材来源 + 必备表·公式·图）与关键数据点
- [x] 3.4`openspec/config.yaml` 补 `rules.tasks`：内容类 change 的任务组 MUST 覆盖"计划与素材 / 逐篇写作 / Review / 发布 / Hub 与回链 / 草稿状态回填"，并在写作组前标注审批前置
- [x] 3.5验证 `openspec instructions design --change <新 change> --json` 返回的 `context`/`rules` 含上述内容（用本 change 自身回归）

## 4. 第一批：read-article 接门禁（先跑通）

- [x] 4.1`read-article`：在「模式」节之后插入 `## Phase 0 · OpenSpec 门禁 [full only]`——full 模式必须先建 change 并按 `content-change` 模板写出「文章内容大纲」待确认；`draft` / `collect` 模式豁免并说明理由；同时在 Phase 4 补一句"按 change 中已批准的大纲落笔；大纲需变更时走 update-change"
- [x] 4.2冒烟并停下：以 `raw/` 已有素材（如 `raw/echoavatar-2026/`）跑一次"建 change + 填模板 + 呈现待审批"，把产出交给用户看；**只到审批呈现，不写 HTML、不发布**
- [ ] 4.3 收集反馈并定稿模板：确认「文章内容大纲」的字段（slug/目标位置/章节骨架/关键数据点/配图计划/服务对象）是否够用、是否多余、"这一节写什么"的粒度是否合适；据此修模板与 `openspec-gate.md`，**改完才进入第 5 组**

## 5. 第二批：其余 6 个 skill 铺开（需第 4 组冒烟通过）

- [ ] 5.1 `academic-research`：管线开头插入门禁小节（产 survey/系列文章时必须先建 change，含各篇内容大纲；纯检索/collect 豁免）
- [ ] 5.2 `deep-research`：输出为 HTML 报告/文章时接门禁；仅对话内结论时豁免（在门禁小节写明判定）
- [ ] 5.3 `historical-narrative`：接门禁，计划中「文章内容大纲」为编年分节骨架
- [ ] 5.4 `book-to-blog`：接门禁（full 模式全书转写必须先列章节清单与每章内容要点；extract 单篇精读按内容级增补判定）
- [ ] 5.5 `course-notes`：接门禁（生成/重写/扩展课程笔记并发布时先出计划；批量课件按一次 change 覆盖多节）
- [ ] 5.6 `github-repo-read`：接门禁（源码解读成文前先出计划，含代码分析章节骨架）
- [ ] 5.7 六个 skill 的门禁小节统一为 3-5 行 + 指向库内 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`（不得写全局 `~/.agents/skills/` 路径），不复制流程正文；逐个自查无重复正文
- [ ] 5.8 铺开时若发现形态不适配（如 book-to-blog 的章节清单、course-notes 的批量课件）→ 允许按形态增删模板节次并回写模板；若属根本性不适配则回退第 4 组重修

## 6. 校验

- [ ] 6.1 `openspec validate content-skills-openspec-gate --strict` 通过
- [ ] 6.2 负例检查：确认 `draft` 模式（如"把这篇存到草稿"）确实不触发门禁，且回复中带有豁免理由
- [ ] 6.3 清空冒烟产生的临时 change（或转为正式使用），`openspec list` 状态正常
- [ ] 6.4 与 `fix-stale-skill-paths` 交叉确认：本次新增引用的路径写法与该 change 的口径一致（库内 skill 用库内锚定路径）
- [ ] 6.5 在本 change 的 tasks 完成项打勾后提请 archive
