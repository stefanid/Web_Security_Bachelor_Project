// Wait for the DOM to be ready
$(function() {
    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("#frmLogin").validate({
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            userName: "required",
            password: {
                required: true,
                //minlength: 8
            }
        },
        // Specify validation error messages
        messages: {
            userName: "Please enter your user name",
            password: {
                required: "Please provide a password",
                //minlength: "Your password must be at least 8 characters long"
            }
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {

        }
    });
});

$("#btnLogin").click(function () {
    var form = $("#frmLogin");
    if(form.valid()){
        var oFrmUser = form.serialize();
        $.post( '/user/login' , oFrmUser , function( data ){
        }).done(function(data) {
            // TO DO ON DONE
           
            
            localStorage.setItem("cookie", data);
            window.location.replace("/profile");  
                             
        }).fail(function(data, textStatus, xhr) {
            //This shows status code eg. 403
            //console.log("error", data.status);
            //This shows status message eg. Forbidden
            //console.log("STATUS: "+xhr);
            console.log(data);
            var response = JSON.parse(data.responseText);
            if(response.response === "Your account is not activated!\r\nPlease check your email and activate it!"){
                var url = "/resend-activataion-token";
                var sActivationLink = 'Or click on the link below to re-send an activation link: <a href="' + url +'" >Resend activation link</a>'
                var serverResponse = response.response + sActivationLink
                $('#login-err-msg').append(serverResponse);
            } else {
                $('#login-err-msg').text(response.response);
            }
           
        }).always(function() {
            //TO-DO after fail/done request.
            //console.log("ended");
        });
    }
});
