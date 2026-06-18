# Mermaid 图表

> 从 `syntax.md` 拆分。所有 Mermaid 语法集中在此。

---

## 基本语法

在 HTML 源文件中使用 **短代码** 或 **div 容器** 两种写法之一，构建时统一转为 `<pre class="mermaid">` 块，页面加载时由 Mermaid.js 在客户端渲染为 SVG。

### 方式一：短代码（推荐）

```html
{{< mermaid >}}
graph TD
    A[应用层] --> B[算法层]
    B --> C[编程语言层]
    C --> D[操作系统层]
    D --> E[指令集架构 ISA]
    E --> F[微架构层]
    F --> G[逻辑门层]
    G --> H[电路层]
{{< /mermaid >}}
```

### 方式二：div 容器（兼容）

```html
<div class="mermaid">
graph LR
    subgraph Abelian["交换群 (Abelian)"]
        Cn["C_n 循环群"]
    end
    style Cn fill:#e8f5e9
</div>
```

两种写法等价，构建时都转化为 `<pre class="mermaid">`。短代码形式更简洁，推荐优先使用。

<div class="info-box">
  <strong>注意</strong>：div 写法支持任意 HTML 属性（如 <code>data-type</code>、<code>style</code>），构建时自动剥离，只保留 mermaid 代码内容。
</div>

## 支持的图表类型

| 类型 | 关键字 | 适用场景 |
|------|--------|----------|
| 流程图 | `graph` / `flowchart` | 算法流程、决策树、系统模块关系 |
| 时序图 | `sequenceDiagram` | 交互流程、协议通信 |
| 类图 | `classDiagram` | 软件架构、数据结构 |
| 状态图 | `stateDiagram-v2` | 状态机、生命周期 |
| 甘特图 | `gantt` | 项目排期 |
| 饼图 | `pie` | 数据占比 |
| 架构图 | `graph` + subgraph | 系统架构、模块层级 |
| 思维导图 | `mindmap` | 失败空间梳理、知识结构、概念发散 |
| 象限图 | `quadrantChart` | 多方案在两维度上的定位与权衡（成本/收益、稳定性/速度等） |
| 时间线 | `timeline` | 技术演进史、项目里程碑（比 gantt 轻量） |
| 时序图（进阶） | `sequenceDiagram` | 协议交互、推理/调用流程，支持 alt/opt/loop/par |
| 分支图 | `gitGraph` | 分支策略、版本演进、发布流程 |
| 折线/柱状图 | `xychart-beta` | 简单趋势对比（v11 beta，仅用于轻量示意） |

## 进阶图表类型

下面两种图表在普通流程图之外很有表现力，已在博客中实战验证可正常渲染。

### 思维导图 mindmap

适合把一个主题发散成多层结构，例如「失败空间」「知识地图」「方案分类」。

```html
{{< mermaid >}}
mindmap
  root(("整帧/全身<br/>失败空间"))
    身份
      "1 分钟后身份漂移"
      "脸部细节变化"
    动作
      "手指变形"
      "手势与语义不符"
    场景
      "背景闪烁/漂移"
      "衣服纹理抖动"
    长时序
      "累积误差"
      "时序一致性下降"
{{< /mermaid >}}
```

要点：

- **层级靠缩进表达**，不用箭头。每多一级缩进就多一层子节点，缩进必须一致。
- 根节点用 `root(("文本"))` 包裹；节点文本含括号、斜杠、逗号、中英文混排等特殊字符时**必须加引号**（如 `"手势与语义不符"`、`"背景闪烁/漂移"`）。
- 节点内换行用 `<br/>`，不要用真实换行。
- 不支持 `style`/`classDef` 着色，靠层级和文本表达即可。

### 象限图 quadrantChart

适合把多个方案放进「两个维度」构成的四象限里做定位与权衡。

```html
{{< mermaid >}}
quadrantChart
  title 全身生成底座架构的成本-稳定性定位
  x-axis "训练/推理成本低" --> "训练/推理成本高"
  y-axis "长时序稳定性差" --> "长时序稳定性好"
  quadrant-1 "高成本高稳定"
  quadrant-2 "低成本高稳定"
  quadrant-3 "低成本低稳定"
  quadrant-4 "高成本低稳定"
  "GAN": [0.2, 0.2]
  "UNet + Diffusion": [0.5, 0.55]
  "DiT": [0.85, 0.85]
{{< /mermaid >}}
```

要点：

- `x-axis` / `y-axis` 用 `"左端标签" --> "右端标签"` 描述两端语义，**轴标签含特殊字符要加引号**。
- 四个象限标题分别为 `quadrant-1`（右上）、`quadrant-2`（左上）、`quadrant-3`（左下）、`quadrant-4`（右下），注意编号是逆时针。
- 数据点写成 `"名称": [x, y]`，**坐标取值范围是 0~1**（归一化），不是真实数值；点名含特殊字符同样要加引号。
- `title` 一行可以不加引号，但含冒号/括号等也建议加引号。

### 时间线 timeline

适合技术演进史、发展脉络、项目里程碑，比 gantt 轻量，不需要真实日期。

```html
{{< mermaid >}}
timeline
  title 视觉 Tokenizer 演进
  2021 : VQ-GAN
  2022 : MaskGIT
  2023 : "TiTok（1D tokenizer）"
  2024 : "TokenFlow / 双码本统一"
{{< /mermaid >}}
```

要点：

- 每行格式为 `时间段 : 事件`，同一时间段下多个事件用 `: 事件A : 事件B` 串联。
- 事件文本含括号、斜杠、中英文混排等特殊字符**必须加引号**。
- 时间段标签可以是年份，也可以是任意阶段名（如「萌芽期」）。

### 状态图 stateDiagram-v2

适合状态机、生命周期、训练/推理阶段流转。

```html
{{< mermaid >}}
stateDiagram-v2
  [*] --> 空闲
  空闲 --> 预填充: 收到请求
  预填充 --> 解码: prefill 完成
  解码 --> 解码: 逐 token 生成
  解码 --> 空闲: 输出 EOS
  解码 --> [*]: 超时中断
{{< /mermaid >}}
```

要点：

- `[*]` 表示起始/终止伪状态；转移写成 `A --> B: 触发条件`。
- 转移标签（冒号后文本）含特殊字符同样要加引号。
- 复合状态用 `state 名称 { ... }` 嵌套；并发用 `--` 分隔。

### 时序图进阶 sequenceDiagram

表格里已列出基础用法，这里补充交互逻辑写法，适合画协议通信、推理调用链。

```html
{{< mermaid >}}
sequenceDiagram
  participant C as 客户端
  participant S as 推理引擎
  participant K as KV Cache
  C->>S: 发送 prompt
  activate S
  S->>K: 写入 prefill KV
  loop 每个生成步
    S->>K: 读取历史 KV
    S-->>C: 流式返回 token
  end
  alt 命中缓存
    S->>K: 复用前缀 KV
  else 未命中
    S->>K: 重新计算
  end
  deactivate S
{{< /mermaid >}}
```

要点：

- `participant X as 别名` 定义参与者；`->>` 实线箭头、`-->>` 虚线返回。
- `loop / alt / opt / par` 块包裹一段交互；`activate / deactivate` 控制生命线激活区间。
- `Note over A,B: 文本` 可加注释；所有含特殊字符的文本加引号。

### 分支图 gitGraph

适合讲分支策略、版本演进、发布流程。

```html
{{< mermaid >}}
gitGraph
  commit id: "init"
  branch dev
  checkout dev
  commit id: "feat A"
  checkout main
  merge dev tag: "v1.0"
{{< /mermaid >}}
```

要点：

- `commit` / `branch` / `checkout` / `merge` 为核心指令；`id:` 和 `tag:` 的值用引号包裹。
- 不要在一张图里建过多分支，否则横向溢出，靠 `.mermaid-wrap` 滚动查看。

### 折线/柱状图 xychart-beta

v11 新增，可在 Mermaid 内画轻量趋势图。**注意它是 beta 特性，仅用于简单示意**，复杂数据图请用 JSXGraph（见 `plots.md`）。

```html
{{< mermaid >}}
xychart-beta
  title "推理吞吐随 batch size 变化"
  x-axis [1, 2, 4, 8, 16]
  y-axis "吞吐 (token/s)" 0 --> 4000
  line [320, 600, 1100, 2100, 3600]
{{< /mermaid >}}
```

要点：

- `x-axis [...]` 为离散刻度；`y-axis "标签" 下限 --> 上限`。
- `line [...]` 折线、`bar [...]` 柱状；可叠加多条。
- 标签含括号/单位等特殊字符要加引号。

## 通用高级特性

这些特性可跨多种图表使用（主要针对 `graph` / `flowchart`）。

### 节点着色 classDef + class

比逐个 `style` 更易维护，适合给一组节点统一上色。

```html
{{< mermaid >}}
flowchart LR
  A["输入"] --> B["编码器"]
  B --> C["解码器"]
  C --> D["输出"]
  classDef hot fill:#f5e6c0,stroke:#8b7355;
  class B,C hot;
{{< /mermaid >}}
```

<div class="info-box">
  <strong>双主题注意</strong>：本项目用 <code>theme:'base'</code> + 自定义 light/dark <code>themeVariables</code>。自定义 <code>fill</code> 是写死的固定色，在暗色模式下不会自动切换，需肉眼确认在深色背景下不撞色、文字仍清晰。能不写死颜色就尽量靠默认主题色。
</div>

### subgraph 方向控制

`subgraph` 内可用 `direction LR/TB` 单独控制子图排布方向。

```html
{{< mermaid >}}
flowchart TB
  subgraph 训练["训练阶段"]
    direction LR
    T1["前向"] --> T2["反向"] --> T3["更新"]
  end
  训练 --> 推理["推理阶段"]
{{< /mermaid >}}
```

### 多行标签与节点跳转

- 节点内换行统一用 `<br/>`（不要写真实换行）：`A["第一行<br/>第二行"]`。
- 因 `securityLevel:'loose'` 已开启，支持节点点击跳转：`click A href "https://example.com" "提示文字"`。站内跳转可填相对路径。

## 技术细节

- **渲染方式**：运行时，Mermaid.js v11 CDN（`cdn.jsdelivr.net/npm/mermaid@11`）
- **按需加载**：仅当页面包含 `class="mermaid"` 元素时注入 Mermaid.js + `mermaid-init.js`
- **主题**：双版本预渲染——每个图表同时生成 light 和 dark 两份 SVG，切换主题时 CSS 显隐，零重渲染
- **样式**：外层 `.mermaid-dual` 提供圆角背景框和居中对齐；内部 `.mermaid-d` / `.mermaid-d--dark` 控制可见性
- **缩进**：shortcode 内部支持任意缩进，构建时自动去除公共前导空白

## 注意事项

- Mermaid 代码块内不要写 LaTeX 公式（Mermaid 不支持）
- 中文标签直接写即可，Mermaid 原生支持 Unicode
- **硬性规则：节点或边标签只要包含括号、斜杠、箭头、冒号、逗号、数学符号、HTML 符号或中英文混排，就必须使用引号标签**，例如 `F["数字系统函数 H(z)"]`、`C -->|"高通 / 带通 / 带阻"| E`。不要写 `F[H(z)]`、`C -->|高通/带通/带阻| E` 这类裸标签，Mermaid v11 运行时可能解析失败，导致整张图不渲染。
- 课程笔记里的公式名不要直接写成 LaTeX；用普通文本表达，例如写 `H(z)`、`z^-1`，并放在引号标签中。
- 节点标签含特殊字符时用方括号 + 引号：`A["label"]`；判断节点用花括号 + 引号：`C{"label"}`。
- 图表过宽时 `.mermaid-wrap` 会自动水平滚动
- **mindmap**：层级只靠缩进，不能用箭头；节点含括号/斜杠/中英文混排必须加引号；换行用 `<br/>`；不支持 `style` 着色。
- **quadrantChart**：数据点坐标是 0~1 归一化值而非真实数据；象限编号逆时针（quadrant-1 右上 → quadrant-4 右下）；轴标签和点名含特殊字符要加引号。
- **timeline / stateDiagram / sequenceDiagram / gitGraph**：所有事件、转移、注释、id/tag 文本含特殊字符一律加引号，规则与流程图一致。
- **xychart-beta**：beta 特性，仅用于轻量趋势示意，复杂数据图用 JSXGraph（见 `plots.md`）。
- **classDef 自定义颜色**：`fill` 是写死的固定色，暗色模式不自动切换，需双主题肉眼确认不撞色；能用默认主题色就不要写死。
- **classDef 颜色格式**：Mermaid v11 的 `classDef` 解析器**不支持 `rgba(r,g,b,a)` 格式**。请一律使用十六进制 `#rrggbb` 或带透明通道的 `#rrggbbaa`，例如 `fill:#6366f126`（对应 `rgba(99,102,241,0.15)`）。使用 `rgba()` 会导致整张图渲染失败。
- **不要在本项目使用** C4 图、`block-beta`、`sankey`、`requirement` 图：要么 beta 不稳定，要么在 `theme:'base'` 下样式错乱。`gantt` 用真实日期时网格线在双主题下易出问题，需重点测试。
- 当 Mermaid 流程图和对应 Algorithm 伪代码描述同一流程时，优先用 `html-components.md` 中的 `.code-tabs` 组合成“流程图 / 算法”两个标签页，避免正文纵向过长
