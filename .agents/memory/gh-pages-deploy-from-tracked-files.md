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

**Gotcha (silent staging failure, hit 2026-07-14):** `git add a.html b.html nonexistent-dir 2>/dev/null` stages NOTHING — git add treats an invalid pathspec as a fatal error and abandons the whole invocation, but `2>/dev/null` hides it. Result: you believe the HTML is staged, commit, push, CI succeeds, but the pages 404 (media dirs added in a *separate* git add DID go up, so images render but HTML doesn't — a confusing half-deploy). **Never mix a known-nonexistent path into a `git add` with `2>/dev/null`.** After any batch add, verify with `git diff --cached --name-only | grep src/pages` that every intended HTML is actually staged, and post-push verify `git cat-file -e origin/main:src/pages/<slug>.html` (or that `gh run view` shows `posts: N total` matching local) before declaring done.

**Gotcha (destructive remote force-push, hit 2026-07-14):** Another session/process may force-push `main` (e.g. a `media-cleanup` run that rebases/filters history and `git push -f`), rewriting commit hashes so `git merge-base` returns empty (local & remote have no common ancestor — "本地领先 N / 远程领先 M" with N,M large). `git pull`/`merge`/`rebase` all fail or mangle. Rescue: stash worktree → `git reset --hard origin/main` (accept destructive update) → `git cherry-pick <my-commits>` (additive new-file commits apply cleanly) → `git push` (fast-forward, no force needed). Verify `git cat-file -e origin/main:src/pages/<slug>.html` after.
