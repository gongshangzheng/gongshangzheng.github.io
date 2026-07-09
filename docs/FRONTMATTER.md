# Frontmatter Reference

## Supported Formats

### YAML (---)

```yaml
---
title: "Article Title"
description: "SEO description"
date: 2025-01-21
tags: [AI, History]
categories: [Research]
draft: false
toc: true
mathjax: true
page_style: |
  .hero { height: 55vh; }
hero_title: "Custom Hero"
hero_sub: "Subtitle here"
hero_tagline: "Additional context"
audio_src: "./audio/bgm.mp3"
---

Content body...
```

### TOML (+++)

Single-line (all on one line):

```
+++ title = "Article Title" date = 2025-01-01 tags = [AI, History] +++
```

Multi-line (each key on own line):

```toml
+++
title = "Article Title"
date = 2025-01-01
tags = [AI, History]
+++
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Page title |
| `description` | string | Meta description for SEO |
| `date` | string | Publication date (YYYY-MM-DD) |
| `tags` | string (array-like) | Comma-separated or `[a, b, c]` format |
| `categories` | string (array-like) | Same as tags |
| `draft` | string (`true`/`false`) | Exclude from build (YAML only) |
| `toc` | string (`true`/`false`) | Show table of contents |
| `mathjax` | string (`true`/`false`) | Inject MathJax CDN |
| `page_style` | string | Inline CSS for hero height etc. |
| `hero_title` | string | Override title in hero section |
| `hero_sub` | string | Hero subtitle |
| `hero_tagline` | string | Hero tagline |
| `audio_src` | string | Background music URL |
| `paper_title` | string | (Optional) Original paper title, rendered in the “论文信息” info-box |
| `paper_authors` | string | (Optional) Authors. Plain string rendered as-is; `[A, B, C]` joined with `, ` |
| `paper_affiliation` | string | (Optional) Affiliation(s). Plain string as-is; `[A, B]` joined with `；` |
| `paper_venue` | string | (Optional) Journal / conference + year (e.g. `Animals (MDPI), 2026, 16(11)`) |
| `paper_doi` | string | (Optional) DOI. Bare DOI auto-linked to `https://doi.org/<doi>` |
| `paper_url` | string | (Optional) Canonical paper link; when set, wraps `paper_title` as a link |
| `paper_code` | string | (Optional) Code/repo status or URL (URLs auto-linked) |

## Paper info block (paper_* fields)

All `paper_*` fields are **optional**. When any one is present, the build renders a
“论文信息” `.info-box.paper-info` at the top of the article body (right after the
article meta). If none are present, nothing is rendered — fully backward compatible.

```yaml
paper_title: "PMTNet: A Part-Centric Missing-Aware Temporal Network ..."
paper_authors: "Chunxi Tu, Jiatao Wu, Zeguang Huang, Jiaxing Xie"
paper_affiliation: "华南农业大学人工智能学院；广东省农业信息监测工程技术研究中心"
paper_venue: "Animals (MDPI), 2026, Vol. 16, No. 11"
paper_doi: "10.3390/ani16111589"
paper_code: "未开源（截至 2026.06 未找到官方仓库）"
```

## Arrays (tags, categories)

Tags and categories are stored as raw strings and parsed at render time via `parseListField()`:

```js
// YAML: tags: [AI, History, Tech]  → parseListField → ['AI', 'History', 'Tech']
// TOML: tags = [AI, History]       → parseListField → ['AI', 'History']
// Raw:  tags: AI, History, Tech    → parseListField → ['AI', 'History', 'Tech']
```
