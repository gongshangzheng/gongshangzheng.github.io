# impeccable 改动后复查

generator: impeccable 4.8.0 / engine 0.1.18 / browser = ego lite

## 浅色主题（系统当前 Light，改前基线同为浅色）

| 面 | 改前 | 改前明细 | 改后 | 改后明细 |
|---|---|---|---|---|
| home | 3 | low-contrast×2, wide-tracking×1 | 0 | — |
| categories | 39 | undersized-ui-text×26, low-contrast×12, side-tab×1 | 0 | — |
| category-ai | 21 | text-overflow×20, em-dash-overuse×1 | 0 | — |
| tags | 0 | — | 0 | — |
| hub-dir | 11 | low-contrast×3, cramped-padding×3, straggler×3, side-tab×1, skipped-heading×1 | 6 | cramped-padding×3, straggler×3 |
| hub-page | 11 | low-contrast×3, cramped-padding×3, straggler×3, side-tab×1, skipped-heading×1 | 6 | cramped-padding×3, straggler×3 |
| digest | 130 | line-length×68, unbalanced-heading×24, low-contrast×23, straggler×14, skipped-heading×1 | 47 | unbalanced-heading×24, straggler×16, low-contrast×5, line-length×2 |
| article-course | 0 | — | 0 | — |
| m-home | 3 | low-contrast×2, wide-tracking×1 | 0 | — |
| m-categories | 39 | undersized-ui-text×26, low-contrast×12, side-tab×1 | 0 | — |

合计：257 → 59

## 深色主题（探针页注入 localStorage theme=dark，已确认 html.dark / bg #1c1914 生效）

| 面 | 改后 | 明细 |
|---|---|---|
| home | 0 | — |
| categories | 0 | — |
| hub-page | 6 | cramped-padding×3, straggler×3 |

## 残余项说明

- hub 的 `cramped-padding×3`：图片铺满卡片边框触发容器级判定；图注实测 18px 内边距，属检测器噪音，已在 skill 记录。
- digest 的 `low-contrast×5`：MathJax `mjx-assistive-mml` 视觉隐藏层的采样 + 作者 `\color{red}` 数学内容。
- digest 的 `line-length×2`：不可断行的长串（含 URL）。
- `straggler` / `unbalanced-heading`：自动生成英文标题与中文摘要的固有末行形态，均为 advisory。
- `article-course`（dsp 笔记，3 万+ 元素）两轮都被检测器拒绝快照，未纳入对比。
