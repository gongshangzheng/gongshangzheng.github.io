## 1. change 模板与共享门禁

- [x] 1.1 将旧规划模板中仍有价值的五条原则（每节指素材 / 缺料写替代 / 区分事实与判断 / 暴露待确认项 / 保持可迭代）并入 `blog-rules/templates/content-change/design.md` 的填写说明
- [x] 1.4 在 design 模板中新增「核心问题与解法速览」固定小节，含问题、作者解法、核心思想、具体机制；补充原文定位/待核验标注与避免无证据夸大机制效果的填写要求
- [x] 1.5 澄清原文定位与核验状态的区别：定位用于追溯依据；已对照原文的内容不应笼统标为待核验，仅未核实的具体主张需标注
- [x] 1.6 在 `read-article` Phase 4 增加规划审批前的 Q&A 迭代阶段：回答用户关于问题、方法、训练、损失、实验的提问，并将影响主线/解释/取舍/结构的结论回写 design；纯答疑不强制入 artifact
- [x] 1.7 在 content-change-planning spec 中规定 Q&A 迭代、design 更新和再次呈现要求，确认整体规划后才能写正文
- [x] 1.2 改写 `blog-rules/references/openspec-gate.md`：明确写作规划直接写在 change 的 `design.md`「文章内容大纲」中，MUST NOT 另产独立规划文件；用户对该 change 的确认即为批准写作规划
- [x] 1.3 删除旧规划模板（其通用内容已并入 change 模板；论文专属字段保留在 read-article Phase 4 指引中）

## 2. read-article 流程重构（full 模式）

- [x] 2.1 更新头部描述、核心理念、最终交付、保留产物与「前置·库内检索」：删除旧规划流程表述，库内检索改为 Phase 4 建 change / 规划文章前执行
- [x] 2.2 更新模式表、模式边界说明与管线总览：full 产出为 raw + analysis + synthesis + OpenSpec change（含写作规划）+ HTML；collect 为 Phase 1–3；draft 模式保留且明确与已删除的 planning draft 概念无关
- [x] 2.3 删除独立规划草稿规范节；把其共享规则留在 `openspec-gate.md`，不再保留旧模板引用
- [x] 2.4 将原 Phase 4（草拟规划）+ Phase 5（固化 change）合并为 `Phase 4 · 建 change 并规划文章 [full only]`：素材/分析完成后建 change，按 content-change 模板填 proposal/design/tasks；`design.md` 逐节写清本篇怎么写（写什么 + 素材来源 + 必备表/公式/图 + 字数参考 + 缺料替代）；向用户呈现该 change 并等待确认
- [x] 2.5 原 Phase 6/7/8 顺移为 Phase 5/6/7（写 HTML / 统一审校 / 发布维护）；全文同步阶段号、交叉引用、数据源列表、渐进式披露路由、执行规则、质量底线与故障处理
- [x] 2.6 明确 `draft` 外部模式（存入 `drafts/`）保留；Phase 4 change 确认前不得写 `src/pages/`；用户确认后的结构变更走 `openspec-update-change`
- [x] 2.7 增补“阅读起点”规则：进入方法拆解前先核实问题定义、研究动机/难点、现有方法缺口，形成带原文指针的简明问题陈述；证据不足时标为待核实并回读，不凭方法倒推动机

## 3. spec 与过时 change 清理

- [x] 3.1 删除未实施且方向相反的 `align-content-skills-planning-draft` change，避免以后误执行
- [x] 3.2 更新 `content-change-planning` delta：MODIFIED requirement 4，将门禁小节位置从"管线最前面"改为"素材/分析产出之后、写作之前"，并规定文章规划写在 change `design.md` 中
- [x] 3.3 更新 `content-change-planning` 的阅读计划要求：论文精读的 change 规划须先说明问题—动机—现有方法缺口，并以原文素材指针支持

## 4. StyleTalk++ 真实应用（只到待审批）

- [x] 4.1 将 StyleTalk++ 旧规划文件的内容迁入正式文章 change `openspec/changes/styletalkpp-2024/`：proposal 说明接力草稿与素材现状；design 的「文章内容大纲」逐节规划文章；tasks 列后续写作、审校、发布任务
- [x] 4.2 解决 sub_id 冲突：`echoavatar-2026-paper` 也计划 sub_id 700；在 StyleTalk++ change 中显式列出分配建议并由用户裁决（不擅自改已存在的 change）
- [x] 4.3 将 StyleTalk++ change 呈现给用户待审批；**本 change 只负责验证"规划写在 change 里"，未获用户对文章 change 的确认前不写 HTML、不发布**
- [x] 4.4 已将规划迁入文章 change；为等待用户对文章 change 的确认，本阶段暂保留旧 `raw/styletalkpp-2024/planning-draft.md`。用户确认后再删除旧文件。
- [x] 4.5 在 StyleTalk++ design 的速览中补充具体机制及其原文训练依据，明确风格相似样本的构造假设、triplet 约束与下游生成损失；说明这不等于证明模型能精确识别真实风格
- [x] 4.6 根据本轮 Q&A 更新 StyleTalk++ design：澄清问题/方法、Style Encoder 的功能与训练、triplet loss 的三元组距离约束和 margin=5；记录用户关注的解释重点

## 5. 校验

- [x] 5.1 `openspec validate plan-article-inside-change --strict` 通过
- [x] 5.2 `scripts/check-skill-paths.py` 退出码 0
- [x] 5.3 grep 确认 `read-article` skill 与 references 中无旧规划流程残留
- [x] 5.4 grep 与人工复核 Phase 号：Phase 5=HTML、Phase 6=统一审校、Phase 7=发布；其他 skill 未引用旧 Phase 6/7/8
- [x] 5.5 `node build.js` 无错误；`npm test` 通过（构建成功；站点已有 66 篇每日 arXiv HTML lint 告警）
- [ ] 5.6 本 change 的 tasks 完成后提请 archive
