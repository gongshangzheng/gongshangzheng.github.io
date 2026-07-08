---
name: deep-review-html-format
description: 三审机制 · HTML 规范审查。专门检查 HTML 报告是否符合 html-blog 规范和 build.js 兼容性。
trigger: deep-research 调研笔记 Review · HTML 规范审查
---

# Deep-Research Review Agent: HTML 规范审查

## 职责

专门审查调研 HTML 报告的文件质量——html-blog 组件规范遵守情况、MathJax 渲染正确性、build.js 兼容性。

## 检查维度

### 1. 禁止标签检查

搜索以下字符串，预期结果为零：
- [ ] `<html>` / `<head>` / `<body>` / `<nav>` / `<footer>` / `<script>` / `<style>`
- [ ] 残留的 `##` / `###` / `- 列表` 裸 markdown 语法

### 2. frontmatter 完整性

检查 YAML 字段是否存在且格式正确：
- [ ] `title:` / `date:` / `tags:` / `aliases:` (含 `categories/` 路径) / `hero_title:` / `hero_sub:` / `hero_tagline:`
- [ ] `categories` 必须为 `["研究综述"]`（调研类固定值，从 html-blog §1.3 允许列表选取）
- [ ] 含公式时有 `mathjax: true`

### 3. html-blog 组件规范

**章节标题（`.ch` 组件）：**
```html
<div class="ch fade-in">
  <div class="ch-title">章节标题</div>
  <p>正文...</p>
</div>
```
- [ ] 所有 `##` 已替换为 `.ch` 组件
- [ ] 没有残留 `#` markdown 语法

**小节（`.section` 组件）：**
```html
<div class="section">
  <h3 class="section-title">小节标题</h3>
  <p>正文...</p>
</div>
```
- [ ] 所有 `###` 已替换为 `.section` + `h3.section-title`

**参考来源（`.sources` 组件）：**
```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li><a href="..." target="_blank">来源名称</a></li>
  </ul>
</div>
```

**表格（`.table-wrap` 包裹）：**
```html
<div class="table-wrap">
  <table>...</table>
</div>
```

### 4. MathJax 渲染
- [ ] 行内公式用 `$...$`
- [ ] 独立公式用 `$$...$$`（在 `<p style="text-align:center;">` 中）
- [ ] 公式中 `<` 替换为 `\lt`

### 5. build.js 验证

```bash
cd ~/gongshangzheng.github.io && node build.js
```
- [ ] 83 tests passed，零失败
- [ ] 文件被正确处理

### 6. 修复优先级清单

```
P0（必须修复）：
P1（强烈建议）：
P2（可选）：
```

## 输出格式

```org
* HTML 规范审查报告

** 禁止标签检查
<grep 结果，预期全为 0>

** frontmatter 完整性
<每个字段检查结果>

** html-blog 组件规范
<问题 + 行号 + 正确写法>

** MathJax 问题

** build.js 验证结果

** 修复优先级
P0：
P1：
P2：

** 总体评级
A / B / C / D + 理由
```

## 强制要求

- 读取 ~/gongshangzheng.github.io/src/pages/<slug>.html 实际文件
- 执行 `node build.js` 验证
- 每个问题标注具体行号