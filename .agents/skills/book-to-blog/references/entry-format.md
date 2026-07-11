# 目录式条目格式

> 含人物/词条目录的书（如《美国职业罪犯》《名人录》辞典类）用本文件统一条目转写格式。Phase 4 撰写时读取。

## 设计原则

- 每个条目 = 一个可扫描的小单元，读者能快速定位人名 + 关键事实
- 不用死板字段表格（除非对比性强），用 `.info-box` 或紧凑卡片
- 同一篇内所有条目格式一致
- 保留原书编号（便于回溯交叉引用）

## 人物条目推荐结构

用 `.info-box`，每条一个：

```html
<div class="info-box">
  <h3>RUFUS MINOR（鲁弗斯·迈纳）</h3>
  <p><strong>别名：</strong>Rufe Pine</p>
  <p><strong>罪名：</strong>银行潜入贼（Bank Sneak）</p>
  <p><strong>体貌：</strong>1886 年时 48 岁，生于美国，已婚，无业。矮胖体型，身高 5 英尺 5.5 英寸，体重 160 磅。棕发灰眼，圆脸，深肤色，秃顶明显；偶有牧师般斯文相貌；能迅速蓄浓须（深棕），作案时常用、作案后即刮掉。左手背有一靛蓝墨点刺青。</p>
  <p><strong>履历：</strong>美国最精明的银行潜入贼之一。同伙包括 Georgie Carson（3 号）、Horace Hovan（25 号）、Johnny Jourdan（83 号）、Billy Burke "Billy The Kid"（162 号）等。1878 年 3 月 23 日在弗吉尼亚州彼得斯堡与同伙一同被捕……</p>
</div>
```

## 简短变体（条目多时）

条目数多（每篇 ≥ 15 条）时用更紧凑的卡片，避免 `.info-box` 撑太长：

```html
<div class="info-box">
  <h3>3 · GEORGE CARSON（乔治·卡森）</h3>
  <p><strong>罪名：</strong>银行潜入贼　<strong>别名：</strong>—</p>
  <p>5 英尺 8 英寸，瘦长体型，黑发黑眼。Rufus Minor（1 号）的长期搭档……（精炼转写，100-200 字）。</p>
</div>
```

## 对比型条目（同伙/团伙）

团伙成员可用表格对比：

```html
<div class="table-wrap">
<table>
<thead><tr><th>编号</th><th>姓名</th><th>罪名</th><th>特征</th></tr></thead>
<tbody>
<tr><td>3</td><td>George Carson</td><td>Bank Sneak</td><td>黑发黑眼，Minor 搭档</td></tr>
...
</tbody>
</table>
</div>
```

表格适合"概览"，正文仍用 `.info-box` 展开重点人物，次要人物进表格。

## 罪名/犯罪类型译名表

| 原文 | 译名 |
|------|------|
| Bank Burglar | 银行窃贼（破墙入室型） |
| Bank Sneak Thief | 银行潜入贼（伪装混入型） |
| Forger | 伪造犯 |
| Hotel and Boarding-House Thief | 旅店与公寓贼 |
| Sneak and House Thief | 潜入与入户贼 |
| Store and Safe Burglar | 商店与保险箱窃贼 |
| Shoplifter | 商店扒手 |
| Pickpocket | 扒手 |
| Confidence Man / Banco Man | 诈骗犯 / 骗局党 |
| Receiver of Stolen Goods | 赃物收买者 |
| Sawdust Man | 锯末骗子 |

## 编号与交叉引用

- 原书编号保留：条目标题用 `N · NAME（音译）` 或 `NAME（音译）`
- 正文引用同伙：`（见第 162 号）`，保留原编号
- 不重新编号

## 篇幅

- 重点人物（原书记录长）：200-300 字
- 次要人物：100-150 字
- 仅列名无记录者：一句话 + 标注"原书无详细记录"

## 不做的事

- 不为每条加"注："现代评论
- 不删原书的具体数字/日期/地点
- 不合并多人到一条（除非原书本就合并）
