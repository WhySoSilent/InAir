myEditer.controller('commonController', [ '$scope', '$timeout', 'Parse', function($scope, $timeout, Parse) {
	// data
    $scope.model = Plane.model;
	$scope.common = Parse.getCommon();
	$scope.features = $scope.common.features;
    //$scope.previews = { preview: "/data/models/"+ Plane.modelId +"/preview/preview.png" ,startingPreview: "/data/models/"+ Plane.modelId +"/preview/preview_starting.png"};
    $scope.previews = Parse.checkResource('previews');
    $scope.modelId = Plane.modelId;
    // $scope.$apply();
	// mark
	//$scope.createing = false;
	$scope.feature = $scope.features[0];   //当心没有的情况

    $scope.watchs = {};

    // watch
    $scope.watchs['modelName'] = $scope.$watch('model.name', CMName);
    $scope.watchs['modelDes'] = $scope.$watch('model.des', CMDescribe);

                            // feature 属性
    $scope.watchs['featureTitle'] = $scope.$watch('feature.title', CFTitle);
    $scope.watchs['featureDes'] = $scope.$watch('feature.des', CFDes);
    $scope.watchs['featureFocusPosition'] = $scope.$watch('feature.focus.position', toUpdate, true);
    $scope.watchs['featurePeriodTime'] = $scope.$watch('feature.focus.periodTime', toUpdate);

	// hander
	$scope.cerateNewFeature = function() {
		$scope.features.push( Plane.config.emptyFeature() );
		$scope.feature = $scope.common.features[ $scope.common.features.length - 1 ];

	}
    
	$scope.deleteFeature = function( witch ) {
		var index = $scope.common.features.indexOf(witch);
		$scope.common.features.splice(index, 1);
        // if( $scope.common.features.length !== 0 ) {
        //     $scope.feature = $scope.common.features[ 0 ];
        // } else {
        //     $scope.feature = {};
        // }
        //$scope.$apply();
	}
	$scope.getCameraPosition = function(i) {
        var po = Parse.getCameraPosition();
        // var qu = Parse.getCameraQuaternion();    //不造这个有什么用

        var camPo = $scope.feature.focus.position[i];
		camPo[0] = po[0]; 
        camPo[1] = po[1];
        camPo[2] = po[2];


	}

	// callback
    var tryCount = 0;
    function upMetaToServer() {
        if ( tryCount > 5 ) return;
        $.ajax({
            url: '/models/' + $scope.modelId + '/update',
            type: 'POST',
            data: { name: Plane.model.name, des: Plane.model.des },
            success: function(data) {
                if( tryCount !== 0 )
                    tryCount = 0;
            },
            error: function() {
                tryCount++;
                if (timeout) $timeout.cancel(timeout);
                timeout = $timeout(upMetaToServer, 1000)
                //upMetaToServer();
            }
        });
    }
                    // -------------- model ----------------
    var timeout;
    function CMName(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        if (timeout) $timeout.cancel(timeout);
        timeout = $timeout(upMetaToServer, 3000);
    }
    function CMDescribe(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        if (timeout) $timeout.cancel(timeout);
        timeout = $timeout(upMetaToServer, 3000);
    }
                    // -------------- feature ----------------
    function CFTitle(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        Plane.config.setChanged();
    }
    function CFDes(n, o) {
        if( n === o ) { return; }
        if( n === '' ) return;

        Plane.config.setChanged();
    }
    function toUpdate(n, o) {
        if( n === o ) { return; }

        Plane.config.setChanged();
    }
}]);