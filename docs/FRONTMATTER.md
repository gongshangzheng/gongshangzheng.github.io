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

## Arrays (tags, categories)

Tags and categories are stored as raw strings and parsed at render time via `parseListField()`:

```js
// YAML: tags: [AI, History, Tech]  → parseListField → ['AI', 'History', 'Tech']
// TOML: tags = [AI, History]       → parseListField → ['AI', 'History']
// Raw:  tags: AI, History, Tech    → parseListField → ['AI', 'History', 'Tech']
```
