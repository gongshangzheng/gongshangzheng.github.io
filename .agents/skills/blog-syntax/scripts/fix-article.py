#!/usr/bin/env python3
"""
fix-article.py — Blog article auto-fix script.

Fixes common errors introduced by AI agents when editing blog articles:
  1. <figure class="paper-figure"> → <div class="photo">
  2. </figure> → </div>
  3. <figcaption> → <div class="cap">
  4. </figcaption> → </div>
  5. <img src="/media/... → <img src="media/...  (remove leading slash)
  6. <img src="....png"> → .webp  (if .webp file exists)
  7. Remove deprecated frontmatter fields: hub, categories, subcategory, subsubcategory
  8. Fix orphan </p> tags (line ends with </p> but has no matching <p> on that line)

Usage:
    # Preview fixes (no write)
    ~/.venv/bin/python3 scripts/fix-article.py src/pages/article.html --dry-run

    # Apply fixes
    ~/.venv/bin/python3 scripts/fix-article.py src/pages/article.html

    # Batch fix
    ~/.venv/bin/python3 scripts/fix-article.py src/pages/*.html

    # Fix only specific rules
    ~/.venv/bin/python3 scripts/fix-article.py src/pages/article.html --rules figure,frontmatter
"""

import argparse
import os
import re
import sys
from pathlib import Path

# Walk up to find project root (contains build.js)
# Script is at .agents/skills/blog-syntax/scripts/fix-article.py
PROJECT_ROOT = Path(__file__).resolve().parent
while PROJECT_ROOT != PROJECT_ROOT.parent:
    if (PROJECT_ROOT / 'build.js').exists():
        break
    PROJECT_ROOT = PROJECT_ROOT.parent

DEPRECATED_FM_FIELDS = {'hub', 'categories', 'subcategory', 'subsubcategory'}

ALL_RULES = ['figure', 'imgpath', 'imgext', 'frontmatter', 'orphan_p']


def parse_frontmatter_range(content):
    """Return (start, end) line indices of frontmatter block, or None."""
    lines = content.split('\n')
    if not lines or lines[0].strip() != '---':
        return None
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            return (0, i)
    return None


def fix_figure_tags(content):
    """Replace <figure>/<figcaption> with <div class="photo">/<div class="cap">."""
    changes = []

    pattern = r'<figure[^>]*class="[^"]*paper-figure[^"]*"[^>]*>'
    if re.search(pattern, content):
        content = re.sub(pattern, '<div class="photo">', content)
        changes.append('<figure class="paper-figure"> -> <div class="photo">')

    pattern = r'<figure\b[^>]*>'
    if re.search(pattern, content):
        content = re.sub(pattern, '<div class="photo">', content)
        changes.append('<figure> -> <div class="photo">')

    if '</figure>' in content:
        content = content.replace('</figure>', '</div>')
        changes.append('</figure> -> </div>')

    pattern = r'<figcaption\b[^>]*>'
    if re.search(pattern, content):
        content = re.sub(pattern, '<div class="cap">', content)
        changes.append('<figcaption> -> <div class="cap">')

    if '</figcaption>' in content:
        content = content.replace('</figcaption>', '</div>')
        changes.append('</figcaption> -> </div>')

    return content, changes


def fix_img_leading_slash(content):
    """Remove leading slash from <img src="/media/...">."""
    changes = []
    pattern = r'(<img\s+[^>]*src=")/media/'
    if re.search(pattern, content):
        content = re.sub(pattern, r'\1media/', content)
        changes.append('<img src="/media/... -> <img src="media/...')
    return content, changes


def fix_img_extension(content, file_path=None):
    """Replace .png/.jpg/.jpeg references with .webp if the .webp file exists."""
    changes = []

    def replace_ext(match):
        prefix = match.group(1)
        stem = match.group(2)
        ext = match.group(3)
        new_src = f"{prefix}{stem}.webp"

        if file_path:
            webp_path = PROJECT_ROOT / new_src
            if webp_path.exists():
                return f'{prefix}{stem}.webp"'
            else:
                return match.group(0)

        return new_src + '"'

    pattern = r'(<img\s+[^>]*src=")([^"]+?)\.(png|jpe?g|gif|bmp|tiff?)"'
    old_content = content
    content = re.sub(pattern, replace_ext, content, flags=re.IGNORECASE)
    if content != old_content:
        changes.append('.png/.jpg -> .webp (where .webp exists)')
    return content, changes


def fix_frontmatter(content):
    """Remove deprecated frontmatter fields."""
    changes = []
    fm_range = parse_frontmatter_range(content)
    if not fm_range:
        return content, changes

    lines = content.split('\n')
    fm_start, fm_end = fm_range
    new_lines = []
    removed_fields = []

    for i, line in enumerate(lines):
        if fm_start < i <= fm_end:
            match = re.match(r'^(\w+):\s', line)
            if match and match.group(1) in DEPRECATED_FM_FIELDS:
                removed_fields.append(match.group(1))
                continue
        new_lines.append(line)

    if removed_fields:
        content = '\n'.join(new_lines)
        changes.append(f'Removed deprecated fields: {", ".join(removed_fields)}')

    return content, changes


def fix_orphan_close_p(content):
    """Remove orphan </p> tags: line ends with </p> but has no matching <p> on that line."""
    changes = []
    lines = content.split('\n')
    new_lines = []
    fixed_count = 0

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('---'):
            new_lines.append(line)
            continue

        if stripped.endswith('</p>'):
            open_count = len(re.findall(r'<p\b', line, re.IGNORECASE))
            close_count = len(re.findall(r'</p>', line, re.IGNORECASE))

            if open_count == 0 and close_count == 1:
                line = line.replace('</p>', '', 1)
                fixed_count += 1

        new_lines.append(line)

    if fixed_count:
        content = '\n'.join(new_lines)
        changes.append(f'Removed {fixed_count} orphan </p> tag(s)')

    return content, changes


def process_file(file_path, rules, dry_run=False):
    """Apply all fix rules to a single file."""
    path = Path(file_path).resolve()
    if not path.exists():
        print(f"  SKIP: {file_path} not found")
        return False

    content = path.read_text(encoding='utf-8')
    original = content
    all_changes = []

    rule_map = {
        'figure': lambda c: fix_figure_tags(c),
        'imgpath': lambda c: fix_img_leading_slash(c),
        'imgext': lambda c: fix_img_extension(c, path),
        'frontmatter': lambda c: fix_frontmatter(c),
        'orphan_p': lambda c: fix_orphan_close_p(c),
    }

    for rule in rules:
        if rule in rule_map:
            content, changes = rule_map[rule](content)
            all_changes.extend(changes)

    if content == original:
        return False

    try:
        rel = path.relative_to(PROJECT_ROOT)
    except ValueError:
        rel = path
    if dry_run:
        print(f"\n  DRY RUN: {rel}")
        for ch in all_changes:
            print(f"    + {ch}")
    else:
        path.write_text(content, encoding='utf-8')
        print(f"\n  FIXED: {rel}")
        for ch in all_changes:
            print(f"    + {ch}")

    return True


def main():
    parser = argparse.ArgumentParser(description='Auto-fix common blog article errors')
    parser.add_argument('files', nargs='+', help='HTML files to fix (supports glob)')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without writing')
    parser.add_argument('--rules', default=','.join(ALL_RULES),
                        help=f'Comma-separated rules to apply (default: all). Options: {", ".join(ALL_RULES)}')
    args = parser.parse_args()

    rules = [r.strip() for r in args.rules.split(',')]
    for r in rules:
        if r not in ALL_RULES:
            print(f"Error: unknown rule '{r}'. Options: {', '.join(ALL_RULES)}")
            sys.exit(1)

    import glob
    files = []
    for pattern in args.files:
        expanded = glob.glob(pattern)
        if expanded:
            files.extend(expanded)
        else:
            files.append(pattern)

    print(f"{'DRY RUN: ' if args.dry_run else ''}Processing {len(files)} file(s) with rules: {', '.join(rules)}")

    fixed_count = 0
    for f in files:
        if process_file(f, rules, args.dry_run):
            fixed_count += 1

    print(f"\n{'Would fix' if args.dry_run else 'Fixed'} {fixed_count} file(s).")


if __name__ == '__main__':
    main()
