<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html class="no-js">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Not Video, is 3D</title>
<link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
<!-- start -- 
<link rel="stylesheet" href="/lib/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="/css/src/view.css">
<link rel="stylesheet" type="text/css" href="/css/src/header.1.css">
<link rel="stylesheet" type="text/css" href="/css/src/comment.css">
<link rel="stylesheet" type="text/css" href="/css/src/footer.css">
<link rel="stylesheet" type="text/css" href="/css/src/previewer.css">
<link rel="stylesheet" type="text/css" href="/css/src/webglContainer.css">
<link rel="stylesheet" type="text/css" href="/css/src/featureLeaver.css">
<!-- end -->
<link rel="stylesheet" type="text/css" href="/css/view.css">
  <!-- start --
  <script src="/lib/common/modernizr.js"></script>
  <script src="/lib/common/jquery-1.10.2.min.js"></script>
  <script src="/lib/common/jquery.mousewheel.js"></script>

  <script src="/lib/bootstrap/js/bootstrap.min.js"></script>
  <script src="/lib/mvc/underscore-1.4.3.js"></script>
  <script src="/lib/mvc/backbone-min-1.0.0.js"></script>
  <script src="/lib/mvc/ejs.js"></script>
  <script src="/lib/mvc/ejs.view.js"></script>

  <script src="/lib/webgl/RequestAnimationFrame.js"></script>
  <script src="/lib/webgl/Tween.min.js"></script>
  <script src="/lib/webgl/stats.js"></script>
  <script src="/lib/webgl/three.min.js"></script>

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
  <script src="/js/src/Previewer.js"></script>
  <script src="/js/src/comment.js"></script>

  <!-- end -->
  <!-- 过早优化是罪恶之源 -->
  <script src="/js/lib.view.js"></script>
  <script src="/js/plane.view.min.js"></script>
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
      //
      if ( !Modernizr.webgl ) {
        $("#WebGLContainer").removeClass('fullScreen');
        $('#header').removeClass('hiddenStyle');
      }
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
<body>
<!-- header -->
<div id="header" class="hiddenStyle">
  <div class="container">
    <div class="logo">
      <img src="/img/plane.png">
      <span>InAir</span>
      <span><small>&nbsp;Not video, is 3D</small></span>
    </div>
  </div>
</div>
<!-- Main -->
<div id="main" class="container">
  <div id="notSupport" class="alert alert-danger">
    <strong>Opps!</strong>&nbsp;Your browser is too old to support WebGL 3D, we recommend that you use Google Chrome to access, you can <a href="https://www.google.com/intl/en/chrome/browser/" class="alert-link">download it here</a>
  </div>
  <h3 id="outerName">&nbsp;</h3>
  <div class="row">
    <div class="col-sm-8">
    <!-- 左边部分 -->
      <!-- WebGLContainer -->
      <div id="WebGLContainer" class="fullScreen">
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
        <!-- previewer element here -->
      </div>
      <div id="previewerApplyTips" class="alert alert-info">
        <strong>Tips!</strong>&nbsp;You are viewing comics 3D objects, using an updated browser to see the cool stuff .<a href="/help.html#browser" class="alert-link" target="_black">more info here</a>
      </div>
      <!-- 评论 -->
      <div id="comment">
        <div id="newComment" class="">
            <div class="row">
              <div class="col-xs-1">
                <img src="/img/avatar/random4.jpg">
              </div>
              <div class="col-xs-11">
                <textarea id="commentInput" placeholder="leave your comment"></textarea>
                <div class="formContent">     
                  <input type="text" id="mail" placeholder="email : example@mail.com">
                  <label><input id="anonymous" type="checkbox" checked>&nbsp;Anonymous</label>
                  <button id="publishNew">&nbsp;&nbsp;&nbsp;&nbsp;publish&nbsp;&nbsp;&nbsp;&nbsp;</button>
                </div>

              </div>
            </div>
          </div>
          <div id="allComment">
            <p id="commentCount" data-count='0' >0 Comments</p>
            <div id="commentContainner">
              <!-- insert here -->
            </div>
          </div>
      </div>
    </div>
    <div class="col-sm-3 col-md-offset-1">
    <!-- 右边部分 -->
      <div id="me">
        <img class="logo"src="/img/plane.png">
        <h3 class="name">Cloudo(InAir) Digital Arts .Inc</h3>
      </div>
      <div id="modelInfo">
        <h4 class="title">Describe</h4>
        <p id="outerDes"></p>
      </div>
      

      <div id="shareLinks">
        <!-- insert here -->
      </div>
    </div>
  </div>
</div>
<!-- footer -->
<!-- <div id="footer">
  <h3>Cloudo</h3>
  <h4>2014@SuZhou</h4>
</div> -->
</body>
</html>
