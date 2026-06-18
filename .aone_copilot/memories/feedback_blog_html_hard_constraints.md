---
name: 博客 HTML 写作硬约束
description: display math 禁止包在 <p> 内、小节标题必须带 class、sources 必须有 data-cite-key，防止页面渲染异常与引用联动失效
type: feedback
createdAt: 2026-06-03T12:57:58
---

博客 HTML 写作必须遵守三条硬约束：
1. **display math 禁止包在 `<p>` 内**：`$$...$$` 和 `\[...\]` 必须独占一行，前后不留 `<p>` 标签。不要写 `<p>$$...$$</p>` 或 `<p style="text-align:center">$$...$$</p>`。
2. **正文小节标题必须带标准 class**：二级小节用 `<h3 class="section-title">`，三级小节用 `<h4 class="ch-section">`。裸 `<h3>` / `<h4>` 不会加入 TOC、样式丢失。例外：`.info-box` / `.def-box` / `.theorem-box` / `.example-box` / `.sources` 内部标题不需要加 class。
3. **`.sources li` 必须有 `data-cite-key`**：每个参考来源条目必须带 `data-cite-key` 属性（值为 `#key#` 经 slugifyKey 转换的结果），且内含 `<a href target="_blank">` 链接。裸 `<li><a>...</a></li>` 会破坏 citation.js 联动。

**Why:** `cp-ch05-baseband.html` 曾因上述三类问题导致 MathJax 渲染异常、TOC 层级错乱、引用 hover 显示"未找到原始链接"。构建器虽有容错（如吸收 `<p>`），但在复杂结构下不可靠。

**How to apply:** 
- 写新文章时直接遵守这三条，不要依赖构建器容错
- 发布前质量闸门已包含这三项检查（html-blog SKILL.md §0）
- 模板已同步修正，capture.js 生成的骨架不会再包含错误示例
