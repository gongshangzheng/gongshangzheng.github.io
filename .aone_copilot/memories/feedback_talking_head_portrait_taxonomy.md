---
name: Talking head 与 portrait animation 不作为硬分类
description: 数字人 taxonomy 中不要把 talking head 和 portrait animation 当作本质不同任务，应按驱动条件和运动来源区分。
type: feedback
createdAt: 2026-06-09T15:33:09
---
数字人 taxonomy 中不要把 `talking head` 和 `portrait animation` 当作并列硬分类；二者输出空间高度重合，更像不同论文社区和输入条件下的命名习惯。

Why: 用户指出 portrait animation 和 talking head 好像没有本质区别。更稳定的区分方式是看驱动条件、运动来源、底层表示和渲染器，而不是论文标题里的任务名。

How to apply: 写数字人、talking head、portrait animation、audio-driven avatar 相关 survey 或 brainstorm 时，横轴优先按“已有视频 + 新音频 / 参考图像 + 音频 / 参考图像 + 驱动视频 / 注册资产 + 实时控制信号 / 文本语义 + 音频”等驱动条件划分；`talking head` 和 `portrait animation` 可作为命名或覆盖范围说明，不要作为 taxonomy 的本质边界。