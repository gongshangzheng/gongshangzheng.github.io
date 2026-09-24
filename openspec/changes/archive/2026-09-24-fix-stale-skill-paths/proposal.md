## Why

库内 skill 之间大量交叉引用，但路径写法在多棵树之间混用：`~/gongshangzheng.github.io/.agents/skills/<name>`（库内，博客 skill 的家）、`~/.agents/skills/<name>`（全局工具 skill）、`~/.hanako/skills/<name>`（另一 harness 的 skill 树）。实测：全局 `~/.agents/skills/` 下只有 28 个跨项目工具 skill（asu / docx / web-search / ego-browser …），**没有任何博客 skill**；博客 skill 全在库内。全库扫描（不含 `openspec/`）得到 **199 处 skill 路径引用，其中 69 处是死路径**：

| 死路径类别 | 处数 | 成因 |
|---|---|---|
| `~/.agents/skills/<博客 skill>` | 66 | 写错树：博客 skill 在库内 |
| `~/.claude/skills/<博客 skill>` | 1 | 写错树（`read-article`） |
| `~/.hanako/skills/<博客 skill>` | 2 | 写错树（`course-notes`） |

具体危害：

1. **硬指令指向死文件**：`read-article` Phase 5 写"必须读取 `~/.agents/skills/html-blog/SKILL.md`"；`read-article/SKILL.md` 共 11 处、`academic-research` 各 phase 文件共 22 处、`blog-rules/references/publishing.md` 6 处、`book-to-blog` 7 处等。agent 按指令 `read` 会失败，最坏情况是**静默跳过规范继续写 HTML**（例如跳过 html-blog 的组件语法规范直接产出页面）。
2. **两类特殊对象**：① `docling` 7 处写作 `~/.agents/skills/docling/scripts/convert.py`，而该 skill 实际位于 **`~/.hanako/skills/docling/`**（`convert.py` 存在）——是**指错树**，不是工具不存在；② `music-gen` 1 处（`historical-narrative/phases/media.md`，原文已写"如果存在"作兜底），全盘确实不存在。
3. **同一条路径有两种写法**：正确写法 `~/gongshangzheng.github.io/.agents/skills/...` 已有 89 处以上，说明这是 skill 从全局搬到库内时遗留的**存量漂移**，不是设计意图。

## What Changes

- **修正 66 处死路径**：库内 skill 的引用统一为库内锚定写法 `~/gongshangzheng.github.io/.agents/skills/<name>/...`；确认为全局存在的 skill（`web-search`，4 处）保持 `~/.agents/skills/<name>/...` 不动
- **确立路径口径**：判据是"该 skill 的 `SKILL.md` 位于哪棵树"——库内 skill 用库内锚定路径，全局工具 skill 用 `~/.agents/skills/...`，其他 harness 独有 skill 用其所属树（如 `~/.hanako/skills/...`）；写入门禁规范 `blog-rules/references/openspec-gate.md`（由 change `content-skills-openspec-gate` 创建）或本 change 自带的说明节
- **新增校验脚本** `scripts/check-skill-paths.py`：扫描全库两类路径引用并验证目标是否存在，退出码非 0 表示存在死路径；纳入发布前验证清单，防止再次漂移
- **消除指错树/不存在的引用**：`docling` 7 处改指 `~/.hanako/skills/docling/scripts/convert.py`（该 skill 实际所在树）；`music-gen` 1 处改为条件式（保留配乐能力描述，不再指向不存在的路径）
- **不做** symlink 兼容：不在 `~/.agents/skills/` 下建指向库内 skill 的软链接来"假装修好"（会与库内 skill 撞名，pi 检测到同名会告警并保留先发现的）

## Capabilities

### New Capabilities
- `skill-path-hygiene`: skill 交叉引用必须可解析——文档中出现的 skill 路径必须指向真实存在的目录；库内/全局两种 tree 的写法口径统一；仓库提供自动校验手段且纳入发布前验证

### Modified Capabilities

（无——本次只修引用与新增校验，不改变任何内容生产行为；`content-change-planning` 能力由并行的 change `content-skills-openspec-gate` 引入）

## Impact

- 21 个文件位于 `~/gongshangzheng.github.io/.agents/skills/`：`read-article`（SKILL.md + phases/extraction.md、phases/html-writing.md、subagents/image-collection.md）、`academic-research`、`book-to-blog`、`blog-rules`、`historical-narrative`、`github-repo-read`、`deep-research` 及其 phases/subagents
- 新增 `scripts/check-skill-paths.py`（按树解析，多 skill 树环境通用）
- **不动**：`web-search` 的 4 处引用（全局真实存在）、`src/pages/` 任何内容、`build.js` / `lib/`、`openspec/`（那里出现的 `~/.agents/skills/...` 是"禁止用法"的说明文字）
- **配套关系**：与 `content-skills-openspec-gate` 并行；后者新增门禁文档并要求所有新引用用库内锚定路径，本 change 清理存量 66 处，两者合起来保证路径口径一致
- 验证：`scripts/check-skill-paths.py` 退出码 0；`node build.js` 无错误；`npm test` 通过
