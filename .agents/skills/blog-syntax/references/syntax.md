# 语法扩展：引用、Shortcode、Wiki 链接、站内引用

> 本文档由 html-blog SKILL.md 拆分而来。需要使用特殊语法时按需读取。
> 所有语法基于 replace.js 和 generator.js 的实际实现。
> 复杂子系统已拆分到独立文件，本文件只保留总览和简短语法。

---

## 引用语法 `$@key$`

引用使用 `$@key$` 语法（注意 `@` 前缀），构建时转换为 `<cite>@key</cite>`。

```
$@Hinton et al., 2015$
$@KL Divergence$
```

**与行内公式的区分：** 行内公式用 `$...$`（无 `@`），引用用 `$@...$`（有 `@`）。

---

## 站内文章引用 `[[@...]]`

使用 `[[@文章标题]]` 或 `[[@文章标题 | 显示文字]]` 引用站内其他文章。

> 站内文章交叉引用时，**优先使用标题引用**，而不是直接手写路径。仅在需要显式指定页面路径或页内锚点时，才使用 `[[path#anchor]]`。

```
[[@ELF: Embedded Language Flows]]
[[@ELF: Embedded Language Flows | ELF 论文]]
```

**构建时行为：**
- 服务端：将标题 slugify 为 URL（英文小写连字符），支持通过 `postMap` 精确匹配和前缀模糊匹配
- 客户端：注入 `__POST_MAP__` 脚本，页面加载后用精确 slug 替换链接
- 输出：`<a href="./slug.html" class="xref" data-xref-title="原文标题">显示文字</a>`

> 被引用的文章应使用**原始英文标题**，这样 slug 才能准确匹配。

---

## 内部跳转链接 `[[path#anchor]]`

```
[[posts.html | 返回文章列表]]
[[japan-history.html#绳文 | 跳到绳文章节]]
```

- 构建时转换为 `<a class="jump-internal">` 链接
- heading slugify 规则：保留 CJK 字符，空格转 `-`，去标点

### 课程页章节导航推荐写法

课程笔记页末尾推荐统一加入：**上一章 / 枢纽页 / 下一章**。

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

如果暂时没有上一章或下一章，建议保留卡片结构但把标题写成“待补”。

---

## Shortcode 语法总表 `{{< ... >}}`

| 语法 | 说明 |
|------|------|
| `{{< bg yellow >}}文字{{< /bg >}}` | 高亮背景（yellow/red/blue/green/purple） |
| `{{< details summary="点击展开" openByDefault=true >}}` | 可折叠块 |
| `{{< bilibili BV号 p=1 >}}` | Bilibili 嵌入 |
| `{{< youtube 视频ID "说明" >}}` | YouTube 嵌入（使用 lite-youtube） |
| `{{< video "assets/media/video/xxx.mp4" >}}` | 本地视频 |
| `{{< jsxgraph title="标题" height="300" >}}JS{{< /jsxgraph >}}` | 所有数学函数图、信号图、离散序列、冲激示意、交互演示；详细语法和踩坑记录见 `references/plots.md` |
| `{{< docref "pdf/课程/xx.pdf" page=12 title="标题" >}}` | 轻量课件引用；详细语法见 `references/docref.md` |
| `{{< docpage "pdf/课程/xx.pdf" page=12 title="标题" >}}` | 单页课件展示；详细语法见 `references/docref.md` |
| `{{< docpages "pdf/课程/xx.pdf" pages="2,4-6" title="标题" >}}` | 多页课件展示；详细语法见 `references/docref.md` |
| `{{< mermaid >}}graph TD...{{< /mermaid >}}` | Mermaid 图表；详细语法见 `references/mermaid.md` |
| `{{< pdf "..." page=12 >}}` / `{{< ppt "..." >}}` | 旧语法兼容 |

---

## 隐藏元素

- `[[D-内容]]` → 被完全移除（不渲染）
- `[[方法]]` → 被完全移除

---

## Wiki 类链接 `[[...]]`

| 语法 | 转换结果 |
|------|---------|
| `[[wiki.en Albert Einstein \| 爱因斯坦]]` | → 英文维基链接 |
| `[[wiki.zh 日本历史]]` | → 中文维基链接 |
| `[[wiki Albert Einstein]]` | → 默认英文维基（`wiki` = `wiki.en`） |
| `[[arxiv 2301.00001 abs \| 论文]]` | → ArXiv 论文链接（abs/pdf） |
| `[[arxiv 2301.00001 pdf -suffix \| PDF]]` | → ArXiv PDF（支持后缀） |
| `[[github pytorch/pytorch \| PyTorch]]` | → GitHub 仓库链接 |
| `[[google transformer architecture]]` | → Google 搜索链接 |

---

## Wiki 图片语法 `![[...]]`

```
![[filename | width # caption]]
```

| 部分 | 必填 | 说明 |
|------|------|------|
| filename | ✅ | 图片文件名 |
| width | ❌ | 宽度（像素） |
| caption | ❌ | 图片说明 |

示例：`![[sengoku-japan/nobunaga.jpg | 400 # 织田信长]]`

构建时转换为：
```html
<div class="image">
  <img loading="lazy" src="assets/media/filename" alt="filename" width="400" />
  <p class="caption">织田信长</p>
</div>
```

图片基础路径由 `imgDir` 参数控制（默认 `assets/media`）。
