#!/usr/bin/env python3
"""Fail when a newly published WebP has a large, unused white margin."""

import argparse
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image

import numpy as np

ROOT = Path(__file__).resolve().parent.parent


def crop_whitespace(img, padding_pct=0.02, threshold=None):
    """自动裁剪图片四周的留白（与全局 doc-intake tools/convert_figures.py 同源逻辑）。

    CI 必须独立运行，不依赖用户主目录或外部 skill，因此此处内联副本。
    自适应检测背景色，对非纯白背景同样有效。
    """
    gray = np.array(img.convert('L'))
    h, w = gray.shape

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
        threshold = max(0, bg_level - 8)

    content_mask = np.abs(gray.astype(np.int16) - bg_level) > 8
    row_content_pct = content_mask.mean(axis=1)
    col_content_pct = content_mask.mean(axis=0)

    content_rows = np.where(row_content_pct > 0.003)[0]
    content_cols = np.where(col_content_pct > 0.003)[0]

    if len(content_rows) == 0 or len(content_cols) == 0:
        return img

    top, bottom = content_rows[0], content_rows[-1]
    left, right = content_cols[0], content_cols[-1]

    min_dim = min(w, h)
    pad = max(10, int(min_dim * padding_pct))

    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(w, right + pad)
    bottom = min(h, bottom + pad)

    return img.crop((left, top, right, bottom))


def changed_images():
    base = os.environ.get("GITHUB_EVENT_BEFORE") or "HEAD^"
    if set(base) == {"0"}:
        base = "HEAD^"
    names = subprocess.check_output(
        ["git", "diff", "--name-only", "--diff-filter=AMRC", base, "HEAD", "--", "media/images"],
        cwd=ROOT,
        text=True,
    ).splitlines()
    return [ROOT / name for name in names if name.endswith(".webp") and "/originals/" not in name]


def check_image(path, max_fraction):
    with Image.open(path) as source:
        image = source.convert("RGB")
    cropped = crop_whitespace(image)
    removed_x = 1 - cropped.width / image.width
    removed_y = 1 - cropped.height / image.height
    if max(removed_x, removed_y) > max_fraction:
        print(
            f"FAIL {path}: removable margin {removed_x:.0%} width, {removed_y:.0%} height "
            f"(limit {max_fraction:.0%})",
            file=sys.stderr,
        )
        return False
    print(f"OK {path}: removable margin {removed_x:.0%} width, {removed_y:.0%} height")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("images", nargs="*", type=Path)
    parser.add_argument("--changed", action="store_true", help="Check WebP files added/modified in HEAD")
    parser.add_argument("--max-fraction", type=float, default=0.20)
    args = parser.parse_args()
    paths = changed_images() if args.changed else args.images
    if not paths and not args.changed:
        parser.error("Provide image paths or --changed")
    failures = [path for path in paths if not check_image(path, args.max_fraction)]
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
