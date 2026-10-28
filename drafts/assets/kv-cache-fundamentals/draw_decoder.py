from xml.etree.ElementTree import Element, SubElement, register_namespace, tostring
register_namespace('', 'http://www.w3.org/2000/svg')
NS='http://www.w3.org/2000/svg'
W,H=1650,1700
svg=Element(f'{{{NS}}}svg',{'width':str(W),'height':str(H),'viewBox':f'0 0 {W} {H}'})
def add(tag,**attrs): return SubElement(svg,f'{{{NS}}}{tag}',{k.replace('_','-'):str(v) for k,v in attrs.items()})
def text(x,y,t,size=20,fill='#243449',anchor='start',weight='normal',family='Hiragino Sans GB, Arial, sans-serif'):
 e=add('text',x=x,y=y,font_family=family,font_size=size,fill=fill,text_anchor=anchor,font_weight=weight); e.text=t; return e
def rect(x,y,w,h,fill,stroke='#708095',rx=10,width=2,dash=None):
 a={'x':x,'y':y,'width':w,'height':h,'rx':rx,'fill':fill,'stroke':stroke,'stroke_width':width}
 if dash:a['stroke_dasharray']=dash
 return add('rect',**a)
def path(d,color='#42566c',width=3,dash=None,arrow=True):
 a={'d':d,'fill':'none','stroke':color,'stroke_width':width,'stroke_linecap':'round','stroke_linejoin':'round'}
 if dash:a['stroke_dasharray']=dash
 if arrow:a['marker_end']='url(#arr-'+('blue' if color=='#2563a6' else 'orange' if color=='#c87522' else 'dark')+')'
 return add('path',**a)
def centered(cx,cy,label,size=20,fill='#243449',weight='bold'):
 return text(cx,cy,label,size,fill,'middle',weight)
def math_label(x,y,base,index,kind='sub',color='#243449',size=22):
 # native text with separately positioned index glyphs
 text(x,y,base,size,color,'start','bold')
 if kind in ('sub','both'): text(x+16,y+7,index,13,color,'start','bold')
 if kind in ('sup','both'): text(x+16,y-12,index,13,color,'start','bold')
def arrow_head_defs():
 defs=add('defs')
 for name,color in [('dark','#42566c'),('blue','#2563a6'),('orange','#c87522')]:
  m=SubElement(defs,f'{{{NS}}}marker',{'id':'arr-'+name,'viewBox':'0 0 10 10','refX':'9','refY':'5','markerWidth':'8','markerHeight':'8','orient':'auto'})
  SubElement(m,f'{{{NS}}}path',{'d':'M0 0L10 5L0 10Z','fill':color})
arrow_head_defs()
rect(0,0,W,H,'#ffffff','none',0,0)
add('title').text='Decoder-only causal Transformer 的三层 KV 缓存示意'
add('desc').text='三层 Post-LN decoder-only示意。D的隐藏状态逐层向上流动，每层Masked MHA使用本层独立的A、B、C历史K/V和当前D的K/V。预测E后E还未进入缓存。'
text(58,62,'Decoder-only：三层各自保存 KV 缓存',38,weight='bold')
text(58,103,'简化示意：每层显示一个 KV 头；A、B、C 是已处理历史，D 是当前输入。',22,fill='#596b80')
# legend arrows
path('M62 151H132',color='#42566c',width=3);text(148,158,'隐藏状态流',18)
path('M328 151H398',color='#c87522',width=3,dash='9 6');text(414,158,'本层写入 K/V',18)
path('M605 151H675',color='#2563a6',width=3,dash='3 6');text(691,158,'本层读取 K/V',18)
text(975,158,'方框颜色：蓝色为历史 ABC，橙色为当前 D。',17,fill='#596b80')
# decoder-only/post-LN variant band
rect(58,184,1534,66,'#f4f7fb','#d4dde8',12,1.5)
text(82,213,'Decoder-only causal stack；不含 cross-attention。',18,weight='bold')
text(82,238,'这里沿用源图的 Post-LN 视觉作为一种示意变体；现代 LLM 常见 Pre-LN，本图不代表通用配置。',17,fill='#596b80')
# define layer component tops and state outputs, bottom-to-top information flow
layers=[
 {'ell':'1','mha':1360,'an1':1278,'ffn':1180,'an2':1094,'out':1064,'inp':1452},
 {'ell':'2','mha':980,'an1':898,'ffn':800,'an2':714,'out':684,'inp':1072},
 {'ell':'3','mha':600,'an1':518,'ffn':420,'an2':334,'out':304,'inp':692},
]
center=555; bx=360; bw=400
# backdrop cards for layers
for L in layers:
 y={'3':280,'2':692,'1':1072}[L['ell']]
 height={'3':412,'2':380,'1':408}[L['ell']]
 rect(58,y,1534,height,'#fbfcfe','none',16,0)
 text(82,L['mha']+28,f"Layer {L['ell']}",20,fill='#596b80',weight='bold')
# blocks and state arrows
for L in layers:
 m=L['mha']; n1=L['an1']; f=L['ffn']; n2=L['an2']; ell=L['ell']
 # state input connector into attention
 path(f'M{center} {L["inp"]}V{m+68}',color='#42566c',width=3)
 rect(bx,m,bw,68,'#d9eaf9','#708095',10,2)
 centered(center,m+28,'Masked MHA',22,weight='bold')
 # label qD with explicit D subscript; plus explanatory line
 math_label(bx+20,m+53,'q','D','sub',size=18)
 text(bx+53,m+53,f"来自 h(D,{int(ell)-1})；本层 K/V 投影",15,fill='#42566c')
 # MHA to AddNorm
 path(f'M{center} {m}V{n1+50}',color='#42566c',width=3)
 rect(bx,n1,bw,50,'#fef1d7','#708095',9,2)
 centered(center,n1+31,'Add & LayerNorm  (Post-LN)',18)
 # residual bypass from input state around MHA to plus node
 xskip=285; plus_y=n1+25
 path(f'M{center} {L["inp"]}H{xskip}V{plus_y}H{bx-13}',color='#8794a5',width=2.2,arrow=True)
 add('circle',cx=bx-22,cy=plus_y,r=13,fill='#ffffff',stroke='#8794a5',stroke_width=2)
 centered(bx-22,plus_y+7,'+',19,weight='normal')
 # AddNorm output to FFN, then AddNorm
 path(f'M{center} {n1}V{f+64}',color='#42566c',width=3)
 rect(bx,f,bw,64,'#def0e4','#708095',10,2)
 centered(center,f+28,'Position-wise FFN',21)
 centered(center,f+51,'同一 FFN 逐位置应用',15,fill='#42566c',weight='normal')
 path(f'M{center} {f}V{n2+50}',color='#42566c',width=3)
 rect(bx,n2,bw,50,'#fef1d7','#708095',9,2)
 centered(center,n2+31,'Add & LayerNorm  (Post-LN)',18)
 # residual bypass from first norm output around FFN
 plus2=n2+25
 path(f'M{center} {n1}H{xskip-24}V{plus2}H{bx-13}',color='#8794a5',width=2.2,arrow=True)
 add('circle',cx=bx-22,cy=plus2,r=13,fill='#ffffff',stroke='#8794a5',stroke_width=2)
 centered(bx-22,plus2+7,'+',19,weight='normal')
 # output state label
 math_label(98,L['out']+7,'h','D','sub',size=22)
 text(118,L['out']+7,ell,13,fill='#243449',weight='bold')
 # from layer output up to next input (for layers 1 and 2), or output head
 if ell!='3':
  nextL=layers[int(ell)]
  path(f'M{center} {n2}V{nextL["inp"]}',color='#42566c',width=3)
# This output label math representation h_D^ell needs explicit index; overwrite visual with annotations correctly positioned.
# output state hD^ell labels at left; index placed as superscript, D subscript.
for L in layers:
 x=98;y=L['out']+7
 # Cover prior simplistic indices with white patch and draw explicit h_D^ell
 rect(x-4,y-26,102,35,'#fbfcfe','none',0,0)
 text(x,y,'h',22,'#243449','start','bold')
 text(x+17,y+7,'D',13,'#243449','start','bold')
 text(x+17,y-11,L['ell'],13,'#243449','start','bold')
# current input token and embedding feed h_D^0.
rect(390,1510,330,50,'#e8e2f6','#708095',10,2)
centered(555,1541,'Token embedding of D',19)
rect(500,1580,110,38,'#fae6d2','#bd6a18',8,1.5)
centered(555,1606,'D',20)
path('M555 1580V1560',color='#42566c',width=3)
path('M555 1510V1452',color='#42566c',width=3)
# input state h_D^0
rect(94,1434,112,34,'#fbfcfe','none',0,0)
text(98,1458,'h',22,'#243449','start','bold');text(115,1465,'D',13,'#243449','start','bold');text(115,1447,'0',13,'#243449','start','bold')
# output head and prediction token E, placed beside the trunk to keep the top note clear.
path('M555 334V304H820',color='#42566c',width=3)
rect(820,274,380,60,'#f5e1e1','#708095',10,2)
centered(1010,311,'Output head → next-token scores',20)
path('M1200 304H1310',color='#42566c',width=3)
rect(1310,285,150,38,'#faebdc','#c5a17a',9,1.5)
centered(1385,311,'预测 E',20)
text(820,373,'若选择 E，它此刻还没有写入任何层的 KV 缓存；',18)
text(820,402,'只有 E 成为下一步输入后，才逐层追加它的 K/V。',18)
# cache cards and two directional arrows per layer
for L in layers:
 ell=L['ell'];m=L['mha']; cx=930;cy=m-20;cw=600;ch=150
 rect(cx,cy,cw,ch,'#ffffff','#34495e',12,2,'8 6')
 text(cx+20,cy+27,f'第 {ell} 层独立 KV 缓存 · 示意一个 KV 头',19,weight='bold')
 # labels K / V with layer superscript-style explicit number
 text(cx+25,cy+70,'K',20,'#243449','start','bold');text(cx+40,cy+59,ell,12,'#243449','start','bold')
 text(cx+25,cy+122,'V',20,'#243449','start','bold');text(cx+40,cy+111,ell,12,'#243449','start','bold')
 for row,yy in [('K',cy+47),('V',cy+99)]:
  for i,tok in enumerate('ABCD'):
   xx=cx+92+i*76
   fill='#d8ebfa' if tok in 'ABC' else '#fae6d2'
   stroke='#2763a6' if tok in 'ABC' else '#bd6a18'
   rect(xx,yy,62,36,fill,stroke,6,1.6)
   centered(xx+31,yy+25,tok,18,weight='bold')
 # cache write: attention input projections to the cache; read: cache back to this MHA.
 path(f'M{bx+bw} {m+26}H{cx-12}',color='#c87522',width=2.8,dash='9 6')
 text(780,m+20,'write K/V',14,'#a75e19')
 path(f'M{cx-12} {m+52}H{bx+bw+8}',color='#2563a6',width=2.8,dash='3 6')
 text(780,m+76,'read K/V',14,'#2563a6')
# explanatory side panel
rect(930,1560,600,96,'#f4f7fb','#d4dde8',12,1.5)
text(952,1590,'A/B/C 在本层的输入已融合更低层的上下文；',17)
text(952,1618,'每层用自己的 Q/K/V 再组合一次，不等同于固定层数的能力结论。',17)
text(60,1656,'A、B、C 分别表示先前位置；本图按单个 KV 头简化，每一层的缓存互不共享。',16,fill='#596b80')
open('/tmp/kv-decoder-stack-luna/decoder-stack.svg','wb').write(tostring(svg,encoding='utf-8',xml_declaration=True))
