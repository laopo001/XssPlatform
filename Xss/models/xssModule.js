module.exports = function (db) {
    return db.define("xssModule", {
        id: { type: 'serial', key: true },
        xssModuleName: String,
        xssModuleDescribe: String,
        xssQuerys: String,
        xssJsQuerys: String,
        isPublic: Number,
        createrID: Number,
        createTime: Date,
        xssModuleCode: String
    });
}