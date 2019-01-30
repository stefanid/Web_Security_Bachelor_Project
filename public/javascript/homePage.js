// Wait for the DOM to be ready
$(function() {

    $.get( '/product' , function( data ){
    }).done(function( data ) {
        // TO DO ON DONE
        //console.log("data: ", data);
        //console.log("Success");
        showProducts(data);
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

function showProducts(data) {
    var htmlShopProducts = "";
    var htmlShopProduct = "";
    $("#lblHomePageProducts").html("");
    for (var i = 0; i < data.length; i++) {
        htmlShopProduct =   '<div class="col-3 single-product '+data[i].type+'" data-category="'+data[i].type+'">\
                                <a href="#">\
                                    <img src="../public/images/products/placeholder-image-1000x1000.png" class="img-fluid img-thumbnail" alt="product">\
                                    <span class="caption simple-caption">\
                                       <span class="name">'+data[i].name+'</span>\
                                       <span class="price">'+data[i].prize+' DKK</span>\
                                       <button class="btnViewProduct btn btn-gold my-2 my-sm-0 text-uppercase" data-id="'+ data[i].productNo +'">View</button>\
                                    </span>\
                                </a>\
                           </div>';

        htmlShopProducts += htmlShopProduct;

    }
    $("#lblHomePageProducts").html(htmlShopProducts);
    accessSingleProduct();
}

checkSession();