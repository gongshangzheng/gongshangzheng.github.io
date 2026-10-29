#!/usr/bin/env python3
"""校验 skill 交叉引用路径是否可解析，并检查工具 skill 目录的镜像形态。

检查一：引用路径（死路径）
背景：本机存在多棵 skill 树，引用必须指到 skill 真实所在的那棵树——
  · 库内：~/gongshangzheng.github.io/.agents/skills/<name>   （博客相关 skill 的家）
  · 全局：~/.agents/skills/<name>                              （跨项目工具 skill）
  · 其他 harness：~/.hanako/skills/<name>、~/.pi/agent/skills/<name> 等
判据 = 该 skill 的 SKILL.md 实际位于哪棵树。指错树就是死路径。

检查二：工具 skill 目录镜像（镜像违规）
`.agents/skills/` 是唯一真源。任何顶层 `<tool>/skills`（如 `.pi/skills/`）中与
`.agents/skills/` 同名的条目都必须是软链接，且落点为 `.agents/skills/<name>`；
同名实体副本会与真源内容分叉（实例：`.pi/skills/openspec-*` 曾是实体副本，
定制过的博客门禁只存在于 `.agents` 版本，且 pi 会对同名 skill 报 collision）。
整棵树就是别名的（如 `.claude -> .agents`）解析后等于 `.agents/skills`，直接放行；
工具独有的 skill（`.agents` 里没有同名）不在检查范围内。

用法：
  ~/.venv/bin/python3 scripts/check-skill-paths.py            # 列出每条问题
  ~/.venv/bin/python3 scripts/check-skill-paths.py --quiet    # 只输出汇总

退出码：0 = 死路径与镜像违规都为 0；1 = 任一非 0。
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
REPO_SKILLS = REPO_ROOT / ".agents" / "skills"
HOME = Path.home()

TEXT_SUFFIXES = {".md", ".py", ".js", ".ts", ".sh", ".json", ".yaml", ".yml", ".txt", ".html"}
EXCLUDED_DIRS = {"node_modules", ".git", "raw", "openspec", "public", "media", "__pycache__"}
# 扫描镜像树时跳过的顶层目录：真源自身不参与自检，其余是扫描时本就排除的目录
MIRROR_SKIPPED_TOP = {".agents", "node_modules", ".git", "raw", "public", "media", "__pycache__"}

# 库内锚定形式优先匹配（更长、更具体），其次是任意 ~/<tree>/skills/ 形式
REPO_PATTERN = re.compile(r"~/gongshangzheng\.github\.io/\.agents/skills/([A-Za-z0-9._-]+)")
TREE_PATTERN = re.compile(r"~/([A-Za-z0-9._/-]+)/skills/([A-Za-z0-9._-]+)")


def iter_files(root: Path):
    for path in root.rglob("*"):
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        if path.is_file() and path.suffix in TEXT_SUFFIXES:
            yield path


def is_placeholder(name: str) -> bool:
    """忽略 <name>、... 这类占位写法。"""
    return not any(c.isalnum() or c == "-" for c in name)


def scan():
    """返回 (文件, 行号, 匹配文本, 解析根, 目标名)。"""
    hits = []
    for path in iter_files(REPO_ROOT):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        rel = str(path.relative_to(REPO_ROOT))
        for lineno, line in enumerate(text.splitlines(), 1):
            for m in REPO_PATTERN.finditer(line):
                if not is_placeholder(m.group(1)):
                    hits.append((rel, lineno, m.group(0), REPO_SKILLS, m.group(1)))
            # 跳过已被库内模式覆盖的片段，避免重复计数
            rest = REPO_PATTERN.sub("", line)
            for m in TREE_PATTERN.finditer(rest):
                tree, name = m.group(1), m.group(2)
                if is_placeholder(name):
                    continue
                hits.append((rel, lineno, m.group(0), HOME / tree / "skills", name))
    return hits


def iter_mirror_trees():
    """返回工具 skill 目录列表（顶层含 skills/ 的目录，整树别名已排除）。"""
    agents_real = REPO_SKILLS.resolve()
    trees = []
    for entry in sorted(REPO_ROOT.iterdir()):
        if entry.name in MIRROR_SKIPPED_TOP or not entry.is_dir():
            continue
        skills_dir = entry / "skills"
        if not skills_dir.is_dir():
            continue
        if skills_dir.resolve() == agents_real:
            continue
        trees.append(skills_dir)
    return trees


def scan_mirrors():
    """返回 (镜像树列表, 同名条目数, 违规列表)。

    违规项：(镜像目录, skill 名, 期望软链接目标, 实际形态描述)。
    只检查与 `.agents/skills/` 重叠的名字——工具独有 skill 无从判断归属，不报错。
    """
    trees = iter_mirror_trees()
    overlap = 0
    violations = []
    for tree in trees:
        for entry in sorted(tree.iterdir()):
            name = entry.name
            source = REPO_SKILLS / name
            if not source.is_dir():
                continue
            overlap += 1
            expected = source.relative_to(REPO_ROOT)
            if not entry.is_symlink():
                violations.append((tree, name, expected, "实体目录"))
                continue
            if not entry.exists():
                violations.append((tree, name, expected, "软链接目标不存在"))
                continue
            if entry.resolve() != source.resolve():
                violations.append((tree, name, expected, f"软链接落点 {os.readlink(entry)}"))
    return trees, overlap, violations


def main() -> int:
    ap = argparse.ArgumentParser(description="校验 skill 路径引用与工具目录镜像")
    ap.add_argument("--quiet", action="store_true", help="只输出汇总")
    args = ap.parse_args()

    hits = scan()
    dead = [h for h in hits if not (h[3] / h[4]).is_dir()]
    trees, overlap, violations = scan_mirrors()

    if not args.quiet:
        print(f"扫描到 {len(hits)} 处 skill 路径引用，其中死路径 {len(dead)} 处")
        for rel, lineno, matched, base, name in dead:
            try:
                shown = "~/" + str(base.relative_to(HOME))
            except ValueError:
                shown = str(base)
            print(f"  ✗ {rel}:{lineno}  {matched}   →   {shown} 下无 {name}")

        shown_trees = "、".join(str(t.relative_to(REPO_ROOT)) for t in trees) or "无"
        print(f"镜像树 {len(trees)} 个（{shown_trees}），同名条目 {overlap} 个，违规 {len(violations)} 处")
        for tree, name, expected, actual in violations:
            print(f"  ✗ {tree.relative_to(REPO_ROOT)}/{name}  {actual}（应为 → {expected}）")

    print(f"死路径：{len(dead)} 处")
    print(f"镜像违规：{len(violations)} 处")
    return 1 if dead or violations else 0


if __name__ == "__main__":
    sys.exit(main())
