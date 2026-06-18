---
name: no_shell_heredoc
description: Shell 校验命令不要使用多行 heredoc，避免被终端/工具链包装或转义破坏。
type: feedback
createdAt: 2026-06-08T17:00:16
---
执行 shell 校验、统计、grep 或构建辅助命令时，不要使用多行 heredoc。优先使用单行命令、`file_grep`、`read_lints`、`read_file`、已有构建命令，或用安全的一行 `node -e` / `python -c`。如果确实需要临时脚本，必须先说明原因，并避免用于文章正文/frontmatter 写入。

Why: 用户指出多次出现“校验命令因多行 heredoc 被终端包装破坏”，这类命令在 API/IDE/shell 包装链路中容易被换行、引号、终止符位置或转义破坏。

How to apply: 所有 shell 工具调用的 `command` 保持单行；不要写 `python <<'PY' ... PY`、`cat <<EOF ... EOF` 这类多行 heredoc。校验优先用精确 grep、lint、build 和短单行命令完成。
