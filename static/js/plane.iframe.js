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
/*
 * 2014/5/21
 * previewer
 */
function getRequest() {  
	var s = /\/scenes\/(\w+)/;
	var i = /\/iframe\/(\w+)/;
	if ( s.test( document.URL ) || i.test( document.URL ) ) {
		var modelId = RegExp.$1;
		return modelId;
	}
}
Previewer = function() {
 	this.previewId = getRequest();
 	this.files = null;	//array thar list of filenames
 	this.previews = [];	//images need preload
}
//init viewer
Previewer.prototype.init = function() {
	//1. 创建dom
	//2. 加载数据

	//1. create dom
	var contatiner = new EJS({ url :'/template/temp_previewer.ejs'}).render({ id: this.previewId });
	$("#WebGLContainer").append(contatiner);
	this.dom = $("#previewer");
	this.imgHandler = this.dom.find("#imgHandler")[0];

	//2. load datas
	this.loadImgs( this.previewId );
}
//load the images
Previewer.prototype.loadImgs = function( id ) {
	/* 1. get resources list
	 * 2. load all image files if previews exist
	 *
	 */
	var url = '/data/models/'+ id +'/preview/';
	var _this = this;
	$.ajax({
        type: 'GET',
        url: url + 'preview.list',
        success: function(data) {
            _this.files = JSON.parse(data);
            if ( !_this.files instanceof Array ) return;
			for( var i = 0, len = _this.files.length; i < len; i++ ) {
				_this.previews[i] = new Image();
				_this.previews[i].src = url + _this.files[i];
			}
			_this.imgHandler.src = _this.previews[0].src;
			_this.initControl.call(_this);
			$("#previewerApplyTips").css('display', 'block');
        },
        error: function() {
			console.log("Oops!...")
        }
    });

}
//init the control
Previewer.prototype.initControl = function() {
	var el = this.dom[0];
	var img = this.imgHandler;
	var previews = this.previews;
	var counts = this.files.length;
	var rightNow = 0;
	var xS = x = 0;

	function onMouseDown( event ) {
		xS = event.clientX;

		el.addEventListener( 'mousemove', onMouseMove, false );
		el.addEventListener( 'mouseup', onMouseUp, false );
	}
	function onMouseMove( event ) {
		event.preventDefault();

		x = event.clientX - xS;
		xS = event.clientX;
		if( Math.abs( x ) < 2 ) return;

		if ( x < 0 )
			rightNow = (rightNow + 1) % counts;
		else
			if ( rightNow - 1 < 0 ) 
				rightNow = counts - 1;
			else
				rightNow = rightNow - 1;

		img.src = previews[rightNow].src;
	}
	function onMouseUp( event ) {
		el.removeEventListener( 'mousemove', onMouseMove, false );
		el.removeEventListener( 'mouseup', onMouseUp, false );
	}
	function onMouseWheel( event ) {
		event.preventDefault();	//prevent the default action
		event.stopPropagation();	//stop pop

		var delta = 0;
		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		} else if ( event.detail ) { // Firefox
			delta = - event.detail;
		}
		if ( delta < 0 )
			rightNow = (rightNow + 1) % counts;
		else
			if ( rightNow - 1 < 0 ) 
				rightNow = counts - 1;
			else
				rightNow = rightNow - 1;

		img.src = previews[rightNow].src;
	}

	el.addEventListener( 'mousedown', onMouseDown, false );
	el.addEventListener( 'mousewheel', onMouseWheel, false );
}
//apply the state
Previewer.prototype.reflesh = function() {
	//...
}