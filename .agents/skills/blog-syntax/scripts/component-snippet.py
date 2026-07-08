#!/usr/bin/env python3
"""
component-snippet.py — 博客组件模板速查工具。

写文章时，不需要读 790 行 html-components.md，
直接运行此脚本获取正确组件模板：

    ~/.venv/bin/python3 scripts/component-snippet.py photo
    ~/.venv/bin/python3 scripts/component-snippet.py def-box
    ~/.venv/bin/python3 scripts/component-snippet.py admonition tip
    ~/.venv/bin/python3 scripts/component-snippet.py --list

模板中的占位符用 {{...}} 标记，替换为实际内容即可。
"""

import sys

SNIPPETS = {
    # ── 布局组件 ──
    'stats': '''<div class="stats">
  <div class="stat"><span class="num">{{数字}}</span><span class="label">{{标签}}</span></div>
  <div class="stat"><span class="num b">{{数字}}</span><span class="label g">{{标签}}</span></div>
</div>''',

    'ch': '''<div class="ch fade-in">
  <div class="ch-label">Part {{N}}</div>
  <div class="ch-title">{{章节标题}}</div>

  <h3 class="section-title">{{N}}.1 {{小节标题}}</h3>
  <p>{{正文内容}}</p>
</div>''',

    'section': '''<div class="section fade-in">
  <div class="section-title">{{标题}}</div>
  <p>{{正文内容}}</p>
</div>''',

    # ── 知识框（5 种，各有定位）──
    'def-box': '''<div class="def-box">
  <h3>{{定义标题}}</h3>
  <p>{{给出概念、符号和最小必要解释}}</p>
</div>
<!-- 适用：定义、符号约定、直觉解释 -->''',

    'info-box': '''<div class="info-box">
  <h3>{{标题}}</h3>
  <p>{{背景说明、补充信息、复习速查}}</p>
</div>
<!-- 适用：前置知识回顾、补充说明、阅读建议 -->''',

    'theorem-box': '''<div class="theorem-box">
  <h3>{{定理 / 命题 / 推论}}</h3>
  <p>{{写正式结论，必要时配条件与结论列表}}</p>
</div>
<!-- 适用：定理、命题、推论、判定条件 -->''',

    'example-box': '''<div class="example-box">
  <h3>{{例题标题}}</h3>
  <p><strong>题目：</strong>{{题目内容}}</p>
  <ol>
    <li><strong>第一步：</strong>{{步骤}}</li>
    <li><strong>第二步：</strong>{{步骤}}</li>
  </ol>
  <p><strong>答案：</strong>{{答案}}</p>
  <div class="callout"><strong>易错点</strong>：{{易错点}}</div>
</div>
<!-- 适用：例题、计算示范、实验流程、算法步骤 -->''',

    'review-box': '''<div class="review-box">
  <h3>复习速查</h3>
  <ul>
    <li><strong>{{要点1}}</strong>：{{说明}}</li>
    <li><strong>{{要点2}}</strong>：{{说明}}</li>
  </ul>
</div>
<!-- 适用：章节末尾的快速回顾 -->''',

    # ── 提示与强调 ──
    'callout': '''<div class="callout"><strong>{{要点标签}}</strong>：{{一句话内容}}</div>
<!-- 适用：一句话总结、易错点、提醒、限制条件 -->''',

    'admonition': '''<div class="admonition {type}">
  <div class="admonition-title">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">{icon}</svg>
    {title}
  </div>
  <div class="admonition-content"><p>{content}</p></div>
</div>
<!-- 类型: note(蓝)/tip(金)/warning(橙)/danger(红)/info(蓝)/success(绿) -->''',

    # ── 图片（最高频出错）──
    'photo': '''<div class="photo">
  <img src="media/images/{{slug}}/{{name}}.webp" alt="{{图片描述}}" loading="lazy">
  <div class="cap">图 {{N}}：{{说明文字}}（来源：{{来源}}）</div>
</div>
<!-- 禁止: <figure>/<figcaption>、.png/.jpg、/media前导斜杠、hotlink -->''',

    # ── 数据对比 ──
    'table': '''<div class="table-wrap">
  <table>
    <thead><tr><th>{{表头1}}</th><th>{{表头2}}</th></tr></thead>
    <tbody>
      <tr><td>{{单元格}}</td><td>{{单元格}}</td></tr>
    </tbody>
  </table>
</div>
<p><em>表 {{N}}：{{表格说明}}。</em></p>''',

    'table-wide': '''<div class="table-wrap wide">
  <table>
    <thead><tr><th>{{表头1}}</th><th>{{表头2}}</th><th>{{表头3}}</th></tr></thead>
    <tbody>
      <tr><td>{{内容}}</td><td>{{内容}}</td><td>{{内容}}</td></tr>
    </tbody>
  </table>
</div>
<p><em>表 {{N}}：{{表格说明}}。</em></p>''',

    # ── 流程图 ──
    'mermaid': '''{{< mermaid >}}
flowchart TD
    A[{{开始}}] --> B{{{判断}}}
    B -->|是| C[{{执行}}]
    B -->|否| D[{{结束}}]
{{< /mermaid >}}''',

    # ── 参考文献 ──
    'sources': '''<div class="sources">
  <h3>参考来源</h3>
  <ul>
    <li data-cite-key="{{Author-et-al.-Year}}">
      {{Author, A. et al. (Year). 标题.}} <em>{{会议/期刊}}</em>.
      <a href="{{url}}" target="_blank">{{链接文字}}</a>
    </li>
  </ul>
</div>''',

    # ── 其他组件 ──
    'timeline': '''<div class="timeline">
  <div class="timeline-item">
    <div class="year">{{年份}}</div>
    <div class="event">{{事件描述}}</div>
  </div>
</div>''',

    'quote': '''<div class="quote">
  <p>「{{引文内容}}」</p>
  <div class="who">——{{出处}}</div>
</div>''',

    'tags': '''<div class="tags">
  <span class="tag">{{标签1}}</span>
  <span class="tag">{{标签2}}</span>
</div>''',

    'chapter-nav': '''<div class="chapter-nav">
  <a class="nav-card nav-prev" href="{{prev}}.html">
    <span class="nav-arrow">←</span>
    <span class="nav-label">上一章</span>
    <span class="nav-title">{{上一章标题}}</span>
  </a>
  <a class="nav-card nav-hub" href="{{hub}}.html">
    <span class="nav-label">枢纽页</span>
    <span class="nav-title">{{枢纽页标题}}</span>
  </a>
  <a class="nav-card nav-next" href="{{next}}.html">
    <span class="nav-arrow">→</span>
    <span class="nav-label">下一章</span>
    <span class="nav-title">{{下一章标题}}</span>
  </a>
</div>''',

    'code-tabs': '''<div class="code-tabs">
  <div class="code-tabs-header">
    <button class="code-tab-btn active" data-tab="{{tab1}}">{{标签1}}</button>
    <button class="code-tab-btn" data-tab="{{tab2}}">{{标签2}}</button>
  </div>
  <div class="code-tab-content active" data-panel="{{tab1}}">
    <pre><code class="language-python">{{代码1}}</code></pre>
  </div>
  <div class="code-tab-content" data-panel="{{tab2}}">
    <pre><code class="language-cpp">{{代码2}}</code></pre>
  </div>
</div>''',

    'details': '''{{< details summary="{{标题}}" >}}
{{内容}}
{{< /details >}}''',
}

# Admonition SVG icons
ADMONITION_ICONS = {
    'note': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'tip': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    'warning': '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'danger': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'success': '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
}


def print_snippet(name, *extra):
    name = name.lower().strip()

    if name == '--list' or name == '-l':
        print('可用组件模板：\n')
        categories = {
            '布局': ['stats', 'ch', 'section'],
            '知识框': ['def-box', 'info-box', 'theorem-box', 'example-box', 'review-box'],
            '提示强调': ['callout', 'admonition'],
            '图片': ['photo'],
            '数据': ['table', 'table-wide'],
            '图表': ['mermaid'],
            '参考': ['sources'],
            '其他': ['timeline', 'quote', 'tags', 'chapter-nav', 'code-tabs', 'details'],
        }
        for cat, items in categories.items():
            print(f'  {cat}: {", ".join(items)}')
        print(f'\n用法: ~/.venv/bin/python3 scripts/component-snippet.py <组件名>')
        print(f'示例: ~/.venv/bin/python3 scripts/component-snippet.py photo')
        print(f'      ~/.venv/bin/python3 scripts/component-snippet.py admonition tip')
        return

    if name not in SNIPPETS:
        print(f'错误: 未知组件 "{name}"')
        print(f'运行 --list 查看可用组件')
        sys.exit(1)

    snippet = SNIPPETS[name]

    # Handle admonition type
    if name == 'admonition' and extra:
        adm_type = extra[0].lower()
        if adm_type not in ADMONITION_ICONS:
            print(f'错误: 未知 admonition 类型 "{adm_type}"')
            print(f'可用类型: {", ".join(ADMONITION_ICONS.keys())}')
            sys.exit(1)
        snippet = snippet.replace('{type}', adm_type)
        snippet = snippet.replace('{icon}', ADMONITION_ICONS[adm_type])
        snippet = snippet.replace('{title}', f'{adm_type.title()}')
        snippet = snippet.replace('{content}', '{{内容}}')

    print(snippet)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: ~/.venv/bin/python3 scripts/component-snippet.py <组件名> [参数]')
        print('运行 --list 查看所有可用组件')
        sys.exit(1)
    print_snippet(sys.argv[1], *sys.argv[2:])
