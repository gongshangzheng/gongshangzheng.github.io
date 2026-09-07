## Review（事实核查 · digital-human-survey-map.html）

核对基准：四篇综述原文提取稿（raw/*/sources/*.md）+ 各提取日志（arXiv ID）。只读核查，未改任何文件。

### P0 错误（须改）

1. **`:162`「3DGS 浪潮都未收录」— 与原文直接矛盾。** THG Taxonomy 综述明确收录了 3DGS 说话头方法：`thg-taxonomy-survey.md:444`："The latest technique, 3D Gaussian, demonstrates superior performance in 3D reconstruction compared to NeRF zhou2024headstudio… Xu et al. xu2023gaussian… PSAvatar zhao2024psavatar… GaussianTalker cho2024gaussiantalker"。同段「Hallo/EMO 系未收录」为真（全文 grep 无 EMO(tian2024)/Hallo 引用），须删改的只是 3DGS 半句，可改为「3DGS 仅在 audio-driven 的 explicit parametric 小节简要收录（GaussianTalker 等）」。

2. **`:189` 对比表 Motion Survey「覆盖截至 2025 年中」— 与原文矛盾。** `motion-video-survey.md`："Note that all statistics referenced in this paper are current as of **August 30, 2024**."；论文量统计图也注明 "2024\* denotes the period from Jan. to Aug. in 2024"；全文唯一 2025 引用是 `li2025survey`（:1260，一篇 survey 引用）。按本行其余三列同用的「内容覆盖」口径，应写 ≈2024-08/2024 年中。

### P1 不精确

3. **`:169` 与 `:186` 附近「2025 年 6 月 / 2507.02900（2025-06）」**：arXiv 2507.02900 = 2025 年 7 月（`raw/thg-advancing-survey/extraction-log.md` 确认 ID）。应改为 2025-07。范围 2017–2025.04 本身正确（"released mainly between 2017 and April 2025"）。
4. **`:138`「Follow-YourShape」方法名不存在。** 原文 Depth 段引用的是 xue2024follow = Follow-Your-Pose v2（"…accurately generate occluded body parts~xue2024follow"）。应改名或改标 Champ（mesh/normal 的引用）。
5. **`:160` 表格比较的对象列错。** 按无监督/端到端/N-shot/3D 模型列表比较的表格只含学习方法（FOMM、TPSM、Face-vid2vid 等）；Face2Face、X2Face 只出现在传统非学习的「混合变换」正文段，不在表内。
6. **`:162` 编辑清单张冠李戴。**「改说话内容、调表情强度、动注视点、改语速、翻译成另一种语言」逐句来自 FPSP v8 的 Text/Semantic/Editing 段（"change what a person says, alter expression intensity, adjust gaze, retime speech, translate speech into another language"），非 Meng et al. 原文。Taxonomy 综述只支持其中部分（fried2019text：增删改词、language conversion；sun2024fg：AU 强度控制）；全文无 gaze/retiming 内容。
7. **`:171` Loss 专节内容概括失真。** 原文 Loss 章节（thg-advancing-survey.md:619–686）主体是通用 ML 损失教程（回归/分类/无监督、PCA/k-means）+ 一张 benchmark 损失表（L1/L2/IoU/Focal/Contrastive/Triplet/Center/ArcFace/Reconstruction 等），**没有**感知 loss、GAN loss、同步专家 loss 的系统讲述。「专节存在、值得对标系列十五」的结论可保留，但列举须改。

### P2 可改进

8. `:118–126` 三段管线：原文自称 "five key phases"（含 input），三段是对其章节结构（Sec:MP / Sec:MV / Refinement+Output，原文也称后两段为 "the final two phases"）的合理归纳，建议加半句注明。
9. `:42`「2026-07-07 完成第八版」：仓库提取稿无版本元数据，无法核验（不矛盾，留作残留风险）。
10. `:63` 横切关注带漏列原文的 controllability、consent。
11. `:189` FPSP 格「智能体辅助」：原文用语是 "foundation-model-assisted"（基础模型辅助），建议统一。
12. OmniHuman-1「字节的」归属在两篇提取稿中均未出现（外部常识，低风险）。

### ✅ 正确（有原文证据）

- **FPSP 实测表 10 行数字逐格一致**（`tab:comparison_hardware`：34s/2GB/3.45、23s/10.9GB/2.76、20s/3.9GB/1.69、22s/4.6GB/3.27、40s/4.4GB/3.84、19s/1.9GB/4.15、25s/2.8GB/2.24、4min50s/4.1GB/3.72、6s/3.6GB/4.05、10s/2.9GB/4.08）；四源图人物、TPSM 最低显存+最高人评、Teller/READ 6–10s 且 >4 分、「非受控 benchmark」自述均属实。
- **FPSP 五族 taxonomy**：五族名称、各族 4 个子方向与 taxonomy 图逐项一致，代表方法（Face2Face/FOMM/TPSM/LivePortrait；Wav2Lip/SadTalker/VASA-1/Teller/READ；EMO/Hallo1-3/OmniHuman-1；GaussianAvatars/LAM/GaussianSpeech/VASA-3D；Write-a-speaker/TalkCLIP/EditYourself）全部归属正确；「不互斥 + VASA-1/GaussianSpeech 例」原文原句支持。
- 十条质量维度 10/10；「指标-感知脱节」三点（PSNR/SSIM、FID/FVD、Sync）及「须注明模态/数据集/分辨率/时长/硬件」均为原文原句；11 条未来方向 6 个 bullet 恰好全覆盖原文 11 项。
- **Motion Survey**：arXiv 2509.03883 ✅（提取日志）、15 位作者 ✅（逐一清点 author list）、7 类人体表征 7/7（Mask/Mesh/Depth/Normal/Keypoint/Semantics/Optical Flow，含 Champ、OpenPose/DWPose、MagicAnimate 归属）、VAE/GAN/扩散（含 LDM）三类 ✅、audio-driven 五个子任务 5/5、两大挑战（唇+头+手势统一框架缺位、扩散实时化）原文支持。
- **THG Taxonomy**：arXiv 2406.10553 ✅、标题/作者（Ming Meng, Yufei Zhao, Bo Zhang…）✅、三轴（生成/驱动/编辑）✅、video-driven 传统非学习三分法（几何变换/模板 AAM+blendshape/混合变换）✅、2024-06 ✅。
- **Advancing THG**：arXiv 2507.02900 ✅、作者（Rakesh, Mazumdar, Maity…）✅、约 100 篇/2017–2025.04 ✅、十大范式名称与顺序逐词一致 ✅、六列表头（Method/Arch./Dataset/Highlights/Limitations/N-shot）✅、行文质量粗糙的批评有实锤（"realistic, realistic" 重复、句式断裂）。
- **作者名与 arXiv 号**：References 四条全部与提取稿/提取日志一致；12 条新线索（READ、GaussianSpeech、OmniHuman-1、EditYourself、Dimitra、Hallo3、PGSTalker/UniGAHA/VASA-3D、GaussianEmoTalker、TalkVid/SpeakerVid-5M）全部可在 FPSP 原文找到，含「规模 ≠ 公平」原句。

### 结论

**需修复后发布**——2 处 P0（`:162` 3DGS 覆盖断言、`:189` Motion Survey 覆盖时间）必须更正；7 处 P1 建议一并修。

```
acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Findings above cite file+line for both article (src/pages/digital-human-survey-map.html:42,63,79-88,118-162,169-171,186-190) and sources (raw/pixels-portraits-survey/sources/pixels-portraits-survey.md, raw/motion-video-survey/sources/motion-video-survey.md, raw/thg-taxonomy-survey/sources/thg-taxonomy-survey.md:444, raw/thg-advancing-survey/sources/thg-advancing-survey.md:619-686, plus extraction-log.md arXiv IDs), each graded P0/P1/P2/正确"
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [],
  "validationOutput": [
    "Read-only fact-check: full read of target HTML and all four source extraction files; targeted greps for EMO/Hallo/Gaussian/gaze/2025-citations/loss-taxonomy; arXiv IDs cross-checked against raw/*/extraction-log.md (2308.16041, 2509.03883, 2406.10553, 2507.02900 all match); FPSP 10-row benchmark table verified cell-by-cell"
  ],
  "residualRisks": [
    "FPSP v8 date 2026-07-07 and journal year 2026 not verifiable from repo (no version metadata in extraction)",
    "arXiv IDs verified against repo extraction logs only, not against external arXiv",
    "OmniHuman-1 ByteDance attribution and in-site series-number mappings not checkable against these sources",
    "Existence of cross-linked in-site pages (digital-human-*.html) not verified"
  ],
  "noStagedFiles": true,
  "diffSummary": "No diff; review-only task, no files modified",
  "reviewFindings": [
    "P0: src/pages/digital-human-survey-map.html:162 - claim that THG Taxonomy survey did not cover the 3DGS wave is contradicted by thg-taxonomy-survey.md:444 (GaussianTalker, PSAvatar, xu2023gaussian, HeadStudio)",
    "P0: src/pages/digital-human-survey-map.html:189 - Motion Survey coverage listed as 2025-mid, but source states statistics current as of August 30, 2024; only 2025 citation is li2025survey",
    "P1: src/pages/digital-human-survey-map.html:169 - Advancing THG dated 2025-06; arXiv 2507.02900 is July 2025",
    "P1: src/pages/digital-human-survey-map.html:138 - nonexistent method name Follow-YourShape; source cites xue2024follow = Follow-Your-Pose v2",
    "P1: src/pages/digital-human-survey-map.html:160 - Face2Face/X2Face are not in the tabular unsupervised/end-to-end/N-shot/3D comparison; only in traditional-methods prose",
    "P1: src/pages/digital-human-survey-map.html:162 - editing capability list (gaze, retiming, etc.) is verbatim FPSP v8 content misattributed to Meng et al. Taxonomy survey",
    "P1: src/pages/digital-human-survey-map.html:171 - Loss section characterized as covering perceptual/GAN/sync-expert losses; actual section is generic ML losses + benchmark table without those families",
    "P2: :118-126 three-stage framing vs survey's own five-key-phases wording; :42 v8 date unverifiable; :63 cross-cutting list omits controllability/consent; :189 foundation-model vs agent wording; OmniHuman-1 ByteDance not in sources",
    "no blockers beyond the two P0 items; verdict: fix-then-publish"
  ],
  "manualNotes": "Review-only task: per instructions, no progress.md written. All severity-graded findings and evidence are in the Review section above; the two P0 items gate publication."
}
```