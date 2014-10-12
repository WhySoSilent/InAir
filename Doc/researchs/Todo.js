// -------------------- *****
材质混合
材质提醒信息
漫游相机
// -------------------- **
设计新的架构
色盘调色
设计资源图
onmouseclick 延迟自旋
// -------------------- *

/scenes/3L7K6W 计数器	/ 计数器


1、加上百分比加载进度条。
2、去掉渲染状态图标。
   背景音乐图标、特性预览图标加可隐藏选项，默认关闭。
3、全屏改为占满整个显示器屏幕。
4、保存截图功能在色彩背景情况下去掉通道功能，效果应等同于屏幕上显示效果。
5、加一帮助功能按键说明。
6、鼠标交互操作默认打开右键平移功能
7、Scene---Camera，去掉雾功能改为FOV自定义
8、Scene---Camera，把相机初始位置右边的图标改为SAVE文字按钮，建议每组更改项后都有一个保存文字按钮。
9、相机设置一次最近最远距离后不能继续多次更改设置？
10、建议把灯光编辑栏放到Light栏内部，灯光类型中加入HEMISPHERELIGHT及其参数。
11、点击上传贴图图标时打开的菜单，再次关闭时必须点图标内才能关闭，能否在点击图标外的地方同样可以关掉，具有两个以上图标时当点击另外一个上传图标关掉其它已经打开的菜单，使场景中始终保持一个当前弹出菜单。现状在打开DIFFUSE MAP 栏图标后，如果再开其它上专图标，两个弹出菜单之间相互重叠，BUG？
12、Material---渲染，当SHADING之间相互切换时整个窗口有时会死掉。
13、选中相应材质时，模型窗口提醒显示相应材质对应被选模型，在大型复杂场景中此功能尤为重要。
14、材质中所有贴图都加入滑动调节百分比，去掉右边的贴图路径显示，贴图优先级大于色彩。例如：如果把DIFFUSE贴图百分调节为50%时，显示方式应该是50%MAP+色彩
15、色彩选择模式建议参考SKETCHFAB的色轮选择模式，色轮选择效率更高更准确，并建议在设置时画面中的图像同步即时更新。
16、反射率系数扩大到小数点后两位
17、加入Opacity map，些功能在项目中运用也相当重要。
18、前端加入动态材质交互更换功能面板
19、折射率看起来好像没有效果。
20、MAP图像过滤加入NearestFilter，NearestMipMapNearestFilter，NearestMipMapLinearFilter，LinearFilter，LinearMipMapNearestFilter，LinearMipMapLinearFilter所有选项。

第9条不用理会

//loading
//png or jpg snapshot
audio...
chrome检测
载入页面超载情况
background image repeat
link
//feature
//titleIcon
//一定先备份代码
//canvas区域为什么不能截获滚轮了呢
//control 没配置
//访问conf编码问题
如果有空，检查一下conf中的各种属性命名和material文件能否一致

//检查一下加载模块有没有问题呢？？
//feature到底改了没有
feature 锚点和 editer 路由冲突的问题
//Number的问题
//lightMap
贴图过滤这些问题
//检查有没有没有配置的对象，比如group这些
//双镜头的问题
//布局怎么搞定
//Model的配置
代码压缩

model更新测试

"mapLight" : "keyboard_diff.jpg",
"mapLightWrap" : ["repeat", "repeat"],
"shading" : "Lambert",







1. load scenes
	ColladaLoader
	
2. 层级
3. 拾取
4. 控制动画
5. 有没可能做一个 ascii json --> binary json 的工具
6. 

// 灯光配置
// Meta 对象编辑

// 多相机渲染
// 层级动画
// 层级消隐藏
// 材质替换
// 鼠标拾取

// Gzip 压缩
// OrbitControls 移植 TrackballControls 的插值动画

//

--------------------------------

// 背景
		纯色
		图片
		漏光背景
		图案

// 覆盖层
		渐变 + 文字
		模糊层
		半透层
// 信息层
		字幕式
		箭头指向
		带阴影的悬浮
		气泡层
// DOCK
		IOS