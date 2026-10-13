<!-- 内容类 change 任务模板（templates/content-change/tasks.md）
     填写说明：
       · 第 2 组（写作）之前必须有"用户已确认 design.md 的「文章内容大纲」"这一前置任务
       · 一篇一组或一节一组，粒度按本次篇数决定
       · 根据文章类型替换论文专用素材与质量项；教程按读者目标、步骤、标题层级、机制、媒体和结果复核验收，不强套公式或消融实验要求
       · design 修订后同步任务清单；已完成旧版任务保留历史状态，新增本轮修改与复核任务
       · 完成一项立即改 `- [ ]` → `- [x]` -->

## 1. 计划与素材

- [ ] 1.1 素材就位：论文解读确认 `raw/<slug>/` 下原文与分析文件完整（缺则按 read-article Phase 1 补提取）；教程核对官方文档、版本、适用条件与计划使用的媒体来源
- [ ] 1.2 文章位置：确认单篇或系列、slug、分类与适用的 Hub；需要 sub_id 时运行 `~/.venv/bin/python3 scripts/check-sub-id.py --category <分类关键词> --suggest`，确认无冲突
- [ ] 1.3 **审批门禁**：取得用户对 `design.md`「文章内容大纲」的确认（未确认不得进入第 2 组）

## 2. 逐篇写作

- [ ] 2.1 `<slug>`：按已批准大纲逐节落笔（frontmatter 含 `paper_*` 可选字段、`tags` ≤5、`hub` 系列必填）
- [ ] 2.2 `<slug>`：按 design 的配图计划完成素材与图注，图量按文章类型和阅读需要确定，来源优先级见 `blog-rules/references/image-priority.md`
<!-- 多篇时复制 2.x -->

## 3. 统一 Review

- [ ] 3.1 按三维度审校并修复 P0/P1：保真度（核查来源、机制与数据口径）、完整性（对照最新 design 检查章节、标题层级、配图和文章目标）、HTML 与站点规范（frontmatter/组件/适用时的 MathJax 与 chapter-nav/`node build.js`）；仅在某一维度工作量大时按需委派对应 Review lane

## 4. 发布与构建

- [ ] 4.1 `node build.js` 无错误；`npm test` 通过
- [ ] 4.2 发布到 `src/pages/<slug>.html`，引用使用 `#key#` 语法且 `.sources` 每条带 `data-cite-key`
- [ ] 4.3 按文章类型核查质量底线：论文解读检查字数下限、公式 ≥2、超参数 ≥3、baseline 对比表与消融发现；教程检查步骤可执行、适用条件清楚、视频与图片呈现正确、结果可复核，以及适用的安全与回退方法

## 5. Hub 与交叉回链

- [ ] 5.1 有所属 Hub 时完成 `chapter-list` 收录与适用的 `chapter-nav` 双向更新（prev/next）；独立文章注明无所属 Hub
- [ ] 5.2 `~/.venv/bin/python3 scripts/cross-link.py` 补全 `.sources` 与正文首现回链

## 6. 草稿状态回填

- [ ] 6.1 已发布文章对应草稿：`draft.py set <slug> status=published progress=100 published_at=<ISO> published_file=src/pages/<slug>.html`
