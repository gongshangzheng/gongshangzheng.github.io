## ADDED Requirements

### Requirement: 工具 skill 目录必须镜像 `.agents/skills`

`.agents/skills/` 是库内 skill 的唯一真源。仓库内任何工具 skill 目录（顶层 `<tool>/skills`，例如 `.pi/skills/`、`.claude/skills/`、`.codex/skills/`）中与 `.agents/skills/` 同名的条目 MUST 是软链接，且其解析目标 MUST 是 `.agents/skills/<name>`。同名实体副本 MUST NOT 存在。

该要求针对工具镜像目录，与「skill 路径引用必须可解析」中禁止用软链接兜底死引用的规定不冲突：前者规定镜像目录的形态，后者规定文档引用的解析落点。

#### Scenario: 同名条目为相对软链接时通过

- **WHEN** `.pi/skills/openspec-propose` 是指向 `../../.agents/skills/openspec-propose` 的软链接
- **THEN** 检查判定合法，不计入镜像违规

#### Scenario: 整棵树为软链接别名时通过

- **WHEN** `.claude` 是指向 `.agents` 的软链接，因此 `.claude/skills` 解析后等于 `.agents/skills`
- **THEN** 该树被识别为整树别名并跳过，不产生任何违规

#### Scenario: 同名实体副本被报出

- **WHEN** `.pi/skills/openspec-propose` 是同名实体目录而不是软链接
- **THEN** 检查报告该条目的目录、名称与期望软链接目标，并以非 0 退出码结束

#### Scenario: 软链接落点错误或失效被报出

- **WHEN** `.pi/skills/openspec-apply-change` 指向 `.agents/skills/openspec-explore`，或其目标目录不存在
- **THEN** 检查报告「落点不符」或「目标不存在」，并以非 0 退出码结束

#### Scenario: 工具独有的 skill 不受约束

- **WHEN** 某工具 skill 目录中存在 `.agents/skills/` 里没有的同名目录
- **THEN** 该条目不在检查范围内，不产生违规

### Requirement: 镜像校验与引用校验共用同一入口

`scripts/check-skill-paths.py` MUST 同时执行 skill 路径引用校验与工具 skill 目录镜像校验，两类问题分别汇总。任一类计数大于 0 时退出码 MUST 非 0，两类都为 0 时退出码 MUST 为 0。`--quiet` MUST 只输出汇总行。该脚本 MUST 列在发布前验证清单中，且清单 MUST 说明镜像口径。

#### Scenario: 两类问题一起报告

- **WHEN** 仓库同时存在一条死路径引用和一个同名实体副本
- **THEN** 脚本分别输出两段明细与两行汇总，并以退出码 1 结束

#### Scenario: 两类都为零时通过

- **WHEN** 死路径为 0 且镜像违规为 0
- **THEN** 脚本输出两条汇总行并以退出码 0 结束，可作为发布前验证的一项
