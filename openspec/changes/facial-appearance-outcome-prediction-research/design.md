## Context

库内已有 `drafts/orthodontic-outcome-prediction.org`，其中整理了儿童 3D 面部生长、3DGrowthNet、正畸结局、扫描配准及个体化预测的初步问题。当前 change 的目标是形成论文地图，尚无本主题的已筛选论文池或检索日志。

本轮已完成工具侦察：

- 查看 [`alwayswdc/sci-papers-downloder`](https://github.com/alwayswdc/sci-papers-downloder) 的 README、`scripts/search_scopus.py` 和 `scripts/download_open_access.py`。该工具以 Elsevier/Scopus Search API 搜索并返回题录与被引次数；下载端先查 Unpaywall，但脚本默认 `--scihub-fallback auto`，故不安装、不运行其下载链路。只吸收结构化检索记录、批量/最新筛选和逐 DOI 状态日志的思路。
- 查看 [`k-dense-ai/scientific-agent-skills`](https://github.com/k-dense-ai/scientific-agent-skills)。其 README 声明集合含 177 项 Skill；本仓库只安装其中 MIT 许可的 [`paper-lookup`（Skill 版本 2.4）](https://github.com/k-dense-ai/scientific-agent-skills/tree/main/skills/paper-lookup)，不安装全量集合。该 Skill 覆盖 OpenAlex、PubMed、Crossref、Semantic Scholar、OpenCitations、Unpaywall 等 API 与分页、元数据和开放全文参考。
- Elsevier API 权限判断参考[官方认证说明](https://dev.elsevier.com/tecdoc_api_authentication.html)：API Key 关联客户/机构账户，内容按该账户 entitlement 返回。没有核实 API Key 的单独收费政策或本人的账户权限，因此本计划不假设 Scopus 可用，也不要求购买。
- 已在仓库 `.Codex/skills/` 内准备 `paper-lookup` 与 `facial-appearance-paper-map` 两个项目级 Skills。`paper-lookup` 的 `--help`、API 列表、OpenAlex dry-run 及两个 Skill 的 YAML frontmatter 通过轻量检查；尚未发起真实 API 搜索，也未验证任何 Elsevier/Scopus 账户权限。

## Goals / Non-Goals

**Goals:**

- 将“从当前人脸预测未来外观”拆成可分别检索、筛选和评价的研究任务。
- 建立可复核的跨学科论文池、引用背景链和全文可得性记录。
- 判断现有证据支持的是群体层面的条件生成，还是经过纵向/干预验证的个体结局预测。
- 将本阶段停在论文地图与后续阅读建议，不把检索结果直接扩写为完整综述。

**Non-Goals:**

- 不训练、部署或临床验证面部预测模型，不收集或处理真实个人面部数据。
- 不把横断面人群模型或合成图像的逼真度表述为个体预测准确性。
- 不下载非开放或未经授权的全文；不使用 Sci-Hub 或类似 fallback。
- 不写博客 HTML、不修改 `drafts/orthodontic-outcome-prediction.org`，也不在此阶段进行逐篇全文深读。

## 核心问题与分支定义

核心问题：给定一个人的当前面部信息及目标年龄、体重/体型变化或治疗干预，现有方法能预测哪一种未来面部结果？预测是否针对同一个人，并以真实纵向或配对干预数据验证？

每篇候选论文都记录五个任务维度：输入（2D 照片、3D 面扫/网格、CT/CBCT、口扫、人口学/家庭信息）；条件（目标年龄/生长区间、体重/BMI/体脂变化、具体治疗）；输出（标志点、骨骼/软组织形状、侧貌/3D 网格、完整照片级外观）；预测单位（群体平均变形、条件合成、同人未来状态）；验证设计（横断面、纵向重复扫描、治疗前后配对、合成样本评估、临床或外部验证）。

研究分支：

1. **年龄与生长**：儿童/青少年颅颌面生长、成人衰老、二维照片与三维扫描；重点区分横断面年龄先验和同一人的纵向轨迹。
2. **体重与体型变化**：BMI/体脂与面部软组织关联、减重前后变化及生成模拟；区分统计关联与真实个体干预结局。
3. **治疗与干预**：正畸、正颌/颌面手术、整形/重建及皮肤治疗；区分骨骼/侧貌、软组织和完整照片级结果。
4. **横向方法与证据**：2D/3D 输入、网格配准、形变/条件生成、数据设计、指标、临床评价、外部验证、公平性和不确定性。

## Decisions

### 分阶段推进

| 阶段 | 目标与工作 | 退出条件 |
|------|-----------|----------|
| 0. 问题界定 | 明确三个主分支及输入、目标变化、输出、预测单位；盘点已有正畸草稿。 | 研究范围不混淆“生成合理样本”和“预测某个人”。（已完成） |
| 1. 论文发现 | 用互补学术来源检索；保存检索式、日期、API/数据库、命中数及限制。 | 每个分支都有初步候选记录，查询可以复跑。 |
| 2. 去重与初筛 | 依据 DOI、PMID、arXiv 等标识符去重，关联预印本/正式版/同一队列后续报告；按题名摘要和可用正文做相关性初筛。 | 论文池具有稳定 ID、分支、初筛原因和版本关系。 |
| 3. 引文与背景追踪 | 对代表论文回溯参考文献，并查找后续引用论文；补关键作者/团队、数据集、先行方法、复现或质疑。 | 代表论文有可追溯的背景链；被引次数与引用论文清单分开。 |
| 4. 全文可得性与证据分层 | 查 OA 版本、机构存档或授权渠道；标记全文状态和研究设计，限制摘要级记录可支持的结论。 | 每篇候选都标注全文/摘要/未取回状态及证据类型。 |
| 5. 领域地图与交接 | 汇总任务定义、方法/数据/验证差异、缺口和代表论文；给出下一阶段深读建议。 | `field-map.md`、`paper-pool.csv`、`search-log.md` 可互相追溯；汇报覆盖边界。 |
| 6. 关键论文深读（后续阶段） | 对优先论文逐篇查阅全文，提取方法、数据、指标、结果与限制，并让 Related Works/引用线索回流论文池。 | 需另行决定是否启动；不属于本 change 的论文地图执行范围。 |
| 7. 综合与写作发布（后续阶段） | 跨论文综合可行性和证据缺口；如决定发表，再更新/新建 OpenSpec 规划并审批内容大纲。 | 用户另行决定；不由本阶段自动进入 HTML 写作或发布。 |

### 数据库与 API 选择

1. **OpenAlex 为跨学科主入口**：用于宽领域元数据发现、Works 查询、参考文献及引用关系扩展；使用 `paper-lookup` 中的 `references/openalex.md`、`scripts/paginate.py` 等说明。基础查询不以 API Key 为前提；可用账户密钥仅作为额度/速率补充。
2. **医学来源**：PubMed E-utilities 覆盖临床和生物医学题录；必要时用 Europe PMC/PMC 查补充题录、预印本关联和合法开放全文。参考 `references/pubmed.md`、`references/europepmc.md`、`references/pmc.md`。
3. **计算机视觉来源**：用 arXiv API/Atom 检索预印本，再对重要候选人工补查 IEEE/CVF、ACM、期刊和作者/机构页面。检索平台网页可作为补充，不把网页搜索排名当作覆盖完整性。
4. **元数据与引用交叉核验**：Crossref 核对 DOI/正式出版信息；Semantic Scholar、OpenCitations 和 OpenAlex 可补查引用关系。不同平台收录和计数口径不同，记录来源与检索日期，不合并成一个“真实总被引数”。
5. **Scopus 为可选渠道**：上述 Sci-Papers Downloader 的搜索脚本需要 Elsevier API Key；Elsevier 官方认证文档说明返回数据受关联机构账户 entitlement 控制。API Key 不等同 Scopus 订阅，也不把个人购买作为本研究前提。若机构已有权限再补查，否则继续使用 OpenAlex、PubMed 等来源。当前未验证任何账户权限或收费条件。

### 检索词与查询组合

按数据库语法组合任务词、面部表征词和验证词，不仅使用单一标题词。每条实际 query、时间范围、排序、页数/命中数及检索日期写入 `search-log.md`。

- **年龄/生长**：`facial aging`、`age progression`、`facial growth`、`longitudinal facial growth`、`3D facial growth`、`craniofacial growth`、`synthetic aging`。
- **体重/体型**：`weight change`、`weight loss`、`facial adiposity`、`facial soft tissue`、`BMI`、`body composition`、`before and after weight loss`。
- **治疗/干预**：`facial outcome prediction`、`orthodontic profile prediction`、`orthognathic surgery prediction`、`orthognathic soft tissue`、`maxillofacial surgery`、`plastic surgery outcome`、`facial reconstruction`。
- **横向方法与验证**：`3D face`、`facial mesh`、`longitudinal`、`paired preoperative postoperative`、`conditional generation`、`external validation`、`clinical evaluation`、`uncertainty`。

示例组合（运行时按 API 查询语法适配）：

- `("facial growth" OR "facial aging" OR "age progression") AND (longitudinal OR prediction OR generation)`
- `("weight loss" OR "weight change" OR BMI) AND (face OR facial) AND (longitudinal OR outcome OR prediction)`
- `(orthodontic OR orthognathic OR maxillofacial OR plastic surgery) AND (facial OR soft tissue OR profile) AND (prediction OR outcome)`

### 去重、引用图与筛选原则

- 先以 DOI 去重，再用 arXiv ID、PMID 或其他稳定 ID；无 ID 时规范化标题并人工核对。不同版本或同一队列的后续分析要建立关联，不能误删成一条。
- 每条记录至少保存：标题、作者、年份、venue、DOI/其他 ID、摘要、规范链接、来源数据库、query/日期、分支、输入/目标/输出、队列和数据类型、研究设计、预测单位、验证方式、同行评审/预印本状态、全文状态、筛选理由。
- `cited_by_count` 是特定数据库在特定日期的计数；不等于“引用它的论文名单”，也不作为质量、有效性或入选门槛。对核心候选单独取参考文献 (`referenced_works`) 和后续被引 works；记录 API、日期和分页/覆盖限制。
- 通过回溯参考文献找奠基工作、模型与数据集；通过前向引用找复现、改进、外部/临床验证、反例和批评。不同引文索引缺失时，将覆盖不全写入日志。
- 初筛标注证据层级：横断面关联、纵向预测、配对干预、条件生成/合成评估、外部验证/临床评价；不要将合成示例当作临床预测证据。

### 全文获取与不可访问处理

按顺序查询期刊 OA 版本、Unpaywall 提供的 OA location、PMC/Europe PMC、arXiv/作者预印本、机构或作者存档、图书馆/馆际互借、联系作者。保存实际可读版本的 URL 和版本信息。Unpaywall 只作为 OA 位置解析器，不保证每篇论文均能下载。

无法取得全文时在论文池标注 `full_text_status=not_retrieved`，记下尝试过的渠道，并将结论限制在已读到的书目/摘要信息；不从搜索摘要推断方法、结果和局限。禁止 Sci-Hub fallback。Sci-Papers Downloader 的批量、最新优先、逐 DOI 状态和 JSON 可审计输出思路可借鉴，但不复制其默认 Sci-Hub `auto` 行为。

## 文章内容大纲（等价材料结构；本 change 不写文章）

本 change 的交付是内部论文地图材料，而非可发布文章，因此没有文章 slug、alias、sub_id、Hub、博客配图或 HTML 小节大纲。为保留同等审查信息，材料按以下结构组织：

### `raw/facial-appearance-outcome-prediction/field-map.md`｜任务与领域地图

#### 1. 研究问题和边界
- **写什么**：定义当前输入、目标变化、输出和预测单位；明确群体生成与个体预测的区别。
- **素材来源**：`drafts/orthodontic-outcome-prediction.org`；本 change 的「核心问题与分支定义」。
- **必备元素**：四分支任务 taxonomy；不作临床有效性外推的范围边界。

#### 2. 分支地图和检索词
- **写什么**：年龄/生长、体重变化、治疗干预及横向方法证据各自覆盖什么，不覆盖什么。
- **素材来源**：本 change 的「检索词与查询组合」及 `search-log.md`。
- **必备元素**：研究分支—同义词—数据库的映射表；待补术语和覆盖盲点。

#### 3. 证据结构和研究缺口
- **写什么**：比较横断面、纵向、配对干预、合成评估和外部临床验证能回答的问题。
- **素材来源**：`paper-pool.csv` 的 study design、prediction unit、validation、limitations 字段。
- **必备元素**：证据类型对照表；不把不同误差口径直接合并。

### `raw/facial-appearance-outcome-prediction/paper-pool.csv`｜结构化论文账本

#### 1. 题录与版本关系
- **写什么**：题录、稳定标识符、预印本/正式版/同队列报告的链接。
- **素材来源**：OpenAlex、PubMed/Europe PMC、arXiv、Crossref、期刊/机构来源；出处另记在行字段。
- **必备元素**：DOI、PMID、arXiv ID、canonical URL、database、peer-review status。

#### 2. 任务与证据字段
- **写什么**：输入、条件、输出、预测单位、研究设计、数据人群及验证。
- **素材来源**：题录/摘要初筛；若已读全文，标注全文版本及定位，不把摘要层信息伪装为全文事实。
- **必备元素**：branch、study_design、prediction_unit、validation、screening_note。

#### 3. 引文与全文状态
- **写什么**：数据库被引计数和日期、参考文献/后续引用链接、全文访问渠道与结果。
- **素材来源**：OpenAlex、Semantic Scholar、OpenCitations、Crossref、Unpaywall、PMC/Europe PMC 等查询日志。
- **必备元素**：citation source/date、references/citers URL、`full_text_status`、access URL/version。

### `raw/facial-appearance-outcome-prediction/search-log.md`｜可复核检索账

#### 1. 检索运行记录
- **写什么**：每个数据库的 API/endpoint、原始 query、日期、年份过滤、排序、分页、命中数和检索状态。
- **素材来源**：实际 OpenAlex/PubMed/arXiv/可选来源响应；`paper-lookup` 对应 API references。
- **必备元素**：数据库覆盖矩阵、查询和结果数；不要求图像。

#### 2. 筛选与去重决策
- **写什么**：去重键、版本/队列关联、纳入或排除理由、全文未取回条目。
- **素材来源**：论文池行级记录和初筛笔记。
- **必备元素**：记录数变更可对账；全文未取回原因可审计。

#### 3. 覆盖限制
- **写什么**：API 权限、限流、索引范围、语种、全文访问和人工补查限制。
- **素材来源**：查询响应、数据库文档和本次运行记录；Scopus 仅在有机构 entitlement 时说明。
- **必备元素**：明确“未查到”不等于“没有研究”；列出尚未覆盖的来源/查询。

**关键数据点**：论文数、分支分布、同行评审/预印本比例、纵向/配对数据数量、全文可得性及引文计数必须以实际检索结果为准；当前没有已执行检索数字，不预填或估计。

**配图计划**：本阶段不制作博客配图。需要表达检索流程时，优先用可核对的文本表格或流程图；任何计数图均须在筛选账核对后生成。

## Risks / Trade-offs

- **多数据库元数据不一致** → 保留各来源原始 ID/URL、查询日期和计数来源，以 DOI 等稳定标识符对齐，不覆盖来源差异。
- **Scopus 权限或 Elsevier API 额度不可用** → OpenAlex、PubMed、Europe PMC、arXiv 等作为可执行主路径；不将个人购买订阅作为默认决策。
- **引文索引覆盖有差异** → 为每个计数/引文链接保留来源和日期；将引用追踪定位为发现背景的工具，而非穷尽证明。
- **全文不可得或仅有摘要** → 显式标记未取回，限制主张，不将摘要当全文证据；使用 OA 仓储或授权渠道继续查找。
- **混淆生成质量与个人预测准确性** → 论文池显式记录预测单位和验证设计，优先关注同人纵向/配对干预证据及外部验证。
- **仓库下载 Skill 的 fallback 风险** → 仅借鉴元数据与审计输出设计；不启用 Sci-Hub fallback，已选上游 `paper-lookup` 作为 OA/引文工具。

## Open Questions

无。数据库范围、Scopus 可选性、引用字段、全文失败处理和本阶段停点已确定；实际 API 可达性及机构 Scopus 权限属于执行时记录的环境状态，不改变当前方案。
