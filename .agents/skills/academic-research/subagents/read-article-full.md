# Read-Article Full Mode Subagent

## 任务

调用 read-article SKILL 读取指定论文（**full 模式**），产出完整博客文章并发布。

用于 academic-research Phase 2 中 `core-survey` 和 `must-read-paper` 类论文——这些是最终 survey 正文的核心证据来源，需要完整 Review 和博客发布。

## 输入

- `论文`: 1 篇论文的 arXiv ID / URL 和标题（full 模式建议每篇单独分配 subagent）
- `研究领域`: 当前调研主题
- `分类信息`: categories / subcategory / sub_id（由上游 academic-research 提供）

## 执行步骤

完整执行 read-article 的 Phase 1-9：

1. **Phase 1 · 提取**：
   ```bash
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>
   ```
   一键完成 tarball 下载→解压→图片提取→WebP 转换→extraction-log 生成
2. **Phase 2 · 并行分析**：背景调研 + 引用链 + 宝藏挖掘 + 方法论
3. **Phase 3 · 综合整理**：生成 synthesis.md
4. **Phase 4 · 文章架构规划**：读取 `references/article-structure-template.md`，设计 7-Part 结构
5. **Phase 5 · HTML 撰写**：5a-5g 子阶段，生成完整 HTML
6. **Phase 6 · 三路 Review**：fidelity + completeness + html-format，回原文核查
7. **Phase 7 · 发布**：build.js + git push
8. **Phase 8 · 更新 Hub**：检查并更新对应 Hub 页
   - sub_id 分配前运行 `~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/check-sub-id.py --category <分类关键词>`
9. **Phase 9 · 交叉引用回链**：
   ```bash
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py
   ```
   自动补全 .sources 和正文中的精读链接

## 输出

- `~/gongshangzheng.github.io/raw/<slug>/`（完整素材目录）
- `~/gongshangzheng.github.io/src/pages/<slug>.html`（已发布博客）
- `~/gongshangzheng.github.io/media/images/<slug>/`（配图）
- 博客 URL：`https://gongshangzheng.github.io/<slug>.html`

## 约束

- **full 模式**：执行完整管线，包括 HTML 生成、三路 Review、博客发布、邮件通知
- 使用上游提供的 categories / subcategory / sub_id 填写 frontmatter
- sub_id 分配前必须运行 `scripts/check-sub-id.py` 确认编号不冲突
- 标题格式遵循系列规则：
  - core-survey 参考页：`<子分类>参考：survey 标题`
  - must-read-paper 精读：`<子分类>论文精读（序号）：论文名，副标题`
- 配图优先级见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`
- 发布流程见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`
- 中间文件优先写原始来源指针，不要只写缩略摘要
- 充分榨取每篇论文的信息
