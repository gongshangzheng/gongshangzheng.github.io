## ADDED Requirements

### Requirement: 草稿创建
系统 SHALL 用 blog-drafts skill 的 `draft.py new` 命令创建 `drafts/video-gen-acceleration.org`（org 默认格式，brainstorm 模板），初始内容为从 11 张 ChinaSI 2026 幻灯片照片提取的 10 个加速工作骨架（每个工作含：名称、论文标题、发表 venue、核心方法一句话、关键加速指标）。

#### Scenario: 创建草稿
- **WHEN** 执行 `draft.py new video-gen-acceleration --title "视频生成推理加速" --format org`
- **THEN** 生成 `drafts/video-gen-acceleration.org`，frontmatter 符合 blog-drafts 规范（status=idea, progress 初始值），正文含 10 个工作的照片提取骨架

#### Scenario: 默认 org 格式
- **WHEN** 创建草稿时未显式指定 `--format`
- **THEN** 草稿为 `.org` 格式（`draft.py new` 的默认值），不得凭"已有草稿是 md"而跟随建 md

### Requirement: 逐模型渐进填充
调研填充 SHALL 按单模型粒度进行：每次（一个用户回合）只调研并填充一个加速工作，填充完成后停止，等待用户审核反馈，审核通过后才继续下一个。填充顺序按报告演讲顺序：FPSAttention → BLADE → Latent Spatial Memory → WorldAttention → ZipAR → NAR → FlashAR → DAX → TurboDiffusion → Inferix。

#### Scenario: 单次填充一个模型
- **WHEN** 开始一轮填充
- **THEN** 只调研当前轮次对应的一个工作，把调研结果（论文细节、代码仓库、原理、指标）追加进草稿对应小节，更新 progress
- **AND** 向用户报告本轮填充内容并等待审核，不在同一回合填充第二个工作

#### Scenario: 用户审核不通过
- **WHEN** 用户对某轮填充内容提出修改意见
- **THEN** 先按意见修正草稿对应小节，再继续等待确认；不推进到下一个工作

### Requirement: 草稿内容边界
草稿每个工作小节 SHALL 保持结构简单：问题背景、核心方法、关键指标、代码/论文链接四类信息即可。MUST NOT 提前做跨模型对比表、分类体系或复杂组织结构——这些留到用户明确要求或发布前整理阶段。

#### Scenario: 草稿保持简单
- **WHEN** 填充任一工作小节
- **THEN** 该小节只含上述四类信息，不引入横向对比矩阵或自定义分类法
