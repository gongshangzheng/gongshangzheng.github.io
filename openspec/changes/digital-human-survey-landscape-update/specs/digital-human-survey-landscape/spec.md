# digital-human-survey-landscape Specification

## Purpose

把本轮对市面综述与动作空间新模型的原文精读成果落入库内：综述地图文章交付内容级对比与新模型线索清单，动作空间路线文章按机制覆盖 2025-12 后实时模型，数字人草稿归位统一分类树。

## ADDED Requirements

### Requirement: 综述地图文章交付内容级对比
库内 MUST 存在综述地图文章（`src/pages/digital-human-survey-map.html`，数字人系列（十九）），对以下四篇综述做内容级精析（分类体系、覆盖范围、独特贡献，而非仅列引用）：①From Pixels to Portraits（2308.16041）②Human Motion Video Generation: A Survey（2509.03883）③A Comprehensive Taxonomy of Talking Head Synthesis（2406.10553）④Advancing Talking Head Generation（2507.02900）。文章 MUST 包含：每篇的 taxonomy 结构描述、四篇+库内系列的对比表、"按需索骥"决策段。

#### Scenario: 读者按内容差异选择综述
- **WHEN** 读者打开综述地图文章
- **THEN** 能读到每篇综述"说了什么、独特在哪"：FPSP v8 的五族 taxonomy 与公开模型实测表（推理时间/显存/人评）、2509.03883 的三段式管线与 7 类人体表征、2406.10553 的 Portrait Generation / Driven Mechanisms / Editing 三轴、2507.02900 的十大范式与 Loss 专节——并能依据对比表选择要读的综述与库内对应文章

#### Scenario: FPSP 实测表与库内数据交叉对照
- **WHEN** 综述地图介绍 FPSP v8 的模型实测对比（FOMM/Wav2Lip/SadTalker/TPSM/Teller/READ 的推理时间、显存、人评 rating）
- **THEN** 文章将其与库内系列十二（实时性全景对比）的数据交叉对照，指出一致与出入之处

### Requirement: 综述挖出的新模型线索清单被记录
综述地图文章 MUST 包含"新模型/新数据集线索清单"小节，记录从上述综述中提取且库内未覆盖的对象：READ（read2025）、Dimitra（dimitra2025）、Hallo3（hallo32025）、OmniHuman-1、GaussianSpeech、PGSTalker、UniGAHA、VASA-3D、GaussianEmoTalker（2026）、EditYourself（2026）、TalkVid 与 SpeakerVid-5M 数据集，每条 MUST 标注与库内已有内容的关系（已覆盖 / 待精读 / 待跟踪）。

#### Scenario: 后续选题从线索清单出发
- **WHEN** 规划后续数字人精读选题
- **THEN** 线索清单中"待精读"对象可直接作为候选，且每条能回溯到出处综述

### Requirement: 动作空间文章按机制覆盖 2025-12 后模型
`digital-human-motion-space-avatar.html` MUST 新增 2025-12 至 2026-08 小节，按机制（而非仅名称）覆盖：EchoAvatar（语音+音乐统一全身驱动、RL 稳定 one-shot 流式、LLM tool-call 语义注入）、LeapTalk（Brownian bridge data-to-data 单步蒸馏、1 step / 200 FPS、persistent reference 抑制身份漂移）、OmniMate（Generation Progress Controller 显式建模 chunk 生成进度、Multi-Reference Conditioning 跨模态身份保持、开放式执行/聆听状态切换），并与已覆盖的 StreamAvatar、LiveTalk 衔接成时间线。

#### Scenario: 读者查看动作空间机制演进
- **WHEN** 读者阅读该小节
- **THEN** 能看到每个新模型"在哪个空间生成、用什么机制做到实时/长时稳定"，而非仅模型名与链接

### Requirement: 两篇新模型精读发布
LeapTalk（2608.00079）与 OmniMate（2607.23023）MUST 以数字人论文精读形式发布到 `categories/AI/数字人/数字人论文精读` 层级，`sub_id` 从 680 起顺延不冲突；精读正文 MUST 基于 `raw/` 下已提取原文（而非仅摘要）。

#### Scenario: 新精读文章归类与内容来源
- **WHEN** 两篇精读发布
- **THEN** aliases 含 `categories/AI/数字人/数字人论文精读`、sub_id 不冲突、正文机制描述可对应到 raw 原文章节

### Requirement: 数字人主题草稿归位且新模型留档
`drafts/` 下数字人主题草稿的 `target_alias` MUST 位于 `categories/AI/数字人` 分类树；talker-t2av-2026、toktalk-2026、gdpo-listener-2026 三篇 SHALL 修正为 `categories/AI/数字人/数字人论文精读`。EchoAvatar 与 Avatar-Forever MUST 各有一篇 paper-note 草稿，本轮精读得到的原文要点（EchoAvatar 的统一音频域全身驱动与 tool-call 接口；Avatar-Forever 的解耦并行训练，注明目前仅有 API 摘要）MUST 落入草稿正文。

#### Scenario: 草稿审计与留档完整性
- **WHEN** 对 `drafts/` 做数字人草稿审计
- **THEN** 不存在 target_alias 指向 `categories/杂识` 的数字人论文草稿；echoavatar-2026 与 avatar-forever-2026 草稿存在且正文含机制要点

### Requirement: 新内容同步进 Hub 与构建通过
本次新增的全部已发布文章 MUST 在发布同一次提交中收录进 `digital-human-hub.html` 对应分区；`node build.js` MUST 无错误，分类页与 `sub_id` 排序正常。

#### Scenario: Hub 收录与构建校验
- **WHEN** 新文章发布并运行 `node build.js`
- **THEN** Hub 页能检索到每篇新文章，构建无错误
