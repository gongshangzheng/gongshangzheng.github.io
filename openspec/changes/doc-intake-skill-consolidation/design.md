# Design: doc-intake 全局 Skill 整合

## 总体结构

```
~/.agents/skills/doc-intake/
├── SKILL.md                  # 统一入口：路由规则、隐私边界、输出契约
├── references/
│   ├── routing.md            # 格式 → 后端决策表、降级链、隐私规则
│   └── upstream.md           # 上游版本、职责、升级流程
├── scripts/
│   ├── doc_intake.py         # 薄管理层 CLI（路由 + 适配器调度）
│   └── sync_upstream.py      # 检查/固定/升级上游版本
├── adapters/                 # 我们维护，只调用不复制
│   ├── mineru.py             # MinerU 官方 CLI 适配
│   ├── office.py             # H-i-m-s 内核适配（OOXML/旧 Office/公式/媒体）
│   ├── docling.py            # 本机 Docling CLI 适配（隔离临时目录）
│   ├── arxiv.py              # arXiv 源码包/原图/表格 + deepxiv 正文
│   └── images.py             # 高清裁图/格式转换
├── tools/                    # 自有工具（官方未覆盖）
│   ├── crop_figures.py       # 由 repo 迁入（PyMuPDF 300-400 DPI bbox 裁图）
│   ├── convert_figures.py    # 由 repo 迁入（PDF/EPS/PNG → WebP）
│   └── render_latex_table.py # 由 read-article 迁入
├── upstream/                 # 官方仓库，原样保留，禁止修改
│   ├── MinerU/               # opendatalab/MinerU @ mineru-4.1.3-released
│   └── doc-intake/           # H-i-m-s/doc-intake @ v3.2.5
├── upstream.lock.json
└── tests/                    # 管理层与适配器回归测试
```

### 上游管理规则

- `upstream/` 为独立浅克隆 Git 仓库；`upstream.lock.json` 记录 URL/tag/commit/用途。
- 提取流程绝不自动 `git pull`；仅显式 `sync_upstream.py upgrade` 换版本，升级后跑回归测试，失败退回。
- `~/.agents` 非 Git 仓库，不使用 submodule。
- 官方 MinerU Skill 软链接：`~/.agents/skills/mineru -> doc-intake/upstream/MinerU/skills/mineru`。
- Hanako 软链接：`~/.hanako/skills/doc-intake -> ../../.agents/skills/doc-intake`。

### 后端路由（routing.md）

| 场景 | 首选 | 降级/补充 |
|---|---|---|
| 本地文档（PDF/扫描件/Office/EPUB/RTF/HTML/CSV/图片） | MinerU 官方 CLI | H-i-m-s 内核、Docling |
| Office 公式（OMML/MathType）、内嵌媒体、EMF/WMF | H-i-m-s 专用内核 | MinerU、页面渲染 |
| PDF 图片高清裁图 | MinerU/Docling 提供 bbox | 自有 crop_figures.py（PyMuPDF 300-400 DPI） |
| arXiv 正文与章节 | deepxiv CLI | arXiv source + pandoc → HTML → MinerU/Docling → pdftotext |
| arXiv 原图/TeX 表格 | doc-intake arxiv --assets-only | HTML 原图 → PDF 裁图 |
| PMC/bioRxiv/medRxiv | deepxiv | paper-lookup 的 jats_to_text.py |
| 纯文本/Markdown/TeX | 直接读取 | 不经过解析器 |

### 隐私边界（原样采用 MinerU 官方规则）

- 默认本地解析；`--remote` 前必须用户同意；本地失败不静默上传；敏感文档只走本地。

## read-article Phase 1 新流程

1. `deepxiv paper <id> --head` → `sources/<slug>.sections.json`（章节地图：名称/TLDR/token 数）
2. `deepxiv paper <id> --raw` → `sources/<slug>.md`（公式无损全文）
3. `doc_intake.py arxiv <id> --slug <slug> --root <repo> --assets-only`：source tarball、解压 `.tex`、原图提取转 WebP、extraction-log.md
4. deepxiv 失败降级：source+pandoc（保护公式）→ arXiv HTML → MinerU/Docling PDF → pdftotext -layout
5. 回源规则：deepxiv 是阅读入口非最终仲裁者；公式/数值冲突回 source 或 PDF 核查；图片仍以 source 原图为最高优先级；extraction-log 记录 deepxiv/source/HTML/PDF 各自状态与 arXiv 版本、获取时间。

## CI 解耦

`scripts/check-figure-whitespace.py` 目前动态导入 `scripts/convert-figures.py` 的 `crop_whitespace`。迁移前把 `crop_whitespace` 逻辑内联进 check 脚本，保证 GitHub Actions 不依赖用户主目录。

## 风险

| 风险 | 缓解 |
|---|---|
| MinerU 4.x 与旧 mineru-open-sdk 环境冲突 | uv tool 独立环境，不混入 ~/.venv |
| upstream 升级破坏适配器 | upstream.lock.json 固定 + 回归测试 + 失败回退 |
| deepxiv 单点故障 | 降级链 + extraction-log 记录 |
| 删除旧脚本后遗漏引用 | 全仓 rg 扫描 + check-skill-paths.py + npm test |
