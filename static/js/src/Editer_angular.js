var editer = angular.module('Editer',[]);
editer.directive('wSwitch', ['', function(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: { enable: '=enable', toggle: '&disableToggle'},
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA',
		templateUrl: '/js/views/switch.html',
		replace: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function(scope, iElm, iAttrs, controller) {
		}
	};
}]);

function materialsController($scope) {
	$scope.materials = [
		{
			map: 'aaa Map',
			enableMap: false
		},
		{
			map: 'bbb map';
			enableMap: false
		},
		{
			map: 'bbb map';
			enableMap: false
		},

	];
	$scope.disableToggle =function(id) {
		//禁用材质的某个属性
	}
}