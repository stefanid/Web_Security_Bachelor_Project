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

   // initIsotop();
});

function showProducts(data) {
    var htmlShopProducts = "";
    var htmlShopProduct = "";
    var htmlNumberOfProducts = ""+data.length+" products found";
    $("#lblShopList").html("");
    $("#product-number").html(htmlNumberOfProducts);

    for (var i = 0; i < data.length; i++) {
        htmlShopProduct =   '<div class="col-3 single-product '+data[i].type+'" data-category="'+data[i].type+'">\
                                <a href="">\
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
    $("#lblShopList").html(htmlShopProducts);
    accessSingleProduct();
}

// function initIsotop() {
//     $('#lblShopList').isotope({
//         // options...
//         itemSelector: '.single-product',
//         getSortData: {
//             name: '.name',
//             price: function( itemElem ) {
//                 // get text of .weight element
//                 var price = $( itemElem ).find('.price').text();
//                 // replace parens (), and parse as float
//                 return parseFloat( price.replace( 'DKK', '') );
//             },
//             category: '[data-category]'
//         }
//     });
// }

// filter functions
var filterFns = {
    // show if number is greater than 50
    numberGreaterThan50: function() {
        var number = $(this).find('.number').text();
        return parseInt( number, 10 ) > 50;
    },
    // show if name ends with -ium
    ium: function() {
        var name = $(this).find('.name').text();
        return name.match( /ium$/ );
    }
};

// bind filter button click
$('#filters').on( 'click', 'button', function() {
    var filterValue = $( this ).attr('data-filter');
    // use filterFn if matches value
    filterValue = filterFns[ filterValue ] || filterValue;
    //console.log("filterValue: ", filterValue);
    $('#lblShopList').isotope({ filter: filterValue });
});

// bind sort button click
$('#sorts').on( 'click', 'button', function() {
    var sortByValue = $(this).attr('data-sort-by');
    $('#lblShopList').isotope({ sortBy: sortByValue });
});

// change is-checked class on buttons
$('.button-group').each( function( i, buttonGroup ) {
    var $buttonGroup = $( buttonGroup );
    $buttonGroup.on( 'click', 'button', function() {
        $buttonGroup.find('.is-checked').removeClass('is-checked');
        $( this ).addClass('is-checked');
    });
});

checkSession();