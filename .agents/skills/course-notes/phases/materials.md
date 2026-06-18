# Phase 2: MATERIALS — 本地课程材料读取

**目标**：读取课程原始材料，理解内容结构，为笔记写作建立事实基底。**所有操作只用于内容分析，不涉及博客配图产出。**

## 材料优先级

1. 用户指定文件或当前 UI 指向文件。
2. 当前 workspace 下的 PPT/PDF/讲义/教材/作业/实验文件。
3. 已有博客页面或 org/Markdown 笔记。
4. 课程目录中的答案、代码、实验数据。

## 操作

- 用 `find` / `grep` 定位相关文件。
- PDF/DOCX/PPTX/扫描件统一调用 `docling` skill 转换提取，理解知识点。**docling 的结果只用于写笔记时的内容参考，不作为博客配图来源。**
- 纯图片 PDF（docling 无文本输出）：先把关键页面渲染为 PNG，再用可用视觉能力分析截图内容（每篇选取 5-15 张代表性页面）。**当前工作机专属**：可使用 `~/.venv` + `PyMuPDF` 渲染指定页，再用 `read_file` 读取图片视觉确认；其他环境需先检查 `pdftoppm` / 视觉 MCP 是否可用。
- 大文件（50+ 页）逐个处理，不并行；参考 SKILL.md §大文件与超时处理。
- 对每个主题抽取：
  - 关键定义和公式
  - 推导页或教材段落
  - 需要引用课件页的页码——记录这些到素材卡，供 Phase 4 用 `docpage` shortcode 引用
  - 例题、作业题、实验步骤
  - 教师强调、目录结构和后续章节线索

### docling 内容分析步骤

```bash
source ~/scripts/py_scripts/.venv/bin/activate

# 单个文件
python3 ~/.hanako/skills/docling/scripts/convert.py "input.pdf" \
  -f markdown --image-export-mode referenced -o output.md

# 批量（逐个处理，避免超时）
for pdf in *.pdf; do
    echo "Converting: $pdf"
    python3 ~/.hanako/skills/docling/scripts/convert.py "$pdf" \
      -f markdown --image-export-mode referenced -o "out/${basename}.md"
done
```

**关键参数**：

| 参数 | 值 | 说明 |
|------|-----|------|
| `-f` | `markdown` | 输出格式 |
| `--image-export-mode` | `referenced` | 临时图片仅用于定位理解，不作为博客最终配图 |
| `-o` | 输出路径 | markdown 文件路径 |

**注意事项**：

- docling 导出的 `_artifacts/` 和 referenced 图片仅用于阅读和理解内容。
- **博客配图不要用 docling 的图片**。博客需要引用课件页时，走 `docpage` shortcode（见 Phase 4）。

### 纯图片 PDF 处理流程

当 docling 超时或返回空内容（如扫描版 PPT 截图），先渲染少量代表性页面为临时 PNG，仅用于分析内容。

**当前工作机专属**：在 tangwen 当前工作机上，允许使用 `~/.venv` 安装/调用 `PyMuPDF` 渲染指定页，然后用 `read_file` 读取 PNG 做视觉确认。这是当前机器能力，不是通用环境假设。

```bash
~/.venv/bin/pip install PyMuPDF
~/.venv/bin/python - <<'PY'
import fitz, pathlib
pdf = 'lecture.pdf'
out = pathlib.Path('/tmp/course-pages')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf)
for page_no in [1, 5, 10]:
    pix = doc[page_no - 1].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pix.save(out / f'page-{page_no}.png')
PY
```

通用可选方案：如果机器有 `pdftoppm`，也可使用：

```bash
pdftoppm -png -r 200 "lecture.pdf" /tmp/lecture
```

然后用当前可用的图片理解能力分析关键页面截图（每篇选取 5-15 张代表性页面）。这些临时 PNG 分析完后**不进入博客**，博客配图走 `docpage` shortcode 引用原 PDF。任务结束必须清理 `/tmp/course-pages`、`/tmp/lecture*` 等临时文件。

### 素材卡中的课件页引用记录

记录需要引用到博客的课件页页码：

```markdown
[S-M01]
类型：PPT 第 21 页
位置：第一讲1.pdf（p.21）
内容：卷积和定义与四步法公式
用途：博客配图 → Phase 4 用 docpage shortcode
```

## 素材卡格式

```markdown
[S-M01]
类型：PPT / 教材 / 作业 / 实验 / 现有笔记
位置：文件路径 + 页码/题号/章节
内容：摘录或摘要
用途：背景 / 定义 / 推导 / 例题 / 课件页引用（记下文件+页码，供 docpage 使用）
可信度：课程原始材料 / 辅助材料 / 待核对
```

## Gate 条件

进入 Phase 3 前必须满足：

- [ ] 至少读取一个本地课程原始材料或明确说明缺失
- [ ] 已建立素材卡
- [ ] 若任务涉及作业/实验，至少定位题目或实验步骤
- [ ] 若涉及课件页引用，已记录源文件路径+页码（供 Phase 4 docpage 使用）
