# report-site

## Purpose

把调研数据（价格快照、套餐档案、测评证据、决策矩阵）渲染为自包含静态网页，让课题组不依赖命令行即可审阅调研结论。

## ADDED Requirements

### Requirement: 数据驱动的静态渲染
网页 SHALL 由脚本从仓库数据文件（价格快照 JSON、套餐档案、证据卡）生成自包含静态 HTML：无外部依赖、无构建步骤，可直接以浏览器打开。数据更新后重跑脚本 SHALL 使页面内容同步更新。

#### Scenario: 数据更新后重新渲染
- **WHEN** 价格快照或套餐档案更新后重新运行渲染脚本
- **THEN** 生成的页面反映最新数据，无需手工改动页面文件

### Requirement: 来源与时效标注
页面中每个价格/套餐条目 SHALL 标注数据来源与采集日期；距采集超过 30 天的区块 SHALL 显示 `STALE` 标记（与 pricing-watch / procurement-decision 的复核机制联动）。

#### Scenario: 快照超期
- **WHEN** 渲染时最新快照距当日超过 30 天
- **THEN** 页面显著位置显示 `STALE` 警告与最后采集日期

### Requirement: 冲突与半自动数据的可视区分
`CONFLICT` 数据行 SHALL 以显著样式标注并同时列出各来源数值；半自动核实的条目 SHALL 标注"人工核实 + 核实日期"。

#### Scenario: 渲染含冲突的价格行
- **WHEN** 快照中存在 `CONFLICT` 标记的模型行
- **THEN** 页面中该行高亮显示，且各来源数值全部可见
