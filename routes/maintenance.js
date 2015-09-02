var express = require('express');
var router = express.Router();
var common = require('../services/common');
var secrets = require('../secrets.json');


router.get('/*', function(req, res, next) {
	if(!secrets.underMaintenance) return next();
	if(common.isAdmin(req.session.user && req.session.user.email)) {
		next();
	} else {
		res.render('maintenance', {common : common.renderData(req)});
	}
});

module.exports = router;