# Project instructions

## Durable project knowledge

- Keep project-specific facts and workflow decisions in this repository's `AGENTS.md`, not the central personal memory store.
- New project skills belong under `<repo>/.Codex/skills/<name>/SKILL.md`; preserve existing skill locations unless migration is requested.

## Research delegation

- Delegate material collection and other token-intensive preparatory work to subagents using **Luna (`gpt-6-luna`)** by default. This includes literature searches, official model/version checks, downloading and extracting papers, collecting original figures, and inventorying existing notes.
- Give each subagent explicit responsibility and separate output paths. Tell them that others are working in the repository and that they must preserve others' edits.
- The primary agent integrates the findings, checks evidence and version boundaries, and owns the article's argument, mathematical reasoning, draft, and OpenSpec consistency.
- Follow the `read-article` source extraction workflow for papers. Record official URLs and figure locations; distinguish original architecture diagrams from capability examples. When no public architecture diagram or technical report is found, record that gap rather than inventing one.
