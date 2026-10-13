## Why

用户希望把已有的 Agent 入门内容整理成一篇对新手有实际帮助的教程。博客已有 Agent 行业调研和 Harness Engineering 等偏概念文章，但缺少一条从选择 Agent、理解模型服务到掌握日常使用方法的清晰路径。文章先介绍主流 Agent 产品与 Codex 桌面端的入门优势，再讲模型服务与计费、选读的 Harness Engineering、上下文及其指令/技能，最后落到规划和执行任务；市场盘点与原理说明都服务于“如何开始使用 Agent”。

## What Changes

### 文章清单

| slug | 标题 | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `agent-tutorial` | 《Agent 使用教程：从入门到实践》 | 单篇原创教程；不作为系列分篇 | `categories/AI/Agent`；不分配 `sub_id` | `src/pages/agent-tutorial.html`，全文集中于一个页面 |

- **新增**：以一篇完整教程串联 Agent 产品选择、模型服务与计费、Harness Engineering、上下文、AGENTS.md、Skill、规划工具、安全与复核。全文按六章组织：第一章介绍主流 Agent 产品，并说明 Codex 桌面端为何适合作为新手起点；第二章解释模型服务、API 与 Token Plan/Coding Plan，并根据使用频率给出选择思路；第三章为 Harness Engineering 选读，说明模型如何在 Harness 调度下调用工具；第四章把上下文、AGENTS.md 与 Skill 放在一起讲清，并用图示区分模型上下文与权限边界；第五章介绍先规划再执行，并用 OpenSpec 说明需求、设计、验收要求和任务清单的分工；第六章给出安全使用、结果复核和回退检查。正文区分 Agent 产品、模型服务与计费方案；不把 API 一概说成比订阅贵，DeepSeek 明确为只有 API、没有 Token Plan。CC Switch 仅提供指定视频 13:45 的直达链接，不扩写接入步骤。
- **草稿**：此前误建的 `drafts/agent-tutorial.org` 不作为规划或正文审批载体；获批后按需要清理或仅保留元数据，不将其视为已批准内容。
- **Hub**：无；该分类暂未建立本篇所属的系列 Hub。

## Capabilities

### New Capabilities

- `agent-usage-tutorial`: 面向普通使用者的 Agent 实操教程，交付一篇经核查、可构建发布的博客文章。

### Modified Capabilities

- 无

## Impact

- `src/pages/agent-tutorial.html`：完整教程的唯一文章页面，按 Agent 产品、模型与计费、Harness Engineering（选读）、上下文/AGENTS.md/Skill、规划与执行、安全与复核六章组织。
- `media/images/agent-tutorial/agent-products-collage-v2.webp`：开场 Agent 市场概览使用的六站官方页面截图拼图。
- `media/images/agent-tutorial/agent-pricing-collage-2026-10-12.webp`：套餐/API 价格官方页面截图拼图；文中另有三张 Mermaid 图解工具循环、上下文与权限边界、OpenSpec 规划执行。
- `openspec/changes/agent-tutorial/`：文章规划、规格与任务。
- `drafts/agent-tutorial.org`：此前误建草稿不作为正式规划载体；后续根据用户确认的大纲决定清理方式。
- 外部资料：Codex 官方文档、模型服务与计费页面，以及关于 CC Switch 接入国产模型的视频指引。
- 构建验证：`node build.js`、`npm test`。
- **不涉及**：修改现有 Agent 工具代码、生产服务或数据库。
