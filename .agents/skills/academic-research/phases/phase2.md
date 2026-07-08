# Phase 2 · 单篇论文深读

**根据论文重要性选择 read-article 模式**：

| 论文类型 | read-article 模式 | 产出 |
|---------|------------------|------|
| `core-survey` | **full** | raw 素材 + synthesis + 独立 HTML 参考页 + 博客发布 |
| `must-read-paper` | **full** | raw 素材 + synthesis + 独立论文精读博客 + 博客发布 |
| `route-representative` | collect | raw 素材 + synthesis（不发布博客） |
| `context-only` | collect | raw 素材 + synthesis（不发布博客） |

为什么区分：`core-survey` 和 `must-read-paper` 是最终 survey 正文的核心证据来源，需要完整的三路 Review 和博客发布，确保事实准确且可公开追溯。`route-representative` 和 `context-only` 只作为背景或对比参考，collect 模式的素材即可满足需求。

`read-article` 的提取阶段必须遵守 source-first 优先级：arXiv source / LaTeX 源文件（使用 `scripts/fetch-arxiv-paper.py` 一键提取）→ arXiv/官方 HTML → PDF Docling + `pdftotext -layout`。禁止只读 abstract、搜索结果片段或项目页简介。

> 本阶段是 academic-research 的信息主采样阶段。
> Phase 0-1 只负责定方向与选样本；真正可进入综述正文的证据、数据、图表、方法细节，主要来自这里。
> 如无特殊说明，不得跳过本阶段直接进入 Phase 3/4。
>
> **章节利用策略**：进入本阶段前，读取 `~/.agents/skills/read-article/references/paper-section-guide.md`。
> 该指南定义了论文每个章节在不同分析维度下的阅读深度和利用方式。特别注意：
> - **Introduction** → Phase 2a（动机+贡献声明）+ Phase 2b（技术定位）
> - **Related Works** → Phase 2b（taxonomy + 引用链 + 共性缺陷）+ Phase 2.4（论文池回流）
> - **Conclusion** → Phase 2a（局限性+未来方向）+ Phase 2.4（开放问题缺口）

## 2.1 并行执行

同时派出多个 subagent，每个负责调用 read-article 处理 1~2 篇论文。

- **full 模式论文**（core-survey / must-read-paper）：使用 `subagents/read-article-full.md` 模板，执行完整管线（Phase 1-8），产出独立博客
- **collect 模式论文**（route-representative / context-only）：使用 `subagents/read-article-collect.md` 模板，只执行 Phase 1-3，产出 raw 素材

## 2.2 并行策略

根据论文数量分配 subagent：
- ≤5 篇：每篇 1 个 subagent（full 模式论文建议单独分配）
- 6~10 篇：full 模式论文单独分配，collect 模式每 2 篇 1 个 subagent
- >10 篇：full 模式论文单独分配，collect 模式每 3 篇 1 个 subagent

## 2.3 完成后检查

所有 subagent 完成后，验证：
- [ ] 每篇目标论文都有 `raw/<slug>/sources/<slug>.md`（来自 source/HTML/PDF fallback 的全文 Markdown）
- [ ] 每篇目标论文都有提取来源记录：source tarball、HTML、PDF Docling / pdftotext 哪些成功、哪些失败、失败原因是什么
- [ ] 每篇目标论文都有 `raw/<slug>/synthesis.md`
- [ ] 每篇 `must-read-paper` 都已通过 read-article 形成完整论文精读，并发布为可构建 HTML 论文页；若未发布，必须记录用户明确豁免原因
- [ ] 每篇 `must-read-paper` 都至少提取 1 张核心图片候选，记录来源、caption、最终 survey 使用位置；若无可用图片，必须记录原因和替代图计划
- [ ] synthesis 通过了 Review（无大量缺口）
- [ ] 每篇 `core-survey` 都已获取全文，不能仅有 abstract、intro、搜索结果片段或二手摘要
- [ ] 每篇 `core-survey` 都有 read-article 式 reference packet / survey ledger，至少覆盖研究范围、章节结构、taxonomy、数据集、指标、方法表、局限、开放问题、与当前主题的关系
- [ ] 每篇 `core-survey` 都已发布为可构建、可公开访问的 HTML 参考页；若未发布，必须记录用户明确豁免原因
- [ ] `core-survey` 的深读结果已写入可追溯的 survey ledger，且每条 taxonomy / 指标 / 结论都有原文指针；若没有完整 ledger 和公开参考页，不得进入 Phase 3 使用其结构或结论
- [ ] 每篇 `core-survey` 的公开 HTML 参考页都已在 todo note 中记录目标 slug、标题、分类、sub_id、核心用途，以及它与最终主文的关系；只有用户明确豁免时才允许不发布

## 2.4 迭代发现闭环（Related Works 回流）

Phase 2 不只是“消费”Phase 0-1 的论文列表——它必须**反哺**论文池。`read-article` 的 Phase 2b（引用链挖掘）和 Phase 2c（宝藏挖掘）会产出大量新论文线索，这些线索必须形成闭环：

### 操作步骤

1. **Related Works 系统精读**：对每篇 `core-survey`，其 Related Works 章节是该领域的微型 taxonomy。深读时必须：
   - 提取论文作者对已有方法的分类方式和分类标准
   - 记录论文指出的已有方法共性缺陷
   - 列出 Related Works 中被反复引用但不在我们论文池中的论文
2. **引用链交叉比对**：将 `read-article` Phase 2b 产出的引用链（top 3-5 核心引用）与当前论文池交叉比对：
   - 如果某篇引用被 2+ 篇论文同时引用，且不在论文池中 → 升级为 `route-representative` 候选
   - 如果某篇引用被 3+ 篇论文同时引用，且不在论文池中 → 升级为 `must-read-paper` 候选
3. **新论文快筛**：对新发现的候选论文，执行轻量搜索（标题 + abstract），判断是否属于调研范围
4. **论文池更新**：将通过筛选的新论文追加到论文池，标注来源（“由 <论文X> Related Works 发现”）
5. **todo 追加**：为每篇新加入的 `must-read-paper` 创建独立 todo 条目

### 何时可跳过

- 论文池已经 ≥15 篇且覆盖 3+ 技术路线
- 多篇 `core-survey` 的 Related Works 高度重叠（说明论文池已饱和）
- 用户明确表示“不需要扩展”

不满足以上任一条件时，**必须执行迭代发现闭环**，不得跳过。

## 产物结构

每篇论文经 read-article 处理后产出：

```
raw/<slug>/
├── meta.md                  # 元信息索引
├── sources/
│   ├── <slug>.md           # source/HTML/PDF fallback 提取的全文 Markdown
│   ├── <slug>.json         # 可选结构化 JSON；PDF fallback 或需要表格/layout 时生成
│   └── extraction-log.md   # source/HTML/PDF/Docling/pdftotext 状态与失败原因
├── source.tar               # arXiv e-print tarball（fetch-arxiv-paper.py 下载）
├── source-tar/             # 解压后的 .tex 源码
├── figures/<slug>/          # 提取的原始图片文件（PDF/PNG/EPS）
├── images/<slug>/           # WebP 图片（convert-figures.py 输出）
└── synthesis.md             # 综合分析
```

academic-research 可以先消费 `synthesis.md`，但 Phase 3/4/5-6 必须沿 synthesis 中的指针回溯 `sources/`、source tarball、HTML、PDF、项目页或官方仓库。不得只依赖 synthesis 的扁平摘要。

## 本阶段交接要求

进入 Phase 3 前，主 agent 至少要完成以下检查：

- 每篇入选论文都已有可引用的 org-roam 笔记
- 每篇论文至少提炼出其角色：问题定义 / 方法创新 / 实验结论 / 局限性
- 至少整理出一版跨论文可比较字段，为后续方法对比表做准备
- 明确哪些论文属于 `must-read-paper`、`route-representative`、`context-only`
- 为每篇 `must-read-paper` 建立发布账本：read-article raw 路径、论文精读 HTML 路径、frontmatter 分类/sub_id、可复用图片、survey 中计划出现的位置
- 对 `core-survey` 单独生成 `survey-ledger`：列出原始全文路径、深读总结路径、公开 HTML 参考页路径、可引用的 taxonomy / 表格 / 指标 / 局限，以及每条结论的原始来源指针
- 若某个 `core-survey` 无法完整读取或无法形成 survey ledger，必须从核心证据中移除，或在后续材料中明确降级为“背景线索”

---

## Gate 条件

进入 Phase 3 前必须同时满足：

1. **全文来源完整**：每篇进入正文证据链的论文都有 source-first 提取记录，不能只有 abstract、搜索片段或项目页简介。
2. **核心 survey 完整**：每篇 `core-survey` 已逐篇完整深读，形成 reference packet / survey ledger，并默认发布为可构建 HTML 参考页；若未发布，必须有用户明确豁免。
3. **must-read 完整**：每篇 `must-read-paper` 已完成 read-article 深读，形成论文精读 HTML 或用户明确豁免记录。
4. **图片候选完整**：每篇 `must-read-paper` 至少有 1 张可追溯核心图片候选；没有图片时，已记录原因和 mermaid/jsxgraph 替代计划。
5. **证据账本可比**：已经抽取跨论文可比较字段，包括任务、输入输出、表示、训练数据、指标、算力/速度、优势、局限、代码/模型可用性。
6. **降级明确**：无法完整读取、无法核验或只适合作背景的来源已从核心证据链降级，不能支撑确定性结论。
7. **todo 状态正确**：Phase 2 标记为 `completed`，Phase 3 标记为 `in_progress`。
8. **todo 已同步新发现**：Phase 2 深读过程中发现的新论文、需要补充的检索方向、现有文章修复项、新规划的博客文章等已追加到 todo；若有新论文晋升为 `must-read-paper`，须为每篇创建独立 todo 条目。
9. **迭代发现闭环已完成**：至少对每篇 `core-survey` 的 Related Works 和引用链做了系统精读，并将发现的新论文回流到论文池；若跳过，必须记录跳过原因。

任一条件不满足时，必须补做 read-article、补图、补 ledger 或调整论文角色后重新检查。