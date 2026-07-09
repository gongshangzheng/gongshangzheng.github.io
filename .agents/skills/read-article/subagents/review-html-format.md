---
name: review-html-format
description: 专门检查 HTML 论文解读是否严格遵守 html-blog 规范和 build.js 兼容性要求。
trigger: 论文精读 HTML Review · HTML 格式规范审查
---

# Review Agent: HTML 格式规范审查

## 职责

专门审查 HTML 论文深度解读的文件质量--html-blog 组件规范遵守情况、MathJax 渲染正确性、build.js 兼容性,以及整体可读性。

## 输入

- 论文标题:<title>
- Slug:<slug>
- HTML 文件:~/gongshangzheng.github.io/src/pages/<slug>.html

## 检查维度

### 1. 禁止标签检查

在 HTML 文件中搜索以下字符串,预期结果应为零:
- [ ] `<html>`(整个文件不应有)
- [ ] `<head>`(整个文件不应有)
- [ ] `<body>`(整个文件不应有)
- [ ] `<nav>`(整个文件不应有)
- [ ] `<footer>`(整个文件不应有)
- [ ] `<script>`(整个文件不应有)
- [ ] `<style>`(整个文件不应有)

### 2. frontmatter 完整性

检查以下 YAML 字段是否存在且格式正确:
- [ ] `title:` - 页面标题,字符串
- [ ] `description:` - meta description,一句话
- [ ] `created_at:` - `YYYY-MM-DDTHH:mm:ss` 格式
- [ ] `updated_at:` - `YYYY-MM-DDTHH:mm:ss` 格式
- [ ] `tags:` - `[tag1, tag2, ...]` 格式,数组,3-5 个(**硬性上限 5 个**,超过标记为 P1)
- [ ] `aliases:` - 含 `categories/` 路径,从 blog-categories skill 选取
- [ ] `mathjax:` - 含公式时必须为 `true`
- [ ] `hero_title:` - Hero 区域大标题
- [ ] `hero_sub:` - Hero 副标题(含论文类型/会议/年份)
- [ ] `hero_tagline:` - 一句话核心贡献
- [ ] `papers:` - 论文的 arXiv/DOI 链接数组(论文解读文章必填)
- [ ] `repos:` - 代码仓库 URL 数组(有开源代码时必填)

### 3. html-blog 组件规范

**HTML 标签配对检查（P0 级）：**
- [ ] 所有 `<p>` 都有对应的 `</p>`，且 `</p>` 前必须有对应的 `<p>`
- [ ] 所有 `<div>` 都有对应的 `</div>`，嵌套层级正确
- [ ] 没有孤立的闭合标签（如单独的 `</p>` 没有对应 `<p>`）
- [ ] 用 `node lib/lint-html.js <file>` 验证标签配对，所有 error 必须修复

**章节标题（必须用 `.ch` 组件）：**
```html
<div class="ch fade-in">
  <div class="ch-title">章节标题</div>
  <p>正文...</p>
</div>
```
- [ ] 所有章节使用 `.ch` 组件
- [ ] 没有残留的 `#` / `##` / `###` markdown 语法

**参考来源(必须用 `.sources` 组件):**
```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li><a href="https://..." target="_blank">来源名称</a></li>
  </ul>
</div>
```
- [ ] 参考来源使用 `.sources` 组件
- [ ] 没有裸 `<ul><li>URL</li></ul>` 格式

**章节导航(必须用 `.chapter-nav` + 方向 class):**
- [ ] 文章末尾有 `<div class="chapter-nav">` 组件
- [ ] 每个 `.nav-card` 都有方向 class:`nav-prev`、`nav-hub` 或 `nav-next`
- [ ] prev/next 卡片有 `<span class="nav-arrow">` 箭头

**表格(必须用 `.table-wrap` 包裹):**
```html
<div class="table-wrap">
  <table>...</table>
</div>
```
- [ ] 所有 `<table>` 被 `.table-wrap` 包裹
- [ ] 表头用 `<th>`,内容用 `<td>`

### 4. MathJax 渲染检查

- [ ] frontmatter 有 `mathjax: true`
- [ ] 行内公式分隔符正确（`$...$`）
- [ ] 独立公式分隔符正确（`$$...$$`）
- [ ] 公式中 `<` 字符已替换为 `\lt`
- [ ] **LaTeX 命令有效性**：检查所有 `\command` 是否为 MathJax 支持的标准命令。常见错误：`\vp`（应为 `\varphi`）、`\eps`（应为 `\epsilon`）、`\R`（应为 `\mathbb{R}`）等非标准缩写。发现非标准命令标记为 P0

### 5. 图片组件规范

```html
<div class="photo">
  <img src="media/images/<slug>/image_xxx.webp" alt="描述" loading="lazy">
  <div class="cap">图 1：图片描述（来源：论文名, Fig.N）</div>
</div>
```
- [ ] 使用 `.photo` + `.cap` 组件
- [ ] 图片路径引用实际存在的文件（**必须用 `ls media/images/<slug>/` 验证文件存在**）
- [ ] 图片格式为 WebP（`.webp` 后缀）
- [ ] 至少 3 张关键图片（综述类文章 ≥ 5 张，每篇 must-read-paper ≥ 1 张原图）
- [ ] 每张图有来源标注，明确区分"论文原图 / 官方图 / PDF crop / 网络图 / 代码绘制示意图"
- [ ] arXiv 论文图片优先从 source tarball 提取；不得用代码绘制图替代可获得的论文原图
- [ ] **零图片检查**：如果整篇文章没有任何 `<img>` 标签，标记为 P0（阻断级），必须从 arXiv source tarball 提取论文原图后重新插入
- [ ] 关键图片的理解来源是否可追踪：caption / 正文解释 / read 工具视觉理解或 GLM MCP 视觉工具结果
- [ ] 至少 1 张代码绘制图（mermaid/jsxgraph），仅作为补充示意

### 6. 字数检查

- [ ] HTML 正文总量:常规论文 ≥ 3000 字;复杂系统/综述论文 ≥ 4000 字
- [ ] 方法核心章节 ≥ 1000 字

### 7. build.js 兼容性验证

执行:
```bash
cd ~/gongshangzheng.github.io && node build.js
```
- [ ] 构建零失败
- [ ] HTML 文件被正确处理
- [ ] 无 build 错误

## 输出格式

```org
* HTML 格式规范审查报告

** 禁止标签检查
<搜索结果,预期全为 0>

** frontmatter 完整性
<每个字段的检查结果>

** html-blog 组件规范
列出所有发现的问题及行号

** MathJax 渲染
列出所有公式分隔符问题

** 图片规范
列出所有图片问题

** 字数统计
- 总字数:<实际> / 常规论文 ≥ 3000;复杂系统/综述论文 ≥ 4000
- 方法核心:<实际> / ≥ 1000

** build.js 验证
<node build.js 的输出结果>

** 修复优先级
P0(必须修复):
P1(强烈建议):
P2(可选):

** 总体评分
A / B / C / D + 理由
```

## 强制要求

- 必须读取 ~/gongshangzheng.github.io/src/pages/<slug>.html 实际文件内容
- 必须执行 `node build.js` 验证构建
- 每个问题必须标注具体行号和错误内容
