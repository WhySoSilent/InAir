<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>iFrame</title>
<link rel="icon" href="/favicon.ico" type="image/x-icon" />
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
<!-- start --
<link rel="stylesheet" href="/lib/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="/css/src/iframe.css">
<link rel="stylesheet" type="text/css" href="/css/src/previewer.css">
<link rel="stylesheet" type="text/css" href="/css/src/webglContainer.css">
<link rel="stylesheet" type="text/css" href="/css/src/featureLeaver.css">
<!-- end -->
<link rel="stylesheet" type="text/css" href="/css/iframe.css">
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

  <script src="/lib/webgl/sim.edit.js"></script>

  <script src="/js/src/Loader.js"></script>
  <script src="/js/src/JSONModel.js"></script>
  <script src="/js/src/MainCamera.js"></script>
  <script src="/js/src/Controls.js"></script>
  <script src="/js/src/Lights.js"></script>
  <script src="/js/src/SkyBox.js"></script>
  <script src="/js/src/Animation.js"></script>
  <script src="/js/src/Config.js"></script>
  <script src="/js/src/FeatureViewer.js"></script>
  <script src="/js/src/Audio.js"></script>
  <script src="/js/src/ModelViewer.js"></script>

  <!-- end -->
  <!-- 过早优化是罪恶之源 -->
  <script src="/js/lib.iframe.js"></script>
  <script src="/js/plane.iframe.min.js"></script>
  <script>
  
  $(document).ready(
    function() {
      var container = document.getElementById("WebGLContainer");
      if( Modernizr.webgl ) {
        var viewer = new ModelViewer();
        viewer.init({ container: container });
        viewer.run();
        Plane.modelViewer = viewer;
      } else {
        var viewer = new Previewer();
        viewer.init({ container: container });
        Plane.Viewer = viewer;  //...这里不统一
      }
    }
  );
  </script>

</head>
<body id="iframe">
<!-- WebGLContainer -->
<div id="WebGLContainer" style="width:100%; height:100%; position:absolute;">
  <div id="sceneOptionInsert"></div>
  
  <div id="canvasCover" _class='display'>
    <div id="startingLever" class="container"><div class="row">
      <div id="headlineArea" class="col-sm-6">
        <!-- 大标题区域 -->
        <h1></h1>
        <h3></h3>

        <h6>正在载入...</h6>
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
<script type="text/javascript">
  $(function(){
      var i = /\/iframe\/(\w+)/;
      if ( i.test( document.URL ) ) {
        var modelId = RegExp.$1;
        $("#toViewDetail").attr("href", "/scenes/" + modelId);
      }
  });
</script>
</html>
