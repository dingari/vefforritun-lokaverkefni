'use strict';

var express = require('express');
var router = express.Router();
var users = require('../lib/users_db');
var entries = require('../routes/entries');
var auth = require('../routes/auth');
var userops = require('../middleware/usersearch');
var ensureLoggedIn = require('../middleware/loggedin');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.post('/search', [ensureLoggedIn, userops.search], entries.renderList);

module.exports = router;
