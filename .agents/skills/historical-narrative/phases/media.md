# Phase 4 — 配图与音乐

## 配图

通用配图来源优先级见：

```
~/gongshangzheng.github.io/.agents/skills/blog-rules/references/image-priority.md
```

historical-narrative 的配图特殊性：

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 🥇 | 真实历史照片 | 官方档案、新闻照片、历史文献 |
| 🥈 | Wiki / Wikimedia Commons | 公共领域历史图 |
| 🥉 | 参考文章中的图片 | 从搜索到的历史文章中提取 |
| 最后 | AI 生成 | **每篇最多 2 张**，必须在 caption 中标注 |

**AI 图片标注**：

```html
<div class="cap">图片说明<em>（AI 生成图像）</em></div>
```

历史公共领域照片**不需要**标注。

### 搜图流程

1. 用 `web_search` 搜索历史图片关键词
2. 用 `web_fetch` 抓 Wikimedia Commons / Wikipedia 等可信来源
3. 验证图片 URL 存在
4. 下载到：`~/gongshangzheng.github.io/media/images/<slug>/`
5. 用本地文件替换 HTML 占位符

### 图片 HTML

```html
<div class="photo">
  <img src="media/images/<slug>/<name>.jpg" alt="描述" loading="lazy">
  <div class="cap">图片说明</div>
</div>
```

HTML 中不要保留远程图片 URL。

### 架构/流程图（Mermaid）

若需要绘制历史事件关系图、时间线、制度演变等结构化图，用 `mermaid` shortcode：

```html
{{< mermaid >}}
graph TD
    A[事件起因] --> B[关键转折点]
    B --> C[历史影响]
{{< /mermaid >}}
```

---

## 背景音乐（可选）

正文完成后生成音乐。**先读取 `~/.agents/skills/music-gen/SKILL.md`**（如果存在）获取乐理知识和 Prompt 写法。

若 music-gen skill 不存在，使用 mmx 命令直接生成：

### 音乐生成流程

1. 分析文章的情绪基调和文化背景
2. 确定：调式 → 乐器组合 → BPM → 结构描述
3. 写出精确的 `--prompt` 字符串
4. 执行 mmx 命令生成（后台 60-90 秒）
5. 验证文件（`ls -lh` + `file` 命令检查）

### mmx 命令格式

```bash
mkdir -p ~/gongshangzheng.github.io/media/audio
mmx music generate \
  --prompt "in D minor, 65 BPM, solo cello, melancholic, historical documentary score, ambient opening gradually builds" \
  --instrumental \
  --out ~/gongshangzheng.github.io/media/audio/<slug>-bgm.mp3 \
  --quiet
```

### Prompt 核心要素（按优先级）

```
[调式] + [BPM] + [主奏乐器] + [情绪] + [使用场景] + [结构描述]
```

**调式选择参考：**

| 情绪/场景 | 调式 |
|---|---|
| 帝国衰落/历史悲歌 | 小调（Minor） |
| 沉思/夜晚/内省 | 自然小调/多里安（Dorian） |
| 战争/军事 | 小调或大调进行曲 |
| 希望/救赎 | 大调（Major） |
| 危机/压迫 | 和声小调（Harmonic Minor） |
| 爵士/都市 | 多里安（Dorian） |
| 自然/地理 | 大调 |

**乐器声音人格：**
- 大提琴（Cello）= 深沉/悲剧/歌唱性
- 钢琴（Piano）= 清澈/多面/通用
- 小提琴（Violin）= 哀怨/戏剧性
- 铜管 = 庄严/仪式/帝国
- 萨克斯 = 爵士/都市/忧郁

### frontmatter 添加

生成完成后，在 HTML 文件的 frontmatter 中添加：

```yaml
audio_src: "media/audio/<slug>-bgm.mp3"
```

---

## 完整流程检查清单

- [ ] 搜图完成（真实图片优先，最多 2 张 AI 图）
- [ ] AI 图片已标注 `<em>（AI 生成图像）</em>`
- [ ] 图片已下载到 `media/images/<slug>/`
- [ ] HTML 中已用本地路径 `media/images/<slug>/<name>` 替换所有图片
- [ ] 音乐生成完成（如用户需要）
- [ ] mp3 文件已验证（大小正常、可播放）
- [ ] frontmatter 已添加 `audio_src`（如有音乐）
