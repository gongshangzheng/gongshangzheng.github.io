## 1. 计划与素材

- [x] 1.1 确认 `raw/styletalkpp-2024/` 原文、meta、synthesis 与论文图素材完整；论文正文未见公开代码链接（未做外部确认）
- [x] 1.2 复核问题—动机—现有方法缺口陈述，逐项回读 Introduction / Related Work，并在 design 中更新准确表述
- [ ] 1.3 复核主结果、消融、triplet margin、用户研究数据，补充原文表格/行号来源（关键结果已回源，仍需补行号/表格定位与二次核查）
- [x] 1.4 解决 sub_id 700 分配冲突；StyleTalk++ 使用 700，检查 `数字人论文精读` 分类建议后续编号为 710
- [x] 1.5 **审批门禁**：用户明确确认大纲；sub_id 700 分配给 StyleTalk++

## 2. 逐篇写作

- [ ] 2.1 `styletalkpp-2024`：依批准大纲撰写 4,000 字以上精读，先讲问题/动机/缺口，再按机制解释方法、训练、推理与实验（初稿已写；字数需复核并补充至门槛）
- [ ] 2.2 `styletalkpp-2024`：整理论文原图与至少一张代码绘图；补齐引用与库内交叉链接（图已整理、Mermaid 已加；库内交叉链接与引用回链待做）
- [ ] 2.3 更新 frontmatter、alias、sub_id、Hub、tags 与论文信息字段（基本字段与编号已设；Hub/相邻导航需发布阶段处理）

## 3. 统一 Review

- [ ] 3.1 保真度审校：回原文核对问题定义、作者主张、公式、实验数值、数据集和引用
- [ ] 3.2 完整性审校：对照 design 逐节检查；区分论文事实与个人动态身份课题分析
- [ ] 3.3 HTML/站点规范审校并修复 P0/P1

## 4. 发布与构建

- [x] 4.1 `node build.js` 成功；`npm test` 220 项通过（构建仍报告既有 66 个 arxiv-digest lint 告警）
- [x] 4.2 完成本地 `src/pages/styletalkpp-2024.html` 初稿，引用使用 `#key#` 且 `.sources` 含 `data-cite-key`；尚未 git 发布
- [ ] 4.3 检查质量底线：字数、图片、公式、超参数、baseline 表与消融发现（图片、公式、超参数、表格已有，字数/事实复核待完成）

## 5. Hub 与交叉回链

- [ ] 5.1 更新 `digital-human-hub` 与相邻文章的 `chapter-nav`，确认 sub_id 无冲突
- [ ] 5.2 运行交叉链接脚本并检查相关引用回链

## 6. 草稿状态回填

- [ ] 6.1 发布后将 `drafts/styletalkpp-2024.md` 标记为 published；按需更新 `drafts/personal-dynamics-digital-human.org` 的阅读状态
