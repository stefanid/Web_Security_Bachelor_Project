// Wait for the DOM to be ready
$(function() {
    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("#frmEmailResentToken").validate({
        // Specify validation rules
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        // Specify validation error messages
        messages: {
            email: {
                required: "We need your email address to contact you",
                email: "Your email address must be in the format of name@domain.com"
            }
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            // form.submit();
        }
    });
});

$("#btnSendLink").click(function() {
    var form = $("#frmEmailResentToken");
    if(form.valid()){
        var oFrmUser = form.serialize();
        $.post("user/resend-activataion-token", oFrmUser, function(data){
        }).done(function(data){
            var sServerResponse = JSON.parse(data);
            $("#link-err-msg").text(sServerResponse.response);
            console.log(data);
           
        }).fail(function(data, textStatus, xhr){
            console.log(data);
            var sServerResponse = JSON.parse(data.responseText);
            $("#link-err-msg").text(sServerResponse.response);
        });
    } else {
        $("#link-err-msg").text("Form is invalid");
    }
});