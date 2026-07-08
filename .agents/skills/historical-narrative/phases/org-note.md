# Phase 2 — 创建 Org-roam 笔记

使用 `re` research 模板创建笔记，但结构改为编年体。

```bash
emacs --script ~/.hanako/skills/org-roam-capture/org-roam-capture-template.el re "<标题>"
```

笔记目录：

```text
~/Org/roam/note/
```

## 编年体结构

| Heading | 内容 |
|---|---|
| `* 调研问题` | 事件起止时间、核心问题 |
| `* 参考来源` | 所有来源标题 + URL |
| `* 时间线` | 按年份/月份的关键事件表格 |
| `* 编年叙事` | 核心模块，按序幕/爆发/发展/高潮/结局/余波分节 |
| `* 关键人物` | 重要人物简介 |
| `* 数据与影响` | 统计数据、长期影响 |
| `* 结论` | 几句话总结历史意义 |

把各 subagent 的产出按时间段回填到 `* 编年叙事`。
