# HTML 组件速查

> 本文档由 html-blog SKILL.md 拆分而来。写正文时按需读取。
> 所有语法基于 build.js 管线的实际实现，与代码一一对应。

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

## 内容组件

### 图片

```html
<div class="photo">
  <img src="assets/media/images/xxx.jpg" alt="描述" loading="lazy">
  <div class="cap">图片说明（来源）</div>
</div>
```

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
  <h3>例题</h3>
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

两种写法都支持：

**写法 A：HTML `<table>` 元素（推荐，更可控）**

```html
<div class="table-wrap">
  <table>
    <thead><tr><th>表头1</th><th>表头2</th></tr></thead>
    <tbody>
      <tr><td>单元格</td><td>单元格</td></tr>
    </tbody>
  </table>
</div>
```

**写法 B：Markdown 管道表格（由 `transformMarkdownTables` 自动转换）**

在 `.html` 源文件里写连续的 `<p>| ... |</p>` 行：

```html
<p>| 特性 | IGA | GIFT |</p>
<p>|------|-----|------|</p>
<p>| 解场样条空间 | 与几何相同 | 几何无关 |</p>
```

构建时会被自动转换为 `<div class="table-wrap"><table>`。

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
    <li><a href="https://..." target="_blank">来源名称</a></li>
  </ul>
</div>
```
**禁止**使用裸 `<ul><li>URL</li></ul>`。

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
