## Why

库内数字人系列 Survey（一~十七）最后更新于 2026-07-08，但对市面综述"说了什么"缺乏内容级覆盖：本轮已把 8 篇关键文献原文拉取到 `raw/` 并精读（4 篇综述 + 3 篇动作空间新模型全文 + 1 篇 API 摘要），发现三类实质内容缺口：

1. **综述内容本身未被消化**：《From Pixels to Portraits》v8（2308.16041，Computer Science Review 期刊，2026-07-07 更新）有一套 2026 版五族 taxonomy + 独有的公开模型实测表（推理时间/显存/人评），2509.03883 有三段式管线框架，2406.10553 有独有的 Editing 一级类，2507.02900 有 Loss 专节与十大范式大表——这些内容级差异库内均无记录。
2. **从综述里挖出的新模型线索未跟踪**：FPSP v8 引用的 READ、Dimitra、Hallo3、OmniHuman-1、GaussianSpeech、PGSTalker、UniGAHA、VASA-3D、GaussianEmoTalker（2026）、EditYourself（2026）及新数据集 TalkVid、SpeakerVid-5M，库内均无文章或草稿。
3. **动作空间新模型只有名字没有机制**：OmniMate（GPC 进度控制器 + MRCM 多参考身份保持）、LeapTalk（Brownian bridge 单步蒸馏、1 step / 200 FPS）、EchoAvatar（语音+音乐统一全身驱动 + LLM tool-call 语义控制）三篇已精读原文，其机制与库内系列三/七/八高度互补但未落入任何文章。

## What Changes

- **新增**《数字人综述地图》文章（数字人系列（十九），slug `digital-human-survey-map`）：内容级对比四篇综述——各自的分类体系、独特贡献（FPSP 的实测对比表 vs 库内系列十二数据交叉对照、Taxonomy 的 Editing 轴、Advancing 的 Loss 专节、Motion Survey 的三段管线与 7 类人体表征）、按需索骥决策段
- **新增**"综述挖出的新模型线索清单"小节（综述地图内）：READ / Dimitra / Hallo3 / OmniHuman-1 / GaussianSpeech / PGSTalker / UniGAHA / VASA-3D / GaussianEmoTalker / EditYourself / TalkVid / SpeakerVid-5M，标注与库内已有文章的关系（已覆盖 / 待精读 / 待跟踪）
- **新增** 2 篇动作空间新模型论文精读：LeapTalk（2608.00079，单步蒸馏 200 FPS，系列七蒸馏路线的最新一步）、OmniMate（2607.23023，开放式流式音视频联合生成，Avatar Forcing / Wan-Streamer 赛道的升级）
- **更新** 系列三 `digital-human-motion-space-avatar.html`：文末新增"动作空间的实时化浪潮（2025-12 之后）"小节，按机制写时间线（StreamAvatar / LiveTalk → EchoAvatar 的统一全身驱动 + tool-call → LeapTalk 的 bridge 蒸馏 → OmniMate 的开放式联合生成），交叉链接新精读
- **更新** 系列一 `realtime-digital-human-survey.html`：用 FPSP v8 的五族 taxonomy 对照库内分类写一段"外部视角"，并链接综述地图
- **草稿治理**：修正 talker-t2av-2026 / toktalk-2026 / gdpo-listener-2026 的 `target_alias`；EchoAvatar、Avatar-Forever 各建 paper-note 草稿（本轮已读的原文要点落入草稿正文）；综述地图建 brainstorm 草稿并写入调研笔记
- **Hub 维护**：新文章发布时同步 `digital-human-hub.html`

## Capabilities

### New Capabilities
- `digital-human-survey-landscape`: 数字人综述版图覆盖能力——综述地图文章 MUST 交付内容级对比（分类体系、独特贡献、实测数据），MUST 承载从综述中提取的新模型线索清单；动作空间文章 MUST 按机制（而非仅名字）覆盖 2025-12 后新模型；数字人草稿归位统一分类树

### Modified Capabilities

## Impact

- `src/pages/`：新增 `digital-human-survey-map.html`、`leaptalk-2026.html`、`omnimate-2026.html`；更新 `realtime-digital-human-survey.html`、`digital-human-motion-space-avatar.html`、`digital-human-hub.html`
- `raw/`：已就位 8 篇提取材料（`raw/pixels-portraits-survey/`、`raw/motion-video-survey/`、`raw/thg-taxonomy-survey/`、`raw/thg-advancing-survey/`、`raw/omnimate-2026/`、`raw/leaptalk-2026/`、`raw/echoavatar-2026/`；`avatar-forever-2026/` 源包下载未完成，仅有 API 摘要）
- `drafts/`：3 篇字段修正（`draft.py set`）+ 3 篇新草稿（1 brainstorm + 2 paper-note，原文要点写入正文）
- 构建验证：`node build.js`、`scripts/check-sub-id.py`
- 不涉及后端代码、API、依赖变更
