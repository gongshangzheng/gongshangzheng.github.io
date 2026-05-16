#!/usr/bin/env python3
"""Convert 7 HTML articles to HtmlBlogs template format."""

import re
import os
from pathlib import Path

SOURCE_DIR = Path.home() / "blogs" / "static" / "html"
TARGET_DIR = Path.home() / "HtmlBlogs" / "src" / "pages"

SLUGS = [
    "great-depression-chronicle",
    "japanese-mythology",
    "peloponnesian-war",
    "hou-jing-rebellion",
    "human-history-millennia",
    "moe-deep-research",
    "maetok",
]

def clean_html_content(html: str, slug: str) -> tuple:
    """Extract needed data and clean HTML. Returns (frontmatter_dict, body_html)."""
    
    # 1. Extract <title>
    title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else slug.replace('-', ' ').title()
    
    # 2. Extract hero data
    hero_match = re.search(
        r'<div class="hero"[^>]*>.*?<div class="hero-inner">(.*?)</div>\s*</div>',
        html, re.DOTALL
    )
    hero_title = ""
    hero_sub = ""
    hero_tagline = ""
    
    if hero_match:
        hero_inner = hero_match.group(1)
        h1_match = re.search(r'<h1>(.*?)</h1>', hero_inner, re.DOTALL)
        hero_title = h1_match.group(1).strip() if h1_match else ""
        
        sub_match = re.search(r'<div class="sub">(.*?)</div>', hero_inner, re.DOTALL)
        hero_sub = sub_match.group(1).strip() if sub_match else ""
        
        tagline_match = re.search(r'<div class="tagline">(.*?)</div>', hero_inner, re.DOTALL)
        if tagline_match:
            hero_tagline = tagline_match.group(1).strip()
            hero_tagline = ' '.join(hero_tagline.split())
    
    # 3. Extract stats
    stats_match = re.search(r'(<div class="stats">.*?</div>)', html, re.DOTALL)
    stats_html = stats_match.group(1).strip() if stats_match else ""
    
    # 4. Extract wrap content
    wrap_match = re.search(r'<div class="wrap">(.*?)</div>\s*(?:<footer|</body>)', html, re.DOTALL)
    if not wrap_match:
        wrap_match = re.search(r'<div class="wrap">(.*)', html, re.DOTALL)
    
    body_html = wrap_match.group(1).strip() if wrap_match else ""
    
    # Prepend stats if exists
    if stats_html:
        body_html = stats_html + "\n\n" + body_html
    
    # 5. Clean body HTML
    # Remove nav blocks
    body_html = re.sub(r'<nav[^>]*>.*?</nav>', '', body_html, flags=re.DOTALL)
    # Remove script tags
    body_html = re.sub(r'<script[^>]*>.*?</script>', '', body_html, flags=re.DOTALL)
    # Remove footer blocks
    body_html = re.sub(r'<footer[^>]*>.*?</footer>', '', body_html, flags=re.DOTALL)
    # Remove link rel=stylesheet
    body_html = re.sub(r'<link\s+rel="stylesheet"[^>]*>', '', body_html, flags=re.DOTALL)
    
    # Clean up extra whitespace
    body_html = re.sub(r'\n{3,}', '\n\n', body_html)
    
    # 6. Rewrite image paths
    body_html = re.sub(
        r'src="images/([^"]+)"',
        f'src="assets/media/images/{slug}/\\1"',
        body_html
    )
    
    # 7. Generate description from hero_tagline or first paragraph
    description = ""
    if hero_tagline:
        clean_tagline = re.sub(r'<[^>]+>', '', hero_tagline).strip()
        description = clean_tagline[:120]
        if len(clean_tagline) > 120:
            description = description.rsplit(' ', 1)[0] + '...' if ' ' in description else description[:117] + '...'
    
    frontmatter = {
        'title': title,
        'description': description,
        'hero_title': hero_title,
        'hero_sub': hero_sub,
        'hero_tagline': hero_tagline,
    }
    
    return frontmatter, body_html


def main():
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    
    for slug in SLUGS:
        src = SOURCE_DIR / slug / "index.html"
        if not src.exists():
            print(f"[SKIP] Not found: {src}")
            continue
        
        html = src.read_text(encoding='utf-8')
        fm, body = clean_html_content(html, slug)
        
        # Build output
        lines = [
            "---",
            f"title: {fm['title']}",
            f"description: {fm['description']}",
            "page_style: |",
            "  .hero { height: 55vh; }",
        ]
        
        if fm['hero_title']:
            lines.append(f"hero_title: {fm['hero_title']}")
        if fm['hero_sub']:
            lines.append(f"hero_sub: {fm['hero_sub']}")
        if fm['hero_tagline']:
            lines.append(f"hero_tagline: {fm['hero_tagline']}")
        
        lines.append("---")
        lines.append("")
        lines.append(body)
        
        out = TARGET_DIR / f"{slug}.md"
        out.write_text('\n'.join(lines), encoding='utf-8')
        print(f"[DONE] {out}")


if __name__ == "__main__":
    main()
