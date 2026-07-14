---
name: media-cleanup
description: |
  清理 gongshangzheng.github.io 中未引用的媒体文件，并压缩仍在使用的 PDF 和视频。
  包括：检测未使用媒体、删除未引用文件、PDF Ghostscript 压缩、视频 AV1 转码、
  生成清理报告。默认 dry-run，必须加 --apply 才会真正执行删除/压缩。
  触发词：清理媒体、media cleanup、remove unused media、compress pdf、compress video、
  未引用媒体、媒体瘦身。
metadata:
  default-enabled: true
---

## 用途

本 skill 用于维护 `gongshangzheng.github.io` 的媒体资产：
- 找出 `media/` 下没有被任何页面引用的文件（图片、PDF、视频）。
- 删除确认不再使用的媒体文件。
- 压缩仍在使用的 PDF（Ghostscript `/screen` 72 DPI）和视频（AV1 / libsvtav1）。
- 最后可配合 `git filter-repo` 从 Git 历史中彻底清除大文件。

## 安全规则

1. **默认 dry-run**：所有脚本不带 `--apply` 时只输出报告，不会删除或覆盖任何文件。
2. **备份**：执行 `--apply` 前，脚本会自动创建 Git 分支 `cleanup-media-backup-YYYYMMDD`。
3. **不误删**：只有扫描器明确标记为 *unreferenced* 的文件才会被删除；扫描器会处理 shortcode、wiki 语法、HTML 标签、frontmatter 等多种引用方式。
4. **压缩替换原则**：PDF/视频压缩后先生成临时文件，验证有效且体积更小后才替换原文件。

## 文件结构

```
.agents/skills/media-cleanup/
├── SKILL.md
└── scripts/
    ├── find-unreferenced-media.js   # 核心：扫描引用，列出未使用/缺失/遗留引用
    ├── cleanup-pdfs.js              # 删除未引用 PDF + 压缩已引用 PDF
    ├── cleanup-videos.js            # 删除未引用视频 + AV1 压缩已引用视频
    └── run-cleanup.js               # 编排：扫描 → PDF → 视频 → 报告
```

## 用法

```bash
# 1. 扫描（dry-run，只报告）
node .agents/skills/media-cleanup/scripts/find-unreferenced-media.js

# 2. 清理 PDF（dry-run）
node .agents/skills/media-cleanup/scripts/cleanup-pdfs.js

# 3. 清理视频（dry-run）
node .agents/skills/media-cleanup/scripts/cleanup-videos.js

# 4. 一键执行全部（dry-run）
node .agents/skills/media-cleanup/scripts/run-cleanup.js

# 5. 真正执行（会删除/覆盖文件，请先确认 dry-run 输出）
node .agents/skills/media-cleanup/scripts/run-cleanup.js --apply
```

## 引用检测范围

扫描器会读取以下源文件中的媒体引用：
- `src/pages/*.html`
- `src/pages/*.md`
- `drafts/`（递归）
- `README.md`、`config.json`、`data/`（可选）

支持的引用模式：
- PDF shortcodes：`{{< docpage "..." >}}`、`docpages`、`docref`、`pdf`、`ppt`
- Video shortcode：`{{< video "..." >}}`
- HTML：`<img src="...">`、`<video src="...">`、`<source src="...">`、`<a href="...">`
- Wiki image：`![[file | width # caption]]`
- Frontmatter：`hero_image` 等字段
- 路径形式：`media/images/...`、`/media/images/...`、`media/pdf/...`、`media/videos/...`

## 清理后验证

执行 `--apply` 后必须运行：

```bash
npm test
npm run build
```

确认无 broken link、无构建错误后，再提交并考虑用 `git filter-repo` 清理历史。

## Git 历史瘦身（可选）

在工作区清理并提交后，可用 `git filter-repo` 把删除的媒体文件从历史中彻底清除：

```bash
# 示例：删除多个路径
# git filter-repo --path media/pdf/old.pdf --path media/videos/old.mp4 --invert-paths
# git reflog expire --expire=now --all
# git gc --prune=now --aggressive
```

注意：这会改写提交哈希，需要 `git push --force`。

## 相关 Skill

- `.agents/skills/compress-pdf/` — PDF 压缩参数详细说明
- `.agents/skills/compress-video/` — 视频压缩参数详细说明
- `scripts/convert-videos-to-av1.js` — 视频 AV1 转码实现参考
