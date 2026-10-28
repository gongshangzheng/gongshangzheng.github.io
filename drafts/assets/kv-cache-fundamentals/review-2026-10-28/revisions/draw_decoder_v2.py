"""Candidate only: explicit Post-LN residual sums on the main vertical bus."""
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, register_namespace, tostring

NS = 'http://www.w3.org/2000/svg'
register_namespace('', NS)
W, H = 1500, 2420
svg = Element(f'{{{NS}}}svg', width=str(W), height=str(H), viewBox=f'0 0 {W} {H}')

def add(tag, **attrs):
    return SubElement(svg, f'{{{NS}}}{tag}', {key.replace('_', '-'): str(value) for key, value in attrs.items()})

def text(x, y, label, size=20, color='#27394d', anchor='start', weight='normal'):
    node = add('text', x=x, y=y, font_size=size, fill=color, text_anchor=anchor,
               font_weight=weight, font_family='Hiragino Sans GB, Arial, sans-serif')
    node.text = label
    return node

def box(x, y, width, height, fill, stroke='#91a2b7', radius=10, dash=None):
    attrs = dict(x=x, y=y, width=width, height=height, rx=radius, fill=fill,
                 stroke=stroke, stroke_width=1.8)
    if dash:
        attrs['stroke_dasharray'] = dash
    return add('rect', **attrs)

COLORS = {'main': '#42566c', 'residual': '#8966a5', 'read': '#2563a6', 'write': '#c87522'}
def line(points, kind='main', arrow=True, dash=None, width=3):
    attrs = dict(d=points, fill='none', stroke=COLORS[kind], stroke_width=width,
                 stroke_linecap='round', stroke_linejoin='round')
    if arrow:
        attrs['marker_end'] = f'url(#arrow-{kind})'
    if dash:
        attrs['stroke_dasharray'] = dash
    return add('path', **attrs)

def state(x, y, layer):
    text(x, y, 'h', 23, weight='bold')
    text(x+17, y+7, 'D', 13)
    text(x+17, y-13, str(layer), 13)

def fork(y):
    add('circle', cx=480, cy=y, r=4.5, fill=COLORS['main'])

def summation(y):
    add('circle', cx=480, cy=y, r=17, fill='#ffffff', stroke=COLORS['residual'], stroke_width=2.5)
    # Native geometry keeps the plus centered and avoids baseline/font ambiguity.
    line(f'M472 {y}H488', 'main', arrow=False, width=2.3)
    line(f'M480 {y-8}V{y+8}', 'main', arrow=False, width=2.3)
    text(519, y+6, '残差相加', 17, COLORS['residual'])

add('title').text = '三层Decoder：残差在主干相加，每层独立保存KV'
add('desc').text = ('Post-LN示意。每个子层输入在主干圆点分叉，一路进入MHA或FFN，'
                    '一路沿左侧旁路到主干加号，与子层输出相加后进入LayerNorm。'
                    '层间留出70像素空白；当前D逐层读取和追加本层KV，最后预测E。')
defs = add('defs')
for kind, color in COLORS.items():
    marker = SubElement(defs, f'{{{NS}}}marker', id=f'arrow-{kind}', viewBox='0 0 12 12',
                        refX='11', refY='6', markerWidth='12', markerHeight='12',
                        markerUnits='userSpaceOnUse', orient='auto')
    SubElement(marker, f'{{{NS}}}path', d='M0 0L12 6L0 12Z', fill=color)
box(0, 0, W, H, '#ffffff', '#ffffff', 0)
text(55, 60, '多层 Decoder：残差在主干汇合，每层独立保存 KV', 33, weight='bold')
text(55, 101, '当前输入 D；历史 A/B/C；每层只画一个 KV 头。隐藏状态沿主干从下向上流动。', 20, '#5b6d81')
for x, kind, label in [(58, 'main', '主干'), (260, 'residual', '残差旁路'), (535, 'write', '写入 K/V'), (835, 'read', '读取 K/V')]:
    line(f'M{x} 143H{x+60}', kind, dash=('8 6' if kind == 'write' else '3 5' if kind == 'read' else None))
    text(x+78, 150, label, 18, COLORS[kind])
box(55, 177, 1390, 63, '#f3f6fb', '#d8e1ec')
text(75, 203, 'Post-LN 示意：子层输出与旁路先相加，再经过 LayerNorm；不含 cross-attention。', 18)
text(75, 226, '圆点是分叉；主干上的圆圈“＋”是汇合。具体模型也可能采用 Pre-LN。', 17, '#5b6d81')

layers = [(3, 310), (2, 940), (1, 1570)]
for ell, top in layers:
    # Each trunk card ends before the next one starts; cache frames fit its vertical span.
    box(130, top, 650, 560, '#f9fbfe', '#dae3ed', 16)
    text(154, top+37, f'Layer {ell}', 21, '#536b85', weight='bold')
    center, left, right, side = 480, 300, 660, 205
    input_y, sum1, norm1, ffn, branch2, sum2, norm2 = (
        top+510, top+360, top+280, top+145, top+245, top+110, top+30)
    # Main attention branch: input -> MHA -> sum -> norm.
    line(f'M{center} {input_y}V{top+475}')
    box(left, top+405, 360, 70, '#daeaf8')
    text(center, top+433, 'Masked multi-head attention', 20, anchor='middle', weight='bold')
    text(center, top+459, '当前 D 的 Q/K/V 由本层输入投影得到', 15, anchor='middle')
    line(f'M{center} {top+405}V{sum1+17}')
    line(f'M{center} {input_y}H{side}V{sum1}H{center-17}', 'residual')
    fork(input_y)
    summation(sum1)
    line(f'M{center} {sum1-17}V{norm1+48}')
    box(left, norm1, 360, 48, '#fff2d9')
    text(center, norm1+31, 'LayerNorm', 21, anchor='middle')
    # FFN branch splits only after the preceding norm, then meets on the bus again.
    line(f'M{center} {norm1}V{branch2}', arrow=False)
    line(f'M{center} {branch2}V{ffn+65}')
    box(left, ffn, 360, 65, '#dfefe5')
    text(center, ffn+28, 'Position-wise FFN', 21, anchor='middle', weight='bold')
    text(center, ffn+51, '逐位置进行非线性变换', 16, anchor='middle')
    line(f'M{center} {ffn}V{sum2+17}')
    line(f'M{center} {branch2}H{side}V{sum2}H{center-17}', 'residual')
    fork(branch2)
    summation(sum2)
    line(f'M{center} {sum2-17}V{norm2+48}')
    box(left, norm2, 360, 48, '#fff2d9')
    text(center, norm2+31, 'LayerNorm', 21, anchor='middle')
    # Arrows between cards are continuous with the next input fork.
    if ell != 3:
        upper_input = top-630+510
        line(f'M{center} {norm2}V{upper_input}')
        state(520, top-27, ell)
    # Side cache stays at the attention level and never touches residual paths.
    cache_x, cache_y = 900, top+390
    box(cache_x, cache_y, 535, 145, '#ffffff', '#657e9a', 12, '7 6')
    text(cache_x+18, cache_y+26, f'第 {ell} 层 KV Cache（示意一个 KV 头）', 18, weight='bold')
    for idx, label in enumerate(('K', 'V')):
        y = cache_y+43+idx*48
        text(cache_x+24, y+25, label, 21)
        text(cache_x+40, y+11, str(ell), 12)
        for col, token in enumerate('ABCD'):
            x = cache_x+93+col*72
            fill, stroke = ('#daebfa', '#4e84b8') if token != 'D' else ('#fbe7d2', '#c47d37')
            box(x, y, 58, 34, fill, stroke, 5)
            text(x+29, y+24, token, 18, anchor='middle')
    line(f'M{right} {top+432}H{cache_x}', 'write', dash='8 6')
    text(695, top+420, '写入本层 K/V', 16, COLORS['write'])
    line(f'M{cache_x} {top+458}H{right}', 'read', dash='3 5')
    text(695, top+484, '读取本层 K/V', 16, COLORS['read'])

# D is the current input. E is predicted only after the stack, and is not cached yet.
box(315, 2210, 330, 54, '#eae3f6')
text(480, 2245, 'D 的输入嵌入', 20, anchor='middle')
box(430, 2296, 100, 40, '#fbe7d2', '#c47d37')
text(480, 2323, 'D', 22, anchor='middle')
line('M480 2296V2264')
line('M480 2210V2080')
state(520, 2176, 0)
line('M480 340V280H900')
state(520, 263, 3)
box(900, 253, 330, 54, '#f5e3e3')
text(1065, 288, '输出层：下一个 token 的概率', 19, anchor='middle')
line('M1230 280H1310')
box(1310, 260, 125, 40, '#fbe7d2', '#c47d37')
text(1372, 287, '选出 E', 20, anchor='middle')
box(900, 2210, 535, 124, '#f3f6fb', '#d8e1ec')
text(922, 2243, 'D 本轮在各层追加自己的 K/V。', 19)
text(922, 2277, '此时 E 尚未作为输入经过模型，', 19)
text(922, 2308, '因此还没有 E 的 K/V。', 19)
text(55, 2390, '每层的注意力输入与投影不同，所以各层分别维护自己的历史 K/V。', 19, '#5b6d81')
Path(__file__).with_name('decoder-stack-v2.svg').write_bytes(tostring(svg, encoding='utf-8', xml_declaration=True))
