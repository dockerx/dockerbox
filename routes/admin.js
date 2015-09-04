"use strict";
var express = require('express'),
	router = express.Router(),
	request = require('request'),
	secrets = require('../secrets.json'),
	common = require('../services/common.js'),
	path = require('path'),
	fs = require('fs');

router.get('/admin/configuration', function(req, res, next){
	if(notAdmin(req)) return next();
	res.render('configuration', {
		common : common.renderData(req),
		config : secrets
	});
});

router.post('/admin/configuration', function(req, res, next){
	if(notAdmin(req)) return next();
	var config;
	try {
		config = JSON.parse(req.body.config);
	} catch(e) {
		return res.json({
				status : 'error',
				err : 'JSON Parse error'
			});
	}
	fs.writeFileSync(path.join(__dirname, '../secrets.json'), req.body.config);
	secrets = config;
	res.redirect('/admin/configuration');
});

router.all(['/admin/database', '/admin/database/*'], function(req, res, next) {
    if(notAdmin(req)) return next();
    req.pipe(request(getUrl(req.url))).pipe(res);

    function getUrl(url) {
	    //Path.join is not working with request.pipe. So this hack for removing the extra / in the secrets.db
	    return common.config.db.replace(/\/$/, '') + url.replace(/^\/admin\/database/, '');
	}
});

function notAdmin(req) {
	return (!common.isAdmin(req.session.user && req.session.user.email));
}

module.exports = router;