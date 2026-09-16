# Task for researcher

你是学术调研的 Phase 0「Web 浅扫」子代理。只做调研，不修改任何文件。

## 背景
项目仓库：/Users/zhengxinyu/gongshangzheng.github.io（静态博客，已有 100+ 篇数字人/AI 论文文章）。
上游问题：数字人技术有没有能用来「预测一个人未来的状态」的？尤其是医学场景下预测术后/治疗后外观，
例如：不再有面部痘痘（痤疮）以后会长什么样？正畸/正颌手术以后会长什么样？

## 你的调研范围（只负责医学侧）
深度学习/生成式模型用于**预测面部或颅面外观的术后/治疗后结果**，包括但不限于：
- 正颌手术（orthognathic surgery）软组织预测、颌面外科手术规划
- 正畸（orthodontics）面型/软组织变化预测、拔牙矫治面型预测
- 颅颌面（craniofacial）手术模拟、种植/修复、唇腭裂术后预测
- 皮肤科：痤疮（acne）清除后的皮肤外观预测/合成、瘢痕、色素沉着、皮肤病变图像合成与去病变
- 整形美容：隆鼻/双眼皮/面部填充/面部提升术后效果预测
- 牙科美学：smile design / digital smile design / veneer 模拟
- 方法侧：FEM 有限元软组织仿真、3DMM/统计形状模型、GAN/Diffusion 图像到图像、point cloud/mesh 预测

## 调研前必读
/Users/zhengxinyu/.agents/skills/web-search/SKILL.md（本机国内网络 + VPN TUN 全局通道；优先用其中的 scripts）

## 调研维度（每个维度至少 2 次独立搜索）
1. 当前最热子方向 + 近 1-2 年重大进展 + 主要 open problems；学界 vs 临床/产业（如口腔数字化、医美 App）差异
2. Landmark papers：开创性工作、高引论文、为什么重要（尽量给出引用数、会议/期刊、年份）
3. 关键作者与机构（至少 5 位研究者 / 实验室），指出临床合作方
4. 近期趋势：技术脉络（FEM → 统计形状模型 → GAN → Diffusion → 3D 原生生成）；社区共识与争议（如预测精度评价标准、数据集稀缺、伦理）
5. 实用资源：重要 survey/review、开源代码库、数据集与 benchmark（含公开程度）

## 输出格式（严格）
** 热点子方向
** Landmark Papers（表格：论文 | 年份 | 会议/期刊 | 核心贡献 | 引用数 | 关键作者）
** 关键作者与机构
** 发展脉络（时间线）
** 实用资源（survey / 代码 / 数据集）
** 用于 arXiv 检索的关键词建议（中英对照，10-20 组）

## 约束
- 不要泛泛而谈「AI 医疗」，必须落到「预测外观/软组织/皮肤结果」的具体论文与方法。
- 区分「已发表可复现」与「只有 demo/公司产品」（如医院里的数字化正颌软件）。
- 每个重要论断标注来源（URL 或 论文标题+会议年份）。
- 找不到的内容明确写「未找到」，不要编造引用。

---
**Output:**
Write your findings to exactly this path: /Users/zhengxinyu/gongshangzheng.github.io/.pi/subagents/artifacts/outputs/fb39367d/research.md
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