#!/usr/bin/env python3
"""
html-to-pdf.py — 将博客 HTML 文章转换为 PDF

原理: 从构建后的 HTML 中提取正文 DOM，用干净的打印样式渲染为 PDF。

用法:
    ~/.venv/bin/python scripts/html-to-pdf.py <slug>
    ~/.venv/bin/python scripts/html-to-pdf.py <slug> -o ~/Desktop/
    ~/.venv/bin/python scripts/html-to-pdf.py <slug> --landscape
    ~/.venv/bin/python scripts/html-to-pdf.py <slug> --paper A3
"""

import argparse
import http.server
import os
import socket
import subprocess
import sys
import threading
from bs4 import BeautifulSoup

BLOG_DIR = os.path.expanduser("~/gongshangzheng.github.io")
PUBLIC_DIR = os.path.join(BLOG_DIR, "public")


def find_free_port():
    """找一个可用的端口号"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def ensure_built(slug):
    """确保博客已构建，返回 HTML 文件路径"""
    html_path = os.path.join(PUBLIC_DIR, f"{slug}.html")
    if not os.path.exists(html_path):
        print("⏳ 构建博客...")
        result = subprocess.run(
            ["node", "build.js"],
            cwd=BLOG_DIR,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"❌ 构建失败:\n{result.stderr}", file=sys.stderr)
            sys.exit(1)
        if not os.path.exists(html_path):
            print(f"❌ 构建成功但未找到 {slug}.html", file=sys.stderr)
            available = [f for f in os.listdir(PUBLIC_DIR)
                        if f.endswith('.html') and f != 'index.html']
            print(f"   可用文章: {', '.join(sorted(available)[:10])}...")
            sys.exit(1)
    return html_path


def extract_content(html_path):
    """从 HTML 文件中提取标题和正文"""
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # 提取标题（从 hero 的 h1）
    title = ""
    hero = soup.find('div', class_='hero')
    if hero:
        h1 = hero.find('h1')
        if h1:
            title = h1.get_text(strip=True)

    # 提取正文容器
    wrap = soup.find('div', class_='wrap')
    if not wrap:
        raise ValueError("未找到正文容器 (.wrap)")

    # 移除不需要的元素
    for selector in [
        'nav', 'footer', '.site-nav', '.site-footer',
        '.mobile-toc-drawer', '.mobile-toc-overlay',
        '#toc-sidebar', '.toc-toggle-btn', '.float-btns',
        '.search-dropdown', '.search-overlay', '.back-to-top',
        'script', 'style'
    ]:
        for elem in soup.select(selector):
            elem.decompose()

    # 在 wrap 中移除 article-meta 和 stats
    for elem in wrap.select('.article-meta, .stats'):
        elem.decompose()

    # 预处理 LaTeX 公式：转为 SVG 图片
    preprocess_latex(soup)

    return title, wrap


def preprocess_latex(soup):
    """将 LaTeX 公式转为 SVG 图片（使用 matplotlib）"""
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
    except ImportError:
        print("  ⚠ matplotlib 不可用，跳过 LaTeX 预处理")
        return  # matplotlib 不可用，跳过

    svg_dir = '/tmp/_print_math_svgs'
    os.makedirs(svg_dir, exist_ok=True)

    counter = [0]
    success_count = [0]
    fail_count = [0]

    def latex_to_svg(latex_str, display_mode=False):
        """将单个 LaTeX 公式转为 SVG 文件路径"""
        counter[0] += 1
        svg_path = os.path.join(svg_dir, f'math_{counter[0]}.svg')

        try:
            fontsize = 14 if display_mode else 12
            fig_height = 0.8 if display_mode else 0.4
            fig_width = 6 if display_mode else 4

            fig, ax = plt.subplots(figsize=(fig_width, fig_height))
            ax.text(0.5, 0.5, latex_str, fontsize=fontsize,
                    ha='center', va='center',
                    usetex=False)  # 使用 matplotlib 内置 TeX 渲染
            ax.axis('off')
            fig.savefig(svg_path, format='svg', bbox_inches='tight',
                       transparent=True, pad_inches=0.05)
            plt.close(fig)
            success_count[0] += 1
            return svg_path
        except Exception as e:
            fail_count[0] += 1
            plt.close('all')
            return None

    # 处理行内公式 <span class="math-inline">\(...\)</span>
    inline_count = 0
    for elem in soup.select('span.math-inline'):
        text = elem.get_text(strip=True)
        # 提取 LaTeX 内容（移除 \( 和 \)）
        latex = text
        if latex.startswith('\\(') and latex.endswith('\\)'):
            latex = latex[2:-2]
        elif latex.startswith('$') and latex.endswith('$'):
            latex = latex[1:-1]

        if not latex:
            continue

        svg_path = latex_to_svg(latex, display_mode=False)
        if svg_path:
            # 直接内嵌 SVG 内容，而不是用 img 标签
            with open(svg_path, 'r', encoding='utf-8') as f:
                svg_content = f.read()
            # 移除 XML 声明和 DOCTYPE
            svg_content = svg_content.split('<svg', 1)[1]
            svg_content = '<svg' + svg_content
            # 添加样式
            svg_content = svg_content.replace('<svg', '<svg style="height: 1.2em; vertical-align: middle; display: inline-block;"', 1)
            elem.clear()
            elem.append(BeautifulSoup(svg_content, 'html.parser'))
            inline_count += 1

    # 处理块级公式 <div class="math-block">$$...$$</div>
    block_count = 0
    for elem in soup.select('div.math-block'):
        text = elem.get_text(strip=True)
        latex = text
        if latex.startswith('$$') and latex.endswith('$$'):
            latex = latex[2:-2]
        elif latex.startswith('\\[') and latex.endswith('\\]'):
            latex = latex[2:-2]

        if not latex:
            continue

        svg_path = latex_to_svg(latex, display_mode=True)
        if svg_path:
            # 直接内嵌 SVG 内容
            with open(svg_path, 'r', encoding='utf-8') as f:
                svg_content = f.read()
            # 移除 XML 声明和 DOCTYPE
            svg_content = svg_content.split('<svg', 1)[1]
            svg_content = '<svg' + svg_content
            # 添加样式
            svg_content = svg_content.replace('<svg', '<svg style="max-width: 100%; display: block; margin: 0 auto;"', 1)
            elem.clear()
            elem.append(BeautifulSoup(svg_content, 'html.parser'))
            block_count += 1

    print(f"  📐 LaTeX 公式: {inline_count} 个行内, {block_count} 个块级 (成功 {success_count[0]}, 失败 {fail_count[0]})")


def start_server(port):
    """在 public/ 目录启动静默 HTTP 服务器"""
    os.chdir(PUBLIC_DIR)

    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    server = http.server.HTTPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def convert_to_pdf(html_path, output_path, landscape=False, paper_size="A4"):
    """使用 DOM 预处理 + weasyprint 生成 PDF"""
    # 设置 weasyprint 环境变量
    brew_lib = "/opt/homebrew/lib"
    if os.path.exists(brew_lib):
        current = os.environ.get("DYLD_FALLBACK_LIBRARY_PATH", "")
        if brew_lib not in current:
            os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = f"{brew_lib}:{current}" if current else brew_lib

    try:
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration
    except ImportError:
        print("❌ weasyprint 未安装", file=sys.stderr)
        print("   安装: ~/.venv/bin/pip install weasyprint", file=sys.stderr)
        return False

    try:
        # 1. 提取内容
        title, wrap = extract_content(html_path)

        # 2. 构建干净的 HTML
        clean_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>{title}</title>
</head>
<body>
<div class="title-page">
  <h1>{title}</h1>
</div>
<div class="article-body">
{wrap}
</div>
</body>
</html>"""

        # 3. 打印 CSS - 纯内容，无装饰
        print_css = f"""
@page {{
    size: {paper_size} {'landscape' if landscape else 'portrait'};
    margin: 2cm;
}}

/* 全局重置：移除所有装饰 */
* {{
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    text-shadow: none !important;
}}

/* 标题页 */
.title-page {{
    page-break-after: always;
    text-align: center;
    padding-top: 8cm;
}}

.title-page h1 {{
    font-size: 28pt;
    font-weight: bold;
    color: #000;
    margin: 0;
}}

/* 正文 */
.article-body {{
    font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #000;
}}

/* 章节 */
.ch {{
    margin-bottom: 1.5em;
    page-break-inside: avoid;
}}

.ch-label {{
    font-size: 13pt;
    font-weight: bold;
    color: #000;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
}}

.ch-title {{
    font-size: 18pt;
    font-weight: bold;
    color: #000;
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    padding-bottom: 0.3em;
    page-break-after: avoid;
}}

h3.section-title {{
    font-size: 14pt;
    font-weight: bold;
    color: #000;
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    page-break-after: avoid;
}}

h4 {{
    font-size: 12pt;
    font-weight: bold;
    color: #000;
    margin-top: 1em;
    margin-bottom: 0.5em;
}}

/* 段落 */
p {{
    margin-bottom: 0.8em;
    text-align: justify;
    orphans: 3;
    widows: 3;
}}

/* 代码 */
pre, code {{
    font-family: "JetBrains Mono", "SF Mono", monospace;
    font-size: 9pt;
    border: 1px solid #ddd;
    page-break-inside: avoid;
}}

pre {{
    padding: 0.8em;
    overflow-wrap: break-word;
}}

code {{
    padding: 0.1em 0.3em;
}}

/* 表格 */
.table-scroll {{
    overflow: visible !important;
    width: 100%;
    margin: 1em 0;
}}

table {{
    font-size: 10pt;
    border-collapse: collapse;
    width: 100%;
    margin: 0;
    page-break-inside: avoid;
    display: table !important;
}}

thead, tbody, tfoot {{
    display: table-row-group !important;
}}

tr {{
    display: table-row !important;
    page-break-inside: avoid;
}}

th, td {{
    border: 1px solid #999;
    padding: 0.4em 0.6em;
    text-align: left;
    display: table-cell !important;
}}

th {{
    font-weight: bold;
    border-bottom: 2px solid #666;
}}

/* 图片 */
.photo {{
    text-align: center;
    margin: 1.5em 0;
    page-break-inside: avoid;
}}

.photo img {{
    max-width: 100%;
    height: auto;
}}

.photo .cap {{
    font-size: 9pt;
    color: #666;
    margin-top: 0.5em;
    font-style: italic;
}}

/* 数学公式 */
.math-block {{
    margin: 1em 0;
    text-align: center;
    page-break-inside: avoid;
}}

/* 引用 */
blockquote {{
    border-left: 2px solid #999;
    margin: 1em 0;
    padding-left: 1em;
    color: #333;
    font-style: italic;
}}

/* 列表 */
ul, ol {{
    margin: 0.8em 0;
    padding-left: 1.5em;
}}

li {{
    margin-bottom: 0.3em;
}}

/* 链接 */
a {{
    color: #000;
    text-decoration: underline;
}}

/* 参考来源 */
.sources {{
    font-size: 9pt;
    margin-top: 2em;
    border-top: 1px solid #999;
    padding-top: 1em;
}}

.sources h2 {{
    font-size: 12pt;
}}

.sources li {{
    margin-bottom: 0.5em;
    line-height: 1.4;
}}

/* 引用标签 */
cite {{
    font-style: normal;
    color: #0066cc;
    font-size: 0.9em;
}}

cite::before {{
    content: "[";
}}

cite::after {{
    content: "]";
}}

/* LaTeX 公式 SVG */
.math-svg {{
    page-break-inside: avoid;
}}

/* Mermaid 图表（未预处理，显示源码提示） */
.mermaid {{
    padding: 1em;
    border: 1px dashed #999;
    text-align: center;
    color: #666;
    font-size: 10pt;
}}

.mermaid::before {{
    content: "[Mermaid 图表 — 需要安装 Chrome 才能在 PDF 中渲染]";
    display: block;
    margin-bottom: 0.5em;
    font-style: italic;
}}

/* 重置 Tailwind 装饰类 */
[class*="bg-"], [class*="shadow-"], [class*="border-"] {{
    background: transparent !important;
    box-shadow: none !important;
}}

.rounded, [class*="rounded"] {{
    border-radius: 0 !important;
}}

/* 确保表格元素保持表格显示模式 */
table, thead, tbody, tfoot, tr, th, td {{
    display: revert !important;
}}
"""

        # 4. 启动临时服务器（用于加载图片）
        port = find_free_port()
        server = start_server(port)
        base_url = f"http://127.0.0.1:{port}"

        # 5. 渲染
        font_config = FontConfiguration()
        css = CSS(string=print_css)

        # 将 HTML 写入临时文件
        temp_html = "/tmp/_print_temp.html"
        with open(temp_html, 'w', encoding='utf-8') as f:
            f.write(clean_html)

        html = HTML(filename=temp_html, base_url=base_url)
        doc = html.render(
            stylesheets=[css],
            font_config=font_config
        )

        doc.write_pdf(output_path)
        server.shutdown()

        return os.path.exists(output_path) and os.path.getsize(output_path) > 0

    except Exception as e:
        print(f"❌ PDF 生成失败: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False


def main():
    parser = argparse.ArgumentParser(
        description="将博客 HTML 文章转换为 PDF，输出到 ~/Downloads/",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s digital-human-hub
  %(prog)s paper-sentiavatar --landscape
  %(prog)s digital-human-hub --paper Letter
        """
    )
    parser.add_argument("slug", help="文章 slug")
    parser.add_argument("--landscape", action="store_true", help="横向打印")
    parser.add_argument("--paper", default="A4",
                        choices=["A4", "Letter", "A3", "A5", "Legal"],
                        help="纸张大小（默认 A4）")
    parser.add_argument("--no-build", action="store_true", help="跳过构建步骤")

    args = parser.parse_args()

    # 1. 确保博客已构建
    if not args.no_build:
        ensure_built(args.slug)
    html_path = os.path.join(PUBLIC_DIR, f"{args.slug}.html")
    if not os.path.exists(html_path):
        print(f"❌ 未找到 {html_path}", file=sys.stderr)
        sys.exit(1)

    # 2. 输出路径（固定 ~/Downloads/）
    output_dir = os.path.expanduser("~/Downloads")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{args.slug}.pdf")

    print(f"📄 {args.slug}")
    print(f"📐 {args.paper} {'横向' if args.landscape else '纵向'}")

    # 3. 转换
    print("⏳ 提取正文内容...")
    if convert_to_pdf(html_path, output_path,
                      landscape=args.landscape,
                      paper_size=args.paper):
        size_kb = os.path.getsize(output_path) / 1024
        print(f"✅ PDF 已生成: {output_path} ({size_kb:.0f} KB)")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
