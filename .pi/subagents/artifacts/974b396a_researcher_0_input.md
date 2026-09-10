# Task for researcher

用 web_search/web_fetch 调研"数字人（digital human）"概念的定义、任务边界与历史归属，输出带来源 URL 的结构化 markdown 简报。回答四组问题：

1. 定义与术语起源："digital human / virtual human / virtual digital human（虚拟数字人）"最早谁提出、什么语境？学术界（talking head generation、facial animation、avatar）与产业界（影视特效、Epic MetaHuman、中国虚拟数字人产业报告）定义差异。
2. 历史里程碑归属（人名/机构/年份/论文或产品 + 来源 URL）：
   - Frederic Parke 1971-1972 面部动画是否公认起点；Parke & Waters《Computer Facial Animation》(1996) 地位
   - 电影 photorealistic digital human 里程碑：The Curious Case of Benjamin Button (2008, Digital Human League)、Avatar (2009)、Gemini Man、The Mandalorian
   - Epic MetaHuman Creator (2021) 定位
   - 语音驱动口型学术线：Bregler Video Rewrite (SIGGRAPH 1997)、Synthesizing Obama (Suwajanakorn, SIGGRAPH 2017)、Wav2Lip (Prajwal, CVPR 2020)、SadTalker (CVPR 2023)、VASA-1 (Microsoft 2024) 提出者与机构
   - 中国"虚拟数字人"术语来源（艾媒咨询/中国信通院报告的定义）
3. 任务分类业界共识：lip sync / talking face / portrait animation / full-body avatar / interactive avatar 等分类，权威 survey 的 taxonomy。
4. 标准/治理：IEEE/ISO virtual humans 相关标准、中国信通院《虚拟数字人白皮书》。

每条结论附来源 URL；区分"多方一致"与"单一来源"；存疑标注。

---
**Output:**
Write your findings to exactly this path: /Users/zhengxinyu/gongshangzheng.github.io/.pi/subagents/artifacts/outputs/974b396a/research.md
This path is authoritative for this run.
Ignore any other output filename or output path mentioned elsewhere, including output destinations in the base agent prompt, system prompt, or task instructions.

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