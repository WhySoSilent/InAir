var config = angular.module('config', [])
.factory('Config', [function(){
	var Config = {};
	//Config.data = Plane.conf;	//... !!!
	Config.data = {
		common: {
			name: null,
			des: null,
			features: [
				{ title: '更强的大脑', des: '更聪明的Blackberry', focus: { position: [[100,100,50]]}},
				{ title: '更快的速度', des: '比上一代快了两倍', focus: { position: [[100,100,50]]}},
				{ title: '更便宜的价格', des: '售价仅为老款一半', focus: { position: [[100,100,50]]}}
			],
			enableFeature: true
		},
		scene: {
			meta: {
				name: 'ModelName',
				des: 'Describe'
			}
		},
		materials: [
		 	{
		 		name: 'material_1',
		 		shading: 'phong',
		 		visible: true,
		 		color: [25,25,25],
		 		map: 'map.jpg' ,
		 		enableMap: true ,
		 		env: 'groud',
		 		enableEnv: false,
		 		shininess: 31,
		 		group: '车窗',
		 		side: "Front"
		 	},
		 	{
		 		name: 'material_2',
		 		shading: 'lambert',
		 		visible: true,
		 		color: [25,25,25],
		 		map: 'ddamap.jpg' ,
		 		enableMap: true ,
		 		env: 'home',
		 		enableEnv: false,
		 		shininess: 32,
		 		group: '车漆',
		 		side: "Back"
		 	},
		 	{
		 		name: 'material_3',
		 		shading: 'phong',
		 		visible: false,
		 		color: [25,25,25],
		 		map: 'ccMap.jpg' ,
		 		enableMap: true ,
		 		env: 'sky',
		 		enableEnv: false,
		 		shininess: 33,
		 		side: "Double"
		}]
	};
	//seter/getter
	Config.getCommon = function() { return Config.data.common; }
	Config.getScene = function() { return Config.data.scene; }
	Config.getMaterials = function() { return Config.data.materials; }

	//helper
	Config.addNewFeature = function(newOne) {
		//Config.data.common.features.push(newOne);
	}
	Config.emptyFeature = function() {
		return { title : '这里是名称', des: '这里是描述' };
	}

	return Config;
}]);