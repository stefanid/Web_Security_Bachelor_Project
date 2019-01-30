// Wait for the DOM to be ready
$(function() {
    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("#frmRegister").validate({
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            name:       "required",
            address:    "required",
            phone:      {
                required: false
            },
            email: {
                required: true,
                email: true
            },
            userName:   "required",
            password: {
                required: true,
                minlength: 8,
                mypassword: true
            },
            image: {
                required: false,
                //accept: "image/jpeg, image/png"
            }
        },
        // Specify validation error messages
        messages: {
            name: "Please enter your name",
            address: "Please enter your address",
            userName: "Please enter your user name",
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 8 characters long"
            },
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
$.validator.addMethod('mypassword', function(value, element) {
        return this.optional(element) || (value.match(/[a-zA-Z]/) && value.match(/[0-9]/));
    },
    'Password must contain at least one numeric and one alphabetic character.');

$("#proceed-to-login").click(function () {

    $('#modalLoginForm').modal("toggle");
    $('#modalRegisterForm').modal("toggle");
    $('#register-success-msg').addClass('d-none');
});

$(document).ready(function() {
    var options = {
        beforeSubmit: showRequest, // pre-submit callback
        success: showResponse // post-submit callback
    };
    var form = $("#frmRegister");
    if(form.valid()){
        // bind to the form's submit event
        form.submit(function () {
            $(this).ajaxSubmit(options);
            // always return false to prevent standard browser submit and page navigation
            return false; });
    }
});
// pre-submit callback
function showRequest(formData, jqForm, options) {
    return true; }
// post-submit callback
function showResponse(responseText, statusText, xhr, $form) {
    $('#register-success-msg').removeClass('d-none');
}
