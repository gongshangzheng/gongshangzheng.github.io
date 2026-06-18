---
name: skill_template_updates
description: 修改 skill 用例或写作模式时，优先更新 skill 自带模板与说明，而不是只改仓库示例页
type: feedback
createdAt: 2026-06-03T11:55:28
---
修改 skill 用例、写作模式或 agent 学习材料时，优先更新对应 skill 自带的模板和说明文件；仓库中的示例页只能作为补充验证，不应作为唯一更新目标。

Why: 用户指出 `/html-blog` skill 里给出的模板才是后续 agent 实际会用的来源，只更新仓库示例页不足以让 agents 学会用例。

How to apply: 遇到“更新 skills / 让 agents 学会 / 模板用例 / 写作模型”这类请求时，先定位 skill 的 `SKILL.md`、`templates/`、`references/` 等真实入口并同步修改；写作模型必须放在 `templates/` 下，且模板格式要符合对应语法规范（例如博客模板必须符合 `blog-syntax` / `html-blog`）；如果同一 skill 存在多份安装目录，应尽量保持有效入口一致。