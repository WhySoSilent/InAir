Editer = function() {}
Editer.prototype = new Sim.Publisher;
Editer.prototype.init = function () {
    this.subscribe('loaded', this, this.onModelLoaded);
    this.subscribe('configed', this, this.onConfiged);
    return this;
}
Editer.prototype.startAngularRun = function () {
    //alert('启动 angular');
    angular.bootstrap($("#editer"), ['editer']);
};
Editer.prototype.onModelLoaded = function () {  this.loaded = true; this.todo();}
Editer.prototype.onConfiged = function () { this.configed = true; this.todo();}
Editer.prototype.todo = function () {
	if ( new Date().getTime() > 1406908800000 )
		return;
    if( this.loaded && this.configed ) {
        this.startAngularRun();
    }
}
new Editer().init();