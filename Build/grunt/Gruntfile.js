module.exports = function (grunt) {
	//config the project
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
		  options: {
			separator: '\n'
		  },
		  view: {
			src: [
					"../../static/lib/webgl/sim.edit.js",

					"../../static/js/src/Loader.js",
					"../../static/js/src/JSONModel.js",
					"../../static/js/src/MainCamera.js",
					"../../static/js/src/Controls.js",
					"../../static/js/src/Lights.js",
					"../../static/js/src/SkyBox.js",
					"../../static/js/src/Animation.js",
					"../../static/js/src/Config.js",
					"../../static/js/src/FeatureViewer.js",
					"../../static/js/src/Audio.js",
					"../../static/js/src/ModelViewer.js",
					"../../static/js/src/Previewer.js",
					"../../static/js/src/comment.js"
			],
			dest: "../../static/js/plane.view.js"
		  },
		  iframe: {
			src: [
					"../../static/lib/webgl/sim.edit.js",

					"../../static/js/src/Loader.js",
					"../../static/js/src/JSONModel.js",
					"../../static/js/src/MainCamera.js",
					"../../static/js/src/Controls.js",
					"../../static/js/src/Lights.js",
					"../../static/js/src/SkyBox.js",
					"../../static/js/src/Animation.js",
					"../../static/js/src/Config.js",
					"../../static/js/src/FeatureViewer.js",
					"../../static/js/src/Audio.js",
					"../../static/js/src/ModelViewer.js",
					"../../static/js/src/Previewer.js"
			],
			dest: "../../static/js/plane.iframe.js"
		  },
		  edit: {
			src: [
					"../../static/lib/webgl/sim.edit.js",

					"../../static/js/src/Loader.js",
					"../../static/js/src/JSONModel.js",
					"../../static/js/src/MainCamera.js",
					"../../static/js/src/Controls.js",
					"../../static/js/src/Lights.js",
					"../../static/js/src/SkyBox.js",
					"../../static/js/src/Animation.js",
					"../../static/js/src/UpdateStatus.js",
					"../../static/js/src/Config.js",
					"../../static/js/src/FeatureViewer.js",
					"../../static/js/src/Audio.js",
					"../../static/js/src/ModelViewer.js",

					"../../static/js/src/module/texture.js",
					"../../static/js/src/module/parse.js",
					"../../static/js/src/module/editer.directives.js",
					"../../static/js/src/module/editer.js",
					"../../static/js/src/module/editer.controllers.common.js",
					"../../static/js/src/module/editer.controllers.scene.js",
					"../../static/js/src/module/editer.controllers.material.js",
					"../../static/js/src/editer_starter.js"
			],
			dest: "../../static/js/plane.edit.js"
		  },

		  viewLib: {
			src: [
					"../../static/lib/common/modernizr.js",
					"../../static/lib/common/jquery-1.10.2.min.js",
					"../../static/lib/common/jquery.mousewheel.js",

					"../../static/lib/bootstrap/js/bootstrap.min.js",
					"../../static/lib/mvc/underscore-1.4.3.js",
					"../../static/lib/mvc/backbone-min-1.0.0.js",
					"../../static/lib/mvc/ejs.js",
					"../../static/lib/mvc/ejs.view.js",	//... 这个好像没用到

					"../../static/lib/webgl/RequestAnimationFrame.js",
					"../../static/lib/webgl/Tween.min.js",
					"../../static/lib/webgl/stats.js",
					"../../static/lib/webgl/three.min.js"

			],
			dest: "../../static/js/lib.view.js"
		  },
		  iframeLib: {
			src: [
					"../../static/lib/common/modernizr.js",
					"../../static/lib/common/jquery-1.10.2.min.js",
					"../../static/lib/common/jquery.mousewheel.js",

					"../../static/lib/bootstrap/js/bootstrap.min.js",
					"../../static/lib/mvc/underscore-1.4.3.js",
					"../../static/lib/mvc/backbone-min-1.0.0.js",
					"../../static/lib/mvc/ejs.js",

					"../../static/lib/webgl/RequestAnimationFrame.js",
					"../../static/lib/webgl/Tween.min.js",
					"../../static/lib/webgl/stats.js",
					"../../static/lib/webgl/three.min.js"
			],
			dest: "../../static/js/lib.iframe.js"
		  },
		  editLib: {
			src: [
					"../../static/lib/common/modernizr.js",
					"../../static/lib/common/jquery-1.10.2.min.js",
					"../../static/lib/common/jquery.mousewheel.js",

					"../../static/lib/bootstrap/js/bootstrap.min.js",
					"../../static/lib/mvc/underscore-1.4.3.js",
					"../../static/lib/mvc/backbone-min-1.0.0.js",
					"../../static/lib/mvc/ejs.js",

					"../../static/lib/webgl/RequestAnimationFrame.js",
					"../../static/lib/webgl/Tween.min.js",
					"../../static/lib/webgl/stats.js",
					"../../static/lib/webgl/three.min.js",

					"../../static/lib/mvvc/angular.min.js",
  					"../../static/lib/mvvc/angular-route.min.js"

			],
			dest: "../../static/js/lib.edit.js"
		  },
		  indexStyle: {
			src: [
					"../../static/lib/bootstrap/css/bootstrap.min.css",
					"../../static/css/src/index.css",
					"../../static/css/src/header.css",
					"../../static/css/src/modelCard.css",
					"../../static/css/src/usInfo.css"
			],
			dest: "../../static/css/index.css"
		  },
		  listStyle: {
			src: [
					"../../static/lib/bootstrap/css/bootstrap.min.css",
					"../../static/css/src/list.css",
					"../../static/css/src/header.css",
					"../../static/css/src/modelCard.css"
			],
			dest: "../../static/css/list.css"
		  },
		  viewStyle: {
			src: [
					"../../static/lib/bootstrap/css/bootstrap.min.css",
					"../../static/css/src/view.css",
					"../../static/css/src/header.1.css",
					"../../static/css/src/comment.css",
					"../../static/css/src/footer.css",
					"../../static/css/src/previewer.css",
					"../../static/css/src/webglContainer.css",
					"../../static/css/src/featureLeaver.css"
			],
			dest: "../../static/css/view.css"
		  },
		  iframeStyle: {
			src: [
					"../../static/lib/bootstrap/css/bootstrap.min.css",
					"../../static/css/src/iframe.css",
					"../../static/css/src/previewer.css",
					"../../static/css/src/webglContainer.css",
					"../../static/css/src/featureLeaver.css"
			],
			dest: "../../static/css/iframe.css"
		  },
		  editStyle: {
			src: [
					"../../static/lib/bootstrap/css/bootstrap.min.css",
					"../../static/css/src/edit.css",
					"../../static/css/src/webglContainer.css",
					"../../static/css/src/featureLeaver.css",
					"../../static/css/src/switch.css",
					"../../static/css/src/expander.css",
					"../../static/css/src/editer.css"
			],
			dest: "../../static/css/edit.css"
		  },
		  adminStyle: {
			src: [
					"../../static/lib/bootstrap/css/bootstrap.min.css",
					"../../static/css/src/admin.css"
			],
			dest: "../../static/css/admin.css"
		  }
		},
		uglify: {
			options: {
				banner: '/*! WANG-2014@SuZhou <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    	},
			view: {
				src: '../../static/js/plane.view.js',
				dest: '../../static/js/plane.view.min.js'
			},
			iframe: {
				src: '../../static/js/plane.iframe.js',
				dest: '../../static/js/plane.iframe.min.js'
			},
			edit: {
	    		src: '../../static/js/plane.edit.js',
				dest: '../../static/js/plane.edit.min.js'
	    	}
		},
        replace: {
            index: {
                src: ['../../static/css/index.css'],
                overwrite: true,
                replacements: [{
                    from: /\.\.\//g,
                    to: '/lib/bootstrap/'
                }]
            },
            list: {
                src: ['../../static/css/list.css'],
                overwrite: true,
                replacements: [{
                    from: /\.\.\//g,
                    to: '/lib/bootstrap/'
                }]
            },
            view: {
                src: ['../../static/css/view.css'],
                overwrite: true,
                replacements: [{
                    from: /\.\.\//g,
                    to: '/lib/bootstrap/'
                }]
            },
            iframe: {
                src: ['../../static/css/iframe.css'],
                overwrite: true,
                replacements: [{
                    from: /\.\.\//g,
                    to: '/lib/bootstrap/'
                }]
            },
            edit: {
                src: ['../../static/css/edit.css'],
                overwrite: true,
                replacements: [{
                    from: /\.\.\//g,
                    to: '/lib/bootstrap/'
                }]
            },
            admin: {
                src: ['../../static/css/admin.css'],
                overwrite: true,
                replacements: [{
                    from: /\.\.\//g,
                    to: '/lib/bootstrap/'
                }]
            }
        },
		// uglify: {
		// 	"my_target": {
		// 		"files": {
		// 			'dest/libs.min.js': ['src/editer.js', 'src/JSONModel.js']
		// 		}
		// 	}
		// },
		watch: {
		  files: ['../../static/js/*.js'],
		  tasks: ['concat', 'uglify']
		}
	});
	// 加载提供任务的插件
	// grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-text-replace');

	// tasks
  	grunt.registerTask('build-js-view', ['concat:viewLib', 'concat:view', 'uglify:view']);
  	grunt.registerTask('build-js-iframe', ['concat:iframeLib', 'concat:iframe', 'uglify:iframe']);
  	grunt.registerTask('build-js-edit', ['concat:editLib', 'concat:edit', 'uglify:edit']);

  	grunt.registerTask('build-css-index', ['concat:indexStyle', 'replace:index']);
  	grunt.registerTask('build-css-list', ['concat:listStyle', 'replace:list']);
  	grunt.registerTask('build-css-view', ['concat:viewStyle', 'replace:view']);
  	grunt.registerTask('build-css-iframe', ['concat:iframeStyle', 'replace:iframe']);
  	grunt.registerTask('build-css-edit', ['concat:editStyle', 'replace:edit']);
  	grunt.registerTask('build-css-admin', ['concat:adminStyle', 'replace:admin']);
}