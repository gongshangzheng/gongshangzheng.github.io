## Why

The 3DGrowthNet Org draft uses emphasis markers adjacent to Chinese text, but the PDF renders literal `*` and `/` instead of bold or italic. The Emacs config attempts to permit CJK boundaries using `[:nonascii:]`, which is not interpreted as the intended character range in this Org emphasis regexp and breaks parser recognition.

## What Changes

- Replace the ineffective CJK emphasis boundary configuration with a tested approach compatible with Org's emphasis parser.
- Restore the intended bold emphasis in the 3DGrowthNet draft, preserve italic emphasis where intended, regenerate the PDF, and verify both styles adjacent to Chinese punctuation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a local authoring/export configuration fix; no system behavior contract changes.

## Impact

- `~/.emacs.d/always.org` Org emphasis configuration.
- `drafts/3dgrowthnet.org` emphasis markup if required by the validated syntax.
- `~/Downloads/3DGrowthNet 草稿.pdf` regenerated artifact.
