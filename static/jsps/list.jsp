<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%><!DOCTYPE html>
<!DOCTYPE HTML>
<html lang="zh-cn">
<head>
	<title>Scene list | Not video, is 3D</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
	<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />  
	<!-- start --
	<link rel="stylesheet" type="text/css" href="/lib/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="/css/src/list.css">
	<link rel="stylesheet" type="text/css" href="/css/src/header.css">
	<link rel="stylesheet" type="text/css" href="/css/src/modelCard.css">
	<!-- end -->
	<link rel="stylesheet" type="text/css" href="/css/list.css">
</head>
<body>
	<!--header-->
	<header>
		<div class="container">
		<div id="logo">
			<h2><a href="/">InAir</a></h2>
			<p>Not Video, is 3D</p>
		</div>
		</div>	
	</header>
	<!--content-->
	<div id="content">
		<div class="container">
		<div class="contentHead">
			<div class="headLeft">
				<h2>Models</h2>
				<p>Youth is not a time of life; it is a state of mind; it is not a matter of rosy cheeks, red lips and supple knees; it is a matter of the will, a quality of the imagination, a vigor of the emotions; it is the freshness of the deep springs of life. </p>
			</div>
		</div>
		<div class="modelsList" ng-app='models' ng-controller='listController'>
			
				<a ng-href="/scenes/{{ model.id }}" target="_blank" ng-repeat='model in models'>
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
		<div class="butt"><button class="but">View more</button></div>
		</div>	
	</div>
</body>
<!-- <script src="/lib/common/jquery-1.10.2.min.js"></script> -->
<!-- <script src="/lib/mvc/underscore-1.4.3.js"></script> -->
<!-- <script src="/lib/mvc/backbone-min-1.0.0.js"></script> -->
<!-- <script src="/lib/mvc/ejs.js"></script> -->
<script src="/lib/common/angular.min.js"></script>
<script src="/js/list.js"></script>
</html>