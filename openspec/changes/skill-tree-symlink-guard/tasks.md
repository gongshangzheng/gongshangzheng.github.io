# Tasks

## 1. 检查脚本扩展

- [x] 1.1 `scripts/check-skill-paths.py` 新增镜像检查函数：动态发现仓库顶层 `*/skills`（排除 `.agents/skills`、`node_modules`、`.git`、`raw`、`public`、`media`），`realpath` 等于 `.agents/skills` 的整树别名跳过
- [x] 1.2 对每个镜像树中与 `.agents/skills/` 同名的条目判定形态：非软链接、软链接目标不存在、软链接落点不是 `.agents/skills/<name>` 均为违规，输出含目录、名称、实际形态、期望目标
- [x] 1.3 汇总与退出码：死路径与镜像违规分开计数，任一非 0 则退出码 1；`--quiet` 只输出两行汇总
- [x] 1.4 更新脚本 docstring：说明两类检查、判据与用法

## 2. 规范与清单

- [x] 2.1 delta spec 写入 `openspec/changes/skill-tree-symlink-guard/specs/skill-path-hygiene/spec.md`（ADDED Requirement + 场景）
- [x] 2.2 `blog-rules/references/publishing.md` 清单第 9 项补充口径：工具 skill 目录必须是镜像软链接，脚本同时检查镜像形态

## 3. 验证

- [x] 3.1 正例：当前 `.pi/skills/openspec-*` 6 条软链接 + `.claude -> .agents` 整树别名，脚本输出「镜像违规 0 处」，退出码 0
- [x] 3.2 反例 1：临时把 `.pi/skills/openspec-propose` 换成实体目录（复制 `.agents` 版本），脚本报出该条并以退出码 1 结束；验证后改回软链接
- [x] 3.3 反例 2：临时把某条软链接指向 `.agents/skills/openspec-explore`（错目标），脚本报「落点不符」；验证后改回
- [x] 3.4 `~/.venv/bin/python3 scripts/check-skill-paths.py` 全量通过（死路径 0、镜像违规 0、退出码 0）；`npm test` 通过
- [x] 3.5 `openspec validate skill-tree-symlink-guard --strict` 通过
