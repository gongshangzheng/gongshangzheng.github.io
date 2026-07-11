#!/usr/bin/env python3
"""
crop-figures-from-docling.py — 用 Docling JSON 的 picture bbox 高清裁图

读取 Docling JSON（`~/.hanako/skills/docling/scripts/convert.py -f json` 产物），
找出所有 picture 项，用 PyMuPDF 按其 `prov[0].bbox` 在源 PDF 上做 300-400 DPI
clip 渲染，输出 PNG。可选链式调用 `convert-figures.py` 转 WebP。

这是 read-article 配图优先级 D 的脚本化实现，替代旧的手动 pdftocairo + magick。
区别于 Docling 自家 `--image-export-mode referenced`（144 DPI，矢量 figure 会空白）：
本脚本只借 Docling JSON 的 picture bbox，渲染由 PyMuPDF 在源 PDF 上高清完成，
因此矢量 PDF figure 也能正确渲染（修复 PerformRecast 类空白故障）。

用法:
    # 标准用法：出 PNG 到 figures/，再链式转 WebP 到 media/images/
    python3 scripts/crop-figures-from-docling.py raw/<slug>/sources/<slug>.json \\
        --pdf raw/<slug>/sources/<slug>.pdf \\
        -o raw/<slug>/figures/<slug>/ \\
        --media-dir media/images/<slug>/

    # 只出 PNG，不链式转 WebP
    python3 scripts/crop-figures-from-docling.py doc.json --pdf src.pdf -o figs/ --no-convert

    # 指定 DPI（默认 300）和页码过滤
    python3 scripts/crop-figures-from-docling.py doc.json --pdf src.pdf -o figs/ --dpi 400 --pages 3,5,7-9

依赖: PyMuPDF (fitz), Pillow
"""

import argparse
import json
import os
import subprocess
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

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = Path(os.environ.get("PROJECT_ROOT", str(Path.home() / "gongshangzheng.github.io")))


def resolve_ref(doc, ref):
    """解析 JSON 指针 '#/texts/15' → doc['texts'][15]"""
    if not ref or not ref.startswith("#/"):
        return None
    obj = doc
    for part in ref[2:].split("/"):
        if part == "":
            continue
        try:
            idx = int(part)
            obj = obj[idx]
        except ValueError:
            obj = obj.get(part) if isinstance(obj, dict) else None
        except (IndexError, TypeError):
            return None
        if obj is None:
            return None
    return obj


def get_caption_text(doc, picture):
    """从 picture.captions[0].$ref 或 children 中 label=='caption' 取 caption 文本"""
    caps = picture.get("captions") or []
    if caps:
        cap = resolve_ref(doc, caps[0].get("$ref"))
        if cap and cap.get("text"):
            return cap["text"].strip()
    for child in picture.get("children", []):
        child_item = resolve_ref(doc, child.get("$ref"))
        if child_item and child_item.get("label") == "caption" and child_item.get("text"):
            return child_item["text"].strip()
    return ""


def collect_pictures(doc):
    """收集所有 picture 项，返回 [{self_ref, page_no, bbox, coord_origin, caption, index}]"""
    pictures = doc.get("pictures", []) or []
    out = []
    for i, pic in enumerate(pictures):
        if pic.get("label") != "picture":
            continue
        provs = pic.get("prov") or []
        if not provs:
            print(f"  ⚠️ picture #{i} 无 prov，跳过", file=sys.stderr)
            continue
        prov = provs[0]
        page_no = prov.get("page_no")
        bbox = prov.get("bbox") or {}
        if page_no is None or not bbox:
            print(f"  ⚠️ picture #{i} 缺 page_no/bbox，跳过", file=sys.stderr)
            continue
        out.append({
            "index": i,
            "self_ref": pic.get("self_ref", f"#/pictures/{i}"),
            "page_no": int(page_no),
            "bbox": bbox,
            "coord_origin": bbox.get("coord_origin", "BOTTOMLEFT"),
            "caption": get_caption_text(doc, pic),
        })
    return out


def bbox_to_rect(bbox, page_rect, coord_origin):
    """把 Docling bbox{l,t,r,b} 转成 PyMuPDF top-left Rect 并 clamp 到页面

    Docling 默认 BOTTOMLEFT（y 向上，t>b）；PyMuPDF 用 top-left（y 向下）。
    """
    l, t, r, b = bbox["l"], bbox["t"], bbox["r"], bbox["b"]
    if str(coord_origin).upper() == "BOTTOMLEFT":
        x0, y0, x1, y1 = l, page_rect.height - t, r, page_rect.height - b
    else:
        x0, y0, x1, y1 = l, t, r, b
    # 规范化：保证 x0<x1, y0<y1
    if x0 > x1:
        x0, x1 = x1, x0
    if y0 > y1:
        y0, y1 = y1, y0
    # clamp 到页面边界
    x0 = max(0.0, min(x0, page_rect.width))
    x1 = max(0.0, min(x1, page_rect.width))
    y0 = max(0.0, min(y0, page_rect.height))
    y1 = max(0.0, min(y1, page_rect.height))
    return fitz.Rect(x0, y0, x1, y1)


def render_picture(pdf_doc, page_no, rect, dpi):
    """在 pdf_doc 的第 page_no 页（1-based）按 rect 高清 clip 渲染，返回 PIL Image"""
    page = pdf_doc[page_no - 1]  # page_no 是 1-based
    zoom = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=rect, alpha=False)
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)


def is_blank(img, threshold=3.0):
    """像素标准差低于 threshold 视为疑似空白图（矢量渲染失败的兜底信号）"""
    import numpy as np
    arr = np.asarray(img.convert("L"), dtype="float32")
    return float(arr.std()) < threshold


def parse_page_spec(spec):
    """解析 '3,5,7-9' → {3,5,7,8,9}（1-based）；空串返回 None 表示不过滤"""
    if not spec:
        return None
    pages = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            pages.update(range(int(a), int(b) + 1))
        else:
            pages.add(int(part))
    return pages


def run_convert_figures(png_dir, media_dir, dpi, quality):
    """链式调用 convert-figures.py 把 PNG 转 WebP（复用，不重写）"""
    convert_script = SCRIPT_DIR / "convert-figures.py"
    if not convert_script.exists():
        print(f"  ❌ 找不到 convert-figures.py: {convert_script}", file=sys.stderr)
        return False
    python = str(Path.home() / ".venv" / "bin" / "python3")
    if not Path(python).exists():
        python = sys.executable
    cmd = [python, str(convert_script), str(png_dir), "-o", str(media_dir),
           "--dpi", str(dpi), "--quality", str(quality)]
    print(f"  🔄 链式转 WebP: {' '.join(cmd)}", file=sys.stderr)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout, end="")
    if result.returncode != 0:
        print(f"  ❌ convert-figures.py 失败 (exit {result.returncode})", file=sys.stderr)
        if result.stderr:
            print(result.stderr[-800:], file=sys.stderr)
        return False
    return True


def main():
    p = argparse.ArgumentParser(
        description="用 Docling JSON 的 picture bbox 在源 PDF 上高清裁图",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""示例:
  python3 scripts/crop-figures-from-docling.py raw/moric-2025/sources/moric-2025.json \\
      --pdf raw/moric-2025/sources/moric-2025.pdf \\
      -o raw/moric-2025/sources/figures/ --media-dir media/images/moric-2025/
""",
    )
    p.add_argument("json", help="Docling JSON 路径（convert.py -f json 产物）")
    p.add_argument("--pdf", required=True, help="源 PDF 路径（与 Docling 解析的同一份）")
    p.add_argument("-o", "--output", required=True, help="PNG 输出目录")
    p.add_argument("--media-dir", default="", help="链式转 WebP 的目标目录（media/images/<slug>/）")
    p.add_argument("--dpi", type=int, default=300, help="渲染 DPI，默认 300（建议 300-400）")
    p.add_argument("--quality", type=int, default=90, help="WebP 质量，默认 90")
    p.add_argument("--pages", default="", help="只裁指定页，1-based，如 3,5,7-9；默认全部")
    p.add_argument("--no-convert", action="store_true", help="只出 PNG，不链式转 WebP")
    args = p.parse_args()

    json_path = Path(args.json).expanduser().resolve()
    pdf_path = Path(args.pdf).expanduser().resolve()
    out_dir = Path(args.output).expanduser().resolve()
    if not json_path.exists():
        print(f"❌ JSON 不存在: {json_path}", file=sys.stderr)
        sys.exit(1)
    if not pdf_path.exists():
        print(f"❌ PDF 不存在: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"📂 读取 Docling JSON: {json_path}", file=sys.stderr)
    with open(json_path, encoding="utf-8") as f:
        doc = json.load(f)

    pictures = collect_pictures(doc)
    print(f"🖼️ 找到 {len(pictures)} 个 picture 项", file=sys.stderr)

    page_filter = parse_page_spec(args.pages)
    if page_filter is not None:
        pictures = [p for p in pictures if p["page_no"] in page_filter]
        print(f"📄 页码过滤后: {len(pictures)} 个", file=sys.stderr)

    if not pictures:
        print("⚠️ 没有 picture 可裁，结束", file=sys.stderr)
        sys.exit(0)

    print(f"📄 打开 PDF: {pdf_path}", file=sys.stderr)
    pdf_doc = fitz.open(str(pdf_path))

    manifest = []
    for pic in pictures:
        page_no = pic["page_no"]
        if page_no < 1 or page_no > pdf_doc.page_count:
            print(f"  ⚠️ {pic['self_ref']} page_no={page_no} 超出 PDF 页数 {pdf_doc.page_count}，跳过",
                  file=sys.stderr)
            continue
        page = pdf_doc[page_no - 1]
        rect = bbox_to_rect(pic["bbox"], page.rect, pic["coord_origin"])
        if rect.width <= 0 or rect.height <= 0:
            print(f"  ⚠️ {pic['self_ref']} bbox 无效面积，跳过", file=sys.stderr)
            continue

        out_name = f"fig_{pic['index']:03d}_p{page_no}.png"
        out_path = out_dir / out_name
        try:
            img = render_picture(pdf_doc, page_no, rect, args.dpi)
            img.save(str(out_path), "PNG")
        except Exception as e:
            print(f"  ❌ {pic['self_ref']} 渲染失败: {e}", file=sys.stderr)
            continue

        blank_suspect = is_blank(img)
        width, height = img.size
        flag = " ⚠️ 可能空白" if blank_suspect else ""
        print(f"  ✅ {out_name}  ({width}x{height}px, p{page_no}){flag}", file=sys.stderr)

        manifest.append({
            "file": out_name,
            "page_no": page_no,
            "bbox": {k: pic["bbox"][k] for k in ("l", "t", "r", "b")},
            "coord_origin": pic["coord_origin"],
            "self_ref": pic["self_ref"],
            "caption": pic["caption"],
            "width_px": width,
            "height_px": height,
            "blank_suspect": blank_suspect,
        })

    pdf_doc.close()

    manifest_path = out_dir / "figures-manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"📝 manifest: {manifest_path}（{len(manifest)} 条）", file=sys.stderr)

    if args.no_convert:
        print("⏭️ --no-convert，跳过链式转 WebP", file=sys.stderr)
        sys.exit(0)

    media_dir = args.media_dir
    if not media_dir:
        # 默认推断到 PROJECT_ROOT/media/images/<slug from out_dir parent>/...
        # out_dir 形如 raw/<slug>/figures/<slug>，取倒数第二段作为 slug 兜底
        parts = out_dir.parts
        slug = parts[-2] if len(parts) >= 2 and parts[-1] == parts[-2] else out_dir.name
        media_dir = str(PROJECT_ROOT / "media" / "images" / slug)
    media_path = Path(media_dir).expanduser().resolve()
    media_path.mkdir(parents=True, exist_ok=True)

    if not run_convert_figures(out_dir, media_path, args.dpi, args.quality):
        sys.exit(1)
    print(f"✅ 完成: PNG → {out_dir}, WebP → {media_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
