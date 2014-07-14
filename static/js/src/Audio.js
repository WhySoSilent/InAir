Audio = function() {
	this.audio = null;
	this.playing = false;
}
Audio.prototype.init = function() {
	this.audio = document.createElement('audio');
	this.audio.src = '/data/models/' + Plane.modelId + '/audio/audio.mp3';
	this.audio.play();
	this.playing = true;

	return this;
}
Audio.prototype.play = function() {
	if( !this.playing ) {
		this.audio.play();
		this.playing = true;
	}
}
Audio.prototype.stop = function() {
	if( this.playing ) {
		this.audio.pause();
		this.playing = false;
	}
}
Audio.prototype.toggle = function () {
	//切换播放和暂停状态
}