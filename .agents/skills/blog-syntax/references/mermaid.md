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

## 技术细节

- **渲染方式**：运行时，Mermaid.js v11 CDN（`cdn.jsdelivr.net/npm/mermaid@11`）
- **按需加载**：仅当页面包含 `class="mermaid"` 元素时注入 Mermaid.js + `mermaid-init.js`
- **主题**：双版本预渲染——每个图表同时生成 light 和 dark 两份 SVG，切换主题时 CSS 显隐，零重渲染
- **样式**：外层 `.mermaid-dual` 提供圆角背景框和居中对齐；内部 `.mermaid-d` / `.mermaid-d--dark` 控制可见性
- **缩进**：shortcode 内部支持任意缩进，构建时自动去除公共前导空白

## 注意事项

- Mermaid 代码块内不要写 LaTeX 公式（Mermaid 不支持）
- 中文标签直接写即可，Mermaid 原生支持 Unicode
- 节点标签含特殊字符时用方括号 `[]` 或引号包裹
- 图表过宽时 `.mermaid-wrap` 会自动水平滚动
