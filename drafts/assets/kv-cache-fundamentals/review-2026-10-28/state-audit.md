# KV Cache SVG visual audit

Scope: `decoder-stack.svg`, `kv-cache-state-steps.svg`, and `kv-cache-recompute-comparison.svg` copied from the published image directory on 2026-10-28. All edits and exports in this audit are staged under `/tmp/kv-svg-audit-states/`; repository and publication files were not changed.

## Review method

Rendered each original SVG to `before/*.png` with CairoSVG and viewed every image. Then rendered the staged SVGs to `after/*.png`, ran `scientific-svg/scripts/svg_tools.py inspect` on all three, and viewed each final render. The three before/after SVGs are retained in `source/` and `after/`. The decoder drawing source is `draw_decoder.py`; state diagram editable base, formula SVG/TEX/text and composition spec are retained in `source/` so the formula paths can be regenerated without losing their source.

## Findings and changes

### `decoder-stack.svg`

- In the original, each orange `write K/V` label was at `x=780, y=m+20`, while its dashed arrow ran at `y=m+26` (`m=600, 980, 1360`). This left only a few rendered pixels between label glyphs and the arrow; the label visually crowded the line beside the MHA block. The annotation sits just outside the MHA block (`x=360..760`) and does not collide with the cache card (`x=930..1530`), but the text-to-arrow spacing was too tight.
- Moved the label baseline to `y=m+14` in `draw_decoder.py`. This creates a visible gap above the arrow without moving the cache flow or changing its meaning.
- The original layer backdrops spanned x=58..1592. Their vertical bounds were L3 y=280..692, L2 y=692..1072, and L1 y=1072..1480, while their matching cache frames occupied y=580..730, 960..1110, and 1340..1490. Thus each cache frame crossed its layer backdrop boundary and visually sat partly in the next layer's background. Narrowed each layer backdrop to x=58..798, enclosing the residuals, state labels and Transformer trunk only; the separately outlined cache frames remain clearly labeled by layer. The three backdrop rows meet at their horizontal boundaries without overlapping.
- Checked residual bypass paths and plus nodes against Add & LayerNorm blocks: horizontal arrow tips terminate at x=347, the plus nodes span x=325..351, and the norm block begins at x=360, leaving a 9 px gap from the circle edge to the block (13 px from arrow tip). No line crosses the norm frame or text, and no endpoint is dangling. Layer outputs feed upward, and the top output path terminates at the head and prediction E. The bottom embedding, D input, cache cards and explanatory note remain inside the 1650×1700 viewBox.
- Semantics preserved: each layer has its own KV cache; D is current input and is cached per layer; predicted E is not cached until it becomes the next input. Post-LN is labeled as an illustrative variant.

### `kv-cache-state-steps.svg`

- No confirmed line crossing, panel collision, overflow, dangling arrow, or text clipping. The three panel borders are within the 1320×1080 viewBox. Bottom equation and explanatory lines are inside the canvas with visible separation.
- State timing preserved: decode 1 processes D with history ABC and predicts E; decode 2 processes E with ABCD and predicts F, while F remains uncached. Formula SVG paths and source TeX/text remain available in `source/`.
- No visual change made.

### `kv-cache-recompute-comparison.svg`

- No confirmed line crossing, panel collision, overflow, dangling arrow, or text clipping. Both comparison panels and all bottom notes fit within the 1280×740 viewBox.
- Historical K/V are shown as reused only in the cache panel; current-position K/V are newly computed. The note limits the comparison to position-processing counts rather than claiming FLOPs or a speedup.
- No visual change made.

## Outputs

- Original rendered previews: `before/*.png`
- Staged SVGs and rendered previews: `after/*.svg`, `after/*.png`
- Editable decoder generator: `draw_decoder.py`

CairoSVG used the local invocation environment `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib`; this machine-specific path is not an installation requirement. `inspect` passed for all three staged SVGs. No production file was replaced.
