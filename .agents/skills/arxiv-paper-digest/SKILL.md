---
name: arxiv-paper-digest
description: 每日 arXiv 论文追踪。Python-only pipeline：抓取 cs.AI + cs.CV，按 diffusion / autoregressive / image_compression / visual_tokenizer_1d / diffusion_visual_encoder 分类，写入 gongshangzheng.github.io/data/daily-papers，并生成 html-blog 文章到 gongshangzheng.github.io/src/pages/arxiv-digest-YYYY-MM-DD.html。
---

# arxiv-paper-digest

本 skill 是 `~/gongshangzheng.github.io/.agents/skills` 下的独立 submodule。代码已经扁平化，爬虫直接位于本目录，不再使用嵌套爬虫目录。

> **前置 · 库内检索（必做）**：开始生成前，先按 [`blog-rules/references/pre-generation-search.md`](../blog-rules/references/pre-generation-search.md) 做库内检索——判断是新建、扩充已有文章、还是接力草稿，并收集关联文章供正文交叉引用。跳过此步导致重复创作是典型错误。

## Python 环境

必须使用本 skill 自带虚拟环境：

```bash
~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python
```

不要使用系统 `python`。

## 运行入口

```bash
cd ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest
.venv/bin/python run.py --once
```

持续运行：

```bash
.venv/bin/python run.py --continuous
```

launchd 应直接调用：

```text
~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python
~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/run.py --once
```

当前默认配置已改为**单条 rule 多 feed 来源**：`rules/arxiv_rss.yaml` 内同时声明 `cs.AI` 与 `cs.CV` 两个 RSS feed。运行时会先抓取两个来源，再统一去重、过滤、分类、翻译和输出，避免多条 rule 分别写文件造成覆盖。


## 直接关键词搜索

可以直接在本 skill 里调用 arXiv 关键词检索。原独立 arXiv 查询能力已合并到这里。

### Python API

```python
from src.arxiv_search import Query, Taxonomy, build_query, search_by_keywords

q = build_query(
    ["diffusion", "autoregressive"],
    field="title",
    categories=Taxonomy.cs,
    since="20250520",
)
results = search_by_keywords("visual tokenizer", field="abstract", max_results=20)
```

### 支持能力

- `Query.title / abstract / author / category / all`
- `Query.submitted_date(start, end)`
- `&` / `|` / `~` 组合布尔查询
- `search_by_keywords(...)` 直接执行搜索
- `Taxonomy.cs / stat / eess / math / physics / econ`

## Pipeline

1. `src/cli.py`：命令行入口
2. `src/crawler_pipeline.py`：流程编排
3. `src/rule_runtime.py`：规则运行时构建
4. `src/crawler/rss_crawler.py`：多 feed 抓取、去重与统一过滤入口
5. `src/crawl_output_writer.py`：分类 raw JSON 写入
6. `src/html_blog_digest.py`：生成 html-blog 页面

## 输出

- Raw 数据：`~/gongshangzheng.github.io/data/daily-papers/<category>/YYYY-MM-DD.json`
- HTML-blog 源文：`~/gongshangzheng.github.io/src/pages/arxiv-digest-YYYY-MM-DD.html`

## 收尾发布流程

完成当日 digest 生成后，必须继续执行以下收尾步骤，不要停在 raw JSON 或 HTML 源文件：

1. **html-blog 编译**
   - 进入 `~/gongshangzheng.github.io`
   - 执行构建，确保 `arxiv-digest-YYYY-MM-DD.html` 被编译进站点产物
   - 优先沿用 `src/html_blog_digest.py` 的 build 流程；如果手动执行，保持与该脚本一致

2. **发布到博客仓库**
   - 将当日 digest HTML 和 `data/daily-papers/` 下新增或变更的 JSON 一并纳入提交
   - commit message 优先保持为 `daily-papers: YYYY-MM-DD (N papers)` 这一格式
   - push 到 `gongshangzheng.github.io` 远端，确保线上页面可访问

3. **发送邮件**
   - 当天 digest 完成并确认发布后，必须发送邮件通知
   - 邮件内容至少包含：日期、论文总数、博客链接、以及必要的异常说明（如翻译字段缺失、某些分类为空）
   - 如果当天没有匹配论文，也要发送“今日无匹配论文”的邮件，不要静默跳过

4. **失败处理**
   - 只要编译、发布或邮件三步中任一步失败，就不能算任务完成
   - 需要明确记录失败点，并在可能时继续重试剩余步骤或通知用户

## Cron Job Checklist

新建 cron job 或 launchd job 时，必须对照以下 checklist 逐项检查。**路径不对直接 reject，不给漂进去的机会。**

### 填空模板

新建 job 时，从以下模板填空提交。占位符未填或路径不合法，review 不通过：

```
## Job 创建模板

**Job 名称**: [job name]
**触发时间**: [cron expression 或 launchd StartCalendarInterval]
**Job 类型**: [studio_job / launchd_plist]

**路径检查（必填）**:
- 工作目录 (WorkingDirectory): /Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/
- Python 路径 (绝对路径): /Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python
- 入口脚本 (绝对路径): /Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/run.py
- 运行参数: [--once / --continuous]
- 输出目录 (绝对路径): /Users/tangwen/gongshangzheng.github.io/data/daily-papers/

**自检验证（提交前必须执行）**:
- [ ] python 路径存在且可执行
- [ ] 入口脚本存在
- [ ] 输出目录存在且可写
- [ ] 工作目录与 plist WorkingDirectory 一致（填空的工作目录必须等于 plist XML 里的 `<key>WorkingDirectory</key>` 值）
- [ ] 非 .venv 路径会 exit 1
```

### 自检硬检

每个 job 创建后，必须验证以下硬性条件：

1. **Python 路径检查**: `sys.executable` 必须包含 `.venv/bin/python`
   ```python
   import sys, os
   if '.venv' not in sys.executable or not os.path.exists(sys.executable):
       print(f"ERROR: Python 路径非法: {sys.executable}")
       sys.exit(1)
   ```

2. **入口脚本检查**: run.py 必须存在于当前工作目录
   ```python
   if not os.path.exists('run.py'):
       print("ERROR: run.py 不存在")
       sys.exit(1)
   ```

3. **输出目录检查**: 输出目录必须存在且可写
   ```python
   output_dir = os.path.expanduser('~/gongshangzheng.github.io/data/daily-papers/')
   if not os.path.isdir(output_dir):
       print(f"ERROR: 输出目录不存在: {output_dir}")
       sys.exit(1)
   ```

4. **工作目录一致性检查**: 填空工作目录必须与 plist WorkingDirectory 相同
   ```python
   import sys, os
   cwd = os.getcwd()
   expected_cwd = '/Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest'
   if os.path.normpath(cwd) != os.path.normpath(expected_cwd):
       print(f"ERROR: 工作目录不一致: {cwd} != {expected_cwd}")
       sys.exit(1)
   ```

5. **异常通知**: 任何自检失败必须通知频道
   ```python
   import subprocess
   subprocess.run(['open', 'hanako://channel/notify?msg=arxiv-pipeline-异常'])
   ```

### launchd plist 模板

新建 launchd job 时，使用以下模板（替换 `<占位符>`）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string><job-label></string>
  <key>WorkingDirectory</key><string>/Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest</string>
  <key>ProgramArguments</key><array>
    <string>/Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python</string>
    <string>/Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/run.py</string>
    <string>--once</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer><hour></integer><key>Minute</key><integer><minute></integer></dict>
  <key>StandardOutPath</key><string>/Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/logs/<job-label>.log</string>
  <key>StandardErrorPath</key><string>/Users/tangwen/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/logs/<job-label>-error.log</string>
</dict></plist>
```

### studio job 模板

新建 studio job 时，prompt 必须包含以下结构：

```
任务: [任务描述]

环境要求:
- Python 路径: ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/.venv/bin/python
- 工作目录: ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/
- 入口脚本: run.py --once

执行前自检:
1. 验证 sys.executable 包含 .venv
2. 验证 run.py 存在
3. 验证输出目录可写

失败处理:
- 任何自检失败 exit 1 + 频道通知
- 详细错误日志: ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest/logs/
```

## 测试

```bash
cd ~/gongshangzheng.github.io/.agents/skills/arxiv-paper-digest
.venv/bin/python -m unittest discover -s tests -v
```
