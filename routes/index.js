'use strict';

var express = require('express');
var router = express.Router();
var entries = require('../lib/entries_db');
var auth = require('../routes/auth.js');

/* GET home page. */
router.get('/', auth.ensureLoggedIn, function(req, res, next) {
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
