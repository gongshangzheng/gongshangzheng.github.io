# MathJax 数学公式规则

> 本文档由 html-blog SKILL.md 拆分而来。含公式的文章按需读取。
> 所有规则基于 generator.js 中 `transformLatex` 的实际实现。

---

## 前提

frontmatter 中声明 `mathjax: true`。构建系统自动注入 MathJax v3 CDN 配置：

```js
inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
```

因此 `$...$` 与 `\\(...\\)` 都可作为行内公式分隔符，`$$...$$` 与 `\\[...\\]` 都可作为独立公式分隔符。

---

## 核心规则（必读）

### 源码中只写纯分隔符，不写 wrapper

构建系统（generator.js 的 `transformLatex`）会_自动_将 `$...$` 与 `\\(...\\)` 转换为 `<span class="math-inline">... </span>` 形式，将 `$$...$$` 与 `\\[...\\]` 转换为 `<div class="math-block">$$...$$</div>`。

**❌ 错误写法**（源码中写 wrapper）：

```html
<!-- 构建系统会再次包装，导致双层嵌套 -->
<p><span class="math-inline">$C^{p-1}$</span></p>
```

**✅ 正确写法**（源码只写 delimiters）：

```html
<p>$C^{p-1}$ 连续的 NURBS 基函数</p>
<p>\(C^{p-1}\) 连续的 NURBS 基函数</p>
```

### `$$...$$` 必须在同一逻辑行

`$$` 不能拆到 `<p>$$</p>` 两个标签里：

**❌ 错误**：

```html
<p>$$</p>
<p>\sigma_{AB} = C_{ABCD} \varepsilon_{CD}</p>
<p>$$</p>
```

**✅ 正确**：

```html
<p>$$\sigma_{AB} = C_{ABCD} \varepsilon_{CD}$$</p>
```

如果 `$$...$$` 跨 `<p>` 标签，构建系统的 `transformLatex` 会匹配到 `<p>` 标签内的内容，导致渲染结果异常。

---

## 分隔符

| 类型 | 分隔符 | 构建时转换 | 示例 |
|------|--------|-----------|------|
| 行内公式 | `$...$` | `<span class="math-inline">$...$</span>` | `$O(T\epsilon^2)$` |
| 独立公式 | `$$...$$` | `<div class="math-block">$$...$$</div>` | `$$\mathcal{L}$$` |
| 独立公式 | `\[...\]` | `<div class="math-block">$$...$$</div>` | `\[\mathcal{L}\]` |
| 行内公式 | `\(...\)` | `<span class="math-inline">\(...\)</span>` | `\(x + y\)` |

> `\[...\]` 在构建时会统一为 `$$...$$`；`\(...\)` 会保留行内分隔符并由 MathJax 的 `['\\\\(', '\\\\)']` 配置渲染。

---

## 处理顺序（重要）

构建管线按以下顺序处理：

1. **独立公式先提取**：`$$...$$` 和 `\[...\]` 先被替换为占位符（`@@MATH_DISPLAY_N@@`）
2. **引用语法**：`$@key$` → `<cite>@key</cite>`
3. **行内公式**：`$...$` → `<span class="math-inline">$...$</span>`；`\\(...\\)` → `<span class="math-inline">\\(...\\)</span>`
4. **占位符还原**：`@@MATH_DISPLAY_N@@` → `<div class="math-block">$$...$$</div>`

这意味着：独立公式的 `$$` 不会被行内公式规则误匹配。

---

## `<` 转义

**构建系统已自动处理 display math 和 inline math**：`generator.js` 的 `transformLatex` 会对所有数学公式（`$$...$$`、`\[...\]`、`$...$`、`\(...\)`）内容中的 `<` 和 `>` 自动转义为 `&lt;` / `&gt;`。浏览器 DOM 文本节点读取时自动还原，MathJax 看到的仍然是原始 LaTeX。

这意味着源码中可以直接写 `$n<N$` 或 `\[n<n_0\]`，无需手动替换为 `\lt`。

> **历史备注**：早期版本要求手动用 `\lt` 替代 `<`。自 generator.js v2026-05-22 起已自动化，源码中保留原始写法即可。

---

## `<p>` 吸收规则

构建系统在还原 display math 占位符时，会检测并吸收包裹的 `<p>` 标签：

```html
<!-- 源码 -->
<p style="text-align:center">\[x^2\]</p>

<!-- 构建输出 -->
<div class="math-block" style="text-align:center">$$x^2$$</div>
```

原因是 HTML 规范不允许 `<p>` 内嵌套 block 级元素（`<div>`）。如果保留 `<p>` 包裹，浏览器会自动截断 `<p>`，导致后续内容泄漏到容器外面。

`text-align` 属性会被从 `<p>` 提升到 `<div class="math-block">` 上。

---

避免 `\left(` / `\right)`，改用固定大小：

```diff
- \left( x + y \right)
+ \Bigl( x + y \Bigr)
```

---

## 引用 vs 公式区分

- `$@Hinton et al., 2015$` → 引用（`@` 前缀，转为 `<cite>`）
- `$O(T\epsilon^2)$` → 行内公式（无 `@` 前缀）
- `$T^2$` / `$KL(p|q)$` → 行内公式（纯数学符号，无空格）

---

## 示例

```html
<p>潜在分布包含 $K$ 个 GMM mode，维度为 \(d\)，样本复杂度随 $O(K^4)$ 增长。</p>

<p style="text-align:center">
\[
\mathcal{L} = \alpha \cdot T^2 \cdot \mathrm{KL}(p_{\mathrm{teacher}} \| p_{\mathrm{student}}) + (1-\alpha) \cdot \mathrm{CE}(y, p_{\mathrm{student}})
\]
</p>
```

> **工程注意**：JS `String.replace` 的字符串 replacement 会把 `$$` 压缩成 `$`。构建系统已使用函数 replacement 处理，但如果自定义脚本操作含 `$$` 的内容，必须用函数形式。

---

## 常见错误清单

| 错误模式 | 后果 | 正确做法 |
|----------|------|----------|
| 源码中写 `<span class="math-inline">$...$</span>` | 构建系统二次包装，双层嵌套 | 只写 `$...$` 或 `\\(...\\)` |
| `$$...$$` 跨 `<p>` 标签 | 匹配到 `<p>` 标签，内容异常 | 合并到同一 `<p>` 内的 `$$...$$` |
| 公式中直接用 `<` | 旧版本需手动替换，新版生成器自动转义（`<` → `&lt;`）| 源码中直接写即可，构建系统自动处理 |
| display math 外有 `<p>` 包裹 | `<div>` 嵌套在 `<p>` 内违反 HTML 规范，浏览器截断导致布局泄漏 | 构建系统自动吸收 `<p>` 并提升 `text-align` |
| frontmatter 中缺失 `mathjax: true` | MathJax CDN 不被注入 | 含公式时必须声明 |
