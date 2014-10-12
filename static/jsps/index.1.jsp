<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Welcome</title>
  <link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />  
  <link rel="stylesheet" href="/lib/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/src/index.css">
  <style type="text/css">
  iframe {
    width: 100%;
    border: 0;
    background: #000;
  }
  </style>
</head>
<body>
<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
<div class="container">
  <div class="navbar-header">
        <a class="navbar-brand" href="#">在云端</a>
      </div>
  <div class="collapse navbar-collapse">
    <ul class="nav navbar-nav">
      <li class="active"><a href="#__">首页</a></li>
      <li><a href="#__"><span class="glyphicon glyphicon glyphicon-send"></span>&nbsp;模型</a></li>
      <li><a href="#__"><span class="glyphicon glyphicon-arrow-up"></span> 上传</a></li>
      </ul>
    <ul class="nav navbar-nav navbar-right">
      <p class="navbar-text navbar-right">WhySoSilent?  &nbsp;<a href="#" class="navbar-link">退出</a></p></li>
    </ul>
  </div>
</div>
</nav>

<div id='banner' class='aLevel'>
  <div class="container">
    <div class="row">
      <div class="col-sm-4" id="mainTitleContainner">
      <!-- main title -->
        <p><h1>我们致力于创建、分享惊艳易用的Web3D交互产品。</h1><p>
        <p><h3>无论是3D设计师还是Web工程师，都邀请您的加入！</h3></p>
        <a class="btn btn-default btn-lg " href='/scenes'>&nbsp;&nbsp;查看更多创意场景&nbsp;&nbsp;</a>
      </div>
      <div class="col-sm-8" id="iframeContainner">
      <!-- iframe -->
        <iframe src="/iframe/Q9H8UP" width='640' height='480'></iframe>
      </div>
    </div>
  </div>
  <a id="down" href="#intro"></a>
</div>
<!-- 中屏 introduce -->
<div id='intro' class='aLevel'>
  <div class="container">
    <div class="row">
      <h2 class="intro-title-text">现在开始学习和使用WebGL技术，</h2>
      <h2 class="intro-title-text">展示您的产品和创意</h2>

      <div class="col-sm-4">
        <img src="/img/index/intro_img_book.png" alt="..." class="">
        <h2>WebGL教程</h2>
        <p>免费、优质的教程和应用经验分享。</p>
      </div>
      <div class="col-sm-4">
        <img src="/img/index/intro_img_disgus.png" alt="..." class="">
        <h2>论坛</h2>
        <p>在论坛中讨论和交流问题，学习更有动力。</p>
      </div>
      <div class="col-sm-4">
        <img src="/img/index/intro_img_plane.png" alt="..." class="">
        <h2>3D作品展示</h2>
        <p>在社区中讨论和交流问题，学习更有动力。</p>
      </div>
    </div>
  </div>
</div>
<!-- footer -->
<div id='footer' class='aLevel'>
  <div class="container">
    <div class="row">
      <div class="col-sm-6">
      
      </div>
      <div class="col-sm-3">
        <h3>服务</h3>
        <ul>
          <li>企业服务</li>
          <li>为个人用户提供</li>
        </ul>
      </div>
      <div class="col-sm-3">
        <h3>关于</h3>
        <ul>
          <li>我们</li>
          <li>联系</li>
        </ul>
      </div>
    </div>
    <div class='about'>
      <h4>让Web3D呈现更易用！</h4>
      <p>@ 2011 - 2014 air.com</p>
    </div>
  </div>
</div>

</body>
</html>