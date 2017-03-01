var express = require('express');
var router = express.Router();
var log = require('../log.js').logger



router.post('/login', function (req, res) {
    req.models.users.find({ userName: req.body.userName }, function (err, rows) {
        if (rows.length > 0 && rows[0].password == req.body.password) {
            if (!req.session.user) {

                req.session.user = { userName: rows[0].userName, email: rows[0].email, id: rows[0].id, isDeveloper: rows[0].isDeveloper};
            }
            
            res.json({ status: 1, messages: "登录成功", data: { userName: rows[0].userName, email: rows[0].email, isDeveloper: rows[0].isDeveloper } });
        } else {
            res.json({ status: 0, messages: "登录失败" });
        }
    });
});
router.get('/checkLogin', function (req, res) {
    if (req.session.user != null) {
        res.json({ status: 1, messages: "在线", data: { userName: req.session.user.userName, email: req.session.user.email, isDeveloper: req.session.user.isDeveloper }});
    } else {
        res.json({ status: 0, messages: "离线" });
    }
});
router.get('/exitLogin', function (req, res) {
    if (req.session) {
        req.session.destroy();
        res.json({ status: 1, messages: "退出成功" });
    } else {
        res.json({ status: 0, messages: "退出失败" });
    }
});
router.post('/register', function (req, res) {

    req.models.users.exists({ userName: req.body.userName }, function (err, exists) {
        if (exists) {
            res.json({ status: 0, messages: "该用户名已经被注册了" });
        } else {
            req.models.users.create({ userName: req.body.userName, password: req.body.password, email: req.body.email, isDeveloper: req.body.isDeveloper == null ? 0 : req.body.isDeveloper }, function (err, result) {
                if (err) {
                    log.error(err);
                    res.json({ status: 0, messages: "注册失败" });
                } else {
                    res.json({ status: 1, messages: "注册成功" });
                }
            });
        }
    })
});
module.exports = router;