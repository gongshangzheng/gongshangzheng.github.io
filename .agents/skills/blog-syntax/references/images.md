# 图片规则

> 本文档由 html-blog SKILL.md 拆分而来。处理图片时按需读取。

---

## 配图策略（优先级顺序）

1. **用户笔记/当前会话中已放入的截图或图片** — 最高优先级：如果用户已经把截图放在笔记、附件、session files 或指定目录中，应优先使用这些图。
2. **GitHub 仓库中的图片** — 高优先级：论文官方 GitHub / 项目 README / docs / assets / figures 中的图片可直接使用，通常比 PDF 裁图清晰。必须下载到本地，禁止 hotlink。
3. **学术论文原图** — 高优先级：arXiv source tarball 原始 figure → arXiv HTML/官方项目页原图 → 300-400 DPI PDF crop。禁止使用 Docling `_artifacts` 作为最终配图。
2. **网络搜索真实公版图片** — 次选（Wikimedia Commons 等）
3. **AI 生成演示性图片** — 仅当找不到合适素材且文章**非学术类**时使用，单篇 ≤3 张。**学术类文章（论文解读、研究综述、调研报告等）禁止使用 AI 生成图片**
4. **Emoji / CSS 渐变占位** — 兜底方案

---


## 学术图像质量门槛

- Docling `_artifacts/`、`temp-docling-images/` 中的图片禁止作为最终 HTML/blog 配图。
- 学术论文图优先级：用户笔记/会话中已有截图或图片 → GitHub 官方仓库图片 → arXiv source tarball → arXiv HTML/官方项目页原图 → PDF 高 DPI crop。
- 只有拿不到原图时，才使用 PDF 高 DPI crop；推荐 300-400 DPI。
- 最终图片宽度建议 ≥ 1200 px；重建对比图、曲线图、架构图低于 1200 px 时必须重新提取。
- 如果只存在 Docling 图片，应停止插图步骤并重新提取，不要把低清图发布。

## 来源验证

**绝不可以猜测图片文件名或 URL。** 引用前必须：
1. 在浏览器中手动打开 URL 确认存在
2. 或用 `web_search`（或 GLM 联网搜索 MCP，参考 web-search skill）/ `web_fetch` 验证 URL 可返回 200 OK

**Wikimedia Commons 缩略图只允许以下标准尺寸：**
`20px, 40px, 60px, 120px, 250px, 330px, 500px, 960px, 1280px, 1920px, 3840px`

---

## 图片处理流程

每次生成 HTML 时，必须执行以下步骤：

```bash
SLUG="<slug>"

# 1. 复制图片：只从 raw/<slug>/images/<slug>/ 复制最终高质量图
#    注意：该目录不得包含 Docling _artifacts 低清截图
mkdir -p ~/gongshangzheng.github.io/src/assets/media/images/${SLUG}/
cp ~/Org/roam/raw/${SLUG}/images/${SLUG}/* \
   ~/gongshangzheng.github.io/src/assets/media/images/${SLUG}/ 2>/dev/null || true

# 2. 确认文件名（实际文件名决定 HTML 中的引用路径）
ls ~/gongshangzheng.github.io/src/assets/media/images/${SLUG}/

# 3. HTML 中的图片路径必须与实际文件名完全一致
#    只使用真实存在的文件，不要编造文件名
```

---

## 本地化

所有图片必须下载到 `~/gongshangzheng.github.io/src/assets/media/images/`，HTML 中使用 `assets/media/images/<filename>` 路径引用。**禁止**在 HTML 中引用远程 URL。
