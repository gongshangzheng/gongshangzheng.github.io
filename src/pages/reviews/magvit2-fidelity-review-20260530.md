---
title: "Fidelity Review: MAGVIT-v2 博客"
slug: magvit2-tokenizer
reviewer: "Kong"
date: 2026-05-30
version: "current"
type: "fidelity-review"
status: "complete"
---

## 审查摘要

共审查 **4 项 P0 (严重)** 和 **3 项 P1 (中等)** 问题。其中 3 项 P0 涉及**事实性错误**（LPIPS 误标为 bpp、消融 FID 虚构、SSv2 FVD 虚构），1 项 P0 涉及**数值对比错位**（256×256 与 512×512 基线交叉误比）。

---

## P0 — 必须修正

### 1. 压缩指标表中 LPIPS 误标为 bpp（严重事实性错误）

**位置**：Part 5.1 主实验表格 → 视频压缩行  
**原文**：`26.18 @ 0.104 bpp` 和 `MAGVIT 23.70 @ 0.144 bpp`

**回原核验**：
- 论文 Table 3 的文字明确说明 "compares at **0.0384 bpp**, the bit rate of MAGVIT"
- `0.104` 和 `0.144` 是 LPIPS 值（越低越好），**不是 bitrate**
- MAGVIT-v2: LPIPS **0.104**, PSNR **26.18**, MS-SSIM **0.894** (at 0.0384 bpp)
- MAGVIT: LPIPS **0.144**, PSNR **23.70**, MS-SSIM **0.846** (at 0.0384 bpp)

**修正方案**：将 `26.18 @ 0.104 bpp` 改为 `PSNR 26.18, LPIPS 0.104 (at 0.0384 bpp)`，同时修正 MAGVIT 行对应错误。

### 2. 消融实验重建 FID 数值虚构（严重事实性错误）

**位置**：Part 5.3 → 第一条"causal 3D CNN vs 替代方案"

**原文**：
> causal 3D CNN 取得重建 FID **5.82**，优于 C-ViViT（**6.75**）和混合方案（**6.09**）  
> 在 SSv2 任务上差距更大（FVD **62.3 vs 88.2 vs 78.4**）

**回原核验**：
论文 Table 5(a) "Causal architectures on UCF-101" 的完整数据：

| 架构 | FID ↓ | FVD ↓ |
|------|-------|-------|
| MAGVIT | n/a | 107.15 |
| C-ViViT | **28.02** | **437.54** |
| C-ViViT + MAGVIT (混合) | **13.52** | **316.70** |
| MAGVIT-v2: Causal 3D CNN | **7.06** | **96.33** |

三个事实性错误：
- Paper 中的 C-ViViT FID = **28.02**（博客写 6.75，差 4 倍）
- 混合方案 FID = **13.52**（博客写 6.09）
- Causal 3D CNN FID = **7.06**（博客写 5.82）

**SSv2 的 FVD 数据在论文中不存在**。Table 5(a) 在 UCF-101 上评测，根本没有 SSv2 列。论文中没有在任何地方给出 SSv2 上按架构的 FVD 消融。

**修正方案**：全部替换为 Table 5(a) 的原文数据。删除 SSv2 行。如果确实需要 SSv2 数据，需从其他论文来源获取并标注来源。

### 3. 引言中 48% 对比的基准错位（严重事实性错误）

**位置**：Part 1 → 第一段

**原文**：
> 你在 ImageNet **512×512** 上做图像生成，哪怕是最强的基于 LM 的模型（**MaskGIT、MAGVIT**）也要比扩散模型差 48%（FID 3.41 vs 1.79）

**回原核验**：
- 论文原文：FID 3.41 vs 1.79 是在 **256×256** 分辨率上，不是 512×512
- 论文引用的 FID 3.41 来自 **Lee et al. 2022 (Draft / DPC)**，不是 MaskGIT 或 MAGVIT
- MaskGIT 在 256×256 上的 FID 是 **4.19**（无 guidance）和 2.69（有 guidance），不是 3.41
- 最好的 diffusion 在 512×512 上 FID 2.65 是 VDM++，不是论文引用的 MDT 的 1.79

**修正建议**：
> 在 ImageNet **256×256** 上做图像生成，哪怕是最强的基于 LM 的模型也要比扩散模型差 48%（FID 3.41 vs 1.79, Lee et al. 2022），这一差距在 512×512 上更为明显。

### 4. 主实验表 256×256 行对比基准错位（严重数据错误）

**位置**：Part 5.1 主实验表格 → 第二行

**原文**：
```
图像生成 | ImageNet 256×256 (w/ guidance) | FID 1.78 | Diffusion 2.65 | -33%
```

**回原核验**：
- 论文原文明确说 "this margin **narrows** at 256×256 resolution"，即 256×256 的改进幅度更小
- 论文 Table 7 显示 256×256 的最佳 diffusion 是 MDT，FID **1.79** (w/ guidance)，不是 2.65
- FID 2.65 是 **512×512** 上 VDM++ w/ guidance 的结果
- 所以 MAGVIT-v2 在 256×256 w/ guidance 下 FID 1.78 vs MDT 1.79，改进只有 **0.01 FID (0.6%)**，不是 -33%

**修正建议**：将对比基准改为 **MDT (Gao et al., 2023) FID 1.79**，边际改为 **-0.6%**，或者将整行合并到 512×512 行中一并说明。

---

## P1 — 建议修正

### 5. 熵正则化消融数据无出处（P1）

**位置**：Part 5.3 → 第四条

**原文**：
> 去掉熵惩罚后，约 **30% 的 bits 被冻结**（始终输出同一值），生成 FID 上升约 **0.3**

**回原核验**：
论文的消融实验（Table 5）中没有包含"移除熵正则化"的对照实验。论文描述了熵损失的公式但没有给出移除后的具体数值。以上两个数据在论文的可获取部分中找不到出处。可能是来自作者的其他工作坊/技术报告，或者来自复现工作的经验。

**修正建议**：删除这两句，或加注说明数据来源（如来自 Open-MAGVIT2 或其他复现实验）。

### 6. Token Factorization 消融数据无出处（P1）

**位置**：Part 5.3 → 第三条

**原文**：
> 不进行 factorization 时（直接预测 262K softmax），生成质量下降约 **0.2 FID**。分组数 **G=2 是最优选择**。

**回原核验**：
论文的消融实验中没有包含"取消 Token Factorization vs G=2"的对比。论文在 Section 3.2 中描述"for instance... two codebooks, each of size 2^9"但**没有提供 G 值消融**（如 G=1, G=4 的对比）。"0.2 FID 下降"和"G=2 最优"均未在论文中体现。

**修正建议**：删除或改为描述性表述"论文使用 G=2 以减少预测头的计算量，每组 9 bits 对应子词表 512"。

### 7. 混合方案中原始 latents 维度未明确（P1）

**位置**：Part 4.2 → 超参数表 → Latent 维度

**原文**：
> Latent 维度：B = 18（LFQ 输出通道数）

**回原核验**：
论文的 Hyperparameter 附录中列出 Vocabulary size = 2^18，但未显式列出"Latent dimension B = 18"。B = 18 由 K = 2^18 **隐含推导**（因为 binary LFQ 中 latent dimension = log2(K)）。这不是错误，但该维度的出处可考虑加注（"隐含于 K=2^18"）。

### 8. 图编号的确认

逐图检查博客中的 Figure 编号与论文实际编号：

| 博客 | 论文 | 状态 |
|------|------|------|
| Fig.1 curve | Fig.1 motivation | ✅ |
| Fig.7 完整架构 | Appendix Fig.7 | ✅ |
| Fig.2 因果架构 | Fig.2 arch | ✅ |
| Fig.3 重建对比 | Fig.3 reconstruction | ✅ |
| Fig.4 K600 生成 | Fig.4 k600 | ✅ |
| Fig.5 ImageNet 512 | Fig.5 imagenet | ✅ |
| Fig.6 Elo 主观评测 | Fig.6 compression | ✅ |
| Fig.9 PSNR (Appendix) | Appendix Fig.9 (psnr.pdf) | ✅ |
| Appendix Fig.9 LPIPS | Appendix Fig.9 (lpips.pdf) | ✅ 注：实际是同一 figure 的不同 subfigure |

✅ **所有图编号均正确**。Fig.9 在论文附录中是一个包含 LPIPS/PSNR/MS-SSIM 三个 subfigure 的复合图，博客分开引用 Fig.9（PSNR）和 Appendix Fig.9（LPIPS）是合理的。

### 9. 会议确认

博客顶部标注 `ICLR 2024 Oral`，论文 ICLR 2024 的 `$@Yu et al., 2024$` 引用的也是 ICLR 2024。论文 arXiv 页和 ICLR Proceedings 均确认 ICLR 2024。✅ **会议信息正确，无需修改**。

---

## 总体修复优先级

| 优先级 | 问题 | 修复难度 |
|--------|------|----------|
| 🔴 P0 | LPIPS 误标为 bpp (压缩表) | 一行数字改动 |
| 🔴 P0 | 消融 FID/C-ViViT/混合方案 数值错误 | 替换为 Table 5(a) 原文 |
| 🔴 P0 | SSv2 FVD 虚构 | 整行删除或替换 |
| 🔴 P0 | 256×256 对比基准错位 | 改为 MDT FID 1.79 |
| 🟡 P1 | 48% margin 分辨率/模型归因错误 | 修正分辨率和模型名 |
| 🟡 P1 | 熵正则化无出处数据 | 删除或标注来源 |
| 🟡 P1 | Token Factorization 无出处数据 | 改为描述性表述 |

### 快速修复建议

1. 压缩行：`26.18 @ 0.104 bpp` → `PSNR 26.18, LPIPS 0.104 (at 0.0384 bpp)`
2. 消融因果架构：替换 Table 5(a) 原文数据 (7.06 / 28.02 / 13.52)，删除 SSv2 行
3. 主表 256×256 行：对比基准改为 MDT 1.79，边际改为 -0.6%
4. 引言：分辨率为 256×256，模型为 Lee et al. 2022
5. 熵和 Token Factorization 消融：删除无出处数据
