## Why

`.agents/skills/` 是本仓库 skill 的唯一真源，但工具专属目录会同时持有同名 skill 的实体副本，造成两份内容分叉：

- 实测：`.pi/skills/openspec-{propose,apply-change,update-change,sync-specs,archive-change,explore}/` 6 个目录都是实体副本，而 `.agents/skills/` 下同名文件已在 git 中被定制（`openspec-propose` 多出「Draft traceability」「Content article gate」两段博客门禁）。两份内容不同，且 `.pi/` 在 `.gitignore` 第 40 行，定制不可追溯。
- pi 同时扫描 `.pi/skills` 与 `.agents/skills`，同名不同实体路径会触发 6 条 `name collision` 诊断，每次启动都刷屏。
- `openspec update` 会按 pi tool 重新生成 `.pi/skills/openspec-*`；已改为软链接后，若被改回实体目录，冲突与内容分叉会静默回归，没有任何检查能发现。

现有 `scripts/check-skill-paths.py` 只校验文档里的 skill 路径引用能否解析，不检查 skill 目录本身的实体/软链接形态，因此这类回归无法被现有发布前验证拦住。

## What Changes

- 给 `scripts/check-skill-paths.py` 增加第二类检查：仓库内任何工具 skill 目录（如 `.pi/skills/`、`.claude/skills/`、`.codex/skills/`）中与 `.agents/skills/` 同名的条目，必须是解析到该 `.agents` 目录的软链接；实体目录视为违规。
- 检查范围动态发现（扫描仓库顶层 `*/skills`），不硬编码工具名，新增 harness 目录自动纳入。
- 只检查与 `.agents/skills/` 重叠的名字；工具自己独有的 skill 不报错。
- 违规时退出码非 0，并按「目录 / 名称 / 实际形态 / 期望」逐条列出；`--quiet` 时只输出汇总行。
- 在 `blog-rules/references/publishing.md` 的发布前验证清单里注明这条检查与软链接口径。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `skill-path-hygiene`：新增「工具 skill 目录必须镜像 `.agents/skills` 且只能通过软链接镜像」的要求，以及对应的自动校验场景。

## Impact

- `scripts/check-skill-paths.py`：新增镜像检查与汇总输出，原有引用检查行为与退出码语义不变。
- `.agents/skills/blog-rules/references/publishing.md`：清单一处措辞补充。
- `AGENTS.md`：已记录「工具目录一律用相对软链接」的规则，本 change 为其补上自动验证。
- 不动 `src/pages/`、`build.js`、`lib/`、`openspec/` 存量 spec 正文。
- 验证：`~/.venv/bin/python3 scripts/check-skill-paths.py` 退出码 0（镜像冲突 0 处、死路径 0 处）；`npm test` 通过。
