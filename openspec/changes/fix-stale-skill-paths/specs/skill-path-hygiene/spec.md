## Purpose

保证 skill 文档中对其他 skill 的路径引用真实可解析：凡是出现在指令里的 skill 路径都必须指向存在的目录，库内与全局两种 skill tree 的写法有统一判据，且仓库提供自动校验防止再次漂移。

## ADDED Requirements

### Requirement: skill 路径引用必须可解析

skill 文档中出现的 `~/.agents/skills/<name>` 与 `~/gongshangzheng.github.io/.agents/skills/<name>` 两类引用 MUST 指向真实存在的目录；仓库中 MUST NOT 存在指向不存在路径的 skill 引用。当前已知的 66 处死路径 MUST 全部修正（`html-blog` 30、`read-article` 8、`blog-rules` 6、`arxiv-paper-digest` 6、`docling` 7、`blog-aliases` 2，以及 `blog-images`/`blog-syntax`/`github-repo-read`/`book-to-blog`/`academic-research`/`historical-narrative`/`music-gen` 各 1）。

#### Scenario: 扫描全库无死路径

- **WHEN** 对 `~/gongshangzheng.github.io/.agents/skills/` 执行 skill 路径扫描
- **THEN** 每一处 `~/.agents/skills/<name>` 与 `~/gongshangzheng.github.io/.agents/skills/<name>` 引用都对应一个真实存在的目录，死路径数为 0

#### Scenario: 硬指令能真正读到目标文件

- **WHEN** agent 按 `read-article` Phase 5 的指令读取 html-blog 的 `SKILL.md` 与 `phases/html-writing.md`
- **THEN** 该路径存在于库内 `~/gongshangzheng.github.io/.agents/skills/html-blog/`，读取成功，不再出现因路径失效而静默跳过 HTML 规范的情况

### Requirement: 库内与全局 skill 的路径口径统一

路径写法 MUST 以"该 skill 的 `SKILL.md` 位于哪个 tree"为判据：`SKILL.md` 在库内 `~/gongshangzheng.github.io/.agents/skills/` 的 skill MUST 用库内锚定绝对路径引用；`SKILL.md` 在全局 `~/.agents/skills/` 的 skill MUST 用全局路径引用。仓库 MUST NOT 通过软链接把全局路径指向库内 skill 来规避修正。

#### Scenario: 全局 skill 的引用保持不动

- **WHEN** 检查 `web-search`（其 `SKILL.md` 位于全局 `~/.agents/skills/web-search/`）的 4 处引用
- **THEN** 这些引用保持全局写法不被改写，且解析成功

#### Scenario: 库内 skill 的引用改为库内锚定

- **WHEN** 检查修正后的 `read-article` 对 html-blog、blog-rules、blog-aliases、github-repo-read 的引用
- **THEN** 全部为 `~/gongshangzheng.github.io/.agents/skills/<name>/...` 形式，且不存在对应的全局软链接

### Requirement: 仓库提供 skill 路径校验脚本

仓库 MUST 提供 `scripts/check-skill-paths.py`，扫描全库两类 skill 路径引用并报告目标不存在的条目；存在死路径时退出码 MUST 非 0，全部可解析时退出码为 0。该脚本 MUST 被列入发布前验证清单。

#### Scenario: 引入假路径时脚本报错

- **WHEN** 在任一 skill 文档中写入一条指向不存在 skill 的路径（如 `~/.agents/skills/not-a-real-skill`），然后运行 `scripts/check-skill-paths.py`
- **THEN** 脚本列出该条目的文件与行号，并以非 0 退出码结束

#### Scenario: 全部可解析时通过

- **WHEN** 66 处死路径修正完毕，运行 `scripts/check-skill-paths.py`
- **THEN** 输出死路径数为 0 并以退出码 0 结束

### Requirement: 指向不存在工具的引用必须消除或改为条件式

对 `docling`（7 处）与 `music-gen`（1 处）这类目标完全不存在的引用，MUST 不改写为另一条死路径；MUST 采用以下之一：改走仓库既有的等价能力（如 PDF 结构化提取链）、改写为带前提条件的可选分支（"若已安装 X 则用它，否则回退 Y"）、或删除该引用。每处改动 MUST 在实施记录中说明采用了哪种处置。

#### Scenario: docling 引用被处置

- **WHEN** 检查 `read-article/SKILL.md`、`read-article/phases/extraction.md`、`book-to-blog/phases/extraction.md` 中原先指向 `~/.agents/skills/docling/scripts/convert.py` 的 7 处
- **THEN** 每处要么改为仓库既有的 PDF/arXiv 提取流程，要么改为明示前提的可选分支，且仓库中不再存在指向 `docling` skill 的路径引用

#### Scenario: music-gen 引用保留能力不保留假路径

- **WHEN** 检查 `historical-narrative/phases/media.md` 中的配乐引用
- **THEN** 不再存在指向 `~/.agents/skills/music-gen/` 的路径，配乐能力描述以"若存在对应 skill 则用，否则按通用提示生成"的形式保留
