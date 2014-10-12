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