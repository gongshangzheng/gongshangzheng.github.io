# 本地课件引用：docref / docpage / docpages

> 从 `syntax.md` 拆分。所有课件 PDF/PPT 引用相关语法集中在此。
> 详细语法基于 `lib/shortcodes/docref.js` 的实际实现。

---

## 文件路径规范

课件文件直接放到博客仓库的 `src/media/` 目录。构建时复制到 `public/media/`，引用时路径相对于 `src/media/` 写即可。

所有 PDF/PPT 课件统一存放在 `src/media/pdf/课程名/` 目录下，引用时路径以 `pdf/` 开头：

```
src/media/
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

1. 只是引用出处 → `docref`
2. 需要读者直接看到某一页 → `docpage`
3. 需要连续展示多页 → `docpages`
4. 不要用 `docpage mode="ref"` 伪装引用卡；引用语义统一用 `docref`
5. 不要大量插入 `docpage`；只在正文确实依赖页面内容时使用

---

## 轻量引用：docref

```html
{{< docref "pdf/dsp/第一讲1.pdf" page=21 title="卷积和定义" >}}
{{< docref "pdf/dsp/第一讲1.pptx" page=21 title="卷积和定义" >}}
```

`docref` 不加载 PDF.js，只显示文件名、页码、标题和打开链接。比普通 `<a>` 链接多文件名、页码、标题信息，但不占大块页面空间。

适合：
- 前置知识回顾中的"去哪里补"
- 公式、定义、定理、例题的出处标注
- 参考来源和课程材料索引

---

## 单页展示：docpage

```html
{{< docpage "pdf/dsp/第一讲1.pdf" page=21 title="卷积和定义与四步法" >}}
```

默认 `mode="canvas"`：前端使用 PDF.js 把指定页渲染到 canvas。PDF.js 只在页面实际包含 `docpage/docpages` canvas 时注入，不会全站默认加载。

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
