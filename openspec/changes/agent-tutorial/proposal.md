## Why

用户要求制作一篇《Agent 使用教程》，此前已讨论出以 Codex App 入门、CC Switch 切换国产模型后端为主线，并补充 Agent 配置与 Skills 基础。博客已有 Agent 行业调研和 Harness Engineering 等偏概念文章，也有一篇尚未完成的 Pi 入门草稿，但缺少面向实际使用者、从桌面工具起步并讲清模型供应商配置的操作教程。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `agent-tutorial` | 《Agent 使用教程》 | 原创教程 | `categories/AI/Agent`；该分类尚无系列编号，不分配 `sub_id` | `src/pages/agent-tutorial.html` |

- **新增**：从 Codex App 的新手上手讲起，介绍通过 CC Switch 接入国产模型服务，并解释协议兼容、AGENTS.md、Skills 与安全使用的基础知识。
- **草稿**：此前误建的 `drafts/agent-tutorial.org` 不作为规划或正文审批载体；获批后按需要清理或仅保留元数据，不将其视为已批准内容。
- **Hub**：无；该分类暂未建立本篇所属的系列 Hub。

## Capabilities

### New Capabilities

- `agent-usage-tutorial`: 面向普通使用者的 Agent 实操教程，交付一篇经核查、可构建发布的博客文章。

### Modified Capabilities

- 无

## Impact

- `src/pages/agent-tutorial.html`：新增文章。
- `openspec/changes/agent-tutorial/`：文章规划、规格与任务。
- `drafts/agent-tutorial.org`：此前误建草稿不作为正式规划载体；后续根据用户确认的大纲决定清理方式。
- 外部资料：Codex 官方文档、CC Switch 官方项目文档与必要的第三方配置教程。
- 构建验证：`node build.js`、`npm test`。
- **不涉及**：修改现有 Agent 工具代码、生产服务或数据库。
