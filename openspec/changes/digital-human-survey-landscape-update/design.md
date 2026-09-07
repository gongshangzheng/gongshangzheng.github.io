# Design: digital-human-survey-landscape-update

## Context

本轮已完成原文级调研（非仅检索元数据）：8 篇文献提取至 `raw/` 并精读 7 篇全文。调研发现（写入 design 作为写作素材依据）：

### 内容发现（Content Findings）

**F1. From Pixels to Portraits v8（2308.16041，Computer Science Review 期刊）**
- 2026 版五族 taxonomy：2D visual/video-driven（reenactment / motion retargeting / expression transfer / high-res efficient）、audio-driven（lip-sync / audio-to-face+head / emotion-style-prosody / real-time streaming）、diffusion & foundation video models（audio-to-video diffusion / video DiT / large-scale human animation / long-duration）、3D-NeRF-Gaussian（3DMM / NeRF / 3DGS / view-consistent）、text-semantic-editing（text-driven / emotion control / retalking / interactive avatar control）+ 横切关注（identity、lip-sync、temporal、推理时间、显存、safety/provenance/deepfake）
- 质量维度 10 条；核心论点：**帧级指标（PSNR/SSIM）与感知质量脱节**，比较必须注明 driving modality / dataset / resolution / duration / hardware
- 独有实测表：FOMM 34s/2GB/3.45、Wav2Lip 23s/10.9GB/2.76、SadTalker 4m50s/4.1GB/3.72、TPSM 19s/1.9GB/4.15、Teller 6s/3.6GB/4.05、READ 10s/2.9GB/4.08（推理时间/显存/人评 rating）——可与库内系列十二直接对照
- 未来方向 11 条（长时稳定、流式、可控表达、3D 一致、扩散效率、多语言、少样本、公平治理、safety-by-design、human-centred eval 等）
- **新模型/数据集线索**：READ、Dimitra、Hallo3、OmniHuman-1、LAM、GaussianSpeech、PGSTalker、UniGAHA、VASA-3D、GaussianEmoTalker、EditYourself；TalkVid、SpeakerVid-5M

**F2. Human Motion Video Generation: A Survey（2509.03883）**
- 三段式管线：Motion Planning（LLM 驱动 / 特征映射）→ Motion Modeling & Video Generation → Refinement & Output
- 人体表征 7 类：mask / mesh / depth / normal / keypoint / semantics / optical flow
- 生成框架 VAE / GAN / LDM；audio-driven 细分：lip sync、head pose、holistic body、fine-grained style-emotion、multilingual dubbing
- 挑战：唇+头+手势统一框架、扩散实时化

**F3. A Comprehensive Taxonomy of TH Synthesis（2406.10553）**
- 三轴：Portrait Generation / Driven Mechanisms（video-driven 再分传统非学习 vs 学习；audio-driven）/ **Editing Techniques（独有一级类）**
- 附 Benchmarking（数据集/指标/实验）与 Applications

**F4. Advancing THG（2507.02900）**
- ~100 方法（2017–2025.04）、十大范式（image/audio/text/video/2D/3D/distortion/NeRF/parameter-efficiency/3D-animation）
- 结构上 Dataset → **Loss Function 专节** → Metrics → Experimental → Challenges → Future；每范式配 Method/Arch/Dataset/Highlights/Limitations/N-shot 大表；写作质量一般但表格密度高

**F5. LeapTalk（2608.00079）**：Brownian bridge *data-to-data* 传输替代 noise-to-data，persistent reference 锚定抑制身份漂移；异构蒸馏 + SNR 对齐时间变换；音频驱动 CFG；单步 200 FPS 任意长。——系列七蒸馏路线的最新节点。

**F6. OmniMate（2607.23023，AAAI 2027 投稿，中国电信 AI）**：开放式流式音视频联合生成（视觉+语音+音效）；GPC 显式建模 chunk 生成进度解决"何时结束回应/执行↔聆听切换"；MRCM 多参考图+参考语音保跨模态身份；VerseBench 交互版评测。——Avatar Forcing / Wan-Streamer / UniLS 赛道的开放式升级。

**F7. EchoAvatar（2605.28272）**：任意音频流（语音+音乐统一，无领域标签）→ 全身连续运动；严格音频依赖流式架构；RL 稳定 one-shot 流式；**tool-call 接口让上游 LLM 实时注入语义控制**（voice agent → humanoid avatar 即插即用）。——与库内"工具增强型数字人 Agent"、系列八互补。

**F8. Avatar-Forever（2608.12107）**：仅 API 摘要（源包下载失败）——解耦并行训练、高质量实时无限 avatar。草稿中必须注明信息来源限制。

## Goals / Non-Goals

**Goals**
- 把 F1–F8 的内容级发现落成文章与草稿，而不是引用堆砌
- 综述地图作为"外部视角 vs 库内系列"的对照层：taxonomy 映射 + 实测表交叉验证
- 动作空间小节按机制写时间线，精读两篇（LeapTalk / OmniMate）内容密度与库内互补度最高

**Non-Goals**
- 不重写现有系列 Survey 的整体结构；不为 READ / Dimitra / Hallo3 / OmniHuman-1 等线索对象写独立文章（进线索清单待跟踪）
- 不修改 `digital-human-content-org` 既有 spec
- Avatar-Forever 不强行精读（材料不足，留 paper-note 草稿）

## Decisions

### D1: 综述地图 = 数字人系列（十九），slug `digital-human-survey-map`，sub_id=190
与系列一互补：系列一讲技术路线，本篇讲文献版图与内容差异。正文结构：四篇综述逐一精析（taxonomy 图 + 独特贡献）→ 对比表（含库内系列映射列）→ FPSP 实测表 vs 系列十二交叉对照 → 新模型线索清单 → 按需索骥决策段。

### D2: 精读顺序 LeapTalk 先、OmniMate 后（sub_id 680 / 690）
LeapTalk 机制与库内系列七/精读二十二（蒸馏）直接衔接，写作素材最成熟（raw 已含方法推导附录）；OmniMate 涉及 VerseBench 交互设定，需要更多交叉引用。发布前 `scripts/check-sub-id.py --category 数字人论文精读` 校验。

### D3: raw 材料复用策略
`raw/pixels-portraits-survey/` 等 7 篇已提取 markdown 直接作为精读与地图写作的原文依据；图片经 convert 流程进入 `media/images/<slug>/`。Avatar-Forever 待源包可得后补提取。

### D4: 草稿治理用 `draft.py set` / `draft.py new`，不手动编辑 frontmatter
3 篇修正 target_alias；新建 `digital-human-survey-map`（brainstorm，调研笔记写入正文）、`echoavatar-2026` 与 `avatar-forever-2026`（paper-note，F7/F8 要点写入正文）。

### D5: 系列三小节为"机制时间线"而非论文列表
顺序：StreamAvatar / LiveTalk（已有）→ EchoAvatar（统一音频域全身 + tool-call）→ LeapTalk（bridge 单步蒸馏）→ OmniMate（开放式联合生成）；每个节点写"在哪个空间生成 + 靠什么机制实时/长时稳定"，与库内文章交叉链接。

## Risks / Trade-offs

- FPSP 实测表为该文作者自测（非受控 benchmark，文中自述），交叉对照时须标注口径差异
- Avatar-Forever 材料不全，相关描述以 API 摘要为限，草稿标注"待原文"
- 系列一/三增补须真实更新 `updated_at`

## Migration Plan

1. 草稿治理（D4，先行）
2. 综述地图写作（D1，依赖 F1–F4）→ LeapTalk 精读 → OmniMate 精读
3. 系列一、系列三增补（D5）
4. Hub 收录 + `node build.js` + check-sub-id + 草稿状态回填

## Open Questions

- 线索清单中"待精读"对象（如 READ、OmniHuman-1、GaussianSpeech）是否在下一变更立题——待综述地图写作时按读者兴趣判断
