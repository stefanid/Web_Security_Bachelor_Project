var url = window.location.href;
var token = url.substring(url.lastIndexOf('/') + 1);
// Wait for the DOM to be ready
$(function() {
    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("#frmPasswordReset").validate({
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            password: {
                required: true,
                minlength: 8,
                mypassword: true
            }
        },
        // Specify validation error messages
        messages: {
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 8 characters long"
            }
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            // form.submit();
        }
    });
});
$.validator.addMethod('mypassword', function(value, element) {
        return this.optional(element) || (value.match(/[a-zA-Z]/) && value.match(/[0-9]/));
    },
    'Password must contain at least one numeric and one alphabetic character.');

$("#btnReset").click(function() {
    var form = $("#frmPasswordReset");
    if(form.valid()){
        var oFrmUser = form.serialize();
        $.post("/user/password-reset/" + token, oFrmUser, function(data){
        }).done(function(data){
            var sServerResponse = JSON.parse(data);
            $("#link-err-msg").text(sServerResponse.response);
            console.log(data);
        }).fail(function(data, textStatus, xhr){
            console.log(data);
            var sServerResponse = JSON.parse(data.responseText);
            $("#link-err-msg").text(sServerResponse.response);
        });
    }
});