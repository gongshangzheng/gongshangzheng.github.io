#!/usr/bin/env python3
"""Normalize figure margins across the site.

Every static figure ends up with the same border, measured as a fraction of its
own width (figures render full-bleed at the article container width, so a fixed
fraction of the source width is a fixed fraction of the rendered width):

    1. crop to the content bounding box
    2. add TARGET_MARGIN of the cropped width on all four sides
    3. cap the long edge at MAX_EDGE
    4. re-encode as WebP

Padding uses each image's own detected background colour (never hard-coded
white), and images with an alpha channel keep it.

Skipped on purpose: multi-frame WebP (padding per frame is not meaningful and
re-encoding risks dropping frames), SVG (vector), and images no page references
(they are never deployed).

Usage:
    python3 scripts/normalize-image-margins.py                 # dry-run + report
    python3 scripts/normalize-image-margins.py --apply
    python3 scripts/normalize-image-margins.py --apply --limit 20   # sample first
    python3 scripts/normalize-image-margins.py --restore
"""

from __future__ import annotations

import argparse
import multiprocessing as mp
import os
import re
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
MEDIA_DIR = ROOT / "media"
PAGES_DIR = ROOT / "src" / "pages"
BACKUP_DIR = ROOT / "raw" / "media-originals"

# Target border as a fraction of the cropped width. `.wrap` is ~752px wide, so
# 3% lands at ~22px on screen, matching the .photo card's inner rhythm.
TARGET_MARGIN = 0.03
# Idempotency tolerance (fraction of width). Second run measures 2.83% and must
# therefore be treated as already-normalized.
MARGIN_TOLERANCE = 0.005
MAX_EDGE = 4000
# Inline icons (48px logos etc.) are not figures; padding them is meaningless.
MIN_WIDTH = 400
WEBP_QUALITY = 82
WEBP_METHOD = 4

RASTER_EXT = {".webp", ".png", ".jpg", ".jpeg", ".avif", ".gif"}

# Reference scanning must mirror lib/media-images.js:scanReferencedMedia.
ATTR_RE = re.compile(r'\b(?:src|href|data-src|poster)="((?:\./)?media/[^"]+)"')
SRCSET_RE = re.compile(r'\bsrcset="([^"]+)"')
AUDIO_RE = re.compile(r'^\s*audio_src:\s*"?((?:\./)?media/[^"\s]+)"?', re.M)


def scan_references() -> set[str]:
    refs: set[str] = set()
    for path in PAGES_DIR.rglob("*"):
        if path.suffix.lower() not in {".html", ".md"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for match in ATTR_RE.finditer(text):
            refs.add(match.group(1).removeprefix("./"))
        for match in AUDIO_RE.finditer(text):
            refs.add(match.group(1).removeprefix("./"))
        for match in SRCSET_RE.finditer(text):
            for part in match.group(1).split(","):
                candidate = part.strip().split(" ")[0]
                if candidate.startswith("media/"):
                    refs.add(candidate)
    return refs


def _corner_pixels(array: np.ndarray) -> np.ndarray:
    """Corner samples flattened to (-1, channels) for 2-D or 3-D arrays."""
    if array.ndim == 2:
        array = array.reshape(array.shape[0], array.shape[1], 1)
    h, w = array.shape[:2]
    ch, cw = max(1, h // 10), max(1, w // 10)
    return np.concatenate(
        [
            array[:ch, :cw].reshape(-1, array.shape[2]),
            array[:ch, -cw:].reshape(-1, array.shape[2]),
            array[-ch:, :cw].reshape(-1, array.shape[2]),
            array[-ch:, -cw:].reshape(-1, array.shape[2]),
        ]
    )


def detect_background(img: Image.Image) -> tuple[tuple[int, int, int, int], bool]:
    """Median colour of the four corner regions, plus "is the canvas transparent".

    WebP stores arbitrary RGB under fully transparent pixels, so the colour of
    transparent padding cannot be trusted; only opaque pixels vote.
    """
    rgba = np.array(img.convert("RGBA"))
    corners = _corner_pixels(rgba)
    transparent_ratio = float((corners[:, 3] < 8).mean())
    opaque = corners[corners[:, 3] >= 8]
    if opaque.size == 0:
        return (255, 255, 255, 0), True
    median = np.median(opaque[:, :3], axis=0).astype(int)
    transparent_canvas = transparent_ratio > 0.5
    return (
        int(median[0]),
        int(median[1]),
        int(median[2]),
        0 if transparent_canvas else 255,
    ), transparent_canvas


def content_bbox(img: Image.Image) -> tuple[int, int, int, int] | None:
    """Bounding box of visible content.

    Two departures from the upstream crop_whitespace() heuristic, both needed for
    idempotency: content is "differs from the background in either direction"
    (dark-canvas figures otherwise look empty), and fully transparent pixels are
    never content (transparent padding decodes with garbage RGB).
    """
    rgba = np.array(img.convert("RGBA"))
    gray = np.array(img.convert("L"))
    alpha = rgba[:, :, 3]
    corners = _corner_pixels(gray).ravel()
    corner_alpha = _corner_pixels(alpha).ravel()
    opaque_corners = corners[corner_alpha >= 8]
    bg_level = int(np.median(opaque_corners)) if opaque_corners.size else int(np.median(corners))
    mask = np.abs(gray.astype(np.int16) - bg_level) > 8
    mask &= alpha > 8
    rows = np.where(mask.mean(axis=1) > 0.003)[0]
    cols = np.where(mask.mean(axis=0) > 0.003)[0]
    if len(rows) == 0 or len(cols) == 0:
        return None  # entirely background — do not touch
    return int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1


def current_margins(img: Image.Image, bbox: tuple[int, int, int, int]) -> tuple[float, float, float, float]:
    x0, y0, x1, y1 = bbox
    w, h = img.size
    return (x0 / w, y0 / h, (w - x1) / w, (h - y1) / h)


def backup_path_for(rel: str) -> Path:
    return BACKUP_DIR / rel


def source_path_for(rel: str) -> Path:
    """Prefer the pristine original so we never stack a second lossy encode."""
    backup = backup_path_for(rel)
    if backup.exists():
        return backup
    return ROOT / rel


def ensure_backup(rel: str) -> None:
    backup = backup_path_for(rel)
    if backup.exists():
        return  # keep the earliest (pristine) original
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / rel, backup)


def _load(path: Path) -> tuple[Image.Image, int] | None:
    """Open an image, returning (image, frame_count)."""
    try:
        with Image.open(path) as handle:
            frames = getattr(handle, "n_frames", 1) or 1
            return handle.copy(), frames
    except Exception:
        return None


def process_one(rel: str) -> dict:
    """Normalize a single image. Returns a status record."""
    target = ROOT / rel
    if not target.exists():
        return {"rel": rel, "status": "missing"}
    if target.suffix.lower() not in RASTER_EXT:
        return {"rel": rel, "status": "skip_vector"}

    loaded = _load(target)
    if loaded is None:
        return {"rel": rel, "status": "failed", "error": "unreadable"}
    current, frames = loaded
    if frames > 1:
        return {"rel": rel, "status": "skip_animated", "frames": frames}

    width, height = current.size
    if width < MIN_WIDTH:
        return {"rel": rel, "status": "skip_icon"}

    # Idempotency is judged on the file that would be delivered, not on the
    # pristine source (the source never carries our padding).
    bbox = content_bbox(current.convert("RGBA") if current.mode in {"RGBA", "LA"} else current.convert("RGB"))
    if bbox is None:
        return {"rel": rel, "status": "skip_uniform"}
    margins = current_margins(current, bbox)
    x0, y0, x1, y1 = bbox
    borders = (x0, y0, width - x1, height - y1)
    pad_px = round(TARGET_MARGIN * (x1 - x0))
    tolerance = max(2, round(width * MARGIN_TOLERANCE))
    if all(abs(border - pad_px) <= tolerance for border in borders):
        return {"rel": rel, "status": "skip_same", "margin": min(margins)}

    # Rebuild from the pristine original so repeated runs never stack lossy encodes.
    source = source_path_for(rel)
    img = current
    if source != target:
        reloaded = _load(source)
        if reloaded is None:
            return {"rel": rel, "status": "failed", "error": "backup unreadable"}
        img = reloaded[0]

    has_alpha = img.mode in {"RGBA", "LA"} or (img.mode == "P" and "transparency" in img.info)
    img = img.convert("RGBA") if has_alpha else img.convert("RGB")

    src_bbox = content_bbox(img)
    if src_bbox is None:
        return {"rel": rel, "status": "skip_uniform"}

    fill, _ = detect_background(img)
    cropped = img.crop(src_bbox)
    pad = round(TARGET_MARGIN * cropped.size[0])
    padded = ImageOps.expand(cropped, border=pad, fill=fill)

    # Geometry check: if re-deriving lands on the delivered size, the file is
    # already normalized (the pixel heuristic can mis-read borders on noisy
    # re-encodes, so geometry is the authoritative test).
    if padded.size == current.size:
        return {"rel": rel, "status": "skip_same", "margin": min(margins)}

    if max(padded.size) > MAX_EDGE:
        scale = MAX_EDGE / max(padded.size)
        padded = padded.resize(
            (max(1, round(padded.width * scale)), max(1, round(padded.height * scale))),
            Image.LANCZOS,
        )

    return {
        "rel": rel,
        "status": "pending",
        "before": (current.size, min(margins)),
        "after": padded.size,
        "image": padded,
        "bytes_before": target.stat().st_size,
    }


def save_result(record: dict) -> dict:
    padded: Image.Image = record.pop("image")
    rel = record["rel"]
    ensure_backup(rel)
    out = ROOT / rel
    padded.save(out, "WEBP", quality=WEBP_QUALITY, method=WEBP_METHOD)
    record["bytes_after"] = out.stat().st_size
    record["status"] = "applied"
    return record


def bucket(margin: float) -> str:
    if margin < 0.01:
        return "<1%"
    if margin < 0.03:
        return "1-3%"
    if margin <= 0.20:
        return "3-20%"
    return ">20%"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="write changes (default is dry-run)")
    parser.add_argument("--restore", action="store_true", help="copy raw/media-originals back into media/")
    parser.add_argument("--limit", type=int, default=0, help="only process the first N candidates")
    parser.add_argument("--jobs", type=int, default=max(2, min(8, os.cpu_count() or 2)))
    args = parser.parse_args()

    if args.restore:
        restored = 0
        for backup in BACKUP_DIR.rglob("*"):
            if not backup.is_file():
                continue
            rel = backup.relative_to(BACKUP_DIR)
            target = ROOT / rel
            if target.exists():
                shutil.copy2(backup, target)
                restored += 1
        print(f"✓ 已恢复 {restored} 个原图到 media/")
        return 0

    refs = scan_references()
    candidates = sorted(
        rel
        for rel in refs
        if rel.startswith("media/images/")
        and Path(rel).suffix.lower() in RASTER_EXT
        and (ROOT / rel).exists()
    )
    if args.limit:
        candidates = candidates[: args.limit]

    mode = "apply" if args.apply else "dry-run"
    print(f"留白归一（{mode}）")
    print(f"  引用图片候选 {len(candidates)} 个，目标留白 {TARGET_MARGIN * 100:.0f}% 宽度，并行 {args.jobs}")

    results: list[dict] = []
    pending: list[dict] = []
    with mp.Pool(args.jobs) as pool:
        for index, record in enumerate(pool.imap_unordered(process_one, candidates), 1):
            if record["status"] == "pending":
                pending.append(record)
            else:
                results.append(record)
            if index % 200 == 0:
                print(f"    已扫描 {index}/{len(candidates)}")

    stats: dict[str, int] = {}
    for record in results:
        stats[record["status"]] = stats.get(record["status"], 0) + 1

    scanned_margins = [r["margin"] for r in results if "margin" in r]
    scanned_margins += [r["before"][1] for r in pending]
    buckets: dict[str, int] = {}
    for margin in scanned_margins:
        buckets[bucket(margin)] = buckets.get(bucket(margin), 0) + 1

    print("\n  当前留白分布（可测量图片）")
    for key in ["<1%", "1-3%", "3-20%", ">20%"]:
        print(f"    {key:>6s}  {buckets.get(key, 0)}")

    print("\n  分类")
    for key, label in [
        ("skip_same", "已达标，跳过"),
        ("skip_animated", "动态 WebP，豁免"),
        ("skip_vector", "矢量图，豁免"),
        ("skip_uniform", "整图同色，无法定位内容"),
        ("skip_icon", "小尺寸图标，非配图"),
        ("missing", "文件缺失"),
        ("failed", "读取失败"),
    ]:
        if stats.get(key):
            print(f"    {label:<18s} {stats[key]}")
    print(f"    {'待归一':<18s} {len(pending)}")

    if not pending:
        print("\n✓ 没有需要处理的图片")
        return 0

    if not args.apply:
        pending.sort(key=lambda r: r["bytes_before"], reverse=True)
        print("\n  待处理最大的 10 个：")
        for record in pending[:10]:
            (w, h), margin = record["before"]
            print(f"    {record['bytes_before'] / 1048576:6.1f}MB  {w}x{h}  留白 {margin * 100:4.1f}%  {record['rel']}")
        print("\n未执行。确认后运行：python3 scripts/normalize-image-margins.py --apply")
        return 0

    applied = 0
    saved_before = saved_after = 0
    with mp.Pool(args.jobs) as pool:
        for index, record in enumerate(pool.imap_unordered(save_result, pending), 1):
            applied += 1
            saved_before += record["bytes_before"]
            saved_after += record["bytes_after"]
            if index % 200 == 0:
                print(f"    已写入 {index}/{len(pending)}")

    delta = saved_after - saved_before
    print(f"\n✓ 归一 {applied} 张")
    print(f"  体积 {saved_before / 1e6:.1f}MB → {saved_after / 1e6:.1f}MB ({delta / 1e6:+.1f}MB)")
    print(f"  原图备份在 raw/media-originals/（--restore 可回滚）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
