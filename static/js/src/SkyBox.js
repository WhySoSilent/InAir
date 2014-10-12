/*
 * 环境贴图 2014/2/15
 */
SkyBox = function( containner ) {
	Sim.Object.call(this);
	this.containner = containner;
	this.enableOne = null;

	//this.loaded = false;	//...这个值监听的到么
}
SkyBox.prototype = new Sim.Object();	//...有必要么
SkyBox.prototype.init = function( witch, size ) {
	if( witch === undefined || witch === '' ) return;
	var size = size || 10000;
	//检查一下 witch 情况

	var sb = "/data/models/" + Plane.modelId + "/env/" + witch ;
	var urls = [ sb + "_px.jpg", sb + "_nx.jpg",
				 sb + "_py.jpg", sb + "_ny.jpg",
				 sb + "_pz.jpg", sb + "_nz.jpg" ];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		side: THREE.BackSide
	} );

	var cubeMesh = new THREE.Mesh( new THREE.CubeGeometry( size, size, size ), material );
	cubeMesh.name ='skybox';

	this.remove();	//先取消掉当前的skybox，如果有的话
	this.containner.add( cubeMesh );
	this.enableOne = cubeMesh;
	return this;
}
SkyBox.prototype.resize = function(size) {
	//... 这个没搞定，没用
	if( !this.enableOne ) return;
	this.enableOne.geometry.width = size;
	this.enableOne.geometry.height = size;
	this.enableOne.geometry.depth = size;
	this.enableOne.geometry.buffersNeedUpdate = true;

}
SkyBox.prototype.remove = function() {
	if( this.enableOne !== null ) {
		this.containner.remove( this.enableOne );
		this.enableOne = null;
	}
}
SkyBox.prototype.enable = function() {
	if( this.enableOne === null ) {
		if( Plane.confEnvironment.type === 'skybox' && Plane.confEnvironment.skybox != null ) {
			this.init( Plane.confEnvironment.skybox );
			return;
		}
		return;
	};

	this.enableOne.visible = true;
}
SkyBox.prototype.disable = function() {
	if( this.enableOne === null ) return;
	this.enableOne.visible = false;
}