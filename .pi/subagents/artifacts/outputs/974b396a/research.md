# Research: 数字人（Digital Human）——概念定义、任务边界与历史归属

> **方法与置信度声明**：本次子代理运行未提供 `web_search`/`web_fetch` 工具（经 supervisor 确认按"内部知识 + 逐条置信度标注"方案 A 执行）。论文类里程碑一律给出 arXiv 规范链接（`https://arxiv.org/abs/<ID>`），供主会话经 arXiv API 验真标题/作者；非论文项只给高置信入口链接（官方域名/维基条目名），其余标注【URL未核验】，不编造深层链接。
> 置信度标记：🟢 = 多方一致/高置信；🟡 = 单一来源或中等置信（细节待核验）；🔴 = 存疑/待核验。
> **对任务书的两处事实纠正**：① Wav2Lip 发表于 **ACM Multimedia 2020**（非 CVPR 2020，任务书有误）；② 《本杰明·巴顿奇事》的 **Digital Human League 由 Digital Domain 牵头**（与 ILM、USC ICT Light Stage 合作），非 ILM 单独机构。

## Summary

"数字人"没有单一提出者：学术源头是 1970 年代犹他大学 Frederic Parke 的计算机人脸参数化动画（1972 硕士论文；Parke & Waters 1996《Computer Facial Animation》为标准教科书），"virtual human / avatar"学术线由 UPenn Badler、日内瓦 MIRALab Thalmann 夫妇、Cassell（ECA）与 USC ICT 等建立；"digital human"作为产业标签由 2008《本杰明·巴顿奇事》的 Digital Human League 与 2021 Epic MetaHuman Creator 固化；"虚拟数字人"是 2021 年前后中国咨询机构与信通院对 avatar 类事物的本土化伞形术语——此前中文"虚拟人"长期指 2001–2005 年承袭美国 Visible Human Project 的"数字化虚拟人体"数据集，两者必须区分。任务边界上，业界/学界通行分类为：lip sync（口型）→ talking face/talking head（整脸+头姿）→ portrait animation（产业叫法，单图/风格化）→ full-body avatar（SMPL 系全身体）→ interactive avatar（可对话具身代理）；标准侧有 ISO/IEC 19774（H-Anim）、ISO/IEC 23000-13（MPEG-V）、IEEE 无可确证专项标准（疑似 P7014 待核验），以及中国信通院白皮书与深度合成/生成式 AI 法规。

---

## Findings

### 1. 定义与术语起源

**1.1 学术源头是"计算机面部动画"，不是某个统一的"digital human"定义** 🟢
- Frederic Parke（犹他大学）：1972 年硕士论文 *Computer Generated Animation of Faces* 完成最早的计算机人脸参数化建模与动画；1974 年博士论文 *A Parametric Model for Human Faces* 提出参数化人脸模型。被学界普遍视为计算机面部动画（digital face 谱系）的公认起点。注意精确边界：这是"计算机人脸动画"的起点，**不是**"digital human"一词的词源。🟢 [Wikipedia: Computer facial animation](https://en.wikipedia.org/wiki/Computer_facial_animation)、[Wikipedia: Facial animation](https://en.wikipedia.org/wiki/Facial_animation)
- Keith Waters 1987 SIGGRAPH 面部肌肉模型、*Tony de Peltrie*（1985，Daniel Langlois 等）、*Rendez-vous à Montréal*（1988，N. Magnenat-Thalmann & D. Thalmann）构成 1980 年代表情动画标杆。🟢（单条目细节 🟡【URL未核验】）
- Parke & Waters《Computer Facial Animation》（A K Peters, 1996；第 2 版 2008）是该领域标准教科书，确立 FACS/参数化/肌肉模型的学科框架。🟢（书目存在；官方链接【URL未核验】）

**1.2 "virtual human / avatar / ECA" 学术线** 🟢
- UPenn Norman Badler：Jack 人体建模系统与《Simulating Humans》（1993）；日内瓦 MIRALab 的 Thalmann 夫妇："synthetic/virtual actors"；Justine Cassell 等《Embodied Conversational Agents》（MIT Press, 2000）确立**具身会话代理（ECA）**框架；USC ICT（Gratch/Marsella 等）自约 2000 年运行 "Virtual Humans" 项目线。 [USC ICT](https://ict.usc.edu)（🟢）；书刊条目【URL未核验】
- "avatar" 的虚拟化身义由 1980s 图形界面/网络游戏（Lucasfilm Habitat，1986）与 Neal Stephenson 小说《Snow Crash》（1992）普及。🟡 [Wikipedia: Snow Crash](https://en.wikipedia.org/wiki/Snow_Crash)

**1.3 影视产业线："digital human" = photoreal 真人级数字替身** 🟢
- 产业含义由《本杰明·巴顿奇事》（2008）确立：全 CG photoreal 人脸成为主角；"Digital Human League" 是 **Digital Domain 牵头**（与 ILM、USC ICT Light Stage/Debevec 合作）的项目组名称 🟢（组名拼写一致，成员构成细节 🟡【URL未核验，以 Cinefex/fxguide 报道与奥斯卡公告为准】）。获 2009 年奥斯卡最佳视觉效果 🟢 [Wikipedia: The Curious Case of Benjamin Button (film)](https://en.wikipedia.org/wiki/The_Curious_Case_of_Benjamin_Button_(film))；Digital Human League 获奥斯卡科学技术奖（Sci-Tech，约 2013/2014 届，表彰其数字人脸制作与渲染系统）🟡【URL未核验】
- 后续里程碑：*Avatar*（2009，Weta Digital 表演捕捉/FACS 面部绑定）🟢；*Gemini Man*（2019，Weta "Junior" 全数字威尔·史密斯）🟢；*The Mandalorian*（2019，ILM StageCraft）——**注意定性：它是"虚拟制作/LED 摄影棚"里程碑，属制作管线而非数字人本体；其衍生的卢克·天行者数字减龄（2020 S2 结局/2022《波巴·费特之书》）才属数字人里程碑** 🟢/🟡。[Wikipedia: StageCraft](https://en.wikipedia.org/wiki/StageCraft)、[Wikipedia: Gemini Man (film)](https://en.wikipedia.org/wiki/Gemini_Man_(film))

**1.4 游戏/平台线：Epic MetaHuman Creator（2021）** 🟢
- Epic 官方定位："几分钟内创建带毛发与妆容的写实数字人"的云端应用（MetaHuman Creator），宣布于 2021 年 1 月、同年进入 Early Access，随 Unreal Engine 免费提供、绑定标准化；2023 年加入 MetaHuman Animator（视频→面部动画）。平台意义：把影视级数字人制作"民主化/标准化"。🟢（具体发布日期 🟡）[MetaHuman 官方页](https://www.unrealengine.com/metahuman)

**1.5 中国线："虚拟数字人"术语系谱** 🟡/🔴
- **(a) 早期异义用法**：中文"虚拟人/数字化虚拟人"在 2001 年前后承袭美国 NLM **Visible Human Project**（1994–95 尸体切片数据集），指人体数字化数据集；2001 年香山科学会议设"数字化虚拟人体"专题（届次/名称 🔴，候选：第 174 次学术讨论会）；2003 年钟世镇团队（南方医科大学）完成"中国虚拟人"数据集（细节 🔴）。**这与今天的"虚拟数字人"（交互式 avatar）是不同概念，历史归属不能混写。** 🟢（VHP 存在）/🔴（中国项目细节）[Visible Human Project](https://www.nlm.nih.gov/research/visible/visible_human.html)
- **(b) 虚拟偶像/主播线**：洛天依（2012，Vocaloid 虚拟歌手）🟢 [Wikipedia: Luo Tianyi](https://en.wikipedia.org/wiki/Luo_Tianyi)；Kizuna AI（2016，日本；"VTuber"一词由其运营方 Activ8 提出 🟡）[Wikipedia: Kizuna AI](https://en.wikipedia.org/wiki/Kizuna_AI)；新华社 AI 合成主播（2018，与搜狗合作）🟢【URL未核验】。
- **(c) 术语定型**："虚拟数字人"作为统一产业称谓约在 2021 年定型：艾媒咨询《2021中国虚拟数字人深度产业报告》为首份系统性产业报告 🟡（报告内市场规模数字 🔴 待核验）；随后中国信通院白皮书给出最常引用的权威定义（见 §4）。【URL未核验】
- **(d) 信通院定义要点**（🟡 多来源转引一致，逐字原文待核验）：虚拟数字人 = 具有数字化外形、依赖显示设备存在的虚拟人物（区别于实体机器人），三大特征：拥有**人的外观、人的行为、（一定程度的）人的思想/交互能力**；分类维度：真人驱动 vs AI 驱动、身份型 vs 服务型、2D vs 3D。【URL未核验】
- **结论（术语归属）**🟢：不存在单一"最早提出者"。"digital human" 是影视/游戏产业标签；"virtual human" 是学术（ECA/agent）术语；"虚拟数字人"是 2021 年前后中国咨询/研究机构对 avatar 类事物的本土化伞形术语。学术界（talking head/facial animation）与产业界（影视特效/MetaHuman/中国产业报告）对"数字人"的外延划定不同：学术重生成算法与评测，产业重制作管线、平台化与商业形态。

### 2. 历史里程碑归属（人/机构/年份/出处）

| 年份 | 里程碑 | 人/机构 | 出处与置信度 |
|---|---|---|---|
| 1971–1974 | 首个参数化计算机人脸模型与动画（公认起点，限"数字人脸动画"谱系） | Frederic Parke，犹他大学 | [Computer facial animation](https://en.wikipedia.org/wiki/Computer_facial_animation) 🟢 |
| 1985 | *Tony de Peltrie*：首个富表情 CG 角色短片 | Daniel Langlois 等 | [Wikipedia: Tony de Peltrie](https://en.wikipedia.org/wiki/Tony_de_Peltrie) 🟡 |
| 1987 | 面部肌肉模型（FACS 结合图形学） | Keith Waters | SIGGRAPH 1987 🟢【URL未核验】 |
| 1988 | *Rendez-vous à Montréal*（ Marilyn/Bogart 合成演员） | N. Magnenat-Thalmann & D. Thalmann | 🟢【URL未核验】 |
| 1996 | 《Computer Facial Animation》教科书 | Parke & Waters | 🟢（书目）【URL未核验】 |
| 1997 | **Video Rewrite**：音频驱动视觉语音（数据驱动口型拼接） | Christoph Bregler, Michele Covell, Malcolm Slaney（Apple） | SIGGRAPH 1997 🟢【ACM DL 链接未核验】 |
| 2008 | *本杰明·巴顿奇事*：photoreal 数字人脸担纲主角 | Digital Domain 牵头 Digital Human League（+ ILM + USC ICT） | 🟢（奥斯卡最佳视效）/🟡（组名细节） |
| 2009 | *Avatar*：表演捕捉工业化 | Weta Digital | 🟢 [Wikipedia: Avatar (2009 film)](https://en.wikipedia.org/wiki/Avatar_(2009_film)) |
| 2016 | Face2Face：实时视频面部重演 | Justus Thies 等（TUM/斯坦福） | [arXiv:1607.03547](https://arxiv.org/abs/1607.03547) 🟡（ID 待 API 验真） |
| 2017 | **Synthesizing Obama**：音频→口型视频 | Supasorn Suwajanakorn, Steven M. Seitz, Ira Kemelmacher-Shlizerman（华盛顿大学；SIGGRAPH/TOG 2017） | [arXiv:1606.05871](https://arxiv.org/abs/1606.05871) 🟡（ID 待验）；项目页 [grail.cs.washington.edu/projects/lipsync](https://grail.cs.washington.edu/projects/lipsync/) 🟡 |
| 2019 | FOMM（First Order Motion Model）单图动画 | Aliaksandr Siarohin 等 | [arXiv:2003.00196](https://arxiv.org/abs/2003.00196) 🟡（ID 待验） |
| 2019 | *Gemini Man*：全数字真人主角 | Weta Digital（李安导演） | 🟢 |
| 2019 | *The Mandalorian* / StageCraft：虚拟制作（定性注记见 §1.3） | ILM | 🟢 |
| **2020** | **Wav2Lip（"A Lip Sync Expert Is All You Need…"）**——**纠错：发表于 ACM Multimedia 2020，非 CVPR 2020** | K R Prajwal, Rudrabha Mukhopadhyay, Vinay P. Namboodiri, C.V. Jawahar（IIIT Hyderabad） | [arXiv:2008.10010](https://arxiv.org/abs/2008.10010) 🟢（会议信息 🟢 多方一致） |
| 2021 | **MetaHuman Creator**：写实数字人平民化 | Epic Games | [unrealengine.com/metahuman](https://www.unrealengine.com/metahuman) 🟢 |
| 2023 | **SadTalker**：单图音频驱动 3DMM 运动系数（CVPR 2023） | Wenxuan Zhang 等（西安交通大学 + 腾讯 AI Lab 等） | [arXiv:2211.12194](https://arxiv.org/abs/2211.12194) 🟢 |
| 2024 | **VASA-1**：实时音频驱动说话人视频生成 | 微软亚洲研究院（Sicheng Xu, Guojun Chen, Jiaolong Yang, Xin Tong, Baining Guo 等） | [arXiv:2405.04290](https://arxiv.org/abs/2405.04290) 🟢；微软声明无产品化计划 🟡；项目页 [MSR VASA-1](https://www.microsoft.com/en-us/research/project/vasa-1/) 🟡 |
| 2024 | EMO（Emote Portrait Alive）：音频驱动人像视频 | 阿里巴巴 | [arXiv:2402.17485](https://arxiv.org/abs/2402.17485) 🟡（ID 待验） |
| 中国线 | 2012 洛天依 → 2018 新华社 AI 合成主播 → 2021 艾媒报告（"虚拟数字人"称谓定型）→ 2022 信通院白皮书/北京政策 | 见 §1.5、§4 | 🟡/🔴 |

### 3. 任务分类（业界共识 taxonomy）

五类任务及边界（🟢 分类框架多方一致；各条代表作 🟢/🟡 如标注）：

1. **Lip sync（口型同步 / audio-driven visual speech）**：音频→嘴部区域，输出受限于下半脸。代表作：Video Rewrite（SIGGRAPH 1997）、Wav2Lip（ACM MM 2020）。评测：LSE-C/LSE-D（源自 SyncNet，Chung & Zisserman 🟡【ID未核验】）。
2. **Talking face / talking head generation**：整脸生成（表情 + 头姿 + 眼动），两支：one-shot 单图驱动（MakeItTalk [arXiv:2004.12992](https://arxiv.org/abs/2004.12992) 🟡、SadTalker [arXiv:2211.12194](https://arxiv.org/abs/2211.12194) 🟢、VASA-1 [arXiv:2405.04290](https://arxiv.org/abs/2405.04290) 🟢；3DMM 系 FaceFormer（CVPR 2022）等 🟡【ID未核验】）与 source→target 视频重演（Face2Face [arXiv:1607.03547](https://arxiv.org/abs/1607.03547) 🟡、FOMM [arXiv:2003.00196](https://arxiv.org/abs/2003.00196) 🟡）。评测：CSIM（ArcFace 余弦）、APD、FID + 用户研究 🟢（指标名多方一致）。
3. **Portrait animation（人像动画）**：**产业/产品术语，无严格学术定义**（🟡）：D-ID、HeyGen、阿里 EMO [arXiv:2402.17485](https://arxiv.org/abs/2402.17485) 🟡 等；侧重单张风格化人像→整头/半身动画，与 talking head 高度重叠，边界在于商业化"照片开口说话/唱歌"产品场景。
4. **Full-body avatar（全身数字人）**：参数化人体模型 SMPL（[smpl.is.tue.mpg.de](https://smpl.is.tue.mpg.de/) 🟢）、SMPL-X（[smpl-x.is.tue.mpg.de](https://smpl-x.is.tue.mpg.de/) 🟢；头部对应 FLAME [flame.is.tue.mpg.de](https://flame.is.tue.mpg.de/) 🟢）；语音/文本→手势与动作（GENEA Challenge [genea-workshop.github.io](https://genea-workshop.github.io/) 🟡；NVIDIA Audio2Face/Omniverse Avatar → ACE 🟡【入口 URL未核验】）；影视级全身数字替身亦归此类。
5. **Interactive avatar（可交互数字人）**：实时对话具身代理，学术源头 ECA（Cassell 2000）与 USC ICT Virtual Human Toolkit [ict.usc.edu](https://ict.usc.edu) 🟢；商业形态 Synthesia、Soul Machines、NVIDIA ACE（🟡）；学术近作 Audio2Photoreal（NVIDIA 2024）🟡【ID未核验】、VASA-1 宣称支持双向交互 🟡。

**相邻概念辨析** 🟢（历史归属上最易混淆）：
- **digital double**（影视数字替身，指代特定真人）≠ **digital twin**（工业仿真孪生体，非"人"）≠ **VTuber**（真人驱动表演）≠ **AI 合成主播**（模板化新闻播报）≠ 游戏 NPC（脚本/AI 角色引擎驱动）。中文"虚拟数字人"是上述多类的伞形术语，英文文献无一一对应词。

**权威 survey 情况**：3D 人脸重建/追踪方向有 EG STAR 综述 Zollhöfer, Thies, Nießner 等，Computer Graphics Forum 37(2), 2018 🟢【URL未核验】；deepfake 生成侧 Verdoliva, IEEE JSTSP 2020 [arXiv:2001.06537](https://arxiv.org/abs/2001.06537) 🟡（ID 待验）；对话代理侧 Cassell 2000 🟢。**专门的 talking-head/portrait-animation 权威综述题名未能从记忆中确证** 🔴——2022–2024 arXiv 存在多篇相关综述，建议主会话以 "talking head generation survey" / "talking face generation survey" 检索 arXiv API 后补引。

### 4. 标准 / 治理

- **ISO/IEC 19774（H-Anim, Humanoid Animation）**：Web3D 联盟主导的人形动画标准（2006 初版；2019 年前后修订为多部分——部分号 🔴 待核验），规范虚拟人骨架/绑定互操作。🟡【URL未核验：web3d.org H-Anim 工作组页】
- **ISO/IEC 23000-13（MPEG-V, Media context and control）**：含 avatar 特征（avatar characteristics）交换的标准族。🟡（标准号中等置信，待核验）[ISO 官网](https://www.iso.org)（🟢域名）【具体标准页未核验】
- **IEEE**：**未找到可确证的"数字人"专项 IEEE 标准号**（按 supervisor 要求如实说明，不硬凑）。唯一疑似相关项目：IEEE P7014（"Ethical Considerations in Emulated Humans"，拟人/数字人伦理方向），其状态、范围与编号待核验。🔴 [IEEE SA](https://standards.ieee.org)（🟢域名）【项目页未核验】
- **中国（治理与定义权威来源）**：
  - 中国信通院《虚拟数字人发展白皮书》——最常被引用的定义与分类出处；候选名称/版本：《虚拟数字人发展白皮书（2022年）》（约 2022 年 1 月发布，此前或有 2021 版），名称与年份 🟡/🔴 待核验；"身份型/服务型、真人驱动/AI 驱动、2D/3D"分类与三特征定义被产业与媒体广泛转引 🟡。入口 [caict.ac.cn](http://www.caict.ac.cn)（🟢域名）【报告深层链接未核验】。
  - 艾媒咨询《2021中国虚拟数字人深度产业报告》🟡。入口 [iimedia.cn](https://www.iimedia.cn)（🟢域名）【深层链接未核验】。
  - 北京市《北京市促进数字人产业创新发展行动计划（2022-2025年）》（2022，据报道为全国首个数字人产业专项政策）🟡【URL未核验】。
  - 法规（存在性与施行日期 🟢 多方一致）：《互联网信息服务深度合成管理规定》（2022-11 发布，2023-01-10 施行，明确深度合成与人脸/人声编辑义务）、《生成式人工智能服务管理暂行办法》（2023-08-15 施行）、《个人信息保护法》人脸信息条款。政府入口 [gov.cn](https://www.gov.cn)、[cac.gov.cn](http://www.cac.gov.cn)（🟢域名）【具体条文页未核验】。
  - 信通院系"可信虚拟数字人"评估/标准工作存在 🟡（具体标准号 🔴 待核验）。
- **评测标准缺口** 🟢：数字人生成无统一权威 benchmark；事实指标为 LSE-C/LSE-D、CSIM、APD、FID + 用户研究；手势/动作侧有 GENEA Challenge 🟡。

---

## Sources

**Kept（给出链接者）**：
- [Wikipedia: Computer facial animation](https://en.wikipedia.org/wiki/Computer_facial_animation) — Parke 谱系与 1972 起点的多方一致记载
- [arXiv:2008.10010](https://arxiv.org/abs/2008.10010) — Wav2Lip（ACM MM 2020，纠错依据）
- [arXiv:2211.12194](https://arxiv.org/abs/2211.12194) — SadTalker（CVPR 2023）
- [arXiv:2405.04290](https://arxiv.org/abs/2405.04290) — VASA-1（微软亚洲研究院，2024）
- [unrealengine.com/metahuman](https://www.unrealengine.com/metahuman) — MetaHuman Creator 官方定位
- [nlm.nih.gov Visible Human Project](https://www.nlm.nih.gov/research/visible/visible_human.html) — 中文"虚拟人"早期异义用法的美国源头
- [ict.usc.edu](https://ict.usc.edu)、[smpl.is.tue.mpg.de](https://smpl.is.tue.mpg.de/)、[smpl-x.is.tue.mpg.de](https://smpl-x.is.tue.mpg.de/) — ECA/虚拟人学术线与人体模型权威项目页
- Wikipedia 条目：Benjamin Button、Avatar、Gemini Man、StageCraft、Luo Tianyi、Kizuna AI、Snow Crash — 影视/文化里程碑的稳定入口

**Dropped（未给链接者）及原因**：
- Parke 1972/1974 学位论文原文、Parke & Waters 1996 书页、Waters 1987 论文页 — 无高置信稳定 URL，仅给题名（避免编造 DOI）
- Digital Human League 奥斯卡 Sci-Tech 奖公告、Cinefex/fxguide 深度报道 — 深链不可凭记忆构造，标【URL未核验】仅保留结论
- 信通院白皮书 PDF、艾媒报告页、北京行动计划原文、深度合成/生成式AI条文页 — 深链不确定，给域名入口 + 精确题名供检索
- 各具体 DOI（如 Video Rewrite ACM DL 页）— 记忆置信度不足，宁缺毋滥

## Gaps

1. **全部 URL 未经在线核验**（本运行无 web 工具）：论文类 9 个 arXiv ID（🟢 4 个、🟡 5 个）需主会话经 arXiv API 验真；非论文项深层链接待补。
2. **中国信通院白皮书**确切名称/版本/发布月份、三特征定义逐字原文待核验（候选名已列）。
3. **IEEE P7014** 状态与范围待核验；ISO/IEC 19774 现行部分号、ISO/IEC 23000-13 标准号待核验。
4. **talking head/portrait animation 专门综述**的精确题名未确证（🔴）——建议 arXiv API 检索补引 1–2 篇作为分类 taxonomy 的权威出处。
5. Digital Human League 奥斯卡 Sci-Tech 奖的确切届次与获奖人名单、香山科学会议届次、艾媒报告市场规模数字待核验。

## Supervisor coordination

- 已通过 `contact_supervisor`（need_decision）报告 web 工具缺失；supervisor 回复确认方案 A（内部知识 + 置信度标注 + arXiv 规范链接供验真 + 两处纠错 + 中国标准/IEEE 按"不确定即如实说明"处理），并要求完成后经 intercom 通知。
