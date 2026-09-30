## Why

仓库已有接力草稿 `drafts/styletalkpp-2024.md`（paper-note，约 80%，review-ready）与论文全文、图像素材，适合升级为一篇系统精读。该论文是「个人动态身份」课题草稿中的路线 B 第一篇，可补充 talking-head 风格表示、时序动态建模与身份风格可分性的技术证据。

本 change 将规划直接放入 OpenSpec `design.md`，供用户审阅文章范围、结构、证据和目标位置。获批前不写 `src/pages/`、不改草稿正文、不发布。

## What Changes

### 文章清单

| slug | 标题（含系列编号） | 类型 | 目标位置 | 产出物 |
|------|------------------|------|---------|--------|
| `styletalkpp-2024` | 数字人论文精读（六十八）：StyleTalk++，用一个 256 维风格码统一控制表情与头动风格 | 论文精读 | `categories/AI/数字人/数字人论文精读`；候选 sub_id 700（与 EchoAvatar 冲突，待裁决） | `src/pages/styletalkpp-2024.html` |

- **新增**：StyleTalk++ 教学式论文精读，目标 4,000 字以上。
- **更新**：发布后将 `drafts/styletalkpp-2024.md` 标记为已发布，并视需要更新 `drafts/personal-dynamics-digital-human.org` 中的论文阅读状态。
- **草稿**：复用现有接力草稿，不在文章 change 获批前改其正文。
- **Hub**：候选 `digital-human-hub`，最终按现有 Hub 结构核实。

### 当前素材

- 全文：`raw/styletalkpp-2024/sources/styletalkpp-2024.md`
- 索引：`raw/styletalkpp-2024/meta.md`、`raw/styletalkpp-2024/synthesis.md`
- 原始图：`raw/styletalkpp-2024/figures/styletalkpp-2024/`（32 个文件）
- 既有草稿与配图：`drafts/styletalkpp-2024.md`、`drafts/assets/styletalkpp-2024/`
- 关联课题草稿：`drafts/personal-dynamics-digital-human.org`

## Capabilities

### New Capabilities

（无；本 change 是内容交付。）

### Modified Capabilities

（无。）

## Impact

- `src/pages/styletalkpp-2024.html`：用户批准后新增
- `media/images/styletalkpp-2024/`：写作/发布阶段整理使用的配图
- `drafts/styletalkpp-2024.md` 与 `drafts/personal-dynamics-digital-human.org`：只在发布阶段按需回填状态
- `raw/styletalkpp-2024/`：复用现有论文与分析素材
- 发布前验证：`node build.js`、`npm test`、分类/sub_id 检查
- **本次规划阶段不涉及**：正文写作、草稿正文改动、媒体迁移、发布或部署
