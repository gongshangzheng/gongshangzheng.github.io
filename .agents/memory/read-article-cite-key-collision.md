---
name: read-article-cite-key-collision
description: read-article 发布时主 cite-key 可能与既有精读文章碰撞，需用第一作者初始消歧
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 33df24b3-9df7-4107-94fd-2a7929f6b06c
---

read-article 生成的精读文章，其 `.sources` **第一个** `data-cite-key`（主 cite-key）被 `scripts/cross-link.py` 用来构建 `cite_to_paper` 映射。若新文章主 cite-key 与某篇既有精读文章的主 cite-key 相同（slugifyKey 后），映射会冲突——导致交叉回链指向错误文章。

**Why:** 2026-07-11 发布 GFVC 综述（arXiv:2311.02649, Chen **B.** et al. 2023）时，主 cite-key `Chen-et-al.-2023` 与既有 `paper-mammalnet-2023.html`（Chen **J.** et al. 2023）碰撞。`#Chen et al., 2023#` 与 MammalNet 的 `#Chen et al., 2023#` slugify 后都是 `Chen-et-al.-2023`，cross-link 无法区分。

**How to apply:** 发布前跑 `~/.venv/bin/python3 scripts/cross-link.py --dry-run`，检查 `cite-key 'X' → Y.html` 列表里是否有新文章的主 key 与既有文章同 key。若碰撞，在 in-text `#key#` 与首个 `data-cite-key` 上加第一作者初始消歧（如 `#Chen B. et al., 2023#` → `Chen-B.-et-al.-2023`）——书目上不同第一作者本就该用初始区分，这是正确做法而非 hack。仅改碰撞的那一个 key，不影响同作者同年用 2023a/b/c 后缀的其他条目。相关管线见 [[gh-pages-deploy-from-tracked-files]]。
