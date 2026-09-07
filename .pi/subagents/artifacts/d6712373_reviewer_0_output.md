## Review — `src/pages/digital-human-survey.html`（风格与站点规范审查，只读）

### Blocker

1. **系列编号 / sub_id 冲突（必须先解决）**
   - `src/pages/digital-human-survey-map.html:2` 自称"数字人系列（十八）"、`:9` `sub_id: 180`、`:14` hero_tagline "系列（十八）"、`:25` ch-label "系列（十八）"。
   - 但 `src/pages/digital-human-identity-consistency.html:2,8` 已是"数字人系列（十八）"、`sub_id: 180`（created_at 2026-09-03，早于本文 2026-09-07），且枢纽页 `src/pages/digital-human-hub.html` 章节卡片的 S18 已分配给《身份一致性》。
   - 后果：sub_id 驱动 index 排序，重复 180 会导致两篇排序不定；系列编号链断裂；本文的"上一篇→手部生成（十七）"（`:33`、`:275`）也随之错位。
   - 建议：按 created_at 顺序将本文改为**系列（十九）/ sub_id: 190**，同步改 title、hero_tagline、ch-label，并把两处 nav-prev 指向 `digital-human-identity-consistency.html`；同时在 hub 页 chapter-list 增加 S19 条目（SKILL §3.5 的 Hub 更新要求）。

### 需修复（Should-fix）

2. **FPSP 配图错放进"精读二"章节** — `:118`（fpsp-visual-timeline.webp）和 `:149`（fpsp-audio-timeline.webp）都是 FPSP v8 的图（cap 明确标注"FPSP v8 配图"），却放在精读二《Human Motion Video Generation》章内，且 `:118` 插在"三段式管线框架"引言与 `<ol>` 之间，打断了它毫不相关的列表。违反 html-components.md "图片应当放在所讲解段落的后面（紧跟相关文字）"。建议移回精读一（如五族表、audio-driven 实测表附近），或改写 cap 说明其与 Motion Survey 的关联。
3. **交叉引用与线索清单不符** — `:151`"这正是 2025-12 之后一批动作空间模型（见线索清单）试图解决的问题"，但线索清单（READ、GaussianSpeech、OmniHuman-1、EditYourself、Dimitra、Hallo3、PGSTalker/UniGAHA/VASA-3D、GaussianEmoTalker、TalkVid/SpeakerVid-5M）没有任何"动作空间"路线的条目。建议点出具体模型名或改写指代。

### Note（低优先）

- `:21` `.label l`：hero.css 只定义 `.label/.g/.b`（`assets/css/modules/hero.css:412-414`），`l` 类无样式；但这是全站模板惯例（article-template.html 同款、百余页使用），渲染为默认 label，本文不必改，仅备案为站点级观察。
- `:20` stats "3 类组织"与结语"三种粒度"表述不一致，建议统一为"3 种粒度"。
- `:156` ch-title 缩写 "TH Synthesis" 与全文 "THG"/"talking head" 不一致（`:289` sources 用全称），建议统一为 THG。
- 四篇对比表为 5 列长文本，html-components.md 建议长文本总览表用 `table-wrap wide`；现内容尚可，非必须。
- 离线不可核验的事实：实测表数值、4 位源图人物、"15 位作者"、v8 更新日 2026-07-07、期刊名——建议作者对照原文抽查。

### 已验证通过的部分

- **Frontmatter 完整**：title/description/date/created_at/updated_at（精确到秒）/tags×5/`aliases: ["categories/AI/数字人"]`/sub_id/papers×4（恰为四篇综述）/hero_title/hero_sub/hero_tagline 全齐；`categories` 顶层字段缺失与系列十七一致（分类走 aliases），`toc: true` 为全站常见惯例字段（构建器不消费，无副作用）；无公式故无需 mathjax。
- **闸门 1–3（引用）**：正文 17 处 `#key#`（Gowda2026FPSP×7、Xue2025MotionSurvey×4、Meng2024Taxonomy×3、Rakesh2025Advancing×3）与 `.sources` 4 个 `data-cite-key` 双向一一对应，无孤儿 key；每条 li 均含 `target="_blank"` 链接。
- **闸门 4–5**：无任何数学公式（无 `<p>$$...$$</p>` 风险）；正文小节全部 `h3.section-title`，裸 h3 仅出现在 info-box 内部（规范豁免），无 h4。
- **闸门 7（图片）**：3 张图均为 `.photo`+`.cap`+webp+`media/images/digital-human-survey-map/`（文件已存在）+`loading="lazy"`。
- **组件与系列一致性**：stats/ch fade-in/ch-label/section-title/info-box/callout/table-wrap/chapter-nav/sources 用法与系列十七完全同构（含 References 章、开篇 chapter-nav、prev+hub 无 next、第二人称口吻）；线索清单 12 条与 stats "12" 一致，info-box 6 行合并恰好 11 条方向与 stats "11" 一致；div 配平人工逐章核对无误。
- **站内链接**：文中 13 个本地 `.html` 链接目标全部存在；系列编号口述（系列一/二/三/四/五/七/八/九/十二/十四/十五/十七）与 hub 页 S01–S17 完全吻合。

**结论：需修复**（Blocker #1 编号冲突必须解决；#2、#3 建议同批修掉，其余可发）。修复后请由 supervisor 运行：`node lib/lint-html.js src/pages/digital-human-survey-map.html` 与 `node build.js`（本次审查为只读，未执行任何命令、未改动文件）。