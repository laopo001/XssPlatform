var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
const fs = require('fs');
var db = require('../db');
var moment=require('moment');
var log = require('../log.js').logger
var co = require("co");
var uuid = require('node-uuid');
//function co(generator) {
//    return function (fn) {
//        var gen = generator();
//        function next(err, result) {
//            if (err) {
//                return fn(err);
//            }
//            var step = gen.next(result);
//            if (!step.done) {
//                step.value(next);
//            } else {
//                fn(null, step.value);
//            }
//        }
//        next();
//    }
//}
router.use(function (req, res, next) {
    if (req.session.user != null) {
        next();
    }
    console.log('%s %s %s', req.method, req.url, req.path);
});






router.post('/Create_XSS_project', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssProject.exists({ xssProjectName: req.body.xssProjectName }, function (err, exists) {
        if (exists) {
            res.json({ status: 0, messages: "项目名称重复" });
        } else {
            req.models.xssProject.create({
                xssProjectName: req.body.xssProjectName,
                xssProjectDescribe: req.body.xssProjectDescribe,
                createTime: new Date(),
                cout: 0,
                xssModuleIDs: req.body.xssModuleIDs,
                createrID: req.session.user.id,
                uuid: uuid.v1()
            }, function (err, rows) {
                if (err) { log.error(err); res.json({ status: 0, messages: "添加失败" }); return; }
                res.json({ status: 1, messages: "添加成功", data: rows });
            })
        }
    })
});
router.post('/Update_XSS_project', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssProject.find({ id: req.body.id }, function (err, rows) {
            if (req.session.user.id == rows[0].createrID) {
                rows[0].xssProjectName = req.body.xssProjectName,
                rows[0].xssProjectDescribe = req.body.xssProjectDescribe;
                rows[0].xssModuleIDs = req.body.xssModuleIDs;
                rows[0].save(function (err) {
                    // err.msg = "under-age";
                    res.json({ status: 1, messages: "修改成功" });
                });
            } else {
                res.json({ status: 0, messages: "不是本人没有权限" });
            }
    })
});
router.get('/GET_XSS_project', function (req, res, next) {
    req.models.xssProject.find({
        createrID: req.session.user.id
    }, function (err, rows) {
        //res.setHeader('Access-Control-Allow-Origin', '*');
        if (err) { log.error(err); res.json({ status: 0, messages: "查询失败", data: [] }); return; }
        res.json({ status: 1, messages: "查询成功", data: rows });
    })
});
router.post('/GET_one_XSS_project', function (req, res, next) {
    req.models.xssProject.find({ id: req.body.id }, function (err, rows) {
        //res.setHeader('Access-Control-Allow-Origin', '*');
        if (err) { log.error(err); res.json({ status: 0, messages: "查询失败", data: [] }); return; }
        res.json({ status: 1, messages: "查询成功", data: rows });
        
    })
});

router.post('/DELETE_XSS_project', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssProject.find({ id: req.body.id }).remove(function (err) {
        if (err) { log.error(err); res.json({ status: 0, messages: "删除失败" }); return; }
        res.json({ status: 1, messages: "删除成功"});
    })
});

router.post('/Create_XSS_module', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssModule.exists({ xssModuleName: req.body.xssModuleName }, function (err, exists) {
        if (exists) {
            res.json({ status: 0, messages: "模块名称重复" });
        } else {
            req.models.xssModule.create({
                xssModuleName: req.body.xssModuleName,
                xssModuleDescribe: req.body.xssModuleDescribe,
                createTime: new Date(),
                xssQuerys: req.body.xssQuerys,
                xssJsQuerys: req.body.xssJsQuerys,
                createrID: req.session.user.id,
                isPublic: req.body.isPublic,
                xssModuleCode: req.body.xssModuleCode
            }, function (err, rows) {
                if (err) { log.error(err); res.json({ status: 0, messages: "添加失败" }); return; }
                res.json({ status: 1, messages: "添加成功", data: rows });
            })
        }
    })
});
router.post('/Get_XSS_module', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssModule.find({
                    createrID: req.session.user.id
           }, function (err, rows) {
               if (err) { log.error(err); res.json({ status: 0, messages: "查询失败" }); return; }
               res.json({ status: 1, messages: "查询成功", data: rows });
          })
});
router.post('/Get_XSS_public_module', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssModule.find({
        isPublic: 1
    }, function (err, rows) {
        if (err) { log.error(err); res.json({ status: 0, messages: "查询失败" }); return; }
        rows=rows.filter(function (x) {
            if (x.createrID == req.session.user.id) {
                return false;
            } else {
                return true;
            }
        })
        res.json({ status: 1, messages: "查询成功", data: rows });
    })
});
router.post('/DELETE_XSS_module', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssModule.find({
        id: req.body.id
    }).remove(function (err) {
        if (err) { log.error(err); res.json({ status: 0, messages: "删除失败" }); return; }
        res.json({ status: 1, messages: "删除成功" });
    })
});

router.post('/Update_XSS_module', function (req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    req.models.xssModule.find({
        id: req.body.id
    }, function (err, rows) {

        if (req.session.user.id == rows[0].createrID) {
            rows[0].xssModuleName=req.body.xssModuleName,
            rows[0].xssModuleDescribe = req.body.xssModuleDescribe;
            rows[0].xssQuerys = req.body.xssQuerys;
            rows[0].xssJsQuerys = req.body.xssJsQuerys;
            rows[0].isPublic = req.body.isPublic;
            rows[0].xssModuleCode = req.body.xssModuleCode;
            rows[0].save(function (err) {
                // err.msg = "under-age";
                res.json({ status: 1, messages: "修改成功" });
            });
        } else {
            res.json({ status: 0, messages: "不是本人没有权限" });
        }
     })
});


router.post('/Get_one_project_xss', function (req, res, next) {
    var id = req.body.id;
    var index=parseInt(req.body.index)-1;
    var size = parseInt(req.body.size);
    co(function* () {
        
        var xssProject = yield (function (id) {
            return function (callback) {
                req.models.xssProject.find({
                    id: id
                }, callback)
            }
        })(id)

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
        req.models.xss.find({
            xssProjectID: req.body.id
        }, { offset: index * size }, size, ["createTime", "Z" ], function (err, rows) {
            req.models.xss.count({ xssProjectID: req.body.id }, function (err, count) {
                //res.setHeader('Access-Control-Allow-Origin', '*');
                res.json({ data: { items: rows, count: count, columns: xssProjectQuerys}, status: 1, messages: "查询成功" });
            });
        })
    }).catch(function (error) {
        res.json({ data: { items: [], count: 0, columns: [] }, status: 1, messages: "查询错误" });
        console.error(error.stack);
    });


    //db(function(err, connection) {
    //    connection.query( "select * from xss where xssProjectID = ? limit ?,?",[req.body.id,index*size,size], function(err, rows1) {
    //        if(err){log.error(err)}
    //             connection.query( "select count(*) as count from xss where xssProjectID = ?",[req.body.id], function(err, rows2) {
    //                 if(err){log.error(err)}
    //                 connection.release();
    //                 res.setHeader('Access-Control-Allow-Origin','*');
    //                 res.json({items:rows1,count:rows2[0].count});
    //            });
    //    });
    //});
});


//var url = path.normalize(__dirname + "/../public/1234.js");

//var js = fs.readFileSync(url, "utf8");



module.exports = router;

