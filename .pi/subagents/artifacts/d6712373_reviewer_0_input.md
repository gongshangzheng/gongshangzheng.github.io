# Task for reviewer

风格与站点规范审查（只读不改）。仓库 cwd。对象：src/pages/digital-human-survey-map.html。规范参照：.agents/skills/html-blog/SKILL.md 的 7 项质量闸门、.agents/skills/blog-syntax/references/html-components.md。
检查：1) frontmatter 完整性（title/description/tags/aliases/categories/AI/数字人/sub_id/hero_*）；2) #key# 引用语法与 .sources data-cite-key 一一对应；3) 组件使用是否恰当（stats/ch fade-in/ch-label/section-title/info-box/callout/table-wrap/photo+div.cap）；4) 中文技术写作质量（术语一致性、句子通顺、无 AI 腔）；5) 与同系列文章（如 src/pages/digital-human-hand-generation.html）的风格一致性。
输出：问题列表（位置+建议），结论：可发布/需修复。

## Acceptance Contract
Acceptance level: attested
Completion is not accepted from prose alone. End with a structured acceptance report.

Criteria:
- criterion-1: Return concrete findings with file paths and severity when applicable

Required evidence: review-findings, residual-risks

Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
`criteriaSatisfied[].status` must be exactly one of: satisfied, not-satisfied, not-applicable.
`commandsRun[].result` must be exactly one of: passed, failed, not-run.
`manualNotes` and `notes` are optional strings; an empty string means no note and does not satisfy `manual-notes` evidence.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```