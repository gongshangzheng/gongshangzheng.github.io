# article-body-visual-pass 验证（改动后）

generator: impeccable 4.8.0 / engine 0.1.18 / browser ego lite / 浅色主题

| 面 | 改前 | 其中 warning | 改后 | 其中 warning | 改后明细 |
|---|---|---|---|---|---|
| home | 0 | 0 | 0 | 0 | — |
| categories | 0 | 0 | 0 | 0 | — |
| category-ai | 0 | 0 | 0 | 0 | — |
| tags | 0 | 0 | 0 | 0 | — |
| hub-page | 6 | 3 | 7 | 3 | cramped-padding×3, straggler×3, low-contrast×1 |
| digest | 47 | 2 | 49 | 8 | unbalanced-heading×24, straggler×16, low-contrast×7, line-length×2 |
| hou-jing-rebellion | 7 | 6 | 0 | 0 | — |
| paper-anythermal | 13 | 9 | 0 | 0 | — |
| video-gen-acceleration | 14 | 5 | 0 | 0 | — |
| jp-n5-04-shopping | 9 | 7 | 0 | 0 | — |

合计 findings：96 → 56

## 深色主题（探针页注入 theme=dark，已确认 html.dark 生效）

| 面 | 改后 | 明细 |
|---|---|---|
| home | 0 | — |
| paper-anythermal | 1 | straggler×1（advisory） |
| video-gen-acceleration | 0 | — |

## 标题大纲

- 改动前：570 个页面存在 h1→h3 跳级（其中 526 个整页无 h2）
- 改动后：2874 个页面全部无跳级

## 视觉一致性

- 7 个代表页 91 个标题逐项比对计算样式：字号、字重、四边距、下划线、行高差异 0 处
- 13 处颜色变化是本次要修的对比度调整（组件标题从纯强调色改为与文字色混合）

## 残余项（已定性，不修）

- `hub-page` 的 `cramped-padding×3`：图片铺满卡片边框的容器级判定
- `digest` 的 `low-contrast`：MathJax 视觉隐藏层采样 + 作者 `\color{red}`
- `line-length×2`：不可断行的长串
- `straggler` / `unbalanced-heading` / `meta-tag 4.4:1`：advisory
