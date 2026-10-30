# 站点性能基线（优化前）

采集命令：`node scripts/check-perf-budget.js --report`
采集日期：2026-10-29
采集对象：`public/` 产物（`FORCE_BUILD` 之前的状态，即线上正在服务的版本）

## 结论摘要

- 895 个页面 gzip 超过 40KB，且这 895 个页面**恰好等于**带分类浏览器的页面集合 —— 内联分类树是唯一成因，这批页面 gzip 中位数 100KB。
- 全站 3045 个页面加载 Prism，其中 2925 页没有任何代码块。
- 658 个页面加载 MathJax，其中 171 页正文没有任何数学标记。
- 3045 个页面引用两个已失效/零使用的第三方域名（`cdn.tailwindcss.com`、`chinese-fonts-cdn.deno.dev`）。
- 1840 个 `<img>` 中只有 2 个带 `width`/`height`，0 个带 `srcset`。
- 产物 2.24GB，其中 `media/` 复制了 7559 个图片文件共 1.49GB。

## 详细指标

| 指标 | 数值 |
|---|---|
| 页面数 | 3104 |
| 产物总大小 | 2.24 GB (10881 文件) |
| HTML 总量 | 575.0 MB |
| HTML 总量（gzip） | 98.3 MB |
| 单页 gzip 中位/最大 | 4.0 KB / 213.1 KB |
| 超 40KB gzip 的页面 | 895 |
| 含内联分类树（data-tree）的页面 | 895 |
| 加载 MathJax 的页面 | 658 / 其中正文无数学 171 |
| 加载 Prism 的页面 | 3045 / 其中无代码块 2925 |
| 分类树共享 JSON | 不存在（仍为内联） |

### 图片

| 指标 | 数值 |
|---|---|
| 图片文件数 | 7559 |
| 图片总量 | 1.49 GB |
| 单图 >2MB | 111 |
| img 标签 | 1840（lazy 1730，width+height 2，srcset 0） |

### 第三方域名

| 域名 | 引用页面数 | 在白名单内 |
|---|---|---|
| cdn.tailwindcss.com | 3045 | 否 |
| cdn.jsdelivr.net | 3045 | 是 |
| chinese-fonts-cdn.deno.dev | 3045 | 否 |
| player.bilibili.com | 6 | 否 |
| docs.google.com | 2 | 否 |
| fonts.googleapis.com | 1 | 否 |
| fonts.gstatic.com | 1 | 否 |
| www.youtube.com | 1 | 否 |
| upload.wikimedia.org | 1 | 否 |

### gzip 最大的 10 个页面

| 页面 | gzip | 原始 |
|---|---|---|
| arxiv-digest-2026-07-01.html | 213.1 KB | 939.4 KB |
| arxiv-digest-2026-06-17.html | 210.4 KB | 932.3 KB |
| arxiv-digest-2026-09-02.html | 208.8 KB | 921.4 KB |
| video-models-07-multimodal-guidance.html | 204.0 KB | 974.6 KB |
| digital-human-identity-consistency.html | 198.9 KB | 898.3 KB |
| arxiv-digest-2026-08-19.html | 198.7 KB | 894.9 KB |
| arxiv-digest-2026-06-10.html | 196.1 KB | 887.7 KB |
| arxiv-digest-2026-07-08.html | 195.7 KB | 921.9 KB |
| arxiv-digest-2026-09-24.html | 186.8 KB | 860.4 KB |
| 术语.html | 186.3 KB | 865.6 KB |

## 截图基线

本机没有可用的无头浏览器（只有 Safari，不支持脚本截图），因此「改动前后视觉对比」改为两项可复算的机械证据，覆盖到截图能覆盖的同一风险面：

1. `assets/css/modules/*.css` 与合并产物 `hugo-theme.css` 在改动前后逐字节比对（样式表零变化 = 版式零变化）。
2. 全站 `class` token 清单在改动前后比对，确认没有任何由 Tailwind 生成的 utility class 依赖被删除（当前计数为 0）。


---

# 优化后（2026-10-30）

采集命令：`node scripts/check-perf-budget.js --report`（全部任务落地后）

## 前后对比

| 指标 | 优化前 | 优化后 | 变化 |
|---|---|---|---|
| 产物总大小 | 2.24 GB | 495.8 MB | **−78%** |
| 产物文件数 | 10881 | 7058 | −35% |
| HTML 总量（gzip） | 98.3 MB | 20.5 MB | **−79%** |
| 单页 gzip 中位数 | 4.0 KB（分类浏览器页 100 KB） | 3.8 KB（同集合 3.8 KB） | 页面间差异消失 |
| 单页 gzip 最大 | 213.1 KB | 124.1 KB | −42% |
| 超 40KB gzip 页面 | 895 | 49（全部为正文特重页，已登记） | −95% |
| 内联分类树页面 | 895 | 0 | 消除 |
| 加载 Prism 页面 | 3045（2925 无代码块） | 108（0 误加载） | −96% |
| 加载 MathJax 页面 | 658（171 无数学） | 465（0 误加载） | −29% |
| 第三方域名 | tailwind CDN + 已停服字体 CDN | 仅 jsdelivr + 内容嵌入 | 阻塞外链归零 |
| 图片文件数（部署） | 7559 / 1.49 GB | 1740 源 + 2361 派生 / 445 MB | −70% |
| 单图 >2MB | 111 | 0 | 消除 |
| `img` 带 width/height | 2 / 1840 | 1791 / 1791（本地图 100%） | 消除 CLS 来源 |
| `img` 带 srcset | 0 | 1490（全部 >1600px 的图） | 移动端按需取图 |
| 图片最大像素 | 10627×13443（1.43 亿） | 4000px 长边上限 | 解码开销降一个数量级 |

单页模板开销（正文以外的一切）：中位 2.0KB、p95 4.4KB、最大 10.6KB，预算 12KB。

## 优化后详细指标

| 指标 | 数值 |
|---|---|
| 页面数 | 2874 |
| 产物总大小 | 495.8 MB (7058 文件) |
| HTML 总量 | 66.8 MB |
| HTML 总量（gzip） | 20.5 MB |
| 单页 gzip 中位/最大 | 3.8 KB / 124.1 KB |
| 超 40KB gzip 的页面 | 49 |
| 含内联分类树（data-tree）的页面 | 0 |
| 加载 MathJax 的页面 | 465 / 其中正文无数学 0 |
| 加载 Prism 的页面 | 108 / 其中无代码块 0 |
| 分类树共享 JSON | 131.6 KB（gzip 27.6 KB） |

### 图片

| 指标 | 数值 |
|---|---|
| 图片文件数 | 4099 |
| 图片总量 | 403.8 MB |
| 单图 >2MB | 0 |
| img 标签 | 1834（lazy 1435，width+height 1800，srcset 1497） |

### 第三方域名

| 域名 | 引用页面数 | 在白名单内 |
|---|---|---|
| cdn.jsdelivr.net | 567 | 是 |
| player.bilibili.com | 6 | 是 |
| docs.google.com | 2 | 是 |
| fonts.googleapis.com | 1 | 是 |
| fonts.gstatic.com | 1 | 是 |
| www.youtube.com | 1 | 是 |

### gzip 最大的 10 个页面

| 页面 | gzip | 原始 |
|---|---|---|
| arxiv-digest-2026-07-01.html | 124.1 KB | 349.5 KB |
| arxiv-digest-2026-06-17.html | 121.3 KB | 342.4 KB |
| arxiv-digest-2026-09-02.html | 119.7 KB | 331.5 KB |
| video-models-07-multimodal-guidance.html | 118.5 KB | 412.5 KB |
| digital-human-identity-consistency.html | 111.3 KB | 315.4 KB |
| arxiv-digest-2026-08-19.html | 109.7 KB | 305.0 KB |
| arxiv-digest-2026-06-10.html | 107.1 KB | 297.8 KB |
| arxiv-digest-2026-07-08.html | 106.4 KB | 331.9 KB |
| arxiv-digest-2026-09-24.html | 97.5 KB | 270.5 KB |
| arxiv-digest-2026-07-02.html | 90.0 KB | 253.7 KB |

---

# 留白归一（uniform-figure-margins）

工具：`scripts/normalize-image-margins.py`（默认 dry-run）
目标：每张被引用的静态配图裁到内容边界后，补该图宽度 3% 的四边留白（`.wrap` 内容宽 752px → 屏幕约 21–22px）

## 归一前分布（1731 个被引用候选）

| 留白档位 | 数量 |
|---|---|
| <1%（几乎贴边） | 1358 |
| 1–3% | 233 |
| 3–20% | 93 |
| >20% | 4 |
| 整图同色，无法定位内容 | 2 |
| 动态 WebP（豁免） | 4 |
| 小尺寸图标（豁免） | 37 |

## 归一后

| 留白档位 | 数量 |
|---|---|
| <1% | 1（几何已归一，仅噪声导致测量偏差） |
| 1–3% | 1669 |
| 3–20% | 15（3.06–3.84%，与目标差 <1 个百分点） |
| >20% | 0 |
| 动态 WebP（豁免） | 4 |
| 整图同色（豁免） | 2 |
| 小尺寸图标（豁免） | 40 |

- 归一 1755 张（多轮：第二轮修正透明底图测量口径；后续两轮把超宽横条图的上下留白从「3% 宽」收敛到「≤11% 高」以符合留白门禁），`media/` 体积 253.1MB → 216MB（**−15%**，裁掉的存量留白多于补上的统一留白）。
- 幂等：第三次执行 `待归一 0`。
- 留白门禁 `check-figure-whitespace.py --changed`：0 FAIL。
- 渲染一致性抽样（752px 视口）：同页各图留白 19.8–21.6px，跨度 <2px。
- 补白颜色抽样 200 张：白底 116、非白底 50、透明 27 —— 即非白底图没有被填成白色。

## 豁免与已知边界

- 4 个多帧 WebP（演示动画）不参与归一，逐帧补白会掉帧。
- 2 张整图同色图片无法定位内容边界，跳过。
- 40 张小尺寸图标（<400px 宽，行内图标）不补白。
- 7 张登记在 `data/margin-skip.txt`：`aegospotami-battle`、`pengcheng-battle`、`weapons/{F-22,F-35A,Tomahawk,Virginia}`、`agent-attention-2024/fig8_agent_visualize`。这些图的边界检测把自身画面（深色油画天空、机身中性灰、渐变）判成留白，边带 std 达 6.2–53.6，属内容；按门禁裁切会切掉真实像素，因此保持原样并登记原因。
- 超宽横条（宽高比 >3.7:1）的上下留白按高度 11% 收口，屏幕上比常规图略窄（约 15px vs 22px），否则上下两侧合计会超过留白门禁的 20%。
- 暗色模式下的观感需人眼确认：图内留白取的是图片自身背景色，白底图在暗色模式下会显示为一块更大的白底（与图本身同色，不产生描边）。
