<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="zh-cn">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>肥猫CMS : 保密地址</title>
<link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
<!-- start --
<link rel="stylesheet" href="/lib/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" href="/css/src/admin.css">
<!-- end -->
<link rel="stylesheet" href="/css/admin.css">

<script src="/lib/common/jquery-1.10.2.min.js"></script>
<script src="/lib/common/angular.min.js"></script>
</head>
<body>
<!-- <iframe src="http://inear.se/beanstalk/"></iframe> -->
<div class="container">
	<div class="row">
		<div class="col-sm-7" id="">
			<h1>肥猫管理系统 <small> 模型管理CMS</small></h1>
			<hr />
			
			  <div class="form-group">
			    <label for="ModelName">名称</label>
			    <input type="text" class="form-control" id="ModelName" placeholder="场景名称">
			  </div>
			  <div class="form-group">
			  	<label for="ModelDes">描述此模型</label>
			    <textarea id="ModelDes" class="form-control" rows="6" placeholder="20个字最适宜长度"></textarea>
			  </div>
			  <div class="form-group">
			  	<input type="file" class="form-control" id="ModelFile">
			  </div>
			  <button id="send" class="btn btn-default">&nbsp;&nbsp;注册&nbsp;&nbsp;</button>
			  <!-- <button id="update" class="btn btn-default">&nbsp;&nbsp;更新&nbsp;&nbsp;</button> -->
			
		</div>
		<div class="col-sm-3 col-md-offset-2" ng-app="published">
			<div ng-controller="publishdList" id="published">
				<h2>发布的场景<small> 共 {{models.length || 0}} 个</small></h2>
				<div ng-repeat="m in models" class="publishedModel">
					<h3>{{m.name}}</h3>
					<p class="text-danger">id: {{m.id}}&nbsp;&nbsp;<a href="/scenes/{{m.id}}">查看</a>&nbsp;&nbsp;&nbsp;<a href="/scenes/{{m.id}}/admin/QW23ER45T">编辑</a></p>
					<a ng-click='delete($index)' class="delete">del</a>
				</div>
			</div>
		</div>
	</div>
</div>
</body>
<script type="text/javascript" src="/js/admin.js"></script>
</html>