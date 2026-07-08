---
name: deep-research
description: |
  非学术深度调研工具。覆盖探索性调研（socratic 引导）、事实查核、政策分析、系统性综述等场景。
  支持 research、deep research、fact-check、guide my research、help me think through、
  systematic review、meta-analysis、PRISMA、evidence synthesis。
  中文触发词：研究、深度研究、事实查核、引导我的研究、帮我理清、帮我分析、核实、查证。

  注意：学术领域调研（"调研 XX 领域""文献综述""survey"）请用 academic-research。
  本 skill 由用户直接调用。触发词：帮我理清、帮我分析、事实查核、深度研究。
metadata:
  default-enabled: true
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Deep Research — 深度调研

深度调研工具，覆盖从探索性调研到系统性综述的全场景。

**与 academic-research 的边界**：academic-research 专注学术领域调研（arXiv 检索 + 论文精读 + survey 撰写），deep-research 覆盖非学术深度调研（政策分析、事实查核、行业研究、社会事件追踪等）。当主题同时涉及学术和非学术维度时，由用户自行选择。

## 共享引用

| 引用文件 | 内容 | 何时读取 |
|---------|------|---------|
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md` | sub_id、Hub 页、编号规则 | 规划系列文章时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md` | 配图来源优先级 | 配图时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` | 发布流程、验证清单 | 发布时 |

## 执行规则

1. 读本文后，立即用 `todo_write` 创建当前模式的全阶段 todo 清单
2. 每进入一个阶段：标记 `in_progress` → `read` 对应的 `phases/` 文件 → 按文件指令执行
3. 每完成一个阶段：标记 `completed` → 检查该 phase 文件末尾的 **Gate** 条件
4. Gate 未通过 → 禁止进入下一阶段，修正后重新检查
5. 不得跳过、合并、并行执行任何阶段
6. 只要最终产出包含长报告或可发布 HTML，**重要事实性句子必须显式带引用**
7. 最终交付**不必强制只有一篇文章**。当主题跨度大时，可整理为多篇文章的系列输出
8. Review / fidelity 检查时，**必须回到原始来源逐条核对**
9. **来源数量门槛**：full ≥ 15 个（core ≥ 5 个 tier_1/tier_2）；quick ≥ 5 个；systematic 全量；fact-check 每个 claim ≥ 3 个。
10. **扁平数据流**：Phase 2 的来源注释是事实存储层（每个来源保留核心发现、具体数值、与研究问题的关系、局限性），Phase 3 分析是导航索引（主题→来源映射、交叉引用、矛盾标注），Phase 4 直接从来源注释 + 原文写作。三类产物各司其职。
11. **Phase 4 写作数据源**：从 Phase 2 的来源注释条目和原文（`~/gongshangzheng.github.io/raw/<slug>/`）写作，Phase 3 分析报告作为主题导航参考。
12. **来源注释充分展开**：每个来源的注释包含核心发现（含具体数值）、与研究问题的关系、局限性或争议点。core 来源注释 ≥ 200 字。

## 搜索策略

Phase 2 (INVESTIGATION) 涉及网络搜索时，遵循 `web-search` skill 的策略。

### 何时主要依赖 web 搜索

- 需要了解某领域或技术路线的最新现状
- 需要查官方文档、项目主页、政策文本、仓库、issue / PR
- 需要核查某个说法、时间线、修复状态或社区争议
- 需要纳入重要社会事件、公共舆论、监管动作、行业事故、融资并购
- 需要查阅新闻媒体、行业媒体、机构报道来补齐现实语境

### 执行协议

1. **先判定意图**：`factual / status / comparison / tutorial / exploratory / news / resource`
2. **再生成 query bundle**：围绕主题生成 3-5 个互补搜索变体
3. **按优先级检索**：`web_search` → `mcp_MiniMax_web_search` → `ddgs_search.py`
4. **去重与初排**：优先保留官方来源、原始来源
5. **必要时线程深挖**：对 GitHub issue / PR、论坛帖子继续追踪
6. **内容抽取**：对高价值 URL 先 `web_fetch`，不完整时再 `browser`
7. **结构化输出**：搜索结果按统一 contract 整理

### 关键边界

- 文献综述、系统综述的核心证据仍以数据库检索为主（学术场景请用 academic-research）
- web 来源承担 context / verification / implementation / timeline / social-impact 角色
- 当结论依赖论坛或 issue 内容时，必须补充交叉验证
- 当结论依赖新闻媒体时，优先选择原始报道、权威媒体和多源互证

## 模式选择

| 用户情况 | 模式 | 阶段序列 |
|---------|------|---------|
| 想法模糊，需要引导 | socratic | → `phases/socratic.md`（替代 Phase 1-6） |
| 有明确 RQ，需要完整研究 | full | → scoping → investigation → analysis → composition → review → revision |
| 快速摘要（30 min） | quick | → scoping（简化）→ investigation（简化）→ composition |
| 评估某篇论文 | review | → `phases/review.md` |
| 查核特定事实 | fact-check | → investigation（仅 source verification） |
| 系统性综述/荟萃分析 | systematic-review | full 流程 + 叠加 `phases/systematic-review.md` |

不确定？先用 socratic。

## 阶段索引（full 模式）

| 阶段 | 文件 | Gate |
|------|------|------|
| Phase 1: SCOPING | `phases/scoping.md` | 用户确认 RQ + Devil's Advocate PASS |
| Phase 2: INVESTIGATION | `phases/investigation.md` | 来源数达标（full≥15） |
| Phase 3: ANALYSIS | `phases/analysis.md` | Devil's Advocate checkpoint PASS |
| Phase 4: COMPOSITION | `phases/composition.md` | 报告初稿完成 |
| Phase 5: REVIEW | `phases/review.md` | 编辑决定非 Reject + 伦理 CLEARED |
| Phase 6: REVISION | `phases/revision.md` | 修订完成或达到最大轮次 |
| Phase 7: HUB PAGE | `phases/hub-page.md` | Hub 页已生成（多篇系列时） |

## Hub 页生成（多篇文章系列）

当最终交付为多篇文章的系列输出（≥2 篇）时，Phase 7 自动触发。

系列文章规则（sub_id、Hub 页结构、标题前缀等）见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md`。

### 执行步骤

1. **统一分类**：所有系列文章共享同一 `subcategory`
2. **创建 Hub 页**：
   ```bash
   cd ~/gongshangzheng.github.io
   node ~/.agents/skills/html-blog/capture.js <hub-slug> --hub
   ```
3. **填充 Hub 页**：引论 + 章节目录 + 研究资源索引
4. **编号一致性检查**：先列出同一 subcategory 的现有 sub_id，确认无重复
5. **构建验证**：`node build.js` 确认无错误
6. **Git push**

## 特殊模式索引

| 模式 | 文件 | 说明 |
|------|------|------|
| Socratic | `phases/socratic.md` | 5层引导式调研对话，替代 Phase 1-6 |
| 系统性综述叠加 | `phases/systematic-review.md` | PRISMA + RoB + 荟萃分析 |
| 失败路径 | `phases/failure-paths.md` | 所有失败场景和处理策略 |

## 质量对齐（关键定义）

| 概念 | 定义 |
|------|------|
| Peer-reviewed | 经过正式同行评审的期刊 |
| 时效规则 | 默认5年；CS/AI 3年；历史/哲学 20年；开创性作品不限 |
| CRITICAL | 未解决将使核心结论无效或构成学术不端 |
| 来源等级 | tier_1=一区; tier_2=其他同行评审; tier_3=学术非同行评审; tier_4=灰色文献 |
| 最低来源数 | full=15+; quick=5-8; systematic=全量; fact-check=3+/claim |
| fidelity review | 逐条回原始来源核对事实、数字、时间线、措辞边界与归因 |

## 质量底线

| 指标 | full 模式最低量 |
|------|----------------|
| HTML 正文总量 | ≥ 4000 字 |
| 综合主题分析 | ≥ 3 个主题，每个 ≥ 600 字 |
| 具体定量结果（带数值） | ≥ 5 个 |
| 关键时间线节点 | ≥ 3 个，每个含具体日期 |
| 开放问题/知识缺口 | ≥ 3 个，每个 ≥ 50 字 |
| 来源数量 | ≥ 15 个已验证来源 |
| core 来源注释 | 每个 ≥ 200 字 |
| 引用 | 重要事实句全部带 `$@key$` |
