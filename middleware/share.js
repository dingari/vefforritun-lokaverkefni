'use strict';

var express = require('express');
var entries = require('../lib/entries_db');

module.exports = function(req, res, next) {
	var loggedin_id = req.session.user.id;
	var user_id = req.body.user_id;
	var id = req.body.id;
	var data = {};

	entries.setUserShareStatus(id, user_id, true, function(error, result) {
		if(error) {
			console.error(error);
		}

		next();
	});
};