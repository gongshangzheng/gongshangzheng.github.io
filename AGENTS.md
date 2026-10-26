# Project instructions

## Durable project knowledge

- Keep project-specific facts and workflow decisions in this repository's `AGENTS.md`, not the central personal memory store.
- All agents must use `<repo>/.agents/skills/<name>/SKILL.md` for project skills. Do not create or maintain project skills under `.Codex/` or `.codex/`.
- Write `AGENTS.md` instructions in English. Keep examples in their original language when needed to preserve their meaning.

## Research delegation

- Delegate material collection and other token-intensive preparatory work to subagents using **Luna (`gpt-6-luna`)** by default. This includes literature searches, official model/version checks, downloading and extracting papers, collecting original figures, and inventorying existing notes.
- Give each subagent explicit responsibility and separate output paths. Tell them that others are working in the repository and that they must preserve others' edits.
- The primary agent integrates the findings, checks evidence and version boundaries, and owns the article's argument, mathematical reasoning, draft, and OpenSpec consistency.
- Follow the `read-article` source extraction workflow for papers. Record official URLs and figure locations; distinguish original architecture diagrams from capability examples. When no public architecture diagram or technical report is found, record that gap rather than inventing one.

## Writing requirements

1. Make connections between sentences explicit. When two statements appear consecutively and the second does not directly continue the first, insert a sentence explaining their relationship. Readers should not have to infer whether the relationship is contrast, cause and effect, or additional information. Apply the same rule to questions and answers: after posing a question, include at least one intervening sentence before developing the answer.

2. Limit modifiers to two nested levels. Modifiers preceding a noun must not exceed two levels of nesting. If three or more levels are needed, first explain the innermost concept in a separate sentence, then build outward. Do not use stacked constructions such as “用户行为数据分析模型优化方案”.

3. Within a paragraph, use no more than two sentences that pair an abstract subject with an action verb. Examples include “这个框架吞噬了…”, “这条规则抓住了…”, and “这个机制驱动了…”. Each may work individually, but repeated use increases the reader's cognitive load. For any further sentences of this kind, use a concrete person, object, or situation as the subject instead.

4. Check word pairings after writing. Review every sentence's noun–verb combinations and consider whether people would naturally say them in everyday conversation. Replace combinations that would sound unnatural when spoken. If the individual words are familiar but sound awkward together, rewrite the expression.
