<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%><!DOCTYPE html>
<html lang="zh-cn">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Not video, is 3D</title>
<link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />  
<link rel="stylesheet" href="/lib/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="/css/src/list.css">
<link rel="stylesheet" type="text/css" href="/css/src/header.css">
<link rel="stylesheet" type="text/css" href="/css/src/footer.css">
<link rel="stylesheet" type="text/css" href="/css/src/modelCard.css">
<link rel="stylesheet" type="text/css" href="/css/src/loadingCard.css">
</head>
<body>
<!-- header -->
<div id="header" _class="hiddenStyle">
	<div class="container">
		<div class="logo">
			<img src="../img/plane.png">
			<span>InAir</span>
			<span><small>&nbsp;Not video, is 3D</small></span>
		</div>
	</div>
</div>
<!-- layout frame-->
<div id="main" class="container" ng-app>
	<h3>All models</h3>
	<div class="row">
		<div class="col-sm-9">
		<!-- 左边部分 -->
		<div ng-controller='listController' class="row" id="anchor_modelCard">
			<div ng-repeat='model in models' class='col-sm-11'>
				<div class="aMCard">
					<a class="preview" ng-href="/scenes/{{ model.id }}" target="_blank"><img ng-src="/data/models/{{ model.id }}/preview/preview.png"></a>
					<div class="metas">
						<h3 class="tit">{{ model.name }}</h3>
						<p class="desTit">{{ model.des }}</p>

						<div class="builder">
							<img class="avatar" src="/img/avatar/cat.jpg">
							<h4 class="name">FANTASTIC CAT</h4>
							<a class="toView" ng-href="/scenes/{{ model.id }}" target="_blank">view 3D ></a>
						</div>
					</div>
				</div>
			</div>

			<div ng-hide='loaded' class="col-sm-11">
				<div class="loadingCard">
					<img src="/img/cardloading.gif">
				</div>
			</div>
		</div>
		<!-- <iframe src="/iframe/L7K6DV" width="640" height="480"></iframe> -->
		</div>
		<div class="col-sm-3">
		<!-- 右边部分 -->
			<div id="me">
				<img class="logo"src="/img/plane.png">
				<h3 class="name">Cloudo(InAir) Digital Arts .Inc</h3>
			</div>
			<p id="business">Cloudo is a web site can display 3D content on the web, our custom high-end 3D rendering effect, to help them cool to showcase their products, using the latest WebGL technology, no need to install any plug-ins on the page where you can viewing, visitors can learn a full range of products.<br />If you want your product can be so dazzling, please contact us ...<br/><a href="/help.html" target="_black">more about us</a></p>
		</div>
	</div>
</div>
<!-- footer -->
<div id="footer">
  <h3>Cloudo</h3>
  <h4>2014@SuZhou</h4>
</div>
</body>

<!-- <script src="/lib/common/jquery-1.10.2.min.js"></script> -->
<!-- <script src="/lib/mvc/underscore-1.4.3.js"></script> -->
<!-- <script src="/lib/mvc/backbone-min-1.0.0.js"></script> -->
<!-- <script src="/lib/mvc/ejs.js"></script> -->
<script src="/lib/common/angular.min.js"></script>
<script src="/js/list.js"></script>
</html>