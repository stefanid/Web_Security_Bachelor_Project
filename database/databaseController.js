const dbController = {};
const dbConnection = require(__dirname + "/databaseconnection.js");

dbController.query = (sQuery, params, fCallback) => {
    var jResult = {};
    global.gPool.getConnection(function(err, connection){
        if(err){
            process.exit();
            return fCallback(true, err);
        } else {
            if(params.length > 0){
                connection.query(sQuery, params, (err, jData) => {
                    if(err){
                        connection.release();
                        return fCallback(true, err);
                    }
                    connection.release();
                    return fCallback(false, jData);
                });
            } else {
                connection.query(sQuery, (err, jData) => {
                    if(err){
                        connection.release();
                        return fCallback(true, err);
                    }
                    connection.release();
                    return fCallback(false, jData);
                });
            }
        }
    });
}
module.exports = dbController;