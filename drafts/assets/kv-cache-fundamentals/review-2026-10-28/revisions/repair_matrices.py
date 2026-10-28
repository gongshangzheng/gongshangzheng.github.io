from pathlib import Path

root = Path(__file__).resolve().parent
source = root.parent / 'originals' / 'multihead-kv.svg'
svg = source.read_text()
replacements = {
    '<rect width="1600" height="1280" fill="#fbfcfe"/>':
        '<rect width="1600" height="1360" fill="#fbfcfe"/>',
    '<text x="1110" y="1160">不同 head 的输出沿特征维拼接；W-output 混合各头特征。</text>':
        '<text x="1110" y="1160">各 head 输出沿特征维拼接；</text><text x="1110" y="1190">W-output 再混合各头特征。</text>',
}
for old, new in replacements.items():
    count = svg.count(old)
    if count != 1:
        raise ValueError(f'Expected exactly one occurrence of {old!r}; found {count}')
    svg = svg.replace(old, new)
(root / 'multihead-kv.svg').write_text(svg)
