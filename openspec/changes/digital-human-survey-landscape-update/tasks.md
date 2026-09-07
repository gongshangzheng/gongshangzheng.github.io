## 1. 草稿治理

- [x] 1.1 用 `draft.py set` 修正 talker-t2av-2026 / toktalk-2026 / gdpo-listener-2026 的 `target_alias` 为 `categories/AI/数字人/数字人论文精读`
- [x] 1.2 用 `draft.py new` 新建 `digital-human-survey-map` brainstorm 草稿（type: survey-chapter，target_alias: `categories/AI/数字人`，status: outlining），把 design.md 的 F1–F4 调研要点写入正文
- [x] 1.3 用 `draft.py new`（paper-note 模板）新建 `echoavatar-2026` 草稿，将 F7 要点（统一音频域全身驱动 / RL 稳定 one-shot 流式 / tool-call 语义注入）写入正文；新建 `avatar-forever-2026` 草稿，写入 F8 要点并标注“仅 API 摘要，待原文”

## 2. 综述地图文章（数字人系列（十九））

- [x] 2.1 撰写四篇综述逐一精析：FPSP v8 五族 taxonomy + 10 条质量维度 + "指标-感知脱节"论点；2509.03883 三段管线 + 7 类人体表征；2406.10553 三轴（含 Editing 独有类）；2507.02900 十大范式 + Loss 专节（素材：design.md F1–F4 + raw 原文）
- [x] 2.2 制作对比表（四综述 + 库内系列映射列）与"按需索骥"决策段；FPSP 实测表（FOMM/Wav2Lip/SadTalker/TPSM/Teller/READ）与系列十二数据交叉对照，标注口径差异
- [x] 2.3 写"新模型线索清单"小节：READ / Dimitra / Hallo3 / OmniHuman-1 / GaussianSpeech / PGSTalker / UniGAHA / VASA-3D / GaussianEmoTalker / EditYourself / TalkVid / SpeakerVid-5M，标注已覆盖 / 待精读 / 待跟踪
- [x] 2.4 发布 `src/pages/digital-human-survey-map.html`（sub_id=190，aliases 含 `categories/AI/数字人`），配图走 blog-images 优先级链，三路 review 后定稿

## 3. 动作空间新模型精读（论文精读 51 起）

- [x] 3.1 LeapTalk 精读（基于 `raw/leaptalk-2026/` 原文）：Brownian bridge data-to-data 蒸馏、SNR 对齐时间变换、音频驱动 CFG、1 step / 200 FPS 实测；发布 `src/pages/leaptalk-2026.html`，sub_id=680
- [x] 3.2 OmniMate 精读（基于 `raw/omnimate-2026/` 原文）：GPC 进度控制器、MRCM 多参考身份保持、VerseBench 交互版评测；发布 `src/pages/omnimate-2026.html`，sub_id=690

## 4. 系列文章内容级增补

- [x] 4.1 系列三 `digital-human-motion-space-avatar.html`：文末新增"动作空间的实时化浪潮（2025-12 之后）"小节——机制时间线：StreamAvatar / LiveTalk（已有）→ EchoAvatar（统一音频域全身 + tool-call）→ LeapTalk（bridge 单步蒸馏）→ OmniMate（开放式联合生成），每节点写"生成空间 + 实时/长时稳定机制"，交叉链接新精读，更新 `updated_at`
- [x] 4.2 系列一 `realtime-digital-human-survey.html`：新增"外部视角"段——FPSP v8 五族 taxonomy 与库内分类的映射对照 + 链接综述地图，更新 `updated_at`
- [x] 4.3 系列十五 `digital-human-training-loss-survey.html`：对照 2507.02900 的 Loss 专节核对是否有漏项，有则增补并注明出处，无则在文中加一句"已对照 2507.02900 校验"

## 5. Hub 收录与构建校验

- [x] 5.1 `digital-human-hub.html` 收录综述地图 + 2 篇新精读，更新对应分区与 `updated_at`
- [x] 5.2 `scripts/check-sub-id.py --category 数字人` 校验 sub_id 无冲突；`node build.js` 构建无错误
- [x] 5.3 草稿状态回填：已发布文章对应草稿 `draft.py set <slug> status=published progress=100 published_at=... published_file=...`
- [x] 5.4 对照 spec 6 条 Requirement 逐条自查后提请 archive
