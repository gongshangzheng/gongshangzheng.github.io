---
name: blog_media_paths
description: 博客图片放 media/images/<slug>/，视频放 media/videos/<slug>/；禁止放 assets/media 或把视频放 images 目录。
type: feedback
createdAt: 2026-06-04T11:00:20
---
博客图片源文件放在仓库根目录 `media/images/<slug>/`，HTML 中使用 `media/images/<slug>/<filename>` 引用。博客视频源文件放在 `media/videos/<slug>/`，HTML 或 shortcode 中使用 `media/videos/<slug>/<filename>` 引用。不要把图片或视频放到 `src/assets/media/`、`assets/media/` 或 `public/assets/media/`；也不要把视频放进 `media/images/`。

Why: 用户明确要求统一使用 `media/images/<slug>/` 作为博客配图路径，并进一步要求视频文件应放进 `media/videos/`。构建系统会将整个 `media/` 复制到 `public/media/`，预览服务器支持 `.mp4` 和 `.webm`。

How to apply: 写博客、论文解读、课程笔记或调研文章需要本地化图片时，创建图片目录用 `media/images/<slug>/`，正文 `<img>` 路径写 `media/images/<slug>/<filename>`；需要本地化视频时，创建视频目录用 `media/videos/<slug>/`，正文 `<video>` 或 `{{< video >}}` 路径写 `media/videos/<slug>/<filename>`。构建后确认没有 `public/assets/media`，也不要在 `media/images/` 下残留视频文件。