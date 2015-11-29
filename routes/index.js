'use strict';

var express = require('express');
var router = express.Router();
var entries = require('../lib/entries_db');
var auth = require('../routes/auth.js');
var ensureLoggedIn = require('../middleware/loggedin');

/* GET home page. */
router.get('/', ensureLoggedIn, function(req, res, next) {
	var data = {title: 'Lokaverkefni'};

	res.redirect('/entries/my_entries');
});

router.get('/restricted', function(req, res, next) {
	var data = {};

	data.message = 'Þú verður að skrá þig inn til að sjá þessa síðu!';
	data.title = 'Lokaverkefni';
	data.sidebar = true;

	res.render('index', data);
});

module.exports = router;
