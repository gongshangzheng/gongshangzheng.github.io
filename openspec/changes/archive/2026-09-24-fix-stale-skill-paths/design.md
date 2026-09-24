## Context

实测基线（2026-09，`scripts/check-skill-paths.py` 全库扫描，不含 `openspec/`）：

- 共 199 处 skill 路径引用，**69 处死路径**，全部是"指错树"（skill 存在，但引用指向另一个树）
- 按目标 skill 归类：`html-blog` 30、`read-article` 8+1（另一处写在 `~/.claude/skills/`）、`docling` 7、`blog-rules` 6、`arxiv-paper-digest` 6、`blog-aliases` 2、`course-notes` 2（写在 `~/.hanako/skills/`）、`blog-images` / `blog-syntax` / `github-repo-read` / `book-to-blog` / `academic-research` / `historical-narrative` / `music-gen` 各 1
- 按文件归类：21 个文件，最重的三个是 `read-article/SKILL.md` 11 处、`academic-research/phases/phase5-6.md` 8 处、`blog-rules/references/publishing.md` 6 处

本机现有 skill 树（引用可合法指向的集合）：

| 树 | 内容 |
|----|------|
| `~/gongshangzheng.github.io/.agents/skills/` | 博客相关 skill（28 个） |
| `~/.agents/skills/` | 跨项目工具 skill（asu / docx / web-search / ego-browser …） |
| `~/.hanako/skills/` | 另一 harness 的 skill（含 `docling`、`html-blog`、`read-article`、`web-search`、`org-roam-capture`、`send-email`） |
| `~/.pi/agent/skills/` | pi 专属 skill |

两个特殊对象：

| 对象 | 处数 | 事实 | 处置 |
|------|------|------|------|
| `docling` | 7 | 写作 `~/.agents/skills/docling/...`；实际位于 `~/.hanako/skills/docling/`（`scripts/convert.py` 存在）；不是 python 包 | 改指 hanako 树（见 D3） |
| `music-gen` | 1 | 任何树都不存在；原引用已带"（如果存在）"兜底 | 改条件式（见 D4） |

成因：这批 skill 原在全局，后迁入库内；迁移时大部分引用改了（含 130 处正确引用），少部分漏改，形成"指错树"的存量漂移。

## Goals / Non-Goals

**Goals:**

- 66 处死路径全部可解析：`read` 指令能真正读到目标文件
- 路径口径有明确判据，且写进规范供后续新增引用遵循
- 提供自动校验，防止下次搬迁/改名再漂移

**Non-Goals:**

- 不改任何 skill 的行为逻辑、阶段划分、写作规范（只动路径字符串与 docling/music-gen 的处置）
- 不在 `~/.agents/skills/` 下建 symlink 兼容（见 D2）
- 不引入 pre-commit 钩子（避免拖慢日常提交）
- 不修 `openspec/` 下出现的 `~/.agents/skills/...`（那些是本次并行 change 写的"禁止用法"说明）

## Decisions

### D1：口径判据 = "skill 实际在哪棵树"

- 库内 skill → `~/gongshangzheng.github.io/.agents/skills/<name>/<相对路径>`
- 全局工具 skill → `~/.agents/skills/<name>/<相对路径>`
- 仅其他 harness 有的 skill（如 `docling`）→ 指向其所属树 `~/.hanako/skills/<name>/...`

判据是 **`SKILL.md` 的实际位置**，不是"哪个目录看起来更正式"。

备选：改成按 skill 名引用（"读取 html-blog skill"），路径永不过期、且 harness 无关。被否——多数指令需要 `cat`/`read` 一个具体文件（如 `phases/html-writing.md`），名字引用表达不了；且现有正确引用都是路径写法，改成名字反而制造第三种风格。

### D2：不用 symlink 兼容

在 `~/.agents/skills/html-blog` 建软链指向库内，能让旧路径"碰巧能用"。被否：① 掩盖问题，下次搬迁再犯；② pi 的 skill 发现是递归扫描含 SKILL.md 的目录，全局与库内出现同名 skill 会告警并保留先发现的，行为不确定；③ 全局目录会被其他 harness 读取，污染跨项目环境。

### D3：`docling` 改指 hanako 树（不是删除）

查证结果推翻了初版假设：`docling` **不是不存在的工具**，而是位于另一棵 skill 树。

事实：

- `~/.hanako/skills/docling/scripts/convert.py` **存在**
- `import docling` 失败（它本来就不是 python 包，而是 skill + 脚本）
- 同一文件内已有其他引用写成了正确的 hanako 路径（6 处）

处置：7 处 `~/.agents/skills/docling/scripts/convert.py` → `~/.hanako/skills/docling/scripts/convert.py`。能力（PDF/表格/公式提取与 OCR）保持不变，不改成条件句、不删除。

影响面：`read-article/SKILL.md`(2)、`read-article/phases/extraction.md`(4)、`book-to-blog/phases/extraction.md`(1)。

### D4：`music-gen` 修正路径并保留可选语义

该引用原文已经是"先读取 `.../music-gen/SKILL.md`（如果存在）"——作者已知其不确定性。处置：删除无效的全局路径指向，改成"若存在 `music-gen` skill 则读取其乐理与 prompt 写法，否则按通用配乐提示自行生成"。保留能力描述，不假装该 skill 存在。

### D5：校验脚本 `scripts/check-skill-paths.py`

扫描范围：全库（排除 `node_modules` / `.git` / `raw` / `openspec` / `public` / `media`），匹配两类形式：

- `~/gongshangzheng.github.io/.agents/skills/<name>` → 校验库内
- `~/<tree>/skills/<name>`（通用，覆盖 `~/.agents`、`~/.hanako`、`~/.pi/agent` 等）→ 按匹配到的树解析

输出死路径清单（文件:行 + 原引用 + 解析出的树），退出码非 0 表示有问题。

**实现中的教训（已修）**：初版把任意 `~/.X/skills/` 都按 `~/.agents/skills/` 解析，导致 hanako 树下的有效引用被误报为死路径，并让一次临时统计把 130 处正确引用误标成 108 处死路径。现在解析根取匹配到的实际 tree 路径。另外必须忽略占位写法（`<name>`、`...`），模板里的示例路径不算死路径。

不接入 pre-commit；列入 `blog-rules/references/publishing.md` 的发布前验证清单。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 批量替换误伤：把全局真存在的 `web-search` 也改成库内路径 | 白名单 `web-search`（4 处不动）；替换后跑 `check-skill-paths.py` + `git diff` 抽查 |
| 删除 docling 引用削弱技术书 OCR / 表格提取能力 | D3 按语境判定，保留条件句分支而非硬删；`book-to-blog/phases/extraction.md` 的技术书场景保留说明 |
| 66 处分散在 19 个文件，逐处改动易漏 | 以脚本输出为清单逐条勾；完成后脚本退出码 0 作为完成判据 |
| 后续 skill 再搬迁导致路径再次失效 | D5 脚本 + 写入口径规范；发布前验证清单里跑一次 |
