/*
 * 默认灯光类 2014/2/15
 */
Lighting = function() {
	Sim.Object.call(this);
	this.enable = true;
}
Lighting.prototype = new Sim.Object();
Lighting.prototype.init = function() {
	var conf = [{
		type: 'PointLight',
		name: '主光',
		color: "#ffffff",	//...什么类型？？
		intensity: 1,
		distance: 0,
		position: [ 100, 10 , 100],
	},{
		type: 'PointLight',
		name: '辅光',
		color: "#ffffff",	//...什么类型？？
		intensity: 1,
		distance: 0,
		position: [ -100, 10 , -100],
	},{
		type: 'AmbientLight',
		name: '环境光',
		color: "#ffffff"
	},{
		type: 'DirectionalLight',
		name: '打光',
		color: "#ffffff",
		intensity: 1,
		position: [ 10, 100 , 10]
	}];

	var lightGroup = new THREE.Object3D();
	lightGroup.name = 'defaultLights';

	this.createLights( conf , lightGroup );

    // //缓存
    // var lightPosGroup = new THREE.Object3D();
    // lightPosGroup.name = 'lightsPosition';
    // for( var i = 0; i < lightGroup.children.length ; i++ ) {
    // 	var obj = new THREE.Mesh(
	   //    new THREE.SphereGeometry(5, 50, 50),
	   //    new THREE.MeshPhongMaterial({color: 0xffffff })
	   //  );
	   //  obj.position.copy( lightGroup.children[i].position );
   	// 	lightPosGroup.add(obj);
    // }
    //lightGroup.add(lightPosGroup);

	Plane.lights = lightGroup.children;
    this.setObject3D( lightGroup );

    if( Plane.confLight )
    	this.config();
    else
    	this.subscribe('confLoaded', this, this.config );

    return this;
}
Lighting.prototype.config = function() {
	//console.log('Config lights [重置模式]');
	if( Plane.confLight.length === 0 ) return;
	var conf = Plane.confLight;

	var lightGroup = this.object3D;
	lightGroup.name = 'confLights';

	for(var i = lightGroup.children.length; i > 0; i-- )
		lightGroup.remove( lightGroup.children[i-1] );
	//console.log('清除默认灯光后，lightGroup 长度为 ' + lightGroup.children.length );
	this.createLights( conf , lightGroup );
	//console.log('重置灯光后，lightGroup 长度为 ' + lightGroup.children.length );
}
Lighting.prototype.createLights = function ( conf , group ) {
	for(var i = 0 ; i < conf.length; i++ ) {
		var data = conf[i];
		var color = Hps.style2hex(data.color);

		if( data.type === 'AmbientLight') {
			var light = new THREE[data.type]( color );
			light.name = data.name;
		}
		if( data.type === 'DirectionalLight' ) {
			var light = new THREE[data.type]( color, data.intensity );
			light.name = data.name;
			light.position.fromArray( data.position );
		}
		if( data.type === 'PointLight' ) {
			var light = new THREE[data.type]( color, data.intensity , data.distance );
			light.name = data.name;
			light.position.fromArray( data.position );
		}

		group.add( light );
	}
}