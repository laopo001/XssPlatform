var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 50,
    host            : '192.168.1.105',
    user            : 'ldh',
    password        : '123456',
    database        : 'test'
});
var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        if(err){console.log("数据库连接失败："+err);}
        callback(err, connection);
    });
};

module.exports = getConnection;