from pathlib import Path
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)
svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
<title>单步解码中的 KV 缓存读取与写入</title>
<desc>单 token decode 读取 32768 个历史 token 的全部层 K/V，约 4 GiB；当前 token 新增的全部层 K/V 为 128 KiB。图形仅示意，不按面积或箭头宽度比例。</desc>
<defs>
 <marker id="blueArrow" markerWidth="24" markerHeight="24" markerUnits="userSpaceOnUse" refX="20" refY="12" orient="auto"><path d="M0,0 L24,12 L0,24 Z" fill="#3178b8"/></marker>
 <marker id="orangeArrow" markerWidth="24" markerHeight="24" markerUnits="userSpaceOnUse" refX="20" refY="12" orient="auto"><path d="M0,0 L24,12 L0,24 Z" fill="#db8127"/></marker>
 <marker id="darkArrow" markerWidth="24" markerHeight="24" markerUnits="userSpaceOnUse" refX="20" refY="12" orient="auto"><path d="M0,0 L24,12 L0,24 Z" fill="#526174"/></marker>
</defs>
<rect width="1200" height="820" fill="#fbfcfe"/>
<g font-family="Hiragino Sans GB,Arial,sans-serif" fill="#202b3c">
<text x="44" y="54" font-size="32" font-weight="700">单步解码：读历史 KV，追加当前 KV</text>
<text x="44" y="88" font-size="19" fill="#526174">B=1 · L=32 · Hkv=8 · dh=128 · FP16=2 bytes</text>
<rect x="42" y="112" width="1116" height="420" rx="18" fill="#fff" stroke="#d8e0eb" stroke-width="2"/>
<!-- history cache -->
<text x="78" y="153" font-size="22" font-weight="700" fill="#27649b">历史缓存：32768 个 token</text>
<text x="78" y="181" font-size="17" fill="#526174">蓝色分段表示多层 K/V 的历史存储（非单一注意力头）</text>
<g stroke="#27649b" stroke-width="2">
 <rect x="80" y="205" width="252" height="190" rx="10" fill="#e5f1fb"/>
 <path d="M80 265H332 M80 325H332"/><path d="M206 205V395"/>
 <path d="M100 225h88v20h-88z M224 225h88v20h-88z M100 285h88v20h-88z M224 285h88v20h-88z M100 345h88v20h-88z M224 345h88v20h-88z" fill="#c8e0f4" stroke="none"/>
</g>
<g font-size="18" text-anchor="middle" font-weight="700" fill="#27649b"><text x="144" y="240">K · 多层</text><text x="270" y="240">V · 多层</text><text x="144" y="300">K · 多层</text><text x="270" y="300">V · 多层</text><text x="144" y="360">K · 多层</text><text x="270" y="360">V · 多层</text></g>
<text x="206" y="425" text-anchor="middle" font-size="17" fill="#526174">… 历史位置 …</text>
<!-- read arrow -->
<path d="M345 294 C410 294 417 294 475 294" fill="none" stroke="#3178b8" stroke-width="8" marker-end="url(#blueArrow)"/>
<text x="408" y="253" text-anchor="middle" font-size="20" font-weight="700" fill="#27649b">读取约 4 GiB</text>
<!-- attention current step -->
<rect x="493" y="205" width="240" height="190" rx="14" fill="#f2f5f9" stroke="#aab7c7" stroke-width="2"/>
<text x="613" y="245" text-anchor="middle" font-size="22" font-weight="700">当前 token</text>
<text x="613" y="280" text-anchor="middle" font-size="19">逐层读取历史 K/V</text>
<text x="613" y="311" text-anchor="middle" font-size="19">并计算 attention</text>
<text x="613" y="354" text-anchor="middle" font-size="17" fill="#526174">完成这一解码步</text>
<path d="M741 294 H837" fill="none" stroke="#526174" stroke-width="4" marker-end="url(#darkArrow)"/>
<rect x="851" y="222" width="258" height="145" rx="14" fill="#f7f9fc" stroke="#c8d1dc" stroke-width="2"/>
<text x="980" y="265" text-anchor="middle" font-size="21" font-weight="700">预测下一个 token</text>
<text x="980" y="303" text-anchor="middle" font-size="18" fill="#526174">本步输出供后续生成使用</text>
<!-- append write -->
<rect x="80" y="453" width="252" height="48" rx="9" fill="#fbe8d5" stroke="#db8127" stroke-width="2"/>
<text x="206" y="484" text-anchor="middle" font-size="19" font-weight="700" fill="#a95d15">当前 token 新增 K/V</text>
<path d="M345 477 H468" fill="none" stroke="#db8127" stroke-width="4" marker-end="url(#orangeArrow)"/>
<text x="408" y="449" text-anchor="middle" font-size="18" font-weight="700" fill="#a95d15">追加 128 KiB</text>
<rect x="485" y="453" width="248" height="48" rx="9" fill="#fff7ef" stroke="#db8127" stroke-width="2"/>
<text x="609" y="484" text-anchor="middle" font-size="19" font-weight="700" fill="#a95d15">同一缓存末端 +1位置</text>
<text x="771" y="483" font-size="18" fill="#526174">生成的 token 尚未在本步写入缓存</text>
<!-- quantitative panel -->
<rect x="42" y="551" width="1116" height="125" rx="16" fill="#fff" stroke="#d8e0eb" stroke-width="2"/>
<text x="70" y="586" font-size="20" font-weight="700">按配置计算（全层 K/V）</text>
<text x="70" y="620" font-size="18">每 token：2 × 32 × 8 × 128 × 2 = 131072 bytes = 128 KiB</text>
<text x="70" y="651" font-size="18">32768 token 历史：4294967296 bytes = 4 GiB</text>
<rect x="824" y="570" width="292" height="78" rx="12" fill="#eef5fb" stroke="#9bbbd7" stroke-width="2"/>
<text x="970" y="601" text-anchor="middle" font-size="18" fill="#526174">历史读取量 : 新 KV 写入量</text>
<text x="970" y="634" text-anchor="middle" font-size="26" font-weight="700" fill="#27649b">32768 : 1</text>
<text x="44" y="710" font-size="16" fill="#526174">示意，不按面积/箭头宽度比例。4 GiB 是简化逻辑扫描量：假设每层 K/V 各读一次，并非 HBM 实测；共享 KV 充分复用。</text>
<text x="44" y="738" font-size="16" fill="#526174">未计当前 token 自身 K/V 的读取及其他张量。FP16 缓存按每元素 2 bytes 计算。</text>
<text x="44" y="782" font-size="16" fill="#526174">注：预测 token 在后续解码步成为输入，再生成并追加它对应的 K/V。</text>
</g>
</svg>'''
root=ET.fromstring(svg)
ET.indent(root, space='  ')
(OUT/'bandwidth.svg').write_bytes(ET.tostring(root, encoding='utf-8', xml_declaration=True))
