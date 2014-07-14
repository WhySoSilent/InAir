var myApp = angular.module('models', [])
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
