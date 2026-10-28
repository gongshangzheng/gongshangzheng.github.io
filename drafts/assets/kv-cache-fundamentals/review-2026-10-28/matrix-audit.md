# KV cache SVG audit: matrix figures

Scope: three source SVGs were copied from `media/images/kv-cache-fundamentals/` into this staging directory. The originals remain untouched. Before and after PNGs were rendered with CairoSVG and inspected at full export size. The revised SVGs are staged for independent review; they have not been installed into the site.

## `attention-matrix-shapes.svg`

**Finding:** No visual defect requiring a change. The panel borders contain their content, matrix labels and arrows are legible, and no connector crosses text. The prefill matrices retain Q 4×3, Kᵀ 3×4, scores/mask 4×4, V 4×3, and O 4×3. Decode shows one query row (1×3), five cached positions (Kᵀ 3×5, logits/weights 1×5, V 5×3), and one output row (1×3). Cell counts match those dimensions. Therefore the staged `attention-matrix-shapes-after.svg` is an unchanged copy.

## `multihead-kv.svg`

**Finding:** The canvas background stopped short of the lower panel. At source coordinate y=1280, the background rectangle ended, while the lower panel extended to y=1316 (`y=956`, `height=360`). This left the final 80 px of the 1360 px canvas transparent. Depending on the viewer background, that transparent strip can appear anomalous; black is not an inherent SVG rendering result. Revised the background rectangle height from 1280 to 1360.

**Dimension audit:** Each of the four head rows contains Q 4×2, Kᵀ 2×4, causal weights 4×4, V 4×2, and O 4×2. The four outputs concatenate to 4×8 and multiply an 8×8 output matrix to produce 4×8. Cell counts are preserved: per row 8/8/16/8/8; concat 32; output projection 64; final output 32. The multiplication signs at x=281 and x=716 fall in the open gaps between matrix groups. Head labels and dashed K/V cache outlines stay inside their row bands. A lower-right explanatory line at x=1110, y=1160 originally extended to browser `getBBox().right = 1570.38`, beyond the panel boundary at x=1548. Split it without reducing font size into “各 head 输出沿特征维拼接；” at y=1160 and “W-output 再混合各头特征。” at y=1190. The remaining lower-right lines end before x=1548 (the longest earlier line is about 357 px at 17 px font size, ending near x=1467). The four long notes in the upper-right block are also within their row band. No arrow endpoint defect was found.

## `causal-attention-matrix.svg`

**Finding:** No visual defect requiring a change. Both panels contain their grids and labels. The visibility cells correctly encode A/B/C causal access, and after D is added the prior rows remain masked from the new D column while D can read A through D. The dashed prefix outlines are outside the cell text. No connector crosses text or exits a panel. Therefore the staged `causal-attention-matrix-after.svg` is an unchanged copy.

## Artifacts and checks

- `*-before.svg` and `*-before.png`: original source copies and rendered previews.
- `*-after.svg` and `*-after.png`: staged revised source and rendered previews.
- `repair.py`: reproducible staging edits; the multihead background height and overflowing lower-right note change. The other two figures remain byte-for-byte copies.
- `svg_tools.py inspect`: passed for all three staged after-SVGs. This is a structural check; visual review was also performed on all three after PNGs.
- Renderer: CairoSVG, invoked with `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib` and `/Users/zhengxinyu/.venv/bin/python`.
