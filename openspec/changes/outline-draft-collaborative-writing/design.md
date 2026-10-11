## Context

See `proposal.md` for motivation. The target is the repository skill `.agents/skills/blog-drafts/SKILL.md`. Its existing workflows distinguish draft preparation from publication; this change adds a review cadence for outline-driven drafts without changing their storage or publishing lifecycle.

## Goals / Non-Goals

**Goals:**
- Make incremental drafting and user review the default for drafts organized by a chapter outline.
- Keep each review unit small and explicit, and use accepted feedback to guide subsequent sections.
- Let the user revise the outline or approve a structural change before drafting proceeds on that basis.

**Non-Goals:**
- Do not change paper-reading templates or the separate full-paper reading workflow.
- Do not modify any draft contents, publish HTML, or change the OpenSpec workflow itself.
- Do not override an explicit user request for a one-shot complete draft.

## Decisions

- Add the rule in the skill's general writing workflow, adjacent to outline/planning and draft-writing guidance, so all outline-based learning/subject drafts inherit it.
- Define the loop as: state the next section's purpose and scope → draft only that bounded section → present it for review → revise based on feedback → wait for the user's confirmation/continuation before drafting the next section.
- Treat structural or conceptual feedback as a possible outline revision: summarize the proposed change and obtain alignment before continuing under a materially changed structure.
- Keep the default review unit to one subsection or a comparably small content block; do not silently draft multiple unreviewed chapters.
- Preserve user-directed exceptions: if the user explicitly asks for a complete one-shot draft, follow that instruction.

## Risks / Trade-offs

- [The iterative cadence may increase turn count] → Keep each review unit meaningful and avoid unnecessary confirmation questions when the user has already clearly approved continuing.
- [The scope may be confused with paper deep-reading] → State explicitly that this rule is for outline-driven drafts and does not replace the paper-reading workflow's own review gates.
