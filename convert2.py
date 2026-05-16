#!/usr/bin/env python3
"""Convert 7 HTML articles to HtmlBlogs template format — robust version."""

import re
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


def find_matching_close(html: str, start_pos: int, tag: str = "div") -> int:
    """Find the index of the matching closing tag starting from start_pos (which should be at opening <tag>)."""
    tag_open = f"<{tag}"
    tag_close = f"</{tag}>"
    depth = 0
    i = start_pos
    while i < len(html):
        if html[i:i + len(tag_open)] == tag_open and (html[i + len(tag_open)] in (' ', '>', '\n', '\t', '/')):
            # Check it's not a closing tag
            if html[i:i + len(tag_open) + 1] != f"<{tag}/":
                depth += 1
                i += len(tag_open)
                continue
        if html[i:i + len(tag_close)] == tag_close:
            depth -= 1
            if depth == 0:
                return i + len(tag_close)
            i += len(tag_close)
            continue
        i += 1
    return -1


def extract_element_html(html: str, class_name: str, tag: str = "div") -> str:
    """Extract the outerHTML of the first element with given class."""
    pattern = f'<{tag} class="{class_name}"'
    start = html.find(pattern)
    if start == -1:
        # Try with single quotes
        pattern = f"<{tag} class='{class_name}'"
        start = html.find(pattern)
    if start == -1:
        return ""
    end = find_matching_close(html, start, tag)
    if end == -1:
        return ""
    return html[start:end]


def clean_html_content(html: str, slug: str) -> tuple:
    """Extract needed data and clean HTML. Returns (frontmatter_dict, body_html)."""
    
    # 1. Extract <title>
    title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else slug.replace('-', ' ').title()
    
    # 2. Extract hero data
    hero_html = extract_element_html(html, "hero")
    hero_title = ""
    hero_sub = ""
    hero_tagline = ""
    
    if hero_html:
        hero_inner_match = re.search(r'<div class="hero-inner">(.*?)</div>\s*</div>\s*$', hero_html, re.DOTALL)
        if hero_inner_match:
            hero_inner = hero_inner_match.group(1)
        else:
            hero_inner = hero_html
        
        h1_match = re.search(r'<h1>(.*?)</h1>', hero_inner, re.DOTALL)
        hero_title = h1_match.group(1).strip() if h1_match else ""
        
        # Find all .sub elements
        subs = re.findall(r'<div class="sub">(.*?)</div>', hero_inner, re.DOTALL)
        if subs:
            hero_sub = ' '.join(s.strip() for s in subs)
        
        tagline_match = re.search(r'<div class="tagline">(.*?)</div>', hero_inner, re.DOTALL)
        if tagline_match:
            hero_tagline = tagline_match.group(1).strip()
            hero_tagline = ' '.join(hero_tagline.split())
    
    # 3. Extract stats
    stats_html = extract_element_html(html, "stats")
    
    # 4. Extract wrap content
    wrap_start_pattern = '<div class="wrap">'
    wrap_start = html.find(wrap_start_pattern)
    body_html = ""
    if wrap_start != -1:
        wrap_start += len(wrap_start_pattern)
        # Find the matching close </div> for wrap
        # The wrap div is usually followed by footer or </body>
        # But we need to find the correct matching close
        # Since wrap is usually the last major div before footer, we can search for </div> followed by optional whitespace and footer or </body>
        wrap_end = find_matching_close(html, wrap_start - len(wrap_start_pattern), "div")
        if wrap_end != -1:
            body_html = html[wrap_start:wrap_end - len("</div>")].strip()
        else:
            # fallback: just grab until </body>
            body_end = html.find('</body>', wrap_start)
            if body_end == -1:
                body_end = len(html)
            body_html = html[wrap_start:body_end].strip()
            # Remove trailing </div> that belongs to wrap
            last_div = body_html.rfind('</div>')
            if last_div != -1:
                body_html = body_html[:last_div].strip()
    
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
    body_html = body_html.strip()
    
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
