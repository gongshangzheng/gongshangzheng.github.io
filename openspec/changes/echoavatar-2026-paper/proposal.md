<!-- 依 templates/content-change/proposal.md 填写 -->

## Why

触发来源：`drafts/echoavatar-2026.md`（outlining / 40%）已落入原文精读要点——统一音频域全身驱动、GRPO/DPO 双路线 RL 对齐、LLM tool-call 语义注入；素材已就位（`raw/echoavatar-2026/`：全文 1004 行 + 9 张原图），草稿备注明确"升级为 read-article 全文精读的候选（素材充分）"。

库内现状缺口：

1. 系列三 `digital-human-motion-space-avatar.html` 的"动作空间的实时化浪潮"小节已按机制列到 EchoAvatar，但只有三条机制标签，**没有精读承接方法细节**（tokenizer 设计、RL 对齐的理论解释、延迟预算分解）
2. 系列十二 `realtime-digital-human-survey.html` 的实时性对比表缺 EchoAvatar 的端到端延迟数据
3. "工具增强型数字人 Agent"文章点了 tool-call 理念，缺一个落地实例的详细拆解

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `echoavatar-2026` | 数字人论文精读（六十八）：EchoAvatar，语音+音乐统一全身驱动的实时流式 Avatar | 论文精读 | `categories/AI/数字人/数字人论文精读`；sub_id 700（`check-sub-id.py --suggest` 给出；690→六十七，故本文为六十八） | `src/pages/echoavatar-2026.html` |

- **新增**：EchoAvatar 全文精读（数字人论文精读第六十八篇）
- **更新**：`digital-human-motion-space-avatar.html` 的 EchoAvatar 条目 → 补指向本精读的链接
- **更新**：`realtime-digital-human-survey.html` → 实时性表增补 177.4 / 215.8 ms（标注 H200 / RTX 4090 口径）
- **草稿**：`drafts/echoavatar-2026.md` 发布后状态回填为 published
- **Hub**：`digital-human-hub.html` 精读分区收录

## Capabilities

### New Capabilities
- `digital-human-echoavatar`: EchoAvatar 精读交付能力——文章 MUST 按机制（而非标签）覆盖因果注意力 motion tokenizer、RVQ 解剖分区 codebook、GRPO/DPO 对齐及其理论解释、tool-call 语义注入、延迟预算分解；MUST 与系列三 / 系列十二 / tool-call 文章交叉对照

### Modified Capabilities

## Impact

- `src/pages/`：新增 `echoavatar-2026.html`；更新 `digital-human-motion-space-avatar.html`、`realtime-digital-human-survey.html`、`digital-human-hub.html`
- `drafts/`：`echoavatar-2026.md` 发布后回填 `status=published`
- `raw/`：素材已就位（`sources/echoavatar-2026.md` 1004 行 + `figures/echoavatar-2026/` 9 张）；**缺 `subagents/`**（Phase 2 未跑，第 2 组写作前补齐）
- 构建验证：`node build.js`、`scripts/check-sub-id.py`
- **不涉及**：论文无开源仓库（仅项目页），不写代码分析节；不涉及后端与依赖
