//------------------------------------------------------
var Material = Backbone.Model.extend({
    defaults: {
    }
});

var MaterialView = Backbone.View.extend({
    tagName: 'div',
    template: $("#temp_materialProperty").html(),
    initialize: function() {
        //绑定事件
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"destroy",this.remove);
        //Dom缓存
        this.material = Plane.materials[this.model.get('index')];
    },
    events: {
        "click .name" : "thisMaterial",
        "change .Mshading" : "changeShade",
        "change .Mcolor": "changeColor",
        "change .MenableOpacity": "changeOpacityEnable",
        "change .Mopacity": "changeOpacity",
        "change .Mambient" : "changeAmbient",
        "change .Mreflectivity" : "changeReflectivity",
        "change .MenableVisible" : "changeVisibleEnable",


        "change .MenableMap" : "changeMapEnable",
        "change .MenableBump" : "changeBumpEnable",
        "change .MenableNormal" : "changeNormallEnable",
        "change .MenableSpecular" : "changeSpecularEnable",
        "change .MenableEnv" : "changeEnvEnable"
        
    },
    render: function() {
        var output = _.template(this.template,this.model.toJSON());
        this.$el.html(output);
        //这里重新缓存用到的锚点...
        return this;
    },
    thisMaterial: function() {
        var target = Plane.materials[this.model.get('index')].color;
        var tr = 1, tg = 0, tb = 0;
        new TWEEN.Tween(target).to( {r: tr, g: tg, b: tb}, 600).start();
    },
    changeShade: function() {
        var va = this.$el.find('.Mshading').val();
        //...更改材质类型
        var newMaterial;
        if( va === 'Basic' ) {
            newMaterial = new THREE.MeshBasicMaterial();
        }
        if( va === 'Phong' ) {
            newMaterial = new THREE.MeshPhongMaterial();
        }
        if( va === 'Lambert' ) {
            newMaterial = new THREE.MeshLambertMaterial();
        }
        //...更新对象的type属性，从而使模板重新渲染
        
        Plane.materials[this.model.get('index')] = 
            newMaterial.copy( Plane.materials[this.model.get('index')] );
            alert('替换了');
     },
    changeColor: function() {
        var va = this.$el.find('.Mcolor').val();
        this.material.color.setStyle(va);
    },
    changeOpacityEnable: function() {
        var en = this.$el.find('.MenableOpacity')[0].checked;
        this.material.transparent = en;
        console.log("transparent TO: " + en + ' | '+ this.material.transparent);
    },
    changeOpacity: function() {
        var va = this.$el.find('.Mopacity').val();
        this.material.opacity = va;
    },
    changeAmbient: function() {
        var va = this.$el.find('.Mambient').val();
        this.material.ambient.setStyle(va);
        this.material.needsUpdate = true;
    },
    changeReflectivity: function() {
        var va = this.$el.find('.Mreflectivity').val();
        this.material.reflectivity = va;
        console.log("change reflectivity TO: " + va + " | " +　this.material.reflectivity);
    },
    changeVisibleEnable: function() {
        var en = this.$el.find('.MenableVisible')[0].checked;
        this.material.visible = en;
        console.log("visible TO: " + en);
    },
    changeMapEnable: function() {
        var en = this.$el.find('.MenableMap')[0].checked;
        if( en === false && this.map === undefined ) {  //...用 undefined 判断没问题吧
            this.map = this.material.map;
            //... 这算是一个缓存吧，如果视图更新了会丢失么？
        }
        this.material.map = en === false ? null : this.map;    //可以再把贴图改回来么?
        this.material.needsUpdate = true;
        console.log("enableMap TO: " + en);
    },
    changeBumpEnable: function() {
        var en = this.$el.find('.MenableBump')[0].checked;
        if( en === false && this.bumpMap === undefined ) {
            this.bumpMap = this.material.bumpMap;
        }
        this.material.bumpMap = en === false ? null : this.bumpMap;
        this.material.needsUpdate = true;
        console.log("enableBump TO: " + en);
    },
    changeNormallEnable: function() {
        var en = this.$el.find('.MenableNormal')[0].checked;
        if( en === false && this.normalMap === undefined ) {
            this.normalMap = this.material.normalMap;
        }
        this.material.normalMap = en === false ? null : this.normalMap;
        this.material.needsUpdate = true;
        console.log("enableNormal TO: " + en);
    },
    changeSpecularEnable: function() {
        var en = this.$el.find('.MenableSpecular')[0].checked;
        if( en === false && this.specularMap === undefined ) {
            this.specularMap = this.material.specularMap;
        }
        this.material.specularMap = en === false ? null : this.specularMap;
        this.material.needsUpdate = true;
        console.log("enableSpecular TO: " + en);
    },
    changeEnvEnable: function() {
        var en = this.$el.find('.MenableEnv')[0].checked;
        if( en === false && this.envMap === undefined ) {
            this.envMap = this.material.envMap;
        }
        alert("envMap : " + this.envMap);
        var target = null;
        this.material.envMap = en === false ? null : this.envMap ? this.envMap : Plane.modelViewer.envBox;
        this.material.needsUpdate = true;
        console.log("enableEnv TO: " + en);
    }
});

var Materials = Backbone.Collection.extend({
    model: Material,
    //localStorage: new Backbone.LocalStorage("Materials")
});



var topBox = 'body';
var ShaderView = Backbone.View.extend({
    el: $(topBox),
    template: $("#temp_shaderPanel").html(),
    initialize: function() {
        //先插入panel
        this.render();

        this.listenTo(Plane.editer.mats,"add",this.addOne);
        this.listenTo(Plane.editer.mats,"reset",this.addAll);
        this.listenTo(Plane.editer.mats,"all",this.render);

        this.matViewBox = this.$("#listOfMaterials");
        //Plane.editer.mats.fetch();
        this.addAll();

        //绑定事件      //...低效的实现
        $("#shaderPanel ul#editNav li").click(function(e) {
            var targetDivId = "#" + $(this).attr("data-targetDiv");
            e.preventDefault();
            $("#shaderPanel ul#editNav li").removeClass('active');
            $(this).addClass('active');


            $("#shaderPanel div.aEdit").removeClass('show');
            $("#shaderPanel " + targetDivId).addClass('show');
        });
        $("#testDes").change(function() {
            var distance = $(this).val();
            console.log("des : "  + distance);

            Plane.lights[0].position.set(distance * 0.707, 10, distance * 0.707 );
            //Plane.lights[3].children[0].position.set(distance * 0.707, 10, distance * 0.707 );
            Plane.lights[1].position.set(-distance * 0.707, 10, -distance * 0.707 );
            //Plane.lights[3].children[1].position.set(-distance * 0.707, 10, -distance * 0.707 );
            Plane.lights[2].position.set(0, -distance * 0.707, 0);
            //Plane.lights[3].children[2].position.set(0, -distance * 0.707, 0);
        });
    },
    events: {
        
    },
    addOne: function(mat) {
        var view = new MaterialView({model: mat});
        this.matViewBox.append(view.render().el);
    },
    addAll: function() {
        var that = this;
        Plane.editer.mats.each(function(mat){
            that.addOne(mat);
        });
    },
    render: function() {
        $('body').append( _.template(this.template, {}));
    }
});

// -----------------------------------------------------
var Light = Backbone.Model.extend({});
var LightView = Backbone.View.extend({
    
});
// -----------------------------------------------------
$(function() {
    // $.ajax({
    //     url: '/api/model/' + Plane.modelId,
    //     type: 'GET',
    //     success: function(result) {
    //         if( result.err ) { alert('ERROR: ' + result ); }
    //         console.log('get metadata: ' + result );
    //         $('body').append(_.template($("#temp_metadata").html(), result));
    //     }
    // });
    //...test
    $('body').append(_.template($("#temp_metadata").html(), {
        name: 'Model Name',
        des: 'Describe this model here...'
    }));

    //shader
    $("#shader").click(function() {
        if( Plane.editer ) {
            $("#shaderPanel").toggleClass('show');
        }
    });
});