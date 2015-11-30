'use strict';

var express = require('express');
var users = require('../lib/users_db');


module.exports.search = function(req, res, next) {
	var username = req.body.username;
	var user_id = req.session.user.id;

	console.log('search for', username);

	users.search(username, function(error, result) {
		if(error) {
			console.error(error);
		}

		console.log('search results', result, 'async', req.body.async);

		req.userlist = result;

		if(req.body.async === 'true') {
			res.json(result)
		} else {
			next();
		}
	});
};

module.exports.find = function(req, res, next) {
	var user_id = req.params.userid;

	users.findById(user_id, false, function(error, result) {
		if(error) {
			console.error(error);
		}

		req.data = {};
		req.data.user = result;

		next();
	});
};
