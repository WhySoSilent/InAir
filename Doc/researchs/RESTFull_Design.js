/*
 *	2014/3/4
 */

/******************* 静态映射 **********************/

GET		/
		<-- index.html


GET		/scenes
		<-- list.html


GET		/scenes/:id
		<-- view.html


GET		/scenes/:id/admin/QW23ER45T	//-------------------- 编辑界面
		<-- edit.html


GET		/iframe/:id 				//-------------------- 外链地址
		<-- iframe.html


GET		/admin/QW23ER45T			//-------------------- CMS

/******************* 异步API **********************/

GET		/api/models					//-------------------- 加载模型列表
		<-- [{ Model }]


GET		/api/models/:id				//-------------------- 模型信息
		<-- { Model } || 404 NOT_FOUND


GET		/api/models/:id/conf		//-------------------- 配置信息
		<--	{ Congig } || null


POST	/api/models/:id/conf		//-------------------- 修改配置
		--> { Config }
		<-- 200 || 400 BAD_REQUEST


POST	/models/create				//-------------------- 添加模型
		-->	FormData: { name: '___', des: '___', file: xxx.zip }
		<-- 201 + Location || 400 BAD_REQUEST


POST	/models/:id/update			//-------------------- 上传模型
		--> { name: '___', des: '___' }
		<--	200 || 404 NOT_FOUND | 400 BAD_REQUEST

POST	/models/:id/delete			//-------------------- 删除模型
		<-- 200 || 404 NOT_FOUND

//---------------------------- 贴图资源

GET		/api/models/:id/textures
		<-- [{ Texture }] || []

POST	/api/models/:id/textures/create
		-->	FormData { name: '___', file: __.jpg }
		<-- 201 + { Texture } || 400 BAD_REQUEST

POST	/api/models/:id/textures/:id/delete
		<-- 200 || 404 NOT_FOUND

GET		/api/models/:id/envTextures
		<-- [{ EnvTexture }] || []

POST	/api/models/:id/envTextures/create
		--> FormData { name: '___', nx: __.jpg, ny: __.jpg, nz: __.jpg, px: __.jpg, py: __.jpg, pz: __.jpg }
		<-- 201 + { EnvTexture } || 400 BAD_REQUEST

POST	/api/models/:id/envTextures/:id/delete
		<-- 200 || 404 NOT_FOUND

//---------------------------- 资源上传
POST	/api/models/:id/resourceUpload
		--> FormData { position: '___', file: ___.jpg, name: '___' }
		<-- 201 + Location || 400 BAD_REQUEST

// POST	/upload/preview/:id
// 		-->	type: '', file: xxx.jpg		////////////////////////////////////////////
// 		<-- 201 + Location || 400 BAD_REQUEST

//---------------------------- 评论
GET		/api/models/:id/comments
		<-- [{ Comment }] || []

POST	/api/models/:id/comments/create
		-->	{ mail: 'example@mail.com', anonymous: true, context: '...' }
		<-- 201 + { Comment } || 400 BAD_REQUEST

// POST	/api/models/:id/comment/:id/like
// 		<-- 201 || 404 NOT_FOUND

// POST	/api/models/:id/comment/:id/unlike
// 		<-- 201 || 404 NOT_FOUND