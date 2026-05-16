---
title: MAETok — 掩码自编码器是扩散模型的有效 Tokenizer
description: 用掩码建模让 AE 学习判别性潜空间，替代 VAE，仅 128 token 达到 SOTA 生成质量
date: 2026-05-16
tags: [MAETok, Tokenizer, 扩散模型]
categories: [AI]
page_style: |
  .hero { height: 55vh; }
hero_title: Masked Autoencoders Are Effective Tokenizers for Diffusion Models
hero_sub: ICML 2025 · CVPR 2022 MAE × 潜扩散模型
hero_tagline: 用掩码建模让 AE 学习判别性潜空间，替代 VAE，仅 128 token 达到 SOTA 生成质量
---

<div class="stats">
  <div><div class="n">1.69</div><div class="l g">gFID (512×512)</div></div>
  <div><div class="n">128</div><div class="l">token 数</div></div>
  <div><div class="n b">76×</div><div class="l">训练加速</div></div>
  <div><div class="n">31×</div><div class="l b">推理吞吐提升</div></div>
  <div><div class="n g">675M</div><div class="l">生成模型参数</div></div>
</div>

<!-- 图1: 主结果 -->
  <div class="section fade-in">
    <div class="section-title">核心发现：更少 GMM 模式 → 更好的生成</div>
    <p>论文证明：潜空间的 GMM 模式数越少，扩散模型学习越容易。在有限训练样本下，更多的 GMM 模式（VAE/AE）产生更差的生成质量。</p>
    <div class="photo">
      <img src="assets/media/images/maetok/maetok-gmm-loss.png" alt="GMM 模式数与扩散损失关系" width="1080" loading="lazy">
      <div class="cap">Fig.2: GMM 模式数越少，扩散损失越低（训练越容易）。AE 模式数最多→损失最高；MAETok 模式数最少→损失最低。</div>
    </div>
  </div>

  <!-- 图2: 方法 -->
  <div class="section fade-in">
    <div class="section-title">MAETok 方法：掩码建模 + 1D AE</div>
    <p>核心设计：ViT 编码器 + ViT 解码器，编码器侧随机掩码 40-60% 的图像 patch，用可学习潜 token 聚合全局信息，辅助浅解码器预测 HOG / DINOv2 / SigCLIP 特征。</p>
    <div class="photo">
      <img src="assets/media/images/maetok/maetok-architecture.png" alt="MAETok 架构图" width="1080" loading="lazy">
      <div class="cap">Fig.3: MAETok 整体架构。编码器随机掩码图像 patch token，通过可学习潜 token 聚合信息；辅助解码器预测多目标语义特征。</div>
    </div>
  </div>

  <!-- 关键洞察 -->
  <div class="section fade-in">
    <div class="section-title">核心洞察：编码器-解码器解耦效应</div>
    <div class="callout">
      <p>高掩码比率会降低像素级重建质量（rFID 下降），但能改善生成质量（gFID 下降）。通过冻结编码器 + 微调解码器，可以在不牺牲潜空间判别性的前提下恢复重建保真度。</p>
    </div>
    <div class="info-box">
      <p><strong>定理 2.1</strong>（GMM 样本复杂度）：DDPM 达到 \(O(T\epsilon^2)\) 生成误差所需的样本数为：</p>
      <p style="text-align:center; font-size:1.1rem; margin-top:0.5rem;">\(n' = \Theta\!\left(\frac{K^4 d^5 B^6}{\epsilon^2}\right)\)</p>
      <p style="font-size:0.85rem; margin-top:0.5rem;">其中 \(K\) 是 GMM 模式数，\(d\) 是维度，\(B\) 是均值范数上界。<strong>关键的 \(O(K^4)\) 关系</strong>意味着减少模式数可指数级降低训练难度。</p>
    </div>
  </div>

  <!-- 消融实验 -->
  <div class="section fade-in">
    <div class="section-title">消融实验：掩码建模效果最显著</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>配置</th><th>rFID ↓</th><th>gFID ↓</th></tr></thead>
        <tbody>
          <tr><td>VAE（基线）</td><td>1.22</td><td>22.17</td></tr>
          <tr><td>VAE + 掩码建模</td><td>1.75</td><td>18.17</td></tr>
          <tr><td>AE（基线）</td><td>0.67</td><td>24.47</td></tr>
          <tr><td>AE + 掩码建模</td><td>0.85</td><td style="color:var(--accent-gold)">5.78</td></tr>
          <tr><td>AE + MM + 解码器微调</td><td style="color:var(--accent-gold)">0.48</td><td style="color:var(--accent-gold)">5.69</td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:0.8rem; font-size:0.85rem;">AE + 掩码建模使 gFID 从 24.47 降至 5.78（<strong>降低 76%</strong>），而 VAE + MM 仅从 22.17 降至 18.17。KL 约束阻碍了潜空间学习。</p>
  </div>

  <!-- 深度消融 -->
  <div class="section fade-in">
    <div class="section-title">辅助解码器深度：3 层最优</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Aux. Decoder 深度</th><th>rFID ↓</th><th>gFID ↓</th></tr></thead>
        <tbody>
          <tr><td>线性层</td><td>1.35</td><td>6.98</td></tr>
          <tr><td style="background: var(--card-hover)"><strong>3 层（默认）</strong></td><td style="background: var(--card-hover)"><strong>0.85</strong></td><td style="background: var(--card-hover)"><strong>5.78</strong></td></tr>
          <tr><td>12 层</td><td>0.96</td><td>8.80</td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:0.8rem; font-size:0.85rem;">过浅（1层）：高层语义与低级细节混淆 → rFID 差。<br>过深（12层）：容量过强，削弱 AE 的判别性潜空间 → gFID 差。<strong>3 层是最佳平衡点。</strong></p>
  </div>

  <!-- 对比结果 -->
  <div class="section fade-in">
    <div class="section-title">ImageNet 256×256 生成对比</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>模型</th><th>Tokenizer</th><th>参数量</th><th>Token 数</th><th>rFID ↓</th><th>gFID (无CFG)</th><th>gFID (有CFG)</th></tr></thead>
        <tbody>
          <tr><td><strong>MAETok + SiT-XL</strong></td><td>AE</td><td>675M</td><td>128</td><td>—</td><td style="color:var(--accent-gold)">2.31</td><td style="color:var(--accent-gold)">1.67</td></tr>
          <tr><td><strong>MAETok + LightningDiT</strong></td><td>AE</td><td>675M</td><td>128</td><td>—</td><td style="color:var(--accent-gold)">2.21</td><td style="color:var(--accent-gold)">1.73</td></tr>
          <tr><td>REPA + SiT-XL</td><td>KL</td><td>—</td><td>256</td><td>5.90</td><td>—</td><td>1.42</td></tr>
          <tr><td>LightningDiT</td><td>KL</td><td>675M</td><td>256</td><td>0.28</td><td>2.17</td><td>1.35</td></tr>
          <tr><td>DiT-XL/2</td><td>—</td><td>675M</td><td>—</td><td>—</td><td>9.62</td><td>2.27</td></tr>
          <tr><td>LDM-4</td><td>KL</td><td>—</td><td>4096</td><td>0.27</td><td>10.56</td><td>3.60</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 512结果 -->
  <div class="section fade-in">
    <div class="section-title">ImageNet 512×512 生成结果（SOTA）</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>模型</th><th>Token 数</th><th>gFID (无CFG)</th><th>gFID (有CFG)</th><th>IS (有CFG) ↑</th></tr></thead>
        <tbody>
          <tr><td><strong>MAETok + SiT-XL</strong></td><td>128</td><td>2.79</td><td style="color:var(--accent-gold)">1.69</td><td style="color:var(--accent-gold)">304.2</td></tr>
          <tr><td><strong>MAETok + LightningDiT</strong></td><td>128</td><td>2.56</td><td>1.72</td><td>307.3</td></tr>
          <tr><td><strong>MAETok + USiT-2B</strong></td><td>128</td><td style="color:var(--accent-gold)">1.72</td><td style="color:var(--accent-gold)">1.65</td><td style="color:var(--accent-gold)">312.5</td></tr>
          <tr><td>USiT-2B（原文）</td><td>256</td><td>2.90</td><td>1.72</td><td>—</td></tr>
          <tr><td>MAR-H (943M)</td><td>1024</td><td>2.74</td><td>1.73</td><td>279.9</td></tr>
          <tr><td>DiT-XL/2</td><td>—</td><td>9.62</td><td>3.04</td><td>240.8</td></tr>
        </tbody>
      </table>
    </div>
    <div class="callout">
      <p><strong>MAETok + SiT-XL 仅用 128 token 超越 2B 参数 USiT（256 token）和 943M MAR-H（1024 token）。</strong>在 CFG 条件下达到 gFID 1.69，IS 304.2，为当前 SOTA。</p>
    </div>
  </div>

  <!-- 图5: UMAP -->
  <div class="section fade-in">
    <div class="section-title">潜空间可视化</div>
    <div class="photo">
      <img src="assets/media/images/maetok/maetok-umap.png" alt="潜空间 UMAP 可视化" width="1080" loading="lazy">
      <div class="cap">Fig.5: UMAP 可视化。MAETok 的潜空间（左→右：AE / VAE / MAETok）随颜色（类别）分离程度递增，判别性最强。</div>
    </div>
  </div>

  <!-- 结论 -->
  <div class="section fade-in">
    <div class="section-title">结论与启示</div>
    <div class="icon-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top:1rem;">
      <div class="card fade-in">
        <div class="icon">🔑</div>
        <div class="title">潜空间结构 > 变分约束</div>
        <div class="desc">VAE 的 KL 约束不是必要条件。掩码建模让纯 AE 自主学习判别性潜空间即可。</div>
      </div>
      <div class="card fade-in">
        <div class="icon">⚡</div>
        <div class="title">128 token 极致压缩</div>
        <div class="desc">仅 128 个潜 token 实现超越 256-1024 token 的生成质量，为实时高分辨率生成铺路。</div>
      </div>
      <div class="card fade-in">
        <div class="icon">🧠</div>
        <div class="title">编码器-解码器解耦</div>
        <div class="desc">先优化潜空间（高掩码），再恢复重建（微调解码器），两阶段训练策略有效。</div>
      </div>
      <div class="card fade-in">
        <div class="icon">📊</div>
        <div class="title">GMM 模式数是质量指标</div>
        <div class="desc">可作为评估任意 tokenizer 潜空间质量的代理指标，衡量生成模型学习难度。</div>
      </div>
    </div>
  </div>

  <!-- 相关资源 -->
  <div class="section fade-in">
    <div class="section-title">相关资源</div>
    <div class="meta" style="margin-top:0.5rem;">
      <span>📄 <a href="https://arxiv.org/abs/2502.03444" target="_blank">arXiv 2502.03444</a></span>
      <span>🔗 <a href="https://github.com/Hhhhhhao/continuous_tokenizer" target="_blank">GitHub (官方代码)</a></span>
      <span>📝 <a href="/articles/masked-autoencoders-are-effective-tokenizers-for-diffusion-models/">📝 阅读 org 笔记版</a></span>
    </div>
  </div>