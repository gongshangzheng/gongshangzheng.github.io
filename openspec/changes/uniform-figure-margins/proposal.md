# Proposal: 统一图片留白

## Why

全站配图来自论文原图、截图、手工裁切，四周留白完全随机：有的图零留白顶到卡片边缘，有的图四周空出一大圈（`aeic-shallow-encoder-2026/distill.webp` 可裁掉 66% 高度，`paper-performrecast/enhancement.webp` 可裁掉 56% 宽 + 59% 高）。阅读同一篇文章时，图的视觉重量忽大忽小，图注与图形之间的距离也在跳。

上一轮 `site-performance-optimization` 已把超限图降采样，并让 7 张存量超限留白被裁掉；但裁完只是「都变紧」，并未「都一致」。本次把留白归一：每张图裁到内容边界后，再补出同一档留白。

## What Changes

- 新增 `scripts/normalize-image-margins.py`：对 `media/` 中被页面引用的静态图片执行「裁到内容边界 → 补统一留白 → 长边 ≤4000px」三步归一，输出覆盖原文件；原图仍备份在 gitignored 的 `raw/media-originals/`。
- 归一后的留白按**渲染尺寸**统一：因为正文图以容器宽度（752px）铺满显示，留白取源图宽度的 3%，换算到屏幕约 22px，四边一致。
- 补白颜色取每张图自身检测到的背景色（沿用 `scripts/convert-figures.py:crop_whitespace` 的背景检测），不写死白色。
- 跳过：动态 WebP（演示动画，逐帧补白无意义且会掉帧）、SVG（矢量自适应）、以及未被任何页面引用的图片。
- 派生档（`.w960` / `.w1600`）随归一后的源图重新生成，因此各档留白比例一致。
- `check-figure-whitespace.py` 的门禁阈值不变：归一后每张图的可裁留白为 3%，远低于 20% 上限。

## Capabilities

### New Capabilities

- `figure-presentation`: 正文配图的留白与尺寸呈现规则——统一留白比例、补白颜色必须匹配图片自身背景、动态图与矢量图豁免，以及归一结果可被构建期门禁校验。

### Modified Capabilities

（无。`site-performance` 的体积预算与响应式要求不变，归一后的图仍需满足单图 ≤2MB、`srcset` 与尺寸标注要求。）

## Impact

- 新增 `scripts/normalize-image-margins.py`。
- `media/images/**` 中约 1700 个被引用图片被重新编码（内容边界变化 + 四周补白）；体积预计小幅增加（均匀区域压缩率高，估算 +3~8%）。
- `package.json` 增加 `images:normalize` 脚本；`docs/PERF-BASELINE.md` 追加一节记录归一前后的体积与留白分布。
- 不改：文章正文、frontmatter、CSS（`.photo` 卡片间距不动，避免双层留白）、URL、派生档逻辑。
- 不回滚上一轮性能改动。
