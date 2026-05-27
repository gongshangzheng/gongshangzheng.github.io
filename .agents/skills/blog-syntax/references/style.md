# 样式参考：调色板、排版规范、CSS 模块、常见错误

> 本文档由 html-blog SKILL.md 拆分而来。需要样式细节或排查错误时按需读取。

---

## CSS 模块架构

CSS 已拆分为模块文件，存放在 `src/assets/css/modules/`。

- **构建产物**：`hugo-theme.css` 由 `build.js` 从模块自动合并生成，**不要手动编辑**
- **编辑入口**：修改 `modules/*.css` 中的对应模块文件
- **模块清单**：`src/assets/css/css-manifest.json` 定义 always/optional 分组
- **可选模块加载**：在文章 frontmatter 中声明 `css_modules: ["course"]`

详见 SKILL.md §1.6。

---

## 调色板

| 变量 | 亮色 | 暗色 | 用途 |
|------|------|------|------|
| `--bg` | #fafafa | #0f0f0f | 页面背景 |
| `--bg-deep` | #f0f0f0 | #1a1a2e | 统计条/分割背景 |
| `--card` | #ffffff | #16213e | 卡片/引用背景 |
| `--fg` | #333 | #e0e0e0 | 主文字 |
| `--fg-muted` | #555 | #b0b0b0 | 次要文字 |
| `--accent` | #c0392b | #e94560 | 主强调色 |
| `--accent-gold` | #d4a017 | #f0c040 | 辅助强调色（金） |
| `--accent-blue` | #2980b9 | #4a9eff | 辅助强调色（蓝） |

---

## 排版规范

- 正文：`font-size: 0.95rem`，`line-height: 1.8`
- 章节标题：`1.6rem`，`font-weight: 700`
- 引用文字：`1rem`，`font-style: italic`
- 图片说明：`0.82rem`，`font-style: italic`
- 正文最大宽度：`800px`

---

## 常见错误速查

| 错误 | 正确写法 |
|------|---------|
| `## 标题` | `<div class="ch fade-in"><div class="ch-title">标题</div>` |
| `### 小节` | `<div class="section"><h3 class="section-title">小节</h3>` |
| `\left( x \right)` | `\Bigl( x \Bigr)` |
| `$x < y$` | `$x \lt y$` |
| `\([...]\)` | 错误嵌套，行内使用 `$...$` 或 `\(...\)`；独立公式使用 `$$...$$` 或 `\[...\]` |
| 裸 `<li>` 无父容器 | 必须有 `<ul>` 或 `<ol>` 包裹 |
| 表格无 `.table-wrap` | `<div class="table-wrap"><table>...` |
| 图片路径不存在 | 先复制到 `src/assets/media/images/<slug>/` |
| 遗漏 `mathjax: true` | 含公式页面必须声明 |
| `categories` 错误 | 从 §1.3 允许列表中选取 |

---

## 禁止出现的内容

- ❌ `<nav>` / `<footer>` / `<script>` / 内联 `<style>`
- ❌ `<div class="hero">` / `<link rel="stylesheet">`
- ❌ `<!-- INJECT toc_sidebar -->` 占位符缺失
- ❌ 直接修改 `public/` 下的文件
- ❌ 在 HTML 中引用远程图片 URL
- ❌ 手动复制 article-template.html（用 capture.js）
- ❌ 凭记忆写 HTML 组件
- ❌ 跳过读取 article-template.html 步骤
