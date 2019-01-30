function checkSession() {
    var cookie = localStorage.getItem("cookie");
    var jCookie = JSON.parse(cookie);
    
    //console.log("cookie: ", cookie);
    if(jCookie !== null){
        if(jCookie.isInRole == "Admin"){
            $("#staff-link").removeClass('d-none');
        }
        $('#profile-link').removeClass('d-none');
        $( "#btn-logIn").addClass('d-none');
        $( "#btn-logOut").removeClass('d-none');
        $( "#btn-register").addClass('d-none');
        return true;
    } 
    return false;
}


function accessSingleProduct(){
    $(".btnViewProduct").click(function () {
        event.preventDefault();
        var productNo = $(this).attr('data-id');
        //console.log("ProductId: ",productNo );
        window.location.replace("/selected-product/" + productNo);
    });
}