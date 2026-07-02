# HTML 组件速查

> 本文档由 html-blog SKILL.md 拆分而来。写正文时按需读取。
> 所有语法基于 build.js 管线的实际实现，与代码一一对应。

## ⚠️ LaTeX 公式自检规则（每次写完公式必须检查）

> **违反这些规则会导致 MathJax 渲染失败，用户看到的是原始 LaTeX 源码。**

1. **所有公式必须用界定符包裹**：
   - 行内公式：`$...$`
   - 独立公式：`\[...\]`
   - **禁止裸写 `\begin{align*}`**——必须包在 `\[...\]` 里：`\[\begin{aligned}...\end{aligned}\]`
   - 用 `aligned` 而非 `align*`（MathJax 的 `aligned` 更安全）

2. **禁止使用不存在的 LaTeX 命令**：
   - ❌ `\circledplus` → ✅ `\oplus`
   - ❌ `\circledcirc` → ✅ `\ocirc` 或直接不用
   - ❌ `\wr` 用于标注乘法 → 用文字描述或表格代替
   - 不确定某个命令是否存在时，用简单命令替代或用文字描述

3. **公式写完后 mental check**：
   - 这个命令在 MathJax/LaTeX 中真的存在吗？
   - 所有 `\begin` 都有对应的 `\end` 吗？
   - 所有公式都用了 `$...$` 或 `\[...\]` 包裹吗？

---

## 布局组件

### Stats 数字条

```html
<div class="stats">
  <div class="stat"><span class="num">54</span><span class="label">国祚（年）</span></div>
  <div class="stat"><span class="num b">126</span><span class="label g">代天皇</span></div>
</div>
```
颜色：`.num.b` 蓝色 / `.num.g` 金色 / `.label.g` / `.label.b`

> Stats div 会被自动提取到 hero 和正文之间（`extractFirstDiv`），不需要手动放置。

### 章节叙事（`.ch`）

```html
<div class="ch fade-in">
  <div class="ch-label">第一幕 · 万年黎明</div>
  <div class="ch-title">章节标题</div>
  <div class="ch-date">时间范围</div>
  <p>叙事正文...</p>
</div>
```

- `.ch-title` 自动加入 TOC 目录（level 2），自动注入锚点 ID
- 小节标题使用 `h3.section-title`（TOC level 3），小节内部子标题使用 `h4.ch-section`（TOC level 4）
- 标题文字里的编号（如 `5.1`、`5.1.1`）不会决定 TOC 层级；TOC 只依据 HTML 标签和 class 判断层级
- `fade-in` 可省略，构建系统会自动补全

> ⚠️ **标签闭合警告**：每个 `<div class="ch fade-in">` 必须在章节末尾有**且仅有 1 个**对应的 `</div>`。如果章节内含 `.photo`、`.callout` 等子 div，它们的 `</div>` 不算作 `ch` 的闭合。常见错误：含 `.photo` 的章节末尾多写了一个 `</div>`，导致后续内容溢出 `main-wrapper`。
>
> ```html
> <!-- ❌ 错误：photo 关闭后多了一个 </div> -->
> <div class="ch fade-in">
>   <p>...</p>
>   <div class="photo">...</div>   <!-- photo 关闭 -->
> </div>                           <!-- ch 关闭 ✓ -->
>   <p>这段掉在外面了</p>
> </div>                           <!-- ❌ 多余！ -->
>
> <!-- ✅ 正确：所有内容在 ch 内部 -->
> <div class="ch fade-in">
>   <p>...</p>
>   <div class="photo">...</div>
>   <p>后续段落也在 ch 内</p>
> </div>                           <!-- ch 关闭 ✓ -->
> ```

### ⚠️ 标题层级规范（必须遵守）

> **这是强制规则，违反会导致 TOC 目录层级跳跃、SEO 降权、无障碍阅读器混乱。**

#### 例题组织原则（必须遵守）

> **每个 level-2 章（`ch fade-in`）内的所有例题必须统一收入该章末尾的 `<h3 class="section-title">例题区</h3>` 下，禁止散落在正文各处。**

散落例题的问题：
1. 打断正文的叙述节奏——读者跟着概念推导走，突然被一道完整例题截断
2. 页面纵向过长——例题通常占 10-20 行，三道例题就占半个屏幕
3. 考前复习时难以快速翻阅所有例题

#### 例题区 + 可折叠 Tabs（推荐模式）

当一章有 ≥2 道例题时，使用 `code-tabs` + `collapsible` + `example-tabs` 三个 class 的组合：

```html
<h3 class="section-title">例题区</h3>

<div class="code-tabs collapsible example-tabs">
  <div class="code-tabs-header">
    <button class="code-tab-btn active" data-tab="ex1">例题 1：简短标题</button>
    <button class="code-tab-btn" data-tab="ex2">例题 2：简短标题</button>
    <button class="code-tab-btn" data-tab="ex3">例题 3：简短标题</button>
  </div>
  <div class="code-tab-content active" data-panel="ex1">
    <div class="example-box">
      <h3>例题 1：简短标题</h3>
      <p>题目、推导、答案、易错点……</p>
    </div>
  </div>
  <div class="code-tab-content" data-panel="ex2">
    <div class="example-box">
      <h3>例题 2：简短标题</h3>
      <p>……</p>
    </div>
  </div>
  <div class="code-tab-content" data-panel="ex3">
    <div class="example-box">
      <h3>例题 3：简短标题</h3>
      <p>……</p>
    </div>
  </div>
</div>
```

**可折叠模式行为**：
- 点击 tab 标题 → 展开该例题内容
- 再次点击 active tab → 收起内容（回到“点击标题展开内容”提示）
- 默认第一道例题展开（第一个 tab 带 `active`）

**单个例题时**：直接用 `<div class="example-box">`，不需要 tabs。

**code-tabs 也可用 collapsible**：给任何 `.code-tabs` 容器加上 `collapsible` class 即可启用折叠模式。

博客使用三级标题体系，与 TOC 目录系统一一对应：

| 层级 | HTML 写法 | TOC level | 用途 | 示例 |
|------|----------|-----------|------|------|
| **章** | `<div class="ch-title">` | 2 | 大章节（Part / 第X章） | `Part 5 · FFT` |
| **节** | `<h3 class="section-title">` | 3 | 编号小节（X.Y） | `5.1 直接计算 DFT 的运算量` |
| **小节** | `<h4 class="ch-section">` | 4 | 编号子小节（X.Y.Z） | `5.3.1 分解推导` |

**规则：**
1. **禁止跳级**：`h4` 必须在 `h3` 之下，`h3` 必须在 `ch-title`（level 2）之下。
2. **编号不决定层级**：TOC 只依据 HTML 标签和 class 判断层级。`5.1` 可以是 `h3`，`5.3.1` 是 `h4`。
3. **X.Y 级别用 `h3`**：如 `5.1`、`5.2`、`5.3` 等一级编号小节用 `<h3 class="section-title">`。
4. **X.Y.Z 级别用 `h4`**：如 `5.3.1`、`5.3.2` 等二级编号子小节用 `<h4 class="ch-section">` 或直接 `<h4>`。
5. **组件内标题不算**：`example-box`、`def-box`、`theorem-box` 等容器内部的 `<h3>` 不进入 TOC，不影响层级。

```html
<!-- ✅ 正确：ch-title → h3 → h4，逐级递进 -->
<div class="ch fade-in">
  <div class="ch-label">Part 5</div>
  <div class="ch-title">FFT</div>

  <h3 class="section-title">5.1 直接计算 DFT 的运算量</h3>
  <p>...</p>

  <h3 class="section-title">5.3 按时间抽取（DIT）基 2 FFT</h3>
  <h4>5.3.1 分解推导</h4>
  <p>...</p>
  <h4>5.3.2 蝶形运算</h4>
  <p>...</p>
</div>

<!-- ❌ 错误：跳过 h3，直接用 h4 -->
<div class="ch fade-in">
  <div class="ch-title">FFT</div>
  <h4>5.1 直接计算 DFT 的运算量</h4>  <!-- 跳级！应为 h3 -->
  <h4>5.2 减少运算量的途径</h4>         <!-- 跳级！应为 h3 -->
</div>
```

### 传统分节（`.section`）

```html
<div class="section fade-in">
  <div class="section-title">核心问题</div>
  <p>正文内容...</p>
</div>
```

- `<h2>` ~ `<h6>` 带内联文本也会加入 TOC（按标签级别）
- info-box / callout / admonition 内部的标题不会加入 TOC

### 正文容器（`.wrap`）

```html
<div class="wrap">
  <!-- 正文内容 -->
</div>
```
最大宽度 800px。如果文章已有 `.wrap`，构建系统会复用而不是嵌套。

---

## 段落语法（`<p>` 标签）

> **`<p>` 标签可选**：构建系统会自动为 `.html` 源文件中的裸文本行补上 `<p>` 标签，因此写作时无需手动包裹。
> 已有的 `<p>` 不会重复包裹。以下内容不受自动包裹影响：
>
> - 以 `<` 开头的行（HTML 标签，如 `<div>`、`<p>`、`<h3>`）
> - 以 `{{` 开头的行（Shortcode，如 `{{< docpage >}}`）
> - `<pre>`、`<script>`、`<style>`、`<table>` 内部的内容
> - `\[...\]` 和 `$$...$$` display math 块内部
>
> **推荐写法**：直接写裸文本，省去每行 `<p>` 包裹：
>
> ```html
> <div class="ch fade-in">
>   <div class="ch-label">Part 1</div>
>   <div class="ch-title">章节标题</div>
>   这里是正文段落，不需要手动加 <p> 标签。
>   第二段也是裸文本，构建时自动补 <p>。
>   <div class="info-box">...</div>   <!-- HTML 标签不会被包裹 -->
>   {{< mermaid >}}graph TD...{{< /mermaid >}}  <!-- shortcode 也不会 -->
> </div>
> ```
>
> 如果需要 `<p>` 上的属性（如 `style="text-align:center"`），则必须手动写 `<p>`。

---

## 内容组件

### 图片

```html
<div class="photo">
  <img src="media/images/xxx.webp" alt="描述" loading="lazy">
  <div class="cap">图片说明（来源）</div>
</div>
```

**格式要求**：所有图片必须使用 WebP 格式。参见 `images.md` 中的转换命令。

**放置规则**：
- 图片必须放在**正文的 `<div class="ch">` 或 `<div class="section">` 区域**，不能放在 YAML frontmatter 中
- 图片应当放在**所讲解段落的后面**（紧跟相关文字），而不是堆在文章末尾
- 不要将 `<div class="photo">` 放在文件末尾——构建系统不会自动移动它

### 引用块

```html
<div class="quote">
  <p>「引文内容」</p>
  <div class="who">——出处</div>
</div>
```

### 行内标签（`span.tag`）

```html
<div class="tags">
  <span class="tag">OpenAI 联合创始人</span>
  <span class="tag">前 Tesla AI 总监</span>
  <span class="tag">Eureka Labs</span>
</div>
```

适用：人物身份、机构、技术栈、论文属性等短标签。多个标签建议放在 `<div class="tags">` 容器里自动换行；单个标签也可以直接写 `<span class="tag">...</span>`。

### 提示框 / Callout

```html
<div class="callout"><strong>要点</strong>：内容...</div>
```

适用：一句话总结、易错点、提醒、限制条件。**不要**在 callout 里堆太长推导。

### 信息框（`.info-box`）

```html
<div class="info-box">
  <h3>前置知识回顾</h3>
  <p>用于背景说明、补充信息、复习速查。</p>
</div>
```

适用：前置知识回顾、补充说明、复习速查、阅读建议。

### 定义框（`.def-box`）

```html
<div class="def-box">
  <h3>定义</h3>
  <p>给出概念、符号和最小必要解释。</p>
</div>
```

适用：定义、符号约定、直觉解释。

### 定理框（`.theorem-box`）

```html
<div class="theorem-box">
  <h3>定理 / 命题 / 推论</h3>
  <p>写正式结论，必要时配条件与结论列表。</p>
</div>
```

适用：定理、命题、推论、判定条件。

### 例题框（`.example-box`）

```html
<div class="example-box">
  <h3>例题标题</h3>
  <p><strong>题目：</strong>……</p>
  <ol>
    <li><strong>第一步</strong>：……</li>
    <li><strong>第二步</strong>：……</li>
  </ol>
  <p><strong>答案：</strong>……</p>
  <div class="callout"><strong>易错点</strong>：……</div>
</div>
```

适用：例题、计算示范、实验流程、算法步骤。

> **⚠️ 课程笔记例题强制规则：**
> - 同一 `ch` 章内 **≥2 道例题**时，必须用 `code-tabs collapsible example-tabs` 包裹所有 `example-box`，放在章末 `<h3 class="section-title">例题区</h3>` 下
> - 仅 **1 道例题**时，可单独用 `example-box` 直接放在章节末尾
> - 例题**禁止散落**在正文段落之间，必须统一归入章末的例题区

### Admonition 块

```html
<div class="admonition tip">
  <div class="admonition-title">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    标题文字
  </div>
  <div class="admonition-content"><p>内容...</p></div>
</div>
```

**六种类型**：`note`（蓝）/ `tip`（金）/ `warning`（橙）/ `danger`（红）/ `info`（蓝）/ `success`（绿）

**各类型图标 SVG**：

- **note / info**：`<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`
- **tip**：`<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>`
- **warning**：`<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`
- **danger**：`<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`
- **success**：`<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`

适用：核心原则、技巧建议、注意事项、严重警告——需要图标和颜色区分的视觉强调提示。
与 `.callout`（一句话要点）和 `.info-box`（背景说明）互补。

### 表格

两种写法都支持。**所有表格都必须包在 `.table-wrap` 中**。表格说明统一写在表格下方，使用斜体段落 `<p><em>表 N：说明文字</em></p>`。

- **普通表格**：`<div class="table-wrap">`，默认允许单元格自然换行，适合短文本对比。
- **长文本总览表**：优先使用 `<div class="table-wrap wrap-table">`，让单元格自然换行，适合 4–6 列、长文本较多的总览/对比表。
- **语义断行宽表**：确实需要保持宽表布局时，使用 `<div class="table-wrap wide">` + 显式 `<br>`；长单元格内部可以用 `<br>` 按语义断行，例如"方法列表 / 训练量级 / benchmark 列表"。
- **原子内容宽表**：`<div class="table-wrap wide">` 适合公式、代码、路径、命令、参数矩阵等不应人为断行的原子内容，优先保持原样并允许横向滚动。

**写法 A：HTML `<table>` 元素（推荐，更可控）**

表格说明写在 `</div>` 闭合标签之后，用 `<p><em>...</em></p>` 斜体段落。不要使用 `<caption>` 标签，不要使用 `<div class="table-caption">`。

```html
<div class="table-wrap">
  <table>
    <thead><tr><th>表头1</th><th>表头2</th></tr></thead>
    <tbody>
      <tr><td>单元格</td><td>单元格</td></tr>
    </tbody>
  </table>
</div>
<p><em>表 1：表格说明文字。</em></p>
```

**长文本总览宽表写法：使用 `wide + <br>` 进行语义换行**

```html
<div class="table-wrap wide">
  <table>
    <thead><tr><th>路线</th><th>代表方法</th><th>训练量级</th><th>推理量级</th></tr></thead>
    <tbody>
      <tr>
        <td>轻量换嘴 /<br>局部重绘</td>
        <td>Wav2Lip<br>MuseTalk</td>
        <td>8×V100 约 3 天<br>8×H20 两阶段数十小时</td>
        <td>单 V100<br>30–40 FPS 量级</td>
      </tr>
    </tbody>
  </table>
</div>
<p><em>表 1：六条路线的算力量级总表。</em></p>
```

**原子内容宽表写法：列数多、公式长或内容不适合人为断行时使用**

```html
<div class="table-wrap wide">
  <table>
    <thead><tr><th>类型</th><th>英文</th><th>差分方程</th><th>系统函数</th><th>冲激响应</th><th>核心特征</th></tr></thead>
    <tbody>
      <tr><td>FIR</td><td>Finite Impulse Response</td><td>$y[n]=\sum b_mx[n-m]$</td><td>$H(z)=\sum b_mz^{-m}$</td><td>有限长</td><td>无反馈，天然稳定</td></tr>
    </tbody>
  </table>
</div>
```

**写法 B：Markdown 管道表格（由 `transformMarkdownTables` 自动转换）**

在 `.html` 源文件里写连续的 `<p>| ... |</p>` 行。需要表格说明时，在管道表格前一行写 `<p>表 N：说明文字</p>` 或 `<p>Table N: caption text</p>`，构建时会自动转换为表格后的斜体段落。

```html
<p>表 1：IGA 与 GIFT 的核心差异。</p>
<p>| 特性 | IGA | GIFT |</p>
<p>|------|-----|------|</p>
<p>| 解场样条空间 | 与几何相同 | 几何无关 |</p>
```

构建时会输出为 `<div class="table-wrap"><div class="table-scroll"><table>...</table></div></div>\n<p><em>...</em></p>`，只有表格主体参与左右滑动，说明文字固定在表格下方。

> ⚠️ 不支持混合写法。选了 HTML `<table>` 就别在里面混 Markdown 管道行。

### 时间线

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="year">1945</div>
    <div class="event">事件描述</div>
  </div>
</div>
```

### 参考来源（`.sources`）

```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li data-cite-key="Author-et-al.-Year">
      Author, A. et al. (Year). 标题. <em>会议/期刊</em>.
      <a href="https://..." target="_blank">链接文字</a>
    </li>
  </ul>
</div>
```

**⚠️ 硬性要求**：
- 每个 `<li>` **必须**带 `data-cite-key` 属性，值为 `#key#` 经 `slugifyKey()` 转换后的结果（空格→连字符，保留大小写和点号）
- 每个 `<li>` 内**必须**包含一个 `<a href="..." target="_blank">` 链接，供 citation.js hover 弹出使用
- **禁止**裸 `<li><a>...</a></li>` 无 `data-cite-key` 的写法——这会破坏引用联动，hover 时显示"未找到原始链接"

> slugifyKey 示例：`Chen et al., 2025` → `Chen-et-al.-2025`；`KL Divergence` → `KL-Divergence`

### 小节标题 class 规范（强制）

正文中的小节标题**必须**带标准 class，否则不会加入 TOC、样式丢失：

| 层级 | 正确写法 | 错误写法 |
|------|---------|---------|
| 二级小节 | `<h3 class="section-title">标题</h3>` | `<h3>标题</h3>` |
| 三级小节 | `<h4 class="ch-section">标题</h4>` | `<h4>标题</h4>` |

**例外**：`.info-box` / `.def-box` / `.theorem-box` / `.example-box` / `.sources` 内部的 `<h3>` 不需要加 class（它们不参与 TOC）。

### 复习速查（推荐用 `.review-box`）

```html
<div class="review-box">
  <h3>复习速查</h3>
  <ul>
    <li><strong>定义</strong>：……</li>
    <li><strong>公式</strong>：……</li>
    <li><strong>方法</strong>：……</li>
  </ul>
</div>
```

适用：章节末尾的快速回顾，不建议写成长段落。

### 章节导航（`.chapter-nav`）

```html
<div class="chapter-nav">
  <a class="nav-card" href="prev-chapter.html">
    <span class="nav-label">上一章</span>
    <span class="nav-title">上一章标题</span>
  </a>
  <a class="nav-card current" href="course-hub.html">
    <span class="nav-label">枢纽页</span>
    <span class="nav-title">课程枢纽页</span>
  </a>
  <a class="nav-card" href="next-chapter.html">
    <span class="nav-label">下一章</span>
    <span class="nav-title">下一章标题</span>
  </a>
</div>
```

适用：课程笔记页末尾的上一章 / 枢纽页 / 下一章导航。

### 音乐播放器

```html
<music-player title="曲名" src="audio/xxx.mp3"></music-player>
```
构建时转换为带控件的播放器组件。或在 frontmatter 中用 `audio_src` 设置背景音乐。

### Mermaid 图表

```html
{{< mermaid >}}
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
{{< /mermaid >}}
```

构建时转为 `<div class="mermaid-wrap"><pre class="mermaid">...</pre></div>`，页面加载时由 Mermaid.js 渲染为 SVG。仅在页面包含 mermaid 元素时加载 Mermaid.js CDN。详见 `references/syntax.md`。

### 多语言代码块（`.code-tabs`）

```html
<div class="code-tabs">
  <div class="code-tabs-header">
    <button class="code-tab-btn active" data-tab="python">Python 3</button>
    <button class="code-tab-btn" data-tab="cpp">C++17</button>
  </div>
  <div class="code-tab-content active" data-panel="python">
    <pre><code class="language-python"># Python 代码</code></pre>
  </div>
  <div class="code-tab-content" data-panel="cpp">
    <pre><code class="language-cpp">// C++ 代码</code></pre>
  </div>
</div>
```

**规则**：
- `data-tab` 和 `data-panel` 值必须配对（如 `python`/`python`）
- 第一个按钮和面板加 `active` class 作为默认显示
- 代码块照常使用 `language-*` class，Prism.js 自动高亮
- 支持 2 个以上的语言 tab，按需添加按钮和面板即可

适用：题解、教程等需要展示多语言实现的场景。普通的单语言代码块继续用 `<pre><code>` 即可。

也适用于同一段算法解释的两种视图，例如“流程图 / 伪代码”。这种写法能避免 Mermaid 图和 Algorithm 块纵向堆叠过长：

```html
<div class="code-tabs">
  <div class="code-tabs-header">
    <button class="code-tab-btn active" data-tab="stage-flow">流程图</button>
    <button class="code-tab-btn" data-tab="stage-algorithm">算法</button>
  </div>
  <div class="code-tab-content active" data-panel="stage-flow">
    {{< mermaid >}}
    flowchart TD
      A[输入] --> B[处理]
      B --> C[输出]
    {{< /mermaid >}}
  </div>
  <div class="code-tab-content" data-panel="stage-algorithm">
    <pre><code class="language-text">Algorithm: Example
Input: x
repeat
  y = step(x)
until convergence
Output: y</code></pre>
  </div>
</div>
```

**流程图 / 算法组合规则**：
- 每一组 `data-tab` / `data-panel` 使用当前段落语义命名，如 `stage1-flow`、`stage1-algorithm`，不要在同一页重复
- Mermaid shortcode 可以放在 `.code-tab-content` 内，构建时仍会正常转换并按需加载 Mermaid.js
- 算法伪代码建议用 `language-text`，除非确实是某门语言的可运行代码
- 图和伪代码表达的是同一阶段、同一过程时优先合并为 tabs；如果二者讲的是不同内容，则不要强行合并

---

## 行内语法

### 高亮文字

`==高亮文字==` 渲染为 `<mark>` 黄色背景。

### Markdown 加粗/斜体

- `**text**` → `<strong>text</strong>`
- `*text*` → `<em>text</em>`

（仅在 HTML 源文件中生效，`.md` 文件由 marked 处理）

### 术语解释（Term :: Definition）

```html
<li><strong>术语</strong> :: 定义内容</li>
<p><em>带强调的术语</em> :: 定义内容</p>
```
构建时转换为 `<dl class="term-list">` 结构。

> ⚠️ **硬性限制：术语解释语法不支持换行。**
> `术语 :: 定义内容` 必须完整写在同一个 `<li>` 或 `<p>` 内，定义内容不能跨段落、不能换行、不能在中间插入列表/代码块/公式块。
> 如果定义较长，请改用普通段落、小标题或表格；否则构建器的正则会把后续内容误吞进 `<dd>`，页面上可能出现异常的 `dt::after` / `dt:after` 或结构错位。

✅ 正确：
```html
<li><strong>Flow Matching</strong> :: 学习从噪声分布到数据分布的连续速度场。</li>
```

❌ 错误：
```html
<li><strong>Flow Matching</strong> ::
学习从噪声分布到数据分布的连续速度场。
</li>
```

### 列表语法

- `·` 中点 → `<li>`
- `①` ~ `⑩` → `<li>`

连续裸 `<li>` 会被自动包裹 `<ul>`。

---

## 代码块

### 推荐写法：HTML `<pre><code>`

```html
<pre><code class="language-python">
import torch
print("hello")
</code></pre>
```

- 推荐在 HTML 源文件中直接使用这种写法
- `class="language-xxx"` 用于语言标记（如 `language-python` / `language-bash` / `language-yaml`）
- 这是最稳定、最明确的写法

### 兼容写法：Markdown fenced code block

构建器现已支持在 `.html` 源文件中使用 fenced code block，并在构建时自动转换为 `<pre><code>`：

```html
```python
import torch
print("hello")
```
```

支持形式：
- ```` ```python ````
- ```` ```bash ````
- ```` ```yaml ````
- 无语言标记的 ```` ``` ````

> ⚠️ 兼容不等于首选。对于长期维护的 HTML 页面，仍然优先推荐直接写 `<pre><code class="language-...">`。

## 其他组件一览

| 组件 class | 用途 |
|-----------|------|
| `.info-box` | 前置知识、补充说明、复习速查 |
| `.def-box` | 定义、符号说明 |
| `.theorem-box` | 定理、命题、推论 |
| `.example-box` | 例题、实验、计算步骤 |
| `.callout` | 一句话要点、易错点、提醒 |
| `.review-box` | 章节末尾复习速查 |
| `.sources` | 参考来源（必须用此组件） |
| `.chapter-nav` / `.nav-card` | 上一章 / 枢纽页 / 下一章导航 |
| `.vs` | 左右对比栏（`.vs .l` 红色调 / `.vs .r` 蓝色调） |
| `.card-grid` / `.card` | 卡片网格 |
| `.icon-grid` / `.icon-item` | 图标网格 |
| `.badge` | 地域/分类徽章 |
| `.profile` | 人物简介卡片 |
| `.divider` | 装饰分隔线 |
| `.sources` | 参考来源（必须用此组件） |
| `.table-wrap` | 响应式表格容器 |
| `.code-tabs` | 多语言代码块 tab 切换 |
| `.wrap` | 正文容器（最大宽度 800px） |
| `.fade-in` | 滚动渐入动画 |

---

## ⚠️ Box 组件 vs Admonition：使用分野

> 博客有两大类「提示/强调」组件：**Box 系列**（info-box / def-box / theorem-box / example-box / callout）和 **Admonition**。两者各有适用场景，**不要只用一种**。

### Box 系列（课程笔记主力）

Box 组件有彩色左边线 + 标题，适合**结构化的知识块**，是课程笔记的首选。

| 组件 | 适用场景 | 内容长度 | 示例 |
|------|---------|---------|------|
| `.def-box` + `<h3>` | 正式定义、符号约定 | 中等 | 「线性相位定义」「Z 变换定义」 |
| `.theorem-box` + `<h3>` | 定理、命题、判定准则 | 中等 | 「Parseval 定理」「蝶形公式」 |
| `.info-box` + `<h3>` | 前置知识、背景说明 | 中等 | 「前置知识回顾」「符号约定」 |
| `.example-box` + `<h3>` | 例题、计算步骤 | 长 | 「例题：Z 变换求卷积」 |
| `.callout`（无标题） | **一句话**要点、易错点、记忆口诀 | **1-2 句** | 「易错点：不要混淆 ROC」「记忆公式：...」 |

### Admonition（多段深度展开）

Admonition 带图标 + 按类型变色，适合**需要多段展开、按严重程度区分**的提示。

| 类型 | 颜色/图标 | 适用场景 | 示例 |
|------|----------|---------|------|
| `note` | 蓝 ℹ️ | 附加说明、延伸知识 | 「补码的历史背景」「与连续时间对比」 |
| `tip` | 金 💡 | 方法论、技巧、深入理解 | 「深入理解：为什么相位线性意味着延迟相同」 |
| `warning` | 橙 ⚠️ | 常见陷阱、易混概念 | 「第三类 vs 第二类的区分」 |
| `danger` | 红 🔴 | 致命错误、会导致全题错 | 「把循环卷积当线性卷积计算」 |
| `success` | 绿 ✅ | 验证方法、检查清单 | 「验证 DFT 结果的正确方法」 |
| `info` | 蓝 ℹ️ | 与 note 近似，偏「你需要知道这个」 | 「本课程所有例题默认因果」 |

### 选择决策树

```
这个提示有几句话？
├── 1-2 句 → 用 .callout（金色左边线，无标题）
├── 3-5 句，且有明确标题 → 用 .info-box / .def-box / .theorem-box
└── 需要多段公式 + 列表 + 表格 → 用 admonition

这个提示需要区分严重程度吗？
├── 是 → 用 admonition（warning / danger）
└── 否 → 用 callout 或 box

这个提示是正式的定义/定理吗？
├── 是 → 用 .def-box / .theorem-box（带 h3 标题）
└── 否 → 用 callout 或 admonition
```

### 反模式（禁止）

1. **禁止所有提示都用 callout**：一篇文章全是金色 callout 会视觉疲劳。需要多段展开的内容改用 admonition。
2. **禁止用 admonition 代替 def-box**：正式的数学定义仍然用 `.def-box`，不要用 `admonition note`。
3. **禁止 callout 里放多段公式**：callout 是「一句话」，超过 3 行就该换成 admonition 或 box。

### HTML 语法

```html
<!-- Box 系列 -->
<div class="def-box">
  <h3>定义标题</h3>
  <p>定义内容...</p>
</div>

<!-- Admonition -->
<div class="admonition tip">
  <div class="admonition-title">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
    标题
  </div>
  <div class="admonition-content">
    <p>多段内容...</p>
    <p>可以包含公式、列表、表格。</p>
  </div>
</div>
```

> **图标 SVG**：admonition 标题建议带一个 `<svg class="icon">`，不同类型用不同图标。如果没有图标，admonition 仍能正常渲染，只是标题前没有图标。

---

## 自动注入机制

以下内容由构建系统自动处理，**不需要手动写入**：

| 项目 | 说明 |
|------|------|
| Article Meta | 创建日期、更新日期、分类、标签、阅读时间自动渲染到文章头部 |
| Article Footer | 分类和标签链接自动渲染到文章底部 |
| Hero | 从 frontmatter `hero_title` / `hero_sub` / `hero_tagline` 自动生成 |
| TOC 侧边栏 | `.ch-title` 和 `<h2>`~`<h6>` 自动生成目录 |
| Heading 锚点 | 所有标题自动注入 ID 和锚点链接 |
| 页面外壳 | `<html>` / `<head>` / `<nav>` / `<footer>` / `<script>` 由 `_base.html` 注入 |
| MathJax | frontmatter `mathjax: true` 时自动注入 MathJax CDN |
| Xref 解析器 | `[[@Title]]` 的客户端解析脚本自动注入 |
