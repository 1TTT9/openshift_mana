var user = null, pass = null;


var a = "";

window.onload = function() {

    $('#login-form').hide();

    $('#popup').dialog( {
	dialogClass: "no-class",
	width: 380,
	modal: true,
	autoOpen: true,
	buttons: {
	    'Oaky': function() {
		user = $('#popup .user').val();
		pass  = $('#popup .pass').val();
		$('#login-form .user').val(user);
		$('#login-form .pass').val(pass);
		$(this).dialog('close');		
	    },
	    'Default': function() {
		user = 'anonymous';
		pass = '1234';
		$('#login-form .user').val(user);
		$('#login-form .pass').val(pass);
		$('#login-form').submit();
		$(this).dialog('close');
		//$('#login-form').show();
	    }
	}
    } );

    /*
    if ( $('#aaaa') ) {
	setTimeout( function(){
	    window.location.href = a;
	}, 5000);
    }
    */
}
