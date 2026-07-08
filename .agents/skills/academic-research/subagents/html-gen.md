# HTML Generation Subagent

## 任务

基于 Phase 3 的单一 `survey-spine`、paper/reference packets 和原始来源指针，生成结构化 survey HTML 片段或骨架。

## 输入

- `Survey spine`: `~/Org/roam/note/<topic>/survey-spine.md` 或 `phase3-survey-reorganization.org`
- `Paper/reference packets`: `~/gongshangzheng.github.io/raw/<slug>/synthesis.md`、`survey-ledger`、原始 source/HTML/PDF 指针
- `HTML 输出`: `~/gongshangzheng.github.io/src/pages/<slug>.html`
- `图片输出`: `~/gongshangzheng.github.io/media/images/<slug>/`

## 要求

1. **创建文件（必须用 capture.js）**：
   ```bash
   node ~/.agents/skills/html-blog/capture.js <slug> [--notify]
   ```
   > ⚠️ 禁止手动 cp article-template.html，capture.js 自动注入 `created_at` / `updated_at` 时间戳。
2. **边界**: 本 subagent 不得独立决定最终主线，不得整篇外包生成后交付；只能按主 agent 给定的 `survey-spine` 生成局部 HTML 或初稿骨架。
3. **Survey 结构**: 必须保留问题定义、任务 taxonomy、技术路线 taxonomy、方法矩阵、时间线、开放问题和证据账本入口；不得把论文摘要逐篇排列成章节。
4. **标题层级**: 最终 HTML 必须有清晰层级，至少包含 `<h2>`/主章节、`<h3 class="section-title">`/二级小节、`<h4 class="ch-section">`/三级说明标题或等价组件；禁止全篇平铺同一层级标题。
5. **由浅入深**: 开头必须先解释领域建模问题、输入输出、约束和术语，再进入方法路线。
6. **字数门槛**: 生成后必须统计正文中文字符数/英文 token 量，满足 Phase 4 的最低字数与分章节字数要求；不足时不得交付。
7. **表格**: 方法对比用 `<table>` + `.table-wrap`，必须比较表示、驱动信号、训练数据、输出形式、实时性、可控性和指标。
6. **时间线**: 用 `.timeline` / `.timeline-item`，每阶段必须说明领域共识或瓶颈如何变化。
7. **发现**: 关键发现用 `.callout`（金色），每条必须有来源指针或引用。
8. **图片**: 不编造图片文件名。

## 图片处理（必须执行）

配图优先级：用户截图 > arXiv source 原图 > arXiv/官方 HTML 原图 > 官方项目页/GitHub repo 图 > 高 DPI PDF 裁图 > mermaid/jsxgraph > 网络搜图。AI 生图完全禁止。Docling referenced 图片只用于定位，不得作为最终配图。

### 图片提取流程

1. **用户截图**：最高优先级，用户已有的截图、标注图
2. **arXiv HTML 版本**：访问 `https://arxiv.org/html/<arxiv_id>`，获取高清矢量图
3. **Docling PDF 提取**：从 PDF 中提取 figure（非整页截图）。禁止 docpage/dcoref
4. **GitHub repo**：README/docs/assets/images 中的官方图
5. **代码绘制**：mermaid/jsxgraph 用于架构图、流程图
6. **网络搜图**：较少使用，必须本地化并标注



当论文原图无法直接提取时：
- 用 `blog-images` skill 搜索论文官方项目页图、GitHub README 图
- 从博客转载中获取论文架构图

### 代码绘制（第三优先级）

当代码绘制的图能比论文原图更清晰地表达核心思想时使用：
- **架构/流程图**：用 `{{< mermaid >}}` shortcode
- **数学/函数图**：用 `{{< jsxgraph >}}` shortcode
- 使用场景：多论文架构对比图、简化版方法流程图

### 图片规范

- 复制到 `media/images/<slug>/`
- 在 HTML 中插入关键图片（至少 3 张）
- 每篇 `must-read-paper` 至少应有 1 张核心图片进入最终 survey；图片必须服务于方法结构、任务定义、结果对比或路线差异，而不是装饰图
- 如果某篇 `must-read-paper` 无可用论文原图，必须使用官方项目页/仓库图，仍不可用时用 mermaid/jsxgraph 画结构图，并在 caption 中说明替代原因
- 使用 `.photo` + `.cap` 组件：
  ```html
  <div class="photo">
    <img src="media/images/<slug>/<filename>" alt="描述" loading="lazy">
    <div class="cap">图 N：图片描述（来源：论文名, Fig.N / 官方项目页）</div>
  </div>
  ```
- 优先使用 Survey 中的核心框架图
- 图片命名：语义化文件名（如 `fig1-overview.png`）

## 参考来源格式（必须）

每篇文章末尾使用 `.sources` 组件：

```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li><a href="https://..." target="_blank">来源名称</a></li>
    <li><a href="https://..." target="_blank">来源名称 — 补充说明</a></li>
  </ul>
</div>
```

**禁止**使用裸 `<ul><li>URL</li></ul>` 或普通 section 下的裸列表。
参考 `html-blog` SKILL §2.9 或 `src/pages/liang-dynasty.html` 的实际产出。

## 数学公式格式（可选）

如文章涉及数学公式，在 frontmatter 中声明 `mathjax: true`：

- **行内公式**：`$...$`（如 `$O(T\epsilon^2)$`）
- **独立公式**：`\[...\]`（如 `\[\mathcal{L} = \alpha \cdot KL(p|q)\]`）

构建时自动包装：行内 → `<span class="math-inline"><ila>裸公式</ila></span>`；
独立 → `<div class="math-block"><ila>裸公式</ila></div>`。
`.math-block` 宽度受 `.wrap` 约束，可左右滑动。

## 引用语法

引用使用 `$key$`（如 `$Hinton et al., 2015$`、`$KL Divergence$`），构建时转换为 `<cite>$key$</cite>`。
纯数学符号（如 `$T^2$`、`$KL(p|q)$`）无空格，自动识别为行内公式，不产生引用标签。

## 参考

参考 `html-blog` SKILL 的组件规范，以及 `src/pages/article-template.html`。