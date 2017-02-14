module.exports = function (db) {
    return db.define("xss", {
        id: { type: 'serial', key: true },
        IP_address: String,
        createTime: Date,
        xssProjectID: Number,
        info:String
    });
}