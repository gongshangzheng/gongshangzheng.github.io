# Architecture

## File Structure

```
gongshangzheng.github.io/
├── build.js              # Orchestrator: clean → copy → collect → build
├── config.json           # Site meta, nav, base_url, recent count
├── lib/
│   ├── config.js       # CONFIG, RECENT_COUNT, PATHS (all paths relative to __dirname)
│   ├── parser.js       # parseFrontmatter (YAML/TOML), parseListField, render (Mustache-like)
│   ├── utils.js        # copyDir, writePublic
│   ├── generator.js    # buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch
│   ├── toc.js          # processHeadings, buildTocHtml, buildTocSidebar
│   └── replace.js      # processBody (wiki/arxiv/github links), processShortcodes
├── src/
│   ├── templates/
│   │   ├── _base.html  # Base HTML: <base href>, Tailwind CDN, Prism.js, fonts, hugo-theme.css
│   │   ├── _header.html
│   │   └── _footer.html
│   ├── assets/         # Static assets (copied verbatim to public/assets/)
│   │   ├── css/
│   │   └── js/dark-mode.js
│   └── pages/          # Source files: .html (pre-rendered) and .md (markdown)
└── public/             # Build output
```

## Build Pipeline

1. **Clean** — rm -rf public/, mkdir public/
2. **Copy assets** — copyDir(src/assets, public/assets)
3. **Collect posts** — scan src/pages, parse frontmatter, sort by date
4. **Build pages**
   - `buildArticles()` — each file → HTML page
   - `buildPostsPage()` — all posts listing
   - `buildTaxonomyPages()` — tags/ and categories/
   - `buildSearch()` — search-index.json + search.html

## Source File Types

| Type | Extension | Processing |
|------|-----------|------------|
| Pre-rendered HTML | `.html` | Passthrough (no marked.parse) |
| Markdown | `.md` | marked.parse → shortcodes → replacements |

## Frontmatter Formats

```yaml
---
title: "Hello World"
date: 2025-01-01
tags: [AI, History]
mathjax: true
---
```

```toml
+++ title = "Hello World" date = 2025-01-01 tags = [AI, History] +++
```

Both YAML (---) and TOML (+++) are supported.

## Template Syntax

- `{{variable}}` — Mustache-style substitution
- `{{#array}}...{{/array}}` — Array iteration
- `<!-- INJECT key -->` — Build-time injection point
- `<!-- INCLUDE partial -->` — Template partial include

## Known Fixes (Regression Tests)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Page duplicated 3× on mathjax pages | `replace('</head>', injectStr)` matched `</head>` inside injectStr | Use `</head>\n` as anchor |
| Stat pages have 2× wrap div | `extractFirstDiv` left wrap in bodyAfterStats; buildArticles added another | Detect `startsWithWrap` and reuse existing wrap |
