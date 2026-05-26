---
name: blog-search
description: |
  博客内容检索与定位技能。当需要查找博客中已有的文章、检查某个话题是否已写过、按标签/分类/关键词搜索文章、获取文章的 slug 和元数据、或在写新文章前避免重复时使用。
  MANDATORY TRIGGERS: 搜索博客, 查找文章, blog search, 博客里有没有, 找一下博客中的, 检查是否已写过, 列出博客文章, 博客文章列表, 有没有关于, 找相关文章, 博客检索
---

# Blog Content Search

教 Agent 如何高效检索博客中已有的文章内容，避免重复创作、快速定位相关文章。

---

## 检索方法（按效率排序）

### 方法 1：grep 搜索文章源文件（最快，推荐首选）

博客所有源文件在 `src/pages/` 目录下（291 个文件），直接用 grep 搜索：

```bash
# 按关键词搜索文章标题和内容
cd ~/gongshangzheng.github.io
grep -rl "关键词" src/pages/ --include="*.html" --include="*.md"

# 搜索标题（frontmatter 中的 title 字段）
grep -r "title:" src/pages/ | grep "关键词"

# 搜索特定标签
grep -r "tags:.*关键词" src/pages/

# 搜索特定分类
grep -r "categories:.*关键词" src/pages/

# 搜索特定子分类
grep -r "subcategory:.*关键词" src/pages/

# 查看某篇文章的完整 frontmatter（前 15 行）
head -15 src/pages/<slug>.html
```

### 方法 2：post-index.json（slug ↔ title 映射）

构建时自动生成 `public/post-index.json`，包含所有文章的 title 和 slug：

```bash
# 列出所有文章标题和 slug
cat public/post-index.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for p in data:
    print(f\"{p['slug']}  →  {p['title']}\")
"

# 搜索标题中包含某关键词的文章
cat public/post-index.json | python3 -c "
import json, sys
keyword = sys.argv[1]
data = json.load(sys.stdin)
for p in data:
    if keyword.lower() in p['title'].lower():
        print(f\"{p['slug']}  →  {p['title']}\")
" "关键词"
```

### 方法 3：search-index.json（完整元数据）

构建时自动生成 `public/search-index.json`，每篇文章包含：title, description, created_at, tags, categories, subcategory, url。

```bash
# 按标签搜索
cat public/search-index.json | python3 -c "
import json, sys
tag = sys.argv[1]
data = json.load(sys.stdin)
for p in data:
    if tag.lower() in [t.lower() for t in p.get('tags', [])]:
        print(f\"{p['slug']}  →  {p['title']}  [{', '.join(p['tags'])}]\")
" "标签名"

# 按分类搜索
cat public/search-index.json | python3 -c "
import json, sys
cat = sys.argv[1]
data = json.load(sys.stdin)
for p in data:
    if cat.lower() in [c.lower() for c in p.get('categories', [])]:
        sub = p.get('subcategory', '')
        print(f\"{p['slug']}  →  {p['title']}  [{cat}/{sub}]\")
" "AI"

# 按子分类搜索
cat public/search-index.json | python3 -c "
import json, sys
subcat = sys.argv[1]
data = json.load(sys.stdin)
for p in data:
    if p.get('subcategory', '').lower() == subcat.lower():
        print(f\"{p['slug']}  →  {p['title']}  [{p['categories']}/{subcat}]\")
" "Visual Tokenizer"
```

### 方法 4：find 按文件名定位

```bash
# 按文件名模式查找
find src/pages/ -name "*关键词*"

# 列出所有文章 slug
ls src/pages/ | grep -v "^index\|^about\|^article-template"
```

---

## 常用检索场景

### 场景 1：写新文章前检查是否已写过

```bash
# 检查标题中是否已有相关文章
grep -ri "主题关键词" src/pages/ --include="*.html" -l

# 检查标签
grep -r "tags:.*关键词" src/pages/

# 如果找到相关文章，查看其内容范围
head -50 src/pages/<slug>.html
```

### 场景 2：列出某个分类下的所有文章

```bash
# 方法 A：grep frontmatter
grep -rl "categories:.*课程" src/pages/ | xargs -I{} head -8 {} | grep "title:"

# 方法 B：search-index.json（更完整）
cat public/search-index.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
cat = '课程'
grouped = {}
for p in data:
    if cat in p.get('categories', []):
        sub = p.get('subcategory', '未分类')
        grouped.setdefault(sub, []).append(p)
for sub, posts in sorted(grouped.items()):
    print(f'\n=== {sub} ({len(posts)} 篇) ===')
    for p in posts:
        print(f\"  {p['title']}\")
"
```

### 场景 3：查找相似主题的文章

```bash
# 搜索内容中包含特定技术术语的文章
grep -rl "扩散模型\|Diffusion" src/pages/ --include="*.html" | while read f; do
    slug=$(basename "$f" .html)
    title=$(grep "^title:" "$f" | head -1 | sed 's/title: *//')
    echo "$slug → $title"
done
```

### 场景 4：获取文章的完整元数据

```bash
# 读取某篇文章的 frontmatter
head -20 src/pages/<slug>.html
```

Frontmatter 字段说明：title, description, created_at, updated_at, tags, categories, subcategory, mathjax, hero_title, hero_sub, hero_tagline, notify, draft, toc。

### 场景 5：统计博客内容概况

```bash
# 文章总数
ls src/pages/*.html src/pages/*.md 2>/dev/null | wc -l

# 分类统计
grep -h "^categories:" src/pages/*.html | sort | uniq -c | sort -rn

# 标签统计（前 20）
grep -h "tags:" src/pages/*.html | sed 's/.*tags: *//' | tr ',' '\n' | sed 's/[][]//g; s/"//g; s/^ *//; s/ *$//' | sort | uniq -c | sort -rn | head -20

# 最近创建的文章
grep -h "created_at:" src/pages/*.html | sort -t: -k2 | tail -10
```

---

## 文章 URL 规则

| 页面类型 | 源文件 | 输出 URL |
|----------|--------|----------|
| 普通文章 | `src/pages/<slug>.html` | `/<slug>.html` |
| 标签索引 | — | `/tags/<tag-slug>.html` |
| 分类索引 | — | `/categories/<cat-slug>.html` |
| 子分类索引 | — | `/categories/<cat-slug>/<subcat-slug>.html` |
| 文章列表 | — | `/posts.html` |

`taxonomySlug()` 将分类/标签名转为 URL slug，保留大小写。

---

## 注意事项

1. **源文件是权威来源**：`src/pages/` 下的 `.html` 和 `.md` 文件是文章的唯一权威来源。`public/` 下的 JSON 索引和 HTML 是构建产物，可能不是最新的（需要 `node build.js` 重建）。
2. **构建后再查索引**：如果刚创建了新文章，需要先 `node build.js` 再查 `search-index.json` / `post-index.json`。而 grep 源文件始终是实时的。
3. **grep 更可靠**：对于精确搜索，grep 源文件比解析 JSON 更可靠，因为不需要先构建。
4. **避免重复**：写新文章前务必检索已有内容，避免主题重叠。如果发现已有相关文章，考虑是补充还是新建。
