//---------------------------- 评论
GET		/api/models/:id/comment
		<-- [{ Comment }] || []

POST	/api/models/:id/comment
		-->	${ mail: 'example@mail.com', context: '...' }
		<-- 201 + { Comment } || 400 BAD_REQUEST

Comment: 
	{
		id: '___',
		mail: 'example@mail.com',
		context: 'context here ...',
		anonymous: true,
		when: 'Thu Apr 24 2014 10:23:45 GMT+0800'
	}

//---------------------------- 贴图
GET		/api/models/:id/texture
		<-- [{ Texture }] || []

POST	/api/models/:id/texture
		-->	FormData { name: '___', file: __.jpg }
		<-- 201 + { Texture } || 400 BAD_REQUEST

POST	/api/models/:id/texture/:id/delete
		<-- 200 || 404 NOT_FOUND


Texture:
	{
		id: '___',
		name: '___',
		texture: 'texture/id.jpg'	//文件相对路径
	}


//---------------------------- 环境贴图
GET		/api/models/:id/envTexture
		<-- [{ EnvTexture }] || []

POST	/api/models/:id/envTexture
		--> FormData { name: '___', nx: __.jpg, ny: __.jpg, nz: __.jpg, px: __.jpg, py: __.jpg, pz: __.jpg }
		<-- 201 + { EnvTexture } || 400 BAD_REQUEST

POST	/api/models/:id/envTexture/:id/delete
		<-- 200 || 404 NOT_FOUND


EnvTexture: 
	{
		id: '___',
		name: '___',
		texture: [
			'env/id_px.jpg',
			'env/id_py.jpg',
			'env/id_pz.jpg',
			'env/id_nx.jpg',
			'env/id_ny.jpg',
			'env/id_nz.jpg'
		]
	}