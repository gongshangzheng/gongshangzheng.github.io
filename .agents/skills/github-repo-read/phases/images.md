# Phase 3: 图片与资产收集

**目标**：收集并本地化项目相关的图片资产，为后续写作提供视觉证据。

## 图片来源优先级

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | 用户笔记/会话中的截图或图片 | 最高优先级。如果用户已经放图，优先使用 |
| 2 | GitHub 仓库图片 | README/docs/assets/figures/images/static 中的架构图、demo 图、结果图 |
| 3 | arXiv source / project page 原图 | 论文原图 |
| 4 | PDF 高 DPI crop | PDF 截图 |
| 5 | Docling 临时图 | 只定位，不作为最终图片 |

## 3.1 收集 GitHub 本地图片

```bash
SRC="/tmp/<repo>-src"
SLUG="<slug>"
RAW_FIG="$HOME/Org/roam/raw/${SLUG}/figures/${SLUG}"
mkdir -p "$RAW_FIG"

find "$SRC" -type f \
  \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' -o -iname '*.svg' \) \
  ! -path '*/.git/*' \
  ! -path '*/node_modules/*' \
  -print0 | while IFS= read -r -d '' f; do
    cp "$f" "$RAW_FIG/$(basename "$f")" 2>/dev/null || true
  done
```

## 3.2 解析 README 远程图片

README 中常见格式：

```markdown
![demo](assets/demo.png)
<img src="docs/assets/overview.png">
<img src="https://raw.githubusercontent.com/...">
```

### 处理规则

| 情况 | 处理方式 |
|------|----------|
| 相对路径 | 从 cloned repo 复制 |
| GitHub raw URL | 直接下载 |
| GitHub blob URL | 转换为 raw URL 再下载 |
| shields/badges | 通常不作为正文图片，除非用户明确要求 |

### 下载远程图片

```bash
# GitHub blob → raw 转换
# https://github.com/owner/repo/blob/main/path/to/image.png
# → https://raw.githubusercontent.com/owner/repo/main/path/to/image.png

# 下载示例
curl -sL "https://raw.githubusercontent.com/owner/repo/main/assets/overview.png" \
  -o "$RAW_FIG/overview.png"
```

## 3.3 质量筛选

### 保留

- 架构图 / pipeline 图
- demo 截图
- qualitative comparison
- result plot
- UI screenshot
- usage workflow

### 过滤

- badges
- logos（除非文章需要）
- 小 icon
- avatar
- 低于 300px 的装饰图

### 尺寸检查

```bash
~/.venv/bin/python - <<'PY'
from PIL import Image
from pathlib import Path
for p in Path('figures').glob('*'):
    try:
        im = Image.open(p)
        print(p.name, im.size)
    except Exception:
        pass
PY
```

**质量门槛**：正文关键图建议 ≥ 1200 px 宽；GitHub SVG 可以直接用，或转 PNG。

---

## Gate 条件

进入 Phase 4 前必须满足：

1. **GitHub 仓库图片已收集**到 `$RAW_FIG`
2. **README 远程图片已解析并下载**（如有）
3. **质量筛选完成**，过滤了 badges/icons 等无关图片
4. **尺寸检查通过**，关键图 ≥ 1200px
5. **todo 状态**：Phase 3 标记为 `completed`，Phase 4 标记为 `in_progress`

不满足？补齐后重新检查 Gate。
