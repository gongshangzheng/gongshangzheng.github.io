#!/usr/bin/env python3
"""
Migrate articles from 2-level category paths to 3-level paths based on sub_id ranges.
Uses sequential renumbering: sorts articles by sub_id within each group, then assigns 10, 20, 30...
"""

import os
import re
import json
from collections import defaultdict

PAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'pages')

# Chinese numeral mapping
CN_NUMS = '零一二三四五六七八九十'
def cn_to_int(cn):
    if cn == '十': return 10
    if cn.startswith('十'): return 10 + CN_NUMS.index(cn[1])
    if cn.endswith('十'): return CN_NUMS.index(cn[0]) * 10
    if '十' in cn:
        parts = cn.split('十')
        return CN_NUMS.index(parts[0]) * 10 + CN_NUMS.index(parts[1])
    return CN_NUMS.index(cn)

def int_to_cn(n):
    if n <= 10: return CN_NUMS[n]
    if n < 20: return '十' + CN_NUMS[n - 10]
    if n % 10 == 0: return CN_NUMS[n // 10] + '十'
    return CN_NUMS[n // 10] + '十' + CN_NUMS[n % 10]


# Define migration groups: (series_path, sub_id_ranges, deep_path_suffix, new_sub_id_start)
# sub_id_ranges: list of (min, max) tuples
# Articles are sorted by sub_id within each group, then numbered sequentially from new_sub_id_start
MIGRATION_GROUPS = [
    # 数字人
    {'series': 'AI/数字人', 'ranges': [(1000, 1999)], 'suffix': '数字人论文精读', 'start': 10},
    {'series': 'AI/数字人', 'ranges': [(2000, 2999)], 'suffix': '数字人工程解读', 'start': 10},
    # 图像压缩
    {'series': 'AI/图像压缩', 'ranges': [(110, 199)], 'suffix': '图像压缩基础系列', 'start': 10},  # 100=hub, skip
    {'series': 'AI/图像压缩', 'ranges': [(200, 899)], 'suffix': '图像压缩专题', 'start': 10},
    {'series': 'AI/图像压缩', 'ranges': [(1000, 1999)], 'suffix': '图像压缩论文精读', 'start': 10},
    {'series': 'AI/图像压缩', 'ranges': [(3100, 3199)], 'suffix': '红外图像压缩', 'start': 10},
    {'series': 'AI/图像压缩', 'ranges': [(3500, 3999)], 'suffix': '红外图像压缩', 'start': 100},  # offset 100
    # 动作识别
    {'series': 'AI/动作识别', 'ranges': [(3500, 3999)], 'suffix': '动作识别论文精读', 'start': 30},  # 10,20 already taken
]

# Hub page special handling
HUB_MIGRATIONS = {
    'compression-hub.html': {
        'old_alias': 'categories/AI/图像压缩',
        'new_alias': 'categories/AI/图像压缩/图像压缩基础系列/index',
        'also_add': 'categories/AI/图像压缩/图像压缩基础系列',
        'new_sub_id': 0,
    },
    'infrared-compression-hub.html': {
        'old_alias': 'categories/AI/图像压缩/红外图像压缩',
        'new_alias': 'categories/AI/图像压缩/红外图像压缩/index',
        'also_add': 'categories/AI/图像压缩/红外图像压缩',
        'new_sub_id': 0,
    },
}


def parse_frontmatter_raw(content):
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m: return None, content, 0, len(content)
    return m.group(1), content[m.end():], m.start(), m.end()


def parse_aliases(fm_text):
    aliases = []
    in_aliases = False
    for line in fm_text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('aliases:'):
            if '[' in stripped and ']' in stripped:
                val = stripped.split('[', 1)[1].rsplit(']', 1)[0]
                for item in val.split(','):
                    item = item.strip().strip('"').strip("'")
                    if item:
                        aliases.append(('inline', item))
            else:
                in_aliases = True
        elif in_aliases:
            if stripped.startswith('- '):
                item = stripped[2:].strip().strip('"').strip("'")
                aliases.append(('list', item))
            elif stripped and not stripped.startswith('-'):
                in_aliases = False
    return aliases


def get_category_alias_value(aliases):
    for _, val in aliases:
        v = val.strip().strip('/')
        if v.startswith('categories/') and not v.endswith('/index'):
            return v
    return None


def get_sub_id(fm_text):
    m = re.search(r'^sub_id:\s*(.+)$', fm_text, re.MULTILINE)
    if not m: return None
    val = m.group(1).strip()
    try: return int(val)
    except ValueError: return None


def get_title(fm_text):
    m = re.search(r'^title:\s*"(.*?)"', fm_text, re.MULTILINE)
    if m: return m.group(1)
    m = re.search(r"^title:\s*'(.*)'", fm_text, re.MULTILINE)
    if m: return m.group(1)
    m = re.search(r'^title:\s*(.+)$', fm_text, re.MULTILINE)
    if m: return m.group(1).strip()
    return None


def find_migration_group(cat_path, sub_id):
    if sub_id is None: return None
    for group in MIGRATION_GROUPS:
        if cat_path != group['series']: continue
        for min_id, max_id in group['ranges']:
            if min_id <= sub_id <= max_id:
                return group
    return None


def replace_category_alias_in_fm(fm_text, old_cat, new_cat):
    old_full = f'categories/{old_cat}'
    new_full = f'categories/{new_cat}'
    result = fm_text.replace(f'"{old_full}"', f'"{new_full}"')
    result = result.replace(f"'{old_full}'", f"'{new_full}'")
    return result


def update_sub_id_in_fm(fm_text, new_sub_id):
    return re.sub(r'^(sub_id:\s*).*$', f'\\g<1>{new_sub_id}', fm_text, flags=re.MULTILINE)


def update_title_in_fm(fm_text, new_title):
    return re.sub(r'^(title:\s*)".*"$', f'\\g<1>"{new_title}"', fm_text, flags=re.MULTILINE)


def renumber_title(title, new_position):
    m = re.search(r'（([一二三四五六七八九十]+)）', title)
    if m:
        old_cn = m.group(1)
        new_cn = int_to_cn(new_position)
        return title.replace(f'（{old_cn}）', f'（{new_cn}）')
    return title


def add_alias_to_fm(fm_text, new_alias):
    m = re.search(r'^(aliases:\s*\[)([^\]]*)(\])', fm_text, re.MULTILINE)
    if m:
        prefix = m.group(1)
        content = m.group(2).strip()
        suffix = m.group(3)
        if content:
            new_content = content.rstrip().rstrip(',') + f', "{new_alias}"'
        else:
            new_content = f'"{new_alias}"'
        return fm_text[:m.start()] + prefix + new_content + suffix + fm_text[m.end():]
    
    lines = fm_text.split('\n')
    result = []
    in_aliases = False
    inserted = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('aliases:'):
            in_aliases = True
            result.append(line)
        elif in_aliases and stripped.startswith('- '):
            result.append(line)
        elif in_aliases and stripped and not stripped.startswith('-'):
            result.append(f'  - "{new_alias}"')
            result.append(line)
            in_aliases = False
            inserted = True
        else:
            result.append(line)
    if not inserted:
        result.append(f'  - "{new_alias}"')
    return '\n'.join(result)


def main():
    # Phase 1: Collect all articles and group them
    articles = []
    
    for fname in sorted(os.listdir(PAGES_DIR)):
        if not fname.endswith('.html'): continue
        fpath = os.path.join(PAGES_DIR, fname)
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
        
        fm_text, body, fm_start, fm_end = parse_frontmatter_raw(content)
        if fm_text is None:
            continue
        
        aliases = parse_aliases(fm_text)
        cat_alias = get_category_alias_value(aliases)
        if not cat_alias:
            continue
        
        cat_path = cat_alias[len('categories/'):]
        
        # Skip if already at 3+ level path
        if cat_path.count('/') >= 2:
            continue
        
        sub_id = get_sub_id(fm_text)
        title = get_title(fm_text)
        
        group = find_migration_group(cat_path, sub_id)
        if not group:
            continue
        
        articles.append({
            'fname': fname,
            'fpath': fpath,
            'content': content,
            'fm_text': fm_text,
            'body': body,
            'fm_start': fm_start,
            'fm_end': fm_end,
            'cat_path': cat_path,
            'sub_id': sub_id,
            'title': title,
            'group': group,
        })
    
    # Phase 2: Sort by sub_id within each group and assign new sub_ids
    groups = defaultdict(list)
    for art in articles:
        groups[(art['group']['series'], art['group']['suffix'])].append(art)
    
    for key, arts in groups.items():
        arts.sort(key=lambda a: a['sub_id'])
        group = arts[0]['group']
        start = group['start']
        for i, art in enumerate(arts):
            art['new_sub_id'] = start + i * 10
    
    # Phase 3: Apply migrations
    stats = {'migrated': 0, 'hub_migrated': 0, 'title_changed': 0}
    
    # Handle hub pages first
    for fname, hub in HUB_MIGRATIONS.items():
        fpath = os.path.join(PAGES_DIR, fname)
        if not os.path.exists(fpath): continue
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
        fm_text, body, fm_start, fm_end = parse_frontmatter_raw(content)
        if fm_text is None: continue
        
        new_alias = hub['new_alias']
        if new_alias in fm_text:
            continue  # already migrated
        
        new_fm = fm_text
        old_alias = hub['old_alias']
        
        # Replace old alias with /index version
        if f'"{old_alias}"' in new_fm and f'"{new_alias}"' not in new_fm:
            new_fm = new_fm.replace(f'"{old_alias}"', f'"{new_alias}"')
        
        # Also add the non-index version
        also_add = hub['also_add']
        if f'"{also_add}"' not in new_fm:
            new_fm = add_alias_to_fm(new_fm, also_add)
        
        # Update sub_id
        new_fm = update_sub_id_in_fm(new_fm, hub['new_sub_id'])
        
        new_content = content[:fm_start] + '---\n' + new_fm + '\n---' + body
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        stats['hub_migrated'] += 1
        print(f"  [HUB] {fname}: → {new_alias}, sub_id → {hub['new_sub_id']}")
    
    # Handle regular articles
    for art in articles:
        fm_text = art['fm_text']
        old_cat = art['cat_path']
        new_cat = f"{old_cat}/{art['group']['suffix']}"
        new_sub_id = art['new_sub_id']
        
        # Replace category alias
        new_fm = replace_category_alias_in_fm(fm_text, old_cat, new_cat)
        
        # Update sub_id
        new_fm = update_sub_id_in_fm(new_fm, new_sub_id)
        
        # Handle title renumbering for 动作识别
        old_title = art['title']
        new_title = old_title
        if art['group']['series'] == 'AI/动作识别' and art['group']['suffix'] == '动作识别论文精读':
            # Existing: VideoMAE(10, 一), SlowFast(20, 二)
            # New: IGMN should be 三 (pos 3), SkeleTR should be 四 (pos 4)
            position = new_sub_id // 10  # 30→3, 40→4
            new_title = renumber_title(old_title, position)
        
        if new_title != old_title:
            new_fm = update_title_in_fm(new_fm, new_title)
            stats['title_changed'] += 1
            print(f"  [TITLE] {art['fname']}: '{old_title[:50]}...' → '{new_title[:50]}...'")
        
        new_content = art['content'][:art['fm_start']] + '---\n' + new_fm + '\n---' + art['body']
        with open(art['fpath'], 'w', encoding='utf-8') as f:
            f.write(new_content)
        stats['migrated'] += 1
        print(f"  [MIGRATED] {art['fname']}: {old_cat} → {new_cat}, sub_id {art['sub_id']} → {new_sub_id}")
    
    print(f"\n=== Migration complete ===")
    print(f"  Migrated: {stats['migrated']}")
    print(f"  Hub migrated: {stats['hub_migrated']}")
    print(f"  Titles changed: {stats['title_changed']}")


if __name__ == '__main__':
    main()
