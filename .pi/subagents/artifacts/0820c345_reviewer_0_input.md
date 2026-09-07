# Task for reviewer

结构与逻辑审查（只读不改）。仓库 cwd。对象：src/pages/digital-human-survey-map.html。
检查：1) 章节推进是否连贯（开篇→四篇精析→对比→交叉验证→线索清单→结语）；2) 表格数据与正文陈述是否互相矛盾；3) 站内链接是否指向正确文章（逐一确认 src/pages/ 下存在对应文件且主题匹配，特别是 realtime-digital-human-survey.html=digital-human-realtime-gpu-comparison.html 的分工、lam-2025.html、paper-vasa1.html、paper-liveportrait.html）；4) 系列编号/sub_id=180 与系列一~十七的衔接是否自洽；5) 有没有承诺了但正文没兑现的内容（如"见线索清单"是否真的有对应章节）。
输出：问题列表（严重度+位置+建议），结论：可发布/需修复。

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