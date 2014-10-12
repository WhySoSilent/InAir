//------------------------------------------------------ MVC
// var Material = Backbone.Model.extend({
//     defaults: {
//     }
// });

var MaterialView = Backbone.View.extend({
    tagName: 'div',
    template: new EJS({ url : '/template/temp_materialProperty.ejs'}),
    initialize: function() {
        //绑定事件
        // this.listenTo(this.model,"change",this.render);
        // this.listenTo(this.model,"destroy",this.remove);
        //Dom缓存
        this.material = Plane.materials[this.model.index];
        this.configObj = Plane.config;
        this.conf = this.configObj.conf.material[this.model.index] !== undefined ?
                    this.configObj.conf.material[this.model.index] : {};
        this.configObj.conf.material[this.model.index] = this.conf; 
    },
    events: {
        "click .name" : "thisMaterial",
        "change .Mshading" : "changeShade",
        "change .Mcolor": "changeColor",
        "change .MenableOpacity": "changeOpacityEnable",
        "change .Mopacity": "changeOpacity",
        "change .Mambient" : "changeAmbient",
        "change .Mreflectivity" : "changeReflectivity",
        "change .Mshininess" : "changeShininess",
        "change .MenableVisible" : "changeVisibleEnable",


        "change .MenableMap" : "changeMapEnable",
        "change .MenableBump" : "changeBumpEnable",
        "change .MenableNormal" : "changeNormallEnable",
        "change .MenableSpecular" : "changeSpecularEnable",
        "change .MenableEnv" : "changeEnvEnable"
        
    },
    render: function() {
        //console.log('检查一下输出的模型对象');
        //console.log(JSON.stringify(this.model));
        var output = this.template.render( this.model );
        this.$el.html(output);
        //这里重新缓存用到的锚点...
        return this;
    },
    thisMaterial: function() {
        var target = this.material.color;
        var tr = 1, tg = 0, tb = 0;
        new TWEEN.Tween(target).to( {r: tr, g: tg, b: tb}, 600).start();
    },
    changeShade: function() {
        var va = this.$el.find('.Mshading').val();
        //...更改材质类型
        var newMaterial;
        if( va === 'basic' ) {
            newMaterial = new THREE.MeshBasicMaterial();
        }
        if( va === 'phong' ) {
            newMaterial = new THREE.MeshPhongMaterial();
        }
        if( va === 'lambert' ) {
            newMaterial = new THREE.MeshLambertMaterial();
        }
        //...更新对象的type属性，从而使模板重新渲染

        this.material = newMaterial.copy( this.material );
        alert('替换了');
        //更新到Cong
        this.configObj.edit( {shading: va }, this.conf);

            
     },
    changeColor: function() {
        var va = this.$el.find('.Mcolor').val();
        this.material.color.setStyle(va);
        //...调用频次会不会太高
        this.configObj.edit( { colorDiffuse : Hps.style2array(va) }, this.conf);
    },
    changeOpacityEnable: function() {
        var en = this.$el.find('.MenableOpacity')[0].checked;
        this.material.transparent = en;
        //...这个属性的问题!!!     false能不能置入
        this.configObj.edit( { transparent : en }, this.conf);
        //console.log("transparent TO: " + en + ' | '+ this.material.transparent);
    },
    changeOpacity: function() {
        var va = this.$el.find('.Mopacity').val();
        this.material.opacity = va;
        //...调用频次会不会太高
        this.configObj.edit( { transparency : (1 - va) }, this.conf);
    },
    changeAmbient: function() {
        var va = this.$el.find('.Mambient').val();
        this.material.ambient.setStyle(va);
        this.material.needsUpdate = true;
        this.configObj.edit( { colorAmbient : Hps.style2array(va) }, this.conf);
    },
    changeReflectivity: function() {
        var va = this.$el.find('.Mreflectivity').val();
        this.material.reflectivity = va;
        //...调用频次会不会太高      reflectivity 属性情况本身不熟悉
        this.configObj.edit( { reflectivity : Number(va) }, this.conf);
        //console.log("change reflectivity TO: " + va + " | " +　this.material.reflectivity);
    },
    changeShininess: function() {
        var va = this.$el.find('.Mshininess').val();
        this.material.shininess = va;
        //...调用频次会不会太高
        this.configObj.edit( { specularCoef : Number(va) }, this.conf);
        //console.log("change shininess TO: " + va + " | " +　this.material.shininess);
    },
    changeVisibleEnable: function() {
        var en = this.$el.find('.MenableVisible')[0].checked;
        this.material.visible = en;
        //...false能不能置入
        this.configObj.edit( { visible : en }, this.conf);
        //console.log("visible TO: " + en);
    },
    changeMapEnable: function() {
        var en = this.$el.find('.MenableMap')[0].checked;
        if( en === false && this.map === undefined ) {  //...用 undefined 判断没问题吧
            this.map = this.material.map;
        }
        this.material.map = en === false ? null : this.map;    //可以再把贴图改回来么?
        this.material.needsUpdate = true;
        //...false能不能置入
        this.configObj.edit( { enableMap : en }, this.conf);
        //console.log("enableMap TO: " + en);
    },
    changeBumpEnable: function() {
        var en = this.$el.find('.MenableBump')[0].checked;
        if( en === false && this.bumpMap === undefined ) {
            this.bumpMap = this.material.bumpMap;
        }
        this.material.bumpMap = en === false ? null : this.bumpMap;
        this.material.needsUpdate = true;
        //...false能不能置入
        this.configObj.edit( { enableBump : en }, this.conf);
        //console.log("enableBump TO: " + en);
    },
    changeNormallEnable: function() {
        var en = this.$el.find('.MenableNormal')[0].checked;
        if( en === false && this.normalMap === undefined ) {
            this.normalMap = this.material.normalMap;
        }
        this.material.normalMap = en === false ? null : this.normalMap;
        this.material.needsUpdate = true;
        //...false能不能置入
        this.configObj.edit( { enableNormal : en }, this.conf);
        //console.log("enableNormal TO: " + en);
    },
    changeSpecularEnable: function() {
        var en = this.$el.find('.MenableSpecular')[0].checked;
        if( en === false && this.specularMap === undefined ) {
            this.specularMap = this.material.specularMap;
        }
        this.material.specularMap = en === false ? null : this.specularMap;
        this.material.needsUpdate = true;
        //...false能不能置入
        this.configObj.edit( { enableSpecular : en }, this.conf);
        //console.log("enableSpecular TO: " + en);
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
        //...false能不能置入
        this.configObj.edit( { enableEnv : en }, this.conf);
        //console.log("enableEnv TO: " + en);
    }
});

// var Materials = Backbone.Collection.extend({
//     model: Material,
//     //localStorage: new Backbone.LocalStorage("Materials")
// });

// 2014/3/13
// -----------------------------------------------------
// var Light = Backbone.Model.extend({});
var LightView = Backbone.View.extend({
    tagName: 'div',
    template: new EJS({ url: '/template/temp_lightProperty.ejs'}),
    initialize: function() {
        //绑定事件
        // this.listenTo(this.model,"change",this.render);
        // this.listenTo(this.model,"destroy",this.remove);
        //Dom缓存
        this.light = Plane.lights[this.model.index];
        this.configObj = Plane.config;
        this.conf = this.configObj.conf.light[this.model.index] !== undefined ?
                    this.configObj.conf.light[this.model.index] : {};
        this.configObj.conf.light[this.model.index] = this.conf;
    },
    events: {
        "change .Ltype" : "changeType",
        "change .Lcolor" : "changeColor",
        "change .Lintensity" : "changeIntensity",
        "change .Ldistance" : "changeDistance",
        "change .Lpositionx" : "changePositionx",
        "change .Lpositiony" : "changePositiony",
        "change .Lpositionz" : "changePositionz"
        //...删除很难处理啊
    },
    render: function() {
        var output = this.template.render( this.model );
        this.$el.html(output);
        //这里重新缓存用到的锚点...
        return this;
    },
    changeType : function() {
        var va = this.$el.find('Ltype').val();
        var newLight;
        if ( va === 'AmbientLight' ) {
            newLight = new THREE.AmbientLight();
        }
        if ( va === 'PointLight' ) {
            newLight = new THREE.PointLight();
        }
        if ( va === 'DirectionalLight' ) {
            newLight = new THREE.DirectionalLight();
        }
        //...copy未实现
        //this.light = newLight.copy( this.light );
        //...简单的修改这一个值也不对，应该有剔除多余值的办法才行
        //this.configObj.edit( { type : va }, this.conf );
    },
    changeColor : function() {
        var va = this.$el.find('.Lcolor').val();
        this.light.color.setStyle(va);
        //...调用频次会不会太高
        this.configObj.edit( { color : Hps.style2hex(va) }, this.conf);
    },
    changeIntensity : function() {
        //...这个值的输入未作限制还    值本身的情况不是很清楚
        var va = this.$el.find('.Lintensity').val();
        this.light.intensity = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { intensity : Number(va) }, this.conf);
    },
    changeDistance : function() {
        //...这个值的输入未作限制还    值本身的情况不是很清楚
        var va = this.$el.find('.Ldistance').val();
        this.light.distance = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { distance : Number(va) }, this.conf);
    },
    changePositionx : function() {
        //...这个值的输入未作限制还
        var va = this.$el.find('.Lpositionx').val();
        this.light.position.x = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { position : [Number(va),,] }, this.conf);
    },
    changePositiony : function() {
        //...这个值的输入未作限制还
        var va = this.$el.find('.Lpositiony').val();
        this.light.position.y = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { position : [,Number(va),] }, this.conf);
    },
    changePositionz : function() {
        //...这个值的输入未作限制还
        var va = this.$el.find('.Lpositionz').val();
        this.light.position.z = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { position : [,,Number(va)] }, this.conf);
    }
});
// 2014/3/13
// -----------------------------------------------------
// var Scene = Backbone.Model.extend({});
var SceneView = Backbone.View.extend({
    tagName: 'div',
    template: new EJS({ url: '/template/temp_sceneProperty.ejs'}),
    initialize: function() {
        //绑定事件
        // this.listenTo(this.model,"change",this.render);
        // this.listenTo(this.model,"destroy",this.remove);
        //Dom缓存
        this.control = Plane.modelViewer.control;
        this.camera = Plane.modelViewer.camera;
        this.configObj = Plane.config;
        this.conf = this.configObj.conf.control !== undefined ?
                    this.configObj.conf.control : {};   //...这里其实不需要检查
        //this.configObj.conf.control = this.conf;      //...这句也多余

        var _this = this;
        function camPosition() {
            var x =  _this.camera.position.x;
            var y =  _this.camera.position.y;
            var z =  _this.camera.position.z;
            console.log( "===[ "+ x +"  "+ y +"  "+ z +" ]");
        }
        //setInterval(camPosition, 500);
    },
    events: {
        "change .Ctype" : "changeType",
        "change .Czoom" : "changeZoomEnable",
        "change .Cpan" : "changePanEnable",
        "change .CmaxDistance" : "changeMaxDistance",
        "change .CminDistance" : "changeMinDistance",
        "change .Cpositionx" : "changePosition",
        "change .Cpositiony" : "changePosition",
        "change .Cpositionz" : "changePosition"
    },
    render: function() {
        var output = this.template.render( this.model );
        this.$el.html(output);
        //这里重新缓存用到的锚点...
        return this;
    },
    changeType : function() {
        var va = this.$el.find('Ctype').val();
        var newControl;
        if ( va === 'TrackballControls' ) {
            newControl = new THREE.TrackballControls();
        }
        if ( va === 'OrbitControls' ) {
            newControl = new THREE.OrbitControls();
        }
        //...copy未实现
        //this.control = newControl.copy( this.control );
        //...简单的修改这一个值也不对，应该有剔除多余值的办法才行
        //this.configObj.edit( { type : va }, this.conf );
    },
    changeZoomEnable : function() {
        var en = this.$el.find('.Czoom')[0].checked;
        this.control.noZoom = !en;
        this.configObj.edit( { zoom : en }, this.conf);
    },
    changePanEnable : function() {
        var en = this.$el.find('.Cpan')[0].checked;
        this.control.noPan = !en;
        this.configObj.edit( { pan : en }, this.conf);
    },
    changeMaxDistance : function() {
        var va = this.$el.find('.CmaxDistance').val();
        var minDistance = this.$el.find('.CminDistance').val();
        if( Number(va) <= Number(minDistance) ) {
            this.$el.find('.CmaxDistance').val(minDistance);
            this.control.maxDistance = Number(minDistance);
            alert("最远距离 " + va + " 不能小于 最近距离 " + minDistance + " ！");
            return;
        }
        this.control.maxDistance = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { maxDistance : Number(va) }, this.conf);
    },
    changeMinDistance : function() {
        var va = this.$el.find('.CminDistance').val();
        var maxDistance = this.$el.find('.CmaxDistance').val();
        if( Number(va) >= Number(maxDistance) ) {
            this.$el.find('.CminDistance').val(maxDistance);
            this.control.minDistance = Number(maxDistance);
            alert("最近距离 " + va + " 不能大于 最远距离 " + maxDistance + " ！");
            return;
        }
        this.control.minDistance = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { minDistance : Number(va) }, this.conf);
    },
    changePositionx : function() {
        //...这个值的输入未作限制还
        var va = this.$el.find('.Cpositionx').val();
        this.camera.position.x = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { position : [Number(va),,] }, this.conf);
    },
    changePositiony : function() {
        //...这个值的输入未作限制还
        var va = this.$el.find('.Cpositiony').val();
        this.camera.position.y = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { position : [,Number(va),] }, this.conf);
    },
    changePositionz : function() {
        //...这个值的输入未作限制还
        var va = this.$el.find('.Cpositionz').val();
        this.camera.position.z = Number(va);
        //...调用频次会不会太高
        this.configObj.edit( { position : [,,Number(va)] }, this.conf);
    },
    changePosition : function() {
        //...这个值的输入未作限制还
        var x = this.$el.find('.Cpositionx').val();
        var y = this.$el.find('.Cpositiony').val();
        var z = this.$el.find('.Cpositionz').val();
        this.camera.position.x = Number(x);
        this.camera.position.y = Number(y);
        this.camera.position.z = Number(z);
        //...调用频次会不会太高
        this.configObj.edit( { position : [Number(x),Number(y),Number(z)] }, this.conf);
    }
});

var topBox = 'body';
var ShaderView = Backbone.View.extend({
    el: $(topBox),
    template: new EJS({ url : '/template/temp_shaderPanel.ejs'}),
    initialize: function() {
        //先插入panel
        this.render();

        this.matViewBox = this.$("#listOfMaterials");
        this.lightViewBox = this.$("#listOfLights");
        this.sceneViewBox = this.$("#anchorOfScene");

        this.addAllMaterialView();
        this.addAllLightView();
        this.addControlView();

        //绑定 切换editer标签页 事件      //...低效的实现
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
    addOneMaterialView: function( mat ) {
        var view = new MaterialView({model: mat});
        this.matViewBox.append(view.render().el);
    },
    addAllMaterialView: function() {
        var that = this;
        Plane.editer.parsedData.forEach(function( mat ) {
            that.addOneMaterialView( mat );
        });
    },
    addOneLightView: function( light ) {
        var view = new LightView({model: light});
        this.lightViewBox.append(view.render().el);
    },
    addAllLightView: function() {
         var that = this;
         Plane.editer.parsedLightData.forEach(function( light ) {
            that.addOneLightView( light );
         });
    },
    addControlView : function() {
        var view = new SceneView({model: Plane.editer.parsedContrData});
        this.sceneViewBox.append(view.render().el);
    },
    render: function() {
        $('body').append( this.template.render({}));
    }
});


//======================================================
/*
 *  材质编辑器
 *  2014/03/02
 */
Editer = function() {
    this.parsedData = null;

    this.shaderView = null; //shader编辑面板的 Backbone 视图

    this.loaded = false;
    this.configed = false;
}
Editer.prototype = new Sim.Publisher;
Editer.prototype.init = function () {
    this.subscribe('loaded', this, this.onModelLoaded);
    this.subscribe('configed', this, this.onConfiged);
    //this.subscribe('loaded', this, this.createShaderPanel);
    return this;
}
Editer.prototype.createShaderPanel = function () {
    this.parseScene();
    this.shaderView = new ShaderView;
    //this.matViews = new 
};
Editer.prototype.parseScene = function() {
    //1.
    this.parsedData = parseMaterial(Plane.materials);
    this.parsedLightData = parseLight(Plane.lights);
    this.parsedContrData = parseControl(Plane.modelViewer.control, Plane.modelViewer.camera );
    // console.log("parsedData -----------------------");
    // console.log(this.parsedData);

    
    function parseMap(m) {
        return m.map === null ? 'None' : m.map.image;
    }
    function parseMaterial(materials) {
        var parsedData = [];

        var len = materials.length;
        for(var i = 0; i < len; i++) {  //...检查这些判断值
            var mData = {};
            var m = materials[i];
            /** 索引 **/
            mData.index = i;
            //console.log('index-' +  i);   //导入的材质没有index??
            /** 材质名称 **/
            mData.name = m.name !== undefined && m.name != '' ? m.name : '材质 ' + i;
            //console.log('name-' +  m.name);
            /** 材质类型 **/
            mData.shading = Hps.mtype(m);
            //console.log('type-' +  Hps.mtype(m));
            /** 颜色值 **/
            mData.color = '#' + m.color.getHexString();
            //console.log('color-' +  m.color.getHexString());
            /** 透明度 **/
            mData.opacity = m.opacity;
            mData.transparent = m.transparent;
            //console.log('opacity- [' + m.transparent +']' +  m.opacity );
            /** 环境光 **/
            mData.ambient =  m.ambient !== undefined ? '#' + m.ambient.getHexString() : '#ffffff';  //...存在性验证都不做了
            /** 反射率 **/
            mData.reflectivity = m.reflectivity !== undefined ? m.reflectivity : 1 ,
            /** 反光度 **/
            mData.shininess = m.shininess !== undefined ? m.shininess : 30 ,
            /** 可见性 **/
            mData.visible = m.visible;

            //...根据材质类型解析数据

            /** 反射率 **/
            /** 纹理 **/
            mData.enableMap = m.map == null ? false : true;
            mData.map = m.map; //赋值???
            //console.log('map-' +  parseMap(m) );
            /** 凹凸Bump 贴图 **/
            mData.enableBump = m.bumpMap == null ? false : true;
            mData.bumpMap = m.bumpMap; //赋值???
            //console.log('bumpMap-' +  m.bumpMap );
            /** 法线Normal 贴图 **/
            mData.enableNormal = m.normalMap == null ? false : true;
            mData.normalMap = m.normalMap; //赋值???
            //console.log('normalMap-' + m.normalMap);
            /** 高光|镜面反射 **/
            mData.enableSpecular = m.specularMap == null ? false : true;
            mData.specularMap = m.specularMap; //赋值???
            //console.log('lightMap-' +  m.specularMap );
            /** 环境反射 **/
            mData.enableEnv = m.envMap == null ? false : true;
            mData.envMap = m.envMap; //赋值???
            //console.log('envMap-' +  m.envMap );

            parsedData.push(mData);
        }
        return parsedData;
    }
    function parseLight(lights) {
        var parsedData = [];

        var len = lights.length;
        for(var i = 0; i < len; i++) {
            var lData = {};
            var l = lights[i];

            /** index **/
            lData.index = i;
            /** name **/
            lData.name = l.name !== undefined && l.name != '' ? l.name : '照明 ' + i;
            /** type **/
            lData.type = Hps.ltype(l);
            /** color **/
            lData.color = '#' + l.color.getHexString();
            /** intensity : if exsit **/
            if( l.intensity !== undefined )
                lData.intensity = l.intensity;
            /** distance : if exsit **/
            if( l.distance !== undefined )
                lData.distance = l.distance;
            /** position **/
            lData.position = l.position.toArray();

            parsedData.push(lData);
        }
        return parsedData;
    }
    function parseControl( control, camera ) {
        var cData = {};

        /** type **/
        cData.type = Hps.ctype(control);
        /** zoom **/
        cData.zoom = !control.noZoom;
        /** pan **/
        cData.pan = !control.noPan;
        /** maxDistance **/
        //... todo 存在性检查没做
        cData.maxDistance = control.maxDistance;
        /** minDistance **/
        //... todo 存在性检查没做
        cData.minDistance = control.minDistance;
        /** position **/
        cData.position = camera.position.toArray();
        /** up **/
        //... todo up
        return cData;
    }
}
Editer.prototype.onModelLoaded = function () {  this.loaded = true; this.todo();}
Editer.prototype.onConfiged = function () { this.configed = true; this.todo();}
Editer.prototype.todo = function () {
    if( this.loaded && this.configed ) {
        this.createShaderPanel();
    }
}

Plane.editer = new Editer().init();

/*
 *  2014/3/14
 *  提交状态控制器 Angular实现将更佳
 */
UpdateStatus = function() {
    this.el = $("#updateStatus");
    this.cbTimer = null;
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
    this.el.html("");
}
UpdateStatus.prototype.clearCbTimer = function () {
    // 清除已有的计时回调
    if( this.cbTimer !== null ) {
        clearTimeout( this.cbTimer);
        this.cbTimer = null;
    }
}

// -------------------------------------------------------------
$(function() {
    //shader
    $("#shader").click(function() {
        if( Plane.editer ) {
            $("#shaderPanel").toggleClass('show');
        }
    });
});