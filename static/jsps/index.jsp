<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE HTML>
<html lang="zh-cn">
<head>
  <title>InAir | Not video, is 3D</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
  <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
  <!-- start --
  <link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" type="text/css" href="/css/src/index.css">
  <link rel="stylesheet" type="text/css" href="/css/src/header.css">
  <link rel="stylesheet" type="text/css" href="/css/src/modelCard.css">
  <link rel="stylesheet" type="text/css" href="/css/src/usInfo.css">
  <!-- end -->
  <link rel="stylesheet" type="text/css" href="/css/index.css">
</head>
<body class="">
  <!--header-->
  <header id="header" class="cubeStyle">
    <div class="container">
      <div id="logo">
        <img src="/img/plane.png">
        <h2>InAir</h2>
        <p>Not Video, is 3D</p>
      </div>
    </div>  
  </header>
  <!--banner-->
  <div id="banner">
    <div class="container">
      <div class="modelInfo">
      <h2>High-end custom effects</h2>
          <p>InAir is a web site can display 3D content on the web, with high-end 3D rendering effect, to help our custom showcase their products more cool.<br/><a href="/help.html" target="_black">more about us</a></p>
      </div>
      <iframe width="700" height="480" src="http://localhost/iframe/5Q9H8B" allowFullScreen ></iframe>
    </div>
  </div>
  <!--content-->
  <div id="content">
    <div class="container">
      <div class="contentHead">
        <div class="headLeft">
          <h2>We Build</h2>
          <p>Here are some scenes with 3D display, they are more intuitive and more fun than any multimedia content. Imagine, maybe you can get your product so cool dazzle</div>
        
        <a href="/scenes"><button>View More</button></a>
      </div>
      <div class="modelsList" ng-app='indexModels' ng-controller='listController'>

        <a ng-href="/scenes/{{ model.id }}" target="_blank" ng-repeat='model in models | limitTo: 4 '>
          <div class="modelCard">
            <div class="modelPic">
              <img ng-src="/data/models/{{ model.id }}/preview/preview.png">
              <img src="/img/hoverCover.png" class="hoverCover">
            </div>
            <h3>{{ model.name | cut:true:26:'...'}}</h3>
            <p>{{ model.des | cut:true:95:'...'}}</p>
          </div>
        </a>



      </div>
    </div>
  </div>
  <!--aboutUs-->
  <div id="aboutUs">
    <div class="container">
      <div class="aboutUsHead">
        <h2>What you need</h2>
      </div>

      <div class="usInfo">
          <div class="pic"><img src="/img/index/illustration_1.jpg"></div>
          <div class="picDescribe"><p>More intuitive display your products, using the latest 3D technology, your product will be able to form more interesting to interact with your customers. 3D content than any other multimedia technology intuitive and fun.</p></div>
        </div>
        <div class="usInfo">
          <div class="pic"><img src="/img/index/illustration_2.jpg"></div>
          <div class="picDescribe"><p>You just need a modern browser can display 3D models directly in the browser to display the details of your product, or your creative scene or object model more interesting ... the reason why all of these can be rendered in your eyes, have benefited the most advanced HTML5 technology.</p></div>
          
        </div>
      </div>
      <div class="usInfo">
          <div class="pic"><img src="/img/index/HTML5.png"></div>
          <div class="picDescribe"><p>You just need a modern browser can display 3D models directly in the browser to display the details of your product, or your creative scene or object model more interesting ... the reason why all of these can be rendered in your eyes, have benefited the most advanced HTML5 technology.</p></div>
        </div>
      </div>
    </div>
  </div>
  <!--footer-->
  <footer></footer>
</body>
<script src="/lib/common/jquery-1.10.2.min.js"></script>
<script src="/lib/common/angular.min.js"></script>
<script src="/js/index.js"></script>
</html>