# Phase 2: INVESTIGATION — 系统性文献搜索与来源验证

**目标**：通过系统性搜索收集高质量来源，并对每个来源进行严格验证和分级。

## 2.1 系统性文献搜索

详见 `agents/bibliography_agent.md`

### 总体原则

- **学术数据库优先**：期刊、会议、综述、实验研究的核心证据，优先来自 Scopus、Web of Science、PubMed、IEEE Xplore、CNKI 等数据库。
- **web 搜索补背景与上下文**：用于补充领域现状、官方文档、工具生态、政策文本、代码仓库、社区争议、技术演化与最新动态。
- **先定意图，再搜资料**：网络搜索必须参考 `web-search` skill，先判断 `factual / status / comparison / tutorial / exploratory / news / resource`，再生成 query bundle。
- **不要只搜一个词**：至少形成 3-5 个互补子查询，再合并去重。
- **先找入口，再抓正文**：搜索负责找到候选来源，内容抽取负责把高价值 URL 变成可读正文。

### 搜索策略设计

- **数据库选择**：至少 2 个（Scopus, Web of Science, PubMed, ERIC, IEEE Xplore, CNKI, Airiti 等，按领域选择）
- **关键词设计**：布尔逻辑组合，主关键词 + 同义词 + 相关词
- **网络搜索协议**：遵循 `web-search` skill 的流程
  1. 意图分类
  2. query bundle 扩展
  3. 多源检索
  4. 去重与初步排序
  5. 条件性线程深挖
  6. 内容抽取
  7. 来源验证
- **纳入/排除标准**：明确的时间范围、语言、文献类型、质量门槛
- **PRISMA 流程图**（如适用）：识别 → 筛选 → 合格 → 纳入

### 何时以数据库为主，何时需要 web 背景搜索

#### 以学术数据库为主的场景

- 文献综述、系统性综述、荟萃分析
- 需要 DOI、期刊分区、同行评审状态的任务
- 需要高证据等级研究设计的任务
- 理论模型、实验结果、医学与教育等规范性强的研究问题

#### 需要 web 背景搜索补充的场景

- 研究对象包含工具链、开源项目、标准文档、政策文本
- 需要了解“当前现状”“最新版本”“维护状态”“社区争议”
- 需要 GitHub 仓库、官方文档、issue / PR、技术博客、机构报告作为背景材料
- fact-check 模式需要验证某个说法、时间线或修复状态

### 网络搜索执行

当需要通过 web 搜索收集背景资料或补充来源时，执行以下协议：

1. **意图分类**
   - 定义类问题 → `factual`
   - 最新进展、现状、是否修复 → `status`
   - A 与 B 对比 → `comparison`
   - 教程与做法 → `tutorial`
   - 领域全景与开放探索 → `exploratory`
   - 新闻与公告 → `news`
   - 官网、文档、仓库入口 → `resource`

2. **query bundle 扩展**
   - 围绕主题生成 3-5 个搜索变体
   - 学术/技术场景优先加入：`survey`, `review`, `comparison`, `benchmark`, `official docs`, `GitHub`
   - 时效问题优先加入：`latest`, `update`, `release`, `announcement`, `YYYY`
   - 中文技术主题补英文版本

3. **多源检索**
   - 首选 `web_search`
   - 结果不足时，再补 `mcp_MiniMax_web_search`
   - 两者都不可用或召回明显不足时，回退 `~/.hanako/skills/web-search/scripts/ddgs_search.py`

4. **去重与排序**
   - 按 canonical URL 去重
   - 官方来源、原始来源、学术来源优先于转载与二手总结
   - `status / news` 任务提高时效性权重
   - `factual / resource` 任务提高权威性权重

5. **条件性线程深挖**
   - 当结果中出现 GitHub issue / PR、论坛讨论、争议性帖子、重要网页文章时，按 `web-search` skill 的线程深挖协议继续追踪
   - 重点抓：正文、关键评论、关联 issue / PR / commit、外部引用、官方回应
   - 一般控制在 2-3 层，避免无限扩展

6. **内容抽取**
   - 对高价值 URL，先用 `web_fetch` 抽取正文
   - `web_fetch` 不完整时，再考虑 `browser`
   - 若是 PDF、Office、扫描件或结构复杂网页，转给 `docling` 等文档解析能力

7. **结构化整理**
   - 将结果按统一字段整理，至少保留：ID、标题、URL、来源类型、摘要、发布时间、相关性、为何纳入、是否需要进一步抓取或深挖

**DDGS 回退命令**（使用统一虚拟环境）：
```bash
~/scripts/py_scripts/.venv/bin/python3 \
  ~/.hanako/skills/web-search/scripts/ddgs_search.py "搜索主题" \
  --max_results 15 --timelimit m --region zh-cn --output search_result.md
```

### 来源标注
每个来源必须包含：
- 唯一 ID（如 [S01]）
- 完整 APA 7.0 引用
- 类型（journal_article / book / conference / preprint / report / thesis / web）
- 证据等级（Level I-VII）
- 质量等级（tier_1 / tier_2 / tier_3 / tier_4）
- 相关性（core / supporting / peripheral）+ 相关性评分 1-10
- 2-3 句注解：关键发现 + 与 RQ 的关系

### Survey 来源逐篇深读协议

当来源类型是 survey / review / systematic review，且相关性为 core 或 supporting 时，必须把它当作“需要读取全文的二级证据”，而不是只记录摘要。

每篇核心 survey 必须单独执行 `read-article` collect / deep-read，并产出独立材料，至少包含：
- 该 survey 的研究范围、纳入文献边界和 taxonomy
- 该 survey 对任务输入、生成目标、中间表示、训练监督、loss、metrics、datasets 的整理
- 该 survey 明确支持的结论、未覆盖的空白、与其他 survey 的分歧
- 可迁移到最终综述的 5-10 条 claim 片段，每条带来源定位

禁止事项：
- 禁止只读 abstract、搜索片段或二手摘要后就纳入最终证据链
- 禁止用一篇总的 `*-survey-deep-reading.html` 简略说明替代多篇 survey 的逐篇深读
- 禁止最终综述只引用 survey 名称，却没有吸收其具体 taxonomy、表格、实验口径或结论

### web 来源的额外要求

对于 `web` 类型来源，额外标记：
- 来源属性：official / paper-page / repo / issue / forum / news / blog / report
- 获取方式：search only / fetched / browser-assisted / document-parse
- 用途：core / contextual / verification / timeline / implementation
- 限制：如“论坛观点，仅作辅助证据”“页面动态加载，抽取不全”等

## 2.2 来源验证

详见 `agents/source_verification_agent.md`

### 证据等级（Level I-VII）

| 等级 | 来源类型 |
|------|---------|
| I | 系统性综述 / 荟萃分析 |
| II | RCT |
| III | 队列研究 / 病例对照研究 |
| IV | 横断面研究 / 案例系列 |
| V | 机制推理 / 专家意见 |
| VI | 预印本 / 工作论文 |
| VII | 大众媒体 / 博客 / 未经验证来源 |

详见 `references/source_quality_hierarchy.md`

### 验证清单
- [ ] DOI 存在性验证（期刊文章必须有 DOI）
- [ ] 掠夺性期刊筛查
- [ ] 利益冲突标记
- [ ] 时效性评估
- [ ] Retraction Watch 检查（可选）
- [ ] web 来源是否为原始来源或权威入口
- [ ] 论坛/issue 内容是否有官方回应或交叉验证
- [ ] 最新状态类结论是否明确时间戳

### 最低来源数量要求

| 模式 | 最低数 |
|------|--------|
| full | 15+ |
| quick | 5-8 |
| lit-review | 25+ |
| systematic-review | 全量 |
| fact-check | 3+ / claim |

---

## Gate 条件

进入 Phase 3 前必须同时满足：

1. **来源数达标**：已验证来源数 ≥ 当前模式的最低要求
2. **质量门槛**：核心来源（core relevance）至少有 5 个 tier_1 或 tier_2
3. **搜索闭环成立**：高价值 web 来源已完成必要的正文抽取或线程追踪，不只是停留在标题层
4. **用户确认**：用户确认来源列表（可增删）
5. **todo 状态**：Phase 2 标记 `completed`，Phase 3 标记 `in_progress`

来源不足？扩大搜索策略、更换关键词或数据库后重新搜索。若只有网页摘要没有正文，先补做内容抽取。若存在争议性结论，补做线程深挖或交叉验证。