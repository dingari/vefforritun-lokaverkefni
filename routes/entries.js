'use strict';

var express = require('express');
var router = express.Router();
var entries = require('../lib/entries_db');
var auth = require('../routes/auth');
var xss = require('xss');

router.get('/my_entries', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {title: 'Listinn'};

	data.activeItem = req.query.id;

	createList(user.id, data, entries.getByUserIdDesc, function() {
		res.render('my_entries', data);
	});
});

router.post(['/my_entries', '/my_entries/memos', '/my_entries/lists'], 
		auth.ensureLoggedIn, function(req, res, next) {
	var title = req.body.title;
	var content = req.body.content;
	var id = req.body.id;
	var date = new Date();
	var owner_id = req.session.user.id || 3;
	var data = {};

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
		func = entries.getByUserIdDesc;
	}

	entries.saveMemo(id, title, content, owner_id, date, function(error, result) {
		if(error) {
			console.error(error);
		}

		// Ajax call that does not want the whole list back
		if(!!req.body.getList) {
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
			createList(owner_id, data, func, function() {
				res.render('my_entries', data);
			});
		}
	});
});

router.post('/new', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var type = req.query.type;
	var data = {};

	createList(user.id, data, entries.getByUserIdDesc, function() {
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
			createList(user.id, data, entries.getByUserIdDesc, function() {
				res.render('my_entries', data);
			});
		}
	});
});

router.get('/my_entries/memos', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {};
	data.path = '/memos';
	data.activeItem = req.query.id;

	createList(user.id, data, entries.getMemosByUserId, function() {
		res.render('my_entries', data);
	});
});

router.get('/my_entries/lists', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {};
	data.path = '/lists';
	data.activeItem = req.query.id;

	createList(user.id, data, entries.getListsByUserId, function() {
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

router.get('/', auth.ensureLoggedIn, function(req, res, next) {
	var data = {};

	// Birta yfirlit yfir nýjustu "public" færslurnar?

	/*
	posts.listPostsDesc(function(error, results) {
		if(error) {
			console.error(error);
		}

		if(results.length > 0) {
			data.posts = results;
		}

		data.user = req.session.user;
		data.sidebar = true;
		data.title = 'Póstarnir';

		res.render('posts', data);
	});
	*/
});

router.post('/', function(req, res, next) {
	var data ={};

	/*
	var title = xss(req.body.title);
	var content = xss(req.body.content);
	var date = new Date();
	var username = req.session.user;

	posts.savePost(title, content, date, username, function(error, status) {
		if(error) {
			console.error(error);
		}

		var success = true;

		if(error || !status) {
			success = false;
			data.message = 'Mistókst að vista færslu';
			data.title = title;
			data.content = content;

			res.render('posts', data);
		} else {
			res.redirect('/posts');
		}
	});
*/
});

router.post('/delete', function(req, res, next) {
	/*
	var id = req.query.id;

	posts.deletePost(id, function(error, status) {
		if(error) {
			console.error(error);
		}

		var success = false;
		var data = {};

		if(error || !status) {
			success = false;
			data.message = 'Mistókst að eyða færslu';
		} else {
			res.redirect('/posts');
		}
	});
*/
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

function createList(userId, data, func, callback) {
	func(userId, function(error, result) {
		if(error) {
			console.error(error);
		}

		data.list = result;
		if(!data.path)
			data.path = '';

		createFormData(data.activeItem, data, callback);
	});
}

module.exports = router;