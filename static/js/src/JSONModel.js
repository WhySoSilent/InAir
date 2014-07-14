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