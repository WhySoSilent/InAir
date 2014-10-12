$(function() {
    $.ajax({
        url: '/scene/' + Plane.modelId,
        type: 'GET',
        success: function(result) {
            if( resule.err ) { alert('ERROR: ' + result ); }
            console.log('get metadata: ' + result );
            $('body').append(_.template($("#temp_metadata").html(), result));
        }
    });
    //...test
    $('body').append(_.template($("#temp_metadata").html(), {
        name: 'Model Name',
        des: 'Describe this model here...'
    }));

    //shader
    $("#shader").click(function() {
        if( Plane.scenePanel ) {
            $("#shaderPanel").toggleClass('show');
        }
    });
});