# Phase 4: COMPOSITION — 报告撰写

**目标**：将研究成果编写成完整的 APA 7.0 格式学术报告，并在用户未明确禁止时，默认同步生成可构建的 HTML 博客文章。

## 4.1 报告结构

详见 `agents/report_compiler_agent.md`

完整 APA 7.0 报告结构：

| 部分 | 内容要求 |
|------|---------|
| Title Page | 标题、作者、机构 |
| Abstract | 150-250 词，结构化摘要 |
| Introduction | 背景、问题、目的、RQ |
| Literature Review | 理论框架 + 综述（基于 Phase 3 综合） |
| Methodology | 研究设计、数据收集、分析方法 |
| Findings / Results | 按主题组织的研究发现 |
| Discussion | 解释、意义、局限性 |
| Conclusion & Recommendations | 结论 + 未来方向 |
| References | APA 7.0 格式，100% 对应正文引用 |
| Appendices | 搜索策略、PRISMA 流程图等（如适用） |

## 4.2 写作要求

- **每个 claim 必须有引用**：无支持性断言
- **来源矛盾必须报告双方**：附证据质量比较
- **局限性透明**：必须有明确的 Limitations 部分
- **AI 披露**：包含 AI 工具使用声明
- **可复现性**：搜索策略、纳入标准、分析方法必须文档化
- **逐篇 survey 必须进入正文推理**：如果 Phase 2 纳入了多篇 survey，最终文章不能只写泛泛背景，必须把每篇 survey 的具体发现合并进 taxonomy、对比表、历史演进、指标/loss、数据集或局限性讨论。写作前先检查 Source-to-claim 矩阵：每篇核心 survey 至少贡献一条可定位的正文 claim；没有贡献的来源应降级为 peripheral 或移出 sources。
- **技术 survey 必须拆生成目标与监督信号**：涉及生成式模型、数字人、视频、图像、语音、动作等主题时，至少添加一张“生成目标 / 中间表示 / 训练监督 / loss / metric / 代表方法”的表。不要只按模型名称罗列。

## 4.3 字数参考

| 模式 | 目标字数 |
|------|---------|
| full | 3,000-8,000 |
| quick | 500-1,500 |
| lit-review | 1,500-4,000 |
| systematic-review | 5,000-15,000 |

---

## 4.4 HTML 输出规范

**默认必须生成 HTML 博客页面**：除非用户明确说“只在聊天里回答”“不要生成博客”“不要生成文件”“只要摘要”，否则所有 deep-research 的最终交付都必须进入博客生成流程。不得把聊天内长回答当成最终交付。

生成 HTML 博客页面时，必须遵循 html-blog 技能：

```
读取 ~/gongshangzheng.github.io/.agents/skills/html-blog/SKILL.md
# 写正文时按需读取 references/:
# ~/gongshangzheng.github.io/.agents/skills/html-blog/references/html-components.md
# ~/gongshangzheng.github.io/.agents/skills/html-blog/references/mathjax.md
```

关键规范（详见该文件）：
- frontmatter 完整：`categories` 为 `["研究综述"]`（从 html-blog §1.3 允许列表选取）
- LaTeX：行内 `$...$`，独立公式 `\[...\]`，`<` → `\lt`
- 章节用 `.ch` / `.section` 组件，禁止裸 markdown
- 参考来源用 `.sources` 组件，表格用 `.table-wrap`
- 禁止 `<html>/<head>/<body>/<nav>/<footer>/<script>` 标签
- 图片必须先复制到 `media/images/<slug>/`
- 配图默认先走 `blog-images` 搜真实图片；只有搜图失败、找不到合格图片或只能做概念示意时，才允许回退到 AI 生图
- 生成后执行 `node build.js` 验证

## Gate 条件

进入 Phase 5 前必须同时满足：

1. **报告初稿完成**：所有必填 section 齐全
2. **博客 HTML 已生成**：除非用户明确禁止，否则已在 `~/gongshangzheng.github.io` 中创建/更新 HTML 文章，且文章包含完整 frontmatter、正文、引用、配图或配图占位说明
3. **引用完整**：正文每个引用在 Reference list 中有对应条目
4. **字数在目标范围内**（±20%）
5. **构建验证已执行**：至少运行 `node build.js`，若失败必须记录失败原因并修正或向用户说明阻塞
6. **todo 状态**：Phase 4 标记 `completed`，Phase 5 标记 `in_progress`

section 不完整？补充缺失部分后重新检查。
