

var secrets = require('./configuration');
var secrets = require('./common');
var dockerImage = require('../docker/image.js');
var async = require('async');

var imageHosts = Object.keys(common.getClusterNodes()).map(function(ip){return 'tcp://' + ip + ':2375';});

module.exports = {
	removeImage : function(name, cb) {
		var tasks = [];
		imageHosts.forEach(function(imageHost){
			tasks.push(function(cb){
				dockerImage.remove(name, cb, imageHost);
			});
		});
		async.series(tasks, cb);
	}
};