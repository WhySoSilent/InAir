$(function() {
	$('#commentInput').focus(function() {
		$('#newComment').addClass('edit');
	});
	//切换匿名
	$('#anonymous').click(function(){
		var v = $(this).prop( "checked" );
		if( !v ) {
			//if( !confirm('取消匿名将会使您的邮件地址暴露，确定仍然要这么做？') ) {
			if( !confirm('Cancel anonymity will make your e-mail address is exposed, still determined to do so?') ) {
				$(this).prop("checked", true);
				return;
			}
		}
	});
	//获取所有评论
	$.ajax({
		url: '/api/models/' + Plane.modelId + '/comments',
		type: 'GET',
		//dataType: 'application/json',	//..这里需要验证！
		success : function(response) {
			insertNewComment( response );
		},
		error: function (xhr, statusText, err) {
	        //StatusCode=2xx或304时执行success, 其余则将触发error
	    }
	});
	//发表新的评论
	$("#publishNew").click(function() {
		//获取评论内容及mail
		var mail = $('#mail').val();
		var commentContent = $('#commentInput').val();
		var anonymous = $('#anonymous').is(':checked');

		if ( commentContent == '') {
			// alert('填写评论内容...');
			alert('Enter comment ...');
			return;
		}
		if ( mail == '' ) {	// todo check mail
			// alert('提供你的邮件地址来发表评论！');
			alert('Provide your e-mail address to comment!');
			return;
		}
		if ( !checkMail( mail ) ) {
			// alert('请提供正确的邮件地址');
			alert('Please provide the correct e-mail address');
			return;
		}
		$.ajax({
			url: '/api/models/' + Plane.modelId + '/comments/create',
			type: 'POST',
			// contentType : 'application/json',
			// data: {
			// 	mail: mail,
			// 	anonymous: anonymous,
			// 	content: commentContent,
			// },
			data: 'mail='+ mail +'&anonymous='+ anonymous +'&content=' + commentContent,
			statusCode : {
				201: function ( res, stausText, xhr ) {
					// CREATED 201
					/* res 返回的body内容
					 * stausText 成功的时候应该是success
					 * xhr 对象
					 */
					 insertNewComment(res);
					 clearInput();
				},
				400: function () {
					// BAD_REQUEST 400	发送到服务器的对象为空
				}
			},
			error: function (xhr, statusText, err) {
                //StatusCode=2xx或304时执行success, 其余则将触发error
                clearInput();
                //testResponse();
            }
		});
	});

	function insertNewComment( comment ) {
		if ( comment instanceof Array ) {
			for( var i = 0, len = comment.length; i < len; i++ ) {
				var html = new EJS({ url: '/template/temp_comment.ejs' }).render(comment[i]);
				$('#commentContainner').append(html);
			}
			updataCommentCount( comment.length );
		} else {
			var html = new EJS({ url: '/template/temp_comment.ejs' }).render(comment);
			$('#commentContainner').prepend(html);
			updataCommentCount();
		}
	}
	function clearInput() {
		$('#commentInput').val('');
		$('#anonymous').val('off');
		$('#newComment').removeClass('edit');
	}
	function checkMail( address ) {
		var myreg = /^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+.[a-zA-Z]{2,4}$/;
		return myreg.test( address );
	}
	function updataCommentCount( count ) {
		var countEl = $("#commentCount");
		var count = Number(countEl.attr('data-count')) + ( count === undefined ? 1 : count ) ;
		countEl.attr('data-count', count );
		countEl.html( count + ' Comments');
	}
	function testResponse() {
		var response = [{ id : 'QW23ER4', mail: 've.wang@me.com', content: '评论一个天使的缺点，用一朵花开的时间，你在我旁边，只打了个照面...', when: 43535454354, anonymous: true },
		{ id : 'QW23ER4', mail: 've.wang@me.com', content: '评论一个天使的缺点，用一朵花开的时间，你在我旁边，只打了个照面...', when: 43535454354, anonymous: false}];
		insertNewComment(response);
	}
	var avatars = ["barnowl.jpg","bat.jpg","bear.jpg","bisonbison.jpg","bull.jpg","capybara.jpg","cat.jpg","chameleon.jpg","cheetah.jpg","cow.jpg","deer2.jpg","desertwarthog.jpg","dolphin.jpg","duck.jpg","eagle.jpg","elephant.jpg","fennecfox.jpg","ferret.jpg","fox.jpg","frog.jpg","giraffe.jpg","gorilla.jpg","guineapig.jpg","hare.jpg","hippo.jpg","horse.jpg","hyena.jpg","kangaroo.jpg","koala.jpg","lemur1.jpg","lemur2.jpg","lion.jpg","liontamarin.jpg","llama.jpg","Macaca-Fuscata.jpg","macaque.jpg","macaw.jpg","meerkat.jpg","mink.jpg","monkey.jpg","ostrich.jpg","otter.jpg","owl.jpg","panda.jpg","panther.jpg","parakeet.jpg","penguin.jpg","pig.jpg","polarbear.jpg","pug.jpg","raccoon.jpg","redpanda.jpg","redsquirrel.jpg","rhino.jpg","sheep.jpg","skunk.jpg","sloth.jpg","slowloris.jpg","snail.jpg","tiger.jpg","walrus.jpg","wolf.jpg","zebra.jpg"];
});