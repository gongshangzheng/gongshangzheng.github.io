## Why

用户提出调研“由当前人脸预测未来年龄、体重变化或治疗后的面部外观”。库内已有 `drafts/orthodontic-outcome-prediction.org`，重点记录儿童三维面部生长、3DGrowthNet 与正畸预测；当前缺少覆盖年龄、体重和治疗结局的跨学科论文地图，也缺少对纵向/个体预测证据、引用背景与全文可得性的分层比较。

本 change 先完成可复核的论文地图与研究问题界定，并把检索、引文追踪及开放全文查找工具路线固定下来；本阶段不撰写或发布文章，也不作个人面部未来结果的临床承诺。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| 不创建（研究材料） | 面部未来状态预测：论文与检索地图 | 论文池/调研工作材料 | `raw/facial-appearance-outcome-prediction/`；不发布，alias 与 sub_id 不适用 | `field-map.md`、`paper-pool.csv`、`search-log.md` |

- **研究问题**：明确当前面部输入、目标变化、预测输出和时间/干预条件；区分群体平均生成与同一人的未来状态预测。
- **研究范围**：年龄与生长、体重/体型变化、治疗/干预结局，以及 2D/3D 表征、纵向数据、验证和公平性等横向问题。
- **分阶段推进**：先形成论文地图，再决定是否进入关键论文深读、分支证据综合、可行性评估及后续写作发布。
- **研究工具**：采用项目内 `paper-lookup` 与 `facial-appearance-paper-map` Skills；Scopus 作为可选补充源，不作为前置条件。
- **访问边界**：只记录和获取开放获取或经授权的全文；无法取得时记录状态并限制结论，不使用 Sci-Hub fallback。
- **暂不发布**：当前只产出内部研究材料，不写博客 HTML、不修改既有草稿正文。

## Capabilities

### New Capabilities

- 本 change 为研究规划与内部材料整理，不改变产品行为，`.openspec.yaml` 设置 `skip_specs: true`，不新增软件能力规格。

### Modified Capabilities

- 无

## Impact

- `raw/facial-appearance-outcome-prediction/`：论文池、领域地图与可复核检索日志（待本阶段执行）。
- `.Codex/skills/paper-lookup/`：项目内安装的多数据库检索、元数据、引文和 OA 查找 Skill（已完成工具准备）。
- `.Codex/skills/facial-appearance-paper-map/`：本主题的任务分类、检索字段、引文追踪和证据边界 Skill（已完成工具准备）。
- `drafts/orthodontic-outcome-prediction.org`：仅作已有背景材料参考，本阶段不修改。
- **不涉及**：`src/pages/`、站点构建、生产系统、数据库或真实个人面部数据。
