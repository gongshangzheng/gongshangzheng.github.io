# Task for researcher

调研"学界与工业界对数字人（digital human）的远景期望"——即未来 5-15 年大家希望数字人发展成什么。运行环境没有 web 工具（已知），沿用上次的协议：内部知识 + 逐条置信度标注（🟢多方一致/🟡单一来源/🔴存疑），论文给 arXiv ID（主会话会经 API 验真，不确定就标🔴别硬凑），机构愿景给官方域名入口，不确定的 URL 标【URL未核验】。主动纠正任务书里的错误并加分。

需覆盖四条愿景线，每条给：愿景是什么 / 代表机构与人 / 关键论文或产品 / 当前与愿景的差距：

1. **照片级远程呈现（photoreal telepresence）**：Meta Codec Avatars（负责人 Yaser Sheikh？说不准就标🔴）、Google Project StarLine、NVIDIA Maxine/ACE。终局叙事："杀死视频会议的压缩感"、数字分身替你开会。
2. **数字人作为 AI 的具身界面（embodied interface to AI）**：LLM+数字人=有脸的助手；NVIDIA ACE/Omniverse Avatar、Synthesia（企业视频/数字员工）、HeyGen、腾讯/百度/商汤/科大讯飞的数字人战略；学界 ECA（Cassell）到 embodied AI 的演进；"每个 API 后面都该有张脸"这类提法出自谁。
3. **陪伴/情感与数字永生（companionship & digital immortality）**：Replika、Character.AI（严格说是无形象 AI，辨析是否算数字人）、HereAfter AI / StoryFile（数字遗产）、电影《超验骇客》式叙事；学界对 parasocial 关系/伦理的讨论（Stanford/MIT 有无 position paper？不确定标🔴）。
4. **数字孪生人（human digital twin）与医疗/教育**：数字孪生人在医疗（EPRS/欧盟报告提过？标🔴）、教育领域的可汗学院 Khanmigo 式 AI 导师是否有形象、Neal Stephenson《The Diamond Age》想象 Primer 式导师；"digital twin of human body"（Dassault 的 3DEXPERIENCE/活体心脏孪生 Living Heart）与"数字人"一词的交叉与混淆辨析。

另外回答两个总括问题：
A) **学界 position/roadmap 文献**：有没有署名的愿景文章（如 ACM/IEEE 的 future of virtual humans 白皮书、SIGGRAPH panel、EU 报告）？给不出确证的就说没有，别编。
B) **你基于内部知识判断的"共识终局图景"**：学界+工业界最大公约数的远景是什么？（例如：实时照片级全双工交互体作为 AI 的默认界面）给一段有判断力的综述，标注这是内部推断。

输出 markdown，含 Sources（只放可构造 URL）与 Gaps 节。

---
**Output:**
Write your findings to exactly this path: /Users/zhengxinyu/gongshangzheng.github.io/.pi/subagents/artifacts/outputs/246fa981/research.md
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