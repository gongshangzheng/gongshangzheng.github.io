# Phase 5 — 验证、发布与邮件

本阶段的通用发布规则（capture.js 调用、HTML 验证、git push、邮件通知）见：

```
~/gongshangzheng.github.io/.agents/skills/blog-rules/references/publishing.md
```

本文档只补充 historical-narrative 特有的验证项。

---

## historical-narrative 特有验证

除了 publishing.md 的通用清单，还需检查：

- frontmatter 中 `categories` / `subcategory` 是否符合 `blog-categories` skill 规范（如"历史"→对应子分类）
- 文末参考来源块完整（史学来源标注清晰，区分一手/二手来源）
- 编年体结构完整（每个时间段有独立 `.ch` 章节）
- 关键场景、日期、数字和引语未被压缩删除
- 如有背景音乐，frontmatter 已添加 `audio_src` 字段

---

## 验证流程

本地 build：

```bash
cd ~/gongshangzheng.github.io && node build.js
python3 -m http.server 8080 --directory public
```

打开：

```text
http://localhost:8080/<slug>.html
```

检查：
- 无 `<html><head><nav><footer><script>` 标签
- `.ch` 章节结构完整
- 所有图片占位符已替换为本地路径

---

## 更新 Hub 页

`node build.js` 已自动根据 frontmatter 生成 taxonomy index，无需手动维护。

本步骤仅处理**手动维护的专题 Hub 页**（`src/pages/*-hub.html`）：

1. 检查新文章的 `subcategory` 是否与某个 Hub 页匹配
2. 若匹配，在 Hub 页合适位置追加 `period-card` 链接，更新 `updated_at`
3. `node build.js` 重新构建
4. 无匹配 Hub 页则跳过

系列文章规则（sub_id、Hub 别名、编号）见 `~/gongshangzheng.github.io/.agents/skills/blog-rules/references/series-rules.md`。

---

## 发布（调用 blog-rules/publishing.md）

```bash
cd ~/gongshangzheng.github.io
node build.js
git add -A
git commit -m "post: <标题>"
git push
```

验证：`https://gongshangzheng.github.io/<slug>.html`
