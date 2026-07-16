---
name: historical-narrative
description: |
  调研一段历史事件/时期，按编年叙事风格产出 org-roam 笔记、图文 HTML 页面和发布链接。
  用于"讲讲 XX 历史""事件来龙去脉""朝代兴亡""战争始末"等任务。
  触发词：讲讲历史、事件来龙去脉、战争始末、朝代兴亡、历史叙事、编年体。

  注意：纯学术综述用 academic-research；单篇论文/文章解读用 read-article；
  轻量闲聊式历史问答直接回答即可。
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Historical Narrative — 历史叙事

历史叙事技能。用于把一个历史事件、时期、人物或主题写成有时间线、有场景、有人物、有来源的编年体故事。

> **前置 · 库内检索（必做）**：开始生成前，先按 [`blog-rules/references/pre-generation-search.md`](../blog-rules/references/pre-generation-search.md) 做库内检索——判断是新建、扩充已有文章、还是接力草稿，并收集关联文章供正文交叉引用。跳过此步导致重复创作是典型错误。

## 何时使用

**使用**：
- "讲讲 XX 事件的来龙去脉"
- "整理 XX 战争/运动/朝代的始末"
- "写一篇历史故事风格文章"
- "调查一段历史并做成 HTML 博客"

**不要使用**：
- 纯学术综述 → `academic-research`
- 单篇论文/文章解读 → `read-article`
- 轻量闲聊式历史问答 → 直接回答

## 输出

默认完整产出：
1. org-roam 编年体笔记
2. `~/gongshangzheng.github.io/src/pages/<slug>.html`
3. 图片，优先真实历史图
4. 可选背景音乐
5. 发布到博客
6. 邮件发送文章 URL

如果用户只要口头讲述，不执行发布链路。

## 共享引用

| 引用文件 | 内容 | 何时读取 |
|---------|------|---------|
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md` | sub_id、Hub 页、编号规则 | 规划系列文章或更新 Hub 时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md` | 配图来源优先级（历史场景：真实照片 > Wiki > AI） | 配图时 |
| `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md` | 发布流程、验证清单、邮件通知 | 发布时 |

## 路由决策

| 任务阶段 | 读取文件 |
|---|---|
| 搜集史料、分派 subagent | `phases/research.md` + `templates/subagent-prompt.md` |
| 结构规划 | `phases/article-structure.md` |
| 创建 org-roam 笔记 | `phases/org-note.md` |
| 写 HTML 正文 | `~/.agents/skills/html-blog/SKILL.md`（HTML 语法规范） + `checks/coverage.md` |
| 配图/音乐 | `phases/media.md` |
| 验证/发布/邮件 | `phases/publish.md` + `checks/final-checklist.md` |
| 需要旧版完整说明 | `reference/original-full.md` |

## 标准流程

1. 确认用户要的是完整发布，还是只要叙事回答
2. 做初步搜索，确定时间线和分段
3. **创建 todo 清单**，列出所有步骤
4. 读取 `phases/research.md`，按时间段分派 subagent
5. 主动轮询 subagent 结果
6. **Review 阶段**：
   - 对照 `checks/final-checklist.md` 检查是否有遗漏的时间段和失败 subagent
   - **同时派出 3 个 Review subagent**：
     | Review Agent | 职责 | 模板 |
     |---|---|---|
     | `review-fidelity` | 史实真实性审查 | `reviewers/review-fidelity.md` |
     | `review-completeness` | 叙事完整性审查 | `reviewers/review-completeness.md` |
     | `review-html-format` | HTML 规范审查 | `reviewers/review-html-format.md` |
   - 汇总结果，按优先级修复后才进入下一步
7. **结构规划**：读取 `phases/article-structure.md`，设计 3 种章节方案，推荐其一，用户确认后输出结构图
8. 读取 `phases/org-note.md` 创建结构化笔记
9. 读取 `checks/coverage.md` 做素材覆盖清单
10. 读取 `html-blog` SKILL 写 frontmatter + 裸正文 HTML
11. 读取 `phases/media.md` 搜真实图，必要时少量 AI 生成图/音乐
12. 读取 `phases/publish.md` 验证、发布、发送 URL 邮件
13. 更新 Hub 页：检查并更新对应的枢纽页
14. 用 `checks/final-checklist.md` 做最终检查

## 硬规则

- **必须调用 capture.js**：文章创建必须走 `node ~/.agents/skills/html-blog/capture.js <slug> --notify`，禁止徒手写 frontmatter
- **每步执行前先读对应文档**，不要跳过读取步骤
- 开始执行前先创建 todo 清单
- Review 阶段：所有 subagent 结束后，对照 `checks/final-checklist.md` 检查是否有遗漏、失败或跳过步骤
- Subagent 和中间素材不要写入 `~/Org/roam/` 根目录
- 先写正文，再做图片和音乐
- 真实历史图片优先，AI 图最多 2 张（详见 `phases/media.md`）
- HTML 只能是 frontmatter + 裸正文，不写完整 HTML 外壳
- 文末必须有正规参考来源块
- 不得为了压缩篇幅删除核心场景、日期、数字和引语
- 所有 subagent resolved 后才写 HTML，不要提前写
- **重要事实性句子必须显式带引用**：至少覆盖年份、日期、地名、人物任职/行动、战役结果、法令、统计数字、引语出处、史学争议所依赖的事实节点
- fidelity review 时，**必须回到原始史料或最接近原始的一手来源核对**；若只能使用二手史学著作，也要明确其身份
