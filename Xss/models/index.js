var users = require("./users");
var xssProject = require("./xssProject");
var xssModule = require("./xssModule");
var xss = require("./xss");
module.exports = function (models, db) {

    models.users = users(db);
    models.xssProject = xssProject(db);
    models.xssModule = xssModule(db);
    models.xss = xss(db);
};