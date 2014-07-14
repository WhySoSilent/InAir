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