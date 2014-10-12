Sim = { version: 1,
	messages : {}
	/*
     * e.g message事件存储各个事件的回调函数调用栈
     * {
	 *	 "change": [{ subscriber: this, callback: function}],
	 *	 "loaded": [ 一个模型载入后的事件]
	 *	 "unsuppuse": [ 不支持的事件回调]
     * }
     *
     */
};
Sim.Publisher = function() {}
//注册一个事件的响应
Sim.Publisher.prototype.subscribe = function(message, subscriber, callback) {
    var subscribers = Sim.messages[message];
    if (subscribers) {
        if (this.findSubscriber(subscribers, subscriber) != -1) {
            return;	//如果已经注册了对该事件的响应，不用重复注册
        }
    }
    else {
        subscribers = [];
        Sim.messages[message] = subscribers;
    }

    subscribers.push({ subscriber : subscriber, callback : callback });
}
Sim.Publisher.prototype.unsubscribe =  function(message, subscriber, callback) {
    if (subscriber) {
        var subscribers = Sim.messages[message];

        if (subscribers) {
            var i = this.findSubscriber(subscribers, subscriber);
            if (i != -1)
            {
                Sim.messages[message].splice(i, 1);
            }
        }
    } else {
        delete Sim.messages[message];	//不指定特点的响应对象，则移除所有对该事件的响应
        								//适合于绑定一些临时事件，随时移除的需求
    }
}
//触发特定的事件，并且能传参数
Sim.Publisher.prototype.publish = function(message) {
    var subscribers = Sim.messages[message];

    if (subscribers) {
        for (var i = 0; i < subscribers.length; i++) {
            var args = [];	//准备参数
            for (var j = 0; j < arguments.length - 1; j++) {
                args.push(arguments[j + 1]);
            }
            subscribers[i].callback.apply(subscribers[i].subscriber, args);
        }
    }
}
Sim.Publisher.prototype.findSubscriber = function (subscribers, subscriber) {
    for (var i = 0; i < subscribers.length; i++) {
        if (subscribers[i] == subscriber) {
            return i;
        }
    }
    
    return -1;
}

// Sim.App - application class (singleton)
Sim.App = function() {
	Sim.Publisher.call(this);
	
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.objects = [];
}
Sim.App.prototype = new Sim.Publisher;
Sim.App.prototype.init = function(param) {
	param = param || {};	
	var container = param.container;
	var canvas = param.canvas;
	
    // Create the Three.js renderer, add it to our div
    var renderer = new THREE.WebGLRenderer( { antialias: true ,alpha: true} );
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild( renderer.domElement );
    renderer.setClearColorHex(0x000000, 0);
    //renderer.shadowMapEnabled = true;	//阴影

    // Create a new Three.js scene
    var scene = new THREE.Scene();
    //scene.add( new THREE.AmbientLight( 0x505050 ) );
    scene.data = this;

    // Create a root object to contain all other scene objects
    var root = new THREE.Object3D();
    root.name = 'root';
    scene.add(root);
    
    // Create a projector to handle picking
    //var projector = new THREE.Projector();
    
    // Save away a few things
    this.container = container;
    this.renderer = renderer;
    this.scene = scene;
    //this.projector = projector;
    this.root = root;
    
    // Set up event handlers
    //this.initMouse();
    //this.initKeyboard();
    this.addDomHandlers();
}
//Core run loop
Sim.App.prototype.run = function() {
	this.update();
	this.renderer.render( this.scene, this.camera );
	var that = this;
	requestAnimationFrame(function() { that.run(); });	
}
// Update method - called once per tick
Sim.App.prototype.update = function() {
	var i, len;
	len = this.objects.length;
	for (i = 0; i < len; i++) {
		this.objects[i].update();
	}
}
// Add/remove objects
Sim.App.prototype.addObject = function(obj) {
	this.objects.push(obj);
	// If this is a renderable object, add it to the root scene
	if (obj.object3D) {
		this.root.add(obj.object3D);
	}
}
Sim.App.prototype.removeObject = function(obj) {
	var index = this.objects.indexOf(obj);
	if (index != -1) {
		this.objects.splice(index, 1);
		// If this is a renderable object, remove it from the root scene
		if (obj.object3D) {
			this.root.remove(obj.object3D);
		}
	}
}
// Event handling
Sim.App.prototype.initMouse = function(){
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'mousemove', 
			function(e) { that.onDocumentMouseMove(e); }, false );
	dom.addEventListener( 'mousedown', 
			function(e) { that.onDocumentMouseDown(e); }, false );
	dom.addEventListener( 'mouseup', 
			function(e) { that.onDocumentMouseUp(e); }, false );
	
	$(dom).mousewheel(
	        function(e, delta) {
	            that.onDocumentMouseScroll(e, delta);
	        }
	    );
	
	this.overObject = null;
	this.clickedObject = null;
}
Sim.App.prototype.initKeyboard = function() {
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'keydown', 
			function(e) { that.onKeyDown(e); }, false );
	dom.addEventListener( 'keyup', 
			function(e) { that.onKeyUp(e); }, false );
	dom.addEventListener( 'keypress', 
			function(e) { that.onKeyPress(e); }, false );

	// so it can take focus
	dom.setAttribute("tabindex", 1);
    dom.style.outline='none';
}
Sim.App.prototype.addDomHandlers = function() {
	var that = this;
	window.addEventListener( 'resize', function(event) { that.onWindowResize(event); }, false );
}
Sim.App.prototype.onDocumentMouseMove = function(event) {
    event.preventDefault();
    
    if (this.clickedObject && this.clickedObject.handleMouseMove)
    {
	    var hitpoint = null, hitnormal = null;
	    var intersected = this.objectFromMouse(event.pageX, event.pageY);
	    if (intersected.object == this.clickedObject)
	    {
	    	hitpoint = intersected.point;
	    	hitnormal = intersected.normal;
	    }
		this.clickedObject.handleMouseMove(event.pageX, event.pageY, hitpoint, hitnormal);
    }
    else
    {
	    var handled = false;
	    
	    var oldObj = this.overObject;
	    var intersected = this.objectFromMouse(event.pageX, event.pageY);
	    this.overObject = intersected.object;
	
	    if (this.overObject != oldObj)
	    {
	        if (oldObj)
	        {
        		this.container.style.cursor = 'auto';
        		
        		if (oldObj.handleMouseOut)
        		{
        			oldObj.handleMouseOut(event.pageX, event.pageY);
        		}
	        }
	
	        if (this.overObject)
	        {
	        	if (this.overObject.overCursor)
	        	{
	        		this.container.style.cursor = this.overObject.overCursor;
	        	}
	        	
	        	if (this.overObject.handleMouseOver)
	        	{
	        		this.overObject.handleMouseOver(event.pageX, event.pageY);
	        	}
	        }
	        
	        handled = true;
	    }
	
	    if (!handled && this.handleMouseMove)
	    {
	    	this.handleMouseMove(event.pageX, event.pageY);
	    }
    }
}
Sim.App.prototype.onDocumentMouseDown = function(event) {
    event.preventDefault();
        
    var handled = false;

    var intersected = this.objectFromMouse(event.pageX, event.pageY);
    if (intersected.object)
    {
    	if (intersected.object.handleMouseDown)
    	{
    		intersected.object.handleMouseDown(event.pageX, event.pageY, intersected.point, intersected.normal);
    		this.clickedObject = intersected.object;
    		handled = true;
    	}
    }
    
    if (!handled && this.handleMouseDown)
    {
    	this.handleMouseDown(event.pageX, event.pageY);
    }
}
Sim.App.prototype.onDocumentMouseUp = function(event) {
    event.preventDefault();
    
    var handled = false;
    
    var intersected = this.objectFromMouse(event.pageX, event.pageY);
    if (intersected.object)
    {
    	if (intersected.object.handleMouseUp)
    	{
    		intersected.object.handleMouseUp(event.pageX, event.pageY, intersected.point, intersected.normal);
    		handled = true;
    	}
    }
    
    if (!handled && this.handleMouseUp)
    {
    	this.handleMouseUp(event.pageX, event.pageY);
    }
    
    this.clickedObject = null;
}
Sim.App.prototype.onDocumentMouseScroll = function(event, delta) {
    event.preventDefault();

    if (this.handleMouseScroll)
    {
    	this.handleMouseScroll(delta);
    }
}
Sim.App.prototype.objectFromMouse = function(pagex, pagey) {
	// Translate page coords to element coords
	var offset = $(this.renderer.domElement).offset();	
	var eltx = pagex - offset.left;
	var elty = pagey - offset.top;
	
	// Translate client coords into viewport x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );

    var intersects = ray.intersecScene( this.scene );
	
    if ( intersects.length > 0 ) {    	
    	
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
		var mat = new THREE.Matrix4().getInverse(intersected.object.matrixWorld);
    	var point = mat.multiplyVector3(intersected.point);
    	
		return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face.normal));        	    	                             
    }
    else
    {
    	return { object : null, point : null, normal : null };
    }
}
Sim.App.prototype.findObjectFromIntersected = function(object, point, normal) {
	if (object.data)
	{
		return { object: object.data, point: point, normal: normal };
	}
	else if (object.parent)
	{
		return this.findObjectFromIntersected(object.parent, point, normal);
	}
	else
	{
		return { object : null, point : null, normal : null };
	}
}

Sim.App.prototype.onKeyDown = function(event) {
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    if (this.handleKeyDown)
    {
    	this.handleKeyDown(event.keyCode, event.charCode);
    }
}
Sim.App.prototype.onKeyUp = function(event) {
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

	if (this.handleKeyUp)
	{
		this.handleKeyUp(event.keyCode, event.charCode);
	}
}        
Sim.App.prototype.onKeyPress = function(event) {
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

	if (this.handleKeyPress)
	{
		this.handleKeyPress(event.keyCode, event.charCode);
	}
}
Sim.App.prototype.onWindowResize = function(event) {
	//这里只是当 F11全屏操作 || 滚轮缩放页面 时才触发
	console.log('Resize Render : ' + this.container.offsetWidth + '/' + this.container.offsetHeight);
	this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

	this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
	this.camera.updateProjectionMatrix();
}
Sim.App.prototype.focus = function() {
	if (this.renderer && this.renderer.domElement)
	{
		this.renderer.domElement.focus();
	}
}
// Sim.Object - base class for all objects in our simulation
Sim.Object = function() {
	Sim.Publisher.call(this);
	
	this.object3D = null;
	this.children = [];
}
Sim.Object.prototype = new Sim.Publisher;
Sim.Object.prototype.init = function(){ }
Sim.Object.prototype.update = function() {
	this.updateChildren();
}
// setPosition - move the object to a new position
Sim.Object.prototype.setPosition = function(x, y, z) {
	if (this.object3D)
	{
		this.object3D.position.set(x, y, z);
	}
}
//setScale - scale the object
Sim.Object.prototype.setScale = function(x, y, z) {
	if (this.object3D)
	{
		this.object3D.scale.set(x, y, z);
	}
}
//setScale - scale the object
Sim.Object.prototype.setVisible = function(visible) {
	function setVisible(obj, visible)
	{
		obj.visible = visible;
		var i, len = obj.children.length;
		for (i = 0; i < len; i++)
		{
			setVisible(obj.children[i], visible);
		}
	}
	
	if (this.object3D)
	{
		setVisible(this.object3D, visible);
	}
}
// updateChildren - update all child objects
Sim.Object.prototype.update = function() {
	var i, len;
	len = this.children.length;
	for (i = 0; i < len; i++)
	{
		this.children[i].update();
	}
}
Sim.Object.prototype.setObject3D = function(object3D) {
	object3D.data = this;
	this.object3D = object3D;
}
//Add/remove children
Sim.Object.prototype.addChild = function(child) {
	this.children.push(child);
	
	// If this is a renderable object, add its object3D as a child of mine
	if (child.object3D)
	{
		this.object3D.add(child.object3D);
	}
}
Sim.Object.prototype.removeChild = function(child) {
	var index = this.children.indexOf(child);
	if (index != -1)
	{
		this.children.splice(index, 1);
		// If this is a renderable object, remove its object3D as a child of mine
		if (child.object3D)
		{
			this.object3D.remove(child.object3D);
		}
	}
}
// Some utility methods
Sim.Object.prototype.getScene = function() {
	var scene = null;
	if (this.object3D)
	{
		var obj = this.object3D;
		while (obj.parent)
		{
			obj = obj.parent;
		}
		
		scene = obj;
	}
	
	return scene;
}
Sim.Object.prototype.getApp = function() {
	var scene = this.getScene();
	return scene ? scene.data : null;
}
// Some constants

/* key codes
37: left
38: up
39: right
40: down
*/
Sim.KeyCodes = {};
Sim.KeyCodes.KEY_LEFT = 37;
Sim.KeyCodes.KEY_UP = 38;
Sim.KeyCodes.KEY_RIGHT = 39;
Sim.KeyCodes.KEY_DOWN = 40;

Loader = function ( showStatus ) {

	THREE.Loader.call( this, showStatus );

	this.withCredentials = false;

};
Loader.prototype = Object.create( THREE.Loader.prototype );

Loader.prototype.load = function ( url, callback, texturePath, callbackProgress) {
	var scope = this;

	// todo: unify load API to for easier SceneLoader use

	texturePath = texturePath && ( typeof texturePath === "string" ) ? texturePath : this.extractUrlBase( url );

	this.onLoadStart();
	this.loadAjaxJSON( this, url, callback, texturePath, callbackProgress);
}
Loader.prototype.loadAjaxJSON = function ( context, url, callback, texturePath, callbackProgress ) {

	var xhr = new XMLHttpRequest();

	var length = 0;

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === xhr.DONE ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				if ( xhr.responseText ) {

					var json = JSON.parse( xhr.responseText );

					Plane.model.metadata = json.metadata;
					Plane.model.metaMaterial = json.materials;

					if( json.buffers === undefined || json.buffers === '' ) {
						var result = THREE.JSONLoader.prototype.parse( json, texturePath );
						callback( result.geometry, result.materials,  json.metadata, json.materials);
					} else {
						THREE.BinaryLoader.prototype.loadAjaxBuffers( json, callback, binaryPath = texturePath, texturePath, callbackProgress );
					}

				} else {

					console.warn( "THREE.JSONLoader: [" + url + "] seems to be unreachable or file there is empty" );

				}

				// in context of more complex asset initialization
				// do not block on single failed file
				// maybe should go even one more level up

				context.onLoadComplete();

			} else {

				console.error( "THREE.JSONLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState === xhr.LOADING ) {

			if ( callbackProgress ) {

				if ( length === 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

			if ( callbackProgress !== undefined ) {

				length = xhr.getResponseHeader( "Content-Length" );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.withCredentials = this.withCredentials;
	xhr.send( null );
};
JSONModel = function() {
	Sim.Object.call(this);

	this.mesh = null;
	this.materials = null;
	this.loaded = false;

	//场景要备份自己的网格层级和材质层级
}
JSONModel.prototype = new Sim.Object;
JSONModel.prototype.init = function( param ) {
	Sim.Object.prototype.init.call(this);

	var url = '/data/models/'+ Plane.modelId +'/model.js';

	var modelGroup = new THREE.Object3D();
	modelGroup.name = 'model';
	this.setObject3D(modelGroup);
	var that = this;

	CBS.loadStart();
	this.load( url );
}
JSONModel.prototype.load = function( url , handler ) {
	var that = this;
	var handler = handler || 'auto';

	if ( handler ===  'auto' ) {
		var loader = new Loader();
		loader.load( url, function ( geometry, materials, a, b) {
			that.handleLoaded(geometry, materials, a, b);
		},null, CBS.loadProcess);
	}
	if ( handler ===  'ascii' ) {
		var loader = new THREE.JSONLoader();
		loader.load( url, function ( geometry, materials, a, b) {
			that.handleLoaded(geometry, materials, a, b);
		},null, CBS.loadProcess);
	}
	if ( handler ===  'binary' ) {
		var loader = new THREE.BinaryLoader();
		loader.load( url, function ( geometry, materials, a, b) {
			that.handleLoaded(geometry, materials, a, b);
		},null, null, CBS.loadProcess);
	}
	// 场景可能是从 fbx / dae 转换而来
	if ( handler ===  'scene' ) {
		var loader = new THREE.SceneLoader();
		//loader.load( url, that.handleSceneLoaded);
		loader.load( url, function( result ) {
			console.log(result);
			that.object3D.add( result.scene );
			CBS.loadLoaded();
		});
	}
}
JSONModel.prototype.handleLoaded = function(geometry, materials, a, b) {
	Plane.model.metadata = a;
	Plane.model.metaMaterial = b;

	var faceMaterial = new THREE.MeshFaceMaterial(materials);

	if( geometry.animation ) {
		var mesh = new THREE.SkinnedMesh(geometry,faceMaterial);
	}
	else {
		var mesh = new THREE.Mesh(geometry,faceMaterial);
	}
	
	//mesh.position.set(1,-5,-17);	//...testing
	
	//geometry.computeBoundingBox();	//...
	//var bb = geometry.boundingBox;	//...
	//var x = 0, y = -250, z = -300, s = 60;
	//mesh.scale.set(s,s,s);	//...testing
	//mesh.position.set( x, y - bb.min.y * s, z );
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	this.object3D.add( mesh );

	//该缓存的缓存
	this.mesh = mesh;
	this.geometry = geometry;;
	this.materials = materials;
	Plane.materials = materials;
	Plane.geometry = geometry;
	this.loaded = true;

	if( Plane.confMaterial )
		this.config();
	else
		this.subscribe('confLoaded', this, this.config );

	CBS.loadLoaded();
	this.publish('loaded');	//触发载入完成事件
}
JSONModel.prototype.handleSceneLoaded = function(result) {
	console.log(result);
	this.object3D.add( result );
}
JSONModel.prototype.config = function() {
	//console.log('Config mash [编辑模式]');
	//console.log('Config material [编辑模式]');
	/* 
	 * 修改属性			影响	conf属性					配置
	 * --------------------------------------------------------------
	 * name				-->		DbgName			''			..>
	 * shading			-->		shading			''
	 * color 			-->		colorDiffuse	[]
	 * opacity			-->		transparency	.0
	 * transparent		-->		transparency	0.0
	 *
	 * ambient 			-->		colorAmbient	[]
	 * reflectivity		-->		reflectivity		//???
	 * shininess		-->		specularCoef
	 * visible			-->		visible
	 * 
	 * enableMap		-->		enableMap
	 * enableBump		-->		enableBump
	 * enableNormal		-->		enableNormal
	 * enableSpecular	-->		enableSpecular
	 * enableEnv		-->		enableEnv
	 *
	 *
	 * map 				-->		mapDiffuse		''
	 * bumpMap			-->		mapBump			''
	 * normalMap		-->		mapNormal		''
	 * specularMap		-->		mapSpecular		''
	 * envMap			-->		mapEnv			''
	 *
	 * 
	 *
	 * 
	 *
	 *
	 *
	 *
	 */
	function backupMapStatus( material ) {
		var data = {};

		if( material.map )
			data.originalMap = material.map.sourceFile;
		if( material.specularMap )
			data.originalSpecularMap = material.specularMap.sourceFile;
		if( material.bumpMap )
			data.originalBumpMap = material.bumpMap.sourceFile;
		if( material.normalMap )
			data.originalNormalMap = material.normalMap.sourceFile;
		if( material.lightMap )
			data.originalLightMap = material.lightMap.sourceFile;

		//if ( !Hps.isObjEmpty( data ) )
			material.data = data;
	}

	 var config = Plane.confMaterial;
	 var materials = this.materials;
	 //贴图操作之前先来备份下原始数据
	 for (var i = 0 ; i < materials.length; i++ ) {
	 	backupMapStatus( materials[i] );
	 }

	 if( Plane.confMaterial.length === 0 ) return;
	 for (var i = 0 ; i < config.length; i++ ) {
	 	if( !config[i] ) continue;
	 	this.editMaterial( config[i], materials[i] );
	 }
}
JSONModel.prototype.editMaterial = function( conf , material ) {
	function createTexture(witch, texture) {
        //enable 为 true, 为其创建贴图
        if( witch === 'map' ) {
            if( texture === null ) return null; //注意这里检查的 $scope.material.map 是 Parse 数据
            return THREE.ImageUtils.loadTexture( '/data/models/' + Plane.modelId + '/' + texture );
        }
        if( witch === 'specularMap' ) {
            if( texture === null ) return null; //注意这里检查的 $scope.material.specularMap 是 Parse 数据
            return THREE.ImageUtils.loadTexture( '/data/models/' + Plane.modelId + '/' + texture );
        }
        if( witch === 'bumpMap' ) {
            if( texture === null ) return null; //注意这里检查的 $scope.material.bumpMap 是 Parse 数据
            return THREE.ImageUtils.loadTexture( '/data/models/' + Plane.modelId + '/' + texture );
        }
        if( witch === 'normalMap' ) {
            if( texture === null ) return null; //注意这里检查的 $scope.material.normalMap 是 Parse 数据
            return THREE.ImageUtils.loadTexture( '/data/models/' + Plane.modelId + '/' + texture );
        }
        if( witch === 'lightMap' ) {
            if( texture === null ) return null; //注意这里检查的 $scope.material.normalMap 是 Parse 数据
            return THREE.ImageUtils.loadTexture( '/data/models/' + Plane.modelId + '/' + texture );
        }
        if( witch === 'envMap' ) {
            if( texture === null ) return null; //注意这里检查的 $scope.material.envMap 是 Parse 数据

            //这个地方的疑惑是 // envMap 的值 : 是一个 id
            var sb = "/data/models/" + Plane.modelId + "/env/" + texture;
            var urls = [ sb + "_px.jpg", sb + "_nx.jpg",
                         sb + "_py.jpg", sb + "_ny.jpg",
                         sb + "_pz.jpg", sb + "_nz.jpg" ];

            return THREE.ImageUtils.loadTextureCube( urls );
        }
    }

 	if( Hps.isObjEmpty(conf) ) return;
 	if( material === undefined ) return;
 	var mType = Hps.mtype(material);

 	// ------------------ shading
 	if ( conf.shading && conf.shading !== mType ) {
 		var index = Plane.materials.indexOf(material);
 		var originalData = Plane.model.metaMaterial[index];
 		originalData.shading = conf.shading;

 		var newMaterial = THREE.Loader.prototype.createMaterial(originalData, "/data/models/" + Plane.modelId + "/" );
 		Plane.materials[index] = newMaterial;
 		material = newMaterial;
 		mType = Hps.mtype(material);	//!!! 这里丢掉导致BUG
 	}
 	// ------------------ DbgName ( = name )
 	if ( conf.DbgName !== undefined ) {
 		material.name = conf.DbgName;
 	}
 	// ------------------ group
 	if ( conf.group !== undefined ) {
 		material.group = conf.group;
 	}
 	// ------------------ visible
 	if ( conf.visible !== undefined ) {
 		material.visible = conf.visible;
 	}
 	// ------------------ blending
 	if ( conf.blending !== undefined ) {
 		if( THREE[conf.blending] !== undefined && material.blending !== THREE[conf.blending] )
 			material.blending = THREE[conf.blending];
 	}
 	// ------------------ side	//...这个应该是自己命名的
 	if ( conf.side !== undefined ) {
 		material.side = THREE[conf.side];
 	}
 	// ------------------ wireframe	//...这个应该是自己命名的
 	if ( conf.wireframe !== undefined ) {
 		material.wireframe = conf.wireframe;
 	}

 	// ------------------ transparent
 	if ( conf.transparent !== undefined ) {
 		material.transparent = conf.transparent;
 		// if( !conf.transparent ) {
 		// 	material.opacity = 1;
 		// }
 	}
 	// ------------------ transparency ( => opacity)
 	if ( conf.transparency !== undefined ) {
 		//1. 如果透明度为0，那干脆把透明关掉好了啊
 		//material.transparent = conf.transparency === 0 ? false : true;
 		material.opacity = conf.transparency;
 	}

 	// ------------------ reflectivity
 	if ( conf.reflectivity ) {
 		material.reflectivity = conf.reflectivity;
 	}
 	// ------------------ refractionRatio
 	if ( conf.refractionRatio ) {
 		material.refractionRatio = conf.refractionRatio;
 	}
 	// ------------------ specularCoef ( = shininess )		=========== phong only
 	if ( conf.specularCoef && mType === 'phong' ) {
 		material.shininess = conf.specularCoef;
 	}

 	// ------------------ colorDiffuse
 	if ( conf.colorDiffuse &&  conf.colorDiffuse.length === 3 ) {
 		material.color.fromArray(conf.colorDiffuse);
 	}
 	// ------------------ colorAmbient		=========== phong lambert only
 	if ( conf.colorAmbient &&  conf.colorAmbient.length === 3 && mType !== 'basic' ) {
 		material.ambient.fromArray(conf.colorAmbient);
 	}
 	// ------------------ colorSpecular		=========== phong only
 	if ( conf.colorSpecular &&  conf.colorSpecular.length === 3 && mType === 'phong' ) {
 		material.specular.fromArray(conf.colorSpecular);
 	}
 	// ------------------ colorEmissive ( =emissive )		=========== phong lambert only
 	if ( conf.colorEmissive &&  conf.colorEmissive.length === 3 && mType !== 'basic' ) {
 		material.emissive.fromArray(conf.colorEmissive);
 	}

 	// ------------------ mapDiffuse ( =map )
 	if ( conf.mapDiffuse !== undefined && conf.mapDiffuse !== '' ) {
 		material.map = createTexture("map", conf.mapDiffuse);
 	}
 	// ------------------ mapSpecular ( =specularMap )
 	if ( conf.mapSpecular !== undefined && conf.mapSpecular !== '' ) {
 		material.specularMap = createTexture("specularMap", conf.mapSpecular);
 	}
 	// ------------------ mapBump ( =bumpMap )		=========== phong only
 	if ( conf.mapBump !== undefined && conf.mapBump !== '' && mType === 'phong' ) {
 		material.bumpMap = createTexture("bumpMap", conf.mapBump);
 	}
 	// ------------------ mapNormal ( =normalMap )		=========== phong only
 	if ( conf.mapNormal !== undefined && conf.mapNormal !== '' && mType === 'phong' ) {
 		material.normalMap = createTexture("normalMap", conf.mapNormal);
 	}
 	// ------------------ mapLight ( =lightMap )
 	if ( conf.mapLight !== undefined && conf.mapLight !== '' ) {
 		material.lightMap = createTexture("lightMap", conf.mapLight);
 	}
	// ------------------ enableMap
 	if ( conf.enableMap !== undefined && !conf.enableMap ) {
 		material.map = null;
 	}
 	// ------------------ enableSpecular
 	if ( conf.enableSpecular !== undefined && !conf.enableSpecular ) {
 		material.specularMap = null;
 	}
 	// ------------------ enableBump		=========== phong only
 	if ( conf.enableBump !== undefined && !conf.enableBump && mType === 'phong' ) {
 		material.bumpMap = null;
 	}
 	// ------------------ enableNormal		=========== phong only
 	if ( conf.enableNormal !== undefined && !conf.enableNormal && mType === 'phong' ) {
 		material.normalMap = null;
 	}
 	// ------------------ enableLight ( = lightMap)
 	if ( conf.enableLight !== undefined && !conf.enableLight ) {
 		material.lightMap = null;
 	}
 	// ------------------ enableEnv & mapEnv ( = envMap)
 	// !!! enableEnv 和 mapEnv 之所以放在一起处理，而不像上面把两个分开，是因为不清楚默认的envmap是怎么处理的
 	if ( conf.enableEnv !== undefined ) {
 		if ( conf.enableEnv && conf.mapEnv !== undefined ) {
 			material.envMap = createTexture("envMap", conf.mapEnv);
 		} else {
 			material.envMap = null;
 		}
 	}

 	// ------------------ mapDiffuseRepeat ( =mapRepeat )
 	if( conf.mapDiffuseRepeat && (conf.mapDiffuseRepeat[0] !== 1 || conf.mapDiffuseRepeat[1] !== 1 )) {
 		if( material.map )
 			material.map.repeat.fromArray(conf.mapDiffuseRepeat);
 	}
 	// ------------------ mapSpecularRepeat ( =specularRepeat )
 	if( conf.mapSpecularRepeat && (conf.mapSpecularRepeat[0] !== 1 || conf.mapSpecularRepeat[1] !== 1 )) {
 		if( material.specularMap )
 			material.specularMap.repeat.fromArray(conf.mapSpecularRepeat);
 	}
 	// ------------------ mapBumpRepeat ( =bumpRepeat )
 	if( conf.mapBumpRepeat && (conf.mapBumpRepeat[0] !== 1 || conf.mapBumpRepeat[1] !== 1 )) {
 		if( material.bumpMap )
 			material.bumpMap.repeat.fromArray(conf.mapBumpRepeat);
 	}
 	// ------------------ mapNormalRepeat ( =normalRepeat )
 	if( conf.mapNormalRepeat && (conf.mapNormalRepeat[0] !== 1 || conf.mapNormalRepeat[1] !== 1 )) {
 		if( material.normalMap )
 			material.normalMap.repeat.fromArray(conf.mapNormalRepeat);
 	}
 	// ------------------ mapLightRepeat ( =LightRepeat )
 	if( conf.mapLightRepeat && (conf.mapLightRepeat[0] !== 1 || conf.mapLightRepeat[1] !== 1 )) {
 		if( material.lightMap )
 			material.lightMap.repeat.fromArray(conf.mapLightRepeat);
 	}

 	var wrapMap = {
        "clamp": THREE.ClampToEdgeWrapping,
        "repeat": THREE.RepeatWrapping,
        "mirror": THREE.MirroredRepeatWrapping
    }
 	// ------------------ mapDiffuseWrap ( =mapWrap )
 	if( conf.mapDiffuseWrap && (conf.mapDiffuseWrap[0] !== 'clamp' || conf.mapDiffuseWrap[1] !== 'clamp' )) {
 		if( material.map ) {
 			material.map.wrapS = wrapMap[conf.mapDiffuseWrap[0]];
 			material.map.wrapT = wrapMap[conf.mapDiffuseWrap[1]];
 		}
 	}
 	// ------------------ mapSpecularWrap ( =specularWrap )
 	if( conf.mapSpecularWrap && (conf.mapSpecularWrap[0] !== 'clamp' || conf.mapSpecularWrap[1] !== 'clamp' )) {
 		if( material.specularMap ) {
 			material.specularMap.wrapS = wrapMap[conf.mapSpecularWrap[0]];
 			material.specularMap.wrapT = wrapMap[conf.mapSpecularWrap[1]];
 		}
 	}
 	// ------------------ mapBumpWrap ( =bumpWrap )
 	if( conf.mapBumpWrap && (conf.mapBumpWrap[0] !== 'clamp' || conf.mapBumpWrap[1] !== 'clamp' )) {
 		if( material.bumpMap ) {
 			material.bumpMap.wrapS = wrapMap[conf.mapBumpWrap[0]];
 			material.bumpMap.wrapT = wrapMap[conf.mapBumpWrap[1]];
 		}
 	}
 	// ------------------ mapNormalWrap ( =normalWrap )
 	if( conf.mapNormalWrap && (conf.mapNormalWrap[0] !== 'clamp' || conf.mapNormalWrap[1] !== 'clamp' )) {
 		if( material.normalMap ) {
 			material.normalMap.wrapS = wrapMap[conf.mapNormalWrap[0]];
 			material.normalMap.wrapT = wrapMap[conf.mapNormalWrap[1]];
 		}
 	}
 	// ------------------ mapLightWrap ( =LightWrap )
 	if( conf.mapLightWrap && (conf.mapLightWrap[0] !== 'clamp' || conf.mapLightWrap[1] !== 'clamp' )) {
 		if( material.lightMap ) {
 			material.lightMap.wrapS = wrapMap[conf.mapLightWrap[0]];
 			material.lightMap.wrapT = wrapMap[conf.mapLightWrap[1]];
 		}
 	}

 	// ------------------ mapDiffuseFilter ( =mapFilter )
 	if( conf.mapDiffuseFilter && (conf.mapDiffuseFilter[0] !== 'LinearFilter' || conf.mapDiffuseFilter[1] !== 'LinearMipMapLinearFilter' )) {
 		if( material.map ) {
 			material.map.magFilter = THREE[conf.mapDiffuseFilter[0]];
 			material.map.minFilter = THREE[conf.mapDiffuseFilter[1]];
 		}
 	}
 	// ------------------ mapSpecularFilter ( =specularFilter )
 	if( conf.mapSpecularFilter && (conf.mapSpecularFilter[0] !== 'LinearFilter' || conf.mapSpecularFilter[1] !== 'LinearMipMapLinearFilter' )) {
 		if( material.specularMap ) {
 			material.specularMap.magFilter = THREE[conf.mapSpecularFilter[0]];
 			material.specularMap.minFilter = THREE[conf.mapSpecularFilter[1]];
 		}
 	}
 	// ------------------ mapBumpFilter ( =bumpFilter )
 	if( conf.mapBumpFilter && (conf.mapBumpFilter[0] !== 'LinearFilter' || conf.mapBumpFilter[1] !== 'LinearMipMapLinearFilter' )) {
 		if( material.bumpMap ) {
 			material.bumpMap.magFilter = THREE[conf.mapBumpFilter[0]];
 			material.bumpMap.minFilter = THREE[conf.mapBumpFilter[1]];
 		}
 	}
 	// ------------------ mapNormalFilter ( =normalFilter )
 	if( conf.mapNormalFilter && (conf.mapNormalFilter[0] !== 'LinearFilter' || conf.mapNormalFilter[1] !== 'LinearMipMapLinearFilter' )) {
 		if( material.normalMap ) {
 			material.normalMap.magFilter = THREE[conf.mapNormalFilter[0]];
 			material.normalMap.minFilter = THREE[conf.mapNormalFilter[1]];
 		}
 	}
 	// ------------------ mapLightFilter ( =LightFilter )
 	if( conf.mapLightFilter && (conf.mapLightFilter[0] !== 'LinearFilter' || conf.mapLightFilter[1] !== 'LinearMipMapLinearFilter' )) {
 		if( material.lightMap ) {
 			material.lightMap.magFilter = THREE[conf.mapLightFilter[0]];
 			material.lightMap.minFilter = THREE[conf.mapLightFilter[1]];
 		}
 	}

 	material.needsUpdate = true;

 	var geometry = Plane.geometry;		//也不知道有没有用，也不知道哪些有用了
 	//geometry.verticesNeedUpdate = true;
	//geometry.elementsNeedUpdate = true;
	geometry.uvsNeedUpdate = true;
	//geometry.normalsNeedUpdate = true;
	geometry.tangentsNeedUpdate = true;
	//geometry.colorsNeedUpdate = true;
	//geometry.lineDistancesNeedUpdate = true;

	geometry.buffersNeedUpdate = true;
 }
JSONModel.prototype.update = function() {
	if(this.loaded) {
		//this.object3D.rotation.y += 0.001;
	}
}
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
/*
 * 环境贴图 2014/2/15
 */
SkyBox = function( containner ) {
	Sim.Object.call(this);
	this.containner = containner;
	this.enableOne = null;

	//this.loaded = false;	//...这个值监听的到么
}
SkyBox.prototype = new Sim.Object();	//...有必要么
SkyBox.prototype.init = function( witch, size ) {
	if( witch === undefined || witch === '' ) return;
	var size = size || 10000;
	//检查一下 witch 情况

	var sb = "/data/models/" + Plane.modelId + "/env/" + witch ;
	var urls = [ sb + "_px.jpg", sb + "_nx.jpg",
				 sb + "_py.jpg", sb + "_ny.jpg",
				 sb + "_pz.jpg", sb + "_nz.jpg" ];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		side: THREE.BackSide
	} );

	var cubeMesh = new THREE.Mesh( new THREE.CubeGeometry( size, size, size ), material );
	cubeMesh.name ='skybox';

	this.remove();	//先取消掉当前的skybox，如果有的话
	this.containner.add( cubeMesh );
	this.enableOne = cubeMesh;
	return this;
}
SkyBox.prototype.resize = function(size) {
	//... 这个没搞定，没用
	if( !this.enableOne ) return;
	this.enableOne.geometry.width = size;
	this.enableOne.geometry.height = size;
	this.enableOne.geometry.depth = size;
	this.enableOne.geometry.buffersNeedUpdate = true;

}
SkyBox.prototype.remove = function() {
	if( this.enableOne !== null ) {
		this.containner.remove( this.enableOne );
		this.enableOne = null;
	}
}
SkyBox.prototype.enable = function() {
	if( this.enableOne === null ) {
		if( Plane.confEnvironment.type === 'skybox' && Plane.confEnvironment.skybox != null ) {
			this.init( Plane.confEnvironment.skybox );
			return;
		}
		return;
	};

	this.enableOne.visible = true;
}
SkyBox.prototype.disable = function() {
	if( this.enableOne === null ) return;
	this.enableOne.visible = false;
}
Animation = function() {
	Sim.Object.call(this);
}
Animation.prototype = new Sim.Object();
Animation.prototype.init = function() {
	//初始化动画
	// KeyFrame Animations
	var animations, kfAnimationsLength, kfAnimations;

	var animHandler = THREE.AnimationHandler;

	for ( var i = 0; i < kfAnimationsLength; ++i ) {

		var animation = animations[ i ];
		animHandler.add( animation );

		var kfAnimation = new THREE.KeyFrameAnimation( animation.node, animation.name );
		kfAnimation.timeScale = 1;
		kfAnimations.push( kfAnimation );

	}
}
Animation.prototype.toggle = function(tag) {
	//触发某个标签的动画
}
/*
 *  2014/3/14
 *  提交状态控制器 Angular实现将更佳
 */
UpdateStatus = function() {
    //this.el = $("#updateStatus");
    this.cbTimer = null;
    this.el = $("title");
    this.title = this.el.html();
}
UpdateStatus.prototype.confUpdateStart = function() {
    this.clearCbTimer();
    this.el.html("正在提交更改...");
}
UpdateStatus.prototype.confUpdateSucess = function() {
    this.clearCbTimer();
    this.el.html("已经保存...");
    this.setClear();

}
UpdateStatus.prototype.confUpdateError = function() {
    this.clearCbTimer();
    this.el.html("配置提交出错了！稍后将重试...");
}
UpdateStatus.prototype.setClear = function( interval ) {
    // 设置自动清除
    //1. 设定一个间隔后执行clear回调
    var _this = this;
    this.cbTimer = setTimeout( function(){ _this.clear.call(_this); } , interval || 2000 );
}
UpdateStatus.prototype.clear = function() {
    // this.el.html("");
    this.el.html(this.title);
}
UpdateStatus.prototype.clearCbTimer = function () {
    // 清除已有的计时回调
    if( this.cbTimer !== null ) {
        clearTimeout( this.cbTimer);
        this.cbTimer = null;
    }
}
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
FeatureViewer = function( container ,userCamera) {
	this.enable = true;
	this.showIndex = 0;
	this.defFrequency = 3000;
	this.userCamera = userCamera;
	this.featurePanel = $('#featureLeaver');
	this.featureMaodian = $('#featureLeaver .features');
	this.template = new EJS({ url :'/template/temp_featureView.ejs'});
	this.timer = null;

	//container这个引用  和将来resize的问题
	this.camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 0.1, 100000 );;
	this.camera.name = 'FeatureCamera';

	// this.features = [
	// 	{ title: '更强的大脑', des: '新的产品拥有最新最快的大脑'},
	// 	{ title: '更快的速度', des: '速度比上一代提高了两倍之多'},
	// 	{ title: '更便宜', des: '仅为上一代产品的一半'}
	// ];
	// this.focus = [
	// 	{position: [100,100,100], lookAt: [0,0,0]},
	// 	{position: [-0.97,-1.59,-9.8], lookAt: [0,0,0]},
	// 	{position: [100,100,100], lookAt: [0,0,0]}
	// ];

	if( Plane.confFeature )
		this.config();
	else
		this.subscribe('confLoaded', this, this.config );
}
FeatureViewer.prototype = new Sim.Publisher;
//合适的时间到了，创建URL监听
FeatureViewer.prototype.ready = function() {
	var that = this;
	var FeatureRouter = Backbone.Router.extend({  
	    routes : { 'feature/:id' : 'focusFeatureOf' },
	    focusFeatureOf : function(id) {
	    	that.focusThe(id);	//... todo 这个写法有没负担
	    }
	});

	this.router = new FeatureRouter();
	Backbone.history.start();
};
FeatureViewer.prototype.focusThe = function( featureId ) {
	var activeNow = Plane.modelViewer.camera;
	//检查feature相机激活情况
	if( this.camera !== activeNow ) {
		this.camera.position.copy(activeNow.position);
		Plane.modelViewer.camera = this.camera;
		//console.log('替换了feature相机');
		//重置计时器
	}
	if( !this.playing ) {
		//说明是URL直接定位到这个特性的
		this.featurePanel.addClass('display');
	}
	//1. 移动 feature 相机
	var cam = this.features[featureId].focus;
	this.camera.position.fromArray(cam.position[0]);
	new TWEEN.Tween( this.camera.position )
    .to({
        x : cam.position[1][0],
        y : cam.position[1][1],
        z : cam.position[1][2]
    	}, cam.periodTime || 1000)
    .easing( TWEEN.Easing.Sinusoidal.Out )
    .start();
    //2. 显示文本
   	this.featureMaodian.html( this.template.render(this.features[featureId]) );
   	//3. 设置状态
   	this.showIndex = featureId;
}
//轮播
FeatureViewer.prototype.play = function() {
	if( this.playing )
		return;
	this.router.navigate('feature/' + this.showIndex, true);
	var _this = this;
	this.timer = setInterval( function(){ _this.next.call(_this); } , this.defFrequency);
	this.playing = true;
}
//结束轮播
FeatureViewer.prototype.stop = function() {
	if( this.playing )
		clearInterval(this.timer);
	this.playing = false;
}
FeatureViewer.prototype.pre = function() {
	this.showIndex = (this.showIndex + this.features.length -1 ) % this.features.length;
	this.router.navigate('feature/' + this.showIndex, true);
}
FeatureViewer.prototype.next = function() {
	this.showIndex = (this.showIndex + 1) % this.features.length;
	this.router.navigate('feature/' + this.showIndex, true);
}
//由于手动操作等需要延迟计时器的情形
FeatureViewer.prototype.reTimeout = function() {
	if ( !this.playing ) return;
	clearInterval(this.timer);
	var _this = this;
	this.timer = setInterval( function(){ _this.next.call(_this); } , this.defFrequency * 2);
}

//切换轮播的 播放/暂停
FeatureViewer.prototype.toggle = function() {
	if( this.playing ) {
		this.stop();
		this.featurePanel.removeClass('display');
	} else {
		this.play();
		this.featurePanel.addClass('display');
	}
}
//离开特性介绍功能
FeatureViewer.prototype.exit = function() {
	this.stop();
	this.router.navigate('', true);
}

FeatureViewer.prototype.config = function() {
	if( Plane.confFeature.length === 0 ) return;

	this.features = Plane.confFeature;

	this.ready();
}
Audio = function() {
	this.audio = null;
	this.playing = false;
}
Audio.prototype.init = function() {
	this.audio = document.createElement('audio');
	this.audio.src = '/data/models/' + Plane.modelId + '/audio/audio.mp3';
	this.audio.play();
	this.playing = true;

	return this;
}
Audio.prototype.play = function() {
	if( !this.playing ) {
		this.audio.play();
		this.playing = true;
	}
}
Audio.prototype.stop = function() {
	if( this.playing ) {
		this.audio.pause();
		this.playing = false;
	}
}
Audio.prototype.toggle = function () {
	//切换播放和暂停状态
}
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
var directiveDemo = angular.module('texture', [])
.factory('Texture', ['$http',function($http){
	var Service = {}; 

	// Service.textures = [
	// { id: 'a', name: 'AAA', texture: 'texture/a.jpg' },
	// { id: 'b', name: 'BBB', texture: 'texture/b.jpg' },
	// { id: 'c', name: 'CCC', texture: 'texture/c.jpg' }];
	//... textures 还得包含conf文件中的图片,parse模块在解析的时候会添加
	// Service.envTextures = [
	// { id: 'aaa', name: 'AAA', texture: ['env/aaa_px.jpg','env/aaa_py.jpg','env/aaa_pz.jpg','env/aaa_nx.jpg','env/aaa_ny.jpg','env/aaa_nz.jpg']},
	// { id: 'bbb', name: 'BBB', texture: ['env/bbb_px.jpg','env/bbb_py.jpg','env/bbb_pz.jpg','env/bbb_nx.jpg','env/bbb_ny.jpg','env/bbb_nz.jpg']},
	// { id: 'ccc', name: 'CCC', texture: ['env/ccc_px.jpg','env/ccc_py.jpg','env/ccc_pz.jpg','env/ccc_nx.jpg','env/ccc_ny.jpg','env/ccc_nz.jpg']}];
	Service.textures = [];
	Service.envTextures = [];

	$http.get('/api/models/' + Plane.modelId + '/textures').success(function(data, status, headers, config) {
        for(var i = 0, len = data.length; i < len; i++ ) {
        	Service.textures.push(data[i]);
        }
    });
    $http.get('/api/models/' + Plane.modelId + '/envTextures').success(function(data, status, headers, config) {
        for(var i = 0, len = data.length; i < len; i++ ) {
        	Service.envTextures.push(data[i]);
        }
    });


	Service.addTexture = function(newOne) {
		for( var i = 0, len = this.textures.length; i < len; i++ ) {
			if( newOne.texture === this.textures[i].texture )
				return;
		}
		this.textures.push(newOne);
	}
	Service.addEnvTexture = function(newOne) { 
		this.envTextures.push(newOne);
	}
	Service.getTextures = function() {
		return this.textures;
	}
	Service.getEnvTextures = function() {
		return this.envTextures;
	}
	return Service;
}]);
var parse = angular.module('parse', ['texture'])
.factory('Parse', ['Texture', function(Texture){
	var Parse = {};

	Parse.data = {
		common: {
            features: Plane.conf.feature,
        },
		scene: {
            camera: Plane.conf.camera,
            control: Plane.conf.control,
            lights: Plane.conf.light,
            background: Plane.conf.background,
            environment: Plane.conf.environment
        },
		materials: parsedMaterials( Plane.materials , Parse)
	}

    //seter/getter
	Parse.getCommon = function() { return Parse.data.common; }
	Parse.getScene = function() { return Parse.data.scene; }
	Parse.getMaterials = function() { return Parse.data.materials; }
    Parse.getLights = function() { return Parse.data.scene.lights; }

    //handdle
    Parse.checkResource = (function() {
        var previews = {
            preview: '',
            startingPreview: ''
        };
        var audios = {
            audio: ''
        };
        
        // function test () {
        //     previews.preview = "/data/models/AAAA/preview/preview.png";
        //     console.log("set ----------------------------");
        // }
        // setTimeout( test, 10000 );

        $.ajax({
            type: 'HEAD',
            url: '/data/models/'+ Plane.modelId +'/preview/preview.png',
            success: function() {
                previews.preview = '/data/models/'+ Plane.modelId +'/preview/preview.png';
            }
        });
        $.ajax({
            type: 'HEAD',
            url: "/data/models/"+ Plane.modelId +"/preview/preview_starting.png",
            success: function() {
                previews.startingPreview = "/data/models/"+ Plane.modelId +"/preview/preview_starting.png";
            }
        });

        return function( witch ) {
            if( witch === 'previews' ) {
                return previews;
            }
            if( witch === 'audios' ) {
                return audios;
            }
        }
    })();
    //helper
    Parse.getCameraPosition = function() {
        return Plane.modelViewer.userCamera.position.toArray();
    }
    Parse.getCameraQuaternion = function() {
        return Plane.modelViewer.userCamera.quaternion.toArray();
    }
    Parse.getCameraDistance = function() {
        var po = Plane.modelViewer.userCamera.position.toArray();
        return Math.sqrt( Math.pow(po[0], 2) + Math.pow(po[1], 2) + Math.pow(po[2], 2) );
    }
    Parse.getCameraTarget = function() {
        //return Plane.modelViewer.userCamera.___.toArray();
        return [0,0,0];
    }
    //set method 'parsedMaterial' in Object 'Parse' ,because you will want call it in other place outside...
    Parse.parsedMaterial = parsedMaterial;

    function parsedMaterial(m, index) {
        function parseRepeat(witchMap){
            if( witchMap == null ) {
                return [1,1];
            } else {
                return witchMap.repeat.toArray();
            }
        }
        function parseWrap(witchMap){
            if( witchMap == null ) {
                return ['clamp','clamp'];
            } else {
                var wraps = witchMap.wrapS === THREE.ClampToEdgeWrapping ? 'clamp':
                            witchMap.wrapS === THREE.RepeatWrapping ? 'repeat' : 'mirror';
                var wrapt = witchMap.wrapT === THREE.ClampToEdgeWrapping ? 'clamp':
                            witchMap.wrapT === THREE.RepeatWrapping ? 'repeat' : 'mirror';
                return [wraps,wrapt];
            }
        }
        function parseFilter(witchMap) {
            if( witchMap == null ) {
                return ['LinearFilter', 'LinearMipMapLinearFilter'];
            } else {
                var magFilter = witchMap.magFilter === THREE.NearestFilter ? 'NearestFilter':
                                witchMap.magFilter === THREE.NearestMipMapNearestFilter ? 'NearestMipMapNearestFilter':
                                witchMap.magFilter === THREE.NearestMipMapLinearFilter ? 'NearestMipMapLinearFilter' :
                                witchMap.magFilter === THREE.LinearFilter ? 'LinearFilter' :
                                witchMap.magFilter === THREE.LinearMipMapNearestFilter ? 'LinearMipMapNearestFilter' : 'LinearMipMapLinearFilter';
                var minFilter = witchMap.minFilter === THREE.NearestFilter ? 'NearestFilter':
                                witchMap.minFilter === THREE.NearestMipMapNearestFilter ? 'NearestMipMapNearestFilter':
                                witchMap.minFilter === THREE.NearestMipMapLinearFilter ? 'NearestMipMapLinearFilter' :
                                witchMap.minFilter === THREE.LinearFilter ? 'LinearFilter' :
                                witchMap.minFilter === THREE.LinearMipMapNearestFilter ? 'LinearMipMapNearestFilter' : 'LinearMipMapLinearFilter';
                return [magFilter, minFilter];
            }
        }
        function parseTextureUrl(url) {
            var id = Plane.modelId;
            // var index = url.indexOf(id) + id.length + 1;
            // return url.substring(index);
            // 为什么 material.map.sourceFile 会不是绝对 url 呢

            //...拆东补西代码
            var index = url.indexOf(id);
            index = index === -1 ? 0 : index +  id.length + 1;
            return url.substring(index);
        }
        var mData = {};

        /** 索引 **/
        mData.index = index;
        /** 材质名称 **/
        mData.name = m.name !== undefined && m.name != '' ? m.name : '材质 ' + i;
        /** group **/
        mData.group = m.group !== undefined ? m.group : "";
        /** 可见性 **/
        mData.visible = m.visible;
        /** 材质类型 **/
        mData.shading = Hps.mtype(m);
        /** 材质blending **/
        mData.blending = Hps.btype(m.blending);
        /** wireframe **/
        mData.wireframe = m.wireframe;
        /** side **/
        mData.side = m.side === 0 ? 'FrontSide' : m.side === 1 ? 'BackSide' : 'DoubleSide';
        /** 颜色值 **/
        mData.color = '#' + m.color.getHexString();
        /** 环境光 **/
        if( mData.shading !== 'basic' )
            mData.ambient =  m.ambient !== undefined ? '#' + m.ambient.getHexString() : '#ffffff';
        /** Specular **/
        if( mData.shading === 'phong' )
            mData.specular = m.specular !== undefined ? '#' + m.specular.getHexString() : '#ffffff';
        /** Emissive **/
        if( mData.shading !== 'basic' )
            mData.emissive =  m.emissive !== undefined ? '#' + m.emissive.getHexString() : '#000000';
        /** 透明度 **/
        mData.opacity = m.opacity;
        mData.transparent = m.transparent;
        /** 反射率 **/
        mData.reflectivity = m.reflectivity !== undefined ? m.reflectivity : 1 ;
        /** 折射率 **/
        mData.refractionRatio = m.refractionRatio !== undefined ? m.refractionRatio : 1 ;
        /** 反光度 **/
        if( mData.shading === 'phong' )
            mData.shininess = m.shininess !== undefined ? m.shininess : 30 ;
        

        /** 纹理 **/
        mData.enableMap = m.map == null ? false : true;
        mData.map = m.map === null ?  null : parseTextureUrl(m.map.sourceFile);
        if( m.data !== undefined && m.data.originalMap !== undefined )
            Texture.addTexture({ name: 'map of ' + mData.name , texture: m.data.originalMap });
        mData.mapRepeat = parseRepeat(m.map);
        mData.mapWrap = parseWrap(m.map);
        mData.mapFilter = parseFilter(m.map);
        /** 凹凸Bump 贴图 **/
        if( mData.shading === 'phong' ) {
            mData.enableBump = m.bumpMap == null ? false : true;
            mData.bumpMap = m.bumpMap == null ?  null : parseTextureUrl(m.bumpMap.sourceFile);   //注意这里是 == 而不是 ===
            if( m.data !== undefined && m.data.originalBumpMap !== undefined )
                Texture.addTexture({ name: 'bumpMap of ' + mData.name , texture: m.data.originalBumpMap });
            mData.bumpRepeat = parseRepeat(m.bumpMap);
            mData.bumpWrap = parseWrap(m.bumpMap);
            mData.bumpFilter = parseFilter(m.bumpMap);
        }
        /** 法线Normal 贴图 **/
        if( mData.shading === 'phong' ) {
            mData.enableNormal = m.normalMap == null ? false : true;
            mData.normalMap = m.normalMap == null ?  null : parseTextureUrl(m.normalMap.sourceFile); //注意这里是 == 而不是 ===
            if( m.data !== undefined && m.data.originalNormalMap !== undefined )
                Texture.addTexture({ name: 'normalMap of ' + mData.name , texture: m.data.originalNormalMap });
            mData.normalRepeat = parseRepeat(m.normalMap);
            mData.normalWrap = parseWrap(m.normalMap);
            mData.normalFilter = parseFilter(m.normalMap);
        }
        /** Light 贴图 **/
        mData.enableLight = m.lightMap == null ? false : true;
        mData.lightMap = m.lightMap === null ?  null : parseTextureUrl(m.lightMap.sourceFile);
        if( m.data !== undefined && m.data.originalLightMap !== undefined )
            Texture.addTexture({ name: 'lightMap of ' + mData.name , texture: m.data.originalLightMap });
        mData.lightRepeat = parseRepeat(m.lightMap);
        mData.lightWrap = parseWrap(m.lightMap);
        mData.lightFilter = parseFilter(m.lightMap);
        /** 高光|镜面反射 **/
        mData.enableSpecular = m.specularMap == null ? false : true;
        mData.specularMap = m.specularMap === null ?  null : parseTextureUrl(m.specularMap.sourceFile);
        if( m.data !== undefined && m.data.originalSpecularMap !== undefined )
            Texture.addTexture({ name: 'enableSpecular of ' + mData.name , texture: m.data.originalSpecularMap });
        mData.specularRepeat = parseRepeat(m.specularMap);
        mData.specularWrap = parseWrap(m.specularMap);
        mData.specularFilter = parseFilter(m.specularMap);
        /** 环境反射 **/
        mData.enableEnv = m.envMap == null ? false : true;
        mData.envMap = m.envMap === null ?  null : (function(env){
            var url = env.image[0].src;
            //类似于: http://localhost:8080/data/models/L7K6DV/env/D5Q9HC_px.jpg
            
            return url.substring( url.lastIndexOf("/") + 1, url.lastIndexOf("_") );
        })(m.envMap);

        return mData;
    }

	function parsedMaterials(materials) {
        var parsedData = [];

        for(var i = 0, len = materials.length; i < len; i++) {
            parsedData.push(parsedMaterial(materials[i], i ));
        }
        return parsedData;
    }
	return Parse;
}]);
var directiveDemo = angular.module('editer.directives', ['texture'])
.directive('expander', function(){
	// Runs during compile
	return {
		priority: 1000,
		// terminal: true,
		scope: true,
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: '/js/views/expanderTemplate.html',
		replace: true,
		transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function(scope, iElm, iAttrs, controller) {
			//data
			scope.showMe = false;
			$(iElm).find('.text').html(iAttrs["expanderTitle"]);
			//handdle
			scope.toggle = function() {
				scope.showMe = !scope.showMe;
				if( scope.showMe ) {
					//激活 watch
					//1. 他负责哪几个watch
					//2. 这些watch从哪里来？
					//3. 我怎么知道这些watch有没有正在监视？

				} else {
					//取消 watch
				}
			}
		}
	};
})
.directive('format', function () {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$parsers.push(function (viewValue) {
                return Number(viewValue);
            });
        }
    };
})
.directive('wSwitch', function() {
	return {
		scope: { enable: '=witchEnable' },
		restrict: 'EA',
		templateUrl: '/js/views/switchTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.toggle = function() {
				scope.enable = !scope.enable;
			}

			//scope.$watch('enable', function() { alert('changed')});
		}
	}
})
.directive('wImgcontrol', ['Texture',function(Texture) {
	return {
		scope: {
			textures : '=textureLib' ,
			choosed: '=handdleWitch' ,
			modelId: '@modelId',
			repeat: '=repeatOne',
			wrap: '=wrapOne',
			filter: '=filterOne'
		},
		restrict: 'EA',
		templateUrl: '/js/views/imgcontrolTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;
			scope.createNewone = false;

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.showThis = function() {
				scope.showMe = true;
			}
			scope.hiddenThis = function() {
				scope.showMe = false;
			} 
			//scope.$watch('enable', function() { alert('changed')});
		}
	}
}])
.directive('wEnvcontrol', ['Texture',function(Texture) {
	return {
		scope: { envTextures : '=envLib' , choosed: '=handdleWitch' , modelId: '@modelId' },
		restrict: 'EA',
		templateUrl: '/js/views/envcontrolTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;
			scope.createNewone = false;

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.showThis = function() {
				scope.showMe = true;
			}
			scope.hiddenThis = function() {
				scope.showMe = false;
			}
		}
	}
}])
.directive('wFeatureControl', function() {
	return {
		scope: true,
		restrict: 'EA',
		templateUrl: '/js/views/featureControlTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
		}
	}
})
.directive('wTextureUpload', ['Texture', function(Texture) {
	return {
		scope: {
			createNewone: '=createNewone',
			returnTo: '=returnTo',
			modelId: '@modelId'
		},
		restrict: 'EA',
		templateUrl: '/js/views/textureUploadTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.uploading = false;
			scope.enable = false;
			scope.name = '';

			scope.toSelect = function() {
				//alert('54');
				scope.createNewone = true;
			}
			scope.exitCreate = function() {
				scope.createNewone = false;
			}
			scope.updateNewone = function() {
				var file = $(iElm).find("input[type=file]")[0].files[0];

				if( scope.name === null || scope.name === '' ) {
					alert("为贴图提供命名！");
					return;
				}
				if( file == undefined ) {
					alert("没有选取文件");
					return;
				}

				var fd = new FormData();
				fd.append("name", scope.name );
				fd.append("file", file );

				$.ajax({
					url: '/api/models/' + scope.modelId + '/textures/upload',
					type: 'POST',
					data: fd,
					processData: false,
					contentType: false,
					statusCode : {
						201: function ( res, stausText, xhr ) {
							// CREATED 201
							/* res 返回的body内容
							 * stausText 成功的时候应该是success
							 * xhr 对象
							 */
							 scope.handdleSuccess(res);	//... 返回的是json么??
						},
						400: function () {
							// BAD_REQUEST 400	发送到服务器的对象为空
							scope.uploading = false;
						}
					},
					error: function (xhr, statusText, err) {
			            //StatusCode=2xx或304时执行success, 其余则将触发error
			            alert('上传出现了问题，请重试！');
			            scope.handdleError();
			            //scope.testResponse();
			        }
				});
				scope.uploading = true;
			}
			scope.handdleSuccess = function(res) {
				scope.uploading = false;
				Texture.addTexture(res);
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
			scope.handdleError = function() {
				scope.uploading = false;
				scope.$apply();
			}
			scope.clearInput = function() {
				scope.name = null;
				$(iElm).find("input[type=file]").val("");
			}
			scope.testResponse = function() {
				var res = { id: 'QW23ER4', name: '木头', texture: 'texture/wood.jpg'};
				Texture.addTexture(res);
				scope.returnTo = res.texture;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
		}
	}
}])
.directive('wEnvTextureUpload', ['Texture', function(Texture) {
	return {
		scope: {
			createNewone: '=createNewone',
			returnTo: '=returnTo',
			modelId: '@modelId'
		},
		restrict: 'EA',
		templateUrl: '/js/views/envTextureUploadTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.uploading = false;
			scope.enable = false;
			scope.name = '';

			scope.toSelect = function() {
				//alert('54');
				scope.createNewone = true;
			}
			scope.exitCreate = function() {
				scope.createNewone = false;
			}
			scope.updateNewone = function() {
				var filePx = $(iElm).find("input.filePx")[0].files[0];
				var filePy = $(iElm).find("input.filePy")[0].files[0];
				var filePz = $(iElm).find("input.filePz")[0].files[0];
				var fileNx = $(iElm).find("input.fileNx")[0].files[0];
				var fileNy = $(iElm).find("input.fileNy")[0].files[0];
				var fileNz = $(iElm).find("input.fileNz")[0].files[0];

				if( scope.name === null || scope.name === '' ) {
					alert("为环境提供命名！");
					return;
				}
				if( filePx == undefined || filePy == undefined || filePz == undefined || fileNx == undefined || fileNy == undefined || fileNz == undefined ) {
					alert("没有选取文件");
					return;
				}

				var fd = new FormData();
				fd.append("name", scope.name );
				fd.append("nx", fileNx );
				fd.append("ny", fileNy );
				fd.append("nz", fileNz );
				fd.append("px", filePx );
				fd.append("py", filePy );
				fd.append("pz", filePz );

				$.ajax({
					url: '/api/models/' + scope.modelId + '/envTextures/upload',
					type: 'POST',
					data: fd,
					processData: false,
					contentType: false,
					statusCode : {
						201: function ( res, stausText, xhr ) {
							// CREATED 201
							/* res 返回的body内容
							 * stausText 成功的时候应该是success
							 * xhr 对象
							 */
							 scope.handdleSuccess(res);	//... 返回的是json么??
						},
						400: function () {
							// BAD_REQUEST 400	发送到服务器的对象为空
							scope.uploading = false;
						}
					},
					error: function (xhr, statusText, err) {
			            //StatusCode=2xx或304时执行success, 其余则将触发error
			            alert('上传出现了问题，请重试！');
			            scope.handdleError();
			            //scope.testResponse();
			        }
				});
				scope.uploading = true;
			}
			scope.handdleSuccess = function(res) {
				scope.uploading = false;
				Texture.addEnvTexture(res);
				scope.returnTo = res.id;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
			scope.handdleError = function() {
				scope.uploading = false;
				scope.$apply();
			}
			scope.clearInput = function() {
				scope.name = null;
				$(iElm).find("input.filePx").val("");
				$(iElm).find("input.filePy").val("");
				$(iElm).find("input.filePz").val("");
				$(iElm).find("input.fileNx").val("");
				$(iElm).find("input.fileNy").val("");
				$(iElm).find("input.fileNz").val("");
			}
			scope.testResponse = function() {
				var res = { id: 'ccc', name: 'CCC', texture: ['env/ccc_px.jpg','env/ccc_py.jpg','env/ccc_pz.jpg','env/ccc_nx.jpg','env/ccc_ny.jpg','env/ccc_nz.jpg']};
				Texture.addEnvTexture(res);
				scope.returnTo = res.id;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
		}
	}
}])
.directive('wResourceControl', function() {
	return {
		scope: {
			position: '@rPosition',
			format: '@rFormat',
			name: '@rName',
			modelId: '@modelId',
			handdle: "=rHanddle"
		},
		restrict: 'EA',
		templateUrl: '/js/views/resourceControlTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;
			scope.createNewone = false;

			scope.uploading = false;
			scope.enable = false;

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.toSelect = function() {
				scope.createNewone = true;
			}
			scope.exitCreate = function() {
				scope.createNewone = false;
			}
			scope.updateNewone = function() {
				var file = $(iElm).find("input[type=file]")[0].files[0];

				if( file == undefined ) {
					alert("没有选取文件");
					return;
				}
				//验证文件格式
				if( scope.format !== '' ) {
					var fileFormat = file.name.substr( file.name.lastIndexOf('.') + 1, scope.format.length ).toLowerCase();
					if( fileFormat !== scope.format ) {
						alert("必须上传 " +  scope.format+ "格式");
						return;
					}
				}

				var fd = new FormData();
				fd.append("position", scope.position );
				fd.append("file", file );
				fd.append("name", scope.name );

				$.ajax({
					url: '/api/models/' + scope.modelId + '/resourceUpload',
					type: 'POST',
					data: fd,
					processData: false,
					contentType: false,
					statusCode : {
						201: function ( res, stausText, xhr ) {
							// CREATED 201
							/* res 返回的body内容
							 * stausText 成功的时候应该是success
							 * xhr 对象
							 */
							// scope.handdle = "";	//...小把戏没用
							// scope.$apply();
							scope.handdle = xhr.getResponseHeader("Location");
							scope.handdleSuccess();
						}
					},
					error: function (xhr, statusText, err) {
			            //StatusCode=2xx或304时执行success, 其余则将触发error
			            alert('上传出现了问题，请重试！');
			            scope.handdleError();
			            //scope.testResponse();
			        }
				});
				scope.uploading = true;
			}
			scope.handdleSuccess = function() {
				scope.uploading = false;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
			scope.handdleError = function() {
				scope.uploading = false;
				scope.$apply();
			}
			scope.clearInput = function() {
				$(iElm).find("input[type=file]").val("");
			}
		}
	}
});
var myEditer = angular.module('editer', ['editer.directives','ngRoute','texture','parse'])
.config(function($routeProvider) {
	$routeProvider.
	when('/', { controller: 'materialController', templateUrl: '/js/views/materialEditerTemplate.html'}).
	when('/commonEditer', { controller: 'commonController', templateUrl: '/js/views/commonEditerTemplate.html'}).
	when('/materialEditer', { controller: 'materialController', templateUrl: '/js/views/materialEditerTemplate.html'}).
	when('/sceneEditer', { controller: 'sceneController', templateUrl: '/js/views/sceneEditerTemplate.html'});
});
myEditer.controller('commonController', [ '$scope', '$timeout', 'Parse', function($scope, $timeout, Parse) {
	// data
    $scope.model = Plane.model;
	$scope.common = Parse.getCommon();
	$scope.features = $scope.common.features;
    //$scope.previews = { preview: "/data/models/"+ Plane.modelId +"/preview/preview.png" ,startingPreview: "/data/models/"+ Plane.modelId +"/preview/preview_starting.png"};
    $scope.previews = Parse.checkResource('previews');
    $scope.modelId = Plane.modelId;
    // $scope.$apply();
	// mark
	//$scope.createing = false;
	$scope.feature = $scope.features[0];   //当心没有的情况

    $scope.watchs = {};

    // watch
    $scope.watchs['modelName'] = $scope.$watch('model.name', CMName);
    $scope.watchs['modelDes'] = $scope.$watch('model.des', CMDescribe);

                            // feature 属性
    $scope.watchs['featureTitle'] = $scope.$watch('feature.title', CFTitle);
    $scope.watchs['featureDes'] = $scope.$watch('feature.des', CFDes);
    $scope.watchs['featureFocusPosition'] = $scope.$watch('feature.focus.position', toUpdate, true);
    $scope.watchs['featurePeriodTime'] = $scope.$watch('feature.focus.periodTime', toUpdate);

	// hander
	$scope.cerateNewFeature = function() {
		$scope.features.push( Plane.config.emptyFeature() );
		$scope.feature = $scope.common.features[ $scope.common.features.length - 1 ];

	}
    
	$scope.deleteFeature = function( witch ) {
		var index = $scope.common.features.indexOf(witch);
		$scope.common.features.splice(index, 1);
        // if( $scope.common.features.length !== 0 ) {
        //     $scope.feature = $scope.common.features[ 0 ];
        // } else {
        //     $scope.feature = {};
        // }
        //$scope.$apply();
	}
	$scope.getCameraPosition = function(i) {
        var po = Parse.getCameraPosition();
        // var qu = Parse.getCameraQuaternion();    //不造这个有什么用

        var camPo = $scope.feature.focus.position[i];
		camPo[0] = po[0]; 
        camPo[1] = po[1];
        camPo[2] = po[2];


	}

	// callback
    var tryCount = 0;
    function upMetaToServer() {
        if ( tryCount > 5 ) return;
        $.ajax({
            url: '/models/' + $scope.modelId + '/update',
            type: 'POST',
            data: { name: Plane.model.name, des: Plane.model.des },
            success: function(data) {
                if( tryCount !== 0 )
                    tryCount = 0;
            },
            error: function() {
                tryCount++;
                if (timeout) $timeout.cancel(timeout);
                timeout = $timeout(upMetaToServer, 1000)
                //upMetaToServer();
            }
        });
    }
                    // -------------- model ----------------
    var timeout;
    function CMName(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        if (timeout) $timeout.cancel(timeout);
        timeout = $timeout(upMetaToServer, 3000);
    }
    function CMDescribe(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        if (timeout) $timeout.cancel(timeout);
        timeout = $timeout(upMetaToServer, 3000);
    }
                    // -------------- feature ----------------
    function CFTitle(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        Plane.config.setChanged();
    }
    function CFDes(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        Plane.config.setChanged();
    }
    function toUpdate(n, o) {
        if( n === o ) { return; }

        Plane.config.setChanged();
    }
}]);
myEditer.controller('sceneController', [ '$scope', 'Texture', 'Parse', function($scope, Texture, Parse) {
    // data
    $scope.scene = Parse.getScene();
    $scope.camera = $scope.scene.camera;
    $scope.control = $scope.scene.control;
    $scope.lights = Parse.getLights();
    $scope.background = $scope.scene.background;
    $scope.environment = $scope.scene.environment;
    $scope.envTextures = Texture.getEnvTextures();

    $scope.modelId = Plane.modelId;

    // mark
    $scope.light = $scope.lights[0];    // 当前持有的light配置
    $scope.targetLight = Plane.lights[0];   // 当前正在编辑的THREE灯光
    $scope.targetCamera = Plane.modelViewer.userCamera;
    $scope.targetControl = Plane.modelViewer.control;
    $scope.targetEnvironment = Plane.modelViewer.SkyBox;

    $scope.watchs = {};

    // handdle
    $scope.setWatch = function(witch) {
        //添加一组监控
    }
    $scope.getCameraPosition = function() {
        var po = Parse.getCameraPosition();
        $scope.camera.position[0] = po[0];
        $scope.camera.position[1] = po[1];
        $scope.camera.position[2] = po[2];
    }
    $scope.getCameraDistance = function(witch) {
        if( witch === 0 ) {
            $scope.control.minDistance = Parse.getCameraDistance();
        }
        if( witch === 1 ) {
            $scope.control.maxDistance = Parse.getCameraDistance();
        }
    }
    $scope.getCameraTarget = function() {
        $scope.camera.lookat = Parse.getCameraTarget();
    }
    $scope.getLightPosition = function() {
        var po = Parse.getCameraPosition();
        $scope.light.position[0] = po[0];
        $scope.light.position[1] = po[1];
        $scope.light.position[2] = po[2];
    }
    // watch
    $scope.watchs['light'] = $scope.$watch('light', changeALight);
                        // camera 属性
    $scope.watchs['cameraFront'] = $scope.$watch('camera.front', CCFront);
    $scope.watchs['cameraBack'] = $scope.$watch('camera.back', CCBack);
    $scope.watchs['cameraPosition'] = $scope.$watch('camera.position', CCPosition, true);
                       // Control 属性
    // $scope.watchs['controlType'] = $scope.$watch('control.type', CControlType);
    $scope.watchs['controlZoom'] = $scope.$watch('control.zoom', CControlZoom);
    $scope.watchs['controlPan'] = $scope.$watch('control.pan', CControlPan);
    $scope.watchs['controlAutoRotate'] = $scope.$watch('control.autoRotate', CControlAutoRotate);
    $scope.watchs['controlMaxDistance'] = $scope.$watch('control.maxDistance', CControlMaxDistance);
    $scope.watchs['controlMinDistance'] = $scope.$watch('control.minDistance', CControlMinDistance);
    $scope.watchs['controlMinPolarAngle'] = $scope.$watch('control.minPolarAngle', CControlMinPolarAngle);
    $scope.watchs['controlMaxPolarAngle'] = $scope.$watch('control.maxPolarAngle', CControlMaxPolarAngle);
                        // light 属性
    $scope.watchs['lightType'] = $scope.$watch('light.type', CLType);
    $scope.watchs['lightName'] = $scope.$watch('light.name', CLName);
    $scope.watchs['lightColor'] = $scope.$watch('light.color', CLColor);
    $scope.watchs['lightIntensity'] = $scope.$watch('light.intensity', CLIntensity);
    $scope.watchs['lightDistance'] = $scope.$watch('light.distance', CLDistance);
    $scope.watchs['lightPosition'] = $scope.$watch('light.position', CLPosition, true);
                        // background 属性
    $scope.watchs['backgroundType'] = $scope.$watch('background.type', CBgType);
    $scope.watchs['backgroundColor'] = $scope.$watch('background.color', CBgColor);
    $scope.watchs['backgroundImage'] = $scope.$watch('background.image', CBgImage);
                        // Environment 属性
    $scope.watchs['environmentEnable'] = $scope.$watch('environment.enable', CEEnable);
    $scope.watchs['environmentSkybox'] = $scope.$watch('environment.skybox', CESkybox);
    $scope.watchs['environmentSize'] = $scope.$watch('environment.size', CESize);
    // callback 
    function changeALight(n, o) {
        //跟换了目标灯光，要重新设置标记
        //setWatches();
        //重新指定配置模块的地址
        var t = $scope.lights.indexOf($scope.light);
        //alert( '更换灯光 : '  + t ); 
        $scope.targetLight = Plane.lights[t];
    }

                    // -------------- camera ----------------
    function CCFront(n, o) {
        if( n === o ) { return; }

        $scope.targetCamera.near = Number(n);
        $scope.targetCamera.updateProjectionMatrix();
        console.log($scope.targetCamera);
        Plane.config.setChanged();
    }
    function CCBack(n, o) {
        if( n === o ) { return; }

        $scope.targetCamera.far = Number(n);
        $scope.targetCamera.updateProjectionMatrix();
        Plane.config.setChanged();
    }
    function CCPosition(n, o) {
        if( n === o ) { return; }

        new TWEEN.Tween( $scope.targetCamera.position )
        .to({
            x : Number(n[0]),
            y : Number(n[1]),
            z : Number(n[2])
            }, 700)
        .easing( TWEEN.Easing.Sinusoidal.Out )
        .start();
        $scope.targetCamera.updateProjectionMatrix();
        Plane.config.setChanged();
    }
                    // -------------- control ----------------
    function CControlType(n, o) {
        if( n === o ) { return; }
        //...
    }
    function CControlZoom(n, o) {
        if( n === o ) { return; }
        
        $scope.targetControl.noZoom = !n;
        Plane.config.setChanged();
    }
    function CControlPan(n, o) {
        if( n === o ) { return; }

        $scope.targetControl.noPan = !n;
        Plane.config.setChanged();
    }
    function CControlAutoRotate(n, o) {
        if( n === o ) { return; }
        
        $scope.targetControl.autoRotate = n;
        Plane.config.setChanged();
    }
    function CControlMaxDistance(n, o) {
        if( n === o ) { return; }
        
        if( n < $scope.control.minDistance ) {
            $scope.control.maxDistance = $scope.control.minDistance;
            Plane.config.setChanged();

            alert("最远距离 " + n + " 不能小于 最近距离 " + $scope.control.minDistance + " ！");
            return;
        }
        $scope.targetControl.maxDistance = n;
        Plane.config.setChanged();
    }
    function CControlMinDistance(n, o) {
        if( n === o ) { return; }
        
        if( n > $scope.control.maxDistance ) {
            $scope.control.minDistance = $scope.control.maxDistance;
            Plane.config.setChanged();

            alert("最近距离 " + n + " 不能大于 最远距离 " + $scope.control.maxDistance + " ！");
            return;
        }
        $scope.targetControl.minDistance =n;
        Plane.config.setChanged();
    }
    function CControlMinPolarAngle(n, o) {
        if( n === o ) { return; }

        $scope.targetControl.minPolarAngle = n;
        Plane.config.setChanged();
    }
    function CControlMaxPolarAngle(n, o) {
        if( n === o ) { return; }

        $scope.targetControl.maxPolarAngle = n;
        Plane.config.setChanged();
    }
                    // -------------- light ----------------
    function CLType(n, o) {
        if( n === o ) { return; }

        //$scope.targetLight.type...;
        Plane.config.setChanged();
    }
    function CLName(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.name = n;
        Plane.config.setChanged();
    }
    function CLColor(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.color.setStyle(n);
        Plane.config.setChanged();
    }
    function CLIntensity(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.intensity = Number(n);
        Plane.config.setChanged();
    }
    function CLDistance(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.distance = Number(n);
        Plane.config.setChanged();
    }
    function CLPosition(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.position.fromArray(n);
        Plane.config.setChanged();
    }
                    // -------------- background ----------------
    function CBgType(n, o) {
        if( n === o ) { return; }

        //设置css样式
        if( n === "color" ) {
            $('#WebGLContainer canvas').css({ "background-image" : "" });
        }
        if( n === "image" ) {
            $('#WebGLContainer canvas').css({ "background-image" : "url(" + $scope.background.image + ")" });
        }
        Plane.config.setChanged();
    }
    function CBgColor(n, o) {
        if( n === o ) { return; }

        //设置css样式
        $('#WebGLContainer ').css({ "background" : n });
        Plane.config.setChanged();
    }
    function CBgImage(n, o) {
        if( n === o ) { return; }

        $('#WebGLContainer canvas').css({ "background-image" : "url("+ n +")" });
        //设置css样式
        Plane.config.setChanged();
    }

                    // -------------- Environment ----------------
    function CEEnable(n, o) {
        if( n === o ) { return; }

        if( n )
            $scope.targetEnvironment.enable();
        else
            $scope.targetEnvironment.disable();

        Plane.config.setChanged();
    }
    function CESkybox(n, o) {
        if( n === o ) { return; }

        $scope.targetEnvironment.init(n);

        Plane.config.setChanged();
    }
    function CESize(n, o) {
        if( n === o ) { return; }

        $scope.targetEnvironment.init($scope.environment.skybox, n);
        //$scope.targetEnvironment.resize(n);   //... 这个没搞定
        Plane.config.setChanged();
    }

}]);
myEditer.controller('materialController', [ '$scope', 'Texture', 'Parse', function($scope, Texture, Parse) {
    // data
 	$scope.materials = Parse.getMaterials();
 	$scope.textures = Texture.getTextures();
    $scope.envTextures = Texture.getEnvTextures();
    $scope.modelId = Plane.modelId;

 	// mark
 	$scope.material = $scope.materials[0];	// 解析出来的数据
    $scope.target = Plane.materials[ $scope.material.index ];   // 当前正在编辑的材质
 	$scope.conf = Plane.conf.material[ $scope.material.index ] || {};
            Plane.conf.material[ $scope.material.index ] = $scope.conf;
    //$scope.geometry = Plane.geometry;
 	$scope.watchs = {};

 	// handdle
 	$scope.removeCurrentGroup = function() {
 		$scope.material.group = null;
 	}
 	function setWatches() {
 		for( key in $scope.watchs ) {
 			//cancel watches
 			$scope.watchs[key]();
 		}
 		//reset watches
        $scope.watchs['name'] = $scope.$watch('material.name', CMName);
        $scope.watchs['group'] = $scope.$watch('material.group', CMGroup);
        $scope.watchs['visible'] = $scope.$watch('material.visible', CMVisible);
        $scope.watchs['shading'] = $scope.$watch('material.shading', CMShade);
        $scope.watchs['blending'] = $scope.$watch('material.blending', CMBlending);
        $scope.watchs['side'] = $scope.$watch('material.side', CMSide);
        $scope.watchs['wireframe'] = $scope.$watch('material.wireframe', CMWireframe);
        $scope.watchs['color'] = $scope.$watch('material.color', CMColor);
        $scope.watchs['ambient'] = $scope.$watch('material.ambient', CMAmbient);
        $scope.watchs['specular'] = $scope.$watch('material.specular', CMSpecular);
        $scope.watchs['emissive'] = $scope.$watch('material.emissive', CMEmissive);
        $scope.watchs['transparent'] = $scope.$watch('material.transparent', CMTransparent);
        $scope.watchs['opacity'] = $scope.$watch('material.opacity', CMOpacity);
        $scope.watchs['reflectivity'] = $scope.$watch('material.reflectivity', CMReflectivity);
        $scope.watchs['refractionRatio'] = $scope.$watch('material.refractionRatio', CMRefractionRatio);
        // 
        $scope.watchs['shininess'] = $scope.$watch('material.shininess', CMShininess);
        $scope.watchs['map'] = $scope.$watch('material.map', CMMap);
        $scope.watchs['specularMap'] = $scope.$watch('material.specularMap', CMSpecularMap);
        $scope.watchs['bumpMap'] = $scope.$watch('material.bumpMap', CMBumpMap);
        $scope.watchs['normalMap'] = $scope.$watch('material.normalMap', CMNormalMap);
        $scope.watchs['lightMap'] = $scope.$watch('material.lightMap', CMLightMap);
        $scope.watchs['envMap'] = $scope.$watch('material.envMap', CMEnvMap);
        $scope.watchs['enableMap'] = $scope.$watch('material.enableMap', CMMapEnable);
        $scope.watchs['enableBump'] = $scope.$watch('material.enableBump', CMBumpEnable);
        $scope.watchs['enableNormal'] = $scope.$watch('material.enableNormal', CMNormallEnable);
        $scope.watchs['enableLight'] = $scope.$watch('material.enableLight', CMLightEnable);
        $scope.watchs['enableSpecular'] = $scope.$watch('material.enableSpecular', CMSpecularEnable);
        $scope.watchs['enableEnv'] = $scope.$watch('material.enableEnv', CMEnvEnable);
        //
        $scope.watchs['mapRepeat'] = $scope.$watch('material.mapRepeat', CMMapRepeat, true);
        $scope.watchs['specularRepeat'] = $scope.$watch('material.specularRepeat', CMSpecularRepeat, true);
        $scope.watchs['bumpRepeat'] = $scope.$watch('material.bumpRepeat', CMBumpRepeat, true);
        $scope.watchs['normalRepeat'] = $scope.$watch('material.normalRepeat', CMNormalRepeat, true);
        $scope.watchs['lightRepeat'] = $scope.$watch('material.lightRepeat', CMLightRepeat, true);
        $scope.watchs['mapWrap'] = $scope.$watch('material.mapWrap', CMMapWrap, true);
        $scope.watchs['specularWrap'] = $scope.$watch('material.specularWrap', CMSpecularWrap, true);
        $scope.watchs['bumpWrap'] = $scope.$watch('material.bumpWrap', CMBumpWrap, true);
        $scope.watchs['normalWrap'] = $scope.$watch('material.normalWrap', CMNormalWrap, true);
        $scope.watchs['lightWrap'] = $scope.$watch('material.lightWrap', CMLightWrap, true);
        $scope.watchs['mapFilter'] = $scope.$watch('material.mapFilter', CMMapFilter, true);
        $scope.watchs['specularFilter'] = $scope.$watch('material.specularFilter', CMSpecularFilter, true);
        $scope.watchs['bumpFilter'] = $scope.$watch('material.bumpFilter', CMBumpFilter, true);
        $scope.watchs['normalFilter'] = $scope.$watch('material.normalFilter', CMNormalFilter, true);
        $scope.watchs['lightFilter'] = $scope.$watch('material.lightFilter', CMLightFilter, true);
 	}
    function clearAllWatch() {
        //取消一组监控
        for( key in $scope.watchs ) {
            $scope.watchs[key]();
        }
    }
 	function clearWatch(witch) {
 		//取消一组监控
 	}
 	function setWatch(witch) {
 		//添加一组监控
 	}
 	//watch
 	$scope.$watch('material', changeAMaterial);
 	//setWatches();

 	//callback
 	function changeAMaterial(n, o) {
 		//跟换了目标材质，要重新设置监听
 		setWatches();
 		//重新指定配置模块的地址
 		$scope.conf = Plane.conf.material[ $scope.material.index ] || {};
            Plane.conf.material[ $scope.material.index ] = $scope.conf;
        $scope.target = Plane.materials[ $scope.material.index ];
 		//console.log( '跟换材质' ); 
 	}
    function createTexture(witch, mData) {
        //mData 是编辑器模板持有的模型数据
        var wrapMap = {
            "clamp": THREE.ClampToEdgeWrapping,
            "repeat": THREE.RepeatWrapping,
            "mirror": THREE.MirroredRepeatWrapping
        }
        if( witch === 'map' ) {
            if( $scope.material.map === null ) return null; //注意这里检查的 $scope.material.map 是 Parse 数据
            var wrapS = wrapMap[mData.mapWrap[0]],
                wrapT = wrapMap[mData.mapWrap[1]],
                repeat = mData.mapRepeat;

            var t = THREE.ImageUtils.loadTexture( '/data/models/' + $scope.modelId + '/' + $scope.material.map );
            t.wrapS = wrapS;
            t.wrapT = wrapT;
            t.repeat.fromArray(repeat);
            return t;
        }
        if( witch === 'specularMap' ) {
            if( $scope.material.specularMap === null ) return null; //注意这里检查的 $scope.material.specularMap 是 Parse 数据
            var wrapS = wrapMap[mData.specularWrap[0]],
                wrapT = wrapMap[mData.specularWrap[1]],
                repeat = mData.specularRepeat;

            var t = THREE.ImageUtils.loadTexture( '/data/models/' + $scope.modelId + '/' + $scope.material.specularMap );
            t.wrapS = wrapS;
            t.wrapT = wrapT;
            t.repeat.fromArray(repeat);
            return t;
        }
        if( witch === 'bumpMap' ) {
            if( $scope.material.bumpMap === null ) return null; //注意这里检查的 $scope.material.bumpMap 是 Parse 数据
            var wrapS = wrapMap[mData.bumpWrap[0]],
                wrapT = wrapMap[mData.bumpWrap[1]],
                repeat = mData.bumpRepeat;

            var t =  THREE.ImageUtils.loadTexture( '/data/models/' + $scope.modelId + '/' + $scope.material.bumpMap );
            t.wrapS = wrapS;
            t.wrapT = wrapT;
            t.repeat.fromArray(repeat);
            return t;
        }
        if( witch === 'normalMap' ) {
            if( $scope.material.normalMap === null ) return null; //注意这里检查的 $scope.material.normalMap 是 Parse 数据
            var wrapS = wrapMap[mData.normalWrap[0]],
                wrapT = wrapMap[mData.normalWrap[1]],
                repeat = mData.normalRepeat;

            var t = THREE.ImageUtils.loadTexture( '/data/models/' + $scope.modelId + '/' + $scope.material.normalMap );
            t.wrapS = wrapS;
            t.wrapT = wrapT;
            t.repeat.fromArray(repeat);
            return t;
        }
        if( witch === 'lightMap' ) {
            if( $scope.material.lightMap === null ) return null; //注意这里检查的 $scope.material.normalMap 是 Parse 数据
            var wrapS = wrapMap[mData.lightWrap[0]],
                wrapT = wrapMap[mData.lightWrap[1]],
                repeat = mData.lightRepeat;
            
            var t =  THREE.ImageUtils.loadTexture( '/data/models/' + $scope.modelId + '/' + $scope.material.lightMap );
            t.wrapS = wrapS;
            t.wrapT = wrapT;
            t.repeat.fromArray(repeat);
            return t;
        }
        if( witch === 'envMap' ) {
            if( $scope.material.envMap === null ) return null; //注意这里检查的 $scope.material.envMap 是 Parse 数据

            //这个地方的疑惑是 // envMap 的值 : 是一个 id
            var sb = "/data/models/" + $scope.modelId + "/env/" + $scope.material.envMap;
            var urls = [ sb + "_px.jpg", sb + "_nx.jpg",
                         sb + "_py.jpg", sb + "_ny.jpg",
                         sb + "_pz.jpg", sb + "_nz.jpg" ];

            return THREE.ImageUtils.loadTextureCube( urls );
        }
        
    }
    function updateGeometry() {
        var geometry = Plane.geometry;      //也不知道有没有用
        //geometry.verticesNeedUpdate = true;
        //geometry.elementsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        //geometry.tangentsNeedUpdate = true;
        //geometry.colorsNeedUpdate = true;
        //geometry.lineDistancesNeedUpdate = true;

        geometry.buffersNeedUpdate = true;
    }
    //editing
 	function CMName(n, o) {
 		if( n === o ) { return; }

 		$scope.target.name = n;
 		Plane.config.edit( { DbgName : n }, $scope.conf );
 	}
    function CMGroup(n, o) {
        if( n === o ) { return; }

        $scope.target.group = n;
        Plane.config.edit( { group : n }, $scope.conf );
    }
 	function CMColor(n, o) {
        if( n === o ) { return; }

        $scope.target.color.setStyle(n);
        Plane.config.edit( { colorDiffuse : Hps.style2array(n) }, $scope.conf);
    }
    function CMAmbient(n, o) {
        if( n === o ) { return; }

        $scope.target.ambient.setStyle(n);
        $scope.target.needsUpdate = true;
        Plane.config.edit( { colorAmbient : Hps.style2array(n) }, $scope.conf);
    }
    function CMSpecular(n, o) {
        if( n === o ) { return; }

        $scope.target.specular.setStyle(n);
        Plane.config.edit( { colorSpecular : Hps.style2array(n) }, $scope.conf);
    }
    function CMEmissive(n, o) {
        if( n === o ) { return; }

        $scope.target.emissive.setStyle(n);
        Plane.config.edit( { colorEmissive : Hps.style2array(n) }, $scope.conf);    //...这个应该是自己命名的
    }
    function CMTransparent(n, o ) {
        if( n === o ) { return; }

        $scope.target.transparent = n;
        Plane.config.edit( { transparent : n }, $scope.conf);
    }
    function CMOpacity(n, o ) {
        if( n === o ) { return; }

        $scope.target.opacity = n;
        Plane.config.edit( { transparency : Number(n) }, $scope.conf);
    }
    function CMReflectivity(n, o) {
        if( n === o ) { return; }

        $scope.target.reflectivity = n;
        Plane.config.edit( { reflectivity : Number(n) }, $scope.conf);
    }
    function CMRefractionRatio(n, o) {
        if( n === o ) { return; }

        $scope.target.refractionRatio = n;
        Plane.config.edit( { refractionRatio : Number(n) }, $scope.conf);  //...这个应该是自己命名的
    }
    function CMShininess(n, o) {
        if( n === o ) { return; }

        $scope.target.shininess = n;
        Plane.config.edit( { specularCoef : Number(n) }, $scope.conf);
    }
    function CMVisible(n, o) {
        if( n === o ) { return; }

        $scope.target.visible = n;
        Plane.config.edit( { visible : n }, $scope.conf);
    }
    function CMMap(n, o) {
        if( n === o ) { return; }

        $scope.target.map = createTexture('map', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        updateGeometry();
        Plane.config.edit( { mapDiffuse : n }, $scope.conf);
    }
    function CMSpecularMap(n, o) {
        if( n === o ) { return; }

        $scope.target.specularMap = createTexture('specularMap', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        updateGeometry();
        Plane.config.edit( { mapSpecular : n }, $scope.conf);
    }
    function CMBumpMap(n, o) {
        if( n === o ) { return; }

        $scope.target.bumpMap = createTexture('bumpMap', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        updateGeometry();
        Plane.config.edit( { mapBump : n }, $scope.conf);
    }
    function CMNormalMap(n, o) {
        if( n === o ) { return; }

        $scope.target.normalMap = createTexture('normalMap', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        updateGeometry();
        Plane.config.edit( { mapNormal : n }, $scope.conf);
    }
    function CMLightMap(n, o) {
        if( n === o ) { return; }

        $scope.target.lightMap = createTexture('lightMap', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        updateGeometry();
        Plane.config.edit( { mapLight : n }, $scope.conf);
    }
    function CMEnvMap(n, o) {
        if( n === o ) { return; }

        $scope.target.envMap = createTexture('envMap');  //要缓存
        $scope.target.needsUpdate = true;
        Plane.config.edit( { mapEnv : n }, $scope.conf);    //...这个应该是自己命名的
    }
    function CMMapEnable(n, o) {
        if( n === o ) { return; }

        $scope.target.map = n === false ? null : createTexture('map', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        Plane.config.edit( { enableMap : n }, $scope.conf);
    }
    function CMBumpEnable(n, o) {
        if( n === o ) { return; }

        $scope.target.bumpMap = n === false ? null : createTexture('bumpMap', $scope.material);  //要缓存
        $scope.target.needsUpdate = true;
        Plane.config.edit( { enableBump : n }, $scope.conf);
    }
    function CMNormallEnable(n, o) {
        if( n === o ) { return; }

        $scope.target.normalMap = n === false ? null : createTexture('normalMap', $scope.material);
        $scope.target.needsUpdate = true;
        Plane.config.edit( { enableNormal : n }, $scope.conf);
    }
    function CMLightEnable(n, o) {
        if( n === o ) { return; }

        $scope.target.lightMap = n === false ? null : createTexture('lightMap', $scope.material);
        $scope.target.needsUpdate = true;
        Plane.config.edit( { enableLight : n }, $scope.conf);
    }
    function CMSpecularEnable(n, o) {
        if( n === o ) { return; }

        $scope.target.specularMap = n === false ? null : createTexture('specularMap', $scope.material);
        $scope.target.needsUpdate = true;
        Plane.config.edit( { enableSpecular : n }, $scope.conf);
    }
    function CMEnvEnable(n, o) {
        if( n === o ) { return; }

        $scope.target.envMap = n === false ? null : createTexture('envMap');
        $scope.target.needsUpdate = true;
        Plane.config.edit( { enableEnv : n }, $scope.conf);
    }
    function CMMapRepeat(n, o) {
        if( n === o ) { return; }

        $scope.target.map.repeat.fromArray(n);
        $scope.target.map.needsUpdate = true;
        Plane.config.edit( { mapDiffuseRepeat : n }, $scope.conf);
    }
    function CMSpecularRepeat(n, o) {
        if( n === o ) { return; }

        $scope.target.specularMap.repeat.fromArray(n);
        $scope.target.specularMap.needsUpdate = true;
        Plane.config.edit( { mapSpecularRepeat : n }, $scope.conf);
    }
    function CMBumpRepeat(n, o) {
        if( n === o ) { return; }

        $scope.target.bumpMap.repeat.fromArray(n);
        $scope.target.bumpMap.needsUpdate = true;
        Plane.config.edit( { mapBumpRepeat : n }, $scope.conf);
    }
    function CMNormalRepeat(n, o) {
        if( n === o ) { return; }

        $scope.target.normalMap.repeat.fromArray(n);
        $scope.target.normalMap.needsUpdate = true;
        Plane.config.edit( { mapNormalRepeat : n }, $scope.conf);
    }
    function CMLightRepeat(n, o) {
        if( n === o ) { return; }

        $scope.target.lightMap.repeat.fromArray(n);
        $scope.target.lightMap.needsUpdate = true;
        Plane.config.edit( { mapLightRepeat : n }, $scope.conf);
    }
    function CMMapWrap(n, o) {
        if( n === o ) { return; }

        var wrapMap = {
            "clamp": THREE.ClampToEdgeWrapping,
            "repeat": THREE.RepeatWrapping,
            "mirror": THREE.MirroredRepeatWrapping
        }
        $scope.target.map.wrapS = wrapMap[n[0]];
        $scope.target.map.wrapT = wrapMap[n[1]];
        $scope.target.map.needsUpdate = true;
        Plane.config.edit( { mapDiffuseWrap : n }, $scope.conf);
    }
    function CMSpecularWrap(n, o) {
        if( n === o ) { return; }

        var wrapMap = {
            "clamp": THREE.ClampToEdgeWrapping,
            "repeat": THREE.RepeatWrapping,
            "mirror": THREE.MirroredRepeatWrapping
        }
        $scope.target.specularMap.wrapS = wrapMap[n[0]];
        $scope.target.specularMap.wrapT = wrapMap[n[1]];
        $scope.target.specularMap.needsUpdate = true;
        Plane.config.edit( { mapSpecularWrap : n }, $scope.conf);
    }
    function CMBumpWrap(n, o) {
        if( n === o ) { return; }

        var wrapMap = {
            "clamp": THREE.ClampToEdgeWrapping,
            "repeat": THREE.RepeatWrapping,
            "mirror": THREE.MirroredRepeatWrapping
        }
        $scope.target.bumpMap.wrapS = wrapMap[n[0]];
        $scope.target.bumpMap.wrapT = wrapMap[n[1]];
        $scope.target.bumpMap.needsUpdate = true;
        Plane.config.edit( { mapBumpWrap : n }, $scope.conf);
    }
    function CMNormalWrap(n, o) {
        if( n === o ) { return; }

        var wrapMap = {
            "clamp": THREE.ClampToEdgeWrapping,
            "repeat": THREE.RepeatWrapping,
            "mirror": THREE.MirroredRepeatWrapping
        }
        $scope.target.normalMap.wrapS = wrapMap[n[0]];
        $scope.target.normalMap.wrapT = wrapMap[n[1]];
        $scope.target.normalMap.needsUpdate = true;
        Plane.config.edit( { mapNormalWrap : n }, $scope.conf);
    }
    function CMLightWrap(n, o) {
        if( n === o ) { return; }

        var wrapMap = {
            "clamp": THREE.ClampToEdgeWrapping,
            "repeat": THREE.RepeatWrapping,
            "mirror": THREE.MirroredRepeatWrapping
        }
        $scope.target.lightMap.wrapS = wrapMap[n[0]];
        $scope.target.lightMap.wrapT = wrapMap[n[1]];
        $scope.target.lightMap.needsUpdate = true;
        Plane.config.edit( { mapLightWrap : n }, $scope.conf);
    }
    function CMMapFilter(n, o) {
        if( n === o ) { return; }

        $scope.target.map.magFilter = THREE[n[0]];
        $scope.target.map.minFilter = THREE[n[1]];
        $scope.target.map.needsUpdate = true;
        Plane.config.edit( { mapDiffuseFilter : n }, $scope.conf);  //------------- 这个是自己命名的
    }
    function CMSpecularFilter(n, o) {
        if( n === o ) { return; }

        $scope.target.specularMap.magFilter = THREE[n[0]];
        $scope.target.specularMap.minFilter = THREE[n[1]];
        $scope.target.specularMap.needsUpdate = true;
        Plane.config.edit( { mapSpecularFilter : n }, $scope.conf);  //------------- 这个是自己命名的
    }
    function CMBumpFilter(n, o) {
        if( n === o ) { return; }

        $scope.target.bumpMap.magFilter = THREE[n[0]];
        $scope.target.bumpMap.minFilter = THREE[n[1]];
        $scope.target.bumpMap.needsUpdate = true;
        Plane.config.edit( { mapBumpFilter : n }, $scope.conf);  //------------- 这个是自己命名的
    }
    function CMNormalFilter(n, o) {
        if( n === o ) { return; }

        $scope.target.normalMap.magFilter = THREE[n[0]];
        $scope.target.normalMap.minFilter = THREE[n[1]];
        $scope.target.normalMap.needsUpdate = true;
        Plane.config.edit( { mapNormalFilter : n }, $scope.conf);  //------------- 这个是自己命名的
    }
    function CMLightFilter(n, o) {
        if( n === o ) { return; }

        $scope.target.lightMap.magFilter = THREE[n[0]];
        $scope.target.lightMap.minFilter = THREE[n[1]];
        $scope.target.lightMap.needsUpdate = true;
        Plane.config.edit( { mapLightFilter : n }, $scope.conf);  //------------- 这个是自己命名的
    }

    function CMShade(n, o) {
        if( n === o ) { return; }
        //1. 调用Loader重新创建材质
        //2. 调用conf重新配置该材质
        //3. 重新解析该材质
        //4. 更新一些引用
        if( n === Hps.mtype($scope.target) ) return;
        var index = $scope.material.index;
        var originalData = Plane.model.metaMaterial[index];
        originalData.shading = n;
        $scope.conf.shading = n;
        //1. 调用Loader重新创建材质
        var newMaterial = THREE.Loader.prototype.createMaterial(originalData, "/data/models/" + Plane.modelId + "/" );
        Plane.materials[index] = newMaterial;
            //console.log(newMaterial);
        //2. 调用conf重新配置该材质
        JSONModel.prototype.editMaterial($scope.conf , newMaterial);
        
        //3. 重新解析该材质
        clearAllWatch();
        $scope.materials[index] = Parse.parsedMaterial(newMaterial, index);
        setWatches();
        //4. 更新一些引用
        $scope.target = newMaterial;
        $scope.material = $scope.materials[index];
        $scope.target.needsUpdate = true;

        // if( n === 'basic' ) {
        //     newMaterial = new THREE.MeshBasicMaterial();
        // }
        // if( n === 'phong' ) {
        //     newMaterial = new THREE.MeshPhongMaterial();
        // }
        // if( n === 'lambert' ) {
        //     newMaterial = new THREE.MeshLambertMaterial();
        // }
        //...更新对象的type属性，从而使模板重新渲染

        //$scope.target = newMaterial.copy( $scope.target );
        //alert('Change shading type ');
        
        //Plane.config.edit( {shading: n }, $scope.conf);
        Plane.config.setChanged();   //shading不用设置了，前面就设置过了
    }
    function CMBlending(n, o) {
        if( n === o ) { return; }
        
        if( THREE[n] === undefined ) return;
        $scope.target.blending = THREE[n];
        $scope.target.needsUpdate = true;
        Plane.config.edit( { blending : n }, $scope.conf);
    }
    function CMSide(n, o) {
        if( n === o ) { return; }

        if( THREE[n] === undefined ) return;
        $scope.target.side = THREE[n];
        $scope.target.needsUpdate = true;
        Plane.config.edit( { side : n }, $scope.conf);   //...这个应该是自己命名的
    }
    function CMWireframe(n, o) {
        if( n === o ) { return; }

        $scope.target.wireframe = n;
        $scope.target.needsUpdate = true;
        Plane.config.edit( { wireframe : n }, $scope.conf);   //...这个应该是自己命名的
    }
}]);
Editer = function() {}
Editer.prototype = new Sim.Publisher;
Editer.prototype.init = function () {
    this.subscribe('loaded', this, this.onModelLoaded);
    this.subscribe('configed', this, this.onConfiged);
    return this;
}
Editer.prototype.startAngularRun = function () {
    //alert('启动 angular');
    angular.bootstrap($("#editer"), ['editer']);
};
Editer.prototype.onModelLoaded = function () {  this.loaded = true; this.todo();}
Editer.prototype.onConfiged = function () { this.configed = true; this.todo();}
Editer.prototype.todo = function () {
	if ( new Date().getTime() > 1406908800000 )
		return;
    if( this.loaded && this.configed ) {
        this.startAngularRun();
    }
}
new Editer().init();