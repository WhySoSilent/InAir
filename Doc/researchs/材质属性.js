	Material

	this.id 						THREE.MaterialIdCount ++;
	this.uuid 						THREE.Math.generateUUID();
	this.name 						'';
	this.side 						THREE.FrontSide;
	this.opacity 					1;
	this.transparent 				false;
	this.blending 					THREE.NormalBlending;
	this.blendSrc 					THREE.SrcAlphaFactor;
	this.blendDst 					THREE.OneMinusSrcAlphaFactor;
	this.blendEquation 				THREE.AddEquation;
	this.depthTest 					true;
	this.depthWrite 				true;
	this.polygonOffset 				false;
	this.polygonOffsetFactor 		0;
	this.polygonOffsetUnits 		0;
	this.alphaTest 					0;
	this.overdraw 					0;
	this.visible 					true;
	this.needsUpdate 				true;

/**
 * parameters = {
 *  opacity: <float>,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 * }
 */

	MeshBasicMaterial

	THREE.Material.call( this );

	-this.color 					new THREE.Color( 0xffffff );

	-this.map 						null;

	-this.lightMap 					null;

	-this.specularMap 				null;

	-this.envMap 					null;
	-this.combine 					THREE.MultiplyOperation;
	-this.reflectivity 				1;
	-this.refractionRatio 			0.98;

	-this.fog 						true;

	-this.shading 					THREE.SmoothShading;

	-this.wireframe 					false;
	-this.wireframeLinewidth 		1;
	this.wireframeLinecap 			'round';
	this.wireframeLinejoin 			'round';

	-this.vertexColors 				THREE.NoColors;

	-this.skinning 					false;
	-this.morphTargets 				false;


	MeshPhongMaterial ---------------------------------------

	-this.color 					new THREE.Color( 0xffffff ); // diffuse
	-this.ambient 					new THREE.Color( 0xffffff );
	-this.emissive 					new THREE.Color( 0x000000 );
	-this.specular 					new THREE.Color( 0x111111 );
	-this.shininess 				30;

	this.metal 						false;
	this.perPixel 					true;

	this.wrapAround 				false;
	this.wrapRGB 					new THREE.Vector3( 1, 1, 1 );

	-this.map 						null;

	-this.lightMap 					null;

	-this.bumpMap 					null;
	-this.bumpScale 				1;

	-this.normalMap 				null;
	-this.normalScale 				new THREE.Vector2( 1, 1 );

	-this.specularMap 				null;

	-this.envMap 					null;
	-this.combine 					THREE.MultiplyOperation;
	-this.reflectivity 				1;
	-this.refractionRatio 			0.98;

	-this.fog 						true;

	-this.shading 					THREE.SmoothShading;

	-this.wireframe 				false;
	-this.wireframeLinewidth		 	1;
	this.wireframeLinecap 			'round';
	this.wireframeLinejoin 			'round';

	-this.vertexColors 				THREE.NoColors;

	-this.skinning 					false;
	-this.morphTargets 				false;
	-this.morphNormals 				false;

	MeshLambertMaterial ---------------------------------------

	-this.color 					new THREE.Color( 0xffffff ); // diffuse
	-this.ambient 					new THREE.Color( 0xffffff );
	-this.emissive 					new THREE.Color( 0x000000 );

	 this.wrapAround 				false;
	 this.wrapRGB 					new THREE.Vector3( 1, 1, 1 );

	-this.map 						null;

	-this.lightMap 					null;

	-this.specularMap 				null;

	-this.envMap 					null;
	-this.combine 					THREE.MultiplyOperation;
	-this.reflectivity 				1;
	-this.refractionRatio 			0.98;

	-this.fog 						true;

	-this.shading 					THREE.SmoothShading;

	-this.wireframe 				false;
	-this.wireframeLinewidth 		1;
	 this.wireframeLinecap 			'round';
	 this.wireframeLinejoin 		'round';

	-this.vertexColors 				THREE.NoColors;