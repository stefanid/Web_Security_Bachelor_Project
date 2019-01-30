/************************Packages***********************/
var express = require("express");
var router = express.Router();
/*******************************************************/

/************************Modules************************/
var dbController = require("../database/databaseController.js");
var parameterChecker = require("../helpers/parameterChecker.js");
var account = require(__dirname + "/account.js");
/******************************************************/

/************************APIS*************************/

// Find a specific order by orderNo
router.get("/:orderNo", function(req,res,next){
    var jSession = JSON.parse(global.gSession);
    if(jSession == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if (jSession != null && jSession.isLoggedIn == true && jSession.isInRole == "Support"){
        var inputParams = [];
        inputParams.push(req.params.orderNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var orderNo = checkedParams[0];
        var sQuery = "SELECT * from order WHERE orderNo = ?";

        dbController.query(sQuery, [orderNo], (err, sjData) => {
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

//Find all orders by a specific user
router.get("/:userNo", function(req,res,next){
    var jSession = JSON.parse(global.gSession);
    if(jSession == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if (jSession != null && jSession.isLoggedIn == true && jSession.isInRole == "Support"){
        var inputParams = [];
        inputParams.push(req.params.userNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var userNo = checkedParams[0];
        var sQuery = "SELECT * FROM order AS o JOIN user AS u ON o.userNo = u.userNo";

        dbController.query(sQuery, [userNo], (err, sjData) => {
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
module.exports = router;