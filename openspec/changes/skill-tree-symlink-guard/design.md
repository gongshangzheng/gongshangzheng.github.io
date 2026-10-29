## Context

`.agents/skills/` 是库内 skill 的唯一真源（`AGENTS.md` 已记录）。工具会读各自的 skill 目录，因此仓库里出现了三类形态：

| 形态 | 实例 | 判定 |
|------|------|------|
| 整棵树用软链接指向 `.agents` | `.claude -> .agents`（git 跟踪的符号链接） | 合法，无需处理 |
| 单条 skill 用相对软链接指向 `.agents` | `.pi/skills/openspec-*` → `../../.agents/skills/openspec-*`（本次改造后） | 合法 |
| 同名 skill 的实体副本 | 改造前的 `.pi/skills/openspec-*` | **违规**，内容会与 `.agents` 版本分叉 |

改造前的实测证据：`.pi/skills/openspec-propose/SKILL.md` 与 `.agents/skills/openspec-propose/SKILL.md` 内容不同，后者多出「Draft traceability」「Content article gate」两段博客门禁，说明分叉已经发生；同时 pi 启动时对这 6 个名字各报一条 `name collision`。

`openspec update` 会为 pi tool 重新生成 `.pi/skills/openspec-*`。目前没有任何检查能发现它把软链接改回实体目录，因此需要自动校验。

## Goals / Non-Goals

**Goals:**

- 一条命令查出「工具 skill 目录里与 `.agents/skills` 同名的实体副本」
- 发现范围不依赖硬编码工具清单：新增 harness 目录自动纳入
- 违规时退出码非 0，能直接贴进发布前验证清单
- 与既有引用检查共用同一个脚本、同一套 `--quiet` 语义

**Non-Goals:**

- 不做 `--fix` 自动删除/重建目录：删目录风险高于收益，人工确认更稳
- 不改 `.gitignore`、不把 `.pi/` 纳入 git：软链接是本地防回归措施，其他机器上 pi 直接读 `.agents` 即可
- 不检查工具目录里**独有的** skill（不与 `.agents` 重名的），那些既不分叉也无从判断归属
- 不改 `openspec/` 存量 spec 正文，只通过 delta 追加要求

## Decisions

### D1：判据是"同名 + 形态"，不是"内容相同"

同名条目必须是软链接，且解析目标必须是 `.agents/skills/<name>`。理由：内容比对既能被"改一行"绕过，也会在合法镜像上产生噪音；形态检查是幂等且廉价的。实现上用 `Path.is_symlink()` 加 `realpath` 相等，允许任意相对/绝对写法，只要落点正确。

### D2：镜像树动态发现，整树别名直接放行

扫描仓库顶层 `*/skills`（含点目录），排除 `.agents/skills`、`node_modules`、`.git`、`raw`、`public`、`media`。若某个 `<tool>/skills` 的 `realpath` 已经等于 `.agents/skills`，说明是整树别名（现状 `.claude -> .agents`），跳过该树。这样新增 harness 目录无需改脚本，也不会对 `.claude` 误报。

### D3：只查重叠名字，报告要能直接动手

对每个镜像树，只处理在 `.agents/skills/` 里也有同名目录的条目。违规输出格式沿用现有死路径列表：

```
  ✗ .pi/skills/openspec-propose   实体目录（应为 → ../../.agents/skills/openspec-propose）
  ✗ .pi/skills/openspec-apply-change   软链接指向 ../../.agents/skills/openspec-old（应为 → ../../.agents/skills/openspec-apply-change）
  ✗ .pi/skills/openspec-explore   软链接目标不存在
```

汇总行与死路径分开计数，`--quiet` 只打印两行汇总。

### D4：退出码语义合并

`死路径 > 0` 或 `镜像违规 > 0` 时退出码 1，两者都为 0 时退出码 0。原有引用检查的行为、输出文案、`--quiet` 语义保持不变，避免破坏 `blog-rules/references/publishing.md` 清单第 9 项的既有用法。

### D5：与旧 spec「不得用软链接」的关系

`openspec/specs/skill-path-hygiene/spec.md` 里的「仓库 MUST NOT 通过软链接把一个树的路径指向另一个树的 skill 来规避修正」针对的是**文档中的引用**：写死一条死路径再用软链接兜底。本 change 针对**工具镜像目录**，软链接正是唯一允许的形态，两者不冲突。delta 里显式写明这条边界，避免后续误读。

## Risks / Trade-offs

| 风险 | 缓解 |
|---|---|
| 某工具确实需要独立分叉的同名 skill | 检查会报错并阻止；此时应改名或从 `.agents` 删除该 skill，不允许静默分叉（与「单真源」规则一致） |
| `openspec update` 顺着软链接写进 `.agents`，覆盖定制内容 | 属既有风险（即便不设软链接，openspec 也会写 `.agents`）；检查挡的是"恢复实体副本"，不扩大改动范围 |
| 顶层扫描把非工具目录算进来 | 只有存在 `skills/` 子目录的顶层目录才会进入检查，且只对与 `.agents` 重名的条目报错 |
