Phase 0-1
## Phase 0 · Web 浅扫

在对领域一无所知时，先通过 Web 搜索建立"领域地图"。

### 分配 Web 浅扫 subagent

使用 `subagents/web-scan.md` 模板。

### 领域地图输出

```
领域地图：
- 热点子方向：A, B, C
- Landmark papers：paper1 (year), paper2 (year)
- Key authors：author1, author2
- 近期趋势：trend description
```

---

## Phase 1 · arXiv 分层检索

基于 Phase 0 的领域地图，设计检索策略。**严禁使用 Bing/Google 搜索 arXiv 论文**，统一使用 `arxiv-paper-digest` 内置检索能力。

> **查询构建参考**：`~/.agents/skills/arxiv-paper-digest/SKILL.md`

### 检索脚本

```bash
cd ~/.agents/skills/arxiv-paper-digest
.venv/bin/python << 'PYEOF'
from src.arxiv_search import Query, Taxonomy, search_arxiv

SURVEY_KEYWORDS = ['survey','review','tutorial','comprehensive','overview',
                   'foundation','landscape','unified','roadmap',
                   'handbook','guide','meta-survey','systematic']

kw = "reinforcement learning large language model"

q_survey = Query.title(SURVEY_KEYWORDS) & Query.abstract(kw) & Query.category(Taxonomy.cs)
surveys = search_arxiv(q_survey, max_results=10, sort_by="relevance")

q_recent = Query.abstract(kw) & ~Query.title(SURVEY_KEYWORDS) & Query.category(Taxonomy.cs)
recent = search_arxiv(q_recent, max_results=30, sort_by="submitted")

print(f"=== Surveys ({len(surveys)}) ===")
for p in surveys:
    print(f"  {p.arxiv_id.split('/')[-1]} | {p.title}")
print(f"\n=== Recent ({len(recent)}) ===")
for p in recent[:10]:
    print(f"  {p.arxiv_id.split('/')[-1]} | {p.title}")
PYEOF
```

### 三层检索策略

| 层级 | 策略 | 数量 | 深度 |
|------|------|------|------|
| **Survey** | `arxiv-paper-digest` + `web-search` / `web-research` 检索 survey/review/tutorial/systematic review | 5~10 篇，精选 3~5 篇核心 survey | 必须获取全文并完整深读；不得只读 abstract |
| **Landmark** | Phase 0 landmark 列表 + 高引 | 5~10 篇 | read-article 全流程 |
| **Recent** | 最近 3~6 月，按时间倒序 | 15~30 → 筛选 5~10 篇 | read-article 全流程 |

### 目标论文筛选

> 章节利用策略见 `~/.agents/skills/read-article/references/paper-section-guide.md` §1（总览表）和 §2.1（Abstract）。

筛选不只是看 abstract。对每篇候选论文，至少扫读以下章节辅助判断：

| 章节 | 筛选时读什么 | 用来判断什么 |
|------|------------|------------|
| **Abstract** | 精读 | 核心问题、方法类型、关键贡献、定量结果 |
| **Introduction** | 前 2-3 段 | 问题动机、为什么重要、论文定位的技术路线 |
| **Related Works** | 扫小节标题 | 是否覆盖我们关注的子方向？有没有我们不知道的分支？ |
| **Conclusion** | 最后 1-2 段 | 作者自我评估的局限性是否诚实？Future Work 是否与我们的方向相关？ |
| **References** | 最新几条 | 文献覆盖是否够新？（最新引用不到 2 年前 → 可能过时） |

筛选步骤：

1. Survey 选 3~5 篇最权威的，并标记为 `core-survey`；这些 survey 必须完整读取全文，不能只读 abstract、intro 或搜索结果摘要
2. Landmark 选 3~5 篇
3. Recent 选 5~10 篇高相关的
4. 为每篇论文生成 slug 并记录元信息
5. 明确哪些论文进入 Phase 2 的 `read-article collect` 深读队列
6. 为每篇 `core-survey` 记录全文获取路径（PDF / arXiv HTML / ACM / OpenReview / 官方页面）；无法获取全文的，标记为 `not-fully-readable`，不得作为主结构依据

### 本阶段交接物

本阶段结束时，主 agent 必须整理出以下内容，供后续直接消费：

- 领域地图
- Survey / Landmark / Recent 三层论文池
- 最终入选的 Phase 2 深读名单
- 每篇论文的基本元信息（标题、年份、arXiv ID、角色）
- 初步的子方向划分，用于后续 Phase 3 重组

这些内容应被写入工作材料或聊天过程，用于推动后续阶段，不应被包装成最终研究结论。

---

## Gate 条件

进入 Phase 2 前必须同时满足：

1. **领域地图成立**：已经列出热点子方向、landmark papers、key authors / groups、近期趋势和关键检索词。
2. **分层论文池成立**：Survey / Landmark / Recent 三层候选池已经形成，且每篇记录标题、年份、URL/arXiv ID、初步角色。
3. **目标论文池明确**：已经标注 `core-survey`、`must-read-paper`、`route-representative`、`context-only`，并说明每篇为何入选或降级。
4. **深读队列明确**：已经列出 Phase 2 要进入 `read-article collect` 的论文名单、slug、预期输出路径和图片候选要求。
5. **停留边界明确**：除非用户明确选择 `paper-pool` 模式，否则不得把本阶段搜索结果包装成最终交付。
6. **todo 状态正确**：Phase 0-1 标记为 `completed`，Phase 2 标记为 `in_progress`。
7. **论文级 todo 已创建**：为每篇 `core-survey` 和 `must-read-paper` 创建了独立的 todo 条目（如 "深读 AnimalMotionCLIP (2505.00569)"）；同时补充执行过程中新发现的附属工作项（如"更新现有文章 X"、"修复 sub_id 冲突"等）。

不满足 Gate 时，必须补搜索、补筛选、补角色标注或缩小研究范围后重新检查。

---

## Survey 判断逻辑

```python
SURVEY_KEYWORDS = [
    'survey', 'review', 'tutorial', 'comprehensive', 'overview',
    'foundation', 'landscape', 'unified', 'unifying', 'roadmap',
    'handbook', 'guide', 'meta-survey', 'systematic'
]

def is_survey(paper) -> bool:
    title_lower = paper.title.lower()
    return any(kw in title_lower for kw in SURVEY_KEYWORDS)
```

## 依赖

统一使用 `arxiv-paper-digest` 自带虚拟环境，不再单独安装旧的 `arxivql-guide` 相关依赖。

如需验证环境：

```bash
cd ~/.agents/skills/arxiv-paper-digest
.venv/bin/python -m unittest discover -s tests -v
```

查询能力、`Query` / `Taxonomy` 用法与 `search_arxiv` / `search_by_keywords` 示例，见 `~/.agents/skills/arxiv-paper-digest/SKILL.md`。