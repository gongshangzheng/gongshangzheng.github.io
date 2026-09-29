## 1. 共享层：planning draft 契约与模板

- [ ] 1.1 新建 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/planning-draft.md`：通用两段式契约——定位（不是已批准大纲、不得写 `src/pages/`）、落盘位置（`raw/<slug>/planning-draft.md` 默认 / change 已存在时 `openspec/changes/<slug>/draft.md`）、必须字段清单、多轮交互与决策沉淀规则、上游调用例外、领域特化模板"只许增不许减"的约束
- [ ] 1.2 新建 `~/gongshangzheng.github.io/.agents/skills/blog-rules/templates/planning-draft.md`：通用字段模板（产出清单 / 逐篇逐节骨架 / 素材来源（具体文件与定位）/ 关键数据点 / 图表公式计划 / 缺口与待确认项 / 已确认决策 / 变更记录），字段说明措辞去论文化
- [ ] 1.3 改写 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/openspec-gate.md`：三步操作 → **四步**（产出 planning draft → 用户交互确认 → 固化 change → 结构确认）；补"门禁位置在分析产出之后、写作之前"；补上游调用例外；豁免清单保持不变（draft/collect、小修、显式跳过）
- [ ] 1.4 更新 `blog-rules/SKILL.md` 引用索引表：登记 `references/planning-draft.md` 与 `templates/planning-draft.md`

## 2. read-article 的衔接（仅声明，不改流程）

- [ ] 2.1 在 `read-article/references/planning-draft-template.md` 顶部加一段：通用契约与必须字段见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/planning-draft.md`；本文件为**论文领域特化补充**，只增加字段不改写共享层约束
- [ ] 2.2 复核 `read-article/SKILL.md` 的 Phase 4/5 未因此变动（不改其 Phase 结构、不改 Phase 5 的上游例外规则，改由共享层统一表述时仅加一句指向）

## 3. 六个 skill 的门禁节改写（位置下移 + 指向共享层）

- [ ] 3.1 把每个 skill 的 `## Phase 0 · OpenSpec 门禁` 改写为 `## planning draft + 固化 change [<适用模式>]`，节内首句写明位置，全文保持在 3-5 行 + 指针：
  - `academic-research`：位置 = Phase 3（领域重组/survey-spine）之后、Phase 4 之前
  - `deep-research`：位置 = analysis 之后、composition 之前
  - `historical-narrative`：位置 = Phase 3（synthesis）之后、Phase 4 架构规划之前
  - `book-to-blog`：位置 = 章节拆分方案之后、写作之前（full 逐章 / extract 单篇）
  - `course-notes`：位置 = Phase 3（WEB REFERENCES）之后、Phase 4（COMPOSITION）之前
  - `github-repo-read`：位置 = 读码分析完成之后、blog 写作之前
- [ ] 3.2 每个节内指明本 skill 的适用模式与豁免（如 deep-research 仅对话内结论豁免、historical-narrative `oral` 豁免、github-repo-read 只读分析豁免、course-notes 仅前期分析豁免）
- [ ] 3.3 每个节内引共享层路径：`~/gongshangzheng.github.io/.agents/skills/blog-rules/references/planning-draft.md` + `references/openspec-gate.md` + `templates/content-change/`，不复制流程正文
- [ ] 3.4 补齐上游调用例外的镜像表述：被上游 skill 调用且上游 change 已批准时不再要求二次确认，但本层结构与素材来源必须写入上游 change

## 4. 校验

- [ ] 4.1 7 个 skill 自查：门禁节均不在管线最前面、均指向共享层、无流程正文复制、无新增死路径
- [ ] 4.2 `~/.venv/bin/python3 scripts/check-skill-paths.py` 退出码 0
- [ ] 4.3 `openspec validate align-content-skills-planning-draft --strict` 通过
- [ ] 4.4 `node build.js` 无错误；`npm test` 通过
- [ ] 4.5 交叉核对主 spec：`content-change-planning` 中不再存在"门禁位于管线最前面"的表述
- [ ] 4.6 在本 change 的 tasks 完成项打勾后提请 archive
