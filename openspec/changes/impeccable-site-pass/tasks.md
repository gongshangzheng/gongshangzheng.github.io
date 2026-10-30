## 1. 基线记录

- [x] 1.1 用 `IMPECCABLE_BROWSER="/Applications/ego lite.app/Contents/MacOS/ego lite"` 对 8 个基线面（`/`、`/categories/`、`/categories/ai/`、`/tags/`、`/categories/ai/digital-human/`、`/digital-human-hub.html`、`/arxiv-digest-2026-09-24.html`、`/dsp-dft-and-fft.html`）复扫一次，把每个面的 finding 数量按规则记进 `tmp/impeccable-scan/baseline.md`，作为"改动后不高于基线"的对照
- [x] 1.2 对 `/` 和 `/categories/` 追加 390×844 视口扫描，记录移动端基线

## 2. P0 可读性修复

- [x] 2.1 `src/pages/digital-human-hub.html`：「推荐外部资源」块去掉内联 `border-left/padding/background`，改用既有卡片类 + `--bg-block` / `--border-light` / `--accent`，确认块内正文、链接、标签在暗色下均 ≥4.5:1
- [x] 2.2 `src/pages/index.html`：`.home-quote` 去掉 `opacity: .7`（保留 `--text-muted`），`#sortable-posts .post-list .date` 去掉 `opacity: .55` 并把字号提到 `0.8rem`
- [x] 2.3 `assets/css/modules/hero.css`：`.taxonomy-chip-sm` 去掉 `opacity: .82`（改为在 hover 时用 `--taxonomy-tone` 提亮），`.taxonomy-chip-sm strong` 字号 `0.68rem` → `0.7rem`
- [x] 2.4 `assets/css/modules/nav.css`：`.post-list .date` 增加 `flex: 0 0 auto`，保留 `min-width` 作为下限
- [x] 2.5 复扫 `/`、`/categories/`、`/categories/ai/`，确认 `low-contrast`、`undersized-ui-text`、`text-overflow` 三类归零

## 3. P1 排版修复

- [x] 3.1 `src/pages/index.html`：`.home-subtitle` 的 `letter-spacing` 改为 `0.02em`
- [x] 3.2 验证项：390px 下实测 `.home-subtitle` 左右各 16px、`.home-quote` 16px、页脚 24px，已无贴边（`site-performance` 那次改动已修掉），未新增 CSS
- [x] 3.3 `lib/generators/post-graph.js`：关系图标题 `h3` → `h2`；`assets/css/modules/post-graph.css` 把 `.post-graph-header h3` 换成 `h2` 并锁定原 `font-size`/`margin`，保证视觉不变
- [x] 3.4 `assets/css/modules/article-components.css`：为 `.paper-abstract p`（及 `.category-summary` 的段落）加约 `68ch` 最大行宽
- [x] 3.5 实测：`.cap` 计算内边距 18px、3 张图全部正常加载，同构最小用例不被判定；判定为图片铺满卡片边框触发的容器级误报，未给全站图片加内边距（理由记入 skill 的已知噪音）
- [x] 3.6 构建后抽查 3 个含关系图的页面（分类索引、Hub、课程笔记），确认标题层级为 h2 且字号/间距未变

## 4. 检测器基线与忽略项

- [x] 4.1 用 `impeccable ignores add-rule side-tab --reason ...` 与 `add-rule em-dash-overuse --reason ...` 写入共享配置 `.impeccable/config.json`
- [x] 4.2 `.gitignore` 放行 `.impeccable/config.json`，继续忽略 `config.local.json` 与运行期产物
- [x] 4.3 `impeccable ignores list` 确认共享项生效、本地项为空

## 5. 文档与流程

- [x] 5.1 `.agents/skills/site-design-language/SKILL.md` 增补「可读性硬性下限」小节：对比度（正文 4.5:1 / 大字 3:1）、功能文字 ≥11px、禁止用 `opacity` 压弱化文字、禁止不存在的变量兜底、列表元信息不溢出、标题层级不跳级、西文行宽 ≤80 字符、图注间距 ≥8px
- [x] 5.2 同一 skill 增补「验证回路」小节：`IMPECCABLE_BROWSER` 指向 `ego lite`、桌面与 390×844 两档视口、暗/亮两主题、检测器名称与版本记录、ignore 走共享配置
- [x] 5.3 `AGENTS.md` 补一行：触及视觉/样式的改动必须在提交前用 `impeccable detect` 复查，量化下限以 `site-design-language` 为准

## 6. 验证与交付

- [x] 6.1 运行 `node tests/run.js` 通过
- [x] 6.2 运行 `node build.js` 通过，产物无异常
- [x] 6.3 复扫 1.1 的 8 个面，逐项对比基线（257 → 59，残余项已逐条定性），写入 `tmp/impeccable-scan/after.md`
- [x] 6.4 深色主题复扫 `/`、`/categories/`、`/digital-human-hub.html`（探针页注入 `localStorage theme=dark`，已确认 `html.dark` 生效）：0 / 0 / 6（仅 cramped-padding×3 + straggler×3）
- [ ] 6.5 `git status --short` 确认只包含本 change 触及的文件，toc 相关既有改动保持未提交状态
- [ ] 6.6 按 OpenSpec 交付口径提交并推送，远程显式 checkout 校验 commit

## 7. 实施期追加：日报标题层级与同类缺陷

- [x] 7.1 `.agents/skills/arxiv-paper-digest/src/html_blog_digest.py`：`render_paper_card` 的标题 `h3` → `h2`，`page_style` 内的 `.paper-card h3` 选择器同步改为 `h2`
- [x] 7.2 批量重写 49 个历史日报页面的 2309 个 paper-card 标题（`<div class="paper-card">` 下的 `h3` → `h2`）
- [x] 7.3 `assets/css/modules/article-components.css`：新增 `.paper-card h2` 规则，锁回实测视觉（1.4rem / 700 / `--h2-color` / 12px 下内边距 / 2px accent 下划线 / 0.5em 下外边距），抵消 TOC 流程加上的 `.ch-title`
- [x] 7.4 测量确认改动前后 `.paper-card` 标题计算样式完全一致（22.4px / 700 / 12px / 2px / 11.2px），且标签为 `H2`
- [x] 7.5 `assets/css/modules/chapter.css`：`.ch-label` 由 `--accent-blue` 改为 `color-mix(--accent-blue 70%, --text-color)`，修掉亮色 3.2–3.6:1
- [x] 7.6 `assets/css/modules/hero.css`：`.stats .label.g/.b` 回落 `--text-muted`（gold 在浅底只有 2.0:1；强调色已由同级 `.num` 表达）
- [x] 7.7 `assets/css/modules/article-struct.css`：`cite` 的 `var(--bg-hover)`（未定义）改为 `var(--bg-card-hover)`
- [x] 7.8 复扫当日与历史各一个日报页：`skipped-heading` 归零，剩余全部为 MathJax 隐藏层与 advisory 噪音
