---
name: review-html-format
description: 检查书→博客系列的 HTML 规范——frontmatter、组件语法、sub_id、chapter-nav、sources 是否合规。
trigger: book-to-blog HTML Review · 规范审查
---

# Review Agent: HTML 规范审查

## 职责

检查系列文章的 HTML 是否符合 `html-blog` SKILL 规范——frontmatter 字段、组件语法、sub_id 步长、chapter-nav 双向、sources 引用、build/lint 是否通过。

## 输入

- Slug：<slug>
- HTML 文件：~/gongshangzheng.github.io/src/pages/<slug>-*.html

## 检查维度

### 1. frontmatter
- [ ] `title` 符合系列命名（`<书简称>系列（N）：主题`）
- [ ] `aliases` 路径全系列一致（`categories/读书笔记/<书名>`）
- [ ] `sub_id` 步长 10、无重复、Hub 为 0
- [ ] `tags` 3-5 个
- [ ] `created_at`/`updated_at` 格式正确，created_at 未被改
- [ ] `hub` 字段指向 Hub slug
- [ ] `papers`/`repos` 存在（空也要有 `[]`）

### 2. 标题层级
- [ ] 主章节 `.ch` + `.ch-title`
- [ ] 小节 `h3.section-title` / `h4.ch-section`，无裸 h3/h4
- [ ] `.info-box` 内 h3 不带 class（例外允许）

### 3. 组件语法
- [ ] 图片用 `<div class="photo">` 包裹，WebP，`media/images/<slug>/`
- [ ] 表格用 `.table-wrap`
- [ ] display math 独占行，不包 `<p>`
- [ ] 高亮 `==...==` 或 `{{< bg >}}`
- [ ] shortcode 语法正确

### 4. 引用
- [ ] 正文事实句标 `#key#`
- [ ] 底部 `.sources` 每条 `data-cite-key`
- [ ] cite-key 与 slugify 规则一致

### 5. chapter-nav
- [ ] 每篇有 `.chapter-nav`：prev / hub / next
- [ ] 双向链接完整（A.next = B，B.prev = A）
- [ ] 首篇 prev 暂缺、末篇 next 暂缺标注正确

### 6. 构建校验
- [ ] `node build.js` 成功
- [ ] `node lib/lint-html.js <每篇>.html` 无错
- [ ] `public/categories/` 下目录名是英文 slug

## 输出格式

```org
* HTML 规范审查报告

** 合规（✅）

** 问题项（⚠️/❌）
- 文件：<slug>-chXX.html
- 问题：[具体问题]
- 修复：[建议]
```

## 强制要求

- 逐文件检查，不抽样
- build.js 和 lint-html.js 必须实跑，不凭目测判断"应该没问题"
