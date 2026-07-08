# Read-Article Collect Mode Subagent

## 任务

调用 read-article SKILL 读取指定论文（collect 模式）。

## 输入

- `论文列表`: 1-3 篇论文的 arXiv ID 和标题
- `研究领域`: 当前调研主题

## 执行步骤

对每篇论文：
1. 生成 slug
2. 执行 Phase 1（提取）：
   ```bash
   ~/.venv/bin/python3 ~/gongshangzheng.github.io/scripts/fetch-arxiv-paper.py <arxiv-id> --slug <slug>
   ```
   一键完成 tarball 下载→解压→图片提取→WebP 转换→TeX→Markdown→extraction-log 生成。若 tarball 不可用，回退到 arXiv HTML → PDF Docling + `pdftotext -layout`。不得只用 abstract、搜索片段或项目页简介替代全文
3. 执行 Phase 2（并行分析）：背景调研 + 引用链 + 宝藏挖掘 + 方法论
4. 执行 Phase 3（综合整理）：生成 synthesis.md
5. 执行 Review：检查质量，补充缺口

## 输出

每篇论文产出：
- `~/gongshangzheng.github.io/raw/<slug>/`（完整素材目录：sources/ + subagents/ + synthesis.md）

## 约束

- collect 模式：默认不执行最终主文 HTML、博客发布、邮件发送，不产出 org-roam 笔记；但若上游标记为 `core-survey-reference`，需要配合 academic-research 生成可构建的 HTML 参考材料
- 中间文件优先写原始来源指针：`file_path:start_line-end_line`、source/HTML/PDF URL、章节标题、figure/table 编号、公式编号；不要只写缩略摘要
- 不限制任何 subagent 的输出长度，但应避免复制整篇原文；长内容用指针回源
- 充分榨取每篇论文的信息
- 只修改 raw/ 目录下的文件，除非上游明确要求生成核心 survey HTML 参考材料
- collect 模式不执行 check-sub-id.py 和 cross-link.py（这些是 full 模式 Phase 8-9 的步骤）