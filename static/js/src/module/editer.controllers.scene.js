myEditer.controller('sceneController', [ '$scope', 'Texture', 'Parse', function($scope, Texture, Parse) {
    // data
    $scope.scene = Parse.getScene();
    $scope.camera = $scope.scene.camera;
    $scope.control = $scope.scene.control;
    $scope.lights = Parse.getLights();
    $scope.background = $scope.scene.background;
    $scope.environment = $scope.scene.environment;
    $scope.envTextures = Texture.getEnvTextures();

    $scope.modelId = Plane.modelId;

    // mark
    $scope.light = $scope.lights[0];    // 当前持有的light配置
    $scope.targetLight = Plane.lights[0];   // 当前正在编辑的THREE灯光
    $scope.targetCamera = Plane.modelViewer.userCamera;
    $scope.targetControl = Plane.modelViewer.control;
    $scope.targetEnvironment = Plane.modelViewer.SkyBox;

    $scope.watchs = {};

    // handdle
    $scope.setWatch = function(witch) {
        //添加一组监控
    }
    $scope.getCameraPosition = function() {
        var po = Parse.getCameraPosition();
        $scope.camera.position[0] = po[0];
        $scope.camera.position[1] = po[1];
        $scope.camera.position[2] = po[2];
    }
    $scope.getCameraDistance = function(witch) {
        if( witch === 0 ) {
            $scope.control.minDistance = Parse.getCameraDistance();
        }
        if( witch === 1 ) {
            $scope.control.maxDistance = Parse.getCameraDistance();
        }
    }
    $scope.getCameraTarget = function() {
        $scope.camera.lookat = Parse.getCameraTarget();
    }
    $scope.getLightPosition = function() {
        var po = Parse.getCameraPosition();
        $scope.light.position[0] = po[0];
        $scope.light.position[1] = po[1];
        $scope.light.position[2] = po[2];
    }
    // watch
    $scope.watchs['light'] = $scope.$watch('light', changeALight);
                        // camera 属性
    $scope.watchs['cameraFront'] = $scope.$watch('camera.front', CCFront);
    $scope.watchs['cameraBack'] = $scope.$watch('camera.back', CCBack);
    $scope.watchs['cameraPosition'] = $scope.$watch('camera.position', CCPosition, true);
                       // Control 属性
    // $scope.watchs['controlType'] = $scope.$watch('control.type', CControlType);
    $scope.watchs['controlZoom'] = $scope.$watch('control.zoom', CControlZoom);
    $scope.watchs['controlPan'] = $scope.$watch('control.pan', CControlPan);
    $scope.watchs['controlAutoRotate'] = $scope.$watch('control.autoRotate', CControlAutoRotate);
    $scope.watchs['controlMaxDistance'] = $scope.$watch('control.maxDistance', CControlMaxDistance);
    $scope.watchs['controlMinDistance'] = $scope.$watch('control.minDistance', CControlMinDistance);
    $scope.watchs['controlMinPolarAngle'] = $scope.$watch('control.minPolarAngle', CControlMinPolarAngle);
    $scope.watchs['controlMaxPolarAngle'] = $scope.$watch('control.maxPolarAngle', CControlMaxPolarAngle);
                        // light 属性
    $scope.watchs['lightType'] = $scope.$watch('light.type', CLType);
    $scope.watchs['lightName'] = $scope.$watch('light.name', CLName);
    $scope.watchs['lightColor'] = $scope.$watch('light.color', CLColor);
    $scope.watchs['lightIntensity'] = $scope.$watch('light.intensity', CLIntensity);
    $scope.watchs['lightDistance'] = $scope.$watch('light.distance', CLDistance);
    $scope.watchs['lightPosition'] = $scope.$watch('light.position', CLPosition, true);
                        // background 属性
    $scope.watchs['backgroundType'] = $scope.$watch('background.type', CBgType);
    $scope.watchs['backgroundColor'] = $scope.$watch('background.color', CBgColor);
    $scope.watchs['backgroundImage'] = $scope.$watch('background.image', CBgImage);
                        // Environment 属性
    $scope.watchs['environmentEnable'] = $scope.$watch('environment.enable', CEEnable);
    $scope.watchs['environmentSkybox'] = $scope.$watch('environment.skybox', CESkybox);
    $scope.watchs['environmentSize'] = $scope.$watch('environment.size', CESize);
    // callback 
    function changeALight(n, o) {
        //跟换了目标灯光，要重新设置标记
        //setWatches();
        //重新指定配置模块的地址
        var t = $scope.lights.indexOf($scope.light);
        //alert( '更换灯光 : '  + t ); 
        $scope.targetLight = Plane.lights[t];
    }

                    // -------------- camera ----------------
    function CCFront(n, o) {
        if( n === o ) { return; }

        $scope.targetCamera.near = Number(n);
        $scope.targetCamera.updateProjectionMatrix();
        console.log($scope.targetCamera);
        Plane.config.setChanged();
    }
    function CCBack(n, o) {
        if( n === o ) { return; }

        $scope.targetCamera.far = Number(n);
        $scope.targetCamera.updateProjectionMatrix();
        Plane.config.setChanged();
    }
    function CCPosition(n, o) {
        if( n === o ) { return; }

        new TWEEN.Tween( $scope.targetCamera.position )
        .to({
            x : Number(n[0]),
            y : Number(n[1]),
            z : Number(n[2])
            }, 700)
        .easing( TWEEN.Easing.Sinusoidal.Out )
        .start();
        $scope.targetCamera.updateProjectionMatrix();
        Plane.config.setChanged();
    }
                    // -------------- control ----------------
    function CControlType(n, o) {
        if( n === o ) { return; }
        //...
    }
    function CControlZoom(n, o) {
        if( n === o ) { return; }
        
        $scope.targetControl.noZoom = !n;
        Plane.config.setChanged();
    }
    function CControlPan(n, o) {
        if( n === o ) { return; }

        $scope.targetControl.noPan = !n;
        Plane.config.setChanged();
    }
    function CControlAutoRotate(n, o) {
        if( n === o ) { return; }
        
        $scope.targetControl.autoRotate = n;
        Plane.config.setChanged();
    }
    function CControlMaxDistance(n, o) {
        if( n === o ) { return; }
        
        if( n < $scope.control.minDistance ) {
            $scope.control.maxDistance = $scope.control.minDistance;
            Plane.config.setChanged();

            alert("最远距离 " + n + " 不能小于 最近距离 " + $scope.control.minDistance + " ！");
            return;
        }
        $scope.targetControl.maxDistance = n;
        Plane.config.setChanged();
    }
    function CControlMinDistance(n, o) {
        if( n === o ) { return; }
        
        if( n > $scope.control.maxDistance ) {
            $scope.control.minDistance = $scope.control.maxDistance;
            Plane.config.setChanged();

            alert("最近距离 " + n + " 不能大于 最远距离 " + $scope.control.maxDistance + " ！");
            return;
        }
        $scope.targetControl.minDistance =n;
        Plane.config.setChanged();
    }
    function CControlMinPolarAngle(n, o) {
        if( n === o ) { return; }

        $scope.targetControl.minPolarAngle = n;
        Plane.config.setChanged();
    }
    function CControlMaxPolarAngle(n, o) {
        if( n === o ) { return; }

        $scope.targetControl.maxPolarAngle = n;
        Plane.config.setChanged();
    }
                    // -------------- light ----------------
    function CLType(n, o) {
        if( n === o ) { return; }

        //$scope.targetLight.type...;
        Plane.config.setChanged();
    }
    function CLName(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.name = n;
        Plane.config.setChanged();
    }
    function CLColor(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.color.setStyle(n);
        Plane.config.setChanged();
    }
    function CLIntensity(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.intensity = Number(n);
        Plane.config.setChanged();
    }
    function CLDistance(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.distance = Number(n);
        Plane.config.setChanged();
    }
    function CLPosition(n, o) {
        if( n === o ) { return; }

        $scope.targetLight.position.fromArray(n);
        Plane.config.setChanged();
    }
                    // -------------- background ----------------
    function CBgType(n, o) {
        if( n === o ) { return; }

        //设置css样式
        if( n === "color" ) {
            $('#WebGLContainer canvas').css({ "background-image" : "" });
        }
        if( n === "image" ) {
            $('#WebGLContainer canvas').css({ "background-image" : "url(" + $scope.background.image + ")" });
        }
        Plane.config.setChanged();
    }
    function CBgColor(n, o) {
        if( n === o ) { return; }

        //设置css样式
        $('#WebGLContainer ').css({ "background" : n });
        Plane.config.setChanged();
    }
    function CBgImage(n, o) {
        if( n === o ) { return; }

        $('#WebGLContainer canvas').css({ "background-image" : "url("+ n +")" });
        //设置css样式
        Plane.config.setChanged();
    }

                    // -------------- Environment ----------------
    function CEEnable(n, o) {
        if( n === o ) { return; }

        if( n )
            $scope.targetEnvironment.enable();
        else
            $scope.targetEnvironment.disable();

        Plane.config.setChanged();
    }
    function CESkybox(n, o) {
        if( n === o ) { return; }

        $scope.targetEnvironment.init(n);

        Plane.config.setChanged();
    }
    function CESize(n, o) {
        if( n === o ) { return; }

        $scope.targetEnvironment.init($scope.environment.skybox, n);
        //$scope.targetEnvironment.resize(n);   //... 这个没搞定
        Plane.config.setChanged();
    }

}]);