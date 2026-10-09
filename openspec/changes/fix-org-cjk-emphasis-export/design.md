## Context

See `proposal.md` for the observed failure. Org emphasis uses a regexp assembled from four character classes: allowed characters before and after markers, forbidden characters at the marker boundaries, and the body regexp. The existing customization appends `[:nonascii:]` inside a bracket expression, but Emacs character classes require `[:class:]` in a valid class context and Unicode punctuation/word syntax additionally affects the parser's boundary checks. A minimal parser test must be the source of truth, not visual inspection of the configuration string.

## Goals / Non-Goals

**Goals:**
- Reproduce bold and italic parsing for representative Chinese text, including closing markers followed by Chinese punctuation.
- Apply a reliable fix to the local Emacs config and the current draft, then verify LaTeX output contains formatting commands rather than literal delimiters.

**Non-Goals:**
- Change Org's global parsing semantics for unrelated buffers or alter unrelated drafts.
- Change the site publishing pipeline.

## Decisions

- Use a minimal Org buffer test with Chinese on both sides of emphasis, punctuation immediately after closing markers, mixed Latin/CJK strings, and all relevant delimiters. Assert the Org AST contains `bold`/`italic` nodes and LaTeX export emits `\\textbf{}`/`\\emph{}`.
- Correct the configuration's boundary character sets based on actual Emacs regexp semantics. Avoid broad `[:nonascii:]` additions unless tests prove their exact behavior; if native boundary configuration remains unreliable for CJK punctuation, use explicit delimiter spacing in the draft as a local, predictable fallback.
- Preserve semantic emphasis: passages intended as bold must remain bold in the Org source and PDF. Do not convert bold emphasis to italic merely to work around parser boundaries; use the tested CJK-safe syntax and verify the resulting LaTeX commands.
- Only regenerate the PDF after both parsing and LaTeX assertions pass. Inspect extracted PDF text for literal emphasis markers as a final check.

## Risks / Trade-offs

- [Changing the global Org boundary sets could cause previously recognized emphasis to stop parsing] → Keep default ASCII boundaries and add narrowly tested CJK cases; run regression examples for ordinary English markup.
- [Normalizing delimiters could unintentionally change emphasis semantics] → Retain bold versus italic intent and assert representative bold passages export as `\\textbf{}`.
- [Some CJK punctuation may not be a word/space character in Emacs syntax tables] → Cover the draft's punctuation forms in parser assertions and keep the fallback of spaces around emphasis markers.

## Migration Plan

1. Implement the tested regexp fix in the local Emacs config.
2. Normalize only markup instances that the tested configuration cannot parse, preserving Chinese prose unchanged.
3. Re-export the PDF with XeLaTeX and inspect extracted text and representative pages.
4. Roll back by restoring the previous configuration and draft markup if unrelated Org emphasis regresses.
