var url = window.location.href;
var productId = url.substring(url.lastIndexOf('/') + 1);
var sessionCheck;
// Wait for the DOM to be ready
$(function() {

    //get product
    $.get( '/product/' + productId , function( data ){

    }).done(function( data ) {
        // TO DO ON DONE

        //console.log("Success");
        showProduct(data);
    }).fail(function(data, textStatus, xhr) {
        //This shows status code eg. 403
        //console.log("error", data.status);
        //This shows status message eg. Forbidden
        //console.log("STATUS: "+xhr);

    }).always(function() {
        //TO-DO after fail/done request.

       // console.log("ended");
    });

    //get product comments
    $.get( '/product/' + productId + "/comments" , function( data ){

    }).done(function( data ) {
        // TO DO ON DONE
        //console.log("Success");
        //console.log("data", data);
        showComments(data);

    }).fail(function(data, textStatus, xhr) {
        //This shows status code eg. 403
        //console.log("error", data.status);
        //This shows status message eg. Forbidden
        //console.log("STATUS: "+xhr);

    }).always(function() {
        //TO-DO after fail/done request.

        //console.log("ended");
    });

});

sessionCheck = checkSession();


function showComments(jData){
    var userImage = "";
    var sessionVars = JSON.parse(localStorage.getItem("cookie"));
    console.log("SESSION" , sessionVars)
    if(sessionCheck == true){
        console.log("SESSION CHECK " , sessionCheck)
        if(sessionVars.image != ""){
            userImage = "../public/images/uploads/" + sessionVars.image;
            console.log("USER IMAGE " , userImage)
        } else {
            userImage = "https://crimsonems.org/wp-content/uploads/2017/10/profile-placeholder.gif";
        }
        
    }
   
    var htmlComments = "";
    var htmlComment = "";
    var loggedUserComment = "";
    $("#comments").html("");
    if(sessionCheck == true){
        loggedUserComment = '<div class="comment-wrap">\
                        <div class="photo">\
                            <div class="avatar" style="background-image: url(' + userImage +'")"></div>\
                        </div>\
                        <div class="comment-block">\
                            <form id="frmComment">\
                                <textarea name="" id="txtComment" cols="30" rows="3" placeholder="Add new comment.."></textarea>\
                                <button id="btnSubmit" class="btn btn-gold my-2 my-sm-0 text-uppercase" type="button">Submit</button>\
                            </form>\
                        </div>\
                    </div>';
    } else {
        loggedUserComment = '<div class="comment-wrap">\
                                <div class="photo">\
                                    <div class="avatar" style="background-image: url(' + userImage +'")"></div>\
                                </div>\
                                <div class="comment-block">\
                                    <form action="">\
                                        <textarea name="" id="" cols="30" rows="3" placeholder="You need to be logged in!" disabled></textarea>\
                                        <button id="btnSubmit" class="btn btn-gold my-2 my-sm-0 text-uppercase" disabled >Submit</button>\
                                    </form>\
                                </div>\
                            </div>';
    }
    for (let i = 0; i < jData.length; i++) {
        var userImages = "";
        if(jData[i].Image != "" && jData[i].Image != null){
            userImages = "../public/images/uploads/" + jData[i].Image;
            console.log("USER IMAGE " , userImage)
        } else {
            userImages = "https://crimsonems.org/wp-content/uploads/2017/10/profile-placeholder.gif";
        }
        var createTime = new Date(jData[i].commentCreateDateTime);
        var locale = "en-us";
        var minutes = createTime.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var formatDate = createTime.toLocaleString(locale, {month: "long"}) + " " + createTime.getDate() + ", "
            + createTime.getFullYear() + " @ " + createTime.getHours() + ":" + minutes;
            var sBtnDelete = '<button class="btnsComment btn btn-gold my-2 my-sm-0 text-uppercase d-none" type="button">Delete</button>'
            var sBtnUpdate = '<button class="btnsComment btn btn-gold my-2 my-sm-0 text-uppercase d-none" type="button" >Update</button>'
            if(sessionVars !== null){
                if(jData[i].userNo === sessionVars.userNo){
                    sBtnDelete = '<button data-id="' + jData[i].commentNo +'" class="btnDeleteComment btnsComment btn btn-gold my-2 my-sm-0 text-uppercase" type="button">Delete</button>'
                    sBtnUpdate = '<button data-id="' + jData[i].commentNo +'" class="btnUpdateComment btnsComment btn btn-gold my-2 my-sm-0 text-uppercase" data-toggle="modal" data-target="#modalCommentForm" type="button" >Update</button>'
                    
                }
            }
            

        htmlComment =   '<div class="comment-wrap">\
                            <div class="photo">\
                                <div class="avatar" style="background-image: url(' + userImages +'")"></div>\
                            </div>\
                            <div class="comment-block" data-id="' + jData[i].commentNo +' ">\
                                <p class="comment-text">' + jData[i].comment +'</p>\
                                <div class="bottom-comment">\
                                <div class="comment-date">' + formatDate +'</div>\
                                <ul class="comment-actions">\
                                    <li class="complain">By ' + jData[i].userName + '</li>\
                                </ul>\
                            </div>\
                              ' + sBtnDelete +'\
                              ' + sBtnUpdate +'\
                        </div>\
                    </div>';
        htmlComments += htmlComment;
    }
    $("#comments").html(htmlComments);
    $("#comments").prepend(loggedUserComment);
    addComment();
    btnDleteComment();
    btnUpdateComment();
    
}

function addComment() {
    $("#btnSubmit").click(function() {
        var sCookie = localStorage.getItem("cookie");
        var jCookie = JSON.parse(sCookie);

        var txtComment = $("textarea#txtComment").val();
        var sjComment = {"comment":txtComment,"userNo": jCookie.userNo, "productNo": productId};
        //console.log(sjComment);

        $.post( '/user/comment' , sjComment , function( data ){
        }).done(function(data) {
            // TO DO ON DONE
            console.log(data);
            showComments(data[0]);
    
        }).fail(function(data, textStatus, xhr) {
            //This shows status code eg. 403
            console.log("error", data.status);
            //This shows status message eg. Forbidden
            console.log("STATUS: "+xhr);

            var response = JSON.parse(data.responseText);
            console.log("response: ", response);

        }).always(function() {
            //TO-DO after fail/done request.
            console.log("ended");
        });
    });
}

function showProduct(data) {
    var htmlShopProduct = "";
    $("#product-container").html("");
    htmlShopProduct =   '<div class="card" style="width: 30rem; height: 50rem;">\
                                <img class="card-img-top" src="http://via.placeholder.com/450x350" alt="Card image cap">\
                                     <div class="card-body">\
                                         <h5 class="card-title">' + data[0].name +'</h5>\
                                         <p class="card-text">Color: ' + data[0].color +'</p>\
                                         <p class="card-text">Model: ' + data[0].model +'</p>\
                                         <p class="card-text">Prize: ' + data[0].prize +' DKK</p>\
                                         <p class="card-text">Size: ' + data[0].size +'</p>\
                                         <p class="card-text">Type: ' + data[0].type +'</p>\
                                         <p class="card-text">Description: ' + data[0].description +'</p>\
                                         <p class="card-text">Quantity: ' + data[0].quantity +'</p>\
                                     </div>\
                             </div>';
    $("#product-container").html(htmlShopProduct);
}

function btnDleteComment() {
    var commentNo = ""
    $(".btnDeleteComment").each(function(btnDelete){
        $(this).on("click", function() {
            commentNo = $(this).attr('data-id');
            console.log(commentNo);
            $.get( "/user/delete-comment/" + commentNo + "/product/" + productId , function( data ){
            }).done(function( data ){
                console.log(data);
                showComments(data[0]);
                
            }).fail(function(data, textStatus, xhr){
                console.log(data);
            }); 
        });
    });           
}

function btnUpdateComment() {
    var comment = "";
    $(".btnUpdateComment").each(function(btnDelete){
        $(this).on("click", function() {
            commentNo = $(this).attr('data-id');
            
        });
    });
    $("#btnUpdateComment").click(function() {
        var sCookie = localStorage.getItem("cookie");
        var jCookie = JSON.parse(sCookie);
        var jUpdateComment = {"comment":txtComment,"userNo": jCookie.userNo, "productNo": productId};
        $.post("/user/comment/" + commentNo, jUpdateComment, function(data){
            console.log(data);
        }).done(function(data){
            $('.modal').modal('hide');
            showComments(data[0]);
            console.log(data);
        }).fail(function(data){
            console.log(data);
        });
    });
}
   




