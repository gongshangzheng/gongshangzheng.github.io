# 第一篇自绘图来源记录

三图均为本次独立绘制的教学示意，不是转载或描摹某幅原图，不含论文实验数据。SVG为可编辑源文件，WebP用于草稿展示。初版使用rsvg-convert；2026-10-28修订版使用scientific-svg的inspect、compose与CairoSVG export，并逐张视觉检查；不使用AI生图。

依据：Shazeer, Fast Transformer Decoding, 1911.02150v1，Background / Incremental attention，https://arxiv.org/abs/1911.02150v1 ；Kwon et al., PagedAttention, 2309.06180v1，Background / LLM Service & Autoregressive Generation，https://arxiv.org/abs/2309.06180v1 。原文已在对应raw packet提取和阅读，图注与正文链接这些来源。没有套用论文原图图号。

- `causal-attention-matrix.svg` / `.webp`：A–D的因果可见性；行=Q位置，列=K/V位置，蓝=旧依赖，橙=新位置，×=不可见。不是attention权重热力图。固定参数及一致位置处理是复用条件。
- `kv-cache-state-steps.svg` / `.webp`：单层单头、prefill后3位置、decode后4/5位置；明确本轮新算Q/K/V和下一token的区别。蓝=复用，橙=新算，紫=当前query。Prefill所有输入位置都算Q，图中只展开末尾输出路径。
- `kv-cache-recompute-comparison.svg` / `.webp`：相同上下文的重复K/V相关状态计算对照；不代表完整FLOPs或加速倍数，不声称缓存省去历史读取。已置于第二节。

草稿使用路径为 `drafts/assets/kv-cache-fundamentals/`，最终发布目录和排版待文章阶段确定。移动端可读性尚需在实际文章布局检查；不能以当前桌面渲染替代发布验证。

## scientific-svg 修订记录（2026-10-28）

因果图统一两侧格距，用虚线框标出相同的旧依赖区域；屏蔽符号使用几何线条。状态图拆开Q/K点积与softmax、V加权求和；每个面板标注输入、缓存内容和尚未处理的下一token。对照图统一格距及真正的向量下标。颜色继续表示状态来源，不代表attention强弱；每一格的含义见各图图注。

状态图底部公式由 `source/attention.txt` 经LaTeX与dvisvgm生成矢量路径，完整TeX保留在 `source/attention.tex`；公式不依赖SVG原生解析LaTeX。普通中文与标签仍是可编辑text；短下标用显式坐标，避免本次CairoSVG对baseline-shift的显示差异。公式路径须修改TeX后重新生成，不应当作可直接编辑的公式文字。

`source/kv-cache-state-steps-base.svg` 是可编辑底图，`source/state-composition.json` 记录底图及公式位置；同目录的 `attention.svg` 为公式组件。组合产物为上级目录 `kv-cache-state-steps.svg`。重建时向一个新的输出路径运行compose，检查后再替换现有产物，工具拒绝覆盖不应通过删除唯一源文件来规避。

本次检查：三图inspect通过；LaTeX公式编译及compose通过；CairoSVG以180mm宽、180dpi输出PNG，逐张检查字形、下标、连线、公式与边界后转无损WebP。当前Python 3.12环境使用每条命令的 `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib`，doctor确认CairoSVG可用；这是本机配置，不是通用依赖路径。LaTeX与dvisvgm由本地TeX Live提供。

本轮导出曾出现圈号、箭头、希腊字母及乘号缺字，以及baseline-shift未正确下移；已改为普通编号、原生几何符号、明确坐标下标与公式路径，检查最终导出无缺字。结构检查不替代渲染检查。正文移动端排版尚未实施：三栏状态图在窄屏应允许放大查看或按步骤拆图，不宣称缩到手机宽后小字仍可读。

## 张量形状图

`attention-matrix-shapes.svg` / `.webp`：Luna起草、主agent复核修订的原生SVG教学图。参考用户提供的矩阵方块示例布局，重新绘制；不嵌入截图。依据MQA Background与PagedAttention Background，4位置/3维及decode5位置均为教学假设。矩阵为逻辑形状，完整scores/weights不要求物化。所有普通文字与方块均可编辑；本图没有复杂LaTeX路径组件。CairoSVG导出检查及SVG inspect通过。


## 多头与多层Decoder补图

- `multihead-kv.svg/.webp`：原创矩阵教学图，4头、4位置、每头2维；拼接后4×8，输出投影8×8。依据Transformer与MQA。
- `decoder-stack.svg/.webp`：复用用户本地`transformer-svg/architecture.svg`与`draw_transformer.py`的模块视觉元素，改编为三层decoder-only Post-LN示意，去除cross-attention；每层独立K/V，当前D预测E。保留绘图源`draw_decoder.py`于草稿资产。
- 以上均为教学假设，不是模型实测数据。

- 2026-10-28：用户确认Decoder第二版；替换为`review-2026-10-28/revisions/decoder-stack-v2.svg`。层间留白70px，两条残差支路分别在主干加号汇合，再进入LayerNorm；主agent已检查完整图与局部预览。

- 2026-10-28：按用户要求安装审阅目录中的multihead-kv修订版，修复文字边界或线路重叠；同步SVG与无损WebP。

- 2026-10-28：按用户要求安装审阅目录中的kv-cache-state-steps修订版，修复文字边界或线路重叠；同步SVG与无损WebP。
