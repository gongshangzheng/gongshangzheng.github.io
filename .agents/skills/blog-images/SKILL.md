---
name: blog-images
description: |
  博客配图的统一入口。覆盖网络搜图（DDGS）和 AI 生图（内置工具 + MiniMax CLI），
  定义完整的图片获取优先级链和 fallback 策略。
  真实图片优先，AI 生图仅作兜底。学术场景 AI 生图完全禁止。
  触发词：搜图、配图、找图片、下载图片、生成图片、AI 配图、画一张。
metadata:
  default-enabled: true
  replaces: [image-search, image-generation]
---
## Python 环境

需要运行 Python 脚本或安装 Python 包时，默认使用全局虚拟环境：

- Python: `~/.venv/bin/python`
- Pip: `~/.venv/bin/pip`

除非用户明确要求使用其他环境，或正在检查系统 Python，否则不要使用裸 `python`、`python3`、`pip` 或 `pip3`。


# Blog Images — 图片获取统一入口

统管所有图片获取：网络搜图 + AI 生图，定义优先级链和 fallback 策略。

## 优先级链（唯一事实来源）

```
用户需要配图
    │
    ├── 1. 搜真实图片（image_search.py）──成功──▶ 使用真实图片（默认首选）
    │
    ├── 搜图失败 / 找不到合格图片? ──是──▶ 进入 AI 生图链
    │                                        │
    │                                        ├── 2. 内置 image-gen_generate-image 可用? ──是──▶ 使用
    │                                        │
    │                                        ├── 3. mmx image generate 可用? ──是──▶ 使用 MiniMax CLI
    │                                        │
    │                                        └── 都不可用 ──▶ 告知无法提供合格配图
    │
    └── 用户明确要求 AI 生图 ──▶ 直接进入 AI 生图链
```

| 优先级 | 工具 | 特点 | 适用场景 |
|--------|------|------|----------|
| **🥇 默认首选** | `image_search.py` | 真实、可核验、可信度高 | 博客配图、历史照片、论文插图、标准知识图表 |
| **🥈 AI 首选** | `image-gen_generate-image` | 质量高，非阻塞，支持图生图 | 搜图失败后的 AI fallback |
| **🥉 AI 备选** | `mmx image generate` | MiniMax CLI，需 npm 安装 | 内置 AI 生图不可用时 |
| **❌ 终止** | 无 | 不强行给错误图 | 都不可用时 |

### 学术场景硬规则

学术调研（academic-research / read-article）中 **AI 生图完全禁止**。只能使用搜图结果，搜不到就不配图或用代码绘制（Mermaid / JSXGraph）。

---

## 搜图：image_search.py

### 命令行调用

```bash
# 基础搜索
~/.venv/bin/python ~/gongshangzheng.github.io/.agents/skills/blog-images/scripts/image_search.py "秦始皇兵马俑"

# 指定尺寸并下载
~/.venv/bin/python ~/gongshangzheng.github.io/.agents/skills/blog-images/scripts/image_search.py "科技插图" \
  --size Large --download ~/gongshangzheng.github.io/media/images/<slug>/

# 搜索历史照片（大尺寸）
~/.venv/bin/python ~/gongshangzheng.github.io/.agents/skills/blog-images/scripts/image_search.py "拿破仑 油画" \
  --size Wallpaper --type photo --download ~/gongshangzheng.github.io/media/images/<slug>/

# 搜索数据图表
~/.venv/bin/python ~/gongshangzheng.github.io/.agents/skills/blog-images/scripts/image_search.py "AI 市场规模 图表" \
  --type photo --max_results 5 --download ~/gongshangzheng.github.io/media/images/<slug>/
```

### 参数说明

| 参数 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `query` | 搜索关键词（必填） | — | — |
| `--max_results` | 最大结果数 | 整数 | 10 |
| `--region` | 搜索区域 | `zh-cn` / `us-en` | `zh-cn` |
| `--size` | 图片尺寸 | `Small` / `Medium` / `Large` / `Wallpaper` | 无限制 |
| `--color` | 颜色过滤 | `Red` / `Blue` / `Green` / `Monochrome` 等 | 无限制 |
| `--type` | 图片类型 | `photo` / `clipart` / `gif` / `transparent` / `line` | 无限制 |
| `--layout` | 布局 | `Square` / `Tall` / `Wide` | 无限制 |
| `--license` | 版权过滤 | `any` / `Public` / `Share` / `Modify` | 无限制 |
| `--download` | 下载到指定目录 | 路径 | 仅输出 JSON |
| `--output` | 输出 JSON 文件 | 路径 | 标准输出 |

### 过滤参数使用建议

| 场景 | 推荐参数 |
|------|----------|
| 博客头图 | `--size Large --type photo` |
| 历史照片 | `--size Wallpaper --type photo` |
| 数据图表 | `--type photo --max_results 5` |
| 透明背景图 | `--type transparent` |
| 图标/Logo | `--type clipart --layout Square` |

### 质量门

搜到的图必须检查：
- 来源是否可靠（官方站点 / 论文原图 / GitHub / Wikimedia 优先）
- 图片是否与正文事实一致
- 分辨率是否足够
- 是否可合法引用/复用

---

## 格式转换：所有图片必须转为 WebP

博客图片统一使用 WebP 格式。下载或生成图片后，如果是 PNG/JPG/PDF，必须转为 WebP 再放入 `media/images/`。

```bash
# PNG/JPG → WebP（大图有损 Q80，小图 < 50KB 无损）
cwebp -q 80 input.png -o output.webp
cwebp -lossless small.png -o small.webp

# PDF → WebP（200 DPI 中转）
pdftoppm -png -r 200 -singlefile input.pdf /tmp/tmp_convert
cwebp -q 80 /tmp/tmp_convert.png -o output.webp
rm /tmp/tmp_convert.png

# 删除原件（WebP 是唯一保留格式）
rm input.png
```

**安全网**：`build.js` 会在构建时自动转换任何遗漏的非 WebP 文件，但最佳实践是在插入文章前就完成转换。

---

## AI 生图：fallback 链

仅在搜图失败或用户明确要求时使用。**学术场景禁止使用。**

### 工具选择策略

| 条件 | 选择 | 原因 |
|------|------|------|
| 默认配图 | `image_search.py` | 真实图片可信度更高 |
| 用户明确要 AI 图 | `image-gen_generate-image` | 尊重用户意图 |
| 需要图生图 / 风格迁移 | `image-gen_generate-image` | 唯一支持 image 参数 |
| 搜图失败 / 没有合格图 | `image-gen_generate-image` | AI fallback |
| 内置 AI 工具返回错误 / 额度耗尽 | `mmx image generate` | AI 备选方案 |
| AI 工具也都失败 | 停止并告知 | 不回退到低质量错误图 |

### 参数统一映射

| 统一概念 | 内置 `image-gen_generate-image` | `mmx image generate` |
|---------|-------------------------------|----------------------|
| `prompt` | `prompt` | `prompt` |
| `count` | `count` (1-9) | `n` |
| `ratio` | `ratio` (1:1, 16:9, etc.) | `aspect-ratio` |
| `reference_image` | `image`（图生图） | 不支持 |
| `quality` | `quality` (low/medium/high) | 不支持 |
| `seed` | 不支持 | `seed` |

### 调用示例

```
# 内置工具（凭空生成）
image-gen_generate-image:
  prompt: "描述画面内容"
  count: 1
  ratio: "16:9"
  quality: "high"

# 内置工具（图生图）
image-gen_generate-image:
  prompt: "参考这个风格，画一座未来城市"
  image: "/path/to/style_reference.png"

# MiniMax CLI（内置工具不可用时）
mmx image generate --prompt "描述画面内容" --aspect-ratio 1:1 --out output.png --quiet
```

### AI 生图标注

AI 生成的图片必须在 caption 中标注：

```html
<div class="cap">图片说明<em>（AI 生成图像）</em></div>
```

### 非阻塞工作流

内置 `image-gen_generate-image` 是**非阻塞**的：调用后告诉用户正在生成，继续对话，完成后由 UI 原地替换。

---

## 注意事项

1. **版权合规**：搜索结果可能受版权保护，用于博客时请标注来源或选择无版权图片
2. **下载间隔**：默认 0.3 秒间隔，避免触发限制
3. **图片中需要出现文字时**：把文字内容放在双引号里
4. **mmx CLI 需提前安装**：`npm install -g mmx-cli` 并配置 API key
5. **额度消耗**：AI 生成图片消耗 provider 额度，大批量生成前建议提醒用户
6. **中文搜索**：中文关键词搜索效果良好，建议使用 `zh-cn` 区域设置

## 依赖安装

```bash
~/.venv/bin/pip install ddgs requests
```
