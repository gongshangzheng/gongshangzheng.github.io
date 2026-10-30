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
- **暗色优先但亮色可读**：默认 `html.dark`，所有新样式必须同时适配亮/暗模式。亮色主题不是附属品，两套主题的对比度都要过下面的硬性下限。

## 可读性硬性下限

以下数字由 impeccable 4.8 的 detect 引擎实测得到，属于缺陷而不是品味，改样式时不可低于：

| 项目 | 下限 | 判定方式 |
|---|---|---|
| 正文文字对比度（<18.66px） | 4.5:1 | 渲染后实测像素对比度，亮/暗各测一次 |
| 大字号文字对比度 | 3:1 | 同上 |
| 功能文字字号（计数、日期、标签、按钮） | 11px | 渲染后计算字号 |
| 西文长段落行宽 | 每行 ≤80 字符 | 渲染后行宽 |
| 图片与图注间距 | ≥8px | 图注文字到图片/边框的距离 |
| 标题层级 | `h1` → `h2` → `h3`，不跳级 | 页面 heading 序列 |

对应的三个常见错误写法：

1. **不要用 `opacity` 压弱化文字。** `--text-muted` 本身在暗色 5.5:1、亮色 6.3:1，已经够弱；再叠 `opacity: .55` 会掉到 2.7:1。要更弱就换变量，不要叠透明度。
2. **不要给不存在的变量留硬编码兜底。** `var(--bg-alt, #f8f9fa)` 这类写法在暗色主题下会把浅灰面板画在深色页面上，块内文字变成 1.5:1。本仓库的背景变量只有 `--bg-body` / `--bg-card` / `--bg-block` / `--bg-card-hover` / `--bg-menu` / `--bg-code`。
3. **强调色不要直接当小字颜色。** `--accent-gold`、`--accent-blue` 在浅底上只有 2.0–3.6:1；用在 ≥1.4rem 的大字上，或与 `--text-color` 混合（`color-mix(in srgb, var(--accent-blue) 70%, var(--text-color))`）后再用。

布局类两个已知陷阱：

- **flex 项写 `min-width` 会让它收缩到该值以下**（覆盖 `min-content` 下限）。日期、计数这类 `white-space: nowrap` 的元信息必须同时写 `flex: 0 0 auto`，否则文字溢出行宽。
- **`h2`/`h3` 会被 TOC 流程改写**（`lib/toc.js` 给 `h2` 加 `.ch-title`、`h3` 加 `.section-title`）。新增生成式标题时，若要保持原有视觉，需要在对应模块里锁回字号、内边距、下划线颜色，不能只改标签名。

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
6. 视觉改动必须在提交前用检测器复查（见下节）。

## 检测器基线

impeccable 装在全局 `~/.agents/skills/impeccable`（`~/.pi/agent/skills/impeccable` 是软链接）。改完样式后：

```bash
node build.js && node preview.js &          # public/ 随构建更新
IMPECCABLE_BROWSER="/Applications/ego lite.app/Contents/MacOS/ego lite" \
  ~/.agents/skills/impeccable/scripts/impeccable detect http://localhost:4000/categories/
```

- **浏览器**：检测器的 URL 扫描要 Chromium 系浏览器。本机没有 Chrome，用 `ego lite` 并通过 `IMPECCABLE_BROWSER` 指定，否则报 “No Chrome … found”。
- **主题**：检测器跟随系统/浏览器当前配色，一次只测一种。暗色、亮色各测一遍；系统外观变了会导致两次结果不可比，对比前后一定要确认测的是同一主题。
- **视口**：桌面默认 1280×800；窄屏加 `--viewport 390x844`。
- **执行时机**：改 `assets/css/modules/*` 后必须重新 `node build.js`，因为 `assets/css/hugo-theme.css` 是构建期合并产物，增量复用按源文件哈希判断。

共享 ignore 在 `.impeccable/config.json`（纳入版本控制）。目前两条，理由如下（该版本的 `add-rule` 不存理由字段，所以理由写在这里）：

| 规则 | 为什么忽略 |
|---|---|
| `side-tab` | `quote`、`.ch`、`.hub-section`、`.document-page` 的左侧 3–4px 强调边是本站既有的视觉锚点，不是 AI 生成味 |
| `em-dash-overuse` | 中文长文的破折号密度属正常书写习惯，且该规则本就是 advisory |

已知噪音，不构成缺陷，不用修：

- MathJax 的 `mjx-assistive-mml`（视觉隐藏的无障碍层）会被判定低对比度，那是隐藏内容的采样结果。
- 自动生成的英文论文标题必然出现末行过短（`unbalanced-heading`）与孤字（`straggler`）。
- `.photo` 图片块：图注实测有 18px 内边距，但整图铺满卡片边框，检测器会按容器自身 padding 判 `cramped-padding`。
