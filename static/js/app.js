var list_url = '/api/scenes';	//获取集合内容的服务器地址
var list_box = '#anchor_modelCard';				//容纳元素插入的盒子
var view_tagName = 'li';		//视图渲染元素的包装
var view_temp = '#temp_ModelCard';			//视图渲染所用模板的id
var topBox = '#app';				//顶层容器

$(function() {
//---------------------------- Model --------------------------
var Scene = Backbone.Model.extend({
	defaults: {
		id: '000',
		name: 'Model Name',
		des: 'Describe the Model',
		prvUrl: '_id.png'
	}
});

//---------------------------- Collection --------------------------
var SceneList = Backbone.Collection.extend({
	model: Scene,
	url: list_url
	//localStorage: new Backbone.LocalStorage("Scenes")
});

var recentModels = new SceneList;
var mostfavModels = new SceneList;
var mostviewModels = new SceneList;
var myModels = new SceneList;

//----------------------------- Controller -------------------------
var SceneView = Backbone.View.extend({
	tagName: view_tagName,
	template: $(view_temp).html(),
	initialize: function() {
		//绑定事件
		this.listenTo(this.model,"change",this.render);
		this.listenTo(this.model,"destroy",this.remove);
		//Dom缓存
	},
	events: {

	},
	render: function() {
		var output = _.template(this.template,this.model.toJSON());
		this.$el.html(output);
		//这里重新缓存用到的锚点...
		return this;
	}
});

var AppView = Backbone.View.extend({
	el: $(topBox),
	initialize: function() {
		this.listenTo(codes,"add",this.addOne);
		this.listenTo(codes,"reset",this.addAll);
		this.listenTo(codes,"all",this.render);

		this.viewBox = this.$("#sectionList");
		this.titleBox = this.$("#titleList");
		this.newOneTitle = this.$("#newOneTitle");
		this.newOneDesc = this.$("#newOneDesc");
		this.newOneCode = this.$("#newOneCode");

		codes.fetch();
	},
	events: {
		"click #createNew":"createNewOne"
	},
	addOne: function(code) {
		var view = new CodeSectionView({model: code});
		this.viewBox.append(view.render().el);

		var titleView = new TitleView({model: code});
		this.titleBox.append(titleView.render().el);
	},
	addAll: function() {
		codes.each(function(code){
			this.addOne(code);
		});
	},
	render: function() {
		//prettyPrint();	//染色
	},
	createNewOne: function() {
		var title = this.newOneTitle.val();
		var describe = this.newOneDesc.val();
		var code = this.newOneCode.val();

		codes.create({title:title,describe:describe,code:{content:code}});
	}
});

var App = new AppView;
});