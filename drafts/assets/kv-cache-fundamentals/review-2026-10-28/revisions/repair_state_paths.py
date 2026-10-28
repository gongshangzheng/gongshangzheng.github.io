from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
source = root.parent.parent / 'source'
out = root / 'source'
out.mkdir(parents=True, exist_ok=True)
for name in ['attention.svg', 'attention.tex', 'attention.txt', 'state-composition.json', 'kv-cache-state-steps-base.svg']:
    shutil.copy2(source / name, out / name)
p = out / 'kv-cache-state-steps-base.svg'
svg = p.read_text()
for x, gutter in [(368, 401), (798, 831), (1228, 1261)]:
    for old, new in [(f'M{x} 264 H{gutter} V465 H{x+6}', f'M{x} 264 H{gutter} V445 H{x+6}'), (f'M{x} 467 H{gutter} V656 H{x+6}', f'M{x} 496 H{gutter-10} V656 H{x+6}')]:
        if svg.count(old) != 1:
            raise ValueError(f'Expected exactly one source path: {old}')
        svg = svg.replace(old, new)
p.write_text(svg)
# Re-compose using source/state-composition.json to a new output path;
# inspect and render the result before replacing the candidate composed SVG.
