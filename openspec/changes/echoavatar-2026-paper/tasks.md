<!-- 依 templates/content-change/tasks.md 填写 -->

## 1. 计划与素材

- [ ] 1.1 补跑 read-article Phase 2，把四份分析落到 `raw/echoavatar-2026/subagents/`（当前只有 `sources/` 全文 + 图）
- [ ] 1.2 复核 sub_id 700 与标题编号"六十八"的对应（`~/.venv/bin/python3 scripts/check-sub-id.py --category 数字人 --suggest`）
- [ ] 1.3 **审批门禁**：取得用户对本文「文章内容大纲」的确认（未确认不得进入第 2 组）

## 2. 写作

- [ ] 2.1 按已批准大纲逐节落笔 `src/pages/echoavatar-2026.html`（frontmatter：`paper_*` 字段、`tags` ≤5、`hub: digital-human-hub`）
- [ ] 2.2 配图 4 张（`teaser3` / `demo_pipeline_2` / `fig2_3` / `reward_model_evaluation`）→ `media/images/echoavatar-2026/`
- [ ] 2.3 关键数据点逐条核到原文行号：延迟 177.4 / 215.8 ms、chunk 266 ms（8 帧）、消融 FID 4.18 / 9.21 / 12.21 / 8.78、四阶段延迟分解

## 3. 三路 Review

- [ ] 3.1 并行派出 `review-fidelity` / `review-completeness` / `review-html-format`，汇总并修复 P0/P1

## 4. 发布与构建

- [ ] 4.1 `node build.js` 无错误；`npm test` 通过
- [ ] 4.2 质量底线自查：字数 ≥3000（复杂系统 ≥4000）、公式 ≥2、超参数 ≥3、baseline 对比表 ≥1、消融发现 ≥1
- [ ] 4.3 `.sources` 每条带 `data-cite-key`，正文重要事实句带 `#key#`

## 5. Hub 与交叉回链

- [ ] 5.1 `digital-human-hub.html` 精读分区收录 + `chapter-nav` 双向更新
- [ ] 5.2 系列三 `digital-human-motion-space-avatar.html` 的 EchoAvatar 条目补精读链接；系列十二 `realtime-digital-human-survey.html` 实时性表增补数据（标注 H200 / RTX 4090 口径）
- [ ] 5.3 `~/.venv/bin/python3 scripts/cross-link.py` 回链

## 6. 草稿状态回填

- [ ] 6.1 `draft.py set echoavatar-2026 status=published progress=100 published_at=<ISO> published_file=src/pages/echoavatar-2026.html`
