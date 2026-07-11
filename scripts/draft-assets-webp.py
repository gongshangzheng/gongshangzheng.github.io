#!/usr/bin/env python3
"""把 drafts/assets/ 下的图片转成 webp，并更新草稿里的引用。

能转 webp 的尽量转 webp（png/jpg/jpeg/gif → webp），减小体积、和站点 media/images 一致。

用法:
  ~/.venv/bin/python3 scripts/draft-assets-webp.py                       # 全部转换 + 更新引用 + 删原图
  ~/.venv/bin/python3 scripts/draft-assets-webp.py --slug model-training  # 只转某草稿的资产
  ~/.venv/bin/python3 scripts/draft-assets-webp.py --keep                 # 保留原图
  ~/.venv/bin/python3 scripts/draft-assets-webp.py --dry-run              # 只看会做什么
  ~/.venv/bin/python3 scripts/draft-assets-webp.py --quality 85           # 自定义质量（默认 90）

转 webp 后，草稿正文里 ![alt](assets/<slug>/<name>.png) / [[file:assets/<slug>/<name>.png]]
的引用自动改成 .webp。已是 webp 的跳过；转换失败的跳过并报告。
"""
import argparse, os
from pathlib import Path

REPO = Path(os.path.expanduser('~/gongshangzheng.github.io'))
DRAFTS = REPO / 'drafts'
ASSETS = DRAFTS / 'assets'
CONVERT_EXTS = ('.png', '.jpg', '.jpeg', '.gif')


def convert_image(img_path: Path, out_path: Path, quality: int) -> tuple[bool, str]:
    """转 webp。返回 (ok, message)。"""
    try:
        from PIL import Image
        im = Image.open(str(img_path))
        # RGBA/P 保持，否则 RGB；webp 支持透明
        im.save(str(out_path), 'WEBP', quality=quality, method=6)
        before = img_path.stat().st_size
        after = out_path.stat().st_size
        return True, f'{before//1024}KB → {after//1024}KB'
    except Exception as e:
        return False, f'失败: {e}'


def update_refs(draft_files: list[Path], old_ref: str, new_ref: str, dry: bool) -> int:
    """把草稿正文里 old_ref 替换为 new_ref。返回改动文件数。"""
    changed = 0
    for d in draft_files:
        txt = d.read_text(encoding='utf-8')
        if old_ref not in txt:
            continue
        new = txt.replace(old_ref, new_ref)
        if new == txt:
            continue
        if not dry:
            d.write_text(new, encoding='utf-8')
        changed += 1
    return changed


def all_draft_files() -> list[Path]:
    return sorted(list(DRAFTS.glob('*.md')) + list(DRAFTS.glob('*.org')))


def main():
    ap = argparse.ArgumentParser(description='drafts/assets 图片转 webp + 更新引用')
    ap.add_argument('--slug', help='只处理 drafts/assets/<slug>/ 下的图')
    ap.add_argument('--quality', type=int, default=90, help='webp 质量 1-100（默认 90）')
    ap.add_argument('--keep', action='store_true', help='保留原图，不删')
    ap.add_argument('--dry-run', action='store_true', help='只打印会做什么，不执行')
    args = ap.parse_args()

    if not ASSETS.exists():
        print('drafts/assets/ 不存在，无可转换图。')
        return

    # 收集待转换图片
    imgs = []
    for ext in CONVERT_EXTS:
        if args.slug:
            imgs.extend(sorted((ASSETS / args.slug).glob(f'*{ext}')))
        else:
            imgs.extend(sorted(ASSETS.rglob(f'*{ext}')))
    # 去重（rglob 可能重复 ext）
    imgs = sorted(set(imgs))

    if not imgs:
        print('没有可转换的图（png/jpg/jpeg/gif）。已是 webp 的跳过。')
        return

    draft_files = all_draft_files()
    n_ok = n_fail = n_ref = 0
    for img in imgs:
        out = img.with_suffix('.webp')
        slug = img.parent.name
        old_ref = f'assets/{slug}/{img.name}'
        new_ref = f'assets/{slug}/{out.name}'
        if args.dry_run:
            print(f'[dry] convert {img.relative_to(REPO)} → {out.name}', end='')
            if not args.keep:
                print(' (并删原图)', end='')
            print()
        else:
            ok, msg = convert_image(img, out, args.quality)
            if ok:
                n_ok += 1
                refs = update_refs(draft_files, old_ref, new_ref, args.dry_run)
                n_ref += refs
                if not args.keep:
                    img.unlink()
                print(f'✅ {img.name} → {out.name} ({msg}), 更新 {refs} 个草稿引用')
            else:
                n_fail += 1
                print(f'❌ {img.name}: {msg}')

    print(f'\n完成: 转换 {n_ok} 张, 失败 {n_fail}, 更新引用 {n_ref} 处。' + (' (dry-run, 未实际执行)' if args.dry_run else ''))


if __name__ == '__main__':
    main()
