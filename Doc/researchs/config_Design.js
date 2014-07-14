/*
 * config文件
 * 2014/3/10
 */
{
	scene: {},
	material: [],
	lights: [],
	camera: {},
	control: {}
}

/*
 * 材质配置
 *
 */
[{
	DbgName : 'name',
	shading : 'phong',
	colorDiffuse : [ 0.9, 0.3, 0.3],
	transparency : 0.2,
	colorAmbient : [ 0.4, 0.4, 0.4],
	reflectivity : 1,
	shininess : 30,
	visible : true,
	mapDiffuse : null,
	mapBump : null,
	mapNormal : null,
	mapSpecular : null,
	mapEnv : null
}]
/*
 *	照明配置
 *
 */
[{
	type: 'PointLight|DirectionalLight|AmbientLight',
	name: '灯光名称',
	color: '#ffffff',
	intensity: 1,			//AmbientLight 光源无
	distance: 0,			//AmbientLight 光源无	DirectionalLight 光源无
	position: [ 1, 2, 5]	//AmbientLight 光源无
}]

/*
 *	相机配置
 *
 */
{
	name: 'mainCamera',
	position: [ 0 , 0 , 1300.333 ]
}

/*
 * 控制配置
 * 2014/3/10
 *
 */
{
	type: 'TrackballControls',
	//...能不能带name属性
	zoom: true,
	pan: true,
	maxDistance: 100,
	minDistance: 1,
	position: [ 0, 0, 10],	//...这个属性不可用吧！
	up: [0, 1, 0]
}
