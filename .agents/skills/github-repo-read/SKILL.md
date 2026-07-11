---
name: github-repo-read
description: |
  深度阅读 GitHub 仓库：从仓库侦察、README/文档解析、核心源码路径定位、代码调用链分析、
  工程设计提炼、图片资产收集，到 HTML 博客发布的完整多阶段流程。

  触发词：读这个 GitHub 仓库、分析这个源码、源码解读、repo analysis、GitHub repo read、
  帮我把 xxx 项目写成博客。

  即使用户没有明确说"源码解读"，只要涉及 GitHub URL + 理解项目架构/设计决策/如何使用/复现，
  都应该使用本 skill。包括：评估一个开源库是否适合采用、理解一个框架的内部设计、
  把开源项目写成教学式博客、对比两个仓库的技术路线。

  注意：只需要 git 操作命令（clone/push/PR）用 git 本身；只查 API 文档直接 web_fetch 即可。
metadata:
  default-enabled: true
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# GitHub Repo Read — GitHub 仓库深度阅读

把一个 GitHub 仓库读成一篇可发表的结构化源码/项目解读，而不是只复述 README。对 AI/ML、工具库、应用类仓库，回答"怎么用"：安装/配置、训练、推理、评估、部署或 API 调用方式，并写进最终博客。

> **前置 · 库内检索（必做）**：开始生成前，先按 [`blog-rules/references/pre-generation-search.md`](../blog-rules/references/pre-generation-search.md) 做库内检索——判断是新建、扩充已有文章、还是接力草稿，并收集关联文章供正文交叉引用。跳过此步导致重复创作是典型错误。

## 核心原则

1. **先文档，再源码**：文档是作者留下的导读，跳过它直接啃源码低效且容易误判项目定位。
2. **先判断项目定位，再读源码**：不要从随机文件开始，先搞清楚这是什么、解决什么问题。
3. **C4 分层，由全局到局部**：Context（系统定位）→ Container（运行单元）→ Component（核心模块）→ Code（关键函数），自顶向下下钻。
4. **可视化 + 核心代码入文**：架构/依赖关系用 Mermaid 图，主调用链用时序图。源码解读不能只写路径和口头概括——关键函数/类的核心代码片段直接用代码框插入正文，标注来源路径与函数名。读者需要看到真实代码，而不是"该函数实现了 XX 功能"。
5. **证据优先**：每个技术判断都要能回到 README、Wiki、文档、代码文件或配置项。区分 repo 事实 `[repo]`、外部官方补充 `[external]`、分析推断 `[inference]`，最终写作时不能把推断写成 repo 明示事实。
6. **用法落地**：阅读时单独梳理"如何使用"。从 README、docs、examples、scripts、CLI、notebooks 中提取安装、训练、推理、评估、部署、API 调用命令。每个关键命令解释参数用途、输入输出含义、路径如何替换，不能只贴命令。
7. **图片优先级**：用户笔记图 > GitHub 仓库中的 README/docs/assets/figures 图片 > arXiv source > PDF crop。所有图片本地化，详见 `blog-images` skill。
8. **默认只读**：除非用户明确要求修改代码，否则只 clone/read，不写入仓库内部文件。

## 执行规则

1. **创建 todo**：读本文后，立即创建全阶段 todo 清单。todo note 记录 repo、ref、输出模式、源码目录、目标文章 slug。这样在长流程中不会丢失上下文。
2. 每进入一个阶段：标记 `in_progress` → 读取对应的 `phases/` 文件 → 按文件指令执行。
3. 每完成一个阶段：标记 `completed` → 检查该 phase 文件末尾的 **Gate** 条件。Gate 未通过则修正后重新检查——Gate 的存在是因为跳过某阶段往往导致后续阶段缺少输入而产出空洞内容。
4. 不得跳过、合并、并行执行任何阶段（Phase 6 可选除外）。如果某阶段确实不适用，写明跳过理由。
5. **重要事实句带证据**：至少覆盖项目定位、功能特性、架构组成、接口契约、入口路径、使用方式、训练/推理/评估命令、配置项、性能数字、硬件要求、协议/商用风险。
6. 进入 `blog` / `blog-multi` 模式的 HTML 写作前，读取 `html-blog` skill；涉及组件语法时按需读取 `blog-syntax` 对应 reference。凭记忆写 HTML 组件是博客构建失败的最常见原因。
7. HTML blog 规范：章节用 `.ch` + `.ch-title`，二级标题用 `<h3 class="section-title">`，三级标题用 `<h4 class="ch-section">`。图片用 `<div class="photo"><img ...><div class="cap">...</div></div>`，禁止在 photo 中只放裸路径。引用用 `#key#` 并在 `.sources li` 中配置 `data-cite-key`。
8. blog 模式发布前做 HTML 质量校验：无 Markdown 标题/列表残留、无模板变量残留、无 photo 裸路径、无缺失 `data-cite-key`、build 成功。
9. Review / fidelity 检查时回到原始来源逐条核对（README、Wiki、docs、源码、配置、LICENSE、官方模型页、论文正文、issue/PR 原文），不依据中间笔记或模型记忆验收。
10. 仓库跨度大、天然分模块、教程/书籍类时，进入 `blog-multi`，用 hub 页组织阅读路径。

## 渐进式披露路由

| 场景 | 读取文件 |
|------|---------|
| 每个 Phase 开始前 | 对应的 `phases/<phase>.md` |
| 配图时 | `~/gongshangzheng.github.io/.agents/skills/blog-images/SKILL.md` |
| 写 HTML 前 | `~/.agents/skills/html-blog/SKILL.md` |
| HTML 组件语法 | `~/.agents/skills/blog-syntax/` 对应 reference |
| blog 模式确定分类时 | `~/gongshangzheng.github.io/.agents/skills/blog-categories/SKILL.md` |
| 确定 subcategory 后填写 title/sub_id 时 | ① 先用 `blog-search` skill 检索该 subcategory 下的现有文章，确认系列结构和下一个可用编号；② 再读 `~/gongshangzheng.github.io/.agents/skills/blog-categories/references/subcategory-organization.md` |
| 发布时 | `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` |

## 触发场景

- 发来 GitHub URL，要求"读一下""分析一下""讲讲这个项目"
- 要求源码解读、架构分析、技术评估、复现建议
- 要求把 GitHub 仓库写成 HTML blog，可能需要多个页面
- 要求从 GitHub repo 中抽取图片、架构图、demo 图用于博客或论文笔记

## 不触发

| 场景 | 用什么 |
|------|--------|
| 只需要 git 操作命令（clone/push/pull） | 直接用 git 命令 |
| 修 CI、修 PR、改仓库代码 | 直接编程 |
| 只查库 API 文档 | 直接 `web_fetch` 文档页 |

## 输出模式

| 模式 | 触发 | 产出 | 阶段序列 |
|------|------|------|----------|
| `inspect` | 用户只问"这个 repo 是什么/能不能用" | 简短结构化分析，不发布 | → recon → docs → outline → review（简化） |
| `deep-read` | 用户要求深入分析源码 | 仓库地图 + 核心调用链 + 技术评估 | Phase 1-7 → Phase 9 Review |
| `blog` | 用户要求写成博客/发布 | HTML blog + 本地图片 + build 验证 | Phase 1-9 |
| `blog-multi` | 仓库有多个独立模块/章节 | hub 页 + 多个子页面 | Phase 1-9（Phase 8 多页处理） |
| `notes` | 用户要求沉淀笔记 | org/markdown 笔记 | Phase 1-7 → Phase 9 Review（简化） |
| `fact-check` | 用户只核查某个事实/实现 | 证据链 + 结论 | Phase 1-2 → Phase 4/5 局部 → Phase 9 |

默认：`blog`。用户说"只看/分析一下/不发布" → `deep-read` 或 `inspect`。

### 多页面模式（blog-multi）

当仓库有多个独立模块、是教程/书籍类、或用户明确要求"每个章节一个页面"时进入。

```
~/gongshangzheng.github.io/src/pages/
├── <slug>.html           ← hub 页（索引/目录）
├── <slug>-ch01.html      ← 章节/模块 1
├── <slug>-ch02.html      ← 章节/模块 2
└── ...
```

Hub 页使用 `capture.js --hub` 创建，所有子页面和 hub 页的 `subcategory` 一致。详细规范参见 `html-blog` skill。

## 阶段索引

| 阶段 | 文件 | Gate |
|------|------|------|
| Phase 0: 任务界定 | 本文件 | 解析完成 + 模式确定 + 安全边界确认 |
| Phase 1: 仓库侦察 | `phases/recon.md` | 基础信息 + 目录地图就绪 |
| Phase 2: README/Docs | `phases/docs.md` | 核心文档已读取，使用路径已提取 |
| Phase 3: 图片资产收集 | `phases/images.md` | 资产已本地化 |
| Phase 4: 代码地图 | `phases/code-map.md` | 入口 + 模块依赖图就绪 |
| Phase 5: 依赖安装 + 核心源码深读 | `phases/code-read.md` | 依赖已安装或明确跳过 + 主调用链已提取 |
| Phase 6: 运行验证（可选） | `phases/verification.md` | 验证通过或跳过 |
| Phase 7: 综合分析 | `phases/outline.md` | 写作提纲确认 |
| Phase 8: HTML Blog | `phases/blog.md` | build 通过 |
| Phase 9: Review | `phases/review.md` | PASS / REVISE / REJECT |
| Phase 10: Revision | `phases/revision.md` | 已按 Review 结果修订并复核 |

## Phase 0 · 任务界定与安全边界

1. **解析用户输入**：repo URL / owner/repo；分支 / commit / tag（如用户指定）；目标输出模式；是否需要多页面。
2. **安全边界**：未明确要求修改时只读。clone 到 `/tmp/<repo>-src/`，大仓库使用 `--depth 1`，必要时 sparse checkout。
3. **上下文不明确时**：先读取当前工作区 README、目录结构和相关打开文件来确认。

### Gate 条件

- repo/ref 已解析
- 输出模式已确定（六选一）
- 安全边界已确认
- todo 已创建，note 记录 repo、ref、输出模式、源码目录、目标 slug

## 使用方式阅读协议

适用于所有模式，尤其是 `blog` / `blog-multi` / `deep-read`。

1. **先从文档提取官方用法**：README → docs → examples → tutorials → notebooks → model cards → Wiki → release notes。
2. **再从工程入口验证**：查找 `train`、`infer`、`predict`、`eval`、`serve`、`demo`、`cli`、`pipeline`、`main`、`config` 等入口。
3. **按仓库类型覆盖**：
   - AI/ML：环境安装、数据/权重准备、训练命令、推理命令、评估方式、关键配置、输入输出、显存/硬件要求、模型权重与许可证
   - 库/框架：安装方式、最小 API 示例、核心配置、扩展点、典型集成路径
   - 应用/服务：启动方式、配置项、依赖服务、主要接口、部署方式
4. **命令参数解释**：每个关键命令后追加参数解释表（参数名、作用、输入/输出含义、默认值、如何替换、与其他参数的配对关系）。
5. **最终博客**有"如何使用"章节；AI/ML 仓库还有"训练模型"和"推理模型"小节，若仓库未提供对应能力，写明"仓库未提供/未核实到"并给出证据。

## 搜索策略

Phase 2 涉及外部上下文搜索时：

1. 判定意图：`factual / status / comparison / tutorial / exploratory / news / resource`
2. 生成 3-5 个互补搜索变体
3. 按优先级检索：`web_search` → `web_fetch` → `browser`
4. 去重初排：优先保留官方来源、原始来源
5. 区分 repo 事实 / 外部文档补充 / 推断

配图搜索详见 `blog-images` skill。

## Review 与 Revision

1. Phase 9 给出 `PASS / REVISE / REJECT` 判定。
2. `PASS`：所有 CRITICAL 和 P1 已解决，build 或对应验证通过。
3. `REVISE`：存在 P1/P2，进入 Phase 10，将问题映射回对应阶段修订。
4. `REJECT`：核心事实错误、未读 README/docs、未读源码却声称实现、引用/图片/构建严重失败——回到 Phase 2 或更早阶段重做。
5. 修订后重新执行 Phase 9，不允许只修不验。
6. blog 输出时，主 agent 亲自最终审查 HTML 语法、图片路径、引用闭合和构建结果。

## 质量定义

| 概念 | 定义 |
|------|------|
| Repo 事实 `[repo]` | README、Wiki、docs、源码、配置、LICENSE、release、issue/PR 中明确出现的信息 |
| 外部补充 `[external]` | 官方文档、论文、模型页、项目主页、标准文档等 repo 外来源 |
| 推断 `[inference]` | 基于源码和文档做出的分析判断，说明依据，不能伪装成作者原话 |
| CRITICAL | 未解决会导致核心结论错误、引用失效、构建失败、图片不可见、协议风险误导 |
| P1 | 影响文章质量或可信度，如缺图、缺调用链、代码证据不足 |
| P2 | 表述、排版、措辞或次要结构优化 |
| Fidelity Review | 逐条回原始来源核对事实、数字、路径、函数名、协议、性能、依赖和引用 |

## 质量底线

- 不把 README 改写当源码解读
- 不说"源码中实现了 X"，除非读到对应文件
- 不把外部搜索到的背景说成仓库作者设计
- 不把未运行的项目说成"验证通过"——只能说"按文档推断可运行"或"未验证"
- 对没读到的部分明确说"未核实"
- HTML blog 正文密度：项目定位、运行架构、核心调用链、关键源码路径、如何使用、训练/推理/评估或 API 调用、配置/部署、性能/成本、协议/风险、可迁移经验
- HTML blog 重要事实句有 `#key#`，底部 `.sources li` 有对应 `data-cite-key`
