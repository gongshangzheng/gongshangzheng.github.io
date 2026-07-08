# arxiv-paper-digest

每日 arXiv 论文追踪与检索工具。从 RSS 抓取、关键词分类、翻译摘要，到生成 HTML 博客简报的完整 Python 管线。同时内置 arXiv API 关键词搜索能力。

## 功能

- **RSS 爬取**：定时抓取 `cs.AI` / `cs.CV` 的 arXiv RSS feed
- **智能分类**：按关键词将论文归入 `diffusion`、`autoregressive`、`image_compression`、`visual_tokenizer_1d`、`diffusion_visual_encoder` 五个方向
- **自动翻译**：摘要自动翻译为中文（DeepL / 阿里云翻译）
- **HTML 简报**：生成静态博客页面，包含分类统计和论文卡片
- **关键词搜索**：内置 arXiv API 查询构建器，支持布尔组合、时间范围、分类过滤
- **可配置输出**：数据路径和博客目录通过配置文件或环境变量自定义

## 快速开始

### 环境要求

- Python 3.12+
- 依赖自动安装：`pip install -e .`（或使用已有的 `.venv`）

### 运行

```bash
# 单次运行：爬取 + 分类 + 生成 HTML 简报
.venv/bin/python run.py --once

# 持续运行：按配置的 crawl_time 周期执行
.venv/bin/python run.py --continuous

# 持续运行前先补跑一次
.venv/bin/python run.py --continuous --repair
```

### 定时任务（launchd / cron）

```bash
# 直接调用绝对路径
~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python \
  ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/run.py --once
```

## 输出

默认输出到 `~/gongshangzheng.github.io`，可通过配置修改：

```
gongshangzheng.github.io/
├── data/daily-papers/          # 按日期的原始 JSON 数据
│   ├── diffusion/
│   ├── autoregressive/
│   ├── image_compression/
│   ├── visual_tokenizer_1d/
│   └── diffusion_visual_encoder/
└── src/pages/
    └── arxiv-digest-YYYY-MM-DD.html   # 每日 HTML 简报
```

## 配置

### 全局配置：`config/global_config.yaml`

```yaml
storage:
  base_path: "~/gongshangzheng.github.io/data/daily-papers"
  output_format: "html-blog"

logging:
  level: "INFO"
  file: "logs/crawler.log"
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ARXIV_DIGEST_BLOG_DIR` | 博客根目录 | `~/gongshangzheng.github.io` |
| `ARXIV_DIGEST_RAW_DIR` | 原始数据目录 | `{blog_dir}/data/daily-papers` |
| `ARXIV_DIGEST_BUILD` | 生成后是否执行 `node build.js` | `1` |
| `ARXIV_DIGEST_PUSH` | 生成后是否 `git push` | `0` |
| `ARXIV_DIGEST_EMAIL` | 生成后是否发送邮件 | `0` |

### 爬取规则：`rules/*.yaml`

每条规则定义一个 RSS 源，包含 URL、关键词过滤、分类映射、翻译开关等。当前有两条规则：

- `rules/arxiv_rss.yaml`：`cs.AI` 源
- `rules/arxiv_cv_rss.yaml`：`cs.CV` 源

## 关键词搜索

内置 arXiv API 查询能力，可以直接在 Python 中使用：

```python
from src.arxiv_search import Query, Taxonomy, build_query, search_by_keywords

# 构建查询
q = build_query(
    ["diffusion", "autoregressive"],
    field="title",
    categories=Taxonomy.cs,
    since="20250101",
)
# → ((ti:(diffusion autoregressive)) AND (cat:cs.*)) AND (submittedDate:[...])

# 直接搜索
results = search_by_keywords(
    "visual tokenizer",
    field="abstract",
    categories="cs.CV",
    max_results=20,
    sort_by="submitted",
)

for paper in results:
    print(paper.title, paper.arxiv_id, paper.published)
```

### 支持的查询能力

| 方法 | 说明 |
|------|------|
| `Query.title(term)` | 标题搜索 |
| `Query.abstract(term)` | 摘要搜索 |
| `Query.author(term)` | 作者搜索 |
| `Query.category(term)` | 分类过滤 |
| `Query.all(term)` | 全字段搜索 |
| `Query.submitted_date(start, end)` | 时间范围 |
| `&` / `\|` / `~` | AND / OR / NOT 布尔组合 |
| `Taxonomy.cs / stat / eess / math / physics / econ` | 常用分类简写 |

## 项目结构

```
arxiv-paper-digest/
├── run.py                       # CLI 入口
├── config/global_config.yaml    # 全局配置
├── rules/                       # 爬取规则（YAML）
├── src/
│   ├── cli.py                   # 命令行调度
│   ├── crawler_pipeline.py      # 流程编排
│   ├── rule_runtime.py          # 规则运行时
│   ├── crawl_output_writer.py   # 分类 JSON 写入
│   ├── html_blog_digest.py      # HTML 简报生成
│   ├── arxiv_search.py          # arXiv API 关键词搜索
│   ├── crawler/                 # RSS 爬虫
│   ├── filters/                 # 过滤器（时间、关键词、逻辑组合）
│   ├── models/                  # 数据模型
│   ├── storage/                 # 存储与导出
│   ├── tools/translator.py      # 翻译工具
│   └── utils/                   # 配置加载、关键词分类、日志
├── tests/                       # 单元测试
└── pyproject.toml
```

## 测试

```bash
.venv/bin/python -m unittest discover -s tests -v
```

## 追踪方向

本工具当前追踪以下五个研究方向：

| 方向 | 关键词 |
|------|--------|
| Diffusion | diffusion |
| Autoregressive | autoregressive, AR model |
| Image Compression | image compression, image rescaling |
| 1D Visual Tokenizer | 1D visual tokenizer, sequential visual encoding |
| Diffusion Visual Encoder | diffusion tokenizer, diffusion visual encoder |

可在 `rules/*.yaml` 中自由扩展。

## License

MIT
