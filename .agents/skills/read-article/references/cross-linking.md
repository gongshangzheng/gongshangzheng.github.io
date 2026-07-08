# 交叉引用回链规则

本文档定义精读论文发布后，自动扫描博客中已有引用并补全指向精读文章链接的规则和脚本。

## 精读文章识别

**关键规则**：只有标题包含"精读"或"深度解读"的文章才是精读文章。Survey/系列/Hub 文章虽然也可能有 `.sources` 和正文提到"精读"，但不属于精读文章。

识别条件（全部满足）：
1. 文件位于 `src/pages/` 目录
2. frontmatter `title` 字段包含"精读"或"深度解读"
3. 文件内有 `data-cite-key` 属性（即有 `.sources` 参考列表）

不限于 `paper-*.html` 命名模式。例如 `toontalker-2023.html`、`theval-2025.html`、`sa-icm-2024.html` 也是精读文章。

## 映射表构建

### cite-key 映射（`.sources` 用）

**只用主 cite-key**（每篇文章的第一个 `data-cite-key`），不使用参考文献列表中的其他 cite-key。

原因：精读文章 A 的 `.sources` 中会引用论文 B、C、D，这些引用的 cite-key 不应映射到文章 A——它们属于论文 B/C/D 各自的精读文章（如果有的话）。

```python
# 正确：只映射主 cite-key
primary_key = keys[0]  # 文章精读的论文本身的 cite-key
cite_to_paper[primary_key] = file

# 错误：映射所有 cite-key
for k in keys:
    cite_to_paper[k] = file  # 这会把参考文献也映射过来！
```

### 论文名映射（正文用）

从标题中提取论文简称（"精读（N）："后面的部分，取逗号前的短名），建立 `name_to_paper` 映射。

## Cite-key 碰撞检测

不同论文可能共享同一 cite-key（如 `Guo-et-al.-2024` 可能指代 AnimateDiff 的 Guo 或 LivePortrait 的 Guo）。映射前必须检测碰撞：

1. 构建 `cite_to_paper` 时，若某 cite-key 已存在且指向不同文件 → 记录碰撞
2. 碰撞的 cite-key **不加入映射表**，跳过该条目的 `.sources` 链接
3. 在日志中输出：`[SKIP] cite-key "Guo-et-al.-2024" 碰撞: paper-a.html vs paper-b.html`
4. 正文论文名映射不受影响（论文名不同，不会碰撞）

```python
# 碰撞检测示例
for hf in glob.glob('*.html'):
    # ...提取 primary_key...
    if primary_key in cite_to_paper and cite_to_paper[primary_key] != hf:
        print(f'[SKIP] cite-key "{primary_key}" 碰撞: {cite_to_paper[primary_key]} vs {hf}')
        # 不覆盖，保留第一个映射；或标记为碰撞后跳过
        collided_keys.add(primary_key)
    elif primary_key not in cite_to_paper:
        cite_to_paper[primary_key] = hf

# 后续链接补全时跳过 collided_keys
```

## `.sources` 交叉链接规则

对每个 `<li data-cite-key="KEY">...</li>` 条目：

1. 检查 KEY 是否在 `cite_to_paper` 映射中
2. 若是且目标文件不是当前文件本身
3. 检查 `</li>` 前是否已有指向目标文件的链接
4. 若无，在 `</li>` 前追加 ` · <a href="target-file" class="paper-link">精读 →</a>`

**注意**：链接追加在 `</li>` 标签紧前，用 ` · ` 分隔。不要破坏已有的 `<a>` 标签结构。

## 正文交叉链接规则

对每篇文章的正文区域（frontmatter 之后、`.sources` 之前）：

1. 对每个论文名，找到首次出现的文本位置
2. 检查该位置是否已在 `<a>` 标签内（避免嵌套链接）
3. 检查是否在表格 `<th>`/`<td>` 短文本中（≤ 50 字符的表格单元格跳过）
4. 若安全，将 `论文名` 替换为 `<a href="target-file">论文名</a>`
5. 每篇文章中每个论文名只链接首次出现
6. 保留原有的"精读N"标题链接（如 `<a href="toontalker-2023.html">精读三十三</a>`）

**跳过场景**：
- frontmatter（`---` 到 `---` 之间）
- `.sources` / `.references` 区域
- 已有 `<a>` 标签包裹的文本
- `tags:` / `aliases:` 行
- 表格头部行
- arXiv digest 文章（`arxiv-digest-*.html`）
- chapter-nav / nav-card 区域中的链接

## 自动化脚本

以下 Python 脚本可自动完成上述所有步骤。脚本分为三步执行：

### 1. 清理阶段（移除所有已有的精读链接）

```python
import re, os, glob

PAGES_DIR = os.path.expanduser('~/gongshangzheng.github.io/src/pages')
os.chdir(PAGES_DIR)

# Remove all existing 精读→ links from .sources
for hf in glob.glob('*.html'):
    if hf.startswith('arxiv-digest'):
        continue
    with open(hf, 'r') as f:
        content = f.read()
    original = content
    content = re.sub(r'\s*·\s*<a\s+href="[^"]*"\s+class="paper-link">精读 →</a>', '', content)
    content = re.sub(r'\s*<a\s+href="[^"]*"\s+class="paper-link">精读 →</a>', '', content)
    if content != original:
        with open(hf, 'w') as f:
            f.write(content)

# Remove body text links pointing to reading articles
# (first identify reading articles, then remove their body <a> tags)
```

### 2. 映射构建阶段

```python
# Build mapping: only articles with 精读 in TITLE
cite_to_paper = {}
name_to_paper = {}

for hf in glob.glob('*.html'):
    if hf.startswith('arxiv-digest'):
        continue
    with open(hf, 'r') as f:
        content = f.read()
    title_match = re.search(r'title:\s*"([^"]*)"', content)
    title = title_match.group(1) if title_match else ''
    if '精读' not in title and '深度解读' not in title:
        continue
    keys = re.findall(r'data-cite-key="([^"]+)"', content)
    if not keys:
        continue
    primary_key = keys[0]
    cite_to_paper[primary_key] = hf
    
    # Extract paper name from title
    name_match = re.search(r'(?:论文精读|精读)[（(]\d+[）)]：([^，,\s]+)', title)
    if name_match:
        paper_name = name_match.group(1).strip()
    elif '深度解读' in title and '：' in title:
        paper_name = title.split('：')[1].strip()
    elif '：' in title:
        paper_name = title.split('：')[-1].strip()
    else:
        paper_name = ''
    
    if paper_name:
        short_name = paper_name.split('，')[0].split(',')[0].strip()
        if short_name and len(short_name) > 1:
            name_to_paper[short_name] = hf
```

### 3. 链接补全阶段

```python
# Add .sources links
for hf in glob.glob('*.html'):
    if hf.startswith('arxiv-digest'):
        continue
    with open(hf, 'r') as f:
        content = f.read()
    original = content
    for cite_key, target_file in cite_to_paper.items():
        if target_file == hf:
            continue
        pattern = r'(<li\s+data-cite-key="' + re.escape(cite_key) + r'"[^>]*>)(.*?)(</li>)'
        def add_link(match, tf=target_file):
            li_content = match.group(2)
            if tf in li_content:
                return match.group(0)
            return match.group(1) + li_content + ' · <a href="' + tf + '" class="paper-link">精读 →</a>' + match.group(3)
        content = re.sub(pattern, add_link, content, flags=re.DOTALL)
    if content != original:
        with open(hf, 'w') as f:
            f.write(content)

# Add body text links (first occurrence only)
for name, target_file in name_to_paper.items():
    for hf in glob.glob('*.html'):
        if hf == target_file or hf.startswith('arxiv-digest'):
            continue
        with open(hf, 'r') as f:
            content = f.read()
        if target_file in content or name not in content:
            continue
        # ... find safe position and add <a> tag (see full script)
```

## 验证

验证 `.sources` 链接正确性时，**必须逐个 `<li>` 匹配**，不要让 regex 跨越 `</li>` 边界：

```python
# 正确：逐个 <li> 检查
for match in re.finditer(r'<li\s+data-cite-key="([^"]+)"[^>]*>(.*?)</li>', content, re.DOTALL):
    cite_key = match.group(1)
    li_content = match.group(2)
    link_match = re.search(r'<a\s+href="([^"]*)"\s+class="paper-link">精读 →</a>', li_content)
    if link_match:
        # Check correctness
        pass

# 错误：跨 <li> 边界匹配（会产生大量误报）
# pattern = r'data-cite-key="([^"]+)"[^>]*>.*?<a href="..." class="paper-link">精读 →</a>.*?</li>'
```
