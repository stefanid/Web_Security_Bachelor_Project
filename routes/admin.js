/************************Packages***********************/
var express = require("express");
var router = express.Router();
const jwt = require("jwt-simple");
const nodemailer = require('nodemailer');
const appsettings = require("../appsettings.json");
/*******************************************************/

/************************Modules************************/
var dbController = require("../database/databaseController.js");
const hasher = require("../helpers/hasher.js");
const parameterChecker = require("../helpers/parameterChecker.js");
const imageHandler = require("../helpers/imageHandler.js");

const jwtSercret = appsettings.jwtSecret;
const shopEmail = appsettings.mailInformation.email;
const shopPW = appsettings.mailInformation.password;

/************************APIS************************/
router.get("/", function(req, res, next){
    console.log(req.session);
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if(req.session  != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var sQuery = "SELECT userNo, name, address, phone, email, userName, image, status FROM user AS u JOIN role AS r ON u.roleNo = r.roleNo WHERE r.roleName = ?";
        var roleName = "Support";

        dbController.query(sQuery, [roleName], (err, sjData) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            res.send(sjData);
            console.log(sjData);
        });
    } else {
        res.status(401);
        res.send(JSON.stringify({response: "Unauthorized access!"}));
    }
});

router.put("/:userNo",function(req, res, next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    else if(req.session != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var inputParams = [];
        inputParams.push(req.inputParamsaramsarams.userNo, req.body.roleName);
        var checkedParams = parameterChecker.check(req, inputParams);

        var userNo = checkedParams[0];
        var roleName = checkedParams[1];
        var sp = "call UpdateRoles (?, ?);"
        dbController.query(sp, [userNo, roleName], (err, sjData) => {
            if(err){
                console.log(err);
                return res.send(JSON.stringify(err));
            }
            console.log(sjData);
            return res.send(sjData);
        });
    } else {
        res.status(401);
        res.send(JSON.stringify({response: "Unauthorized access!"}));
    }

});

router.post("/support", function(req, res, next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }  else if(req.session != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var image;
        var imageName;
        imageHandler.upload(req, res, function (err) {
            if (err) {
                // An error occurred when uploading
                console.log("error occurred: ");
                return
            }
            if(req.file){
                // Everything went fine
                console.log("image uploaded");
                image = req.file;
                imageName = image.filename;
            }
        });
        var inputParams = [];
        inputParams.push(req.body.name, req.body.address, req.body.phone,
            req.body.email,  req.body.userName, req.body.password);
        var checkedParams = parameterChecker.check(req, inputParams);
        var userNo = null;
        var name = checkedParams[0];
        var address = checkedParams[1];
        var phone = checkedParams[2];
        var email = checkedParams[3];
        var userName = checkedParams[4];
        var password = checkedParams[5];
        var roleName = 'Support';
        var hashResult = JSON.parse(hasher.hashPw(password));
        var pwSalt = hashResult.salt;
        var pwHashSalt = hashResult.data.pwHash;
        var sp = "call AddUpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        dbController.query(sp, [userNo, name, address, phone, email, userName, pwHashSalt, pwSalt, imageName, roleName], (err, jData) => {
            if(err){
                console.log(jData);
                res.status(500);
                res.send(JSON.stringify({response: "Something went wrong!"}));
            } else {
                if(jData[1].length > 0){
                    try {
                        var newUser = JSON.stringify(jData[1][0]);
                        newUser = JSON.parse(newUser);
                        var userName = newUser.userName;
                        var payload = {
                            userNo: newUser.userNo
                        };
                        var token = jwt.encode(payload, jwtSercret, 'HS256');
                        var sp = "call AddUpdateToken(?, ?, ?)";
                        dbController.query(sp, [null, token, newUser.userNo], (err, jData) => {
                            if(err){
                                console.log(err);
                                res.status(500);
                                return res.send(JSON.stringify({response: "Something went wrong!"}));
                            } else {
                                var url = 'https://localhost:8443/user/verify-account/' + token;
                                var mailTransporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    host: 'smtp.gmail.com',
                                    port: 465,
                                    secure: true,
                                    auth:   {
                                        user: shopEmail,
                                        pass: shopPW
                                    }
                                });
                                const mailOptions = {
                                    from : 'webshopincorp_do_not_reply@gmail.com',
                                    to: email,
                                    subject: '[WebShopINC] You have been invited into our system!. ',
                                    html: '<p> Welcome to our webshop, ' + '<b>' +userName + '</b>' +'<p>\r\n' +
                                    'Please click on the following link to activate your account: <a href="' + url +'" >Activate your account</a>\r\n' +
                                    '<p> Sincerely yours,</p>\r\n' +
                                    '<p>webshop.com </p>'
                                };
                                mailTransporter.sendMail(mailOptions, function(err, info){
                                    if(err){
                                        console.log(err);
                                        res.status(500);
                                        return res.send(JSON.stringify({response: "Something went wrong!"}));
                                    } else{
                                        console.log(info);
                                        res.status(200);
                                        return res.send(JSON.stringify({response: "Successfully registered. A verification mail has been sent to your email!"}));
                                    }
                                });                      
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        res.status(500);
                        return res.send(JSON.stringify({response: "Something went wrong!"}));
                    }
                } else {
                    res.status(409);
                    return res.send(JSON.stringify({response: 'A user with the specified email and username already exists!'}));
                }
            }
            
        })
    }else {
        res.status(401);
        res.send(JSON.stringify({response: "Unauthorized access!"}));
    }
});

module.exports = router;