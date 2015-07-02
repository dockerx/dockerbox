var secrets = require('../secrets.json');
var nano = require('nano')(secrets.db);
var _ = require('underscore');
var db = {
	qa: nano.db.use('orchestrator-qa'),
	image: nano.db.use('orchestrator-app')
};

module.exports = {
	create: function(dbname, name, data, cb) {
		db[dbname].insert(data, name, function(err, body, header) {
			if (err) {
				console.log('[db.insert] ', err.message);
			}
			cb && cb(err, body, header);
		});
	},
	read: function(dbname, cb, name) {
		//name is optonal, if name get the details of that QA or else get the details of all QA
		if (name) {
			db[dbname].get(name, {
				revs_info: true
			}, function(err, body) {
				if (err) {
					console.log('[db.read] ', err.message);
				}
				cb(err, body);
			});
		} else {
			db[dbname].view('minlist', 'minlist', function(err, body) {
				cb(err, body);
			});
		}
	},

	update: function(dbname, name, data, cb) {
		var that = this;
		this.read(dbname, function(err, body) {
			that.create(dbname, name, _.extend(body, data), cb);
		}, name);
	},

	delete: function(dbname, cb, name, rev) {
		db[dbname].destroy(name, rev, function(err, body) {
			cb && cb(err, body);
		});
	},

	viewRead : function(dbname, cb, viewname) {
		db[dbname].view('minlist', viewname || 'minlist', function(err, body) {
			cb(err, body);
		});
	}

}