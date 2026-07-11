#!/usr/bin/env python3
"""Blog draft management CLI.

See .agents/skills/blog-drafts/SKILL.md for the full workflow.

Usage:
  draft.py new SLUG [--title T] [--type T] [--alias A] [--pin] [--source URL] [--tags t1,t2]
  draft.py list [FIELDS] [--status S]
  draft.py show SLUG
  draft.py set SLUG FIELD=VALUE [FIELD=VALUE ...]
  draft.py set-all FIELD=VALUE [--status S]
  draft.py archive SLUG
  draft.py unarchive SLUG
  draft.py delete SLUG [-y]

Examples:
  draft.py new how-to-learn --title "如何学习" --pin --source https://v.douyin.com/xxx
  draft.py list                       # default fields: slug, status, progress, pin, title
  draft.py list status,pin,tags       # custom fields
  draft.py list --status idea
  draft.py set how-to-learn status=outlining progress=20
  draft.py set how-to-learn tags=学习,费曼,记忆
  draft.py set-all status=archived --status review-ready
  draft.py archive how-to-learn
  draft.py delete old-idea -y
"""
import argparse, os, re, sys
from datetime import datetime

REPO = os.path.expanduser('~/gongshangzheng.github.io')
DRAFTS = os.path.join(REPO, 'drafts')
ARCHIVE = os.path.join(DRAFTS, 'archive')
TEMPLATES_DIR = os.path.join(REPO, '.agents/skills/blog-drafts/templates')

DEFAULT_FIELDS = ['slug', 'status', 'progress', 'pin', 'title']


def now_iso():
    return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')


def draft_path(slug):
    return os.path.join(DRAFTS, f'{slug}.md')


def parse_fm(text):
    m = re.match(r'^---\n(.*?)\n---\n?', text, re.DOTALL)
    if not m:
        return {}, text
    fm = {}
    for line in m.group(1).splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            v = v.strip()
            # strip inline YAML comment (' #...' — space then hash, not '#' inside a token)
            if ' #' in v:
                v = v.split(' #', 1)[0].rstrip()
            fm[k.strip()] = v
    return fm, text[m.end():]


def serialize_fm(fm):
    lines = ['---']
    for k, v in fm.items():
        lines.append(f'{k}: {v}')
    lines.append('---')
    return '\n'.join(lines) + '\n'


def read_draft(slug):
    p = draft_path(slug)
    if not os.path.exists(p):
        sys.exit(f'❌ draft not found: {slug} (looked at {p})')
    fm, body = parse_fm(open(p, encoding='utf-8').read())
    return p, fm, body


def write_draft(p, fm, body):
    open(p, 'w', encoding='utf-8').write(serialize_fm(fm) + body)


def parse_value(v):
    """Strip surrounding quotes; leave [..] lists and true/false as-is."""
    v = v.strip()
    if len(v) >= 2 and ((v[0] == v[-1] == '"') or (v[0] == v[-1] == "'")):
        v = v[1:-1]
    return v


def normalize_list(v):
    """Accept 'a,b,c' or '[a,b,c]' → '[a, b, c]' inline list form."""
    v = v.strip()
    if v.startswith('[') and v.endswith(']'):
        items = [x.strip() for x in v[1:-1].split(',') if x.strip()]
    else:
        items = [x.strip() for x in v.split(',') if x.strip()]
    return '[' + ', '.join(items) + ']'


def cmd_new(args):
    if os.path.exists(draft_path(args.slug)):
        sys.exit(f'❌ draft already exists: {args.slug}')
    tpl_path = os.path.join(TEMPLATES_DIR, f'{args.template}.md')
    if not os.path.exists(tpl_path):
        avail = [f[:-3] for f in os.listdir(TEMPLATES_DIR) if f.endswith('.md')]
        sys.exit(f'❌ template not found: {args.template} (available: {avail})')
    tpl = open(tpl_path, encoding='utf-8').read()
    now = now_iso()
    title = args.title or args.slug
    out = (tpl.replace('__SLUG__', args.slug)
              .replace('__TITLE__', title)
              .replace('__NOW__', now))
    fm, body = parse_fm(out)
    if args.type: fm['type'] = args.type
    if args.alias: fm['target_alias'] = args.alias
    if args.pin: fm['pin'] = 'true'
    if args.source: fm['source_url'] = args.source
    if args.tags: fm['tags'] = normalize_list(args.tags)
    fm['created_at'] = fm['updated_at'] = now
    write_draft(draft_path(args.slug), fm, body)
    print(f'✅ created: drafts/{args.slug}.md (template: {args.template})')


def cmd_list(args):
    fields = (args.fields.split(',') if args.fields else DEFAULT_FIELDS)
    rows = []
    files = sorted(glob_drafts())
    for f in files:
        fm, _ = parse_fm(open(f, encoding='utf-8').read())
        if args.status and fm.get('status') != args.status:
            continue
        slug = os.path.basename(f)[:-3]
        fm.setdefault('slug', slug)
        rows.append([fm.get(fld, '') for fld in fields])
    if not rows:
        print('(no drafts)')
        return
    # column print
    widths = [max(len(str(v)) for v in col) for col in zip(fields, *rows)]
    fmt = '  '.join(f'{{:<{w}}}' for w in widths)
    print(fmt.format(*fields))
    print(fmt.format(*['-' * w for w in widths]))
    for row in rows:
        print(fmt.format(*[str(v) for v in row]))
    print(f'\n{len(rows)} draft(s)')


def cmd_show(args):
    p, fm, body = read_draft(args.slug)
    print(f'📄 {p}\n')
    for k, v in fm.items():
        print(f'  {k}: {v}')
    print('\n--- body ---')
    print(body.rstrip())


def cmd_set(args):
    p, fm, body = read_draft(args.slug)
    changes = []
    for pair in args.assigns:
        if '=' not in pair:
            sys.exit(f'❌ bad FIELD=VALUE: {pair} (need field=value)')
        k, v = pair.split('=', 1)
        k = k.strip()
        # tags / list-valued fields kept as inline list
        if k in ('tags',):
            v = normalize_list(v)
        else:
            v = parse_value(v)
        fm[k] = v
        changes.append(f'{k}={v}')
    fm['updated_at'] = now_iso()
    write_draft(p, fm, body)
    print(f'✅ {args.slug}: {", ".join(changes)}')


def cmd_set_all(args):
    if '=' not in args.assign:
        sys.exit('❌ need FIELD=VALUE')
    k, v = args.assign.split('=', 1)
    if k.strip() in ('tags',):
        v = normalize_list(v)
    else:
        v = parse_value(v)
    count = 0
    for f in glob_drafts():
        fm, body = parse_fm(open(f, encoding='utf-8').read())
        if args.status and fm.get('status') != args.status:
            continue
        fm[k.strip()] = v
        fm['updated_at'] = now_iso()
        write_draft(f, fm, body)
        count += 1
    print(f'✅ set {k}={v} on {count} draft(s)' + (f' (filtered status={args.status})' if args.status else ''))


def cmd_archive(args):
    src = draft_path(args.slug)
    if not os.path.exists(src):
        # maybe already archived
        arc = os.path.join(ARCHIVE, f'{args.slug}.md')
        if os.path.exists(arc):
            sys.exit(f'⚠ already archived: drafts/archive/{args.slug}.md')
        sys.exit(f'❌ draft not found: {args.slug}')
    os.makedirs(ARCHIVE, exist_ok=True)
    _, fm, body = read_draft(args.slug)
    fm['status'] = 'archived'
    fm['updated_at'] = now_iso()
    write_draft(os.path.join(ARCHIVE, f'{args.slug}.md'), fm, body)
    os.remove(src)
    print(f'✅ archived: drafts/archive/{args.slug}.md')


def cmd_unarchive(args):
    arc = os.path.join(ARCHIVE, f'{args.slug}.md')
    if not os.path.exists(arc):
        sys.exit(f'❌ not in archive: {args.slug}')
    fm, body = parse_fm(open(arc, encoding='utf-8').read())
    fm['status'] = 'idea' if fm.get('status') == 'archived' else fm.get('status', 'idea')
    fm['updated_at'] = now_iso()
    write_draft(draft_path(args.slug), fm, body)
    os.remove(arc)
    print(f'✅ restored: drafts/{args.slug}.md')


def cmd_factcheck(args):
    """Print draft + heuristically extracted candidate factual claims for agent verification."""
    _, fm, body = read_draft(args.slug)
    print(f'📄 factcheck: drafts/{args.slug}.md\n')
    print('--- frontmatter (relevant) ---')
    for k in ('slug', 'title', 'source_url', 'tags'):
        if k in fm and fm[k]:
            print(f'  {k}: {fm[k]}')
    print('\n--- body ---')
    print(body.rstrip())
    # heuristic candidate claim extraction (agent refines + verifies)
    claims = []
    for line in body.splitlines():
        s = line.strip()
        if not s or s.startswith('#') or s.startswith('- ['):
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


def cmd_delete(args):
    p = draft_path(args.slug)
    arc = os.path.join(ARCHIVE, f'{args.slug}.md')
    target = p if os.path.exists(p) else (arc if os.path.exists(arc) else None)
    if not target:
        sys.exit(f'❌ not found: {args.slug}')
    if not args.yes:
        confirm = input(f'delete {target}? [y/N] ').strip().lower()
        if confirm != 'y':
            print('aborted'); return
    os.remove(target)
    print(f'✅ deleted: {target}')


def glob_drafts():
    import glob
    out = []
    for f in sorted(glob.glob(os.path.join(DRAFTS, '*.md'))):
        if os.path.basename(f) in ('README.md', '_template.md'):
            continue
        out.append(f)
    return out


def main():
    ap = argparse.ArgumentParser(description='Blog draft management')
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
                   help='template name in .agents/skills/blog-drafts/templates/ (default: brainstorm)')
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
