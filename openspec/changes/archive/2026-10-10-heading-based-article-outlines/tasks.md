## 1. Update authoritative planning guidance

- [x] 1.1 Revise `.agents/skills/blog-rules/templates/content-change/design.md` so article chapter skeletons use hierarchical headings and labeled content/source/required-element bullets; retain compact metadata tables
- [x] 1.2 Update `.agents/skills/blog-rules/references/openspec-gate.md` to state the heading-based outline requirement and distinguish the chapter skeleton from allowed local tables
- [x] 1.3 Apply and sync the `content-change-planning` spec delta; preserve the existing requirement and scenarios and add the heading-based scenario the `content-change-planning` spec delta and verify it preserves the full existing requirement and scenarios while adding the heading-based scenario

## 2. Convert the pending Agent tutorial plan

- [x] 2.1 Reformat the chapter skeleton in `openspec/changes/agent-tutorial/design.md` as hierarchical headings with writing intent, sources, and required elements under each heading
- [x] 2.2 Check the converted outline against the spec: metadata, chapter plan, source pointers, required elements, key data, and image plan remain present

## 3. Validate

- [x] 3.1 Run `openspec validate heading-based-article-outlines --strict`
- [x] 3.2 Review the diff to ensure only planning guidance/spec and the pending Agent tutorial outline changed; confirm tables are not banned globally
