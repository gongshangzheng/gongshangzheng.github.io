---
name: hn-review-html-format
description: 三审机制 · HTML 规范审查。专门检查历史叙事 HTML 页面是否符合 html-blog 规范和 build.js 兼容性。
trigger: historical-narrative 历史叙事 Review · HTML 规范审查
---

# Historical-Narrative Review Agent: HTML 规范审查

## 职责

专门审查历史叙事 HTML 页面的文件质量——html-blog 组件规范、build.js 兼容性。

## 检查维度

### 1. 禁止标签检查

搜索以下字符串，预期结果为零：
- [ ] `<html>` / `<head>` / `<body>` / `<nav>` / `<footer>` / `<script>` / `<style>`

### 2. 裸 markdown 语法检查
- [ ] 无残留 `##` / `###` / `- 列表` 等裸 markdown
- [ ] 图片路径为 `media/images/<slug>/<file>`

### 3. html-blog 组件规范

**章节标题（`.ch` 组件）：**
- [ ] 所有 `##` 已替换为 `.ch` + `.ch-title`
- [ ] 编年叙事可用 `.ch-label` + `.ch-title` + `.ch-date`

**参考来源（`.sources` 组件）：**
```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li><a href="..." target="_blank">来源名称</a></li>
  </ul>
</div>
```

**表格（`.table-wrap` 包裹）：**
```html
<div class="table-wrap">
  <table>...</table>
</div>
```

### 4. frontmatter 完整性
- [ ] `title:` / `date:` / `tags:` / `aliases:` (含 `categories/` 路径) / `hero_title:` / `hero_sub:` / `hero_tagline:`
- [ ] `categories` 为 `["历史"]`（从 html-blog §1.3 允许列表选取）

### 5. build.js 验证

```bash
cd ~/gongshangzheng.github.io && node build.js
```
- [ ] 83 tests passed，零失败

### 6. HTML 标签平衡性检查

**这是防止内容溢出容器的关键检查项。**

```bash
# 在文章源文件目录执行：
python3 -c "
import re, sys
lines = open(sys.argv[1]).readlines()
html = ''.join(lines)
parts = html.split('---', 2)
body = parts[2] if len(parts) >= 3 else html
opens = len(re.findall(r'<div[\s>]', body))
closes = len(re.findall(r'</div>', body))
if opens != closes:
    print(f'FATAL: <div> opens={opens} closes={closes} diff={opens-closes}')
    depth = 0
    for i, line in enumerate(body.split(chr(10)), 1):
        depth += len(re.findall(r'<div[\s>]', line)) - len(re.findall(r'</div>', line))
        if depth < 0:
            print(f'  L{i}: depth went negative at: {line.strip()[:80]}')
else:
    print(f'OK: {opens} opens = {closes} closes')
" <file_path>
```

- [ ] `<div>` 开标签数量 == 闭标签数量（diff = 0）
- [ ] 从头到尾扫描，depth 永远不出现负值
- [ ] 每个 `<div class="ch fade-in">` 必须在章节末尾有且仅有 1 个对应的 `</div>`
- [ ] 含 `<div class="photo">` 的章节，`photo` 的 `</div>` + `ch` 的 `</div>` 共 2 个，不要多写

**常见错误模式**：含 `.photo` 的 `.ch` 区块末尾多写了一个 `</div>`，导致紧接其后的 `<p>` 段落掉出 div，后续内容溢出 `main-wrapper`。

```html
<!-- ❌ 错误：photo 的 </div> 后多了一个 </div>，把 <p> 挤到 ch 外面 -->
<div class="ch fade-in">
  ...
  <div class="photo">...</div>
</div>                    <!-- 正确关闭 ch -->
  <p>这段话掉在 ch 外面了</p>
</div>                    <!-- ❌ 多余的 </div>！ -->

<!-- ✅ 正确：所有内容都在 ch 内部，只闭合一次 -->
<div class="ch fade-in">
  ...
  <div class="photo">...</div>
  <p>这段话在 ch 内部</p>
</div>                    <!-- 正确关闭 ch -->
```

### 7. 修复优先级

```
P0（必须修复）：
  - <div> 标签不平衡（任何 diff ≠ 0）
  - depth 出现负值（内容溢出容器）
P1（强烈建议）：
P2（可选）：
```

## 输出格式

```org
* HTML 规范审查报告

** 禁止标签检查
<grep 结果>

** html-blog 组件问题
<问题 + 行号 + 正确写法>

** build.js 验证结果

** 修复优先级

** 总体评级
A / B / C / D + 理由
```

## 强制要求

- 读取实际 HTML 文件内容
- 执行 `node build.js` 验证
- 每个问题标注具体行号