# Phase 5: REVIEW — 三路并行审查 + 发布

**目标**：从多个视角审查笔记质量，确保内容完整、格式合规、发布顺畅。

**重要：审查对象是已发布的博客页面（HTML），不是中间文件。**

## Phase 5 · 三路并行 Review

HTML 初稿完成后，**同时派出 3 个 Review subagent**，从不同角度并行审查笔记质量。

| Review Agent | 职责 | 检查文件 |
|---|---|---|
| `review-fidelity` | 保真度审查 — 内容是否忠于课件原文 | HTML 文件 + 课件原文 |
| `review-completeness` | 完整性审查 — 覆盖是否饱满、字数配图是否达标 | HTML 文件 + 课件原文 |
| `review-html-format` | HTML 格式审查 — 组件规范、MathJax、build.js | HTML 文件 |

### 派发指令模板

```
任务：执行 <review-fidelity|review-completeness|review-html-format> 角度的课程笔记质量审查。

课程名称：<course_name>
章节：<chapter>
HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>.html
课件原文：<ppt/pdf 路径>
模板文件：~/.hanako/skills/course-notes/subagents/<review-name>.md

读取模板文件后，按模板要求逐项检查并输出报告。
```

### 汇总与修复

主 agent 汇总 3 个 Review 报告：
- 所有 P0（必须修复）项：主 agent 直接修复，或派补充 subagent
- P1 项：根据时间和优先级决定是否修复
- 严重问题（如核心概念错误、公式推导错误）：退回 Phase 2 或 Phase 3 补充

## 检查清单

### 保真度审查（review-fidelity）
- [ ] 核心概念是否准确
- [ ] 公式与推导是否忠于原文
- [ ] 例题解答是否准确
- [ ] 术语使用是否规范
- [ ] 课件引用是否准确

### 完整性审查（review-completeness）
- [ ] 知识点完整性
- [ ] 宝藏挖掘检查
- [ ] 字数与配图达标检查
- [ ] 外部参考检查
- [ ] HTML 格式规范检查

### HTML 格式审查（review-html-format）
- [ ] 禁止标签检查
- [ ] frontmatter 完整性
- [ ] html-blog 组件规范
- [ ] MathJax 渲染检查
- [ ] 图片组件规范
- [ ] 字数检查
- [ ] build.js 兼容性验证

## Gate 条件

完成前必须满足:

- [ ] 三路 Review 全部完成
- [ ] 所有 P0（必须修复）项已修复
- [ ] 保真度审查无严重错误项（❌）
- [ ] 完整性审查评分 ≥ B
- [ ] HTML 格式审查评分 ≥ B
- [ ] build.js 构建零失败
- [ ] 最终回复说明修改范围、来源使用情况和遗留问题

## 发布

### 发布到博客

```bash
cd ~/gongshangzheng.github.io
node build.js
git add -A
git commit -m "post: <标题>"
git push
```

验证：`https://gongshangzheng.github.io/<slug>.html`

### 创建文章时标记邮件通知

由 html-blog 统一控制邮件发送。在调用 capture.js 创建文章时加 `--notify`：

```bash
node ~/.hanako/skills/html-blog/capture.js <slug> --notify
```

html-blog 发布流程会自动检查 frontmatter 中的 `notify` 字段并发送通知。
上游 skill **不要**自行调用 send.py。

## 如果 Review 发现缺口

主 agent 根据 Review 结果补充：
- P0 项：直接修复或派补充 subagent
- 严重缺口（如核心概念错误）：回退到 Phase 2 或 Phase 3 补充
- 轻微缺口（如格式问题）：直接修复
