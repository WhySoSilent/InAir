var directiveDemo = angular.module('editer', ['ngCookies','ngRoute','texture','config'])
.directive('expander', function(){
	// Runs during compile
	return {
		// priority: 1,
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
			scope.showMe = false;

			$(iElm).find('.text').html(iAttrs["expanderTitle"]);

			scope.toggle = function() {
				scope.showMe = !scope.showMe;
			}
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
		scope: { textures : '=textureLib' , choosed: '=handdleWitch' },
		restrict: 'EA',
		templateUrl: '/js/views/imgcontrolTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;

			// iElm.bind('blur', function(){
			// 	scope.$apply( scope.hiddenThis );
			// });

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.showThis = function() {
				scope.showMe = true;
			}
			scope.hiddenThis = function() {
				scope.showMe = false;
			}
			scope.addNewTexture = function() {
				Texture.addTexture('d.jpg');
			}
			//scope.$watch('enable', function() { alert('changed')});
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
			scope.getCameraPosition = function() {
				scope.position = [8,8,8];
			}
		}
	}
})
.config(function($routeProvider) {
	$routeProvider.
	when('/', { controller: materialController, templateUrl: '/js/views/materialEditerTemplate.html'}).
	when('/commonEditer', { controller: commonController, templateUrl: '/js/views/commonEditerTemplate.html'}).
	when('/materialEditer', { controller: materialController, templateUrl: '/js/views/materialEditerTemplate.html'}).
	when('/sceneEditer', { controller: sceneController, templateUrl: '/js/views/sceneEditerTemplate.html'});
});

function commonController($scope, Config) {
	// data
	$scope.common = Config.getCommon();

	//mark
	$scope.createing = false;

	// hander
	$scope.toCerate = function() {
		$scope.createing = true;
		alert('run');
	}
	//$scope.$watch('common.name', function() { alert('changed' + $scope.$valid); });
}
function sceneController($scope, Config) {
	$scope.scene = Config.getScene();
}
function materialController($scope, Texture, Config) {
 	$scope.materials = Config.getMaterials();
 	$scope.textures = Texture.getTextures();

 	// mark
 	$scope.material = $scope.materials[1];	// 当前正在编辑的材质

 	// handdle
 	$scope.copyMaterial = function() {
 		var str = "拷贝是以当前材质创建一个属于同组的新材质，方便调整后用于组内替换，你确定你要复制以创建新的材质吗？"
 		if( !confirm(str) )
 			return;
 	}
 	$scope.removeCurrentGroup = function() {
 		$scope.material.group = null;
 	}
 	//$scope.$watch('materials', function() { alert('controller checkd change')}, true);
}