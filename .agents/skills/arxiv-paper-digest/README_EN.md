# arxiv-paper-digest

A daily arXiv paper tracking and search tool. A complete Python pipeline from RSS crawling, keyword classification, abstract translation, to HTML blog digest generation. Also includes built-in arXiv API keyword search.

## Features

- **RSS Crawling**: Scheduled fetching of `cs.AI` / `cs.CV` arXiv RSS feeds
- **Smart Classification**: Categorizes papers into `diffusion`, `autoregressive`, `image_compression`, `visual_tokenizer_1d`, `diffusion_visual_encoder`
- **Auto Translation**: Abstracts automatically translated to Chinese (DeepL / Alibaba Cloud)
- **HTML Digest**: Generates static blog pages with category stats and paper cards
- **Keyword Search**: Built-in arXiv API query builder with boolean组合, date ranges, category filters
- **Configurable Output**: Data paths and blog directory customizable via config file or environment variables

## Quick Start

### Requirements

- Python 3.12+
- Dependencies: `pip install -e .` (or use the existing `.venv`)

### Run

```bash
# Single run: crawl + classify + generate HTML digest
.venv/bin/python run.py --once

# Continuous: execute periodically based on configured crawl_time
.venv/bin/python run.py --continuous

# Continuous with a repair run first
.venv/bin/python run.py --continuous --repair
```

### Scheduled Task (launchd / cron)

```bash
# Absolute path invocation
~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python \
  ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/run.py --once
```

## Output

Default output goes to `~/gongshangzheng.github.io`, customizable via config:

```
gongshangzheng.github.io/
├── data/daily-papers/          # Daily raw JSON data
│   ├── diffusion/
│   ├── autoregressive/
│   ├── image_compression/
│   ├── visual_tokenizer_1d/
│   └── diffusion_visual_encoder/
└── src/pages/
    └── arxiv-digest-YYYY-MM-DD.html   # Daily HTML digest
```

## Configuration

### Global Config: `config/global_config.yaml`

```yaml
storage:
  base_path: "~/gongshangzheng.github.io/data/daily-papers"
  output_format: "html-blog"

logging:
  level: "INFO"
  file: "logs/crawler.log"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ARXIV_DIGEST_BLOG_DIR` | Blog root directory | `~/gongshangzheng.github.io` |
| `ARXIV_DIGEST_RAW_DIR` | Raw data directory | `{blog_dir}/data/daily-papers` |
| `ARXIV_DIGEST_BUILD` | Run `node build.js` after generation | `1` |
| `ARXIV_DIGEST_PUSH` | `git push` after generation | `0` |
| `ARXIV_DIGEST_EMAIL` | Send email after generation | `0` |

### Crawl Rules: `rules/*.yaml`

Each rule defines an RSS source including URL, keyword filters, category mappings, translation toggle, etc. Currently two rules exist:

- `rules/arxiv_rss.yaml`: `cs.AI` source
- `rules/arxiv_cv_rss.yaml`: `cs.CV` source

## Keyword Search

Built-in arXiv API query capability, usable directly in Python:

```python
from src.arxiv_search import Query, Taxonomy, build_query, search_by_keywords

# Build query
q = build_query(
    ["diffusion", "autoregressive"],
    field="title",
    categories=Taxonomy.cs,
    since="20250101",
)
# → ((ti:(diffusion autoregressive)) AND (cat:cs.*)) AND (submittedDate:[...])

# Direct search
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

### Query API

| Method | Description |
|--------|-------------|
| `Query.title(term)` | Title search |
| `Query.abstract(term)` | Abstract search |
| `Query.author(term)` | Author search |
| `Query.category(term)` | Category filter |
| `Query.all(term)` | All-field search |
| `Query.submitted_date(start, end)` | Date range |
| `&` / `\|` / `~` | AND / OR / NOT boolean组合 |
| `Taxonomy.cs / stat / eess / math / physics / econ` | Common category shortcuts |

## Project Structure

```
arxiv-paper-digest/
├── run.py                       # CLI entry point
├── config/global_config.yaml    # Global configuration
├── rules/                       # Crawl rules (YAML)
├── src/
│   ├── cli.py                   # CLI dispatch
│   ├── crawler_pipeline.py      # Pipeline orchestration
│   ├── rule_runtime.py          # Rule runtime
│   ├── crawl_output_writer.py   # Classified JSON writer
│   ├── html_blog_digest.py      # HTML digest renderer
│   ├── arxiv_search.py          # arXiv API keyword search
│   ├── crawler/                 # RSS crawler
│   ├── filters/                 # Filters (time, keyword, logical)
│   ├── models/                  # Data models
│   ├── storage/                 # Storage and export
│   ├── tools/translator.py      # Translation tool
│   └── utils/                   # Config loading, keyword classification, logging
├── tests/                       # Unit tests
└── pyproject.toml
```

## Tests

```bash
.venv/bin/python -m unittest discover -s tests -v
```

## Tracked Directions

| Direction | Keywords |
|-----------|----------|
| Diffusion | diffusion |
| Autoregressive | autoregressive, AR model |
| Image Compression | image compression, image rescaling |
| 1D Visual Tokenizer | 1D visual tokenizer, sequential visual encoding |
| Diffusion Visual Encoder | diffusion tokenizer, diffusion visual encoder |

Extend freely in `rules/*.yaml`.

## License

MIT
