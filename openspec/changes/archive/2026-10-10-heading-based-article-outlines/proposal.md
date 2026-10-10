## Why

The current content-change design template presents the article outline as a wide table, which makes substantial, nested outlines difficult to scan, discuss, and revise. Use heading-based sections so each planned article and chapter reads as a navigable outline while preserving its required content and evidence fields.

## What Changes

- Update the shared content-change `design.md` template so each article's chapter skeleton uses headings, with the planned content, sources, and required elements grouped beneath each heading.
- Update the shared OpenSpec gate guidance and `content-change-planning` spec to require heading-based chapter outlines rather than tabular chapter skeletons.
- Keep compact metadata and comparison tables where useful; this change only replaces the chapter-skeleton table format.
- Convert the pending `agent-tutorial` change outline to the new heading format after the format rule is approved.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-change-planning`: Require article chapter outlines to be expressed as hierarchical headings, with chapter content, source pointers, and required elements under each heading.

## Impact

- `.agents/skills/blog-rules/templates/content-change/design.md`
- `.agents/skills/blog-rules/references/openspec-gate.md`
- `openspec/specs/content-change-planning/spec.md` (via delta spec)
- `openspec/changes/agent-tutorial/design.md` (reformat the pending outline; no change to its approved/approval status)
- No published article content or implementation code is affected.
