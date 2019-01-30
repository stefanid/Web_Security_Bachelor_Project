var crypto = require("crypto");
var hasher = {};

var generateSalt = function(){
    return crypto.randomBytes(16)
        .toString('hex');
};
var generateHash = function(password, salt){
    var iterations = 10000;
    var hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256');
    var value = hash.toString('hex');
    return{
        pwHash: value
    }
};

hasher.hashPw = (password) => {
    var salt = generateSalt();
    var pwData = generateHash(password, salt);
    var jResult = JSON.stringify({salt: salt, data: pwData})
    return jResult;
}

hasher.verifyPw = (password, dbSalt, dbHash) => {
    var iterations = 10000;
    var jResult = {};
    var _hash = crypto.pbkdf2Sync(password, dbSalt, iterations, 64, 'sha256').toString("hex");
    if(dbHash == _hash){
        jResult = JSON.stringify({status: true});
        return jResult;
    } else{
        jResult = JSON.stringify({status: false});
        return jResult;
    }

}

module.exports = hasher;