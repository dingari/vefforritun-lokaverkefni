'use strict';

var express = require('express');
var router = express.Router();
var entries = require('../lib/entries_db');
var auth = require('../routes/auth');
var xss = require('xss');
var share = require('../middleware/share');

router.get('/my_entries', auth.ensureLoggedIn, renderList);

router.post(['/my_entries', '/my_entries/memos', '/my_entries/lists'], 
		auth.ensureLoggedIn, function(req, res, next) {
	var title = req.body.title;
	var content = req.body.content;
	var id = req.body.id;
	var date = new Date();
	var owner_id = req.session.user.id || 3;
	var data = {};
	var page = 1;

	console.log('islist', req.body.isList);

	if(req.body.isList) {
		console.log(content);

		content = JSON.parse(content);
	} else {
		content = {};
		content.content = req.body.content;
	}

	console.log('saving', content)

	var func;
	if(/memos/.test(req.originalUrl)) {
		func = entries.getMemosByUserId;
	} else if(/lists/.test(req.originalUrl)) {
		func = entries.getListsByUserId;
	} else {
		func = entries.findAllByUserId;
	}

	entries.saveMemo(id, title, content, owner_id, date, function(error, result) {
		if(error) {
			console.error(error);
		}

		// Ajax call that does not want the whole list back
		if(req.body.getList === 'false') {
			res.json({
				id: result,
				title: title,
				content: content,
				date: date.getDate() + '/' + date.getMonth() + '/' + 
					(''+date.getFullYear()).substr(2,3) + ' - ' + 
					date.toTimeString().substr(0,8)
			});
		} else {
			data.activeItem = result;
			createList(owner_id, data, page, func, function() {
				res.render('my_entries', data);
			});
		}
	});
});

router.post('/new', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var type = req.query.type;
	var data = {};

	createList(user.id, data, entries.findAllByUserId, function() {
		res.render('my_entries', data);
	});

});

router.post('/delete', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var id = req.body.id
	var data = {};

	console.log('deleting', id);

	entries.delete(id, function(error, result) {

		// Ajax call not waning the whole list back
		if(!!req.body.getList) {
			res.json({id: result});
		} else {
			createList(user.id, data, entries.findAllByUserId, function() {
				res.render('my_entries', data);
			});
		}
	});
});

router.get('/my_entries/memos', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {};
	var page = 1;
	data.path = '/memos';
	data.activeItem = req.query.id;

	createList(user.id, data, page, entries.getMemosByUserId, function() {
		res.render('my_entries', data);
	});
});

router.get('/my_entries/lists', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {};
	var page = 1;
	data.path = '/lists';
	data.activeItem = req.query.id;

	createList(user.id, data, page, entries.getListsByUserId, function() {
		res.render('my_entries', data);
	});
});

router.get('/entries', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {};

	entries.findAllPublicDesc(function(error, result) {
		if(error) {
			console.error(error);
		}

		res.render('all_entries')
	})
});

router.get('/user/:userid', function(req, res, next) {
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

router.post('/share', [auth.ensureLoggedIn, share], renderList);

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

	data.activeItem = req.query.id || req.body.id;
	data.userlist = req.userlist;

	entries.getUsersSharedWith(data.activeItem, function(error, result) {
		if(error) {
			console.error(error);
		}

		if(result.length > 0) {
			data.sharelist = result;
		}

		createList(user.id, data, page, entries.findAllByUserId, function() {
			res.render('my_entries', data);
		});
	});
}

module.exports = router;
module.exports.renderList = renderList;