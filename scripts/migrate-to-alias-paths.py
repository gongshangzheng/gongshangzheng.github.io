#!/usr/bin/env python3
"""
Batch migrate articles from categories/subcategory/subsubcategory frontmatter
fields to alias-based category paths.

For each article in src/pages/*.html:
  1. Read frontmatter fields: categories, subcategory, subsubcategory
  2. Build alias path: categories/{cat}/{sub}/{subsub}
  3. Add to aliases array (preserve existing aliases)
  4. Remove categories, subcategory, subsubcategory from frontmatter
  5. Preserve sub_id and all other fields

Special cases:
  - No subcategory → aliases: ["categories/{cat}"]
  - Already has categories/ alias (non-index) → skip adding, just remove old fields
  - Hub aliases (categories/.../index) are preserved
"""

import os
import re
import sys


def parse_array(value):
    """Parse a YAML inline array like [AI] or ["AI"] into a list."""
    if not value:
        return []
    inner = value.strip()
    if inner.startswith('[') and inner.endswith(']'):
        inner = inner[1:-1]
    items = []
    for part in inner.split(','):
        part = part.strip()
        if (part.startswith('"') and part.endswith('"')) or \
           (part.startswith("'") and part.endswith("'")):
            part = part[1:-1]
        if part:
            items.append(part)
    return items


def parse_string(value):
    """Parse a YAML string, stripping surrounding quotes."""
    if not value:
        return ''
    v = value.strip()
    if (v.startswith('"') and v.endswith('"')) or \
       (v.startswith("'") and v.endswith("'")):
        return v[1:-1]
    return v


def format_array(items):
    """Format a list as a YAML inline array with quoted strings."""
    return '[' + ', '.join('"' + a + '"' for a in items) + ']'


def migrate_file(filepath):
    """Migrate a single HTML file's frontmatter.

    Returns (status, info) where status is 'migrated', 'already_done',
    'no_categories', or 'no_frontmatter'.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    if not lines or lines[0].strip() != '---':
        return 'no_frontmatter', None

    # Find closing ---
    fm_end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            fm_end = i
            break

    if fm_end is None:
        return 'no_frontmatter', None

    fm_lines = lines[1:fm_end]

    # Extract fields
    cat_raw = None
    sub_raw = None
    subsub_raw = None
    aliases_line_idx = None
    aliases_raw = None

    for i, line in enumerate(fm_lines):
        if line.startswith('categories:'):
            cat_raw = line[len('categories:'):].strip()
        elif line.startswith('subcategory:'):
            sub_raw = line[len('subcategory:'):].strip()
        elif line.startswith('subsubcategory:'):
            subsub_raw = line[len('subsubcategory:'):].strip()
        elif line.startswith('aliases:'):
            aliases_line_idx = i
            aliases_raw = line[len('aliases:'):].strip()

    # Parse categories
    cats = parse_array(cat_raw) if cat_raw else []
    if not cats:
        return 'no_categories', None

    # Parse subcategory and subsubcategory
    sub = parse_string(sub_raw) if sub_raw else ''
    subsub = parse_string(subsub_raw) if subsub_raw else ''

    # Build category path
    cat_path = [cats[0]]
    if sub:
        cat_path.append(sub)
    if subsub:
        cat_path.append(subsub)

    alias_path = 'categories/' + '/'.join(cat_path)

    # Check if already has a non-index categories/ alias
    existing_aliases = parse_array(aliases_raw) if aliases_raw else []
    has_cat_alias = any(
        a.startswith('categories/') and not a.endswith('/index')
        for a in existing_aliases
    )

    if not has_cat_alias:
        # Add the new alias
        existing_aliases.append(alias_path)
        alias_str = format_array(existing_aliases)
        if aliases_line_idx is not None:
            fm_lines[aliases_line_idx] = 'aliases: ' + alias_str
        else:
            # Insert after tags: line, or after title: line, or at end
            insert_idx = len(fm_lines)
            for i, line in enumerate(fm_lines):
                if line.startswith('tags:'):
                    insert_idx = i + 1
                    break
                if line.startswith('title:'):
                    insert_idx = i + 1
            fm_lines.insert(insert_idx, 'aliases: ' + format_array([alias_path]))

    # Remove categories, subcategory, subsubcategory fields
    fm_lines = [
        line for line in fm_lines
        if not line.startswith('categories:')
        and not line.startswith('subcategory:')
        and not line.startswith('subsubcategory:')
    ]

    # Reconstruct content
    new_lines = ['---'] + fm_lines + ['---'] + lines[fm_end + 1:]
    new_content = '\n'.join(new_lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    if has_cat_alias:
        return 'already_done', alias_path
    return 'migrated', alias_path


def main():
    pages_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '..', 'src', 'pages'
    )
    pages_dir = os.path.abspath(pages_dir)

    files = sorted([f for f in os.listdir(pages_dir) if f.endswith('.html')])

    stats = {
        'migrated': 0,
        'already_done': 0,
        'no_categories': 0,
        'no_frontmatter': 0,
        'errors': 0,
    }

    for fname in files:
        filepath = os.path.join(pages_dir, fname)
        try:
            status, info = migrate_file(filepath)
            stats[status] += 1
            if status == 'migrated':
                print(f'  MIGRATED: {fname} → {info}')
            elif status == 'already_done':
                print(f'  SKIPPED (already has category alias): {fname}')
        except Exception as e:
            stats['errors'] += 1
            print(f'  ERROR: {fname}: {e}', file=sys.stderr)

    print()
    print('=== Migration Summary ===')
    print(f'  Migrated:            {stats["migrated"]}')
    print(f'  Already had alias:   {stats["already_done"]}')
    print(f'  No categories:       {stats["no_categories"]}')
    print(f'  No frontmatter:      {stats["no_frontmatter"]}')
    print(f'  Errors:              {stats["errors"]}')
    print(f'  Total processed:     {sum(stats.values())}')


if __name__ == '__main__':
    main()
