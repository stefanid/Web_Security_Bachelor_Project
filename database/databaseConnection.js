const _mysql = require("mysql");
const fs = require("fs");
const appsettings = JSON.parse(fs.readFileSync("./appsettings.json", "utf8"));
global.gPool = null;


/***********************StefDB***********************/

const host = appsettings.connectionStringStef.db.host;
const user = appsettings.connectionStringStef.db.user;
const password = appsettings.connectionStringStef.db.password;
const database = appsettings.connectionStringStef.db.database;

/****************************************************/

/***********************VasiDB***********************/
/*
const host = appsettings.connectionStringVasi.db.host;
const user = appsettings.connectionStringVasi.db.user;
const password = appsettings.connectionStringVasi.db.password;
const database = appsettings.connectionStringVasi.db.database;
/*
/****************************************************/

const _pool = _mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database
});

global.gPool = _pool;