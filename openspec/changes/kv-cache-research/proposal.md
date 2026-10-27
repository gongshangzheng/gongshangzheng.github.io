## Why

用户希望为 KV Cache 专题博客先完成资料检索、重要论文筛选，再按历史沿革与问题演化进行统计和改进方向分析。库内已有 [KV Cache、PagedAttention 与调度器](../../../src/pages/kv-cache-pagedattention-scheduler.html)，但其侧重 serving 内存管理，缺少跨架构、压缩、复用与视频生成的原始论文总账和可比性分析。

## What Changes

建立一个研究准备阶段的 Change：交付可追溯来源、分层论文池、研究方法与后续深读任务。已完成初筛；用户要求继续后，进入原文获取、逐篇阅读及证据总账整理，不进入博客正文写作。

### 文章清单

| slug | 标题 | 类型 | 目标 alias | sub_id | 产出物路径 |
|---|---|---|---|---|---|
| `kv-cache-pagedattention-scheduler`（已有） | KV Cache、PagedAttention 与调度器：现代推理引擎到底在优化什么 | 后续扩充候选 | `categories/AI/AI Infra` | 现有未设置；本阶段不分配 | 现有 `src/pages/kv-cache-pagedattention-scheduler.html`，本阶段不修改 |
| 待用户草稿确定 | KV Cache 专题（暂定研究主题） | 研究准备，非待发布文章 | 待确定与已有专题的分工 | 不分配 | `raw/kv-cache-research/` 与本 Change |

- **素材**：检索 survey、技术博客、官方文档和原始论文，记录实际读取深度与核验缺口。
- **论文池**：区分核心综述、必读论文、路线代表与边界背景；说明每篇入选原因。
- **研究设计**：用时间和技术路线两个维度整理；将延迟、吞吐、显存、带宽、质量与训练成本分开比较。
- **范围**：以因果 Transformer 的 KV Cache 为中心，覆盖 LLM 与因果/自回归视频生成，另记录扩散特征缓存作为边界对照。
- **草稿与文章**：不代写用户草稿；没有用户实质草稿时不生成文章章节大纲。后续优先评估扩充已有专题，确需独立文章时再说明分工。

## Capabilities

### New Capabilities

- `kv-cache-research`: 可审查的 KV Cache 来源清单、论文分层、研究范围和证据要求。

### Modified Capabilities

无。

## Impact

- 新增本 Change 的 proposal、design、delta spec 与 tasks。
- `raw/kv-cache-research/` 保存检索记录及论文池，供后续按 `read-article` 深读。
- 本阶段不改 `src/pages/`、`drafts/`、Hub、分类注册表或站点代码；不需运行站点构建。
- 偏离内容写作模板的原因：本次授权是检索和研究规划，尚无本专题用户草稿；因此 design 保留大纲状态说明，但不提供文章章节骨架、配图承诺或发布任务。
