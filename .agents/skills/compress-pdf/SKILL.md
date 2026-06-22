---
name: compress-pdf
description: |
  用 Ghostscript 压缩 PDF 文件体积。覆盖五档 PDFSETTINGS 预设、逐类型图像分辨率精调、
  字体嵌入/子集化、批量压缩、合并 PDF、修复损坏 PDF、CJK 字体处理。
  当用户提到"压缩 PDF"、"PDF 太大"、"减小 PDF 体积"、"PDF file size"、
  "shrink PDF"、"optimize PDF"、"PDF 瘦身"时触发。
  也覆盖 pypdf 的轻度压缩作为备选方案。
---

## Ghostscript 环境

- 二进制路径：`/opt/homebrew/bin/gs`
- ⚠️ shell 里 `gs` 被 alias 成 `git status`，**必须用完整路径**
- 版本：10.07.1（2026-05-19）

---

## 核心命令骨架

```bash
/opt/homebrew/bin/gs \
  -sDEVICE=pdfwrite \
  -dNOPAUSE -dBATCH -q \
  -dCompatibilityLevel=1.4 \
  -dPDFSETTINGS=/ebook \
  -sOutputFile=output.pdf \
  input.pdf
```

参数说明：
- `-sDEVICE=pdfwrite`：输出 PDF（不是打印/光栅）
- `-dNOPAUSE -dBATCH`：非交互模式，处理完自动退出
- `-q`：安静模式，减少输出噪音
- `-dCompatibilityLevel=1.4`：输出 PDF 1.4 兼容（覆盖绝大多数阅读器）
- `-dPDFSETTINGS`：预设档位，见下表

---

## 五档 PDFSETTINGS

| 档位 | 图像 DPI | 适合场景 | 文件体积 |
|------|---------|---------|---------|
| `/screen` | 72 | 屏幕浏览、邮件附件 | 最小 |
| `/ebook` | 150 | 电子阅读、日常分享 | **推荐平衡点** |
| `/printer` | 300 | 打印输出 | 较大 |
| `/prepress` | 300 | 印刷前（保留 CMYK） | 大 |
| `/default` | ≈72 | 几乎等于 /screen | 最小 |

**决策顺序**：先试 `/ebook`，太大再降 `/screen`，需要打印质量才上 `/printer`。

---

## 常用 Recipes

### 1. 单文件压缩（最常用）

```bash
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -dPDFSETTINGS=/ebook \
  -sOutputFile=compressed.pdf input.pdf
```

### 2. 极致压缩（牺牲图像质量）

```bash
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -dPDFSETTINGS=/screen \
  -dColorImageResolution=72 -dGrayImageResolution=72 \
  -sOutputFile=tiny.pdf input.pdf
```

### 3. 保留矢量图质量（论文含矢量图/图表）

只压缩照片类图像，保留文字和矢量：

```bash
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -dPDFSETTINGS=/printer \
  -dColorImageDownsampleType=/Bicubic \
  -dColorImageResolution=200 \
  -dGrayImageResolution=200 \
  -sOutputFile=paper.pdf input.pdf
```

### 4. 批量压缩目录下所有 PDF

```bash
for f in /path/to/pdfs/*.pdf; do
  out="/path/to/output/$(basename "$f")"
  /opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
    -dPDFSETTINGS=/ebook \
    -sOutputFile="$out" "$f"
  echo "Done: $f -> $out"
done
```

### 5. 合并多个 PDF

```bash
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -sOutputFile=merged.pdf file1.pdf file2.pdf file3.pdf
```

### 6. 提取页面（第 3-7 页）

```bash
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -dFirstPage=3 -dLastPage=7 \
  -sOutputFile=pages.pdf input.pdf
```

### 7. 修复损坏/无法打开的 PDF

Ghostscript 重写 PDF 结构，常能修复轻微损坏：

```bash
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -sOutputFile=fixed.pdf corrupted.pdf
```

---

## 精细图像控制（覆盖 PDFSETTINGS 默认值）

PDFSETTINGS 是一组默认值的快捷方式，可以单独覆盖任意一项：

```bash
# 彩色图像
-dColorImageDownsampleType=/Bicubic   # 下采样算法：/Average /Bicubic
-dColorImageResolution=150            # DPI
-dColorImageDownsampleThreshold=1.5   # 超过 1.5× 目标 DPI 才下采样

# 灰度图像
-dGrayImageResolution=150

# 黑白图像（文字扫描件）
-dMonoImageResolution=300
```

**技巧**：`-dDownsampleColorImages=false` 可以完全禁止彩色图像下采样（保留原图）。

---

## 字体处理

```bash
-dEmbedAllFonts=true    # 嵌入所有字体（避免目标机器缺字体）
-dSubsetFonts=true      # 只嵌入用到的字符（减小体积）
```

CJK 字体（中文/日文/韩文）通常体积大，`SubsetFonts=true` 效果显著。

---

## 压缩前诊断

先看看 PDF 里有什么在占空间：

```bash
# 查看 PDF 页数、版本、加密状态
/opt/homebrew/bin/gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -q \
  -c "(input.pdf) (r) file runpdfbegin pdfpagecount = quit" \
  -f input.pdf

# 用 pdfinfo（如已安装 poppler）
pdfinfo input.pdf
```

---

## 备选：pypdf 轻度压缩

当 Ghostscript 压缩效果不佳（已高度优化的 PDF），可用 Python pypdf（已安装 6.12.2）做结构压缩：

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)
writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)
for page in writer.pages:
    page.compress_content_streams()
with open("output.pdf", "wb") as f:
    writer.write(f)
```

pypdf 压缩幅度通常比 Ghostscript 小，但不会改变图像质量。

---

## 常见坑

| 问题 | 原因 | 解法 |
|------|------|------|
| `gs: command not found` 或执行了 git status | shell alias 拦截 | 用 `/opt/homebrew/bin/gs` |
| 压缩后反而更大 | PDF 本身已是优化状态 | 改用 pypdf，或放弃压缩 |
| 压缩后中文乱码 | 字体未嵌入 | 加 `-dEmbedAllFonts=true` |
| 加密 PDF 无法处理 | PDF 有密码保护 | 先解密，Ghostscript 无法绕过 |
| 处理很慢 | 页数多或图像大 | 加 `-dNumRenderingThreads=4` 多线程 |
