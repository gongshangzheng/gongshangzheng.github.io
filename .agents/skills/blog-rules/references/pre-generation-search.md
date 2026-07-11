# 文章生成前置：库内检索

> 所有负责生成/发布博客文章的 skill，在开始生成前**必须**先做库内检索，避免重复创作 + 收集关联文章。
> 本文件是各生成 skill 共享的前置步骤说明。

## 何时做

每个生成 skill 的最早阶段（Phase 0 / 写作前），在确定主题后、动笔前。

## 检索步骤

1. **抽取主题关键词 + 同义词**（中英文、缩写、别名）。如"Ditto / 扩散分词器 / discrete diffusion tokenizer"。
2. **调用 blog-search**（默认含草稿 + 正文）：
   ```bash
   ~/.venv/bin/python scripts/blog-search.py --keyword "<主题>"
   ~/.venv/bin/python scripts/blog-search.py --keyword "<同义词>"
   ```
3. **实时 grep 正文**（不依赖 build，刚写的内容也能搜到）：
   ```bash
   grep -rl "<关键词>" src/pages/ drafts/ --include="*.html" --include="*.org" --include="*.md"
   ```
4. **读取匹配到的文章/草稿**，判断主题关系（专题 vs 零散提及 vs 草稿 brainstorming）。

## 三种结果 → 三种动作

| 库内已有 | 动作 |
|---|---|
| 已发布同主题**专题文章** | 扩充该文章（补内容/补章节），不新建。**告知用户**并切换到扩充流程。 |
| 已有同主题**草稿** | 扩充该草稿 brainstorming，走该草稿的发布流程（见 blog-drafts skill）。 |
| 只有**零散提及**（局部段落/代码示例） | 新建，但在正文/`.sources` 交叉引用这些相关文章。 |
| **完全没有** | 新建。 |

## 产出

- **去重决策**（新建 / 扩充 / 接力草稿）——明确告知用户，不让用户重复要求。
- **关联文章列表**（slug + 标题）——正文里用 `[[@标题]]` 站内引用、`.sources` 加 `data-cite-key`、或正文首次提及时链接到精读文章（见 read-article Phase 9 交叉引用回链）。

## 违反典型（禁止）

- 用户让写"Ditto 论文精读"，库里已有 `paper-ditto.html` —— 跳过检索直接新建 = 重复创作。
- 用户问"XX 怎么实现"，库里已有深度文章 —— 跳过库内直接 WebSearch = 违反库内问答优先（见 blog-search skill）。

## 与各 skill 的衔接

- 生成 skill 在 Phase 0 / 前置阶段调用本流程，把"去重决策 + 关联文章列表"作为后续写作的输入。
- 若决策为"扩充已有文章"，切换到该文章的维护流程（git diff 找 gap → 补内容），不重新走完整生成管线。
- 若决策为"接力草稿"，调 blog-drafts skill 的 sync 流程，从草稿 brainstorming 起步。
