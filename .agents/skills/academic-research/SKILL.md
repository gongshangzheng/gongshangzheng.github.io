---
name: academic-research
description: |
  学术领域深度调研与 survey 撰写。分阶段执行：
  ① Web 浅扫 → ② arXiv 分层检索 → ③ 调用 read-article 深读每篇论文 →
  ④ 领域重组 → ⑤ 报告生成 → ⑥ Review。
  不罗列论文，按主题/时间/分类重构信息。最终交付：HTML 博客 + 邮件。
  触发词：调研 XX 领域、文献综述、学术调研、survey、academic research、学术综述。

  注意：单篇论文深读用 read-article；非学术调研用 deep-research。
metadata:
  default-enabled: true
  replaces: [arxiv-search]
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Academic Research — 学术领域深度调研

对一个**学术主题/领域**进行全景式调研：扫描领域 → 检索论文 → 深读每篇 → 领域重组 → 生成报告 → Review → 发布。

> **核心理念**：每一次运行都充分榨取信息。不设文字量上限，宁可详尽不可遗漏。
> 调用 `read-article` 进行单篇论文深度阅读，在此基础上进行跨论文领域重组。
> **最终交付**：HTML 长文（通过 `html-blog` 直接生成）+ 博客发布链接 + 可选邮件通知。
> 当领域过大时，交付应升级为**同一 subcategory 下的系列文章**，用 Hub 串联多篇专题文。
> 系列文章规则见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md`。

## 共享引用

| 引用文件 | 内容 | 何时读取 |
|---------|------|---------|
| `~/.agents/skills/read-article/references/paper-section-guide.md` | 论文章节利用策略：何时读什么、读多深、用来做什么 | Phase 0-1 筛选 + Phase 2 深读时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md` | sub_id、Hub 页、编号规则 | 规划系列文章时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md` | 配图来源优先级、arXiv 图片提取 | 配图时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` | 发布流程、验证清单 | 发布时 |

## Survey / 综述任务标准

当用户要求新写或更新 survey / 综述类文章时，必须按以下方式执行：

**最终正文硬约束**：旧文盘点、升级策略、写作过程等都只能作为内部执行材料，绝不能写进最终正文。正文面向完全不知道旧文的读者，只能直接论述研究主题本身。

1. **先盘点旧文**：读取目标 HTML，提取保留价值
2. **再完整外部对标**：使用 `arxiv-paper-digest`、`web-search` 检索同主题 survey
3. **核心 survey 必须完整深读**：选出 3~5 篇最相关的 survey，逐篇按 `read-article` collect 模式深读。每篇至少覆盖：研究范围、taxonomy、数据集、指标、方法表、局限、开放问题
4. **核心 survey 深读结果默认发布为公开 HTML 参考页**：只有用户明确说"不发布"时才可豁免
5. **建立论文总账**：区分 `core-survey`、`must-read-paper`、`route-representative`、`context-only`
6. **重写结构优先**：Phase 3 必须先输出新的 survey 级结构，再决定旧文内容如何迁移
7. **路线覆盖要求**：必须同时覆盖主流与非主流路线；资料不足要明确说明缺口
8. **旧文更新方式**：可以修改原 HTML 文件，但内容应以新结构重写
9. **笔记结构**：Phase 3 重组必须遵循 `references/survey-note-structure.md`
10. **Review 要求**：所有关键论文是否被覆盖；所有核心 survey 是否已发布参考页；所有 `must-read-paper` 是否已 read-article 并发布精读 HTML；正文总字数和各章节字数是否达标

## 全文提取与配图来源规则

Phase 2 通过 `read-article` 读取论文全文。`core-survey` 和 `must-read-paper` 使用 **full 模式**（生成博客 + Review + 发布），`route-representative` 和 `context-only` 使用 **collect 模式**（只产素材）。禁止只依赖 abstract 或搜索结果片段。

**全文提取优先级**：
1. 首选 arXiv source tarball（`arxiv.org/e-print/<id>`），使用 `scripts/fetch-arxiv-paper.py` 一键提取
2. 次选 arXiv HTML / 官方 HTML
3. 第三选择 PDF 结构化提取（Docling + pdftotext）

**配图规则（强制）**：
1. **必须优先提取论文原图**：所有 `must-read-paper` 必须在 Phase 2 通过 arXiv source tarball 或 PDF 提取至少 1 张核心原图，保存到 `media/images/<slug>/`
2. **综述文章必须用论文原图**：survey / 领域导览 / 专题综述类文章的配图不能只用 mermaid/代码绘制，必须包含真实论文原图（至少 50% 的图片应来自论文）
3. **配图优先级**：见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`。代码绘制（mermaid/jsxgraph）仅作为补充示意，**不得替代可获得的论文原图**
4. **Docling 导出的图片只允许临时辅助定位**，不得作为最终配图
5. **AI 生图在学术场景中完全禁止**

**Phase 2 交付物扩展**：
- 每篇 `must-read-paper` 必须交付 `raw/<slug>/images/` 目录，内含至少 1 张核心原图及提取日志
- `route-representative` 论文尽量提取关键图表；若无法提取，需在 `synthesis.md` 中记录原因
- 论文原图优先选择：架构图、pipeline 图、关键实验图、可视化图

## 执行规则

### 模式选择

| 用户情况 | 模式 | 阶段序列 | 默认交付 |
|---------|------|---------|---------|
| 写或重写完整学术综述 | `survey-full` | Phase 0-1 → 2 → 3 → 4 → 5-6 → 7 | HTML 主文 + 系列 Hub |
| 只要论文池 | `paper-pool` | Phase 0-1 | 领域地图 + 论文池 |
| 已有论文池，补深读 | `deep-read-only` | Phase 2 | reference packets + 精读页 |
| 已有深读，重组结构 | `spine-only` | Phase 3 | survey-spine |
| 只修复既有博客 | `revision` | 读取 HTML → Phase 4 局部重写 → Phase 5-6 | 修复后的 HTML |

不确定模式时，默认 `survey-full`。

### 阶段执行协议

1. **必须创建 todo**：读本文后立即创建全阶段 todo 清单
2. **边做边整理 todo**：todo 不是写完就固定的。每个 Phase 执行过程中发现的新工作项（新论文深读、补充搜索、修复问题、更新文章等）必须立即追加到 todo 末尾，确保 todo 始终是当前工作的真实镜像
3. **论文级 todo**：Phase 0-1 完成分层论文池后，必须为每篇 `core-survey` 和 `must-read-paper` 创建独立的 todo 条目（如 "深读 AnimalMotionCLIP (2505.00569)"），这样深读进度可逐篇追踪
4. **明确 subagent 分工**：每个 subagent prompt 必须写清 Phase、模板、输入/输出文件和禁止事项
4b. **迭代发现闭环**：Phase 2 深读论文的 Related Works 和引用链必须回流到论文池。被多篇论文同时引用但不在论文池中的论文，应升级为 `route-representative` 或 `must-read-paper`。详见 `phases/phase2.md` §2.4
5. 按 Phase 0-1 → 2 → 3 → 4 → 5-6 → 7 顺序推进
6. 进入 Phase 2 前，必须得到分层论文池（core-survey / must-read-paper / route-representative / context-only）
7. 进入 Phase 3 前，核心 survey 必须已完整深读并默认发布参考页；must-read-paper 必须完成 read-article 深读
8. 进入 Phase 4 前，Phase 3 必须完成统一的 `survey-spine`
9. **默认生成博客**：用户若未明确要求"只做侦察/不生成博客"，必须执行到 HTML 生成 + 构建校验
10. 进入 Phase 5-6 前，必须读取 `~/.agents/skills/html-blog/SKILL.md`
11. **重要事实性句子必须带引用**：至少覆盖研究问题定义、时间线、定量结果、方法比较
12. Phase 5-6 fidelity review 必须**回原始来源核对**
13. **扁平数据流**：Phase 2 的 paper packets 是唯一的事实存储层，Phase 3 的 survey-spine 是导航索引，Phase 4 直接从 paper packets + 原文写 HTML。三类产物各司其职，不需要额外的中间重组层。
14. **Phase 3 导航索引**：survey-spine 告诉 Phase 4 写手"哪个主题对应哪些论文、哪些 paper packet 文件"，以及论文间的交叉引用和矛盾标注。spine 保持简短，以指针和映射为主。
15. **Phase 4 写作数据源**：每个章节写手读取对应的 paper synthesis 文件和 sources/ 原文，加上 survey-spine 了解章节定位。写作 prompt 中包含 paper packet 路径。
16. **公式和表格**：从 paper packets 直接进入最终 HTML，写作时直接引用或展开。

### todo 维护示例

```
初始 todo（Phase 0-1 前）：
  [ ] Phase 0-1: 领域侦察 + arXiv 检索
  [ ] Phase 2: 核心论文深读
  [ ] Phase 3: survey-spine
  [ ] Phase 4: 博客撰写
  [ ] Phase 5-6: Review + 构建
  [ ] Phase 7: Hub 更新

Phase 0-1 完成后追加论文级 todo：
  [ ] 深读 CS1: Zia 2026 survey (Springer AIR)
  [ ] 深读 CS2: ESWA 2025 survey
  [ ] 深读 MR1: AnimalMotionCLIP (2505.00569)
  [ ] 深读 MR2: MammalNet (2306.00576)
  [ ] 更新现有文章 animal-action-recognition-survey.html

Phase 2 执行中发现新工作追加：
  [ ] 修复 sub_id 冲突 (pet-action-detection-model-survey)
  [ ] 补充 Animal-CLIP 论文 (IJCV 2025)
```

### 系列文章交付模式

当论文池超过 8 篇或领域覆盖多个技术范式时，应规划同一分类路径下的 3-6 篇系列文章。系列规则（sub_id、Hub 页、标题前缀、跨篇连续性）见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md`。

**数字人硬规则**：数字人相关文章统一 `aliases: ["categories/AI/数字人"]`（论文精读用 `categories/AI/数字人/数字人论文精读`）。论文精读标题格式：`数字人论文精读（序号）：论文名，副标题`。sub_id 同级编号：从 10 开始，步长 10。

**sub_id 分配强制检查**（Phase 7 前必须执行）：

1. 运行 `scripts/check-sub-id.py --category <分类关键词>` 查看现有编号分布
2. 按 SKILL.md §5 规则分配（步长 10，新类型开新谱段）

完整规则见 `~/gongshangzheng.github.io/.agents/skills/blog-aliases/SKILL.md` §5。

---

## 管线总览

```
输入: 研究主题/关键词
  │
  ▼
Phase 0-1 · Web 浅扫 + arXiv 检索 ──── 领域地图 + 论文列表
  │
  ▼ ━━━ 并行 ━━━
Phase 2 · 单篇深读 ──────── read-article × N（full 或 collect，按论文类型）
  │                          产出: paper packets（事实存储层）
  ▼
Phase 3 · 导航索引 ──────── survey-spine（轻量导航，不复制论文内容）
  │
  ▼
Phase 4 · 报告生成 ──────── 直接从 paper packets + 原文写 HTML
  │
  ▼
Phase 5-6 · Review + 发布 ─ 质量检查 + 博客发布
  │
  ▼
Phase 7 · 更新 Hub 页 ──── 匹配并更新枢纽页
```

---

## 阶段索引（survey-full 模式）

| 阶段 | 文件 | Gate |
|------|------|------|
| Phase 0-1: SCOPING + DISCOVERY | `phases/phase0-1.md` | 领域地图 + 分层论文池 + Phase 2 深读名单 |
| Phase 2: DEEP READING | `phases/phase2.md` | 完整深读、图片候选和发布账本齐全 |
| Phase 3: NAVIGATION INDEX | `phases/phase3.md` | survey-spine 导航完成：论文→文章章节映射、交叉引用、写作分配 |
| Phase 4: COMPOSITION | `phases/phase4.md` | 从 paper packets + 原文直接写 HTML，满足结构和字数 |
| Phase 4a: TERMINOLOGY PATCH | `subagents/terminology-problem.md` | 仅当缺前置概念时触发 |
| Phase 5: REVIEW | `phases/phase5-6.md` | fidelity / completeness / HTML format 无 P0/P1 |
| Phase 6: REVISION + BUILD | `phases/phase5-6.md` | 修复 Review 问题，build 通过 |
| Phase 7: HUB PAGE | `phases/phase5-6.md` §Phase 7 | 系列导航、sub_id、Hub 更新完成 |

## Subagent 模板

| 模板 | 用途 |
|------|------|
| `subagents/web-scan.md` | Phase 0 Web 浅扫 |
| `subagents/read-article-collect.md` | Phase 2 collect 模式（route-representative / context-only） |
| `subagents/read-article-full.md` | Phase 2 full 模式（core-survey / must-read-paper） |
| `subagents/report-section.md` | Phase 4 章节撰写（直接从 paper packets 写作） |
| `subagents/html-gen.md` | Phase 4 HTML 生成 |
| `subagents/review.md` | Phase 5 Review |

---

## 快速参考

### arXiv 检索脚本

```bash
cd ~/.agents/skills/arxiv-paper-digest
~/.agents/skills/arxiv-paper-digest/.venv/bin/python << 'PYEOF'
from src.arxiv_search import Query, Taxonomy, search_arxiv

keywords = ["your", "topic", "keywords"]
kw = " ".join(keywords)

q_survey = Query.title(["survey", "review", "tutorial"]) & Query.abstract(kw) & Query.category(Taxonomy.cs)
surveys = search_arxiv(q_survey, max_results=10, sort_by="relevance")

q_recent = Query.abstract(kw) & ~Query.title(["survey", "review"]) & Query.category(Taxonomy.cs)
recent = search_arxiv(q_recent, max_results=30, sort_by="submitted")

for p in surveys:
    print(f"S | {p.arxiv_id.split('/')[-1]} | {p.title}")
for p in recent[:10]:
    print(f"R | {p.arxiv_id.split('/')[-1]} | {p.title}")
PYEOF
```

### arXiv 图片提取（Phase 4 必做）

每篇 `must-read-paper` 必须从 arXiv source tarball 提取至少 1 张核心原图：

```bash
SLUG="<slug>"
IMG_DIR="$HOME/gongshangzheng.github.io/media/images/$SLUG"
mkdir -p "$IMG_DIR" /tmp/arxiv-extract

# 1. 下载并解压 source tarball
cd /tmp/arxiv-extract
curl -sL "https://arxiv.org/e-print/<arxiv-id>" -o "<arxiv-id>.tar.gz"
mkdir -p "<arxiv-id>" && tar xzf "<arxiv-id>.tar.gz" -C "<arxiv-id>"

# 2. 找到论文配图
find "<arxiv-id>" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.pdf" -o -name "*.eps" \)

# 3. 复制关键图并转为 WebP
# PDF → WebP（推荐 200 DPI）
pdftoppm -png -r 200 -singlefile "<arxiv-id>/figures/arch.pdf" /tmp/tmp_fig
cwebp -q 85 /tmp/tmp_fig.png -o "$IMG_DIR/paper-arch.webp"
rm /tmp/tmp_fig.png

# JPG/PNG → WebP
cwebp -q 85 "<arxiv-id>/figures/fig1.jpg" -o "$IMG_DIR/paper-fig1.webp"

# 4. 验证文件存在
ls -la "$IMG_DIR/"
```

**关键原则**：
- 优先选择架构图、pipeline 图、关键实验可视化
- 每张图在 HTML 中用 `.photo` + `.cap` 组件插入，caption 标注来源（论文名, Fig.N）
- 图片文件名要有语义（如 `igmn-overview.webp` 而非 `fig1.webp`）
- **Phase 4 完成后必须 `grep '<img' <html-file>` 确认至少有 3 张图片**

### Web 搜索（DDGS 回退）

```bash
~/.venv/bin/python \
  ~/.agents/skills/web-search/scripts/ddgs_search.py "研究主题" \
  --max_results 20 --timelimit m --region zh-cn --output web_search_result.md
```

---

## 失败边界

以下情况必须停下修复或降级，不得继续包装成最终 survey：

- `core-survey` 未完整读取全文
- `must-read-paper` 只读 abstract，没有 read-article collect 产物
- 关键 taxonomy、指标、时间线无法回到原始来源
- 最终 HTML 只有论文条目堆叠，没有清晰问题定义和双 taxonomy
- 重要论文没有正文论述和核心图片
- 图片来自 Docling 临时图或 AI 生图
- HTML 引用、图片路径、MathJax 或 build 校验未通过
- **最终 HTML 零图片**（没有任何 `<img>` 标签）—— 必须从 arXiv source tarball 提取论文原图后重新插入
- **LaTeX 非标准命令**（如 `\vp`、`\eps` 等 MathJax 不支持的缩写）—— 必须替换为标准命令
- **HTML 标签不配对**（孤立 `</p>`、`</div>` 等）—— 必须用 `node lib/lint-html.js` 验证并修复

## 质量底线

| 必须包含 | 来源 | 最低量 |
|---------|------|--------|
| 子方向/范式的详细分析 | Phase 4（从 paper packets 写作） | ≥ 3 个，每个 ≥800 字 |
| 方法对比总表（含指标） | Phase 4 | ≥ 3×3 表格 |
| 完整发展时间线 | Phase 4 | ≥ 3 个时间段，每段 ≥150 字 |
| 每篇目标论文至少被引用一次 | Phase 2 | — |
| 关键定量结果（带具体数值） | 各论文 paper packets | ≥ 5 个 |
| 开放问题列表 | Phase 4 | ≥ 5 个，每个 ≥50 字 |
| 关键图片 | Phase 4 | ≥ 3 张；每篇 must-read-paper ≥ 1 张 |
| 架构/流程图 | Phase 4 | ≥ 1 张 mermaid/jsxgraph |
| 核心公式（MathJax） | paper packets → Phase 4 | 各论文的核心公式保留到最终 HTML |
| 实验配置表 | Phase 4 | 数据集、硬件、训练/推理配置逐项标注披露状态 |
| **HTML 正文总量** | — | **≥ 6000 字** |
