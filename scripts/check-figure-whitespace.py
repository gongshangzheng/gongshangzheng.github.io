#!/usr/bin/env python3
"""Fail when a newly published WebP has a large, unused white margin."""

import argparse
import importlib.util
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
CONVERTER = ROOT / "scripts" / "convert-figures.py"
spec = importlib.util.spec_from_file_location("convert_figures", CONVERTER)
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)


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
    cropped = converter.crop_whitespace(image)
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
