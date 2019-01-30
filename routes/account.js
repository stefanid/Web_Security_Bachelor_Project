/************************Packages***********************/
global.gSession = null;
const express = require("express");
const router = express.Router();
const jwt = require("jwt-simple");
const nodemailer = require('nodemailer');
const appsettings = require("../appsettings.json");
const fs = require("fs");
const path = require('path');
/*******************************************************/

/************************Modules************************/
const dbController = require("../database/databaseController.js");
const hasher = require("../helpers/hasher.js");
const parameterChecker = require("../helpers/parameterChecker.js");
const imageHandler = require("../helpers/imageHandler.js");

const jwtSercret = appsettings.jwtSecret;
const shopEmail = appsettings.mailInformation.email;
const shopPW = appsettings.mailInformation.password;

router.use("/public", express.static("public"));
/******************************************************/

/************************APIS************************/
router.post("/" , function(req, res, next){
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
        var roleName = 'Basic User';
        var hashResult = JSON.parse(hasher.hashPw(password));
        var pwSalt = hashResult.salt;
        var pwHashSalt = hashResult.data.pwHash;
        var sp = "call AddUpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        dbController.query(sp, [userNo, name, address, phone, email, userName,
            pwHashSalt, pwSalt, imageName, roleName], (err, jData) => {
            if(err){
                console.log(err);
                res.status(500);
                res.send(JSON.stringify({response: "Something went wrong!"}));
            }
            if(jData[1].length > 0){
                var newUser = JSON.stringify(jData[1][0]);
                newUser = JSON.parse(newUser);
                var userName = newUser.userName;
                var payload = {
                    userNo: newUser.userNo
                };
                try {
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
                                subject: '[WebShopINC] Please verify your email address. ',
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
        });
    });

});

router.get("/verify-account/:token", function(req, res, next){
    var status;
    var sActiveHtml = fs.readFileSync(path.join(__dirname, '..', '/views/accountActivation.html' ), 'utf8');
    var token = req.sanitize(req.params.token);
    console.log(token)
    if(token != ""){
        var data = jwt.decode(token, jwtSercret, 'HS256');
        var userNo = data.userNo;
        var sQuery = "SELECT tokenNo FROM token WHERE userNo = ?";
        dbController.query(sQuery, [userNo], (err, jData) => {
            if(err){
                console.log(jData);
                status = "Something went wrong";
                sActiveHtml = sActiveHtml.replace('{{status}}', status);
                res.status(500);
                return res.send(sActiveHtml);
            } else {
                console.log(jData);
                if(jData.length > 0){
                    var tokenNo = jData[0].tokenNo;
                    sQuery = "call AddUpdateToken(?, ?, ?)";
                    dbController.query(sQuery, [tokenNo, token, userNo], (err, jData) =>{
                        if(err){
                            console.log(jData);
                            status = "Something went wrong";
                            sActiveHtml = sActiveHtml.replace('{{status}}', status);
                            res.status(500);
                            return res.send(sActiveHtml);
                        } else {
                            var tokenStatus = jData[0][0].tokenStatus;
                            if(tokenStatus == -1){ 
                               status = "Token has expired or already been used!"
                               sActiveHtml = sActiveHtml.replace('{{status}}', status);
                               res.status(405);
                               return res.send(sActiveHtml);
                            } else {
                                status = "Your account has been activated";
                                sActiveHtml = sActiveHtml.replace('{{status}}', status);
                                res.status(200);
                                return res.send(sActiveHtml);
                            }
                        }
                    });
                } else {
                    status = "Token has expired or already been used!";
                    sActiveHtml = sActiveHtml.replace('{{status}}', status);
                    res.status(405);
                    return res.send(sActiveHtml);
                }
            }
        });
    } else {
        res.status(400);
        return res.send(JSON.stringify({response: "Bad request! Token value is invalid"}));
    }
});

router.post("/login", function(req, res, next){
    console.log(req.recaptcha);
    var inputParams = [];
    inputParams.push(req.body.userName, req.body.password);
    var checkedParams = parameterChecker.check(req, inputParams);

    var userName = checkedParams[0];
    var password = checkedParams[1];
    if(userName !== "" && password != ""){
        console.log(password);
        console.log(userName);
        var sQuery = "SELECT userNo, name, email, roleName, password, passwordSalt, userName, image, status FROM user AS u " +
            "JOIN role AS r ON u.roleNo = r.roleNo WHERE userName = ?";
        dbController.query(sQuery, [userName], (err, jData) => {
            if(err){
                console.log(jData);
                res.status(500);
                return res.send(JSON.stringify({response: "Something went wrong!"}));
            }
            var numRows = jData.length;
            if (numRows === 0) {
                res.status(401);
                return res.send(JSON.stringify({response: "User not found!"}));
            }else{
                var dbSalt = jData[0].passwordSalt;
                var dbHash = jData[0].password;
                var sResult = hasher.verifyPw(password, dbSalt, dbHash);
                var jResult = JSON.parse(sResult);
                console.log(jResult);
                if(jResult.status == false && jData[0].status != 0){
                    var ipAddress = req.connection.remoteAddress;
                    var accountStatus = 'FAIL';
                    sQuery = "call LogLogins(?, ?, ?)";
                    dbController.query(sQuery, [ipAddress, jData[0].userNo, accountStatus], (err, jData2) => {
                        if(err){
                            console.log(jData2);
                            res.status(500);
                            return res.send(JSON.stringify({response: "Something went wrong!"}));
                        } else {
                            var userStatus = jData[0].status;
                            if(jData2[0][0].accountStatus == "BLOCKED" && userStatus != 0){
                                var email = jData[0].email;
                                var userNo = jData[0].userNo;

                                var payload = {
                                    userNo: userNo
                                };
                                try {
                                    var token = jwt.encode(payload, jwtSercret, 'HS256');
                                    var tokenNo = null;
                                    sQuery = "call AddUpdateToken(?, ?, ?)";
                                    dbController.query(sQuery, [tokenNo, token, userNo], (err, jData3) => {
                                        if(err){
                                            console.log(jData3);
                                            res.status(500);
                                            return res.send(JSON.stringify({response: "Something went wrong!"}));
                                        } else {
                                            console.log(jData3);
                                            var url = 'https://localhost:8443/user/unblock-account/' + token;
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
                                                subject: '[WebShopINC] Your account has been blocked. ',
                                                html: '<p> Dear, ' + '<b>' +userName + '</b>' +'<p>\r\n' +
                                                'Due to too many failed attempts, we have blocked your account to prevent any security breach to your information.' +
                                                'We highly reccomend to change your password. Please click on the following link to unblock your account.: <a href="' + url +'" >Unblock your account</a>\r\n' +
                                                '<p> Sincerely yours,</p>\r\n' +
                                                '<p>webshop.com </p>'
                                            };
                                            mailTransporter.sendMail(mailOptions, function(err, info){
                                                if(err){
                                                    console.log(info);
                                                    res.status(500);
                                                    return res.send(JSON.stringify({response: "Something went wrong!"}));
                                                } else{
                                                    console.log(info);
                                                    res.status(401);
                                                    return res.send(JSON.stringify({response: "Your account is blocked due to too many login attempts! We have sent you and email with further instructions"}));
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
                                res.status(403);
                                return res.send(JSON.stringify({response: "Username or Password is incorrect!"}));
                            }
                        }
                    });
                } else if(jResult.status == false) {
                    res.status(403);
                    return res.send(JSON.stringify({response: "Username or Password is incorrect!"}));
                }else {
                    var accountStatus = jData[0].status;
                    console.log("status" + accountStatus);
                    if(accountStatus == 0){
                        res.status(401);
                        return res.send(JSON.stringify({response: "Your account is not activated!\r\nPlease check your email and activate it!"}));
                    } else {
                        var ipAddress = req.connection.remoteAddress;
                        var accountStatus = 'SUCCESS';
                        sQuery = "call LogLogins(?, ?, ?)";
                        dbController.query(sQuery, [ipAddress, jData[0].userNo, accountStatus], (err, jData2) => {
                            if(err){
                                console.log(jData2);
                                res.status(500);
                                return res.send(JSON.stringify({response: "Something went wrong!"}));
                            } else {
                                if(jData2[0].length === 0){
                                    var accStatus = jData2[1][0].accountStatus;
                                    if(accStatus == "IP CHANGED"){
                                        var email = jData[0].email;
                                        var userNo = jData[0].userNo;

                                        var payload = {
                                            userNo: userNo,
                                            newLocation: ipAddress
                                        };
                                        try {
                                            var token = jwt.encode(payload, jwtSercret, 'HS256');
                                            var url = "https://localhost:8443/user/verify-new-location/" + token;
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
                                                subject: '[WebShopINC] Please verify your new login location. ',
                                                html: '<p> Dear, ' + '<b>' +userName + '</b>' +'<p>\r\n' +
                                                'We have detected a new login location.' +
                                                'If you dont recognize the new location ' + ipAddress+', please ignore this email.'
                                                +'Please click on the following link to confirm your new location: <a href="' + url +'" >Confirm IP Address</a>\r\n' +
                                                '<p> Sincerely yours,</p>\r\n' +
                                                '<p>webshop.com </p>'
                                            };
                                            mailTransporter.sendMail(mailOptions, function(err, info){
                                                if(err){
                                                    console.log(info);
                                                    res.status(500);
                                                    return res.send(JSON.stringify({response: "Something went wrong!"}));
                                                } else{
                                                    console.log(userNo);
                                                    res.status(423)
                                                    return res.send(JSON.stringify({response: "New login location detected! Please, login into your email and verify your new location!"}));
                                                }
                                            });
                                        } catch (error) {
                                            console.log(error);
                                            res.status(500);
                                            return res.send(JSON.stringify({response: "Something went wrong!"}));
                                        }
                                    } else if(accountStatus == "BLOCKED"){
                                        res.status(401);
                                        return res.send(JSON.stringify({response: "Your account is still blocked! Please check your email for further instructions!"}));
                                    }
                                } else if(!req.recaptcha.error){
                                    res.status(200);
                                    req.session.isLoggedIn = true;
                                    req.session.isInRole = jData[0].roleName;
                                    req.session.userName = jData[0].userName;
                                    req.session.userNo = jData[0].userNo;
                                    req.session.name = jData[0].name;
                                    req.session.image = jData[0].image;
                                    console.log(req.session);
                                    return res.send(JSON.stringify(req.session));
                                } else {
                                    res.status(401);
                                    return res.send(JSON.stringify({response: "Please verify that you are not a robot"}));
                                }
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.status(400);
        return res.send(JSON.stringify({response: "Bad Request"}));
    }

});

router.get("/unblock-account/:token", function(req, res, next){
    var status;
    var token = req.sanitize(req.params.token);
    var sActiveHtml = fs.readFileSync(path.join(__dirname, '..', '/views/accountActivation.html' ), 'utf8');
    if(token != ""){
        var data = jwt.decode(token, jwtSercret, 'HS256');
        var userNo = data.userNo;
        var sQuery = "SELECT tokenNo FROM token WHERE userNo = ?";
        dbController.query(sQuery, [userNo], (err, jData) => {
            if(err){
                console.log(jData);
                status = "Something went wrong";
                sActiveHtml = sActiveHtml.replace('{{status}}', status);
                res.status(500);
                return res.send(sActiveHtml);
            } else {
                if(jData.length > 0){
                    var tokenNo = jData[0].tokenNo;
                    sQuery = "call AddUpdateToken(?, ?, ?)";
                    dbController.query(sQuery, [tokenNo, token, userNo], (err, jData2) => {
                        if(err){
                            console.log(jData);
                            status = "Something went wrong";
                            sActiveHtml = sActiveHtml.replace('{{status}}', status);
                            res.status(500);
                            return res.send(sActiveHtml);
                        } else {
                            var tokenStatus = jData2[0][0].tokenStatus;
                            if(tokenStatus == -1){
                                status = "Token has expired or already been used!"
                                sActiveHtml = sActiveHtml.replace('{{status}}', status);
                                res.status(405);
                                return res.send(sActiveHtml);
                            } else {
                                var failedAttempts = 0;
                                sQuery = "UPDATE loggin_attempt SET failedAttempts = ? WHERE userNo = ?";
                                dbController.query(sQuery, [failedAttempts, userNo], (err, jData) => {
                                    if(err){
                                        console.log(jData);
                                        status = "Something went wrong";
                                        sActiveHtml = sActiveHtml.replace('{{status}}', status);
                                        res.status(500);
                                        return res.send(sActiveHtml);
                                    } else {
                                        status = "Your account has been activated";
                                        sActiveHtml = sActiveHtml.replace('{{status}}', status);
                                        res.status(200);
                                        return res.send(sActiveHtml);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    status = "Token has expired or already been used!"
                    sActiveHtml = sActiveHtml.replace('{{status}}', status);
                    res.status(405);
                    return res.send(sActiveHtml);
                }
            }
        });
    } else {
        status = "Bad request! Token value is invalid"
        sActiveHtml = sActiveHtml.replace('{{status}}', status);
        res.status(400);
        return res.send(sActiveHtml);
    }

});

router.get("/verify-new-location/:token", function(req, res, next){
    var token = req.sanitize(req.params.token);
    var sActiveHtml = fs.readFileSync(path.join(__dirname, '..', '/views/accountActivation.html' ), 'utf8');
    if(token != ""){
        var data = jwt.decode(token, jwtSercret, 'HS256');
        var userNo = data.userNo;
        var newLocation = data.newLocation;
        var loggin_status = 0;
        var sQuery = "UPDATE loggin_attempt SET ipAddress = ?, loggin_status = ? WHERE userNo = ?";
        dbController.query(sQuery, [newLocation, loggin_status, userNo], (err, jData) => {
            if(err){
                status = "Something went wrong";
                sActiveHtml = sActiveHtml.replace('{{status}}', status);
                res.status(500);
                return res.send(sActiveHtml);
            } else {
                status = "New location confirmed!";
                sActiveHtml = sActiveHtml.replace('{{status}}', status);
                res.status(200);
                return res.send(sActiveHtml);
            }
        });
    } else {
        status = "Bad request! Token value is invalid";
        sActiveHtml = sActiveHtml.replace('{{status}}', status);
        res.status(400);
        return res.send(sActiveHtml);
    }
});

router.post("/resend-activataion-token", function(req, res, next) {
    var email = req.sanitize(req.body.email);
    if(email != ""){
        var sQuery = "SELECT userNo, status, userName FROM user WHERE email = ?";
        dbController.query(sQuery, [email], (err, jData) => {
            if(err){
                console.log(err);
                res.status(500);
                return res.send(JSON.stringify({response: "Something went wrong!"}));
            } else {
                if(jData.length > 0){
                    var status = jData[0].status;
                    if(status == 1){
                        res.status(200);
                        return res.send(JSON.stringify({response: "Your account is already active"}));
                    }
                    else {
                        var userNo = jData[0].userNo;
                        var userName = jData[0].userName;
                        var payload = {
                            userNo: userNo
                        };
                        try {
                            var token = jwt.encode(payload, jwtSercret, 'HS256');
                            var sp = "call AddUpdateToken(?, ?, ?)";
                            dbController.query(sp, [null, token, userNo], (err, jData) => {
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
                                        subject: '[WebShopINC] Please verify your email address. ',
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
                                            return res.send(JSON.stringify({response: "A new activation link as been sent to your email!"}));
                                        }
                                    });
                                }
                            });
                        } catch (error) {
                            console.log(error);
                            res.status(500);
                            return res.send(JSON.stringify({response: "Something went wrong!"}));
                        }
                    }
                } else {
                    res.status(404);
                    return res.send(JSON.stringify({response: "A user with the specified email does not exist"}));
                }
            }
        });
    } else {
        res.status(400);
        return res.send(JSON.stringify({response: "Bad request! Token value is invalid"}));
    }
});

router.get("/logout", function(req, res, next){
    req.session.destroy();
    //console.log(req.session);
    return res.send(JSON.stringify({response: "Successfully logged out!"}));

});

router.put("/:userNo", function(req,res,next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    if(req.session != null && req.session.isLoggedIn == true){
        var inputParams= [];
        inputParams.push(req.params.userNo, req.body.oldPassword, req.body.newPassword);
        var checkedParams = parameterChecker.check(req, inputParams);

        var userNo = checkedParams[0];
        var oldPassword = checkedParams[1];
        var newPassword = checkedParams[2];

        var sQuery = "SELECT password, passwordSalt FROM user WHERE userNo = ?";
        dbController.query(sQuery, [userNo], (err, jData) => {
            if(err){
                console.log(err);
                return res.send(err);
            }
            console.log(jData);
            var dbSalt = jData[0].passwordSalt;
            var dbHash = jData[0].password;
            var sResult = hasher.verifyPw(oldPassword, dbSalt, dbHash);
            var jResult = JSON.parse(sResult);
            if(jResult.status == false){
                res.status(401);
                return res.send(JSON.stringify({response: "Username or Password is incorrect!"}));
            } else {
                var hashResult = JSON.parse(hasher.hashPw(newPassword));
                var pwSalt = hashResult.salt;
                var pwHashSalt = hashResult.data.pwHash;

                var sQuery = "UPDATE user SET password = ?, passwordSalt = ? WHERE userNo = ?";
                dbController.query(sQuery, [pwHashSalt, pwSalt, userNo], (err, sjData) => {
                    if(err){
                        console.log(err);
                        return res.send(err);
                    }
                    console.log(sjData);
                    return res.send(JSON.stringify({response: "Password successfully updated!"}));
                });
            }
        });
    }
});

router.post("/password-reset/:token", function(req, res, next){
    var token = req.sanitize(req.params.token);
    var newPassword = req.sanitize(req.body.newPassword);
    
    if(token !== "" && newPassword != ""){
        var data = jwt.decode(token, jwtSercret, 'HS256');
        var userNo = data.userNo;
        var sQuery = "SELECT tokenNo FROM token WHERE userNo = ?";
        dbController.query(sQuery, [userNo], (err, jData) => {
            if(err){
                console.log(err);
                res.status(500);
                return res.send(JSON.stringify({response: "Something went wrong"}));
            } else {
                console.log(jData);
                if(jData.length > 0){
                    var tokenNo = jData[0].tokenNo;
                    sQuery = "call AddUpdateToken(?, ?, ?)";
                    dbController.query(sQuery, [tokenNo, token, userNo], (err, jData) =>{
                        if(err){
                            console.log(err);
                            res.status(500);
                            return res.send(JSON.stringify({response: "Something went wrong"}));
                        } else {
                            var tokenStatus = jData[0][0].tokenStatus;
                            if(tokenStatus == -1){
                                res.status(405);
                                return res.send(JSON.stringify({response: "Token has expired or already been used!"}));
                            } else {
                                var hashResult = JSON.parse(hasher.hashPw(newPassword));
                                var pwSalt = hashResult.salt;
                                var pwHashSalt = hashResult.data.pwHash;

                                var sQuery = "UPDATE user SET password = ?, passwordSalt = ? WHERE userNo = ?";
                                dbController.query(sQuery, [pwHashSalt, pwSalt, userNo], (err, jData) => {
                                    if(err){
                                        console.log(err);
                                        res.status(500);
                                        return res.send(JSON.stringify({response: "Something went wrong!"}));
                                    } else {
                                        console.log(jData);
                                        res.status(200);
                                        return res.send(JSON.stringify({response: "Your password has been successfully updated!"}));
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.status(405);
                    return res.send(JSON.stringify({response: "Token has expired or already been used!"}));
                }
            }
        });
    } else {
        res.status(400);
        return res.send(JSON.stringify({response: "Bad request!"}));
    }
});

router.post("/send-password-reset-link", function(req, res, next){
    var email = req.sanitize(req.body.email);
    if(email !== ""){
        var sQuery = "SELECT userNo, userName FROM user WHERE email = ?";
        dbController.query(sQuery, [email], (err, jData) => {
            if(err){
                console.log(err);
                res.status(500);
                return res.send(JSON.stringify({response: "Something went wrong!"}));
            } else {
                console.log(jData);
                if(jData.length > 0){
                    var userNo = jData[0].userNo;
                    var userName = jData[0].userName;
                    var payload = {
                        userNo: userNo
                    };
                    try {
                        var token = jwt.encode(payload, jwtSercret, 'HS256');
                        var sp = "call AddUpdateToken(?, ?, ?)";
                        dbController.query(sp, [null, token, userNo], (err, jData) => {
                            if(err){
                                console.log(err);
                                res.status(500);
                                return res.send(JSON.stringify({response: "Something went wrong!"}));
                            } else {
                                var url = 'https://localhost:8443/password-reset/' + token;
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
                                    subject: '[WebShopINC] You have requestd password reset.',
                                    html: '<p> Dear, ' + '<b>' +userName + '</b>' +'<p>\r\n' +
                                    'Please click on the following link to reset your password: <a href="' + url +'" >Reset password</a>\r\n' +
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
                                        return res.send(JSON.stringify({response: "A new password reset link has been sent to your email!"}));
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
                    res.status(404);
                    return res.send(JSON.stringify({response: "A user with the specified email does not exist"}));
                }
            }
        });
    } else {
        res.status(400);
        return res.send(JSON.stringify({response: "Bad request!"}));
    }
});

// Access personal account
router.get("/", function(req,res,next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    if(req.session != null && req.session.isLoggedIn == true){

        var userNo = req.session.userName;
        var sQuery = "SELECT userNo, name, address, phone, email, userName, image from user WHERE userName = ?";

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

router.post("/comment", function(req, res, next){
    if(req.session == null){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    if(req.session != null && req.session.isLoggedIn == true){
        var inputParams= [];
        inputParams.push(req.body.comment, req.body.productNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var commentNo = null;
        var userNo = req.session.userNo;
        var sp = "call AddUpdateComment(?, ?, ?, ?)";
        dbController.query(sp, [commentNo, checkedParams[0], userNo, checkedParams[1]], (err, jData) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            console.log(jData);
            res.send(jData);
        });
    }
});

router.post("/comment/:commentNo", function(req, res, next){
    if(req.session == null && req.session.isLoggedIn === undefined){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    if(req.session != null && req.session.isLoggedIn == true){
        var inputParams= [];
        inputParams.push(req.params.commentNo, req.body.comment, req.body.productNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var commentNo = checkedParams[0];
        var userNo = req.session.userNo;
        if(commentNo != "" && userNo != ""){
            var sp = "call AddUpdateComment(?, ?, ?, ?)";
            dbController.query(sp, [commentNo, checkedParams[1], userNo, checkedParams[2]], (err, jData) => {
                if(err){
                    console.log(err);
                    res.status(500);
                    return res.send(JSON.stringify({response: "Something went wrong"}));
                }
                console.log(jData);
                res.status(200);
                return res.send(jData);
            });
        } else {
            res.status(400);
            return res.send(JSON.stringify({response: "Bad request"}));
        }
        
    }
});

router.get("/delete-comment/:commentNo/product/:productNo", function(req, res, next){
    if(req.session == null && req.session.isLoggedIn === undefined){
        res.status(403);
        res.send(JSON.stringify({response: "You need to be logged in!"}));
    }
    if(req.session != null && req.session.isLoggedIn == true){
        var inputParams= [];
        inputParams.push(req.params.commentNo, req.params.productNo);
        var checkedParams = parameterChecker.check(req, inputParams);

        var commentNo = checkedParams[0];
        var productNo = checkedParams[1];
        var userNo = req.session.userNo;
        if(commentNo != "" && userNo != "" && productNo != ""){
            var sQuery = "call DeleteComment(?, ? , ?)";
            dbController.query(sQuery, [commentNo, userNo, productNo], (err, jData) => {
                if(err){
                    console.log(jData);
                    res.status(500);
                    return res.send(JSON.stringify({response: "Something went wrong"}));
                }
                console.log(jData);
                res.status(200);
                return res.send(jData);
            });
        } else {
            res.status(400);
            return res.send(JSON.stringify({response: "Bad request"}));
        }
        
    }
});
module.exports = router;