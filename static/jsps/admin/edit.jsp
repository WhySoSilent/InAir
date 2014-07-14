<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>肥猫编辑器</title>
<link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
<!-- start --
<link rel="stylesheet" href="/lib/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="/css/src/edit.css">
<link rel="stylesheet" type="text/css" href="/css/src/webglContainer.css">
<link rel="stylesheet" type="text/css" href="/css/src/featureLeaver.css">

<link rel="stylesheet" type="text/css" href="/css/src/switch.css">
<link rel="stylesheet" type="text/css" href="/css/src/expander.css">
<link rel="stylesheet" type="text/css" href="/css/src/editer.css">
<!-- end -->
<link rel="stylesheet" type="text/css" href="/css/edit.css">
  <!-- start --
  <script src="/lib/common/modernizr.js"></script>
  <script src="/lib/common/jquery-1.10.2.min.js"></script>
  <script src="/lib/common/jquery.mousewheel.js"></script>

  <script src="/lib/bootstrap/js/bootstrap.min.js"></script>
  <script src="/lib/mvc/underscore-1.4.3.js"></script>
  <script src="/lib/mvc/backbone-min-1.0.0.js"></script>
  <script src="/lib/mvc/ejs.js"></script>

  <script src="/lib/webgl/RequestAnimationFrame.js"></script>
  <script src="/lib/webgl/Tween.min.js"></script>
  <script src="/lib/webgl/stats.js"></script>
  <script src="/lib/webgl/three.js"></script>
  <script type="text/javascript" src="/lib/mvvc/angular.min.js"></script>
  <script type="text/javascript" src="/lib/mvvc/angular-cookies.min.js"></script>
  <script type="text/javascript" src="/lib/mvvc/angular-route.min.js"></script>

  <script src="/lib/webgl/sim.edit.js"></script>

  <script src="/js/src/Loader.js"></script>
  <script src="/js/src/JSONModel.js"></script>
  <script src="/js/src/MainCamera.js"></script>
  <script src="/js/src/Controls.js"></script>
  <script src="/js/src/Lights.js"></script>
  <script src="/js/src/SkyBox.js"></script>
  <script src="/js/src/Animation.js"></script>
  <script src="/js/src/UpdateStatus.js"></script>
  <script src="/js/src/Config.js"></script>
  <script src="/js/src/FeatureViewer.js"></script>
  <script src="/js/src/Audio.js"></script>
  <script src="/js/src/ModelViewer.js"></script>

  <!-- end -->
  <!-- 过早优化是罪恶之源 -->
  <!-- min -->
  <script src="/js/lib.edit.js"></script>
  <script src="/js/plane.edit.js"></script>
  <!-- end -->
  <script>
  
  $(document).ready(
    function() {
      var container = document.getElementById("WebGLContainer");
      var app = new ModelViewer();
      app.init({ container: container });
      app.run();
      Plane.modelViewer = app;
      //
      $("#startingPreview").attr("src","/data/models/"+ Plane.modelId +"/preview/preview_starting.png");
      //请求数据
      $.ajax({
          url: '/api/models/' + Plane.modelId,
          type: 'GET',
          success: CBS.setMetas,
      });
    }
  );
  </script>

</head>
<body id="edit">
<!-- editer -->
<div id="editer">
 <div id="editerPageTag">
    <div><a href="#commonEditer" >common</a></div>
    <div><a href="#sceneEditer" >scene</a></div>
    <div><a href="#materialEditer" >material</a></div>
  </div>
  <div ng-view></div>
</div>
<!-- WebGLContainer -->
<div id="WebGLContainer" class="editerOne">
  <div id="sceneOptionInsert"></div>
  <div id="canvasCover" _class='display'>
    <div id="startingLever" class="container"><div class="row">
      <div id="headlineArea" class="col-sm-6">
        <!-- 大标题区域 -->
        <h1></h1>
        <h3></h3>

        <h6>loading...</h6>
        <div id="loadingBar" class="loadingBar">
          <div class="loadedWidth"></div>
        </div>
      </div>
      <div id="startingPreviewArea" class="col-sm-5 col-sm-offset-1">
        <img id="startingPreview" src="">
      </div>
    </div></div>
  </div>
  <div id="featureLeaver">
    <a class="pre"><span class="glyphicon glyphicon-fast-backward"></span></a>
    <div class="features"></div>
    <a class="next"><span class="glyphicon glyphicon-fast-forward"></span></a>
  </div>
  <!-- canvas element here -->
</div>

</body>
  <!-- start --
  <script type="text/javascript" src="/js/src/module/texture.js"></script>
  <script type="text/javascript" src="/js/src/module/config.js"></script>
  <script type="text/javascript" src="/js/src/module/parse.js"></script>
  <script type="text/javascript" src="/js/src/module/editer.directives.js"></script>
  <script type="text/javascript" src="/js/src/module/editer.js"></script>
  <script type="text/javascript" src="/js/src/module/editer.controllers.common.js"></script>
  <script type="text/javascript" src="/js/src/module/editer.controllers.scene.js"></script>
  <script type="text/javascript" src="/js/src/module/editer.controllers.material.js"></script>
  <script src="/js/src/editer_starter.js"></script>
  <!-- end -->
</html>
