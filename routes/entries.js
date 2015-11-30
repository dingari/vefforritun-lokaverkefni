'use strict';

var express = require('express');
var router = express.Router();
var entries = require('../lib/entries_db');
var xss = require('xss');
var share = require('../middleware/share');
var ensureLoggedIn = require('../middleware/loggedin');
var ops = require('../middleware/entryoperations');

router.get('/my_entries', ensureLoggedIn, renderList);

router.post('/new', [ensureLoggedIn, ops.new], renderList);

router.post('/delete', [ensureLoggedIn, ops.delete], renderList);

router.post(['/my_entries', '/my_entries/memos', '/my_entries/lists'], 
		[ensureLoggedIn, ops.save], renderList);

router.get('/my_entries/memos', [ensureLoggedIn, ops.memoList], renderList);

router.get('/my_entries/lists', [ensureLoggedIn, ops.listList], renderList);

router.post('/share', [ensureLoggedIn, ops.share], renderList);

router.get('/share', [ensureLoggedIn, ops.getShareList], function(req, res, next) {
	console.log(req.sharelist);
	res.json(req.sharelist);
});

router.get('/shared/:userid', ensureLoggedIn, function(req, res, next) {
	var user_id = parseInt(req.params.userid);
	var data = {};

	entries.findAllSharedWith(user_id, 1, function(error, result) {
		if(error) {
			console.error(error);
		}

		data.list = result;

		res.render('shared_list', data);
	})
});

router.get('/user/:userid', ensureLoggedIn, function(req, res, next) {
	var user_id = parseInt(req.params.userid);
	var page = 1;
	var data = {}

	console.log('session user', req.session.user.id);
	console.log('user', user_id)

	if(req.session.user.id === user_id) {
		entries.findAllByUserId(user_id, page, true, function(error, result) {
			if(error) {
				console.error(error);
			} else {
				data.list = result;

				console.log(data.list);

				res.render('by_user', data);
			}
		});
	} else {
		entries.findAllByUserIdSharedWith(user_id, req.session.user.id , 
				page, function(error, result) {
			if(error) {
				console.error(error);
			}

			console.log(result)
			data.list = result;

			res.render('by_user', data);
		});
	}

});

router.get('/:entryid', ensureLoggedIn, function(req, res, next) {
	var id = req.params.entryid;

	var data = {};
	createFormData(id, data, function() {
		res.render('entry_static', data);
	});
});

function createFormData(id, data, callback) {
	data.formContent = {};
	data.formTitle = '';

	entries.findOneById(id, function(error, result) {
		if(error) {
			console.error(error);
		} else if(result) {
			data.formTitle = result.title;
			data.formContent = result.content;

			console.log(result.content)
		}

		callback();
	});
}

function createList(userId, data, page, func, callback) {
	console.log(func)
	func(userId, page, true, function(error, result) {
		if(error) {
			console.error(error);
		}

		data.list = result;
		if(!data.path)
			data.path = '';

		console.log(data)

		createFormData(data.activeItem, data, callback);
	});
}

function renderList(req, res, next) {
	var user = req.session.user;
	var data = {title: 'Listinn'};
	var page = 1;
	var listFunc = req.listFunc || entries.findAllByUserId;

	data.activeItem = req.query.id || req.body.id || req.activeItem;
	data.userlist = req.userlist;
	data.path = req.thepath;

	console.log('active', data.activeItem)
	entries.getUsersSharedWith(data.activeItem, function(error, result) {
		if(error) {
			console.error(error);

			if(req.body.async) {
				res.send(500)
			}
		}

		if(result.length > 0) {
			data.sharelist = result;
		}

		if(req.body.async === 'true') {
			res.json(data.sharelist);
		} else {
			createList(user.id, data, page, listFunc, function() {
				res.render('my_entries', data);
			});
		}
	});
}

module.exports = router;
module.exports.renderList = renderList;