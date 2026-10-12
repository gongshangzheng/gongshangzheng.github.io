## Why

用户要求制作一篇完整的《Agent 使用教程：从入门到实践》，从 Codex 桌面端入门，逐步补充模型服务与计费、AGENTS.md、Skills 和工具使用等实用内容。博客已有 Agent 行业调研和 Harness Engineering 等偏概念文章，也有一篇尚未完成的 Pi 入门草稿，但缺少面向新手、语言自然且循序渐进的单篇教程。Agent 市场介绍只作为开场背景，不作为独立的“第一篇”或全文主体。对于使用 CC Switch 将国产模型接入 Codex 的具体步骤，正文直接指向指定视频的 13:45，不重复撰写详细配置教程。

## What Changes

### 文章清单

| slug | 标题 | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `agent-tutorial` | 《Agent 使用教程：从入门到实践》 | 单篇原创教程；不作为系列分篇 | `categories/AI/Agent`；不分配 `sub_id` | `src/pages/agent-tutorial.html`，全文集中于一个页面 |

- **新增**：以一篇完整教程串联 Agent 产品选择、模型服务与计费、AGENTS.md、Skills、Tools、规划工具和安全实践。开场用简短的 Agent 市场地图帮助读者选定入门入口，并通过视频建立对 Codex 基本操作的直观印象；正文重点放在后续使用技巧，不把市场盘点写成独立文章，也不拆分成系列分篇。模型服务部分区分订阅、跨工具 Coding Plan 与 API 按量计费，并明确 DeepSeek 没有 Token Plan。需要了解 CC Switch 接入国产模型时，提供视频 13:45 的直达链接，不在正文展开接入步骤。
- **草稿**：此前误建的 `drafts/agent-tutorial.org` 不作为规划或正文审批载体；获批后按需要清理或仅保留元数据，不将其视为已批准内容。
- **Hub**：无；该分类暂未建立本篇所属的系列 Hub。

## Capabilities

### New Capabilities

- `agent-usage-tutorial`: 面向普通使用者的 Agent 实操教程，交付一篇经核查、可构建发布的博客文章。

### Modified Capabilities

- 无

## Impact

- `src/pages/agent-tutorial.html`：完整教程的唯一文章页面，包含开场与全部后续章节。
- `media/images/agent-tutorial/agent-products-collage-v2.webp`：开场 Agent 市场概览使用的六站官方页面截图拼图。
- `openspec/changes/agent-tutorial/`：文章规划、规格与任务。
- `drafts/agent-tutorial.org`：此前误建草稿不作为正式规划载体；后续根据用户确认的大纲决定清理方式。
- 外部资料：Codex 官方文档、模型服务与计费页面，以及关于 CC Switch 接入国产模型的视频指引。
- 构建验证：`node build.js`、`npm test`。
- **不涉及**：修改现有 Agent 工具代码、生产服务或数据库。
