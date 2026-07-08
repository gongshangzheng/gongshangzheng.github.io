---
name: read-article-code-analysis
description: Phase 5e 代码分析 subagent 模板
trigger: read-article Phase 5e 代码分析
---

# Phase 5e · 代码分析 subagent

## 任务

对论文的 GitHub 代码仓库进行结构化分析，输出代码分析章节 Markdown。参照 org-roam ar 模板的代码分析结构。

## 输入

- 论文标题：<title>
- 代码仓库：<repo-url> 或本地路径
- 综合材料：见 ~/gongshangzheng.github.io/raw/<slug>/synthesis.md
- 术语表：见 ~/gongshangzheng.github.io/raw/<slug>/subagents/terminology.md

## 前置阶段：依赖安装与 smoke test

进入代码分析前，必须先处理依赖，避免 import 报错、调用链误判或假读源码。

1. 读取仓库依赖入口：`pyproject.toml`、`setup.py`、`requirements.txt`、`environment.yml`、`package.json`、`go.mod`、`Dockerfile`、`Makefile` 等。
2. 在隔离环境中安装与阅读目标相关的最小依赖集。Python 项目优先使用仓库声明的方式，例如 `uv pip install -e ".[extra]"`、`pip install -e .`、`pip install -r requirements.txt` 或 conda env；不得把包安装进未知 Python 环境。
3. 安装前评估 GPU/CUDA、大模型权重、外部 API key、系统 C 库和依赖体积。成本过高或本机不满足时可以跳过，但必须写明跳过原因和未验证边界。
4. 安装后执行轻量 smoke test：包导入检查、关键入口 `--help`、配置加载检查；多语言仓库要分别检查前端/后端/Go/Python 侧依赖入口。
5. 如果 smoke test 失败，先定位依赖、平台、密钥或系统库问题，不得把错误写成源码设计结论。最终文章必须交代失败原因和可行修复路径。
6. 未实际打开并阅读的源码、未安装成功或未通过 smoke test 的运行链路，不得写成“已验证实现”。

## 分析维度

### 0. 仓库定位与阅读状态
- 仓库名称、URL、commit hash
- 是否 official implementation
- 语言/框架
- 阅读状态（shallow read / deep read）

### 1. 代码组织总览
- 顶层目录结构（tree 输出）
- 模块职责划分（每个目录/文件的作用）
- 依赖关系与分层（哪些是核心、哪些是工具、哪些是配置）

### 2. 运行入口与调用链
- 安装与环境入口（requirements.txt、conda env、docker）
- 训练入口（train.py 等，主调用链路）
- 推理/Demo 入口
- 评估入口
- 主调用链路（从入口到核心模型的数据流）

### 3. 核心代码路径
- 模型/方法主体实现（哪个文件、哪些类/函数）
- 数据读取与预处理
- Loss/Objective 实现
- 训练循环与优化逻辑
- 推理流程与后处理
- 配置系统与超参数（yaml/json/argparse）

### 4. 论文方法与代码对应关系
- 论文模块 → 代码文件映射表
- 关键公式/算法 → 具体函数
- 论文未明说但代码体现的实现细节

### 5. 核心代码解读
- 关键类与函数签名
- 关键代码片段（标注文件路径和行号）
- 数据结构与张量 shape
- 工程技巧与隐藏假设

### 6. 可复现性与工程质量
- 依赖与环境（版本锁定、兼容性）
- checkpoint / 权重 / 数据路径
- 运行成本与硬件要求
- 代码完整性与潜在坑

### 7. GitHub 图片与辅助材料
- README 中的图片
- docs/、assets/、figures/、images/ 中的图
- 需要下载到博客的图

### 8. 总结：代码给论文理解带来的增量
- 论文里没写但代码里有的关键信息
- 代码阅读后对方法理解的修正或加深

## 输出格式（Markdown）

按上述 0-8 小节组织。每个小节有具体内容，不是占位符。

## 强制要求

- 代码路径引用格式：`path/to/file.py:line_number`
- 张量 shape 用 `(B, C, H, W)` 格式
- 配置文件中的具体超参数必须列出
- 只做调研，不修改任何文件
