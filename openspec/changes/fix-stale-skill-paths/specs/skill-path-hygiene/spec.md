## Purpose

保证 skill 文档中对其他 skill 的路径引用真实可解析：凡是出现在指令里的 skill 路径都必须指向存在的目录，库内与全局两种 skill tree 的写法有统一判据，且仓库提供自动校验防止再次漂移。

## ADDED Requirements

### Requirement: skill 路径引用必须可解析

skill 文档中出现的 skill 路径引用 MUST 指向该 skill 真实所在的树：库内 skill 用 `~/gongshangzheng.github.io/.agents/skills/<name>`、全局工具 skill 用 `~/.agents/skills/<name>`、仅其他 harness 有的 skill 用其所属树（如 `~/.hanako/skills/<name>`）。仓库中 MUST NOT 存在指向错误树的 skill 引用。全库扫描（不含 `openspec/`）当前已知 **69 处死路径**，MUST 全部修正：`~/.agents/skills` 树 66 处（`html-blog` 30、`read-article` 8、`docling` 7、`blog-rules` 6、`arxiv-paper-digest` 6、`blog-aliases` 2，以及 `blog-images`/`blog-syntax`/`github-repo-read`/`book-to-blog`/`academic-research`/`historical-narrative`/`music-gen` 各 1）、`~/.claude/skills` 树 1 处（`read-article`）、`~/.hanako/skills` 树 2 处（`course-notes`）。

#### Scenario: 扫描全库无死路径

- **WHEN** 运行 `scripts/check-skill-paths.py` 对全库执行 skill 路径扫描
- **THEN** 199 处引用中死路径数为 0，且每一处引用的解析根都是该 skill 实际所在的树

#### Scenario: 硬指令能真正读到目标文件

- **WHEN** agent 按 `read-article` Phase 5 的指令读取 html-blog 的 `SKILL.md` 与 `phases/html-writing.md`
- **THEN** 该路径存在于库内 `~/gongshangzheng.github.io/.agents/skills/html-blog/`，读取成功，不再出现因路径失效而静默跳过 HTML 规范的情况

### Requirement: 库内、全局与其他 harness 的 skill 路径口径统一

路径写法 MUST 以"该 skill 的 `SKILL.md` 实际位于哪棵树"为判据：库内 skill 用库内锚定路径引用；全局工具 skill（`~/.agents/skills/`）用全局路径引用；仅其他 harness 有的 skill（如 `docling` 在 `~/.hanako/skills/`）MUST 指向其所属树。仓库 MUST NOT 通过软链接把一个树的路径指向另一个树的 skill 来规避修正。

#### Scenario: 全局 skill 的引用保持不动

- **WHEN** 检查 `web-search`（其 `SKILL.md` 位于全局 `~/.agents/skills/web-search/`）的引用
- **THEN** 这些引用保持全局写法不被改写，且解析成功

#### Scenario: 仅其他 harness 有的 skill 指向其所属树

- **WHEN** 检查 `docling` 的 7 处引用修正结果
- **THEN** 全部指向 `~/.hanako/skills/docling/scripts/convert.py`（该 skill 实际所在树，文件存在），而不是被删除或改成条件句

#### Scenario: 库内 skill 的引用改为库内锚定

- **WHEN** 检查修正后的 `read-article` 对 html-blog、blog-rules、blog-aliases、github-repo-read 的引用
- **THEN** 全部为 `~/gongshangzheng.github.io/.agents/skills/<name>/...` 形式，且不存在对应的全局软链接

### Requirement: 仓库提供 skill 路径校验脚本

仓库 MUST 提供 `scripts/check-skill-paths.py`，扫描全库的 skill 路径引用并报告指向错误树的条目；扫描 MUST 按引用中出现的实际树路径解析（不得假定只有一个全局 skill 树），且 MUST 忽略 `<name>`、`...` 等占位写法。存在死路径时退出码 MUST 非 0，全部可解析时退出码为 0。该脚本 MUST 被列入发布前验证清单。

#### Scenario: 引入假路径时脚本报错

- **WHEN** 在任一 skill 文档中写入一条指向不存在 skill 的路径（如 `~/.agents/skills/not-a-real-skill`），然后运行 `scripts/check-skill-paths.py`
- **THEN** 脚本列出该条目的文件与行号，并以非 0 退出码结束

#### Scenario: 多 skill 树不产生误报

- **WHEN** 文档中存在指向 `~/.hanako/skills/docling/...`（该树确实存在该 skill）的引用
- **THEN** 脚本按 hanako 树解析并判定为有效，不误报为死路径

#### Scenario: 全部可解析时通过

- **WHEN** 66 处死路径修正完毕，运行 `scripts/check-skill-paths.py`
- **THEN** 输出死路径数为 0 并以退出码 0 结束

### Requirement: 指向不存在工具的引用必须改为条件式

对 `music-gen`（1 处）这类在任何 skill 树中都不存在的引用，MUST 不改写为另一条死路径；MUST 改为带前提条件的可选分支（"若存在 X 则用，否则回退 Y"）或删除。每处改动 MUST 在实施记录中说明处置方式。

#### Scenario: music-gen 引用保留能力不保留假路径

- **WHEN** 检查 `historical-narrative/phases/media.md` 中的配乐引用
- **THEN** 不再存在指向 `music-gen` 的路径，配乐能力描述以"若存在对应 skill 则用，否则按通用提示生成"的形式保留
