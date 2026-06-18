# Note Structure — 课程笔记结构

默认结构适用于 Markdown、org 和 HTML。若最终输出 HTML 博客，course-notes 只规定内容结构；页面模板、组件风格与落盘发布必须交给 html-blog，按 `html-blog/templates/course-note-section-template.html` 和 html-blog references 执行。

## ⚠ 硬性规则：层级结构

**课程笔记严禁全平铺。** 所有 `div.ch` 块不能全部并列为同级，必须有分组、有层级、有叙述节奏。

### 为什么禁止全平铺

当一篇笔记有 8+ 个平级 `div.ch` 时，读者无法区分：
- 哪些章节属于同一逻辑组（如"定义类" vs"应用类"）
- 叙述的推进方向（从基础概念到高级应用？还是从理论到实践？）
- 当前处在文章的哪个阶段

全平铺就像一栋楼里所有房间都一样大、一样高，没有玄关、走廊、主卧之分。

### 层级规范

1. **Part 数量 > 6 时，必须分组。** 按逻辑将 Part 归入 2-4 个大组（group），每组用一个 "组级" `div.ch` 包裹，或用分隔标题标记。
2. **组内再分小节。** 组级用 `ch-label` + `ch-title`；组内子节用 `div.ch-subtitle` 或 `h3` 作为小标题。
3. **叙述必须有推进方向。** 典型推进方式：
   - **认知递进**：动机 → 定义 → 性质 → 应用（数学概念的标准教学路径）
   - **抽象度递进**：直观 → 形式化 → 推广
   - **工具链递进**：这个工具是什么 → 它能干什么 → 怎么用它做题 → 它的局限和后续
4. **每组之间有过渡。** 不能只是硬切换到下一组，要有 1-2 句承上启下的过渡文字。

### 具体实现方式

#### 方式 A：大组用 `div.ch` + 内部用 `ch-subtitle` / `h3` 拆分

```html
<!-- 组级 div.ch -->
<div class="ch fade-in">
  <div class="ch-label">一、从时域到频域</div>
  <div class="ch-title">DTFT 的动机与定义</div>
  <p>过渡段：为什么要做频域分析……</p>

  <h3>为什么需要 DTFT</h3>
  <p>……</p>

  <h3>正变换与反变换</h3>
  <p>……</p>

  <h3>周期性与收敛</h3>
  <p>……</p>
</div>
```

#### 方式 B：大组用分隔标题，子节仍为 `div.ch` 但去掉 Part 编号

```html
<div class="ch fade-in">
  <div class="ch-label">一、动机与定义</div>
  <div class="ch-title">从序列走向连续频谱</div>
  <p>……</p>
</div>

<div class="ch fade-in">
  <!-- 同组第二个子节，不用 ch-label，用 ch-subtitle -->
  <div class="ch-subtitle">正变换、反变换与收敛条件</div>
  <p>……</p>
</div>
```

#### 反面示例（禁止）

```html
<!-- ❌ 10 个 div.ch 全部平铺，Part 1 到 Part 10 -->
<div class="ch fade-in">
  <div class="ch-label">Part 1 · 动机</div>…
</div>
<div class="ch fade-in">
  <div class="ch-label">Part 2 · 定义</div>…
</div>
<!-- …… -->
<div class="ch fade-in">
  <div class="ch-label">Part 10 · 复习速查</div>…
</div>
```

### 检查清单

写作完成后，检查以下项：
- [ ] 文章有明确的 2-4 个大组，每组包含 2-4 个子节
- [ ] 大组之间有过渡段（不是硬切换）
- [ ] 叙述有明确方向：读者能感知"现在在讲基础""现在进入应用""现在在收尾"
- [ ] 标题层级在视觉上一致：大组标题 > 子节标题 > 段落内 h3
- [ ] 不存在 6 个以上平级 `div.ch` 的全平铺现象

## ⚠ 硬性规则：内容必须用 block 组件包裹

课程笔记中，**裸 `<p>` 段落只用于叙事和解释**。以下内容类型必须用对应的 block 组件包裹，禁止裸露为普通段落：

### 组件 → 内容类型 对照表

| 内容类型 | 必须使用的组件 | 典型场景 |
|---------|--------------|--------|
| 数学定义 / 符号约定 | `def-box` | DTFT 定义式、ROC 定义、收敛条件 |
| 定理 / 命题 / 判定准则 | `theorem-box` | 卷积定理、Parseval 定理、收敛充要条件 |
| 一句话要点 / 做题经验 / 限制条件 | `callout` | "做题时先查 ROC"、"不要漏掉收敛条件" |
| 需要按严重程度区分的多段提示 | `admonition`（见下方详表） | 考试常见致命错误、跨章节方法论总结 |
| 背景说明 / 前置知识 / 阅读建议 | `info-box` | 前置知识回顾、符号约定汇总 |
| 例题 / 计算步骤 / 实验流程 | `example-box` | 手算 DTFT、从差分方程求频率响应 |
| 复习速查 | `review-box` 或 `info-box` | 章节末尾的公式/方法速查表 |
| 参考来源 | `sources` | 课程材料、教材、网页参考 |

### Callout vs Admonition 的分工

Callout 和 admonition 都是"提示型"组件，但视觉重量和使用场景不同：

- **Callout**：一句话。金色左边线，无图标。适合快速提炼要点、做题经验、易错点。大多数情况用 callout 就够了。
- **Admonition**：可以多段。带图标 + 按类型变色。适合需要**按严重程度或性质区分**的提示，或者内容较长、一句话说不完的补充说明。

判断标准：
1. 一句话能说清 → `callout`
2. 需要多段展开，或者需要颜色/图标区分严重程度 → `admonition`
3. 不确定 → 先用 `callout`，admonition 不是必须的

**Admonition 六种类型在课程笔记中的典型场景：**

| 类型 | 颜色 | 课程笔记场景 | 示例 |
|------|------|------------|------|
| `note` | 蓝 | 正文之外的补充知识、跨章节的背景延伸 | "Z 变换的 ROC 概念在第 3 章有完整推导，此处只引用结论。" |
| `tip` | 金 | 做题方法论、高效解题路径、考场经验 | "求系统频率响应时，直接对差分方程两边做 DTFT 比先求 $h[n]$ 再做 DTFT 快得多。" |
| `warning` | 橙 | 常见陷阱、容易搞混的概念对、计算中容易漏的步骤 | "$H(z)$ 和 $H(e^{j\omega})$ 不是同一个东西——前者在 Z 平面有定义域限制，后者要求单位圆在 ROC 内。" |
| `danger` | 红 | 致命错误、会导致整道题全错的 conceptual mistake | "把循环卷积当成线性卷积直接计算，结果完全错误。DFT 场景下必须补零或用 overlap-add。" |
| `info` | 蓝 | 附加信息、与 note 近似但更偏"你需要知道这个" | "本课程所有 DTFT 例题默认序列绝对可和，除非题目特别说明。" |
| `success` | 绿 | 判定准则、检查清单、"这样做就对了" | "验证 DTFT 结果的正确方法：检查 $\omega=0$ 处的值是否等于 $\sum_n x[n]$。" |

```html
<!-- 典型用法：warning 型，区分易混概念 -->
<div class="admonition warning">
  <div class="admonition-title">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    $H(z)$ 与 $H(e^{j\omega})$ 不是同一回事
  </div>
  <div class="admonition-content">
    <p>$H(z)$ 定义在整个 Z 平面（ROC 内），而 $H(e^{j\omega})$ 是 $H(z)$ 在单位圆上的取值。只有当 ROC 包含单位圆时，两者才能互相转换。</p>
    <p>做题时最常见的错误：直接写 $H(e^{j\omega}) = \frac{1}{1-ae^{-j\omega}}$ 而不检查 ROC 是否包含 $|z|=1$。</p>
  </div>
</div>

<!-- 典型用法：tip 型，做题方法论 -->
<div class="admonition tip">
  <div class="admonition-title">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    求频率响应的最快路径
  </div>
  <div class="admonition-content">
    <p>差分方程 → 两边做 DTFT（利用时移性质） → 代数方程 → 直接解出 $H(e^{j\omega})$。</p>
    <p>不要先求 $h[n]$ 再做 DTFT，绕路且容易出错。</p>
  </div>
</div>
```

### 放置原则

1. **定义先出来，再用裸段落解释。** 看到一个公式被定义为某个概念的核心表达式时，用 `def-box` 包裹；随后用普通段落解释直觉和来源。
2. **推导过程中的关键结论用 `callout` 或 `theorem-box` 提炼。** 不要让重要结论淹没在一堆推导段落中间。
3. **收敛条件 / 适用范围必须用 `callout` 或 `theorem-box` 强调。** 不能只藏在某段话的中间。
4. **做题技巧和方法论用 `callout`（一句话）或 `admonition tip`（多段）。** 比如"先求 Z 变换再令 $z=e^{j\omega}$"一句话够说清就用 callout；如果需要解释一整套做题路径就用 admonition。
5. **易错点放在 `example-box` 内部的 `callout` 里。** 不要单独放一个裸段落。
6. **一个子节如果只有 2-3 个短段落（< 150 字），考虑合并到相邻子节。** 太碎片化的结构反而增加认知负担。

### 反面示例

```html
<!-- ❌ 定义裸露为普通段落 -->
<p>离散时间傅里叶变换定义为</p>
<p style="text-align:center">\[ X(e^{j\omega})=\sum_{n=-\infty}^{\infty}x[n]e^{-j\omega n}. \]</p>
<p>如果 $X(e^{j\omega})$ 已知，则可以通过反变换恢复序列……</p>

<!-- ✅ 定义用 def-box 包裹 -->
<div class="def-box">
  <h3>DTFT 定义（正变换）</h3>
  <p style="text-align:center">\[ X(e^{j\omega})=\sum_{n=-\infty}^{\infty}x[n]e^{-j\omega n} \]</p>
  <p>其中 $\omega$ 为连续角频率，$X(e^{j\omega})$ 是关于 $\omega$ 的复值函数。</p>
</div>
<p>如果 $X(e^{j\omega})$ 已知，则可以通过反变换恢复序列……</p>

<!-- ❌ 收敛条件藏在段落中间 -->
<p>严格地说，DTFT 不一定对所有序列都以普通函数形式收敛。常见充分条件是绝对可和……</p>

<!-- ✅ 收敛条件用 theorem-box 强调 -->
<div class="theorem-box">
  <h3>DTFT 收敛充分条件</h3>
  <p>若序列 $x[n]$ 绝对可和，即 $\sum_{n=-\infty}^{\infty}|x[n]|<\infty$，则其 DTFT 存在且连续。</p>
</div>
```

### 检查清单

写作完成后，检查以下项：
- [ ] 所有数学定义都用 `def-box` 包裹（不是裸段落）
- [ ] 所有定理/判定准则都用 `theorem-box` 包裹
- [ ] 每个重要结论或做题技巧都有对应的 `callout` 提炼
- [ ] 收敛条件 / 适用范围被显式强调（不是藏在段落中间）
- [ ] 没有太碎片的子节（< 150 字的独立 div.ch）

## 标准结构

1. 标题与学习目标
   - 本节解决什么问题
   - 学完会做什么题或理解什么模型
2. 本节在课程中的位置
   - 上一节留下的问题
   - 下一节会用到什么
3. 前置知识回顾
   - 概念名
   - 一句话作用
   - 去哪里补：课程页、教材章节、PPT 页码或网页参考
4. 背景问题
   - 为什么需要这个概念
   - 如果没有它会遇到什么困难
5. 概念定义
   - 先从概念本身解释，不以"作业要求"作为主线
   - 直觉解释
   - 数学定义
   - 符号说明
   - 适用条件
6. 推导过程
   - 从简单例子开始
   - 每一步说明依据
   - 标出关键假设
   - 推导结束后必须接一个小例子说明怎么用
7. 性质、规则和算法
   - 表格列出公式、条件、用途、常见误区
8. 例题、作业或实验
   - 题目
   - 目标
   - 步骤
   - 答案
   - 易错点
9. 图示说明
   - 图展示了什么
   - 读图顺序
   - 与公式或例题的关系
   - **课件轻量引用**：只是标注"见课件第 N 页 / 去哪里补 / 公式出处"时，用 `docref` shortcode。示例：`{{< docref "dsp/第一讲1.pdf" page=21 title="卷积定义出处" >}}`
   - **课件页展示**：读者需要直接看到课件页内容时，才用 `docpage`/`docpages` shortcode。示例：`{{< docpage "dsp/第一讲1.pdf" page=21 title="卷积定义与四步法" >}}`
   - **数学/信号函数图**：能用代码绘制的函数、信号、频谱、离散序列，优先用 `jsxgraph` shortcode（首选），不要用课件截图替代。示例（单位阶跃信号）：

     ```html
     {{< jsxgraph title="单位阶跃信号 u(t)" height="300" >}}
     var b = JXG.JSXGraph.initBoard(el, {
       boundingbox: [-3, 1.3, 3, -0.3],
       showCopyright: false, showNavigation: false
     });
     b.create('axis', [[0,0],[1,0]], {});
     b.create('functiongraph', [function(x){ return x < 0 ? 0 : 1; }], { strokeColor:'#2563eb', strokeWidth:2.2 });
     {{< /jsxgraph >}}
     ```

     示例（离散序列 δ[n]）：

     ```html
     {{< jsxgraph title="单位样值序列 δ[n]" height="300" >}}
     var b = JXG.JSXGraph.initBoard(el, { boundingbox: [-10, 1.4, 10, -0.35], showCopyright: false, showNavigation: false });
     for (var n = -500; n <= 500; n++) {
       var v = (n === 0) ? 1 : 0;
       if (v > 0) {
         b.create('segment', [[n,0],[n,v]], { strokeColor:'#2563eb', strokeWidth:2 });
         b.create('point', [n,v], { face:'o', size:3, strokeColor:'#2563eb', fillColor:'#2563eb' });
       }
     }
     {{< /jsxgraph >}}
     ```

   - **架构图/流程图/时序图**：系统架构、模块关系、算法流程、通信时序等，优先用 `mermaid` shortcode，不要用静态图片替代。示例（系统架构）：

     ```html
     {{< mermaid >}}
     graph TD
         A[信号输入] --> B[抗混叠滤波]
         B --> C[采样]
         C --> D[量化]
         D --> E[编码]
     {{< /mermaid >}}
     ```

     示例（通信时序）：

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

   - **非课件配图**：实验结果、手绘示意图、源码截图等，用 `<div class="photo"><img>` + `media/images/<slug>/`。示例见 `html-blog/templates/course-note-section-template.html`
10. 与后续章节的关系
11. 复习速查表
12. 参考来源

## 前置知识模板

```html
<div class="info-box">
  <h3>前置知识回顾</h3>
  <p>如果下面这些概念不熟，先回看对应章节；本节会默认使用它们。</p>
  <ul>
    <li><strong>概念 A</strong>：一句话说明它在本节的作用。去哪里补：课程页 / 教材第 x 节 / PPT 第 x 页 / 网页参考。</li>
  </ul>
</div>
```

## 例题模板

```html
<div class="example-box">
  <h3>例题 N：题目标题</h3>
  <p><strong>题目：</strong>题目原文或等价清晰改写。</p>
  <p><strong>目标：</strong>要求求什么，考察什么概念。</p>
  <ol>
    <li><strong>第一步：</strong>...</li>
    <li><strong>第二步：</strong>...</li>
    <li><strong>第三步：</strong>...</li>
  </ol>
  <p><strong>答案：</strong>...</p>
  <div class="callout"><strong>易错点</strong>：...</div>
</div>
```