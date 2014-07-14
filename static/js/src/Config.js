/*
 * 配置
 * 2014/3/10
 */
Config = function() {
	this.conf = null;

	this.configed = false;
	this.changed = false;
	this.cache = [[/* whitchConf */],[/* newValueJson */],[/* 计时器对象 */]];

	// 隐性添加的属性
	//this.updateStatus
	//this.reUpdateTimerInterval
}
Config.prototype = new Sim.Publisher;
Config.prototype.init = function() {
	var _this = this;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if( xhr.readyState == 4 ) {
			if( xhr.status == 200 || xhr.status == 0 ) {
				_this.conf = xhr.responseText.length !== 0 ? JSON.parse( xhr.responseText ) : null;
				_this.config();
			}
			if( xhr.status == 404 ) {
				_this.conf = null;
				_this.config();
			}
		}
		//... config请求出错状态没处理
	}

	xhr.open( "GET", '/api/models/' + Plane.modelId + '/conf', true );
	//xhr.open( "GET", '/data/models/' + Plane.modelId + '/conf.JSON', true );
	xhr.setRequestHeader("Content-Type","application/json;charset=utf8");
	xhr.send( null );

	// $.ajax({
	// 	url: '/api/models/' + Plane.modelId + '/conf',
	// 	type: 'GET',
	// 	contentType: 'application/json;charset=utf8',
	// 	success: function(data) {
	// 		_this.conf = data;
	// 		console.log(_this.conf);
	// 		_this.config();
	// 	},
	// 	error: function() {
	// 		_this.conf = null;
	// 		_this.config();
	// 	}
	// });

	Plane.config = this;

	//...test
	this.conf22 = {
		scene: {},
		material: [{},
		{
			DbgName : 'name',
			shading : 'lambert',
			colorDiffuse : [ 0.3, 0.3, 0.9],
			transparency : 0.0,
			colorAmbient : [ 0.1, 0.1, 0.1],
			reflectivity : .5,
			specularCoef : 30,
			visible : true,
			mapDiffuse : null,
			mapBump : null,
			mapNormal : null,
			mapSpecular : null,
			mapEnv : true
		},{},{},{},{},{},{},{
			transparency : 0.8,
			reflectivity : 1,
			mapEnv : true
		},{},{
			transparency : 0.0
		}],
		light: this.defaultLight(),
		camera: {
			name: 'oneCamera',
			position: [ 1, 1, 10]
		},
		control: this.defaultControl()
	}
	
	////...testing
	//var that = this;
	// setTimeout(function() {
	// 	that.config();
	// }, 5000);
	//this.conf = null;
	//this.config();
	return this;
}
Config.prototype.config = function() {
	if( this.conf ) {
		Plane.confMaterial =  this.conf.material || [];
		Plane.confLight = this.conf.light || this.defaultLight();
		Plane.confCamera = this.conf.camera || this.defaultCamera();
		Plane.confControl = this.conf.control || this.defaultControl();
		Plane.confFeature = this.conf.feature || this.testFeature(); //{ features: [], focus: [] };
		Plane.confBackground = this.conf.background || this.defaultBackground();
		Plane.confEnvironment = this.conf.environment || this.defaultEnvironment();
	} else {
		this.conf = {};
		Plane.confMaterial = [];
		Plane.confLight = this.defaultLight();
		Plane.confCamera = this.defaultCamera();
		Plane.confControl = this.defaultControl();
		Plane.confFeature = this.testFeature(); //{ features: [], focus: [] };
		Plane.confBackground = this.defaultBackground();
		Plane.confEnvironment = this.defaultEnvironment();
	}
	//每个配置都必须在一个具体的位置
	this.conf.material = Plane.confMaterial;
	this.conf.light = Plane.confLight;	//...!!!
	this.conf.camera = Plane.confCamera;
	this.conf.control = Plane.confControl;
	this.conf.feature = Plane.confFeature;
	this.conf.background = Plane.confBackground;	//没触发配置动作...
	this.conf.environment = Plane.confEnvironment;	//没触发配置动作...

	Plane.conf = this.conf;

	this.publish('confLoaded');
	this.configed = true;
	this.publish('configed');
}
Config.prototype.defaultLight = function() {
	return [{
		type: 'PointLight',
		name: '主光(点光)',
		color: "#ffffff",	//...什么类型？？
		intensity: 1,
		distance: 0,
		position: [ 100, 10 , 100],

	},{
		type: 'PointLight',
		name: '辅光(点光)',
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
		name: '打光(平行光)',
		color: "#ffffff",
		intensity: 1,
		position: [ 10, 100 , 10]
	}];
}
Config.prototype.defaultCamera = function() {
	return {
		front: 1,
		back: 1000,
		fog: 1,
		position: [0,0,100],
		up: [0,1,0],
		lookAt: [0,0,0]
	}
}
Config.prototype.defaultControl = function() {
	return {
		type: 'OrbitControls',
		zoom: true,
		pan: true,
		autoRotate: true,
		maxDistance: 100000,
		minDistance: 1,
		minPolarAngle: 0,	// radians
		maxPolarAngle: Math.PI	// radians
	};
}
Config.prototype.testFeature = function() {
	return [
		{
			title: 'Feature one',
			des: 'Describe feature one here...',
			focus: {
				position: [[-5.02, 11.21, 99.24],[-5.02, 11.21, 30.24]],
				lookAt: [[0,0,0],[0,0,0]],
				up: [[0,1,0],[0,1,0]],
				periodTime: 2000
			}
		},
		{
			title: 'Feature two',
			des: 'Describe feature two here...',
			focus: {
				position: [[-1.35, 2.89, 23.56],[-10.35, 3.89, 20.56]],
				lookAt: [[0,0,0],[0,0,0]],
				up: [[0,1,0],[0,1,0]]
			}
		},
		{
			title: 'Feature three',
			des: 'Describe feature three here...',
			focus: {
				position: [[32,32,50],[40,55,21]],
				lookAt: [[0,0,0],[0,0,0]],
				up: [[0,1,0],[0,1,0]],
				periodTime: 700
			}
		}
	];
	// return {
	// 	features: [
	// 		{ title: '更强的大脑', des: '新的产品拥有最新最快的大脑'},
	// 		{ title: '更快的速度', des: '速度比上一代提高了两倍之多'},
	// 		{ title: '更便宜', des: '仅为上一代产品的一半'}
	// 	],
	// 	focus : [
	// 		{ position: [-5.02, 11.21, 99.24], lookAt: [0,0,0]},
	// 		{ position: [-1.35, 2.89, 23.56], lookAt: [0,0,0]},
	// 		{ position: [-1.82, 8.95, 21.95], lookAt: [0,0,0]}
	// 	]
	// }
}
Config.prototype.defaultBackground = function() {
	return {
		type: "color",
		color: '#eeeeee',
		image: '/data/models/blackberry/background/bg.jpg'
	}
}
Config.prototype.defaultEnvironment = function() {
	return {
		enable: false,
		type: 'skybox',
		skybox: '',
		size: 100000
	}
}

//非暴露代码
Config.prototype.edit = function( newValueJson , whitchConf , rightNow ) {
	//0. 修改面板的任何操作都会提交到这里
	//1. 如果是一个频繁编辑，先延迟N毫秒处理
	//2. 若非频繁操作，直接提交更改
	if ( rightNow !== undefined ? rightNow : true ) {
		//console.log('我要修改配置对象 : ' + JSON.stringify(whitchConf));
		this.set( newValueJson, whitchConf );
		//触发自动保存，并不是立即保存
		this.autoSave();
	} else {
		var indexInCache = this.cache[0].indexOf( whitchConf );
		if ( indexInCache === -1 ) {
			this.cache[0].push( whitchConf );
			this.cache[1].push( newValueJson );
			//...推迟这个属性的这次计时
		} else {
			this.cache[1][indexInCache] = newValueJson;
		}
	}
}
Config.prototype.set = function( json, context ) {
	//1. 更新配置文件
	//2. 若真的发生了实质修改，标记 changed 为 true

    if ( json == undefined ) return;
    if ( context === undefined )
    	context = this.conf;

    for ( var key in json ) {
        var newValue = json[key];	//[]
        var currentValue = context[key];	{}

        if( newValue === undefined )
            continue;
        //普通值可以直接赋值
        if ( !( newValue instanceof Object ) ) {
            context[key] = newValue;
            this.changed = true;
            continue;
        }
        //对象或者数组就要迭代调用

        //如果被赋值对象不存在
        if ( currentValue === undefined ) {
            context[key] = ( newValue instanceof Array ) ? [] : {};
            this.set( newValue, context[key]);
            continue;
        }
        //又或者不是要求的数组
        if ( ( newValue instanceof Array ) && !( currentValue instanceof Array) ) {
        	context[key] = [];
        	this.set( newValue, context[key]);
        	continue;
        }
        //或者存在，但不是要求的对象,而是一个数组
        if ( !( newValue instanceof Array ) && ( newValue instanceof Object ) && ( currentValue instanceof Array) ) {
        	context[key] = {};
        	this.set( newValue, context[key]);
        	continue;
        }

        this.set( newValue, context[key]);
    }
}
Config.prototype.autoSave = function( interval ) {
	//1.重置定时器,准备N秒后提交
	//if ( !this.changed ) return;	//...到底是不是在这里
	if( this.autoSaving )
		clearTimeout(this.autoSaving);
	var _this = this;
	this.autoSaving = setTimeout( function(){_this.updateToServer.call(_this);} , interval || 5000 );	//...这里我又不能确信上下文是怎么回事了
}
Config.prototype.updateToServer = function(contex) {
	//1. 提交到服务器
	//2. 更新成功则把计时器停掉,同时标记changed 为 false
	//3. 更新文字状态

	//if ( this.conf ) return;
	if ( !this.changed ) return;	//...到底是不是在这里

	if ( this.updateStatus === undefined )		//... 放在这个位置有点诡异
		this.updateStatus = new UpdateStatus();
	this.updateStatus.confUpdateStart();

	var _this = this;
	$.ajax({
		url : '/api/models/' + Plane.modelId + '/conf',
		type : 'POST',
		data : JSON.stringify( this.conf ),
		contentType : 'application/json',
		processData : false,
		statusCode : {
			200 : function ( res, stausText, xhr ) {
				//console.log('配置更新成功');
				_this.changed = false;
			},
			400 : function () {
				//alert('更新配置遇到问题 : 400 BAD_REQUEST');
			}
		},
		success : function () {
			_this.updateStatus.confUpdateSucess();
		},
		error : function ( xhr, statusText, err ) {
			//StatusCode=2xx或304时执行success, 其余则将触发error
			_this.updateStatus.confUpdateError();
			//设置一次重新提交的尝试
			if( _this.reUpdateTimerInterval === undefined )
				_this.reUpdateTimerInterval = 2000;
			if ( _this.reUpdateTimerInterval > 8000 ) {
				alert("遇到问题，所做的修改无法提交...");
				_this.reUpdateTimerInterval = undefined;
				return;
			}
			_this.autoSave.call(_this, _this.reUpdateTimerInterval += 1000 );
		}
	});
}
//feature 的新增，是一个先添加再编辑的过程
Config.prototype.emptyFeature = function() {
	var positionNow = Plane.modelViewer.userCamera.position.toArray();
	var positionNow2 = [ positionNow[0] + 5, positionNow[1] + 5, positionNow[2] + 10];

	return {
		title : 'Feature newone',
		des: 'Describe this new feature here...',
		focus: {
			position: [ positionNow, positionNow2 ],
			lookAt: [[0,0,0],[0,0,0]],
			up: [[0,1,0],[0,1,0]],
			periodTime: 2000
		}};
}
Config.prototype.setChanged = function() {
	this.changed = true;
	this.autoSave();
}