var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./services/db');
var portmanager = require('./services/portmanager');
var common = require('./services/common');
var http = require('http');
var secrets = require('./secrets.json');

http.globalAgent.maxSockets = Infinity;

require("dynamichaproxy").init();

db.read('qa', function(err, body){
    if(err) {
        console.log("DB read error", err);
        return;
    }
    body.rows.forEach(function(row){
        addUsedPorts(row.value.app);
        common.proxyRules('addHttpProxy', row.value.name, row.value.app);
    });
    function addUsedPorts(app) {
        portmanager.getPort(app.http_forward_port);
        portmanager.getPort(app.terminal_forward_port);
        app.dependency = app.dependency || [];
        app.dependency.forEach(function(d){
            addUsedPorts(d);
        });
    }
});

var routes = require('./routes/index');

var app = express();

//Redirect all non-www to www except subdomains
app.get('/*', function (req, res, next) {
  if (secrets.web.domain && !req.headers.host.match(new RegEx(secrets.web.domain))) {
    res.redirect(secrets.web.domain + req.url);
  } else {
    next();     
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(common.unlessMW(/^\/database/, bodyParser.json()));
app.use(common.unlessMW(/^\/database/, bodyParser.urlencoded()));
app.use(cookieParser());
app.use(session({
    secret: 'myntra dockerbox', 
    name : 'dockebox.sid',
    resave: true, 
    saveUninitialized: false,
    cookie: { 
        maxAge: 2 * 60 * 60000 // 2 hours
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

routes(app); // attach all routes


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
