# 配图优先级与规则

> 本文档是博客配图来源优先级的唯一事实来源。所有 skill 的配图策略必须遵循本文档。

---

## 通用优先级（所有场景）

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 🥇 首选 | 用户截图/笔记中的图片 | 用户已有的截图、标注图、笔记插图 |
| 🥈 | arXiv source tarball 原始图片 | 从 `arxiv.org/e-print/<id>` 提取，质量最高 |
| 🥉 | arXiv HTML 页面配图 | 论文 HTML 版 figure URL（通常不能直接 curl） |
| 第四 | GitHub repo 中的配图 | README/docs/assets/images 中的官方图 |
| 第五 | PDF 提取配图 | `pdfimages` 提取（会被拆成碎片，通常不适合） |
| 第六 | 代码绘制 | mermaid / jsxgraph 架构图、流程图 |
| 第七 | 网络搜图 | blog-images 搜到的可靠公开图片 |
| ❌ 禁止 | AI 生图 | 学术场景完全禁止；其他场景仅最后兜底 |

### 学术场景额外约束

- AI 生图完全禁止，不得使用
- 至少 3 张图，至少 1 张代码绘制（mermaid/jsxgraph）
- 禁止 hotlink 远程 URL，所有图片必须下载到本地
- 禁止 Docling docpage/dcoref 整页抽取

### 非学术场景

- AI 生图仅 fallback：只有 blog-images 搜图失败、找不到合格图片、或主题没有现成图时
- 可信度排序：真实图片 > 官方图表 > 公开可复用图 > AI 示意图
- AI 生图必须视为示意图，不得伪装成事实证据图

---

## arXiv Source Tarball 提取图片

arXiv HTML 中的图片 URL **不能直接 curl 下载**（会被拦截返回 HTML）。正确方法：

```bash
# 1. 下载 source tarball
curl -sL "https://arxiv.org/e-print/<arxiv-id>" -o /tmp/<slug>-source.tar.gz

# 2. 解压
mkdir -p /tmp/<slug>-source
tar xzf /tmp/<slug>-source.tar.gz -C /tmp/<slug>-source

# 3. 查找图片（语义化文件名，通常在 figures/ 目录）
find /tmp/<slug>-source -name "*.pdf" -o -name "*.png" -o -name "*.eps" | sort

# 4. 转换 PDF → WebP（200 DPI + cwebp Q80）
pdftoppm -png -r 200 -singlefile \
  /tmp/<slug>-source/figures/<figure>.pdf \
  /tmp/<slug>_figure
cwebp -q 80 /tmp/<slug>_figure.png \
  -o ~/gongshangzheng.github.io/media/images/<slug>/<figure>.webp
rm /tmp/<slug>_figure.png

# 5. 验证（确认输出是 WebP）
file ~/gongshangzheng.github.io/media/images/<slug>/<figure>.webp
```

**注意**：
- source tarball 图片通常语义化命名（`pipeline.pdf`、`cluster.pdf`），比 PDF 提取的编号更易识别
- 如果论文 arXiv 版本和最终发表版本图片不同，优先使用最终发表版本

---

## 图片存储路径

```
~/gongshangzheng.github.io/media/images/<slug>/<filename>
```

每张图必须：
- 验证存在（`file` 命令确认是图片格式）
- 标注来源
- 分辨率足够（建议 ≥ 1200px 宽）

---

## 图片 HTML 格式

```html
<div class="photo">
media/images/<slug>/<filename>
<div class="cap">图 N: 图片描述（来源：论文名, Fig.N）</div>
</div>
```

---

## 图片理解协议

图片用于方法解释或实验趋势时：
1. 先读 caption 和正文引用段落
2. 用 `Read` 工具读取图片（内置视觉模型）理解内容
3. 与正文校验一致性

---

## 禁止事项

- ❌ Docling docpage/dcoref 整页抽取 PDF 页面作为配图
- ❌ AI 生图伪装成论文原图或事实证据图
- ❌ hotlink 远程 URL（必须下载到本地）
- ❌ PDF `pdfimages` 提取的碎片图直接作为 Figure（会被拆成每个 patch 一张）
