/*
 * 2014/5/21
 * previewer
 */
function getRequest() {  
	var s = /\/scenes\/(\w+)/;
	var i = /\/iframe\/(\w+)/;
	if ( s.test( document.URL ) || i.test( document.URL ) ) {
		var modelId = RegExp.$1;
		return modelId;
	}
}
Previewer = function() {
 	this.previewId = getRequest();
 	this.files = null;	//array thar list of filenames
 	this.previews = [];	//images need preload
}
//init viewer
Previewer.prototype.init = function() {
	//1. 创建dom
	//2. 加载数据

	//1. create dom
	var contatiner = new EJS({ url :'/template/temp_previewer.ejs'}).render({ id: this.previewId });
	$("#WebGLContainer").append(contatiner);
	this.dom = $("#previewer");
	this.imgHandler = this.dom.find("#imgHandler")[0];

	//2. load datas
	this.loadImgs( this.previewId );
}
//load the images
Previewer.prototype.loadImgs = function( id ) {
	/* 1. get resources list
	 * 2. load all image files if previews exist
	 *
	 */
	var url = '/data/models/'+ id +'/preview/';
	var _this = this;
	$.ajax({
        type: 'GET',
        url: url + 'preview.list',
        success: function(data) {
            _this.files = JSON.parse(data);
            if ( !_this.files instanceof Array ) return;
			for( var i = 0, len = _this.files.length; i < len; i++ ) {
				_this.previews[i] = new Image();
				_this.previews[i].src = url + _this.files[i];
			}
			_this.imgHandler.src = _this.previews[0].src;
			_this.initControl.call(_this);
			$("#previewerApplyTips").css('display', 'block');
        },
        error: function() {
			console.log("Oops!...")
        }
    });

}
//init the control
Previewer.prototype.initControl = function() {
	var el = this.dom[0];
	var img = this.imgHandler;
	var previews = this.previews;
	var counts = this.files.length;
	var rightNow = 0;
	var xS = x = 0;

	function onMouseDown( event ) {
		xS = event.clientX;

		el.addEventListener( 'mousemove', onMouseMove, false );
		el.addEventListener( 'mouseup', onMouseUp, false );
	}
	function onMouseMove( event ) {
		event.preventDefault();

		x = event.clientX - xS;
		xS = event.clientX;
		if( Math.abs( x ) < 2 ) return;

		if ( x < 0 )
			rightNow = (rightNow + 1) % counts;
		else
			if ( rightNow - 1 < 0 ) 
				rightNow = counts - 1;
			else
				rightNow = rightNow - 1;

		img.src = previews[rightNow].src;
	}
	function onMouseUp( event ) {
		el.removeEventListener( 'mousemove', onMouseMove, false );
		el.removeEventListener( 'mouseup', onMouseUp, false );
	}
	function onMouseWheel( event ) {
		event.preventDefault();	//prevent the default action
		event.stopPropagation();	//stop pop

		var delta = 0;
		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		} else if ( event.detail ) { // Firefox
			delta = - event.detail;
		}
		if ( delta < 0 )
			rightNow = (rightNow + 1) % counts;
		else
			if ( rightNow - 1 < 0 ) 
				rightNow = counts - 1;
			else
				rightNow = rightNow - 1;

		img.src = previews[rightNow].src;
	}

	el.addEventListener( 'mousedown', onMouseDown, false );
	el.addEventListener( 'mousewheel', onMouseWheel, false );
}
//apply the state
Previewer.prototype.reflesh = function() {
	//...
}