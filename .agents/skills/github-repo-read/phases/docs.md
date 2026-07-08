# Phase 2: README / Docs / 外部上下文

**目标**：读取项目核心文档，理解项目要解决的问题、主打卖点、使用方式，并按需搜索外部上下文补充。

## 2.1 读取 README 与文档骨架

**硬性读取顺序**（理解一个仓库必须从这里开始，不要跳过直接读源码）：

1. **README**（根目录，最高优先级——项目的自我介绍）
2. **GitHub Wiki**（如果有，见 2.1.1——Wiki 独立于代码仓库，`git clone` 拉不到，必须单独克隆）
3. docs index / tutorial / usage（`docs/`、`mkdocs.yml`、`docusaurus` 等站点文档）
4. examples / notebooks
5. paper / citation / project page
6. changelog / release notes（如果理解版本演进有价值）

> 原则：**先 README，再 Wiki，再 docs 站点，最后才进源码**。文档是作者主动留下的"导读"，能极大降低读源码的成本；跳过文档直接啃源码是低效且容易误判定位的。

### 2.1.1 GitHub Wiki 克隆（高频遗漏点）

GitHub Wiki 存放在与主仓库**独立的 git 仓库**中（`<repo>.wiki.git`），普通 `git clone` **不会**包含它。许多项目把架构说明、设计文档、FAQ 放在 Wiki 而非 README，必须单独检查：

```bash
REPO="owner/repo"
NAME="repo-name"
WIKI="/tmp/${NAME}-wiki"
rm -rf "$WIKI"
# 尝试克隆 Wiki（仓库未启用 Wiki 时会失败，属正常，跳过即可）
git clone --depth 1 "https://github.com/${REPO}.wiki.git" "$WIKI" 2>/dev/null \
  && echo "Wiki 存在，已克隆到 $WIKI" \
  && find "$WIKI" -name '*.md' | sort \
  || echo "无 Wiki 或未启用，跳过"
```

若 Wiki 存在，按 Home / Sidebar 入口通读，重点提取：架构设计、模块说明、设计决策（design rationale）、FAQ、贡献指南中暴露的内部结构。Wiki 内容同样按 `[repo]` 标注来源。

### 提取清单

| 维度 | 需要回答的问题 |
|------|---------------|
| 问题 | 项目要解决什么问题？ |
| 卖点 | 主打特性 / 创新点是什么？ |
| 安装 | 如何安装？依赖什么？ |
| 最小样例 | README 的最小使用示例是什么？命令中的每个关键参数分别做什么、输入输出是什么、用户应该如何替换？ |
| 支持范围 | 支持哪些模型/数据/平台？ |
| 学术关系 | 与论文或官方产品的关系？ |
| Wiki | 是否有 GitHub Wiki？Wiki 里有无架构/设计文档？ |
| 文档图片 | README/Wiki 中出现的图、demo、架构图、结果图（记录路径，Phase 3 收集） |

### 读取命令

```bash
SRC="/tmp/<repo>-src"
# README
cat "$SRC/README.md" 2>/dev/null || cat "$SRC/README.rst" 2>/dev/null

# docs 目录
find "$SRC/docs" -maxdepth 2 -name '*.md' -o -name '*.rst' 2>/dev/null | head -20

# examples / notebooks
find "$SRC" -maxdepth 2 \( -name '*.ipynb' -o -name 'example*' -o -name 'demo*' \) | head -20
```

## 2.2 搜索外部上下文（按需）

当项目涉及新框架、论文、模型或 API，使用当前环境可用的 `web_search` / `web_fetch` 查当前资料；如果用户提供了确定 URL，优先直接 `web_fetch`。

### 执行协议

1. **意图分类**：`factual / status / comparison / tutorial / exploratory / news / resource`
2. **Query bundle**：生成 3-5 个互补搜索变体，不要只搜一个词
3. **按优先级检索**：优先使用当前环境可用的 `web_search`；已知 URL 时用 `web_fetch`
4. **去重与初排**：优先保留官方来源、原始来源、学术来源
5. **内容抽取**：对高价值 URL 使用 `web_fetch`；如果网页不可访问，明确说明访问失败并改用其他可验证来源

### 证据标注规范

必须区分三类信息：

| 类型 | 标注 | 说明 |
|------|------|------|
| Repo 事实 | `[repo]` | README/文档/代码中明确写的 |
| 外部补充 | `[external]` | 外部文档、博客、论文补充的 |
| 推断 | `[inference]` | 你的分析推断，需注明依据 |

---

## Gate 条件

进入 Phase 3 前必须满足：

1. **README 已完整读取**，核心卖点和使用方式已提取；README/文档中的关键命令已提取参数说明、输入输出含义和替换建议
2. **GitHub Wiki 已检查**：克隆成功则已通读，无 Wiki 则已确认跳过
3. **文档骨架已扫描**，知道项目有哪些文档资源
4. **外部上下文搜索完成**（如需要），证据已标注来源类型
5. **todo 状态**：Phase 2 标记为 `completed`，Phase 3 标记为 `in_progress`

不满足？补齐后重新检查 Gate。
