# KV Cache SVG 候选图审阅

状态：等待用户确认。此目录中四张候选图均未插入正文，已发布的SVG/WebP保持原样。第一章文字结构已在本地调整。

## 新增带宽对比

[预览](bandwidth-preview.png) · [SVG](bandwidth.svg)

假设单请求、32层、8KV头、每头128维、FP16每元素2字节：当前输入token全部层K/V新增128KiB，32768个历史位置共4GiB，单次历史逻辑扫描/新KV写入比32768:1。图形不按面积比例，未将预测的下一个token误画成已缓存，也不将逻辑扫描当成HBM实测。

## 修订一：多头注意力

[预览](revisions/multihead-kv-preview.png) · [SVG](revisions/multihead-kv.svg)

原底部说明文字右端1570.38px，外框右端1548px，超框22.38px。现同字号拆行，末行右端1330.82px；背景补齐到1360px，消除原底部80px透明区。矩阵格数、形状和颜色语义不变。

## 修订二：多层Decoder

[预览](revisions/decoder-stack-preview.png) · [SVG](revisions/decoder-stack.svg)

原缓存框分别延伸到y=730/1110/1490，越出所属层背景底界692/1072/1480。修订后背景只围住主干，状态标记留在左侧，独立缓存框留在右侧。主agent亲自细调主干背景范围，补上加号节点与归一化块之间的连接，清除遮盖式重复标签，拉开write K/V与虚线间距，并将图内来源制作措辞改成模型结构说明。

## 修订三：缓存步骤

[预览](revisions/kv-cache-state-steps-preview.png) · [SVG](revisions/kv-cache-state-steps.svg)

原Q输入与权重输出两条路径在同一竖线方向上只隔2px，视觉上容易认成同一条支路。主agent亲自分开入口/出口高度与走线，使Q进入点积/softmax块，而权重从该块输出后与V一起进入加权汇总。底部公式组件及三轮时序保持不变。

## 其他三张原图

attention-matrix-shapes、causal-attention-matrix、kv-cache-recompute-comparison：已逐张查看实际渲染并检查文字边界，当前未发现需要修订的越界或碰撞，保持原样。结构检查不是审美合格证明；本次另有主agent的实际渲染复核。

## 文件与复现

[修改前后局部对比](before-after-details.png)。originals保存三张原始SVG；revisions保存候选源与预览。draw_bandwidth.py与revisions/draw_decoder.py相对脚本位置生成SVG；repair_matrices.py使用originals中的源；repair_state_paths.py从旁边保留的原组件重建候选底图，公式源与组合配置在revisions/source。

## Decoder 第二轮修订：加号回到主干

用户指出层间距与残差端点仍不清楚。主agent重新绘制[SVG候选](revisions/decoder-stack-v2.svg)、[完整预览](revisions/decoder-stack-v2-final-preview.png)和[单层局部预览](revisions/decoder-stack-v2-detail.png)。三层卡片各高560px、相隔70px。每个子层输入在主干实心点分叉，紫色旁路绕过子层，在主干圆圈加号处与子层输出汇合，再经LayerNorm；不再把加号挂在归一化块左侧。旧候选保留，新候选仍未插入正文。

## Decoder第二版已确认

用户明确同意更新正文配图。已安装decoder-stack-v2到正文与草稿资产，其他候选图仍待确认。

图2多头注意力、图6缓存步骤已按用户本轮明确要求安装修订版，带宽新增图仍待确认。
