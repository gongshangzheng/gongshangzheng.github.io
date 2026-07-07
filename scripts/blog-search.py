#!/usr/bin/env python3
"""
博客统一检索脚本。

数据源：public/search-index.json（构建产物，包含所有文章元数据）
用法：
    ~/.venv/bin/python scripts/blog-search.py --tag diffusion
    ~/.venv/bin/python scripts/blog-search.py --category AI --subcategory 数字人  # 旧用法，已弃用
    ~/.venv/bin/python scripts/blog-search.py --category-path "AI/数字人"
    ~/.venv/bin/python scripts/blog-search.py --keyword "视觉分词器"
    ~/.venv/bin/python scripts/blog-search.py --alias TiTok
    ~/.venv/bin/python scripts/blog-search.py --list-categories
    ~/.venv/bin/python scripts/blog-search.py --list-tags --top 30
    ~/.venv/bin/python scripts/blog-search.py --format json --tag GAN

选项可组合：--category + --keyword 表示在该分类下搜关键词。
默认输出人类可读表格；加 --format json 输出 JSON 数组。
"""

import argparse
import json
import sys
from pathlib import Path
from collections import Counter


def load_index(repo_root: Path) -> list[dict]:
    index_path = repo_root / "public" / "search-index.json"
    if not index_path.exists():
        print(f"错误：找不到 {index_path}，请先运行 node build.js 生成索引。", file=sys.stderr)
        sys.exit(1)
    with open(index_path, encoding="utf-8") as f:
        return json.load(f)


def match(post: dict, args) -> bool:
    """根据命令行参数判断文章是否匹配。所有指定条件取交集。"""
    if args.category_path:
        target = [s.strip() for s in args.category_path.split("/")]
        path = post.get("categoryPath", [])
        if len(path) < len(target):
            return False
        for i, t in enumerate(target):
            if path[i].lower() != t.lower():
                return False

    if args.tag:
        tags_lower = [t.lower() for t in post.get("tags", [])]
        if args.tag.lower() not in tags_lower:
            return False

    if args.category:
        cats_lower = [c.lower() for c in post.get("categoryPath", [])]
        if args.category.lower() not in cats_lower:
            return False

    if args.subcategory:
        path = post.get("categoryPath", [])
        sub = (path[1] if len(path) > 1 else "").lower() if path else ""
        if sub != args.subcategory.lower():
            return False

    if args.keyword:
        kw = args.keyword.lower()
        haystack = " ".join([
            post.get("title", ""),
            post.get("description", ""),
            " ".join(post.get("tags", [])),
            " ".join(post.get("categoryPath", [])),
        ]).lower()
        if kw not in haystack:
            return False

    if args.alias:
        aliases_lower = [a.lower() for a in post.get("aliases", [])]
        if args.alias.lower() not in aliases_lower:
            return False

    return True


def print_table(posts: list[dict], max_rows: int | None = None):
    """人类可读的表格输出。"""
    if not posts:
        print("（无匹配文章）")
        return

    display = posts[:max_rows] if max_rows else posts
    # 计算列宽
    title_w = max(len(p.get("title", "")) for p in display)
    title_w = min(title_w, 60)  # 防止过宽
    date_w = 10
    sub_id_w = 6

    header = f"{'标题':<{title_w}}  {'日期':<{date_w}}  {'sub_id':>{sub_id_w}}  分类/子分类  标签"
    print(header)
    print("-" * len(header.encode('gbk', errors='replace')))

    for p in display:
        title = p.get("title", "")
        if len(title) > title_w:
            title = title[:title_w - 1] + "…"
        date = (p.get("created_at") or "")[:10]
        sid = p.get("sub_id")
        sid_display = str(sid) if sid is not None else ""
        path = p.get("categoryPath", [])
        cat = path[0] if path else ""
        sub = path[1] if len(path) > 1 else ""
        cat_display = f"{cat}/{sub}" if sub else cat
        tags = ", ".join(p.get("tags", []))
        print(f"{title:<{title_w}}  {date:<{date_w}}  {sid_display:>{sub_id_w}}  {cat_display:<20}  {tags}")

    if max_rows and len(posts) > max_rows:
        print(f"\n… 共 {len(posts)} 篇，仅显示前 {max_rows} 篇。加 --limit 调整。")
    else:
        print(f"\n共 {len(posts)} 篇。")


def list_categories(posts: list[dict]):
    """列出所有 category → subcategory 结构及文章数。"""
    tree: dict[str, Counter] = {}
    for p in posts:
        path = p.get("categoryPath", [])
        for i, cat in enumerate(path):
            sub = path[i+1] if i+1 < len(path) else "(叶子)"
            tree.setdefault(cat, Counter())[sub] += 1

    for cat in sorted(tree):
        subs = tree[cat]
        total = sum(subs.values())
        print(f"\n【{cat}】({total} 篇)")
        for sub, count in subs.most_common():
            print(f"  {sub:<24} {count:>4} 篇")


def list_tags(posts: list[dict], top_n: int):
    """列出使用频率最高的 tag。"""
    counter = Counter()
    for p in posts:
        for t in p.get("tags", []):
            counter[t] += 1

    print(f"Top {top_n} 标签：\n")
    for tag, count in counter.most_common(top_n):
        print(f"  {tag:<30} {count:>4} 篇")


def main():
    parser = argparse.ArgumentParser(description="博客统一检索")
    parser.add_argument("--tag", help="按标签精确匹配（大小写不敏感）")
    parser.add_argument("--category", help="按分类精确匹配")
    parser.add_argument("--subcategory", help="按子分类精确匹配（从 categoryPath[1] 派生）")
    parser.add_argument("--category-path", help="按分类路径精确匹配（如 AI/数字人）")
    parser.add_argument("--keyword", help="在标题/描述/标签/子分类中模糊搜索")
    parser.add_argument("--alias", help="按别名精确匹配")
    parser.add_argument("--list-categories", action="store_true", help="列出完整分类体系及文章数")
    parser.add_argument("--list-tags", action="store_true", help="列出高频标签")
    parser.add_argument("--top", type=int, default=30, help="--list-tags 时显示的标签数量")
    parser.add_argument("--limit", type=int, default=None, help="限制输出行数")
    parser.add_argument("--format", choices=["table", "json"], default="table", help="输出格式")
    parser.add_argument("--repo", default=".", help="仓库根目录（默认当前目录）")

    args = parser.parse_args()
    repo_root = Path(args.repo).resolve()
    posts = load_index(repo_root)

    # 列表模式
    if args.list_categories:
        list_categories(posts)
        return
    if args.list_tags:
        list_tags(posts, args.top)
        return

    # 至少需要一个检索条件
    has_filter = any([args.tag, args.category, args.subcategory, args.category_path, args.keyword, args.alias])
    if not has_filter:
        parser.print_help()
        print("\n请至少指定一个检索条件（--tag / --category / --subcategory / --keyword / --alias）")
        sys.exit(1)

    matched = [p for p in posts if match(p, args)]

    # 按创建时间倒序
    matched.sort(key=lambda p: p.get("created_at", ""), reverse=True)

    if args.format == "json":
        output = matched[:args.limit] if args.limit else matched
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print_table(matched, args.limit)


if __name__ == "__main__":
    main()
