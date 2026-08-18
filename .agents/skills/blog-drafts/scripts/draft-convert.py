#!/usr/bin/env python3
"""Convert a draft between .md and .org formats (pure Python, no pandoc).

Usage:
  draft-convert.py SLUG --to org|md [--replace]

Converts frontmatter (YAML --- block <-> #+KEY lines) and a pragmatic subset
of body syntax. Asset paths (assets/<slug>/...) are left unchanged.
Without --replace, the original file is kept alongside the converted copy;
the script refuses to overwrite an existing target file.

Body conversion subset:
  headings      #/##/### <-> */**/***
  code fences   ```lang <-> #+BEGIN_SRC lang / #+END_SRC
  images        ![alt](path) <-> [[file:path]]          (org image convention)
  links         [text](url) <-> [[url][text]]
  bold          **text**   <-> *text*
  italic        *text*     <-> /text/
  inline code   `code`     <-> ~code~
"""
import argparse, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from draft import DRAFTS, EXTS, find_draft, parse_frontmatter, write_draft, now_iso

FIELD_ORDER = ['slug', 'title', 'type', 'status', 'progress', 'target_alias',
               'target_sub_id', 'pin', 'source_url', 'tags',
               'created_at', 'updated_at', 'published_at', 'published_file']
IMG_EXTS = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')


def ordered_fm(fm):
    known = {k: fm[k] for k in FIELD_ORDER if k in fm}
    extra = {k: v for k, v in fm.items() if k not in FIELD_ORDER}
    return {**known, **extra}


def md_to_org(body):
    out = []
    in_code = False
    for line in body.splitlines():
        m = re.match(r'^(`{3,})(\w*)\s*$', line)
        if m:
            in_code = not in_code
            out.append(f'#+BEGIN_SRC {m.group(2)}' if in_code else '#+END_SRC')
            continue
        if in_code:
            out.append(line)
            continue
        m = re.match(r'^(#{1,6})\s+(.*)$', line)
        if m:
            out.append('*' * len(m.group(1)) + ' ' + m.group(2))
            continue
        line = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'[[file:\2]]', line)
        line = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'[[\2][\1]]', line)
        # 斜体先于加粗：否则 **x** → *x* 会被斜体规则再匹配成 /x/
        line = re.sub(r'(?<![\w*])\*([^*\n]+)\*(?![\w*])', r'/\1/', line)
        line = re.sub(r'\*\*([^*]+)\*\*', r'*\1*', line)
        line = re.sub(r'`([^`]+)`', r'~\1~', line)
        out.append(line)
    return '\n'.join(out)


def org_to_md(body):
    out = []
    in_code = False
    for line in body.splitlines():
        m = re.match(r'^#\+BEGIN_SRC\s*(\w*)\s*$', line)
        if m:
            in_code = True
            out.append(f'```{m.group(1)}')
            continue
        if re.match(r'^#\+END_SRC\s*$', line):
            in_code = False
            out.append('```')
            continue
        if in_code:
            out.append(line)
            continue
        m = re.match(r'^(\*{1,6})\s+(.*)$', line)
        if m:
            out.append('#' * len(m.group(1)) + ' ' + m.group(2))
            continue

        def file_link(mo):
            path = mo.group(1)
            if path.lower().endswith(IMG_EXTS):
                return f'![{path}]({path})'
            return f'[{path}]({path})'
        line = re.sub(r'\[\[file:([^\]]+)\]\]', file_link, line)
        line = re.sub(r'\[\[([^\]]+)\]\[([^\]]+)\]\]', r'[\2](\1)', line)
        line = re.sub(r'(?<![\w*/])\*([^*\n]+)\*(?![\w*/])', r'**\1**', line)
        line = re.sub(r'(?<![\w/])/([^/\n]+)/(?![\w/])', r'*\1*', line)
        line = re.sub(r'~([^~\n]+)~', r'`\1`', line)
        out.append(line)
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser(description='Convert a draft between .md and .org (no pandoc)')
    ap.add_argument('slug')
    ap.add_argument('--to', choices=['org', 'md'], required=True)
    ap.add_argument('--replace', action='store_true', help='remove the original file after conversion')
    ap.add_argument('--dry-run', action='store_true', help='print the converted result without writing files')
    args = ap.parse_args()

    src, src_ext = find_draft(args.slug)
    if not src:
        sys.exit(f'❌ draft not found: {args.slug} (looked for {args.slug}.org / {args.slug}.md in {DRAFTS})')
    dst_ext = '.' + args.to
    if src_ext == dst_ext:
        sys.exit(f'❌ draft is already {args.to}: {os.path.basename(src)}')

    fm, body = parse_frontmatter(open(src, encoding='utf-8').read(), src_ext)
    new_body = md_to_org(body) if dst_ext == '.org' else org_to_md(body)
    fm = ordered_fm(fm)
    fm['updated_at'] = now_iso()

    dst = os.path.join(DRAFTS, f'{args.slug}{dst_ext}')

    if args.dry_run:
        print(f'[dry] {os.path.basename(src)} → {os.path.basename(dst)}\n')
        print('--- frontmatter ---')
        for k, v in fm.items():
            print(f'  {k}: {v}')
        print('\n--- body ---')
        print(new_body.rstrip())
        return

    if os.path.exists(dst):
        sys.exit(f'❌ target exists: {os.path.basename(dst)} (remove it first, or pass --replace after)')
    write_draft(dst, fm, new_body, dst_ext)

    if args.replace:
        os.remove(src)
        print(f'✅ converted: {os.path.basename(src)} → {os.path.basename(dst)} (original removed)')
    else:
        print(f'✅ converted: {os.path.basename(src)} → {os.path.basename(dst)} (original kept)')


if __name__ == '__main__':
    main()
