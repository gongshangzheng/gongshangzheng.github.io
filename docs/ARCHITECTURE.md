# Architecture

## File Structure

```
gongshangzheng.github.io/
├── build.js              # Orchestrator: copy → collect → build (incremental, cache-aware)
├── config.json           # Site meta, nav, base_url, recent count, shortcode_deps
├── lib/
│   ├── config.js       # CONFIG, RECENT_COUNT, SHORTCODE_DEPS, PATHS
│   ├── parser.js       # parseFrontmatter (YAML/TOML), parseListField, render (Mustache-like)
│   ├── utils.js        # copyDir, writePublic, walkDir, walkFiles
│   ├── build-cache.js  # createBuildCache, collectFileSignatures, sha1
│   ├── article-slugs.js / taxonomy.js  # slug + taxonomy registries
│   ├── toc.js          # processHeadings, buildTocHtml, buildTocSidebar
│   ├── replace.js      # processBody (wiki/arxiv/github links), processShortcodes
│   ├── math.js         # transformLatex
│   ├── generator.js    # Facade — re-exports lib/generators/* (back-compat)
│   └── generators/
│       ├── articles.js        # buildArticles (per-page pipeline + slide branch)
│       ├── taxonomy-pages.js  # buildPostsPage, buildTaxonomyPages (+ alias hubs)
│       ├── feeds.js           # buildSearch, buildIndex, buildRss
│       ├── post-list.js       # renderPostList, renderSortableList
│       ├── page.js            # assemblePage, buildHero (template assembly)
│       ├── transform.js       # body-text transforms (tables, code, paragraphs, LaTeX)
│       ├── meta.js            # article meta header/footer + taxonomy URLs
│       └── scripts.js         # inline runtime scripts (PDF.js, slide-state restore)
├── src/
│   ├── templates/
│   │   ├── _base.html  # Base HTML: <base href>, Tailwind CDN, Prism.js, fonts, hugo-theme.css
│   │   ├── _header.html
│   │   └── _footer.html
│   ├── assets/
│   │   ├── css/modules/ + css-manifest.json  # always/optional CSS modules → hugo-theme.css
│   │   └── js/runtime/  # table-wrap, math-wrap, nav, theme, music, toc, mobile-toc, search
│   └── pages/          # Source files: .html (pre-rendered) and .md (markdown)
└── public/             # Build output
```

## Build Pipeline

1. **Copy assets** — copyDir(assets, public/assets); buildCss() merges always-modules into hugo-theme.css and copies optional modules
2. **Collect posts** — scan src/pages, parse frontmatter, assign slugs, sort by date
3. **Build pages** (incremental via per-page sourceHash + global fingerprint)
   - `buildArticles()` — each file → HTML page (lib/generators/articles.js)
   - `buildPostsPage()` / `buildTaxonomyPages()` — listings, tags/, categories/ (taxonomy-pages.js)
   - `buildSearch()` / `buildIndex()` / `buildRss()` — search-index.json, post-index.json, feed.xml (feeds.js)

## generator.js Module Split

`lib/generator.js` is a thin facade that re-exports `lib/generators/*`. Import either the facade (`require('./generator')`) or a submodule directly.

| Module | Responsibility |
|--------|----------------|
| `generators/articles.js` | Per-article body pipeline + standalone slide branch |
| `generators/taxonomy-pages.js` | Posts listing, tags/categories/subcategories, alias redirects + hub overrides |
| `generators/feeds.js` | search-index.json, post-index.json, feed.xml |
| `generators/post-list.js` | renderPostList (static), renderSortableList (client-side) |
| `generators/page.js` | loadTemplate, processIncludes, assemblePage, buildHero |
| `generators/transform.js` | escapeHtml, fenced code, wrapBareParagraphs, markdown tables, extractFirstDiv, transformLatex |
| `generators/meta.js` | formatDateTime, taxonomy URLs, breadcrumbs, article meta header/footer |
| `generators/scripts.js` | buildPdfJsScript, buildSlideStateRestoreScript, injectSlideStateRestore |

## Client Runtime Modules

`assets/js/dark-mode.js` was split into focused modules under `assets/js/runtime/`, each loaded by `_base.html`:

| Module | Responsibility |
|--------|----------------|
| `table-wrap.js` | Wrap <table> in scrollable containers |
| `math-wrap.js` | Wrap MathJax display formulas for horizontal scroll |
| `nav.js` | Responsive nav-brand sizing |
| `theme.js` | Dark-mode toggle, hamburger, back-to-top, fade-in, Prism highlight |
| `music.js` | Background music toggle |
| `toc.js` | TOC sidebar (collapse/resize/split), category browser, scroll-spy |
| `mobile-toc.js` | Mobile TOC drawer |
| `search.js` | Search dropdown (Ctrl/Cmd+K) |

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
