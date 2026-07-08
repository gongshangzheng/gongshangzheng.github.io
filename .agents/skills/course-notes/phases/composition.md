# Phase 4: COMPOSITION - 笔记写作

**目标**:把本地课程材料和网页参考笔记合成为可读、可复习、可发布的课程笔记。

读取：`references/note-structure.md` 和 `references/quality-standards.md`。

## 写作要求

1. 按"学习目标 → 前置知识 → 背景动机 → 概念定义 → 推导 → 规则 → 例题 → 衔接 → 速查 → 参考来源"组织；每一节必须先从概念本身和学习问题出发，再引入作业、实验或考试题。**层级结构必须遵循 `references/note-structure.md` 的 §硬性规则：层级结构**——Part 数量 > 6 时必须分组，禁止全平铺。写 HTML 标题时，主章节用 `.ch-title`，章节内小节用 `h3.section-title`，小节内子主题用 `h4.ch-section`；不要用标题文字里的编号（如 `5.1`）替代真实 HTML 层级。
2. 课程原始材料负责确定范围和符号；网页参考笔记负责补充直觉、替代解释和例题视角。
3. 每个关键公式都要解释：符号、适用条件、从哪里来、用来解决什么问题。
4. 每个跳步词，如"显然、于是、可得、直接得到"，都要检查是否需要补前置知识或中间步骤。
5. 每个核心概念后必须安排至少一个具体例子、作业题或实验片段来落地；例题必须写完整步骤，不只给答案。
6. 在进入 html-blog 生成最终页面前，必须先补齐课程笔记 frontmatter：`description` 必须写成一句完整摘要；`sub_id` 默认自动分配，做法是先检索同一课程（同 `aliases` 分类路径）已有页面，取已使用 `sub_id` 的最大值，再给当前新笔记写入下一个整数。若用户明确指定章节号，或当前文章是在重写既有章节，才允许覆盖该自动编号。
7. 输出 HTML 时，不在 course-notes 内自行套模板；调用 html-blog 完成最终页面生成，遵循 html-blog 的组件规范、课程 HTML 模板和图片路径规范。
8. **课件引用语义：** 只有当课件页内容已经被正文完整转述、解释或推导，只需要标注出处或“去哪里补”时，才用 `docref`；如果正文没有完整复现该页内容，或者该页包含读者需要直接看到的演示图、系统框图、频谱图、几何图、公式版面或例题步骤，必须用 `docpage`/`docpages` 展示原 PDF 页面。每个 `docref` 前后必须说明它引用了什么知识点，禁止放孤立的 docref 链接。`docref`/`docpage`/`docpages` 前后的正文只讲知识点内容，严禁写“第 X 页说明/展示/给出……”“详细说明在第 X 页”这类页码叙述；页码只放在 shortcode 参数或参考来源列表。先确认源文件已拷贝到博客 `media/` 目录，再在 HTML 中写 shortcode。

## 博客课件引用与配图方案

博客文章涉及课件时先判断语义：**引用**还是**展示**。

### 方案 A：轻量课件引用（默认）

适合课件页内容已经被正文完整说明，只需要标注来源、前置知识去哪里补、公式/定义来自哪一页的场景。用 `docref` shortcode。`docref` 不加载 PDF.js，也不应该像 `docpage` 一样占据大块空间，它只是比普通 `<a>` 链接多文件名、页码和标题信息。

硬性限制：`docref` 不是“替读者看课件”的替代品。使用 `docref` 前，正文必须已经说清该页的具体内容和它支撑的结论；如果页面中有正文没有复现的图、框图、频谱、推导版面或例题步骤，应改用 `docpage`/`docpages`。

```html
{{< docref "dsp/第一讲1.pdf" page=12 title="前置知识：卷积定义" >}}
```

### 方案 B：课件整页展示（可交互）

适合正文讲解依赖完整课件页的图、公式、框图、频谱、推导或例题版面，需要读者直接查看页面的场景。用 `docpage`/`docpages` shortcode，前端用 PDF.js canvas 渲染，支持缩放、翻页。

```bash
BLOG_MEDIA=~/gongshangzheng.github.io/media
mkdir -p "$BLOG_MEDIA/dsp"
cp "第一讲1.pdf" "$BLOG_MEDIA/dsp/"
```

```html
<!-- 渲染 PDF 第 21 页到 canvas -->
{{< docpage "dsp/第一讲1.pdf" page=21 title="卷积和定义与四步法" >}}

<!-- 多页渲染 -->
{{< docpages "dsp/第一讲1.pdf" pages="21,25,35,46-47" title="卷积推导过程" >}}
```

规则：
- PDF 路径相对于 `media/` 写（如 `dsp/第一讲1.pdf`）
- PPT/PPTX 不能直接渲染指定 slide，先用工具转为 PDF 再展示；若只是引用 PPT/PPTX，可直接用 `docref`
- `docpage` 默认 `mode="canvas"`（PDF.js 渲染），还可以加 `mode="iframe"`（浏览器 PDF viewer）
- 不要使用 `docpage mode="ref"`；引用语义统一使用 `docref`
- `docpage` 和 `docpages` 用到时，html-blog 才会按需加载 PDF.js，不会全局加载

### 方案 C：课件页静态截图（需要裁剪/标注时）

适合只需要课件某页的局部、或需要在截图上加标注的场景。先把目标页导出为高质量 PNG，再裁剪/标注。

**当前工作机专属**：在 tangwen 当前工作机上，允许用 `~/.venv` + `PyMuPDF` 导出指定页。这是当前机器配置，不是通用环境假设。

```bash
BLOG_IMG=~/gongshangzheng.github.io/media/images/course-topic
mkdir -p "$BLOG_IMG"
~/.venv/bin/python - <<'PY'
import fitz, pathlib
pdf = '第一讲1.pdf'
out = pathlib.Path.home() / 'gongshangzheng.github.io/media/images/course-topic'
doc = fitz.open(pdf)
page_no = 21
pix = doc[page_no - 1].get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
pix.save(out / 'convolution-def-21.png')
PY
# 裁剪、加标注后再用
```

通用可选方案：如果机器有 `pdftoppm`，可使用：

```bash
BLOG_IMG=~/gongshangzheng.github.io/media/images/course-topic
mkdir -p "$BLOG_IMG"
pdftoppm -png -r 300 -f 21 -l 21 "第一讲1.pdf" "$BLOG_IMG/convolution-def"
# 输出: $BLOG_IMG/convolution-def-21.png
# 裁剪、加标注后再用
```

```html
<div class="photo">
  <img src="media/images/course-topic/convolution-def-21.png" alt="卷积和定义" loading="lazy">
  <div class="cap">图：卷积和定义与四步法（课件第 21 页）</div>
</div>
```

### 方案 D：非课件类配图

实验结果截图、手绘示意图、源码截图等：

```html
<div class="photo">
  <img src="media/images/dsp-fft/fft-butterfly-radix2.png" alt="蝶形结构" loading="lazy">
  <div class="cap">说明</div>
</div>
```

这些图片放在 `media/images/<slug>/`，不走 docpage。

使用 `docpage`/`docpages` 时必须搭配上下文叙述，采用“导读段 → 课件页 → 回扣段”的结构：页面前告诉读者看什么、为什么看，页面后说明这页如何支撑刚讲的概念、例题或下一步推导。禁止把课件页当作孤立截图插入。

使用 `docpage`/`docpages` 时必须搭配上下文叙述，采用“导读段 → 课件页 → 回扣段”的结构：页面前告诉读者看什么、为什么看，页面后说明这页如何支撑刚讲的概念、例题或下一步推导。禁止把课件页当作孤立截图插入。

### 方案 E：数学/信号函数图（代码生成，优先于截图）

能用代码绘制的函数图、信号图、频谱、离散序列、冲激示意等，**不要**依赖课件截图。代码图可交互、可缩放、矢量清晰。

**首选 JSXGraph**（博客默认绘图引擎）：

```html
<!-- 连续函数 -->
{{< jsxgraph title="sinc(t)" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-8, 1.1, 8, -0.35],
  showCopyright: false, showNavigation: false
});
b.create('axis', [[0,0],[1,0]], {});
b.create('functiongraph', [function(x){
  return x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
}], { strokeColor:'#2563eb', strokeWidth:2.2 });
{{< /jsxgraph >}}
```

```html
<!-- 离散序列 -->
{{< jsxgraph title="单位样值序列 δ[n]" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-10, 1.4, 10, -0.35],
  showCopyright: false, showNavigation: false
});
for (var n = -500; n <= 500; n++) {
  var v = (n === 0) ? 1 : 0;
  if (v > 0) {
    b.create('segment', [[n,0],[n,v]], { strokeColor:'#2563eb', strokeWidth:2 });
    b.create('point', [n,v], { face:'o', size:3, strokeColor:'#2563eb', fillColor:'#2563eb' });
  }
}
{{< /jsxgraph >}}
```

functionplot 为旧语法兼容，新建图表统一用 JSXGraph。详细语法和踩坑记录见 `~/gongshangzheng.github.io/.agents/skills/html-blog/references/plots.md`。

### 方案 F：架构图/流程图/时序图（Mermaid）

系统架构、模块关系、算法流程、通信时序、状态机等结构化图表，用 `mermaid` shortcode。课程笔记里的 Mermaid 必须使用对 Mermaid v11 稳定的标签写法：凡是节点或边标签含括号、斜杠、箭头、冒号、数学符号、中英文混排或公式名，都必须加引号；例如 `F["数字系统函数 H(z)"]`，不要写 `F[H(z)]`。

```html
{{< mermaid >}}
graph TD
    A["应用层"] --> B["算法层"]
    B --> C["编程语言层"]
    C --> D["操作系统层"]
{{< /mermaid >}}
```

```html
{{< mermaid >}}
sequenceDiagram
    participant TX as 发送端
    participant CH as 信道
    participant RX as 接收端
    TX->>CH: 调制信号
    CH->>RX: 加噪声信号
    RX->>RX: 解调+译码
{{< /mermaid >}}
```

Mermaid.js 运行时渲染为 SVG，自动匹配博客 dark 模式，按需加载。详细语法见 `~/gongshangzheng.github.io/.agents/skills/html-blog/references/mermaid.md`。

### 方案 G：精确 SVG 图示 / SVG 动画（svg-animations）

当课程笔记需要精确控制图形形状、工程符号、路径、箭头、遮罩、渐变、逐步显隐或动画演示时，读取 `.agents/skills/svg-animations/SKILL.md`，用内联 SVG 或 SVG 动画实现。典型场景：

- 信号处理、控制、电路等课程中的标准工程符号，Mermaid 节点无法准确表达时。
- 需要展示“信号如何沿路径传播”“算法步骤逐步出现”“几何形状连续变换”的动画图。
- 需要高质量、可缩放、可精确排版的教学插图，而 JSXGraph / Mermaid 都不合适时。

写入博客 HTML 时，SVG 必须保持自包含，添加 `role="img"`、`aria-label` 或 `<title>/<desc>`，动画必须兼容 `prefers-reduced-motion`。若只是静态结构关系，优先仍用 Mermaid；若是数学函数或信号图，优先仍用 JSXGraph。

## 并行写作（3+ 主题时使用）

当输入包含 3+ 个独立主题时，派 subagent 并行整理各主题素材。每个 subagent 指令模板：

```
任务：为「[课程名]」课程撰写「[主题名]」主题的详细学习笔记素材

## 背景
PPT 已转换到 [临时目录]，图片在 [artifacts 目录]。

## 工作步骤
### 1. 阅读 markdown 文件
仔细阅读全部内容。
### 2. 用图片理解工具分析关键图片
选取 5-8 张最有价值的图片进行视觉确认。**当前工作机专属**：可用 `~/.venv` + `PyMuPDF` 先把 PDF 指定页渲染成 PNG，再用 `read_file` 读取图片；其他机器需先检查 `pdftoppm` 或视觉 MCP 是否可用。
### 3. 上网搜索补充内容
搜索方向的补充资料（列出 3-5 个关键词方向）。
### 4. 整理笔记素材
整合为中文学习笔记素材，3000-5000 字。结构：概述、核心概念、关键理论、实验证据、总结。
### 5. 输出
写入：[中间笔记路径]
```

主 agent 在 subagent 返回后汇总、去重、统一风格。

## 参考来源写法

区分来源角色:

- 课程材料:PPT 第 x 页、教材第 x 节、作业第 x 题。
- 网页参考:标题 + URL + 借鉴用途,例如"用于补充直觉解释"。

不要把网页参考伪装成课程原文。

## Gate 条件

进入 Phase 5 前必须满足:

- [ ] 结构层级：文章已按 `references/note-structure.md` §硬性规则分组，不存在 6+ 个平级 div.ch 的全平铺现象
- [ ] 组件包裹：定义用 `def-box`、定理用 `theorem-box`、要点用 `callout`，不存在裸露的核心定义或收敛条件（见 `references/note-structure.md` §内容必须用 block 组件包裹）
- [ ] 已完成初稿
- [ ] frontmatter 已补齐，且 `description` 为一句独立可读摘要
- [ ] 已为当前课程自动分配正确的 `sub_id`，或明确记录为何使用指定编号
- [ ] 每个核心概念都有动机、定义、用途和至少一个具体例子
- [ ] 至少一个关键推导被完整展开,除非主题无需推导
- [ ] 若涉及题目,至少 2 道例题/作业题含完整步骤,材料不足则说明
- [ ] 参考来源区分本地课程材料与网页来源
- [ ] 数学/信号/频谱图优先使用了 JSXGraph（或 functionplot 兼容），而非课件截图
- [ ] 架构图/流程图/时序图优先使用了 Mermaid，而非静态图片
- [ ] 需要精确工程符号、路径动画或逐步视觉说明时，已读取 `svg-animations` 并优先使用内联 SVG / SVG 动画
