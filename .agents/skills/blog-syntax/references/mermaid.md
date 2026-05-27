# Mermaid 图表：`{{< mermaid >}}`

> 从 `syntax.md` 拆分。所有 Mermaid 语法集中在此。

---

## 基本语法

在 HTML 源文件中直接写 Mermaid 语法，构建时转为 `<pre class="mermaid">` 块，页面加载时由 Mermaid.js 在客户端渲染为 SVG。

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
- **按需加载**：仅当页面包含 `class="mermaid"` 元素时注入 Mermaid.js
- **主题**：自动匹配博客 dark 模式，使用 Mermaid dark 主题
- **样式**：外层 `.mermaid-wrap` 提供圆角背景框和居中对齐
- **缩进**：shortcode 内部支持任意缩进，构建时自动去除公共前导空白

## 注意事项

- Mermaid 代码块内不要写 LaTeX 公式（Mermaid 不支持）
- 中文标签直接写即可，Mermaid 原生支持 Unicode
- 节点标签含特殊字符时用方括号 `[]` 或引号包裹
- 图表过宽时 `.mermaid-wrap` 会自动水平滚动
