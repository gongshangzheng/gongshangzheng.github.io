#!/usr/bin/env python3
"""
check-sub-id.py — sub_id 分配检查工具

扫描 src/pages/*.html，按 aliases 中的 categories/ 路径分组，
显示每组已用的 sub_id 编号，并推荐下一个可用编号。

用法:
    # 查看所有分类路径的 sub_id 分布
    python3 scripts/check-sub-id.py

    # 只看某个分类路径（支持部分匹配）
    python3 scripts/check-sub-id.py --category 数字人

    # 只输出下一个可用 sub_id（agent 友好，排除 Hub 页）
    python3 scripts/check-sub-id.py --category 数字人 --suggest

    # 查看指定文件列表
    python3 scripts/check-sub-id.py --files paper-x-portrait.html lia-x-2025.html
"""

import argparse
import re
import sys
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent
PAGES_DIR = PROJECT_ROOT / "src" / "pages"


def parse_frontmatter(content):
    """提取 frontmatter 中的 title, sub_id, aliases"""
    fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not fm_match:
        return {}, {}
    
    fm = fm_match.group(1)
    fields = {}
    
    # Simple YAML parsing for our specific fields
    title_m = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm, re.MULTILINE)
    if title_m:
        fields['title'] = title_m.group(1).strip()
    
    sub_id_m = re.search(r'^sub_id:\s*(\d+)', fm, re.MULTILINE)
    if sub_id_m:
        fields['sub_id'] = int(sub_id_m.group(1))
    
    # Extract aliases (may be multi-line array)
    aliases_m = re.search(r'^aliases:\s*\[(.*?)\]', fm, re.MULTILINE | re.DOTALL)
    if aliases_m:
        aliases_str = aliases_m.group(1)
        aliases = [a.strip().strip('"\'') for a in aliases_str.split(',') if a.strip()]
        fields['aliases'] = aliases
    else:
        # Try multi-line format
        aliases_m = re.search(r'^aliases:\s*\n((?:\s+-\s+.*\n?)+)', fm, re.MULTILINE)
        if aliases_m:
            aliases = re.findall(r'-\s+["\']?(.*?)["\']?\s*$', aliases_m.group(1), re.MULTILINE)
            fields['aliases'] = [a.strip() for a in aliases if a.strip()]
    
    return fields, {}


def extract_category_path(aliases):
    """从 aliases 中提取 categories/ 路径"""
    if not aliases:
        return None
    for alias in aliases:
        if alias.startswith('categories/'):
            return alias
    return None


def scan_all_pages():
    """扫描所有 HTML 页面，返回 {category_path: [(sub_id, filename, title)]}"""
    result = defaultdict(list)
    
    for html_file in sorted(PAGES_DIR.glob("*.html")):
        content = html_file.read_text(errors='ignore')
        fields, _ = parse_frontmatter(content)
        
        cat_path = extract_category_path(fields.get('aliases', []))
        if not cat_path:
            continue
        
        sub_id = fields.get('sub_id')
        title = fields.get('title', '(no title)')
        filename = html_file.name
        
        result[cat_path].append((sub_id, filename, title))
    
    return result


def find_next_sub_id(entries, step=10):
    """找到下一个可用的 sub_id"""
    ids = [e[0] for e in entries if e[0] is not None]
    if not ids:
        return step
    
    max_id = max(ids)
    # Round up to next step
    next_id = ((max_id // step) + 1) * step
    return next_id


def check_conflicts(entries, step=10):
    """检查 sub_id 冲突"""
    conflicts = []
    id_map = defaultdict(list)
    for sub_id, filename, title in entries:
        if sub_id is not None:
            id_map[sub_id].append((filename, title))
    
    for sub_id, files in id_map.items():
        if len(files) > 1:
            conflicts.append((sub_id, files))
    
    return conflicts


def check_step_violation(entries, step=10):
    """检查步长是否为 10"""
    violations = []
    ids = sorted([e[0] for e in entries if e[0] is not None])
    for i in range(1, len(ids)):
        diff = ids[i] - ids[i-1]
        if diff != step and diff > 0 and diff % step != 0:
            violations.append((ids[i-1], ids[i], diff))
    return violations


def print_category_report(cat_path, entries, step=10):
    """打印单个分类路径的报告"""
    print(f"\n{'=' * 70}")
    print(f"📂 {cat_path}")
    print(f"{'=' * 70}")
    
    # Sort by sub_id
    sorted_entries = sorted(entries, key=lambda x: x[0] if x[0] is not None else 99999)
    
    for sub_id, filename, title in sorted_entries:
        if sub_id is not None:
            print(f"  {sub_id:>4d}  {filename:40s}  {title[:50]}")
        else:
            print(f"   --  {filename:40s}  {title[:50]}  ⚠️ 无 sub_id")
    
    # Stats
    ids = [e[0] for e in entries if e[0] is not None]
    if ids:
        next_id = find_next_sub_id(entries, step)
        print(f"\n  📊 共 {len(entries)} 篇，已用编号: {sorted(ids)}")
        print(f"  ➡️  下一个可用 sub_id: {next_id}")
    
    # Conflict check
    conflicts = check_conflicts(entries, step)
    if conflicts:
        print(f"\n  ❌ sub_id 冲突：")
        for sub_id, files in conflicts:
            print(f"     sub_id={sub_id}:")
            for f, t in files:
                print(f"       - {f} ({t})")
    
    # Step violation check
    violations = check_step_violation(entries, step)
    if violations:
        print(f"\n  ⚠️ 步长异常（非 {step} 的倍数）：")
        for prev, curr, diff in violations:
            print(f"     {prev} → {curr} (差={diff})")


def main():
    parser = argparse.ArgumentParser(
        description='sub_id 分配检查工具：扫描分类路径，显示已用编号，推荐下一个可用编号',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 查看所有分类路径
  python3 scripts/check-sub-id.py

  # 只看包含"数字人"的路径
  python3 scripts/check-sub-id.py --category 数字人

  # 只输出下一个可用 sub_id（排除 Hub 页）
  python3 scripts/check-sub-id.py --category 数字人 --suggest

  # 指定步长（默认 10）
  python3 scripts/check-sub-id.py --step 10
        """
    )
    parser.add_argument('--category', '-c', default=None,
                        help='筛选分类路径（部分匹配）')
    parser.add_argument('--step', type=int, default=10,
                        help='sub_id 步长（默认 10）')
    parser.add_argument('--files', '-f', nargs='*', default=None,
                        help='只检查指定文件')
    parser.add_argument('--suggest', '-s', action='store_true',
                        help='只输出下一个可用 sub_id（每行：<sub_id>\\t<路径>），排除 Hub 页')

    args = parser.parse_args()

    all_data = scan_all_pages()

    if not all_data:
        print("未找到任何带 categories/ 路径的文章")
        sys.exit(0)

    # Filter by category
    if args.category:
        filtered = {k: v for k, v in all_data.items() if args.category in k}
        if not filtered:
            print(f"未找到包含 '{args.category}' 的分类路径")
            print(f"可用路径: {list(all_data.keys())}")
            sys.exit(1)
        all_data = filtered

    # Filter by files
    if args.files:
        file_set = set(args.files)
        filtered = {}
        for cat, entries in all_data.items():
            filtered[cat] = [e for e in entries if e[1] in file_set]
        all_data = {k: v for k, v in filtered.items() if v}

    # Suggest mode: print next available sub_id per non-index path
    if args.suggest:
        non_index = {k: v for k, v in all_data.items() if not k.endswith('/index')}
        if not non_index:
            print("未找到非 Hub 分类路径（所有匹配均为 index 页）", file=sys.stderr)
            sys.exit(1)
        for cat_path in sorted(non_index.keys()):
            next_id = find_next_sub_id(non_index[cat_path], args.step)
            print(f"{next_id}\t{cat_path}")
        sys.exit(0)
    
    # Print report
    print(f"\n{'#' * 70}")
    print(f"# sub_id 分配报告")
    print(f"# 步长: {args.step}")
    print(f"# 分类路径数: {len(all_data)}")
    print(f"{'#' * 70}")
    
    for cat_path in sorted(all_data.keys()):
        print_category_report(cat_path, all_data[cat_path], args.step)
    
    print(f"\n{'=' * 70}")
    print(f"✅ 检查完成")


if __name__ == '__main__':
    main()
