/*
 * 控制类 2014/2/28
 */
Controls = function( camera, renderer ) {
	this.control = null;
	this.camera = camera;
	this.rendererDom = renderer;

	this.ROTATE_SPEED = .5;		//...这两个属性要加入到配置中吗？
	this.ZOOM_SPEED = 1;
}
Controls.prototype = new Sim.Publisher;
Controls.prototype.init = function() {
	var conf = {
		type: 'OrbitControls',
		//...能不能带name属性
		zoom: true,
		pan: true,
		autoRotate: true,
		maxDistance: 100000,
		minDistance: 1,
		minPolarAngle: 0,	// radians
		maxPolarAngle: Math.PI,	// radians
		//position: [ 0, 0, 10],	//...这个属性不可用吧！
		//up: [0, 1, 0]
	};

	var controls = new THREE[conf.type]( this.camera, this.rendererDom );

	controls.rotateSpeed = this.ROTATE_SPEED;
	controls.zoomSpeed = this.ZOOM_SPEED;
	controls.noZoom = !conf.zoom;
	controls.noPan = !conf.pan;
	/** OrbitControls only **/
	controls.autoRotate = conf.autoRotate;	
	controls.minDistance = conf.minDistance;
	controls.maxDistance = conf.maxDistance;
	controls.minPolarAngle = conf.minPolarAngle;
	controls.maxPolarAngle = conf.maxPolarAngle;

	//controls.staticMoving = false;	//OrbitControls|TrackballControls 对 自动旋转的命名好像都不一样
	//controls.keys = [ 65, 83, 68 ];	//OrbitControls|TrackballControls 对 keys 的处理都不一样
	

	this.control = controls;
	var _this = this;
	this.rendererDom.addEventListener( 'mousedown' ,function(){_this.onMouseDown.call(_this)}, false);
	this.rendererDom.addEventListener( 'mousewheel' ,function(){_this.onMouseDown.call(_this)}, false);

	if( Plane.confControl )
		this.config();
	else
		this.subscribe('confLoaded', this, this.config );

	return this.control;
}

Controls.prototype.config = function() {
	//console.log('Config control [编辑模式]');
	var config = Plane.confControl;
	if( Hps.isObjEmpty(config) )	return;
	var control = this.control;

	//type...如何编辑 : 考虑到一些想要的功能，暂时限制控制类型为 OrbitControls

	if( config.zoom !== undefined ) {
		control.noZoom = !config.zoom;
	}
	if( config.pan !== undefined ) {
		control.noPan = !config.pan;
	}
	if( config.autoRotate !== undefined ) {
		control.autoRotate = config.autoRotate;
	}
	if( config.minDistance !== undefined && config.zoom ) {
		control.minDistance = config.minDistance;
	}
	if( config.maxDistance !== undefined && config.zoom ) {
		control.maxDistance = config.maxDistance;
	}
	if( config.minPolarAngle !== undefined  ) {
		control.minPolarAngle = config.minPolarAngle;
	}
	if( config.maxPolarAngle !== undefined  ) {
		control.maxPolarAngle = config.maxPolarAngle;
	}
	//position 这个属性现在在 maincamera 中配置了
	// if( config.position.length === 3 ) {
	// 	new TWEEN.Tween( this.camera.position )
	//     .to({
	//         x : config.position[0],
	//         y : config.position[1],
	//         z : config.position[2]
	//     	}, 700)
	//     .easing( TWEEN.Easing.Sinusoidal.Out )
	//     .start();
	// }
}
Controls.prototype.onMouseDown = function( event ) {
	Plane.modelViewer.camera = Plane.modelViewer.userCamera;
	if ( this.control.autoRotate )
		this.delayRotate();
	Plane.modelViewer.feature.reTimeout();	//...这里没考虑feature是惰性初始化的情况啊，一律假设feature是默认加载并初始化的模块
}
Controls.prototype.delayRotate = function() {
	this.control.autoRotate = false;
	if ( this.iiiii )
		clearTimeout(this.iiiii);
	var _this = this;
	this.iiiii = setTimeout(function() {
		_this.control.autoRotate = true;
	}, 60000);
}
