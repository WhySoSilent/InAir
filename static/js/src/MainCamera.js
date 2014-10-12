/*
 * 主相机类 2014/2/15
 */
MainCamera = function() {
	Sim.Object.call(this);
	this.enable = true;
}
MainCamera.prototype = new Sim.Object;
MainCamera.prototype.init = function( container ) {
	Sim.Object.prototype.init.call(this);

	var conf = {
		name: 'mainCamera',
		position: [ 0 , 0 , 2200 ]	//...testing 1300.333
	};

	var camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 0.1, 100000 );
    camera.name = conf.name;
    camera.position.fromArray( conf.position );

    this.camera = camera;

    if( Plane.confCamera )
		this.config();
	else
		this.subscribe('confLoaded', this, this.config );
	//this.subscribe('loaded', this, this.handleModelLoaded);

    this.setObject3D(camera);
    
    return this;
}
MainCamera.prototype.config = function() {
	//console.log('Config camera [编辑模式]');
	var config = Plane.confCamera;
	if( Hps.isObjEmpty(config) )	return;
	var camera = this.camera;

	if( config.name && config.name !== camera.name )
		camera.name = config.name;
	if( config.position && config.position.length === 3 ) {
		new TWEEN.Tween( camera.position )
	    .to({
	        x : config.position[0],
	        y : config.position[1],
	        z : config.position[2]
	    	}, 700)
	    .easing( TWEEN.Easing.Sinusoidal.Out )
	    .start();
	}
}
MainCamera.prototype.handleModelLoaded = function() {
	//默认相机的进场效果啊
}