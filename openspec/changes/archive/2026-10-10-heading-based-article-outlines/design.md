## Context

The shared template at `.agents/skills/blog-rules/templates/content-change/design.md` currently encodes chapter skeletons as a four-column table. Existing requirements specify the information each outline must contain but do not prescribe its visual structure. The pending `agent-tutorial` change uses that table format and can serve as the first conversion example.

## Goals / Non-Goals

**Goals:**
- Make headings the canonical structure for article/chapter outlines in content-change designs.
- Preserve required planning information: article metadata, chapter-level writing intent, source pointers, required elements, key data, and image plan.
- Keep compact tables available for metadata, comparisons, and data that are naturally tabular.
- Update the shared template, gate guidance, spec, and the pending Agent tutorial consistently.

**Non-Goals:**
- Do not change the required information or approval gate for content plans.
- Do not ban tables throughout design documents.
- Do not alter existing published articles or rewrite historical changes.

## Decisions

1. **Use one heading per planned chapter.** Beneath each chapter heading, use concise labeled bullets (e.g. “写什么 / 素材来源 / 必备元素”). Nested headings are allowed when they represent meaningful sub-sections. This makes the intended article hierarchy visible and leaves enough room for nonuniform sections.
2. **Retain compact metadata tables.** The per-article fields (type/location/service object) remain compact; only the chapter skeleton changes to headings. Tables remain useful for comparisons and numerical data.
3. **Update all authoritative guidance together.** The design template supplies the concrete example; `openspec-gate.md` explains the workflow rule; the existing `content-change-planning` requirement provides the enforceable contract. This prevents the same mismatch from recurring.
4. **Convert the pending Agent tutorial outline.** Reformat its chapter skeleton in place under this change, preserving the current sections and sources. This is a planning artifact conversion, not article-body writing.

## Risks / Trade-offs

- [Long outlines may become verbose] → Keep repeated field labels brief and use nested headings only when they correspond to meaningful article structure.
- [Readers may infer tables are prohibited] → State explicitly that the rule applies only to the chapter skeleton; compact metadata/comparison/data tables remain acceptable.
- [Older changes retain tables] → Apply the new format to changes created or materially revised after this change; do not mass-rewrite archived or historical plans.
