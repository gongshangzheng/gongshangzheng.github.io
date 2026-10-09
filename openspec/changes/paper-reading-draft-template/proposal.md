## Why

现有 `paper-note` 模板偏向快速记要点，没有引导作者把研究任务形式化、按关键方法逐点拆解并连接训练与实验。需要一份适用于深入论文阅读的 Org-mode 草稿模板，让读者能从问题定义一路追踪到方法、训练、证据与结论。

## What Changes

- 新增深入论文阅读草稿模板，固定六部分主干：先看全局、任务与表示、关键点逐项说明、训练过程、实验结果、结论；论文笔记默认采用该模板。
- 每部分提供明确的写作提示、需要回答的问题和建议内容，不预填特定论文的事实。
- 增加 Org-mode 语法说明，覆盖标题层级、强调、代码、链接、图片、表格和 LaTeX 数学片段。
- 明确 `paper-note` 仅用于用户明确要求快读/简记的场景，不作为论文笔记默认模板；同步更新相关 skill 指引。
- 强调公式应具体定义任务输入、输出、条件和目标；符号与结论需能对应论文原文。

## Capabilities

### New Capabilities

无。此次只新增本地写作模板，不改变草稿管理脚本或用户可观察的系统行为。

### Modified Capabilities

无。

本 change 使用 `skip_specs: true`：只增加写作辅助文档，不引入新的系统级行为契约。

## Impact

- 新增 `.agents/skills/blog-drafts/templates/paper-reading-deep.org`。
- 不修改现有 `paper-note`、`brainstorm`、`plan` 模板或草稿管理脚本。
- 不涉及站点构建、发布页面、依赖或运行时代码。
