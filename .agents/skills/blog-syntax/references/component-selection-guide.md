# 组件选择决策树

> 写文章时根据你要表达的内容类型，快速找到正确的 HTML 组件。
> 这是渐进式披露的第一层——先在此确定组件类别，再读取 `html-components.md` 获取完整语法。

---

## 阅读层次：写作与审校必做

写正文前先辨认核心结论、易错点、定义、例子与可选补充，再按内容选择组件。草稿转正文时保留完整解释与推导，不能以提炼重点为由删去必要论证。

- 核心结论：解释或推导完成后，可用 callout 标出一两句结论；标题写具体内容，避免一律叫“重点”。
- 易错点与条件：用 admonition warning 提醒容易误读的结论；note / tip 用于理解提示与直觉。普通学习提醒不用 danger。
- 定义、定理、例子：分别用 def-box、theorem-box、example-box；章节复习用 review-box，方便读者定位。
- 引用：quote 只用于可核实的真实引文，注明作者和来源，译文注明为译文。自己的总结、比喻和改写用普通段落或 callout，不包装成引文。没有合适引文不必使用 quote。
- 可选补充：旁支证明、实现细节和额外例子可放 details，摘要说明展开后能看到什么。首次出现的关键概念、主线推导与核心问题的回答必须直接可见。

连续叙述仍是主体。不规定组件数量，不要求每章都有框；避免连续堆框、整节套框、重复高亮同一结论。框内内容须与前后文衔接，不能只剩口号。

交稿时先扫读标题与框内结论，确认能定位问题、关键区别和适用条件；再连续阅读正文，检查组件是否打断推理、隐藏必要解释或重复大段正文。HTML 使用现有模板，不自行发明 class。

## 按内容类型选择组件

### 章节结构

| 你要做什么 | 用什么 | 详见 |
|-----------|--------|------|
| 文章开头放数字概览（如"8 种策略 · 8 个数据集"） | `<div class="stats">` | html-components.md §Stats |
| 写一个大章节（Part / 第X章） | `<div class="ch fade-in">` + `.ch-title` | html-components.md §章节叙事 |
| 传统分节（无章节编号） | `<div class="section fade-in">` | html-components.md §传统分节 |
| 章节内编号小节（X.Y） | `<h3 class="section-title">` | html-components.md §标题层级 |
| 章节内子小节（X.Y.Z） | `<h4 class="ch-section">` | html-components.md §标题层级 |

### 知识框（选择正确的框）

这是最常见的选错场景。五个框各有定位：

| 你要表达 | 用什么 | 不该用什么 | 区别 |
|---------|--------|-----------|------|
| 正式定义、符号约定 | `<div class="def-box">` | info-box | def-box 强调"这是新概念的定义" |
| 背景补充、前置知识、复习速查 | `<div class="info-box">` | def-box | info-box 是"你已经该知道的" |
| 定理、命题、推论 | `<div class="theorem-box">` | def-box | theorem-box 是"需要证明的结论" |
| 例题、计算示范、实验步骤 | `<div class="example-box">` | def-box | example-box 是"动手算一遍" |
| 章节末尾快速回顾要点 | `<div class="review-box">` | info-box | review-box 是"刚学过的浓缩" |

### 提示与强调（三个层级）

| 强调程度 | 用什么 | 适用场景 |
|---------|--------|---------|
| 一句话要点 / 易错点 | `<div class="callout">` | "核心矛盾：CG 88% vs FG 12.7%" |
| 带图标和颜色的分类提示 | `<div class="admonition tip">` | note/tip/warning/danger/info/success 六种 |
| 背景说明（多段文字） | `<div class="info-box">` | "前置知识：FIR 滤波器的定义..." |

**callout vs admonition 的选择**：callout 更轻量（纯文字 + 粗体标签），admonition 更醒目（带 SVG 图标 + 彩色边框）。一句话用 callout，需要视觉分级用 admonition。

### 图片（最高频出错点）

```
永远使用这个模式：
<div class="photo">
  <img src="media/images/<slug>/<name>.webp" alt="描述" loading="lazy">
  <div class="cap">图 N：说明文字（来源）</div>
</div>
```

**禁止清单**：
- ❌ `<figure>` / `<figcaption>` → 用 `<div class="photo">` / `<div class="cap">`
- ❌ `.png` / `.jpg` → 必须 `.webp`
- ❌ `src="/media/..."` → 路径不带前导 `/`
- ❌ `src="https://..."` → 禁止 hotlink，下载到本地

### 数据对比

| 数据特征 | 用什么 |
|---------|--------|
| 短文本对比（2-4 列） | `<div class="table-wrap">` + `<table>` |
| 长文本总览（4-6 列，单元格内容多） | `<div class="table-wrap wrap-table">` |
| 宽表/公式/代码（不应断行） | `<div class="table-wrap wide">` |
| 表格说明 | 表格下方 `<p><em>表 N：说明</em></p>` |

### 流程图 / 架构图

| 需求 | 用什么 | 详见 |
|------|--------|------|
| 流程图 / 架构图 / 思维导图 | `{{< mermaid >}}...{{< /mermaid >}}` | mermaid.md |
| 函数图 / 离散序列 / 交互绘图 | `{{< jsxgraph >}}...{{< /jsxgraph >}}` | plots.md |
| 函数图（简单） | `{{< functionplot >}}...{{< /functionplot >}}` | plots.md |
| 流程图 + 伪代码同阶段展示 | `<div class="code-tabs">` 两个 tab | html-components.md §多语言代码块 |

### 参考文献

```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li data-cite-key="Author-et-al.-Year">
      Author, A. et al. (Year). 标题. <em>会议</em>.
      <a href="https://..." target="_blank">链接</a>
    </li>
  </ul>
</div>
```

**必须**：每个 `<li>` 带 `data-cite-key` + 至少一个 `<a target="_blank">` 链接。

### 其他组件

| 需求 | 用什么 |
|------|--------|
| 引用名言 | `<div class="quote">` + `.who` |
| 人物/机构/技术栈短标签 | `<div class="tags">` + `<span class="tag">` |
| 时间线 / 演进史 | `<div class="timeline">` + `.timeline-item` |
| 上一章/枢纽页/下一章导航 | `<div class="chapter-nav">` |
| 多语言代码切换 | `<div class="code-tabs">` |
| 音乐播放器 | `<music-player>` |
| 可折叠详情 | `{{< details summary="标题" >}}...{{< /details >}}` |

---

## 行内语法速查

| 语法 | 效果 |
|------|------|
| `==高亮==` | 黄色背景 `<mark>` |
| `**加粗**` | `<strong>` |
| `*斜体*` | `<em>` |
| `#Author et al., 2025#` | 引用标记（hover 弹出来源） |
| `[[slug \| 显示文字]]` | 站内文章链接 |
| `[[arxiv:2506.01214]]` | arXiv 链接 |
| `[[github:user/repo]]` | GitHub 链接 |
| `{{< bg color >}}...{{< /bg >}}` | 背景色块 |

---

## 常见错误速查表

| ❌ 错误 | ✅ 正确 | 检测方式 |
|--------|--------|---------|
| `<figure>` / `<figcaption>` | `<div class="photo">` / `<div class="cap">` | lint error |
| `.png` / `.jpg` 图片 | `.webp` | lint error |
| `src="/media/..."` | `src="media/..."` | lint warning |
| `src="https://..."` hotlink | 下载到本地 | lint error |
| frontmatter `hub:` | 移除 | lint error |
| frontmatter `categories:` | 用 `aliases` 中 `categories/` 路径 | lint error |
| 裸文本行末尾 `</p>` | 删掉（构建系统自动补 `<p>`） | lint error |
| `<h3>标题</h3>`（无 class） | `<h3 class="section-title">标题</h3>` | 不入 TOC |
| `<figure>` 闭合用 `</p>` | `</div>` | lint error |

---

## 自动修复

lint 报错时，运行修复脚本自动修正常见格式问题：

```bash
# 预览修复（不写入）
~/.venv/bin/python3 scripts/fix-article.py src/pages/your-article.html --dry-run

# 执行修复
~/.venv/bin/python3 scripts/fix-article.py src/pages/your-article.html

# 批量修复
~/.venv/bin/python3 scripts/fix-article.py src/pages/*.html

# 仅修复特定规则
~/.venv/bin/python3 scripts/fix-article.py src/pages/your-article.html --rules figure,frontmatter
```

**修复范围**：figure→div.photo、img 路径前导斜杠、img 扩展名→webp、frontmatter 废弃字段、孤立 `</p>` 标签。
