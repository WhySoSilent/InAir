{
	common: {
		name: '___',
		des: '___',
		feature: [{
			title: '___',
			des: '___',
			focus: {
				position: [[100,100,100],[200,100,300]],
				lookAt: [[0,0,0],[0,0,0]],
				up: [[0,1,0],[0,1,0]],
				periodTime: 700
			}
		}],
		enableFeature: true
	},
	scene: {
		camera: {
			front: 1,
			back: 1000,
			fog: 1,
			position: [1,1,1],
			lookAt: [0,0,0]
			up: [0,1,0],
		},
		control: {
			type: 'OrbitControls|TrackballControls',
			zoom: true,
			pan: false, 
			autoRotate: true,	//OrbitControls only
			minDistance: 1,
			maxDistance: 1000000,
			minPolarAngle: 0,	// radians
			maxPolarAngle: Math.PI,	// radians

			//OrbitControls|TrackballControls 对 自动旋转的命名好像都不一样
			//OrbitControls|TrackballControls 对 keys 的处理都不一样
	
			// position: [ 0, 0, 10],	//这个属性写入到相机
			// up: [0, 1, 0]
		},
		light: [{
			type: 'PointLight',
			name: '主光',
			color: "#ffffff",
			intensity: 1,	// DirectionalLight / PointLight only
			distance: 0,	// PointLight only
			position: [ -100, 10 , -100]
		}],
		fog: {
			enableFog: true,
			color: [0,0,0],
			near: 10,
			far: 100
		},
		audio: {
			enableAudio: false,
			url: '/data/models/:id/audio/audio.mp3'
		},
		background: {
			type: 'color||image',
			color: '#eee',
			image: '/data/models/:id/background/bg.jpg'
		},
		environment: {
			enable: true,
			type: 'skybox|scene',	//目前忽略此选项，统一为 skybox
			skybox: 'id',	//这里是一个id
			size: 100000
		}
	},
	material: [{
		name: 'name',
		shading: 'basic|lambert|phong',
		visible: true,
		color: [255,255,255],
		ambient: [255,255,255],
		emissive: null,
		specular: [255,255,255],
		side: 'Front|Back|Double',
		refractionRatio: .5,
		combine: 'MultiplyOperation|MixOperation|AddOperation',
		// ----------------
		transparent: true,
		opacity: .5,
		// ----------------
		wireframe: true,


		shininess: 30,

		reflectivity: .5,
		group: 'name',

		enableMap: true,
		enableSpecular: true,
		enableBump: true,
		enableNormal: true,
		enableEnv: true,
		enableLight: true,

			//filtering: 'Linear|Nearest',
			//format: 'RGB|RGBA',
			//wrapS: 'repeatX|repeatY',
			//wrapT: 'repeatX|repeatY'

		//sourceFile, repeat, offset, wrap, anisotropy
		//mapDiffuse
		mapDiffuse: '___.jpg',
		mapDiffuseRepeat: [1, 1],
		mapDiffuseOffset,
		mapDiffuseWrap: ['repeat', 'repeat'],
		mapDiffuseAnisotropy
		//mapLight
		mapLight: '___.jpg',
		mapLightRepeat: [1, 1],
		mapLightOffset,
		mapLightWrap: ['repeat', 'repeat'],
		mapLightAnisotropy
		//mapBump
		mapBump: '___.jpg',
		mapBumpRepeat: [1, 1],
		mapBumpOffset,
		mapBumpWrap: ['repeat', 'repeat'],
		mapBumpAnisotropy
		//mapNormal
		mapNormal: '___.jpg',
		mapNormalRepeat: [1, 1],
		mapNormalOffset,
		mapNormalWrap,
		mapNormalAnisotropy
		//mapSpecular
		mapSpecular: '___.jpg',
		mapSpecularRepeat: [1, 1],
		mapSpecularOffset,
		mapSpecularWrap: ['repeat', 'repeat'],
		mapSpecularAnisotropy

	}]
}