#!/usr/bin/env python3
"""
cross-link.py — 交叉引用回链自动补全工具

扫描博客中所有 HTML 文件，自动补全指向精读文章的交叉链接：
1. .sources 列表中的 data-cite-key 匹配 → 追加 "精读 →" 链接
2. 正文中论文名首次出现 → 包裹为 <a> 链接

规则（来自 read-article/references/cross-linking.md）：
- 只有 title 包含"精读"或"深度解读"的文章才是精读文章
- 只用主 cite-key（每篇文章的第一个 data-cite-key）做映射
- 每篇文章中每个论文名只链接首次出现
- 跳过 frontmatter、.sources 区域、已有 <a> 标签内、表格短文本

用法:
    # 执行完整回链（清理 + 构建 + 补全）
    python3 scripts/cross-link.py

    # 只查看会做什么修改，不实际写入（dry-run）
    python3 scripts/cross-link.py --dry-run

    # 只补全 .sources 链接（跳过正文链接）
    python3 scripts/cross-link.py --sources-only

    # 只补全正文链接（跳过 .sources 链接）
    python3 scripts/cross-link.py --body-only
"""

import argparse
import re
import os
import sys
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent
PAGES_DIR = PROJECT_ROOT / "src" / "pages"


def is_reading_article(title):
    """判断是否是精读文章"""
    return '精读' in title or '深度解读' in title


def extract_paper_name(title):
    """从标题中提取论文简称"""
    # "数字人论文精读（N）：论文名，副标题" → "论文名"
    m = re.search(r'(?:论文精读|精读)[（(]\d+[）)]：([^，,\s]+)', title)
    if m:
        return m.group(1).strip()
    # "XXX深度解读：论文名" → "论文名"
    if '深度解读' in title and '：' in title:
        return title.split('：')[1].strip()
    # "XXX：论文名" → "论文名"
    if '：' in title:
        return title.split('：')[-1].strip()
    return ''


def build_mappings(files):
    """构建 cite-key → 精读文章 和 论文名 → 精读文章 的映射"""
    cite_to_paper = {}
    name_to_paper = {}

    for filepath in files:
        content = filepath.read_text(errors='ignore')
        
        # Extract title
        title_m = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', content, re.MULTILINE)
        if not title_m:
            continue
        title = title_m.group(1).strip()
        
        if not is_reading_article(title):
            continue
        
        # Extract cite-keys (only the first one is primary)
        keys = re.findall(r'data-cite-key="([^"]+)"', content)
        if not keys:
            continue
        
        primary_key = keys[0]
        cite_to_paper[primary_key] = filepath.name
        
        # Extract paper name
        paper_name = extract_paper_name(title)
        if paper_name:
            short_name = paper_name.split('，')[0].split(',')[0].strip()
            if short_name and len(short_name) > 1:
                name_to_paper[short_name] = filepath.name
    
    return cite_to_paper, name_to_paper


def clean_existing_links(files):
    """清理已有的精读链接"""
    cleaned = 0
    for filepath in files:
        if filepath.name.startswith('arxiv-digest'):
            continue
        
        content = filepath.read_text(errors='ignore')
        original = content
        
        # Remove " · <a href="..." class="paper-link">精读 →</a>" from .sources
        content = re.sub(r'\s*·\s*<a\s+href="[^"]*"\s+class="paper-link">精读 →</a>', '', content)
        content = re.sub(r'\s*<a\s+href="[^"]*"\s+class="paper-link">精读 →</a>', '', content)
        
        if content != original:
            filepath.write_text(content)
            cleaned += 1
    
    return cleaned


def add_sources_links(files, cite_to_paper):
    """在 .sources 列表中补全精读链接"""
    modified = 0
    
    for filepath in files:
        if filepath.name.startswith('arxiv-digest'):
            continue
        
        content = filepath.read_text(errors='ignore')
        original = content
        
        for cite_key, target_file in cite_to_paper.items():
            if target_file == filepath.name:
                continue
            
            # Find <li data-cite-key="KEY" ...>...</li> and add link if not present
            pattern = r'(<li\s+data-cite-key="' + re.escape(cite_key) + r'"[^>]*>)(.*?)(</li>)'
            
            def add_link(match, tf=target_file):
                li_content = match.group(2)
                if tf in li_content:
                    return match.group(0)  # Already has link
                return match.group(1) + li_content + ' · <a href="' + tf + '" class="paper-link">精读 →</a>' + match.group(3)
            
            content = re.sub(pattern, add_link, content, flags=re.DOTALL)
        
        if content != original:
            filepath.write_text(content)
            modified += 1
    
    return modified


def add_body_links(files, name_to_paper, cite_to_paper):
    """在正文中补全论文名的首次出现链接"""
    modified = 0
    
    for filepath in files:
        if filepath.name.startswith('arxiv-digest'):
            continue
        if filepath.name in name_to_paper.values():
            # Don't link within the reading article itself
            pass
        
        content = filepath.read_text(errors='ignore')
        original = content
        
        # Split into frontmatter + body + sources
        fm_end = content.find('-->', content.find('<!--')) if '<!--' in content else 0
        # Better: find the second --- that ends frontmatter
        fm_match = re.match(r'^(---\n.*?\n---\n)', content, re.DOTALL)
        if not fm_match:
            continue
        
        fm = fm_match.group(1)
        rest = content[len(fm):]
        
        # Find .sources section
        sources_start = rest.find('<div class="sources">')
        if sources_start >= 0:
            body = rest[:sources_start]
            sources = rest[sources_start:]
        else:
            body = rest
            sources = ''
        
        for name, target_file in name_to_paper.items():
            if target_file == filepath.name:
                continue
            if target_file in body:
                continue  # Already linked somewhere
            if name not in body:
                continue
            
            # Skip if already wrapped in <a>
            # Find first occurrence not inside an <a> tag
            # Simple approach: replace first occurrence that's not inside a tag
            
            # Find all positions
            positions = [m.start() for m in re.finditer(re.escape(name), body)]
            linked = False
            
            for pos in positions:
                # Check if inside an <a> tag
                before = body[:pos]
                last_open_a = before.rfind('<a ')
                last_close_a = before.rfind('</a>')
                
                if last_open_a > last_close_a:
                    continue  # Inside an <a> tag
                
                # Check if in a table cell (short text)
                # Find the current line
                line_start = body.rfind('\n', 0, pos) + 1
                line_end = body.find('\n', pos)
                if line_end < 0:
                    line_end = len(body)
                line = body[line_start:line_end]
                
                # Skip if in <th> or short <td>
                if re.search(r'<t[hd][^>]*>\s*$', before) and len(line.strip()) < 50:
                    continue
                
                # Check if already has a link to this file in body
                if f'href="{target_file}"' in body:
                    break
                
                # Safe to add link
                replacement = f'<a href="{target_file}">{name}</a>'
                body = body[:pos] + replacement + body[pos + len(name):]
                linked = True
                break  # Only first occurrence
        
        if body != rest[:len(body) if sources_start >= 0 else len(rest)]:
            pass  # Will be caught by content != original below
        
        # Reassemble
        new_content = fm + body + sources
        
        if new_content != original:
            filepath.write_text(new_content)
            modified += 1
    
    return modified


def main():
    parser = argparse.ArgumentParser(
        description='交叉引用回链自动补全工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 完整回链（清理 + 构建 + 补全）
  python3 scripts/cross-link.py

  # 只查看会做什么修改，不实际写入
  python3 scripts/cross-link.py --dry-run

  # 只补全 .sources 链接
  python3 scripts/cross-link.py --sources-only
        """
    )
    parser.add_argument('--dry-run', action='store_true', help='只显示会做什么修改，不实际写入')
    parser.add_argument('--sources-only', action='store_true', help='只补全 .sources 链接')
    parser.add_argument('--body-only', action='store_true', help='只补全正文链接')
    parser.add_argument('--no-clean', action='store_true', help='跳过清理已有链接步骤')

    args = parser.parse_args()
    
    files = sorted(PAGES_DIR.glob("*.html"))
    print(f"扫描 {len(files)} 个 HTML 文件...\n")
    
    # Step 1: Build mappings
    cite_to_paper, name_to_paper = build_mappings(files)
    
    print(f"📋 精读文章映射:")
    print(f"   cite-key 映射: {len(cite_to_paper)} 篇")
    print(f"   论文名映射: {len(name_to_paper)} 篇")
    
    if args.dry_run:
        print(f"\n🔍 Dry run 模式：以下为会修改的内容\n")
    
    if not args.dry_run:
        # Step 2: Clean existing links
        if not args.no_clean:
            cleaned = clean_existing_links(files)
            print(f"\n🧹 清理已有链接: {cleaned} 个文件")
        
        # Step 3: Add .sources links
        if not args.body_only:
            modified = add_sources_links(files, cite_to_paper)
            print(f"📝 .sources 链接补全: {modified} 个文件")
        
        # Step 4: Add body links
        if not args.sources_only:
            modified = add_body_links(files, name_to_paper, cite_to_paper)
            print(f"📝 正文链接补全: {modified} 个文件")
        
        print(f"\n✅ 交叉引用回链完成")
        print(f"   建议运行: node build.js && npm test")
    else:
        # Show what would be done
        for cite_key, target in sorted(cite_to_paper.items()):
            print(f"  cite-key '{cite_key}' → {target}")
        for name, target in sorted(name_to_paper.items()):
            print(f"  name '{name}' → {target}")


if __name__ == '__main__':
    main()
