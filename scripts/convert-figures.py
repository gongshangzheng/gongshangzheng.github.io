#!/usr/bin/env python3
"""
convert-figures.py — 论文图片统一转换工具

将 arXiv e-print tarball 中的 PDF/EPS 图片直接转换为 WebP（300 DPI）。
也支持 PNG/JPG 输入直接转 WebP。

用法:
    # 转换单个文件
    python3 scripts/convert-figures.py input.pdf -o output.webp

    # 转换目录下所有图片
    python3 scripts/convert-figures.py raw/<slug>/figures/<slug>/ -o media/images/<slug>/

    # 指定 DPI（默认 300）
    python3 scripts/convert-figures.py input.pdf -o output.webp --dpi 150

    # 指定质量（默认 90）
    python3 scripts/convert-figures.py input.pdf -o output.webp --quality 85

依赖: PyMuPDF (fitz), Pillow
"""

import argparse
import os
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("错误: 需要安装 PyMuPDF: pip install PyMuPDF", file=sys.stderr)
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("错误: 需要安装 Pillow: pip install Pillow", file=sys.stderr)
    sys.exit(1)


SUPPORTED_INPUT = {'.pdf', '.eps', '.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif'}


def crop_whitespace(img, padding_pct=0.02, threshold=None):
    """自动裁剪图片四周的留白

    自适应检测背景色，对非纯白背景（如灰度 248）同样有效。

    Args:
        img: PIL Image (RGB)
        padding_pct: 裁剪后保留的边距百分比（相对于短边），默认 2%
        threshold: 灰度阈值，>= threshold 视为背景。None 时自动检测背景色。
    Returns:
        裁剪后的 PIL Image
    """
    import numpy as np
    gray = np.array(img.convert('L'))
    h, w = gray.shape

    # 自动检测背景色：取四角 10% 区域的中位数灰度
    bg_level = None
    if threshold is None:
        corner_size_h = max(10, h // 10)
        corner_size_w = max(10, w // 10)
        corners = np.concatenate([
            gray[:corner_size_h, :corner_size_w].ravel(),
            gray[:corner_size_h, -corner_size_w:].ravel(),
            gray[-corner_size_h:, :corner_size_w].ravel(),
            gray[-corner_size_h:, -corner_size_w:].ravel(),
        ])
        bg_level = int(np.median(corners))
        # threshold = 背景色 - 8，确保比背景稍暗的像素被识别为内容
        threshold = max(0, bg_level - 8)

    # 行/列级别的内容检测：每行/列中 < threshold 的像素比例
    content_mask = gray < threshold
    row_content_pct = content_mask.mean(axis=1)  # 每行的内容像素比例
    col_content_pct = content_mask.mean(axis=0)  # 每列的内容像素比例

    # 内容像素比例 > 0.3% 的行/列视为有内容（容忍少量噪点）
    content_rows = np.where(row_content_pct > 0.003)[0]
    content_cols = np.where(col_content_pct > 0.003)[0]

    if len(content_rows) == 0 or len(content_cols) == 0:
        # 整张图都是背景，不裁剪
        return img

    top, bottom = content_rows[0], content_rows[-1]
    left, right = content_cols[0], content_cols[-1]

    # 计算边距：短边的 padding_pct，最小 10px
    min_dim = min(w, h)
    pad = max(10, int(min_dim * padding_pct))

    # 扩展 bbox，但不超过图片边界
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(w, right + pad)
    bottom = min(h, bottom + pad)

    cropped = img.crop((left, top, right, bottom))

    # 记录裁剪信息
    orig_w, orig_h = img.size
    crop_w, crop_h = cropped.size
    removed_w = orig_w - crop_w
    removed_h = orig_h - crop_h
    if removed_w > 5 or removed_h > 5:
        pct_w = removed_w / orig_w * 100
        pct_h = removed_h / orig_h * 100
        bg_info = f"bg≈{bg_level}" if bg_level is not None else "manual"
        print(f"     裁剪留白: {orig_w}x{orig_h} → {crop_w}x{crop_h} (去除 {pct_w:.0f}% W, {pct_h:.0f}% H) [{bg_info}, thresh={threshold}]")

    return cropped


def convert_pdf_to_webp(pdf_path, out_path, dpi=300, quality=90, crop=True, padding_pct=0.02):
    """用 PyMuPDF 渲染 PDF 第一页，裁剪留白，直接保存为 WebP"""
    doc = fitz.open(str(pdf_path))
    page = doc[0]
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc.close()

    if crop:
        img = crop_whitespace(img, padding_pct)

    img.save(str(out_path), "WEBP", quality=quality)
    return img.size


def convert_image_to_webp(img_path, out_path, dpi=300, quality=90, crop=True, padding_pct=0.02):
    """将 PNG/JPG 等光栅图裁剪留白并转 WebP"""
    img = Image.open(str(img_path))
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    if crop:
        img = crop_whitespace(img, padding_pct)

    img.save(str(out_path), "WEBP", quality=quality)
    return img.size


def convert_one(input_path, output_path, dpi=300, quality=90, crop=True, padding_pct=0.02):
    """转换单个文件"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    if not input_path.exists():
        print(f"  ❌ 文件不存在: {input_path}", file=sys.stderr)
        return False

    ext = input_path.suffix.lower()

    if ext == '.pdf':
        w, h = convert_pdf_to_webp(input_path, output_path, dpi, quality, crop, padding_pct)
    elif ext == '.eps':
        # EPS 需要 Ghostscript；尝试用 fitz 打开，失败则跳过
        try:
            w, h = convert_pdf_to_webp(input_path, output_path, dpi, quality, crop, padding_pct)
        except Exception:
            print(f"  ⚠️ EPS 转换失败（需 Ghostscript）: {input_path}", file=sys.stderr)
            return False
    elif ext in ('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif'):
        w, h = convert_image_to_webp(input_path, output_path, dpi, quality, crop, padding_pct)
    else:
        print(f"  ⚠️ 不支持的格式: {ext} ({input_path})", file=sys.stderr)
        return False

    size_kb = output_path.stat().st_size / 1024
    print(f"  ✅ {input_path.name} → {output_path.name}  {w}x{h}  {size_kb:.0f}KB")

    # 质量检查：文件小于 1KB 几乎必然是空白图
    if output_path.stat().st_size < 1024:
        print(f"  ⚠️ 警告: 输出文件小于 1KB，可能是空白图片！", file=sys.stderr)
        return False

    # 分辨率检查：宽度小于 400px 可能不清晰
    if w < 400:
        print(f"  ⚠️ 警告: 图片宽度仅 {w}px，建议提高 DPI", file=sys.stderr)

    return True


def convert_directory(input_dir, output_dir, dpi=300, quality=90, crop=True, padding_pct=0.02):
    """批量转换目录下所有图片

    优先级：PDF > EPS > PNG/JPG（同名时优先用矢量格式）
    """
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 收集所有支持的图片文件，按 stem 分组
    from collections import defaultdict
    groups = defaultdict(list)  # stem -> [(priority, filepath)]
    priority = {'.pdf': 0, '.eps': 1, '.png': 2, '.jpg': 3, '.jpeg': 4,
                '.bmp': 5, '.tiff': 6, '.tif': 7, '.gif': 8}

    for f in sorted(input_dir.iterdir()):
        if not f.is_file() or f.suffix.lower() not in SUPPORTED_INPUT:
            continue
        # 跳过非论文图片
        if f.name.lower() in ('acmart.pdf', 'acmguide.pdf', 'acm-jdslogo.png'):
            continue
        groups[f.stem].append((priority.get(f.suffix.lower(), 99), f))

    if not groups:
        print(f"  ℹ️ 目录中没有找到支持的图片文件: {input_dir}", file=sys.stderr)
        return 0

    # 每个 stem 只取优先级最高的一个
    files = []
    for stem, candidates in sorted(groups.items()):
        candidates.sort(key=lambda x: x[0])
        chosen = candidates[0][1]
        if len(candidates) > 1:
            skipped = [c[1].name for c in candidates[1:]]
            print(f"  ℹ️ {stem}: 优先使用 {chosen.name}（跳过 {', '.join(skipped)}）")
        files.append(chosen)

    crop_status = "开" if crop else "关"
    print(f"\n转换 {len(files)} 个文件 (DPI={dpi}, Quality={quality}, 留白裁剪={crop_status})...")
    success = 0
    for f in files:
        out_name = f.stem + '.webp'
        out_path = output_dir / out_name
        if convert_one(f, out_path, dpi, quality, crop, padding_pct):
            success += 1

    print(f"\n完成: {success}/{len(files)} 成功转换")
    return success


def main():
    parser = argparse.ArgumentParser(
        description='论文图片统一转换工具：PDF/EPS/PNG/JPG → WebP',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 单文件转换
  python3 scripts/convert-figures.py input.pdf -o output.webp

  # 批量转换目录
  python3 scripts/convert-figures.py raw/<slug>/figures/<slug>/ -o media/images/<slug>/

  # 自定义 DPI 和质量
  python3 scripts/convert-figures.py input.pdf -o output.webp --dpi 150 --quality 85
        """
    )
    parser.add_argument('input', help='输入文件或目录路径')
    parser.add_argument('-o', '--output', required=True, help='输出文件或目录路径')
    parser.add_argument('--dpi', type=int, default=300, help='渲染 DPI（默认 300）')
    parser.add_argument('--quality', type=int, default=90, help='WebP 质量 1-100（默认 90）')
    parser.add_argument('--no-crop', action='store_true', help='禁用自动留白裁剪')
    parser.add_argument('--padding', type=float, default=0.02,
                        help='裁剪后保留的边距比例（默认 0.02=短边的 2%%）')

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    crop = not args.no_crop
    padding_pct = args.padding

    if input_path.is_dir():
        convert_directory(input_path, output_path, args.dpi, args.quality, crop, padding_pct)
    elif input_path.is_file():
        output_path.parent.mkdir(parents=True, exist_ok=True)
        convert_one(input_path, output_path, args.dpi, args.quality, crop, padding_pct)
    else:
        print(f"错误: 输入路径不存在: {input_path}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
