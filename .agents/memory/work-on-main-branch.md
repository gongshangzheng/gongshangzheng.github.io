---
name: work-on-main-branch
description: This repo always works directly on main — never create feature branches
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 67a252aa-0b75-46e7-ac84-78818e3819f5
---

In the `gongshangzheng.github.io` repo, ALL work is done directly on the `main` branch. Never create feature branches, never switch to another branch to do work. Commit directly to `main` and push.

**Why:** User directive (2026-07-11) — the feature-branch workflow added merge/branch-cleanup overhead with no benefit for a single-author blog repo; the `gfvc-survey-2023` branch was the last one and was merged back and deleted.

**How to apply:** When starting any new task here, ensure you are on `main` (`git checkout main`), commit there, and `git push`. If you find yourself on a non-main branch, switch back to main before making changes. Related: [[gh-pages-deploy-from-tracked-files]].
