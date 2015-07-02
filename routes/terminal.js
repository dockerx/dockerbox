"use strict";

var express = require('express');
var router = express.Router();
var db = require('../services/db');
var request = require('request');
var _ = require('underscore');


router.get('/terminal/:qaname/:appname', function(req, res) {
    db.read('qa', function(err, body) {
        req.pipe(request('http://dockerlocalhost:' + getTerminalPort(body.app, req.params.appname))).pipe(res);
    }, req.params.qaname);

});

function getTerminalPort(app, name) {
    if(app.name === name) return app.terminal_forward_port;
    var port;
    app.dependency = app.dependency || [];
    app.dependency.some(function(d){
        port = getTerminalPort(d, name);
        return port || false;
    });
    return port;
}

module.exports = router;