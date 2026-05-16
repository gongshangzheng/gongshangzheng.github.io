---
title: 科研大佬开源工作流调研报告
description: 科研大佬开源工作流调研
date: 2026-04-22
tags: [科研, 工作流, 开源]
categories: [方法论]
page_style: |
  .hero { height: 55vh; }
hero_title: "🧑‍🔬 谁开源了他们的科研工作流？"
hero_sub: 一份关于科研大佬们工具链与工作方法的调研总结
hero_tagline: ""
---

<!-- 概述 -->
<h2>📋 概述</h2>
<p>
科研工作流程的开源远不如代码开源常见。但有一小群富有影响力的研究者，在工具链和方法论上都做了充分的公开分享。
本报告整理了五位代表人物的工作流——从 Karpathy 的 AI 驱动知识库到 Carl Boettiger 的开放笔记本，
涵盖了 <strong>论文阅读 → 笔记管理 → 实验记录 → 知识积累</strong> 的全链路。
</p>

<div class="info-box">
  <strong>核心发现</strong>：完整开源科研工作流的大佬不多，但每个都很有启发性。2024–2025 年最大变化是 AI Agent 开始介入工作流，
  从"工具辅助"转向"AI 全程维护"。
</div>

<!-- 通用模式 -->
<h2>🔍 通用模式</h2>
<p>不论工具是 Obsidian、Org-mode 还是 GitHub，这些工作流共享以下核心特征：</p>

<ol>
  <li><strong>原子化笔记</strong> — 将知识拆解为独立、可链接的基本单元</li>
  <li><strong>双向链接</strong> — 在笔记之间建立关联，形成知识网络</li>
  <li><strong>增量积累</strong> — 知识随时间演化，而非一次性整理</li>
  <li><strong>开放透明</strong> — "Garage door up"，工作过程公开可见</li>
  <li><strong>极简工具链</strong> — 减少切换成本</li>
  <li><strong>自动化维护</strong> — 让自动化处理书签工作，人类专注于思考</li>
</ol>

<hr class="divider">

<!-- 1. Karpathy -->
<h2>1️⃣ Andrej Karpathy — LLM Wiki + AutoResearch</h2>

<div class="profile">
  <div class="tags"><span class="tag">OpenAI 联合创始人</span><span class="tag">前 Tesla AI 总监</span><span class="tag">Eureka Labs</span></div>
  <div class="role">AI 研究者 · 教育家</div>
</div>

<p><strong>核心理念</strong>：让 LLM 作为知识库的 <em>维护者</em>，而不是查询工具。人类做思考，LLM 做 bookkeeping。</p>

<h3>架构三要素</h3>
<table>
  <tr><th>层</th><th>作用</th><th>谁操作</th></tr>
  <tr><td><strong>raw/</strong></td><td>原始文档（论文、文章、图片），不可变</td><td>你（只读）</td></tr>
  <tr><td><strong>wiki/</strong></td><td>LLM 生成和维护的 Markdown 文件（实体页、概念页、源文档摘要页）</td><td>LLM（完全掌控读写）</td></tr>
  <tr><td><strong>CLAUDE.md</strong></td><td>Schema 指令文件，规定结构、约定、工作流</td><td>你和 LLM 共建</td></tr>
</table>

<h3>三个核心操作</h3>
<ul>
  <li><strong>Ingest</strong>：丢进新文档 → LLM 读取并讨论 → 写摘要、更新 index、更新相关实体页（一篇源文档可能涉及 10–15 个页面的更新）</li>
  <li><strong>Query</strong>：提问 → LLM 读 index.md → 深入相关页面 → 综合答案 + 引用 → 有价值的结果写回 Wiki</li>
  <li><strong>Lint</strong>：定期健康检查（矛盾检测、过时内容、孤儿页面、缺失交叉引用）</li>
</ul>

<h3>与 RAG 的对比</h3>
<div class="table-wrap">
<table>
  <tr><th>维度</th><th>RAG</th><th>LLM Wiki</th></tr>
  <tr><td>数据处理</td><td>切块 + 向量嵌入 + 向量数据库</td><td>Markdown 文件 + LLM 直接阅读</td></tr>
  <tr><td>检索方式</td><td>相似性搜索</td><td>LLM 内生理解 + 结构化索引</td></tr>
  <tr><td>可追溯性</td><td>黑箱</td><td>每条声明可追溯到 .md 文件</td></tr>
  <tr><td>维护成本</td><td>需向量数据库和嵌入服务</td><td>只需要文件系统</td></tr>
  <tr><td>知识积累</td><td>每次从零发现</td><td>增量编译，持续保持最新</td></tr>
</table>
</div>

<h3>AutoResearch — 科研实验自动化 Agent</h3>
<p>630 行 Python 代码，运行 ML 实验的"Ratchet Loop"——自动循环执行实验、评估结果、只保留有效的变更。</p>
<p>项目地址：<a href="https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f">Karpathy's Gist</a></p>

<hr class="divider">

<!-- 2. Andy Matuschak -->
<h2>2️⃣ Andy Matuschak — Evergreen Notes</h2>

<div class="profile">
  <div class="tags"><span class="tag">前 Apple</span><span class="tag">Khan Academy</span><span class="tag">独立研究员</span></div>
  <div class="role">UI 设计师 · 认知科学研究员</div>
</div>

<p><strong>核心理念</strong>：笔记是思考环境（Thinking Environment），而不是记录工具。"Work with the garage door up"——公开分享自己的工作过程。</p>

<p>Andy 的 <a href="https://notes.andymatuschak.org/About_these_notes">Working Notes</a> 是数千条完全公开的常青笔记，作为他个人思考的实验场。</p>

<h3>笔记分类</h3>
<ul>
  <li><strong>Source Notes</strong> — 源文档笔记，记录阅读的原始内容</li>
  <li><strong>Concept Notes</strong> — 概念笔记，连接源笔记之间的思想</li>
  <li><strong>Project Notes</strong> — 项目笔记，跟踪跨文档的大想法</li>
</ul>

<h3>关键原则</h3>
<ul>
  <li>常青笔记是知识的基本单位，应随时间演化、积累</li>
  <li>写笔记是为自己而非听众</li>
  <li>写作是思考的工具而非产品的副产品</li>
  <li>工作方法本身也是研究对象</li>
</ul>

<hr class="divider">

<!-- 3. Carl Boettiger -->
<h2>3️⃣ Carl Boettiger — Open Lab Notebook</h2>

<div class="profile">
  <div class="tags"><span class="tag">UC Berkeley 教授</span><span class="tag">生态学</span><span class="tag">开源科学先驱</span></div>
  <div class="role">生态与进化生物学家</div>
</div>

<p><strong>核心理念</strong>：从 2010 年开始实时公开所有科研活动——包括失败的实验、代码、数据。这不仅是"开放"，更是一种工作方法。</p>

<h3>技术栈</h3>
<table>
  <tr><th>组件</th><th>用途</th></tr>
  <tr><td>GitHub 仓库</td><td>项目管理、版本控制、问题追踪（一个项目一个仓库）</td></tr>
  <tr><td>knitr / Rmarkdown</td><td>代码 + 分析 + 图表 + 文字一体式写作</td></tr>
  <tr><td>Jekyll 博客</td><td>时间线浏览、标签检索、RSS 订阅</td></tr>
  <tr><td>R 包结构</td><td>研究项目管理框架（数据、文档、源码规范化）</td></tr>
</table>

<h3>独特创新</h3>
<ul>
  <li>"Integrated Lab Notebook" — 代码、数据、文字不分离</li>
  <li>用 Issue Tracker 作为 TODO List</li>
  <li>commit log 自动追加到对应笔记</li>
  <li>不公开的例外：仅应合作者要求延迟发布特定实验</li>
</ul>

<p>成果：6 个项目从构思到发表，1 个 null result 公开存档，多次被合作者和审稿人引用工作流细节。</p>

<hr class="divider">

<!-- 4. Katherine Hayes -->
<h2>4️⃣ Katherine Hayes — Modified Zettelkasten + Obsidian</h2>

<div class="profile">
  <div class="tags"><span class="tag">PhD 学生</span><span class="tag">生态学</span><span class="tag">U of Alberta</span></div>
  <div class="role">研究生 · 方法论达人</div>
</div>

<p><strong>核心理念</strong>："尽可能自动化书签工作，cut down on the busy work"——追求过程而非结果，每天以某种形式写作。</p>

<h3>工具链</h3>
<ul>
  <li><strong>Obsidian</strong> — 笔记主阵地，三级笔记（Reference / Concept / Project）</li>
  <li><strong>Zotero</strong> + Chrome 扩展 — 文献保存与整理</li>
  <li><strong>Better BibTeX</strong> — 生成 citekey 连接 Zotero 和 Obsidian</li>
  <li><strong>Obsidian Citations 插件</strong> — 连接笔记到 Zotero 条目</li>
  <li><strong>Hazel</strong> — 自动根据标签分类文件</li>
</ul>

<p>可贵的诚实："很多笔记处于未完成状态"——这才是真实的科研状态。</p>

<hr class="divider">

<!-- 5. Others -->
<h2>5️⃣ 其他值得关注的实践者</h2>

<h3>Cameron Neylon — Science in the Open</h3>
<p>生物物理学家，"LaBLog"方法：一个 Blog 条目对应一个研究物件（实验、想法、阅读）。强调失败也公开——让科学过程透明。</p>

<h3>Awesome PKM for Academics</h3>
<p>GitHub 上的资源集合，收录了数十个针对学术研究者的 PKM 工作流，涵盖了 Obsidian/Logseq 开箱即用 Vault、Zotero 集成、YouTube 教程等。<br>
<a href="https://github.com/cecibaldoni/awesome-PKM-for-academics">github.com/cecibaldoni/awesome-PKM-for-academics</a></p>

<hr class="divider">

<!-- 对比总结 -->
<h2>📊 对比总结</h2>

<div class="table-wrap">
<table>
  <tr>
    <th>人物</th>
    <th>核心工具</th>
    <th>工作流类型</th>
    <th>自动化程度</th>
    <th>开放程度</th>
  </tr>
  <tr>
    <td>Karpathy</td>
    <td>Claude Code + Markdown</td>
    <td>AI 驱动知识库</td>
    <td>极高（LLM 全程维护）</td>
    <td>Gist / 博客</td>
  </tr>
  <tr>
    <td>Matuschak</td>
    <td>Custom system</td>
    <td>常青笔记思考环境</td>
    <td>低（手动写作）</td>
    <td>完全公开</td>
  </tr>
  <tr>
    <td>Boettiger</td>
    <td>GitHub + knitr + Jekyll</td>
    <td>开放笔记本科学</td>
    <td>中（自动签到/commit）</td>
    <td>完全实时公开</td>
  </tr>
  <tr>
    <td>Hayes</td>
    <td>Obsidian + Zotero</td>
    <td>Modified Zettelkasten</td>
    <td>中（自动化归类）</td>
    <td>博客 + 社区分享</td>
  </tr>
</table>
</div>

<!-- 结论 -->
<h2>💡 核心洞察</h2>

<div class="summary">
  <ol>
    <li><strong>方法论 > 工具</strong> — 原子化笔记、双向链接、增量积累是所有方案的核心</li>
    <li><strong>AI 开始接管书签</strong> — Karpathy 的"LLM 做 bookkeeping，人类做思考"可能是未来方向</li>
    <li><strong>开放是杠杆</strong> — Carl Boettiger 发现开源笔记可以帮 reviewer 审稿、吸引合作机会</li>
    <li><strong>不完美才是常态</strong> — 所有大佬的工作流都有未完成的部分，追求"足够好"而非"完美"</li>
    <li><strong>两条路径</strong> — 极简主义（Markdown + LLM）vs 结构化集成（Obsidian + Zotero + GitHub）</li>
  </ol>
</div>

<!-- 参考 -->
<h2>🔗 参考链接</h2>
<ul>
  <li><a href="https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f">Karpathy's LLM Wiki Gist</a></li>
  <li><a href="https://notes.andymatuschak.org/About_these_notes">Andy Matuschak's Working Notes</a></li>
  <li><a href="https://www.carlboettiger.info/2012/09/28/Welcome-to-my-lab-notebook.html">Carl Boettiger's Open Lab Notebook</a></li>
  <li><a href="https://krhayes.com/posts/draft_researchworkflow/">Katherine Hayes' Research Workflow</a></li>
  <li><a href="https://github.com/cecibaldoni/awesome-PKM-for-academics">awesome-PKM-for-academics</a></li>
  <li><a href="https://cameronneylon.net/tag/lablog/">Cameron Neylon - Science in the Open</a></li>
</ul>
