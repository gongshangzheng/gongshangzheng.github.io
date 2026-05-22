---
title: "TiTok 与 1D Visual Tokenizer：研究现状与演进方向"
description: "基于 TiTok 及其 263 篇引用文献的系统性调研，梳理 1D Visual Tokenizer 的六大改进方向、三条演进主线，以及我们自己的 ProgressiveDiTok 与双流编码器的定位。"
created_at: 2026-05-17T10:00:00
updated_at: 2026-05-17T10:00:00
tags: ["arXiv", "视觉编码器", "1D Tokenizer", "TiTok", "研究综述"]
categories: [AI]
hero_title: "TiTok 与 1D Visual Tokenizer"
hero_sub: "研究现状与演进方向"
hero_tagline: "从 32 tokens 到 3B 参数：1D 视觉编码器的三条主线"
subcategory: Visual Tokenizer
---


## TiTok：1D Visual Tokenizer 的奠基工作

TiTok（NeurIPS 2024）的核心贡献是一个简洁的问题定义：传统 2D tokenizer 的 token 数量与图像分辨率绑定（256×256 → 16×16 grid = 256 tokens），且每个 token 只包含局部 patch 信息。

TiTok 的解法：

- 编码端：ViT 将图像 patch 序列 + K 个可学习 latent tokens 一起编码，最终只保留 latent tokens
- 量化：标准 VQ（码本 4096）
- 解码端：K 个量化后的 latent tokens + mask tokens → MaskGIT 渐进式解码
- 结果：256×256 图像压缩为 32 个 token

一个关键洞察：TiTok 的码本像"字母表"，单个 token 没有明确语义，必须拼成整体才能表意；而 VQGAN 的码本像"词典"，单个 token 有语义但组合受约束。这使得 TiTok 的有效码空间利用率更高，信息冗余更少。

局限：语义保持好，但细节重建与原图有较大误差；32 tokens 的极端压缩下容量受限。

## TiTok 之后的六大改进方向

基于 Semantic Scholar 上 TiTok 的 263 篇引用文献，后续工作主要沿六个方向展开。

### 方向一：表示形式的底层创新

one-hot 码本不再是唯一选择。

- **Instella-T2I**：binary 向量替代 one-hot codebook，1024×1024 仅需 128 tokens
- **WeTok**：lookup-free quantization + 生成解码器，768× 压缩比下 rFID 3.49
- **Tokenize Image as a Set**：无序 token 集合，根据区域语义复杂度动态分配编码容量

### 方向二：连续-离散混合表示

VTBench 的核心发现：**连续 VAE 在视觉表示上显著优于离散 VT**，尤其在空间结构、细粒度纹理、文本保留方面。

- **HART**：离散 token（大局）+ 连续残差 token（细节），37M 参数的残差扩散模块，重建 FID 从 2.11 降到 0.30
- **SoftVQ-VAE**：soft categorical probabilities 替代硬量化
- **VQRAE**：同一框架输出连续语义表示 + 离散生成 tokens，分别服务理解与生成

本质：**离散负责序列建模（AR/LLM 友好），连续负责高保真重建**。

### 方向三：语义外置化与规模化

"冻结强语义编码器 + 轻量可学习 bottleneck + 条件化解码器"成为共识路线。

- **GigaTok**（ICCV 2025，3B 参数）：语义正则化对齐预训练视觉编码器，decoder 优先扩展。系统回答了"tokenizer 变大后重建与生成为何此消彼长"——根源在于潜在空间复杂度失控
- **MAETok**：核心发现是"变分约束非必需，有判别性的潜在空间结构才是关键"，ImageNet 生成仅用 128 tokens 达到 gFID 1.69，训练快 76 倍
- **DINO-Tok / MUSE-VL / SemHiTok**：冻结 VFM 特征作为语义锚点

### 方向四：Tokenization 过程的结构创新

- **NativeTok**：tokenization 阶段就强制执行因果依赖
- **ImageFolder**：可折叠 token + 双分支乘积量化，一支语义一支像素
- **TA-TiTok / MaskGen**：文本感知 1D tokenizer，一阶段训练替代 TiTok 的两阶段

### 方向五：高压缩 latent 的生成先验

Kaiming He 组（ICML 2025）发现：1D tokenizer 的高压缩 latent space 本身就蕴含了强大的生成先验。仅通过 token 复制/替换 + 梯度优化即可实现图像编辑，**无需训练任何生成模型**。

这表明：**tokenizer 的潜在空间质量直接决定了生成任务的上限**。

### 方向六：评估体系

- **VTBench**：首个系统 tokenizer 评测基准，覆盖重建、细节保留、文本保留三个维度

## 三条演进主线

将六个方向收束，形成三条清晰的演进主线：

| 主线 | 代表工作 | 核心主张 |
|------|---------|---------|
| 表示形式的重构 | Instella-T2I, WeTok, NativeTok | 1D token 的数学结构本身可以重新设计，不局限于传统 VQ |
| 连续-离散的融合 | HART, SoftVQ-VAE, VQRAE | 离散负责序列建模，连续负责高保真重建，各司其职 |
| 语义外置与规模化 | GigaTok, MAETok, DINO-Tok | 借助预训练 VFM 的语义先验，把 tokenizer scale 到 billion 级别 |

## 我们自己的工作

### ProgressiveDiTok

核心想法：将编码端与扩散模型加噪过程耦合。编码端逐步传递信息，解码端逐步恢复。

- 基于 TiTok 的 1D tokenization，解码端用像素扩散模型替代 MaskGIT
- 支持可变 bpp（通过调整扩散步数）
- 关键创新点：信息分步传递 + 编解码并行

### 双流离散视觉编码器

- 两条流：image tokens（局部细节）+ latent tokens（全局语义）
- 可调压缩率、支持 ROI 增强、支持逐步传输
- 与 HART（离散+连续混合）和 ImageFolder（双分支）的方向有呼应

### 定位

我们的工作恰好踩在了三条主线的交汇点上：

- ProgressiveDiTok 的"分步传递信息"与方向五（高压缩 latent 的生成先验）有深层关联
- 双流编码器的"语义-细节分离"与方向二（连续-离散混合）和方向三（语义外置化）一致
- 差异化在于：面向图像压缩场景（而非纯生成），强调渐进式编解码

## 未决问题

1. ProgressiveDiTok 的"编码端融入加噪过程"，在表示形式重构和结构创新方向中是否有类似工作已经做了？
2. 连续-离散混合表示对图像压缩场景意味着什么？双流编码器是否需要引入连续分量？
3. MAETok 发现"变分约束非必需"，这对 ProgressiveDiTok 的 VQ 训练策略有什么影响？
4. "无需训练生成"的 token 操作方法能否直接用于 ProgressiveDiTok 的解码端？
