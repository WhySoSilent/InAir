FeatureViewer = function( container ,userCamera) {
	this.showIndex = 0;
	this.defFrequency = 3000;
	this.userCamera = userCamera;
	this.featurePanel = $('#featureLeaver');
	this.featureMaodian = $('#featureLeaver .features');
	this.template = new EJS({ url :'/template/temp_featureView.ejs'});
	this.timer = null;

	//container这个引用  和将来resize的问题
	this.camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 0.1, 100000 );;
	this.camera.name = 'FeatureCamera';

	// this.features = [
	// 	{ title: '更强的大脑', des: '新的产品拥有最新最快的大脑'},
	// 	{ title: '更快的速度', des: '速度比上一代提高了两倍之多'},
	// 	{ title: '更便宜', des: '仅为上一代产品的一半'}
	// ];
	// this.focus = [
	// 	{position: [100,100,100], lookAt: [0,0,0]},
	// 	{position: [-0.97,-1.59,-9.8], lookAt: [0,0,0]},
	// 	{position: [100,100,100], lookAt: [0,0,0]}
	// ];

	if( Plane.confFeature )
		this.config();
	else
		this.subscribe('confLoaded', this, this.config );
}
FeatureViewer.prototype = new Sim.Publisher;
//合适的时间到了，创建URL监听
FeatureViewer.prototype.ready = function() {
	var that = this;
	var FeatureRouter = Backbone.Router.extend({  
	    routes : { 'feature/:id' : 'focusFeatureOf' },
	    focusFeatureOf : function(id) {
	    	that.focusThe(id);	//... todo 这个写法有没负担
	    }
	});

	this.router = new FeatureRouter();
	Backbone.history.start();
};
FeatureViewer.prototype.focusThe = function( featureId ) {
	var activeNow = Plane.modelViewer.camera;
	//检查feature相机激活情况
	if( this.camera !== activeNow ) {
		this.camera.position.copy(activeNow.position);
		Plane.modelViewer.camera = this.camera;
		//console.log('替换了feature相机');
		//重置计时器
	}
	if( !this.playing ) {
		//说明是URL直接定位到这个特性的
		this.featurePanel.addClass('display');
	}
	//1. 移动 feature 相机
	var cam = this.focus[featureId];
	new TWEEN.Tween( this.camera.position )
    .to({
        x : cam.position[0],
        y : cam.position[1],
        z : cam.position[2]
    	}, 700)
    .easing( TWEEN.Easing.Sinusoidal.Out )
    .start();
    //2. 显示文本
   	this.featureMaodian.html( this.template.render(this.features[featureId]) );
   	//3. 设置状态
   	this.showIndex = featureId;
}
//轮播
FeatureViewer.prototype.play = function() {
	if( this.playing )
		return;
	var _this = this;
	this.timer = setInterval( function(){ _this.next.call(_this); } , this.defFrequency);
	this.playing = true;
}
//结束轮播
FeatureViewer.prototype.stop = function() {
	if( this.playing )
		clearInterval(this.timer);
	this.playing = false;
}
FeatureViewer.prototype.pre = function() {
	this.showIndex = (this.showIndex + this.features.length -1 ) % this.features.length;
	this.router.navigate('feature/' + this.showIndex, true);
}
FeatureViewer.prototype.next = function() {
	this.showIndex = (this.showIndex + 1) % this.features.length;
	this.router.navigate('feature/' + this.showIndex, true);
}
//由于手动操作等需要延迟计时器的情形
FeatureViewer.prototype.reTimeout = function() {
	clearInterval(this.timer);
	var _this = this;
	this.timer = setInterval( function(){ _this.next.call(_this); } , this.defFrequency * 2);
}

//切换轮播的 播放/暂停
FeatureViewer.prototype.toggle = function() {
	if( this.playing ) {
		this.stop();
		this.featurePanel.removeClass('display');
	} else {
		this.play();
		this.featurePanel.addClass('display');
	}
}
//离开特性介绍功能
FeatureViewer.prototype.exit = function() {
	this.stop();
	this.router.navigate('', true);
}

FeatureViewer.prototype.config = function() {
	if( Plane.confFeature.length === 0 ) return;

	
	this.features = Plane.confFeature.features;
	this.focus = Plane.confFeature.focus;

	this.ready();
}