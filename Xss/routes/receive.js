var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
const fs = require('fs');
var db = require('../db');
var moment = require('moment');
var log = require('../log.js').logger
var co = require("co");

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
        var xssProject = yield (function (id) {
            return function (callback) {
                req.models.xss.create({
                    xssProjectID: xssProject[0].id,
                    createTime: moment().format('YYYY-MM-DD,HH:mm:ss'),
                    IP_address: req.connection.remoteAddress,
                    info: JSON.stringify(query)
                }, callback)
            }
        })(id)
        
        res.send('');
    }).catch(function (error) {
        console.error(error.stack);
    });

    /*  db(function (err,connection) {
          connection.query('select id,IP_address from xss where xssID = ?and xssProjectID=?',[req.body.xssID,req.body.xssProjectID], function(err, rows) {
              if(err){log.error(err)}
              if(rows.length>=1){
                  for(var i in rows){
  
                      req.body.IP_address=rows[i].IP_address+ (req.headers['x-forwarded-for']||'undefined'+'|')+ req.connection.remoteAddress+'|'+ moment().format('YYYY-MM-DD,HH:mm:ss') +';';
                      req.body.recentTime=new Date();
  
                      var xss=['xssID','cookie','flash_v','href','top_href','navigator','opener','fingerprint2','IP_address','recentTime','xssProjectID','info'];
                      var temp={};
                      xss.forEach(function (x) {
                          temp[x] = req.body[x]
                      });
  
                      var sql=update_obj('xss',temp,`WHERE id=${rows[i].id}`);
                      connection.query( sql, function(err, rows2) {
                          if(err){log.error(err)}
                          res.setHeader('Access-Control-Allow-Origin','*');
                          res.send('');
                      });
                  }
  
              } else {
                  request({
                      url: `http://lab.cnns.net:${req.body.port}/labs_cnns_2016/task/xss_${req.body.taskID}/update`,
                      method: 'POST',
                      json: { status: 'success' }
                  }, function (error, response, body) {
                      if (!error && response.statusCode == 200) {
                          log.info('taskID:'+req.body.taskID+body.message);
                      } else {
                          log.error("error:" + JSON.stringify(error));
                      }
                  })
                  req.body.IP_address= (req.headers['x-forwarded-for'] ||'undefined')+'|'+ req.connection.remoteAddress+'|'+ moment().format('YYYY-MM-DD,HH:mm:ss') +';';
                  req.body.createTime=new Date();
                  req.body.recentTime=req.body.createTime;
                  var xss=['xssID','cookie','flash_v','href','top_href','navigator','opener','fingerprint2','IP_address','createTime','recentTime','xssProjectID','info'];
                  var temp={};
                  xss.forEach(function (x) {
                      temp[x]=req.body[x]
                  })
  
                  var sql=insert_obj('xss',temp);
                  connection.query( sql, function(err, rows3) {
                      if(err){log.error(err)}
                      res.setHeader('Access-Control-Allow-Origin','*');
                      res.send('');
  
                  });
              }
              connection.release();
          });
      })*/
});
var url = path.normalize(__dirname + "/My.txt");

var js = fs.readFileSync(url, "utf8");

router.get('/GET_XSS_JS/:id', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var xssProjectID = req.params.id;


    //req.models.xssProject.find({
    //    uuid: xssProjectID
    //}, function (err, rows) {
    //    if (err) { log.error(err); res.json({ status: 0, messages: "查询失败" }); return; }
    //    var xssModuleIDs = JSON.stringify(rows[0].xssModuleIDs);
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
            res.send(XSS_JS);
            }).catch(function (error) { 
            res.send("error"); 
            console.error(error.stack);
            log.error(error.stack);

        });

    //})


    //var XSS_JS = js.replace(/\$taskID/, req.query.taskID).replace(/\$port/, req.query.port);
    //res.setHeader("content-type", "text/javascript; charset=UTF-8");
    //res.send(XSS_JS);
});
module.exports = router;