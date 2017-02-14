module.exports = function (db) {
    return db.define("xssProject", {
        id: { type: 'serial', key: true },
        xssProjectName: String,
        xssProjectDescribe: String,
        createTime: Date,
        cout: Number,
        xssModuleIDs: String,
        createrID: Number,
        uuid: String
    });
}