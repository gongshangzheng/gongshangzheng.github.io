<!-- 依 templates/content-change/tasks.md 的粒度组织（本 change 为工程类，组名按路径清理链路） -->

## 1. 校验工具先行（用脚本产出待修清单）

- [x] 1.1 写 `scripts/check-skill-paths.py`：按引用中出现的实际树路径解析（`~/gongshangzheng.github.io/.agents/skills/`、`~/<tree>/skills/`），忽略 `<name>` / `...` 占位写法；死路径数 > 0 时退出码非 0
- [x] 1.2 跑基线并核对分类：全库 **199 处引用 / 69 处死路径**（`~/.agents/skills` 树 66、`~/.claude/skills` 树 1、`~/.hanako/skills` 树 2），与 design.md 的分类一致
- [x] 1.3 白名单确认：全局树 `web-search`（7 处）、hanako 树下的 `docling` / `html-blog` / `org-roam-capture` / `send-email` / `web-search` 均有效、不进修改清单
- [x] 1.4 修正脚本自身两个缺陷：① 原先把任意 `~/.X/skills/` 都按 `~/.agents/skills/` 解析，导致 hanako 树下有效引用被误报；② 模板占位写法 `...` 被当成 skill 名

## 2. 特殊对象：指错树与不存在

- [x] 2.1 查证 `docling`：实际位于 `~/.hanako/skills/docling/`（`scripts/convert.py` 存在）→ 判定为**指错树**，按 D3 改为指向 hanako 树（不删除、不改条件句）
- [x] 2.2 改 `read-article/SKILL.md`(2 处) 与 `read-article/phases/extraction.md`(4 处) 的 docling 路径 → `~/.hanako/skills/docling/scripts/convert.py`
- [x] 2.3 改 `book-to-blog/phases/extraction.md`(1 处) 的 docling 路径 → 同上；保留技术书表格/公式/OCR 的能力描述
- [x] 2.4 处置 `historical-narrative/phases/media.md` 的 `music-gen`（1 处）：任何树都不存在 → 改为条件式（保留配乐能力描述，不再指向假路径）
- [x] 2.5 复核：脚本输出中 `docling` 死路径归零、`music-gen` 不再出现

## 3. 库内 skill 死路径批量修正

- [x] 3.1 `html-blog` 30 处 → 库内锚定：`blog-rules/references/publishing.md`(5)、`academic-research/phases/phase5-6.md`(4)、`academic-research/phases/phase4.md`(3)、`book-to-blog/SKILL.md`(3)、`book-to-blog/phases/composition.md`(3)、`historical-narrative/SKILL.md`(3)、`read-article/SKILL.md`(3)、`read-article/phases/html-writing.md`(2)、`github-repo-read/SKILL.md`(1)、`deep-research/SKILL.md`(1)、`academic-research/SKILL.md`(1)、`academic-research/subagents/html-gen.md`(1)
- [x] 3.2 `read-article` 8 处 → 库内锚定：`academic-research/phases/phase5-6.md`(4)、`academic-research/SKILL.md`(1)、`academic-research/phases/phase0-1.md`(1)、`academic-research/phases/phase2.md`(1)、`read-article/SKILL.md`(1)；另加 `~/.claude/skills/read-article` 1 处 → 库内锚定
- [x] 3.3 `blog-rules` 6 处 → 库内锚定：`read-article/SKILL.md`(2)、`blog-rules/SKILL.md`(3)、`blog-rules/references/publishing.md`(1)
- [x] 3.4 `arxiv-paper-digest` 6 处 → 库内锚定：`academic-research/SKILL.md`(2)、`academic-research/phases/phase0-1.md`(4)
- [x] 3.5 其余零散项 → 库内锚定：`blog-aliases` 2（`read-article/SKILL.md`）、`blog-images` 1（`read-article/phases/extraction.md`）、`blog-syntax` 1（`github-repo-read/SKILL.md`）、`github-repo-read` 1（`read-article/SKILL.md`）、`book-to-blog` 1（`book-to-blog/phases/review.md`）、`academic-research` 1（`academic-research/phases/phase4.md`）、`historical-narrative` 1（`historical-narrative/SKILL.md`）、`course-notes` 2（`~/.hanako/skills/` 树）
- [x] 3.6 替换后自查：未引入除库内锚定/hanako 树之外的新形式；未改动全局 `web-search` 与 hanako 树下的有效引用；`git diff --stat` 只涉及预期文件

## 4. 口径规范与防回归

- [x] 4.1 在 `blog-rules/SKILL.md` 增「skill 路径口径」小节：判据 = skill 实际所在树；列明库内 / `~/.agents/skills` / 其他 harness 树三种写法；不得用软链接兼容
- [x] 4.2 把 `scripts/check-skill-paths.py` 加入 `blog-rules/references/publishing.md` 的发布前验证清单
- [x] 4.3 确认未建任何 `~/.agents/skills/<博客 skill>` 软链接：`ls ~/.agents/skills/ | grep -E 'html-blog|read-article|blog-rules'` 无输出

## 5. 校验

- [x] 5.1 `~/.venv/bin/python3 scripts/check-skill-paths.py` 死路径为 0、退出码 0
- [x] 5.2 抽查 `read-article` Phase 5 要求的 html-blog 路径可读（`SKILL.md` 与 `phases/html-writing.md`）
- [x] 5.3 `node build.js` 无错误；`npm test` 通过
- [ ] 5.4 `openspec validate fix-stale-skill-paths --strict` 通过；任务全部打勾后提请 archive
