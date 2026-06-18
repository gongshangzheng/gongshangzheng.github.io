---
name: feedback_academic_read_article_pipeline_defaults
description: academic-research/read-article 必须建 todo、分配 subagents、默认博客交付，并使用 source-first 提取和指针化中间文件
type: feedback
createdAt: 2026-06-08T17:26:21
---
运行 academic-research 或 read-article 时，必须创建阶段性 todo；academic-research 必须明确 subagent 分工；除非用户明确要求只侦察/只 collect/不生成博客，默认交付应推进到可构建 HTML 博客源文件与发布准备。论文全文和配图提取优先级必须是 arXiv source/LaTeX 源文件，其次 arXiv/官方 HTML，最后才是 PDF Docling + pdftotext。中间文件应优先使用原始文件、上层中间文件、章节、figure/table、行号或 URL anchor 指针，避免层层扁平摘要；但最终博客/HTML 正文必须把这些指针转写为真正的解释、论证说明、引用和图片 caption，不能把 raw 路径、行号、ledger 路径或 figure pointer 当正文。Academic-research 的 survey 流程应扁平化：保留 paper/reference packets、单一 survey-spine、最终 HTML；核心 survey 深读必须形成 survey ledger/reference packet，并默认发布为单独公开 HTML 参考页。重要论文必须标为 must-read-paper，完成 read-article 并默认发布为独立论文精读 HTML；最终 survey 正文仍要对每篇 must-read-paper / route-representative 做简要论述，不能只放表格或参考文献。重要论文核心图片必须进入最终 survey 辅助理解；最终 HTML 中 `<img>` / 合法图像 shortcode 少于 3 张时视为未完成，不得靠文字说明替代。最终产物必须是由浅入深、结构化的 survey，先讲清领域问题，再展开任务 taxonomy、技术路线 taxonomy、方法矩阵、时间线和开放问题，并检查字数门槛、标题层级和图片数量，禁止全篇平铺同一级标题。

Why: 用户多次反馈 academic-research 停在论文池或中间材料、缺少博客交付；source/HTML 通常包含更完整的 LaTeX 结构、caption、表格和原始图片；扁平化中间文件会让后续阶段只读缩略材料而丢失原始信息。

How to apply: 触发 academic-research/read-article 时先建 todo 并记录目标 slug/HTML/raw/source 状态/subagents；派 subagent 前写清 Phase、输入、输出和禁止事项；提取阶段按 source → HTML → PDF fallback 执行；Phase 2 建立论文重要性标签和发布账本；Phase 3/4/Review 必须沿指针回读原始来源；只在用户明确限定时停止在 collect 或侦察阶段。做 survey 时以 survey-spine 作为唯一结构底稿，禁止把参考 HTML、三份 reorg 或论文摘要拼接成最终文章；Review 必须拦截未发布 must-read 论文、未在正文论述的重要论文，以及最终 HTML 图片数不足 3 或 must-read 论文核心图缺失。