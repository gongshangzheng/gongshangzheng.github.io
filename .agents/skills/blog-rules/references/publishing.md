# 发布流程

> 本文档是博客发布的唯一事实来源。所有 skill 的发布步骤必须遵循本文档。

---

## 发布前验证清单

进入发布前，必须逐项确认：

| # | 检查项 | 验证方法 |
|---|--------|---------|
| 1 | Review 已全部完成并处理 | 所有 P0/P1 问题已修复 |
| 2 | 引用使用 `$@key$` 语法 | `grep -c '\$@' src/pages/<slug>.html` > 0 |
| 3 | `.sources` 列表每条有 `data-cite-key` | `grep 'data-cite-key'` 数量与引用一致 |
| 4 | 图片数量达标 | `ls media/images/<slug>/` ≥ 3 张 |
| 5 | 字数达标 | 粗略统计正文中文字数 |
| 6 | MathJax 语法正确 | 无裸 `λ`、`_`、`->` 等被 mark 误识别 |
| 7 | frontmatter 完整 | `updated_at` 已更新 |
| 8 | 正文无元叙述 | 无"这篇专门讲""按要求生成""旧文"等任务过程表述 |

---

## 创建 HTML 骨架

```bash
# 普通文章
node ~/.agents/skills/html-blog/capture.js <slug>

# 需要邮件通知
node ~/.agents/skills/html-blog/capture.js <slug> --notify

# Hub 页
node ~/.agents/skills/html-blog/capture.js <slug> --hub

# 课程笔记
node ~/.agents/skills/html-blog/capture.js <slug> --course
```

输出路径：`~/gongshangzheng.github.io/src/pages/<slug>.html`

---

## 构建验证

```bash
cd ~/gongshangzheng.github.io
node build.js
```

预期：所有 tests passed，零失败。若出现 ERROR 或 WARN，必须修复后再发布。

---

## Git 发布

```bash
cd ~/gongshangzheng.github.io
git add -A
git commit -m "post: <标题>"
git push
```

---

## 验证发布结果

```
https://gongshangzheng.github.io/<slug>.html
```

---

## 邮件通知

由 html-blog 统一控制。创建文章时使用 `--notify` 参数即可：

```bash
node ~/.agents/skills/html-blog/capture.js <slug> --notify
```

html-blog 发布流程会自动检查 frontmatter 中的 `notify` 字段并发送通知。

**上游 skill 不要自行调用 send.py。**

---

## 发布后 Hub 更新

若新文章的 `subcategory` 匹配某个 Hub 页：

1. 在 Hub 页追加或更新 `chapter-list`
2. 更新阅读路径和显示编号
3. 同步检查 `sub_id` 排序一致性
4. 重新 `node build.js`

若无匹配 Hub 页则跳过。

---

## 系列文章发布额外步骤

系列文章（≥2 篇）发布时：

1. 所有文章共享同一 `categories` + `subcategory`
2. 每篇文章有唯一 `sub_id`（参见 series-rules.md）
3. Hub 总览篇设 `aliases` 接管 taxonomy index
4. 每篇文章 frontmatter 加 `hub: <hub-slug>`
5. 编号与 Hub 一致性检查（参见 series-rules.md §分配前检查）

详见 `~/.agents/skills/blog-rules/references/series-rules.md`。
