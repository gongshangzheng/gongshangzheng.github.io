# Phase 5: REVIEW — 三路并行审查 + 发布

**目标**：从多个视角审查报告质量，确保内容完整、格式合规、发布顺畅。

## Phase 5 · 三路并行 Review

报告完成后，**同时派出 3 个 Review subagent**，从不同角度并行审查报告质量。

| Review Agent | 职责 | 检查文件 |
|---|---|---|
| [[subagents/review-fidelity.md][review-fidelity]] | 保真度审查 — 事实是否准确、数据是否忠于原文 | 笔记文件 + 原始素材 |
| [[subagents/review-completeness.md][review-completeness]] | 完整性审查 — 覆盖是否饱满、结构是否完整 | 笔记文件 + HTML 文件 |
| [[subagents/review-html-format.md][review-html-format]] | HTML 规范审查 — 组件规范、MathJax、build.js | HTML 文件 + build.js |

### 派发指令模板

```
任务：执行 <review-fidelity|review-completeness|review-html-format> 角度的调研报告质量审查。

调研主题：<title>
Slug：<slug>
笔记文件：~/Org/roam/note/<title>.org
HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>.html
原始素材：~/gongshangzheng.github.io/raw/<slug>/
模板文件：~/gongshangzheng.github.io/.agents/skills/deep-research/subagents/<review-name>.md

读取模板文件后，按模板要求逐项检查并输出报告。
```

### 原有编辑审查 + 伦理审查

原有 `agents/` 目录下的编辑审查（editor_in_chief_agent）、伦理审查（ethics_review_agent）、Devil's Advocate 照常执行，与三路 Review 并行，构成双重保障。

### 汇总与修复

主 agent 汇总 3 个 Review 报告：
- 所有 P0（必须修复）项：主 agent 直接修复，或派补充 subagent
- P1 项：根据时间和优先级决定是否修复
- 严重问题（如数据伪造、核心逻辑错误）：退回 Phase 3 或 Phase 2 补充

---

## Phase 6 · 发布 + 邮件

### 6.1 发布到博客

```bash
cd ~/gongshangzheng.github.io
node build.js
git add -A
git commit -m "post: <标题>"
git push
```

验证：`https://gongshangzheng.github.io/<slug>.html`

### 6.2 创建文章时标记邮件通知

由 html-blog 统一控制邮件发送。在调用 capture.js 创建文章时加 `--notify`：

```bash
node ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js <slug> --notify
```

html-blog 发布流程会自动检查 frontmatter 中的 `notify` 字段并发送通知。
上游 skill **不要**自行调用 send.py。
```

---

**如果 Review 发现缺口**：主 agent 根据 Review 结果补充。如缺口较大，回退到 Phase 3 或 Phase 2 补充。