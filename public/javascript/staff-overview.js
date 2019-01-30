// Wait for the DOM to be ready
$(function() {
     // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("#frmCreateStaff").validate({
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


    $.get( '/admin' , function( data ){
    }).done(function( data ) {
        // TO DO ON DONE
        //console.log("data: ", data);
        //console.log("Success");
        showStaffMemeber(data);
    }).fail(function(data, textStatus, xhr) {
        //This shows status code eg. 403
        //console.log("error", data.status);
        //This shows status message eg. Forbidden
        //console.log("STATUS: "+xhr);
    }).always(function(data) {
        //TO-DO after fail/done request.
        //console.log("ended");
    });
});





function showStaffMemeber(data) {
    console.log(data);
    var htmlStaffMember = "";
    var sStaffStatus;
    var sUserImg;
    for (let i = 0; i < data.length; i++) {
        const staffMember = data[i];
        if(staffMember.status == 1){
            sStaffStatus = "Active";
        } else if (staffMember.status == 0){
            sStaffStatus = "Awaiting activation";
        } else {
            sStaffStatus = "Blocked";
        }
        if(data[i].image != "" && data[i].image != null){
            sUserImg = "<img class='staffMemberIcon' src='../public/images/uploads/" + data[i].image +"' />";
        } else {
            sUserImg = "<img class='staffMemberIcon' src='../public/images/uploads/defaultIcon.png'/>";
        }

        htmlStaffMember += '<tr><td>' + sUserImg + '</td><td>' + data[i].name +
         '</td><td>' + data[i].address + '</td><td>' + data[i].phone + '</td><td>' +
         data[i].email + '</td><td>' + data[i].userName + '</td><td>' + sStaffStatus +
         '</td></tr>';
        
    }
    $("#tblStaffMembers").append(htmlStaffMember);
}
$("#btnRegisterSupport").click(function() {
    var form = $("#frmCreateStaff");
    if(form.valid()){
        var frm = form.serialize();
        $.post("/admin/support", frm, function(data){
            console.log(data);
        }).done(function(data){
            console.log(data);
        }).fail(function(data){
            console.log(data);
        });
    }
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