# Phase 9: Review 清单

**目标**：对最终产出进行质量审查，给出 `PASS / REVISE / REJECT` 判定，并确保没有未实现、简化实现、假设实现或未核实结论残留。

## 9.1 Fidelity（忠实度）

| 检查项 | 通过标准 | 失败级别 |
|--------|----------|----------|
| repo URL、branch/commit 正确 | 输出中记录的 repo/ref 与实际读取的一致 | CRITICAL |
| README/Wiki/docs 事实没有篡改 | 项目定位、功能、安装方式、限制与原文一致 | CRITICAL |
| 代码判断有文件路径证据 | 每个“源码实现了 X”都有文件路径、类/函数或配置项支撑 | CRITICAL |
| 外部资料没有误写成 repo 内事实 | `[external]` 和 `[inference]` 没被包装成作者明示设计 | CRITICAL |
| 未读到的模块没有强行下结论 | 未核实内容明确标注“未核实”或不写 | P1 |
| License / 商用风险核对 | LICENSE 文件或 repo 元信息已核对，协议风险表述不夸大也不淡化 | CRITICAL |
| 性能、硬件、benchmark 数字核对 | 所有数字回到 README、论文、官方模型页或代码日志示例 | CRITICAL |

## 9.2 Completeness（完整性）

| 检查项 | 通过标准 | 失败级别 |
|--------|----------|----------|
| README/docs/Wiki 已读 | README 完整读取；Wiki 已检查；docs/examples 已扫描 | CRITICAL |
| package/config 已读 | 依赖、入口、环境变量、硬件/API key 要求已提取 | P1 |
| 入口文件已定位 | CLI/Web/训练/推理入口至少按项目类型定位一类 | P1 |
| C4 L1-L3 已完成 | 系统定位、运行单元、核心模块职责已梳理 | P1 |
| 主调用链已提取 | 至少一条从用户入口到核心实现的调用链 | P1 |
| 关键源码深读已完成 | 3-6 个关键设计点，每个有源码证据 | P1 |
| 核心代码已插入正文 | 关键函数、类、配置或算法实现已用代码框直接展示，并标注文件路径和函数/类名；不能只给路径或文字概括 | P1 |
| 图片资产已收集并本地化 | 用户图片优先；GitHub/官方图已本地化；无远程正文图 | P1 |
| 局限和风险已说明 | 复现成本、依赖、硬件、协议、维护状态至少覆盖适用项 | P1 |
| 命令参数已解释 | 安装、训练、推理、评估、部署、启动或 API 调用等关键命令后，有参数用途、输入输出、替换建议和配置配对关系说明 | P1 |
| 可迁移经验已提炼 | 不只复述实现，还说明哪些工程模式可复用 | P2 |

## 9.3 HTML / Image / Citation（仅 blog / blog-multi）

| 检查项 | 验证方式 | 失败级别 |
|--------|----------|----------|
| 已读取 `html-blog` skill | 会话或记录中明确已读 | CRITICAL |
| 需要时已读取 `blog-syntax` reference | Mermaid、图片、数学、引用、组件使用前已读对应 reference | P1 |
| frontmatter 完整 | title、date/updated_at、tags、categories、subcategory、description 合法 | CRITICAL |
| 写作模型来自 templates | blog/blog-multi 产出基于 `assets/source-analysis-*.html`，phase 文件未内联大段写作模型 | P1 |
| 模板变量无残留 | 最终 `src/pages/*.html` 中无 `REPLACE_` 模板变量 | CRITICAL |
| 章节结构符合 html-blog | `.ch` + `.ch-title`；二级标题 `<h3 class="section-title">`；三级标题 `<h4 class="ch-section">` | CRITICAL |
| 无 Markdown 残留 | grep 无 `###`、裸 `- `、裸 `1. ` 等正文 Markdown 残留 | CRITICAL |
| 图片路径真实存在 | HTML 使用 `media/images/<slug>/<file>`，文件在站点目录存在 | CRITICAL |
| `.photo` 结构完整 | 每个 `.photo` 内有 `<img>` 和 `.cap`，没有裸路径 | CRITICAL |
| 无远程正文图片 | 正文图不直接引用远程 URL | P1 |
| sources 引用闭合 | 正文 `#key#` 与 `.sources li data-cite-key` 一一对应 | CRITICAL |
| 重要事实句有引用 | 项目定位、架构、性能、协议、模型权重等事实句有 `#key#` | P1 |
| 构建通过 | `cd ~/gongshangzheng.github.io && node build.js` 成功 | CRITICAL |

## 9.4 Blog 硬校验命令

```bash
PAGE="src/pages/<slug>.html"

# Markdown 标题 / 裸列表残留；有输出即失败
grep -n '^###\|^- \|^[0-9]\. ' "$PAGE"

# 模板变量残留；有输出即失败
grep -n 'REPLACE_' "$PAGE"

# photo 裸路径；有输出即失败
awk '/<div class="photo">/{inphoto=1; img=0; start=NR} inphoto && /<img /{img=1} inphoto && /<\/div>/{if(!img) print "photo without img near line " start; inphoto=0}' "$PAGE"

# 正文引用 key 与 sources key；两组 key 必须一一对应
grep -o '#[^#]*#' "$PAGE" | sed 's/^#//; s/#$//' | sort | uniq
grep -o 'data-cite-key="[^"]*"' "$PAGE" | sed 's/data-cite-key="//; s/"//' | sort | uniq

# 构建
cd ~/gongshangzheng.github.io && node build.js
```

## 9.5 Review 判定

| 判定 | 条件 | 处理 |
|------|------|------|
| **PASS** | 无 CRITICAL；无未解决 P1；构建或对应验证通过 | 标记完成 |
| **REVISE** | 存在 P1/P2，或内容质量不足但核心事实正确 | 进入 Phase 10，按问题映射回对应 Phase 修正后重新 Review |
| **REJECT** | 存在 CRITICAL：核心事实错误、未读 README/docs、未读源码却声称实现、引用/图片/build 失败 | 回到 Phase 2 或更早阶段重做，再重新 Review |

## 9.6 Review 输出格式

```text
Decision: PASS / REVISE / REJECT

Findings:
- [CRITICAL/P1/P2] 问题：...
  Evidence: 文件/来源/命令输出
  Return phase: Phase X
  Expected fix: ...

Verification:
- 已执行的核验命令或人工回源核对项
```

---

## Gate 条件

完成 Phase 9 前必须满足：

1. **已逐项执行 Fidelity、Completeness、HTML/Image/Citation 检查**。
2. **所有 CRITICAL 都已修复**；否则判定 `REJECT`。
3. **所有 P1 都已修复**；否则判定 `REVISE`。
4. **blog / blog-multi 已执行硬校验命令和 build**。
5. **输出明确 Review 判定**；若不是 `PASS`，必须进入 Phase 10。

不满足？不得结束任务。
