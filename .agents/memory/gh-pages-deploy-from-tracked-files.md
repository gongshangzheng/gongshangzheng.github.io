---
name: gh-pages-deploy-from-tracked-files
description: Site deploys via CI from git-tracked files only — untracked media/pages silently vanish on gh-pages
metadata: 
  node_type: memory
  type: project
  originSessionId: e8253964-8954-4695-a322-ec9f8c50d9eb
---

This GitHub Pages site deploys via `.github/workflows/deploy.yml`: on push to `main`, CI runs `actions/checkout` (tracked files only) → `npm run build` (copies `media/` into `public/`) → force-pushes `public/` to `gh-pages`. `public/` and `.cache/` are gitignored, so the source-of-truth is `src/pages/` + `media/`, both of which MUST be committed.

**Gotcha (recurring):** New media files or page HTML placed on disk render fine locally but 404 on the live site, because `git checkout` in CI never receives untracked files. Always `git add` new `media/images/**` and `src/pages/*.html` before pushing — a clean `git status` (ignoring `.playwright-mcp/`) is the gate.

To diagnose a "works locally, broken on remote" image issue: `git ls-files <path>` returns 0 → not committed → CI build skips it.
