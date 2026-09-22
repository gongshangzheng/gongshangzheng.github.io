# Read-Article Full Mode Subagent

## 任务

调用 read-article SKILL 读取指定论文（**full 模式**），产出完整博客文章并发布。

用于 academic-research Phase 2 中 `core-survey` 和 `must-read-paper` 类论文——这些是最终 survey 正文的核心证据来源，需要完整 Review 和博客发布。

## 输入

- `论文`: 1 篇论文的 arXiv ID / URL 和标题（full 模式建议每篇单独分配 subagent）
- `研究领域`: 当前调研主题
- `分类信息`: categories / subcategory / sub_id（由上游 academic-research 提供）

## 执行步骤

按 read-article 新流程执行（详见 `read-article/SKILL.md`）：

1. **Phase 1 · 素材获取**：
   ```bash
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/.agents/skills/read-article/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>
   ```
   一键完成 tarball 下载→解压→图片提取→WebP 转换→extraction-log 生成
2. **Phase 2 · 按需分析**：按论文复杂度选 direct / assisted / deep；需要时启用 background / citation / experiment / methodology / terminology / code-analysis / image-collection lane
3. **Phase 3 · synthesis 导航索引**：生成 `raw/<slug>/synthesis.md`（仅索引，不复制内容）
4. **Phase 4 · planning draft**：生成 `raw/<slug>/planning-draft.md`，设计 7-Part 结构。
   被 academic-research 批量调用时，若上游主题 change 已获用户批准，此处不再单独要求用户确认，
   按上游已批准结构拆出单篇小节草案即可
5. **Phase 5 · 固化 change + 确认**：用户确认 draft 后建/更新 change，固化「文章内容大纲」（上游已有已批准 change 时以上游审批为准）
6. **Phase 6 · HTML 写作**：由主 agent 统一撰写完整 HTML
7. **Phase 7 · 统一审校**：保真度 / 完整性 / HTML 规范三维度，按需委派 Review lane
8. **Phase 8 · 发布与维护**：build.js + 发布；更新 Hub 页
   - sub_id 分配前运行 `~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/check-sub-id.py --category <分类关键词>`
   - 交叉引用回链：
     ```bash
     ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/cross-link.py
     ```

## 输出

- `~/gongshangzheng.github.io/raw/<slug>/`（完整素材目录）
- `~/gongshangzheng.github.io/src/pages/<slug>.html`（已发布博客）
- `~/gongshangzheng.github.io/media/images/<slug>/`（配图）
- 博客 URL：`https://gongshangzheng.github.io/<slug>.html`

## 约束

- **full 模式**：执行完整管线，包括 planning draft、change 固化、HTML 生成、统一审校、博客发布、邮件通知
- 使用上游提供的 categories / subcategory / sub_id 填写 frontmatter
- sub_id 分配前必须运行 `scripts/check-sub-id.py` 确认编号不冲突
- 标题格式遵循系列规则：
  - core-survey 参考页：`<子分类>参考：survey 标题`
  - must-read-paper 精读：`<子分类>论文精读（序号）：论文名，副标题`
- 配图优先级见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md`
- 发布流程见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`
- 中间文件优先写原始来源指针，不要只写缩略摘要
- 充分榨取每篇论文的信息
