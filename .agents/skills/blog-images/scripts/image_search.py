#!/usr/bin/env python3
"""
图片搜索脚本 - 使用 DDGS 进行图片搜索和可选下载

用法示例:
    python image_search.py "秦始皇兵马俑"
    python image_search.py "科技插图" --size Large --download ./images
    python image_search.py "拿破仑 油画" --type photo --license Public --download ./history_images
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

try:
    import requests
    from ddgs import DDGS
except ImportError as e:
    print(f"错误: 缺少依赖 {e}. 请安装: pip install ddgs requests", file=sys.stderr)
    sys.exit(1)


def safe_filename(name: str) -> str:
    cleaned = "".join(c if c.isalnum() or c in "-_" else "_" for c in name.strip())
    while "__" in cleaned:
        cleaned = cleaned.replace("__", "_")
    return cleaned.strip("_") or "image"


def infer_ext(url: str, content_type: str | None = None) -> str:
    path = urlparse(url).path
    suffix = Path(path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".tiff"}:
        return suffix
    if content_type:
        ext = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if ext:
            return ".jpg" if ext == ".jpe" else ext
    return ".jpg"


def search_images(args: argparse.Namespace) -> list[dict[str, Any]]:
    with DDGS() as ddgs:
        results = ddgs.images(
            args.query,
            region=args.region,
            safesearch=args.safesearch,
            size=args.size,
            color=args.color,
            type_image=args.type,
            layout=args.layout,
            license_image=args.license,
            max_results=args.max_results,
        )
        return list(results) if results else []


def download_image(url: str, out_dir: Path, stem: str, index: int, delay: float = 0.3) -> str | None:
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Hanako image-search)"}
        r = requests.get(url, headers=headers, timeout=20, stream=True)
        r.raise_for_status()
        ext = infer_ext(url, r.headers.get("content-type"))
        filename = f"{index:03d}_{safe_filename(stem)[:80]}{ext}"
        path = out_dir / filename
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        time.sleep(delay)
        return str(path)
    except Exception as e:
        print(f"警告: 下载失败 {url}: {e}", file=sys.stderr)
        return None


def normalize_result(item: dict[str, Any], local_path: str | None = None) -> dict[str, Any]:
    return {
        "title": item.get("title", ""),
        "image": item.get("image", ""),
        "thumbnail": item.get("thumbnail", ""),
        "url": item.get("url", ""),
        "source": item.get("source", ""),
        "width": item.get("width"),
        "height": item.get("height"),
        "local_path": local_path,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="DDGS 图片搜索与下载")
    parser.add_argument("query", help="搜索关键词")
    parser.add_argument("--max_results", type=int, default=10, help="最大结果数")
    parser.add_argument("--region", default="zh-cn", help="搜索区域，如 zh-cn / us-en")
    parser.add_argument("--size", default=None, choices=[None, "Small", "Medium", "Large", "Wallpaper"], help="图片尺寸过滤")
    parser.add_argument("--color", default=None, help="颜色过滤，如 Red / Blue / Monochrome")
    parser.add_argument("--type", dest="type", default=None, choices=[None, "photo", "clipart", "gif", "transparent", "line"], help="图片类型过滤")
    parser.add_argument("--layout", default=None, choices=[None, "Square", "Tall", "Wide"], help="布局过滤")
    parser.add_argument("--license", default=None, choices=[None, "any", "Public", "Share", "ShareCommercially", "Modify", "ModifyCommercially"], help="版权过滤")
    parser.add_argument("--safesearch", default="moderate", choices=["on", "moderate", "off"], help="安全搜索")
    parser.add_argument("--download", default=None, help="下载目录")
    parser.add_argument("--output", default=None, help="保存 JSON 输出到文件")
    args = parser.parse_args()

    print(f"正在搜索图片: {args.query}", file=sys.stderr)
    results = search_images(args)
    print(f"获取到 {len(results)} 条结果", file=sys.stderr)

    download_dir = Path(args.download).expanduser() if args.download else None
    if download_dir:
        download_dir.mkdir(parents=True, exist_ok=True)

    normalized: list[dict[str, Any]] = []
    for i, item in enumerate(results, 1):
        local_path = None
        if download_dir and item.get("image"):
            title = item.get("title") or args.query
            local_path = download_image(item["image"], download_dir, title, i)
        normalized.append(normalize_result(item, local_path))

    payload = {
        "query": args.query,
        "timestamp": datetime.now().isoformat(),
        "total_results": len(normalized),
        "results": normalized,
    }

    text = json.dumps(payload, ensure_ascii=False, indent=2)
    if args.output:
        out = Path(args.output).expanduser()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(f"结果已写入: {out}", file=sys.stderr)
    else:
        print(text)


if __name__ == "__main__":
    main()
