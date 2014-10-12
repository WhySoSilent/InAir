var directiveDemo = angular.module('editer.directives', ['texture'])
.directive('expander', function(){
	// Runs during compile
	return {
		priority: 1000,
		// terminal: true,
		scope: true,
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: '/js/views/expanderTemplate.html',
		replace: true,
		transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function(scope, iElm, iAttrs, controller) {
			//data
			scope.showMe = false;
			$(iElm).find('.text').html(iAttrs["expanderTitle"]);
			//handdle
			scope.toggle = function() {
				scope.showMe = !scope.showMe;
				if( scope.showMe ) {
					//激活 watch
					//1. 他负责哪几个watch
					//2. 这些watch从哪里来？
					//3. 我怎么知道这些watch有没有正在监视？

				} else {
					//取消 watch
				}
			}
		}
	};
})
.directive('format', function () {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$parsers.push(function (viewValue) {
                return Number(viewValue);
            });
        }
    };
})
.directive('wSwitch', function() {
	return {
		scope: { enable: '=witchEnable' },
		restrict: 'EA',
		templateUrl: '/js/views/switchTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.toggle = function() {
				scope.enable = !scope.enable;
			}

			//scope.$watch('enable', function() { alert('changed')});
		}
	}
})
.directive('wImgcontrol', ['Texture',function(Texture) {
	return {
		scope: {
			textures : '=textureLib' ,
			choosed: '=handdleWitch' ,
			modelId: '@modelId',
			repeat: '=repeatOne',
			wrap: '=wrapOne',
			filter: '=filterOne'
		},
		restrict: 'EA',
		templateUrl: '/js/views/imgcontrolTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;
			scope.createNewone = false;

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.showThis = function() {
				scope.showMe = true;
			}
			scope.hiddenThis = function() {
				scope.showMe = false;
			} 
			//scope.$watch('enable', function() { alert('changed')});
		}
	}
}])
.directive('wEnvcontrol', ['Texture',function(Texture) {
	return {
		scope: { envTextures : '=envLib' , choosed: '=handdleWitch' , modelId: '@modelId' },
		restrict: 'EA',
		templateUrl: '/js/views/envcontrolTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;
			scope.createNewone = false;

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.showThis = function() {
				scope.showMe = true;
			}
			scope.hiddenThis = function() {
				scope.showMe = false;
			}
		}
	}
}])
.directive('wFeatureControl', function() {
	return {
		scope: true,
		restrict: 'EA',
		templateUrl: '/js/views/featureControlTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
		}
	}
})
.directive('wTextureUpload', ['Texture', function(Texture) {
	return {
		scope: {
			createNewone: '=createNewone',
			returnTo: '=returnTo',
			modelId: '@modelId'
		},
		restrict: 'EA',
		templateUrl: '/js/views/textureUploadTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.uploading = false;
			scope.enable = false;
			scope.name = '';

			scope.toSelect = function() {
				//alert('54');
				scope.createNewone = true;
			}
			scope.exitCreate = function() {
				scope.createNewone = false;
			}
			scope.updateNewone = function() {
				var file = $(iElm).find("input[type=file]")[0].files[0];

				if( scope.name === null || scope.name === '' ) {
					alert("为贴图提供命名！");
					return;
				}
				if( file == undefined ) {
					alert("没有选取文件");
					return;
				}

				var fd = new FormData();
				fd.append("name", scope.name );
				fd.append("file", file );

				$.ajax({
					url: '/api/models/' + scope.modelId + '/textures/upload',
					type: 'POST',
					data: fd,
					processData: false,
					contentType: false,
					statusCode : {
						201: function ( res, stausText, xhr ) {
							// CREATED 201
							/* res 返回的body内容
							 * stausText 成功的时候应该是success
							 * xhr 对象
							 */
							 scope.handdleSuccess(res);	//... 返回的是json么??
						},
						400: function () {
							// BAD_REQUEST 400	发送到服务器的对象为空
							scope.uploading = false;
						}
					},
					error: function (xhr, statusText, err) {
			            //StatusCode=2xx或304时执行success, 其余则将触发error
			            alert('上传出现了问题，请重试！');
			            scope.handdleError();
			            //scope.testResponse();
			        }
				});
				scope.uploading = true;
			}
			scope.handdleSuccess = function(res) {
				scope.uploading = false;
				Texture.addTexture(res);
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
			scope.handdleError = function() {
				scope.uploading = false;
				scope.$apply();
			}
			scope.clearInput = function() {
				scope.name = null;
				$(iElm).find("input[type=file]").val("");
			}
			scope.testResponse = function() {
				var res = { id: 'QW23ER4', name: '木头', texture: 'texture/wood.jpg'};
				Texture.addTexture(res);
				scope.returnTo = res.texture;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
		}
	}
}])
.directive('wEnvTextureUpload', ['Texture', function(Texture) {
	return {
		scope: {
			createNewone: '=createNewone',
			returnTo: '=returnTo',
			modelId: '@modelId'
		},
		restrict: 'EA',
		templateUrl: '/js/views/envTextureUploadTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.uploading = false;
			scope.enable = false;
			scope.name = '';

			scope.toSelect = function() {
				//alert('54');
				scope.createNewone = true;
			}
			scope.exitCreate = function() {
				scope.createNewone = false;
			}
			scope.updateNewone = function() {
				var filePx = $(iElm).find("input.filePx")[0].files[0];
				var filePy = $(iElm).find("input.filePy")[0].files[0];
				var filePz = $(iElm).find("input.filePz")[0].files[0];
				var fileNx = $(iElm).find("input.fileNx")[0].files[0];
				var fileNy = $(iElm).find("input.fileNy")[0].files[0];
				var fileNz = $(iElm).find("input.fileNz")[0].files[0];

				if( scope.name === null || scope.name === '' ) {
					alert("为环境提供命名！");
					return;
				}
				if( filePx == undefined || filePy == undefined || filePz == undefined || fileNx == undefined || fileNy == undefined || fileNz == undefined ) {
					alert("没有选取文件");
					return;
				}

				var fd = new FormData();
				fd.append("name", scope.name );
				fd.append("nx", fileNx );
				fd.append("ny", fileNy );
				fd.append("nz", fileNz );
				fd.append("px", filePx );
				fd.append("py", filePy );
				fd.append("pz", filePz );

				$.ajax({
					url: '/api/models/' + scope.modelId + '/envTextures/upload',
					type: 'POST',
					data: fd,
					processData: false,
					contentType: false,
					statusCode : {
						201: function ( res, stausText, xhr ) {
							// CREATED 201
							/* res 返回的body内容
							 * stausText 成功的时候应该是success
							 * xhr 对象
							 */
							 scope.handdleSuccess(res);	//... 返回的是json么??
						},
						400: function () {
							// BAD_REQUEST 400	发送到服务器的对象为空
							scope.uploading = false;
						}
					},
					error: function (xhr, statusText, err) {
			            //StatusCode=2xx或304时执行success, 其余则将触发error
			            alert('上传出现了问题，请重试！');
			            scope.handdleError();
			            //scope.testResponse();
			        }
				});
				scope.uploading = true;
			}
			scope.handdleSuccess = function(res) {
				scope.uploading = false;
				Texture.addEnvTexture(res);
				scope.returnTo = res.id;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
			scope.handdleError = function() {
				scope.uploading = false;
				scope.$apply();
			}
			scope.clearInput = function() {
				scope.name = null;
				$(iElm).find("input.filePx").val("");
				$(iElm).find("input.filePy").val("");
				$(iElm).find("input.filePz").val("");
				$(iElm).find("input.fileNx").val("");
				$(iElm).find("input.fileNy").val("");
				$(iElm).find("input.fileNz").val("");
			}
			scope.testResponse = function() {
				var res = { id: 'ccc', name: 'CCC', texture: ['env/ccc_px.jpg','env/ccc_py.jpg','env/ccc_pz.jpg','env/ccc_nx.jpg','env/ccc_ny.jpg','env/ccc_nz.jpg']};
				Texture.addEnvTexture(res);
				scope.returnTo = res.id;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
		}
	}
}])
.directive('wResourceControl', function() {
	return {
		scope: {
			position: '@rPosition',
			format: '@rFormat',
			name: '@rName',
			modelId: '@modelId',
			handdle: "=rHanddle"
		},
		restrict: 'EA',
		templateUrl: '/js/views/resourceControlTemplate.html',
		replace: true,
		link: function(scope, iElm, iAttrs, controller) {
			scope.showMe = false;
			scope.createNewone = false;

			scope.uploading = false;
			scope.enable = false;

			scope.toggle = function () {
				scope.showMe = !scope.showMe;
			}
			scope.toSelect = function() {
				scope.createNewone = true;
			}
			scope.exitCreate = function() {
				scope.createNewone = false;
			}
			scope.updateNewone = function() {
				var file = $(iElm).find("input[type=file]")[0].files[0];

				if( file == undefined ) {
					alert("没有选取文件");
					return;
				}
				//验证文件格式
				if( scope.format !== '' ) {
					var fileFormat = file.name.substr( file.name.lastIndexOf('.') + 1, scope.format.length ).toLowerCase();
					if( fileFormat !== scope.format ) {
						alert("必须上传 " +  scope.format+ "格式");
						return;
					}
				}

				var fd = new FormData();
				fd.append("position", scope.position );
				fd.append("file", file );
				fd.append("name", scope.name );

				$.ajax({
					url: '/api/models/' + scope.modelId + '/resourceUpload',
					type: 'POST',
					data: fd,
					processData: false,
					contentType: false,
					statusCode : {
						201: function ( res, stausText, xhr ) {
							// CREATED 201
							/* res 返回的body内容
							 * stausText 成功的时候应该是success
							 * xhr 对象
							 */
							// scope.handdle = "";	//...小把戏没用
							// scope.$apply();
							scope.handdle = xhr.getResponseHeader("Location");
							scope.handdleSuccess();
						}
					},
					error: function (xhr, statusText, err) {
			            //StatusCode=2xx或304时执行success, 其余则将触发error
			            alert('上传出现了问题，请重试！');
			            scope.handdleError();
			            //scope.testResponse();
			        }
				});
				scope.uploading = true;
			}
			scope.handdleSuccess = function() {
				scope.uploading = false;
				scope.createNewone = false;
				scope.$apply();
				scope.clearInput();
			}
			scope.handdleError = function() {
				scope.uploading = false;
				scope.$apply();
			}
			scope.clearInput = function() {
				$(iElm).find("input[type=file]").val("");
			}
		}
	}
});