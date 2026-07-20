#!/usr/bin/env python3
"""Blog draft management CLI. Supports Markdown (.md) and Org (.org) drafts.
Default format for new drafts: org. See .agents/skills/blog-drafts/SKILL.md.

Usage:
  draft.py new SLUG [--title T] [--type T] [--alias A] [--pin] [--source URL] [--tags t1,t2] [--template brainstorm|plan] [--format org|md]
  draft.py list [FIELDS] [--status S]
  draft.py show SLUG
  draft.py set SLUG FIELD=VALUE [FIELD=VALUE ...]
  draft.py set-all FIELD=VALUE [--status S]
  draft.py archive SLUG
  draft.py unarchive SLUG
  draft.py delete SLUG [-y]
  draft.py factcheck SLUG

Examples:
  draft.py new how-to-learn --title "如何学习" --pin --source https://v.douyin.com/xxx
  draft.py new my-idea --title "想法" --format md          # explicitly markdown
  draft.py list                       # default fields: slug, status, progress, pin, title
  draft.py list status,pin,tags
  draft.py set how-to-learn status=outlining progress=20
  draft.py archive how-to-learn
  draft.py factcheck model-training
"""
import argparse, glob, os, re, sys
from datetime import datetime

REPO = os.path.expanduser('~/gongshangzheng.github.io')
DRAFTS = os.path.join(REPO, 'drafts')
ARCHIVE = os.path.join(DRAFTS, 'archive')
TEMPLATES_DIR = os.path.join(REPO, '.agents/skills/blog-drafts/templates')
DEFAULT_FIELDS = ['slug', 'status', 'progress', 'pin', 'title']
DEFAULT_FMT = 'org'  # default format for new drafts
EXTS = ('.org', '.md')  # lookup order (default first)


def now_iso():
    return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')


def draft_file(slug, fmt):
    return os.path.join(DRAFTS, f'{slug}.{fmt}')


def find_draft(slug, root=DRAFTS):
    """Find a draft by slug, trying .org then .md. Returns (path, ext) or (None, None)."""
    for ext in EXTS:
        p = os.path.join(root, f'{slug}{ext}')
        if os.path.exists(p):
            return p, ext
    return None, None


def parse_frontmatter(text, ext):
    """Parse frontmatter. .md → YAML --- block; .org → #+KEY: lines."""
    if ext == '.md':
        m = re.match(r'^---\n(.*?)\n---\n?', text, re.DOTALL)
        if not m:
            return {}, text
        fm = {}
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                v = v.strip()
                if ' #' in v:  # strip inline YAML comment
                    v = v.split(' #', 1)[0].rstrip()
                fm[k.strip()] = v
        return fm, text[m.end():]
    else:  # .org
        fm = {}
        lines = text.splitlines()
        i = 0
        while i < len(lines) and lines[i].strip() == '':
            i += 1
        while i < len(lines):
            m = re.match(r'^#\+(\w+):\s*(.*)$', lines[i])
            if not m:
                break
            fm[m.group(1).lower()] = m.group(2).strip()
            i += 1
        body = '\n'.join(lines[i:])
        return fm, body


def serialize_frontmatter(fm, ext):
    if ext == '.md':
        lines = ['---']
        for k, v in fm.items():
            lines.append(f'{k}: {v}')
        lines.append('---')
        return '\n'.join(lines) + '\n'
    else:  # .org
        lines = []
        for k, v in fm.items():
            v = str(v)
            # 去掉首尾引号（md title 带引号转 org 时清理掉）
            if len(v) >= 2 and ((v[0] == v[-1] == '"') or (v[0] == v[-1] == "'")):
                v = v[1:-1]
            lines.append(f'#+{k.upper()}: {v}')
        return '\n'.join(lines) + '\n'


def read_draft(slug):
    p, ext = find_draft(slug)
    if not p:
        sys.exit(f'❌ draft not found: {slug} (looked for {slug}.org / {slug}.md in {DRAFTS})')
    fm, body = parse_frontmatter(open(p, encoding='utf-8').read(), ext)
    return p, fm, body, ext


def write_draft(path, fm, body, ext):
    open(path, 'w', encoding='utf-8').write(serialize_frontmatter(fm, ext) + body)


def parse_value(v):
    v = v.strip()
    if len(v) >= 2 and ((v[0] == v[-1] == '"') or (v[0] == v[-1] == "'")):
        v = v[1:-1]
    return v


def normalize_list(v):
    v = v.strip()
    if v.startswith('[') and v.endswith(']'):
        items = [x.strip() for x in v[1:-1].split(',') if x.strip()]
    else:
        items = [x.strip() for x in v.split(',') if x.strip()]
    return '[' + ', '.join(items) + ']'


def glob_drafts():
    out = []
    for ext in EXTS:
        for f in sorted(glob.glob(os.path.join(DRAFTS, f'*{ext}'))):
            if os.path.basename(f) in ('README.md', '_template.md'):
                continue
            out.append(f)
    return out


def cmd_new(args):
    fmt = args.format
    ext = '.' + fmt
    target = draft_file(args.slug, fmt)
    if os.path.exists(target):
        sys.exit(f'❌ draft already exists: {args.slug}.{fmt}')
    other, _ = find_draft(args.slug)
    if other:
        sys.exit(f'❌ draft already exists as {os.path.basename(other)}')
    tpl_path = os.path.join(TEMPLATES_DIR, f'{args.template}.{fmt}')
    if not os.path.exists(tpl_path):
        avail = [f for f in os.listdir(TEMPLATES_DIR) if f.endswith(ext)]
        sys.exit(f'❌ template not found: {args.template}.{fmt} (available: {avail})')
    tpl = open(tpl_path, encoding='utf-8').read()
    now = now_iso()
    title = args.title or args.slug
    out = (tpl.replace('__SLUG__', args.slug)
              .replace('__TITLE__', title)
              .replace('__NOW__', now))
    fm, body = parse_frontmatter(out, ext)
    if args.type: fm['type'] = args.type
    if args.alias: fm['target_alias'] = args.alias
    if args.pin: fm['pin'] = 'true'
    if args.source: fm['source_url'] = args.source
    if args.tags: fm['tags'] = normalize_list(args.tags)
    fm['created_at'] = fm['updated_at'] = now
    write_draft(target, fm, body, ext)
    print(f'✅ created: drafts/{args.slug}.{fmt} (template: {args.template})')


def cmd_list(args):
    fields = (args.fields.split(',') if args.fields else DEFAULT_FIELDS)
    rows = []
    for f in glob_drafts():
        ext = os.path.splitext(f)[1]
        fm, _ = parse_frontmatter(open(f, encoding='utf-8').read(), ext)
        if args.status and fm.get('status') != args.status:
            continue
        slug = os.path.basename(f)[:-len(ext)]
        fm.setdefault('slug', slug)
        rows.append([fm.get(fld, '') for fld in fields])
    if not rows:
        print('(no drafts)')
        return
    widths = [max(len(str(v)) for v in col) for col in zip(fields, *rows)]
    fmt_str = '  '.join(f'{{:<{w}}}' for w in widths)
    print(fmt_str.format(*fields))
    print(fmt_str.format(*['-' * w for w in widths]))
    for row in rows:
        print(fmt_str.format(*[str(v) for v in row]))
    print(f'\n{len(rows)} draft(s)')


def cmd_show(args):
    p, fm, body, ext = read_draft(args.slug)
    print(f'📄 {p} ({ext[1:]})\n')
    for k, v in fm.items():
        print(f'  {k}: {v}')
    print('\n--- body ---')
    print(body.rstrip())


def cmd_set(args):
    p, fm, body, ext = read_draft(args.slug)
    changes = []
    for pair in args.assigns:
        if '=' not in pair:
            sys.exit(f'❌ bad FIELD=VALUE: {pair} (need field=value)')
        k, v = pair.split('=', 1)
        k = k.strip()
        if k == 'tags':
            v = normalize_list(v)
        else:
            v = parse_value(v)
        fm[k] = v
        changes.append(f'{k}={v}')
    fm['updated_at'] = now_iso()
    write_draft(p, fm, body, ext)
    print(f'✅ {args.slug}: {", ".join(changes)}')


def cmd_set_all(args):
    if '=' not in args.assign:
        sys.exit('❌ need FIELD=VALUE')
    k, v = args.assign.split('=', 1)
    k = k.strip()
    if k == 'tags':
        v = normalize_list(v)
    else:
        v = parse_value(v)
    count = 0
    for f in glob_drafts():
        ext = os.path.splitext(f)[1]
        fm, body = parse_frontmatter(open(f, encoding='utf-8').read(), ext)
        if args.status and fm.get('status') != args.status:
            continue
        fm[k] = v
        fm['updated_at'] = now_iso()
        write_draft(f, fm, body, ext)
        count += 1
    print(f'✅ set {k}={v} on {count} draft(s)' + (f' (filtered status={args.status})' if args.status else ''))


def cmd_archive(args):
    p, ext = find_draft(args.slug)
    if not p:
        arc, _ = find_draft(args.slug, ARCHIVE)
        if arc:
            sys.exit(f'⚠ already archived: drafts/archive/{os.path.basename(arc)}')
        sys.exit(f'❌ draft not found: {args.slug}')
    os.makedirs(ARCHIVE, exist_ok=True)
    fm, body = parse_frontmatter(open(p, encoding='utf-8').read(), ext)
    fm['status'] = 'archived'
    fm['updated_at'] = now_iso()
    arc = os.path.join(ARCHIVE, f'{args.slug}{ext}')
    write_draft(arc, fm, body, ext)
    os.remove(p)
    print(f'✅ archived: drafts/archive/{args.slug}{ext}')


def cmd_unarchive(args):
    arc, ext = find_draft(args.slug, ARCHIVE)
    if not arc:
        sys.exit(f'❌ not in archive: {args.slug}')
    fm, body = parse_frontmatter(open(arc, encoding='utf-8').read(), ext)
    if fm.get('status') == 'archived':
        fm['status'] = 'idea'
    fm['updated_at'] = now_iso()
    write_draft(draft_file(args.slug, ext[1:]), fm, body, ext)
    os.remove(arc)
    print(f'✅ restored: drafts/{args.slug}{ext}')


def cmd_delete(args):
    p, _ = find_draft(args.slug)
    if not p:
        p, _ = find_draft(args.slug, ARCHIVE)
    if not p:
        sys.exit(f'❌ not found: {args.slug}')
    if not args.yes:
        confirm = input(f'delete {p}? [y/N] ').strip().lower()
        if confirm != 'y':
            print('aborted'); return
    os.remove(p)
    print(f'✅ deleted: {p}')


def cmd_factcheck(args):
    """Print draft + heuristically extracted candidate factual claims for agent verification."""
    _, fm, body, ext = read_draft(args.slug)
    print(f'📄 factcheck: drafts/{args.slug}{ext}\n')
    print('--- frontmatter (relevant) ---')
    for k in ('slug', 'title', 'source_url', 'tags'):
        if k in fm and fm[k]:
            print(f'  {k}: {fm[k]}')
    print('\n--- body ---')
    print(body.rstrip())
    claims = []
    for line in body.splitlines():
        s = line.strip()
        if not s or s.startswith('#') or s.startswith('*') or s.startswith('- ['):
            continue
        has_num = bool(re.search(r'\d', s))
        has_url = 'http' in s
        has_def = any(v in s for v in ('是', '为', '叫做', '称为', '指的是', '即', 'used', 'means', 'proposed'))
        if has_num or has_url or has_def:
            claims.append(s)
    if claims:
        print('\n--- candidate factual claims (heuristic — agent verifies each) ---')
        for i, c in enumerate(claims, 1):
            print(f'  [{i}] {c[:140]}')
        print(f'\n{len(claims)} candidate(s). Dispatch factcheck subagent (subagents/factcheck.md) to verify.')


def main():
    ap = argparse.ArgumentParser(description='Blog draft management (supports .org and .md)')
    sub = ap.add_subparsers(dest='cmd', required=True)

    n = sub.add_parser('new', help='create draft from template')
    n.add_argument('slug')
    n.add_argument('--title')
    n.add_argument('--type', default='original')
    n.add_argument('--alias', help='target_alias e.g. categories/杂识')
    n.add_argument('--pin', action='store_true')
    n.add_argument('--source', help='source_url')
    n.add_argument('--tags', help='comma-separated')
    n.add_argument('--template', default='brainstorm',
                   help='template name (brainstorm|plan|paper-note), default brainstorm')
    n.add_argument('--format', choices=['org', 'md'], default=DEFAULT_FMT,
                   help=f'draft format, default {DEFAULT_FMT}')
    n.set_defaults(func=cmd_new)

    l = sub.add_parser('list', help='list drafts')
    l.add_argument('fields', nargs='?', help='comma-separated fields to show')
    l.add_argument('--status')
    l.set_defaults(func=cmd_list)

    s = sub.add_parser('show', help='show a draft')
    s.add_argument('slug')
    s.set_defaults(func=cmd_show)

    st = sub.add_parser('set', help='set FIELD=VALUE on one draft')
    st.add_argument('slug')
    st.add_argument('assigns', nargs='+', help='field=value pairs')
    st.set_defaults(func=cmd_set)

    sa = sub.add_parser('set-all', help='set FIELD=VALUE on all drafts (optionally filtered)')
    sa.add_argument('assign', help='field=value')
    sa.add_argument('--status')
    sa.set_defaults(func=cmd_set_all)

    ar = sub.add_parser('archive', help='move draft to drafts/archive/')
    ar.add_argument('slug')
    ar.set_defaults(func=cmd_archive)

    ur = sub.add_parser('unarchive', help='restore from archive')
    ur.add_argument('slug')
    ur.set_defaults(func=cmd_unarchive)

    d = sub.add_parser('delete', help='delete a draft')
    d.add_argument('slug')
    d.add_argument('-y', '--yes', action='store_true')
    d.set_defaults(func=cmd_delete)

    fc = sub.add_parser('factcheck', help='print draft + candidate factual claims for verification')
    fc.add_argument('slug')
    fc.set_defaults(func=cmd_factcheck)

    args = ap.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
