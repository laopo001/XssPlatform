var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io')();
var routes = require('./routes/index');
var users = require('./routes/users');
var xss = require('./routes/xss');
var allSocket={};
var receive = require('./routes/receive')(io,allSocket);
var app = express();
var orm = require('orm');
var session = require('express-session');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var log = require('./log');
log.use(app);

app.use(orm.express("mysql://ldh:921025Ldh@103.200.97.33/test", {
    define: function (db, models, next) {

       var setmodels=require("./models/")
       setmodels(models, db);
     /*   models.users = db.define("users", {
            id: { type: 'serial', key: true } ,
            userName: { type: "text", size: 100 },
            password: { type: "text", size: 100 },
            email: { type: "text", size: 100 },
        });
        models.xssProject = db.define("xssProject", {
            id: { type: 'serial', key: true },
            xssProjectName: String,
            xssProjectDescribe: String,
            createTime: Date,
            cout: Number
        });*/
        next();
    }
}));
app.use(session({
    secret: 'qwertyuiop',
    name: 'XappID',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: { maxAge: 120 * 60000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true
}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/xss', xss);
app.use('/receive', receive);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.io = io;
io.on('connection', function (socket) {
    console.log('socket连接成功');
    socket.on('join', function(data) {
        console.log(data.userName+'  join');
        allSocket[data.userName]=socket;
    });
    socket.on('disconnect', function() {
        console.log('断开连接');
    });
});


module.exports = app;

