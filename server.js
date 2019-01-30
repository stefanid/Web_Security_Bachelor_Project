/***********************Packages***********************/
const express = require("express");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const expressSanitizer = require("express-sanitizer");
const fs = require("fs");
const Recaptcha = require("express-recaptcha").Recaptcha;
const https = require("https");

const appSettings = require(__dirname + "/appsettings.json");

const site_key = appSettings.appKeys.site_key;
const secret_key = appSettings.appKeys.secret_key;

const recaptcha = new Recaptcha(site_key, secret_key);


const app = express();
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session({
    secret: appSettings.sessionSecret,
    rolling: true,
    resave: true,
    saveUninitialized: true,
   
}));
app.use(cookieParser(appSettings.sessionSecret));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.urlencoded({"extended":true}));
app.use("/public", express.static("public"));
app.use(expressSanitizer());


/***********************Modules***********************/
var accountRoute = require(__dirname + "/routes/account.js");
var productRoute = require(__dirname + "/routes/product.js");
var adminRoute = require(__dirname + "/routes/admin.js");
var orderRoute = require(__dirname + "/routes/order.js");
const key = fs.readFileSync("../websec/certificate/WebShop.key", "utf8");
const cert = fs.readFileSync("../websec/certificate/WebShop.crt", "utf8");
const ca = fs.readFileSync("../websec/certificate/ca.crt", "utf8");

const options = {
    key: key,
    cert: cert,
    ca: ca
};
/****************************************************/

/***********************Views***********************/
app.get("/", recaptcha.middleware.render ,(req, res) => {
    var sTopHtml = fs.readFileSync( __dirname + '/public/components/top.html', 'utf8' );
    var sMainHtml = fs.readFileSync( __dirname + '/views/index.html', 'utf8' );
    var sBottomHtml = fs.readFileSync( __dirname + '/public/components/bottom.html', 'utf8' );

    //replace placeholders
    sTopHtml = sTopHtml.replace('{{title}}','Web shop home page');
    sTopHtml = sTopHtml.replace('{{active-home}}',' active');
    sTopHtml = sTopHtml.replace(/{{active-.*}}/g ,'');
    sBottomHtml = sBottomHtml.replace('{{customScript}}',  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js"></script>' +
        '<script src="../public/javascript/general.js"></script>' +
        '<script src="../public/javascript/login.js"></script>' +
        '<script src="../public/javascript/logout.js"></script>' +
        '<script src="../public/javascript/register.js"></script>' +
        '<script src="../public/javascript/homePage.js"></script>' +
        '<script src="https://www.google.com/recaptcha/api.js"></script>');
    return res.send( sTopHtml + sMainHtml + sBottomHtml );
  
    res.end();
});

app.get("/shop", (req, res) => {
    console.log(req.session);
    var sTopHtml = fs.readFileSync( __dirname + '/public/components/top.html', 'utf8' );
    var sMainHtml = fs.readFileSync( __dirname + '/views/shop.html', 'utf8' );
    var sBottomHtml = fs.readFileSync( __dirname + '/public/components/bottom.html', 'utf8' );

    
    if(req.session != null && req.session.isLoggedIn == true){
        sBottomHtml = sBottomHtml.replace('{{customScript}}',  '<script src="../public/javascript/general.js"></script>' +
            '<script src="../public/javascript/shop.js"></script>' +
        '<script src="../public/javascript/logout.js"></script>' + '<script src="../public/javascript/profile.js"></script>' +
        '<script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js">');
    }

    //replace placeholders

    sTopHtml = sTopHtml.replace('{{title}}','Shop');
    sTopHtml = sTopHtml.replace('{{active-shop}}',' active');
    sTopHtml = sTopHtml.replace(/{{active-.*}}/g ,'');
    sBottomHtml = sBottomHtml.replace('{{customScript}}',  '<script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js"></script>' +
        '<script src="../public/javascript/general.js"></script>' +
        '<script src="../public/javascript/shop.js"></script><script src="../public/javascript/logout.js"></script>' +
        '<script src="../public/javascript/login.js"></script><script src="../public/javascript/register.js"></script>');
    res.send( sTopHtml + sMainHtml + sBottomHtml );
});

app.get("/profile", (req, res) => {
    console.log(req.session);
    var sTopHtml = fs.readFileSync( __dirname + '/public/components/top.html', 'utf8' );
    var sMainHtml;
    var sBottomHtml = fs.readFileSync( __dirname + '/public/components/bottom.html', 'utf8' );
    sTopHtml = sTopHtml.replace('{{title}}','Profile');
    sTopHtml = sTopHtml.replace('{{active-profile}}',' active');
    sTopHtml = sTopHtml.replace(/{{active-.*}}/g ,'');
    sBottomHtml = sBottomHtml.replace('{{customScript}}',  '<script src="../public/javascript/general.js"></script>' +
        '<script src="../public/javascript/profile.js"></script>'+
    '<script src="../public/javascript/logout.js"></script>');
    if(req.session != null && req.session.isLoggedIn == true){
        var role = req.session.isInRole;
        switch (role) {
            case "Basic User":
                sMainHtml = fs.readFileSync( __dirname + '/views/basicUser.html', 'utf8' );
                sMainHtml = sMainHtml.replace('{{user}}', req.session.name);
                return  res.send( sTopHtml + sMainHtml + sBottomHtml );
            break;
            case "Admin":
                    sMainHtml = fs.readFileSync( __dirname + '/views/admin.html', 'utf8' );
                    sMainHtml = sMainHtml.replace('{{user}}', req.session.name);                  
                    return res.send(sTopHtml + sMainHtml + sBottomHtml);
            break;
            case "Support":
                    sMainHtml = fs.readFileSync( __dirname + '/views/support.html', 'utf8' );
                sMainHtml = sMainHtml.replace('{{user}}', req.session.name);
                return res.send( sTopHtml + sMainHtml + sBottomHtml );
            break;         
        }
     } else {
        
        res.status(403);
        return res.redirect("/");
        //console.log(req.session);
    }
});


app.get("/staff", (req, res) => {
    console.log(req.session);
    if(req.session != null && req.session.isLoggedIn == true && req.session.isInRole == "Admin"){
        var sTopHtml = fs.readFileSync( __dirname + '/public/components/top.html', 'utf8' );
        var sStaffHtml = fs.readFileSync( __dirname + '/views/staff-overview.html', 'utf8' );
        var sBottomHtml = fs.readFileSync( __dirname + '/public/components/bottom.html', 'utf8' );

        sTopHtml = sTopHtml.replace("{{title}}", "Staff members");

        sBottomHtml = sBottomHtml.replace('{{customScript}}',  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js"></script>' +
        '<script src="../public/javascript/logout.js"></script>' + 
        '<script src="../public/javascript/general.js"></script>' +
        '<script src="../public/javascript/shop.js"></script>' +
        '<script src="../public/javascript/homePage.js"></script>' +
        '<script src="../public/javascript/staff-overview.js"></script>' +
        '<script src="https://www.google.com/recaptcha/api.js"></script>')

        res.status(200);
        return res.send(sTopHtml + sStaffHtml + sBottomHtml);
    } else {
        res.status(403);
        return res.redirect("/");
    }
})
app.get("/selected-product/:UID", (req, res) => {
    var selectedProductID = req.sanitize(req.params.UID);
    var sTopHtml = fs.readFileSync( __dirname + '/public/components/top.html', 'utf8' );
    var sMainHtml = fs.readFileSync( __dirname + '/views/singleProduct.html', 'utf8' );
    var sBottomHtml = fs.readFileSync( __dirname + '/public/components/bottom.html', 'utf8' );


    sTopHtml = sTopHtml.replace('{{title}}','Shop');
    sTopHtml = sTopHtml.replace('{{active-shop}}',' active');
    sTopHtml = sTopHtml.replace(/{{active-.*}}/g ,'');
    sBottomHtml = sBottomHtml.replace('{{customScript}}',  '<script src="../public/javascript/general.js"></script>' +
        '<script src="../public/javascript/shop.js"></script>' +
    '<script src="../public/javascript/login.js"></script><script src="../public/javascript/logout.js"></script>' +
    '<script src="../public/javascript/register.js"></script>' + '<script src="../public/javascript/singleProduct.js"></script>');
    res.send( sTopHtml + sMainHtml + sBottomHtml );
    res.end();

});

app.get("/resend-activataion-token", (req, res) => {
    var sResendHtml = fs.readFileSync( __dirname + '/views/resendActivationLink.html', 'utf8' );

    res.send(sResendHtml);
});

app.get("/password-reset", (req, res) => {
    var sPasswordRest = fs.readFileSync( __dirname + '/views/sendPasswordReset.html', 'utf8' );

    res.send(sPasswordRest);
})

app.get("/password-reset/:token", (req, res) => {
    var sPasswordReset = fs.readFileSync( __dirname + '/views/PasswordReset.html', 'utf8' );

    res.send(sPasswordReset);
});



/***********************Routes***********************/
app.use("/user", recaptcha.middleware.verify, accountRoute);
app.use("/product", productRoute);
app.use("/admin", adminRoute);
app.use("/order", orderRoute);


/***********************Server***********************/
// Global console log formatting
global.gLog = (status, message) => {

    switch(status) {
        case 'ok':
            console.log(chalk.green(message));
            break;

        case 'err':
            console.log(chalk.red(message));
            break;

        case 'ex':
            console.log(chalk.magenta(message));
            break;

        case 'info':
            console.log(message);
            break;

    }
};


// UNIX socket awaiting connections on given port

var httpsServer = https.createServer(options, app);
httpsServer.listen(8443, err => {
    if(err) {
        gLog('err', 'Cannot use that port');
        return false;
    }
    gLog('ok', 'Server is listening to port 8443');
});