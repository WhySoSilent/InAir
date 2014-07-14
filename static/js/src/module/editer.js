var myEditer = angular.module('editer', ['editer.directives','ngRoute','texture','parse'])
.config(function($routeProvider) {
	$routeProvider.
	when('/', { controller: 'materialController', templateUrl: '/js/views/materialEditerTemplate.html'}).
	when('/commonEditer', { controller: 'commonController', templateUrl: '/js/views/commonEditerTemplate.html'}).
	when('/materialEditer', { controller: 'materialController', templateUrl: '/js/views/materialEditerTemplate.html'}).
	when('/sceneEditer', { controller: 'sceneController', templateUrl: '/js/views/sceneEditerTemplate.html'});
});