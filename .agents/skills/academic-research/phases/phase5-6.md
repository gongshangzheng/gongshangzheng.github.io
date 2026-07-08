# Phase 5-6 · Review + 发布

**所有 HTML 生成必须遵循 html-blog 技能**：

```
读取 ~/.agents/skills/html-blog/SKILL.md 全文
```

本 phase 中的 HTML 生成规范以此文件为准，不重复其内容。

关键规范（详见 html-blog SKILL.md）：
- frontmatter 必须按实际文章类型、栏目和 slug 填写；不要硬编码复用其他 skill 的分类
- 含公式加 `mathjax: true`
- LaTeX：行内 `$...$`，独立公式 `\[...\]`，`<` → `\lt`
- 章节用 `.ch` / `.section` 组件，禁止裸 markdown
- 参考来源用 `.sources` 组件，表格用 `.table-wrap`
- 禁止 `<html>/<head>/<body>/<nav>/<footer>/<script>` 标签
- 图片源文件放 `media/images/<slug>/`，HTML 引用 `media/images/<slug>/<filename>`
- 生成后执行 `node build.js` 验证

调研笔记完成后，**同时派出 3 个 Review subagent**，从不同角度并行审查报告质量。

| Review Agent | 职责 | 检查文件 |
|---|---|---|
| `review-fidelity` | 保真度审查 — 事实是否准确、数据是否忠于原文 | Phase 3 重组 + 各论文原文 + 原始 survey 全文 + 已发布 survey 参考文章 |
| `review-completeness` | 完整性审查 — 覆盖是否饱满、结构是否完整 | Phase 3 重组 + HTML 文件 + survey-ledger |
| `review-html-format` | HTML 规范审查 — 组件规范、MathJax、build.js | HTML 文件 + build.js |

### 派发指令模板

```
任务：执行 <review-fidelity|review-completeness|review-html-format> 角度的调研报告质量审查。

调研领域：<domain>
Phase 3 重组文件：~/Org/roam/note/<topic>/phase3-reorganization.org
HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>.html
各论文笔记：~/Org/roam/articles/<title>.org
原始素材：~/gongshangzheng.github.io/raw/<slug>/

读取模板：
- review-fidelity：~/.agents/skills/read-article/subagents/review-fidelity.md
- review-completeness：~/.agents/skills/read-article/subagents/review-completeness.md
- review-html-format：~/.agents/skills/read-article/subagents/review-html-format.md

按模板要求逐项检查并输出报告。
```

> 注：academic-research 的 Review 模板路径与 read-article 相同（`~/.agents/skills/read-article/subagents/review-*.md`），但调用上下文独立——Review 时需同时检查 survey 整体一致性，而非仅单篇论文。

### 汇总与修复

主 agent 汇总 3 个 Review 报告，按优先级执行修复。

---

## Phase 5 Gate 条件

进入 Phase 6 前必须同时满足：

1. **三路 Review 完成**：`review-fidelity`、`review-completeness`、`review-html-format` 均已完成，不能等待中就发布。
2. **P0/P1 已修复**：所有事实错误、遗漏关键论文、引用缺失、图片不可用、**论文原图缺失或被代码绘制图替代**、HTML 构建失败、结构不完整等阻断问题均已修复。
3. **回源核验完成**：fidelity review 已回到原始论文、原始 survey 全文、reference packet、官方项目页、仓库 README 或数据集文档核对。
4. **降级记录明确**：无法核验的结论已删除或降级，不能留在最终正文中。
5. **todo 状态正确**：Phase 5 标记为 `completed`，Phase 6 标记为 `in_progress`。
6. **Review 问题已入 todo**：Review 中发现的 P2/P3 问题（非阻断性但需要跟踪）已追加到 todo，确保它们不会在后续流程中被遗忘。

---

## Phase 6 · 发布 + 邮件

### 6.1 发布到博客

在 academic-research 中，默认目标是完成 **org-roam 笔记 + HTML 成稿 + 发布准备**。
若要真正执行 `git push` 对外发布，属于高影响动作，需遵守当前会话的安全确认规则。

```bash
cd ~/gongshangzheng.github.io
node build.js
git add -A
git commit -m "post: <标题>"
git push
```

验证：`https://gongshangzheng.github.io/<slug>.html`

### 6.1b 交叉引用回链

发布后运行交叉引用回链（与 read-article Phase 9 对齐，但 academic-research 可能在一次调研中发布多篇文章，需在所有文章发布完成后统一执行一次）：

```bash
~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py
node build.js
```

### 6.2 创建文章时标记邮件通知

由 html-blog 统一控制邮件发送。在调用 capture.js 创建文章时加 `--notify`：

```bash
node ~/.agents/skills/html-blog/capture.js <slug> --notify
```

html-blog 发布流程会自动检查 frontmatter 中的 `notify` 字段并发送通知。
上游 skill **不要**自行调用 send.py。

---

## Phase 6 Gate 条件

进入 Phase 7 或结束任务前必须同时满足：

1. **构建通过**：`cd ~/gongshangzheng.github.io && node build.js` 成功。
2. **静态校验通过**：图片路径、引用闭合、`.sources data-cite-key`、MathJax、标题层级和 frontmatter 均无错误。
3. **发布边界明确**：若需要 `git push` 或邮件通知，已按当前会话安全规则处理；未获确认时只完成发布准备，不擅自 push。
4. **无残留占位**：最终 HTML 和相关 skill 文档无 TODO、TBD、占位、未实现、简化实现或不可用引用。
5. **todo 状态正确**：Phase 6 标记为 `completed`；若需要 Hub，Phase 7 标记为 `in_progress`，否则任务结束。

---

## Phase 7 · Hub 页生成与更新

`node build.js` 已自动根据文章 frontmatter 的 `categories` / `subcategory` 生成 taxonomy index（`public/categories/<cat>/<subcat>/index.html`），无需手动维护。

本步骤处理**手动维护的专题 Hub 页**（`src/pages/*-hub.html`），分两种情况：

### 情况 A：产出为多篇文章系列（≥2 篇）

1. **统一分类**：确保所有系列文章共享相同的 `subcategory` 和核心 `tags`
2. **每篇写 `sub_id`（强制）**：分类 index 页按 `sub_id` 升序排列，缺失会导致系列乱序。分配前运行 `~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/check-sub-id.py --category <分类关键词>` 确认现有编号。按阅读顺序赋值并留间隔：总览篇 `0`、第二篇 `10`、第三篇 `20`、依此类推（步长 10）。
3. **选 Hub 形态**（二选一）：
   - **形态 1（推荐，最省维护）**：让总览篇直接接管 subcategory index——给总览篇 frontmatter 加 `aliases: ["<子类别中文名>", "categories/<分类中文名>/<子类别中文名>/index"]`，build 会把总览篇内容写入该 subcategory 的 index 页。总览篇正文需包含系列目录（`table` 或 `chapter-list`，列出每篇文章与其核心问题）和指向第二篇的 `chapter-nav`。无需新建 Hub 文件。
   - **形态 2（独立中枢页）**：当需要图文导览（stats + 知识地图三视图 + period-card）时，新建独立 Hub 页：
     ```bash
     cd ~/gongshangzheng.github.io
     node ~/.agents/skills/html-blog/capture.js <topic>-hub --hub
     ```
     读取 `~/.agents/skills/html-blog/templates/hub-template.html` 填充：引论、章节目录（`chapter-list` 布局，按 `sub_id` 排序）、研究资源索引（可选）。Hub 页同样要加 `aliases` 接管 subcategory index。
4. **构建验证**：`node build.js` + git push

### 情况 B：产出为单篇文章 → 更新已有 Hub 页

1. 检查新文章的 `subcategory` 是否与某个 Hub 页匹配
2. 若匹配，在 Hub 页合适位置追加 `period-card` 链接，更新 `updated_at`
3. `cd ~/gongshangzheng.github.io && node build.js`
4. 无匹配 Hub 页则跳过

> **Hub 页别名规范**：Hub 页应将 subcategory 的 taxonomy 路径设为 alias，如 `aliases: ["图论", "categories/数学/图论/index"]`。这样 build 系统会自动将 Hub 页内容写入对应的 subcategory index 页。
```