"use strict";
var secrets = require('../secrets.json');
var express = require('express');
var router = express.Router();
var request = require('request');
var path = require('path');
var common = require('../services/common.js');

router.get(['/database', '/database/*'], function(req, res, next) {
    if(!common.isAdmin(req.session.user && req.session.user.email)) return next();
    req.pipe(request(path.join(secrets.db, req.url.replace(/^\/database/, '')))).pipe(res);
});

module.exports = router;