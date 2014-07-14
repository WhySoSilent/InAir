/**
 * @author MPanknin / http://www.redplant.de/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.AreaLight = function ( hex, intensity ) {

	THREE.Light.call( this, hex );

	this.normal = new THREE.Vector3( 0, -1, 0 );
	this.right = new THREE.Vector3( 1, 0, 0 );

	this.intensity = ( intensity !== undefined ) ? intensity : 1;

	this.width = 1.0;
	this.height = 1.0;

	this.constantAttenuation = 1.5;		//常数衰减
	this.linearAttenuation = 0.5;		//线性衰减
	this.quadraticAttenuation = 0.1;	//二次衰减

};

THREE.AreaLight.prototype = Object.create( THREE.Light.prototype );

