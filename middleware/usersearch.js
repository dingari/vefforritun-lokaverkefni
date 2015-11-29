'use strict';

var express = require('express');
var users = require('../lib/users_db');


module.exports = function(req, res, next) {
	var username = req.body.username;
	var user_id = req.session.user.id;

	console.log('search for', username);

	users.search(username, function(error, result) {
		if(error) {
			console.error(error);
		}

		console.log('search results', result);

		req.userlist = result;

		next();
	});
};
