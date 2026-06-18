# 数学/信号函数图：JSXGraph

> 从 `syntax.md` 拆分。所有 JSXGraph 绘图语法集中在此。
> JSXGraph 是博客唯一的绘图引擎。`function-plot` 仍保留 shortcode 基础设施，但新建图表统一用 JSXGraph。
> 本文档以 **博客当前运行方式** 为准：shortcode 只注入 `jsxgraphcore.js + jsxgraph.css`，不会自动为图内文字额外加载 MathJax / KaTeX。

---

## 0. 先说结论：在博客里怎么用 JSXGraph

### 0.1 标准 shortcode

```html
{{< jsxgraph title="标题" height="360" >}}
var board = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-5, 5, 5, -5],
  showCopyright: false,
  showNavigation: false
});
// ... JSXGraph code ...
{{< /jsxgraph >}}
```

代码块执行时可直接使用三个变量：

- `el`：目标 DOM 元素（`.jsxgraph-target`）
- `JXG`：JSXGraph 全局对象
- `figure`：外层 `<figure>` 元素

### 0.2 运行时与限制

博客当前运行时：

- 只按需加载 `jsxgraphcore.js` 与 `jsxgraph.css`
- **不会自动加载 MathJax / KaTeX 给图内 text 使用**
- 因此：
  - 图内文字默认按普通字符串处理
  - 简单下标/上标可依赖 JSXGraph 自带的轻量文本能力
  - **不要默认假设图内 LaTeX 一定可用**
  - 复杂公式、定理说明、长解释，优先写在图外正文里

如果未来真的要在图内启用 MathJax，需要额外满足：

1. 页面已加载 MathJax；
2. JSXGraph text 显式启用 `useMathJax: true`；
3. 通常还要配合 `display: 'html'` 与 `parse: false` 使用；
4. 这会带来层级、性能、遮挡与布局复杂度。

**博客默认策略**：
- 图内只放短标签、短数字、短提示；
- 公式和解释写在图外正文；
- 不把图内 MathJax 当成稳定能力依赖。

---

## 1. 选择规则

| 场景 | 推荐做法 |
|------|----------|
| 连续函数（sin、sinc、指数衰减、正态密度等） | `functiongraph` |
| 分段函数（阶跃、sgn、矩形窗、三角波） | 单个 `functiongraph` + 条件表达式 |
| 离散序列（δ[n]、u[n]、R_N[n]） | 循环 ±500 + `segment` / `point` |
| 冲激等广义函数 | `segment` + `lastArrow` |
| 交互参数演示 | `slider` + 动态函数 / 动态点 / 动态文本 |
| 几何关系（点、线、圆、切线、交点） | `point` / `line` / `circle` / `intersection` |
| 参数曲线 | `curve` |
| 数据点或折线 | `curve` / `point` / 自定义 `dataX,dataY` |
| 变换演示 | `transform` |
| 柱状图 / 折线统计图 | `chart`（`chartStyle: 'bar'` / `'line'`） |
| 黎曼和 / 定积分面积 | `riemannsum` / `integral` |
| 斜率三角形 / 导数可视化 | `slopetriangle` + `tangent` |
| 角度标注 / 多边形 / 扇形 | `angle` / `polygon` / `sector` / `arc` |
| 不等式区域 / 函数填充 | `inequality` |
| 自定义刻度与网格 | `ticks` / board `defaultAxes` |

---

## 2. 资产加载原则

shortcode 只生成 `data-jsxgraph` 容器。`generator.js` 通过 `injectPlotAssets(page)` 扫最终 HTML：

- 有 `data-jsxgraph` → 注入 `plots.css` + `jsxgraph-runtime.js`
- runtime 内部再按需加载 JSXGraph CSS/JS
- 没有绘图 marker → 不加载任何绘图 CSS/JS

这意味着：

- **shortcode 本身不直接写 `<script>`**
- 图的逻辑全部写在 `{{< jsxgraph >}}...{{< /jsxgraph >}}` 代码块里

---

## 3. board 初始化语法

## 3.1 最小写法

```js
var board = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-5, 5, 5, -5],
  showCopyright: false,
  showNavigation: false
});
```

## 3.2 常用 board 选项

```js
var board = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-5, 5, 5, -5],
  axis: false,
  grid: false,
  keepaspectratio: false,
  showCopyright: false,
  showNavigation: false,
  zoom: { factor: 1.1 },
  pan: { enabled: true },
  keyboard: { enabled: false }
});
```

### 常用项说明

| 选项 | 含义 |
|------|------|
| `boundingbox: [xmin, ymax, xmax, ymin]` | 视窗范围，顺序不要写反 |
| `axis: true/false` | 自动显示默认坐标轴 |
| `grid: true/false` | 是否显示网格 |
| `keepaspectratio` | 是否保持 x/y 同比例 |
| `showNavigation` | 是否显示右上角控制按钮 |
| `showCopyright` | 是否显示 JSXGraph 版权角标 |
| `zoom` | 缩放行为配置 |
| `pan` | 平移行为配置 |
| `maxBoundingBox` / `minBoundingBox` | 限制缩放范围 |

---

## 4. 缩放与平移

JSXGraph 1.9.2 默认：

- `zoom.needShift: true`
- `pan.needShift: true`

即：

- **Shift + 滚轮** 才缩放
- **Shift + 拖拽** 才平移

博客一般保留默认行为，只隐藏导航按钮：

```js
showNavigation: false
```

可选改法：

```js
zoom: { needShift: false },
pan: { needShift: false }
```

如果你要做教学演示，通常建议：

- 默认仍保留 Shift 模式，避免用户滚动页面时误缩放图
- 滑块与说明尽量不要压在主图内容中心

---

## 5. 核心原则：让图延伸到无穷远

## 5.1 `functiongraph` 不设硬编码显示区间

**推荐：** 用条件表达式，不手动截断显示区间。

```js
// ✅ 推荐
board.create('functiongraph', [function(x) {
  return x < 0 ? 0 : 1;
}], { strokeColor: '#2563eb', strokeWidth: 2.2 });
```

```js
// ❌ 不推荐：把图硬裁成两小段
board.create('functiongraph', [function(x){ return 0; }, -3, 0], ...);
board.create('functiongraph', [function(x){ return 1; }, 0, 3], ...);
```

原因：缩放/平移后，JSXGraph 会在新视窗重新采样函数；如果你自己把范围裁死了，超出后就不画了。

## 5.2 离散序列循环范围用 ±500

```js
for (var n = -500; n <= 500; n++) {
  // ...
}
```

不要偷懒只写 ±30 或 ±50，否则缩放后会出现空白。

---

## 6. JSXGraph 坐标体系：为什么滑块会“跟着缩放跑”

JSXGraph 里绝大多数元素默认都用 **用户坐标**（user coordinates）。

这意味着：

- `slider` 的两个端点 `[[x1,y1],[x2,y2], ...]`
- `text` 的坐标 `[x,y,...]`
- 点、线、圆等

都跟着坐标系走。你一缩放，视觉位置就变了。

### 实用建议

1. **不要把滑块放在曲线正上方或正中央**
2. 把滑块放在：
   - 图下方空白区，或
   - 图上边缘留白区，或
   - 右侧/左侧明显空带
3. 通过扩大 `boundingbox` 给控件留专门空间
4. 复杂说明文字不要堆进图里，写在正文里

### 例子：给顶部留控制区

```js
var board = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-4.2, 0.62, 4.2, -0.14],
  showCopyright: false,
  showNavigation: false
});

var s = board.create('slider', [[-3.7, 0.54], [0.2, 0.54], [1, 4, 64]], {
  name: 'n',
  snapWidth: 1,
  precision: 0
});
```

这里本质上不是“固定到屏幕左上角”，而是 **在坐标系里预留一个不挡内容的区域**。

> 备注：官方文档说明存在 screen coordinates / user coordinates 的底层概念，但博客当前 shortcode/runtime 没有额外封装“屏幕固定 UI 层”。因此我们的实践策略不是追求屏幕绝对固定，而是用 boundingbox 预留稳定控件区。

---

## 7. 常见元素语法总表

| 元素 | 写法 | 用途 |
|------|------|------|
| `axis` | `board.create('axis', [[0,0],[1,0]], {})` | 坐标轴 |
| `point` | `board.create('point', [x, y], {...})` | 点 |
| `line` | `board.create('line', [p1, p2], {...})` | 直线 |
| `segment` | `board.create('segment', [[x1,y1],[x2,y2]], {...})` | 线段 / stem / 箭头 |
| `circle` | `board.create('circle', [[x,y], r], {...})` | 圆 |
| `functiongraph` | `board.create('functiongraph', [fn], {...})` | 函数图像 |
| `curve` | `board.create('curve', [xArr,yArr], {...})` 或参数形式 | 数据曲线 / 参数曲线 |
| `text` | `board.create('text', [x,y,'txt'], {...})` | 文字说明 |
| `slider` | `board.create('slider', [[x1,y1],[x2,y2],[min,start,max]], {...})` | 交互参数 |
| `glider` | `board.create('glider', [x,y,parent], {...})` | 依附在线/曲线上的可拖点 |
| `intersection` | `board.create('intersection', [obj1,obj2,index], {...})` | 交点 |
| `tangent` | `board.create('tangent', [p], {...})` | 切线 |
| `normal` | `board.create('normal', [p], {...})` | 法线 |
| `transform` | `board.create('transform', [...], {type:'...'})` | 平移/旋转/缩放 |
| `polygon` | `board.create('polygon', [p1,p2,p3], {...})` | 多边形 |
| `image` | `board.create('image', [src,[x,y],[w,h]], {...})` | 图片 |

---

## 8. 连续函数：`functiongraph`

## 8.1 基本写法

```html
{{< jsxgraph title="归一化抽样函数 sinc(t)" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-8, 1.1, 8, -0.35],
  showCopyright: false,
  showNavigation: false
});
b.create('axis', [[0,0],[1,0]], {});
b.create('functiongraph', [function(x){
  return x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
}], { strokeColor:'#2563eb', strokeWidth:2.2 });
{{< /jsxgraph >}}
```

## 8.2 常用属性

```js
{
  strokeColor: '#2563eb',
  strokeWidth: 2.2,
  dash: 0,
  highlight: false,
  fixed: true
}
```

### 可用场景

- 正弦、指数、正态密度
- 误差函数、sigmoid
- 参数由 slider 控制的连续函数

---

## 9. 分段函数：一个 `functiongraph` + 条件表达式

```js
board.create('functiongraph', [function(x) {
  return x < 0 ? 0 : 1;
}], { strokeColor:'#2563eb', strokeWidth:2.2 });
```

矩形窗：

```js
board.create('functiongraph', [function(x) {
  return (x > -1 && x < 1) ? 1 : 0;
}], {...});
```

三角波：

```js
board.create('functiongraph', [function(x) {
  if (x < -1 || x > 1) return 0;
  return x < 0 ? 1 + x : 1 - x;
}], {...});
```

---

## 10. 冲激 / 箭头 / stem：`segment`

```html
{{< jsxgraph title="单位冲激信号示意" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-3, 1.5, 3, -0.35],
  showCopyright: false,
  showNavigation: false
});
b.create('axis', [[0,0],[1,0]], { ticks: { drawLabels: false } });
b.create('segment', [[0,0],[0,1]], {
  strokeColor:'#2563eb',
  strokeWidth:2.2,
  lastArrow:true,
  highlight:false
});
{{< /jsxgraph >}}
```

常用属性：

- `lastArrow: true`
- `firstArrow: true`
- `strokeColor`
- `strokeWidth`
- `dash`
- `highlight: false`

---

## 11. 离散序列：`segment` + `point`

```html
{{< jsxgraph title="单位样值序列 δ[n]" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-10, 1.4, 10, -0.35],
  showCopyright: false,
  showNavigation: false
});
b.create('axis', [[0,0],[1,0]], { ticks: { drawLabels: false } });
for (var n = -500; n <= 500; n++) {
  var v = (n === 0) ? 1 : 0;
  if (v > 0) {
    b.create('segment', [[n,0],[n,v]], { strokeColor:'#2563eb', strokeWidth:2, highlight:false });
    b.create('point', [n,v], {
      face:'o', size:3,
      strokeColor:'#2563eb', fillColor:'#2563eb',
      withLabel:false, showInfobox:false
    });
  } else {
    b.create('point', [n,0], {
      face:'o', size:2,
      strokeColor:'#2563eb', fillColor:'#2563eb',
      withLabel:false, showInfobox:false,
      opacity:0.25
    });
  }
}
{{< /jsxgraph >}}
```

---

## 12. 点、线、圆、交点、切线

## 12.1 点

```js
var A = board.create('point', [1, 2], {
  name: 'A',
  size: 3,
  strokeColor: '#2563eb',
  fillColor: '#2563eb'
});
```

### 常用属性

- `name`
- `size`
- `face`
- `strokeColor`
- `fillColor`
- `withLabel`
- `showInfobox`
- `fixed`

## 12.2 直线 / 线段

```js
var B = board.create('point', [3, 1]);
var line = board.create('line', [A, B], { strokeColor: '#555' });
var seg = board.create('segment', [A, B], { strokeColor: '#d97706' });
```

## 12.3 圆

```js
var c = board.create('circle', [[0,0], 2], { strokeColor:'#16a34a' });
```

## 12.4 交点

```js
var i1 = board.create('intersection', [line, c, 0], { name:'P' });
var i2 = board.create('intersection', [line, c, 1], { name:'Q' });
```

## 12.5 切线 / 法线

```js
var g = board.create('glider', [1, 0, curve], { name:'T' });
board.create('tangent', [g], { strokeColor:'#ef4444' });
board.create('normal', [g], { strokeColor:'#8b5cf6' });
```

---

## 13. 文本：`text`

## 13.1 普通文本

```js
board.create('text', [2.6, -0.15, 't'], {
  fontSize: 13,
  color: '#888',
  fontStyle: 'italic'
});
```

## 13.2 动态文本

```js
board.create('text', [-3.8, 0.4, function() {
  return 'n = ' + Math.round(s.Value());
}], {
  fontSize: 14,
  color: '#444'
});
```

## 13.3 对齐

```js
board.create('text', [0, 1, 'u(t)'], {
  anchorX: 'left',
  anchorY: 'middle'
});
```

常见值：

- `anchorX: 'left' | 'middle' | 'right'`
- `anchorY: 'top' | 'middle' | 'bottom' | 'auto'`

## 13.4 `display: 'html'` vs `display: 'internal'`

官方文档说明文本有两种渲染方式：

- `display: 'internal'`：用 SVG / Canvas 内部文字渲染，速度快，但高级 HTML / MathJax / KaTeX 不可用
- `display: 'html'`：用 HTML `<div>` 渲染，更灵活，但始终浮在几何层上方，易遮挡

**博客建议**：

- 默认不显式设置，保持简单文本
- 需要旋转文字时可考虑 `display: 'internal'`
- 不要在博客里把复杂公式说明塞进 `display: 'html'` 文本层

## 13.5 图内 LaTeX / MathJax / KaTeX：官方能力 vs 博客现实

### 官方文档确认
JSXGraph 官方文档明确写了：

- Text 支持 HTML、MathJax、KaTeX、GEONExT 语法
- 若要用 MathJax，需额外加载 MathJax，并启用 `useMathJax: true`
- 若要用 KaTeX，需额外加载 KaTeX，并启用 `useKatex: true`

### 但博客当前不要默认这样写
因为博客 runtime 目前只保证加载 JSXGraph 本身，**不保证图内 MathJax / KaTeX 环境就绪**。

所以：

- **不要把图内 LaTeX 当成默认语法写法**
- 简洁标签用普通文本：`'N(0,1)'`、`'x'`、`'density'`
- 复杂公式写到图外正文中

### 如果你明确知道页面已额外加载 MathJax，可以这样写

```js
JXG.Options.text.useMathJax = true;
board.create('text', [-4, 3, function() {
  return '\\[f(x)=e^{-' + k.Value().toFixed(1) + 'x^2}\\]';
}], {
  display: 'html',
  parse: false,
  useMathJax: true,
  fontSize: 20
});
```

但这不是博客默认推荐路径。

---

## 14. 滑块：`slider`

## 14.1 基本语法

```js
var s = board.create('slider', [[0,-3],[4,-3],[1,1,5]], {
  name: 'n',
  snapWidth: 1
});
```

三个 parent 参数含义：

```js
[[x1,y1], [x2,y2], [min, start, max]]
```

- `[x1,y1]`：滑条起点
- `[x2,y2]`：滑条终点
- `[min, start, max]`：最小值、初始值、最大值

## 14.2 常用属性

```js
{
  name: 'n',
  snapWidth: 1,
  precision: 0,
  withTicks: true,
  withLabel: true,
  size: 6,
  fillColor: '#d97706',
  strokeColor: '#92400e'
}
```

常见项：

- `name`
- `snapWidth`
- `precision` / `digits`
- `withLabel`
- `withTicks`
- `size`
- `suffixLabel`
- `unitLabel`
- `postLabel`
- `label`

## 14.3 获取值

```js
var n = s.Value();
```

常见搭配：

```js
function() {
  return Math.round(s.Value());
}
```

## 14.4 博客里的滑块实践规范

- 滑块不要压在主曲线上
- 给顶部或底部留专门留白
- 如果是教学图，`snapWidth: 1` 往往更直观
- 如果只是调参数，不要在图里再堆长文本标签

---

## 15. glider：沿曲线/直线滑动的点

```js
var curve = board.create('functiongraph', [function(x) {
  return Math.sin(x);
}], { strokeColor:'#2563eb' });

var g = board.create('glider', [1, 0, curve], {
  name: 'P',
  withLabel: false
});
```

用途：

- 展示曲线上某点位置
- 做切线、法线
- 实时显示函数值、斜率、坐标

搭配动态文本：

```js
board.create('text', [function(){ return g.X() + 0.2; }, function(){ return g.Y() + 0.2; }, function(){
  return '(' + g.X().toFixed(2) + ', ' + g.Y().toFixed(2) + ')';
}]);
```

---

## 16. curve：参数曲线 / 数据曲线

## 16.1 数据曲线

```js
var xs = [0,1,2,3,4];
var ys = [1,0,2,1,3];
board.create('curve', [xs, ys], {
  strokeColor:'#2563eb',
  strokeWidth:2
});
```

## 16.2 参数曲线

```js
board.create('curve', [
  function(t){ return Math.cos(t); },
  function(t){ return Math.sin(t); },
  0,
  2 * Math.PI
], {
  strokeColor:'#dc2626',
  strokeWidth:2
});
```

适合：

- 圆、椭圆、螺线
- 相图
- 参数路径

---

## 17. transform：平移、旋转、缩放

## 17.1 平移

```js
var tMove = board.create('transform', [1, 2], { type:'translate' });
tMove.bindTo(A);
```

## 17.2 旋转

```js
var tRot = board.create('transform', [Math.PI / 6, [0,0]], { type:'rotate' });
tRot.bindTo(A);
```

## 17.3 缩放

```js
var tScale = board.create('transform', [2, 1], { type:'scale' });
tScale.bindTo(A);
```

用途：

- 教学中的几何变换演示
- 文字/图形绕点旋转
- 复制并变换对象

备注：文本旋转、不同坐标轴比例、HTML 文本层会引入额外复杂度。博客里只有明确需要时才用。

---

## 17b. 进阶元素（runtime 加载完整 jsxgraphcore，以下均可用）

博客 runtime 加载的是完整版 `jsxgraphcore.js@1.9.2`，下列内置元素都可直接 `board.create(...)` 使用。仅在普通函数图/序列图表达不了时才用，避免把简单图复杂化。

### 17b.1 统计图 `chart`

适合在数学/信号笔记里画离散数据柱状图或折线统计图。

```js
var data = [4, 7, 3, 8, 5];
b.create('chart', [data], {
  chartStyle: 'bar',
  width: 0.6,
  labels: data,
  colorArray: ['#2563eb']
});
```

要点：

- `chartStyle` 官方支持 `'bar'`、`'line'`、`'point'`、`'pie'`、`'spline'`、`'radar'`、`'fit'`，逗号分隔可叠加（如 `'line,point'`）。
- 柱状图/雷达图用 `colorArray: [...]` 逐项配色；**饼图用 `colors: [...]`**（注意属性名不同）。
- 双参数 `[xData, yData]` 可指定 x 坐标；单参数 `[yData]` 或 `[[yData]]` 时 x 默认为 1,2,3...
- 柱状图建议配合 `axis: false` 自己画坐标轴，避免默认轴干扰。

### 17b.2 定积分面积 `integral` / 黎曼和 `riemannsum`

可视化定积分、数值积分逼近，教学场景很常用。

```js
var f = b.create('functiongraph', [function(x){ return Math.sin(x) + 1.5; }], { strokeColor:'#2563eb' });

b.create('integral', [[0, Math.PI], f], {
  fillColor: '#2563eb',
  fillOpacity: 0.15
});

b.create('riemannsum', [
  function(x){ return Math.sin(x) + 1.5; },
  8,           // 分割数 n（可传函数实现交互）
  'left',      // left / right / middle / lower / upper / random / trapezoidal / simpson
  0, Math.PI   // 区间 [a, b]，默认 a=-10 b=10
], { fillColor:'#d97706', fillOpacity:0.3 });
```

要点：分割数可绑定 slider 做交互（`function(){ return Math.round(s.Value()); }`），演示逼近过程。

### 17b.3 斜率三角形 `slopetriangle`

配合 `tangent` + `glider` 直观展示导数。

```js
var f = b.create('functiongraph', [function(x){ return 0.3*x*x; }], { strokeColor:'#2563eb' });
var g = b.create('glider', [1, 0, f], { name:'P', size:3, strokeColor:'#d97706', fillColor:'#d97706' });
var t = b.create('tangent', [g], { strokeColor:'#dc2626', dash:2 });
b.create('slopetriangle', [t], { fillColor:'#dc2626', fillOpacity:0.15 });
```

拖动 P 即可看到切线斜率随位置变化。

### 17b.4 角度 / 多边形 / 扇形

```js
var A = b.create('point', [0,0], { name:'A' });
var B = b.create('point', [3,0], { name:'B' });
var C = b.create('point', [1,2], { name:'C' });

b.create('polygon', [A, B, C], { fillColor:'#16a34a', fillOpacity:0.1 });
b.create('angle', [B, A, C], { radius:0.8, name:'α' });
b.create('sector', [A, B, C], { fillColor:'#8b5cf6', fillOpacity:0.2 });
```

`angle` 自动画弧线并可标角名；`sector` 画扇形区域；`arc` 只画弧线不填充。

### 17b.5 不等式区域 `inequality`

给一条函数或直线的上/下方着色，画可行域、收敛域等。

```js
var line = b.create('line', [[0,1],[1,2]], { strokeColor:'#555' });
b.create('inequality', [line], {
  inverse: false,    // false=直线下方，true=上方
  fillColor: '#2563eb',
  fillOpacity: 0.12
});
```

### 17b.6 自定义坐标轴刻度 `ticks`

需要非默认刻度（如以 π 为单位、对数刻度标签）时，自己建 axis 再加 ticks。

```js
var xAxis = b.create('axis', [[0,0],[1,0]], { drawLabels:false });
b.create('ticks', [xAxis, Math.PI], {
  drawLabels: true,
  label: { offset: [0, -12] },
  generateLabelText: function(tick){
    var n = Math.round(tick.usrCoords[1] / Math.PI);
    return n === 0 ? '0' : (n === 1 ? 'π' : n + 'π');
  }
});
```

---

## 18. `board.suspendUpdate()` / `board.unsuspendUpdate()`

当一次性创建很多对象或批量更新时，可以包起来减少闪动：

```js
board.suspendUpdate();
// create many objects
board.unsuspendUpdate();
```

适合：

- 离散序列大量点
- 多对象联动初始化
- 复杂交互图首次构建

---

## 19. 常见视觉属性速查

```js
{
  strokeColor: '#2563eb',
  fillColor: '#2563eb',
  strokeWidth: 2,
  dash: 2,
  opacity: 0.4,
  highlight: false,
  fixed: true,
  visible: true,
  withLabel: false,
  showInfobox: false
}
```

### 常见颜色建议

- 主曲线：`#2563eb`
- 强调曲线：`#d97706`
- 辅助线：`#888` / `#555`
- 切线或警示：`#dc2626`
- 正向结构：`#16a34a`
- 紫色辅助：`#8b5cf6`

---

## 20. 博客里真正推荐的 JSXGraph 图层分工

### 图内适合放

- 坐标轴标签：`x`、`t`、`n`
- 短标签：`N(0,1)`、`u(t)`、`sinc(t)`
- 简单动态数值：`n = 8`、`σ = 0.354`
- 点名、线名、局部提示

### 图外适合放

- 定理陈述
- 长公式
- 证明思路
- 复杂图例
- 多段解释文字
- 对交互操作的详细说明

这个分工比一味把所有信息都塞进图里稳定得多。

---

## 21. 典型模板

## 21.1 连续函数模板

```html
{{< jsxgraph title="标题" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-5, 2, 5, -2],
  showCopyright: false,
  showNavigation: false
});
b.create('axis', [[0,0],[1,0]], {});
b.create('functiongraph', [function(x){
  return Math.sin(x);
}], { strokeColor:'#2563eb', strokeWidth:2.2, highlight:false });
{{< /jsxgraph >}}
```

## 21.2 滑块交互模板

```html
{{< jsxgraph title="交互演示" height="420" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-4, 2.2, 4, -2.2],
  showCopyright: false,
  showNavigation: false
});
var s = b.create('slider', [[-3.5,1.8],[-0.5,1.8],[1,2,10]], {
  name:'n', snapWidth:1, precision:0
});
b.create('axis', [[0,0],[1,0]], {});
b.create('functiongraph', [function(x){
  return Math.sin(s.Value() * x);
}], { strokeColor:'#2563eb', strokeWidth:2.2 });
b.create('text', [1.2, 1.6, function(){ return 'n = ' + Math.round(s.Value()); }], {
  fontSize:14, color:'#444'
});
{{< /jsxgraph >}}
```

## 21.3 离散序列模板

```html
{{< jsxgraph title="离散序列" height="300" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-10, 1.4, 10, -0.35],
  showCopyright: false,
  showNavigation: false
});
b.create('axis', [[0,0],[1,0]], { ticks: { drawLabels: false } });
for (var n = -500; n <= 500; n++) {
  var v = (n >= 0 && n <= 4) ? 1 : 0;
  if (v !== 0) {
    b.create('segment', [[n,0],[n,v]], { strokeColor:'#2563eb', strokeWidth:2, highlight:false });
    b.create('point', [n,v], { face:'o', size:3, strokeColor:'#2563eb', fillColor:'#2563eb', withLabel:false, showInfobox:false });
  }
}
{{< /jsxgraph >}}
```

## 21.4 黎曼和交互模板（slider 控制分割数）

```html
{{< jsxgraph title="黎曼和逼近定积分" height="420" >}}
var b = JXG.JSXGraph.initBoard(el, {
  boundingbox: [-0.6, 3, 3.8, -0.6],
  showCopyright: false,
  showNavigation: false
});
b.create('axis', [[0,0],[1,0]], {});
b.create('axis', [[0,0],[0,1]], {});
var s = b.create('slider', [[1.5,2.7],[3.3,2.7],[1,4,40]], { name:'n', snapWidth:1, precision:0 });
var f = function(x){ return Math.sin(x) + 1.5; };
b.create('functiongraph', [f], { strokeColor:'#2563eb', strokeWidth:2.2 });
b.create('riemannsum', [f, function(){ return Math.round(s.Value()); }, 'left', 0, Math.PI], {
  fillColor:'#d97706', fillOpacity:0.3, strokeColor:'#92400e'
});
b.create('text', [0.1, 2.7, function(){ return 'n = ' + Math.round(s.Value()); }], { fontSize:14, color:'#444' });
{{< /jsxgraph >}}
```

---

## 22. 踩坑记录（强制阅读）

| 问题 | 原因 | 解法 |
|------|------|------|
| 缩放后曲线不延伸 | `functiongraph` 设了硬编码范围 `[fn, xMin, xMax]` | 去掉范围，用条件表达式 |
| 缩放后离散序列出现空白 | 循环范围太小（±50） | 扩大到 ±500 |
| 滚轮不缩放 | JSXGraph 默认 `zoom.needShift: true` | 按 Shift+滚轮，或设 `needShift: false` |
| 无法拖动平移 | JSXGraph 默认 `pan.needShift: true` | 按 Shift+拖拽，或设 `needShift: false` |
| 冲激箭头用 function-plot 画不出 | δ(t) 不是普通函数 | 改用 JSXGraph `segment` + `lastArrow` |
| 滑块挡住曲线 | slider 也在用户坐标里，没预留控件区 | 扩大 `boundingbox`，把 slider 放到专门留白带 |
| 图中文字跟着缩放跑 | text 默认也是用户坐标 | 只放短标签，长说明写图外 |
| 以为 JSXGraph 自动支持 LaTeX | 官方支持的是可选 MathJax/KaTeX 集成，不是裸环境自动可用 | 博客默认不要依赖图内 LaTeX |
| 图里堆了太多说明导致遮挡 | `display:'html'` 文本总在几何层之上 | 把说明移到正文 |
| 交互图首次创建很卡 | 一次创建对象太多 | 用 `suspendUpdate/unsuspendUpdate` |
| `riemannsum` 分割数不随 slider 变 | 第二参数写成定值而非函数 | 写成 `function(){ return Math.round(s.Value()); }` |
| `integral` / `inequality` 填充看不出 | 没设 `fillOpacity` 或值太低 | 设 `fillOpacity: 0.1~0.3`，并配 `fillColor` |
| `chart` 柱状图坐标轴乱 | 默认 axis 与数据范围不匹配 | board 设 `axis:false` 自己画轴，或调 `boundingbox` |
| `slopetriangle` 报错 | 第一参数必须是 `tangent`/`line` 对象，不是 glider | 先建 `tangent`，再 `slopetriangle([t])` |
| 自定义 `ticks` 标签不显示 | 漏了 `drawLabels:true` 或 `generateLabelText` | 两者都要设 |

---

## 23. function-plot（旧语法，仍可使用）

`function-plot` 仍保留 shortcode 基础设施，但新建图表统一用 JSXGraph。

```html
{{< functionplot fn="sin(x)" x="-10,10" y="-2,2" title="正弦函数" >}}
{{< functionplot title="多曲线" >}}JSON{{< /functionplot >}}
```

---

## 24. 官方文档中本次确认过的关键事实

本文件更新时，已核实以下官方信息：

1. **Text 官方支持 HTML / MathJax / KaTeX / GEONExT**，但高级数学文本依赖额外加载对应库；
2. `display: 'html'` 文本最灵活，但会浮在几何层上方；
3. `display: 'internal'` 更轻量，但不适合复杂 HTML / MathJax / KaTeX；
4. `slider` 语法为 `[[x1,y1],[x2,y2],[min,start,max]]`；
5. slider 标签支持 `suffixLabel` / `unitLabel` / `postLabel` 等；
6. JSXGraph 官方有 `useMathJax` / `useKatex` 文本选项；
7. screen coordinates 与 user coordinates 是 JSXGraph 底层概念的一部分，但博客当前没有单独封装“固定屏幕 UI 控件层”。
8. **runtime 加载完整版 `jsxgraphcore.js@1.9.2`**（见 `assets/js/jsxgraph-runtime.js`），因此所有内置元素都可用：`chart`、`integral`、`riemannsum`、`slopetriangle`、`angle`、`polygon`、`sector`、`arc`、`inequality`、`ticks`、`legend`、`tapemeasure` 等；
9. 代码块通过 `new Function('el','JXG','figure', code)` 执行，**只能使用 `el` / `JXG` / `figure` 三个外部变量**，不要假设其它全局可用；
10. `riemannsum` 签名为 `[f, n, type, a, b]`，`type` 官方支持 `'left' / 'right' / 'middle' / 'lower' / 'upper' / 'random' / 'trapezoidal' / 'simpson'`，默认 `'left'`，默认区间 a=-10、b=10；`n` 可传函数实现交互；返回元素有 `.Value()` 方法取面积值；
11. `chart` 的 `chartStyle` 官方支持 `'bar' / 'line' / 'point' / 'pie' / 'spline' / 'radar' / 'fit'`，逗号分隔可叠加；柱/雷达用 `colorArray`，饼图用 `colors`。

---

## 25. 实现位置

博客仓库：`~/gongshangzheng.github.io`

- Shortcode 模块：`lib/shortcodes/plots.js`
- 按需资产注入：`lib/plot-assets.js`
- JSXGraph runtime：`assets/js/jsxgraph-runtime.js`
- functionplot runtime（旧）：`assets/js/functionplot-runtime.js`
- 共享样式：`assets/css/plots.css`
- 测试：`tests/plot-assets.test.js`、`tests/replace.test.js`

---

## 26. 修改检查清单

1. `npm test` + `node build.js`
2. 改 shortcode 语法时同步更新 `syntax.md` 与课程模板说明
3. 不要误提交无关未跟踪页面
4. 新写的 JSXGraph 图至少手动检查：
   - 是否遮挡正文
   - slider 是否挡住曲线
   - 缩放后是否仍可读
   - 图内是否错误依赖 LaTeX
