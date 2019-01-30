/************************Packages***********************/
var express = require("express");
var router = express.Router();
/*******************************************************/

/************************Modules************************/
var dbController = require("../database/databaseController.js");
var account = require(__dirname + "/account.js");
var imageHandler = require("../helpers/imageHandler.js");
var parameterChecker = require("../helpers/parameterChecker.js");

/******************************************************/

/************************APIS*************************/
router.get("/", function(req, res, next){
    var sQuery = "SELECT * FROM product";
    dbController.query(sQuery, (err, sjData) => {
        if(err){
            return res.send(err);
            console.log(err);
        }
        console.log(sjData);
        return res.send(sjData);

    });
});

router.post("/", function(req,res,next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if (req.session != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var inputParams = [];
        inputParams.push(req.body.name, req.body.quantity, req.body.model, req.body.brand,
            req.body.image, req.body.color, req.body.size, req.body.type, req.body.price, req.body.description);
        var checkedParams = parameterChecker.check(req, inputParams);

        var productNo = null;
        var name = checkedParams[0];
        var quantity = checkedParams[1];
        var model = checkedParams[2];
        var brand = checkedParams[3];
        var image = checkedParams[4];
        var color = checkedParams[5];
        var size = checkedParams[6];
        var type = checkedParams[7];
        var price = checkedParams[8];
        var description = checkedParams[9];

        var sp = "call AddUpdateProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
        dbController.query(sp, [productNo, name, quantity, model, brand, image, color,
            size, type, price, description], (err, sjData) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            console.log(sjData);
            res.send(sjData);

        });
    }
    else {
        res.status(401);
        res.send(JSON.stringify({response: "Unauthorized access!"}));
    }
});

router.put("/:productNo",function(req,res,next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if (req.session != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var inputParams = [];
        inputParams.push(req.params.productNo,req.body.name, req.body.quantity, req.body.model, req.body.brand,
            req.body.image, req.body.color, req.body.size, req.body.type, req.body.price, req.body.description);
        var checkedParams = parameterChecker.check(req, inputParams);

        var productNo = checkedParams[0];
        var name = checkedParams[1];
        var quantity = checkedParams[2];
        var model = checkedParams[3];
        var brand = checkedParams[4];
        var image = checkedParams[5];
        var color = checkedParams[6];
        var size = checkedParams[7];
        var type = checkedParams[8];
        var price = checkedParams[9];
        var description = checkedParams[10];

        var sp = "call AddUpdateProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
        dbController.query(sp, [productNo, name, quantity, model, brand, image, color,
            size, type, price, description], (err, sjData) => {
            if(err){
                console.log(err);
                res.send(err);
            } else {
                console.log(sjData);
                res.send(sjData);
            }

        });

    } else {
        res.status(401);
        res.send(JSON.stringify({response: "Unauthorized access!"}));
    }


});

router.delete("/:productNo", function(req,res,next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if (req.session != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var inputParams = [];
        inputParams.push(req.params.productNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var productNo = checkedParams[0];
        var sQuery = "DELETE FROM product WHERE productNo = ?";

        dbController.query(sQuery, [productNo], (err, sjData) => {
            if(err){
                console.log(err);
                return res.send(JSON.stringify(err));
            }
            console.log(sjData);
            return res.send(sjData);
        });
    }
    else {
        res.status(401);
        res.send(JSON.stringify({response: "Unauthorized access!"}));
    }
});

// Get a specific product by product id
router.get("/:productNo", function(req,res,next){

        var inputParams = [];
        inputParams.push(req.params.productNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var productNo = checkedParams[0];
        var sQuery = "select * from product WHERE productNo = ?";

        dbController.query(sQuery, [productNo], (err, sjData) => {
            if(err){
                console.log(err);
                return res.send(JSON.stringify(err));
            }
            console.log(sjData);
            return res.send(sjData);
        });

});

router.get("/:productNo/comments", function(req, res, next){
    var inputParams = [];
    inputParams.push(req.params.productNo);
    var checkedParams = parameterChecker.check(req, inputParams);

    var productNo = checkedParams[0];
    var sQuery = "SELECT c.commentNo, c.comment, c.commentCreateDateTime, u.userName, u.Image, u.userNo FROM comment AS c" +
        " JOIN user AS u ON c.userNo = u.userNo" +
        " WHERE c.productNo = ?";
    dbController.query(sQuery, [productNo], (err, jData) => {
        if(err){
            console.log(jData);
            return res.send(err);
        }
        console.log(jData);
        return res.send(jData);
    });
});

module.exports = router;