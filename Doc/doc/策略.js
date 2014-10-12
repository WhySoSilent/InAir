//各种贴图和其 enable 的实现
	todo...

//skybox
	enable开光的切换，在确实有 skybox 的时候是

//shading的切换
	模型加载来的时候保存了原始的材质信息
	更换 shading 的时候会选择用那些原始信息让three自己重新创建一个想要类型的材质
	使用 conf 的配置信息，对新创建的材质进行配置(修改)
	调用 Parse 提供的方法重新解析材质信息，(editer面板的数据就会跟新)
