Animation = function() {
	Sim.Object.call(this);
}
Animation.prototype = new Sim.Object();
Animation.prototype.init = function() {
	//初始化动画
	// KeyFrame Animations
	var animations, kfAnimationsLength, kfAnimations;

	var animHandler = THREE.AnimationHandler;

	for ( var i = 0; i < kfAnimationsLength; ++i ) {

		var animation = animations[ i ];
		animHandler.add( animation );

		var kfAnimation = new THREE.KeyFrameAnimation( animation.node, animation.name );
		kfAnimation.timeScale = 1;
		kfAnimations.push( kfAnimation );

	}
}
Animation.prototype.toggle = function(tag) {
	//触发某个标签的动画
}