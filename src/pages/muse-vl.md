---
title: MUSE-VL：通过语义离散编码建模统一视觉语言模型
description: 一个简单加法操作，让离散视觉 token 天然携带语义——用 1/58 的数据超越 Chameleon。
date: 2026-05-15
tags: [MUSE-VL, 视觉语言模型, Tokenizer]
categories: [AI]
page_style: |
  .hero { height: 55vh; }
hero_title: MUSE-VL
hero_sub: Semantic Discrete Encoding · ByteDance · 2024
hero_tagline: 一个简单加法操作，让离散视觉 token 天然携带语义——用 1/58 的数据超越 Chameleon。
---

<div class="stats">
  <div><div class="n">24M</div><div class="l">训练图文对</div></div>
  <div><div class="n b">1/58</div><div class="l g">Chameleon 数据量</div></div>
  <div><div class="n">63.6%</div><div class="l">AVG (7B)</div></div>
  <div><div class="n b">+4.8%</div><div class="l g">vs Emu3</div></div>
  <div><div class="n">7.73</div><div class="l">MJHQ FID↓</div></div>
</div>

<!-- ============================================================ -->
<!-- Section 1: 问题引入 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">一、核心问题：视觉 token 为什么缺乏语义？</div>

  <p>让大语言模型同时<strong>理解</strong>和<strong>生成</strong>图像，是统一视觉语言模型的终极目标。理想方案是将图像编码为离散 token，与文本 token 放入同一个自回归框架——但现有方法面临一个根本瓶颈：</p>

  <div class="callout">
    <h3>🚧 核心矛盾</h3>
    <p>传统 VQGAN 类视觉 tokenizer 仅用<strong>图像重建损失</strong>训练。量化后的离散 code 只保留了低级像素信息（颜色、纹理、边缘），<strong>缺乏高级语义</strong>（对象类别、场景理解）。当这些无语义的视觉 token 被送入 LLM 时，模型需要从零学习视觉-语言对齐——代价是海量数据和极差的理解能力。</p>
  </div>

  <p>数据说明一切：</p>

  <div class="table-wrap">
    <table>
      <thead><tr><th>方法</th><th>训练数据量</th><th>理解 AVG</th><th>核心问题</th></tr></thead>
      <tbody>
        <tr><td>Chameleon-7B</td><td>1.4B 图文对</td><td>33.3%</td><td>无语义信息，理解极差</td></tr>
        <tr><td>Chameleon-34B</td><td>1.4B 图文对</td><td>41.1%</td><td>34B 参数依然不及 7B 专用模型</td></tr>
        <tr><td>VILA-U</td><td>720M 图文对</td><td>59.0%（SEED only）</td><td>对比学习与重建损失冲突</td></tr>
      </tbody>
    </table>
  </div>

  <p>Chameleon 用了 14 亿图文对、34B 参数，多模态理解 AVG 仅 41.1%——连专用理解模型 LLaVA-NeXT 34B（66.4%）的一半都不到。瓶颈不在 LLM，而在 <strong>tokenizer 的表征质量</strong>。</p>
</div>

<!-- ============================================================ -->
<!-- Section 2: Insight -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">二、核心洞察：从预训练模型蒸馏语义</div>

  <p>MUSE-VL 的关键发现：</p>

  <div class="info-box">
    <h3>💡 关键洞察</h3>
    <p>预训练 CLIP/SigLIP 模型的图像编码器输出<strong>已经包含与语言对齐的语义信息</strong>。这意味着：</p>
    <ul>
      <li>不需要额外的文本编码器（VILA-U 的做法）</li>
      <li>不需要对比学习来对齐视觉和语言（VILA-U 的痛点，损失冲突导致收敛困难）</li>
      <li>只需在量化前将语义特征与图像特征<strong>直接相加</strong>，离散 token 就能天然携带语义</li>
    </ul>
  </div>

  <p>这个思路的本质是：不要从头学语义，从预训练模型<strong>蒸馏</strong>语义。SigLIP 已经在海量图文对上将视觉特征与语言对齐好了，直接用其输出作为语义锚点，比从头学习高效得多。</p>

  <div class="vs">
    <div class="l">
      <h3>❌ 旧方法</h3>
      <p>VQGAN 量化 → 无语义 token → LLM 从零学对齐</p>
      <p>需要 1.4B 数据，理解 AVG 33.3%</p>
    </div>
    <div class="r">
      <h3>✅ MUSE-VL</h3>
      <p>SigLIP 语义 + 图像特征 → 量化 → 语义感知 token</p>
      <p>仅 24M 数据，理解 AVG 63.6%</p>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- Section 3: 整体架构 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">三、MUSE-VL 整体架构</div>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-fig2-arch.png" alt="MUSE-VL 整体架构图" loading="lazy">
    <div class="cap">图1：MUSE-VL 整体架构。SDE Visual Tokenizer 将图像编码为语义感知的离散 token，与文本 token 一起送入自回归 Transformer。</div>
  </div>

  <p>MUSE-VL 由三部分组成：</p>

  <div class="card-grid">
    <div class="card">
      <h3>🧩 SDE Visual Tokenizer</h3>
      <p>将图像编码为语义感知的离散 token。核心创新——在量化前将冻结 SigLIP 的语义特征与图像编码器特征相加。</p>
    </div>
    <div class="card">
      <h3>📝 Text Tokenizer</h3>
      <p>标准文本分词器，与 LLM 原生 tokenizer 一致。</p>
    </div>
    <div class="card">
      <h3>🧠 Autoregressive Transformer</h3>
      <p>统一处理视觉和语言 token，仅扩展 embedding 层（+32,768 视觉 token ID），不修改 LLM 任何其他结构。</p>
    </div>
  </div>

  <p>训练目标极其简洁——对所有 token（视觉 + 文本）统一做 <strong>next-token prediction</strong>：</p>

  <div class="formula-block">
    <div class="formula-label">自回归训练目标</div>
    $$\mathcal{L} = -\sum_{t=1}^{T} \log p(x_t \mid x_{&lt;t})$$
  </div>

  <p>训练数据的组织方式区分理解和生成任务：</p>

  <div class="vs">
    <div class="l">
      <h3>理解任务</h3>
      <p><strong>Prompt</strong>: {text} &lt;soi&gt;{vision tokens}&lt;eoi&gt;</p>
      <p><strong>Target</strong>: {response}</p>
      <p style="font-size:0.85rem;color:var(--fg-muted)">视觉 token 在 prompt 中，只有回答参与损失</p>
    </div>
    <div class="r">
      <h3>生成任务</h3>
      <p><strong>Prompt</strong>: {system text} {caption}</p>
      <p><strong>Target</strong>: &lt;soi&gt;{vision tokens}&lt;eoi&gt;</p>
      <p style="font-size:0.85rem;color:var(--fg-muted)">顺序反转，视觉 token 在 target 中</p>
    </div>
  </div>
</div>

<!-- ============================================================ -->
<!-- Section 4: SDE Visual Tokenizer -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">四、SDE：语义离散编码详解</div>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-fig3-sde.png" alt="SDE 语义离散编码架构" loading="lazy">
    <div class="cap">图2：SDE（Semantic Discrete Encoding）架构。在 VQGAN 基础上增加冻结 SigLIP 语义编码器和语义解码器。</div>
  </div>

  <p>SDE 的核心流程可以概括为四步：</p>

  <div class="method-flow">
    <div class="step">📥 编码</div>
    <div class="arrow">→</div>
    <div class="step">🔗 语义融合</div>
    <div class="arrow">→</div>
    <div class="step">🎲 量化</div>
    <div class="arrow">→</div>
    <div class="step">📤 双解码</div>
  </div>

  <h3>1. 编码阶段</h3>
  <p>对于输入图像 $x \in \mathbb{R}^{H \times W \times 3}$，两条编码路径并行工作：</p>
  <ul>
    <li><strong>图像编码器</strong>：输出图像特征 $z = \text{Enc}(x)$，其中 $z \in \mathbb{R}^{h \times w \times d}$</li>
    <li><strong>语义编码器</strong>（冻结 SigLIP）：输出语义特征 $T = \text{SigLIP}(x)$</li>
  </ul>

  <h3>2. 语义融合与量化——整个方法最精妙的一步</h3>

  <div class="formula-block">
    <div class="formula-label">语义融合 + 量化</div>
    $$z_q = \text{Quant}(T + z)$$
  </div>

  <div class="callout">
    <h3>⚡ 一个加法，为什么如此有效？</h3>
    <p>语义特征 $T$ 引导量化过程<strong>选择更具语义的 codebook 向量</strong>，而图像特征 $z$ 保留低级像素信息确保重建质量。加法操作避免了 VILA-U 的收敛困难（对比学习和重建损失的冲突），因为不需要额外的对比学习损失——语义信息已经嵌入到特征空间中了。</p>
  </div>

  <h3>3. 双解码器</h3>
  <div class="card-grid">
    <div class="card">
      <h3>🎯 语义解码器 $\text{Dec}_s$</h3>
      <p>Vision Transformer（同 BEITv2），从 $z_q$ 重建语义特征 $z_s$。目标：确保量化后的 token 保留语义信息。</p>
    </div>
    <div class="card">
      <h3>🖼️ 图像解码器</h3>
      <p>ConvNet（同 VQGAN/LlamaGEN），从 $z_q$ 重建图像 $\hat{x}$。目标：确保离散 token 能高质量还原像素。</p>
    </div>
  </div>

  <h3>4. 三重损失函数</h3>

  <div class="formula-block">
    <div class="formula-label">总损失</div>
    $$L_{\text{total}} = L_{\text{sem}} + L_{\text{img}} + L_{\text{vq}}$$
  </div>

  <div class="loss-item">
    <strong>语义损失 $L_{\text{sem}}$</strong>：最大化重建语义特征与原始语义特征的余弦相似度：
    <div class="formula-block">
      $$L_{\text{sem}} = 1 - \cos(z_s, T) = 1 - \cos(\text{Dec}_s(z_q), T)$$
    </div>
    <p style="font-size:0.85rem;color:var(--fg-muted)">灵感来源于 BEITv2。通过语义解码器间接约束语义，而非直接在 token 空间做对比学习，训练更稳定。</p>
  </div>

  <div class="loss-item">
    <strong>图像重建损失 $L_{\text{img}}$</strong>：标准 VQGAN 损失组合：
    <div class="formula-block">
      $$L_{\text{img}} = \ell_2(x, \hat{x}) + L_P(x, \hat{x}) + \lambda_G L_G(\hat{x})$$
    </div>
    <p style="font-size:0.85rem;color:var(--fg-muted)">包含 L2 像素重建损失、感知损失（LPIPS）和对抗损失（GAN discriminator）。</p>
  </div>

  <div class="loss-item">
    <strong>VQ 损失 $L_{\text{vq}}$</strong>：标准向量量化损失：
    <div class="formula-block">
      $$L_{\text{vq}} = \| \text{sg}[z] - z_q \|_2^2 + \beta \| z - \text{sg}[z_q] \|_2^2$$
    </div>
    <p style="font-size:0.85rem;color:var(--fg-muted)">第一项拉近 codebook 向量到编码器输出，第二项（commitment loss）防止编码器输出远离 codebook。</p>
  </div>
</div>

<!-- ============================================================ -->
<!-- Section 5: 训练 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">五、训练流程</div>

  <p>MUSE-VL 的训练分为三个阶段，逐步构建能力：</p>

  <div class="timeline">
    <div class="timeline-item">
      <div class="year">阶段 1</div>
      <div class="event">
        <strong>Tokenizer 预训练</strong>
        <p>在 ImageNet-1K + CC12M（约 1000 万张图像）上训练 SDE，同时优化语义损失、图像重建损失和 VQ 损失。语义编码器（SigLIP）全程冻结。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="year">阶段 2</div>
      <div class="event">
        <strong>LLM 预训练</strong>
        <p>在 LLaVA-ReCap-CC12M 上，对所有 token 计算 next-token prediction 损失。学习视觉 token embedding 并对齐视觉-语言。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="year">阶段 3</div>
      <div class="event">
        <strong>指令微调</strong>
        <p>理解方向：Cambrian7M + LLaVA-OneVision-Data。生成方向：CC12M + 10M 高质量图像。仅 target 部分参与损失。</p>
      </div>
    </div>
  </div>

  <h3>Tokenizer 关键配置</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>超参数</th><th>值</th></tr></thead>
      <tbody>
        <tr><td>语义编码器</td><td>SigLIP-SO400m-patch14-384 / SigLIP-Large-patch16-256</td></tr>
        <tr><td>语义编码器参数</td><td>❄️ 冻结，不参与训练</td></tr>
        <tr><td>Codebook 大小 K</td><td>32,768</td></tr>
        <tr><td>Codebook 维度 d</td><td>8</td></tr>
        <tr><td>量化后 token 空间</td><td>16×16（384 分辨率）或 27×27（256 分辨率）</td></tr>
        <tr><td>训练数据</td><td>ImageNet-1K + CC12M ≈ 1000 万张</td></tr>
      </tbody>
    </table>
  </div>

  <h3>LLM 关键配置</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>超参数</th><th>值</th></tr></thead>
      <tbody>
        <tr><td>基础 LLM</td><td>Qwen-2.5-7B / Qwen-2.5-32B / Yi-1.5-9B / Yi-1.5-34B</td></tr>
        <tr><td>学习率</td><td>1e-4（Cosine schedule with warmup）</td></tr>
        <tr><td>优化器</td><td>AdamW (β₁=0.9, β₂=0.95)</td></tr>
        <tr><td>Embedding 扩展</td><td>+32,768 个视觉 token</td></tr>
        <tr><td>总训练数据</td><td>24M 图文对</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ============================================================ -->
<!-- Section 6: 实验结果 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">六、实验结果</div>

  <h3>1. Tokenizer 对比——SDE 一骑绝尘</h3>
  <p>所有模型使用相同 LLM (Yi-1.5-9B) 和训练数据：</p>

  <div class="table-wrap">
    <table>
      <thead><tr><th>Method</th><th>MMBench</th><th>SEED</th><th>MMStar</th><th>AVG</th></tr></thead>
      <tbody>
        <tr><td>VQGAN</td><td>32.0</td><td>42.7</td><td>29.1</td><td>34.6</td></tr>
        <tr><td>SEED</td><td>63.1</td><td>57.8</td><td>39.1</td><td>53.3</td></tr>
        <tr><td>LaVIT</td><td>63.3</td><td>59.5</td><td>40.3</td><td>54.4</td></tr>
        <tr style="background:var(--card-hover)"><td><strong>SDE (ours)</strong></td><td><strong>70.6</strong></td><td><strong>68.1</strong></td><td><strong>43.8</strong></td><td><strong>60.8</strong></td></tr>
      </tbody>
    </table>
  </div>

  <p>SDE 比 SEED 高 <strong>+7.5%</strong>，比 LaVIT 高 <strong>+6.4%</strong>。同样的 LLM、同样的数据，仅换 tokenizer 就有如此大的提升——再次证明瓶颈在 tokenizer 的表征质量。</p>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-tab1-tokenizer.png" alt="Tokenizer 对比表" loading="lazy">
    <div class="cap">论文 Table 1：不同 Tokenizer 的多模态理解对比。SDE 在所有指标上均显著优于 VQGAN、SEED 和 LaVIT。</div>
  </div>

  <h3>2. 统一模型理解能力——首次追平连续特征模型</h3>

  <div class="table-wrap">
    <table>
      <thead><tr><th>方法</th><th>LLM</th><th>视觉 Token</th><th>MMBench</th><th>MMStar</th><th>SEED</th><th>MMMU</th><th>SQA-I</th><th>MathVista</th><th>AVG</th></tr></thead>
      <tbody>
        <tr><td>LLaVA-NeXT</td><td>Yi-34B</td><td>连续</td><td>79.3</td><td>51.6</td><td>75.9</td><td>51.1</td><td>81.8</td><td>46.5</td><td>66.4</td></tr>
        <tr><td>Emu3</td><td>8B scratch</td><td>离散</td><td>58.5</td><td>46.6</td><td>68.2</td><td>31.6</td><td>89.2</td><td>47.6</td><td>58.8</td></tr>
        <tr><td>Chameleon-7B</td><td>7B scratch</td><td>离散</td><td>31.1</td><td>31.1</td><td>30.6</td><td>25.4</td><td>46.8</td><td>22.3</td><td>33.3</td></tr>
        <tr style="background:var(--card-hover)"><td><strong>MUSE-VL-7B</strong></td><td><strong>Qwen-2.5-7B</strong></td><td><strong>离散 SDE</strong></td><td><strong>72.1</strong></td><td><strong>49.6</strong></td><td><strong>69.1</strong></td><td><strong>39.7</strong></td><td><strong>93.5</strong></td><td><strong>51.3</strong></td><td><strong>63.6</strong></td></tr>
        <tr style="background:var(--card-hover)"><td><strong>MUSE-VL-32B</strong></td><td><strong>Qwen-2.5-32B</strong></td><td><strong>离散 SDE</strong></td><td><strong>81.8</strong></td><td><strong>56.7</strong></td><td><strong>71.0</strong></td><td><strong>50.1</strong></td><td><strong>95.0</strong></td><td><strong>55.9</strong></td><td><strong>70.1</strong></td></tr>
      </tbody>
    </table>
  </div>

  <div class="callout">
    <h3>🏆 里程碑式结果</h3>
    <p>MUSE-VL-32B AVG <strong>70.1%</strong>，超越专用理解模型 LLaVA-NeXT 34B（66.4%）达 <strong>+3.7%</strong>——这是<strong>离散视觉 token 模型首次在理解任务上超越连续 embedding 模型</strong>。</p>
    <p>MUSE-VL-7B 仅用 24M 数据（Chameleon 的 1/58），AVG 63.6%，超越 Emu3（58.8%）达 <strong>+4.8%</strong>。</p>
  </div>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-tab2-benchmark.png" alt="多模态理解 benchmark 对比" loading="lazy">
    <div class="cap">论文 Table 2：统一模型多模态理解 benchmark 全面对比。MUSE-VL 在离散 token 方法中全面领先。</div>
  </div>

  <h3>3. 数据效率——用最少的资源做最多的事</h3>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-fig1-results.png" alt="MUSE-VL 效果总览" loading="lazy">
    <div class="cap">图3：MUSE-VL 同时支持多模态理解和生成，用最少的数据达到最优性能。</div>
  </div>

  <div class="table-wrap">
    <table>
      <thead><tr><th>方法</th><th>训练图文对</th><th>相对 MUSE-VL</th></tr></thead>
      <tbody>
        <tr><td>Chameleon</td><td>1.4B</td><td>58×</td></tr>
        <tr><td>VILA-U</td><td>720M</td><td>30×</td></tr>
        <tr><td>SEED-LLaMA</td><td>600M</td><td>25×</td></tr>
        <tr><td>Janus</td><td>65M</td><td>2.7×</td></tr>
        <tr><td>Show-o</td><td>35M</td><td>1.5×</td></tr>
        <tr style="background:var(--card-hover)"><td><strong>MUSE-VL</strong></td><td><strong>24M</strong></td><td><strong>1×</strong></td></tr>
      </tbody>
    </table>
  </div>

  <h3>4. 视觉生成——超越 SD-XL</h3>

  <div class="table-wrap">
    <table>
      <thead><tr><th>方法</th><th>分辨率</th><th>MJHQ-30K FID↓</th><th>GenEval</th></tr></thead>
      <tbody>
        <tr><td>SD-XL（专用生成）</td><td>1024</td><td>9.55</td><td>0.55</td></tr>
        <tr><td>PixArt-α（专用生成）</td><td>512</td><td>6.14</td><td>0.48</td></tr>
        <tr><td>Janus</td><td>384</td><td>10.10</td><td>0.61</td></tr>
        <tr><td>Show-o</td><td>256</td><td>15.18</td><td>0.53</td></tr>
        <tr style="background:var(--card-hover)"><td><strong>MUSE-VL-7B</strong></td><td><strong>256</strong></td><td><strong>7.73</strong></td><td><strong>0.53 (0.57†)</strong></td></tr>
      </tbody>
    </table>
  </div>

  <p>MUSE-VL FID 7.73 <strong>超越所有统一模型和 SD-XL</strong>，接近专用生成模型 PixArt-α（6.14）。† 表示使用 DALL-E 3 风格 prompt 重写。</p>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-tab5-t2i.png" alt="文生图 benchmark 对比" loading="lazy">
    <div class="cap">论文 Table 5：文生图 benchmark 对比。MUSE-VL 在 FID 和 GenEval 上均优于其他统一模型。</div>
  </div>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-fig4-generation.png" alt="MUSE-VL 生成示例" loading="lazy">
    <div class="cap">图4：MUSE-VL 文生图示例。256 分辨率下生成质量已超越 SD-XL。</div>
  </div>
</div>

<!-- ============================================================ -->
<!-- Section 7: 消融实验 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">七、消融实验——为什么每个组件都不可或缺</div>

  <h3>语义分支 vs 图像分支</h3>
  <p>这是最有说服力的消融实验，直接回答了"语义分支到底有多大用"：</p>

  <div class="table-wrap">
    <table>
      <thead><tr><th>配置</th><th>Image Branch</th><th>Semantic Branch</th><th>rFID↓</th><th>MMBench</th><th>SEED</th><th>MMStar</th><th>AVG</th></tr></thead>
      <tbody>
        <tr><td>仅图像重建</td><td>✓</td><td>✗</td><td>2.63</td><td>42.8</td><td>48.5</td><td>38.1</td><td>43.1</td></tr>
        <tr><td>仅语义重建</td><td>✗</td><td>✓</td><td>—</td><td>72.5</td><td>67.5</td><td>48.1</td><td>62.7</td></tr>
        <tr style="background:var(--card-hover)"><td><strong>完整 SDE</strong></td><td><strong>✓</strong></td><td><strong>✓</strong></td><td><strong>2.26</strong></td><td><strong>72.1</strong></td><td><strong>69.1</strong></td><td><strong>49.6</strong></td><td><strong>63.6</strong></td></tr>
      </tbody>
    </table>
  </div>

  <div class="callout">
    <h3>📊 关键发现</h3>
    <ul>
      <li>去掉语义分支：AVG 从 63.6 暴跌至 43.1（<strong>-20.5%</strong>），rFID 从 2.26 升至 2.63</li>
      <li>去掉图像分支：理解能力几乎不降（62.7 vs 63.6），但<strong>完全丧失图像重建/生成能力</strong></li>
      <li>结论：<strong>语义分支是理解性能的核心决定因素</strong>，图像分支负责维持生成能力</li>
    </ul>
  </div>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-tab6-ablation.png" alt="消融实验结果" loading="lazy">
    <div class="cap">论文 Table 6：语义分支 vs 图像分支消融实验。完整 SDE 在理解和重建质量上均取得最优平衡。</div>
  </div>

  <h3>LLM 和分辨率消融</h3>

  <div class="table-wrap">
    <table>
      <thead><tr><th>LLM</th><th>分辨率</th><th>MMBench</th><th>SEED</th><th>MMStar</th><th>AVG</th></tr></thead>
      <tbody>
        <tr><td>Yi-1.5-9B</td><td>256</td><td>70.6</td><td>66.1</td><td>43.8</td><td>60.2</td></tr>
        <tr><td>Yi-1.5-9B</td><td>384</td><td>73.2</td><td>69.2</td><td>47.4</td><td>63.3</td></tr>
        <tr><td>Yi-1.5-34B</td><td>256</td><td>73.5</td><td>67.3</td><td>48.9</td><td>63.2</td></tr>
        <tr><td>Qwen-2.5-7B</td><td>256</td><td>71.0</td><td>65.8</td><td>44.2</td><td>60.3</td></tr>
        <tr><td>Qwen-2.5-32B</td><td>256</td><td>75.1</td><td>65.7</td><td>50.3</td><td>63.7</td></tr>
      </tbody>
    </table>
  </div>

  <p>更高分辨率带来全面提升（384 vs 256: <strong>+3.1 AVG</strong>），更大模型一致更好，验证了 scale-up 的有效性。Qwen-2.5 整体优于同参数量 Yi-1.5。</p>
</div>

<!-- ============================================================ -->
<!-- Section 8: 语义编码可视化 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">八、语义编码可视化——离散 token 真的学到了语义</div>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-fig5-semantic.png" alt="语义离散编码可视化" loading="lazy">
    <div class="cap">图5：语义离散编码可视化。相同颜色的矩形框表示具有相同语义 ID 的图像块——SDE 自动将"猫耳朵"、"草莓"等语义概念映射到相同的离散 code。</div>
  </div>

  <p>这是最有说服力的定性证据：SDE 的离散 code 能<strong>自动对应语义概念</strong>。没有显式的语义标签监督，仅通过冻结 SigLIP 的语义特征引导量化过程，离散 token 就能自然地组织成语义一致的簇。</p>

  <div class="photo">
    <img src="assets/media/images/muse-vl/muse-vl-fig6-reconstruction.png" alt="图像重建质量对比" loading="lazy">
    <div class="cap">图6：SDE 与其他方法的图像重建质量对比。SDE 在保留语义信息的同时维持了高保真重建。</div>
  </div>
</div>

<!-- ============================================================ -->
<!-- Section 9: 与其他统一模型对比 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">九、统一模型全景对比</div>

  <div class="table-wrap">
    <table>
      <thead><tr><th>方法</th><th>视觉表示</th><th>对齐策略</th><th>训练数据</th><th>局限</th></tr></thead>
      <tbody>
        <tr><td>Chameleon</td><td>离散 VQ</td><td>从头训练 LLM</td><td>1.4B</td><td>无语义，理解极差</td></tr>
        <tr><td>Emu3</td><td>离散 VQ</td><td>从头训练 LLM</td><td>未公开</td><td>需分别微调理解和生成</td></tr>
        <tr><td>Janus</td><td>离散+连续双编码器</td><td>解耦编码</td><td>65M</td><td>双编码器增加复杂度</td></tr>
        <tr><td>VILA-U</td><td>离散 VQ</td><td>对比学习+重建</td><td>720M</td><td>损失冲突，收敛困难</td></tr>
        <tr><td>TokenFlow</td><td>离散双 codebook</td><td>解耦语义与像素</td><td>未公开</td><td>双 codebook 架构复杂</td></tr>
        <tr><td>Show-o</td><td>离散 VQ</td><td>从头训练</td><td>35M</td><td>小模型理解受限</td></tr>
        <tr style="background:var(--card-hover)"><td><strong>MUSE-VL</strong></td><td><strong>离散 SDE</strong></td><td><strong>语义特征融合</strong></td><td><strong>24M</strong></td><td><strong>数据效率最高</strong></td></tr>
      </tbody>
    </table>
  </div>

  <p>MUSE-VL 的独特之处：<strong>不需要双编码器或双 codebook</strong>，也不需要对比学习的文本编码器，仅通过在量化前将冻结 SigLIP 语义特征与图像特征<strong>相加</strong>即可实现语义对齐。架构最简，效果最优。</p>
</div>

<!-- ============================================================ -->
<!-- Section 10: 局限与未来 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">十、局限性与未来方向</div>

  <h3>当前局限</h3>
  <div class="card-grid">
    <div class="card">
      <h3>🖼️ 生成质量未达 SOTA 扩散模型</h3>
      <p>训练数据规模和生成分辨率受限，FID 7.73 虽超越 SD-XL 但不及 PixArt-α（6.14）。</p>
    </div>
    <div class="card">
      <h3>🔍 高分辨率输入受限</h3>
      <p>256 分辨率 TextVQA 仅 52.8%，384 为 61.3%，均低于 EMU3 的 64.7（1024 分辨率）。OCR 任务是短板。</p>
    </div>
    <div class="card">
      <h3>📊 计算成本未公开</h3>
      <p>GPU 数量、训练时间、FLOPs 等关键信息原文未明确给出，难以评估实际训练代价。</p>
    </div>
  </div>

  <h3>未来方向</h3>
  <ul>
    <li><strong>扩大视觉生成训练数据</strong>——当前 24M 数据主要用于理解，生成数据可能不足</li>
    <li><strong>更强大的图像编码器</strong>——使用 VAR 的多尺度量化或 InternViT</li>
    <li><strong>AR 与 Diffusion 原生集成</strong>——结合两种范式的优势</li>
    <li><strong>加入交错图文数据</strong>——提升多图理解和 in-context learning 能力</li>
  </ul>
</div>

<!-- ============================================================ -->
<!-- Section 11: 收获与启示 -->
<!-- ============================================================ -->
<div class="section fade-in">
  <div class="section-title">十一、收获与可迁移的启示</div>

  <div class="callout">
    <h3>🧠 SDE 设计思路的可迁移性</h3>
    <p>核心洞察——<strong>"不要从头学语义，从预训练模型蒸馏"</strong>——具有广泛的可迁移性：</p>
    <ol>
      <li><strong>利用已有对齐空间</strong>：SigLIP 已在海量图文对上将视觉特征与语言对齐，直接用其输出作为语义锚点比从头学习高效得多</li>
      <li><strong>冻结教师 + 简单融合</strong>：冻结 SigLIP + 加法融合，避免对比学习的损失冲突（VILA-U 的痛点）</li>
      <li><strong>间接语义约束</strong>：通过语义解码器 + 余弦相似度损失间接约束，比直接对比学习更稳定</li>
    </ol>
    <p>这个思路可推广到<strong>任何需要将连续特征离散化且保留语义的场景</strong>——音频 tokenizer、视频 tokenizer、甚至 3D 点云 tokenizer。</p>
  </div>

  <div class="info-box">
    <h3>🎯 数据效率的启示</h3>
    <p>MUSE-VL 用 1/58 的数据超越 Chameleon，说明当视觉 token 的表征质量足够高（语义对齐），LLM 对视觉-语言映射的学习效率会<strong>大幅提升</strong>。<strong>瓶颈不在 LLM 的学习能力，而在 tokenizer 的表征质量。</strong></p>
  </div>
</div>

<div class="divider">⁂ ⁂ ⁂</div>

<div class="meta">
  <span>论文：arXiv:2411.17762</span>
  <span>机构：ByteDance</span>
  <span>笔记日期：2026-05-14</span>
</div>