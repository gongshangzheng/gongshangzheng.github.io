# Phase 1: 仓库侦察（Repository Recon）

**目标**：获取仓库基础元信息，克隆代码，生成快速目录地图，建立项目定位。

## 1.1 获取基础信息

优先使用轻量命令，不要一开始打开浏览器。

```bash
REPO="owner/repo"
gh repo view "$REPO" --json name,owner,description,homepageUrl,url,defaultBranchRef,licenseInfo,stargazerCount,forkCount,createdAt,updatedAt,languages,repositoryTopics
```

如果 `gh` 不可用或未登录：

```bash
curl -L "https://api.github.com/repos/${REPO}"
```

需要记录：

| 字段 | 说明 |
|------|------|
| 一句话定位 | 这个项目是做什么的 |
| 作者/组织 | 谁在维护 |
| License | 开源协议 |
| Stars/Forks | 带时间语境，不要夸大 |
| 主要语言 | 代码组成 |
| 默认分支 | main / master / dev |
| Paper / Demo / Weights | 是否有论文、在线 demo、预训练权重 |

## 1.2 克隆仓库

```bash
REPO="owner/repo"
NAME="repo-name"
SRC="/tmp/${NAME}-src"
rm -rf "$SRC"
git clone --depth 1 "https://github.com/${REPO}.git" "$SRC"
cd "$SRC"
```

如果用户指定 tag/commit：

```bash
git fetch --depth 1 origin <ref>
git checkout <ref>
```

## 1.3 快速目录地图

```bash
cd "$SRC"
find . -maxdepth 3 -type f \
  ! -path './.git/*' \
  ! -path './node_modules/*' \
  ! -path './.venv/*' \
  | sed 's#^./##' | sort | head -300
```

重点寻找：

| 类型 | 文件/目录 |
|------|-----------|
| README | `README*`, `docs/`, `mkdocs.yml`, `docs/index.md` |
| 入口 | `main.py`, `app.py`, `cli.py`, `src/**/__main__.py`, `index.ts`, `server.ts` |
| 包配置 | `pyproject.toml`, `setup.py`, `package.json`, `Cargo.toml`, `go.mod` |
| 模型/算法 | `model/`, `models/`, `network/`, `modules/`, `architecture/` |
| 训练/推理 | `train*`, `trainer/`, `infer*`, `eval*`, `scripts/` |
| 数据 | `dataset/`, `data/`, `dataloader/`, `preprocess/` |
| 配置 | `configs/`, `config/`, `*.yaml`, `*.json` |
| 测试 | `tests/`, `test_*.py`, `*.spec.ts` |
| 图片资产 | `assets/`, `figures/`, `images/`, `docs/assets/`, `static/`, README 图片链接 |

## 1.4 大文件/目录排查

```bash
du -sh * .[^.]* 2>/dev/null | sort -h | tail
find . -type d \( -name node_modules -o -name .git -o -name .venv -o -name checkpoints -o -name weights \) -prune -print
```

---

## Gate 条件

进入 Phase 2 前必须满足：

1. **项目一句话定位**已记录
2. **目录地图**已生成并初步分类（入口、配置、核心模块、资产）
3. **todo 状态**：Phase 1 标记为 `completed`，Phase 2 标记为 `in_progress`

不满足？补齐后重新检查 Gate。
