---
name: Survey 必须显式 taxonomy
description: 写 survey 时必须显式区分任务 taxonomy 与技术路线 taxonomy，不能只罗列论文或方法。
type: feedback
createdAt: 2026-06-08T13:53:38
---
写 survey 时必须显式建立 taxonomy，尤其要区分任务 taxonomy 和技术路线 taxonomy。任务 taxonomy 说明问题类型和输入输出边界，例如 video dubbing、talking head、3D avatar、上半身交互体等；技术路线 taxonomy 说明中间表示和生成范式，例如 3D 绑定、lip sync、motion-space diffusion、基模/大模型路线等。

Why: 用户反馈数字人 survey 原稿没有做好 taxonomy，把 MuseTalk 的 video dubbing、talking head、SentiAvatar 的 3D 数字人，以及 Ditto/Live Avatar 等路线混在一起，导致 survey 只是论文罗列而不是领域结构化综述。

How to apply: 后续写任何 survey 或领域综述时，先给出任务分类，再给出技术路线分类；同一论文要明确它属于哪个任务、采用哪条路线、边界和不适用场景是什么。