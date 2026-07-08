# Phase 1 — 信息搜集与时间段分工

## 目标

为一个历史事件/时期收集足够支撑 4000-6000 字编年叙事的故事素材。

## 初步搜索

先用 `web_search`（或 GLM 联网搜索 MCP，参考 web-search skill）搜索主题，确定：

- 起止时间
- 关键转折点，通常 5-8 个
- 重要人物
- 可用的一手/二手来源

搜索时遵循 `web-search` skill 的关键词扩展策略：围绕主题生成 3-5 个搜索变体（如"XX 历史""XX 背景""XX 关键事件""XX 影响"），依次搜索后合并去重。

**搜索工具回退**：内置 `web_search` → MCP 搜索 → `~/.agents/skills/web-search/scripts/ddgs_search.py`

> **注意**：如果用户已经提供了参考文献（如文章链接、PDF、书籍片段），**必须**将其作为核心参考写入调研和写作过程，不得忽略。

## 配图搜集（与搜集素材同步进行）

在搜集故事素材的同时，**同步搜集配图素材**，不要等到写作完成后再找图：

1. **搜索真实历史图片**：使用 `blog-images` skill（统一虚拟环境）
   ```bash
   ~/.venv/bin/python \
     ~/gongshangzheng.github.io/.agents/skills/blog-images/scripts/image_search.py "主题 历史照片" \
     --size Large --type photo --download ~/gongshangzheng.github.io/media/images/<slug>/
   ```
2. **搜索 Wikimedia Commons、Wikipedia、档案馆**等可用的历史照片
3. 对带标注/说明的图片直接使用
4. 对无标注的图片用 `mmx vision describe --image <path> --prompt "描述这张图片"` 理解内容后决定是否采用
5. **必要时 AI 生成补充图**：当真实历史图片不足时，使用 `blog-images` skill
6. 将可用的图片 URL 和来源记录在素材中
7. 所有图片必须下载到本地 `~/gongshangzheng.github.io/media/images/<slug>/`，禁止引用远程 URL

> 本阶段搜图可以减少后期配图阶段的工作量，也避免写作完成后再回头找图的脱节。
> 真实历史图片优先，AI 生成图最多 2 张（见主 SKILL.md "硬规则"）。

## SubAgent 分工

按时间段分派，最少 3 个，最多 6 个。

| Agent | 负责 | 产出要求 |
|---|---|---|
| A | 序幕/背景 | 至少 1000 字，背景、社会环境、导火索 |
| B | 爆发/开端 | 至少 1000 字，具体日期、场景、数据 |
| C | 发展/高潮 | 至少 1000 字，人物故事、决策过程、转折 |
| D | 结局/余波 | 至少 1000 字，长期影响、历史评价、现代回响 |

同一任务优先指定不同 agent，避免单一 agent 失败导致全线延误。

## 强制要求

- 每个 subagent 至少 2 个独立来源 URL。
- 每个 subagent 至少 2 个具体场景/人物故事。
- 每个 subagent 至少 5 个日期/数字/具体数据。
- 所有内容直接返回，不把素材写入 `~/Org/roam/` 根目录。
- Subagent 派出后，**持续轮询** `check_pending_tasks`，直到全部 subagent 都 resolved 才停止。期间不要停下来等、不要盲目等待通知，主动轮询直到所有结果回来。

## SubAgent 监控与故障处理

### 监控阶段

派出 subagent 后，每隔约 30 秒轮询一次 `check_pending_tasks`。观察 `status` 字段：

- `resolved` → 读取 `result` 字段，提取素材
- `failed` → 进入失败处理流程
- `pending` 超过 15 分钟 → 进入"疑似卡住"处理流程

### 疑似卡住处理（pending 超过 15 分钟）

**第一步：判断是任务太重还是 agent 本身有问题**

- 换一个 agent 派出相同任务（换人，不换任务描述）
- 如果新任务也 pending 超过 15 分钟 → agent 本身当前不可用，换第三个人
- 记录哪个 agent 可用、哪个不可用

**第二步：取消旧任务**

- 用 `stop_task` 终止还在 pending 的旧任务，避免同一任务同时跑多份浪费资源

**第三步：继续轮询**

- 新任务派出后继续轮询，直到 resolved 或确认无法恢复
- 如果连续两个不同 agent 都 pending 超过 15 分钟，标记该任务为"高难度"，用已有素材继续，后续补充

### 失败处理（已明确 failed）

| reason 字段 | 处理方式 |
|---|---|
| `找不到模型: xxx` | 换其他 agent，去掉 model 参数重新派出 |
| `网络错误`、`超时` | 等 5 秒后重新派出同一 agent |
| `rate limit` | 等 10 秒后重新派出，或换其他 agent |
| 其他未知错误 | 记录错误，换其他 agent 重新派出 |

诊断完成后立即重新派出。不要跳过失败直接继续。

### 轮询节奏参考

- 任务数 3-4 个：每 30 秒轮询一次
- 任务数 5-6 个：每 60 秒轮询一次
- 遇到 `failed` 或 `pending > 15min`：立即处理，不等待下一个轮询周期

## 输出

所有 subagent 结果汇总后，进入 Phase 2（org-roam 笔记）。