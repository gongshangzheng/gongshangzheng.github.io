<!-- 内容类 change 任务模板（templates/content-change/tasks.md）
     填写说明：
       · 第 2 组（写作）之前必须有"用户已确认 design.md 的「文章内容大纲」"这一前置任务
       · 一篇一组或一节一组，粒度按本次篇数决定
       · 完成一项立即改 `- [ ]` → `- [x]` -->

## 1. 计划与素材

- [ ] 1.1 素材就位：确认 `raw/<slug>/` 下原文与分析文件完整（缺则按 read-article Phase 1 补提取）
- [ ] 1.2 sub_id 与系列编号：`~/.venv/bin/python3 scripts/check-sub-id.py --category <分类关键词> --suggest`，确认无冲突
- [ ] 1.3 **审批门禁**：取得用户对 `design.md`「文章内容大纲」的确认（未确认不得进入第 2 组）

## 2. 逐篇写作

- [ ] 2.1 `<slug>`：按已批准大纲逐节落笔（frontmatter 含 `paper_*` 可选字段、`tags` ≤5、`hub` 系列必填）
- [ ] 2.2 `<slug>`：配图（≥3 张，来源优先级见 `blog-rules/references/image-priority.md`）
<!-- 多篇时复制 2.x -->

## 3. 三路 Review

- [ ] 3.1 并行派出 `review-fidelity` / `review-completeness` / `review-html-format`，汇总并修复 P0/P1

## 4. 发布与构建

- [ ] 4.1 `node build.js` 无错误；`npm test` 通过
- [ ] 4.2 发布到 `src/pages/<slug>.html`，引用使用 `#key#` 语法且 `.sources` 每条带 `data-cite-key`
- [ ] 4.3 质量底线自查：字数下限、公式 ≥2、超参数 ≥3、baseline 对比表、消融发现

## 5. Hub 与交叉回链

- [ ] 5.1 Hub 页 `chapter-list` 收录 + `chapter-nav` 双向更新（prev/next）
- [ ] 5.2 `~/.venv/bin/python3 scripts/cross-link.py` 补全 `.sources` 与正文首现回链

## 6. 草稿状态回填

- [ ] 6.1 已发布文章对应草稿：`draft.py set <slug> status=published progress=100 published_at=<ISO> published_file=src/pages/<slug>.html`
