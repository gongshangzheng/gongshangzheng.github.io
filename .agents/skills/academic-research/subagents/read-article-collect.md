# Read-Article Collect Mode Subagent

## 任务

调用 read-article SKILL 读取指定论文（collect 模式）。

## 输入

- `论文列表`: 1-3 篇论文的 arXiv ID 和标题
- `研究领域`: 当前调研主题

## 执行步骤

对每篇论文：
1. 生成 slug
2. 执行 Phase 1（素材获取）：
   ```bash
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/.agents/skills/read-article/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>
   ```
   一键完成 tarball 下载→解压→图片提取→WebP 转换→TeX→Markdown→extraction-log 生成。若 tarball 不可用，回退到 arXiv HTML → PDF Docling + `pdftotext -layout`。不得只用 abstract、搜索片段或项目页简介替代全文
3. 执行 Phase 2（按需分析）：按论文复杂度选 direct / assisted / deep；survey/长文建议启用 background + methodology + experiment + citation lane
4. 执行 Phase 3（synthesis 导航索引）：生成 `raw/<slug>/synthesis.md`（仅索引，不复制内容）
5. 自查：检查质量，补充缺口（collect 不进入 Phase 4 的 planning draft）

## 输出

每篇论文产出：
- `~/gongshangzheng.github.io/raw/<slug>/`（完整素材目录：sources/ + analysis/ + synthesis.md）

## 约束

- collect 模式：默认不执行最终主文 HTML、博客发布、邮件发送，不产出 org-roam 笔记；也不得写入 `src/pages/`。若上游需要可构建的 HTML 参考材料（如 `core-survey-reference`），应改用 read-article `full` 模式，走上游已批准 change 的审批路径
- 中间文件优先写原始来源指针：`file_path:start_line-end_line`、source/HTML/PDF URL、章节标题、figure/table 编号、公式编号；不要只写缩略摘要
- 不限制任何 subagent 的输出长度，但应避免复制整篇原文；长内容用指针回源
- 充分榨取每篇论文的信息
- 只修改 raw/ 目录下的文件；collect 模式不得生成 `src/pages/` 下的 HTML（需要 HTML 时改用 full 模式）
- collect 模式不执行 check-sub-id.py 和 cross-link.py（这些是 full 模式 Phase 8 的步骤）