#!/usr/bin/env python3
"""校验 skill 交叉引用路径是否可解析。

背景：本机存在多棵 skill 树，引用必须指到 skill 真实所在的那棵树——
  · 库内：~/gongshangzheng.github.io/.agents/skills/<name>   （博客相关 skill 的家）
  · 全局：~/.agents/skills/<name>                              （跨项目工具 skill）
  · 其他 harness：~/.hanako/skills/<name>、~/.pi/agent/skills/<name> 等
判据 = 该 skill 的 SKILL.md 实际位于哪棵树。指错树就是死路径。

用法：
  ~/.venv/bin/python3 scripts/check-skill-paths.py            # 列出每条死路径
  ~/.venv/bin/python3 scripts/check-skill-paths.py --quiet    # 只输出汇总

退出码：0 = 全部可解析；1 = 存在死路径。
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
REPO_SKILLS = REPO_ROOT / ".agents" / "skills"
HOME = Path.home()

TEXT_SUFFIXES = {".md", ".py", ".js", ".ts", ".sh", ".json", ".yaml", ".yml", ".txt", ".html"}
EXCLUDED_DIRS = {"node_modules", ".git", "raw", "openspec", "public", "media", "__pycache__"}

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


def main() -> int:
    ap = argparse.ArgumentParser(description="校验 skill 交叉引用路径")
    ap.add_argument("--quiet", action="store_true", help="只输出汇总")
    args = ap.parse_args()

    hits = scan()
    dead = [h for h in hits if not (h[3] / h[4]).is_dir()]

    if not args.quiet:
        print(f"扫描到 {len(hits)} 处 skill 路径引用，其中死路径 {len(dead)} 处")
        for rel, lineno, matched, base, name in dead:
            try:
                shown = "~/" + str(base.relative_to(HOME))
            except ValueError:
                shown = str(base)
            print(f"  ✗ {rel}:{lineno}  {matched}   →   {shown} 下无 {name}")

    print(f"死路径：{len(dead)} 处")
    return 1 if dead else 0


if __name__ == "__main__":
    sys.exit(main())
