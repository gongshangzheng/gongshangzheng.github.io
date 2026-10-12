## 1. 范围、检索方案与工具准备

- [x] 1.1 明确研究范围：年龄/生长、体重/体型变化、治疗/干预结局与横向方法证据。
- [x] 1.2 盘点库内背景材料，确认 `drafts/orthodontic-outcome-prediction.org` 可作为已有正畸与 3DGrowthNet 线索。
- [x] 1.3 确定研究问题维度、关键词块、数据库/API 路线、论文池字段、引用追踪与全文不可得处理规则，并写入 `design.md`。
- [x] 1.4 评估 `sci-papers-downloder` 与 `scientific-agent-skills`：不使用默认 Sci-Hub fallback；从后者选取并安装 MIT 许可 `paper-lookup`，并准备本项目 `facial-appearance-paper-map` Skill。
- [x] 1.5 核对 Elsevier/Scopus 访问依赖：API Key 不等于 Scopus 订阅 entitlement；将 Scopus 定为有机构权限时的可选来源，不以个人购买为研究前提。
- [x] 1.6 对项目 Skills 做轻量结构检查：frontmatter、`paper-lookup` 的 `--help`、API 列表与 OpenAlex dry-run 通过；尚未执行真实 API 查询。

## 2. 多来源论文发现

- [ ] 2.1 按 design.md 的查询块生成并记录 OpenAlex 检索式、日期、排序/年份限制和命中数。
- [ ] 2.2 检索 PubMed；按临床/生物医学覆盖需要补查 Europe PMC/PMC，并记录检索式、日期和命中数。
- [ ] 2.3 检索 arXiv 预印本，并对关键计算机视觉方向候选补查 IEEE/CVF、ACM、期刊和作者/机构页面。
- [ ] 2.4 若机构 Scopus API entitlement 可用，再用 Scopus 补查并记录权限/限流；不可用时记录未访问原因，不阻塞其他来源。
- [ ] 2.5 将每次 API/数据库查询、原始 query、检索日期、命中/取回数和覆盖限制写入 `raw/facial-appearance-outcome-prediction/search-log.md`。

## 3. 去重、筛选与引文背景

- [ ] 3.1 按 DOI、PMID、arXiv ID 等稳定标识符去重；人工核对规范化标题，并关联预印本、正式版及同队列后续报告。
- [ ] 3.2 按分支初筛候选，记录输入、变化条件、输出、预测单位、数据/人群、研究设计、验证、同行评审状态和筛选理由。
- [ ] 3.3 对代表论文查回溯参考文献和前向引用，补充基础方法、数据集、关键作者/团队、复现、后续改进和质疑。
- [ ] 3.4 将被引次数和被引论文列表分开记录来源与日期；不以引用数作为质量判断或论文纳入门槛。

## 4. 全文可得性与证据边界

- [ ] 4.1 按期刊 OA、Unpaywall、PMC/Europe PMC、arXiv/作者预印本、机构/作者存档、图书馆授权渠道和联系作者的顺序查找全文。
- [ ] 4.2 记录全文版本、URL 和访问状态；全文未取回时标记 `full_text_status=not_retrieved` 并限制结论只覆盖实际读到的书目/摘要材料。
- [ ] 4.3 区分横断面关联、同人纵向预测、配对干预、合成评估、外部验证和临床评价；不将合成逼真度等同个体预测有效性。

## 5. 论文地图交付与阶段交接

- [ ] 5.1 完成 `raw/facial-appearance-outcome-prediction/paper-pool.csv`，使题录、研究设计、预测单位、验证、引文来源及全文状态可追溯。
- [ ] 5.2 完成 `raw/facial-appearance-outcome-prediction/field-map.md`，总结任务定义、子方向、方法/证据结构、缺口和范围边界。
- [ ] 5.3 完成 `raw/facial-appearance-outcome-prediction/search-log.md`，核对检索数、去重和筛选记录，并披露 API、索引和全文覆盖限制。
- [ ] 5.4 汇报代表论文、各分支证据强弱和建议深读名单；停在论文地图阶段，等待用户决定是否进入全文深读、综合综述或发布规划。
