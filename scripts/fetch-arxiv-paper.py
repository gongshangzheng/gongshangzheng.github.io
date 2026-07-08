#!/usr/bin/env python3
"""
fetch-arxiv-paper.py — arXiv 论文一键提取工具

从 arXiv ID 出发，完成：
1. 创建标准目录结构 raw/<slug>/{sources,figures/<slug>,images/<slug>}
2. 下载 e-print tarball（.tex 源码 + 原始图片）
3. 解压并组织文件
4. 提取论文元信息（标题、作者、机构等）
5. 调用 convert-figures.py 将 PDF/PNG 图片转为 WebP
6. 生成 extraction-log.md
7. 可选：下载 HTML 版本和 PDF

用法:
    python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025

    # 指定项目根目录（默认 ~/gongshangzheng.github.io）
    python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025 --root /path/to/repo

    # 同时下载 HTML 和 PDF
    python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025 --html --pdf

    # 跳过图片转换（只下载和组织）
    python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025 --no-convert

依赖: PyMuPDF (fitz), Pillow, convert-figures.py
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import urllib.request
from pathlib import Path
from datetime import datetime

try:
    import fitz  # PyMuPDF
except ImportError:
    pass  # Only needed for figure conversion

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = Path(os.environ.get("HOME", "")) / "gongshangzheng.github.io"

IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.pdf', '.eps', '.svg', '.gif', '.bmp', '.tiff', '.tif'}
NON_FIGURE_FILES = {'acmart.pdf', 'acmguide.pdf', 'acm-jdslogo.png'}


def parse_arxiv_id(arxiv_input):
    """从各种格式的 arXiv 输入中提取 ID"""
    # 2508.09959, arXiv:2508.09959, https://arxiv.org/abs/2508.09959, etc.
    m = re.search(r'(\d{4}\.\d{4,5})', arxiv_input)
    if m:
        return m.group(1)
    # Old format: cs.AI/0703001
    m = re.search(r'([a-z]+\.[A-Z]+/\d{7})', arxiv_input)
    if m:
        return m.group(1)
    return arxiv_input


def create_directory_structure(raw_dir, slug):
    """创建标准目录结构"""
    dirs = [
        raw_dir / "sources",
        raw_dir / "figures" / slug,
        raw_dir / "images" / slug,
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    return dirs


def download_tarball(arxiv_id, output_path):
    """下载 arXiv e-print tarball"""
    url = f"https://arxiv.org/e-print/{arxiv_id}"
    print(f"  下载 tarball: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
            output_path.write_bytes(data)
            print(f"  ✅ 下载完成: {len(data) / 1024:.0f}KB")
            return True
    except Exception as e:
        print(f"  ❌ 下载失败: {e}")
        return False


def extract_tarball(tarball_path, extract_dir):
    """解压 tarball（可能是 gzip 或普通 tar）"""
    try:
        with tarfile.open(tarball_path, 'r:*') as tar:
            tar.extractall(path=extract_dir)
        print(f"  ✅ 解压完成")
        return True
    except Exception as e:
        print(f"  ❌ 解压失败: {e}")
        return False


def find_figures(source_dir, fig_dir, slug):
    """从解压后的源码中提取所有图片文件"""
    found = []
    for root, dirs, files in os.walk(source_dir):
        # Skip .git directories
        if '.git' in dirs:
            dirs.remove('.git')
        for fname in files:
            ext = Path(fname).suffix.lower()
            if ext in IMAGE_EXTENSIONS and fname not in NON_FIGURE_FILES:
                src = Path(root) / fname
                dst = fig_dir / fname
                shutil.copy2(src, dst)
                found.append(fname)
    if found:
        print(f"  ✅ 找到 {len(found)} 个图片文件")
    else:
        print(f"  ⚠️ 未找到图片文件")
    return found


def extract_metadata(source_dir):
    """从 00README.json 或 .tex 文件中提取论文元信息"""
    meta = {}

    # Try 00README.json (arXiv metadata)
    readme = Path(source_dir) / "00README.json"
    if readme.exists():
        try:
            data = json.loads(readme.read_text())
            meta['title'] = data.get('title', '')
            meta['authors'] = data.get('authors', [])
            meta['abstract'] = data.get('abstract', '')
            # arXiv metadata format may vary
            if isinstance(meta['authors'], list):
                meta['authors_str'] = '; '.join(
                    a.get('full_name', a.get('name', str(a)))
                    if isinstance(a, dict) else str(a)
                    for a in meta['authors']
                )
            else:
                meta['authors_str'] = str(meta['authors'])
        except Exception:
            pass

    # Try .tex files for title/author if JSON didn't have them
    if 'title' not in meta or not meta['title']:
        for tex_file in Path(source_dir).rglob('*.tex'):
            try:
                content = tex_file.read_text(errors='ignore')
                # \title{...}
                m = re.search(r'\\title\{([^}]+)\}', content)
                if m and 'title' not in meta:
                    meta['title'] = m.group(1).strip()
                # \author{...}
                m = re.search(r'\\author\{([^}]+)\}', content)
                if m and 'authors_str' not in meta:
                    meta['authors_str'] = m.group(1).strip()
                if 'title' in meta and 'authors_str' in meta:
                    break
            except Exception:
                continue

    return meta


def extract_tex_to_markdown(source_dir, output_path):
    """将 .tex 源码拼接为 Markdown（简单提取，不做完整 LaTeX 解析）"""
    tex_files = sorted(Path(source_dir).rglob('*.tex'))
    if not tex_files:
        return False

    # Find main.tex or the first .tex file with \documentclass or \begin{document}
    main_tex = None
    for tex_file in tex_files:
        try:
            content = tex_file.read_text(errors='ignore')
            if '\\documentclass' in content or '\\begin{document}' in content:
                main_tex = tex_file
                break
        except Exception:
            continue

    if not main_tex:
        main_tex = tex_files[0]

    # Simple extraction: concatenate all .tex, strip LaTeX commands
    all_content = []
    for tex_file in sorted(tex_files):
        try:
            content = tex_file.read_text(errors='ignore')
            # Skip files that are just style/macro definitions
            if len(content.strip()) < 50:
                continue
            all_content.append(f"% === {tex_file.name} ===\n{content}")
        except Exception:
            continue

    combined = '\n\n'.join(all_content)

    # Basic LaTeX → Markdown conversion
    # Remove comments
    combined = re.sub(r'(?<!\\)%.*', '', combined)
    # Sections
    combined = re.sub(r'\\section\*?\{([^}]+)\}', r'## \1', combined)
    combined = re.sub(r'\\subsection\*?\{([^}]+)\}', r'### \1', combined)
    combined = re.sub(r'\\subsubsection\*?\{([^}]+)\}', r'#### \1', combined)
    # Bold/italic
    combined = re.sub(r'\\textbf\{([^}]+)\}', r'**\1**', combined)
    combined = re.sub(r'\\textit\{([^}]+)\}', r'*\1*', combined)
    combined = re.sub(r'\\emph\{([^}]+)\}', r'*\1*', combined)
    # Remove remaining common LaTeX commands
    combined = re.sub(r'\\[a-zA-Z]+\*?\{([^}]*)\}', r'\1', combined)
    combined = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])?', '', combined)
    combined = re.sub(r'\{([^}]*)\}', r'\1', combined)
    # Clean up extra whitespace
    combined = re.sub(r'\n{3,}', '\n\n', combined)

    output_path.write_text(combined.strip() + '\n')
    print(f"  ✅ TeX → Markdown: {output_path.name} ({len(combined)} chars)")
    return True


def download_html(arxiv_id, output_path):
    """下载 arXiv HTML 版本"""
    url = f"https://arxiv.org/html/{arxiv_id}"
    print(f"  下载 HTML: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            output_path.write_text(html)
            print(f"  ✅ HTML 下载完成: {len(html)} chars")
            return True
    except Exception as e:
        print(f"  ⚠️ HTML 不可用: {e}")
        return False


def download_pdf(arxiv_id, output_path):
    """下载 arXiv PDF"""
    url = f"https://arxiv.org/pdf/{arxiv_id}"
    print(f"  下载 PDF: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
            output_path.write_bytes(data)
            print(f"  ✅ PDF 下载完成: {len(data) / 1024:.0f}KB")
            return True
    except Exception as e:
        print(f"  ⚠️ PDF 下载失败: {e}")
        return False


def run_convert_figures(fig_dir, media_dir, dpi=300, quality=90):
    """调用 convert-figures.py 转换图片"""
    convert_script = SCRIPT_DIR / "convert-figures.py"
    if not convert_script.exists():
        print(f"  ⚠️ convert-figures.py 不存在于 {convert_script}")
        return False

    python = os.environ.get('HOME', '') + '/.venv/bin/python3'
    if not Path(python).exists():
        python = sys.executable

    cmd = [python, str(convert_script), str(fig_dir), '-o', str(media_dir),
           '--dpi', str(dpi), '--quality', str(quality)]
    print(f"  转换图片: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"  ⚠️ 转换有错误: {result.stderr}", file=sys.stderr)
    return result.returncode == 0


def generate_extraction_log(log_path, arxiv_id, slug, meta, figures, source_ok,
                           html_ok, pdf_ok, raw_dir):
    """生成 extraction-log.md"""
    lines = [
        f"# Extraction Log: {meta.get('title', arxiv_id)} (arXiv:{arxiv_id})",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "## Paper Info",
        "",
        f"- **arXiv ID:** {arxiv_id}",
        f"- **Slug:** {slug}",
        f"- **Title:** {meta.get('title', 'N/A')}",
        f"- **Authors:** {meta.get('authors_str', 'N/A')}",
        "",
        "## Source Status",
        "",
        "| Source | Status | Notes |",
        "|---|---|---|",
        f"| arXiv source tarball | {'✅ Success' if source_ok else '❌ Failed'} | |",
        f"| arXiv HTML | {'✅ Downloaded' if html_ok else 'N/A'} | |",
        f"| arXiv PDF | {'✅ Downloaded' if pdf_ok else 'N/A'} | |",
        "",
        "## Figures",
        "",
        f"Found {len(figures)} image files:",
        "",
    ]
    for f in figures:
        lines.append(f"- `{f}`")

    lines.extend([
        "",
        "## Output Files",
        "",
        "| Path | Description |",
        "|---|---|",
        f"| `sources/{slug}.md` | Full text in Markdown |",
        f"| `extraction-log.md` | This log file |",
        f"| `source.tar` | Original arXiv source tarball |",
        f"| `source-tar/` | Extracted source files |",
        f"| `figures/{slug}/` | Original image files |",
        f"| `media/images/{slug}/` | WebP images (site assets) |",
        "",
    ])

    log_path.write_text('\n'.join(lines))
    print(f"  ✅ extraction-log.md 生成")


def main():
    parser = argparse.ArgumentParser(
        description='arXiv 论文一键提取工具：下载→解压→组织→转换',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 基本用法
  python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025

  # 同时下载 HTML 和 PDF
  python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025 --html --pdf

  # 跳过图片转换
  python3 scripts/fetch-arxiv-paper.py 2508.09959 --slug lia-x-2025 --no-convert
        """
    )
    parser.add_argument('arxiv_id', help='arXiv ID (如 2508.09959) 或 arXiv URL')
    parser.add_argument('--slug', required=True, help='论文 slug (如 lia-x-2025)')
    parser.add_argument('--root', default=str(PROJECT_ROOT),
                        help=f'项目根目录 (默认: {PROJECT_ROOT})')
    parser.add_argument('--html', action='store_true', help='同时下载 HTML 版本')
    parser.add_argument('--pdf', action='store_true', help='同时下载 PDF 版本')
    parser.add_argument('--no-convert', action='store_true',
                        help='跳过图片转换（只下载和组织）')
    parser.add_argument('--dpi', type=int, default=300, help='图片渲染 DPI (默认 300)')
    parser.add_argument('--quality', type=int, default=90, help='WebP 质量 (默认 90)')

    args = parser.parse_args()

    arxiv_id = parse_arxiv_id(args.arxiv_id)
    slug = args.slug
    project_root = Path(args.root).expanduser()
    raw_dir = project_root / "raw" / slug

    print(f"{'=' * 60}")
    print(f"arXiv 论文提取: {arxiv_id}")
    print(f"Slug: {slug}")
    print(f"Raw 目录: {raw_dir}")
    print(f"{'=' * 60}\n")

    # Step 1: 创建目录结构
    print("📋 Step 1: 创建目录结构...")
    sources_dir, fig_dir, img_dir = create_directory_structure(raw_dir, slug)
    print(f"  ✅ {raw_dir}/")
    print(f"     ├── sources/")
    print(f"     ├── figures/{slug}/")
    print(f"     └── images/{slug}/\n")

    # Step 2: 下载 tarball
    print("📦 Step 2: 下载 arXiv source tarball...")
    tarball_path = raw_dir / "source.tar"
    source_dir = raw_dir / "source-tar"
    source_dir.mkdir(exist_ok=True)
    source_ok = download_tarball(arxiv_id, tarball_path)

    if source_ok:
        # Step 3: 解压
        print("\n📂 Step 3: 解压 tarball...")
        extract_tarball(tarball_path, source_dir)

        # Step 4: 提取图片
        print("\n🖼️  Step 4: 提取图片文件...")
        figures = find_figures(source_dir, fig_dir, slug)

        # Step 5: 提取元信息
        print("\n📝 Step 5: 提取论文元信息...")
        meta = extract_metadata(source_dir)
        if meta.get('title'):
            print(f"  ✅ 标题: {meta['title']}")
        if meta.get('authors_str'):
            authors = meta['authors_str'][:80]
            print(f"  ✅ 作者: {authors}...")

        # Step 6: TeX → Markdown
        print("\n📄 Step 6: 提取正文 (TeX → Markdown)...")
        md_path = sources_dir / f"{slug}.md"
        extract_tex_to_markdown(source_dir, md_path)
    else:
        figures = []
        meta = {}

    # Step 7: 可选下载 HTML
    html_ok = False
    if args.html:
        print("\n🌐 Step 7: 下载 HTML 版本...")
        html_path = sources_dir / f"{slug}.html"
        html_ok = download_html(arxiv_id, html_path)

    # Step 8: 可选下载 PDF
    pdf_ok = False
    if args.pdf:
        print("\n📄 Step 8: 下载 PDF 版本...")
        pdf_path = sources_dir / f"{slug}.pdf"
        pdf_ok = download_pdf(arxiv_id, pdf_path)

    # Step 9: 图片转换
    if source_ok and not args.no_convert and figures:
        print("\n🔄 Step 9: 转换图片为 WebP...")
        media_dir = project_root / "media" / "images" / slug
        media_dir.mkdir(parents=True, exist_ok=True)
        run_convert_figures(fig_dir, media_dir, args.dpi, args.quality)

        # Also copy to raw/images/
        img_dir = raw_dir / "images" / slug
        for webp in media_dir.glob("*.webp"):
            shutil.copy2(webp, img_dir / webp.name)
    elif args.no_convert:
        print("\n⏭️  Step 9: 跳过图片转换 (--no-convert)")

    # Step 10: 生成 extraction-log.md
    print("\n📋 Step 10: 生成 extraction-log.md...")
    log_path = raw_dir / "extraction-log.md"
    generate_extraction_log(log_path, arxiv_id, slug, meta, figures,
                            source_ok, html_ok, pdf_ok, raw_dir)

    print(f"\n{'=' * 60}")
    print(f"✅ 提取完成！")
    print(f"   Raw 目录: {raw_dir}")
    print(f"   图片目录: {project_root / 'media' / 'images' / slug}")
    print(f"   下一步: 检查 sources/{slug}.md 的内容质量")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    main()
