---
name: SVG 配图存量文章整改清单
description: 12 篇用手绘 generated SVG 当配图的历史文章清单，低优先级整改项（替换为论文原图或 Mermaid/JSXGraph）
type: insight
createdAt: 2026-06-05T09:45:00
---
12 篇历史文章仍用手绘 generated SVG 作为正文配图（架构图/流程图/结果图）。路径已合规（均为 `media/images/<slug>/`），但 SVG 内容违反 `feedback_no_generated_svg.md`（不再生成 SVG，优先论文原图 / Mermaid / JSXGraph / 表格）。

**清单（slug — SVG 配图数）**：
- `gan-research-2026` — 4（gan-minimax / application-map / stability-toolkit / gan-timeline）
- `glip-2022` — 3（glip-unification / glip-fusion / glip-results）
- `siglip-2023` — 3（siglip-loss / siglip-scaling / siglip-results）
- `blip2-2023` — 3（blip2-qformer / blip2-two-stage-local / blip2-results）
- `blip-2022` — 3（blip-med / blip-capfilt / blip-results）
- `llava-2023` — 3（llava-pipeline / llava-data / llava-results）
- `flamingo-2022` — 3（flamingo-pipeline / flamingo-data / flamingo-results）
- `gan-stability-theory-2026` — 2（复用 gan-research-2026 的 gan-minimax / stability-toolkit）
- `gan-practical-training-2026` — 1
- `gan-high-fidelity-generation-2026` — 1
- `gan-conditional-applications-2026` — 1
- `ml-visualized-notes` — 1

**Why**：这些文章发布于"不再生成 SVG"规范确立之前，SVG 是手绘示意图，可信度与观感低于论文原图；GAN 系列多篇共享同一批 SVG。

**How to apply**：作为低优先级整改项，按 read-article/image-search 流程逐篇用 arXiv tarball 原图替换架构/结果类 SVG，流程/数学示意类可改 Mermaid 或 JSXGraph。整改一篇即从本清单移除一篇。不要一次性批量重做，工作量大，放在数字人系列等高优先级任务之后。
