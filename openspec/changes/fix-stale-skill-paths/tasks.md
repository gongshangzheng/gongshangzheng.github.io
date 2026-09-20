## 1. 校验工具先行（用脚本产出待修清单）

- [ ] 1.1 写 `scripts/check-skill-paths.py`：扫描全库（排除 `node_modules` / `.git` / `raw` / `openspec`），匹配 `~/.agents/skills/<name>` 与 `~/gongshangzheng.github.io/.agents/skills/<name>` 两类引用并校验目标目录是否存在；输出 `文件:行 目标` 清单，死路径数 > 0 时退出码非 0
- [ ] 1.2 用脚本跑出基线，确认死路径为 66 处、并与 design.md 的按目标分类一致（`html-blog` 30 / `read-article` 8 / `blog-rules` 6 / `arxiv-paper-digest` 6 / `docling` 7 / `blog-aliases` 2 / 其余各 1）；不一致先查清再继续
- [ ] 1.3 确认白名单：`web-search` 4 处解析成功、不进修改清单

## 2. 不存在工具的处置（docling 7 处 / music-gen 1 处）

- [ ] 2.1 查证 `docling` 背景：是否曾有自研 `scripts/convert.py`（查 git log、本地残留）、`book-to-blog` 技术书 OCR 场景是否强依赖它；据 D3 的 1→2→3 顺序确定处置方式并记录
- [ ] 2.2 处置 `read-article/SKILL.md`（2 处）与 `read-article/phases/extraction.md`（4 处）的 docling 引用：改走既有 arXiv source → arXiv HTML → PDF 结构化提取链，或改写为带前提的可选分支
- [ ] 2.3 处置 `book-to-blog/phases/extraction.md`（1 处）：技术书/扫描件的表格·公式·OCR 场景保留能力描述，但不再指向不存在的 docling skill 路径
- [ ] 2.4 处置 `historical-narrative/phases/media.md`（1 处）的 `music-gen`：删除假路径，改为"若存在对应 skill 则读取其乐理与 prompt 写法，否则按通用配乐提示生成"
- [ ] 2.5 复核：全库不再存在指向 `docling` / `music-gen` 的路径引用（脚本输出中两者消失）

## 3. 库内 skill 死路径批量修正（按目标 skill 分组）

- [ ] 3.1 `html-blog` 30 处 → `~/gongshangzheng.github.io/.agents/skills/html-blog/...`：分布在 `blog-rules/references/publishing.md`(5)、`academic-research/phases/phase5-6.md`(4)、`academic-research/phases/phase4.md`(3)、`book-to-blog/SKILL.md`(3)、`book-to-blog/phases/composition.md`(3)、`historical-narrative/SKILL.md`(3)、`read-article/SKILL.md`(3)、`read-article/phases/html-writing.md`(2)、`github-repo-read/SKILL.md`(1)、`deep-research/SKILL.md`(1)、`academic-research/SKILL.md`(1)、`academic-research/subagents/html-gen.md`(1)
- [ ] 3.2 `read-article` 8 处 → 库内锚定：`academic-research/phases/phase5-6.md`(4)、`academic-research/SKILL.md`(1)、`academic-research/phases/phase0-1.md`(1)、`academic-research/phases/phase2.md`(1)、`read-article/SKILL.md`(1)
- [ ] 3.3 `blog-rules` 6 处 → 库内锚定：`read-article/SKILL.md`(2)、`blog-rules/SKILL.md`(3)、`blog-rules/references/publishing.md`(1)
- [ ] 3.4 `arxiv-paper-digest` 6 处、`blog-aliases` 2 处、`blog-images` 1 处、`blog-syntax` 1 处、`github-repo-read` 1 处、`book-to-blog` 1 处、`academic-research` 1 处、`historical-narrative` 1 处 → 库内锚定（分布：`academic-research/SKILL.md`(2)、`academic-research/phases/phase0-1.md`(4)、`read-article/SKILL.md`(4)、`read-article/phases/extraction.md`(1)、`github-repo-read/SKILL.md`(1)、`book-to-blog/phases/review.md`(1)、`academic-research/phases/phase4.md`(1)、`historical-narrative/SKILL.md`(1)）
- [ ] 3.5 逐处替换后自查：未引入除库内锚定写法之外的新形式；未改动 `web-search` 的 4 处；`git diff --stat` 只涉及上述 19 个文件

## 4. 口径规范与防回归

- [ ] 4.1 在 `blog-rules/SKILL.md` 增「skill 路径口径」小节：判据 = `SKILL.md` 在哪个 tree；库内 skill 用库内锚定绝对路径，全局 skill 用全局路径；不得用软链接兼容
- [ ] 4.2 把 `scripts/check-skill-paths.py` 加入 `blog-rules/references/publishing.md` 的发布前验证清单（作为一条 `node build.js` 之外的前置检查）
- [ ] 4.3 确认不建任何 `~/.agents/skills/<博客 skill>` 软链接：`ls ~/.agents/skills/ | grep -E 'html-blog|read-article|blog-rules'` 无输出

## 5. 校验

- [ ] 5.1 `~/.venv/bin/python scripts/check-skill-paths.py` 死路径为 0、退出码 0
- [ ] 5.2 抽查 `read-article` Phase 5 要求的 html-blog 路径：`SKILL.md` 与 `phases/html-writing.md` 均能读到
- [ ] 5.3 `node build.js` 无错误；`npm test` 通过
- [ ] 5.4 `openspec validate fix-stale-skill-paths --strict` 通过；任务全部打勾后提请 archive
