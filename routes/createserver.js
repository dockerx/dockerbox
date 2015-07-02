"use strict";

var express = require('express');
var router = express.Router();
var db = require('../services/db');
var common = require('../services/common');
var docker = require('../docker');
var streamStore = require('../services/stream');
var portManager = require('../services/portmanager');
var restartHap = true;
var async = require('async');

/* GET home page. */
router.get('/createserver', function(req, res, next) {
	async.parallel([common.getServerlist, common.getImagelist], function(err, result){
		if(err) return next();
		var servers = result[0],
		templates = servers.rows.map(function(d){return d.value}).filter(function(d){return d.publish}),
		images = result[1],
		imageMap = {};
		
		images.rows.map(function(i){return i.value;}).forEach(function(i){
			imageMap[i.name] = i.port;
		});
		
		res.render('createserver', {
			title: '',
			templates: templates,
			images: imageMap,
			common : common.renderData(req)
		});
	});
});

router.post('/createserver', function(req, res) {
	var app = req.body.app,
	name = req.body.name,
	stream = streamStore.create();
	req.body.created_by = req.session.user;
	req.body.created_on = Date();
	req.body.streamId = stream.id;
	assignPort(app);
	db.create('qa', name, req.body, function(err) {
		if (err) {
			res.json({
				status : 'error',
				err : err
			});
			return;
		}	
		docker.compose.start(name, app, stream, function(exitCode){
			var updateData = { // Updateing the app also, since the app object got the running host properties - http_forward_host, terminal_forward_host
				compose_status : exitCode,
				app : app
			};
			if(exitCode === 0) common.proxyRules('addHttpProxy', name, app, restartHap);
			common.completeAction('qa', stream, exitCode, updateData, name);
		});
		res.json({
			status : 'success',
			redirect : '/discover/server/'+name
		});	
	});
});

function assignPort(app) {
	app.http_forward_port = portManager.getPort();
	app.terminal_forward_port = portManager.getPort();
	app.dependency = app.dependency || [];
	app.dependency.forEach(function(d){
		assignPort(d);
	});
}

module.exports = router;