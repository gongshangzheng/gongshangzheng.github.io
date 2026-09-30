## Context

- `read-article` 当前 Phase 结构：1 素材获取 → 2 按需分析 → 3 synthesis → **4 planning draft** → **5 固化 change + 结构确认** → 6 写 HTML → 7 统一审校 → 8 发布维护。
- planning draft 与 change `design.md` 的「文章内容大纲」字段高度重叠（都是逐节：写什么 + 素材来源 + 必备元素 + 缺口）。
- 其余 6 个内容类 skill 的门禁形态是 `## Phase 0 · OpenSpec 门禁`（直接建 change），与本次方向一致。
- 主 specs 的 `content-change-planning` 目前描述的是"先建 change 再执行"（一步式），但其 requirement 4 的 scenario 写着"门禁小节位于管线**最前面**"——与 `read-article` 把门禁放在 Phase 4 的事实不符。
- `read-article` 的 `draft` **模式**（外部入口：把论文要点存进 `drafts/` 草稿）与 planning draft 同名但语义无关，改动时极易混淆。

约束：

- 不改 `read-article` 的素材获取与分析方法（Phase 1–3 保持）。
- 不改 `draft` / `collect` 两个外部入口的语义与边界。
- 不引入新的中间文件类型。

## Goals / Non-Goals

**Goals:**

- 写作规划只有一个载体：change 的 `design.md`；用户在 change 上确认一次即可开写。
- 在完整文章内容大纲之前增加固定的「核心问题与解法速览」，让用户先审阅文章问题定义、作者解法、核心思想与具体机制的简要概述。
- 在最终确认前加入基于素材/原文的 Q&A 规划迭代：回答用户问题，并将会改变文章主线、深度、取舍或结构的理解回写 design，再次呈现供审阅。
- `read-article` 的 Phase 号与其余 6 个 skill 的"直接建 change"心智一致。
- 全库不再出现 planning draft 概念（术语清零，避免与 `draft` 模式混淆）。

**Non-Goals:**

- 不动其余 6 个 skill 的门禁节位置（它们停留在管线前部，本 change 不裁决其是否应下移）。
- 不迁移其他历史 `raw/*/planning-draft.md` 的内容；**当前 StyleTalk++ 是本规则的首次真实应用**：把它迁入正式 article change 作为验收，只创建 change 并等待用户确认，不实际写文章。
- 不改 `draft` 模式（存草稿）与 `collect` 模式（被上游调用产素材）的行为。

## Decisions

### D1：规划的唯一载体 = change 的 `design.md`

取消 planning draft；素材与分析完成后直接建 change，`design.md` 的「文章内容大纲」即写作蓝图，用户确认该 change 即视为批准写作规划。

备选 A：保留 draft 作为"预规划"，但要求最终必须落到 change —— 被否：两处同构内容必然漂移，且用户要就同一件事确认两次。
备选 B：保留 draft 文件但不做门禁（纯笔记） —— 被否：仍会在最需要留痕处留下游离文档，`raw/` 不受 `openspec validate` 约束。

### D2：Phase 合并与顺移

- 原 Phase 4（planning draft）+ Phase 5（固化 change）→ **新 Phase 4 · 建 change 并规划文章**
- 原 Phase 6/7/8（写 HTML / 统一审校 / 发布维护）→ **新 Phase 5/6/7**

理由：Phase 号表达执行顺序，留空洞号会让读者去找不存在的阶段。

代价：全文引用需同步，涉及——头部管线说明、模式表、管线总览图、渐进式披露路由（Phase 4/5/6/7 行）、Phase 标题本身、Phase 5 的写作数据源列表、执行规则 4/5/11、质量底线一节（"Phase 7 逐项检查"）、故障处理。实施时逐处核对并以 grep 收口。

### D3：显式区分 `draft` 模式与 planning draft

`draft` 模式（外部入口）**保留**：用户说"存到草稿"时为 blog-drafts 草稿填充内容，不产 HTML。

改动后在 `read-article` 的模式表与 `draft` 模式小节各加一句：本模式与已废除的 planning draft 无关。理由：两者同名，是本次改动最容易误读的点。

### D4：在 design 模板中增加核心问题与解法速览

在 `Goals / Non-Goals` 与「文章内容大纲」之间加入固定小节，供内容类 change 先用简短、可审阅的语言概括文章主线。建议模板栏位为：

- 问题是什么
- 作者的解决办法是什么
- 核心思想（几句话）
- 具体机制（几句话）

论文精读需为概述提供原文定位；尚未核验的主张明确标注待核验。机制概述要涵盖主要模块/数据流及其作用，但不在速览处展开技术细节；不得将训练目标、数据集代理标签或实验效果夸大成「精确提取真实风格」等无证据结论。

理由：用户在阅读长篇章节规划前，需要先判断问题、解法和方法概括是否抓住论文主线；模板此前只有逐节大纲，缺少这一层概要。

### D5：draft 模板的「起草原则」并入 change design 模板

`references/planning-draft-template.md` 删除，但其五条起草原则（每节必须指到素材 / 缺料要写替代方案 / 区分事实与判断 / 暴露待确认项 / 保持可迭代）并入 `blog-rules/templates/content-change/design.md` 的填写说明。

理由：这些约束是 draft 模板里最有价值的部分，直接删会丢质量要求；而它们的适用对象正是「文章内容大纲」。

### D6：主 spec 的门禁位置表述改为"素材/分析产出之后、写作之前"

`read-article` 的门禁在 Phase 4（素材与分析之后）是刻意的——**没读过论文写不出有内容的文章规划**。主 spec 改为：门禁小节位于该 skill 的"素材/分析产出之后、写作之前"，其余 skill 位于其管线的规划节点。

理由：消除 spec 与事实的矛盾（现文字为"管线最前面"），同时不强行要求其余 6 个 skill 改变位置（本 change 不裁决它们）。

### D7：作废被取代的 change

`openspec/changes/align-content-skills-planning-draft`（0/16，未实施）方向与本次相反，直接删除；其"6 个 skill 对齐"的动机已消失（它们本就与本次方向一致）。

## Risks / Trade-offs

| 风险 | 说明 | 处置 |
|------|------|------|
| 术语混淆 `draft` 模式 vs planning draft | 两者同名 | D3 显式区分句 + 改完全库 grep 确认 planning draft 清零 |
| Phase 号顺移漏改引用 | 引用点分散在 6+ 处 | 逐处改动后在 read-article 内 grep `Phase [5-8]` 核对；并检查其他 skill 是否引用 read-article 的 Phase 号 |
| 核心概述被写成无证据断言 | 论文问题、机制或风格标签概括可能超出原文证据 | 论文精读要求原文定位；不确定处标注待核验；不得声称模型能「精确提取真实风格」 |\n| 删除 draft 模板后丢失起草原则 | 五条约束有价值 | D5 并入 change design 模板 |
| 历史 `raw/*/planning-draft.md` 变孤儿 | 含 StyleTalk++（当前进行中） | 本 change 不迁移历史文件；StyleTalk++ 的转换列入"后续" |
| 用户失去"轻量预规划"的交互手感 | change 的 `design.md` 直接承载规划，用户可多轮修改并查看版本差异；只有一份规划副本，确认后即为写作蓝图 |
