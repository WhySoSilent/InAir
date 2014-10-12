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