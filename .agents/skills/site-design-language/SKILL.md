---
name: site-design-language
description: |
  本仓库静态博客站点的设计语言规范。用于修改页面模板、CSS 模块、索引页、专题页、卡片、导航、分类页等视觉与交互时，先对齐 Thus Spoke Zachary 的整体风格。
  触发场景：站点美化、页面改版、CSS 调整、模板设计、分类页/标签页/索引页视觉收敛、博客站设计语言统一。
version: 1.0.0
category: site-development
tags: [design-system, css, static-blog, visual-style]
---

# Thus Spoke Zachary 设计语言

## 核心气质

这是一个偏个人知识库和长文阅读的静态博客，不是营销落地页。视觉应保持：

- **纸质感**：暖米色、棕色、低对比边框，像书页和笔记。
- **克制**：少用大面积渐变、霓虹色、强玻璃拟态和过重阴影。
- **学术/手记感**：标题有手写黑体气质，正文保留仿宋阅读感。
- **暗色优先但亮色可读**：默认 `html.dark`，所有新样式必须同时适配亮/暗模式。

## 色彩规则

优先使用已有 CSS 变量：

- 背景：`--bg-body`、`--bg-card`、`--bg-block`、`--bg-card-hover`
- 文字：`--text-color`、`--text-muted`、`--text-heading`
- 边框：`--border-color`、`--border-light`
- 主强调：`--accent`、`--link-color`、`--link-hover`
- 少量辅助强调：`--accent-gold`、`--accent-blue`、`--accent-red`
- 阴影：`--shadow-soft`

避免大面积高饱和彩虹渐变。分类、标签、索引这类信息架构页可以保留小面积的分类 `tone`、符号 icon 和一句描述，用于增强识别；但 tone 应只出现在顶部细线、icon 背景、chip hover 等局部位置，并通过 `color-mix()` 与 `--bg-card` / `--border-light` 混合，避免压过站点的暖棕纸质主调。

## 排版规则

- 标题字体沿用 `LXGW Marker Gothic`，正文沿用 `Zhuque Fangsong`。
- 页面主标题不要做营销式巨幅 hero。工具型索引页更适合紧凑标题区。
- 标题下划线、边框、浅底卡片是本站常用视觉锚点。
- 正文/说明文案要少而准；如果页面本身是导航入口，不要写空泛介绍。

## 布局与组件

- 内容宽度优先对齐现有 `.main-content` / `.wrap` 体系。
- 卡片使用：`border: 1px solid var(--border-light)`、`background: var(--bg-card)`、`border-radius: 10px-14px`、`box-shadow: var(--shadow-soft)`。
- hover 应轻：`translateY(-1px/-2px)`、边框变为 `--link-color` 或 `color-mix(... var(--accent) ...)`。
- 药丸/chip 使用细边框和浅背景，不要用实心高饱和色块。
- 移动端优先保持一列、减少装饰元素，避免高度浪费。

## 页面改版流程

1. 先读取相关模板和 CSS 变量，确认现有写法。
2. 使用已有变量和组件风格，不先发明新主题。
3. 对工具型索引页，优先压缩 hero 高度、减少介绍文案、突出信息密度。
4. 修改 `lib/` 或 `src/` 后运行 `node tests/run.js` 和 `node build.js`。
5. 交付前检查 `git status --short` 和 `git diff --stat`，避免混入无关构建产物。
