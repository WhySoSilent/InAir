// Animation

1. Morph Animation 				//变形动画
   ---------------------------------------

2. Bones Animation 				//骨骼动画
   ---------------------------------------
   //关节动画的问题是，各部分Mesh中的顶点是固定在其Mesh坐标系中的，这样在两个Mesh结合处就可能产生裂缝

3. SkinnedMesh Animation 	//骨骼蒙皮动画
   ---------------------------------------
   /* 一个SkinnedMesh Animation动画通常包括
    *	1. 骨骼层次结构(Bone Hierarchy)数据
    *	2. 网格(Mesh)数据
    *	3. 蒙皮(skin info)数据
    *	4. 骨骼的动画(关键帧)数据
    *
    *	!!! 在骨骼动画中，骨骼才是模型主体，Mesh不过是一层皮，一件衣服
    *	该动画中Mesh和关节动画不同：关节动画中是使用多个分散的Mesh,而Skinned Mesh中Mesh是一个整体，也就是说只有一个Mesh
    */
   	蒙皮:带有‘蒙皮信息’的Mesh或可当做皮肤用的Mesh，这个皮肤就是Mesh。而为了有皮肤功能，Mesh还需要蒙皮信息，即Skin数据，没有Skin数据就是一个普通的静态Mesh了
   	Skin数据决定顶点如何绑定到骨骼上。顶点的Skin数据包括顶点受哪些
   	骨骼影响以及这些骨骼影响该顶点时的权重(weight)，另外对于每块骨骼
   	还需要骨骼偏移矩阵(BoneOffsetMatrix)用来将顶点从Mesh空间变换到骨骼空间


//
obj/buffalo/buffalo.js
file:///E:/Workspace/Code%20Workspace/three.js-master/examples/webgl_animation_skinning.html

models/skinned/knight.js
file:///E:/Workspace/Code%20Workspace/three.js-master/examples/webgl_animation_skinning_morph.html

models/collada/pump/pump.dae
file:///E:/Workspace/Code%20Workspace/three.js-master/examples/webgl_loader_collada_keyframe.html

models/collada/avatar.dae
file:///E:/Workspace/Code%20Workspace/three.js-master/examples/webgl_loader_collada_skinning.html
