<!-- 内容类 change 提案模板（templates/content-change/proposal.md）
     适用：产出博客文章 / 论文精读 / 调研报告 / 系列章节 / 书稿转写的 change。
     填写说明：
       · 无内容的节可删，但「文章清单」不可删（用户第一眼看的就是它）
       · 路径一律用库内锚定写法：~/gongshangzheng.github.io/.agents/skills/...
       · 本模板由 blog-rules/references/openspec-gate.md 规定使用场景 -->

## Why

<!-- 为什么现在写这批内容：触发来源（你要求 / 综述挖出的线索 / 草稿到期 / 系列缺口）、
     库内现状（已有哪些相关文章、缺什么）、这批内容补上哪个具体缺口。
     避免"因为想写"这类无法验证的理由。 -->

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `<slug>` | `<子分类>论文精读（N）：<论文名>，<副标题>` | 论文精读 / 系列章节 / 工程解读 / 调研报告 | `categories/...`；sub_id 顺延至 N | `src/pages/<slug>.html` |

<!-- 一张表说清这批产出什么。sub_id 分配前先跑：
     ~/.venv/bin/python3 scripts/check-sub-id.py --category <分类关键词> --suggest -->

- **新增**：<文章>（<一行说清内容定位>）
- **更新**：<已有文章> 的 <哪一节> 增补 <什么>
- **草稿**：<新建/修正哪些草稿，落什么内容>
- **Hub**：<发布时同步哪个 Hub 页>

## Capabilities

### New Capabilities
- `<capability-path>`: <这批内容引入或承载什么能力（要能被 spec 表达为可观察的交付契约）>

### Modified Capabilities
<!-- 仅当已有 spec 的 requirement 发生变化时列出；纯新增内容一般留空 -->

## Impact

- `src/pages/`：<新增/更新哪些文件>
- `drafts/`：<草稿增删改>
- `raw/`：<素材就位情况；缺什么要在第 1 组补>
- 构建验证：`node build.js`、`scripts/check-sub-id.py`
- **不涉及**：<后端 / 依赖 / 已发布文章正文 等明确排除项>
