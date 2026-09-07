# Task for reviewer

事实核查（review-fidelity 精神，只读不改）。仓库 cwd。对象：src/pages/digital-human-survey-map.html（数字人综述地图文章）。
核对基准：raw/pixels-portraits-survey/sources/pixels-portraits-survey.md, raw/motion-video-survey/sources/motion-video-survey.md, raw/thg-taxonomy-survey/sources/thg-taxonomy-survey.md, raw/thg-advancing-survey/sources/thg-advancing-survey.md（四篇综述原文提取稿）。
任务：逐条核对文章中的事实性陈述与原文是否一致，重点：
1) FPSP 实测表 10 行数字（推理时间/显存/人评 rating）是否与原文 Table 一致
2) FPSP 五族 taxonomy 的子方向与代表方法归属是否正确
3) Motion Survey 的三段管线、7 类人体表征、audio-driven 五个子任务是否与原文一致
4) THG Taxonomy 三轴、Advancing THG 十大范式与 ~100 方法/2017-2025.04 范围是否准确
5) 作者名与 arXiv 号是否正确
分级输出：P0 错误（须改）/ P1 不精确 / P2 可改进 / ✅正确。每条附原文证据（文件+行号或原句）。最后给结论：可发布 / 需修复后发布。

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