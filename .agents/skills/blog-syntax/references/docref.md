# 本地课件引用：docref / docpage / docpages

> 从 `syntax.md` 拆分。所有课件 PDF/PPT 引用相关语法集中在此。
> 详细语法基于 `lib/shortcodes/docref.js` 的实际实现。

---

## 文件路径规范

课件文件直接放到博客仓库的 `media/` 目录。构建时复制到 `public/media/`，引用时路径相对于 `media/` 写即可。

所有 PDF/PPT 课件统一存放在 `media/pdf/课程名/` 目录下，引用时路径以 `pdf/` 开头：

```
media/
├── pdf/                    ← 所有课件 PDF
│   ├── 线性代数/
│   ├── 概率论/
│   ├── 通信原理/
│   ├── dsp/
│   └── ...
├── *.mp3                   ← 背景音乐等非课件媒体
└── images/                 ← 图片资源（由 assets 管理）
```

引用示例：`{{< docpage "pdf/线性代数/3.1.pdf" page=2 >}}`

---

## 三种语义

| 组件 | 语义 | 页面占用 | 是否加载 PDF.js | 使用场景 |
|------|------|----------|-----------------|----------|
| `docref` | **引用**某个课件文件或某一页 | 小，接近增强版链接 | 否 | 前置知识、公式出处、教材页码、参考来源 |
| `docpage` | **展示**某一页课件内容 | 大，占用一个 figure 区块 | 是（默认 canvas） | 正文讲解依赖该页的图、公式、版面 |
| `docpages` | **展示**多页连续课件内容 | 很大，多页 figure 区块 | 是 | 连续推导、例题步骤、图组对比 |

**优先级规则**：

1. 课件页内容已经被正文完整转述、解释或推导，只需要标注出处 → `docref`
2. 正文没有完整复现该页内容，读者需要打开课件页才能理解图、公式、框图、频谱、推导或例题版面 → `docpage`
3. 需要连续展示多页推导、例题步骤或图组对比 → `docpages`
4. 不要用 `docref` 代替正文说明。每个 `docref` 前后必须说明它引用了什么知识点、该知识点如何支撑正文；不能只丢一个“见课件第 N 页”的链接。
5. `docpage`/`docpages` 也必须服务于正文叙述，按“导读段 → 课件页 → 回扣段”放置：页面前说明读者要看什么知识点、为什么看；页面后把课件内容接回正文概念、例题或下一步推导。禁止把课件页当作孤立截图乱插。
6. **正文禁写页码叙述**：`docref`、`docpage`、`docpages` 前后的导读和回扣只写知识点内容，严禁写“第 X 页说明/展示/给出……”“第 X–Y 页把……连成一条线”“详细说明在第 X 页”这类把页码当正文叙述的句子。页码只允许出现在 shortcode 参数、链接元数据或参考来源列表中。
6. 不要用 `docpage mode="ref"` 伪装引用卡；引用语义统一用 `docref`
7. 不要大量插入 `docpage`；只在正文确实依赖页面内容时使用

---

## 轻量引用：docref

```html
{{< docref "pdf/dsp/第一讲1.pdf" page=21 title="卷积和定义" >}}
{{< docref "pdf/dsp/第一讲1.pptx" page=21 title="卷积和定义" >}}
```

`docref` 不加载 PDF.js，只显示文件名、页码、标题和打开链接。比普通 `<a>` 链接多文件名、页码、标题信息，但不占大块页面空间。

适合：
- 前置知识回顾中的"去哪里补"，且正文已经说明需要补的具体概念
- 公式、定义、定理、例题的出处标注，且正文已经完整写出公式/定义/推导/例题结论
- 参考来源和课程材料索引，且每条索引说明材料用途

不适合：
- 课件页里有正文没有复现的演示图、系统框图、频谱图、几何图或例题版面
- 读者必须看到原 PDF 页才能理解上下文
- 只是为了“看起来有引用”而放一个孤立链接

遇到以上情况应使用 `docpage` 或 `docpages`。

---

## 单页展示：docpage

```html
{{< docpage "pdf/dsp/第一讲1.pdf" page=21 title="卷积和定义与四步法" >}}
```

默认 `mode="canvas"`：前端使用 PDF.js 把指定页渲染到 canvas。PDF.js 只在页面实际包含 `docpage/docpages` canvas 时注入，不会全站默认加载。

**放置前必须确认页内容。** 不要只按页码或标题猜测课件页讲什么。若需要视觉确认 PDF 指定页：
- **当前工作机专属**：在 tangwen 当前工作机上，可以用 `~/.venv` + `PyMuPDF` 把指定页渲染成 PNG，再用 `read_file` 读取图片确认内容。这是当前机器能力，不是通用环境假设。
- 其他环境：先检查是否有 `pdftoppm`、视觉 MCP 或其他 PDF 渲染/图片理解工具。

可选 iframe 模式：

```html
{{< docpage "pdf/dsp/第一讲1.pdf" page=21 title="卷积和定义" mode="iframe" >}}
```

---

## 多页展示：docpages

```html
{{< docpages "pdf/dsp/第一讲1.pdf" pages="21,25,35,46-47" title="卷积推导" >}}
```

`pages` 支持逗号列表和范围。每一页会生成一个 PDF.js canvas figure。

---

## PPT / PPTX 注意

浏览器不能可靠地直接打开 PPT/PPTX 的指定 slide。`docpage` 遇到 PPT/PPTX 会自动退化为 `docref` 引用卡。若需要沉浸式显示 PPT 页，先转成 PDF 再用 `docpage/docpages` 引用。

---

## 旧语法兼容

```html
{{< pdf "dive-into-llms/chapter3.pdf" page=13 title="ROME 因果追踪图" >}}
{{< ppt "games302/lecture04.pptx" page=8 title="参数化示意图" >}}
```

`pdf` 走 iframe 预览；`ppt` 走引用卡。新课程笔记优先使用 `docpage/docpages/docref`。
