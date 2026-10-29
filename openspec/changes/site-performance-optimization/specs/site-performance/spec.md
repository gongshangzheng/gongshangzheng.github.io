# Spec: site-performance

## Purpose

约束站点交付产物在浏览器端的加载成本：单页传输体积、第三方资源的依赖面、共享数据的交付方式，以及图片的响应式与尺寸标注。该 capability 描述用户可观察到的加载行为，以及构建期必须满足的性能门禁。

## ADDED Requirements

### Requirement: 单页传输体积预算

站点交付的每个 HTML 页面在 gzip 压缩后 MUST 不超过 40KB（不含图片、字体等子资源），首页 MUST 不超过 15KB。

#### Scenario: 典型文章页满足预算

- **WHEN** 构建完成后统计任一文章页 HTML 的 gzip 体积
- **THEN** 该体积不超过 40KB

#### Scenario: 首页满足更严格的预算

- **WHEN** 构建完成后统计 `index.html` 的 gzip 体积
- **THEN** 该体积不超过 15KB

#### Scenario: 体积超标时构建门禁失败

- **WHEN** 任一页面 gzip 体积超出其预算
- **THEN** 性能门禁脚本以非零退出码报错，并列出超标页面与超标字节数

### Requirement: 第三方资源白名单

页面 MUST 只从白名单域名加载第三方资源。当前白名单仅包含 `cdn.jsdelivr.net`（用于 MathJax 与短代码依赖的 CDN 资源）。任何域名的资源 MUST NOT 出现在页面的阻塞渲染链中。

#### Scenario: 已停服或未使用的第三方域名不再被引用

- **WHEN** 构建产物被扫描 head 与 body 中的外部 `src`/`href`
- **THEN** 不出现 `cdn.tailwindcss.com` 与 `chinese-fonts-cdn.deno.dev`

#### Scenario: 新增未登记域名被拦截

- **WHEN** 某次改动引入了不在白名单内的第三方域名
- **THEN** 性能门禁脚本报错并指明该域名与所在页面

### Requirement: 重型脚本按需注入

渲染成本高的第三方脚本 MUST 只注入到实际使用其能力的页面。代码高亮脚本 MUST 仅在页面含代码块时注入；数学排版脚本 MUST 仅在页面正文含数学标记时注入。

#### Scenario: 无代码块的页面不加载高亮脚本

- **WHEN** 页面正文不含 `<pre><code` 元素
- **THEN** 页面不包含代码高亮库的 `script` 与 `link` 标签

#### Scenario: 无数学内容的页面不加载数学排版脚本

- **WHEN** 页面正文不含行内或块级数学标记
- **THEN** 页面不包含数学排版脚本的 `script` 标签

### Requirement: 分类导航单份共享交付

全站分类导航数据 MUST 以单个共享资源交付，MUST NOT 逐页内联序列化。页面 MUST 在用户打开 Categories 面板时才请求该资源，且同一会话内跨页面复用同一份缓存。

#### Scenario: 页面不内联整棵分类树

- **WHEN** 检查任一页面 HTML
- **THEN** 页面中不含序列化的完整分类树数据，分类导航容器为空占位

#### Scenario: 首次展开时才加载分类数据

- **WHEN** 用户打开某页面的 Categories 面板
- **THEN** 浏览器发出一次对共享分类数据的请求，并渲染出完整分类树

#### Scenario: 跨页面导航不重复下载

- **WHEN** 用户在同一会话内从一篇文章导航到另一篇文章并再次打开 Categories 面板
- **THEN** 不产生新的分类数据网络请求

### Requirement: 跨文引用在构建期解析

形如按标题引用的跨文链接 MUST 在构建期解析为最终 `href`，页面 MUST NOT 内联全站文章索引数据用于运行时解析。

#### Scenario: 交叉引用链接可直接跳转

- **WHEN** 用户点击正文中的跨文引用链接
- **THEN** 浏览器直接跳转到目标文章，无需等待运行时索引加载

#### Scenario: 目标不存在时的降级

- **WHEN** 某条按标题引用的跨文链接在构建期找不到目标文章
- **THEN** 构建输出警告并保留原始文本，且不产生死链 `href`

### Requirement: 图片响应式与尺寸标注

正文图片 MUST 以响应式方式交付：宽度超过 1600px 的图片 MUST 提供多档候选源，并声明布局宽度提示。所有图片 MUST 标注固有 `width` 与 `height`。首屏主图 MUST 以高优先级加载，非首屏图片 MUST 延迟加载。

#### Scenario: 大图提供多档候选源

- **WHEN** 页面引用一张固有宽度超过 1600px 的图片
- **THEN** 该 `img` 元素带有至少两档 `srcset` 候选与 `sizes` 声明

#### Scenario: 图片标注固有尺寸

- **WHEN** 构建产物被扫描所有 `img` 元素
- **THEN** 每个 `img` 元素都带有非空的 `width` 与 `height` 属性

#### Scenario: 首屏主图优先加载

- **WHEN** 页面含有首屏主图（hero）
- **THEN** 该图带高优先级加载提示，且不带延迟加载属性

### Requirement: 交付体积上限

站点交付产物总大小 MUST 保持在 1GB 以内，以满足托管平台的发布体积限制。任何单张交付图片 MUST 不超过 2MB。

#### Scenario: 产物总体积在限制内

- **WHEN** 构建完成后统计交付目录总大小
- **THEN** 总大小不超过 1GB

#### Scenario: 单图体积超限被标记

- **WHEN** 某张交付图片体积超过 2MB
- **THEN** 性能门禁脚本列出该文件路径与体积

### Requirement: 性能门禁接入测试流程

上述约束 MUST 由可重复执行的校验脚本覆盖，并在项目的默认测试流程中运行。

#### Scenario: 默认测试流程覆盖性能门禁

- **WHEN** 执行项目默认测试命令
- **THEN** 性能门禁作为其中一步运行，并在任一约束不满足时使测试失败
