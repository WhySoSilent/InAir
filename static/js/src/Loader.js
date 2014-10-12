
Loader = function ( showStatus ) {

	THREE.Loader.call( this, showStatus );

	this.withCredentials = false;

};
Loader.prototype = Object.create( THREE.Loader.prototype );

Loader.prototype.load = function ( url, callback, texturePath, callbackProgress) {
	var scope = this;

	// todo: unify load API to for easier SceneLoader use

	texturePath = texturePath && ( typeof texturePath === "string" ) ? texturePath : this.extractUrlBase( url );

	this.onLoadStart();
	this.loadAjaxJSON( this, url, callback, texturePath, callbackProgress);
}
Loader.prototype.loadAjaxJSON = function ( context, url, callback, texturePath, callbackProgress ) {

	var xhr = new XMLHttpRequest();

	var length = 0;

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === xhr.DONE ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				if ( xhr.responseText ) {

					var json = JSON.parse( xhr.responseText );

					Plane.model.metadata = json.metadata;
					Plane.model.metaMaterial = json.materials;

					if( json.buffers === undefined || json.buffers === '' ) {
						var result = THREE.JSONLoader.prototype.parse( json, texturePath );
						callback( result.geometry, result.materials,  json.metadata, json.materials);
					} else {
						THREE.BinaryLoader.prototype.loadAjaxBuffers( json, callback, binaryPath = texturePath, texturePath, callbackProgress );
					}

				} else {

					console.warn( "THREE.JSONLoader: [" + url + "] seems to be unreachable or file there is empty" );

				}

				// in context of more complex asset initialization
				// do not block on single failed file
				// maybe should go even one more level up

				context.onLoadComplete();

			} else {

				console.error( "THREE.JSONLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		} else if ( xhr.readyState === xhr.LOADING ) {

			if ( callbackProgress ) {

				if ( length === 0 ) {

					length = xhr.getResponseHeader( "Content-Length" );

				}

				callbackProgress( { total: length, loaded: xhr.responseText.length } );

			}

		} else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

			if ( callbackProgress !== undefined ) {

				length = xhr.getResponseHeader( "Content-Length" );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.withCredentials = this.withCredentials;
	xhr.send( null );
};