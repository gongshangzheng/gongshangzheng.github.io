## 1. 基线

- [x] 1.1 复扫 8 个既有面 + 4 个正文面（`hou-jing-rebellion`、`paper-anythermal`、`jp-n5-04-shopping`、`video-gen-acceleration`），把每个面的 finding 按规则记进 `baseline.md`
- [x] 1.2 统计标题跳级面：记录含跳级的页面数（当前 570，其中 526 个整页无 `h2`）

## 2. 标题大纲归一（构建期）

- [x] 2.1 `lib/toc.js`：按文档中第一个 `h2`–`h6`（**含卡片组件内部的标题**）算出 `shift = max(0, 首个标题层级 - 2)`
- [x] 2.2 输出标签层级用 `max(2, 原层级 - shift)`；样式类映射仍按**原层级**（`.ch-title` / `.section-title` / `.ch-section`）
- [x] 2.3 把同一偏移作用到被排除容器（`info-box`/`callout`/`sources` 等）内部的标题标签上：只改标签，仍不进 TOC
- [x] 2.4 7 个代表页 91 个标题比对改动前后的计算样式：非颜色项差异 0 处
- [x] 2.5 全站重扫标题层级：570 → 0（2874 个页面无跳级）；已有 `h2` 的页面层级不被改写
- [x] 2.6 组件标题选择器补 `h2` 镜像：`.info-box` / `.def-box` / `.callout` / `.example-box` / `.theorem-box` / `.sources` 的标题样式同时命中 `h2` 与 `h3`
- [x] 2.7 逐项比对改动前后标题计算样式（字号/字重/四边距/下划线/行高），非颜色项差异为零

## 3. 正文组件对比度

- [x] 3.1 `assets/css/modules/article-components.css`：`.info-box` 标题色混合比例从 75% 收到 45–55% 区间
- [x] 3.2 同文件：`.def-box`、`.callout`、`.example-box` 标题色同法配平，两主题实测 ≥4.5:1
- [x] 3.3 `assets/css/modules/hero.css`：`.stats .num.g` 大字对比度 ≥3:1
- [x] 3.4 `assets/css/modules/embeds.css`：`.admonition` 各 tone 的标题色配平；修掉 `color: --accent-blue);` 语法错误
- [x] 3.5 复扫 4 个正文面，组件标题 `low-contrast` 归零

## 4. 内边距、嵌套容器、行内数学

- [x] 4.1 `embeds.css`：`.admonition:not(:has(> .admonition-content)) { padding: 1em }`，裸写法文字距边框 ≥8px，带包裹的不出现双层缩进
- [x] 4.2 `article-struct.css`：组件内 `.table-wrap` 去边框与圆角（`.info-box` / `.def-box` / `.example-box` / `.callout`），横向滚动保留
- [x] 4.3 `article-struct.css`：`.math-inline mjx-container` 设相对字号，实测 `mn` ≥11px 且行距不抖；不达标则改登记为噪音
- [x] 4.4 `hero.css`：`.hero-inner .sub` 的 `letter-spacing` 0.30em → 0.05em

## 5. 基线配置与文档

- [x] 5.1 `.impeccable/config.json` 增加 `shape-assembled-illustration` ignore，理由写进 `site-design-language` 的检测器基线小节
- [x] 5.2 `site-design-language` 补：组件标题色不得直接用强调色、组件内不得重复卡片化、行内数学字号同受 11px 下限约束、标题归一由构建期负责（作者可继续写 `###`）

## 6. 验证与交付

- [x] 6.1 `node tests/run.js` 通过（含 TOC 相关 231 项）
- [x] 6.2 `node build.js` 通过
- [x] 6.3 复扫 10 个面并与基线对比（46 个 warning → 12，均为已定性噪音），写入 `verification.md`
- [x] 6.4 暗色主题复扫 3 个面（探针页注入 `theme=dark`）
- [x] 6.5 `git status --short` 确认只包含本 change 触及的文件，并行会话的改动不纳入
- [x] 6.6 提交并推送，远程显式校验
