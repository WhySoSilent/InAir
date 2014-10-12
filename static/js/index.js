var myApp = angular.module('indexModels', [])
.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});
myApp.controller('listController', ['$scope', '$http', function ($scope, $http) {
    $scope.models = [];
    $scope.loaded = false;
    //  Http 细节处理
    $http.get('/api/models').success(function(data, status, headers, config) {
        $scope.models = data;
        $scope.loaded = true;
    });
}]);
$(function(){
    //header 滚动监听
    var headerDom = $("#header");
    var cubeStyle = headerDom.hasClass('cubeStyle');
    var windowDom = $(window);
    windowDom.scroll(function(event){
        var scrolled = windowDom.scrollTop();
        if ( scrolled < 100 && !cubeStyle ) {
            headerDom.addClass('cubeStyle');
            cubeStyle = true;
        }
        if ( scrolled >= 100 && cubeStyle ) {
            headerDom.removeClass('cubeStyle');
            cubeStyle = false;
        }
    });

});
