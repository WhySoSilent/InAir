/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,			//环境色，默认为白色
 *  emissive: <hex>,		//发射光的颜色，默认为黑色
 *  specular: <hex>,		//镜面颜色,镜面光泽的颜色
 *  shininess: <float>,		//反光度，默认 30 ，越高将给出越锐利的高光效果
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  bumpMap: new THREE.Texture( <Image> ),
 *  bumpScale: <float>,
 *
 *  normalMap: new THREE.Texture( <Image> ),
 *  normalScale: <Vector2>,
 *
 *  specularMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,			//光照与颜色混合的方式，默认为乘法
 *  reflectivity: <float>,				//反射率，默认为1，即全部反射
 *  refractionRatio: <float>,			//折射率（即穿透物体一个单位长度后衰减的比率），可能用于透明物体
 *
 *  shading: THREE.SmoothShading,		//平滑shading
 *  blending: THREE.NormalBlending,		//调和、协调、混合
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */

THREE.MeshPhongMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.color = new THREE.Color( 0xffffff ); // diffuse
	this.ambient = new THREE.Color( 0xffffff );
	this.emissive = new THREE.Color( 0x000000 );
	this.specular = new THREE.Color( 0x111111 );
	this.shininess = 30;

	this.metal = false;
	this.perPixel = true;

	this.wrapAround = false;
	this.wrapRGB = new THREE.Vector3( 1, 1, 1 );

	this.map = null;

	this.lightMap = null;

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalScale = new THREE.Vector2( 1, 1 );

	this.specularMap = null;

	this.envMap = null;
	this.combine = THREE.MultiplyOperation;
	this.reflectivity = 1;
	this.refractionRatio = 0.98;

	this.fog = true;

	this.shading = THREE.SmoothShading;

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = 'round';
	this.wireframeLinejoin = 'round';

	this.vertexColors = THREE.NoColors;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

};

THREE.MeshPhongMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.MeshPhongMaterial.prototype.clone = function () {

	var material = new THREE.MeshPhongMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.ambient.copy( this.ambient );		//...存在性验证
	material.emissive.copy( this.emissive );
	material.specular.copy( this.specular );
	material.shininess = this.shininess;

	material.metal = this.metal;
	material.perPixel = this.perPixel;

	material.wrapAround = this.wrapAround;
	material.wrapRGB.copy( this.wrapRGB );

	material.map = this.map;

	material.lightMap = this.lightMap;

	material.bumpMap = this.bumpMap;
	material.bumpScale = this.bumpScale;

	material.normalMap = this.normalMap;
	material.normalScale.copy( this.normalScale );

	material.specularMap = this.specularMap;

	material.envMap = this.envMap;
	material.combine = this.combine;
	material.reflectivity = this.reflectivity;
	material.refractionRatio = this.refractionRatio;

	material.fog = this.fog;

	material.shading = this.shading;

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;
	material.wireframeLinecap = this.wireframeLinecap;
	material.wireframeLinejoin = this.wireframeLinejoin;

	material.vertexColors = this.vertexColors;

	material.skinning = this.skinning;
	material.morphTargets = this.morphTargets;
	material.morphNormals = this.morphNormals;

	return material;

};

THREE.MeshPhongMaterial.prototype.copy = function ( material ) {
	
	THREE.Material.prototype.copy.call( this, material );

	this.color.copy( material.color );
	this.ambient.copy( material.ambient );
	this.emissive.copy( material.emissive );
	this.specular.copy( material.specular );
	this.shininess = material.shininess;

	this.metal = material.metal;
	this.perPixel = material.perPixel;

	this.wrapAround = material.wrapAround;
	this.wrapRGB.copy( material.wrapRGB );

	this.map = material.map;

	this.lightMap = material.lightMap;

	this.bumpMap = material.bumpMap;
	this.bumpScale = material.bumpScale;

	this.normalMap = material.normalMap;
	this.normalScale.copy( material.normalScale );

	this.specularMap = material.specularMap;

	this.envMap = material.envMap;
	this.combine = material.combine;
	this.reflectivity = material.reflectivity;
	this.refractionRatio = material.refractionRatio;

	this.fog = material.fog;

	this.shading = material.shading;

	this.wireframe = material.wireframe;
	this.wireframeLinewidth = material.wireframeLinewidth;
	this.wireframeLinecap = material.wireframeLinecap;
	this.wireframeLinejoin = material.wireframeLinejoin;

	this.vertexColors = material.vertexColors;

	this.skinning = material.skinning;
	this.morphTargets = material.morphTargets;
	this.morphNormals = material.morphNormals;

	return this;
};
