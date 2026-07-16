---
name: reference-video-contour-survey
description: 视频轮廓提取主题的 Hub 与三篇论文精读位置（SAM 2 / RVM / Track Anything），现含 ContourFormer 精读（四）
metadata:
  type: reference
---

视频轮廓提取（"实时 + 准确 + 时序一致"地从视频提取目标轮廓）这一主题在库内已有完整系列：

- **Hub（综述）**: `src/pages/video-contour-extraction-survey.html`（2026-07-14 写）
  - 把"视频轮廓提取"拆成三条技术线：边缘检测 / VSOD、VOS、matting
  - 时序一致性机制三分：recurrent（RVM） / memory-bank（XMem、SAM 2） / 局部注意力（TAM）
  - 核心结论：纯"视频边缘检测"没有独立模型线；VOS 的 mask 边界和 matting 的 alpha 蒙版才是真实需求的承担者；三条线最终在 SAM 2 streaming memory 上交汇
- **论文精读（一）SAM 2**: `src/pages/paper-sam-2.html`（sub_id 100）
- **论文精读（二）RVM**: `src/pages/paper-robust-video-matting.html`（sub_id 110）
- **论文精读（三）Track Anything**: `src/pages/paper-track-anything.html`（sub_id 120）
- **论文精读（四）ContourFormer**: `src/pages/contourformer-2025.html`（sub_id 130，2026-07-14）——图像级 contour-based 实例分割（非视频），建在 D-FINE 上，sub-contour 解耦 + CFDR 概率分布精修；作为 contour 表示在图像侧的基础收进系列。

**Why:** 用户问"哪个方法能实时、准确、时序连续地提取视频轮廓"时，第一站是 Hub，按"轮廓表示 + 时序机制 + 实时性"三维度回答：SAM 2（Hiera-L 30 FPS, DAVIS17 90.7）、RVM（HD 104 FPS, trimap-free）、SAM2Matting（1080p 40 FPS, dtSSD 最低）三条路线按需取舍。ContourFormer 补的是图像侧 contour 表示基础（无时序）。

**How to apply:** 用户提此主题相关问题时，先打开 Hub 拉出 Part 7 方法矩阵（代表方法横向对比表），再按需要跳读对应精读。三条线共同的开放问题（细薄结构闪烁、长视频身份漂移、缺统一时序轮廓指标、无 prompt 全自动）写在 Hub Part 10。相关记忆 [[feedback-blog-first]]、[[read-article-env]]。
