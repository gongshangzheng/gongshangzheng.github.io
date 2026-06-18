---
name: 论文解读 full 写作必须主 agent 亲自核验
description: 写博客论文解读时 subagent 易跑偏，主 agent 必须逐篇逐项核验后才发布
type: feedback
createdAt: 2026-06-04T17:34:00
---
写 full 模式论文解读 HTML 时，不要把整篇外包给单个写作 subagent 后直接信任其自报结果；主 agent 必须在发布前对每篇逐项核验：字数≥2500、display 公式≥2、含数值对比表≥1、每张配图 `ls` 验证存在且非 PDF（PDF 必须先转 PNG）、图片放 `media/images/<slug>/` 而非 `assets/media`、`#key#` 与底部 `data-cite-key` 数量闭合、骨架演示内容已被真实正文替换。

**Why:** 第一批 3 篇（Wav2Lip/SadTalker/VASA-1）外包 subagent 后出现：SadTalker 用 create_file 覆盖已存在文件失败→正文仍是 capture.js 演示骨架（仅 661 字、残留 nobunaga.jpg）；图片下到 assets/media（违规路径）；SadTalker 配图是 .pdf 浏览器全损；VASA-1 解错 tarball 混入 dmd 论文污染图。subagent 自报"完成"但实际不达标。

**How to apply:** 论文解读改由主 agent 亲自写/改正文与核验。capture.js 骨架已存在的文件必须用 file_replace 编辑，禁止 create_file。配图优先 arXiv source tarball，解包后必须核对 arxiv id 防止拿错论文的图；PDF 图用 sips 转 PNG 再引用。
