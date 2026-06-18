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
- 只有拿不到原图时，才使用 PDF 高 DPI crop；推荐 300-400 DPI。**当前工作机专属**：可用 `~/.venv` + `PyMuPDF` 导出指定 PDF 页或局部截图，再用 `read_file` 视觉检查；其他机器需先检查 `pdftoppm` / 视觉 MCP / PDF 渲染工具是否可用。
- 最终图片宽度建议 ≥ 1200 px；重建对比图、曲线图、架构图低于 1200 px 时必须重新提取。
- 如果只存在 Docling 图片，应停止插图步骤并重新提取，不要把低清图发布。

## 图片格式：WebP 是唯一允许格式

**博客所有图片必须使用 WebP 格式。** PNG、JPG、PDF 文件不得存在于 `media/images/` 中。`build.js` 会在构建时自动转换遗漏的非 WebP 文件，但最佳实践是在插入文章前就完成转换。

### 转换命令

```bash
# PNG/JPG → WebP（大图有损 Q80，小图 < 50KB 无损）
cwebp -q 80 input.png -o output.webp
cwebp -lossless small.png -o small.webp

# PDF → WebP（经 PNG 中转，200 DPI）
pdftoppm -png -r 200 -singlefile input.pdf /tmp/tmp_convert
cwebp -q 80 /tmp/tmp_convert.png -o output.webp
rm /tmp/tmp_convert.png
```

## 学术论文配图：PDF 原始文件与 WebP 转换策略

**arXiv source tarball 中的原始 PDF figure 是最优质来源，但 `<img>` 标签无法在浏览器中渲染 PDF。** 因此实际操作策略是：保留原始 PDF 文件作为存档，同时转成高分辨率 WebP 用于博客展示。

### 理由
- PDF 是矢量格式，无损缩放，作为存档最合适
- 但 **浏览器的 `<img>` 标签不支持 PDF 渲染**——只有 `<object>`、`<iframe>` 或 PDF.js 才能显示 PDF
- 博客的 `<div class="photo">` 组件使用 `<img>` 标签，因此必须提供 WebP 格式

### 操作流程

```bash
SLUG="<slug>"

# 1. 下载 arXiv source tarball
curl -sL "https://arxiv.org/e-print/<arxiv-id>" -o /tmp/${SLUG}-source.tar.gz

# 2. 解压
mkdir -p /tmp/${SLUG}-source
tar xzf /tmp/${SLUG}-source.tar.gz -C /tmp/${SLUG}-source

# 3. 找到论文配图（通常在 figures/ 或 fig/ 目录下）
find /tmp/${SLUG}-source -name "*.pdf" -o -name "*.png" -o -name "*.eps" | sort

# 4. 复制原始文件到媒体目录（保留 PDF 作为存档）
cp /tmp/${SLUG}-source/fig/<figure>.pdf \
   ~/gongshangzheng.github.io/media/images/${SLUG}/

# 5. 将 PDF 转为高分辨率 WebP（推荐宽度 ≥ 1600px）
pdftoppm -png -r 200 -singlefile \
   ~/gongshangzheng.github.io/media/images/${SLUG}/<figure>.pdf \
   /tmp/${SLUG}_figure
cwebp -q 80 /tmp/${SLUG}_figure.png \
   -o ~/gongshangzheng.github.io/media/images/${SLUG}/<figure>.webp
rm /tmp/${SLUG}_figure.png

# 6. 删除 PDF 原件（存档可选，但博客不保留 PDF 图片）
rm ~/gongshangzheng.github.io/media/images/${SLUG}/<figure>.pdf
```

### HTML 引用

始终引用 WebP 文件：

```html
<div class="photo">
  <img src="media/images/<slug>/pipeline.webp" alt="架构图" loading="lazy">
  <div class="cap">图 N：说明（来源：论文 Fig.X）</div>
</div>
```

### 注意事项
- **`<img>` 标签不能引用 PDF 文件**——浏览器不会渲染，会显示空白或损坏图标
- 如果论文配图在 source tarball 中已经是 PNG/JPG 格式，先用 `cwebp` 转成 WebP 再放入 media 目录
- 转换时推荐 200 DPI 以保证清晰度
- `build.js` 会在构建时自动转换任何遗漏的非 WebP 图片文件并删除原件

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
mkdir -p ~/gongshangzheng.github.io/media/images/${SLUG}/
cp ~/gongshangzheng.github.io/raw/${SLUG}/images/${SLUG}/* \
   ~/gongshangzheng.github.io/media/images/${SLUG}/ 2>/dev/null || true

# 2. 转换非 WebP 图片（PNG/JPG → WebP）
for f in ~/gongshangzheng.github.io/media/images/${SLUG}/*.{png,jpg,jpeg}; do
  [ -f "$f" ] || continue
  base="${f%.*}"
  cwebp -q 80 "$f" -o "${base}.webp" 2>/dev/null && rm "$f"
done

# 3. 确认文件名（实际文件名决定 HTML 中的引用路径）
ls ~/gongshangzheng.github.io/media/images/${SLUG}/

# 4. HTML 中的图片路径必须与实际文件名完全一致（.webp 后缀）
#    只使用真实存在的文件，不要编造文件名
```

---

## 本地化

所有图片必须下载到 `~/gongshangzheng.github.io/media/images/`，HTML 中使用 `media/images/<filename>` 路径引用。**禁止**在 HTML 中引用远程 URL。

---

## 多图水平并排布局

当多张图片构成**对比、递进或并列关系**时（如：原图 vs 重建图、不同参数效果对比、架构模块并列展示），应使用 flex 容器水平排列，而非纵向堆叠。

### 适用场景

- 同一实验的不同参数/设置对比（如 γ=0 vs γ=0.8）
- 原图与处理结果的视觉对比
- 多个模型/方法的输出并列展示
- 架构图的子模块并排说明

### 语法模板

```html
<div style="display:flex;gap:1rem;flex-wrap:wrap;">
  <div class="photo" style="flex:1;min-width:200px;">
    <img src="media/images/<slug>/image-a.webp" alt="描述A" loading="lazy">
    <div class="cap">图 N：说明A。</div>
  </div>
  <div class="photo" style="flex:1;min-width:200px;">
    <img src="media/images/<slug>/image-b.webp" alt="描述B" loading="lazy">
    <div class="cap">图 N+1：说明B。</div>
  </div>
</div>
```

### 注意事项

- **`min-width`**：根据图片数量和预期最小可读宽度调整。两张图建议 `280px`，三张及以上建议 `200px`。移动端窄屏时自动换行。
- **`flex:1`**：让各图等宽分配空间，避免某张图过宽挤压其他图。
- **`gap`**：统一使用 `1rem` 间距，保持视觉节奏一致。
- **caption 独立性**：每张图的 `.cap` 仍属于各自的 `.photo`，不要合并为一个总 caption。
- **非对比场景不并排**：如果图片之间没有直接的视觉对比或并列语义关系，应保持默认的纵向排列。