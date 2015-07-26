"use strict";
var secrets = require('../secrets.json');
var express = require('express');
var router = express.Router();
var request = require('request');
var common = require('../services/common.js');

router.get('/_utils/*', function(req, res, next) {
    if(!common.isAdmin(req.session.user && req.session.user.email)) return next();
    req.pipe(request(getUrl(req.url))).pipe(res);
});

function getUrl(url) {
    //Path.join is not working with request.pipe. So this hack for removing the extra / in the secrets.db
    return secrets.db.replace(/\/$/, '') + url;
}

module.exports = router;