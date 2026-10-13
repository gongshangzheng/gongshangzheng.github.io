> **规划已合并（2026-10-13）**：原 `restructure-flow-matching-article` 已并入 `video-generation`，本目录仅保留历史规划。实施与验收以 `../../proposal.md`、`../../design.md`、`../../tasks.md` 为准；本文旧的保持标题、无 sub_id、无 Hub 等边界已由系列整合方案替代。原文重写仍未完成，旧任务复选框不代表合并后的进度。

## 1. 计划与素材

- [ ] 1.1 核对 `src/pages/flow-matching.html` 中保留的公式和概念；获取并归档 Lipman et al. 2023 §§2–3 原文及必要的扩展来源至 `raw/flow-matching/sources/`，记录实际引用位置
- [ ] 1.2 确认既有分类 alias 与排序无冲突；`check-sub-id.py --suggest` 已给出下一个可用值 `10`，本次保留页面未设置 `sub_id` 的现状
- [ ] 1.3 **审批门禁**：取得用户对 `design.md`「文章内容大纲」的确认（未确认不得进入第 2 组）

## 2. 逐篇写作

- [ ] 2.1 `flow-matching`：按已批准大纲重写 `src/pages/flow-matching.html`，合并重复内容并移除偏题与空标题
- [ ] 2.2 `flow-matching`：制作或复用概率路径与向量场/采样示意图，修复相关内容链接

## 3. 统一 Review

- [ ] 3.1 技术准确性审校：逐项回查路径定义、速度场、条件流匹配目标及与扩散模型的关系，对照素材原文修正符号、时间方向和限定条件
- [ ] 3.2 内容完整性审校：检查章节主线是否连贯、是否仍有重复/空标题/无效链接、是否清楚区分 Flow Matching 与相关方法
- [ ] 3.3 HTML 与站点规范审校：检查 frontmatter、MathJax、图片引用、内部链接与页面结构；修复发现的问题

## 4. 发布与构建

- [ ] 4.1 运行 `node build.js` 并检查更新后的页面及数学公式构建结果
- [ ] 4.2 更新既有 `src/pages/flow-matching.html`；保留原 slug、标题、alias 与无 `sub_id` 状态
- [ ] 4.3 质量自查：正文每个核心公式均有变量定义和解释；不保留未核实的 benchmark 数值或方法等价断言

## 5. Hub 与交叉回链

- [ ] 5.1 确认本次没有关联 Hub，因此无需更新 Hub 列表或 `chapter-nav`
- [ ] 5.2 核对正文延伸阅读和现有相关页面链接；仅在适用的引用结构存在时更新交叉回链

## 6. 草稿状态回填

- [ ] 6.1 确认本次没有对应草稿；如实施时发现有关联草稿，再按 `blog-drafts` 流程同步状态
