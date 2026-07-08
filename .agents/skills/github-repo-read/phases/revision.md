# Phase 10: Revision（修订与复核）

**目标**：根据 Phase 9 Review 的 `REVISE` / `REJECT` 结果回到对应阶段修正，并重新完成 fidelity review，确保没有未实现、简化实现、假设实现或未核实结论残留。

## 10.1 输入

Phase 10 只能由 Phase 9 触发，必须带着 Review 问题清单进入。每个问题都要包含：

| 字段 | 说明 |
|------|------|
| severity | `CRITICAL` / `P1` / `P2` |
| problem | 具体问题，不写泛泛描述 |
| evidence | 发现问题的文件、行号、构建日志或原始来源 |
| return_phase | 应回到哪个阶段修复 |
| expected_fix | 修复后应满足什么条件 |

## 10.2 问题到阶段的映射

| 问题类型 | 回到阶段 |
|----------|----------|
| repo 基础信息、分支、license、stars、维护状态错误 | Phase 1 `recon.md` |
| README/Wiki/docs 未读、事实误引、外部资料误写成 repo 事实 | Phase 2 `docs.md` |
| 图片缺失、远程图未本地化、图片路径错误、配图质量不够 | Phase 3 `images.md` |
| 入口文件、部署单元、依赖、C4 L1-L3 错误或缺失 | Phase 4 `code-map.md` |
| 主调用链、关键函数、核心算法、代码摘录证据不足 | Phase 5 `code-read.md` |
| 运行结果误称已验证、跳过理由不足、验证命令风险过高 | Phase 6 `verification.md` |
| 写作提纲缺项目定位、核心设计、风险、可迁移经验 | Phase 7 `outline.md` |
| HTML 结构、引用、图片、frontmatter、build 失败 | Phase 8 `blog.md` |
| Review 清单本身不完整、问题分级错误 | Phase 9 `review.md` |

## 10.3 修订规则

1. **先修 CRITICAL，再修 P1，最后修 P2**。
2. 每修一个问题，必须回到原始来源核对：README、Wiki、docs、源码、配置、LICENSE、官方模型页、论文正文、issue/PR 原文。
3. 修订不能只改正文措辞。如果问题来自信息收集不足，必须回到对应 phase 重新收集信息。
4. 如果原始来源无法支持某个结论，必须降级为“未核实”或删除该结论。
5. 如果 build、图片、引用或路径有问题，必须实际运行检查命令，不得只靠肉眼判断。
6. 如果是 blog 输出，修订后必须重新执行 HTML 质量校验和 `node build.js`。

## 10.4 Blog 修订硬校验

修订后的 HTML blog 必须通过以下检查：

```bash
PAGE="src/pages/<slug>.html"

# 1. 无 Markdown 标题和裸列表残留
grep -n '^###\|^- \|^[0-9]\. ' "$PAGE"

# 2. 无 photo 裸路径
awk '/<div class="photo">/{inphoto=1; img=0; start=NR} inphoto && /<img /{img=1} inphoto && /<\/div>/{if(!img) print "photo without img near line " start; inphoto=0}' "$PAGE"

# 3. 正文引用与 sources key 对应
grep -o '#[^#]*#' "$PAGE" | sort | uniq
grep -o 'data-cite-key="[^"]*"' "$PAGE" | sort | uniq

# 4. 构建
cd ~/gongshangzheng.github.io && node build.js
```

以上命令若有输出或失败，必须继续修订，不能进入完成状态。

## 10.5 输出

完成修订后，必须给出简短修订记录：

| severity | problem | fixed_in | verification |
|----------|---------|----------|--------------|
| CRITICAL/P1/P2 | 问题描述 | 修改位置 | 已执行的复核方式 |

---

## Gate 条件

完成 Phase 10 前必须满足：

1. **所有 CRITICAL 和 P1 已修复**；P2 已修复或明确说明不影响交付。
2. **每个修复都回到原始来源核对**，没有仅凭记忆或中间笔记修订。
3. **blog 输出已重新通过 HTML 质量校验和 build**。
4. **重新执行 Phase 9 Review 且结果为 PASS**。
5. **todo 状态**：Phase 10 标记为 `completed`，整体任务标记完成。

不满足？继续回到对应阶段修正，直到 Phase 9 PASS。