Plane = {
	//元数据
	modelId : getRequest(),
	model: {
		id: getRequest(),
		name: "",
		des: "",
		created: null,
		metadata : null,	//模型的元数据，从模型文件获取
		metaMaterial : null	//模型原始的材质数据
	},	//模型信息

	//操作锚点
	geometry : null,
	materials : null,	//材质集合,用来操作
	lights : [],		//场景内灯光数组，用来操作

	conf: null,
	//配置文件,他们都是 Plane.conf 的属性
	confMaterial : null,
	confLight : null,
	confCamera : null,
	confControl : null,
	confBackground : null,
	confEnvironment : null,

	parsedData : null,	//解析出来的数据，用来初始化ScnenPanel
	editer : null,

	//
	renderStatus: { fps: null, ms: null },
	//持有对象
	config : null		//Config 对象的实例

	//在其他位置隐性添加的属性
	//modelViewer : null,	//ModelViewer 的实例

}

function getRequest() {  
	var s = /\/scenes\/(\w+)/;
	var i = /\/iframe\/(\w+)/;
	if ( s.test( document.URL ) || i.test( document.URL ) ) {
		var modelId = RegExp.$1;
		return modelId;
	}
}

ModelViewer = function() {
	Sim.App.call(this);
	this.version = 1;

	this.camera = null;
	this.control = null;
	this.environment = null;	// skybox || 
	this.bgAudio = null;

	//group 一些对象的插入点，这些容器在里面没有默认对象的情况下不会被置入场景中
	this.environmentGroup = new THREE.Object3D();

	//持有对象
	this.SkyBox = new SkyBox( this.environmentGroup );
}
ModelViewer.prototype = new Sim.App;
ModelViewer.prototype.init = function(param) {
	Sim.App.prototype.init.call(this, param);
	this.subscribe('loaded', this, this.initLoaded);

	this.environmentGroup.name = 'environment';
	this.root.add(this.environmentGroup);

	this.config = new Config().init();

	//创建主相机
	var mainCamera = new MainCamera().init(param.container);
	this.addObject(mainCamera);
	this.userCamera = mainCamera.object3D;
	this.camera = mainCamera.object3D;	//设置活动相机

	//控制
	var control = new Controls(this.camera, this.renderer.domElement);
	this.control = control.init();

	//默认光源
	var lighting = new Lighting().init();
	this.addObject( lighting );

	//载入
	var jsonModel = new JSONModel();
	jsonModel.init();
	//
	this.addObject(jsonModel);

	//背景音乐
	//var audio = new Audio();
	//this.bgAudio = audio.init();

	//特性
	this.feature = new FeatureViewer(param.container,this.camera);
	this.featureCamera = this.feature.camera;

	//状态
	this.stats = new Stats();
	//this.stats.domElement.style.position = 'absolute';
	//this.stats.domElement.style.top = '0px';
	//this.stats.domElement.style.zIndex = 10000;
	//$("body").append( this.stats.domElement );
	//model viewer options
	this.initOptions();


	if( Plane.conf )
    	this.toConfig();
    else
    	this.subscribe('confLoaded', this, this.toConfig );
}
ModelViewer.prototype.update = function() {
	TWEEN.update();
	if(this.control) this.control.update();
	this.stats.update();
	Sim.App.prototype.update.call(this);
}
//模型载入之后的各种初始化操作
ModelViewer.prototype.initLoaded = function() {
	var that = this;

	//配置控制	//...初始化相机位置！

	//初始化修改面板	//...延时加载

	//...画个框框呗
	//createBoundBox();
	function createBoundBox() {

		var x = Plane.boundingBox.max.x;
		var y = Plane.boundingBox.max.y;
		var z = Plane.boundingBox.max.z;
		console.log("x " + x + " y " + y + " z " + z);
		var obj = new THREE.Mesh(
	      new THREE.CubeGeometry( y, z, x),
	      new THREE.MeshLambertMaterial({color: 0x000000, wireframe: true })
	    );
	    obj.position.set(0,0,0);
	    that.scene.add( obj );

	    x = Plane.boundingBox.min.x;
		y = Plane.boundingBox.min.y;
		z = Plane.boundingBox.min.z;
		console.log("x " + x + " y " + y + " z " + z);
	    obj = new THREE.Mesh(
	      new THREE.CubeGeometry( y, z,x),
	      new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: true })
	    );
	    obj.position.set(0,0,0);
	    that.scene.add( obj );

	}
}
ModelViewer.prototype.toConfig = function() {
	//ModelViewer 的 config 用来启动一些非核心功能，包括
	//1. Environment ( skybox | )
	//2. audio
	//3. feature

	//环境
	var envConf = Plane.confEnvironment;
	if( envConf ) {
		if( envConf.enable ) {

			if( envConf.type === 'skybox' ) {
				this.SkyBox.init( envConf.skybox, envConf.size );
			}
		}
	}
	//var eBox = new EnvBox();
	//this.envBox = eBox.init().envbox;
	//background
	var bgConf = Plane.confBackground;
	if( bgConf ) {

		$('#WebGLContainer').css({ "background" : bgConf.color });

		if( bgConf.type === "image" && bgConf.image !== '' ) {
			$('#WebGLContainer canvas').css({ "background-image" : "url("+ bgConf.image +")" });
		}
	}
}
ModelViewer.prototype.initOptions = function() {
	//fullscreen
	//audio control
	//save sanpshot
	//fps
	//view feature
	var type = (function(url){
		if ( url.indexOf('admin') !== -1 )
			return 'admin';
		if ( url.indexOf('scene') !== -1 )
			return 'scene';
		if ( url.indexOf('iframe') !== -1 )
			return 'iframe';
	})(document.URL);
	var el = new EJS({ url: '/template/temp_sceneOption.ejs'})
			.render({ id: Plane.modelId , type: type});
	$("#sceneOptionInsert").html(el);

	//Bootstrap 插件启动
    $('#canvasOpts a[data-toggle="tooltip"]').tooltip();

    //webgl options
    $("#saveSnapshot").click(CBS.saveSnapshot());
    $("#featurePlay").click(CBS.featurePlay);

    //feature options
    $('#featureLeaver>a.pre').click(CBS.featurePre);
    $('#featureLeaver>a.next').click(CBS.featureNext);

    $("#toggleFullscreen").click(CBS.toggleFullscreen);

    //刷新fps
    (function(){
    	var el = $("#renderStatus");
    	function checkStatus() {
    		el.html( Plane.renderStatus.fps );
    	}
    	if ( el[0] !== undefined )
    		setInterval(checkStatus, 1000);
    })();

}


CBS = {
	loadStart: function() {
		//$("#loaderDialog").addClass('show');
		$("#canvasCover").addClass('display');

	},
	loadProcess: function(event, status) {
		//console.log( 'BinaryLoaded: ' + (event.loaded / event.total * 100 ).toFixed(0)+ '%');
		//$("div#loadedWidth").css("width" , (event.loaded / event.total * 100 ).toFixed(0) + '%');
		$("div#loadingBar div.loadedWidth").css("width" , (event.loaded / event.total * 100 ).toFixed(0) + '%');
	},
	loadLoaded: function() {
		$("#canvasCover").removeClass('display');
	},
    setMetas : function(result) {
    	if( result.err ) { alert('ERROR: ' + result ); }

    	Plane.model.id = result.id;
    	Plane.model.name = result.name;
    	Plane.model.des = result.des;
    	Plane.model.created = new Date(result.created);

        $('#outerName').html(result.name);
        $('#outerDes').html(result.des);

        $('#headlineArea>h1').html(result.name);
        $('#headlineArea>h3').html(result.des);

        $('head title').html(result.name + ' | Not video, is 3D');

        if( $("#shareLinks")[0] !== undefined ) {
        	var html = new EJS({ url :'/template/temp_shareLinks.ejs'}).render({ id: result.id });

			$('#shareLinks').append( html );

			// $("#copyPageAddress").click(function(){
			// 	var copy = $("#pageAddress").val();
			// 	//...
			// });
			// $("#copyEmbedCode").click(function(){
			// 	var copy = $("#embedCode").val();
			// 	//...
			// });
        }
        
    },
    saveSnapshot: function() {
    	var count = 0;	//这个值应该保存在浏览器本地存储
    	return function() {
    		var canvas = $("#WebGLContainer>canvas")[0];
			var data = canvas.toDataURL();	//将图像输出为base64压缩的字符串  默认为image/png
			this.href = data;
			this.download = 'snapShot' + ( count === 0 ? '' : count ) + '.png';
			count++;
			//var b64 = data.substring( 22 );	//删除字符串前的提示信息 "data:image/png;base64,"
			//POST到服务器                     
			//$.post( "/url" , { data : b64, name : filename }, function(){ });
    	}
    },
    featurePlay: function() {
    	Plane.modelViewer.feature.toggle();
    },
    featurePre: function() {
    	var feature = Plane.modelViewer.feature;
    	if( feature.playing ) {
    		feature.reTimeout();
    	}
    	feature.pre();
    },
    featureNext: function() {
    	var feature = Plane.modelViewer.feature;
    	if( feature.playing ) {
    		feature.reTimeout();
    	}
    	feature.next();
    },
    toggleFullscreen: function() {
    	//... todo 有问题
    	$("#WebGLContainer").toggleClass('fullScreen');
    	$('#header').toggleClass('hiddenStyle');

    	var container = document.getElementById("WebGLContainer");
    	Plane.modelViewer.renderer.setSize(container.offsetWidth, container.offsetHeight);
    	Plane.modelViewer.camera.aspect = container.offsetWidth / container.offsetHeight;
		Plane.modelViewer.camera.updateProjectionMatrix();
		console.log('CSS Resize Render : ' + container.offsetWidth + '/' + container.offsetHeight);
		
    	CBS.toggleScreen();
    	//CBS.exitFullscreen();
    },
    fullscreen: function() {
    	var elem = document.documentElement;

	    if(elem.webkitRequestFullScreen){
	        return elem.webkitRequestFullScreen;   
	    }else if(elem.mozRequestFullScreen){
	        return elem.mozRequestFullScreen;
	    }else if(elem.requestFullScreen){
	        return elem.requestFullscreen;
	    }else{
	        //浏览器不支持全屏API或已被禁用
	        return function() {}
	    }
    }(),
    exitFullscreen: function() {  
	  if(document.exitFullscreen) {  
	    document.exitFullscreen();  
	  } else if(document.mozExitFullScreen) {  
	    document.mozExitFullScreen();  
	  } else if(document.webkitExitFullscreen) {  
	    document.webkitExitFullscreen();  
	  }  
	},
	toggleScreen: function() {
		var fullscreen = true;
		return function() {
			if( fullscreen ) {
				CBS.exitFullscreen();
				fullscreen = false;
			}
			else {
				CBS.fullscreen.call(document.documentElement);
				fullscreen = true;
			}
		}
	}()
}
Hps = {
	// 颜色转换成#FFFFFF
	array2style: function( array ) {
		var hex = ( array[0] * 255 ) << 16 ^ ( array[1] * 255 ) << 8 ^ ( array[2] * 255 ) << 0;
		return '#' + ('000000' + hex.toString( 16 ) ).slice( - 6 );
	},
	// #FFFFFF转换成RGB数组
	style2array: function( style ) {
		//...只考虑了 #ffffff 格式
		var hex = Math.floor( parseInt( style.slice(1) , 16 ) );
		var r = ( hex >> 16 & 255 ) / 255;
		var g = ( hex >> 8 & 255 ) / 255;
		var b = ( hex & 255 ) / 255;
		return [ r, g, b ];
	},
	// RGB数组转换成实数
	array2hex: function( array ) {
		return ( array[0] * 255 ) << 16 ^ ( array[1] * 255 ) << 8 ^ ( array[2] * 255 ) << 0;
	},
	// 实数转换成#FFFFFF形式
	hex2style: function ( hex ) {
		return '#' + ('000000' + hex.toString( 16 ) ).slice( - 6 );
	},
	style2hex: function ( style ) {
		return Hps.array2hex( Hps.style2array( style ) );
	},
	//检测一个对象( 非null )是不是空对象 {}
	isObjEmpty: function (obj) {
		if( obj == null ) return false;
	    for (var name in obj) {
	        return false;
	    }
	    return true;
	},
	//判断一个材质的类型
	mtype : function (m) {
        return  m instanceof THREE.MeshBasicMaterial ? 'basic' :
                m instanceof THREE.MeshLambertMaterial ? 'lambert' :
                m instanceof THREE.MeshPhongMaterial ? 'phong' :
                m instanceof THREE.ShaderMaterial ? 'shader' : 'material';
    },
    //判断一个光源的类型
    ltype : function (l) {
        return  l instanceof THREE.AmbientLight ? 'AmbientLight' :
                l instanceof THREE.PointLight ? 'PointLight' :
                l instanceof THREE.DirectionalLight ? 'DirectionalLight' : 'light';
    },
    //判断一个control的类型
    ctype : function (c) {
        return  c instanceof THREE.TrackballControls ? 'TrackballControls' :
                c instanceof THREE.OrbitControls ? 'OrbitControls' : 'controls';
    },
    //判断一个材质的的blending类型
    btype : function (b) {
        return  b === 0 ? 'NoBlending' :
                b === 1 ? 'NormalBlending' :
                b === 2 ? 'AdditiveBlending' :
                b === 3 ? 'SubtractiveBlending' :
                b === 4 ? 'MultiplyBlending' : 'CustomBlending';
    }
    
}