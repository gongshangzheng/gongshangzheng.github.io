## Context

实测基线（2026-09，扫描 `~/gongshangzheng.github.io/.agents/skills/`）：

- 该目录下 `~/.agents/skills/<name>` 形式的引用共 70 处，其中仅 4 处指向全局真实存在的 skill（`web-search`），**66 处是死路径**
- 死路径按 skill 归类：`html-blog` 30 处、`read-article` 8 处、`blog-rules` 6 处、`arxiv-paper-digest` 6 处、`docling` 7 处、`blog-aliases` 2 处、`blog-images` / `blog-syntax` / `github-repo-read` / `book-to-blog` / `academic-research` / `historical-narrative` / `music-gen` 各 1 处
- 按文件归类：19 个文件，最重的三个是 `read-article/SKILL.md` 11 处、`academic-research/phases/phase5-6.md` 8 处、`blog-rules/references/publishing.md` 6 处
- `.agents/` 之外的 scripts / lib / docs / README / raw **无**死路径 → 范围收敛在 skill 文档内

两个特殊对象：

| 对象 | 处数 | 事实 | 来源 |
|------|------|------|------|
| `docling` | 7 | `import docling` 失败（非 python 包）；全盘无该 skill；git 无删除记录 | 不明 |
| `music-gen` | 1 | 全盘无该 skill；原引用已带"（如果存在）"兜底 | `historical-narrative/phases/media.md` |

成因判断：这批 skill 原在全局 `~/.agents/skills/`，后迁入库内。迁移时大部分引用改成库内锚定（89+ 处正确），少部分漏改。**不是设计意图，是存量漂移。**

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

### D1：口径判据 = "SKILL.md 在哪个 tree"

- 库内 skill → `~/gongshangzheng.github.io/.agents/skills/<name>/<相对路径>`
- 全局 skill → `~/.agents/skills/<name>/<相对路径>`

备选：改成按 skill 名引用（"读取 html-blog skill"），路径永不过期、且 harness 无关。被否——多数指令需要 `cat`/`read` 一个具体文件（如 `phases/html-writing.md`），名字引用表达不了；且现有 89+ 处都是路径写法，改成名字反而制造第三种风格。

### D2：不用 symlink 兼容

在 `~/.agents/skills/html-blog` 建软链指向库内，能让旧路径"碰巧能用"。被否：① 掩盖问题，下次搬迁再犯；② pi 的 skill 发现是递归扫描含 SKILL.md 的目录，全局与库内出现同名 skill 会告警并保留先发现的，行为不确定；③ 全局目录会被其他 harness 读取，污染跨项目环境。

### D3：`docling` 先查证再处置

事实：不是 python 包、无 skill、无 git 记录 → 无法直接"改对路径"。三条候选处置，按序尝试：

1. **（首选）改走既有提取链**：`read-article` 的 Phase 1 本来就有 arXiv source tarball → arXiv HTML → PDF 结构化提取的三级优先级；把 docling 段落改写成"PDF 结构化提取"，依赖既有 `phases/extraction.md` 流程
2. **保留能力但标注前提**：若 `book-to-blog` 的技术书 OCR 确实依赖 docling，改写为条件句"若环境已安装 docling（`pip install docling`）则用它处理表格/公式密集的技术书，否则回退到既有提取链"
3. **删除引用**：若上述都不成立

默认按 1 → 2 → 3 的顺序落，具体在实施时按文件语境逐个判定；**不静默删除**，每处改动都在 tasks 里注明处置方式。

### D4：`music-gen` 修正路径并保留可选语义

该引用原文已经是"先读取 `.../music-gen/SKILL.md`（如果存在）"——作者已知其不确定性。处置：删除无效的全局路径指向，改成"若存在 `music-gen` skill 则读取其乐理与 prompt 写法，否则按通用配乐提示自行生成"。保留能力描述，不假装该 skill 存在。

### D5：校验脚本 `scripts/check-skill-paths.py`

扫描范围：全库（排除 `node_modules` / `.git` / `raw`），匹配两类引用：

- `~/.agents/skills/<name>` → 检查 `~/.agents/skills/<name>` 是否存在
- `~/gongshangzheng.github.io/.agents/skills/<name>` → 检查库内是否存在

输出死路径清单（文件:行 + 目标），退出码非 0 表示有问题。不接入 pre-commit；列入 `blog-rules/references/publishing.md` 的发布前验证清单。

理由：本次的根因是"引用与实体分离且无人校验"，只修不校验必然复发。脚本 30 行内可写完，成本低于一次排查。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 批量替换误伤：把全局真存在的 `web-search` 也改成库内路径 | 白名单 `web-search`（4 处不动）；替换后跑 `check-skill-paths.py` + `git diff` 抽查 |
| 删除 docling 引用削弱技术书 OCR / 表格提取能力 | D3 按语境判定，保留条件句分支而非硬删；`book-to-blog/phases/extraction.md` 的技术书场景保留说明 |
| 66 处分散在 19 个文件，逐处改动易漏 | 以脚本输出为清单逐条勾；完成后脚本退出码 0 作为完成判据 |
| 后续 skill 再搬迁导致路径再次失效 | D5 脚本 + 写入口径规范；发布前验证清单里跑一次 |
