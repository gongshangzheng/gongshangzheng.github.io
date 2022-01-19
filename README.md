# Gridea-theme-concise
Concise是一款免费的Gridea主题，首先感谢作者**Alanrk**制作的[Gridea-theme-clean](https://github.com/Alanrk/Gridea-theme-clean) 

>本Theme在[clean](https://github.com/Alanrk/Gridea-theme-clean)的基础上进行魔改并已适配移动端，支持自定义主题配色、valine评论/统计、live2d模型切换等功能；虽偏离了其主题本意，但使用上方便不少；
>>示例网站：[https://daning.netlify.app/](https://daning.netlify.app/)

## 修改内容
    1. 主题-自定义配置-增加Valine评论配置
    2. 主题-自定义配置-增加'关于页面'
    3. 主题-自定义配置-增加live2d看板娘配置
    4. 文章内增加目录索引
    5. 增加封面图显示
    6. 添加模糊搜索
    7. 添加分页页码
    8. 主题-自定义配置-增加主题及自定义颜色

## 预览
- PC端预览
![PC端预览](https://s1.ax1x.com/2020/09/25/09mJlF.png)
- 移动端预览
![移动端预览](https://s1.ax1x.com/2020/09/25/09mUm9.png)
 
## 说明
### 1. live2d

参考了：[gridea-theme-fog](https://github.com/850552586/gridea-theme-fog)
- 模型下载地址: [下载地址](https://gitee.com/ericam/live2d-widget-models)
- 模型样式预览: [预览地址](https://blog.csdn.net/wang_123_zy/article/details/87181892)
- 主题-自定义配置中目前可选2中模型：黑猫和白猫
- 如想修改或者添加模型，有2种方式，最后修改live2d.ejs里引用的model.json即可：
  - 修改：可直接覆盖live2d/assets直接修改，
  - 添加：按照目前结构继续添加（要修改下载下来的目录文件结构，及对应的model.json里相关path）

### 2. ’关于‘页面
需在Gridea客户端-菜单-关于中，将其路径改为'/about'

### 3. 主题色
目前支持’简约白‘和'暗夜黑'两种主题色；

### 4. 自定义主题
在’主题-自定义配置-个性化里面‘开启’个性化‘（开启后设置的默认皮肤会无效），然后在面板选项里自定义配色
![自定义](https://s1.ax1x.com/2020/09/25/09msSO.png)

### 5. Header背景图
可在assets/media/images路径下替换文件home-bg.jpg，替换时请注意保持图片名字不变



