---
name: blog-search
description: |
  博客内容检索与定位技能。当需要查找博客中已有的文章、检查某个话题是否已写过、按标签/分类/关键词搜索文章、获取文章的 slug 和元数据、或在写新文章前避免重复时使用。
  MANDATORY TRIGGERS: 搜索博客, 查找文章, blog search, 博客里有没有, 找一下博客中的, 检查是否已写过, 列出博客文章, 博客文章列表, 有没有关于, 找相关文章, 博客检索
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Blog Content Search

教 Agent 如何高效检索博客中已有的文章内容，避免重复创作、快速定位相关文章。

---

## 检索方法（按效率排序）

### 方法 1：统一检索脚本（推荐首选）

`scripts/blog-search.py` 封装了所有常用检索逻辑，基于 `public/search-index.json`，支持 tag / category / subcategory / keyword / alias 精确或模糊匹配，以及分类体系和标签统计。

```bash
# 按 tag
~/.venv/bin/python scripts/blog-search.py --tag diffusion

# 按 category + subcategory
~/.venv/bin/python scripts/blog-search.py --category AI --subcategory 数字人

# 关键词模糊搜索（标题/描述/标签/子分类）
~/.venv/bin/python scripts/blog-search.py --keyword "视觉分词器"

# 按别名
~/.venv/bin/python scripts/blog-search.py --alias TiTok

# 组合条件（分类内搜关键词）
~/.venv/bin/python scripts/blog-search.py --category AI --keyword 3DGS

# 列出完整分类体系及文章数
~/.venv/bin/python scripts/blog-search.py --list-categories

# 列出高频标签
~/.venv/bin/python scripts/blog-search.py --list-tags --top 20

# JSON 输出（方便程序消费）
~/.venv/bin/python scripts/blog-search.py --tag GAN --format json

# 限制输出条数
~/.venv/bin/python scripts/blog-search.py --tag 论文精读 --limit 10
```

**注意**：数据源是构建产物 `public/search-index.json`，刚写完新文章后需先 `node build.js` 才能检索到。若需搜索正文内容或未构建时的实时检索，使用方法 2。

### 方法 2：grep 搜索文章源文件（未构建时 / 搜正文内容）

博客所有源文件在 `src/pages/` 目录下，直接用 grep 搜索：

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

### 场景 1.1：题目 / 考点补充前判断是“补已有专题”还是“新建专题”

当用户给出截图题、选择题、面试题、复习题，并问“补到哪”“有没有专题”“如果没有就新建”时，必须先做主题级检索，不能只按题面精确词判断。

执行顺序：

1. **抽取考点主题**：从题干中抽出核心主题和同义词。例如：
   - “空洞卷积 / Dilated Convolution / atrous convolution / 膨胀卷积” → 上位主题是“卷积 / CNN / 视觉模型”。
   - “FP8 训练数值稳定” → 上位主题是“混合精度训练 / 训练 Infra / 量化训练”。
2. **先查专题页**：同时搜索题面词和上位主题词，优先判断是否有“专门讲这个主题”的文章，而不是只看是否零散出现过。
3. **区分三种结果**：
   - **已有专题页**：标题、description、章节结构都围绕该主题展开 → 直接把题目补进该页的题库 / 复习 / 易错点区域。
   - **只有零散提及**：某些文章只在局部段落、论文解读或代码示例中提到 → 不算已有专题；新建专题页，再把题目放进去。
   - **完全没有相关内容**：新建专题页。
4. **不要把大杂烩笔记误判成专题**：如“模型层”“机器学习”“某课程 Lxx”这类覆盖多个概念的页面，除非它有完整独立章节系统讲该考点，否则只算零散承载页。

推荐命令：

```bash
cd ~/gongshangzheng.github.io
# 题面词 + 同义词
grep -Rni "空洞卷积\|Dilated Convolution\|atrous\|膨胀卷积" src/pages --include="*.html" --include="*.md"

# 上位主题词
grep -Rni "卷积\|convolution\|CNN\|卷积神经网络" src/pages --include="*.html" --include="*.md"

# 读取候选页 frontmatter 和开头，判断是否是专题
head -80 src/pages/<candidate>.html
```

决策口径：**“是否已有专题”看文章主题和结构，不看关键词是否出现。** 如果已有专题，优先补充；如果只有零散提及，才新建专题。

### 场景 2：列出某个分类下的所有文章

```bash
# 方法 A：grep frontmatter
grep -rl "categories:.*课程" src/pages/ | xargs -I{} head -8 {} | grep "title:"

# 方法 B：search-index.json（更完整）
cat public/search-index.json | ~/.venv/bin/python -c "
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
