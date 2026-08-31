## 1. 现状审计

- [x] 1.1 生成数字人分类树全量文章清单（含 date、aliases、sub_id、title），输出审计基线
- [x] 1.2 标记分类游离文章（数字人主题但不在 `categories/AI/数字人` 树下）与 aliases 异常（多路径/缺失）
- [x] 1.3 核对 `digital-human-hub.html` 现有索引与实际文章清单的差集，列出未收录文章
- [x] 1.4 检查各层级 `sub_id` 是否有冲突或断号

## 2. 文章归位

- [x] 2.1 逐文件修正游离/异常文章的 `aliases`（迁移到分类树正确层级）
- [x] 2.2 为每层级重新核对 `sub_id` 排序（按阅读逻辑而非纯日期）
- [x] 2.3 修正因归位需要更新的交叉链接（wiki 链接 / 内链指向）

## 3. Hub 页更新

- [x] 3.1 将未收录文章按类型补入 `digital-human-hub.html` 对应分区
- [x] 3.2 新增"扩展定义与未来方向"一节：状态模型五维度分解 + 指令接口框架
- [x] 3.3 在该节标注四个空白方向及文献线索：text-to-human-motion（Survey 2509.03883、Fleximo 2411.19459、HumanDreamer）、情绪可控生成（Emotion-Controllable Face Generation Survey）、属性/年龄编辑、亲属人脸合成（CDFS 2002.11376、StyleDiT 2412.10785）
- [x] 3.4 增加指向 `about-digital-human.html` 的定义框架入口链接
- [x] 3.5 更新 frontmatter `updated_at` 与 description

## 4. about-digital-human 联动

- [x] 4.1 确认 `about-digital-human` 保留在 `categories/杂识`（不改归属），在正文或文末补充到数字人 Hub 的反向链接（可选，视正文结构）
- [x] 4.2 同步 `drafts/about-digital-human.org` frontmatter 备注（如有必要）

## 5. 论文精读草稿

- [x] 5.1 用 blog-drafts 创建 StyleDiT（arXiv 2412.10785）精读草稿，target_alias 设为 `categories/AI/数字人/数字人论文精读`
- [x] 5.2 用 blog-drafts 创建 CDFS（arXiv 2002.11376）精读草稿，同上目标分类
- [x] 5.3 在草稿 frontmatter/正文记录调研结论：kinship 数据稀缺、RTG 控制机制、无 ground-truth 训练策略等要点

## 6. 校验与收尾

- [x] 6.1 运行 `node build.js`，确认无错误与链接/别名告警
- [x] 6.2 检查分类页、索引页渲染与 `数字人` 别名跳转
- [x] 6.3 运行 `openspec validate organize-digital-human-content`，确认 spec 合规
- [x] 6.4 提交改动并更新 change 状态
