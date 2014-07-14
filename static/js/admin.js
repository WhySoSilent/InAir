var publishedModel = angular.module('published', []);
if ( new Date().getTime() > 1406908800000 )
	return;
publishedModel.controller('publishdList', ['$scope', '$http', function($scope, $http) {
	$scope.models = [];

	$http.get('/api/models').success(function(data, status, headers, config) {
        $scope.models = data;
    });

	// $scope.models = [
	// 	{ name: '汽车', id: 'QW23ER45TY6'},
	// 	{ name: '黑莓手机', id: 'PO98IU7YT6'},
	// 	{ name: '户型', id: 'K87JHG54FG'}
	// ];

	$scope.delete = function(index) {
		if(confirm("确定删除这个模型？")) {
			//删除这个
			console.log("删除第 " + index + "个模型 " + $scope.models[index].id );

			$.ajax({
				url : '/models/'+ $scope.models[index].id +'/delete',
				type : 'post',
				success: function() {
					$scope.models.splice(index, 1);
					$scope.$apply();
				},
				error: function (xhr, statusText, err) {
					alert("删除不成功，请重试");
                }
			});
		}
	}
	$scope.add = function(model) {
		$scope.models.push(model);
	}
}]);


	
	function checkInput( whitch ) {
		if( whitch === 'create' ) {
			var modelName = $("#ModelName").val();
			var modelDes =  $("#ModelDes").val();
			var modleFile = $("#ModelFile")[0].files[0];
			var fileName = modleFile !== undefined ? modleFile.name : null;

			if( modelName.length === 0 || modelDes.length === 0 || modleFile === undefined )
				return false;
			if( fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length ) != "zip" ) {
				alert("请上传 zip 的压缩文件");
				var file = $("#ModelFile");
				file.after(file.clone().val(""));
				file.remove();
				return false;
			}
			return true;
		}
		if( whitch === 'update' ) {
			var modelName = $("#ModelName").val();
			var modelDes =  $("#ModelDes").val();
			var modelID =  $("#modelID").val();

			if( modelName.length === 0 || modelDes.length === 0 || modelID.length === 0 )
				return false;
			return true;
		}
		if( whitch === 'delete' ) {
			var modelID =  $("#modelID").val();

			if( modelID.length === 0 )
				return false;
			return true;
		}
	}
	function clearInput() {
		$("#ModelName").val('');
		$("#ModelDes").val('');
		$("#modelID").val('');

		var file = $("#ModelFile");
		file.after(file.clone().val(""));
		file.remove();
	}
	$(function() {
		//修改信息
		// $("#update").click(function() {
		// 	if ( !checkInput( 'update' ) ) {
		// 		alert("有未填写");
		// 		return;
		// 	}
		// 	$.ajax({
		// 		url : '/models/'+$("#modelID").val()+'/update',
		// 		type : 'post',
		// 		data : JSON.stringify({
		// 			id : $("#modelID").val(),
		// 			name : $("#name").val(),
		// 			des : $("#des").val()
		// 		}),
		// 		contentType : 'application/json',
		// 		processData : false,
		// 		statusCode : {
		// 			200: function( res, stausText, xhr ) { 
		// 				//更新成功
		// 				clearInput();
		// 			},
		// 			400: function ( xhr, statusText, err ) {
		// 				// BAD_REQUEST 400	发送到服务器的对象为空
		// 			},
		// 			404: function () {
		// 				// NOT_FOUND 404	要更新的id不存在
		// 			}
					
		// 		},
		// 		error: function (xhr, statusText, err) {

  //               }
		// 	});
		// });

		//添加
		$("#send").click(function() {
			if ( !checkInput( 'create' ) ) {
				alert("有未填写");
				return;
			}
			var name = $("#ModelName").val();
			var des = $("#ModelDes").val();

			var formData = new FormData();
			formData.append('name', name);
			formData.append('des', des);
			formData.append('file', $("#ModelFile")[0].files[0]);

			$.ajax({
				url : '/models/create',
				type : 'POST',
				data : formData,
				contentType : false,
				//contentType : 'application/json',
				//dataType : 'json',	//不要随便添加这句
				processData : false,
				statusCode : {
					201: function ( res, stausText, xhr ) {
						// CREATED 201
						/* res 返回的body内容
						 * stausText 成功的时候应该是success
						 * xhr 对象
						 */
						 var id =  xhr.getResponseHeader("Location");
						 // $scope.add({ id: id, name: name, des: des });
						 // $scope.$apply();
						 alert("模型创建成功!");
						 window.location.reload();
						 clearInput();
					},
					400: function () {
						// BAD_REQUEST 400	发送到服务器的对象为空
					}
				},
				error: function (xhr, statusText, err) {
                    //StatusCode=2xx或304时执行success, 其余则将触发error
                    
                }

			});
		});
	});