/*
 *  2014/3/14
 *  提交状态控制器 Angular实现将更佳
 */
UpdateStatus = function() {
    //this.el = $("#updateStatus");
    this.cbTimer = null;
    this.el = $("title");
    this.title = this.el.html();
}
UpdateStatus.prototype.confUpdateStart = function() {
    this.clearCbTimer();
    this.el.html("正在提交更改...");
}
UpdateStatus.prototype.confUpdateSucess = function() {
    this.clearCbTimer();
    this.el.html("已经保存...");
    this.setClear();

}
UpdateStatus.prototype.confUpdateError = function() {
    this.clearCbTimer();
    this.el.html("配置提交出错了！稍后将重试...");
}
UpdateStatus.prototype.setClear = function( interval ) {
    // 设置自动清除
    //1. 设定一个间隔后执行clear回调
    var _this = this;
    this.cbTimer = setTimeout( function(){ _this.clear.call(_this); } , interval || 2000 );
}
UpdateStatus.prototype.clear = function() {
    // this.el.html("");
    this.el.html(this.title);
}
UpdateStatus.prototype.clearCbTimer = function () {
    // 清除已有的计时回调
    if( this.cbTimer !== null ) {
        clearTimeout( this.cbTimer);
        this.cbTimer = null;
    }
}