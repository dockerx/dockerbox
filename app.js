var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    db = require('./services/db'),
    common = require('./services/common'),
    http = require('http'),
    secrets = require('./secrets.json'),
    dynamichaproxy = require("dynamichaproxy");

app.set('port', process.env.PORT || 3000);
http.globalAgent.maxSockets = Infinity;

if(secrets.useElb) {
    require('elb').start(secrets.elbPort || 80, {
        defaultTarget : 'localhost:' + app.get('port'),
        errorMessage : 'Seems like there is no application running in your server.'
    });
} else {
    dynamichaproxy.init({
        defaultBackend : 'localhost:' + app.get('port'),
        hapAdminPort : 9100
    });
}

db.read('qa', function(err, body){
    if(err) {
        console.log("DB read error", err);
        return;
    }
    body.rows.forEach(function(row){
        common.proxyRules('add', row.value.name, row.value.app);
    });
    dynamichaproxy.restart();
});

var routes = require('./routes/index');

var app = express();

//Redirect all non-www to www except subdomains
app.get('/*', function (req, res, next) {
  if (secrets.web.domain && !req.headers.host.match(new RegExp('^' + secrets.web.domain))) {
    res.redirect((secrets.http || 'http') + '://' + secrets.web.domain + req.url);
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
