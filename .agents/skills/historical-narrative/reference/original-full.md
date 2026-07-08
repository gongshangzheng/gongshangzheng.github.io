---
name: historical-narrative
description: 调研一段历史事件/时期，按编年叙事风格写成图文 HTML 页面并发送邮件。与 deep-research 不同——本技能按时间段分派 subagent 挖故事素材，产出是讲故事风格的编年体 HTML，不是学术模块式调研报告。最终交付：org-roam 笔记 + HTML 页面 + HtmlBlogs 发布 + URL 邮件。
---

# Historical Narrative

调研一段**历史事件或时期**，按编年叙事风格写成图文 HTML 页面，发布到 HtmlBlogs 并发送 URL 邮件。

> **适用场景**：用户说「帮我调查/整理 XX 历史」「讲讲 XX 事件的来龙去脉」「XX 战争/运动/朝代的始末」。
> **不适用**：纯学术调研（用 deep-research）、单篇文章解读（用 article-research）。

---

## 0. 输入与输出

- **输入**：一个历史事件/时期/人物/话题
  - 示例：`historical-narrative 美国大萧条`、`historical-narrative 市场花园行动`、`historical-narrative 明朝灭亡`
- **输出**：
  1. `note/<TITLE>.org` — org-roam 笔记（结构化事实存档）
  2. `~/gongshangzheng.github.io/src/pages/<slug>.html` — frontmatter + 编年叙事 HTML（裸正文）
  3. 发布到 HtmlBlogs（`node build.js` + `git push`，自动推送到 GitHub Pages）
  4. URL 邮件发到用户邮箱（仅含博客链接，不内嵌全文）
- **模板**：`re`（research）— 但笔记结构调整为编年体
- **目录**：笔记 → `~/Org/roam/note/`，HTML → `~/gongshangzheng.github.io/src/pages/`

> 🚫 **禁止**：任何 subagent 和中间产物**绝不可**将文件（`.md`、`.txt` 等）写入 `~/Org/roam/` 根目录。素材只做文本返回，不落地为文件。

---

## 1. 信息搜集（按时间段分工）

### 1.1 初步搜索

先用 `web_search`（或 GLM 联网搜索 MCP，参考 web-search skill）搜索主题，获取整体时间线和关键事件列表。确定：
- 起止时间
- 关键转折点（通常 5-8 个）
- 重要人物

### 1.2 分派故事素材 SubAgent

**按时间段**分派 subagent，每个负责一个时期的故事挖掘。

| Agent | 负责 | 产出要求 |
|-------|------|---------|
| Agent A — 序幕/背景 | 事件发生前的背景、社会环境、导火索 | **至少 1000 字**叙事段落 + 关键人物介绍 |
| Agent B — 爆发/开端 | 事件的开端、第一波冲击、当事人的具体经历 | **至少 1000 字**具体日期、场景描写、数据 |
| Agent C — 发展/高潮 | 事件的升级、核心冲突、转折点 | **至少 1000 字**人物故事、决策过程、戏剧性瞬间 |
| Agent D — 结局/余波 | 事件的收尾、后续影响、遗产 | **至少 1000 字**长期影响、历史评价、现代回响 |

> **最少 3 个 subagent**（序幕/爆发/结局），最多 6 个。根据事件复杂度调整。
> **Subagent 模型**：使用 `minimax m2.7`（避免 `kimi-coding` rate limit）。

### 1.3 SubAgent Prompt 模板

```
任务: 收集 [XX历史事件] 在 [时间段] 的故事素材

你需要:
1. 用 web_search（或 GLM 联网搜索 MCP，参考 web-search skill）获取信息来源
2. 用 web_fetch 抓取详细信息（关键页面至少抓取 3-5 个）
3. 用中文整理成**至少 1000 字**的叙事段落

要求:
- 必须包含具体日期、人物姓名、数字数据
- 用讲故事的口吻，不是百科条目
- 标注每个故事的来源 URL（每个段落至少 2 个独立来源）
- 捕捉戏剧性瞬间：关键决策、意外转折、当事人的具体经历
- **重要**: 不要只给一个概括性描述，必须展开 2-3 个具体场景/人物故事
- 如果有可以配图的历史照片/画作，记录其 Wikimedia Commons 文件名（必须验证存在）
- 如果信息不足，标注"信息源未明确给出"，不得编造
- 🚫 不要将素材保存为文件。所有内容直接返回在回复文本中。
- 🚫 绝不在 ~/Org/roam/ 下创建任何文件。
```

### 1.4 素材完整性目标

收集完成后，主 agent 应持有足够支撑 **4000-6000 字** HTML 正文的原始素材。

| 指标 | 最低要求 |
|------|---------|
| 每个 subagent 产出字数 | **至少 1000 字** |
| 总素材字数 | **至少 3000 字**（3 个 agent）× 事件复杂度 |
| 具体场景/人物故事 | 每个 agent ≥2 个 |
| 独立数据点（日期/数字） | 每个 agent ≥5 个 |
| 引用来源 URL | 每个 agent ≥2 个 |

### 1.5 轮询机制

Subagent 完成后**不会主动通知**，主 agent 必须在认为完成时**主动调用 `check_pending_tasks`** 查询结果。结果返回后系统才会在对话中显示，**不要**盲目等待通知。

---

## 2. 创建 Org-Note

使用 `re`（research）模板创建笔记：

```bash
emacs --script ~/.hanako/skills/org-roam-capture/org-roam-capture-template.el re "<标题>"
```

但笔记结构调整为**编年体**（而非 deep-research 的学术模块体）：

| Heading | 内容 |
|---------|------|
| `* 调研问题` | 事件的起止时间、核心问题 |
| `* 参考来源` | 所有来源的标题 + URL |
| `* 时间线` | 按年份/月份的关键事件表格 |
| `* 编年叙事` | **核心模块**。按时间段（序幕/爆发/发展/高潮/结局/余波）分节，每节 300-500 字 |
| `* 关键人物` | 重要人物的简要介绍 |
| `* 数据与影响` | 统计数据、长期影响 |
| `* 结论` | 几句话总结历史意义 |

将各 subagent 的产出按时间段回填到 `* 编年叙事` 的对应子节中。

---

## 3. 生成 HTML（正文先行）

### 3.1 先写正文，不含图片/音乐

**严格遵守：先完成 HTML 正文的写作，再进行任何图片或音乐生成。**

**输出格式：frontmatter + 裸正文**。参考 `html-blog` SKILL §3 和 `~/gongshangzheng.github.io/src/pages/article-template.html`。

禁止包含 `<html>`、`<head>`、`<style>`、`<nav>`、`<footer>`、`<script>`、`<link>` 等——`build.js` 会自动包裹。
图片路径使用 `assets/media/images/<file>`。

### 3.2 写作风格

- **讲故事，不写百科**。用具体的人、具体的场景、具体的细节。
- 每个章节以一个引子/场景开头，不是干巴巴的时间+事件列表。
- 数字要落地：「1,300 万人失业」比「失业率 25%」更有冲击力。
- 引用当事人的原话或回忆录。
- 不回避争议和矛盾——历史本身就是多面性的。
- **篇幅原则：在保持流畅的前提下尽可能长**。不主动删减场景、人物、细节。
- **内容完整性：素材多少字，正文就写多少字**，不要过度简化。Subagent 给了 1000 字素材，正文就要写进 1000 字，不能删成 300 字。

### 3.2 参考来源（必须）

**每篇文章必须在末尾添加参考来源**，使用以下两种格式之一：

**方式 A：`.sources` 组件（推荐）**
```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li><a href="https://zh.wikipedia.org/wiki/..." target="_blank">词条名 — 维基百科</a></li>
    <li><a href="https://en.wikipedia.org/wiki/..." target="_blank">... — Wikipedia（英文）</a></li>
    <li><a href="https://zh.wikisource.org/..." target="_blank">《书名》卷... — 资治通鉴</a></li>
  </ul>
</div>
```

**方式 B：Admonition 块**
```html
<div class="sources">
  <h3>参考来源</h3>
  <ul>...</ul>
</div>
```

> **禁止**：使用 `<div class="article-footer">` 而非正规参考来源格式。

### 3.3 素材覆盖检查（强制）

**在开始写 HTML 之前，必须完成素材覆盖检查，防止信息丢失。**

主 agent 拼装 HTML 时，将所有 subagent 返回的素材整理成一份**素材清单**，逐项确认是否已写入 HTML：

```
素材清单（来自 [Agent A 序幕/背景]）:
- [x] 1929年10月24日「黑色星期四」道琼斯指数下跌12.8%
- [x] 纽约证券交易所前的人群场景描写
- [x] 失业工人排队领面包的排队场景

素材清单（来自 [Agent B 爆发/开端]）:
- [x] 1930年3月《斯姆特-霍利关税法》签署
- [x] 农场主被迫用小麦还债的具体案例
- [x] 胡佛总统「繁荣就在转角」发言节选
```

**检查原则**：
- 每个 subagent 的**核心场景**（不少于 2 个）必须出现在 HTML 中
- 每个 subagent 的**具体数字/日期**（不少于 3 个）必须出现在 HTML 中
- 每个 subagent 的**关键引语**必须出现在 HTML 中（可复用，不可删除）
- **素材多少，正文写多少**：禁止以"精简"为由删减素材内容

### 3.4 图片占位符

配图必须放在 `.ch` 章节的叙事段落之间，不要单独成块：

```html
<div class="ch fade-in">
  <div class="ch-label">第一幕 · ...</div>
  <div class="ch-title">...</div>
  <p>叙事段落...</p>
  <div class="photo">
    <img src="assets/media/images/<name>.jpg" alt="描述" loading="lazy">
    <div class="cap">图片说明</div>
  </div>
  <p>继续叙事...</p>
</div>
```

### 3.5 文件位置

所有文件直接写入 `~/gongshangzheng.github.io/`，不经过中间目录：

| 文件 | 路径 |
|------|------|
| HTML | `src/pages/<slug>.html` |
| 图片 | `src/assets/media/images/` |
| 音频 | `src/assets/media/audio/` |

参考现有文章 `src/pages/liang-dynasty.html` 的格式。

---

## 4. 获取配图（正文后执行，严格按顺序）

### 4.1 网上搜图（首选，必须先做）

如果正文涉及真实历史事件/人物，**必须先**从网上找真实图片：

1. 用 `web_search`（或 GLM 联网搜索 MCP，参考 web-search skill）搜索相关图片关键词（如「昭和天皇 1945 历史照片」「大萧条 失业工人 1930」）
2. 用 `web_fetch` 抓取 Wikimedia Commons / Wikipedia 等可信来源的图片页面
3. 验证图片 URL 存在（browser 打开确认）
4. 下载到 `~/gongshangzheng.github.io/src/assets/media/images/`
5. 用本地文件替换 HTML 占位符

> 原则：**真实照片 > Wiki 图片 > AI 生成**。AI 图像作为补充或找不到真实图片时的备选。

### 4.2 AI 生成（备选，限 1-2 张）

如果网上**确实找不到**合适图片，才用 mmx CLI 生成，且**每篇最多 2 张**：

```bash
mmx image generate \
  --prompt "<从正文提炼的具体场景描述>" \
  --out ~/gongshangzheng.github.io/src/assets/media/images/<name>.png \
  --size 960x720 2>&1
```

**数量**：**每篇最多 2 张**，覆盖最重要的场景（序幕 + 高潮）。
**比例**：`--size 960x720`（4:3）或 `960x640`（3:2）。
**提示词原则**：从正文中提取具体场景，加时代背景词（如 `historic documentary photography style`、`ancient Japanese aesthetic`）。

**🚫 严禁**：一次性生成多张图片（超过 2 张）、不搜图直接用 AI 生成。

### 4.3 图片验证

生成完成后验证文件存在：
```bash
ls -lh ~/gongshangzheng.github.io/src/assets/media/images/<name>.png
```

### 4.4 替换占位符

图片获取后，用真实文件名替换 HTML 中的占位符：

```html
<div class="photo">
  <img src="assets/media/images/<name>.png" alt="描述" loading="lazy">
  <div class="cap">图片说明</div>
</div>
```

**检查**：所有 `<!-- IMAGE_PLACEHOLDER -->` 注释必须已替换为真实 `<img>` 标签，HTML 中无远程图片 URL。

---

## 5. 生成背景音乐（可选）

根据历史时期的整体基调生成配乐，**正文完成后再做**：

```bash
# 生成音乐（必须加 --instrumental）
mkdir -p ~/gongshangzheng.github.io/src/assets/media/audio
mmx music generate \
  --prompt "<从正文提炼的情绪和时代感描述>" \
  --instrumental \
  --out ~/gongshangzheng.github.io/src/assets/media/audio/<slug>-bgm.mp3 \
  --non-interactive --quiet 2>&1
```

**提示词原则**：从正文提炼时代氛围（如「昭和时代日本的战后氛围，略带忧伤和希望」「南北朝古风，历史纪录片风格，中胡与古琴」）。

### 5.1 嵌入音乐

在 frontmatter 中添加 `audio_src` 字段，构建系统会自动注入播放按钮：

```yaml
audio_src: "assets/media/audio/<slug>-bgm.mp3"
```

---

## 6. 组装检查

- [ ] 所有图片占位符已替换为真实 `<img>` 标签
- [ ] 每张图片的 `alt` 属性完整
- [ ] 音频文件存在于 `src/assets/media/audio/` 目录
- [ ] frontmatter 中有 `audio_src` 字段（如有音频）
- [ ] 图片在 `src/assets/media/images/` 中有对应文件

---

## 7. 审查与验证 HTML

**生成 HTML 后必须先验证，确认可读再发布。**

### 7.1 检查

确认以下内容无误：
- frontmatter 格式正确（`---` 包裹的 YAML）
- 所有图片占位符已替换
- 图片路径为 `assets/media/images/`
- 无 `<html><head><nav><footer><script>` 标签
- `.ch` 章节结构完整

然后 build 预览验证：

```bash
cd ~/gongshangzheng.github.io && node build.js
python3 -m http.server 8080 --directory public
# 打开 http://localhost:8080/<slug>.html 确认渲染
```

---

## 8. 发布到 HtmlBlogs

HTML 审查通过后，构建并推送（必须先发布，再发邮件）：

```bash
cd ~/gongshangzheng.github.io
node build.js
git add -A
git commit -m "post: <标题>"
git push
```

> 源文件已在 `src/pages/` 中，无需复制。图片和音频也已在对应目录中。

GitHub Actions 自动构建并部署到 GitHub Pages。

---

## 9. 发送邮件（仅含 URL）

使用 `--template message` 模式发送（简介 + 链接，不发全文）：

```bash
python3 ~/.hanako/skills/send-email/send.py \
  --template message \
  --subject "📜 <文章标题>" \
  --data '{"emoji":"📜","greeting":"新文章","content":"<简介>","url":"<博客URL>","url_text":"阅读文章 →"}'
```

> **禁止**用 `--article`、`--file`、`--inline` 模式发历史叙事——那些会发送全文，只需发简介和链接。

---

## 10. 更新索引

如果产出涉及某个知识领域的目录索引文件（如 `历史笔记目录.org`），需要更新。

---

## 11. 最终检查清单

- [ ] 至少 3 个 subagent 按时间段分工搜集故事素材
- [ ] Subagent 使用 `minimax m2.7` 模型（避免 rate limit）
- [ ] Subagent 完成后主动轮询结果（`check_pending_tasks`）
- [ ] Org 笔记已创建在 `note/` 目录（编年体结构）
- [ ] HTML **正文已完成**（不含图片）
- [ ] **素材完整性**：每个 subagent 的核心场景（≥2）、数字/日期（≥3）、引语均已在正文中，**不得删减**
- [ ] 配图获取顺序：**网上搜真实图片（优先）** → AI 生成（每篇最多 2 张）
- [ ] 如需音乐，生成并嵌入 BGM（`--instrumental`）
- [ ] 所有图片已保存到 `gongshangzheng.github.io/src/assets/media/images/` 并替换占位符
- [ ] 音频已保存到 `gongshangzheng.github.io/src/assets/media/audio/`
- [ ] HTML 中没有任何 `<!-- IMAGE_PLACEHOLDER -->` 注释残留
- [ ] frontmatter 中有 `audio_src` 字段（如有音频）
- [ ] HTML 使用 `.ch` 章节组件
- [ ] HTML 结构检查通过（frontmatter + 裸正文，无 HTML 外壳标签）
- [ ] 本地 build 预览正常
- [ ] HTML 已直接写入 `gongshangzheng.github.io/src/pages/`（frontmatter + 裸正文格式）
- [ ] 已发布（`node build.js` + `git push`）
- [ ] 邮件已发送（仅含 URL：`https://gongshangzheng.github.io/<slug>.html`）
- [ ] 相关索引文件已更新