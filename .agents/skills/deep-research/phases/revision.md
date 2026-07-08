# Phase 6: REVISION — 修订与定稿

**目标**：根据编辑和伦理反馈修订报告，处理遗留问题，输出最终版本。

## 6.1 修订流程

1. 收集 Phase 5 的所有反馈（编辑 + 伦理 + Devil's Advocate）
2. 逐项处理反馈意见
3. 修订后重新检查受影响的章节
4. 最多 **2 轮修订循环**

## 6.2 遗留问题处理

经过 2 轮修订仍未解决的问题：
- 记入 **"Acknowledged Limitations"** 部分
- 每个遗留问题必须包含：
  - 问题描述
  - 为什么无法在当前研究中解决
  - 对结论的影响评估

## 6.3 最终质量检查

- [ ] 所有编辑反馈已回应（RESOLVED 或 ACKNOWLEDGED）
- [ ] 伦理条件已满足
- [ ] Devil's Advocate 建议已整合
- [ ] 引用零孤立（正文引用 ↔ Reference list 完全匹配）
- [ ] AI 披露声明完整

## 6.4 文献追踪（可选后置功能）

详见 `agents/monitoring_agent.md` 和 `references/literature_monitoring_strategies.md`

用户可请求激活文献追踪：
- 周报/月报摘要生成
- 被引来源的撤稿预警
- 矛盾发现检测
- 关键作者追踪
- 关键词演化追踪

**局限**：只生成配置和模板，无法自主后台运行。

---

## 6.5 更新 Hub 页

`node build.js` 已自动根据文章 frontmatter 的 `categories` / `subcategory` 生成 taxonomy index（`public/categories/<cat>/<subcat>/index.html`），无需手动维护。

本步骤仅处理**手动维护的专题 Hub 页**（`src/pages/*-hub.html`）：

1. 检查新文章的 `subcategory` 是否与某个 Hub 页匹配
2. 若匹配，在 Hub 页合适位置追加 `period-card` 链接，更新 `updated_at`
3. `cd ~/gongshangzheng.github.io && node build.js`
4. 无匹配 Hub 页则跳过

> **Hub 页别名规范**：Hub 页应将 subcategory 的 taxonomy 路径设为 alias，如 `aliases: ["图论", "categories/数学/图论/index"]`。这样 build 系统会自动将 Hub 页内容写入对应的 subcategory index 页。

---

## Gate 条件

完成条件：

1. **修订轮次 ≤ 2**：达到最大轮次后停止修订
2. **所有 Critical 问题已解决**：不得有未解决的 Critical 问题
3. **最终报告输出完成**：包含 Acknowledged Limitations 部分
4. **todo 状态**：Phase 6 标记 `completed`

此阶段完成后，可交接给 `academic-paper` 进行论文撰写。
