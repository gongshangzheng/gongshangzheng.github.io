---
name: no_temp_python_for_article_edits
description: 修改博客/文章/frontmatter 时不要默认生成临时 Python 脚本批量写入，优先直接编辑文件。
type: feedback
createdAt: 2026-06-08T15:25:29
---
修改博客、文章、frontmatter、Hub 目录或 skill 文档时，不要默认生成临时 Python 脚本再通过脚本写入。优先使用直接文件编辑工具；只有在用户明确要求批处理、变更量极大且直接编辑不可控，或需要只读统计校验时，才考虑脚本，并先说明原因。

Why: 用户明确指出反复生成 Python 脚本写入很不符合预期；项目记忆里已有“直接编辑文章文件”的偏好，但执行时仍被忽略。

How to apply: 面对 HTML 博客、frontmatter、skill、memory 等文本修改任务时，先用 `file_replace` 或直接编辑目标文件；不要创建 `.aone_tmp_*.py` 这类临时写入脚本作为默认路径。