#!/usr/bin/env python3
"""草稿在 markdown 和 org 之间互转。

body 用 pandoc 转换，frontmatter（YAML ↔ #+ 属性行）用 draft.py 的解析/序列化逻辑，
所以 slug/status/pin/tags 等元数据完整保留、字段顺序不变。

用法:
  ~/.venv/bin/python3 scripts/draft-convert.py <slug> --to org          # .md → .org
  ~/.venv/bin/python3 scripts/draft-convert.py <slug> --to md           # .org → .md
  ~/.venv/bin/python3 scripts/draft-convert.py <slug> --to org --replace   # 转完删源文件
  ~/.venv/bin/python3 scripts/draft-convert.py <slug> --to org --dry-run   # 只看会转成啥

资产（drafts/assets/<slug>/）两边共享，图片引用路径不变，无需改。
依赖：pandoc（brew install pandoc）。
"""
import argparse, os, subprocess, sys
from pathlib import Path

# 复用 draft.py 的 find_draft / parse_frontmatter / serialize_frontmatter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import draft as D

REPO = Path(os.path.expanduser('~/gongshangzheng.github.io'))
DRAFTS = REPO / 'drafts'
FMT_MAP = {'md': 'markdown', 'org': 'org'}


def convert_body(body: str, src_ext: str, tgt_ext: str) -> str:
    """用 pandoc 把 body 从 src 格式转到 tgt 格式（禁 auto_identifiers 避免 :PROPERTIES: 噪声）。"""
    src_fmt = FMT_MAP[src_ext.lstrip('.')]
    tgt_fmt = FMT_MAP[tgt_ext.lstrip('.')]
    res = subprocess.run(
        ['pandoc', '-f', f'{src_fmt}-auto_identifiers', '-t', tgt_fmt, '--wrap=none'],
        input=body, capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0:
        sys.exit(f'❌ pandoc 转换失败 ({src_fmt}→{tgt_fmt}): {res.stderr}')
    return res.stdout


def main():
    ap = argparse.ArgumentParser(description='草稿 md ↔ org 互转（pandoc body + 保留 frontmatter）')
    ap.add_argument('slug')
    ap.add_argument('--to', choices=['org', 'md'], required=True, help='目标格式')
    ap.add_argument('--replace', action='store_true', help='转完删除源文件')
    ap.add_argument('--dry-run', action='store_true', help='只打印转换结果，不写文件')
    args = ap.parse_args()

    src, src_ext = D.find_draft(args.slug)
    if not src:
        sys.exit(f'❌ 找不到草稿: {args.slug} (在 {DRAFTS} 找 .org / .md)')
    src = Path(src)
    tgt_ext = '.' + args.to
    if src_ext == tgt_ext:
        sys.exit(f'❌ {args.slug} 已经是 {args.to} 格式（{src.name}），无需转换')

    fm, body = D.parse_frontmatter(src.read_text(encoding='utf-8'), src_ext)
    new_body = convert_body(body, src_ext, tgt_ext)
    out = DRAFTS / f'{args.slug}{tgt_ext}'

    if args.dry_run:
        print(f'[dry] {src.name} → {out.name}\n')
        print('--- frontmatter (不变) ---')
        for k, v in fm.items():
            print(f'  {k}: {v}')
        print('\n--- body (转换后) ---')
        print(new_body.rstrip())
        return

    out.write_text(D.serialize_frontmatter(fm, tgt_ext) + new_body, encoding='utf-8')
    print(f'✅ {src.name} → {out.name} (frontmatter 保留，body pandoc 转换)')
    if args.replace:
        src.unlink()
        print(f'   (已删源文件 {src.name})')


if __name__ == '__main__':
    main()
