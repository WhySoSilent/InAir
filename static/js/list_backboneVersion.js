function changeActiveStats(witch) {
    $("#listGroup .list-group-item").removeClass("active");
    $("#listGroup a[href=" + witch +"]").addClass("active");
}
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
var listCollection = function() {
    // var myModels = Backbone.Collection.extend({
    //     model: Scene,
    //     url: "/api/models?list=my"
    // });
    this.recent = new (Backbone.Collection.extend({
                        model: Scene,
                        url: "/api/models?list=recent"
                    }))();
    this.mostfav = new (Backbone.Collection.extend({
                        model: Scene,
                        url: "/api/models?list=mostfav"
                    }))();
    this.mostview = new (Backbone.Collection.extend({
                        model: Scene,
                        url: "/api/models?list=mostview"
                    }))();
    this.my = new (Backbone.Collection.extend({
                        model: Scene,
                        url: "/api/models?list=my"
                    }))();
}
listCollection.prototype.render = function( whitch) {
    //render and insert
    //1. check date stats
    //2. if not , fetch() first and insert loading card
    //3. if fetch() success, render data and insert to DOM
    //4. if fetch() failed, notice this !
    var list = this[whitch];
    if(list.length == 0 ) {
        //$("#anchor_modelCard").html(_.template($("#temp_loadingCard").html(), {}));
        //new EJS({url: 'comments.ejs'}).update('element_id', '/comments.json')
        $("#anchor_modelCard").html(new EJS({url: '/template/temp_loadingCard.ejs'}).render({}));
        list.fetch({
            success: function() {
                $("#anchor_modelCard").html(
                    new EJS({url: '/template/temp_modelCard.ejs'})
                        .render({listArr: list.toJSON()})
                );
            },
            error: function() {
                //notice failed info
            }
        });
        return;
    }
    $("#anchor_modelCard").html(
        new EJS({url: '/template/temp_modelCard.ejs'})
            .render({listArr: list.toJSON()})
    );
}
listCollection.prototype.more = function() {
    //get more data of current list
}

var listRenders = new listCollection();

//rooter
//路由适合拿来做子面板的控制，具体的逻辑还是放在视图里面把
//即涉及到会修改Model数据的事件不适合在路由中操作
var AppRouter = Backbone.Router.extend({  
    routes : {  
        '' : 'recentSceneList',
        'recent' : 'recentSceneList',  
        'mostview' : 'mostviewSceneList',
        'mostfav': 'mostLikeSceneList',
        'my': 'mySceneList'
    },
    mostviewSceneList : function() {
        //1. change active states
        //2. render collection
        changeActiveStats("#mostview");
        listRenders.render("mostview");
    },
    recentSceneList : function() {
        changeActiveStats("#recent");
        listRenders.render("recent");

    },
    mostLikeSceneList: function() {
        changeActiveStats("#mostfav");
        listRenders.render("mostfav");
    },
    mySceneList: function() {
        changeActiveStats("#my");
        listRenders.render("my");
    }
});

var router = new AppRouter();
Backbone.history.start();