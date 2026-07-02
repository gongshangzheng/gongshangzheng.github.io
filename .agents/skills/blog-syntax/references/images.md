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
---

## DSP 第八讲 PDF 页码映射表（第八讲1.pdf，共 91 页）

> 当写数字信号处理误差分析章节博客时，使用以下页码映射插入课件引用。
> 纯文本页（仅含少量公式无图示）不适合用 docpage，应改用 docref 或直接写正文。

### 适合 docpage 插入的页面（有图示/表格/完整推导）

| 章节 | 页码 | 内容 | docpage title |
|------|------|------|---------------|
| 课程导入 | 3 | 设计 vs 实现的对比要点 | 课程导入：设计 vs 实现 |
| 8.2 数的表示 | 8 | 定点与浮点表示公式 | 定点与浮点表示 |
| 8.2.2 编码 | 15 | 原码定义与示例 | 原码/补码/反码定义 |
| 8.2.2 编码 | 19 | 三种编码对比总结 | 三种编码对比总结 |
| 8.2.3 截尾舍入 | 22 | 截尾处理（正数） | 截尾与舍入定义 |
| 8.2.3 截尾舍入 | 29 | 截尾误差表（含图示） | 截尾误差表与舍入概率密度 |
| 8.3.1 统计模型 | 36 | 量化误差统计假设 | 量化误差统计假设 |
| 8.3.1 统计模型 | 38 | e(n) 均匀分布图（仅图） | 舍入误差均匀分布图 |
| 8.3.3 噪声通过系统 | 43 | 量化噪声通过线性系统 | 量化噪声通过线性系统 |
| 8.3.3 噪声通过系统 | 47 | 例 10.3：IIR 输出噪声功率计算 | 例 10.3：IIR 输出噪声功率计算 |
| 8.3.4 系数量化 | 49 | 系数量化效应与极点偏移 | 系数量化效应与极点偏移 |
| 8.3.4 系数量化 | 56 | 例 2：三种结构极点分布对比 | 例 2：三种结构极点分布对比 |
| 8.3.4 系数量化 | 58 | 极点位置灵敏度影响因素总结 | 极点位置灵敏度影响因素 |
| 8.6 极限环 | 64 | IIR 输出噪声方差公式 | IIR 输出噪声方差 |
| 8.6 极限环 | 84 | 极限环振荡流图示意（仅图） | 极限环振荡流图示意 |
| 8.7 死区效应 | 85 | 死区效应完整计算（b=3, a=0.5） | 死区效应完整计算 |

### 不适合 docpage 的页面（纯文本或内容重复）

| 页码 | 原因 |
|------|------|
| 1 | 仅标题页 |
| 5-7 | 纯文本概述，正文已覆盖 |
| 10-14 | 纯文字说明，无图示 |
| 17 | 补码定义（与 15、19 重复） |
| 21 | 截尾定义引言（22 页已有详细内容） |
| 24-28 | 纯公式推导，无图示 |
| 31-35 | 纯文字/公式，36 页已覆盖 |
| 40-42 | 纯公式推导 |
| 45-46 | Parseval 定理公式（43 页已覆盖核心） |
| 50-55 | 系数量化公式推导（49、56 页已覆盖） |
| 59-63 | 纯公式推导 |
| 65-73 | 直接型/级联型/并联型噪声分析（64 页公式已够用） |
| 74-75 | 结构对比总结（正文已写） |
| 76-81 | FIR 运算误差分析（纯公式） |
| 82-83 | 极限环引言（64 页已覆盖） |
| 86-87 | 死区计算续（85 页已覆盖核心） |
| 88-91 | 结尾总结（纯文字） |

### 插入原则

1. **每个子章节末尾插入 1-2 个 docpage**，选择有图示/表格/完整推导的页面
2. **纯文本页不插入 docpage**——用正文转述即可
3. **公式推导页优先用正文写出**——docpage 留给有图示/表格的页面
4. **docpage 的 title 要准确描述页面内容**——不要写"章节目录"这种通用标题
