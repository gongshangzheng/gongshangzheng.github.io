# Phase 1: SCOPE - 范围界定

**目标**:把用户需求转成可执行的课程笔记任务。

## 操作

1. 明确课程名、章节/主题、材料位置和输出格式。
2. 判断是新写、重写、补充还是发布到博客。
3. 若用户指向"当前/这里/这个页面/这个文件"，先用 `current_status` 获取 UI 上下文。
4. 检查是否已有页面或笔记需要保持风格一致。
5. 建立任务边界：本次覆盖哪些小节，不覆盖哪些小节。
6. 评估输入材料类型：
   - 文本 PDF/PPTX/扫描件 → Phase 2 调用 `docling` skill 转换
   - 纯图片 PDF（无 OCR 文本） → Phase 2 先渲染关键页为 PNG 再视觉确认；**当前工作机专属**可用 `~/.venv` + `PyMuPDF` 渲染指定页，其他机器需先检查 `pdftoppm` / 视觉 MCP 是否可用
   - 大文件（50+ 页）→ 注意 docling 可能超时，参考 SKILL.md §大文件与超时处理

## Subcategory 规则

课程笔记在博客中必须归属到一个 `subcategory`。规则如下：

1. **优先复用已有 subcategory**：查看 `html-blog` SKILL.md §1.4 的 subcategory 表，如果当前课程已有对应 subcategory（如 DSP、高等数学、信息论），直接使用。
2. **新课程必须新建 subcategory**：如果是一门全新的课程（之前从未在博客中出现过），需要在 html-blog §1.4 的 subcategory 表中注册新的 subcategory。命名用中文 2–6 字，与课程名对应（如「通信原理」「旋量代数」）。
3. **Hub 页必须使用 hub 模板**：课程中枢页（第一页/总览页）必须用 `capture.js --hub` 创建，使用 hub 模板的 `.period-card` + `.period-grid` 布局，每张卡片链接到对应章节子页面。不要用普通文章的 `.ch` + `<table>` 布局写 hub 页。
4. **所有子页面 subcategory 一致**：同一门课程的所有章节页面和中枢页，`subcategory` 值必须完全相同。

## 产出

- 笔记主题和章节范围
- 输出格式与目标路径
- 确定的 subcategory（已有 or 新建）
- 输入材料清单初稿
- 需要补强的重点:背景、定义、推导、例题、图片、复习表、博客发布

## Gate 条件

进入 Phase 2 前必须满足:

- [ ] 已确定课程/章节/主题
- [ ] 已确定输出格式
- [ ] 已确定 subcategory（复用已有 or 在 html-blog 中注册新的）
- [ ] 已列出本地材料或确认需要搜索目录
- [ ] 已创建 todo 并将 Phase 2 设为下一步
