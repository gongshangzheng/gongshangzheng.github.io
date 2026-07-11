---
name: book-to-blog-publish
description: Phase 6 Hub + 发布。配合 book-to-blog/SKILL.md 使用。
---

# Phase 6 · Hub + 发布

**目标**：建/更新 Hub 页，构建校验，git push。发布流程见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md`。

## 6.1 Hub 页

`full` 模式 ≥ 2 篇 → 必建 Hub（capture.js `--hub`）。Hub 内容见 `phases/structure.md` §2.4。

Hub frontmatter：
```yaml
aliases: ["categories/读书笔记/美国职业罪犯/index", "categories/读书笔记/美国职业罪犯"]
sub_id: 0
```
`/index` 后缀替换 taxonomy 索引页。

## 6.2 chapter-nav 双向更新

发布全部文章后：
- 每篇 chapter-nav：prev = 上一篇，hub = Hub，next = 下一篇
- 第一篇 prev 暂缺，末篇 next 暂缺
- 逐篇互链

## 6.3 分类注册回顾

确保（见 `blog-categories` SKILL）：
- `data/category-names.json` 已加新分类名 → slug 映射
- `data/taxonomy-slugs.json` 已删（强制重建）
- `node build.js` 后 `public/categories/` 下目录名是英文 slug
- `blog-categories/references/subcategory-organization.md` 已登记新系列的已发布清单

## 6.4 验证清单

逐项检查，不可跳过：

1. `node build.js` 成功
2. `node lib/lint-html.js <每篇>.html` 无错
3. frontmatter：aliases 路径一致、sub_id 步长 10 无重复、Hub sub_id 0
4. 小节标题带 class（`section-title`/`ch-section`）
5. 图片（若有）用 `.photo` 包裹、WebP、`media/images/<slug>/` 下
6. 底部 `.sources` 每条有 `data-cite-key`，正文事实句标 `#key#`
7. 三路 Review P0 已修复
8. chapter-nav 双向完整

## 6.5 发布

```bash
cd ~/gongshangzheng.github.io
git add src/pages/<slug>-*.html data/category-names.json \
        .agents/skills/blog-categories/references/subcategory-organization.md \
        raw/<slug>/ media/images/<slug>/
git commit -m "feat(book-to-blog): add <书名> series (N 篇 + Hub)"
git push
```

## 6.6 邮件通知

frontmatter `notify: true` 时由 html-blog 发布流程自动发邮件。整本书系列默认不发邮件（避免刷屏），除非用户要求。

## Gate 条件

- [ ] Hub 页已建/更新
- [ ] chapter-nav 双向完整
- [ ] build + lint 通过
- [ ] git push 成功
- [ ] subcategory-organization.md 已登记
