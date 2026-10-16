# 论文表格：LaTeX 渲染与手工整理

原论文表格支持以下两条路径，PDF 裁图仍可作为需要保留原始版式时的备选。

## 素材组织

- `raw/<paper>/source-tar/`：原始源码及目录，不修改。
- `raw/<paper>/tables/index.md`：原表编号、标题、原文链接、源码路径/label、片段与宏依赖、输出路径、转换方式及核对状态。PDF 页码未核实则明确注明。
- `raw/<paper>/tables/table-03-source.tex`：选中的完整表格片段；若删改则注明。
- `raw/<paper>/tables/table-03-preamble.tex`：必需的宏与附加包，按需提供。
- `raw/<paper>/tables/table-03.webp`：渲染图；同名 `.pdf`、`.tex`、`.log`、`.json` 保留编译结果、包装源码、日志及来源哈希。
- 选用图片复制到 `drafts/assets/<draft>/`；手工整理表格可直接放草稿正文，在索引记录对应小节。`raw/` 不随草稿纳入版本管理。

## A. LaTeX 源码生成图片

先阅读所属正文，选择完整表格与必要依赖。脚本接受 `table`/`table*`、`tabular` 等片段，不自动拆整篇论文或推断任意自定义宏。

```bash
~/.venv/bin/python .agents/skills/read-article/scripts/render-latex-table.py \
  raw/<paper>/source-tar/tables/table.tex \
  --source-root raw/<paper>/source-tar --table-number 3 \
  -o raw/<paper>/tables/table-03.webp
```

需要自定义宏时加 `--preamble raw/<paper>/tables/table-03-preamble.tex`。中文可选择 `--engine xelatex`，并在 preamble 配置中文包/字体。依赖本机 TeX 和共享转换脚本的 `pymupdf pillow numpy`。

- 页面默认 180×240 mm，可用 `--width-mm` / `--height-mm` 调整；多页或 overfull 警告会停止。跨页表需人工拆成各有表头的片段，或走路线 B。
- 默认 300 DPI，复用 `scripts/convert-figures.py` 裁白边；`--padding` 默认 0.02。目视检查表头、细线、浅色内容、单位与脚注是否完整。
- 不默认覆盖产物；重生成用 `--force`。编译失败在 `.failed.tex` / `.failed.log` 保留本次包装源码与日志，保留之前成功产物不变；补充宏/包后重试，或转路线 B，不随意改动数值。
- 编译禁用 shell escape，有 120 秒超时，但不是安全沙箱，只编译已检查的片段与依赖。相对输入路径按 `--source-root` 解析。
- 重新编译可能改变字体、列宽与 caption 样式，应称“根据原论文 LaTeX 源码渲染”，不能称“原论文截图”。`--table-number` 保留原表号，其他交叉引用仍需人工处理。

嵌套 Org 草稿示例：

```org
#+CAPTION: 表 1：图像微调策略比较。根据 VideoCrafter2 原论文 Table 3 的 LaTeX 源码渲染。
[[file:../assets/video-diffusion-architectures/videocrafter2-table-03.webp]]
```

## B. 手工整理为 Markdown / Org 表格

适合简单表格、中文解释、筛选行列或跨论文比较。由 agent 理解后整理，不以粗糙正则自动转换任意 LaTeX。

1. 回源逐格核对名称、数值、小数位、单位、指标方向、粗体含义和脚注。
2. 合并单元格可展开或重复分组名；数学表达式保留 LaTeX，Markdown 单元格中的 `|` 需转义。复杂结构可拆表。
3. 标注“根据原论文 Table N 整理”，说明筛选或合并范围，不声称是原表完整复制。
4. Markdown 草稿用 Markdown 表格，Org 草稿用原生 Org 表格；表前说明比较问题，表后解释结论与条件。

```markdown
| 微调范围 | 美学分数 ↑ | 技术质量 ↑ |
|---|---:|---:|
| 仅空间（直接微调） | 82.57 | 70.35 |
| 空间与时间（直接微调） | 83.59 | 67.75 |

根据 VideoCrafter2 原论文 Table 3 整理，仅列两种直接微调方案。
```

每篇论文素材准备时清点重要表格，记录选用或不选用理由。通常在整理表与渲染原表中选一种，避免重复堆放。源码下载成功不等于表格已渲染、核验或插入草稿。
