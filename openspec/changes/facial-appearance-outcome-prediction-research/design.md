## 调研设计

### 目标
建立面部外观条件预测的跨学科论文地图，识别任务定义、数据类型、预测目标、验证方式与主要证据缺口。该阶段是 paper-pool/spine-only 侦察，不做全文系统综述，不产出公开 HTML。

### 研究分支

1. **年龄与生长**：儿童/青少年三维面部生长、成人面部老化、单张二维照片与三维扫描预测的差别；区分横断面人群先验与同人纵向预测。
2. **体重与体型变化**：体重/BMI/脂肪分布与面部软组织形态的关联、减重前后纵向图像，以及生成式模拟；区分统计关联与个体干预结果预测。
3. **治疗与干预**：正畸、正颌/颌面手术、整形/重建及皮肤治疗；区分侧貌/骨骼预测、软组织预测、完整照片级结果生成。
4. **横向方法与证据评估**：2D/3D 输入、条件生成/形变模型、影像配准；数据规模与纵向设计、误差指标、临床评价、外部验证、公平性与不确定性。

### 检索与筛选

- 先用 OpenAlex 扩展跨学科元数据检索；医学临床方向补 PubMed，计算机视觉方向补 IEEE/CVF/ACM 与 arXiv。
- 关键词组合涵盖 `facial aging/age progression/longitudinal facial growth`、`weight change/facial adiposity/weight loss face`、`facial outcome prediction/orthognathic surgery/orthodontic profile/plastic surgery outcome`。
- 去重按 DOI、arXiv ID、标题；记录题名、作者、年份、来源、摘要、URL、研究分支、数据/预测目标、证据类型、初筛判断及可访问全文情况。
- 不将搜索引擎摘要或索引记录视为全文证据；论文池标注预印本与同行评审状态，避免把合成示例误称临床验证。

### 交付物

- `raw/facial-appearance-outcome-prediction/field-map.md`：任务定义、子方向、检索词与范围边界。
- `raw/facial-appearance-outcome-prediction/paper-pool.csv`：分层论文清单与来源链接。
- `raw/facial-appearance-outcome-prediction/search-log.md`：数据库、检索式、日期、筛选与覆盖限制。

### 本阶段不做

不写博客 HTML，不做完整论文深读，不作临床有效性或单人预测能力承诺；若进一步进入深读或发布，需更新/新建相应 OpenSpec 规划并经用户确认。
