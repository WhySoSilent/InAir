/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),		//光照映射
 *
 *  specularMap: new THREE.Texture( <Image> ),	//
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,		//是否启用morphTarget模式
 *
 *  fog: <bool>			//显示材质的颜色是否会被全局的fog设定影响
 * }
 */

THREE.MeshBasicMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.color = new THREE.Color( 0xffffff ); // emissive

	this.map = null;

	this.lightMap = null;

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

	this.setValues( parameters );

};

THREE.MeshBasicMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.MeshBasicMaterial.prototype.clone = function () {

	var material = new THREE.MeshBasicMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );

	material.map = this.map;

	material.lightMap = this.lightMap;

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

	return material;

};

THREE.MeshBasicMaterial.prototype.copy = function ( material ) {
	THREE.Material.prototype.copy.call( this, material );

	this.color.copy( material.color );

	this.map = material.map;

	this.lightMap = material.lightMap;

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

	//----------------------------------------
	// this.ambient.copy( material.ambient );
	// this.emissive.copy( material.emissive );
	// this.specular.copy( material.specular );
	// this.shininess = material.shininess;

	// this.metal = material.metal;
	// this.perPixel = material.perPixel;

	// this.wrapAround = material.wrapAround;
	// this.wrapRGB.copy( material.wrapRGB );

	// this.bumpMap = material.bumpMap;
	// this.bumpScale = material.bumpScale;

	// this.normalMap = material.normalMap;
	// this.normalScale.copy( material.normalScale );

	// this.morphNormals = material.morphNormals;

	return this;
};
